import { ref, shallowRef, reactive, computed, watch, inject, effectScope } from 'vue'
import { placeGhosts, placeOuter, W } from './layout.js'
import { flipProblems, flipPairs, placeBacks } from './flip.js'

// One deck on stage = one deck context: its scenes, where it is, its camera, its notes. Whoever puts
// the deck on a page makes it with createDeck() and provides it under DECK_KEY: the engine's own page
// (main.js, app-wide) or <CanPresent> (per component, so a page can hold several decks). Everything
// below it reads it with useDeck().
//
// A string, not a Symbol: a scene and the component round it may come from two copies of the engine
// (a built package and its source), and must still find each other.
export const DECK_KEY = 'can-present:deck'

/**
 * createDeck(deck, options) → the deck context. `deck` is a deck.js default export.
 *
 *   start         { scene: id | index, step } where to begin (the URL hash wins when `hash` is on)
 *   hash          keep the place in the URL hash (#scene-id/step) and follow it
 *   keys          'global': keys and swipes on the window. Anything else: the host binds ctx.onKey /
 *                 ctx.onTouchStart / ctx.onTouchEnd where it wants them (<CanPresent>: on itself)
 *   sync          true | '<channel>': follow and drive other windows over BroadcastChannel
 *   relay         { send(msg), on(fn) }: a second transport for the same messages (the dev server's socket)
 *   follower      a notes / presenter screen: opened without a place, it asks the deck where it is
 *   cam           the camera object to fly (default: its own)
 *   notes         { [sceneId]: text }, default deck.notes; saveNote(id, text) makes them editable
 *   (deck.files)  { '/shots/x.png': 'data:…' }: a deck played from a deck file brings its public/ folder (play.js, asset.js)
 *   presenterUrl  string | () => string: P opens it in a window
 *   embedded      inside another page (<CanPresent>): nothing here touches the page itself
 *   chrome        which parts of the UI round the stage to draw (read by App.vue)
 */
