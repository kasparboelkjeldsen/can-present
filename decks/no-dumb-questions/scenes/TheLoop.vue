<script setup>
// The agent loop as a picture: plan → edit → check → read the result, a dot going round.
// The point: the check is what makes it work.
const stations = [
  { t: 'Plan', a: -90 },
  { t: 'Edit', a: 0 },
  { t: 'Check', a: 90, hot: true },
  { t: 'Read the result', a: 180 },
]
const R = 220
const pos = (a) => ({ x: 300 + R * Math.cos((a * Math.PI) / 180), y: 300 + R * Math.sin((a * Math.PI) / 180) })
</script>

<template>
  <div class="slide slide--dark the-loop">
    <div class="copy">
      <span class="kicker">the loop</span>
      <h2 class="h2 rise">The check is the secret</h2>
      <p class="lead rise" style="--d: 1">Not a smarter model: <span class="accent">a check</span>. A compiler, tests, a linter. Something that tells the agent it's wrong, so it can try again.</p>
      <p class="lead rise muted" style="--d: 2">No check, and it stops when it <i>thinks</i> it's done.</p>
    </div>
    <svg class="art" viewBox="0 0 600 600" aria-hidden="true">
      <circle cx="300" cy="300" :r="R" class="track" />
      <g class="runner"><circle :cx="300" :cy="300 - R" r="18" /></g>
      <g v-for="s in stations" :key="s.t" class="station" :class="{ hot: s.hot }">
        <circle :cx="pos(s.a).x" :cy="pos(s.a).y" r="58" />
      </g>
    </svg>
    <!-- labels as HTML (crisper at deck zoom), placed over the svg's stations -->
    <span v-for="s in stations" :key="s.t" class="label" :class="{ hot: s.hot }" :style="{ left: 1180 + pos(s.a).x * (660 / 600) + 'px', top: 210 + pos(s.a).y * (660 / 600) + 'px' }">{{ s.t }}</span>
  </div>
</template>

<style scoped>
.the-loop { flex-direction: row; align-items: center; }
.copy { display: flex; flex-direction: column; gap: 34px; width: 960px; flex: none; }
.art { position: absolute; left: 1180px; top: 210px; width: 660px; height: 660px; overflow: visible; }
.track { fill: none; stroke: var(--night-2); stroke-width: 26; }
.station circle { fill: var(--night-2); stroke: var(--paper); stroke-width: 5; }
.station.hot circle { fill: var(--mint); stroke: none; }
.runner { transform-origin: 300px 300px; animation: spin 6s linear infinite; }
.runner circle { fill: var(--sun); }
@keyframes spin { to { transform: rotate(360deg); } }
.label {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 6px 18px;
  border-radius: 999px;
  background: var(--night);
  font: 800 34px var(--sans);
  white-space: nowrap;
}
.label.hot { background: var(--mint); color: var(--night); }
</style>
