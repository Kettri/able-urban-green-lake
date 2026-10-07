/** Display units for the plate sheet. Solvers stay in mm, N and MPa.
 * Factors come from the shared unit engine. Do not hard-code a second scale table.
 */
import { convert } from "../units/converter.ts"

export const LENGTH_UNITS = ["mm", "cm", "m"] as const
export const STRESS_UNITS = ["Pa", "kPa", "MPa", "GPa"] as const
export const FORCE_UNITS = ["N", "kN", "MN"] as const

export type LengthUnit = (typeof LENGTH_UNITS)[number]
export type StressUnit = (typeof STRESS_UNITS)[number]
export type ForceUnit = (typeof FORCE_UNITS)[number]

const LENGTH_ID: Record<LengthUnit, string> = { mm: "mm", cm: "cm", m: "m" }
const STRESS_ID: Record<StressUnit, string> = {
  Pa: "stress:Pa",
  kPa: "stress:kPa",
  MPa: "stress:MPa",
  GPa: "stress:GPa",
}
const FORCE_ID: Record<ForceUnit, string> = { N: "N", kN: "kN", MN: "MN" }

export function lengthToMm(value: number, unit: LengthUnit): number {
  return convert(value, LENGTH_ID[unit], "mm")
}

export function mmToLength(mm: number, unit: LengthUnit): number {
  return convert(mm, "mm", LENGTH_ID[unit])
}

export function stressToMpa(value: number, unit: StressUnit): number {
  return convert(value, STRESS_ID[unit], "stress:MPa")
}

export function mpaToStress(mpa: number, unit: StressUnit): number {
  return convert(mpa, "stress:MPa", STRESS_ID[unit])
}

export function forceToN(value: number, unit: ForceUnit): number {
  return convert(value, FORCE_ID[unit], "N")
}

export function nToForce(n: number, unit: ForceUnit): number {
  return convert(n, "N", FORCE_ID[unit])
}

/** Rotational spring: force per length. Canonical is N/mm. */
export function stiffnessToNPerMm(value: number, force: ForceUnit, length: LengthUnit): number {
  return forceToN(value, force) / lengthToMm(1, length)
}

export function nPerMmToStiffness(value: number, force: ForceUnit, length: LengthUnit): number {
  return nToForce(value * lengthToMm(1, length), force)
}

export function formatEntry(value: number): string {
  if (!Number.isFinite(value)) return ""
  const abs = Math.abs(value)
  if (abs !== 0 && (abs >= 1e7 || abs < 1e-6)) return value.toExponential(8)
  const rounded = Math.round(value * 1e9) / 1e9
  return String(rounded)
}
