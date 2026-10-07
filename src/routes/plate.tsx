import { createFileRoute } from "@tanstack/react-router"
import { PlateTool } from "../components/plate-tool.tsx"
import { LabShell } from "../components/lab-shell.tsx"

export const Route = createFileRoute("/plate")({
  validateSearch: (search: Record<string, unknown>): { embed?: "1" } => {
    const out: { embed?: "1" } = {}
    if (search.embed === "1") out.embed = "1"
    return out
  },
  component: PlatePage,
})

function PlatePage() {
  return (
    <LabShell
      kicker="IQEG / PLATE STABILITY"
      title="Plate and panel buckling."
      lede="Elastic critical stress for a rectangular panel, with a separate finite-element check. AS 4100 plate and web checks are on DESIGN, freeze IQ-PLB-AS4100-D1.0. That is a verified subset, not a complete member design."
      ident="IQ-CAL-PLB"
      rev="REV 0"
      compact
    >
      <PlateTool />
    </LabShell>
  )
}
