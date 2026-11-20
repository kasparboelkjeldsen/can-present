// npm run pack-deck -- [deck] [--out path/to/file.canpresent]
//
// Packs a deck into ONE file without the engine in it (default dist/<deck>.canpresent): the deck to
// play, for a page that already has can-present installed. There, loadDeck(url) or
// <CanPresentPlayer src="…"> plays it (engine/play.js). Compare `compile`, which makes a whole page
// with the engine inside.
//
// The file is JSON:
//   format, version   'can-present-deck', 1
//   id, title         the deck's (the id also scopes its CSS)
//   engine, vue       the versions it was packed with (the player warns when its own differ)
//   notes             { [sceneId]: text }, from notes.json
//   css               the theme, the scenes' styles and the fonts (data: URLs), scoped to the deck's
//                     own box with @scope, so nothing of it applies to the page round it
//   files             the deck's public/ folder, { '/shots/x.png': 'data:…' }; asset() reads them
//   code              deck.js and everything it imports as one script, with Vue and the engine left
//                     out: the player hands it its own
//
// So a deck file is a program, not a document: playing one runs its code in the page. Play files
// you'd also load as a script.
//
// What can't come along: a dev-server proxy (decks/<deck>/vite.config.js), and engine internals that
// the package doesn't export (engine/index.js is what a packed deck can use; the build says which
// import isn't in it).
import fs from 'node:fs'
import path from 'node:path'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ROOT, ENGINE_DIR, BRANDS_DIR } from '../engine/vite.js'
import { publicFiles, dropWoff } from './compile.mjs'

export const FORMAT = 'can-present-deck'
export const VERSION = 1

const kb = (n) => (n < 1024 * 1024 ? Math.round(n / 1024) + ' kB' : (n / 1024 / 1024).toFixed(1) + ' MB')
const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback } }

/**
 * What the package exports, by engine file: Map('Step.vue' → { default: 'Step', named: [] }),
 * Map('layout.js' → { default: null, named: ['W', 'H', 'nest', …] }). Read from engine/index.js, so
 * a deck's `@engine/…` imports can be pointed at the package, and anything else is an error.
 */
function packageSurface() {
  const src = fs.readFileSync(path.join(ENGINE_DIR, 'index.js'), 'utf8')
  const surface = new Map()
  for (const [, names, file] of src.matchAll(/export\s*\{([^}]+)\}\s*from\s*'\.\/([^']+)'/g)) {
    const entry = surface.get(file) ?? { default: null, named: [] }
    for (const part of names.split(',').map((s) => s.trim()).filter(Boolean)) {
      const asDefault = /^default\s+as\s+(\w+)$/.exec(part)
      if (asDefault) entry.default = asDefault[1]
      else entry.named.push(part)
    }
    surface.set(file, entry)
  }
  return surface
}

// `@engine/Step.vue` → the package's `Step`, and so on: the deck's code ends up asking the player
// for the engine instead of carrying a copy.
function engineFromPackage(surface) {
  const PREFIX = '\0can-present-engine:'
  const EMPTY = '\0can-present-nothing'
  return {
    name: 'can-present-engine-from-package',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id === 'can-present/style.css') return EMPTY // the page already has the engine's styles
      if (!id.startsWith('@engine/')) return null
      const file = id.slice('@engine/'.length)
      if (!surface.has(file)) {
        const from = importer ? path.relative(ROOT, importer.replace(/\?.*$/, '')) : 'the deck'
        this.error(`${from} imports '${id}', which isn't part of the package (engine/index.js exports nothing from it), so this deck can't be packed as it is.`)
      }
      return PREFIX + file
    },
    load(id) {
      if (id === EMPTY) return 'export {}'
      if (!id.startsWith(PREFIX)) return null
      const { default: def, named } = surface.get(id.slice(PREFIX.length))
      return [
        def && `export { ${def} as default } from 'can-present'`,
        named.length && `export { ${named.join(', ')} } from 'can-present'`,
      ].filter(Boolean).join('\n')
    },
  }
}

/** The top-level statements of a stylesheet: rules with their block, and `@import …;` and the like. */
function topLevel(css) {
  const out = []
  let depth = 0, start = 0, quote = null
  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
    } else if (c === '"' || c === "'") quote = c
    else if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end < 0 ? css.length : end + 1
    } else if (c === '{') depth++
    else if (c === '}') {
      if (--depth === 0) { out.push(css.slice(start, i + 1)); start = i + 1 }
    } else if (c === ';' && depth === 0) { out.push(css.slice(start, i + 1)); start = i + 1 }
  }
  const rest = css.slice(start).trim()
  if (rest) out.push(rest)
  return out.map((s) => s.trim()).filter(Boolean)
}

// names are global whatever the scope, and these don't belong inside one
const UNSCOPED = /^@(font-face|(-webkit-)?keyframes|property|import|charset|namespace|counter-style|font-feature-values|font-palette-values)\b/i

/**
 * The deck's CSS, applying only inside its own box: every rule goes into
 * `@scope (.can-present[data-deck="<id>"])`, where `:root` (a theme's tokens) becomes the box itself.
 * So the theme stays out of the page round the deck, and out of another deck on the same page.
 */
export function scopeCss(css, id) {
  const global = [], scoped = []
  for (const rule of topLevel(css)) (UNSCOPED.test(rule) ? global : scoped).push(rule)
  const inner = scoped.join('\n').replace(/:root\b/g, ':scope')
  return global.join('\n') + (inner ? `\n@scope (.can-present[data-deck="${id}"]) {\n${inner}\n}` : '')
}

/**
 * { id, title } as deck.js's `export default { … }` gives them as plain strings: only its own
 * properties, not a scene's `id:` further in. (Anything it can't read is left out.)
 */
