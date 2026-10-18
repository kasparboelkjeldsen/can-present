<script setup>
// A link to take home: a short label, the link as text and a QR code whose dots fall onto the
// canvas when its scene comes on stage (or on a build step).
//
//   <QrCode url="https://example.com/slides" label="The slides" />
//   <QrCode :url="…" label="…" :size="560" :at="1" ec="Q" layout="below" :show-url="false" />
//
// url:     what the code encodes (required). Keep it short: a shorter URL is a smaller, coarser
//          code that scans from further away.
// label:   the short description shown with it. text: the link as displayed (default: the URL
//          without https://, www. or a trailing slash). showUrl: false hides the link.
// size:    px of the code itself (modules rounded to whole px). The tile adds a 4-module quiet zone.
// ec:      error correction L | M | Q | H. The smallest QR version that fits is used.
// at:      build step it drops on (0 = when the scene comes on stage). It waits for the camera to
//          land; delay: ms after that before the first dot falls (default 100).
// layout:  'right' (label and link right of the code) | 'below' | 'none' (code only)
// tone:    'paper': --deck-ink modules on a --deck-paper tile. 'ink': the same tile on an
//          --deck-ink mat, for light slides. Modules are always dark on a light tile: if the
//          theme's ink isn't clearly darker than its paper, the code falls back to black on white.
//
// The drop: the finder squares thud down first, then the timing and alignment patterns, then the
// data rains in from the centre outwards (seeded, so it's the same every time), each dot falling
// from near the viewer (CSS perspective) with its shadow tightening under it, ~2.4 s whatever the
// version. Then the dots are swapped for one crisp SVG path. Past the scene, in the overview and
// in thumbnails it's the finished code; with prefers-reduced-motion it fades in.
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import qrcode from 'qrcode-generator'
import { useStep } from '../useStep.js'
import { cam } from '../cameraState.js'

const props = defineProps({
  url: { type: String, required: true },
  label: { type: String, default: '' },
  text: { type: String, default: null },
  size: { type: Number, default: 520 },
  ec: { type: String, default: 'M', validator: (v) => ['L', 'M', 'Q', 'H'].includes(v) },
  at: { type: Number, default: 0 },
  delay: { type: Number, default: null },
  layout: { type: String, default: 'right', validator: (v) => ['right', 'below', 'none'].includes(v) },
  showUrl: { type: Boolean, default: true },
  tone: { type: String, default: 'paper', validator: (v) => ['paper', 'ink'].includes(v) },
})

const { step, active, preview } = useStep()
const reducedMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null

// ---- encoding ----
const QUIET = 4 // modules of light margin round the code: the scanners' minimum
const qr = computed(() => {
  const prev = qrcode.stringToBytes
  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'] // URLs with non-ASCII characters
  try {
    const q = qrcode(0, props.ec) // type 0: the smallest version that fits
    q.addData(props.url, 'Byte')
    q.make()
    const n = q.getModuleCount()
    const dark = new Uint8Array(n * n)
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) dark[r * n + c] = q.isDark(r, c) ? 1 : 0
    return { n, dark }
  } catch (e) {
    console.warn(`[can-present] <QrCode>: can't encode "${props.url}" (ec ${props.ec}):`, e)
    return null
  } finally {
    qrcode.stringToBytes = prev
  }
})

const n = computed(() => qr.value?.n ?? 21)
const m = computed(() => Math.max(1, Math.round(props.size / n.value))) // px per module
const codePx = computed(() => n.value * m.value)
const tilePx = computed(() => (n.value + QUIET * 2) * m.value)
const perspective = computed(() => Math.round(codePx.value * 2.9)) // px from the viewer's eye to the canvas

// the finished code: one path of horizontal runs (no seams between modules at any zoom)
const path = computed(() => {
  const q = qr.value
  if (!q) return ''
  let d = ''
  for (let r = 0; r < q.n; r++) {
    for (let c = 0; c < q.n; c++) {
      if (!q.dark[r * q.n + c]) continue
      let e = c
      while (e + 1 < q.n && q.dark[r * q.n + e + 1]) e++
      d += `M${c} ${r}h${e - c + 1}v1h${c - e - 1}z`
      c = e
    }
  }
  return d
})

const shown = computed(() => props.text ?? props.url.replace(/^(https?:\/\/|mailto:)/i, '').replace(/^www\./i, '').replace(/\/$/, ''))

