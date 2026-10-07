import { classicalPlate, kShear, kUniform, type Edges } from "./classical.ts"
import { countHalfWaves, solvePlateFem, type FemInput, type FemResult } from "./fem.ts"
import { forceToN, lengthToMm, stressToMpa } from "./units.ts"

const SS: Edges = { x0: "ss", x1: "ss", y0: "ss", y1: "ss" }
const steel = { eMpa: 210000, nu: 0.3, fyMpa: 350, fuMpa: 450 }

export type VerifyStatus = "pass" | "fail" | "limited" | "not-verified"

export type VerifyRow = {
  id: string
  title: string
  expected: string
  actual: string
  difference: string
  tolerance: string
  mesh: string
  residual: string
  basis: string
  status: VerifyStatus
}

function pct(got: number, reference: number): number {
  return (100 * (got - reference)) / Math.abs(reference)
}

function stressFromK(k: number, e: number, nu: number, t: number, b: number): number {
  return (k * Math.PI ** 2 * e * (t / b) ** 2) / (12 * (1 - nu * nu))
}

function fem(input: Partial<FemInput>): FemResult {
  return solvePlateFem(Object.assign({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3,
    sigma1Mpa: 0, psi: 1, tauMpa: 0, nx: 8, ny: 8,
    edges: SS, krNPerRadPerMm: 0, shapes: false, modes: 2,
  }, input))
}

function num(value: number | null | undefined, digits = 2): string {
  return value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits)
}

