import { useRef, useState, type PointerEvent } from "react"
import type { EdgeKind, Edges } from "../plate/classical.ts"
import type { FemMeshLine } from "../plate/fem.ts"
import { trimNum } from "../reference/format.ts"

export type PlateView = "geometry" | "sx" | "sy" | "tau" | "combined" | "panels" | "mesh" | "effective" | "prestress"

export type DrawStiffener = { id: string; axis: "x" | "y"; atMm: number }
export type DrawPanel = { id: string; x0: number; x1: number; y0: number; y1: number }
export type DrawPatch = {
  edge: "x0" | "x1" | "y0" | "y1"
  atMm: number
  lengthMm: number
  forceN: number
}
export type DrawSample = { yMm: number; sigmaMpa: number; tauMpa: number }

type Props = {
  aMm: number
  bMm: number
  tMm: number
  sigma1: number
  psi: number
  tau: number
  sigmaY?: number
  edges: Edges
  hot: string | null
  view: PlateView
  mesh: FemMeshLine[]
  onEdge: (edge: keyof Edges) => void
  onHot: (id: string | null) => void
  stiffeners?: DrawStiffener[]
  panels?: DrawPanel[]
  selectedStiffener?: string | null
  selectedPanel?: string | null
  onStiffener?: (id: string) => void
  onPanel?: (id: string) => void
  onDragStiffener?: (id: string, atMm: number) => void
  patch?: DrawPatch | null
  effectiveRho?: number | null
  samples?: DrawSample[]
  xs?: number[]
  ys?: number[]
  membrane?: { sigX: number[]; sigY: number[]; tau: number[] } | null
}

const EDGE_NAME: Record<keyof Edges, string> = {
  x0: "x = 0",
  x1: "x = a",
  y0: "y = 0",
  y1: "y = b",
}

const VIEW_LABEL: Record<PlateView, string> = {
  geometry: "GEOMETRY",
  sx: "σx",
  sy: "σy",
  tau: "τxy",
  combined: "COMBINED STRESS",
  panels: "SUBPANELS",
  mesh: "FEM MESH",
  effective: "EFFECTIVE WIDTH",
  prestress: "PRE-BUCKLING MEMBRANE",
}

function mm(n: number): string {
  if (!Number.isFinite(n)) return "—"
  const abs = Math.abs(n)
  if (abs >= 100) return trimNum(n, 1).replace(/\.0$/, "")
  return trimNum(n, 2).replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1")
}

function restraint(kind: EdgeKind): string {
  if (kind === "ss") return "SS"
  if (kind === "fixed") return "FIXED"
  if (kind === "free") return "FREE"
  return "SPRING"
}

function rangeOf(values: number[]): { min: number; max: number } {
  let min = Infinity
  let max = -Infinity
  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }
  return { min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 0 }
}

function PrestressField(props: {
  pl: number
  pt: number
  pr: number
  pb: number
  a: number
  b: number
  xs: number[]
  ys: number[]
  membrane: { sigX: number[]; sigY: number[]; tau: number[] } | null
  sx: (x: number) => number
  sy: (y: number) => number
}) {
  const nx = props.xs.length - 1
  const ny = props.ys.length - 1
  if (!props.membrane || nx < 1 || ny < 1 || props.membrane.sigY.length !== nx * ny) {
    return <text className="cap" x={props.pl} y={props.pt + 18}>NO PATCH FIELD. Kg IS USING THE ENTERED σx, σy AND τxy.</text>
  }
  const sigY = rangeOf(props.membrane.sigY)
  const sigX = rangeOf(props.membrane.sigX)
  const tau = rangeOf(props.membrane.tau)
  const scale = Math.max(Math.abs(sigY.min), Math.abs(sigY.max), 1e-9)
  const cells = []
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const value = props.membrane.sigY[iy * nx + ix] ?? 0
      const x = props.sx(props.xs[ix] ?? 0)
      const y = props.sy(props.ys[iy + 1] ?? 0)
      const w = Math.max(0.5, props.sx(props.xs[ix + 1] ?? 0) - x)
      const h = Math.max(0.5, props.sy(props.ys[iy] ?? 0) - y)
      cells.push(<rect key={`${ix}-${iy}`} x={x} y={y} width={w} height={h} fill="#111" opacity={Math.min(0.85, Math.abs(value) / scale)} />)
    }
  }
  return (
    <g>
      {cells}
      <text className="cap" x={props.pl} y={props.pb + 18}>σy SHADE — COMPRESSION POSITIVE. DARKER IS LARGER |σy|.</text>
      <text className="cap" x={props.pl} y={props.pb + 34}>{`σx ${sigX.min.toFixed(2)}…${sigX.max.toFixed(2)}  σy ${sigY.min.toFixed(2)}…${sigY.max.toFixed(2)}  τxy ${tau.min.toFixed(2)}…${tau.max.toFixed(2)} MPa`}</text>
    </g>
  )
}

