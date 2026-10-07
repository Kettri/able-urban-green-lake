/** One-shot elastic V1 measurements. Not part of the interactive quick suite. */

import { kShear, kShearSeries } from "./classical.ts"
import { countHalfWaves, solvePlateFem, type FemInput, type FemResult } from "./fem.ts"
import { modeMac } from "./mac.ts"

const SS = { x0: "ss" as const, x1: "ss" as const, y0: "ss" as const, y1: "ss" as const }
const steel = { eMpa: 210000, nu: 0.3 }

function kFromTau(tau: number, t: number, b: number): number {
  const scale = (Math.PI ** 2 * 210000 * (t / b) ** 2) / (12 * (1 - 0.3 * 0.3))
  return tau / scale
}

export function shearSeriesTable(alphas = [0.5, 1, 2, 4]): string[] {
  const orders = [4, 6, 8, 10, 12, 16]
  const lines: string[] = []
  for (const alpha of alphas) {
    let previous: number | null = null
    for (const order of orders) {
      const row = kShearSeries(alpha, order)
      const k = row?.k ?? NaN
      const change = previous != null && previous !== 0 ? (100 * (k - previous)) / Math.abs(previous) : null
      lines.push(`series α=${alpha} order=${order} k=${k.toFixed(4)} Δ=${change == null ? "—" : change.toFixed(4) + "%"} fit=${kShear(alpha).toFixed(4)}`)
      previous = k
    }
  }
  return lines
}

function base(extra: Partial<FemInput>): FemInput {
  return {
    aMm: 1000, bMm: 1000, tMm: 10, ...steel,
    sigma1Mpa: 0, psi: 1, tauMpa: 0, nx: 8, ny: 8,
    edges: SS, krNPerRadPerMm: 0, shapes: true, modes: 2,
    ...extra,
  }
}

function grids(alpha: number, shorts: number[]): { nx: number; ny: number }[] {
  return shorts.map((n) => {
    if (alpha >= 1) return { ny: n, nx: Math.min(64, Math.max(n, Math.round(n * alpha))) }
    return { nx: n, ny: Math.min(64, Math.max(n, Math.round(n / alpha))) }
  })
}

export function shearFemTable(): string[] {
  const lines: string[] = []
  for (const alpha of [0.5, 1, 2, 4]) {
    const series = kShearSeries(alpha, 16)
    const fit = kShear(alpha)
    let previous: FemResult | null = null
    const shorts = alpha >= 4 ? [8, 12, 16] : [8, 12, 16, 24, 32]
    for (const grid of grids(alpha, shorts)) {
      const fem = solvePlateFem(base({
        aMm: 1000 * alpha, bMm: 1000, tMm: 10, tauMpa: 1, sigma1Mpa: 0, nx: grid.nx, ny: grid.ny,
      }))
      const tau = fem.modes[0]?.tauCrMpa ?? NaN
      const k = kFromTau(tau, 10, 1000)
      const mac = previous?.ok && fem.ok ? modeMac(previous.modes[0]!.w, previous.xs, previous.ys, fem.modes[0]!.w, fem.xs, fem.ys) : null
      const prevK = previous?.modes[0]?.tauCrMpa != null ? kFromTau(previous.modes[0]!.tauCrMpa!, 10, 1000) : null
      const change = prevK != null ? (100 * (k - prevK)) / Math.abs(prevK) : null
      const vs = series ? (100 * (k - series.k)) / series.k : null
      lines.push(`shear α=${alpha} ${grid.nx}×${grid.ny} el=${fem.elements} dof=${fem.freeDof} k=${k.toFixed(4)} r=${fem.residual.toExponential(2)} Δ=${change == null ? "—" : change.toFixed(3) + "%"} series=${series?.k.toFixed(4)} vs=${vs == null ? "—" : vs.toFixed(3) + "%"} fit=${fit.toFixed(3)} mac=${mac == null ? "—" : mac.toFixed(4)} waves=${countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "x")}×${countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "y")} ${fem.seconds.toFixed(2)}s`)
      previous = fem
    }
  }
  return lines
}

