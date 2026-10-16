<script setup>
// The Kraftvaerk diagonal: a thin line rising left→right at ~40°, drawn on entrance.
// Colour follows the slide's --accent (green on dark/grey, dark on sand/red).
// Coordinates are in the 1920×1080 slide space.
defineProps({
  x1: { type: Number, default: 1440 },
  y1: { type: Number, default: 1080 },
  x2: { type: Number, default: 1920 },
  y2: { type: Number, default: 677 },
  width: { type: Number, default: 3 },
  delay: { type: Number, default: 300 },
  duration: { type: Number, default: 1200 },
})
</script>

<template>
  <svg class="diag" viewBox="0 0 1920 1080" preserveAspectRatio="none">
    <line
      :x1="x1" :y1="y1" :x2="x2" :y2="y2"
      pathLength="1"
      :stroke-width="width"
      :style="{ animationDelay: delay + 'ms', animationDuration: duration + 'ms' }"
    />
  </svg>
</template>

<style scoped>
.diag { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: visible; }
line { stroke: var(--accent); stroke-linecap: round; stroke-dasharray: 1; }
.is-active line { animation-name: draw; animation-timing-function: var(--ease-out); animation-fill-mode: both; }
@keyframes draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
</style>
