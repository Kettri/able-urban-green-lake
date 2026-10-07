/**
 * Rectangular Mindlin plate, bilinear quad, reduced shear integration.
 * Banded K and Kg. K φ = λ Kg φ. Eigenvectors feed the mode viewer.
 * Not a copy of the Navier coefficient.
 */

import { bandAdd, bandedCholesky, bandedMatvec } from "./banded.ts"
import type { EdgeKind, Edges } from "./classical.ts"
import { bucklingModes } from "./eigen.ts"
import { modeMac } from "./mac.ts"
import { patchInterval, solvePatchPrestress, type PatchLoad, type Prestress } from "./prestress.ts"
import { engineLine } from "./version.ts"

export type { PatchLoad } from "./prestress.ts"

export type FemStiffener = {
  id: string
  axis: "x" | "y"
  atMm: number
  eiNmm2: number
  gjNmm2: number
  areaMm2: number
  rigid: boolean
}

export type FemPatch = { x0: number; x1: number; y0: number; y1: number; sigmaYMpa: number }
export type TauSample = { yMm: number; tauMpa: number }

export type FemInput = {
  aMm: number
  bMm: number
  tMm: number
  eMpa: number
  nu: number
  sigma1Mpa: number
  psi: number
  tauMpa: number
  tauSamples?: TauSample[]
  sigmaYMpa?: number
  patches?: FemPatch[]
  /** Edge traction used in the plane-stress pre-buckling solve. Not a code resistance. */
  patchLoad?: PatchLoad
  nx: number
  ny: number
  edges: Edges
  krNPerRadPerMm: number
  stiffeners?: FemStiffener[]
  modes?: number
  shapes?: boolean
}

export type FemMode = {
  lambda: number
  sigma1CrMpa: number | null
  /** Uniform σy at the critical multiplier. Not a patch force. */
  sigmaYCrMpa: number | null
  tauCrMpa: number | null
  patchCrN: number | null
  w: number[]
}

export type FemMeshLine = { x1: number; y1: number; x2: number; y2: number }

export type FemResult = {
  ok: boolean
  reason: string
  elements: number
  nodes: number
  dof: number
  freeDof: number
  nx: number
  ny: number
  xs: number[]
  ys: number[]
  elementAspect: number
  aspectWarning: string
  modes: FemMode[]
  iterations: number
  residual: number
  /** ||Kφ − λ Kg φ|| / (||Kφ|| + |λ| ||Kg φ||). Reported beside the K-norm residual. */
  residualBalanced: number
  /** Lowest |λ| pairs from the subspace, positive and negative, with both residuals. */
  spectrum: { lambda: number; residual: number; residualBalanced: number }[]
  /** Target for ||Kφ − λ Kg φ|| / ||Kφ||. A larger residual is reported, not hidden. */
  solverTolerance: number
  seconds: number
  mesh: FemMeshLine[]
  formulation: string
  note: string
  prestressNote: string
  stiffenerNotes: string[]
  minAspect: number
  maxElementMm: number
  minElementMm: number
  symmetryNote: string
  /** Recovered patch membrane stress at element centres, compression positive. Null when there is no patch. */
  membrane: { sigX: number[]; sigY: number[]; tau: number[] } | null
}

export type MeshRow = {
  nx: number
  ny: number
  elements: number
  dof: number
  freeDof: number
  lambda: number | null
  criticalMpa: number | null
  changePct: number | null
  /** MAC of mode 1 against the previous mesh. Null on the first row. */
  mac: number | null
  wavesX: number | null
  wavesY: number | null
  seconds: number
  status: string
}

export type MeshStudy = {
  rows: MeshRow[]
  converged: boolean
  tolerancePct: number
  note: string
}

export const MESH_STUDY_SIZES = [10, 20, 40, 80] as const
export const CONVERGENCE_TOLERANCE = 0.01
const MAX_ELEMENTS = 80
const RIGID_FACTOR = 1e4
const G3 = 1 / Math.sqrt(3)

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

function denseCholesky(A: Float64Array, n: number): Float64Array | null {
  const L = new Float64Array(n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = A[i * n + j]!
      for (let k = 0; k < j; k++) sum -= L[i * n + k]! * L[j * n + k]!
      if (i === j) {
        if (!(sum > 0)) return null
        L[i * n + i] = Math.sqrt(sum)
      } else L[i * n + j] = sum / L[j * n + j]!
    }
  }
  return L
}

function projectEigen(Kp: number[][], Gp: number[][]): { values: number[]; vectors: number[][] } | null {
  const n = Kp.length
  const kFlat = new Float64Array(n * n)
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) kFlat[i * n + j] = Kp[i]![j]!
  const L = denseCholesky(kFlat, n)
  if (!L) return null
  const W = Array.from({ length: n }, () => new Float64Array(n))
  for (let col = 0; col < n; col++) {
    const y = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      let sum = Gp[i]![col]!
      for (let k = 0; k < i; k++) sum -= L[i * n + k]! * y[k]!
      y[i] = sum / L[i * n + i]!
    }
    for (let i = 0; i < n; i++) W[i]![col] = y[i]!
  }
  const inv = Array.from({ length: n }, () => new Float64Array(n))
  for (let col = 0; col < n; col++) {
    const y = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      let sum = i === col ? 1 : 0
      for (let k = 0; k < i; k++) sum -= L[i * n + k]! * y[k]!
      y[i] = sum / L[i * n + i]!
    }
    for (let row = 0; row < n; row++) inv[row]![col] = y[row]!
  }
  const C = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) sum += W[i]![k]! * inv[j]![k]!
      C[i]![j] = sum
    }
  }
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const s = 0.5 * (C[i]![j]! + C[j]![i]!)
    C[i]![j] = s
    C[j]![i] = s
  }
  const solved = jacobiSym(C)
  const qVecs = solved.vectors.map((z) => {
    const q = Array(n).fill(0)
    for (let i = n - 1; i >= 0; i--) {
      let sum = z[i]!
      for (let k = i + 1; k < n; k++) sum -= L[k * n + i]! * q[k]!
      q[i] = sum / L[i * n + i]!
    }
    return q
  })
  return { values: solved.values, vectors: qVecs }
}

