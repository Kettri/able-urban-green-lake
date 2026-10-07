import assert from "node:assert/strict"
import { test } from "node:test"
import { kShearSeries } from "./classical.ts"
import { designChecks } from "./codes/dispatch.ts"
import { solvePlateFem } from "./fem.ts"
import { modeMac } from "./mac.ts"
import { ELASTIC_ENGINE } from "./version.ts"

const SS = { x0: "ss" as const, x1: "ss" as const, y0: "ss" as const, y1: "ss" as const }

test("shear series from order 12 to 16 has settled", () => {
  for (const alpha of [0.5, 1, 2, 4]) {
    const coarse = kShearSeries(alpha, 12)
    const fine = kShearSeries(alpha, 16)
    assert.ok(coarse && fine)
    const change = Math.abs(fine.k - coarse.k) / coarse.k
    assert.ok(change < 0.001, `α=${alpha} Δ=${change} k16=${fine.k}`)
  }
  const square = kShearSeries(1, 16)
  assert.ok(square && square.k > 9.3 && square.k < 9.35, String(square?.k))
})

test("production bending modes stay positive and the 60×21 residual stays tiny", () => {
  const fem = solvePlateFem({
    aMm: 5000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3,
    sigma1Mpa: 100, psi: -1, tauMpa: 0, nx: 60, ny: 21,
    edges: SS, krNPerRadPerMm: 0, modes: 3, shapes: true,
  })
  assert.equal(fem.ok, true, fem.reason)
  assert.ok(fem.modes.every((mode) => mode.lambda > 0))
  assert.ok(fem.spectrum.some((row) => row.lambda < 0))
  const stress = fem.modes[0]?.sigma1CrMpa ?? 0
  assert.ok(Math.abs(stress - 457.09) / 457.09 < 0.002, String(stress))
  assert.ok(fem.residual < 1e-8, String(fem.residual))
  assert.match(fem.note, /IQ-PLB-E1\.0/)
  assert.match(fem.note, /positive eigenvalues only/i)
  const mac = modeMac(fem.modes[0]!.w, fem.xs, fem.ys, fem.modes[0]!.w, fem.xs, fem.ys)
  const flipped = fem.modes[0]!.w.map((value) => -value)
  assert.ok(mac > 0.999)
  assert.ok(modeMac(flipped, fem.xs, fem.ys, fem.modes[0]!.w, fem.xs, fem.ys) > 0.999)
})

test("design methods do not invent a resistance", () => {
  const input = { aMm: 1000, bMm: 500, tMm: 10, fyMpa: 350, edgesSimplySupported: true, stiffenerCount: 1, hasPatch: true }
  for (const method of ["none", "as4100", "en1993", "as5224"] as const) {
    const rows = designChecks(method, input)
    assert.ok(rows.some((row) => row.id === "elastic-fence"))
    assert.ok(rows.every((row) => row.result !== "PASS" && !/^\d+(\.\d+)?\s*kN/.test(row.result)))
  }
  assert.equal(ELASTIC_ENGINE.id, "IQ-PLB-E1.0")
})
