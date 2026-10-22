<script setup>
// "But what does that mean?", answered as a machine: text → tokens → vectors → 80 layers → odds
// → pick one → append, and round again. The diagram (inside.js) builds itself; two of its boxes
// hold nested scenes (`vectors`, `layer`), which the camera dives into next.
import Diagram from '@engine/components/Diagram.vue'
import { inside } from './inside.js'
</script>

<template>
  <div class="slide slide--dark inside">
    <span class="kicker">inside the box</span>
    <h2 class="h2">One token, start to finish</h2>
    <Diagram :diagram="inside" />
  </div>
</template>

<style scoped>
.inside { padding: 70px 80px; gap: 24px; }
</style>
