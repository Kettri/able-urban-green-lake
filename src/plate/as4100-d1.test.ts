import assert from "node:assert/strict"
import { test } from "node:test"
import { solvePlateFem } from "./fem.ts"
import { staleAssignments, withoutStale, type AssignmentLink } from "./standards/as4100/assignment.ts"
import { evaluateAs4100 } from "./standards/as4100/evaluate.ts"
import { alphaC } from "./standards/as4100/member.ts"
import { AS4100_META } from "./standards/as4100/shared.ts"
import { alphaD, alphaVStiffened, alphaVUnstiffened } from "./standards/as4100/shear.ts"

/** Clause 6.3.3 written out here. Not a call through a shared helper. */
function alphaIndependent(lambdaN: number, alphaB: number): number {
  const alphaA = (2100 * (lambdaN - 13.5)) / (lambdaN * lambdaN - 15.3 * lambdaN + 2050)
  const lambda = lambdaN + alphaA * alphaB
  if (!(lambda > 0)) return 1
  const eta = Math.max(0, 0.00326 * (lambda - 13.5))
  const ratio = lambda / 90
  const xi = (ratio * ratio + 1 + eta) / (2 * ratio * ratio)
  const inside = 1 - (90 / (xi * lambda)) ** 2
  if (!(inside >= 0) || !Number.isFinite(xi)) return 1
  return Math.min(1, xi * (1 - Math.sqrt(inside)))
}

/** Clause 5.11.5.2 product αv αd, or unstiffened αv when s/dp > 3. Written out here. */
function shearProduct(slenderness: number, sOverDp: number): number {
  const base = (82 / slenderness) ** 2
  if (sOverDp > 3) return base
  const factor = sOverDp <= 1 ? 1 / sOverDp ** 2 + 0.75 : 0.75 / sOverDp ** 2 + 1
  const av = Math.min(1, base * factor)
  const ad = 1 + (1 - av) / (1.15 * av * Math.sqrt(1 + sOverDp ** 2))
  return av * ad
}

test("D1.0 identity is frozen", () => {
  assert.equal(AS4100_META.freeze, "IQ-PLB-AS4100-D1.0")
  assert.equal(AS4100_META.edition, "2020")
  assert.equal(AS4100_META.amendment, "1")
})

test("Table 6.3.3(C) readable cells match Clause 6.3.3", () => {
  const cells: [number, number, number][] = [
    [0, -1, 1], [0, 0, 1], [0, 1, 1],
    [10, -1, 1], [10, 1, 1],
    [30, -1, 0.991], [30, -0.5, 0.968], [30, 0, 0.943], [30, 0.5, 0.917], [30, 1, 0.888],
    [35, -1, 0.983], [35, -0.5, 0.955], [35, 0, 0.925], [35, 0.5, 0.891], [35, 1, 0.853],
    [40, -1, 0.973], [40, -0.5, 0.94], [40, 0, 0.905], [40, 0.5, 0.865], [40, 1, 0.818],
    [90, -1, 0.737], [90, -0.5, 0.675], [90, 0, 0.61], [90, 0.5, 0.547], [90, 1, 0.487],
  ]
  let maxAbs = 0
  let maxRel = 0
  for (const [lambdaN, alphaB, printed] of cells) {
    const code = alphaC(lambdaN, alphaB)
    const own = alphaIndependent(lambdaN, alphaB)
    assert.ok(Math.abs(code - own) < 1e-12, "production and independent closed forms diverged")
    const diff = Math.abs(code - printed)
    maxAbs = Math.max(maxAbs, diff)
    maxRel = Math.max(maxRel, printed === 0 ? diff : diff / printed)
    assert.ok(diff < 0.0015, `${lambdaN},${alphaB} code ${code} table ${printed}`)
  }
  assert.ok(maxAbs < 0.0015)
  assert.ok(maxRel < 0.002)
})

