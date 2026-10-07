import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Route$3 } from "./router-BMFUPfxq.mjs";
import { n as LabShell } from "./lab-shell-Dd_RI9Uq.mjs";
import { m as parseBoltQuery, n as CommandBar } from "./command-bar-yTks2oVM.mjs";
import { n as DEFAULT_SELECTION, r as selectionFromQuery, t as BoltTool } from "./bolt-tool-C-fhZSYs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bolts-DXEfveuP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BoltsPage() {
	const { q } = Route$3.useSearch();
	const query = (0, import_react.useMemo)(() => q ? parseBoltQuery(q) : null, [q]);
	const resolved = (0, import_react.useMemo)(() => {
		if (!query?.matched) return {
			selection: DEFAULT_SELECTION,
			warn: query ? "No bolt matched that search." : ""
		};
		const next = selectionFromQuery(query);
		if ("error" in next) return {
			selection: DEFAULT_SELECTION,
			warn: next.error
		};
		return {
			selection: next,
			warn: ""
		};
	}, [query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LabShell, {
		kicker: "IQEG / ENGINEERING REFERENCE",
		title: "Bolt and fastener reference.",
		lede: "Look up a bolt, then run the AS 4100 check only if you need it. The check is written in words: what you apply, where the shear cuts the bolt, and whether the plate is included. Classes 4.6, 8.8 and 10.9 only.",
		ident: "IQ-REF-001",
		rev: "REV 0 · INDICATIVE",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandBar, { initial: q ?? "" }),
			resolved.warn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "failBanner",
				children: resolved.warn
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoltTool, {
				start: resolved.selection,
				query
			})
		]
	});
}
//#endregion
export { BoltsPage as component };
