// "1 more thing": the outer layer round the thank-you card (deck.js `outer: { wraps: 'thank-dsa', hole }`).
// The "1" is drawn, not typeset, so the hole sits exactly in its stem. Card px (1920×1080).
export const ONE = { x: 590, w: 120, top: 250, bottom: 830, flag: 130 } // the stem, and how far the flag reaches left
// the green card fills this box in the middle of the stem: 1920 → 100 px, so the camera pulls back about 19×
export const HOLE = { cx: ONE.x + ONE.w / 2, cy: 560, w: 100 }
