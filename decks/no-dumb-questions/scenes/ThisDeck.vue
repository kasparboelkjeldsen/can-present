<script setup>
// A concrete example of spec-driven work: this deck itself.
const flow = [
  { t: 'A spec', sub: 'scene-description.md: every card, in words' },
  { t: 'An agent', sub: 'wrote the scenes from it' },
  { t: 'Checks', sub: 'npm run check and a layout audit said what was wrong' },
  { t: 'The loop', sub: 'it fixed them, ran the checks again' },
  { t: 'A human', sub: 'read it, and asked for changes' },
]
</script>

<template>
  <div class="slide slide--light this-deck">
    <span class="kicker">for example</span>
    <h2 class="h2 rise">This explainer was built that way</h2>
    <ol class="flow">
      <li v-for="(f, i) in flow" :key="f.t" class="rise" :style="{ '--d': 2 + i * 2 }">
        <span class="n">{{ i + 1 }}</span><b>{{ f.t }}</b><span class="sub">{{ f.sub }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.flow { display: flex; flex-direction: column; gap: 22px; margin: 16px 0 0; padding: 0; list-style: none; }
.flow li { display: grid; grid-template-columns: 76px 300px 1fr; align-items: center; gap: 24px; font-size: 42px; }
.n { display: grid; place-items: center; width: 70px; height: 70px; border-radius: 50%; background: var(--night); color: var(--sun); font: 800 36px var(--sans); }
.flow b { font-weight: 800; }
.sub { color: var(--muted); }
</style>
