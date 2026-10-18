// ------------------------------------------------------------------
// The talk. Order here = order on stage.
//
//   id       → URL hash (#map/2)
//   steps    → number of build steps inside the scene (0 = none)
//   at       → place on the canvas: x/y = centre in world px, r = rotation (deg), s = scale
//   parent / revealDelay → scene sits inside a slot of `parent`; fades in that many ms after the parent comes on stage
//   skip     → stepped over by next/prev (reachable via #id or the X key)
//   ghost    → only visible while on stage (the takeaway that hovers over the whole canvas)
//   (speaker notes live in notes.json, keyed by id — edit them on /notes)
//
// Canvas regions: Umbraco side (x < -2000) · the bridge (around x = 0) · WordPress side (x > 2000)
// ------------------------------------------------------------------
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
import Thanks from './scenes/Thanks.vue'
import { SLOTS, nest, REVEAL_MS } from './scenes/map/geometry.js'

const MAP = { x: 0, y: 2700, s: 1.5 }

export const scenes = [
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
    id: 'bootstrap', title: 'The component wakes up', component: Bootstrap, steps: 3,
    at: nest(MAP, SLOTS.bootstrap), parent: 'map', revealDelay: REVEAL_MS[0] + 150,
  },
  {
    id: 'who-am-i', title: 'Who am I?', component: WhoAmI, steps: 3,
    at: nest(MAP, SLOTS.whoAmI), parent: 'map', revealDelay: REVEAL_MS[1] + 150,
  },
  {
    id: 'the-policy', title: 'The policy, at runtime', component: ThePolicy, steps: 5,
    at: nest(MAP, SLOTS.policy), parent: 'map', revealDelay: REVEAL_MS[1] + 150,
  },
  {
    id: 'what-to-wear', title: 'What do I wear?', component: WhatToWear, steps: 4,
    at: nest(MAP, SLOTS.wear), parent: 'map', revealDelay: REVEAL_MS[2] + 150,
  },
  {
    id: 'cache', title: 'Cached, but not stale', component: Cache, steps: 3,
    at: nest(MAP, SLOTS.cache), parent: 'map', revealDelay: REVEAL_MS[2] + 150,
  },
  {
    id: 'the-section', title: 'The remote control', component: TheSection, steps: 7,
    at: { x: -3400, y: 2500, r: -2 },
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
    id: 'live-demo', title: 'Punching a hole', component: LiveDemo,
    at: { x: 17800, y: 3000, s: 1.3 },
  },
  {
    id: 'fallback', title: 'Fallback', component: Fallback, skip: true,
    at: { x: 17800, y: 4900, r: 2 },
  },
  {
    id: 'numbers', title: 'The numbers', component: Numbers, steps: 2,
    at: { x: 20600, y: 3000 },
  },

  // ---------------- Act 4: home ----------------
  {
    id: 'tomorrow', title: 'Today it\'s a carousel', component: Tomorrow, steps: 2,
    at: { x: 8000, y: -1900, r: -3 },
  },
  {
    id: 'control-plane', title: 'The takeaway', component: ControlPlane, ghost: true,
    at: null, // computed below: covers the whole canvas
  },
  {
    id: 'thanks', title: 'Thanks', component: Thanks,
    at: { x: 0, y: 1230 },
  },
]

// The takeaway hovers over everything: centred on the canvas, big enough to cover it.
{
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const sc of scenes) {
    if (!sc.at) continue
    const s = sc.at.s ?? 1
    minX = Math.min(minX, sc.at.x - 960 * s); maxX = Math.max(maxX, sc.at.x + 960 * s)
    minY = Math.min(minY, sc.at.y - 540 * s); maxY = Math.max(maxY, sc.at.y + 540 * s)
  }
  const ghost = scenes.find((s) => s.ghost)
  const s = Math.max((maxX - minX) / 1920, (maxY - minY) / 1080) * 1.08
  ghost.at = { x: (minX + maxX) / 2, y: (minY + maxY) / 2, s }
}
