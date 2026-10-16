<script setup>
import Shot from '../components/Shot.vue'
import DiagonalLine from '../components/DiagonalLine.vue'
</script>

<template>
  <div class="slide slide--grey outfits">
    <DiagonalLine :x1="1560" :y1="210" :x2="1810" :y2="0" />
    <div class="kicker">Same component, two outfits</div>
    <div class="row">
      <figure class="side left">
        <Shot src="/shots/jordemoderforeningen.png" url="jordemoderforeningen.dk" :width="780" />
        <figcaption>jordemoderforeningen.dk</figcaption>
      </figure>
      <figure class="side right">
        <Shot src="/shots/radiograf.png" url="radiograf.dk" :width="780" />
        <figcaption>radiograf.dk</figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.outfits { padding-top: 90px; padding-bottom: 80px; }
.row { flex: 1; display: flex; align-items: center; justify-content: center; gap: 70px; position: relative; z-index: 2; }
.side { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 30px; }
.left { transform: rotate(2.5deg); }
.right { transform: rotate(-2.5deg); }
.is-active .left { animation: in-left 1s var(--ease-out) 0.2s both; }
.is-active .right { animation: in-right 1s var(--ease-out) 0.35s both; }
@keyframes in-left { from { opacity: 0; transform: translateX(-500px) rotate(-6deg); } }
@keyframes in-right { from { opacity: 0; transform: translateX(500px) rotate(6deg); } }
figcaption { font: 700 38px var(--sans); }
</style>
