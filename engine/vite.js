// Build-time half of the engine: picks the active deck and provides the dev-server plugins.
// Used by vite.config.js only (runs in Node, never in the browser).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const ENGINE_DIR = path.join(ROOT, 'engine')
export const DECKS_DIR = path.join(ROOT, 'decks')

const listDecks = () => {
  try {
    return fs.readdirSync(DECKS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  } catch {
    return []
  }
}

/**
 * The active deck: $DECK if set, else "canPresent": { "deck": "…" } in package.json.
 * Returns { id, dir, publicDir, notes }. Throws with the list of decks/* if the folder doesn't exist.
 */
export function resolveDeck() {
  let id = process.env.DECK?.trim()
  if (!id) {
    try {
      id = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).canPresent?.deck
    } catch {}
  }
  const decks = listDecks()
  const list = decks.length ? decks.map((d) => `  - ${d}`).join('\n') : '  (none)'
  if (!id) {
    throw new Error(`No deck selected. Set DECK=<name> or "canPresent": { "deck": "<name>" } in package.json.\nDecks in decks/:\n${list}`)
  }
  const dir = path.join(DECKS_DIR, id)
  if (!decks.includes(id) || !fs.existsSync(path.join(dir, 'deck.js'))) {
    throw new Error(`Deck "${id}" not found (expected decks/${id}/deck.js).\nDecks in decks/:\n${list}`)
  }
  return { id, dir, publicDir: path.join(dir, 'public'), notes: path.join(dir, 'notes.json') }
}

// Relays deck navigation between every connected browser (deck, /notes, other devices)
// over Vite's own dev-server websocket. See engine/useDeck.js.
export const deckSync = () => ({
  name: 'deck-sync',
  configureServer(server) {
    server.ws.on('deck:msg', (data) => server.ws.send('deck:msg', data))
  },
})

// Speaker notes live in decks/<deck>/notes.json, keyed by scene id.
//   GET  /deck-notes.json        → the whole file (also emitted into the production build)
//   PUT  /__deck/notes/<id>      → save one scene's notes (body = plain text). This machine only.
// Every save is pushed to all connected windows as a `deck:notes` event.
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

export const deckNotes = (file) => {
  const readNotes = () => {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return {} }
  }
  return {
    name: 'deck-notes',
    configureServer(server) {
      server.middlewares.use('/deck-notes.json', (req, res, next) => {
        if (req.method !== 'GET') return next()
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify(readNotes()))
      })
      server.middlewares.use('/__deck/notes', (req, res) => {
        const fail = (code, msg) => { res.statusCode = code; res.end(msg) }
        if (req.method !== 'PUT') return fail(405, 'PUT only')
        if (!LOOPBACK.has(req.socket.remoteAddress)) return fail(403, 'notes can only be edited on the presenting machine')
        const id = decodeURIComponent((req.url ?? '').replace(/^\/+/, ''))
        if (!/^[a-z0-9-]+$/.test(id)) return fail(400, 'bad scene id')
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => {
          body += chunk
          if (body.length > 100_000) { fail(413, 'too long'); req.destroy() }
        })
        req.on('end', () => {
          const all = readNotes()
          all[id] = body
          fs.writeFileSync(file, JSON.stringify(all, null, 2) + '\n')
          server.ws.send('deck:notes', { id, text: body })
          res.end('ok')
        })
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'deck-notes.json', source: JSON.stringify(readNotes()) })
    },
  }
}

// Builds work on any static host (GitHub Pages has no SPA fallback): /notes gets its own
// notes/index.html, a copy of the page (its asset URLs carry the base, so they resolve from there).
export const deckStatic = () => ({
  name: 'deck-static',
  apply: 'build',
  writeBundle(options) {
    const dir = options.dir
    const page = path.join(dir, 'index.html')
    if (!fs.existsSync(page)) return
    fs.mkdirSync(path.join(dir, 'notes'), { recursive: true })
    fs.copyFileSync(page, path.join(dir, 'notes', 'index.html'))
  },
})
