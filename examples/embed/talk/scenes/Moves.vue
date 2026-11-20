<script setup>
// steps: 3 in deck.js (one per card). The third card has a nested scene in it (inside).
import { Step } from 'can-present'
</script>

<template>
  <div class="slide slide--light">
    <span class="kicker">the idea</span>
    <h2 class="h2">Three moves</h2>
    <div class="row">
      <Step :at="1" anim="pop" class="card"><b>Fly</b>Every scene is a card on one canvas.</Step>
      <Step :at="2" anim="pop" class="card"><b>Build</b>Things appear one click at a time.</Step>
      <Step :at="3" anim="pop" class="card"><b>Dive</b></Step>
    </div>
    <!-- where the nested scene sits: nest(moves, { cx: 1480, cy: 690, w: 380 }) in deck.js -->
    <Step :at="3" anim="fade" class="slot" />
  </div>
</template>

<style scoped>
.row { flex: 1; display: flex; gap: 48px; align-items: stretch; margin-top: 20px; }
.card { flex: 1; display: flex; flex-direction: column; gap: 16px; }
b { font-size: 64px; line-height: 1; }
.slot { position: absolute; left: 1290px; top: 583px; width: 380px; height: 214px; border-radius: 30px; background: rgba(23, 25, 31, 0.1); }
</style>
