/** Symmetric Lanczos on A = L⁻¹ Kg L⁻ᵀ, with full reorthogonalisation.
 * K = L Lᵀ stays factored by banded Cholesky. K − σ Kg is not factored:
 * that pencil is indefinite once Kg changes sign, which pure bending does.
 * Seeking the largest |μ| = 1/|λ| puts the ±λ cluster at the two ends of A,
 * where a Krylov basis can separate neighbours that unshifted iteration cannot.
 */

import { bandedBack, bandedForward, bandedMatvec, bandedSolve } from "./banded.ts"

export type BucklingEigen = {
  ok: boolean
  reason: string
  /** Up to eight eigenvalues, smallest |λ| first. */
  lambdas: number[]
  /** Matching eigenvectors in the free DOF basis. */
  columns: Float64Array[]
  iterations: number
}

function jacobiCyclic(matrix: number[][]): { values: number[]; vectors: number[][] } {
  const n = matrix.length
  const A = matrix.map((row) => row.slice())
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) as number))
  const rotate = (p: number, q: number) => {
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
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i]![j]! * A[i]![j]!
    if (off <= 1e-28 * Math.max(1, n)) break
    for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
      const scale = Math.abs(A[p]![p]!) + Math.abs(A[q]![q]!) + 1e-30
      if (Math.abs(A[p]![q]!) > 1e-15 * scale) rotate(p, q)
    }
  }
  const values = A.map((row, i) => row[i]!)
  const vectors = values.map((_, col) => V.map((row) => row[col]!))
  return { values, vectors }
}

