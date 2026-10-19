<script setup>
import { computed, provide, ref, watch, onBeforeUnmount } from 'vue'
import { useStep } from '@engine/useStep.js'
import Step from '@engine/Step.vue'

// The four boxes build by themselves once the camera has landed: 1–2, then 3–4 and the loop. The one
// click left (deck.js steps: 1) brings in the catch. `phase` is the scene's own step: 0–2 run on a
// timer and the click jumps to 3. It's provided as the scene step, so the <Step>s below follow it.
// Leaving the scene resets the timer, so it plays again next time.
const P = { pair1: 1, pair2: 2, catch: 3 }
const LAND_MS = 1100 // the flight in from the map
const PAIR_MS = 1500 // between 1–2 and 3–4
const { step: deckStep, active } = useStep()
const auto = ref(0)
let timers = []
const clear = () => { timers.forEach(clearTimeout); timers = [] }
watch(active, (on) => {
  clear()
  auto.value = 0
  if (on) timers = [setTimeout(() => (auto.value = P.pair1), LAND_MS), setTimeout(() => (auto.value = P.pair2), LAND_MS + PAIR_MS)]
}, { immediate: true })
onBeforeUnmount(clear)
// not on stage (past, overview, thumbnails): the finished diagram, plus the catch once clicked past
const phase = computed(() => (deckStep.value >= 1 ? P.catch : active.value ? auto.value : P.pair2))
provide('scene-step', phase)
const half = computed(() => phase.value >= P.pair2)

const steps = [
  { t: 'Loads from browser cache', s: 'immutable, maybe months old', at: P.pair1 },
  { t: 'Phones home', s: 'who am I? what do I wear? is there a newer me?', at: P.pair1 },
  { t: 'Newer version? Fetch it uncached.', s: '', at: P.pair2 },
  { t: 'Replace myself.', s: '', at: P.pair2 },
]
// x centres of the four columns (slide space)
const X = [330, 750, 1170, 1590]
const LOOP = 'M330 330 H1590 V600 Q1590 680 1510 680 H410 Q330 680 330 600 Z'
</script>

<template>
  <div class="slide slide--dark boot">
    <div class="kicker">Self-bootstrapping</div>

    <svg class="wires" viewBox="0 0 1920 1080">
      <path class="seg" :class="{ on: phase >= P.pair1 }" :d="`M${X[0] + 70} 330 H${X[1] - 70}`" />
      <path class="seg" :class="{ on: phase >= P.pair2 }" :d="`M${X[1] + 70} 330 H${X[2] - 70}`" />
      <path class="seg" :class="{ on: phase >= P.pair2 }" :d="`M${X[2] + 70} 330 H${X[3] - 70}`" />
      <!-- back to the page -->
      <path class="loop" :class="{ on: half }" d="M1590 400 V600 Q1590 680 1510 680 H410 Q330 680 330 600 V400" />
      <circle v-if="half" r="14" class="runner">
        <animateMotion :path="LOOP" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>

    <Step
      v-for="(s, i) in steps"
      :key="i"
      :at="s.at"
      :delay="(i % 2) * 250"
      anim="pop"
      class="col"
      :style="{ left: X[i] - 190 + 'px' }"
    >
      <div class="num">{{ i + 1 }}</div>
      <div class="t">{{ s.t }}</div>
      <div v-if="s.s" class="s">{{ s.s }}</div>
    </Step>

    <Step :at="P.pair2" anim="fade" :delay="600" class="loop-label">…and the page never noticed</Step>

    <Step :at="P.catch" anim="up" class="catch">
      <div class="kicker">The catch</div>
      <div class="catch-text">The update check in your oldest cached copy can never be fixed.</div>
    </Step>
  </div>
</template>

<style scoped>
.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.seg, .loop {
  fill: none;
  stroke: var(--k-green);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 3000;
  stroke-dashoffset: 3000;
  transition: stroke-dashoffset 1.2s var(--ease-out) 0.3s;
}
.loop { stroke: rgba(247, 246, 242, 0.45); stroke-dasharray: 3000; }
.seg.on, .loop.on { stroke-dashoffset: 0; }
.runner { fill: var(--k-green); }

.col {
  position: absolute;
  top: 260px;
  width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
}
.num {
  width: 140px;
  height: 140px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--k-dark);
  border: 5px solid var(--k-green);
  font: 400 70px var(--serif);
  color: var(--k-green);
}
.t { font: 700 38px/1.15 var(--sans); }
.s { font: 400 28px/1.3 var(--sans); opacity: 0.75; }
.loop-label { position: absolute; left: 0; right: 0; top: 700px; text-align: center; font: 400 28px var(--sans); opacity: 0.7; }
.loop-label.is-shown { opacity: 0.7; }

.catch {
  position: absolute;
  left: 140px;
  right: 140px;
  bottom: 120px;
  display: flex;
  align-items: center;
  gap: 36px;
  padding: 36px 44px;
  border-radius: var(--radius);
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(195, 242, 64, 0.5);
}
.catch .kicker { flex: none; }
.catch-text { font: 400 44px/1.2 var(--serif); }
</style>