function jacobiSym(matrix: number[][]): { values: number[]; vectors: number[][] } {
  const n = matrix.length
  const A = matrix.map((row) => row.slice())
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) as number))
  for (let sweep = 0; sweep < 80; sweep++) {
    let p = 0
    let q = 1
    let max = 0
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const v = Math.abs(A[i]![j]!)
        if (v > max) { max = v; p = i; q = j }
      }
    }
    if (max < 1e-14) break
    const app = A[p]![p]!
    const aqq = A[q]![q]!
    const apq = A[p]![q]!
    let t: number
    if (Math.abs(app - aqq) <= 1e-18 * (Math.abs(app) + Math.abs(aqq) + 1)) t = apq >= 0 ? 1 : -1
    else {
      const tau = (aqq - app) / (2 * apq)
      t = Math.sign(tau) / (Math.abs(tau) + Math.hypot(1, tau))
    }
    const c = 1 / Math.hypot(1, t)
    const s = t * c
    A[p]![p] = app - t * apq
    A[q]![q] = aqq + t * apq
    A[p]![q] = 0
    A[q]![p] = 0
    for (let k = 0; k < n; k++) {
      const vip = V[k]![p]!
      const viq = V[k]![q]!
      V[k]![p] = c * vip - s * viq
      V[k]![q] = s * vip + c * viq
      if (k === p || k === q) continue
      const aik = A[k]![p]!
      const akq = A[k]![q]!
      const nextP = c * aik - s * akq
      const nextQ = s * aik + c * akq
      A[k]![p] = nextP
      A[p]![k] = nextP
      A[k]![q] = nextQ
      A[q]![k] = nextQ
    }
  }
  const values = A.map((row, i) => row[i]!)
  const vectors = values.map((_, col) => V.map((row) => row[col]!))
  return { values, vectors }
}

function restrain(kind: EdgeKind, mask: { w: boolean; bx: boolean; by: boolean }) {
  if (kind === "free") return
  mask.w = true
  if (kind === "fixed") { mask.bx = true; mask.by = true }
}

function stations(length: number, divisions: number, cuts: number[]): number[] {
  const raw = [0]
  for (let i = 1; i < divisions; i++) raw.push((length * i) / divisions)
  raw.push(length)
  for (const cut of cuts) {
    if (cut > length * 1e-5 && cut < length * (1 - 1e-5)) raw.push(cut)
  }
  raw.sort((p, q) => p - q)
  const out: number[] = []
  for (const value of raw) {
    if (out.length === 0 || value - out[out.length - 1]! > Math.max(1e-4, length * 1e-6)) out.push(value)
  }
  return out
}

function tauAt(y: number, input: FemInput): number {
  const samples = input.tauSamples
  if (samples && samples.length >= 2) {
    const ordered = [...samples].sort((p, q) => p.yMm - q.yMm)
    if (y <= ordered[0]!.yMm) return ordered[0]!.tauMpa
    const last = ordered[ordered.length - 1]!
    if (y >= last.yMm) return last.tauMpa
    for (let i = 1; i < ordered.length; i++) {
      const right = ordered[i]!
      const left = ordered[i - 1]!
      if (y <= right.yMm) {
        const span = right.yMm - left.yMm
        const t = span === 0 ? 0 : (y - left.yMm) / span
        return left.tauMpa + t * (right.tauMpa - left.tauMpa)
      }
    }
  }
  return input.tauMpa
}

function sigmaYAt(x: number, y: number, input: FemInput): number {
  let stress = input.sigmaYMpa ?? 0
  for (const patch of input.patches ?? []) {
    const x0 = Math.min(patch.x0, patch.x1)
    const x1 = Math.max(patch.x0, patch.x1)
    const y0 = Math.min(patch.y0, patch.y1)
    const y1 = Math.max(patch.y0, patch.y1)
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) stress += patch.sigmaYMpa
  }
  return stress
}

export function countHalfWaves(w: number[], xs: number[], ys: number[], axis: "x" | "y"): number {
  if (w.length !== xs.length * ys.length || xs.length < 2 || ys.length < 2) return 0
  const fractions = [0.5, 0.25, 0.75]
  let bestCount = 0
  let bestPeak = -1
  for (const fraction of fractions) {
    const line: number[] = []
    if (axis === "x") {
      const iy = Math.min(ys.length - 1, Math.max(0, Math.round((ys.length - 1) * fraction)))
      for (let ix = 0; ix < xs.length; ix++) line.push(w[iy * xs.length + ix] ?? 0)
    } else {
      const ix = Math.min(xs.length - 1, Math.max(0, Math.round((xs.length - 1) * fraction)))
      for (let iy = 0; iy < ys.length; iy++) line.push(w[iy * xs.length + ix] ?? 0)
    }
    let peak = 0
    for (const value of line) peak = Math.max(peak, Math.abs(value))
    if (peak <= bestPeak) continue
    const floor = peak * 1e-4
    let changes = 0
    let prev = 0
    let have = false
    for (const value of line) {
      if (Math.abs(value) <= floor) continue
      if (have && prev * value < 0) changes += 1
      prev = value
      have = true
    }
    bestPeak = peak
    bestCount = have ? changes + 1 : 0
  }
  return bestCount
}

