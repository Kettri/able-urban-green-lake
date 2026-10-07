import { as4100PlateChecks, type As4100Input } from "./as4100.ts"
import { as5224PlateChecks } from "./as5224.ts"
import { elasticFence, type CodeRow } from "./adapter.ts"
import { en1993PlateChecks } from "./en1993.ts"

export type DesignMethod = "none" | "as4100" | "en1993" | "as5224"

export const DESIGN_METHODS: { id: DesignMethod; label: string }[] = [
  { id: "none", label: "NONE — ELASTIC ANALYSIS ONLY" },
  { id: "as4100", label: "AS 4100" },
  { id: "en1993", label: "EN 1993-1-5" },
  { id: "as5224", label: "AS 5224 / ISO 20332" },
]

export function designChecks(method: DesignMethod, input: As4100Input & { hasPatch: boolean }): CodeRow[] {
  if (method === "as4100") return as4100PlateChecks(input)
  if (method === "en1993") return en1993PlateChecks({ stiffenerCount: input.stiffenerCount, hasPatch: input.hasPatch })
  if (method === "as5224") return as5224PlateChecks()
  return [elasticFence("NONE")]
}
