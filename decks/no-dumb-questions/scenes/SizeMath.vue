<script setup>
// The one formula of act 2: weights × bytes per weight = size. Quantization as JPEG. steps: 4.
import Step from '@engine/Step.vue'

const PX_PER_GB = 7.5
const rows = [
  { bits: '16-bit', bytes: '2 bytes', gb: 140, label: '140 GB' },
  { bits: '8-bit', bytes: '1 byte', gb: 70, label: '70 GB' },
  { bits: '4-bit', bytes: '½ byte', gb: 40, label: '≈ 40 GB' },
]
</script>

<template>
  <div class="slide slide--light size">
    <span class="kicker">a little math</span>
    <h2 class="h2 rise">How big is a model?</h2>
    <p class="formula rise" style="--d: 1">weights × bytes per weight = <span class="accent">size</span></p>
    <p class="lead muted rise" style="--d: 2">For a 70-billion-weight model:</p>

    <div class="rows">
      <!-- literal :at values, so `npm run check` can count the builds -->
      <Step :at="1" anim="left" class="row"><span class="bits">{{ rows[0].bits }}</span><span class="bytes">{{ rows[0].bytes }}</span><i :style="{ width: rows[0].gb * PX_PER_GB + 'px' }" /><b>{{ rows[0].label }}</b></Step>
      <Step :at="2" anim="left" class="row"><span class="bits">{{ rows[1].bits }}</span><span class="bytes">{{ rows[1].bytes }}</span><i :style="{ width: rows[1].gb * PX_PER_GB + 'px' }" /><b>{{ rows[1].label }}</b></Step>
      <Step :at="3" anim="left" class="row"><span class="bits">{{ rows[2].bits }}</span><span class="bytes">{{ rows[2].bytes }}</span><i :style="{ width: rows[2].gb * PX_PER_GB + 'px' }" /><b>{{ rows[2].label }}</b></Step>
    </div>

    <Step :at="4" anim="up"><p class="lead">Storing each weight in fewer bits is called <span class="accent">quantization</span>. Like saving a photo as a JPEG: much smaller, a little blurrier.</p></Step>
  </div>
</template>

<style scoped>
.size { gap: 30px; }
.formula { margin: 0; font: 800 64px var(--mono); letter-spacing: -0.02em; }
.rows { display: flex; flex-direction: column; gap: 20px; }
.row { display: flex; align-items: center; gap: 28px; }
.bits { width: 170px; font: 800 44px var(--sans); }
.bytes { width: 170px; font-size: 36px; color: var(--muted); }
.row i { display: block; height: 64px; border-radius: 16px; background: var(--night); }
.row:nth-child(2) i { background: #3d4290; }
.row:nth-child(3) i { background: var(--sun); }
.row b { font: 800 44px var(--mono); }
</style>
