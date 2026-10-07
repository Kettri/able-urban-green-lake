import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as LabShell, u as useLabQuery } from "./lab-shell-Dd_RI9Uq.mjs";
import { n as CommandBar } from "./command-bar-yTks2oVM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CYVzIwMt.js
var import_jsx_runtime = require_jsx_runtime();
/** Future rows are a library map only. They are not calculators. */
var LAB_MODULES = [
	{
		id: "IQ-CAL-PLB",
		title: "Plate and web buckling",
		summary: "Elastic critical stress, half-wave search, and a separate finite-element eigenvalue check. Code resistance is not enabled.",
		group: "Plate",
		status: "live",
		href: "/plate"
	},
	{
		id: "IQ-REF-014",
		title: "Thread reference",
		summary: "Stand-alone thread tables beyond the bolt record.",
		group: "Fasteners",
		status: "later"
	},
	{
		id: "IQ-REF-017",
		title: "Fastener tightening",
		summary: "Torque, preload and k-factor.",
		group: "Fasteners",
		status: "later"
	},
	{
		id: "IQ-REF-002",
		title: "Universal unit converter",
		summary: "Type one value. The rest of that quantity converts. A mismatched dimension is refused.",
		group: "Desk",
		status: "live",
		href: "/units"
	},
	{
		id: "IQ-REF-012",
		title: "Engineering constants",
		summary: "g, π, E, densities used as named constants.",
		group: "Desk",
		status: "later"
	},
	{
		id: "IQ-REF-003",
		title: "Steel material properties",
		summary: "Plate and section grades.",
		group: "Materials",
		status: "later"
	},
	{
		id: "IQ-REF-018",
		title: "Material density",
		summary: "Density database.",
		group: "Materials",
		status: "later"
	},
	{
		id: "IQ-REF-004",
		title: "Structural steel sections",
		summary: "Catalogue properties.",
		group: "Section",
		status: "later"
	},
	{
		id: "IQ-REF-016",
		title: "Standard plate sizes",
		summary: "Sheet and plate list.",
		group: "Section",
		status: "later"
	},
	{
		id: "IQ-REF-005",
		title: "Weld reference",
		summary: "Fillet and butt geometry.",
		group: "Connection",
		status: "later"
	},
	{
		id: "IQ-REF-006",
		title: "Pipe schedules",
		summary: "NPS and DN wall.",
		group: "Plant",
		status: "later"
	},
	{
		id: "IQ-REF-007",
		title: "Flange reference",
		summary: "Facing and drilling.",
		group: "Plant",
		status: "later"
	},
	{
		id: "IQ-REF-008",
		title: "Bearings",
		summary: "Boundary dimensions.",
		group: "Machine",
		status: "later"
	},
	{
		id: "IQ-REF-009",
		title: "Shaft and key",
		summary: "Key seats and fits.",
		group: "Machine",
		status: "later"
	},
	{
		id: "IQ-REF-010",
		title: "Springs",
		summary: "Wire and rate.",
		group: "Machine",
		status: "later"
	},
	{
		id: "IQ-REF-011",
		title: "Crane components",
		summary: "Wheels, rails, hooks.",
		group: "Plant",
		status: "later"
	},
	{
		id: "IQ-REF-013",
		title: "Wire rope",
		summary: "Construction and mass.",
		group: "Plant",
		status: "later"
	},
	{
		id: "IQ-REF-015",
		title: "Tolerances and fits",
		summary: "Hole basis classes.",
		group: "Machine",
		status: "later"
	},
	{
		id: "IQ-REF-019",
		title: "Surface finish",
		summary: "Ra and process.",
		group: "Machine",
		status: "later"
	},
	{
		id: "IQ-REF-020",
		title: "Fluid properties",
		summary: "Density and viscosity.",
		group: "Plant",
		status: "later"
	}
];
function Home() {
	const { embed } = useLabQuery();
	const groups = [...new Set(LAB_MODULES.map((item) => item.group))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LabShell, {
		kicker: "IQEG ENGINEERING REFERENCE LAB",
		title: "Engineering reference.",
		lede: "Three working tools. Plate buckling: elastic critical stress, with a separate finite-element check. Bolts: thread, strength, mass, and an optional AS 4100 check. Units: one number fills the table, and a mismatched dimension is refused. Indicative — not a certificate.",
		ident: "IQ-CAL-PLB — IQ-REF-002",
		rev: "REV 0 · INDICATIVE",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "calRegister",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "OPEN" }), LAB_MODULES.filter((item) => item.status === "live").map((item) => {
					const search = embed ? { embed: "1" } : void 0;
					const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.id }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.summary })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "OPEN" })
					] });
					if (item.href === "/plate") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/plate",
						search,
						className: "calRow",
						children: body
					}, item.id);
					if (item.href === "/bolts") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/bolts",
						search,
						className: "calRow",
						children: body
					}, item.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/units",
						search,
						className: "calRow",
						children: body
					}, item.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "planned",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "PLANNED REFERENCES — NOT BUILT" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "calRegister",
					children: groups.filter((group) => LAB_MODULES.some((item) => item.group === group && item.status === "later")).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: group }), LAB_MODULES.filter((item) => item.group === group && item.status === "later").map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "calRow later",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.id }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.summary })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "NOT BUILT" })
						]
					}, item.id))] }, group))
				})]
			})
		]
	});
}
//#endregion
export { Home as component };
