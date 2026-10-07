const SQRT3 = Math.sqrt(3)

export type ThreadProfile = {
  d: number
  P: number
  /** Fundamental triangle height, H = (√3/2) P */
  H: number
  /** Basic pitch diameter. */
  d2: number
  /** Basic minor diameter. */
  d1: number
  /** d3 = d1 − H/6, used with d2 for tensile stress area. */
  d3: number
  /** External thread depth, 5H/8. */
  depth: number
  /** Nominal shank area, πd²/4. */
  Ao: number
  /** Tensile stress area, π/4 × ((d2+d3)/2)². */
  As: number
  /** Basic minor (root) area, πd1²/4. */
  Ar: number
  angleDeg: number
}

/**
 * ISO 68-1 basic 60° profile and the ISO 898-1 tensile stress area.
 * Calculated. Not a copy of the ISO 724 size table.
 */
export function threadProfile(d: number, P: number): ThreadProfile {
  if (!(d > 0)) throw new Error("Bolt diameter must be greater than zero.")
  if (!(P > 0)) throw new Error("Pitch must be greater than zero.")
  const H = (SQRT3 / 2) * P
  const d2 = d - (3 / 8) * SQRT3 * P
  const d1 = d - (5 / 8) * SQRT3 * P
  const d3 = d1 - H / 6
  const dm = (d2 + d3) / 2
  const area = (dia: number) => (Math.PI / 4) * dia * dia
  return {
    d,
    P,
    H,
    d2,
    d1,
    d3,
    depth: (5 / 8) * H,
    Ao: area(d),
    As: area(dm),
    Ar: area(d1),
    angleDeg: 60,
  }
}

export function threadsPerMm(P: number): number {
  return 1 / P
}

export function threadsPerInch(Pmm: number): number {
  return 25.4 / Pmm
}
