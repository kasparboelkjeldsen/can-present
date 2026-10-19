<script setup>
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import Shot from '@engine/components/Shot.vue'

const { step } = useStep()
const H = 915 // screenshot height in px; field rows measured on it
const SHOT_W = 1190 // the window's width on the card; the screenshot is 2000 × 915
const BODY_H = (H / 2000) * SHOT_W
const ZOOM = 3 // inside the window, on each highlight: the labels and values become readable
const PAD = 60 // card px of white left of the screenshot when zoomed: room for the number badge
const items = [
  { text: 'Origins: one component, many sites', y: 180, h: 54 },
  { text: 'CSS variables', y: 392, h: 66 },
  { text: 'Inline style', y: 726, h: 66 },
  { text: 'Classes: borrow their styling system', y: 642, h: 52 },
  { text: 'Which jobs: per-partner job groups', y: 327, h: 52 },
  { text: 'Language: Danish for now, built for more', y: 265, h: 52 },
  { text: 'On / off', y: 818, h: 32, w: 22 },
]
// steps 1–7 zoom into one field each (scrolling the page to it); step 8 zooms back out on the full list
const OUT = items.length + 1
const shown = (i) => step.value >= i + 1
const done = computed(() => step.value >= OUT)
const current = (i) => step.value === i + 1
const hl = (it) => ({ top: (it.y / H) * 100 + '%', height: (it.h / H) * 100 + '%', width: (it.w ?? 98) + '%' })
// the zoom inside the window: the field's centre moves to the middle, clamped to the page's edges
const view = computed(() => {
  const it = items[step.value - 1]
  if (!it || done.value) return { '--ts-z': 1, '--ts-x': '0px', '--ts-y': '0px' }
  const c = ((it.y + it.h / 2) / H) * BODY_H
  const y = Math.min(0, Math.max(BODY_H - BODY_H * ZOOM, BODY_H / 2 - c * ZOOM))
  return { '--ts-z': ZOOM, '--ts-x': PAD + 'px', '--ts-y': y + 'px' }
})
</script>

<template>
  <div class="slide slide--grey section">
    <div class="kicker">The remote control</div>
    <div class="row">
      <div class="shot-wrap">
        <Shot src="/shots/backoffice-web-komponenter.png" frame="window" :width="SHOT_W">
          <!-- a second copy of the page over the first (on a white backdrop that hides the first), which
               zooms and scrolls inside the window -->
          <div class="backdrop" />
          <div class="zoomer" :style="view">
            <img src="/shots/backoffice-web-komponenter.png" alt="" />
            <div
              v-for="(it, i) in items"
              :key="i"
              class="hl"
              :class="{ on: shown(i), now: current(i) || done }"
              :style="hl(it)"
            ><b>{{ i + 1 }}</b></div>
          </div>
        </Shot>
      </div>
      <ol class="callouts">
        <li v-for="(it, i) in items" :key="i" :class="{ on: shown(i), now: current(i) || done }">
          <b>{{ i + 1 }}</b><span>{{ it.text }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.section { padding: 90px 100px; }
.row { flex: 1; display: flex; align-items: center; gap: 50px; position: relative; z-index: 2; }
.shot-wrap { transform: rotate(-1.5deg); flex: none; }
.is-active .shot-wrap { animation: in-left 1s var(--ease-out) 0.15s both; }
@keyframes in-left { from { opacity: 0; transform: translateX(-400px) rotate(-5deg); } }

/* registered, so the zoom, the scroll and the counter-scaled borders/badges all glide together */
@property --ts-z { syntax: '<number>'; inherits: true; initial-value: 1; }
@property --ts-x { syntax: '<length>'; inherits: false; initial-value: 0px; }
@property --ts-y { syntax: '<length>'; inherits: false; initial-value: 0px; }
.zoomer {
  position: absolute;
  inset: 0;
  background: #fff;
  transform-origin: 0 0;
  transform: translate(var(--ts-x), var(--ts-y)) scale(var(--ts-z));
  transition: --ts-z 0.9s cubic-bezier(0.65, 0, 0.35, 1), --ts-x 0.9s cubic-bezier(0.65, 0, 0.35, 1), --ts-y 0.9s cubic-bezier(0.65, 0, 0.35, 1);
}
.backdrop { position: absolute; inset: 0; background: #fff; }
.zoomer img { display: block; width: 100%; height: 100%; }

.hl {
  position: absolute;
  left: 1%;
  border: calc(4px / var(--ts-z)) solid var(--k-dark);
  border-radius: 8px;
  background: rgba(195, 242, 64, 0.18);
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 0.4s, transform 0.5s var(--ease-spring);
}
.hl b {
  position: absolute;
  /* zoomed in, it moves out of the box, so it doesn't cover the field's label */
  left: calc(-22px - 10px * (var(--ts-z) - 1));
  top: 50%;
  translate: 0 -50%;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--k-dark);
  color: var(--k-green);
  font: 700 22px var(--sans);
  /* zoomed in, the badge grows to 2× rather than the full zoom (anchored at its right edge) */
  transform-origin: 100% 50%;
  scale: calc((1 + 0.5 * (var(--ts-z) - 1)) / var(--ts-z));
}
.hl.on { opacity: 0.35; transform: none; }
.hl.now { opacity: 1; }

.callouts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 20px; }
.callouts li {
  display: flex;
  align-items: center;
  gap: 18px;
  font: 700 30px/1.2 var(--sans);
  opacity: 0;
  transform: translateX(40px);
  transition: opacity 0.5s, transform 0.6s var(--ease-out);
}
.callouts li b {
  flex: none;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--k-dark);
  color: var(--k-green);
  font-size: 24px;
}
.callouts li.on { opacity: 0.45; transform: none; }
.callouts li.now { opacity: 1; }
</style>
