// The deck rearranges itself: `formation` on a scene in deck.js.
//
//   { id: 'thanks', component: Thanks, at: { x: 2300, y: 2450 }, formation: { shape: 'ring', spin: 60 } }
//
// While that scene is on stage, every other top-level card (not ghosts, not skip scenes) leaves its
// place on the canvas and swings into a slot around it; nested cards ride along in their parent.
// Skip, ghost and outer cards fade out. Leaving the scene (or pressing O) sends everything home.
//
// Shapes, all centred on the formation scene, slots in deck order:
//   ring     an oval in the stage's proportions, its size fitted to the card count; `spin` orbits it
//   grid     rows of cards around the scene, which takes the middle 2×2 cells; `cols` (auto)
//   spiral   an outward spiral, starting at the top
//   points   points: [[x, y], …] in world px from the scene's centre (cards without a point fade out)
//   (i, n) => ({ x, y, r?, s? })   a function: world px from the centre, rotation (deg), scale
// `until: n` lets go on build step n: the cards go home while the camera moves in on the card itself.
// Options: `s` (the cards' scale in the formation; auto-fitted), `spin` (seconds per orbit; not for
// grid), `radius` (ring and spiral: the horizontal radius / start, world px), `cols` (grid).
//
// How it moves (App.vue): each moving card's transform is one function list that is the same at home
// and in the formation, so CSS interpolates it function by function:
//
//   translate(C) scale(1, k) rotate(a) translate(d, 0) rotate(-a) scale(1, 1/k) rotate(r) scale(s)
//
// C is always the formation scene's centre, and (d, a) a position round it in polar form, on an oval
// k high per unit wide: at home the card's own place, in the formation its slot (with r and s its
// rotation and scale there). The two rotations always cancel, so the card keeps its own angle while
// (a, d) swing it round the centre into its slot (every card the same way round), and adding the same
// angle (the --fx-spin custom property, animated in CSS) to both orbits the formation. A nested card
// appends its place inside its parent: translate(l) rotate(r) scale(s). Decks without a formation
// never see any of this: their cards keep the plain translate() rotate() scale().
//
// Everything here is plain maths, so check.mjs runs it in Node too.
import { W, H } from './layout.js'

export const FORMATION_SHAPES = ['ring', 'grid', 'spiral', 'points']
const KEYS = ['shape', 'spin', 'cols', 's', 'radius', 'points', 'until']
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const DEG = 180 / Math.PI
const G_CENTRE = 1.04 // gap: a card and the centre card (×)
const G_NEXT = 1.1 // gap: neighbouring cards (×)
const MARGIN = 1.06 // the camera's frame around the formation

/** Problems with a `formation` value, as short messages ([] = fine). Runs in Node too (check.mjs). */
export function validateFormation(f) {
  if (!f || typeof f !== 'object' || Array.isArray(f)) return ["must be an object, e.g. { shape: 'ring', spin: 60 }"]
  const out = []
  for (const k of Object.keys(f)) if (!KEYS.includes(k)) out.push(`unknown option "${k}" (options: ${KEYS.join(', ')})`)
  const shape = f.shape ?? 'ring'
  const fn = typeof shape === 'function'
  if (!fn && !FORMATION_SHAPES.includes(shape)) out.push(`shape ${JSON.stringify(shape)} isn't one of ${FORMATION_SHAPES.join(', ')}, or a function (i, n) => ({ x, y, r?, s? })`)
  if (f.spin != null) {
    if (shape === 'grid') out.push("spin isn't for a grid (its cards would collide); use ring, spiral, points or a function")
    else if (!(isNum(f.spin) && Math.abs(f.spin) >= 5)) out.push(`spin must be the seconds per orbit, at least 5 (negative turns the other way; got ${JSON.stringify(f.spin)})`)
  }
  if (f.until != null && !(Number.isInteger(f.until) && f.until >= 1)) out.push(`until must be the build step (1 or more) on which the cards go home and the camera moves in on the card (got ${JSON.stringify(f.until)})`)
  if (f.cols != null) {
    if (shape !== 'grid') out.push("cols is only for shape: 'grid'")
    else if (!(Number.isInteger(f.cols) && f.cols >= 2 && f.cols <= 40)) out.push(`cols must be a whole number from 2 to 40 (got ${JSON.stringify(f.cols)})`)
  }
  if (f.s != null && !(isNum(f.s) && f.s > 0 && f.s <= 10)) out.push(`s must be the cards' scale in the formation, a number > 0 (got ${JSON.stringify(f.s)})`)
  if (f.radius != null) {
    if (shape !== 'ring' && shape !== 'spiral') out.push("radius is only for shape: 'ring' or 'spiral'")
    else if (!(isNum(f.radius) && f.radius > 0)) out.push(`radius must be a number of world px > 0 (got ${JSON.stringify(f.radius)})`)
  }
  if (shape === 'points') {
    if (!Array.isArray(f.points) || !f.points.length) out.push("shape 'points' needs points: [[x, y], …] (world px from the formation scene's centre)")
    else {
      const bad = f.points.findIndex((p) => !Array.isArray(p) || p.length !== 2 || !isNum(p[0]) || !isNum(p[1]))
      if (bad >= 0) out.push(`points[${bad}] must be [x, y] (two numbers; got ${JSON.stringify(f.points[bad])})`)
    }
  } else if (f.points != null) out.push("points is only for shape: 'points'")
  return out
}

