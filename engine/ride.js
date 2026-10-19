// Ride the packet: the flight into a scene follows a path (a diagram edge, or any SVG path)
// with the camera riding a pill along it, at close range, instead of zooming out and back in.
//
//   deck.js:  { id: 'inside', …, via: ride(arch, 0, ARCH, { label: 'scenes', zoom: 2.2 }) }
//             { id: 'other', …, via: { path: 'M100 500 C…', space: PARENT_AT, label: 'GET /', zoom: 2 } }
//
// `ride()` (engine/diagram.js) is sugar for the second form. `path` is any SVG path in the
// local 1920×1080 space of a card placed at `space` (the same transform as nest()).
//
// The flight has three phases that read as one motion: (1) a van Wijk zoom from the current view
// to the path's start at ride zoom, whose target is the pill itself, so the camera arrives already
// moving with it; (2) the pill runs along the path at a constant speed with the camera locked on it;
// (3) a van Wijk zoom from the (decelerating) pill into the destination. The velocity is continuous
// at both joins: phase 1 eases out onto a moving target, phase 3 eases in from one.
//
// Everything here is plain maths except sampleVia(), which measures the path with an off-screen
// SVGPathElement once per ride (cached). App.vue plays the plan; check.mjs uses validateVia().
import { W, H } from './layout.js'
import { interpolateZoom, shortestAngle } from './camera.js'

export const RIDE_TONES = ['ink', 'paper', 'accent', 'accent-2']
export const RIDE_DEFAULTS = { zoom: 2, speed: 400, bank: 0, reverse: false, tone: 'ink', label: '' }
const KEYS = ['path', 'space', 'label', 'zoom', 'speed', 'bank', 'reverse', 'tone', 'edge']
const MIN_TOTAL = 1.5 // s
const MAX_TOTAL = 4 // s
const RAMP = 0.6 // s: the pill speeds up from rest / slows down to rest over this long (at most)
// phases 1 and 3: smootherstep, gentler than a normal flight's cubic at the joins with the ride
const ease = (x) => x * x * x * (x * (6 * x - 15) + 10)

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const PATH_CHARS = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,+\-\s]+$/

/** Problems with a `via` value, as short messages ([] = fine). Runs in Node too (check.mjs). */
export function validateVia(via) {
  if (!via || typeof via !== 'object' || Array.isArray(via)) {
    return ["must be ride(diagram, edge, parentAt, opts) or { path: 'M…', space: parentAt, … }"]
  }
  const out = []
  for (const k of Object.keys(via)) if (!KEYS.includes(k)) out.push(`unknown option "${k}" (options: ${KEYS.filter((x) => x !== 'edge').join(', ')})`)
  if (typeof via.path !== 'string' || !via.path.trim()) out.push("path must be an SVG path string, e.g. 'M100 500 H900'")
  else if (!/^\s*[Mm]/.test(via.path) || !PATH_CHARS.test(via.path)) out.push(`path "${via.path.slice(0, 40)}" isn't an SVG path (it must start with M and use only path commands and numbers)`)
  const sp = via.space
  if (!sp || typeof sp !== 'object' || !isNum(sp.x) || !isNum(sp.y)) out.push('space must be the placement the path lives in ({ x, y, s?, r? }, e.g. the parent scene\'s `at`)')
  else {
    if (sp.s != null && !(isNum(sp.s) && sp.s > 0)) out.push(`space.s must be a number > 0 (got ${JSON.stringify(sp.s)})`)
    if (sp.r != null && !isNum(sp.r)) out.push(`space.r must be a number of degrees (got ${JSON.stringify(sp.r)})`)
  }
  if (via.label != null && typeof via.label !== 'string' && !isNum(via.label)) out.push('label must be a string')
  if (via.zoom != null && !(isNum(via.zoom) && via.zoom >= 0.2 && via.zoom <= 20)) out.push(`zoom must be a number from 0.2 to 20: the card's on-screen scale while riding (got ${JSON.stringify(via.zoom)})`)
  if (via.speed != null && !(isNum(via.speed) && via.speed > 0)) out.push(`speed must be a number > 0 (card px per second; got ${JSON.stringify(via.speed)})`)
  if (via.bank != null && !(isNum(via.bank) && Math.abs(via.bank) <= 15)) out.push(`bank must be a number of degrees from -15 to 15 (got ${JSON.stringify(via.bank)})`)
  if (via.reverse != null && typeof via.reverse !== 'boolean') out.push('reverse must be true or false')
  if (via.tone != null && !RIDE_TONES.includes(via.tone)) out.push(`tone "${via.tone}" isn't one of ${RIDE_TONES.join(', ')}`)
  return out
}

