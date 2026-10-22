<script setup>
// The file needs a player: Ollama, LM Studio, vLLM. steps: 4.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--dark runners">
    <span class="kicker">the players</span>
    <h2 class="h2 rise">The file needs a player</h2>
    <p class="lead rise muted" style="--d: 1">A model file is like an .mp4. You need something like VLC to play it.</p>
    <div class="row">
      <Step :at="1" anim="pop" class="card"><h3>Ollama</h3><p>Command line plus a local API. <code>ollama run llama3.3</code> downloads it and starts serving.</p></Step>
      <Step :at="2" anim="pop" class="card"><h3>LM Studio</h3><p>A desktop app: browse, download, chat. The easy way to try models out.</p></Step>
      <Step :at="3" anim="pop" class="card"><h3>vLLM</h3><p>The server-grade one. Many users at once, and it squeezes the most out of big GPUs.</p></Step>
    </div>
    <Step :at="4" anim="up"><p class="lead">They all speak the same HTTP API, so your tools <span class="accent">don't care which one is underneath</span>.</p></Step>
  </div>
</template>

<style scoped>
.runners { gap: 30px; }
.row { display: flex; gap: 40px; margin-top: 10px; }
.card { flex: 1; }
.card code { color: var(--sun); }
</style>
