import assert from "node:assert/strict"
import test from "node:test"
import { areas } from "./areas.ts"
import { clearanceHoles } from "./clearance.ts"
import { classBand } from "./materials.ts"
import { PIPE_THREADS } from "./pipeThreads.ts"
import { tapDrill } from "./tap.ts"
import { threadProfile } from "./threadGeometry.ts"
import { boltTorque } from "./torque.ts"
import { boltCapacity, lapFactor } from "./capacities.ts"
import { buildSheet } from "./model.ts"
import { metricSizesFor, standardById } from "./database.ts"
import { parseBoltQuery } from "./search.ts"

test("M12 coarse tensile stress area is about 84.3 mm²", () => {
  const a = areas(12, 1.75)
  assert.ok(Math.abs(a.As - 84.3) < 0.15, `As ${a.As}`)
})

test("M20 and M24 coarse areas", () => {
  assert.ok(Math.abs(areas(20, 2.5).As - 245) < 0.6)
  assert.ok(Math.abs(areas(24, 3).As - 353) < 0.8)
})

test("M12 class 4.6 tension matches 0.80 fu As", () => {
  const a = areas(12, 1.75)
  const cap = boltCapacity({
    dMm: 12,
    pitchMm: 1.75,
    classId: "4.6",
    allowDesign: true,
    nn: 1,
    nx: 0,
    ljMm: null,
    nStar_kN: null,
    vStar_kN: null,
    tpMm: null,
    fupMPa: null,
    aeMm: null,
  })
  assert.equal(cap.ok, true)
  if (!cap.ok) return
  const expectKn = (0.8 * a.As * 400) / 1000
  assert.ok(Math.abs(cap.phiNtf_kN - expectKn) < 1e-9)
  assert.ok(Math.abs(cap.phiNtf_kN - 27) < 0.15)
})

test("8.8 above 16 mm uses fu 830", () => {
  const cap = boltCapacity({
    dMm: 20,
    pitchMm: 2.5,
    classId: "8.8",
    allowDesign: true,
    nn: 1,
    nx: 0,
    ljMm: null,
    nStar_kN: 50,
    vStar_kN: 40,
    tpMm: null,
    fupMPa: null,
    aeMm: null,
  })
  assert.equal(cap.ok, true)
  if (!cap.ok) return
  assert.equal(cap.fu, 830)
  assert.ok(cap.utilInteract != null && cap.utilInteract > 0)
})

test("M12 8.8 uses fu 800", () => {
  const cap = boltCapacity({
    dMm: 12,
    pitchMm: 1.75,
    classId: "8.8",
    allowDesign: true,
    nn: 0,
    nx: 1,
    ljMm: null,
    nStar_kN: null,
    vStar_kN: null,
    tpMm: null,
    fupMPa: null,
    aeMm: null,
  })
  assert.equal(cap.ok, true)
  if (!cap.ok) return
  assert.equal(cap.fu, 800)
  assert.equal(cap.krd, 1)
})

test("12.9 is outside the AS 4100 check", () => {
  const cap = boltCapacity({
    dMm: 20,
    pitchMm: 2.5,
    classId: "12.9",
    allowDesign: true,
    nn: 1,
    nx: 0,
    ljMm: null,
    nStar_kN: null,
    vStar_kN: null,
    tpMm: null,
    fupMPa: null,
    aeMm: null,
  })
  assert.equal(cap.ok, false)
})

test("lap factor", () => {
  assert.equal(lapFactor(0), 1)
  assert.equal(lapFactor(300), 1)
  assert.ok(Math.abs(lapFactor(800) - 0.875) < 1e-12)
  assert.equal(lapFactor(1300), 0.75)
  assert.equal(lapFactor(2000), 0.75)
})

test("pitch must be positive", () => {
  assert.throws(() => areas(20, 0), /Pitch/)
})

test("search understands engineering notation", () => {
  const hit = parseBoltQuery("AS 1252 M24 8.8")
  assert.equal(hit.matched, true)
  assert.equal(hit.sizeLabel, "M24")
  assert.equal(hit.standardId, "as1252")
  assert.equal(hit.classId, "8.8")
  const fine = parseBoltQuery("M20 fine")
  assert.equal(fine.pitchMm, 2)
  const inch = parseBoltQuery("3/4-10 UNC")
  assert.equal(inch.matched, true)
  assert.equal(inch.sizeLabel, "3/4")
  assert.equal(inch.series, "unc")
})

