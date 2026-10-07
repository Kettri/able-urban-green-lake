import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$1 } from "./router-BMFUPfxq.mjs";
import { a as parseStrictNumber, l as unitsInCategory, n as LabShell, t as CATEGORIES } from "./lab-shell-Dd_RI9Uq.mjs";
import { h as parseQuantity, n as CommandBar } from "./command-bar-yTks2oVM.mjs";
import { n as convert, r as incompatibility, t as ConvertError } from "./converter-CpIW05mk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/units-DG1ICbhV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatValue(value, sig, notation) {
	if (!Number.isFinite(value)) return "—";
	const figures = Math.min(8, Math.max(1, sig));
	if (value === 0) return notation === "fixed" ? 0 .toFixed(figures) : "0";
	const sign = value < 0 ? "-" : "";
	const abs = Math.abs(value);
	if (notation === "fixed") return sign + abs.toFixed(figures);
	if (notation === "sci") {
		const exp = Math.floor(Math.log10(abs));
		return `${sign}${(abs / 10 ** exp).toFixed(Math.max(0, figures - 1))}e${exp}`;
	}
	let exp = Math.floor(Math.log10(abs));
	if (!Number.isFinite(exp)) return "—";
	const eng = Math.floor(exp / 3) * 3;
	const mant = abs / 10 ** eng;
	const decimals = Math.max(0, figures - Math.floor(Math.log10(mant)) - 1);
	const body = mant.toFixed(decimals);
	if (eng === 0) return sign + body;
	return `${sign}${body}e${eng}`;
}
/** Enough digits to round-trip typical engineering values back through parse. */
function precise(value) {
	if (!Number.isFinite(value)) return "";
	if (value === 0) return "0";
	return value.toPrecision(12).replace(/\.?0+e/, "e").replace(/\.?0+$/, "");
}
var FAV_KEY = "iqeg-ref-unit-favs";
var RECENT_KEY = "iqeg-ref-unit-recent";
var DEFAULT_FAVS = [
	"pressure",
	"force",
	"vol-flow",
	"power",
	"density",
	"angular",
	"area-inertia",
	"section-modulus",
	"length"
];
var SIGS = [
	2,
	3,
	4,
	5,
	6,
	8
];
function UnitTool({ initialQuery }) {
	const [categoryId, setCategoryId] = (0, import_react.useState)("pressure");
	const [activeId, setActiveId] = (0, import_react.useState)("pressure:MPa");
	const [text, setText] = (0, import_react.useState)("1");
	const [notation, setNotation] = (0, import_react.useState)("eng");
	const [sig, setSig] = (0, import_react.useState)(4);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [favs, setFavs] = (0, import_react.useState)(DEFAULT_FAVS);
	const [recent, setRecent] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			const saved = localStorage.getItem(FAV_KEY);
			if (saved) setFavs(JSON.parse(saved));
			const rec = localStorage.getItem(RECENT_KEY);
			if (rec) setRecent(JSON.parse(rec));
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!initialQuery) return;
		applySmart(initialQuery);
	}, [initialQuery]);
	const units = unitsInCategory(categoryId);
	const active = units.find((unit) => unit.id === activeId) ?? units[0];
	const parsed = (0, import_react.useMemo)(() => {
		if (!active) return {
			ok: false,
			message: "Unknown unit."
		};
		try {
			return {
				ok: true,
				value: parseStrictNumber(text)
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Invalid number."
			};
		}
	}, [text, active]);
	(0, import_react.useEffect)(() => {
		if (!parsed.ok || !active) return;
		const handle = window.setTimeout(() => {
			try {
				const line = `${formatValue(parsed.value, sig, notation)} ${active.symbol}`;
				setRecent((prev) => {
					const next = [line, ...prev.filter((item) => item !== line)].slice(0, 8);
					localStorage.setItem(RECENT_KEY, JSON.stringify(next));
					return next;
				});
			} catch {}
		}, 600);
		return () => window.clearTimeout(handle);
	}, [
		parsed,
		active,
		sig,
		notation
	]);
	function applySmart(raw) {
		try {
			const hit = parseQuantity(raw);
			if (!hit) {
				setError("Unknown unit.");
				return;
			}
			setError("");
			setCategoryId(hit.unit.category);
			setActiveId(hit.to?.id && hit.to.category === hit.unit.category ? hit.unit.id : hit.unit.id);
			setText(String(hit.value));
			if (hit.to && hit.to.category !== hit.unit.category) {
				const why = incompatibility(hit.unit, hit.to);
				setError(why ?? "Those units are not in the same table.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Invalid number.");
		}
	}
	function converted(unit) {
		if (!parsed.ok || !active) return "—";
		try {
			return formatValue(convert(parsed.value, active.id, unit.id), sig, notation);
		} catch (err) {
			return err instanceof ConvertError ? "—" : "—";
		}
	}
	function activate(unit) {
		if (!parsed.ok || !active) {
			setActiveId(unit.id);
			return;
		}
		try {
			const value = convert(parsed.value, active.id, unit.id);
			setActiveId(unit.id);
			setText(precise(value));
			setError("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Invalid conversion.");
		}
	}
	function toggleFav(id) {
		setFavs((prev) => {
			const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
			localStorage.setItem(FAV_KEY, JSON.stringify(next));
			return next;
		});
	}
	const shownCats = CATEGORIES.filter((cat) => {
		const q = filter.trim().toLowerCase();
		if (!q) return true;
		return cat.label.toLowerCase().includes(q) || cat.group.toLowerCase().includes(q);
	});
	let group = "";
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
						children: "Unit conversion"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tbMeta",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "IQ-REF-002" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "REV 0 · INDICATIVE" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NOT A CERTIFICATE" })
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "command",
			onSubmit: (event) => {
				event.preventDefault();
				applySmart(event.currentTarget.elements.namedItem("smart").value);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				name: "smart",
				className: "refSearch",
				placeholder: "350 MPa to psi    ·    7850 kg/m3    ·    1450 rpm",
				"aria-label": "Convert a written quantity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "toolBtn",
				type: "submit",
				children: "CONVERT"
			})]
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "failBanner",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "topicChips",
			children: favs.map((id) => {
				const cat = CATEGORIES.find((item) => item.id === id);
				if (!cat) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: categoryId === id ? "on" : "",
					onClick: () => {
						setCategoryId(id);
						const first = unitsInCategory(id)[0];
						if (first) setActiveId(first.id);
					},
					children: cat.label
				}, id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "toolLayout",
			style: { marginTop: 14 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "toolPanel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "What to convert" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "toolField",
							placeholder: "Find a quantity, such as stress",
							"aria-label": "Filter quantities",
							value: filter,
							onChange: (e) => setFilter(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "catList",
							style: { marginTop: 10 },
							children: shownCats.map((cat) => {
								const head = cat.group !== group;
								group = cat.group;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [head ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "groupLabel",
									style: {
										display: "block",
										padding: "8px 12px 0"
									},
									children: cat.group
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: cat.id === categoryId ? "on" : "",
									onClick: () => {
										setCategoryId(cat.id);
										const first = unitsInCategory(cat.id)[0];
										if (first) setActiveId(first.id);
										setError("");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: cat.group }), cat.label]
								})] }, cat.id);
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "toolPanel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Your number" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "identity",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: CATEGORIES.find((c) => c.id === categoryId)?.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: CATEGORIES.find((c) => c.id === categoryId)?.blurb })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VALUE" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "toolField",
								value: text,
								onChange: (e) => {
									setText(e.target.value);
									setError("");
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "BASELINE UNIT" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "toolSelect",
								"aria-label": "Baseline unit",
								value: active?.id ?? "",
								onChange: (e) => {
									const unit = units.find((item) => item.id === e.target.value);
									if (unit) activate(unit);
								},
								children: units.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: unit.id,
									children: [
										unit.symbol,
										" — ",
										unit.name
									]
								}, unit.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "fieldGrid",
							style: { marginTop: 10 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NOTATION" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "toolSelect",
									value: notation,
									onChange: (e) => setNotation(e.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "eng",
											children: "Engineering"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "sci",
											children: "Scientific"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "fixed",
											children: "Fixed decimal"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: notation === "fixed" ? "DECIMAL PLACES" : "SIGNIFICANT FIGURES" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "toolSelect",
									value: sig,
									onChange: (e) => setSig(Number(e.target.value)),
									children: SIGS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: n,
										children: n
									}, n))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "toolToolbar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "toolBtn ghost",
								type: "button",
								onClick: () => toggleFav(categoryId),
								children: favs.includes(categoryId) ? "REMOVE FROM BAR" : "PIN TO BAR"
							})
						}),
						recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "groupLabel",
							children: "RECENT"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "recent",
							children: recent.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
						})] }) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "toolPanel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Converted values" }),
						units.map((unit) => {
							const value = unit.id === active?.id && parsed.ok ? formatValue(parsed.value, sig, notation) : converted(unit);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: unit.id === active?.id ? "unitRow active" : "unitRow",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: unit.symbol }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										"aria-label": unit.name,
										value: unit.id === active?.id ? text : value,
										onFocus: () => {
											if (unit.id !== active?.id) activate(unit);
										},
										onChange: (e) => {
											setActiveId(unit.id);
											setText(e.target.value);
											setError("");
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "copyBtn",
										type: "button",
										onClick: () => void navigator.clipboard.writeText(value),
										children: "COPY"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "copyBtn",
										type: "button",
										onClick: () => void navigator.clipboard.writeText(`${value} ${unit.symbol}`),
										children: "WITH UNIT"
									})
								]
							}, unit.id);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "toolNote",
							children: "The baseline unit is the one selected above. Changing it keeps the same physical quantity and rewrites the number. Any row can also become the baseline. Display rounding is not stored. US gallon and Imperial gallon are different."
						})
					]
				})
			]
		})
	] });
}
function UnitsPage() {
	const { q } = Route$1.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LabShell, {
		kicker: "IQEG / ENGINEERING REFERENCE",
		title: "Unit converter.",
		lede: "Type a value in any row, or a line such as 350 MPa to psi. Every other unit in that quantity updates. Temperature includes the offset. A unit from a different quantity is refused.",
		ident: "IQ-REF-002",
		rev: "REV 0 · INDICATIVE",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandBar, { initial: q ?? "" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitTool, { initialQuery: q ?? "" })]
	});
}
//#endregion
export { UnitsPage as component };
