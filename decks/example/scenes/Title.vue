<script setup>
// Headline + kicker. `rise` with --d staggers the entrance; it replays every time the scene comes on stage.
</script>

<template>
  <div class="slide slide--dark title">
    <span class="kicker rise">can-present</span>
    <h1 class="h1 rise" style="--d: 1">An example<br /><span class="accent">deck</span></h1>
    <p class="lead rise" style="--d: 2">Scenes on one big canvas. → flies to the next one, O shows them all.</p>
  </div>
</template>

<style scoped>
.title { justify-content: center; }
.lead { max-width: 860px; }
</style>
