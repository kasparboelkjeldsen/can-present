<script setup>
// Act 2 opener: the coworker's own question. From far away: "2 · THE MODEL". steps: 1.
import Step from '@engine/Step.vue'
import ActLabel from '../components/ActLabel.vue'
</script>

<template>
  <div class="slide slide--accent act">
    <span class="kicker rise">2 · the model</span>
    <h1 class="h1 rise" style="--d: 1">How do you get<br />DeepSeek into<br />the machine?</h1>
    <Step :at="1" anim="up"><p class="lead answer">You download it. <b>A model is a file.</b></p></Step>
    <ActLabel n="2" name="the model" />
  </div>
</template>

<style scoped>
.act { justify-content: center; }
.answer { font-size: 56px; }
</style>
