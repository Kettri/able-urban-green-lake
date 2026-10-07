/** Classical thin-plate buckling. Compression is positive. Lengths mm, stress MPa (N/mm²). */

export type EdgeKind = "ss" | "fixed" | "free" | "elastic"

export type Edges = { x0: EdgeKind; x1: EdgeKind; y0: EdgeKind; y1: EdgeKind }

export type ClassicalInput = {
  aMm: number
  bMm: number
  tMm: number
  eMpa: number
  nu: number
  fyMpa: number
  fuMpa: number
  /** Direct stress at y = 0. Compression positive. */
  sigma1Mpa: number
  /** σ(y=b) / σ(y=0). */
  psi: number
  tauMpa: number
  edges: Edges
}

export type TraceStep = {
  id: string
  label: string
  equation: string
  substitution: string
  result: string
}

export type ModeRow = { m: number; n: number; k: number; sigmaMpa: number }

export type ClassicalResult = {
  ok: boolean
  reason: string
  alpha: number | null
  dNmm: number | null
  kSigma: number | null
  kTau: number | null
  sigmaCrMpa: number | null
  tauCrMpa: number | null
  m: number | null
  n: number | null
  modes: ModeRow[]
  method: string
  warnings: string[]
  steps: TraceStep[]
  ratioSigma: number | null
  ratioTau: number | null
}

const PI2 = Math.PI * Math.PI

export function flexuralRigidity(eMpa: number, tMm: number, nu: number): number {
  return (eMpa * tMm ** 3) / (12 * (1 - nu * nu))
}

/** Simply supported, uniform σx. Exact Navier minimum. */
export function kUniform(alpha: number, mMax = 24): { k: number; m: number; modes: ModeRow[] } {
  const modes: ModeRow[] = []
  let best = Infinity
  let bestM = 1
  const limit = Math.max(6, Math.ceil(alpha * 2) + 2, mMax)
  for (let m = 1; m <= limit; m++) {
    const k = (m / alpha + alpha / m) ** 2
    modes.push({ m, n: 1, k, sigmaMpa: 0 })
    if (k < best) {
      best = k
      bestM = m
    }
  }
  return { k: best, m: bestM, modes }
}

/** Timoshenko closed-form fit. Not an infinite series. */
export function kShear(alpha: number): number {
  if (alpha >= 1) return 5.34 + 4 / (alpha * alpha)
  return 4 + 5.34 / (alpha * alpha)
}

function shearCouple(m: number, n: number, p: number, q: number): number {
  if (((m - p) & 1) === 0 || ((n - q) & 1) === 0) return 0
  return (4 * m * n * p * q) / ((p * p - m * m) * (n * n - q * q))
}

function jacobiCyclicValues(matrix: number[][]): number[] {
  const n = matrix.length
  const a = matrix.map((row) => row.slice())
  const rotate = (p: number, q: number) => {
    const app = a[p]![p]!
    const aqq = a[q]![q]!
    const apq = a[p]![q]!
    let t: number
    if (Math.abs(app - aqq) <= 1e-18 * (Math.abs(app) + Math.abs(aqq) + 1)) t = apq >= 0 ? 1 : -1
    else {
      const tau = (aqq - app) / (2 * apq)
      t = Math.sign(tau) / (Math.abs(tau) + Math.hypot(1, tau))
    }
    const c = 1 / Math.hypot(1, t)
    const s = t * c
    a[p]![p] = app - t * apq
    a[q]![q] = aqq + t * apq
    a[p]![q] = 0
    a[q]![p] = 0
    for (let k = 0; k < n; k++) {
      if (k === p || k === q) continue
      const aik = a[k]![p]!
      const akq = a[k]![q]!
      const nextP = c * aik - s * akq
      const nextQ = s * aik + c * akq
      a[k]![p] = nextP
      a[p]![k] = nextP
      a[k]![q] = nextQ
      a[q]![k] = nextQ
    }
  }
  for (let sweep = 0; sweep < 80; sweep++) {
    let off = 0
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i]![j]! * a[i]![j]!
    if (off <= 1e-28 * Math.max(1, n)) break
    for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
      const scale = Math.abs(a[p]![p]!) + Math.abs(a[q]![q]!) + 1e-30
      if (Math.abs(a[p]![q]!) > 1e-15 * scale) rotate(p, q)
    }
  }
  return a.map((row, i) => row[i]!)
}

