/** Stiffener cross-sections. Second moments are about the plate mid-surface. Not a code rigidity check. */

export const STEEL_DENSITY_KG_M3 = 7850

export type SectionKind = "flat" | "plate" | "angle" | "tee" | "custom"

export type StiffenerInput = {
  id: string
  axis: "x" | "y"
  atMm: number
  kind: SectionKind
  /** Outstand height measured from the plate face, mm. */
  hMm: number
  twMm: number
  bfMm: number
  tfMm: number
  eMpa: number
  fyMpa: number
  customA?: number
  customI?: number
  customJ?: number
  rigid: boolean
}

export type StiffenerProps = {
  areaMm2: number
  iMm4: number
  jMm4: number
  eaN: number
  eiNmm2: number
  gjNmm2: number
  centroidFromFaceMm: number
  note: string
}

export function newStiffener(partial: Partial<StiffenerInput> & Pick<StiffenerInput, "id" | "axis" | "atMm">): StiffenerInput {
  return {
    id: partial.id,
    axis: partial.axis,
    atMm: partial.atMm,
    kind: partial.kind ?? "flat",
    hMm: partial.hMm ?? 80,
    twMm: partial.twMm ?? 8,
    bfMm: partial.bfMm ?? 80,
    tfMm: partial.tfMm ?? 8,
    eMpa: partial.eMpa ?? 210000,
    fyMpa: partial.fyMpa ?? 350,
    customA: partial.customA,
    customI: partial.customI,
    customJ: partial.customJ,
    rigid: partial.rigid ?? false,
  }
}

function torsionRect(length: number, thickness: number): number {
  const a = Math.max(length, thickness)
  const b = Math.min(length, thickness)
  if (!(a > 0) || !(b > 0)) return 0
  return a * b ** 3 * (1 / 3 - 0.21 * (b / a) * (1 - b ** 4 / (12 * a ** 4)))
}

function rectAboutZero(z0: number, z1: number, width: number): { area: number; i: number; centroid: number } {
  const h = z1 - z0
  const area = width * h
  const centroid = 0.5 * (z0 + z1)
  const i = (width * h ** 3) / 12 + area * centroid * centroid
  return { area, i, centroid }
}

export function stiffenerProps(input: StiffenerInput, plateTmm: number): StiffenerProps {
  const fail = (note: string): StiffenerProps => ({
    areaMm2: 0,
    iMm4: 0,
    jMm4: 0,
    eaN: 0,
    eiNmm2: 0,
    gjNmm2: 0,
    centroidFromFaceMm: 0,
    note,
  })
  if (!(input.eMpa > 0)) return fail("Stiffener E must be positive.")
  if (input.kind === "custom") {
    const area = input.customA ?? 0
    const i = input.customI ?? 0
    const j = input.customJ ?? 0
    if (!(area > 0) || !(i > 0) || !(j >= 0)) return fail("Custom stiffener needs A > 0 and I > 0 about the plate mid-surface.")
    const g = input.eMpa / (2 * (1 + 0.3))
    return {
      areaMm2: area,
      iMm4: i,
      jMm4: j,
      eaN: input.eMpa * area,
      eiNmm2: input.eMpa * i,
      gjNmm2: g * j,
      centroidFromFaceMm: 0,
      note: "Custom A, I and J are used as entered. I is about the plate mid-surface. G = E / 2.6.",
    }
  }
  if (!(input.hMm > 0) || !(input.twMm > 0)) return fail("Stiffener height and thickness must be positive.")
  const zFace = plateTmm > 0 ? plateTmm / 2 : 0
  const zTip = zFace + input.hMm
  let area = 0
  let moment = 0
  let i = 0
  let j = 0
  const add = (z0: number, z1: number, width: number) => {
    if (!(width > 0) || !(z1 > z0)) return
    const piece = rectAboutZero(z0, z1, width)
    area += piece.area
    moment += piece.area * piece.centroid
    i += piece.i
    j += torsionRect(z1 - z0, width)
  }
  if (input.kind === "flat" || input.kind === "plate") {
    add(zFace, zTip, input.twMm)
  } else if (input.kind === "angle" || input.kind === "tee") {
    if (!(input.bfMm > 0) || !(input.tfMm > 0)) return fail("Angle and tee stiffeners need a flange width and thickness.")
    const zFlange0 = Math.max(zFace, zTip - input.tfMm)
    add(zFace, zFlange0, input.twMm)
    add(zFlange0, zTip, input.bfMm)
  } else {
    return fail("Unknown stiffener section.")
  }
  if (!(area > 0) || !(i > 0)) return fail("Stiffener area or second moment is not positive.")
  const g = input.eMpa / (2 * (1 + 0.3))
  const note = input.kind === "flat" || input.kind === "plate"
    ? "Rectangular outstand. I = ∫ z² dA about the plate mid-surface. J is Saint-Venant torsion, not warping torsion. G uses ν = 0.3."
    : "Web plus tip flange. The flange width is the full entered width and the web stops at the flange. I is about the plate mid-surface. Warping torsion is not included. G uses ν = 0.3."
  return {
    areaMm2: area,
    iMm4: i,
    jMm4: j,
    eaN: input.eMpa * area,
    eiNmm2: input.eMpa * i,
    gjNmm2: g * j,
    centroidFromFaceMm: moment / area - zFace,
    note,
  }
}

export function stiffenerMassKg(areaMm2: number, lengthMm: number): number {
  if (!(areaMm2 > 0) || !(lengthMm > 0)) return 0
  return areaMm2 * lengthMm * STEEL_DENSITY_KG_M3 * 1e-9
}

export function plateMassKg(aMm: number, bMm: number, tMm: number): number {
  if (!(aMm > 0) || !(bMm > 0) || !(tMm > 0)) return 0
  return aMm * bMm * tMm * STEEL_DENSITY_KG_M3 * 1e-9
}
