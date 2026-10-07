import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as parseStrictNumber, i as lookupAlias, u as useLabQuery } from "./lab-shell-Dd_RI9Uq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/command-bar-yTks2oVM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Nominal minimums associated with the ISO 898-1 property-class system.
* The 8.8 split (≤16 mm / >16 mm) is the usual published change.
* Confirm the current edition before design use. Not a verbatim table extract.
*/
var PROPERTY_CLASSES = [
	{
		id: "4.6",
		base: {
			fu: 400,
			fy: 240,
			sp: 225
		},
		note: "Low-carbon. fu and 0.6 fu yield ratio are the class designation."
	},
	{
		id: "4.8",
		base: {
			fu: 400,
			fy: 320,
			sp: 310
		},
		note: "fu 400 MPa. Yield ratio 0.8."
	},
	{
		id: "5.6",
		base: {
			fu: 500,
			fy: 300,
			sp: 280
		},
		note: "fu 500 MPa. Yield ratio 0.6."
	},
	{
		id: "5.8",
		base: {
			fu: 500,
			fy: 400,
			sp: 380
		},
		note: "fu 500 MPa. Yield ratio 0.8."
	},
	{
		id: "6.8",
		base: {
			fu: 600,
			fy: 480,
			sp: 440
		},
		note: "fu 600 MPa. Yield ratio 0.8."
	},
	{
		id: "8.8",
		base: {
			fu: 800,
			fy: 640,
			sp: 580
		},
		above: {
			aboveD: 16,
			fu: 830,
			fy: 660,
			sp: 600
		},
		note: "Structural default. fu is 800 MPa at d ≤ 16 mm and 830 MPa above 16 mm."
	},
	{
		id: "9.8",
		base: {
			fu: 900,
			fy: 720,
			sp: 650
		},
		maxD: 16,
		note: "Only up to 16 mm in the usual class system."
	},
	{
		id: "10.9",
		base: {
			fu: 1040,
			fy: 940,
			sp: 830
		},
		note: "fu 1040 MPa. Not interchangeable with 8.8."
	},
	{
		id: "12.9",
		base: {
			fu: 1220,
			fy: 1100,
			sp: 970
		},
		note: "fu 1220 MPa. Outside the AS 4100 check implemented here."
	}
];
function classById(id) {
	return PROPERTY_CLASSES.find((item) => item.id === id);
}
function classBand(id, dMm) {
	const item = classById(id);
	if (!item) return null;
	if (item.maxD != null && dMm > item.maxD) return null;
	if (item.above && dMm > item.above.aboveD) return {
		fu: item.above.fu,
		fy: item.above.fy,
		sp: item.above.sp
	};
	return item.base;
}
var STAINLESS_CLASSES = [
	{
		id: "A2-50",
		family: "A2",
		rm: 500,
		rp: 210,
		common: "Often sold near 304. Not the same designation."
	},
	{
		id: "A2-70",
		family: "A2",
		rm: 700,
		rp: 450,
		common: "Often sold near 304. Not the same designation."
	},
	{
		id: "A2-80",
		family: "A2",
		rm: 800,
		rp: 600,
		common: "Often sold near 304. Not the same designation."
	},
	{
		id: "A4-50",
		family: "A4",
		rm: 500,
		rp: 210,
		common: "Often sold near 316. Not the same designation."
	},
	{
		id: "A4-70",
		family: "A4",
		rm: 700,
		rp: 450,
		common: "Often sold near 316. Not the same designation."
	},
	{
		id: "A4-80",
		family: "A4",
		rm: 800,
		rp: 600,
		common: "Often sold near 316. Not the same designation."
	}
];
var STAINLESS_NOTE = "ISO 3506-1 austenitic fastener classes. rm is the minimum tensile strength and rp is the minimum 0.2% proof stress, in MPa. These are not carbon-steel property classes and they are not used in the AS 4100 check. Diameter limits and hardness are not embedded — 70 and 80 are not offered in every size. A2 is not every 304 product, and A4 is not every 316 product.";
var PROFILE_PROVENANCE = {
	sourceType: "calculated",
	sourceStandard: "ISO 68-1 basic profile / ISO 898-1 stress area",
	edition: "formula, not a table extract",
	clause: "H = (√3/2)P; d2 = d − 3√3 P/8; d1 = d − 5√3 P/8; As = π/4 ((d2+d3)/2)²",
	note: "Calculated from the basic 60° profile. Not a copy of ISO 724."
};
var CLASS_PROVENANCE = {
	sourceType: "reference-nominal",
	sourceStandard: "ISO 898-1 property class system",
	edition: "confirm current edition",
	clause: "class designation (fu and yield ratio), with the usual 8.8 diameter split",
	note: "Nominal minimums. Not a verbatim standard table. Do not treat fy, fu and proof stress as interchangeable."
};
var HEX_PROVENANCE = {
	sourceType: "typical-product",
	sourceStandard: "Typical commercial ISO hexagon product",
	edition: "not an ISO 4014/4017 extract",
	clause: "across flats s and head height k",
	note: "Typical product dimensions for a hexagon head. Older DIN hexagons can differ (M22 was 32 mm). Confirm before fabrication."
};
var HEX = {
	3: {
		s: 5.5,
		k: 2
	},
	4: {
		s: 7,
		k: 2.8
	},
	5: {
		s: 8,
		k: 3.5
	},
	6: {
		s: 10,
		k: 4
	},
	8: {
		s: 13,
		k: 5.3
	},
	10: {
		s: 16,
		k: 6.4
	},
	12: {
		s: 18,
		k: 7.5
	},
	14: {
		s: 21,
		k: 8.8
	},
	16: {
		s: 24,
		k: 10
	},
	18: {
		s: 27,
		k: 11.5
	},
	20: {
		s: 30,
		k: 12.5
	},
	22: {
		s: 34,
		k: 14
	},
	24: {
		s: 36,
		k: 15
	},
	27: {
		s: 41,
		k: 17
	},
	30: {
		s: 46,
		k: 18.7
	},
	33: {
		s: 50,
		k: 21
	},
	36: {
		s: 55,
		k: 22.5
	},
	42: {
		s: 65,
		k: 26
	},
	48: {
		s: 75,
		k: 30
	},
	56: {
		s: 85,
		k: 35
	},
	64: {
		s: 95,
		k: 40
	}
};
var COARSE = {
	3: .5,
	4: .7,
	5: .8,
	6: 1,
	7: 1,
	8: 1.25,
	10: 1.5,
	12: 1.75,
	14: 2,
	16: 2,
	18: 2.5,
	20: 2.5,
	22: 2.5,
	24: 3,
	27: 3,
	30: 3.5,
	33: 3.5,
	36: 4,
	39: 4,
	42: 4.5,
	45: 4.5,
	48: 5,
	52: 5,
	56: 5.5,
	60: 5.5,
	64: 6,
	68: 6,
	72: 6,
	80: 6,
	90: 6,
	100: 6
};
var FINE = {
	8: [1],
	10: [1.25, 1],
	12: [
		1.5,
		1.25,
		1
	],
	14: [1.5],
	16: [1.5],
	18: [2, 1.5],
	20: [2, 1.5],
	22: [2, 1.5],
	24: [2],
	27: [2],
	30: [3, 2],
	33: [2],
	36: [3],
	39: [3],
	42: [3],
	48: [3],
	56: [4],
	64: [4]
};
var METRIC_SIZES = Object.keys(COARSE).map(Number).sort((a, b) => a - b).map((d) => ({
	d,
	coarse: COARSE[d] ?? 0,
	fine: FINE[d] ?? [],
	hex: HEX[d]
}));
var UNIFIED_SIZES = [
	{
		label: "1/4",
		inch: .25,
		unc: 20,
		unf: 28
	},
	{
		label: "5/16",
		inch: .3125,
		unc: 18,
		unf: 24
	},
	{
		label: "3/8",
		inch: .375,
		unc: 16,
		unf: 24
	},
	{
		label: "7/16",
		inch: .4375,
		unc: 14,
		unf: 20
	},
	{
		label: "1/2",
		inch: .5,
		unc: 13,
		unf: 20,
		unef: 28
	},
	{
		label: "9/16",
		inch: .5625,
		unc: 12,
		unf: 18
	},
	{
		label: "5/8",
		inch: .625,
		unc: 11,
		unf: 18,
		unef: 24
	},
	{
		label: "3/4",
		inch: .75,
		unc: 10,
		unf: 16,
		unef: 20
	},
	{
		label: "7/8",
		inch: .875,
		unc: 9,
		unf: 14,
		unef: 20
	},
	{
		label: "1",
		inch: 1,
		unc: 8,
		unf: 12,
		unef: 20
	},
	{
		label: "1-1/8",
		inch: 1.125,
		unc: 7,
		unf: 12
	},
	{
		label: "1-1/4",
		inch: 1.25,
		unc: 7,
		unf: 12
	},
	{
		label: "1-1/2",
		inch: 1.5,
		unc: 6,
		unf: 12
	},
	{
		label: "1-3/4",
		inch: 1.75,
		unc: 5
	},
	{
		label: "2",
		inch: 2,
		unc: 4.5
	}
];
var ALL_CLASSES = PROPERTY_CLASSES.map((item) => item.id);
var STRUCTURAL_D = [
	12,
	16,
	20,
	24,
	30,
	36
];
var PRECISION_D = METRIC_SIZES.filter((size) => size.d <= 64).map((size) => size.d);
var COMMERCIAL_D = METRIC_SIZES.filter((size) => size.d >= 5 && size.d <= 64).map((size) => size.d);
var STANDARDS = [
	{
		id: "iso-metric",
		family: "ISO",
		name: "ISO metric",
		system: "metric",
		classes: "all",
		metricDiameters: null,
		design: "as4100",
		note: "ISO 4014 / 4017 / 4032 / 4762 product geometry is not embedded except typical hexagon s and k. Thread data is the calculated basic profile. Property classes are ISO 898-1 nominal minimums."
	},
	{
		id: "as1110",
		family: "AU",
		name: "AS/NZS 1110.1",
		system: "metric",
		classes: [
			"8.8",
			"10.9",
			"12.9"
		],
		metricDiameters: PRECISION_D,
		design: "as4100",
		note: "Precision hexagon bolts, product grades A and B (ISO 4014 type). Usual classes 8.8, 10.9 and 12.9. Diameters here are M3 to M64. This is not a copy of the AS/NZS 1110 tables — s and k are typical hexagon sizes, and tolerances, thread length and product grade are not embedded."
	},
	{
		id: "as1111",
		family: "AU",
		name: "AS 1111.1",
		system: "metric",
		classes: ["4.6", "4.8"],
		metricDiameters: COMMERCIAL_D,
		design: "as4100",
		note: "Commercial hexagon bolts, product grade C. Usual classes 4.6 and 4.8. Diameters here are M5 to M64. This is not a copy of the AS 1111 tables — s and k are typical hexagon sizes. Grade C tolerances are wider and are not embedded."
	},
	{
		id: "as1252",
		family: "AU",
		name: "AS/NZS 1252.1",
		system: "metric",
		classes: ["8.8"],
		metricDiameters: STRUCTURAL_D,
		design: "as4100",
		note: "High-strength structural bolting assemblies. This dataset holds 8.8 and the usual diameter set only. Assembly marking, k-class and preload procedure are not embedded."
	},
	{
		id: "as4100",
		family: "AU",
		name: "AS 4100 bolting context",
		system: "metric",
		classes: [
			"4.6",
			"8.8",
			"10.9"
		],
		metricDiameters: null,
		design: "as4100",
		note: "A design-context entry, not a product standard. 4.6, 8.8 and 10.9 only. Product bolts are AS/NZS 1110.1, AS 1111.1 or AS/NZS 1252.1. This sheet does not run a design check."
	},
	{
		id: "en14399",
		family: "EN",
		name: "EN 14399",
		system: "metric",
		classes: ["8.8", "10.9"],
		metricDiameters: STRUCTURAL_D,
		design: "none",
		note: "HR/HV system geometry, nut marking and preload are not in this dataset. Metric thread geometry and ISO property class only. No EN design capacity is returned."
	},
	{
		id: "en15048",
		family: "EN",
		name: "EN 15048",
		system: "metric",
		classes: [
			"4.6",
			"8.8",
			"10.9"
		],
		metricDiameters: null,
		design: "none",
		note: "Non-preloaded structural assemblies. Product requirements are not embedded. No EN design capacity is returned."
	},
	{
		id: "unc",
		family: "ASME",
		name: "Unified UNC",
		system: "unified",
		series: "unc",
		classes: [],
		metricDiameters: null,
		design: "none",
		note: "Basic Unified profile calculated from nominal diameter and TPI. SAE J429 and ASTM strength data are not in the verified dataset."
	},
	{
		id: "unf",
		family: "ASME",
		name: "Unified UNF",
		system: "unified",
		series: "unf",
		classes: [],
		metricDiameters: null,
		design: "none",
		note: "Fine Unified thread. Strength data is not in the verified dataset."
	},
	{
		id: "unef",
		family: "ASME",
		name: "Unified UNEF",
		system: "unified",
		series: "unef",
		classes: [],
		metricDiameters: null,
		design: "none",
		note: "Extra-fine Unified thread, only where a TPI is in this dataset."
	},
	{
		id: "astm-inch",
		family: "ASTM",
		name: "ASTM structural inch",
		system: "unified",
		series: "unc",
		classes: [],
		metricDiameters: null,
		minInch: .5,
		design: "none",
		note: "Thread geometry for common UNC diameters from 1/2 in. F3125 (historical A325 / A490 names) strength tables are not embedded. No design capacity is returned."
	}
];
function standardById(id) {
	return STANDARDS.find((item) => item.id === id);
}
function classesFor(standard) {
	if (standard.classes === "all") return ALL_CLASSES;
	return standard.classes;
}
function metricSizesFor(standard) {
	if (standard.metricDiameters == null) return METRIC_SIZES;
	const allow = new Set(standard.metricDiameters);
	return METRIC_SIZES.filter((size) => allow.has(size.d));
}
function unifiedSizesFor(standard) {
	return UNIFIED_SIZES.filter((size) => {
		if ((standard.series ? size[standard.series] : size.unc) == null) return false;
		if (standard.minInch != null && size.inch < standard.minInch) return false;
		return true;
	});
}
function metricLabel(d) {
	return `M${d}`;
}
var CLASSES = [
	"12.9",
	"10.9",
	"9.8",
	"8.8",
	"6.8",
	"5.8",
	"5.6",
	"4.8",
	"4.6"
];
function parseBoltQuery(raw) {
	const text = raw.trim();
	if (!text) return { matched: false };
	const lower = text.toLowerCase();
	let standardId;
	if (/as\s*\/?\s*nzs\s*1252|as\s*1252|\b1252\b/.test(lower)) standardId = "as1252";
	else if (/1111/.test(lower)) standardId = "as1111";
	else if (/1110/.test(lower)) standardId = "as1110";
	else if (/as\s*4100|\b4100\b/.test(lower)) standardId = "as4100";
	else if (/14399/.test(lower)) standardId = "en14399";
	else if (/15048/.test(lower)) standardId = "en15048";
	else if (/astm|a325|a490|f3125/.test(lower)) standardId = "astm-inch";
	let focus;
	if (/\b(stress area|root area|tensile area|areas)\b/.test(lower)) focus = "areas";
	if (/proof|fy|fu|property|class/.test(lower)) focus = "material";
	if (/mass|weight/.test(lower)) focus = "mass";
	if (/capacit|shear|tension/.test(lower)) focus = "capacity";
	if (/pitch|thread|tpi/.test(lower)) focus = "thread";
	if (/head|across flat|geometry/.test(lower)) focus = "geometry";
	const classId = CLASSES.find((id) => lower.includes(id));
	const metric = text.match(/M\s*(\d+(?:\.\d+)?)\s*(?:[x×]\s*(\d+(?:\.\d+)?))?/i);
	if (metric) {
		const d = Number(metric[1]);
		const size = METRIC_SIZES.find((item) => item.d === d);
		if (!size) return { matched: false };
		const wantsFine = /fine/.test(lower);
		const explicit = metric[2] ? Number(metric[2]) : void 0;
		let pitch = explicit;
		let series = wantsFine ? "fine" : "coarse";
		if (pitch == null && wantsFine) pitch = size.fine[0];
		if (pitch == null) pitch = size.coarse;
		if (explicit != null && explicit !== size.coarse) series = "fine";
		return {
			matched: true,
			system: "metric",
			series,
			sizeLabel: metricLabel(d),
			pitchMm: pitch,
			classId,
			standardId: standardId ?? "iso-metric",
			focus
		};
	}
	const unified = text.match(/(\d+\s*-\s*\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:-| )?(\d+(?:\.\d+)?)?\s*(UNC|UNF|UNEF)/i);
	if (unified) {
		const label = (unified[1] ?? "").replace(/\s/g, "");
		const size = UNIFIED_SIZES.find((item) => item.label.toLowerCase() === label.toLowerCase() || String(item.inch) === label);
		const series = (unified[3] ?? "UNC").toLowerCase();
		if (!size || size[series] == null) return { matched: false };
		const tpi = unified[2] ? Number(unified[2]) : size[series];
		if (tpi !== size[series]) return { matched: false };
		return {
			matched: true,
			system: "unified",
			series,
			sizeLabel: size.label,
			pitchMm: 25.4 / tpi,
			standardId: standardId ?? series,
			focus
		};
	}
	if (standardId && /bolt|fastener|thread/.test(lower)) return {
		matched: true,
		standardId,
		focus
	};
	return { matched: false };
}
function normaliseToken(raw) {
	return raw.normalize("NFKC").trim().replace(/μ/g, "µ").replace(/\s+/g, "").replace(/·/g, ".");
}
function parseQuantity(raw) {
	const text = raw.trim();
	if (!text) return null;
	const toSplit = text.split(/\s+to\s+/i);
	const left = toSplit[0] ?? "";
	const right = toSplit[1];
	const match = left.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(.*)$/i);
	if (!match) return null;
	const value = parseStrictNumber(match[1] ?? "");
	const token = normaliseToken(match[2] ?? "");
	if (!token) return null;
	const unit = lookupAlias(token);
	if (!unit) return null;
	let to;
	if (right?.trim()) {
		const toUnit = lookupAlias(normaliseToken(right));
		if (!toUnit) return null;
		to = toUnit;
	}
	return {
		value,
		unit,
		to
	};
}
function routeQuery(raw) {
	const q = raw.trim();
	if (!q) return { module: null };
	let unit = false;
	let bolt = false;
	try {
		unit = parseQuantity(q) != null;
	} catch {
		unit = false;
	}
	bolt = parseBoltQuery(q).matched;
	if (unit && !bolt) return {
		module: "units",
		q
	};
	if (bolt && !unit) return {
		module: "bolts",
		q
	};
	if (unit) return {
		module: "units",
		q
	};
	if (bolt) return {
		module: "bolts",
		q
	};
	if (/\b(plates?|buckling|stiffeners?)\b/i.test(q)) return {
		module: "plate",
		q
	};
	return { module: null };
}
function CommandBar({ initial = "" }) {
	const navigate = useNavigate();
	const { embed } = useLabQuery();
	const [text, setText] = (0, import_react.useState)(initial);
	const [miss, setMiss] = (0, import_react.useState)("");
	function go() {
		const hit = routeQuery(text);
		if (hit.module === "bolts") {
			setMiss("");
			navigate({
				to: "/bolts",
				search: embed ? {
					q: hit.q,
					embed: "1"
				} : { q: hit.q }
			});
			return;
		}
		if (hit.module === "units") {
			setMiss("");
			navigate({
				to: "/units",
				search: embed ? {
					q: hit.q,
					embed: "1"
				} : { q: hit.q }
			});
			return;
		}
		if (hit.module === "plate") {
			setMiss("");
			navigate({
				to: "/plate",
				search: embed ? { embed: "1" } : {}
			});
			return;
		}
		setMiss("Not recognised. Try M24 8.8, 350 MPa, or plate buckling.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "command",
		onSubmit: (event) => {
			event.preventDefault();
			go();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "refSearch",
				"aria-label": "Reference search",
				placeholder: "M24 8.8    ·    350 MPa    ·    1450 rpm    ·    3/4 UNC",
				value: text,
				onChange: (event) => setText(event.target.value),
				onKeyDown: (event) => {
					if (event.key === "Escape") {
						setText("");
						setMiss("");
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "submit",
				children: "OPEN"
			}),
			miss ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "failBanner spanAll",
				children: miss
			}) : null
		]
	});
}
//#endregion
export { unifiedSizesFor as _, PROFILE_PROVENANCE as a, STANDARDS as c, classesFor as d, metricLabel as f, standardById as g, parseQuantity as h, METRIC_SIZES as i, classBand as l, parseBoltQuery as m, CommandBar as n, STAINLESS_CLASSES as o, metricSizesFor as p, HEX_PROVENANCE as r, STAINLESS_NOTE as s, CLASS_PROVENANCE as t, classById as u };
