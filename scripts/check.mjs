// npm run check -- [deck] [--json]
//
// Text lint of a deck: catches the mechanical mistakes (ids, steps, notes, layout overlaps,
// missing screenshots) without a browser. It loads deck.js exactly as the app does, through
// Vite (middleware mode + ssrLoadModule), then reads each scene's SFC source.
//
// ERROR (exit code 1): duplicate / non-kebab-case ids, unknown parent, missing component or
//   placement, more build steps used than `steps` allows (unreachable builds).
// WARN: fewer build steps used than `steps` (dead clicks), missing / empty / orphan notes,
//   overlapping top-level cards, a nested card outside its parent, /shots/ or /assets/ files
//   that don't exist yet in public/, a scene root without class "slide".
//
// Build steps are inferred from the SFC source (literal <Step :at/:until>, numeric keys of
// literal :focus / :callouts objects, `step >= n` / `step > n` / `step === n`). Anything
// non-literal makes the inference "unknown" and the step checks are skipped for that scene.
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'
import { parse } from 'vue/compiler-sfc'
import { ROOT, DECKS_DIR } from '../engine/vite.js'

const W = 1920
const H = 1080
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/
const OVERLAP_TOLERANCE = 12 // world px: cards may touch or graze, not overlap
const NEST_TOLERANCE = 4 // world px

// ---------------------------------------------------------------- loading

/** import Foo from './scenes/Foo.vue' → { Foo: '<abs path>' } */
function sceneImports(deckDir, deckSrc) {
  const out = {}
  const re = /^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+\.vue)['"]/gm
  let m
  while ((m = re.exec(deckSrc))) {
    const spec = m[2]
    const file = spec.startsWith('@deck/') ? path.join(deckDir, spec.slice(6)) : spec.startsWith('.') ? path.resolve(deckDir, spec) : null
    if (file) out[m[1]] = file
  }
  return out
}

const toUrl = (file) => '/' + path.relative(ROOT, file).split(path.sep).join('/')

async function loadDeck(deckDir) {
  const server = await createServer({
    root: ROOT,
    configFile: path.join(ROOT, 'vite.config.js'),
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  })
  try {
    const deck = (await server.ssrLoadModule('@deck/deck.js')).default
    // Map each scene's component back to its file: load every .vue that deck.js imports and
    // compare module identity (the SSR module graph hands back the same instance).
    const imports = sceneImports(deckDir, fs.readFileSync(path.join(deckDir, 'deck.js'), 'utf8'))
    const fileOf = new Map()
    for (const file of Object.values(imports)) {
      if (!fs.existsSync(file)) continue
      const mod = await server.ssrLoadModule(toUrl(file))
      if (mod.default) fileOf.set(mod.default, file)
    }
    return { deck, fileOf }
  } finally {
    await server.close()
  }
}

// ---------------------------------------------------------------- step inference

