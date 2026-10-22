<script setup>
// Nested in `inside`'s "80 layers" box. One layer = attention + feed-forward; each half holds a
// nested scene (geometry.js LAYER_SLOTS): `attention` and `weights`.
import { LAYER_SLOTS, frame } from './geometry.js'
</script>

<template>
  <div class="slide slide--light layer">
    <span class="kicker">one layer</span>
    <h2 class="h2">Each layer does two things</h2>

    <div class="half rise" style="--d: 1; left: 140px">
      <h3><span class="n">1</span> Attention</h3>
      <p>Every token looks at the others and takes what it needs.</p>
    </div>
    <div class="half rise" style="--d: 2; left: 1000px">
      <h3><span class="n">2</span> Feed-forward</h3>
      <p>Every token thinks on its own, through a big grid of weights.</p>
    </div>
    <div class="slot" :style="frame(LAYER_SLOTS.attention)" />
    <div class="slot" :style="frame(LAYER_SLOTS.weights)" />

    <p class="lead out">Out come the same vectors, a little more informed. Then the next layer: <b class="accent">80 times</b>.</p>
  </div>
</template>

<style scoped>
.half {
  position: absolute;
  top: 290px;
  width: 780px;
  height: 610px;
  padding: 30px 40px;
  box-sizing: border-box;
  border-radius: var(--radius);
  background: var(--paper-2);
}
.half h3 { display: flex; align-items: center; gap: 18px; margin: 0 0 10px; font: 800 52px/1.1 var(--sans); }
.half p { margin: 0; font-size: 36px; line-height: 1.3; }
.n { display: inline-grid; place-items: center; width: 60px; height: 60px; border-radius: 50%; background: var(--night); color: var(--sun); font: 800 32px var(--sans); }
.slot { position: absolute; border-radius: 18px; background: rgba(20, 22, 58, 0.12); }
.out { position: absolute; left: 140px; bottom: 60px; }
</style>
