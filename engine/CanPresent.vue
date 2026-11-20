<script setup>
// A deck inside another Vue app.
//
//   <CanPresent :deck="deck" />                          as wide as its container, 16:9
//   <CanPresent :deck="deck" style="height: 70vh" />     any box: the stage is fitted inside, 16:9
//   <CanPresent :deck="deck" v-model:scene="id" v-model:step="n" ref="talk" />   talk.next(), talk.go('id')
//
// Each one is its own deck (state, camera, keys), so a page can hold several. It keeps to its box:
// arrow keys only move it while the keyboard is in it (click it, or tab to it), a swipe only counts
// on it, the URL isn't touched. The button or F takes just the deck full screen, where the stage is
// fitted to the screen; where the browser can't (iPhone), it fills the window instead.
//
// `deck` is read once: to show another deck in the same place, give the component a :key.
import { ref, provide, watch, onMounted, onBeforeUnmount } from 'vue'
import { createDeck, DECK_KEY } from './useDeck.js'
import { inlinePublicPaths } from './asset.js'
import App from './App.vue'
import Presenter from './Presenter.vue'
import Notes from './Notes.vue'

const props = defineProps({
  /** a deck.js default export: { id, title, scenes, layers?, notes? } */
  deck: { type: Object, required: true },
  /** v-model:scene: the id of the scene on stage */
  scene: { type: String, default: null },
  /** v-model:step: its build step */
  step: { type: Number, default: null },
  /** 'deck' (the canvas) | 'presenter' | 'notes': the last two fill the page and follow a deck with the same `sync` */
  view: { type: String, default: 'deck' },
  /** 'focus': keys while the keyboard is in the deck | 'global': always (one deck, a page of its own) | false */
  keys: { type: [String, Boolean], default: 'focus' },
  /** swipe left / right on the deck to move */
  swipe: { type: Boolean, default: true },
  /** keep the place in the URL hash (#scene-id/step). For a deck with a page of its own */
  hash: { type: Boolean, default: false },
  /** true | '<channel>': follow and drive the same deck in other windows (BroadcastChannel) */
  sync: { type: [Boolean, String], default: false },
  /** { send(msg), on(fn) }: carry the same messages to other devices, e.g. over your own websocket */
  relay: { type: Object, default: null },
  /** false: no UI round the stage. Or which parts: { controls, progress, counter, reset, hint } */
  chrome: { type: [Boolean, Object], default: true },
  /** speaker notes, { [sceneId]: text }. Default: deck.notes */
  notes: { type: Object, default: null },
  /** P opens this URL in a window (a page of yours showing view="presenter") */
  presenterUrl: { type: String, default: null },
  /** the box's shape while it has no height of its own, e.g. '4 / 3'. The stage inside is always 16:9 */
  ratio: { type: [String, Number], default: null },
})
const emit = defineEmits(['update:scene', 'update:step', 'change', 'fullscreen'])

const NONE = { controls: false, progress: false, counter: false, reset: false, hint: false }
const EMBED = { controls: true, progress: true, counter: false, reset: false, hint: false }
const chrome = props.chrome === false ? NONE : { ...EMBED, ...(props.chrome === true ? null : props.chrome) }

const page = props.view !== 'deck' // the presenter and notes screens take the whole page, keys included
const globalKeys = props.keys === 'global' || (page && props.keys !== false)
const ctx = createDeck(props.deck, {
  start: props.scene != null ? { scene: props.scene, step: props.step ?? 0 } : null,
  hash: props.hash,
  keys: globalKeys ? 'global' : false, // 'focus' is bound on the root below
  sync: props.sync,
  relay: props.relay,
  follower: page,
  notes: props.notes ?? undefined,
  presenterUrl: props.presenterUrl,
  embedded: true,
  chrome,
})
provide(DECK_KEY, ctx)

// ---- v-model:scene / v-model:step ----
watch(() => [props.scene, props.step], ([id, s]) => {
  const scene = id ?? ctx.current.value.id
  const st = s ?? (scene === ctx.current.value.id ? ctx.step.value : 0)
  if (scene !== ctx.current.value.id || st !== ctx.step.value) ctx.goTo(scene, st)
})
watch([ctx.idx, ctx.step], ([i, s], [pi]) => {
  const id = ctx.scenes[i].id
  if (i !== pi) emit('update:scene', id)
  emit('update:step', s)
  emit('change', { scene: id, index: i, step: s })
})

// ---- the root: keys and swipes while they're in the deck, and the element that goes full screen ----
const root = ref(null)
const focusKeys = props.keys === 'focus' && !globalKeys
const onKey = (e) => { if (focusKeys) ctx.onKey(e) }
const local = !globalKeys // (global: createDeck listens on the window)
const onTouchStart = (e) => { if (local && props.swipe) ctx.onTouchStart(e) }
const onTouchEnd = (e) => { if (local && props.swipe) ctx.onTouchEnd(e) }

const onFsChange = () => {
  const el = document.fullscreenElement ?? document.webkitFullscreenElement
  const native = !!el && el === root.value
  if (native) ctx.maximized.value = false // the real thing arrived after all
  ctx.fullscreen.value = native || ctx.maximized.value
}
// filling the window instead (where the browser has no full screen for it): the page behind stays put
let pageOverflow = null
const lockPage = (on) => {
  const st = document.documentElement.style
  if (on && pageOverflow === null) { pageOverflow = st.overflow; st.overflow = 'hidden' }
  else if (!on && pageOverflow !== null) { st.overflow = pageOverflow; pageOverflow = null }
}
watch(ctx.maximized, (on) => { lockPage(on); onFsChange() })
watch(ctx.fullscreen, (on) => emit('fullscreen', on))
let stopInlining = null
onMounted(() => {
  ctx.host.value = root.value
  // a deck played from a deck file brings its public/ folder: markup that names one of those files
  // without asset() gets it too, inside this box
  if (ctx.files) stopInlining = inlinePublicPaths(root.value, ctx.files)
  document.addEventListener('fullscreenchange', onFsChange)
  document.addEventListener('webkitfullscreenchange', onFsChange)
})
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFsChange)
  document.removeEventListener('webkitfullscreenchange', onFsChange)
  lockPage(false)
  stopInlining?.()
  ctx.dispose()
})

defineExpose({
  next: ctx.next,
  prev: ctx.prev,
  /** go('scene-id' | index, step = 0 | 'end') */
  go: ctx.goTo,
  reset: ctx.reset,
  toggleFullscreen: ctx.toggleFullscreen,
  toggleOverview: () => { ctx.overview.value = !ctx.overview.value },
  /** the deck context itself (useDeck.js): idx, step, overview, blackout, cam, … */
  deck: ctx,
})
</script>

<template>
  <div
    ref="root"
    class="can-present"
    :data-deck="deck.id"
    :class="{ 'is-maximized': ctx.maximized.value, 'is-fullscreen': ctx.fullscreen.value, 'is-page': page }"
    :style="ratio != null ? { '--can-present-ratio': ratio } : null"
    :tabindex="focusKeys ? 0 : undefined"
    role="region"
    aria-roledescription="presentation"
    :aria-label="deck.title ?? deck.id"
    @keydown="onKey"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <Presenter v-if="view === 'presenter'" />
    <Notes v-else-if="view === 'notes'" />
    <App v-else />
  </div>
</template>
