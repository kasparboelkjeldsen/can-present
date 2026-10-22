<script setup>
// Tools: the model writes a request, the harness runs it. The diagram (harness.js) builds itself;
// the Harness box holds the `agent-loop` scene. steps: 1.
import Diagram from '@engine/components/Diagram.vue'
import Step from '@engine/Step.vue'
import { harness } from './harness.js'
</script>

<template>
  <div class="slide slide--dark harness">
    <span class="kicker">give it hands</span>
    <h2 class="h2">The model asks. The harness does.</h2>
    <Diagram :diagram="harness" />
    <Step :at="1" anim="fade" class="foot"><p class="lead">The model never touches your disk. It writes a request; <span class="accent">the harness runs it</span>.</p></Step>
  </div>
</template>

<style scoped>
.harness { padding: 70px 80px; gap: 24px; }
.foot { position: absolute; left: 80px; bottom: 44px; }
.foot .lead { font-size: 40px; max-width: none; }
</style>
