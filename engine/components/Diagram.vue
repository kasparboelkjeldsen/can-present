<script setup>
// Boxes connected by lines that draw themselves, with packets flowing along them and 16:9 slots
// where nested scenes sit. The definition comes from defineDiagram() (engine/diagram.js), so
// deck.js can share it (steps, nest(…, arch.slot('x')), revealAt / revealDelay).
//
//   <Diagram :diagram="arch" />
//   <Diagram :diagram="arch">
//     <template #node-api="{ node, shown }">…replaces the api box's label and sub…</template>
//   </Diagram>
//
// It covers the whole slide (position: absolute; inset: 0), in the scene's 1920×1080 space.
// reveal 'steps': follows the scene's build step (past and overview show everything).
// reveal { timer }: stages appear on the listed ms after the scene comes on stage; coming back
//   from a later scene shows everything at once. <Step>s inside node slots follow the stage too.
// Thumbnails (presenter, ?sheet) show the final state of a timer diagram and no packets.
// Every part has a zero-specificity class (.dg-node, .dg-node--accent, .dg-label, .dg-sub,
// .dg-slot, .dg-line, .dg-elabel, .dg-packet …), so a theme can restyle it.
import { ref, reactive, computed, watch, provide, onMounted, onBeforeUnmount, useId } from 'vue'
import { useStep } from '../useStep.js'
import Step from '../Step.vue'
import { PACKET_FONT } from '../diagram.js'

const props = defineProps({ diagram: { type: Object, required: true } })
const { step, active, preview } = useStep()
const uid = useId()

const dg = computed(() => {
  const d = props.diagram
  if (!d?.nodes || !Array.isArray(d.edges)) throw new Error('<Diagram>: pass :diagram="…" made with defineDiagram() from @engine/diagram.js')
  return d
})
const nodes = computed(() => Object.values(dg.value.nodes))
const slotsOf = (id) => Object.values(dg.value.slots).filter((s) => s.node === id)

// ---- reveal ----
const stage = ref(0)
let timers = []
const clearTimers = () => { timers.forEach(clearTimeout); timers = [] }
if (dg.value.mode === 'timer') {
  // the same logic as a self-assembling diagram scene: run on arrival, all at once on return
  watch([active, step], ([on, s], [wasOn, oldS] = []) => {
    clearTimers()
    const all = dg.value.stages
    if (preview.value) { stage.value = all; return }
    if (!on) { stage.value = s === Infinity ? all : 0; return }
    if (wasOn) return
    if (oldS === Infinity) { stage.value = all; return }
    stage.value = 0
    dg.value.timer.forEach((ms, i) => timers.push(setTimeout(() => (stage.value = i + 1), ms)))
  }, { immediate: true })
  provide('scene-step', stage) // <Step>s below (nodes, and anything in node slots) follow the stage
}
onBeforeUnmount(clearTimers)
const cur = computed(() => (dg.value.mode === 'timer' ? stage.value : step.value))
const isShown = (at) => cur.value >= at

// ---- edges ----
const tones = computed(() => [...new Set(dg.value.edges.filter((e) => e.arrow).map((e) => e.tone))])
const marker = (tone) => `url(#${uid}-arr-${tone})`
const box = (n) => ({ left: n.x + 'px', top: n.y + 'px', width: n.w + 'px', height: n.h + 'px' })
const slotBox = (s) => ({ left: s.rel.cx - s.rel.w / 2 + 'px', top: s.rel.cy - s.rel.h / 2 + 'px', width: s.rel.w + 'px', height: s.rel.h + 'px' })

// labels on custom `path`s: the path's midpoint, measured once it's in the DOM
const lines = ref([])
const measuredLabel = reactive({})
onMounted(() => {
  for (const e of dg.value.edges) {
    if (!e.custom || !e.label) continue
    const el = lines.value.find((p) => Number(p.dataset.edge) === e.index)
    if (!el) continue
    const pt = el.getPointAtLength(el.getTotalLength() / 2)
    measuredLabel[e.index] = { x: pt.x, y: pt.y - 30, anchor: 'middle', baseline: 'auto' }
  }
})
const labelOf = (e) => e.labelPos ?? measuredLabel[e.index] ?? null

