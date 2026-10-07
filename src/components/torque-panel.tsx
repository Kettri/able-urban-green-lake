import { useMemo, useState } from "react"
import { METRIC_SIZES } from "../bolts/database.ts"
import { classBand, STAINLESS_CLASSES } from "../bolts/materials.ts"
import { threadProfile } from "../bolts/threadGeometry.ts"
import { boltTorque, FRICTION_PRESETS, TORQUE_WARNING } from "../bolts/torque.ts"
import { trimNum } from "../reference/format.ts"
import { buildSheet } from "../bolts/model.ts"

const PERCENTS = [50, 60, 70, 75, 80, 90]

export function TorquePanel({ sheet, classId }: { sheet: ReturnType<typeof buildSheet>; classId: string }) {
  const [preset, setPreset] = useState("user")
  const [kText, setKText] = useState("")
  const [percent, setPercent] = useState("70")
  const [manual, setManual] = useState("")
  const [torque, setTorque] = useState("")
  const [muT, setMuT] = useState("")
  const [muB, setMuB] = useState("")
  const [od, setOd] = useState("")
  const [id, setId] = useState("")
  const [stainless, setStainless] = useState("")
  const profile = sheet.profile
  const chosen = STAINLESS_CLASSES.find((item) => item.id === stainless)
  const basisMPa = chosen ? chosen.rp : sheet.band?.sp ?? 0
  const basisName = chosen ? `${chosen.id} Rp0.2` : "Proof stress Sp"

  const parsed = useMemo(() => {
    if (!profile || !(basisMPa > 0)) return { ok: false as const, reason: "No stress area or proof stress for this bolt." }
    return boltTorque({
      dMm: sheet.dMm,
      pitchMm: sheet.pitchMm,
      d2Mm: profile.d2,
      asMm2: profile.As,
      basisMPa,
      basisName,
      percent: numOrNull(percent),
      manualKn: numOrNull(manual),
      k: numOrNull(kText),
      torqueNm: numOrNull(torque),
      muThread: numOrNull(muT),
      muBearing: numOrNull(muB),
      bearingOdMm: numOrNull(od),
      bearingIdMm: numOrNull(id),
    })
  }, [profile, sheet.dMm, sheet.pitchMm, basisMPa, basisName, percent, manual, kText, torque, muT, muB, od, id])

  function pickPreset(id: string) {
    setPreset(id)
    const item = FRICTION_PRESETS.find((row) => row.id === id)
    setKText(item?.k == null ? "" : String(item.k))
  }

  const activePreset = FRICTION_PRESETS.find((item) => item.id === preset)
  const rows = METRIC_SIZES.filter((size) => size.d <= 30 || size.d === sheet.dMm)

  return (
    <>
      <p className="failBanner">{TORQUE_WARNING}</p>
      <p className="toolNote" style={{ marginTop: 0 }}>
        Proof load, yield and tensile strength are different. A percentage is not a recommendation. Carbon-steel class properties are not applied to a stainless fastener.
      </p>
      <div className="fieldGrid compact">
        <label className="field">
          <span>Installation condition</span>
          <select className="toolSelect" value={preset} onChange={(e) => pickPreset(e.target.value)}>
            {FRICTION_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <small>{activePreset?.note} The value below is what is actually used. Edit it.</small>
        </label>
        <label className="field">
          <span>Nut factor K</span>
          <input className="toolField" inputMode="decimal" value={kText} onChange={(e) => setKText(e.target.value)} />
          <small>T = K × F × d. K is not hidden.</small>
        </label>
        <label className="field">
          <span>Percent of proof load</span>
          <select className="toolSelect" value={percent} onChange={(e) => setPercent(e.target.value)}>
            <option value="">Not used</option>
            {PERCENTS.map((item) => <option key={item} value={item}>{item}%</option>)}
          </select>
        </label>
        <label className="field">
          <span>Or target preload — kN</span>
          <input className="toolField" inputMode="decimal" value={manual} onChange={(e) => setManual(e.target.value)} />
          <small>If you type a preload, it replaces the percentage.</small>
        </label>
        <label className="field">
          <span>Installation torque — N·m</span>
          <input className="toolField" inputMode="decimal" value={torque} onChange={(e) => setTorque(e.target.value)} />
          <small>With K, this estimates preload. It does not verify tension.</small>
        </label>
        <label className="field">
          <span>Stainless basis, optional</span>
          <select className="toolSelect" value={stainless} onChange={(e) => setStainless(e.target.value)}>
            <option value="">Use this bolt's proof stress</option>
            {STAINLESS_CLASSES.map((item) => <option key={item.id} value={item.id}>{item.id} — Rp0.2 {item.rp} MPa</option>)}
          </select>
          <small>Reference only. It does not change the AS 4100 check.</small>
        </label>
      </div>
      {!parsed.ok ? <p className="failBanner">{parsed.reason}</p> : (
        <div className="resultList" style={{ marginTop: 12 }}>
          <div><span>{basisName}</span><b>{trimNum(parsed.proofKn, 2)} kN</b></div>
          <div><span>Preload from percent</span><b>{parsed.fromPercentKn == null ? "—" : `${trimNum(parsed.fromPercentKn, 2)} kN`}</b></div>
          <div><span>Torque from that preload</span><b>{parsed.torqueFromPreloadNm == null ? "Enter K" : `${trimNum(parsed.torqueFromPreloadNm, 1)} N·m`}</b></div>
          <div><span>Preload from the torque</span><b>{parsed.fromTorqueKn == null ? "Enter torque and K" : `${trimNum(parsed.fromTorqueKn, 2)} kN`}</b></div>
          <div><span>That preload / proof</span><b>{parsed.percentOfProof == null ? "—" : `${trimNum(parsed.percentOfProof, 1)}%`}</b></div>
          <div><span>Thread torque</span><b>{parsed.threadNm == null ? "Needs μ and washer diameters" : `${trimNum(parsed.threadNm, 1)} N·m`}</b></div>
          <div><span>Bearing torque</span><b>{parsed.bearingNm == null ? "—" : `${trimNum(parsed.bearingNm, 1)} N·m`}</b></div>
          <div><span>Split total</span><b>{parsed.advancedNm == null ? "—" : `${trimNum(parsed.advancedNm, 1)} N·m`}</b></div>
          <div><span>K implied by the split</span><b>{parsed.kFromAdvanced == null ? "—" : trimNum(parsed.kFromAdvanced, 3)}</b></div>
        </div>
      )}
      <details className="toolGloss">
        <summary>SPLIT THE TORQUE — THREAD AND BEARING</summary>
        <div className="inner">
          <p className="toolNote" style={{ marginTop: 0 }}>No washer is assumed. Enter both friction coefficients and the face that actually rubs. The installation condition does not fill these.</p>
          <div className="fieldGrid compact">
            <label className="field"><span>μ thread</span><input className="toolField" inputMode="decimal" value={muT} onChange={(e) => setMuT(e.target.value)} /></label>
            <label className="field"><span>μ bearing</span><input className="toolField" inputMode="decimal" value={muB} onChange={(e) => setMuB(e.target.value)} /></label>
            <label className="field"><span>Bearing outside — mm</span><input className="toolField" inputMode="decimal" value={od} onChange={(e) => setOd(e.target.value)} /></label>
            <label className="field"><span>Bearing inside — mm</span><input className="toolField" inputMode="decimal" value={id} onChange={(e) => setId(e.target.value)} /></label>
          </div>
        </div>
      </details>
      {parsed.ok ? (
        <details className="toolGloss">
          <summary>SHOW THE ARITHMETIC</summary>
          <div className="inner">
            <div className="toolTableWrap">
              <table className="toolTable">
                <thead><tr><th>Step</th><th>Equation</th><th>Substitution</th><th>Result</th></tr></thead>
                <tbody>
                  {parsed.steps.map((step) => (
                    <tr key={step.label}><td>{step.label}</td><td>{step.equation}</td><td>{step.substitution}</td><td>{step.result}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      ) : null}
      <h2 style={{ marginTop: 16 }}>Coarse sizes at this K and percent</h2>
      <p className="toolNote" style={{ marginTop: 0 }}>
        Calculated for metric coarse pitch and {basisName}. K = {kText.trim() || "not set"}. Percent = {percent || "not set"}. Not a published torque chart.
      </p>
      <div className="toolTableWrap">
        <table className="toolTable">
          <thead><tr><th>Bolt</th><th>As mm²</th><th>Proof kN</th><th>Preload kN</th><th>Torque N·m</th></tr></thead>
          <tbody>
            {rows.map((size) => {
              const band = chosen ? { sp: chosen.rp } : classBand(classId, size.d)
              if (!band) return null
              const thread = threadProfile(size.d, size.coarse)
              const result = boltTorque({
                dMm: size.d,
                pitchMm: size.coarse,
                d2Mm: thread.d2,
                asMm2: thread.As,
                basisMPa: band.sp,
                basisName,
                percent: numOrNull(percent),
                manualKn: null,
                k: numOrNull(kText),
                torqueNm: null,
                muThread: null,
                muBearing: null,
                bearingOdMm: null,
                bearingIdMm: null,
              })
              if (!result.ok) return null
              return (
                <tr key={size.d} className={size.d === sheet.dMm ? "active" : ""}>
                  <td>M{size.d} × {size.coarse}</td>
                  <td>{trimNum(thread.As, 1)}</td>
                  <td>{trimNum(result.proofKn, 1)}</td>
                  <td>{result.fromPercentKn == null ? "—" : trimNum(result.fromPercentKn, 1)}</td>
                  <td>{result.torqueFromPreloadNm == null ? "—" : trimNum(result.torqueFromPreloadNm, 1)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="toolNote">Structural installation methods — tension-control bolts, direct tension indicators, turn-of-nut — belong to the bolting standard and the project specification. They are not this torque estimate, and they are not mixed with an ordinary machine-bolt K.</p>
    </>
  )
}

function numOrNull(raw: string): number | null {
  if (!raw.trim()) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}
