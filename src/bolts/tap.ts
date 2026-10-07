import { threadProfile } from "./threadGeometry.ts"

/** Fraction of the ISO 68-1 major-to-basic-minor height. 1 is the basic minor diameter. */
export function tapDrill(dMm: number, pitchMm: number, percent: number) {
  if (!(percent > 0) || percent > 100) throw new Error("Thread percentage must be between 0 and 100.")
  const profile = threadProfile(dMm, pitchMm)
  const full = profile.d - profile.d1
  const drill = profile.d - (percent / 100) * full
  return {
    drillMm: drill,
    basicMinorMm: profile.d1,
    shopEstimateMm: profile.d - profile.P,
    percent,
    note: "Calculated from the basic profile. Percent is the fraction of (d − d1), not a US percentage-of-thread chart and not a stock-drill list. d − P is the common shop estimate, shown separately.",
  }
}

/**
 * Length of engagement that balances bolt tension against internal-thread shear.
 * Shear area taken as 0.5 π d Le. Shear strength taken as 0.5 × fu of the tapped part.
 * Calculated estimate. Not a standard minimum.
 */
export function engagementLength(asMm2: number, dMm: number, fuBolt: number, fuInternal: number) {
  if (!(asMm2 > 0) || !(dMm > 0) || !(fuBolt > 0) || !(fuInternal > 0)) {
    throw new Error("Engagement needs a positive area, diameter and both strengths.")
  }
  const length = (4 * asMm2 * fuBolt) / (Math.PI * dMm * fuInternal)
  return {
    lengthMm: length,
    ruleOfThumbMm: dMm,
    note: "Calculated for equal strength on the assumptions above. A shop rule of thumb is about one diameter in steel into steel. Neither replaces the tapped-part standard.",
  }
}

export function drawingCallout(dMm: number, pitchMm: number, mediumHole: number | null) {
  const size = `${trim(dMm)} × ${trim(pitchMm)}`
  return {
    external: `M${size} — 6g`,
    internal: `M${size} — 6H`,
    clearance: mediumHole == null ? null : `Ø${trim(mediumHole)} THRU`,
    note: "6g and 6H are the usual ISO 965 general-purpose classes. Limit deviations are not calculated. The hole line is a plain diameter note, not a company drafting standard. Coarse threads may also be written without the pitch; the pitch is kept here so a fine thread is not lost.",
  }
}

function trim(n: number) {
  return String(Math.round(n * 1000) / 1000)
}
