export type Notation = "eng" | "sci" | "fixed"

export function formatValue(value: number, sig: number, notation: Notation): string {
  if (!Number.isFinite(value)) return "—"
  const figures = Math.min(8, Math.max(1, sig))
  if (value === 0) return notation === "fixed" ? (0).toFixed(figures) : "0"
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (notation === "fixed") {
    return sign + abs.toFixed(figures)
  }
  if (notation === "sci") {
    const exp = Math.floor(Math.log10(abs))
    const mant = abs / 10 ** exp
    return `${sign}${mant.toFixed(Math.max(0, figures - 1))}e${exp}`
  }
  let exp = Math.floor(Math.log10(abs))
  if (!Number.isFinite(exp)) return "—"
  const eng = Math.floor(exp / 3) * 3
  const mant = abs / 10 ** eng
  const mantExp = Math.floor(Math.log10(mant))
  const decimals = Math.max(0, figures - mantExp - 1)
  const body = mant.toFixed(decimals)
  if (eng === 0) return sign + body
  return `${sign}${body}e${eng}`
}

/** Enough digits to round-trip typical engineering values back through parse. */
export function precise(value: number): string {
  if (!Number.isFinite(value)) return ""
  if (value === 0) return "0"
  return value.toPrecision(12).replace(/\.?0+e/, "e").replace(/\.?0+$/, "")
}
