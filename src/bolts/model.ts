import { AREA_NOTE, areas } from "./areas.ts"
import { boltCapacity, optionalNumber, type CapacityFail, type CapacityOk } from "./capacities.ts"
import {
  CLASS_PROVENANCE,
  HEX_PROVENANCE,
  PROFILE_PROVENANCE,
  classesFor,
  metricLabel,
  metricSizesFor,
  standardById,
  unifiedSizesFor,
  type StandardDef,
} from "./database.ts"
import { approximateBoltMass } from "./mass.ts"
import { classBand, classById } from "./materials.ts"
import { threadsPerInch } from "./threadGeometry.ts"
import { parseBoltQuery, type BoltQuery } from "./search.ts"

export type Selection = {
  standardId: string
  sizeLabel: string
  pitchMm: number
  classId: string
}

export const DEFAULT_SELECTION: Selection = {
  standardId: "iso-metric",
  sizeLabel: "M20",
  pitchMm: 2.5,
  classId: "8.8",
}

export type PitchOption = { pitchMm: number; label: string; series: string }

export function pitchOptions(standard: StandardDef, sizeLabel: string): PitchOption[] {
  if (standard.system === "metric") {
    const size = metricSizesFor(standard).find((item) => metricLabel(item.d) === sizeLabel)
    if (!size) return []
    const options: PitchOption[] = [{ pitchMm: size.coarse, label: `${size.coarse} coarse`, series: "coarse" }]
    for (const pitch of size.fine) options.push({ pitchMm: pitch, label: `${pitch} fine`, series: "fine" })
    return options
  }
  const size = unifiedSizesFor(standard).find((item) => item.label === sizeLabel)
  if (!size || !standard.series) return []
  const tpi = size[standard.series]
  if (tpi == null) return []
  return [{ pitchMm: 25.4 / tpi, label: `${tpi} TPI`, series: standard.series }]
}

export function sizeLabels(standard: StandardDef): string[] {
  if (standard.system === "metric") return metricSizesFor(standard).map((size) => metricLabel(size.d))
  return unifiedSizesFor(standard).map((size) => size.label)
}

export function classOptions(standard: StandardDef, dMm: number): string[] {
  return classesFor(standard).filter((id) => classBand(id, dMm) != null)
}

function diameterOf(standard: StandardDef, sizeLabel: string): number | null {
  if (standard.system === "metric") {
    const size = metricSizesFor(standard).find((item) => metricLabel(item.d) === sizeLabel)
    return size?.d ?? null
  }
  const size = unifiedSizesFor(standard).find((item) => item.label === sizeLabel)
  return size ? size.inch * 25.4 : null
}

export function clampSelection(partial: Selection): Selection | { error: string } {
  const standard = standardById(partial.standardId)
  if (!standard) return { error: "This combination is not contained in the current verified dataset." }
  const labels = sizeLabels(standard)
  const sizeLabel = labels.includes(partial.sizeLabel) ? partial.sizeLabel : labels[0]
  if (!sizeLabel) return { error: "This combination is not contained in the current verified dataset." }
  const pitches = pitchOptions(standard, sizeLabel)
  const pitch = pitches.find((item) => Math.abs(item.pitchMm - partial.pitchMm) < 1e-6) ?? pitches[0]
  if (!pitch) return { error: "This combination is not contained in the current verified dataset." }
  const d = diameterOf(standard, sizeLabel)
  if (d == null) return { error: "This combination is not contained in the current verified dataset." }
  const classes = classOptions(standard, d)
  const classId = classes.includes(partial.classId) ? partial.classId : (classes[0] ?? "")
  return { standardId: standard.id, sizeLabel, pitchMm: pitch.pitchMm, classId }
}

export function selectionFromQuery(query: BoltQuery, fallback: Selection = DEFAULT_SELECTION): Selection | { error: string } {
  if (!query.matched) return { error: "No bolt matched that search." }
  const standardId = query.standardId ?? fallback.standardId
  const standard = standardById(standardId)
  if (!standard) return { error: "This combination is not contained in the current verified dataset." }
  if (query.system && query.system !== standard.system && query.standardId == null) {
    return { error: "This combination is not contained in the current verified dataset." }
  }
  return clampSelection({
    standardId,
    sizeLabel: query.sizeLabel ?? fallback.sizeLabel,
    pitchMm: query.pitchMm ?? fallback.pitchMm,
    classId: query.classId ?? fallback.classId,
  })
}

