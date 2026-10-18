<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useDeck, stepFor, nestedVisible, outerVisible } from './useDeck.js'
import { talkBounds } from './layout.js'
import { interpolateZoom, easeInOutCubic, shortestAngle } from './camera.js'
import { cam } from './cameraState.js'
import { validateVia, sampleVia, planRide } from './ride.js'
import { validateFrames, normalizeFrames, frameAt, frameView } from './frames.js'
import { formationProblems, planFormation, formationTransforms, formationTiming, SPRING, SPRING_FALLBACK } from './formation.js'
import SceneFrame from './SceneFrame.vue'
import RidePill from './RidePill.vue'

const W = 1920
const H = 1080
const { scenes, idx, step, overview, blackout, go, maxStep, prevIndex, reset } = useDeck()

// ---------- world placement ----------
const place = (sc) => ({ x: sc.at?.x ?? 0, y: sc.at?.y ?? 0, s: sc.at?.s ?? 1, r: sc.at?.r ?? 0 })

// `frames` in deck.js (engine/frames.js): per build step, the camera shows a box of the card
// instead of the whole card. Invalid frames are ignored with a warning (check reports them).
// `formation` in deck.js (engine/formation.js): while that scene is on stage, the other cards gather
// round it. One per deck (check warns about more); an invalid one is ignored with a warning.
const fx = (() => {
  const i = scenes.findIndex((sc) => sc.formation != null)
  if (i < 0) return null
  const problems = formationProblems(scenes, i)
  if (problems.length) { console.warn(`[can-present] scene "${scenes[i].id}": formation ignored: ${problems.join('; ')}`); return null }
  try {
    const plan = planFormation(scenes, i)
    return { ...plan, transforms: formationTransforms(scenes, plan), timing: formationTiming(plan.n) }
  } catch (e) {
    console.warn(`[can-present] scene "${scenes[i].id}": formation ignored:`, e)
    return null
  }
})()

const frameLists = scenes.map((sc, i) => {
  if (sc.frames == null) return null
  if (fx?.index === i) { console.warn(`[can-present] scene "${sc.id}": frames ignored on the formation scene`); return null }
  const problems = validateFrames(sc.frames, sc.steps ?? 0)
  if (problems.length) console.warn(`[can-present] scene "${sc.id}": frames ignored: ${problems.join('; ')}`)
  return problems.length ? null : normalizeFrames(sc.frames)
})

function viewFor(i, s = 0) {
  const p = place(scenes[i])
  const f = frameLists[i] && frameAt(frameLists[i], s)
  return f ? frameView(p, f.box) : { x: p.x, y: p.y, w: W * p.s, r: p.r }
}

// the whole talk: ghosts and outer layers don't count (layout.js, shared with the first outer layer)
function overviewView() {
  const b = talkBounds(scenes)
  return { x: b.x, y: b.y, w: Math.max(b.w, (b.h * W) / H) * 1.12, r: 0 }
}

// ---------- camera ----------
// `cam` lives in cameraState.js so scenes can read it (useStep().zoom). It flies whenever this key
// changes: the overview, the scene, or (only for a scene with frames) the frame in force.
// (In the overview the scene doesn't count: moving to another one there doesn't restart the flight.)
const camKey = computed(() => {
  if (overview.value) return 'o'
  const list = frameLists[idx.value]
  return list ? `${idx.value}|${frameAt(list, step.value)?.step ?? 0}` : `${idx.value}`
})
// the formation is up while its scene is on stage (the overview shows the normal layout)
const fxOn = computed(() => !!fx && idx.value === fx.index && !overview.value)
const target = () => (overview.value ? overviewView() : fxOn.value ? { ...fx.view } : viewFor(idx.value, step.value))
Object.assign(cam, target())
const flying = ref(false)
let raf = 0

// `dur` (ms) overrides the flight's own duration; `then` runs when it lands (not when it's cut short)
function flyTo(t, { dur: fixed, then } = {}) {
  cancelAnimationFrame(raf)
  endRide()
  const from = { ...cam }
  const interp = interpolateZoom([from.x, from.y, from.w], [t.x, t.y, t.w])
  const toR = shortestAngle(from.r, t.r)
  const dur = fixed ?? Math.min(2400, Math.max(650, interp.duration * 0.85))
  const t0 = performance.now()
  flying.value = true
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / dur)
    const e = easeInOutCubic(k)
    const [x, y, w] = interp(e)
    Object.assign(cam, { x, y, w, r: from.r + (toR - from.r) * e })
    if (k < 1) raf = requestAnimationFrame(tick)
    else { flying.value = false; Object.assign(cam, t); then?.() }
  }
  raf = requestAnimationFrame(tick)
}

