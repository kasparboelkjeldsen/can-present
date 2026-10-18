<script setup>
// Thank you, DSA: while it's on stage every other card orbits it (formation in deck.js). The click
// (formation until: 1) sends the cards home and the camera in on the card, which floods with our
// green: the green that turns out to be inside the "1" of the next scene (OneMore.vue).
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import DsaLogo from '../components/DsaLogo.vue'

const { step } = useStep()
const green = computed(() => step.value >= 1)
</script>

<template>
  <div class="slide slide--dark thank-dsa no-mark" :class="{ green }">
    <div class="content">
      <h1 class="h1 big rise">Thank you, <span class="accent">DSA</span>.</h1>
      <p class="line rise" style="--d: 2">for trusting me with your code and your production,</p>
      <p class="line rise" style="--d: 3">even for a meetup talk.</p>
      <div class="logo-card fade-in" style="--d: 6"><DsaLogo :height="96" /></div>
    </div>
  </div>
</template>

<style scoped>
.thank-dsa { align-items: center; justify-content: center; text-align: center; transition: background-color 1.4s ease 0.3s; }
.content { display: flex; flex-direction: column; align-items: center; gap: 26px; transition: opacity 0.7s, transform 0.9s var(--ease-out); }
.big { font-size: 230px; line-height: 1; margin: 0 0 30px; }
.accent { color: var(--k-green); }
.line { margin: 0; font: 700 64px/1.15 var(--sans); }
.logo-card { margin-top: 40px; padding: 30px 44px; border-radius: var(--radius); background: var(--k-sand); }

/* the click: the words step back and the card floods with green */
.green { background-color: var(--k-green); }
.green .content { opacity: 0; transform: scale(0.94); }
</style>

<style>
/* flooded green, the card sits in the "1" of the next scene: no card shadow or corners to give it away */
.scene:has(> * .thank-dsa.green), .scene:has(.thank-dsa.green) { box-shadow: none !important; border-radius: 0 !important; }
</style>