export function selectionFromSlug(slug: string): Selection | { error: string } {
  const text = decodeURIComponent(slug).replace(/-/g, " ")
  return selectionFromQuery(parseBoltQuery(text))
}

export type SheetInput = Selection & {
  lengthMm: string
  threadedMm: string
  nn: string
  nx: string
  lj: string
  nStar: string
  vStar: string
  tp: string
  fup: string
  ae: string
  qty: string
}

export type Sheet = {
  error: string | null
  title: string
  subtitle: string
  standardName: string
  standardNote: string
  dMm: number
  pitchMm: number
  series: string
  designation: string
  profile: ReturnType<typeof areas> | null
  tpi: number | null
  band: { fu: number; fy: number; sp: number } | null
  classNote: string | null
  hex: { s: number; k: number; e: number } | null
  holeNote: string | null
  holeMm: number | null
  capacity: CapacityOk | CapacityFail | null
  massKg: number | null
  massEachG: number | null
  massNote: string
  gripMm: number | null
  gripNote: string
  areaNote: string
  profileProvenance: typeof PROFILE_PROVENANCE
  classProvenance: typeof CLASS_PROVENANCE
  hexProvenance: typeof HEX_PROVENANCE
}

function readOptional(raw: string, label: string): { value: number | null; error: string | null } {
  try {
    const value = optionalNumber(raw)
    return { value, error: null }
  } catch (error) {
    return { value: null, error: error instanceof Error ? `${label}: ${error.message}` : `${label} is invalid.` }
  }
}

