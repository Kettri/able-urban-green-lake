import { PROPERTY_CLASSES } from "./materials.ts"

export type ProvenanceKind = "calculated" | "reference-nominal" | "typical-product" | "unavailable"

export type Provenance = {
  sourceType: ProvenanceKind
  sourceStandard: string
  edition: string
  clause: string
  note: string
}

export const PROFILE_PROVENANCE: Provenance = {
  sourceType: "calculated",
  sourceStandard: "ISO 68-1 basic profile / ISO 898-1 stress area",
  edition: "formula, not a table extract",
  clause: "H = (√3/2)P; d2 = d − 3√3 P/8; d1 = d − 5√3 P/8; As = π/4 ((d2+d3)/2)²",
  note: "Calculated from the basic 60° profile. Not a copy of ISO 724.",
}

export const CLASS_PROVENANCE: Provenance = {
  sourceType: "reference-nominal",
  sourceStandard: "ISO 898-1 property class system",
  edition: "confirm current edition",
  clause: "class designation (fu and yield ratio), with the usual 8.8 diameter split",
  note: "Nominal minimums. Not a verbatim standard table. Do not treat fy, fu and proof stress as interchangeable.",
}

export const HEX_PROVENANCE: Provenance = {
  sourceType: "typical-product",
  sourceStandard: "Typical commercial ISO hexagon product",
  edition: "not an ISO 4014/4017 extract",
  clause: "across flats s and head height k",
  note: "Typical product dimensions for a hexagon head. Older DIN hexagons can differ (M22 was 32 mm). Confirm before fabrication.",
}

export type MetricSize = {
  d: number
  coarse: number
  fine: number[]
  /** Typical hex across flats and head height. Omitted where not verified. */
  hex?: { s: number; k: number }
}

const HEX: Record<number, { s: number; k: number }> = {
  3: { s: 5.5, k: 2 },
  4: { s: 7, k: 2.8 },
  5: { s: 8, k: 3.5 },
  6: { s: 10, k: 4 },
  8: { s: 13, k: 5.3 },
  10: { s: 16, k: 6.4 },
  12: { s: 18, k: 7.5 },
  14: { s: 21, k: 8.8 },
  16: { s: 24, k: 10 },
  18: { s: 27, k: 11.5 },
  20: { s: 30, k: 12.5 },
  22: { s: 34, k: 14 },
  24: { s: 36, k: 15 },
  27: { s: 41, k: 17 },
  30: { s: 46, k: 18.7 },
  33: { s: 50, k: 21 },
  36: { s: 55, k: 22.5 },
  42: { s: 65, k: 26 },
  48: { s: 75, k: 30 },
  56: { s: 85, k: 35 },
  64: { s: 95, k: 40 },
}

const COARSE: Record<number, number> = {
  3: 0.5, 4: 0.7, 5: 0.8, 6: 1, 7: 1, 8: 1.25, 10: 1.5, 12: 1.75, 14: 2, 16: 2,
  18: 2.5, 20: 2.5, 22: 2.5, 24: 3, 27: 3, 30: 3.5, 33: 3.5, 36: 4, 39: 4,
  42: 4.5, 45: 4.5, 48: 5, 52: 5, 56: 5.5, 60: 5.5, 64: 6, 68: 6, 72: 6, 80: 6, 90: 6, 100: 6,
}

const FINE: Record<number, number[]> = {
  8: [1],
  10: [1.25, 1],
  12: [1.5, 1.25, 1],
  14: [1.5],
  16: [1.5],
  18: [2, 1.5],
  20: [2, 1.5],
  22: [2, 1.5],
  24: [2],
  27: [2],
  30: [3, 2],
  33: [2],
  36: [3],
  39: [3],
  42: [3],
  48: [3],
  56: [4],
  64: [4],
}

export const METRIC_SIZES: MetricSize[] = Object.keys(COARSE)
  .map(Number)
  .sort((a, b) => a - b)
  .map((d) => ({
    d,
    coarse: COARSE[d] ?? 0,
    fine: FINE[d] ?? [],
    hex: HEX[d],
  }))

export type UnifiedSize = {
  label: string
  inch: number
  unc?: number
  unf?: number
  unef?: number
}

export const UNIFIED_SIZES: UnifiedSize[] = [
  { label: "1/4", inch: 0.25, unc: 20, unf: 28 },
  { label: "5/16", inch: 0.3125, unc: 18, unf: 24 },
  { label: "3/8", inch: 0.375, unc: 16, unf: 24 },
  { label: "7/16", inch: 0.4375, unc: 14, unf: 20 },
  { label: "1/2", inch: 0.5, unc: 13, unf: 20, unef: 28 },
  { label: "9/16", inch: 0.5625, unc: 12, unf: 18 },
  { label: "5/8", inch: 0.625, unc: 11, unf: 18, unef: 24 },
  { label: "3/4", inch: 0.75, unc: 10, unf: 16, unef: 20 },
  { label: "7/8", inch: 0.875, unc: 9, unf: 14, unef: 20 },
  { label: "1", inch: 1, unc: 8, unf: 12, unef: 20 },
  { label: "1-1/8", inch: 1.125, unc: 7, unf: 12 },
  { label: "1-1/4", inch: 1.25, unc: 7, unf: 12 },
  { label: "1-1/2", inch: 1.5, unc: 6, unf: 12 },
  { label: "1-3/4", inch: 1.75, unc: 5 },
  { label: "2", inch: 2, unc: 4.5 },
]

export type StandardDef = {
  id: string
  family: string
  name: string
  system: "metric" | "unified"
  series?: "unc" | "unf" | "unef"
  classes: string[] | "all"
  /** Millimetres, or null for every metric size. */
  metricDiameters: number[] | null
  minInch?: number
  design: "as4100" | "none"
  note: string
}