export function PlateDrawing(props: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const PL = 210
  const PT = 112
  const PW = 300
  const PH = 200
  const PR = PL + PW
  const PB = PT + PH
  const a = props.aMm > 0 ? props.aMm : 1
  const b = props.bMm > 0 ? props.bMm : 1
  const sx = (x: number) => PL + (x / a) * PW
  const sy = (y: number) => PB - (y / b) * PH
  const on = (id: string) => (props.hot === id ? "hot" : "")
  const showSigma = props.view === "sx" || props.view === "combined" || props.hot === "sx"
  const showTau = (props.view === "tau" || props.view === "combined" || props.hot === "tau") && (Math.abs(props.tau) > 1e-9 || (props.samples ?? []).some((s) => Math.abs(s.tauMpa) > 1e-9))
  const showPatch = Boolean(props.patch && props.patch.lengthMm > 0 && (props.view === "geometry" || props.view === "sy" || props.view === "combined"))
  const showSy = (props.view === "sy" || props.view === "combined") && Math.abs(props.sigmaY ?? 0) > 1e-9
  const sig = (y: number) => atSample(props.samples, y, "sigmaMpa") ?? props.sigma1 * (1 - (1 - props.psi) * (y / b))
  const stations = [0.18, 0.34, 0.5, 0.66, 0.82]
  const peak = Math.max(1e-9, ...stations.map((f) => Math.abs(sig(f * b))), ...(props.samples ?? []).map((s) => Math.abs(s.sigmaMpa)))
  const neutral = props.psi !== 1 ? b / (1 - props.psi) : null

  function pointerMm(event: PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return null
    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const mapped = point.matrixTransform(ctm.inverse())
    return { x: ((mapped.x - PL) / PW) * a, y: ((PB - mapped.y) / PH) * b }
  }

  return (
    <svg
      ref={svgRef}
      className="plateSvg"
      viewBox="0 0 800 560"
      role="img"
      aria-label="Rectangular plate with edges, dimensions and stress"
      onPointerMove={(event) => {
        if (!dragId) return
        const mm = pointerMm(event)
        if (!mm) return
        const item = props.stiffeners?.find((stiffener) => stiffener.id === dragId)
        if (!item) return
        const value = item.axis === "x" ? Math.min(b * 0.98, Math.max(b * 0.02, mm.y)) : Math.min(a * 0.98, Math.max(a * 0.02, mm.x))
        props.onDragStiffener?.(dragId, value)
      }}
      onPointerUp={() => setDragId(null)}
    >
      <text className="cap" x="12" y="24">x ALONG a · y ALONG b · z NORMAL</text>
      <text className="cap" x="520" y="24">{VIEW_LABEL[props.view]}</text>
      <rect className="plateFill" x={PL} y={PT} width={PW} height={PH} />
      {props.view === "prestress" ? <PrestressField pl={PL} pt={PT} pr={PR} pb={PB} a={a} b={b} xs={props.xs ?? []} ys={props.ys ?? []} membrane={props.membrane ?? null} sx={sx} sy={sy} /> : null}

      {props.view === "effective" && props.effectiveRho != null && props.effectiveRho > 0 && props.effectiveRho < 1
        ? <EffectiveZone pl={PL} pt={PT} pr={PR} pb={PB} a={a} b={b} sigma1={props.sigma1} psi={props.psi} rho={props.effectiveRho} />
        : null}

      {props.view === "mesh"
        ? props.mesh.map((line, i) => (
            <line key={i} className="mesh" x1={sx(line.x1)} y1={sy(line.y1)} x2={sx(line.x2)} y2={sy(line.y2)} />
          ))
        : null}

      {props.view === "panels"
        ? props.panels?.map((panel) => (
            <g key={panel.id} onClick={() => props.onPanel?.(panel.id)} style={{ cursor: "pointer" }}>
              <rect
                className={props.selectedPanel === panel.id || props.hot === panel.id ? "panelOn" : "panel"}
                x={sx(panel.x0)}
                y={sy(panel.y1)}
                width={Math.max(1, sx(panel.x1) - sx(panel.x0))}
                height={Math.max(1, sy(panel.y0) - sy(panel.y1))}
              />
              <text className="tag" x={(sx(panel.x0) + sx(panel.x1)) / 2} y={(sy(panel.y0) + sy(panel.y1)) / 2} textAnchor="middle">{panel.id}</text>
            </g>
          ))
        : null}

      {props.stiffeners?.map((item) => {
        const hot = props.selectedStiffener === item.id || props.hot === item.id
        if (item.axis === "x") {
          const y = sy(item.atMm)
          return (
            <g key={item.id} className={hot ? "hot" : ""} onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); setDragId(item.id); props.onStiffener?.(item.id) }} style={{ cursor: "ns-resize" }}>
              <line className="stiff" x1={PL} y1={y} x2={PR} y2={y} />
              <line x1={PL} y1={y} x2={PR} y2={y} stroke="transparent" strokeWidth="12" />
              {props.view === "geometry" || props.view === "panels" ? <text className="tag" x={PR - 8} y={Math.max(PT + 14, y - 6)} textAnchor="end">{item.id} · y = {mm(item.atMm)}</text> : null}
            </g>
          )
        }
        const x = sx(item.atMm)
        return (
          <g key={item.id} className={hot ? "hot" : ""} onPointerDown={(event) => { setDragId(item.id); props.onStiffener?.(item.id) }} style={{ cursor: "ew-resize" }}>
            <line className="stiff" x1={x} y1={PT} x2={x} y2={PB} />
            <line x1={x} y1={PT} x2={x} y2={PB} stroke="transparent" strokeWidth="12" />
            <text className="tag" x={x + 4} y={PT + 16}>{item.id} x = {mm(item.atMm)}</text>
          </g>
        )
      })}

      {(props.view === "geometry" || props.view === "mesh" || props.view === "panels") && props.stiffeners
        ? props.stiffeners.filter((item) => item.axis === "x" && item.atMm > 1e-6 && item.atMm < b - 1e-6).flatMap((along) =>
          props.stiffeners!.filter((item) => item.axis === "y" && item.atMm > 1e-6 && item.atMm < a - 1e-6).map((across) => (
            <g key={`${along.id}-${across.id}`}>
              <circle className="joint" cx={sx(across.atMm)} cy={sy(along.atMm)} r="4.5" />
              <title>{`Connection node ${along.id} × ${across.id}`}</title>
            </g>
          )))
        : null}

      {showPatch && props.patch ? <PatchMark patch={props.patch} a={a} b={b} sx={sx} sy={sy} pl={PL} pt={PT} pr={PR} pb={PB} /> : null}

      {neutral != null && neutral > 0 && neutral < b && showSigma ? (
        <g>
          <line className="na" x1={PL} y1={sy(neutral)} x2={PR} y2={sy(neutral)} />
          <text className="tag" x={PL + 6} y={sy(neutral) - 4}>σ = 0</text>
        </g>
      ) : null}

      {showSigma && peak > 1e-6
        ? stations.map((f) => {
            const mag = sig(f * b)
            const len = 12 + (Math.abs(mag) / peak) * 26
            const yv = sy(f * b)
            const inward = mag >= 0
            const leftStart = PL + 78
            const rightStart = PR - 78
            return (
              <g key={f} className={`action ${on("sx")}`}>
                <line x1={inward ? leftStart : leftStart + len} y1={yv} x2={inward ? leftStart + len : leftStart} y2={yv} markerEnd="url(#pLoad)" />
                <line x1={inward ? rightStart : rightStart - len} y1={yv} x2={inward ? rightStart - len : rightStart} y2={yv} markerEnd="url(#pLoad)" />
              </g>
            )
          })
        : null}

      {showTau ? <ShearFrame pl={PL} pt={PT} pr={PR} pb={PB} positive={props.tau >= 0} hot={on("tau")} /> : null}
      {showSy ? <UniformSy pl={PL} pt={PT} pr={PR} pb={PB} sigmaY={props.sigmaY ?? 0} /> : null}
      {showSigma || props.view === "tau" ? (
        <StressPlot
          pt={PT}
          pb={PB}
          sigma1={props.sigma1}
          psi={props.psi}
          tau={props.tau}
          b={b}
          samples={props.samples}
          kind={props.view === "tau" ? "tau" : "sigma"}
        />
      ) : null}

      <Edge x1={PL} y1={PB} x2={PL} y2={PT} kind={props.edges.x0} id="ex0" label={EDGE_NAME.x0} hot={on("ex0")} place="left" onEdge={() => props.onEdge("x0")} onHot={props.onHot} />
      <Edge x1={PR} y1={PT} x2={PR} y2={PB} kind={props.edges.x1} id="ex1" label={EDGE_NAME.x1} hot={on("ex1")} place="right" onEdge={() => props.onEdge("x1")} onHot={props.onHot} />
      <Edge x1={PL} y1={PB} x2={PR} y2={PB} kind={props.edges.y0} id="ey0" label={EDGE_NAME.y0} hot={on("ey0")} place="bottom" onEdge={() => props.onEdge("y0")} onHot={props.onHot} />
      <Edge x1={PR} y1={PT} x2={PL} y2={PT} kind={props.edges.y1} id="ey1" label={EDGE_NAME.y1} hot={on("ey1")} place="top" onEdge={() => props.onEdge("y1")} onHot={props.onHot} />

      <g className={on("a")} onMouseEnter={() => props.onHot("a")} onMouseLeave={() => props.onHot(null)}>
        <line className="ext" x1={PL} y1={PB} x2={PL} y2={PB + 118} />
        <line className="ext" x1={PR} y1={PB} x2={PR} y2={PB + 118} />
        <line className="dim" x1={PL} y1={PB + 104} x2={PL + 70} y2={PB + 104} markerStart="url(#pDim)" />
        <line className="dim" x1={PR - 70} y1={PB + 104} x2={PR} y2={PB + 104} markerEnd="url(#pDim)" />
        <text className="dimText" x={(PL + PR) / 2} y={PB + 86} textAnchor="middle">a = {mm(props.aMm)} mm</text>
      </g>
      <g className={on("b")} onMouseEnter={() => props.onHot("b")} onMouseLeave={() => props.onHot(null)}>
        <line className="ext" x1={PL} y1={PT} x2={PL - 72} y2={PT} />
        <line className="ext" x1={PL} y1={PB} x2={PL - 72} y2={PB} />
        <line className="dim" x1={PL - 56} y1={PB} x2={PL - 56} y2={PB - 40} markerStart="url(#pDim)" />
        <line className="dim" x1={PL - 56} y1={PT + 40} x2={PL - 56} y2={PT} markerEnd="url(#pDim)" />
        <text className="dimText" x={PL - 86} y={(PT + PB) / 2} textAnchor="middle" transform={`rotate(-90 ${PL - 86} ${(PT + PB) / 2})`}>b = {mm(props.bMm)} mm</text>
      </g>

      {props.view === "geometry" || props.view === "panels" ? (
      <g className={on("t")} onMouseEnter={() => props.onHot("t")} onMouseLeave={() => props.onHot(null)}>
        <text className="cap" x="640" y="300">THICKNESS</text>
        <rect className="plateFill" x="644" y="314" width="14" height="64" />
        <line className="ext" x1="658" y1="314" x2="708" y2="314" />
        <line className="ext" x1="658" y1="378" x2="708" y2="378" />
        <line className="dim" x1="692" y1="318" x2="692" y2="374" markerStart="url(#pDim)" markerEnd="url(#pDim)" />
        <text className="dimText" x="708" y="352">t = {mm(props.tMm)}</text>
      </g>
      ) : null}

      <g className="axis">
        <line x1="28" y1="500" x2="72" y2="500" markerEnd="url(#pDim)" />
        <line x1="28" y1="500" x2="28" y2="462" markerEnd="url(#pDim)" />
        <line x1="28" y1="500" x2="50" y2="484" markerEnd="url(#pDim)" />
        <text x="78" y="506">x</text>
        <text x="14" y="454">y</text>
        <text x="66" y="470">z</text>
      </g>
      <text className="cap" x="150" y="508">CLICK AN EDGE TO CYCLE ITS RESTRAINT</text>
      <text className="cap" x="12" y="540">HEAVY ARROW = STRESS · THIN ARROW = DIMENSION · ROLLERS AND HATCHES SIT OUTSIDE THE EDGE</text>

      <defs>
        <marker id="pDim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 1.2 L9 5 L0 8.8 Z" fill="#111" />
        </marker>
        <marker id="pLoad" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto">
          <path d="M0 0.6 L12 6 L0 11.4 Z" fill="#111" />
        </marker>
        <pattern id="ineffHatch" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M0 7 L7 0" stroke="#111" strokeWidth="0.7" />
        </pattern>
      </defs>
    </svg>
  )
}