export function bucklingModes(input: {
  K: Float64Array
  Kg: Float64Array
  factor: Float64Array
  n: number
  bw: number
  keep: number[]
  nodesX: number
  xs: number[]
  ys: number[]
  aMm: number
  bMm: number
  /** Krylov length. The iteration stops early once the lowest positive residual is under 1e-9. */
  maxSteps: number
}): BucklingEigen {
  const { K, Kg, factor, n, bw, keep, nodesX, xs, ys } = input
  const fail = (reason: string): BucklingEigen => ({ ok: false, reason, lambdas: [], columns: [], iterations: 0 })
  if (n < 1) return fail("There are no free degrees of freedom.")
  const maxSteps = Math.max(1, Math.min(n - 1, input.maxSteps))
  const gvec = new Float64Array(n)
  const rhs = new Float64Array(n)
  const dot = (a: Float64Array, b: Float64Array) => {
    let s = 0
    for (let i = 0; i < n; i++) s += a[i]! * b[i]!
    return s
  }
  const axpy = (y: Float64Array, x: Float64Array, scale: number) => {
    for (let i = 0; i < n; i++) y[i]! += scale * x[i]!
  }
  const applyA = (y: Float64Array) => {
    const u = bandedBack(factor, n, bw, y)
    bandedMatvec(Kg, n, bw, u, gvec)
    return bandedForward(factor, n, bw, gvec)
  }
  const rayleigh = (phi: Float64Array) => {
    bandedMatvec(K, n, bw, phi, rhs)
    bandedMatvec(Kg, n, bw, phi, gvec)
    let sk = 0
    let sg = 0
    for (let i = 0; i < n; i++) {
      sk += phi[i]! * rhs[i]!
      sg += phi[i]! * gvec[i]!
    }
    return sg !== 0 ? sk / sg : Number.POSITIVE_INFINITY
  }
  const residualOf = (phi: Float64Array, lambda: number) => {
    bandedMatvec(K, n, bw, phi, rhs)
    bandedMatvec(Kg, n, bw, phi, gvec)
    let num = 0
    let k2 = 0
    for (let i = 0; i < n; i++) {
      const r = rhs[i]! - lambda * gvec[i]!
      num += r * r
      k2 += rhs[i]! * rhs[i]!
    }
    const kn = Math.sqrt(k2)
    return kn > 0 ? Math.sqrt(num) / kn : 0
  }
  const waves: [number, number][] = [[1, 1], [2, 1], [3, 1], [1, 3], [4, 1], [2, 2], [1, 5], [5, 1], [3, 2], [1, 2]]
  const seed = new Float64Array(n)
  let rng = 123456789
  for (let i = 0; i < n; i++) {
    const g = keep[i]!
    const node = Math.floor(g / 3)
    const ix = node % nodesX
    const iy = Math.floor(node / nodesX)
    let value = 0
    if (g % 3 === 0) {
      for (const wave of waves) {
        value += Math.sin((wave[0] * Math.PI * xs[ix]!) / input.aMm) * Math.sin((wave[1] * Math.PI * ys[iy]!) / input.bMm)
      }
    } else value = 0.02 * Math.sin((ix + 1) * 0.7) * Math.cos((iy + 1) * 0.4)
    rng = (Math.imul(1664525, rng) + 1013904223) >>> 0
    seed[i] = value + (rng / 4294967296 - 0.5) * 1e-4
  }
  let seedNorm = Math.sqrt(dot(seed, seed))
  if (!(seedNorm > 0)) {
    for (let i = 0; i < n; i++) seed[i] = 1
    seedNorm = Math.sqrt(n)
  }
  for (let i = 0; i < n; i++) seed[i] = seed[i]! / seedNorm
  const Q: Float64Array[] = []
  const AQ: Float64Array[] = []
  let v = seed
  let prev: Float64Array | null = null
  let betaPrev = 0
  let eigen: { values: number[]; vectors: number[][] } | null = null
  const project = (): { values: number[]; vectors: number[][] } => {
    const m = Q.length
    const M = Array.from({ length: m }, () => Array(m).fill(0))
    for (let a = 0; a < m; a++) {
      for (let b = a; b < m; b++) {
        const s = 0.5 * (dot(Q[a]!, AQ[b]!) + dot(Q[b]!, AQ[a]!))
        M[a]![b] = s
        M[b]![a] = s
      }
    }
    eigen = jacobiCyclic(M)
    return eigen
  }
  const phiFrom = (coeffs: number[]) => {
    const y = new Float64Array(n)
    for (let k = 0; k < Q.length; k++) axpy(y, Q[k]!, coeffs[k] ?? 0)
    const yn = Math.sqrt(dot(y, y))
    if (yn > 0) for (let i = 0; i < n; i++) y[i] = y[i]! / yn
    return bandedBack(factor, n, bw, y)
  }
  const lowestPositive = () => {
    if (!eigen) return null
    let best = -1
    let bestMu = 0
    for (let i = 0; i < eigen.values.length; i++) {
      const mu = eigen.values[i]!
      if (mu > bestMu) {
        bestMu = mu
        best = i
      }
    }
    if (best < 0 || !(bestMu > 1e-18)) return null
    const coeffs = eigen.vectors[best]
    if (!coeffs) return null
    const phi = phiFrom(coeffs)
    const lambda = rayleigh(phi)
    if (!(lambda > 0) || !Number.isFinite(lambda)) return null
    return residualOf(phi, lambda)
  }
  for (let step = 0; step < maxSteps; step++) {
    const Av = applyA(v)
    AQ.push(Float64Array.from(Av))
    Q.push(v)
    if (prev) axpy(Av, prev, -betaPrev)
    const alpha = dot(v, Av)
    axpy(Av, v, -alpha)
    for (let pass = 0; pass < 2; pass++) {
      for (const q of Q) {
        const overlap = dot(Av, q)
        if (overlap !== 0) axpy(Av, q, -overlap)
      }
    }
    const beta = Math.sqrt(Math.max(0, dot(Av, Av)))
    const scale = Math.abs(alpha) + betaPrev + beta
    const dependent = !(beta > Math.max(1e-14, 1e-12 * Math.max(1, scale)))
    const checkpoint = dependent || Q.length === maxSteps || (Q.length >= 12 && Q.length % 12 === 0)
    if (checkpoint) {
      eigen = project()
      const lead = lowestPositive()
      if (dependent || (lead != null && lead < 1e-9)) break
    }
    if (dependent) break
    prev = v
    betaPrev = beta
    const next = new Float64Array(n)
    const invBeta = 1 / beta
    for (let i = 0; i < n; i++) next[i] = Av[i]! * invBeta
    v = next
  }
  if (!eigen) eigen = project()
  if (Q.length < 1) return fail("The eigenvalue iteration did not produce a basis.")
  const order = eigen.values
    .map((mu, index) => ({ mu, index, lambda: Math.abs(mu) > 1e-18 ? 1 / mu : Number.POSITIVE_INFINITY }))
    .filter((row) => Number.isFinite(row.lambda) && Math.abs(row.lambda) < 1e12)
    .sort((p, q) => Math.abs(p.lambda) - Math.abs(q.lambda))
  const keepCount = Math.min(8, order.length)
  const columns: Float64Array[] = []
  const lambdas: number[] = []
  for (let c = 0; c < keepCount; c++) {
    const coeffs = eigen.vectors[order[c]!.index]
    if (!coeffs) continue
    const phi = phiFrom(coeffs)
    const lambda = rayleigh(phi)
    columns.push(phi)
    lambdas.push(Number.isFinite(lambda) ? lambda : order[c]!.lambda)
  }
  let lead = -1
  let leadLambda = Infinity
  for (let c = 0; c < lambdas.length; c++) {
    const lambda = lambdas[c]!
    if (lambda > 1e-8 && lambda < leadLambda) {
      leadLambda = lambda
      lead = c
    }
  }
  if (lead >= 0 && residualOf(columns[lead]!, leadLambda) > 1e-9) {
    const cluster: Float64Array[] = []
    for (let c = 0; c < lambdas.length; c++) {
      if (c === lead) continue
      const lambda = lambdas[c]!
      if (Number.isFinite(lambda) && Math.abs(Math.abs(lambda) - leadLambda) / leadLambda < 0.25) cluster.push(columns[c]!)
    }
    let vec = Float64Array.from(columns[lead]!)
    let bestVec = Float64Array.from(vec)
    let bestLambda = leadLambda
    let bestResidual = residualOf(vec, leadLambda)
    const tmp = new Float64Array(n)
    for (let polish = 0; polish < 6 && bestResidual > 1e-9; polish++) {
      bandedMatvec(Kg, n, bw, vec, gvec)
      const y = bandedSolve(factor, n, bw, gvec)
      for (const other of cluster) {
        bandedMatvec(Kg, n, bw, other, tmp)
        let gg = 0
        let pg = 0
        for (let i = 0; i < n; i++) {
          gg += other[i]! * tmp[i]!
          pg += y[i]! * tmp[i]!
        }
        if (Math.abs(gg) > 0) {
          const alpha = pg / gg
          for (let i = 0; i < n; i++) y[i]! -= alpha * other[i]!
        }
      }
      const lambda = rayleigh(y)
      if (!Number.isFinite(lambda) || !(lambda > 0)) break
      if (Math.abs(lambda - leadLambda) / leadLambda > 0.05) break
      const scaleN = Math.sqrt(dot(y, y))
      if (!(scaleN > 0)) break
      for (let i = 0; i < n; i++) vec[i] = y[i]! / scaleN
      const got = residualOf(vec, lambda)
      if (got < bestResidual) {
        bestResidual = got
        bestLambda = lambda
        bestVec = Float64Array.from(vec)
      } else break
    }
    columns[lead] = bestVec
    lambdas[lead] = bestLambda
  }
  return { ok: true, reason: "", lambdas, columns, iterations: Q.length }
}