test("Table 5.11.5.2 matches the Clause 5.11.5.2 equations except two transposed cells", () => {
  const cols = [0.3, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]
  const rows: [number, number[]][] = [
    [90, [1, 1, 1, 1, 1, 1, 1, 0.991, 0.952, 0.927]],
    [100, [1, 1, 1, 1, 0.989, 0.946, 0.907, 0.877, 0.833, 0.803]],
    [110, [1, 1, 1, 0.998, 0.919, 0.866, 0.825, 0.792, 0.744, 0.711]],
    [140, [1, 1, 0.96, 0.846, 0.775, 0.719, 0.674, 0.638, 0.583, 0.544]],
    [170, [1, 1, 0.875, 0.772, 0.701, 0.643, 0.596, 0.558, 0.499, 0.458]],
    [180, [1, 0.997, 0.855, 0.755, 0.684, 0.626, 0.578, 0.539, 0.48, 0.438]],
    [190, [1, 0.974, 0.839, 0.74, 0.669, 0.611, 0.563, 0.524, 0.464, 0.421]],
  ]
  const transposed = new Set(["100|1.25", "110|1"])
  for (const [sl, printed] of rows) {
    cols.forEach((spacing, index) => {
      const formula = Math.min(1, shearProduct(sl, spacing))
      const code = spacing > 3
        ? alphaVUnstiffened(sl, 250)
        : alphaVStiffened(sl, 250, spacing) * alphaD(alphaVStiffened(sl, 250, spacing), spacing, false)
      assert.ok(Math.abs(code - formula) < 1e-9)
      const key = `${sl}|${spacing}`
      const diff = Math.abs(formula - printed[index]!)
      if (transposed.has(key)) {
        assert.ok(diff > 0.005 && diff < 0.012, key)
      } else {
        assert.ok(diff < 0.0015, `${key} formula ${formula.toFixed(4)} table ${printed[index]}`)
      }
    })
  }
  assert.ok(Math.abs(shearProduct(100, 1.25) - 0.9978) < 0.001)
  assert.ok(Math.abs(shearProduct(110, 1) - 0.9894) < 0.001)
  assert.ok(Math.abs((82 / 100) ** 2 - 0.6724) < 1e-4)
})

test("plate class changes on the Table 5.2 limits and effective width stays continuous", () => {
  const at = (b: number) => evaluateAs4100({
    role: "element", clearWidthMm: b, thicknessMm: 10, fyMpa: 250, residual: "HR",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "none",
  })
  const compact = at(300)
  const justCompact = at(300 - 1e-4)
  const onYield = at(450)
  const justNonCompact = at(300 + 1e-4)
  const justSlender = at(450 + 1e-4)
  assert.match(compact.checks.find((row) => row.id === "slenderness")?.result ?? "", /COMPACT/)
  assert.match(justCompact.checks.find((row) => row.id === "slenderness")?.result ?? "", /COMPACT/)
  assert.match(justNonCompact.checks.find((row) => row.id === "slenderness")?.result ?? "", /NON-COMPACT/)
  assert.match(onYield.checks.find((row) => row.id === "slenderness")?.result ?? "", /NON-COMPACT/)
  assert.match(justSlender.checks.find((row) => row.id === "slenderness")?.result ?? "", /SLENDER/)
  assert.equal(onYield.diagram.effectiveMm, 450)
  assert.equal(justNonCompact.diagram.effectiveMm, 300 + 1e-4)
  // Clause 6.2.4 primary width: be = b (λey/λe) ≤ b = λey t / √(fy/250) once slender.
  // fy = 250, t = 10, λey = 45 → the slender plateau is exactly 450 mm for every b > 450.
  // That meets the yield-limit width, so be is continuous. It is not a drop below 450.
  const plateau = 45 * 10
  assert.ok(Math.abs((justSlender.diagram.effectiveMm ?? NaN) - plateau) < 1e-6)
  assert.ok((justSlender.diagram.effectiveMm ?? 0) < 450 + 1e-4)
  const moderate = at(460)
  assert.match(moderate.checks.find((row) => row.id === "slenderness")?.result ?? "", /SLENDER/)
  assert.ok(Math.abs((moderate.diagram.effectiveMm ?? NaN) - plateau) < 1e-6)
  assert.ok((moderate.diagram.effectiveMm ?? 0) < 460)
  const stocky = at(100)
  assert.equal(stocky.diagram.effectiveMm, 100)
  const very = at(2000)
  assert.ok((very.diagram.effectiveMm ?? 0) < 2000)
  assert.ok((very.diagram.effectiveMm ?? 1) > 0)
})

