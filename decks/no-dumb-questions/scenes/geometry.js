// Boxes that hand-drawn scenes leave for their nested scenes, shared with deck.js (nest()).
// Each is { cx, cy, w } in the parent scene's 1920×1080 space (16:9, so h = w × 9/16).

// vectors.vue: the dashed "how close?" frame, where `dot-product` lives
export const VECTORS_SLOT = { cx: 1450, cy: 790, w: 620 }

// Layer.vue: the two halves of one layer, where `attention` and `weights` live
export const LAYER_SLOTS = {
  attention: { cx: 530, cy: 690, w: 620 },
  weights: { cx: 1390, cy: 690, w: 620 },
}

/** CSS for a slot frame drawn by the parent scene: the 16:9 box, positioned absolutely. */
export const frame = ({ cx, cy, w }) => {
  const h = (w * 9) / 16
  return { left: cx - w / 2 + 'px', top: cy - h / 2 + 'px', width: w + 'px', height: h + 'px' }
}
