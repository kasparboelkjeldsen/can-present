<script setup>
// Option A: run it yourself. Its back is `cloud` (deck.js: back: 'local'): → turns the card over.
</script>

<template>
  <div class="slide slide--dark side">
    <span class="kicker">option A</span>
    <h2 class="h2 rise">Run it yourself</h2>
    <ul class="pros-cons">
      <li class="pro">Your code never leaves the building</li>
      <li class="pro">Fixed cost: the box is already paid for</li>
      <li class="pro">You pick the model, and it never changes under you</li>
      <li class="con">The very best models are closed, or don't fit</li>
      <li class="con">You're the ops team: updates, uptime, many users at once</li>
    </ul>
    <p class="fineprint">→ turns the card over</p>
  </div>
</template>

<style scoped>
.side { justify-content: center; }
</style>

<style>
/* shared with Cloud.vue: a list of pluses and minuses */
.pros-cons { display: flex; flex-direction: column; gap: 22px; margin: 10px 0 0; padding: 0; list-style: none; }
.pros-cons li { display: flex; align-items: baseline; gap: 26px; font-size: 44px; line-height: 1.25; }
.pros-cons li::before { flex: none; width: 52px; font: 800 52px var(--mono); text-align: center; }
.pros-cons .pro::before { content: '+'; color: var(--good); }
.pros-cons .con::before { content: '−'; color: var(--bad); }
</style>