function stiffenerCase(id: string, stiffeners: FemInput["stiffeners"]): string[] {
  const lines: string[] = [`# ${id}`]
  let previous: FemResult | null = null
  for (const n of [8, 12, 16, 24, 32]) {
    const fem = solvePlateFem(base({
      sigma1Mpa: 1, nx: n, ny: n, stiffeners,
    }))
    const stress = fem.modes[0]?.sigma1CrMpa ?? NaN
    const mac = previous?.ok && fem.ok ? modeMac(previous.modes[0]!.w, previous.xs, previous.ys, fem.modes[0]!.w, fem.xs, fem.ys) : null
    const prev = previous?.modes[0]?.sigma1CrMpa
    const change = prev != null && prev !== 0 ? (100 * (stress - prev)) / Math.abs(prev) : null
    const hx = countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "x")
    const hy = countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "y")
    const why = fem.ok ? "" : ` FAIL ${fem.reason}`
    lines.push(`${id} ${fem.nx}×${fem.ny} dof=${fem.freeDof} σ=${stress.toFixed(2)} r=${fem.residual.toExponential(2)} Δ=${change == null ? "—" : change.toFixed(3) + "%"} mac=${mac == null ? "—" : mac.toFixed(4)} waves=${hx}×${hy}${why}`)
    previous = fem
  }
  return lines
}

export function stiffenerTable(): string[] {
  const beam = (id: string, axis: "x" | "y", at: number, ei: number, gj = 0) => ({ id, axis, atMm: at, eiNmm2: ei, gjNmm2: gj, areaMm2: 0, rigid: false })
  return [
    ...stiffenerCase("S01", []),
    ...stiffenerCase("S02", [beam("L", "x", 500, 1e11)]),
    ...stiffenerCase("S03", [beam("L1", "x", 1000 / 3, 1e11), beam("L2", "x", 2000 / 3, 1e11)]),
    ...stiffenerCase("S04", [beam("T", "y", 500, 1e11)]),
    ...stiffenerCase("S05", [beam("L", "x", 500, 1e11), beam("T", "y", 500, 1e11)]),
  ]
}

export function gjTable(): string[] {
  const lines: string[] = []
  let baseMode: FemResult | null = null
  for (const gj of [0, 1e6, 1e8, 1e10, 1e12, 1e14]) {
    const fem = solvePlateFem(base({
      sigma1Mpa: 1, nx: 12, ny: 12,
      stiffeners: [{ id: "L", axis: "x", atMm: 500, eiNmm2: 1e14, gjNmm2: gj, areaMm2: 0, rigid: false }],
    }))
    const mac = baseMode?.ok && fem.ok ? modeMac(baseMode.modes[0]!.w, baseMode.xs, baseMode.ys, fem.modes[0]!.w, fem.xs, fem.ys) : null
    if (gj === 0) baseMode = fem
    lines.push(`GJ=${gj.toExponential(0)} σ=${(fem.modes[0]?.sigma1CrMpa ?? NaN).toFixed(2)} r=${fem.residual.toExponential(2)} waves=${countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "x")}×${countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "y")} mac0=${mac == null ? "—" : mac.toFixed(4)}`)
  }
  return lines
}

