export type ModuleStatus = "live" | "later"

export type LabModule = {
  id: string
  title: string
  summary: string
  group: string
  status: ModuleStatus
  href?: string
}

/** Future rows are a library map only. They are not calculators. */
export const LAB_MODULES: LabModule[] = [
  { id: "IQ-CAL-PLB", title: "Plate and web buckling", summary: "Elastic critical stress, half-wave search, and a separate finite-element eigenvalue check. Code resistance is not enabled.", group: "Plate", status: "live", href: "/plate" },
  { id: "IQ-REF-014", title: "Thread reference", summary: "Stand-alone thread tables beyond the bolt record.", group: "Fasteners", status: "later" },
  { id: "IQ-REF-017", title: "Fastener tightening", summary: "Torque, preload and k-factor.", group: "Fasteners", status: "later" },
  { id: "IQ-REF-002", title: "Universal unit converter", summary: "Type one value. The rest of that quantity converts. A mismatched dimension is refused.", group: "Desk", status: "live", href: "/units" },
  { id: "IQ-REF-012", title: "Engineering constants", summary: "g, π, E, densities used as named constants.", group: "Desk", status: "later" },
  { id: "IQ-REF-003", title: "Steel material properties", summary: "Plate and section grades.", group: "Materials", status: "later" },
  { id: "IQ-REF-018", title: "Material density", summary: "Density database.", group: "Materials", status: "later" },
  { id: "IQ-REF-004", title: "Structural steel sections", summary: "Catalogue properties.", group: "Section", status: "later" },
  { id: "IQ-REF-016", title: "Standard plate sizes", summary: "Sheet and plate list.", group: "Section", status: "later" },
  { id: "IQ-REF-005", title: "Weld reference", summary: "Fillet and butt geometry.", group: "Connection", status: "later" },
  { id: "IQ-REF-006", title: "Pipe schedules", summary: "NPS and DN wall.", group: "Plant", status: "later" },
  { id: "IQ-REF-007", title: "Flange reference", summary: "Facing and drilling.", group: "Plant", status: "later" },
  { id: "IQ-REF-008", title: "Bearings", summary: "Boundary dimensions.", group: "Machine", status: "later" },
  { id: "IQ-REF-009", title: "Shaft and key", summary: "Key seats and fits.", group: "Machine", status: "later" },
  { id: "IQ-REF-010", title: "Springs", summary: "Wire and rate.", group: "Machine", status: "later" },
  { id: "IQ-REF-011", title: "Crane components", summary: "Wheels, rails, hooks.", group: "Plant", status: "later" },
  { id: "IQ-REF-013", title: "Wire rope", summary: "Construction and mass.", group: "Plant", status: "later" },
  { id: "IQ-REF-015", title: "Tolerances and fits", summary: "Hole basis classes.", group: "Machine", status: "later" },
  { id: "IQ-REF-019", title: "Surface finish", summary: "Ra and process.", group: "Machine", status: "later" },
  { id: "IQ-REF-020", title: "Fluid properties", summary: "Density and viscosity.", group: "Plant", status: "later" },
]

export type RouteHit =
  | { module: "bolts"; q: string }
  | { module: "units"; q: string }
  | { module: "plate"; q: string }
  | { module: null }
