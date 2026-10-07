import { useEffect, useMemo, useState } from "react"
import { parseStrictNumber } from "../reference/format.ts"
import { ConvertError, convert, incompatibility } from "../units/converter.ts"
import { CATEGORIES, unitsInCategory, type UnitDef } from "../units/definitions.ts"
import { formatValue, precise, type Notation } from "../units/format.ts"
import { parseQuantity } from "../units/parser.ts"

const FAV_KEY = "iqeg-ref-unit-favs"
const RECENT_KEY = "iqeg-ref-unit-recent"
const DEFAULT_FAVS = ["pressure", "force", "vol-flow", "power", "density", "angular", "area-inertia", "section-modulus", "length"]
const SIGS = [2, 3, 4, 5, 6, 8]

export function UnitTool({ initialQuery }: { initialQuery: string }) {
  const [categoryId, setCategoryId] = useState("pressure")
  const [activeId, setActiveId] = useState("pressure:MPa")
  const [text, setText] = useState("1")
  const [notation, setNotation] = useState<Notation>("eng")
  const [sig, setSig] = useState(4)
  const [filter, setFilter] = useState("")
  const [error, setError] = useState("")
  const [favs, setFavs] = useState(DEFAULT_FAVS)
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAV_KEY)
      if (saved) setFavs(JSON.parse(saved) as string[])
      const rec = localStorage.getItem(RECENT_KEY)
      if (rec) setRecent(JSON.parse(rec) as string[])
    } catch {
      /* ignore broken local storage */
    }
  }, [])

  useEffect(() => {
    if (!initialQuery) return
    applySmart(initialQuery)
    // only when the routed query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const units = unitsInCategory(categoryId)
  const active = units.find((unit) => unit.id === activeId) ?? units[0]

  const parsed = useMemo(() => {
    if (!active) return { ok: false as const, message: "Unknown unit." }
    try {
      const value = parseStrictNumber(text)
      return { ok: true as const, value }
    } catch (err) {
      return { ok: false as const, message: err instanceof Error ? err.message : "Invalid number." }
    }
  }, [text, active])

  useEffect(() => {
    if (!parsed.ok || !active) return
    const handle = window.setTimeout(() => {
      try {
        const shown = formatValue(parsed.value, sig, notation)
        const line = `${shown} ${active.symbol}`
        setRecent((prev) => {
          const next = [line, ...prev.filter((item) => item !== line)].slice(0, 8)
          localStorage.setItem(RECENT_KEY, JSON.stringify(next))
          return next
        })
      } catch {
        /* storage full or blocked */
      }
    }, 600)
    return () => window.clearTimeout(handle)
  }, [parsed, active, sig, notation])

  function applySmart(raw: string) {
    try {
      const hit = parseQuantity(raw)
      if (!hit) {
        setError("Unknown unit.")
        return
      }
      setError("")
      setCategoryId(hit.unit.category)
      setActiveId(hit.to?.id && hit.to.category === hit.unit.category ? hit.unit.id : hit.unit.id)
      setText(String(hit.value))
      if (hit.to && hit.to.category !== hit.unit.category) {
        const why = incompatibility(hit.unit, hit.to)
        setError(why ?? "Those units are not in the same table.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid number.")
    }
  }

  function converted(unit: UnitDef): string {
    if (!parsed.ok || !active) return "—"
    try {
      return formatValue(convert(parsed.value, active.id, unit.id), sig, notation)
    } catch (err) {
      return err instanceof ConvertError ? "—" : "—"
    }
  }

  function activate(unit: UnitDef) {
    if (!parsed.ok || !active) {
      setActiveId(unit.id)
      return
    }
    try {
      const value = convert(parsed.value, active.id, unit.id)
      setActiveId(unit.id)
      setText(precise(value))
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid conversion.")
    }
  }

  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      localStorage.setItem(FAV_KEY, JSON.stringify(next))
      return next
    })
  }

  const shownCats = CATEGORIES.filter((cat) => {
    const q = filter.trim().toLowerCase()
    if (!q) return true
    return cat.label.toLowerCase().includes(q) || cat.group.toLowerCase().includes(q)
  })
  let group = ""
  return (
    <>
      <div className="titleBlock">
        <div className="tbLogo">IQEG</div>
        <div className="tbMid">
          <p className="tbKicker">IQEG REFERENCE LAB</p>
          <h1 className="tbName">Unit conversion</h1>
        </div>
        <div className="tbMeta">
          <span>IQ-REF-002</span>
          <span>REV 0 · INDICATIVE</span>
          <span>NOT A CERTIFICATE</span>
        </div>
      </div>
      <form className="command" onSubmit={(event) => { event.preventDefault(); applySmart((event.currentTarget.elements.namedItem("smart") as HTMLInputElement).value) }}>
        <input name="smart" className="refSearch" placeholder="350 MPa to psi    ·    7850 kg/m3    ·    1450 rpm" aria-label="Convert a written quantity" />
        <button className="toolBtn" type="submit">CONVERT</button>
      </form>
      {error ? <p className="failBanner">{error}</p> : null}
      <div className="topicChips">
        {favs.map((id) => {
          const cat = CATEGORIES.find((item) => item.id === id)
          if (!cat) return null
          return (
            <button key={id} type="button" className={categoryId === id ? "on" : ""} onClick={() => { setCategoryId(id); const first = unitsInCategory(id)[0]; if (first) setActiveId(first.id) }}>
              {cat.label}
            </button>
          )
        })}
      </div>
      <div className="toolLayout" style={{ marginTop: 14 }}>
        <section className="toolPanel">
          <h2>What to convert</h2>
          <input className="toolField" placeholder="Find a quantity, such as stress" aria-label="Filter quantities" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="catList" style={{ marginTop: 10 }}>
            {shownCats.map((cat) => {
              const head = cat.group !== group
              group = cat.group
              return (
                <span key={cat.id}>
                  {head ? <span className="groupLabel" style={{ display: "block", padding: "8px 12px 0" }}>{cat.group}</span> : null}
                  <button type="button" className={cat.id === categoryId ? "on" : ""} onClick={() => { setCategoryId(cat.id); const first = unitsInCategory(cat.id)[0]; if (first) setActiveId(first.id); setError("") }}>
                    <small>{cat.group}</small>
                    {cat.label}
                  </button>
                </span>
              )
            })}
          </div>
        </section>
        <section className="toolPanel">
          <h2>Your number</h2>
          <p className="identity"><b>{CATEGORIES.find((c) => c.id === categoryId)?.label}</b><span>{CATEGORIES.find((c) => c.id === categoryId)?.blurb}</span></p>
          <label className="field">
            <span>VALUE</span>
            <input className="toolField" value={text} onChange={(e) => { setText(e.target.value); setError("") }} />
          </label>
          <label className="field">
            <span>BASELINE UNIT</span>
            <select
              className="toolSelect"
              aria-label="Baseline unit"
              value={active?.id ?? ""}
              onChange={(e) => {
                const unit = units.find((item) => item.id === e.target.value)
                if (unit) activate(unit)
              }}
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.symbol} — {unit.name}</option>
              ))}
            </select>
          </label>
          <div className="fieldGrid" style={{ marginTop: 10 }}>
            <label className="field">
              <span>NOTATION</span>
              <select className="toolSelect" value={notation} onChange={(e) => setNotation(e.target.value as Notation)}>
                <option value="eng">Engineering</option>
                <option value="sci">Scientific</option>
                <option value="fixed">Fixed decimal</option>
              </select>
            </label>
            <label className="field">
              <span>{notation === "fixed" ? "DECIMAL PLACES" : "SIGNIFICANT FIGURES"}</span>
              <select className="toolSelect" value={sig} onChange={(e) => setSig(Number(e.target.value))}>
                {SIGS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <div className="toolToolbar">
            <button className="toolBtn ghost" type="button" onClick={() => toggleFav(categoryId)}>
              {favs.includes(categoryId) ? "REMOVE FROM BAR" : "PIN TO BAR"}
            </button>
          </div>
          {recent.length > 0 ? (
            <>
              <p className="groupLabel">RECENT</p>
              <ul className="recent">{recent.map((line) => <li key={line}>{line}</li>)}</ul>
            </>
          ) : null}
        </section>
        <section className="toolPanel">
          <h2>Converted values</h2>
          {units.map((unit) => {
            const value = unit.id === active?.id && parsed.ok ? formatValue(parsed.value, sig, notation) : converted(unit)
            return (
              <div key={unit.id} className={unit.id === active?.id ? "unitRow active" : "unitRow"}>
                <strong>{unit.symbol}</strong>
                <input
                  aria-label={unit.name}
                  value={unit.id === active?.id ? text : value}
                  onFocus={() => { if (unit.id !== active?.id) activate(unit) }}
                  onChange={(e) => { setActiveId(unit.id); setText(e.target.value); setError("") }}
                />
                <button className="copyBtn" type="button" onClick={() => void navigator.clipboard.writeText(value)}>COPY</button>
                <button className="copyBtn" type="button" onClick={() => void navigator.clipboard.writeText(`${value} ${unit.symbol}`)}>WITH UNIT</button>
              </div>
            )
          })}
          <p className="toolNote">The baseline unit is the one selected above. Changing it keeps the same physical quantity and rewrites the number. Any row can also become the baseline. Display rounding is not stored. US gallon and Imperial gallon are different.</p>
        </section>
      </div>
    </>
  )
}
