<script setup>
// Nested scene: lives in the diagram's slot (deck.js: at: nest(ARCH, arch.slot('inside')),
// parent: 'diagram', revealAt: arch.revealAt('engine')). It shows up in the box on the step the
// engine box appears, and → from the diagram rides the import edge into it (via in deck.js).
// steps: 2 in deck.js.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--light inside">
    <span class="kicker">nested</span>
    <h2 class="h2">Scenes can live<br />inside other scenes</h2>
    <Step :at="1" anim="up"><p class="lead">Place one with <code>nest(parent, box)</code> and the camera dives in.</p></Step>
    <Step :at="2" anim="pop"><p class="lead">Builds are just more presses of →.</p></Step>
  </div>
</template>

<style scoped>
.inside { justify-content: center; }
</style>
