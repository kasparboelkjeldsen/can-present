<script setup>
import Shovel from '../components/Shovel.vue'
</script>

<template>
  <div class="slide slide--dark thanks">
    <div class="blob blob--blue floaty" style="width: 1400px; height: 1400px; right: -500px; top: -500px" />
    <div class="blob blob--pink floaty" style="width: 1000px; height: 1000px; left: -300px; bottom: -500px; animation-delay: -3s" />
    <div class="shovel-wrap"><Shovel :size="560" /></div>
    <h1 class="h1">Thanks! <span class="pink">Questions?</span></h1>
    <div class="links">
      <span>github.com/your-handle</span>
      <span>@your-handle</span>
    </div>
  </div>
</template>

<style scoped>
.thanks { align-items: center; justify-content: center; gap: 60px; text-align: center; }
.shovel-wrap { transform: rotate(-20deg); }
.is-active .shovel-wrap { animation: wave 2.4s ease-in-out infinite; }
@keyframes wave {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(-8deg) translateY(-14px); }
}
.links { display: flex; gap: 60px; font: 400 34px var(--mono); color: var(--u-pink); position: relative; }
.h1 { position: relative; }
</style>
