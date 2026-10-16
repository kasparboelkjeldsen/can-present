<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDeck, stepFor } from './engine/useDeck.js'
import { interpolateZoom, easeInOutCubic, shortestAngle } from './engine/camera.js'
import SceneFrame from './engine/SceneFrame.vue'

const W = 1920
const H = 1080
const { scenes, idx, step, overview, blackout, go, maxStep } = useDeck()

// ---------- world placement ----------
const place = (sc) => ({ x: sc.at?.x ?? 0, y: sc.at?.y ?? 0, s: sc.at?.s ?? 1, r: sc.at?.r ?? 0 })

function viewFor(i) {
  const p = place(scenes[i])
  return { x: p.x, y: p.y, w: W * p.s, r: p.r }
}

function overviewView() {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const sc of scenes) {
    const p = place(sc)
    const a = (p.r * Math.PI) / 180
    const hw = (W / 2) * p.s, hh = (H / 2) * p.s
    const ex = Math.abs(Math.cos(a)) * hw + Math.abs(Math.sin(a)) * hh
    const ey = Math.abs(Math.sin(a)) * hw + Math.abs(Math.cos(a)) * hh
    minX = Math.min(minX, p.x - ex); maxX = Math.max(maxX, p.x + ex)
    minY = Math.min(minY, p.y - ey); maxY = Math.max(maxY, p.y + ey)
  }
  const bw = maxX - minX, bh = maxY - minY
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, w: Math.max(bw, (bh * W) / H) * 1.12, r: 0 }
}

// ---------- camera ----------
const target = computed(() => (overview.value ? overviewView() : viewFor(idx.value)))
const cam = reactive({ ...target.value })
const flying = ref(false)
let raf = 0

function flyTo(t) {
  cancelAnimationFrame(raf)
  const from = { ...cam }
  const interp = interpolateZoom([from.x, from.y, from.w], [t.x, t.y, t.w])
  const toR = shortestAngle(from.r, t.r)
  const dur = Math.min(2400, Math.max(650, interp.duration * 0.85))
  const t0 = performance.now()
  flying.value = true
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / dur)
    const e = easeInOutCubic(k)
    const [x, y, w] = interp(e)
    Object.assign(cam, { x, y, w, r: from.r + (toR - from.r) * e })
    if (k < 1) raf = requestAnimationFrame(tick)
    else { flying.value = false; Object.assign(cam, t) }
  }
  raf = requestAnimationFrame(tick)
}
watch(target, flyTo)

const worldStyle = computed(() => ({
  transform: `translate(${W / 2}px, ${H / 2}px) scale(${W / cam.w}) rotate(${-cam.r}deg) translate(${-cam.x}px, ${-cam.y}px)`,
}))

function sceneStyle(sc) {
  const p = place(sc)
  return { transform: `translate(${p.x - W / 2}px, ${p.y - H / 2}px) rotate(${p.r}deg) scale(${p.s})` }
}

// ---------- fit 1920x1080 stage into the window ----------
const fit = ref(1)
const resize = () => { fit.value = Math.min(innerWidth / W, innerHeight / H) }

// ---------- chrome: hint, idle cursor ----------
const showHint = ref(true)
const idle = ref(false)
let idleTimer
const poke = () => { idle.value = false; clearTimeout(idleTimer); idleTimer = setTimeout(() => (idle.value = true), 2000) }

onMounted(() => {
  resize()
  addEventListener('resize', resize)
  addEventListener('mousemove', poke)
  setTimeout(() => (showHint.value = false), 5000)
  poke()
})
onBeforeUnmount(() => {
  removeEventListener('resize', resize)
  removeEventListener('mousemove', poke)
})

const progress = computed(() => {
  const n = scenes.length - 1
  if (n <= 0) return 1
  const m = maxStep(idx.value)
  return Math.min(1, (idx.value + (m ? step.value / (m + 1) : 0)) / n)
})

function pick(i) {
  if (!overview.value) return
  go(i)
  overview.value = false
}
</script>

