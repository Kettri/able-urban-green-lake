import { createFileRoute } from "@tanstack/react-router"
import { CommandBar } from "../components/command-bar.tsx"
import { LabShell } from "../components/lab-shell.tsx"
import { UnitTool } from "../components/unit-tool.tsx"

export const Route = createFileRoute("/units")({
  validateSearch: (search: Record<string, unknown>): { embed?: "1"; q?: string } => {
    const out: { embed?: "1"; q?: string } = {}
    if (search.embed === "1") out.embed = "1"
    if (typeof search.q === "string") out.q = search.q
    return out
  },
  component: UnitsPage,
})

function UnitsPage() {
  const { q } = Route.useSearch()
  return (
    <LabShell
      kicker="IQEG / ENGINEERING REFERENCE"
      title="Unit converter."
      lede="Type a value in any row, or a line such as 350 MPa to psi. Every other unit in that quantity updates. Temperature includes the offset. A unit from a different quantity is refused."
      ident="IQ-REF-002"
      rev="REV 0 · INDICATIVE"
    >
      <CommandBar initial={q ?? ""} />
      <UnitTool initialQuery={q ?? ""} />
    </LabShell>
  )
}
