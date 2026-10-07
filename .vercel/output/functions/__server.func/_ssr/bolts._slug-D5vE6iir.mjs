import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route } from "./router-BMFUPfxq.mjs";
import { n as LabShell } from "./lab-shell-Dd_RI9Uq.mjs";
import { n as CommandBar } from "./command-bar-yTks2oVM.mjs";
import { i as selectionFromSlug, n as DEFAULT_SELECTION, t as BoltTool } from "./bolt-tool-C-fhZSYs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bolts._slug-D5vE6iir.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BoltSlugPage() {
	const { slug } = Route.useParams();
	const resolved = (0, import_react.useMemo)(() => {
		const next = selectionFromSlug(slug);
		if ("error" in next) return {
			selection: DEFAULT_SELECTION,
			warn: next.error
		};
		return {
			selection: next,
			warn: ""
		};
	}, [slug]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LabShell, {
		kicker: "IQEG / ENGINEERING REFERENCE",
		title: "Bolt and fastener reference.",
		lede: "Direct link to one bolt. Confirm the standard before you use the number.",
		ident: "IQ-REF-001",
		rev: "REV 0 · INDICATIVE",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandBar, {}),
			resolved.warn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "failBanner",
				children: resolved.warn
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoltTool, {
				start: resolved.selection,
				query: null
			})
		]
	});
}
//#endregion
export { BoltSlugPage as component };