export function deckMeta(source) {
  const start = /export\s+default\s*\{/.exec(source)
  if (!start) return {}
  let own = '', depth = 1, quote = null
  for (let i = start.index + start[0].length; i < source.length && depth > 0; i++) {
    const c = source[i]
    if (quote) {
      if (depth === 1) own += c
      if (c === '\\') { i++; if (depth === 1) own += source[i] ?? '' }
      else if (c === quote) quote = null
    } else if (c === '/' && source[i + 1] === '/') {
      i = source.indexOf('\n', i)
      if (i < 0) break
    } else if (c === '/' && source[i + 1] === '*') {
      i = source.indexOf('*/', i + 2) + 1
      if (i < 1) break
    } else if (c === '"' || c === "'" || c === '`') {
      quote = c
      if (depth === 1) own += c
    } else if ('{[('.includes(c)) depth++
    else if ('}])'.includes(c)) depth--
    else if (depth === 1) own += c
  }
  const value = (key) => new RegExp(`(?:^|[,\\s])${key}\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`).exec(own)?.[2]
  return { id: value('id'), title: value('title') }
}

/** Packs a deck (as resolveDeck() gives it) into one .canpresent file. Returns { file, size }. */
export async function pack(deck, { out } = {}) {
  const pkg = readJson(path.join(ROOT, 'package.json'), {})
  const vuePkg = readJson(path.join(ROOT, 'node_modules/vue/package.json'), {})
  const { customElements = [] } = deck.viteConfig
    ? (await import(new URL(`file:///${deck.viteConfig.replace(/\\/g, '/')}`).href)).default
    : {}
  const isCustomElement = (tag) => customElements.some((prefix) => tag.startsWith(prefix))

  const problems = []
  const result = await build({
    root: ROOT,
    configFile: false,
    base: '/', // public paths stay as written ('/shots/x.png'), so they can be matched to `files`
    logLevel: 'error', // (a url(/assets/x.svg) in CSS "stays unchanged": right, the player fills it in)
    publicDir: deck.publicDir, // so '/shots/x.png' in a template is known as a public file, and left as written
    plugins: [engineFromPackage(packageSurface()), vue({ template: { compilerOptions: { isCustomElement } } })],
    resolve: { alias: { '@deck': deck.dir, '@brands': BRANDS_DIR } },
    define: { 'process.env.NODE_ENV': '"production"', __CAN_PRESENT_VERSION__: JSON.stringify(pkg.version ?? 'dev') },
    build: {
      write: false,
      copyPublicDir: false, // public/ goes into the file as data: URLs instead (`files`)
      cssCodeSplit: false,
      // one script that hands back the deck, given Vue and the engine as `Vue` and `CanPresent`
      lib: { entry: path.join(deck.dir, 'deck.js'), formats: ['iife'], name: '__canPresentDeck', fileName: 'deck', cssFileName: 'deck' },
      rollupOptions: {
        external: ['vue', 'can-present'],
        output: { globals: { vue: 'Vue', 'can-present': 'CanPresent' } },
        // an import the package doesn't have would only show as `undefined` on stage
        onLog(level, log) {
          if (/MISSING_EXPORT|IMPORT_IS_UNDEFINED/.test(log.code ?? '')) problems.push(log.message)
        },
      },
    },
  }).catch((e) => {
    // '\0can-present-engine:<file>' in a message is one of the stand-ins above
    if (/can-present-engine:/.test(String(e?.message))) {
      console.error(`\npack: the deck imports a name from the engine that the package doesn't export (engine/index.js lists what a packed deck can use), so it can't be packed as it is.\n`)
    }
    throw e
  })
  if (problems.length) throw new Error(`pack: this deck uses something the package doesn't export:\n  ${problems.join('\n  ')}`)

  const output = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output)
  const chunks = output.filter((o) => o.type === 'chunk')
  if (chunks.length !== 1) throw new Error(`pack: expected one script, got ${chunks.length} (${chunks.map((c) => c.fileName).join(', ')})`)
  const text = (o) => (typeof o.source === 'string' ? o.source : Buffer.from(o.source).toString('utf8'))
  const css = output.filter((o) => o.type === 'asset' && o.fileName.endsWith('.css')).map(text).join('\n')
  const left = output.filter((o) => o.type === 'asset' && !o.fileName.endsWith('.css'))
  if (left.length) console.warn(`pack: not in the file (the deck may miss them): ${left.map((o) => o.fileName).join(', ')}`)

  // the deck's own id and title, without running it (the folder's name if deck.js doesn't say)
  const meta = deckMeta(fs.readFileSync(path.join(deck.dir, 'deck.js'), 'utf8'))
  const id = meta.id ?? deck.id
  const files = publicFiles(deck.publicDir)

  const data = {
    format: FORMAT,
    version: VERSION,
    id,
    title: meta.title ?? null,
    engine: pkg.version ?? null,
    vue: vuePkg.version ?? null,
    notes: readJson(deck.notes, {}),
    css: scopeCss(dropWoff(css), id),
    files,
    code: chunks[0].code,
  }

  const file = path.resolve(ROOT, out ?? path.join('dist', `${deck.id}.canpresent`))
  const json = JSON.stringify(data)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, json)
  const size = Buffer.byteLength(json)
  const pub = Object.keys(files).length
  console.log(`\n  deck: ${deck.id} → ${path.relative(ROOT, file)} (${kb(size)}: code ${kb(Buffer.byteLength(data.code))}, css and fonts ${kb(Buffer.byteLength(data.css))}${pub ? `, ${pub} file${pub > 1 ? 's' : ''} from public/` : ''})`)
  if (size > 50 * 1024 * 1024) console.warn('  That is a big file: shrink the screenshots in public/ if it loads slowly.')
  return { file, size }
}
