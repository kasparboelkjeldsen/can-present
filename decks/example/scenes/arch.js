// The diagram on the `diagram` scene, shared with deck.js (steps, and the slot `inside` lives in).
// Coordinates are in the scene's 1920×1080 space; slot cx/cy are relative to their node.
import { defineDiagram } from '@engine/diagram.js'

export const arch = defineDiagram({
  reveal: 'steps', // one node per click; { timer: [1000, 1300, 1600, 1900] } would build it by itself
  nodes: {
    deck: { x: 80, y: 690, w: 320, h: 200, label: 'decks/example', sub: 'scenes, theme, notes', at: 1 },
    engine: { x: 700, y: 440, w: 520, h: 400, label: 'engine/', sub: 'Vue 3 + Vite', at: 2, tone: 'accent' },
    // big enough for a slot: the `canvas` scene lives in it
    // up in the corner, so the edges from the engine climb a long way (the `canvas` ride follows one)
    browser: { x: 1440, y: 60, w: 400, h: 390, label: 'Browser', at: 3, tone: 'ghost' },
    notes: { x: 1440, y: 900, w: 400, h: 110, label: '/notes', at: 4 },
  },
  // edges and packets default to ink (for light slides); this scene is dark, so they use paper
  edges: [
    { from: 'deck', to: 'engine', label: 'import', tone: 'paper' }, // boxes don't line up: routed with an elbow
    // two lanes (offset) so traffic in each direction never crosses
    { from: 'engine', to: 'browser', label: 'render', tone: 'paper', offset: -24 },
    { from: 'browser', to: 'notes', both: true, label: 'sync', tone: 'paper' }, // stacked boxes: top/bottom sides
    { from: 'browser', to: 'engine', tone: 'paper', offset: 24 },
  ],
  packets: [
    { edge: 0, label: 'deck.js', tone: 'paper' },
    { edge: 1, label: 'flyTo()', tone: 'accent' },
    { edge: 3, label: '→ key', delay: 1.8, tone: 'paper' },
  ],
  // nested scenes sit here: nest(ARCH, arch.slot('inside')) in deck.js. deck.js also rides
  // edges 0 and 1 into them (via: ride(arch, 0, ARCH, …)).
  slots: {
    inside: { node: 'engine', cx: 260, cy: 252, w: 400 },
    canvas: { node: 'browser', cx: 200, cy: 266, w: 320 },
  },
})
