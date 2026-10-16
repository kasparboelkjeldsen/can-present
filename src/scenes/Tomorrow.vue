<script setup>
import Step from '../engine/Step.vue'
import DiagonalLine from '../components/DiagonalLine.vue'
</script>

<template>
  <div class="slide slide--grey tomorrow">
    <DiagonalLine />
    <h1 class="h1 rise">Today it's a carousel.</h1>
    <Step :at="1" anim="up" class="line">Umbraco also decides which JavaScript it serves.</Step>
    <Step :at="2" anim="up" class="line strong">Tomorrow: your DSA membership, on their site.</Step>
  </div>
</template>

<style scoped>
.tomorrow { justify-content: center; gap: 44px; }
.h1 { margin-bottom: 20px; }
.line { font: 400 50px/1.3 var(--sans); position: relative; z-index: 2; }
.strong { font-weight: 700; }
</style>
