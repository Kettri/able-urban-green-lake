/** Clause 6.3.3 closed form. Table 6.3.3(C) is not stored; tests compare this form with cells read from that table. */

export function alphaC(lambdaN: number, alphaB: number): number {
  const alphaA = (2100 * (lambdaN - 13.5)) / (lambdaN * lambdaN - 15.3 * lambdaN + 2050)
  const lambda = lambdaN + alphaA * alphaB
  if (!(lambda > 0)) return 1
  const eta = Math.max(0, 0.00326 * (lambda - 13.5))
  const ratio = lambda / 90
  const xi = (ratio * ratio + 1 + eta) / (2 * ratio * ratio)
  const inside = 1 - (90 / (xi * lambda)) ** 2
  if (!(inside >= 0) || !Number.isFinite(xi)) return 1
  return Math.min(1, xi * (1 - Math.sqrt(inside)))
}

export type ColumnInput = {
  leOverR: number
  fyMpa: number
  areaMm2: number
  alphaB: number
  kf: number
}

/** Ns = kf An fy and Nc = αc Ns, with λn from Clause 6.3.3. Returns newtons. */
export function columnCapacity(input: ColumnInput): { lambdaN: number; alpha: number; ns: number; nc: number } {
  const lambdaN = input.leOverR * Math.sqrt(input.kf) * Math.sqrt(input.fyMpa / 250)
  const alpha = alphaC(lambdaN, input.alphaB)
  const ns = input.kf * input.areaMm2 * input.fyMpa
  return { lambdaN, alpha, ns, nc: alpha * ns }
}