// ---- packets: they start once their edge has drawn (DRAWN s after it appears) ----
const DRAWN = 0.95
const PAD = 22
const packetEdges = computed(() => {
  const by = new Map()
  for (const p of dg.value.packets) {
    if (!by.has(p.edge)) by.set(p.edge, [])
    by.get(p.edge).push(p)
  }
  return [...by].map(([i, list]) => ({ edge: dg.value.edges[i], list }))
})
const textW = reactive({})
function measure(el, i) {
  if (!el) return
  const w = el.getComputedTextLength?.()
  if (w > 0 && Math.abs((textW[i] ?? 0) - w) > 0.5) textW[i] = w
}
const pillW = (p) => Math.ceil((textW[p.index] ?? p.label.length * PACKET_FONT * 0.62) + PAD * 2)
const motion = (p) => (p.reverse ? { keyPoints: '1;0', keyTimes: '0;1', calcMode: 'linear' } : {})
</script>

<template>
  <div class="diagram" :class="`diagram--${dg.mode}`">
    <svg class="dg-svg" viewBox="0 0 1920 1080" aria-hidden="true">
      <defs>
        <marker
          v-for="t in tones"
          :id="`${uid}-arr-${t}`"
          :key="t"
          :class="`dg-edge--${t}`"
          viewBox="0 0 10 10"
          refX="7.3"
          refY="5"
          markerUnits="userSpaceOnUse"
          markerWidth="22"
          markerHeight="22"
          orient="auto-start-reverse"
        >
          <path class="dg-head" d="M0 0 L10 5 L0 10 z" />
        </marker>
      </defs>
      <g
        v-for="e in dg.edges"
        :key="e.index"
        class="dg-edge"
        :class="[`dg-edge--${e.tone}`, e.class, { 'is-shown': isShown(e.at) }]"
      >
        <path ref="lines" class="dg-line" :data-edge="e.index" :d="e.d" pathLength="1" />
        <path
          v-if="e.arrow"
          class="dg-heads"
          :d="e.d"
          :marker-end="marker(e.tone)"
          :marker-start="e.both ? marker(e.tone) : null"
        />
        <text
          v-if="e.label && labelOf(e)"
          class="dg-elabel"
          :x="labelOf(e).x"
          :y="labelOf(e).y"
          :text-anchor="labelOf(e).anchor"
          :dominant-baseline="labelOf(e).baseline"
        >{{ e.label }}</text>
      </g>
    </svg>

    <Step
      v-for="n in nodes"
      :key="n.id"
      :at="n.at"
      anim="pop"
      class="dg-node"
      :class="[`dg-node--${n.tone}`, { 'dg-node--has-slots': slotsOf(n.id).length }, n.class]"
      :style="box(n)"
      :data-node="n.id"
    >
      <slot :name="`node-${n.id}`" :node="n" :shown="isShown(n.at)">
        <div v-if="n.label" class="dg-label">{{ n.label }}</div>
        <div v-if="n.sub" class="dg-sub">{{ n.sub }}</div>
      </slot>
      <div v-for="s in slotsOf(n.id)" :key="s.name" class="dg-slot" :data-slot="s.name" :style="slotBox(s)" />
    </Step>

    <template v-if="!preview">
      <template v-for="pe in packetEdges" :key="pe.edge.index">
        <!-- a fresh <svg> per edge, so the SMIL clock starts when its edge appears -->
        <svg v-if="isShown(pe.edge.at)" class="dg-svg dg-packets" viewBox="0 0 1920 1080" aria-hidden="true">
          <g v-for="p in pe.list" :key="p.index" class="dg-packet" :class="`dg-packet--${p.tone}`" opacity="0">
            <rect :x="-pillW(p) / 2" :y="-(PACKET_FONT * 0.85)" :width="pillW(p)" :height="PACKET_FONT * 1.7" :rx="PACKET_FONT * 0.85" />
            <text :ref="(el) => measure(el, p.index)" text-anchor="middle" dominant-baseline="central">{{ p.label }}</text>
            <animateMotion :path="pe.edge.d" :begin="`${DRAWN + p.delay}s`" :dur="`${p.dur}s`" repeatCount="indefinite" v-bind="motion(p)" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" :begin="`${DRAWN + p.delay}s`" :dur="`${p.dur}s`" repeatCount="indefinite" />
          </g>
        </svg>
      </template>
    </template>
  </div>
