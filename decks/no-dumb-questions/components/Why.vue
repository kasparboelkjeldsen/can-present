<script setup>
// The recurring pink speech bubble: "But what does that mean?". It comes up as the last build of
// a card whose next scene zooms into the answer. Slot overrides the text.
</script>

<template>
  <div class="why"><span class="why-text"><slot>But what does that mean?</slot></span></div>
</template>

<style scoped>
.why { display: inline-flex; }
.why-text {
  position: relative;
  padding: 22px 40px;
  border-radius: 40px;
  background: var(--pink);
  color: var(--night);
  font: 800 48px/1.15 var(--sans);
  letter-spacing: -0.01em;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
}
.why-text::after {
  content: '';
  position: absolute;
  left: 70px;
  bottom: -26px;
  border: 28px solid transparent;
  border-top-color: var(--pink);
  border-bottom: 0;
  border-left-width: 6px;
}
</style>
