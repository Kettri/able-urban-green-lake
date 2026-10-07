/** AS 4100:2020 (incorporating Amendment No. 1) plate/web adapter.
 * Numbers below were read from the licensed PDF for this project.
 * They are not copied into EN 1993 or AS 5224.
 */
export const AS4100_META = {
  standard: "AS 4100",
  edition: "2020",
  amendment: "1",
  /** Frozen plate/web subset. Do not change the adapter without re-running the D1.0 suite. */
  dataset: "IQ-PLB-AS4100-D1.0",
  freeze: "IQ-PLB-AS4100-D1.0",
  date: "2026-10-07",
  suite: "D1.0",
} as const

export type CheckStatus =
  | "pass"
  | "fail"
  | "not-applicable"
  | "not-checked"
  | "out-of-scope"
  | "data-required"
  | "invalid"

export type CheckKind = "strength" | "service" | "classification" | "information"

export type Check = {
  id: string
  group: string
  title: string
  clause: string
  equation: string
  steps: string[]
  result: string
  note: string
  status: CheckStatus
  kind: CheckKind
  /** False for an informative appendix row so it cannot be read as φRu. */
  normative: boolean
  nominal: number | null
  nominalUnit: string
  phi: number | null
  phiSource: string
  designCapacity: number | null
  action: number | null
  utilisation: number | null
}

export type Residual = "SR" | "HR" | "LW" | "CF" | "HW"

export type DesignInput = {
  role: "element" | "web" | null
  clearWidthMm: number | null
  thicknessMm: number | null
  fyMpa: number | null
  fuMpa: number | null
  residual: Residual | null
  edgesSupported: "one" | "both" | null
  stress: "uniform-compression" | "edge-gradient" | "outstand-gradient" | null
  kb: number | null
  widthPath: "primary" | "alternative"
  holes: "none" | "net" | null
  anMm2: number | null
  axial: "none" | "compression" | "tension" | null
  nStarN: number | null
  kt: number | null
  vStarN: number | null
  mStarNmm: number | null
  msNmm: number | null
  rStarN: number | null
  shearMode: "uniform" | "non-uniform" | null
  fvmMpa: number | null
  fvaMpa: number | null
  dpMm: number | null
  twMm: number | null
  d1Mm: number | null
  webGross: "gross" | null
  stiffening: "unstiffened" | "transverse" | "longitudinal" | null
  sMm: number | null
  alphaF: "one" | "flange" | null
  bfoMm: number | null
  tfMm: number | null
  endPanel: boolean
  interaction: "none" | "proportioning" | "section" | null
  afgMm2: number | null
  afnMm2: number | null
  afeMm2: number | null
  dfMm: number | null
  flangeFyMpa: number | null
  flangeFuMpa: number | null
  bearing: "none" | "ic" | "rhs" | null
  bbfMm: number | null
  bbMm: number | null
  bsMm: number | null
  bearingTfMm: number | null
  bearingPlace: "interior" | "end" | null
  flangesRestrained: boolean | null
  deriveWidth: boolean
  stiffener: "none" | "intermediate" | "load-bearing" | "longitudinal" | null
  arrangement: "pair" | "single-plate" | "single-angle" | null
  asMm2: number | null
  fysMpa: number | null
  tsMm: number | null
  besMm: number | null
  isMm4: number | null
  stiffenerLe: "0.7d1" | "d1" | null
  outerStiffened: boolean
  soleTorsion: boolean
  torsionDepthMm: number | null
  torsionTfMm: number | null
  fMemberN: number | null
  longWhere: "none" | "compression" | "neutral" | "both" | null
  d2Mm: number | null
  asLongMm2: number | null
  isLongMm4: number | null
  openings: "none" | "open" | null
  lwMm: number | null
  openingStiffened: boolean
  plasticWeb: boolean
  webBound: "both-flanges" | "one-free" | null
  appendixI: boolean
  nwN: number | null
  mwNmm: number | null
  rwN: number | null
  vwN: number | null
  modulusMpa: number | null
  fnN: number | null
  fpN: number | null
  mpNmm: number | null
  eccMm: number | null
  endPost: boolean
  endGapMm: number | null
  aepMm2: number | null
  weldKnPerMm: number | null
}

