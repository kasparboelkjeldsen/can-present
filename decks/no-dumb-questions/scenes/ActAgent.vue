<script setup>
// Act 4 opener. From far away: "4 · THE AGENT". steps: 1.
import Step from '@engine/Step.vue'
import ActLabel from '../components/ActLabel.vue'
import Why from '../components/Why.vue'
</script>

<template>
  <div class="slide slide--accent act">
    <span class="kicker rise">4 · the agent</span>
    <h1 class="h1 rise" style="--d: 1">Agentic coding</h1>
    <div class="rise" style="--d: 2"><Why /></div>
    <Step :at="1" anim="up"><p class="lead answer">A model in a loop, with tools, working towards a goal <b>until it decides it's done.</b></p></Step>
    <ActLabel n="4" name="the agent" />
  </div>
</template>

<style scoped>
.act { justify-content: center; }
.answer { font-size: 56px; max-width: 1500px; }
</style>
