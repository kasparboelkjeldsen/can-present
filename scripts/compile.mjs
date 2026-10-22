// npm run compile -- [deck] [--out path/to/file.html]
//
// Packs a deck into ONE self-contained HTML file (default dist/<deck>.html): open it from disk,
// mail it, put it on a USB stick. Everything is inside: the JS (one chunk, no lazy imports), the
// CSS, the fonts and every image the deck imports (as data: URLs), the speaker notes, and the
// deck's public/ folder (shots, assets), which asset() reads from the page instead of the server.
//
// It's a normal Vite build of the same vite.config.js, run in memory (write: false) with code
// splitting off and every asset inlined, then stitched into index.html here. No extra dependency.
// What can't come along: live sites (<Shot live>) and anything else that needs the network, and
// syncing to other devices (that needs the dev server). ?notes, ?presenter and ?sheet work, and
// windows of the same file sync with each other.
import fs from 'node:fs'
import path from 'node:path'
import { build } from 'vite'
import { ROOT } from '../engine/vite.js'

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.pdf': 'application/pdf', '.json': 'application/json', '.txt': 'text/plain',
}
const dataUrl = (file) => `data:${MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')}`

/** Every file in public/ (dotfiles skipped), as { '/shots/x.png': 'data:…' }. */
function publicFiles(dir) {
  const out = {}
  const walk = (d) => {
    if (!fs.existsSync(d)) return
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else out['/' + path.relative(dir, p).split(path.sep).join('/')] = dataUrl(p)
    }
  }
  walk(dir)
  return out
}

// Inline <script>/<style> content must not close its own tag early; JSON gets every < escaped.
const safeJs = (code) => code.replace(/<\/(script)/gi, '<\\/$1')
const safeCss = (code) => code.replace(/<\/(style)/gi, '<\\/$1')
const safeJson = (data) => JSON.stringify(data).replace(/</g, '\\u003c')
const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB'

/**
 * Builds the active deck (process.env.DECK, set by scripts/deck.mjs) into one HTML file.
 * Returns { file, size }.
 */
export async function compile(deck, { configFile, out } = {}) {
  const result = await build({
    root: ROOT,
    configFile,
    base: '/', // public paths stay as written ('/assets/x.svg'), so they can be matched to public/
    logLevel: 'warn',
    build: {
      write: false,
      copyPublicDir: false, // public/ goes into the page as data: URLs instead (asset() reads them)
      assetsInlineLimit: () => true, // fonts and imported images as data: URLs, whatever their size
      cssCodeSplit: false,
      modulePreload: false,
      rollupOptions: { output: { codeSplitting: false } }, // one chunk: Notes, Sheet, … included
    },
  })
  const output = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output)
  const byName = new Map(output.map((o) => [o.fileName, o]))
  const page = byName.get('index.html')
  if (!page) throw new Error('compile: the build produced no index.html')
  const chunks = output.filter((o) => o.type === 'chunk')
  if (chunks.length !== 1) throw new Error(`compile: expected one JS chunk, got ${chunks.length} (${chunks.map((c) => c.fileName).join(', ')})`)

  const files = publicFiles(deck.publicDir)
  const used = new Set()
  const text = (o) => (typeof o.source === 'string' ? o.source : Buffer.from(o.source).toString('utf8'))
  // a url(…) in CSS that points into public/ (Vite leaves those as paths) becomes its data: URL
  const inlineCssUrls = (css) =>
    css.replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, ref) => {
      if (ref.startsWith('data:')) return m
      const key = '/' + ref.replace(/^(\.\.?\/)+|^\//, '')
      return files[key] ? `url(${q}${files[key]}${q})` : m
    })
  // fontsource ships woff2 with a woff fallback; every current browser takes the woff2, so the
  // fallback would only double the font weight of the file
  const dropWoff = (css) => css.replace(/,\s*url\((['"]?)data:[^;'")]*woff;base64,[^'")]*\1\)\s*format\((['"]?)woff\2\)/g, '')

  let html = text(page)
  html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (m, src) => {
    const o = byName.get(src.replace(/^\.?\//, ''))
    if (!o || o.type !== 'chunk') return m
    used.add(o.fileName)
    return `<script type="module">${safeJs(o.code)}</script>`
  })
  html = html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*>/g, (m) => {
    const href = /\bhref="([^"]+)"/.exec(m)?.[1]
    const o = href && byName.get(href.replace(/^\.?\//, ''))
    if (!o) return m
    used.add(o.fileName)
    return `<style>${safeCss(dropWoff(inlineCssUrls(text(o))))}</style>`
  })

  // the notes (engine/notes.js) and the public files (engine/asset.js) read these
  const notes = byName.get('deck-notes.json')
  if (notes) used.add(notes.fileName)
  const data =
    `<script type="application/json" id="deck-notes">${notes ? safeJson(JSON.parse(text(notes))) : '{}'}</script>\n` +
    (Object.keys(files).length ? `<script type="application/json" id="deck-files">${safeJson(files)}</script>\n` : '')
  html = html.replace(/<\/head>/i, data + '</head>')

  const left = output.filter((o) => o.fileName !== 'index.html' && !used.has(o.fileName))
  if (left.length) console.warn(`compile: not inlined (the page may miss them): ${left.map((o) => o.fileName).join(', ')}`)
  if (/<link\b[^>]*\bhref="\.?\/?assets\//.test(html) || /<script\b[^>]*\bsrc="\.?\/?assets\//.test(html)) {
    console.warn('compile: index.html still references files in assets/')
  }

  const file = path.resolve(ROOT, out ?? path.join('dist', `${deck.id}.html`))
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
  const size = Buffer.byteLength(html)
  const pub = Object.keys(files).length
  console.log(`\n  deck: ${deck.id} → ${path.relative(ROOT, file)} (${mb(size)}${pub ? `, ${pub} file${pub > 1 ? 's' : ''} from public/` : ''})`)
  if (size > 50 * 1024 * 1024) console.warn('  That is a big page: shrink the screenshots in public/ if it loads slowly.')
  return { file, size }
}
