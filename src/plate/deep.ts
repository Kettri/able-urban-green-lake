/** Heavier elastic checks. Not a design-code verification. */
import { biaxialUniform, classicalPlate, galerkinSigma, kShear, kShearSeries, kUniform, type Edges } from "./classical.ts"
import { countHalfWaves, solvePlateFem, type FemInput, type FemResult } from "./fem.ts"
import type { VerifyRow, VerifyStatus } from "./benchmarks.ts"

const SS: Edges = { x0: "ss", x1: "ss", y0: "ss", y1: "ss" }
const FIXED: Edges = { x0: "fixed", x1: "fixed", y0: "fixed", y1: "fixed" }
const OUT: Edges = { x0: "ss", x1: "ss", y0: "ss", y1: "free" }

function fem(input: Partial<FemInput>): FemResult {
  return solvePlateFem(Object.assign({
    aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3,
    sigma1Mpa: 0, psi: 1, tauMpa: 0, nx: 8, ny: 8,
    edges: SS, krNPerRadPerMm: 0, shapes: false, modes: 2,
  }, input))
}

function pct(got: number, ref: number): number {
  return (100 * (got - ref)) / Math.abs(ref)
}

function stressFromK(k: number, t = 10, b = 1000): number {
  return (k * Math.PI ** 2 * 210000 * (t / b) ** 2) / (12 * (1 - 0.3 * 0.3))
}

function row(partial: VerifyRow): VerifyRow {
  return partial
}

