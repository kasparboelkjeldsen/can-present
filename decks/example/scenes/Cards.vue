<script setup>
// Cards popping in on clicks: the theme's .card in a flex row, one <Step anim="pop"> each.
// steps: 3 in deck.js (one per card).
import Step from '@engine/Step.vue'

const cards = [
  { n: '01', title: 'Fly', text: 'Every scene is a card on one canvas. → flies the camera to the next.' },
  { n: '02', title: 'Build', text: 'Inside a scene, things appear one click at a time.' },
  { n: '03', title: 'Dive', text: 'A scene can sit inside another one. The camera zooms in.' },
]
</script>

<template>
  <div class="slide slide--light cards-scene">
    <span class="kicker">the idea</span>
    <h2 class="h2">Three moves</h2>
    <div class="row">
      <!-- literal :at values, so `npm run check` can count the builds -->
      <Step :at="1" anim="pop" class="card"><b class="n">{{ cards[0].n }}</b><b class="t">{{ cards[0].title }}</b>{{ cards[0].text }}</Step>
      <Step :at="2" anim="pop" class="card"><b class="n">{{ cards[1].n }}</b><b class="t">{{ cards[1].title }}</b>{{ cards[1].text }}</Step>
      <Step :at="3" anim="pop" class="card"><b class="n">{{ cards[2].n }}</b><b class="t">{{ cards[2].title }}</b>{{ cards[2].text }}</Step>
    </div>
  </div>
</template>

<style scoped>
.row { flex: 1; display: flex; gap: 48px; align-items: stretch; margin-top: 20px; }
.card { flex: 1; }
.n { font: 800 30px var(--mono); color: #c8463b; }
.t { font-size: 64px; line-height: 1; }
</style>