// ---------- rides (`via` in deck.js, engine/ride.js) ----------
// The flight into a scene with `via` from the previous scene in deck order follows its path, and
// ← from it plays the same ride backwards. Every other move (overview, hash jumps, Home/End, X,
// skipping over it, a new move while a ride runs) is a normal flight from wherever the camera is.
const reducedMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null
const validVia = scenes.map((sc) => {
  if (sc.via == null) return false
  const problems = validateVia(sc.via)
  if (problems.length) console.warn(`[can-present] scene "${sc.id}": via ignored: ${problems.join('; ')}`)
  return !problems.length
})
function rideBetween(from, to) {
  if (validVia[to] && prevIndex(to) === from) return { via: scenes[to].via, back: false }
  if (validVia[from] && prevIndex(from) === to) return { via: scenes[from].via, back: true }
  return null
}

// the pill rides in the world layer; RidePill reads this object, so App doesn't re-render per frame
const pill = reactive({ on: false, fading: false, label: '', tone: 'ink', x: 0, y: 0, r: 0, s: 1, k: 1, op: 0 })
let riding = false
let fadeTimer = 0
function endRide() {
  if (riding && pill.on && pill.op > 0) {
    // cut short by a new move: the pill fades where it is while the camera flies off
    Object.assign(pill, { fading: true, op: 0 })
    fadeTimer = setTimeout(() => Object.assign(pill, { on: false, fading: false }), 300)
  } else if (!pill.fading) pill.on = false
  riding = false
}

function rideTo(t, via, back) {
  cancelAnimationFrame(raf)
  let plan
  try {
    plan = planRide(sampleVia(via, back), { ...cam }, t)
  } catch (e) {
    console.warn('[can-present] ride failed, flying normally:', e)
    return flyTo(t)
  }
  const v = plan.via
  riding = true
  clearTimeout(fadeTimer)
  Object.assign(pill, { on: !!v.label, fading: false, label: v.label, tone: v.tone, r: v.space.r, s: v.space.s, op: 0, k: 0.6 })
  const t0 = performance.now()
  flying.value = true
  const tick = (now) => {
    const f = plan.at((now - t0) / 1000)
    cam.x = f.x; cam.y = f.y; cam.w = f.w; cam.r = f.r
    if (f.pill) { pill.x = f.pill.x; pill.y = f.pill.y; pill.op = f.pill.op; pill.k = f.pill.k }
    else pill.op = 0
    if (!f.done) raf = requestAnimationFrame(tick)
    else { flying.value = false; endRide(); Object.assign(cam, t) }
  }
  raf = requestAnimationFrame(tick)
}

// ---------- the formation's choreography ----------
// Entering: (1) the camera pulls back to the whole talk, (2) the cards leave home one after another on
// a springy CSS transition while the camera eases to frame the formation, (3) a spinning one starts
// to orbit (a CSS animation of --fx-spin, delayed until the cards have landed). Leaving: the cards go
// home while the camera pulls back to the whole talk, then the normal flight. The overview counts as
// leaving. With reduced motion the cards jump and the camera flies normally.
// Only these few state changes re-render App; the motion itself is CSS (no per-frame JS per card).
const formation = reactive({ formed: false, mode: 'cut', spin: false, hold: null })
const springEase = typeof CSS !== 'undefined' && CSS.supports?.('transition-timing-function', SPRING) ? SPRING : SPRING_FALLBACK
// ms: phase 1, about 700 ms (a little longer for a long way back); even when the camera is nearly
// there already (a ghost takeaway shows the whole talk), it's a beat for the scene before to fade
const PULL_BACK = [700, 950]

