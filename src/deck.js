// ------------------------------------------------------------------
// The talk. Order here = order on stage.
//
//   id     → used in the URL hash (#pipeline/2)
//   steps  → number of build steps inside the scene (0 = none)
//   at     → where the scene lives on the infinite canvas:
//            x/y = centre in world px, r = rotation (deg), s = scale (<1 nests it inside another scene)
//   notes  → shown in the presenter window (press P)
// ------------------------------------------------------------------
import Title from './scenes/Title.vue'
import Setup from './scenes/Setup.vue'
import Pipeline from './scenes/Pipeline.vue'
import TheCode from './scenes/TheCode.vue'
import Screens from './scenes/Screens.vue'
import LiveSite from './scenes/LiveSite.vue'
import Zero from './scenes/Zero.vue'
import Thanks from './scenes/Thanks.vue'

const PIPE = { x: 2300, y: 1500 }

export const scenes = [
  {
    id: 'title',
    title: 'Title',
    component: Title,
    at: { x: 0, y: 0 },
    notes: 'Hi. Let the shovel loop a couple of times before saying anything.',
  },
  {
    id: 'setup',
    title: 'The situation',
    component: Setup,
    steps: 3,
    at: { x: 2500, y: -350, r: -4 },
    notes: 'Client loves WP, we love Umbraco, budget says no migration.',
  },
  {
    id: 'pipeline',
    title: 'How it works',
    component: Pipeline,
    steps: 3,
    at: { x: PIPE.x, y: PIPE.y },
    notes: 'Start with the empty shovel in the middle. Then Umbraco on the left, WordPress on the right, then turn the tap on.',
  },
  {
    id: 'code',
    title: 'The shovel, roughly',
    component: TheCode,
    steps: 3,
    // nested inside the pipeline's dashed frame (local 960,600 → offset 0,+60 from its centre)
    at: { x: PIPE.x, y: PIPE.y + 60, s: 0.2 },
    notes: 'Camera dives into the frame. Walk through fetch → decode → render.',
  },
  {
    id: 'screens',
    title: 'Two homes',
    component: Screens,
    steps: 1,
    at: { x: 4700, y: 1250, r: 5 },
    notes: 'Swap the placeholders for real screenshots.',
  },
  {
    id: 'live',
    title: 'Live site',
    component: LiveSite,
    at: { x: 7000, y: 1900, r: -3 },
    notes: 'Real iframe. Hover + click to drive it; move the mouse off the frame and the clicker works again.',
  },
  {
    id: 'zero',
    title: 'Zero',
    component: Zero,
    at: { x: 4900, y: -700, r: -7, s: 1.25 },
    notes: 'Pause for laughs.',
  },
  {
    id: 'thanks',
    title: 'Thanks',
    component: Thanks,
    at: { x: 7200, y: 300 },
    notes: 'Questions.',
  },
]
