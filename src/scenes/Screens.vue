<script setup>
import Step from '../engine/Step.vue'
import Shot from '../components/Shot.vue'
</script>

<template>
  <div class="slide slide--pink screens">
    <div class="kicker">Same content, two homes</div>
    <div class="row">
      <Step :at="0" anim="left" class="tilt-l">
        <Shot url="cms.example.com/umbraco" hint="Umbraco backoffice screenshot" :width="800" style="height: 520px" />
        <div class="label">Edited here…</div>
      </Step>
      <Step :at="1" anim="right" class="tilt-r">
        <Shot url="client-site.com/about" hint="WordPress page screenshot" :width="800" style="height: 520px" />
        <div class="label">…shows up here.</div>
      </Step>
    </div>
  </div>
</template>

<style scoped>
.row { flex: 1; display: flex; align-items: center; justify-content: center; gap: 80px; margin-top: 20px; }
.tilt-l { transform: rotate(-3deg); }
.tilt-r { transform: rotate(3deg) translateY(40px); }
.tilt-l.step:not(.is-shown) { transform: rotate(-3deg) translateX(-100px); }
.tilt-r.step:not(.is-shown) { transform: rotate(3deg) translate(100px, 40px); }
.label { margin-top: 36px; font-size: 48px; font-weight: 900; text-align: center; color: var(--u-navy); }
</style>