test("effective width does not grow as slenderness grows, and kf stays in (0, 1]", () => {
  const widths: number[] = []
  for (const fy of [250, 300, 350, 450]) {
    const report = evaluateAs4100({
      role: "element", clearWidthMm: 500, thicknessMm: 8, fyMpa: fy, residual: "HW",
      edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "compression",
    })
    widths.push(report.diagram.effectiveMm ?? 0)
    const axial = report.checks.find((row) => row.id === "axial")
    const be = report.diagram.effectiveMm ?? 0
    assert.ok(be <= 500)
    const kf = (be * 8) / (500 * 8)
    assert.ok(kf > 0 && kf <= 1)
    assert.match(axial?.equation ?? "", /Ns/)
    assert.doesNotMatch(axial?.equation ?? "", /Nc/)
  }
  assert.ok(widths[1]! < widths[0]!)
  assert.ok(widths[2]! < widths[1]!)
  assert.ok(widths[3]! < widths[2]!)
})

test("published 300×10 and 500×8 results from first principles", () => {
  const lambda = (300 / 10) * Math.sqrt(350 / 250)
  assert.ok(Math.abs(lambda - 35.496478698) < 1e-6)
  const plate = evaluateAs4100({
    role: "element", clearWidthMm: 300, thicknessMm: 10, fyMpa: 350, residual: "HR",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "none",
  })
  assert.match(plate.checks.find((row) => row.id === "slenderness")?.result ?? "", /NON-COMPACT/)
  assert.equal(plate.diagram.effectiveMm, 300)
  const slenderLambda = (500 / 8) * Math.sqrt(350 / 250)
  const be = 500 * (35 / slenderLambda)
  const ns = be * 8 * 350
  const report = evaluateAs4100({
    role: "element", clearWidthMm: 500, thicknessMm: 8, fyMpa: 350, residual: "HW",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "compression",
  })
  assert.ok(Math.abs((report.diagram.effectiveMm ?? 0) - be) < 1e-6)
  assert.ok(Math.abs((report.checks.find((row) => row.id === "axial")?.nominal ?? 0) - ns) < 0.05)
  assert.ok(Math.abs((report.checks.find((row) => row.id === "axial")?.designCapacity ?? 0) - 0.9 * ns) < 0.05)
  assert.equal(report.checks.find((row) => row.id === "axial")?.phi, 0.9)
})

test("tension ignores compression slenderness and needs kt", () => {
  const report = evaluateAs4100({
    role: "element", clearWidthMm: 500, thicknessMm: 8, fyMpa: 350, fuMpa: 480, residual: "HW",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "tension", kt: 1, nStarN: -100000,
  })
  const axial = report.checks.find((row) => row.id === "axial")
  assert.equal(axial?.nominal, 1_400_000)
  assert.equal(axial?.designCapacity, 1_260_000)
  assert.equal(axial?.status, "pass")
  const missing = evaluateAs4100({
    role: "element", clearWidthMm: 500, thicknessMm: 8, fyMpa: 350, fuMpa: 480, residual: "HW",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "tension",
  })
  assert.equal(missing.checks.find((row) => row.id === "axial")?.status, "data-required")
  assert.equal(missing.overall, "not-complete")
})

