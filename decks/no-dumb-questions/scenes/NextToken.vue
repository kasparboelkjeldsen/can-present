<script setup>
// The headline claim, made concrete with code: the model scores every possible next token.
// steps: 3 (the bars, the pick, the bubble).
import Step from '@engine/Step.vue'
import { useStep } from '@engine/useStep.js'
import Tok from '../components/Tok.vue'
import Why from '../components/Why.vue'

const { step } = useStep()
const odds = [
  { t: 'Count', p: 71, hue: 2 },
  { t: 'Length', p: 18, hue: 3 },
  { t: 'Count()', p: 6, hue: 4 },
  { t: 'Length()', p: 2, hue: 5 },
  { t: 'everything else', p: 3, hue: 1, rest: true },
]
</script>

<template>
  <div class="slide slide--dark next">
    <span class="kicker">1 · the LLM</span>
    <h2 class="h2 rise">It predicts the next token</h2>
    <p class="lead rise muted" style="--d: 1">Give it text. It scores every possible next piece.</p>

    <div class="prompt">
      <span class="code">for (var i = 0; i &lt; items.</span><Tok :hue="2" class="picked" :class="{ 'is-in': step >= 2 }">Count</Tok><span class="caret" />
    </div>

    <div class="odds" :class="{ 'is-on': step >= 1 }">
      <div v-for="(o, i) in odds" :key="o.t" class="odd" :class="{ 'is-pick': step >= 2 && i === 0, 'is-lose': step >= 2 && i > 0 }">
        <span class="name" :class="{ rest: o.rest }">{{ o.t }}</span>
        <span class="bar"><i :style="{ width: o.p * 9 + 'px', background: `var(--tok-${o.hue})`, transitionDelay: i * 90 + 'ms' }" /></span>
        <span class="pct">{{ o.p }}%</span>
      </div>
    </div>

    <div class="foot">
      <Step :at="2" :until="3" anim="up"><p class="lead">Append it. Ask again. <span class="accent">One token at a time:</span> that's the whole trick.</p></Step>
      <Step :at="3" anim="pop"><Why /></Step>
    </div>
    <p class="fineprint">Numbers made up. The shape of it is real.</p>
  </div>
</template>

<style scoped>
.next { gap: 30px; }
.prompt { display: flex; align-items: center; margin-top: 16px; }
.code { font: 700 60px var(--mono); white-space: pre; }
.picked { font-size: 56px; margin-left: 4px; opacity: 0; transform: translateY(240px) scale(0.8); }
.picked.is-in { opacity: 1; transform: none; transition: opacity 0.3s, transform 0.7s var(--ease-spring); }
.caret { width: 6px; height: 70px; margin-left: 10px; background: var(--sun); animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }

.odds { display: flex; flex-direction: column; gap: 12px; }
.odd { display: grid; grid-template-columns: 340px 680px 120px; align-items: center; gap: 24px; transition: opacity 0.4s; }
.odd.is-lose { opacity: 0.3; }
.name { font: 700 38px var(--mono); text-align: right; }
.name.rest { font-family: var(--sans); font-weight: 400; color: var(--muted); }
.bar { height: 38px; }
.bar i { display: block; height: 100%; border-radius: 12px; }
.odds:not(.is-on) .bar i { width: 0 !important; }
.odds.is-on .bar i { transition: width 0.8s var(--ease-out); }
.pct { font: 700 38px var(--mono); opacity: 0; transition: opacity 0.4s 0.5s; }
.odds.is-on .pct { opacity: 1; }
.is-pick .name { color: var(--mint); }

.foot { position: relative; min-height: 110px; }
.foot > * { position: absolute; left: 0; top: 0; }
</style>
