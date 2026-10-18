<script setup>
// Big number: <BigNumber> counts when the scene comes on stage (again on every return) and draws
// its ring in sync; the punchline is a normal build. steps: 1 in deck.js.
// Count on a click instead with :at="1"; other formats: format="grouped" (6,836), :decimals, prefix.
import BigNumber from '@engine/components/BigNumber.vue'
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--dark stat">
    <BigNumber class="num" :to="1920" ring format="plain" suffix="px" :size="190" label="wide, every scene" />
    <div class="text">
      <span class="kicker">big number</span>
      <h2 class="h2">Every scene is<br />the same card.</h2>
      <Step :at="1" anim="up"><p class="lead accent">The camera does the rest.</p></Step>
    </div>
  </div>
</template>

<style scoped>
.stat { flex-direction: row; align-items: center; gap: 70px; padding: 80px 120px 80px 100px; }
.text { display: flex; flex-direction: column; gap: 40px; }
</style>
