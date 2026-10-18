<script setup>
// The takeaway. Placed as a "ghost" over the whole canvas (see deck.js): its background is
// translucent, so when the camera pulls back here the entire talk is visible behind it.
</script>

<template>
  <div class="slide slide--dark plane no-mark">
    <h1 class="h1">
      <span class="l1">Umbraco isn't just your website.</span>
      <span class="l2">It's the <span class="cp">control plane<svg class="under" viewBox="0 0 600 30" preserveAspectRatio="none"><path d="M4 26 L596 4" pathLength="1" /></svg></span><br />for things you don't own.</span>
    </h1>
  </div>
</template>

<style scoped>
.plane { background: rgba(44, 44, 46, 0.86); justify-content: center; align-items: center; text-align: center; }
.h1 { font-size: 112px; line-height: 1.4; display: flex; flex-direction: column; gap: 30px; }
.l1, .l2 { display: block; }
.is-active .l1 { animation: rise 1s var(--ease-out) 0.5s both; }
.is-active .l2 { animation: rise 1s var(--ease-out) 2s both; }
.cp { position: relative; color: var(--k-green); white-space: nowrap; }
.under { position: absolute; left: -2%; width: 104%; bottom: -14px; height: 30px; overflow: visible; }
.under path { fill: none; stroke: var(--k-green); stroke-width: 6; stroke-linecap: round; stroke-dasharray: 1; }
.is-active .under path { animation: draw 1s var(--ease-out) 2.8s both; }
@keyframes draw { from { stroke-dashoffset: 1; } }
</style>
