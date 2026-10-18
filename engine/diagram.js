// defineDiagram(): the definition of a <Diagram>, in a plain .js file so that the scene (which
// draws it) and deck.js (steps, nested scenes in its slots) share one source of truth.
//
//   export const arch = defineDiagram({
//     reveal: 'steps',                      // or { timer: [1000, 1300, 1600] } (ms after the scene comes on stage)
//     nodes: { api: { x: 700, y: 380, w: 440, h: 320, label: 'API', sub: 'Node 22', at: 2, tone: 'accent' }, … },
//     edges: [{ from: 'browser', to: 'api', label: 'HTTPS' }, …],
//     packets: [{ edge: 0, label: 'GET /jobs' }, { edge: 0, label: '200 OK', reverse: true, delay: 1.8 }],
//     slots: { inside: { node: 'api', cx: 220, cy: 200, w: 300 } },
//   })
//
// deck.js:  steps: arch.steps · at: nest(PARENT_AT, arch.slot('inside')) · revealAt: arch.revealAt('api')
//           (timer mode: revealDelay: arch.revealDelay('api'))
//
// All coordinates are in the scene's 1920×1080 space; a slot's cx/cy are relative to its node's
// top-left corner, and a slot is 16:9.

const NODE_TONES = ['default', 'ink', 'accent', 'ghost']
const LINE_TONES = ['ink', 'paper', 'accent', 'accent-2', 'current']
const PACKET_TONES = ['ink', 'paper', 'accent', 'accent-2']
const ARROW_PULL = 6 // px: the line stops this short of the box so the arrowhead's tip is crisp
const CORNER = 18 // px: radius of the elbows

const fail = (msg) => { throw new Error(`defineDiagram: ${msg}`) }
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const r1 = (v) => Math.round(v * 10) / 10

/** Side midpoints facing each other, routed straight or H-V-H / V-H-V with the elbow halfway. */
function route(a, b, { offset = 0, pullStart = 0, pullEnd = 0 }) {
  const gx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w))
  const gy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h))
  const acx = a.x + a.w / 2, acy = a.y + a.h / 2
  const bcx = b.x + b.w / 2, bcy = b.y + b.h / 2

  if (gx >= gy) {
    // left/right sides; offset moves both ends along the side (parallel lanes)
    const dir = bcx >= acx ? 1 : -1
    const sx = (dir > 0 ? a.x + a.w : a.x) + dir * pullStart, sy = acy + offset
    const ex = (dir > 0 ? b.x : b.x + b.w) - dir * pullEnd, ey = bcy + offset
    if (Math.abs(ey - sy) < 0.5) return { d: `M${r1(sx)} ${r1(sy)} H${r1(ex)}`, mid: { x: (sx + ex) / 2, y: sy }, along: 'h', straight: true }
    const mx = (sx + ex) / 2
    const vy = ey > sy ? 1 : -1
    const c = Math.min(CORNER, Math.abs(ey - sy) / 2, Math.abs(mx - sx))
    const d = `M${r1(sx)} ${r1(sy)} H${r1(mx - dir * c)} Q${r1(mx)} ${r1(sy)} ${r1(mx)} ${r1(sy + vy * c)} ` +
      `V${r1(ey - vy * c)} Q${r1(mx)} ${r1(ey)} ${r1(mx + dir * c)} ${r1(ey)} H${r1(ex)}`
    return { d, mid: { x: mx, y: (sy + ey) / 2 }, along: 'v' }
  }
  // top/bottom sides
  const dir = bcy >= acy ? 1 : -1
  const sx = acx + offset, sy = (dir > 0 ? a.y + a.h : a.y) + dir * pullStart
  const ex = bcx + offset, ey = (dir > 0 ? b.y : b.y + b.h) - dir * pullEnd
  if (Math.abs(ex - sx) < 0.5) return { d: `M${r1(sx)} ${r1(sy)} V${r1(ey)}`, mid: { x: sx, y: (sy + ey) / 2 }, along: 'v', straight: true }
  const my = (sy + ey) / 2
  const hx = ex > sx ? 1 : -1
  const c = Math.min(CORNER, Math.abs(ex - sx) / 2, Math.abs(my - sy))
  const d = `M${r1(sx)} ${r1(sy)} V${r1(my - dir * c)} Q${r1(sx)} ${r1(my)} ${r1(sx + hx * c)} ${r1(my)} ` +
    `H${r1(ex - hx * c)} Q${r1(ex)} ${r1(my)} ${r1(ex)} ${r1(my + dir * c)} V${r1(ey)}`
  return { d, mid: { x: (sx + ex) / 2, y: my }, along: 'h' }
}

/**
 * Where an edge label goes: above a horizontal stretch (clear of a passing packet pill), beside a
 * vertical one. `side` is how far beside: further on a straight vertical edge that carries packets.
 */
function labelAt(mid, along, side = 20) {
  return along === 'h'
    ? { x: r1(mid.x), y: r1(mid.y - 30), anchor: 'middle', baseline: 'auto' }
    : { x: r1(mid.x + side), y: r1(mid.y), anchor: 'start', baseline: 'central' }
}
export const PACKET_FONT = 26 // px; pills are 1.7× as tall, their width is measured from the text
const pillEstimate = (label) => String(label ?? '').length * PACKET_FONT * 0.62 + 44

