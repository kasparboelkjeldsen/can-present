<script setup>
// A looping SVG illustration, drawn and animated in the scene file (CSS keyframes), coloured by
// the engine tokens: a camera frame flies between three cards on a dotted canvas, zooming out
// mid-flight, like the deck does. Keep loops small: one every few scenes.
import { useId } from 'vue'
const dots = `${useId()}-dots` // ids must be unique: thumbnails render the scene more than once
</script>

<template>
  <div class="slide slide--light loop">
    <div class="text">
      <span class="kicker">custom svg</span>
      <h2 class="h2">A little loop</h2>
      <p class="lead">Drawn in the scene, coloured by the theme.</p>
    </div>
    <svg class="art" viewBox="0 0 800 600" aria-hidden="true">
      <defs>
        <pattern :id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="3" /></pattern>
      </defs>
      <rect class="canvas" width="800" height="600" rx="40" />
      <rect class="dots" width="800" height="600" rx="40" :fill="`url(#${dots})`" />
      <g class="cards">
        <rect x="80" y="110" width="200" height="112" rx="14" />
        <rect x="500" y="170" width="200" height="112" rx="14" class="hot" />
        <rect x="270" y="380" width="200" height="112" rx="14" />
      </g>
      <rect class="cam" x="-120" y="-70" width="240" height="140" rx="20" />
    </svg>
  </div>
</template>

<style scoped>
.loop { flex-direction: row; align-items: center; gap: 60px; }
.text { display: flex; flex-direction: column; gap: 40px; flex: 1; }
.art { width: 860px; flex: none; }
.canvas { fill: var(--deck-canvas); }
pattern circle { fill: var(--deck-grid); }
.cards rect { fill: var(--deck-paper); }
.cards .hot { fill: var(--deck-accent); }
.cam { fill: none; stroke: var(--deck-accent-2); stroke-width: 8; animation: fly 6s var(--ease-out) infinite; }
/* hold on a card, zoom out while flying, land on the next (centres: 180,166 · 600,226 · 370,436) */
@keyframes fly {
  0%, 22% { transform: translate(180px, 166px) scale(1); }
  30% { transform: translate(390px, 196px) scale(1.6); }
  38%, 55% { transform: translate(600px, 226px) scale(1); }
  63% { transform: translate(485px, 331px) scale(1.6); }
  71%, 88% { transform: translate(370px, 436px) scale(1); }
  94% { transform: translate(275px, 301px) scale(1.6); }
  100% { transform: translate(180px, 166px) scale(1); }
}
</style>
