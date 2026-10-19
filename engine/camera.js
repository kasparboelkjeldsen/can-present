// Prezi-style smooth zoom/pan (van Wijk & Nuij, "Smooth and efficient zooming and panning").
// Same maths as d3-interpolate's interpolateZoom. A view is [cx, cy, w] where w = visible world width.
const RHO = 1.35
const RHO2 = RHO * RHO
const RHO4 = RHO2 * RHO2

export function interpolateZoom([ux0, uy0, w0], [ux1, uy1, w1]) {
  const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy
  let S, fn
  if (d2 < 1e-6) {
    S = Math.log(w1 / w0) / RHO
    fn = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(RHO * t * S)]
  } else {
    const d1 = Math.sqrt(d2)
    const b0 = (w1 * w1 - w0 * w0 + RHO4 * d2) / (2 * w0 * RHO2 * d1)
    const b1 = (w1 * w1 - w0 * w0 - RHO4 * d2) / (2 * w1 * RHO2 * d1)
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0)
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1)
    S = (r1 - r0) / RHO
    fn = (t) => {
      const s = t * S
      const coshr0 = Math.cosh(r0)
      const u = (w0 / (RHO2 * d1)) * (coshr0 * Math.tanh(RHO * s + r0) - Math.sinh(r0))
      return [ux0 + u * dx, uy0 + u * dy, (w0 * coshr0) / Math.cosh(RHO * s + r0)]
    }
  }
  fn.duration = (Math.abs(S) * 1000 * RHO) / Math.SQRT2
  return fn
}

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function shortestAngle(from, to) {
  const d = ((((to - from) % 360) + 540) % 360) - 180
  return from + d
}
