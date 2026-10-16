<script setup>
// Code block with a cheap highlighter, per-step line focus and callouts.
//
//   <Code :code="src"
//         :focus="{ 1: [4, 5], 3: { lines: [8], token: 'CorsAllowAllPipelineFilter' } }"
//         :callouts="{ 1: { text: 'Hello', line: 5 }, 5: { text: 'Hmm', line: 12.5, tone: 'green' } }" />
//
// focus:    step → array of 1-based lines (or { lines, token } to light up a single token)
// callouts: step → { text, line, tone? }. Shown only on exactly that step, placed under `line`.
import { computed } from 'vue'
import { useStep } from '../engine/useStep.js'

const props = defineProps({
  code: { type: String, required: true },
  focus: { type: Object, default: () => ({}) },
  callouts: { type: Object, default: () => ({}) },
  title: String,
  size: { type: Number, default: 30 },
})
const { step } = useStep()

const KEYWORDS = new Set(('function return const let var if else foreach as new true false null import from export async ' +
  'await use class public private protected static void fn echo is not and or string int bool var Task get set this ' +
  'using namespace await typeof').split(' '))
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function highlight(line, token) {
  const re = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\$[a-zA-Z_]\w*)|(\b\d+\b)|(\[[A-Z]\w*(?:\([^)]*\))?\])|(\b[a-zA-Z_]\w*\b)|(<\/?[a-z][\w-]*|\/?>)/g
  let out = '', last = 0, m
  while ((m = re.exec(line))) {
    out += esc(line.slice(last, m.index))
    const [t, com, str, vari, num, attr, word, tag] = m
    const after = line.slice(m.index + t.length)
    let cls = ''
    if (com) cls = 'c'
    else if (str) cls = 's'
    else if (vari) cls = 'v'
    else if (num) cls = 'n'
    else if (attr) cls = 'a'
    else if (tag) cls = 'k'
    else if (word) {
      if (KEYWORDS.has(word)) cls = 'k'
      else if (/^\s*\(/.test(after) || /^\s*</.test(after)) cls = 'f'
      else if (/^[A-Z]/.test(word)) cls = 't'
    }
    let html = cls ? `<span class="${cls}">${esc(t)}</span>` : esc(t)
    if (token && word === token) html = `<mark>${esc(t)}</mark>`
    out += html
    last = m.index + t.length
  }
  return out + esc(line.slice(last)) || ' '
}

const raw = computed(() => props.code.replace(/^\n+|\n\s*$/g, '').split('\n'))

const current = computed(() => {
  if (step.value === Infinity) return null
  const keys = Object.keys(props.focus).map(Number).filter((k) => k <= step.value)
  if (!keys.length) return null
  const f = props.focus[Math.max(...keys)]
  return Array.isArray(f) ? { lines: new Set(f) } : { lines: new Set(f.lines), token: f.token }
})

const lines = computed(() =>
  raw.value.map((l, i) => {
    const hot = current.value?.lines.has(i + 1)
    return { html: highlight(l, hot ? current.value?.token : null), hot, dim: current.value && !hot }
  }),
)

const LH = 1.55
const callout = computed(() => {
  const c = props.callouts[step.value]
  if (!c) return null
  const pad = 30
  return { ...c, top: pad + c.line * props.size * LH + 10 }
})
</script>

<template>
  <div class="code" :class="{ 'token-mode': current?.token }" :style="{ '--fs': size + 'px', '--lh': LH }">
    <div v-if="title" class="title">{{ title }}</div>
    <div class="body">
      <pre><code><span
        v-for="(l, i) in lines"
        :key="i"
        class="line"
        :class="{ dim: l.dim, hot: l.hot }"
      ><span class="ln">{{ i + 1 }}</span><span class="src" v-html="l.html" />
</span></code></pre>
      <Transition name="callout">
        <div
          v-if="callout"
          :key="step"
          class="callout code-callout"
          :class="{ 'callout--green': callout.tone === 'green' }"
          :style="{ top: callout.top + 'px' }"
        >{{ callout.text }}</div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.code {
  position: relative;
  border-radius: 24px;
  background: var(--k-dark-deep);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}
.title {
  padding: 16px 32px;
  font: 700 22px var(--mono);
  color: var(--k-green);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.body { position: relative; }
pre { margin: 0; padding: 30px 0; font: 400 var(--fs) / var(--lh) var(--mono); color: #ecebe6; overflow: hidden; border-radius: 0 0 24px 24px; }
.line { display: block; padding: 0 40px 0 0; transition: opacity 0.4s, background 0.4s; }
.line.dim { opacity: 0.25; }
.line.hot { background: rgba(195, 242, 64, 0.08); box-shadow: inset 6px 0 0 var(--k-green); }
.ln { display: inline-block; width: 3.2em; padding-right: 1.1em; text-align: right; color: #6d6b66; user-select: none; }
:deep(.k) { color: var(--k-green); }
:deep(.s) { color: #ffb4aa; }
:deep(.v) { color: #b9c4ff; }
:deep(.n) { color: #ffd479; }
:deep(.a) { color: #ffd479; }
:deep(.f) { color: #f7f6f2; font-weight: 700; }
:deep(.t) { color: #9fb0ff; }
:deep(.c) { color: #8a877f; font-style: italic; }

/* single-token focus: everything on the hot line greys out except the token */
.token-mode .line.hot { background: none; }
.token-mode .line.hot .src, .token-mode .line.hot .src :deep(span) { color: #6d6b66; font-weight: 400; }
:deep(mark) {
  background: none;
  color: #fff;
  font-weight: 700;
  text-decoration: underline wavy var(--k-red);
  text-decoration-thickness: 4px;
  text-underline-offset: 10px;
}

/* sits on the dark code block, so always light (or green) regardless of slide */
.code .code-callout {
  position: absolute;
  right: 36px;
  max-width: 640px;
  z-index: 2;
  background: var(--k-sand);
  color: var(--k-dark);
}
.code-callout::before {
  content: '';
  position: absolute;
  top: -9px;
  left: 40px;
  width: 22px;
  height: 22px;
  background: inherit;
  transform: rotate(45deg);
  border-radius: 3px;
}
.callout-enter-active { transition: opacity 0.4s, transform 0.6s var(--ease-spring); }
.callout-leave-active { transition: opacity 0.2s; }
.callout-enter-from { opacity: 0; transform: translateY(16px) scale(0.95); }
.callout-leave-to { opacity: 0; }
</style>