<template>
  <div class="viewport" :class="{ idle, overview }">
    <div class="stage" :style="{ transform: `translate(-50%, -50%) scale(${fit})` }">
      <div class="world" :style="worldStyle">
        <div class="world-grid" />
        <div
          v-for="(sc, i) in scenes"
          :key="sc.id"
          class="scene"
          :class="{
            'is-active': i === idx && !overview,
            'is-past': i < idx,
            'is-nested': (sc.at?.s ?? 1) < 1,
          }"
          :style="sceneStyle(sc)"
          @click="pick(i)"
        >
          <SceneFrame
            :scene="sc"
            :step="stepFor(i)"
            :active="i === idx && !overview"
            :near="Math.abs(i - idx) <= 1"
          />
          <div class="scene-label"><b>{{ i + 1 }}</b> {{ sc.title ?? sc.id }}</div>
        </div>
      </div>

      <div class="progress" :style="{ transform: `scaleX(${progress})` }" />
      <div class="counter">{{ idx + 1 }} / {{ scenes.length }}</div>
      <Transition name="hint">
        <div v-if="showHint" class="hint">
          <kbd>→</kbd> next <kbd>←</kbd> back <kbd>O</kbd> overview <kbd>P</kbd> presenter <kbd>F</kbd> fullscreen <kbd>B</kbd> blackout
        </div>
      </Transition>
      <div class="blackout" :class="{ on: blackout }" />
    </div>
  </div>
</template>

<style scoped>
.viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(1200px 800px at 20% 10%, rgba(53, 68, 177, 0.35), transparent 70%),
    radial-gradient(1000px 700px at 85% 90%, rgba(245, 193, 188, 0.12), transparent 70%),
    var(--u-navy-deep);
}
.viewport.idle { cursor: none; }

.stage {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  transform-origin: 50% 50%;
}

.world {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
}
.world-grid {
  position: absolute;
  left: -30000px;
  top: -30000px;
  width: 60000px;
  height: 60000px;
  background-image: radial-gradient(circle, rgba(245, 193, 188, 0.22) 2.5px, transparent 3px);
  background-size: 80px 80px;
  pointer-events: none;
}

.scene {
  position: absolute;
  left: 0;
  top: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: 50% 50%;
  border-radius: 48px;
  box-shadow: 0 60px 160px rgba(5, 10, 30, 0.55);
  transition: border-radius 0.7s var(--ease-out), box-shadow 0.7s;
}
.scene > :deep(.scene-frame) { border-radius: inherit; }
.scene.is-active { border-radius: 0; box-shadow: none; }
.scene.is-nested:not(.is-active) { box-shadow: 0 20px 60px rgba(5, 10, 30, 0.35); }

.overview .scene { cursor: pointer; }
.overview .scene:hover { outline: 24px solid var(--u-pink); }
.scene-label {
  position: absolute;
  left: 0;
  bottom: calc(100% + 30px);
  font: 700 72px var(--font);
  color: var(--u-pink);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.scene-label b {
  display: inline-grid;
  place-items: center;
  width: 110px;
  height: 110px;
  margin-right: 20px;
  border-radius: 50%;
  background: var(--u-pink);
  color: var(--u-navy);
}
.overview .scene:not(.is-nested) .scene-label { opacity: 1; }

.progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 8px;
  width: 100%;
  background: linear-gradient(90deg, var(--u-pink), var(--u-pink-hot));
  transform-origin: 0 50%;
  transition: transform 0.6s var(--ease-out);
  z-index: 10;
}
.counter {
  position: absolute;
  right: 36px;
  bottom: 28px;
  font: 700 22px var(--mono);
  color: rgba(255, 255, 255, 0.0);
  transition: color 0.3s;
  z-index: 10;
}
.viewport:not(.idle) .counter { color: rgba(127, 127, 160, 0.7); }

.hint {
  position: absolute;
  left: 50%;
  bottom: 60px;
  transform: translateX(-50%);
  padding: 18px 30px;
  border-radius: 999px;
  background: rgba(17, 26, 58, 0.85);
  color: #dfe3ff;
  font-size: 22px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
.hint kbd {
  font: 700 18px var(--mono);
  padding: 4px 10px;
  margin: 0 6px 0 18px;
  border-radius: 8px;
  background: var(--u-pink);
  color: var(--u-navy);
}
.hint kbd:first-child { margin-left: 0; }
.hint-leave-active { transition: opacity 0.8s, transform 0.8s; }
.hint-leave-to { opacity: 0; transform: translate(-50%, 20px); }

.blackout {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s;
  z-index: 20;
}
.blackout.on { opacity: 1; }
</style>
