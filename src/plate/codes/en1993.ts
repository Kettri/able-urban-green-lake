import type { CodeRow } from "./adapter.ts"
import { elasticFence } from "./adapter.ts"

export type En1993Input = {
  stiffenerCount: number
  hasPatch: boolean
}

/** EN 1993-1-5 slots. No reduction factor, no table and no National Annex value is stored. */
export function en1993PlateChecks(input: En1993Input): CodeRow[] {
  const row = (
    id: string,
    group: string,
    title: string,
    clause: string,
    status: CodeRow["status"],
    equation: string,
    note: string,
  ): CodeRow => ({
    id,
    group,
    title,
    standard: "EN 1993-1-5",
    edition: "EN 1993-1-5",
    clause,
    dataset: "none — no National Annex and no reduction table",
    status,
    equation,
    substitution: "No verified EN 1993-1-5 number is in the adapter.",
    result: status === "not-applicable" ? "NOT APPLICABLE" : "VERIFIED STANDARD DATA REQUIRED",
    note,
  })
  return [
    elasticFence("EN 1993-1-5"),
    row("plate-buckling", "PLATE BUCKLING", "Internal compression element", "4.4 / 4.5", "data-required", "ρ from the plate slenderness curve", "Not transcribed. AS 4100 factors are not used here."),
    row("effective-width", "EFFECTIVE WIDTH", "Effective area of a Class 4 plate", "4.4", "data-required", "beff = ρ b", "Not transcribed."),
    row("shear", "SHEAR BUCKLING", "Shear resistance", "5", "data-required", "η and χw", "Not transcribed. Elastic τcr is not this resistance."),
    row("longitudinal", "LONGITUDINALLY STIFFENED PANEL", "Reduced stress or effective section", "4.5", input.stiffenerCount > 0 ? "data-required" : "not-applicable", "Column-like and plate-like behaviour", input.stiffenerCount > 0 ? "Stiffeners exist in the model. The clause is not transcribed." : "No longitudinal stiffener in the model."),
    row("transverse", "TRANSVERSE STIFFENER", "Stiffness and strength", "9", input.stiffenerCount > 0 ? "data-required" : "not-applicable", "Minimum second moment and force resistance", "Not transcribed."),
    row("patch", "PATCH LOADING", "Local transverse force", "6", input.hasPatch ? "data-required" : "not-applicable", "χF Fcr", input.hasPatch ? "The drawn patch is an elastic load, not this check." : "No patch load in the model."),
    row("interaction", "INTERACTION", "Combined direct, shear and transverse force", "7", "data-required", "Interaction expressions of Section 7", "Not transcribed. No AS 4100 interaction is substituted."),
  ]
}
