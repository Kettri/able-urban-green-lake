import { dim, type Dim } from "./dimensions.ts"

export type UnitDef = {
  id: string
  symbol: string
  name: string
  category: string
  kind: string
  dim: Dim
  /** SI = value * scale + offset. Offset is only for absolute temperature. */
  scale: number
  offset: number
  aliases: string[]
}

export type Category = {
  id: string
  label: string
  group: string
  kind: string
  blurb: string
}

const IN = 0.0254
const FT = 0.3048
const LB = 0.45359237
const LBF = 4.4482216152605
const G0 = 9.80665
const BTU = 1055.05585262
const GAL_US = 231 * IN ** 3
const GAL_IMP = 0.00454609

export const CATEGORIES: Category[] = [
  { id: "length", label: "Length", group: "Geometry", kind: "length", blurb: "Linear measure." },
  { id: "area", label: "Area", group: "Geometry", kind: "area", blurb: "Surface measure." },
  { id: "volume", label: "Volume", group: "Geometry", kind: "volume", blurb: "Capacity. US and Imperial gallons are separate." },
  { id: "section-modulus", label: "Section modulus", group: "Section", kind: "section-modulus", blurb: "Elastic section modulus. Not volume, even though both are length³." },
  { id: "area-inertia", label: "Area moment of inertia", group: "Section", kind: "area-inertia", blurb: "Second moment of area. Not mass moment of inertia." },
  { id: "radius", label: "Radius of gyration", group: "Section", kind: "length", blurb: "Length. Kept as its own desk so it is not mixed with member length by habit." },
  { id: "mass-inertia", label: "Mass moment of inertia", group: "Section", kind: "mass-inertia", blurb: "Rotational inertia of mass. Not Ixx of a section." },
  { id: "mass", label: "Mass", group: "Mechanics", kind: "mass", blurb: "Mass. Not weight." },
  { id: "mass-length", label: "Mass per length", group: "Mechanics", kind: "mass-length", blurb: "Linear density of sections, rope, rail." },
  { id: "force", label: "Force", group: "Mechanics", kind: "force", blurb: "Force, including kilogram-force and tonne-force." },
  { id: "moment", label: "Moment / torque", group: "Mechanics", kind: "moment", blurb: "Moment and torque share this dimension." },
  { id: "pressure", label: "Pressure / stress", group: "Mechanics", kind: "stress", blurb: "Pressure and stress. N/mm² is exactly 1 MPa." },
  { id: "stress", label: "Stress / modulus", group: "Mechanics", kind: "stress", blurb: "The same dimension as pressure, shorter structural set." },
  { id: "area-load", label: "Area load", group: "Mechanics", kind: "stress", blurb: "Force per area, including psf." },
  { id: "line-load", label: "Linear load", group: "Mechanics", kind: "line-load", blurb: "Force per length. 1 kN/m = 1 N/mm." },
  { id: "density", label: "Density", group: "Mechanics", kind: "density", blurb: "Mass density." },
  { id: "velocity", label: "Velocity", group: "Motion", kind: "velocity", blurb: "Linear speed." },
  { id: "acceleration", label: "Acceleration", group: "Motion", kind: "acceleration", blurb: "Includes standard gravity g = 9.80665 m/s²." },
  { id: "angular", label: "Angular velocity", group: "Motion", kind: "angular", blurb: "1 rpm = 2π/60 rad/s. Not a conversion to hertz." },
  { id: "frequency", label: "Frequency", group: "Motion", kind: "frequency", blurb: "Cyclic frequency. rpm is under angular velocity." },
  { id: "vol-flow", label: "Volumetric flow", group: "Flow", kind: "vol-flow", blurb: "US and Imperial GPM are separate." },
  { id: "mass-flow", label: "Mass flow", group: "Flow", kind: "mass-flow", blurb: "Mass per time." },
  { id: "dyn-visc", label: "Dynamic viscosity", group: "Flow", kind: "dyn-visc", blurb: "1 cP = 1 mPa·s." },
  { id: "kin-visc", label: "Kinematic viscosity", group: "Flow", kind: "kin-visc", blurb: "1 cSt = 1 mm²/s." },
  { id: "energy", label: "Energy", group: "Thermal", kind: "energy", blurb: "Work and heat." },
  { id: "power", label: "Power", group: "Thermal", kind: "power", blurb: "Mechanical horsepower and metric horsepower are separate." },
  { id: "temperature", label: "Temperature", group: "Thermal", kind: "temperature", blurb: "Absolute temperature. Offsets are applied. Not a temperature difference." },
  { id: "delta-t", label: "Temperature difference", group: "Thermal", kind: "delta-t", blurb: "ΔT only. 1 Δ°C = 1 K. Not an absolute temperature." },
  { id: "conductivity", label: "Thermal conductivity", group: "Thermal", kind: "conductivity", blurb: "Per kelvin and per degree Celsius are the same interval." },
  { id: "heat-flux", label: "Heat flux", group: "Thermal", kind: "heat-flux", blurb: "Power per area." },
  { id: "specific-heat", label: "Specific heat", group: "Thermal", kind: "specific-heat", blurb: "Per mass per temperature interval." },
  { id: "htc", label: "Heat transfer coefficient", group: "Thermal", kind: "htc", blurb: "Surface coefficient." },
  { id: "expansion", label: "Thermal expansion", group: "Thermal", kind: "expansion", blurb: "Linear expansion coefficient." },
  { id: "surface", label: "Surface tension", group: "Thermal", kind: "surface", blurb: "Force per length. Not a structural line load." },
  { id: "voltage", label: "Voltage", group: "Electrical", kind: "voltage", blurb: "Electric potential. Not convertible to current or resistance." },
  { id: "current", label: "Current", group: "Electrical", kind: "current", blurb: "Electric current." },
  { id: "resistance", label: "Resistance", group: "Electrical", kind: "resistance", blurb: "Not conductance. Invert in a circuit calculation, not here." },
  { id: "conductance", label: "Conductance", group: "Electrical", kind: "conductance", blurb: "Siemens. Not a resistance conversion." },
  { id: "capacitance", label: "Capacitance", group: "Electrical", kind: "capacitance", blurb: "Farad." },
  { id: "inductance", label: "Inductance", group: "Electrical", kind: "inductance", blurb: "Henry." },
  { id: "charge", label: "Charge", group: "Electrical", kind: "charge", blurb: "Coulomb. Bare “C” in the search bar is read as °C." },
]

