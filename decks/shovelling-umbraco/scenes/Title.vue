<script setup>
import DiagonalLine from '../components/DiagonalLine.vue'
import ShovelLoop from '../components/ShovelLoop.vue'

const lines = [['Shovelling', 'Umbraco'], ['Into', 'Other', "People's"], ['WordPress']]
let d = 0
const words = lines.map((l) => l.map((w) => ({ w, d: d++ })))

// The Kraftvaerk PowerPoint cut: a vertical line and the diagonal (same ~41° as the template) cross,
// and the corner right of the vertical and below the diagonal is a darker panel holding the art.
const VX = 1180 // the vertical line
const CY = 710 // where the diagonal crosses it (low enough to pass right of the byline)
const SLOPE = 1080 / 1251 // the template's diagonal: top edge at 86%, bottom edge at 21% of the width
const diag = {
  x1: VX - (1080 - CY) / SLOPE, y1: 1080, // down-left to the bottom edge
  x2: 1920, y2: CY - (1920 - VX) * SLOPE, // up-right to the right edge
}
const panel = `polygon(${VX}px ${CY}px, 1920px ${diag.y2}px, 1920px 1080px, ${VX}px 1080px)`
</script>

<template>
  <div class="slide slide--dark title">
    <div class="panel fade-in" style="--d: 9" :style="{ clipPath: panel }">
      <ShovelLoop class="art" cut="var(--panel)" />
    </div>
    <DiagonalLine :x1="VX" :y1="0" :x2="VX" :y2="1080" :delay="700" />
    <DiagonalLine v-bind="diag" :delay="900" />

    <h1 class="h1 headline">
      <span v-for="(line, i) in words" :key="i" class="line">
        <span v-for="w in line" :key="w.w" class="rise word" :style="{ '--d': w.d }">{{ w.w }}</span>
      </span>
    </h1>
    <p class="lead sub rise" style="--d: 7">a web component that phones home to ask who it is and what to wear</p>
    <div class="byline rise" style="--d: 8">Kaspar Boel Kjeldsen · kjeldsen.dev · Kraftvaerk</div>
  </div>
</template>

<style scoped>
.title { padding-top: 130px; --panel: #313133; }
.headline { font-size: 100px; line-height: 1.06; }
.line { display: block; }
.word { display: inline-block; margin-right: 0.24em; }
.sub { margin: 40px 0 0; font-size: 42px; max-width: 900px; opacity: 0.85; }
.byline { margin-top: auto; margin-bottom: 30px; font-size: 30px; font-weight: 700; color: var(--k-green); position: relative; z-index: 2; }
.panel { position: absolute; inset: 0; background: var(--panel); pointer-events: none; }
/* the loop's viewBox is 800×720: scaled into the panel's bottom-right corner */
.art { position: absolute; right: 40px; bottom: 24px; width: 640px; height: 576px; }
</style>
