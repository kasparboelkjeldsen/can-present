<script setup>
// How far you let go: four stairs from autocomplete to a background agent. steps: 5.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--light ladder">
    <span class="kicker">how far do you let go?</span>
    <h2 class="h2 rise">From autocomplete to agent</h2>
    <div class="stairs">
      <!-- literal :at values, so `npm run check` can count the builds -->
      <Step :at="1" anim="up" class="stair" style="--i: 0"><h3>Autocomplete</h3><p>Suggests the next lines. You accept or not.</p></Step>
      <Step :at="2" anim="up" class="stair" style="--i: 1"><h3>Chat</h3><p>You ask, it answers, you paste.</p></Step>
      <Step :at="3" anim="up" class="stair" style="--i: 2"><h3>Agent in the editor</h3><p>It reads, edits and runs things. You watch and approve.</p></Step>
      <Step :at="4" anim="up" class="stair" style="--i: 3"><h3>Background agent</h3><p>Give it a ticket, get a pull request.</p></Step>
    </div>
    <Step :at="5" anim="up"><p class="lead">Every step up: you write less, and <span class="accent">review more</span>.</p></Step>
  </div>
</template>

<style scoped>
.ladder { gap: 26px; }
.stairs { display: flex; align-items: flex-end; gap: 24px; height: 560px; }
.stair {
  flex: 1;
  height: calc(250px + var(--i) * 100px);
  padding: 30px 32px;
  box-sizing: border-box;
  border-radius: var(--radius) var(--radius) 0 0;
  background: var(--paper-2);
  border-top: 12px solid var(--sun);
}
.stair h3 { margin: 0 0 12px; font: 800 44px/1.05 var(--sans); }
.stair p { margin: 0; font-size: 34px; line-height: 1.3; }
.stair:nth-child(4) { background: var(--night); color: var(--paper); }
</style>
