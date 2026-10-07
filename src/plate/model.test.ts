import assert from "node:assert/strict"
import { test } from "node:test"
import { as4100PlateChecks } from "./codes/as4100.ts"
import { plateGirderWeb } from "./girder.ts"
import { solvePlateFem } from "./fem.ts"
import { stiffenerProps } from "./stiffeners.ts"
import { buildPanels, classifyMode } from "./subpanels.ts"

const SS = { x0: "ss" as const, x1: "ss" as const, y0: "ss" as const, y1: "ss" as const }

test("flat bar second moment is about the plate mid-surface", () => {
  const props = stiffenerProps({
    id: "S1", axis: "x", atMm: 500, kind: "flat", hMm: 80, twMm: 10, bfMm: 0, tfMm: 0,
    eMpa: 210000, fyMpa: 350, rigid: false,
  }, 10)
  assert.equal(props.areaMm2, 800)
  assert.equal(props.centroidFromFaceMm, 40)
  assert.ok(Math.abs(props.iMm4 - 2.0466667e6) < 2)
  assert.ok(props.eiNmm2 === 210000 * props.iMm4)
})

test("one longitudinal stiffener makes two panels that are not closed form", () => {
  const panels = buildPanels({
    aMm: 2000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, fyMpa: 350, fuMpa: 480,
    sigma1Mpa: 100, psi: 1, tauMpa: 0, edges: SS,
    stiffeners: [{ id: "S1", axis: "x", atMm: 400, kind: "flat", hMm: 80, twMm: 10, bfMm: 0, tfMm: 0, eMpa: 210000, fyMpa: 350, rigid: false }],
  })
  assert.equal(panels.length, 2)
  assert.equal(panels[0]?.id, "P1")
  assert.equal(panels.every((panel) => panel.closedForm), false)
  assert.match(panels[0]?.status ?? "", /STIFFENER ADEQUACY NOT YET VERIFIED/)
})

test("symmetric girder web bending gives ψ near −1", () => {
  const girder = plateGirderWeb({
    hwMm: 1200, twMm: 10, bfTopMm: 300, tfTopMm: 20, bfBotMm: 300, tfBotMm: 20,
    momentNmm: 800e6, shearN: 400e3,
  })
  assert.equal(girder.ok, true)
  assert.ok(girder.psi != null && Math.abs(girder.psi + 1) < 1e-6)
  assert.ok((girder.sigmaTopMpa ?? 0) > 0)
  assert.ok((girder.sigmaBottomMpa ?? 0) < 0)
})

test("AS 4100 does not take the panel width as code b", () => {
  const rows = as4100PlateChecks({ aMm: 2000, bMm: 1000, tMm: 10, fyMpa: 350, edgesSimplySupported: true, stiffenerCount: 0 })
  const slenderness = rows.find((row) => row.id === "slenderness")
  const fence = rows.find((row) => row.id === "dimension-fence")
  assert.equal(slenderness?.status, "not-checked")
  assert.equal(slenderness?.result, "NOT CHECKED")
  assert.equal(fence?.result, "NOT USED")
  assert.ok(!/λe,b/.test(slenderness?.result ?? ""))
})

test("α = 2 eigenmode has two half-waves, not one invented sine", () => {
  const fem = solvePlateFem({
    aMm: 2000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3,
    sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 16, ny: 8, edges: SS, krNPerRadPerMm: 0, modes: 1,
  })
  const w = fem.modes[0]?.w ?? []
  const iy = Math.round((fem.ys.length - 1) / 2)
  const line = fem.xs.map((_, ix) => w[iy * fem.xs.length + ix] ?? 0)
  let changes = 0
  let prev = 0
  for (const value of line) {
    if (Math.abs(value) < 1e-6) continue
    const sign = Math.sign(value)
    if (prev !== 0 && prev * sign < 0) changes += 1
    prev = sign
  }
  assert.equal(changes, 1)
  assert.equal(classifyMode(w, fem.xs, fem.ys, [{ id: "P1", col: 0, row: 0, x0: 0, x1: 2000, y0: 0, y1: 1000, aMm: 2000, bMm: 1000, alpha: 2, sigmaBottom: 1, sigmaTop: 1, psi: 1, tau: 0, closedForm: true, sigmaCrMpa: 1, kSigma: 4, m: 2, n: 1, ssEstimateMpa: 1, status: "" }]).kind, "UNSTIFFENED PANEL")
})