test("AS 1110 and AS 1111 are separate bolt standards", () => {
  const precision = parseBoltQuery("AS 1110 M20 8.8")
  assert.equal(precision.standardId, "as1110")
  assert.equal(precision.sizeLabel, "M20")
  assert.equal(precision.classId, "8.8")
  assert.notEqual(precision.focus, "areas")
  const commercial = parseBoltQuery("AS 1111 M16 4.6")
  assert.equal(commercial.standardId, "as1111")
  assert.equal(commercial.classId, "4.6")
  const a = standardById("as1110")
  const b = standardById("as1111")
  assert.ok(a && b)
  const precisionD = metricSizesFor(a).map((size) => size.d)
  const commercialD = metricSizesFor(b).map((size) => size.d)
  assert.ok(precisionD.includes(3) && precisionD.includes(64) && !precisionD.includes(68))
  assert.ok(!commercialD.includes(3) && commercialD.includes(5) && commercialD.includes(64) && !commercialD.includes(72))
})

test("sheet fails closed on a bad number", () => {
  const sheet = buildSheet({
    standardId: "iso-metric",
    sizeLabel: "M20",
    pitchMm: 2.5,
    classId: "8.8",
    lengthMm: "",
    threadedMm: "",
    nn: "1",
    nx: "0",
    lj: "",
    nStar: "nope",
    vStar: "",
    tp: "",
    fup: "",
    ae: "",
    qty: "1",
  })
  assert.match(sheet.error ?? "", /N\*/)
})

test("M20 ISO 273 clearance is 21 / 22 / 24", () => {
  const holes = clearanceHoles(20)
  assert.deepEqual(holes && { fine: holes.fine, medium: holes.medium, coarse: holes.coarse }, { fine: 21, medium: 22, coarse: 24 })
  assert.equal(clearanceHoles(100), null)
})

test("100 percent tap drill is the basic minor diameter", () => {
  const profile = threadProfile(20, 2.5)
  const drill = tapDrill(20, 2.5, 100)
  assert.ok(Math.abs(drill.drillMm - profile.d1) < 1e-9)
  assert.ok(Math.abs(drill.shopEstimateMm - 17.5) < 1e-9)
})

test("nut factor torque round-trips", () => {
  const profile = threadProfile(20, 2.5)
  const forward = boltTorque({
    dMm: 20, pitchMm: 2.5, d2Mm: profile.d2, asMm2: profile.As, basisMPa: 600, basisName: "Sp",
    percent: null, manualKn: 100, k: 0.2, torqueNm: null, muThread: null, muBearing: null, bearingOdMm: null, bearingIdMm: null,
  })
  assert.equal(forward.ok, true)
  if (!forward.ok) return
  assert.ok(Math.abs((forward.torqueFromPreloadNm ?? 0) - 400) < 1e-6)
  const back = boltTorque({
    dMm: 20, pitchMm: 2.5, d2Mm: profile.d2, asMm2: profile.As, basisMPa: 600, basisName: "Sp",
    percent: null, manualKn: null, k: 0.2, torqueNm: 400, muThread: null, muBearing: null, bearingOdMm: null, bearingIdMm: null,
  })
  assert.equal(back.ok, true)
  if (!back.ok) return
  assert.ok(Math.abs((back.fromTorqueKn ?? 0) - 100) < 1e-6)
})

test("advanced torque is the sum of thread and bearing", () => {
  const profile = threadProfile(20, 2.5)
  const result = boltTorque({
    dMm: 20, pitchMm: 2.5, d2Mm: profile.d2, asMm2: profile.As, basisMPa: 600, basisName: "Sp",
    percent: 70, manualKn: null, k: null, torqueNm: null, muThread: 0.12, muBearing: 0.14, bearingOdMm: 37, bearingIdMm: 21,
  })
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.ok(result.threadNm != null && result.bearingNm != null && result.advancedNm != null)
  assert.ok(Math.abs((result.threadNm + result.bearingNm) - result.advancedNm) < 1e-9)
  assert.ok((result.kFromAdvanced ?? 0) > 0)
})

test("NPT and BSPT are not the same 1/2 thread", () => {
  const npt = PIPE_THREADS.find((item) => item.id === "NPT-1/2")
  const bspt = PIPE_THREADS.find((item) => item.id === "BSPT-1/2")
  const bspp = PIPE_THREADS.find((item) => item.id === "BSPP-1/2")
  assert.equal(npt?.angleDeg, 60)
  assert.equal(bspt?.angleDeg, 55)
  assert.equal(bspp?.tapered, false)
  assert.notEqual(npt?.tpi, PIPE_THREADS.find((item) => item.id === "BSPT-1/8")?.tpi)
})

test("stainless classes are not carbon-steel property classes", () => {
  assert.equal(classBand("A2-70", 16), null)
  assert.equal(classBand("A4-80", 12), null)
})

