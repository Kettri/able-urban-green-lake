type Props = {
  hot: string | null
  dText: string
  pitchText: string
  kText: string | null
  sText: string | null
  lengthText: string | null
  threadText: string | null
  dMm: number
  kMm: number | null
  sMm: number | null
  minorMm: number | null
  lengthMm: number | null
  threadMm: number | null
}

const W = 720

export function BoltDiagram(props: Props) {
  if (!(props.dMm > 0)) {
    return (
      <div className="drawingFrame">
        <p className="drawingCaption">No figure — this combination is not in the dataset.</p>
      </div>
    )
  }

  const d = props.dMm
  const hasHead = props.kMm != null && props.sMm != null && props.kMm > 0 && props.sMm > 0
  const dPx = 78
  const sRatio = hasHead ? props.sMm! / d : 1.5
  const kRatio = hasHead ? props.kMm! / d : 0.64
  const sPx = dPx * Math.min(Math.max(sRatio, 1.3), 1.9)
  const kPx = dPx * Math.min(Math.max(kRatio, 0.42), 0.9)

  const topPad = 22
  const cy = topPad + sPx / 2
  const headLeft = 36
  const headRight = headLeft + kPx
  const tipX = 548
  const shankTop = cy - dPx / 2
  const shankBot = cy + dPx / 2
  const headTop = cy - sPx / 2
  const headBot = cy + sPx / 2
  const cham = Math.min(16, Math.max(7, (sPx - dPx) * 0.32))
  const tipC = Math.min(9, dPx * 0.11)

  let threadFrac = 0.4
  if (props.lengthMm != null && props.threadMm != null && props.lengthMm > 0 && props.threadMm > 0) {
    threadFrac = Math.min(0.96, Math.max(0.08, props.threadMm / props.lengthMm))
  }
  const threadStart = headRight + (tipX - headRight) * (1 - threadFrac)
  const fullThread = threadFrac > 0.92

  const minor = props.minorMm != null && props.minorMm > 0 && props.minorMm < d ? props.minorMm : d * 0.85
  const inset = Math.max(8, ((d - minor) / d) * dPx / 2)
  const minorTop = shankTop + inset
  const minorBot = shankBot - inset
  const minorEnd = tipX - tipC - 4

  const dimK = headBot + 30
  const dimB = dimK + 34
  const dimL = dimB + 34
  const afterL = dimL + 20

  const hexR = sPx / Math.sqrt(3)
  const hexCx = 118
  const hexCy = afterL + hexR + 10
  const hexBot = hexCy + hexR
  const dimS = hexBot + 26
  const pW = 72
  const pH = (Math.sqrt(3) / 2) * pW
  const profileX = hexCx + sPx / 2 + 64
  const rootY = Math.max(hexCy + 8, afterL + pH + 36)
  const crestY = rootY - pH
  const dimP = rootY + 28
  const H = Math.max(dimS + 36, dimP + 28)
  const bSpan = tipX - threadStart
  const bTextX = bSpan >= 128 ? (threadStart + tipX) / 2 : threadStart - 8
  const bAnchor = bSpan >= 128 ? "middle" : "end"
  const bExtTop = threadStart < headRight + 140 ? dimK + 14 : shankBot + 5

  const on = (id: string) => (props.hot === id ? "hotline" : "")
  const tx = (id: string) => (props.hot === id ? "hot" : "")
  const kLabel = props.kText ? `k ${props.kText}` : "k"
  const sLabel = props.sText ? `s ${props.sText}` : "s"
  const lLabel = props.lengthText ? `L ${props.lengthText}` : "L"
  const bLabel = props.threadText ? `b ${props.threadText}` : "b"

  const headPath = [
    `M ${headLeft + cham} ${headTop}`,
    `H ${headRight}`,
    `V ${headBot}`,
    `H ${headLeft + cham}`,
    `L ${headLeft} ${headBot - cham}`,
    `V ${headTop + cham}`,
    "Z",
  ].join(" ")

  const shankPath = [
    `M ${headRight} ${shankTop}`,
    `H ${tipX - tipC}`,
    `L ${tipX} ${shankTop + tipC}`,
    `V ${shankBot - tipC}`,
    `L ${tipX - tipC} ${shankBot}`,
    `H ${headRight}`,
    "Z",
  ].join(" ")

  const hex = hexPoints(hexCx, hexCy, sPx)
  const flatBottom = hexCy + hexR / 2

  return (
    <div className="drawingFrame">
      <svg className="boltSvg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Orthographic hex bolt, end view and thread profile">
        <defs>
          <marker id="boltArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="context-stroke" />
          </marker>
        </defs>

        <path className={`line ${hasHead ? on("k") : "ghost"}`} d={headPath} />
        <path className={`line ${on("d")}`} d={shankPath} />
        <line className="center" x1={headLeft - 14} y1={cy} x2={tipX + 12} y2={cy} />
        {minorEnd > threadStart + 6 ? (
          <g className={`minor ${on("b")}`}>
            <line x1={threadStart} y1={minorTop} x2={minorEnd} y2={minorTop} />
            <line x1={threadStart} y1={minorBot} x2={minorEnd} y2={minorBot} />
          </g>
        ) : null}
        {fullThread ? null : (
          <line className={`minor ${on("b")}`} x1={threadStart} y1={shankTop} x2={threadStart} y2={shankBot} />
        )}

        <g className={on("k")}>
          <line className="ext" x1={headLeft} y1={headBot + 5} x2={headLeft} y2={dimK + 5} />
          <line className="ext" x1={headRight} y1={headBot + 5} x2={headRight} y2={dimL + 5} />
          <line className="dim" x1={headLeft} y1={dimK} x2={headRight} y2={dimK} markerStart="url(#boltArrow)" markerEnd="url(#boltArrow)" />
        </g>
        <text className={tx("k")} x={headRight + 12} y={dimK - 6}>{hasHead ? kLabel : "k —"}</text>

        <g className={on("b")}>
          <line className="ext" x1={threadStart} y1={bExtTop} x2={threadStart} y2={dimB + 5} />
          <line className="ext" x1={tipX} y1={shankBot + 5} x2={tipX} y2={dimL + 5} />
          <line className="dim" x1={threadStart} y1={dimB} x2={tipX} y2={dimB} markerStart="url(#boltArrow)" markerEnd="url(#boltArrow)" />
        </g>
        <text className={tx("b")} x={bTextX} y={dimB - 7} textAnchor={bAnchor}>{bLabel}</text>

        <g className={on("L")}>
          <line className="dim" x1={headRight} y1={dimL} x2={tipX} y2={dimL} markerStart="url(#boltArrow)" markerEnd="url(#boltArrow)" />
        </g>
        <text className={tx("L")} x={(headRight + tipX) / 2} y={dimL - 7} textAnchor="middle">{lLabel}</text>

        <g className={on("d")}>
          <line className="ext" x1={tipX + 5} y1={shankTop} x2={tipX + 28} y2={shankTop} />
          <line className="ext" x1={tipX + 5} y1={shankBot} x2={tipX + 28} y2={shankBot} />
          <line className="dim" x1={tipX + 22} y1={shankTop} x2={tipX + 22} y2={shankBot} markerStart="url(#boltArrow)" markerEnd="url(#boltArrow)" />
        </g>
        <text className={tx("d")} x={tipX + 30} y={cy + 4}>d {props.dText}</text>

        {hasHead ? (
          <>
            <polygon className={`line ${on("s")}`} points={hex} />
            <circle className="line" cx={hexCx} cy={hexCy} r={dPx / 2} />
            <line className="center" x1={hexCx - hexR - 8} y1={hexCy} x2={hexCx + hexR + 8} y2={hexCy} />
            <line className="center" x1={hexCx} y1={hexCy - hexR - 8} x2={hexCx} y2={hexCy + hexR + 8} />
            <g className={on("s")}>
              <line className="ext" x1={hexCx - sPx / 2} y1={flatBottom + 4} x2={hexCx - sPx / 2} y2={dimS + 5} />
              <line className="ext" x1={hexCx + sPx / 2} y1={flatBottom + 4} x2={hexCx + sPx / 2} y2={dimS + 5} />
              <line className="dim" x1={hexCx - sPx / 2} y1={dimS} x2={hexCx + sPx / 2} y2={dimS} markerStart="url(#boltArrow)" markerEnd="url(#boltArrow)" />
            </g>
            <text className={tx("s")} x={hexCx} y={dimS + 16} textAnchor="middle">{sLabel}</text>
          </>
        ) : (
          <>
            <circle className="line ghost" cx={hexCx} cy={hexCy} r={dPx / 2} />
            <text className="muted" x={hexCx} y={hexCy + dPx / 2 + 22} textAnchor="middle">Head not in dataset</text>
          </>
        )}

        <g className={on("P")}>
          <path className="line" d={`M ${profileX} ${rootY} L ${profileX + pW / 2} ${crestY} L ${profileX + pW} ${rootY}`} />
          <line className="ext" x1={profileX} y1={rootY + 4} x2={profileX} y2={dimP + 5} />
          <line className="ext" x1={profileX + pW} y1={rootY + 4} x2={profileX + pW} y2={dimP + 5} />
          <line className="dim" x1={profileX} y1={dimP} x2={profileX + pW} y2={dimP} markerStart="url(#boltArrow)" markerEnd="url(#boltArrow)" />
        </g>
        <text className={tx("P")} x={profileX + pW / 2} y={crestY - 8} textAnchor="middle">60°</text>
        <text className={tx("P")} x={profileX + pW + 12} y={dimP + 4}>P {props.pitchText}</text>
      </svg>
      <p className="drawingCaption">
        Orthographic elevation, head end view and basic profile. Dimension lines sit outside the part.
        Thread on the bolt is the simplified form (outline plus minor lines), not crossing diagonals.
        L is the length under the head. b is the threaded length. Enter both and the thread is drawn to b/L.
        Proportions follow d, s and k. Not a fabrication drawing.
      </p>
    </div>
  )
}

function hexPoints(cx: number, cy: number, acrossFlats: number): string {
  const radius = acrossFlats / Math.sqrt(3)
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = ((30 + i * 60) * Math.PI) / 180
    pts.push(`${cx + radius * Math.cos(angle)},${cy - radius * Math.sin(angle)}`)
  }
  return pts.join(" ")
}
