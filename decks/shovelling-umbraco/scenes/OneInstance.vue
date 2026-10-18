<script setup>
import { useStep } from '../../../engine/useStep.js'
import { useCount } from '../../../engine/useCount.js'
import Step from '../../../engine/Step.vue'
import DiagonalLine from '../components/DiagonalLine.vue'

const { active } = useStep()
const n = useCount(active, 10, 1, { duration: 1300, delay: 400 })
</script>

<template>
  <div class="slide slide--dark one">
    <DiagonalLine />
    <div class="num-wrap">
      <svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" pathLength="1" /></svg>
      <div class="num">{{ n }}</div>
    </div>
    <div class="line">backoffice instance at DR. ~800 editors.</div>
    <Step :at="1" anim="up" class="punch accent">Stop over-engineering your Umbraco hosting.</Step>
  </div>
</template>

<style scoped>
.one { align-items: center; justify-content: center; gap: 36px; text-align: center; }
.num-wrap { position: relative; width: 460px; height: 460px; display: grid; place-items: center; }
.ring { position: absolute; inset: 0; transform: rotate(-90deg); overflow: visible; }
.ring circle { fill: none; stroke: var(--k-green); stroke-width: 5; stroke-linecap: round; stroke-dasharray: 1; }
.is-active .ring circle { animation: ring 1.8s var(--ease-out) 0.4s both; }
@keyframes ring { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.num { font: 400 330px/1 var(--serif); font-variant-numeric: tabular-nums; margin-top: 30px; }
.line { font: 400 52px var(--serif); position: relative; z-index: 2; }
.punch { font: 700 46px var(--sans); position: relative; z-index: 2; }
</style>
