import { useEffect, useMemo, useRef, useState } from "react"
import { evaluateAs4100, type Diagram, type Report } from "../plate/standards/as4100/evaluate.ts"
import { staleAssignments, withoutStale, type AssignmentField, type AssignmentLink, type AssignmentSource } from "../plate/standards/as4100/assignment.ts"
import type { Check, DesignInput } from "../plate/standards/as4100/shared.ts"

type Panel = {
  aMm: number | null
  bMm: number | null
  tMm: number | null
  fyMpa: number | null
  fuMpa: number | null
}

type Elastic = {
  sigmaCrMpa: number | null
  tauCrMpa: number | null
  lambda: number | null
} | null

const STATUS: Record<string, string> = {
  pass: "PASS",
  fail: "FAIL",
  "not-applicable": "NOT APPLICABLE",
  "not-checked": "NOT RUN",
  "out-of-scope": "OUTSIDE THIS PLATE CHECK",
  "data-required": "INPUT REQUIRED",
  invalid: "INVALID INPUT",
}

const FIELD_NAME: Record<AssignmentField, string> = {
  clearWidthMm: "Clear width b",
  thicknessMm: "Plate thickness t",
  fyMpa: "Yield stress fy",
  fuMpa: "Tensile strength fu",
  dpMm: "Web depth dp",
  twMm: "Web thickness tw",
  d1Mm: "Clear web depth d1",
}

const SOURCE_NAME: Record<AssignmentSource, string> = {
  aMm: "panel length a",
  bMm: "panel width b",
  tMm: "panel thickness t",
  fyMpa: "panel fy",
  fuMpa: "panel fu",
}

const TOKEN: Record<string, string> = {
  thicknessMm: "plate thickness t",
  clearWidthMm: "clear width b",
  fyMpa: "yield stress fy",
  fuMpa: "tensile strength fu",
  dpMm: "web depth dp",
  twMm: "web thickness tw",
  d1Mm: "clear web depth d1",
  d2Mm: "web depth d2",
  sMm: "transverse stiffener spacing s",
  vStarN: "design shear force V*",
  rStarN: "design bearing force R*",
  nStarN: "design axial force N*",
  kb: "plate buckling coefficient kb",
  kt: "tension correction kt",
  anMm2: "net area An",
  eccMm: "eccentricity e",
  modulusMpa: "modulus E",
  weldKnPerMm: "stiffener weld",
}

function humanize(text: string): string {
  let next = text
  for (const [token, label] of Object.entries(TOKEN)) {
    next = next.replaceAll(`${token} is zero.`, `${label.charAt(0).toUpperCase()}${label.slice(1)} must be greater than zero.`)
    next = next.replaceAll(`${token} is negative.`, `${label.charAt(0).toUpperCase()}${label.slice(1)} cannot be negative.`)
    next = next.replaceAll(`${token} is not a finite number.`, `${label.charAt(0).toUpperCase()}${label.slice(1)} is not a number.`)
  }
  return next
}

function forceText(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "Not entered"
  const kn = n / 1000
  const digits = Math.abs(kn) >= 100 ? 1 : Math.abs(kn) >= 10 ? 2 : 3
  return `${kn.toFixed(digits)} kN`
}

function momentText(nmm: number | null | undefined): string {
  if (nmm == null || !Number.isFinite(nmm)) return "Not entered"
  return `${(nmm / 1e6).toFixed(3)} kN·m`
}

function num(form: Record<string, string>, key: string): number | null {
  const raw = form[key]
  if (raw == null || raw.trim() === "") return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function one<T extends string>(form: Record<string, string>, key: string, allowed: readonly T[]): T | null {
  const value = form[key]
  return allowed.includes(value as T) ? value as T : null
}

export function toDesign(form: Record<string, string>): Partial<DesignInput> {
  const out: Partial<DesignInput> = {}
  const put = <K extends keyof DesignInput>(key: K, value: DesignInput[K] | null) => {
    if (value != null) out[key] = value
  }
  put("role", one(form, "role", ["element", "web"] as const))
  put("residual", one(form, "residual", ["SR", "HR", "LW", "CF", "HW"] as const))
  put("edgesSupported", one(form, "edgesSupported", ["one", "both"] as const))
  put("stress", one(form, "stress", ["uniform-compression", "edge-gradient", "outstand-gradient"] as const))
  put("widthPath", form.widthPath === "alternative" ? "alternative" : null)
  put("holes", one(form, "holes", ["none", "net"] as const))
  put("axial", one(form, "axial", ["none", "compression", "tension"] as const))
  put("shearMode", one(form, "shearMode", ["uniform", "non-uniform"] as const))
  put("webGross", form.webGross === "yes" ? "gross" : null)
  put("stiffening", one(form, "stiffening", ["unstiffened", "transverse", "longitudinal"] as const))
  put("alphaF", one(form, "alphaF", ["one", "flange"] as const))
  put("interaction", one(form, "interaction", ["none", "proportioning", "section"] as const))
  put("bearing", one(form, "bearing", ["none", "ic", "rhs"] as const))
  put("bearingPlace", one(form, "bearingPlace", ["interior", "end"] as const))
  put("stiffener", one(form, "stiffener", ["none", "intermediate", "load-bearing", "longitudinal"] as const))
  put("arrangement", one(form, "arrangement", ["pair", "single-plate", "single-angle"] as const))
  put("stiffenerLe", one(form, "stiffenerLe", ["0.7d1", "d1"] as const))
  put("longWhere", one(form, "longWhere", ["none", "compression", "neutral", "both"] as const))
  put("openings", one(form, "openings", ["none", "open"] as const))
  put("webBound", one(form, "webBound", ["both-flanges", "one-free"] as const))
  if (form.flangesRestrained === "yes") out.flangesRestrained = true
  if (form.flangesRestrained === "no") out.flangesRestrained = false
  if (form.endPanel === "yes") out.endPanel = true
  if (form.deriveWidth === "yes") out.deriveWidth = true
  if (form.outerStiffened === "yes") out.outerStiffened = true
  if (form.soleTorsion === "yes") out.soleTorsion = true
  if (form.plasticWeb === "yes") out.plasticWeb = true
  if (form.openingStiffened === "yes") out.openingStiffened = true
  if (form.appendixI === "yes") out.appendixI = true
  const numbers: [string, keyof DesignInput][] = [
    ["clearWidthMm", "clearWidthMm"], ["thicknessMm", "thicknessMm"], ["fyMpa", "fyMpa"], ["fuMpa", "fuMpa"],
    ["kb", "kb"], ["anMm2", "anMm2"], ["nStarN", "nStarN"], ["kt", "kt"], ["vStarN", "vStarN"],
    ["mStarNmm", "mStarNmm"], ["msNmm", "msNmm"], ["rStarN", "rStarN"], ["fvmMpa", "fvmMpa"], ["fvaMpa", "fvaMpa"],
    ["dpMm", "dpMm"], ["twMm", "twMm"], ["d1Mm", "d1Mm"], ["sMm", "sMm"], ["bfoMm", "bfoMm"], ["tfMm", "tfMm"],
    ["afgMm2", "afgMm2"], ["afnMm2", "afnMm2"], ["afeMm2", "afeMm2"], ["dfMm", "dfMm"],
    ["flangeFyMpa", "flangeFyMpa"], ["flangeFuMpa", "flangeFuMpa"], ["bbfMm", "bbfMm"], ["bbMm", "bbMm"],
    ["bsMm", "bsMm"], ["bearingTfMm", "bearingTfMm"], ["asMm2", "asMm2"], ["fysMpa", "fysMpa"],
    ["tsMm", "tsMm"], ["besMm", "besMm"], ["isMm4", "isMm4"], ["torsionDepthMm", "torsionDepthMm"],
    ["torsionTfMm", "torsionTfMm"], ["fMemberN", "fMemberN"], ["d2Mm", "d2Mm"], ["asLongMm2", "asLongMm2"],
    ["isLongMm4", "isLongMm4"], ["lwMm", "lwMm"], ["nwN", "nwN"], ["mwNmm", "mwNmm"], ["rwN", "rwN"],
    ["vwN", "vwN"], ["modulusMpa", "modulusMpa"], ["fnN", "fnN"], ["fpN", "fpN"], ["mpNmm", "mpNmm"],
    ["eccMm", "eccMm"], ["endGapMm", "endGapMm"], ["aepMm2", "aepMm2"], ["weldKnPerMm", "weldKnPerMm"],
  ]
  for (const [formKey, field] of numbers) {
    const value = num(form, formKey)
    if (value != null) (out as Record<string, number>)[field] = value
  }
  return out
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <details className="infoTip">
      <summary aria-label={title}>ⓘ</summary>
      <p><b>{title}.</b> {text}</p>
    </details>
  )
}

