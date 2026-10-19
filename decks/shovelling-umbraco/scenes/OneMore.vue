<script setup>
// "1 more thing", written on the canvas round the thank-you card (an outer layer, deck.js). The green
// card the camera was just looking at turns out to be a sliver of the stem of the "1".
import { ONE } from './oneMore.js'

const { x, w, top, bottom, flag } = ONE
const one = `M${x} ${top} H${x + w} V${bottom} H${x} V${top + 170} L${x - flag} ${top + 235} V${top + 120} Z`
// DM Sans at line-height 1: the baseline sits 0.841em below the top of the line box
const FS = 270
const lineTop = (baseline) => baseline - 0.841 * FS + 'px'
</script>

<template>
  <div class="slide one-more no-mark">
    <svg class="glyph" viewBox="0 0 1920 1080" aria-hidden="true"><path :d="one" /></svg>
    <div class="word" :style="{ left: x + w + 80 + 'px', top: lineTop(bottom - 300), fontSize: FS + 'px' }">more</div>
    <div class="word" :style="{ left: x + w + 80 + 'px', top: lineTop(bottom), fontSize: FS + 'px' }">thing</div>
  </div>
</template>

<style scoped>
.one-more { padding: 0; }
.glyph { position: absolute; inset: 0; width: 100%; height: 100%; }
.glyph path { fill: var(--k-green); }
.word { position: absolute; font-family: var(--sans); font-weight: 700; line-height: 1; color: var(--k-grey); white-space: nowrap; }
</style>
