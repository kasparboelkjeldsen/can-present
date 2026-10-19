import { ref } from 'vue'

// Tiny shared signals that components can watch without importing the deck
// (importing useDeck from a scene component would create an import cycle via deck.js).

/** Bumps on every deck reset (R / Reset button). */
export const resets = ref(0)
