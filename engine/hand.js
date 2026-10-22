// The deck folds into a hand of cards: `hand` on a scene in deck.js.
//
//   { id: 'numbers', component: Numbers, at: { … }, hand: true }
//   { id: 'numbers', component: Numbers, at: { … }, hand: { hold: 1600, spread: 110, s: 1 } }
//
// The flight into that scene from the previous one in deck order (→) becomes a card trick: the camera
// pulls back over the talk, every card swings round into a fan like playing cards held in a hand
// (tilted, overlapping, in deck order), the hand holds for a moment, then this scene's card is drawn
// out: it slides up out of the fan and straightens, and the camera dives into it. Once the card fills
// the screen, every card snaps home behind it (invisible, the card covers the screen) and the deck
// carries on from there. ← and every other route fly normally.
//
// Who's in the hand: every top-level card, in deck order; a nested card rides along in its parent;
// the two faces of a card that turns over share a place (only the one that's up shows); ghost, outer,
// skip and onlyOnStage cards fade out while the hand is up.
//
// Options: `hold` (ms the full hand is held before the card is drawn, default 1200), `spread`
// (degrees from the first card to the last, default from the card count), `s` (the cards' scale in
// the hand, default 1: every card the size of a normal card, whatever its own scale), `ahead` ('blur',
// the default: the cards still to come in the talk, the drawn one included until it's drawn, are frosted
// so the hand doesn't give away what's next; 'show' shows them as they are).
//
// How it moves (App.vue), like formation.js: each card's transform is one function list that is the
// same at home, in the hand and drawn out, so CSS interpolates it function by function:
//
//   translate(P) rotate(a) translate(0, -d) rotate(b) scale(s)
//
// P is the fan's pivot (below the hand). (a, d) is a position round it in polar form: at home the
// card's own place, in the hand its slot on the arc (a its tilt), drawn out a little further up the
// same line. b turns the card about its own centre: at home it makes up its own rotation (r - a), in
// the hand it's 0 (the card tilts with the fan), drawn out it's -a (upright again). Animating a
// swings the cards round the pivot into the fan.
//
// Everything here is plain maths, so check.mjs runs it in Node too.
import { W, H, talkBounds } from './layout.js'

const KEYS = ['hold', 'spread', 's', 'ahead']
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const RAD = Math.PI / 180
const STRIP = 0.2 // how much of each card's width shows beside the next one in the fan
const LIFT = 0.66 // how far a drawn card comes up out of the fan, in card heights
const MARGIN = 1.1 // the camera's frame around the hand

/** Problems with a `hand` value, as short messages ([] = fine). */
export function validateHand(h) {
  if (h === true) return []
  if (!h || typeof h !== 'object' || Array.isArray(h)) return ['must be true or an object, e.g. { hold: 1500 }']
  const out = []
  for (const k of Object.keys(h)) if (!KEYS.includes(k)) out.push(`unknown option "${k}" (options: ${KEYS.join(', ')})`)
  if (h.hold != null && !(isNum(h.hold) && h.hold >= 0 && h.hold <= 10000)) out.push(`hold must be the ms the hand is held, 0 to 10000 (got ${JSON.stringify(h.hold)})`)
  if (h.spread != null && !(isNum(h.spread) && h.spread >= 20 && h.spread <= 300)) out.push(`spread must be the fan's angle in degrees, 20 to 300 (got ${JSON.stringify(h.spread)})`)
  if (h.s != null && !(isNum(h.s) && h.s > 0 && h.s <= 10)) out.push(`s must be the cards' scale in the hand, a number > 0 (got ${JSON.stringify(h.s)})`)
  if (h.ahead != null && !['blur', 'show'].includes(h.ahead)) out.push(`ahead must be 'blur' (the cards still to come are frosted in the hand, the default) or 'show' (got ${JSON.stringify(h.ahead)})`)
  return out
}

/** Problems with the hand scene at index i: its `hand` value and what kind of scene it is. */
export function handProblems(scenes, i) {
  const sc = scenes[i]
  const out = validateHand(sc.hand)
  if (sc.parent != null) out.push('the drawn card must be a top-level card, not nested')
  if (sc.ghost || sc.outer || sc.back != null || sc.onlyOnStage) out.push("the drawn card must be an ordinary card (not a ghost, outer layer, the back of a card or onlyOnStage): it's taken out of the hand")
  if (sc.formation != null) out.push("a formation scene can't also have a hand: its flight in is the formation's own")
  return out
}

/**
 * What each scene does in the hand: 'lead' (a top-level card with a slot in the fan), 'pair' (the
 * back of a card: it shares its front's place), 'follow' (nested, rides in its parent), 'fade'.
 */
export function handRoles(scenes) {
  const byId = new Map(scenes.map((s, i) => [s.id, i]))
  const rootOf = (i) => {
    let j = i
    for (let n = 0; n < 50 && scenes[j].parent != null && byId.has(scenes[j].parent); n++) j = byId.get(scenes[j].parent)
    return j
  }
  return scenes.map((sc, i) => {
    const root = rootOf(i)
    const r = scenes[root]
    if (sc.ghost || sc.outer || sc.skip || sc.onlyOnStage || r.ghost || r.outer || r.skip || r.onlyOnStage) return 'fade'
    if (sc.back != null) return byId.has(sc.back) ? 'pair' : 'fade'
    if (!sc.at || !r.at) return 'fade'
    return root === i ? 'lead' : 'follow'
  })
}

const place = (sc) => ({ x: sc.at?.x ?? 0, y: sc.at?.y ?? 0, s: sc.at?.s ?? 1, r: sc.at?.r ?? 0 })
const num = (v) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(9))

