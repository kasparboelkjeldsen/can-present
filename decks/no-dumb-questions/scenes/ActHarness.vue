<script setup>
// Act 3 opener: the model can only write text, so who edits the files? From far away:
// "3 · THE HARNESS". steps: 1.
import Step from '@engine/Step.vue'
import ActLabel from '../components/ActLabel.vue'
</script>

<template>
  <div class="slide slide--accent act">
    <span class="kicker rise">3 · the harness</span>
    <h1 class="h1 rise" style="--d: 1">The model can<br />only write text.</h1>
    <p class="lead rise q" style="--d: 2">So how does Copilot edit my files?</p>
    <Step :at="1" anim="up"><p class="lead answer">Something around it does. <b>That's the harness.</b></p></Step>
    <ActLabel n="3" name="the harness" />
  </div>
</template>

<style scoped>
.act { justify-content: center; }
.q, .answer { font-size: 56px; }
</style>
