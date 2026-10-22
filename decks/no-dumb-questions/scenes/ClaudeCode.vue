<script setup>
// Our 11 lines next to an industrial harness (Claude Code): same loop, plus a lot. steps: 5.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--dark cc">
    <span class="kicker">industrial strength: Claude Code</span>
    <h2 class="h2 rise">Same loop, plus a lot</h2>
    <div class="table">
      <div class="tr tr--head">
        <span />
        <span class="head">our 11 lines</span>
        <span class="head accent">Claude Code</span>
      </div>

      <!-- literal :at values, so `npm run check` can count the builds -->
      <Step :at="1" anim="left" class="tr"><b>Tools</b><span class="ours">read_file</span><span>a dozen-plus built in (read, edit, search, shell, web), more plugged in (MCP)</span></Step>
      <Step :at="2" anim="left" class="tr"><b>Instructions</b><span class="ours">one line</span><span>a long system prompt, plus your CLAUDE.md / AGENTS.md</span></Step>
      <Step :at="3" anim="left" class="tr"><b>Safety</b><span class="ours">none</span><span>asks before edits and commands; allow-lists</span></Step>
      <Step :at="4" anim="left" class="tr"><b>Memory</b><span class="ours">the array grows until it breaks</span><span>summarises old turns when full; reads only the files it needs</span></Step>
      <Step :at="5" anim="left" class="tr"><b>Help</b><span class="ours">none</span><span>sub-agents: fresh loops for side quests</span></Step>
    </div>
  </div>
</template>

<style scoped>
.cc { padding: 80px 120px; gap: 26px; }
.table { display: flex; flex-direction: column; font-size: 36px; line-height: 1.25; }
/* each row is its own grid with the same columns: a <Step> needs a real box to slide and fade
   (display: contents has none, so the builds wouldn't show) */
.tr { display: grid; grid-template-columns: 260px 420px 1fr; column-gap: 40px; align-items: start; }
.tr:not(.tr--head) { padding: 20px 0; border-top: 3px solid var(--line); }
.head { padding-bottom: 14px; font: 800 30px var(--sans); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.head.accent { color: var(--sun); }
.tr b { font-size: 38px; }
.ours { color: var(--muted); }
</style>