function setFormed(on, mode) {
  const spin = on && !!fx.spin && !reducedMotion?.matches
  Object.assign(formation, { formed: on, mode, spin, hold: on ? null : formation.hold })
}
const near = (a, b, tol) => Math.hypot(a.x - b.x, a.y - b.y) < tol * b.w && Math.abs(a.w / b.w - 1) < tol && Math.abs(a.r - b.r) < 0.5

function formationMove(t) {
  cancelAnimationFrame(raf)
  endRide()
  const T = fx.timing
  if (reducedMotion?.matches) { setFormed(fxOn.value, 'cut'); return flyTo(t) }
  if (fxOn.value) {
    const go = () => { setFormed(true, 'go'); flyTo(t, { dur: T.goTotal * 0.85 }) }
    const ov = overviewView()
    if (near(cam, ov, 0.005)) return go() // already looking at the whole talk (back from the overview)
    const d = interpolateZoom([cam.x, cam.y, cam.w], [ov.x, ov.y, ov.w]).duration * 0.5
    flyTo(ov, { dur: Math.min(PULL_BACK[1], Math.max(PULL_BACK[0], d)), then: go })
  } else {
    const back = () => {
      setFormed(false, 'back')
      if (overview.value) flyTo(t, { dur: T.backTotal })
      else flyTo(overviewView(), { dur: T.backTotal, then: () => flyTo(t) })
    }
    if (!formation.spin) return back()
    // A transition starts from the card's style without its animations, i.e. from the unspun ring.
    // So first freeze the orbit where it is: stop the animation and write its current angle inline
    // (instantly, mode 'cut'), let the browser take that in, and only then send the cards home.
    const el = document.querySelector('.scene.fx-spin')
    const angle = el ? getComputedStyle(el).getPropertyValue('--fx-spin').trim() : ''
    Object.assign(formation, { spin: false, hold: angle || null, mode: 'cut' })
    nextTick(() => {
      if (el) getComputedStyle(el).transform // flush styles: the frozen ring is now the starting point
      back()
    })
  }
}
// opened straight onto the formation scene (URL hash, reload): already in formation
if (fxOn.value) setFormed(true, 'cut')

// per moving card: its transform, and the transition timing it uses for the current move
function formationStyle(i) {
  const tr = fx.transforms[i]
  const T = fx.timing
  const o = fx.order[i] ?? 0
  const m = formation.mode
  return {
    transform: formation.formed ? tr.formed : tr.home,
    '--fx-dur': m === 'go' ? `${T.go}ms` : m === 'back' ? `${T.back}ms` : '0s',
    '--fx-delay': m === 'go' ? `${Math.round(o * T.stagger)}ms` : m === 'back' ? `${Math.round((fx.n - 1 - o) * T.backStagger)}ms` : '0s',
    '--fx-ease': m === 'go' ? springEase : 'cubic-bezier(0.55, 0, 0.25, 1)',
    '--fx-spin-delay': m === 'go' ? `${Math.round(T.spinAt)}ms` : '0s',
    '--fx-spin': formation.hold,
  }
}
// constants for the orbit (on .world, inherited by the cards): the spin eases in over spinIn and then
// turns at a constant speed; the ease-in ends at that speed, so the hand-over is seamless
const fxWorldVars = fx?.spin
  ? (() => {
      const dir = Math.sign(fx.spin), period = Math.abs(fx.spin), spinIn = fx.timing.spinIn
      // cubic-bezier(0.5, 0, 0.75, 0.5) ends at twice its average speed: spinIn covers half a constant-speed stretch
      const a = ((360 / period) * (spinIn / 1000)) / 2
      return { '--fx-period': `${period}s`, '--fx-turn': `${360 * dir}deg`, '--fx-spin-a': `${+(a * dir).toFixed(3)}deg`, '--fx-spin-in': `${spinIn}ms` }
    })()
  : null

let last = { idx: idx.value, overview: overview.value }
watch(camKey, () => {
  const t = target()
  const from = last
  last = { idx: idx.value, overview: overview.value }
  // to the formation scene, or away from it while the cards are out (or on their way out)
  if (fx && (fxOn.value || formation.formed)) return formationMove(t)
  // a new frame within the same scene: with reduced motion, cut straight to it
  if (!from.overview && !overview.value && from.idx === idx.value && reducedMotion?.matches) {
    cancelAnimationFrame(raf)
    endRide()
    flying.value = false
    Object.assign(cam, t)
    return
  }
  const ride = !riding && !from.overview && !overview.value && from.idx !== idx.value && !reducedMotion?.matches
    ? rideBetween(from.idx, idx.value)
    : null
  if (ride) rideTo(t, ride.via, ride.back)
  else flyTo(t)
})

