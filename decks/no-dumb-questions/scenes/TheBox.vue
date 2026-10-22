<script setup>
// The office box, concretely: files come from Hugging Face onto the disk, the player (Ollama or
// vLLM) loads them into GPU memory and runs them, your laptop talks to it over HTTP. Builds itself
// (box.js); the `inference` scene lives in the GPUs box.
import Diagram from '@engine/components/Diagram.vue'
import { box } from './box.js'
</script>

<template>
  <div class="slide slide--light the-box">
    <span class="kicker">our box</span>
    <h2 class="h2">The box in the office</h2>
    <Diagram :diagram="box">
      <template #node-machine>
        <span class="machine-label">the box · Ubuntu</span>
      </template>
    </Diagram>
  </div>
</template>

<style scoped>
.the-box { padding: 70px 80px; gap: 24px; }
.machine-label {
  position: absolute;
  right: 36px;
  bottom: 22px;
  font: 800 30px var(--sans);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
