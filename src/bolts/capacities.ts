import { areas } from "./areas.ts"
import { classBand } from "./materials.ts"
import { parseStrictNumber } from "../reference/format.ts"

export type Step = {
  id: string
  label: string
  equation: string
  substitution: string
  result: string
  clause: string
}

export type CapacityOk = {
  ok: true
  steps: Step[]
  phi: number
  fu: number
  fy: number
  sp: number
  kr: number
  krd: number
  phiNtf_kN: number
  phiVf_kN: number
  phiVb_kN: number | null
  utilN: number | null
  utilV: number | null
  utilPly: number | null
  utilInteract: number | null
  governing: string
}

export type CapacityFail = { ok: false; reason: string }

const AS4100_CLASSES = new Set(["4.6", "8.8", "10.9"])

/** kr = min(1, max(0.75, 1.075 − lj/4000)), lj in mm. Commonly published AS 4100 lap reduction. */
export function lapFactor(ljMm: number): number {
  if (!Number.isFinite(ljMm) || ljMm < 0) throw new Error("Lap length lj cannot be negative.")
  return Math.min(1, Math.max(0.75, 1.075 - ljMm / 4000))
}

export type CapacityInput = {
  dMm: number
  pitchMm: number
  classId: string
  allowDesign: boolean
  nn: number
  nx: number
  ljMm: number | null
  nStar_kN: number | null
  vStar_kN: number | null
  tpMm: number | null
  fupMPa: number | null
  aeMm: number | null
}

function count(n: number, label: string): number {
  if (!Number.isInteger(n) || n < 0 || n > 6) {
    throw new Error(`${label} must be an integer from 0 to 6.`)
  }
  return n
}

