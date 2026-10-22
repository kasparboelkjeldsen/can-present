<script setup>
import Shovel from '../components/Shovel.vue'
import DiagonalLine from '../components/DiagonalLine.vue'
import QrCode from '@engine/components/QrCode.vue'

// the deck itself, to take home (the repo goes public before the talk)
const REPO = 'https://github.com/kasparboelkjeldsen/can-present'
</script>

<template>
  <div class="slide slide--sand thanks">
    <DiagonalLine />
    <div class="shovel-wrap"><Shovel :size="360" shaft="var(--k-dark)" blade="#fff" edge="var(--umbraco)" /></div>
    <h1 class="h1 rise">Thanks! Questions?</h1>
    <div class="take">
      <QrCode :url="REPO" :size="340" layout="none" :delay="900" />
      <div class="take-text rise" style="--d: 6">
        <div class="steal">Want the slides?</div>
        <div class="what">Here. Engine included.</div>
        <div class="url">github.com/kasparboelkjeldsen/can-present</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thanks { align-items: center; justify-content: center; gap: 24px; text-align: center; }
.shovel-wrap { transform: rotate(-20deg); position: relative; z-index: 2; }
.is-active .shovel-wrap { animation: wave 2.4s ease-in-out infinite; }
@keyframes wave {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(-8deg) translateY(-14px); }
}
.take { display: flex; align-items: center; gap: 40px; margin-top: 10px; text-align: left; position: relative; z-index: 2; }
.steal { font: 400 64px/1.05 var(--serif); }
.what { margin-top: 10px; font: 400 32px/1.25 var(--sans); }
.url { margin-top: 14px; font: 700 26px var(--mono); user-select: text; }
</style>
