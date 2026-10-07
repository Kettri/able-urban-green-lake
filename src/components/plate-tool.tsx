// @ts-nocheck
import { useEffect, useMemo, useState } from "react"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import { PlateDrawing } from "./plate-drawing.tsx"
import { ModeView } from "./mode-view.tsx"
import { trimNum } from "../reference/format.ts"
import { classicalPlate } from "../plate/classical.ts"
import { previewMesh, solvePlateFem, studyGrids, countHalfWaves } from "../plate/fem.ts"
import { patchInterval } from "../plate/prestress.ts"
import { newStiffener, plateMassKg, stiffenerMassKg, stiffenerProps } from "../plate/stiffeners.ts"
import { buildPanels, classifyMode } from "../plate/subpanels.ts"
import { designChecks } from "../plate/codes/dispatch.ts"
import { PlateDesign } from "./plate-design.tsx"
import { ELASTIC_ENGINE } from "../plate/version.ts"
import {
  FORCE_UNITS, LENGTH_UNITS, STRESS_UNITS,
  forceToN, formatEntry, lengthToMm, mmToLength, mpaToStress, nPerMmToStiffness, nToForce, stiffnessToNPerMm, stressToMpa,
} from "../plate/units.ts"

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
	if (abs !== 0 && (abs >= 1e5 || abs < 1e-3)) return n.toExponential(4);
	const digits = abs >= 100 ? 2 : abs >= 10 ? 3 : abs >= 1 ? 4 : 6;
	return trimNum(n, digits);
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
	const [a, setA] = useState("2000");
	const [b, setB] = useState("1000");
	const [t, setT] = useState("10");
	const [e, setE] = useState("210000");
	const [nu, setNu] = useState("0.3");
	const [fy, setFy] = useState("350");
	const [fu, setFu] = useState("480");
	const [s1, setS1] = useState("100");
	const [psi, setPsi] = useState("1");
	const [tau, setTau] = useState("0");
	const [sy, setSy] = useState("0");
	const [kr, setKr] = useState("0");
	const [edges, setEdges] = useState({ ...SS });
	const [hot, setHot] = useState(null);
	const [view, setView] = useState("geometry");
	const [designMethod, setDesignMethod] = useState("none");
	const [design, setDesign] = useState({});
	const [nx, setNx] = useState("12");
	const [ny, setNy] = useState("12");
	const [fem, setFem] = useState(null);
	const [femKey, setFemKey] = useState("");
	const [busy, setBusy] = useState("");
	const [femError, setFemError] = useState("");
	const [modeIndex, setModeIndex] = useState(0);
	const [stiffeners, setStiffeners] = useState([]);
	const [seq, setSeq] = useState(1);
	const [selectedStiffener, setSelectedStiffener] = useState(null);
	const [selectedPanel, setSelectedPanel] = useState(null);
	const [panelSort, setPanelSort] = useState("id");
	const [patchOn, setPatchOn] = useState(false);
	const [patchEdge, setPatchEdge] = useState("y1");
	const [patchF, setPatchF] = useState("10000");
	const [patchSs, setPatchSs] = useState("250");
	const [patchAt, setPatchAt] = useState("1000");
	const [lengthUnit, setLengthUnit] = useState("mm");
	const [stressUnit, setStressUnit] = useState("MPa");
	const [forceUnit, setForceUnit] = useState("N");
	const [convTol, setConvTol] = useState("1");
	const [rho, setRho] = useState("");
	const [study, setStudy] = useState(null);
	const [studyKey, setStudyKey] = useState("");
	const [verifyRows, setVerifyRows] = useState(null);
	const [cases, setCases] = useState([]);
	const [casesReady, setCasesReady] = useState(false);
	const [caseName, setCaseName] = useState("CASE A");
	const [leftOpen, setLeftOpen] = useState(true);
	const [rightOpen, setRightOpen] = useState(true);
	const [as4100Sheet, setAs4100Sheet] = useState("AS 4100 plate check not started. Elastic σcr is not a design resistance.");
	const [dock, setDock] = useState("TRACE");
	useEffect(() => {
		try {
			const raw = localStorage.getItem("iq-cal-plb-cases");
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) setCases(parsed);
			}
		} catch {}
		setCasesReady(true);
	}, []);
	useEffect(() => {
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
	const result = useMemo(() => {
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
	const panels = useMemo(() => {
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
	const meshPreview = useMemo(() => {
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
	const modeClass = useMemo(() => {
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
	const codeRows = useMemo(() => {
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("div", {
			className: "presetRow",
			children: [
				["A", "TEST A SQUARE"],
				["B", "TEST B SHEAR"],
				["C", "TEST C BENDING"],
				["D", "TEST D LONG"]
			].map(([id, label]) => /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "caseChip",
				onClick: () => applyPreset(id),
				children: label
			}, id))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "toolToolbar",
			children: [/* @__PURE__ */ jsx("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => setLeftOpen((v) => !v),
				children: leftOpen ? "HIDE INPUTS" : "SHOW INPUTS"
			}), /* @__PURE__ */ jsx("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => setRightOpen((v) => !v),
				children: rightOpen ? "HIDE RESULTS" : "SHOW RESULTS"
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: desk,
			children: [
				leftOpen ? /* @__PURE__ */ jsxs("div", {
					className: "plateCol",
					children: [
						/* @__PURE__ */ jsxs("section", {
							className: "toolPanel",
							children: [
								/* @__PURE__ */ jsx("h2", { children: "Geometry" }),
								/* @__PURE__ */ jsx("p", {
									className: "toolNote",
									style: { marginTop: 0 },
									children: "The solver stays in millimetres, newtons and MPa. Changing a unit rescales the numbers so the physical plate does not change."
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "fieldGrid compact",
									children: [
										/* @__PURE__ */ jsxs("label", {
											className: "field",
											children: [/* @__PURE__ */ jsx("span", { children: "Length" }), /* @__PURE__ */ jsx("select", {
												className: "toolSelect",
												value: lengthUnit,
												onChange: (event) => onLengthUnit(event.target.value),
												children: LENGTH_UNITS.map((unit) => /* @__PURE__ */ jsx("option", {
													value: unit,
													children: unit
												}, unit))
											})]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "field",
											children: [/* @__PURE__ */ jsx("span", { children: "Stress / E" }), /* @__PURE__ */ jsx("select", {
												className: "toolSelect",
												value: stressUnit,
												onChange: (event) => onStressUnit(event.target.value),
												children: STRESS_UNITS.map((unit) => /* @__PURE__ */ jsx("option", {
													value: unit,
													children: unit
												}, unit))
											})]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "field",
											children: [/* @__PURE__ */ jsx("span", { children: "Force" }), /* @__PURE__ */ jsx("select", {
												className: "toolSelect",
												value: forceUnit,
												onChange: (event) => onForceUnit(event.target.value),
												children: FORCE_UNITS.map((unit) => /* @__PURE__ */ jsx("option", {
													value: unit,
													children: unit
												}, unit))
											})]
										}),
										/* @__PURE__ */ jsx(Field, {
											label: `a — ${lengthUnit}`,
											value: a,
											onChange: setA,
											hot: "a",
											setHot
										}),
										/* @__PURE__ */ jsx(Field, {
											label: `b — ${lengthUnit}`,
											value: b,
											onChange: setB,
											hot: "b",
											setHot
										}),
										/* @__PURE__ */ jsx(Field, {
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
						/* @__PURE__ */ jsxs("section", {
							className: "toolPanel",
							children: [
								/* @__PURE__ */ jsx("h2", { children: "Material" }),
								/* @__PURE__ */ jsx("p", {
									className: "toolNote",
									style: { marginTop: 0 },
									children: "Enter E, ν, fy and fu. No steel-grade table is embedded."
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "fieldGrid compact",
									children: [
										/* @__PURE__ */ jsx(Field, {
											label: `E — ${stressUnit}`,
											value: e,
											onChange: setE
										}),
										/* @__PURE__ */ jsx(Field, {
											label: "ν",
											value: nu,
											onChange: setNu
										}),
										/* @__PURE__ */ jsx(Field, {
											label: `fy — ${stressUnit}`,
											value: fy,
											onChange: setFy
										}),
										/* @__PURE__ */ jsx(Field, {
											label: `fu — ${stressUnit}`,
											value: fu,
											onChange: setFu
										})
									]
								})
							]
						}),
						/* @__PURE__ */ jsxs("section", {
							className: "toolPanel",
							children: [/* @__PURE__ */ jsx("h2", { children: "Edges" }), /* @__PURE__ */ jsxs("div", {
								className: "fieldGrid compact",
								children: [EDGE_FIELDS.map((edge) => /* @__PURE__ */ jsxs("label", {
									className: "field",
									onMouseEnter: () => setHot(edge.hot),
									onMouseLeave: () => setHot(null),
									children: [/* @__PURE__ */ jsx("span", { children: edge.label }), /* @__PURE__ */ jsxs("select", {
										className: "toolSelect",
										value: edges[edge.key],
										onChange: (event) => setEdges((prev) => ({
											...prev,
											[edge.key]: event.target.value
										})),
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "ss",
												children: "Simply supported"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "fixed",
												children: "Fixed"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "free",
												children: "Free"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "elastic",
												children: "Elastic rotation"
											})
										]
									})]
								}, edge.key)), /* @__PURE__ */ jsx(Field, {
									label: `kθ — ${forceUnit}/rad per ${lengthUnit}`,
									value: kr,
									onChange: setKr,
									hint: "FEM rotational spring only. Canonical stiffness is N/mm."
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("section", {
							className: "toolPanel",
							children: [/* @__PURE__ */ jsx("h2", { children: "Stress" }), /* @__PURE__ */ jsxs("div", {
								className: "fieldGrid compact",
								children: [
									/* @__PURE__ */ jsx(Field, {
										label: `σ1 at y = 0 — ${stressUnit}`,
										value: s1,
										onChange: editDirect(setS1),
										hot: "sx",
										setHot
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "ψ = σ2 / σ1",
										value: psi,
										onChange: editDirect(setPsi),
										hot: "sx",
										setHot
									}),
									/* @__PURE__ */ jsx(Field, {
										label: `τxy — ${stressUnit}`,
										value: tau,
										onChange: editDirect(setTau),
										hot: "tau",
										setHot
									}),
									/* @__PURE__ */ jsx(Field, {
										label: `σy — ${stressUnit}`,
										value: sy,
										onChange: editDirect(setSy),
										hint: "Uniform. Positive is compression."
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("section", {
							className: "toolPanel",
							children: [
								/* @__PURE__ */ jsx("h2", { children: "Patch load" }),
								/* @__PURE__ */ jsxs("label", {
									className: "field",
									children: [/* @__PURE__ */ jsx("span", { children: "Patch load" }), /* @__PURE__ */ jsxs("select", {
										className: "toolSelect",
										value: patchOn ? "on" : "off",
										onChange: (event) => {
											setPatchOn(event.target.value === "on");
											setView("geometry");
										},
										children: [/* @__PURE__ */ jsx("option", {
											value: "off",
											children: "Off"
										}), /* @__PURE__ */ jsx("option", {
											value: "on",
											children: "On — edge traction"
										})]
									})]
								}),
								patchOn ? /* @__PURE__ */ jsxs(Fragment, { children: [
									/* @__PURE__ */ jsx("p", {
										className: "toolNote",
										style: { marginTop: 0 },
										children: "Uniform normal force on one edge. Positive pushes into the plate. This is the applied load, not a buckling resistance and not a code check. Eccentricity is not supported."
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "fieldGrid compact",
										children: [
											/* @__PURE__ */ jsxs("label", {
												className: "field",
												children: [/* @__PURE__ */ jsx("span", { children: "Loaded edge" }), /* @__PURE__ */ jsxs("select", {
													className: "toolSelect",
													value: patchEdge,
													onChange: (event) => setPatchEdge(event.target.value),
													children: [
														/* @__PURE__ */ jsx("option", {
															value: "y1",
															children: "y = b"
														}),
														/* @__PURE__ */ jsx("option", {
															value: "y0",
															children: "y = 0"
														}),
														/* @__PURE__ */ jsx("option", {
															value: "x0",
															children: "x = 0"
														}),
														/* @__PURE__ */ jsx("option", {
															value: "x1",
															children: "x = a"
														})
													]
												})]
											}),
											/* @__PURE__ */ jsx(Field, {
												label: `F — ${forceUnit}`,
												value: patchF,
												onChange: setPatchF,
												hint: "Compression into the plate is positive."
											}),
											/* @__PURE__ */ jsx(Field, {
												label: `ss — ${lengthUnit}`,
												value: patchSs,
												onChange: setPatchSs,
												hint: "Loaded length. 1 kN/m = 1 N/mm."
											}),
											/* @__PURE__ */ jsx(Field, {
												label: patchEdge === "x0" || patchEdge === "x1" ? `Centre y — ${lengthUnit}` : `Centre x — ${lengthUnit}`,
												value: patchAt,
												onChange: setPatchAt
											})
										]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "failBanner",
										children: "CODE PATCH RESISTANCE: VERIFIED STANDARD DATA REQUIRED"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "toolNote",
										children: "ECCENTRIC PATCH — NOT IMPLEMENTED. POINT FORCE — NOT IMPLEMENTED. NON-UNIFORM PATCH DISTRIBUTION — NOT IMPLEMENTED. GMNIA — NOT IMPLEMENTED."
									}),
									patchIssue ? /* @__PURE__ */ jsxs("p", {
										className: "failBanner",
										children: [patchIssue, " The eigenvalue will not run on this patch."]
									}) : null,
									/* @__PURE__ */ jsx("p", {
										className: "toolNote",
										children: "The FEM uses a plane-stress pre-buckling solve. λ·F is an elastic critical force, not a design resistance. Distribution is uniform. A point force is not offered."
									})
								] }) : /* @__PURE__ */ jsx("p", {
									className: "toolNote",
									children: "No patch. The membrane field is the σx, σy and τxy you enter. ECCENTRIC PATCH — NOT IMPLEMENTED. POINT FORCE — NOT IMPLEMENTED. NON-UNIFORM PATCH DISTRIBUTION — NOT IMPLEMENTED. GMNIA — NOT IMPLEMENTED."
								})
							]
						}),
						/* @__PURE__ */ jsx(StiffenerEditor, {
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
				/* @__PURE__ */ jsxs("section", {
					className: "toolPanel plateStage",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "toolTabs",
							role: "tablist",
							children: VIEWS.map((item) => /* @__PURE__ */ jsx("button", {
								type: "button",
								className: view === item.id ? "on" : "",
								onClick: () => setView(item.id),
								children: item.label
							}, item.id))
						}),
						view === "mode" ? /* @__PURE__ */ jsx(ModeView, {
							xs: liveFem?.xs ?? [],
							ys: liveFem?.ys ?? [],
							modes: liveFem?.modes ?? [],
							modeIndex,
							onMode: setModeIndex
						}) : /* @__PURE__ */ jsx("div", {
							className: "drawingFrame jointFrame",
							children: /* @__PURE__ */ jsx(PlateDrawing, {
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
						view === "sy" && Math.abs(parsed.sigmaYMpa) < 1e-9 && !patchOn ? /* @__PURE__ */ jsx("p", {
							className: "toolNote",
							children: "No uniform σy. A patch load is a separate edge traction; its membrane stress is calculated in the FEM, not drawn as a stress block."
						}) : null,
						view === "effective" ? /* @__PURE__ */ jsx("p", {
							className: "toolNote",
							children: "The hatch is a trial ρ preview. It is not an AS 4100 effective width."
						}) : null
					]
				}),
				rightOpen ? /* @__PURE__ */ jsxs("div", {
					className: "plateCol",
					children: [/* @__PURE__ */ jsxs("section", {
						className: "toolPanel",
						children: [
							/* @__PURE__ */ jsx("h2", { children: "Governing" }),
							!result ? /* @__PURE__ */ jsx("p", {
								className: "failBanner",
								children: "Enter positive a, b, t, E, ν, fy and fu."
							}) : null,
							result && !result.ok ? /* @__PURE__ */ jsx("p", {
								className: "failBanner",
								children: result.reason
							}) : null,
							/* @__PURE__ */ jsxs("div", {
								className: "resultList",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "α = a/b" }), /* @__PURE__ */ jsx("b", { children: result?.ok ? show(result.alpha, 3) : "—" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "CLASSICAL COMPRESSION BUCKLING σcr" }), /* @__PURE__ */ jsx("b", { children: result?.ok ? stressOut(result.sigmaCrMpa) : "—" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "CLASSICAL SHEAR BUCKLING τcr" }), /* @__PURE__ */ jsx("b", { children: result?.ok ? stressOut(result.tauCrMpa) : "—" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Half-waves m × n" }), /* @__PURE__ */ jsx("b", { children: result?.ok && result.m != null ? `${result.m} × ${result.n}` : "—" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: bothFields ? "FEM COMBINED-PRESTRESS λcr" : "FEM λ1" }), /* @__PURE__ */ jsx("b", { children: critical ? show(critical.lambda, 4) : fem ? "—" : "Not run" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "FEM σ1 at y = 0" }), /* @__PURE__ */ jsx("b", { children: stressOut(critical?.sigma1CrMpa) })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "FEM σy,cr" }), /* @__PURE__ */ jsx("b", { children: stressOut(critical?.sigmaYCrMpa) })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "FEM τcr" }), /* @__PURE__ */ jsx("b", { children: stressOut(critical?.tauCrMpa) })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "FEM patch Fcr" }), /* @__PURE__ */ jsx("b", { children: forceOut(critical?.patchCrN) })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Plate mass" }), /* @__PURE__ */ jsxs("b", { children: [show(plateKg, 2), " kg"] })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Stiffener mass" }), /* @__PURE__ */ jsxs("b", { children: [show(stiffKg, 2), " kg"] })] })
								]
							}),
							bothFields ? /* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: "NO CLASSICAL INTERACTION CHECK IMPLEMENTED. σcr and τcr stay separate. λcr is an elastic bifurcation multiplier on the combined reference field, not a code design utilisation."
							}) : null,
							patchOn || Math.abs(parsed.sigmaYMpa) > 1e-9 ? /* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: "Classical σcr and τcr do not include σy or the patch. There is no closed form for that combination. Use the FEM column."
							}) : null,
							Math.abs(parsed.tauMpa) < 1e-9 && result?.ok && result.tauCrMpa != null ? /* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: "Classical τcr is the simply-supported plate property. Applied τxy is zero, so that number is not this load case. APPROXIMATE / FIT — not an exact series."
							}) : null,
							Math.abs(parsed.tauMpa) >= 1e-9 && result?.ok && result.tauCrMpa != null ? /* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: "CLASSICAL SHEAR BUCKLING uses the Timoshenko kτ fit. APPROXIMATE / FIT — not an exact closed form. It is not a combined utilisation."
							}) : null,
							tensileField ? /* @__PURE__ */ jsx("p", {
								className: "failBanner",
								children: "The direct field is tensile. Classical σcr is not a capacity for this load, and the eigenvalue is refused."
							}) : null,
							critical?.sigma1CrMpa != null && critical.sigma1CrMpa < 0 ? /* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: "σ1 at λ is tensile at y = 0. Read it with ψ. It is not a compressive capacity of that edge."
							}) : null,
							stale ? /* @__PURE__ */ jsx("p", {
								className: "failBanner",
								children: "STALE — INPUTS CHANGED. RUN FEM AGAIN."
							}) : null,
							modeClass ? /* @__PURE__ */ jsxs("p", {
								className: "okBanner",
								children: [modeClass.kind, modeClass.panelId ? ` · ${modeClass.panelId}` : ""]
							}) : null,
							modeClass ? /* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: modeClass.note
							}) : null,
							/* @__PURE__ */ jsxs("div", {
								className: "resultList",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Mesh" }), /* @__PURE__ */ jsx("b", { children: liveFem ? `${liveFem.nx} × ${liveFem.ny}` : nxN >= 2 && nyN >= 2 ? `${nxN} × ${nyN}` : "—" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "DOF" }), /* @__PURE__ */ jsx("b", { children: liveFem ? liveFem.freeDof : "—" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Eigenpair residual" }), /* @__PURE__ */ jsx("b", { children: liveFem ? liveFem.residual.toExponential(2) : "—" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Solver tolerance" }), /* @__PURE__ */ jsx("b", { children: liveFem ? liveFem.solverTolerance.toExponential(0) : "1e-8" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Iterations" }), /* @__PURE__ */ jsx("b", { children: liveFem ? liveFem.iterations : "—" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Element aspect" }), /* @__PURE__ */ jsx("b", { children: liveFem ? show(liveFem.elementAspect, 2) : previewAspect == null ? "—" : show(previewAspect, 2) })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Last mesh change" }), /* @__PURE__ */ jsx("b", { children: lastChange == null || studyStale ? "—" : `${show(lastChange, 2)}%` })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Mesh status" }), /* @__PURE__ */ jsx("b", { children: study == null ? "NOT CHECKED" : studyStale ? "NOT CHECKED" : converged ? "CONVERGED" : "NOT CONVERGED" })] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Solver status" }), /* @__PURE__ */ jsx("b", { children: solverKind })] })
								]
							}),
							/* @__PURE__ */ jsxs("p", {
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
							converged ? /* @__PURE__ */ jsxs("p", {
								className: "okBanner",
								children: [
									"CONVERGED — last two meshes within ",
									tolPct,
									"%. This is a mesh check, not a code verification."
								]
							}) : /* @__PURE__ */ jsx("p", {
								className: study == null ? "toolNote" : "failBanner",
								children: study == null ? `MESH CONVERGENCE NOT RUN. An FEM result is not verified until the last two meshes agree within ${tolPct}%.` : studyStale ? "CONVERGENCE STALE" : `NOT CONVERGED — last change is outside ${tolPct}%.`
							}),
							result?.ok ? result.warnings.map((line) => /* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: line
							}, line)) : null,
							liveFem?.aspectWarning ? /* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: liveFem.aspectWarning
							}) : null,
							previewAspect != null && previewAspect > 3 ? /* @__PURE__ */ jsxs("p", {
								className: "toolNote",
								children: [
									"Preview element aspect ",
									previewAspect.toFixed(2),
									" is above 3. Add elements on the long side."
								]
							}) : null
						]
					}), /* @__PURE__ */ jsxs("section", {
						className: "toolPanel",
						children: [
							/* @__PURE__ */ jsx("h2", { children: "Mesh" }),
							/* @__PURE__ */ jsx("div", {
								className: "presetRow",
								children: [
									10,
									20,
									40,
									80
								].map((n) => /* @__PURE__ */ jsxs("button", {
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
							/* @__PURE__ */ jsxs("div", {
								className: "fieldGrid compact",
								children: [/* @__PURE__ */ jsx(Field, {
									label: "Elements along a",
									value: nx,
									onChange: setNx
								}), /* @__PURE__ */ jsx(Field, {
									label: "Elements along b",
									value: ny,
									onChange: setNy
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "toolNote",
								children: nxN >= 2 && nyN >= 2 && nxN <= 80 && nyN <= 80 ? `${nxN * nyN} elements · ${(nxN + 1) * (nyN + 1)} nodes · ${(nxN + 1) * (nyN + 1) * 3} DOF` : "Mesh must be from 2×2 to 80×80."
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "field",
								children: [/* @__PURE__ */ jsx("span", { children: "Convergence tolerance" }), /* @__PURE__ */ jsxs("select", {
									className: "toolSelect",
									value: convTol,
									onChange: (event) => setConvTol(event.target.value),
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "2",
											children: "2%"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "1",
											children: "1%"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "0.5",
											children: "0.5%"
										})
									]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "toolToolbar",
								children: [
									/* @__PURE__ */ jsx("button", {
										className: "toolBtn",
										type: "button",
										disabled: busy !== "",
										onClick: runFem,
										children: busy === "SOLVING" ? "SOLVING" : "RUN FEM"
									}),
									/* @__PURE__ */ jsx("button", {
										className: "toolBtn",
										type: "button",
										disabled: busy !== "",
										onClick: runStudy,
										children: busy === "CONVERGENCE" ? "RUNNING" : "RUN MESH CONVERGENCE"
									}),
									/* @__PURE__ */ jsx("button", {
										className: "toolBtn",
										type: "button",
										disabled: busy !== "",
										onClick: runVerify,
										children: busy === "VERIFY" ? "RUNNING" : "RUN QUICK VERIFICATION"
									}),
									/* @__PURE__ */ jsx("button", {
										className: "toolBtn",
										type: "button",
										disabled: busy !== "",
										onClick: runVerifyFull,
										children: busy === "VERIFY" ? "RUNNING" : "RUN FULL VERIFICATION"
									})
								]
							}),
							femError ? /* @__PURE__ */ jsx("p", {
								className: "failBanner",
								children: femError
							}) : null
						]
					})]
				}) : null
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "toolPanel plateBottom",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "toolTabs",
					role: "tablist",
					children: DOCK.map((item) => /* @__PURE__ */ jsx("button", {
						type: "button",
						className: dock === item ? "on" : "",
						onClick: () => setDock(item),
						children: item
					}, item))
				}),
				dock === "TRACE" ? /* @__PURE__ */ jsx(Trace, {
					result,
					fem: liveFem,
					stiffeners,
					plateT: parsed.tMm ?? 0
				}) : null,
				dock === "FEM" ? /* @__PURE__ */ jsx(FemAudit, {
					fem: liveFem,
					stale
				}) : null,
				dock === "CONVERGENCE" ? /* @__PURE__ */ jsx(Convergence, {
					study,
					stale: studyStale,
					tolerancePct: tolPct
				}) : null,
				dock === "SUBPANELS" ? /* @__PURE__ */ jsx(PanelTable, {
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
				dock === "STIFFENERS" ? /* @__PURE__ */ jsx(StiffenerTable, {
					items: stiffeners,
					plateT: parsed.tMm ?? 0,
					aMm: parsed.aMm ?? 0,
					bMm: parsed.bMm ?? 0,
					selected: selectedStiffener,
					onSelect: setSelectedStiffener
				}) : null,
				dock === "CODE" ? /* @__PURE__ */ jsx(CodeTable, { rows: codeRows, method: designMethod, onMethod: setDesignMethod, onOpenDesign: () => { setDesignMethod("as4100"); setDock("DESIGN"); } }) : null,
				/* @__PURE__ */ jsx("div", {
					style: { display: dock === "DESIGN" ? "block" : "none" },
					children: /* @__PURE__ */ jsx(PlateDesign, {
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
				dock === "TRIAL ρ" ? /* @__PURE__ */ jsx(EffectivePane, {
					rho,
					setRho,
					preview: rhoPreview
				}) : null,
				dock === "CASES" ? /* @__PURE__ */ jsx(CaseTable, {
					name: caseName,
					setName: setCaseName,
					cases,
					onDuplicate: duplicateCase,
					onDelete: (id) => setCases((list) => list.filter((item) => item.id !== id))
				}) : null,
				dock === "VERIFY" ? /* @__PURE__ */ jsx(VerifyTable, { rows: verifyRows }) : null
			]
		})
	] });
}
function Field({ label, value, onChange, hot, setHot, hint }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "field",
		onMouseEnter: () => hot && setHot?.(hot),
		onMouseLeave: () => setHot?.(null),
		children: [
			/* @__PURE__ */ jsx("span", { children: label }),
			/* @__PURE__ */ jsx("input", {
				className: "toolField",
				inputMode: "decimal",
				value,
				onFocus: () => hot && setHot?.(hot),
				onBlur: () => setHot?.(null),
				onChange: (event) => onChange(event.target.value)
			}),
			hint ? /* @__PURE__ */ jsx("small", { children: hint }) : null
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
	return /* @__PURE__ */ jsxs("section", {
		className: "toolPanel",
		children: [
			/* @__PURE__ */ jsx("h2", { children: "Stiffeners" }),
			/* @__PURE__ */ jsxs("div", {
				className: "toolToolbar",
				children: [/* @__PURE__ */ jsx("button", {
					className: "toolBtn",
					type: "button",
					onClick: () => onAdd("x"),
					children: "ADD LONGITUDINAL"
				}), /* @__PURE__ */ jsx("button", {
					className: "toolBtn",
					type: "button",
					onClick: () => onAdd("y"),
					children: "ADD TRANSVERSE"
				})]
			}),
			items.length === 0 ? /* @__PURE__ */ jsx("p", {
				className: "toolNote",
				children: "No stiffener. The plate is one panel."
			}) : null,
			items.map((item) => /* @__PURE__ */ jsxs("button", {
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
			current ? /* @__PURE__ */ jsxs("div", {
				className: "fieldGrid compact",
				style: { marginTop: 10 },
				onMouseEnter: () => onHot(current.id),
				onMouseLeave: () => onHot(null),
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [/* @__PURE__ */ jsx("span", { children: "Orientation" }), /* @__PURE__ */ jsxs("select", {
							className: "toolSelect",
							value: current.axis,
							onChange: (event) => patchItem(current.id, { axis: event.target.value }),
							children: [/* @__PURE__ */ jsx("option", {
								value: "x",
								children: "Longitudinal, along x"
							}), /* @__PURE__ */ jsx("option", {
								value: "y",
								children: "Transverse, along y"
							})]
						})]
					}),
					/* @__PURE__ */ jsx(Field, {
						label: current.axis === "x" ? `y — ${lengthUnit}` : `x — ${lengthUnit}`,
						value: formatEntry(mmToLength(current.atMm, lengthUnit)),
						onChange: (value) => patchItem(current.id, { atMm: readLength(value, current.atMm) })
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [/* @__PURE__ */ jsx("span", { children: "Section" }), /* @__PURE__ */ jsxs("select", {
							className: "toolSelect",
							value: current.kind,
							onChange: (event) => patchItem(current.id, { kind: event.target.value }),
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "flat",
									children: "Flat bar"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "plate",
									children: "Plate"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "angle",
									children: "Angle"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "tee",
									children: "Tee"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "custom",
									children: "Custom"
								})
							]
						})]
					}),
					current.kind === "custom" ? /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx(Field, {
							label: `A — ${lengthUnit}²`,
							value: formatEntry((current.customA ?? 0) / (per * per)),
							onChange: (value) => patchItem(current.id, { customA: (num(value) ?? 0) * per * per })
						}),
						/* @__PURE__ */ jsx(Field, {
							label: `I — ${lengthUnit}⁴`,
							value: formatEntry((current.customI ?? 0) / per ** 4),
							onChange: (value) => patchItem(current.id, { customI: (num(value) ?? 0) * per ** 4 })
						}),
						/* @__PURE__ */ jsx(Field, {
							label: `J — ${lengthUnit}⁴`,
							value: formatEntry((current.customJ ?? 0) / per ** 4),
							onChange: (value) => patchItem(current.id, { customJ: (num(value) ?? 0) * per ** 4 })
						})
					] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx(Field, {
							label: `h — ${lengthUnit}`,
							value: formatEntry(mmToLength(current.hMm, lengthUnit)),
							onChange: (value) => patchItem(current.id, { hMm: readLength(value, current.hMm) })
						}),
						/* @__PURE__ */ jsx(Field, {
							label: `tw — ${lengthUnit}`,
							value: formatEntry(mmToLength(current.twMm, lengthUnit)),
							onChange: (value) => patchItem(current.id, { twMm: readLength(value, current.twMm) })
						}),
						current.kind === "angle" || current.kind === "tee" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Field, {
							label: `bf — ${lengthUnit}`,
							value: formatEntry(mmToLength(current.bfMm, lengthUnit)),
							onChange: (value) => patchItem(current.id, { bfMm: readLength(value, current.bfMm) })
						}), /* @__PURE__ */ jsx(Field, {
							label: `tf — ${lengthUnit}`,
							value: formatEntry(mmToLength(current.tfMm, lengthUnit)),
							onChange: (value) => patchItem(current.id, { tfMm: readLength(value, current.tfMm) })
						})] }) : null
					] }),
					/* @__PURE__ */ jsx(Field, {
						label: `E — ${stressUnit}`,
						value: formatEntry(mpaToStress(current.eMpa, stressUnit)),
						onChange: (value) => patchItem(current.id, { eMpa: readStress(value, current.eMpa) })
					}),
					/* @__PURE__ */ jsx(Field, {
						label: `fy — ${stressUnit}`,
						value: formatEntry(mpaToStress(current.fyMpa, stressUnit)),
						onChange: (value) => patchItem(current.id, { fyMpa: readStress(value, current.fyMpa) })
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "field",
						children: [/* @__PURE__ */ jsx("span", { children: "Comparison" }), /* @__PURE__ */ jsxs("select", {
							className: "toolSelect",
							value: current.rigid ? "rigid" : "flex",
							onChange: (event) => patchItem(current.id, { rigid: event.target.value === "rigid" }),
							children: [/* @__PURE__ */ jsx("option", {
								value: "flex",
								children: "Flexible — entered EI, GJ"
							}), /* @__PURE__ */ jsx("option", {
								value: "rigid",
								children: "Rigid comparison — EI, GJ × 10000"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "toolToolbar",
						children: [/* @__PURE__ */ jsx("button", {
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
						}), /* @__PURE__ */ jsx("button", {
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
	if (items.length === 0) return /* @__PURE__ */ jsx("p", {
		className: "toolNote",
		children: "No stiffener. Subpanel geometry is the parent plate."
	});
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: "I is about the plate mid-surface, in canonical mm and N. The editor uses the selected units and converts at this boundary. J is Saint-Venant torsion, not warping. G uses ν = 0.3. A rigid comparison multiplies EI and GJ by 10000 inside the FEM only. EA is reported and is not an out-of-plane degree of freedom. A stiffener is not an infinitely rigid support merely because it exists."
		}),
		/* @__PURE__ */ jsx("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ jsxs("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Id" }),
					/* @__PURE__ */ jsx("th", { children: "Axis" }),
					/* @__PURE__ */ jsx("th", { children: "At mm" }),
					/* @__PURE__ */ jsx("th", { children: "A mm²" }),
					/* @__PURE__ */ jsx("th", { children: "I mm⁴" }),
					/* @__PURE__ */ jsx("th", { children: "J mm⁴" }),
					/* @__PURE__ */ jsx("th", { children: "EA N" }),
					/* @__PURE__ */ jsx("th", { children: "EI N·mm²" }),
					/* @__PURE__ */ jsx("th", { children: "GJ N·mm²" }),
					/* @__PURE__ */ jsx("th", { children: "Mass kg" })
				] }) }), /* @__PURE__ */ jsx("tbody", { children: items.map((item) => {
					const props = stiffenerProps(item, plateT);
					return /* @__PURE__ */ jsxs("tr", {
						className: selected === item.id ? "rowOn" : "",
						onClick: () => onSelect(item.id),
						children: [
							/* @__PURE__ */ jsxs("td", { children: [item.id, item.rigid ? " rigid" : ""] }),
							/* @__PURE__ */ jsx("td", { children: item.axis === "x" ? "Longitudinal" : "Transverse" }),
							/* @__PURE__ */ jsx("td", { children: show(item.atMm, 1) }),
							/* @__PURE__ */ jsx("td", { children: show(props.areaMm2, 1) }),
							/* @__PURE__ */ jsx("td", { children: show(props.iMm4, 3) }),
							/* @__PURE__ */ jsx("td", { children: show(props.jMm4, 3) }),
							/* @__PURE__ */ jsx("td", { children: show(props.eaN, 3) }),
							/* @__PURE__ */ jsx("td", { children: show(props.eiNmm2, 3) }),
							/* @__PURE__ */ jsx("td", { children: show(props.gjNmm2, 3) }),
							/* @__PURE__ */ jsx("td", { children: show(stiffenerMassKg(props.areaMm2, item.axis === "x" ? aMm : bMm), 2) })
						]
					}, item.id);
				}) })]
			})
		}),
		items.map((item) => /* @__PURE__ */ jsxs("p", {
			className: "toolNote",
			children: [
				item.id,
				": ",
				stiffenerProps(item, plateT).note
			]
		}, item.id)),
		/* @__PURE__ */ jsx("p", {
			className: "okBanner",
			children: "GEOMETRIC SUBPANEL IDENTIFIED. STIFFENER DESIGN ADEQUATE: NOT VERIFIED. SUBPANEL EDGE ASSUMED FULLY RESTRAINED: NO."
		})
	] });
}
function PanelTable({ panels, selected, sort, onSort, femNote, mode, onSelect }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: femNote
		}),
		panels.some((panel) => panel.status.includes("NOT VERIFIED")) ? /* @__PURE__ */ jsx("p", {
			className: "okBanner",
			children: "GEOMETRIC SUBPANEL IDENTIFIED. STIFFENER DESIGN ADEQUATE: NOT VERIFIED. SUBPANEL EDGE ASSUMED FULLY RESTRAINED: NO."
		}) : null,
		mode ? /* @__PURE__ */ jsxs("p", {
			className: "toolNote",
			children: [
				"Eigenmode reading: ",
				mode.kind,
				mode.panelId ? ` · ${mode.panelId}` : "",
				". This is not a code rule and the smallest panel is not assumed to govern."
			]
		}) : null,
		/* @__PURE__ */ jsx("div", {
			className: "toolToolbar",
			children: /* @__PURE__ */ jsx("button", {
				className: "toolBtn",
				type: "button",
				onClick: () => onSort(sort === "id" ? "stress" : "id"),
				children: sort === "id" ? "SORT BY σcr" : "SORT BY ID"
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ jsxs("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Panel" }),
					/* @__PURE__ */ jsx("th", { children: "a" }),
					/* @__PURE__ */ jsx("th", { children: "b" }),
					/* @__PURE__ */ jsx("th", { children: "α" }),
					/* @__PURE__ */ jsx("th", { children: "ψ" }),
					/* @__PURE__ */ jsx("th", { children: "σ1" }),
					/* @__PURE__ */ jsx("th", { children: "σ2" }),
					/* @__PURE__ */ jsx("th", { children: "τ" }),
					/* @__PURE__ */ jsx("th", { children: "Analytical σcr" }),
					/* @__PURE__ */ jsx("th", { children: "Mode" })
				] }) }), /* @__PURE__ */ jsx("tbody", { children: panels.map((panel) => /* @__PURE__ */ jsxs("tr", {
					className: selected === panel.id ? "rowOn" : "",
					onClick: () => onSelect(panel.id),
					children: [
						/* @__PURE__ */ jsx("td", { children: panel.id }),
						/* @__PURE__ */ jsx("td", { children: show(panel.aMm, 1) }),
						/* @__PURE__ */ jsx("td", { children: show(panel.bMm, 1) }),
						/* @__PURE__ */ jsx("td", { children: show(panel.alpha, 3) }),
						/* @__PURE__ */ jsx("td", { children: show(panel.psi, 3) }),
						/* @__PURE__ */ jsx("td", { children: show(panel.sigmaBottom, 2) }),
						/* @__PURE__ */ jsx("td", { children: show(panel.sigmaTop, 2) }),
						/* @__PURE__ */ jsx("td", { children: show(panel.tau, 2) }),
						/* @__PURE__ */ jsx("td", { children: panel.closedForm && panel.sigmaCrMpa != null ? `${show(panel.sigmaCrMpa, 2)} MPa` : "NO CLOSED-FORM SOLUTION — FEM REQUIRED" }),
						/* @__PURE__ */ jsx("td", { children: mode?.panelId === panel.id ? mode.kind : panel.closedForm && panel.m != null ? `${panel.m}×${panel.n}` : "—" })
					]
				}, panel.id)) })]
			})
		})
	] });
}
function FemAudit({ fem, stale }) {
	if (stale) return /* @__PURE__ */ jsx("p", {
		className: "failBanner",
		children: "STALE — INPUTS CHANGED. RUN FEM AGAIN."
	});
	if (!fem?.ok) return /* @__PURE__ */ jsx("p", {
		className: "toolNote",
		children: "Run FEM. The worker builds K and Kg, applies the edge restraints, and returns eigenvalues. Nothing is filled in before that."
	});
	const mode = fem.modes[0];
	const hx = mode && mode.w.length ? countHalfWaves(mode.w, fem.xs, fem.ys, "x") : null;
	const hy = mode && mode.w.length ? countHalfWaves(mode.w, fem.xs, fem.ys, "y") : null;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("h2", { children: `SOLVER DIAGNOSTICS — ${ELASTIC_ENGINE.id}` }),
		/* @__PURE__ */ jsxs("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "First positive λ" }), /* @__PURE__ */ jsx("b", { children: mode ? show(mode.lambda, 4) : "—" })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Iterations" }), /* @__PURE__ */ jsx("b", { children: fem.iterations })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Solver tolerance" }), /* @__PURE__ */ jsx("b", { children: fem.solverTolerance.toExponential(0) })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Residual ||Kφ − λKgφ|| / ||Kφ||" }), /* @__PURE__ */ jsx("b", { children: fem.residual.toExponential(2) })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Matrix size" }), /* @__PURE__ */ jsx("b", { children: fem.dof })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Free DOF" }), /* @__PURE__ */ jsx("b", { children: fem.freeDof })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Mesh" }), /* @__PURE__ */ jsxs("b", { children: [
					fem.nx,
					" × ",
					fem.ny
				] })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Elements" }), /* @__PURE__ */ jsx("b", { children: fem.elements })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Nodes" }), /* @__PURE__ */ jsx("b", { children: fem.nodes })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Time" }), /* @__PURE__ */ jsxs("b", { children: [show(fem.seconds, 2), " s"] })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Element aspect" }), /* @__PURE__ */ jsx("b", { children: show(fem.elementAspect, 2) })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "Mode 1 half-waves x × y" }), /* @__PURE__ */ jsx("b", { children: hx == null ? "—" : `${hx} × ${hy}` })] })
			]
		}),
		fem.aspectWarning ? /* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: fem.aspectWarning
		}) : null,
		fem.residual > fem.solverTolerance ? /* @__PURE__ */ jsxs("p", {
			className: "toolNote",
			children: [
				"Residual is above the ",
				fem.solverTolerance.toExponential(0),
				" target. The residual is shown, not hidden. A negative partner is not a second capacity."
			]
		}) : /* @__PURE__ */ jsxs("p", {
			className: "okBanner",
			children: [
				"SOLVER STATUS — CONVERGED. Residual is within ",
				fem.solverTolerance.toExponential(0),
				"."
			]
		}),
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: fem.formulation
		}),
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: fem.note
		}),
		/* @__PURE__ */ jsx("h2", { children: "SHOW FEM CONNECTIVITY" }),
		fem.stiffenerNotes.length === 0 ? /* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: "No stiffener in this solve."
		}) : fem.stiffenerNotes.map((line) => /* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: line
		}, line)),
		fem.prestressNote ? /* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: fem.prestressNote
		}) : null,
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: "These rows are positive eigenvalues only, smallest first. A negative partner is the reversed membrane field. It is not listed here as a capacity."
		}),
		/* @__PURE__ */ jsx("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ jsxs("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Mode" }),
					/* @__PURE__ */ jsx("th", { children: "λ" }),
					/* @__PURE__ */ jsx("th", { children: "λ · σ1" }),
					/* @__PURE__ */ jsx("th", { children: "λ · σy" }),
					/* @__PURE__ */ jsx("th", { children: "λ · τ" })
				] }) }), /* @__PURE__ */ jsx("tbody", { children: fem.modes.map((item, index) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: index + 1 }),
					/* @__PURE__ */ jsx("td", { children: show(item.lambda, 4) }),
					/* @__PURE__ */ jsx("td", { children: item.sigma1CrMpa == null ? "—" : `${show(item.sigma1CrMpa, 2)} MPa` }),
					/* @__PURE__ */ jsx("td", { children: item.sigmaYCrMpa == null ? "—" : `${show(item.sigmaYCrMpa, 2)} MPa` }),
					/* @__PURE__ */ jsx("td", { children: item.tauCrMpa == null ? "—" : `${show(item.tauCrMpa, 2)} MPa` })
				] }, `${item.lambda}-${index}`)) })]
			})
		})
	] });
}
function Convergence({ study, stale, tolerancePct }) {
	if (!study) return /* @__PURE__ */ jsxs("p", {
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		stale ? /* @__PURE__ */ jsx("p", {
			className: "failBanner",
			children: "CONVERGENCE STALE — INPUTS CHANGED"
		}) : null,
		/* @__PURE__ */ jsx("p", {
			className: ok ? "okBanner" : "failBanner",
			children: stale ? "NOT CONVERGED — STALE" : ok ? `CONVERGED within ${tolerancePct}%` : `NOT CONVERGED within ${tolerancePct}%`
		}),
		/* @__PURE__ */ jsxs("p", {
			className: "toolNote",
			children: [study.note, " An FEM result is not verified without this check."]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ jsxs("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Mesh" }),
					/* @__PURE__ */ jsx("th", { children: "Elements" }),
					/* @__PURE__ */ jsx("th", { children: "DOF" }),
					/* @__PURE__ */ jsx("th", { children: "λ1" }),
					/* @__PURE__ */ jsx("th", { children: "Critical" }),
					/* @__PURE__ */ jsx("th", { children: "Change" }),
					/* @__PURE__ */ jsx("th", { children: "MAC" }),
					/* @__PURE__ */ jsx("th", { children: "Waves" }),
					/* @__PURE__ */ jsx("th", { children: "Time" })
				] }) }), /* @__PURE__ */ jsx("tbody", { children: study.rows.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsxs("td", { children: [
						row.nx,
						"×",
						row.ny
					] }),
					/* @__PURE__ */ jsx("td", { children: row.elements }),
					/* @__PURE__ */ jsx("td", { children: row.freeDof }),
					/* @__PURE__ */ jsx("td", { children: show(row.lambda, 4) }),
					/* @__PURE__ */ jsx("td", { children: row.criticalMpa == null ? row.status : show(row.criticalMpa, 2) }),
					/* @__PURE__ */ jsx("td", { children: row.changePct == null ? "—" : `${show(row.changePct, 2)}%` }),
					/* @__PURE__ */ jsx("td", { children: row.mac == null ? "—" : show(row.mac, 3) }),
					/* @__PURE__ */ jsx("td", { children: row.wavesX == null ? "—" : `${row.wavesX}×${row.wavesY}` }),
					/* @__PURE__ */ jsxs("td", { children: [show(row.seconds, 2), " s"] })
				] }, `${row.nx}x${row.ny}`)) })]
			})
		}),
		/* @__PURE__ */ jsx(ConvergencePlot, { rows: study.rows })
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
	return /* @__PURE__ */ jsxs("svg", {
		className: "convPlot",
		viewBox: `0 0 ${w} ${h}`,
		role: "img",
		"aria-label": "Critical stress against mesh density",
		children: [
			/* @__PURE__ */ jsx("text", {
				x: pad,
				y: "16",
				fill: "#111",
				fontSize: "12",
				children: "CRITICAL STRESS vs MESH"
			}),
			/* @__PURE__ */ jsx("path", {
				d,
				fill: "none",
				stroke: "#111",
				strokeWidth: "1.6"
			}),
			pts.map((row, i) => /* @__PURE__ */ jsx("circle", {
				cx: x(i),
				cy: y(row.criticalMpa),
				r: "3",
				fill: "#111"
			}, `${row.nx}-${row.ny}`))
		]
	});
}
function CodeTable({ rows, method, onMethod, onOpenDesign }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: "Choose the design standard. Elastic σcr and the FEM eigenvalue are not a design resistance. AS 4100 dimensions and results are entered on DESIGN."
		}),
		/* @__PURE__ */ jsxs("label", { className: "field", children: [
			/* @__PURE__ */ jsx("span", { children: "Design standard" }),
			/* @__PURE__ */ jsx("select", {
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
				].map(([id, label]) => /* @__PURE__ */ jsx("option", { value: id, children: label }, id))
			})
		] }),
		/* @__PURE__ */ jsx("div", { className: "toolToolbar", children: /* @__PURE__ */ jsx("button", {
			type: "button",
			className: "toolBtn",
			onClick: onOpenDesign,
			children: "OPEN AS 4100 DESIGN"
		}) }),
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: "AS 4100 design inputs and results are in DESIGN. This table is the standard status only. It does not take plate dimensions. EN 1993-1-5 and AS 5224 are not part of this check."
		}),
		/* @__PURE__ */ jsx("details", {
			className: "quietHelp",
			children: [
				/* @__PURE__ */ jsx("summary", { children: "Standard status table — not where dimensions are entered" }),
				/* @__PURE__ */ jsx("div", {
					className: "toolTableWrap",
					children: /* @__PURE__ */ jsxs("table", {
						className: "toolTable",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", { children: "Check" }),
							/* @__PURE__ */ jsx("th", { children: "Clause" }),
							/* @__PURE__ */ jsx("th", { children: "Status" }),
							/* @__PURE__ */ jsx("th", { children: "Equation" }),
							/* @__PURE__ */ jsx("th", { children: "Result" })
						] }) }), /* @__PURE__ */ jsx("tbody", { children: rows.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsxs("td", { children: [
								row.group,
								": ",
								row.title
							] }),
							/* @__PURE__ */ jsx("td", { children: row.clause }),
							/* @__PURE__ */ jsx("td", { children: STATUS[row.status] }),
							/* @__PURE__ */ jsx("td", { children: row.equation }),
							/* @__PURE__ */ jsx("td", { children: row.result })
						] }, row.id)) })]
					})
				}),
				rows.map((row) => /* @__PURE__ */ jsxs("p", {
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("p", {
			className: "failBanner",
			children: "TRIAL ρ — NOT AS 4100 DESIGN. This hatch is a manual preview only."
		}),
		/* @__PURE__ */ jsx("p", {
			className: "failBanner",
			children: "MANUAL ρ — NOT AS 4100 DESIGN. Preview only."
		}),
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: "Trial ρ is a hatch preview. It is not the AS 4100 effective width be. That result is on DESIGN."
		}),
		/* @__PURE__ */ jsx("div", {
			className: "fieldGrid compact",
			children: /* @__PURE__ */ jsx(Field, {
				label: "Trial ρ — not a code result",
				value: rho,
				onChange: setRho
			})
		}),
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: preview == null ? "No preview until ρ is strictly between 0 and 1." : `Preview ρ = ${show(preview, 3)}. The drawing view TRIAL ρ shows the hatch. It is not be.`
		})
	] });
}
function CaseTable({ name, setName, cases, onDuplicate, onDelete }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			style: { marginTop: 0 },
			children: "DUPLICATE CASE stores the current mass, classical stress and FEM stress. Change the plate, then duplicate again. Utilisation stays blank until a code check can return a number. Density 7850 kg/m³ is an assumed constant, not a grade table."
		}),
		/* @__PURE__ */ jsx("div", {
			className: "fieldGrid compact",
			children: /* @__PURE__ */ jsx(Field, {
				label: "Case name",
				value: name,
				onChange: setName
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "toolToolbar",
			children: /* @__PURE__ */ jsx("button", {
				className: "toolBtn",
				type: "button",
				onClick: onDuplicate,
				children: "DUPLICATE CASE"
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ jsxs("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Case" }),
					/* @__PURE__ */ jsx("th", { children: "Plate kg" }),
					/* @__PURE__ */ jsx("th", { children: "Stiffener kg" }),
					/* @__PURE__ */ jsx("th", { children: "Total kg" }),
					/* @__PURE__ */ jsx("th", { children: "Classical" }),
					/* @__PURE__ */ jsx("th", { children: "FEM" }),
					/* @__PURE__ */ jsx("th", { children: "Patch Fcr" }),
					/* @__PURE__ */ jsx("th", { children: "Mode" }),
					/* @__PURE__ */ jsx("th", { children: "Utilisation" }),
					/* @__PURE__ */ jsx("th", {})
				] }) }), /* @__PURE__ */ jsx("tbody", { children: cases.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: row.name }),
					/* @__PURE__ */ jsx("td", { children: show(row.plateKg, 2) }),
					/* @__PURE__ */ jsx("td", { children: show(row.stiffKg, 2) }),
					/* @__PURE__ */ jsx("td", { children: show(row.totalKg, 2) }),
					/* @__PURE__ */ jsx("td", { children: row.classicalMpa == null ? "—" : `${show(row.classicalMpa, 2)} MPa` }),
					/* @__PURE__ */ jsx("td", { children: row.femMpa == null ? "—" : `${show(row.femMpa, 2)} MPa` }),
					/* @__PURE__ */ jsx("td", { children: row.patchCrN == null ? "—" : `${show(row.patchCrN, 1)} N` }),
					/* @__PURE__ */ jsx("td", { children: row.mode }),
					/* @__PURE__ */ jsx("td", { children: row.utilisation }),
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("button", {
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
	if (!rows) return /* @__PURE__ */ jsx("p", {
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "resultList",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "TOTAL" }), /* @__PURE__ */ jsx("b", { children: rows.length })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "PASS" }), /* @__PURE__ */ jsx("b", { children: count("pass") })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "FAIL" }), /* @__PURE__ */ jsx("b", { children: count("fail") })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "LIMITED" }), /* @__PURE__ */ jsx("b", { children: count("limited") })] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", { children: "NOT VERIFIED" }), /* @__PURE__ */ jsx("b", { children: count("not-verified") })] })
			]
		}),
		/* @__PURE__ */ jsx("p", {
			className: "toolNote",
			children: "PASS means that row met its own tolerance. LIMITED means the check ran but the basis is a fit, a residual floor, or not a code rule. NOT VERIFIED is not a pass. This button does not certify AS 4100, EN 1993-1-5 or AS 5224 resistance."
		}),
		/* @__PURE__ */ jsx("div", {
			className: "toolTableWrap",
			children: /* @__PURE__ */ jsxs("table", {
				className: "toolTable",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Test" }),
					/* @__PURE__ */ jsx("th", { children: "Expected" }),
					/* @__PURE__ */ jsx("th", { children: "Actual" }),
					/* @__PURE__ */ jsx("th", { children: "Difference" }),
					/* @__PURE__ */ jsx("th", { children: "Tolerance" }),
					/* @__PURE__ */ jsx("th", { children: "Mesh" }),
					/* @__PURE__ */ jsx("th", { children: "Residual" }),
					/* @__PURE__ */ jsx("th", { children: "Basis" }),
					/* @__PURE__ */ jsx("th", { children: "Status" })
				] }) }), /* @__PURE__ */ jsx("tbody", { children: rows.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsxs("td", { children: [
						row.id,
						" ",
						row.title
					] }),
					/* @__PURE__ */ jsx("td", { children: row.expected }),
					/* @__PURE__ */ jsx("td", { children: row.actual }),
					/* @__PURE__ */ jsx("td", { children: row.difference }),
					/* @__PURE__ */ jsx("td", { children: row.tolerance }),
					/* @__PURE__ */ jsx("td", { children: row.mesh }),
					/* @__PURE__ */ jsx("td", { children: row.residual }),
					/* @__PURE__ */ jsx("td", { children: row.basis }),
					/* @__PURE__ */ jsx("td", { children: label[row.status] })
				] }, row.id)) })]
			})
		})
	] });
}
function Trace({ result, fem, stiffeners, plateT }) {
	return /* @__PURE__ */ jsx("div", {
		className: "toolTableWrap",
		children: /* @__PURE__ */ jsxs("table", {
			className: "toolTable",
			children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
				/* @__PURE__ */ jsx("th", { children: "Step" }),
				/* @__PURE__ */ jsx("th", { children: "Equation" }),
				/* @__PURE__ */ jsx("th", { children: "Substitution" }),
				/* @__PURE__ */ jsx("th", { children: "Result" })
			] }) }), /* @__PURE__ */ jsxs("tbody", { children: [
				fem?.prestressNote ? /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: "Pre-buckling" }),
					/* @__PURE__ */ jsx("td", { children: "Plane stress, then Kg" }),
					/* @__PURE__ */ jsx("td", { children: fem.formulation }),
					/* @__PURE__ */ jsx("td", { children: fem.prestressNote })
				] }) : null,
				result?.ok ? result.steps.map((step) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: step.label }),
					/* @__PURE__ */ jsx("td", { children: step.equation }),
					/* @__PURE__ */ jsx("td", { children: step.substitution }),
					/* @__PURE__ */ jsx("td", { children: showStep(step.result) })
				] }, step.id)) : /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: "Classical" }),
					/* @__PURE__ */ jsx("td", { children: "—" }),
					/* @__PURE__ */ jsx("td", { children: result?.reason ?? "Waiting for inputs" }),
					/* @__PURE__ */ jsx("td", { children: "—" })
				] }),
				stiffeners.map((item) => {
					const props = stiffenerProps(item, plateT);
					return /* @__PURE__ */ jsxs("tr", { children: [
						/* @__PURE__ */ jsxs("td", { children: [item.id, " section"] }),
						/* @__PURE__ */ jsx("td", { children: "A, I = ∫z² dA, J Saint-Venant. EA, EI and GJ follow." }),
						/* @__PURE__ */ jsxs("td", { children: [
							item.kind,
							", h = ",
							item.hMm,
							" mm, tw = ",
							item.twMm,
							" mm, at ",
							item.atMm,
							" mm"
						] }),
						/* @__PURE__ */ jsxs("td", { children: [
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
				fem?.ok ? /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: "FEM eigenvalue" }),
					/* @__PURE__ */ jsx("td", { children: "Kφ = λ Kgφ" }),
					/* @__PURE__ */ jsxs("td", { children: [
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
					/* @__PURE__ */ jsxs("td", { children: [
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

export { PlateTool }
