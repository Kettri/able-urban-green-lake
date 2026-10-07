import { sameDim } from "./dimensions.ts"
import { categoryById, unitById, type UnitDef } from "./definitions.ts"

export class ConvertError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ConvertError"
  }
}

export function quantityName(unit: UnitDef): string {
  return categoryById(unit.category)?.label ?? unit.kind
}

export function incompatibility(from: UnitDef, to: UnitDef): string | null {
  if (from.id === to.id) return null
  if (from.kind === to.kind && sameDim(from.dim, to.dim)) return null
  if (sameDim(from.dim, to.dim) && from.kind !== to.kind) {
    return `Same base dimension but different engineering quantities: ${quantityName(from)} cannot be converted to ${quantityName(to)}.`
  }
  if (from.kind === "mass" && to.kind === "force") {
    return "Mass and force are different quantities. Converting mass to weight requires gravitational acceleration."
  }
  if (from.kind === "force" && to.kind === "mass") {
    return "Force and mass are different quantities. Converting weight to mass requires gravitational acceleration."
  }
  if (
    (from.kind === "force" && to.kind === "stress") ||
    (from.kind === "stress" && to.kind === "force")
  ) {
    return "Incompatible dimensions: Force cannot be directly converted to Stress."
  }
  if (from.kind === "temperature" && to.kind === "delta-t") {
    return "Absolute temperature and a temperature difference are different conversions. Use Temperature difference for ΔT."
  }
  return `Incompatible dimensions: ${quantityName(from)} cannot be directly converted to ${quantityName(to)}.`
}

export function toSI(value: number, unit: UnitDef): number {
  return value * unit.scale + unit.offset
}

export function fromSI(si: number, unit: UnitDef): number {
  return (si - unit.offset) / unit.scale
}

export function convert(value: number, fromId: string, toId: string): number {
  if (!Number.isFinite(value)) throw new ConvertError("Invalid number.")
  const from = unitById(fromId)
  const to = unitById(toId)
  if (!from || !to) throw new ConvertError("Unknown unit.")
  const why = incompatibility(from, to)
  if (why) throw new ConvertError(why)
  const si = toSI(value, from)
  if (from.kind === "temperature" && si < -1e-9) {
    throw new ConvertError("Absolute temperature below 0 K is invalid.")
  }
  return fromSI(si, to)
}

export function convertAcross(value: number, from: UnitDef, to: UnitDef): number {
  return convert(value, from.id, to.id)
}
