import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import { BoltTool } from "../components/bolt-tool.tsx"
import { CommandBar } from "../components/command-bar.tsx"
import { LabShell } from "../components/lab-shell.tsx"
import { DEFAULT_SELECTION, selectionFromSlug } from "../bolts/model.ts"

export const Route = createFileRoute("/bolts/$slug")({
  validateSearch: (search: Record<string, unknown>): { embed?: "1" } => {
    const out: { embed?: "1" } = {}
    if (search.embed === "1") out.embed = "1"
    return out
  },
  component: BoltSlugPage,
})

function BoltSlugPage() {
  const { slug } = Route.useParams()
  const resolved = useMemo(() => {
    const next = selectionFromSlug(slug)
    if ("error" in next) return { selection: DEFAULT_SELECTION, warn: next.error }
    return { selection: next, warn: "" }
  }, [slug])
  return (
    <LabShell
      kicker="IQEG / ENGINEERING REFERENCE"
      title="Bolt and fastener reference."
      lede="Direct link to one bolt. Confirm the standard before you use the number."
      ident="IQ-REF-001"
      rev="REV 0 · INDICATIVE"
    >
      <CommandBar />
      {resolved.warn ? <p className="failBanner">{resolved.warn}</p> : null}
      <BoltTool start={resolved.selection} query={null} />
    </LabShell>
  )
}