function PatchMark({
  patch, a, b, sx, sy, pl, pt, pr, pb,
}: {
  patch: DrawPatch
  a: number
  b: number
  sx: (x: number) => number
  sy: (y: number) => number
  pl: number
  pt: number
  pr: number
  pb: number
}) {
  const half = patch.lengthMm / 2
  const edgeLen = patch.edge === "x0" || patch.edge === "x1" ? b : a
  const start = patch.atMm - half
  const end = patch.atMm + half
  const onEdge = patch.lengthMm > 0 && patch.lengthMm <= edgeLen + 1e-6 && start >= -1e-6 && end <= edgeLen + 1e-6
  const into = patch.forceN >= 0
  const count = 5
  const arrows: number[][] = []
  let x0 = pl
  let x1 = pr
  let y0 = pt
  let y1 = pb
  if (patch.edge === "y1" || patch.edge === "y0") {
    x0 = sx(Math.max(0, patch.atMm - half))
    x1 = sx(Math.min(a, patch.atMm + half))
    const edge = patch.edge === "y1" ? pt : pb
    const outward = patch.edge === "y1" ? -1 : 1
    for (let i = 0; i < count; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / count
      const tail = edge + outward * (into ? 26 : 4)
      const tip = edge + outward * (into ? 4 : 26)
      arrows.push([x, tail, x, tip])
    }
    y0 = edge + outward * 26
    y1 = edge + outward * 26
  } else {
    y0 = sy(Math.max(0, patch.atMm - half))
    y1 = sy(Math.min(b, patch.atMm + half))
    const edge = patch.edge === "x0" ? pl : pr
    const outward = patch.edge === "x0" ? -1 : 1
    for (let i = 0; i < count; i++) {
      const y = Math.min(y0, y1) + (Math.abs(y1 - y0) * (i + 0.5)) / count
      const tail = edge + outward * (into ? 26 : 4)
      const tip = edge + outward * (into ? 4 : 26)
      arrows.push([tail, y, tip, y])
    }
    x0 = edge + outward * 26
    x1 = edge + outward * 26
  }
  return (
    <g className="action">
      <line className="patch" strokeDasharray={onEdge ? undefined : "5 4"} x1={Math.min(x0, x1)} y1={Math.min(y0, y1)} x2={Math.max(x0, x1)} y2={Math.max(y0, y1)} />
      {arrows.map((seg, i) => <line key={i} x1={seg[0]} y1={seg[1]} x2={seg[2]} y2={seg[3]} markerEnd="url(#pLoad)" />)}
      <text className="tag" x={(Math.min(x0, x1) + Math.max(x0, x1)) / 2} y={Math.min(y0, y1) - 8} textAnchor="middle">{onEdge ? `ss = ${mm(patch.lengthMm)} mm` : "NOT ON EDGE"}</text>
    </g>
  )
}