function Pick({ label, value, options, onChange, info }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void; info?: { title: string; text: string } }) {
  return (
    <label className="field">
      <span>{label}{info ? <Info title={info.title} text={info.text} /> : null}</span>
      <select className="toolSelect" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([id, text]) => <option key={id || "unset"} value={id}>{text}</option>)}
      </select>
    </label>
  )
}

function NumField({ label, value, onChange, hint, info, unit, onFocus }: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  info?: { title: string; text: string }
  unit?: string
  onFocus?: () => void
}) {
  return (
    <label className="field">
      <span>{label}{unit ? `, ${unit}` : ""}{info ? <Info title={info.title} text={info.text} /> : null}</span>
      <input className="toolField" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} onFocus={onFocus} />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function stressWords(stress: string): string {
  if (stress === "uniform-compression") return "uniform compression"
  if (stress === "edge-gradient") return "compression at one edge, tension at the other"
  if (stress === "outstand-gradient") return "maximum compression at the free edge"
  return stress === "not selected" ? "stress not selected" : stress
}

function ElementFigure({ diagram }: { diagram: Diagram }) {
  const both = diagram.edges === "both"
  const ratio = diagram.clearMm && diagram.effectiveMm != null && diagram.clearMm > 0
    ? Math.min(1, Math.max(0, diagram.effectiveMm / diagram.clearMm))
    : 1
  const full = diagram.effectiveMm != null && diagram.clearMm != null && Math.abs(diagram.effectiveMm - diagram.clearMm) <= 0.05
  const inset = ((1 - ratio) / 2) * 200
  return (
    <svg viewBox="0 0 280 180" role="img" aria-label="Plate element used for AS 4100" className="convPlot">
      <text x="16" y="16" fontSize="11" fill="#111">{both ? "Both longitudinal edges supported" : diagram.edges === "one" ? "Outstand — one edge supported" : "Edges not selected"}</text>
      <rect x="40" y="28" width="200" height="88" fill="#fff" stroke="#111" />
      {ratio < 0.999 ? <rect x={40 + inset} y="28" width={200 - 2 * inset} height="88" fill="#e4e4de" stroke="#111" /> : null}
      <line x1="40" y1="116" x2="240" y2="116" stroke="#111" strokeWidth="5" />
      <line x1="40" y1="28" x2="240" y2="28" stroke="#111" strokeWidth={both ? 5 : 1.2} strokeDasharray={both ? undefined : "5 4"} />
      <text x="40" y="140" fontSize="11" fill="#111">Gross width b = {diagram.clearMm == null ? "not assigned" : `${diagram.clearMm} mm`}</text>
      <text x="40" y="156" fontSize="11" fill="#111">{diagram.effectiveMm == null ? "Effective width be not calculated" : full ? `Full width effective. be = b = ${diagram.effectiveMm.toFixed(1)} mm` : `Effective width be = ${diagram.effectiveMm.toFixed(1)} mm. Shaded band is be. White strips are ineffective.`}</text>
      <text x="140" y="76" fontSize="11" textAnchor="middle" fill="#111">{stressWords(diagram.stress)}</text>
    </svg>
  )
}

function WebFigure({ active, dp, d1, tw, s, showS }: { active: string | null; dp: string; d1: string; tw: string; s: string; showS: boolean }) {
  const mark = (name: string) => active === name ? 2.4 : 1
  return (
    <svg viewBox="0 0 320 170" role="img" aria-label="Web dimensions" className="convPlot">
      <text x="12" y="16" fontSize="11" fill="#111">Web elevation</text>
      <rect x="70" y="28" width="140" height="10" fill="#111" />
      <rect x="132" y="38" width="16" height="90" fill="#fff" stroke="#111" strokeWidth={mark("tw")} />
      <rect x="70" y="128" width="140" height="10" fill="#111" />
      <line x1="168" y1="38" x2="168" y2="128" stroke="#111" strokeWidth={mark("d1")} />
      <text x="174" y="88" fontSize="11" fill="#111">d1 {d1 || "—"}</text>
      <line x1="118" y1="28" x2="118" y2="138" stroke="#111" strokeWidth={mark("dp")} />
      <text x="78" y="88" fontSize="11" fill="#111">dp {dp || "—"}</text>
      <text x="112" y="86" fontSize="11" fill="#111">tw {tw || "—"}</text>
      {showS ? <text x="12" y="160" fontSize="11" fill="#111" fontWeight={active === "s" ? 700 : 400}>s = {s || "not entered"} mm, transverse stiffener spacing</text> : <text x="12" y="160" fontSize="11" fill="#111">s is hidden until the web is stiffened</text>}
    </svg>
  )
}

function BearingFigure({ active, place }: { active: string | null; place: string }) {
  return (
    <svg viewBox="0 0 320 150" role="img" aria-label="Bearing lengths" className="convPlot">
      <text x="12" y="16" fontSize="11" fill="#111">{place === "end" ? "End bearing" : place === "interior" ? "Interior bearing" : "Bearing lengths"}</text>
      <rect x="40" y="36" width="200" height="8" fill="#111" />
      <rect x="132" y="44" width="16" height="70" fill="#fff" stroke="#111" />
      <line x1="100" y1="28" x2="172" y2="28" stroke="#111" strokeWidth={active === "bbf" ? 2.4 : 1} />
      <text x="108" y="24" fontSize="11" fill="#111">bbf</text>
      <line x1="70" y1="128" x2="210" y2="128" stroke="#111" strokeWidth={active === "bb" ? 2.4 : 1} />
      <text x="124" y="142" fontSize="11" fill="#111">bb</text>
      <text x="230" y="52" fontSize="11" fill="#111">tf</text>
      <text x="230" y="90" fontSize="11" fill="#111">bs under the load</text>
    </svg>
  )
}

function OpeningFigure() {
  return (
    <svg viewBox="0 0 280 140" role="img" aria-label="Opening dimension lw" className="convPlot">
      <text x="12" y="16" fontSize="11" fill="#111">One unstiffened opening</text>
      <rect x="80" y="28" width="16" height="90" fill="#fff" stroke="#111" />
      <rect x="84" y="58" width="8" height="28" fill="#fff" stroke="#111" />
      <text x="110" y="78" fontSize="11" fill="#111">lw, greatest opening dimension</text>
      <text x="110" y="96" fontSize="11" fill="#111">compared with d1</text>
      <text x="12" y="132" fontSize="11" fill="#111">Castellated and stiffened openings are not checked.</text>
    </svg>
  )
}

function StiffenerFigure({ active }: { active: string | null }) {
  return (
    <svg viewBox="0 0 280 120" role="img" aria-label="Stiffener outstand and eccentricity" className="convPlot">
      <line x1="40" y1="20" x2="40" y2="100" stroke="#111" strokeWidth="4" />
      <rect x="40" y="48" width="70" height="8" fill="#fff" stroke="#111" strokeWidth={active === "bes" ? 2.4 : 1} />
      <text x="120" y="56" fontSize="11" fill="#111">bes, outstand from the web face</text>
      <text x="120" y="78" fontSize="11" fill="#111">e is the eccentricity of the force, not modulus E</text>
    </svg>
  )
}

function showResult(row: Check): string {
  if (row.status === "data-required" || row.status === "invalid") return humanize(row.note)
  return humanize(row.result)
}

function groups(checks: Check[]) {
  return {
    applicable: checks.filter((row) => (row.status === "pass" || row.status === "fail") && row.kind !== "information"),
    incomplete: checks.filter((row) => row.normative && (row.status === "data-required" || row.status === "invalid" || row.status === "not-checked")),
    outside: checks.filter((row) => row.status === "out-of-scope"),
    notRun: checks.filter((row) => !row.normative && row.status === "not-checked"),
    na: checks.filter((row) => row.status === "not-applicable"),
  }
}

function Governing({ report }: { report: Report }) {
  const bundled = groups(report.checks)
  const invalid = report.checks.find((row) => row.status === "invalid")
  const ranked = report.checks.filter((row) => row.normative && row.kind === "strength" && (row.status === "pass" || row.status === "fail") && row.utilisation != null && Number.isFinite(row.utilisation))
  ranked.sort((a, b) => (b.utilisation ?? 0) - (a.utilisation ?? 0))
  const top = ranked[0] ?? null
  const slend = report.checks.find((row) => row.id === "slenderness" && row.status === "pass")
  const actionLabel = top?.id === "shear" || top?.id === "interaction" ? "Design shear force, V*" : top?.id === "bearing" ? "Design bearing force, R*" : top?.id === "axial" ? "Design axial force, N*" : "Design action"
  const resistanceLabel = top?.id === "shear" ? "Design shear resistance, φVv" : top?.id === "bearing" ? "Design bearing resistance, φRb" : top?.id === "axial" ? "Design section resistance, φN" : "Design resistance"
  return (
    <div className="govBlock">
      <h3>AS 4100 plate / panel check</h3>
      {invalid ? (
        <>
          <p><b>Invalid input.</b> {humanize(invalid.note)}</p>
          <p>No design resistance was calculated.</p>
        </>
      ) : null}
      {!invalid && bundled.incomplete.length ? (
        <>
          <p><b>Design incomplete.</b> Required before a utilisation can be given:</p>
          <ul>
            {bundled.incomplete.map((row) => (
              <li key={row.id}>
                {row.status === "not-checked" && row.designCapacity != null
                  ? `${row.title}. Capacity is available. Enter the design action to evaluate utilisation.`
                  : `${row.title}. ${humanize(row.note)}`}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {top ? (
        <div className="govGrid">
          <div><span>Governing check</span><b>{top.title}</b></div>
          <div><span>Clause</span><b>{top.clause}</b></div>
          <div><span>{actionLabel}</span><b>{forceText(top.action)}</b></div>
          <div><span>{resistanceLabel}</span><b>{forceText(top.designCapacity)}</b></div>
          <div><span>Utilisation</span><b>{top.utilisation?.toFixed(3)}</b></div>
          <div><span>Status</span><b>{STATUS[top.status]}</b></div>
        </div>
      ) : null}
      {!top && slend ? (
        <div className="govGrid">
          <div><span>Plate classification</span><b>{slend.result.split(";")[0]}</b></div>
          <div><span>Slenderness, λe</span><b>{slend.result.includes("λe") ? slend.result.split("λe")[1]?.replace("=", "").trim() : "—"}</b></div>
          <div><span>Effective width, be</span><b>{report.diagram.effectiveMm == null ? "Not calculated" : `${report.diagram.effectiveMm.toFixed(1)} mm`}</b></div>
          <div><span>Design action</span><b>Not entered</b></div>
          <div><span>Utilisation</span><b>Not evaluated</b></div>
          <div><span>Status</span><b>{bundled.incomplete.length ? "INCOMPLETE" : "CLASSIFIED"}</b></div>
        </div>
      ) : null}
      {!top && !slend && !invalid && !bundled.incomplete.length ? <p>Choose a plate element or a web to start.</p> : null}
      <p className="toolNote">{report.headline}</p>
      <p className="toolNote">Elastic σcr is not this resistance. {report.meta.freeze}.</p>
    </div>
  )
}

function ResultGroups({ report }: { report: Report }) {
  const bundled = groups(report.checks)
  return (
    <>
      {bundled.applicable.length ? (
        <div className="toolTableWrap">
          <p className="toolNote">Applicable checks</p>
          <table className="toolTable">
            <thead><tr><th>Check</th><th>Clause</th><th>Status</th><th>Result</th><th>Utilisation</th></tr></thead>
            <tbody>
              {bundled.applicable.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.clause}</td>
                  <td>{STATUS[row.status]}</td>
                  <td>{showResult(row)}</td>
                  <td>{row.utilisation == null || !Number.isFinite(row.utilisation) ? "—" : row.utilisation.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {bundled.outside.length ? <p className="toolNote">Outside this plate check: {bundled.outside.map((row) => `${row.title} (${row.clause})`).join("; ")}.</p> : null}
      {bundled.notRun.length ? <p className="toolNote">Not run: {bundled.notRun.map((row) => row.title).join(", ")}. These do not govern.</p> : null}
      <details className="quietHelp">
        <summary>Checks not applicable to this configuration: {bundled.na.length}</summary>
        <ul>{bundled.na.map((row) => <li key={row.id}>{row.title}. {row.note}</li>)}</ul>
      </details>
    </>
  )
}

function TraceList({ report }: { report: Report }) {
  return (
    <>
      {report.checks.map((row) => (
        <div className="traceBlock" key={row.id}>
          <p><b>{row.title}</b> — AS 4100:2020 Clause {row.clause}</p>
          <p>Formula. {row.equation}</p>
          {row.steps.map((step, index) => <p key={index}>Substitution. {humanize(step)}</p>)}
          <p>Result. {showResult(row)}</p>
          {row.nominal != null ? <p>Nominal resistance. {row.nominal} {row.nominalUnit}</p> : null}
          {row.phi != null ? <p>Capacity factor. φ = {row.phi}. {row.phiSource}</p> : null}
          {row.designCapacity != null ? <p>Design resistance. {row.designCapacity} N ({forceText(row.designCapacity)})</p> : null}
          {row.action != null ? <p>Design action. {row.action} N ({row.nominalUnit === "N·mm" ? momentText(row.action) : forceText(row.action)})</p> : null}
          {row.utilisation != null && Number.isFinite(row.utilisation) ? <p>Utilisation. {row.utilisation.toFixed(3)}</p> : null}
          <p>Status. {STATUS[row.status]}. {humanize(row.note)}</p>
        </div>
      ))}
    </>
  )
}

export function PlateDesign({ panel, elastic, onDesign, onStatus }: {
  panel: Panel
  elastic: Elastic
  onDesign: (design: Partial<DesignInput>) => void
  onStatus?: (line: string) => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [links, setLinks] = useState<AssignmentLink[]>([])
  const [pane, setPane] = useState<"check" | "advanced" | "report">("check")
  const [active, setActive] = useState<string | null>(null)
  const panelKey = [panel.aMm, panel.bMm, panel.tMm, panel.fyMpa, panel.fuMpa].join("|")
  const stale = useMemo(() => staleAssignments(links, panel), [links, panelKey])
  const design = useMemo(() => withoutStale(toDesign(form), stale), [form, stale])
  const report = useMemo(() => evaluateAs4100(design), [design])
  const sent = useRef("")
  useEffect(() => {
    const key = JSON.stringify(design)
    if (sent.current === key) return
    sent.current = key
    onDesign(design)
  }, [design, onDesign])
  useEffect(() => {
    if (!onStatus) return
    if (!design.role) onStatus("AS 4100 plate check not started. Elastic σcr is not a design resistance.")
    else if (report.checks.some((row) => row.status === "invalid")) onStatus("AS 4100 input is invalid. No design resistance was calculated.")
    else if (report.overall === "pass") onStatus(report.headline)
    else onStatus("AS 4100 design is incomplete. Elastic σcr is not a design resistance.")
  }, [design.role, onStatus, report])

  function set(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setLinks((current) => current.filter((link) => link.field !== key))
  }
  function assignFrom(field: AssignmentField, source: AssignmentSource) {
    const value = panel[source]
    if (value == null || !Number.isFinite(value)) return
    setForm((current) => ({ ...current, [field]: String(value) }))
    setLinks((current) => [...current.filter((link) => link.field !== field), { field, source, captured: value }])
  }
  function unlink(field: AssignmentField) {
    setLinks((current) => current.filter((link) => link.field !== field))
  }
  function chooseRole(role: "element" | "web") {
    setForm((current) => {
      const next: Record<string, string> = { ...current, role }
      if (role === "web") {
        if (!next.bearing) next.bearing = "none"
        if (!next.stiffener) next.stiffener = "none"
        if (!next.openings) next.openings = "none"
        if (!next.interaction) next.interaction = "none"
        if (!next.axial) next.axial = "none"
      }
      return next
    })
    setPane("check")
  }
  function loadWorked(id: "plate" | "slender" | "shear") {
    setLinks([])
    setPane("check")
    if (id === "plate") {
      setForm({
        role: "element", residual: "HR", edgesSupported: "both", stress: "uniform-compression",
        clearWidthMm: "300", thicknessMm: "10", fyMpa: "350", holes: "none", axial: "none",
      })
      return
    }
    if (id === "slender") {
      setForm({
        role: "element", residual: "HW", edgesSupported: "both", stress: "uniform-compression",
        clearWidthMm: "500", thicknessMm: "8", fyMpa: "350", holes: "none", axial: "compression",
      })
      return
    }
    setForm({
      role: "web", fyMpa: "300", dpMm: "800", twMm: "8", d1Mm: "800",
      webGross: "yes", webBound: "both-flanges", stiffening: "unstiffened",
      shearMode: "uniform", vStarN: "400000",
      axial: "none", bearing: "none", stiffener: "none", interaction: "none", openings: "none",
    })
  }
  const text = (key: string) => form[key] ?? ""
  const role = text("role")
  const plate = role === "element"
  const web = role === "web"
  const axial = text("axial")
  const stiffening = text("stiffening")
  const needsS = stiffening === "transverse" || stiffening === "longitudinal"
  const bearingOn = text("bearing") === "ic" || text("bearing") === "rhs"
  const stiffenerOn = text("stiffener") === "intermediate" || text("stiffener") === "load-bearing" || text("stiffener") === "longitudinal"
  const openingOn = text("openings") === "open"
  const interactionOn = text("interaction") === "proportioning" || text("interaction") === "section"
  const linkFor = (field: AssignmentField) => links.find((link) => link.field === field && !stale.some((item) => item.field === field))

  function linkedNumber(field: AssignmentField, source: AssignmentSource, info: { title: string; text: string }, unit = "mm") {
    const link = linkFor(field)
    const panelValue = panel[source]
    const sourceName = SOURCE_NAME[source]
    return (
      <div className="field" key={field}>
        <span>{FIELD_NAME[field]}, {unit === "MPa" ? "MPa" : unit}<Info title={info.title} text={info.text} /></span>
        <div className="sourceChoice">
          <label>
            <input type="radio" name={field} checked={!!link} disabled={panelValue == null} onChange={() => assignFrom(field, source)} />
            <span>Link to {sourceName}{panelValue == null ? " — not on the plate model" : ` = ${panelValue} ${unit}`}</span>
          </label>
          <label>
            <input type="radio" name={field} checked={!link} onChange={() => unlink(field)} />
            <span>Enter manually</span>
          </label>
        </div>
        <input className="toolField" inputMode="decimal" value={text(field)} onFocus={() => setActive(field)} onChange={(event) => set(field, event.target.value)} />
        <small>{link ? `Current: linked to ${sourceName}.` : "Current: entered manually. The plate model is not copied unless you link it."}</small>
      </div>
    )
  }

  const staleText = stale.map((link) => {
    const now = panel[link.source]
    return `${FIELD_NAME[link.field]} was linked to ${SOURCE_NAME[link.source]} = ${link.captured}. ${SOURCE_NAME[link.source].charAt(0).toUpperCase()}${SOURCE_NAME[link.source].slice(1)} is now ${now ?? "blank"}, so the link was removed. Assign it again or enter the value manually.`
  }).join(" ")

  const addChecks = (
    <>
      <p className="toolNote">Add a check only when that condition exists. Leaving it off tells AS 4100 the action is not present. It is not a hidden pass.</p>
      <div className="toolToolbar">
        <button className="toolBtn" type="button" onClick={() => set("bearing", bearingOn ? "none" : "ic")}>{bearingOn ? "LOCAL LOAD ON" : "ADD LOCAL LOAD"}</button>
        <button className="toolBtn" type="button" onClick={() => set("openings", openingOn ? "none" : "open")}>{openingOn ? "OPENING ON" : "ADD OPENING"}</button>
        <button className="toolBtn" type="button" onClick={() => set("stiffener", stiffenerOn ? "none" : "intermediate")}>{stiffenerOn ? "STIFFENER DESIGN ON" : "ADD STIFFENER DESIGN"}</button>
        <button className="toolBtn" type="button" onClick={() => set("interaction", interactionOn ? "none" : "section")}>{interactionOn ? "BENDING INTERACTION ON" : "ADD BENDING AND SHEAR"}</button>
        <button className="toolBtn" type="button" onClick={() => set("appendixI", text("appendixI") === "yes" ? "" : "yes")}>{text("appendixI") === "yes" ? "APPENDIX I ON" : "ADD APPENDIX I"}</button>
      </div>
    </>
  )

  const plateFields = plate ? (
    <div className="fieldGrid compact">
      <Pick label="Residual stress" value={text("residual")} onChange={(value) => set("residual", value)} info={{ title: "Residual stress", text: "Table 5.2 fabrication class. HW is heavily welded longitudinally. LW is lightly welded longitudinally. It is not the edge restraint. Source: manual." }} options={[["", "Required"], ["SR", "SR — stress relieved"], ["HR", "HR — hot-rolled"], ["LW", "LW — lightly welded"], ["CF", "CF — cold-formed"], ["HW", "HW — heavily welded"]]} />
      <Pick label="Longitudinal edges" value={text("edgesSupported")} onChange={(value) => set("edgesSupported", value)} options={[["", "Required"], ["both", "Both supported"], ["one", "One supported — outstand"]]} />
      <Pick label="Stress" value={text("stress")} onChange={(value) => set("stress", value)} options={[["", "Required"], ["uniform-compression", "Uniform compression"], ["edge-gradient", "Compression at one edge, tension at the other"], ["outstand-gradient", "Maximum compression at the free edge"]]} />
      {linkedNumber("clearWidthMm", "bMm", { title: "Clear width, b", text: "Clear width between the faces of supporting plates, or the clear outstand. Not the panel length or width until you link it. AS 4100 Clause 5.2.2. Source: model link or manual." })}
      {linkedNumber("thicknessMm", "tMm", { title: "Plate thickness, t", text: "Thickness of this flat element. Source: model link or manual." })}
      {linkedNumber("fyMpa", "fyMpa", { title: "Yield stress, fy", text: "Design yield stress in MPa. Above 690 MPa is outside AS 4100. Source: model link or manual." }, "MPa")}
      <Pick label="Holes" value={text("holes")} onChange={(value) => set("holes", value)} options={[["", "Not stated"], ["none", "No holes"], ["net", "Net area entered"]]} />
      {text("holes") === "net" ? <NumField label="Net area, An" unit="mm²" value={text("anMm2")} onChange={(value) => set("anMm2", value)} info={{ title: "Net area, An", text: "Area across the holes. If An is larger than the gross area the check stops. AS 4100 Clause 6.2.1. Source: manual." }} /> : null}
      {(text("holes") === "net" || axial === "tension") ? linkedNumber("fuMpa", "fuMpa", { title: "Tensile strength, fu", text: "Used for fracture and for the hole-reduction test. Source: model link or manual." }, "MPa") : null}
      <Pick label="Design axial force" value={text("axial")} onChange={(value) => set("axial", value)} options={[["", "Required — none, compression or tension"], ["none", "No axial force"], ["compression", "Compression"], ["tension", "Tension"]]} />
      {axial === "compression" || axial === "tension" ? <NumField label="Design axial force, N*" unit="N" value={text("nStarN")} onChange={(value) => set("nStarN", value)} hint="Compression positive. Enter tension as a negative number." /> : null}
      {axial === "tension" ? <NumField label="Tension correction, kt" value={text("kt")} onChange={(value) => set("kt", value)} info={{ title: "kt", text: "Connection correction in Clause 7.3. It is not assumed to be 1. Source: manual." }} /> : null}
      <Pick label="Effective width method" value={text("widthPath")} onChange={(value) => set("widthPath", value)} options={[["", "Primary — be = b (λey/λe)"], ["alternative", "Alternative — kb entered"]]} />
      {text("widthPath") === "alternative" ? <NumField label="Plate buckling coefficient, kb" value={text("kb")} onChange={(value) => set("kb", value)} info={{ title: "kb", text: "kb is the plate buckling coefficient for the alternative width in Clause 6.2.4. kb is not σcr and is not the FEM eigenvalue λ. Source: manual." }} hint="kb is not σcr and is not the FEM eigenvalue λ." /> : null}
    </div>
  ) : null

  const webFields = web ? (
    <>
      <WebFigure active={active} dp={text("dpMm")} d1={text("d1Mm")} tw={text("twMm")} s={text("sMm")} showS={needsS} />
      <div className="fieldGrid compact">
        {linkedNumber("dpMm", "bMm", { title: "Web depth for shear, dp", text: "Depth used in the shear slenderness. Clause 5.11. Not the panel width until you link it. Source: model link or manual." })}
        {linkedNumber("twMm", "tMm", { title: "Web thickness, tw", text: "Web thickness. Source: model link or manual." })}
        {linkedNumber("d1Mm", "bMm", { title: "Clear web depth, d1", text: "Clear depth between flanges, fillets ignored. Clauses 5.10 and 5.15. Source: model link or manual." })}
        {linkedNumber("fyMpa", "fyMpa", { title: "Yield stress, fy", text: "Design yield stress of the web, MPa. Source: model link or manual." }, "MPa")}
        <Pick label="Gross web area, Aw" value={text("webGross")} onChange={(value) => set("webGross", value)} options={[["", "Required"], ["yes", "Gross web — no holes"]]} />
        <Pick label="Web edges" value={text("webBound")} onChange={(value) => set("webBound", value)} options={[["", "Required"], ["both-flanges", "Flanges both sides"], ["one-free", "One edge free"]]} />
        <Pick label="Stiffening" value={text("stiffening")} onChange={(value) => set("stiffening", value)} options={[["", "Required"], ["unstiffened", "Unstiffened"], ["transverse", "Transverse stiffeners"], ["longitudinal", "Longitudinal stiffener"]]} />
        {needsS ? <NumField label="Transverse stiffener spacing, s" unit="mm" value={text("sMm")} onChange={(value) => set("sMm", value)} onFocus={() => setActive("s")} info={{ title: "Spacing, s", text: "Centre-to-centre spacing of transverse stiffeners. Not read from the FEM lines. Source: manual." }} /> : null}
        <Pick label="Shear distribution" value={text("shearMode")} onChange={(value) => set("shearMode", value)} options={[["", "Required"], ["uniform", "Approximately uniform"], ["non-uniform", "Non-uniform"]]} />
        <NumField label="Design shear force, V*" unit="N" value={text("vStarN")} onChange={(value) => set("vStarN", value)} hint={text("vStarN") ? `Shown as ${forceText(num(form, "vStarN"))}.` : "Enter V* to evaluate utilisation."} />
        {text("shearMode") === "non-uniform" ? <NumField label="Maximum web shear stress, f*vm" unit="MPa" value={text("fvmMpa")} onChange={(value) => set("fvmMpa", value)} info={{ title: "f*vm", text: "Maximum shear stress for non-uniform shear. Clause 5.11.3. Leave unused when shear is uniform. Source: manual." }} /> : null}
        {text("shearMode") === "non-uniform" ? <NumField label="Average web shear stress, f*va" unit="MPa" value={text("fvaMpa")} onChange={(value) => set("fvaMpa", value)} info={{ title: "f*va", text: "Average shear stress for non-uniform shear. Clause 5.11.3. Source: manual." }} /> : null}
        {needsS ? <Pick label="End panel" value={text("endPanel")} onChange={(value) => set("endPanel", value)} options={[["", "No — interior panel"], ["yes", "Yes — αd = 1"]]} /> : null}
        {needsS && stiffening !== "longitudinal" ? <Pick label="Flange restraint, αf" value={text("alphaF")} onChange={(value) => set("alphaF", value)} info={{ title: "αf", text: "1.0, or the flange formula when there is no longitudinal stiffener. Clause 5.11.5.2. Source: manual." }} options={[["", "Not selected"], ["one", "αf = 1.0"], ["flange", "From the flange"]]} /> : null}
        {text("alphaF") === "flange" ? <NumField label="Flange width used for αf, bfo" unit="mm" value={text("bfoMm")} onChange={(value) => set("bfoMm", value)} info={{ title: "bfo", text: "Already the least of the three lengths in Clause 5.11.5.2(b). Source: manual." }} /> : null}
        {text("alphaF") === "flange" ? <NumField label="Flange thickness, tf" unit="mm" value={text("tfMm")} onChange={(value) => set("tfMm", value)} /> : null}
      </div>
      <p className="toolNote">Axial force: {axial === "none" ? "none" : axial || "not stated"}. Local load, opening, stiffener design and bending interaction stay off until you add them.</p>
    </>
  ) : null

  const specialist = (
    <div className="fieldGrid compact">
      {bearingOn ? (
        <>
          <BearingFigure active={active} place={text("bearingPlace")} />
          <Pick label="Bearing type" value={text("bearing")} onChange={(value) => set("bearing", value)} options={[["ic", "I or C web"], ["rhs", "RHS — not implemented"], ["none", "No local load"]]} />
          {text("bearing") === "rhs" ? <p className="toolNote">RHS bearing is outside this plate check. No RHS resistance is calculated.</p> : null}
          {text("bearing") === "ic" ? <NumField label="Dispersed bearing length, bbf" unit="mm" value={text("bbfMm")} onChange={(value) => set("bbfMm", value)} onFocus={() => setActive("bbf")} info={{ title: "bbf", text: "Length after dispersion through the flange. Figure 5.13.1.1. Source: manual, or derived when that option is on." }} /> : null}
          {text("bearing") === "ic" ? <NumField label="Web bearing length, bb" unit="mm" value={text("bbMm")} onChange={(value) => set("bbMm", value)} onFocus={() => setActive("bb")} info={{ title: "bb", text: "Bearing length at the web, interior or end as selected. Source: manual or derived." }} /> : null}
          {text("bearing") === "ic" ? <NumField label="Stiff bearing length, bs" unit="mm" value={text("bsMm")} onChange={(value) => set("bsMm", value)} info={{ title: "bs", text: "Length of the stiff bearing. Source: manual." }} /> : null}
          {text("bearing") === "ic" ? <NumField label="Flange thickness for dispersion, tf" unit="mm" value={text("bearingTfMm")} onChange={(value) => set("bearingTfMm", value)} /> : null}
          {text("bearing") === "ic" ? <Pick label="Load position" value={text("bearingPlace")} onChange={(value) => set("bearingPlace", value)} options={[["", "Not selected"], ["interior", "Interior"], ["end", "End"]]} /> : null}
          {text("bearing") === "ic" ? <Pick label="Bearing lengths" value={text("deriveWidth")} onChange={(value) => set("deriveWidth", value)} options={[["", "Enter bbf and bb"], ["yes", "Derive from Figure 5.13.1.1"]]} /> : null}
          {text("bearing") === "ic" ? <Pick label="Flange restraint" value={text("flangesRestrained")} onChange={(value) => set("flangesRestrained", value)} options={[["", "Not stated"], ["yes", "Both flanges — le/r = 2.5 d1/tw"], ["no", "Only one flange — le/r = 5.0 d1/tw"]]} /> : null}
          {text("bearing") === "ic" ? <NumField label="Design bearing force, R*" unit="N" value={text("rStarN")} onChange={(value) => set("rStarN", value)} hint="Not the elastic patch load." /> : null}
        </>
      ) : null}
      {openingOn ? (
        <>
          <OpeningFigure />
          <NumField label="Opening dimension, lw" unit="mm" value={text("lwMm")} onChange={(value) => set("lwMm", value)} info={{ title: "lw", text: "Greatest horizontal or vertical dimension of one unstiffened opening. Clause 5.10.7. Castellated and stiffened openings are not checked. Source: manual." }} />
          <Pick label="Member longitudinally stiffened" value={text("openingStiffened")} onChange={(value) => set("openingStiffened", value)} info={{ title: "Longitudinal stiffening of the member", text: "Changes the opening limit from 0.10 to 0.33. It does not mean the opening itself is stiffened." }} options={[["", "No — lw/d1 ≤ 0.10"], ["yes", "Yes — lw/d1 ≤ 0.33"]]} />
        </>
      ) : null}
      {stiffenerOn ? (
        <>
          <StiffenerFigure active={active} />
          <Pick label="Stiffener design" value={text("stiffener")} onChange={(value) => set("stiffener", value)} options={[["intermediate", "Intermediate transverse"], ["load-bearing", "Load-bearing"], ["longitudinal", "Longitudinal"], ["none", "Not included"]]} />
          <Pick label="Arrangement" value={text("arrangement")} onChange={(value) => set("arrangement", value)} options={[["", "Not selected"], ["pair", "Pair"], ["single-plate", "Single plate"], ["single-angle", "Single angle"]]} />
          <NumField label="Stiffener area, As" unit="mm²" value={text("asMm2")} onChange={(value) => set("asMm2", value)} info={{ title: "As", text: "Area of the stiffener outstand, not including the web strip unless the clause says so. Source: manual." }} />
          <NumField label="Stiffener yield, fys" unit="MPa" value={text("fysMpa")} onChange={(value) => set("fysMpa", value)} hint="If fys differs from fy, the Section 6 check stops." />
          <NumField label="Stiffener thickness, ts" unit="mm" value={text("tsMm")} onChange={(value) => set("tsMm", value)} />
          <NumField label="Outstanding width, bes" unit="mm" value={text("besMm")} onChange={(value) => set("besMm", value)} onFocus={() => setActive("bes")} info={{ title: "bes", text: "Outstanding width from the face of the web. Clause 5.14.3. Source: manual." }} />
          <NumField label="Second moment, Is" unit="mm⁴" value={text("isMm4")} onChange={(value) => set("isMm4", value)} hint="About the web centreline, stiffener only." />
          <Pick label="Effective length, le" value={text("stiffenerLe")} onChange={(value) => set("stiffenerLe", value)} options={[["", "Not stated"], ["0.7d1", "0.7 d1"], ["d1", "d1"]]} />
          <Pick label="Outer edge continuously stiffened" value={text("outerStiffened")} onChange={(value) => set("outerStiffened", value)} options={[["", "No"], ["yes", "Yes"]]} />
          {text("stiffener") === "longitudinal" ? <NumField label="Twice the compression-flange distance, d2" unit="mm" value={text("d2Mm")} onChange={(value) => set("d2Mm", value)} info={{ title: "d2", text: "Twice the clear distance from the neutral axis to the compression flange. Clause 5.16. Source: manual." }} /> : null}
          {text("stiffener") === "longitudinal" ? <Pick label="Longitudinal position" value={text("longWhere")} onChange={(value) => set("longWhere", value)} options={[["", "Not selected"], ["compression", "Compression region, 0.2 d2"], ["neutral", "Neutral axis"], ["both", "Both"], ["none", "Not required"]]} /> : null}
          {text("stiffener") === "longitudinal" ? <NumField label="Longitudinal area, As" unit="mm²" value={text("asLongMm2")} onChange={(value) => set("asLongMm2", value)} /> : null}
          {text("stiffener") === "longitudinal" ? <NumField label="Longitudinal second moment, Is" unit="mm⁴" value={text("isLongMm4")} onChange={(value) => set("isLongMm4", value)} hint="About the face of the web." /> : null}
          <NumField label="Stiffener weld" unit="kN/mm" value={text("weldKnPerMm")} onChange={(value) => set("weldKnPerMm", value)} />
          <Pick label="End post" value={text("endPost")} onChange={(value) => set("endPost", value)} options={[["", "No"], ["yes", "Yes"]]} />
          {text("endPost") === "yes" ? <NumField label="End gap, e" unit="mm" value={text("endGapMm")} onChange={(value) => set("endGapMm", value)} info={{ title: "End gap, e", text: "Gap used for the end-post area. This is not Young’s modulus. Source: manual." }} /> : null}
          {text("endPost") === "yes" ? <NumField label="End-post area, Aep" unit="mm²" value={text("aepMm2")} onChange={(value) => set("aepMm2", value)} /> : null}
          <Pick label="Sole torsional restraint" value={text("soleTorsion")} onChange={(value) => set("soleTorsion", value)} options={[["", "No"], ["yes", "Yes"]]} />
          {text("soleTorsion") === "yes" ? <NumField label="Flange depth, d" unit="mm" value={text("torsionDepthMm")} onChange={(value) => set("torsionDepthMm", value)} /> : null}
          {text("soleTorsion") === "yes" ? <NumField label="Critical flange thickness, tf" unit="mm" value={text("torsionTfMm")} onChange={(value) => set("torsionTfMm", value)} /> : null}
          {text("soleTorsion") === "yes" ? <NumField label="Member force, F*" unit="N" value={text("fMemberN")} onChange={(value) => set("fMemberN", value)} info={{ title: "F*", text: "Force in the compression flange used for torsional restraint. Clause 5.14.5. Source: external member check." }} /> : null}
          <NumField label="Force normal to the stiffener, Fn*" unit="N" value={text("fnN")} onChange={(value) => set("fnN", value)} info={{ title: "Fn*", text: "External force on the stiffener for the extra stiffness in Clause 5.15.7.1. Source: manual." }} />
          <NumField label="Force parallel to the stiffener, Fp*" unit="N" value={text("fpN")} onChange={(value) => set("fpN", value)} />
          <NumField label="Moment on the stiffener, Mp*" unit="N·mm" value={text("mpNmm")} onChange={(value) => set("mpNmm", value)} />
          <NumField label="Eccentricity, e" unit="mm" value={text("eccMm")} onChange={(value) => set("eccMm", value)} info={{ title: "Eccentricity, e", text: "Eccentricity of Fp*. Not Young’s modulus. Source: manual." }} />
          <NumField label="Modulus for the stiffener increase, E" unit="MPa" value={text("modulusMpa")} onChange={(value) => set("modulusMpa", value)} hint="Entered here. The plate modulus above is not used." info={{ title: "Modulus, E", text: "Young’s modulus for Clause 5.15.7.1 only. Source: manual. Not the plate model E." }} />
        </>
      ) : null}
      {interactionOn ? (
        <>
          <Pick label="Bending and shear" value={text("interaction")} onChange={(value) => set("interaction", value)} options={[["section", "Section interaction, Clause 5.12.3"], ["proportioning", "Flange proportioning, Clause 5.12.2"], ["none", "No bending"]]} />
          <NumField label="Design moment, M*" unit="N·mm" value={text("mStarNmm")} onChange={(value) => set("mStarNmm", value)} info={{ title: "M*", text: "Design bending moment from the member analysis. This plate tool does not calculate it. Source: external." }} />
          <NumField label="External section moment capacity, Ms" unit="N·mm" value={text("msNmm")} onChange={(value) => set("msNmm", value)} info={{ title: "Ms", text: "Nominal section moment capacity from the applicable member check. IQ-CAL-PLB does not calculate complete member bending capacity. Source: external verified input." }} hint="EXTERNAL VERIFIED INPUT. Not calculated by this plate check." />
          {text("interaction") === "proportioning" ? <NumField label="Effective flange area, Afe" unit="mm²" value={text("afeMm2")} onChange={(value) => set("afeMm2", value)} info={{ title: "Afe", text: "Effective area of the flange for Clause 5.12.2. Source: manual." }} /> : null}
          {text("interaction") === "proportioning" ? <NumField label="Gross flange area, Afg" unit="mm²" value={text("afgMm2")} onChange={(value) => set("afgMm2", value)} info={{ title: "Afg", text: "Gross area of the flange. Source: manual." }} /> : null}
          {text("interaction") === "proportioning" ? <NumField label="Net flange area, Afn" unit="mm²" value={text("afnMm2")} onChange={(value) => set("afnMm2", value)} info={{ title: "Afn", text: "Net area of the flange. Source: manual." }} /> : null}
          {text("interaction") === "proportioning" ? <NumField label="Distance between flange centroids, df" unit="mm" value={text("dfMm")} onChange={(value) => set("dfMm", value)} info={{ title: "df", text: "Distance between flange centroids. Clause 5.12.2. Source: manual." }} /> : null}
          {text("interaction") === "proportioning" ? <NumField label="Flange yield stress, fy" unit="MPa" value={text("flangeFyMpa")} onChange={(value) => set("flangeFyMpa", value)} /> : null}
          {text("interaction") === "proportioning" ? <NumField label="Flange tensile strength, fu" unit="MPa" value={text("flangeFuMpa")} onChange={(value) => set("flangeFuMpa", value)} /> : null}
        </>
      ) : null}
      {text("appendixI") === "yes" ? (
        <>
          <p className="toolNote">Appendix I is informative. It does not change the governing utilisation.</p>
          <NumField label="Axial force on the web, Nw*" unit="N" value={text("nwN")} onChange={(value) => set("nwN", value)} />
          <NumField label="Moment on the web, Mw*" unit="N·mm" value={text("mwNmm")} onChange={(value) => set("mwNmm", value)} />
          <NumField label="Bearing force, Rw*" unit="N" value={text("rwN")} onChange={(value) => set("rwN", value)} />
          <NumField label="Shear force, Vw*" unit="N" value={text("vwN")} onChange={(value) => set("vwN", value)} />
        </>
      ) : null}
      {web ? <Pick label="Plastic web" value={text("plasticWeb")} onChange={(value) => set("plasticWeb", value)} options={[["", "No"], ["yes", "Yes — Clause 5.10.6"]]} /> : null}
      {web ? <Pick label="Axial force on this web" value={text("axial")} onChange={(value) => set("axial", value)} options={[["none", "None"], ["compression", "Compression"], ["tension", "Tension"]]} /> : null}
    </div>
  )

  return (
    <div className="designSheet">
      <details className="quietHelp">
        <summary>How this works</summary>
        <ol>
          <li>Define the plate or panel above.</li>
          <li>Choose the AS 4100 check: plate element or web.</li>
          <li>Link or enter the design dimensions. Panel sizes are not copied until you link them.</li>
          <li>Enter the design action.</li>
          <li>Read the governing result.</li>
          <li>Open the full calculation when you need the substitution.</li>
        </ol>
      </details>
      <p className="toolNote">Examples load the AS 4100 design inputs only. The plate model geometry is unchanged.</p>
      <div className="toolToolbar">
        <button className="toolBtn" type="button" onClick={() => loadWorked("plate")}>EXAMPLE — 300 × 10 plate</button>
        <button className="toolBtn" type="button" onClick={() => loadWorked("slender")}>EXAMPLE — 500 × 8 slender plate</button>
        <button className="toolBtn" type="button" onClick={() => loadWorked("shear")}>EXAMPLE — web shear, V* = 400 kN</button>
      </div>
      <div className="toolTabs" role="tablist">
        <button type="button" className={pane === "check" ? "on" : ""} onClick={() => setPane("check")}>CHECK</button>
        <button type="button" className={pane === "advanced" ? "on" : ""} onClick={() => setPane("advanced")}>ADVANCED CHECKS</button>
        <button type="button" className={pane === "report" ? "on" : ""} onClick={() => setPane("report")}>FULL CALCULATION</button>
      </div>
      {stale.length ? <p className="failBanner">{staleText}</p> : null}
      {pane === "check" ? (
        <>
          <div className="fieldGrid compact">
            <Pick label="Check" value={role} onChange={(value) => { if (value === "element" || value === "web") chooseRole(value) }} options={[["", "Choose plate element or web"], ["element", "Plate element"], ["web", "Web / shear panel"]]} />
          </div>
          <Governing report={report} />
          {elastic?.sigmaCrMpa != null ? <p className="toolNote">FEM σcr on this run is {elastic.sigmaCrMpa.toFixed(2)} MPa. It is not copied into kb or into φN. Classical σcr stays on the sheet above.</p> : <p className="toolNote">FEM has not been run. Classical σcr on the sheet above is elastic, not an AS 4100 resistance.</p>}
          {plate ? <ElementFigure diagram={report.diagram} /> : null}
          {plateFields}
          {webFields}
          {(bearingOn || openingOn || stiffenerOn || interactionOn) ? specialist : null}
          {role ? addChecks : null}
          <ResultGroups report={report} />
        </>
      ) : null}
      {pane === "advanced" ? (
        <>
          <p className="toolNote">Specialist checks. A check that the selected web or plate requires is also shown on CHECK once you turn it on.</p>
          {addChecks}
          {specialist}
          {needsS && !stiffenerOn ? <p className="toolNote">This web is stiffened. Spacing s is on CHECK. Add stiffener design here if you are checking the stiffener itself.</p> : null}
        </>
      ) : null}
      {pane === "report" ? (
        <>
          <Governing report={report} />
          <ResultGroups report={report} />
          <TraceList report={report} />
          {report.limitations.map((line) => <p className="toolNote" key={line}>{line}</p>)}
        </>
      ) : null}
    </div>
  )
}