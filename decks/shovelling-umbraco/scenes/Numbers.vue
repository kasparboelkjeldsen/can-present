<script setup>
// TODO (morning of 22 Oct): refresh JORDEMODER, RADIOGRAF and AS_OF.
import { computed } from 'vue'
import { useStep } from '../../../engine/useStep.js'
import { useCount, fmtNum } from '../../../engine/useCount.js'

const JORDEMODER = 6836
const RADIOGRAF = 5861
const AS_OF = '16 October 2026'

const { step, active } = useStep()
const a = useCount(active, 0, JORDEMODER, { duration: 1600, delay: 400 })
const b = useCount(active, 0, RADIOGRAF, { duration: 1600, delay: 550 })
const total = fmtNum(JORDEMODER + RADIOGRAF)
const phase = computed(() => (step.value === Infinity ? 1 : Math.min(step.value, 2)))
</script>

<template>
  <div class="slide slide--dark numbers" :class="`phase-${phase}`">
    <div class="pair">
      <div class="stat left">
        <div class="num">{{ fmtNum(a) }}</div>
        <div class="label">Jordemoderforeningen</div>
      </div>
      <div class="stat right">
        <div class="num">{{ fmtNum(b) }}</div>
        <div class="label">Radiograferne</div>
      </div>
    </div>

    <div class="merged total">
      <svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" pathLength="1" /></svg>
      <div class="num big">{{ total }}</div>
      <div class="label">loads</div>
    </div>

    <div class="merged zero">
      <svg class="ring red" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" pathLength="1" /></svg>
      <div class="num huge">0</div>
      <div class="label">partners who configured anything.</div>
    </div>

    <div class="small">Component loads, as of {{ AS_OF }}.</div>
  </div>
</template>

<style scoped>
.numbers { align-items: center; justify-content: center; }
.pair { display: flex; gap: 220px; position: relative; z-index: 2; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 20px; transition: transform 0.9s var(--ease-out), opacity 0.6s; }
.num { font: 400 200px/1 var(--serif); font-variant-numeric: tabular-nums; }
.label { font: 700 36px var(--sans); color: var(--k-green); }
.phase-1 .left, .phase-2 .left { transform: translateX(380px) scale(0.6); opacity: 0; }
.phase-1 .right, .phase-2 .right { transform: translateX(-380px) scale(0.6); opacity: 0; }

.merged {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 760px;
  height: 760px;
  margin: -400px 0 0 -380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 0.6s, transform 0.9s var(--ease-spring);
  z-index: 2;
}
.big { font-size: 190px; }
.huge { font-size: 380px; }
.zero .label { position: absolute; bottom: -10px; color: var(--k-light); font-weight: 400; font-family: var(--serif); font-size: 46px; white-space: nowrap; }
.zero .ring { inset: 80px; }
.zero .huge { margin-top: -20px; }
.phase-1 .total { opacity: 1; transform: none; transition-delay: 0.35s; }
.phase-2 .zero { opacity: 1; transform: none; transition-delay: 0.35s; }
.phase-2 .total { transform: scale(0.5); }

.ring { position: absolute; inset: 0; transform: rotate(-90deg); overflow: visible; }
.ring circle { fill: none; stroke: var(--k-green); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.6s var(--ease-out) 0.6s; }
.ring.red circle { stroke: var(--k-red); stroke-width: 6; }
.phase-1 .total .ring circle, .phase-2 .zero .ring circle { stroke-dashoffset: 0; }

.small { position: absolute; right: 64px; bottom: 60px; font: 400 26px var(--sans); opacity: 0.7; }
</style>
