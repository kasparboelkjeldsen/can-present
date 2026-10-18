// Canvas geometry. Every scene is a 1920×1080 card; `at: { x, y, r, s }` puts its centre at
// world x/y, rotated r degrees and scaled by s.
export const W = 1920
export const H = 1080

/**
 * World placement for a scene nested in a slot of a parent placed at `parent` ({x, y, s, r}).
 * `slot` is { cx, cy, w } in the parent's local 1920×1080 space (centre and width, 16:9).
 */
export function nest(parent, slot) {
  const p = { s: 1, r: 0, ...parent }
  const a = (p.r * Math.PI) / 180
  const dx = (slot.cx - W / 2) * p.s
  const dy = (slot.cy - H / 2) * p.s
  return {
    x: p.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: p.y + dx * Math.sin(a) + dy * Math.cos(a),
    s: (slot.w / W) * p.s,
    r: p.r,
  }
}

/**
 * The bounding box of the talk itself, rotation included: every placed scene except ghosts and outer
 * layers. The overview frames it and the first outer layer wraps it. → { x, y, w, h } (centre, size).
 */
export function talkBounds(scenes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const sc of scenes) {
    if (sc.ghost || sc.outer) continue
    const p = { x: 0, y: 0, s: 1, r: 0, ...sc.at }
    const a = (p.r * Math.PI) / 180
    const hw = (W / 2) * p.s, hh = (H / 2) * p.s
    const ex = Math.abs(Math.cos(a)) * hw + Math.abs(Math.sin(a)) * hh
    const ey = Math.abs(Math.sin(a)) * hw + Math.abs(Math.cos(a)) * hh
    minX = Math.min(minX, p.x - ex); maxX = Math.max(maxX, p.x + ex)
    minY = Math.min(minY, p.y - ey); maxY = Math.max(maxY, p.y + ey)
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY }
}

/** A placement centred on the canvas and big enough to cover every placed scene (plus 8%). */
export function coverAll(scenes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const sc of scenes) {
    if (!sc.at || sc.outer) continue
    const s = sc.at.s ?? 1
    minX = Math.min(minX, sc.at.x - (W / 2) * s); maxX = Math.max(maxX, sc.at.x + (W / 2) * s)
    minY = Math.min(minY, sc.at.y - (H / 2) * s); maxY = Math.max(maxY, sc.at.y + (H / 2) * s)
  }
  const s = Math.max((maxX - minX) / W, (maxY - minY) / H) * 1.08
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, s }
}

/** Ghost scenes declared with `at: null` hover over everything: give them the covering placement. */
export function placeGhosts(scenes) {
  const ghosts = scenes.filter((sc) => sc.ghost && sc.at == null)
  if (!ghosts.length) return
  const at = coverAll(scenes)
  for (const g of ghosts) g.at = { ...at }
}

/**
 * Outer layers (`outer: { hole: { cx, cy, w } }` in deck.js): the reverse of nest(). Each outer scene
 * is scaled and placed so that the hole (a 16:9 box in its own 1920×1080 space) lands on what it
 * wraps: the first one wraps the talk (talkBounds), each later one the previous outer card. The
 * wrapped box is fitted inside the hole, centred. Call after placeGhosts (ghosts cover the talk only).
 */
export function placeOuter(scenes) {
  let inner = null
  for (const sc of scenes) {
    if (!sc.outer?.hole) continue
    // `wraps: '<id>'` wraps that one card instead of what came before (the talk, or the last layer)
    const card = sc.outer.wraps != null && scenes.find((o) => o.id === sc.outer.wraps)?.at
    const b = card ? { x: card.x, y: card.y, w: W * (card.s ?? 1), h: H * (card.s ?? 1) } : inner ?? talkBounds(scenes)
    const { cx, cy, w } = sc.outer.hole
    if (![cx, cy, w].every(Number.isFinite) || w <= 0) continue // check reports it
    const s = Math.max(b.w, (b.h * W) / H) / w
    sc.at = { x: b.x - (cx - W / 2) * s, y: b.y - (cy - H / 2) * s, s, r: 0 }
    inner = { x: sc.at.x, y: sc.at.y, w: W * s, h: H * s }
  }
}