/** Problems with the formation scene at index i: its `formation` value and where the scene sits. */
export function formationProblems(scenes, i) {
  const sc = scenes[i]
  const out = validateFormation(sc.formation)
  if (sc.parent != null) out.push('a formation scene must be a top-level card, not nested (it stays where it is while the others gather round it)')
  if (sc.ghost) out.push("a formation scene can't be a ghost: the other cards gather round its place on the canvas")
  return out
}

/**
 * What each scene does while the formation is up: 'centre' (the formation scene), 'lead' (a top-level
 * card that moves to a slot), 'follow' (nested in a lead, moves with it), 'stay' (nested in the
 * formation scene), 'fade' (skip, ghost and outer cards and what's nested in them, the back of a card that
 * turns over (flip.js: the pair counts as one card, its front moves); and leads without a slot).
 */
export function formationRoles(scenes, fIdx) {
  const byId = new Map(scenes.map((s, i) => [s.id, i]))
  const rootOf = (i) => {
    let j = i
    for (let n = 0; n < 50 && scenes[j].parent != null && byId.has(scenes[j].parent); n++) j = byId.get(scenes[j].parent)
    return j
  }
  return scenes.map((sc, i) => {
    if (i === fIdx) return 'centre'
    const root = rootOf(i)
    if (root === fIdx) return 'stay'
    if (sc.ghost || sc.outer || sc.skip || sc.onlyOnStage || sc.back != null || scenes[root].ghost || scenes[root].skip || scenes[root].onlyOnStage || !sc.at || !scenes[root].at) return 'fade'
    return root === i ? 'lead' : 'follow'
  })
}

// ---------------------------------------------------------------- slots

/** Ring: an oval, k = H / W high per unit wide. In "square space" (y / k) cards are squares. */
function ringSlots(n, f, s0) {
  const a0 = W * s0
  const sp = n >= 3 ? 1 / (2 * Math.sin(Math.PI / n)) : 0.5 // radius per unit chord between neighbours
  // the radius must clear the centre card at 45° (a spinning ring puts every card there) and leave room
  // between neighbours in any direction (chord ≥ √2 × the card's side); the scale makes both meet
  const cNeed = Math.SQRT1_2 * G_CENTRE, nNeed = Math.SQRT2 * G_NEXT * sp
  let a = f.s != null ? W * f.s : nNeed > cNeed ? (cNeed * a0) / (nNeed - cNeed) : 0.6 * a0
  if (f.s == null) a = clamp(a, 0.22 * a0, 0.6 * a0)
  const R = f.radius ?? Math.max(cNeed * (a0 + a), n > 1 ? nNeed * a : 0)
  return Array.from({ length: n }, (_, i) => ({ d: R, phi: -90 + (360 * i) / n, r: 0, s: a / W }))
}

