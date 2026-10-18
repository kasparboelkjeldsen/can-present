<script setup>
import Shot from '@engine/components/Shot.vue'
</script>

<template>
  <div class="slide slide--light screenshot">
    <div class="text">
      <span class="kicker">building blocks</span>
      <h2 class="h2">Screenshots and live sites</h2>
      <p class="lead">Put PNGs in <code>decks/example/public/shots/</code> and pass <code>src</code>, or embed a real site with <code>live</code>.</p>
    </div>
    <Shot class="rise" style="--d: 2" :width="760" :height="520" url="your-site.example" hint="screenshot goes here" />
  </div>
</template>

<style scoped>
.screenshot { flex-direction: row; align-items: center; gap: 80px; }
.text { display: flex; flex-direction: column; gap: 40px; flex: 1; }
code { font: 700 0.85em var(--mono); }
</style>
