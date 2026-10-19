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
export const REVEAL_MS = [1000, 1300, 1600, 1900]

const r = (w) => ({ w, h: (w * 9) / 16 })

// Slots where nested scenes live: centre (cx, cy) and width w (16:9).
export const SLOTS = {
  bootstrap: { cx: 1470, cy: 515 + r(208).h / 2, ...r(208) },
  whoAmI: { cx: 1140, cy: 450 + r(156).h / 2, ...r(156) },
  policy: { cx: 1140, cy: 450 + r(156).h + 14 + r(156).h / 2, ...r(156) },
  wear: { cx: 416 + 118, cy: 545 + r(236).h / 2, ...r(236) },
  cache: { cx: 668 + 118, cy: 545 + r(236).h / 2, ...r(236) },
}

// A polyline with rounded corners, as an SVG path (so the camera riding along it turns smoothly).
function rounded(points, r = 36) {
  let d = `M${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1], [x, y] = points[i], [nx, ny] = points[i + 1]
    const a = Math.min(r, Math.hypot(x - px, y - py) / 2), b = Math.min(r, Math.hypot(nx - x, ny - y) / 2)
    const ux = Math.sign(x - px), uy = Math.sign(y - py), vx = Math.sign(nx - x), vy = Math.sign(ny - y)
    d += ` L${x - ux * a} ${y - uy * a} Q${x} ${y} ${x + vx * b} ${y + vy * b}`
  }
  const [lx, ly] = points[points.length - 1]
  return d + ` L${lx} ${ly}`
}
const c = (s) => [s.cx, Math.round(s.cy)] // a slot's centre

// "Let's look closer": the red pill's routes between the dives (deck.js `via`), along the map's own
// wires: in from the partner site, down the "who am I?" lane, out and back round the letterbox, along
// the "what do I wear?" lane into Umbraco, under its two slots, and up the config wire to the
// backoffice (the remote control, the next scene). Each one pulls back out of the dive first.
export const RIDES = {
  bootstrap: rounded([[1805, 600], [1470, 600], c(SLOTS.bootstrap)]),
  whoAmI: rounded([c(SLOTS.bootstrap), [1470, 664], [1140, 664], c(SLOTS.whoAmI)]),
  policy: rounded([c(SLOTS.whoAmI), [1300, 494], [1300, 596], c(SLOTS.policy)], 50),
  wear: rounded([c(SLOTS.policy), [1140, 710], [534, 710], c(SLOTS.wear)]),
  cache: rounded([c(SLOTS.wear), [534, 724], [786, 724], c(SLOTS.cache)], 50),
  section: rounded([c(SLOTS.cache), [786, 500], [660, 500], [660, 275]]),
}

// nest() lives in the engine; re-exported so deck.js can keep importing it from here.
export { nest } from '@engine/layout.js'
