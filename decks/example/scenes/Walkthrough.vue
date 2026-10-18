<script setup>
import Code from '@engine/components/Code.vue'

const src = `
export default {
  id: 'example',
  title: 'can-present: example deck',
  icon: '🎬',
  scenes: [
    { id: 'title', component: Title, at: { x: 0, y: 0 } },
    { id: 'inside', component: Inside, steps: 2, at: nest(TITLE, BOX), parent: 'title' },
    { id: 'code', component: Walkthrough, steps: 2, at: { x: 2400, y: 350, r: 3 } },
  ],
}
`
</script>

<template>
  <div class="slide slide--dark walkthrough">
    <span class="kicker">deck.js</span>
    <Code
      class="fade-in"
      :code="src"
      title="decks/example/deck.js (abridged)"
      :size="28"
      :focus="{ 1: [6, 7, 8], 2: { lines: [7], token: 'nest' } }"
      :callouts="{
        1: { line: 8, text: 'Order here = order on stage.' },
        2: { line: 7, text: 'nest() puts a scene inside another one.', tone: 'green' },
      }"
    />
  </div>
</template>

<style scoped>
.walkthrough { padding: 100px 140px; gap: 36px; }
</style>
