export type PipeFamily = "NPT" | "BSPT" | "BSPP"

export type PipeThread = {
  id: string
  family: PipeFamily
  nominal: string
  tpi: number
  angleDeg: number
  tapered: boolean
  taper: string
  externalName: string
  internalName: string
  seal: string
  standard: string
}

const BSP_TPI: { nominal: string; tpi: number }[] = [
  { nominal: "1/8", tpi: 28 },
  { nominal: "1/4", tpi: 19 },
  { nominal: "3/8", tpi: 19 },
  { nominal: "1/2", tpi: 14 },
  { nominal: "3/4", tpi: 14 },
  { nominal: "1", tpi: 11 },
  { nominal: "1-1/4", tpi: 11 },
  { nominal: "1-1/2", tpi: 11 },
  { nominal: "2", tpi: 11 },
]

const NPT_TPI: { nominal: string; tpi: number }[] = [
  { nominal: "1/8", tpi: 27 },
  { nominal: "1/4", tpi: 18 },
  { nominal: "3/8", tpi: 18 },
  { nominal: "1/2", tpi: 14 },
  { nominal: "3/4", tpi: 14 },
  { nominal: "1", tpi: 11.5 },
  { nominal: "1-1/4", tpi: 11.5 },
  { nominal: "1-1/2", tpi: 11.5 },
  { nominal: "2", tpi: 11.5 },
]

function bsp(family: "BSPT" | "BSPP"): PipeThread[] {
  const tapered = family === "BSPT"
  return BSP_TPI.map((row) => ({
    id: `${family}-${row.nominal}`,
    family,
    nominal: row.nominal,
    tpi: row.tpi,
    angleDeg: 55,
    tapered,
    taper: tapered ? "1:16 on diameter" : "parallel — no taper",
    externalName: tapered ? "R" : "G",
    internalName: tapered ? "Rc taper, or Rp if the internal thread is parallel" : "G",
    seal: tapered ? "On the threads, usually with sealant" : "Not on the threads. A washer, O-ring or face seal",
    standard: tapered ? "ISO 7-1" : "ISO 228-1",
  }))
}

export const PIPE_THREADS: PipeThread[] = [
  ...NPT_TPI.map((row) => ({
    id: `NPT-${row.nominal}`,
    family: "NPT" as const,
    nominal: row.nominal,
    tpi: row.tpi,
    angleDeg: 60,
    tapered: true,
    taper: "1:16 on diameter",
    externalName: "NPT external",
    internalName: "NPT internal",
    seal: "On the threads, usually with sealant",
    standard: "ASME B1.20.1",
  })),
  ...bsp("BSPT"),
  ...bsp("BSPP"),
]

export const PIPE_WARNING =
  "NPT, BSPT and BSPP are not the same thread. A matching nominal size is not enough. NPT is 60° and tapered. BSPT is 55° and tapered. BSPP (G) is 55° and parallel and does not seal on the thread. Gauge-plane diameters and pipe tap drills are not in this dataset."
