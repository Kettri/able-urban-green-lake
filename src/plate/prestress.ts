/** Plane-stress pre-buckling field for an edge patch load.
 * Stage 1 of the buckling solve. Not a code resistance.
 * Compression is positive in the stresses returned to Kg.
 */

import { bandAdd, bandedCholesky, bandedSolve } from "./banded.ts"

export type PatchEdge = "x0" | "x1" | "y0" | "y1"

export type PatchLoad = {
  edge: PatchEdge
  /** Centre of the loaded length, mm, measured along the edge. */
  atMm: number
  lengthMm: number
  /** Force normal to the edge, N. Positive pushes into the plate. */
  forceN: number
}

export type Prestress = {
  ok: boolean
  reason: string
  sigX: Float64Array
  sigY: Float64Array
  tau: Float64Array
  equilibrium: number
  /** Resultant of the nodal forces actually applied, N, compression positive. */
  appliedN: number
  /** Global components of the applied nodal force. +x to the right, +y up. */
  appliedFx: number
  appliedFy: number
  /** Support forces on the plate, from ∫ Bᵀσ on the restrained DOFs. */
  reactionFx: number
  reactionFy: number
  /** Moment of applied plus reaction forces about the plate centre, N·mm. */
  momentNmm: number
  /** |applied + reaction| / max(|applied|, |force|). */
  forceImbalance: number
  note: string
}

function shape(xi: number, eta: number) {
  const corners = [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
  ]
  return corners.map((p) => ({
    n: 0.25 * (1 + p.x * xi) * (1 + p.y * eta),
    dxi: 0.25 * p.x * (1 + p.y * eta),
    deta: 0.25 * p.y * (1 + p.x * xi),
  }))
}

function fail(reason: string): Prestress {
  return {
    ok: false, reason, sigX: new Float64Array(), sigY: new Float64Array(), tau: new Float64Array(),
    equilibrium: 0, appliedN: 0, appliedFx: 0, appliedFy: 0, reactionFx: 0, reactionFy: 0, momentNmm: 0, forceImbalance: 0, note: "",
  }
}

export function patchInterval(patch: PatchLoad, edgeLength: number): { start: number; end: number } | string {
  if (!(patch.lengthMm > 0)) return "Loaded length must be positive."
  if (!Number.isFinite(patch.forceN) || patch.forceN === 0) return "Patch force is zero."
  if (patch.lengthMm > edgeLength + 1e-6) return "Loaded length is longer than the edge."
  const start = patch.atMm - patch.lengthMm / 2
  const end = patch.atMm + patch.lengthMm / 2
  if (start < -1e-6 || end > edgeLength + 1e-6) return "The patch does not lie on the edge."
  return { start: Math.max(0, start), end: Math.min(edgeLength, end) }
}

