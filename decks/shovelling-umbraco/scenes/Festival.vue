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

const { step } = useStep()
const circled = computed(() => step.value >= 1)

// the speakers: a row under the text, then a ring round the QR code
const D = 120 // portrait diameter
const n = SPEAKERS.length
const row = (i) => ({ x: 960 + (i - (n - 1) / 2) * (D + 24), y: 820 })
const ring = (i) => {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2
  return { x: 960 + 400 * Math.cos(a), y: 540 + 400 * Math.sin(a) }
}
const place = (i) => {
  const p = circled.value ? ring(i) : row(i)
  return { transform: `translate(${p.x - D / 2}px, ${p.y - D / 2}px)`, transitionDelay: `${i * 45}ms`, width: D + 'px', height: D + 'px' }
}
const stemLeft = HOLE.cx - L.stem / 2
</script>

<template>
  <div class="slide festival no-mark" :class="{ circled }" :style="{ '--blue': BLUE }">
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
      <div v-for="(s, i) in SPEAKERS" :key="s.img" class="who" :style="place(i)">
        <img class="rise" :class="{ me: s.me }" :style="{ '--d': 10 + i }" :src="`/speakers/${s.img}`" :alt="s.name" />
      </div>
    </div>

    <div class="qr" :style="{ '--deck-paper': BLUE, '--deck-ink': '#000' }">
      <div class="cap cap--top">Nov 25th Aarhus</div>
      <QrCode :url="URL" :at="1" :size="300" layout="none" />
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
.ring { position: absolute; inset: 0; transform-origin: 960px 540px; }
.who { position: absolute; left: 0; top: 0; transition: transform 1.2s var(--ease-spring, cubic-bezier(0.34, 1.4, 0.64, 1)); }
.who img { display: block; width: 100%; height: 100%; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 4px #000, 0 12px 30px rgba(0, 0, 0, 0.6); }
.who img.me { box-shadow: 0 0 0 6px var(--blue), 0 12px 30px rgba(0, 0, 0, 0.6); }
.circled .ring { animation: turn 60s linear 1.6s infinite; }
.circled .who img { animation: turn 60s linear 1.6s infinite reverse; }
@keyframes turn { to { transform: rotate(360deg); } }

.qr { position: absolute; left: 960px; top: 540px; translate: -50% -50%; }
/* above and below the code, inside the ring; they come in as the last dots land */
.cap { position: absolute; left: 50%; translate: -50% 0; font: 700 50px/1 var(--sans); color: #fff; white-space: nowrap; opacity: 0; transition: opacity 0.6s; }
.cap--top { bottom: calc(100% + 26px); }
.cap--bottom { top: calc(100% + 26px); }
.circled .cap { opacity: 1; transition: opacity 0.8s 1.8s; }
</style>