function largestAlgebraic(matrix: number[][]): number {
  const n = matrix.length
  if (n === 0) return 0
  if (n === 1) return matrix[0]![0]!
  const dot = (a: Float64Array, b: Float64Array) => {
    let s = 0
    for (let i = 0; i < n; i++) s += a[i]! * b[i]!
    return s
  }
  const axpy = (y: Float64Array, x: Float64Array, scale: number) => {
    for (let i = 0; i < n; i++) y[i]! += scale * x[i]!
  }
  const apply = (x: Float64Array) => {
    const y = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const row = matrix[i]!
      let s = 0
      for (let j = 0; j < n; j++) s += row[j]! * x[j]!
      y[i] = s
    }
    return y
  }
  let v = new Float64Array(n)
  let rng = 17
  for (let i = 0; i < n; i++) {
    rng = (Math.imul(1664525, rng) + 1013904223) >>> 0
    v[i] = (rng / 4294967296) - 0.5
  }
  let vn = Math.sqrt(dot(v, v))
  for (let i = 0; i < n; i++) v[i] = v[i]! / vn
  const steps = Math.min(n - 1, n <= 48 ? n - 1 : 72)
  const Q: Float64Array[] = []
  const AQ: Float64Array[] = []
  let prev: Float64Array | null = null
  let betaPrev = 0
  for (let step = 0; step < steps; step++) {
    const Av = apply(v)
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
    if (!(beta > 1e-14)) break
    prev = v
    betaPrev = beta
    const next = new Float64Array(n)
    const inv = 1 / beta
    for (let i = 0; i < n; i++) next[i] = Av[i]! * inv
    v = next
  }
  const m = Q.length
  const M = Array.from({ length: m }, () => Array(m).fill(0))
  for (let a = 0; a < m; a++) {
    for (let b = a; b < m; b++) {
      const s = 0.5 * (dot(Q[a]!, AQ[b]!) + dot(Q[b]!, AQ[a]!))
      M[a]![b] = s
      M[b]![a] = s
    }
  }
  let best = -Infinity
  for (const value of jacobiCyclicValues(M)) if (value > best) best = value
  return Number.isFinite(best) ? best : 0
}

/**
 * Navier–Galerkin series for constant shear on four simple supports.
 * An incomplete sine basis is an upper bound on the Kirchhoff coefficient.
 * More terms lower that bound. Not a code coefficient and not the Timoshenko fit.
 */
export function kShearSeries(alpha: number, terms = 6): { k: number; terms: number } | null {
  if (!(alpha > 0) || !Number.isFinite(alpha)) return null
  const nMax = Math.max(2, Math.min(16, Math.floor(terms)))
  const ids: [number, number][] = []
  for (let m = 1; m <= nMax; m++) for (let n = 1; n <= nMax; n++) ids.push([m, n])
  const diag = ids.map(([m, n]) => {
    const s = (m * m) / (alpha * alpha) + n * n
    return (Math.PI ** 4) * s * s * (alpha / 4)
  })
  const n = ids.length
  const B = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
    const [m, ni] = ids[i]!
    const [p, q] = ids[j]!
    const v = (2 * shearCouple(m, ni, p, q)) / Math.sqrt(diag[i]! * diag[j]!)
    B[i]![j] = v
    B[j]![i] = v
  }
  const mu = largestAlgebraic(B)
  if (!(mu > 0)) return null
  return { k: (1 / mu) / (Math.PI * Math.PI), terms: nMax }
}

