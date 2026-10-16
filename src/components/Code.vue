<script setup>
// Tiny code block with a cheap regex highlighter and per-step line focus.
// <Code :code="src" :focus="{ 1: [3], 2: [4, 5] }" />  — keys are build steps, values are 1-based lines.
import { computed } from 'vue'
import { useStep } from '../engine/useStep.js'

const props = defineProps({
  code: { type: String, required: true },
  focus: { type: Object, default: () => ({}) },
  title: String,
})
const { step } = useStep()

const KEYWORDS = /\b(function|return|const|let|var|if|else|foreach|as|new|true|false|null|import|from|export|async|await|use|class|public|private|fn|echo)\b/

function highlight(line) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const tokens = /(\/\/.*$|#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\$[a-zA-Z_]\w*)|(\b\d+\b)|(\b[a-zA-Z_]\w*(?=\())|(\b[a-zA-Z_]\w*\b)/g
  let out = '', last = 0, m
  while ((m = tokens.exec(line))) {
    out += esc(line.slice(last, m.index))
    const [t, com, str, vari, num, call, word] = m
    if (com) out += `<span class="c">${esc(t)}</span>`
    else if (str) out += `<span class="s">${esc(t)}</span>`
    else if (vari) out += `<span class="v">${esc(t)}</span>`
    else if (num) out += `<span class="n">${esc(t)}</span>`
    else if (call && !KEYWORDS.test(call)) out += `<span class="f">${esc(t)}</span>`
    else if (KEYWORDS.test(word ?? call)) out += `<span class="k">${esc(t)}</span>`
    else out += esc(t)
    last = m.index + t.length
  }
  return out + esc(line.slice(last)) || ' '
}

const lines = computed(() => props.code.replace(/^\n|\n\s*$/g, '').split('\n').map(highlight))

const focused = computed(() => {
  const keys = Object.keys(props.focus).map(Number).filter((k) => k <= step.value)
  if (!keys.length || step.value === Infinity) return null
  return new Set(props.focus[Math.max(...keys)])
})
</script>

<template>
  <div class="code">
    <div v-if="title" class="title">{{ title }}</div>
    <pre><code><span
      v-for="(l, i) in lines"
      :key="i"
      class="line"
      :class="{ dim: focused && !focused.has(i + 1), hot: focused?.has(i + 1) }"
    ><span class="ln">{{ i + 1 }}</span><span v-html="l" />
</span></code></pre>
  </div>
</template>

<style scoped>
.code {
  border-radius: 24px;
  background: var(--u-navy-deep);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
}
.title {
  padding: 18px 32px;
  font: 700 20px var(--mono);
  color: var(--u-pink);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
pre { margin: 0; padding: 30px 0; font: 400 30px/1.6 var(--mono); color: #e6e9ff; }
.line { display: block; padding: 0 40px 0 0; transition: opacity 0.4s, background 0.4s; }
.line.dim { opacity: 0.28; }
.line.hot { background: rgba(245, 193, 188, 0.1); box-shadow: inset 6px 0 0 var(--u-pink); }
.ln { display: inline-block; width: 80px; padding-right: 26px; text-align: right; color: #4c578c; user-select: none; }
:deep(.k) { color: #ff9fc0; font-weight: 700; }
:deep(.s) { color: #b5e8a0; }
:deep(.v) { color: #8fb3ff; }
:deep(.n) { color: #ffcf7a; }
:deep(.f) { color: #f5c1bc; }
:deep(.c) { color: #66709e; font-style: italic; }
</style>
