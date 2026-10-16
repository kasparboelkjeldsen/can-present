<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDeck } from './engine/useDeck.js'
import ScenePreview from './engine/ScenePreview.vue'

const { scenes, idx, step, current, maxStep, next, prev, blackout, nextIndex, reset, resets } = useDeck()
document.title = '🎤 Presenter — ' + document.title

const nextView = computed(() => {
  if (step.value < maxStep(idx.value)) return { scene: current.value, step: step.value + 1 }
  return { scene: scenes[nextIndex(idx.value)], step: 0 }
})

const notesText = computed(() => {
  const n = current.value.notes
  return Array.isArray(n) ? n.map((l) => '• ' + l).join('\n') : n || '—'
})

// timer starts on first navigation (or click on it)
const started = ref(null)
const now = ref(Date.now())
let tick
onMounted(() => { tick = setInterval(() => (now.value = Date.now()), 500) })
onBeforeUnmount(() => clearInterval(tick))
const fmt = (ms) => {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
const elapsed = computed(() => (started.value ? fmt(now.value - started.value) : '00:00'))
const clock = computed(() => new Date(now.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const toggleBlackout = () => { blackout.value = !blackout.value }
watch(resets, () => { started.value = null })
const toggleTimer = () => { started.value = started.value ? null : Date.now() }
const go = (fn) => { if (!started.value) started.value = Date.now(); fn() }
addEventListener('keydown', (e) => {
  if (!started.value && ['ArrowRight', 'PageDown', ' '].includes(e.key)) started.value = Date.now()
})
</script>

<template>
  <div class="presenter">
    <header>
      <div class="timer" title="click to start/reset" @click="toggleTimer">{{ elapsed }}</div>
      <div class="pos">
        <b>{{ idx + 1 }}</b> / {{ scenes.length }} · {{ current.title ?? current.id }}
        <span class="dots">
          <i v-for="n in maxStep(idx) + 1" :key="n" :class="{ on: n - 1 <= step }" />
        </span>
      </div>
      <div class="clock">{{ clock }}</div>
    </header>

    <main>
      <section class="now">
        <ScenePreview :scene="current" :step="step" active />
      </section>
      <aside>
        <div class="label">Next</div>
        <ScenePreview :scene="nextView.scene" :step="nextView.step" />
        <div class="label">Notes</div>
        <div class="notes">{{ notesText }}</div>
        <div class="controls">
          <button @click="reset">↺ Reset</button>
          <button @click="go(prev)">← Back</button>
          <button :class="{ on: blackout }" @click="toggleBlackout">Blackout</button>
          <button class="primary" @click="go(next)">Next →</button>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.presenter {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 24px;
  background: #0b1130;
  color: #dfe3ff;
}
header { display: flex; align-items: center; gap: 30px; }
.timer { font: 700 44px var(--mono); color: var(--k-green); cursor: pointer; }
.pos { flex: 1; font-size: 22px; display: flex; align-items: center; gap: 18px; }
.pos b { color: #fff; font-size: 28px; }
.dots { display: inline-flex; gap: 8px; }
.dots i { width: 12px; height: 12px; border-radius: 50%; background: #2b3566; }
.dots i.on { background: var(--k-green); }
.clock { font: 400 30px var(--mono); opacity: 0.7; }
main { flex: 1; min-height: 0; display: grid; grid-template-columns: 1.7fr 1fr; gap: 24px; }
.now { min-width: 0; }
aside { display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.label { font-size: 14px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.5; margin-top: 6px; }
.notes { flex: 1; overflow: auto; font-size: 26px; line-height: 1.45; white-space: pre-wrap; }
.controls { display: flex; gap: 10px; }
button {
  flex: 1;
  padding: 16px;
  border: 0;
  border-radius: 12px;
  font: 700 18px var(--sans);
  background: #1d2654;
  color: #dfe3ff;
  cursor: pointer;
}
button.primary { background: var(--k-green); color: var(--k-dark); }
button.on { background: #000; outline: 2px solid var(--k-green); }
</style>
