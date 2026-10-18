// ------------------------------------------------------------------
// __DECK_TITLE__. Order here = order on stage.
//
//   id       → URL hash (#code/2)
//   steps    → number of build steps inside the scene (0 = none)
//   at       → place on the canvas: x/y = centre in world px, r = rotation (deg), s = scale
//   parent   → scene sits inside `parent` (place it with nest()); revealAt / revealDelay time its entrance
//   skip     → stepped over by next/prev (reachable via #id or the X key)
//   ghost    → only visible while on stage; with `at: null` it covers the whole canvas
//   (speaker notes live in notes.json, keyed by id — edit them on /notes)
// ------------------------------------------------------------------
// Fonts: bundle them locally so the deck works without venue wifi, e.g.
//   import '@fontsource/inter/400.css'   (then set --sans in theme.css)
import './theme.css'
import Title from './scenes/Title.vue'

export default {
  id: '__DECK_ID__',
  title: '__DECK_TITLE__',
  icon: '__DECK_ICON__',
  scenes: [
    {
      id: 'title', title: 'Title', component: Title,
      at: { x: 0, y: 0 },
    },
  ],
}
