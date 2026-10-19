<script setup>
// Code walkthrough: <Code> with per-step line focus (or one token) and a callout per step.
// The keys of :focus / :callouts are build steps; steps: 2 in deck.js.
import Code from '@engine/components/Code.vue'

const src = `
import { nest } from '@engine/layout.js'
import { arch } from './scenes/arch.js'

const ARCH = { x: 9500, y: 0, s: 1.25 }

export default {
  scenes: [
    { id: 'code', component: Walkthrough, steps: 2, at: { x: 6900, y: 300, r: -1 } },
    { id: 'diagram', component: Arch, steps: arch.steps, at: ARCH },
    { id: 'inside', component: Inside, steps: 2, parent: 'diagram',
      at: nest(ARCH, arch.slot('inside')), revealAt: arch.revealAt('engine') },
  ],
}
`
</script>

<template>
  <div class="slide slide--light walkthrough">
    <span class="kicker">deck.js</span>
    <Code
      class="fade-in"
      :code="src"
      title="decks/example/deck.js (abridged)"
      :size="30"
      :focus="{ 1: [8, 9, 10, 11], 2: { lines: [11], token: 'nest' } }"
      :callouts="{
        1: { line: 9, text: 'Order here = order on stage.' },
        2: { line: 11, text: 'nest() puts a scene inside the diagram’s box.', tone: 'green' },
      }"
    />
  </div>
</template>

<style scoped>
.walkthrough { padding: 100px 140px; gap: 36px; }
</style>
