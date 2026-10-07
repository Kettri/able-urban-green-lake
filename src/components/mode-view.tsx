import { useEffect, useRef, useState } from "react"
import type { FemMode } from "../plate/fem.ts"

type Props = {
  xs: number[]
  ys: number[]
  modes: FemMode[]
  modeIndex: number
  onMode: (index: number) => void
}

export function ModeView({ xs, ys, modes, modeIndex, onMode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [yaw, setYaw] = useState(-0.7)
  const [pitch, setPitch] = useState(0.65)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(0.22)
  const [meshOn, setMeshOn] = useState(true)
  const [contourOn, setContourOn] = useState(true)
  const [outlineOn, setOutlineOn] = useState(true)
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number; pan: { x: number; y: number }; button: number } | null>(null)
  const [tick, setTick] = useState(0)
  const mode = modes[modeIndex]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => setTick((value) => value + 1))
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(width * ratio))
    canvas.height = Math.max(1, Math.floor(height * ratio))
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.fillStyle = "#f6f4ee"
    ctx.fillRect(0, 0, width, height)
    if (!mode || xs.length < 2 || ys.length < 2 || mode.w.length !== xs.length * ys.length) {
      ctx.fillStyle = "#111"
      ctx.font = "14px 'IBM Plex Mono', monospace"
      ctx.fillText("Run FEM to calculate a mode shape.", 16, 28)
      return
    }
    const a = xs[xs.length - 1] ?? 1
    const b = ys[ys.length - 1] ?? 1
    const amp = scale * Math.min(a, b)
    const fit = Math.min(width, height) / Math.max(a, b) * 0.72 * zoom
    const project = (x: number, y: number, z: number) => {
      const X = x - a / 2
      const Y = y - b / 2
      const cy = Math.cos(yaw)
      const sy = Math.sin(yaw)
      const x1 = X * cy - Y * sy
      const y1 = X * sy + Y * cy
      const cp = Math.cos(pitch)
      const sp = Math.sin(pitch)
      const y2 = y1 * cp - z * sp
      const z2 = y1 * sp + z * cp
      return { x: width / 2 + pan.x + x1 * fit, y: height / 2 + pan.y - z2 * fit, depth: y2 }
    }
    const nx = xs.length
    const ny = ys.length
    const point = (ix: number, iy: number, deformed: boolean) => {
      const w = deformed ? (mode.w[iy * nx + ix] ?? 0) * amp : 0
      return project(xs[ix] ?? 0, ys[iy] ?? 0, w)
    }
    if (contourOn) {
      const faces: { depth: number; pts: { x: number; y: number }[]; shade: number }[] = []
      for (let iy = 0; iy < ny - 1; iy++) {
        for (let ix = 0; ix < nx - 1; ix++) {
          const corners = [point(ix, iy, true), point(ix + 1, iy, true), point(ix + 1, iy + 1, true), point(ix, iy + 1, true)]
          const depth = corners.reduce((sum, p) => sum + p.depth, 0) / 4
          const wAvg = [0, 1, 2, 3].reduce((sum, _k, index) => {
            const cx = index === 1 || index === 2 ? ix + 1 : ix
            const cy = index >= 2 ? iy + 1 : iy
            return sum + Math.abs(mode.w[cy * nx + cx] ?? 0)
          }, 0) / 4
          faces.push({ depth, pts: corners, shade: wAvg })
        }
      }
      faces.sort((p, q) => q.depth - p.depth)
      for (const face of faces) {
        const grey = Math.round(244 - face.shade * 150)
        ctx.beginPath()
        ctx.moveTo(face.pts[0]!.x, face.pts[0]!.y)
        for (const p of face.pts.slice(1)) ctx.lineTo(p.x, p.y)
        ctx.closePath()
        ctx.fillStyle = `rgb(${grey},${grey},${Math.max(210, grey - 8)})`
        ctx.fill()
      }
    }
    if (meshOn) {
      ctx.strokeStyle = "#111"
      ctx.lineWidth = 0.6
      ctx.beginPath()
      for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
          const p = point(ix, iy, true)
          if (ix + 1 < nx) {
            const q = point(ix + 1, iy, true)
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
          }
          if (iy + 1 < ny) {
            const q = point(ix, iy + 1, true)
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
          }
        }
      }
      ctx.stroke()
    }
    if (outlineOn) {
      ctx.strokeStyle = "#111"
      ctx.setLineDash([5, 4])
      ctx.lineWidth = 1.1
      ctx.beginPath()
      const corners = [point(0, 0, false), point(nx - 1, 0, false), point(nx - 1, ny - 1, false), point(0, ny - 1, false)]
      ctx.moveTo(corners[0]!.x, corners[0]!.y)
      for (const p of corners.slice(1)) ctx.lineTo(p.x, p.y)
      ctx.closePath()
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.fillStyle = "#111"
    ctx.font = "12px 'IBM Plex Mono', monospace"
    ctx.fillText("NORMALISED EIGENMODE — DISPLAY SCALE IS NOT PHYSICAL DISPLACEMENT", 12, height - 14)
  }, [xs, ys, mode, yaw, pitch, zoom, pan, scale, meshOn, contourOn, outlineOn, tick])

  return (
    <div>
      <p className="toolNote">Positive eigenvalues only. The shape is the Lanczos eigenvector, not a substituted sine. Negative partners stay in the solver note.</p>
      <div className="toolTabs" role="tablist">
        {modes.map((item, index) => (
          <button key={item.lambda + index} type="button" className={modeIndex === index ? "on" : ""} onClick={() => onMode(index)}>
            MODE {index + 1}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        className="modeCanvas"
        aria-label="Buckling mode shape from the calculated eigenvector"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { x: event.clientX, y: event.clientY, yaw, pitch, pan, button: event.shiftKey ? 2 : event.button }
        }}
        onPointerMove={(event) => {
          const start = drag.current
          if (!start) return
          const dx = event.clientX - start.x
          const dy = event.clientY - start.y
          if (start.button === 2 || event.shiftKey) setPan({ x: start.pan.x + dx, y: start.pan.y + dy })
          else {
            setYaw(start.yaw + dx * 0.01)
            setPitch(Math.max(-1.2, Math.min(1.2, start.pitch + dy * 0.01)))
          }
        }}
        onPointerUp={() => { drag.current = null }}
        onWheel={(event) => {
          event.preventDefault()
          setZoom((value) => Math.max(0.4, Math.min(4, value * (event.deltaY > 0 ? 0.92 : 1.08))))
        }}
      />
      <div className="toolToolbar">
        <label className="field"><span>Display scale</span><input className="toolField" type="range" min={0.04} max={0.6} step={0.01} value={scale} onChange={(event) => setScale(Number(event.target.value))} /></label>
        <button type="button" className="toolBtn" onClick={() => setMeshOn((v) => !v)}>{meshOn ? "MESH ON" : "MESH OFF"}</button>
        <button type="button" className="toolBtn" onClick={() => setContourOn((v) => !v)}>{contourOn ? "CONTOUR ON" : "CONTOUR OFF"}</button>
        <button type="button" className="toolBtn" onClick={() => setOutlineOn((v) => !v)}>{outlineOn ? "OUTLINE ON" : "OUTLINE OFF"}</button>
      </div>
      <p className="toolNote">Drag to rotate. Shift-drag to pan. Scroll to zoom. The shape is the calculated eigenvector, normalised so the largest |w| is 1.</p>
      {mode ? <p className="toolNote">λ = {mode.lambda.toExponential(3)}{mode.sigma1CrMpa != null ? ` · σ1,cr = ${mode.sigma1CrMpa.toFixed(2)} MPa` : ""}</p> : null}
    </div>
  )
}
