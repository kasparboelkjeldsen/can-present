<script setup>
// Title. Token chips drift on the right (the deck's recurring picture of text as tokens).
// From far away (overview) the card reads "1 · THE LLM": the act 1 row starts here.
import Tok from '../components/Tok.vue'
import ActLabel from '../components/ActLabel.vue'

const chips = [
  { t: 'No', x: 1260, y: 170 },
  { t: ' dumb', x: 1480, y: 310 },
  { t: ' quest', x: 1310, y: 460 },
  { t: 'ions', x: 1560, y: 600 },
  { t: '?', x: 1400, y: 750 },
]
</script>

<template>
  <div class="slide slide--dark title">
    <div class="copy">
      <span class="kicker rise">an explainer</span>
      <h1 class="h1 rise" style="--d: 1">No dumb<br /><span class="accent">questions</span></h1>
      <p class="lead rise" style="--d: 2">What an LLM actually is, how one gets into a machine, and what people mean by “agentic coding”.</p>
    </div>
    <div class="chips" aria-hidden="true">
      <Tok v-for="(c, i) in chips" :key="i" :hue="i" class="chip" :style="{ left: c.x + 'px', top: c.y + 'px', '--i': i }">{{ c.t }}</Tok>
    </div>
    <p class="fineprint">→ to move on · O for the whole map</p>
    <ActLabel n="1" name="the LLM" />
  </div>
</template>

<style scoped>
.title { justify-content: center; }
.copy { display: flex; flex-direction: column; gap: 40px; max-width: 1050px; }
.lead { max-width: 980px; }
.chips { position: absolute; inset: 0; pointer-events: none; }
.chip { position: absolute; font-size: 64px; }
.is-active .chip {
  animation: fade-in 0.8s ease both, bob 6s ease-in-out infinite;
  animation-delay: calc(var(--i) * 140ms + 500ms), calc(var(--i) * -1.3s);
}
@keyframes bob { 50% { transform: translateY(-22px) rotate(-2deg); } }
</style>
