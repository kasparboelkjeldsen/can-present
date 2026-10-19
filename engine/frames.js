// Camera framing per build step: `frames` on a scene in deck.js.
//
//   { id: 'deeper', steps: 3, frames: { 1: { cx: 1200, cy: 640, w: 480 }, 3: { cx: 1302, cy: 655, w: 60 } }, at: … }
//
// On a step with a frame, the camera flies to that box (in the card's own 1920×1080 space, 16:9,
// cx/cy its centre, w its width in card px) instead of the whole card. A step without a key keeps
// the previous step's frame; step 0 is always the whole card. The overview and thumbnails ignore
// frames. App.vue flies between them; Sheet.vue outlines them; check.mjs uses validateFrames().
import { W, H, nest } from './layout.js'

const KEYS = ['cx', 'cy', 'w']
const EPS = 0.01 // card px: a box may touch the card's edges
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

/** Problems with a scene's `frames` value, as short messages ([] = fine). Runs in Node too (check.mjs). */
export function validateFrames(frames, steps = 0) {
  if (!frames || typeof frames !== 'object' || Array.isArray(frames)) {
    return ['must be an object of build step → box, e.g. { 1: { cx: 1200, cy: 640, w: 480 } }']
  }
  const out = []
  for (const [key, box] of Object.entries(frames)) {
    const k = Number(key)
    if (!/^\d+$/.test(key) || k < 1) { out.push(`key "${key}" isn't a build step (whole numbers from 1 to steps; step 0 is always the whole card)`); continue }
    if (k > steps) { out.push(`key ${k} is past the last build step (steps is ${steps})`); continue }
    if (!box || typeof box !== 'object' || Array.isArray(box)) { out.push(`${k}: must be a box { cx, cy, w } in the card's 1920×1080 space`); continue }
    for (const p of Object.keys(box)) if (!KEYS.includes(p)) out.push(`${k}: unknown field "${p}" (a frame is { cx, cy, w }; its height is w × 9/16)`)
    const bad = KEYS.filter((p) => !isNum(box[p]))
    if (bad.length) { out.push(`${k}: ${bad.join(', ')} must be number${bad.length > 1 ? 's' : ''} (card px)`); continue }
    if (!(box.w > 0)) { out.push(`${k}: w must be > 0 (got ${box.w})`); continue }
    const h = (box.w * 9) / 16
    const x1 = box.cx - box.w / 2, x2 = box.cx + box.w / 2, y1 = box.cy - h / 2, y2 = box.cy + h / 2
    if (x1 < -EPS || y1 < -EPS || x2 > W + EPS || y2 > H + EPS) {
      const r = (v) => Math.round(v * 10) / 10
      out.push(`${k}: the box (x ${r(x1)}–${r(x2)}, y ${r(y1)}–${r(y2)}) isn't inside the 1920×1080 card`)
    }
  }
  return out
}

/** [[step, box], …] sorted by step. Assumes validateFrames() found nothing. */
export function normalizeFrames(frames) {
  return Object.entries(frames)
    .map(([k, b]) => [Number(k), { cx: b.cx, cy: b.cy, w: b.w }])
    .sort((a, b) => a[0] - b[0])
}

/** The frame in force on `step`: { step, box } for the highest key ≤ step, or null (the whole card). */
export function frameAt(list, step) {
  let hit = null
  for (const [k, box] of list ?? []) {
    if (k > step) break
    hit = { step: k, box }
  }
  return hit
}

/** The camera view ({ x, y, w, r } in world units) that shows `box` of a card placed at `at`. */
export function frameView(at, box) {
  const n = nest(at, box)
  return { x: n.x, y: n.y, w: W * n.s, r: n.r }
}
