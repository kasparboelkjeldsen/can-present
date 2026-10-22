<script setup>
// Nested in `vectors`' "how close?" frame. The one piece of maths the whole LLM act needs:
// multiply the pairs, add them up. It comes back in `attention`. steps: 3.
import Step from '@engine/Step.vue'
import Tok from '../components/Tok.vue'
</script>

<template>
  <div class="slide slide--dark dot">
    <span class="kicker">a little math</span>
    <h2 class="h2">How close? Multiply, then add.</h2>

    <div class="defs">
      <span><Tok :hue="2">Count</Tok> = [3, 1]</span>
      <span><Tok :hue="3">Length</Tok> = [3, 2]</span>
      <span><Tok :hue="4">Tuesday</Tok> = [−1, 3]</span>
    </div>

    <Step :at="1" anim="left" class="sum">
      <span class="eq">Count · Length = 3×3 + 1×2 = <b>11</b></span><span class="verdict good">close</span>
    </Step>
    <Step :at="2" anim="left" class="sum">
      <span class="eq">Count · Tuesday = 3×(−1) + 1×3 = <b>0</b></span><span class="verdict bad">unrelated</span>
    </Step>
    <Step :at="3" anim="up">
      <p class="lead">That's a <span class="accent">dot product</span>. Real vectors have 8,192 numbers, not 2: the same sum, just longer. It's the most important sum in AI, and it's back in a minute.</p>
    </Step>
  </div>
</template>

<style scoped>
.dot { gap: 34px; }
.defs { display: flex; gap: 60px; font: 700 44px var(--mono); }
.defs span { display: inline-flex; align-items: center; gap: 14px; }
.sum { display: flex; align-items: center; gap: 36px; }
.eq { font: 400 52px var(--mono); }
.eq b { color: var(--sun); font-weight: 800; }
.verdict { padding: 8px 26px; border-radius: 999px; font: 800 36px var(--sans); text-transform: uppercase; letter-spacing: 0.06em; background: currentColor; }
.verdict.good { color: var(--mint); }
.verdict.bad { color: var(--pink); }
.verdict { -webkit-text-fill-color: var(--night); }
</style>
