<script setup>
import { computed } from 'vue'
import { useStep } from '../../../engine/useStep.js'
import Shot from '../../../engine/components/Shot.vue'

const { step } = useStep()
const H = 915 // screenshot height in px; field rows measured on it
const items = [
  { text: 'Origins: one component, many sites', y: 180, h: 54 },
  { text: 'CSS variables', y: 392, h: 66 },
  { text: 'Inline style', y: 726, h: 66 },
  { text: 'Classes: borrow their styling system', y: 642, h: 52 },
  { text: 'Which jobs: per-partner job groups', y: 327, h: 52 },
  { text: 'Language: Danish for now, built for more', y: 265, h: 52 },
  { text: 'On / off', y: 818, h: 32, w: 22 },
]
const shown = (i) => step.value >= i + 1
const current = (i) => step.value === i + 1
const hl = (it) => ({ top: (it.y / H) * 100 + '%', height: (it.h / H) * 100 + '%', width: (it.w ?? 98) + '%' })
const done = computed(() => step.value === Infinity)
</script>

<template>
  <div class="slide slide--grey section">
    <div class="kicker">The remote control</div>
    <div class="row">
      <div class="shot-wrap">
        <Shot src="/shots/backoffice-web-komponenter.png" frame="window" :width="1190">
          <div
            v-for="(it, i) in items"
            :key="i"
            class="hl"
            :class="{ on: shown(i), now: current(i) || done }"
            :style="hl(it)"
          ><b>{{ i + 1 }}</b></div>
        </Shot>
      </div>
      <ol class="callouts">
        <li v-for="(it, i) in items" :key="i" :class="{ on: shown(i), now: current(i) || done }">
          <b>{{ i + 1 }}</b><span>{{ it.text }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.section { padding: 90px 100px; }
.row { flex: 1; display: flex; align-items: center; gap: 50px; position: relative; z-index: 2; }
.shot-wrap { transform: rotate(-1.5deg); flex: none; }
.is-active .shot-wrap { animation: in-left 1s var(--ease-out) 0.15s both; }
@keyframes in-left { from { opacity: 0; transform: translateX(-400px) rotate(-5deg); } }

.hl {
  position: absolute;
  left: 1%;
  border: 4px solid var(--k-dark);
  border-radius: 8px;
  background: rgba(195, 242, 64, 0.18);
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 0.4s, transform 0.5s var(--ease-spring);
}
.hl b {
  position: absolute;
  left: -22px;
  top: 50%;
  translate: 0 -50%;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--k-dark);
  color: var(--k-green);
  font: 700 22px var(--sans);
}
.hl.on { opacity: 0.35; transform: none; }
.hl.now { opacity: 1; }

.callouts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 20px; }
.callouts li {
  display: flex;
  align-items: center;
  gap: 18px;
  font: 700 30px/1.2 var(--sans);
  opacity: 0;
  transform: translateX(40px);
  transition: opacity 0.5s, transform 0.6s var(--ease-out);
}
.callouts li b {
  flex: none;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--k-dark);
  color: var(--k-green);
  font-size: 24px;
}
.callouts li.on { opacity: 0.45; transform: none; }
.callouts li.now { opacity: 1; }
</style>
