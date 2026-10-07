import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import { BoltTool } from "../components/bolt-tool.tsx"
import { CommandBar } from "../components/command-bar.tsx"
import { LabShell } from "../components/lab-shell.tsx"
import { DEFAULT_SELECTION, selectionFromQuery } from "../bolts/model.ts"
import { parseBoltQuery } from "../bolts/search.ts"

export const Route = createFileRoute("/bolts")({
  validateSearch: (search: Record<string, unknown>): { embed?: "1"; q?: string } => {
    const out: { embed?: "1"; q?: string } = {}
    if (search.embed === "1") out.embed = "1"
    if (typeof search.q === "string") out.q = search.q
    return out
  },
  component: BoltsPage,
})

function BoltsPage() {
  const { q } = Route.useSearch()
  const query = useMemo(() => (q ? parseBoltQuery(q) : null), [q])
  const resolved = useMemo(() => {
    if (!query?.matched) return { selection: DEFAULT_SELECTION, warn: query ? "No bolt matched that search." : "" }
    const next = selectionFromQuery(query)
    if ("error" in next) return { selection: DEFAULT_SELECTION, warn: next.error }
    return { selection: next, warn: "" }
  }, [query])
  return (
    <LabShell
      kicker="IQEG / ENGINEERING REFERENCE"
      title="Bolt and fastener reference."
      lede="Look up a bolt, then run the AS 4100 check only if you need it. The check is written in words: what you apply, where the shear cuts the bolt, and whether the plate is included. Classes 4.6, 8.8 and 10.9 only."
      ident="IQ-REF-001"
      rev="REV 0 · INDICATIVE"
    >
      <CommandBar initial={q ?? ""} />
      {resolved.warn ? <p className="failBanner">{resolved.warn}</p> : null}
      <BoltTool start={resolved.selection} query={query} />
    </LabShell>
  )
}
