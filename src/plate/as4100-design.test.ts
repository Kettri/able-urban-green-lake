import assert from "node:assert/strict"
import { test } from "node:test"
import { designChecks } from "./codes/dispatch.ts"
import { solvePlateFem } from "./fem.ts"
import { alphaC } from "./standards/as4100/member.ts"
import { productAlpha } from "./standards/as4100/shear.ts"
import { evaluateAs4100 } from "./standards/as4100/evaluate.ts"

const SS = { x0: "ss" as const, x1: "ss" as const, y0: "ss" as const, y1: "ss" as const }

test("Table 6.3.3(C) cells match the Clause 6.3.3 closed form", () => {
  const cells: [number, number, number][] = [
    [30, -1, 0.991],
    [30, -0.5, 0.968],
    [30, 0, 0.943],
    [30, 0.5, 0.917],
    [30, 1, 0.888],
    [90, -1, 0.737],
    [90, -0.5, 0.675],
    [90, 0, 0.610],
    [90, 0.5, 0.547],
    [90, 1, 0.487],
  ]
  for (const [lambdaN, alphaB, published] of cells) {
    assert.ok(Math.abs(alphaC(lambdaN, alphaB) - published) < 0.0015, `${lambdaN},${alphaB}`)
  }
  assert.equal(alphaC(0, 0), 1)
})

test("stiffened shear factors match Table 5.11.5.2 at (dp/tw)√(fy/250) = 90", () => {
  assert.ok(Math.abs(productAlpha(90, 2.5) - 0.952) < 0.0015)
  assert.ok(Math.abs(productAlpha(90, 3) - 0.927) < 0.0015)
  assert.ok(Math.abs(productAlpha(90, 4) - (82 / 90) ** 2) < 1e-12)
})

test("flat element 300×10, fy 350, both edges, HR is non-compact and fully effective", () => {
  const report = evaluateAs4100({
    role: "element",
    clearWidthMm: 300,
    thicknessMm: 10,
    fyMpa: 350,
    residual: "HR",
    edgesSupported: "both",
    stress: "uniform-compression",
    axial: "none",
    holes: "none",
  })
  const row = report.checks.find((item) => item.id === "slenderness")
  const width = report.checks.find((item) => item.id === "effective-width")
  assert.match(row?.result ?? "", /NON-COMPACT/)
  assert.match(row?.steps.join(" ") ?? "", /Table 5\.2/)
  assert.ok(Math.abs(35.4964787 - 35.496) < 0.01)
  assert.match(row?.steps.join(" ") ?? "", /35\.496/)
  assert.equal(report.diagram.effectiveMm, 300)
  assert.match(width?.clause ?? "", /6\.2\.4/)
  assert.equal(report.overall, "pass")
  assert.match(report.headline, /PASS FOR ALL APPLICABLE IMPLEMENTED CHECKS/)
  assert.match(report.headline, /NOT COMPLETE AS 4100/)
})

test("heavily welded 500×8 plate uses Table 6.2.4 λey = 35", () => {
  const report = evaluateAs4100({
    role: "element",
    clearWidthMm: 500,
    thicknessMm: 8,
    fyMpa: 350,
    residual: "HW",
    edgesSupported: "both",
    stress: "uniform-compression",
    holes: "none",
    axial: "compression",
  })
  const width = report.checks.find((item) => item.id === "effective-width")
  const axial = report.checks.find((item) => item.id === "axial")
  assert.ok(width)
  assert.ok(Math.abs((report.diagram.effectiveMm ?? 0) - 236.643191) < 0.001)
  assert.match(width?.result ?? "", /236\.643/)
  assert.ok(axial)
  assert.match(axial?.equation ?? "", /Ns/)
  assert.ok(Math.abs((axial?.nominal ?? 0) - 662600.936) < 0.05)
  assert.equal(axial?.phi, 0.9)
  assert.match(axial?.phiSource ?? "", /Table 3\.4/)
  assert.ok(Math.abs((axial?.designCapacity ?? 0) - 596340.842) < 0.05)
  assert.equal(axial?.status, "not-checked")
})

