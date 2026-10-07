/** Display rounding only. Callers keep full precision for further maths. */
export function trimNum(n: number, digits: number): string {
  if (!Number.isFinite(n)) return "—"
  const neg = n < 0
  const s = Math.abs(n).toFixed(digits)
  const trimmed = s.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "")
  return neg ? `-${trimmed}` : trimmed
}

export function parseStrictNumber(raw: string): number {
  const t = raw.trim().replace(/\s/g, "")
  if (!t) throw new Error("Enter a number.")
  if (/[,]/.test(t)) throw new Error("Invalid numeric string. No thousands separators.")
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(t)) {
    throw new Error("Invalid numeric string.")
  }
  const n = Number(t)
  if (!Number.isFinite(n)) throw new Error("Invalid number.")
  return n
}
