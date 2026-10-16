// ------------------------------------------------------------------
// The talk. Order here = order on stage.
//
//   id       → URL hash (#map/2)
//   steps    → number of build steps inside the scene (0 = none)
//   at       → place on the canvas: x/y = centre in world px, r = rotation (deg), s = scale
//   parent / revealAt → scene sits inside a slot of `parent`, visible from that build step
//   skip     → stepped over by next/prev (reachable via #id or the X key)
//   ghost    → only visible while on stage (the takeaway that hovers over the whole canvas)
//   notes    → shown on /notes
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
import { SLOTS, nest } from './scenes/map/geometry.js'

const MAP = { x: 0, y: 2700, s: 1.5 }

export const scenes = [
  // ---------------- Act 1: out to WordPress land ----------------
  {
    id: 'title', title: 'Title', component: Title,
    at: { x: 0, y: 0 },
    notes: [
      'Head of Umbraco at Kraftvaerk, MVP, minister of dangerous code',
      '"The title is the joke. The content is real, and it\'s running in production right now." (joke)',
      '"This is a case for DSA. They know what they agreed to." (joke)',
    ],
  },
  {
    id: 'the-ask', title: 'The ask', component: TheAsk, steps: 1,
    at: { x: 2300, y: 250, r: 3 },
    notes: [
      'DSA has a job board. Partners want it on their sites, branded as their own',
      'Two live today: Jordemoderforeningen and Radiograferne',
      '(pause after "Simple, right?")',
    ],
  },
  {
    id: 'iframe', title: 'What about an iframe?', component: Iframe, steps: 1,
    at: { x: 4500, y: 650, r: -3 },
    notes: [
      'Someone always says iframe. First suggestion here too',
      'Partners care about branding. They will never touch code',
      'Short mini-discovery later: talked them into a web component',
    ],
  },
  {
    id: 'one-line', title: 'The entire integration', component: OneLine, steps: 4,
    at: { x: 6700, y: 300 },
    notes: [
      'Smallest deliverable I could come up with for a partner',
      'Everything else is our problem. That\'s the point',
      'GTM: "Please don\'t." (joke)',
    ],
  },
  {
    id: 'two-outfits', title: 'Two outfits', component: TwoOutfits,
    at: { x: 8900, y: -150, r: 3 },
    notes: [
      'Both in production now',
      'Same script, same component, same backend. Looks like it belongs to each site',
      'Hold. Let people look',
    ],
  },
  {
    id: 'what-happened', title: 'What actually happened', component: WhatHappened, steps: 3,
    at: { x: 8800, y: 1300, r: -2 },
    notes: [
      'Built it so partners could do everything themselves',
      'Partner one invited me into wp-admin. The title is literal (joke) (pause)',
      'Partner two: HTML block, after some back and forth',
      'Remember this. It comes back at the end',
    ],
  },

  // ---------------- Act 2: back across the bridge ----------------
  {
    id: 'map', title: 'How it works', component: MapScene, steps: 4,
    at: MAP,
    notes: [
      'The whole thing. We walk it right to left',
      'ewcp.dsa.dk: not Fort Knox. Just no reason to put umbraco.dsa.dk on other people\'s sites',
      'Job portal behind APIM; subscription key stays on our server. Another reason the component can\'t call it',
    ],
  },
  {
    id: 'bootstrap', title: 'The component wakes up', component: Bootstrap, steps: 3,
    at: nest(MAP, SLOTS.bootstrap), parent: 'map', revealAt: 1,
    notes: [
      'Served immutable, cached for a year. Doesn\'t matter: it checks for a newer self',
      'We cache-bust from the server; the old copy swaps itself out',
      'Catch: that check lives in browsers up to a year. /latest is forever',
      'Not showing the bootstrapper. Trust me (joke)',
    ],
  },
  {
    id: 'who-am-i', title: 'Who am I?', component: WhoAmI, steps: 3,
    at: nest(MAP, SLOTS.whoAmI), parent: 'map', revealAt: 2,
    notes: [
      'The Origin header is the identity. That\'s all "who am I" is',
      'Click 3: (pause) "It doesn\'t allow all. It applies our policy to everything." (joke)',
      'Leaving the name. It\'s on brand',
    ],
  },
  {
    id: 'the-policy', title: 'The policy, at runtime', component: ThePolicy, steps: 5,
    at: nest(MAP, SLOTS.policy), parent: 'map', revealAt: 2,
    notes: [
      'Origins come from the table behind the backoffice section, cached',
      'Click 5 sets up the dangerous bits. Don\'t explain it yet',
    ],
  },
  {
    id: 'what-to-wear', title: 'What do I wear?', component: WhatToWear, steps: 4,
    at: nest(MAP, SLOTS.wear), parent: 'map', revealAt: 3,
    notes: [
      'Two gates: CORS lets the browser read it; this decides what the answer is',
      'Tip: outside prod the 404 explains itself (origin received + registered ones)',
      'Click 4: cached 10 min… so how does a change show up immediately? Next',
    ],
  },
  {
    id: 'cache', title: 'Cached, but not stale', component: Cache, steps: 3,
    at: nest(MAP, SLOTS.cache), parent: 'map', revealAt: 3,
    notes: [
      'DB on every preflight would be silly, so it\'s cached',
      'Saving in the backoffice clears it. The live demo depends on this',
      'Warmup: hosted service fills the cache before the first partner asks',
      'Sticker: all IComposer, no Program.cs. Umbracommandments callback (joke)',
    ],
  },
  {
    id: 'the-section', title: 'The remote control', component: TheSection, steps: 7,
    at: { x: -3400, y: 2500, r: -2 },
    notes: [
      'One component → one or many domains. Request from that domain gets that config',
      'Click 2: born with a pile of CSS variables. A competent partner could restyle it all (pause) Nobody did',
      'Click 4: classes tap into the partner\'s own styling',
    ],
  },
  {
    id: 'one-instance', title: 'One instance', component: OneInstance, steps: 1,
    at: { x: -3500, y: 3950, r: 2 },
    notes: [
      'Partner traffic lands on the same box editors use. Caching keeps the backoffice snappy',
      'If ~800 DR editors run on one instance, almost anything can (joke)',
    ],
  },
  {
    id: 'dangerous-bits', title: 'The dangerous bits', component: DangerousBits, steps: 4,
    at: { x: -3300, y: 5400, r: -1 },
    notes: [
      '1: any curl can claim to be jordemoderforeningen.dk. Say it before Q&A does',
      '2: policy on every route, credential-less → allowed origins only read what\'s public. ewcp only exposes /api/ewcp',
      '3 + 4: straight from the code comments. Real war stories',
    ],
  },

  // ---------------- Act 3: someone else's website ----------------
  {
    id: 'live-kicker', title: 'Live', component: LiveKicker,
    at: { x: 15000, y: 3000 },
    notes: [
      '(pause)',
      'Not an Umbraco meetup unless someone\'s demo explodes. Might as well be mine (joke)',
      'Thanks to DSA\'s CTO for saying yes',
    ],
  },
  {
    id: 'live-demo', title: 'Punching a hole', component: LiveDemo,
    at: { x: 17800, y: 3000, s: 1.3 },
    notes: [
      'Right: "DSA doesn\'t know me yet". Nothing renders',
      'Left: Open ↗ (new tab, already logged in). kjeldsen.dev component, paste origin, Active on, SAVE (clears both caches)',
      'Ctrl+Tab back. Right: Reload → carousel in kjeldsen.dev colours (pause)',
      'Revoke: Active off, save, reload right. Gone',
      'TOGGLE, NEVER DELETE. Explodes? Press X',
    ],
  },
  {
    id: 'fallback', title: 'Fallback', component: Fallback, skip: true,
    at: { x: 17800, y: 4900, r: 2 },
    notes: [
      '"This is what you would have seen." (joke)',
      'Backup recording if needed',
    ],
  },
  {
    id: 'numbers', title: 'The numbers', component: Numbers, steps: 2,
    at: { x: 20600, y: 3000 },
    notes: [
      'Loads, counted only from the component\'s own origins (remember the crawlers)',
      'Click 2 is the payoff for the whole remote-control bet (pause)',
    ],
  },

  // ---------------- Act 4: home ----------------
  {
    id: 'tomorrow', title: 'Today it\'s a carousel', component: Tomorrow, steps: 2,
    at: { x: 8000, y: -1900, r: -3 },
    notes: [
      'Not in the UI yet; only one payload. Technically a component can serve a different script',
      'Membership needs real auth, not an Origin header. Dangerous bit #1 still applies',
    ],
  },
  {
    id: 'control-plane', title: 'The takeaway', component: ControlPlane, ghost: true,
    at: null, // computed below: covers the whole canvas
    notes: ['One sentence. Don\'t add to it. (pause)'],
  },
  {
    id: 'thanks', title: 'Thanks', component: Thanks,
    at: { x: 0, y: 1230 },
    notes: ['Expected Qs: Origin spoofing (card 1) · credentials (no) · multi-instance (no, one, see DR) · why not iframe (scene 3)'],
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