function UniformSy({ pl, pt, pr, pb, sigmaY }: { pl: number; pt: number; pr: number; pb: number; sigmaY: number }) {
  const into = sigmaY >= 0
  const xs = [0.2, 0.4, 0.6, 0.8].map((f) => pl + (pr - pl) * f)
  return (
    <g className="action">
      {xs.map((x) => {
        const topTail = into ? pt - 22 : pt - 4
        const topTip = into ? pt - 4 : pt - 22
        const botTail = into ? pb + 22 : pb + 4
        const botTip = into ? pb + 4 : pb + 22
        return (
          <g key={x}>
            <line x1={x} y1={topTail} x2={x} y2={topTip} markerEnd="url(#pLoad)" />
            <line x1={x} y1={botTail} x2={x} y2={botTip} markerEnd="url(#pLoad)" />
          </g>
        )
      })}
      <text className="tag" x={pl + 8} y={pt + 18}>σy = {mm(sigmaY)} MPa {into ? "COMPRESSION" : "TENSION"}</text>
    </g>
  )
}

function ShearFrame({ pl, pt, pr, pb, positive, hot }: { pl: number; pt: number; pr: number; pb: number; positive: boolean; hot: string }) {
  const inset = 28
  const x0 = pl + inset
  const x1 = pr - inset
  const y0 = pt + inset
  const y1 = pb - inset
  const segs = positive
    ? [
        [x0 + 28, y0, x1 - 8, y0],
        [x1, y0 + 28, x1, y1 - 8],
        [x1 - 28, y1, x0 + 8, y1],
        [x0, y1 - 28, x0, y0 + 8],
      ]
    : [
        [x1 - 28, y0, x0 + 8, y0],
        [x0, y0 + 28, x0, y1 - 8],
        [x0 + 28, y1, x1 - 8, y1],
        [x1, y1 - 28, x1, y0 + 8],
      ]
  return (
    <g className={`action ${hot}`}>
      {segs.map((seg, i) => (
        <line key={i} x1={seg[0]} y1={seg[1]} x2={seg[2]} y2={seg[3]} markerEnd="url(#pLoad)" />
      ))}
    </g>
  )
}

