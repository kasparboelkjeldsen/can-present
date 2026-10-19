<script setup>
// Content that depends on how close the camera is, like a map.
//
//   <Detail :from="2" :to="6">…</Detail>   shown while the card is between 2× and 6× (useStep().zoom)
//   <Detail :from="8" tag="span">…</Detail> only once the camera is 8× in
//   <Detail :until="0.3">…</Detail>         only from far away (the overview); shorthand for :to
//
// zoom is the card's on-screen scale: 1 = the card fills the stage. The fade has a soft band:
// opacity ramps up from from × 0.7 to from, and down from to to to × 1.3. It scrubs with the
// camera rather than running on a timer, so content materialises *while* the camera zooms
// (`frames` in deck.js moves the camera within a scene). Faded out, it's visibility: hidden and
// takes no pointer events. Thumbnails are at zoom 1. Works inside an <svg> too (tag="g").
//
// The opacity is written straight to the element, so a camera move never re-renders the content.
import { ref, computed, watchEffect } from 'vue'
import { useStep } from '../useStep.js'

const props = defineProps({
  from: { type: Number, default: 0 },
  to: { type: Number, default: Infinity },
  until: { type: Number, default: null },
  tag: { type: String, default: 'div' },
})
const { zoom } = useStep()

const IN = 0.7 // fades in from from × IN …
const OUT = 1.3 // … and out until to × OUT
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
const opacity = computed(() => {
  const z = zoom.value
  const to = props.until ?? props.to
  let a = 1
  if (props.from > 0) a = Math.min(a, smooth((z - props.from * IN) / (props.from * (1 - IN))))
  if (Number.isFinite(to) && to > 0) a = Math.min(a, smooth((to * OUT - z) / (to * (OUT - 1))))
  return Math.round(a * 1000) / 1000
})

const el = ref(null)
watchEffect(() => {
  const e = el.value
  if (!e) return
  const a = opacity.value
  e.style.opacity = a >= 1 ? '' : String(a)
  e.style.visibility = a <= 0 ? 'hidden' : ''
  e.style.pointerEvents = a <= 0 ? 'none' : ''
}, { flush: 'post' })
</script>

<template>
  <component :is="tag" ref="el" class="detail"><slot /></component>
</template>
