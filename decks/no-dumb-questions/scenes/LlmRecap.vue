<script setup>
// End of act 1: what an LLM is, and the three consequences that matter later. steps: 3.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--light recap">
    <span class="kicker">so, an LLM is…</span>
    <h2 class="h2 rise">A huge function.<br />Text in, <span class="accent">odds for the next token</span> out.</h2>
    <ul>
      <Step :at="1" tag="li" anim="left">It knows what's in its weights (frozen at training), plus what's in the text you send right now: the <b>context window</b>.</Step>
      <Step :at="2" tag="li" anim="left">It writes what's <b>likely</b>, not what's <b>true</b>. That's where confident nonsense comes from.</Step>
      <Step :at="3" tag="li" anim="left" class="last">And it can't <i>do</i> anything. It can only write text.</Step>
    </ul>
  </div>
</template>

<style scoped>
.recap { justify-content: center; }
ul { display: flex; flex-direction: column; gap: 30px; margin: 20px 0 0; padding: 0; list-style: none; }
li { position: relative; padding-left: 56px; font-size: 44px; line-height: 1.3; max-width: 1500px; }
li::before { content: ''; position: absolute; left: 0; top: 16px; width: 26px; height: 26px; border-radius: 50%; background: var(--sun); }
.last { font-weight: 800; color: var(--accent); }
.last::before { background: var(--pink); }
</style>
