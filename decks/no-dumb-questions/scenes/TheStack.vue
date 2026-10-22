<script setup>
// The finale: the four words again, while every other card orbits this one (deck.js formation).
// Its text is read at about a third of normal size in the formation, so it's big.
const words = [
  { w: 'LLM', d: 'guesses the next token' },
  { w: 'Model', d: 'the file that holds it' },
  { w: 'Harness', d: 'gives it hands' },
  { w: 'Agent', d: 'a harness in a loop, with a goal' },
]
</script>

<template>
  <div class="slide slide--accent stack">
    <span class="kicker rise">no dumb questions</span>
    <dl>
      <div v-for="(x, i) in words" :key="x.w" class="rise" :style="{ '--d': 1 + i }">
        <dt>{{ x.w }}</dt>
        <dd>{{ x.d }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.stack { justify-content: center; gap: 30px; padding: 80px 120px; }
dl { display: flex; flex-direction: column; gap: 18px; margin: 0; }
dl div { display: grid; grid-template-columns: 600px 1fr; align-items: baseline; }
dt { font: 800 130px/1 var(--sans); letter-spacing: -0.03em; }
dd { margin: 0; font: 700 64px/1.1 var(--sans); }
</style>