const ALL_CLASSES = PROPERTY_CLASSES.map((item) => item.id)
const STRUCTURAL_D = [12, 16, 20, 24, 30, 36]
const PRECISION_D = METRIC_SIZES.filter((size) => size.d <= 64).map((size) => size.d)
const COMMERCIAL_D = METRIC_SIZES.filter((size) => size.d >= 5 && size.d <= 64).map((size) => size.d)

export const STANDARDS: StandardDef[] = [
  {
    id: "iso-metric",
    family: "ISO",
    name: "ISO metric",
    system: "metric",
    classes: "all",
    metricDiameters: null,
    design: "as4100",
    note: "ISO 4014 / 4017 / 4032 / 4762 product geometry is not embedded except typical hexagon s and k. Thread data is the calculated basic profile. Property classes are ISO 898-1 nominal minimums.",
  },
  {
    id: "as1110",
    family: "AU",
    name: "AS/NZS 1110.1",
    system: "metric",
    classes: ["8.8", "10.9", "12.9"],
    metricDiameters: PRECISION_D,
    design: "as4100",
    note: "Precision hexagon bolts, product grades A and B (ISO 4014 type). Usual classes 8.8, 10.9 and 12.9. Diameters here are M3 to M64. This is not a copy of the AS/NZS 1110 tables — s and k are typical hexagon sizes, and tolerances, thread length and product grade are not embedded.",
  },
  {
    id: "as1111",
    family: "AU",
    name: "AS 1111.1",
    system: "metric",
    classes: ["4.6", "4.8"],
    metricDiameters: COMMERCIAL_D,
    design: "as4100",
    note: "Commercial hexagon bolts, product grade C. Usual classes 4.6 and 4.8. Diameters here are M5 to M64. This is not a copy of the AS 1111 tables — s and k are typical hexagon sizes. Grade C tolerances are wider and are not embedded.",
  },
  {
    id: "as1252",
    family: "AU",
    name: "AS/NZS 1252.1",
    system: "metric",
    classes: ["8.8"],
    metricDiameters: STRUCTURAL_D,
    design: "as4100",
    note: "High-strength structural bolting assemblies. This dataset holds 8.8 and the usual diameter set only. Assembly marking, k-class and preload procedure are not embedded.",
  },
  {
    id: "as4100",
    family: "AU",
    name: "AS 4100 bolting context",
    system: "metric",
    classes: ["4.6", "8.8", "10.9"],
    metricDiameters: null,
    design: "as4100",
    note: "A design-context entry, not a product standard. 4.6, 8.8 and 10.9 only. Product bolts are AS/NZS 1110.1, AS 1111.1 or AS/NZS 1252.1. This sheet does not run a design check.",
  },
  {
    id: "en14399",
    family: "EN",
    name: "EN 14399",
    system: "metric",
    classes: ["8.8", "10.9"],
    metricDiameters: STRUCTURAL_D,
    design: "none",
    note: "HR/HV system geometry, nut marking and preload are not in this dataset. Metric thread geometry and ISO property class only. No EN design capacity is returned.",
  },
  {
    id: "en15048",
    family: "EN",
    name: "EN 15048",
    system: "metric",
    classes: ["4.6", "8.8", "10.9"],
    metricDiameters: null,
    design: "none",
    note: "Non-preloaded structural assemblies. Product requirements are not embedded. No EN design capacity is returned.",
  },
  {
    id: "unc",
    family: "ASME",
    name: "Unified UNC",
    system: "unified",
    series: "unc",
    classes: [],
    metricDiameters: null,
    design: "none",
    note: "Basic Unified profile calculated from nominal diameter and TPI. SAE J429 and ASTM strength data are not in the verified dataset.",
  },
  {
    id: "unf",
    family: "ASME",
    name: "Unified UNF",
    system: "unified",
    series: "unf",
    classes: [],
    metricDiameters: null,
    design: "none",
    note: "Fine Unified thread. Strength data is not in the verified dataset.",
  },
  {
    id: "unef",
    family: "ASME",
    name: "Unified UNEF",
    system: "unified",
    series: "unef",
    classes: [],
    metricDiameters: null,
    design: "none",
    note: "Extra-fine Unified thread, only where a TPI is in this dataset.",
  },
  {
    id: "astm-inch",
    family: "ASTM",
    name: "ASTM structural inch",
    system: "unified",
    series: "unc",
    classes: [],
    metricDiameters: null,
    minInch: 0.5,
    design: "none",
    note: "Thread geometry for common UNC diameters from 1/2 in. F3125 (historical A325 / A490 names) strength tables are not embedded. No design capacity is returned.",
  },
]

export function standardById(id: string): StandardDef | undefined {
  return STANDARDS.find((item) => item.id === id)
}

export function classesFor(standard: StandardDef): string[] {
  if (standard.classes === "all") return ALL_CLASSES
  return standard.classes
}

export function metricSizesFor(standard: StandardDef): MetricSize[] {
  if (standard.metricDiameters == null) return METRIC_SIZES
  const allow = new Set(standard.metricDiameters)
  return METRIC_SIZES.filter((size) => allow.has(size.d))
}

export function unifiedSizesFor(standard: StandardDef): UnifiedSize[] {
  return UNIFIED_SIZES.filter((size) => {
    const tpi = standard.series ? size[standard.series] : size.unc
    if (tpi == null) return false
    if (standard.minInch != null && size.inch < standard.minInch) return false
    return true
  })
}

export function metricLabel(d: number): string {
  return `M${d}`
}
