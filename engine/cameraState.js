// The camera. App.vue moves it; SceneFrame turns it into each scene's `zoom` (useStep()), which
// <Detail> follows.
//
// A view is { x, y, w, r }: the world point at the centre of the stage, the visible world width
// (the stage is 1920 px wide, so 1920 / w is the world's scale on the stage) and the rotation.
//
// Every deck on a page has its own camera (createDeck, useDeck.js). In a component, read it with
// useCamera(). `cam` below is the camera of the engine's own page (main.js hands it to its deck), for
// plain modules there that can't inject; an embedded deck (<CanPresent>) doesn't move it.
import { reactive, inject } from 'vue'
import { W } from './layout.js'
import { DECK_KEY } from './useDeck.js'

export const cam = reactive({ x: 0, y: 0, w: W, r: 0 })

/** The on-screen scale of a card placed with scale `s`: 1 = it exactly fills the stage. (The page's own deck.) */
export const zoomOf = (s = 1) => (W * s) / cam.w

/** The camera of the deck this component is part of: a reactive { x, y, w, r }. Call it in setup. */
export function useCamera() {
  return inject(DECK_KEY, null)?.cam ?? cam
}
