// The two outer layers' geometry, shared by the scenes (which draw it) and deck.js (outer.hole), so
// the hole is exactly where the dot is. Card px, in each card's own 1920×1080 space.
//
// The text is HTML, not SVG: Chrome lays out SVG text at a size derived from its on-screen scale,
// which goes wrong on a card scaled 20,000×. Its baseline is placed from the line's top (about 0.9em
// below it for system sans fonts), so it can be a few px off; the dots are exact.

// "All of that fits / in the dot of an i": the talk is the dot on the i
const b = { line1: 450, line2: 680, size: 150, stem: 28, gap: 36, dot: 46 }
b.xHeight = Math.round(b.size * 0.53)
b.hole = { cx: 1530, cy: b.line2 - b.xHeight - 50, w: 36 } // the dot's centre, a little above the stem
export const BIGGER = b

// "It's canvases / all the way down.": the whole of the card above is the full stop
const g = { line1: 470, line2: 690, size: 150, dot: 38 }
g.hole = { cx: 1560, cy: g.line2 - g.dot / 2, w: 30 } // the full stop sits on the baseline
g.textEnd = g.hole.cx - g.dot / 2 - 8
export const BIGGEST = g

/** Style for a line of text whose baseline is at y: absolutely placed by its top. */
export const lineAt = (y, size) => ({ top: `${y - 0.9 * size}px`, fontSize: `${size}px` })
/** Style for a disc of diameter d centred on (cx, cy). */
export const disc = (cx, cy, d) => ({ left: `${cx - d / 2}px`, top: `${cy - d / 2}px`, width: `${d}px`, height: `${d}px` })
