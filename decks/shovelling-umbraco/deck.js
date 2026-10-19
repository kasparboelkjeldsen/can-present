// ------------------------------------------------------------------
// The talk. Order here = order on stage.
//
//   id       → URL hash (#map/2)
//   steps    → number of build steps inside the scene (0 = none)
//   at       → place on the canvas: x/y = centre in world px, r = rotation (deg), s = scale
//   parent / revealDelay → scene sits inside a slot of `parent`; fades in that many ms after the parent comes on stage
//   skip     → stepped over by next/prev (reachable via #id or the X key)
//   via      → the flight in from the previous scene rides a path with a pill (the map's "Let's look closer")
//   back     → the scene is the other side of that card: → turns the card over (live-kicker → live-demo)
//   ghost    → only visible while on stage (the takeaway that hovers over the whole canvas;
//              with `at: null` the engine places it over everything)
//   (speaker notes live in notes.json, keyed by id — edit them on /notes)
//
// Canvas regions: Umbraco side (x < -2000) · the bridge (around x = 0) · WordPress side (x > 2000)
// ------------------------------------------------------------------
// Bundled locally (not Google Fonts) so the deck works without venue wifi.
import '@fontsource/libre-caslon-text/400.css'
import '@fontsource/libre-caslon-text/400-italic.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './theme.css'

import Title from './scenes/Title.vue'
import TheAsk from './scenes/TheAsk.vue'
import Iframe from './scenes/Iframe.vue'
import OneLine from './scenes/OneLine.vue'
import TwoOutfits from './scenes/TwoOutfits.vue'
import WhatHappened from './scenes/WhatHappened.vue'
import MapScene from './scenes/Map.vue'
import Bootstrap from './scenes/Bootstrap.vue'
import WhoAmI from './scenes/WhoAmI.vue'
import ThePolicy from './scenes/ThePolicy.vue'
import WhatToWear from './scenes/WhatToWear.vue'
import Cache from './scenes/Cache.vue'
import TheSection from './scenes/TheSection.vue'
import OneInstance from './scenes/OneInstance.vue'
import DangerousBits from './scenes/DangerousBits.vue'
import LiveKicker from './scenes/LiveKicker.vue'
import LiveDemo from './scenes/LiveDemo.vue'
import Fallback from './scenes/Screens.vue'
import Numbers from './scenes/Numbers.vue'
import Tomorrow from './scenes/Tomorrow.vue'
import ControlPlane from './scenes/ControlPlane.vue'
import ThankDsa from './scenes/ThankDsa.vue'
import OneMore from './scenes/OneMore.vue'
import { HOLE as ONE_MORE_HOLE } from './scenes/oneMore.js'
import Festival from './scenes/Festival.vue'
import { HOLE as FESTIVAL_HOLE } from './scenes/festival.js'
import Thanks from './scenes/Thanks.vue'
import { SLOTS, nest, REVEAL_MS, RIDES } from './scenes/map/geometry.js'

const MAP = { x: 0, y: 2700, s: 1.5 }
// the red pill that carries the camera between the map's dives, along its wires (RIDES in geometry.js)
const closer = (path) => ({ path, space: MAP, label: "Let's look closer", tone: 'accent-2', zoom: 1.8 })

