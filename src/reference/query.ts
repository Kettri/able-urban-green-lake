import { parseBoltQuery } from "../bolts/search.ts"
import { parseQuantity } from "../units/parser.ts"
import type { RouteHit } from "./registry.ts"

export function routeQuery(raw: string): RouteHit {
  const q = raw.trim()
  if (!q) return { module: null }
  let unit = false
  let bolt = false
  try {
    unit = parseQuantity(q) != null
  } catch {
    unit = false
  }
  bolt = parseBoltQuery(q).matched
  if (unit && !bolt) return { module: "units", q }
  if (bolt && !unit) return { module: "bolts", q }
  if (unit) return { module: "units", q }
  if (bolt) return { module: "bolts", q }
  if (/\b(plates?|buckling|stiffeners?)\b/i.test(q)) return { module: "plate", q }
  return { module: null }
}
