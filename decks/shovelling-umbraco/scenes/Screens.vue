<script setup>
// Fallback for the live demo. Skipped in normal navigation (skip: true in deck.js); X or #fallback gets here.
// TODO: drop shots/fallback-backoffice-origin-added.png and shots/fallback-job-test-after.png in, then pass them as src.
import Shot from '@engine/components/Shot.vue'
</script>

<template>
  <div class="slide slide--grey screens">
    <div class="kicker">What you would have seen</div>
    <div class="row">
      <figure class="tilt-l">
        <Shot frame="window" hint="shots/fallback-backoffice-origin-added.png" :width="800" style="height: 520px" />
        <figcaption>Edited here…</figcaption>
      </figure>
      <figure class="tilt-r">
        <Shot url="www.kjeldsen.dev/job-test" hint="shots/fallback-job-test-after.png" :width="800" style="height: 520px" />
        <figcaption>…shows up here.</figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.row { flex: 1; display: flex; align-items: center; justify-content: center; gap: 80px; position: relative; z-index: 2; }
figure { margin: 0; }
.tilt-l { transform: rotate(-3deg); }
.tilt-r { transform: rotate(3deg) translateY(40px); }
.is-active .tilt-l { animation: in-l 1s var(--ease-out) 0.15s both; }
.is-active .tilt-r { animation: in-r 1s var(--ease-out) 0.3s both; }
@keyframes in-l { from { opacity: 0; transform: rotate(-3deg) translateX(-200px); } }
@keyframes in-r { from { opacity: 0; transform: rotate(3deg) translate(200px, 40px); } }
figcaption { margin-top: 36px; font: 400 52px var(--serif); text-align: center; }
</style>