test("net area above gross area is invalid and is not replaced by Ag", () => {
  const report = evaluateAs4100({
    role: "element", clearWidthMm: 200, thicknessMm: 10, fyMpa: 250, fuMpa: 410, residual: "HR",
    edgesSupported: "both", stress: "uniform-compression", holes: "net", anMm2: 2500, axial: "compression",
  })
  const axial = report.checks.find((row) => row.id === "axial")
  assert.equal(axial?.status, "invalid")
  assert.equal(axial?.nominal, null)
  assert.equal(report.overall, "not-complete")
  assert.doesNotMatch(report.headline, /PASS FOR ALL/)
})

test("scope boundaries: 3 mm and 690 MPa", () => {
  const element = (t: number, fy: number) => evaluateAs4100({
    role: "element", clearWidthMm: 200, thicknessMm: t, fyMpa: fy, residual: "HR",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "none",
  }).checks.find((row) => row.id === "slenderness")?.status
  assert.equal(element(3 - 1e-4, 350), "out-of-scope")
  assert.equal(element(3, 350), "pass")
  assert.equal(element(3 + 1e-4, 350), "pass")
  assert.equal(element(10, 690), "pass")
  assert.equal(element(10, 690 + 0.001), "out-of-scope")
  const shear = (tw: number, fy: number) => evaluateAs4100({
    role: "web", dpMm: 400, twMm: tw, fyMpa: fy, webGross: "gross", stiffening: "unstiffened",
    shearMode: "uniform", d1Mm: 400, webBound: "both-flanges", axial: "none", bearing: "none",
    stiffener: "none", interaction: "none", openings: "none", vStarN: 1000,
  })
  assert.equal(shear(2.999, 250).checks.find((row) => row.id === "shear")?.status, "out-of-scope")
  assert.equal(shear(3, 250).overall, "pass")
  assert.equal(shear(8, 690.001).overall, "not-complete")
  assert.doesNotMatch(shear(8, 700).headline, /PASS FOR ALL/)
})

test("web thickness and shear use dp for the stiffener trigger and d1 in the thickness formula", () => {
  const crossed = evaluateAs4100({
    role: "web", d1Mm: 600, dpMm: 800, twMm: 8, sMm: 2000, fyMpa: 250,
    webBound: "both-flanges", stiffening: "transverse", webGross: "gross", shearMode: "uniform",
    axial: "none", bearing: "none", stiffener: "none", interaction: "none", openings: "none",
  })
  assert.equal(crossed.checks.find((row) => row.id === "web-thickness")?.status, "out-of-scope")
  assert.match(crossed.checks.find((row) => row.id === "web-thickness")?.note ?? "", /s\/d1/)
  const dpBased = Math.min(0.6 * 250 * 800 * 8, shearProduct(100, 2) * 0.6 * 250 * 800 * 8)
  const d1Based = Math.min(0.6 * 250 * 800 * 8, shearProduct(75, 1600 / 600) * 0.6 * 250 * 800 * 8)
  const shear = evaluateAs4100({
    role: "web", d1Mm: 600, dpMm: 800, twMm: 8, sMm: 1600, fyMpa: 250,
    webBound: "both-flanges", stiffening: "transverse", webGross: "gross", shearMode: "uniform",
    axial: "none", bearing: "none", stiffener: "none", interaction: "none", openings: "none", vStarN: 1,
  })
  const nominal = shear.checks.find((row) => row.id === "shear")?.nominal ?? 0
  assert.ok(Math.abs(nominal - dpBased) < 1)
  assert.ok(Math.abs(nominal - d1Based) > 1000)
})

