<script setup>
import { BigNumber } from 'can-present'
</script>

<template>
  <div class="slide slide--dark stat">
    <BigNumber :to="1080" ring label="px tall, always" :size="210" format="plain" />
    <div class="text">
      <span class="kicker">16 : 9</span>
      <h2 class="h2">The card never changes shape</h2>
      <p class="lead">The box does. The stage is fitted inside it, in the post or full screen.</p>
    </div>
  </div>
</template>

<style scoped>
.stat { flex-direction: row; align-items: center; gap: 100px; }
.text { display: flex; flex-direction: column; gap: 36px; }
</style>
