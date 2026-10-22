<script setup>
// The coworker's question, answered with the size formula: what fits in the box's GPU memory?
// Bars against a line at VRAM (box.js). steps: 5. Sizes are approximate download sizes (Oct 2026):
// DeepSeek V4 Flash ≈ 160 GB (official mixed FP4/FP8 weights), V4.1 Flash ≈ 510 GB (official) and
// ≈ 250 GB as Unsloth's 1-bit GGUF; V4 Pro is estimated with the formula (1.6T × ½ byte).
import Step from '@engine/Step.vue'
import { VRAM } from './box.js'

const PX = 1 // px per GB
const rows = [
  { name: 'gpt-oss-120b', note: 'native 4-bit', gb: 65 },
  { name: 'Llama 3.3 70B', note: '8-bit', gb: 75 },
  { name: 'DeepSeek V4 Flash', note: '284B weights, as released', gb: 160 },
  { name: 'DeepSeek V4.1 Flash', note: '552B weights, as released', gb: 510 },
  { name: 'DeepSeek V4 Pro', note: '1.6 trillion weights, at 4 bits', gb: 800 },
  { name: 'DeepSeek V4.1 Flash', note: 'squeezed to ~1 bit', gb: 250 },
]
const fits = (r) => r.gb < VRAM * 0.9
</script>

<template>
  <div class="slide slide--light fits">
    <span class="kicker">what fits in {{ VRAM }} GB</span>
    <h2 class="h2 rise">So, can we run DeepSeek?</h2>

    <div class="chart">
      <div class="limit" :style="{ left: 560 + VRAM * PX + 'px' }"><span>{{ VRAM }} GB</span></div>
      <!-- literal :at values, so `npm run check` can count the builds -->
      <Step :at="1" anim="left" class="row" :class="{ no: !fits(rows[0]) }"><span class="name">{{ rows[0].name }} <small>{{ rows[0].note }}</small></span><i :style="{ width: rows[0].gb * PX + 'px' }" /><b>≈ {{ rows[0].gb }} GB</b></Step>
      <Step :at="1" anim="left" :delay="120" class="row" :class="{ no: !fits(rows[1]) }"><span class="name">{{ rows[1].name }} <small>{{ rows[1].note }}</small></span><i :style="{ width: rows[1].gb * PX + 'px' }" /><b>≈ {{ rows[1].gb }} GB</b></Step>
      <Step :at="2" anim="left" class="row ours" :class="{ no: !fits(rows[2]) }"><span class="name">{{ rows[2].name }} <small>{{ rows[2].note }}</small></span><i :style="{ width: rows[2].gb * PX + 'px' }" /><b>≈ {{ rows[2].gb }} GB</b><em>what the box runs</em></Step>
      <Step :at="3" anim="left" class="row" :class="{ no: !fits(rows[3]) }"><span class="name">{{ rows[3].name }} <small>{{ rows[3].note }}</small></span><i :style="{ width: rows[3].gb * PX + 'px' }" /><b>≈ {{ rows[3].gb }} GB</b></Step>
      <Step :at="3" anim="left" :delay="120" class="row" :class="{ no: !fits(rows[4]) }"><span class="name">{{ rows[4].name }} <small>{{ rows[4].note }}</small></span><i :style="{ width: rows[4].gb * PX + 'px' }" /><b>≈ {{ rows[4].gb }} GB</b></Step>
      <Step :at="4" anim="left" class="row blurry"><span class="name">{{ rows[5].name }} <small>{{ rows[5].note }}</small></span><i :style="{ width: rows[5].gb * PX + 'px' }" /><b>≈ {{ rows[5].gb }} GB, blurrier</b></Step>
    </div>

    <Step :at="5" anim="up"><p class="lead">Careful with names: “Flash” went from 284B to 552B weights between V4 and V4.1, and DeepSeek's API quietly moved the old name to the new model. <b>Same name, different model.</b></p></Step>
    <p class="fineprint">Approximate. Leave room: the conversation itself needs GPU memory too.</p>
  </div>
</template>

<style scoped>
.fits { gap: 24px; }
.chart { position: relative; display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
.row { display: flex; align-items: center; gap: 20px; height: 62px; }
.name { width: 540px; flex: none; font: 800 34px var(--sans); text-align: right; }
.name small { display: block; font: 400 26px var(--sans); color: var(--muted); }
.row i { display: block; height: 46px; border-radius: 12px; background: #0a7d5e; }
.row.no i { background: var(--pink); }
.row.blurry i { background: repeating-linear-gradient(-45deg, #0a7d5e 0 14px, #2fa682 14px 28px); }
.row b { position: relative; padding: 0 10px; border-radius: 10px; background: var(--paper); font: 800 34px var(--mono); white-space: nowrap; }
.row.no b { color: #c4194b; }
.row em { padding: 6px 18px; border-radius: 999px; background: var(--night); color: var(--sun); font: 800 26px var(--sans); font-style: normal; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; }
.limit { position: absolute; top: -20px; bottom: -14px; width: 0; border-left: 5px dashed var(--night); }
.limit span { position: absolute; top: -46px; left: -70px; width: 140px; text-align: center; font: 800 30px var(--mono); }
</style>
