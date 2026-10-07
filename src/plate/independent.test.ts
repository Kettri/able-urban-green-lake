import assert from "node:assert/strict"
import { test } from "node:test"
import { classicalPlate } from "./classical.ts"
import { solvePlateFem } from "./fem.ts"
import { buildPanels } from "./subpanels.ts"
import { newStiffener } from "./stiffeners.ts"

const SS = { x0: "ss" as const, x1: "ss" as const, y0: "ss" as const, y1: "ss" as const }

/** Independent of classical.ts. k(m) = (m/α + α/m)², minimum m = 1…8. */
function independentUniform(alpha: number): { k: number; m: number } {
  let best = Infinity
  let mBest = 1
  for (let m = 1; m <= 8; m++) {
    const k = (m / alpha + alpha / m) ** 2
    if (k < best) { best = k; mBest = m }
  }
  return { k: best, m: mBest }
}

function independentStress(k: number, e: number, nu: number, t: number, b: number): number {
  return (k * Math.PI ** 2 * e * (t / b) ** 2) / (12 * (1 - nu * nu))
}

const steel = { eMpa: 210000, nu: 0.3, fyMpa: 350, fuMpa: 450 }

test("independent square plate k = 4 and σcr", () => {
  const theory = independentUniform(1)
  const sigma = independentStress(theory.k, 210000, 0.3, 10, 1000)
  assert.equal(theory.m, 1)
  assert.ok(Math.abs(theory.k - 4) < 1e-12)
  assert.ok(Math.abs(sigma - 75.9200338545) < 1e-6, String(sigma))
  const app = classicalPlate({ aMm: 1000, bMm: 1000, tMm: 10, ...steel, sigma1Mpa: 100, psi: 1, tauMpa: 0, edges: SS })
  assert.equal(app.ok, true)
  assert.ok(app.sigmaCrMpa != null)
  assert.ok(Math.abs(app.sigmaCrMpa - sigma) / sigma < 1e-9)
  const fem = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
    nx: 12, ny: 12, edges: SS, krNPerRadPerMm: 0, modes: 2, shapes: true,
  })
  assert.equal(fem.ok, true, fem.reason)
  const got = fem.modes[0]?.sigma1CrMpa ?? 0
  assert.ok(Math.abs(got - sigma) / sigma < 0.01, String(got))
  const nx = fem.xs.length
  const iy = Math.floor((fem.ys.length - 1) / 2)
  const line = fem.xs.map((_, ix) => fem.modes[0]!.w[iy * nx + ix] ?? 0)
  const changes = line.reduce((count, value, index) => {
    const prev = line.slice(0, index).reverse().find((item) => Math.abs(item) > 1e-6)
    return prev != null && prev * value < 0 ? count + 1 : count
  }, 0)
  assert.equal(changes, 0, "square fundamental mode must be a single half-wave")
})

test("independent aspect ratios pick m, not a forced m = 1", () => {
  const cases = [
    { alpha: 0.5, a: 500, m: 1, k: 6.25 },
    { alpha: 1, a: 1000, m: 1, k: 4 },
    { alpha: 2, a: 2000, m: 2, k: 4 },
    { alpha: 4, a: 4000, m: 4, k: 4 },
  ]
  for (const item of cases) {
    const theory = independentUniform(item.alpha)
    assert.equal(theory.m, item.m)
    assert.ok(Math.abs(theory.k - item.k) < 1e-9)
    const sigma = independentStress(theory.k, 210000, 0.3, 10, 1000)
    const app = classicalPlate({ aMm: item.a, bMm: 1000, tMm: 10, ...steel, sigma1Mpa: 1, psi: 1, tauMpa: 0, edges: SS })
    assert.equal(app.m, item.m)
    assert.ok(app.sigmaCrMpa != null && Math.abs(app.sigmaCrMpa - sigma) / sigma < 1e-6)
  }
})

test("tensile field is refused", () => {
  const fem = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: -50, psi: 1, tauMpa: 0,
    nx: 6, ny: 6, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
  })
  assert.equal(fem.ok, false)
  assert.match(fem.reason, /tensile/i)
})

