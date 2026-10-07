import { classicalPlate, type Edges } from "./classical.ts"
import type { StiffenerInput } from "./stiffeners.ts"

export type PanelGeom = {
  id: string
  col: number
  row: number
  x0: number
  x1: number
  y0: number
  y1: number
  aMm: number
  bMm: number
  alpha: number
  sigmaBottom: number
  sigmaTop: number
  psi: number
  tau: number
  closedForm: boolean
  sigmaCrMpa: number | null
  kSigma: number | null
  m: number | null
  n: number | null
  /** Classical value if every edge were simply supported. Not a verified stiffener restraint. */
  ssEstimateMpa: number | null
  status: string
}

function uniqueStations(length: number, values: number[]): number[] {
  const raw = values.filter((v) => v > length * 1e-4 && v < length * (1 - 1e-4))
  raw.sort((p, q) => p - q)
  const out: number[] = []
  for (const v of raw) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]!) > Math.max(0.5, length * 1e-4)) out.push(v)
  }
  return out
}

function sigmaAt(sigma1: number, psi: number, y: number, b: number): number {
  if (!(b > 0)) return sigma1
  return sigma1 * (1 - (1 - psi) * (y / b))
}

export function buildPanels(input: {
  aMm: number
  bMm: number
  tMm: number
  eMpa: number
  nu: number
  fyMpa: number
  fuMpa: number
  sigma1Mpa: number
  psi: number
  tauMpa: number
  edges: Edges
  stiffeners: StiffenerInput[]
}): PanelGeom[] {
  const xs = [0, ...uniqueStations(input.aMm, input.stiffeners.filter((s) => s.axis === "y").map((s) => s.atMm)), input.aMm]
  const ys = [0, ...uniqueStations(input.bMm, input.stiffeners.filter((s) => s.axis === "x").map((s) => s.atMm)), input.bMm]
  const panels: PanelGeom[] = []
  let id = 1
  for (let row = 0; row < ys.length - 1; row++) {
    for (let col = 0; col < xs.length - 1; col++) {
      const x0 = xs[col]!
      const x1 = xs[col + 1]!
      const y0 = ys[row]!
      const y1 = ys[row + 1]!
      const aMm = x1 - x0
      const bMm = y1 - y0
      const sigmaBottom = sigmaAt(input.sigma1Mpa, input.psi, y0, input.bMm)
      const sigmaTop = sigmaAt(input.sigma1Mpa, input.psi, y1, input.bMm)
      const psi = Math.abs(sigmaBottom) > 1e-9 ? sigmaTop / sigmaBottom : Math.abs(sigmaTop) > 1e-9 ? 0 : 1
      const touchesStiffener = col > 0 || col < xs.length - 2 || row > 0 || row < ys.length - 2
      const parentClosed = !touchesStiffener
        && input.edges.x0 === "ss" && input.edges.x1 === "ss" && input.edges.y0 === "ss" && input.edges.y1 === "ss"
      const localEdges: Edges = { x0: "ss", x1: "ss", y0: "ss", y1: "ss" }
      const estimate = aMm > 0 && bMm > 0
        ? classicalPlate({
          aMm,
          bMm,
          tMm: input.tMm,
          eMpa: input.eMpa,
          nu: input.nu,
          fyMpa: input.fyMpa,
          fuMpa: input.fuMpa,
          sigma1Mpa: Math.abs(sigmaBottom) > 1e-9 ? sigmaBottom : sigmaTop,
          psi,
          tauMpa: input.tauMpa,
          edges: localEdges,
        })
        : null
      const closed = parentClosed ? estimate : null
      panels.push({
        id: `P${id}`,
        col,
        row,
        x0,
        x1,
        y0,
        y1,
        aMm,
        bMm,
        alpha: bMm > 0 ? aMm / bMm : 0,
        sigmaBottom,
        sigmaTop,
        psi,
        tau: input.tauMpa,
        closedForm: Boolean(closed?.ok && closed.kSigma != null),
        sigmaCrMpa: closed?.ok ? closed.sigmaCrMpa : null,
        kSigma: closed?.ok ? closed.kSigma : null,
        m: closed?.ok ? closed.m : null,
        n: closed?.ok ? closed.n : null,
        ssEstimateMpa: estimate?.ok ? estimate.sigmaCrMpa : null,
        status: touchesStiffener
          ? "GEOMETRIC SUBPANEL IDENTIFIED. STIFFENER DESIGN ADEQUATE: NOT VERIFIED. SUBPANEL EDGE ASSUMED FULLY RESTRAINED: NO. STIFFENER ADEQUACY NOT YET VERIFIED."
          : parentClosed
            ? "GEOMETRIC SUBPANEL IDENTIFIED. No stiffener cut. Closed form uses the plate edges as entered, not an assumed stiffener restraint."
            : "GEOMETRIC SUBPANEL IDENTIFIED. NO CLOSED-FORM SOLUTION — FEM REQUIRED. SUBPANEL EDGE ASSUMED FULLY RESTRAINED: NO.",
      })
      id += 1
    }
  }
  return panels
}

