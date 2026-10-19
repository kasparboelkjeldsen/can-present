<script setup>
// Outer layer 1 (deck.js: outer: { hole: BIGGER.hole }). After the thanks card the camera pulls
// back, and the whole talk turns out to be the dot on the "i" of this line, written straight on the
// canvas (slide--canvas: no background). The engine scales and places this card so that its hole
// lands on the talk, so the hole has to be exactly where the dot is: the "i" is drawn here (a stem
// that sits on the text's baseline, and a dot at the coordinates in outer.js), not left to the font.
//
// The talk is opaque cards, 36 px wide at zoom 1: on its own it's a smudge. So once it's too small
// to read, a real dot fades in under it (<Detail :until>, which scrubs with the camera).
import Detail from '@engine/components/Detail.vue'
import { BIGGER as B, lineAt, disc } from './outer.js'
</script>

<template>
  <div class="slide slide--canvas outer">
    <p class="line line--centre" :style="lineAt(B.line1, B.size)">All of that fits</p>
    <!-- the line ends with the stem, right-aligned so the stem is centred under the hole -->
    <p class="line" :style="{ ...lineAt(B.line2, B.size), right: `${1920 - B.hole.cx - B.stem / 2}px` }">
      in the dot of an<span class="stem" :style="{ width: `${B.stem}px`, height: `${B.xHeight}px`, marginLeft: `${B.gap}px` }" />
    </p>
    <!-- the dot is the talk; this disc only shows once the talk is a speck -->
    <Detail class="dot" :until="4" :style="disc(B.hole.cx, B.hole.cy, B.dot)" />
  </div>
</template>

<style scoped>
.outer { padding: 0; }
.line { position: absolute; margin: 0; font-weight: 800; line-height: 1; letter-spacing: -0.02em; white-space: nowrap; color: var(--paper); }
.line--centre { left: 0; right: 0; text-align: center; }
.stem { display: inline-block; vertical-align: baseline; border-radius: 3px; background: var(--paper); }
.dot { position: absolute; border-radius: 50%; background: var(--deck-accent); }
</style>
