// The engine's own page: one deck (picked in vite.config.js) filling the window, with the URL hash,
// keys on the whole window, and the notes / presenter / sheet screens. A deck inside another Vue app
// doesn't come through here: that's <CanPresent> (CanPresent.vue, exported from index.js).
import { createApp } from 'vue'
import './styles/engine.css'
import './styles/page.css'
import { inlinePublicPaths } from './asset.js'
import { createDeck, DECK_KEY } from './useDeck.js'
import { cam } from './cameraState.js'
// The active deck. Its deck.js imports the deck's own theme and fonts.
import deck from '@deck/deck.js'

// /notes (a real notes/index.html in builds, so static hosts serve it) or ?notes
const params = new URLSearchParams(location.search)
const kind = location.pathname.replace(/\/+$/, '').endsWith('/notes') || params.has('notes')
  ? 'notes'
  : ['sheet', 'presenter'].find((p) => params.has(p)) ?? 'deck'

// Title and favicon come from the deck.
const prefix = { notes: '📝 Notes — ', presenter: '🎤 Presenter — ' }[kind] ?? ''
document.title = prefix + (deck.title ?? deck.id)
if (deck.icon) {
  let link = document.querySelector('link[rel="icon"]')
  if (!link) link = document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }))
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${deck.icon}</text></svg>`
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg)
}

// a single-file build (npm run compile) carries public/ in the page: catch paths that skip asset()
inlinePublicPaths()

// Pages load on demand. ?sheet (Sheet.vue) makes its own, quiet deck: no keys, hash or window sync.
if (kind === 'sheet') {
  import('./Sheet.vue').then((m) => createApp(m.default, { deck }).mount('#app'))
} else {
  // the dev server's websocket carries the same messages as BroadcastChannel to other devices
  // (the `deck-sync` plugin in engine/vite.js). Only exists under `npm run dev`.
  const hot = import.meta.hot
  const relay = hot ? { send: (msg) => hot.send('deck:msg', msg), on: (fn) => hot.on('deck:msg', fn) } : null
  // only the screens that show notes load them (notes.js fetches the deck's notes.json)
  const follower = kind !== 'deck'
  const notesReady = follower ? import('./notes.js') : Promise.resolve(null)
  const page = { deck: () => import('./App.vue'), notes: () => import('./Notes.vue'), presenter: () => import('./Presenter.vue') }[kind]()

  Promise.all([page, notesReady]).then(([m, n]) => {
    const ctx = createDeck(deck, {
      hash: true,
      keys: 'global',
      sync: true,
      relay,
      follower,
      cam, // the page's camera (cameraState.js), which deck modules may read directly
      notes: n?.notes,
      saveNote: n?.canEdit ? n.saveNote : null,
      presenterUrl: () => `${location.pathname}?presenter${location.hash}`,
    })
    createApp(m.default).provide(DECK_KEY, ctx).mount('#app')
  })
}
