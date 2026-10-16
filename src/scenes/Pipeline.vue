<script setup>
import { computed } from 'vue'
import { useStep } from '../engine/useStep.js'
import Step from '../engine/Step.vue'
import UmbracoMark from '../components/UmbracoMark.vue'
import WordPressMark from '../components/WordPressMark.vue'

const { step } = useStep()
const s = (n) => computed(() => step.value >= n)
const left = s(1)
const right = s(2)
const flowing = s(3)

// The empty frame in the middle is exactly where the "code" scene is nested in the world
// (scene at scale 0.2 → 384×216, centred on 960,600). Keep these in sync with deck.js.
const FRAME = { x: 960 - 192, y: 600 - 108, w: 384, h: 216 }
</script>

<template>
  <div class="slide slide--sand pipeline">
    <div class="kicker">How it works</div>
    <h2 class="h2" style="margin-top: 40px">One very specific shovel.</h2>

    <svg class="art" viewBox="0 0 1920 1080">
      <!-- connectors -->
      <path id="pipe-l" class="pipe" :class="{ on: left }" d="M450 600 C 560 600, 640 600, 760 600" />
      <path id="pipe-r" class="pipe" :class="{ on: right }" d="M1160 600 C 1280 600, 1360 600, 1470 600" />

      <g v-if="flowing">
        <g v-for="i in 4" :key="'l' + i">
          <text class="packet" text-anchor="middle" dy="10">{ }
            <animateMotion :begin="`${i * 0.45}s`" dur="1.8s" repeatCount="indefinite" path="M450 600 C 560 600, 640 600, 760 600" />
          </text>
        </g>
        <g v-for="i in 4" :key="'r' + i">
          <rect class="packet-block" x="-18" y="-12" width="36" height="24" rx="6">
            <animateMotion :begin="`${0.9 + i * 0.45}s`" dur="1.8s" repeatCount="indefinite" path="M1160 600 C 1280 600, 1360 600, 1470 600" />
          </rect>
        </g>
      </g>

      <!-- the frame the nested scene lives in -->
      <rect class="frame" :x="FRAME.x - 14" :y="FRAME.y - 14" :width="FRAME.w + 28" :height="FRAME.h + 28" rx="26" />
      <text class="frame-label" x="960" :y="FRAME.y - 44" text-anchor="middle">🪏 the shovel</text>
    </svg>

    <Step :at="1" anim="left" class="node node--l">
      <div class="disc"><UmbracoMark :size="200" /></div>
      <div class="name">Umbraco</div>
      <div class="chip">Delivery API · JSON</div>
    </Step>

    <Step :at="2" anim="right" class="node node--r">
      <div class="disc"><WordPressMark :size="200" /></div>
      <div class="name">WordPress</div>
      <div class="chip">their theme · their plugins</div>
    </Step>

    <Step :at="3" anim="up" class="caption">
      No migration. No iframe. Just… <b>shovelling</b>.
    </Step>
  </div>
</template>

<style scoped>
.art { position: absolute; inset: 0; width: 100%; height: 100%; }
.pipe {
  fill: none;
  stroke: var(--u-navy);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 340;
  stroke-dashoffset: 340;
  transition: stroke-dashoffset 1s var(--ease-out) 0.2s;
}
.pipe.on { stroke-dashoffset: 0; }
.packet { font: 900 34px var(--mono); fill: var(--u-blue); }
.packet-block { fill: var(--wp-blue); }
.frame { fill: #fff; stroke: var(--u-navy); stroke-width: 6; stroke-dasharray: 18 14; }
.frame-label { font: 900 34px var(--font); fill: var(--u-navy); }

.node {
  position: absolute;
  top: 600px;
  width: 380px;
  margin-top: -130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.node--l { left: 140px; }
.node--r { left: 1400px; }
.disc { width: 260px; height: 260px; display: grid; place-items: center; border-radius: 50%; background: #fff; box-shadow: 0 20px 50px rgba(27, 38, 79, 0.15); }
.name { font-size: 48px; font-weight: 900; margin-top: 10px; }
.chip { white-space: nowrap; font:700 22px var(--mono); padding: 8px 18px; border-radius: 999px; background: var(--u-navy); color: var(--u-pink); }

.caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 90px;
  text-align: center;
  font-size: 48px;
}
.caption b { color: var(--u-blue); font-weight: 900; }
</style>
