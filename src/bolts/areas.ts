import { threadProfile, type ThreadProfile } from "./threadGeometry.ts"

export type AreaSet = ThreadProfile & {
  /** Shear area used when the plane passes through the unthreaded shank. */
  shearShank: number
  /** Shear area used by the implemented AS 4100 method when the plane cuts the thread. */
  shearThread: number
}

export function areas(d: number, P: number): AreaSet {
  const profile = threadProfile(d, P)
  return {
    ...profile,
    shearShank: profile.Ao,
    shearThread: profile.As,
  }
}

export const AREA_NOTE =
  "Shank shear uses the nominal area Ao = πd²/4. Thread shear in the AS 4100 check uses tensile stress area As, matching IQ-CAL-002. The basic minor area Ar is shown as geometry and is not substituted for As. Some readings of AS 4100 use a core area instead — confirm the edition you are designing to."
