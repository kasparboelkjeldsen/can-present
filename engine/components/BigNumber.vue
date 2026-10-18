<script setup>
// A huge number that counts when its scene comes on stage (or on a build step), optionally with
// a ring that draws itself in sync.
//
//   <BigNumber :to="6836" ring label="loads" />
//   <BigNumber :from="10" :to="1" :size="330" :at="1" tone="accent-2" suffix="×" />
//   <BigNumber :to="99.9" :decimals="1" suffix="%"><template #label>uptime</template></BigNumber>
//
// at:     build step that starts the count (0 = when the scene comes on stage). Before it the
//         number shows `from`; it re-counts every time the scene comes on stage.
// format: 'grouped' (6,836) | 'plain' (6836) | (n) => string
// ring:   a circle around the number and label; tone 'accent' | 'accent-2' picks its colour.
//         With a ring the component is a square as big as the ring, so lay it out like any box.
// Past the scene, in the overview and in thumbnails it shows the final value (and a full ring).
// The number uses var(--display-font, inherit) with tabular numerals; the label inherits the colour.
import { ref, computed, useSlots, onMounted, onBeforeUnmount } from 'vue'
import { useStep } from '../useStep.js'
import { useCounter } from '../useCount.js'

const props = defineProps({
  to: { type: Number, required: true },
  from: { type: Number, default: 0 },
  at: { type: Number, default: 0 },
  duration: { type: Number, default: 1400 },
  delay: { type: Number, default: 300 },
  ring: Boolean,
  tone: { type: String, default: 'accent' }, // accent | accent-2 (the ring)
  format: { type: [String, Function], default: 'grouped' }, // grouped | plain | (n) => string
  decimals: { type: Number, default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  label: { type: String, default: '' },
  size: { type: Number, default: 240 }, // px, the number's font size
})
const slots = useSlots()
const { step, active, preview } = useStep()

const live = computed(() => active.value && !preview.value)
const counting = computed(() => live.value && step.value >= props.at)
const { value, progress } = useCounter(counting, () => props.from, () => props.to, {
  duration: props.duration,
  delay: props.delay,
  decimals: props.decimals,
})

// final value unless this scene is on stage; `from` while waiting for the build step
const shown = computed(() => (!live.value ? props.to : counting.value ? value.value : props.from))
const drawn = computed(() => (!live.value ? 1 : counting.value ? progress.value : 0))

const grouped = computed(() => new Intl.NumberFormat('en-US', { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals }))
function fmt(n) {
  if (typeof props.format === 'function') return props.format(n)
  if (props.format === 'plain') return n.toFixed(props.decimals)
  return grouped.value.format(n)
}

// ---- the ring: a circle around the number + label, sized from their box ----
const content = ref(null)
const box = ref({ w: props.size * 2.4, h: props.size * 1.4 })
let ro
onMounted(() => {
  if (!props.ring || !content.value) return
  ro = new ResizeObserver(() => {
    const el = content.value
    if (el) box.value = { w: el.offsetWidth, h: el.offsetHeight }
  })
  ro.observe(content.value)
})
onBeforeUnmount(() => ro?.disconnect())
const STROKE = 6
const diameter = computed(() => Math.ceil(Math.hypot(box.value.w, box.value.h) + props.size * 0.2 + STROKE * 2))
const hasLabel = computed(() => !!(props.label || slots.label))
</script>

<template>
  <div
    class="big-number"
    :class="{ 'big-number--ring': ring }"
    :style="{ '--bn-size': size + 'px', ...(ring ? { width: diameter + 'px', height: diameter + 'px' } : {}) }"
  >
    <svg v-if="ring" class="bn-ring" :class="`bn-ring--${tone}`" :viewBox="`0 0 ${diameter} ${diameter}`" aria-hidden="true">
      <circle
        :cx="diameter / 2"
        :cy="diameter / 2"
        :r="diameter / 2 - STROKE"
        pathLength="1"
        :stroke-width="STROKE"
        :style="{ strokeDashoffset: 1 - drawn, opacity: drawn > 0 ? 1 : 0 }"
      />
    </svg>
    <div ref="content" class="bn-content">
      <div class="bn-num">
        <!-- the widest of from/to, invisible, so the box doesn't change width while counting -->
        <span class="bn-sizer" aria-hidden="true">{{ prefix }}{{ fmt(to) }}{{ suffix }}</span>
        <span class="bn-sizer" aria-hidden="true">{{ prefix }}{{ fmt(from) }}{{ suffix }}</span>
        <span class="bn-value">{{ prefix }}{{ fmt(shown) }}{{ suffix }}</span>
      </div>
      <div v-if="hasLabel" class="bn-label"><slot name="label">{{ label }}</slot></div>
    </div>
  </div>
</template>

<style>
/* zero specificity (:where), so a deck's theme can restyle any part */
:where(.big-number) {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
:where(.bn-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--bn-size) * 0.06);
  text-align: center;
}
:where(.bn-num) {
  display: grid;
  font-family: var(--display-font, inherit);
  font-size: var(--bn-size);
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  white-space: nowrap;
}
:where(.bn-num > span) { grid-area: 1 / 1; text-align: center; }
:where(.bn-sizer) { visibility: hidden; }
:where(.bn-label) {
  font-size: clamp(26px, calc(var(--bn-size) * 0.19), 56px);
  font-weight: 700;
  line-height: 1.2;
}
:where(.bn-ring) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotate(-90deg);
  pointer-events: none;
}
:where(.bn-ring circle) {
  fill: none;
  stroke: var(--deck-accent);
  stroke-linecap: round;
  stroke-dasharray: 1;
}
:where(.bn-ring--accent-2 circle) { stroke: var(--deck-accent-2); }
</style>