function add(
  list: UnitDef[],
  id: string,
  symbol: string,
  name: string,
  category: string,
  kind: string,
  d: Dim,
  scale: number,
  aliases: string[],
  offset = 0,
) {
  list.push({ id, symbol, name, category, kind, dim: d, scale, offset, aliases: [symbol, id, ...aliases] })
}

function build(): UnitDef[] {
  const u: UnitDef[] = []
  const L = dim({ L: 1 })
  add(u, "nm", "nm", "nanometre", "length", "length", L, 1e-9, ["nanometer", "nanometre"])
  add(u, "um", "µm", "micrometre", "length", "length", L, 1e-6, ["μm", "um", "micron", "micrometre", "micrometer"])
  add(u, "mm", "mm", "millimetre", "length", "length", L, 1e-3, ["millimetre", "millimeter"])
  add(u, "cm", "cm", "centimetre", "length", "length", L, 1e-2, ["centimetre", "centimeter"])
  add(u, "m", "m", "metre", "length", "length", L, 1, ["metre", "meter"])
  add(u, "km", "km", "kilometre", "length", "length", L, 1e3, ["kilometre", "kilometer"])
  add(u, "in", "in", "inch", "length", "length", L, IN, ["inch", "inches", '"'])
  add(u, "ft", "ft", "foot", "length", "length", L, FT, ["foot", "feet", "ft"])
  add(u, "yd", "yd", "yard", "length", "length", L, 0.9144, ["yard", "yards"])
  add(u, "mi", "mi", "mile", "length", "length", L, 1609.344, ["mile", "miles"])

  add(u, "mm-r", "mm", "millimetre", "radius", "length", L, 1e-3, [])
  add(u, "cm-r", "cm", "centimetre", "radius", "length", L, 1e-2, [])
  add(u, "m-r", "m", "metre", "radius", "length", L, 1, [])
  add(u, "in-r", "in", "inch", "radius", "length", L, IN, [])

  const A = dim({ L: 2 })
  add(u, "mm2", "mm²", "square millimetre", "area", "area", A, 1e-6, ["mm2", "mm^2"])
  add(u, "cm2", "cm²", "square centimetre", "area", "area", A, 1e-4, ["cm2", "cm^2"])
  add(u, "m2", "m²", "square metre", "area", "area", A, 1, ["m2", "m^2"])
  add(u, "in2", "in²", "square inch", "area", "area", A, IN ** 2, ["in2", "in^2"])
  add(u, "ft2", "ft²", "square foot", "area", "area", A, FT ** 2, ["ft2", "ft^2"])

  const V = dim({ L: 3 })
  add(u, "mm3", "mm³", "cubic millimetre", "volume", "volume", V, 1e-9, ["mm3", "mm^3"])
  add(u, "cm3", "cm³", "cubic centimetre", "volume", "volume", V, 1e-6, ["cm3", "cm^3"])
  add(u, "m3", "m³", "cubic metre", "volume", "volume", V, 1, ["m3", "m^3"])
  add(u, "mL", "mL", "millilitre", "volume", "volume", V, 1e-6, ["ml", "millilitre", "milliliter"])
  add(u, "L", "L", "litre", "volume", "volume", V, 1e-3, ["l", "litre", "liter"])
  add(u, "in3", "in³", "cubic inch", "volume", "volume", V, IN ** 3, ["in3", "in^3"])
  add(u, "ft3", "ft³", "cubic foot", "volume", "volume", V, FT ** 3, ["ft3", "ft^3"])
  add(u, "gal-us", "gal US", "US gallon", "volume", "volume", V, GAL_US, ["gal", "gallon", "usgal", "gal-us"])
  add(u, "gal-imp", "gal Imp", "Imperial gallon", "volume", "volume", V, GAL_IMP, ["galimp", "ukgal", "gal-imp", "imp gal"])

  add(u, "mm3-s", "mm³", "cubic millimetre", "section-modulus", "section-modulus", V, 1e-9, [])
  add(u, "cm3-s", "cm³", "cubic centimetre", "section-modulus", "section-modulus", V, 1e-6, [])
  add(u, "m3-s", "m³", "cubic metre", "section-modulus", "section-modulus", V, 1, [])
  add(u, "in3-s", "in³", "cubic inch", "section-modulus", "section-modulus", V, IN ** 3, [])
  add(u, "ft3-s", "ft³", "cubic foot", "section-modulus", "section-modulus", V, FT ** 3, [])

  const I4 = dim({ L: 4 })
  add(u, "mm4", "mm⁴", "millimetre to the fourth", "area-inertia", "area-inertia", I4, 1e-12, ["mm4", "mm^4"])
  add(u, "cm4", "cm⁴", "centimetre to the fourth", "area-inertia", "area-inertia", I4, 1e-8, ["cm4", "cm^4"])
  add(u, "m4", "m⁴", "metre to the fourth", "area-inertia", "area-inertia", I4, 1, ["m4", "m^4"])
  add(u, "in4", "in⁴", "inch to the fourth", "area-inertia", "area-inertia", I4, IN ** 4, ["in4", "in^4"])
  add(u, "ft4", "ft⁴", "foot to the fourth", "area-inertia", "area-inertia", I4, FT ** 4, ["ft4", "ft^4"])

  const MI = dim({ M: 1, L: 2 })
  add(u, "kgm2", "kg·m²", "kilogram square metre", "mass-inertia", "mass-inertia", MI, 1, ["kgm2", "kg·m2"])
  add(u, "kgmm2", "kg·mm²", "kilogram square millimetre", "mass-inertia", "mass-inertia", MI, 1e-6, ["kgmm2"])
  add(u, "lbft2", "lb·ft²", "pound square foot", "mass-inertia", "mass-inertia", MI, LB * FT ** 2, ["lbft2"])
  add(u, "lbin2", "lb·in²", "pound square inch", "mass-inertia", "mass-inertia", MI, LB * IN ** 2, ["lbin2"])

  const M = dim({ M: 1 })
  add(u, "mg", "mg", "milligram", "mass", "mass", M, 1e-6, ["milligram"])
  add(u, "g", "g", "gram", "mass", "mass", M, 1e-3, ["gram"])
  add(u, "kg", "kg", "kilogram", "mass", "mass", M, 1, ["kilogram"])
  add(u, "t", "t", "tonne", "mass", "mass", M, 1e3, ["tonne", "metric ton"])
  add(u, "oz", "oz", "ounce", "mass", "mass", M, 0.028349523125, ["ounce"])
  add(u, "lb", "lb", "pound", "mass", "mass", M, LB, ["pound", "lbs"])
  add(u, "ton-short", "ton short", "short ton", "mass", "mass", M, 907.18474, ["short ton", "us ton", "ton-short"])
  add(u, "ton-long", "ton long", "long ton", "mass", "mass", M, 1016.0469088, ["long ton", "uk ton", "ton-long"])

  const ML = dim({ M: 1, L: -1 })
  add(u, "kg/m", "kg/m", "kilogram per metre", "mass-length", "mass-length", ML, 1, ["kg/m"])
  add(u, "kg/mm", "kg/mm", "kilogram per millimetre", "mass-length", "mass-length", ML, 1e3, ["kg/mm"])
  add(u, "g/m", "g/m", "gram per metre", "mass-length", "mass-length", ML, 1e-3, ["g/m"])
  add(u, "lb/ft", "lb/ft", "pound per foot", "mass-length", "mass-length", ML, LB / FT, ["lb/ft"])

  const F = dim({ M: 1, L: 1, T: -2 })
  add(u, "N", "N", "newton", "force", "force", F, 1, ["newton"])
  add(u, "kN", "kN", "kilonewton", "force", "force", F, 1e3, ["kn", "kilonewton"])
  add(u, "MN", "MN", "meganewton", "force", "force", F, 1e6, ["meganewton"])
  add(u, "lbf", "lbf", "pound-force", "force", "force", F, LBF, ["lbf"])
  add(u, "kip", "kip", "kip", "force", "force", F, 1000 * LBF, ["kip", "kips"])
  add(u, "kgf", "kgf", "kilogram-force", "force", "force", F, G0, ["kgf", "kp"])
  add(u, "tf", "tf", "tonne-force", "force", "force", F, 1000 * G0, ["tf", "tonnef", "tonne-force"])

  const Mo = dim({ M: 1, L: 2, T: -2 })
  add(u, "Nmm", "N·mm", "newton millimetre", "moment", "moment", Mo, 1e-3, ["nmm", "N.mm", "N·mm"])
  add(u, "Nm", "N·m", "newton metre", "moment", "moment", Mo, 1, ["N.m", "N·m", "N-m"])
  add(u, "kNm", "kN·m", "kilonewton metre", "moment", "moment", Mo, 1e3, ["knm", "kN.m", "kN·m"])
  add(u, "kgfm", "kgf·m", "kilogram-force metre", "moment", "moment", Mo, G0, ["kgfm", "kgf.m"])
  add(u, "lbfin", "lbf·in", "pound-force inch", "moment", "moment", Mo, LBF * IN, ["lbfin", "lbf.in", "lbf·in"])
  add(u, "lbfft", "lbf·ft", "pound-force foot", "moment", "moment", Mo, LBF * FT, ["lbfft", "lbf.ft", "lbf·ft"])
  add(u, "kipft", "kip·ft", "kip foot", "moment", "moment", Mo, 1000 * LBF * FT, ["kipft", "kip.ft"])

  const P = dim({ M: 1, L: -1, T: -2 })
  const pressure = (cat: string) => {
    add(u, `${cat}:Pa`, "Pa", "pascal", cat, "stress", P, 1, cat === "pressure" ? ["pa", "pascal"] : [])
    add(u, `${cat}:kPa`, "kPa", "kilopascal", cat, "stress", P, 1e3, cat === "pressure" ? ["kpa"] : [])
    add(u, `${cat}:MPa`, "MPa", "megapascal", cat, "stress", P, 1e6, cat === "pressure" ? ["mpa", "MPa", "MPA"] : [])
    add(u, `${cat}:GPa`, "GPa", "gigapascal", cat, "stress", P, 1e9, cat === "pressure" ? ["gpa"] : [])
    add(u, `${cat}:N/mm2`, "N/mm²", "newton per square millimetre", cat, "stress", P, 1e6, cat === "pressure" ? ["N/mm2", "n/mm2", "N/mm^2"] : [])
  }
  pressure("pressure")
  add(u, "bar", "bar", "bar", "pressure", "stress", P, 1e5, ["bar"])
  add(u, "mbar", "mbar", "millibar", "pressure", "stress", P, 100, ["mbar"])
  add(u, "psi", "psi", "pound per square inch", "pressure", "stress", P, LBF / IN ** 2, ["psi"])
  add(u, "ksi", "ksi", "kip per square inch", "pressure", "stress", P, (1000 * LBF) / IN ** 2, ["ksi"])
  add(u, "atm", "atm", "standard atmosphere", "pressure", "stress", P, 101325, ["atm"])
  add(u, "kgf/cm2", "kgf/cm²", "kilogram-force per square centimetre", "pressure", "stress", P, G0 / 1e-4, ["kgf/cm2", "kg/cm2"])
  add(u, "mmHg", "mmHg", "millimetre of mercury", "pressure", "stress", P, 133.322387415, ["mmhg", "torr"])
  add(u, "inHg", "inHg", "inch of mercury", "pressure", "stress", P, 3386.389, ["inhg"])
  add(u, "mH2O", "mH₂O", "metre of water", "pressure", "stress", P, 1000 * G0, ["mh2o", "mH2O", "m water"])
  add(u, "ftH2O", "ftH₂O", "foot of water", "pressure", "stress", P, 1000 * G0 * FT, ["fth2o", "ftH2O"])

  add(u, "stress:Pa", "Pa", "pascal", "stress", "stress", P, 1, [])
  add(u, "stress:kPa", "kPa", "kilopascal", "stress", "stress", P, 1e3, [])
  add(u, "stress:MPa", "MPa", "megapascal", "stress", "stress", P, 1e6, [])
  add(u, "stress:GPa", "GPa", "gigapascal", "stress", "stress", P, 1e9, [])
  add(u, "stress:psi", "psi", "pound per square inch", "stress", "stress", P, LBF / IN ** 2, [])
  add(u, "stress:ksi", "ksi", "kip per square inch", "stress", "stress", P, (1000 * LBF) / IN ** 2, [])
  add(u, "stress:N/mm2", "N/mm²", "newton per square millimetre", "stress", "stress", P, 1e6, [])

  add(u, "aload:Pa", "Pa", "pascal", "area-load", "stress", P, 1, [])
  add(u, "aload:kPa", "kPa", "kilopascal", "area-load", "stress", P, 1e3, [])
  add(u, "aload:MPa", "MPa", "megapascal", "area-load", "stress", P, 1e6, [])
  add(u, "aload:N/mm2", "N/mm²", "newton per square millimetre", "area-load", "stress", P, 1e6, [])
  add(u, "kN/m2", "kN/m²", "kilonewton per square metre", "area-load", "stress", P, 1e3, ["kn/m2", "kN/m2"])
  add(u, "psf", "psf", "pound per square foot", "area-load", "stress", P, LBF / FT ** 2, ["psf"])
  add(u, "aload:psi", "psi", "pound per square inch", "area-load", "stress", P, LBF / IN ** 2, [])

  const LL = dim({ M: 1, T: -2 })
  add(u, "N/mm", "N/mm", "newton per millimetre", "line-load", "line-load", LL, 1e3, ["N/mm", "n/mm"])
  add(u, "N/m", "N/m", "newton per metre", "line-load", "line-load", LL, 1, ["N/m", "n/m"])
  add(u, "kN/m", "kN/m", "kilonewton per metre", "line-load", "line-load", LL, 1e3, ["kn/m", "kN/m"])
  add(u, "lbf/in", "lbf/in", "pound-force per inch", "line-load", "line-load", LL, LBF / IN, ["lbf/in"])
  add(u, "lbf/ft", "lbf/ft", "pound-force per foot", "line-load", "line-load", LL, LBF / FT, ["lbf/ft"])
  add(u, "kip/ft", "kip/ft", "kip per foot", "line-load", "line-load", LL, (1000 * LBF) / FT, ["kip/ft"])

  const D = dim({ M: 1, L: -3 })
  add(u, "kg/m3", "kg/m³", "kilogram per cubic metre", "density", "density", D, 1, ["kg/m3", "kg/m^3"])
  add(u, "g/cm3", "g/cm³", "gram per cubic centimetre", "density", "density", D, 1e3, ["g/cm3", "g/cm^3", "g/cc"])
  add(u, "kg/L", "kg/L", "kilogram per litre", "density", "density", D, 1e3, ["kg/l", "kg/L"])
  add(u, "lb/ft3", "lb/ft³", "pound per cubic foot", "density", "density", D, LB / FT ** 3, ["lb/ft3", "lb/ft^3"])
  add(u, "lb/in3", "lb/in³", "pound per cubic inch", "density", "density", D, LB / IN ** 3, ["lb/in3"])

  const Vel = dim({ L: 1, T: -1 })
  add(u, "mm/s", "mm/s", "millimetre per second", "velocity", "velocity", Vel, 1e-3, ["mm/s"])
  add(u, "m/s", "m/s", "metre per second", "velocity", "velocity", Vel, 1, ["m/s"])
  add(u, "km/h", "km/h", "kilometre per hour", "velocity", "velocity", Vel, 1000 / 3600, ["km/h", "kph"])
  add(u, "ft/s", "ft/s", "foot per second", "velocity", "velocity", Vel, FT, ["ft/s", "fps"])
  add(u, "ft/min", "ft/min", "foot per minute", "velocity", "velocity", Vel, FT / 60, ["ft/min", "fpm"])
  add(u, "mph", "mph", "mile per hour", "velocity", "velocity", Vel, 1609.344 / 3600, ["mph"])
  add(u, "kn", "kn", "knot", "velocity", "velocity", Vel, 1852 / 3600, ["knot", "knots", "kn"])

  const Acc = dim({ L: 1, T: -2 })
  add(u, "m/s2", "m/s²", "metre per second squared", "acceleration", "acceleration", Acc, 1, ["m/s2", "m/s^2"])
  add(u, "mm/s2", "mm/s²", "millimetre per second squared", "acceleration", "acceleration", Acc, 1e-3, ["mm/s2"])
  add(u, "ft/s2", "ft/s²", "foot per second squared", "acceleration", "acceleration", Acc, FT, ["ft/s2"])
  add(u, "g0", "g", "standard gravity", "acceleration", "acceleration", Acc, G0, ["g", "gee"])

  const Ang = dim({ T: -1 })
  add(u, "rad/s", "rad/s", "radian per second", "angular", "angular", Ang, 1, ["rad/s"])
  add(u, "deg/s", "deg/s", "degree per second", "angular", "angular", Ang, Math.PI / 180, ["deg/s"])
  add(u, "rpm", "rpm", "revolution per minute", "angular", "angular", Ang, (2 * Math.PI) / 60, ["rpm", "RPM", "r/min"])
  add(u, "rps", "rps", "revolution per second", "angular", "angular", Ang, 2 * Math.PI, ["rps"])

  const Hz = dim({ T: -1 })
  add(u, "Hz", "Hz", "hertz", "frequency", "frequency", Hz, 1, ["hz", "hertz"])
  add(u, "kHz", "kHz", "kilohertz", "frequency", "frequency", Hz, 1e3, ["khz"])
  add(u, "MHz", "MHz", "megahertz", "frequency", "frequency", Hz, 1e6, ["mhz"])

  const Q = dim({ L: 3, T: -1 })
  add(u, "m3/s", "m³/s", "cubic metre per second", "vol-flow", "vol-flow", Q, 1, ["m3/s"])
  add(u, "m3/min", "m³/min", "cubic metre per minute", "vol-flow", "vol-flow", Q, 1 / 60, ["m3/min"])
  add(u, "m3/h", "m³/h", "cubic metre per hour", "vol-flow", "vol-flow", Q, 1 / 3600, ["m3/h", "m3/hr"])
  add(u, "L/s", "L/s", "litre per second", "vol-flow", "vol-flow", Q, 1e-3, ["l/s", "L/s"])
  add(u, "L/min", "L/min", "litre per minute", "vol-flow", "vol-flow", Q, 1e-3 / 60, ["l/min", "L/min", "lpm"])
  add(u, "L/h", "L/h", "litre per hour", "vol-flow", "vol-flow", Q, 1e-3 / 3600, ["l/h", "L/h"])
  add(u, "cfm", "CFM", "cubic foot per minute", "vol-flow", "vol-flow", Q, FT ** 3 / 60, ["cfm", "CFM"])
  add(u, "gpm-us", "GPM US", "US gallon per minute", "vol-flow", "vol-flow", Q, GAL_US / 60, ["gpm", "gpm-us", "usgpm"])
  add(u, "gpm-imp", "GPM Imp", "Imperial gallon per minute", "vol-flow", "vol-flow", Q, GAL_IMP / 60, ["gpm-imp", "ukgpm"])

  const MF = dim({ M: 1, T: -1 })
  add(u, "kg/s", "kg/s", "kilogram per second", "mass-flow", "mass-flow", MF, 1, ["kg/s"])
  add(u, "kg/min", "kg/min", "kilogram per minute", "mass-flow", "mass-flow", MF, 1 / 60, ["kg/min"])
  add(u, "kg/h", "kg/h", "kilogram per hour", "mass-flow", "mass-flow", MF, 1 / 3600, ["kg/h"])
  add(u, "t/h", "t/h", "tonne per hour", "mass-flow", "mass-flow", MF, 1000 / 3600, ["t/h"])
  add(u, "lb/s", "lb/s", "pound per second", "mass-flow", "mass-flow", MF, LB, ["lb/s"])
  add(u, "lb/min", "lb/min", "pound per minute", "mass-flow", "mass-flow", MF, LB / 60, ["lb/min"])
  add(u, "lb/h", "lb/h", "pound per hour", "mass-flow", "mass-flow", MF, LB / 3600, ["lb/h"])

  const DV = dim({ M: 1, L: -1, T: -1 })
  add(u, "Pas", "Pa·s", "pascal second", "dyn-visc", "dyn-visc", DV, 1, ["Pa.s", "Pa·s", "pas"])
  add(u, "mPas", "mPa·s", "millipascal second", "dyn-visc", "dyn-visc", DV, 1e-3, ["mPa.s", "mpas"])
  add(u, "cP", "cP", "centipoise", "dyn-visc", "dyn-visc", DV, 1e-3, ["cp", "cP"])
  add(u, "P", "P", "poise", "dyn-visc", "dyn-visc", DV, 0.1, ["poise"])
  add(u, "lb/fts", "lb/(ft·s)", "pound per foot second", "dyn-visc", "dyn-visc", DV, LB / FT, ["lb/ft.s"])

  const KV = dim({ L: 2, T: -1 })
  add(u, "m2/s", "m²/s", "square metre per second", "kin-visc", "kin-visc", KV, 1, ["m2/s"])
  add(u, "mm2/s", "mm²/s", "square millimetre per second", "kin-visc", "kin-visc", KV, 1e-6, ["mm2/s"])
  add(u, "cSt", "cSt", "centistokes", "kin-visc", "kin-visc", KV, 1e-6, ["cst", "cSt"])
  add(u, "St", "St", "stokes", "kin-visc", "kin-visc", KV, 1e-4, ["st", "St"])
  add(u, "ft2/s", "ft²/s", "square foot per second", "kin-visc", "kin-visc", KV, FT ** 2, ["ft2/s"])

  const E = dim({ M: 1, L: 2, T: -2 })
  add(u, "J", "J", "joule", "energy", "energy", E, 1, ["j", "joule"])
  add(u, "kJ", "kJ", "kilojoule", "energy", "energy", E, 1e3, ["kj"])
  add(u, "MJ", "MJ", "megajoule", "energy", "energy", E, 1e6, ["mj"])
  add(u, "Wh", "Wh", "watt hour", "energy", "energy", E, 3600, ["wh"])
  add(u, "kWh", "kWh", "kilowatt hour", "energy", "energy", E, 3.6e6, ["kwh"])
  add(u, "BTU", "BTU", "British thermal unit", "energy", "energy", E, BTU, ["btu"])
  add(u, "cal", "cal", "calorie", "energy", "energy", E, 4.184, ["cal"])
  add(u, "kcal", "kcal", "kilocalorie", "energy", "energy", E, 4184, ["kcal"])
  add(u, "ftlbf", "ft·lbf", "foot pound-force", "energy", "energy", E, FT * LBF, ["ft.lbf", "ftlbf"])

  const W = dim({ M: 1, L: 2, T: -3 })
  add(u, "W", "W", "watt", "power", "power", W, 1, ["w", "watt"])
  add(u, "kW", "kW", "kilowatt", "power", "power", W, 1e3, ["kw"])
  add(u, "MW", "MW", "megawatt", "power", "power", W, 1e6, ["megawatt"])
  add(u, "hp", "hp", "mechanical horsepower", "power", "power", W, 745.6998715822702, ["hp", "bhp"])
  add(u, "hp-metric", "hp metric", "metric horsepower", "power", "power", W, 735.49875, ["cv", "ps", "hp-metric", "metric hp"])
  add(u, "BTU/h", "BTU/h", "BTU per hour", "power", "power", W, BTU / 3600, ["btu/h"])
  add(u, "TR", "TR", "ton of refrigeration", "power", "power", W, (12000 * BTU) / 3600, ["TR", "ton-ref"])

  const Fscale = 5 / 9
  const Foff = 273.15 - 32 * Fscale
  const Temp = dim({ Th: 1 })
  add(u, "C", "°C", "degree Celsius", "temperature", "temperature", Temp, 1, ["°C", "degC", "celsius", "C"], 273.15)
  add(u, "F", "°F", "degree Fahrenheit", "temperature", "temperature", Temp, Fscale, ["°F", "degF", "fahrenheit", "F"], Foff)
  add(u, "K", "K", "kelvin", "temperature", "temperature", Temp, 1, ["kelvin", "K"], 0)
  add(u, "R", "°R", "degree Rankine", "temperature", "temperature", Temp, Fscale, ["°R", "rankine", "R"], 0)

  const dT = dim({ dTh: 1 })
  add(u, "dC", "Δ°C", "celsius difference", "delta-t", "delta-t", dT, 1, ["deltaC", "dC", "ΔC", "Δ°C"])
  add(u, "dK", "ΔK", "kelvin difference", "delta-t", "delta-t", dT, 1, ["deltaK", "dK", "ΔK"])
  add(u, "dF", "Δ°F", "fahrenheit difference", "delta-t", "delta-t", dT, Fscale, ["deltaF", "dF", "ΔF", "Δ°F"])
  add(u, "dR", "Δ°R", "rankine difference", "delta-t", "delta-t", dT, Fscale, ["ΔR", "Δ°R"])

  const Kth = dim({ M: 1, L: 1, T: -3, dTh: -1 })
  const btuPerHmFtF = (BTU / 3600) * (1 / FT) * (9 / 5)
  add(u, "W/mK", "W/(m·K)", "watt per metre kelvin", "conductivity", "conductivity", Kth, 1, ["W/mK", "W/(m·K)", "W/m.K"])
  add(u, "W/mC", "W/(m·°C)", "watt per metre celsius", "conductivity", "conductivity", Kth, 1, ["W/mC", "W/(m·C)"])
  add(u, "BTU/hftF", "BTU/(h·ft·°F)", "BTU per hour foot fahrenheit", "conductivity", "conductivity", Kth, btuPerHmFtF, ["BTU/hftF"])

  const HF = dim({ M: 1, T: -3 })
  add(u, "W/m2", "W/m²", "watt per square metre", "heat-flux", "heat-flux", HF, 1, ["W/m2"])
  add(u, "kW/m2", "kW/m²", "kilowatt per square metre", "heat-flux", "heat-flux", HF, 1e3, ["kW/m2"])
  add(u, "BTU/hft2", "BTU/(h·ft²)", "BTU per hour square foot", "heat-flux", "heat-flux", HF, (BTU / 3600) / FT ** 2, ["BTU/hft2"])

  const CP = dim({ L: 2, T: -2, dTh: -1 })
  add(u, "J/kgK", "J/(kg·K)", "joule per kilogram kelvin", "specific-heat", "specific-heat", CP, 1, ["J/kgK"])
  add(u, "kJ/kgK", "kJ/(kg·K)", "kilojoule per kilogram kelvin", "specific-heat", "specific-heat", CP, 1e3, ["kJ/kgK"])
  add(u, "BTU/lbF", "BTU/(lb·°F)", "BTU per pound fahrenheit", "specific-heat", "specific-heat", CP, (BTU / LB) * (9 / 5), ["BTU/lbF"])

  const HTC = dim({ M: 1, T: -3, dTh: -1 })
  add(u, "W/m2K", "W/(m²·K)", "watt per square metre kelvin", "htc", "htc", HTC, 1, ["W/m2K"])
  add(u, "kW/m2K", "kW/(m²·K)", "kilowatt per square metre kelvin", "htc", "htc", HTC, 1e3, ["kW/m2K"])
  add(u, "BTU/hft2F", "BTU/(h·ft²·°F)", "BTU per hour square foot fahrenheit", "htc", "htc", HTC, (BTU / 3600) / FT ** 2 * (9 / 5), ["BTU/hft2F"])

  const AL = dim({ dTh: -1 })
  add(u, "1/K", "1/K", "per kelvin", "expansion", "expansion", AL, 1, ["1/K"])
  add(u, "um/mK", "µm/(m·K)", "micrometre per metre kelvin", "expansion", "expansion", AL, 1e-6, ["um/mK", "µm/mK"])
  add(u, "1/F", "1/°F", "per fahrenheit", "expansion", "expansion", AL, 9 / 5, ["1/F", "1/°F"])

  const ST = dim({ M: 1, T: -2 })
  add(u, "N/m-s", "N/m", "newton per metre", "surface", "surface", ST, 1, [])
  add(u, "mN/m", "mN/m", "millinewton per metre", "surface", "surface", ST, 1e-3, ["mN/m"])
  add(u, "dyn/cm", "dyn/cm", "dyne per centimetre", "surface", "surface", ST, 1e-3, ["dyn/cm"])

  add(u, "V", "V", "volt", "voltage", "voltage", dim({ U: 1 }), 1, ["volt", "V"])
  add(u, "mV", "mV", "millivolt", "voltage", "voltage", dim({ U: 1 }), 1e-3, ["mv"])
  add(u, "kV", "kV", "kilovolt", "voltage", "voltage", dim({ U: 1 }), 1e3, ["kv"])
  add(u, "A", "A", "ampere", "current", "current", dim({ I: 1 }), 1, ["amp", "ampere", "A"])
  add(u, "mA", "mA", "milliampere", "current", "current", dim({ I: 1 }), 1e-3, ["ma"])
  add(u, "kA", "kA", "kiloampere", "current", "current", dim({ I: 1 }), 1e3, ["ka"])
  add(u, "ohm", "Ω", "ohm", "resistance", "resistance", dim({ R: 1 }), 1, ["ohm", "Ω"])
  add(u, "mohm", "mΩ", "milliohm", "resistance", "resistance", dim({ R: 1 }), 1e-3, ["mohm", "mΩ"])
  add(u, "kohm", "kΩ", "kilohm", "resistance", "resistance", dim({ R: 1 }), 1e3, ["kohm", "kΩ"])
  add(u, "Mohm", "MΩ", "megohm", "resistance", "resistance", dim({ R: 1 }), 1e6, ["Mohm", "MΩ"])
  add(u, "S", "S", "siemens", "conductance", "conductance", dim({ G: 1 }), 1, ["siemens"])
  add(u, "mS", "mS", "millisiemens", "conductance", "conductance", dim({ G: 1 }), 1e-3, ["mS"])
  add(u, "farad", "F", "farad", "capacitance", "capacitance", dim({ C: 1 }), 1, ["farad"])
  add(u, "uF", "µF", "microfarad", "capacitance", "capacitance", dim({ C: 1 }), 1e-6, ["uF", "µF"])
  add(u, "nF", "nF", "nanofarad", "capacitance", "capacitance", dim({ C: 1 }), 1e-9, ["nF"])
  add(u, "pF", "pF", "picofarad", "capacitance", "capacitance", dim({ C: 1 }), 1e-12, ["pF"])
  add(u, "H", "H", "henry", "inductance", "inductance", dim({ H: 1 }), 1, ["henry"])
  add(u, "mH", "mH", "millihenry", "inductance", "inductance", dim({ H: 1 }), 1e-3, ["mH"])
  add(u, "uH", "µH", "microhenry", "inductance", "inductance", dim({ H: 1 }), 1e-6, ["uH", "µH"])
  add(u, "Coul", "C", "coulomb", "charge", "charge", dim({ Qc: 1 }), 1, ["coulomb"])
  add(u, "mC", "mC", "millicoulomb", "charge", "charge", dim({ Qc: 1 }), 1e-3, ["mC"])
  add(u, "uC", "µC", "microcoulomb", "charge", "charge", dim({ Qc: 1 }), 1e-6, ["uC", "µC"])

  return u
}

