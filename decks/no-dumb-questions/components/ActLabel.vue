<script setup>
// An act's name in giant letters, only shown from far away (the overview): <Detail :until>. It
// covers the card in the slide's own background, so the overview reads as four labelled rows.
import Detail from '@engine/components/Detail.vue'
defineProps({ n: { type: String, required: true }, name: { type: String, required: true } })
</script>

<template>
  <Detail class="act-label" :until="0.22" data-audit="ignore">
    <span class="act-n">{{ n }}</span>
    <span class="act-name">{{ name }}</span>
  </Detail>
</template>

<style scoped>
.act-label {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: inherit;
  background-color: var(--night);
  color: var(--sun);
  text-transform: uppercase;
}
.act-n { font: 800 200px/1 var(--sans); }
.act-name { font: 800 230px/1 var(--sans); letter-spacing: -0.03em; white-space: nowrap; }
</style>
