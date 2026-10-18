<script setup>
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
code { font: 700 0.9em var(--mono); }
</style>
