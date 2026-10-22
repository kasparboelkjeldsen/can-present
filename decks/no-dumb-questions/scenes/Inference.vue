<script setup>
// Nested in the-box's GPUs box (the flight in rides the disk → GPUs wire, "70 GB of weights").
// What "running a model" means, and the dead simple maths of its speed. steps: 3.
import Step from '@engine/Step.vue'
import { GPU } from './box.js'

const tps = Math.round(GPU.bandwidth / 70)
const tb = (GPU.bandwidth / 1000).toFixed(1)
</script>

<template>
  <div class="slide slide--dark inference">
    <span class="kicker">running it = inference</span>
    <h2 class="h2">Why GPUs? Why that speed?</h2>
    <p class="lead">Every token runs through every layer: billions of multiply-and-adds. A GPU does <b class="accent">thousands of them at once</b>.</p>
    <Step :at="1" anim="up"><p class="lead">The real limit is <b>memory speed</b>. For every token, every weight is read once.</p></Step>
    <Step :at="2" anim="pop" class="math">
      <span class="eq">{{ tb }} TB/s ÷ 70 GB ≈ <b>{{ tps }}</b></span>
      <span class="unit">tokens a second, at most</span>
      <span class="what">memory speed of one {{ GPU.name }} ÷ a 70 GB model (Llama 3.3 70B at 8 bits)</span>
    </Step>
    <Step :at="3" anim="up"><p class="lead"><b>The trick:</b> “mixture of experts”. DeepSeek V4 Flash has 284 billion weights but uses only <b class="accent">13 billion</b> per token, so it runs far faster than its size suggests.</p></Step>
    <p class="fineprint">For one conversation. Serving many at once gets more out of the same box.</p>
  </div>
</template>

<style scoped>
.inference { gap: 26px; }
.math { display: grid; grid-template-columns: auto 1fr; align-items: baseline; column-gap: 30px; padding: 26px 40px; border-radius: var(--radius); background: var(--night-2); }
.eq { font: 400 64px var(--mono); }
.eq b { color: var(--mint); font-weight: 800; }
.unit { font: 700 40px var(--sans); }
.what { grid-column: 1 / -1; font-size: 30px; color: var(--muted); }
</style>
