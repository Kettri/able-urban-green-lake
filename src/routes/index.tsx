import { createFileRoute, Link } from "@tanstack/react-router"
import { CommandBar } from "../components/command-bar.tsx"
import { LabShell, useLabQuery } from "../components/lab-shell.tsx"
import { LAB_MODULES } from "../reference/registry.ts"

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { embed?: "1"; q?: string } => {
    const out: { embed?: "1"; q?: string } = {}
    if (search.embed === "1") out.embed = "1"
    if (typeof search.q === "string") out.q = search.q
    return out
  },
  component: Home,
})

function Home() {
  const { embed } = useLabQuery()
  const groups = [...new Set(LAB_MODULES.map((item) => item.group))]
  return (
    <LabShell
      kicker="IQEG ENGINEERING REFERENCE LAB"
      title="Engineering reference."
      lede="Three working tools. Plate buckling: elastic critical stress, with a separate finite-element check. Bolts: thread, strength, mass, and an optional AS 4100 check. Units: one number fills the table, and a mismatched dimension is refused. Indicative — not a certificate."
      ident="IQ-CAL-PLB — IQ-REF-002"
      rev="REV 0 · INDICATIVE"
    >
      <CommandBar />
      <section className="calRegister">
        <p>OPEN</p>
        {LAB_MODULES.filter((item) => item.status === "live").map((item) => {
          const search = embed ? { embed: "1" as const } : undefined
          const body = (
            <>
              <span>{item.id}</span>
              <div>
                <b>{item.title}</b>
                <p>{item.summary}</p>
              </div>
              <strong>OPEN</strong>
            </>
          )
          if (item.href === "/plate") {
            return <Link key={item.id} to="/plate" search={search} className="calRow">{body}</Link>
          }
          if (item.href === "/bolts") {
            return <Link key={item.id} to="/bolts" search={search} className="calRow">{body}</Link>
          }
          return <Link key={item.id} to="/units" search={search} className="calRow">{body}</Link>
        })}
      </section>
      <details className="planned">
        <summary>PLANNED REFERENCES — NOT BUILT</summary>
        <section className="calRegister">
          {groups.filter((group) => LAB_MODULES.some((item) => item.group === group && item.status === "later")).map((group) => (
            <div key={group}>
              <p>{group}</p>
              {LAB_MODULES.filter((item) => item.group === group && item.status === "later").map((item) => (
                <div key={item.id} className="calRow later">
                  <span>{item.id}</span>
                  <div>
                    <b>{item.title}</b>
                    <p>{item.summary}</p>
                  </div>
                  <strong>NOT BUILT</strong>
                </div>
              ))}
            </div>
          ))}
        </section>
      </details>
    </LabShell>
  )
}
