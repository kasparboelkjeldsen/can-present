<script setup>
// Section opener in Kraftvaerk red: a number, the section title and the diagonal drawing in.
// A whole scene: <SectionOpener n="02" title="Samarbejde & Leverance" /> as a scene's root.
import DiagonalLine from './DiagonalLine.vue'

defineProps({ n: String, title: String })
</script>

<template>
  <div class="slide slide--red section-opener">
    <DiagonalLine :x1="1180" :y1="1080" :x2="1920" :y2="440" :delay="500" />
    <span v-if="n" class="n rise">{{ n }}</span>
    <h1 class="h1 rise" style="--d: 1">{{ title }}</h1>
  </div>
</template>

<style scoped>
.section-opener { justify-content: center; gap: 30px; }
.n { font: 400 64px var(--serif); position: relative; z-index: 2; }
.h1 { position: relative; z-index: 2; max-width: 1300px; }
</style>