/** Defaults filled in, `space` completed. Assumes validateVia() found nothing. */
export function normalizeVia(via) {
  const space = { s: 1, r: 0, ...via.space }
  return { ...RIDE_DEFAULTS, ...via, label: via.label == null ? '' : String(via.label), space }
}

// ---------------------------------------------------------------- sampling (browser only)

const SVG_NS = 'http://www.w3.org/2000/svg'
const STEP = 2 // card px between samples
const cache = new WeakMap() // via object → { fwd, back }

/**
 * The path sampled at equal arc lengths, in world coordinates, oriented in riding direction
 * (`reverse` applied, `back` = played backwards with ←). Measured once per via and cached.
 */
export function sampleVia(via, back = false) {
  let entry = cache.get(via)
  if (!entry) {
    const v = normalizeVia(via)
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none'
    const el = document.createElementNS(SVG_NS, 'path')
    el.setAttribute('d', v.path)
    svg.appendChild(el)
    document.body.appendChild(svg)
    let local
    try {
      const len = el.getTotalLength()
      if (!(len > 0)) throw new Error(`via: path "${v.path.slice(0, 40)}" has no length`)
      const n = clamp(Math.ceil(len / STEP), 2, 4000)
      local = new Float64Array((n + 1) * 2)
      for (let i = 0; i <= n; i++) {
        const p = el.getPointAtLength((i / n) * len)
        local[i * 2] = p.x
        local[i * 2 + 1] = p.y
      }
    } finally {
      svg.remove()
    }
    const { x, y, s, r } = v.space
    const a = (r * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a)
    const n = local.length / 2 - 1
    const world = new Float64Array(local.length)
    for (let i = 0; i <= n; i++) {
      const j = v.reverse ? n - i : i
      const dx = (local[j * 2] - W / 2) * s, dy = (local[j * 2 + 1] - H / 2) * s
      world[i * 2] = x + dx * cos - dy * sin
      world[i * 2 + 1] = y + dx * sin + dy * cos
    }
    entry = { via: v, fwd: oriented(world), back: null }
    cache.set(via, entry)
  }
  if (back && !entry.back) {
    const f = entry.fwd.pts, n = f.length / 2 - 1
    const rev = new Float64Array(f.length)
    for (let i = 0; i <= n; i++) { rev[i * 2] = f[(n - i) * 2]; rev[i * 2 + 1] = f[(n - i) * 2 + 1] }
    entry.back = oriented(rev)
  }
  return { via: entry.via, ...(back ? entry.back : entry.fwd) }
}

