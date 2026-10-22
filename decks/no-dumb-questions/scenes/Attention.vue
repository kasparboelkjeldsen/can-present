<script setup>
// Nested in `layer`'s attention half. The classic: what does "it" refer to? "it" scores every
// other word (a dot product), then takes a blend. Swap one word and the blend flips. steps: 4.
import { computed } from 'vue'
import Step from '@engine/Step.vue'
import { useStep } from '@engine/useStep.js'
import Tok from '../components/Tok.vue'

const { step } = useStep()
const swapped = computed(() => step.value >= 4)
const words = computed(() => ['The', 'trophy', "didn't", 'fit', 'in', 'the', 'suitcase', 'because', 'it', 'was', 'too', swapped.value ? 'small' : 'big', '.'])
const hue = { trophy: 0, suitcase: 3, it: 1, big: 2, small: 2, fit: 4 }
const bars = computed(() => [
  { t: 'trophy', p: swapped.value ? 19 : 62, hue: 0 },
  { t: 'suitcase', p: swapped.value ? 64 : 21, hue: 3 },
  { t: swapped.value ? 'small' : 'big', p: 9, hue: 2 },
  { t: 'fit', p: 4, hue: 4 },
  { t: 'the rest', p: 4, hue: 5, rest: true },
])
</script>

<template>
  <div class="slide slide--dark attention">
    <span class="kicker">attention</span>
    <h2 class="h2">Which words matter to “it”?</h2>

    <div class="sentence">
      <Tok v-for="(w, i) in words" :key="i" :hue="hue[w] ?? 5" :hot="w === 'it' && step >= 1" :dim="step >= 1 && !(w in hue)">{{ w }}</Tok>
    </div>

    <div class="bars" :class="{ 'is-on': step >= 1 }">
      <div v-for="b in bars" :key="b.t + b.hue" class="row">
        <span class="name" :class="{ rest: b.rest }">{{ b.t }}</span>
        <span class="bar"><i :style="{ width: b.p * 11 + 'px', background: `var(--tok-${b.hue})` }" /></span>
        <span class="pct">{{ b.p }}%</span>
      </div>
    </div>

    <div class="captions">
      <Step :at="2" :until="3" anim="up"><p class="lead">Each score is a <span class="accent">dot product</span>: what “it” is looking for (a <b>query</b>) · what each word offers (a <b>key</b>).</p></Step>
      <Step :at="3" :until="4" anim="up"><p class="lead">Then “it” takes a blend: 62% trophy + 21% suitcase + … Its vector now <span class="accent">means “the trophy”</span>.</p></Step>
      <Step :at="4" anim="up"><p class="lead">Swap one word and “it” points at the <span class="accent">suitcase</span>. That's why it reads all the words together.</p></Step>
    </div>
    <p class="fineprint">Real models run dozens of these side by side (“heads”). Numbers illustrative.</p>
  </div>
</template>

<style scoped>
.attention { gap: 30px; }
.sentence { display: flex; flex-wrap: wrap; gap: 14px 12px; font-size: 46px; }
.bars { display: flex; flex-direction: column; gap: 10px; }
.row { display: grid; grid-template-columns: 220px 760px 110px; align-items: center; gap: 22px; }
.name { font: 700 36px var(--mono); text-align: right; }
.name.rest { font-family: var(--sans); font-weight: 400; color: var(--muted); }
.bar { height: 34px; }
.bar i { display: block; height: 100%; border-radius: 10px; transition: width 0.8s var(--ease-out); }
.bars:not(.is-on) .bar i { width: 0 !important; }
.pct { font: 700 36px var(--mono); opacity: 0; transition: opacity 0.4s 0.4s; }
.bars.is-on .pct { opacity: 1; }
.captions { position: relative; min-height: 130px; }
.captions > * { position: absolute; left: 0; top: 0; }
</style>
