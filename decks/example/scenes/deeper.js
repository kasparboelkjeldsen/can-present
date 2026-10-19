// Geometry of the `deeper` scene (Deeper.vue), shared with deck.js (its `frames`), like arch.js.
//
// The scene nests boxes inside boxes. Every box is { cx, cy, w } in its parent's 1920×1080 space
// (centre and width, 16:9), and its content is drawn in its own 1920×1080 space, scaled down to
// fit: so text inside is written at normal sizes, however deep it sits, and stays crisp.
//
//   card                      the scene (zoom 1)
//   └─ PANEL                  a component: a code block              frame 1, ~2.3×
//      ├─ the line `import Title …` (LINE in PANEL's space)          frame 2, ~8×
//      ├─ CHAR                around its `i`                         frame 3, ~34×
//      └─ TITLE               the title scene, inside the `i`'s dot  frame 4, ~530×
import { W } from '@engine/layout.js'

export const PANEL = { cx: 1330, cy: 620, w: 720 }

// PANEL's space: the code, 56px mono, one line every 88px
export const CODE = { x: 110, size: 56, lh: 88, top: 160 }
export const baseline = (n) => CODE.top + CODE.lh * n // line n (1-based)
export const LINE = 2 // `import Title from './Title.vue'`
// The code on the panel, as [class, text] runs: k keyword / html tag, t component, s string.
// (Here, not in Deeper.vue: a closing script tag in a string would end the SFC's script block.)
export const CODE_LINES = [
  [['k', '<script'], ['', ' setup'], ['k', '>']],
  null, // line 2, `import Title from './Title.vue'`, is drawn on its own: its `i` is the way in
  [['k', '</script>']],
  [],
  [['k', '<template>']],
  [['', '  '], ['t', '<Detail'], ['', ' :from='], ['s', '"60"'], ['t', '>']],
  [['', '    '], ['t', '<Title />']],
  [['', '  '], ['t', '</Detail>']],
  [['k', '</template>']],
]
export const REST = [['k', 'mport'], ['', ' '], ['t', 'Title'], ['', ' '], ['k', 'from'], ['', ' '], ['s', "'./Title.vue'"]]
const B = baseline(LINE)
// The `i` of `import` is a dotless ı (in the font) plus this dot, drawn at a fixed place so the
// camera can find it whatever the monospace font: half a character in, above the x-height.
export const DOT = { x: CODE.x + CODE.size * 0.29, y: B - CODE.size * 0.72, r: 5.5 }
// boxes in PANEL's space
export const CHAR = { cx: DOT.x, cy: B - 22, w: 240 } // holds the "one character" tag
// the title scene fills the largest 16:9 box inside the dot (its diagonal is the dot's diameter)
export const TITLE = { cx: DOT.x, cy: DOT.y, w: (2 * DOT.r) / Math.hypot(1, 9 / 16) }

/** A point/box in PANEL's space → the card's space. */
const k = PANEL.w / W
const inCard = ({ cx, cy, w }) => ({ cx: PANEL.cx + (cx - W / 2) * k, cy: PANEL.cy + (cy - 540) * k, w: w * k })

export const frames = {
  1: { cx: PANEL.cx, cy: PANEL.cy - 15, w: PANEL.w + 120 }, // the component, with room for its tag
  2: inCard({ cx: CODE.x + 300, cy: B - 18, w: 640 }), // the line
  3: inCard({ cx: DOT.x + 34, cy: B - 24, w: 150 }), // the character
  4: inCard({ ...TITLE, w: TITLE.w * 0.995 }), // into the dot: the title scene fills the screen (a hair over)
}

/**
 * Style for a box (position: absolute; 1920×1080; transform-origin: centre): its content scaled
 * into { cx, cy, w } of the parent's space. All of it in the transform: the browser rounds
 * left/top to whole pixels, which at 500× is a visible jump.
 */
export const box = ({ cx, cy, w }) => ({
  transform: `translate(${cx - W / 2}px, ${cy - 540}px) scale(${w / W})`,
})
