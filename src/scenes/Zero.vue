<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useStep } from '../engine/useStep.js'

// Count 37 → 0 whenever the scene becomes active.
const { active } = useStep()
const n = ref(0)
let timer
watch(active, (on) => {
  clearInterval(timer)
  if (!on) return
  n.value = 37
  setTimeout(() => {
    timer = setInterval(() => {
      n.value = Math.max(0, n.value - Math.ceil(n.value / 6))
      if (n.value === 0) clearInterval(timer)
    }, 70)
  }, 600)
}, { immediate: true })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="slide slide--blue zero">
    <div class="blob blob--pink floaty" style="width: 1200px; height: 1200px; left: 50%; top: 50%; margin: -600px 0 0 -600px" />
    <div class="num-wrap">
      <svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" /></svg>
      <div class="num">{{ n }}</div>
    </div>
    <div class="line">migrations were harmed in the making of this talk</div>
  </div>
</template>

<style scoped>
.zero { align-items: center; justify-content: center; gap: 40px; }
.num-wrap { position: relative; width: 560px; height: 560px; display: grid; place-items: center; }
.ring { position: absolute; inset: 0; transform: rotate(-90deg); }
.ring circle {
  fill: none;
  stroke: var(--u-pink);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 580;
  stroke-dashoffset: 580;
}
.is-active .ring circle { animation: ring 1.6s var(--ease-out) 0.5s forwards; }
@keyframes ring { to { stroke-dashoffset: 0; } }
.num { font-size: 380px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; font-variant-numeric: tabular-nums; }
.line { font-size: 52px; font-weight: 700; color: var(--u-pink); position: relative; }
</style>
