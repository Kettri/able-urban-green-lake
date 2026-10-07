export type FrictionPreset = {
  id: string
  label: string
  /** Typical nut factor. Null means the user must type it. */
  k: number | null
  note: string
}

/** Order-of-magnitude nut factors. Not a test of a coating or a lubricant brand. */
export const FRICTION_PRESETS: FrictionPreset[] = [
  { id: "dry", label: "Dry / as-received", k: 0.2, note: "Textbook dry or as-received order of magnitude." },
  { id: "oiled", label: "Lightly oiled", k: 0.18, note: "Textbook light-oil order of magnitude." },
  { id: "machine-oil", label: "Machine oil", k: 0.15, note: "Textbook oiled order of magnitude." },
  { id: "antiseize", label: "Anti-seize", k: 0.12, note: "Often lower. Brand data governs." },
  { id: "moly", label: "Molybdenum lubricant", k: 0.12, note: "Often lower. Do not reuse a dry K." },
  { id: "zinc", label: "Zinc plated", k: 0.2, note: "Plating alone is not a lubricant specification." },
  { id: "hdg", label: "Hot-dip galvanised", k: 0.25, note: "Often higher, and over-tapping of the nut matters." },
  { id: "ss-dry", label: "Stainless, dry", k: 0.3, note: "Galling risk. A dry stainless K is a poor installation plan." },
  { id: "ss-lube", label: "Stainless, lubricated", k: 0.16, note: "Still an estimate. Use the lubricant maker's data." },
  { id: "user", label: "User-defined", k: null, note: "No coefficient is assumed." },
]

export const TORQUE_WARNING =
  "This is an estimated preload from torque, not a verified bolt tension. Friction takes most of the torque. Coating, lubricant, finish, reuse, the nut and the washer can move the result by a large amount. For a controlled joint, use the manufacturer or a tested procedure."

export type TorqueInput = {
  dMm: number
  pitchMm: number
  d2Mm: number
  asMm2: number
  basisMPa: number
  basisName: string
  percent: number | null
  manualKn: number | null
  k: number | null
  torqueNm: number | null
  muThread: number | null
  muBearing: number | null
  bearingOdMm: number | null
  bearingIdMm: number | null
}

export type TorqueStep = { label: string; equation: string; substitution: string; result: string }

export type TorqueOk = {
  ok: true
  proofKn: number
  fromPercentKn: number | null
  fromTorqueKn: number | null
  torqueFromPreloadNm: number | null
  percentOfProof: number | null
  threadNm: number | null
  bearingNm: number | null
  advancedNm: number | null
  kFromAdvanced: number | null
  steps: TorqueStep[]
}

export type TorqueFail = { ok: false; reason: string }

function finite(n: number | null): n is number {
  return n != null && Number.isFinite(n)
}