const scenes = [
  // ---------------- Act 1: out to WordPress land ----------------
  {
    id: 'title', title: 'Title', component: Title,
    at: { x: 0, y: 0 },
  },
  {
    id: 'the-ask', title: 'The ask', component: TheAsk, steps: 1,
    at: { x: 2300, y: 250, r: 3 },
  },
  {
    id: 'iframe', title: 'What about an iframe?', component: Iframe, steps: 1,
    at: { x: 4500, y: 650, r: -3 },
  },
  {
    id: 'one-line', title: 'The entire integration', component: OneLine, steps: 4,
    at: { x: 6700, y: 300 },
  },
  {
    id: 'two-outfits', title: 'Two outfits', component: TwoOutfits,
    at: { x: 8900, y: -150, r: 3 },
  },
  {
    id: 'what-happened', title: 'What actually happened', component: WhatHappened, steps: 3,
    at: { x: 8800, y: 1300, r: -2 },
  },

  // ---------------- Act 2: back across the bridge ----------------
  {
    id: 'map', title: 'How it works', component: MapScene,
    at: MAP,
  },
  {
    id: 'bootstrap', title: 'The component wakes up', component: Bootstrap, steps: 1, // 1–4 build on a timer, the click is the catch
    at: nest(MAP, SLOTS.bootstrap), parent: 'map', revealDelay: REVEAL_MS[0] + 150,
    via: closer(RIDES.bootstrap),
  },
  {
    id: 'who-am-i', title: 'Who am I?', component: WhoAmI, steps: 3,
    at: nest(MAP, SLOTS.whoAmI), parent: 'map', revealDelay: REVEAL_MS[1] + 150,
    via: closer(RIDES.whoAmI),
  },
  {
    id: 'the-policy', title: 'The policy, at runtime', component: ThePolicy, steps: 5,
    at: nest(MAP, SLOTS.policy), parent: 'map', revealDelay: REVEAL_MS[1] + 150,
    via: closer(RIDES.policy),
  },
  {
    id: 'what-to-wear', title: 'What do I wear?', component: WhatToWear, steps: 4,
    at: nest(MAP, SLOTS.wear), parent: 'map', revealDelay: REVEAL_MS[2] + 150,
    via: closer(RIDES.wear),
  },
  {
    id: 'cache', title: 'Cached, but not stale', component: Cache, steps: 2,
    at: nest(MAP, SLOTS.cache), parent: 'map', revealDelay: REVEAL_MS[2] + 150,
    via: closer(RIDES.cache),
  },
  {
    id: 'the-section', title: 'The remote control', component: TheSection, steps: 8, // 7 fields zoomed in, then zoom out
    at: { x: -3400, y: 2500, r: -2 },
    via: closer(RIDES.section), // up the config wire to the backoffice, then off to the remote control
  },
  {
    id: 'one-instance', title: 'One instance', component: OneInstance, steps: 1,
    at: { x: -3500, y: 3950, r: 2 },
  },
  {
    id: 'dangerous-bits', title: 'The dangerous bits', component: DangerousBits, steps: 4,
    at: { x: -3300, y: 5400, r: -1 },
  },

  // ---------------- Act 3: someone else's website ----------------
  {
    id: 'live-kicker', title: 'Live', component: LiveKicker,
    at: { x: 15000, y: 3000 },
  },
  {
    // the back of the "This is DSA's production" card: → turns it over onto the live demo
    id: 'live-demo', title: 'Punching a hole', component: LiveDemo,
    back: 'live-kicker',
  },
  {
    id: 'fallback', title: 'Fallback', component: Fallback, skip: true,
    at: { x: 15000, y: 4900, r: 2 },
  },
  {
    id: 'numbers', title: 'The numbers', component: Numbers, steps: 2,
    at: { x: 17800, y: 3000 }, // where the live demo used to be: it's on the back of live-kicker now
  },

  // ---------------- Act 4: home ----------------
  {
    id: 'tomorrow', title: 'Today it\'s a carousel', component: Tomorrow, steps: 2,
    at: { x: 8000, y: -1900, r: -3 },
  },
  {
    id: 'control-plane', title: 'The takeaway', component: ControlPlane, ghost: true,
    at: null, // the engine centres it on the canvas, big enough to cover every scene
  },
  // every other card orbits the thank-you; the click sends them home and floods the card green …
  {
    id: 'thank-dsa', title: 'Thank you, DSA', component: ThankDsa, steps: 1,
    at: { x: -2400, y: 1230 },
    formation: { shape: 'ring', spin: 60, until: 1 },
  },
  // … and pulling back, the green was the stem of a "1": "1 more thing" (the rest of the talk fades)
  {
    id: 'one-more', title: '1 more thing', component: OneMore,
    outer: { wraps: 'thank-dsa', hole: ONE_MORE_HOLE },
  },
  // … and further out, "1 more thing" was the dot on the i of "speaking": I'm speaking at Umbraco DK
  // Festival (black, their blue). The click: the speakers form a ring round a QR code to the tickets
  {
    id: 'festival', title: 'Umbraco DK Festival', component: Festival, steps: 1,
    outer: { hole: FESTIVAL_HOLE },
    // leaving it, the black fades out first (200 ms, the whole talk fading back in with it), then the punch in
    onlyOnStage: { fade: 200 },
  },
  // the punch back in: from the festival, one motion through the dot and the "1" into the spot the
  // thank-you card had, with the whole talk back round it for scale. onlyOnStage: it shares that spot
  {
    id: 'thanks', title: 'Thanks', component: Thanks,
    at: { x: -2400, y: 1230 }, onlyOnStage: true,
  },
]

export default {
  id: 'shovelling-umbraco',
  title: "Shovelling Umbraco Into Other People's WordPress",
  icon: '🪏',
  scenes,
}
