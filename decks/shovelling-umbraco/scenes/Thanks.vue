<script setup>
import Shovel from '../components/Shovel.vue'
import DsaLogo from '../components/DsaLogo.vue'
import DiagonalLine from '../components/DiagonalLine.vue'
</script>

<template>
  <div class="slide slide--sand thanks">
    <DiagonalLine />
    <div class="shovel-wrap"><Shovel :size="520" shaft="var(--k-dark)" blade="#fff" edge="var(--umbraco)" /></div>
    <h1 class="h1 rise">Thanks! Questions?</h1>
    <div class="site rise" style="--d: 2">kjeldsen.dev</div>
    <div class="dsa fade-in" style="--d: 5">
      <DsaLogo :height="70" />
      <span>Thanks to DSA for letting me do this to their production.</span>
    </div>
  </div>
</template>

<style scoped>
.thanks { align-items: center; justify-content: center; gap: 44px; text-align: center; }
.shovel-wrap { transform: rotate(-20deg); position: relative; z-index: 2; }
.is-active .shovel-wrap { animation: wave 2.4s ease-in-out infinite; }
@keyframes wave {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(-8deg) translateY(-14px); }
}
.site { font: 700 44px var(--sans); position: relative; z-index: 2; }
.dsa { position: absolute; bottom: 110px; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 28px; font: 400 30px var(--sans); z-index: 2; }
</style>
