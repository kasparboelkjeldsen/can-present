<script setup>
import Shot from '@engine/components/Shot.vue'
</script>

<template>
  <div class="slide slide--sand live-demo">
    <div class="pane left">
      <div class="label"><span class="dot u" />Umbraco</div>
      <!-- the backoffice login can't live in a cross-site iframe (SameSite cookies), so it opens in a tab -->
      <Shot
        class="frame"
        live="https://umbraco.dsa.dk/umbraco/section/web-komponenter"
        external
        src="/shots/backoffice-web-komponenter.png"
        position="left top"
      />
    </div>
    <div class="pane right">
      <div class="label"><span class="dot w" />Someone else's website</div>
      <Shot class="frame" live="https://www.kjeldsen.dev/job-test" :zoom="0.72" />
    </div>
  </div>
</template>

<style scoped>
.live-demo { flex-direction: row; gap: 36px; padding: 40px 48px 110px; }
.pane { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 18px; position: relative; z-index: 2; }
.label { display: flex; align-items: center; gap: 14px; font: 700 34px var(--sans); }
.dot { width: 22px; height: 22px; border-radius: 50%; }
.dot.u { background: var(--umbraco); }
.dot.w { background: var(--wp); }
.frame { flex: 1; min-height: 0; }
.is-active .left { animation: in-left 1s var(--ease-out) 0.2s both; }
.is-active .right { animation: in-right 1s var(--ease-out) 0.35s both; }
@keyframes in-left { from { opacity: 0; transform: translateX(-300px); } }
@keyframes in-right { from { opacity: 0; transform: translateX(300px); } }
</style>
