/** Frozen elastic plate engine. Design-code work must not change this without re-running the elastic suite. */

export const ELASTIC_ENGINE = {
  id: "IQ-PLB-E1.0",
  date: "2026-10-07",
  solver: "Reorthogonalised Lanczos on L⁻¹ Kg L⁻ᵀ, then a Rayleigh quotient. Positive λ only in the production modes.",
  element: "Mindlin bilinear quad. 2×2 bending and geometric stiffness, 1-point shear, ks = 5/6.",
  stiffener: "Euler–Bernoulli Hermitian beam on EI and GJ. Beam Kg uses N = σA. Edge lines are not assembled.",
  patch: "Bilinear plane-stress quad, 2×2. Opposite edge normally fixed. λ multiplies the recovered field.",
  suite: "V01–V20 quick, D01–D17 full, shear series orders 4–16, proportioned shear meshes through 32 and α=4 at 80×20, S01–S05 and P01–P06 through 32 with MAC.",
  limitations: [
    "Linear eigenvalue only. Not GMNIA and not a code resistance.",
    "Mindlin shear makes a thick plate softer than Kirchhoff. The gap is reported, not tuned away.",
    "Navier shear series is a Kirchhoff energy upper bound. The Timoshenko kτ fit is separate.",
    "A rigid beam shares one rotation. That is not two independent simple supports.",
    "Very large GJ can switch the governing mode. That plateau is not a closed-form subpanel.",
    "Structured quad mesh only. No skewed-element distortion test.",
    "Out-of-plane eccentricity, point forces and non-uniform patch distributions are not implemented.",
    "α = 4 shear and the off-centre patch are still moving on the finest mesh run here.",
  ],
} as const

export function engineLine(): string {
  return `ELASTIC ENGINE ${ELASTIC_ENGINE.id} (${ELASTIC_ENGINE.date}). ${ELASTIC_ENGINE.solver}`
}
