import type { Residual } from "./shared.ts"

export type Limits = { ep: number; ey: number; ed: number | null; row: string }

type Stress = "uniform-compression" | "edge-gradient" | "outstand-gradient"

/** Table 5.2 plasticity, yield and deformation limits. ed null means the table cell is an em dash. */
const TABLE_52: Record<string, [number, number, number | null]> = {
  "one|uniform-compression|SR": [10, 16, 35],
  "one|uniform-compression|HR": [9, 16, 35],
  "one|uniform-compression|LW": [8, 15, 35],
  "one|uniform-compression|CF": [8, 15, 35],
  "one|uniform-compression|HW": [8, 14, 35],
  "one|outstand-gradient|SR": [10, 25, null],
  "one|outstand-gradient|HR": [9, 25, null],
  "one|outstand-gradient|LW": [8, 22, null],
  "one|outstand-gradient|CF": [8, 22, null],
  "one|outstand-gradient|HW": [8, 22, null],
  "both|uniform-compression|SR": [30, 45, 90],
  "both|uniform-compression|HR": [30, 45, 90],
  "both|uniform-compression|LW": [30, 40, 90],
  "both|uniform-compression|CF": [30, 40, 90],
  "both|uniform-compression|HW": [30, 35, 90],
  "both|edge-gradient|ANY": [82, 115, null],
}

/** Table 6.2.4 yield slenderness limit for a compression element. No gradient rows exist in this table. */
const TABLE_624: Record<string, number> = {
  "one|SR": 16,
  "one|HR": 16,
  "one|LW": 15,
  "one|CF": 15,
  "one|HW": 14,
  "both|SR": 45,
  "both|HR": 45,
  "both|LW": 40,
  "both|CF": 40,
  "both|HW": 35,
}

export function residualLabel(residual: Residual): string {
  if (residual === "SR") return "SR — stress relieved"
  if (residual === "HR") return "HR — hot-rolled or hot-finished"
  if (residual === "LW") return "LW — lightly welded longitudinally"
  if (residual === "CF") return "CF — cold-formed"
  return "HW — heavily welded longitudinally"
}

export function limits52(edges: "one" | "both", stress: Stress, residual: Residual | null): Limits | null {
  if (edges === "both" && stress === "edge-gradient") {
    const row = TABLE_52["both|edge-gradient|ANY"]
    if (!row) return null
    return { ep: row[0], ey: row[1], ed: row[2], row: "flat, both edges supported, compression at one edge and tension at the other, residual stresses Any" }
  }
  if (stress === "edge-gradient") return null
  if (!residual) return null
  const key = `${edges}|${stress}|${residual}`
  const row = TABLE_52[key]
  if (!row) return null
  const edgeText = edges === "one" ? "one longitudinal edge supported (outstand)" : "both longitudinal edges supported"
  const stressText = stress === "uniform-compression"
    ? "uniform compression"
    : "maximum compression at the unsupported edge, zero stress or tension at the supported edge"
  return { ep: row[0], ey: row[1], ed: row[2], row: `flat, ${edgeText}, ${stressText}, ${residualLabel(residual)}` }
}

export function lambdaEy624(edges: "one" | "both", residual: Residual): number | null {
  return TABLE_624[`${edges}|${residual}`] ?? null
}

/** Clause 5.2.2 and Clause 6.2.3. fy is in MPa. b and t are in the same length unit. */
export function lambdaE(b: number, t: number, fy: number): number {
  return (b / t) * Math.sqrt(fy / 250)
}

export function kbo(edges: "one" | "both"): number {
  return edges === "both" ? 4 : 0.425
}
