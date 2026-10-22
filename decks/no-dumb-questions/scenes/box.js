// The diagram on `the-box` (the AI box in the office), shared with deck.js: the `inference` scene
// lives in the GPUs box, and the flight into it rides the disk → GPUs wire.
//
// The hardware is an assumption: 4 × NVIDIA RTX PRO 6000 (Blackwell, 96 GB each), on Ubuntu,
// running DeepSeek V4 Flash. If it's 3 cards, or the older RTX 6000 Ada (48 GB, 960 GB/s), change
// GPU below: the total (VRAM), WhatFits.vue's line and Inference.vue's maths follow from it.
import { defineDiagram } from '@engine/diagram.js'

export const GPU = { name: 'RTX PRO 6000', gb: 96, count: 4, bandwidth: 1792 } // bandwidth in GB/s, per card
export const VRAM = GPU.gb * GPU.count // 384

export const box = defineDiagram({
  reveal: { timer: [400, 700, 1000, 1300, 1600, 1900] },
  nodes: {
    // the box itself: a dashed frame round what runs inside it (its label is drawn by the scene)
    machine: { x: 470, y: 270, w: 1420, h: 760, label: '', tone: 'ghost', at: 1 },
    hf: { x: 40, y: 320, w: 300, h: 190, label: 'Hugging Face', sub: 'download once', at: 2, tone: 'ghost' },
    disk: { x: 520, y: 320, w: 340, h: 190, label: 'Disk', sub: 'the model files', at: 3 },
    gpus: { x: 1040, y: 300, w: 820, h: 590, label: `${GPU.count} × ${GPU.name}`, sub: `${GPU.gb} GB each = ${VRAM} GB of GPU memory`, at: 4, tone: 'ink' },
    runner: { x: 520, y: 780, w: 340, h: 190, label: 'Ollama / vLLM', sub: 'loads the files, runs them', at: 5, tone: 'accent' },
    you: { x: 40, y: 780, w: 300, h: 190, label: 'Your laptop', sub: 'VS Code, chat, scripts', at: 6 },
  },
  edges: [
    { from: 'hf', to: 'disk' },
    { from: 'disk', to: 'gpus', offset: -60 },
    { from: 'runner', to: 'gpus', offset: 60 },
    { from: 'you', to: 'runner', both: true },
  ],
  packets: [
    { edge: 0, label: 'v4-flash', dur: 4 },
    { edge: 3, label: 'prompt', tone: 'accent-2' },
    { edge: 3, label: 'tokens', reverse: true, delay: 1.8, tone: 'accent-2' },
  ],
  slots: {
    inference: { node: 'gpus', cx: 410, cy: 360, w: 640 },
  },
})
