<script setup>
// A live site: <Shot live> is a real, clickable iframe. It loads once the scene is on stage or one
// away, and thumbnails show a placeholder. While you click in it, keys go to the site; move the
// mouse off it to drive the deck again. A site that refuses to be framed (X-Frame-Options,
// frame-ancestors) gets `external`: a launch card that opens it in a new tab.
import Shot from '@engine/components/Shot.vue'
</script>

<template>
  <div class="slide slide--dark live">
    <div class="text">
      <span class="kicker">live</span>
      <h2 class="h2">The real site, live</h2>
      <p class="lead">A real site in a browser frame. Click around, then press X if it dies.</p>
    </div>
    <Shot class="rise" style="--d: 2" live="https://example.com/" :width="900" :height="620" :zoom="1.4" />
  </div>
</template>

<style scoped>
.live { flex-direction: row; align-items: center; gap: 80px; }
.text { display: flex; flex-direction: column; gap: 40px; flex: 1; }
</style>