// Dot grid drawn on the (untransformed) stage and moved with the camera: cheap at any zoom.
const gridStyle = computed(() => {
  const z = W / cam.w
  let g = 80 * z
  while (g < 28) g *= 4
  return {
    backgroundSize: `${g}px ${g}px`,
    backgroundPosition: `${W / 2 - cam.x * z}px ${H / 2 - cam.y * z}px`,
  }
})

const worldStyle = computed(() => ({
  transform: `translate(${W / 2}px, ${H / 2}px) scale(${W / cam.w}) rotate(${-cam.r}deg) translate(${-cam.x}px, ${-cam.y}px)`,
}))

// nested scenes fade in on their parent's schedule (revealDelay in deck.js), but vanish at once.
// (Not on a card the formation moves: the delay would hold back its transform too.)
const revealStyle = (sc, i) => (sc.revealDelay && nestedVisible(i) && !fx?.transforms[i] ? { transitionDelay: sc.revealDelay + 'ms' } : null)

// outer layers paint under the talk, and each under the one it wraps
const outerZ = (() => {
  let k = 0
  return scenes.map((sc) => (sc.outer ? -1 - k++ : null))
})()

function sceneStyle(sc, i) {
  if (fx?.transforms[i]) return formationStyle(i)
  const p = place(sc)
  const transform = `translate(${p.x - W / 2}px, ${p.y - H / 2}px) rotate(${p.r}deg) scale(${p.s})`
  return outerZ[i] != null ? { transform, zIndex: outerZ[i] } : { transform }
}
const fxClass = (i) => {
  if (!fx) return null
  const role = fx.roles[i]
  if (role === 'lead' || role === 'follow') return { 'fx-mover': true, 'fx-spin': formation.spin }
  if (role === 'centre') return { 'fx-centre': formation.formed }
  if (role === 'fade') return { 'fx-gone': formation.formed && !scenes[i].ghost && !scenes[i].outer }
  return null
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
  // measure the ride paths now, so the first ride doesn't spend its first frame on it
  setTimeout(() => scenes.forEach((sc, i) => {
    if (!validVia[i]) return
    try { sampleVia(sc.via); sampleVia(sc.via, true) } catch (e) { console.warn(`[can-present] scene "${sc.id}": via path:`, e) }
  }), 300)
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
      <div class="grid" :style="gridStyle" />
      <div class="world" :style="[worldStyle, fxWorldVars]">
        <div
          v-for="(sc, i) in scenes"
          :key="sc.id"
          class="scene"
          :class="[{
            'is-active': i === idx && !overview,
            'is-past': i < idx,
            'is-nested': !!sc.parent,
            'is-hidden': !nestedVisible(i),
            'is-ghost': sc.ghost,
            'is-outer': !!sc.outer,
            'is-unreached': !outerVisible(i),
            'is-skip': sc.skip,
          }, fxClass(i)]"
          :style="[sceneStyle(sc, i), revealStyle(sc, i)]"
          @click="pick(i)"
        >
          <SceneFrame
            :scene="sc"
            :step="stepFor(i)"
            :active="i === idx && !overview"
            :near="Math.abs(i - idx) <= 1"
          />
          <div class="scene-label"><b>{{ i + 1 }}</b> {{ sc.title ?? sc.id }}<i v-if="sc.skip"> (fallback)</i></div>
        </div>
        <RidePill :pill="pill" />
      </div>

      <div class="progress" :style="{ transform: `scaleX(${progress})` }" />
      <button class="reset" title="Back to the start in every window, reload live sites (R)" @click="reset">↺ Reset</button>
      <div class="counter">{{ idx + 1 }} / {{ scenes.length }}</div>
      <Transition name="hint">
        <div v-if="showHint" class="hint">
          <kbd>→</kbd> next <kbd>←</kbd> back <kbd>O</kbd> overview <kbd>P</kbd> presenter <kbd>F</kbd> fullscreen <kbd>B</kbd> blackout <kbd>R</kbd> reset
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
    radial-gradient(1200px 800px at 20% 10%, rgba(255, 255, 255, 0.06), transparent 70%),
    var(--deck-canvas);
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
.grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, var(--deck-grid) 2.5px, transparent 3px);
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
.scene.is-nested:not(.is-active) { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); border-radius: 160px; }
.scene { transition: border-radius 0.7s var(--ease-out), box-shadow 0.7s, opacity 0.6s; }
.scene.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.6s, visibility 0s 0.6s; }
/* the ghost scene (takeaway) covers the whole canvas and only exists while it's on stage */
.scene.is-ghost { box-shadow: none; border-radius: 0; transition: opacity 1.2s; z-index: 10; }
.scene.is-ghost:not(.is-active) { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 1.2s, visibility 0s 1.2s; }
.overview .scene.is-ghost .scene-label { display: none; }
/* outer layers (`outer` in deck.js): text written on the canvas round the talk, so no card shadow
   or corners (the scene draws no background); they only exist once the deck has reached them */
