// Shared between Map.vue (draws the boxes) and deck.js (nests scenes inside them).
// All coordinates are in the map's local 1920×1080 space.

export const NODES = {
  portal: { x: 60, y: 500, w: 230, h: 200 },
  umbraco: { x: 400, y: 420, w: 520, h: 330 },
  backoffice: { x: 470, y: 225, w: 380, h: 100 },
  ewcp: { x: 1050, y: 300, w: 180, h: 480 },
  dsajobs: { x: 1350, y: 430, w: 240, h: 330 },
  partner: { x: 1720, y: 470, w: 170, h: 260 },
}

// The map builds itself (no clicks): ms after the scene comes on stage that each stage appears.
// 1: partner + dsa.jobs · 2: ewcp · 3: Umbraco + backoffice · 4: job portal + traffic
export const REVEAL_MS = [1400, 2000, 2600, 3200]

const r = (w) => ({ w, h: (w * 9) / 16 })

// Slots where nested scenes live: centre (cx, cy) and width w (16:9).
export const SLOTS = {
  bootstrap: { cx: 1470, cy: 515 + r(208).h / 2, ...r(208) },
  whoAmI: { cx: 1140, cy: 450 + r(156).h / 2, ...r(156) },
  policy: { cx: 1140, cy: 450 + r(156).h + 14 + r(156).h / 2, ...r(156) },
  wear: { cx: 416 + 118, cy: 545 + r(236).h / 2, ...r(236) },
  cache: { cx: 668 + 118, cy: 545 + r(236).h / 2, ...r(236) },
}

/** World placement for a scene nested in a slot of a parent placed at `parent` ({x, y, s, r}). */
export function nest(parent, slot) {
  const p = { s: 1, r: 0, ...parent }
  const a = (p.r * Math.PI) / 180
  const dx = (slot.cx - 960) * p.s
  const dy = (slot.cy - 540) * p.s
  return {
    x: p.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: p.y + dx * Math.sin(a) + dy * Math.cos(a),
    s: (slot.w / 1920) * p.s,
    r: p.r,
  }
}