/** Spiral (square space, like the ring): an Archimedean spiral outwards from the top, clockwise. */
function spiralSlots(n, f, s0) {
  const a0 = W * s0
  const a = f.s != null ? W * f.s : clamp(0.42 * Math.sqrt(12 / Math.max(n, 12)), 0.2, 0.42) * a0
  const gap = Math.SQRT2 * G_NEXT * a // between neighbours along the spiral, and between its turns
  const r0 = f.radius ?? Math.SQRT1_2 * G_CENTRE * (a0 + a)
  const out = []
  let th = 0 // radians from the start
  for (let i = 0; i < n; i++) {
    const R = r0 + (gap * th) / (2 * Math.PI)
    out.push({ d: R, phi: -90 + th * DEG, r: 0, s: a / W })
    th += gap / R
  }
  return out
}

/** Grid: cells of a card at scale s plus a gutter; the formation scene takes the middle 2×2 block. */
function gridSlots(n, f, s0) {
  const GUT = 1.14
  const s = f.s ?? s0 / (2 * GUT - (GUT - 1)) // two cells and the gutter between them = the centre card
  const cw = W * s * GUT, ch = H * s * GUT
  let cols = f.cols, rows
  if (cols == null) { let L = 1; while ((2 + 2 * L) ** 2 - 4 < n) L++; cols = rows = 2 + 2 * L }
  else { rows = 2; while (cols * rows - 4 < n) rows++ }
  const bc = Math.floor((cols - 2) / 2), br = Math.floor((rows - 2) / 2) // the reserved block's first cell
  const ox = -(bc + 1) * cw, oy = -(br + 1) * ch // grid origin relative to the block's centre
  const out = []
  for (let r = 0; r < rows && out.length < n; r++) {
    for (let c = 0; c < cols && out.length < n; c++) {
      if (c >= bc && c < bc + 2 && r >= br && r < br + 2) continue
      out.push({ x: ox + (c + 0.5) * cw, y: oy + (r + 0.5) * ch, r: 0, s })
    }
  }
  return out
}

/** The largest scale at which cards at these points don't overlap each other or the centre card. */
function fitScale(pts, s0, cap) {
  let s = cap
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    s = Math.min(s, Math.max((2 * Math.abs(p.x)) / W - s0, (2 * Math.abs(p.y)) / H - s0) / G_CENTRE)
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j]
      s = Math.min(s, Math.max(Math.abs(p.x - q.x) / W, Math.abs(p.y - q.y) / H) / G_NEXT)
    }
  }
  return Math.max(s, 0.05 * s0)
}

function pointSlots(n, f, s0) {
  const pts = f.points.slice(0, n).map(([x, y]) => ({ x, y, r: 0 }))
  const s = f.s ?? fitScale(pts, s0, 0.5 * s0)
  return pts.map((p) => ({ ...p, s }))
}

function fnSlots(n, f, s0) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const v = f.shape(i, n)
    if (!v || !isNum(v.x) || !isNum(v.y) || (v.r != null && !isNum(v.r)) || (v.s != null && !(isNum(v.s) && v.s > 0))) {
      throw new Error(`the shape function returned ${JSON.stringify(v)} for card ${i} of ${n}: it must return { x, y, r?, s? } (numbers, s > 0)`)
    }
    pts.push({ x: v.x, y: v.y, r: v.r ?? 0, s: v.s })
  }
  const auto = f.s ?? fitScale(pts, s0, 0.5 * s0)
  return pts.map((p) => ({ ...p, s: p.s ?? auto }))
}

// ---------------------------------------------------------------- the plan

const MIN_TRAVEL = 20 // degrees: the least a card swings round the centre on its way to its slot

/**
 * Everything App.vue needs: { index, centre, k, roles, order (stagger index per scene, leads in deck
 * order; followers share their lead's), n (leads with a slot), slot (per lead: { d, a, r, s } with a
 * the polar angle in degrees), home (per lead: { d, a }, its own place round the centre), view (the
 * camera's frame), spin }.
 * Throws if a shape function returns something unusable.
 */