/**
 * Uniform σx and σy, four edges simply supported. Navier modes do not couple.
 * λ multiplies both stresses. No shear term and no code interaction.
 */
export function biaxialUniform(input: {
  aMm: number
  bMm: number
  tMm: number
  eMpa: number
  nu: number
  sigmaXMpa: number
  sigmaYMpa: number
}): { lambda: number; sigmaXCrMpa: number; sigmaYCrMpa: number; m: number; n: number } | null {
  const { aMm, bMm, tMm, eMpa, nu, sigmaXMpa, sigmaYMpa } = input
  if (!(aMm > 0 && bMm > 0 && tMm > 0 && eMpa > 0) || !(nu > 0 && nu < 0.5)) return null
  const d = flexuralRigidity(eMpa, tMm, nu)
  let best = Infinity
  let bestM = 1
  let bestN = 1
  for (let m = 1; m <= 8; m++) for (let n = 1; n <= 8; n++) {
    const mx = (m * Math.PI) / aMm
    const my = (n * Math.PI) / bMm
    const load = sigmaXMpa * mx * mx + sigmaYMpa * my * my
    if (!(load > 0)) continue
    const lambda = (d * (mx * mx + my * my) ** 2) / (tMm * load)
    if (lambda < best) {
      best = lambda
      bestM = m
      bestN = n
    }
  }
  if (!Number.isFinite(best)) return null
  return {
    lambda: best,
    sigmaXCrMpa: best * sigmaXMpa,
    sigmaYCrMpa: best * sigmaYMpa,
    m: bestM,
    n: bestN,
  }
}


/**
 * Long outstand: y = b free, other three edges simply supported, uniform compression.
 * Approximate coefficient used in plate texts, exact only as a/b → ∞ (k → 0.425).
 */
export function kOutstand(alpha: number): number {
  return 0.425 + 1 / (alpha * alpha)
}

function sameParity(n: number, r: number): boolean {
  return (n - r) % 2 === 0
}

/** ∫₀¹ ξ sin(nπξ) sin(rπξ) dξ */
function xiSinSin(n: number, r: number): number {
  if (n === r) return 0.25
  if (sameParity(n, r)) return 0
  const d = n - r
  const s = n + r
  return -(1 / PI2) * (1 / (d * d) - 1 / (s * s))
}

/** ∫₀^b [1 − (1−ψ) y/b] sin(nπy/b) sin(rπy/b) dy */
export function stressIntegral(bMm: number, psi: number, n: number, r: number): number {
  if (n === r) return (bMm * (1 + psi)) / 4
  return bMm * (1 - psi) * (1 / PI2) * (1 / (n - r) ** 2 - 1 / (n + r) ** 2) * (sameParity(n, r) ? 0 : 1)
}

function jacobiValues(matrix: number[][]): number[] {
  const n = matrix.length
  const a = matrix.map((row) => row.slice())
  for (let sweep = 0; sweep < 40; sweep++) {
    let p = 0
    let q = 1
    let max = 0
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const v = Math.abs(a[i]![j]!)
        if (v > max) {
          max = v
          p = i
          q = j
        }
      }
    }
    if (max < 1e-14) break
    const app = a[p]![p]!
    const aqq = a[q]![q]!
    const apq = a[p]![q]!
    let t: number
    if (Math.abs(app - aqq) <= 1e-18 * (Math.abs(app) + Math.abs(aqq) + 1)) {
      t = apq >= 0 ? 1 : -1
    } else {
      const tau = (aqq - app) / (2 * apq)
      t = Math.sign(tau) / (Math.abs(tau) + Math.hypot(1, tau))
    }
    const c = 1 / Math.hypot(1, t)
    const s = t * c
    a[p]![p] = app - t * apq
    a[q]![q] = aqq + t * apq
    a[p]![q] = 0
    a[q]![p] = 0
    for (let k = 0; k < n; k++) {
      if (k === p || k === q) continue
      const aik = a[k]![p]!
      const akq = a[k]![q]!
      const vip = c * aik - s * akq
      const viq = s * aik + c * akq
      a[k]![p] = vip
      a[p]![k] = vip
      a[k]![q] = viq
      a[q]![k] = viq
    }
  }
  return a.map((row, i) => row[i]!)
}

