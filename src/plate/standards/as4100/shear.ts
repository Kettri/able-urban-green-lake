/** Clause 5.11 shear factors. Equations, not a stored copy of Table 5.11.5.2. */

export function shearYield(fyMpa: number, areaMm2: number): number {
  return 0.6 * fyMpa * areaMm2
}

export function stockyLimit(fyMpa: number): number {
  return 82 / Math.sqrt(fyMpa / 250)
}

/** Unstiffened αv, Clause 5.11.5.1. Not capped; Vb ≤ Vw applies outside. */
export function alphaVUnstiffened(dpOverTw: number, fyMpa: number): number {
  return (82 / (dpOverTw * Math.sqrt(fyMpa / 250))) ** 2
}

/** Stiffened αv, Clause 5.11.5.2, already capped at 1. */
export function alphaVStiffened(dpOverTw: number, fyMpa: number, sOverDp: number): number {
  const base = alphaVUnstiffened(dpOverTw, fyMpa)
  const factor = sOverDp <= 1
    ? 1 / sOverDp ** 2 + 0.75
    : 0.75 / sOverDp ** 2 + 1
  return Math.min(1, base * factor)
}

export function alphaD(alphaV: number, sOverDp: number, forceOne: boolean): number {
  if (forceOne) return 1
  if (!(alphaV > 0)) return Number.NaN
  return 1 + (1 - alphaV) / (1.15 * alphaV * Math.sqrt(1 + sOverDp ** 2))
}

/** Clause 5.11.5.2(b). bfo, tf, d1, tw in mm; the ratio is dimensionless. */
export function alphaFFlange(bfoMm: number, tfMm: number, d1Mm: number, twMm: number): number {
  const inner = 1 + (40 * bfoMm * tfMm * tfMm) / (d1Mm * d1Mm * twMm)
  return 1.6 - 0.6 / Math.sqrt(inner)
}

export function productAlpha(dpOverTwTimesRoot: number, sOverDp: number): number {
  const fyOver = 1
  const dpOverTw = dpOverTwTimesRoot
  const av = sOverDp > 3 ? alphaVUnstiffened(dpOverTw, 250 * fyOver) : alphaVStiffened(dpOverTw, 250, sOverDp)
  const ad = sOverDp > 3 ? 1 : alphaD(av, sOverDp, false)
  return av * ad
}
