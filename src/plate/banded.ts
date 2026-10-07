/** Symmetric band matrix, lower triangle including the diagonal.
 * Entry A(i,j) for i >= j and i - j < bw is stored at i * bw + (i - j).
 */

export function bandIndex(i: number, j: number, bw: number): number {
  return i * bw + (i - j)
}

export function bandAdd(A: Float64Array, bw: number, i: number, j: number, value: number) {
  if (value === 0 || !Number.isFinite(value)) return
  if (i < j) {
    const swap = i
    i = j
    j = swap
  }
  const span = i - j
  if (span >= bw) throw new Error(`Banded matrix span ${span} exceeds bandwidth ${bw}.`)
  A[i * bw + span] += value
}

export function bandedCholesky(A: Float64Array, n: number, bw: number): Float64Array | null {
  const L = new Float64Array(n * bw)
  for (let i = 0; i < n; i++) {
    const j0 = Math.max(0, i - bw + 1)
    for (let j = j0; j <= i; j++) {
      let sum = A[i * bw + (i - j)]!
      const kStart = Math.max(j0, j - bw + 1)
      for (let k = kStart; k < j; k++) {
        sum -= L[i * bw + (i - k)]! * L[j * bw + (j - k)]!
      }
      if (i === j) {
        if (!(sum > 0)) return null
        L[i * bw] = Math.sqrt(sum)
      } else {
        const pivot = L[j * bw]!
        if (!(pivot > 0)) return null
        L[i * bw + (i - j)] = sum / pivot
      }
    }
  }
  return L
}

export function bandedSolve(L: Float64Array, n: number, bw: number, b: Float64Array): Float64Array {
  const y = new Float64Array(n)
  const x = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let sum = b[i]!
    const k0 = Math.max(0, i - bw + 1)
    for (let k = k0; k < i; k++) sum -= L[i * bw + (i - k)]! * y[k]!
    y[i] = sum / L[i * bw]!
  }
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i]!
    const k1 = Math.min(n - 1, i + bw - 1)
    for (let k = i + 1; k <= k1; k++) sum -= L[k * bw + (k - i)]! * x[k]!
    x[i] = sum / L[i * bw]!
  }
  return x
}

export function bandedForward(L: Float64Array, n: number, bw: number, b: Float64Array): Float64Array {
  const y = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let sum = b[i]!
    const k0 = Math.max(0, i - bw + 1)
    for (let k = k0; k < i; k++) sum -= L[i * bw + (i - k)]! * y[k]!
    y[i] = sum / L[i * bw]!
  }
  return y
}

/** Solve Lᵀ x = b. L is the banded Cholesky factor. */
export function bandedBack(L: Float64Array, n: number, bw: number, b: Float64Array): Float64Array {
  const x = new Float64Array(n)
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i]!
    const k1 = Math.min(n - 1, i + bw - 1)
    for (let k = i + 1; k <= k1; k++) sum -= L[k * bw + (k - i)]! * x[k]!
    x[i] = sum / L[i * bw]!
  }
  return x
}

export function bandedMatvec(A: Float64Array, n: number, bw: number, x: Float64Array, out: Float64Array) {
  for (let i = 0; i < n; i++) {
    let sum = A[i * bw]! * x[i]!
    const k0 = Math.max(0, i - bw + 1)
    for (let j = k0; j < i; j++) sum += A[i * bw + (i - j)]! * x[j]!
    const k1 = Math.min(n - 1, i + bw - 1)
    for (let j = i + 1; j <= k1; j++) sum += A[j * bw + (j - i)]! * x[j]!
    out[i] = sum
  }
}