function Edge({
  x1, y1, x2, y2, kind, id, label, hot, place, onEdge, onHot,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  kind: EdgeKind
  id: string
  label: string
  hot: string
  place: "left" | "right" | "top" | "bottom"
  onEdge: () => void
  onHot: (id: string | null) => void
}) {
  const name = restraint(kind)
  const along = place === "top" ? [0.16, 0.84] : place === "bottom" ? [0.5, 0.84] : [0.42, 0.78]
  const marks = along.map((t) => ({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t }))
  const yTop = Math.min(y1, y2)
  const yBot = Math.max(y1, y2)
  const labelPos = place === "left"
    ? { x: 8, y: yTop + 28, anchor: "start" as const }
    : place === "right"
      ? { x: Math.max(x1, x2) + 18, y: yTop + 28, anchor: "start" as const }
      : place === "top"
        ? { x: Math.min(x1, x2), y: yTop - 18, anchor: "start" as const }
        : { x: Math.min(x1, x2) + 6, y: yBot + 36, anchor: "start" as const }
  return (
    <g className={hot} onClick={onEdge} onMouseEnter={() => onHot(id)} onMouseLeave={() => onHot(null)} style={{ cursor: "pointer" }}>
      <line className={kind === "free" ? "edge free" : "edge"} x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="18" />
      {kind === "fixed" ? marks.map((p) => <Hatch key={`${p.x}-${p.y}`} x={p.x} y={p.y} place={place} />) : null}
      {kind === "ss" ? marks.map((p) => <Roller key={`${p.x}-${p.y}`} x={p.x} y={p.y} place={place} />) : null}
      {kind === "elastic" ? <Spring x={x1 + (x2 - x1) * 0.84} y={y1 + (y2 - y1) * 0.84} place={place} /> : null}
      <text className="tag" x={labelPos.x} y={labelPos.y - 10} textAnchor={labelPos.anchor}>{label}</text>
      <text className="tag" x={labelPos.x} y={labelPos.y + 10} textAnchor={labelPos.anchor}>{name}</text>
    </g>
  )
}