export const UNITS: UnitDef[] = build()

/** Symbols that also belong to a more common unit. Display symbol stays; search alias does not. */
const ALIAS_DENY: Record<string, string[]> = {
  g0: ["g"],
  kn: ["kn"],
  "N/m-s": ["N/m"],
  farad: ["F"],
}

for (const unit of UNITS) {
  const deny = ALIAS_DENY[unit.id]
  if (!deny) continue
  unit.aliases = unit.aliases.filter((alias) => !deny.includes(alias))
}

const byId = new Map(UNITS.map((unit) => [unit.id, unit]))

export function unitById(id: string): UnitDef | undefined {
  return byId.get(id)
}

export function unitsInCategory(categoryId: string): UnitDef[] {
  return UNITS.filter((unit) => unit.category === categoryId)
}

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

/** First category that owns a globally addressable alias. Radius duplicates are not in the alias map. */
const aliasMap = new Map<string, UnitDef[]>()
for (const unit of UNITS) {
  if (unit.category === "radius" || unit.category === "stress" || unit.category === "area-load" || unit.category === "section-modulus") {
    continue
  }
  for (const alias of unit.aliases) {
    const key = alias.normalize("NFKC")
    const list = aliasMap.get(key) ?? []
    if (!list.includes(unit)) list.push(unit)
    aliasMap.set(key, list)
  }
}

export function lookupAlias(token: string): UnitDef | undefined {
  const key = token.normalize("NFKC").trim()
  const exact = aliasMap.get(key)
  if (exact?.length === 1) return exact[0]
  const folded = key.toLowerCase()
  const hits = new Map<string, UnitDef>()
  for (const [alias, units] of aliasMap) {
    if (alias.toLowerCase() === folded) {
      for (const unit of units) hits.set(unit.id, unit)
    }
  }
  if (hits.size === 1) return [...hits.values()][0]
  return undefined
}