/** Arc length (world px) and a smoothed signed turn (-1…1) per sample, for banking. */
function oriented(pts) {
  const n = pts.length / 2 - 1
  let len = 0
  for (let i = 1; i <= n; i++) len += Math.hypot(pts[i * 2] - pts[i * 2 - 2], pts[i * 2 + 1] - pts[i * 2 - 1])
  // tangent angle per sample, unwrapped
  const theta = new Float64Array(n + 1)
  let prev = 0
  for (let i = 0; i <= n; i++) {
    const a = Math.max(0, i - 1), b = Math.min(n, i + 1)
    let t = Math.atan2(pts[b * 2 + 1] - pts[a * 2 + 1], pts[b * 2] - pts[a * 2])
    if (i > 0) t = prev + (((t - prev + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
    theta[i] = prev = t
  }
  // how much the path turns within ±30 card px (a 90° elbow = full bank), then a box blur
  const k = Math.max(1, Math.round(30 / STEP))
  const raw = new Float64Array(n + 1)
  for (let i = 0; i <= n; i++) raw[i] = clamp((theta[Math.min(n, i + k)] - theta[Math.max(0, i - k)]) / (Math.PI / 2), -1, 1)
  const turn = new Float64Array(n + 1)
  for (let i = 0; i <= n; i++) {
    let sum = 0, cnt = 0
    for (let j = Math.max(0, i - k); j <= Math.min(n, i + k); j++) { sum += raw[j]; cnt++ }
    turn[i] = sum / cnt
  }
  return { pts, n, len, turn }
}

// ---------------------------------------------------------------- the plan

/** The pill's arc length (world px) after u s, speeding up and slowing down over `ramp` s. */
function arcAt(u, len, v, ramp, tm) {
  if (u <= 0) return 0
  if (u >= tm) return len
  const half = (x) => v * ramp * (x * x * x - (x * x * x * x) / 2) // ∫ smoothstep
  if (u < ramp) return half(u / ramp)
  if (u > tm - ramp) return len - half((tm - u) / ramp)
  return (v * ramp) / 2 + v * (u - ramp)
}

/** The pill's speed as a fraction of the cruise speed (0…1), continuous. */
function speedAt(u, ramp, tm) {
  if (u <= 0 || u >= tm) return 0
  const ss = (x) => x * x * (3 - 2 * x)
  if (u < ramp) return ss(u / ramp)
  if (u > tm - ramp) return ss((tm - u) / ramp)
  return 1
}

/**
 * Plans a ride from view `from` to view `to` ({ x, y, w, r }, w = visible world width).
 * `sampled` comes from sampleVia(). Returns { duration (s), at(t) → { x, y, w, r, pill } }
 * where pill = { x, y, op, k } (world position, opacity, pop-in scale) or null before/after.
 */
export function planRide(sampled, from, to) {
  const { via, pts, n, len, turn } = sampled
  const s = via.space.s
  const wRide = (W * s) / via.zoom
  const baseR = via.space.r
  const bank = via.bank

  const pointAt = (a) => {
    const f = clamp(a / len, 0, 1) * n
    const i = Math.min(n - 1, Math.floor(f)), k = f - i
    return {
      x: pts[i * 2] + (pts[i * 2 + 2] - pts[i * 2]) * k,
      y: pts[i * 2 + 1] + (pts[i * 2 + 3] - pts[i * 2 + 1]) * k,
      turn: turn[i] + (turn[i + 1] - turn[i]) * k,
    }
  }
  const start = pointAt(0), end = pointAt(len)

  // phases 1 and 3: as long as a normal flight between the views (0.9–1.6 s)
  const flight = (a, b) => clamp((interpolateZoom([a.x, a.y, a.w], [b.x, b.y, b.w]).duration * 0.85) / 1000, 0.9, 1.6)
  let t1 = flight(from, { x: start.x, y: start.y, w: wRide })
  let t3 = flight({ x: end.x, y: end.y, w: wRide }, to)

  // phase 2: speed in world px/s (via.speed is card px/s), then fit the total into 1.5–4 s
  let v = via.speed * s
  const rampCap = () => Math.min(RAMP, t1 * 0.7, t3 * 0.7)
  const total = () => t1 + t3 + Math.max(0, len / v - rampCap())
  if (total() > MAX_TOTAL) {
    // shorten the flights first (down to 0.6 s each), then ride faster
    const over = total() - MAX_TOTAL
    const spare = t1 + t3 - 1.2
    if (spare > 0) { const f = Math.max(0, 1 - over / spare); t1 = 0.6 + (t1 - 0.6) * f; t3 = 0.6 + (t3 - 0.6) * f }
    const cruise = MAX_TOTAL - t1 - t3
    if (total() > MAX_TOTAL && cruise > 0) v = len / (cruise + rampCap())
  } else if (total() < MIN_TOTAL) {
    v = len / (MIN_TOTAL - t1 - t3 + rampCap())
  }
  const ramp = Math.min(rampCap(), len / v)
  const tm = len / v + ramp // the pill moves for this long
  const tA = t1 - ramp // the pill sets off
  const t3s = tA + tm - ramp // the pill starts slowing down: phase 3 begins
  const duration = t3s + t3

  const pillView = (t) => {
    const u = t - tA
    const p = pointAt(arcAt(u, len, v, ramp, tm))
    // bank into turns, scaled by the pill's speed (0…1) so the camera is level while it's at rest
    return { x: p.x, y: p.y, w: wRide, r: bank ? baseR + bank * p.turn * speedAt(u, ramp, tm) : baseR }
  }
  const between = (a, b, e) => {
    const [x, y, w] = interpolateZoom([a.x, a.y, a.w], [b.x, b.y, b.w])(e)
    const r0 = a.r ?? 0
    return { x, y, w, r: r0 + (shortestAngle(r0, b.r ?? 0) - r0) * e }
  }

  const FADE_IN = 0.2, FADE_OUT = 0.3
  const sstep = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x) }

  function at(t) {
    let cam
    if (t < t1) cam = between(from, pillView(t), ease(clamp(t / t1, 0, 1)))
    else if (t < t3s) cam = pillView(t)
    else cam = between(pillView(t), to, ease(clamp((t - t3s) / t3, 0, 1)))
    let pill = null
    const u = t - tA
    if (via.label && u > 0 && u < tm) {
      const p = pointAt(arcAt(u, len, v, ramp, tm))
      const inn = sstep(u / FADE_IN)
      pill = { x: p.x, y: p.y, op: inn * sstep((tm - u) / FADE_OUT), k: 0.6 + 0.4 * inn }
    }
    return { ...cam, pill, done: t >= duration }
  }

  return { via, duration, at, phases: { t1, tA, t3s, duration, ramp, v, len, wRide } }
}
