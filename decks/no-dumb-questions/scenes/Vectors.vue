<script setup>
// Nested in `inside`'s Vectors box (the flight in rides the tokens → vectors wire).
// A token becomes a list of numbers = a point in space; similar meanings sit close together.
// The dashed "how close?" frame holds the next scene, `dot-product` (geometry.js).
// steps: 2.
import { useId } from 'vue'
import Step from '@engine/Step.vue'
import { useStep } from '@engine/useStep.js'
import { VECTORS_SLOT, frame } from './geometry.js'

const { step } = useStep()
const arrow = `${useId()}-arrow`
// a toy 2D "meaning map" (720×420): two clusters and a loner
const points = [
  { t: 'Count', x: 150, y: 120, g: 0 },
  { t: 'Length', x: 255, y: 175, g: 0 },
  { t: 'Size', x: 130, y: 230, g: 0 },
  { t: 'cat', x: 500, y: 290, g: 1 },
  { t: 'kitten', x: 590, y: 340, g: 1 },
  { t: 'dog', x: 610, y: 245, g: 1 },
  { t: 'Tuesday', x: 560, y: 80, g: 2 },
]
</script>

<template>
  <div class="slide slide--light vectors">
    <div class="copy">
      <span class="kicker">vectors</span>
      <h2 class="h2">Each token becomes a list of numbers</h2>
      <p class="vec"><b>Count</b> → [0.12, −0.83, 0.40, 0.07, …]</p>
      <p class="lead muted">8,192 numbers per token, in Llama 3 70B.</p>
      <Step :at="1" anim="up"><p class="lead">Think of the numbers as <b>coordinates</b>. Here in just 2 dimensions.</p></Step>
      <Step :at="2" anim="up"><p class="lead">Similar meanings end up <span class="accent">close together</span>. Nobody programs that: it falls out of training.</p></Step>
    </div>

    <svg class="map" :class="{ 'is-on': step >= 1, 'is-grouped': step >= 2 }" viewBox="0 0 720 420" aria-hidden="true">
      <defs>
        <marker :id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" /></marker>
      </defs>
      <rect class="bg" width="720" height="420" rx="28" />
      <line class="axis" x1="40" y1="380" x2="690" y2="380" :marker-end="`url(#${arrow})`" />
      <line class="axis" x1="40" y1="380" x2="40" y2="30" :marker-end="`url(#${arrow})`" />
      <ellipse class="group g0" cx="185" cy="175" rx="140" ry="105" />
      <ellipse class="group g1" cx="565" cy="295" rx="125" ry="90" />
      <g v-for="(p, i) in points" :key="p.t" class="pt" :class="`g${p.g}`" :style="{ transitionDelay: 0.1 * i + 's' }">
        <circle :cx="p.x" :cy="p.y" r="9" />
        <text :x="p.x + 16" :y="p.y + 10">{{ p.t }}</text>
      </g>
    </svg>

    <p class="slot-label">how close?</p>
    <div class="slot" :style="frame(VECTORS_SLOT)" />
  </div>
</template>

<style scoped>
.vectors { padding: 90px 100px; }
.copy { display: flex; flex-direction: column; gap: 28px; width: 900px; }
.h2 { font-size: 88px; }
.vec { margin: 0; font: 400 40px var(--mono); }
.vec b { padding: 4px 14px; border-radius: 12px; background: var(--tok-2); }

.map { position: absolute; left: 1100px; top: 90px; width: 720px; height: 420px; overflow: visible; }
.bg { fill: var(--paper-2); }
.axis { stroke: var(--muted); stroke-width: 3; opacity: 0.6; }
marker path { fill: var(--muted); }
.pt { opacity: 0; transition: opacity 0.4s; }
.map.is-on .pt { opacity: 1; }
.pt circle { fill: var(--night); }
.pt.g0 circle { fill: #0a7d5e; }
.pt.g1 circle { fill: #c4194b; }
.pt.g2 circle { fill: #2c56c9; }
.pt text { font: 700 30px var(--sans); fill: var(--night); }
.group { fill: none; stroke-width: 4; stroke-dasharray: 12 10; opacity: 0; transition: opacity 0.5s; }
.group.g0 { stroke: #0a7d5e; }
.group.g1 { stroke: #c4194b; }
.map.is-grouped .group { opacity: 1; }

.slot-label { position: absolute; left: 1140px; top: 532px; margin: 0; font: 800 30px var(--sans); letter-spacing: 0.1em; text-transform: uppercase; color: var(--pink); }
.slot { position: absolute; border-radius: 18px; border: 4px dashed var(--pink); box-sizing: border-box; }
</style>
