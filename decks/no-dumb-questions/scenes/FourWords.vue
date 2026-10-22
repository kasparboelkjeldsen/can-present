<script setup>
// The map of the whole explainer: four words, one act each. Then the recurring question.
// steps: 5.
import Step from '@engine/Step.vue'
import Why from '../components/Why.vue'
</script>

<template>
  <div class="slide slide--light four">
    <span class="kicker">the map</span>
    <h2 class="h2 rise">Four words</h2>
    <div class="row">
      <Step :at="1" anim="pop" class="card"><span class="n">1</span><h3>LLM</h3><p>The thing that guesses the next word.</p></Step>
      <Step :at="2" anim="pop" class="card"><span class="n">2</span><h3>Model</h3><p>The file that holds it. You download it, or rent it.</p></Step>
      <Step :at="3" anim="pop" class="card"><span class="n">3</span><h3>Harness</h3><p>The program around it that lets it do things.</p></Step>
      <Step :at="4" anim="pop" class="card"><span class="n">4</span><h3>Agent</h3><p>A harness that keeps going until the job is done.</p></Step>
    </div>
    <Step :at="5" anim="up" class="ask">
      <p class="lead">We'll zoom into each one, and keep asking:</p>
      <Why />
    </Step>
  </div>
</template>

<style scoped>
.row { display: flex; gap: 36px; margin-top: 10px; }
.card { flex: 1; padding: 40px; }
.card h3 { font-size: 60px; }
.n { display: inline-grid; place-items: center; width: 64px; height: 64px; margin-bottom: 18px; border-radius: 50%; background: var(--night); color: var(--sun); font: 800 34px var(--sans); }
.ask { display: flex; align-items: center; gap: 36px; margin-top: 16px; }
.ask .lead { flex: none; }
</style>