test("invalid thickness, Poisson and patch are refused", () => {
  const common = { aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 4, ny: 4, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false }
  assert.equal(solvePlateFem({ ...common, tMm: 0 }).ok, false)
  assert.equal(solvePlateFem({ ...common, tMm: -2 }).ok, false)
  assert.equal(solvePlateFem({ ...common, nu: 0.6 }).ok, false)
  assert.equal(solvePlateFem({ ...common, aMm: 0 }).ok, false)
  assert.equal(solvePlateFem({ ...common, sigma1Mpa: 0, patchLoad: { edge: "y1", atMm: 100, lengthMm: 0, forceN: 1000 } }).ok, false)
  assert.equal(solvePlateFem({ ...common, sigma1Mpa: 0, patchLoad: { edge: "y1", atMm: 50, lengthMm: 200, forceN: 1000 } }).ok, false)
  assert.equal(solvePlateFem({ ...common, nx: 200 }).ok, false)
})

test("full-edge patch matches independent uniaxial compression", () => {
  const sigma = independentStress(4, 210000, 0.3, 10, 1000)
  const force = sigma * 1000 * 10
  const fem = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 0, psi: 1, tauMpa: 0,
    nx: 12, ny: 12, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    patchLoad: { edge: "y1", atMm: 500, lengthMm: 1000, forceN: 10000 },
  })
  assert.equal(fem.ok, true, fem.reason)
  const got = fem.modes[0]?.patchCrN ?? 0
  const expectForce = 10000 * (sigma / 1)
  assert.ok(Math.abs(got - expectForce) / expectForce < 0.01, `${got} vs ${expectForce}`)
  assert.ok(Math.abs(force - expectForce) / force < 1e-9)
})

test("mirrored patch positions match", () => {
  const run = (at: number) => solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 0, psi: 1, tauMpa: 0,
    nx: 10, ny: 10, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    patchLoad: { edge: "y1", atMm: at, lengthMm: 200, forceN: 20000 },
  })
  const left = run(300)
  const right = run(700)
  assert.equal(left.ok && right.ok, true, left.reason || right.reason)
  const a = left.modes[0]?.patchCrN ?? 0
  const b = right.modes[0]?.patchCrN ?? 0
  assert.ok(Math.abs(a - b) / Math.max(Math.abs(a), 1) < 0.02, `${a} vs ${b}`)
})

test("shorter patch at the same force is more severe", () => {
  const run = (length: number, at: number) => solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 0, psi: 1, tauMpa: 0,
    nx: 12, ny: 12, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    patchLoad: { edge: "y1", atMm: at, lengthMm: length, forceN: 20000 },
  })
  const short = run(200, 500)
  const long = run(800, 500)
  assert.equal(short.ok && long.ok, true, short.reason || long.reason)
  const fs = short.modes[0]?.patchCrN ?? 0
  const fl = long.modes[0]?.patchCrN ?? 0
  assert.ok(fs < fl, `short ${fs} should be below long ${fl}`)
  assert.match(short.prestressNote, /Requested patch force/)
  assert.match(short.prestressNote, /Difference 0\.0000%/)
})

test("full-edge patch stress matches uniform σy on the same mesh", () => {
  const base = {
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 0, psi: 1, tauMpa: 0,
    nx: 8, ny: 8, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
  }
  const uniform = solvePlateFem({ ...base, sigmaYMpa: 1 })
  const patch = solvePlateFem({
    ...base,
    patchLoad: { edge: "y1", atMm: 500, lengthMm: 1000, forceN: 20000 },
  })
  assert.equal(uniform.ok && patch.ok, true, uniform.reason || patch.reason)
  const sigma = (patch.modes[0]?.patchCrN ?? 0) / (1000 * 10)
  const ref = uniform.modes[0]?.sigmaYCrMpa ?? 0
  assert.ok(Math.abs(sigma - ref) / ref < 0.01, `${sigma} vs ${ref}`)
  assert.match(patch.prestressNote, /Difference 0\.0000%/)
})