function Roller({ x, y, place }: { x: number; y: number; place: "left" | "right" | "top" | "bottom" }) {
  if (place === "left") {
    return (
      <g className="support">
        <polygon points={`${x},${y} ${x - 14},${y - 8} ${x - 14},${y + 8}`} />
        <circle cx={x - 19} cy={y} r="4" />
      </g>
    )
  }
  if (place === "right") {
    return (
      <g className="support">
        <polygon points={`${x},${y} ${x + 14},${y - 8} ${x + 14},${y + 8}`} />
        <circle cx={x + 19} cy={y} r="4" />
      </g>
    )
  }
  if (place === "top") {
    return (
      <g className="support">
        <polygon points={`${x},${y} ${x - 8},${y - 14} ${x + 8},${y - 14}`} />
        <circle cx={x} cy={y - 19} r="4" />
      </g>
    )
  }
  return (
    <g className="support">
      <polygon points={`${x},${y} ${x - 8},${y + 14} ${x + 8},${y + 14}`} />
      <circle cx={x} cy={y + 19} r="4" />
    </g>
  )
}

function Spring({ x, y, place }: { x: number; y: number; place: "left" | "right" | "top" | "bottom" }) {
  const d = place === "left"
    ? `M ${x} ${y} l -8 0 -4 -7 -4 14 -4 -14 -4 14 -4 -7 -6 0`
    : place === "right"
      ? `M ${x} ${y} l 8 0 4 -7 4 14 4 -14 4 14 4 -7 6 0`
      : place === "top"
        ? `M ${x} ${y} l 0 -8 -7 -4 14 -4 -14 -4 14 -4 -7 -4 0 -6`
        : `M ${x} ${y} l 0 8 -7 4 14 4 -14 4 14 4 -7 4 0 6`
  return <path className="spring" d={d} />
}

