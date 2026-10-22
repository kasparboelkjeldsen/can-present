<script setup>
// Honest expectations: where agents shine and where they don't. steps: 2.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--dark gb">
    <span class="kicker">honest expectations</span>
    <h2 class="h2 rise">Where it shines, where it doesn't</h2>
    <div class="row">
      <Step :at="1" anim="pop" class="card">
        <h3 class="good">Good at</h3>
        <ul><li>Boilerplate and glue</li><li>Unfamiliar APIs and languages</li><li>Refactors with tests behind them</li><li>Reading a big codebase, fast</li></ul>
      </Step>
      <Step :at="2" anim="pop" class="card">
        <h3 class="bad">Bad at</h3>
        <ul><li>Vague goals</li><li>Work it can't check</li><li>Rules that live in someone's head</li><li>Knowing when it's wrong: it's confidently wrong, fast</li></ul>
      </Step>
    </div>
  </div>
</template>

<style scoped>
.row { display: flex; gap: 40px; margin-top: 10px; }
.card { flex: 1; }
ul { display: flex; flex-direction: column; gap: 16px; margin: 0; padding-left: 1.1em; }
</style>