// ---- state ----
// On stage (and at its build step) the code waits for the camera to land, so the dots fall onto a
// card the audience is looking at, and hundreds of moving layers don't compete with the flight:
// "landed" = the camera hasn't moved for STILL ms (or MAX_WAIT has passed: flights take at most
// 2.4 s, rides 4 s).
const STILL = 120
const MAX_WAIT = 4500
const live = computed(() => active.value && !preview.value)
const playing = computed(() => live.value && step.value >= props.at)
const motion = ref(!reducedMotion?.matches)
const animated = computed(() => motion.value && !!qr.value)
const landed = ref(false)
const dropping = computed(() => playing.value && animated.value && landed.value)
const fading = computed(() => playing.value && !animated.value)
const waiting = computed(() => live.value && (step.value < props.at || (playing.value && animated.value && !landed.value)))
const settled = ref(false) // the drop has finished: the dots are gone, the path stays
let quietTimer, maxTimer
const stopTimers = () => { clearTimeout(quietTimer); clearTimeout(maxTimer) }
const land = () => { stopTimers(); landed.value = true }
watch(playing, (on) => {
  stopTimers()
  settled.value = false
  landed.value = false
  if (!on) return
  motion.value = !reducedMotion?.matches
  quietTimer = setTimeout(land, STILL)
  maxTimer = setTimeout(land, MAX_WAIT)
}, { immediate: true })
// the camera is only watched while waiting to land
watch(() => (playing.value && !landed.value ? `${cam.x} ${cam.y} ${cam.w} ${cam.r}` : null), (v) => {
  if (v == null) return
  clearTimeout(quietTimer)
  quietTimer = setTimeout(land, STILL)
})
onBeforeUnmount(stopTimers)
function onDropEnd(e) {
  if (e.target === e.currentTarget) settled.value = true
}

// ---- the drop ----
// Timeline, in ms from the first drop: finders 0 / 170 / 340, alignment patterns from 560,
// timing patterns 640–940, data 820–2070, each falling for FALL ms. Last landing ≈ 2.45 s.
const FALL = { block: 680, dot: 540 }
const DROPS = 480 // at most this many data drops (each is a composited layer, and so is its shadow)
const GROUPS = [[1, 1], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3], [4, 4], [5, 5], [6, 6]]
const start = computed(() => props.delay ?? 100)

// mulberry32, seeded from the URL: the same rain every time for the same code
function prng(str) {
  let a = 2166136261
  for (let i = 0; i < str.length; i++) a = Math.imul(a ^ str.charCodeAt(i), 16777619)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// centres of the alignment patterns of a version (ISO 18004 table E.1, as a formula)
function alignment(n) {
  const v = (n - 17) / 4
  if (v < 2) return []
  const count = Math.floor(v / 7) + 2
  const stepSize = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (count * 2 - 2)) * 2
  const pos = [6]
  for (let p = n - 7; pos.length < count; p -= stepSize) pos.splice(1, 0, p)
  const out = []
  for (const r of pos) for (const c of pos) {
    if ((r === 6 && c === 6) || (r === 6 && c === n - 7) || (r === n - 7 && c === 6)) continue // under a finder
    out.push([r, c])
  }
  return out
}