test("subpanel counts for one, two and crossed stiffeners", () => {
  const base = { aMm: 1000, bMm: 600, tMm: 10, ...steel, sigma1Mpa: 100, psi: -1, tauMpa: 0, edges: SS }
  const one = buildPanels({ ...base, stiffeners: [newStiffener({ id: "S1", axis: "x", atMm: 300 })] })
  assert.equal(one.length, 2)
  assert.equal(one.every((panel) => panel.closedForm), false)
  const two = buildPanels({ ...base, stiffeners: [newStiffener({ id: "S1", axis: "x", atMm: 200 }), newStiffener({ id: "S2", axis: "x", atMm: 400 })] })
  assert.equal(two.length, 3)
  assert.ok(Math.abs(two.reduce((sum, panel) => sum + panel.bMm, 0) - 600) < 1e-6)
  const cross = buildPanels({
    ...base,
    stiffeners: [newStiffener({ id: "L", axis: "x", atMm: 300 }), newStiffener({ id: "T", axis: "y", atMm: 400 })],
  })
  assert.equal(cross.length, 4)
  const grid = buildPanels({
    ...base,
    stiffeners: [
      newStiffener({ id: "L1", axis: "x", atMm: 200 }),
      newStiffener({ id: "L2", axis: "x", atMm: 400 }),
      newStiffener({ id: "T1", axis: "y", atMm: 300 }),
      newStiffener({ id: "T2", axis: "y", atMm: 700 }),
    ],
  })
  assert.equal(grid.length, 9)
  const edge = buildPanels({ ...base, stiffeners: [newStiffener({ id: "E", axis: "x", atMm: 0 })] })
  assert.equal(edge.length, 1)
  const same = buildPanels({ ...base, stiffeners: [newStiffener({ id: "A", axis: "x", atMm: 300 }), newStiffener({ id: "B", axis: "x", atMm: 300 })] })
  assert.equal(same.length, 2)
})

test("thickness scales with t squared — mm and MPa, no hidden unit factor", () => {
  const thin = independentStress(4, 210000, 0.3, 10, 1000)
  const thick = independentStress(4, 210000, 0.3, 20, 1000)
  assert.ok(Math.abs(thick / thin - 4) < 1e-12)
  const app = classicalPlate({ aMm: 1000, bMm: 1000, tMm: 20, ...steel, sigma1Mpa: 1, psi: 1, tauMpa: 0, edges: SS })
  assert.ok(app.sigmaCrMpa != null && Math.abs(app.sigmaCrMpa - thick) / thick < 1e-9)
})

test("uniform σy on a 2:1 plate matches the swapped classical width", () => {
  const alpha = 0.5
  const theory = independentUniform(alpha)
  const sigma = independentStress(theory.k, 210000, 0.3, 10, 2000)
  assert.equal(theory.m, 1)
  assert.ok(Math.abs(theory.k - 6.25) < 1e-12)
  assert.ok(Math.abs(sigma - 29.6562632244) < 1e-6, String(sigma))
  const fem = solvePlateFem({
    aMm: 2000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 0, sigmaYMpa: 1, psi: 1, tauMpa: 0,
    nx: 16, ny: 12, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
  })
  assert.equal(fem.ok, true, fem.reason)
  const got = fem.modes[0]?.sigmaYCrMpa ?? 0
  assert.ok(Math.abs(got - sigma) / sigma < 0.01, String(got))
  assert.equal(fem.modes[0]?.sigma1CrMpa, null)
})

test("a stiffener on the boundary is not assembled", () => {
  const input = { aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 8, ny: 8, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false }
  const bare = solvePlateFem(input)
  const edge = solvePlateFem({ ...input, stiffeners: [{ id: "E", axis: "x", atMm: 0, eiNmm2: 1e11, gjNmm2: 1e8, areaMm2: 800, rigid: false }] })
  assert.equal(edge.ok, true, edge.reason)
  assert.ok(Math.abs((edge.modes[0]?.sigma1CrMpa ?? 0) - (bare.modes[0]?.sigma1CrMpa ?? 0)) < 1e-6)
  assert.match(edge.stiffenerNotes.join(" "), /not added/i)
})

test("a real stiffener raises the eigenvalue and a weak one does not jump", () => {
  const bare = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
    nx: 8, ny: 8, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
  })
  const strong = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
    nx: 8, ny: 8, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    stiffeners: [{ id: "S", axis: "x", atMm: 500, eiNmm2: 210000 * 2.05e6, gjNmm2: 8e7, areaMm2: 800, rigid: false }],
  })
  const weak = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
    nx: 8, ny: 8, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    stiffeners: [{ id: "W", axis: "x", atMm: 500, eiNmm2: 2.1e6, gjNmm2: 1e4, areaMm2: 20, rigid: false }],
  })
  const b = bare.modes[0]?.sigma1CrMpa ?? 0
  const s = strong.modes[0]?.sigma1CrMpa ?? 0
  const w = weak.modes[0]?.sigma1CrMpa ?? 0
  assert.ok(s > b * 2, `strong ${s} bare ${b}`)
  assert.ok(w > b * 0.7 && w < b * 1.4, `weak ${w} bare ${b}`)
})

