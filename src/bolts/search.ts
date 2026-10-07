import { METRIC_SIZES, UNIFIED_SIZES, metricLabel } from "./database.ts"

export type BoltQuery = {
  matched: boolean
  system?: "metric" | "unified"
  series?: "coarse" | "fine" | "unc" | "unf" | "unef"
  sizeLabel?: string
  pitchMm?: number
  classId?: string
  standardId?: string
  focus?: "areas" | "material" | "thread" | "mass" | "capacity" | "geometry"
}

const CLASSES = ["12.9", "10.9", "9.8", "8.8", "6.8", "5.8", "5.6", "4.8", "4.6"]

export function parseBoltQuery(raw: string): BoltQuery {
  const text = raw.trim()
  if (!text) return { matched: false }
  const lower = text.toLowerCase()
  let standardId: string | undefined
  if (/as\s*\/?\s*nzs\s*1252|as\s*1252|\b1252\b/.test(lower)) standardId = "as1252"
  else if (/1111/.test(lower)) standardId = "as1111"
  else if (/1110/.test(lower)) standardId = "as1110"
  else if (/as\s*4100|\b4100\b/.test(lower)) standardId = "as4100"
  else if (/14399/.test(lower)) standardId = "en14399"
  else if (/15048/.test(lower)) standardId = "en15048"
  else if (/astm|a325|a490|f3125/.test(lower)) standardId = "astm-inch"

  let focus: BoltQuery["focus"]
  if (/\b(stress area|root area|tensile area|areas)\b/.test(lower)) focus = "areas"
  if (/proof|fy|fu|property|class/.test(lower)) focus = "material"
  if (/mass|weight/.test(lower)) focus = "mass"
  if (/capacit|shear|tension/.test(lower)) focus = "capacity"
  if (/pitch|thread|tpi/.test(lower)) focus = "thread"
  if (/head|across flat|geometry/.test(lower)) focus = "geometry"

  const classId = CLASSES.find((id) => lower.includes(id))

  const metric = text.match(/M\s*(\d+(?:\.\d+)?)\s*(?:[x×]\s*(\d+(?:\.\d+)?))?/i)
  if (metric) {
    const d = Number(metric[1])
    const size = METRIC_SIZES.find((item) => item.d === d)
    if (!size) return { matched: false }
    const wantsFine = /fine/.test(lower)
    const explicit = metric[2] ? Number(metric[2]) : undefined
    let pitch = explicit
    let series: BoltQuery["series"] = wantsFine ? "fine" : "coarse"
    if (pitch == null && wantsFine) pitch = size.fine[0]
    if (pitch == null) pitch = size.coarse
    if (explicit != null && explicit !== size.coarse) series = "fine"
    return {
      matched: true,
      system: "metric",
      series,
      sizeLabel: metricLabel(d),
      pitchMm: pitch,
      classId,
      standardId: standardId ?? "iso-metric",
      focus,
    }
  }

  const unified = text.match(/(\d+\s*-\s*\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:-| )?(\d+(?:\.\d+)?)?\s*(UNC|UNF|UNEF)/i)
  if (unified) {
    const label = (unified[1] ?? "").replace(/\s/g, "")
    const size = UNIFIED_SIZES.find((item) => item.label.toLowerCase() === label.toLowerCase() || String(item.inch) === label)
    const series = (unified[3] ?? "UNC").toLowerCase() as "unc" | "unf" | "unef"
    if (!size || size[series] == null) return { matched: false }
    const tpi = unified[2] ? Number(unified[2]) : size[series]
    if (tpi !== size[series]) return { matched: false }
    return {
      matched: true,
      system: "unified",
      series,
      sizeLabel: size.label,
      pitchMm: 25.4 / tpi,
      standardId: standardId ?? series,
      focus,
    }
  }

  if (standardId && /bolt|fastener|thread/.test(lower)) {
    return { matched: true, standardId, focus }
  }
  return { matched: false }
}

export function boltSlug(sizeLabel: string, pitchMm: number, coarse: boolean, classId: string | null): string {
  const pitch = coarse ? "" : `x${String(pitchMm).replace(".", "p")}`
  const cls = classId ? `-${classId.replace(".", "p")}` : ""
  return `${sizeLabel}${pitch}${cls}`
}
