/** Explicit mapping from the elastic panel into AS 4100 symbols. Nothing is copied unless a link exists. */

export type PanelGeometry = {
  aMm: number | null
  bMm: number | null
  tMm: number | null
  fyMpa: number | null
  fuMpa: number | null
}

export type AssignmentSource = keyof PanelGeometry

export type AssignmentField = "clearWidthMm" | "thicknessMm" | "fyMpa" | "fuMpa" | "dpMm" | "twMm" | "d1Mm"

export type AssignmentLink = {
  field: AssignmentField
  source: AssignmentSource
  captured: number
}

export function staleAssignments(links: readonly AssignmentLink[], panel: PanelGeometry): AssignmentLink[] {
  return links.filter((link) => {
    const now = panel[link.source]
    return now == null || !Number.isFinite(now) || Math.abs(now - link.captured) > 1e-6
  })
}

export function withoutStale<T extends object>(design: T, stale: readonly AssignmentLink[]): T {
  const next = { ...design }
  for (const link of stale) delete (next as Record<string, unknown>)[link.field]
  return next
}