test("shear yield and buckling meet at dp/tw = 82/√(fy/250)", () => {
  const fy = 250
  const limit = 82 / Math.sqrt(fy / 250)
  const at = (dp: number) => evaluateAs4100({
    role: "web", dpMm: dp, twMm: 10, fyMpa: fy, webGross: "gross", stiffening: "unstiffened",
    shearMode: "uniform", d1Mm: dp, webBound: "both-flanges",
  }).checks.find((row) => row.id === "shear")
  const below = at(limit * 10 - 0.01)
  const on = at(limit * 10)
  const above = at(limit * 10 + 0.01)
  assert.match(below?.title ?? "", /yield/)
  assert.match(on?.title ?? "", /yield/)
  assert.match(above?.title ?? "", /buckling/)
  assert.ok(Math.abs((on?.nominal ?? 0) - (above?.nominal ?? 0)) / (on?.nominal ?? 1) < 0.001)
  const s3 = evaluateAs4100({
    role: "web", dpMm: 1000, twMm: 8, sMm: 3000, fyMpa: 250, webGross: "gross", stiffening: "transverse",
    shearMode: "uniform", d1Mm: 1000, webBound: "both-flanges",
  }).checks.find((row) => row.id === "shear")?.nominal
  const s3plus = evaluateAs4100({
    role: "web", dpMm: 1000, twMm: 8, sMm: 3000.01, fyMpa: 250, webGross: "gross", stiffening: "transverse",
    shearMode: "uniform", d1Mm: 1000, webBound: "both-flanges",
  }).checks.find((row) => row.id === "shear")?.nominal
  assert.ok(s3 != null && s3plus != null)
  assert.ok(s3 > s3plus)
})

test("opening limits 0.10 and 0.33 change on the printed side of the limit", () => {
  const open = (ratio: number, stiffened: boolean) => evaluateAs4100({
    role: "web", openings: "open", lwMm: ratio * 500, d1Mm: 500, openingStiffened: stiffened,
    dpMm: 500, twMm: 10, fyMpa: 250,
  }).checks.find((row) => row.id === "openings")
  assert.equal(open(0.1 - 1e-6, false)?.status, "pass")
  assert.equal(open(0.1, false)?.status, "pass")
  assert.equal(open(0.1 + 1e-4, false)?.status, "fail")
  assert.equal(open(0.33, false)?.status, "fail")
  assert.equal(open(0.33, true)?.status, "pass")
  assert.equal(open(0.33 + 1e-4, true)?.status, "fail")
  assert.match(open(0.2, true)?.note ?? "", /castellated|stiffened opening/i)
})

test("Clause 5.12.3 is continuous at 0.75 φMs and does not govern without V*", () => {
  const ms = 1e8
  const phi = 0.9
  const vv = 0.6 * 250 * 400 * 10
  const web = {
    role: "web" as const, dpMm: 400, twMm: 10, fyMpa: 250, webGross: "gross" as const,
    stiffening: "unstiffened" as const, shearMode: "uniform" as const, interaction: "section" as const,
    msNmm: ms, d1Mm: 400, webBound: "both-flanges" as const,
  }
  const at = (m: number, v: number | null) => evaluateAs4100({ ...web, mStarNmm: m, vStarN: v ?? undefined })
  const low = at(0.75 * phi * ms, 1000)
  const high = at(0.75 * phi * ms + 1, 1000)
  assert.ok(Math.abs((low.checks.find((row) => row.id === "interaction")?.nominal ?? 0) - vv) < 1)
  assert.ok((high.checks.find((row) => row.id === "interaction")?.nominal ?? vv) < vv)
  const noShear = at(0.8 * phi * ms, null)
  assert.equal(noShear.checks.find((row) => row.id === "interaction")?.utilisation, null)
  assert.equal(noShear.governingUtil, null)
})

test("bearing example is section yield, not the patch eigenvalue, and stiffened webs are outside 5.13.4", () => {
  const report = evaluateAs4100({
    role: "web", bearing: "ic", stiffening: "unstiffened", bbfMm: 100, bbMm: 500, twMm: 10, fyMpa: 300,
    d1Mm: 200, flangesRestrained: true, rStarN: 200000,
  })
  const row = report.checks.find((item) => item.id === "bearing")
  assert.equal(row?.nominal, 375000)
  assert.equal(row?.designCapacity, 337500)
  assert.equal(row?.phi, 0.9)
  const again = evaluateAs4100({
    role: "web", bearing: "ic", stiffening: "unstiffened", bbfMm: 100, bbMm: 500, twMm: 10, fyMpa: 300,
    d1Mm: 200, flangesRestrained: true, rStarN: 200000,
  })
  assert.equal(again.checks.find((item) => item.id === "bearing")?.nominal, row?.nominal)
  const stiffened = evaluateAs4100({
    role: "web", bearing: "ic", stiffening: "transverse", bbfMm: 100, bbMm: 500, twMm: 10, fyMpa: 300, d1Mm: 200,
  })
  assert.equal(stiffened.checks.find((item) => item.id === "bearing")?.status, "out-of-scope")
  assert.equal(stiffened.overall, "not-complete")
})

