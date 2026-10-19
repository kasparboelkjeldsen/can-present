<script setup>
import Step from '@engine/Step.vue'

const cards = [
  { h: 'Origin is a claim, not a credential.', p: 'Fine for public job listings. Not fine for anything else.' },
  { h: 'Our trust boundary includes their WordPress plugins.', p: "…which is why there's no AllowCredentials." },
  { h: 'Crawlers lie.', p: "Fake Baidu and Google referers. Page views only count from the component's own origins." },
  { h: 'One wrong origin = thousands of warnings.', p: 'Preflight + request, per component, per visitor. Logs are throttled to once per 15 min.' },
]
</script>

<template>
  <div class="slide slide--red danger">
    <div class="kicker">The dangerous bits</div>
    <div class="grid">
      <Step v-for="(c, i) in cards" :key="i" :at="i + 1" anim="pop" class="card">
        <div class="h">{{ c.h }}</div>
        <div class="p">{{ c.p }}</div>
      </Step>
    </div>
  </div>
</template>

<style scoped>
.danger { padding: 90px 120px 130px; }
.grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 36px; margin-top: 44px; position: relative; z-index: 2; }
.card { background: var(--k-sand); display: flex; flex-direction: column; gap: 18px; padding: 40px 48px; }
.h { font: 400 54px/1.1 var(--serif); }
.p { font: 400 34px/1.35 var(--sans); opacity: 0.85; }
</style>
