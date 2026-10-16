<script setup>
// The map. Three nodes have empty "slots" — the dive scenes (8–12) are placed in them on the canvas.
import { computed } from 'vue'
import { useStep } from '../engine/useStep.js'
import Step from '../engine/Step.vue'
import UmbracoMark from '../components/UmbracoMark.vue'
import WordPressMark from '../components/WordPressMark.vue'
import { NODES, SLOTS } from './map/geometry.js'

const { step } = useStep()
const at = (n) => computed(() => step.value >= n)
const s1 = at(1), s2 = at(2), s3 = at(3), s4 = at(4)

const box = (n) => ({ left: n.x + 'px', top: n.y + 'px', width: n.w + 'px', height: n.h + 'px' })
const slot = (s) => ({ left: s.cx - s.w / 2 + 'px', top: s.cy - s.h / 2 + 'px', width: s.w + 'px', height: s.h + 'px' })

const LEFT = 'M1350 676 H920'
const RIGHT = 'M920 734 H1350'
const packets = [
  { label: 'who am I?', path: LEFT, begin: 0 },
  { label: 'what do I wear?', path: LEFT, begin: 1.2 },
  { label: 'jobs', path: RIGHT, begin: 2.4 },
]
</script>

<template>
  <div class="slide slide--sand map">
    <div class="kicker">How it works</div>

    <svg class="wires" viewBox="0 0 1920 1080">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--k-dark)" />
        </marker>
      </defs>
      <!-- partner → dsa.jobs -->
      <path class="wire" :class="{ on: s1 }" d="M1720 600 H1596" marker-end="url(#arr)" />
      <text class="wlabel" :class="{ on: s1 }" x="1655" y="548" text-anchor="middle"><tspan x="1655">one script</tspan><tspan x="1655" dy="26">tag</tspan></text>
      <!-- dsa.jobs ↔ ewcp -->
      <path class="wire" :class="{ on: s2 }" d="M1350 676 H1236" marker-end="url(#arr)" />
      <path class="wire" :class="{ on: s2 }" d="M1230 734 H1344" marker-end="url(#arr)" />
      <!-- ewcp ↔ umbraco -->
      <path class="wire" :class="{ on: s3 }" d="M1050 676 H926" marker-end="url(#arr)" />
      <path class="wire" :class="{ on: s3 }" d="M920 734 H1044" marker-end="url(#arr)" />
      <!-- backoffice → umbraco -->
      <path class="wire" :class="{ on: s3 }" d="M660 325 V414" marker-end="url(#arr)" />
      <text class="wlabel" :class="{ on: s3 }" x="680" y="380">config</text>
      <!-- umbraco ↔ job portal -->
      <path class="wire" :class="{ on: s4 }" d="M296 600 H394" marker-start="url(#arr)" marker-end="url(#arr)" />
    </svg>

    <Step :at="4" anim="left" class="node portal" :style="box(NODES.portal)">
      <div class="name">Job portal API</div>
    </Step>
    <Step :at="4" anim="up" class="note" :style="{ left: NODES.portal.x + 'px', top: NODES.portal.y + NODES.portal.h + 24 + 'px' }">
      cached 5 min,<br />key stays server-side
    </Step>

    <Step :at="3" anim="pop" class="node umbraco" :style="box(NODES.umbraco)">
      <div class="head">
        <UmbracoMark :size="54" bg="#fff" fg="var(--umbraco)" />
        <div>
          <div class="name">Umbraco</div>
          <div class="sub">same instance as umbraco.dsa.dk</div>
        </div>
      </div>
      <div class="slot" :style="slot({ ...SLOTS.wear, cx: SLOTS.wear.cx - NODES.umbraco.x, cy: SLOTS.wear.cy - NODES.umbraco.y })" />
      <div class="slot" :style="slot({ ...SLOTS.cache, cx: SLOTS.cache.cx - NODES.umbraco.x, cy: SLOTS.cache.cy - NODES.umbraco.y })" />
    </Step>

    <Step :at="3" anim="down" class="node backoffice" :style="box(NODES.backoffice)">
      <div class="name">Backoffice: web-komponenter</div>
    </Step>

    <Step :at="2" anim="pop" class="node ewcp" :style="box(NODES.ewcp)">
      <div class="name">ewcp.dsa.dk</div>
      <div class="sub mono">only /api/ewcp</div>
      <div class="slot" :style="slot({ ...SLOTS.whoAmI, cx: SLOTS.whoAmI.cx - NODES.ewcp.x, cy: SLOTS.whoAmI.cy - NODES.ewcp.y })" />
      <div class="slot" :style="slot({ ...SLOTS.policy, cx: SLOTS.policy.cx - NODES.ewcp.x, cy: SLOTS.policy.cy - NODES.ewcp.y })" />
      <div class="slit" />
    </Step>

    <Step :at="1" anim="pop" class="node dsajobs" :style="box(NODES.dsajobs)">
      <div class="head"><span class="tag">&lt;/&gt;</span><span class="name">dsa.jobs</span></div>
      <div class="slot" :style="slot({ ...SLOTS.bootstrap, cx: SLOTS.bootstrap.cx - NODES.dsajobs.x, cy: SLOTS.bootstrap.cy - NODES.dsajobs.y })" />
      <div class="sub mono el">&lt;dsa-jobs&gt;</div>
    </Step>

    <Step :at="1" anim="right" class="node partner" :style="box(NODES.partner)">
      <WordPressMark :size="84" color="#fff" cut="var(--wp)" />
      <div class="name">Partner site</div>
    </Step>

    <!-- traffic, once everything is on the map -->
    <svg v-if="s4" class="wires packets" viewBox="0 0 1920 1080">
      <g v-for="p in packets" :key="p.label" opacity="0">
        <rect :x="-(p.label.length * 7.6 + 20)" y="-17" :width="p.label.length * 15.2 + 40" height="34" rx="17" class="pill" />
        <text text-anchor="middle" dy="7" class="pill-text">{{ p.label }}</text>
        <animateMotion :path="p.path" :begin="`${p.begin}s`" dur="3.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" :begin="`${p.begin}s`" dur="3.6s" repeatCount="indefinite" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.map { padding: 80px 100px; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.wire {
  fill: none;
  stroke: var(--k-dark);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  transition: stroke-dashoffset 0.9s var(--ease-out) 0.3s;
}
.wire.on { stroke-dashoffset: 0; }
.wlabel { font: 700 22px var(--sans); fill: var(--k-dark); opacity: 0; transition: opacity 0.5s 0.6s; }
.wlabel.on { opacity: 1; }

.node {
  position: absolute;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 16px;
  text-align: center;
}
.name { font: 700 28px/1.15 var(--sans); }
.sub { font: 400 20px/1.25 var(--sans); opacity: 0.85; margin-top: 6px; }
.slot { position: absolute; border-radius: 10px; background: rgba(0, 0, 0, 0.28); }

.portal { justify-content: center; border: 4px dashed var(--k-dark); }
.note { position: absolute; width: 300px; font: 700 22px/1.3 var(--sans); }

.umbraco { background: var(--umbraco); color: #fff; align-items: stretch; text-align: left; }
.umbraco .head { display: flex; gap: 16px; align-items: center; padding: 4px 6px; }
.umbraco .name { font-size: 36px; }

.backoffice { justify-content: center; background: #fff; border: 4px solid var(--umbraco); color: var(--umbraco); }
.backoffice .name { font-size: 24px; white-space: nowrap; }

/* the letterbox */
.ewcp { background: var(--k-dark); color: var(--k-sand); padding-top: 26px; }
.ewcp .name { font-size: 25px; }
.ewcp .sub { font-size: 18px; color: var(--k-green); opacity: 1; }
.slit { position: absolute; left: 22px; right: 22px; top: 356px; height: 80px; border-radius: 40px; background: #1d1d1f; box-shadow: inset 0 4px 10px rgba(0, 0, 0, 0.6); }

.dsajobs { background: var(--k-dark); color: var(--k-sand); }
.dsajobs .head { display: flex; gap: 12px; align-items: center; }
.tag { font: 700 28px var(--mono); color: var(--k-green); }
.dsajobs .el { position: absolute; bottom: 22px; left: 0; right: 0; color: var(--k-green); opacity: 1; font-size: 22px; }

.partner { background: var(--wp); color: #fff; justify-content: center; gap: 18px; }
.partner .name { font-size: 26px; }

.pill { fill: var(--k-dark); }
.pill-text { font: 700 24px var(--mono); fill: var(--k-green); }
</style>