function Hatch({ x, y, place }: { x: number; y: number; place: "left" | "right" | "top" | "bottom" }) {
  const ticks = [-10, 0, 10]
  if (place === "left" || place === "right") {
    const dir = place === "left" ? -1 : 1
    return (
      <g>
        {ticks.map((d) => <line key={d} className="hatch" x1={x} y1={y + d} x2={x + dir * 12} y2={y + d + 8} />)}
      </g>
    )
  }
  const dir = place === "top" ? -1 : 1
  return (
    <g>
      {ticks.map((d) => <line key={d} className="hatch" x1={x + d} y1={y} x2={x + d + 8} y2={y + dir * 12} />)}
    </g>
  )
}

function atSample(samples: DrawSample[] | undefined, y: number, key: "sigmaMpa" | "tauMpa"): number | null {
  if (!samples || samples.length === 0) return null
  const ordered = [...samples].sort((p, q) => p.yMm - q.yMm)
  if (y <= ordered[0]!.yMm) return ordered[0]![key]
  const last = ordered[ordered.length - 1]!
  if (y >= last.yMm) return last[key]
  for (let i = 1; i < ordered.length; i++) {
    const hi = ordered[i]!
    const lo = ordered[i - 1]!
    if (y <= hi.yMm) {
      const t = (y - lo.yMm) / Math.max(1e-9, hi.yMm - lo.yMm)
      return lo[key] + t * (hi[key] - lo[key])
    }
  }
  return last[key]
}

