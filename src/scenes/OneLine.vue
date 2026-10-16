<script setup>
import Step from '../engine/Step.vue'
import DiagonalLine from '../components/DiagonalLine.vue'

const captions = [
  { html: 'Put this where you want the carousel.' },
  { html: "Their CMS doesn't matter." },
  { html: 'WordPress? Fine.' },
  { html: 'Literally anything? Fine.' },
  { html: 'Google Tag Manager? …<span class="mark">technically</span> fine.' },
]
</script>

<template>
  <div class="slide slide--sand one-line">
    <DiagonalLine />
    <div class="kicker">The entire integration</div>

    <div class="center">
      <div class="snippet">
        <code class="typed"><span class="k">&lt;script</span> <span class="a">src</span>=<span class="s">"https://ewcp.dsa.dk/api/ewcp/script/dsa.jobs"</span><span class="k">&gt;&lt;/script&gt;</span></code>
      </div>

      <div class="captions">
        <Step
          v-for="(c, i) in captions"
          :key="i"
          :at="i"
          :until="i === captions.length - 1 ? null : i + 1"
          anim="up"
          class="caption"
        ><span v-html="c.html" /></Step>
      </div>
    </div>
  </div>
</template>

<style scoped>
.center { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 70px; margin-top: -40px; }
.snippet {
  padding: 48px 52px;
  border-radius: var(--radius);
  background: var(--k-dark-deep);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
}
.typed {
  display: block;
  font: 400 37px/1.3 var(--mono);
  color: #ecebe6;
  white-space: nowrap;
  overflow: hidden;
  width: 68ch;
  border-right: 4px solid transparent;
}
.is-active .typed {
  animation: type 1.3s steps(68) 0.5s both, caret 0.7s step-end 6;
}
@keyframes type { from { width: 0; } }
@keyframes caret { 50% { border-color: var(--k-green); } }
.k { color: var(--k-green); }
.a { color: #ffd479; }
.s { color: #ffb4aa; }

.captions { position: relative; height: 80px; width: 100%; }
.caption { position: absolute; inset: 0; text-align: center; font-size: 52px; font-weight: 700; }
/* green isn't allowed on sand: a red marker instead */
.caption :deep(.mark) { background: linear-gradient(transparent 62%, var(--k-red) 62%, var(--k-red) 92%, transparent 92%); padding: 0 4px; }
</style>
