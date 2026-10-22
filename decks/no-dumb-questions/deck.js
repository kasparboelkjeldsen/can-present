// ------------------------------------------------------------------
// No dumb questions: an explainer (read, not presented: no speaker notes) about what an LLM is,
// what a model is, what a harness is and what agentic coding means. Order here = order on stage.
//
// Canvas layout (press O): four rows, one act each, snaking down the canvas.
//   act 1, the LLM      top row, left → right. `inside` (bigger than normal) is the machine;
//                       the camera dives into its Vectors box (riding the tokens → vectors wire)
//                       and on into "how close?" (dot-product), then into its 80-layers box and
//                       on into a layer's two halves (attention, weights). Three levels deep.
//   act 2, the model    second row, right → left. `the-box` is the office box; the camera rides
//                       the disk → GPUs wire into its GPUs (inference). `local` turns over to
//                       show `cloud` on its back.
//   act 3, the harness  third row, left → right. The camera rides a tool call from the model
//                       back into the Harness box (agent-loop).
//   act 4, the agent    bottom row, right → left.
//   finale              `the-stack`, in the middle of the canvas: every other card orbits it.
// Each act opener shows its act's name in giant letters from far away (components/ActLabel.vue).
//
//   id       → URL hash (#attention/2)
//   steps    → number of build steps inside the scene (0 = none)
//   at       → place on the canvas: x/y = centre in world px, r = rotation (deg), s = scale
//   parent   → scene sits inside `parent` (place it with nest()); revealDelay times its entrance
//   via      → the flight in rides a diagram wire (ride(diagram, edge, parentAt, opts))
//   back     → this scene is the back of that card (→ turns it over)
//   formation → while on stage, the other cards gather round it
// ------------------------------------------------------------------
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/dm-sans/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './theme.css'
import { nest } from '@engine/layout.js'
import { ride } from '@engine/diagram.js'
import { inside } from './scenes/inside.js'
import { box } from './scenes/box.js'
import { harness } from './scenes/harness.js'
import { VECTORS_SLOT, LAYER_SLOTS } from './scenes/geometry.js'
import Title from './scenes/Title.vue'
import FourWords from './scenes/FourWords.vue'
import NextToken from './scenes/NextToken.vue'
import Tokens from './scenes/Tokens.vue'
import Inside from './scenes/Inside.vue'
import Vectors from './scenes/Vectors.vue'
import DotProduct from './scenes/DotProduct.vue'
import Layer from './scenes/Layer.vue'
import Attention from './scenes/Attention.vue'
import Weights from './scenes/Weights.vue'
import Training from './scenes/Training.vue'
import LlmRecap from './scenes/LlmRecap.vue'
import ActModel from './scenes/ActModel.vue'
import TheFile from './scenes/TheFile.vue'
import SizeMath from './scenes/SizeMath.vue'
import Runners from './scenes/Runners.vue'
import TheBox from './scenes/TheBox.vue'
import Inference from './scenes/Inference.vue'
import WhatFits from './scenes/WhatFits.vue'
import Local from './scenes/Local.vue'
import Cloud from './scenes/Cloud.vue'
import OpenClosed from './scenes/OpenClosed.vue'
import ActHarness from './scenes/ActHarness.vue'
import SimpleChat from './scenes/SimpleChat.vue'
import Harness from './scenes/Harness.vue'
import AgentLoop from './scenes/AgentLoop.vue'
import Copilot from './scenes/Copilot.vue'
import ClaudeCode from './scenes/ClaudeCode.vue'
import Context from './scenes/Context.vue'
import ActAgent from './scenes/ActAgent.vue'
import TheLoop from './scenes/TheLoop.vue'
import Ladder from './scenes/Ladder.vue'
import SpecDriven from './scenes/SpecDriven.vue'
import ThisDeck from './scenes/ThisDeck.vue'
import GoodBad from './scenes/GoodBad.vue'
import Questions from './scenes/Questions.vue'
import TheStack from './scenes/TheStack.vue'

