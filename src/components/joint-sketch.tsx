type Props = {
  hot: string | null
  threadPlanes: number
  shankPlanes: number
  endOn: boolean
}

type Mode = "thread" | "shank" | "double"

/**
 * One SVG section through a lap joint. Labels stay in the margins.
 * Heavy arrows are applied actions. Thin arrows are dimensions.
 */
export function JointSketch({ hot, threadPlanes, shankPlanes, endOn }: Props) {
  const on = (id: string) => (hot === id ? "hot" : "")
  const planes = threadPlanes + shankPlanes
  const mode: Mode = planes >= 2 ? "double" : shankPlanes > 0 && threadPlanes === 0 ? "shank" : "thread"
  const threadAtJoint = mode !== "shank"
  const g = mode === "double" ? doubleGeom() : singleGeom()
  const thread = threadSpan(mode, threadPlanes, shankPlanes, g)
  const aeText = endOn ? "ae" : "ae NOT CHECKED"

  return (
    <div>
      <div className="drawingFrame jointFrame">
        <svg className="jointSvg" viewBox="0 0 660 520" role="img" aria-label="Section through a bolted lap joint">
          <defs>
            <marker id="jLoad" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="9" markerHeight="9" orient="auto">
              <path d="M0 0.4 L12 6 L0 11.6 Z" fill="#111" />
            </marker>
            <marker id="jDim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0 1.4 L9 5 L0 8.6 Z" fill="#111" />
            </marker>
          </defs>

          <text className="cap" x="12" y="22">{mode === "double" ? "TWO SHEAR PLANES — NOT TO SCALE" : "SINGLE SHEAR LAP — NOT TO SCALE"}</text>

          {g.plates.map((plate) => (
            <Hatch key={plate.id} id={plate.id} box={plate} holeL={g.holeL} holeR={g.holeR} hot={on("t")} />
          ))}

          <g className={on("d")}>
            <path className="bolt" d={nutPath(g.nut)} />
            <path className="bolt" d={headPath(g.head)} />
            <Shank xL={g.shankL} xR={g.shankR} y0={g.head.y + g.head.h} y1={g.nut.y + g.nut.h - 4} thread0={thread.y0} thread1={thread.y1} />
            <line className="center" x1={g.cx} y1={g.head.y + 10} x2={g.cx} y2={g.nut.y + g.nut.h - 8} />
          </g>

          <g className={on(threadAtJoint ? "nn" : "nx")}>
            {g.shears.map((y) => (
              <line key={y} className="shear" x1={g.shearL} y1={y} x2={g.shearR} y2={y} />
            ))}
          </g>

          <g className={`action ${on("V")}`}>
            <line x1={g.vTop.x2} y1={g.vTop.y} x2={g.vTop.x1} y2={g.vTop.y} markerEnd="url(#jLoad)" />
            <text x={g.vTop.labelX} y={g.vTop.labelY}>V*</text>
            <line x1={g.vBot.x1} y1={g.vBot.y} x2={g.vBot.x2} y2={g.vBot.y} markerEnd="url(#jLoad)" />
            <text x={g.vBot.labelX} y={g.vBot.labelY}>V*</text>
          </g>
          <g className={`action ${on("N")}`}>
            <line x1={g.cx} y1={g.head.y - 6} x2={g.cx} y2={30} markerEnd="url(#jLoad)" />
            <text x={g.cx + 12} y={46}>N*</text>
            <line x1={g.nDownX} y1={g.nut.y + g.nut.h + 10} x2={g.nDownX} y2={g.nut.y + g.nut.h + 52} markerEnd="url(#jLoad)" />
            <text x={g.nDownX - 28} y={g.nut.y + g.nut.h + 40}>N*</text>
          </g>

          <g className={on("t")}>
            <line className="witness" x1={g.plates[0]!.x} y1={g.plates[0]!.y + 3} x2={g.tX + 8} y2={g.plates[0]!.y + 3} />
            <line className="witness" x1={g.plates[0]!.x} y1={g.plates[0]!.y + g.plates[0]!.h - 3} x2={g.tX + 8} y2={g.plates[0]!.y + g.plates[0]!.h - 3} />
            <line className="dim" x1={g.tX} y1={g.plates[0]!.y + 8} x2={g.tX} y2={g.plates[0]!.y + g.plates[0]!.h - 8} markerStart="url(#jDim)" markerEnd="url(#jDim)" />
            <text x={g.tX - 16} y={(g.plates[0]!.y + g.plates[0]!.y + g.plates[0]!.h) / 2 + 4}>t</text>
          </g>

          <g className={on("lj")}>
            <line className="witness" x1={g.lj.x1} y1={g.lj.y0} x2={g.lj.x1} y2={g.lj.y - 8} />
            <line className="witness" x1={g.lj.x2} y1={g.lj.y0} x2={g.lj.x2} y2={g.lj.y - 8} />
            <line className="tick" x1={g.lj.x2} y1={g.lj.tick0} x2={g.lj.x2} y2={g.lj.tick1} />
            <line className="dim" x1={g.lj.x1 + 4} y1={g.lj.y} x2={g.lj.x2 - 4} y2={g.lj.y} markerStart="url(#jDim)" markerEnd="url(#jDim)" />
            <text x={(g.lj.x1 + g.lj.x2) / 2 - 8} y={g.lj.y - 8}>lj</text>
          </g>

          <g className={on("ae")}>
            <line className="witness" x1={g.cx} y1={g.ae.break0} x2={g.cx} y2={g.ae.break1} />
            <line className="witness" x1={g.cx} y1={g.ae.break2} x2={g.cx} y2={g.ae.y - 8} />
            <line className="witness" x1={g.ae.x2} y1={g.ae.y0} x2={g.ae.x2} y2={g.ae.y - 8} />
            <line className="dim" x1={g.cx + 4} y1={g.ae.y} x2={g.ae.x2 - 4} y2={g.ae.y} markerStart="url(#jDim)" markerEnd="url(#jDim)" />
            <text x={(g.cx + g.ae.x2) / 2 - aeText.length * 4.2} y={g.ae.y - 10}>{aeText}</text>
          </g>

          <Leader x={12} y={96} text="PLATE 1" x2={g.plates[0]!.x + 28} y2={g.plates[0]!.y + 4} hot={on("t")} />
          <Leader x={12} y={g.shears[0]! + 4} text="INTERFACE" x2={g.plates[0]!.x - 4} y2={g.shears[0]!} hot={on(threadAtJoint ? "nn" : "nx")} />
          <Leader x={12} y={thread.labelY} text={thread.label} x2={thread.x2} y2={thread.y2} kneeX={thread.kneeX} kneeY={thread.kneeY} hot={on(thread.hot)} />
          {thread.plainLabel ? (
            <Leader x={12} y={thread.plainY} text="PLAIN SHANK" x2={g.shankL} y2={thread.plainTarget} hot={on("nx")} />
          ) : null}
          <Leader x={12} y={g.nut.y + 22} text="NUT" x2={g.nut.x} y2={g.nut.y + 16} hot={on("d")} />
          <Leader x={548} y={78} text="HEAD" x2={g.head.x + g.head.w} y2={g.head.y + 18} hot={on("d")} />
          <Leader x={548} y={g.shears[0]! - 14} text="HOLE" x2={g.holeR} y2={g.shears[0]! - 10} hot={on("d")} />
          <Leader x={548} y={g.shears[0]! + 18} text={g.shears.length > 1 ? "SHEAR PLANES" : "SHEAR PLANE"} x2={g.shearR} y2={g.shears[0]!} hot={on(threadAtJoint ? "nn" : "nx")} />
          <Leader x={548} y={g.plates[1]!.y + g.plates[1]!.h / 2 + 4} text="PLATE 2" x2={g.plates[1]!.x + g.plates[1]!.w} y2={g.plates[1]!.y + g.plates[1]!.h / 2} hot={on("t")} />
          <text className="cap" x="12" y="508">HEAVY ARROW = APPLIED ACTION    THIN ARROW = DIMENSION</text>
        </svg>
      </div>
      <div className="caseRow">
        <Case title="Thread in shear" on={mode === "thread"} />
        <Case title="Shank in shear" on={mode === "shank"} />
        <Case title="Two planes" on={mode === "double"} />
      </div>
    </div>
  )
}

