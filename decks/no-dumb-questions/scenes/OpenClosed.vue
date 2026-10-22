<script setup>
// Open vs closed weights, and why "open weights" isn't "open source". steps: 3.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--dark oc">
    <span class="kicker">open vs closed weights</span>
    <h2 class="h2 rise">Can you download the file?</h2>
    <div class="row">
      <Step :at="1" anim="pop" class="card"><h3><span class="good">Yes:</span> open weights</h3><p>Llama, DeepSeek, Qwen, Mistral, gpt-oss. Run it anywhere, even train it further.</p></Step>
      <Step :at="2" anim="pop" class="card"><h3><span class="bad">No:</span> closed weights</h3><p>Claude, GPT, Gemini. The file never leaves the company. You get an API.</p></Step>
    </div>
    <Step :at="3" anim="up"><p class="lead">Open weights ≠ open source. You get the numbers, not the training data or the recipe. It's a <span class="accent">compiled binary</span>: you can run it, you can't rebuild it. And read the license.</p></Step>
  </div>
</template>

<style scoped>
.oc { gap: 32px; }
.row { display: flex; gap: 40px; margin-top: 10px; }
.card { flex: 1; }
</style>
