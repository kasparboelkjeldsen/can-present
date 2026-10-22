<script setup>
// A token chip: a rounded pill in one of six colours (--tok-0 … --tok-5 in theme.css), optionally
// with its token id under it. The deck's recurring picture of "text as tokens".
//   <Tok :hue="2">Count</Tok>   <Tok :hue="0" :id="3699" show-id>items</Tok>   <Tok hot>it</Tok>
defineProps({
  hue: { type: Number, default: 0 },
  id: { type: Number, default: null },
  showId: { type: Boolean, default: false },
  hot: { type: Boolean, default: false },
  dim: { type: Boolean, default: false },
})
</script>

<template>
  <span class="tok" :class="{ 'tok--hot': hot, 'tok--dim': dim }" :style="{ '--c': `var(--tok-${hue % 6})` }">
    <span class="tok-text"><slot /></span>
    <span v-if="id != null" class="tok-id" :class="{ 'is-on': showId }">{{ id }}</span>
  </span>
</template>

<style scoped>
.tok { position: relative; display: inline-flex; flex-direction: column; align-items: center; gap: 14px; vertical-align: top; transition: opacity 0.4s, transform 0.4s var(--ease-out); }
.tok-text {
  padding: 0.18em 0.5em;
  border-radius: 0.5em;
  background: var(--c);
  color: var(--night);
  font: 700 1em/1.2 var(--mono);
  white-space: pre;
  box-shadow: 0 0.12em 0 rgba(0, 0, 0, 0.18);
}
.tok-id { font: 700 0.62em var(--mono); color: var(--muted); opacity: 0; transform: translateY(-12px); transition: opacity 0.5s, transform 0.5s var(--ease-out); }
.tok-id.is-on { opacity: 1; transform: none; }
.tok--hot .tok-text { box-shadow: 0 0 0 0.12em var(--paper), 0 0 0 0.24em var(--pink); }
.tok--dim { opacity: 0.35; }
</style>