export function buildSheet(input: SheetInput): Sheet {
  const standard = standardById(input.standardId)
  const empty: Sheet = {
    error: "This combination is not contained in the current verified dataset.",
    title: "—",
    subtitle: "",
    standardName: standard?.name ?? "—",
    standardNote: standard?.note ?? "",
    dMm: 0,
    pitchMm: 0,
    series: "",
    designation: "—",
    profile: null,
    tpi: null,
    band: null,
    classNote: null,
    hex: null,
    holeNote: null,
    holeMm: null,
    capacity: null,
    massKg: null,
    massEachG: null,
    massNote: "",
    gripMm: null,
    gripNote: "",
    areaNote: AREA_NOTE,
    profileProvenance: PROFILE_PROVENANCE,
    classProvenance: CLASS_PROVENANCE,
    hexProvenance: HEX_PROVENANCE,
  }
  if (!standard) return empty
  const dMm = diameterOf(standard, input.sizeLabel)
  const pitches = pitchOptions(standard, input.sizeLabel)
  const pitch = pitches.find((item) => Math.abs(item.pitchMm - input.pitchMm) < 1e-6)
  if (dMm == null || !pitch) return empty
  let profile
  try {
    profile = areas(dMm, pitch.pitchMm)
  } catch (error) {
    return { ...empty, error: error instanceof Error ? error.message : "Invalid geometry." }
  }
  const band = input.classId ? classBand(input.classId, dMm) : null
  const cls = classById(input.classId)
  const metricSize = standard.system === "metric"
    ? metricSizesFor(standard).find((item) => metricLabel(item.d) === input.sizeLabel)
    : undefined
  const hex = metricSize?.hex
    ? { ...metricSize.hex, e: metricSize.hex.s / Math.cos(Math.PI / 6) }
    : null
  const classLabel = band ? input.classId : ""
  const designation = standard.system === "metric"
    ? `${input.sizeLabel} × ${trimPitch(pitch.pitchMm)}${classLabel ? ` — ${classLabel}` : ""}`
    : `${input.sizeLabel}-${standard.series ? unifiedTpi(standard, input.sizeLabel) : ""} ${standard.series?.toUpperCase() ?? ""}`
  const hole = standard.system === "metric"
    ? { holeMm: dMm + (dMm <= 24 ? 2 : 3), holeNote: "Indicative fabrication allowance only — not an AS 4100 table extract. Commonly d+2 mm up to 24 mm and d+3 mm above. Confirm the hole table before a drawing. Oversize and slot are not in this dataset." }
    : { holeMm: null, holeNote: "Inch clearance holes are not in the verified dataset." }

  const length = readOptional(input.lengthMm, "Length")
  const threaded = readOptional(input.threadedMm, "Threaded length")
  const nn = readOptional(input.nn, "nn")
  const nx = readOptional(input.nx, "nx")
  const lj = readOptional(input.lj, "lj")
  const nStar = readOptional(input.nStar, "N*")
  const vStar = readOptional(input.vStar, "V*")
  const tp = readOptional(input.tp, "tp")
  const fup = readOptional(input.fup, "fup")
  const ae = readOptional(input.ae, "ae")
  const qty = readOptional(input.qty, "Quantity")
  const fieldError = [length, threaded, nn, nx, lj, nStar, vStar, tp, fup, ae, qty].find((item) => item.error)?.error ?? null

  let gripMm: number | null = null
  let gripNote = "Threaded length b is tabulated by the product standard for each nominal length and is not embedded. Enter b to subtract it from L."
  if (length.value != null && threaded.value != null) {
    if (threaded.value > length.value) {
      gripNote = "Threaded length cannot exceed bolt length."
    } else if (!(length.value > 0) || !(threaded.value >= 0)) {
      gripNote = "Length must be greater than zero."
    } else {
      gripMm = length.value - threaded.value
      gripNote = "Calculated grip = L − b. b is an entered value, not a standard table."
    }
  }

  let capacity: CapacityOk | CapacityFail | null = null
  if (!fieldError && band && (nn.value != null || input.nn.trim() === "")) {
    const nnN = nn.value ?? 1
    const nxN = nx.value ?? 0
    try {
      capacity = boltCapacity({
        dMm,
        pitchMm: pitch.pitchMm,
        classId: input.classId,
        allowDesign: standard.design === "as4100" && !!band,
        nn: nnN,
        nx: nxN,
        ljMm: lj.value,
        nStar_kN: nStar.value,
        vStar_kN: vStar.value,
        tpMm: tp.value,
        fupMPa: fup.value,
        aeMm: ae.value,
      })
    } catch (error) {
      capacity = { ok: false, reason: error instanceof Error ? error.message : "Capacity failed." }
    }
  } else if (!band) {
    capacity = { ok: false, reason: "Required standard data unavailable. Property class is not in this dataset for the selected standard." }
  }

  let massKg: number | null = null
  let massEachG: number | null = null
  let massNote = "Nut and washer mass are not calculated — those dimensions are not in the verified dataset."
  if (length.error) massNote = length.error
  else if (qty.error) massNote = qty.error
  else {
    const mass = approximateBoltMass(dMm, length.value ?? 0, hex ?? undefined, qty.value == null ? 1 : qty.value)
    massKg = mass.boltKg
    massEachG = mass.boltKg != null && qty.value ? (mass.boltKg / qty.value) * 1000 : mass.boltKg != null ? mass.boltKg * 1000 : null
    massNote = mass.reason
  }

  return {
    error: fieldError,
    title: designation,
    subtitle: pitch.series,
    standardName: standard.name,
    standardNote: standard.note,
    dMm,
    pitchMm: pitch.pitchMm,
    series: pitch.series,
    designation,
    profile,
    tpi: threadsPerInch(pitch.pitchMm),
    band,
    classNote: cls?.note ?? null,
    hex,
    holeMm: hole.holeMm,
    holeNote: hole.holeNote,
    capacity,
    massKg,
    massEachG,
    massNote,
    gripMm,
    gripNote,
    areaNote: AREA_NOTE,
    profileProvenance: PROFILE_PROVENANCE,
    classProvenance: CLASS_PROVENANCE,
    hexProvenance: HEX_PROVENANCE,
  }
}

function trimPitch(pitch: number): string {
  return String(Math.round(pitch * 1000) / 1000)
}

function unifiedTpi(standard: StandardDef, sizeLabel: string): number | null {
  const size = unifiedSizesFor(standard).find((item) => item.label === sizeLabel)
  if (!size || !standard.series) return null
  return size[standard.series] ?? null
}

export function shareSlug(selection: Selection): string {
  const standard = standardById(selection.standardId)
  const coarse = standard?.system === "metric"
    ? metricSizesFor(standard).find((item) => metricLabel(item.d) === selection.sizeLabel)?.coarse
    : undefined
  const pitchPart = coarse != null && Math.abs(coarse - selection.pitchMm) < 1e-6 ? "" : `x${trimPitch(selection.pitchMm)}`
  const cls = selection.classId ? `-${selection.classId}` : ""
  return `${selection.sizeLabel}${pitchPart}${cls}`
}
