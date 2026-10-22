<script setup>
// The reveal for a daily Copilot user: Copilot isn't a model, it's a harness. steps: 1.
import Step from '@engine/Step.vue'
import Tok from '../components/Tok.vue'
</script>

<template>
  <div class="slide slide--light copilot">
    <span class="kicker">so what is Copilot?</span>
    <h1 class="h1 rise">Copilot is a <span class="accent">harness</span>.</h1>
    <p class="lead rise" style="--d: 1">The model is a dropdown. The same model in a different harness gives different results.</p>
    <Step :at="1" anim="up" class="grid">
      <span class="what">harnesses</span>
      <div class="chips"><Tok :hue="0">Copilot</Tok><Tok :hue="0">Cursor</Tok><Tok :hue="0">Claude Code</Tok><Tok :hue="0">Codex</Tok><Tok :hue="0">your script</Tok></div>
      <span class="what">models</span>
      <div class="chips"><Tok :hue="3">GPT</Tok><Tok :hue="3">Claude</Tok><Tok :hue="3">Gemini</Tok><Tok :hue="3">Qwen</Tok><Tok :hue="3">Llama</Tok></div>
      <span />
      <p class="pick">Pick one of each.</p>
    </Step>
  </div>
</template>

<style scoped>
.copilot { justify-content: center; }
.grid { display: grid; grid-template-columns: 260px 1fr; align-items: center; gap: 26px 30px; margin-top: 20px; }
.what { font: 800 30px var(--sans); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); text-align: right; }
.chips { display: flex; flex-wrap: wrap; gap: 16px; font-size: 44px; }
.pick { margin: 0; font: 800 44px var(--sans); color: var(--accent); }
</style>