</template>

<style>
/* zero specificity (:where), so a deck's theme can restyle any part */
:where(.diagram) { position: absolute; inset: 0; }
:where(.dg-svg) { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }

/* nodes */
:where(.dg-node) {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 22px 26px;
  border-radius: var(--radius);
  text-align: center;
  background: var(--deck-paper);
  color: var(--deck-ink);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.16), inset 0 0 0 3px color-mix(in srgb, var(--deck-ink) 12%, transparent);
}
:where(.dg-node--has-slots) { justify-content: flex-start; }
:where(.dg-node--ink) { background: var(--deck-ink); color: var(--deck-paper); box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22); }
:where(.dg-node--accent) { background: var(--deck-accent); color: var(--deck-on-accent); box-shadow: 0 18px 44px rgba(0, 0, 0, 0.2); }
:where(.dg-node--ghost) { background: transparent; color: inherit; border: 4px dashed currentColor; box-shadow: none; }
:where(.dg-label) { font-size: 34px; font-weight: 700; line-height: 1.15; }
:where(.dg-sub) { font-size: 26px; line-height: 1.25; opacity: 0.75; }
:where(.dg-slot) { position: absolute; border-radius: calc(var(--radius) * 0.5); background: rgba(0, 0, 0, 0.28); }

/* edges: colour from the tone; the line draws itself once both boxes are there,
   the arrowheads (markers ignore the dash) and the label fade in after it */
:where(.dg-edge), :where(.dg-edge--ink) { --dg-c: var(--deck-ink); }
:where(.dg-edge--paper) { --dg-c: var(--deck-paper); }
:where(.dg-edge--accent) { --dg-c: var(--deck-accent); }
:where(.dg-edge--accent-2) { --dg-c: var(--deck-accent-2); }
:where(.dg-edge--current) { --dg-c: currentColor; }
:where(.dg-head) { fill: var(--dg-c); }
:where(.dg-line) {
  fill: none;
  stroke: var(--dg-c);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  transition: opacity 0.2s, stroke-dashoffset 0s;
}
:where(.dg-edge.is-shown .dg-line) {
  opacity: 1;
  stroke-dashoffset: 0;
  transition: opacity 0.2s ease 0.35s, stroke-dashoffset 0.6s var(--ease-out) 0.35s;
}
:where(.dg-heads) { fill: none; stroke: none; opacity: 0; transition: opacity 0.15s; }
:where(.dg-elabel) { fill: var(--dg-c); font: 700 26px var(--sans); opacity: 0; transition: opacity 0.15s; }
:where(.dg-edge.is-shown .dg-heads), :where(.dg-edge.is-shown .dg-elabel) { opacity: 1; transition: opacity 0.3s ease 0.9s; }

/* packets */
:where(.dg-packet) { --dg-bg: var(--deck-ink); --dg-fg: var(--deck-paper); }
:where(.dg-packet--paper) { --dg-bg: var(--deck-paper); --dg-fg: var(--deck-ink); }
:where(.dg-packet--accent) { --dg-bg: var(--deck-accent); --dg-fg: var(--deck-on-accent); }
:where(.dg-packet--accent-2) { --dg-bg: var(--deck-accent-2); --dg-fg: var(--deck-paper); }
:where(.dg-packet rect) { fill: var(--dg-bg); }
:where(.dg-packet text) { fill: var(--dg-fg); font: 700 26px var(--mono); }
</style>
