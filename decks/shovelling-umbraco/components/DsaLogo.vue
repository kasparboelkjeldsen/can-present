<script setup>
// DSA logo (light-background version). On dark slides, wrap it in a sand card.
defineProps({ height: { type: Number, default: 80 } })
</script>

<template>
  <img class="dsa-logo" src="/assets/dsa-logo.svg" alt="DSA" :style="{ height: height + 'px' }" />
</template>

<style scoped>
.dsa-logo { display: block; width: auto; }
</style>
