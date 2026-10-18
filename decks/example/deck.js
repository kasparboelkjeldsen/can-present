// ------------------------------------------------------------------
// Example deck: four scenes and a tiny theme. Copy this folder to start a new deck.
// Order here = order on stage.
//
//   id       → URL hash (#code/2)
//   steps    → number of build steps inside the scene (0 = none)
//   at       → place on the canvas: x/y = centre in world px, r = rotation (deg), s = scale
//   parent   → scene sits inside `parent` (place it with nest()); revealAt / revealDelay time its entrance
//   skip     → stepped over by next/prev (reachable via #id or the X key)
//   ghost    → only visible while on stage; with `at: null` it covers the whole canvas
//   (speaker notes live in notes.json, keyed by id — edit them on /notes)
// ------------------------------------------------------------------
import './theme.css'
import { nest } from '@engine/layout.js'
import Title from './scenes/Title.vue'
import Inside from './scenes/Inside.vue'
import Walkthrough from './scenes/Walkthrough.vue'
import Screenshot from './scenes/Screenshot.vue'

const TITLE = { x: 0, y: 0 }
// The dashed box on the title scene: centre and width in the title's own 1920×1080 space.
const BOX = { cx: 1420, cy: 740, w: 640 }

export default {
  id: 'example',
  title: 'can-present: example deck',
  icon: '🎬',
  scenes: [
    {
      id: 'title', title: 'Title', component: Title,
      at: TITLE,
    },
    {
      id: 'inside', title: 'Scenes inside scenes', component: Inside, steps: 2,
      at: nest(TITLE, BOX), parent: 'title',
    },
    {
      id: 'code', title: 'A code walkthrough', component: Walkthrough, steps: 2,
      at: { x: 2400, y: 350, r: 3 },
    },
    {
      id: 'screenshot', title: 'Screenshots and live sites', component: Screenshot,
      at: { x: 2100, y: 1800, r: -2 },
    },
  ],
}
