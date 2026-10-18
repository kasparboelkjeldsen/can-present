<script setup>
// Two tilted screenshots. <Shot> with no `src` is a labelled placeholder; drop PNGs in
// decks/example/public/shots/ and pass src, a path like /shots/before.png (npm run check lists missing ones).
import Shot from '@engine/components/Shot.vue'
</script>

<template>
  <div class="slide slide--light screens">
    <span class="kicker">screenshots</span>
    <h2 class="h2">Show the real thing</h2>
    <div class="pair">
      <Shot class="rise left" style="--d: 2" :width="760" :height="500" url="before.example" hint="the old page" />
      <Shot class="rise right" style="--d: 4" :width="760" :height="500" frame="window" hint="the new page" />
    </div>
  </div>
</template>

<style scoped>
.screens { padding: 100px 140px; gap: 30px; }
.pair { position: relative; flex: 1; }
.left, .right { position: absolute; }
.left { left: 40px; top: 30px; rotate: -4deg; }
.right { right: 40px; top: 90px; rotate: 3deg; }
</style>