export function planFormation(scenes, fIdx) {
  const sc = scenes[fIdx]
  const f = sc.formation
  const shape = f.shape ?? 'ring'
  const at = { s: 1, r: 0, ...sc.at }
  const s0 = at.s
  const roles = formationRoles(scenes, fIdx)
  const leads = roles.flatMap((r, i) => (r === 'lead' ? [i] : []))
  const oval = shape === 'ring' || shape === 'spiral'
  const k = oval ? H / W : 1

  let slots
  if (shape === 'ring') slots = ringSlots(leads.length, f, s0)
  else if (shape === 'spiral') slots = spiralSlots(leads.length, f, s0)
  else if (shape === 'grid') slots = gridSlots(leads.length, f, s0)
  else if (shape === 'points') slots = pointSlots(leads.length, f, s0)
  else slots = fnSlots(leads.length, f, s0)
  // polar form in "oval space" (x, y / k); the world position is (d cos a, k d sin a)
  slots = slots.map((p) => (p.d != null ? { d: p.d, a: p.phi, r: p.r, s: p.s } : { d: Math.hypot(p.x, p.y / k), a: Math.atan2(p.y / k, p.x) * DEG, r: p.r, s: p.s }))

  const spin = f.spin ?? 0
  const dir = spin < 0 ? -1 : 1
  const slot = {}, order = {}, home = {}
  const byId = new Map(scenes.map((s, i) => [s.id, i]))
  leads.forEach((i, j) => {
    if (j >= slots.length) { roles[i] = 'fade'; return } // points: no slot left for this card
    slot[i] = slots[j]
    order[i] = j
    // home in the same polar form round the centre, so the cards orbit in: every one the same way
    // round (the spin's), at least MIN_TRAVEL degrees
    const p = { s: 1, r: 0, ...scenes[i].at }
    const hx = p.x - at.x, hy = (p.y - at.y) / k
    const ah = Math.atan2(hy, hx) * DEG
    let travel = (((slots[j].a - ah) * dir) % 360 + 360) % 360
    if (travel < MIN_TRAVEL) travel += 360
    home[i] = { d: Math.hypot(hx, hy), a: slots[j].a - travel * dir }
  })
  // followers take their lead's stagger index; a follower of a faded lead fades too
  roles.forEach((r, i) => {
    if (r !== 'follow') return
    let j = i
    for (let n = 0; n < 50 && scenes[j].parent != null && byId.has(scenes[j].parent); n++) j = byId.get(scenes[j].parent)
    if (roles[j] === 'lead') order[i] = order[j]
    else roles[i] = 'fade'
  })

  // the camera frames the formation and the centre card; a spinning one, every card on its whole orbit
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
  const box = (cx, cy, s, r, spinning, d) => {
    const ar = (r * Math.PI) / 180
    const ex = (Math.abs(Math.cos(ar)) * W + Math.abs(Math.sin(ar)) * H) * s / 2
    const ey = (Math.abs(Math.sin(ar)) * W + Math.abs(Math.cos(ar)) * H) * s / 2
    const hx = spinning ? d + ex : Math.abs(cx) + ex, hy = spinning ? k * d + ey : Math.abs(cy) + ey
    if (spinning) { x1 = Math.min(x1, -hx); x2 = Math.max(x2, hx); y1 = Math.min(y1, -hy); y2 = Math.max(y2, hy) }
    else { x1 = Math.min(x1, cx - ex); x2 = Math.max(x2, cx + ex); y1 = Math.min(y1, cy - ey); y2 = Math.max(y2, cy + ey) }
  }
  box(0, 0, s0, at.r, false, 0)
  for (const i of Object.keys(slot)) {
    const p = slot[i]
    const ar = p.a / DEG
    box(p.d * Math.cos(ar), k * p.d * Math.sin(ar), p.s, p.r, !!spin, p.d)
  }
  const view = {
    x: at.x + (x1 + x2) / 2,
    y: at.y + (y1 + y2) / 2,
    w: Math.max(x2 - x1, ((y2 - y1) * W) / H) * MARGIN,
    r: 0,
  }
  return { index: fIdx, centre: { x: at.x, y: at.y }, k, roles, order, n: Object.keys(slot).length, slot, home, view, spin }
}

