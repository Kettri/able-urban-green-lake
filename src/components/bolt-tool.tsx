import { useEffect, useMemo, useState, type KeyboardEvent } from "react"
import { BoltDiagram } from "./bolt-diagram.tsx"
import { DrillPanel } from "./drill-panel.tsx"
import { JointSketch } from "./joint-sketch.tsx"
import { TorquePanel } from "./torque-panel.tsx"
import { trimNum } from "../reference/format.ts"
import {
  STANDARDS,
  classesFor,
  standardById,
} from "../bolts/database.ts"
import {
  buildSheet,
  classOptions,
  pitchOptions,
  shareSlug,
  sizeLabels,
  type Selection,
} from "../bolts/model.ts"
import { STAINLESS_CLASSES, STAINLESS_NOTE } from "../bolts/materials.ts"
import type { BoltQuery } from "../bolts/search.ts"

const TABS = ["OVERVIEW", "GEOMETRY", "THREAD", "DRILL / TAP", "AREAS", "MATERIAL", "PRELOAD / TORQUE", "MASS", "SOURCE"] as const
type Tab = (typeof TABS)[number]

const BLANK = {
  lengthMm: "",
  threadedMm: "",
  nn: "1",
  nx: "0",
  lj: "",
  nStar: "",
  vStar: "",
  tp: "",
  fup: "",
  ae: "",
  qty: "1",
}

