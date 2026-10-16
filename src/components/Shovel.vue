<script setup>
// The shovel. Drawn along +x with the grip at 0,0 so it's easy to rotate around the hands.
// Standalone: <Shovel :size="300" />, inline inside an <svg>: <Shovel inline />
defineProps({
  size: { type: Number, default: 300 },
  inline: Boolean,
  shaft: { type: String, default: 'var(--u-pink)' },
  blade: { type: String, default: '#e9ecff' },
  edge: { type: String, default: 'var(--u-blue-bright)' },
})
</script>

<template>
  <component
    :is="inline ? 'g' : 'svg'"
    v-bind="inline ? {} : { width: size, height: size * 0.32, viewBox: '-60 -64 480 128' }"
  >
    <!-- D-grip -->
    <path d="M10 -24 H-28 Q-50 -24 -50 0 Q-50 24 -28 24 H10" fill="none" :stroke="shaft" stroke-width="10" stroke-linecap="round" />
    <line x1="-34" y1="-18" x2="-34" y2="18" :stroke="shaft" stroke-width="10" stroke-linecap="round" />
    <!-- shaft -->
    <rect x="0" y="-8" width="268" height="16" rx="8" :fill="shaft" />
    <rect x="248" y="-11" width="30" height="22" rx="5" :fill="edge" />
    <!-- blade -->
    <path
      d="M272 -14 L300 -42 Q312 -50 336 -46 L382 -34 Q408 -24 412 0 Q408 24 382 34 L336 46 Q312 50 300 42 L272 14 Z"
      :fill="blade"
      :stroke="edge"
      stroke-width="5"
      stroke-linejoin="round"
    />
    <path d="M300 0 H392" :stroke="edge" stroke-width="4" stroke-linecap="round" opacity="0.5" />
  </component>
</template>