export function meshLines(aMm: number, bMm: number, nx: number, ny: number): FemMeshLine[] {
  return previewMesh(aMm, bMm, nx, ny)
}

export function previewMesh(aMm: number, bMm: number, nx: number, ny: number, xCuts: number[] = [], yCuts: number[] = []): FemMeshLine[] {
  if (!(aMm > 0 && bMm > 0) || nx < 2 || ny < 2 || nx > MAX_ELEMENTS || ny > MAX_ELEMENTS) return []
  return meshFromCoords(stations(aMm, nx, xCuts), stations(bMm, ny, yCuts))
}

export function meshFromCoords(xs: number[], ys: number[]): FemMeshLine[] {
  const lines: FemMeshLine[] = []
  const y0 = ys[0] ?? 0
  const y1 = ys[ys.length - 1] ?? 0
  const x0 = xs[0] ?? 0
  const x1 = xs[xs.length - 1] ?? 0
  for (const x of xs) lines.push({ x1: x, y1: y0, x2: x, y2: y1 })
  for (const y of ys) lines.push({ x1: x0, y1: y, x2: x1, y2: y })
  return lines
}

function blank(reason: string): FemResult {
  return {
    ok: false, reason, elements: 0, nodes: 0, dof: 0, freeDof: 0, nx: 0, ny: 0,
    xs: [], ys: [], elementAspect: 0, aspectWarning: "", modes: [],
    iterations: 0, residual: 0, residualBalanced: 0, spectrum: [], solverTolerance: 1e-8, seconds: 0, mesh: [], formulation: "", note: "", prestressNote: "", stiffenerNotes: [],
    minAspect: 0, maxElementMm: 0, minElementMm: 0, symmetryNote: "", membrane: null,
  }
}

function nearestIndex(coords: number[], value: number): number {
  let best = 0
  let dist = Infinity
  coords.forEach((coord, index) => {
    const d = Math.abs(coord - value)
    if (d < dist) { dist = d; best = index }
  })
  return best
}

