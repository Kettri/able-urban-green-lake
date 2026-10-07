import { c as unitById, o as sameDim, r as categoryById } from "./lab-shell-Dd_RI9Uq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/converter-CpIW05mk.js
var ConvertError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "ConvertError";
	}
};
function quantityName(unit) {
	return categoryById(unit.category)?.label ?? unit.kind;
}
function incompatibility(from, to) {
	if (from.id === to.id) return null;
	if (from.kind === to.kind && sameDim(from.dim, to.dim)) return null;
	if (sameDim(from.dim, to.dim) && from.kind !== to.kind) return `Same base dimension but different engineering quantities: ${quantityName(from)} cannot be converted to ${quantityName(to)}.`;
	if (from.kind === "mass" && to.kind === "force") return "Mass and force are different quantities. Converting mass to weight requires gravitational acceleration.";
	if (from.kind === "force" && to.kind === "mass") return "Force and mass are different quantities. Converting weight to mass requires gravitational acceleration.";
	if (from.kind === "force" && to.kind === "stress" || from.kind === "stress" && to.kind === "force") return "Incompatible dimensions: Force cannot be directly converted to Stress.";
	if (from.kind === "temperature" && to.kind === "delta-t") return "Absolute temperature and a temperature difference are different conversions. Use Temperature difference for ΔT.";
	return `Incompatible dimensions: ${quantityName(from)} cannot be directly converted to ${quantityName(to)}.`;
}
function toSI(value, unit) {
	return value * unit.scale + unit.offset;
}
function fromSI(si, unit) {
	return (si - unit.offset) / unit.scale;
}
function convert(value, fromId, toId) {
	if (!Number.isFinite(value)) throw new ConvertError("Invalid number.");
	const from = unitById(fromId);
	const to = unitById(toId);
	if (!from || !to) throw new ConvertError("Unknown unit.");
	const why = incompatibility(from, to);
	if (why) throw new ConvertError(why);
	const si = toSI(value, from);
	if (from.kind === "temperature" && si < -1e-9) throw new ConvertError("Absolute temperature below 0 K is invalid.");
	return fromSI(si, to);
}
//#endregion
export { convert as n, incompatibility as r, ConvertError as t };
