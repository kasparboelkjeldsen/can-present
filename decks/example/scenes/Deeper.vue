<script setup>
// "Powers of ten": one scene, four presses, each flying the camera deeper into this card
// (deck.js: steps: 4, frames: deeper.frames). From the card, to a component on it, to one line of
// its code, to one character of that line, and into the dot of its `i`, where the title scene
// turns out to live: the deck, inside itself.
//
// <Detail :from :to> shows each level only while the camera is close enough to read it. It
// follows the zoom (useStep().zoom, the card's on-screen scale), so content materialises during
// the flight, not after it. The levels are boxes inside boxes (deeper.js): each draws its content
// at normal sizes in its own 1920×1080 space, scaled down into its parent, which keeps the text
// sharp at 500×.
import Detail from '@engine/components/Detail.vue'
import Title from './Title.vue'
import { PANEL, CODE, CODE_LINES, REST, DOT, CHAR, TITLE, LINE, baseline, box } from './deeper.js'

// from far away the code is a minimap: one bar per run, as wide as its text (0.6em a character)
const CH = CODE.size * 0.6
const bars = CODE_LINES.flatMap((runs, i) => {
  const line = runs ?? [['k', 'ı'], ...REST]
  let col = 0
  const out = []
  for (const [cls, text] of line) {
    const lead = text.length - text.trimStart().length
    const word = text.trim()
    if (word) out.push({ cls, x: CODE.x + (col + lead) * CH, y: baseline(i + 1) - CODE.size * 0.55, w: word.length * CH })
    col += text.length
  }
  return out
})
</script>

<template>
  <div class="slide slide--dark deeper">
    <div class="copy">
      <span class="kicker">powers of ten</span>
      <h2 class="h2">Look closer</h2>
      <p class="lead">Each press flies the camera deeper into this card. Whatever's too small to read appears as it gets close.</p>
    </div>

    <Detail class="tag tag--panel" :from="1.6" :to="4.5">a component</Detail>

    <!-- data-audit="ignore": the sheet audits text at zoom 1, but everything in here is read at
         2–530× (and hidden by <Detail> until the camera is that close). Its sizes are chosen for
         the zoom each level is read at: at least 26px on screen there. -->
    <div class="level panel" :style="box(PANEL)" data-audit="ignore">
      <Detail class="bar" :from="1.6"><i /><i /><i /><span>Deeper.vue</span></Detail>
      <svg class="code" viewBox="0 0 1920 1080" aria-hidden="true">
        <Detail tag="g" class="minimap" :until="1.3">
          <rect v-for="(b, i) in bars" :key="i" :class="b.cls" :x="b.x" :y="b.y" :width="b.w" :height="CODE.size * 0.5" :rx="CODE.size * 0.25" />
        </Detail>
        <!-- every other line fades away on the way to frame 2 -->
        <Detail tag="g" :from="1.6" :to="5">
          <template v-for="(runs, i) in CODE_LINES" :key="i">
            <text v-if="runs" :x="CODE.x" :y="baseline(i + 1)"><tspan v-for="([cls, text], j) in runs" :key="j" :class="cls">{{ text }}</tspan></text>
          </template>
        </Detail>
        <!-- the rest of the line goes on the way to frame 3 (a transparent ı keeps its place) -->
        <Detail tag="g" :from="1.6" :to="18">
          <text :x="CODE.x" :y="baseline(LINE)"><tspan class="ghost">ı</tspan><tspan v-for="([cls, text], j) in REST" :key="j" :class="cls">{{ text }}</tspan></text>
        </Detail>
        <!-- the i stays: a dotless ı from the font, and a dot the camera can find -->
        <Detail tag="g" :from="1.6">
          <text :x="CODE.x" :y="baseline(LINE)" class="k">ı</text>
          <circle class="dot" :cx="DOT.x" :cy="DOT.y" :r="DOT.r" />
        </Detail>
      </svg>
      <Detail class="tag tag--line" :from="5.5" :to="16" :style="{ left: CODE.x + 'px', top: baseline(LINE) - 76 + 'px' }">a line of code</Detail>
      <div class="level" :style="box(CHAR)">
        <Detail class="tag tag--char" :from="22" :to="70">one character</Detail>
      </div>
      <!-- the bottom: the deck's own title scene (its entrance animation off, it's already there) -->
      <Detail class="level portal" :from="60" :style="box(TITLE)"><Title /></Detail>
    </div>

    <!-- the overview easter egg: only readable, and only shown, from far away -->
    <Detail class="afar" :until="0.25"><span>zoom in</span></Detail>
  </div>
</template>

<style scoped>
.deeper { justify-content: center; }
.copy { display: flex; flex-direction: column; gap: 40px; max-width: 700px; }

/* a box of the scene's geometry (deeper.js): its own 1920×1080 space, scaled into its parent */
.level { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 50% 50%; }

.panel { border-radius: 56px; background: var(--code-bg); box-shadow: 0 0 0 6px rgba(245, 241, 232, 0.1); }
.bar { display: flex; align-items: center; gap: 22px; height: 130px; padding: 0 56px; border-bottom: 3px solid rgba(245, 241, 232, 0.08); }
.bar i { width: 30px; height: 30px; border-radius: 50%; background: rgba(245, 241, 232, 0.18); }
.bar span { margin-left: 20px; font: 700 44px var(--mono); color: var(--deck-accent); }

.code { position: absolute; inset: 0; overflow: visible; }
.code text { font: 400 56px var(--mono); fill: #ecebe6; white-space: pre; }
.code .k { fill: var(--deck-accent); }
.code .t { fill: #9fb0ff; }
.code .s { fill: #ffb4aa; }
.code .ghost { fill: none; }
.code .dot { fill: var(--deck-accent); }
.minimap rect { fill: rgba(236, 235, 230, 0.35); }
.minimap rect.k { fill: var(--deck-accent); opacity: 0.6; }
.minimap rect.t { fill: #9fb0ff; opacity: 0.6; }
.minimap rect.s { fill: #ffb4aa; opacity: 0.6; }

/* the label of each level, sized for the zoom it's read at */
.tag {
  position: absolute;
  padding: 0.4em 1em;
  border-radius: 999px;
  background: var(--deck-accent);
  color: var(--deck-on-accent);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
}
.tag--panel { font-size: 16px; left: 970px; top: 380px; } /* card space, read at ~2.3× */
.tag--line { font-size: 13px; } /* PANEL's space, read at ~8× */
.tag--char { font-size: 30px; left: 1170px; top: 540px; transform: translateY(-50%); } /* CHAR's space, ~34× */

.portal { pointer-events: none; }
.portal :deep(.rise) { animation: none !important; }

.afar {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--deck-ink);
}
.afar span { font: 800 260px/1 var(--sans); letter-spacing: -0.03em; color: var(--deck-accent); }
</style>
