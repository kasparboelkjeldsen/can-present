<script setup>
// The commands that make a deck easy to work on: a terminal-ish list, one row per click
// (<Step :at="n">, literal so `npm run check` can count them). steps: 5 in deck.js.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--dark workbench">
    <span class="kicker rise">the workbench</span>
    <h2 class="h2 rise" style="--d: 1">From idea to <span class="accent">deck</span></h2>
    <div class="rows">
      <Step :at="1" class="cmd">
        <code>npm run new-deck -- my-talk --from scene-description.md</code>
        <span>Stub scenes that already render and navigate.</span>
      </Step>
      <Step :at="2" class="cmd">
        <code>npm run import-pptx -- talk.pptx --deck my-talk</code>
        <span>Or start from a PowerPoint: every slide drawn, then scaffolded.</span>
      </Step>
      <Step :at="3" class="cmd">
        <code>npm run check -- my-talk</code>
        <span>Lint: ids, steps vs builds, notes, overlaps, missing shots.</span>
      </Step>
      <Step :at="4" class="cmd">
        <code class="url">localhost:5173/?sheet</code>
        <span>Every scene in one grid, audited for text that's too small.</span>
      </Step>
      <Step :at="5" class="cmd">
        <code>npm run compile -- my-talk</code>
        <span>The whole deck in one HTML file. Mail it, open it offline.</span>
      </Step>
    </div>
  </div>
</template>

<style scoped>
.workbench { padding: 100px 140px; gap: 32px; }
.rows { display: flex; flex-direction: column; gap: 26px; margin-top: 12px; }
.cmd { display: flex; flex-direction: column; gap: 6px; padding-left: 28px; border-left: 6px solid var(--deck-accent); }
.cmd code { font: 700 36px/1.25 var(--mono); color: var(--mint); }
.cmd code:not(.url)::before { content: '$ '; color: var(--deck-accent); }
.cmd span { font-size: 34px; line-height: 1.25; opacity: 0.85; }
</style>
