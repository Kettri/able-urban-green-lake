export type ClassBand = { fu: number; fy: number; sp: number }

export type PropertyClass = {
  id: string
  /** Nominal minimums at or below the split diameter, where a split exists. */
  base: ClassBand
  /** Applied when diameter is strictly greater than aboveD. */
  above?: { aboveD: number } & ClassBand
  maxD?: number
  note: string
}

/**
 * Nominal minimums associated with the ISO 898-1 property-class system.
 * The 8.8 split (≤16 mm / >16 mm) is the usual published change.
 * Confirm the current edition before design use. Not a verbatim table extract.
 */
export const PROPERTY_CLASSES: PropertyClass[] = [
  { id: "4.6", base: { fu: 400, fy: 240, sp: 225 }, note: "Low-carbon. fu and 0.6 fu yield ratio are the class designation." },
  { id: "4.8", base: { fu: 400, fy: 320, sp: 310 }, note: "fu 400 MPa. Yield ratio 0.8." },
  { id: "5.6", base: { fu: 500, fy: 300, sp: 280 }, note: "fu 500 MPa. Yield ratio 0.6." },
  { id: "5.8", base: { fu: 500, fy: 400, sp: 380 }, note: "fu 500 MPa. Yield ratio 0.8." },
  { id: "6.8", base: { fu: 600, fy: 480, sp: 440 }, note: "fu 600 MPa. Yield ratio 0.8." },
  {
    id: "8.8",
    base: { fu: 800, fy: 640, sp: 580 },
    above: { aboveD: 16, fu: 830, fy: 660, sp: 600 },
    note: "Structural default. fu is 800 MPa at d ≤ 16 mm and 830 MPa above 16 mm.",
  },
  { id: "9.8", base: { fu: 900, fy: 720, sp: 650 }, maxD: 16, note: "Only up to 16 mm in the usual class system." },
  { id: "10.9", base: { fu: 1040, fy: 940, sp: 830 }, note: "fu 1040 MPa. Not interchangeable with 8.8." },
  { id: "12.9", base: { fu: 1220, fy: 1100, sp: 970 }, note: "fu 1220 MPa. Outside the AS 4100 check implemented here." },
]

export function classById(id: string): PropertyClass | undefined {
  return PROPERTY_CLASSES.find((item) => item.id === id)
}

export function classBand(id: string, dMm: number): ClassBand | null {
  const item = classById(id)
  if (!item) return null
  if (item.maxD != null && dMm > item.maxD) return null
  if (item.above && dMm > item.above.aboveD) {
    return { fu: item.above.fu, fy: item.above.fy, sp: item.above.sp }
  }
  return item.base
}

export const STAINLESS_CLASSES = [
  { id: "A2-50", family: "A2", rm: 500, rp: 210, common: "Often sold near 304. Not the same designation." },
  { id: "A2-70", family: "A2", rm: 700, rp: 450, common: "Often sold near 304. Not the same designation." },
  { id: "A2-80", family: "A2", rm: 800, rp: 600, common: "Often sold near 304. Not the same designation." },
  { id: "A4-50", family: "A4", rm: 500, rp: 210, common: "Often sold near 316. Not the same designation." },
  { id: "A4-70", family: "A4", rm: 700, rp: 450, common: "Often sold near 316. Not the same designation." },
  { id: "A4-80", family: "A4", rm: 800, rp: 600, common: "Often sold near 316. Not the same designation." },
] as const

export const STAINLESS_NOTE =
  "ISO 3506-1 austenitic fastener classes. rm is the minimum tensile strength and rp is the minimum 0.2% proof stress, in MPa. These are not carbon-steel property classes and they are not used in the AS 4100 check. Diameter limits and hardness are not embedded — 70 and 80 are not offered in every size. A2 is not every 304 product, and A4 is not every 316 product."