export function createDeck(deck, options = {}) {
  const {
    start = null, hash = false, keys = false, sync = false, relay = null, follower = false,
    saveNote = null, presenterUrl = null, embedded = false, chrome = {},
  } = options
  const scenes = deck.scenes
  const cam = options.cam ?? reactive({ x: 0, y: 0, w: W, r: 0 })
  const notes = options.notes ?? deck.notes ?? {}
  const files = deck.files ?? null

  // ghost scenes with `at: null` get a placement that covers the whole canvas (the talk), and then
  // outer layers (`outer`) are placed round the talk, each round the one before. Back scenes (`back`,
  // flip.js) sit on their front first. (All three leave an already placed deck as it is.)
  const flipIssues = flipProblems(scenes)
  for (const p of flipIssues) console.warn(`[can-present] scene "${scenes[p.i].id}": ${p.message} (flip ignored)`)
  /** cards that turn over: [{ front, back, axis, dir, tilt }] (scene indexes; flip.js) */
  const flips = flipPairs(scenes, flipIssues)
  placeBacks(scenes)
  placeGhosts(scenes)
  placeOuter(scenes)

  // watchers made here live until dispose(), whoever calls createDeck
  const scope = effectScope(true)
  const cleanups = []
  const listen = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts)
    cleanups.push(() => target.removeEventListener(type, fn, opts))
  }

  // Shared deck state. Audience + presenter windows sync over BroadcastChannel.
  const idx = ref(0)
  const step = ref(0)
  const overview = ref(false)
  const blackout = ref(false)
  /** Bumps on every deck reset (R / Reset button): live sites reload, the presenter's timer zeroes. */
  const resets = ref(0)

  const current = computed(() => scenes[idx.value])
  const maxStep = (i) => scenes[i]?.steps ?? 0
  const indexOf = (scene) => (typeof scene === 'number' ? scene : scenes.findIndex((sc) => sc.id === scene))

  function go(i, s = 0) {
    i = Math.max(0, Math.min(scenes.length - 1, i))
    idx.value = i
    step.value = s === 'end' ? maxStep(i) : Math.max(0, Math.min(maxStep(i), s))
  }
  /** go() by scene id (or index); an unknown id is ignored. → whether it went */
  function goTo(scene, s = 0) {
    const i = indexOf(scene)
    if (i < 0 || i >= scenes.length) return false
    go(i, s)
    return true
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
  const atStart = computed(() => step.value === 0 && prevIndex(idx.value) < 0)
  const atEnd = computed(() => step.value >= maxStep(idx.value) && nextIndex(idx.value) < 0)

  if (start) goTo(start.scene ?? 0, start.step ?? 0)

  // ---- URL hash: #scene-id/step (survives reloads while vibing) ----
  const hashId = () => location.hash.replace(/^#\/?/, '').split('/')[0]
  if (hash) {
    const readHash = () => {
      const [id, s] = location.hash.replace(/^#\/?/, '').split('/')
      const i = scenes.findIndex((sc) => sc.id === id)
      if (i >= 0) go(i, Number(s) || 0)
    }
    readHash()
    listen(window, 'hashchange', readHash)
    scope.run(() => watch([idx, step], () => {
      const h = `#${current.value.id}/${step.value}`
      if (location.hash !== h) history.replaceState(null, '', location.search + h)
    }))
  }

  // ---- Sync between deck, /notes and ?presenter ----
  // Two transports, same messages:
  //  • BroadcastChannel – windows/tabs in the same browser (works in the built version too)
  //  • `relay` – other devices on the network (phone/tablet as notes screen). The engine's own page
  //    passes the Vite dev-server websocket (the `deck-sync` plugin in engine/vite.js, `npm run dev` only).
  // Every message carries a sender id + sequence number so duplicates/echoes are dropped.
  const clientId = Math.random().toString(36).slice(2)
  const lastSeen = {}
  let seq = 0
  let receiving = false

  const channelName = sync === true ? `can-present:${deck.id}` : sync || null
  const channel = channelName && 'BroadcastChannel' in window ? new BroadcastChannel(channelName) : null
  const linked = !!(channel || relay)

  function post(msg) {
    if (!linked) return
    msg = { ...msg, from: clientId, seq: ++seq }
    channel?.postMessage(msg)
    relay?.send(msg)
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
  const sendNav = () => post({ type: 'nav', idx: idx.value, step: step.value })
  if (linked) {
    if (channel) {
      channel.addEventListener('message', ({ data }) => receive(data))
      cleanups.push(() => channel.close())
    }
    const off = relay?.on(receive)
    if (typeof off === 'function') cleanups.push(off)
    scope.run(() => {
      watch([idx, step], () => { if (!receiving) sendNav() }, { flush: 'sync' })
      watch(blackout, (value) => { if (!receiving) post({ type: 'blackout', value }) }, { flush: 'sync' })
    })
    // The deck is the source of truth: it starts where its URL says (or at the beginning) and tells
    // everyone. Followers (/notes, ?presenter) opened without a position ask where we are instead.
    const hasPosition = hash && scenes.some((sc) => sc.id === hashId())
    if (follower && !hasPosition) post({ type: 'hello' })
    else sendNav()
  }

  // ---- Fullscreen ----
  // The page's own deck takes the whole page fullscreen. An embedded one takes just itself (`host`,
  // set by <CanPresent>), and where the Fullscreen API isn't there for it (iPhone) it fills the window
  // instead (`maximized`). `fullscreen` is either of the two, kept by <CanPresent>.
  const host = shallowRef(null)
  const maximized = ref(false)
  const fullscreen = ref(false)
  const fsElement = () => document.fullscreenElement ?? document.webkitFullscreenElement ?? null
  function toggleFullscreen() {
    if (fsElement()) return (document.exitFullscreen ?? document.webkitExitFullscreen).call(document)
    if (maximized.value) { maximized.value = false; return }
    const el = host.value ?? document.documentElement
    const request = el.requestFullscreen ?? el.webkitRequestFullscreen
    const fallback = () => { if (host.value && !fsElement()) maximized.value = true }
    if (!request) return fallback()
    try { Promise.resolve(request.call(el)).catch(fallback) } catch { fallback() }
    // a browser inside an app may neither grant nor refuse: don't leave the button doing nothing
    // (if full screen does arrive later, <CanPresent> drops the fallback again)
    setTimeout(fallback, 600)
  }

  // ---- Keyboard (works with most presentation clickers too) ----
  function onKey(e) {
    if (e.target.closest?.('input, textarea, [contenteditable]')) return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const k = e.key
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); overview.value = false; next() }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); overview.value = false; prev() }
    else if (k === 'Home') go(0)
    else if (k === 'End') go(scenes.length - 1, 'end')
    else if (k === 'Escape') { if (overview.value) overview.value = false; else maximized.value = false }
    else if (k === 'o' || k === 'O' || k === '0') overview.value = !overview.value
    else if (k === 'b' || k === 'B' || k === '.') blackout.value = !blackout.value
    else if (k === 'x' || k === 'X') { overview.value = false; toFallback() }
    else if (k === 'r' || k === 'R') reset()
    else if (k === 'f' || k === 'F') toggleFullscreen()
    else if ((k === 'p' || k === 'P') && presenterUrl) {
      window.open(typeof presenterUrl === 'function' ? presenterUrl() : presenterUrl, `can-present:${deck.id}:presenter`, 'width=1400,height=850')
    }
  }

  // ---- Swipe (phones): left = next, right = back. Mostly-vertical moves and pinches are ignored ----
  let touch = null
  function onTouchStart(e) {
    touch = e.touches.length === 1 && !e.target.closest?.('input, textarea, [contenteditable]') ? e.touches[0] : null
  }
  function onTouchEnd(e) {
    if (!touch || e.touches.length) return
    const dx = e.changedTouches[0].clientX - touch.clientX, dy = e.changedTouches[0].clientY - touch.clientY
    touch = null
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    overview.value = false
    dx < 0 ? next() : prev()
  }
  if (keys === 'global') {
    listen(window, 'keydown', onKey)
    listen(window, 'touchstart', onTouchStart, { passive: true })
    listen(window, 'touchend', onTouchEnd, { passive: true })
  }

  /**
   * Whether a nested scene (one with a `parent` in deck.js) is shown. It's hidden while the
   * deck is before its parent, and while the parent is on stage it waits until the parent has
   * reached build step `revealAt` (default 0) — otherwise it'd sit in a box the diagram hasn't
   * drawn yet. Once past the parent (or in overview) it's always shown.
   * Timing is separate: `revealDelay` (ms) delays the fade-in itself, so a nested scene can
   * appear in step with a parent that animates without build steps (applied in App.vue).
   */
  function nestedVisible(i) {
    const sc = scenes[i]
    if (!sc.parent || overview.value) return true
    const p = scenes.findIndex((s) => s.id === sc.parent)
    if (idx.value > p) return true
    if (idx.value < p) return false
    return step.value >= (sc.revealAt ?? 0)
  }

  /** Whether an outer layer (`outer` in deck.js) is shown: only once the deck has reached it. */
  const outerVisible = (i) => !scenes[i].outer || idx.value >= i

  /** The step a scene at index i should render with, given where we are. */
  function stepFor(i) {
    if (overview.value) return Infinity
    if (i < idx.value) return Infinity
    if (i > idx.value) return 0
    return step.value
  }

  /** The on-screen scale of a card placed with scale `s`: 1 = it exactly fills the stage. */
  const zoomOf = (s = 1) => (W * s) / cam.w

  /** Unbind everything createDeck bound (keys, hash, sync). <CanPresent> calls it when it unmounts. */
  function dispose() {
    scope.stop()
    for (const off of cleanups.splice(0)) off()
  }

  return {
    deck, scenes, idx, step, current, overview, blackout, resets, cam, flips,
    go, goTo, next, prev, maxStep, nextIndex, prevIndex, toFallback, reset, atStart, atEnd,
    stepFor, nestedVisible, outerVisible, zoomOf,
    notes, saveNote, canEdit: !!saveNote, files,
    host, maximized, fullscreen, toggleFullscreen,
    onKey, onTouchStart, onTouchEnd,
    embedded, chrome, dispose,
  }
}

/**
 * The deck this component is part of: { scenes, idx, step, current, overview, blackout, go, goTo,
 * next, prev, maxStep, nextIndex, prevIndex, reset, resets, cam, … } (see createDeck).
 * Call it in setup, like any inject. `null` where there's no deck round it (a ?sheet tile).
 */
export function useDeck() {
  return inject(DECK_KEY, null)
}