type Box = { x: number; y: number; w: number; h: number }

type Geom = {
  plates: { id: string; x: number; y: number; w: number; h: number }[]
  holeL: number
  holeR: number
  shankL: number
  shankR: number
  cx: number
  head: Box
  nut: Box
  shears: number[]
  shearL: number
  shearR: number
  tX: number
  vTop: { x1: number; x2: number; y: number; labelX: number; labelY: number }
  vBot: { x1: number; x2: number; y: number; labelX: number; labelY: number }
  nDownX: number
  lj: { x1: number; x2: number; y: number; y0: number; tick0: number; tick1: number }
  ae: { x2: number; y: number; y0: number; break0: number; break1: number; break2: number }
}

function singleGeom(): Geom {
  const p1 = { id: "p1", x: 188, y: 104, w: 236, h: 52 }
  const p2 = { id: "p2", x: 300, y: 196, w: 246, h: 52 }
  const p1b = p1.y + p1.h
  const p2b = p2.y + p2.h
  const holeL = 352
  const holeR = 408
  const shankL = 364
  const shankR = 396
  const cx = 380
  const head = { x: 338, y: 56, w: 84, h: 48 }
  const nut = { x: 346, y: p2b, w: 68, h: 36 }
  const shear = (p1b + p2.y) / 2
  return {
    plates: [p1, p2],
    holeL, holeR, shankL, shankR, cx, head, nut,
    shears: [shear],
    shearL: p1.x + 8,
    shearR: p2.x + p2.w - 36,
    tX: 170,
    vTop: { x1: p1.x + 8, x2: head.x - 24, y: head.y + 28, labelX: p1.x + 36, labelY: head.y + 20 },
    vBot: { x1: nut.x + nut.w + 16, x2: p2.x + p2.w - 16, y: p2b + 18, labelX: nut.x + nut.w + 28, labelY: p2b + 10 },
    nDownX: p2.x - 28,
    lj: { x1: p2.x, x2: p1.x + p1.w, y: 368, y0: p2b + 8, tick0: p1b + 2, tick1: p2.y - 2 },
    ae: { x2: p2.x + p2.w, y: 448, y0: p2b + 8, break0: nut.y + nut.h + 8, break1: 352, break2: 384 },
  }
}