export function BoltTool({ start, query }: { start: Selection; query: BoltQuery | null }) {
  const [sel, setSel] = useState<Selection>(start)
  const [fields, setFields] = useState(BLANK)
  const [tab, setTab] = useState<Tab>("OVERVIEW")
  const [hot, setHot] = useState<string | null>(null)
  const [compare, setCompare] = useState<Selection[]>([])
  const [copied, setCopied] = useState("")

  useEffect(() => {
    setSel(start)
    if (query?.focus === "areas") setTab("AREAS")
    else if (query?.focus === "material") setTab("MATERIAL")
    else if (query?.focus === "mass") setTab("MASS")
    else if (query?.focus === "thread") setTab("THREAD")
    else if (query?.focus === "geometry") setTab("GEOMETRY")
  }, [start, query])

  const standard = standardById(sel.standardId) ?? STANDARDS[0]!
  const sizes = sizeLabels(standard)
  const pitches = pitchOptions(standard, sel.sizeLabel)
  const dForClass = standard.system === "metric" ? Number(sel.sizeLabel.replace("M", "")) : 25.4
  const classes = classOptions(standard, Number.isFinite(dForClass) ? dForClass : 20)

  const sheet = useMemo(() => buildSheet({ ...sel, ...fields }), [sel, fields])

  function patch(partial: Partial<Selection>) {
    const next = { ...sel, ...partial }
    const std = standardById(next.standardId)
    if (!std) return
    const labels = sizeLabels(std)
    if (!labels.includes(next.sizeLabel)) next.sizeLabel = labels[0] ?? next.sizeLabel
    const opts = pitchOptions(std, next.sizeLabel)
    if (!opts.some((item) => Math.abs(item.pitchMm - next.pitchMm) < 1e-6)) {
      next.pitchMm = opts[0]?.pitchMm ?? next.pitchMm
    }
    const d = std.system === "metric" ? Number(next.sizeLabel.slice(1)) : 20
    const allowed = classOptions(std, d)
    if (!allowed.includes(next.classId)) next.classId = allowed[0] ?? ""
    setSel(next)
  }

  function setField(key: keyof typeof BLANK, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function copyLink() {
    const slug = shareSlug(sel)
    const url = `${window.location.origin}/bolts/${encodeURIComponent(slug)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied("Link copied")
    } catch {
      setCopied(url)
    }
  }

  function onTabKey(event: KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const index = TABS.indexOf(tab)
    const next = event.key === "ArrowRight" ? (index + 1) % TABS.length : (index - 1 + TABS.length) % TABS.length
    const item = TABS[next]
    if (item) setTab(item)
  }

  const lengthMm = enteredMm(fields.lengthMm)
  const threadMm = enteredMm(fields.threadedMm)

  return (
    <>
      <div className="titleBlock">
        <div className="tbLogo">IQEG</div>
        <div className="tbMid">
          <p className="tbKicker">IQEG REFERENCE LAB</p>
          <h1 className="tbName">{sheet.designation}</h1>
        </div>
        <div className="tbMeta">
          <span>IQ-REF-001</span>
          <span>REV 0 · INDICATIVE</span>
          <span>NOT A CERTIFICATE</span>
        </div>
      </div>
      <div className="toolToolbar noPrint">
        <button className="toolBtn ghost" type="button" onClick={() => window.print()}>PRINT SHEET</button>
        <button className="toolBtn ghost" type="button" onClick={() => void copyLink()}>COPY LINK</button>
        <button
          className="toolBtn ghost"
          type="button"
          disabled={compare.length >= 4}
          onClick={() => setCompare((prev) => (prev.length >= 4 ? prev : [...prev, sel]))}
        >
          ADD TO COMPARE
        </button>
        {copied ? <span className="toolNote">{copied}</span> : null}
      </div>
      {sheet.error ? <p className="failBanner">{sheet.error}</p> : null}
      <div className="bench">
        <div className="benchMain">
        <section className="toolPanel">
          <h2>Selection</h2>
          <label className="field">
            <span>STANDARD</span>
            <select className="toolSelect" value={sel.standardId} onChange={(e) => patch({ standardId: e.target.value })}>
              {STANDARDS.map((item) => (
                <option key={item.id} value={item.id}>{item.family} — {item.name}</option>
              ))}
            </select>
          </label>
          <div className="fieldGrid compact">
            <label className="field">
              <span>SIZE</span>
              <select className="toolSelect" value={sel.sizeLabel} onChange={(e) => patch({ sizeLabel: e.target.value })}>
                {sizes.map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>PITCH</span>
              <select
                className="toolSelect"
                value={String(sel.pitchMm)}
                onChange={(e) => patch({ pitchMm: Number(e.target.value) })}
              >
                {pitches.map((item) => (
                  <option key={item.label} value={item.pitchMm}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>PROPERTY CLASS</span>
              <select className="toolSelect" value={sel.classId} onChange={(e) => patch({ classId: e.target.value })}>
                {classes.length === 0 ? <option value="">Not in dataset</option> : null}
                {classes.map((id) => <option key={id}>{id}</option>)}
              </select>
            </label>
          </div>
          <div className="fieldGrid compact">
            <Num label="Length L — mm" value={fields.lengthMm} onChange={(v) => setField("lengthMm", v)} hot="L" setHot={setHot} />
            <Num label="Thread length b — mm" value={fields.threadedMm} onChange={(v) => setField("threadedMm", v)} hot="b" setHot={setHot} />
            <Num label="Quantity" value={fields.qty} onChange={(v) => setField("qty", v)} />
          </div>
          <p className="toolNote">L is under the head. b is the threaded part of L. Leave both blank if you only need the size. Quantity is for the mass total only.</p>
        </section>
        <CheckPanel placement="diagram" sheet={sheet} fields={fields} setField={setField} standardName={standard.name} hot={hot} setHot={setHot} />
        </div>
        <div className="benchSide">
        <section className="toolPanel">
          <div className="toolTabs" role="tablist" onKeyDown={onTabKey}>
            {TABS.map((item) => (
              <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? "on" : ""} onClick={() => setTab(item)}>
                {item}
              </button>
            ))}
          </div>
          <TabBody tab={tab} sheet={sheet} hot={hot} setHot={setHot} classIds={classesFor(standard)} classId={sel.classId} />
        </section>
        <CheckPanel placement="fields" sheet={sheet} fields={fields} setField={setField} standardName={standard.name} hot={hot} setHot={setHot} />
        </div>
      </div>
      <section className="toolPanel" style={{ marginTop: 14 }}>
        <h2>Figure</h2>
        <p className="toolNote" style={{ marginTop: 0 }}>Identification only. Head sizes are typical, not the standard minimum and maximum.</p>
        <div className="figureRow figureFixed">
          <BoltDiagram
            hot={hot}
            dText={sheet.profile ? `${trimNum(sheet.dMm, 3)} mm` : "—"}
            pitchText={sheet.profile ? `${trimNum(sheet.pitchMm, 3)} mm` : "—"}
            kText={sheet.hex ? `${trimNum(sheet.hex.k, 2)} mm` : null}
            sText={sheet.hex ? `${trimNum(sheet.hex.s, 2)} mm` : null}
            lengthText={lengthMm == null ? null : `${trimNum(lengthMm, 2)} mm`}
            threadText={threadMm == null ? null : `${trimNum(threadMm, 2)} mm`}
            dMm={sheet.dMm}
            kMm={sheet.hex?.k ?? null}
            sMm={sheet.hex?.s ?? null}
            minorMm={sheet.profile?.d1 ?? null}
            lengthMm={lengthMm}
            threadMm={threadMm}
          />
          {sheet.profile ? (
            <div className="resultList">
              <Pair label="d" value={`${trimNum(sheet.dMm, 3)} mm`} dim="d" hot={hot} setHot={setHot} />
              <Pair label="P" value={`${trimNum(sheet.pitchMm, 3)} mm`} dim="P" hot={hot} setHot={setHot} />
              <Pair label="As" value={`${trimNum(sheet.profile.As, 1)} mm²`} dim="As" hot={hot} setHot={setHot} />
              <Pair label="s across flats" value={sheet.hex ? `${trimNum(sheet.hex.s, 2)} mm` : "—"} dim="s" hot={hot} setHot={setHot} />
              <Pair label="k head height" value={sheet.hex ? `${trimNum(sheet.hex.k, 2)} mm` : "—"} dim="k" hot={hot} setHot={setHot} />
              <Pair label="fy" value={sheet.band ? `${sheet.band.fy} MPa` : "—"} />
              <Pair label="fu" value={sheet.band ? `${sheet.band.fu} MPa` : "—"} />
            </div>
          ) : null}
        </div>
      </section>
      {compare.length > 0 ? <Compare rows={compare} onClear={() => setCompare([])} fields={fields} /> : null}
    </>
  )
}

function enteredMm(raw: string): number | null {
  if (!raw.trim()) return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function Num({ label, value, onChange, hot, setHot, hint }: { label: string; value: string; onChange: (v: string) => void; hot?: string; setHot?: (v: string | null) => void; hint?: string }) {
  return (
    <label className="field" onMouseEnter={() => hot && setHot?.(hot)} onMouseLeave={() => setHot?.(null)}>
      <span>{label}</span>
      <input className="toolField" inputMode="decimal" value={value} onFocus={() => hot && setHot?.(hot)} onBlur={() => setHot?.(null)} onChange={(e) => onChange(e.target.value)} />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function CheckPanel({ placement, sheet, fields, setField, standardName, hot, setHot }: { placement: "diagram" | "fields"; sheet: ReturnType<typeof buildSheet>; fields: typeof BLANK; setField: (key: keyof typeof BLANK, value: string) => void; standardName: string; hot: string | null; setHot: (v: string | null) => void }) {
  const cap = sheet.capacity
  const threadPlanes = Number(fields.nn)
  const shankPlanes = Number(fields.nx)
  if (placement === "diagram") {
    return (
      <section className="toolPanel">
        <h2>Joint</h2>
        <JointSketch
          hot={hot}
          threadPlanes={Number.isFinite(threadPlanes) ? threadPlanes : 0}
          shankPlanes={Number.isFinite(shankPlanes) ? shankPlanes : 0}
          endOn={fields.ae.trim() !== ""}
        />
      </section>
    )
  }
  return (
    <section className="toolPanel">
      <h2>AS 4100 check</h2>
      <p className="toolNote" style={{ marginTop: 0 }}>
        Bearing-type bolt only — not a friction-grip slip check, and not a certificate.
        Hover a field. The joint on the left marks that part. Classes 4.6, 8.8 and 10.9 only.
      </p>
      <div className="fieldGrid compact">
        <Num label="Applied tension N* — kN" value={fields.nStar} onChange={(v) => setField("nStar", v)} hint="Design tension on this one bolt. Not the capacity." hot="N" setHot={setHot} />
        <Num label="Applied shear V* — kN" value={fields.vStar} onChange={(v) => setField("vStar", v)} hint="Design shear on this one bolt." hot="V" setHot={setHot} />
        <Num label="Shear planes in the thread" value={fields.nn} onChange={(v) => setField("nn", v)} hint="A single lap with the nut on the thread is usually 1." hot="nn" setHot={setHot} />
        <Num label="Shear planes in the shank" value={fields.nx} onChange={(v) => setField("nx", v)} hint="Same single lap is usually 0. Use 1 only if the cut is on the plain shank." hot="nx" setHot={setHot} />
        <Num label="Lap length — mm" value={fields.lj} onChange={(v) => setField("lj", v)} hint="First shear plane to last. Blank means no reduction. Past 300 mm the shear capacity drops." hot="lj" setHot={setHot} />
      </div>
      <details className="toolGloss">
        <summary>PLATE IN FRONT OF THE BOLT</summary>
        <div className="inner">
          <p className="toolNote" style={{ marginTop: 0 }}>Skip this unless you are checking the ply. Thickness and plate tensile strength are both required. End distance is optional. If ae is blank, tear-out is not checked.</p>
          <div className="fieldGrid compact">
            <Num label="Plate thickness — mm" value={fields.tp} onChange={(v) => setField("tp", v)} hint="tp of the ply being crushed." hot="t" setHot={setHot} />
            <Num label="Plate tensile strength — MPa" value={fields.fup} onChange={(v) => setField("fup", v)} hint="fup of that ply, not the bolt." />
            <Num label="End distance ae — mm" value={fields.ae} onChange={(v) => setField("ae", v)} hint="The distance your edition puts in ae × tp × fup. Blank skips tear-out." hot="ae" setHot={setHot} />
          </div>
        </div>
      </details>
      {!cap || !cap.ok ? (
        <p className="failBanner" style={{ marginTop: 12 }}>
          {cap && !cap.ok && cap.reason.includes("Outside implemented")
            ? `${standardName} has no AS 4100 check on this sheet. The geometry above is still valid. Use ISO metric, AS 1110, AS 1111, AS 1252 or the AS 4100 context, class 4.6, 8.8 or 10.9.`
            : cap && !cap.ok
              ? cap.reason
              : "No design result for this combination."}
        </p>
      ) : (
        <>
          <div className="resultList" style={{ marginTop: 12 }}>
            <Pair label="Tension capacity φNtf" value={`${trimNum(cap.phiNtf_kN, 2)} kN`} />
            <Pair label="Shear capacity φVf" value={`${trimNum(cap.phiVf_kN, 2)} kN`} />
            <Pair label="Plate capacity φVb" value={cap.phiVb_kN == null ? "not checked" : `${trimNum(cap.phiVb_kN, 2)} kN`} />
            <Pair label="Tension used" value={cap.utilN == null ? "no N* entered" : `${trimNum(cap.utilN * 100, 1)}%`} fail={cap.utilN != null && cap.utilN > 1} />
            <Pair label="Bolt shear used" value={cap.utilV == null ? "no V* entered" : `${trimNum(cap.utilV * 100, 1)}%`} fail={cap.utilV != null && cap.utilV > 1} />
            <Pair label="Plate used" value={cap.utilPly == null ? "—" : `${trimNum(cap.utilPly * 100, 1)}%`} fail={cap.utilPly != null && cap.utilPly > 1} />
            <Pair label="Combined shear and tension" value={cap.utilInteract == null ? "needs both N* and V*" : `${trimNum(cap.utilInteract * 100, 1)}%`} fail={cap.utilInteract != null && cap.utilInteract > 1} />
            <Pair label="What governs" value={cap.governing} />
          </div>
          <p className="toolNote">
            Over 100% is past this check. Bolt factor φ is 0.80. Plate factor is 0.90 and is not mixed into the bolt factor.
            A thread plane uses the stress area. A shank plane uses the shank area. Shear is taken as 0.62 of fu, then lap factor {trimNum(cap.kr, 3)} and 10.9 factor {trimNum(cap.krd, 2)}.
          </p>
          <details className="toolGloss">
            <summary>SHOW THE ARITHMETIC</summary>
            <div className="inner">
              <div className="toolTableWrap">
                <table className="toolTable">
                  <thead><tr><th>Step</th><th>Equation</th><th>Substitution</th><th>Result</th></tr></thead>
                  <tbody>
                    {cap.steps.map((step) => (
                      <tr key={step.id}>
                        <td>{step.label}</td>
                        <td>{step.equation}</td>
                        <td>{step.substitution}</td>
                        <td>{step.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </>
      )}
    </section>
  )
}

function Pair({ label, value, dim, hot, setHot, fail = false }: { label: string; value: string; dim?: string; hot?: string | null; setHot?: (v: string | null) => void; fail?: boolean }) {
  const on = dim != null && hot === dim
  return (
    <div onMouseEnter={() => dim && setHot?.(dim)} onMouseLeave={() => setHot?.(null)}>
      <span className={on ? "hotLabel" : ""}>{label}</span>
      <b className={fail ? "fail" : ""}>{value}</b>
    </div>
  )
}

function TabBody({ tab, sheet, hot, setHot, classIds, classId }: { tab: Tab; sheet: ReturnType<typeof buildSheet>; hot: string | null; setHot: (v: string | null) => void; classIds: string[] | "all"; classId: string }) {
  const p = sheet.profile
  if (tab === "OVERVIEW") {
    return (
      <>
        <p className="toolNote">{sheet.standardNote}</p>
        {p ? (
          <div className="resultList">
            <Pair label="Designation" value={sheet.designation} />
            <Pair label="d" value={`${trimNum(sheet.dMm, 3)} mm`} dim="d" hot={hot} setHot={setHot} />
            <Pair label="P" value={`${trimNum(sheet.pitchMm, 3)} mm`} dim="P" hot={hot} setHot={setHot} />
            <Pair label="As" value={`${trimNum(p.As, 2)} mm²`} />
            <Pair label="Ao" value={`${trimNum(p.Ao, 2)} mm²`} />
            <Pair label="Ar" value={`${trimNum(p.Ar, 2)} mm²`} />
            <Pair label="fy" value={sheet.band ? `${sheet.band.fy} MPa` : "Required standard data unavailable."} />
            <Pair label="fu" value={sheet.band ? `${sheet.band.fu} MPa` : "Required standard data unavailable."} />
            <Pair label="Sp" value={sheet.band ? `${sheet.band.sp} MPa` : "—"} />
          </div>
        ) : <p className="failBanner">This combination is not contained in the current verified dataset.</p>}
      </>
    )
  }
  if (tab === "GEOMETRY") {
    return (
      <>
        {sheet.hex ? (
          <div className="resultList">
            <Pair label="s across flats" value={`${trimNum(sheet.hex.s, 2)} mm`} dim="s" hot={hot} setHot={setHot} />
            <Pair label="e across corners" value={`${trimNum(sheet.hex.e, 2)} mm`} />
            <Pair label="k head height" value={`${trimNum(sheet.hex.k, 2)} mm`} dim="k" hot={hot} setHot={setHot} />
            <Pair label="Grip L − b" value={sheet.gripMm == null ? "—" : `${trimNum(sheet.gripMm, 2)} mm`} dim="b" hot={hot} setHot={setHot} />
            <Pair label="Rough allowance, not ISO 273" value={sheet.holeMm == null ? "—" : `${trimNum(sheet.holeMm, 1)} mm`} />
          </div>
        ) : <p className="failBanner">Required standard data unavailable. Head dimensions are not in the verified dataset for this size.</p>}
        <p className="toolNote">{sheet.hexProvenance.note} Across corners e = s / cos(30°) is the regular-hexagon geometry, not the standard minimum e.</p>
        <p className="toolNote">{sheet.gripNote}</p>
        <p className="toolNote">{sheet.holeNote} The ISO 273 clearance holes are on DRILL / TAP. Nut thickness and washer size are not embedded.</p>
      </>
    )
  }
  if (tab === "THREAD" && p) {
    return (
      <div className="resultList">
        <Pair label="Designation" value={sheet.designation} />
        <Pair label="Pitch P" value={`${trimNum(p.P, 4)} mm`} dim="P" hot={hot} setHot={setHot} />
        <Pair label="Threads / mm" value={trimNum(1 / p.P, 4)} />
        <Pair label="TPI" value={trimNum(sheet.tpi ?? 0, 3)} />
        <Pair label="Major d" value={`${trimNum(p.d, 3)} mm`} dim="d" hot={hot} setHot={setHot} />
        <Pair label="Pitch dia d2" value={`${trimNum(p.d2, 3)} mm`} />
        <Pair label="Minor d1" value={`${trimNum(p.d1, 3)} mm`} />
        <Pair label="d3" value={`${trimNum(p.d3, 3)} mm`} />
        <Pair label="Height H" value={`${trimNum(p.H, 3)} mm`} />
        <Pair label="Depth 5H/8" value={`${trimNum(p.depth, 3)} mm`} />
        <Pair label="Angle" value="60°" />
        <Pair label="Class" value="6g / 6H usual — deviations not embedded" />
      </div>
    )
  }
  if (tab === "DRILL / TAP") return <DrillPanel sheet={sheet} />
  if (tab === "AREAS" && p) {
    return (
      <>
        <div className="formulaBox">
          <b>CALCULATED</b>
          <p>Ao = πd²/4 = {trimNum(p.Ao, 2)} mm²</p>
          <p>As = π/4 ((d2+d3)/2)² = {trimNum(p.As, 2)} mm²</p>
          <p>Ar = πd1²/4 = {trimNum(p.Ar, 2)} mm²</p>
        </div>
        <div className="resultList">
          <Pair label="Shank shear Ao" value={`${trimNum(p.shearShank, 2)} mm² · ${trimNum(p.shearShank / 100, 4)} cm² · ${trimNum(p.shearShank / 645.16, 5)} in²`} />
          <Pair label="Thread shear As" value={`${trimNum(p.shearThread, 2)} mm² · ${trimNum(p.shearThread / 100, 4)} cm² · ${trimNum(p.shearThread / 645.16, 5)} in²`} />
          <Pair label="Root area Ar" value={`${trimNum(p.Ar, 2)} mm² · ${trimNum(p.Ar / 100, 4)} cm² · ${trimNum(p.Ar / 645.16, 5)} in²`} />
        </div>
        <p className="toolNote">{sheet.areaNote}</p>
      </>
    )
  }
  if (tab === "MATERIAL") {
    if (!sheet.band) return <p className="failBanner">Required standard data unavailable.</p>
    return (
      <>
        <div className="resultList">
          <Pair label="Class" value={sheet.title} />
          <Pair label="fu" value={`${sheet.band.fu} MPa`} />
          <Pair label="fy" value={`${sheet.band.fy} MPa`} />
          <Pair label="Proof stress Sp" value={`${sheet.band.sp} MPa`} />
          <Pair label="Proof load Sp·As" value={p ? `${trimNum((sheet.band.sp * p.As) / 1000, 2)} kN` : "—"} />
        </div>
        <p className="toolNote">{sheet.classNote} fy, fu and proof stress are different properties.</p>
        <p className="toolNote">{sheet.classProvenance.note} Hardness and elongation are not in this dataset. Classes on this standard: {classIds === "all" ? "all ISO classes in the dataset" : classIds.join(", ") || "none"}.</p>
        <h2 style={{ marginTop: 16 }}>Stainless fastener classes — reference only</h2>
        <p className="toolNote" style={{ marginTop: 0 }}>{STAINLESS_NOTE}</p>
        <div className="toolTableWrap">
          <table className="toolTable">
            <thead><tr><th>Class</th><th>Family</th><th>rm min MPa</th><th>Rp0.2 min MPa</th><th>Commercial name</th></tr></thead>
            <tbody>
              {STAINLESS_CLASSES.map((item) => (
                <tr key={item.id}><td>{item.id}</td><td>{item.family}</td><td>{item.rm}</td><td>{item.rp}</td><td>{item.common}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="toolNote">AS/NZS 1252 is a product and assembly standard. AS 4100 is the design check. This sheet does not treat them as the same document. ASTM, SAE and high-temperature fastener tables are not in this dataset.</p>
      </>
    )
  }
  if (tab === "PRELOAD / TORQUE") return <TorquePanel sheet={sheet} classId={classId} />
  if (tab === "MASS") {
    return (
      <>
        {sheet.massKg == null ? <p className="failBanner">{sheet.massNote}</p> : (
          <div className="resultList">
            <Pair label="Each" value={`${trimNum((sheet.massEachG ?? 0), 1)} g`} />
            <Pair label="Each" value={`${trimNum((sheet.massEachG ?? 0) / 1000, 4)} kg`} />
            <Pair label="Total" value={`${trimNum(sheet.massKg, 4)} kg`} />
            <Pair label="per 100" value={sheet.massEachG ? `${trimNum(sheet.massEachG / 10, 2)} kg` : "—"} />
            <Pair label="per 1000" value={sheet.massEachG ? `${trimNum(sheet.massEachG, 1)} kg` : "—"} />
          </div>
        )}
        <p className="toolNote">{sheet.massNote} Nut mass and washer mass: required standard data unavailable.</p>
      </>
    )
  }
  return (
    <>
      <div className="resultList">
        <Pair label="Profile" value={sheet.profileProvenance.sourceType} />
        <Pair label="Standard" value={sheet.profileProvenance.sourceStandard} />
        <Pair label="Clause" value={sheet.profileProvenance.clause} />
        <Pair label="Class data" value={sheet.classProvenance.sourceType} />
        <Pair label="Head data" value={sheet.hex ? sheet.hexProvenance.sourceType : "unavailable"} />
        <Pair label="Dataset" value="Fastener DB v1.0.0" />
        <Pair label="Engine" value="v1.0.0" />
      </div>
      <p className="toolNote">{sheet.profileProvenance.note}</p>
      <p className="toolNote">{sheet.standardNote}</p>
    </>
  )
}

function Compare({ rows, onClear, fields }: { rows: Selection[]; onClear: () => void; fields: typeof BLANK }) {
  const sheets = rows.map((row) => buildSheet({ ...fields, ...row, nStar: "", vStar: "", nn: "1", nx: "0", lj: "" }))
  const nums = sheets.map((sheet) => ({
    label: sheet.designation,
    Ao: sheet.profile?.Ao ?? null,
    As: sheet.profile?.As ?? null,
    Ar: sheet.profile?.Ar ?? null,
    P: sheet.pitchMm,
    fy: sheet.band?.fy ?? null,
    fu: sheet.band?.fu ?? null,
    sp: sheet.band?.sp ?? null,
    mass: sheet.massEachG,
  }))
  const keys = ["Ao", "As", "Ar", "P", "fy", "fu", "sp", "mass"] as const
  return (
    <section className="toolPanel spanAll" style={{ marginTop: 14 }}>
      <h2>Comparison</h2>
      <p className="toolNote">Largest is marked black, smallest grey, only where the numbers differ. That is not a selection.</p>
      <div className="toolTableWrap">
        <table className="toolTable">
          <thead>
            <tr>
              <th>Bolt</th><th>Ao</th><th>As</th><th>Ar</th><th>P</th><th>fy</th><th>fu</th><th>Sp</th><th>g each</th>
            </tr>
          </thead>
          <tbody>
            {nums.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                {keys.map((key) => {
                  const value = row[key]
                  const column = nums.map((item) => item[key]).filter((item): item is number => item != null)
                  const max = Math.max(...column)
                  const min = Math.min(...column)
                  const mark = value == null || max === min ? "" : value === max ? "hi" : value === min ? "lo" : ""
                  return <td key={key} className={mark}>{value == null ? "—" : trimNum(value, key === "P" ? 3 : 1)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="toolBtn ghost" type="button" onClick={onClear} style={{ marginTop: 10 }}>CLEAR COMPARE</button>
    </section>
  )
}