export type ModeClass = {
  kind: "GLOBAL PANEL MODE" | "LOCAL SUBPANEL MODE" | "MIXED MODE" | "UNSTIFFENED PANEL"
  panelId: string
  note: string
}

/** Kinematic reading of a normalised eigenmode. Not a code classification. */
export function classifyMode(w: number[], xs: number[], ys: number[], panels: PanelGeom[]): ModeClass {
  if (w.length !== xs.length * ys.length || panels.length === 0) {
    return { kind: "UNSTIFFENED PANEL", panelId: "", note: "No eigenmode was returned." }
  }
  if (panels.length === 1) {
    return { kind: "UNSTIFFENED PANEL", panelId: panels[0]!.id, note: "One panel. The mode is the panel mode." }
  }
  const energy = panels.map((panel) => {
    let sum = 0
    let count = 0
    let signed = 0
    for (let iy = 0; iy < ys.length; iy++) {
      const y = ys[iy]!
      if (y < panel.y0 - 1e-6 || y > panel.y1 + 1e-6) continue
      for (let ix = 0; ix < xs.length; ix++) {
        const x = xs[ix]!
        if (x < panel.x0 - 1e-6 || x > panel.x1 + 1e-6) continue
        const value = w[iy * xs.length + ix] ?? 0
        sum += value * value
        signed += value
        count += 1
      }
    }
    return { id: panel.id, sum, mean: count ? signed / count : 0 }
  })
  const total = energy.reduce((s, row) => s + row.sum, 0)
  if (!(total > 0)) return { kind: "MIXED MODE", panelId: "", note: "The eigenmode has no transverse displacement to classify." }
  const ranked = energy.map((row) => ({ ...row, share: row.sum / total })).sort((p, q) => q.share - p.share)
  const top = ranked[0]!
  const second = ranked[1]?.share ?? 0
  const signChanges = ranked.filter((row) => Math.abs(row.mean) > 1e-4).some((row, index, list) => {
    const other = list[index + 1]
    return other ? row.mean * other.mean < 0 : false
  })
  if (top.share >= 0.55 && second <= 0.35) {
    return {
      kind: "LOCAL SUBPANEL MODE",
      panelId: top.id,
      note: `${top.id} holds ${Math.round(top.share * 100)}% of the squared displacement. Adjacent panels are quieter. This is a reading of the eigenmode, not a proof that the stiffener is a simple support.`,
    }
  }
  if (top.share < 0.5 && !signChanges) {
    return {
      kind: "GLOBAL PANEL MODE",
      panelId: "",
      note: "Displacement energy is spread across the stiffener lines without a single panel dominating.",
    }
  }
  return {
    kind: "MIXED MODE",
    panelId: top.id,
    note: signChanges
      ? `The eigenmode changes sign between panels. The largest share is ${top.id} at ${Math.round(top.share * 100)}%.`
      : `No single panel dominates. The largest share is ${top.id} at ${Math.round(top.share * 100)}%.`,
  }
}
