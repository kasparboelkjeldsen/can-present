<script setup>
import DiagonalLine from '../components/DiagonalLine.vue'
import DsaLogo from '../components/DsaLogo.vue'
import ShovelLoop from '../components/ShovelLoop.vue'
</script>

<template>
  <div class="slide slide--dark live-kicker">
    <DiagonalLine :x1="0" :y1="420" :x2="500" :y2="0" />
    <div class="kicker rise">Live</div>
    <div class="head">
      <h1 class="h1 rise" style="--d: 1">This is DSA's production.</h1>
      <div class="logo-card fade-in" style="--d: 4"><DsaLogo :height="110" /></div>
    </div>
    <ShovelLoop class="art" :target="false" />
  </div>
</template>

<style scoped>
.live-kicker { justify-content: center; gap: 50px; }
.head { display: flex; align-items: center; gap: 70px; position: relative; z-index: 2; }
.h1 { font-size: 140px; max-width: 1100px; }
.logo-card { flex: none; padding: 36px 44px; border-radius: var(--radius); background: var(--k-sand); }
.art { position: absolute; right: -60px; bottom: -40px; width: 560px; height: 504px; opacity: 0.9; }
</style>
