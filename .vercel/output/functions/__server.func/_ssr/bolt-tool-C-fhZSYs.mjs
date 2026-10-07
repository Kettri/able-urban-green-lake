import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as parseStrictNumber, s as trimNum } from "./lab-shell-Dd_RI9Uq.mjs";
import { _ as unifiedSizesFor, a as PROFILE_PROVENANCE, c as STANDARDS, d as classesFor, f as metricLabel, g as standardById, i as METRIC_SIZES, l as classBand, m as parseBoltQuery, o as STAINLESS_CLASSES, p as metricSizesFor, r as HEX_PROVENANCE, s as STAINLESS_NOTE, t as CLASS_PROVENANCE, u as classById } from "./command-bar-yTks2oVM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bolt-tool-C-fhZSYs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var W = 720;
function BoltDiagram(props) {
	if (!(props.dMm > 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "drawingFrame",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "drawingCaption",
			children: "No figure — this combination is not in the dataset."
		})
	});
	const d = props.dMm;
	const hasHead = props.kMm != null && props.sMm != null && props.kMm > 0 && props.sMm > 0;
	const dPx = 78;
	const sRatio = hasHead ? props.sMm / d : 1.5;
	const kRatio = hasHead ? props.kMm / d : .64;
	const sPx = dPx * Math.min(Math.max(sRatio, 1.3), 1.9);
	const kPx = dPx * Math.min(Math.max(kRatio, .42), .9);
	const cy = 22 + sPx / 2;
	const headLeft = 36;
	const headRight = headLeft + kPx;
	const tipX = 548;
	const shankTop = cy - dPx / 2;
	const shankBot = cy + dPx / 2;
	const headTop = cy - sPx / 2;
	const headBot = cy + sPx / 2;
	const cham = Math.min(16, Math.max(7, (sPx - dPx) * .32));
	const tipC = Math.min(9, dPx * .11);
	let threadFrac = .4;
	if (props.lengthMm != null && props.threadMm != null && props.lengthMm > 0 && props.threadMm > 0) threadFrac = Math.min(.96, Math.max(.08, props.threadMm / props.lengthMm));
	const threadStart = headRight + (tipX - headRight) * (1 - threadFrac);
	const fullThread = threadFrac > .92;
	const minor = props.minorMm != null && props.minorMm > 0 && props.minorMm < d ? props.minorMm : d * .85;
	const inset = Math.max(8, (d - minor) / d * dPx / 2);
	const minorTop = shankTop + inset;
	const minorBot = shankBot - inset;
	const minorEnd = 535.42;
	const dimK = headBot + 30;
	const dimB = dimK + 34;
	const dimL = dimB + 34;
	const afterL = dimL + 20;
	const hexR = sPx / Math.sqrt(3);
	const hexCx = 118;
	const hexCy = afterL + hexR + 10;
	const dimS = hexCy + hexR + 26;
	const pW = 72;
	const pH = Math.sqrt(3) / 2 * pW;
	const profileX = hexCx + sPx / 2 + 64;
	const rootY = Math.max(hexCy + 8, afterL + pH + 36);
	const crestY = rootY - pH;
	const dimP = rootY + 28;
	const H = Math.max(dimS + 36, dimP + 28);
	const bSpan = tipX - threadStart;
	const bTextX = bSpan >= 128 ? (threadStart + tipX) / 2 : threadStart - 8;
	const bAnchor = bSpan >= 128 ? "middle" : "end";
	const bExtTop = threadStart < headRight + 140 ? dimK + 14 : shankBot + 5;
	const on = (id) => props.hot === id ? "hotline" : "";
	const tx = (id) => props.hot === id ? "hot" : "";
	const kLabel = props.kText ? `k ${props.kText}` : "k";
	const sLabel = props.sText ? `s ${props.sText}` : "s";
	const lLabel = props.lengthText ? `L ${props.lengthText}` : "L";
	const bLabel = props.threadText ? `b ${props.threadText}` : "b";
	const headPath = [
		`M ${headLeft + cham} ${headTop}`,
		`H ${headRight}`,
		`V ${headBot}`,
		`H ${headLeft + cham}`,
		`L ${headLeft} ${headBot - cham}`,
		`V ${headTop + cham}`,
		"Z"
	].join(" ");
	const shankPath = [
		`M ${headRight} ${shankTop}`,
		`H 539.42`,
		`L ${tipX} ${shankTop + tipC}`,
		`V ${shankBot - tipC}`,
		`L 539.42 ${shankBot}`,
		`H ${headRight}`,
		"Z"
	].join(" ");
	const hex = hexPoints(hexCx, hexCy, sPx);
	const flatBottom = hexCy + hexR / 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "drawingFrame",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			className: "boltSvg",
			viewBox: `0 0 ${W} ${H}`,
			role: "img",
			"aria-label": "Orthographic hex bolt, end view and thread profile",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("marker", {
					id: "boltArrow",
					viewBox: "0 0 10 10",
					refX: "9",
					refY: "5",
					markerWidth: "7",
					markerHeight: "7",
					orient: "auto-start-reverse",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 0 L10 5 L0 10 Z",
						fill: "context-stroke"
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					className: `line ${hasHead ? on("k") : "ghost"}`,
					d: headPath
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					className: `line ${on("d")}`,
					d: shankPath
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					className: "center",
					x1: 22,
					y1: cy,
					x2: 560,
					y2: cy
				}),
				minorEnd > threadStart + 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: `minor ${on("b")}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: threadStart,
						y1: minorTop,
						x2: minorEnd,
						y2: minorTop
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: threadStart,
						y1: minorBot,
						x2: minorEnd,
						y2: minorBot
					})]
				}) : null,
				fullThread ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					className: `minor ${on("b")}`,
					x1: threadStart,
					y1: shankTop,
					x2: threadStart,
					y2: shankBot
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: on("k"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "ext",
							x1: headLeft,
							y1: headBot + 5,
							x2: headLeft,
							y2: dimK + 5
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "ext",
							x1: headRight,
							y1: headBot + 5,
							x2: headRight,
							y2: dimL + 5
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "dim",
							x1: headLeft,
							y1: dimK,
							x2: headRight,
							y2: dimK,
							markerStart: "url(#boltArrow)",
							markerEnd: "url(#boltArrow)"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					className: tx("k"),
					x: headRight + 12,
					y: dimK - 6,
					children: hasHead ? kLabel : "k —"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: on("b"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "ext",
							x1: threadStart,
							y1: bExtTop,
							x2: threadStart,
							y2: dimB + 5
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "ext",
							x1: tipX,
							y1: shankBot + 5,
							x2: tipX,
							y2: dimL + 5
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "dim",
							x1: threadStart,
							y1: dimB,
							x2: tipX,
							y2: dimB,
							markerStart: "url(#boltArrow)",
							markerEnd: "url(#boltArrow)"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					className: tx("b"),
					x: bTextX,
					y: dimB - 7,
					textAnchor: bAnchor,
					children: bLabel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: on("L"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "dim",
						x1: headRight,
						y1: dimL,
						x2: tipX,
						y2: dimL,
						markerStart: "url(#boltArrow)",
						markerEnd: "url(#boltArrow)"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					className: tx("L"),
					x: (headRight + tipX) / 2,
					y: dimL - 7,
					textAnchor: "middle",
					children: lLabel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: on("d"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "ext",
							x1: 553,
							y1: shankTop,
							x2: 576,
							y2: shankTop
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "ext",
							x1: 553,
							y1: shankBot,
							x2: 576,
							y2: shankBot
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "dim",
							x1: 570,
							y1: shankTop,
							x2: 570,
							y2: shankBot,
							markerStart: "url(#boltArrow)",
							markerEnd: "url(#boltArrow)"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
					className: tx("d"),
					x: 578,
					y: cy + 4,
					children: ["d ", props.dText]
				}),
				hasHead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
						className: `line ${on("s")}`,
						points: hex
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						className: "line",
						cx: hexCx,
						cy: hexCy,
						r: dPx / 2
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "center",
						x1: hexCx - hexR - 8,
						y1: hexCy,
						x2: hexCx + hexR + 8,
						y2: hexCy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "center",
						x1: hexCx,
						y1: hexCy - hexR - 8,
						x2: hexCx,
						y2: hexCy + hexR + 8
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						className: on("s"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								className: "ext",
								x1: hexCx - sPx / 2,
								y1: flatBottom + 4,
								x2: hexCx - sPx / 2,
								y2: dimS + 5
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								className: "ext",
								x1: hexCx + sPx / 2,
								y1: flatBottom + 4,
								x2: hexCx + sPx / 2,
								y2: dimS + 5
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								className: "dim",
								x1: hexCx - sPx / 2,
								y1: dimS,
								x2: hexCx + sPx / 2,
								y2: dimS,
								markerStart: "url(#boltArrow)",
								markerEnd: "url(#boltArrow)"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						className: tx("s"),
						x: hexCx,
						y: dimS + 16,
						textAnchor: "middle",
						children: sLabel
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "line ghost",
					cx: hexCx,
					cy: hexCy,
					r: dPx / 2
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					className: "muted",
					x: hexCx,
					y: hexCy + dPx / 2 + 22,
					textAnchor: "middle",
					children: "Head not in dataset"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: on("P"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							className: "line",
							d: `M ${profileX} ${rootY} L ${profileX + pW / 2} ${crestY} L ${profileX + pW} ${rootY}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "ext",
							x1: profileX,
							y1: rootY + 4,
							x2: profileX,
							y2: dimP + 5
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "ext",
							x1: profileX + pW,
							y1: rootY + 4,
							x2: profileX + pW,
							y2: dimP + 5
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "dim",
							x1: profileX,
							y1: dimP,
							x2: profileX + pW,
							y2: dimP,
							markerStart: "url(#boltArrow)",
							markerEnd: "url(#boltArrow)"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					className: tx("P"),
					x: profileX + pW / 2,
					y: crestY - 8,
					textAnchor: "middle",
					children: "60°"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
					className: tx("P"),
					x: profileX + pW + 12,
					y: dimP + 4,
					children: ["P ", props.pitchText]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "drawingCaption",
			children: "Orthographic elevation, head end view and basic profile. Dimension lines sit outside the part. Thread on the bolt is the simplified form (outline plus minor lines), not crossing diagonals. L is the length under the head. b is the threaded length. Enter both and the thread is drawn to b/L. Proportions follow d, s and k. Not a fabrication drawing."
		})]
	});
}
function hexPoints(cx, cy, acrossFlats) {
	const radius = acrossFlats / Math.sqrt(3);
	const pts = [];
	for (let i = 0; i < 6; i++) {
		const angle = (30 + i * 60) * Math.PI / 180;
		pts.push(`${cx + radius * Math.cos(angle)},${cy - radius * Math.sin(angle)}`);
	}
	return pts.join(" ");
}
/**
* ISO 273 nominal clearance holes: fine, medium, coarse.
* Nominal diameters only. H12 / H13 / H14 are the tolerance grades named by the standard;
* the limit deviations are not copied here.
* Sources agree on these nominals (ISO 273 as republished in workshop charts). Not a scan of the ISO PDF.
*/
var ISO_273 = {
	3: {
		fine: 3.2,
		medium: 3.4,
		coarse: 3.6
	},
	4: {
		fine: 4.3,
		medium: 4.5,
		coarse: 4.8
	},
	5: {
		fine: 5.3,
		medium: 5.5,
		coarse: 5.8
	},
	6: {
		fine: 6.4,
		medium: 6.6,
		coarse: 7
	},
	7: {
		fine: 7.4,
		medium: 7.6,
		coarse: 8
	},
	8: {
		fine: 8.4,
		medium: 9,
		coarse: 10
	},
	10: {
		fine: 10.5,
		medium: 11,
		coarse: 12
	},
	12: {
		fine: 13,
		medium: 13.5,
		coarse: 14.5
	},
	14: {
		fine: 15,
		medium: 15.5,
		coarse: 16.5
	},
	16: {
		fine: 17,
		medium: 17.5,
		coarse: 18.5
	},
	18: {
		fine: 19,
		medium: 20,
		coarse: 21
	},
	20: {
		fine: 21,
		medium: 22,
		coarse: 24
	},
	22: {
		fine: 23,
		medium: 24,
		coarse: 26
	},
	24: {
		fine: 25,
		medium: 26,
		coarse: 28
	},
	27: {
		fine: 28,
		medium: 30,
		coarse: 32
	},
	30: {
		fine: 31,
		medium: 33,
		coarse: 35
	},
	33: {
		fine: 34,
		medium: 36,
		coarse: 38
	},
	36: {
		fine: 37,
		medium: 39,
		coarse: 42
	},
	39: {
		fine: 40,
		medium: 42,
		coarse: 45
	},
	42: {
		fine: 43,
		medium: 45,
		coarse: 48
	},
	45: {
		fine: 46,
		medium: 48,
		coarse: 52
	},
	48: {
		fine: 50,
		medium: 52,
		coarse: 56
	},
	52: {
		fine: 54,
		medium: 56,
		coarse: 62
	},
	56: {
		fine: 58,
		medium: 62,
		coarse: 66
	},
	60: {
		fine: 62,
		medium: 66,
		coarse: 70
	},
	64: {
		fine: 66,
		medium: 70,
		coarse: 74
	}
};
var CLEARANCE_NOTE = "ISO 273 nominal clearance hole for the bolt diameter. Fine is the close series, medium is the normal series, coarse is the large series. Pitch does not change the clearance hole. Tolerance limits and countersink or counterbore sizes are not in this dataset.";
function clearanceHoles(dMm) {
	const row = ISO_273[dMm];
	if (!row) return null;
	return {
		...row,
		source: "ISO 273 nominal"
	};
}
var BSP_TPI = [
	{
		nominal: "1/8",
		tpi: 28
	},
	{
		nominal: "1/4",
		tpi: 19
	},
	{
		nominal: "3/8",
		tpi: 19
	},
	{
		nominal: "1/2",
		tpi: 14
	},
	{
		nominal: "3/4",
		tpi: 14
	},
	{
		nominal: "1",
		tpi: 11
	},
	{
		nominal: "1-1/4",
		tpi: 11
	},
	{
		nominal: "1-1/2",
		tpi: 11
	},
	{
		nominal: "2",
		tpi: 11
	}
];
var NPT_TPI = [
	{
		nominal: "1/8",
		tpi: 27
	},
	{
		nominal: "1/4",
		tpi: 18
	},
	{
		nominal: "3/8",
		tpi: 18
	},
	{
		nominal: "1/2",
		tpi: 14
	},
	{
		nominal: "3/4",
		tpi: 14
	},
	{
		nominal: "1",
		tpi: 11.5
	},
	{
		nominal: "1-1/4",
		tpi: 11.5
	},
	{
		nominal: "1-1/2",
		tpi: 11.5
	},
	{
		nominal: "2",
		tpi: 11.5
	}
];
function bsp(family) {
	const tapered = family === "BSPT";
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
		standard: tapered ? "ISO 7-1" : "ISO 228-1"
	}));
}
var PIPE_THREADS = [
	...NPT_TPI.map((row) => ({
		id: `NPT-${row.nominal}`,
		family: "NPT",
		nominal: row.nominal,
		tpi: row.tpi,
		angleDeg: 60,
		tapered: true,
		taper: "1:16 on diameter",
		externalName: "NPT external",
		internalName: "NPT internal",
		seal: "On the threads, usually with sealant",
		standard: "ASME B1.20.1"
	})),
	...bsp("BSPT"),
	...bsp("BSPP")
];
var PIPE_WARNING = "NPT, BSPT and BSPP are not the same thread. A matching nominal size is not enough. NPT is 60° and tapered. BSPT is 55° and tapered. BSPP (G) is 55° and parallel and does not seal on the thread. Gauge-plane diameters and pipe tap drills are not in this dataset.";
var SQRT3 = Math.sqrt(3);
/**
* ISO 68-1 basic 60° profile and the ISO 898-1 tensile stress area.
* Calculated. Not a copy of the ISO 724 size table.
*/
function threadProfile(d, P) {
	if (!(d > 0)) throw new Error("Bolt diameter must be greater than zero.");
	if (!(P > 0)) throw new Error("Pitch must be greater than zero.");
	const H = SQRT3 / 2 * P;
	const d2 = d - 3 / 8 * SQRT3 * P;
	const d1 = d - 5 / 8 * SQRT3 * P;
	const d3 = d1 - H / 6;
	const dm = (d2 + d3) / 2;
	const area = (dia) => Math.PI / 4 * dia * dia;
	return {
		d,
		P,
		H,
		d2,
		d1,
		d3,
		depth: 5 / 8 * H,
		Ao: area(d),
		As: area(dm),
		Ar: area(d1),
		angleDeg: 60
	};
}
function threadsPerInch(Pmm) {
	return 25.4 / Pmm;
}
/** Fraction of the ISO 68-1 major-to-basic-minor height. 1 is the basic minor diameter. */
function tapDrill(dMm, pitchMm, percent) {
	if (!(percent > 0) || percent > 100) throw new Error("Thread percentage must be between 0 and 100.");
	const profile = threadProfile(dMm, pitchMm);
	const full = profile.d - profile.d1;
	return {
		drillMm: profile.d - percent / 100 * full,
		basicMinorMm: profile.d1,
		shopEstimateMm: profile.d - profile.P,
		percent,
		note: "Calculated from the basic profile. Percent is the fraction of (d − d1), not a US percentage-of-thread chart and not a stock-drill list. d − P is the common shop estimate, shown separately."
	};
}
/**
* Length of engagement that balances bolt tension against internal-thread shear.
* Shear area taken as 0.5 π d Le. Shear strength taken as 0.5 × fu of the tapped part.
* Calculated estimate. Not a standard minimum.
*/
function engagementLength(asMm2, dMm, fuBolt, fuInternal) {
	if (!(asMm2 > 0) || !(dMm > 0) || !(fuBolt > 0) || !(fuInternal > 0)) throw new Error("Engagement needs a positive area, diameter and both strengths.");
	return {
		lengthMm: 4 * asMm2 * fuBolt / (Math.PI * dMm * fuInternal),
		ruleOfThumbMm: dMm,
		note: "Calculated for equal strength on the assumptions above. A shop rule of thumb is about one diameter in steel into steel. Neither replaces the tapped-part standard."
	};
}
function drawingCallout(dMm, pitchMm, mediumHole) {
	const size = `${trim(dMm)} × ${trim(pitchMm)}`;
	return {
		external: `M${size} — 6g`,
		internal: `M${size} — 6H`,
		clearance: mediumHole == null ? null : `Ø${trim(mediumHole)} THRU`,
		note: "6g and 6H are the usual ISO 965 general-purpose classes. Limit deviations are not calculated. The hole line is a plain diameter note, not a company drafting standard. Coarse threads may also be written without the pitch; the pitch is kept here so a fine thread is not lost."
	};
}
function trim(n) {
	return String(Math.round(n * 1e3) / 1e3);
}
function DrillPanel({ sheet }) {
	const [percent, setPercent] = (0, import_react.useState)("75");
	const [fuInternal, setFuInternal] = (0, import_react.useState)("");
	const [family, setFamily] = (0, import_react.useState)("");
	const [pipeId, setPipeId] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)("");
	const profile = sheet.profile;
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "failBanner",
		children: "No thread geometry for this selection."
	});
	const pct = Number(percent);
	let drill = null;
	let drillError = "";
	try {
		if (percent.trim()) drill = tapDrill(sheet.dMm, sheet.pitchMm, pct);
	} catch (error) {
		drillError = error instanceof Error ? error.message : "Invalid percentage.";
	}
	const holes = clearanceHoles(sheet.dMm);
	const callout = drawingCallout(sheet.dMm, sheet.pitchMm, holes?.medium ?? null);
	const fuBolt = sheet.band?.fu ?? null;
	const fuTap = fuInternal.trim() ? Number(fuInternal) : fuBolt;
	let engagement = null;
	let engagementError = "";
	if (fuBolt && fuTap && Number.isFinite(fuTap)) try {
		engagement = engagementLength(profile.As, sheet.dMm, fuBolt, fuTap);
	} catch (error) {
		engagementError = error instanceof Error ? error.message : "Invalid engagement.";
	}
	const pipes = PIPE_THREADS.filter((item) => item.family === family);
	const pipe = pipes.find((item) => item.id === pipeId) ?? null;
	async function copy(text) {
		await navigator.clipboard.writeText(text);
		setCopied(text);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: "External thread is the bolt. Internal thread is the tapped hole. Clearance holes are for the bolt to pass through, not to be tapped."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Designation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
					"M",
					trimNum(sheet.dMm, 3),
					" × ",
					trimNum(sheet.pitchMm, 3)
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Major d" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(profile.d, 3), " mm"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pitch" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(profile.P, 3), " mm"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pitch diameter d2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(profile.d2, 3), " mm"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Basic minor d1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(profile.d1, 3), " mm"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Series" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: sheet.series })] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "field",
			style: { marginTop: 12 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Thread height to aim for — %" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "toolField",
					inputMode: "decimal",
					value: percent,
					onChange: (e) => setPercent(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "100% meets the basic minor diameter. 75% is a common workshop aim. This is calculated, not a drill chart." })
			]
		}),
		drillError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: drillError
		}) : null,
		drill ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Calculated drill" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(drill.drillMm, 2), " mm"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shop estimate d − P" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(drill.shopEstimateMm, 2), " mm"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Basic minor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(drill.basicMinorMm, 2), " mm"] })] })
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [drill?.note, " Use the nearest drill you hold. This list is not rounded to a stock drill."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			style: { marginTop: 16 },
			children: "Clearance holes"
		}),
		holes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Close — fine series" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
					"Ø",
					trimNum(holes.fine, 1),
					" mm"
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Normal — medium series" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
					"Ø",
					trimNum(holes.medium, 1),
					" mm"
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Large — coarse series" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
					"Ø",
					trimNum(holes.coarse, 1),
					" mm"
				] })] })
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: "No ISO 273 nominal for this diameter. Inch clearance holes are not in this dataset."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [CLEARANCE_NOTE, " Countersink and counterbore sizes are not in this dataset."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			style: { marginTop: 16 },
			children: "Engagement"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "field",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tapped-part tensile strength — MPa" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "toolField",
					inputMode: "decimal",
					value: fuInternal,
					placeholder: fuBolt ? `Blank uses the bolt, ${fuBolt}` : "Not available",
					onChange: (e) => setFuInternal(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Leave blank to assume the tapped part matches the bolt. Steel into aluminium needs the aluminium strength, not the bolt." })
			]
		}),
		engagementError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: engagementError
		}) : null,
		engagement ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Calculated length" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(engagement.lengthMm, 1), " mm"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rule of thumb, steel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(engagement.ruleOfThumbMm, 1), " mm"] })] })]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "No bolt tensile strength, so the calculated length is not returned. The one-diameter rule of thumb is still only a rule of thumb."
		}),
		engagement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: engagement.note
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			style: { marginTop: 16 },
			children: "Drawing callout"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "External" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: callout.external })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tapped hole" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: callout.internal })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Clearance, medium" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: callout.clearance ?? "—" })] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "toolToolbar",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "toolBtn ghost",
					type: "button",
					onClick: () => void copy(callout.internal),
					children: "COPY TAPPED HOLE"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "toolBtn ghost",
					type: "button",
					onClick: () => void copy(callout.external),
					children: "COPY EXTERNAL"
				}),
				callout.clearance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "toolBtn ghost",
					type: "button",
					onClick: () => void copy(callout.clearance),
					children: "COPY HOLE"
				}) : null
			]
		}),
		copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: ["Copied ", copied]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: callout.note
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			style: { marginTop: 16 },
			children: "Pipe threads"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: PIPE_WARNING
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fieldGrid compact",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Family" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "toolSelect",
					value: family,
					onChange: (e) => {
						setFamily(e.target.value);
						setPipeId("");
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "NPT",
							children: "NPT — tapered, 60°"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "BSPT",
							children: "BSPT — tapered, 55°"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "BSPP",
							children: "BSPP / G — parallel, 55°"
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "field",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nominal size" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "toolSelect",
					value: pipeId,
					onChange: (e) => setPipeId(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Select"
					}), pipes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: item.id,
						children: [
							item.nominal,
							" — ",
							item.tpi,
							" TPI"
						]
					}, item.id))]
				})]
			})]
		}),
		pipe ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Standard" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pipe.standard })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Angle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [pipe.angleDeg, "°"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Form" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pipe.taper })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "External" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pipe.externalName })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Internal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pipe.internalName })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sealing" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pipe.seal })] })
			]
		}) : null
	] });
}
/**
* One SVG section through a lap joint. Labels stay in the margins.
* Heavy arrows are applied actions. Thin arrows are dimensions.
*/
function JointSketch({ hot, threadPlanes, shankPlanes, endOn }) {
	const on = (id) => hot === id ? "hot" : "";
	const mode = threadPlanes + shankPlanes >= 2 ? "double" : shankPlanes > 0 && threadPlanes === 0 ? "shank" : "thread";
	const threadAtJoint = mode !== "shank";
	const g = mode === "double" ? doubleGeom() : singleGeom();
	const thread = threadSpan(mode, threadPlanes, shankPlanes, g);
	const aeText = endOn ? "ae" : "ae NOT CHECKED";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "drawingFrame jointFrame",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			className: "jointSvg",
			viewBox: "0 0 660 520",
			role: "img",
			"aria-label": "Section through a bolted lap joint",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("marker", {
					id: "jLoad",
					viewBox: "0 0 12 12",
					refX: "11",
					refY: "6",
					markerWidth: "9",
					markerHeight: "9",
					orient: "auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 0.4 L12 6 L0 11.6 Z",
						fill: "#111"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("marker", {
					id: "jDim",
					viewBox: "0 0 10 10",
					refX: "9",
					refY: "5",
					markerWidth: "6.5",
					markerHeight: "6.5",
					orient: "auto-start-reverse",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 1.4 L9 5 L0 8.6 Z",
						fill: "#111"
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					className: "cap",
					x: "12",
					y: "22",
					children: mode === "double" ? "TWO SHEAR PLANES — NOT TO SCALE" : "SINGLE SHEAR LAP — NOT TO SCALE"
				}),
				g.plates.map((plate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hatch, {
					id: plate.id,
					box: plate,
					holeL: g.holeL,
					holeR: g.holeR,
					hot: on("t")
				}, plate.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: on("d"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							className: "bolt",
							d: nutPath(g.nut)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							className: "bolt",
							d: headPath(g.head)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shank, {
							xL: g.shankL,
							xR: g.shankR,
							y0: g.head.y + g.head.h,
							y1: g.nut.y + g.nut.h - 4,
							thread0: thread.y0,
							thread1: thread.y1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "center",
							x1: g.cx,
							y1: g.head.y + 10,
							x2: g.cx,
							y2: g.nut.y + g.nut.h - 8
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					className: on(threadAtJoint ? "nn" : "nx"),
					children: g.shears.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "shear",
						x1: g.shearL,
						y1: y,
						x2: g.shearR,
						y2: y
					}, y))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: `action ${on("V")}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: g.vTop.x2,
							y1: g.vTop.y,
							x2: g.vTop.x1,
							y2: g.vTop.y,
							markerEnd: "url(#jLoad)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: g.vTop.labelX,
							y: g.vTop.labelY,
							children: "V*"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: g.vBot.x1,
							y1: g.vBot.y,
							x2: g.vBot.x2,
							y2: g.vBot.y,
							markerEnd: "url(#jLoad)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: g.vBot.labelX,
							y: g.vBot.labelY,
							children: "V*"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: `action ${on("N")}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: g.cx,
							y1: g.head.y - 6,
							x2: g.cx,
							y2: 30,
							markerEnd: "url(#jLoad)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: g.cx + 12,
							y: 46,
							children: "N*"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: g.nDownX,
							y1: g.nut.y + g.nut.h + 10,
							x2: g.nDownX,
							y2: g.nut.y + g.nut.h + 52,
							markerEnd: "url(#jLoad)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: g.nDownX - 28,
							y: g.nut.y + g.nut.h + 40,
							children: "N*"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: on("t"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "witness",
							x1: g.plates[0].x,
							y1: g.plates[0].y + 3,
							x2: g.tX + 8,
							y2: g.plates[0].y + 3
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "witness",
							x1: g.plates[0].x,
							y1: g.plates[0].y + g.plates[0].h - 3,
							x2: g.tX + 8,
							y2: g.plates[0].y + g.plates[0].h - 3
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "dim",
							x1: g.tX,
							y1: g.plates[0].y + 8,
							x2: g.tX,
							y2: g.plates[0].y + g.plates[0].h - 8,
							markerStart: "url(#jDim)",
							markerEnd: "url(#jDim)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: g.tX - 16,
							y: (g.plates[0].y + g.plates[0].y + g.plates[0].h) / 2 + 4,
							children: "t"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: on("lj"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "witness",
							x1: g.lj.x1,
							y1: g.lj.y0,
							x2: g.lj.x1,
							y2: g.lj.y - 8
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "witness",
							x1: g.lj.x2,
							y1: g.lj.y0,
							x2: g.lj.x2,
							y2: g.lj.y - 8
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "tick",
							x1: g.lj.x2,
							y1: g.lj.tick0,
							x2: g.lj.x2,
							y2: g.lj.tick1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "dim",
							x1: g.lj.x1 + 4,
							y1: g.lj.y,
							x2: g.lj.x2 - 4,
							y2: g.lj.y,
							markerStart: "url(#jDim)",
							markerEnd: "url(#jDim)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: (g.lj.x1 + g.lj.x2) / 2 - 8,
							y: g.lj.y - 8,
							children: "lj"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: on("ae"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "witness",
							x1: g.cx,
							y1: g.ae.break0,
							x2: g.cx,
							y2: g.ae.break1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "witness",
							x1: g.cx,
							y1: g.ae.break2,
							x2: g.cx,
							y2: g.ae.y - 8
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "witness",
							x1: g.ae.x2,
							y1: g.ae.y0,
							x2: g.ae.x2,
							y2: g.ae.y - 8
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "dim",
							x1: g.cx + 4,
							y1: g.ae.y,
							x2: g.ae.x2 - 4,
							y2: g.ae.y,
							markerStart: "url(#jDim)",
							markerEnd: "url(#jDim)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: (g.cx + g.ae.x2) / 2 - aeText.length * 4.2,
							y: g.ae.y - 10,
							children: aeText
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 12,
					y: 96,
					text: "PLATE 1",
					x2: g.plates[0].x + 28,
					y2: g.plates[0].y + 4,
					hot: on("t")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 12,
					y: g.shears[0] + 4,
					text: "INTERFACE",
					x2: g.plates[0].x - 4,
					y2: g.shears[0],
					hot: on(threadAtJoint ? "nn" : "nx")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 12,
					y: thread.labelY,
					text: thread.label,
					x2: thread.x2,
					y2: thread.y2,
					kneeX: thread.kneeX,
					kneeY: thread.kneeY,
					hot: on(thread.hot)
				}),
				thread.plainLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 12,
					y: thread.plainY,
					text: "PLAIN SHANK",
					x2: g.shankL,
					y2: thread.plainTarget,
					hot: on("nx")
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 12,
					y: g.nut.y + 22,
					text: "NUT",
					x2: g.nut.x,
					y2: g.nut.y + 16,
					hot: on("d")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 548,
					y: 78,
					text: "HEAD",
					x2: g.head.x + g.head.w,
					y2: g.head.y + 18,
					hot: on("d")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 548,
					y: g.shears[0] - 14,
					text: "HOLE",
					x2: g.holeR,
					y2: g.shears[0] - 10,
					hot: on("d")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 548,
					y: g.shears[0] + 18,
					text: g.shears.length > 1 ? "SHEAR PLANES" : "SHEAR PLANE",
					x2: g.shearR,
					y2: g.shears[0],
					hot: on(threadAtJoint ? "nn" : "nx")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leader, {
					x: 548,
					y: g.plates[1].y + g.plates[1].h / 2 + 4,
					text: "PLATE 2",
					x2: g.plates[1].x + g.plates[1].w,
					y2: g.plates[1].y + g.plates[1].h / 2,
					hot: on("t")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					className: "cap",
					x: "12",
					y: "508",
					children: "HEAVY ARROW = APPLIED ACTION    THIN ARROW = DIMENSION"
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "caseRow",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Case, {
				title: "Thread in shear",
				on: mode === "thread"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Case, {
				title: "Shank in shear",
				on: mode === "shank"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Case, {
				title: "Two planes",
				on: mode === "double"
			})
		]
	})] });
}
function singleGeom() {
	const p1 = {
		id: "p1",
		x: 188,
		y: 104,
		w: 236,
		h: 52
	};
	const p2 = {
		id: "p2",
		x: 300,
		y: 196,
		w: 246,
		h: 52
	};
	const p1b = p1.y + p1.h;
	const p2b = p2.y + p2.h;
	const holeL = 352;
	const holeR = 408;
	const shankL = 364;
	const shankR = 396;
	const cx = 380;
	const head = {
		x: 338,
		y: 56,
		w: 84,
		h: 48
	};
	const nut = {
		x: 346,
		y: p2b,
		w: 68,
		h: 36
	};
	const shear = (p1b + p2.y) / 2;
	return {
		plates: [p1, p2],
		holeL,
		holeR,
		shankL,
		shankR,
		cx,
		head,
		nut,
		shears: [shear],
		shearL: p1.x + 8,
		shearR: p2.x + p2.w - 36,
		tX: 170,
		vTop: {
			x1: p1.x + 8,
			x2: head.x - 24,
			y: head.y + 28,
			labelX: p1.x + 36,
			labelY: head.y + 20
		},
		vBot: {
			x1: nut.x + nut.w + 16,
			x2: p2.x + p2.w - 16,
			y: p2b + 18,
			labelX: nut.x + nut.w + 28,
			labelY: p2b + 10
		},
		nDownX: p2.x - 28,
		lj: {
			x1: p2.x,
			x2: p1.x + p1.w,
			y: 368,
			y0: p2b + 8,
			tick0: p1b + 2,
			tick1: p2.y - 2
		},
		ae: {
			x2: p2.x + p2.w,
			y: 448,
			y0: p2b + 8,
			break0: nut.y + nut.h + 8,
			break1: 352,
			break2: 384
		}
	};
}
function doubleGeom() {
	return {
		plates: [
			{
				id: "p1",
				x: 188,
				y: 96,
				w: 220,
				h: 42
			},
			{
				id: "p2",
				x: 300,
				y: 158,
				w: 246,
				h: 64
			},
			{
				id: "p3",
				x: 188,
				y: 242,
				w: 220,
				h: 42
			}
		],
		holeL: 352,
		holeR: 408,
		shankL: 364,
		shankR: 396,
		cx: 380,
		head: {
			x: 338,
			y: 52,
			w: 84,
			h: 44
		},
		nut: {
			x: 346,
			y: 284,
			w: 68,
			h: 32
		},
		shears: [148, 232],
		shearL: 200,
		shearR: 520,
		tX: 170,
		vTop: {
			x1: 196,
			x2: 310,
			y: 78,
			labelX: 236,
			labelY: 70
		},
		vBot: {
			x1: 440,
			x2: 530,
			y: 308,
			labelX: 468,
			labelY: 300
		},
		nDownX: 292,
		lj: {
			x1: 300,
			x2: 408,
			y: 410,
			y0: 292,
			tick0: 138,
			tick1: 154
		},
		ae: {
			x2: 546,
			y: 488,
			y0: 292,
			break0: 324,
			break1: 396,
			break2: 424
		}
	};
}
function threadSpan(mode, nn, nx, g) {
	const gripTop = g.head.y + g.head.h + 8;
	const nutTop = g.nut.y + 4;
	const nutBot = g.nut.y + g.nut.h - 8;
	if (mode === "shank") return {
		y0: nutTop,
		y1: nutBot,
		label: "PLAIN SHANK",
		labelY: 236,
		x2: g.shankL,
		y2: g.shears[0] + 10,
		kneeX: 176,
		kneeY: g.shears[0] + 10,
		hot: "nx",
		plainLabel: false,
		plainY: 0,
		plainTarget: 0
	};
	if (mode === "double" && nn > 0 && nx > 0) return {
		y0: gripTop,
		y1: g.shears[1] - 16,
		label: "THREADED PORTION",
		labelY: 214,
		x2: g.shankL,
		y2: g.shears[0] + 10,
		kneeX: 176,
		kneeY: g.shears[0] + 10,
		hot: "nn",
		plainLabel: true,
		plainY: g.shears[1] - 2,
		plainTarget: g.shears[1] - 8
	};
	return {
		y0: gripTop,
		y1: nutBot,
		label: "THREADED PORTION",
		labelY: mode === "double" ? 214 : 236,
		x2: g.shankL,
		y2: g.shears[0] + 10,
		kneeX: 176,
		kneeY: g.shears[0] + 10,
		hot: "nn",
		plainLabel: false,
		plainY: 0,
		plainTarget: 0
	};
}
function headPath(h) {
	return `M ${h.x} ${h.y + 8} L ${h.x + 8} ${h.y} H ${h.x + h.w - 8} L ${h.x + h.w} ${h.y + 8} V ${h.y + h.h} H ${h.x} Z`;
}
function nutPath(n) {
	return `M ${n.x} ${n.y} H ${n.x + n.w} L ${n.x + n.w - 8} ${n.y + n.h} H ${n.x + 8} Z`;
}
function platePath(b, holeL, holeR) {
	const x2 = b.x + b.w;
	const y2 = b.y + b.h;
	return `M ${b.x} ${b.y} H ${x2} V ${y2} H ${b.x} Z M ${holeL} ${b.y} H ${holeR} V ${y2} H ${holeL} Z`;
}
function Hatch({ id, box, holeL, holeR, hot }) {
	const d = platePath(box, holeL, holeR);
	const lines = [];
	for (let i = -box.h; i < box.w + box.h; i += 8) lines.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: box.x + i,
		y1: box.y,
		x2: box.x + i - box.h,
		y2: box.y + box.h
	}, i));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: hot,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
				id,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d,
					fillRule: "evenodd"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				className: "plate",
				d,
				fillRule: "evenodd"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				className: "hatch",
				clipPath: `url(#${id})`,
				children: lines
			})
		]
	});
}
function Shank({ xL, xR, y0, y1, thread0, thread1 }) {
	const depth = 5;
	const t0 = Math.max(y0, Math.min(thread0, y1));
	const t1 = Math.max(t0, Math.min(thread1, y1));
	const crests = [];
	for (let y = t0; y < t1 - 2; y += 10) {
		const yb = Math.min(y + 10, t1);
		const mid = (y + yb) / 2;
		crests.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			className: "bolt",
			d: `M ${xL + depth} ${y} L ${xL} ${mid} L ${xL + depth} ${yb} Z`
		}, `L${y}`));
		crests.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			className: "bolt",
			d: `M ${xR - depth} ${y} L ${xR} ${mid} L ${xR - depth} ${yb} Z`
		}, `R${y}`));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		t0 > y0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			className: "bolt",
			x: xL,
			y: y0,
			width: xR - xL,
			height: t0 - y0
		}) : null,
		t1 > t0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			className: "bolt",
			x: xL + depth,
			y: t0,
			width: xR - xL - 10,
			height: t1 - t0
		}) : null,
		crests,
		y1 > t1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			className: "bolt",
			x: xL,
			y: t1,
			width: xR - xL,
			height: y1 - t1
		}) : null
	] });
}
function Leader({ x, y, text, x2, y2, hot, kneeX, kneeY }) {
	const width = text.length * 8.6;
	const startX = x2 >= x + width ? x + width + 8 : x - 8;
	const startY = y - 4;
	const points = kneeX == null ? `${startX},${startY} ${x2},${y2}` : `${startX},${startY} ${kneeX},${kneeY ?? startY} ${x2},${y2}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: hot,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				className: "leader",
				points
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				className: "dot",
				cx: x2,
				cy: y2,
				r: "2.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x,
				y,
				children: text
			})
		]
	});
}
function Case({ title, on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: on ? "caseChip on" : "caseChip",
		children: title
	});
}
/** Order-of-magnitude nut factors. Not a test of a coating or a lubricant brand. */
var FRICTION_PRESETS = [
	{
		id: "dry",
		label: "Dry / as-received",
		k: .2,
		note: "Textbook dry or as-received order of magnitude."
	},
	{
		id: "oiled",
		label: "Lightly oiled",
		k: .18,
		note: "Textbook light-oil order of magnitude."
	},
	{
		id: "machine-oil",
		label: "Machine oil",
		k: .15,
		note: "Textbook oiled order of magnitude."
	},
	{
		id: "antiseize",
		label: "Anti-seize",
		k: .12,
		note: "Often lower. Brand data governs."
	},
	{
		id: "moly",
		label: "Molybdenum lubricant",
		k: .12,
		note: "Often lower. Do not reuse a dry K."
	},
	{
		id: "zinc",
		label: "Zinc plated",
		k: .2,
		note: "Plating alone is not a lubricant specification."
	},
	{
		id: "hdg",
		label: "Hot-dip galvanised",
		k: .25,
		note: "Often higher, and over-tapping of the nut matters."
	},
	{
		id: "ss-dry",
		label: "Stainless, dry",
		k: .3,
		note: "Galling risk. A dry stainless K is a poor installation plan."
	},
	{
		id: "ss-lube",
		label: "Stainless, lubricated",
		k: .16,
		note: "Still an estimate. Use the lubricant maker's data."
	},
	{
		id: "user",
		label: "User-defined",
		k: null,
		note: "No coefficient is assumed."
	}
];
var TORQUE_WARNING = "This is an estimated preload from torque, not a verified bolt tension. Friction takes most of the torque. Coating, lubricant, finish, reuse, the nut and the washer can move the result by a large amount. For a controlled joint, use the manufacturer or a tested procedure.";
function finite(n) {
	return n != null && Number.isFinite(n);
}
function boltTorque(input) {
	if (!(input.dMm > 0) || !(input.pitchMm > 0) || !(input.d2Mm > 0) || !(input.asMm2 > 0)) return {
		ok: false,
		reason: "Diameter, pitch and stress area are required."
	};
	if (!(input.basisMPa > 0)) return {
		ok: false,
		reason: "No proof or yield-related stress is available for this bolt."
	};
	if (input.percent != null && (!(input.percent > 0) || input.percent > 100)) return {
		ok: false,
		reason: "Preload percentage must be greater than 0 and at most 100."
	};
	if (input.k != null && !(input.k > 0)) return {
		ok: false,
		reason: "Nut factor K must be greater than zero."
	};
	if (input.manualKn != null && !(input.manualKn > 0)) return {
		ok: false,
		reason: "Target preload must be greater than zero."
	};
	if (input.torqueNm != null && !(input.torqueNm > 0)) return {
		ok: false,
		reason: "Torque must be greater than zero."
	};
	const proofKn = input.basisMPa * input.asMm2 / 1e3;
	const steps = [{
		label: input.basisName,
		equation: "Proof or reference load = stress × As",
		substitution: `${input.basisMPa} MPa × ${input.asMm2.toFixed(2)} mm²`,
		result: `${proofKn.toFixed(2)} kN`
	}];
	const fromPercentKn = input.percent == null ? null : input.percent / 100 * proofKn;
	if (fromPercentKn != null && input.percent != null) steps.push({
		label: "Target from percent",
		equation: "F = (percent / 100) × proof load",
		substitution: `${input.percent}% × ${proofKn.toFixed(2)} kN`,
		result: `${fromPercentKn.toFixed(2)} kN`
	});
	const targetKn = input.manualKn ?? fromPercentKn;
	let torqueFromPreloadNm = null;
	if (targetKn != null && finite(input.k)) {
		const forceN = targetKn * 1e3;
		torqueFromPreloadNm = input.k * forceN * input.dMm / 1e3;
		steps.push({
			label: "T from preload",
			equation: "T = K × F × d",
			substitution: `${input.k} × ${forceN.toFixed(0)} N × ${input.dMm} mm / 1000`,
			result: `${torqueFromPreloadNm.toFixed(2)} N·m`
		});
	}
	let fromTorqueKn = null;
	if (finite(input.torqueNm) && finite(input.k)) {
		fromTorqueKn = input.torqueNm * 1e3 / (input.k * input.dMm) / 1e3;
		steps.push({
			label: "F from torque",
			equation: "F = T / (K × d)",
			substitution: `${input.torqueNm} N·m / (${input.k} × ${input.dMm} mm)`,
			result: `${fromTorqueKn.toFixed(2)} kN`
		});
	}
	const referenceKn = input.manualKn ?? fromPercentKn ?? fromTorqueKn;
	const percentOfProof = referenceKn == null ? null : referenceKn / proofKn * 100;
	let threadNm = null;
	let bearingNm = null;
	let advancedNm = null;
	let kFromAdvanced = null;
	if (input.muThread != null || input.muBearing != null || input.bearingOdMm != null || input.bearingIdMm != null) {
		if (!finite(input.muThread) || !finite(input.muBearing) || !(input.muThread > 0) || !(input.muBearing > 0) || input.muThread >= 1 || input.muBearing >= 1) return {
			ok: false,
			reason: "Thread and bearing friction must each be greater than 0 and less than 1."
		};
		if (!finite(input.bearingOdMm) || !finite(input.bearingIdMm) || !(input.bearingOdMm > input.bearingIdMm)) return {
			ok: false,
			reason: "Bearing outside diameter must be greater than the inside diameter. Nothing is assumed for the washer."
		};
		if (referenceKn == null) return {
			ok: false,
			reason: "The split torque needs a target preload first."
		};
		const forceN = referenceKn * 1e3;
		const lambda = Math.atan(input.pitchMm / (Math.PI * input.d2Mm));
		const rho = Math.atan(input.muThread / Math.cos(Math.PI / 6));
		threadNm = forceN * (input.d2Mm / 2) * Math.tan(lambda + rho) / 1e3;
		bearingNm = forceN * input.muBearing * ((input.bearingOdMm + input.bearingIdMm) / 4) / 1e3;
		advancedNm = threadNm + bearingNm;
		kFromAdvanced = advancedNm / (forceN * input.dMm / 1e3);
		steps.push({
			label: "Thread torque",
			equation: "T_thread = F × (d2/2) × tan(λ + ρ′), tan λ = P/(π d2), tan ρ′ = μ_th/cos 30°",
			substitution: `F = ${forceN.toFixed(0)} N, d2 = ${input.d2Mm.toFixed(3)} mm, μ_th = ${input.muThread}`,
			result: `${threadNm.toFixed(2)} N·m`
		}, {
			label: "Bearing torque",
			equation: "T_bearing = F × μ_b × (OD + ID) / 4",
			substitution: `μ_b = ${input.muBearing}, OD = ${input.bearingOdMm} mm, ID = ${input.bearingIdMm} mm`,
			result: `${bearingNm.toFixed(2)} N·m`
		});
	}
	return {
		ok: true,
		proofKn,
		fromPercentKn,
		fromTorqueKn,
		torqueFromPreloadNm,
		percentOfProof,
		threadNm,
		bearingNm,
		advancedNm,
		kFromAdvanced,
		steps
	};
}
var PERCENTS = [
	50,
	60,
	70,
	75,
	80,
	90
];
function TorquePanel({ sheet, classId }) {
	const [preset, setPreset] = (0, import_react.useState)("user");
	const [kText, setKText] = (0, import_react.useState)("");
	const [percent, setPercent] = (0, import_react.useState)("70");
	const [manual, setManual] = (0, import_react.useState)("");
	const [torque, setTorque] = (0, import_react.useState)("");
	const [muT, setMuT] = (0, import_react.useState)("");
	const [muB, setMuB] = (0, import_react.useState)("");
	const [od, setOd] = (0, import_react.useState)("");
	const [id, setId] = (0, import_react.useState)("");
	const [stainless, setStainless] = (0, import_react.useState)("");
	const profile = sheet.profile;
	const chosen = STAINLESS_CLASSES.find((item) => item.id === stainless);
	const basisMPa = chosen ? chosen.rp : sheet.band?.sp ?? 0;
	const basisName = chosen ? `${chosen.id} Rp0.2` : "Proof stress Sp";
	const parsed = (0, import_react.useMemo)(() => {
		if (!profile || !(basisMPa > 0)) return {
			ok: false,
			reason: "No stress area or proof stress for this bolt."
		};
		return boltTorque({
			dMm: sheet.dMm,
			pitchMm: sheet.pitchMm,
			d2Mm: profile.d2,
			asMm2: profile.As,
			basisMPa,
			basisName,
			percent: numOrNull(percent),
			manualKn: numOrNull(manual),
			k: numOrNull(kText),
			torqueNm: numOrNull(torque),
			muThread: numOrNull(muT),
			muBearing: numOrNull(muB),
			bearingOdMm: numOrNull(od),
			bearingIdMm: numOrNull(id)
		});
	}, [
		profile,
		sheet.dMm,
		sheet.pitchMm,
		basisMPa,
		basisName,
		percent,
		manual,
		kText,
		torque,
		muT,
		muB,
		od,
		id
	]);
	function pickPreset(id) {
		setPreset(id);
		const item = FRICTION_PRESETS.find((row) => row.id === id);
		setKText(item?.k == null ? "" : String(item.k));
	}
	const activePreset = FRICTION_PRESETS.find((item) => item.id === preset);
	const rows = METRIC_SIZES.filter((size) => size.d <= 30 || size.d === sheet.dMm);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: TORQUE_WARNING
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: "Proof load, yield and tensile strength are different. A percentage is not a recommendation. Carbon-steel class properties are not applied to a stainless fastener."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fieldGrid compact",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Installation condition" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "toolSelect",
							value: preset,
							onChange: (e) => pickPreset(e.target.value),
							children: FRICTION_PRESETS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.id,
								children: item.label
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [activePreset?.note, " The value below is what is actually used. Edit it."] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nut factor K" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "toolField",
							inputMode: "decimal",
							value: kText,
							onChange: (e) => setKText(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "T = K × F × d. K is not hidden." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Percent of proof load" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "toolSelect",
						value: percent,
						onChange: (e) => setPercent(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Not used"
						}), PERCENTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: item,
							children: [item, "%"]
						}, item))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Or target preload — kN" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "toolField",
							inputMode: "decimal",
							value: manual,
							onChange: (e) => setManual(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "If you type a preload, it replaces the percentage." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Installation torque — N·m" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "toolField",
							inputMode: "decimal",
							value: torque,
							onChange: (e) => setTorque(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "With K, this estimates preload. It does not verify tension." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stainless basis, optional" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "toolSelect",
							value: stainless,
							onChange: (e) => setStainless(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Use this bolt's proof stress"
							}), STAINLESS_CLASSES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: item.id,
								children: [
									item.id,
									" — Rp0.2 ",
									item.rp,
									" MPa"
								]
							}, item.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Reference only. It does not change the AS 4100 check." })
					]
				})
			]
		}),
		!parsed.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: parsed.reason
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			style: { marginTop: 12 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: basisName }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trimNum(parsed.proofKn, 2), " kN"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Preload from percent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: parsed.fromPercentKn == null ? "—" : `${trimNum(parsed.fromPercentKn, 2)} kN` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Torque from that preload" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: parsed.torqueFromPreloadNm == null ? "Enter K" : `${trimNum(parsed.torqueFromPreloadNm, 1)} N·m` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Preload from the torque" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: parsed.fromTorqueKn == null ? "Enter torque and K" : `${trimNum(parsed.fromTorqueKn, 2)} kN` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "That preload / proof" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: parsed.percentOfProof == null ? "—" : `${trimNum(parsed.percentOfProof, 1)}%` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Thread torque" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: parsed.threadNm == null ? "Needs μ and washer diameters" : `${trimNum(parsed.threadNm, 1)} N·m` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bearing torque" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: parsed.bearingNm == null ? "—" : `${trimNum(parsed.bearingNm, 1)} N·m` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Split total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: parsed.advancedNm == null ? "—" : `${trimNum(parsed.advancedNm, 1)} N·m` })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "K implied by the split" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: parsed.kFromAdvanced == null ? "—" : trimNum(parsed.kFromAdvanced, 3) })] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
			className: "toolGloss",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "SPLIT THE TORQUE — THREAD AND BEARING" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "inner",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "toolNote",
					style: { marginTop: 0 },
					children: "No washer is assumed. Enter both friction coefficients and the face that actually rubs. The installation condition does not fill these."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "fieldGrid compact",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "μ thread" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "toolField",
								inputMode: "decimal",
								value: muT,
								onChange: (e) => setMuT(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "μ bearing" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "toolField",
								inputMode: "decimal",
								value: muB,
								onChange: (e) => setMuB(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bearing outside — mm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "toolField",
								inputMode: "decimal",
								value: od,
								onChange: (e) => setOd(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bearing inside — mm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "toolField",
								inputMode: "decimal",
								value: id,
								onChange: (e) => setId(e.target.value)
							})]
						})
					]
				})]
			})]
		}),
		parsed.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
			className: "toolGloss",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "SHOW THE ARITHMETIC" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "inner",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "toolTableWrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "toolTable",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Step" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Equation" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Substitution" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Result" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: parsed.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.label }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.equation }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.substitution }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.result })
						] }, step.label)) })]
					})
				})
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			style: { marginTop: 16 },
			children: "Coarse sizes at this K and percent"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: [
				"Calculated for metric coarse pitch and ",
				basisName,
				". K = ",
				kText.trim() || "not set",
				". Percent = ",
				percent || "not set",
				". Not a published torque chart."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Bolt" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "As mm²" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Proof kN" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Preload kN" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Torque N·m" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((size) => {
					const band = chosen ? { sp: chosen.rp } : classBand(classId, size.d);
					if (!band) return null;
					const thread = threadProfile(size.d, size.coarse);
					const result = boltTorque({
						dMm: size.d,
						pitchMm: size.coarse,
						d2Mm: thread.d2,
						asMm2: thread.As,
						basisMPa: band.sp,
						basisName,
						percent: numOrNull(percent),
						manualKn: null,
						k: numOrNull(kText),
						torqueNm: null,
						muThread: null,
						muBearing: null,
						bearingOdMm: null,
						bearingIdMm: null
					});
					if (!result.ok) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: size.d === sheet.dMm ? "active" : "",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
								"M",
								size.d,
								" × ",
								size.coarse
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: trimNum(thread.As, 1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: trimNum(result.proofKn, 1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: result.fromPercentKn == null ? "—" : trimNum(result.fromPercentKn, 1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: result.torqueFromPreloadNm == null ? "—" : trimNum(result.torqueFromPreloadNm, 1) })
						]
					}, size.d);
				}) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "Structural installation methods — tension-control bolts, direct tension indicators, turn-of-nut — belong to the bolting standard and the project specification. They are not this torque estimate, and they are not mixed with an ordinary machine-bolt K."
		})
	] });
}
function numOrNull(raw) {
	if (!raw.trim()) return null;
	const n = Number(raw);
	return Number.isFinite(n) ? n : null;
}
function areas(d, P) {
	const profile = threadProfile(d, P);
	return {
		...profile,
		shearShank: profile.Ao,
		shearThread: profile.As
	};
}
var AREA_NOTE = "Shank shear uses the nominal area Ao = πd²/4. Thread shear in the AS 4100 check uses tensile stress area As, matching IQ-CAL-002. The basic minor area Ar is shown as geometry and is not substituted for As. Some readings of AS 4100 use a core area instead — confirm the edition you are designing to.";
var AS4100_CLASSES = /* @__PURE__ */ new Set([
	"4.6",
	"8.8",
	"10.9"
]);
/** kr = min(1, max(0.75, 1.075 − lj/4000)), lj in mm. Commonly published AS 4100 lap reduction. */
function lapFactor(ljMm) {
	if (!Number.isFinite(ljMm) || ljMm < 0) throw new Error("Lap length lj cannot be negative.");
	return Math.min(1, Math.max(.75, 1.075 - ljMm / 4e3));
}
function count(n, label) {
	if (!Number.isInteger(n) || n < 0 || n > 6) throw new Error(`${label} must be an integer from 0 to 6.`);
	return n;
}
function boltCapacity(input) {
	if (!input.allowDesign) return {
		ok: false,
		reason: "Outside implemented standard scope — no design result returned."
	};
	if (!AS4100_CLASSES.has(input.classId)) return {
		ok: false,
		reason: "Outside implemented AS 4100 scope — no design result returned."
	};
	let nn;
	let nx;
	try {
		nn = count(input.nn, "Threaded shear planes nn");
		nx = count(input.nx, "Shank shear planes nx");
	} catch (error) {
		return {
			ok: false,
			reason: error instanceof Error ? error.message : "Invalid shear planes."
		};
	}
	const band = classBand(input.classId, input.dMm);
	if (!band) return {
		ok: false,
		reason: "This combination is not contained in the current verified dataset."
	};
	let profile;
	try {
		profile = areas(input.dMm, input.pitchMm);
	} catch (error) {
		return {
			ok: false,
			reason: error instanceof Error ? error.message : "Invalid geometry."
		};
	}
	const kr = input.ljMm == null ? 1 : lapFactor(input.ljMm);
	const krd = input.classId === "10.9" && nn > 0 ? .83 : 1;
	const phi = .8;
	const phiNtf_kN = phi * (profile.As * band.fu) / 1e3;
	const phiVf_kN = phi * (.62 * band.fu * krd * kr * (nn * profile.As + nx * profile.Ao)) / 1e3;
	const steps = [
		{
			id: "fu",
			label: "fuf",
			equation: "fuf from the ISO 898-1 nominal minimum for this class and diameter",
			substitution: `class ${input.classId}, d = ${input.dMm} mm`,
			result: `${band.fu} MPa`,
			clause: "AS 4100 takes fuf from the bolt standard. fy and proof stress are not used here."
		},
		{
			id: "as",
			label: "As",
			equation: "As = π/4 ((d2 + d3)/2)²",
			substitution: `d = ${input.dMm} mm, P = ${input.pitchMm} mm`,
			result: `${profile.As.toFixed(2)} mm²`,
			clause: "Tensile stress area, calculated"
		},
		{
			id: "ntf",
			label: "φNtf",
			equation: "φNtf = φ fu As",
			substitution: `0.80 × ${band.fu} × ${profile.As.toFixed(2)} / 1000`,
			result: `${phiNtf_kN.toFixed(3)} kN`,
			clause: "AS 4100 bolt in tension. φ = 0.80."
		},
		{
			id: "kr",
			label: "kr",
			equation: "kr = min(1.0, max(0.75, 1.075 − lj/4000))",
			substitution: input.ljMm == null ? "lj not entered — kr taken as 1.0" : `lj = ${input.ljMm} mm`,
			result: kr.toFixed(3),
			clause: "AS 4100 lap-length reduction, commonly published form. Confirm the clause."
		},
		{
			id: "krd",
			label: "krd",
			equation: "krd = 0.83 for 10.9 with threads in a shear plane, otherwise 1.0",
			substitution: `class ${input.classId}, nn = ${nn}`,
			result: krd.toFixed(2),
			clause: "Implemented for 10.9 only. Not taken from another standard's factor set."
		},
		{
			id: "vf",
			label: "φVf",
			equation: "φVf = φ × 0.62 × fu × krd × kr × (nn As + nx Ao)",
			substitution: `0.80 × 0.62 × ${band.fu} × ${krd} × ${kr.toFixed(3)} × (${nn} × ${profile.As.toFixed(2)} + ${nx} × ${profile.Ao.toFixed(2)}) / 1000`,
			result: `${phiVf_kN.toFixed(3)} kN`,
			clause: "AS 4100 bolt in shear as implemented. Thread plane uses As, shank plane uses Ao."
		}
	];
	let phiVb_kN = null;
	if ((input.tpMm != null || input.fupMPa != null || input.aeMm != null) && (input.tpMm == null || input.fupMPa == null)) steps.push({
		id: "ply",
		label: "φVb",
		equation: "φVb = φp min(3.2 df tp fup, ae tp fup)",
		substitution: "tp and fup are both required",
		result: "not returned",
		clause: "Ply bearing inputs are incomplete — no bearing result returned."
	});
	else if (input.tpMm != null && input.fupMPa != null) {
		if (!(input.tpMm > 0) || !(input.fupMPa > 0)) return {
			ok: false,
			reason: "Ply thickness and fup must be greater than zero."
		};
		const crush_N = 3.2 * input.dMm * input.tpMm * input.fupMPa;
		let govern_N = crush_N;
		let sub = `crush 3.2 × ${input.dMm} × ${input.tpMm} × ${input.fupMPa}`;
		if (input.aeMm != null) {
			if (!(input.aeMm > 0)) return {
				ok: false,
				reason: "ae must be greater than zero."
			};
			const tear_N = input.aeMm * input.tpMm * input.fupMPa;
			govern_N = Math.min(crush_N, tear_N);
			sub += `; tear-out ${input.aeMm} × ${input.tpMm} × ${input.fupMPa}`;
		}
		phiVb_kN = .9 * govern_N / 1e3;
		steps.push({
			id: "ply",
			label: "φVb",
			equation: "φp = 0.90; Vb = min(3.2 df tp fup, ae tp fup)",
			substitution: sub + (input.aeMm == null ? "; ae not entered — tear-out not checked" : ""),
			result: `${phiVb_kN.toFixed(3)} kN`,
			clause: "AS 4100 ply bearing. ae is the term in ae tp fup as your edition defines it. φp is not the bolt factor."
		});
	}
	const utilN = input.nStar_kN == null ? null : input.nStar_kN / phiNtf_kN;
	const utilV = input.vStar_kN == null || phiVf_kN === 0 ? null : input.vStar_kN / phiVf_kN;
	const utilPly = input.vStar_kN == null || phiVb_kN == null || phiVb_kN === 0 ? null : input.vStar_kN / phiVb_kN;
	let utilInteract = null;
	if (input.nStar_kN != null && input.vStar_kN != null && phiNtf_kN > 0 && phiVf_kN > 0) {
		utilInteract = (input.nStar_kN / phiNtf_kN) ** 2 + (input.vStar_kN / phiVf_kN) ** 2;
		steps.push({
			id: "interact",
			label: "η",
			equation: "(N* / φNtf)² + (V* / φVf)²",
			substitution: `(${input.nStar_kN} / ${phiNtf_kN.toFixed(3)})² + (${input.vStar_kN} / ${phiVf_kN.toFixed(3)})²`,
			result: utilInteract.toFixed(3),
			clause: "AS 4100 bearing-type shear plus tension interaction. TF slip is not this check."
		});
	}
	const candidates = [];
	if (utilN != null) candidates.push({
		name: "tension",
		value: utilN
	});
	if (utilV != null) candidates.push({
		name: "bolt shear",
		value: utilV
	});
	if (utilPly != null) candidates.push({
		name: "ply bearing",
		value: utilPly
	});
	if (utilInteract != null) candidates.push({
		name: "interaction",
		value: utilInteract
	});
	const governing = candidates.length === 0 ? "No applied action — capacities only." : candidates.reduce((a, b) => b.value > a.value ? b : a).name;
	return {
		ok: true,
		steps,
		phi,
		fu: band.fu,
		fy: band.fy,
		sp: band.sp,
		kr,
		krd,
		phiNtf_kN,
		phiVf_kN,
		phiVb_kN,
		utilN,
		utilV,
		utilPly,
		utilInteract,
		governing
	};
}
function optionalNumber(raw) {
	if (!raw.trim()) return null;
	return parseStrictNumber(raw);
}
var STEEL_DENSITY = 7850;
/** Approximate machined volume. Head is a regular hex prism. Thread underfill is ignored. */
function approximateBoltMass(dMm, lengthMm, hex, qty) {
	if (!(qty > 0) || !Number.isInteger(qty)) return {
		boltKg: null,
		reason: "Quantity must be a positive integer.",
		density: STEEL_DENSITY
	};
	if (!(lengthMm > 0)) return {
		boltKg: null,
		reason: "Enter a bolt length to calculate mass.",
		density: STEEL_DENSITY
	};
	if (!hex) return {
		boltKg: null,
		reason: "Head dimensions are not in the verified dataset — bolt mass is not estimated.",
		density: STEEL_DENSITY
	};
	return {
		boltKg: (Math.PI / 4 * (dMm / 1e3) ** 2 * (lengthMm / 1e3) + Math.sqrt(3) / 2 * (hex.s / 1e3) ** 2 * (hex.k / 1e3)) * STEEL_DENSITY * qty,
		reason: "Approximate calculated mass at 7850 kg/m³. Shank is taken as full diameter over the whole length. Thread underfill, nut and washer are not included. Not a catalogue mass.",
		density: STEEL_DENSITY
	};
}
var DEFAULT_SELECTION = {
	standardId: "iso-metric",
	sizeLabel: "M20",
	pitchMm: 2.5,
	classId: "8.8"
};
function pitchOptions(standard, sizeLabel) {
	if (standard.system === "metric") {
		const size = metricSizesFor(standard).find((item) => metricLabel(item.d) === sizeLabel);
		if (!size) return [];
		const options = [{
			pitchMm: size.coarse,
			label: `${size.coarse} coarse`,
			series: "coarse"
		}];
		for (const pitch of size.fine) options.push({
			pitchMm: pitch,
			label: `${pitch} fine`,
			series: "fine"
		});
		return options;
	}
	const size = unifiedSizesFor(standard).find((item) => item.label === sizeLabel);
	if (!size || !standard.series) return [];
	const tpi = size[standard.series];
	if (tpi == null) return [];
	return [{
		pitchMm: 25.4 / tpi,
		label: `${tpi} TPI`,
		series: standard.series
	}];
}
function sizeLabels(standard) {
	if (standard.system === "metric") return metricSizesFor(standard).map((size) => metricLabel(size.d));
	return unifiedSizesFor(standard).map((size) => size.label);
}
function classOptions(standard, dMm) {
	return classesFor(standard).filter((id) => classBand(id, dMm) != null);
}
function diameterOf(standard, sizeLabel) {
	if (standard.system === "metric") return metricSizesFor(standard).find((item) => metricLabel(item.d) === sizeLabel)?.d ?? null;
	const size = unifiedSizesFor(standard).find((item) => item.label === sizeLabel);
	return size ? size.inch * 25.4 : null;
}
function clampSelection(partial) {
	const standard = standardById(partial.standardId);
	if (!standard) return { error: "This combination is not contained in the current verified dataset." };
	const labels = sizeLabels(standard);
	const sizeLabel = labels.includes(partial.sizeLabel) ? partial.sizeLabel : labels[0];
	if (!sizeLabel) return { error: "This combination is not contained in the current verified dataset." };
	const pitches = pitchOptions(standard, sizeLabel);
	const pitch = pitches.find((item) => Math.abs(item.pitchMm - partial.pitchMm) < 1e-6) ?? pitches[0];
	if (!pitch) return { error: "This combination is not contained in the current verified dataset." };
	const d = diameterOf(standard, sizeLabel);
	if (d == null) return { error: "This combination is not contained in the current verified dataset." };
	const classes = classOptions(standard, d);
	const classId = classes.includes(partial.classId) ? partial.classId : classes[0] ?? "";
	return {
		standardId: standard.id,
		sizeLabel,
		pitchMm: pitch.pitchMm,
		classId
	};
}
function selectionFromQuery(query, fallback = DEFAULT_SELECTION) {
	if (!query.matched) return { error: "No bolt matched that search." };
	const standardId = query.standardId ?? fallback.standardId;
	const standard = standardById(standardId);
	if (!standard) return { error: "This combination is not contained in the current verified dataset." };
	if (query.system && query.system !== standard.system && query.standardId == null) return { error: "This combination is not contained in the current verified dataset." };
	return clampSelection({
		standardId,
		sizeLabel: query.sizeLabel ?? fallback.sizeLabel,
		pitchMm: query.pitchMm ?? fallback.pitchMm,
		classId: query.classId ?? fallback.classId
	});
}
function selectionFromSlug(slug) {
	const text = decodeURIComponent(slug).replace(/-/g, " ");
	return selectionFromQuery(parseBoltQuery(text));
}
function readOptional(raw, label) {
	try {
		return {
			value: optionalNumber(raw),
			error: null
		};
	} catch (error) {
		return {
			value: null,
			error: error instanceof Error ? `${label}: ${error.message}` : `${label} is invalid.`
		};
	}
}
function buildSheet(input) {
	const standard = standardById(input.standardId);
	const empty = {
		error: "This combination is not contained in the current verified dataset.",
		title: "—",
		subtitle: "",
		standardName: standard?.name ?? "—",
		standardNote: standard?.note ?? "",
		dMm: 0,
		pitchMm: 0,
		series: "",
		designation: "—",
		profile: null,
		tpi: null,
		band: null,
		classNote: null,
		hex: null,
		holeNote: null,
		holeMm: null,
		capacity: null,
		massKg: null,
		massEachG: null,
		massNote: "",
		gripMm: null,
		gripNote: "",
		areaNote: AREA_NOTE,
		profileProvenance: PROFILE_PROVENANCE,
		classProvenance: CLASS_PROVENANCE,
		hexProvenance: HEX_PROVENANCE
	};
	if (!standard) return empty;
	const dMm = diameterOf(standard, input.sizeLabel);
	const pitch = pitchOptions(standard, input.sizeLabel).find((item) => Math.abs(item.pitchMm - input.pitchMm) < 1e-6);
	if (dMm == null || !pitch) return empty;
	let profile;
	try {
		profile = areas(dMm, pitch.pitchMm);
	} catch (error) {
		return {
			...empty,
			error: error instanceof Error ? error.message : "Invalid geometry."
		};
	}
	const band = input.classId ? classBand(input.classId, dMm) : null;
	const cls = classById(input.classId);
	const metricSize = standard.system === "metric" ? metricSizesFor(standard).find((item) => metricLabel(item.d) === input.sizeLabel) : void 0;
	const hex = metricSize?.hex ? {
		...metricSize.hex,
		e: metricSize.hex.s / Math.cos(Math.PI / 6)
	} : null;
	const classLabel = band ? input.classId : "";
	const designation = standard.system === "metric" ? `${input.sizeLabel} × ${trimPitch(pitch.pitchMm)}${classLabel ? ` — ${classLabel}` : ""}` : `${input.sizeLabel}-${standard.series ? unifiedTpi(standard, input.sizeLabel) : ""} ${standard.series?.toUpperCase() ?? ""}`;
	const hole = standard.system === "metric" ? {
		holeMm: dMm + (dMm <= 24 ? 2 : 3),
		holeNote: "Indicative fabrication allowance only — not an AS 4100 table extract. Commonly d+2 mm up to 24 mm and d+3 mm above. Confirm the hole table before a drawing. Oversize and slot are not in this dataset."
	} : {
		holeMm: null,
		holeNote: "Inch clearance holes are not in the verified dataset."
	};
	const length = readOptional(input.lengthMm, "Length");
	const threaded = readOptional(input.threadedMm, "Threaded length");
	const nn = readOptional(input.nn, "nn");
	const nx = readOptional(input.nx, "nx");
	const lj = readOptional(input.lj, "lj");
	const nStar = readOptional(input.nStar, "N*");
	const vStar = readOptional(input.vStar, "V*");
	const tp = readOptional(input.tp, "tp");
	const fup = readOptional(input.fup, "fup");
	const ae = readOptional(input.ae, "ae");
	const qty = readOptional(input.qty, "Quantity");
	const fieldError = [
		length,
		threaded,
		nn,
		nx,
		lj,
		nStar,
		vStar,
		tp,
		fup,
		ae,
		qty
	].find((item) => item.error)?.error ?? null;
	let gripMm = null;
	let gripNote = "Threaded length b is tabulated by the product standard for each nominal length and is not embedded. Enter b to subtract it from L.";
	if (length.value != null && threaded.value != null) {
		if (threaded.value > length.value) gripNote = "Threaded length cannot exceed bolt length.";
		else if (!(length.value > 0) || !(threaded.value >= 0)) gripNote = "Length must be greater than zero.";
		else {
			gripMm = length.value - threaded.value;
			gripNote = "Calculated grip = L − b. b is an entered value, not a standard table.";
		}
	}
	let capacity = null;
	if (!fieldError && band && (nn.value != null || input.nn.trim() === "")) {
		const nnN = nn.value ?? 1;
		const nxN = nx.value ?? 0;
		try {
			capacity = boltCapacity({
				dMm,
				pitchMm: pitch.pitchMm,
				classId: input.classId,
				allowDesign: standard.design === "as4100" && !!band,
				nn: nnN,
				nx: nxN,
				ljMm: lj.value,
				nStar_kN: nStar.value,
				vStar_kN: vStar.value,
				tpMm: tp.value,
				fupMPa: fup.value,
				aeMm: ae.value
			});
		} catch (error) {
			capacity = {
				ok: false,
				reason: error instanceof Error ? error.message : "Capacity failed."
			};
		}
	} else if (!band) capacity = {
		ok: false,
		reason: "Required standard data unavailable. Property class is not in this dataset for the selected standard."
	};
	let massKg = null;
	let massEachG = null;
	let massNote = "Nut and washer mass are not calculated — those dimensions are not in the verified dataset.";
	if (length.error) massNote = length.error;
	else if (qty.error) massNote = qty.error;
	else {
		const mass = approximateBoltMass(dMm, length.value ?? 0, hex ?? void 0, qty.value == null ? 1 : qty.value);
		massKg = mass.boltKg;
		massEachG = mass.boltKg != null && qty.value ? mass.boltKg / qty.value * 1e3 : mass.boltKg != null ? mass.boltKg * 1e3 : null;
		massNote = mass.reason;
	}
	return {
		error: fieldError,
		title: designation,
		subtitle: pitch.series,
		standardName: standard.name,
		standardNote: standard.note,
		dMm,
		pitchMm: pitch.pitchMm,
		series: pitch.series,
		designation,
		profile,
		tpi: threadsPerInch(pitch.pitchMm),
		band,
		classNote: cls?.note ?? null,
		hex,
		holeMm: hole.holeMm,
		holeNote: hole.holeNote,
		capacity,
		massKg,
		massEachG,
		massNote,
		gripMm,
		gripNote,
		areaNote: AREA_NOTE,
		profileProvenance: PROFILE_PROVENANCE,
		classProvenance: CLASS_PROVENANCE,
		hexProvenance: HEX_PROVENANCE
	};
}
function trimPitch(pitch) {
	return String(Math.round(pitch * 1e3) / 1e3);
}
function unifiedTpi(standard, sizeLabel) {
	const size = unifiedSizesFor(standard).find((item) => item.label === sizeLabel);
	if (!size || !standard.series) return null;
	return size[standard.series] ?? null;
}
function shareSlug(selection) {
	const standard = standardById(selection.standardId);
	const coarse = standard?.system === "metric" ? metricSizesFor(standard).find((item) => metricLabel(item.d) === selection.sizeLabel)?.coarse : void 0;
	const pitchPart = coarse != null && Math.abs(coarse - selection.pitchMm) < 1e-6 ? "" : `x${trimPitch(selection.pitchMm)}`;
	const cls = selection.classId ? `-${selection.classId}` : "";
	return `${selection.sizeLabel}${pitchPart}${cls}`;
}
var TABS = [
	"OVERVIEW",
	"GEOMETRY",
	"THREAD",
	"DRILL / TAP",
	"AREAS",
	"MATERIAL",
	"PRELOAD / TORQUE",
	"MASS",
	"SOURCE"
];
var BLANK = {
	lengthMm: "",
	threadedMm: "",
	nn: "1",
	nx: "0",
	lj: "",
	nStar: "",
	vStar: "",
	tp: "",
	fup: "",
	ae: "",
	qty: "1"
};
function BoltTool({ start, query }) {
	const [sel, setSel] = (0, import_react.useState)(start);
	const [fields, setFields] = (0, import_react.useState)(BLANK);
	const [tab, setTab] = (0, import_react.useState)("OVERVIEW");
	const [hot, setHot] = (0, import_react.useState)(null);
	const [compare, setCompare] = (0, import_react.useState)([]);
	const [copied, setCopied] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setSel(start);
		if (query?.focus === "areas") setTab("AREAS");
		else if (query?.focus === "material") setTab("MATERIAL");
		else if (query?.focus === "mass") setTab("MASS");
		else if (query?.focus === "thread") setTab("THREAD");
		else if (query?.focus === "geometry") setTab("GEOMETRY");
	}, [start, query]);
	const standard = standardById(sel.standardId) ?? STANDARDS[0];
	const sizes = sizeLabels(standard);
	const pitches = pitchOptions(standard, sel.sizeLabel);
	const dForClass = standard.system === "metric" ? Number(sel.sizeLabel.replace("M", "")) : 25.4;
	const classes = classOptions(standard, Number.isFinite(dForClass) ? dForClass : 20);
	const sheet = (0, import_react.useMemo)(() => buildSheet({
		...sel,
		...fields
	}), [sel, fields]);
	function patch(partial) {
		const next = {
			...sel,
			...partial
		};
		const std = standardById(next.standardId);
		if (!std) return;
		const labels = sizeLabels(std);
		if (!labels.includes(next.sizeLabel)) next.sizeLabel = labels[0] ?? next.sizeLabel;
		const opts = pitchOptions(std, next.sizeLabel);
		if (!opts.some((item) => Math.abs(item.pitchMm - next.pitchMm) < 1e-6)) next.pitchMm = opts[0]?.pitchMm ?? next.pitchMm;
		const allowed = classOptions(std, std.system === "metric" ? Number(next.sizeLabel.slice(1)) : 20);
		if (!allowed.includes(next.classId)) next.classId = allowed[0] ?? "";
		setSel(next);
	}
	function setField(key, value) {
		setFields((prev) => ({
			...prev,
			[key]: value
		}));
	}
	async function copyLink() {
		const slug = shareSlug(sel);
		const url = `${window.location.origin}/bolts/${encodeURIComponent(slug)}`;
		try {
			await navigator.clipboard.writeText(url);
			setCopied("Link copied");
		} catch {
			setCopied(url);
		}
	}
	function onTabKey(event) {
		if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
		event.preventDefault();
		const index = TABS.indexOf(tab);
		const item = TABS[event.key === "ArrowRight" ? (index + 1) % TABS.length : (index - 1 + TABS.length) % TABS.length];
		if (item) setTab(item);
	}
	const lengthMm = enteredMm(fields.lengthMm);
	const threadMm = enteredMm(fields.threadedMm);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "titleBlock",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "tbLogo",
					children: "IQEG"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tbMid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tbKicker",
						children: "IQEG REFERENCE LAB"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "tbName",
						children: sheet.designation
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tbMeta",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "IQ-REF-001" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "REV 0 · INDICATIVE" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NOT A CERTIFICATE" })
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "toolToolbar noPrint",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "toolBtn ghost",
					type: "button",
					onClick: () => window.print(),
					children: "PRINT SHEET"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "toolBtn ghost",
					type: "button",
					onClick: () => void copyLink(),
					children: "COPY LINK"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "toolBtn ghost",
					type: "button",
					disabled: compare.length >= 4,
					onClick: () => setCompare((prev) => prev.length >= 4 ? prev : [...prev, sel]),
					children: "ADD TO COMPARE"
				}),
				copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "toolNote",
					children: copied
				}) : null
			]
		}),
		sheet.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: sheet.error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bench",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "benchMain",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "toolPanel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Selection" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "STANDARD" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "toolSelect",
								value: sel.standardId,
								onChange: (e) => patch({ standardId: e.target.value }),
								children: STANDARDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: item.id,
									children: [
										item.family,
										" — ",
										item.name
									]
								}, item.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "fieldGrid compact",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SIZE" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "toolSelect",
										value: sel.sizeLabel,
										onChange: (e) => patch({ sizeLabel: e.target.value }),
										children: sizes.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: label }, label))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PITCH" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "toolSelect",
										value: String(sel.pitchMm),
										onChange: (e) => patch({ pitchMm: Number(e.target.value) }),
										children: pitches.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: item.pitchMm,
											children: item.label
										}, item.label))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PROPERTY CLASS" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "toolSelect",
										value: sel.classId,
										onChange: (e) => patch({ classId: e.target.value }),
										children: [classes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Not in dataset"
										}) : null, classes.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: id }, id))]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "fieldGrid compact",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
									label: "Length L — mm",
									value: fields.lengthMm,
									onChange: (v) => setField("lengthMm", v),
									hot: "L",
									setHot
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
									label: "Thread length b — mm",
									value: fields.threadedMm,
									onChange: (v) => setField("threadedMm", v),
									hot: "b",
									setHot
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
									label: "Quantity",
									value: fields.qty,
									onChange: (v) => setField("qty", v)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "toolNote",
							children: "L is under the head. b is the threaded part of L. Leave both blank if you only need the size. Quantity is for the mass total only."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckPanel, {
					placement: "diagram",
					sheet,
					fields,
					setField,
					standardName: standard.name,
					hot,
					setHot
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "benchSide",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "toolPanel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "toolTabs",
						role: "tablist",
						onKeyDown: onTabKey,
						children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": tab === item,
							className: tab === item ? "on" : "",
							onClick: () => setTab(item),
							children: item
						}, item))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBody, {
						tab,
						sheet,
						hot,
						setHot,
						classIds: classesFor(standard),
						classId: sel.classId
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckPanel, {
					placement: "fields",
					sheet,
					fields,
					setField,
					standardName: standard.name,
					hot,
					setHot
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "toolPanel",
			style: { marginTop: 14 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Figure" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "toolNote",
					style: { marginTop: 0 },
					children: "Identification only. Head sizes are typical, not the standard minimum and maximum."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "figureRow figureFixed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoltDiagram, {
						hot,
						dText: sheet.profile ? `${trimNum(sheet.dMm, 3)} mm` : "—",
						pitchText: sheet.profile ? `${trimNum(sheet.pitchMm, 3)} mm` : "—",
						kText: sheet.hex ? `${trimNum(sheet.hex.k, 2)} mm` : null,
						sText: sheet.hex ? `${trimNum(sheet.hex.s, 2)} mm` : null,
						lengthText: lengthMm == null ? null : `${trimNum(lengthMm, 2)} mm`,
						threadText: threadMm == null ? null : `${trimNum(threadMm, 2)} mm`,
						dMm: sheet.dMm,
						kMm: sheet.hex?.k ?? null,
						sMm: sheet.hex?.s ?? null,
						minorMm: sheet.profile?.d1 ?? null,
						lengthMm,
						threadMm
					}), sheet.profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "resultList",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								label: "d",
								value: `${trimNum(sheet.dMm, 3)} mm`,
								dim: "d",
								hot,
								setHot
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								label: "P",
								value: `${trimNum(sheet.pitchMm, 3)} mm`,
								dim: "P",
								hot,
								setHot
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								label: "As",
								value: `${trimNum(sheet.profile.As, 1)} mm²`,
								dim: "As",
								hot,
								setHot
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								label: "s across flats",
								value: sheet.hex ? `${trimNum(sheet.hex.s, 2)} mm` : "—",
								dim: "s",
								hot,
								setHot
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								label: "k head height",
								value: sheet.hex ? `${trimNum(sheet.hex.k, 2)} mm` : "—",
								dim: "k",
								hot,
								setHot
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								label: "fy",
								value: sheet.band ? `${sheet.band.fy} MPa` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								label: "fu",
								value: sheet.band ? `${sheet.band.fu} MPa` : "—"
							})
						]
					}) : null]
				})
			]
		}),
		compare.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compare, {
			rows: compare,
			onClear: () => setCompare([]),
			fields
		}) : null
	] });
}
function enteredMm(raw) {
	if (!raw.trim()) return null;
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) return null;
	return n;
}
function Num({ label, value, onChange, hot, setHot, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "field",
		onMouseEnter: () => hot && setHot?.(hot),
		onMouseLeave: () => setHot?.(null),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "toolField",
				inputMode: "decimal",
				value,
				onFocus: () => hot && setHot?.(hot),
				onBlur: () => setHot?.(null),
				onChange: (e) => onChange(e.target.value)
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: hint }) : null
		]
	});
}
function CheckPanel({ placement, sheet, fields, setField, standardName, hot, setHot }) {
	const cap = sheet.capacity;
	const threadPlanes = Number(fields.nn);
	const shankPlanes = Number(fields.nx);
	if (placement === "diagram") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "toolPanel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Joint" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JointSketch, {
			hot,
			threadPlanes: Number.isFinite(threadPlanes) ? threadPlanes : 0,
			shankPlanes: Number.isFinite(shankPlanes) ? shankPlanes : 0,
			endOn: fields.ae.trim() !== ""
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "toolPanel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "AS 4100 check" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "toolNote",
				style: { marginTop: 0 },
				children: "Bearing-type bolt only — not a friction-grip slip check, and not a certificate. Hover a field. The joint on the left marks that part. Classes 4.6, 8.8 and 10.9 only."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fieldGrid compact",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Applied tension N* — kN",
						value: fields.nStar,
						onChange: (v) => setField("nStar", v),
						hint: "Design tension on this one bolt. Not the capacity.",
						hot: "N",
						setHot
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Applied shear V* — kN",
						value: fields.vStar,
						onChange: (v) => setField("vStar", v),
						hint: "Design shear on this one bolt.",
						hot: "V",
						setHot
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Shear planes in the thread",
						value: fields.nn,
						onChange: (v) => setField("nn", v),
						hint: "A single lap with the nut on the thread is usually 1.",
						hot: "nn",
						setHot
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Shear planes in the shank",
						value: fields.nx,
						onChange: (v) => setField("nx", v),
						hint: "Same single lap is usually 0. Use 1 only if the cut is on the plain shank.",
						hot: "nx",
						setHot
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Lap length — mm",
						value: fields.lj,
						onChange: (v) => setField("lj", v),
						hint: "First shear plane to last. Blank means no reduction. Past 300 mm the shear capacity drops.",
						hot: "lj",
						setHot
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "toolGloss",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "PLATE IN FRONT OF THE BOLT" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inner",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "toolNote",
						style: { marginTop: 0 },
						children: "Skip this unless you are checking the ply. Thickness and plate tensile strength are both required. End distance is optional. If ae is blank, tear-out is not checked."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "fieldGrid compact",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
								label: "Plate thickness — mm",
								value: fields.tp,
								onChange: (v) => setField("tp", v),
								hint: "tp of the ply being crushed.",
								hot: "t",
								setHot
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
								label: "Plate tensile strength — MPa",
								value: fields.fup,
								onChange: (v) => setField("fup", v),
								hint: "fup of that ply, not the bolt."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
								label: "End distance ae — mm",
								value: fields.ae,
								onChange: (v) => setField("ae", v),
								hint: "The distance your edition puts in ae × tp × fup. Blank skips tear-out.",
								hot: "ae",
								setHot
							})
						]
					})]
				})]
			}),
			!cap || !cap.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "failBanner",
				style: { marginTop: 12 },
				children: cap && !cap.ok && cap.reason.includes("Outside implemented") ? `${standardName} has no AS 4100 check on this sheet. The geometry above is still valid. Use ISO metric, AS 1110, AS 1111, AS 1252 or the AS 4100 context, class 4.6, 8.8 or 10.9.` : cap && !cap.ok ? cap.reason : "No design result for this combination."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "resultList",
					style: { marginTop: 12 },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Tension capacity φNtf",
							value: `${trimNum(cap.phiNtf_kN, 2)} kN`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Shear capacity φVf",
							value: `${trimNum(cap.phiVf_kN, 2)} kN`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Plate capacity φVb",
							value: cap.phiVb_kN == null ? "not checked" : `${trimNum(cap.phiVb_kN, 2)} kN`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Tension used",
							value: cap.utilN == null ? "no N* entered" : `${trimNum(cap.utilN * 100, 1)}%`,
							fail: cap.utilN != null && cap.utilN > 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Bolt shear used",
							value: cap.utilV == null ? "no V* entered" : `${trimNum(cap.utilV * 100, 1)}%`,
							fail: cap.utilV != null && cap.utilV > 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Plate used",
							value: cap.utilPly == null ? "—" : `${trimNum(cap.utilPly * 100, 1)}%`,
							fail: cap.utilPly != null && cap.utilPly > 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Combined shear and tension",
							value: cap.utilInteract == null ? "needs both N* and V*" : `${trimNum(cap.utilInteract * 100, 1)}%`,
							fail: cap.utilInteract != null && cap.utilInteract > 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "What governs",
							value: cap.governing
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "toolNote",
					children: [
						"Over 100% is past this check. Bolt factor φ is 0.80. Plate factor is 0.90 and is not mixed into the bolt factor. A thread plane uses the stress area. A shank plane uses the shank area. Shear is taken as 0.62 of fu, then lap factor ",
						trimNum(cap.kr, 3),
						" and 10.9 factor ",
						trimNum(cap.krd, 2),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "toolGloss",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "SHOW THE ARITHMETIC" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inner",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "toolTableWrap",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "toolTable",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Step" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Equation" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Substitution" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Result" })
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: cap.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.label }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.equation }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.substitution }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.result })
								] }, step.id)) })]
							})
						})
					})]
				})
			] })
		]
	});
}
function Pair({ label, value, dim, hot, setHot, fail = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onMouseEnter: () => dim && setHot?.(dim),
		onMouseLeave: () => setHot?.(null),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: dim != null && hot === dim ? "hotLabel" : "",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
			className: fail ? "fail" : "",
			children: value
		})]
	});
}
function TabBody({ tab, sheet, hot, setHot, classIds, classId }) {
	const p = sheet.profile;
	if (tab === "OVERVIEW") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "toolNote",
		children: sheet.standardNote
	}), p ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "resultList",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Designation",
				value: sheet.designation
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "d",
				value: `${trimNum(sheet.dMm, 3)} mm`,
				dim: "d",
				hot,
				setHot
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "P",
				value: `${trimNum(sheet.pitchMm, 3)} mm`,
				dim: "P",
				hot,
				setHot
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "As",
				value: `${trimNum(p.As, 2)} mm²`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Ao",
				value: `${trimNum(p.Ao, 2)} mm²`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Ar",
				value: `${trimNum(p.Ar, 2)} mm²`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "fy",
				value: sheet.band ? `${sheet.band.fy} MPa` : "Required standard data unavailable."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "fu",
				value: sheet.band ? `${sheet.band.fu} MPa` : "Required standard data unavailable."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Sp",
				value: sheet.band ? `${sheet.band.sp} MPa` : "—"
			})
		]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "failBanner",
		children: "This combination is not contained in the current verified dataset."
	})] });
	if (tab === "GEOMETRY") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		sheet.hex ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "s across flats",
					value: `${trimNum(sheet.hex.s, 2)} mm`,
					dim: "s",
					hot,
					setHot
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "e across corners",
					value: `${trimNum(sheet.hex.e, 2)} mm`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "k head height",
					value: `${trimNum(sheet.hex.k, 2)} mm`,
					dim: "k",
					hot,
					setHot
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Grip L − b",
					value: sheet.gripMm == null ? "—" : `${trimNum(sheet.gripMm, 2)} mm`,
					dim: "b",
					hot,
					setHot
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Rough allowance, not ISO 273",
					value: sheet.holeMm == null ? "—" : `${trimNum(sheet.holeMm, 1)} mm`
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: "Required standard data unavailable. Head dimensions are not in the verified dataset for this size."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [sheet.hexProvenance.note, " Across corners e = s / cos(30°) is the regular-hexagon geometry, not the standard minimum e."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: sheet.gripNote
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [sheet.holeNote, " The ISO 273 clearance holes are on DRILL / TAP. Nut thickness and washer size are not embedded."]
		})
	] });
	if (tab === "THREAD" && p) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "resultList",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Designation",
				value: sheet.designation
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Pitch P",
				value: `${trimNum(p.P, 4)} mm`,
				dim: "P",
				hot,
				setHot
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Threads / mm",
				value: trimNum(1 / p.P, 4)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "TPI",
				value: trimNum(sheet.tpi ?? 0, 3)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Major d",
				value: `${trimNum(p.d, 3)} mm`,
				dim: "d",
				hot,
				setHot
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Pitch dia d2",
				value: `${trimNum(p.d2, 3)} mm`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Minor d1",
				value: `${trimNum(p.d1, 3)} mm`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "d3",
				value: `${trimNum(p.d3, 3)} mm`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Height H",
				value: `${trimNum(p.H, 3)} mm`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Depth 5H/8",
				value: `${trimNum(p.depth, 3)} mm`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Angle",
				value: "60°"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Class",
				value: "6g / 6H usual — deviations not embedded"
			})
		]
	});
	if (tab === "DRILL / TAP") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrillPanel, { sheet });
	if (tab === "AREAS" && p) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "formulaBox",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "CALCULATED" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Ao = πd²/4 = ",
					trimNum(p.Ao, 2),
					" mm²"
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"As = π/4 ((d2+d3)/2)² = ",
					trimNum(p.As, 2),
					" mm²"
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Ar = πd1²/4 = ",
					trimNum(p.Ar, 2),
					" mm²"
				] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Shank shear Ao",
					value: `${trimNum(p.shearShank, 2)} mm² · ${trimNum(p.shearShank / 100, 4)} cm² · ${trimNum(p.shearShank / 645.16, 5)} in²`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Thread shear As",
					value: `${trimNum(p.shearThread, 2)} mm² · ${trimNum(p.shearThread / 100, 4)} cm² · ${trimNum(p.shearThread / 645.16, 5)} in²`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Root area Ar",
					value: `${trimNum(p.Ar, 2)} mm² · ${trimNum(p.Ar / 100, 4)} cm² · ${trimNum(p.Ar / 645.16, 5)} in²`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: sheet.areaNote
		})
	] });
	if (tab === "MATERIAL") {
		if (!sheet.band) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: "Required standard data unavailable."
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "resultList",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
						label: "Class",
						value: sheet.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
						label: "fu",
						value: `${sheet.band.fu} MPa`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
						label: "fy",
						value: `${sheet.band.fy} MPa`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
						label: "Proof stress Sp",
						value: `${sheet.band.sp} MPa`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
						label: "Proof load Sp·As",
						value: p ? `${trimNum(sheet.band.sp * p.As / 1e3, 2)} kN` : "—"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "toolNote",
				children: [sheet.classNote, " fy, fu and proof stress are different properties."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "toolNote",
				children: [
					sheet.classProvenance.note,
					" Hardness and elongation are not in this dataset. Classes on this standard: ",
					classIds === "all" ? "all ISO classes in the dataset" : classIds.join(", ") || "none",
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				style: { marginTop: 16 },
				children: "Stainless fastener classes — reference only"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "toolNote",
				style: { marginTop: 0 },
				children: STAINLESS_NOTE
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toolTableWrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "toolTable",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Class" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Family" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "rm min MPa" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Rp0.2 min MPa" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commercial name" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: STAINLESS_CLASSES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.id }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.family }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.rm }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.rp }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.common })
					] }, item.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "toolNote",
				children: "AS/NZS 1252 is a product and assembly standard. AS 4100 is the design check. This sheet does not treat them as the same document. ASTM, SAE and high-temperature fastener tables are not in this dataset."
			})
		] });
	}
	if (tab === "PRELOAD / TORQUE") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TorquePanel, {
		sheet,
		classId
	});
	if (tab === "MASS") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [sheet.massKg == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "failBanner",
		children: sheet.massNote
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "resultList",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Each",
				value: `${trimNum(sheet.massEachG ?? 0, 1)} g`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Each",
				value: `${trimNum((sheet.massEachG ?? 0) / 1e3, 4)} kg`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "Total",
				value: `${trimNum(sheet.massKg, 4)} kg`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "per 100",
				value: sheet.massEachG ? `${trimNum(sheet.massEachG / 10, 2)} kg` : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: "per 1000",
				value: sheet.massEachG ? `${trimNum(sheet.massEachG, 1)} kg` : "—"
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "toolNote",
		children: [sheet.massNote, " Nut mass and washer mass: required standard data unavailable."]
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Profile",
					value: sheet.profileProvenance.sourceType
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Standard",
					value: sheet.profileProvenance.sourceStandard
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Clause",
					value: sheet.profileProvenance.clause
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Class data",
					value: sheet.classProvenance.sourceType
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Head data",
					value: sheet.hex ? sheet.hexProvenance.sourceType : "unavailable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Dataset",
					value: "Fastener DB v1.0.0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
					label: "Engine",
					value: "v1.0.0"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: sheet.profileProvenance.note
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: sheet.standardNote
		})
	] });
}
function Compare({ rows, onClear, fields }) {
	const nums = rows.map((row) => buildSheet({
		...fields,
		...row,
		nStar: "",
		vStar: "",
		nn: "1",
		nx: "0",
		lj: ""
	})).map((sheet) => ({
		label: sheet.designation,
		Ao: sheet.profile?.Ao ?? null,
		As: sheet.profile?.As ?? null,
		Ar: sheet.profile?.Ar ?? null,
		P: sheet.pitchMm,
		fy: sheet.band?.fy ?? null,
		fu: sheet.band?.fu ?? null,
		sp: sheet.band?.sp ?? null,
		mass: sheet.massEachG
	}));
	const keys = [
		"Ao",
		"As",
		"Ar",
		"P",
		"fy",
		"fu",
		"sp",
		"mass"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "toolPanel spanAll",
		style: { marginTop: 14 },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Comparison" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "toolNote",
				children: "Largest is marked black, smallest grey, only where the numbers differ. That is not a selection."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toolTableWrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "toolTable",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Bolt" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Ao" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "As" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Ar" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "P" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "fy" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "fu" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Sp" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "g each" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: nums.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.label }), keys.map((key) => {
						const value = row[key];
						const column = nums.map((item) => item[key]).filter((item) => item != null);
						const max = Math.max(...column);
						const min = Math.min(...column);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: value == null || max === min ? "" : value === max ? "hi" : value === min ? "lo" : "",
							children: value == null ? "—" : trimNum(value, key === "P" ? 3 : 1)
						}, key);
					})] }, row.label)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn ghost",
				type: "button",
				onClick: onClear,
				style: { marginTop: 10 },
				children: "CLEAR COMPARE"
			})
		]
	});
}
//#endregion
export { selectionFromSlug as i, DEFAULT_SELECTION as n, selectionFromQuery as r, BoltTool as t };