test("Clause 5.15.5 printed second limit is 1.5 d1³ tw³ / s²", () => {
  const d1 = 1000
  const tw = 10
  const s = 2000
  const printed = 1.5 * d1 ** 3 * tw ** 3 / s ** 2
  const equivalent = 1.5 * d1 * tw ** 3 / (s / d1) ** 2
  assert.equal(printed, equivalent)
  assert.equal(printed, 375000)
  const report = evaluateAs4100({
    role: "web", stiffener: "intermediate", arrangement: "pair", d1Mm: d1, twMm: tw, dpMm: d1, sMm: s,
    fyMpa: 250, fysMpa: 250, webGross: "gross", stiffening: "transverse", shearMode: "uniform",
    isMm4: printed, asMm2: 1600, tsMm: 10, besMm: 80,
  })
  assert.equal(report.checks.find((row) => row.id === "stiffener-stiffness")?.status, "pass")
  assert.match(report.checks.find((row) => row.id === "stiffener-stiffness")?.steps.join(" ") ?? "", /1\.5 d1³ tw³ \/ s²/)
})

test("a missing applicable check is not a complete pass, and Appendix I cannot govern", () => {
  const base = {
    role: "web" as const, dpMm: 400, twMm: 10, fyMpa: 250, webGross: "gross" as const,
    stiffening: "unstiffened" as const, shearMode: "uniform" as const, d1Mm: 400, webBound: "both-flanges" as const,
    axial: "none" as const, bearing: "none" as const, stiffener: "none" as const, openings: "none" as const,
    vStarN: 1000,
  }
  const omitted = evaluateAs4100(base)
  assert.equal(omitted.checks.find((row) => row.id === "interaction")?.status, "not-checked")
  assert.equal(omitted.overall, "not-complete")
  assert.match(omitted.headline, /NOT A COMPLETE PASS/)
  const full = evaluateAs4100({ ...base, interaction: "none" })
  assert.equal(full.overall, "pass")
  const withAppendix = evaluateAs4100({
    ...base, interaction: "none", appendixI: true, bbfMm: 100, sMm: 400,
    mwNmm: 1e12, vwN: 1e12, nwN: 1e12, rwN: 1e12,
  })
  assert.equal(withAppendix.checks.find((row) => row.id === "appendix-i")?.normative, false)
  assert.equal(withAppendix.overall, full.overall)
  assert.equal(withAppendix.governingUtil, full.governingUtil)
})

test("invalid geometry never returns a pass", () => {
  for (const bad of [
    { thicknessMm: 0 },
    { thicknessMm: -5 },
    { fyMpa: Number.NaN },
    { clearWidthMm: Number.POSITIVE_INFINITY },
    { vStarN: -10 },
  ]) {
    const report = evaluateAs4100({
      role: "element", clearWidthMm: 200, thicknessMm: 10, fyMpa: 250, residual: "HR",
      edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "none",
      ...bad,
    })
    assert.equal(report.checks.some((row) => row.status === "pass" && row.kind === "strength"), false)
    assert.notEqual(report.overall, "pass")
    assert.equal(report.checks[0]?.status, "invalid")
  }
})

