#!/usr/bin/env node
// npm run new-deck -- <id> [--title "…"] [--icon 🎬] [--from path/to/scene-description.md]
//
// Copies templates/deck/ to decks/<id>/ and fills in id, title and icon. With --from it also
// turns a scene description (the format in docs/presentation-guide.md) into stub scenes that
// render and navigate straight away: one .vue per scene with the description in a top comment,
// the right slide variant, the title and one <Step> per build; deck.js entries on a default
// left-to-right path; notes.json from the notes; the assets list in brief.md.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT, DECKS_DIR } from '../engine/vite.js'

const TEMPLATE = path.join(ROOT, 'templates', 'deck')
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/
const USAGE = `Usage: npm run new-deck -- <id> [--title "…"] [--icon 🎬] [--from path/to/scene-description.md]

  <id>      folder name in decks/ (kebab-case)
  --title   deck title (default: from the scene description, else the id)
  --icon    an emoji; it becomes the favicon (default 🎬)
  --from    a scene-description.md in the format of docs/presentation-guide.md`

function fail(msg) {
  console.error(msg + '\n\n' + USAGE)
  process.exit(1)
}

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const out = { id: null, title: null, icon: null, from: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0) }
    const m = /^--(title|icon|from)(?:=(.*))?$/.exec(a)
    if (m) {
      const v = m[2] ?? argv[++i]
      if (v == null) fail(`--${m[1]} needs a value`)
      out[m[1]] = v
    } else if (a.startsWith('-')) fail(`Unknown option: ${a}`)
    else if (!out.id) out.id = a
    else fail(`Unexpected argument: ${a}`)
  }
  return out
}

// ---------------------------------------------------------------- escaping

const jsStr = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ')}'`
const html = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
const comment = (s) => String(s).replace(/-->/g, '-- >')
const pascal = (id) => {
  let name = id.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('')
  if (/^\d/.test(name)) name = 'Scene' + name
  if (['Step', 'Code', 'Shot'].includes(name)) name += 'Scene'
  return name || 'Scene'
}

// ---------------------------------------------------------------- the scene-description parser

const FIELDS = {
  background: 'background',
  position: 'position',
  'on screen': 'onScreen',
  onscreen: 'onScreen',
  animation: 'animation',
  builds: 'builds',
  build: 'builds',
  notes: 'notes',
}

function dedent(lines) {
  const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length))
  return lines.map((l) => (Number.isFinite(ind) ? l.slice(ind) : l))
}

/** The text of a field: what follows the label, plus its continuation lines (dedented). */
function fieldText(f) {
  const rest = dedent(f.lines)
  return [f.value, ...rest].join('\n').replace(/^\n+|\s+$/g, '')
}

/** Splits "### 4. the-check – Inside the SDK" (–, — or -, any spacing) into number, id, title. */
function sceneHeading(line) {
  const m = /^###(?!#)\s*(\d+)?\s*[.)]?\s*(.*)$/.exec(line.trim())
  if (!m) return null
  const rest = m[2].trim()
  const sep = /\s*[–—]+\s*|\s+-+\s+/.exec(rest)
  const rawId = (sep ? rest.slice(0, sep.index) : rest.split(/\s+/)[0]).trim()
  const title = (sep ? rest.slice(sep.index + sep[0].length) : rest.slice(rawId.length)).trim()
  const id = rawId.toLowerCase().replace(/[`*]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return { n: m[1] ? Number(m[1]) : null, id, title: title || rawId }
}

