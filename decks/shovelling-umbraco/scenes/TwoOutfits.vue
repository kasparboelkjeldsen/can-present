<script setup>
// Same component, two outfits: the job carousel in both partner sites, in their browsers. Each
// click lifts one site's carousel out of its screenshot: a copy of that region of the same image,
// laid exactly over it, slides to the middle of the card, straightens up, grows and casts a shadow,
// while both browsers dim behind it. steps: 2 (1: jordemoderforeningen.dk, 2: radiograf.dk).
//
// The boxes are the "Se ledige stillinger" component in the screenshots' own pixels (1320 wide),
// measured from the PNGs. If a screenshot is retaken, re-measure its box.
import { ref, onMounted } from 'vue'
import Shot from '@engine/components/Shot.vue'
import { useStep } from '@engine/useStep.js'
import { asset } from '@engine/asset.js'
import DiagonalLine from '../components/DiagonalLine.vue'

const SHOT_W = 780 // <Shot :width>
const IMG_W = 1320 // the screenshots' pixel width
const BAR = 52 // <Shot>'s browser bar sits above the image
const k = SHOT_W / IMG_W
const TARGET = { x: 960, y: 590 } // where a lifted carousel goes, in the card's 1920×1080 space

const SIDES = [
  { src: '/shots/jordemoderforeningen.png', url: 'jordemoderforeningen.dk', angle: 2.5, box: { x: 233, y: 499, w: 859, h: 381 }, width: 1400 },
  { src: '/shots/radiograf.png', url: 'radiograf.dk', angle: -2.5, box: { x: 46, y: 552, w: 1230, h: 384 }, width: 1640 },
]

const { step } = useStep()
const root = ref(null)
const figs = ref([])
const lifts = ref([])
const ready = ref(false) // the lift maths reads the layout, so it waits for the first mount
onMounted(() => (ready.value = true))

// layout position (offsets ignore transforms, so the canvas zoom and the tilt don't matter)
const offset = (el) => {
  let x = 0, y = 0
  while (el && el !== root.value) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent }
  return { x, y }
}

const base = (s) => ({
  left: s.box.x * k + 'px',
  top: BAR + s.box.y * k + 'px',
  width: s.box.w * k + 'px',
  height: s.box.h * k + 'px',
  backgroundImage: `url(${asset(s.src)})`,
  backgroundSize: `${SHOT_W}px auto`,
  backgroundPosition: `${-s.box.x * k}px ${-s.box.y * k}px`,
})

/** The transform that takes lift i from its spot in the tilted figure to TARGET, upright and big. */
function lifted(i) {
  const s = SIDES[i], fig = figs.value[i], lift = lifts.value[i]
  if (!ready.value || !fig || !lift) return 'none'
  const f = offset(fig), l = offset(lift)
  const F = { x: f.x + fig.offsetWidth / 2, y: f.y + fig.offsetHeight / 2 } // the figure turns round its centre
  const C = { x: l.x + lift.offsetWidth / 2, y: l.y + lift.offsetHeight / 2 }
  // the lift moves inside the figure's tilted frame: undo the tilt on the way to the target
  const a = (-s.angle * Math.PI) / 180
  const v = { x: TARGET.x - F.x, y: TARGET.y - F.y }
  const d = {
    x: v.x * Math.cos(a) - v.y * Math.sin(a) - (C.x - F.x),
    y: v.x * Math.sin(a) + v.y * Math.cos(a) - (C.y - F.y),
  }
  return `translate(${d.x}px, ${d.y}px) rotate(${-s.angle}deg) scale(${s.width / (s.box.w * k)})`
}
</script>

<template>
  <div ref="root" class="slide slide--grey outfits" :class="{ 'is-lifting': step >= 1 }">
    <DiagonalLine :x1="1560" :y1="210" :x2="1810" :y2="0" />
    <div class="kicker">Same component, two outfits</div>
    <div class="row">
      <!-- literal steps (step === 1, step >= 2) so `npm run check` can count the builds -->
      <figure :ref="(el) => (figs[0] = el)" class="side left" :class="{ 'is-up': step === 1 }">
        <Shot :src="SIDES[0].src" :url="SIDES[0].url" :width="SHOT_W"><div class="dim" /></Shot>
        <div :ref="(el) => (lifts[0] = el)" class="lift" :class="{ 'is-up': step === 1 }" :style="{ ...base(SIDES[0]), transform: step === 1 ? lifted(0) : 'none' }" />
        <figcaption>jordemoderforeningen.dk</figcaption>
      </figure>
      <figure :ref="(el) => (figs[1] = el)" class="side right" :class="{ 'is-up': step >= 2 }">
        <Shot :src="SIDES[1].src" :url="SIDES[1].url" :width="SHOT_W"><div class="dim" /></Shot>
        <div :ref="(el) => (lifts[1] = el)" class="lift" :class="{ 'is-up': step >= 2 }" :style="{ ...base(SIDES[1]), transform: step >= 2 ? lifted(1) : 'none' }" />
        <figcaption>radiograf.dk</figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.outfits { padding-top: 90px; padding-bottom: 80px; }
.row { flex: 1; display: flex; align-items: center; justify-content: center; gap: 70px; position: relative; z-index: 2; }
.side { position: relative; margin: 0; display: flex; flex-direction: column; align-items: center; gap: 30px; }
.side.is-up { z-index: 3; } /* the lifted carousel goes over the other browser */
.left { transform: rotate(2.5deg); }
.right { transform: rotate(-2.5deg); }
.is-active .left { animation: in-left 1s var(--ease-out) 0.2s both; }
.is-active .right { animation: in-right 1s var(--ease-out) 0.35s both; }
@keyframes in-left { from { opacity: 0; transform: translateX(-500px) rotate(-6deg); } }
@keyframes in-right { from { opacity: 0; transform: translateX(500px) rotate(6deg); } }
figcaption { font: 700 38px var(--sans); transition: opacity 0.5s; }
.is-lifting figcaption { opacity: 0.35; }

/* both browsers dim while a carousel is out */
.dim { position: absolute; inset: 0; background: var(--k-dark); opacity: 0; transition: opacity 0.5s; pointer-events: none; }
.is-lifting .dim { opacity: 0.55; }

/* the carousel: invisible on top of its own pixels until its click, then it springs out. Going
   home it lands first and only then disappears, so there's never a gap in the screenshot */
.lift {
  position: absolute;
  border-radius: 6px;
  background-repeat: no-repeat;
  opacity: 0;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  transition: transform 0.75s var(--ease-out), box-shadow 0.75s, border-radius 0.75s, opacity 0s 0.75s;
}
.lift.is-up {
  opacity: 1;
  border-radius: 4px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.9s var(--ease-spring), box-shadow 0.9s, border-radius 0.9s, opacity 0s;
}
</style>