export function boltCapacity(input: CapacityInput): CapacityOk | CapacityFail {
  if (!input.allowDesign) {
    return { ok: false, reason: "Outside implemented standard scope — no design result returned." }
  }
  if (!AS4100_CLASSES.has(input.classId)) {
    return { ok: false, reason: "Outside implemented AS 4100 scope — no design result returned." }
  }
  let nn: number
  let nx: number
  try {
    nn = count(input.nn, "Threaded shear planes nn")
    nx = count(input.nx, "Shank shear planes nx")
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "Invalid shear planes." }
  }
  const band = classBand(input.classId, input.dMm)
  if (!band) {
    return { ok: false, reason: "This combination is not contained in the current verified dataset." }
  }
  let profile
  try {
    profile = areas(input.dMm, input.pitchMm)
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "Invalid geometry." }
  }
  const kr = input.ljMm == null ? 1 : lapFactor(input.ljMm)
  const krd = input.classId === "10.9" && nn > 0 ? 0.83 : 1
  const phi = 0.8
  const Ntf_N = profile.As * band.fu
  const phiNtf_kN = (phi * Ntf_N) / 1000
  const Vf_N = 0.62 * band.fu * krd * kr * (nn * profile.As + nx * profile.Ao)
  const phiVf_kN = (phi * Vf_N) / 1000

  const steps: Step[] = [
    {
      id: "fu",
      label: "fuf",
      equation: "fuf from the ISO 898-1 nominal minimum for this class and diameter",
      substitution: `class ${input.classId}, d = ${input.dMm} mm`,
      result: `${band.fu} MPa`,
      clause: "AS 4100 takes fuf from the bolt standard. fy and proof stress are not used here.",
    },
    {
      id: "as",
      label: "As",
      equation: "As = π/4 ((d2 + d3)/2)²",
      substitution: `d = ${input.dMm} mm, P = ${input.pitchMm} mm`,
      result: `${profile.As.toFixed(2)} mm²`,
      clause: "Tensile stress area, calculated",
    },
    {
      id: "ntf",
      label: "φNtf",
      equation: "φNtf = φ fu As",
      substitution: `0.80 × ${band.fu} × ${profile.As.toFixed(2)} / 1000`,
      result: `${phiNtf_kN.toFixed(3)} kN`,
      clause: "AS 4100 bolt in tension. φ = 0.80.",
    },
    {
      id: "kr",
      label: "kr",
      equation: "kr = min(1.0, max(0.75, 1.075 − lj/4000))",
      substitution: input.ljMm == null ? "lj not entered — kr taken as 1.0" : `lj = ${input.ljMm} mm`,
      result: kr.toFixed(3),
      clause: "AS 4100 lap-length reduction, commonly published form. Confirm the clause.",
    },
    {
      id: "krd",
      label: "krd",
      equation: "krd = 0.83 for 10.9 with threads in a shear plane, otherwise 1.0",
      substitution: `class ${input.classId}, nn = ${nn}`,
      result: krd.toFixed(2),
      clause: "Implemented for 10.9 only. Not taken from another standard's factor set.",
    },
    {
      id: "vf",
      label: "φVf",
      equation: "φVf = φ × 0.62 × fu × krd × kr × (nn As + nx Ao)",
      substitution: `0.80 × 0.62 × ${band.fu} × ${krd} × ${kr.toFixed(3)} × (${nn} × ${profile.As.toFixed(2)} + ${nx} × ${profile.Ao.toFixed(2)}) / 1000`,
      result: `${phiVf_kN.toFixed(3)} kN`,
      clause: "AS 4100 bolt in shear as implemented. Thread plane uses As, shank plane uses Ao.",
    },
  ]

  let phiVb_kN: number | null = null
  const plyTouched = input.tpMm != null || input.fupMPa != null || input.aeMm != null
  if (plyTouched && (input.tpMm == null || input.fupMPa == null)) {
    steps.push({
      id: "ply",
      label: "φVb",
      equation: "φVb = φp min(3.2 df tp fup, ae tp fup)",
      substitution: "tp and fup are both required",
      result: "not returned",
      clause: "Ply bearing inputs are incomplete — no bearing result returned.",
    })
  } else if (input.tpMm != null && input.fupMPa != null) {
    if (!(input.tpMm > 0) || !(input.fupMPa > 0)) {
      return { ok: false, reason: "Ply thickness and fup must be greater than zero." }
    }
    const crush_N = 3.2 * input.dMm * input.tpMm * input.fupMPa
    let govern_N = crush_N
    let sub = `crush 3.2 × ${input.dMm} × ${input.tpMm} × ${input.fupMPa}`
    if (input.aeMm != null) {
      if (!(input.aeMm > 0)) return { ok: false, reason: "ae must be greater than zero." }
      const tear_N = input.aeMm * input.tpMm * input.fupMPa
      govern_N = Math.min(crush_N, tear_N)
      sub += `; tear-out ${input.aeMm} × ${input.tpMm} × ${input.fupMPa}`
    }
    phiVb_kN = (0.9 * govern_N) / 1000
    steps.push({
      id: "ply",
      label: "φVb",
      equation: "φp = 0.90; Vb = min(3.2 df tp fup, ae tp fup)",
      substitution: sub + (input.aeMm == null ? "; ae not entered — tear-out not checked" : ""),
      result: `${phiVb_kN.toFixed(3)} kN`,
      clause: "AS 4100 ply bearing. ae is the term in ae tp fup as your edition defines it. φp is not the bolt factor.",
    })
  }

  const utilN = input.nStar_kN == null ? null : input.nStar_kN / phiNtf_kN
  const utilV = input.vStar_kN == null || phiVf_kN === 0 ? null : input.vStar_kN / phiVf_kN
  const utilPly = input.vStar_kN == null || phiVb_kN == null || phiVb_kN === 0 ? null : input.vStar_kN / phiVb_kN
  let utilInteract: number | null = null
  if (input.nStar_kN != null && input.vStar_kN != null && phiNtf_kN > 0 && phiVf_kN > 0) {
    utilInteract = (input.nStar_kN / phiNtf_kN) ** 2 + (input.vStar_kN / phiVf_kN) ** 2
    steps.push({
      id: "interact",
      label: "η",
      equation: "(N* / φNtf)² + (V* / φVf)²",
      substitution: `(${input.nStar_kN} / ${phiNtf_kN.toFixed(3)})² + (${input.vStar_kN} / ${phiVf_kN.toFixed(3)})²`,
      result: utilInteract.toFixed(3),
      clause: "AS 4100 bearing-type shear plus tension interaction. TF slip is not this check.",
    })
  }

  const candidates: { name: string; value: number }[] = []
  if (utilN != null) candidates.push({ name: "tension", value: utilN })
  if (utilV != null) candidates.push({ name: "bolt shear", value: utilV })
  if (utilPly != null) candidates.push({ name: "ply bearing", value: utilPly })
  if (utilInteract != null) candidates.push({ name: "interaction", value: utilInteract })
  const governing =
    candidates.length === 0
      ? "No applied action — capacities only."
      : candidates.reduce((a, b) => (b.value > a.value ? b : a)).name

  return {
    ok: true,
    steps,
    phi,
    fu: band.fu,
    fy: band.fy,
    sp: band.sp,
    kr,
    krd,
    phiNtf_kN,
    phiVf_kN,
    phiVb_kN,
    utilN,
    utilV,
    utilPly,
    utilInteract,
    governing,
  }
}

export function optionalNumber(raw: string): number | null {
  if (!raw.trim()) return null
  return parseStrictNumber(raw)
}