export function parseSceneDescription(src) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  const out = { title: null, overview: '', assets: '', scenes: [] }
  const titleLine = lines.find((l) => /^#\s+/.test(l))
  if (titleLine) out.title = titleLine.replace(/^#\s+/, '').replace(/^scene description\s*[:–—-]?\s*/i, '').trim() || null

  let section = null // the current "## …" section name, lowercased
  let sectionLines = []
  let scene = null
  let field = null
  let fence = false
  const flushSection = () => {
    if (section?.startsWith('assets')) out.assets = dedent(sectionLines).join('\n').trim()
    if (section?.startsWith('overview')) out.overview = dedent(sectionLines).join('\n').trim()
    sectionLines = []
  }

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence
    if (!fence && /^##\s+/.test(line) && !/^###/.test(line)) {
      flushSection()
      section = line.replace(/^##\s+/, '').trim().toLowerCase()
      scene = field = null
      continue
    }
    if (!fence && /^###(?!#)/.test(line)) {
      const h = sceneHeading(line)
      scene = h && h.id ? { ...h, fields: {} } : null
      if (scene) out.scenes.push(scene)
      field = null
      continue
    }
    if (!scene) {
      if (section) sectionLines.push(line)
      continue
    }
    const fm = !fence && /^\s*(?:[-*+]\s*)?\*\*([^*]+?)\*\*\s*:?\s*(.*)$/.exec(line)
    const key = fm && FIELDS[fm[1].replace(/:\s*$/, '').trim().toLowerCase()]
    if (key) {
      field = { value: fm[2].trim(), lines: [] }
      scene.fields[key] = field
    } else if (field) {
      field.lines.push(line)
    }
  }
  flushSection()

  for (const sc of out.scenes) {
    const text = (k) => (sc.fields[k] ? fieldText(sc.fields[k]) : '')
    sc.background = text('background')
    sc.position = text('position')
    sc.onScreen = text('onScreen')
    sc.animation = text('animation')
    sc.buildsText = text('builds')
    sc.builds = parseBuilds(sc.buildsText)
    sc.notes = parseNotes(text('notes'))
    delete sc.fields
  }
  return out
}

/** "1. … 2. …" (inline or as a list) → ['…', '…']. "none" → []. Numbers must count up from 1. */
export function parseBuilds(text) {
  const plain = text.replace(/```[\s\S]*?```/g, ' ')
  if (!plain.trim() || /^\s*(none|no|no builds|0|n\/a|[-–—])\s*\.?\s*$/i.test(plain)) return { items: [], counted: true }
  const re = /(^|\s)(\d+)[.)]\s+/g
  const marks = []
  let m
  while ((m = re.exec(plain))) {
    if (Number(m[2]) === marks.length + 1) marks.push({ at: m.index + m[1].length, start: m.index + m[0].length })
  }
  if (!marks.length) return { items: [], counted: false }
  const items = marks.map((mk, i) => plain.slice(mk.start, marks[i + 1]?.at ?? plain.length).replace(/\s+/g, ' ').trim())
  return { items, counted: true }
}

/** Bullets (any marker) → their text, one per line. */
export function parseNotes(text) {
  return text
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-*+•]|\d+[.)])\s+/, '').trim())
    .filter(Boolean)
    .join('\n')
}

const VARIANTS = [
  ['accent', /\baccent|orange|bright|brand|colou?r|loud|opener|section/],
  ['light', /\blight|white|paper|sand|cream|pale|beige/],
  ['dark', /\bdark|black|ink|night|navy|charcoal/],
]
export function variantFor(background) {
  const b = background.toLowerCase()
  for (const [v] of VARIANTS) if (b.includes(`slide--${v}`)) return { variant: v }
  const hits = VARIANTS.map(([v, re]) => ({ v, i: b.search(re) })).filter((h) => h.i >= 0).sort((x, y) => x.i - y.i)
  if (hits.length) return { variant: hits[0].v }
  return { variant: 'dark', todo: background ? `background "${background}" isn't dark / light / accent: pick a variant` : 'no background given: pick a variant' }
}

// ---------------------------------------------------------------- writing files

function copyDir(from, to, fill) {
  fs.mkdirSync(to, { recursive: true })
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name)
    if (e.isDirectory()) copyDir(a, b, fill)
    else if (/\.(js|vue|css|json|md)$/.test(e.name)) fs.writeFileSync(b, fill(fs.readFileSync(a, 'utf8'), path.extname(e.name)))
    else fs.copyFileSync(a, b)
  }
}

