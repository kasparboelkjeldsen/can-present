<script setup>
import Shot from '../components/Shot.vue'
</script>

<template>
  <div class="slide slide--dark live">
    <div class="blob blob--pink" style="width: 1000px; height: 1000px; right: -400px; top: -600px" />
    <div class="head">
      <div class="kicker">Live</div>
      <div class="sub">Go on, click around. It's real.</div>
    </div>
    <Shot live="https://www.kjeldsen.dev/" class="site" />
  </div>
</template>

<style scoped>
.live { padding: 36px 56px 56px; gap: 28px; }
.head { display: flex; align-items: center; gap: 28px; position: relative; }
.head .kicker { font-size: 22px; padding: 8px 20px; }
.sub { font-size: 30px; font-weight: 700; color: var(--u-pink); }
.site { flex: 1; min-height: 0; position: relative; }
</style>