test("tension does not use the compression effective section", () => {
  const report = evaluateAs4100({
    role: "element",
    clearWidthMm: 500,
    thicknessMm: 8,
    fyMpa: 350,
    fuMpa: 480,
    residual: "HW",
    edgesSupported: "both",
    stress: "uniform-compression",
    holes: "none",
    axial: "tension",
    kt: 1,
    nStarN: -100000,
  })
  const axial = report.checks.find((item) => item.id === "axial")
  assert.match(axial?.clause ?? "", /7\.2/)
  assert.match(axial?.steps.join(" ") ?? "", /not used as a tensile resistance/)
  assert.ok(Math.abs((axial?.nominal ?? 0) - 1_400_000) < 0.1)
  assert.ok(Math.abs((axial?.designCapacity ?? 0) - 1_260_000) < 0.1)
  assert.ok(Math.abs((axial?.utilisation ?? 0) - 100000 / 1_260_000) < 1e-9)
  assert.equal(axial?.status, "pass")
})

test("residual class is required and is not assumed", () => {
  const report = evaluateAs4100({
    role: "element",
    clearWidthMm: 300,
    thicknessMm: 10,
    fyMpa: 350,
    edgesSupported: "both",
    stress: "uniform-compression",
  })
  const row = report.checks.find((item) => item.id === "slenderness")
  assert.equal(row?.status, "data-required")
  assert.equal(row?.result, "VERIFIED STANDARD DATA REQUIRED")
  assert.match(row?.note ?? "", /Residual/)
})

test("unstiffened web shear, dp 800, tw 8, fy 300, V* 400 kN", () => {
  const report = evaluateAs4100({
    role: "web",
    dpMm: 800,
    twMm: 8,
    fyMpa: 300,
    webGross: "gross",
    stiffening: "unstiffened",
    shearMode: "uniform",
    vStarN: 400000,
    webBound: "both-flanges",
    d1Mm: 800,
    bearing: "none",
    stiffener: "none",
    interaction: "none",
    openings: "none",
    axial: "none",
  })
  const shear = report.checks.find((item) => item.id === "shear")
  assert.match(shear?.clause ?? "", /5\.11\.5/)
  assert.ok(Math.abs((shear?.nominal ?? 0) - 645504) < 0.1)
  assert.ok(Math.abs((shear?.designCapacity ?? 0) - 580953.6) < 0.1)
  assert.ok(Math.abs((shear?.utilisation ?? 0) - 400000 / 580953.6) < 1e-9)
  assert.equal(shear?.status, "pass")
  assert.match(shear?.note ?? "", /τcr/)
  assert.equal(report.overall, "pass")
  assert.match(report.headline, /PASS FOR ALL APPLICABLE IMPLEMENTED CHECKS/)
  assert.match(report.headline, /NOT COMPLETE AS 4100/)
  const omitted = evaluateAs4100({
    role: "web",
    dpMm: 800,
    twMm: 8,
    fyMpa: 300,
    webGross: "gross",
    stiffening: "unstiffened",
    shearMode: "uniform",
    vStarN: 400000,
    webBound: "both-flanges",
    d1Mm: 800,
  })
  assert.equal(omitted.checks.find((item) => item.id === "shear")?.status, "pass")
  assert.equal(omitted.overall, "not-complete")
  assert.match(omitted.headline, /NOT A COMPLETE PASS/)
})

test("stocky web uses shear yield only", () => {
  const report = evaluateAs4100({
    role: "web",
    dpMm: 400,
    twMm: 10,
    fyMpa: 250,
    webGross: "gross",
    stiffening: "unstiffened",
    shearMode: "uniform",
    d1Mm: 400,
    webBound: "both-flanges",
  })
  const shear = report.checks.find((item) => item.id === "shear")
  assert.match(shear?.title ?? "", /yield/)
  assert.ok(Math.abs((shear?.nominal ?? 0) - 600000) < 0.1)
  assert.ok(Math.abs((shear?.designCapacity ?? 0) - 540000) < 0.1)
  assert.equal(shear?.status, "not-checked")
})

test("I-section bearing yield is 1.25 bbf tw fy and is not the patch eigenvalue", () => {
  const report = evaluateAs4100({
    role: "web",
    bearing: "ic",
    bbfMm: 100,
    bbMm: 500,
    twMm: 10,
    fyMpa: 300,
    d1Mm: 200,
    flangesRestrained: true,
    rStarN: 200000,
    stiffening: "unstiffened",
  })
  const row = report.checks.find((item) => item.id === "bearing")
  assert.equal(row?.nominal, 375000)
  assert.equal(row?.designCapacity, 337500)
  assert.equal(row?.phi, 0.9)
  assert.match(row?.steps.join(" ") ?? "", /αc = 0\.7791/)
  assert.match(row?.note ?? "", /not Rbb/)
  assert.equal(row?.status, "pass")
})