function patchSolve(label: string, input: Partial<FemInput>, meshes: { nx: number; ny: number }[]): string[] {
  const lines: string[] = [`# ${label}`]
  let previous: FemResult | null = null
  for (const grid of meshes) {
    const fem = solvePlateFem(base({ nx: grid.nx, ny: grid.ny, sigma1Mpa: 0, ...input }))
    const force = fem.modes[0]?.patchCrN ?? NaN
    const mac = previous?.ok && fem.ok ? modeMac(previous.modes[0]!.w, previous.xs, previous.ys, fem.modes[0]!.w, fem.xs, fem.ys) : null
    const prev = previous?.modes[0]?.patchCrN
    const change = prev != null && prev !== 0 ? (100 * (force - prev)) / Math.abs(prev) : null
    const hx = countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "x")
    const hy = countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "y")
    const sums = fem.prestressNote.match(/ΣFx [\d.eE+-]+ N\. ΣFy [\d.eE+-]+ N\. ΣMz [\d.eE+-]+ N·mm\./)?.[0] ?? ""
    const imb = fem.prestressNote.match(/Force imbalance [\d.]+%/)?.[0] ?? ""
    const why = fem.ok ? "" : ` FAIL ${fem.reason}`
    lines.push(`${label} ${fem.nx}×${fem.ny} dof=${fem.freeDof} Fcr=${force.toFixed(0)} r=${fem.residual.toExponential(2)} Δ=${change == null ? "—" : change.toFixed(3) + "%"} mac=${mac == null ? "—" : mac.toFixed(4)} waves=${hx}×${hy} ${imb} ${sums}${why}`)
    previous = fem
  }
  return lines
}

export function patchTable(): string[] {
  const meshes = [8, 12, 16, 24, 32].map((n) => ({ nx: n, ny: n }))
  const stiff = [{ id: "T", axis: "y" as const, atMm: 500, eiNmm2: 1e11, gjNmm2: 0, areaMm2: 0, rigid: false }]
  return [
    ...patchSolve("P01", { patchLoad: { edge: "y1", atMm: 500, lengthMm: 200, forceN: 10000 } }, meshes),
    ...patchSolve("P02", { patchLoad: { edge: "y1", atMm: 500, lengthMm: 500, forceN: 10000 } }, meshes),
    ...patchSolve("P03", { patchLoad: { edge: "y1", atMm: 500, lengthMm: 1000, forceN: 10000 } }, meshes),
    ...patchSolve("P04", { patchLoad: { edge: "y1", atMm: 250, lengthMm: 200, forceN: 10000 } }, meshes),
    ...patchSolve("P05", { patchLoad: { edge: "y1", atMm: 500, lengthMm: 200, forceN: 10000 }, stiffeners: stiff }, meshes),
    ...patchSolve("P06", { patchLoad: { edge: "y1", atMm: 200, lengthMm: 200, forceN: 10000 }, stiffeners: stiff }, meshes),
  ]
}

export function shearAlpha4Fine(): string[] {
  const series = kShearSeries(4, 16)
  const fem = solvePlateFem(base({
    aMm: 4000, bMm: 1000, tMm: 10, tauMpa: 1, sigma1Mpa: 0, nx: 80, ny: 20,
  }))
  const tau = fem.modes[0]?.tauCrMpa ?? NaN
  const k = kFromTau(tau, 10, 1000)
  const vs = series ? (100 * (k - series.k)) / series.k : null
  return [`shear α=4 80×20 el=${fem.elements} dof=${fem.freeDof} k=${k.toFixed(4)} r=${fem.residual.toExponential(2)} series=${series?.k.toFixed(4)} vs=${vs == null ? "—" : vs.toFixed(3) + "%"} waves=${countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "x")}×${countHalfWaves(fem.modes[0]?.w ?? [], fem.xs, fem.ys, "y")} ${fem.seconds.toFixed(2)}s ${fem.ok ? "" : fem.reason}`]
}

const part = process.argv[2] ?? "series"
const started = Date.now()
const lines = part === "series" ? shearSeriesTable()
  : part === "shear" ? shearFemTable()
  : part === "shear4" ? shearAlpha4Fine()
  : part === "stiff" ? stiffenerTable()
  : part === "gj" ? gjTable()
  : part === "patch" ? patchTable()
  : []
for (const line of lines) console.log(line)
console.log(`done ${part} ${(Date.now() - started) / 1000}s`)