function filler({ id, title, icon }) {
  return (src, ext) => {
    src = src.replace(/\r\n/g, '\n') // templates may be checked out with CRLF
    if (ext === '.js') {
      src = src.replace(/'__DECK_ID__'/g, jsStr(id)).replace(/'__DECK_TITLE__'/g, jsStr(title)).replace(/'__DECK_ICON__'/g, jsStr(icon))
    }
    const t = ext === '.vue' ? html(title) : ext === '.css' ? title.replace(/\*\//g, '* /') : title
    return src.replace(/__DECK_ID__/g, id).replace(/__DECK_TITLE__/g, t).replace(/__DECK_ICON__/g, icon)
  }
}

function sceneFile(sc, { variant, todo }) {
  const verbatim = [
    `${sc.n ?? ''}${sc.n ? '. ' : ''}${sc.id} – ${sc.title}   (from scene-description.md)`,
    ['On screen', sc.onScreen],
    ['Animation', sc.animation],
    ['Builds', sc.buildsText],
    ['Position', sc.position],
  ]
  const head = verbatim.map((v) => {
    if (typeof v === 'string') return '  ' + v
    const [label, text] = v
    if (!text) return `  ${label}: TODO`
    const [first, ...more] = text.split('\n')
    return [`  ${label}: ${first}`, ...more.map((l) => (l.trim() ? '    ' + l : ''))].join('\n')
  })
  if (todo) head.push(`  TODO: ${todo}`)
  if (!sc.builds.counted) head.push('  TODO: the builds aren\'t numbered: count them, add <Step>s and set steps in deck.js')

  const steps = sc.builds.items
    .map((text, i) => `    <Step :at="${i + 1}" anim="up"><p class="lead">${html(text)}</p></Step>`)
    .join('\n')
  const cls = `scene-${sc.id}`
  return `<!--
${comment(head.join('\n'))}
-->
${steps ? `<script setup>\nimport Step from '@engine/Step.vue'\n</script>\n\n` : ''}<template>
  <div class="slide slide--${variant} ${cls}">
    <h2 class="h2">${html(sc.title)}</h2>
${steps ? steps + '\n' : ''}  </div>
</template>

<style scoped>
.${cls} { justify-content: center; }
</style>
`
}

/** Default layout: a left-to-right path, 2300px apart, gently alternating y (±250) and r (±2°). */
const placeAt = (i) => (i === 0 ? { x: 0, y: 0 } : { x: i * 2300, y: i % 2 ? 250 : -250, r: i % 2 ? 2 : -2 })
const fmtAt = (at) => `{ ${Object.entries(at).map(([k, v]) => `${k}: ${v}`).join(', ')} }`

function insideTarget(position, ids) {
  const m = /\binside\b\s*(.*)$/is.exec(position)
  if (!m) return null
  const after = m[1]
  let best = null
  for (const id of ids) {
    const i = after.search(new RegExp(`(^|[^a-z0-9-])${id.replace(/-/g, '\\-')}([^a-z0-9-]|$)`, 'i'))
    if (i >= 0 && (best == null || i < best.i)) best = { i, id }
  }
  return best?.id ?? (after.split(/[.,;(\n]/)[0].trim() || '?')
}

function deckJs({ id, title, icon }, scenes, header) {
  const ids = scenes.map((s) => s.id)
  const imports = scenes.map((s) => `import ${s.component} from './scenes/${s.component}.vue'`).join('\n')
  const entries = scenes.map((s, i) => {
    const nestIn = insideTarget(s.position, ids.filter((x) => x !== s.id))
    const fields = [`id: ${jsStr(s.id)}`, `title: ${jsStr(s.title)}`, `component: ${s.component}`]
    if (s.builds.items.length) fields.push(`steps: ${s.builds.items.length}`)
    return [
      '    {',
      nestIn ? `      // TODO: nest inside ${nestIn} (see Position)` : null,
      `      ${fields.join(', ')},`,
      `      at: ${fmtAt(placeAt(i))},`,
      '    },',
    ].filter((l) => l != null).join('\n')
  })
  return `${header}import './theme.css'
${imports}

export default {
  id: ${jsStr(id)},
  title: ${jsStr(title)},
  icon: ${jsStr(icon)},
  scenes: [
${entries.join('\n')}
  ],
}
`
}

function fillBrief(brief, desc, scenes) {
  if (desc.assets) brief = brief.replace(/TODO: screenshots \(`public\/shots\/…`\)[^\n]*/, desc.assets + '\n\nPut screenshots in `public/shots/` (served as `/shots/…`).')
  const layout = /canvas layout:\s*(.+)/i.exec(desc.overview)
  if (layout) brief = brief.replace(/TODO: how the talk looks in the overview[^\n]*/, layout[1].trim().replace(/^./, (c) => c.toUpperCase()))
  const rows = scenes.map((s, i) => `| ${i + 1} | \`${s.id}\` | ${s.title.replace(/\|/g, '\\|')} | ${s.builds.items.length} | ${/\binside\b/i.test(s.position) ? 'nested (see Position)' : ''} |`)
  brief = brief.replace(/TODO: the scenes in `deck\.js`, in stage order\.\n\n(\|.*\n)(\|.*\n)\|.*\n?/, (all, h, sep) => `The scenes in \`deck.js\`, in stage order (scaffolded from \`scene-description.md\`).\n\n${h}${sep}${rows.join('\n')}\n`)
  return brief
}

// ---------------------------------------------------------------- main

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id) fail('Missing <id>.')
  if (!KEBAB.test(args.id)) fail(`"${args.id}" isn't kebab-case (a-z, 0-9 and single hyphens).`)
  const dir = path.join(DECKS_DIR, args.id)
  if (fs.existsSync(dir)) {
    console.error(`decks/${args.id} already exists. Pick another id (new-deck never overwrites a deck).`)
    process.exit(1)
  }

  let desc = null
  let fromFile = null
  if (args.from) {
    fromFile = path.resolve(args.from)
    if (!fs.existsSync(fromFile)) fail(`--from: ${args.from} not found`)
    desc = parseSceneDescription(fs.readFileSync(fromFile, 'utf8'))
    if (!desc.scenes.length) fail(`--from: no scenes found in ${args.from} (expected "### 1. id – Title" headings)`)
  }

  const meta = { id: args.id, title: args.title ?? desc?.title ?? args.id, icon: args.icon ?? '🎬' }
  const fill = filler(meta)
  copyDir(TEMPLATE, dir, fill)

  if (desc) {
    // unique ids and component names
    const seen = new Set()
    const names = new Set()
    for (const sc of desc.scenes) {
      let id = sc.id, k = 2
      while (seen.has(id)) id = `${sc.id}-${k++}`
      sc.id = id
      seen.add(id)
      let name = pascal(id)
      k = 2
      while (names.has(name)) name = `${pascal(id)}${k++}`
      sc.component = name
      names.add(name)
    }

    fs.rmSync(path.join(dir, 'scenes'), { recursive: true, force: true })
    fs.mkdirSync(path.join(dir, 'scenes'))
    const todos = []
    for (const sc of desc.scenes) {
      const v = variantFor(sc.background)
      if (v.todo) todos.push(`${sc.id}: ${v.todo}`)
      if (!sc.builds.counted) todos.push(`${sc.id}: builds aren't numbered`)
      fs.writeFileSync(path.join(dir, 'scenes', `${sc.component}.vue`), sceneFile(sc, v))
    }

    const template = fs.readFileSync(path.join(TEMPLATE, 'deck.js'), 'utf8')
    const header = fill(template.slice(0, template.search(/^import /m)), '.js')
    fs.writeFileSync(path.join(dir, 'deck.js'), deckJs(meta, desc.scenes, header))
    fs.writeFileSync(path.join(dir, 'notes.json'), JSON.stringify(Object.fromEntries(desc.scenes.map((s) => [s.id, s.notes])), null, 2) + '\n')
    fs.writeFileSync(path.join(dir, 'brief.md'), fillBrief(fs.readFileSync(path.join(dir, 'brief.md'), 'utf8'), desc, desc.scenes))
    fs.copyFileSync(fromFile, path.join(dir, 'scene-description.md'))

    console.log(`Created decks/${args.id}/ with ${desc.scenes.length} scenes from ${path.relative(process.cwd(), fromFile)}.`)
    const nested = desc.scenes.filter((s) => /\binside\b/i.test(s.position))
    if (nested.length) console.log(`  To nest by hand (TODO in deck.js): ${nested.map((s) => s.id).join(', ')}`)
    for (const t of todos) console.log(`  TODO ${t}`)
  } else {
    console.log(`Created decks/${args.id}/ from templates/deck/.`)
  }

  const next = [
    [`npm run deck -- dev ${args.id}`, 'run it, then open http://localhost:5173'],
    [`npm run check -- ${args.id}`, 'lint: ids, steps, notes, layout, missing shots'],
    ['http://localhost:5173/?sheet', 'every scene on one page, with the text-size audit'],
  ]
  const w = Math.max(...next.map(([c]) => c.length)) + 4
  console.log(`
Next:
${next.map(([c, d]) => `  ${c.padEnd(w)}${d}`).join('\n')}
Then fill in the scenes (decks/${args.id}/scenes/: ${desc ? 'each has its description in a top comment' : 'add more next to Title.vue'}),
the palette and fonts in theme.css, and the TODOs in brief.md.`)
}

// run as a script (not when imported for its parser)
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main()