/**
 * Rayleigh–Ritz / Navier coupling for simply supported edges and σx(y).
 * Returns the lowest critical value of σ1, and k based on b.
 */
export function galerkinSigma(input: {
  aMm: number
  bMm: number
  tMm: number
  eMpa: number
  nu: number
  psi: number
  nMax?: number
  mMax?: number
}): { sigma: number; k: number; m: number; n: number; modes: ModeRow[] } | null {
  const { aMm, bMm, tMm, eMpa, nu, psi } = input
  const nMax = input.nMax ?? 6
  const d = flexuralRigidity(eMpa, tMm, nu)
  const alpha = aMm / bMm
  const mMax = input.mMax ?? Math.max(8, Math.ceil(alpha * 2) + 3)
  const modes: ModeRow[] = []
  let best = Infinity
  let bestM = 1
  let bestN = 1
  for (let m = 1; m <= mMax; m++) {
    const mx = (m * Math.PI) / aMm
    const kgScale = tMm * mx * mx * (aMm / 2)
    const kBend: number[] = []
    const g: number[][] = []
    for (let n = 1; n <= nMax; n++) {
      const ky = (n * Math.PI) / bMm
      const kappa = mx * mx + ky * ky
      kBend.push(d * kappa * kappa * ((aMm * bMm) / 4))
      const row: number[] = []
      for (let r = 1; r <= nMax; r++) row.push(kgScale * stressIntegral(bMm, psi, n, r))
      g.push(row)
    }
    const bHat = kBend.map((kii, i) => g[i]!.map((gij, j) => gij / Math.sqrt(kii * kBend[j]!)))
    const mus = jacobiValues(bHat)
    let local = Infinity
    let localN = 1
    mus.forEach((mu, index) => {
      if (mu > 1e-10) {
        const sigma = 1 / mu
        if (sigma < local) {
          local = sigma
          localN = index + 1
        }
      }
    })
    if (Number.isFinite(local)) {
      const k = (local * tMm * bMm * bMm) / (PI2 * d)
      modes.push({ m, n: localN, k, sigmaMpa: local })
      if (local < best) {
        best = local
        bestM = m
        bestN = localN
      }
    }
  }
  if (!Number.isFinite(best)) return null
  const k = (best * tMm * bMm * bMm) / (PI2 * d)
  return { sigma: best, k, m: bestM, n: bestN, modes }
}

function allSimply(edges: Edges): boolean {
  return edges.x0 === "ss" && edges.x1 === "ss" && edges.y0 === "ss" && edges.y1 === "ss"
}

function outstandCase(edges: Edges, psi: number): boolean {
  return edges.y1 === "free" && edges.y0 === "ss" && edges.x0 === "ss" && edges.x1 === "ss" && Math.abs(psi - 1) < 1e-9
}

function sigmaFromK(k: number, eMpa: number, nu: number, tMm: number, bMm: number): number {
  return (k * PI2 * eMpa * (tMm / bMm) ** 2) / (12 * (1 - nu * nu))
}