const drop = computed(() => {
  const q = qr.value
  if (!q) return null
  const N = q.n, M = m.value, px = codePx.value
  const rand = prng(`${props.url}|${props.ec}`)
  const spread = (k) => (rand() * 2 - 1) * k
  const H = Math.round(px * 1.5) // how high (towards the viewer) a dot starts
  const P = perspective.value
  // Seen from a viewer above the code's centre, a high dot appears pushed outwards by z / (P - z) of
  // its distance from the centre (2× at the top), so the rain would look like an implosion. Moving
  // each dot inwards in proportion to its height (--cx/--cy × z) keeps only KEEP of that push:
  // apparent offset = o × (1 + KEEP × z / (P - z)). It's linear in z, so it rides the same easing.
  const KEEP = 0.3
  const t0 = start.value
  const taken = new Uint8Array(N * N)
  const drops = []
  // a drop: a w×h box of modules at (r, c); `cells` lists the dark ones inside it when it's a group
  const add = (kind, r, c, w, h, t, dur, tilt, cells = null) => {
    const ox = (c + w / 2) * M - px / 2, oy = (r + h / 2) * M - px / 2
    drops.push({
      kind, t, dur,
      cells: cells?.map(([dr, dc]) => `left:${dc * M}px;top:${dr * M}px`),
      style: `left:${c * M}px;top:${r * M}px;width:${w * M}px;height:${h * M}px;--t:${Math.round(t)}ms;--f:${dur}ms;` +
        `--dx:${spread(px * 0.05).toFixed(1)}px;--dy:${spread(px * 0.05).toFixed(1)}px;` +
        `--cx:${((-ox * (1 - KEEP)) / P).toFixed(4)};--cy:${((-oy * (1 - KEEP)) / P).toFixed(4)};` +
        `--rx:${spread(tilt).toFixed(1)}deg;--ry:${spread(tilt).toFixed(1)}deg;--rz:${spread(tilt * 1.2).toFixed(1)}deg;` +
        `--h:${kind === 'dot' ? H : Math.round(H * 1.1)}px`,
    })
  }
  const claim = (r0, c0, w) => {
    for (let r = r0; r < r0 + w; r++) for (let c = c0; c < c0 + w; c++) taken[r * N + c] = 1
  }

  // 1. the finder squares, as solid blocks
  ;[[0, 0], [0, N - 7], [N - 7, 0]].forEach(([r, c], i) => {
    claim(r, c, 7)
    add('finder', r, c, 7, 7, t0 + i * 170, FALL.block, 7)
  })
  // 2. alignment blocks (centre outwards), then the timing lines, sweeping out from the corner
  const al = alignment(N).sort((a, b) => Math.hypot(a[0] - N / 2, a[1] - N / 2) - Math.hypot(b[0] - N / 2, b[1] - N / 2))
  const alStep = al.length > 1 ? Math.min(90, 320 / (al.length - 1)) : 0
  al.forEach(([r, c], j) => {
    claim(r - 2, c - 2, 5)
    add('align', r - 2, c - 2, 5, 5, t0 + 560 + j * alStep, FALL.block - 60, 9)
  })
  const len = Math.max(1, N - 17)
  for (let k = 8; k <= N - 9; k++) {
    for (const [r, c] of [[6, k], [k, 6]]) {
      if (taken[r * N + c] || !q.dark[r * N + c]) continue
      taken[r * N + c] = 1
      add('dot', r, c, 1, 1, t0 + 640 + (300 * (k - 8)) / len, FALL.dot, 18)
    }
  }
  // 3. the data. One element (and one shadow) per dark module up to about version 5; bigger codes
  // fall in small chunks (2×1, 2×2, 3×2 … modules) so there are never more than DROPS of them:
  // hundreds of composited layers are smooth, thousands aren't.
  const free = (r, c) => r < N && c < N && !taken[r * N + c] && q.dark[r * N + c]
  let cw = 1, ch = 1
  for (const [w, h] of GROUPS) {
    let count = 0
    for (let r = 0; r < N; r += h) for (let c = 0; c < N; c += w) {
      let any = false
      for (let i = 0; i < h && !any; i++) for (let j = 0; j < w && !any; j++) any = free(r + i, c + j)
      if (any) count++
    }
    ;[cw, ch] = [w, h]
    if (count <= DROPS) break
  }
  const rest = []
  const half = (N - 1) / 2
  for (let r = 0; r < N; r += ch) for (let c = 0; c < N; c += cw) {
    const cells = []
    for (let i = 0; i < ch; i++) for (let j = 0; j < cw; j++) if (free(r + i, c + j)) cells.push([r + i, c + j])
    if (!cells.length) continue
    const r0 = Math.min(...cells.map((x) => x[0])), r1 = Math.max(...cells.map((x) => x[0]))
    const c0 = Math.min(...cells.map((x) => x[1])), c1 = Math.max(...cells.map((x) => x[1]))
    const d = Math.hypot((r0 + r1) / 2 - half, (c0 + c1) / 2 - half) / (half * Math.SQRT2)
    rest.push({ r0, c0, w: c1 - c0 + 1, h: r1 - r0 + 1, cells: cells.length > 1 ? cells.map(([cr, cc]) => [cr - r0, cc - c0]) : null, key: d * 0.62 + rand() * 0.38 })
  }
  // shuffled, biased to fill from the centre outwards, denser in the middle of the run
  rest.sort((a, b) => a.key - b.key)
  rest.forEach(({ r0, c0, w, h, cells }, i) => {
    const u = rest.length > 1 ? i / (rest.length - 1) : 0
    const f = 0.55 * u + 0.45 * (0.5 + Math.asin(2 * u - 1) / Math.PI) // sparse first and last drops
    add('dot', r0, c0, w, h, t0 + 820 + 1250 * f, FALL.dot, cells ? 16 : 24, cells)
  })

  // DOM order = falling order, so a dot in the air paints over the ones that have landed
  drops.sort((a, b) => a.t - b.t)
  const end = Math.max(...drops.map((d) => d.t + d.dur))
  return { drops, end: Math.ceil(end), H, group: `${cw}x${ch}` }
})