test("stiffener eigenvalue follows EI and a weak bar is not a rigid line", () => {
  const run = (ei: number) => solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
    nx: 6, ny: 6, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    stiffeners: [{ id: "S", axis: "x", atMm: 500, eiNmm2: ei, gjNmm2: ei / 50, areaMm2: 40, rigid: false }],
  })
  const bare = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
    nx: 6, ny: 6, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
  })
  const levels = [1e4, 1e6, 1e8, 1e10, 1e12]
  const values = levels.map((ei) => {
    const result = run(ei)
    assert.equal(result.ok, true, result.reason)
    assert.match(result.stiffenerNotes.join(" "), /mesh line/)
    return result.modes[0]?.sigma1CrMpa ?? 0
  })
  const b = bare.modes[0]?.sigma1CrMpa ?? 0
  assert.ok(values[0]! > b * 0.85 && values[0]! < b * 1.2, `very low ${values[0]} bare ${b}`)
  assert.ok(values[4]! > values[0]! * 1.4, `very high ${values[4]} very low ${values[0]}`)
  assert.ok(values[1]! < values[4]! * 0.85, `low EI ${values[1]} must not already be the very high result ${values[4]}`)
  for (let i = 1; i < values.length; i++) assert.ok(values[i]! >= values[i - 1]! * 0.98, values.join(","))
})

test("thinner square plate moves toward the Kirchhoff k = 4 stress", () => {
  const gap = (tMm: number) => {
    const fem = solvePlateFem({
      aMm: 1000, bMm: 1000, tMm, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
      nx: 12, ny: 12, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    })
    assert.equal(fem.ok, true, fem.reason)
    const theory = independentStress(4, 210000, 0.3, tMm, 1000)
    const got = fem.modes[0]?.sigma1CrMpa ?? 0
    return Math.abs(got - theory) / theory
  }
  const thick = gap(20)
  const thin = gap(2)
  assert.ok(thin < thick, `b/t 500 gap ${thin} should be under b/t 50 gap ${thick}`)
  assert.ok(thick > 0.005, `thick-plate gap ${thick} should show transverse shear, not be forced to zero`)
})

test("a near-zero stiffener does not move the plate", () => {
  const bare = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
    nx: 6, ny: 6, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
  })
  const tiny = solvePlateFem({
    ...{
      aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 1, psi: 1, tauMpa: 0,
      nx: 6, ny: 6, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    },
    stiffeners: [{ id: "Z", axis: "x", atMm: 500, eiNmm2: 1, gjNmm2: 0, areaMm2: 0, rigid: false }],
  })
  assert.equal(bare.ok && tiny.ok, true)
  const a = bare.modes[0]?.sigma1CrMpa ?? 0
  const b = tiny.modes[0]?.sigma1CrMpa ?? 0
  assert.ok(Math.abs(a - b) / a < 0.005, `${a} vs ${b}`)
})

test("reversing shear does not change the square-plate eigenvalue", () => {
  const run = (tauMpa: number) => solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 0, psi: 1, tauMpa,
    nx: 6, ny: 6, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
  })
  const plus = run(1)
  const minus = run(-1)
  assert.equal(plus.ok && minus.ok, true)
  const a = Math.abs(plus.modes[0]?.lambda ?? 0)
  const b = Math.abs(minus.modes[0]?.lambda ?? 0)
  assert.ok(Math.abs(a - b) / a < 1e-6, `${a} vs ${b}`)
})

test("patch reactions balance the applied force", () => {
  const fem = solvePlateFem({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigma1Mpa: 0, psi: 1, tauMpa: 0,
    nx: 6, ny: 6, edges: SS, krNPerRadPerMm: 0, modes: 1, shapes: false,
    patchLoad: { edge: "y1", atMm: 500, lengthMm: 400, forceN: 5000 },
  })
  assert.equal(fem.ok, true, fem.reason)
  assert.match(fem.prestressNote, /Applied Fx/)
  assert.match(fem.prestressNote, /Reaction Fy/)
  assert.match(fem.prestressNote, /Force imbalance 0\.0000%/)
})