/** Numeric keys at the top level of an object literal source: "{ 1: [3], 2: { … } }" → [1, 2] */
function topLevelNumericKeys(src) {
  let depth = 0
  let quote = null
  let flat = ''
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === '\\') { i++; flat += depth === 1 ? '  ' : '  '; continue }
      if (c === quote) quote = null
      flat += depth === 1 ? c : ' '
      continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; flat += depth === 1 ? c : ' '; continue }
    if ('{[('.includes(c)) { depth++; flat += depth === 1 ? c : ' '; continue }
    if ('}])'.includes(c)) { flat += depth === 1 ? c : ' '; depth--; continue }
    flat += depth === 1 ? c : ' '
  }
  const keys = []
  const re = /[{,]\s*['"]?(\d+)['"]?\s*:/g
  let m
  while ((m = re.exec(flat))) keys.push(Number(m[1]))
  return keys
}

const isInt = (s) => /^\d+$/.test(s.trim())

function walk(node, fn) {
  fn(node)
  for (const c of node.children ?? []) if (typeof c === 'object') walk(c, fn)
  for (const b of node.branches ?? []) walk(b, fn) // v-if branches in the compiled AST
}

/** The value source of attribute `name` on an element: static `name="…"` or `:name="…"`. */
function attr(node, name) {
  for (const p of node.props ?? []) {
    if (p.type === 6 && p.name === name) return { literal: true, src: p.value?.content ?? '' }
    if (p.type === 7 && p.name === 'bind' && p.arg?.content === name) return { literal: false, src: p.exp?.content ?? '' }
  }
  return null
}

const stripComments = (s) =>
  s.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\w'"`])\/\/.*$/gm, '$1')

/**
 * Returns { inferred: n } or { inferred: null, reason }.
 */
export function inferSteps(descriptor) {
  const found = []
  const unknown = []
  const ast = descriptor.template?.ast
  if (ast) {
    walk(ast, (node) => {
      if (node.type !== 1) return
      if (node.tag === 'Step') {
        const at = attr(node, 'at')
        if (!at) found.push(1) // Step's default
        else if (isInt(at.src)) found.push(Number(at.src))
        else unknown.push(`non-literal <Step :at="${at.src.trim()}">`)
        const until = attr(node, 'until')
        if (until && until.src.trim() !== 'null') {
          if (isInt(until.src)) found.push(Number(until.src))
          else unknown.push(`non-literal <Step :until="${until.src.trim()}">`)
        }
      }
      for (const name of ['focus', 'callouts']) {
        const a = attr(node, name)
        if (!a || a.literal) continue
        const src = a.src.trim()
        if (src.startsWith('{')) found.push(...topLevelNumericKeys(src))
        else unknown.push(`non-literal :${name}="${src}"`)
      }
    })
  }

  const code = stripComments([descriptor.script?.content, descriptor.scriptSetup?.content, descriptor.template?.content].filter(Boolean).join('\n'))
  if (/provide\(\s*['"]scene-step['"]/.test(code)) unknown.push('provides its own scene-step')
  const re = /(?<![\w$.])step(?:\.value)?\s*(>=|>|===|==)(?!=)\s*([\w$.]+(?:\s*[-+*/]\s*[\w$.]+)*)/g
  let m
  while ((m = re.exec(code))) {
    const [, op, operand] = m
    if (operand === 'Infinity') continue
    if (!isInt(operand)) { unknown.push(`non-literal \`${m[0].trim()}\``); continue }
    found.push(op === '>' ? Number(operand) + 1 : Number(operand))
  }

  if (unknown.length) return { inferred: null, reason: [...new Set(unknown)].join('; ') }
  if (!found.length) return { inferred: null, reason: 'no build markers found' }
  return { inferred: Math.max(...found) }
}

// ---------------------------------------------------------------- geometry

function corners(at) {
  const s = at.s ?? 1
  const a = ((at.r ?? 0) * Math.PI) / 180
  const cos = Math.cos(a), sin = Math.sin(a)
  const hw = (W / 2) * s, hh = (H / 2) * s
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([dx, dy]) => [at.x + dx * cos - dy * sin, at.y + dx * sin + dy * cos])
}

/** Separating axis test for two convex polygons. Returns the penetration depth (0 = apart). */
export function overlapDepth(p, q) {
  let depth = Infinity
  for (const poly of [p, q]) {
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i]
      const [x2, y2] = poly[(i + 1) % poly.length]
      const len = Math.hypot(x2 - x1, y2 - y1)
      const ax = -(y2 - y1) / len, ay = (x2 - x1) / len
      const proj = (pts) => pts.map(([x, y]) => x * ax + y * ay)
      const a = proj(p), b = proj(q)
      const o = Math.min(Math.max(...a), Math.max(...b)) - Math.max(Math.min(...a), Math.min(...b))
      if (o <= 0) return 0
      depth = Math.min(depth, o)
    }
  }
  return depth
}

/** Is every corner of `child`'s card inside `parent`'s card? */
function inside(child, parent) {
  const s = parent.s ?? 1
  const a = (-(parent.r ?? 0) * Math.PI) / 180
  const hw = (W / 2) * s + NEST_TOLERANCE, hh = (H / 2) * s + NEST_TOLERANCE
  return corners(child).every(([x, y]) => {
    const dx = x - parent.x, dy = y - parent.y
    const lx = dx * Math.cos(a) - dy * Math.sin(a)
    const ly = dx * Math.sin(a) + dy * Math.cos(a)
    return Math.abs(lx) <= hw && Math.abs(ly) <= hh
  })
}

// ---------------------------------------------------------------- assets

function sourceFiles(dir) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'public' || e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...sourceFiles(p))
    else if (/\.(vue|js|mjs|ts|css)$/.test(e.name)) out.push(p)
  }
  return out
}

