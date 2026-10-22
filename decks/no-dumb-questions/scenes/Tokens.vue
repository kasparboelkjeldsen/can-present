<script setup>
// Step 0 of the machine: text becomes tokens, tokens become numbers. steps: 2.
// The ids are illustrative (each tokenizer has its own).
import Step from '@engine/Step.vue'
import { useStep } from '@engine/useStep.js'
import Tok from '../components/Tok.vue'

const { step } = useStep()
const rows = [
  [{ t: 'items', id: 3699 }, { t: '.', id: 13 }, { t: 'Count', id: 2568 }],
  [{ t: 'Un', id: 1844 }, { t: 'believ', id: 32935 }, { t: 'ably', id: 2915 }],
]
</script>

<template>
  <div class="slide slide--light tokens">
    <span class="kicker">first: text → numbers</span>
    <h2 class="h2 rise">A token is a piece of text</h2>

    <div class="rows">
      <div v-for="(row, r) in rows" :key="r" class="row">
        <Tok v-for="(c, i) in row" :key="i" :hue="r * 3 + i" :id="c.id" :show-id="step >= 1" class="chip rise" :style="{ '--d': 2 + r * 3 + i }">{{ c.t }}</Tok>
      </div>
    </div>

    <Step :at="2" anim="up" class="explain">
      <p class="lead">The model never sees letters. <b>Only these numbers.</b> Its whole vocabulary is about <b class="accent">128,000</b> pieces (Llama 3).</p>
      <p class="lead muted">Rule of thumb: a token is about ¾ of an English word.</p>
    </Step>
    <p class="fineprint">The ids are for illustration: every model has its own.</p>
  </div>
</template>

<style scoped>
.rows { display: flex; gap: 120px; margin: 30px 0 10px; }
.row { display: flex; gap: 14px; }
.chip { font-size: 76px; }
.explain { display: flex; flex-direction: column; gap: 18px; }
</style>
