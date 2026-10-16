<script setup>
import Step from '../engine/Step.vue'
import DiagonalLine from '../components/DiagonalLine.vue'
</script>

<template>
  <div class="slide slide--red happened">
    <DiagonalLine />
    <div class="kicker">What actually happened</div>
    <div class="cards">
      <div class="col">
        <Step :at="1" anim="pop" class="card">
          <div class="who">Partner one</div>
          <div class="what">Invited me into their WordPress backend.</div>
        </Step>
        <Step :at="2" anim="up" class="aside">First WordPress I've seen the back side of in 10+ years.</Step>
      </div>
      <div class="col">
        <Step :at="3" anim="pop" class="card">
          <div class="who">Partner two</div>
          <div class="what">Pasted it into an HTML block. Eventually.</div>
        </Step>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards { flex: 1; display: flex; gap: 60px; margin-top: 70px; position: relative; z-index: 2; }
.col { flex: 1; display: flex; flex-direction: column; gap: 36px; }
.card { background: var(--k-sand); min-height: 400px; display: flex; flex-direction: column; gap: 30px; padding: 56px 60px; }
.who { font: 700 26px var(--sans); letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.6; }
.what { font: 400 66px/1.12 var(--serif); }
.aside { font: 700 38px/1.3 var(--sans); padding: 0 12px; }
</style>
