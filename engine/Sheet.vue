<script setup>
// ?sheet: every scene of the deck on one page, for checking a whole deck in one screenshot.
//   ?sheet               one tile per scene, at its last build step (4 columns)
//   ?sheet&cols=3        another number of columns
//   ?sheet&steps         one tile per build step (0…steps) of every scene
//   ?sheet&only=a,b      just these scene ids
// A tile on a step with a camera frame (`frames` in deck.js) gets the frame's box outlined, and its
// zoom in the caption. Tiles always render the whole card at zoom 1: <Detail>s for deep zoom stay hidden.
// About 1.5 s after mount it audits every tile: text under 26px, text outside the 1920×1080 card,
// and a .slide that overflows. Results: a badge + outlines per tile, a plain-text list at the top
// (readable with get_page_text), window.__deckAudit and console.table.
// Mark engine chrome that is small on purpose with data-audit="ignore".
//
// Deliberately doesn't import useDeck.js (keys, URL hash, window sync): only the deck itself.
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import deck from '@deck/deck.js'
import SceneFrame from './SceneFrame.vue'
import { validateFrames, normalizeFrames, frameAt } from './frames.js'

const W = 1920
const H = 1080
const MIN_SIZE = 26

const params = new URLSearchParams(location.search)
const cols = Math.min(12, Math.max(1, parseInt(params.get('cols'), 10) || 4))
const perStep = params.has('steps')
const only = (params.get('only') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
document.title = '▦ Sheet — ' + document.title

const scenes = deck.scenes
  .map((sc, i) => ({ sc, n: i + 1 }))
  .filter(({ sc }) => !only.length || only.includes(sc.id))
const unknownIds = only.filter((id) => !deck.scenes.some((sc) => sc.id === id))

// the camera frame in force on a tile's step (`frames` in deck.js), drawn as an outline
const frameLists = new Map(deck.scenes.filter((sc) => sc.frames != null && !validateFrames(sc.frames, sc.steps ?? 0).length).map((sc) => [sc, normalizeFrames(sc.frames)]))
function frameOf(t) {
  const f = frameLists.has(t.sc) && frameAt(frameLists.get(t.sc), t.step)
  if (!f) return null
  const { cx, cy, w } = f.box
  const h = (w * 9) / 16
  return { step: f.step, w, zoom: W / w, style: { left: cx - w / 2 + 'px', top: cy - h / 2 + 'px', width: w + 'px', height: h + 'px' } }
}
const zoomLabel = (z) => (z >= 10 ? Math.round(z) : Math.round(z * 10) / 10) + '×'

// A scene without builds renders "done" (Infinity, as in the overview), so scenes that assemble
// themselves on stage show their finished state. With ?steps every step is literal, 0…steps.
// Tiles render with `preview`, so engine blocks skip their timers: a timer-mode <Diagram> shows
// its final stage (a steps-mode one follows the tile's step), <BigNumber> its final value, and
// packets and live sites aren't drawn.
const tiles = scenes.flatMap(({ sc, n }) => {
  const last = sc.steps ?? 0
  const steps = perStep ? Array.from({ length: last + 1 }, (_, s) => s) : [last > 0 ? last : Infinity]
  return steps.map((step) => {
    const label = step === Infinity ? 'end' : String(step)
    const t = { key: `${sc.id}/${label}`, sc, n, step, label }
    return { ...t, frame: frameOf(t) }
  })
})

const flags = (sc) => [sc.skip && 'skip', sc.ghost && 'ghost', sc.outer && 'outer', sc.parent && `in ${sc.parent}`, sc.back != null && `back of ${sc.back}`, sc.formation != null && 'formation', sc.hand != null && sc.hand !== false && 'hand'].filter(Boolean)
const href = (t) => `${location.pathname}#${t.sc.id}/${t.step === Infinity ? t.sc.steps ?? 0 : t.step}`

// ---- scale every tile to its column width (like ScenePreview) ----
const grid = ref(null)
const scale = ref(0.2)
let ro
onMounted(() => {
  ro = new ResizeObserver(() => {
    const first = grid.value?.querySelector('.box')
    if (first) scale.value = first.clientWidth / W
  })
  ro.observe(grid.value)
})
onBeforeUnmount(() => ro?.disconnect())

// ---- audit ----
const findings = ref(null) // null while waiting
const byTile = computed(() => {
  const m = {}
  for (const f of findings.value ?? []) (m[f.tile] ??= []).push(f)
  return m
})
const boxes = ref([])

function hidden(el, stop) {
  for (let e = el; e && e !== stop; e = e.parentElement) {
    const cs = getComputedStyle(e)
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return true
  }
  return false
}

// SVG text is drawn in the SVG's own units: scale its font size by how big the viewBox is drawn.
function svgFactor(el, k) {
  let svg = el.ownerSVGElement
  while (svg?.ownerSVGElement) svg = svg.ownerSVGElement
  const vb = svg?.viewBox?.baseVal
  if (!vb || !vb.width || !vb.height) return 1
  const r = svg.getBoundingClientRect()
  return Math.min(r.width / k / vb.width, r.height / k / vb.height)
}

function auditTile(tileEl, t) {
  const frame = tileEl.querySelector('.scene-frame')
  if (!frame) return []
  const fr = frame.getBoundingClientRect()
  const k = fr.width / W
  const out = []
  const add = (kind, text, size, box) =>
    out.push({ tile: t.key, scene: t.sc.id, step: t.label, kind, text: text.slice(0, 40), size: Math.round(size * 10) / 10, box })

  const root = frame.firstElementChild
  if (root && (root.scrollWidth > W || root.scrollHeight > H)) {
    add('overflow', `.slide content ${root.scrollWidth}×${root.scrollHeight}`, Math.max(root.scrollWidth, root.scrollHeight), { x: 0, y: 0, w: W, h: H })
  }

  const range = document.createRange()
  for (const el of frame.querySelectorAll('*')) {
    if (['STYLE', 'SCRIPT', 'title'].includes(el.tagName)) continue
    if (el.closest('[data-audit="ignore"]')) continue
    const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim())
    if (!nodes.length || hidden(el, frame)) continue

    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
    for (const n of nodes) {
      range.selectNodeContents(n)
      for (const r of range.getClientRects()) {
        if (!r.width && !r.height) continue
        x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom)
      }
    }
    if (x1 === Infinity) continue
    const box = { x: (x1 - fr.left) / k, y: (y1 - fr.top) / k, w: (x2 - x1) / k, h: (y2 - y1) / k }
    const text = nodes.map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim()
    const size = parseFloat(getComputedStyle(el).fontSize) * (el instanceof SVGElement ? svgFactor(el, k) : 1)

    if (size < MIN_SIZE - 0.05) add('small', text, size, box)
    if (box.x < -1 || box.y < -1 || box.x + box.w > W + 1 || box.y + box.h > H + 1) add('outside', text, size, box)
  }
  return out
}

