<script setup>
// The finale (deck.js: formation: { shape: 'ring', spin: 60 }). While it's on stage, every other card
// swings into an orbit round it, so it's read from far away: the camera frames the whole ring and
// this card is about a third of the screen wide. Its text is sized for that (about 0.36×), and the
// goodbye line rises once the cards have landed (~2.3 s after arriving).
</script>

<template>
  <div class="slide slide--dark thanks">
    <h1 class="h1 rise">Thanks<span class="accent">!</span></h1>
    <p class="bye">Every scene in this deck just came back to&nbsp;say&nbsp;goodbye.</p>
    <p class="lead rise" style="--d: 2">Copy <code>decks/example</code>, or run <code>npm run new-deck -- my-talk</code>.</p>
  </div>
</template>

<style scoped>
.thanks { justify-content: center; align-items: center; text-align: center; gap: 56px; }
.h1 { font-size: 170px; }
.bye { margin: 0; max-width: 1500px; font: 700 72px/1.15 var(--sans); color: var(--deck-accent); }
.lead { font-size: 50px; }
.is-active .bye { animation: rise 0.9s var(--ease-out) 2.3s both; }
</style>
