// A card with a scene on its back: `back` (and optionally `flip`) on a scene in deck.js.
//
//   { id: 'code', component: Walkthrough, steps: 2, at: { x: 6900, y: 300, r: -1 } },
//   { id: 'code-back', component: CodeBack, back: 'code', flip: { axis: 'y' } },
//
// The back scene has no `at`: placeBacks() copies its front's. App.vue renders the two as ordinary
// sibling scenes at the same place; at rest the face that's down is hidden, and the move from the
// front to its back (→ from the front's last step, when the back comes next) turns the card over.
//
// flip options (on the back scene only):
//   axis   'y' (default) turns it like a page, 'x' tips it over like a sign
//   dir    1 (default) or -1: which way it turns
//   tilt   degrees on the other axis at mid-turn (default 8): a little wobble, so it isn't mechanical
//
// Everything here is plain data, so check.mjs runs it in Node too.

const KEYS = ['axis', 'dir', 'tilt']
export const FLIP_DEFAULTS = { axis: 'y', dir: 1, tilt: 8 }

/** Problems with a `flip` value, as short messages ([] = fine). */
export function validateFlip(f) {
  if (f == null) return []
  if (typeof f !== 'object' || Array.isArray(f)) return ["must be an object, e.g. { axis: 'y' }"]
  const out = []
  for (const k of Object.keys(f)) if (!KEYS.includes(k)) out.push(`unknown option "${k}" (options: ${KEYS.join(', ')})`)
  if (f.axis != null && f.axis !== 'x' && f.axis !== 'y') out.push(`axis must be 'y' (like a page) or 'x' (like a sign), got ${JSON.stringify(f.axis)}`)
  if (f.dir != null && f.dir !== 1 && f.dir !== -1) out.push(`dir must be 1 or -1, got ${JSON.stringify(f.dir)}`)
  if (f.tilt != null && !(typeof f.tilt === 'number' && Number.isFinite(f.tilt) && Math.abs(f.tilt) <= 30)) out.push(`tilt must be degrees from -30 to 30, got ${JSON.stringify(f.tilt)}`)
  return out
}

/**
 * Every problem with backs and flips in a deck: [{ i, message }] (i = scene index). Run it on the
 * scenes as written (before placeBacks), so a back with its own `at` is caught.
 */
export function flipProblems(scenes) {
  const out = []
  const byId = new Map(scenes.map((s, i) => [s.id, i]))
  const hasChildren = (id) => scenes.some((s) => s.parent === id)
  const backOf = new Map()
  scenes.forEach((sc, i) => {
    const add = (message) => out.push({ i, message })
    if (sc.flip != null && sc.back == null) add('flip only goes on a back scene (one with `back`)')
    if (sc.back == null) return
    for (const p of validateFlip(sc.flip)) add(`flip: ${p}`)
    const f = byId.get(sc.back)
    if (f == null) return add(`back: "${sc.back}" doesn't exist`)
    if (f === i) return add("back: a scene can't be its own back")
    const front = scenes[f]
    if (backOf.has(f)) add(`back: "${front.id}" already has a back ("${scenes[backOf.get(f)].id}"); one back per card`)
    else backOf.set(f, i)
    if (front.ghost || front.outer != null || front.back != null || front.formation != null || front.skip) {
      add(`back: the front "${front.id}" must be an ordinary card (not a ghost, outer, back, formation or skip scene)`)
    }
    if (front.parent != null) add(`back: the front "${front.id}" is nested; only a top-level card can turn over`)
    if (hasChildren(front.id)) add(`back: the front "${front.id}" has nested scenes, which wouldn't turn with it`)
    if (sc.at != null) add('a back scene has no `at` of its own: it sits on its front')
    if (sc.ghost || sc.outer != null || sc.formation != null || sc.skip) add("a back scene can't be a ghost, outer, formation or skip scene")
    if (sc.parent != null) add("a back scene can't be nested (no `parent`)")
    if (hasChildren(sc.id)) add("a back scene can't have nested scenes: they wouldn't turn with it")
  })
  return out
}

/** Back scenes take their front's place. Call before placeGhosts (ghosts cover the talk). */
export function placeBacks(scenes) {
  for (const sc of scenes) {
    if (sc.back == null || sc.at != null) continue
    const front = scenes.find((s) => s.id === sc.back && s.back == null)
    if (front?.at) sc.at = { ...front.at }
  }
}

/**
 * The valid pairs, with their options filled in: [{ front, back, axis, dir, tilt }] (scene indexes).
 * A pair with any problem is left out (it then shows as two flat cards on top of each other).
 */
export function flipPairs(scenes, problems = flipProblems(scenes)) {
  const bad = new Set(problems.map((p) => p.i))
  const out = []
  scenes.forEach((sc, i) => {
    if (sc.back == null || bad.has(i)) return
    const front = scenes.findIndex((s) => s.id === sc.back)
    out.push({ front, back: i, ...FLIP_DEFAULTS, ...(sc.flip ?? {}) })
  })
  return out
}
