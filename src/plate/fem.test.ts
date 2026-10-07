import assert from "node:assert/strict"
import { test } from "node:test"
import { solvePlateFem } from "./fem.ts"

const SS = { x0: "ss", x1: "ss", y0: "ss", y1: "ss" } as const

test("A FEM square plate approaches k = 4", () => {
  const exact = (4 * Math.PI ** 2 * 210000 * (10 / 1000) ** 2) / (12 * (1 - 0.3 ** 2))
  const fem = solvePlateFem({
    aMm: 1000,
    bMm: 1000,
    tMm: 10,
    eMpa: 210000,
    nu: 0.3,
    sigma1Mpa: 1,
    psi: 1,
    tauMpa: 0,
    nx: 12,
    ny: 12,
    edges: SS,
    krNPerRadPerMm: 0,
    modes: 4,
  })
  assert.equal(fem.ok, true, fem.reason)
  const got = fem.modes[0]?.sigma1CrMpa
  assert.ok(got != null)
  const err = Math.abs(got - exact) / exact
  assert.ok(err < 0.01, `FEM ${got} exact ${exact} err ${err}`)
})

test("long plate uniform compression stays near k = 4", () => {
  const exact = (4 * Math.PI ** 2 * 210000 * (10 / 1000) ** 2) / (12 * (1 - 0.3 ** 2))
  const fem = solvePlateFem({
    aMm: 2000,
    bMm: 1000,
    tMm: 10,
    eMpa: 210000,
    nu: 0.3,
    sigma1Mpa: 1,
    psi: 1,
    tauMpa: 0,
    nx: 16,
    ny: 8,
    edges: SS,
    krNPerRadPerMm: 0,
    modes: 4,
  })
  assert.equal(fem.ok, true, fem.reason)
  const got = fem.modes[0]?.sigma1CrMpa
  assert.ok(got != null)
  const err = Math.abs(got - exact) / exact
  assert.ok(err < 0.03, `FEM ${got} exact ${exact} err ${err}`)
})

test("square shear approaches the Timoshenko fit", () => {
  const kTau = 9.34
  const exact = (kTau * Math.PI ** 2 * 210000 * (8 / 800) ** 2) / (12 * (1 - 0.3 ** 2))
  const fem = solvePlateFem({
    aMm: 800,
    bMm: 800,
    tMm: 8,
    eMpa: 210000,
    nu: 0.3,
    sigma1Mpa: 0,
    psi: 1,
    tauMpa: 1,
    nx: 16,
    ny: 16,
    edges: SS,
    krNPerRadPerMm: 0,
    modes: 4,
  })
  assert.equal(fem.ok, true, fem.reason)
  const got = fem.modes[0]?.tauCrMpa
  assert.ok(got != null)
  const err = Math.abs(got - exact) / exact
  assert.ok(err < 0.03, `FEM ${got} fit ${exact} err ${err}`)
})