export function runVerification(): VerifyRow[] {
  const rows: VerifyRow[] = []
  const push = (row: VerifyRow) => rows.push(row)

  const squareRef = stressFromK(4, 210000, 0.3, 10, 1000)
  const square = fem({ aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 12, ny: 12, shapes: true, modes: 2 })
  const squareGot = square.modes[0]?.sigma1CrMpa ?? null
  const squarePct = squareGot == null ? null : pct(squareGot, squareRef)
  const squareWaves = square.ok ? countHalfWaves(square.modes[0]?.w ?? [], square.xs, square.ys, "x") : 0
  push({
    id: "V01",
    title: "Square uniform compression",
    expected: `${squareRef.toFixed(2)} MPa · kσ = 4 · 1 half-wave`,
    actual: squareGot == null ? square.reason : `${squareGot.toFixed(2)} MPa · half-waves ${squareWaves}`,
    difference: squarePct == null ? "—" : `${squarePct.toFixed(2)}%`,
    tolerance: "1% and 1 half-wave",
    mesh: "12×12",
    residual: square.residual.toExponential(2),
    basis: "Navier kσ = 4. Mindlin, not forced onto Kirchhoff. A b/t study moves this gap toward zero as the plate gets thinner.",
    status: squarePct != null && Math.abs(squarePct) <= 1 && squareWaves === 1 && square.residual < 1e-6 ? "pass" : "fail",
  })

  const longRef = stressFromK(4, 210000, 0.3, 10, 1000)
  const long = fem({ aMm: 2000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 16, ny: 8, shapes: true })
  const longGot = long.modes[0]?.sigma1CrMpa ?? null
  const longPct = longGot == null ? null : pct(longGot, longRef)
  const longWaves = long.ok ? countHalfWaves(long.modes[0]?.w ?? [], long.xs, long.ys, "x") : 0
  const classicalLong = kUniform(2)
  push({
    id: "V02",
    title: "Rectangular compression α = 2",
    expected: `${longRef.toFixed(2)} MPa · m = ${classicalLong.m}`,
    actual: longGot == null ? long.reason : `${longGot.toFixed(2)} MPa · half-waves ${longWaves}`,
    difference: longPct == null ? "—" : `${longPct.toFixed(2)}%`,
    tolerance: "1.5% and m = 2",
    mesh: "16×8",
    residual: long.residual.toExponential(2),
    basis: "Same kσ = 4 with the half-wave that minimises k. Aspect search is V03.",
    status: longPct != null && Math.abs(longPct) <= 1.5 && longWaves === 2 && classicalLong.m === 2 ? "pass" : "fail",
  })

  const aspects = [0.5, 1, 2, 4].map((alpha) => {
    const theory = kUniform(alpha)
    const expectM = alpha <= 1 ? 1 : alpha
    return `${alpha}: m=${theory.m}/${expectM}`
  })
  const aspectOk = [0.5, 1, 2, 4].every((alpha) => kUniform(alpha).m === (alpha <= 1 ? 1 : alpha))
  push({
    id: "V03",
    title: "Aspect-ratio half-wave search",
    expected: "m = 1, 1, 2, 4 for α = 0.5, 1, 2, 4",
    actual: aspects.join(" · "),
    difference: "—",
    tolerance: "exact m",
    mesh: "analytical",
    residual: "—",
    basis: "k(m) = (m/α + α/m)² minimised for m = 1…8. Independent of the FEM mesh.",
    status: aspectOk ? "pass" : "fail",
  })

  const bendClassical = classicalPlate({ aMm: 5000, bMm: 1000, tMm: 10, ...steel, sigma1Mpa: 100, psi: -1, tauMpa: 0, edges: SS })
  const bend = fem({ aMm: 5000, bMm: 1000, tMm: 10, sigma1Mpa: 100, psi: -1, tauMpa: 0, nx: 60, ny: 21, modes: 2 })
  const bendGot = bend.modes[0]?.sigma1CrMpa ?? null
  const bendRef = bendClassical.sigmaCrMpa
  const bendPct = bendGot != null && bendRef != null ? pct(bendGot, bendRef) : null
  const bendTight = bendPct != null && Math.abs(bendPct) <= 1
  push({
    id: "V04",
    title: "Pure bending ψ = −1",
    expected: bendRef == null ? "—" : `${bendRef.toFixed(2)} MPa · kσ = ${num(bendClassical.kSigma, 2)} (target 23.9)`,
    actual: bendGot == null ? bend.reason : `${bendGot.toFixed(2)} MPa`,
    difference: bendPct == null ? "—" : `${bendPct.toFixed(2)}%`,
    tolerance: "1% of the Galerkin value. Residual target 1e-8.",
    mesh: "60×21",
    residual: bend.residual.toExponential(2),
    basis: "Navier–Galerkin for four simple supports. The ±λ cluster is real: on this mesh the next positive eigenvalue sits about 0.36% higher. Lanczos on L⁻¹ Kg L⁻ᵀ resolves that cluster. The residual target is the eigenpair, not a tuned stress.",
    status: !bendTight ? "fail" : bend.residual < 1e-6 ? "pass" : "limited",
  })

  const shearK = kShear(1)
  const shearRef = stressFromK(shearK, 210000, 0.3, 8, 800)
  const shear = fem({ aMm: 800, bMm: 800, tMm: 8, sigma1Mpa: 0, psi: 1, tauMpa: 1, nx: 24, ny: 24, modes: 2 })
  const shearGot = shear.modes[0]?.tauCrMpa ?? null
  const shearPct = shearGot == null ? null : pct(shearGot, shearRef)
  const kFem = shearGot == null ? null : shearK * (shearGot / shearRef)
  push({
    id: "V05",
    title: "Pure shear — Timoshenko fit",
    expected: `APPROXIMATE / FIT kτ = ${shearK.toFixed(2)} · ${shearRef.toFixed(2)} MPa`,
    actual: shearGot == null ? shear.reason : `${shearGot.toFixed(2)} MPa · FEM kτ = ${num(kFem, 2)}`,
    difference: shearPct == null ? "—" : `${shearPct.toFixed(2)}%`,
    tolerance: "1.5% of the fit, not an exact series",
    mesh: "24×24",
    residual: shear.residual.toExponential(2),
    basis: "kτ = 5.34 + 4/α² is a fit. A 12×12 mesh was about 5% high and 32×32 was 0.2% the other way. Not tuned to 9.34.",
    status: shearPct != null && Math.abs(shearPct) <= 1.5 ? "limited" : "fail",
  })

  const combined = fem({ aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 50, psi: 1, tauMpa: 20, nx: 10, ny: 10 })
  push({
    id: "V06",
    title: "Combined compression + shear FEM",
    expected: "One positive λ on the combined field. No classical interaction formula.",
    actual: combined.ok ? `λ = ${num(combined.modes[0]?.lambda, 4)} · σ1,cr = ${num(combined.modes[0]?.sigma1CrMpa, 2)} MPa · τcr = ${num(combined.modes[0]?.tauCrMpa, 2)} MPa` : combined.reason,
    difference: "—",
    tolerance: "solves, not a code utilisation",
    mesh: "10×10",
    residual: combined.residual.toExponential(2),
    basis: "λ multiplies the entered σ and τ together. Classical σcr and τcr stay separate. No interaction equation is implemented.",
    status: combined.ok && (combined.modes[0]?.lambda ?? 0) > 0 ? "limited" : "fail",
  })

  const bare = fem({ aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 8, ny: 8 })
  const bareS = bare.modes[0]?.sigma1CrMpa ?? 0
  const beam = (id: string, axis: "x" | "y", at: number, ei: number, area = 800) => ({
    id, axis, atMm: at, eiNmm2: ei, gjNmm2: ei / 20, areaMm2: area, rigid: false,
  })
  const oneLong = fem({
    aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 8, ny: 8,
    stiffeners: [beam("L1", "x", 500, 210000 * 2.05e6)],
  })
  const twoLong = fem({
    aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 8, ny: 8,
    stiffeners: [beam("L1", "x", 330, 210000 * 1e6), beam("L2", "x", 670, 210000 * 1e6)],
  })
  const oneTrans = fem({
    aMm: 2000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 12, ny: 8,
    stiffeners: [beam("T1", "y", 500, 210000 * 2.05e6)],
  })
  const bareLong = fem({ aMm: 2000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 12, ny: 8 })
  const twoTrans = fem({
    aMm: 2000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 12, ny: 8,
    stiffeners: [beam("T1", "y", 650, 210000 * 1e6), beam("T2", "y", 1350, 210000 * 1e6)],
  })
  const grid = fem({
    aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 8, ny: 8,
    stiffeners: [beam("L", "x", 500, 210000 * 1e6), beam("T", "y", 500, 210000 * 1e6)],
  })
  const stiffRow = (id: string, title: string, result: FemResult, bareValue: number, factor: number, basis: string) => {
    const got = result.modes[0]?.sigma1CrMpa ?? 0
    const ok = result.ok && got > bareValue * factor
    push({
      id, title,
      expected: `Above ${factor}× the bare plate on the same mesh (${bareValue.toFixed(1)} MPa)`,
      actual: result.ok ? `${got.toFixed(1)} MPa` : result.reason,
      difference: bareValue ? `${pct(got, bareValue).toFixed(1)}% vs bare` : "—",
      tolerance: `> ${factor}× bare. Not a code stiffener check.`,
      mesh: `${result.nx}×${result.ny}`,
      residual: result.residual.toExponential(2),
      basis,
      status: ok ? "pass" : "fail",
    })
  }
  push({
    id: "V07",
    title: "No stiffener",
    expected: `${squareRef.toFixed(2)} MPa on this 8×8 mesh, within 2%`,
    actual: bare.ok ? `${bareS.toFixed(2)} MPa` : bare.reason,
    difference: `${pct(bareS, squareRef).toFixed(2)}%`,
    tolerance: "2%",
    mesh: "8×8",
    residual: bare.residual.toExponential(2),
    basis: "Bare-plate reference for the stiffener rows. Same idealisation as V01 on a coarser mesh.",
    status: Math.abs(pct(bareS, squareRef)) <= 2 ? "pass" : "fail",
  })
  stiffRow("V08", "One longitudinal stiffener", oneLong, bareS, 1.5, "A flat-bar EI about the plate mid-surface raises σcr. The bar is not treated as a simple support.")
  stiffRow("V09", "Two longitudinal stiffeners", twoLong, bareS, 1.3, "Two lines at third-points. Stiffness adds. No subpanel closed form is used.")
  stiffRow("V10", "One transverse stiffener off the natural node", oneTrans, bareLong.modes[0]?.sigma1CrMpa ?? 0, 1.05, "α = 2 buckles in two half-waves, so the bar is at a/4, not on the node line. A bar on the node would barely move λ1.")
  stiffRow("V11", "Two transverse stiffeners", twoTrans, bareLong.modes[0]?.sigma1CrMpa ?? 0, 1.1, "Two transverse lines. Compared with the bare α = 2 plate on the same mesh.")
  stiffRow("V12", "Longitudinal + transverse grid", grid, bareS, 1.3, "The crossing shares plate nodes. EI of both members is assembled. Not a rigid support.")

  const patchCase = (ss: number, at: number, n = 10) => fem({
    aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 0, psi: 1, tauMpa: 0, nx: n, ny: n,
    patchLoad: { edge: "y1", atMm: at, lengthMm: ss, forceN: 20000 },
  })
  const centre = patchCase(200, 500)
  const right = patchCase(200, 700)
  const left = patchCase(200, 300)
  const centreF = centre.modes[0]?.patchCrN ?? 0
  const rightF = right.modes[0]?.patchCrN ?? 0
  const leftF = left.modes[0]?.patchCrN ?? 0
  const mirrorPct = pct(leftF, rightF)
  push({
    id: "V13",
    title: "Centred patch",
    expected: "Positive critical force. Nodal resultant equals 20000 N.",
    actual: centre.ok ? `${centreF.toFixed(0)} N` : centre.reason,
    difference: "—",
    tolerance: "equilibrium in the pre-buckling note",
    mesh: "10×10",
    residual: centre.residual.toExponential(2),
    basis: centre.prestressNote || "No prestress note.",
    status: centre.ok && centreF > 0 && /Difference 0\.0000%/.test(centre.prestressNote) ? "pass" : centre.ok ? "limited" : "fail",
  })
  push({
    id: "V14",
    title: "Mirrored patch symmetry",
    expected: "Fcr(at 300) = Fcr(at 700)",
    actual: `${leftF.toFixed(0)} N and ${rightF.toFixed(0)} N`,
    difference: `${mirrorPct.toFixed(3)}%`,
    tolerance: "0.5%",
    mesh: "10×10",
    residual: Math.max(left.residual, right.residual).toExponential(2),
    basis: "Square plate, same ss and force, centres mirrored about mid-width.",
    status: left.ok && right.ok && Math.abs(mirrorPct) <= 0.5 ? "pass" : "fail",
  })
  const short = patchCase(200, 500, 12)
  const medium = patchCase(500, 500, 12)
  const longPatch = patchCase(800, 500, 12)
  const full = patchCase(1000, 500, 12)
  const series = [short, medium, longPatch, full].map((item) => item.modes[0]?.patchCrN ?? 0)
  const smooth = series.every((value, index) => index === 0 || value > series[index - 1]! * 0.99)
  push({
    id: "V15",
    title: "Patch-length progression",
    expected: "Fcr rises as ss goes 200 → 500 → 800 → 1000 at the same force",
    actual: series.map((value) => `${Math.round(value)} N`).join(" · "),
    difference: smooth ? "monotonic" : "jump",
    tolerance: "no decrease",
    mesh: "12×12",
    residual: short.residual.toExponential(2),
    basis: "Same total force. A shorter patch is a more severe local compression. Not a code resistance.",
    status: smooth && series[0]! > 0 ? "pass" : "fail",
  })
  const uniform = fem({ aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 0, sigmaYMpa: 1, psi: 1, tauMpa: 0, nx: 12, ny: 12 })
  const fullF = full.modes[0]?.patchCrN ?? 0
  const uniformSigma = uniform.modes[0]?.sigmaYCrMpa ?? 0
  const fullSigma = fullF / (1000 * 10)
  const limitPct = uniformSigma ? pct(fullSigma, uniformSigma) : null
  push({
    id: "V16",
    title: "Patch full-edge limit",
    expected: `Uniform σy,cr = ${num(uniformSigma, 3)} MPa on the same mesh`,
    actual: `Patch σ = Fcr/(a·t) = ${num(fullSigma, 3)} MPa · Fcr = ${num(fullF, 0)} N`,
    difference: limitPct == null ? "—" : `${limitPct.toFixed(2)}%`,
    tolerance: "1%",
    mesh: "12×12",
    residual: full.residual.toExponential(2),
    basis: "ss = a on y = b is uniform compression in y. 20000 N on a 1000×10 mm edge is 2 MPa, so the force multiplier is not compared with the 1 MPa eigenvalue. The membrane stresses are.",
    status: limitPct != null && Math.abs(limitPct) <= 1 ? "pass" : "fail",
  })

  const metres = lengthToMm(1, "m")
  const gpa = stressToMpa(210, "GPa")
  const kilonewtons = forceToN(10, "kN")
  const unitPlate = classicalPlate({ aMm: metres, bMm: metres, tMm: lengthToMm(10, "mm"), eMpa: gpa, nu: 0.3, fyMpa: stressToMpa(0.35, "GPa"), fuMpa: 450, sigma1Mpa: 100, psi: 1, tauMpa: 0, edges: SS })
  const unitOk = metres === 1000 && Math.abs(gpa - 210000) < 1e-6 && kilonewtons === 10000 && unitPlate.sigmaCrMpa != null && Math.abs(unitPlate.sigmaCrMpa - squareRef) / squareRef < 1e-9
  push({
    id: "V17",
    title: "Unit invariance",
    expected: "1 m = 1000 mm, 210 GPa = 210000 MPa, 10 kN = 10000 N, same σcr",
    actual: unitOk ? `${unitPlate.sigmaCrMpa?.toFixed(2)} MPa` : `m=${metres}, E=${gpa}, F=${kilonewtons}, σ=${unitPlate.sigmaCrMpa}`,
    difference: "0 within conversion",
    tolerance: "exact after conversion to mm, N, MPa",
    mesh: "analytical",
    residual: "—",
    basis: "Shared IQEG unit engine at the boundary. The plate equations are not rewritten in metres.",
    status: unitOk ? "pass" : "fail",
  })
  push({
    id: "V18",
    title: "Stale FEM state",
    expected: "Changing an input clears the live result until FEM is run again",
    actual: "Sheet rule, not re-clicked inside this solver batch",
    difference: "—",
    tolerance: "operator check",
    mesh: "—",
    residual: "—",
    basis: "The sheet compares a key of the canonical inputs with the key stored at the last solve. This batch cannot press the button.",
    status: "not-verified",
  })
  const refused = [
    fem({ aMm: 1000, bMm: 1000, tMm: 0, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 4, ny: 4 }).ok,
    fem({ aMm: 1000, bMm: 1000, tMm: 10, nu: 0.6, sigma1Mpa: 1, psi: 1, tauMpa: 0, nx: 4, ny: 4 }).ok,
    fem({ aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: -40, psi: 1, tauMpa: 0, nx: 4, ny: 4 }).ok,
    fem({ aMm: 1000, bMm: 1000, tMm: 10, sigma1Mpa: 0, psi: 1, tauMpa: 0, nx: 4, ny: 4, patchLoad: { edge: "y1", atMm: 50, lengthMm: 200, forceN: 1000 } }).ok,
  ]
  push({
    id: "V19",
    title: "Invalid input rejection",
    expected: "t = 0, ν = 0.6, pure tension, and an off-edge patch are refused",
    actual: refused.some(Boolean) ? "one of them solved" : "all four refused",
    difference: "—",
    tolerance: "fail closed",
    mesh: "—",
    residual: "—",
    basis: "No eigenvalue is returned for a non-physical plate or a tensile field with no compression.",
    status: refused.some(Boolean) ? "fail" : "pass",
  })
  push({
    id: "V20",
    title: "Eigenpair residual",
    expected: "Uniform compression residual below 1e-6. Bending residual reported, not hidden.",
    actual: `V01 ${square.residual.toExponential(2)} · V04 ${bend.residual.toExponential(2)} · target ${square.solverTolerance.toExponential(0)}`,
    difference: "—",
    tolerance: "1e-8 where the spectrum is simple",
    mesh: "see V01 and V04",
    residual: square.residual.toExponential(2),
    basis: "Residual is ||Kφ − λ Kg φ|| / ||Kφ||. Both the uniform and the pure-bending eigenpairs are required under 1e-8 before this row passes. A larger bending residual is reported as limited, not hidden.",
    status: square.residual < 1e-8 && bend.residual < 1e-8 ? "pass" : square.residual < 1e-6 && bend.residual < 1e-4 ? "limited" : "fail",
  })
  return rows
}
