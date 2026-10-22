<script setup>
// Spec-driven development: write down the what, let the agent do the how. steps: 5.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--dark spec">
    <span class="kicker">spec-driven</span>
    <h2 class="h2 rise">Write down the what.<br />Let it do the how.</h2>
    <div class="flow">
      <!-- literal :at values, so `npm run check` can count the builds -->
      <Step :at="1" anim="pop" class="card"><h3>Spec</h3><p>What, why, and how we'll know it's done.</p></Step>
      <Step :at="2" anim="pop" class="card"><h3>Plan</h3><p>The agent proposes the how. You review it before any code exists.</p></Step>
      <Step :at="3" anim="pop" class="card"><h3>Tasks</h3><p>Small steps, each with its own check.</p></Step>
      <Step :at="4" anim="pop" class="card"><h3>Build</h3><p>The loop runs until the checks pass.</p></Step>
    </div>
    <Step :at="5" anim="up"><p class="lead">Why: the agent forgets everything between sessions. <span class="accent">A spec is memory that survives.</span> And a page of intent is easier to review than 2,000 lines of diff.</p></Step>
  </div>
</template>

<style scoped>
.spec { gap: 24px; }
.spec .h2 { font-size: 84px; }
.flow { display: flex; gap: 30px; }
.card { flex: 1; position: relative; padding: 30px 34px; font-size: 36px; }
.card h3 { font-size: 50px; color: var(--sun); }
.card + .card::before { content: '→'; position: absolute; left: -30px; top: 40px; width: 30px; text-align: center; font: 800 40px var(--sans); color: var(--muted); }
</style>
