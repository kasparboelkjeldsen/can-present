import { ref, computed, watch } from 'vue'
import { scenes } from '../decks/shovelling-umbraco/deck.js'
import { resets } from './signals.js'

// One shared deck state per window. Audience + presenter windows sync over BroadcastChannel.
const idx = ref(0)
const step = ref(0)
const overview = ref(false)
const blackout = ref(false)

const current = computed(() => scenes[idx.value])
const maxStep = (i) => scenes[i]?.steps ?? 0

function go(i, s = 0) {
  i = Math.max(0, Math.min(scenes.length - 1, i))
  idx.value = i
  step.value = s === 'end' ? maxStep(i) : Math.max(0, Math.min(maxStep(i), s))
}
// Scenes with `skip: true` (the demo fallback) are stepped over by next/prev,
// but stay reachable by URL (#fallback) or the X key.
function nextIndex(i) {
  for (let j = i + 1; j < scenes.length; j++) if (!scenes[j].skip) return j
  return -1
}
function prevIndex(i) {
  for (let j = i - 1; j >= 0; j--) if (!scenes[j].skip) return j
  return -1
}
function next() {
  if (step.value < maxStep(idx.value)) step.value++
  else if (nextIndex(idx.value) >= 0) go(nextIndex(idx.value), 0)
}
function prev() {
  if (step.value > 0) step.value--
  else if (prevIndex(idx.value) >= 0) go(prevIndex(idx.value), 'end')
}
function toFallback() {
  const i = scenes.findIndex((s) => s.skip)
  if (i >= 0) go(i)
}

// ---- URL hash: #scene-id/step (survives reloads while vibing) ----
function readHash() {
  const [id, s] = location.hash.replace(/^#\/?/, '').split('/')
  const i = scenes.findIndex((sc) => sc.id === id)
  if (i >= 0) go(i, Number(s) || 0)
}
readHash()
window.addEventListener('hashchange', readHash)
watch([idx, step], () => {
  const h = `#${current.value.id}/${step.value}`
  if (location.hash !== h) history.replaceState(null, '', location.search + h)
})

// ---- Sync between deck, /notes and ?presenter ----
// Two transports, same messages:
//  • BroadcastChannel – windows/tabs in the same browser (works in the built version too)
//  • Vite dev-server websocket – other devices on the network (phone/tablet as notes screen),
//    relayed by the `deck-sync` plugin in vite.config.js. Only exists under `npm run dev`.
// Every message carries a sender id + sequence number so duplicates/echoes are dropped.
const clientId = Math.random().toString(36).slice(2)
const lastSeen = {}
let seq = 0
let receiving = false

const channel = 'BroadcastChannel' in window ? new BroadcastChannel('shovel-deck') : null
const hot = import.meta.hot

function post(msg) {
  msg = { ...msg, from: clientId, seq: ++seq }
  channel?.postMessage(msg)
  hot?.send('deck:msg', msg)
}
function receive(data) {
  if (!data || data.from === clientId) return
  if (data.seq <= (lastSeen[data.from] ?? 0)) return
  lastSeen[data.from] = data.seq
  receiving = true
  if (data.type === 'nav') { idx.value = data.idx; step.value = data.step }
  if (data.type === 'blackout') blackout.value = data.value
  if (data.type === 'hello') sendNav()
  if (data.type === 'reset') applyReset()
  receiving = false
}

// ---- Reset: back to the title in every window, live frames reloaded, timers zeroed ----
function applyReset() {
  overview.value = false
  blackout.value = false
  go(0)
  resets.value++
}
function reset() {
  applyReset()
  post({ type: 'reset' })
}
channel?.addEventListener('message', ({ data }) => receive(data))
hot?.on('deck:msg', receive)

const sendNav = () => post({ type: 'nav', idx: idx.value, step: step.value })
watch([idx, step], () => { if (!receiving) sendNav() }, { flush: 'sync' })
watch(blackout, (value) => { if (!receiving) post({ type: 'blackout', value }) }, { flush: 'sync' })
// The deck is the source of truth: it starts where its URL says (or at the beginning) and tells
// everyone. Followers (/notes, ?presenter) opened without a position ask where we are instead.
const isFollower = /\/notes\/?$/.test(location.pathname) || new URLSearchParams(location.search).has('presenter')
const hasPosition = scenes.some((sc) => location.hash.replace(/^#\/?/, '').split('/')[0] === sc.id)
if (isFollower && !hasPosition) post({ type: 'hello' })
else sendNav()

// ---- Keyboard (works with most presentation clickers too) ----
function onKey(e) {
  if (e.target.closest?.('input, textarea, [contenteditable]')) return
  if (e.ctrlKey || e.metaKey || e.altKey) return
  const k = e.key
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); overview.value = false; next() }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); overview.value = false; prev() }
  else if (k === 'Home') go(0)
  else if (k === 'End') go(scenes.length - 1, 'end')
  else if (k === 'Escape') overview.value = false
  else if (k === 'o' || k === 'O' || k === '0') overview.value = !overview.value
  else if (k === 'b' || k === 'B' || k === '.') blackout.value = !blackout.value
  else if (k === 'x' || k === 'X') { overview.value = false; toFallback() }
  else if (k === 'r' || k === 'R') reset()
  else if (k === 'f' || k === 'F') {
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
  }
  else if (k === 'p' || k === 'P') {
    window.open(`${location.pathname}?presenter${location.hash}`, 'shovel-presenter', 'width=1400,height=850')
  }
}
window.addEventListener('keydown', onKey)

export function useDeck() {
  return { scenes, idx, step, current, overview, blackout, go, next, prev, maxStep, nextIndex, reset, resets }
}

/**
 * Nested scenes (`parent` + `revealAt` in deck.js) only show up once their parent
 * has reached that build step — otherwise they'd sit in boxes the diagram hasn't drawn yet.
 */
export function nestedVisible(i) {
  const sc = scenes[i]
  if (!sc.parent || overview.value) return true
  const p = scenes.findIndex((s) => s.id === sc.parent)
  if (idx.value > p) return true
  if (idx.value < p) return false
  return step.value >= (sc.revealAt ?? 0)
}

/** The step a scene at index i should render with, given where we are. */
export function stepFor(i) {
  if (overview.value) return Infinity
  if (i < idx.value) return Infinity
  if (i > idx.value) return 0
  return step.value
}