function doubleGeom(): Geom {
  const top = { id: "p1", x: 188, y: 96, w: 220, h: 42 }
  const mid = { id: "p2", x: 300, y: 158, w: 246, h: 64 }
  const bot = { id: "p3", x: 188, y: 242, w: 220, h: 42 }
  const holeL = 352
  const holeR = 408
  const shankL = 364
  const shankR = 396
  const cx = 380
  const head = { x: 338, y: 52, w: 84, h: 44 }
  const nut = { x: 346, y: 284, w: 68, h: 32 }
  return {
    plates: [top, mid, bot],
    holeL, holeR, shankL, shankR, cx, head, nut,
    shears: [148, 232],
    shearL: 200,
    shearR: 520,
    tX: 170,
    vTop: { x1: 196, x2: 310, y: 78, labelX: 236, labelY: 70 },
    vBot: { x1: 440, x2: 530, y: 308, labelX: 468, labelY: 300 },
    nDownX: 292,
    lj: { x1: 300, x2: 408, y: 410, y0: 292, tick0: 138, tick1: 154 },
    ae: { x2: 546, y: 488, y0: 292, break0: 324, break1: 396, break2: 424 },
  }
}

function threadSpan(mode: Mode, nn: number, nx: number, g: Geom) {
  const gripTop = g.head.y + g.head.h + 8
  const nutTop = g.nut.y + 4
  const nutBot = g.nut.y + g.nut.h - 8
  if (mode === "shank") {
    return {
      y0: nutTop,
      y1: nutBot,
      label: "PLAIN SHANK",
      labelY: 236,
      x2: g.shankL,
      y2: g.shears[0]! + 10,
      kneeX: 176,
      kneeY: g.shears[0]! + 10,
      hot: "nx",
      plainLabel: false,
      plainY: 0,
      plainTarget: 0,
    }
  }
  if (mode === "double" && nn > 0 && nx > 0) {
    const split = g.shears[1]! - 16
    return {
      y0: gripTop,
      y1: split,
      label: "THREADED PORTION",
      labelY: 214,
      x2: g.shankL,
      y2: g.shears[0]! + 10,
      kneeX: 176,
      kneeY: g.shears[0]! + 10,
      hot: "nn",
      plainLabel: true,
      plainY: g.shears[1]! - 2,
      plainTarget: g.shears[1]! - 8,
    }
  }
  return {
    y0: gripTop,
    y1: nutBot,
    label: "THREADED PORTION",
    labelY: mode === "double" ? 214 : 236,
    x2: g.shankL,
    y2: g.shears[0]! + 10,
    kneeX: 176,
    kneeY: g.shears[0]! + 10,
    hot: "nn",
    plainLabel: false,
    plainY: 0,
    plainTarget: 0,
  }
}

