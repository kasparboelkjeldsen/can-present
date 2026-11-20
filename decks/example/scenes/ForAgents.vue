<script setup>
// The repo is made to be worked on by an agent: a <Code> block as a file tree with one line in focus
// per click, and a caption beside it that replaces the one before (<Step :at :until>).
// steps: 4 in deck.js (AGENTS.md, the skills, the guide, the brand kits).
import Code from '@engine/components/Code.vue'
import Step from '@engine/Step.vue'

const tree = `
can-present/
├─ AGENTS.md
├─ CLAUDE.md
├─ .agents/skills/
│  ├─ write-talk/
│  └─ build-deck/
├─ docs/
│  └─ presentation-guide.md
├─ brands/
│  └─ kraftvaerk/
├─ engine/
└─ decks/
   └─ example/
`
</script>

<template>
  <div class="slide slide--light for-agents">
    <span class="kicker rise">the repo</span>
    <h2 class="h2 rise" style="--d: 1">Built for <span class="accent">agents</span></h2>
    <div class="row">
      <Code
        class="tree fade-in"
        style="--d: 2"
        :code="tree"
        title="can-present"
        :size="34"
        :focus="{ 1: [2, 3], 2: [4, 5, 6], 3: [7, 8], 4: [9, 10] }"
      />
      <div class="captions">
        <Step :at="0" :until="1" anim="fade" class="cap">
          <p class="lead">Open an agent in the repo and say what you want. Everything it needs is where it looks first.</p>
        </Step>
        <Step :at="1" :until="2" anim="left" class="cap">
          <b class="name"><code>AGENTS.md</code></b>
          <p class="lead">Start here: what to read for your task, the rules, a pattern index. <code>CLAUDE.md</code> just points at it.</p>
        </Step>
        <Step :at="2" :until="3" anim="left" class="cap">
          <b class="name">Two skills</b>
          <p class="lead"><b>write-talk</b> shapes the talk with you. <b>build-deck</b> turns it into scenes. Claude Code, Codex and Copilot find both.</p>
        </Step>
        <Step :at="3" :until="4" anim="left" class="cap">
          <b class="name">The guide</b>
          <p class="lead">Everything a talk can do, for a model that can't see the code. Paste it into a chat to plan a talk.</p>
        </Step>
        <Step :at="4" anim="left" class="cap">
          <b class="name">Brand kits</b>
          <p class="lead">A company's colours, fonts, logo and parts, shared by every deck: <code>--brand kraftvaerk</code>.</p>
        </Step>
      </div>
    </div>
  </div>
</template>

<style scoped>
.for-agents { padding: 100px 140px; gap: 32px; }
.row { flex: 1; display: flex; gap: 72px; align-items: center; min-height: 0; }
.tree { flex: 0 0 800px; }
/* the captions sit on top of each other; only one is shown at a time */
.captions { flex: 1; display: grid; align-items: center; }
.cap { grid-area: 1 / 1; display: flex; flex-direction: column; gap: 24px; }
.name { font: 800 64px/1.05 var(--sans); }
.name code { font-size: 0.85em; color: #b8640a; }
.lead { font-size: 44px; }
</style>
