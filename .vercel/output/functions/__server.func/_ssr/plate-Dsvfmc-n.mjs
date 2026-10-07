import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as LabShell, s as trimNum } from "./lab-shell-Dd_RI9Uq.mjs";
import { n as convert } from "./converter-CpIW05mk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plate-Dsvfmc-n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EDGE_NAME = {
	x0: "x = 0",
	x1: "x = a",
	y0: "y = 0",
	y1: "y = b"
};
var VIEW_LABEL = {
	geometry: "GEOMETRY",
	sx: "σx",
	sy: "σy",
	tau: "τxy",
	combined: "COMBINED STRESS",
	panels: "SUBPANELS",
	mesh: "FEM MESH",
	effective: "EFFECTIVE WIDTH",
	prestress: "PRE-BUCKLING MEMBRANE"
};
function mm(n) {
	if (!Number.isFinite(n)) return "—";
	if (Math.abs(n) >= 100) return trimNum(n, 1).replace(/\.0$/, "");
	return trimNum(n, 2).replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1");
}
function restraint(kind) {
	if (kind === "ss") return "SS";
	if (kind === "fixed") return "FIXED";
	if (kind === "free") return "FREE";
	return "SPRING";
}
function rangeOf(values) {
	let min = Infinity;
	let max = -Infinity;
	for (const value of values) {
		if (value < min) min = value;
		if (value > max) max = value;
	}
	return {
		min: Number.isFinite(min) ? min : 0,
		max: Number.isFinite(max) ? max : 0
	};
}
function PrestressField(props) {
	const nx = props.xs.length - 1;
	const ny = props.ys.length - 1;
	if (!props.membrane || nx < 1 || ny < 1 || props.membrane.sigY.length !== nx * ny) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		className: "cap",
		x: props.pl,
		y: props.pt + 18,
		children: "NO PATCH FIELD. Kg IS USING THE ENTERED σx, σy AND τxy."
	});
	const sigY = rangeOf(props.membrane.sigY);
	const sigX = rangeOf(props.membrane.sigX);
	const tau = rangeOf(props.membrane.tau);
	const scale = Math.max(Math.abs(sigY.min), Math.abs(sigY.max), 1e-9);
	const cells = [];
	for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
		const value = props.membrane.sigY[iy * nx + ix] ?? 0;
		const x = props.sx(props.xs[ix] ?? 0);
		const y = props.sy(props.ys[iy + 1] ?? 0);
		const w = Math.max(.5, props.sx(props.xs[ix + 1] ?? 0) - x);
		const h = Math.max(.5, props.sy(props.ys[iy] ?? 0) - y);
		cells.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x,
			y,
			width: w,
			height: h,
			fill: "#111",
			opacity: Math.min(.85, Math.abs(value) / scale)
		}, `${ix}-${iy}`));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		cells,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			className: "cap",
			x: props.pl,
			y: props.pb + 18,
			children: "σy SHADE — COMPRESSION POSITIVE. DARKER IS LARGER |σy|."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			className: "cap",
			x: props.pl,
			y: props.pb + 34,
			children: `σx ${sigX.min.toFixed(2)}…${sigX.max.toFixed(2)}  σy ${sigY.min.toFixed(2)}…${sigY.max.toFixed(2)}  τxy ${tau.min.toFixed(2)}…${tau.max.toFixed(2)} MPa`
		})
	] });
}
function PlateDrawing(props) {
	const svgRef = (0, import_react.useRef)(null);
	const [dragId, setDragId] = (0, import_react.useState)(null);
	const PL = 210;
	const PT = 112;
	const PW = 300;
	const PH = 200;
	const PR = 510;
	const PB = 312;
	const a = props.aMm > 0 ? props.aMm : 1;
	const b = props.bMm > 0 ? props.bMm : 1;
	const sx = (x) => PL + x / a * PW;
	const sy = (y) => PB - y / b * PH;
	const on = (id) => props.hot === id ? "hot" : "";
	const showSigma = props.view === "sx" || props.view === "combined" || props.hot === "sx";
	const showTau = (props.view === "tau" || props.view === "combined" || props.hot === "tau") && (Math.abs(props.tau) > 1e-9 || (props.samples ?? []).some((s) => Math.abs(s.tauMpa) > 1e-9));
	const showPatch = Boolean(props.patch && props.patch.lengthMm > 0 && (props.view === "geometry" || props.view === "sy" || props.view === "combined"));
	const showSy = (props.view === "sy" || props.view === "combined") && Math.abs(props.sigmaY ?? 0) > 1e-9;
	const sig = (y) => atSample(props.samples, y, "sigmaMpa") ?? props.sigma1 * (1 - (1 - props.psi) * (y / b));
	const stations = [
		.18,
		.34,
		.5,
		.66,
		.82
	];
	const peak = Math.max(1e-9, ...stations.map((f) => Math.abs(sig(f * b))), ...(props.samples ?? []).map((s) => Math.abs(s.sigmaMpa)));
	const neutral = props.psi !== 1 ? b / (1 - props.psi) : null;
	function pointerMm(event) {
		const svg = svgRef.current;
		if (!svg) return null;
		const point = svg.createSVGPoint();
		point.x = event.clientX;
		point.y = event.clientY;
		const ctm = svg.getScreenCTM();
		if (!ctm) return null;
		const mapped = point.matrixTransform(ctm.inverse());
		return {
			x: (mapped.x - PL) / PW * a,
			y: (PB - mapped.y) / PH * b
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		ref: svgRef,
		className: "plateSvg",
		viewBox: "0 0 800 560",
		role: "img",
		"aria-label": "Rectangular plate with edges, dimensions and stress",
		onPointerMove: (event) => {
			if (!dragId) return;
			const mm = pointerMm(event);
			if (!mm) return;
			const item = props.stiffeners?.find((stiffener) => stiffener.id === dragId);
			if (!item) return;
			const value = item.axis === "x" ? Math.min(b * .98, Math.max(b * .02, mm.y)) : Math.min(a * .98, Math.max(a * .02, mm.x));
			props.onDragStiffener?.(dragId, value);
		},
		onPointerUp: () => setDragId(null),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				className: "cap",
				x: "12",
				y: "24",
				children: "x ALONG a · y ALONG b · z NORMAL"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				className: "cap",
				x: "520",
				y: "24",
				children: VIEW_LABEL[props.view]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				className: "plateFill",
				x: PL,
				y: PT,
				width: PW,
				height: PH
			}),
			props.view === "prestress" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrestressField, {
				pl: PL,
				pt: PT,
				pr: PR,
				pb: PB,
				a,
				b,
				xs: props.xs ?? [],
				ys: props.ys ?? [],
				membrane: props.membrane ?? null,
				sx,
				sy
			}) : null,
			props.view === "effective" && props.effectiveRho != null && props.effectiveRho > 0 && props.effectiveRho < 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectiveZone, {
				pl: PL,
				pt: PT,
				pr: PR,
				pb: PB,
				a,
				b,
				sigma1: props.sigma1,
				psi: props.psi,
				rho: props.effectiveRho
			}) : null,
			props.view === "mesh" ? props.mesh.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				className: "mesh",
				x1: sx(line.x1),
				y1: sy(line.y1),
				x2: sx(line.x2),
				y2: sy(line.y2)
			}, i)) : null,
			props.view === "panels" ? props.panels?.map((panel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				onClick: () => props.onPanel?.(panel.id),
				style: { cursor: "pointer" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					className: props.selectedPanel === panel.id || props.hot === panel.id ? "panelOn" : "panel",
					x: sx(panel.x0),
					y: sy(panel.y1),
					width: Math.max(1, sx(panel.x1) - sx(panel.x0)),
					height: Math.max(1, sy(panel.y0) - sy(panel.y1))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					className: "tag",
					x: (sx(panel.x0) + sx(panel.x1)) / 2,
					y: (sy(panel.y0) + sy(panel.y1)) / 2,
					textAnchor: "middle",
					children: panel.id
				})]
			}, panel.id)) : null,
			props.stiffeners?.map((item) => {
				const hot = props.selectedStiffener === item.id || props.hot === item.id;
				if (item.axis === "x") {
					const y = sy(item.atMm);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						className: hot ? "hot" : "",
						onPointerDown: (event) => {
							event.currentTarget.setPointerCapture?.(event.pointerId);
							setDragId(item.id);
							props.onStiffener?.(item.id);
						},
						style: { cursor: "ns-resize" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								className: "stiff",
								x1: PL,
								y1: y,
								x2: PR,
								y2: y
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: PL,
								y1: y,
								x2: PR,
								y2: y,
								stroke: "transparent",
								strokeWidth: "12"
							}),
							props.view === "geometry" || props.view === "panels" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
								className: "tag",
								x: 502,
								y: Math.max(126, y - 6),
								textAnchor: "end",
								children: [
									item.id,
									" · y = ",
									mm(item.atMm)
								]
							}) : null
						]
					}, item.id);
				}
				const x = sx(item.atMm);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: hot ? "hot" : "",
					onPointerDown: (event) => {
						setDragId(item.id);
						props.onStiffener?.(item.id);
					},
					style: { cursor: "ew-resize" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							className: "stiff",
							x1: x,
							y1: PT,
							x2: x,
							y2: PB
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: x,
							y1: PT,
							x2: x,
							y2: PB,
							stroke: "transparent",
							strokeWidth: "12"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
							className: "tag",
							x: x + 4,
							y: 128,
							children: [
								item.id,
								" x = ",
								mm(item.atMm)
							]
						})
					]
				}, item.id);
			}),
			(props.view === "geometry" || props.view === "mesh" || props.view === "panels") && props.stiffeners ? props.stiffeners.filter((item) => item.axis === "x" && item.atMm > 1e-6 && item.atMm < b - 1e-6).flatMap((along) => props.stiffeners.filter((item) => item.axis === "y" && item.atMm > 1e-6 && item.atMm < a - 1e-6).map((across) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				className: "joint",
				cx: sx(across.atMm),
				cy: sy(along.atMm),
				r: "4.5"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `Connection node ${along.id} × ${across.id}` })] }, `${along.id}-${across.id}`))) : null,
			showPatch && props.patch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatchMark, {
				patch: props.patch,
				a,
				b,
				sx,
				sy,
				pl: PL,
				pt: PT,
				pr: PR,
				pb: PB
			}) : null,
			neutral != null && neutral > 0 && neutral < b && showSigma ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				className: "na",
				x1: PL,
				y1: sy(neutral),
				x2: PR,
				y2: sy(neutral)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				className: "tag",
				x: 216,
				y: sy(neutral) - 4,
				children: "σ = 0"
			})] }) : null,
			showSigma && peak > 1e-6 ? stations.map((f) => {
				const mag = sig(f * b);
				const len = 12 + Math.abs(mag) / peak * 26;
				const yv = sy(f * b);
				const inward = mag >= 0;
				const leftStart = 288;
				const rightStart = 432;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: `action ${on("sx")}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: inward ? leftStart : leftStart + len,
						y1: yv,
						x2: inward ? leftStart + len : leftStart,
						y2: yv,
						markerEnd: "url(#pLoad)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: inward ? rightStart : rightStart - len,
						y1: yv,
						x2: inward ? rightStart - len : rightStart,
						y2: yv,
						markerEnd: "url(#pLoad)"
					})]
				}, f);
			}) : null,
			showTau ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShearFrame, {
				pl: PL,
				pt: PT,
				pr: PR,
				pb: PB,
				positive: props.tau >= 0,
				hot: on("tau")
			}) : null,
			showSy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UniformSy, {
				pl: PL,
				pt: PT,
				pr: PR,
				pb: PB,
				sigmaY: props.sigmaY ?? 0
			}) : null,
			showSigma || props.view === "tau" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StressPlot, {
				pt: PT,
				pb: PB,
				sigma1: props.sigma1,
				psi: props.psi,
				tau: props.tau,
				b,
				samples: props.samples,
				kind: props.view === "tau" ? "tau" : "sigma"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Edge, {
				x1: PL,
				y1: PB,
				x2: PL,
				y2: PT,
				kind: props.edges.x0,
				id: "ex0",
				label: EDGE_NAME.x0,
				hot: on("ex0"),
				place: "left",
				onEdge: () => props.onEdge("x0"),
				onHot: props.onHot
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Edge, {
				x1: PR,
				y1: PT,
				x2: PR,
				y2: PB,
				kind: props.edges.x1,
				id: "ex1",
				label: EDGE_NAME.x1,
				hot: on("ex1"),
				place: "right",
				onEdge: () => props.onEdge("x1"),
				onHot: props.onHot
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Edge, {
				x1: PL,
				y1: PB,
				x2: PR,
				y2: PB,
				kind: props.edges.y0,
				id: "ey0",
				label: EDGE_NAME.y0,
				hot: on("ey0"),
				place: "bottom",
				onEdge: () => props.onEdge("y0"),
				onHot: props.onHot
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Edge, {
				x1: PR,
				y1: PT,
				x2: PL,
				y2: PT,
				kind: props.edges.y1,
				id: "ey1",
				label: EDGE_NAME.y1,
				hot: on("ey1"),
				place: "top",
				onEdge: () => props.onEdge("y1"),
				onHot: props.onHot
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: on("a"),
				onMouseEnter: () => props.onHot("a"),
				onMouseLeave: () => props.onHot(null),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "ext",
						x1: PL,
						y1: PB,
						x2: PL,
						y2: 430
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "ext",
						x1: PR,
						y1: PB,
						x2: PR,
						y2: 430
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "dim",
						x1: PL,
						y1: 416,
						x2: 280,
						y2: 416,
						markerStart: "url(#pDim)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "dim",
						x1: 440,
						y1: 416,
						x2: PR,
						y2: 416,
						markerEnd: "url(#pDim)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
						className: "dimText",
						x: 360,
						y: 398,
						textAnchor: "middle",
						children: [
							"a = ",
							mm(props.aMm),
							" mm"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: on("b"),
				onMouseEnter: () => props.onHot("b"),
				onMouseLeave: () => props.onHot(null),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "ext",
						x1: PL,
						y1: PT,
						x2: 138,
						y2: PT
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "ext",
						x1: PL,
						y1: PB,
						x2: 138,
						y2: PB
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "dim",
						x1: 154,
						y1: PB,
						x2: 154,
						y2: 272,
						markerStart: "url(#pDim)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "dim",
						x1: 154,
						y1: 152,
						x2: 154,
						y2: PT,
						markerEnd: "url(#pDim)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
						className: "dimText",
						x: 124,
						y: 212,
						textAnchor: "middle",
						transform: `rotate(-90 124 212)`,
						children: [
							"b = ",
							mm(props.bMm),
							" mm"
						]
					})
				]
			}),
			props.view === "geometry" || props.view === "panels" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: on("t"),
				onMouseEnter: () => props.onHot("t"),
				onMouseLeave: () => props.onHot(null),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						className: "cap",
						x: "640",
						y: "300",
						children: "THICKNESS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						className: "plateFill",
						x: "644",
						y: "314",
						width: "14",
						height: "64"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "ext",
						x1: "658",
						y1: "314",
						x2: "708",
						y2: "314"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "ext",
						x1: "658",
						y1: "378",
						x2: "708",
						y2: "378"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						className: "dim",
						x1: "692",
						y1: "318",
						x2: "692",
						y2: "374",
						markerStart: "url(#pDim)",
						markerEnd: "url(#pDim)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
						className: "dimText",
						x: "708",
						y: "352",
						children: ["t = ", mm(props.tMm)]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: "axis",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "28",
						y1: "500",
						x2: "72",
						y2: "500",
						markerEnd: "url(#pDim)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "28",
						y1: "500",
						x2: "28",
						y2: "462",
						markerEnd: "url(#pDim)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "28",
						y1: "500",
						x2: "50",
						y2: "484",
						markerEnd: "url(#pDim)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "78",
						y: "506",
						children: "x"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "14",
						y: "454",
						children: "y"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "66",
						y: "470",
						children: "z"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				className: "cap",
				x: "150",
				y: "508",
				children: "CLICK AN EDGE TO CYCLE ITS RESTRAINT"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				className: "cap",
				x: "12",
				y: "540",
				children: "HEAVY ARROW = STRESS · THIN ARROW = DIMENSION · ROLLERS AND HATCHES SIT OUTSIDE THE EDGE"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("marker", {
					id: "pDim",
					viewBox: "0 0 10 10",
					refX: "9",
					refY: "5",
					markerWidth: "8",
					markerHeight: "8",
					orient: "auto-start-reverse",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 1.2 L9 5 L0 8.8 Z",
						fill: "#111"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("marker", {
					id: "pLoad",
					viewBox: "0 0 12 12",
					refX: "11",
					refY: "6",
					markerWidth: "10",
					markerHeight: "10",
					orient: "auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 0.6 L12 6 L0 11.4 Z",
						fill: "#111"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pattern", {
					id: "ineffHatch",
					width: "7",
					height: "7",
					patternUnits: "userSpaceOnUse",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 7 L7 0",
						stroke: "#111",
						strokeWidth: "0.7"
					})
				})
			] })
		]
	});
}
function PatchMark({ patch, a, b, sx, sy, pl, pt, pr, pb }) {
	const half = patch.lengthMm / 2;
	const edgeLen = patch.edge === "x0" || patch.edge === "x1" ? b : a;
	const start = patch.atMm - half;
	const end = patch.atMm + half;
	const onEdge = patch.lengthMm > 0 && patch.lengthMm <= edgeLen + 1e-6 && start >= -1e-6 && end <= edgeLen + 1e-6;
	const into = patch.forceN >= 0;
	const count = 5;
	const arrows = [];
	let x0 = pl;
	let x1 = pr;
	let y0 = pt;
	let y1 = pb;
	if (patch.edge === "y1" || patch.edge === "y0") {
		x0 = sx(Math.max(0, patch.atMm - half));
		x1 = sx(Math.min(a, patch.atMm + half));
		const edge = patch.edge === "y1" ? pt : pb;
		const outward = patch.edge === "y1" ? -1 : 1;
		for (let i = 0; i < count; i++) {
			const x = x0 + (x1 - x0) * (i + .5) / count;
			const tail = edge + outward * (into ? 26 : 4);
			const tip = edge + outward * (into ? 4 : 26);
			arrows.push([
				x,
				tail,
				x,
				tip
			]);
		}
		y0 = edge + outward * 26;
		y1 = edge + outward * 26;
	} else {
		y0 = sy(Math.max(0, patch.atMm - half));
		y1 = sy(Math.min(b, patch.atMm + half));
		const edge = patch.edge === "x0" ? pl : pr;
		const outward = patch.edge === "x0" ? -1 : 1;
		for (let i = 0; i < count; i++) {
			const y = Math.min(y0, y1) + Math.abs(y1 - y0) * (i + .5) / count;
			const tail = edge + outward * (into ? 26 : 4);
			const tip = edge + outward * (into ? 4 : 26);
			arrows.push([
				tail,
				y,
				tip,
				y
			]);
		}
		x0 = edge + outward * 26;
		x1 = edge + outward * 26;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "action",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				className: "patch",
				strokeDasharray: onEdge ? void 0 : "5 4",
				x1: Math.min(x0, x1),
				y1: Math.min(y0, y1),
				x2: Math.max(x0, x1),
				y2: Math.max(y0, y1)
			}),
			arrows.map((seg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: seg[0],
				y1: seg[1],
				x2: seg[2],
				y2: seg[3],
				markerEnd: "url(#pLoad)"
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				className: "tag",
				x: (Math.min(x0, x1) + Math.max(x0, x1)) / 2,
				y: Math.min(y0, y1) - 8,
				textAnchor: "middle",
				children: onEdge ? `ss = ${mm(patch.lengthMm)} mm` : "NOT ON EDGE"
			})
		]
	});
}
function UniformSy({ pl, pt, pr, pb, sigmaY }) {
	const into = sigmaY >= 0;
	const xs = [
		.2,
		.4,
		.6,
		.8
	].map((f) => pl + (pr - pl) * f);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "action",
		children: [xs.map((x) => {
			const topTail = into ? pt - 22 : pt - 4;
			const topTip = into ? pt - 4 : pt - 22;
			const botTail = into ? pb + 22 : pb + 4;
			const botTip = into ? pb + 4 : pb + 22;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x,
				y1: topTail,
				x2: x,
				y2: topTip,
				markerEnd: "url(#pLoad)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x,
				y1: botTail,
				x2: x,
				y2: botTip,
				markerEnd: "url(#pLoad)"
			})] }, x);
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
			className: "tag",
			x: pl + 8,
			y: pt + 18,
			children: [
				"σy = ",
				mm(sigmaY),
				" MPa ",
				into ? "COMPRESSION" : "TENSION"
			]
		})]
	});
}
function ShearFrame({ pl, pt, pr, pb, positive, hot }) {
	const inset = 28;
	const x0 = pl + inset;
	const x1 = pr - inset;
	const y0 = pt + inset;
	const y1 = pb - inset;
	const segs = positive ? [
		[
			x0 + 28,
			y0,
			x1 - 8,
			y0
		],
		[
			x1,
			y0 + 28,
			x1,
			y1 - 8
		],
		[
			x1 - 28,
			y1,
			x0 + 8,
			y1
		],
		[
			x0,
			y1 - 28,
			x0,
			y0 + 8
		]
	] : [
		[
			x1 - 28,
			y0,
			x0 + 8,
			y0
		],
		[
			x0,
			y0 + 28,
			x0,
			y1 - 8
		],
		[
			x0 + 28,
			y1,
			x1 - 8,
			y1
		],
		[
			x1,
			y1 - 28,
			x1,
			y0 + 8
		]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
		className: `action ${hot}`,
		children: segs.map((seg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: seg[0],
			y1: seg[1],
			x2: seg[2],
			y2: seg[3],
			markerEnd: "url(#pLoad)"
		}, i))
	});
}
function Edge({ x1, y1, x2, y2, kind, id, label, hot, place, onEdge, onHot }) {
	const name = restraint(kind);
	const marks = (place === "top" ? [.16, .84] : place === "bottom" ? [.5, .84] : [.42, .78]).map((t) => ({
		x: x1 + (x2 - x1) * t,
		y: y1 + (y2 - y1) * t
	}));
	const yTop = Math.min(y1, y2);
	const yBot = Math.max(y1, y2);
	const labelPos = place === "left" ? {
		x: 8,
		y: yTop + 28,
		anchor: "start"
	} : place === "right" ? {
		x: Math.max(x1, x2) + 18,
		y: yTop + 28,
		anchor: "start"
	} : place === "top" ? {
		x: Math.min(x1, x2),
		y: yTop - 18,
		anchor: "start"
	} : {
		x: Math.min(x1, x2) + 6,
		y: yBot + 36,
		anchor: "start"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: hot,
		onClick: onEdge,
		onMouseEnter: () => onHot(id),
		onMouseLeave: () => onHot(null),
		style: { cursor: "pointer" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				className: kind === "free" ? "edge free" : "edge",
				x1,
				y1,
				x2,
				y2
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1,
				y1,
				x2,
				y2,
				stroke: "transparent",
				strokeWidth: "18"
			}),
			kind === "fixed" ? marks.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hatch, {
				x: p.x,
				y: p.y,
				place
			}, `${p.x}-${p.y}`)) : null,
			kind === "ss" ? marks.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Roller, {
				x: p.x,
				y: p.y,
				place
			}, `${p.x}-${p.y}`)) : null,
			kind === "elastic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spring, {
				x: x1 + (x2 - x1) * .84,
				y: y1 + (y2 - y1) * .84,
				place
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				className: "tag",
				x: labelPos.x,
				y: labelPos.y - 10,
				textAnchor: labelPos.anchor,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				className: "tag",
				x: labelPos.x,
				y: labelPos.y + 10,
				textAnchor: labelPos.anchor,
				children: name
			})
		]
	});
}
function Roller({ x, y, place }) {
	if (place === "left") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "support",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: `${x},${y} ${x - 14},${y - 8} ${x - 14},${y + 8}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: x - 19,
			cy: y,
			r: "4"
		})]
	});
	if (place === "right") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "support",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: `${x},${y} ${x + 14},${y - 8} ${x + 14},${y + 8}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: x + 19,
			cy: y,
			r: "4"
		})]
	});
	if (place === "top") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "support",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: `${x},${y} ${x - 8},${y - 14} ${x + 8},${y - 14}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: x,
			cy: y - 19,
			r: "4"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "support",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: `${x},${y} ${x - 8},${y + 14} ${x + 8},${y + 14}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: x,
			cy: y + 19,
			r: "4"
		})]
	});
}
function Spring({ x, y, place }) {
	const d = place === "left" ? `M ${x} ${y} l -8 0 -4 -7 -4 14 -4 -14 -4 14 -4 -7 -6 0` : place === "right" ? `M ${x} ${y} l 8 0 4 -7 4 14 4 -14 4 14 4 -7 6 0` : place === "top" ? `M ${x} ${y} l 0 -8 -7 -4 14 -4 -14 -4 14 -4 -7 -4 0 -6` : `M ${x} ${y} l 0 8 -7 4 14 4 -14 4 14 4 -7 4 0 6`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		className: "spring",
		d
	});
}
function Hatch({ x, y, place }) {
	const ticks = [
		-10,
		0,
		10
	];
	if (place === "left" || place === "right") {
		const dir = place === "left" ? -1 : 1;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: ticks.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			className: "hatch",
			x1: x,
			y1: y + d,
			x2: x + dir * 12,
			y2: y + d + 8
		}, d)) });
	}
	const dir = place === "top" ? -1 : 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: ticks.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		className: "hatch",
		x1: x + d,
		y1: y,
		x2: x + d + 8,
		y2: y + dir * 12
	}, d)) });
}
function atSample(samples, y, key) {
	if (!samples || samples.length === 0) return null;
	const ordered = [...samples].sort((p, q) => p.yMm - q.yMm);
	if (y <= ordered[0].yMm) return ordered[0][key];
	const last = ordered[ordered.length - 1];
	if (y >= last.yMm) return last[key];
	for (let i = 1; i < ordered.length; i++) {
		const hi = ordered[i];
		const lo = ordered[i - 1];
		if (y <= hi.yMm) {
			const t = (y - lo.yMm) / Math.max(1e-9, hi.yMm - lo.yMm);
			return lo[key] + t * (hi[key] - lo[key]);
		}
	}
	return last[key];
}
function StressPlot({ pt, pb, sigma1, psi, tau, b, samples, kind }) {
	const left = 600;
	const width = 188;
	const n = 20;
	const values = [];
	for (let i = 0; i <= n; i++) {
		const y = b * i / n;
		if (kind === "tau") values.push(atSample(samples, y, "tauMpa") ?? tau);
		else values.push(atSample(samples, y, "sigmaMpa") ?? sigma1 * (1 - (1 - psi) * (i / n)));
	}
	if (values.every((v) => Math.abs(v) < 1e-9)) return null;
	const peak = Math.max(1e-9, ...values.map((v) => Math.abs(v)));
	const zeroX = 703.4;
	const scale = width * .4 / peak;
	const yAt = (i) => pb - (pb - pt) * i / n;
	const points = values.map((v, i) => `${zeroX + v * scale},${yAt(i)}`).join(" ");
	const bottom = values[0] ?? 0;
	const top = values[values.length - 1] ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
			className: "cap",
			x: left,
			y: pt - 8,
			children: [kind === "tau" ? "τxy" : "σx", " N/mm²"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			className: "dim",
			x1: zeroX,
			y1: pt,
			x2: zeroX,
			y2: pb
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: "#111",
			strokeWidth: "1.8",
			points
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
			className: "tag",
			x: Math.min(790, 711.4),
			y: pb - 4,
			children: [
				kind === "tau" ? "τ" : "σ1",
				" ",
				mm(bottom)
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
			className: "tag",
			x: Math.min(790, 711.4),
			y: pt + 14,
			children: [
				kind === "tau" ? "τ" : "σ2",
				" ",
				mm(top)
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			className: "tag",
			x: left,
			y: pt + 28,
			children: kind === "tau" ? "SHEAR" : Math.abs(psi - 1) < 1e-6 ? "UNIFORM" : `ψ ${trimNum(psi, 2)}`
		})
	] });
}
function EffectiveZone({ pl, pt, pr, pb, b, sigma1, psi, rho }) {
	const yTo = (y) => pb - y / b * (pb - pt);
	const bands = [];
	if (Math.abs(psi - 1) < .02) {
		const edge = rho * b / 2;
		if (edge > 0 && edge * 2 < b - .5) bands.push({
			y0: edge,
			y1: b - edge
		});
	} else if (sigma1 > 0 && psi < 1) {
		const compression = Math.min(b, Math.max(0, b / (1 - psi)));
		const kept = Math.min(compression, Math.max(0, rho * compression));
		if (kept < compression - .5) bands.push({
			y0: kept,
			y1: compression
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [bands.map((band) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		className: "ineff",
		x: pl,
		y: yTo(band.y1),
		width: pr - pl,
		height: Math.max(1, yTo(band.y0) - yTo(band.y1))
	}, `${band.y0}-${band.y1}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
		className: "cap",
		x: pl,
		y: pb + 18,
		children: [
			"ρ = ",
			trimNum(rho, 3),
			" · DEVELOPMENT PREVIEW — NOT A CODE RESULT"
		]
	})] });
}
function ModeView({ xs, ys, modes, modeIndex, onMode }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [yaw, setYaw] = (0, import_react.useState)(-.7);
	const [pitch, setPitch] = (0, import_react.useState)(.65);
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [pan, setPan] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [scale, setScale] = (0, import_react.useState)(.22);
	const [meshOn, setMeshOn] = (0, import_react.useState)(true);
	const [contourOn, setContourOn] = (0, import_react.useState)(true);
	const [outlineOn, setOutlineOn] = (0, import_react.useState)(true);
	const drag = (0, import_react.useRef)(null);
	const [tick, setTick] = (0, import_react.useState)(0);
	const mode = modes[modeIndex];
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const observer = new ResizeObserver(() => setTick((value) => value + 1));
		observer.observe(canvas);
		return () => observer.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const ratio = window.devicePixelRatio || 1;
		canvas.width = Math.max(1, Math.floor(width * ratio));
		canvas.height = Math.max(1, Math.floor(height * ratio));
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		ctx.fillStyle = "#f6f4ee";
		ctx.fillRect(0, 0, width, height);
		if (!mode || xs.length < 2 || ys.length < 2 || mode.w.length !== xs.length * ys.length) {
			ctx.fillStyle = "#111";
			ctx.font = "14px 'IBM Plex Mono', monospace";
			ctx.fillText("Run FEM to calculate a mode shape.", 16, 28);
			return;
		}
		const a = xs[xs.length - 1] ?? 1;
		const b = ys[ys.length - 1] ?? 1;
		const amp = scale * Math.min(a, b);
		const fit = Math.min(width, height) / Math.max(a, b) * .72 * zoom;
		const project = (x, y, z) => {
			const X = x - a / 2;
			const Y = y - b / 2;
			const cy = Math.cos(yaw);
			const sy = Math.sin(yaw);
			const x1 = X * cy - Y * sy;
			const y1 = X * sy + Y * cy;
			const cp = Math.cos(pitch);
			const sp = Math.sin(pitch);
			const y2 = y1 * cp - z * sp;
			const z2 = y1 * sp + z * cp;
			return {
				x: width / 2 + pan.x + x1 * fit,
				y: height / 2 + pan.y - z2 * fit,
				depth: y2
			};
		};
		const nx = xs.length;
		const ny = ys.length;
		const point = (ix, iy, deformed) => {
			const w = deformed ? (mode.w[iy * nx + ix] ?? 0) * amp : 0;
			return project(xs[ix] ?? 0, ys[iy] ?? 0, w);
		};
		if (contourOn) {
			const faces = [];
			for (let iy = 0; iy < ny - 1; iy++) for (let ix = 0; ix < nx - 1; ix++) {
				const corners = [
					point(ix, iy, true),
					point(ix + 1, iy, true),
					point(ix + 1, iy + 1, true),
					point(ix, iy + 1, true)
				];
				const depth = corners.reduce((sum, p) => sum + p.depth, 0) / 4;
				const wAvg = [
					0,
					1,
					2,
					3
				].reduce((sum, _k, index) => {
					const cx = index === 1 || index === 2 ? ix + 1 : ix;
					const cy = index >= 2 ? iy + 1 : iy;
					return sum + Math.abs(mode.w[cy * nx + cx] ?? 0);
				}, 0) / 4;
				faces.push({
					depth,
					pts: corners,
					shade: wAvg
				});
			}
			faces.sort((p, q) => q.depth - p.depth);
			for (const face of faces) {
				const grey = Math.round(244 - face.shade * 150);
				ctx.beginPath();
				ctx.moveTo(face.pts[0].x, face.pts[0].y);
				for (const p of face.pts.slice(1)) ctx.lineTo(p.x, p.y);
				ctx.closePath();
				ctx.fillStyle = `rgb(${grey},${grey},${Math.max(210, grey - 8)})`;
				ctx.fill();
			}
		}
		if (meshOn) {
			ctx.strokeStyle = "#111";
			ctx.lineWidth = .6;
			ctx.beginPath();
			for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
				const p = point(ix, iy, true);
				if (ix + 1 < nx) {
					const q = point(ix + 1, iy, true);
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(q.x, q.y);
				}
				if (iy + 1 < ny) {
					const q = point(ix, iy + 1, true);
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(q.x, q.y);
				}
			}
			ctx.stroke();
		}
		if (outlineOn) {
			ctx.strokeStyle = "#111";
			ctx.setLineDash([5, 4]);
			ctx.lineWidth = 1.1;
			ctx.beginPath();
			const corners = [
				point(0, 0, false),
				point(nx - 1, 0, false),
				point(nx - 1, ny - 1, false),
				point(0, ny - 1, false)
			];
			ctx.moveTo(corners[0].x, corners[0].y);
			for (const p of corners.slice(1)) ctx.lineTo(p.x, p.y);
			ctx.closePath();
			ctx.stroke();
			ctx.setLineDash([]);
		}
		ctx.fillStyle = "#111";
		ctx.font = "12px 'IBM Plex Mono', monospace";
		ctx.fillText("NORMALISED EIGENMODE — DISPLAY SCALE IS NOT PHYSICAL DISPLACEMENT", 12, height - 14);
	}, [
		xs,
		ys,
		mode,
		yaw,
		pitch,
		zoom,
		pan,
		scale,
		meshOn,
		contourOn,
		outlineOn,
		tick
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "Positive eigenvalues only. The shape is the Lanczos eigenvector, not a substituted sine. Negative partners stay in the solver note."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolTabs",
			role: "tablist",
			children: modes.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: modeIndex === index ? "on" : "",
				onClick: () => onMode(index),
				children: ["MODE ", index + 1]
			}, item.lambda + index))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "modeCanvas",
			"aria-label": "Buckling mode shape from the calculated eigenvector",
			onPointerDown: (event) => {
				event.currentTarget.setPointerCapture(event.pointerId);
				drag.current = {
					x: event.clientX,
					y: event.clientY,
					yaw,
					pitch,
					pan,
					button: event.shiftKey ? 2 : event.button
				};
			},
			onPointerMove: (event) => {
				const start = drag.current;
				if (!start) return;
				const dx = event.clientX - start.x;
				const dy = event.clientY - start.y;
				if (start.button === 2 || event.shiftKey) setPan({
					x: start.pan.x + dx,
					y: start.pan.y + dy
				});
				else {
					setYaw(start.yaw + dx * .01);
					setPitch(Math.max(-1.2, Math.min(1.2, start.pitch + dy * .01)));
				}
			},
			onPointerUp: () => {
				drag.current = null;
			},
			onWheel: (event) => {
				event.preventDefault();
				setZoom((value) => Math.max(.4, Math.min(4, value * (event.deltaY > 0 ? .92 : 1.08))));
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "toolToolbar",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Display scale" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "toolField",
						type: "range",
						min: .04,
						max: .6,
						step: .01,
						value: scale,
						onChange: (event) => setScale(Number(event.target.value))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "toolBtn",
					onClick: () => setMeshOn((v) => !v),
					children: meshOn ? "MESH ON" : "MESH OFF"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "toolBtn",
					onClick: () => setContourOn((v) => !v),
					children: contourOn ? "CONTOUR ON" : "CONTOUR OFF"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "toolBtn",
					onClick: () => setOutlineOn((v) => !v),
					children: outlineOn ? "OUTLINE ON" : "OUTLINE OFF"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "Drag to rotate. Shift-drag to pan. Scroll to zoom. The shape is the calculated eigenvector, normalised so the largest |w| is 1."
		}),
		mode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [
				"λ = ",
				mode.lambda.toExponential(3),
				mode.sigma1CrMpa != null ? ` · σ1,cr = ${mode.sigma1CrMpa.toFixed(2)} MPa` : ""
			]
		}) : null
	] });
}
var PI2 = Math.PI * Math.PI;
function flexuralRigidity(eMpa, tMm, nu) {
	return eMpa * tMm ** 3 / (12 * (1 - nu * nu));
}
/** Simply supported, uniform σx. Exact Navier minimum. */
function kUniform(alpha, mMax = 24) {
	const modes = [];
	let best = Infinity;
	let bestM = 1;
	const limit = Math.max(6, Math.ceil(alpha * 2) + 2, mMax);
	for (let m = 1; m <= limit; m++) {
		const k = (m / alpha + alpha / m) ** 2;
		modes.push({
			m,
			n: 1,
			k,
			sigmaMpa: 0
		});
		if (k < best) {
			best = k;
			bestM = m;
		}
	}
	return {
		k: best,
		m: bestM,
		modes
	};
}
/** Timoshenko closed-form fit. Not an infinite series. */
function kShear(alpha) {
	if (alpha >= 1) return 5.34 + 4 / (alpha * alpha);
	return 4 + 5.34 / (alpha * alpha);
}
function shearCouple(m, n, p, q) {
	if ((m - p & 1) === 0 || (n - q & 1) === 0) return 0;
	return 4 * m * n * p * q / ((p * p - m * m) * (n * n - q * q));
}
function jacobiCyclicValues(matrix) {
	const n = matrix.length;
	const a = matrix.map((row) => row.slice());
	const rotate = (p, q) => {
		const app = a[p][p];
		const aqq = a[q][q];
		const apq = a[p][q];
		let t;
		if (Math.abs(app - aqq) <= 1e-18 * (Math.abs(app) + Math.abs(aqq) + 1)) t = apq >= 0 ? 1 : -1;
		else {
			const tau = (aqq - app) / (2 * apq);
			t = Math.sign(tau) / (Math.abs(tau) + Math.hypot(1, tau));
		}
		const c = 1 / Math.hypot(1, t);
		const s = t * c;
		a[p][p] = app - t * apq;
		a[q][q] = aqq + t * apq;
		a[p][q] = 0;
		a[q][p] = 0;
		for (let k = 0; k < n; k++) {
			if (k === p || k === q) continue;
			const aik = a[k][p];
			const akq = a[k][q];
			const nextP = c * aik - s * akq;
			const nextQ = s * aik + c * akq;
			a[k][p] = nextP;
			a[p][k] = nextP;
			a[k][q] = nextQ;
			a[q][k] = nextQ;
		}
	};
	for (let sweep = 0; sweep < 80; sweep++) {
		let off = 0;
		for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
		if (off <= 1e-28 * Math.max(1, n)) break;
		for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
			const scale = Math.abs(a[p][p]) + Math.abs(a[q][q]) + 1e-30;
			if (Math.abs(a[p][q]) > 1e-15 * scale) rotate(p, q);
		}
	}
	return a.map((row, i) => row[i]);
}
function largestAlgebraic(matrix) {
	const n = matrix.length;
	if (n === 0) return 0;
	if (n === 1) return matrix[0][0];
	const dot = (a, b) => {
		let s = 0;
		for (let i = 0; i < n; i++) s += a[i] * b[i];
		return s;
	};
	const axpy = (y, x, scale) => {
		for (let i = 0; i < n; i++) y[i] += scale * x[i];
	};
	const apply = (x) => {
		const y = new Float64Array(n);
		for (let i = 0; i < n; i++) {
			const row = matrix[i];
			let s = 0;
			for (let j = 0; j < n; j++) s += row[j] * x[j];
			y[i] = s;
		}
		return y;
	};
	let v = new Float64Array(n);
	let rng = 17;
	for (let i = 0; i < n; i++) {
		rng = Math.imul(1664525, rng) + 1013904223 >>> 0;
		v[i] = rng / 4294967296 - .5;
	}
	let vn = Math.sqrt(dot(v, v));
	for (let i = 0; i < n; i++) v[i] = v[i] / vn;
	const steps = Math.min(n - 1, n <= 48 ? n - 1 : 72);
	const Q = [];
	const AQ = [];
	let prev = null;
	let betaPrev = 0;
	for (let step = 0; step < steps; step++) {
		const Av = apply(v);
		AQ.push(Float64Array.from(Av));
		Q.push(v);
		if (prev) axpy(Av, prev, -betaPrev);
		const alpha = dot(v, Av);
		axpy(Av, v, -alpha);
		for (let pass = 0; pass < 2; pass++) for (const q of Q) {
			const overlap = dot(Av, q);
			if (overlap !== 0) axpy(Av, q, -overlap);
		}
		const beta = Math.sqrt(Math.max(0, dot(Av, Av)));
		if (!(beta > 1e-14)) break;
		prev = v;
		betaPrev = beta;
		const next = new Float64Array(n);
		const inv = 1 / beta;
		for (let i = 0; i < n; i++) next[i] = Av[i] * inv;
		v = next;
	}
	const m = Q.length;
	const M = Array.from({ length: m }, () => Array(m).fill(0));
	for (let a = 0; a < m; a++) for (let b = a; b < m; b++) {
		const s = .5 * (dot(Q[a], AQ[b]) + dot(Q[b], AQ[a]));
		M[a][b] = s;
		M[b][a] = s;
	}
	let best = -Infinity;
	for (const value of jacobiCyclicValues(M)) if (value > best) best = value;
	return Number.isFinite(best) ? best : 0;
}
/**
* Navier–Galerkin series for constant shear on four simple supports.
* An incomplete sine basis is an upper bound on the Kirchhoff coefficient.
* More terms lower that bound. Not a code coefficient and not the Timoshenko fit.
*/
function kShearSeries(alpha, terms = 6) {
	if (!(alpha > 0) || !Number.isFinite(alpha)) return null;
	const nMax = Math.max(2, Math.min(16, Math.floor(terms)));
	const ids = [];
	for (let m = 1; m <= nMax; m++) for (let n = 1; n <= nMax; n++) ids.push([m, n]);
	const diag = ids.map(([m, n]) => {
		const s = m * m / (alpha * alpha) + n * n;
		return Math.PI ** 4 * s * s * (alpha / 4);
	});
	const n = ids.length;
	const B = Array.from({ length: n }, () => Array(n).fill(0));
	for (let i = 0; i < n; i++) for (let j = i; j < n; j++) {
		const [m, ni] = ids[i];
		const [p, q] = ids[j];
		const v = 2 * shearCouple(m, ni, p, q) / Math.sqrt(diag[i] * diag[j]);
		B[i][j] = v;
		B[j][i] = v;
	}
	const mu = largestAlgebraic(B);
	if (!(mu > 0)) return null;
	return {
		k: 1 / mu / (Math.PI * Math.PI),
		terms: nMax
	};
}
/**
* Long outstand: y = b free, other three edges simply supported, uniform compression.
* Approximate coefficient used in plate texts, exact only as a/b → ∞ (k → 0.425).
*/
function kOutstand(alpha) {
	return .425 + 1 / (alpha * alpha);
}
function sameParity(n, r) {
	return (n - r) % 2 === 0;
}
/** ∫₀^b [1 − (1−ψ) y/b] sin(nπy/b) sin(rπy/b) dy */
function stressIntegral(bMm, psi, n, r) {
	if (n === r) return bMm * (1 + psi) / 4;
	return bMm * (1 - psi) * (1 / PI2) * (1 / (n - r) ** 2 - 1 / (n + r) ** 2) * (sameParity(n, r) ? 0 : 1);
}
function jacobiValues(matrix) {
	const n = matrix.length;
	const a = matrix.map((row) => row.slice());
	for (let sweep = 0; sweep < 40; sweep++) {
		let p = 0;
		let q = 1;
		let max = 0;
		for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
			const v = Math.abs(a[i][j]);
			if (v > max) {
				max = v;
				p = i;
				q = j;
			}
		}
		if (max < 1e-14) break;
		const app = a[p][p];
		const aqq = a[q][q];
		const apq = a[p][q];
		let t;
		if (Math.abs(app - aqq) <= 1e-18 * (Math.abs(app) + Math.abs(aqq) + 1)) t = apq >= 0 ? 1 : -1;
		else {
			const tau = (aqq - app) / (2 * apq);
			t = Math.sign(tau) / (Math.abs(tau) + Math.hypot(1, tau));
		}
		const c = 1 / Math.hypot(1, t);
		const s = t * c;
		a[p][p] = app - t * apq;
		a[q][q] = aqq + t * apq;
		a[p][q] = 0;
		a[q][p] = 0;
		for (let k = 0; k < n; k++) {
			if (k === p || k === q) continue;
			const aik = a[k][p];
			const akq = a[k][q];
			const vip = c * aik - s * akq;
			const viq = s * aik + c * akq;
			a[k][p] = vip;
			a[p][k] = vip;
			a[k][q] = viq;
			a[q][k] = viq;
		}
	}
	return a.map((row, i) => row[i]);
}
/**
* Rayleigh–Ritz / Navier coupling for simply supported edges and σx(y).
* Returns the lowest critical value of σ1, and k based on b.
*/
function galerkinSigma(input) {
	const { aMm, bMm, tMm, eMpa, nu, psi } = input;
	const nMax = input.nMax ?? 6;
	const d = flexuralRigidity(eMpa, tMm, nu);
	const alpha = aMm / bMm;
	const mMax = input.mMax ?? Math.max(8, Math.ceil(alpha * 2) + 3);
	const modes = [];
	let best = Infinity;
	let bestM = 1;
	let bestN = 1;
	for (let m = 1; m <= mMax; m++) {
		const mx = m * Math.PI / aMm;
		const kgScale = tMm * mx * mx * (aMm / 2);
		const kBend = [];
		const g = [];
		for (let n = 1; n <= nMax; n++) {
			const ky = n * Math.PI / bMm;
			const kappa = mx * mx + ky * ky;
			kBend.push(d * kappa * kappa * (aMm * bMm / 4));
			const row = [];
			for (let r = 1; r <= nMax; r++) row.push(kgScale * stressIntegral(bMm, psi, n, r));
			g.push(row);
		}
		const mus = jacobiValues(kBend.map((kii, i) => g[i].map((gij, j) => gij / Math.sqrt(kii * kBend[j]))));
		let local = Infinity;
		let localN = 1;
		mus.forEach((mu, index) => {
			if (mu > 1e-10) {
				const sigma = 1 / mu;
				if (sigma < local) {
					local = sigma;
					localN = index + 1;
				}
			}
		});
		if (Number.isFinite(local)) {
			const k = local * tMm * bMm * bMm / (PI2 * d);
			modes.push({
				m,
				n: localN,
				k,
				sigmaMpa: local
			});
			if (local < best) {
				best = local;
				bestM = m;
				bestN = localN;
			}
		}
	}
	if (!Number.isFinite(best)) return null;
	const k = best * tMm * bMm * bMm / (PI2 * d);
	return {
		sigma: best,
		k,
		m: bestM,
		n: bestN,
		modes
	};
}
function allSimply(edges) {
	return edges.x0 === "ss" && edges.x1 === "ss" && edges.y0 === "ss" && edges.y1 === "ss";
}
function outstandCase(edges, psi) {
	return edges.y1 === "free" && edges.y0 === "ss" && edges.x0 === "ss" && edges.x1 === "ss" && Math.abs(psi - 1) < 1e-9;
}
function sigmaFromK(k, eMpa, nu, tMm, bMm) {
	return k * PI2 * eMpa * (tMm / bMm) ** 2 / (12 * (1 - nu * nu));
}
function classicalPlate(input) {
	const warnings = [];
	const fail = (reason) => ({
		ok: false,
		reason,
		alpha: null,
		dNmm: null,
		kSigma: null,
		kTau: null,
		sigmaCrMpa: null,
		tauCrMpa: null,
		m: null,
		n: null,
		modes: [],
		method: "—",
		warnings,
		steps: [],
		ratioSigma: null,
		ratioTau: null
	});
	const { aMm, bMm, tMm, eMpa, nu, fyMpa, fuMpa, psi, tauMpa, sigma1Mpa, edges } = input;
	if (![
		aMm,
		bMm,
		tMm,
		eMpa,
		fyMpa,
		fuMpa
	].every((n) => Number.isFinite(n) && n > 0)) return fail("Length, thickness, E, fy and fu must be positive numbers.");
	if (!(nu > 0 && nu < .5)) return fail("Poisson's ratio must be between 0 and 0.5.");
	if (!Number.isFinite(psi) || !Number.isFinite(tauMpa) || !Number.isFinite(sigma1Mpa)) return fail("Stress values must be numbers. Compression is positive.");
	if (fuMpa + 1e-9 < fyMpa) warnings.push("fu is below fy. Check the material entry.");
	if (tMm > bMm / 10 || tMm > aMm / 10) warnings.push("Thickness is large for thin-plate theory. The critical stress is still the Kirchhoff value.");
	const alpha = aMm / bMm;
	const d = flexuralRigidity(eMpa, tMm, nu);
	const steps = [{
		id: "alpha",
		label: "Aspect ratio",
		equation: "α = a / b",
		substitution: `a = ${aMm} mm, b = ${bMm} mm`,
		result: `${alpha} —`
	}, {
		id: "D",
		label: "Flexural rigidity",
		equation: "D = E t³ / [12 (1 − ν²)]",
		substitution: `E = ${eMpa} MPa, t = ${tMm} mm, ν = ${nu}`,
		result: `${d} N·mm`
	}];
	let kSigma = null;
	let sigmaCr = null;
	let m = null;
	let n = null;
	let modes = [];
	let method = "";
	const directWanted = Math.abs(sigma1Mpa) > 0 || Math.abs(psi - 1) > 1e-12;
	if (allSimply(edges)) {
		if (Math.abs(psi - 1) < 1e-9) {
			const exact = kUniform(alpha);
			kSigma = exact.k;
			m = exact.m;
			n = 1;
			sigmaCr = sigmaFromK(exact.k, eMpa, nu, tMm, bMm);
			modes = exact.modes.map((row) => ({
				...row,
				sigmaMpa: sigmaFromK(row.k, eMpa, nu, tMm, bMm)
			}));
			method = "Navier, four edges simply supported, uniform σx";
		} else {
			const energy = galerkinSigma({
				aMm,
				bMm,
				tMm,
				eMpa,
				nu,
				psi
			});
			if (!energy) return fail("No compressive buckling eigenvalue for this stress shape.");
			kSigma = energy.k;
			sigmaCr = energy.sigma;
			m = energy.m;
			n = energy.n;
			modes = energy.modes;
			method = "Navier–Galerkin, four edges simply supported, linear σx";
		}
		steps.push({
			id: "k",
			label: "Buckling coefficient kσ",
			equation: Math.abs(psi - 1) < 1e-9 ? "kσ(m) = (m/α + α/m)², minimum over m" : "kσ from the lowest eigenvalue of the Navier coupling in n",
			substitution: `α = ${alpha}, ψ = ${psi}, m = ${m}, n = ${n}. Candidates: ${modes.slice(0, 8).map((row) => `m=${row.m} k=${row.k.toFixed(3)}`).join("; ")}`,
			result: `${kSigma}`
		});
		steps.push({
			id: "scr",
			label: "Elastic critical direct stress",
			equation: "σcr = kσ π² E / [12 (1 − ν²)] (t/b)²",
			substitution: `kσ = ${kSigma}, E = ${eMpa} MPa, ν = ${nu}, t = ${tMm} mm, b = ${bMm} mm`,
			result: `${sigmaCr} MPa`
		});
	} else if (outstandCase(edges, psi)) {
		kSigma = kOutstand(alpha);
		m = 1;
		n = 1;
		sigmaCr = sigmaFromK(kSigma, eMpa, nu, tMm, bMm);
		modes = [{
			m: 1,
			n: 1,
			k: kSigma,
			sigmaMpa: sigmaCr
		}];
		method = "Approximate outstand, three edges simply supported, y = b free";
		warnings.push("The outstand coefficient 0.425 + (b/a)² is the usual approximation, not a full series solution.");
		steps.push({
			id: "k",
			label: "Buckling coefficient kσ",
			equation: "kσ ≈ 0.425 + (b/a)²",
			substitution: `a = ${aMm} mm, b = ${bMm} mm`,
			result: `${kSigma}`
		});
		steps.push({
			id: "scr",
			label: "Elastic critical direct stress",
			equation: "σcr = kσ π² E / [12 (1 − ν²)] (t/b)²",
			substitution: `kσ = ${kSigma}, b = outstand width`,
			result: `${sigmaCr} MPa`
		});
	} else if (directWanted) {
		warnings.push("Analytical solution unavailable for this boundary-condition combination.");
		method = "No closed form for these edges";
	} else method = "Direct-stress solution not requested";
	let kTau = null;
	let tauCr = null;
	if (allSimply(edges)) {
		kTau = kShear(alpha);
		tauCr = sigmaFromK(kTau, eMpa, nu, tMm, bMm);
		steps.push({
			id: "kt",
			label: "Shear coefficient kτ",
			equation: alpha >= 1 ? "kτ = 5.34 + 4/α²" : "kτ = 4 + 5.34/α²",
			substitution: `α = ${alpha}. Timoshenko fit, not an exact series.`,
			result: `${kTau}`
		});
		const series = kShearSeries(alpha, 12);
		if (series) steps.push({
			id: "kts",
			label: "Shear coefficient from a Navier series",
			equation: "Stationary Navier–Galerkin energy for constant τ. Sine terms 1…12 in each direction.",
			substitution: `α = ${alpha}, terms ${series.terms}×${series.terms}. Energy upper bound. Orders 12 and 16 differ by less than 0.02% on α = 0.5, 1, 2 and 4. The Timoshenko fit is not this series.`,
			result: `${series.k}`
		});
		steps.push({
			id: "tcr",
			label: "Elastic critical shear stress",
			equation: "τcr = kτ π² E / [12 (1 − ν²)] (t/b)²",
			substitution: `kτ = ${kTau}, t = ${tMm} mm, b = ${bMm} mm`,
			result: `${tauCr} MPa`
		});
	} else if (Math.abs(tauMpa) > 0) warnings.push("Analytical shear solution unavailable unless all four edges are simply supported.");
	if (Math.abs(sigma1Mpa) > 0 && Math.abs(tauMpa) > 0) warnings.push("Direct stress and shear are both non-zero. Each critical stress is separate. No interaction equation is applied.");
	if (sigmaCr != null && sigmaCr > fyMpa) warnings.push("Elastic critical stress is above fy. Yielding is expected before this elastic buckle. Not a code resistance.");
	if (sigma1Mpa < 0) warnings.push("Compression is positive. A negative σ1 is tension at y = 0.");
	const ratioSigma = sigmaCr != null && sigmaCr > 0 && sigma1Mpa > 0 ? sigma1Mpa / sigmaCr : null;
	const ratioTau = tauCr != null && tauCr > 0 && Math.abs(tauMpa) > 0 ? Math.abs(tauMpa) / tauCr : null;
	return {
		ok: true,
		reason: "",
		alpha,
		dNmm: d,
		kSigma,
		kTau,
		sigmaCrMpa: sigmaCr,
		tauCrMpa: tauCr,
		m,
		n,
		modes: modes.sort((p, q) => p.sigmaMpa - q.sigmaMpa || p.k - q.k).slice(0, 8),
		method: method || "—",
		warnings,
		steps,
		ratioSigma,
		ratioTau
	};
}
function bandAdd(A, bw, i, j, value) {
	if (value === 0 || !Number.isFinite(value)) return;
	if (i < j) {
		const swap = i;
		i = j;
		j = swap;
	}
	const span = i - j;
	if (span >= bw) throw new Error(`Banded matrix span ${span} exceeds bandwidth ${bw}.`);
	A[i * bw + span] += value;
}
function bandedCholesky(A, n, bw) {
	const L = new Float64Array(n * bw);
	for (let i = 0; i < n; i++) {
		const j0 = Math.max(0, i - bw + 1);
		for (let j = j0; j <= i; j++) {
			let sum = A[i * bw + (i - j)];
			const kStart = Math.max(j0, j - bw + 1);
			for (let k = kStart; k < j; k++) sum -= L[i * bw + (i - k)] * L[j * bw + (j - k)];
			if (i === j) {
				if (!(sum > 0)) return null;
				L[i * bw] = Math.sqrt(sum);
			} else {
				const pivot = L[j * bw];
				if (!(pivot > 0)) return null;
				L[i * bw + (i - j)] = sum / pivot;
			}
		}
	}
	return L;
}
function bandedSolve(L, n, bw, b) {
	const y = new Float64Array(n);
	const x = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		let sum = b[i];
		const k0 = Math.max(0, i - bw + 1);
		for (let k = k0; k < i; k++) sum -= L[i * bw + (i - k)] * y[k];
		y[i] = sum / L[i * bw];
	}
	for (let i = n - 1; i >= 0; i--) {
		let sum = y[i];
		const k1 = Math.min(n - 1, i + bw - 1);
		for (let k = i + 1; k <= k1; k++) sum -= L[k * bw + (k - i)] * x[k];
		x[i] = sum / L[i * bw];
	}
	return x;
}
function bandedForward(L, n, bw, b) {
	const y = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		let sum = b[i];
		const k0 = Math.max(0, i - bw + 1);
		for (let k = k0; k < i; k++) sum -= L[i * bw + (i - k)] * y[k];
		y[i] = sum / L[i * bw];
	}
	return y;
}
/** Solve Lᵀ x = b. L is the banded Cholesky factor. */
function bandedBack(L, n, bw, b) {
	const x = new Float64Array(n);
	for (let i = n - 1; i >= 0; i--) {
		let sum = b[i];
		const k1 = Math.min(n - 1, i + bw - 1);
		for (let k = i + 1; k <= k1; k++) sum -= L[k * bw + (k - i)] * x[k];
		x[i] = sum / L[i * bw];
	}
	return x;
}
function bandedMatvec(A, n, bw, x, out) {
	for (let i = 0; i < n; i++) {
		let sum = A[i * bw] * x[i];
		const k0 = Math.max(0, i - bw + 1);
		for (let j = k0; j < i; j++) sum += A[i * bw + (i - j)] * x[j];
		const k1 = Math.min(n - 1, i + bw - 1);
		for (let j = i + 1; j <= k1; j++) sum += A[j * bw + (j - i)] * x[j];
		out[i] = sum;
	}
}
/** Symmetric Lanczos on A = L⁻¹ Kg L⁻ᵀ, with full reorthogonalisation.
* K = L Lᵀ stays factored by banded Cholesky. K − σ Kg is not factored:
* that pencil is indefinite once Kg changes sign, which pure bending does.
* Seeking the largest |μ| = 1/|λ| puts the ±λ cluster at the two ends of A,
* where a Krylov basis can separate neighbours that unshifted iteration cannot.
*/
function jacobiCyclic(matrix) {
	const n = matrix.length;
	const A = matrix.map((row) => row.slice());
	const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
	const rotate = (p, q) => {
		const app = A[p][p];
		const aqq = A[q][q];
		const apq = A[p][q];
		let t;
		if (Math.abs(app - aqq) <= 1e-18 * (Math.abs(app) + Math.abs(aqq) + 1)) t = apq >= 0 ? 1 : -1;
		else {
			const tau = (aqq - app) / (2 * apq);
			t = Math.sign(tau) / (Math.abs(tau) + Math.hypot(1, tau));
		}
		const c = 1 / Math.hypot(1, t);
		const s = t * c;
		A[p][p] = app - t * apq;
		A[q][q] = aqq + t * apq;
		A[p][q] = 0;
		A[q][p] = 0;
		for (let k = 0; k < n; k++) {
			const vip = V[k][p];
			const viq = V[k][q];
			V[k][p] = c * vip - s * viq;
			V[k][q] = s * vip + c * viq;
			if (k === p || k === q) continue;
			const aik = A[k][p];
			const akq = A[k][q];
			const nextP = c * aik - s * akq;
			const nextQ = s * aik + c * akq;
			A[k][p] = nextP;
			A[p][k] = nextP;
			A[k][q] = nextQ;
			A[q][k] = nextQ;
		}
	};
	for (let sweep = 0; sweep < 60; sweep++) {
		let off = 0;
		for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
		if (off <= 1e-28 * Math.max(1, n)) break;
		for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
			const scale = Math.abs(A[p][p]) + Math.abs(A[q][q]) + 1e-30;
			if (Math.abs(A[p][q]) > 1e-15 * scale) rotate(p, q);
		}
	}
	const values = A.map((row, i) => row[i]);
	return {
		values,
		vectors: values.map((_, col) => V.map((row) => row[col]))
	};
}
function bucklingModes(input) {
	const { K, Kg, factor, n, bw, keep, nodesX, xs, ys } = input;
	const fail = (reason) => ({
		ok: false,
		reason,
		lambdas: [],
		columns: [],
		iterations: 0
	});
	if (n < 1) return fail("There are no free degrees of freedom.");
	const maxSteps = Math.max(1, Math.min(n - 1, input.maxSteps));
	const gvec = new Float64Array(n);
	const rhs = new Float64Array(n);
	const dot = (a, b) => {
		let s = 0;
		for (let i = 0; i < n; i++) s += a[i] * b[i];
		return s;
	};
	const axpy = (y, x, scale) => {
		for (let i = 0; i < n; i++) y[i] += scale * x[i];
	};
	const applyA = (y) => {
		const u = bandedBack(factor, n, bw, y);
		bandedMatvec(Kg, n, bw, u, gvec);
		return bandedForward(factor, n, bw, gvec);
	};
	const rayleigh = (phi) => {
		bandedMatvec(K, n, bw, phi, rhs);
		bandedMatvec(Kg, n, bw, phi, gvec);
		let sk = 0;
		let sg = 0;
		for (let i = 0; i < n; i++) {
			sk += phi[i] * rhs[i];
			sg += phi[i] * gvec[i];
		}
		return sg !== 0 ? sk / sg : Number.POSITIVE_INFINITY;
	};
	const residualOf = (phi, lambda) => {
		bandedMatvec(K, n, bw, phi, rhs);
		bandedMatvec(Kg, n, bw, phi, gvec);
		let num = 0;
		let k2 = 0;
		for (let i = 0; i < n; i++) {
			const r = rhs[i] - lambda * gvec[i];
			num += r * r;
			k2 += rhs[i] * rhs[i];
		}
		const kn = Math.sqrt(k2);
		return kn > 0 ? Math.sqrt(num) / kn : 0;
	};
	const waves = [
		[1, 1],
		[2, 1],
		[3, 1],
		[1, 3],
		[4, 1],
		[2, 2],
		[1, 5],
		[5, 1],
		[3, 2],
		[1, 2]
	];
	const seed = new Float64Array(n);
	let rng = 123456789;
	for (let i = 0; i < n; i++) {
		const g = keep[i];
		const node = Math.floor(g / 3);
		const ix = node % nodesX;
		const iy = Math.floor(node / nodesX);
		let value = 0;
		if (g % 3 === 0) for (const wave of waves) value += Math.sin(wave[0] * Math.PI * xs[ix] / input.aMm) * Math.sin(wave[1] * Math.PI * ys[iy] / input.bMm);
		else value = .02 * Math.sin((ix + 1) * .7) * Math.cos((iy + 1) * .4);
		rng = Math.imul(1664525, rng) + 1013904223 >>> 0;
		seed[i] = value + (rng / 4294967296 - .5) * 1e-4;
	}
	let seedNorm = Math.sqrt(dot(seed, seed));
	if (!(seedNorm > 0)) {
		for (let i = 0; i < n; i++) seed[i] = 1;
		seedNorm = Math.sqrt(n);
	}
	for (let i = 0; i < n; i++) seed[i] = seed[i] / seedNorm;
	const Q = [];
	const AQ = [];
	let v = seed;
	let prev = null;
	let betaPrev = 0;
	let eigen = null;
	const project = () => {
		const m = Q.length;
		const M = Array.from({ length: m }, () => Array(m).fill(0));
		for (let a = 0; a < m; a++) for (let b = a; b < m; b++) {
			const s = .5 * (dot(Q[a], AQ[b]) + dot(Q[b], AQ[a]));
			M[a][b] = s;
			M[b][a] = s;
		}
		eigen = jacobiCyclic(M);
		return eigen;
	};
	const phiFrom = (coeffs) => {
		const y = new Float64Array(n);
		for (let k = 0; k < Q.length; k++) axpy(y, Q[k], coeffs[k] ?? 0);
		const yn = Math.sqrt(dot(y, y));
		if (yn > 0) for (let i = 0; i < n; i++) y[i] = y[i] / yn;
		return bandedBack(factor, n, bw, y);
	};
	const lowestPositive = () => {
		if (!eigen) return null;
		let best = -1;
		let bestMu = 0;
		for (let i = 0; i < eigen.values.length; i++) {
			const mu = eigen.values[i];
			if (mu > bestMu) {
				bestMu = mu;
				best = i;
			}
		}
		if (best < 0 || !(bestMu > 1e-18)) return null;
		const coeffs = eigen.vectors[best];
		if (!coeffs) return null;
		const phi = phiFrom(coeffs);
		const lambda = rayleigh(phi);
		if (!(lambda > 0) || !Number.isFinite(lambda)) return null;
		return residualOf(phi, lambda);
	};
	for (let step = 0; step < maxSteps; step++) {
		const Av = applyA(v);
		AQ.push(Float64Array.from(Av));
		Q.push(v);
		if (prev) axpy(Av, prev, -betaPrev);
		const alpha = dot(v, Av);
		axpy(Av, v, -alpha);
		for (let pass = 0; pass < 2; pass++) for (const q of Q) {
			const overlap = dot(Av, q);
			if (overlap !== 0) axpy(Av, q, -overlap);
		}
		const beta = Math.sqrt(Math.max(0, dot(Av, Av)));
		const scale = Math.abs(alpha) + betaPrev + beta;
		const dependent = !(beta > Math.max(1e-14, 1e-12 * Math.max(1, scale)));
		if (dependent || Q.length === maxSteps || Q.length >= 12 && Q.length % 12 === 0) {
			eigen = project();
			const lead = lowestPositive();
			if (dependent || lead != null && lead < 1e-9) break;
		}
		if (dependent) break;
		prev = v;
		betaPrev = beta;
		const next = new Float64Array(n);
		const invBeta = 1 / beta;
		for (let i = 0; i < n; i++) next[i] = Av[i] * invBeta;
		v = next;
	}
	if (!eigen) eigen = project();
	if (Q.length < 1) return fail("The eigenvalue iteration did not produce a basis.");
	const order = eigen.values.map((mu, index) => ({
		mu,
		index,
		lambda: Math.abs(mu) > 1e-18 ? 1 / mu : Number.POSITIVE_INFINITY
	})).filter((row) => Number.isFinite(row.lambda) && Math.abs(row.lambda) < 0xe8d4a51000).sort((p, q) => Math.abs(p.lambda) - Math.abs(q.lambda));
	const keepCount = Math.min(8, order.length);
	const columns = [];
	const lambdas = [];
	for (let c = 0; c < keepCount; c++) {
		const coeffs = eigen.vectors[order[c].index];
		if (!coeffs) continue;
		const phi = phiFrom(coeffs);
		const lambda = rayleigh(phi);
		columns.push(phi);
		lambdas.push(Number.isFinite(lambda) ? lambda : order[c].lambda);
	}
	let lead = -1;
	let leadLambda = Infinity;
	for (let c = 0; c < lambdas.length; c++) {
		const lambda = lambdas[c];
		if (lambda > 1e-8 && lambda < leadLambda) {
			leadLambda = lambda;
			lead = c;
		}
	}
	if (lead >= 0 && residualOf(columns[lead], leadLambda) > 1e-9) {
		const cluster = [];
		for (let c = 0; c < lambdas.length; c++) {
			if (c === lead) continue;
			const lambda = lambdas[c];
			if (Number.isFinite(lambda) && Math.abs(Math.abs(lambda) - leadLambda) / leadLambda < .25) cluster.push(columns[c]);
		}
		let vec = Float64Array.from(columns[lead]);
		let bestVec = Float64Array.from(vec);
		let bestLambda = leadLambda;
		let bestResidual = residualOf(vec, leadLambda);
		const tmp = new Float64Array(n);
		for (let polish = 0; polish < 6 && bestResidual > 1e-9; polish++) {
			bandedMatvec(Kg, n, bw, vec, gvec);
			const y = bandedSolve(factor, n, bw, gvec);
			for (const other of cluster) {
				bandedMatvec(Kg, n, bw, other, tmp);
				let gg = 0;
				let pg = 0;
				for (let i = 0; i < n; i++) {
					gg += other[i] * tmp[i];
					pg += y[i] * tmp[i];
				}
				if (Math.abs(gg) > 0) {
					const alpha = pg / gg;
					for (let i = 0; i < n; i++) y[i] -= alpha * other[i];
				}
			}
			const lambda = rayleigh(y);
			if (!Number.isFinite(lambda) || !(lambda > 0)) break;
			if (Math.abs(lambda - leadLambda) / leadLambda > .05) break;
			const scaleN = Math.sqrt(dot(y, y));
			if (!(scaleN > 0)) break;
			for (let i = 0; i < n; i++) vec[i] = y[i] / scaleN;
			const got = residualOf(vec, lambda);
			if (got < bestResidual) {
				bestResidual = got;
				bestLambda = lambda;
				bestVec = Float64Array.from(vec);
			} else break;
		}
		columns[lead] = bestVec;
		lambdas[lead] = bestLambda;
	}
	return {
		ok: true,
		reason: "",
		lambdas,
		columns,
		iterations: Q.length
	};
}
/** Plane-stress pre-buckling field for an edge patch load.
* Stage 1 of the buckling solve. Not a code resistance.
* Compression is positive in the stresses returned to Kg.
*/
function shape$1(xi, eta) {
	return [
		{
			x: -1,
			y: -1
		},
		{
			x: 1,
			y: -1
		},
		{
			x: 1,
			y: 1
		},
		{
			x: -1,
			y: 1
		}
	].map((p) => ({
		n: .25 * (1 + p.x * xi) * (1 + p.y * eta),
		dxi: .25 * p.x * (1 + p.y * eta),
		deta: .25 * p.y * (1 + p.x * xi)
	}));
}
function fail(reason) {
	return {
		ok: false,
		reason,
		sigX: /* @__PURE__ */ new Float64Array(),
		sigY: /* @__PURE__ */ new Float64Array(),
		tau: /* @__PURE__ */ new Float64Array(),
		equilibrium: 0,
		appliedN: 0,
		appliedFx: 0,
		appliedFy: 0,
		reactionFx: 0,
		reactionFy: 0,
		momentNmm: 0,
		forceImbalance: 0,
		note: ""
	};
}
function patchInterval(patch, edgeLength) {
	if (!(patch.lengthMm > 0)) return "Loaded length must be positive.";
	if (!Number.isFinite(patch.forceN) || patch.forceN === 0) return "Patch force is zero.";
	if (patch.lengthMm > edgeLength + 1e-6) return "Loaded length is longer than the edge.";
	const start = patch.atMm - patch.lengthMm / 2;
	const end = patch.atMm + patch.lengthMm / 2;
	if (start < -1e-6 || end > edgeLength + 1e-6) return "The patch does not lie on the edge.";
	return {
		start: Math.max(0, start),
		end: Math.min(edgeLength, end)
	};
}
function solvePatchPrestress(input) {
	const { xs, ys, tMm, eMpa, nu, patch } = input;
	const nx = xs.length - 1;
	const ny = ys.length - 1;
	if (nx < 1 || ny < 1) return fail("The mesh has no elements.");
	const a = xs[nx] - xs[0];
	const b = ys[ny] - ys[0];
	const interval = patchInterval(patch, patch.edge === "x0" || patch.edge === "x1" ? b : a);
	if (typeof interval === "string") return fail(interval);
	const nodesX = nx + 1;
	const ndof = nodesX * (ny + 1) * 2;
	const bw = 2 * nodesX + 8;
	const along = patch.edge === "y0" || patch.edge === "y1" ? xs : ys;
	const covers = (p, q) => {
		const lo = Math.min(p, q);
		const hi = Math.max(p, q);
		return lo >= interval.start - 1e-4 && hi <= interval.end + 1e-4 && hi - lo > 1e-8;
	};
	const free = new Int32Array(ndof).fill(-1);
	const held = new Uint8Array(ndof);
	const hold = (dof) => {
		held[dof] = 1;
	};
	if (patch.edge === "y1" || patch.edge === "y0") {
		const iy = patch.edge === "y1" ? 0 : ny;
		for (let ix = 0; ix < nodesX; ix++) hold((iy * nodesX + ix) * 2 + 1);
		hold(iy * nodesX * 2);
	} else {
		const ix = patch.edge === "x1" ? 0 : nx;
		for (let iy = 0; iy <= ny; iy++) hold((iy * nodesX + ix) * 2);
		hold(1);
	}
	const keep = [];
	for (let dof = 0; dof < ndof; dof++) if (!held[dof]) {
		free[dof] = keep.length;
		keep.push(dof);
	}
	const n = keep.length;
	if (n < 1) return fail("The in-plane restraints removed every degree of freedom.");
	const K = new Float64Array(n * bw);
	const fac = eMpa / (1 - nu * nu);
	const C = [
		fac,
		fac * nu,
		0,
		fac * nu,
		fac,
		0,
		0,
		0,
		fac * (1 - nu) / 2
	];
	const gp = [-1 / Math.sqrt(3), 1 / Math.sqrt(3)];
	for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
		const ae = xs[ix + 1] - xs[ix];
		const be = ys[iy + 1] - ys[iy];
		const ids = [
			iy * nodesX + ix,
			iy * nodesX + ix + 1,
			(iy + 1) * nodesX + ix + 1,
			(iy + 1) * nodesX + ix
		];
		for (const xi of gp) for (const eta of gp) {
			const sh = shape$1(xi, eta);
			const detJ = ae / 2 * (be / 2);
			const dNdx = sh.map((p) => p.dxi * (2 / ae));
			const dNdy = sh.map((p) => p.deta * (2 / be));
			const B = [
				/* @__PURE__ */ new Float64Array(8),
				/* @__PURE__ */ new Float64Array(8),
				/* @__PURE__ */ new Float64Array(8)
			];
			for (let i = 0; i < 4; i++) {
				B[0][i * 2] = dNdx[i];
				B[1][i * 2 + 1] = dNdy[i];
				B[2][i * 2] = dNdy[i];
				B[2][i * 2 + 1] = dNdx[i];
			}
			for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) {
				let s = 0;
				for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) s += B[p][a] * C[p * 3 + q] * B[q][b];
				const ga = ids[Math.floor(a / 2)] * 2 + a % 2;
				const gb = ids[Math.floor(b / 2)] * 2 + b % 2;
				const fi = free[ga];
				const fj = free[gb];
				if (fi < 0 || fj < 0 || fi < fj) continue;
				bandAdd(K, bw, fi, fj, s * detJ * tMm);
			}
		}
	}
	const load = new Float64Array(n);
	const applied = new Float64Array(ndof);
	let appliedFx = 0;
	let appliedFy = 0;
	const q = patch.forceN / patch.lengthMm;
	const addEdge = (n0, n1, length, direction, sign) => {
		const share = sign * q * length / 2;
		for (const node of [n0, n1]) {
			const dof = node * 2 + direction;
			const f = free[dof];
			if (f >= 0) {
				load[f] += share;
				applied[dof] += share;
				if (direction === 0) appliedFx += share;
				else appliedFy += share;
			}
		}
	};
	if (patch.edge === "y1" || patch.edge === "y0") {
		const iy = patch.edge === "y1" ? ny : 0;
		const sign = patch.edge === "y1" ? -1 : 1;
		for (let ix = 0; ix < nx; ix++) {
			if (!covers(along[ix], along[ix + 1])) continue;
			addEdge(iy * nodesX + ix, iy * nodesX + ix + 1, xs[ix + 1] - xs[ix], 1, sign);
		}
	} else {
		const ix = patch.edge === "x1" ? nx : 0;
		const sign = patch.edge === "x1" ? -1 : 1;
		for (let iy = 0; iy < ny; iy++) {
			if (!covers(along[iy], along[iy + 1])) continue;
			addEdge(iy * nodesX + ix, (iy + 1) * nodesX + ix, ys[iy + 1] - ys[iy], 0, sign);
		}
	}
	const factor = bandedCholesky(K, n, bw);
	if (!factor) return fail("The in-plane stiffness is singular for this patch and these restraints.");
	let appliedSigned = 0;
	for (let i = 0; i < n; i++) appliedSigned += load[i];
	const loadSign = patch.edge === "y1" || patch.edge === "x1" ? -1 : 1;
	const appliedN = appliedSigned / loadSign;
	const appliedError = patch.forceN !== 0 ? Math.abs(appliedN - patch.forceN) / Math.abs(patch.forceN) : 0;
	if (!(Math.abs(appliedN) > 0) || appliedError > .005) return fail(`The patch force was not applied to the mesh. Requested ${patch.forceN.toFixed(2)} N, nodal resultant ${appliedN.toFixed(2)} N.`);
	const solved = bandedSolve(factor, n, bw, load);
	const u = new Float64Array(ndof);
	for (let i = 0; i < n; i++) u[keep[i]] = solved[i];
	const count = nx * ny;
	const sigX = new Float64Array(count);
	const sigY = new Float64Array(count);
	const tau = new Float64Array(count);
	let equilibrium = 0;
	for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
		const ae = xs[ix + 1] - xs[ix];
		const be = ys[iy + 1] - ys[iy];
		const ids = [
			iy * nodesX + ix,
			iy * nodesX + ix + 1,
			(iy + 1) * nodesX + ix + 1,
			(iy + 1) * nodesX + ix
		];
		const sh = shape$1(0, 0);
		const dNdx = sh.map((p) => p.dxi * (2 / ae));
		const dNdy = sh.map((p) => p.deta * (2 / be));
		let ex = 0;
		let ey = 0;
		let gxy = 0;
		for (let i = 0; i < 4; i++) {
			const uu = u[ids[i] * 2];
			const vv = u[ids[i] * 2 + 1];
			ex += dNdx[i] * uu;
			ey += dNdy[i] * vv;
			gxy += dNdy[i] * uu + dNdx[i] * vv;
		}
		const sx = fac * (ex + nu * ey);
		const sy = fac * (nu * ex + ey);
		const txy = fac * (1 - nu) / 2 * gxy;
		const slot = iy * nx + ix;
		sigX[slot] = -sx;
		sigY[slot] = -sy;
		tau[slot] = txy;
		if (iy === Math.floor(ny / 2)) equilibrium += sigY[slot] * tMm * ae;
	}
	const normal = patch.edge === "x0" || patch.edge === "x1";
	let flow = 0;
	if (normal) {
		const ix = Math.floor(nx / 2);
		for (let iy = 0; iy < ny; iy++) flow += sigX[iy * nx + ix] * tMm * (ys[iy + 1] - ys[iy]);
	} else flow = equilibrium;
	const imbalance = patch.forceN !== 0 ? Math.abs(flow - patch.forceN) / Math.abs(patch.forceN) : 0;
	const fInt = new Float64Array(ndof);
	for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
		const ae = xs[ix + 1] - xs[ix];
		const be = ys[iy + 1] - ys[iy];
		const ids = [
			iy * nodesX + ix,
			iy * nodesX + ix + 1,
			(iy + 1) * nodesX + ix + 1,
			(iy + 1) * nodesX + ix
		];
		for (const xi of gp) for (const eta of gp) {
			const sh = shape$1(xi, eta);
			const detJ = ae / 2 * (be / 2);
			const dNdx = sh.map((p) => p.dxi * (2 / ae));
			const dNdy = sh.map((p) => p.deta * (2 / be));
			let ex = 0;
			let ey = 0;
			let gxy = 0;
			for (let i = 0; i < 4; i++) {
				ex += dNdx[i] * u[ids[i] * 2];
				ey += dNdy[i] * u[ids[i] * 2 + 1];
				gxy += dNdy[i] * u[ids[i] * 2] + dNdx[i] * u[ids[i] * 2 + 1];
			}
			const sx = fac * (ex + nu * ey);
			const sy = fac * (nu * ex + ey);
			const txy = fac * (1 - nu) / 2 * gxy;
			const B0 = [
				dNdx[0],
				0,
				dNdx[1],
				0,
				dNdx[2],
				0,
				dNdx[3],
				0
			];
			const B1 = [
				0,
				dNdy[0],
				0,
				dNdy[1],
				0,
				dNdy[2],
				0,
				dNdy[3]
			];
			const B2 = [
				dNdy[0],
				dNdx[0],
				dNdy[1],
				dNdx[1],
				dNdy[2],
				dNdx[2],
				dNdy[3],
				dNdx[3]
			];
			const weight = detJ * tMm;
			for (let a = 0; a < 8; a++) {
				const dof = ids[Math.floor(a / 2)] * 2 + a % 2;
				fInt[dof] += (B0[a] * sx + B1[a] * sy + B2[a] * txy) * weight;
			}
		}
	}
	let reactionFx = 0;
	let reactionFy = 0;
	let moment = 0;
	for (let iy = 0; iy <= ny; iy++) for (let ix = 0; ix < nodesX; ix++) {
		const dx = (iy * nodesX + ix) * 2;
		const dy = dx + 1;
		const fx = held[dx] ? fInt[dx] : applied[dx];
		const fy = held[dy] ? fInt[dy] : applied[dy];
		if (held[dx]) reactionFx += fInt[dx];
		if (held[dy]) reactionFy += fInt[dy];
		moment += (xs[ix] - a / 2) * fy - (ys[iy] - b / 2) * fx;
	}
	const forceScale = Math.max(Math.abs(appliedFx), Math.abs(appliedFy), Math.abs(patch.forceN), 1);
	const forceImbalance = Math.hypot(appliedFx + reactionFx, appliedFy + reactionFy) / forceScale;
	if (forceImbalance > .005) return fail(`Pre-buckling equilibrium failed. ΣFx = ${(appliedFx + reactionFx).toFixed(2)} N, ΣFy = ${(appliedFy + reactionFy).toFixed(2)} N, ΣMz = ${moment.toExponential(3)} N·mm. The eigenvalue is not trusted.`);
	return {
		ok: true,
		reason: "",
		sigX,
		sigY,
		tau,
		equilibrium: imbalance,
		appliedN,
		note: [
			"TWO-STAGE BUCKLING. Stage 1 is a linear plane-stress solve for the patch.",
			"The patch is a uniform normal traction over the loaded length, not a point force and not a rectangular stress block.",
			"Positive force pushes into the plate. The opposite edge is restrained in the normal direction. One extra restraint stops in-plane rigid motion. Side edges are free in-plane.",
			"Stage 2 builds Kg from the recovered element stresses, added to any σx, σy and τxy you entered. λ multiplies that whole field.",
			"Out-of-plane eccentricity is not in this model.",
			`Requested patch force ${patch.forceN.toFixed(2)} N. Applied nodal force ${appliedN.toFixed(2)} N. Difference ${(appliedError * 100).toFixed(4)}%.`,
			`Equilibrium check: the integrated compressive force on a mid-span cut is ${flow.toFixed(2)} N against the applied ${patch.forceN.toFixed(2)} N.`,
			`Applied Fx ${appliedFx.toFixed(2)} N. Applied Fy ${appliedFy.toFixed(2)} N. Reaction Fx ${reactionFx.toFixed(2)} N. Reaction Fy ${reactionFy.toFixed(2)} N. Force imbalance ${(forceImbalance * 100).toFixed(4)}%. Moment about the plate centre ${moment.toExponential(3)} N·mm.`,
			`ΣFx ${(appliedFx + reactionFx).toExponential(3)} N. ΣFy ${(appliedFy + reactionFy).toExponential(3)} N. ΣMz ${moment.toExponential(3)} N·mm.`
		].join(" "),
		appliedFx,
		appliedFy,
		reactionFx,
		reactionFy,
		momentNmm: moment,
		forceImbalance
	};
}
/** Frozen elastic plate engine. Design-code work must not change this without re-running the elastic suite. */
var ELASTIC_ENGINE = {
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
		"α = 4 shear and the off-centre patch are still moving on the finest mesh run here."
	]
};
function engineLine() {
	return `ELASTIC ENGINE ${ELASTIC_ENGINE.id} (${ELASTIC_ENGINE.date}). ${ELASTIC_ENGINE.solver}`;
}
/**
* Rectangular Mindlin plate, bilinear quad, reduced shear integration.
* Banded K and Kg. K φ = λ Kg φ. Eigenvectors feed the mode viewer.
* Not a copy of the Navier coefficient.
*/
var MESH_STUDY_SIZES = [
	10,
	20,
	40,
	80
];
var MAX_ELEMENTS = 80;
var RIGID_FACTOR = 1e4;
var G3 = 1 / Math.sqrt(3);
function shape(xi, eta) {
	return [
		{
			x: -1,
			y: -1
		},
		{
			x: 1,
			y: -1
		},
		{
			x: 1,
			y: 1
		},
		{
			x: -1,
			y: 1
		}
	].map((p) => ({
		n: .25 * (1 + p.x * xi) * (1 + p.y * eta),
		dxi: .25 * p.x * (1 + p.y * eta),
		deta: .25 * p.y * (1 + p.x * xi)
	}));
}
function restrain(kind, mask) {
	if (kind === "free") return;
	mask.w = true;
	if (kind === "fixed") {
		mask.bx = true;
		mask.by = true;
	}
}
function stations(length, divisions, cuts) {
	const raw = [0];
	for (let i = 1; i < divisions; i++) raw.push(length * i / divisions);
	raw.push(length);
	for (const cut of cuts) if (cut > length * 1e-5 && cut < length * .99999) raw.push(cut);
	raw.sort((p, q) => p - q);
	const out = [];
	for (const value of raw) if (out.length === 0 || value - out[out.length - 1] > Math.max(1e-4, length * 1e-6)) out.push(value);
	return out;
}
function tauAt(y, input) {
	const samples = input.tauSamples;
	if (samples && samples.length >= 2) {
		const ordered = [...samples].sort((p, q) => p.yMm - q.yMm);
		if (y <= ordered[0].yMm) return ordered[0].tauMpa;
		const last = ordered[ordered.length - 1];
		if (y >= last.yMm) return last.tauMpa;
		for (let i = 1; i < ordered.length; i++) {
			const right = ordered[i];
			const left = ordered[i - 1];
			if (y <= right.yMm) {
				const span = right.yMm - left.yMm;
				const t = span === 0 ? 0 : (y - left.yMm) / span;
				return left.tauMpa + t * (right.tauMpa - left.tauMpa);
			}
		}
	}
	return input.tauMpa;
}
function sigmaYAt(x, y, input) {
	let stress = input.sigmaYMpa ?? 0;
	for (const patch of input.patches ?? []) {
		const x0 = Math.min(patch.x0, patch.x1);
		const x1 = Math.max(patch.x0, patch.x1);
		const y0 = Math.min(patch.y0, patch.y1);
		const y1 = Math.max(patch.y0, patch.y1);
		if (x >= x0 && x <= x1 && y >= y0 && y <= y1) stress += patch.sigmaYMpa;
	}
	return stress;
}
function countHalfWaves(w, xs, ys, axis) {
	if (w.length !== xs.length * ys.length || xs.length < 2 || ys.length < 2) return 0;
	const fractions = [
		.5,
		.25,
		.75
	];
	let bestCount = 0;
	let bestPeak = -1;
	for (const fraction of fractions) {
		const line = [];
		if (axis === "x") {
			const iy = Math.min(ys.length - 1, Math.max(0, Math.round((ys.length - 1) * fraction)));
			for (let ix = 0; ix < xs.length; ix++) line.push(w[iy * xs.length + ix] ?? 0);
		} else {
			const ix = Math.min(xs.length - 1, Math.max(0, Math.round((xs.length - 1) * fraction)));
			for (let iy = 0; iy < ys.length; iy++) line.push(w[iy * xs.length + ix] ?? 0);
		}
		let peak = 0;
		for (const value of line) peak = Math.max(peak, Math.abs(value));
		if (peak <= bestPeak) continue;
		const floor = peak * 1e-4;
		let changes = 0;
		let prev = 0;
		let have = false;
		for (const value of line) {
			if (Math.abs(value) <= floor) continue;
			if (have && prev * value < 0) changes += 1;
			prev = value;
			have = true;
		}
		bestPeak = peak;
		bestCount = have ? changes + 1 : 0;
	}
	return bestCount;
}
function previewMesh(aMm, bMm, nx, ny, xCuts = [], yCuts = []) {
	if (!(aMm > 0 && bMm > 0) || nx < 2 || ny < 2 || nx > MAX_ELEMENTS || ny > MAX_ELEMENTS) return [];
	return meshFromCoords(stations(aMm, nx, xCuts), stations(bMm, ny, yCuts));
}
function meshFromCoords(xs, ys) {
	const lines = [];
	const y0 = ys[0] ?? 0;
	const y1 = ys[ys.length - 1] ?? 0;
	const x0 = xs[0] ?? 0;
	const x1 = xs[xs.length - 1] ?? 0;
	for (const x of xs) lines.push({
		x1: x,
		y1: y0,
		x2: x,
		y2: y1
	});
	for (const y of ys) lines.push({
		x1: x0,
		y1: y,
		x2: x1,
		y2: y
	});
	return lines;
}
function blank(reason) {
	return {
		ok: false,
		reason,
		elements: 0,
		nodes: 0,
		dof: 0,
		freeDof: 0,
		nx: 0,
		ny: 0,
		xs: [],
		ys: [],
		elementAspect: 0,
		aspectWarning: "",
		modes: [],
		iterations: 0,
		residual: 0,
		residualBalanced: 0,
		spectrum: [],
		solverTolerance: 1e-8,
		seconds: 0,
		mesh: [],
		formulation: "",
		note: "",
		prestressNote: "",
		stiffenerNotes: [],
		minAspect: 0,
		maxElementMm: 0,
		minElementMm: 0,
		symmetryNote: "",
		membrane: null
	};
}
function nearestIndex(coords, value) {
	let best = 0;
	let dist = Infinity;
	coords.forEach((coord, index) => {
		const d = Math.abs(coord - value);
		if (d < dist) {
			dist = d;
			best = index;
		}
	});
	return best;
}
function solvePlateFem(input) {
	const started = Date.now();
	const nxIn = Math.round(input.nx);
	const nyIn = Math.round(input.ny);
	if (nxIn < 2 || nyIn < 2 || nxIn > MAX_ELEMENTS || nyIn > MAX_ELEMENTS) return blank(`Use between 2 and ${MAX_ELEMENTS} elements on each side.`);
	if (!(input.aMm > 0 && input.bMm > 0 && input.tMm > 0 && input.eMpa > 0)) return blank("Plate size and E must be positive.");
	if (!(input.nu > 0 && input.nu < .5)) return blank("Poisson's ratio must be between 0 and 0.5.");
	const stiffeners = input.stiffeners ?? [];
	const patch = input.patchLoad;
	if (patch) {
		const interval = patchInterval(patch, patch.edge === "x0" || patch.edge === "x1" ? input.bMm : input.aMm);
		if (typeof interval === "string") return blank(interval);
	}
	const patchCuts = patch && patch.lengthMm > 0 ? [patch.atMm - patch.lengthMm / 2, patch.atMm + patch.lengthMm / 2] : [];
	const xs = stations(input.aMm, nxIn, [...stiffeners.filter((item) => item.axis === "y").map((item) => item.atMm), ...patch && (patch.edge === "y0" || patch.edge === "y1") ? patchCuts : []]);
	const ys = stations(input.bMm, nyIn, [...stiffeners.filter((item) => item.axis === "x").map((item) => item.atMm), ...patch && (patch.edge === "x0" || patch.edge === "x1") ? patchCuts : []]);
	const nx = xs.length - 1;
	const ny = ys.length - 1;
	if (nx > MAX_ELEMENTS || ny > MAX_ELEMENTS) return blank(`The mesh plus stiffener lines needs ${nx} × ${ny} elements. The limit is ${MAX_ELEMENTS} on a side.`);
	const nodesX = nx + 1;
	const nodesY = ny + 1;
	const nodes = nodesX * nodesY;
	const ndof = nodes * 3;
	let maxAspect = 1;
	let minAspect = Infinity;
	let minElementMm = Infinity;
	let maxElementMm = 0;
	for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
		const ae = xs[ix + 1] - xs[ix];
		const be = ys[iy + 1] - ys[iy];
		const ratio = ae > be ? ae / be : be / ae;
		if (ratio > maxAspect) maxAspect = ratio;
		if (ratio < minAspect) minAspect = ratio;
		minElementMm = Math.min(minElementMm, ae, be);
		maxElementMm = Math.max(maxElementMm, ae, be);
	}
	if (!Number.isFinite(minAspect)) minAspect = 1;
	const aspectWarning = maxAspect > 3 ? `An element aspect ratio reaches ${maxAspect.toFixed(2)}. Above 3 the eigenvalue is less trustworthy.` : "";
	const free = new Int32Array(ndof).fill(-1);
	const keep = [];
	for (let iy = 0; iy < nodesY; iy++) for (let ix = 0; ix < nodesX; ix++) {
		const mask = {
			w: false,
			bx: false,
			by: false
		};
		if (ix === 0) restrain(input.edges.x0, mask);
		if (ix === nx) restrain(input.edges.x1, mask);
		if (iy === 0) restrain(input.edges.y0, mask);
		if (iy === ny) restrain(input.edges.y1, mask);
		const node = iy * nodesX + ix;
		for (let local = 0; local < 3; local++) if (!(local === 0 ? mask.w : local === 1 ? mask.bx : mask.by)) {
			free[node * 3 + local] = keep.length;
			keep.push(node * 3 + local);
		}
	}
	const n = keep.length;
	if (n < 6) return blank("Not enough free degrees of freedom.");
	const bw = 3 * nodesX + 6;
	if (!(Math.max(Math.abs(input.sigma1Mpa), Math.abs(input.tauMpa), Math.abs(input.sigmaYMpa ?? 0), ...(input.tauSamples ?? []).map((sample) => Math.abs(sample.tauMpa)), ...(input.patches ?? []).map((item) => Math.abs(item.sigmaYMpa)), patch && patch.forceN !== 0 ? 1 : 0) > 0)) return blank("Set a non-zero stress or a patch force before running the eigenvalue solve.");
	const s0 = input.sigma1Mpa;
	const sB = input.sigma1Mpa * input.psi;
	const compressive = Math.max(s0, sB, input.sigmaYMpa ?? 0);
	const shearPresent = Math.abs(input.tauMpa) > 1e-9 || (input.tauSamples ?? []).some((sample) => Math.abs(sample.tauMpa) > 1e-9);
	const patchPushes = Boolean(patch && patch.forceN > 0);
	if (!shearPresent && !patchPushes && compressive <= 1e-9 && (Math.abs(s0) > 1e-9 || Math.abs(sB) > 1e-9 || patch && patch.forceN < 0)) return blank("The direct stress is tensile and there is no compressive patch or shear. This is not a compression-buckling case.");
	let pre = null;
	if (patch && patch.forceN !== 0) {
		pre = solvePatchPrestress({
			xs,
			ys,
			tMm: input.tMm,
			eMpa: input.eMpa,
			nu: input.nu,
			patch
		});
		if (!pre.ok) return blank(pre.reason);
	}
	const D = input.eMpa * input.tMm ** 3 / (12 * (1 - input.nu ** 2));
	const Gmod = input.eMpa / (2 * (1 + input.nu));
	const Db = [
		[
			D,
			D * input.nu,
			0
		],
		[
			D * input.nu,
			D,
			0
		],
		[
			0,
			0,
			D * (1 - input.nu) / 2
		]
	];
	const Ds = 5 / 6 * Gmod * input.tMm;
	const K = new Float64Array(n * bw);
	const Kg = new Float64Array(n * bw);
	let symAbs = 0;
	let symScale = 0;
	const gp2 = [-G3, G3];
	const scatter12 = (ke, kg, ids) => {
		for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) for (let ia = 0; ia < 3; ia++) for (let ib = 0; ib < 3; ib++) {
			const fi = free[ids[a] * 3 + ia];
			const fj = free[ids[b] * 3 + ib];
			if (fi < 0 || fj < 0 || fi < fj) continue;
			const slot = (a * 3 + ia) * 12 + (b * 3 + ib);
			bandAdd(K, bw, fi, fj, ke[slot]);
			bandAdd(Kg, bw, fi, fj, kg[slot]);
		}
	};
	for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
		const ae = xs[ix + 1] - xs[ix];
		const be = ys[iy + 1] - ys[iy];
		const ids = [
			iy * nodesX + ix,
			iy * nodesX + ix + 1,
			(iy + 1) * nodesX + ix + 1,
			(iy + 1) * nodesX + ix
		];
		const eIndex = iy * nx + ix;
		const preX = pre ? pre.sigX[eIndex] : 0;
		const preY = pre ? pre.sigY[eIndex] : 0;
		const preT = pre ? pre.tau[eIndex] : 0;
		const xN = [
			xs[ix],
			xs[ix + 1],
			xs[ix + 1],
			xs[ix]
		];
		const yN = [
			ys[iy],
			ys[iy],
			ys[iy + 1],
			ys[iy + 1]
		];
		const ke = /* @__PURE__ */ new Float64Array(144);
		const kg = /* @__PURE__ */ new Float64Array(144);
		const accum = (xi, eta, wt, shear, bend, geo) => {
			const sh = shape(xi, eta);
			const detJ = ae / 2 * (be / 2);
			const dNdx = sh.map((p) => p.dxi * (2 / ae));
			const dNdy = sh.map((p) => p.deta * (2 / be));
			if (bend) {
				const Bb = [
					/* @__PURE__ */ new Float64Array(12),
					/* @__PURE__ */ new Float64Array(12),
					/* @__PURE__ */ new Float64Array(12)
				];
				for (let i = 0; i < 4; i++) {
					Bb[0][i * 3 + 1] = dNdx[i];
					Bb[1][i * 3 + 2] = dNdy[i];
					Bb[2][i * 3 + 1] = dNdy[i];
					Bb[2][i * 3 + 2] = dNdx[i];
				}
				for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
					let s = 0;
					for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) s += Bb[p][a] * Db[p][q] * Bb[q][b];
					ke[a * 12 + b] += s * detJ * wt;
				}
			}
			if (shear) {
				const Bs0 = /* @__PURE__ */ new Float64Array(12);
				const Bs1 = /* @__PURE__ */ new Float64Array(12);
				for (let i = 0; i < 4; i++) {
					Bs0[i * 3] = dNdx[i];
					Bs0[i * 3 + 1] = -sh[i].n;
					Bs1[i * 3] = dNdy[i];
					Bs1[i * 3 + 2] = -sh[i].n;
				}
				for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) ke[a * 12 + b] += Ds * (Bs0[a] * Bs0[b] + Bs1[a] * Bs1[b]) * detJ * wt;
			}
			if (!geo) return;
			let xPhys = 0;
			let yPhys = 0;
			for (let i = 0; i < 4; i++) {
				xPhys += sh[i].n * xN[i];
				yPhys += sh[i].n * yN[i];
			}
			const sig = input.sigma1Mpa * (1 - (1 - input.psi) * (yPhys / input.bMm)) + preX;
			const tau = tauAt(yPhys, input) + preT;
			const sigY = sigmaYAt(xPhys, yPhys, input) + preY;
			const gx = /* @__PURE__ */ new Float64Array(12);
			const gy = /* @__PURE__ */ new Float64Array(12);
			for (let i = 0; i < 4; i++) {
				gx[i * 3] = dNdx[i];
				gy[i * 3] = dNdy[i];
			}
			const s00 = input.tMm * sig;
			const s01 = input.tMm * tau;
			const s11 = input.tMm * sigY;
			for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) kg[a * 12 + b] += (gx[a] * (s00 * gx[b] + s01 * gy[b]) + gy[a] * (s01 * gx[b] + s11 * gy[b])) * detJ * wt;
		};
		for (const xi of gp2) for (const eta of gp2) accum(xi, eta, 1, false, true, true);
		accum(0, 0, 4, true, false, false);
		for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) {
			const dke = Math.abs(ke[a * 12 + b] - ke[b * 12 + a]);
			const dkg = Math.abs(kg[a * 12 + b] - kg[b * 12 + a]);
			symAbs = Math.max(symAbs, dke, dkg);
			symScale = Math.max(symScale, Math.abs(ke[a * 12 + b]), Math.abs(kg[a * 12 + b]));
		}
		scatter12(ke, kg, ids);
	}
	if (input.krNPerRadPerMm > 0) {
		const kr = input.krNPerRadPerMm;
		const spring = (kind, length, node, which) => {
			if (kind !== "elastic") return;
			const f = free[node * 3 + which];
			if (f >= 0) bandAdd(K, bw, f, f, kr * length / 2);
		};
		for (let iy = 0; iy < nodesY; iy++) {
			const length = iy === 0 || iy === ny ? iy === 0 ? ys[1] - ys[0] : ys[ny] - ys[ny - 1] : .5 * (ys[iy] - ys[iy - 1] + (ys[iy + 1] - ys[iy]));
			spring(input.edges.x0, length, iy * nodesX, 1);
			spring(input.edges.x1, length, iy * nodesX + nx, 1);
		}
		for (let ix = 0; ix < nodesX; ix++) {
			const length = ix === 0 || ix === nx ? ix === 0 ? xs[1] - xs[0] : xs[nx] - xs[nx - 1] : .5 * (xs[ix] - xs[ix - 1] + (xs[ix + 1] - xs[ix]));
			spring(input.edges.y0, length, ix, 2);
			spring(input.edges.y1, length, ny * nodesX + ix, 2);
		}
	}
	const stiffenerNotes = [];
	const seen = /* @__PURE__ */ new Set();
	for (const beam of stiffeners) {
		if (beam.axis === "x" && (beam.atMm <= 1e-6 || beam.atMm >= input.bMm - 1e-6)) {
			stiffenerNotes.push(`${beam.id}: y is on or outside the plate, so the beam is not added. An edge line is not turned into an extra panel.`);
			continue;
		}
		if (beam.axis === "y" && (beam.atMm <= 1e-6 || beam.atMm >= input.aMm - 1e-6)) {
			stiffenerNotes.push(`${beam.id}: x is on or outside the plate, so the beam is not added. An edge line is not turned into an extra panel.`);
			continue;
		}
		const key = `${beam.axis}:${beam.atMm.toFixed(3)}`;
		if (seen.has(key)) stiffenerNotes.push(`${beam.id}: coincident with another stiffener. Both sit on one mesh line and their stiffness adds. No extra panel is created.`);
		seen.add(key);
	}
	const preAt = (x, y) => {
		if (!pre) return {
			sigX: 0,
			sigY: 0
		};
		let ix = 0;
		let iy = 0;
		while (ix < nx - 1 && xs[ix + 1] < x) ix += 1;
		while (iy < ny - 1 && ys[iy + 1] < y) iy += 1;
		return {
			sigX: pre.sigX[iy * nx + ix],
			sigY: pre.sigY[iy * nx + ix]
		};
	};
	for (const beam of stiffeners) {
		if (!(beam.eiNmm2 > 0)) {
			stiffenerNotes.push(`${beam.id}: no EI, drawn only.`);
			continue;
		}
		if (beam.axis === "x" && (beam.atMm <= 1e-6 || beam.atMm >= input.bMm - 1e-6)) continue;
		if (beam.axis === "y" && (beam.atMm <= 1e-6 || beam.atMm >= input.aMm - 1e-6)) continue;
		const factor = beam.rigid ? RIGID_FACTOR : 1;
		const ei = beam.eiNmm2 * factor;
		const gj = Math.max(0, beam.gjNmm2) * factor;
		if (beam.axis === "x") {
			const iy = nearestIndex(ys, beam.atMm);
			const y = ys[iy];
			const axial = (input.sigma1Mpa * (1 - (1 - input.psi) * (y / input.bMm)) + preAt(input.aMm / 2, y).sigX) * beam.areaMm2;
			for (let ix = 0; ix < nx; ix++) addBeam(K, Kg, bw, free, iy * nodesX + ix, iy * nodesX + ix + 1, "x", xs[ix + 1] - xs[ix], ei, gj, axial);
			stiffenerNotes.push(`${beam.id}: longitudinal beam on mesh line y = ${y.toFixed(2)} mm (entered ${beam.atMm} mm). ${beam.rigid ? "EI and GJ scaled by 10000 for a rigid comparison." : "EI and GJ as entered."} Beam Kg uses N = σx A.`);
		} else {
			const ix = nearestIndex(xs, beam.atMm);
			const x = xs[ix];
			for (let iy = 0; iy < ny; iy++) {
				const y = .5 * (ys[iy] + ys[iy + 1]);
				addBeam(K, Kg, bw, free, iy * nodesX + ix, (iy + 1) * nodesX + ix, "y", ys[iy + 1] - ys[iy], ei, gj, (sigmaYAt(x, y, input) + preAt(x, y).sigY) * beam.areaMm2);
			}
			stiffenerNotes.push(`${beam.id}: transverse beam on mesh line x = ${x.toFixed(2)} mm (entered ${beam.atMm} mm). Beam Kg uses N = σy A.`);
		}
	}
	if (stiffeners.length > 0) {
		const liveLong = stiffeners.filter((beam) => beam.axis === "x" && beam.atMm > 1e-6 && beam.atMm < input.bMm - 1e-6 && beam.eiNmm2 > 0);
		const liveTrans = stiffeners.filter((beam) => beam.axis === "y" && beam.atMm > 1e-6 && beam.atMm < input.aMm - 1e-6 && beam.eiNmm2 > 0);
		for (const along of liveLong) for (const across of liveTrans) {
			const iy = nearestIndex(ys, along.atMm);
			const ix = nearestIndex(xs, across.atMm);
			stiffenerNotes.push(`SHOW CONNECTION NODES: ${along.id} and ${across.id} share plate node (${ix}, ${iy}) at x = ${xs[ix].toFixed(2)} mm, y = ${ys[iy].toFixed(2)} mm. w is the common displacement. The longitudinal beam bends with βx and twists with βy. The transverse beam bends with βy and twists with βx.`);
		}
		stiffenerNotes.unshift("SHOW FEM CONNECTIVITY: each line below names the mesh station the beam uses. Coincident stiffeners add EI and GJ on that one line and do not create a panel. A line on the plate edge is not assembled.");
	}
	const factor = bandedCholesky(K, n, bw);
	if (!factor) return blank("Elastic stiffness is singular for this mesh and these restraints.");
	const sought = Math.min(Math.max(input.modes ?? 4, 1), 6, n);
	const spread = Math.abs(input.psi - 1) > .001 && Math.abs(input.sigma1Mpa) > 0 || Math.abs(input.tauMpa) > 0 || (input.tauSamples?.some((sample) => Math.abs(sample.tauMpa) > 0) ?? false) || pre != null;
	const eigen = bucklingModes({
		K,
		Kg,
		factor,
		n,
		bw,
		keep,
		nodesX,
		xs,
		ys,
		aMm: input.aMm,
		bMm: input.bMm,
		maxSteps: Math.max(1, Math.min(n - 1, spread ? 120 : 36))
	});
	if (!eigen.ok) return blank(eigen.reason);
	const width = Math.max(eigen.columns.length, 1);
	const X = Array.from({ length: n }, () => new Float64Array(width));
	const lambdas = eigen.columns.length > 0 ? eigen.lambdas.slice() : [Number.POSITIVE_INFINITY];
	for (let c = 0; c < eigen.columns.length; c++) {
		const column = eigen.columns[c];
		for (let i = 0; i < n; i++) X[i][c] = column[i];
	}
	const iters = eigen.iterations;
	const gvec = new Float64Array(n);
	const rhs = new Float64Array(n);
	const pairOf = (col, lambda) => {
		bandedMatvec(K, n, bw, col, rhs);
		bandedMatvec(Kg, n, bw, col, gvec);
		let num = 0;
		let k2 = 0;
		let g2 = 0;
		for (let i = 0; i < n; i++) {
			const r = rhs[i] - lambda * gvec[i];
			num += r * r;
			k2 += rhs[i] * rhs[i];
			g2 += gvec[i] * gvec[i];
		}
		const rn = Math.sqrt(num);
		const kn = Math.sqrt(k2);
		const bal = kn + Math.abs(lambda) * Math.sqrt(g2);
		return {
			residual: kn > 0 ? rn / kn : 0,
			residualBalanced: bal > 0 ? rn / bal : 0
		};
	};
	const colOf = (c) => {
		const column = new Float64Array(n);
		for (let i = 0; i < n; i++) column[i] = X[i][c];
		return column;
	};
	const spectrum = lambdas.map((lambda, index) => {
		if (!Number.isFinite(lambda) || Math.abs(lambda) >= 0xe8d4a51000) return null;
		const pair = pairOf(colOf(index), lambda);
		return {
			index,
			lambda,
			residual: pair.residual,
			residualBalanced: pair.residualBalanced
		};
	}).filter((row) => row != null).sort((p, q) => Math.abs(p.lambda) - Math.abs(q.lambda));
	const ranked = spectrum.filter((row) => row.lambda > 1e-8 && row.lambda < 0xe8d4a51000);
	if (ranked.length === 0) return blank("No buckling eigenvalue in the sense of the applied field. Reversing the loads may buckle. That reversal is not reported as a compression capacity.");
	const leadRow = ranked[0];
	const residual = leadRow.residual;
	const residualBalanced = leadRow.residualBalanced;
	const solverTolerance = 1e-8;
	const wantShapes = input.shapes !== false;
	const tauRef = Math.max(Math.abs(input.tauMpa), ...(input.tauSamples ?? []).map((sample) => Math.abs(sample.tauMpa)));
	const modes = ranked.slice(0, sought).map((item) => {
		return {
			lambda: item.lambda,
			sigma1CrMpa: Math.abs(input.sigma1Mpa) > 0 ? item.lambda * input.sigma1Mpa : null,
			sigmaYCrMpa: Math.abs(input.sigmaYMpa ?? 0) > 0 ? item.lambda * input.sigmaYMpa : null,
			tauCrMpa: tauRef > 0 ? item.lambda * (input.tauMpa !== 0 ? input.tauMpa : tauRef) : null,
			patchCrN: patch && patch.forceN !== 0 ? item.lambda * patch.forceN : null,
			w: wantShapes ? normalisedW(X, item.index, keep, nodes) : []
		};
	});
	const symRel = symScale > 0 ? symAbs / symScale : 0;
	const symmetryNote = `K AND Kg SYMMETRY. Element matrices are symmetric by construction before scatter. Peak off-diagonal mismatch ${symAbs.toExponential(2)} against scale ${symScale.toExponential(2)}, relative ${symRel.toExponential(2)}. Band storage keeps only the lower triangle, so the global operators used by the solver are symmetric. NUMERICAL SANITY CHECK, not a code check.`;
	const specLine = spectrum.filter((row) => row.lambda > 0).slice(0, 5).map((row, index) => {
		const partner = spectrum.find((other) => other.lambda < 0 && Math.abs(Math.abs(other.lambda) - row.lambda) / row.lambda < .05);
		return `#${index + 1} λ=${row.lambda.toExponential(4)} r=${row.residual.toExponential(2)} rb=${row.residualBalanced.toExponential(2)}${partner ? ` partner=${partner.lambda.toExponential(4)}` : ""}`;
	}).join("; ");
	const positiveSpec = spectrum.filter((row) => row.lambda > 0);
	const separation = positiveSpec.length >= 2 ? (positiveSpec[1].lambda - positiveSpec[0].lambda) / positiveSpec[0].lambda : null;
	return {
		ok: true,
		reason: "",
		elements: nx * ny,
		nodes,
		dof: ndof,
		freeDof: n,
		nx,
		ny,
		xs,
		ys,
		elementAspect: maxAspect,
		aspectWarning,
		modes,
		iterations: iters,
		residual,
		residualBalanced,
		spectrum: spectrum.slice(0, 8).map(({ lambda, residual: r, residualBalanced: rb }) => ({
			lambda,
			residual: r,
			residualBalanced: rb
		})),
		solverTolerance,
		seconds: (Date.now() - started) / 1e3,
		mesh: meshFromCoords(xs, ys),
		formulation: pre ? "Two-stage. Stage 1: bilinear plane-stress quad, 2×2, for the edge patch. The opposite edge is the normal support. Stage 2: Mindlin bilinear quad, 2×2 bending and geometric stiffness from the recovered membrane stress plus the entered σx, σy and τxy, 1-point shear, ks = 5/6. λ multiplies the whole field." : "Mindlin bilinear quad. 2×2 bending and geometric stiffness, 1-point shear, ks = 5/6. The entered σx(y), σy and τxy are the pre-buckling field. No separate membrane solve. Banded Cholesky of K. Eigenvalues from reorthogonalised Lanczos on L⁻¹ Kg L⁻ᵀ, then a Rayleigh quotient in the original basis. Stiffeners are Euler beams on EI and GJ. Beam Kg uses N = σA.",
		note: `${engineLine()} NORMALISED EIGENMODE — DISPLAY SCALE IS NOT PHYSICAL DISPLACEMENT. FILTER: the production modes are positive eigenvalues only, smallest first. A negative λ is the same |load| with the membrane field reversed. It stays in the diagnostic spectrum and is not a second compression capacity. ± pairs appear when Kg is indefinite, which pure bending and shear both are. Residual r = ||Kφ − λ Kg φ|| / ||Kφ||. Balanced residual rb = ||Kφ − λ Kg φ|| / (||Kφ|| + |λ| ||Kg φ||). Positive spectrum: ${specLine}. Next positive separation (λ2−λ1)/λ1 = ${separation == null ? "—" : separation.toExponential(3)}. Mesh aspect ${minAspect.toFixed(2)} to ${maxAspect.toFixed(2)}. Element size ${minElementMm.toFixed(2)} to ${maxElementMm.toFixed(2)} mm.${input.sigma1Mpa < 0 ? " σ1,cr is the stress at y = 0 after scaling. A negative value is tension on that edge, not a compressive capacity." : ""}${wantShapes && modes[0] && modes[0].w.length > 0 ? ` Mode 1 centreline half-waves ≈ ${countHalfWaves(modes[0].w, xs, ys, "x")} along x and ${countHalfWaves(modes[0].w, xs, ys, "y")} along y.` : ""} ${symmetryNote}`,
		prestressNote: pre ? `${pre.note} Equilibrium imbalance ${(pre.equilibrium * 100).toFixed(2)}%.` : "No patch load. Kg uses the entered membrane field only.",
		stiffenerNotes,
		minAspect,
		maxElementMm,
		minElementMm,
		symmetryNote,
		membrane: pre ? {
			sigX: Array.from(pre.sigX),
			sigY: Array.from(pre.sigY),
			tau: Array.from(pre.tau)
		} : null
	};
}
function normalisedW(X, column, keep, nodes) {
	const w = Array(nodes).fill(0);
	for (let i = 0; i < keep.length; i++) {
		const g = keep[i];
		if (g % 3 === 0) w[Math.floor(g / 3)] = X[i][column] ?? 0;
	}
	let max = 0;
	for (const value of w) max = Math.max(max, Math.abs(value));
	if (max > 0) for (let i = 0; i < w.length; i++) w[i] /= max;
	return w;
}
function addBeam(K, Kg, bw, free, nodeA, nodeB, axis, length, ei, gj, axialCompression) {
	if (!(length > 0)) return;
	const bendRot = axis === "x" ? 1 : 2;
	const twistRot = axis === "x" ? 2 : 1;
	const f = ei / length ** 3;
	const ke = [
		12 * f,
		6 * length * f,
		-12 * f,
		6 * length * f,
		6 * length * f,
		4 * length * length * f,
		-6 * length * f,
		2 * length * length * f,
		-12 * f,
		-6 * length * f,
		12 * f,
		-6 * length * f,
		6 * length * f,
		2 * length * length * f,
		-6 * length * f,
		4 * length * length * f
	];
	const scale = axialCompression / (30 * length);
	const kg = [
		36 * scale,
		3 * length * scale,
		-36 * scale,
		3 * length * scale,
		3 * length * scale,
		4 * length * length * scale,
		-3 * length * scale,
		-length * length * scale,
		-36 * scale,
		-3 * length * scale,
		36 * scale,
		-3 * length * scale,
		3 * length * scale,
		-length * length * scale,
		-3 * length * scale,
		4 * length * length * scale
	];
	const dofs = [
		nodeA * 3,
		nodeA * 3 + bendRot,
		nodeB * 3,
		nodeB * 3 + bendRot
	];
	for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
		const fi = free[dofs[a]];
		const fj = free[dofs[b]];
		if (fi < 0 || fj < 0 || fi < fj) continue;
		bandAdd(K, bw, fi, fj, ke[a * 4 + b]);
		if (axialCompression !== 0) bandAdd(Kg, bw, fi, fj, kg[a * 4 + b]);
	}
	if (gj > 0) {
		const t = gj / length;
		const twist = [nodeA * 3 + twistRot, nodeB * 3 + twistRot];
		const kte = [
			t,
			-t,
			-t,
			t
		];
		for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
			const fi = free[twist[a]];
			const fj = free[twist[b]];
			if (fi < 0 || fj < 0 || fi < fj) continue;
			bandAdd(K, bw, fi, fj, kte[a * 2 + b]);
		}
	}
}
function studyGrids(aMm, bMm) {
	const alpha = bMm > 0 ? aMm / bMm : 1;
	return MESH_STUDY_SIZES.map((n) => {
		if (alpha >= 1) return {
			nx: Math.min(MAX_ELEMENTS, Math.max(n, Math.round(n * Math.min(alpha, 6)))),
			ny: n
		};
		return {
			nx: n,
			ny: Math.min(MAX_ELEMENTS, Math.max(n, Math.round(n * Math.min(1 / Math.max(alpha, 1e-6), 6))))
		};
	});
}
/** Stiffener cross-sections. Second moments are about the plate mid-surface. Not a code rigidity check. */
var STEEL_DENSITY_KG_M3 = 7850;
function newStiffener(partial) {
	return {
		id: partial.id,
		axis: partial.axis,
		atMm: partial.atMm,
		kind: partial.kind ?? "flat",
		hMm: partial.hMm ?? 80,
		twMm: partial.twMm ?? 8,
		bfMm: partial.bfMm ?? 80,
		tfMm: partial.tfMm ?? 8,
		eMpa: partial.eMpa ?? 21e4,
		fyMpa: partial.fyMpa ?? 350,
		customA: partial.customA,
		customI: partial.customI,
		customJ: partial.customJ,
		rigid: partial.rigid ?? false
	};
}
function torsionRect(length, thickness) {
	const a = Math.max(length, thickness);
	const b = Math.min(length, thickness);
	if (!(a > 0) || !(b > 0)) return 0;
	return a * b ** 3 * (1 / 3 - .21 * (b / a) * (1 - b ** 4 / (12 * a ** 4)));
}
function rectAboutZero(z0, z1, width) {
	const h = z1 - z0;
	const area = width * h;
	const centroid = .5 * (z0 + z1);
	return {
		area,
		i: width * h ** 3 / 12 + area * centroid * centroid,
		centroid
	};
}
function stiffenerProps(input, plateTmm) {
	const fail = (note) => ({
		areaMm2: 0,
		iMm4: 0,
		jMm4: 0,
		eaN: 0,
		eiNmm2: 0,
		gjNmm2: 0,
		centroidFromFaceMm: 0,
		note
	});
	if (!(input.eMpa > 0)) return fail("Stiffener E must be positive.");
	if (input.kind === "custom") {
		const area = input.customA ?? 0;
		const i = input.customI ?? 0;
		const j = input.customJ ?? 0;
		if (!(area > 0) || !(i > 0) || !(j >= 0)) return fail("Custom stiffener needs A > 0 and I > 0 about the plate mid-surface.");
		const g = input.eMpa / 2.6;
		return {
			areaMm2: area,
			iMm4: i,
			jMm4: j,
			eaN: input.eMpa * area,
			eiNmm2: input.eMpa * i,
			gjNmm2: g * j,
			centroidFromFaceMm: 0,
			note: "Custom A, I and J are used as entered. I is about the plate mid-surface. G = E / 2.6."
		};
	}
	if (!(input.hMm > 0) || !(input.twMm > 0)) return fail("Stiffener height and thickness must be positive.");
	const zFace = plateTmm > 0 ? plateTmm / 2 : 0;
	const zTip = zFace + input.hMm;
	let area = 0;
	let moment = 0;
	let i = 0;
	let j = 0;
	const add = (z0, z1, width) => {
		if (!(width > 0) || !(z1 > z0)) return;
		const piece = rectAboutZero(z0, z1, width);
		area += piece.area;
		moment += piece.area * piece.centroid;
		i += piece.i;
		j += torsionRect(z1 - z0, width);
	};
	if (input.kind === "flat" || input.kind === "plate") add(zFace, zTip, input.twMm);
	else if (input.kind === "angle" || input.kind === "tee") {
		if (!(input.bfMm > 0) || !(input.tfMm > 0)) return fail("Angle and tee stiffeners need a flange width and thickness.");
		const zFlange0 = Math.max(zFace, zTip - input.tfMm);
		add(zFace, zFlange0, input.twMm);
		add(zFlange0, zTip, input.bfMm);
	} else return fail("Unknown stiffener section.");
	if (!(area > 0) || !(i > 0)) return fail("Stiffener area or second moment is not positive.");
	const g = input.eMpa / 2.6;
	const note = input.kind === "flat" || input.kind === "plate" ? "Rectangular outstand. I = ∫ z² dA about the plate mid-surface. J is Saint-Venant torsion, not warping torsion. G uses ν = 0.3." : "Web plus tip flange. The flange width is the full entered width and the web stops at the flange. I is about the plate mid-surface. Warping torsion is not included. G uses ν = 0.3.";
	return {
		areaMm2: area,
		iMm4: i,
		jMm4: j,
		eaN: input.eMpa * area,
		eiNmm2: input.eMpa * i,
		gjNmm2: g * j,
		centroidFromFaceMm: moment / area - zFace,
		note
	};
}
function stiffenerMassKg(areaMm2, lengthMm) {
	if (!(areaMm2 > 0) || !(lengthMm > 0)) return 0;
	return areaMm2 * lengthMm * STEEL_DENSITY_KG_M3 * 1e-9;
}
function plateMassKg(aMm, bMm, tMm) {
	if (!(aMm > 0) || !(bMm > 0) || !(tMm > 0)) return 0;
	return aMm * bMm * tMm * STEEL_DENSITY_KG_M3 * 1e-9;
}
function uniqueStations(length, values) {
	const raw = values.filter((v) => v > length * 1e-4 && v < length * .9999);
	raw.sort((p, q) => p - q);
	const out = [];
	for (const v of raw) if (out.length === 0 || Math.abs(v - out[out.length - 1]) > Math.max(.5, length * 1e-4)) out.push(v);
	return out;
}
function sigmaAt(sigma1, psi, y, b) {
	if (!(b > 0)) return sigma1;
	return sigma1 * (1 - (1 - psi) * (y / b));
}
function buildPanels(input) {
	const xs = [
		0,
		...uniqueStations(input.aMm, input.stiffeners.filter((s) => s.axis === "y").map((s) => s.atMm)),
		input.aMm
	];
	const ys = [
		0,
		...uniqueStations(input.bMm, input.stiffeners.filter((s) => s.axis === "x").map((s) => s.atMm)),
		input.bMm
	];
	const panels = [];
	let id = 1;
	for (let row = 0; row < ys.length - 1; row++) for (let col = 0; col < xs.length - 1; col++) {
		const x0 = xs[col];
		const x1 = xs[col + 1];
		const y0 = ys[row];
		const y1 = ys[row + 1];
		const aMm = x1 - x0;
		const bMm = y1 - y0;
		const sigmaBottom = sigmaAt(input.sigma1Mpa, input.psi, y0, input.bMm);
		const sigmaTop = sigmaAt(input.sigma1Mpa, input.psi, y1, input.bMm);
		const psi = Math.abs(sigmaBottom) > 1e-9 ? sigmaTop / sigmaBottom : Math.abs(sigmaTop) > 1e-9 ? 0 : 1;
		const touchesStiffener = col > 0 || col < xs.length - 2 || row > 0 || row < ys.length - 2;
		const parentClosed = !touchesStiffener && input.edges.x0 === "ss" && input.edges.x1 === "ss" && input.edges.y0 === "ss" && input.edges.y1 === "ss";
		const estimate = aMm > 0 && bMm > 0 ? classicalPlate({
			aMm,
			bMm,
			tMm: input.tMm,
			eMpa: input.eMpa,
			nu: input.nu,
			fyMpa: input.fyMpa,
			fuMpa: input.fuMpa,
			sigma1Mpa: Math.abs(sigmaBottom) > 1e-9 ? sigmaBottom : sigmaTop,
			psi,
			tauMpa: input.tauMpa,
			edges: {
				x0: "ss",
				x1: "ss",
				y0: "ss",
				y1: "ss"
			}
		}) : null;
		const closed = parentClosed ? estimate : null;
		panels.push({
			id: `P${id}`,
			col,
			row,
			x0,
			x1,
			y0,
			y1,
			aMm,
			bMm,
			alpha: bMm > 0 ? aMm / bMm : 0,
			sigmaBottom,
			sigmaTop,
			psi,
			tau: input.tauMpa,
			closedForm: Boolean(closed?.ok && closed.kSigma != null),
			sigmaCrMpa: closed?.ok ? closed.sigmaCrMpa : null,
			kSigma: closed?.ok ? closed.kSigma : null,
			m: closed?.ok ? closed.m : null,
			n: closed?.ok ? closed.n : null,
			ssEstimateMpa: estimate?.ok ? estimate.sigmaCrMpa : null,
			status: touchesStiffener ? "GEOMETRIC SUBPANEL IDENTIFIED. STIFFENER DESIGN ADEQUATE: NOT VERIFIED. SUBPANEL EDGE ASSUMED FULLY RESTRAINED: NO. STIFFENER ADEQUACY NOT YET VERIFIED." : parentClosed ? "GEOMETRIC SUBPANEL IDENTIFIED. No stiffener cut. Closed form uses the plate edges as entered, not an assumed stiffener restraint." : "GEOMETRIC SUBPANEL IDENTIFIED. NO CLOSED-FORM SOLUTION — FEM REQUIRED. SUBPANEL EDGE ASSUMED FULLY RESTRAINED: NO."
		});
		id += 1;
	}
	return panels;
}
/** Kinematic reading of a normalised eigenmode. Not a code classification. */
function classifyMode(w, xs, ys, panels) {
	if (w.length !== xs.length * ys.length || panels.length === 0) return {
		kind: "UNSTIFFENED PANEL",
		panelId: "",
		note: "No eigenmode was returned."
	};
	if (panels.length === 1) return {
		kind: "UNSTIFFENED PANEL",
		panelId: panels[0].id,
		note: "One panel. The mode is the panel mode."
	};
	const energy = panels.map((panel) => {
		let sum = 0;
		let count = 0;
		let signed = 0;
		for (let iy = 0; iy < ys.length; iy++) {
			const y = ys[iy];
			if (y < panel.y0 - 1e-6 || y > panel.y1 + 1e-6) continue;
			for (let ix = 0; ix < xs.length; ix++) {
				const x = xs[ix];
				if (x < panel.x0 - 1e-6 || x > panel.x1 + 1e-6) continue;
				const value = w[iy * xs.length + ix] ?? 0;
				sum += value * value;
				signed += value;
				count += 1;
			}
		}
		return {
			id: panel.id,
			sum,
			mean: count ? signed / count : 0
		};
	});
	const total = energy.reduce((s, row) => s + row.sum, 0);
	if (!(total > 0)) return {
		kind: "MIXED MODE",
		panelId: "",
		note: "The eigenmode has no transverse displacement to classify."
	};
	const ranked = energy.map((row) => ({
		...row,
		share: row.sum / total
	})).sort((p, q) => q.share - p.share);
	const top = ranked[0];
	const second = ranked[1]?.share ?? 0;
	const signChanges = ranked.filter((row) => Math.abs(row.mean) > 1e-4).some((row, index, list) => {
		const other = list[index + 1];
		return other ? row.mean * other.mean < 0 : false;
	});
	if (top.share >= .55 && second <= .35) return {
		kind: "LOCAL SUBPANEL MODE",
		panelId: top.id,
		note: `${top.id} holds ${Math.round(top.share * 100)}% of the squared displacement. Adjacent panels are quieter. This is a reading of the eigenmode, not a proof that the stiffener is a simple support.`
	};
	if (top.share < .5 && !signChanges) return {
		kind: "GLOBAL PANEL MODE",
		panelId: "",
		note: "Displacement energy is spread across the stiffener lines without a single panel dominating."
	};
	return {
		kind: "MIXED MODE",
		panelId: top.id,
		note: signChanges ? `The eigenmode changes sign between panels. The largest share is ${top.id} at ${Math.round(top.share * 100)}%.` : `No single panel dominates. The largest share is ${top.id} at ${Math.round(top.share * 100)}%.`
	};
}
function elasticFence(standard) {
	return {
		id: "elastic-fence",
		group: "LAYERS",
		title: "Elastic critical stress is not a design resistance",
		standard,
		edition: "—",
		clause: "—",
		dataset: "none",
		status: "not-applicable",
		equation: "σcr, τcr and λFEM stay in the elastic layer",
		substitution: "No design factor is applied to the eigenvalue.",
		result: "NOT A DESIGN CAPACITY",
		note: "Layer 3 does not read FEM λ as Rd. A missing code row does not invent one."
	};
}
/** Clause 6.3.3 closed form. Table 6.3.3(C) is not stored; tests compare this form with cells read from that table. */
function alphaC(lambdaN, alphaB) {
	const lambda = lambdaN + 2100 * (lambdaN - 13.5) / (lambdaN * lambdaN - 15.3 * lambdaN + 2050) * alphaB;
	if (!(lambda > 0)) return 1;
	const eta = Math.max(0, .00326 * (lambda - 13.5));
	const ratio = lambda / 90;
	const xi = (ratio * ratio + 1 + eta) / (2 * ratio * ratio);
	const inside = 1 - (90 / (xi * lambda)) ** 2;
	if (!(inside >= 0) || !Number.isFinite(xi)) return 1;
	return Math.min(1, xi * (1 - Math.sqrt(inside)));
}
/** Ns = kf An fy and Nc = αc Ns, with λn from Clause 6.3.3. Returns newtons. */
function columnCapacity(input) {
	const lambdaN = input.leOverR * Math.sqrt(input.kf) * Math.sqrt(input.fyMpa / 250);
	const alpha = alphaC(lambdaN, input.alphaB);
	const ns = input.kf * input.areaMm2 * input.fyMpa;
	return {
		lambdaN,
		alpha,
		ns,
		nc: alpha * ns
	};
}
/** Clause 5.11 shear factors. Equations, not a stored copy of Table 5.11.5.2. */
function shearYield(fyMpa, areaMm2) {
	return .6 * fyMpa * areaMm2;
}
function stockyLimit(fyMpa) {
	return 82 / Math.sqrt(fyMpa / 250);
}
/** Unstiffened αv, Clause 5.11.5.1. Not capped; Vb ≤ Vw applies outside. */
function alphaVUnstiffened(dpOverTw, fyMpa) {
	return (82 / (dpOverTw * Math.sqrt(fyMpa / 250))) ** 2;
}
/** Stiffened αv, Clause 5.11.5.2, already capped at 1. */
function alphaVStiffened(dpOverTw, fyMpa, sOverDp) {
	const base = alphaVUnstiffened(dpOverTw, fyMpa);
	const factor = sOverDp <= 1 ? 1 / sOverDp ** 2 + .75 : .75 / sOverDp ** 2 + 1;
	return Math.min(1, base * factor);
}
function alphaD(alphaV, sOverDp, forceOne) {
	if (forceOne) return 1;
	if (!(alphaV > 0)) return NaN;
	return 1 + (1 - alphaV) / (1.15 * alphaV * Math.sqrt(1 + sOverDp ** 2));
}
/** Clause 5.11.5.2(b). bfo, tf, d1, tw in mm; the ratio is dimensionless. */
function alphaFFlange(bfoMm, tfMm, d1Mm, twMm) {
	const inner = 1 + 40 * bfoMm * tfMm * tfMm / (d1Mm * d1Mm * twMm);
	return 1.6 - .6 / Math.sqrt(inner);
}
/** AS 4100:2020 (incorporating Amendment No. 1) plate/web adapter.
* Numbers below were read from the licensed PDF for this project.
* They are not copied into EN 1993 or AS 5224.
*/
var AS4100_META = {
	standard: "AS 4100",
	edition: "2020",
	amendment: "1",
	/** Frozen plate/web subset. Do not change the adapter without re-running the D1.0 suite. */
	dataset: "IQ-PLB-AS4100-D1.0",
	freeze: "IQ-PLB-AS4100-D1.0",
	date: "2026-10-07",
	suite: "D1.0"
};
function designDefaults() {
	return {
		role: null,
		clearWidthMm: null,
		thicknessMm: null,
		fyMpa: null,
		fuMpa: null,
		residual: null,
		edgesSupported: null,
		stress: null,
		kb: null,
		widthPath: "primary",
		holes: null,
		anMm2: null,
		axial: null,
		nStarN: null,
		kt: null,
		vStarN: null,
		mStarNmm: null,
		msNmm: null,
		rStarN: null,
		shearMode: null,
		fvmMpa: null,
		fvaMpa: null,
		dpMm: null,
		twMm: null,
		d1Mm: null,
		webGross: null,
		stiffening: null,
		sMm: null,
		alphaF: null,
		bfoMm: null,
		tfMm: null,
		endPanel: false,
		interaction: null,
		afgMm2: null,
		afnMm2: null,
		afeMm2: null,
		dfMm: null,
		flangeFyMpa: null,
		flangeFuMpa: null,
		bearing: null,
		bbfMm: null,
		bbMm: null,
		bsMm: null,
		bearingTfMm: null,
		bearingPlace: null,
		flangesRestrained: null,
		deriveWidth: false,
		stiffener: null,
		arrangement: null,
		asMm2: null,
		fysMpa: null,
		tsMm: null,
		besMm: null,
		isMm4: null,
		stiffenerLe: null,
		outerStiffened: false,
		soleTorsion: false,
		torsionDepthMm: null,
		torsionTfMm: null,
		fMemberN: null,
		longWhere: null,
		d2Mm: null,
		asLongMm2: null,
		isLongMm4: null,
		openings: null,
		lwMm: null,
		openingStiffened: false,
		plasticWeb: false,
		webBound: null,
		appendixI: false,
		nwN: null,
		mwNmm: null,
		rwN: null,
		vwN: null,
		modulusMpa: null,
		fnN: null,
		fpN: null,
		mpNmm: null,
		eccMm: null,
		endPost: false,
		endGapMm: null,
		aepMm2: null,
		weldKnPerMm: null
	};
}
function fmt(n, digits = 4) {
	if (!Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	if (abs !== 0 && (abs >= 1e5 || abs < .001)) return n.toExponential(4);
	return String(Number(n.toFixed(digits)));
}
function kn(n) {
	return `${fmt(n / 1e3, 3)} kN`;
}
var PHI_SOURCE = {
	shear: "Table 3.4 — web in shear, Clauses 5.11 and 5.12, φ = 0.90",
	bearing: "Table 3.4 — web in bearing, Clause 5.13, φ = 0.90",
	stiffener: "Table 3.4 — stiffener, Clauses 5.14, 5.15 and 5.16, φ = 0.90",
	compression: "Table 3.4 — axial compression, Clauses 6.1, 6.2 and 6.3, φ = 0.90. This row is section capacity Ns. Member Nc is not evaluated.",
	tension: "Table 3.4 — axial tension, Clauses 7.1 and 7.2, φ = 0.90",
	bending: "Table 3.4 — bending, Clauses 5.1, 5.2, 5.3 and 5.6, φ = 0.90"
};
function phiOf(kind) {
	return {
		phi: .9,
		source: `AS 4100:2020 ${PHI_SOURCE[kind]}`
	};
}
function blankCheck(partial) {
	return {
		kind: partial.kind ?? "strength",
		normative: partial.normative ?? true,
		steps: partial.steps ?? [],
		nominal: partial.nominal ?? null,
		nominalUnit: partial.nominalUnit ?? "",
		phi: partial.phi ?? null,
		phiSource: partial.phiSource ?? "",
		designCapacity: partial.designCapacity ?? null,
		action: partial.action ?? null,
		utilisation: partial.utilisation ?? null,
		...partial
	};
}
function blocks(check) {
	if (!check.normative) return false;
	if (check.kind === "service") return false;
	return check.status === "fail" || check.status === "data-required" || check.status === "not-checked" || check.status === "invalid" || check.status === "out-of-scope";
}
function pos(n) {
	return n != null && Number.isFinite(n) && n > 0;
}
function utilisation(action, design) {
	if (!(design > 0) || !Number.isFinite(action)) return {
		ratio: NaN,
		status: "invalid"
	};
	const ratio = action / design;
	return {
		ratio,
		status: ratio <= 1 ? "pass" : "fail"
	};
}
/** Table 5.2 plasticity, yield and deformation limits. ed null means the table cell is an em dash. */
var TABLE_52 = {
	"one|uniform-compression|SR": [
		10,
		16,
		35
	],
	"one|uniform-compression|HR": [
		9,
		16,
		35
	],
	"one|uniform-compression|LW": [
		8,
		15,
		35
	],
	"one|uniform-compression|CF": [
		8,
		15,
		35
	],
	"one|uniform-compression|HW": [
		8,
		14,
		35
	],
	"one|outstand-gradient|SR": [
		10,
		25,
		null
	],
	"one|outstand-gradient|HR": [
		9,
		25,
		null
	],
	"one|outstand-gradient|LW": [
		8,
		22,
		null
	],
	"one|outstand-gradient|CF": [
		8,
		22,
		null
	],
	"one|outstand-gradient|HW": [
		8,
		22,
		null
	],
	"both|uniform-compression|SR": [
		30,
		45,
		90
	],
	"both|uniform-compression|HR": [
		30,
		45,
		90
	],
	"both|uniform-compression|LW": [
		30,
		40,
		90
	],
	"both|uniform-compression|CF": [
		30,
		40,
		90
	],
	"both|uniform-compression|HW": [
		30,
		35,
		90
	],
	"both|edge-gradient|ANY": [
		82,
		115,
		null
	]
};
/** Table 6.2.4 yield slenderness limit for a compression element. No gradient rows exist in this table. */
var TABLE_624 = {
	"one|SR": 16,
	"one|HR": 16,
	"one|LW": 15,
	"one|CF": 15,
	"one|HW": 14,
	"both|SR": 45,
	"both|HR": 45,
	"both|LW": 40,
	"both|CF": 40,
	"both|HW": 35
};
function residualLabel(residual) {
	if (residual === "SR") return "SR — stress relieved";
	if (residual === "HR") return "HR — hot-rolled or hot-finished";
	if (residual === "LW") return "LW — lightly welded longitudinally";
	if (residual === "CF") return "CF — cold-formed";
	return "HW — heavily welded longitudinally";
}
function limits52(edges, stress, residual) {
	if (edges === "both" && stress === "edge-gradient") {
		const row = TABLE_52["both|edge-gradient|ANY"];
		if (!row) return null;
		return {
			ep: row[0],
			ey: row[1],
			ed: row[2],
			row: "flat, both edges supported, compression at one edge and tension at the other, residual stresses Any"
		};
	}
	if (stress === "edge-gradient") return null;
	if (!residual) return null;
	const row = TABLE_52[`${edges}|${stress}|${residual}`];
	if (!row) return null;
	const edgeText = edges === "one" ? "one longitudinal edge supported (outstand)" : "both longitudinal edges supported";
	const stressText = stress === "uniform-compression" ? "uniform compression" : "maximum compression at the unsupported edge, zero stress or tension at the supported edge";
	return {
		ep: row[0],
		ey: row[1],
		ed: row[2],
		row: `flat, ${edgeText}, ${stressText}, ${residualLabel(residual)}`
	};
}
function lambdaEy624(edges, residual) {
	return TABLE_624[`${edges}|${residual}`] ?? null;
}
/** Clause 5.2.2 and Clause 6.2.3. fy is in MPa. b and t are in the same length unit. */
function lambdaE(b, t, fy) {
	return b / t * Math.sqrt(fy / 250);
}
function kbo(edges) {
	return edges === "both" ? 4 : .425;
}
function outsideMaterial(fy, thickness) {
	if (thickness != null && thickness > 0 && thickness < 3) return "Clause 1.1.2(a): AS 4100 does not apply to a steel element less than 3 mm thick, other than the cold-formed hollow-section exception, which this plate is not.";
	if (fy != null && fy > 690) return "Clause 1.1.2(b): the yield stress used in design exceeds 690 MPa.";
	return null;
}
function scopeRow(id, group, title, clause, note) {
	return blankCheck({
		id,
		group,
		title,
		clause,
		equation: "Clause 1.1.2",
		status: "out-of-scope",
		result: "OUTSIDE IMPLEMENTED SCOPE",
		note
	});
}
var SIZE_KEYS = [
	"clearWidthMm",
	"thicknessMm",
	"fyMpa",
	"fuMpa",
	"kb",
	"anMm2",
	"kt",
	"dpMm",
	"twMm",
	"d1Mm",
	"sMm",
	"bfoMm",
	"tfMm",
	"afgMm2",
	"afnMm2",
	"afeMm2",
	"dfMm",
	"flangeFyMpa",
	"flangeFuMpa",
	"bbfMm",
	"bbMm",
	"bsMm",
	"bearingTfMm",
	"asMm2",
	"fysMpa",
	"tsMm",
	"besMm",
	"isMm4",
	"torsionDepthMm",
	"torsionTfMm",
	"fMemberN",
	"d2Mm",
	"asLongMm2",
	"isLongMm4",
	"lwMm",
	"modulusMpa",
	"endGapMm",
	"aepMm2",
	"nwN",
	"rwN",
	"vwN",
	"fnN",
	"fpN"
];
var SIGNED_KEYS = [
	"nStarN",
	"mStarNmm",
	"mwNmm",
	"mpNmm",
	"eccMm"
];
function invalidInput(input) {
	for (const key of SIZE_KEYS) {
		const value = input[key];
		if (value == null) continue;
		if (!Number.isFinite(value)) return `${key} is not a finite number.`;
		if (value < 0) return `${key} is negative.`;
		if (value === 0 && (key.endsWith("Mm") || key.endsWith("Mpa") || key === "kt" || key === "kb")) return `${key} is zero.`;
	}
	for (const key of SIGNED_KEYS) {
		const value = input[key];
		if (value == null) continue;
		if (!Number.isFinite(value)) return `${key} is not a finite number.`;
	}
	if (input.vStarN != null && !Number.isFinite(input.vStarN)) return "vStarN is not a finite number.";
	if (input.vStarN != null && input.vStarN < 0) return "vStarN is negative. Shear is not entered as a signed tension.";
	if (input.rStarN != null && !Number.isFinite(input.rStarN)) return "rStarN is not a finite number.";
	if (input.rStarN != null && input.rStarN < 0) return "rStarN is negative.";
	if (input.weldKnPerMm != null && (!Number.isFinite(input.weldKnPerMm) || input.weldKnPerMm < 0)) return "weldKnPerMm is not a finite non-negative weld capacity.";
	return null;
}
function data(partial) {
	const { missing, note, ...rest } = partial;
	return blankCheck({
		...rest,
		status: "data-required",
		result: "VERIFIED STANDARD DATA REQUIRED",
		note: note || missing,
		steps: [...rest.steps ?? [], missing]
	});
}
function slenderness(input) {
	const checks = [];
	const want = input.role === "element" || input.role === "web" && (input.stress != null || input.axial === "compression");
	if (input.role == null) {
		checks.push(blankCheck({
			id: "slenderness",
			group: "PLATE SLENDERNESS",
			title: "Element slenderness",
			clause: "5.2.2 / 6.2.3",
			equation: "λe = (b/t) √(fy/250)",
			result: "NOT CHECKED",
			status: "not-checked",
			kind: "classification",
			note: "Plate role is not selected, so b is not taken from the panel model."
		}));
		return {
			checks,
			be: null,
			lambda: null
		};
	}
	if (!want) {
		checks.push(blankCheck({
			id: "slenderness",
			group: "PLATE SLENDERNESS",
			title: "Element slenderness",
			clause: "5.2.2",
			equation: "λe = (b/t) √(fy/250)",
			result: "NOT APPLICABLE",
			status: "not-applicable",
			kind: "classification",
			note: "No compression stress condition and no axial compression. Clause 5.11 shear does not use λe."
		}));
		return {
			checks,
			be: null,
			lambda: null
		};
	}
	if (!pos(input.clearWidthMm) || !pos(input.thicknessMm) || !pos(input.fyMpa) || !input.edgesSupported || !input.stress) {
		checks.push(data({
			id: "slenderness",
			group: "PLATE SLENDERNESS",
			title: "Element slenderness",
			clause: "5.2.2 / 6.2.3",
			equation: "λe = (b/t) √(fy/250)",
			missing: "Required: clear width b (not the panel a or b until you assign it), thickness t, fy, longitudinal edges supported (one or both), and the stress condition."
		}));
		return {
			checks,
			be: null,
			lambda: null
		};
	}
	if (input.thicknessMm < 3) {
		checks.push(blankCheck({
			id: "slenderness",
			group: "PLATE SLENDERNESS",
			title: "Element slenderness",
			clause: "1.1.2(a)",
			equation: "λe = (b/t) √(fy/250)",
			result: "OUTSIDE IMPLEMENTED SCOPE",
			status: "out-of-scope",
			note: "AS 4100 does not apply to steel elements less than 3 mm thick, other than the cold-formed hollow-section exception, which this plate is not."
		}));
		return {
			checks,
			be: null,
			lambda: null
		};
	}
	if (input.fyMpa > 690) {
		checks.push(blankCheck({
			id: "slenderness",
			group: "PLATE SLENDERNESS",
			title: "Element slenderness",
			clause: "1.1.2(b)",
			equation: "λe = (b/t) √(fy/250)",
			result: "OUTSIDE IMPLEMENTED SCOPE",
			status: "out-of-scope",
			note: "The yield stress used in design exceeds 690 MPa, which Clause 1.1.2(b) excludes."
		}));
		return {
			checks,
			be: null,
			lambda: null
		};
	}
	if (!(input.edgesSupported === "both" && input.stress === "edge-gradient") && !input.residual) {
		checks.push(data({
			id: "slenderness",
			group: "PLATE SLENDERNESS",
			title: "Element slenderness",
			clause: "5.2.2",
			equation: "λe = (b/t) √(fy/250)",
			missing: "Residual-stress category is required (SR, HR, LW, CF or HW). It is not assumed. Table 5.2 note: welded members with compressive residual stress below 40 MPa may be entered as lightly welded."
		}));
		return {
			checks,
			be: null,
			lambda: null
		};
	}
	if (input.edgesSupported === "one" && input.stress === "edge-gradient") {
		checks.push(blankCheck({
			id: "slenderness",
			group: "PLATE SLENDERNESS",
			title: "Element slenderness",
			clause: "Table 5.2",
			equation: "λe = (b/t) √(fy/250)",
			result: "NOT APPLICABLE",
			status: "not-applicable",
			kind: "classification",
			note: "Table 5.2 has no row for one supported edge with compression at one edge and tension at the other. Use the outstand gradient row only when the maximum compression is at the unsupported edge."
		}));
		return {
			checks,
			be: null,
			lambda: null
		};
	}
	const limits = limits52(input.edgesSupported, input.stress, input.residual);
	if (!limits) {
		checks.push(data({
			id: "slenderness",
			group: "PLATE SLENDERNESS",
			title: "Element slenderness",
			clause: "Table 5.2",
			equation: "λe = (b/t) √(fy/250)",
			missing: "No Table 5.2 row matches this edge support and stress condition."
		}));
		return {
			checks,
			be: null,
			lambda: null
		};
	}
	const b = input.clearWidthMm;
	const t = input.thicknessMm;
	const fy = input.fyMpa;
	const le = lambdaE(b, t, fy);
	const cls = le <= limits.ep ? "COMPACT" : le <= limits.ey ? "NON-COMPACT" : "SLENDER";
	const bWords = input.edgesSupported === "one" ? "clear width of the outstand from the face of the supporting plate" : "clear width between the faces of the supporting plates";
	checks.push(blankCheck({
		id: "slenderness",
		group: "PLATE SLENDERNESS",
		title: "Element slenderness and classification",
		clause: "5.2.2",
		equation: "λe = (b/t) √(fy/250); compare λe with λep and λey",
		kind: "classification",
		status: "pass",
		result: `${cls}; λe = ${fmt(le, 3)}`,
		steps: [
			`Selected element: flat plate, ${input.edgesSupported === "one" ? "one longitudinal edge supported" : "both longitudinal edges supported"}.`,
			`Stress condition: ${input.stress === "uniform-compression" ? "uniform compression" : input.stress === "edge-gradient" ? "compression at one edge and tension at the other" : input.stress === "outstand-gradient" ? "maximum compression at the unsupported edge" : input.stress}.`,
			`Residual stresses: ${input.residual ? residualLabel(input.residual) : "Any — Table 5.2 does not subdivide this row"}.`,
			`b = ${fmt(b, 3)} mm (${bWords}). Panel length and width are not used unless you assigned one of them to b.`,
			`t = ${fmt(t, 3)} mm, fy = ${fmt(fy, 3)} MPa.`,
			`λe = (${fmt(b, 3)} / ${fmt(t, 3)}) × √(${fmt(fy, 3)} / 250) = ${fmt(le, 4)}.`,
			`Table 5.2 row: ${limits.row}.`,
			`λep = ${limits.ep}, λey = ${limits.ey}${limits.ed == null ? ", λed is not given" : `, λed = ${limits.ed}`}.`,
			`λs is this element's λe. λsp = λep and λsy = λey for that same element (Clause 5.2.2).`,
			le <= limits.ep ? `λe ≤ λep, so the element is compact.` : le <= limits.ey ? `λep < λe ≤ λey, so the element is non-compact.` : `λe > λey, so the element is slender.`
		],
		note: "Classification is not a design resistance. Elastic σcr is not used."
	}));
	if (limits.ed == null) checks.push(blankCheck({
		id: "deformation",
		group: "PLATE SLENDERNESS",
		title: "Deformation slenderness",
		clause: "5.2.5",
		equation: "λe compared with λed",
		kind: "service",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "Table 5.2 does not give λed for this row."
	}));
	else if (le > limits.ed) checks.push(blankCheck({
		id: "deformation",
		group: "PLATE SLENDERNESS",
		title: "Deformation slenderness",
		clause: "5.2.5",
		equation: "λe ≤ λed",
		kind: "service",
		status: "fail",
		result: `λe ${fmt(le, 3)} > λed ${limits.ed}`,
		steps: [`λed = ${limits.ed} from Table 5.2. Clause 5.2.5 says noticeable service deformations may occur. This is not a reduction of φRu.`],
		note: "Serviceability warning. It does not change the strength capacity."
	}));
	else checks.push(blankCheck({
		id: "deformation",
		group: "PLATE SLENDERNESS",
		title: "Deformation slenderness",
		clause: "5.2.5",
		equation: "λe ≤ λed",
		kind: "service",
		status: "pass",
		result: `λe ${fmt(le, 3)} ≤ λed ${limits.ed}`,
		note: "Within the Table 5.2 deformation limit."
	}));
	let be = null;
	if (input.stress !== "uniform-compression") {
		checks.push(blankCheck({
			id: "effective-width",
			group: "EFFECTIVE WIDTH",
			title: "Effective width",
			clause: "6.2.4",
			equation: "be = b (λey/λe) ≤ b",
			status: "not-applicable",
			result: "NOT APPLICABLE",
			kind: "classification",
			note: "Clause 6.2.4 and Table 6.2.4 are for a flat compression element. A bending stress gradient is classified with Table 5.2 and is not given this effective width. Clause 5.2.5 does not state a Ze formula for both edges supported with compression at one edge and tension at the other when the element is slender, so Ze is not invented."
		}));
		return {
			checks,
			be,
			lambda: le
		};
	}
	if (!input.residual) return {
		checks,
		be,
		lambda: le
	};
	const ey = lambdaEy624(input.edgesSupported, input.residual);
	if (ey == null) {
		checks.push(data({
			id: "effective-width",
			group: "EFFECTIVE WIDTH",
			title: "Effective width",
			clause: "Table 6.2.4",
			equation: "be = b (λey/λe) ≤ b",
			missing: "Table 6.2.4 has no yield limit for this edge and residual-stress pair."
		}));
		return {
			checks,
			be,
			lambda: le
		};
	}
	const bePrimary = Math.min(b, b * (ey / le));
	const steps = [
		`Table 6.2.4 λey = ${ey} for ${input.edgesSupported === "one" ? "one edge (outstand)" : "both edges"}, ${residualLabel(input.residual)}.`,
		`Primary width, Clause 6.2.4: b (λey/λe) = ${fmt(b, 3)} × (${ey} / ${fmt(le, 4)}) = ${fmt(b * ey / le, 3)} mm. ${b * ey / le > b + 1e-6 ? `That exceeds gross width b, so be is limited to b. ` : ""}be = ${fmt(bePrimary, 3)} mm.`,
		`Gross width ${fmt(b, 3)} mm. Ineffective width ${fmt(Math.max(0, b - bePrimary), 3)} mm. This is not an iteration: one flat element in uniform compression has no neutral-axis shift.`
	];
	let beUsed = bePrimary;
	let equation = "be = b (λey/λe) ≤ b";
	if (input.widthPath === "alternative") {
		if (!pos(input.kb)) {
			checks.push(data({
				id: "effective-width",
				group: "EFFECTIVE WIDTH",
				title: "Effective width",
				clause: "6.2.4",
				equation: "be = b (λey/λe) √(kb/kbo) ≤ b",
				missing: "The alternative width needs kb from a rational elastic buckling analysis of the plate assemblage. FEM σcr is not inserted automatically.",
				steps
			}));
			return {
				checks,
				be: null,
				lambda: le
			};
		}
		const k0 = kbo(input.edgesSupported);
		beUsed = Math.min(b, b * (ey / le) * Math.sqrt(input.kb / k0));
		equation = "be = b (λey/λe) √(kb/kbo) ≤ b";
		steps.push(`Alternative, Clause 6.2.4: kbo = ${k0} (${input.edgesSupported === "both" ? "both edges" : "outstand"}). kb = ${fmt(input.kb, 4)} supplied by you, not taken from λFEM.`);
		steps.push(`be = ${fmt(b, 3)} × (${ey}/${fmt(le, 4)}) × √(${fmt(input.kb, 4)}/${k0}) = ${fmt(beUsed, 3)} mm.`);
	} else if (pos(input.kb)) steps.push(`kb = ${fmt(input.kb, 4)} is entered but the primary width is selected. It is not mixed into φNs.`);
	be = beUsed;
	checks.push(blankCheck({
		id: "effective-width",
		group: "EFFECTIVE WIDTH",
		title: "Effective width",
		clause: "6.2.4",
		equation,
		kind: "classification",
		status: "pass",
		result: `be = ${fmt(beUsed, 3)} mm`,
		steps,
		note: "be is a compression-element width. It is not φN."
	}));
	return {
		checks,
		be,
		lambda: le
	};
}
function axial(input, be) {
	if (input.axial == null) return [blankCheck({
		id: "axial",
		group: "AXIAL",
		title: "Axial section capacity",
		clause: "6.2.1 / 7.2",
		equation: "Ns = kf An fy or Nt = min(Ag fy, 0.85 kt An fu)",
		status: "not-checked",
		result: "NOT CHECKED",
		note: "Axial action is not stated. Choose none, compression or tension. A tensile force is not checked as compression."
	})];
	if (input.axial === "none") return [blankCheck({
		id: "axial",
		group: "AXIAL",
		title: "Axial section capacity",
		clause: "6.1 / 7.1",
		equation: "N* ≤ φN",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "No axial design force."
	})];
	const axialScope = outsideMaterial(input.fyMpa, input.thicknessMm);
	if (axialScope) return [scopeRow("axial", "AXIAL", "Axial section capacity", input.axial === "tension" ? "7.2" : "6.2", axialScope)];
	if (!pos(input.clearWidthMm) || !pos(input.thicknessMm) || !pos(input.fyMpa)) return [data({
		id: "axial",
		group: "AXIAL",
		title: "Axial section capacity",
		clause: input.axial === "tension" ? "7.2" : "6.2.1",
		equation: input.axial === "tension" ? "Nt = min(Ag fy, 0.85 kt An fu)" : "Ns = kf An fy",
		missing: "Clear width, thickness and fy are required before an axial section capacity can be formed."
	})];
	const ag = input.clearWidthMm * input.thicknessMm;
	if (input.holes == null) return [data({
		id: "axial",
		group: "AXIAL",
		title: "Axial section capacity",
		clause: "6.2.1",
		equation: "An",
		missing: "State that there are no holes, or enter the net area. Gross area is not assumed."
	})];
	let an = ag;
	const holeSteps = [`Ag = b × t = ${fmt(input.clearWidthMm, 3)} × ${fmt(input.thicknessMm, 3)} = ${fmt(ag, 3)} mm².`];
	if (input.holes === "net") {
		if (!pos(input.anMm2) || !pos(input.fuMpa)) return [data({
			id: "axial",
			group: "AXIAL",
			title: "Axial section capacity",
			clause: "6.2.1",
			equation: "An",
			missing: "Net area and fu are required. Clause 6.2.1 allows Ag only when the hole reduction is less than 100[1 − fy/(0.85 fu)] percent."
		})];
		if (input.anMm2 > ag) return [blankCheck({
			id: "axial",
			group: "AXIAL",
			title: "Axial section capacity",
			clause: "6.2.1",
			equation: "An ≤ Ag",
			status: "invalid",
			result: "INVALID INPUT",
			note: `Net area ${fmt(input.anMm2, 3)} mm² is greater than gross area ${fmt(ag, 3)} mm². That is not clamped to Ag.`,
			steps: holeSteps
		})];
		const limit = 100 * (1 - input.fyMpa / (.85 * input.fuMpa));
		const reduction = 100 * (ag - input.anMm2) / ag;
		an = reduction < limit ? ag : input.anMm2;
		holeSteps.push(`Hole reduction = ${fmt(reduction, 3)} %. Clause 6.2.1 threshold = ${fmt(limit, 3)} %. An used = ${fmt(an, 3)} mm².`);
	} else holeSteps.push("No holes entered, so An = Ag.");
	if (input.axial === "tension") {
		if (!pos(input.fuMpa) || !pos(input.kt)) return [data({
			id: "axial",
			group: "AXIAL",
			title: "Tension section capacity",
			clause: "7.2",
			equation: "Nt = min(Ag fy, 0.85 kt An fu)",
			missing: "fu and kt are required. kt = 1.0 only where Clause 7.3.1 end connections are satisfied. It is not assumed.",
			steps: holeSteps
		})];
		const nYield = ag * input.fyMpa;
		const fracture = .85 * input.kt * an * input.fuMpa;
		const nt = Math.min(nYield, fracture);
		const { phi, source } = phiOf("tension");
		const design = phi * nt;
		const action = input.nStarN != null && input.nStarN < 0 ? -input.nStarN : null;
		const used = action == null ? null : utilisation(action, design);
		return [blankCheck({
			id: "axial",
			group: "AXIAL",
			title: "Tension section capacity",
			clause: "7.1 and 7.2",
			equation: "Nt = min(Ag fy, 0.85 kt An fu); N* ≤ φ Nt",
			status: used?.status ?? "not-checked",
			result: action == null ? `φNt = ${kn(design)}; action not entered` : `${fmt(used.ratio, 3)}`,
			nominal: nt,
			nominalUnit: "N",
			phi,
			phiSource: source,
			designCapacity: design,
			action,
			utilisation: used?.ratio ?? null,
			steps: [
				...holeSteps,
				`Ag fy = ${kn(nYield)}. 0.85 kt An fu = 0.85 × ${fmt(input.kt, 3)} × ${fmt(an, 3)} × ${fmt(input.fuMpa, 3)} = ${kn(fracture)}.`,
				`Nt = ${kn(nt)}. φ = 0.90. φNt = ${kn(design)}.`,
				"Compression slenderness is not used as a tensile resistance."
			],
			note: action == null ? "Enter the tensile design force as a negative N* (compression positive)." : "Pure tension is not reported as a buckling capacity."
		})];
	}
	if (be == null) return [data({
		id: "axial",
		group: "AXIAL",
		title: "Compression section capacity",
		clause: "6.2.2",
		equation: "kf = Ae/Ag; Ns = kf An fy",
		missing: "Effective width is not available, so Ae cannot be formed. Uniform compression and Table 6.2.4 are required. Member capacity Nc (Clause 6.3) is outside a plate panel: le, r and αb are not panel properties.",
		steps: holeSteps
	})];
	const ae = be * input.thicknessMm;
	const kf = ae / ag;
	if (!(kf > 0) || kf > 1 + 1e-9) return [blankCheck({
		id: "axial",
		group: "AXIAL",
		title: "Compression section capacity",
		clause: "6.2.2",
		equation: "kf = Ae/Ag",
		status: "invalid",
		result: "INVALID INPUT",
		note: `kf = Ae/Ag = ${fmt(kf, 4)} is outside (0, 1]. It is not clamped.`,
		steps: holeSteps
	})];
	const ns = kf * an * input.fyMpa;
	const { phi, source } = phiOf("compression");
	const design = phi * ns;
	const action = input.nStarN != null && input.nStarN > 0 ? input.nStarN : null;
	const used = action == null ? null : utilisation(action, design);
	return [blankCheck({
		id: "axial",
		group: "AXIAL",
		title: "Compression section capacity",
		clause: "6.2.1 and 6.2.2",
		equation: "kf = Ae/Ag; Ns = kf An fy; N* ≤ φ Ns",
		status: used?.status ?? "not-checked",
		result: action == null ? `φNs = ${kn(design)}; N* not entered` : `${fmt(used.ratio, 3)}`,
		nominal: ns,
		nominalUnit: "N",
		phi,
		phiSource: source,
		designCapacity: design,
		action,
		utilisation: used?.ratio ?? null,
		steps: [
			...holeSteps,
			`Ae = be × t = ${fmt(be, 3)} × ${fmt(input.thicknessMm, 3)} = ${fmt(ae, 3)} mm².`,
			`kf = Ae/Ag = ${fmt(kf, 4)}.`,
			`Ns = kf An fy = ${fmt(kf, 4)} × ${fmt(an, 3)} × ${fmt(input.fyMpa, 3)} = ${kn(ns)}.`,
			`φ = 0.90. Design section capacity φNs = ${kn(design)}.`,
			"Clause 6.3 member capacity Nc = αc Ns is not evaluated for the panel. It is used only inside bearing and stiffener checks where the clause fixes αb, kf and the slenderness."
		],
		note: "Nominal Ns and design φNs are kept separate. Elastic λ is not N*."
	})];
}
function webThickness(input) {
	if (input.role !== "web") return blankCheck({
		id: "web-thickness",
		group: "WEB",
		title: "Minimum web thickness",
		clause: "5.10",
		equation: "tw limits of Clause 5.10",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "The plate is not identified as a web."
	});
	const webScope = outsideMaterial(input.fyMpa, input.twMm);
	if (webScope) return scopeRow("web-thickness", "WEB", "Minimum web thickness", "1.1.2", webScope);
	if (!pos(input.d1Mm) || !pos(input.twMm) || !pos(input.fyMpa) || !input.webBound && input.stiffening !== "transverse" && input.stiffening !== "longitudinal") return data({
		id: "web-thickness",
		group: "WEB",
		title: "Minimum web thickness",
		clause: "5.10.1",
		equation: "tw ≥ (d1/180) √(fy/250) or the stiffened alternative",
		missing: "Required for a web: clear depth d1, web thickness tw, fy, and whether both longitudinal edges are flanges or one edge is free."
	});
	const root = Math.sqrt(input.fyMpa / 250);
	const d1 = input.d1Mm;
	const tw = input.twMm;
	if (input.plasticWeb) {
		const min = d1 / 82 * root;
		return blankCheck({
			id: "web-thickness",
			group: "WEB",
			title: "Plastic web thickness",
			clause: "5.10.6",
			equation: "tw ≥ (d1/82) √(fy/250)",
			status: tw + 1e-9 >= min ? "pass" : "fail",
			result: `tw ${fmt(tw, 3)} mm vs ${fmt(min, 3)} mm`,
			steps: [`Minimum = (${fmt(d1, 3)} / 82) × √(${fmt(input.fyMpa, 3)}/250) = ${fmt(min, 3)} mm.`],
			note: "Used only because plastic design of the member was selected."
		});
	}
	if (input.stiffening === "unstiffened" || input.stiffening == null) {
		if (!input.webBound) return data({
			id: "web-thickness",
			group: "WEB",
			title: "Minimum web thickness",
			clause: "5.10.1",
			equation: "d1/180 or d1/90",
			missing: "Say whether the unstiffened web is bounded by flanges on both longitudinal sides or by a free edge on one side."
		});
		const denom = input.webBound === "both-flanges" ? 180 : 90;
		const min = d1 / denom * root;
		return blankCheck({
			id: "web-thickness",
			group: "WEB",
			title: "Unstiffened web thickness",
			clause: "5.10.1",
			equation: `tw ≥ (d1/${denom}) √(fy/250)`,
			status: tw + 1e-9 >= min ? "pass" : "fail",
			result: `tw ${fmt(tw, 3)} mm vs ${fmt(min, 3)} mm`,
			steps: [`d1 = ${fmt(d1, 3)} mm, ignoring fillets. Minimum = ${fmt(min, 3)} mm.`],
			note: input.stiffening == null ? "Stiffening was not selected, so the unstiffened limit is shown and the shear check stays incomplete." : "Clause 5.10.1."
		});
	}
	if (!pos(input.sMm)) return data({
		id: "web-thickness",
		group: "WEB",
		title: "Stiffened web thickness",
		clause: "5.10.4",
		equation: "tw limit from s/d1",
		missing: "Transverse stiffener spacing s is required. It is not taken from the FEM stiffener lines."
	});
	const ratio = input.sMm / d1;
	if (input.stiffening === "transverse") {
		if (!pos(input.dpMm)) return data({
			id: "web-thickness",
			group: "WEB",
			title: "Stiffened web thickness",
			clause: "5.10.4",
			equation: "unstiffened when s/dp > 3",
			missing: "Clause 5.10.4 treats the web as unstiffened when s/dp > 3. Enter panel depth dp. d1 is not substituted for dp."
		});
		const sOverDp = input.sMm / input.dpMm;
		if (sOverDp > 3) {
			if (!input.webBound) return data({
				id: "web-thickness",
				group: "WEB",
				title: "Web treated as unstiffened",
				clause: "5.10.4",
				equation: "s/dp > 3 uses Clause 5.10.1",
				missing: "s/dp exceeds 3, so the unstiffened thickness of Clause 5.10.1 applies. Say whether both edges are flanges or one edge is free."
			});
			const min = input.webBound === "one-free" ? d1 / 90 * root : d1 / 180 * root;
			return blankCheck({
				id: "web-thickness",
				group: "WEB",
				title: "Web treated as unstiffened",
				clause: "5.10.4",
				equation: "s/dp > 3 is unstiffened; thickness from 5.10.1",
				status: tw + 1e-9 >= min ? "pass" : "fail",
				result: `tw ${fmt(tw, 3)} mm vs ${fmt(min, 3)} mm`,
				steps: [`s/dp = ${fmt(sOverDp, 4)} > 3. Minimum from Clause 5.10.1 is ${fmt(min, 3)} mm. The trigger uses dp, not d1.`],
				note: "Clause 5.10.4. d1 remains the depth in the thickness expression."
			});
		}
		if (ratio > 3) return blankCheck({
			id: "web-thickness",
			group: "WEB",
			title: "Transversely stiffened web thickness",
			clause: "5.10.4",
			equation: "1.0 ≤ s/d1 ≤ 3.0",
			status: "out-of-scope",
			result: "OUTSIDE IMPLEMENTED SCOPE",
			note: `s/dp = ${fmt(sOverDp, 4)} is not greater than 3, so the web is not treated as unstiffened, but s/d1 = ${fmt(ratio, 4)} is above 3. Clause 5.10.4(a) stops at s/d1 = 3. d1 was not substituted for dp, and (d1/200) was not applied outside that range.`
		});
		let min;
		let clauseBit;
		if (ratio >= 1) {
			min = d1 / 200 * root;
			clauseBit = "(d1/200) √(fy/250) for 1.0 ≤ s/d1 ≤ 3.0";
		} else if (ratio > .74) {
			min = input.sMm / 200 * root;
			clauseBit = "(s/200) √(fy/250) for 0.74 < s/d1 < 1.0";
		} else {
			min = d1 / 270 * root;
			clauseBit = "(d1/270) √(fy/250) for s/d1 ≤ 0.74";
		}
		return blankCheck({
			id: "web-thickness",
			group: "WEB",
			title: "Transversely stiffened web thickness",
			clause: "5.10.4",
			equation: clauseBit,
			status: tw + 1e-9 >= min ? "pass" : "fail",
			result: `tw ${fmt(tw, 3)} mm vs ${fmt(min, 3)} mm`,
			steps: [`s/d1 = ${fmt(ratio, 4)}. Minimum tw = ${fmt(min, 3)} mm.`],
			note: "No longitudinal stiffeners in this thickness clause."
		});
	}
	if (!pos(input.d2Mm)) return data({
		id: "web-thickness",
		group: "WEB",
		title: "Longitudinally stiffened web thickness",
		clause: "5.10.5",
		equation: "tw limit using d2",
		missing: "d2 is twice the clear distance from the neutral axis to the compression flange. It is not assumed equal to d1."
	});
	const where = input.longWhere;
	if (where == null || where === "none") return data({
		id: "web-thickness",
		group: "WEB",
		title: "Longitudinally stiffened web thickness",
		clause: "5.10.5",
		equation: "stiffener position",
		missing: "Say whether the longitudinal stiffener is at 0.2 d2 from the compression flange, at the neutral axis, or both. The clause applies when that stiffener is required."
	});
	let min;
	let equation;
	if (where === "neutral") {
		if (ratio > 1.5) return blankCheck({
			id: "web-thickness",
			group: "WEB",
			title: "Neutral-axis stiffener thickness limit",
			clause: "5.10.5",
			equation: "tw ≥ (d1/400) √(fy/250) when s/d1 ≤ 1.5",
			status: "not-applicable",
			result: "NOT APPLICABLE",
			note: "The additional neutral-axis limit is stated for s/d1 ≤ 1.5. This spacing is larger, so that limit is not applied. The 0.2 d2 set is a separate requirement."
		});
		min = d1 / 400 * root;
		equation = "tw ≥ (d1/400) √(fy/250)";
	} else {
		if (ratio >= 1 && ratio <= 2.4) {
			min = d1 / 250 * root;
			equation = "(d1/250) √(fy/250) for 1.0 ≤ s/d1 ≤ 2.4";
		} else if (ratio >= .74 && ratio <= 1) {
			min = input.sMm / 250 * root;
			equation = "(s/250) √(fy/250) for 0.74 ≤ s/d1 ≤ 1.0";
		} else if (ratio < .74) {
			min = d1 / 340 * root;
			equation = "(d1/340) √(fy/250) for s/d1 < 0.74";
		} else return blankCheck({
			id: "web-thickness",
			group: "WEB",
			title: "Longitudinally stiffened web thickness",
			clause: "5.10.5",
			equation: "s/d1 > 2.4",
			status: "out-of-scope",
			result: "OUTSIDE IMPLEMENTED SCOPE",
			note: "Clause 5.10.5 states the 0.2 d2 thickness limits up to s/d1 = 2.4. A wider spacing is not given a substitute here."
		});
		if (where === "both" && ratio <= 1.5) min = Math.max(min, d1 / 400 * root);
	}
	return blankCheck({
		id: "web-thickness",
		group: "WEB",
		title: "Longitudinally stiffened web thickness",
		clause: "5.10.5",
		equation,
		status: tw + 1e-9 >= min ? "pass" : "fail",
		result: `tw ${fmt(tw, 3)} mm vs ${fmt(min, 3)} mm`,
		steps: [`s/d1 = ${fmt(ratio, 4)}. d2 = ${fmt(input.d2Mm, 3)} mm is recorded and is not used in the thickness formula. Minimum tw = ${fmt(min, 3)} mm.`],
		note: "d2 locates the stiffener. The thickness formula uses d1 and s as written."
	});
}
function shearCheck(input) {
	const empty = {
		vw: null,
		alphaV: null,
		dp: null,
		tw: null
	};
	if (input.role !== "web") return {
		check: blankCheck({
			id: "shear",
			group: "SHEAR",
			title: "Web shear",
			clause: "5.11",
			equation: "V* ≤ φ Vv",
			status: "not-applicable",
			result: "NOT APPLICABLE",
			note: "Clause 5.11 is a web shear check. An element that is not a web does not receive it. Elastic τcr is not φVv."
		}),
		...empty
	};
	const shearScope = outsideMaterial(input.fyMpa, input.twMm);
	if (shearScope) return {
		check: scopeRow("shear", "SHEAR", "Web shear", "1.1.2", shearScope),
		...empty
	};
	if (!pos(input.dpMm) || !pos(input.twMm) || !pos(input.fyMpa) || input.webGross !== "gross" || !input.stiffening || !input.shearMode) return {
		check: data({
			id: "shear",
			group: "SHEAR",
			title: "Web shear",
			clause: "5.11",
			equation: "Vw = 0.6 fy Aw; Vu = Vw or Vb",
			missing: "Required: panel depth dp, web thickness tw, fy, confirmation that Aw is the gross web area, uniform or non-uniform shear, and unstiffened / transverse / longitudinal stiffening. dp is not copied from the panel height."
		}),
		...empty
	};
	const dp = input.dpMm;
	const tw = input.twMm;
	const fy = input.fyMpa;
	const aw = dp * tw;
	const vw = shearYield(fy, aw);
	const ratio = dp / tw;
	const limit = stockyLimit(fy);
	const stocky = ratio <= limit;
	const steps = [
		`Aw = dp × tw = ${fmt(dp, 3)} × ${fmt(tw, 3)} = ${fmt(aw, 3)} mm², gross web, no holes confirmed.`,
		`Vw = 0.6 fy Aw = 0.6 × ${fmt(fy, 3)} × ${fmt(aw, 3)} = ${kn(vw)} (Clause 5.11.4).`,
		`dp/tw = ${fmt(ratio, 3)}. 82/√(fy/250) = ${fmt(limit, 3)}.`
	];
	let vu = vw;
	let alphaV = null;
	const sOver = input.sMm != null && dp > 0 ? input.sMm / dp : null;
	if (input.stiffening !== "unstiffened" && sOver != null && sOver > 0 && sOver <= 3) alphaV = alphaVStiffened(ratio, fy, sOver);
	if (!stocky) {
		const stiffened = input.stiffening !== "unstiffened" && sOver != null && sOver <= 3 && sOver > 0;
		if (input.stiffening !== "unstiffened" && (sOver == null || !(sOver > 0))) return {
			check: data({
				id: "shear",
				group: "SHEAR",
				title: "Stiffened web shear",
				clause: "5.11.5.2",
				equation: "Vb = αv αd αf Vw ≤ Vw",
				missing: "Stiffener spacing s is required and must be positive. Spacing is not read from the FEM model.",
				steps
			}),
			vw,
			alphaV,
			dp,
			tw
		};
		if (!stiffened) {
			alphaV = alphaVUnstiffened(ratio, fy);
			const vb = Math.min(vw, alphaV * vw);
			vu = vb;
			steps.push(input.stiffening !== "unstiffened" ? `s/dp = ${fmt(sOver ?? 0, 3)} > 3, so Clause 5.10.4 treats the web as unstiffened.` : "Unstiffened web, Clause 5.11.5.1.");
			steps.push(`αv = [82 / ((dp/tw) √(fy/250))]² = ${fmt(alphaV, 4)}.`);
			steps.push(`Vb = αv Vw ≤ Vw = ${kn(vb)}. Vu = Vb because dp/tw exceeds the yield limit.`);
		} else {
			alphaV = alphaVStiffened(ratio, fy, sOver);
			const ad = alphaD(alphaV, sOver, input.endPanel);
			let af = 1;
			let afNote = "αf = 1.0 by Clause 5.11.5.2(a).";
			if (input.stiffening === "longitudinal") afNote = "Longitudinal stiffeners are present, so the flange formula 5.11.5.2(b) is not used. αf = 1.0. A rational value under 5.11.5.2(c) is not supplied.";
			else if (input.alphaF === "flange") {
				if (!pos(input.bfoMm) || !pos(input.tfMm) || !pos(input.d1Mm)) return {
					check: data({
						id: "shear",
						group: "SHEAR",
						title: "Stiffened web shear",
						clause: "5.11.5.2(b)",
						equation: "αf = 1.6 − 0.6/√[1 + 40 bfo tf²/(d1² tw)]",
						missing: "Flange restraint needs bfo (the least of 12 tf/√(fy/250), the flange outstand from the web mid-plane, and half the clear distance between webs), plus tf and d1.",
						steps
					}),
					vw,
					alphaV,
					dp,
					tw
				};
				af = alphaFFlange(input.bfoMm, input.tfMm, input.d1Mm, tw);
				afNote = `αf = 1.6 − 0.6/√[1 + 40×${fmt(input.bfoMm, 3)}×${fmt(input.tfMm, 3)}²/(${fmt(input.d1Mm, 3)}²×${fmt(tw, 3)})] = ${fmt(af, 4)}. bfo must already be the least of the three Clause 5.11.5.2(b) lengths.`;
			}
			const adText = input.endPanel ? "αd = 1.0 as required by Clause 5.15.2.2 for the end panel." : `αd = 1 + (1−αv)/(1.15 αv √(1+(s/dp)²)) = ${fmt(ad, 4)}.`;
			const vb = Math.min(vw, alphaV * ad * af * vw);
			vu = vb;
			steps.push(`s/dp = ${fmt(sOver, 4)} ≤ 3, Clause 5.11.5.2.`);
			steps.push(`αv = ${fmt(alphaV, 4)} (capped at 1). ${adText} ${afNote}`);
			steps.push(`Vb = αv αd αf Vw ≤ Vw = ${kn(vb)}.`);
		}
	} else {
		steps.push("dp/tw is within the Clause 5.11.2 yield limit, so Vu = Vw. Buckling is not used for Vu.");
		if (alphaV != null) steps.push(`Stiffened αv = ${fmt(alphaV, 4)} is kept for Clause 5.15.3 only. It does not reduce Vu.`);
	}
	let vv = vu;
	if (input.shearMode === "non-uniform") {
		if (!pos(input.fvmMpa) || !pos(input.fvaMpa)) return {
			check: data({
				id: "shear",
				group: "SHEAR",
				title: "Non-uniform web shear",
				clause: "5.11.3",
				equation: "Vv = 2 Vu / (0.9 + f*vm/f*va) ≤ Vu",
				missing: "Maximum and average design shear stresses from a rational elastic analysis are required. They are not taken from the FEM eigenmode.",
				steps
			}),
			vw,
			alphaV,
			dp,
			tw
		};
		vv = Math.min(vu, 2 * vu / (.9 + input.fvmMpa / input.fvaMpa));
		steps.push(`Clause 5.11.3: f*vm = ${fmt(input.fvmMpa, 3)} MPa, f*va = ${fmt(input.fvaMpa, 3)} MPa. Vv = ${kn(vv)}.`);
	} else steps.push("Approximately uniform shear, Clause 5.11.2, so Vv = Vu.");
	const { phi, source } = phiOf("shear");
	const design = phi * vv;
	const action = pos(input.vStarN) || input.vStarN === 0 ? input.vStarN : null;
	const used = action == null ? null : utilisation(action, design);
	steps.push(`Nominal Vv = ${kn(vv)}. φ = 0.90. Design shear capacity φVv = ${kn(design)}.`);
	if (action != null) steps.push(`V* = ${kn(action)}. V*/φVv = ${fmt(used.ratio, 4)}.`);
	return {
		check: blankCheck({
			id: "shear",
			group: "SHEAR",
			title: stocky ? "Shear yield" : "Shear buckling",
			clause: stocky ? "5.11.2 and 5.11.4" : "5.11.5",
			equation: "V* ≤ φ Vv, with Vv from uniform or non-uniform shear",
			status: used?.status ?? "not-checked",
			result: action == null ? `φVv = ${kn(design)}; V* not entered` : `${fmt(used.ratio, 3)}`,
			nominal: vv,
			nominalUnit: "N",
			phi,
			phiSource: source,
			designCapacity: design,
			action,
			utilisation: used?.ratio ?? null,
			steps,
			note: "Elastic τcr is not this capacity. Nominal Vv and design φVv are separate."
		}),
		vw,
		alphaV,
		dp,
		tw
	};
}
function interaction(input, shearDesign, shearNominal) {
	if (input.role !== "web") return blankCheck({
		id: "interaction",
		group: "INTERACTION",
		title: "Shear and bending",
		clause: "5.12",
		equation: "V* ≤ φ Vvm",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "Clause 5.12 is for a web with bending. It is not applied to a plate element."
	});
	if (input.interaction == null) return blankCheck({
		id: "interaction",
		group: "INTERACTION",
		title: "Shear and bending",
		clause: "5.12",
		equation: "5.12.2 or 5.12.3",
		status: "not-checked",
		result: "NOT CHECKED",
		note: "Choose no bending, the flange proportioning method, or the section interaction method. Neither is assumed."
	});
	if (input.interaction === "none") return blankCheck({
		id: "interaction",
		group: "INTERACTION",
		title: "Shear and bending",
		clause: "5.12",
		equation: "V* ≤ φ Vv",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "No bending design action is identified, so Clause 5.12 is not applied. Shear alone remains Clause 5.11."
	});
	if (shearNominal == null || shearDesign == null) return data({
		id: "interaction",
		group: "INTERACTION",
		title: "Shear and bending",
		clause: "5.12",
		equation: "Vvm from Vv",
		missing: "Web shear capacity is not available, so the interaction cannot start."
	});
	const { phi, source } = phiOf("bending");
	if (input.interaction === "proportioning") {
		if (!pos(input.afeMm2) || !pos(input.afgMm2) || !pos(input.afnMm2) || !pos(input.dfMm) || !pos(input.flangeFyMpa) || !pos(input.flangeFuMpa) || input.mStarNmm == null) return data({
			id: "interaction",
			group: "INTERACTION",
			title: "Proportioning method",
			clause: "5.12.2",
			equation: "Mf = Afm df fy",
			missing: "Required: compression-flange effective area from Clause 6.2.2, flange gross area, flange net area, fu, fy, distance between flange centroids, and M*. The plate model is not turned into flanges."
		});
		const tensionCap = Math.min(input.afgMm2, .85 * input.afnMm2 * input.flangeFuMpa / input.flangeFyMpa);
		const afm = Math.min(input.afeMm2, tensionCap);
		const mf = afm * input.dfMm * input.flangeFyMpa;
		const designM = phi * mf;
		const mRatio = input.mStarNmm / designM;
		const steps = [
			`Tension-side limit = min(Afg, 0.85 Afn fu/fy) = ${fmt(tensionCap, 3)} mm².`,
			`Afm = min(compression effective area, tension-side limit) = ${fmt(afm, 3)} mm².`,
			`Mf = Afm df fy = ${kn(mf)}·mm / 1e6 → moment ${fmt(mf / 1e6, 3)} kN·m.`,
			`φ = 0.90. φMf = ${fmt(designM / 1e6, 3)} kN·m. M* = ${fmt(input.mStarNmm / 1e6, 3)} kN·m.`
		];
		if (mRatio > 1) return blankCheck({
			id: "interaction",
			group: "INTERACTION",
			title: "Proportioning method",
			clause: "5.12.2",
			equation: "M* ≤ φ Mf, then Vvm = Vv",
			status: "fail",
			result: `${fmt(mRatio, 3)}`,
			phi,
			phiSource: source,
			utilisation: mRatio,
			action: input.mStarNmm,
			designCapacity: designM,
			steps: [...steps, "M* exceeds φMf, so Clause 5.12.2 does not grant Vvm = Vv."],
			note: "The flanges-only moment capacity is exceeded."
		});
		const vAction = input.vStarN;
		const used = vAction == null ? null : utilisation(vAction, shearDesign);
		return blankCheck({
			id: "interaction",
			group: "INTERACTION",
			title: "Proportioning method",
			clause: "5.12.2",
			equation: "M* ≤ φ Mf and V* ≤ φ Vv",
			status: used?.status ?? "not-checked",
			result: used ? `${fmt(Math.max(used.ratio, mRatio), 3)}` : `M*/φMf = ${fmt(mRatio, 3)}; V* not entered`,
			phi,
			phiSource: source,
			nominal: shearNominal,
			nominalUnit: "N",
			designCapacity: shearDesign,
			action: vAction,
			utilisation: used ? Math.max(used.ratio, mRatio) : null,
			steps: [
				...steps,
				"M* ≤ φMf, so Vvm = Vv and the shear design capacity remains φVv.",
				used ? `V*/φVv = ${fmt(used.ratio, 4)}.` : "V* was not entered."
			],
			note: "The reported utilisation needs both M* and V*. A missing action is not a governing ratio."
		});
	}
	if (!pos(input.msNmm) || input.mStarNmm == null) return data({
		id: "interaction",
		group: "INTERACTION",
		title: "Section interaction",
		clause: "5.12.3",
		equation: "Vvm = Vv [2.2 − 1.6 M*/(φ Ms)]",
		missing: "M* and the nominal section moment capacity Ms from Clause 5.2 are required. Ms is not calculated from the bare plate, and a segment without full lateral restraint (Clause 5.6) is outside this check."
	});
	const designM = phi * input.msNmm;
	const mRatio = input.mStarNmm / designM;
	let vvm = shearNominal;
	const steps = [`Ms = ${fmt(input.msNmm / 1e6, 4)} kN·m, entered from a Clause 5.2 section. φMs = ${fmt(designM / 1e6, 4)} kN·m.`, `M* = ${fmt(input.mStarNmm / 1e6, 4)} kN·m. M*/φMs = ${fmt(mRatio, 4)}.`];
	if (mRatio > 1) return blankCheck({
		id: "interaction",
		group: "INTERACTION",
		title: "Section interaction",
		clause: "5.12.3",
		equation: "formula stated only for M* ≤ φ Ms",
		status: "fail",
		result: `${fmt(mRatio, 3)}`,
		phi,
		phiSource: source,
		utilisation: mRatio,
		steps: [...steps, "M* > φMs. Clause 5.12.3 does not define Vvm above that limit."],
		note: "Bending section capacity is exceeded. Lateral-buckling member capacity is not evaluated."
	});
	if (input.mStarNmm > .75 * designM) {
		vvm = shearNominal * (2.2 - 1.6 * input.mStarNmm / designM);
		steps.push(`0.75 φMs < M* ≤ φMs, so Vvm = Vv [2.2 − 1.6 M*/(φ Ms)] = ${kn(vvm)}.`);
	} else steps.push("M* ≤ 0.75 φMs, so Vvm = Vv.");
	const designV = phi * vvm;
	const used = input.vStarN == null ? null : utilisation(input.vStarN, designV);
	const ratio = used ? Math.max(used.ratio, mRatio) : null;
	return blankCheck({
		id: "interaction",
		group: "INTERACTION",
		title: "Section interaction",
		clause: "5.12.3",
		equation: "V* ≤ φ Vvm",
		status: used?.status ?? "not-checked",
		result: used ? `${fmt(ratio, 3)}` : `M*/φMs = ${fmt(mRatio, 3)}; φVvm = ${kn(designV)}; V* not entered`,
		nominal: vvm,
		nominalUnit: "N",
		phi,
		phiSource: source,
		designCapacity: designV,
		action: input.vStarN,
		utilisation: ratio,
		steps: [...steps, `φ = 0.90. φVvm = ${kn(designV)}.`],
		note: "φ is the bending capacity factor on Ms and the shear factor on Vvm, both 0.90 from Table 3.4. They are not γM."
	});
}
function bearing(input) {
	if (input.role !== "web") return [blankCheck({
		id: "bearing",
		group: "BEARING",
		title: "Web bearing",
		clause: "5.13",
		equation: "R* ≤ φ Rb",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "The elastic patch load is not a Clause 5.13 bearing check, and this plate is not identified as a web."
	})];
	if (input.bearing == null) return [blankCheck({
		id: "bearing",
		group: "BEARING",
		title: "Web bearing",
		clause: "5.13",
		equation: "Rb = min(Rby, Rbb)",
		status: "not-checked",
		result: "NOT CHECKED",
		note: "Bearing is not addressed. Choose none, an I or C web, or an RHS. The FEM patch eigenvalue is not Rb."
	})];
	if (input.bearing === "none") return [blankCheck({
		id: "bearing",
		group: "BEARING",
		title: "Web bearing",
		clause: "5.13",
		equation: "R* ≤ φ Rb",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "No compressive bearing force is identified."
	})];
	if (input.bearing === "rhs") return [blankCheck({
		id: "bearing",
		group: "BEARING",
		title: "RHS web bearing",
		clause: "5.13.3 and Figure 5.13.1.3",
		equation: "Rby = 2 bb t fy αp",
		status: "out-of-scope",
		result: "OUTSIDE IMPLEMENTED SCOPE",
		note: "The RHS coefficient αp and the interior/end bearing widths in Figure 5.13.1.3 are not implemented. Clause 5.13.5 combined bending and bearing is also not implemented. No RHS capacity is reported."
	})];
	const bearingScope = outsideMaterial(input.fyMpa, input.twMm);
	if (bearingScope) return [scopeRow("bearing", "BEARING", "I or C web bearing", "1.1.2", bearingScope)];
	if (input.stiffening == null) return [data({
		id: "bearing",
		group: "BEARING",
		title: "I or C web bearing",
		clause: "5.13.4",
		equation: "Rbb for a web without transverse stiffeners",
		missing: "Clause 5.13.4 applies to an I-section or C-section web without transverse stiffeners. State that the web is unstiffened, or design a load-bearing stiffener to Clause 5.14. The patch eigenvalue is not Rbb."
	})];
	if (input.stiffening !== "unstiffened") return [blankCheck({
		id: "bearing",
		group: "BEARING",
		title: "I or C web bearing",
		clause: "5.13.4",
		equation: "Rbb for a web without transverse stiffeners",
		status: "out-of-scope",
		result: "OUTSIDE IMPLEMENTED SCOPE",
		note: "A bearing force is identified, but Clause 5.13.4 does not cover a transversely or longitudinally stiffened web. No unstiffened φRb is reported. Clause 5.14 is the stiffener path. Appendix I is informative and is not φRb."
	})];
	if (!pos(input.twMm) || !pos(input.fyMpa) || !pos(input.d1Mm) || input.flangesRestrained == null) return [data({
		id: "bearing",
		group: "BEARING",
		title: "I or C web bearing",
		clause: "5.13.3 and 5.13.4",
		equation: "Rby = 1.25 bbf tw fy; Rbb from Section 6",
		missing: "Required: tw, fy, clear depth d1, and whether both flanges are restrained against lateral movement (2.5 d1/tw) or not (5.0 d1/tw)."
	})];
	let bbf = input.bbfMm;
	let bb = input.bbMm;
	const steps = [];
	if (input.deriveWidth) {
		if (!pos(input.bsMm) || !pos(input.bearingTfMm) || !input.bearingPlace) return [data({
			id: "bearing",
			group: "BEARING",
			title: "Bearing dispersion",
			clause: "5.13.1 and Figure 5.13.1.1",
			equation: "bbf = bs + 5 tf",
			missing: "Dispersion needs the stiff bearing length bs, flange thickness tf, and interior or end."
		})];
		bbf = input.bsMm + 5 * input.bearingTfMm;
		bb = input.bearingPlace === "interior" ? bbf + input.d1Mm : bbf + input.d1Mm / 2;
		steps.push(`Figure 5.13.1.1: bbf = bs + 5 tf = ${fmt(input.bsMm, 3)} + 5×${fmt(input.bearingTfMm, 3)} = ${fmt(bbf, 3)} mm (2.5:1 through the flange, both sides).`);
		steps.push(input.bearingPlace === "interior" ? `Interior 1:1 dispersion to the neutral axis: bb = bbf + d1 = ${fmt(bb, 3)} mm.` : `End 1:1 dispersion on the span side only: bb = bbf + d1/2 = ${fmt(bb, 3)} mm. If the member end cuts this width, enter bb directly instead.`);
	}
	if (!pos(bbf) || !pos(bb)) return [data({
		id: "bearing",
		group: "BEARING",
		title: "I or C web bearing",
		clause: "5.13.3",
		equation: "Rby = 1.25 bbf tw fy",
		missing: "Enter bbf and bb, or derive them from bs, tf and interior/end. bbf is the bearing width at the web shown in Figure 5.13.1.1.",
		steps
	})];
	const rby = 1.25 * bbf * input.twMm * input.fyMpa;
	const leOverR = (input.flangesRestrained ? 2.5 : 5) * input.d1Mm / input.twMm;
	const area = input.twMm * bb;
	const column = columnCapacity({
		leOverR,
		fyMpa: input.fyMpa,
		areaMm2: area,
		alphaB: .5,
		kf: 1
	});
	const rbb = column.nc;
	const rb = Math.min(rby, rbb);
	const { phi, source } = phiOf("bearing");
	const design = phi * rb;
	const action = input.rStarN;
	const used = action == null ? null : utilisation(action, design);
	steps.push(`Rby = 1.25 × ${fmt(bbf, 3)} × ${fmt(input.twMm, 3)} × ${fmt(input.fyMpa, 3)} = ${kn(rby)} (Clause 5.13.3).`);
	steps.push(`Clause 5.13.4: αb = 0.5, kf = 1.0, area = tw bb = ${fmt(area, 3)} mm².`);
	steps.push(`le/r = ${input.flangesRestrained ? "2.5" : "5.0"} d1/tw = ${fmt(leOverR, 3)}.`);
	steps.push(`λn = (le/r) √(kf) √(fy/250) = ${fmt(column.lambdaN, 3)}. αc = ${fmt(column.alpha, 4)} from Clause 6.3.3.`);
	steps.push(`Rbb = αc Ns = ${kn(rbb)}. Rb = min(Rby, Rbb) = ${kn(rb)}.`);
	steps.push(`φ = 0.90. φRb = ${kn(design)}.`);
	return [blankCheck({
		id: "bearing",
		group: "BEARING",
		title: "I or C web bearing",
		clause: "5.13.2",
		equation: "Rb = min(Rby, Rbb); R* ≤ φ Rb",
		status: used?.status ?? "not-checked",
		result: action == null ? `φRb = ${kn(design)}; R* not entered` : `${fmt(used.ratio, 3)}`,
		nominal: rb,
		nominalUnit: "N",
		phi,
		phiSource: source,
		designCapacity: design,
		action,
		utilisation: used?.ratio ?? null,
		steps,
		note: "The elastic patch buckling load is not Rbb. Yield and buckling are both calculated; the lesser nominal value is used."
	})];
}
function gammaOf(arrangement) {
	if (arrangement === "pair") return 1;
	if (arrangement === "single-angle") return 1.8;
	if (arrangement === "single-plate") return 2.4;
	return null;
}
function stiffenerSection(input, fy, tw) {
	if (!pos(input.sMm)) return {
		ok: false,
		missing: "Adjacent stiffener spacing s is required so the web length each side can be limited to s/2."
	};
	const each = Math.min(17.5 * tw / Math.sqrt(fy / 250), input.sMm / 2);
	const webWidth = 2 * each;
	const aWeb = tw * webWidth;
	const iWeb = webWidth * tw ** 3 / 12;
	const steps = [`Web length each side of the stiffener centreline = min(17.5 tw/√(fy/250), s/2) = ${fmt(each, 3)} mm (Clause 5.14.2).`, `Web strip area = ${fmt(aWeb, 3)} mm². Web strip I about the web centreline = ${fmt(iWeb, 3)} mm⁴.`];
	if (pos(input.isMm4) && pos(input.asMm2)) {
		const area = input.asMm2 + aWeb;
		const inertia = input.isMm4 + iWeb;
		steps.push(`Entered stiffener area ${fmt(input.asMm2, 3)} mm² and I ${fmt(input.isMm4, 4)} mm⁴ about the web centreline, excluding the web strip.`);
		return {
			ok: true,
			area,
			inertia,
			ry: Math.sqrt(inertia / area),
			steps
		};
	}
	if ((input.arrangement === "pair" || input.arrangement === "single-plate") && pos(input.tsMm) && pos(input.besMm)) {
		const one = input.tsMm * input.besMm;
		const as = input.arrangement === "pair" ? 2 * one : one;
		if (pos(input.asMm2) && Math.abs(input.asMm2 - as) / as > .01) return {
			ok: false,
			missing: "The entered stiffener area does not match ts × bes for the selected arrangement. One of them is wrong."
		};
		const ys = tw / 2 + input.besMm / 2;
		const iOwn = input.tsMm * input.besMm ** 3 / 12;
		if (input.arrangement === "pair") {
			const inertia = 2 * (iOwn + one * ys * ys) + iWeb;
			const area = as + aWeb;
			steps.push(`Pair of flat plates, each ${fmt(input.besMm, 3)} × ${fmt(input.tsMm, 3)} mm. I is about the axis parallel to the web.`);
			return {
				ok: true,
				area,
				inertia,
				ry: Math.sqrt(inertia / area),
				steps
			};
		}
		const area = as + aWeb;
		const yBar = as * ys / area;
		const inertia = iOwn + as * (ys - yBar) ** 2 + iWeb + aWeb * yBar ** 2;
		steps.push(`Single flat plate ${fmt(input.besMm, 3)} × ${fmt(input.tsMm, 3)} mm. Centroid is offset from the web centreline.`);
		return {
			ok: true,
			area,
			inertia,
			ry: Math.sqrt(inertia / area),
			steps
		};
	}
	return {
		ok: false,
		missing: "Stiffener buckling needs either a flat-plate outstand and thickness, or As and Is about the axis parallel to the web. A single angle is not given an I from area alone."
	};
}
function stiffeners(input, shear) {
	if (input.role !== "web") return [blankCheck({
		id: "stiffener",
		group: "STIFFENER",
		title: "Stiffener design",
		clause: "5.14 / 5.15 / 5.16",
		equation: "web stiffener clauses",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "Stiffener clauses 5.14 to 5.16 are web clauses. FEM EI is not an AS 4100 stiffener capacity."
	})];
	if (input.stiffener == null) return [blankCheck({
		id: "stiffener",
		group: "STIFFENER",
		title: "Stiffener design",
		clause: "5.14 / 5.15 / 5.16",
		equation: "area, stiffness and strength",
		status: "not-checked",
		result: "NOT CHECKED",
		note: "State none, intermediate transverse, load-bearing, or longitudinal. A line in the FEM model does not select the clause."
	})];
	if (input.stiffener === "none") return [blankCheck({
		id: "stiffener",
		group: "STIFFENER",
		title: "Stiffener design",
		clause: "5.15",
		equation: "no stiffener",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "No web stiffener is identified. Unstiffened shear and thickness checks still apply where selected."
	})];
	const stiffScope = outsideMaterial(input.fysMpa, input.tsMm) ?? outsideMaterial(input.fyMpa, input.twMm);
	if (stiffScope) return [scopeRow("stiffener", "STIFFENER", "Stiffener design", "1.1.2", stiffScope)];
	const out = [];
	const { phi, source } = phiOf("stiffener");
	if (pos(input.besMm) && pos(input.tsMm) && pos(input.fysMpa) && !input.outerStiffened) {
		const limit = 15 * input.tsMm / Math.sqrt(input.fysMpa / 250);
		const ok = input.besMm <= limit + 1e-9;
		out.push(blankCheck({
			id: "stiffener-outstand",
			group: "STIFFENER",
			title: "Stiffener outstand",
			clause: "5.14.3",
			equation: "bes ≤ 15 ts / √(fys/250)",
			status: ok ? "pass" : "fail",
			result: `bes ${fmt(input.besMm, 3)} mm vs ${fmt(limit, 3)} mm`,
			phi: null,
			phiSource: "",
			steps: [`Limit = 15 × ${fmt(input.tsMm, 3)} / √(${fmt(input.fysMpa, 3)}/250) = ${fmt(limit, 3)} mm.`],
			note: "Clause 5.15.6 points intermediate stiffeners to this outstand limit."
		}));
	} else if (input.outerStiffened) out.push(blankCheck({
		id: "stiffener-outstand",
		group: "STIFFENER",
		title: "Stiffener outstand",
		clause: "5.14.3",
		equation: "limit waived when the outer edge is continuously stiffened",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "The outer edge is identified as continuously stiffened, so the flat-outstand limit is not applied."
	}));
	else out.push(data({
		id: "stiffener-outstand",
		group: "STIFFENER",
		title: "Stiffener outstand",
		clause: "5.14.3",
		equation: "bes ≤ 15 ts / √(fys/250)",
		missing: "Outstand bes, thickness ts and stiffener yield stress fys are required, unless the outer edge is continuously stiffened."
	}));
	if (input.stiffener === "longitudinal" || input.longWhere === "compression" || input.longWhere === "neutral" || input.longWhere === "both") {
		if (!pos(input.d2Mm) || !pos(input.twMm)) out.push(data({
			id: "longitudinal",
			group: "STIFFENER",
			title: "Longitudinal stiffener stiffness",
			clause: "5.16.2",
			equation: "Is ≥ 4 d2 tw³ [1 + 4 r (1 + r)], r = As/(d2 tw)",
			missing: "d2 and tw are required. The stiffener is checked only when you say it is required."
		}));
		else if (input.longWhere == null || input.longWhere === "none") out.push(blankCheck({
			id: "longitudinal",
			group: "STIFFENER",
			title: "Longitudinal stiffener stiffness",
			clause: "5.16.2",
			equation: "when required",
			status: "not-checked",
			result: "NOT CHECKED",
			note: "Clause 5.16.2 applies when a longitudinal stiffener is required at 0.2 d2 or at the neutral axis. That choice is not made."
		}));
		else if (!pos(input.isLongMm4) || input.longWhere !== "neutral" && !pos(input.asLongMm2)) out.push(data({
			id: "longitudinal",
			group: "STIFFENER",
			title: "Longitudinal stiffener stiffness",
			clause: "5.16.2",
			equation: "Is about the face of the web",
			missing: "Enter Is about the face of the web. The 0.2 d2 stiffener also needs its area As."
		}));
		else {
			const d2 = input.d2Mm;
			const tw = input.twMm;
			const r = (input.asLongMm2 ?? 0) / (d2 * tw);
			const atCompression = 4 * d2 * tw ** 3 * (1 + 4 * r * (1 + r));
			const atNeutral = d2 * tw ** 3;
			const need = input.longWhere === "neutral" ? atNeutral : input.longWhere === "compression" ? atCompression : Math.max(atCompression, atNeutral);
			const ok = input.isLongMm4 + 1e-6 >= need;
			out.push(blankCheck({
				id: "longitudinal",
				group: "STIFFENER",
				title: "Longitudinal stiffener stiffness",
				clause: "5.16.2",
				equation: "Is ≥ 4 d2 tw³ [1 + 4 (As/(d2 tw)) (1 + As/(d2 tw))]",
				status: ok ? "pass" : "fail",
				result: `Is ${fmt(input.isLongMm4, 4)} mm⁴ vs ${fmt(need, 4)} mm⁴`,
				steps: [
					`r = As/(d2 tw) = ${fmt(r, 4)}.`,
					`Compression-flange stiffener requirement = ${fmt(atCompression, 4)} mm⁴.`,
					`Neutral-axis stiffener requirement = d2 tw³ = ${fmt(atNeutral, 4)} mm⁴.`
				],
				note: "Checked because this stiffener was identified as required. FEM GJ is not Is."
			}));
		}
	}
	if (input.stiffener === "intermediate" || input.stiffener === "load-bearing") {
		const gamma = gammaOf(input.arrangement);
		if (input.stiffener === "intermediate") {
			if (shear.alphaV == null || shear.vw == null || !pos(shear.dp) || !pos(input.sMm) || gamma == null || input.webGross !== "gross") out.push(data({
				id: "stiffener-area",
				group: "STIFFENER",
				title: "Intermediate stiffener area",
				clause: "5.15.3",
				equation: "As ≥ 0.5 γ Aw (1−αv) [(s/dp)² − (s/dp)²/√(1+(s/dp)²)]",
				missing: "Needs a stiffened-web αv, gross Aw, spacing s, dp, and pair / single-angle / single-plate."
			}));
			else {
				const sOver = input.sMm / shear.dp;
				const bracket = sOver ** 2 - sOver ** 2 / Math.sqrt(1 + sOver ** 2);
				const aw = shear.dp * (shear.tw ?? input.twMm ?? 0);
				const required = Math.max(0, .5 * gamma * aw * (1 - shear.alphaV) * bracket);
				const provided = input.asMm2;
				const status = provided == null ? "not-checked" : provided + 1e-9 >= required ? "pass" : "fail";
				out.push(blankCheck({
					id: "stiffener-area",
					group: "STIFFENER",
					title: "Intermediate stiffener area",
					clause: "5.15.3",
					equation: "As ≥ 0.5 γ Aw (1−αv) [(s/dp)² − (s/dp)²/√(1+(s/dp)²)]",
					status,
					result: provided == null ? `required ≥ ${fmt(required, 3)} mm²` : `${fmt(provided, 3)} mm² vs ${fmt(required, 3)} mm²`,
					steps: [`γ = ${gamma}. αv = ${fmt(shear.alphaV, 4)}. Bracket = ${fmt(bracket, 4)}. Required As = ${fmt(required, 3)} mm².`],
					note: "External loads on the stiffener are not included. Clause 5.15.7 is separate."
				}));
			}
			if (pos(input.d1Mm) && pos(input.twMm) && pos(input.sMm) && pos(input.isMm4)) {
				const sOverD = input.sMm / input.d1Mm;
				const requiredI = sOverD <= Math.SQRT2 ? .75 * input.d1Mm * input.twMm ** 3 : 1.5 * input.d1Mm * input.twMm ** 3 / sOverD ** 2;
				let extra = 0;
				const extraOn = input.fnN != null || input.fpN != null || input.mpNmm != null;
				if (extraOn) {
					if (input.modulusMpa == null || !(input.modulusMpa > 0)) out.push(data({
						id: "stiffener-stiffness",
						group: "STIFFENER",
						title: "Intermediate stiffener stiffness",
						clause: "5.15.7.1",
						equation: "increase of Is",
						missing: "An external force or moment is entered, so E is required for the Clause 5.15.7.1 increase. Plate E is not taken silently."
					}));
					else {
						const fn = input.fnN ?? 0;
						const fp = input.fpN ?? 0;
						const mp = input.mpNmm ?? 0;
						const e = input.eccMm ?? 0;
						extra = input.d1Mm ** 4 * (2 * fn + (mp + fp * e) / input.d1Mm) / (phi * input.modulusMpa * input.d1Mm * input.twMm);
					}
				}
				if (!out.some((row) => row.id === "stiffener-stiffness" && row.status === "data-required")) {
					const need = requiredI + Math.max(0, extra);
					const ok = input.isMm4 + 1e-6 >= need;
					out.push(blankCheck({
						id: "stiffener-stiffness",
						group: "STIFFENER",
						title: "Intermediate stiffener stiffness",
						clause: "5.15.5",
						equation: "Is ≥ 0.75 d1 tw³, or 1.5 d1 tw³ / (s/d1)²",
						status: ok ? "pass" : "fail",
						result: `Is ${fmt(input.isMm4, 4)} mm⁴ vs ${fmt(need, 4)} mm⁴`,
						steps: [
							`s/d1 = ${fmt(sOverD, 4)}. Base Is = ${fmt(requiredI, 4)} mm⁴.`,
							"The second limit printed in Clause 5.15.5 is Is ≥ 1.5 d1³ tw³ / s² for s/d1 > √2. That is the same as 1.5 d1 tw³ / (s/d1)². Both sides are a second moment of area (length⁴). The first limit is Is ≥ 0.75 d1 tw³ for s/d1 ≤ √2. They meet at s/d1 = √2.",
							extraOn ? `Clause 5.15.7.1 increase = ${fmt(extra, 4)} mm⁴.` : "No external force was entered, so Clause 5.15.7.1 is not added."
						],
						note: "Is is about the centreline of the web."
					}));
				}
			} else out.push(data({
				id: "stiffener-stiffness",
				group: "STIFFENER",
				title: "Intermediate stiffener stiffness",
				clause: "5.15.5",
				equation: "Is ≥ 0.75 d1 tw³ or 1.5 d1 tw³/(s/d1)²",
				missing: "d1, tw, s and Is about the web centreline are required."
			}));
		}
		if (!pos(input.fyMpa) || !pos(input.twMm) || !pos(input.d1Mm) || input.fysMpa == null) out.push(data({
			id: "stiffener-strength",
			group: "STIFFENER",
			title: "Stiffener strength",
			clause: input.stiffener === "load-bearing" ? "5.14" : "5.15.4",
			equation: "Rsb from Clause 6.3.3 with αb = 0.5 and kf = 1",
			missing: "fy, fys, tw and d1 are required. If fys differs from fy, Section 6 has one yield stress and this check stops."
		}));
		else if (Math.abs(input.fysMpa - input.fyMpa) > .05) out.push(blankCheck({
			id: "stiffener-strength",
			group: "STIFFENER",
			title: "Stiffener strength",
			clause: "5.14.2",
			equation: "Section 6 with one fy",
			status: "data-required",
			result: "VERIFIED STANDARD DATA REQUIRED",
			note: `Stiffener fys ${fmt(input.fysMpa, 3)} MPa differs from web fy ${fmt(input.fyMpa, 3)} MPa. Clause 5.14.2 points to Section 6, which is written for one yield stress. No hybrid capacity is invented.`
		}));
		else {
			const section = stiffenerSection(input, input.fyMpa, input.twMm);
			if (!section.ok) out.push(data({
				id: "stiffener-strength",
				group: "STIFFENER",
				title: "Stiffener buckling",
				clause: "5.14.2",
				equation: "Nc = αc Ns",
				missing: section.missing
			}));
			else {
				const leFactor = input.stiffener === "intermediate" ? 1 : input.stiffenerLe === "0.7d1" ? .7 : input.stiffenerLe === "d1" ? 1 : null;
				if (leFactor == null) out.push(data({
					id: "stiffener-strength",
					group: "STIFFENER",
					title: "Load-bearing stiffener buckling",
					clause: "5.14.2",
					equation: "le = 0.7 d1 or d1",
					missing: "Say whether the flanges restrain rotation in the plane of the stiffener (le = 0.7 d1) or not (le = d1).",
					steps: section.steps
				}));
				else {
					const le = leFactor * input.d1Mm;
					const column = columnCapacity({
						leOverR: le / section.ry,
						fyMpa: input.fyMpa,
						areaMm2: section.area,
						alphaB: .5,
						kf: 1
					});
					const steps = [
						...section.steps,
						`le = ${leFactor === 1 && input.stiffener === "intermediate" ? "d1 (Clause 5.15.4)" : leFactor === .7 ? "0.7 d1" : "d1"} = ${fmt(le, 3)} mm.`,
						`ry = ${fmt(section.ry, 3)} mm. λn = ${fmt(column.lambdaN, 3)}. αc = ${fmt(column.alpha, 4)}.`,
						`Rsb = αc × 1.0 × ${fmt(section.area, 3)} × ${fmt(input.fyMpa, 3)} = ${kn(column.nc)}.`
					];
					if (input.stiffener === "load-bearing") {
						if (!pos(input.bbfMm)) out.push(data({
							id: "stiffener-strength",
							group: "STIFFENER",
							title: "Load-bearing stiffener yield",
							clause: "5.14.1",
							equation: "Rsy = Rby + As fys",
							missing: "bbf is required so Rby = 1.25 bbf tw fy can be added to As fys.",
							steps
						}));
						else if (!pos(input.asMm2)) out.push(data({
							id: "stiffener-strength",
							group: "STIFFENER",
							title: "Load-bearing stiffener yield",
							clause: "5.14.1",
							equation: "Rsy = Rby + As fys",
							missing: "Stiffener area As in contact with the flange is required.",
							steps
						}));
						else {
							const rby = 1.25 * input.bbfMm * input.twMm * input.fyMpa;
							const rsy = rby + input.asMm2 * input.fysMpa;
							const designY = phi * rsy;
							const designB = phi * column.nc;
							const action = input.rStarN;
							const yUse = action == null ? null : utilisation(action, designY);
							const bUse = action == null ? null : utilisation(action, designB);
							const ratio = yUse && bUse ? Math.max(yUse.ratio, bUse.ratio) : null;
							out.push(blankCheck({
								id: "stiffener-strength",
								group: "STIFFENER",
								title: "Load-bearing stiffener",
								clause: "5.14.1 and 5.14.2",
								equation: "R* ≤ φ Rsy and R* ≤ φ Rsb",
								status: ratio == null ? "not-checked" : ratio <= 1 ? "pass" : "fail",
								result: ratio == null ? `φRsy = ${kn(designY)}; φRsb = ${kn(designB)}` : `${fmt(ratio, 3)}`,
								nominal: Math.min(rsy, column.nc),
								nominalUnit: "N",
								phi,
								phiSource: source,
								designCapacity: Math.min(designY, designB),
								action,
								utilisation: ratio,
								steps: [...steps, `Rby = ${kn(rby)}. Rsy = Rby + As fys = ${kn(rsy)}. φRsy = ${kn(designY)}. φRsb = ${kn(designB)}.`],
								note: "Both yield and buckling are required. The governing utilisation is the larger ratio."
							}));
						}
					} else if (shear.vw != null && shear.alphaV != null && pos(shear.dp)) {
						const vb = Math.min(shear.vw, shear.alphaV * shear.vw);
						const design = phi * (column.nc + vb);
						const action = input.vStarN;
						const used = action == null ? null : utilisation(action, design);
						out.push(blankCheck({
							id: "stiffener-strength",
							group: "STIFFENER",
							title: "Intermediate stiffener buckling",
							clause: "5.15.4",
							equation: "V* ≤ φ (Rsb + Vb) with αd = 1 and αf = 1",
							status: used?.status ?? "not-checked",
							result: action == null ? `φ(Rsb+Vb) = ${kn(design)}` : `${fmt(used.ratio, 3)}`,
							nominal: column.nc + vb,
							nominalUnit: "N",
							phi,
							phiSource: source,
							designCapacity: design,
							action,
							utilisation: used?.ratio ?? null,
							steps: [...steps, `Vb uses αd = 1 and αf = 1, so Vb = ${kn(vb)}. φ(Rsb+Vb) = ${kn(design)}.`],
							note: "This Vb is not the shear capacity used in Clause 5.11, because αd and αf are set to 1."
						}));
					} else out.push(data({
						id: "stiffener-strength",
						group: "STIFFENER",
						title: "Intermediate stiffener buckling",
						clause: "5.15.4",
						equation: "V* ≤ φ(Rsb+Vb)",
						missing: "Shear yield Vw and stiffened αv are required before Vb can be added to Rsb.",
						steps
					}));
				}
			}
		}
		if (input.stiffener === "intermediate" && pos(input.twMm) && pos(input.fyMpa) && pos(input.besMm)) {
			const required = 8e-4 * input.twMm ** 2 * input.fyMpa / input.besMm;
			const provided = input.weldKnPerMm;
			out.push(blankCheck({
				id: "stiffener-weld",
				group: "STIFFENER",
				title: "Stiffener-to-web connection",
				clause: "5.15.8",
				equation: "0.0008 tw² fy / bes",
				status: provided == null ? "not-checked" : provided + 1e-9 >= required ? "pass" : "fail",
				result: provided == null ? `required ${fmt(required, 4)} kN/mm` : `${fmt(provided, 4)} vs ${fmt(required, 4)} kN/mm`,
				steps: [`With tw and bes in mm and fy in MPa, the required design shear is ${fmt(required, 4)} kN/mm.`],
				note: "Compared only with a weld capacity you enter. Nothing is assumed about the weld size."
			}));
		}
	}
	if (input.endPost) {
		if (shear.alphaV == null || shear.vw == null || !pos(input.d1Mm) || !pos(input.fyMpa) || !pos(input.endGapMm) || input.vStarN == null) out.push(data({
			id: "end-post",
			group: "STIFFENER",
			title: "End post",
			clause: "5.15.9",
			equation: "Aep ≥ d1 [(V*/φ) − αv Vw] / (8 e fy)",
			missing: "End-post area needs d1, fy, the gap e between the end plate and the load-bearing stiffener, V*, αv and Vw."
		}));
		else {
			const demand = input.d1Mm * (input.vStarN / phi - shear.alphaV * shear.vw) / (8 * input.endGapMm * input.fyMpa);
			const required = Math.max(0, demand);
			const provided = input.aepMm2;
			out.push(blankCheck({
				id: "end-post",
				group: "STIFFENER",
				title: "End post area",
				clause: "5.15.9",
				equation: "Aep ≥ d1 [(V*/φ) − αv Vw] / (8 e fy)",
				status: provided == null ? "not-checked" : provided + 1e-9 >= required ? "pass" : "fail",
				result: provided == null ? `required ≥ ${fmt(required, 3)} mm²` : `${fmt(provided, 3)} mm² vs ${fmt(required, 3)} mm²`,
				phi,
				phiSource: source,
				steps: [`Uncapped expression = ${fmt(demand, 3)} mm². Required area = ${fmt(required, 3)} mm². The load-bearing stiffener itself is still Clause 5.14.`],
				note: "A negative expression means V*/φ does not exceed αv Vw, so the area inequality does not demand plate area."
			}));
		}
	}
	if (input.soleTorsion) {
		if (!pos(input.asMm2) || !pos(input.isMm4) || !pos(input.d1Mm) || !pos(input.torsionDepthMm) || !pos(input.torsionTfMm) || !pos(input.rStarN) || !pos(input.fMemberN)) out.push(data({
			id: "torsion-restraint",
			group: "STIFFENER",
			title: "Torsional end restraint",
			clause: "5.14.5",
			equation: "Is ≥ (αt/1000) (d³ tf R*/F*)",
			missing: "Required when these stiffeners are the sole torsional restraint: d1, critical-flange depth d, flange thickness tf, R*, total design load F* between supports, and the pair area As and second moment Is."
		}));
		else if (input.stiffenerLe == null) out.push(data({
			id: "torsion-restraint",
			group: "STIFFENER",
			title: "Torsional end restraint",
			clause: "5.14.5",
			equation: "le from Clause 5.14.2",
			missing: "Say whether the flanges restrain rotation in the plane of the stiffener (le = 0.7 d1) or not (le = d1). le is not assumed."
		}));
		else {
			const sectionRy = Math.sqrt(input.isMm4 / input.asMm2);
			const slenderness = (input.stiffenerLe === "0.7d1" ? .7 : 1) * input.d1Mm / sectionRy;
			const alphaT = Math.min(4, Math.max(0, 230 / slenderness - .6));
			const required = alphaT / 1e3 * (input.torsionDepthMm ** 3 * input.torsionTfMm * input.rStarN / input.fMemberN);
			out.push(blankCheck({
				id: "torsion-restraint",
				group: "STIFFENER",
				title: "Torsional end restraint",
				clause: "5.14.5",
				equation: "Is ≥ (αt/1000) (d³ tf R*/F*), 0 ≤ αt ≤ 4",
				status: input.isMm4 + 1e-6 >= required ? "pass" : "fail",
				result: `Is ${fmt(input.isMm4, 4)} mm⁴ vs ${fmt(required, 4)} mm⁴`,
				steps: [`le/ry = ${fmt(slenderness, 3)}. αt = 230/(le/ry) − 0.60 = ${fmt(alphaT, 4)}, limited to 0…4. ry is √(Is/As) from the entered pair, not from the web-strip section.`],
				note: "Used only because the stiffeners were identified as the sole torsional restraint of the member."
			}));
		}
	}
	return out;
}
function openings(input) {
	if (input.role !== "web") return blankCheck({
		id: "openings",
		group: "WEB",
		title: "Openings",
		clause: "5.10.7",
		equation: "lw/d1 limits",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "Not a web."
	});
	if (input.openings == null) return blankCheck({
		id: "openings",
		group: "WEB",
		title: "Openings",
		clause: "5.10.7",
		equation: "lw/d1 ≤ 0.10 or 0.33",
		status: "not-checked",
		result: "NOT CHECKED",
		note: "Say there is no opening, or enter the greatest internal dimension. Castellated and stiffened openings need a rational analysis and are outside this check."
	});
	if (input.openings === "none") return blankCheck({
		id: "openings",
		group: "WEB",
		title: "Openings",
		clause: "5.10.7",
		equation: "no opening",
		status: "not-applicable",
		result: "NOT APPLICABLE",
		note: "No web opening is identified."
	});
	if (!pos(input.lwMm) || !pos(input.d1Mm)) return data({
		id: "openings",
		group: "WEB",
		title: "Openings",
		clause: "5.10.7",
		equation: "lw/d1",
		missing: "Opening dimension lw and clear depth d1 are required. Spacing of adjacent openings is not checked unless you confirm it separately — one opening is checked here."
	});
	const ratio = input.lwMm / input.d1Mm;
	const limit = input.openingStiffened ? .33 : .1;
	return blankCheck({
		id: "openings",
		group: "WEB",
		title: "Unstiffened opening proportion",
		clause: "5.10.7",
		equation: input.openingStiffened ? "lw/d1 ≤ 0.33" : "lw/d1 ≤ 0.10",
		status: ratio <= limit + 1e-12 ? "pass" : "fail",
		result: `lw/d1 = ${fmt(ratio, 3)} vs ${limit}`,
		note: "The 0.33 limit applies when the member is longitudinally stiffened. It is not a capacity for a stiffened opening or a castellated member. Adjacent-opening spacing is not measured."
	});
}
function appendix(input, vv) {
	if (!input.appendixI) return blankCheck({
		id: "appendix-i",
		group: "APPENDIX I",
		title: "Stiffened web combined actions",
		clause: "Appendix I",
		equation: "I.1 yield and I.2 buckling",
		status: "not-checked",
		result: "NOT CHECKED",
		normative: false,
		kind: "information",
		note: "Appendix I is informative. It is not a normative φRu. Leave it off and it is listed as not run; it does not silently pass."
	});
	if (!pos(input.dpMm) || !pos(input.twMm) || !pos(input.fyMpa) || !pos(input.sMm) || !pos(input.bbfMm)) return data({
		id: "appendix-i",
		group: "APPENDIX I",
		title: "Combined actions",
		clause: "Appendix I",
		equation: "I.1 and I.2",
		missing: "Informative check needs dp, tw, fy, s and bbf. Actions Mw*, Vw*, Nw* and Rw* are the web-panel actions in Figure I.1, not the elastic eigenvalue.",
		normative: false,
		kind: "information"
	});
	if (input.mwNmm == null || input.vwN == null || input.nwN == null || input.rwN == null || vv == null) return data({
		id: "appendix-i",
		group: "APPENDIX I",
		title: "Combined actions",
		clause: "I.1",
		equation: "(Rw*/(φ bbf tw))² + (fw*/φ)² + (Vw*/(0.6 φ Aw))² ≤ fy²",
		missing: "Enter the four panel actions. Vv from Clause 5.11 must already be available for I.2.",
		normative: false,
		kind: "information"
	});
	const aw = input.dpMm * input.twMm;
	const zwe = input.twMm * input.dpMm ** 2 / 6;
	const fw = input.nwN / aw + .77 * input.mwNmm / zwe;
	const { phi } = phiOf("shear");
	const termR = input.rwN / (phi * input.bbfMm * input.twMm);
	const termF = fw / phi;
	const termV = input.vwN / (.6 * phi * aw);
	const yieldSide = termR ** 2 + termF ** 2 + termV ** 2;
	const fy2 = input.fyMpa ** 2;
	const root = input.dpMm / input.twMm * Math.sqrt(input.fyMpa / 250);
	const nwo = Math.min(aw * input.fyMpa, 45 * aw * input.fyMpa / root);
	const beta = .1 + 20 / root;
	const rsb = beta * input.bbfMm * input.twMm * input.fyMpa;
	const b = input.bbfMm / input.sMm;
	const alphaW = (3.4 + 2.2 * input.dpMm / input.sMm) * (.4 + .5 * b);
	const de = 1.9 * Math.sqrt(input.bbfMm * input.dpMm) / alphaW;
	const mwNominal = input.fyMpa * zwe;
	const buckle = (input.rwN / (phi * rsb)) ** 2 + (input.nwN / (phi * nwo)) ** 2 + (input.vwN / (phi * vv)) ** 2 + (input.mwNmm / (phi * mwNominal)) ** 2;
	return blankCheck({
		id: "appendix-i",
		group: "APPENDIX I",
		title: "Informative combined check",
		clause: "I.1 and I.2",
		equation: "yield criterion and buckling criterion",
		status: yieldSide <= fy2 + 1e-6 && buckle <= 1 + 1e-9 ? "pass" : "fail",
		normative: false,
		kind: "information",
		result: `yield ${fmt(yieldSide / fy2, 3)} of fy²; buckling ${fmt(buckle, 3)}`,
		steps: [
			`Zwe = tw dp²/6 = ${fmt(zwe, 3)} mm³. fw* = Nw*/Aw + 0.77 Mw*/Zwe = ${fmt(fw, 3)} MPa.`,
			`Yield left side = ${fmt(yieldSide, 4)}; fy² = ${fmt(fy2, 4)}.`,
			`Nwo = min(Aw fy, 45 Aw fy / ((dp/tw)√(fy/250))) = ${kn(nwo)}.`,
			`βw = 0.10 + 20/((dp/tw)√(fy/250)) = ${fmt(beta, 4)}. Rsb = βw bbf tw fy = ${kn(rsb)}.`,
			`αw = ${fmt(alphaW, 4)} and de = ${fmt(de, 3)} mm are defined on the following page. They are not substituted, because I.2 writes Rsb = βw bbf tw fy and does not place de inside that inequality.`,
			`Mw for I.2 is taken as fy Zwe. If the web element is slender in bending, Clause 5.2.5 does not give the gradient Ze, so this Mw is only the elastic value stated with Zwe.`,
			`Buckling sum = ${fmt(buckle, 4)}.`
		],
		note: "Informative only. A pass here is not an AS 4100 design capacity and is excluded from the governing utilisation."
	});
}
function evaluateAs4100(partial) {
	const input = {
		...designDefaults(),
		...partial
	};
	const rejected = invalidInput(input);
	if (rejected) return {
		meta: AS4100_META,
		checks: [blankCheck({
			id: "input",
			group: "INPUT",
			title: "Design input",
			clause: "1.1.2",
			equation: "finite positive geometry and material",
			status: "invalid",
			result: "INVALID INPUT",
			note: rejected
		})],
		diagram: {
			edges: input.edgesSupported,
			stress: input.stress ?? "not selected",
			clearMm: input.clearWidthMm,
			effectiveMm: null,
			thicknessMm: input.thicknessMm
		},
		limitations: [rejected, "No capacity was calculated from this input."],
		governing: "No utilisation — the input is invalid",
		governingUtil: null,
		overall: "not-complete",
		headline: "NOT A COMPLETE PASS — invalid input does not receive a design result"
	};
	const slend = slenderness(input);
	const checks = [
		...slend.checks,
		...axial(input, slend.be),
		webThickness(input)
	];
	const shear = shearCheck(input);
	checks.push(shear.check);
	checks.push(interaction(input, shear.check.designCapacity, shear.check.nominal));
	checks.push(...bearing(input));
	checks.push(...stiffeners(input, shear));
	checks.push(openings(input));
	checks.push(appendix(input, shear.check.nominal));
	checks.push(blankCheck({
		id: "member-nc",
		group: "OUTSIDE SCOPE",
		title: "Member buckling Nc",
		clause: "6.3",
		equation: "Nc = αc Ns",
		status: "out-of-scope",
		result: "OUTSIDE IMPLEMENTED SCOPE",
		kind: "information",
		normative: false,
		note: "A plate panel does not have member length, effective-length factor or section constant αb. Clause 6.3.3 is used only where 5.13.4 or 5.14.2 call it up for the web strip or stiffener."
	}));
	const ranked = checks.filter((row) => row.normative && row.kind === "strength" && (row.status === "pass" || row.status === "fail") && row.utilisation != null && Number.isFinite(row.utilisation));
	ranked.sort((a, b) => (b.utilisation ?? 0) - (a.utilisation ?? 0));
	const top = ranked[0] ?? null;
	const blocked = checks.filter(blocks);
	const service = checks.filter((row) => row.kind === "service" && row.status === "fail");
	const overall = blocked.length === 0 && checks.some((row) => row.normative && row.status === "pass") ? "pass" : "not-complete";
	const limitations = [
		"AS 4100 DESIGN SUBSET — VERIFIED WITH LIMITATIONS. This is not complete AS 4100 design verified.",
		"Elastic buckling stress, τcr and λFEM are not design resistances. IQ-PLB-E1.0 is unchanged by this adapter.",
		"φ is 0.90 from Table 3.4 for the clause named on each row. No γM, EN 1993-1-5 or AS 5224 factor is used.",
		"Outside this plate check: general member Nc (Clause 6.3 as a member capacity), lateral-torsional buckling Mb (Clause 5.6), Sections 8.3 and 8.4, RHS bearing αp and Clause 5.13.5, castellated or stiffened openings, hybrid stiffeners fys ≠ fy, and slender bending-gradient Ze where Clause 5.2.5 gives no expression.",
		"Ms, where required by Clause 5.12.3, is an external verified input. Its calculation is outside IQ-CAL-PLB.",
		"Appendix I is informative. It is excluded from the governing utilisation, including when it is left off.",
		"Table 5.11.5.2 is not stored. αv αd follows Clause 5.11.5.2. Two printed cells, (100, s/dp = 1.25) and (110, s/dp = 1.0), are transposed relative to that equation (0.989 and 0.998). The equation is used.",
		...service.map((row) => `SERVICE — ${row.title}: ${row.result}. ${row.note}`),
		...blocked.map((row) => `${row.group} — ${row.title}: ${row.status === "data-required" ? "VERIFIED STANDARD DATA REQUIRED" : row.result}. ${row.note}`)
	];
	const headline = overall === "pass" ? service.length ? "PASS FOR ALL APPLICABLE IMPLEMENTED CHECKS — SERVICE DEFORMATION WARNING — NOT COMPLETE AS 4100 DESIGN VERIFIED" : "PASS FOR ALL APPLICABLE IMPLEMENTED CHECKS — NOT COMPLETE AS 4100 DESIGN VERIFIED" : "NOT A COMPLETE PASS — omitted, failed or out-of-scope checks are listed and are not implied to have passed";
	return {
		meta: AS4100_META,
		checks,
		diagram: {
			edges: input.edgesSupported,
			stress: input.stress ?? "not selected",
			clearMm: input.clearWidthMm,
			effectiveMm: slend.be,
			thicknessMm: input.thicknessMm
		},
		limitations,
		governing: top ? `${top.title} (${top.clause})` : "No utilisation until an action and a design capacity both exist",
		governingUtil: top?.utilisation ?? null,
		overall,
		headline
	};
}
var EDITION = "2020 incorporating Amendment No. 1";
function summaryStatus(report) {
	if (report.overall === "pass") return "pass";
	if (report.checks.some((row) => row.normative && row.status === "fail")) return "fail";
	if (report.checks.some((row) => row.normative && row.status === "invalid")) return "invalid";
	return "not-checked";
}
/** AS 4100:2020 plate and web checks. Elastic panel sizes stay out of the equations. */
function as4100PlateChecks(input) {
	const report = evaluateAs4100(input.design ?? {});
	const rows = [
		elasticFence("AS 4100:2020"),
		{
			id: "dimension-fence",
			group: "LAYERS",
			title: "Panel dimensions are not code dimensions",
			standard: "AS 4100:2020",
			edition: EDITION,
			clause: "5.2.2",
			dataset: AS4100_META.dataset,
			status: "not-applicable",
			equation: "b is the clear width defined by the clause, not the FEM panel side",
			substitution: `Elastic panel a = ${input.aMm} mm, b = ${input.bMm} mm, t = ${input.tMm} mm, fy = ${input.fyMpa} MPa, stiffeners drawn = ${input.stiffenerCount}. None of these is copied into b, dp, tw or s.`,
			result: "NOT USED",
			note: "Assign a dimension on the design input before a clause will use it."
		},
		{
			id: "summary",
			group: "SUMMARY",
			title: "Governing design summary",
			standard: "AS 4100:2020",
			edition: EDITION,
			clause: "Table 3.4",
			dataset: AS4100_META.dataset,
			status: summaryStatus(report),
			equation: "Utilisation = design action / design capacity for the clause that defines the check",
			substitution: `Governing: ${report.governing}. Utilisation: ${report.governingUtil == null ? "—" : report.governingUtil.toFixed(3)}.`,
			result: report.headline,
			note: "A pass covers only the checks that ran. It is not a certified design. φ and γM are not mixed."
		}
	];
	for (const check of report.checks) rows.push({
		id: check.id,
		group: check.group,
		title: check.title,
		standard: "AS 4100:2020",
		edition: EDITION,
		clause: check.clause,
		dataset: AS4100_META.dataset,
		status: check.status,
		equation: check.equation,
		substitution: check.steps.length ? check.steps.join(" ") : check.note,
		result: check.result,
		note: [
			check.note,
			check.nominal != null ? `Nominal = ${check.nominal} ${check.nominalUnit}.` : "",
			check.phi != null ? `φ = ${check.phi}. ${check.phiSource}` : "",
			check.designCapacity != null ? `Design capacity = ${check.designCapacity} N.` : "",
			check.action != null ? `Action = ${check.action} N.` : "",
			check.utilisation != null && Number.isFinite(check.utilisation) ? `Utilisation = ${check.utilisation.toFixed(4)}.` : "",
			check.normative ? "" : "Not included in the governing utilisation."
		].filter(Boolean).join(" ")
	});
	return rows;
}
/** AS 5224 / ISO 20332 adapter. The workbench stays a general panel. No crane resistance is stored. */
function as5224PlateChecks() {
	const row = (id, title, clause) => ({
		id,
		group: "CRANE PLATED CHECKS",
		title,
		standard: "AS 5224 / ISO 20332",
		edition: "AS 5224 / ISO 20332",
		clause,
		dataset: "none — no resistance table",
		status: "data-required",
		equation: "Standard expression not transcribed",
		substitution: "No verified AS 5224 or ISO 20332 number is in the adapter.",
		result: "VERIFIED STANDARD DATA REQUIRED",
		note: "This does not turn the panel model into a crane girder. A girder preset is not connected."
	});
	return [
		elasticFence("AS 5224 / ISO 20332"),
		row("plate", "Plated element local buckling", "ISO 20332 plated members"),
		row("web", "Web panel", "ISO 20332 web"),
		row("stiffener", "Stiffener on a plated member", "ISO 20332 stiffener"),
		row("patch", "Local load introduction", "ISO 20332 local load")
	];
}
/** EN 1993-1-5 slots. No reduction factor, no table and no National Annex value is stored. */
function en1993PlateChecks(input) {
	const row = (id, group, title, clause, status, equation, note) => ({
		id,
		group,
		title,
		standard: "EN 1993-1-5",
		edition: "EN 1993-1-5",
		clause,
		dataset: "none — no National Annex and no reduction table",
		status,
		equation,
		substitution: "No verified EN 1993-1-5 number is in the adapter.",
		result: status === "not-applicable" ? "NOT APPLICABLE" : "VERIFIED STANDARD DATA REQUIRED",
		note
	});
	return [
		elasticFence("EN 1993-1-5"),
		row("plate-buckling", "PLATE BUCKLING", "Internal compression element", "4.4 / 4.5", "data-required", "ρ from the plate slenderness curve", "Not transcribed. AS 4100 factors are not used here."),
		row("effective-width", "EFFECTIVE WIDTH", "Effective area of a Class 4 plate", "4.4", "data-required", "beff = ρ b", "Not transcribed."),
		row("shear", "SHEAR BUCKLING", "Shear resistance", "5", "data-required", "η and χw", "Not transcribed. Elastic τcr is not this resistance."),
		row("longitudinal", "LONGITUDINALLY STIFFENED PANEL", "Reduced stress or effective section", "4.5", input.stiffenerCount > 0 ? "data-required" : "not-applicable", "Column-like and plate-like behaviour", input.stiffenerCount > 0 ? "Stiffeners exist in the model. The clause is not transcribed." : "No longitudinal stiffener in the model."),
		row("transverse", "TRANSVERSE STIFFENER", "Stiffness and strength", "9", input.stiffenerCount > 0 ? "data-required" : "not-applicable", "Minimum second moment and force resistance", "Not transcribed."),
		row("patch", "PATCH LOADING", "Local transverse force", "6", input.hasPatch ? "data-required" : "not-applicable", "χF Fcr", input.hasPatch ? "The drawn patch is an elastic load, not this check." : "No patch load in the model."),
		row("interaction", "INTERACTION", "Combined direct, shear and transverse force", "7", "data-required", "Interaction expressions of Section 7", "Not transcribed. No AS 4100 interaction is substituted.")
	];
}
function designChecks(method, input) {
	if (method === "as4100") return as4100PlateChecks(input);
	if (method === "en1993") return en1993PlateChecks({
		stiffenerCount: input.stiffenerCount,
		hasPatch: input.hasPatch
	});
	if (method === "as5224") return as5224PlateChecks();
	return [elasticFence("NONE")];
}
function staleAssignments(links, panel) {
	return links.filter((link) => {
		const now = panel[link.source];
		return now == null || !Number.isFinite(now) || Math.abs(now - link.captured) > 1e-6;
	});
}
function withoutStale(design, stale) {
	const next = { ...design };
	for (const link of stale) delete next[link.field];
	return next;
}
var STATUS$1 = {
	pass: "PASS",
	fail: "FAIL",
	"not-applicable": "NOT APPLICABLE",
	"not-checked": "NOT RUN",
	"out-of-scope": "OUTSIDE THIS PLATE CHECK",
	"data-required": "INPUT REQUIRED",
	invalid: "INVALID INPUT"
};
var FIELD_NAME = {
	clearWidthMm: "Clear width b",
	thicknessMm: "Plate thickness t",
	fyMpa: "Yield stress fy",
	fuMpa: "Tensile strength fu",
	dpMm: "Web depth dp",
	twMm: "Web thickness tw",
	d1Mm: "Clear web depth d1"
};
var SOURCE_NAME = {
	aMm: "panel length a",
	bMm: "panel width b",
	tMm: "panel thickness t",
	fyMpa: "panel fy",
	fuMpa: "panel fu"
};
var TOKEN = {
	thicknessMm: "plate thickness t",
	clearWidthMm: "clear width b",
	fyMpa: "yield stress fy",
	fuMpa: "tensile strength fu",
	dpMm: "web depth dp",
	twMm: "web thickness tw",
	d1Mm: "clear web depth d1",
	d2Mm: "web depth d2",
	sMm: "transverse stiffener spacing s",
	vStarN: "design shear force V*",
	rStarN: "design bearing force R*",
	nStarN: "design axial force N*",
	kb: "plate buckling coefficient kb",
	kt: "tension correction kt",
	anMm2: "net area An",
	eccMm: "eccentricity e",
	modulusMpa: "modulus E",
	weldKnPerMm: "stiffener weld"
};
function humanize(text) {
	let next = text;
	for (const [token, label] of Object.entries(TOKEN)) {
		next = next.replaceAll(`${token} is zero.`, `${label.charAt(0).toUpperCase()}${label.slice(1)} must be greater than zero.`);
		next = next.replaceAll(`${token} is negative.`, `${label.charAt(0).toUpperCase()}${label.slice(1)} cannot be negative.`);
		next = next.replaceAll(`${token} is not a finite number.`, `${label.charAt(0).toUpperCase()}${label.slice(1)} is not a number.`);
	}
	return next;
}
function forceText(n) {
	if (n == null || !Number.isFinite(n)) return "Not entered";
	const kn = n / 1e3;
	const digits = Math.abs(kn) >= 100 ? 1 : Math.abs(kn) >= 10 ? 2 : 3;
	return `${kn.toFixed(digits)} kN`;
}
function momentText(nmm) {
	if (nmm == null || !Number.isFinite(nmm)) return "Not entered";
	return `${(nmm / 1e6).toFixed(3)} kN·m`;
}
function num$1(form, key) {
	const raw = form[key];
	if (raw == null || raw.trim() === "") return null;
	const value = Number(raw);
	return Number.isFinite(value) ? value : null;
}
function one(form, key, allowed) {
	const value = form[key];
	return allowed.includes(value) ? value : null;
}
function toDesign(form) {
	const out = {};
	const put = (key, value) => {
		if (value != null) out[key] = value;
	};
	put("role", one(form, "role", ["element", "web"]));
	put("residual", one(form, "residual", [
		"SR",
		"HR",
		"LW",
		"CF",
		"HW"
	]));
	put("edgesSupported", one(form, "edgesSupported", ["one", "both"]));
	put("stress", one(form, "stress", [
		"uniform-compression",
		"edge-gradient",
		"outstand-gradient"
	]));
	put("widthPath", form.widthPath === "alternative" ? "alternative" : null);
	put("holes", one(form, "holes", ["none", "net"]));
	put("axial", one(form, "axial", [
		"none",
		"compression",
		"tension"
	]));
	put("shearMode", one(form, "shearMode", ["uniform", "non-uniform"]));
	put("webGross", form.webGross === "yes" ? "gross" : null);
	put("stiffening", one(form, "stiffening", [
		"unstiffened",
		"transverse",
		"longitudinal"
	]));
	put("alphaF", one(form, "alphaF", ["one", "flange"]));
	put("interaction", one(form, "interaction", [
		"none",
		"proportioning",
		"section"
	]));
	put("bearing", one(form, "bearing", [
		"none",
		"ic",
		"rhs"
	]));
	put("bearingPlace", one(form, "bearingPlace", ["interior", "end"]));
	put("stiffener", one(form, "stiffener", [
		"none",
		"intermediate",
		"load-bearing",
		"longitudinal"
	]));
	put("arrangement", one(form, "arrangement", [
		"pair",
		"single-plate",
		"single-angle"
	]));
	put("stiffenerLe", one(form, "stiffenerLe", ["0.7d1", "d1"]));
	put("longWhere", one(form, "longWhere", [
		"none",
		"compression",
		"neutral",
		"both"
	]));
	put("openings", one(form, "openings", ["none", "open"]));
	put("webBound", one(form, "webBound", ["both-flanges", "one-free"]));
	if (form.flangesRestrained === "yes") out.flangesRestrained = true;
	if (form.flangesRestrained === "no") out.flangesRestrained = false;
	if (form.endPanel === "yes") out.endPanel = true;
	if (form.deriveWidth === "yes") out.deriveWidth = true;
	if (form.outerStiffened === "yes") out.outerStiffened = true;
	if (form.soleTorsion === "yes") out.soleTorsion = true;
	if (form.plasticWeb === "yes") out.plasticWeb = true;
	if (form.openingStiffened === "yes") out.openingStiffened = true;
	if (form.appendixI === "yes") out.appendixI = true;
	for (const [formKey, field] of [
		["clearWidthMm", "clearWidthMm"],
		["thicknessMm", "thicknessMm"],
		["fyMpa", "fyMpa"],
		["fuMpa", "fuMpa"],
		["kb", "kb"],
		["anMm2", "anMm2"],
		["nStarN", "nStarN"],
		["kt", "kt"],
		["vStarN", "vStarN"],
		["mStarNmm", "mStarNmm"],
		["msNmm", "msNmm"],
		["rStarN", "rStarN"],
		["fvmMpa", "fvmMpa"],
		["fvaMpa", "fvaMpa"],
		["dpMm", "dpMm"],
		["twMm", "twMm"],
		["d1Mm", "d1Mm"],
		["sMm", "sMm"],
		["bfoMm", "bfoMm"],
		["tfMm", "tfMm"],
		["afgMm2", "afgMm2"],
		["afnMm2", "afnMm2"],
		["afeMm2", "afeMm2"],
		["dfMm", "dfMm"],
		["flangeFyMpa", "flangeFyMpa"],
		["flangeFuMpa", "flangeFuMpa"],
		["bbfMm", "bbfMm"],
		["bbMm", "bbMm"],
		["bsMm", "bsMm"],
		["bearingTfMm", "bearingTfMm"],
		["asMm2", "asMm2"],
		["fysMpa", "fysMpa"],
		["tsMm", "tsMm"],
		["besMm", "besMm"],
		["isMm4", "isMm4"],
		["torsionDepthMm", "torsionDepthMm"],
		["torsionTfMm", "torsionTfMm"],
		["fMemberN", "fMemberN"],
		["d2Mm", "d2Mm"],
		["asLongMm2", "asLongMm2"],
		["isLongMm4", "isLongMm4"],
		["lwMm", "lwMm"],
		["nwN", "nwN"],
		["mwNmm", "mwNmm"],
		["rwN", "rwN"],
		["vwN", "vwN"],
		["modulusMpa", "modulusMpa"],
		["fnN", "fnN"],
		["fpN", "fpN"],
		["mpNmm", "mpNmm"],
		["eccMm", "eccMm"],
		["endGapMm", "endGapMm"],
		["aepMm2", "aepMm2"],
		["weldKnPerMm", "weldKnPerMm"]
	]) {
		const value = num$1(form, formKey);
		if (value != null) out[field] = value;
	}
	return out;
}
function Info({ title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "infoTip",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
			"aria-label": title,
			children: "ⓘ"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [title, "."] }),
			" ",
			text
		] })]
	});
}
function Pick({ label, value, options, onChange, info }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "field",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [label, info ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
			title: info.title,
			text: info.text
		}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			className: "toolSelect",
			value,
			onChange: (event) => onChange(event.target.value),
			children: options.map(([id, text]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: id,
				children: text
			}, id || "unset"))
		})]
	});
}
function NumField({ label, value, onChange, hint, info, unit, onFocus }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "field",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				label,
				unit ? `, ${unit}` : "",
				info ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					title: info.title,
					text: info.text
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "toolField",
				inputMode: "decimal",
				value,
				onChange: (event) => onChange(event.target.value),
				onFocus
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: hint }) : null
		]
	});
}
function stressWords(stress) {
	if (stress === "uniform-compression") return "uniform compression";
	if (stress === "edge-gradient") return "compression at one edge, tension at the other";
	if (stress === "outstand-gradient") return "maximum compression at the free edge";
	return stress === "not selected" ? "stress not selected" : stress;
}
function ElementFigure({ diagram }) {
	const both = diagram.edges === "both";
	const ratio = diagram.clearMm && diagram.effectiveMm != null && diagram.clearMm > 0 ? Math.min(1, Math.max(0, diagram.effectiveMm / diagram.clearMm)) : 1;
	const full = diagram.effectiveMm != null && diagram.clearMm != null && Math.abs(diagram.effectiveMm - diagram.clearMm) <= .05;
	const inset = (1 - ratio) / 2 * 200;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 280 180",
		role: "img",
		"aria-label": "Plate element used for AS 4100",
		className: "convPlot",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "16",
				y: "16",
				fontSize: "11",
				fill: "#111",
				children: both ? "Both longitudinal edges supported" : diagram.edges === "one" ? "Outstand — one edge supported" : "Edges not selected"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "40",
				y: "28",
				width: "200",
				height: "88",
				fill: "#fff",
				stroke: "#111"
			}),
			ratio < .999 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 40 + inset,
				y: "28",
				width: 200 - 2 * inset,
				height: "88",
				fill: "#e4e4de",
				stroke: "#111"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "40",
				y1: "116",
				x2: "240",
				y2: "116",
				stroke: "#111",
				strokeWidth: "5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "40",
				y1: "28",
				x2: "240",
				y2: "28",
				stroke: "#111",
				strokeWidth: both ? 5 : 1.2,
				strokeDasharray: both ? void 0 : "5 4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: "40",
				y: "140",
				fontSize: "11",
				fill: "#111",
				children: ["Gross width b = ", diagram.clearMm == null ? "not assigned" : `${diagram.clearMm} mm`]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "40",
				y: "156",
				fontSize: "11",
				fill: "#111",
				children: diagram.effectiveMm == null ? "Effective width be not calculated" : full ? `Full width effective. be = b = ${diagram.effectiveMm.toFixed(1)} mm` : `Effective width be = ${diagram.effectiveMm.toFixed(1)} mm. Shaded band is be. White strips are ineffective.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "140",
				y: "76",
				fontSize: "11",
				textAnchor: "middle",
				fill: "#111",
				children: stressWords(diagram.stress)
			})
		]
	});
}
function WebFigure({ active, dp, d1, tw, s, showS }) {
	const mark = (name) => active === name ? 2.4 : 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 320 170",
		role: "img",
		"aria-label": "Web dimensions",
		className: "convPlot",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "12",
				y: "16",
				fontSize: "11",
				fill: "#111",
				children: "Web elevation"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "70",
				y: "28",
				width: "140",
				height: "10",
				fill: "#111"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "132",
				y: "38",
				width: "16",
				height: "90",
				fill: "#fff",
				stroke: "#111",
				strokeWidth: mark("tw")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "70",
				y: "128",
				width: "140",
				height: "10",
				fill: "#111"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "168",
				y1: "38",
				x2: "168",
				y2: "128",
				stroke: "#111",
				strokeWidth: mark("d1")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: "174",
				y: "88",
				fontSize: "11",
				fill: "#111",
				children: ["d1 ", d1 || "—"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "118",
				y1: "28",
				x2: "118",
				y2: "138",
				stroke: "#111",
				strokeWidth: mark("dp")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: "78",
				y: "88",
				fontSize: "11",
				fill: "#111",
				children: ["dp ", dp || "—"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: "112",
				y: "86",
				fontSize: "11",
				fill: "#111",
				children: ["tw ", tw || "—"]
			}),
			showS ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
				x: "12",
				y: "160",
				fontSize: "11",
				fill: "#111",
				fontWeight: active === "s" ? 700 : 400,
				children: [
					"s = ",
					s || "not entered",
					" mm, transverse stiffener spacing"
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "12",
				y: "160",
				fontSize: "11",
				fill: "#111",
				children: "s is hidden until the web is stiffened"
			})
		]
	});
}
function BearingFigure({ active, place }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 320 150",
		role: "img",
		"aria-label": "Bearing lengths",
		className: "convPlot",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "12",
				y: "16",
				fontSize: "11",
				fill: "#111",
				children: place === "end" ? "End bearing" : place === "interior" ? "Interior bearing" : "Bearing lengths"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "40",
				y: "36",
				width: "200",
				height: "8",
				fill: "#111"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "132",
				y: "44",
				width: "16",
				height: "70",
				fill: "#fff",
				stroke: "#111"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "100",
				y1: "28",
				x2: "172",
				y2: "28",
				stroke: "#111",
				strokeWidth: active === "bbf" ? 2.4 : 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "108",
				y: "24",
				fontSize: "11",
				fill: "#111",
				children: "bbf"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "70",
				y1: "128",
				x2: "210",
				y2: "128",
				stroke: "#111",
				strokeWidth: active === "bb" ? 2.4 : 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "124",
				y: "142",
				fontSize: "11",
				fill: "#111",
				children: "bb"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "230",
				y: "52",
				fontSize: "11",
				fill: "#111",
				children: "tf"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "230",
				y: "90",
				fontSize: "11",
				fill: "#111",
				children: "bs under the load"
			})
		]
	});
}
function OpeningFigure() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 280 140",
		role: "img",
		"aria-label": "Opening dimension lw",
		className: "convPlot",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "12",
				y: "16",
				fontSize: "11",
				fill: "#111",
				children: "One unstiffened opening"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "80",
				y: "28",
				width: "16",
				height: "90",
				fill: "#fff",
				stroke: "#111"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "84",
				y: "58",
				width: "8",
				height: "28",
				fill: "#fff",
				stroke: "#111"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "110",
				y: "78",
				fontSize: "11",
				fill: "#111",
				children: "lw, greatest opening dimension"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "110",
				y: "96",
				fontSize: "11",
				fill: "#111",
				children: "compared with d1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "12",
				y: "132",
				fontSize: "11",
				fill: "#111",
				children: "Castellated and stiffened openings are not checked."
			})
		]
	});
}
function StiffenerFigure({ active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 280 120",
		role: "img",
		"aria-label": "Stiffener outstand and eccentricity",
		className: "convPlot",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "40",
				y1: "20",
				x2: "40",
				y2: "100",
				stroke: "#111",
				strokeWidth: "4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "40",
				y: "48",
				width: "70",
				height: "8",
				fill: "#fff",
				stroke: "#111",
				strokeWidth: active === "bes" ? 2.4 : 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "120",
				y: "56",
				fontSize: "11",
				fill: "#111",
				children: "bes, outstand from the web face"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "120",
				y: "78",
				fontSize: "11",
				fill: "#111",
				children: "e is the eccentricity of the force, not modulus E"
			})
		]
	});
}
function showResult(row) {
	if (row.status === "data-required" || row.status === "invalid") return humanize(row.note);
	return humanize(row.result);
}
function groups(checks) {
	return {
		applicable: checks.filter((row) => (row.status === "pass" || row.status === "fail") && row.kind !== "information"),
		incomplete: checks.filter((row) => row.normative && (row.status === "data-required" || row.status === "invalid" || row.status === "not-checked")),
		outside: checks.filter((row) => row.status === "out-of-scope"),
		notRun: checks.filter((row) => !row.normative && row.status === "not-checked"),
		na: checks.filter((row) => row.status === "not-applicable")
	};
}
function Governing({ report }) {
	const bundled = groups(report.checks);
	const invalid = report.checks.find((row) => row.status === "invalid");
	const ranked = report.checks.filter((row) => row.normative && row.kind === "strength" && (row.status === "pass" || row.status === "fail") && row.utilisation != null && Number.isFinite(row.utilisation));
	ranked.sort((a, b) => (b.utilisation ?? 0) - (a.utilisation ?? 0));
	const top = ranked[0] ?? null;
	const slend = report.checks.find((row) => row.id === "slenderness" && row.status === "pass");
	const actionLabel = top?.id === "shear" || top?.id === "interaction" ? "Design shear force, V*" : top?.id === "bearing" ? "Design bearing force, R*" : top?.id === "axial" ? "Design axial force, N*" : "Design action";
	const resistanceLabel = top?.id === "shear" ? "Design shear resistance, φVv" : top?.id === "bearing" ? "Design bearing resistance, φRb" : top?.id === "axial" ? "Design section resistance, φN" : "Design resistance";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "govBlock",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "AS 4100 plate / panel check" }),
			invalid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Invalid input." }),
				" ",
				humanize(invalid.note)
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No design resistance was calculated." })] }) : null,
			!invalid && bundled.incomplete.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Design incomplete." }), " Required before a utilisation can be given:"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: bundled.incomplete.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: row.status === "not-checked" && row.designCapacity != null ? `${row.title}. Capacity is available. Enter the design action to evaluate utilisation.` : `${row.title}. ${humanize(row.note)}` }, row.id)) })] }) : null,
			top ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "govGrid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Governing check" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: top.title })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Clause" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: top.clause })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: actionLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: forceText(top.action) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: resistanceLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: forceText(top.designCapacity) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Utilisation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: top.utilisation?.toFixed(3) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: STATUS$1[top.status] })] })
				]
			}) : null,
			!top && slend ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "govGrid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Plate classification" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: slend.result.split(";")[0] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Slenderness, λe" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: slend.result.includes("λe") ? slend.result.split("λe")[1]?.replace("=", "").trim() : "—" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Effective width, be" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: report.diagram.effectiveMm == null ? "Not calculated" : `${report.diagram.effectiveMm.toFixed(1)} mm` })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Design action" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Not entered" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Utilisation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Not evaluated" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: bundled.incomplete.length ? "INCOMPLETE" : "CLASSIFIED" })] })
				]
			}) : null,
			!top && !slend && !invalid && !bundled.incomplete.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Choose a plate element or a web to start." }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "toolNote",
				children: report.headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "toolNote",
				children: [
					"Elastic σcr is not this resistance. ",
					report.meta.freeze,
					"."
				]
			})
		]
	});
}
function ResultGroups({ report }) {
	const bundled = groups(report.checks);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		bundled.applicable.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "toolTableWrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "toolNote",
				children: "Applicable checks"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Check" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Clause" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Result" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Utilisation" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: bundled.applicable.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.title }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.clause }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: STATUS$1[row.status] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: showResult(row) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.utilisation == null || !Number.isFinite(row.utilisation) ? "—" : row.utilisation.toFixed(3) })
				] }, row.id)) })]
			})]
		}) : null,
		bundled.outside.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [
				"Outside this plate check: ",
				bundled.outside.map((row) => `${row.title} (${row.clause})`).join("; "),
				"."
			]
		}) : null,
		bundled.notRun.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [
				"Not run: ",
				bundled.notRun.map((row) => row.title).join(", "),
				". These do not govern."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
			className: "quietHelp",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: ["Checks not applicable to this configuration: ", bundled.na.length] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: bundled.na.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
				row.title,
				". ",
				row.note
			] }, row.id)) })]
		})
	] });
}
function TraceList({ report }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: report.checks.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "traceBlock",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: row.title }),
				" — AS 4100:2020 Clause ",
				row.clause
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Formula. ", row.equation] }),
			row.steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Substitution. ", humanize(step)] }, index)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Result. ", showResult(row)] }),
			row.nominal != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Nominal resistance. ",
				row.nominal,
				" ",
				row.nominalUnit
			] }) : null,
			row.phi != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Capacity factor. φ = ",
				row.phi,
				". ",
				row.phiSource
			] }) : null,
			row.designCapacity != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Design resistance. ",
				row.designCapacity,
				" N (",
				forceText(row.designCapacity),
				")"
			] }) : null,
			row.action != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Design action. ",
				row.action,
				" N (",
				row.nominalUnit === "N·mm" ? momentText(row.action) : forceText(row.action),
				")"
			] }) : null,
			row.utilisation != null && Number.isFinite(row.utilisation) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Utilisation. ", row.utilisation.toFixed(3)] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Status. ",
				STATUS$1[row.status],
				". ",
				humanize(row.note)
			] })
		]
	}, row.id)) });
}
function PlateDesign({ panel, elastic, onDesign, onStatus }) {
	const [form, setForm] = (0, import_react.useState)({});
	const [links, setLinks] = (0, import_react.useState)([]);
	const [pane, setPane] = (0, import_react.useState)("check");
	const [active, setActive] = (0, import_react.useState)(null);
	const panelKey = [
		panel.aMm,
		panel.bMm,
		panel.tMm,
		panel.fyMpa,
		panel.fuMpa
	].join("|");
	const stale = (0, import_react.useMemo)(() => staleAssignments(links, panel), [links, panelKey]);
	const design = (0, import_react.useMemo)(() => withoutStale(toDesign(form), stale), [form, stale]);
	const report = (0, import_react.useMemo)(() => evaluateAs4100(design), [design]);
	const sent = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		const key = JSON.stringify(design);
		if (sent.current === key) return;
		sent.current = key;
		onDesign(design);
	}, [design, onDesign]);
	(0, import_react.useEffect)(() => {
		if (!onStatus) return;
		if (!design.role) onStatus("AS 4100 plate check not started. Elastic σcr is not a design resistance.");
		else if (report.checks.some((row) => row.status === "invalid")) onStatus("AS 4100 input is invalid. No design resistance was calculated.");
		else if (report.overall === "pass") onStatus(report.headline);
		else onStatus("AS 4100 design is incomplete. Elastic σcr is not a design resistance.");
	}, [
		design.role,
		onStatus,
		report
	]);
	function set(key, value) {
		setForm((current) => ({
			...current,
			[key]: value
		}));
		setLinks((current) => current.filter((link) => link.field !== key));
	}
	function assignFrom(field, source) {
		const value = panel[source];
		if (value == null || !Number.isFinite(value)) return;
		setForm((current) => ({
			...current,
			[field]: String(value)
		}));
		setLinks((current) => [...current.filter((link) => link.field !== field), {
			field,
			source,
			captured: value
		}]);
	}
	function unlink(field) {
		setLinks((current) => current.filter((link) => link.field !== field));
	}
	function chooseRole(role) {
		setForm((current) => {
			const next = {
				...current,
				role
			};
			if (role === "web") {
				if (!next.bearing) next.bearing = "none";
				if (!next.stiffener) next.stiffener = "none";
				if (!next.openings) next.openings = "none";
				if (!next.interaction) next.interaction = "none";
				if (!next.axial) next.axial = "none";
			}
			return next;
		});
		setPane("check");
	}
	function loadWorked(id) {
		setLinks([]);
		setPane("check");
		if (id === "plate") {
			setForm({
				role: "element",
				residual: "HR",
				edgesSupported: "both",
				stress: "uniform-compression",
				clearWidthMm: "300",
				thicknessMm: "10",
				fyMpa: "350",
				holes: "none",
				axial: "none"
			});
			return;
		}
		if (id === "slender") {
			setForm({
				role: "element",
				residual: "HW",
				edgesSupported: "both",
				stress: "uniform-compression",
				clearWidthMm: "500",
				thicknessMm: "8",
				fyMpa: "350",
				holes: "none",
				axial: "compression"
			});
			return;
		}
		setForm({
			role: "web",
			fyMpa: "300",
			dpMm: "800",
			twMm: "8",
			d1Mm: "800",
			webGross: "yes",
			webBound: "both-flanges",
			stiffening: "unstiffened",
			shearMode: "uniform",
			vStarN: "400000",
			axial: "none",
			bearing: "none",
			stiffener: "none",
			interaction: "none",
			openings: "none"
		});
	}
	const text = (key) => form[key] ?? "";
	const role = text("role");
	const plate = role === "element";
	const web = role === "web";
	const axial = text("axial");
	const stiffening = text("stiffening");
	const needsS = stiffening === "transverse" || stiffening === "longitudinal";
	const bearingOn = text("bearing") === "ic" || text("bearing") === "rhs";
	const stiffenerOn = text("stiffener") === "intermediate" || text("stiffener") === "load-bearing" || text("stiffener") === "longitudinal";
	const openingOn = text("openings") === "open";
	const interactionOn = text("interaction") === "proportioning" || text("interaction") === "section";
	const linkFor = (field) => links.find((link) => link.field === field && !stale.some((item) => item.field === field));
	function linkedNumber(field, source, info, unit = "mm") {
		const link = linkFor(field);
		const panelValue = panel[source];
		const sourceName = SOURCE_NAME[source];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "field",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					FIELD_NAME[field],
					", ",
					unit === "MPa" ? "MPa" : unit,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
						title: info.title,
						text: info.text
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sourceChoice",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "radio",
						name: field,
						checked: !!link,
						disabled: panelValue == null,
						onChange: () => assignFrom(field, source)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Link to ",
						sourceName,
						panelValue == null ? " — not on the plate model" : ` = ${panelValue} ${unit}`
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "radio",
						name: field,
						checked: !link,
						onChange: () => unlink(field)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Enter manually" })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "toolField",
					inputMode: "decimal",
					value: text(field),
					onFocus: () => setActive(field),
					onChange: (event) => set(field, event.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: link ? `Current: linked to ${sourceName}.` : "Current: entered manually. The plate model is not copied unless you link it." })
			]
		}, field);
	}
	const staleText = stale.map((link) => {
		const now = panel[link.source];
		return `${FIELD_NAME[link.field]} was linked to ${SOURCE_NAME[link.source]} = ${link.captured}. ${SOURCE_NAME[link.source].charAt(0).toUpperCase()}${SOURCE_NAME[link.source].slice(1)} is now ${now ?? "blank"}, so the link was removed. Assign it again or enter the value manually.`;
	}).join(" ");
	const addChecks = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "toolNote",
		children: "Add a check only when that condition exists. Leaving it off tells AS 4100 the action is not present. It is not a hidden pass."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "toolToolbar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => set("bearing", bearingOn ? "none" : "ic"),
				children: bearingOn ? "LOCAL LOAD ON" : "ADD LOCAL LOAD"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => set("openings", openingOn ? "none" : "open"),
				children: openingOn ? "OPENING ON" : "ADD OPENING"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => set("stiffener", stiffenerOn ? "none" : "intermediate"),
				children: stiffenerOn ? "STIFFENER DESIGN ON" : "ADD STIFFENER DESIGN"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => set("interaction", interactionOn ? "none" : "section"),
				children: interactionOn ? "BENDING INTERACTION ON" : "ADD BENDING AND SHEAR"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => set("appendixI", text("appendixI") === "yes" ? "" : "yes"),
				children: text("appendixI") === "yes" ? "APPENDIX I ON" : "ADD APPENDIX I"
			})
		]
	})] });
	const plateFields = plate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fieldGrid compact",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
				label: "Residual stress",
				value: text("residual"),
				onChange: (value) => set("residual", value),
				info: {
					title: "Residual stress",
					text: "Table 5.2 fabrication class. HW is heavily welded longitudinally. LW is lightly welded longitudinally. It is not the edge restraint. Source: manual."
				},
				options: [
					["", "Required"],
					["SR", "SR — stress relieved"],
					["HR", "HR — hot-rolled"],
					["LW", "LW — lightly welded"],
					["CF", "CF — cold-formed"],
					["HW", "HW — heavily welded"]
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
				label: "Longitudinal edges",
				value: text("edgesSupported"),
				onChange: (value) => set("edgesSupported", value),
				options: [
					["", "Required"],
					["both", "Both supported"],
					["one", "One supported — outstand"]
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
				label: "Stress",
				value: text("stress"),
				onChange: (value) => set("stress", value),
				options: [
					["", "Required"],
					["uniform-compression", "Uniform compression"],
					["edge-gradient", "Compression at one edge, tension at the other"],
					["outstand-gradient", "Maximum compression at the free edge"]
				]
			}),
			linkedNumber("clearWidthMm", "bMm", {
				title: "Clear width, b",
				text: "Clear width between the faces of supporting plates, or the clear outstand. Not the panel length or width until you link it. AS 4100 Clause 5.2.2. Source: model link or manual."
			}),
			linkedNumber("thicknessMm", "tMm", {
				title: "Plate thickness, t",
				text: "Thickness of this flat element. Source: model link or manual."
			}),
			linkedNumber("fyMpa", "fyMpa", {
				title: "Yield stress, fy",
				text: "Design yield stress in MPa. Above 690 MPa is outside AS 4100. Source: model link or manual."
			}, "MPa"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
				label: "Holes",
				value: text("holes"),
				onChange: (value) => set("holes", value),
				options: [
					["", "Not stated"],
					["none", "No holes"],
					["net", "Net area entered"]
				]
			}),
			text("holes") === "net" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
				label: "Net area, An",
				unit: "mm²",
				value: text("anMm2"),
				onChange: (value) => set("anMm2", value),
				info: {
					title: "Net area, An",
					text: "Area across the holes. If An is larger than the gross area the check stops. AS 4100 Clause 6.2.1. Source: manual."
				}
			}) : null,
			text("holes") === "net" || axial === "tension" ? linkedNumber("fuMpa", "fuMpa", {
				title: "Tensile strength, fu",
				text: "Used for fracture and for the hole-reduction test. Source: model link or manual."
			}, "MPa") : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
				label: "Design axial force",
				value: text("axial"),
				onChange: (value) => set("axial", value),
				options: [
					["", "Required — none, compression or tension"],
					["none", "No axial force"],
					["compression", "Compression"],
					["tension", "Tension"]
				]
			}),
			axial === "compression" || axial === "tension" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
				label: "Design axial force, N*",
				unit: "N",
				value: text("nStarN"),
				onChange: (value) => set("nStarN", value),
				hint: "Compression positive. Enter tension as a negative number."
			}) : null,
			axial === "tension" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
				label: "Tension correction, kt",
				value: text("kt"),
				onChange: (value) => set("kt", value),
				info: {
					title: "kt",
					text: "Connection correction in Clause 7.3. It is not assumed to be 1. Source: manual."
				}
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
				label: "Effective width method",
				value: text("widthPath"),
				onChange: (value) => set("widthPath", value),
				options: [["", "Primary — be = b (λey/λe)"], ["alternative", "Alternative — kb entered"]]
			}),
			text("widthPath") === "alternative" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
				label: "Plate buckling coefficient, kb",
				value: text("kb"),
				onChange: (value) => set("kb", value),
				info: {
					title: "kb",
					text: "kb is the plate buckling coefficient for the alternative width in Clause 6.2.4. kb is not σcr and is not the FEM eigenvalue λ. Source: manual."
				},
				hint: "kb is not σcr and is not the FEM eigenvalue λ."
			}) : null
		]
	}) : null;
	const webFields = web ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebFigure, {
			active,
			dp: text("dpMm"),
			d1: text("d1Mm"),
			tw: text("twMm"),
			s: text("sMm"),
			showS: needsS
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fieldGrid compact",
			children: [
				linkedNumber("dpMm", "bMm", {
					title: "Web depth for shear, dp",
					text: "Depth used in the shear slenderness. Clause 5.11. Not the panel width until you link it. Source: model link or manual."
				}),
				linkedNumber("twMm", "tMm", {
					title: "Web thickness, tw",
					text: "Web thickness. Source: model link or manual."
				}),
				linkedNumber("d1Mm", "bMm", {
					title: "Clear web depth, d1",
					text: "Clear depth between flanges, fillets ignored. Clauses 5.10 and 5.15. Source: model link or manual."
				}),
				linkedNumber("fyMpa", "fyMpa", {
					title: "Yield stress, fy",
					text: "Design yield stress of the web, MPa. Source: model link or manual."
				}, "MPa"),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Gross web area, Aw",
					value: text("webGross"),
					onChange: (value) => set("webGross", value),
					options: [["", "Required"], ["yes", "Gross web — no holes"]]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Web edges",
					value: text("webBound"),
					onChange: (value) => set("webBound", value),
					options: [
						["", "Required"],
						["both-flanges", "Flanges both sides"],
						["one-free", "One edge free"]
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Stiffening",
					value: text("stiffening"),
					onChange: (value) => set("stiffening", value),
					options: [
						["", "Required"],
						["unstiffened", "Unstiffened"],
						["transverse", "Transverse stiffeners"],
						["longitudinal", "Longitudinal stiffener"]
					]
				}),
				needsS ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Transverse stiffener spacing, s",
					unit: "mm",
					value: text("sMm"),
					onChange: (value) => set("sMm", value),
					onFocus: () => setActive("s"),
					info: {
						title: "Spacing, s",
						text: "Centre-to-centre spacing of transverse stiffeners. Not read from the FEM lines. Source: manual."
					}
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Shear distribution",
					value: text("shearMode"),
					onChange: (value) => set("shearMode", value),
					options: [
						["", "Required"],
						["uniform", "Approximately uniform"],
						["non-uniform", "Non-uniform"]
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Design shear force, V*",
					unit: "N",
					value: text("vStarN"),
					onChange: (value) => set("vStarN", value),
					hint: text("vStarN") ? `Shown as ${forceText(num$1(form, "vStarN"))}.` : "Enter V* to evaluate utilisation."
				}),
				text("shearMode") === "non-uniform" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Maximum web shear stress, f*vm",
					unit: "MPa",
					value: text("fvmMpa"),
					onChange: (value) => set("fvmMpa", value),
					info: {
						title: "f*vm",
						text: "Maximum shear stress for non-uniform shear. Clause 5.11.3. Leave unused when shear is uniform. Source: manual."
					}
				}) : null,
				text("shearMode") === "non-uniform" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Average web shear stress, f*va",
					unit: "MPa",
					value: text("fvaMpa"),
					onChange: (value) => set("fvaMpa", value),
					info: {
						title: "f*va",
						text: "Average shear stress for non-uniform shear. Clause 5.11.3. Source: manual."
					}
				}) : null,
				needsS ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "End panel",
					value: text("endPanel"),
					onChange: (value) => set("endPanel", value),
					options: [["", "No — interior panel"], ["yes", "Yes — αd = 1"]]
				}) : null,
				needsS && stiffening !== "longitudinal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Flange restraint, αf",
					value: text("alphaF"),
					onChange: (value) => set("alphaF", value),
					info: {
						title: "αf",
						text: "1.0, or the flange formula when there is no longitudinal stiffener. Clause 5.11.5.2. Source: manual."
					},
					options: [
						["", "Not selected"],
						["one", "αf = 1.0"],
						["flange", "From the flange"]
					]
				}) : null,
				text("alphaF") === "flange" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Flange width used for αf, bfo",
					unit: "mm",
					value: text("bfoMm"),
					onChange: (value) => set("bfoMm", value),
					info: {
						title: "bfo",
						text: "Already the least of the three lengths in Clause 5.11.5.2(b). Source: manual."
					}
				}) : null,
				text("alphaF") === "flange" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Flange thickness, tf",
					unit: "mm",
					value: text("tfMm"),
					onChange: (value) => set("tfMm", value)
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [
				"Axial force: ",
				axial === "none" ? "none" : axial || "not stated",
				". Local load, opening, stiffener design and bending interaction stay off until you add them."
			]
		})
	] }) : null;
	const specialist = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fieldGrid compact",
		children: [
			bearingOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BearingFigure, {
					active,
					place: text("bearingPlace")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Bearing type",
					value: text("bearing"),
					onChange: (value) => set("bearing", value),
					options: [
						["ic", "I or C web"],
						["rhs", "RHS — not implemented"],
						["none", "No local load"]
					]
				}),
				text("bearing") === "rhs" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "toolNote",
					children: "RHS bearing is outside this plate check. No RHS resistance is calculated."
				}) : null,
				text("bearing") === "ic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Dispersed bearing length, bbf",
					unit: "mm",
					value: text("bbfMm"),
					onChange: (value) => set("bbfMm", value),
					onFocus: () => setActive("bbf"),
					info: {
						title: "bbf",
						text: "Length after dispersion through the flange. Figure 5.13.1.1. Source: manual, or derived when that option is on."
					}
				}) : null,
				text("bearing") === "ic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Web bearing length, bb",
					unit: "mm",
					value: text("bbMm"),
					onChange: (value) => set("bbMm", value),
					onFocus: () => setActive("bb"),
					info: {
						title: "bb",
						text: "Bearing length at the web, interior or end as selected. Source: manual or derived."
					}
				}) : null,
				text("bearing") === "ic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Stiff bearing length, bs",
					unit: "mm",
					value: text("bsMm"),
					onChange: (value) => set("bsMm", value),
					info: {
						title: "bs",
						text: "Length of the stiff bearing. Source: manual."
					}
				}) : null,
				text("bearing") === "ic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Flange thickness for dispersion, tf",
					unit: "mm",
					value: text("bearingTfMm"),
					onChange: (value) => set("bearingTfMm", value)
				}) : null,
				text("bearing") === "ic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Load position",
					value: text("bearingPlace"),
					onChange: (value) => set("bearingPlace", value),
					options: [
						["", "Not selected"],
						["interior", "Interior"],
						["end", "End"]
					]
				}) : null,
				text("bearing") === "ic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Bearing lengths",
					value: text("deriveWidth"),
					onChange: (value) => set("deriveWidth", value),
					options: [["", "Enter bbf and bb"], ["yes", "Derive from Figure 5.13.1.1"]]
				}) : null,
				text("bearing") === "ic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Flange restraint",
					value: text("flangesRestrained"),
					onChange: (value) => set("flangesRestrained", value),
					options: [
						["", "Not stated"],
						["yes", "Both flanges — le/r = 2.5 d1/tw"],
						["no", "Only one flange — le/r = 5.0 d1/tw"]
					]
				}) : null,
				text("bearing") === "ic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Design bearing force, R*",
					unit: "N",
					value: text("rStarN"),
					onChange: (value) => set("rStarN", value),
					hint: "Not the elastic patch load."
				}) : null
			] }) : null,
			openingOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpeningFigure, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Opening dimension, lw",
					unit: "mm",
					value: text("lwMm"),
					onChange: (value) => set("lwMm", value),
					info: {
						title: "lw",
						text: "Greatest horizontal or vertical dimension of one unstiffened opening. Clause 5.10.7. Castellated and stiffened openings are not checked. Source: manual."
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Member longitudinally stiffened",
					value: text("openingStiffened"),
					onChange: (value) => set("openingStiffened", value),
					info: {
						title: "Longitudinal stiffening of the member",
						text: "Changes the opening limit from 0.10 to 0.33. It does not mean the opening itself is stiffened."
					},
					options: [["", "No — lw/d1 ≤ 0.10"], ["yes", "Yes — lw/d1 ≤ 0.33"]]
				})
			] }) : null,
			stiffenerOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StiffenerFigure, { active }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Stiffener design",
					value: text("stiffener"),
					onChange: (value) => set("stiffener", value),
					options: [
						["intermediate", "Intermediate transverse"],
						["load-bearing", "Load-bearing"],
						["longitudinal", "Longitudinal"],
						["none", "Not included"]
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Arrangement",
					value: text("arrangement"),
					onChange: (value) => set("arrangement", value),
					options: [
						["", "Not selected"],
						["pair", "Pair"],
						["single-plate", "Single plate"],
						["single-angle", "Single angle"]
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Stiffener area, As",
					unit: "mm²",
					value: text("asMm2"),
					onChange: (value) => set("asMm2", value),
					info: {
						title: "As",
						text: "Area of the stiffener outstand, not including the web strip unless the clause says so. Source: manual."
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Stiffener yield, fys",
					unit: "MPa",
					value: text("fysMpa"),
					onChange: (value) => set("fysMpa", value),
					hint: "If fys differs from fy, the Section 6 check stops."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Stiffener thickness, ts",
					unit: "mm",
					value: text("tsMm"),
					onChange: (value) => set("tsMm", value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Outstanding width, bes",
					unit: "mm",
					value: text("besMm"),
					onChange: (value) => set("besMm", value),
					onFocus: () => setActive("bes"),
					info: {
						title: "bes",
						text: "Outstanding width from the face of the web. Clause 5.14.3. Source: manual."
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Second moment, Is",
					unit: "mm⁴",
					value: text("isMm4"),
					onChange: (value) => set("isMm4", value),
					hint: "About the web centreline, stiffener only."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Effective length, le",
					value: text("stiffenerLe"),
					onChange: (value) => set("stiffenerLe", value),
					options: [
						["", "Not stated"],
						["0.7d1", "0.7 d1"],
						["d1", "d1"]
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Outer edge continuously stiffened",
					value: text("outerStiffened"),
					onChange: (value) => set("outerStiffened", value),
					options: [["", "No"], ["yes", "Yes"]]
				}),
				text("stiffener") === "longitudinal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Twice the compression-flange distance, d2",
					unit: "mm",
					value: text("d2Mm"),
					onChange: (value) => set("d2Mm", value),
					info: {
						title: "d2",
						text: "Twice the clear distance from the neutral axis to the compression flange. Clause 5.16. Source: manual."
					}
				}) : null,
				text("stiffener") === "longitudinal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Longitudinal position",
					value: text("longWhere"),
					onChange: (value) => set("longWhere", value),
					options: [
						["", "Not selected"],
						["compression", "Compression region, 0.2 d2"],
						["neutral", "Neutral axis"],
						["both", "Both"],
						["none", "Not required"]
					]
				}) : null,
				text("stiffener") === "longitudinal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Longitudinal area, As",
					unit: "mm²",
					value: text("asLongMm2"),
					onChange: (value) => set("asLongMm2", value)
				}) : null,
				text("stiffener") === "longitudinal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Longitudinal second moment, Is",
					unit: "mm⁴",
					value: text("isLongMm4"),
					onChange: (value) => set("isLongMm4", value),
					hint: "About the face of the web."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Stiffener weld",
					unit: "kN/mm",
					value: text("weldKnPerMm"),
					onChange: (value) => set("weldKnPerMm", value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "End post",
					value: text("endPost"),
					onChange: (value) => set("endPost", value),
					options: [["", "No"], ["yes", "Yes"]]
				}),
				text("endPost") === "yes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "End gap, e",
					unit: "mm",
					value: text("endGapMm"),
					onChange: (value) => set("endGapMm", value),
					info: {
						title: "End gap, e",
						text: "Gap used for the end-post area. This is not Young’s modulus. Source: manual."
					}
				}) : null,
				text("endPost") === "yes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "End-post area, Aep",
					unit: "mm²",
					value: text("aepMm2"),
					onChange: (value) => set("aepMm2", value)
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Sole torsional restraint",
					value: text("soleTorsion"),
					onChange: (value) => set("soleTorsion", value),
					options: [["", "No"], ["yes", "Yes"]]
				}),
				text("soleTorsion") === "yes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Flange depth, d",
					unit: "mm",
					value: text("torsionDepthMm"),
					onChange: (value) => set("torsionDepthMm", value)
				}) : null,
				text("soleTorsion") === "yes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Critical flange thickness, tf",
					unit: "mm",
					value: text("torsionTfMm"),
					onChange: (value) => set("torsionTfMm", value)
				}) : null,
				text("soleTorsion") === "yes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Member force, F*",
					unit: "N",
					value: text("fMemberN"),
					onChange: (value) => set("fMemberN", value),
					info: {
						title: "F*",
						text: "Force in the compression flange used for torsional restraint. Clause 5.14.5. Source: external member check."
					}
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Force normal to the stiffener, Fn*",
					unit: "N",
					value: text("fnN"),
					onChange: (value) => set("fnN", value),
					info: {
						title: "Fn*",
						text: "External force on the stiffener for the extra stiffness in Clause 5.15.7.1. Source: manual."
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Force parallel to the stiffener, Fp*",
					unit: "N",
					value: text("fpN"),
					onChange: (value) => set("fpN", value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Moment on the stiffener, Mp*",
					unit: "N·mm",
					value: text("mpNmm"),
					onChange: (value) => set("mpNmm", value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Eccentricity, e",
					unit: "mm",
					value: text("eccMm"),
					onChange: (value) => set("eccMm", value),
					info: {
						title: "Eccentricity, e",
						text: "Eccentricity of Fp*. Not Young’s modulus. Source: manual."
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Modulus for the stiffener increase, E",
					unit: "MPa",
					value: text("modulusMpa"),
					onChange: (value) => set("modulusMpa", value),
					hint: "Entered here. The plate modulus above is not used.",
					info: {
						title: "Modulus, E",
						text: "Young’s modulus for Clause 5.15.7.1 only. Source: manual. Not the plate model E."
					}
				})
			] }) : null,
			interactionOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
					label: "Bending and shear",
					value: text("interaction"),
					onChange: (value) => set("interaction", value),
					options: [
						["section", "Section interaction, Clause 5.12.3"],
						["proportioning", "Flange proportioning, Clause 5.12.2"],
						["none", "No bending"]
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Design moment, M*",
					unit: "N·mm",
					value: text("mStarNmm"),
					onChange: (value) => set("mStarNmm", value),
					info: {
						title: "M*",
						text: "Design bending moment from the member analysis. This plate tool does not calculate it. Source: external."
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "External section moment capacity, Ms",
					unit: "N·mm",
					value: text("msNmm"),
					onChange: (value) => set("msNmm", value),
					info: {
						title: "Ms",
						text: "Nominal section moment capacity from the applicable member check. IQ-CAL-PLB does not calculate complete member bending capacity. Source: external verified input."
					},
					hint: "EXTERNAL VERIFIED INPUT. Not calculated by this plate check."
				}),
				text("interaction") === "proportioning" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Effective flange area, Afe",
					unit: "mm²",
					value: text("afeMm2"),
					onChange: (value) => set("afeMm2", value),
					info: {
						title: "Afe",
						text: "Effective area of the flange for Clause 5.12.2. Source: manual."
					}
				}) : null,
				text("interaction") === "proportioning" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Gross flange area, Afg",
					unit: "mm²",
					value: text("afgMm2"),
					onChange: (value) => set("afgMm2", value),
					info: {
						title: "Afg",
						text: "Gross area of the flange. Source: manual."
					}
				}) : null,
				text("interaction") === "proportioning" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Net flange area, Afn",
					unit: "mm²",
					value: text("afnMm2"),
					onChange: (value) => set("afnMm2", value),
					info: {
						title: "Afn",
						text: "Net area of the flange. Source: manual."
					}
				}) : null,
				text("interaction") === "proportioning" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Distance between flange centroids, df",
					unit: "mm",
					value: text("dfMm"),
					onChange: (value) => set("dfMm", value),
					info: {
						title: "df",
						text: "Distance between flange centroids. Clause 5.12.2. Source: manual."
					}
				}) : null,
				text("interaction") === "proportioning" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Flange yield stress, fy",
					unit: "MPa",
					value: text("flangeFyMpa"),
					onChange: (value) => set("flangeFyMpa", value)
				}) : null,
				text("interaction") === "proportioning" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Flange tensile strength, fu",
					unit: "MPa",
					value: text("flangeFuMpa"),
					onChange: (value) => set("flangeFuMpa", value)
				}) : null
			] }) : null,
			text("appendixI") === "yes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "toolNote",
					children: "Appendix I is informative. It does not change the governing utilisation."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Axial force on the web, Nw*",
					unit: "N",
					value: text("nwN"),
					onChange: (value) => set("nwN", value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Moment on the web, Mw*",
					unit: "N·mm",
					value: text("mwNmm"),
					onChange: (value) => set("mwNmm", value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Bearing force, Rw*",
					unit: "N",
					value: text("rwN"),
					onChange: (value) => set("rwN", value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Shear force, Vw*",
					unit: "N",
					value: text("vwN"),
					onChange: (value) => set("vwN", value)
				})
			] }) : null,
			web ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
				label: "Plastic web",
				value: text("plasticWeb"),
				onChange: (value) => set("plasticWeb", value),
				options: [["", "No"], ["yes", "Yes — Clause 5.10.6"]]
			}) : null,
			web ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
				label: "Axial force on this web",
				value: text("axial"),
				onChange: (value) => set("axial", value),
				options: [
					["none", "None"],
					["compression", "Compression"],
					["tension", "Tension"]
				]
			}) : null
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "designSheet",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "quietHelp",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "How this works" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Define the plate or panel above." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Choose the AS 4100 check: plate element or web." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Link or enter the design dimensions. Panel sizes are not copied until you link them." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Enter the design action." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Read the governing result." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Open the full calculation when you need the substitution." })
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "toolNote",
				children: "Examples load the AS 4100 design inputs only. The plate model geometry is unchanged."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "toolToolbar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "toolBtn",
						type: "button",
						onClick: () => loadWorked("plate"),
						children: "EXAMPLE — 300 × 10 plate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "toolBtn",
						type: "button",
						onClick: () => loadWorked("slender"),
						children: "EXAMPLE — 500 × 8 slender plate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "toolBtn",
						type: "button",
						onClick: () => loadWorked("shear"),
						children: "EXAMPLE — web shear, V* = 400 kN"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "toolTabs",
				role: "tablist",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: pane === "check" ? "on" : "",
						onClick: () => setPane("check"),
						children: "CHECK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: pane === "advanced" ? "on" : "",
						onClick: () => setPane("advanced"),
						children: "ADVANCED CHECKS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: pane === "report" ? "on" : "",
						onClick: () => setPane("report"),
						children: "FULL CALCULATION"
					})
				]
			}),
			stale.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "failBanner",
				children: staleText
			}) : null,
			pane === "check" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fieldGrid compact",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pick, {
						label: "Check",
						value: role,
						onChange: (value) => {
							if (value === "element" || value === "web") chooseRole(value);
						},
						options: [
							["", "Choose plate element or web"],
							["element", "Plate element"],
							["web", "Web / shear panel"]
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Governing, { report }),
				elastic?.sigmaCrMpa != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "toolNote",
					children: [
						"FEM σcr on this run is ",
						elastic.sigmaCrMpa.toFixed(2),
						" MPa. It is not copied into kb or into φN. Classical σcr stays on the sheet above."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "toolNote",
					children: "FEM has not been run. Classical σcr on the sheet above is elastic, not an AS 4100 resistance."
				}),
				plate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElementFigure, { diagram: report.diagram }) : null,
				plateFields,
				webFields,
				bearingOn || openingOn || stiffenerOn || interactionOn ? specialist : null,
				role ? addChecks : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultGroups, { report })
			] }) : null,
			pane === "advanced" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "toolNote",
					children: "Specialist checks. A check that the selected web or plate requires is also shown on CHECK once you turn it on."
				}),
				addChecks,
				specialist,
				needsS && !stiffenerOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "toolNote",
					children: "This web is stiffened. Spacing s is on CHECK. Add stiffener design here if you are checking the stiffener itself."
				}) : null
			] }) : null,
			pane === "report" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Governing, { report }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultGroups, { report }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TraceList, { report }),
				report.limitations.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "toolNote",
					children: line
				}, line))
			] }) : null
		]
	});
}
/** Display units for the plate sheet. Solvers stay in mm, N and MPa.
* Factors come from the shared unit engine. Do not hard-code a second scale table.
*/
var LENGTH_UNITS = [
	"mm",
	"cm",
	"m"
];
var STRESS_UNITS = [
	"Pa",
	"kPa",
	"MPa",
	"GPa"
];
var FORCE_UNITS = [
	"N",
	"kN",
	"MN"
];
var LENGTH_ID = {
	mm: "mm",
	cm: "cm",
	m: "m"
};
var STRESS_ID = {
	Pa: "stress:Pa",
	kPa: "stress:kPa",
	MPa: "stress:MPa",
	GPa: "stress:GPa"
};
var FORCE_ID = {
	N: "N",
	kN: "kN",
	MN: "MN"
};
function lengthToMm(value, unit) {
	return convert(value, LENGTH_ID[unit], "mm");
}
function mmToLength(mm, unit) {
	return convert(mm, "mm", LENGTH_ID[unit]);
}
function stressToMpa(value, unit) {
	return convert(value, STRESS_ID[unit], "stress:MPa");
}
function mpaToStress(mpa, unit) {
	return convert(mpa, "stress:MPa", STRESS_ID[unit]);
}
function forceToN(value, unit) {
	return convert(value, FORCE_ID[unit], "N");
}
function nToForce(n, unit) {
	return convert(n, "N", FORCE_ID[unit]);
}
/** Rotational spring: force per length. Canonical is N/mm. */
function stiffnessToNPerMm(value, force, length) {
	return forceToN(value, force) / lengthToMm(1, length);
}
function nPerMmToStiffness(value, force, length) {
	return nToForce(value * lengthToMm(1, length), force);
}
function formatEntry(value) {
	if (!Number.isFinite(value)) return "";
	const abs = Math.abs(value);
	if (abs !== 0 && (abs >= 1e7 || abs < 1e-6)) return value.toExponential(8);
	const rounded = Math.round(value * 1e9) / 1e9;
	return String(rounded);
}
var CYCLE = [
	"ss",
	"fixed",
	"free",
	"elastic"
];
var SS = {
	x0: "ss",
	x1: "ss",
	y0: "ss",
	y1: "ss"
};
var DOCK = [
	"TRACE",
	"FEM",
	"CONVERGENCE",
	"SUBPANELS",
	"STIFFENERS",
	"CODE",
	"DESIGN",
	"TRIAL ρ",
	"CASES",
	"VERIFY"
];
var VIEWS = [
	{
		id: "geometry",
		label: "GEOMETRY"
	},
	{
		id: "sx",
		label: "σx"
	},
	{
		id: "sy",
		label: "σy"
	},
	{
		id: "tau",
		label: "τxy"
	},
	{
		id: "combined",
		label: "COMBINED"
	},
	{
		id: "panels",
		label: "SUBPANELS"
	},
	{
		id: "mesh",
		label: "MESH"
	},
	{
		id: "prestress",
		label: "PRE-BUCKLING"
	},
	{
		id: "mode",
		label: "BUCKLING MODE"
	},
	{
		id: "effective",
		label: "TRIAL ρ"
	}
];
var STATUS = {
	available: "AVAILABLE",
	"data-required": "VERIFIED STANDARD DATA REQUIRED",
	"not-applicable": "NOT APPLICABLE",
	"out-of-scope": "OUTSIDE IMPLEMENTED SCOPE",
	"source-required": "IMPLEMENTED — SOURCE VERIFICATION REQUIRED",
	pass: "PASS",
	fail: "FAIL",
	"not-checked": "NOT CHECKED",
	invalid: "INVALID INPUT"
};
var EDGE_FIELDS = [
	{
		key: "x0",
		label: "Edge x = 0",
		hot: "ex0"
	},
	{
		key: "x1",
		label: "Edge x = a",
		hot: "ex1"
	},
	{
		key: "y0",
		label: "Edge y = 0",
		hot: "ey0"
	},
	{
		key: "y1",
		label: "Edge y = b",
		hot: "ey1"
	}
];
function num(raw) {
	const t = raw.trim();
	if (!t) return null;
	const n = Number(t);
	return Number.isFinite(n) ? n : null;
}
function showEng(n) {
	const abs = Math.abs(n);
	if (abs !== 0 && (abs >= 1e5 || abs < .001)) return n.toExponential(4);
	return trimNum(n, abs >= 100 ? 2 : abs >= 10 ? 3 : abs >= 1 ? 4 : 6);
}
function show(n, digits = 3) {
	if (n == null || !Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	if (abs !== 0 && (abs >= 1e5 || abs < .01)) return n.toExponential(3);
	return trimNum(n, digits);
}
function showStep(raw) {
	return raw.replace(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi, (token) => {
		const value = Number(token);
		return Number.isFinite(value) ? show(value, 4) : token;
	});
}
function askWorker(job, timeoutMs) {
	return new Promise((resolve, reject) => {
		try {
			const worker = new Worker(new URL("../plate/fem.worker.ts", import.meta.url), { type: "module" });
			const timer = window.setTimeout(() => {
				worker.terminate();
				reject(/* @__PURE__ */ new Error("Solver timed out."));
			}, timeoutMs);
			worker.onmessage = (event) => {
				window.clearTimeout(timer);
				worker.terminate();
				resolve(event.data);
			};
			worker.onerror = () => {
				window.clearTimeout(timer);
				worker.terminate();
				reject(/* @__PURE__ */ new Error("Solver worker failed."));
			};
			worker.postMessage(job);
		} catch (error) {
			reject(error instanceof Error ? error : /* @__PURE__ */ new Error("Solver worker failed."));
		}
	});
}
function PlateTool() {
	const [a, setA] = (0, import_react.useState)("2000");
	const [b, setB] = (0, import_react.useState)("1000");
	const [t, setT] = (0, import_react.useState)("10");
	const [e, setE] = (0, import_react.useState)("210000");
	const [nu, setNu] = (0, import_react.useState)("0.3");
	const [fy, setFy] = (0, import_react.useState)("350");
	const [fu, setFu] = (0, import_react.useState)("480");
	const [s1, setS1] = (0, import_react.useState)("100");
	const [psi, setPsi] = (0, import_react.useState)("1");
	const [tau, setTau] = (0, import_react.useState)("0");
	const [sy, setSy] = (0, import_react.useState)("0");
	const [kr, setKr] = (0, import_react.useState)("0");
	const [edges, setEdges] = (0, import_react.useState)({ ...SS });
	const [hot, setHot] = (0, import_react.useState)(null);
	const [view, setView] = (0, import_react.useState)("geometry");
	const [designMethod, setDesignMethod] = (0, import_react.useState)("none");
	const [design, setDesign] = (0, import_react.useState)({});
	const [nx, setNx] = (0, import_react.useState)("12");
	const [ny, setNy] = (0, import_react.useState)("12");
	const [fem, setFem] = (0, import_react.useState)(null);
	const [femKey, setFemKey] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)("");
	const [femError, setFemError] = (0, import_react.useState)("");
	const [modeIndex, setModeIndex] = (0, import_react.useState)(0);
	const [stiffeners, setStiffeners] = (0, import_react.useState)([]);
	const [seq, setSeq] = (0, import_react.useState)(1);
	const [selectedStiffener, setSelectedStiffener] = (0, import_react.useState)(null);
	const [selectedPanel, setSelectedPanel] = (0, import_react.useState)(null);
	const [panelSort, setPanelSort] = (0, import_react.useState)("id");
	const [patchOn, setPatchOn] = (0, import_react.useState)(false);
	const [patchEdge, setPatchEdge] = (0, import_react.useState)("y1");
	const [patchF, setPatchF] = (0, import_react.useState)("10000");
	const [patchSs, setPatchSs] = (0, import_react.useState)("250");
	const [patchAt, setPatchAt] = (0, import_react.useState)("1000");
	const [lengthUnit, setLengthUnit] = (0, import_react.useState)("mm");
	const [stressUnit, setStressUnit] = (0, import_react.useState)("MPa");
	const [forceUnit, setForceUnit] = (0, import_react.useState)("N");
	const [convTol, setConvTol] = (0, import_react.useState)("1");
	const [rho, setRho] = (0, import_react.useState)("");
	const [study, setStudy] = (0, import_react.useState)(null);
	const [studyKey, setStudyKey] = (0, import_react.useState)("");
	const [verifyRows, setVerifyRows] = (0, import_react.useState)(null);
	const [cases, setCases] = (0, import_react.useState)([]);
	const [casesReady, setCasesReady] = (0, import_react.useState)(false);
	const [caseName, setCaseName] = (0, import_react.useState)("CASE A");
	const [leftOpen, setLeftOpen] = (0, import_react.useState)(true);
	const [rightOpen, setRightOpen] = (0, import_react.useState)(true);
	const [as4100Sheet, setAs4100Sheet] = (0, import_react.useState)("AS 4100 plate check not started. Elastic σcr is not a design resistance.");
	const [dock, setDock] = (0, import_react.useState)("TRACE");
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem("iq-cal-plb-cases");
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) setCases(parsed);
			}
		} catch {}
		setCasesReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!casesReady) return;
		localStorage.setItem("iq-cal-plb-cases", JSON.stringify(cases));
	}, [cases, casesReady]);
	const toLen = (raw) => {
		const n = num(raw);
		return n == null ? null : lengthToMm(n, lengthUnit);
	};
	const toStress = (raw) => {
		const n = num(raw);
		return n == null ? null : stressToMpa(n, stressUnit);
	};
	const toForce = (raw) => {
		const n = num(raw);
		return n == null ? null : forceToN(n, forceUnit);
	};
	const parsed = {
		aMm: toLen(a),
		bMm: toLen(b),
		tMm: toLen(t),
		eMpa: toStress(e),
		nu: num(nu),
		fyMpa: toStress(fy),
		fuMpa: toStress(fu),
		sigma1Mpa: toStress(s1) ?? 0,
		psi: num(psi) ?? 1,
		tauMpa: toStress(tau) ?? 0,
		sigmaYMpa: toStress(sy) ?? 0,
		kr: num(kr) == null ? 0 : stiffnessToNPerMm(num(kr) ?? 0, forceUnit, lengthUnit)
	};
	const nxN = Math.round(num(nx) ?? 0);
	const nyN = Math.round(num(ny) ?? 0);
	const result = (0, import_react.useMemo)(() => {
		const { aMm, bMm, tMm, eMpa, nu: nuValue, fyMpa, fuMpa } = parsed;
		if (aMm == null || bMm == null || tMm == null || eMpa == null || nuValue == null || fyMpa == null || fuMpa == null) return null;
		return classicalPlate({
			aMm,
			bMm,
			tMm,
			eMpa,
			nu: nuValue,
			fyMpa,
			fuMpa,
			sigma1Mpa: parsed.sigma1Mpa,
			psi: parsed.psi,
			tauMpa: parsed.tauMpa,
			edges
		});
	}, [
		a,
		b,
		t,
		e,
		nu,
		fy,
		fu,
		s1,
		psi,
		tau,
		edges,
		lengthUnit,
		stressUnit,
		forceUnit
	]);
	const panels = (0, import_react.useMemo)(() => {
		const { aMm, bMm, tMm, eMpa, nu: nuValue, fyMpa, fuMpa } = parsed;
		if (aMm == null || bMm == null || tMm == null || eMpa == null || nuValue == null || fyMpa == null || fuMpa == null) return [];
		return buildPanels({
			aMm,
			bMm,
			tMm,
			eMpa,
			nu: nuValue,
			fyMpa,
			fuMpa,
			sigma1Mpa: parsed.sigma1Mpa,
			psi: parsed.psi,
			tauMpa: parsed.tauMpa,
			edges,
			stiffeners
		});
	}, [
		a,
		b,
		t,
		e,
		nu,
		fy,
		fu,
		s1,
		psi,
		tau,
		edges,
		stiffeners,
		lengthUnit,
		stressUnit,
		forceUnit
	]);
	const meshPreview = (0, import_react.useMemo)(() => {
		if (parsed.aMm == null || parsed.bMm == null || nxN < 2 || nyN < 2 || nxN > 80 || nyN > 80) return [];
		const forceN = toForce(patchF);
		const lengthMm = toLen(patchSs);
		const atMm = toLen(patchAt);
		const xCuts = stiffeners.filter((item) => item.axis === "y").map((item) => item.atMm);
		const yCuts = stiffeners.filter((item) => item.axis === "x").map((item) => item.atMm);
		if (patchOn && forceN != null && lengthMm != null && atMm != null && lengthMm > 0) {
			const cuts = [atMm - lengthMm / 2, atMm + lengthMm / 2];
			if (patchEdge === "y0" || patchEdge === "y1") xCuts.push(...cuts);
			else yCuts.push(...cuts);
		}
		return previewMesh(parsed.aMm, parsed.bMm, nxN, nyN, xCuts, yCuts);
	}, [
		a,
		b,
		nxN,
		nyN,
		stiffeners,
		patchOn,
		patchEdge,
		patchF,
		patchSs,
		patchAt,
		lengthUnit,
		forceUnit
	]);
	const key = JSON.stringify({
		parsed,
		edges,
		nx,
		ny,
		stiffeners,
		rho,
		patchOn,
		patchEdge,
		patchF,
		patchSs,
		patchAt
	});
	const stale = fem != null && femKey !== key;
	const studyStale = study != null && studyKey !== key;
	const liveFem = fem?.ok && !stale ? fem : null;
	const modeClass = (0, import_react.useMemo)(() => {
		const mode = liveFem?.modes[modeIndex] ?? liveFem?.modes[0];
		if (!liveFem || !mode || mode.w.length === 0) return null;
		return classifyMode(mode.w, liveFem.xs, liveFem.ys, panels);
	}, [
		liveFem,
		modeIndex,
		panels
	]);
	const previewAspect = parsed.aMm && parsed.bMm && nxN >= 2 && nyN >= 2 ? Math.max(parsed.aMm / nxN, parsed.bMm / nyN) / Math.min(parsed.aMm / nxN, parsed.bMm / nyN) : null;
	const rhoN = num(rho);
	const plateKg = parsed.aMm && parsed.bMm && parsed.tMm ? plateMassKg(parsed.aMm, parsed.bMm, parsed.tMm) : 0;
	const stiffKg = stiffeners.reduce((sum, item) => {
		const props = parsed.tMm ? stiffenerProps(item, parsed.tMm) : null;
		const length = item.axis === "x" ? parsed.aMm ?? 0 : parsed.bMm ?? 0;
		return sum + stiffenerMassKg(props?.areaMm2 ?? 0, length);
	}, 0);
	const codeRows = (0, import_react.useMemo)(() => {
		if (parsed.aMm == null || parsed.bMm == null || parsed.tMm == null || parsed.fyMpa == null) return [];
		const allSs = edges.x0 === "ss" && edges.x1 === "ss" && edges.y0 === "ss" && edges.y1 === "ss";
		return designChecks(designMethod, {
			aMm: parsed.aMm,
			bMm: parsed.bMm,
			tMm: parsed.tMm,
			fyMpa: parsed.fyMpa,
			edgesSimplySupported: allSs,
			stiffenerCount: stiffeners.length,
			hasPatch: patchOn,
			design
		});
	}, [
		a,
		b,
		t,
		fy,
		edges,
		stiffeners.length,
		lengthUnit,
		stressUnit,
		designMethod,
		patchOn,
		design
	]);
	const rhoPreview = rhoN != null && rhoN > 0 && rhoN < 1 ? rhoN : null;
	const sortedPanels = [...panels].sort((p, q) => {
		if (panelSort === "stress") return (p.sigmaCrMpa ?? 0xe8d4a51000) - (q.sigmaCrMpa ?? 0xe8d4a51000);
		return p.id.localeCompare(q.id, void 0, { numeric: true });
	});
	function editDirect(setter) {
		return (value) => setter(value);
	}
	function livePatch() {
		if (!patchOn) return null;
		const forceN = toForce(patchF);
		const lengthMm = toLen(patchSs);
		const atMm = toLen(patchAt);
		if (forceN == null || lengthMm == null || atMm == null) return null;
		return {
			edge: patchEdge,
			atMm,
			lengthMm,
			forceN
		};
	}
	function rescale(raw, convert) {
		const n = num(raw);
		return n == null ? raw : formatEntry(convert(n));
	}
	function onLengthUnit(next) {
		if (next === lengthUnit) return;
		const scale = (raw) => rescale(raw, (value) => mmToLength(lengthToMm(value, lengthUnit), next));
		setA(scale(a));
		setB(scale(b));
		setT(scale(t));
		setPatchSs(scale(patchSs));
		setPatchAt(scale(patchAt));
		const spring = num(kr);
		if (spring != null) setKr(formatEntry(nPerMmToStiffness(stiffnessToNPerMm(spring, forceUnit, lengthUnit), forceUnit, next)));
		setLengthUnit(next);
	}
	function onStressUnit(next) {
		if (next === stressUnit) return;
		const scale = (raw) => rescale(raw, (value) => mpaToStress(stressToMpa(value, stressUnit), next));
		setE(scale(e));
		setFy(scale(fy));
		setFu(scale(fu));
		setS1(scale(s1));
		setTau(scale(tau));
		setSy(scale(sy));
		setStressUnit(next);
	}
	function onForceUnit(next) {
		if (next === forceUnit) return;
		const load = num(patchF);
		if (load != null) setPatchF(formatEntry(nToForce(forceToN(load, forceUnit), next)));
		const spring = num(kr);
		if (spring != null) setKr(formatEntry(nPerMmToStiffness(stiffnessToNPerMm(spring, forceUnit, lengthUnit), next, lengthUnit)));
		setForceUnit(next);
	}
	const patchIssue = (() => {
		if (!patchOn) return "";
		const patch = livePatch();
		if (!patch || parsed.aMm == null || parsed.bMm == null) return "Patch force, loaded length and position must be numbers.";
		const interval = patchInterval(patch, patch.edge === "x0" || patch.edge === "x1" ? parsed.bMm : parsed.aMm);
		return typeof interval === "string" ? interval : "";
	})();
	const patchForce = patchOn ? toForce(patchF) ?? 0 : 0;
	const compressiveEdge = Math.max(parsed.sigma1Mpa, parsed.sigma1Mpa * parsed.psi, parsed.sigmaYMpa);
	const tensileField = Math.abs(parsed.tauMpa) <= 1e-9 && !(patchForce > 0) && compressiveEdge <= 1e-9 && (Math.abs(parsed.sigma1Mpa) > 1e-9 || Math.abs(parsed.sigmaYMpa) > 1e-9 || patchForce < 0);
	function applyPreset(id) {
		const clear = () => {
			setPatchOn(false);
			setEdges({ ...SS });
			setStiffeners([]);
			setSy(formatEntry(mpaToStress(0, stressUnit)));
		};
		const L = (mm) => formatEntry(mmToLength(mm, lengthUnit));
		const S = (mpa) => formatEntry(mpaToStress(mpa, stressUnit));
		if (id === "A") {
			setA(L(1e3));
			setB(L(1e3));
			setT(L(10));
			setS1(S(100));
			setPsi("1");
			setTau(S(0));
			clear();
			return;
		}
		if (id === "B") {
			setA(L(800));
			setB(L(800));
			setT(L(8));
			setS1(S(0));
			setPsi("1");
			setTau(S(40));
			clear();
			return;
		}
		if (id === "C") {
			setA(L(5e3));
			setB(L(1e3));
			setT(L(10));
			setS1(S(100));
			setPsi("-1");
			setTau(S(0));
			clear();
			setView("sx");
			return;
		}
		if (id === "D") {
			setA(L(4e3));
			setB(L(1e3));
			setT(L(10));
			setS1(S(100));
			setPsi("1");
			setTau(S(0));
			clear();
			return;
		}
	}
	function addStiffener(axis) {
		const id = `S${seq}`;
		const at = axis === "x" ? (parsed.bMm ?? 1e3) / 2 : (parsed.aMm ?? 2e3) / 2;
		setSeq(seq + 1);
		setStiffeners((list) => [...list, newStiffener({
			id,
			axis,
			atMm: at
		})]);
		setSelectedStiffener(id);
		setDock("STIFFENERS");
	}
	function femInput() {
		const { aMm, bMm, tMm, eMpa, nu: nuValue } = parsed;
		if (aMm == null || bMm == null || tMm == null || eMpa == null || nuValue == null) return null;
		if (!(aMm > 0) || !(bMm > 0) || !(tMm > 0) || !(eMpa > 0) || !(nuValue > 0 && nuValue < .5)) return null;
		if (nxN < 2 || nyN < 2 || nxN > 80 || nyN > 80) return null;
		return {
			aMm,
			bMm,
			tMm,
			eMpa,
			nu: nuValue,
			sigma1Mpa: parsed.sigma1Mpa,
			psi: parsed.psi,
			tauMpa: parsed.tauMpa,
			sigmaYMpa: parsed.sigmaYMpa,
			patchLoad: livePatch() ?? void 0,
			nx: nxN,
			ny: nyN,
			edges,
			krNPerRadPerMm: parsed.kr,
			stiffeners: stiffeners.map((item) => {
				const props = stiffenerProps(item, tMm);
				return {
					id: item.id,
					axis: item.axis,
					atMm: item.atMm,
					eiNmm2: props.eiNmm2,
					gjNmm2: props.gjNmm2,
					areaMm2: props.areaMm2,
					rigid: item.rigid
				};
			}),
			modes: 5,
			shapes: true
		};
	}
	async function runFem() {
		const input = femInput();
		if (!input) {
			setFemError("FEM needs positive a, b, t, E, ν and a mesh from 2×2 to 80×80.");
			return;
		}
		setBusy("SOLVING");
		setFemError("");
		setDock("FEM");
		setView("mode");
		try {
			const value = (await askWorker({
				op: "solve",
				input
			}, 12e4))?.result;
			if (!value) throw new Error("Solver returned no result.");
			setFem(value);
			setFemKey(key);
			setModeIndex(0);
			if (!value.ok) setFemError(value.reason);
			else {
				const cls = value.modes[0] ? classifyMode(value.modes[0].w, value.xs, value.ys, panels) : null;
				if (cls?.panelId) setSelectedPanel(cls.panelId);
			}
		} catch (error) {
			if (input.nx * input.ny <= 400) {
				const value = solvePlateFem(input);
				setFem(value);
				setFemKey(key);
				if (!value.ok) setFemError(value.reason);
			} else setFemError(error instanceof Error ? error.message : "Solver failed.");
		} finally {
			setBusy("");
		}
	}
	async function runStudy() {
		const input = femInput();
		if (!input || parsed.aMm == null || parsed.bMm == null) {
			setFemError("Set the plate before a mesh study.");
			return;
		}
		setBusy("CONVERGENCE");
		setFemError("");
		setDock("CONVERGENCE");
		try {
			const data = await askWorker({
				op: "study",
				input,
				grids: studyGrids(parsed.aMm, parsed.bMm),
				tolerance: Number(convTol) / 100
			}, 18e4);
			if (!data?.study) throw new Error("Mesh study returned nothing.");
			setStudy(data.study);
			setStudyKey(key);
		} catch (error) {
			setFemError(error instanceof Error ? error.message : "Mesh study failed.");
		} finally {
			setBusy("");
		}
	}
	async function runVerify() {
		setBusy("VERIFY");
		setFemError("");
		setDock("VERIFY");
		try {
			const data = await askWorker({ op: "verify" }, 18e4);
			if (!data?.rows) throw new Error("Verification returned nothing.");
			setVerifyRows(data.rows);
		} catch (error) {
			setFemError(error instanceof Error ? error.message : "Verification failed.");
		} finally {
			setBusy("");
		}
	}
	async function runVerifyFull() {
		setBusy("VERIFY");
		setFemError("");
		setDock("VERIFY");
		try {
			const data = await askWorker({ op: "verify-full" }, 18e4);
			if (!data?.rows) throw new Error("Verification returned nothing.");
			setVerifyRows(data.rows);
		} catch (error) {
			setFemError(error instanceof Error ? error.message : "Verification failed.");
		} finally {
			setBusy("");
		}
	}
	function duplicateCase() {
		const row = {
			id: `${Date.now()}`,
			name: caseName.trim() || `CASE ${cases.length + 1}`,
			plateKg,
			stiffKg,
			totalKg: plateKg + stiffKg,
			classicalMpa: result?.ok ? result.sigmaCrMpa : null,
			femMpa: liveFem?.modes[0]?.sigma1CrMpa ?? liveFem?.modes[0]?.sigmaYCrMpa ?? liveFem?.modes[0]?.tauCrMpa ?? null,
			patchCrN: liveFem?.modes[0]?.patchCrN ?? null,
			mode: modeClass?.kind ?? (liveFem ? "Mode 1" : "—"),
			utilisation: "—"
		};
		setCases((list) => [...list, row]);
		setCaseName(`CASE ${String.fromCharCode(65 + (cases.length + 1) % 26)}`);
		setDock("CASES");
	}
	function cycle(edge) {
		setEdges((prev) => ({
			...prev,
			[edge]: CYCLE[(CYCLE.indexOf(prev[edge]) + 1) % CYCLE.length] ?? "ss"
		}));
	}
	const desk = ["plateDesk", leftOpen && rightOpen ? "" : !leftOpen && !rightOpen ? "bothOff" : !leftOpen ? "leftOff" : "rightOff"].filter(Boolean).join(" ");
	const critical = liveFem?.modes[0];
	const solvedRows = study?.rows.filter((row) => row.criticalMpa != null) ?? [];
	const lastChange = [...solvedRows].reverse().find((row) => row.changePct != null)?.changePct ?? null;
	const tolPct = Number(convTol);
	const converged = study != null && !studyStale && solvedRows.length >= 2 && lastChange != null && Math.abs(lastChange) < tolPct;
	const stressOut = (mpa) => mpa == null || !Number.isFinite(mpa) ? "—" : `${showEng(mpaToStress(mpa, stressUnit))} ${stressUnit}`;
	const forceOut = (n) => n == null || !Number.isFinite(n) ? "—" : `${showEng(nToForce(n, forceUnit))} ${forceUnit}`;
	const directOn = Math.abs(parsed.sigma1Mpa) > 1e-9 || Math.abs(parsed.sigmaYMpa) > 1e-9;
	const shearOn = Math.abs(parsed.tauMpa) > 1e-9;
	const bothFields = directOn && shearOn;
	const allSs = edges.x0 === "ss" && edges.x1 === "ss" && edges.y0 === "ss" && edges.y1 === "ss";
	const analyticalKind = !result?.ok ? null : shearOn && !directOn && !patchOn ? "ANALYTICAL — APPROXIMATE/FIT" : allSs && !patchOn && !shearOn && Math.abs(parsed.psi - 1) < 1e-9 && Math.abs(parsed.sigmaYMpa) < 1e-9 ? "ANALYTICAL — EXACT FOR IMPLEMENTED IDEALISATION" : "ANALYTICAL — FOR THE IMPLEMENTED IDEALISATION";
	const femKind = !liveFem ? stale ? "FEM — STALE" : "FEM — NOT RUN" : converged ? "FEM — CONVERGED" : study != null && !studyStale ? "FEM — NOT CONVERGED" : "FEM — SOLVED, MESH NOT VERIFIED";
	const solverKind = !liveFem ? "NOT RUN" : liveFem.residual <= liveFem.solverTolerance ? "CONVERGED" : "SOLVED — RESIDUAL ABOVE TOLERANCE";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "presetRow",
			children: [
				["A", "TEST A SQUARE"],
				["B", "TEST B SHEAR"],
				["C", "TEST C BENDING"],
				["D", "TEST D LONG"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "caseChip",
				onClick: () => applyPreset(id),
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "toolToolbar",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => setLeftOpen((v) => !v),
				children: leftOpen ? "HIDE INPUTS" : "SHOW INPUTS"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => setRightOpen((v) => !v),
				children: rightOpen ? "HIDE RESULTS" : "SHOW RESULTS"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: desk,
			children: [
				leftOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "plateCol",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "toolPanel",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Geometry" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "toolNote",
									style: { marginTop: 0 },
									children: "The solver stays in millimetres, newtons and MPa. Changing a unit rescales the numbers so the physical plate does not change."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "fieldGrid compact",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Length" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												className: "toolSelect",
												value: lengthUnit,
												onChange: (event) => onLengthUnit(event.target.value),
												children: LENGTH_UNITS.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: unit,
													children: unit
												}, unit))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stress / E" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												className: "toolSelect",
												value: stressUnit,
												onChange: (event) => onStressUnit(event.target.value),
												children: STRESS_UNITS.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: unit,
													children: unit
												}, unit))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Force" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												className: "toolSelect",
												value: forceUnit,
												onChange: (event) => onForceUnit(event.target.value),
												children: FORCE_UNITS.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: unit,
													children: unit
												}, unit))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: `a — ${lengthUnit}`,
											value: a,
											onChange: setA,
											hot: "a",
											setHot
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: `b — ${lengthUnit}`,
											value: b,
											onChange: setB,
											hot: "b",
											setHot
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: `t — ${lengthUnit}`,
											value: t,
											onChange: setT,
											hot: "t",
											setHot
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "toolPanel",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Material" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "toolNote",
									style: { marginTop: 0 },
									children: "Enter E, ν, fy and fu. No steel-grade table is embedded."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "fieldGrid compact",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: `E — ${stressUnit}`,
											value: e,
											onChange: setE
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "ν",
											value: nu,
											onChange: setNu
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: `fy — ${stressUnit}`,
											value: fy,
											onChange: setFy
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: `fu — ${stressUnit}`,
											value: fu,
											onChange: setFu
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "toolPanel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Edges" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "fieldGrid compact",
								children: [EDGE_FIELDS.map((edge) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									onMouseEnter: () => setHot(edge.hot),
									onMouseLeave: () => setHot(null),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: edge.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "toolSelect",
										value: edges[edge.key],
										onChange: (event) => setEdges((prev) => ({
											...prev,
											[edge.key]: event.target.value
										})),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "ss",
												children: "Simply supported"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "fixed",
												children: "Fixed"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "free",
												children: "Free"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "elastic",
												children: "Elastic rotation"
											})
										]
									})]
								}, edge.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: `kθ — ${forceUnit}/rad per ${lengthUnit}`,
									value: kr,
									onChange: setKr,
									hint: "FEM rotational spring only. Canonical stiffness is N/mm."
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "toolPanel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Stress" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "fieldGrid compact",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: `σ1 at y = 0 — ${stressUnit}`,
										value: s1,
										onChange: editDirect(setS1),
										hot: "sx",
										setHot
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "ψ = σ2 / σ1",
										value: psi,
										onChange: editDirect(setPsi),
										hot: "sx",
										setHot
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: `τxy — ${stressUnit}`,
										value: tau,
										onChange: editDirect(setTau),
										hot: "tau",
										setHot
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: `σy — ${stressUnit}`,
										value: sy,
										onChange: editDirect(setSy),
										hint: "Uniform. Positive is compression."
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "toolPanel",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Patch load" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Patch load" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "toolSelect",
										value: patchOn ? "on" : "off",
										onChange: (event) => {
											setPatchOn(event.target.value === "on");
											setView("geometry");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "off",
											children: "Off"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "on",
											children: "On — edge traction"
										})]
									})]
								}),
								patchOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "toolNote",
										style: { marginTop: 0 },
										children: "Uniform normal force on one edge. Positive pushes into the plate. This is the applied load, not a buckling resistance and not a code check. Eccentricity is not supported."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "fieldGrid compact",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "field",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loaded edge" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													className: "toolSelect",
													value: patchEdge,
													onChange: (event) => setPatchEdge(event.target.value),
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "y1",
															children: "y = b"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "y0",
															children: "y = 0"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "x0",
															children: "x = 0"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "x1",
															children: "x = a"
														})
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: `F — ${forceUnit}`,
												value: patchF,
												onChange: setPatchF,
												hint: "Compression into the plate is positive."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: `ss — ${lengthUnit}`,
												value: patchSs,
												onChange: setPatchSs,
												hint: "Loaded length. 1 kN/m = 1 N/mm."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: patchEdge === "x0" || patchEdge === "x1" ? `Centre y — ${lengthUnit}` : `Centre x — ${lengthUnit}`,
												value: patchAt,
												onChange: setPatchAt
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "failBanner",
										children: "CODE PATCH RESISTANCE: VERIFIED STANDARD DATA REQUIRED"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "toolNote",
										children: "ECCENTRIC PATCH — NOT IMPLEMENTED. POINT FORCE — NOT IMPLEMENTED. NON-UNIFORM PATCH DISTRIBUTION — NOT IMPLEMENTED. GMNIA — NOT IMPLEMENTED."
									}),
									patchIssue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "failBanner",
										children: [patchIssue, " The eigenvalue will not run on this patch."]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "toolNote",
										children: "The FEM uses a plane-stress pre-buckling solve. λ·F is an elastic critical force, not a design resistance. Distribution is uniform. A point force is not offered."
									})
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "toolNote",
									children: "No patch. The membrane field is the σx, σy and τxy you enter. ECCENTRIC PATCH — NOT IMPLEMENTED. POINT FORCE — NOT IMPLEMENTED. NON-UNIFORM PATCH DISTRIBUTION — NOT IMPLEMENTED. GMNIA — NOT IMPLEMENTED."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StiffenerEditor, {
							items: stiffeners,
							selected: selectedStiffener,
							onSelect: (id) => {
								setSelectedStiffener(id);
								setHot(id);
							},
							onHot: setHot,
							onAdd: addStiffener,
							onChange: setStiffeners,
							onSeq: () => {
								const id = `S${seq}`;
								setSeq(seq + 1);
								return id;
							},
							lengthUnit,
							stressUnit
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "toolPanel plateStage",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "toolTabs",
							role: "tablist",
							children: VIEWS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: view === item.id ? "on" : "",
								onClick: () => setView(item.id),
								children: item.label
							}, item.id))
						}),
						view === "mode" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeView, {
							xs: liveFem?.xs ?? [],
							ys: liveFem?.ys ?? [],
							modes: liveFem?.modes ?? [],
							modeIndex,
							onMode: setModeIndex
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "drawingFrame jointFrame",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlateDrawing, {
								aMm: parsed.aMm ?? 1,
								bMm: parsed.bMm ?? 1,
								tMm: parsed.tMm ?? 1,
								sigma1: parsed.sigma1Mpa,
								psi: parsed.psi,
								tau: parsed.tauMpa,
								sigmaY: parsed.sigmaYMpa,
								edges,
								hot,
								view,
								mesh: liveFem?.mesh ?? meshPreview,
								xs: liveFem?.xs ?? [],
								ys: liveFem?.ys ?? [],
								membrane: liveFem?.membrane ?? null,
								onEdge: cycle,
								onHot: setHot,
								stiffeners: stiffeners.map((item) => ({
									id: item.id,
									axis: item.axis,
									atMm: item.atMm
								})),
								panels: panels.map((panel) => ({
									id: panel.id,
									x0: panel.x0,
									x1: panel.x1,
									y0: panel.y0,
									y1: panel.y1
								})),
								selectedStiffener,
								selectedPanel: selectedPanel ?? modeClass?.panelId ?? null,
								onStiffener: (id) => {
									setSelectedStiffener(id);
									setDock("STIFFENERS");
								},
								onPanel: (id) => {
									setSelectedPanel(id);
									setDock("SUBPANELS");
									setView("panels");
								},
								onDragStiffener: (id, atMm) => setStiffeners((list) => list.map((item) => item.id === id ? {
									...item,
									atMm: Math.round(atMm * 10) / 10
								} : item)),
								patch: livePatch(),
								effectiveRho: view === "effective" ? rhoPreview : null
							})
						}),
						view === "sy" && Math.abs(parsed.sigmaYMpa) < 1e-9 && !patchOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "toolNote",
							children: "No uniform σy. A patch load is a separate edge traction; its membrane stress is calculated in the FEM, not drawn as a stress block."
						}) : null,
						view === "effective" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "toolNote",
							children: "The hatch is a trial ρ preview. It is not an AS 4100 effective width."
						}) : null
					]
				}),
				rightOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "plateCol",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "toolPanel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Governing" }),
							!result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "failBanner",
								children: "Enter positive a, b, t, E, ν, fy and fu."
							}) : null,
							result && !result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "failBanner",
								children: result.reason
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "resultList",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "α = a/b" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: result?.ok ? show(result.alpha, 3) : "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CLASSICAL COMPRESSION BUCKLING σcr" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: result?.ok ? stressOut(result.sigmaCrMpa) : "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CLASSICAL SHEAR BUCKLING τcr" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: result?.ok ? stressOut(result.tauCrMpa) : "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Half-waves m × n" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: result?.ok && result.m != null ? `${result.m} × ${result.n}` : "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: bothFields ? "FEM COMBINED-PRESTRESS λcr" : "FEM λ1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: critical ? show(critical.lambda, 4) : fem ? "—" : "Not run" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "FEM σ1 at y = 0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: stressOut(critical?.sigma1CrMpa) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "FEM σy,cr" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: stressOut(critical?.sigmaYCrMpa) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "FEM τcr" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: stressOut(critical?.tauCrMpa) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "FEM patch Fcr" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: forceOut(critical?.patchCrN) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Plate mass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [show(plateKg, 2), " kg"] })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stiffener mass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [show(stiffKg, 2), " kg"] })] })
								]
							}),
							bothFields ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: "NO CLASSICAL INTERACTION CHECK IMPLEMENTED. σcr and τcr stay separate. λcr is an elastic bifurcation multiplier on the combined reference field, not a code design utilisation."
							}) : null,
							patchOn || Math.abs(parsed.sigmaYMpa) > 1e-9 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: "Classical σcr and τcr do not include σy or the patch. There is no closed form for that combination. Use the FEM column."
							}) : null,
							Math.abs(parsed.tauMpa) < 1e-9 && result?.ok && result.tauCrMpa != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: "Classical τcr is the simply-supported plate property. Applied τxy is zero, so that number is not this load case. APPROXIMATE / FIT — not an exact series."
							}) : null,
							Math.abs(parsed.tauMpa) >= 1e-9 && result?.ok && result.tauCrMpa != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: "CLASSICAL SHEAR BUCKLING uses the Timoshenko kτ fit. APPROXIMATE / FIT — not an exact closed form. It is not a combined utilisation."
							}) : null,
							tensileField ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "failBanner",
								children: "The direct field is tensile. Classical σcr is not a capacity for this load, and the eigenvalue is refused."
							}) : null,
							critical?.sigma1CrMpa != null && critical.sigma1CrMpa < 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: "σ1 at λ is tensile at y = 0. Read it with ψ. It is not a compressive capacity of that edge."
							}) : null,
							stale ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "failBanner",
								children: "STALE — INPUTS CHANGED. RUN FEM AGAIN."
							}) : null,
							modeClass ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "okBanner",
								children: [modeClass.kind, modeClass.panelId ? ` · ${modeClass.panelId}` : ""]
							}) : null,
							modeClass ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: modeClass.note
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "resultList",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mesh" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: liveFem ? `${liveFem.nx} × ${liveFem.ny}` : nxN >= 2 && nyN >= 2 ? `${nxN} × ${nyN}` : "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DOF" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: liveFem ? liveFem.freeDof : "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Eigenpair residual" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: liveFem ? liveFem.residual.toExponential(2) : "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Solver tolerance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: liveFem ? liveFem.solverTolerance.toExponential(0) : "1e-8" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Iterations" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: liveFem ? liveFem.iterations : "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Element aspect" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: liveFem ? show(liveFem.elementAspect, 2) : previewAspect == null ? "—" : show(previewAspect, 2) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Last mesh change" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: lastChange == null || studyStale ? "—" : `${show(lastChange, 2)}%` })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mesh status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: study == null ? "NOT CHECKED" : studyStale ? "NOT CHECKED" : converged ? "CONVERGED" : "NOT CONVERGED" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Solver status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: solverKind })] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "toolNote",
								children: [
									analyticalKind,
									". ",
									femKind,
									". ",
									as4100Sheet,
									" This sheet is not a design certificate."
								]
							}),
							converged ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "okBanner",
								children: [
									"CONVERGED — last two meshes within ",
									tolPct,
									"%. This is a mesh check, not a code verification."
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: study == null ? "toolNote" : "failBanner",
								children: study == null ? `MESH CONVERGENCE NOT RUN. An FEM result is not verified until the last two meshes agree within ${tolPct}%.` : studyStale ? "CONVERGENCE STALE" : `NOT CONVERGED — last change is outside ${tolPct}%.`
							}),
							result?.ok ? result.warnings.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: line
							}, line)) : null,
							liveFem?.aspectWarning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: liveFem.aspectWarning
							}) : null,
							previewAspect != null && previewAspect > 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "toolNote",
								children: [
									"Preview element aspect ",
									previewAspect.toFixed(2),
									" is above 3. Add elements on the long side."
								]
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "toolPanel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Mesh" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "presetRow",
								children: [
									10,
									20,
									40,
									80
								].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: nxN === n && nyN === n ? "caseChip on" : "caseChip",
									onClick: () => {
										setNx(String(n));
										setNy(String(n));
									},
									children: [
										n,
										"×",
										n
									]
								}, n))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "fieldGrid compact",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Elements along a",
									value: nx,
									onChange: setNx
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Elements along b",
									value: ny,
									onChange: setNy
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "toolNote",
								children: nxN >= 2 && nyN >= 2 && nxN <= 80 && nyN <= 80 ? `${nxN * nyN} elements · ${(nxN + 1) * (nyN + 1)} nodes · ${(nxN + 1) * (nyN + 1) * 3} DOF` : "Mesh must be from 2×2 to 80×80."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Convergence tolerance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "toolSelect",
									value: convTol,
									onChange: (event) => setConvTol(event.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "2",
											children: "2%"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "1",
											children: "1%"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "0.5",
											children: "0.5%"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "toolToolbar",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "toolBtn",
										type: "button",
										disabled: busy !== "",
										onClick: runFem,
										children: busy === "SOLVING" ? "SOLVING" : "RUN FEM"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "toolBtn",
										type: "button",
										disabled: busy !== "",
										onClick: runStudy,
										children: busy === "CONVERGENCE" ? "RUNNING" : "RUN MESH CONVERGENCE"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "toolBtn",
										type: "button",
										disabled: busy !== "",
										onClick: runVerify,
										children: busy === "VERIFY" ? "RUNNING" : "RUN QUICK VERIFICATION"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "toolBtn",
										type: "button",
										disabled: busy !== "",
										onClick: runVerifyFull,
										children: busy === "VERIFY" ? "RUNNING" : "RUN FULL VERIFICATION"
									})
								]
							}),
							femError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "failBanner",
								children: femError
							}) : null
						]
					})]
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "toolPanel plateBottom",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "toolTabs",
					role: "tablist",
					children: DOCK.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: dock === item ? "on" : "",
						onClick: () => setDock(item),
						children: item
					}, item))
				}),
				dock === "TRACE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trace, {
					result,
					fem: liveFem,
					stiffeners,
					plateT: parsed.tMm ?? 0
				}) : null,
				dock === "FEM" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FemAudit, {
					fem: liveFem,
					stale
				}) : null,
				dock === "CONVERGENCE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Convergence, {
					study,
					stale: studyStale,
					tolerancePct: tolPct
				}) : null,
				dock === "SUBPANELS" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTable, {
					panels: sortedPanels,
					selected: selectedPanel,
					sort: panelSort,
					onSort: setPanelSort,
					femNote: liveFem ? "The FEM stress is one eigenvalue for the whole plate, not a separate solve for each panel." : "Run FEM for a whole-plate eigenvalue. It is not split into a fabricated per-panel FEM stress.",
					mode: modeClass,
					onSelect: (id) => {
						setSelectedPanel(id);
						setView("panels");
					}
				}) : null,
				dock === "STIFFENERS" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StiffenerTable, {
					items: stiffeners,
					plateT: parsed.tMm ?? 0,
					aMm: parsed.aMm ?? 0,
					bMm: parsed.bMm ?? 0,
					selected: selectedStiffener,
					onSelect: setSelectedStiffener
				}) : null,
				dock === "CODE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeTable, {
					rows: codeRows,
					method: designMethod,
					onMethod: setDesignMethod,
					onOpenDesign: () => {
						setDesignMethod("as4100");
						setDock("DESIGN");
					}
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { display: dock === "DESIGN" ? "block" : "none" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlateDesign, {
						panel: {
							aMm: parsed.aMm,
							bMm: parsed.bMm,
							tMm: parsed.tMm,
							fyMpa: parsed.fyMpa,
							fuMpa: parsed.fuMpa
						},
						elastic: liveFem ? {
							sigmaCrMpa: liveFem.modes[0]?.sigma1CrMpa ?? null,
							tauCrMpa: liveFem.modes[0]?.tauCrMpa ?? null,
							lambda: liveFem.modes[0]?.lambda ?? null
						} : null,
						onDesign: setDesign,
						onStatus: setAs4100Sheet
					})
				}),
				dock === "TRIAL ρ" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectivePane, {
					rho,
					setRho,
					preview: rhoPreview
				}) : null,
				dock === "CASES" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaseTable, {
					name: caseName,
					setName: setCaseName,
					cases,
					onDuplicate: duplicateCase,
					onDelete: (id) => setCases((list) => list.filter((item) => item.id !== id))
				}) : null,
				dock === "VERIFY" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifyTable, { rows: verifyRows }) : null
			]
		})
	] });
}
function Field({ label, value, onChange, hot, setHot, hint }) {
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
				onChange: (event) => onChange(event.target.value)
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: hint }) : null
		]
	});
}
function StiffenerEditor({ items, selected, onSelect, onHot, onAdd, onChange, onSeq, lengthUnit, stressUnit }) {
	const current = items.find((item) => item.id === selected) ?? items[0] ?? null;
	const per = lengthToMm(1, lengthUnit);
	function patchItem(id, partial) {
		onChange(items.map((item) => item.id === id ? {
			...item,
			...partial
		} : item));
	}
	function readLength(raw, fallback) {
		const n = num(raw);
		return n == null ? fallback : lengthToMm(n, lengthUnit);
	}
	function readStress(raw, fallback) {
		const n = num(raw);
		return n == null ? fallback : stressToMpa(n, stressUnit);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "toolPanel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Stiffeners" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "toolToolbar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "toolBtn",
					type: "button",
					onClick: () => onAdd("x"),
					children: "ADD LONGITUDINAL"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "toolBtn",
					type: "button",
					onClick: () => onAdd("y"),
					children: "ADD TRANSVERSE"
				})]
			}),
			items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "toolNote",
				children: "No stiffener. The plate is one panel."
			}) : null,
			items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: current?.id === item.id ? "caseChip on" : "caseChip",
				onMouseEnter: () => onHot(item.id),
				onMouseLeave: () => onHot(null),
				onClick: () => onSelect(item.id),
				children: [
					item.id,
					" ",
					item.axis === "x" ? "LONG" : "TRANS",
					" ",
					trimNum(mmToLength(item.atMm, lengthUnit), 3),
					" ",
					lengthUnit
				]
			}, item.id)),
			current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fieldGrid compact",
				style: { marginTop: 10 },
				onMouseEnter: () => onHot(current.id),
				onMouseLeave: () => onHot(null),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Orientation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "toolSelect",
							value: current.axis,
							onChange: (event) => patchItem(current.id, { axis: event.target.value }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "x",
								children: "Longitudinal, along x"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "y",
								children: "Transverse, along y"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: current.axis === "x" ? `y — ${lengthUnit}` : `x — ${lengthUnit}`,
						value: formatEntry(mmToLength(current.atMm, lengthUnit)),
						onChange: (value) => patchItem(current.id, { atMm: readLength(value, current.atMm) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Section" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "toolSelect",
							value: current.kind,
							onChange: (event) => patchItem(current.id, { kind: event.target.value }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "flat",
									children: "Flat bar"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "plate",
									children: "Plate"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "angle",
									children: "Angle"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "tee",
									children: "Tee"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "custom",
									children: "Custom"
								})
							]
						})]
					}),
					current.kind === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `A — ${lengthUnit}²`,
							value: formatEntry((current.customA ?? 0) / (per * per)),
							onChange: (value) => patchItem(current.id, { customA: (num(value) ?? 0) * per * per })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `I — ${lengthUnit}⁴`,
							value: formatEntry((current.customI ?? 0) / per ** 4),
							onChange: (value) => patchItem(current.id, { customI: (num(value) ?? 0) * per ** 4 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `J — ${lengthUnit}⁴`,
							value: formatEntry((current.customJ ?? 0) / per ** 4),
							onChange: (value) => patchItem(current.id, { customJ: (num(value) ?? 0) * per ** 4 })
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `h — ${lengthUnit}`,
							value: formatEntry(mmToLength(current.hMm, lengthUnit)),
							onChange: (value) => patchItem(current.id, { hMm: readLength(value, current.hMm) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `tw — ${lengthUnit}`,
							value: formatEntry(mmToLength(current.twMm, lengthUnit)),
							onChange: (value) => patchItem(current.id, { twMm: readLength(value, current.twMm) })
						}),
						current.kind === "angle" || current.kind === "tee" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `bf — ${lengthUnit}`,
							value: formatEntry(mmToLength(current.bfMm, lengthUnit)),
							onChange: (value) => patchItem(current.id, { bfMm: readLength(value, current.bfMm) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `tf — ${lengthUnit}`,
							value: formatEntry(mmToLength(current.tfMm, lengthUnit)),
							onChange: (value) => patchItem(current.id, { tfMm: readLength(value, current.tfMm) })
						})] }) : null
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `E — ${stressUnit}`,
						value: formatEntry(mpaToStress(current.eMpa, stressUnit)),
						onChange: (value) => patchItem(current.id, { eMpa: readStress(value, current.eMpa) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `fy — ${stressUnit}`,
						value: formatEntry(mpaToStress(current.fyMpa, stressUnit)),
						onChange: (value) => patchItem(current.id, { fyMpa: readStress(value, current.fyMpa) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Comparison" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "toolSelect",
							value: current.rigid ? "rigid" : "flex",
							onChange: (event) => patchItem(current.id, { rigid: event.target.value === "rigid" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "flex",
								children: "Flexible — entered EI, GJ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "rigid",
								children: "Rigid comparison — EI, GJ × 10000"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "toolToolbar",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "toolBtn",
							type: "button",
							onClick: () => {
								const id = onSeq();
								onChange([...items, {
									...current,
									id,
									atMm: current.atMm + 40
								}]);
								onSelect(id);
							},
							children: "DUPLICATE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "toolBtn",
							type: "button",
							onClick: () => {
								onChange(items.filter((item) => item.id !== current.id));
								onSelect(items.find((item) => item.id !== current.id)?.id ?? "");
							},
							children: "DELETE"
						})]
					})
				]
			}) : null
		]
	});
}
function StiffenerTable({ items, plateT, aMm, bMm, selected, onSelect }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "toolNote",
		children: "No stiffener. Subpanel geometry is the parent plate."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: "I is about the plate mid-surface, in canonical mm and N. The editor uses the selected units and converts at this boundary. J is Saint-Venant torsion, not warping. G uses ν = 0.3. A rigid comparison multiplies EI and GJ by 10000 inside the FEM only. EA is reported and is not an out-of-plane degree of freedom. A stiffener is not an infinitely rigid support merely because it exists."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Id" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Axis" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "At mm" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "A mm²" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "I mm⁴" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "J mm⁴" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "EA N" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "EI N·mm²" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "GJ N·mm²" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mass kg" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.map((item) => {
					const props = stiffenerProps(item, plateT);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: selected === item.id ? "rowOn" : "",
						onClick: () => onSelect(item.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [item.id, item.rigid ? " rigid" : ""] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.axis === "x" ? "Longitudinal" : "Transverse" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(item.atMm, 1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(props.areaMm2, 1) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(props.iMm4, 3) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(props.jMm4, 3) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(props.eaN, 3) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(props.eiNmm2, 3) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(props.gjNmm2, 3) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(stiffenerMassKg(props.areaMm2, item.axis === "x" ? aMm : bMm), 2) })
						]
					}, item.id);
				}) })]
			})
		}),
		items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [
				item.id,
				": ",
				stiffenerProps(item, plateT).note
			]
		}, item.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "okBanner",
			children: "GEOMETRIC SUBPANEL IDENTIFIED. STIFFENER DESIGN ADEQUATE: NOT VERIFIED. SUBPANEL EDGE ASSUMED FULLY RESTRAINED: NO."
		})
	] });
}
function PanelTable({ panels, selected, sort, onSort, femNote, mode, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: femNote
		}),
		panels.some((panel) => panel.status.includes("NOT VERIFIED")) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "okBanner",
			children: "GEOMETRIC SUBPANEL IDENTIFIED. STIFFENER DESIGN ADEQUATE: NOT VERIFIED. SUBPANEL EDGE ASSUMED FULLY RESTRAINED: NO."
		}) : null,
		mode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [
				"Eigenmode reading: ",
				mode.kind,
				mode.panelId ? ` · ${mode.panelId}` : "",
				". This is not a code rule and the smallest panel is not assumed to govern."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolToolbar",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => onSort(sort === "id" ? "stress" : "id"),
				children: sort === "id" ? "SORT BY σcr" : "SORT BY ID"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Panel" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "a" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "b" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "α" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "ψ" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "σ1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "σ2" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "τ" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Analytical σcr" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mode" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: panels.map((panel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: selected === panel.id ? "rowOn" : "",
					onClick: () => onSelect(panel.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: panel.id }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(panel.aMm, 1) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(panel.bMm, 1) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(panel.alpha, 3) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(panel.psi, 3) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(panel.sigmaBottom, 2) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(panel.sigmaTop, 2) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(panel.tau, 2) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: panel.closedForm && panel.sigmaCrMpa != null ? `${show(panel.sigmaCrMpa, 2)} MPa` : "NO CLOSED-FORM SOLUTION — FEM REQUIRED" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: mode?.panelId === panel.id ? mode.kind : panel.closedForm && panel.m != null ? `${panel.m}×${panel.n}` : "—" })
					]
				}, panel.id)) })]
			})
		})
	] });
}
function FemAudit({ fem, stale }) {
	if (stale) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "failBanner",
		children: "STALE — INPUTS CHANGED. RUN FEM AGAIN."
	});
	if (!fem?.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "toolNote",
		children: "Run FEM. The worker builds K and Kg, applies the edge restraints, and returns eigenvalues. Nothing is filled in before that."
	});
	const mode = fem.modes[0];
	const hx = mode && mode.w.length ? countHalfWaves(mode.w, fem.xs, fem.ys, "x") : null;
	const hy = mode && mode.w.length ? countHalfWaves(mode.w, fem.xs, fem.ys, "y") : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: `SOLVER DIAGNOSTICS — ${ELASTIC_ENGINE.id}` }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "First positive λ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mode ? show(mode.lambda, 4) : "—" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Iterations" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fem.iterations })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Solver tolerance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fem.solverTolerance.toExponential(0) })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Residual ||Kφ − λKgφ|| / ||Kφ||" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fem.residual.toExponential(2) })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Matrix size" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fem.dof })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Free DOF" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fem.freeDof })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mesh" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
					fem.nx,
					" × ",
					fem.ny
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Elements" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fem.elements })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nodes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fem.nodes })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Time" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [show(fem.seconds, 2), " s"] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Element aspect" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: show(fem.elementAspect, 2) })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mode 1 half-waves x × y" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hx == null ? "—" : `${hx} × ${hy}` })] })
			]
		}),
		fem.aspectWarning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: fem.aspectWarning
		}) : null,
		fem.residual > fem.solverTolerance ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [
				"Residual is above the ",
				fem.solverTolerance.toExponential(0),
				" target. The residual is shown, not hidden. A negative partner is not a second capacity."
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "okBanner",
			children: [
				"SOLVER STATUS — CONVERGED. Residual is within ",
				fem.solverTolerance.toExponential(0),
				"."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: fem.formulation
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: fem.note
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "SHOW FEM CONNECTIVITY" }),
		fem.stiffenerNotes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "No stiffener in this solve."
		}) : fem.stiffenerNotes.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: line
		}, line)),
		fem.prestressNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: fem.prestressNote
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "These rows are positive eigenvalues only, smallest first. A negative partner is the reversed membrane field. It is not listed here as a capacity."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mode" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "λ" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "λ · σ1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "λ · σy" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "λ · τ" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: fem.modes.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: index + 1 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(item.lambda, 4) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.sigma1CrMpa == null ? "—" : `${show(item.sigma1CrMpa, 2)} MPa` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.sigmaYCrMpa == null ? "—" : `${show(item.sigmaYCrMpa, 2)} MPa` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.tauCrMpa == null ? "—" : `${show(item.tauCrMpa, 2)} MPa` })
				] }, `${item.lambda}-${index}`)) })]
			})
		})
	] });
}
function Convergence({ study, stale, tolerancePct }) {
	if (!study) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "toolNote",
		children: [
			"RUN MESH CONVERGENCE solves 10, 20, 40 and 80 elements on the short side, with the long side increased so the element aspect stays nearer 1, capped at 80. Stiffener lines and patch ends stay in the mesh. CONVERGED means the last two critical values differ by less than ",
			tolerancePct,
			"%."
		]
	});
	const solved = study.rows.filter((row) => row.criticalMpa != null);
	const last = [...solved].reverse().find((row) => row.changePct != null)?.changePct ?? null;
	const ok = !stale && solved.length >= 2 && last != null && Math.abs(last) < tolerancePct;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		stale ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: "CONVERGENCE STALE — INPUTS CHANGED"
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: ok ? "okBanner" : "failBanner",
			children: stale ? "NOT CONVERGED — STALE" : ok ? `CONVERGED within ${tolerancePct}%` : `NOT CONVERGED within ${tolerancePct}%`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "toolNote",
			children: [study.note, " An FEM result is not verified without this check."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mesh" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Elements" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "DOF" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "λ1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Critical" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Change" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "MAC" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Waves" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Time" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: study.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
						row.nx,
						"×",
						row.ny
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.elements }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.freeDof }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(row.lambda, 4) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.criticalMpa == null ? row.status : show(row.criticalMpa, 2) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.changePct == null ? "—" : `${show(row.changePct, 2)}%` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.mac == null ? "—" : show(row.mac, 3) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.wavesX == null ? "—" : `${row.wavesX}×${row.wavesY}` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [show(row.seconds, 2), " s"] })
				] }, `${row.nx}x${row.ny}`)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvergencePlot, { rows: study.rows })
	] });
}
function ConvergencePlot({ rows }) {
	const pts = rows.filter((row) => row.criticalMpa != null);
	if (pts.length < 2) return null;
	const w = 640;
	const h = 180;
	const pad = 28;
	const min = Math.min(...pts.map((row) => row.criticalMpa));
	const max = Math.max(...pts.map((row) => row.criticalMpa));
	const span = Math.max(1e-9, max - min);
	const x = (i) => pad + i * 584 / Math.max(1, pts.length - 1);
	const y = (v) => 152 - (v - min) / span * 124;
	const d = pts.map((row, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(row.criticalMpa).toFixed(1)}`).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "convPlot",
		viewBox: `0 0 ${w} ${h}`,
		role: "img",
		"aria-label": "Critical stress against mesh density",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: pad,
				y: "16",
				fill: "#111",
				fontSize: "12",
				children: "CRITICAL STRESS vs MESH"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d,
				fill: "none",
				stroke: "#111",
				strokeWidth: "1.6"
			}),
			pts.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x(i),
				cy: y(row.criticalMpa),
				r: "3",
				fill: "#111"
			}, `${row.nx}-${row.ny}`))
		]
	});
}
function CodeTable({ rows, method, onMethod, onOpenDesign }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: "Choose the design standard. Elastic σcr and the FEM eigenvalue are not a design resistance. AS 4100 dimensions and results are entered on DESIGN."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "field",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Design standard" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: method,
				onChange: (event) => {
					onMethod(event.target.value);
					if (event.target.value === "as4100") onOpenDesign();
				},
				children: [
					["none", "NONE — ELASTIC ANALYSIS ONLY"],
					["as4100", "AS 4100"],
					["en1993", "EN 1993-1-5"],
					["as5224", "AS 5224 / ISO 20332"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: id,
					children: label
				}, id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolToolbar",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "toolBtn",
				onClick: onOpenDesign,
				children: "OPEN AS 4100 DESIGN"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "AS 4100 design inputs and results are in DESIGN. This table is the standard status only. It does not take plate dimensions. EN 1993-1-5 and AS 5224 are not part of this check."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("details", {
			className: "quietHelp",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Standard status table — not where dimensions are entered" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "toolTableWrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "toolTable",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Check" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Clause" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Equation" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Result" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
								row.group,
								": ",
								row.title
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.clause }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: STATUS[row.status] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.equation }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.result })
						] }, row.id)) })]
					})
				}),
				rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "toolNote",
					children: [
						row.title,
						": ",
						row.substitution,
						" ",
						row.note
					]
				}, `${row.id}-n`))
			]
		})
	] });
}
function EffectivePane({ rho, setRho, preview }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: "TRIAL ρ — NOT AS 4100 DESIGN. This hatch is a manual preview only."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: "MANUAL ρ — NOT AS 4100 DESIGN. Preview only."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "Trial ρ is a hatch preview. It is not the AS 4100 effective width be. That result is on DESIGN."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fieldGrid compact",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Trial ρ — not a code result",
				value: rho,
				onChange: setRho
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: preview == null ? "No preview until ρ is strictly between 0 and 1." : `Preview ρ = ${show(preview, 3)}. The drawing view TRIAL ρ shows the hatch. It is not be.`
		})
	] });
}
function CaseTable({ name, setName, cases, onDuplicate, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: "DUPLICATE CASE stores the current mass, classical stress and FEM stress. Change the plate, then duplicate again. Utilisation stays blank until a code check can return a number. Density 7850 kg/m³ is an assumed constant, not a grade table."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fieldGrid compact",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Case name",
				value: name,
				onChange: setName
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolToolbar",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "button",
				onClick: onDuplicate,
				children: "DUPLICATE CASE"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Case" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Plate kg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Stiffener kg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total kg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Classical" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "FEM" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Patch Fcr" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mode" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Utilisation" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: cases.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.name }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(row.plateKg, 2) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(row.stiffKg, 2) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: show(row.totalKg, 2) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.classicalMpa == null ? "—" : `${show(row.classicalMpa, 2)} MPa` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.femMpa == null ? "—" : `${show(row.femMpa, 2)} MPa` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.patchCrN == null ? "—" : `${show(row.patchCrN, 1)} N` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.mode }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.utilisation }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "toolBtn",
						onClick: () => onDelete(row.id),
						children: "DELETE"
					}) })
				] }, row.id)) })]
			})
		})
	] });
}
function VerifyTable({ rows }) {
	if (!rows) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "toolNote",
		children: "RUN QUICK VERIFICATION is V01–V20. RUN FULL VERIFICATION adds the aspect, ψ, shear-series, biaxial, combined-sign, stiffener-limit, patch-sweep and equilibrium rows. A pass is not a design certificate. Code patch resistance is not in this set."
	});
	const count = (status) => rows.filter((row) => row.status === status).length;
	const label = {
		pass: "PASS",
		fail: "FAIL",
		limited: "LIMITED",
		"not-verified": "NOT VERIFIED"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TOTAL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: rows.length })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PASS" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: count("pass") })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "FAIL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: count("fail") })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "LIMITED" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: count("limited") })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NOT VERIFIED" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: count("not-verified") })] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "toolNote",
			children: "PASS means that row met its own tolerance. LIMITED means the check ran but the basis is a fit, a residual floor, or not a code rule. NOT VERIFIED is not a pass. This button does not certify AS 4100, EN 1993-1-5 or AS 5224 resistance."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Test" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Expected" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Actual" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Difference" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Tolerance" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mesh" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Residual" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Basis" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
						row.id,
						" ",
						row.title
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.expected }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.actual }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.difference }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.tolerance }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.mesh }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.residual }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.basis }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: label[row.status] })
				] }, row.id)) })]
			})
		})
	] });
}
function Trace({ result, fem, stiffeners, plateT }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "toolTableWrap",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "toolTable",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Step" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Equation" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Substitution" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Result" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
				fem?.prestressNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Pre-buckling" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Plane stress, then Kg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: fem.formulation }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: fem.prestressNote })
				] }) : null,
				result?.ok ? result.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.label }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.equation }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: step.substitution }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: showStep(step.result) })
				] }, step.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Classical" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: result?.reason ?? "Waiting for inputs" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "—" })
				] }),
				stiffeners.map((item) => {
					const props = stiffenerProps(item, plateT);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [item.id, " section"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "A, I = ∫z² dA, J Saint-Venant. EA, EI and GJ follow." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
							item.kind,
							", h = ",
							item.hMm,
							" mm, tw = ",
							item.twMm,
							" mm, at ",
							item.atMm,
							" mm"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
							props.note,
							" A = ",
							show(props.areaMm2, 1),
							" mm², I = ",
							show(props.iMm4, 3),
							" mm⁴, EI = ",
							show(props.eiNmm2, 3),
							" N·mm²"
						] })
					] }, item.id);
				}),
				fem?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "FEM eigenvalue" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Kφ = λ Kgφ" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
						fem.formulation,
						" Mesh ",
						fem.nx,
						"×",
						fem.ny,
						", free DOF ",
						fem.freeDof,
						", residual ",
						fem.residual.toExponential(2),
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
						"λ1 = ",
						show(fem.modes[0]?.lambda ?? null, 4),
						" · σ1,cr = ",
						fem.modes[0]?.sigma1CrMpa == null ? "—" : `${show(fem.modes[0].sigma1CrMpa, 2)} MPa`
					] })
				] }) : null
			] })]
		})
	});
}
function PlatePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabShell, {
		kicker: "IQEG / PLATE STABILITY",
		title: "Plate and panel buckling.",
		lede: "Elastic critical stress for a rectangular panel, with a separate finite-element check. AS 4100 plate and web checks are on DESIGN, freeze IQ-PLB-AS4100-D1.0. That is a verified subset, not a complete member design.",
		ident: "IQ-CAL-PLB",
		rev: "REV 0",
		compact: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlateTool, {})
	});
}
//#endregion
export { PlatePage as component };
