import { parseStrictNumber } from "../reference/format.ts"

export const STANDARD_G = 9.80665

export function weightNewton(massKg: number, g: number): number {
  if (!Number.isFinite(massKg) || !Number.isFinite(g)) throw new Error("Invalid number.")
  if (massKg < 0) throw new Error("Mass cannot be negative.")
  if (!(g > 0)) throw new Error("Gravitational acceleration must be greater than zero.")
  return massKg * g
}

export function parseWeightInputs(massRaw: string, gRaw: string): { massKg: number; g: number; newton: number } {
  const massKg = parseStrictNumber(massRaw)
  const g = parseStrictNumber(gRaw)
  return { massKg, g, newton: weightNewton(massKg, g) }
}
