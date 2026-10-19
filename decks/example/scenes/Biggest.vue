<script setup>
// Outer layer 2 (deck.js: outer: { hole: BIGGEST.hole }). One more pull back: the whole "dot of an
// i" card, talk and all, is the full stop of this sentence. Like Bigger.vue, it's text on the canvas
// (slide--canvas), and the full stop is drawn here at the hole's coordinates (outer.js). Once the
// card in it is a speck, a real full stop fades in under it.
import Detail from '@engine/components/Detail.vue'
import { BIGGEST as G, lineAt, disc } from './outer.js'
</script>

<template>
  <div class="slide slide--canvas outer">
    <p class="line line--centre" :style="lineAt(G.line1, G.size)">It’s canvases</p>
    <p class="line" :style="{ ...lineAt(G.line2, G.size), right: `${1920 - G.textEnd}px` }">all the way <span class="accent">down</span></p>
    <Detail class="dot" :until="4" :style="disc(G.hole.cx, G.hole.cy, G.dot)" />
  </div>
</template>

<style scoped>
.outer { padding: 0; }
.line { position: absolute; margin: 0; font-weight: 800; line-height: 1; letter-spacing: -0.02em; white-space: nowrap; color: var(--paper); }
.line--centre { left: 0; right: 0; text-align: center; }
.dot { position: absolute; border-radius: 50%; background: var(--deck-accent); }
</style>