const line = (f) => `${f.scene}/${f.step}: ${f.kind} "${f.text}" ${f.size}px`
const report = computed(() => (findings.value ?? []).map(line).join('\n'))

onMounted(async () => {
  await Promise.all([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))])
  await nextTick()
  const all = []
  for (const t of tiles) {
    const el = grid.value?.querySelector(`[data-tile="${CSS.escape(t.key)}"]`)
    if (el) all.push(...auditTile(el, t))
  }
  findings.value = all
  window.__deckAudit = all
  console.table(all.map(({ box, tile, ...f }) => f))
})
</script>

<template>
  <div class="sheet" :style="{ '--cols': cols, '--scale': scale }">
    <header>
      <h1>{{ deck.title ?? deck.id }}</h1>
      <p class="meta">
        {{ scenes.length }} scene{{ scenes.length === 1 ? '' : 's' }} · {{ tiles.length }} tile{{ tiles.length === 1 ? '' : 's' }}
        <template v-if="perStep"> · every build step</template>
        <template v-else> · last build step</template>
        <template v-if="only.length"> · only {{ only.join(', ') }}</template>
        · <span class="hint">?sheet&amp;cols=3 · &amp;steps · &amp;only=a,b</span>
      </p>
      <p v-if="unknownIds.length" class="bad">Unknown scene id: {{ unknownIds.join(', ') }}</p>
      <p v-if="findings === null" class="status">Audit: running…</p>
      <template v-else>
        <p class="status" :class="{ bad: findings.length }">
          Audit: {{ findings.length }} finding{{ findings.length === 1 ? '' : 's' }}
          (text under {{ MIN_SIZE }}px, text outside the card, overflowing .slide)
        </p>
        <pre v-if="findings.length" class="findings">{{ report }}</pre>
      </template>
    </header>

    <div ref="grid" class="grid">
      <figure v-for="t in tiles" :key="t.key" class="tile" :data-tile="t.key">
        <a class="box" :href="href(t)" target="_blank" :title="`Open #${t.sc.id}/${t.label}`">
          <div class="inner">
            <SceneFrame :scene="t.sc" :step="t.step" :active="false" :near="false" preview />
            <div v-if="t.frame" class="frame-box" :class="{ tiny: t.frame.w * scale < 14 }" :style="t.frame.style" />
            <div class="marks">
              <div
                v-for="(f, i) in byTile[t.key] ?? []"
                :key="i"
                class="mark"
                :style="{ left: f.box.x + 'px', top: f.box.y + 'px', width: f.box.w + 'px', height: f.box.h + 'px' }"
              />
            </div>
          </div>
          <span v-if="byTile[t.key]?.length" class="badge">{{ byTile[t.key].length }}</span>
        </a>
        <figcaption>
          <b>{{ t.n }}</b>
          <span class="id">{{ t.sc.id }}</span>
          <span class="title">{{ t.sc.title }}</span>
          <span class="steps">{{ perStep ? `step ${t.label} of ${t.sc.steps ?? 0}` : `steps: ${t.sc.steps ?? 0}` }}</span>
          <span v-if="t.frame" class="steps">frame {{ t.frame.step }} · {{ zoomLabel(t.frame.zoom) }}</span>
          <i v-for="f in flags(t.sc)" :key="f" class="flag">{{ f }}</i>
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.sheet {
  height: 100%;
  overflow: auto;
  padding: 28px 32px 60px;
  background: var(--deck-canvas);
  color: var(--deck-paper);
  font-family: var(--sans);
}
header { margin-bottom: 24px; }
h1 { margin: 0 0 6px; font-size: 26px; }
.meta, .status { margin: 4px 0; font-size: 15px; opacity: 0.85; }
.hint { font-family: var(--mono); opacity: 0.7; }
.bad { color: var(--deck-accent-2); opacity: 1; font-weight: 700; }
.findings {
  margin: 10px 0 0;
  padding: 14px 18px;
  max-height: 40vh;
  overflow: auto;
  border-radius: 10px;
  background: var(--deck-ink);
  color: var(--deck-paper);
  font: 400 13px/1.5 var(--mono);
  white-space: pre-wrap;
}
.grid { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 28px 20px; }
.tile { margin: 0; min-width: 0; }
.box {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  background: var(--deck-ink);
  box-shadow: 0 0 0 1px var(--deck-grid);
}
.inner { position: absolute; top: 0; left: 0; width: 1920px; height: 1080px; transform: scale(var(--scale)); transform-origin: 0 0; pointer-events: none; }
.marks { position: absolute; inset: 0; z-index: 100; }
.frame-box { position: absolute; z-index: 99; outline: calc(3px / var(--scale)) dashed var(--deck-accent); box-shadow: 0 0 0 calc(1px / var(--scale)) var(--deck-ink); }
/* a box too small to see at tile size: a ring around it instead */
.frame-box.tiny::after { content: ''; position: absolute; left: 50%; top: 50%; width: calc(22px / var(--scale)); height: calc(22px / var(--scale)); transform: translate(-50%, -50%); border-radius: 50%; border: calc(3px / var(--scale)) solid var(--deck-accent); box-shadow: 0 0 0 calc(1px / var(--scale)) var(--deck-ink); }
.mark { position: absolute; outline: calc(3px / var(--scale)) solid var(--deck-accent-2); outline-offset: calc(1px / var(--scale)); }
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 101;
  min-width: 28px;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--deck-accent-2);
  color: var(--deck-paper);
  font: 700 15px var(--sans);
  text-align: center;
}
figcaption { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; margin-top: 8px; font-size: 14px; line-height: 1.3; }
figcaption b { color: var(--deck-accent); }
.id { font-family: var(--mono); font-weight: 700; }
.title { opacity: 0.8; }
.steps { font-family: var(--mono); opacity: 0.6; }
.flag { padding: 1px 7px; border-radius: 999px; background: var(--deck-accent); color: var(--deck-on-accent); font: 700 12px var(--sans); font-style: normal; }
</style>
