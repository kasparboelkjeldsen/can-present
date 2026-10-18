<script setup>
// QR code: <QrCode> with a label and the link under it. Its dots fall onto the card as the scene
// arrives (again on every return): finder squares first, then the rest rains in. Past the scene,
// in the overview and in thumbnails it's the finished code. Drop it on a click instead with :at="1"
// (and steps: 1 in deck.js); layout="right" puts the label and link beside the code.
import QrCode from '@engine/components/QrCode.vue'
</script>

<template>
  <div class="slide slide--light get-the-code">
    <div class="text">
      <span class="kicker rise">qr code</span>
      <h2 class="h1 rise" style="--d: 1">Take it<br />with <span class="accent">you</span>.</h2>
      <p class="lead rise" style="--d: 2">Point a phone at it: this deck, engine and all.</p>
    </div>
    <QrCode url="https://github.com/kasparboelkjeldsen/can-present" label="The code for this deck" layout="below" />
  </div>
</template>

<style scoped>
.get-the-code { flex-direction: row; align-items: center; justify-content: space-between; padding: 80px 140px; }
.text { display: flex; flex-direction: column; gap: 40px; max-width: 760px; }
</style>