export function solvePatchPrestress(input: {
  xs: number[]
  ys: number[]
  tMm: number
  eMpa: number
  nu: number
  patch: PatchLoad
}): Prestress {
  const { xs, ys, tMm, eMpa, nu, patch } = input
  const nx = xs.length - 1
  const ny = ys.length - 1
  if (nx < 1 || ny < 1) return fail("The mesh has no elements.")
  const a = xs[nx]! - xs[0]!
  const b = ys[ny]! - ys[0]!
  const edgeLength = patch.edge === "x0" || patch.edge === "x1" ? b : a
  const interval = patchInterval(patch, edgeLength)
  if (typeof interval === "string") return fail(interval)
  const nodesX = nx + 1
  const nodes = nodesX * (ny + 1)
  const ndof = nodes * 2
  const bw = 2 * nodesX + 8
  const along = patch.edge === "y0" || patch.edge === "y1" ? xs : ys
  const covers = (p: number, q: number) => {
    const lo = Math.min(p, q)
    const hi = Math.max(p, q)
    return lo >= interval.start - 1e-4 && hi <= interval.end + 1e-4 && hi - lo > 1e-8
  }
  const free = new Int32Array(ndof).fill(-1)
  const held = new Uint8Array(ndof)
  const hold = (dof: number) => { held[dof] = 1 }
  if (patch.edge === "y1" || patch.edge === "y0") {
    const iy = patch.edge === "y1" ? 0 : ny
    for (let ix = 0; ix < nodesX; ix++) hold((iy * nodesX + ix) * 2 + 1)
    hold((iy * nodesX) * 2)
  } else {
    const ix = patch.edge === "x1" ? 0 : nx
    for (let iy = 0; iy <= ny; iy++) hold((iy * nodesX + ix) * 2)
    hold(1)
  }
  const keep: number[] = []
  for (let dof = 0; dof < ndof; dof++) {
    if (!held[dof]) {
      free[dof] = keep.length
      keep.push(dof)
    }
  }
  const n = keep.length
  if (n < 1) return fail("The in-plane restraints removed every degree of freedom.")
  const K = new Float64Array(n * bw)
  const fac = eMpa / (1 - nu * nu)
  const C = [fac, fac * nu, 0, fac * nu, fac, 0, 0, 0, fac * (1 - nu) / 2]
  const gp = [-1 / Math.sqrt(3), 1 / Math.sqrt(3)]
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const ae = xs[ix + 1]! - xs[ix]!
      const be = ys[iy + 1]! - ys[iy]!
      const ids = [iy * nodesX + ix, iy * nodesX + ix + 1, (iy + 1) * nodesX + ix + 1, (iy + 1) * nodesX + ix]
      for (const xi of gp) for (const eta of gp) {
        const sh = shape(xi, eta)
        const detJ = (ae / 2) * (be / 2)
        const dNdx = sh.map((p) => p.dxi * (2 / ae))
        const dNdy = sh.map((p) => p.deta * (2 / be))
        const B = [new Float64Array(8), new Float64Array(8), new Float64Array(8)]
        for (let i = 0; i < 4; i++) {
          B[0]![i * 2] = dNdx[i]!
          B[1]![i * 2 + 1] = dNdy[i]!
          B[2]![i * 2] = dNdy[i]!
          B[2]![i * 2 + 1] = dNdx[i]!
        }
        for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) {
          let s = 0
          for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) s += B[p]![a]! * C[p * 3 + q]! * B[q]![b]!
          const ga = ids[Math.floor(a / 2)]! * 2 + (a % 2)
          const gb = ids[Math.floor(b / 2)]! * 2 + (b % 2)
          const fi = free[ga]!
          const fj = free[gb]!
          if (fi < 0 || fj < 0 || fi < fj) continue
          bandAdd(K, bw, fi, fj, s * detJ * tMm)
        }
      }
    }
  }
  const load = new Float64Array(n)
  const applied = new Float64Array(ndof)
  let appliedFx = 0
  let appliedFy = 0
  const q = patch.forceN / patch.lengthMm
  const addEdge = (n0: number, n1: number, length: number, direction: 0 | 1, sign: number) => {
    const share = (sign * q * length) / 2
    for (const node of [n0, n1]) {
      const dof = node * 2 + direction
      const f = free[dof]!
      if (f >= 0) {
        load[f] += share
        applied[dof] += share
        if (direction === 0) appliedFx += share
        else appliedFy += share
      }
    }
  }
  if (patch.edge === "y1" || patch.edge === "y0") {
    const iy = patch.edge === "y1" ? ny : 0
    const sign = patch.edge === "y1" ? -1 : 1
    for (let ix = 0; ix < nx; ix++) {
      if (!covers(along[ix]!, along[ix + 1]!)) continue
      addEdge(iy * nodesX + ix, iy * nodesX + ix + 1, xs[ix + 1]! - xs[ix]!, 1, sign)
    }
  } else {
    const ix = patch.edge === "x1" ? nx : 0
    const sign = patch.edge === "x1" ? -1 : 1
    for (let iy = 0; iy < ny; iy++) {
      if (!covers(along[iy]!, along[iy + 1]!)) continue
      addEdge(iy * nodesX + ix, (iy + 1) * nodesX + ix, ys[iy + 1]! - ys[iy]!, 0, sign)
    }
  }
  const factor = bandedCholesky(K, n, bw)
  if (!factor) return fail("The in-plane stiffness is singular for this patch and these restraints.")
  let appliedSigned = 0
  for (let i = 0; i < n; i++) appliedSigned += load[i]!
  const loadSign = patch.edge === "y1" || patch.edge === "x1" ? -1 : 1
  const appliedN = appliedSigned / loadSign
  const appliedError = patch.forceN !== 0 ? Math.abs(appliedN - patch.forceN) / Math.abs(patch.forceN) : 0
  if (!(Math.abs(appliedN) > 0) || appliedError > 0.005) {
    return fail(`The patch force was not applied to the mesh. Requested ${patch.forceN.toFixed(2)} N, nodal resultant ${appliedN.toFixed(2)} N.`)
  }
  const solved = bandedSolve(factor, n, bw, load)
  const u = new Float64Array(ndof)
  for (let i = 0; i < n; i++) u[keep[i]!] = solved[i]!
  const count = nx * ny
  const sigX = new Float64Array(count)
  const sigY = new Float64Array(count)
  const tau = new Float64Array(count)
  let equilibrium = 0
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const ae = xs[ix + 1]! - xs[ix]!
      const be = ys[iy + 1]! - ys[iy]!
      const ids = [iy * nodesX + ix, iy * nodesX + ix + 1, (iy + 1) * nodesX + ix + 1, (iy + 1) * nodesX + ix]
      const sh = shape(0, 0)
      const dNdx = sh.map((p) => p.dxi * (2 / ae))
      const dNdy = sh.map((p) => p.deta * (2 / be))
      let ex = 0
      let ey = 0
      let gxy = 0
      for (let i = 0; i < 4; i++) {
        const uu = u[ids[i]! * 2]!
        const vv = u[ids[i]! * 2 + 1]!
        ex += dNdx[i]! * uu
        ey += dNdy[i]! * vv
        gxy += dNdy[i]! * uu + dNdx[i]! * vv
      }
      const sx = fac * (ex + nu * ey)
      const sy = fac * (nu * ex + ey)
      const txy = fac * (1 - nu) / 2 * gxy
      const slot = iy * nx + ix
      sigX[slot] = -sx
      sigY[slot] = -sy
      tau[slot] = txy
      if (iy === Math.floor(ny / 2)) equilibrium += sigY[slot]! * tMm * ae
    }
  }
  const normal = patch.edge === "x0" || patch.edge === "x1"
  let flow = 0
  if (normal) {
    const ix = Math.floor(nx / 2)
    for (let iy = 0; iy < ny; iy++) flow += sigX[iy * nx + ix]! * tMm * (ys[iy + 1]! - ys[iy]!)
  } else flow = equilibrium
  const imbalance = patch.forceN !== 0 ? Math.abs(flow - patch.forceN) / Math.abs(patch.forceN) : 0
  const fInt = new Float64Array(ndof)
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const ae = xs[ix + 1]! - xs[ix]!
      const be = ys[iy + 1]! - ys[iy]!
      const ids = [iy * nodesX + ix, iy * nodesX + ix + 1, (iy + 1) * nodesX + ix + 1, (iy + 1) * nodesX + ix]
      for (const xi of gp) for (const eta of gp) {
        const sh = shape(xi, eta)
        const detJ = (ae / 2) * (be / 2)
        const dNdx = sh.map((p) => p.dxi * (2 / ae))
        const dNdy = sh.map((p) => p.deta * (2 / be))
        let ex = 0
        let ey = 0
        let gxy = 0
        for (let i = 0; i < 4; i++) {
          ex += dNdx[i]! * u[ids[i]! * 2]!
          ey += dNdy[i]! * u[ids[i]! * 2 + 1]!
          gxy += dNdy[i]! * u[ids[i]! * 2]! + dNdx[i]! * u[ids[i]! * 2 + 1]!
        }
        const sx = fac * (ex + nu * ey)
        const sy = fac * (nu * ex + ey)
        const txy = fac * (1 - nu) / 2 * gxy
        const B0 = [dNdx[0]!, 0, dNdx[1]!, 0, dNdx[2]!, 0, dNdx[3]!, 0]
        const B1 = [0, dNdy[0]!, 0, dNdy[1]!, 0, dNdy[2]!, 0, dNdy[3]!]
        const B2 = [dNdy[0]!, dNdx[0]!, dNdy[1]!, dNdx[1]!, dNdy[2]!, dNdx[2]!, dNdy[3]!, dNdx[3]!]
        const weight = detJ * tMm
        for (let a = 0; a < 8; a++) {
          const dof = ids[Math.floor(a / 2)]! * 2 + (a % 2)
          fInt[dof] += (B0[a]! * sx + B1[a]! * sy + B2[a]! * txy) * weight
        }
      }
    }
  }
  let reactionFx = 0
  let reactionFy = 0
  let moment = 0
  for (let iy = 0; iy <= ny; iy++) {
    for (let ix = 0; ix < nodesX; ix++) {
      const node = iy * nodesX + ix
      const dx = node * 2
      const dy = dx + 1
      const fx = held[dx] ? fInt[dx]! : applied[dx]!
      const fy = held[dy] ? fInt[dy]! : applied[dy]!
      if (held[dx]) reactionFx += fInt[dx]!
      if (held[dy]) reactionFy += fInt[dy]!
      moment += (xs[ix]! - a / 2) * fy - (ys[iy]! - b / 2) * fx
    }
  }
  const forceScale = Math.max(Math.abs(appliedFx), Math.abs(appliedFy), Math.abs(patch.forceN), 1)
  const forceImbalance = Math.hypot(appliedFx + reactionFx, appliedFy + reactionFy) / forceScale
  if (forceImbalance > 0.005) {
    return fail(`Pre-buckling equilibrium failed. ΣFx = ${(appliedFx + reactionFx).toFixed(2)} N, ΣFy = ${(appliedFy + reactionFy).toFixed(2)} N, ΣMz = ${moment.toExponential(3)} N·mm. The eigenvalue is not trusted.`)
  }
  const note = [
    "TWO-STAGE BUCKLING. Stage 1 is a linear plane-stress solve for the patch.",
    "The patch is a uniform normal traction over the loaded length, not a point force and not a rectangular stress block.",
    "Positive force pushes into the plate. The opposite edge is restrained in the normal direction. One extra restraint stops in-plane rigid motion. Side edges are free in-plane.",
    "Stage 2 builds Kg from the recovered element stresses, added to any σx, σy and τxy you entered. λ multiplies that whole field.",
    "Out-of-plane eccentricity is not in this model.",
    `Requested patch force ${patch.forceN.toFixed(2)} N. Applied nodal force ${appliedN.toFixed(2)} N. Difference ${(appliedError * 100).toFixed(4)}%.`,
    `Equilibrium check: the integrated compressive force on a mid-span cut is ${flow.toFixed(2)} N against the applied ${patch.forceN.toFixed(2)} N.`,
    `Applied Fx ${appliedFx.toFixed(2)} N. Applied Fy ${appliedFy.toFixed(2)} N. Reaction Fx ${reactionFx.toFixed(2)} N. Reaction Fy ${reactionFy.toFixed(2)} N. Force imbalance ${(forceImbalance * 100).toFixed(4)}%. Moment about the plate centre ${moment.toExponential(3)} N·mm.`,
    `ΣFx ${(appliedFx + reactionFx).toExponential(3)} N. ΣFy ${(appliedFy + reactionFy).toExponential(3)} N. ΣMz ${moment.toExponential(3)} N·mm.`,
  ].join(" ")
  return {
    ok: true, reason: "", sigX, sigY, tau, equilibrium: imbalance, appliedN, note,
    appliedFx, appliedFy, reactionFx, reactionFy, momentNmm: moment, forceImbalance,
  }
}