test("the same physical plate in mm/MPa/N and in converted units", () => {
  const mm = evaluateAs4100({
    role: "element", clearWidthMm: 300, thicknessMm: 10, fyMpa: 350, residual: "HR",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "compression", nStarN: 500000,
  })
  const fromMetres = evaluateAs4100({
    role: "element",
    clearWidthMm: 0.3 * 1000,
    thicknessMm: 0.01 * 1000,
    fyMpa: 0.35 * 1000,
    residual: "HR",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "compression",
    nStarN: 500 * 1000,
  })
  assert.equal(fromMetres.checks.find((row) => row.id === "axial")?.nominal, mm.checks.find((row) => row.id === "axial")?.nominal)
  assert.equal(fromMetres.checks.find((row) => row.id === "axial")?.utilisation, mm.checks.find((row) => row.id === "axial")?.utilisation)
  const nsN = mm.checks.find((row) => row.id === "axial")?.nominal ?? 0
  assert.ok(Math.abs(nsN / 1000 - 1050) < 0.01)
})

test("assignments do not silently follow the panel, and a geometry change is stale", () => {
  const panel = { aMm: 2000, bMm: 800, tMm: 10, fyMpa: 350, fuMpa: 480 }
  assert.deepEqual(staleAssignments([], panel), [])
  const link: AssignmentLink = { field: "dpMm", source: "bMm", captured: 800 }
  assert.deepEqual(staleAssignments([link], panel), [])
  const design = withoutStale({ dpMm: 800, twMm: 10 }, [])
  assert.equal(design.dpMm, 800)
  const moved = staleAssignments([link], { ...panel, bMm: 900 })
  assert.equal(moved.length, 1)
  const dropped = withoutStale({ dpMm: 800, twMm: 10 }, moved)
  assert.equal("dpMm" in dropped, false)
  assert.equal(dropped.twMm, 10)
  const reassigned: AssignmentLink = { field: "d1Mm", source: "bMm", captured: 900 }
  assert.equal(staleAssignments([reassigned], { ...panel, bMm: 900 }).length, 0)
  assert.equal(staleAssignments([], { ...panel, bMm: 1 }).length, 0)
})

test("design settings do not move IQ-PLB-E1.0, and kb is not filled from σcr", () => {
  const input = {
    aMm: 1000, bMm: 800, tMm: 10, eMpa: 210000, nu: 0.3,
    sigma1Mpa: 80, psi: 1, tauMpa: 20, nx: 6, ny: 6,
    edges: { x0: "ss" as const, x1: "ss" as const, y0: "ss" as const, y1: "ss" as const },
    krNPerRadPerMm: 0, modes: 1,
  }
  const before = solvePlateFem(input)
  const primary = evaluateAs4100({
    role: "element", clearWidthMm: 500, thicknessMm: 8, fyMpa: 350, residual: "HW",
    edgesSupported: "both", stress: "uniform-compression", kb: before.modes[0]?.sigma1CrMpa ?? 99, widthPath: "primary",
  })
  const plain = evaluateAs4100({
    role: "element", clearWidthMm: 500, thicknessMm: 8, fyMpa: 350, residual: "HW",
    edgesSupported: "both", stress: "uniform-compression", widthPath: "primary",
  })
  assert.equal(primary.diagram.effectiveMm, plain.diagram.effectiveMm)
  const after = solvePlateFem(input)
  assert.equal(after.modes[0]?.lambda, before.modes[0]?.lambda)
  assert.equal(after.modes[0]?.sigma1CrMpa, before.modes[0]?.sigma1CrMpa)
  assert.equal(after.modes[0]?.tauCrMpa, before.modes[0]?.tauCrMpa)
})

test("service deformation does not veto a strength pass and does not govern", () => {
  const report = evaluateAs4100({
    role: "element", clearWidthMm: 1000, thicknessMm: 10, fyMpa: 250, residual: "HR",
    edgesSupported: "both", stress: "uniform-compression", holes: "none", axial: "none",
  })
  assert.equal(report.checks.find((row) => row.id === "deformation")?.status, "fail")
  assert.equal(report.checks.find((row) => row.id === "deformation")?.kind, "service")
  assert.equal(report.overall, "pass")
  assert.match(report.headline, /SERVICE DEFORMATION WARNING/)
  assert.match(report.headline, /NOT COMPLETE AS 4100/)
  assert.equal(report.governingUtil, null)
})
