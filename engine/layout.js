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

/** A placement centred on the canvas and big enough to cover every placed scene (plus 8%). */
export function coverAll(scenes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const sc of scenes) {
    if (!sc.at) continue
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
