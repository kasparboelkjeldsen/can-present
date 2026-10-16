<script setup>
// Reveal content on a build step.  <Step :at="2" anim="pop" :delay="150">…</Step>
// anim: up | down | left | right | pop | blur | fade | dim
import { computed } from 'vue'
import { useStep } from './useStep.js'

const props = defineProps({
  at: { type: Number, default: 1 },
  until: { type: Number, default: null },
  anim: { type: String, default: 'up' },
  delay: { type: Number, default: 0 },
  tag: { type: String, default: 'div' },
})
const { step } = useStep()
const shown = computed(() => step.value >= props.at && (props.until == null || step.value < props.until))
</script>

<template>
  <component
    :is="tag"
    class="step"
    :class="[`step--${anim}`, { 'is-shown': shown }]"
    :style="{ transitionDelay: `${delay}ms` }"
  ><slot /></component>
</template>
