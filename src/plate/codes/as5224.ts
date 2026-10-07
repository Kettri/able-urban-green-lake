import type { CodeRow } from "./adapter.ts"
import { elasticFence } from "./adapter.ts"

/** AS 5224 / ISO 20332 adapter. The workbench stays a general panel. No crane resistance is stored. */
export function as5224PlateChecks(): CodeRow[] {
  const row = (id: string, title: string, clause: string): CodeRow => ({
    id,
    group: "CRANE PLATED CHECKS",
    title,
    standard: "AS 5224 / ISO 20332",
    edition: "AS 5224 / ISO 20332",
    clause,
    dataset: "none — no resistance table",
    status: "data-required",
    equation: "Standard expression not transcribed",
    substitution: "No verified AS 5224 or ISO 20332 number is in the adapter.",
    result: "VERIFIED STANDARD DATA REQUIRED",
    note: "This does not turn the panel model into a crane girder. A girder preset is not connected.",
  })
  return [
    elasticFence("AS 5224 / ISO 20332"),
    row("plate", "Plated element local buckling", "ISO 20332 plated members"),
    row("web", "Web panel", "ISO 20332 web"),
    row("stiffener", "Stiffener on a plated member", "ISO 20332 stiffener"),
    row("patch", "Local load introduction", "ISO 20332 local load"),
  ]
}
