import assert from "node:assert/strict"
import { test } from "node:test"
import { classicalPlate } from "./classical.ts"
import { forceToN, lengthToMm, mmToLength, mpaToStress, nToForce, stiffnessToNPerMm, stressToMpa } from "./units.ts"

const SS = { x0: "ss" as const, x1: "ss" as const, y0: "ss" as const, y1: "ss" as const }

test("shared unit engine is identity in mm, MPa and N", () => {
  assert.equal(lengthToMm(1000, "mm"), 1000)
  assert.equal(stressToMpa(210000, "MPa"), 210000)
  assert.equal(forceToN(100000, "N"), 100000)
  assert.equal(mmToLength(1000, "m"), 1)
  assert.equal(mpaToStress(210000, "GPa"), 210)
  assert.equal(nToForce(100000, "kN"), 100)
})

test("1000 mm, 210000 MPa and 100 kN match 1 m, 210 GPa and 0.1 MN", () => {
  assert.equal(lengthToMm(1, "m"), 1000)
  assert.equal(lengthToMm(100, "cm"), 1000)
  assert.equal(stressToMpa(210, "GPa"), 210000)
  assert.equal(stressToMpa(2.1e11, "Pa"), 210000)
  assert.equal(stressToMpa(2.1e8, "kPa"), 210000)
  assert.equal(forceToN(100, "kN"), 100000)
  assert.equal(forceToN(0.1, "MN"), 100000)
  assert.equal(stiffnessToNPerMm(1, "kN", "m"), 1)
})

test("classical σcr is unchanged after converting to canonical units", () => {
  const direct = classicalPlate({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, fyMpa: 350, fuMpa: 450,
    sigma1Mpa: 100, psi: 1, tauMpa: 0, edges: SS,
  })
  const converted = classicalPlate({
    aMm: lengthToMm(1, "m"),
    bMm: lengthToMm(100, "cm"),
    tMm: lengthToMm(1, "cm"),
    eMpa: stressToMpa(210, "GPa"),
    nu: 0.3,
    fyMpa: stressToMpa(0.35, "GPa"),
    fuMpa: stressToMpa(450000, "kPa"),
    sigma1Mpa: stressToMpa(100, "MPa"),
    psi: 1,
    tauMpa: 0,
    edges: SS,
  })
  assert.equal(direct.ok && converted.ok, true)
  assert.ok(direct.sigmaCrMpa != null && converted.sigmaCrMpa != null)
  assert.ok(Math.abs(direct.sigmaCrMpa - converted.sigmaCrMpa) / direct.sigmaCrMpa < 1e-12)
})
