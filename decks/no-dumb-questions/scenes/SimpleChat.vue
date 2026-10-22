<script setup>
// The simplest harness: a chat loop. The conversation is an array, sent whole every turn.
// steps: 3.
import Code from '@engine/components/Code.vue'

const src = `
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
]

while (true) {
  const question = await prompt('> ')
  messages.push({ role: 'user', content: question })

  const answer = await llm(messages) // one HTTP call
  messages.push({ role: 'assistant', content: answer })

  console.log(answer)
}
`
</script>

<template>
  <div class="slide slide--light chat">
    <span class="kicker">the simplest harness</span>
    <h2 class="h2 rise">A chat app in 13 lines</h2>
    <Code
      class="fade-in"
      style="--d: 2"
      :code="src"
      title="chat.js"
      :size="28"
      :focus="{ 1: [1, 2, 3], 2: [9], 3: [13] }"
      :callouts="{
        1: { line: 3, text: 'The whole conversation is just an array.' },
        2: { line: 9, text: 'Every turn sends the WHOLE array again. The model remembers nothing between calls.' },
        3: { line: 13, text: 'That is every chat app. The rest is UI.', tone: 'green' },
      }"
    />
  </div>
</template>

<style scoped>
.chat { padding: 80px 140px; gap: 28px; }
</style>
