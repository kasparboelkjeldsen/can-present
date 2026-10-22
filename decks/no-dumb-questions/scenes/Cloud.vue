<script setup>
// Option B, on the back of `local` (the card turns over). Uses .pros-cons from Local.vue.
</script>

<template>
  <div class="slide slide--light side">
    <span class="kicker">option B</span>
    <h2 class="h2">Rent it (an API)</h2>
    <ul class="pros-cons">
      <li class="pro">Frontier models: Claude, GPT, Gemini</li>
      <li class="pro">Huge context, fast, no hardware to run</li>
      <li class="pro">Pay per token: cheap to start</li>
      <li class="con">Your code goes to someone else's servers. Read the terms (business plans usually don't train on it)</li>
      <li class="con">Cost grows with use; models change and retire</li>
    </ul>
    <p class="lead both">Either way it's the same HTTP call: <b>send messages, get text back.</b></p>
  </div>
</template>

<style scoped>
.side { justify-content: center; }
.both { margin-top: 20px; padding-top: 30px; border-top: 3px solid var(--line); }
</style>
