import assert from "node:assert/strict"
import test from "node:test"
import { convert } from "./converter.ts"
import { lookupAlias } from "./definitions.ts"
import { parseQuantity } from "./parser.ts"

test("1 in = 25.4 mm", () => {
  assert.equal(convert(1, "in", "mm"), 25.4)
})

test("1 MPa = 1 N/mm²", () => {
  assert.equal(convert(1, "pressure:MPa", "pressure:N/mm2"), 1)
})

test("1 kN/m = 1 N/mm", () => {
  assert.equal(convert(1, "kN/m", "N/mm"), 1)
})

test("1 m⁴ = 1e12 mm⁴", () => {
  assert.equal(convert(1, "m4", "mm4"), 1e12)
})

test("60 rpm = 2π rad/s", () => {
  assert.ok(Math.abs(convert(60, "rpm", "rad/s") - 2 * Math.PI) < 1e-12)
})

test("temperature offsets", () => {
  assert.ok(Math.abs(convert(0, "C", "F") - 32) < 1e-9)
  assert.ok(Math.abs(convert(100, "C", "F") - 212) < 1e-9)
  assert.ok(Math.abs(convert(0, "C", "K") - 273.15) < 1e-9)
})

test("1 cSt = 1 mm²/s", () => {
  assert.equal(convert(1, "cSt", "mm2/s"), 1)
})

test("force cannot become stress", () => {
  assert.throws(() => convert(1, "kN", "pressure:MPa"), /Force cannot be directly converted to Stress/)
})

test("mass cannot become force", () => {
  assert.throws(() => convert(1, "kg", "N"), /Mass and force/)
})

test("volume is not section modulus", () => {
  assert.throws(() => convert(1, "mm3", "mm3-s"), /different engineering quantities/)
})

test("absolute temperature below 0 K", () => {
  assert.throws(() => convert(-300, "C", "K"), /0 K/)
})

test("parser reads an engineering quantity", () => {
  const parsed = parseQuantity("350 MPa to psi")
  assert.ok(parsed)
  assert.equal(parsed?.value, 350)
  assert.equal(parsed?.unit.id, "pressure:MPa")
  assert.equal(parsed?.to?.id, "psi")
  assert.equal(lookupAlias("kg/m3")?.id, "kg/m3")
})
