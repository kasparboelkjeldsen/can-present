<script setup>
// /notes — speaker notes for the current scene, white on black, as big as fits the window.
// Follows the deck over BroadcastChannel (same browser) and the dev-server socket (other devices).
// Arrow keys / clicker work here too and drive the deck.
//
// Edit mode (✎ Edit button or the E key, dev server only): the notes become a text box for the
// current scene. Typing autosaves to notes.json; changing scene saves and switches to that scene.
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useDeck } from './engine/useDeck.js'
import { notes, saveNote, canEdit } from './engine/notes.js'

const { scenes, idx, current, nextIndex, reset } = useDeck()
document.title = '📝 Notes — ' + document.title

const raw = computed(() => notes[current.value.id] ?? '')
const lines = computed(() => raw.value.split('\n').map((l) => l.trim()).join('\n').trim().split('\n'))
const nextScene = computed(() => scenes[nextIndex(idx.value)])

// ---- scale text to fill the window ----
const box = ref(null)
const text = ref(null)
async function fit() {
  await nextTick()
  const b = box.value, el = text.value
  if (!b || !el) return
  let lo = 12, hi = 600
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    el.style.fontSize = mid + 'px'
    if (el.offsetHeight <= b.clientHeight && el.scrollWidth <= b.clientWidth) lo = mid
    else hi = mid
  }
  el.style.fontSize = lo + 'px'
}

// ---- edit mode ----
const editing = ref(false)
const draft = ref('')
const editingId = ref(null)
const status = ref('') // '', 'unsaved', 'saving', 'saved', or an error message
const area = ref(null)
let timer = 0

async function flush() {
  clearTimeout(timer)
  if (status.value !== 'unsaved' || !editingId.value) return
  const id = editingId.value, value = draft.value
  status.value = 'saving'
  try {
    await saveNote(id, value)
    if (editingId.value === id && draft.value === value) status.value = 'saved'
  } catch (e) {
    status.value = e.message
  }
}
function onInput() {
  status.value = 'unsaved'
  clearTimeout(timer)
  timer = setTimeout(flush, 600)
}
function load() {
  editingId.value = current.value.id
  draft.value = notes[editingId.value] ?? ''
  status.value = ''
}
async function toggleEdit() {
  if (!canEdit) return
  if (editing.value) {
    await flush()
    editing.value = false
    nextTick(fit)
  } else {
    load()
    editing.value = true
    await nextTick()
    area.value?.focus()
  }
}
// scene changed (clicker, deck, arrow keys) → save what we had, edit the new scene
watch(() => current.value.id, async () => {
  if (editing.value) { await flush(); load() }
})
// text arrived from the server after we opened the editor, and we haven't typed yet
watch(raw, (v) => { if (editing.value && status.value === '') draft.value = v })

function onAreaKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); toggleEdit() }
}
function onKey(e) {
  if (e.target.closest?.('textarea, input')) return
  if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey && !e.altKey) toggleEdit()
}

watch([lines, editing], () => { if (!editing.value) fit() })
const now = ref(new Date())
let tick
onMounted(() => {
  fit()
  document.fonts?.ready.then(fit)
  addEventListener('resize', fit)
  addEventListener('keydown', onKey)
  addEventListener('beforeunload', flush)
  tick = setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => {
  removeEventListener('resize', fit)
  removeEventListener('keydown', onKey)
  removeEventListener('beforeunload', flush)
  clearInterval(tick)
})
const clock = computed(() => now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const KNOWN = ['', 'unsaved', 'saving', 'saved']
const statusText = computed(() => ({ '': '', unsaved: '…', saving: 'saving…', saved: 'saved ✓' })[status.value] ?? `⚠ ${status.value}`)
</script>

<template>
  <div class="notes" :class="{ editing }">
    <header>
      <span><b>{{ idx + 1 }}</b> / {{ scenes.length }} · {{ current.title ?? current.id }}</span>
      <span v-if="nextScene" class="next">next: {{ nextScene.title ?? nextScene.id }}</span>
      <span v-if="editing" class="status" :class="{ err: !KNOWN.includes(status) }">{{ statusText }}</span>
      <span class="clock">{{ clock }}</span>
      <button v-if="canEdit" class="btn" :class="{ on: editing }" title="Edit this scene's notes (E). Esc when done." @click="toggleEdit">
        {{ editing ? 'Done' : '✎ Edit' }}
      </button>
      <button class="btn" title="Back to the start in every window (R)" @click="reset">↺ Reset</button>
    </header>
    <main ref="box">
      <textarea
        v-if="editing"
        ref="area"
        v-model="draft"
        class="area"
        spellcheck="true"
        placeholder="Notes for this scene. One line per cue."
        @input="onInput"
        @blur="flush"
        @keydown="onAreaKey"
      />
      <div v-else ref="text" class="text" :class="{ empty: !lines.join('') }">
        <template v-if="lines.join('')">
          <p v-for="(l, i) in lines" :key="idx + '-' + i">{{ l || ' ' }}</p>
        </template>
        <p v-else>—</p>
      </div>
    </main>
    <footer v-if="editing">Saved to notes.json as you type · arrow keys/clicker change scene when you're not typing · Esc = done</footer>
  </div>
</template>

<style scoped>
.notes {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #000;
  color: #fff;
}
header {
  display: flex;
  align-items: center;
  gap: 2em;
  padding: 1.2vh 2.5vw;
  font: 400 max(14px, 2.2vh) var(--sans);
  color: #777;
  white-space: nowrap;
}
header b { color: #bbb; }
.next { flex: 1; text-align: center; overflow: hidden; text-overflow: ellipsis; }
.clock { margin-left: auto; font-family: var(--mono); }
.status { color: #c3f240; font-family: var(--mono); }
.status.err { color: #ff8071; white-space: normal; }
main {
  flex: 1;
  min-height: 0;
  margin: 1vh 3vw 3vh;
  overflow: hidden;
}
.text { font-family: var(--sans); font-weight: 700; line-height: 1.25; overflow-wrap: break-word; }
.text p { margin: 0 0 0.35em; }
.text.empty { color: #444; }

.area {
  width: 100%;
  height: 100%;
  resize: none;
  padding: 1.2em 1.4em;
  border: 2px solid #c3f240;
  border-radius: 12px;
  outline: none;
  background: #111;
  color: #fff;
  font: 700 max(18px, 3.4vh)/1.4 var(--sans);
}
footer { padding: 0 3vw 2vh; margin-top: -1.5vh; color: #555; font: 400 max(12px, 1.7vh) var(--sans); }

.btn {
  border: 1px solid #333;
  border-radius: 999px;
  padding: 0.15em 0.9em;
  background: none;
  color: #888;
  font: inherit;
  cursor: pointer;
}
.btn:hover, .btn.on { color: #000; background: #c3f240; border-color: #c3f240; }
</style>
