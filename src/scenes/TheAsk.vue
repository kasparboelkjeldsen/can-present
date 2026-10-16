<script setup>
import Step from '../engine/Step.vue'
import DiagonalLine from '../components/DiagonalLine.vue'
import DsaLogo from '../components/DsaLogo.vue'
</script>

<template>
  <div class="slide slide--sand">
    <DiagonalLine />
    <DsaLogo :height="96" class="logo fade-in" />
    <div class="kicker">The ask</div>
    <h1 class="h1 rise" style="--d: 1">We'd like our job carousel on our partners' sites.</h1>
    <Step :at="1" anim="up" class="simple">
      Simple, right?
      <svg class="scribble" viewBox="0 0 400 30" preserveAspectRatio="none">
        <path d="M4 20 C 80 6, 160 28, 240 14 S 360 8, 396 18" />
      </svg>
    </Step>
  </div>
</template>

<style scoped>
.logo { align-self: flex-start; margin: -40px 0 50px -6px; }
.h1 { margin-top: 44px; font-size: 124px; max-width: 1500px; }
.simple { position: relative; align-self: flex-start; margin-top: 60px; font-size: 52px; font-weight: 700; }
.scribble { position: absolute; left: -6px; bottom: -22px; width: calc(100% + 12px); height: 30px; overflow: visible; }
.scribble path {
  fill: none;
  stroke: var(--k-red);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  transition: stroke-dashoffset 0.8s var(--ease-out) 0.35s;
}
.is-shown .scribble path { stroke-dashoffset: 0; }
</style>
