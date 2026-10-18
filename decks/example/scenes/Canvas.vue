<script setup>
// Nested scene in the diagram's Browser box (deck.js: at: nest(ARCH, arch.slot('canvas')),
// parent: 'diagram'), reached by riding the render edge out of the engine:
// via: ride(arch, 1, ARCH, { label: 'scenes', tone: 'accent-2' }). steps: 2 in deck.js.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--light canvas-scene">
    <span class="kicker">the browser</span>
    <h2 class="h2">One big canvas</h2>
    <p class="lead">Every scene is a card on one element. The camera is a single CSS transform on it.</p>
    <Step :at="1" anim="up"><code class="transform">transform: scale(z) translate(−x, −y)</code></Step>
    <Step :at="2" anim="pop"><p class="lead">That ride? The same transform, following a wire: <code>via</code> in deck.js.</p></Step>
  </div>
</template>

<style scoped>
.canvas-scene { justify-content: center; }
.transform {
  display: inline-block;
  padding: 22px 36px;
  border-radius: 999px;
  background: var(--deck-ink);
  color: var(--deck-accent);
  font: 700 44px var(--mono);
}
</style>