export function solvePlateFem(input: FemInput): FemResult {
  const started = Date.now()
  const nxIn = Math.round(input.nx)
  const nyIn = Math.round(input.ny)
  if (nxIn < 2 || nyIn < 2 || nxIn > MAX_ELEMENTS || nyIn > MAX_ELEMENTS) return blank(`Use between 2 and ${MAX_ELEMENTS} elements on each side.`)
  if (!(input.aMm > 0 && input.bMm > 0 && input.tMm > 0 && input.eMpa > 0)) return blank("Plate size and E must be positive.")
  if (!(input.nu > 0 && input.nu < 0.5)) return blank("Poisson's ratio must be between 0 and 0.5.")
  const stiffeners = input.stiffeners ?? []
  const patch = input.patchLoad
  if (patch) {
    const len = patch.edge === "x0" || patch.edge === "x1" ? input.bMm : input.aMm
    const interval = patchInterval(patch, len)
    if (typeof interval === "string") return blank(interval)
  }
  const patchCuts = patch && patch.lengthMm > 0 ? [patch.atMm - patch.lengthMm / 2, patch.atMm + patch.lengthMm / 2] : []
  const xs = stations(input.aMm, nxIn, [
    ...stiffeners.filter((item) => item.axis === "y").map((item) => item.atMm),
    ...(patch && (patch.edge === "y0" || patch.edge === "y1") ? patchCuts : []),
  ])
  const ys = stations(input.bMm, nyIn, [
    ...stiffeners.filter((item) => item.axis === "x").map((item) => item.atMm),
    ...(patch && (patch.edge === "x0" || patch.edge === "x1") ? patchCuts : []),
  ])
  const nx = xs.length - 1
  const ny = ys.length - 1
  if (nx > MAX_ELEMENTS || ny > MAX_ELEMENTS) return blank(`The mesh plus stiffener lines needs ${nx} × ${ny} elements. The limit is ${MAX_ELEMENTS} on a side.`)
  const nodesX = nx + 1
  const nodesY = ny + 1
  const nodes = nodesX * nodesY
  const ndof = nodes * 3
  let maxAspect = 1
  let minAspect = Infinity
  let minElementMm = Infinity
  let maxElementMm = 0
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const ae = xs[ix + 1]! - xs[ix]!
      const be = ys[iy + 1]! - ys[iy]!
      const ratio = ae > be ? ae / be : be / ae
      if (ratio > maxAspect) maxAspect = ratio
      if (ratio < minAspect) minAspect = ratio
      minElementMm = Math.min(minElementMm, ae, be)
      maxElementMm = Math.max(maxElementMm, ae, be)
    }
  }
  if (!Number.isFinite(minAspect)) minAspect = 1
  const aspectWarning = maxAspect > 3 ? `An element aspect ratio reaches ${maxAspect.toFixed(2)}. Above 3 the eigenvalue is less trustworthy.` : ""
  const free = new Int32Array(ndof).fill(-1)
  const keep: number[] = []
  for (let iy = 0; iy < nodesY; iy++) {
    for (let ix = 0; ix < nodesX; ix++) {
      const mask = { w: false, bx: false, by: false }
      if (ix === 0) restrain(input.edges.x0, mask)
      if (ix === nx) restrain(input.edges.x1, mask)
      if (iy === 0) restrain(input.edges.y0, mask)
      if (iy === ny) restrain(input.edges.y1, mask)
      const node = iy * nodesX + ix
      for (let local = 0; local < 3; local++) {
        const held = local === 0 ? mask.w : local === 1 ? mask.bx : mask.by
        if (!held) {
          free[node * 3 + local] = keep.length
          keep.push(node * 3 + local)
        }
      }
    }
  }
  const n = keep.length
  if (n < 6) return blank("Not enough free degrees of freedom.")
  const bw = 3 * nodesX + 6
  const refStress = Math.max(
    Math.abs(input.sigma1Mpa),
    Math.abs(input.tauMpa),
    Math.abs(input.sigmaYMpa ?? 0),
    ...(input.tauSamples ?? []).map((sample) => Math.abs(sample.tauMpa)),
    ...(input.patches ?? []).map((item) => Math.abs(item.sigmaYMpa)),
    patch && patch.forceN !== 0 ? 1 : 0,
  )
  if (!(refStress > 0)) return blank("Set a non-zero stress or a patch force before running the eigenvalue solve.")
  const s0 = input.sigma1Mpa
  const sB = input.sigma1Mpa * input.psi
  const compressive = Math.max(s0, sB, input.sigmaYMpa ?? 0)
  const shearPresent = Math.abs(input.tauMpa) > 1e-9 || (input.tauSamples ?? []).some((sample) => Math.abs(sample.tauMpa) > 1e-9)
  const patchPushes = Boolean(patch && patch.forceN > 0)
  if (!shearPresent && !patchPushes && compressive <= 1e-9 && (Math.abs(s0) > 1e-9 || Math.abs(sB) > 1e-9 || (patch && patch.forceN < 0))) {
    return blank("The direct stress is tensile and there is no compressive patch or shear. This is not a compression-buckling case.")
  }
  let pre: Prestress | null = null
  if (patch && patch.forceN !== 0) {
    pre = solvePatchPrestress({ xs, ys, tMm: input.tMm, eMpa: input.eMpa, nu: input.nu, patch })
    if (!pre.ok) return blank(pre.reason)
  }
  const D = (input.eMpa * input.tMm ** 3) / (12 * (1 - input.nu ** 2))
  const Gmod = input.eMpa / (2 * (1 + input.nu))
  const Db = [[D, D * input.nu, 0], [D * input.nu, D, 0], [0, 0, D * (1 - input.nu) / 2]]
  const Ds = (5 / 6) * Gmod * input.tMm
  const K = new Float64Array(n * bw)
  const Kg = new Float64Array(n * bw)
  let symAbs = 0
  let symScale = 0
  const gp2 = [-G3, G3]
  const scatter12 = (ke: Float64Array, kg: Float64Array, ids: number[]) => {
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
      for (let ia = 0; ia < 3; ia++) for (let ib = 0; ib < 3; ib++) {
        const fi = free[ids[a]! * 3 + ia]!
        const fj = free[ids[b]! * 3 + ib]!
        if (fi < 0 || fj < 0 || fi < fj) continue
        const slot = (a * 3 + ia) * 12 + (b * 3 + ib)
        bandAdd(K, bw, fi, fj, ke[slot]!)
        bandAdd(Kg, bw, fi, fj, kg[slot]!)
      }
    }
  }
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const ae = xs[ix + 1]! - xs[ix]!
      const be = ys[iy + 1]! - ys[iy]!
      const ids = [iy * nodesX + ix, iy * nodesX + ix + 1, (iy + 1) * nodesX + ix + 1, (iy + 1) * nodesX + ix]
      const eIndex = iy * nx + ix
      const preX = pre ? pre.sigX[eIndex]! : 0
      const preY = pre ? pre.sigY[eIndex]! : 0
      const preT = pre ? pre.tau[eIndex]! : 0
      const xN = [xs[ix]!, xs[ix + 1]!, xs[ix + 1]!, xs[ix]!]
      const yN = [ys[iy]!, ys[iy]!, ys[iy + 1]!, ys[iy + 1]!]
      const ke = new Float64Array(144)
      const kg = new Float64Array(144)
      const accum = (xi: number, eta: number, wt: number, shear: boolean, bend: boolean, geo: boolean) => {
        const sh = shape(xi, eta)
        const detJ = (ae / 2) * (be / 2)
        const dNdx = sh.map((p) => p.dxi * (2 / ae))
        const dNdy = sh.map((p) => p.deta * (2 / be))
        if (bend) {
          const Bb = [new Float64Array(12), new Float64Array(12), new Float64Array(12)]
          for (let i = 0; i < 4; i++) {
            Bb[0]![i * 3 + 1] = dNdx[i]!
            Bb[1]![i * 3 + 2] = dNdy[i]!
            Bb[2]![i * 3 + 1] = dNdy[i]!
            Bb[2]![i * 3 + 2] = dNdx[i]!
          }
          for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
            let s = 0
            for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) s += Bb[p]![a]! * Db[p]![q]! * Bb[q]![b]!
            ke[a * 12 + b] += s * detJ * wt
          }
        }
        if (shear) {
          const Bs0 = new Float64Array(12)
          const Bs1 = new Float64Array(12)
          for (let i = 0; i < 4; i++) {
            Bs0[i * 3] = dNdx[i]!
            Bs0[i * 3 + 1] = -sh[i]!.n
            Bs1[i * 3] = dNdy[i]!
            Bs1[i * 3 + 2] = -sh[i]!.n
          }
          for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
            ke[a * 12 + b] += Ds * (Bs0[a]! * Bs0[b]! + Bs1[a]! * Bs1[b]!) * detJ * wt
          }
        }
        if (!geo) return
        let xPhys = 0
        let yPhys = 0
        for (let i = 0; i < 4; i++) {
          xPhys += sh[i]!.n * xN[i]!
          yPhys += sh[i]!.n * yN[i]!
        }
        const sig = input.sigma1Mpa * (1 - (1 - input.psi) * (yPhys / input.bMm)) + preX
        const tau = tauAt(yPhys, input) + preT
        const sigY = sigmaYAt(xPhys, yPhys, input) + preY
        const gx = new Float64Array(12)
        const gy = new Float64Array(12)
        for (let i = 0; i < 4; i++) { gx[i * 3] = dNdx[i]!; gy[i * 3] = dNdy[i]! }
        const s00 = input.tMm * sig
        const s01 = input.tMm * tau
        const s11 = input.tMm * sigY
        for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
          kg[a * 12 + b] += (gx[a]! * (s00 * gx[b]! + s01 * gy[b]!) + gy[a]! * (s01 * gx[b]! + s11 * gy[b]!)) * detJ * wt
        }
      }
      for (const xi of gp2) for (const eta of gp2) accum(xi, eta, 1, false, true, true)
      accum(0, 0, 4, true, false, false)
      for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) {
        const dke = Math.abs(ke[a * 12 + b]! - ke[b * 12 + a]!)
        const dkg = Math.abs(kg[a * 12 + b]! - kg[b * 12 + a]!)
        symAbs = Math.max(symAbs, dke, dkg)
        symScale = Math.max(symScale, Math.abs(ke[a * 12 + b]!), Math.abs(kg[a * 12 + b]!))
      }
      scatter12(ke, kg, ids)
    }
  }
  if (input.krNPerRadPerMm > 0) {
    const kr = input.krNPerRadPerMm
    const spring = (kind: EdgeKind, length: number, node: number, which: 1 | 2) => {
      if (kind !== "elastic") return
      const f = free[node * 3 + which]!
      if (f >= 0) bandAdd(K, bw, f, f, (kr * length) / 2)
    }
    for (let iy = 0; iy < nodesY; iy++) {
      const length = iy === 0 || iy === ny ? (iy === 0 ? ys[1]! - ys[0]! : ys[ny]! - ys[ny - 1]!) : 0.5 * ((ys[iy]! - ys[iy - 1]!) + (ys[iy + 1]! - ys[iy]!))
      spring(input.edges.x0, length, iy * nodesX, 1)
      spring(input.edges.x1, length, iy * nodesX + nx, 1)
    }
    for (let ix = 0; ix < nodesX; ix++) {
      const length = ix === 0 || ix === nx ? (ix === 0 ? xs[1]! - xs[0]! : xs[nx]! - xs[nx - 1]!) : 0.5 * ((xs[ix]! - xs[ix - 1]!) + (xs[ix + 1]! - xs[ix]!))
      spring(input.edges.y0, length, ix, 2)
      spring(input.edges.y1, length, ny * nodesX + ix, 2)
    }
  }
  const stiffenerNotes: string[] = []
  const seen = new Set<string>()
  for (const beam of stiffeners) {
    if (beam.axis === "x" && (beam.atMm <= 1e-6 || beam.atMm >= input.bMm - 1e-6)) {
      stiffenerNotes.push(`${beam.id}: y is on or outside the plate, so the beam is not added. An edge line is not turned into an extra panel.`)
      continue
    }
    if (beam.axis === "y" && (beam.atMm <= 1e-6 || beam.atMm >= input.aMm - 1e-6)) {
      stiffenerNotes.push(`${beam.id}: x is on or outside the plate, so the beam is not added. An edge line is not turned into an extra panel.`)
      continue
    }
    const key = `${beam.axis}:${beam.atMm.toFixed(3)}`
    if (seen.has(key)) stiffenerNotes.push(`${beam.id}: coincident with another stiffener. Both sit on one mesh line and their stiffness adds. No extra panel is created.`)
    seen.add(key)
  }
  const preAt = (x: number, y: number) => {
    if (!pre) return { sigX: 0, sigY: 0 }
    let ix = 0
    let iy = 0
    while (ix < nx - 1 && xs[ix + 1]! < x) ix += 1
    while (iy < ny - 1 && ys[iy + 1]! < y) iy += 1
    return { sigX: pre.sigX[iy * nx + ix]!, sigY: pre.sigY[iy * nx + ix]! }
  }
  for (const beam of stiffeners) {
    if (!(beam.eiNmm2 > 0)) {
      stiffenerNotes.push(`${beam.id}: no EI, drawn only.`)
      continue
    }
    if (beam.axis === "x" && (beam.atMm <= 1e-6 || beam.atMm >= input.bMm - 1e-6)) continue
    if (beam.axis === "y" && (beam.atMm <= 1e-6 || beam.atMm >= input.aMm - 1e-6)) continue
    const factor = beam.rigid ? RIGID_FACTOR : 1
    const ei = beam.eiNmm2 * factor
    const gj = Math.max(0, beam.gjNmm2) * factor
    if (beam.axis === "x") {
      const iy = nearestIndex(ys, beam.atMm)
      const y = ys[iy]!
      const sig = input.sigma1Mpa * (1 - (1 - input.psi) * (y / input.bMm)) + preAt(input.aMm / 2, y).sigX
      const axial = sig * beam.areaMm2
      for (let ix = 0; ix < nx; ix++) addBeam(K, Kg, bw, free, iy * nodesX + ix, iy * nodesX + ix + 1, "x", xs[ix + 1]! - xs[ix]!, ei, gj, axial)
      stiffenerNotes.push(`${beam.id}: longitudinal beam on mesh line y = ${y.toFixed(2)} mm (entered ${beam.atMm} mm). ${beam.rigid ? "EI and GJ scaled by 10000 for a rigid comparison." : "EI and GJ as entered."} Beam Kg uses N = σx A.`)
    } else {
      const ix = nearestIndex(xs, beam.atMm)
      const x = xs[ix]!
      for (let iy = 0; iy < ny; iy++) {
        const y = 0.5 * (ys[iy]! + ys[iy + 1]!)
        addBeam(K, Kg, bw, free, iy * nodesX + ix, (iy + 1) * nodesX + ix, "y", ys[iy + 1]! - ys[iy]!, ei, gj, (sigmaYAt(x, y, input) + preAt(x, y).sigY) * beam.areaMm2)
      }
      stiffenerNotes.push(`${beam.id}: transverse beam on mesh line x = ${x.toFixed(2)} mm (entered ${beam.atMm} mm). Beam Kg uses N = σy A.`)
    }
  }
  if (stiffeners.length > 0) {
    const liveLong = stiffeners.filter((beam) => beam.axis === "x" && beam.atMm > 1e-6 && beam.atMm < input.bMm - 1e-6 && beam.eiNmm2 > 0)
    const liveTrans = stiffeners.filter((beam) => beam.axis === "y" && beam.atMm > 1e-6 && beam.atMm < input.aMm - 1e-6 && beam.eiNmm2 > 0)
    for (const along of liveLong) {
      for (const across of liveTrans) {
        const iy = nearestIndex(ys, along.atMm)
        const ix = nearestIndex(xs, across.atMm)
        stiffenerNotes.push(`SHOW CONNECTION NODES: ${along.id} and ${across.id} share plate node (${ix}, ${iy}) at x = ${xs[ix]!.toFixed(2)} mm, y = ${ys[iy]!.toFixed(2)} mm. w is the common displacement. The longitudinal beam bends with βx and twists with βy. The transverse beam bends with βy and twists with βx.`)
      }
    }
    stiffenerNotes.unshift("SHOW FEM CONNECTIVITY: each line below names the mesh station the beam uses. Coincident stiffeners add EI and GJ on that one line and do not create a panel. A line on the plate edge is not assembled.")
  }
  const factor = bandedCholesky(K, n, bw)
  if (!factor) return blank("Elastic stiffness is singular for this mesh and these restraints.")
  const sought = Math.min(Math.max(input.modes ?? 4, 1), 6, n)
  const gradient = Math.abs(input.psi - 1) > 1e-3 && Math.abs(input.sigma1Mpa) > 0
  const spread = gradient || Math.abs(input.tauMpa) > 0 || (input.tauSamples?.some((sample) => Math.abs(sample.tauMpa) > 0) ?? false) || pre != null
  const eigen = bucklingModes({
    K, Kg, factor, n, bw, keep, nodesX, xs, ys,
    aMm: input.aMm, bMm: input.bMm,
    maxSteps: Math.max(1, Math.min(n - 1, spread ? 120 : 36)),
  })
  if (!eigen.ok) return blank(eigen.reason)
  const width = Math.max(eigen.columns.length, 1)
  const X = Array.from({ length: n }, () => new Float64Array(width))
  const lambdas = eigen.columns.length > 0 ? eigen.lambdas.slice() : [Number.POSITIVE_INFINITY]
  for (let c = 0; c < eigen.columns.length; c++) {
    const column = eigen.columns[c]!
    for (let i = 0; i < n; i++) X[i]![c] = column[i]!
  }
  const iters = eigen.iterations
  const gvec = new Float64Array(n)
  const rhs = new Float64Array(n)
  const pairOf = (col: Float64Array, lambda: number) => {
    bandedMatvec(K, n, bw, col, rhs)
    bandedMatvec(Kg, n, bw, col, gvec)
    let num = 0
    let k2 = 0
    let g2 = 0
    for (let i = 0; i < n; i++) {
      const r = rhs[i]! - lambda * gvec[i]!
      num += r * r
      k2 += rhs[i]! * rhs[i]!
      g2 += gvec[i]! * gvec[i]!
    }
    const rn = Math.sqrt(num)
    const kn = Math.sqrt(k2)
    const gn = Math.sqrt(g2)
    const bal = kn + Math.abs(lambda) * gn
    return { residual: kn > 0 ? rn / kn : 0, residualBalanced: bal > 0 ? rn / bal : 0 }
  }
  const colOf = (c: number) => {
    const column = new Float64Array(n)
    for (let i = 0; i < n; i++) column[i] = X[i]![c]!
    return column
  }
  const spectrum = lambdas
    .map((lambda, index) => {
      if (!Number.isFinite(lambda) || Math.abs(lambda) >= 1e12) return null
      const pair = pairOf(colOf(index), lambda as number)
      return { index, lambda: lambda as number, residual: pair.residual, residualBalanced: pair.residualBalanced }
    })
    .filter((row): row is { index: number; lambda: number; residual: number; residualBalanced: number } => row != null)
    .sort((p, q) => Math.abs(p.lambda) - Math.abs(q.lambda))
  const ranked = spectrum.filter((row) => row.lambda > 1e-8 && row.lambda < 1e12)
  if (ranked.length === 0) {
    return blank("No buckling eigenvalue in the sense of the applied field. Reversing the loads may buckle. That reversal is not reported as a compression capacity.")
  }
  const leadRow = ranked[0]!
  const residual = leadRow.residual
  const residualBalanced = leadRow.residualBalanced
  const solverTolerance = 1e-8
  const wantShapes = input.shapes !== false
  const tauRef = Math.max(Math.abs(input.tauMpa), ...(input.tauSamples ?? []).map((sample) => Math.abs(sample.tauMpa)))
  const modes: FemMode[] = ranked.slice(0, sought).map((item) => {
    return {
      lambda: item.lambda,
      sigma1CrMpa: Math.abs(input.sigma1Mpa) > 0 ? item.lambda * input.sigma1Mpa : null,
      sigmaYCrMpa: Math.abs(input.sigmaYMpa ?? 0) > 0 ? item.lambda * (input.sigmaYMpa as number) : null,
      tauCrMpa: tauRef > 0 ? item.lambda * (input.tauMpa !== 0 ? input.tauMpa : tauRef) : null,
      patchCrN: patch && patch.forceN !== 0 ? item.lambda * patch.forceN : null,
      w: wantShapes ? normalisedW(X, item.index, keep, nodes) : [],
    }
  })
  const symRel = symScale > 0 ? symAbs / symScale : 0
  const symmetryNote = `K AND Kg SYMMETRY. Element matrices are symmetric by construction before scatter. Peak off-diagonal mismatch ${symAbs.toExponential(2)} against scale ${symScale.toExponential(2)}, relative ${symRel.toExponential(2)}. Band storage keeps only the lower triangle, so the global operators used by the solver are symmetric. NUMERICAL SANITY CHECK, not a code check.`
  const specLine = spectrum.filter((row) => row.lambda > 0).slice(0, 5).map((row, index) => {
    const partner = spectrum.find((other) => other.lambda < 0 && Math.abs(Math.abs(other.lambda) - row.lambda) / row.lambda < 0.05)
    return `#${index + 1} λ=${row.lambda.toExponential(4)} r=${row.residual.toExponential(2)} rb=${row.residualBalanced.toExponential(2)}${partner ? ` partner=${partner.lambda.toExponential(4)}` : ""}`
  }).join("; ")
  const positiveSpec = spectrum.filter((row) => row.lambda > 0)
  const separation = positiveSpec.length >= 2 ? (positiveSpec[1]!.lambda - positiveSpec[0]!.lambda) / positiveSpec[0]!.lambda : null
  return {
    ok: true,
    reason: "",
    elements: nx * ny,
    nodes,
    dof: ndof,
    freeDof: n,
    nx,
    ny,
    xs,
    ys,
    elementAspect: maxAspect,
    aspectWarning,
    modes,
    iterations: iters,
    residual,
    residualBalanced,
    spectrum: spectrum.slice(0, 8).map(({ lambda, residual: r, residualBalanced: rb }) => ({ lambda, residual: r, residualBalanced: rb })),
    solverTolerance,
    seconds: (Date.now() - started) / 1000,
    mesh: meshFromCoords(xs, ys),
    formulation: pre
      ? "Two-stage. Stage 1: bilinear plane-stress quad, 2×2, for the edge patch. The opposite edge is the normal support. Stage 2: Mindlin bilinear quad, 2×2 bending and geometric stiffness from the recovered membrane stress plus the entered σx, σy and τxy, 1-point shear, ks = 5/6. λ multiplies the whole field."
      : "Mindlin bilinear quad. 2×2 bending and geometric stiffness, 1-point shear, ks = 5/6. The entered σx(y), σy and τxy are the pre-buckling field. No separate membrane solve. Banded Cholesky of K. Eigenvalues from reorthogonalised Lanczos on L⁻¹ Kg L⁻ᵀ, then a Rayleigh quotient in the original basis. Stiffeners are Euler beams on EI and GJ. Beam Kg uses N = σA.",
    note: `${engineLine()} NORMALISED EIGENMODE — DISPLAY SCALE IS NOT PHYSICAL DISPLACEMENT. FILTER: the production modes are positive eigenvalues only, smallest first. A negative λ is the same |load| with the membrane field reversed. It stays in the diagnostic spectrum and is not a second compression capacity. ± pairs appear when Kg is indefinite, which pure bending and shear both are. Residual r = ||Kφ − λ Kg φ|| / ||Kφ||. Balanced residual rb = ||Kφ − λ Kg φ|| / (||Kφ|| + |λ| ||Kg φ||). Positive spectrum: ${specLine}. Next positive separation (λ2−λ1)/λ1 = ${separation == null ? "—" : separation.toExponential(3)}. Mesh aspect ${minAspect.toFixed(2)} to ${maxAspect.toFixed(2)}. Element size ${minElementMm.toFixed(2)} to ${maxElementMm.toFixed(2)} mm.${input.sigma1Mpa < 0 ? " σ1,cr is the stress at y = 0 after scaling. A negative value is tension on that edge, not a compressive capacity." : ""}${wantShapes && modes[0] && modes[0].w.length > 0 ? ` Mode 1 centreline half-waves ≈ ${countHalfWaves(modes[0].w, xs, ys, "x")} along x and ${countHalfWaves(modes[0].w, xs, ys, "y")} along y.` : ""} ${symmetryNote}`,
    prestressNote: pre ? `${pre.note} Equilibrium imbalance ${(pre.equilibrium * 100).toFixed(2)}%.` : "No patch load. Kg uses the entered membrane field only.",
    stiffenerNotes,
    minAspect,
    maxElementMm,
    minElementMm,
    symmetryNote,
    membrane: pre ? { sigX: Array.from(pre.sigX), sigY: Array.from(pre.sigY), tau: Array.from(pre.tau) } : null,
  }
}

