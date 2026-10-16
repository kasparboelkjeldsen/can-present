<script setup>
// /notes — speaker notes for the current scene, white on black, as big as fits the window.
// Follows the deck over BroadcastChannel (same browser) and the dev-server socket (other devices).
// Arrow keys / clicker work here too and drive the deck.
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useDeck } from './engine/useDeck.js'

const { scenes, idx, current, nextIndex } = useDeck()
document.title = '📝 Notes — ' + document.title

// notes: a string (multi-line template literals are fine) or an array of bullets
const lines = computed(() => {
  const n = current.value.notes
  if (Array.isArray(n)) return n.map((l) => '• ' + l)
  return String(n ?? '')
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .trim()
    .split('\n')
})
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
watch(lines, fit)
const now = ref(new Date())
let tick
onMounted(() => {
  fit()
  document.fonts?.ready.then(fit)
  addEventListener('resize', fit)
  tick = setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => {
  removeEventListener('resize', fit)
  clearInterval(tick)
})
const clock = computed(() => now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
</script>

<template>
  <div class="notes">
    <header>
      <span><b>{{ idx + 1 }}</b> / {{ scenes.length }} · {{ current.title ?? current.id }}</span>
      <span v-if="nextScene" class="next">next: {{ nextScene.title ?? nextScene.id }}</span>
      <span class="clock">{{ clock }}</span>
    </header>
    <main ref="box">
      <div ref="text" class="text" :class="{ empty: !lines.join('') }">
        <template v-if="lines.join('')">
          <p v-for="(l, i) in lines" :key="idx + '-' + i">{{ l || ' ' }}</p>
        </template>
        <p v-else>—</p>
      </div>
    </main>
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
  cursor: none;
}
header {
  display: flex;
  gap: 2em;
  padding: 1.2vh 2.5vw;
  font: 400 max(14px, 2.2vh) var(--sans);
  color: #777;
  white-space: nowrap;
}
header b { color: #bbb; }
.next { flex: 1; text-align: center; overflow: hidden; text-overflow: ellipsis; }
.clock { margin-left: auto; font-family: var(--mono); }
main {
  flex: 1;
  min-height: 0;
  margin: 1vh 3vw 3vh;
  overflow: hidden;
}
.text { font-family: var(--sans); font-weight: 700; line-height: 1.25; overflow-wrap: break-word; }
.text p { margin: 0 0 0.35em; }
.text.empty { color: #444; }
</style>
