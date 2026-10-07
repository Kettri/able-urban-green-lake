import { Link, useRouterState } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { DATASET_VERSION, DISCLAIMER, ENGINE_VERSION } from "../reference/version.ts"

export function useLabQuery() {
  const searchStr = useRouterState({ select: (s) => s.location.searchStr })
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const params = new URLSearchParams(searchStr)
  return {
    embed: params.get("embed") === "1",
    q: params.get("q") ?? "",
    pathname,
    search: params.get("embed") === "1" ? { embed: "1" } : {},
  }
}

export function labHref(path: string, embed: boolean, q?: string) {
  const params = new URLSearchParams()
  if (embed) params.set("embed", "1")
  if (q) params.set("q", q)
  const s = params.toString()
  return s ? `${path}?${s}` : path
}

type Props = {
  kicker: string
  title: string
  lede: string
  ident: string
  rev: string
  compact?: boolean
  children: ReactNode
}

export function LabShell({ kicker, title, lede, ident, rev, compact, children }: Props) {
  const { embed, pathname } = useLabQuery()
  return (
    <div className={embed ? "isEmbed" : undefined}>
      {embed ? null : (
        <header className="labBar">
          <Link to="/" className="labMark">IQEG</Link>
          <p>ENGINEERING REFERENCE LAB</p>
          <nav className="labNav">
            <Link to="/" className={pathname === "/" ? "on" : ""}>LAB</Link>
            <Link to="/plate" className={pathname.startsWith("/plate") ? "on" : ""}>PLATE</Link>
            <Link to="/bolts" className={pathname.startsWith("/bolts") ? "on" : ""}>BOLTS</Link>
            <Link to="/units" className={pathname.startsWith("/units") ? "on" : ""}>UNITS</Link>
            <a href="/review.html">DOWNLOAD WHOLE APP</a>
            <span className="labVer">ENG {ENGINE_VERSION}</span>
          </nav>
        </header>
      )}
      <section className={compact ? "pageHero pageHeroCompact" : "pageHero"}>
        <p>{kicker}</p>
        <h1>{title}</h1>
        <p>{lede}</p>
        <div className="pageHeroLine">
          <span>{ident}</span>
          <span>{rev}</span>
          <span>NOT A CERTIFICATE</span>
          <Link to="/">ALL REFERENCES</Link>
        </div>
      </section>
      <section className="drawingOffice">
        <div className="printOnly">
          <p>IQEG ENGINEERING REFERENCE LAB · {ident} · ENGINE {ENGINE_VERSION} · DATA {DATASET_VERSION}</p>
          <h1>{title}</h1>
        </div>
        {children}
        <aside className="toolWarning">
          <b>ENGINEERING NOTE</b>
          {DISCLAIMER} Engine v{ENGINE_VERSION}. Fastener DB v{DATASET_VERSION}.
        </aside>
      </section>
    </div>
  )
}
