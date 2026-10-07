/** Design-check statuses. A missing table is data-required, not a number. */

export type CheckStatus =
  | "available"
  | "data-required"
  | "not-applicable"
  | "out-of-scope"
  | "source-required"
  | "pass"
  | "fail"
  | "not-checked"
  | "invalid"

export type CodeRow = {
  id: string
  group: string
  title: string
  standard: string
  edition: string
  clause: string
  dataset: string
  status: CheckStatus
  equation: string
  substitution: string
  result: string
  note: string
}

/** Verified AS 4100 numbers only. An absent key is not zero and is not a resistance. */
export const AS4100_DATA: Record<string, number> = {}

export function readNumber(table: Record<string, number>, key: string): number | null {
  const value = table[key]
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function elasticFence(standard: string): CodeRow {
  return {
    id: "elastic-fence",
    group: "LAYERS",
    title: "Elastic critical stress is not a design resistance",
    standard,
    edition: "—",
    clause: "—",
    dataset: "none",
    status: "not-applicable",
    equation: "σcr, τcr and λFEM stay in the elastic layer",
    substitution: "No design factor is applied to the eigenvalue.",
    result: "NOT A DESIGN CAPACITY",
    note: "Layer 3 does not read FEM λ as Rd. A missing code row does not invent one.",
  }
}