function assetRefs(src) {
  const refs = new Set()
  const quoted = /(['"`])(\/(?:shots|assets)\/[^'"`\s]+?)\1/g
  const bare = /url\(\s*(\/(?:shots|assets)\/[^'")\s]+)\s*\)/g
  let m
  while ((m = quoted.exec(src))) if (!m[2].includes('${')) refs.add(m[2])
  while ((m = bare.exec(src))) refs.add(m[1])
  return [...refs].map((r) => r.replace(/[?#].*$/, ''))
}

// ---------------------------------------------------------------- the check

export async function check(deckId, { json = false } = {}) {
  process.env.DECK = deckId
  const deckDir = path.join(DECKS_DIR, deckId)
  const { deck, fileOf } = await loadDeck(deckDir)
  const scenes = deck.scenes ?? []
  const findings = []
  const add = (level, scene, message) => findings.push({ level, scene, message })
  const rel = (f) => path.relative(deckDir, f).split(path.sep).join('/')

  // ids
  const seen = new Map()
  for (const sc of scenes) {
    if (!sc.id) { add('error', '(deck)', `scene "${sc.title ?? '?'}" has no id`); continue }
    if (seen.has(sc.id)) add('error', sc.id, 'duplicate id')
    seen.set(sc.id, sc)
    if (!KEBAB.test(sc.id)) add('error', sc.id, 'id is not kebab-case')
  }

  // structure, steps, SFC root
  const inference = {}
  const sceneOfFile = new Map()
  for (const sc of scenes) {
    const id = sc.id ?? '(no id)'
    if (sc.parent != null && !seen.has(sc.parent)) add('error', id, `parent "${sc.parent}" doesn't exist`)
    if (!sc.component) add('error', id, 'no component')
    if (sc.at == null && !(sc.ghost && sc.at === null)) add('error', id, 'no `at` (only a ghost may use at: null)')

    const file = sc.component && fileOf.get(sc.component)
    if (!file) {
      if (sc.component) inference[id] = { inferred: null, steps: sc.steps ?? 0, reason: 'component source not found from deck.js imports' }
      continue
    }
    sceneOfFile.set(file, [...(sceneOfFile.get(file) ?? []), id])
    const { descriptor } = parse(fs.readFileSync(file, 'utf8'), { filename: file })
    const steps = sc.steps ?? 0
    const inf = inferSteps(descriptor)
    inference[id] = { ...inf, steps, file: rel(file) }
    if (inf.inferred != null) {
      if (inf.inferred > steps) add('error', id, `uses build step ${inf.inferred} but steps is ${steps}: ${inf.inferred === steps + 1 ? `step ${inf.inferred} can't` : `steps ${steps + 1}–${inf.inferred} can't`} be reached`)
      else if (inf.inferred < steps) add('warn', id, `steps is ${steps} but the highest build step used is ${inf.inferred}: ${steps - inf.inferred} dead click(s)`)
    }

    const root = descriptor.template?.ast?.children?.find((n) => n.type === 1)
    const cls = root && attr(root, 'class')
    const hasSlide = cls?.literal && cls.src.split(/\s+/).includes('slide')
    if (!hasSlide) add('warn', id, `template root <${root?.tag ?? '?'}> in ${rel(file)} has no class "slide"`)
  }

  // notes
  let notes = {}
  const notesFile = path.join(deckDir, 'notes.json')
  try {
    notes = JSON.parse(fs.readFileSync(notesFile, 'utf8'))
  } catch (e) {
    add('warn', '(deck)', fs.existsSync(notesFile) ? `notes.json doesn't parse: ${e.message}` : 'no notes.json')
  }
  for (const id of seen.keys()) {
    if (!(id in notes)) add('warn', id, 'no entry in notes.json')
    else if (!String(notes[id] ?? '').trim()) add('warn', id, 'empty notes')
  }
  for (const key of Object.keys(notes)) if (!seen.has(key)) add('warn', key, 'notes.json entry with no scene')

  // layout
  const top = scenes.filter((sc) => sc.at && !sc.parent && !sc.ghost)
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const d = overlapDepth(corners(top[i].at), corners(top[j].at))
      if (d > OVERLAP_TOLERANCE) add('warn', top[j].id, `card overlaps "${top[i].id}" on the canvas (by ~${Math.round(d)}px)`)
    }
  }
  for (const sc of scenes) {
    const p = sc.parent && seen.get(sc.parent)
    if (p?.at && sc.at && !inside(sc.at, p.at)) add('warn', sc.id, `card isn't inside its parent "${p.id}"`)
  }

  // assets the speaker still has to supply
  const publicDir = path.join(deckDir, 'public')
  const missing = new Map()
  for (const f of sourceFiles(deckDir)) {
    for (const ref of assetRefs(fs.readFileSync(f, 'utf8'))) {
      if (fs.existsSync(path.join(publicDir, ...ref.split('/').filter(Boolean)))) continue
      if (!missing.has(ref)) missing.set(ref, new Set())
      missing.get(ref).add(f)
    }
  }
  for (const [ref, files] of missing) {
    const ids = [...files].flatMap((f) => sceneOfFile.get(f) ?? [])
    add('warn', ids[0] ?? '(deck)', `TODO asset: ${ref} doesn't exist in public/ yet (used in ${[...files].map(rel).join(', ')})`)
  }

  // report
  const order = new Map(scenes.map((sc, i) => [sc.id, i]))
  const rank = (f) => order.get(f.scene) ?? scenes.length
  findings.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1) || rank(a) - rank(b))
  const errors = findings.filter((f) => f.level === 'error').length
  const warnings = findings.length - errors
  const unknown = Object.entries(inference).filter(([, v]) => v.inferred == null && (v.steps > 0 || v.reason !== 'no build markers found'))
  const result = { deck: deckId, scenes: scenes.length, errors, warnings, findings, steps: inference }

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    const w = Math.max(8, ...findings.map((f) => f.scene.length), ...unknown.map(([id]) => id.length))
    for (const f of findings) console.log(`${f.level === 'error' ? 'ERROR' : 'WARN '}  ${f.scene.padEnd(w)}  ${f.message}`)
    if (findings.length) console.log('')
    if (unknown.length) {
      console.log('Build steps not inferred (check these by hand):')
      for (const [id, v] of unknown) console.log(`  ${id.padEnd(w)}  steps: ${v.steps}  (${v.reason})`)
      console.log('')
    }
    console.log(`check ${deckId}: ${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'} · ${scenes.length} scenes`)
  }
  return result
}
