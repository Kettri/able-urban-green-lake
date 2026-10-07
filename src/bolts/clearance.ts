/**
 * ISO 273 nominal clearance holes: fine, medium, coarse.
 * Nominal diameters only. H12 / H13 / H14 are the tolerance grades named by the standard;
 * the limit deviations are not copied here.
 * Sources agree on these nominals (ISO 273 as republished in workshop charts). Not a scan of the ISO PDF.
 */
const ISO_273: Record<number, { fine: number; medium: number; coarse: number }> = {
  3: { fine: 3.2, medium: 3.4, coarse: 3.6 },
  4: { fine: 4.3, medium: 4.5, coarse: 4.8 },
  5: { fine: 5.3, medium: 5.5, coarse: 5.8 },
  6: { fine: 6.4, medium: 6.6, coarse: 7 },
  7: { fine: 7.4, medium: 7.6, coarse: 8 },
  8: { fine: 8.4, medium: 9, coarse: 10 },
  10: { fine: 10.5, medium: 11, coarse: 12 },
  12: { fine: 13, medium: 13.5, coarse: 14.5 },
  14: { fine: 15, medium: 15.5, coarse: 16.5 },
  16: { fine: 17, medium: 17.5, coarse: 18.5 },
  18: { fine: 19, medium: 20, coarse: 21 },
  20: { fine: 21, medium: 22, coarse: 24 },
  22: { fine: 23, medium: 24, coarse: 26 },
  24: { fine: 25, medium: 26, coarse: 28 },
  27: { fine: 28, medium: 30, coarse: 32 },
  30: { fine: 31, medium: 33, coarse: 35 },
  33: { fine: 34, medium: 36, coarse: 38 },
  36: { fine: 37, medium: 39, coarse: 42 },
  39: { fine: 40, medium: 42, coarse: 45 },
  42: { fine: 43, medium: 45, coarse: 48 },
  45: { fine: 46, medium: 48, coarse: 52 },
  48: { fine: 50, medium: 52, coarse: 56 },
  52: { fine: 54, medium: 56, coarse: 62 },
  56: { fine: 58, medium: 62, coarse: 66 },
  60: { fine: 62, medium: 66, coarse: 70 },
  64: { fine: 66, medium: 70, coarse: 74 },
}

export const CLEARANCE_NOTE =
  "ISO 273 nominal clearance hole for the bolt diameter. Fine is the close series, medium is the normal series, coarse is the large series. Pitch does not change the clearance hole. Tolerance limits and countersink or counterbore sizes are not in this dataset."

export function clearanceHoles(dMm: number) {
  const row = ISO_273[dMm]
  if (!row) return null
  return { ...row, source: "ISO 273 nominal" }
}
