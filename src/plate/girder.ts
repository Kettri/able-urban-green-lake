/** Load derivation for a doubly symmetric or monosymmetric I-web. Not a plate resistance. */

export type GirderInput = {
  /** Clear web depth between flanges, mm. */
  hwMm: number
  twMm: number
  bfTopMm: number
  tfTopMm: number
  bfBotMm: number
  tfBotMm: number
  /** Sagging positive. Compression in the top fibre, N·mm. */
  momentNmm: number
  /** Shear force, N. The stress used in the plate is VQ/(I t). */
  shearN: number
}

export type StressSample = { yMm: number; sigmaMpa: number; tauMpa: number }

export type GirderStress = {
  ok: boolean
  reason: string
  areaMm2: number
  iMm4: number
  yBarFromBottomMm: number
  sigmaBottomMpa: number | null
  sigmaTopMpa: number | null
  psi: number | null
  tauAvgMpa: number | null
  tauMaxMpa: number | null
  samples: StressSample[]
  note: string
}

type Piece = { y0: number; y1: number; width: number }

function integrate(pieces: Piece[]): { area: number; moment: number; iAboutZero: number } {
  let area = 0
  let moment = 0
  let iAboutZero = 0
  for (const piece of pieces) {
    const h = piece.y1 - piece.y0
    const a = piece.width * h
    const yc = 0.5 * (piece.y0 + piece.y1)
    area += a
    moment += a * yc
    iAboutZero += (piece.width * h ** 3) / 12 + a * yc * yc
  }
  return { area, moment, iAboutZero }
}

function firstMomentAbove(pieces: Piece[], yCut: number, yBar: number): number {
  let q = 0
  for (const piece of pieces) {
    const y0 = Math.max(piece.y0, yCut)
    const y1 = piece.y1
    if (y1 <= y0) continue
    const a = piece.width * (y1 - y0)
    const yc = 0.5 * (y0 + y1)
    q += a * (yc - yBar)
  }
  return q
}

export function plateGirderWeb(input: GirderInput): GirderStress {
  const empty = (reason: string): GirderStress => ({
    ok: false,
    reason,
    areaMm2: 0,
    iMm4: 0,
    yBarFromBottomMm: 0,
    sigmaBottomMpa: null,
    sigmaTopMpa: null,
    psi: null,
    tauAvgMpa: null,
    tauMaxMpa: null,
    samples: [],
    note: "",
  })
  const { hwMm, twMm, bfTopMm, tfTopMm, bfBotMm, tfBotMm, momentNmm, shearN } = input
  if (![hwMm, twMm, bfTopMm, tfTopMm, bfBotMm, tfBotMm].every((n) => n > 0)) {
    return empty("Web and both flanges need positive sizes.")
  }
  if (!Number.isFinite(momentNmm) || !Number.isFinite(shearN)) return empty("M* and V* must be numbers.")
  const pieces: Piece[] = [
    { y0: 0, y1: tfBotMm, width: bfBotMm },
    { y0: tfBotMm, y1: tfBotMm + hwMm, width: twMm },
    { y0: tfBotMm + hwMm, y1: tfBotMm + hwMm + tfTopMm, width: bfTopMm },
  ]
  const gross = integrate(pieces)
  if (!(gross.area > 0)) return empty("Section area is zero.")
  const yBar = gross.moment / gross.area
  const i = gross.iAboutZero - gross.area * yBar * yBar
  if (!(i > 0)) return empty("Second moment is not positive.")
  const yBottom = tfBotMm
  const yTop = tfBotMm + hwMm
  // Sagging M* > 0 compresses the top. Compression is positive in the plate solver.
  const sigma = (y: number) => (momentNmm * (y - yBar)) / i
  const sigmaBottom = sigma(yBottom)
  const sigmaTop = sigma(yTop)
  const psi = Math.abs(sigmaBottom) > 1e-9 ? sigmaTop / sigmaBottom : 1
  const samples: StressSample[] = []
  const steps = 10
  let tauMax = 0
  for (let iStep = 0; iStep <= steps; iStep++) {
    const y = yBottom + ((yTop - yBottom) * iStep) / steps
    const q = firstMomentAbove(pieces, y, yBar)
    const tau = (shearN * q) / (i * twMm)
    tauMax = Math.max(tauMax, Math.abs(tau))
    samples.push({ yMm: y - tfBotMm, sigmaMpa: sigma(y), tauMpa: tau })
  }
  const tauAvg = shearN / (hwMm * twMm)
  return {
    ok: true,
    reason: "",
    areaMm2: gross.area,
    iMm4: i,
    yBarFromBottomMm: yBar,
    sigmaBottomMpa: sigmaBottom,
    sigmaTopMpa: sigmaTop,
    psi,
    tauAvgMpa: tauAvg,
    tauMaxMpa: tauMax,
    samples,
    note: "LOAD DERIVATION. σ = M* (Y − ȳ) / I with sagging M* positive, so the top of the web is in compression when M* > 0. τ = V* Q / (I tw) on the web. Average web shear V*/(hw tw) is reported separately. This is not a plate resistance.",
  }
}