export function runDeepVerification(): VerifyRow[] {
  const rows: VerifyRow[] = []

  const aspects = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 10]
  const aspectBits: string[] = []
  let aspectWorst = 0
  let aspectFail = false
  for (const alpha of aspects) {
    const theory = kUniform(alpha)
    const ny = alpha < 1 ? 16 : 12
    const nx = Math.min(60, Math.max(8, Math.round(ny * alpha)))
    const solved = fem({ aMm: alpha * 1000, bMm: 1000, tMm: 10, sigma1Mpa: 1, psi: 1, nx, ny, shapes: true, modes: 1 })
    const got = solved.modes[0]?.sigma1CrMpa
    const ref = stressFromK(theory.k)
    const err = got == null ? Infinity : pct(got, ref)
    const waves = solved.ok ? countHalfWaves(solved.modes[0]?.w ?? [], solved.xs, solved.ys, "x") : 0
    if (!solved.ok || Math.abs(err) > 3 || solved.residual > 1e-6) aspectFail = true
    aspectWorst = Math.max(aspectWorst, Math.abs(err))
    aspectBits.push(`α=${alpha} m=${theory.m}/${waves} ${err.toFixed(2)}% r=${solved.residual.toExponential(1)} ${nx}×${ny}`)
  }
  rows.push(row({
    id: "D01",
    title: "Compression aspect sweep",
    expected: "FEM within 3% of k(m)=(m/α+α/m)² and the governing half-wave",
    actual: aspectBits.join(" · "),
    difference: `${aspectWorst.toFixed(2)}% worst`,
    tolerance: "3% and residual < 1e-6",
    mesh: "ny=16 if α<1 else 12, nx from 8 to 60",
    residual: "see actual",
    basis: "EXACT ANALYTICAL BENCHMARK. Navier kσ. Mindlin is not forced onto Kirchhoff.",
    status: aspectFail ? "fail" : "pass",
  }))

  const psis = [1, 0.75, 0.5, 0.25, 0, -0.25, -0.5, -0.75, -1]
  const psiBits: string[] = []
  let psiWorst = 0
  let psiResidual = 0
  for (const psi of psis) {
    const energy = galerkinSigma({ aMm: 5000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, psi, nMax: 8, mMax: 10 })
    const solved = fem({ aMm: 5000, bMm: 1000, tMm: 10, sigma1Mpa: 100, psi, nx: 30, ny: 11, modes: 1 })
    const got = solved.modes[0]?.sigma1CrMpa
    const ref = energy?.sigma ?? NaN
    const err = got == null || !Number.isFinite(ref) ? Infinity : pct(got, ref)
    psiWorst = Math.max(psiWorst, Math.abs(err))
    psiResidual = Math.max(psiResidual, solved.residual)
    psiBits.push(`ψ=${psi} k=${energy ? energy.k.toFixed(2) : "—"} ${got == null ? "—" : got.toFixed(1)}/${ref.toFixed(1)} ${err.toFixed(2)}% r=${solved.residual.toExponential(1)}`)
  }
  const psiStatus: VerifyStatus = psiResidual > 1e-6 ? "fail" : psiWorst <= 2 ? "pass" : "limited"
  rows.push(row({
    id: "D02",
    title: "Stress-gradient sweep",
    expected: "Each ψ against its own Navier–Galerkin σcr. Residual under 1e-6.",
    actual: psiBits.join(" · "),
    difference: `${psiWorst.toFixed(2)}% worst`,
    tolerance: "2% pass. Above 2% is the 30×11 mesh, not a failed eigenpair, if the residual is small.",
    mesh: "30×11 on 5000×1000",
    residual: psiResidual.toExponential(2),
    basis: "APPROXIMATE ANALYTICAL BENCHMARK. Galerkin in n, minimised over m. Coarse mesh error is left visible.",
    status: psiStatus,
  }))

  const shearAspects = [0.5, 1, 2, 3, 4]
  const shearBits: string[] = []
  let shearWorstSeries = 0
  let shearFail = false
  for (const alpha of shearAspects) {
    const fit = kShear(alpha)
    const series = kShearSeries(alpha, 6)
    const ny = alpha <= 1 ? 20 : 14
    const nx = Math.min(40, Math.max(12, Math.round(ny * alpha)))
    const solved = fem({ aMm: alpha * 800, bMm: 800, tMm: 8, sigma1Mpa: 0, tauMpa: 1, nx, ny, modes: 1 })
    const got = solved.modes[0]?.tauCrMpa
    const unit = stressFromK(1, 8, 800)
    const kFem = got == null ? NaN : got / unit
    const vsSeries = series && Number.isFinite(kFem) ? pct(kFem, series.k) : Infinity
    const vsFit = Number.isFinite(kFem) ? pct(kFem, fit) : Infinity
    if (!solved.ok || solved.residual > 1e-6 || Math.abs(vsSeries) > 4) shearFail = true
    shearWorstSeries = Math.max(shearWorstSeries, Math.abs(vsSeries))
    shearBits.push(`α=${alpha} series ${series ? series.k.toFixed(3) : "—"} fit ${fit.toFixed(3)} FEM ${Number.isFinite(kFem) ? kFem.toFixed(3) : "—"} (${vsSeries.toFixed(2)}% series, ${vsFit.toFixed(2)}% fit) r=${solved.residual.toExponential(1)}`)
  }
  rows.push(row({
    id: "D03",
    title: "Shear aspect sweep",
    expected: "FEM kτ within 4% of the Navier–Galerkin series. The fit is shown beside it.",
    actual: shearBits.join(" · "),
    difference: `${shearWorstSeries.toFixed(2)}% vs series`,
    tolerance: "4% of the series, residual < 1e-6",
    mesh: "ny=20 if α≤1 else 14, nx at least 12",
    residual: "see actual",
    basis: "APPROXIMATE ANALYTICAL BENCHMARK for the series (energy upper bound, 6×6 sines). The Timoshenko expression remains a FIT. On a square plate the 6×6 series and the fit agree to about 0.2%.",
    status: shearFail ? "fail" : "pass",
  }))

  const bi = biaxialUniform({ aMm: 1000, bMm: 1000, tMm: 10, eMpa: 210000, nu: 0.3, sigmaXMpa: 1, sigmaYMpa: 1 })
  const biFem = fem({ sigma1Mpa: 1, sigmaYMpa: 1, psi: 1, nx: 12, ny: 12, modes: 1 })
  const biGot = biFem.modes[0]?.sigma1CrMpa
  const biErr = bi && biGot != null ? pct(biGot, bi.sigmaXCrMpa) : Infinity
  const swapA = fem({ aMm: 1500, bMm: 1000, sigma1Mpa: 1, sigmaYMpa: 0, nx: 15, ny: 10, modes: 1 })
  const swapB = fem({ aMm: 1000, bMm: 1500, sigma1Mpa: 0, sigmaYMpa: 1, nx: 10, ny: 15, modes: 1 })
  const swapLeft = swapA.modes[0]?.sigma1CrMpa
  const swapRight = swapB.modes[0]?.sigmaYCrMpa
  const swapErr = swapLeft != null && swapRight != null ? Math.abs(pct(swapLeft, swapRight)) : Infinity
  rows.push(row({
    id: "D04",
    title: "Biaxial symmetry",
    expected: "Square σx=σy matches the Navier k=2 stress. Swapping σx↔σy with a↔b matches.",
    actual: `equal ${biGot == null ? "—" : biGot.toFixed(2)} vs ${bi ? bi.sigmaXCrMpa.toFixed(2) : "—"} MPa (${Number.isFinite(biErr) ? biErr.toFixed(2) : "—"}%). Swap ${swapLeft?.toFixed(2)} vs ${swapRight?.toFixed(2)} (${swapErr.toFixed(3)}%).`,
    difference: `${Math.max(Math.abs(biErr), swapErr).toFixed(2)}%`,
    tolerance: "2% of the closed form, 0.5% on the swap",
    mesh: "12×12 and 15×10",
    residual: Math.max(biFem.residual, swapA.residual, swapB.residual).toExponential(2),
    basis: "EXACT ANALYTICAL BENCHMARK for uniform σx, σy on four simple supports. SYMMETRY VERIFICATION for the swap. No interaction equation.",
    status: Math.abs(biErr) <= 2 && swapErr <= 0.5 && biFem.residual < 1e-6 ? "pass" : "fail",
  }))

  const ratios = [0, 0.25, 0.5, 0.75, 1]
  const combo: number[] = []
  let comboOk = true
  for (const ratio of ratios) {
    const solved = fem({ sigma1Mpa: 1, tauMpa: ratio, nx: 10, ny: 10, modes: 1 })
    const lambda = solved.modes[0]?.lambda
    if (!solved.ok || lambda == null || solved.residual > 1e-6) comboOk = false
    combo.push(lambda ?? NaN)
  }
  const plus = fem({ sigma1Mpa: 0, tauMpa: 1, nx: 10, ny: 10, modes: 1 })
  const minus = fem({ sigma1Mpa: 0, tauMpa: -1, nx: 10, ny: 10, modes: 1 })
  const plusL = plus.modes[0]?.lambda
  const minusL = minus.modes[0]?.lambda
  const signErr = plusL != null && minusL != null ? Math.abs(pct(Math.abs(minusL), Math.abs(plusL))) : Infinity
  const decreasing = combo.every((value, index) => index === 0 || value < combo[index - 1]! * 1.001)
  rows.push(row({
    id: "D05",
    title: "Combined compression and shear",
    expected: "λ falls as τ/σ rises. +τ and −τ give the same |λ| on a square SS plate.",
    actual: `λ(τ/σ)=${combo.map((value) => value.toFixed(2)).join(", ")}. +τ ${plusL?.toFixed(3)} −τ ${minusL?.toFixed(3)} (${signErr.toFixed(4)}%).`,
    difference: `${signErr.toFixed(4)}% sign`,
    tolerance: "monotonic λ, sign difference under 0.1%. No interaction formula.",
    mesh: "10×10",
    residual: Math.max(plus.residual, minus.residual).toExponential(2),
    basis: "SYMMETRY VERIFICATION. Classical σcr and τcr stay separate. FEM multiplies the whole field by one λ.",
    status: comboOk && decreasing && signErr <= 0.1 ? "pass" : "fail",
  }))

  const bare = fem({ sigma1Mpa: 1, nx: 8, ny: 8, modes: 1 })
  const tiny = fem({
    sigma1Mpa: 1, nx: 8, ny: 8, modes: 1,
    stiffeners: [{ id: "Z", axis: "x", atMm: 500, eiNmm2: 1, gjNmm2: 0, areaMm2: 0, rigid: false }],
  })
  const bareS = bare.modes[0]?.sigma1CrMpa ?? NaN
  const tinyS = tiny.modes[0]?.sigma1CrMpa ?? NaN
  const zeroErr = pct(tinyS, bareS)
  rows.push(row({
    id: "D06",
    title: "Near-zero stiffener",
    expected: "EI = 1 N·mm², GJ = 0, A = 0 stays within 0.5% of the bare plate",
    actual: `bare ${bareS.toFixed(3)} · tiny ${tinyS.toFixed(3)} MPa`,
    difference: `${zeroErr.toFixed(4)}%`,
    tolerance: "0.5%",
    mesh: "8×8",
    residual: Math.max(bare.residual, tiny.residual).toExponential(2),
    basis: "LIMITING-CASE VERIFICATION. EI = 0 is omitted on purpose and is not used as the proof.",
    status: Math.abs(zeroErr) <= 0.5 && tiny.ok ? "pass" : "fail",
  }))

  const eiLevels = [1e4, 1e6, 1e8, 1e10, 1e12, 1e14]
  const eiValues = eiLevels.map((ei) => fem({
    sigma1Mpa: 1, nx: 12, ny: 12, modes: 1,
    stiffeners: [{ id: "L", axis: "x", atMm: 500, eiNmm2: ei, gjNmm2: 0, areaMm2: 0, rigid: false }],
  }).modes[0]?.sigma1CrMpa ?? NaN)
  const sub = stressFromK(4, 10, 500)
  const high = eiValues[eiValues.length - 1] ?? NaN
  const highErr = pct(high, sub)
  const mono = eiValues.every((value, index) => index === 0 || value >= eiValues[index - 1]! * 0.98)
  rows.push(row({
    id: "D07",
    title: "Rigid longitudinal stiffener",
    expected: `EI→∞ with GJ=0 approaches the SS half-panel σcr ${sub.toFixed(1)} MPa (b/2, k=4). Not assumed equal at a finite EI.`,
    actual: eiLevels.map((ei, index) => `${ei.toExponential(0)}→${eiValues[index]!.toFixed(1)}`).join(" · "),
    difference: `${highErr.toFixed(2)}% at EI=1e14`,
    tolerance: "monotonic rise, then a plateau. Within 8% of the half-panel Kirchhoff stress is a pass. A larger gap stays limited: one shared rotation is not two independent knife edges, and the mesh is finite.",
    mesh: "12×12, stiffener at y=b/2, A=0 so N=σA is absent",
    residual: "—",
    basis: "LIMITING-CASE VERIFICATION. Half panel α=2, kσ=4, width b/2. GJ is zero. Equivalence to a knife edge is not assumed.",
    status: mono && high > bareS * 2 ? (Math.abs(highErr) <= 8 ? "pass" : "limited") : "fail",
  }))

  const place = (at: number, axis: "x" | "y") => fem({
    aMm: axis === "y" ? 2000 : 1000,
    bMm: 1000,
    sigma1Mpa: 1,
    nx: axis === "y" ? 12 : 10,
    ny: 10,
    modes: 1,
    stiffeners: [{ id: "S", axis, atMm: at, eiNmm2: 1e11, gjNmm2: 0, areaMm2: 0, rigid: false }],
  }).modes[0]?.sigma1CrMpa ?? NaN
  const yPos = [0.1, 0.2, 0.3, 0.4, 0.5].map((f) => ({ f, lo: place(f * 1000, "x"), hi: place((1 - f) * 1000, "x") }))
  const yErr = Math.max(...yPos.map((item) => Math.abs(pct(item.lo, item.hi))))
  const xPos = [0.25, 0.5].map((f) => ({ f, lo: place(f * 2000, "y"), hi: place((1 - f) * 2000, "y") }))
  const xErr = Math.max(...xPos.map((item) => Math.abs(pct(item.lo, item.hi))))
  rows.push(row({
    id: "D08",
    title: "Longitudinal stiffener position symmetry",
    expected: "y/b and 1−y/b agree",
    actual: yPos.map((item) => `${item.f.toFixed(1)} ${item.lo.toFixed(1)}/${item.hi.toFixed(1)}`).join(" · "),
    difference: `${yErr.toFixed(4)}%`,
    tolerance: "0.5%",
    mesh: "10×10",
    residual: "—",
    basis: "SYMMETRY VERIFICATION. Same EI, GJ=0, A=0.",
    status: yErr <= 0.5 ? "pass" : "fail",
  }))
  rows.push(row({
    id: "D09",
    title: "Transverse stiffener position symmetry",
    expected: "x/a = 0.25 matches 0.75 on an α=2 plate",
    actual: xPos.map((item) => `${item.f.toFixed(2)} ${item.lo.toFixed(1)}/${item.hi.toFixed(1)}`).join(" · "),
    difference: `${xErr.toFixed(4)}%`,
    tolerance: "1%",
    mesh: "12×10 on 2000×1000",
    residual: "—",
    basis: "SYMMETRY VERIFICATION.",
    status: xErr <= 1 ? "pass" : "fail",
  }))

  const cross = fem({
    sigma1Mpa: 1, nx: 8, ny: 8, modes: 1,
    stiffeners: [
      { id: "L", axis: "x", atMm: 500, eiNmm2: 1e7, gjNmm2: 0, areaMm2: 0, rigid: false },
      { id: "T", axis: "y", atMm: 500, eiNmm2: 1e7, gjNmm2: 0, areaMm2: 0, rigid: false },
    ],
  })
  const joined = cross.stiffenerNotes.join(" ")
  const connected = /SHOW CONNECTION NODES/.test(joined) && /share plate node/.test(joined)
  rows.push(row({
    id: "D10",
    title: "Stiffener intersection",
    expected: "One shared plate node, w common, bending and twist DOFs named",
    actual: connected ? joined.slice(joined.indexOf("SHOW CONNECTION NODES"), joined.indexOf("SHOW CONNECTION NODES") + 220) : joined.slice(0, 180),
    difference: connected ? "connected" : "missing",
    tolerance: "the note names the node",
    mesh: "8×8, crossing at mid-panel",
    residual: cross.residual.toExponential(2),
    basis: "NUMERICAL SANITY CHECK of connectivity. Not a proof of stiffener design strength.",
    status: cross.ok && connected ? "pass" : "fail",
  }))

  const lengths = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  const forces: number[] = []
  let lengthOk = true
  for (const fraction of lengths) {
    const solved = fem({
      sigma1Mpa: 0, nx: 12, ny: 8, modes: 1,
      patchLoad: { edge: "y1", atMm: 500, lengthMm: fraction * 1000, forceN: 10000 },
    })
    const force = solved.modes[0]?.patchCrN
    if (!solved.ok || force == null || solved.residual > 1e-5) lengthOk = false
    forces.push(force ?? NaN)
  }
  const smooth = forces.every((value, index) => index === 0 || !(value < forces[index - 1]! * 0.98))
  rows.push(row({
    id: "D11",
    title: "Patch length sweep",
    expected: "Fcr rises smoothly as ss/a goes from 0.05 to 1 at constant force magnitude",
    actual: lengths.map((fraction, index) => `${fraction.toFixed(2)}→${forces[index]!.toFixed(0)}`).join(" · "),
    difference: smooth ? "monotonic" : "dip",
    tolerance: "each step at least 98% of the previous Fcr",
    mesh: "12×8, patch on y=b, 10000 N",
    residual: "—",
    basis: "LIMITING-CASE VERIFICATION of the load length. Not a code patch resistance.",
    status: lengthOk && smooth ? "pass" : "fail",
  }))

  const centres = [0.25, 0.35, 0.5]
  const posErrs: number[] = []
  const posBits: string[] = []
  for (const fraction of centres) {
    const left = fem({
      sigma1Mpa: 0, nx: 12, ny: 8, modes: 1,
      patchLoad: { edge: "y1", atMm: fraction * 1000, lengthMm: 200, forceN: 10000 },
    })
    const right = fem({
      sigma1Mpa: 0, nx: 12, ny: 8, modes: 1,
      patchLoad: { edge: "y1", atMm: (1 - fraction) * 1000, lengthMm: 200, forceN: 10000 },
    })
    const a = left.modes[0]?.patchCrN
    const b = right.modes[0]?.patchCrN
    const err = a != null && b != null ? Math.abs(pct(a, b)) : Infinity
    posErrs.push(err)
    posBits.push(`${fraction.toFixed(2)} ${a?.toFixed(0)}/${b?.toFixed(0)}`)
  }
  const posWorst = Math.max(...posErrs)
  rows.push(row({
    id: "D12",
    title: "Patch position symmetry",
    expected: "xp/a and 1−xp/a agree for a 200 mm patch",
    actual: posBits.join(" · "),
    difference: `${posWorst.toFixed(4)}%`,
    tolerance: "1%",
    mesh: "12×8",
    residual: "—",
    basis: "SYMMETRY VERIFICATION.",
    status: posWorst <= 1 ? "pass" : "fail",
  }))

  const equilibrated = fem({
    sigma1Mpa: 0, nx: 10, ny: 8, modes: 1,
    patchLoad: { edge: "y1", atMm: 400, lengthMm: 300, forceN: 8000 },
  })
  const eq = equilibrated.prestressNote
  const eqOk = /Force imbalance 0\.0000%/.test(eq) || /Force imbalance 0\.00/.test(eq)
  const imbalanceMatch = eq.match(/Force imbalance ([0-9.]+)%/)
  const imbalance = imbalanceMatch ? Number(imbalanceMatch[1]) : Infinity
  rows.push(row({
    id: "D13",
    title: "Patch force equilibrium",
    expected: "Applied Fx, Fy and Reaction Fx, Fy balance. Moment about the centre is reported.",
    actual: eq.includes("Applied Fx") ? eq.slice(eq.indexOf("Applied Fx")) : equilibrated.reason,
    difference: `${Number.isFinite(imbalance) ? imbalance.toFixed(4) : "—"}%`,
    tolerance: "force imbalance under 0.05%",
    mesh: "10×8",
    residual: equilibrated.residual.toExponential(2),
    basis: "EQUILIBRIUM VERIFICATION. Reactions come from ∫ Bᵀσ on the restrained DOFs, not from reversing the applied force by hand.",
    status: equilibrated.ok && imbalance < 0.05 ? "pass" : "fail",
  }))

  const sym = fem({ sigma1Mpa: 1, psi: -1, nx: 12, ny: 8, modes: 1 })
  const rel = sym.symmetryNote.match(/relative ([0-9]+(?:\.[0-9]+)?(?:e[+-]?\d+)?)/i)
  const relN = rel ? Number(rel[1]) : Infinity
  rows.push(row({
    id: "D14",
    title: "K and Kg symmetry",
    expected: "Element off-diagonal mismatch far below 1e-8 relative",
    actual: sym.symmetryNote,
    difference: Number.isFinite(relN) ? relN.toExponential(2) : "—",
    tolerance: "relative mismatch < 1e-8",
    mesh: "12×8 pure bending",
    residual: sym.residual.toExponential(2),
    basis: "NUMERICAL SANITY CHECK. Band storage keeps the lower triangle, so the solve uses a symmetric operator.",
    status: sym.ok && relN < 1e-8 && sym.residual < 1e-6 ? "pass" : "fail",
  }))

  const fixed = fem({ sigma1Mpa: 1, edges: FIXED, nx: 8, ny: 8, modes: 1 })
  const outstand = fem({ aMm: 2000, bMm: 400, sigma1Mpa: 1, edges: OUT, nx: 12, ny: 8, modes: 1 })
  const outTheory = classicalPlate({
    aMm: 2000, bMm: 400, tMm: 10, eMpa: 210000, nu: 0.3, fyMpa: 350, fuMpa: 450,
    sigma1Mpa: 1, psi: 1, tauMpa: 0, edges: OUT,
  })
  const outGot = outstand.modes[0]?.sigma1CrMpa
  const outErr = outGot != null && outTheory.sigmaCrMpa != null ? pct(outGot, outTheory.sigmaCrMpa) : Infinity
  const fixedS = fixed.modes[0]?.sigma1CrMpa ?? 0
  rows.push(row({
    id: "D15",
    title: "Boundary-condition spot check",
    expected: "Fixed edges above SS. Outstand FEM within 15% of the approximate k=0.425+(b/a)² formula.",
    actual: `SS ${bareS.toFixed(1)} · fixed ${fixedS.toFixed(1)} · outstand ${outGot == null ? "—" : outGot.toFixed(1)} vs approx ${outTheory.sigmaCrMpa?.toFixed(1)} (${Number.isFinite(outErr) ? outErr.toFixed(1) : "—"}%)`,
    difference: `${Number.isFinite(outErr) ? outErr.toFixed(1) : "—"}% vs the outstand approximation`,
    tolerance: "fixed > SS. Outstand within 15% of an approximation.",
    mesh: "8×8 and 12×8",
    residual: Math.max(fixed.residual, outstand.residual).toExponential(2),
    basis: "LIMITING-CASE VERIFICATION. The outstand coefficient is approximate. Clamped-edge k is not invented.",
    status: fixed.ok && fixedS > bareS * 1.3 && Math.abs(outErr) <= 15 ? "limited" : "fail",
  }))

  const freePlate = fem({ sigma1Mpa: 1, edges: { x0: "free", x1: "free", y0: "free", y1: "free" }, nx: 4, ny: 4, modes: 1 })
  rows.push(row({
    id: "D16",
    title: "Rigid-body restraint",
    expected: "A plate with every edge free does not return a buckling eigenvalue",
    actual: freePlate.ok ? "solved" : freePlate.reason,
    difference: "—",
    tolerance: "singular K is refused",
    mesh: "4×4",
    residual: "—",
    basis: "NUMERICAL SANITY CHECK. No rigid-body mode is reported as a buckle.",
    status: freePlate.ok ? "fail" : "pass",
  }))

  const beside = (atMm: number) => fem({
    sigma1Mpa: 0, nx: 12, ny: 8, modes: 1,
    patchLoad: { edge: "y1", atMm, lengthMm: 200, forceN: 10000 },
    stiffeners: [{ id: "T", axis: "y", atMm: 500, eiNmm2: 1e11, gjNmm2: 0, areaMm2: 0, rigid: false }],
  })
  const before = beside(200)
  const aligned = beside(500)
  const after = beside(800)
  const fOf = (solved: FemResult) => solved.modes[0]?.patchCrN
  const patchStiffOk = before.ok && aligned.ok && after.ok
    && before.residual < 1e-6 && aligned.residual < 1e-6 && after.residual < 1e-6
  const mirror = fOf(before) != null && fOf(after) != null ? Math.abs(pct(fOf(before)!, fOf(after)!)) : Infinity
  rows.push(row({
    id: "D17",
    title: "Patch beside a transverse stiffener",
    expected: "Three elastic solves. A patch mirrored about the stiffener matches. No code resistance.",
    actual: `x=200 ${fOf(before)?.toFixed(0) ?? "—"} N · on stiffener x=500 ${fOf(aligned)?.toFixed(0) ?? "—"} N · x=800 ${fOf(after)?.toFixed(0) ?? "—"} N`,
    difference: `${Number.isFinite(mirror) ? mirror.toFixed(3) : "—"}% mirror`,
    tolerance: "mirror under 1%, all three residual < 1e-6",
    mesh: "12×8, EI=1e11 transverse stiffener at mid-length",
    residual: Math.max(before.residual, aligned.residual, after.residual).toExponential(2),
    basis: "SYMMETRY VERIFICATION plus a limiting-case observation. There is no analytical patch-plus-stiffener target. Not a code patch resistance.",
    status: patchStiffOk && mirror <= 1 ? "limited" : "fail",
  }))

  return rows
}