function normalisedW(X: Float64Array[], column: number, keep: number[], nodes: number): number[] {
  const w = Array(nodes).fill(0)
  for (let i = 0; i < keep.length; i++) {
    const g = keep[i]!
    if (g % 3 === 0) w[Math.floor(g / 3)] = X[i]![column] ?? 0
  }
  let max = 0
  for (const value of w) max = Math.max(max, Math.abs(value))
  if (max > 0) for (let i = 0; i < w.length; i++) w[i] /= max
  return w
}

function addBeam(K: Float64Array, Kg: Float64Array, bw: number, free: Int32Array, nodeA: number, nodeB: number, axis: "x" | "y", length: number, ei: number, gj: number, axialCompression: number) {
  if (!(length > 0)) return
  const bendRot = axis === "x" ? 1 : 2
  const twistRot = axis === "x" ? 2 : 1
  const f = ei / length ** 3
  const ke = [
    12 * f, 6 * length * f, -12 * f, 6 * length * f,
    6 * length * f, 4 * length * length * f, -6 * length * f, 2 * length * length * f,
    -12 * f, -6 * length * f, 12 * f, -6 * length * f,
    6 * length * f, 2 * length * length * f, -6 * length * f, 4 * length * length * f,
  ]
  const scale = axialCompression / (30 * length)
  const kg = [
    36 * scale, 3 * length * scale, -36 * scale, 3 * length * scale,
    3 * length * scale, 4 * length * length * scale, -3 * length * scale, -length * length * scale,
    -36 * scale, -3 * length * scale, 36 * scale, -3 * length * scale,
    3 * length * scale, -length * length * scale, -3 * length * scale, 4 * length * length * scale,
  ]
  const dofs = [nodeA * 3, nodeA * 3 + bendRot, nodeB * 3, nodeB * 3 + bendRot]
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
    const fi = free[dofs[a]!]!
    const fj = free[dofs[b]!]!
    if (fi < 0 || fj < 0 || fi < fj) continue
    bandAdd(K, bw, fi, fj, ke[a * 4 + b]!)
    if (axialCompression !== 0) bandAdd(Kg, bw, fi, fj, kg[a * 4 + b]!)
  }
  if (gj > 0) {
    const t = gj / length
    const twist = [nodeA * 3 + twistRot, nodeB * 3 + twistRot]
    const kte = [t, -t, -t, t]
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const fi = free[twist[a]!]!
      const fj = free[twist[b]!]!
      if (fi < 0 || fj < 0 || fi < fj) continue
      bandAdd(K, bw, fi, fj, kte[a * 2 + b]!)
    }
  }
}

