export const STEEL_DENSITY = 7850

export type MassResult = {
  boltKg: number | null
  reason: string
  density: number
}

/** Approximate machined volume. Head is a regular hex prism. Thread underfill is ignored. */
export function approximateBoltMass(dMm: number, lengthMm: number, hex: { s: number; k: number } | undefined, qty: number): MassResult {
  if (!(qty > 0) || !Number.isInteger(qty)) {
    return { boltKg: null, reason: "Quantity must be a positive integer.", density: STEEL_DENSITY }
  }
  if (!(lengthMm > 0)) {
    return { boltKg: null, reason: "Enter a bolt length to calculate mass.", density: STEEL_DENSITY }
  }
  if (!hex) {
    return { boltKg: null, reason: "Head dimensions are not in the verified dataset — bolt mass is not estimated.", density: STEEL_DENSITY }
  }
  const shankM3 = (Math.PI / 4) * (dMm / 1000) ** 2 * (lengthMm / 1000)
  const hexAreaM2 = (Math.sqrt(3) / 2) * (hex.s / 1000) ** 2
  const headM3 = hexAreaM2 * (hex.k / 1000)
  const one = (shankM3 + headM3) * STEEL_DENSITY
  return {
    boltKg: one * qty,
    reason: "Approximate calculated mass at 7850 kg/m³. Shank is taken as full diameter over the whole length. Thread underfill, nut and washer are not included. Not a catalogue mass.",
    density: STEEL_DENSITY,
  }
}
