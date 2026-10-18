// The camera, shared. App.vue moves it; SceneFrame turns it into each scene's `zoom` (useStep()),
// which <Detail> follows. A separate module so scenes can read the camera without importing App.vue.
//
// A view is { x, y, w, r }: the world point at the centre of the stage, the visible world width
// (the stage is 1920 px wide, so 1920 / w is the world's scale on the stage) and the rotation.
import { reactive } from 'vue'
import { W } from './layout.js'

export const cam = reactive({ x: 0, y: 0, w: W, r: 0 })

/** The on-screen scale of a card placed with scale `s`: 1 = it exactly fills the stage. */
export const zoomOf = (s = 1) => (W * s) / cam.w