function headPath(h: Box) {
  return `M ${h.x} ${h.y + 8} L ${h.x + 8} ${h.y} H ${h.x + h.w - 8} L ${h.x + h.w} ${h.y + 8} V ${h.y + h.h} H ${h.x} Z`
}

function nutPath(n: Box) {
  return `M ${n.x} ${n.y} H ${n.x + n.w} L ${n.x + n.w - 8} ${n.y + n.h} H ${n.x + 8} Z`
}

function platePath(b: { x: number; y: number; w: number; h: number }, holeL: number, holeR: number) {
  const x2 = b.x + b.w
  const y2 = b.y + b.h
  return `M ${b.x} ${b.y} H ${x2} V ${y2} H ${b.x} Z M ${holeL} ${b.y} H ${holeR} V ${y2} H ${holeL} Z`
}

function Hatch({ id, box, holeL, holeR, hot }: { id: string; box: { x: number; y: number; w: number; h: number }; holeL: number; holeR: number; hot: string }) {
  const d = platePath(box, holeL, holeR)
  const lines = []
  for (let i = -box.h; i < box.w + box.h; i += 8) {
    lines.push(<line key={i} x1={box.x + i} y1={box.y} x2={box.x + i - box.h} y2={box.y + box.h} />)
  }
  return (
    <g className={hot}>
      <clipPath id={id}><path d={d} fillRule="evenodd" /></clipPath>
      <path className="plate" d={d} fillRule="evenodd" />
      <g className="hatch" clipPath={`url(#${id})`}>{lines}</g>
    </g>
  )
}

function Shank({ xL, xR, y0, y1, thread0, thread1 }: { xL: number; xR: number; y0: number; y1: number; thread0: number; thread1: number }) {
  const depth = 5
  const t0 = Math.max(y0, Math.min(thread0, y1))
  const t1 = Math.max(t0, Math.min(thread1, y1))
  const crests = []
  for (let y = t0; y < t1 - 2; y += 10) {
    const yb = Math.min(y + 10, t1)
    const mid = (y + yb) / 2
    crests.push(<path key={`L${y}`} className="bolt" d={`M ${xL + depth} ${y} L ${xL} ${mid} L ${xL + depth} ${yb} Z`} />)
    crests.push(<path key={`R${y}`} className="bolt" d={`M ${xR - depth} ${y} L ${xR} ${mid} L ${xR - depth} ${yb} Z`} />)
  }
  return (
    <g>
      {t0 > y0 ? <rect className="bolt" x={xL} y={y0} width={xR - xL} height={t0 - y0} /> : null}
      {t1 > t0 ? <rect className="bolt" x={xL + depth} y={t0} width={xR - xL - depth * 2} height={t1 - t0} /> : null}
      {crests}
      {y1 > t1 ? <rect className="bolt" x={xL} y={t1} width={xR - xL} height={y1 - t1} /> : null}
    </g>
  )
}

function Leader({ x, y, text, x2, y2, hot, kneeX, kneeY }: { x: number; y: number; text: string; x2: number; y2: number; hot: string; kneeX?: number; kneeY?: number }) {
  const width = text.length * 8.6
  const toTheRight = x2 >= x + width
  const startX = toTheRight ? x + width + 8 : x - 8
  const startY = y - 4
  const points = kneeX == null ? `${startX},${startY} ${x2},${y2}` : `${startX},${startY} ${kneeX},${kneeY ?? startY} ${x2},${y2}`
  return (
    <g className={hot}>
      <polyline className="leader" points={points} />
      <circle className="dot" cx={x2} cy={y2} r="2.2" />
      <text x={x} y={y}>{text}</text>
    </g>
  )
}

function Case({ title, on }: { title: string; on: boolean }) {
  return <p className={on ? "caseChip on" : "caseChip"}>{title}</p>
}
