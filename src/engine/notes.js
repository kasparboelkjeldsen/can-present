import { reactive, ref } from 'vue'

// Speaker notes, keyed by scene id. Source of truth: notes.json in the project root,
// served by the deck-notes plugin in vite.config.js (and copied into production builds).
// Edits are saved through the dev server and pushed live to every open window.

export const notes = reactive({})
export const notesLoaded = ref(false)
export const canEdit = import.meta.env.DEV

fetch('/deck-notes.json', { cache: 'no-store' })
  .then((r) => (r.ok ? r.json() : {}))
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