export function designDefaults(): DesignInput {
  return {
    role: null,
    clearWidthMm: null,
    thicknessMm: null,
    fyMpa: null,
    fuMpa: null,
    residual: null,
    edgesSupported: null,
    stress: null,
    kb: null,
    widthPath: "primary",
    holes: null,
    anMm2: null,
    axial: null,
    nStarN: null,
    kt: null,
    vStarN: null,
    mStarNmm: null,
    msNmm: null,
    rStarN: null,
    shearMode: null,
    fvmMpa: null,
    fvaMpa: null,
    dpMm: null,
    twMm: null,
    d1Mm: null,
    webGross: null,
    stiffening: null,
    sMm: null,
    alphaF: null,
    bfoMm: null,
    tfMm: null,
    endPanel: false,
    interaction: null,
    afgMm2: null,
    afnMm2: null,
    afeMm2: null,
    dfMm: null,
    flangeFyMpa: null,
    flangeFuMpa: null,
    bearing: null,
    bbfMm: null,
    bbMm: null,
    bsMm: null,
    bearingTfMm: null,
    bearingPlace: null,
    flangesRestrained: null,
    deriveWidth: false,
    stiffener: null,
    arrangement: null,
    asMm2: null,
    fysMpa: null,
    tsMm: null,
    besMm: null,
    isMm4: null,
    stiffenerLe: null,
    outerStiffened: false,
    soleTorsion: false,
    torsionDepthMm: null,
    torsionTfMm: null,
    fMemberN: null,
    longWhere: null,
    d2Mm: null,
    asLongMm2: null,
    isLongMm4: null,
    openings: null,
    lwMm: null,
    openingStiffened: false,
    plasticWeb: false,
    webBound: null,
    appendixI: false,
    nwN: null,
    mwNmm: null,
    rwN: null,
    vwN: null,
    modulusMpa: null,
    fnN: null,
    fpN: null,
    mpNmm: null,
    eccMm: null,
    endPost: false,
    endGapMm: null,
    aepMm2: null,
    weldKnPerMm: null,
  }
}

export function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—"
  const abs = Math.abs(n)
  if (abs !== 0 && (abs >= 1e5 || abs < 1e-3)) return n.toExponential(4)
  return String(Number(n.toFixed(digits)))
}

export function kn(n: number): string {
  return `${fmt(n / 1000, 3)} kN`
}

const PHI_SOURCE: Record<string, string> = {
  shear: "Table 3.4 — web in shear, Clauses 5.11 and 5.12, φ = 0.90",
  bearing: "Table 3.4 — web in bearing, Clause 5.13, φ = 0.90",
  stiffener: "Table 3.4 — stiffener, Clauses 5.14, 5.15 and 5.16, φ = 0.90",
  compression: "Table 3.4 — axial compression, Clauses 6.1, 6.2 and 6.3, φ = 0.90. This row is section capacity Ns. Member Nc is not evaluated.",
  tension: "Table 3.4 — axial tension, Clauses 7.1 and 7.2, φ = 0.90",
  bending: "Table 3.4 — bending, Clauses 5.1, 5.2, 5.3 and 5.6, φ = 0.90",
}

export function phiOf(kind: keyof typeof PHI_SOURCE): { phi: number; source: string } {
  return { phi: 0.9, source: `AS 4100:2020 ${PHI_SOURCE[kind]}` }
}

export function blankCheck(partial: {
  id: string
  group: string
  title: string
  clause: string
  equation: string
  steps?: string[]
  result: string
  note: string
  status: CheckStatus
  kind?: CheckKind
  normative?: boolean
  nominal?: number | null
  nominalUnit?: string
  phi?: number | null
  phiSource?: string
  designCapacity?: number | null
  action?: number | null
  utilisation?: number | null
}): Check {
  return {
    kind: partial.kind ?? "strength",
    normative: partial.normative ?? true,
    steps: partial.steps ?? [],
    nominal: partial.nominal ?? null,
    nominalUnit: partial.nominalUnit ?? "",
    phi: partial.phi ?? null,
    phiSource: partial.phiSource ?? "",
    designCapacity: partial.designCapacity ?? null,
    action: partial.action ?? null,
    utilisation: partial.utilisation ?? null,
    ...partial,
  }
}

export function blocks(check: Check): boolean {
  if (!check.normative) return false
  if (check.kind === "service") return false
  return check.status === "fail" || check.status === "data-required" || check.status === "not-checked" || check.status === "invalid" || check.status === "out-of-scope"
}

export function pos(n: number | null): n is number {
  return n != null && Number.isFinite(n) && n > 0
}

export function utilisation(action: number, design: number): { ratio: number; status: CheckStatus } {
  if (!(design > 0) || !Number.isFinite(action)) return { ratio: Number.NaN, status: "invalid" }
  const ratio = action / design
  return { ratio, status: ratio <= 1 ? "pass" : "fail" }
}
