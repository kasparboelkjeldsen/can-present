<script setup>
// Back out of the dive: where those 70 billion numbers come from. steps: 3.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--dark training">
    <span class="kicker">where the weights come from</span>
    <h2 class="h2 rise">Training: guess, check, nudge</h2>
    <div class="row">
      <Step :at="1" anim="pop" class="card"><h3>1 · Pre-training</h3><p>Read a huge pile of text. At every token, guess the next one, check, nudge the weights. Llama 3 read <b class="accent">15 trillion</b> tokens.</p></Step>
      <Step :at="2" anim="pop" class="card"><h3>2 · Post-training</h3><p>Practise on good conversations, get rewarded for good answers. That turns an autocomplete into an <b class="accent">assistant</b>.</p></Step>
      <Step :at="3" anim="pop" class="card"><h3>3 · Freeze</h3><p>Then the weights are fixed. Chatting with it doesn't teach it anything. <b class="accent">Tomorrow it's the same file.</b></p></Step>
    </div>
  </div>
</template>

<style scoped>
.row { flex: 1; display: flex; gap: 40px; margin-top: 20px; }
.card { flex: 1; }
.card h3 { font-size: 52px; }
</style>
