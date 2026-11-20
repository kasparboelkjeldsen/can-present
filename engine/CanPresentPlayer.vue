<script setup>
// A deck file, played: <CanPresent> for a deck that arrives as a file (npm run pack-deck) instead of
// being imported.
//
//   <CanPresentPlayer src="/talks/my-talk.canpresent" />
//
// `src` is anything loadDeck() takes (play.js): a URL, a Blob / File, the file's text, its parsed
// JSON. Everything else (props, v-model:scene, events, class, style) goes to the <CanPresent> inside,
// and the ref has the same methods. While the file loads, and if it can't be played, the box is
// already there in the page (16:9, or the size the page gives it), with the #loading / #error slot in it.
import { ref, shallowRef, watch } from 'vue'
import CanPresent from './CanPresent.vue'
import { loadDeck } from './play.js'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  src: { type: [String, Object], required: true },
})
const emit = defineEmits(['load', 'error'])

const deck = shallowRef(null)
const error = shallowRef(null)
const inner = ref(null)
let latest = 0
watch(() => props.src, async (src) => {
  const mine = ++latest
  deck.value = null
  error.value = null
  try {
    const loaded = await loadDeck(src)
    if (mine !== latest) return
    deck.value = loaded
    emit('load', loaded)
  } catch (e) {
    if (mine !== latest) return
    error.value = e
    console.error(e)
    emit('error', e)
  }
}, { immediate: true })

const call = (name) => (...args) => inner.value?.[name](...args)
defineExpose({
  next: call('next'),
  prev: call('prev'),
  go: call('go'),
  reset: call('reset'),
  toggleFullscreen: call('toggleFullscreen'),
  toggleOverview: call('toggleOverview'),
  /** the deck context, once the file has loaded */
  get deck() { return inner.value?.deck ?? null },
})
</script>

<template>
  <CanPresent v-if="deck" ref="inner" :key="deck.id" :deck="deck" v-bind="$attrs" />
  <div v-else class="can-present" :class="$attrs.class" :style="$attrs.style">
    <div class="can-present-message">
      <slot v-if="error" name="error" :error="error">This deck couldn't be loaded.</slot>
      <slot v-else name="loading" />
    </div>
  </div>
</template>
