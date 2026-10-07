import { elasticFence, type CheckStatus, type CodeRow } from "./adapter.ts"
import { evaluateAs4100, type Report } from "../standards/as4100/evaluate.ts"
import { AS4100_META, type DesignInput } from "../standards/as4100/shared.ts"

export type As4100Input = {
  aMm: number
  bMm: number
  tMm: number
  fyMpa: number
  edgesSimplySupported: boolean
  stiffenerCount: number
  /** Explicit code input. Panel a and b are not read as clear width. */
  design?: Partial<DesignInput>
}

const EDITION = "2020 incorporating Amendment No. 1"

function summaryStatus(report: Report): CheckStatus {
  if (report.overall === "pass") return "pass"
  if (report.checks.some((row) => row.normative && row.status === "fail")) return "fail"
  if (report.checks.some((row) => row.normative && row.status === "invalid")) return "invalid"
  return "not-checked"
}

/** AS 4100:2020 plate and web checks. Elastic panel sizes stay out of the equations. */
export function as4100PlateChecks(input: As4100Input): CodeRow[] {
  const report = evaluateAs4100(input.design ?? {})
  const rows: CodeRow[] = [
    elasticFence("AS 4100:2020"),
    {
      id: "dimension-fence",
      group: "LAYERS",
      title: "Panel dimensions are not code dimensions",
      standard: "AS 4100:2020",
      edition: EDITION,
      clause: "5.2.2",
      dataset: AS4100_META.dataset,
      status: "not-applicable",
      equation: "b is the clear width defined by the clause, not the FEM panel side",
      substitution: `Elastic panel a = ${input.aMm} mm, b = ${input.bMm} mm, t = ${input.tMm} mm, fy = ${input.fyMpa} MPa, stiffeners drawn = ${input.stiffenerCount}. None of these is copied into b, dp, tw or s.`,
      result: "NOT USED",
      note: "Assign a dimension on the design input before a clause will use it.",
    },
    {
      id: "summary",
      group: "SUMMARY",
      title: "Governing design summary",
      standard: "AS 4100:2020",
      edition: EDITION,
      clause: "Table 3.4",
      dataset: AS4100_META.dataset,
      status: summaryStatus(report),
      equation: "Utilisation = design action / design capacity for the clause that defines the check",
      substitution: `Governing: ${report.governing}. Utilisation: ${report.governingUtil == null ? "—" : report.governingUtil.toFixed(3)}.`,
      result: report.headline,
      note: "A pass covers only the checks that ran. It is not a certified design. φ and γM are not mixed.",
    },
  ]
  for (const check of report.checks) {
    rows.push({
      id: check.id,
      group: check.group,
      title: check.title,
      standard: "AS 4100:2020",
      edition: EDITION,
      clause: check.clause,
      dataset: AS4100_META.dataset,
      status: check.status,
      equation: check.equation,
      substitution: check.steps.length ? check.steps.join(" ") : check.note,
      result: check.result,
      note: [
        check.note,
        check.nominal != null ? `Nominal = ${check.nominal} ${check.nominalUnit}.` : "",
        check.phi != null ? `φ = ${check.phi}. ${check.phiSource}` : "",
        check.designCapacity != null ? `Design capacity = ${check.designCapacity} N.` : "",
        check.action != null ? `Action = ${check.action} N.` : "",
        check.utilisation != null && Number.isFinite(check.utilisation) ? `Utilisation = ${check.utilisation.toFixed(4)}.` : "",
        check.normative ? "" : "Not included in the governing utilisation.",
      ].filter(Boolean).join(" "),
    })
  }
  return rows
}
