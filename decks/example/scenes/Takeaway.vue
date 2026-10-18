<script setup>
// The takeaway: a ghost scene (deck.js: ghost: true, at: null). It covers the whole canvas and only
// shows while on stage, so its translucent background lets the whole talk show through behind it.
</script>

<template>
  <div class="slide slide--dark takeaway">
    <p class="kicker">takeaway</p>
    <h1 class="h1">Every scene here is<br />a file you can <span class="accent">copy</span>.</h1>
    <svg class="under" viewBox="0 0 600 30" preserveAspectRatio="none" aria-hidden="true"><path d="M4 24 L596 6" pathLength="1" /></svg>
  </div>
</template>

<style scoped>
.takeaway { background: rgba(29, 36, 51, 0.86); align-items: center; justify-content: center; text-align: center; }
.kicker { align-self: center; margin: 0; }
.is-active .h1 { animation: rise 1s var(--ease-out) 0.6s both; }
.under { width: 900px; height: 30px; overflow: visible; }
.under path { fill: none; stroke: var(--deck-accent); stroke-width: 8; stroke-linecap: round; stroke-dasharray: 1; }
.is-active .under path { animation: draw 0.9s var(--ease-out) 1.5s both; }
@keyframes draw { from { stroke-dashoffset: 1; } }
</style>
