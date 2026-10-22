<script setup>
// Nested in `layer`'s feed-forward half. One "neuron": multiply, add (the same sum again), and
// switch off below zero. Each multiplier is a weight; Llama 3 70B has 70 billion. steps: 3.
import Step from '@engine/Step.vue'
import BigNumber from '@engine/components/BigNumber.vue'
import { useStep } from '@engine/useStep.js'

const { step } = useStep()
const inputs = [
  { v: '2', w: '0.5', y: 120 },
  { v: '1', w: '−1', y: 300 },
  { v: '3', w: '0.5', y: 480 },
]
</script>

<template>
  <div class="slide slide--light weights">
    <div class="copy">
      <span class="kicker">weights</span>
      <h2 class="h2">Where the knowledge lives</h2>
      <Step :at="1" anim="up">
        <p class="eq">2×0.5 + 1×(−1) + 3×0.5 = <b>1.5</b></p>
        <p class="lead muted">Same multiply-and-add. Above zero: it fires, at strength 1.5. Below zero: off.</p>
      </Step>
      <Step :at="2" anim="up" class="big">
        <BigNumber :at="2" :to="70" suffix=" billion" :size="120" />
        <p class="lead">Each <b>w</b> is a <span class="accent">weight</span>. That's the “70B” in Llama 3 70B.</p>
      </Step>
      <Step :at="3" anim="up"><p class="lead">Training = nudging every weight a tiny bit, so the right next token gets a little more likely. <b>Trillions of times.</b></p></Step>
    </div>

    <svg class="neuron" viewBox="0 0 640 600" aria-hidden="true">
      <g v-for="(i, n) in inputs" :key="n">
        <line :x1="90" :y1="i.y" x2="470" y2="300" class="wire" />
        <circle cx="90" :cy="i.y" r="56" class="in" />
        <text x="90" :y="i.y + 14" class="v">{{ i.v }}</text>
        <text :x="275" :y="i.y + (300 - i.y) / 2 - 18" class="w">w = {{ i.w }}</text>
      </g>
      <circle cx="470" cy="300" r="80" class="cell" />
      <text x="470" y="316" class="out" :class="{ 'is-on': step >= 1 }">1.5</text>
      <text x="470" y="316" class="out q" :class="{ 'is-on': step < 1 }">?</text>
    </svg>
  </div>
</template>

<style scoped>
.weights { flex-direction: row; align-items: center; gap: 40px; padding: 80px 100px; }
.weights .h2 { font-size: 84px; }
.copy { display: flex; flex-direction: column; gap: 26px; width: 1120px; flex: none; }
.eq { margin: 0 0 12px; font: 400 50px var(--mono); }
.eq b { color: var(--accent); font-weight: 800; }
.big { display: flex; flex-direction: column; gap: 6px; }
.big :deep(.big-number) { align-self: flex-start; align-items: flex-start; }
.big :deep(.bn-num) { color: var(--accent); font-weight: 800; }
.neuron { width: 500px; flex: none; overflow: visible; }
.wire { stroke: var(--night); stroke-width: 5; opacity: 0.4; }
.in { fill: var(--tok-3); }
.cell { fill: var(--sun); }
.v { font: 800 54px var(--mono); text-anchor: middle; fill: var(--night); }
.w { font: 700 40px var(--mono); text-anchor: middle; fill: var(--sun-on-light); paint-order: stroke; stroke: var(--paper); stroke-width: 10px; }
.out { font: 800 60px var(--mono); text-anchor: middle; fill: var(--night); opacity: 0; transition: opacity 0.4s; }
.out.is-on { opacity: 1; }
</style>