export function defineDiagram(def) {
  if (!def || typeof def !== 'object') fail('pass an object with nodes (and optionally edges, packets, slots, reveal)')

  // ---- reveal ----
  const reveal = def.reveal ?? 'steps'
  let timer = null
  if (reveal !== 'steps') {
    timer = reveal?.timer
    if (!Array.isArray(timer) || !timer.length || !timer.every(isNum)) {
      fail(`reveal must be 'steps' or { timer: [ms, ms, …] } (got ${JSON.stringify(reveal)})`)
    }
  }
  const mode = timer ? 'timer' : 'steps'
  const stageWord = mode === 'timer' ? 'stage' : 'step'

  // ---- nodes ----
  const nodes = {}
  const ids = Object.keys(def.nodes ?? {})
  if (!ids.length) fail('a diagram needs at least one node')
  const known = () => ids.join(', ')
  for (const id of ids) {
    const n = def.nodes[id] ?? {}
    for (const k of ['x', 'y', 'w', 'h']) if (!isNum(n[k])) fail(`node "${id}" needs a number for ${k} (x, y, w, h: its box in the scene's 1920×1080 space)`)
    const tone = n.tone ?? 'default'
    if (!NODE_TONES.includes(tone)) fail(`node "${id}": tone "${tone}" isn't one of ${NODE_TONES.join(', ')}`)
    const at = n.at ?? 1
    if (!Number.isInteger(at) || at < 0) fail(`node "${id}": at must be a whole ${stageWord} number ≥ 0 (got ${at})`)
    if (timer && at > timer.length) fail(`node "${id}": at ${at} but the timer only has ${timer.length} stages`)
    nodes[id] = { ...n, id, tone, at }
  }
  const node = (id, where) => nodes[id] ?? fail(`${where}: unknown node "${id}" (nodes: ${known()})`)

  // ---- edges ----
  const edges = (def.edges ?? []).map((e, i) => {
    const where = `edge ${i}${e?.from || e?.to ? ` (${e.from} → ${e.to})` : ''}`
    const a = node(e?.from, where), b = node(e?.to, where)
    const tone = e.tone ?? 'ink'
    if (!LINE_TONES.includes(tone)) fail(`${where}: tone "${tone}" isn't one of ${LINE_TONES.join(', ')}`)
    if (e.at != null && (!Number.isInteger(e.at) || e.at < 0)) fail(`${where}: at must be a whole ${stageWord} number ≥ 0 (got ${e.at})`)
    // never before both of its nodes are there
    const at = Math.max(e.at ?? 0, a.at, b.at)
    if (timer && at > timer.length) fail(`${where}: at ${at} but the timer only has ${timer.length} stages`)
    const arrow = e.arrow !== false
    const both = arrow && !!e.both
    const out = { ...e, index: i, tone, at, arrow, both, custom: !!e.path }
    if (e.path) {
      if (typeof e.path !== 'string') fail(`${where}: path must be an SVG path string`)
      out.d = e.path
      out.labelPos = null // measured in the browser (midpoint of the path)
    } else {
      const r = route(a, b, { offset: e.offset ?? 0, pullStart: both ? ARROW_PULL : 0, pullEnd: arrow ? ARROW_PULL : 0 })
      out.d = r.d
      // packets spend their whole loop on a straight vertical edge: keep its label clear of the pills
      const pills = r.straight && r.along === 'v' ? (def.packets ?? []).filter((p) => p?.edge === i).map((p) => pillEstimate(p.label)) : []
      out.labelPos = labelAt(r.mid, r.along, pills.length ? Math.max(...pills) / 2 + 14 : 20)
    }
    return out
  })

  // ---- packets ----
  const packets = (def.packets ?? []).map((p, i) => {
    if (!Number.isInteger(p?.edge) || !edges[p.edge]) {
      fail(`packet ${i}${p?.label ? ` ("${p.label}")` : ''}: edge must be the index of an edge (0–${edges.length - 1}), got ${JSON.stringify(p?.edge)}`)
    }
    const tone = p.tone ?? 'ink'
    if (!PACKET_TONES.includes(tone)) fail(`packet ${i}: tone "${tone}" isn't one of ${PACKET_TONES.join(', ')}`)
    return { ...p, index: i, label: String(p.label ?? ''), tone, reverse: !!p.reverse, dur: p.dur ?? 3.6, delay: p.delay ?? 0 }
  })

  // ---- slots ----
  const slots = {}
  for (const [name, s] of Object.entries(def.slots ?? {})) {
    const n = node(s?.node, `slot "${name}"`)
    for (const k of ['cx', 'cy', 'w']) if (!isNum(s[k])) fail(`slot "${name}" needs a number for ${k} (cx, cy relative to node "${n.id}"'s top-left; w its width)`)
    const h = (s.w * 9) / 16
    slots[name] = { name, node: n.id, rel: { cx: s.cx, cy: s.cy, w: s.w, h }, cx: n.x + s.cx, cy: n.y + s.cy, w: s.w, h }
  }

  const stages = timer
    ? timer.length
    : Math.max(0, ...Object.values(nodes).map((n) => n.at), ...edges.map((e) => e.at))

  return {
    mode,
    timer,
    stages, // highest step (steps mode) or the number of timer stages
    nodes,
    edges,
    packets,
    slots,
    steps: mode === 'steps' ? stages : 0,
    /** { cx, cy, w, h } in the scene's 1920×1080 space, for nest(). */
    slot(name) {
      const s = slots[name] ?? fail(`unknown slot "${name}" (slots: ${Object.keys(slots).join(', ') || 'none'})`)
      return { cx: s.cx, cy: s.cy, w: s.w, h: s.h }
    },
    /** The build step a node appears on (0 in timer mode, which has no build steps). */
    revealAt(id) {
      const n = node(id, 'revealAt')
      return mode === 'steps' ? n.at : 0
    },
    /** Timer mode: ms after the scene comes on stage at which the node's stage appears, plus 150. */
    revealDelay(id) {
      const n = node(id, 'revealDelay')
      if (mode !== 'timer') return 0
      return (n.at > 0 ? timer[n.at - 1] : 0) + 150
    },
  }
}
