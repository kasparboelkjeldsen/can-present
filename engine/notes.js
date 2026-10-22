import { reactive, ref } from 'vue'

// Speaker notes, keyed by scene id. Source of truth: decks/<deck>/notes.json,
// served by the deck-notes plugin in engine/vite.js (and copied into production builds).
// Edits are saved through the dev server and pushed live to every open window.

export const notes = reactive({})
export const notesLoaded = ref(false)
export const canEdit = import.meta.env.DEV

// A single-file build (npm run compile) carries the notes in the page itself. Otherwise they're
// fetched relative to the build's base, so a build hosted under a subpath (GitHub Pages) finds them.
const embedded = document.getElementById('deck-notes')
;(embedded
  ? Promise.resolve().then(() => JSON.parse(embedded.textContent))
  : fetch(`${import.meta.env.BASE_URL}deck-notes.json`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})))
  .then((data) => Object.assign(notes, data))
  .catch(() => {})
  .finally(() => (notesLoaded.value = true))

// pushed by the dev server whenever any window saves
import.meta.hot?.on('deck:notes', ({ id, text }) => { notes[id] = text })

export async function saveNote(id, text) {
  notes[id] = text
  const res = await fetch(`/__deck/notes/${encodeURIComponent(id)}`, { method: 'PUT', body: text })
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`)
}
