// The diagram on the `harness` scene, shared with deck.js: the `agent-loop` scene lives in the
// Harness box, and the flight into it rides the model ↔ harness wire backwards, as a tool call.
import { defineDiagram } from '@engine/diagram.js'

export const harness = defineDiagram({
  reveal: { timer: [400, 700, 1000, 1300] },
  nodes: {
    you: { x: 60, y: 520, w: 280, h: 180, label: 'You', sub: '“fix the cart bug”', at: 1 },
    harness: { x: 480, y: 290, w: 820, h: 640, label: 'Harness', sub: 'Copilot, Claude Code, or 11 lines of your own', at: 2, tone: 'accent' },
    model: { x: 1500, y: 290, w: 370, h: 240, label: 'Model', sub: 'local or cloud', at: 3 },
    tools: { x: 1500, y: 690, w: 370, h: 240, label: 'Tools', sub: 'read file · edit file · run command', at: 4 },
  },
  edges: [
    { from: 'you', to: 'harness', both: true, tone: 'paper', label: 'task' },
    { from: 'harness', to: 'model', both: true, tone: 'paper', label: 'asks' },
    { from: 'harness', to: 'tools', both: true, tone: 'paper', label: 'does' },
  ],
  packets: [
    { edge: 1, label: 'messages[]', tone: 'paper' },
    { edge: 1, label: 'read_file?', reverse: true, delay: 1.8, tone: 'paper' },
    { edge: 2, label: 'read_file', delay: 0.9, tone: 'paper' },
    { edge: 2, label: 'file contents', reverse: true, delay: 2.7, tone: 'paper' },
  ],
  slots: {
    loop: { node: 'harness', cx: 410, cy: 385, w: 680 },
  },
})