// the three diagrams are bigger than a normal card: the camera pulls back to show them
const INSIDE = { x: 9700, y: 0, s: 1.4 }
const BOX = { x: 5200, y: 3300, s: 1.3 }
const HARNESS = { x: 2950, y: 6600, s: 1.3 }
// cards nested in nested cards need their parent's placement
const VECTORS = nest(INSIDE, inside.slot('vectors'))
const LAYER = nest(INSIDE, inside.slot('layer'))

const ROW1 = 0, ROW2 = 3300, ROW3 = 6600, ROW4 = 9900

export default {
  id: 'no-dumb-questions',
  title: 'No dumb questions',
  icon: '🧠',
  scenes: [
    // ---- act 1, the LLM: top row, left → right ----
    { id: 'title', title: 'No dumb questions', component: Title, at: { x: 0, y: ROW1 } },
    { id: 'four-words', title: 'Four words', component: FourWords, steps: 5, at: { x: 2300, y: ROW1 + 120, r: -1.5 } },
    { id: 'next-token', title: 'It predicts the next token', component: NextToken, steps: 3, at: { x: 4600, y: ROW1, r: 1.5 } },
    { id: 'tokens', title: 'A token is a piece of text', component: Tokens, steps: 2, at: { x: 6900, y: ROW1 + 120, r: -1 } },
    { id: 'inside', title: 'One token, start to finish', component: Inside, at: INSIDE },
    // dive 1: into the Vectors box, riding the tokens → vectors wire as the token "Count"
    {
      id: 'vectors', title: 'Each token becomes a list of numbers', component: Vectors, steps: 2,
      parent: 'inside', at: VECTORS, revealDelay: inside.revealDelay('vectors'),
      via: ride(inside, 1, INSIDE, { label: 'Count = 2568', tone: 'accent-2', zoom: 2.2 }),
    },
    // …and one level deeper, into its "how close?" frame
    { id: 'dot-product', title: 'How close? Multiply, then add.', component: DotProduct, steps: 3, parent: 'vectors', at: nest(VECTORS, VECTORS_SLOT) },
    // dive 2: into the 80-layers box, and into each half of a layer
    { id: 'layer', title: 'Each layer does two things', component: Layer, parent: 'inside', at: LAYER, revealDelay: inside.revealDelay('layers') },
    { id: 'attention', title: 'Which words matter to “it”?', component: Attention, steps: 4, parent: 'layer', at: nest(LAYER, LAYER_SLOTS.attention) },
    { id: 'weights', title: 'Where the knowledge lives', component: Weights, steps: 3, parent: 'layer', at: nest(LAYER, LAYER_SLOTS.weights) },
    { id: 'training', title: 'Training: guess, check, nudge', component: Training, steps: 3, at: { x: 12500, y: ROW1 + 100, r: 1.5 } },
    { id: 'llm-recap', title: 'So, an LLM is…', component: LlmRecap, steps: 3, at: { x: 14800, y: ROW1, r: -1 } },

    // ---- act 2, the model: second row, right → left ----
    { id: 'act-model', title: 'How do you get DeepSeek into the machine?', component: ActModel, steps: 1, at: { x: 14800, y: ROW2, r: 1 } },
    { id: 'the-file', title: "It's a folder of files", component: TheFile, steps: 3, at: { x: 12500, y: ROW2 + 100, r: -1 } },
    { id: 'size-math', title: 'How big is a model?', component: SizeMath, steps: 4, at: { x: 10200, y: ROW2, r: 1.5 } },
    { id: 'runners', title: 'The file needs a player', component: Runners, steps: 4, at: { x: 7900, y: ROW2 + 100, r: -1.5 } },
    { id: 'the-box', title: 'The box in the office', component: TheBox, at: BOX },
    // dive 3: into the GPUs, riding the disk → GPUs wire as the weights being loaded
    {
      id: 'inference', title: 'Why GPUs? Why that speed?', component: Inference, steps: 3,
      parent: 'the-box', at: nest(BOX, box.slot('inference')), revealDelay: box.revealDelay('gpus'),
      via: ride(box, 1, BOX, { label: '160 GB of weights', tone: 'accent-2', zoom: 2.4 }),
    },
    { id: 'what-fits', title: 'So, can we run DeepSeek?', component: WhatFits, steps: 5, at: { x: 2600, y: ROW2 + 100, r: 1 } },
    { id: 'local', title: 'Run it yourself', component: Local, at: { x: 300, y: ROW2, r: -1.5 } },
    // the other side of the same decision: → turns the `local` card over
    { id: 'cloud', title: 'Rent it (an API)', component: Cloud, back: 'local', flip: { axis: 'y' } },
    { id: 'open-closed', title: 'Can you download the file?', component: OpenClosed, steps: 3, at: { x: -2000, y: ROW2 + 100, r: 1 } },

    // ---- act 3, the harness: third row, left → right ----
    { id: 'act-harness', title: 'The model can only write text', component: ActHarness, steps: 1, at: { x: -2000, y: ROW3, r: -1 } },
    { id: 'simple-chat', title: 'A chat app in 13 lines', component: SimpleChat, steps: 3, at: { x: 300, y: ROW3 + 100, r: 1 } },
    { id: 'harness', title: 'The model asks. The harness does.', component: Harness, steps: 1, at: HARNESS },
    // dive 4: a tool call rides back from the model into the Harness box
    {
      id: 'agent-loop', title: 'An agent in 11 lines', component: AgentLoop, steps: 3,
      parent: 'harness', at: nest(HARNESS, harness.slot('loop')), revealDelay: harness.revealDelay('harness'),
      via: ride(harness, 1, HARNESS, { reverse: true, label: "read_file('Cart.cs')", tone: 'accent-2', zoom: 2.2 }),
    },
    { id: 'copilot', title: 'Copilot is a harness', component: Copilot, steps: 1, at: { x: 5700, y: ROW3 + 100, r: -1.5 } },
    { id: 'claude-code', title: 'Same loop, plus a lot', component: ClaudeCode, steps: 5, at: { x: 8000, y: ROW3, r: 1 } },
    { id: 'context', title: 'A harness decides what the model sees', component: Context, steps: 6, at: { x: 10300, y: ROW3 + 100, r: -1 } },

    // ---- act 4, the agent: bottom row, right → left ----
    { id: 'act-agent', title: 'Agentic coding', component: ActAgent, steps: 1, at: { x: 10300, y: ROW4, r: 1 } },
    { id: 'the-loop', title: 'The check is the secret', component: TheLoop, at: { x: 8000, y: ROW4 + 100, r: -1 } },
    { id: 'ladder', title: 'From autocomplete to agent', component: Ladder, steps: 5, at: { x: 5700, y: ROW4, r: 1.5 } },
    { id: 'spec-driven', title: 'Write down the what', component: SpecDriven, steps: 5, at: { x: 3400, y: ROW4 + 100, r: -1 } },
    { id: 'this-deck', title: 'This explainer was built that way', component: ThisDeck, at: { x: 1100, y: ROW4, r: 1 } },
    { id: 'good-bad', title: "Where it shines, where it doesn't", component: GoodBad, steps: 2, at: { x: -1200, y: ROW4 + 100, r: -1.5 } },
    { id: 'questions', title: 'Good questions to ask', component: Questions, steps: 5, at: { x: -3500, y: ROW4, r: 1 } },

    // ---- finale: the middle of the canvas; every other card swings into an orbit round it ----
    { id: 'the-stack', title: 'Four words', component: TheStack, at: { x: 5650, y: 4950 }, formation: { shape: 'ring', spin: 90 } },
  ],
}