test("RHS bearing is outside the implemented scope", () => {
  const report = evaluateAs4100({ role: "web", bearing: "rhs" })
  const row = report.checks.find((item) => item.id === "bearing")
  assert.equal(row?.status, "out-of-scope")
  assert.match(row?.result ?? "", /OUTSIDE/)
  assert.match(row?.note ?? "", /αp/)
})

test("intermediate stiffener second moment uses the length-to-the-fourth limit", () => {
  const d1 = 1000
  const tw = 10
  const s = 2000
  const need = 1.5 * d1 ** 3 * tw ** 3 / s ** 2
  assert.ok(Math.abs(need - 375000) < 1e-6)
  const below = evaluateAs4100({
    role: "web",
    stiffener: "intermediate",
    arrangement: "pair",
    d1Mm: d1,
    twMm: tw,
    dpMm: d1,
    sMm: s,
    fyMpa: 250,
    webGross: "gross",
    stiffening: "transverse",
    shearMode: "uniform",
    isMm4: need / 2,
    asMm2: 1000,
    tsMm: 10,
    besMm: 80,
    fysMpa: 250,
  })
  const low = below.checks.find((item) => item.id === "stiffener-stiffness")
  assert.equal(low?.status, "fail")
  assert.match(low?.steps.join(" ") ?? "", /1\.5 d1/)
  const on = evaluateAs4100({
    role: "web",
    stiffener: "intermediate",
    arrangement: "pair",
    d1Mm: d1,
    twMm: tw,
    dpMm: d1,
    sMm: s,
    fyMpa: 250,
    webGross: "gross",
    stiffening: "transverse",
    shearMode: "uniform",
    isMm4: need,
    asMm2: 1000,
    tsMm: 10,
    besMm: 80,
    fysMpa: 250,
  })
  assert.equal(on.checks.find((item) => item.id === "stiffener-stiffness")?.status, "pass")
})

test("the two stiffener stiffness limits meet at s/d1 = √2", () => {
  const d1 = 800
  const tw = 8
  const s = d1 * Math.SQRT2
  const first = 0.75 * d1 * tw ** 3
  const second = 1.5 * d1 * tw ** 3 / (s / d1) ** 2
  assert.ok(Math.abs(first - second) / first < 1e-12)
})

test("kb is not taken from the eigenvalue unless the alternative width is selected", () => {
  const base = {
    role: "element" as const,
    clearWidthMm: 500,
    thicknessMm: 8,
    fyMpa: 350,
    residual: "HW" as const,
    edgesSupported: "both" as const,
    stress: "uniform-compression" as const,
  }
  const primary = evaluateAs4100({ ...base, kb: 8, widthPath: "primary" })
  const plain = evaluateAs4100(base)
  assert.equal(primary.diagram.effectiveMm, plain.diagram.effectiveMm)
  assert.match(primary.checks.find((item) => item.id === "effective-width")?.steps.join(" ") ?? "", /not mixed/)
  const alternative = evaluateAs4100({ ...base, widthPath: "alternative" })
  assert.equal(alternative.checks.find((item) => item.id === "effective-width")?.status, "data-required")
  assert.match(alternative.checks.find((item) => item.id === "effective-width")?.note ?? "", /FEM σcr is not inserted/)
})

test("thickness below 3 mm and fy above 690 MPa are outside AS 4100", () => {
  assert.equal(evaluateAs4100({ role: "element", clearWidthMm: 100, thicknessMm: 2, fyMpa: 350, residual: "HR", edgesSupported: "both", stress: "uniform-compression" }).checks.find((item) => item.id === "slenderness")?.status, "out-of-scope")
  assert.equal(evaluateAs4100({ role: "element", clearWidthMm: 100, thicknessMm: 10, fyMpa: 700, residual: "HR", edgesSupported: "both", stress: "uniform-compression" }).checks.find((item) => item.id === "slenderness")?.status, "out-of-scope")
})

