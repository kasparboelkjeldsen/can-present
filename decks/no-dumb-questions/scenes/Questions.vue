<script setup>
// The practical payoff for someone in a decision group: the questions worth asking. steps: 5.
import Step from '@engine/Step.vue'
</script>

<template>
  <div class="slide slide--light questions">
    <span class="kicker">for the decision group</span>
    <h2 class="h2 rise">Good questions to ask</h2>
    <ol>
      <Step :at="1" tag="li" anim="left"><b>Where does our code go?</b> The box, or a cloud API, and on what terms?</Step>
      <Step :at="2" tag="li" anim="left"><b>Model and harness are separate choices.</b> Which of each, and can we swap?</Step>
      <Step :at="3" tag="li" anim="left"><b>How does the agent know it's done?</b> Tests, builds, checks.</Step>
      <Step :at="4" tag="li" anim="left"><b>What may it do without asking?</b> Edits, commands, pushing code.</Step>
      <Step :at="5" tag="li" anim="left"><b>Who reviews what it makes?</b></Step>
    </ol>
  </div>
</template>

<style scoped>
ol { display: flex; flex-direction: column; gap: 26px; margin: 16px 0 0; padding: 0; list-style: none; counter-reset: q; }
li { position: relative; padding-left: 90px; font-size: 44px; line-height: 1.3; counter-increment: q; }
li::before {
  content: counter(q);
  position: absolute;
  left: 0;
  top: -2px;
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: var(--sun);
  color: var(--night);
  font: 800 34px var(--sans);
}
li b { font-weight: 800; }
</style>