/** Timings (ms) for n cards. */
export function handTiming(n) {
  const stagger = clamp(700 / Math.max(1, n), 25, 60)
  const go = 1100
  return { stagger, go, foldTotal: (n - 1) * stagger + go, pick: 800, dive: 1150 }
}

/**
 * Everything App.vue needs to deal the hand for the scene at index `target`: { target, roles, order
 * (fan position per scene; pairs and followers share their card's), n, transforms ({ home, hand,
 * drawn } CSS strings per moving scene), view (the camera's frame of the hand, the drawn card
 * included), drawnView (the camera filling the drawn card), hold, ahead (blur the cards still to come), timing }.
 */
export function planHand(scenes, target) {
  const opts = scenes[target].hand === true ? {} : scenes[target].hand
  const roles = handRoles(scenes)
  const byId = new Map(scenes.map((s, i) => [s.id, i]))
  const leads = roles.flatMap((r, i) => (r === 'lead' ? [i] : []))
  const n = leads.length
  const s = opts.s ?? 1
  const cw = W * s, ch = H * s
  const spread = opts.spread ?? clamp(n * 5, 50, 140)
  const step = n > 1 ? spread / (n - 1) : 0
  // the radius at which neighbouring cards overlap so that a STRIP of each shows
  const R = Math.max(step > 0 ? (STRIP * cw) / (step * RAD) : 0, 1.4 * cw)
  const lift = LIFT * ch
  const slot = {}, order = {}
  leads.forEach((i, j) => { slot[i] = { a: -spread / 2 + j * step }; order[i] = j })

  // the fan's box round its pivot (cards at their slots, the drawn card out of the hand)
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
  const grow = (cx, cy, rot) => {
    const ar = rot * RAD
    const ex = (Math.abs(Math.cos(ar)) * cw + Math.abs(Math.sin(ar)) * ch) / 2
    const ey = (Math.abs(Math.sin(ar)) * cw + Math.abs(Math.cos(ar)) * ch) / 2
    x1 = Math.min(x1, cx - ex); x2 = Math.max(x2, cx + ex); y1 = Math.min(y1, cy - ey); y2 = Math.max(y2, cy + ey)
  }
  const at = (a, d) => ({ x: d * Math.sin(a * RAD), y: -d * Math.cos(a * RAD) })
  for (const i of leads) { const p = at(slot[i].a, R); grow(p.x, p.y, slot[i].a) }
  const drawn = slot[target] ? at(slot[target].a, R + lift) : { x: 0, y: -R - lift }
  grow(drawn.x, drawn.y, 0)
  // the hand sits in the middle of the talk
  const tb = talkBounds(scenes)
  const P = { x: tb.x - (x1 + x2) / 2, y: tb.y - (y1 + y2) / 2 }

  const head = (a, d, b, sc) =>
    `translate(${num(P.x - W / 2)}px, ${num(P.y - H / 2)}px) rotate(${num(a)}deg) translate(0px, ${num(-d)}px) rotate(${num(b)}deg) scale(${num(sc)})`
  const transforms = {}
  for (const i of leads) {
    const p = place(scenes[i])
    const vx = p.x - P.x, vy = p.y - P.y
    const t = slot[i].a
    // its home in polar form round the pivot, the way round that's nearest its slot
    let a = Math.atan2(vx, -vy) / RAD
    a = t + ((((a - t) % 360) + 540) % 360) - 180
    transforms[i] = {
      home: head(a, Math.hypot(vx, vy), p.r - a, p.s),
      hand: head(t, R, 0, s),
      drawn: head(t, R + lift, -t, s),
    }
  }
  // nested cards: their place in the parent's own card space, appended to the parent's list
  const of = (i) => {
    if (transforms[i]) return transforms[i]
    const sc = scenes[i]
    if (roles[i] === 'pair') {
      const f = byId.get(sc.back)
      return roles[f] === 'lead' || roles[f] === 'follow' ? (transforms[i] = of(f)) : null
    }
    if (roles[i] !== 'follow') return null
    const pi = byId.get(sc.parent)
    const parent = of(pi)
    if (!parent) return null
    const p = place(sc), pp = place(scenes[pi])
    const ar = -pp.r * RAD
    const dx = (p.x - pp.x) / pp.s, dy = (p.y - pp.y) / pp.s
    const local = ` translate(${num(dx * Math.cos(ar) - dy * Math.sin(ar))}px, ${num(dx * Math.sin(ar) + dy * Math.cos(ar))}px) rotate(${num(p.r - pp.r)}deg) scale(${num(p.s / pp.s)})`
    return (transforms[i] = { home: parent.home + local, hand: parent.hand + local, drawn: parent.drawn + local })
  }
  roles.forEach((r, i) => {
    if (r !== 'follow' && r !== 'pair') return
    if (!of(i)) { roles[i] = 'fade'; return }
    let j = r === 'pair' ? byId.get(scenes[i].back) : i
    for (let k = 0; k < 50 && scenes[j].parent != null && byId.has(scenes[j].parent); k++) j = byId.get(scenes[j].parent)
    order[i] = order[j]
  })

  const view = { x: P.x + (x1 + x2) / 2, y: P.y + (y1 + y2) / 2, w: Math.max(x2 - x1, ((y2 - y1) * W) / H) * MARGIN, r: 0 }
  const drawnView = { x: P.x + drawn.x, y: P.y + drawn.y, w: cw, r: 0 }
  return { target, roles, order, n, transforms, view, drawnView, hold: opts.hold ?? 1200, ahead: (opts.ahead ?? 'blur') === 'blur', timing: handTiming(n) }
}