export function classicalPlate(input: ClassicalInput): ClassicalResult {
  const warnings: string[] = []
  const fail = (reason: string): ClassicalResult => ({
    ok: false,
    reason,
    alpha: null,
    dNmm: null,
    kSigma: null,
    kTau: null,
    sigmaCrMpa: null,
    tauCrMpa: null,
    m: null,
    n: null,
    modes: [],
    method: "—",
    warnings,
    steps: [],
    ratioSigma: null,
    ratioTau: null,
  })

  const { aMm, bMm, tMm, eMpa, nu, fyMpa, fuMpa, psi, tauMpa, sigma1Mpa, edges } = input
  if (![aMm, bMm, tMm, eMpa, fyMpa, fuMpa].every((n) => Number.isFinite(n) && n > 0)) {
    return fail("Length, thickness, E, fy and fu must be positive numbers.")
  }
  if (!(nu > 0 && nu < 0.5)) return fail("Poisson's ratio must be between 0 and 0.5.")
  if (!Number.isFinite(psi) || !Number.isFinite(tauMpa) || !Number.isFinite(sigma1Mpa)) {
    return fail("Stress values must be numbers. Compression is positive.")
  }
  if (fuMpa + 1e-9 < fyMpa) warnings.push("fu is below fy. Check the material entry.")
  if (tMm > bMm / 10 || tMm > aMm / 10) {
    warnings.push("Thickness is large for thin-plate theory. The critical stress is still the Kirchhoff value.")
  }

  const alpha = aMm / bMm
  const d = flexuralRigidity(eMpa, tMm, nu)
  const steps: TraceStep[] = [
    {
      id: "alpha",
      label: "Aspect ratio",
      equation: "α = a / b",
      substitution: `a = ${aMm} mm, b = ${bMm} mm`,
      result: `${alpha} —`,
    },
    {
      id: "D",
      label: "Flexural rigidity",
      equation: "D = E t³ / [12 (1 − ν²)]",
      substitution: `E = ${eMpa} MPa, t = ${tMm} mm, ν = ${nu}`,
      result: `${d} N·mm`,
    },
  ]

  let kSigma: number | null = null
  let sigmaCr: number | null = null
  let m: number | null = null
  let n: number | null = null
  let modes: ModeRow[] = []
  let method = ""

  const directWanted = Math.abs(sigma1Mpa) > 0 || Math.abs(psi - 1) > 1e-12
  if (allSimply(edges)) {
    if (Math.abs(psi - 1) < 1e-9) {
      const exact = kUniform(alpha)
      kSigma = exact.k
      m = exact.m
      n = 1
      sigmaCr = sigmaFromK(exact.k, eMpa, nu, tMm, bMm)
      modes = exact.modes.map((row) => ({ ...row, sigmaMpa: sigmaFromK(row.k, eMpa, nu, tMm, bMm) }))
      method = "Navier, four edges simply supported, uniform σx"
    } else {
      const energy = galerkinSigma({ aMm, bMm, tMm, eMpa, nu, psi })
      if (!energy) return fail("No compressive buckling eigenvalue for this stress shape.")
      kSigma = energy.k
      sigmaCr = energy.sigma
      m = energy.m
      n = energy.n
      modes = energy.modes
      method = "Navier–Galerkin, four edges simply supported, linear σx"
    }
    steps.push({
      id: "k",
      label: "Buckling coefficient kσ",
      equation: Math.abs(psi - 1) < 1e-9 ? "kσ(m) = (m/α + α/m)², minimum over m" : "kσ from the lowest eigenvalue of the Navier coupling in n",
      substitution: `α = ${alpha}, ψ = ${psi}, m = ${m}, n = ${n}. Candidates: ${modes.slice(0, 8).map((row) => `m=${row.m} k=${row.k.toFixed(3)}`).join("; ")}`,
      result: `${kSigma}`,
    })
    steps.push({
      id: "scr",
      label: "Elastic critical direct stress",
      equation: "σcr = kσ π² E / [12 (1 − ν²)] (t/b)²",
      substitution: `kσ = ${kSigma}, E = ${eMpa} MPa, ν = ${nu}, t = ${tMm} mm, b = ${bMm} mm`,
      result: `${sigmaCr} MPa`,
    })
  } else if (outstandCase(edges, psi)) {
    kSigma = kOutstand(alpha)
    m = 1
    n = 1
    sigmaCr = sigmaFromK(kSigma, eMpa, nu, tMm, bMm)
    modes = [{ m: 1, n: 1, k: kSigma, sigmaMpa: sigmaCr }]
    method = "Approximate outstand, three edges simply supported, y = b free"
    warnings.push("The outstand coefficient 0.425 + (b/a)² is the usual approximation, not a full series solution.")
    steps.push({
      id: "k",
      label: "Buckling coefficient kσ",
      equation: "kσ ≈ 0.425 + (b/a)²",
      substitution: `a = ${aMm} mm, b = ${bMm} mm`,
      result: `${kSigma}`,
    })
    steps.push({
      id: "scr",
      label: "Elastic critical direct stress",
      equation: "σcr = kσ π² E / [12 (1 − ν²)] (t/b)²",
      substitution: `kσ = ${kSigma}, b = outstand width`,
      result: `${sigmaCr} MPa`,
    })
  } else if (directWanted) {
    warnings.push("Analytical solution unavailable for this boundary-condition combination.")
    method = "No closed form for these edges"
  } else {
    method = "Direct-stress solution not requested"
  }

  let kTau: number | null = null
  let tauCr: number | null = null
  if (Math.abs(tauMpa) > 0 || true) {
    if (allSimply(edges)) {
      kTau = kShear(alpha)
      tauCr = sigmaFromK(kTau, eMpa, nu, tMm, bMm)
      steps.push({
        id: "kt",
        label: "Shear coefficient kτ",
        equation: alpha >= 1 ? "kτ = 5.34 + 4/α²" : "kτ = 4 + 5.34/α²",
        substitution: `α = ${alpha}. Timoshenko fit, not an exact series.`,
        result: `${kTau}`,
      })
      const series = kShearSeries(alpha, 12)
      if (series) {
        steps.push({
          id: "kts",
          label: "Shear coefficient from a Navier series",
          equation: "Stationary Navier–Galerkin energy for constant τ. Sine terms 1…12 in each direction.",
          substitution: `α = ${alpha}, terms ${series.terms}×${series.terms}. Energy upper bound. Orders 12 and 16 differ by less than 0.02% on α = 0.5, 1, 2 and 4. The Timoshenko fit is not this series.`,
          result: `${series.k}`,
        })
      }
      steps.push({
        id: "tcr",
        label: "Elastic critical shear stress",
        equation: "τcr = kτ π² E / [12 (1 − ν²)] (t/b)²",
        substitution: `kτ = ${kTau}, t = ${tMm} mm, b = ${bMm} mm`,
        result: `${tauCr} MPa`,
      })
    } else if (Math.abs(tauMpa) > 0) {
      warnings.push("Analytical shear solution unavailable unless all four edges are simply supported.")
    }
  }

  if (Math.abs(sigma1Mpa) > 0 && Math.abs(tauMpa) > 0) {
    warnings.push("Direct stress and shear are both non-zero. Each critical stress is separate. No interaction equation is applied.")
  }
  if (sigmaCr != null && sigmaCr > fyMpa) {
    warnings.push("Elastic critical stress is above fy. Yielding is expected before this elastic buckle. Not a code resistance.")
  }
  if (sigma1Mpa < 0) warnings.push("Compression is positive. A negative σ1 is tension at y = 0.")

  const ratioSigma = sigmaCr != null && sigmaCr > 0 && sigma1Mpa > 0 ? sigma1Mpa / sigmaCr : null
  const ratioTau = tauCr != null && tauCr > 0 && Math.abs(tauMpa) > 0 ? Math.abs(tauMpa) / tauCr : null

  return {
    ok: true,
    reason: "",
    alpha,
    dNmm: d,
    kSigma,
    kTau,
    sigmaCrMpa: sigmaCr,
    tauCrMpa: tauCr,
    m,
    n,
    modes: modes.sort((p, q) => p.sigmaMpa - q.sigmaMpa || p.k - q.k).slice(0, 8),
    method: method || "—",
    warnings,
    steps,
    ratioSigma,
    ratioTau,
  }
}
