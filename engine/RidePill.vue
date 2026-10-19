<script setup>
// The pill the camera rides during a `via` flight (engine/ride.js). It lives in the world layer
// at the current point of the path, so it sits at the centre of the screen while riding. Drawn like
// a <Diagram> packet (same classes, .dg-packet / .dg-packet--<tone>, so a theme that restyles
// packets restyles it too), in the path's card space: rotated and scaled with it.
// App.vue updates `pill` every frame; only this tiny component re-renders.
import { ref, computed } from 'vue'
import { PACKET_FONT } from './diagram.js'

const props = defineProps({ pill: { type: Object, required: true } })
const PAD = 22
const textW = ref(0)
function measure(el) {
  const w = el?.getComputedTextLength?.()
  if (w > 0 && Math.abs(textW.value - w) > 0.5) textW.value = w
}
const w = computed(() => Math.ceil((textW.value || props.pill.label.length * PACKET_FONT * 0.62) + PAD * 2))
const style = computed(() => {
  const p = props.pill
  return { transform: `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) scale(${p.s * p.k})`, opacity: p.op }
})
</script>

<template>
  <svg v-if="pill.on" class="ride-pill" :class="{ 'is-fading': pill.fading }" :style="style" width="1" height="1" aria-hidden="true">
    <g class="dg-packet" :class="`dg-packet--${pill.tone}`">
      <rect :x="-w / 2" :y="-(PACKET_FONT * 0.85)" :width="w" :height="PACKET_FONT * 1.7" :rx="PACKET_FONT * 0.85" />
      <text :ref="measure" text-anchor="middle" dominant-baseline="central">{{ pill.label }}</text>
    </g>
  </svg>
</template>

<style>
.ride-pill {
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
  pointer-events: none;
  transform-origin: 0 0;
  z-index: 5;
}
.ride-pill.is-fading { transition: opacity 0.3s; }
/* the same zero-specificity packet styles as <Diagram>, for decks whose diagram isn't loaded */
:where(.ride-pill .dg-packet) { --dg-bg: var(--deck-ink); --dg-fg: var(--deck-paper); }
:where(.ride-pill .dg-packet--paper) { --dg-bg: var(--deck-paper); --dg-fg: var(--deck-ink); }
:where(.ride-pill .dg-packet--accent) { --dg-bg: var(--deck-accent); --dg-fg: var(--deck-on-accent); }
:where(.ride-pill .dg-packet--accent-2) { --dg-bg: var(--deck-accent-2); --dg-fg: var(--deck-paper); }
:where(.ride-pill .dg-packet rect) { fill: var(--dg-bg); }
:where(.ride-pill .dg-packet text) { fill: var(--dg-fg); font: 700 26px var(--mono); }
</style>
