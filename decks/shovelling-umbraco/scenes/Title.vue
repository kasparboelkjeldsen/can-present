<script setup>
import DiagonalLine from '../components/DiagonalLine.vue'
import ShovelLoop from '../components/ShovelLoop.vue'

const lines = [['Shovelling', 'Umbraco'], ['Into', 'Other', "People's"], ['WordPress']]
let d = 0
const words = lines.map((l) => l.map((w) => ({ w, d: d++ })))
</script>

<template>
  <div class="slide slide--dark title">
    <DiagonalLine :x1="1330" :y1="500" :x2="1926" :y2="0" :delay="900" />

    <h1 class="h1 headline">
      <span v-for="(line, i) in words" :key="i" class="line">
        <span v-for="w in line" :key="w.w" class="rise word" :style="{ '--d': w.d }">{{ w.w }}</span>
      </span>
    </h1>
    <p class="lead sub rise" style="--d: 7">a web component that phones home to ask who it is and what to wear</p>
    <div class="byline rise" style="--d: 8">Kaspar Boel Kjeldsen · kjeldsen.dev · Kraftvaerk</div>

    <ShovelLoop class="art" />
  </div>
</template>

<style scoped>
.title { padding-top: 130px; }
.headline { font-size: 128px; line-height: 1.04; }
.line { display: block; }
.word { display: inline-block; margin-right: 0.24em; }
.sub { margin: 44px 0 0; font-size: 44px; max-width: 1050px; opacity: 0.85; }
.byline { margin-top: auto; margin-bottom: 30px; font-size: 30px; font-weight: 700; color: var(--k-green); position: relative; z-index: 2; }
.art { position: absolute; right: 30px; bottom: 30px; width: 700px; height: 630px; }
</style>
