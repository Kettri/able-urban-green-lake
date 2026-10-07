import assert from "node:assert/strict"
import { test } from "node:test"
import { classicalPlate, galerkinSigma, kShear, kShearSeries, kUniform, biaxialUniform, type Edges } from "./classical.ts"

const SS: Edges = { x0: "ss", x1: "ss", y0: "ss", y1: "ss" }

const steel = { eMpa: 210000, nu: 0.3, fyMpa: 350, fuMpa: 450, tauMpa: 0, sigma1Mpa: 100 }

test("A square plate uniform compression k = 4", () => {
  const exact = kUniform(1)
  assert.equal(exact.m, 1)
  assert.ok(Math.abs(exact.k - 4) < 1e-12)
  const row = classicalPlate({ aMm: 1000, bMm: 1000, tMm: 10, psi: 1, edges: SS, ...steel })
  assert.equal(row.ok, true)
  assert.ok(row.kSigma != null && Math.abs(row.kSigma - 4) < 1e-12)
  assert.equal(row.m, 1)
  const expect = (4 * Math.PI ** 2 * 210000 * (10 / 1000) ** 2) / (12 * (1 - 0.3 ** 2))
  assert.ok(row.sigmaCrMpa != null && Math.abs(row.sigmaCrMpa - expect) / expect < 1e-12)
})

test("Galerkin recovers uniform k = 4", () => {
  const g = galerkinSigma({ aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, psi: 1 })
  assert.ok(g)
  assert.ok(Math.abs(g.k - 4) < 1e-6)
})

test("B square plate shear fit", () => {
  assert.ok(Math.abs(kShear(1) - 9.34) < 1e-12)
  const row = classicalPlate({ aMm: 800, bMm: 800, tMm: 8, psi: 1, edges: SS, ...steel, tauMpa: 40, sigma1Mpa: 0 })
  assert.ok(row.kTau != null && Math.abs(row.kTau - 9.34) < 1e-12)
  assert.ok(row.tauCrMpa != null && row.tauCrMpa > 0)
})

test("C long plate bending gradient approaches 23.9", () => {
  const g = galerkinSigma({ aMm: 6000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, psi: -1, nMax: 8, mMax: 12 })
  assert.ok(g)
  assert.ok(Math.abs(g.k - 23.9) / 23.9 < 0.03, `k=${g.k}`)
})

test("C pure compression to zero stress edge approaches 7.81", () => {
  const g = galerkinSigma({ aMm: 5000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, psi: 0, nMax: 8, mMax: 12 })
  assert.ok(g)
  assert.ok(Math.abs(g.k - 7.81) / 7.81 < 0.03, `k=${g.k}`)
})

test("D aspect ratios pick the right half-wave", () => {
  const cases: [number, number, number][] = [
    [0.5, 1, 6.25],
    [1, 1, 4],
    [2, 2, 4],
    [4, 4, 4],
  ]
  for (const [alpha, m, k] of cases) {
    const got = kUniform(alpha)
    assert.equal(got.m, m)
    assert.ok(Math.abs(got.k - k) < 1e-9)
    const row = classicalPlate({
      aMm: alpha * 1000,
      bMm: 1000,
      tMm: 10,
      psi: 1,
      edges: SS,
      ...steel,
    })
    assert.equal(row.m, m)
    assert.ok(row.kSigma != null && Math.abs(row.kSigma - k) < 1e-9)
  }
})

test("clamped edges do not invent a coefficient", () => {
  const row = classicalPlate({
    aMm: 1000,
    bMm: 1000,
    tMm: 10,
    psi: 1,
    edges: { x0: "fixed", x1: "ss", y0: "ss", y1: "ss" },
    ...steel,
  })
  assert.equal(row.kSigma, null)
  assert.ok(row.warnings.some((line) => line.includes("unavailable")))
})

test("bad thickness fails closed", () => {
  const row = classicalPlate({ aMm: 1000, bMm: 1000, tMm: 0, psi: 1, edges: SS, ...steel })
  assert.equal(row.ok, false)
})

test("shear series approaches the fit as more terms are kept", () => {
  const two = kShearSeries(1, 2)
  const six = kShearSeries(1, 6)
  assert.ok(two && six)
  assert.ok(two.k > six.k)
  assert.ok(Math.abs(six.k - kShear(1)) / kShear(1) < 0.005, String(six.k))
})

test("equal biaxial compression of a square plate is k = 2", () => {
  const row = biaxialUniform({ aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigmaXMpa: 1, sigmaYMpa: 1 })
  assert.ok(row)
  const scale = (Math.PI ** 2 * 210000 * (10 / 1000) ** 2) / (12 * (1 - 0.3 * 0.3))
  assert.ok(Math.abs(row.sigmaXCrMpa / scale - 2) < 1e-9, String(row.sigmaXCrMpa / scale))
  assert.equal(row.m, 1)
  assert.equal(row.n, 1)
})