function criticalOf(result: FemResult): number | null {
  const mode = result.modes[0]
  if (!mode) return null
  if (mode.sigma1CrMpa != null && mode.sigma1CrMpa !== 0) return mode.sigma1CrMpa
  if (mode.sigmaYCrMpa != null && mode.sigmaYCrMpa !== 0) return mode.sigmaYCrMpa
  if (mode.tauCrMpa != null) return mode.tauCrMpa
  if (mode.patchCrN != null) return mode.patchCrN
  return mode.lambda
}

export function studyGrids(aMm: number, bMm: number): { nx: number; ny: number }[] {
  const alpha = bMm > 0 ? aMm / bMm : 1
  return MESH_STUDY_SIZES.map((n) => {
    if (alpha >= 1) return { nx: Math.min(MAX_ELEMENTS, Math.max(n, Math.round(n * Math.min(alpha, 6)))), ny: n }
    return { nx: n, ny: Math.min(MAX_ELEMENTS, Math.max(n, Math.round(n * Math.min(1 / Math.max(alpha, 1e-6), 6)))) }
  })
}

export function runMeshStudy(
  input: FemInput,
  sizes: number[] = [...MESH_STUDY_SIZES],
  grids?: { nx: number; ny: number }[],
  tolerance = CONVERGENCE_TOLERANCE,
): MeshStudy {
  const plan = grids && grids.length > 0 ? grids : sizes.map((size) => ({ nx: size, ny: size }))
  const rows: MeshRow[] = []
  let previous: FemResult | null = null
  for (const grid of plan) {
    const started = Date.now()
    const result = solvePlateFem({ ...input, nx: grid.nx, ny: grid.ny, shapes: true, modes: 3 })
    const critical = result.ok ? criticalOf(result) : null
    const prior = [...rows].reverse().find((row) => row.criticalMpa != null)?.criticalMpa ?? null
    const change = critical != null && prior != null && prior !== 0 ? (100 * (critical - prior)) / Math.abs(prior) : null
    const wavesX = result.ok && result.modes[0]?.w.length ? countHalfWaves(result.modes[0].w, result.xs, result.ys, "x") : null
    const wavesY = result.ok && result.modes[0]?.w.length ? countHalfWaves(result.modes[0].w, result.xs, result.ys, "y") : null
    const mac = previous?.ok && result.ok && previous.modes[0]?.w.length && result.modes[0]?.w.length
      ? modeMac(previous.modes[0]!.w, previous.xs, previous.ys, result.modes[0]!.w, result.xs, result.ys)
      : null
    rows.push({
      nx: grid.nx,
      ny: grid.ny,
      elements: result.elements,
      dof: result.dof,
      freeDof: result.freeDof,
      lambda: result.ok ? result.modes[0]?.lambda ?? null : null,
      criticalMpa: critical,
      changePct: change,
      mac,
      wavesX,
      wavesY,
      seconds: result.ok ? result.seconds : (Date.now() - started) / 1000,
      status: result.ok ? "solved" : result.reason,
    })
    if (result.ok) previous = result
  }
  const solved = rows.filter((row) => row.criticalMpa != null)
  const change = solved.at(-1)?.changePct
  const converged = Boolean(solved.length >= 2 && change != null && Math.abs(change) < tolerance * 100)
  const macLast = solved.at(-1)?.mac
  const waveChanged = solved.length >= 2 && (solved.at(-1)?.wavesX !== solved.at(-2)?.wavesX || solved.at(-1)?.wavesY !== solved.at(-2)?.wavesY)
  const modeNote = waveChanged
    ? " Half-wave count changed between the last two meshes, so eigenvalue proximity is not mode identity."
    : macLast != null && macLast < 0.9
      ? ` MAC of mode 1 against the previous mesh is ${macLast.toFixed(3)}. The governing mode may have changed.`
      : macLast != null
        ? ` MAC of mode 1 against the previous mesh is ${macLast.toFixed(3)}.`
        : ""
  return {
    rows,
    converged,
    tolerancePct: tolerance * 100,
    note: (converged
      ? `CONVERGED. The last two meshes differ by less than ${tolerance * 100}% in the reported critical value. This is a mesh check, not a code verification.`
      : `NOT CONVERGED. Convergence requires two successful meshes and a change below ${tolerance * 100}%.`) + modeNote,
  }
}

