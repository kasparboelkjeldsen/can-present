<script setup>
// The last pull-back (an outer layer round "1 more thing", deck.js): the canvas goes black and it's
// the Umbraco DK Festival's look. "1 more thing" was the dot on the i of "speaking" (drawn here, see
// festival.js; a real dot fades in once it's a speck). The click: the words fade, the speakers swing
// from their row into a slowly turning ring, and a QR code to the tickets drops into the middle.
import { computed } from 'vue'
import { useStep } from '@engine/useStep.js'
import Detail from '@engine/components/Detail.vue'
import QrCode from '@engine/components/QrCode.vue'
import { BLUE, URL, LINE1 as L, HOLE, lineTop, SPEAKERS } from './festival.js'

const { step, active, preview } = useStep()
// only while it's on stage (or a thumbnail): punching back in to Thanks, the words and the dot are back
const circled = computed(() => step.value >= 1 && (active.value || preview.value))

// the speakers: a row under the text, then a ring round the QR code
const D = 100 // portrait diameter
const R = 420 // the ring round the QR code (the names hang below, so it reaches the card's bottom edge)
// ... and it's an oval: the ring is stretched sideways (.ring scale), which keeps the names of the
// top portraits (they hang inwards) clear of "Nov 25th Aarhus"; each face undoes the stretch
const OVAL = 1.24
const n = SPEAKERS.length
const row = (i) => ({ x: 960 + (i - (n - 1) / 2) * 160, y: 780 })
const ring = (i) => {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2
  return { x: 960 + R * Math.cos(a), y: 540 + R * Math.sin(a) }
}
const place = (i) => {
  const p = circled.value ? ring(i) : row(i)
  return { transform: `translate(${p.x - D / 2}px, ${p.y - D / 2}px)`, transitionDelay: `${i * 45}ms`, width: D + 'px', height: D + 'px' }
}
const stemLeft = HOLE.cx - L.stem / 2
// first name, then the rest, on two lines
const split = (name) => { const [first, ...rest] = name.split(" "); return [first, rest.join(" ")] }
</script>

<template>
  <div class="slide festival no-mark" :class="{ circled }" :style="{ '--blue': BLUE, '--oval': OVAL }">
    <div class="texts">
      <!-- "I'm speak" ı "ng at": the two halves sit either side of the drawn stem -->
      <div class="l1" :style="{ top: lineTop(L.baseline, L.size) + 'px', fontSize: L.size + 'px', right: 1920 - stemLeft + L.gap + 'px' }">I'm speak</div>
      <div class="stem" :style="{ left: stemLeft + 'px', top: L.baseline - L.xHeight + 'px', width: L.stem + 'px', height: L.xHeight + 'px' }" />
      <div class="l1" :style="{ top: lineTop(L.baseline, L.size) + 'px', fontSize: L.size + 'px', left: stemLeft + L.stem + L.gap + 'px' }">ng at</div>
      <!-- the dot is "1 more thing"; this disc only shows once that's a speck -->
      <Detail class="dot" :until="4" :style="{ left: HOLE.cx - L.dot / 2 + 'px', top: HOLE.cy - L.dot / 2 + 'px', width: L.dot + 'px', height: L.dot + 'px' }" />
      <div class="l2" :style="{ top: lineTop(500, 170) + 'px' }">Umbraco DK Festival</div>
      <div class="l3" :style="{ top: lineTop(620, 72) + 'px' }">25th of November</div>
    </div>

    <div class="ring">
      <div class="spin">
      <div v-for="(s, i) in SPEAKERS" :key="s.img" class="who" :style="place(i)">
        <div class="face rise" :style="{ '--d': 10 + i }">
          <img :class="{ me: s.me }" :src="`/speakers/${s.img}`" :alt="s.name" />
          <div class="name"><span v-for="part in split(s.name)" :key="part">{{ part }}</span></div>
        </div>
      </div>
      </div>
    </div>

    <div class="qr" :style="{ '--deck-paper': BLUE, '--deck-ink': '#000' }">
      <div class="cap cap--top">Nov 25th Aarhus</div>
      <QrCode :url="URL" :at="1" :size="250" layout="none" />
      <div class="cap cap--bottom">Get your ticket</div>
    </div>
  </div>
</template>

<style scoped>
.festival { padding: 0; background: #000; color: #fff; font-family: var(--sans); }
.texts { transition: opacity 0.7s; }
.circled .texts { opacity: 0; }
.l1, .l2, .l3 { position: absolute; margin: 0; font-weight: 700; line-height: 1; white-space: nowrap; }
.l2, .l3 { left: 0; right: 0; text-align: center; }
.l2 { font-size: 170px; color: var(--blue); letter-spacing: -0.01em; }
.l3 { font-size: 72px; }
.stem { position: absolute; border-radius: 3px; background: #fff; }
.dot { position: absolute; border-radius: 50%; background: #fff; }

/* the speakers: each one glides from the row to the ring; then the ring turns, the faces stay upright */
.ring { position: absolute; inset: 0; transform-origin: 960px 540px; transition: scale 1.2s var(--ease-out); }
.circled .ring { scale: var(--oval) 1; }
.who { position: absolute; left: 0; top: 0; transition: transform 1.2s var(--ease-spring, cubic-bezier(0.34, 1.4, 0.64, 1)); }
.face { position: relative; width: 100%; height: 100%; transform-origin: 50% 50%; transition: scale 1.2s var(--ease-out); }
.circled .face { scale: calc(1 / var(--oval)) 1; }
.who img { display: block; width: 100%; height: 100%; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 4px #000, 0 12px 30px rgba(0, 0, 0, 0.6); }
.who img.me { box-shadow: 0 0 0 6px var(--blue), 0 12px 30px rgba(0, 0, 0, 0.6); }
/* the stretch is outside the turn, so the oval stays put while the faces go round it */
.spin { position: absolute; inset: 0; transform-origin: 960px 540px; }
.circled .spin { animation: turn 60s linear 1.6s infinite; }
.circled .who .face { animation: turn 60s linear 1.6s infinite reverse; }
/* under the portrait, kept upright with it */
.name { position: absolute; left: 50%; top: calc(100% + 10px); translate: -50% 0; display: flex; flex-direction: column; align-items: center; font: 400 26px/1.1 var(--sans); color: #fff; white-space: nowrap; }
@keyframes turn { to { rotate: 360deg; } }

.qr { position: absolute; left: 960px; top: 540px; translate: -50% -50%; transition: opacity 0.5s; }
.festival:not(.circled) .qr { opacity: 0; }
/* above and below the code, inside the ring; they come in as the last dots land */
.cap { position: absolute; left: 50%; translate: -50% 0; font: 700 44px/1 var(--sans); color: #fff; white-space: nowrap; opacity: 0; transition: opacity 0.6s; }
.cap--top { bottom: calc(100% + 20px); }
.cap--bottom { top: calc(100% + 20px); }
.circled .cap { opacity: 1; transition: opacity 0.8s 1.8s; }
</style>

<style>
/* while the ring is up, the layers inside the dot ("1 more thing" and the green card) are gone:
   the dot itself has faded with the words, so nothing should be left there */
.world:has(.festival.circled) .scene:has(.one-more),
.world:has(.festival.circled) .scene:has(.thank-dsa) { opacity: 0; transition: opacity 0.6s; }
</style>