// ---- scannability: modules must be clearly darker than the tile, whatever the theme ----
const tile = ref(null)
const safe = ref(false)
function rgb(s) {
  const nums = (s.match(/[\d.]+/g) ?? []).map(Number)
  if (s.startsWith('color(srgb')) return nums.slice(0, 3).map((v) => v * 255)
  return s.startsWith('rgb') && nums.length >= 3 ? nums.slice(0, 3) : null
}
function luminance([r, g, b]) {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
onMounted(() => {
  if (!tile.value) return
  const cs = getComputedStyle(tile.value)
  const ink = rgb(cs.color), paper = rgb(cs.backgroundColor)
  if (!ink || !paper) return
  const li = luminance(ink), lp = luminance(paper)
  if (lp <= li || (lp + 0.05) / (li + 0.05) < 7) {
    safe.value = true
    console.warn(`[can-present] <QrCode>: the theme's --deck-ink (${cs.color}) isn't clearly darker than --deck-paper (${cs.backgroundColor}); drawing the code black on white`)
  }
})
</script>

<template>
  <div
    class="qr-code"
    :class="[`qr-code--${layout}`, `qr-code--${tone}`, { 'is-waiting': waiting, 'is-dropping': dropping, 'is-fading': fading, 'qr-code--safe': safe }]"
    :style="{ '--m': m + 'px', '--qr-code': codePx + 'px', '--qr-tile': tilePx + 'px', '--qr-start': start + 'ms', '--qr-end': (drop?.end ?? 0) + 'ms' }"
  >
    <div ref="tile" class="qr-tile" :style="{ width: tilePx + 'px', height: tilePx + 'px' }">
      <svg
        v-if="qr"
        class="qr-svg"
        :viewBox="`0 0 ${n} ${n}`"
        :width="codePx"
        :height="codePx"
        role="img"
        :aria-label="`QR code: ${url}`"
      ><path :d="path" /></svg>
      <div v-else class="qr-error">can't encode this URL</div>
      <div v-if="dropping && !settled" class="qr-drop" :style="{ perspective: perspective + 'px' }" :data-drops="drop.drops.length" :data-group="drop.group" aria-hidden="true" @animationend="onDropEnd">
        <div class="qr-shades">
          <template v-for="(d, i) in drop.drops" :key="'s' + i">
            <i class="qr-shade" :class="`qr-shade--${d.kind}`" :style="d.style" />
            <i v-if="d.kind !== 'dot'" class="qr-ring" :style="d.style" />
          </template>
        </div>
        <i v-for="(d, i) in drop.drops" :key="i" class="qr-dot" :class="[`qr-dot--${d.kind}`, { 'qr-dot--group': d.cells }]" :style="d.style"><b v-for="(c, j) in d.cells" :key="j" :style="c" /></i>
      </div>
    </div>
    <div v-if="layout !== 'none' && (label || showUrl)" class="qr-text">
      <p v-if="label" class="qr-label">{{ label }}</p>
      <p v-if="showUrl" class="qr-link">{{ shown }}</p>
    </div>
  </div>
</template>

<style>
/* zero specificity (:where), so a deck's theme can restyle any part */
:where(.qr-code) {
  --qr-ink: var(--deck-ink);
  --qr-paper: var(--deck-paper);
  display: inline-flex;
  align-items: center;
  gap: clamp(32px, calc(var(--qr-code) * 0.11), 80px);
  flex: none;
}
:where(.qr-code--below) { flex-direction: column; text-align: center; gap: clamp(20px, calc(var(--qr-code) * 0.045), 40px); }
:where(.qr-code--safe) { --qr-ink: #000; --qr-paper: #fff; }

:where(.qr-tile) {
  position: relative;
  flex: none;
  border-radius: var(--m);
  background: var(--qr-paper);
  color: var(--qr-ink);
}
/* tone="ink": the light tile on a dark mat (a light quiet zone, always) */
:where(.qr-code--ink .qr-tile) { box-shadow: 0 0 0 calc(var(--m) * 1.5) var(--deck-ink); }
:where(.qr-svg) { position: absolute; left: calc(var(--m) * 4); top: calc(var(--m) * 4); display: block; }
:where(.qr-svg path) { fill: currentColor; }
:where(.qr-error) { position: absolute; inset: 0; display: grid; place-items: center; font: 700 26px var(--sans); color: var(--deck-accent-2); }

:where(.qr-text) { display: flex; flex-direction: column; gap: 14px; max-width: 760px; min-width: 0; }
:where(.qr-code--below .qr-text) { align-items: center; max-width: calc(var(--qr-tile) + 240px); }
:where(.qr-label) {
  margin: 0;
  font-size: clamp(26px, calc(var(--qr-code) * 0.085), 60px);
  font-weight: 700;
  line-height: 1.15;
}
:where(.qr-link) {
  margin: 0;
  font-size: clamp(26px, calc(var(--qr-code) * 0.066), 44px);
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: anywhere;
  text-decoration: underline 0.09em var(--deck-accent);
  text-underline-offset: 0.18em;
  user-select: all; /* one click selects the whole link, to copy it */
  cursor: text;
}

/* ---- waiting for its build step ---- */
.qr-code.is-waiting .qr-tile, .qr-code.is-waiting .qr-text { opacity: 0; }

/* ---- reduced motion: a plain fade ---- */
.qr-code.is-fading .qr-tile, .qr-code.is-fading .qr-text { animation: fade-in 0.7s ease both; animation-delay: var(--qr-start); }

/* ---- the drop ---- */
/* the tile settles in just before the first dot; the finished path is held back until the dots
   have landed, and the dots vanish on that same frame (both end at --qr-end) */
.qr-code.is-dropping .qr-tile { animation: qr-tile-in 0.45s var(--ease-out, ease-out) both; animation-delay: max(0ms, calc(var(--qr-start) - 300ms)); }
.qr-code.is-dropping .qr-svg { animation: qr-hold var(--qr-end) linear backwards; }
.qr-code.is-dropping .qr-text { animation: rise 0.9s var(--ease-out, ease-out) both; animation-delay: calc(var(--qr-start) + 250ms); }
@keyframes qr-tile-in { from { opacity: 0; transform: scale(0.97); } }
@keyframes qr-hold { from, to { visibility: hidden; } }

.qr-drop {
  position: absolute;
  left: calc(var(--m) * 4);
  top: calc(var(--m) * 4);
  width: var(--qr-code);
  height: var(--qr-code);
  pointer-events: none;
  visibility: hidden;
  animation: qr-show var(--qr-end) linear backwards;
}
@keyframes qr-show { from, to { visibility: visible; } }
.qr-shades { position: absolute; inset: 0; }
.qr-dot, .qr-shade { position: absolute; display: block; animation-delay: var(--t); animation-duration: var(--f); animation-fill-mode: both; }

/* a dot: from --h towards the viewer (big, faint, drifted, tilted) down onto the tile, gravity-eased,
   then a small bounce; squash on impact (the `scale` property, so it doesn't bend the fall) */
.qr-dot {
  background: currentColor;
  animation-name: qr-fall, qr-land;
  animation-timing-function: linear;
}
.qr-dot--finder, .qr-dot--align { background: none; border: var(--m) solid currentColor; }
/* a chunk of a big code: its modules are children, painted into the chunk's one layer */
.qr-dot--group { background: none; }
.qr-dot--group > b { position: absolute; width: var(--m); height: var(--m); background: currentColor; }
.qr-dot--finder::after, .qr-dot--align::after { content: ''; position: absolute; inset: var(--m); background: currentColor; }
@keyframes qr-fall {
  0% { transform: translate3d(calc(var(--dx) + var(--cx) * var(--h)), calc(var(--dy) + var(--cy) * var(--h)), var(--h)) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)); animation-timing-function: cubic-bezier(0.4, 0, 0.78, 0.4); }
  68% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); animation-timing-function: cubic-bezier(0.25, 0.6, 0.45, 1); }
  84% { transform: translate3d(calc(var(--cx) * var(--h) * 0.07), calc(var(--cy) * var(--h) * 0.07), calc(var(--h) * 0.07)) rotateX(0deg) rotateY(0deg) rotateZ(0deg); animation-timing-function: cubic-bezier(0.55, 0, 0.75, 0.45); }
  100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
}
@keyframes qr-land {
  0% { opacity: 0; }
  30% { opacity: 1; }
  64% { scale: 1; }
  70% { scale: 1.13; }
  80% { scale: 1; }
  100% { opacity: 1; scale: 1; }
}
/* the blocks are heavy: barely a bounce, a firmer thud */
.qr-dot--finder, .qr-dot--align { animation-name: qr-fall-heavy, qr-thud; }
@keyframes qr-fall-heavy {
  0% { transform: translate3d(calc(var(--dx) + var(--cx) * var(--h)), calc(var(--dy) + var(--cy) * var(--h)), var(--h)) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)); animation-timing-function: cubic-bezier(0.42, 0, 0.82, 0.38); }
  68% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); animation-timing-function: cubic-bezier(0.25, 0.6, 0.45, 1); }
  80% { transform: translate3d(calc(var(--cx) * var(--h) * 0.022), calc(var(--cy) * var(--h) * 0.022), calc(var(--h) * 0.022)) rotateX(0deg) rotateY(0deg) rotateZ(0deg); animation-timing-function: cubic-bezier(0.55, 0, 0.75, 0.45); }
  90%, 100% { transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
}
@keyframes qr-thud {
  0% { opacity: 0; }
  26% { opacity: 1; }
  66% { scale: 1; }
  71% { scale: 1.07 1.05; }
  82% { scale: 0.99; }
  92%, 100% { opacity: 1; scale: 1; }
}

