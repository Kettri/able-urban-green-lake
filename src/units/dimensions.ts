/** SI base exponents plus separate absolute-temperature and temperature-difference axes. */
export type Dim = {
  L: number
  M: number
  T: number
  I: number
  Th: number
  dTh: number
  N: number
  J: number
  U: number
  R: number
  G: number
  C: number
  H: number
  Qc: number
}

export const ZERO_DIM: Dim = {
  L: 0, M: 0, T: 0, I: 0, Th: 0, dTh: 0, N: 0, J: 0, U: 0, R: 0, G: 0, C: 0, H: 0, Qc: 0,
}

export function dim(partial: Partial<Dim>): Dim {
  return { ...ZERO_DIM, ...partial }
}

export function dimKey(d: Dim): string {
  return (Object.keys(ZERO_DIM) as (keyof Dim)[]).map((k) => `${k}${d[k]}`).join(" ")
}

export function sameDim(a: Dim, b: Dim): boolean {
  return dimKey(a) === dimKey(b)
}