test("a passing element check still says it is not certified, and Appendix I does not govern", () => {
  const report = evaluateAs4100({
    role: "element",
    clearWidthMm: 200,
    thicknessMm: 10,
    fyMpa: 250,
    residual: "HR",
    edgesSupported: "both",
    stress: "uniform-compression",
    holes: "none",
    axial: "none",
  })
  assert.equal(report.overall, "pass")
  assert.match(report.headline, /PASS FOR ALL APPLICABLE IMPLEMENTED CHECKS/)
  assert.match(report.headline, /NOT COMPLETE AS 4100/)
  assert.equal(report.checks.find((item) => item.id === "appendix-i")?.normative, false)
  assert.equal(report.checks.find((item) => item.id === "member-nc")?.status, "out-of-scope")
  assert.equal(report.governingUtil, null)
})

test("the default adapter does not invent a resistance from the panel", () => {
  const rows = designChecks("as4100", {
    aMm: 1000, bMm: 500, tMm: 10, fyMpa: 350, edgesSimplySupported: true, stiffenerCount: 1, hasPatch: true,
  })
  assert.ok(rows.some((row) => row.id === "elastic-fence"))
  assert.equal(rows.find((row) => row.id === "slenderness")?.status, "not-checked")
  assert.ok(rows.every((row) => row.result !== "PASS" && !/^\d+(\.\d+)?\s*kN/.test(row.result)))
  const en = designChecks("en1993", { aMm: 1, bMm: 1, tMm: 1, fyMpa: 1, edgesSimplySupported: true, stiffenerCount: 0, hasPatch: false })
  const crane = designChecks("as5224", { aMm: 1, bMm: 1, tMm: 1, fyMpa: 1, edgesSimplySupported: true, stiffenerCount: 0, hasPatch: false })
  assert.ok(en.every((row) => row.status !== "pass"))
  assert.ok(crane.every((row) => row.result === "NOT A DESIGN CAPACITY" || row.result === "VERIFIED STANDARD DATA REQUIRED"))
})

test("Clause 5.12.3 reduces shear when moment exceeds 0.75 φMs", () => {
  const ms = 1e8
  const mStar = 8e7
  const phi = 0.9
  const vv = 600000
  const vvm = vv * (2.2 - 1.6 * mStar / (phi * ms))
  const report = evaluateAs4100({
    role: "web",
    dpMm: 400,
    twMm: 10,
    fyMpa: 250,
    webGross: "gross",
    stiffening: "unstiffened",
    shearMode: "uniform",
    interaction: "section",
    msNmm: ms,
    mStarNmm: mStar,
    vStarN: 200000,
    d1Mm: 400,
    webBound: "both-flanges",
  })
  const row = report.checks.find((item) => item.id === "interaction")
  assert.ok(Math.abs(vvm - 466666.6667) < 0.01)
  assert.ok(Math.abs((row?.nominal ?? 0) - vvm) < 0.1)
  assert.ok(Math.abs((row?.designCapacity ?? 0) - phi * vvm) < 0.1)
  assert.ok(Math.abs((row?.utilisation ?? 0) - mStar / (phi * ms)) < 1e-9)
  assert.match(row?.clause ?? "", /5\.12\.3/)
  assert.match(row?.note ?? "", /not γM/)
})

test("running the design layer does not change IQ-PLB-E1.0", () => {
  const input = {
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3,
    sigma1Mpa: 100, psi: 1, tauMpa: 0, nx: 8, ny: 8, edges: SS, krNPerRadPerMm: 0, modes: 1,
  }
  const before = solvePlateFem(input)
  evaluateAs4100({
    role: "element", clearWidthMm: 300, thicknessMm: 10, fyMpa: 350, residual: "HR",
    edgesSupported: "both", stress: "uniform-compression", kb: 6, widthPath: "alternative",
  })
  designChecks("as4100", {
    ...{ aMm: 1000, bMm: 1000, tMm: 10, fyMpa: 350, edgesSimplySupported: true, stiffenerCount: 3, hasPatch: true },
    design: { role: "web", dpMm: 1000, twMm: 10, fyMpa: 350, webGross: "gross", stiffening: "unstiffened", shearMode: "uniform", vStarN: 1 },
  })
  const after = solvePlateFem(input)
  assert.equal(before.ok, true)
  assert.equal(after.modes[0]?.lambda, before.modes[0]?.lambda)
  assert.equal(after.modes[0]?.sigma1CrMpa, before.modes[0]?.sigma1CrMpa)
  assert.equal(after.modes[0]?.tauCrMpa, before.modes[0]?.tauCrMpa)
})
