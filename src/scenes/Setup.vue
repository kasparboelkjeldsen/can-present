<script setup>
import Step from '../engine/Step.vue'
import UmbracoMark from '../components/UmbracoMark.vue'
import WordPressMark from '../components/WordPressMark.vue'
</script>

<template>
  <div class="slide slide--sand">
    <div class="blob blob--pink" style="width: 1200px; height: 1200px; right: -400px; top: -500px" />
    <div class="kicker">The situation</div>
    <h2 class="h2" style="margin-top: 40px">Everybody loves their CMS.</h2>

    <div class="cards">
      <Step :at="1" anim="pop" class="card">
        <WordPressMark :size="110" />
        <div class="who">The client</div>
        <div class="quote">“We <em>love</em> our WordPress. Marketing knows it. Don't touch it.”</div>
      </Step>
      <Step :at="2" anim="pop" class="card card--blue">
        <UmbracoMark :size="110" bg="#fff" fg="var(--u-blue)" />
        <div class="who">You</div>
        <div class="quote">“We <em>love</em> Umbraco. The content team lives in it.”</div>
      </Step>
      <Step :at="3" anim="pop" class="card card--pink">
        <div class="emoji">💸</div>
        <div class="who">The budget</div>
        <div class="quote">“lol.”</div>
      </Step>
    </div>
  </div>
</template>

<style scoped>
.cards { display: flex; gap: 48px; margin-top: auto; }
.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: 56px 52px;
  min-height: 520px;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: 0 24px 60px rgba(27, 38, 79, 0.12);
}
.card--blue { background: var(--u-blue); color: #fff; }
.card--pink { background: var(--u-pink); color: var(--u-navy); }
.who { font-size: 26px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; }
.quote { font-size: 46px; font-weight: 700; line-height: 1.25; }
.quote em { font-style: italic; color: var(--u-pink-hot); }
.card--blue em { color: var(--u-pink); }
.emoji { font-size: 96px; line-height: 110px; }
.card--pink .quote { font-size: 120px; font-weight: 900; }
</style>
