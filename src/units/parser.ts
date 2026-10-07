import { lookupAlias, type UnitDef } from "./definitions.ts"
import { parseStrictNumber } from "../reference/format.ts"

export type ParsedQuantity = {
  value: number
  unit: UnitDef
  to?: UnitDef
}

function normaliseToken(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .replace(/μ/g, "µ")
    .replace(/\s+/g, "")
    .replace(/·/g, ".")
}

export function parseQuantity(raw: string): ParsedQuantity | null {
  const text = raw.trim()
  if (!text) return null
  const toSplit = text.split(/\s+to\s+/i)
  const left = toSplit[0] ?? ""
  const right = toSplit[1]
  const match = left.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(.*)$/i)
  if (!match) return null
  const value = parseStrictNumber(match[1] ?? "")
  const token = normaliseToken(match[2] ?? "")
  if (!token) return null
  const unit = lookupAlias(token)
  if (!unit) return null
  let to: UnitDef | undefined
  if (right?.trim()) {
    const toUnit = lookupAlias(normaliseToken(right))
    if (!toUnit) return null
    to = toUnit
  }
  return { value, unit, to }
}
