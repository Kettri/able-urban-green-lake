import { useState } from "react"
import { clearanceHoles, CLEARANCE_NOTE } from "../bolts/clearance.ts"
import { PIPE_THREADS, PIPE_WARNING, type PipeFamily } from "../bolts/pipeThreads.ts"
import { drawingCallout, engagementLength, tapDrill } from "../bolts/tap.ts"
import { trimNum } from "../reference/format.ts"
import { buildSheet } from "../bolts/model.ts"

export function DrillPanel({ sheet }: { sheet: ReturnType<typeof buildSheet> }) {
  const [percent, setPercent] = useState("75")
  const [fuInternal, setFuInternal] = useState("")
  const [family, setFamily] = useState<PipeFamily | "">("")
  const [pipeId, setPipeId] = useState("")
  const [copied, setCopied] = useState("")
  const profile = sheet.profile
  if (!profile) return <p className="failBanner">No thread geometry for this selection.</p>

  const pct = Number(percent)
  let drill: ReturnType<typeof tapDrill> | null = null
  let drillError = ""
  try {
    if (percent.trim()) drill = tapDrill(sheet.dMm, sheet.pitchMm, pct)
  } catch (error) {
    drillError = error instanceof Error ? error.message : "Invalid percentage."
  }
  const holes = clearanceHoles(sheet.dMm)
  const callout = drawingCallout(sheet.dMm, sheet.pitchMm, holes?.medium ?? null)
  const fuBolt = sheet.band?.fu ?? null
  const fuTap = fuInternal.trim() ? Number(fuInternal) : fuBolt
  let engagement: ReturnType<typeof engagementLength> | null = null
  let engagementError = ""
  if (fuBolt && fuTap && Number.isFinite(fuTap)) {
    try {
      engagement = engagementLength(profile.As, sheet.dMm, fuBolt, fuTap)
    } catch (error) {
      engagementError = error instanceof Error ? error.message : "Invalid engagement."
    }
  }
  const pipes = PIPE_THREADS.filter((item) => item.family === family)
  const pipe = pipes.find((item) => item.id === pipeId) ?? null

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(text)
  }

  return (
    <>
      <p className="toolNote" style={{ marginTop: 0 }}>
        External thread is the bolt. Internal thread is the tapped hole. Clearance holes are for the bolt to pass through, not to be tapped.
      </p>
      <div className="resultList">
        <div><span>Designation</span><b>M{trimNum(sheet.dMm, 3)} × {trimNum(sheet.pitchMm, 3)}</b></div>
        <div><span>Major d</span><b>{trimNum(profile.d, 3)} mm</b></div>
        <div><span>Pitch</span><b>{trimNum(profile.P, 3)} mm</b></div>
        <div><span>Pitch diameter d2</span><b>{trimNum(profile.d2, 3)} mm</b></div>
        <div><span>Basic minor d1</span><b>{trimNum(profile.d1, 3)} mm</b></div>
        <div><span>Series</span><b>{sheet.series}</b></div>
      </div>
      <label className="field" style={{ marginTop: 12 }}>
        <span>Thread height to aim for — %</span>
        <input className="toolField" inputMode="decimal" value={percent} onChange={(e) => setPercent(e.target.value)} />
        <small>100% meets the basic minor diameter. 75% is a common workshop aim. This is calculated, not a drill chart.</small>
      </label>
      {drillError ? <p className="failBanner">{drillError}</p> : null}
      {drill ? (
        <div className="resultList">
          <div><span>Calculated drill</span><b>{trimNum(drill.drillMm, 2)} mm</b></div>
          <div><span>Shop estimate d − P</span><b>{trimNum(drill.shopEstimateMm, 2)} mm</b></div>
          <div><span>Basic minor</span><b>{trimNum(drill.basicMinorMm, 2)} mm</b></div>
        </div>
      ) : null}
      <p className="toolNote">{drill?.note} Use the nearest drill you hold. This list is not rounded to a stock drill.</p>
      <h2 style={{ marginTop: 16 }}>Clearance holes</h2>
      {holes ? (
        <div className="resultList">
          <div><span>Close — fine series</span><b>Ø{trimNum(holes.fine, 1)} mm</b></div>
          <div><span>Normal — medium series</span><b>Ø{trimNum(holes.medium, 1)} mm</b></div>
          <div><span>Large — coarse series</span><b>Ø{trimNum(holes.coarse, 1)} mm</b></div>
        </div>
      ) : <p className="failBanner">No ISO 273 nominal for this diameter. Inch clearance holes are not in this dataset.</p>}
      <p className="toolNote">{CLEARANCE_NOTE} Countersink and counterbore sizes are not in this dataset.</p>
      <h2 style={{ marginTop: 16 }}>Engagement</h2>
      <label className="field">
        <span>Tapped-part tensile strength — MPa</span>
        <input className="toolField" inputMode="decimal" value={fuInternal} placeholder={fuBolt ? `Blank uses the bolt, ${fuBolt}` : "Not available"} onChange={(e) => setFuInternal(e.target.value)} />
        <small>Leave blank to assume the tapped part matches the bolt. Steel into aluminium needs the aluminium strength, not the bolt.</small>
      </label>
      {engagementError ? <p className="failBanner">{engagementError}</p> : null}
      {engagement ? (
        <div className="resultList">
          <div><span>Calculated length</span><b>{trimNum(engagement.lengthMm, 1)} mm</b></div>
          <div><span>Rule of thumb, steel</span><b>{trimNum(engagement.ruleOfThumbMm, 1)} mm</b></div>
        </div>
      ) : <p className="toolNote">No bolt tensile strength, so the calculated length is not returned. The one-diameter rule of thumb is still only a rule of thumb.</p>}
      {engagement ? <p className="toolNote">{engagement.note}</p> : null}
      <h2 style={{ marginTop: 16 }}>Drawing callout</h2>
      <div className="resultList">
        <div><span>External</span><b>{callout.external}</b></div>
        <div><span>Tapped hole</span><b>{callout.internal}</b></div>
        <div><span>Clearance, medium</span><b>{callout.clearance ?? "—"}</b></div>
      </div>
      <div className="toolToolbar">
        <button className="toolBtn ghost" type="button" onClick={() => void copy(callout.internal)}>COPY TAPPED HOLE</button>
        <button className="toolBtn ghost" type="button" onClick={() => void copy(callout.external)}>COPY EXTERNAL</button>
        {callout.clearance ? <button className="toolBtn ghost" type="button" onClick={() => void copy(callout.clearance!)}>COPY HOLE</button> : null}
      </div>
      {copied ? <p className="toolNote">Copied {copied}</p> : null}
      <p className="toolNote">{callout.note}</p>
      <h2 style={{ marginTop: 16 }}>Pipe threads</h2>
      <p className="toolNote" style={{ marginTop: 0 }}>{PIPE_WARNING}</p>
      <div className="fieldGrid compact">
        <label className="field">
          <span>Family</span>
          <select className="toolSelect" value={family} onChange={(e) => { setFamily(e.target.value as PipeFamily | ""); setPipeId("") }}>
            <option value="">Select</option>
            <option value="NPT">NPT — tapered, 60°</option>
            <option value="BSPT">BSPT — tapered, 55°</option>
            <option value="BSPP">BSPP / G — parallel, 55°</option>
          </select>
        </label>
        <label className="field">
          <span>Nominal size</span>
          <select className="toolSelect" value={pipeId} onChange={(e) => setPipeId(e.target.value)}>
            <option value="">Select</option>
            {pipes.map((item) => <option key={item.id} value={item.id}>{item.nominal} — {item.tpi} TPI</option>)}
          </select>
        </label>
      </div>
      {pipe ? (
        <div className="resultList">
          <div><span>Standard</span><b>{pipe.standard}</b></div>
          <div><span>Angle</span><b>{pipe.angleDeg}°</b></div>
          <div><span>Form</span><b>{pipe.taper}</b></div>
          <div><span>External</span><b>{pipe.externalName}</b></div>
          <div><span>Internal</span><b>{pipe.internalName}</b></div>
          <div><span>Sealing</span><b>{pipe.seal}</b></div>
        </div>
      ) : null}
    </>
  )
}
