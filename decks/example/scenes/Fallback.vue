<script setup>
// Demo fallback: `skip: true` in deck.js, so → and ← step over it. X (or #fallback) jumps here
// when the live demo dies; → from here carries on with the next scene in deck order.
import Shot from '@engine/components/Shot.vue'
</script>

<template>
  <div class="slide slide--light fallback">
    <div class="text">
      <span class="kicker">fallback</span>
      <h2 class="h2">If the demo dies</h2>
      <p class="lead">Press X: screenshots of the same thing, waiting off the path.</p>
    </div>
    <Shot class="rise" style="--d: 2" :width="820" :height="560" url="example.com" hint="example.com, as it looked" />
  </div>
</template>

<style scoped>
.fallback { flex-direction: row; align-items: center; gap: 80px; }
.text { display: flex; flex-direction: column; gap: 40px; flex: 1; }
</style>