export function boltTorque(input: TorqueInput): TorqueOk | TorqueFail {
  if (!(input.dMm > 0) || !(input.pitchMm > 0) || !(input.d2Mm > 0) || !(input.asMm2 > 0)) {
    return { ok: false, reason: "Diameter, pitch and stress area are required." }
  }
  if (!(input.basisMPa > 0)) return { ok: false, reason: "No proof or yield-related stress is available for this bolt." }
  if (input.percent != null && (!(input.percent > 0) || input.percent > 100)) {
    return { ok: false, reason: "Preload percentage must be greater than 0 and at most 100." }
  }
  if (input.k != null && !(input.k > 0)) return { ok: false, reason: "Nut factor K must be greater than zero." }
  if (input.manualKn != null && !(input.manualKn > 0)) return { ok: false, reason: "Target preload must be greater than zero." }
  if (input.torqueNm != null && !(input.torqueNm > 0)) return { ok: false, reason: "Torque must be greater than zero." }

  const proofN = input.basisMPa * input.asMm2
  const proofKn = proofN / 1000
  const steps: TorqueStep[] = [
    {
      label: input.basisName,
      equation: "Proof or reference load = stress × As",
      substitution: `${input.basisMPa} MPa × ${input.asMm2.toFixed(2)} mm²`,
      result: `${proofKn.toFixed(2)} kN`,
    },
  ]

  const fromPercentKn = input.percent == null ? null : (input.percent / 100) * proofKn
  if (fromPercentKn != null && input.percent != null) {
    steps.push({
      label: "Target from percent",
      equation: "F = (percent / 100) × proof load",
      substitution: `${input.percent}% × ${proofKn.toFixed(2)} kN`,
      result: `${fromPercentKn.toFixed(2)} kN`,
    })
  }

  const targetKn = input.manualKn ?? fromPercentKn
  let torqueFromPreloadNm: number | null = null
  if (targetKn != null && finite(input.k)) {
    const forceN = targetKn * 1000
    torqueFromPreloadNm = (input.k * forceN * input.dMm) / 1000
    steps.push({
      label: "T from preload",
      equation: "T = K × F × d",
      substitution: `${input.k} × ${forceN.toFixed(0)} N × ${input.dMm} mm / 1000`,
      result: `${torqueFromPreloadNm.toFixed(2)} N·m`,
    })
  }

  let fromTorqueKn: number | null = null
  if (finite(input.torqueNm) && finite(input.k)) {
    const forceN = (input.torqueNm * 1000) / (input.k * input.dMm)
    fromTorqueKn = forceN / 1000
    steps.push({
      label: "F from torque",
      equation: "F = T / (K × d)",
      substitution: `${input.torqueNm} N·m / (${input.k} × ${input.dMm} mm)`,
      result: `${fromTorqueKn.toFixed(2)} kN`,
    })
  }

  const referenceKn = input.manualKn ?? fromPercentKn ?? fromTorqueKn
  const percentOfProof = referenceKn == null ? null : (referenceKn / proofKn) * 100

  let threadNm: number | null = null
  let bearingNm: number | null = null
  let advancedNm: number | null = null
  let kFromAdvanced: number | null = null
  const advancedAsked = input.muThread != null || input.muBearing != null || input.bearingOdMm != null || input.bearingIdMm != null
  if (advancedAsked) {
    if (!finite(input.muThread) || !finite(input.muBearing) || !(input.muThread > 0) || !(input.muBearing > 0) || input.muThread >= 1 || input.muBearing >= 1) {
      return { ok: false, reason: "Thread and bearing friction must each be greater than 0 and less than 1." }
    }
    if (!finite(input.bearingOdMm) || !finite(input.bearingIdMm) || !(input.bearingOdMm > input.bearingIdMm)) {
      return { ok: false, reason: "Bearing outside diameter must be greater than the inside diameter. Nothing is assumed for the washer." }
    }
    if (referenceKn == null) return { ok: false, reason: "The split torque needs a target preload first." }
    const forceN = referenceKn * 1000
    const lambda = Math.atan(input.pitchMm / (Math.PI * input.d2Mm))
    const rho = Math.atan(input.muThread / Math.cos(Math.PI / 6))
    threadNm = (forceN * (input.d2Mm / 2) * Math.tan(lambda + rho)) / 1000
    bearingNm = (forceN * input.muBearing * ((input.bearingOdMm + input.bearingIdMm) / 4)) / 1000
    advancedNm = threadNm + bearingNm
    kFromAdvanced = advancedNm / (forceN * input.dMm / 1000)
    steps.push(
      {
        label: "Thread torque",
        equation: "T_thread = F × (d2/2) × tan(λ + ρ′), tan λ = P/(π d2), tan ρ′ = μ_th/cos 30°",
        substitution: `F = ${forceN.toFixed(0)} N, d2 = ${input.d2Mm.toFixed(3)} mm, μ_th = ${input.muThread}`,
        result: `${threadNm.toFixed(2)} N·m`,
      },
      {
        label: "Bearing torque",
        equation: "T_bearing = F × μ_b × (OD + ID) / 4",
        substitution: `μ_b = ${input.muBearing}, OD = ${input.bearingOdMm} mm, ID = ${input.bearingIdMm} mm`,
        result: `${bearingNm.toFixed(2)} N·m`,
      },
    )
  }

  return {
    ok: true,
    proofKn,
    fromPercentKn,
    fromTorqueKn,
    torqueFromPreloadNm,
    percentOfProof,
    threadNm,
    bearingNm,
    advancedNm,
    kFromAdvanced,
    steps,
  }
}