// ---------------------------------------------------------------- transforms

// full precision: a card's home transform must land exactly where its plain one does, even 500× in
const num = (v) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(9))
const place = (sc) => ({ x: sc.at?.x ?? 0, y: sc.at?.y ?? 0, s: sc.at?.s ?? 1, r: sc.at?.r ?? 0 })

/**
 * The two transforms of every moving card (lead or follow), as CSS strings with the same function
 * list: { home, formed } per scene index. `formed` orbits with var(--fx-spin) (0deg unless spinning).
 */
export function formationTransforms(scenes, plan) {
  const { k, centre, roles, slot, home } = plan
  const byId = new Map(scenes.map((s, i) => [s.id, i]))
  const head = (c, a, d, r, s, spin) => {
    const A = spin ? `calc(${num(a)}deg + var(--fx-spin, 0deg))` : `${num(a)}deg`
    const B = spin ? `calc(${num(-a)}deg - var(--fx-spin, 0deg))` : `${num(-a)}deg`
    return `translate(${num(c.x - W / 2)}px, ${num(c.y - H / 2)}px) scale(1, ${num(k)}) rotate(${A}) translate(${num(d)}px, 0px) rotate(${B}) scale(1, ${num(1 / k)}) rotate(${num(r)}deg) scale(${num(s)})`
  }
  const out = {}
  const of = (i) => {
    if (out[i]) return out[i]
    const sc = scenes[i]
    const p = place(sc)
    if (roles[i] === 'lead') {
      const q = slot[i]
      out[i] = { home: head(centre, home[i].a, home[i].d, p.r, p.s, false), formed: head(centre, q.a, q.d, q.r, q.s, true) }
    } else {
      // nested: its place in the parent's own (unscaled, unrotated) card space, after the parent's list
      const pi = byId.get(sc.parent)
      const pp = place(scenes[pi])
      const ar = (-pp.r * Math.PI) / 180
      const dx = (p.x - pp.x) / pp.s, dy = (p.y - pp.y) / pp.s
      const local = ` translate(${num(dx * Math.cos(ar) - dy * Math.sin(ar))}px, ${num(dx * Math.sin(ar) + dy * Math.cos(ar))}px) rotate(${num(p.r - pp.r)}deg) scale(${num(p.s / pp.s)})`
      const parent = of(pi)
      out[i] = { home: parent.home + local, formed: parent.formed + local }
    }
    return out[i]
  }
  roles.forEach((r, i) => { if (r === 'lead' || r === 'follow') of(i) })
  return out
}

// ---------------------------------------------------------------- timing

/** A damped spring as a CSS linear() easing: overshoots about 12 %, settles exactly at 1. */
export const SPRING = (() => {
  const zeta = 0.55, wd = 7.6 // first peak at about 40 % of the duration
  const w = wd / Math.sqrt(1 - zeta * zeta)
  const pts = []
  for (let i = 0; i <= 48; i++) {
    const t = i / 48
    let x = 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t))
    // the last 40 %: fade out what's left of the wobble, so it lands at 1 without a jump
    const u = clamp((t - 0.6) / 0.4, 0, 1)
    x = 1 - (1 - x) * (1 - u * u * (3 - 2 * u))
    pts.push(+x.toFixed(4))
  }
  return `linear(${pts.join(', ')})`
})()
export const SPRING_FALLBACK = 'cubic-bezier(0.34, 1.4, 0.64, 1)'

/** Timings (ms) for n cards: how they leave home ('go') and come back ('back'). */
export function formationTiming(n) {
  const stagger = clamp(600 / Math.max(1, n), 25, 55)
  const go = 1150
  const backStagger = clamp(300 / Math.max(1, n), 12, 25)
  const back = 850
  return {
    stagger, go, goTotal: (n - 1) * stagger + go,
    backStagger, back, backTotal: (n - 1) * backStagger + back,
    // the ring starts orbiting as the last card settles, easing in over spinIn
    spinAt: (n - 1) * stagger + go * 0.8,
    spinIn: 2500,
  }
}
