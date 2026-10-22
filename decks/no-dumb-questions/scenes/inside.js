// The diagram on the `inside` scene ("one token, start to finish"), shared with deck.js: the
// `vectors` and `layer` scenes live in its two big boxes, and the flight into `vectors` rides the
// tokens → vectors wire. Coordinates are in the scene's 1920×1080 space.
import { defineDiagram } from '@engine/diagram.js'

export const inside = defineDiagram({
  // builds itself, no clicks: one box every 300 ms, wires as soon as both ends are there
  reveal: { timer: [500, 800, 1100, 1400, 1700, 2000] },
  nodes: {
    text: { x: 50, y: 320, w: 310, h: 190, label: 'Text', sub: '…items.', at: 1 },
    tokens: { x: 50, y: 640, w: 310, h: 190, label: 'Tokens', sub: 'numbers', at: 2 },
    vectors: { x: 420, y: 300, w: 480, h: 560, label: 'Vectors', sub: 'each token → 8,192 numbers', at: 3 },
    layers: { x: 1010, y: 300, w: 480, h: 560, label: '80 layers', sub: 'each one refines the vectors', at: 4, tone: 'accent' },
    odds: { x: 1580, y: 320, w: 290, h: 190, label: 'Odds', sub: 'a score for every token', at: 5 },
    pick: { x: 1580, y: 640, w: 290, h: 190, label: 'Pick one', sub: '“Count”', at: 6 },
  },
  edges: [
    { from: 'text', to: 'tokens', tone: 'paper' },
    { from: 'tokens', to: 'vectors', tone: 'paper' },
    { from: 'vectors', to: 'layers', tone: 'paper' },
    { from: 'layers', to: 'odds', tone: 'paper' },
    { from: 'odds', to: 'pick', tone: 'paper' },
    // the loop: the picked token goes back on the end of the text, and round it goes again
    { from: 'pick', to: 'text', tone: 'accent', label: 'append it, and go round again', path: 'M1725 830 V 985 H 24 V 415 H 50' },
  ],
  packets: [
    { edge: 1, label: 'items.', tone: 'paper' },
    { edge: 5, label: 'Count', tone: 'accent-2', dur: 5 },
  ],
  slots: {
    vectors: { node: 'vectors', cx: 240, cy: 380, w: 420 },
    layer: { node: 'layers', cx: 240, cy: 380, w: 420 },
  },
})
