// The "TAK" formation on the thank-dsa card: the other cards spell TAK ("thanks" in Danish) round it,
// a card per stroke, and thank-dsa itself (which stays where it is, upright, at its own scale) is the
// crossbar of the A. A formation shape function (engine/formation.js): card i of n → its centre in
// world px from thank-dsa's centre, its rotation (deg) and scale.
//
// Every stroke is a line with a number of cards laid end to end along it, each scaled to cover its
// share of the line. 12 strokes for the 12 cards that move today (in deck order: T, then A, then K);
// any cards beyond that line up under the word, and fewer just leave the last strokes out.
const CARD = 1920

// the letters' top and bottom, round the A's crossbar (thank-dsa) at y = 0, a little below their middle
const TOP = -2040
const BOTTOM = 1404

/** n cards end to end from (x1, y1) to (x2, y2): their centres, the line's angle (kept within ±90°, so
 *  no card is upside down) and the scale that makes them cover it. */
function stroke(x1, y1, x2, y2, n) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  let r = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  if (r > 90) r -= 180
  if (r <= -90) r += 180
  return Array.from({ length: n }, (_, j) => {
    const t = (j + 0.5) / n
    return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, r, s: len / n / CARD }
  })
}

// T, left of the A: a bar of two cards across the top, a stem of two under it
const T = -4280 // its centre line
const BAR = 0.75 * CARD * 0.5625 // the bar's thickness at the bar cards' scale (0.75)
// A: two cards down each leg, from the apex to feet wide enough that the crossbar meets the legs
const FOOT = 1700
// K, right of the A: a stem of two cards, and an arm up and an arm down from the middle of the stem
const K = 3325
const MID = (TOP + BOTTOM) / 2

export const STROKES = [
  ...stroke(T - 1440, TOP + BAR / 2, T + 1440, TOP + BAR / 2, 2), // T: the bar
  ...stroke(T, TOP + BAR, T, BOTTOM, 2), // T: the stem
  ...stroke(0, TOP, -FOOT, BOTTOM, 2), // A: the left leg
  ...stroke(0, TOP, FOOT, BOTTOM, 2), // A: the right leg
  ...stroke(K, TOP, K, BOTTOM, 2), // K: the stem
  ...stroke(K + 420, MID - 60, K + 1600, TOP + 380, 1), // K: the arm up (from the stem's edge)
  ...stroke(K + 420, MID + 60, K + 1600, BOTTOM - 380, 1), // K: the arm down
]

/** The formation shape: card i of n. */
export function tak(i) {
  if (i < STROKES.length) return STROKES[i]
  // spares (if the deck grows): a row of small cards under the word
  const k = i - STROKES.length
  return { x: -4000 + k * 1300, y: BOTTOM + 1400, r: 0, s: 0.6 }
}