/* its shadow on the tile: wide and faint while the dot is high, tightening and darkening as it
   comes down (offset away from a light at the top left), gone once the dot covers it */
.qr-shade {
  --qr-shadow: color-mix(in srgb, var(--qr-ink) 70%, transparent);
  background: radial-gradient(closest-side, var(--qr-shadow) 30%, transparent);
  animation-name: qr-shade;
  animation-timing-function: linear;
}
@keyframes qr-shade {
  0% { transform: translate(calc(var(--dx) + var(--h) * 0.05), calc(var(--dy) + var(--h) * 0.08)) scale(3); opacity: 0; animation-timing-function: cubic-bezier(0.4, 0, 0.78, 0.4); }
  68% { transform: translate(0px, 0px) scale(1.3); opacity: 0.75; animation-timing-function: ease-out; }
  84% { transform: translate(0px, 0px) scale(1.5); opacity: 0.35; }
  100% { transform: translate(0px, 0px) scale(1.3); opacity: 0; }
}
.qr-shade--finder, .qr-shade--align {
  background: var(--qr-shadow);
  border-radius: calc(var(--m) * 2);
  box-shadow: 0 0 calc(var(--m) * 3) calc(var(--m) * 0.4) var(--qr-shadow);
  animation-name: qr-shade-heavy;
}
@keyframes qr-shade-heavy {
  0% { transform: translate(calc(var(--dx) + var(--h) * 0.05), calc(var(--dy) + var(--h) * 0.08)) scale(2.1); opacity: 0; animation-timing-function: cubic-bezier(0.42, 0, 0.82, 0.38); }
  68% { transform: translate(0px, 0px) scale(0.9); opacity: 0.42; animation-timing-function: ease-out; }
  100% { transform: translate(0px, 0px) scale(0.9); opacity: 0; }
}
/* the thud: a faint ring of dust spreading from the block as it lands */
.qr-ring {
  position: absolute;
  display: block;
  margin: calc(var(--m) * -0.35);
  box-sizing: content-box;
  border: calc(var(--m) * 0.35) solid var(--qr-ink);
  border-radius: calc(var(--m) * 1.2);
  opacity: 0;
  animation: qr-ring var(--f) linear var(--t) both;
}
@keyframes qr-ring {
  0%, 67% { opacity: 0; transform: scale(1); }
  70% { opacity: 0.32; transform: scale(1.04); animation-timing-function: cubic-bezier(0.2, 0.7, 0.3, 1); }
  100% { opacity: 0; transform: scale(1.45); }
}
</style>
