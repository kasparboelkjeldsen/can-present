<script setup>
// The harness's real job: deciding what goes into the context window. A bar fills, one segment
// per click; the proportions are illustrative. steps: 6.
import Step from '@engine/Step.vue'
import { useStep } from '@engine/useStep.js'

const { step } = useStep()
// share of a 200,000-token window (%), in the order they go in
const parts = [
  { t: 'system prompt', sub: 'how to behave', p: 8, hue: 4 },
  { t: 'your rules', sub: 'AGENTS.md', p: 3, hue: 0 },
  { t: 'tool menu', sub: 'what it can call', p: 6, hue: 3 },
  { t: 'files and output', sub: 'what it read and ran', p: 42, hue: 2 },
  { t: 'the conversation', sub: 'so far', p: 14, hue: 1 },
]
</script>

<template>
  <div class="slide slide--light ctx">
    <span class="kicker">the real job</span>
    <h2 class="h2 rise">A harness decides<br />what the model sees</h2>
    <p class="lead rise muted" style="--d: 1">Everything goes into one window. Say, 200,000 tokens:</p>

    <div class="window">
      <div class="bar">
        <i
          v-for="(p, i) in parts" :key="p.t"
          :class="{ 'is-on': step >= i + 1 }"
          :style="{ '--w': p.p, background: `var(--tok-${p.hue})` }"
        />
      </div>
      <div class="legend">
        <span v-for="(p, i) in parts" :key="p.t" :class="{ 'is-on': step >= i + 1 }">
          <i :style="{ background: `var(--tok-${p.hue})` }" /><b>{{ p.t }}</b> {{ p.sub }}
        </span>
      </div>
    </div>

    <Step :at="6" anim="up"><p class="lead">Too little and it guesses. Too much and it loses the thread. <span class="accent">A good harness is mostly about this.</span></p></Step>
    <p class="fineprint">Rough proportions; every session differs.</p>
  </div>
</template>

<style scoped>
.ctx { gap: 30px; }
.window { display: flex; flex-direction: column; gap: 26px; margin-top: 6px; }
.bar { display: flex; height: 96px; padding: 8px; border-radius: 24px; background: var(--paper-2); box-shadow: inset 0 0 0 3px var(--line); }
.bar i { display: block; height: 100%; width: 0; border-radius: 16px; margin-right: 0; transition: width 0.7s var(--ease-out), margin 0.7s; }
.bar i.is-on { width: calc(var(--w) * 1%); margin-right: 6px; }
.legend { display: flex; flex-wrap: wrap; gap: 14px 40px; font-size: 34px; }
.legend span { display: inline-flex; align-items: center; gap: 12px; opacity: 0; transition: opacity 0.4s; }
.legend span.is-on { opacity: 1; }
.legend i { width: 30px; height: 30px; border-radius: 8px; }
.legend b { font-weight: 800; }
</style>
