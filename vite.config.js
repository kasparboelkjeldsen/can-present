import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relays deck navigation between every connected browser (deck, /notes, other devices)
// over Vite's own dev-server websocket. See src/engine/useDeck.js.
const deckSync = () => ({
  name: 'deck-sync',
  configureServer(server) {
    server.ws.on('deck:msg', (data) => server.ws.send('deck:msg', data))
  },
})

// Speaker notes live in notes.json (project root), keyed by scene id.
//   GET  /deck-notes.json        → the whole file (also emitted into the production build)
//   PUT  /__deck/notes/<id>      → save one scene's notes (body = plain text). This machine only.
// Every save is pushed to all connected windows as a `deck:notes` event.
const NOTES = path.resolve('notes.json')
const readNotes = () => {
  try { return JSON.parse(fs.readFileSync(NOTES, 'utf8')) } catch { return {} }
}
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

const deckNotes = () => ({
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
        fs.writeFileSync(NOTES, JSON.stringify(all, null, 2) + '\n')
        server.ws.send('deck:notes', { id, text: body })
        res.end('ok')
      })
    })
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'deck-notes.json', source: JSON.stringify(readNotes()) })
  },
})

export default defineConfig({
  plugins: [vue(), deckSync(), deckNotes()],
  server: {
    port: 5173,
    // notes.json is data, not code: saving it must never hot-reload the deck mid-talk
    watch: { ignored: ['**/notes.json'] },
  },
})
