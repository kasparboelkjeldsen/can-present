// ------------------------------------------------------------------
// Example deck: the kitchen sink. One scene per block of the toolbox in
// docs/presentation-guide.md, as a mini-talk about can-present. Copy a scene
// (and its deck.js entry) to start your own. Order here = order on stage.
//
// Canvas layout (press O): a U-shaped path. The top row goes left to right
// (title → cards → number → code → diagram), the camera dives into the diagram
// and rides its wires (inside, canvas), then the bottom row comes back right to
// left (screens → live → loop → thanks). Below the loop hangs the zoom (deeper),
// a "powers of ten" dive inside one card; the fallback hangs below the live demo;
// the takeaway is a ghost over everything.
//
//   id       → URL hash (#code/2)
//   steps    → number of build steps inside the scene (0 = none)
//   at       → place on the canvas: x/y = centre in world px, r = rotation (deg), s = scale
//   parent   → scene sits inside `parent` (place it with nest()); revealAt / revealDelay time its entrance
//   skip     → stepped over by next/prev (reachable via #id or the X key)
//   ghost    → only visible while on stage; with `at: null` it covers the whole canvas
//   via      → the flight in from the previous scene rides a path (ride(diagram, edge, parentAt, opts))
//   frames   → per build step, the camera flies to a box of the card ({ cx, cy, w } in its 1920×1080 space)
//   (speaker notes live in notes.json, keyed by id — edit them on /notes)
// ------------------------------------------------------------------
import './theme.css'
import { nest } from '@engine/layout.js'
import { ride } from '@engine/diagram.js'
import { arch } from './scenes/arch.js'
import { frames as deeperFrames } from './scenes/deeper.js'
import Title from './scenes/Title.vue'
import Cards from './scenes/Cards.vue'
import Stat from './scenes/Stat.vue'
import Walkthrough from './scenes/Walkthrough.vue'
import Arch from './scenes/Arch.vue'
import Inside from './scenes/Inside.vue'
import Canvas from './scenes/Canvas.vue'
import Screens from './scenes/Screens.vue'
import Live from './scenes/Live.vue'
import Loop from './scenes/Loop.vue'
import Deeper from './scenes/Deeper.vue'
import Takeaway from './scenes/Takeaway.vue'
import Fallback from './scenes/Fallback.vue'
import Thanks from './scenes/Thanks.vue'

// The diagram is bigger than a normal card (s > 1): the camera pulls back to show it.
const ARCH = { x: 9500, y: 0, s: 1.25 }

export default {
  id: 'example',
  title: 'can-present: example deck',
  icon: '🎬',
  scenes: [
    // ---- top row, left to right ----
    { id: 'title', title: 'Title', component: Title, at: { x: 0, y: 0 } },
    { id: 'cards', title: 'Cards on clicks', component: Cards, steps: 3, at: { x: 2300, y: 250, r: -2 } },
    { id: 'number', title: 'A big number', component: Stat, steps: 1, at: { x: 4600, y: 0, r: 2 } },
    { id: 'code', title: 'A code walkthrough', component: Walkthrough, steps: 2, at: { x: 6900, y: 300, r: -1 } },
    // steps come from the diagram definition, so the scene and deck.js can't disagree
    { id: 'diagram', title: 'A diagram that builds itself', component: Arch, steps: arch.steps, at: ARCH },
    // the dive: inside the diagram's engine box, visible from the step that box appears on.
    // `via` rides the import edge (0) into it with a "scenes" pill (accent-2, so it stands out from
    // the edge's own packets); ← plays the ride backwards
    {
      id: 'inside', title: 'Scenes inside scenes', component: Inside, steps: 2,
      at: nest(ARCH, arch.slot('inside')), parent: 'diagram', revealAt: arch.revealAt('engine'),
      via: ride(arch, 0, ARCH, { label: 'scenes', tone: 'accent-2', zoom: 2.2, bank: 3 }),
    },
    // the same packet rides on along the render edge (1), out of the engine into the browser box
    {
      id: 'canvas', title: 'One big canvas', component: Canvas, steps: 2,
      at: nest(ARCH, arch.slot('canvas')), parent: 'diagram', revealAt: arch.revealAt('browser'),
      via: ride(arch, 1, ARCH, { label: 'scenes', tone: 'accent-2', zoom: 2.2 }),
    },
    // ---- bottom row, right to left ----
    { id: 'screens', title: 'Screenshots', component: Screens, at: { x: 9300, y: 2300, r: 2 } },
    { id: 'live', title: 'A live site', component: Live, at: { x: 6900, y: 2500, r: -2 } },
    { id: 'loop', title: 'A looping illustration', component: Loop, at: { x: 4600, y: 2300, r: 2 } },
    // powers of ten: each press flies the camera deeper into the card (frames, from deeper.js, which
    // the scene shares), and <Detail>s show what's readable at each zoom. It ends inside a dot.
    { id: 'deeper', title: 'Powers of ten', component: Deeper, steps: 4, frames: deeperFrames, at: { x: 4600, y: 4650 } },
    // hovers over the whole canvas while on stage: the camera pulls back and the talk shows behind it
    { id: 'takeaway', title: 'Takeaway', component: Takeaway, ghost: true, at: null },
    // stepped over by → and ←; X (or #fallback) jumps here if the live demo dies
    { id: 'fallback', title: 'Demo fallback', component: Fallback, skip: true, at: { x: 6900, y: 4700 } },
    { id: 'thanks', title: 'Thanks', component: Thanks, at: { x: 2300, y: 2450, r: -2 } },
  ],
}
