<script setup>
// Diagram: the definition (nodes, edges, packets, the slot) is in arch.js, shared with deck.js,
// which takes `steps: arch.steps` from it and nests the `inside` scene in arch.slot('inside').
// Each node pops in on its step; lines draw once both their boxes are there; packets then loop.
// A #node-<id> slot replaces a box's default label/sub (slot props: { node, shown }).
import Diagram from '@engine/components/Diagram.vue'
import { arch } from './arch.js'
</script>

<template>
  <div class="slide slide--dark arch">
    <span class="kicker">diagram</span>
    <h2 class="h2">How a deck runs</h2>
    <Diagram :diagram="arch">
      <template #node-browser="{ node }">
        <div class="dg-label">{{ node.label }}</div>
        <div class="dg-sub">{{ node.sub }}</div>
        <div class="keys"><kbd>→</kbd><kbd>O</kbd></div>
      </template>
    </Diagram>
  </div>
</template>

<style scoped>
.arch { padding: 100px 140px; gap: 28px; }
.keys { display: flex; gap: 10px; margin-top: 8px; }
kbd { padding: 2px 14px; border-radius: 10px; background: var(--deck-accent); color: var(--deck-on-accent); font: 700 26px var(--mono); }
</style>