function StressPlot({
  pt, pb, sigma1, psi, tau, b, samples, kind,
}: {
  pt: number
  pb: number
  sigma1: number
  psi: number
  tau: number
  b: number
  samples?: DrawSample[]
  kind: "sigma" | "tau"
}) {
  const left = 600
  const width = 188
  const n = 20
  const values: number[] = []
  for (let i = 0; i <= n; i++) {
    const y = (b * i) / n
    if (kind === "tau") values.push(atSample(samples, y, "tauMpa") ?? tau)
    else values.push(atSample(samples, y, "sigmaMpa") ?? sigma1 * (1 - (1 - psi) * (i / n)))
  }
  if (values.every((v) => Math.abs(v) < 1e-9)) return null
  const peak = Math.max(1e-9, ...values.map((v) => Math.abs(v)))
  const zeroX = left + width * 0.55
  const scale = (width * 0.4) / peak
  const yAt = (i: number) => pb - ((pb - pt) * i) / n
  const points = values.map((v, i) => `${zeroX + v * scale},${yAt(i)}`).join(" ")
  const bottom = values[0] ?? 0
  const top = values[values.length - 1] ?? 0
  return (
    <g>
      <text className="cap" x={left} y={pt - 8}>{kind === "tau" ? "τxy" : "σx"} N/mm²</text>
      <line className="dim" x1={zeroX} y1={pt} x2={zeroX} y2={pb} />
      <polyline fill="none" stroke="#111" strokeWidth="1.8" points={points} />
      <text className="tag" x={Math.min(790, zeroX + 8)} y={pb - 4}>{kind === "tau" ? "τ" : "σ1"} {mm(bottom)}</text>
      <text className="tag" x={Math.min(790, zeroX + 8)} y={pt + 14}>{kind === "tau" ? "τ" : "σ2"} {mm(top)}</text>
      <text className="tag" x={left} y={pt + 28}>{kind === "tau" ? "SHEAR" : Math.abs(psi - 1) < 1e-6 ? "UNIFORM" : `ψ ${trimNum(psi, 2)}`}</text>
    </g>
  )
}

function EffectiveZone({
  pl, pt, pr, pb, b, sigma1, psi, rho,
}: {
  pl: number
  pt: number
  pr: number
  pb: number
  a: number
  b: number
  sigma1: number
  psi: number
  rho: number
}) {
  const yTo = (y: number) => pb - (y / b) * (pb - pt)
  const bands: { y0: number; y1: number }[] = []
  if (Math.abs(psi - 1) < 0.02) {
    const edge = (rho * b) / 2
    if (edge > 0 && edge * 2 < b - 0.5) bands.push({ y0: edge, y1: b - edge })
  } else if (sigma1 > 0 && psi < 1) {
    const compression = Math.min(b, Math.max(0, b / (1 - psi)))
    const kept = Math.min(compression, Math.max(0, rho * compression))
    if (kept < compression - 0.5) bands.push({ y0: kept, y1: compression })
  }
  return (
    <g>
      {bands.map((band) => (
        <rect
          key={`${band.y0}-${band.y1}`}
          className="ineff"
          x={pl}
          y={yTo(band.y1)}
          width={pr - pl}
          height={Math.max(1, yTo(band.y0) - yTo(band.y1))}
        />
      ))}
      <text className="cap" x={pl} y={pb + 18}>ρ = {trimNum(rho, 3)} · DEVELOPMENT PREVIEW — NOT A CODE RESULT</text>
    </g>
  )
}
