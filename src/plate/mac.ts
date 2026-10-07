/** Modal assurance on out-of-plane w. Sign is irrelevant. Not a design check. */

function bilinear(w: number[], xs: number[], ys: number[], x: number, y: number): number {
  const nx = xs.length
  const ny = ys.length
  if (nx < 2 || ny < 2 || w.length !== nx * ny) return 0
  let ix = 0
  while (ix < nx - 2 && xs[ix + 1]! < x) ix += 1
  let iy = 0
  while (iy < ny - 2 && ys[iy + 1]! < y) iy += 1
  const x0 = xs[ix]!
  const x1 = xs[ix + 1]!
  const y0 = ys[iy]!
  const y1 = ys[iy + 1]!
  const tx = x1 === x0 ? 0 : (x - x0) / (x1 - x0)
  const ty = y1 === y0 ? 0 : (y - y0) / (y1 - y0)
  const w00 = w[iy * nx + ix] ?? 0
  const w10 = w[iy * nx + ix + 1] ?? 0
  const w01 = w[(iy + 1) * nx + ix] ?? 0
  const w11 = w[(iy + 1) * nx + ix + 1] ?? 0
  const a = w00 * (1 - tx) + w10 * tx
  const b = w01 * (1 - tx) + w11 * tx
  return a * (1 - ty) + b * ty
}

function sample(w: number[], xs: number[], ys: number[], n: number): Float64Array {
  const out = new Float64Array(n * n)
  const a = xs[xs.length - 1] ?? 1
  const b = ys[ys.length - 1] ?? 1
  for (let j = 0; j < n; j++) {
    const y = (b * j) / Math.max(1, n - 1)
    for (let i = 0; i < n; i++) {
      const x = (a * i) / Math.max(1, n - 1)
      out[j * n + i] = bilinear(w, xs, ys, x, y)
    }
  }
  return out
}

/** (φᵢ·φⱼ)² / (‖φᵢ‖² ‖φⱼ‖²) after both modes are sampled on the same grid. */
export function modeMac(
  wA: number[],
  xsA: number[],
  ysA: number[],
  wB: number[],
  xsB: number[],
  ysB: number[],
  grid = 21,
): number {
  const a = sample(wA, xsA, ysA, grid)
  const b = sample(wB, xsB, ysB, grid)
  let ab = 0
  let aa = 0
  let bb = 0
  for (let i = 0; i < a.length; i++) {
    ab += a[i]! * b[i]!
    aa += a[i]! * a[i]!
    bb += b[i]! * b[i]!
  }
  if (!(aa > 0 && bb > 0)) return 0
  return (ab * ab) / (aa * bb)
}