.scene.is-outer { box-shadow: none; border-radius: 0; transition: opacity 1s; }
.scene.is-outer.is-unreached { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 1s, visibility 0s 1s; }
.scene.is-outer .scene-label { display: none; }
.overview .scene.is-outer { pointer-events: none; }

/* the formation (engine/formation.js): moving cards glide on a transform transition whose timing
   App sets per card and per move (--fx-dur, --fx-delay, --fx-ease); a spinning formation orbits by
   animating --fx-spin, which both rotations in their transform add */
.scene.fx-mover { transition: border-radius 0.7s var(--ease-out), box-shadow 0.7s, opacity 0.6s, transform var(--fx-dur, 0s) var(--fx-ease, ease) var(--fx-delay, 0s); }
.scene.fx-mover.is-hidden { transition: opacity 0.6s, visibility 0s 0.6s, transform var(--fx-dur, 0s) var(--fx-ease, ease) var(--fx-delay, 0s); }
.scene.fx-spin {
  animation:
    fx-spin-in var(--fx-spin-in) cubic-bezier(0.5, 0, 0.75, 0.5) var(--fx-spin-delay, 0s),
    fx-spin var(--fx-period) linear calc(var(--fx-spin-delay, 0s) + var(--fx-spin-in)) infinite;
}
@keyframes fx-spin-in { to { --fx-spin: var(--fx-spin-a); } }
@keyframes fx-spin { from { --fx-spin: var(--fx-spin-a); } to { --fx-spin: calc(var(--fx-spin-a) + var(--fx-turn)); } }
/* skip cards step aside; the formation scene keeps its card shape and stays on top of the others */
.scene.fx-gone { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.5s, visibility 0s 0.5s; }
.scene.fx-centre { z-index: 2; }
.scene.is-active.fx-centre { border-radius: 48px; box-shadow: 0 60px 160px rgba(5, 10, 30, 0.55); }

.overview .scene { cursor: pointer; }
.overview .scene:hover { outline: 24px solid var(--deck-accent); }
.scene-label {
  position: absolute;
  left: 0;
  bottom: calc(100% + 30px);
  font: 700 72px var(--sans);
  color: var(--deck-accent);
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
  background: var(--deck-accent);
  color: var(--deck-on-accent);
}
.overview .scene:not(.is-nested) .scene-label { opacity: 1; }

.progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 8px;
  width: 100%;
  background: linear-gradient(90deg, var(--deck-accent), var(--deck-accent-2));
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

/* only shows while the mouse is moving, so it never sits on the projector */
.reset {
  position: absolute;
  top: 28px;
  right: 32px;
  z-index: 15;
  padding: 12px 22px;
  border: 0;
  border-radius: 999px;
  background: var(--deck-ink);
  color: var(--deck-accent);
  font: 700 22px var(--sans);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
.viewport:not(.idle) .reset { opacity: 1; pointer-events: auto; }
.reset:hover { background: #000; }

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
  background: var(--deck-accent);
  color: var(--deck-on-accent);
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

<style>
/* the formation's orbit angle (engine/formation.js): registered so CSS can animate it, and not
   inherited, so animating it on a card restyles only that card */
@property --fx-spin { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
</style>
