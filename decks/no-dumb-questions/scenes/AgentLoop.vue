<script setup>
// Nested in `harness`'s Harness box (the flight in rides the model → harness wire as a tool call).
// The whole agent: the chat loop, plus a menu of tools, plus "keep going until no tool call".
// steps: 3.
import Code from '@engine/components/Code.vue'

const src = `
messages.push({ role: 'user', content: task })

while (true) {
  const reply = await llm(messages, tools)
  messages.push(reply)

  if (!reply.toolCall) break // a plain answer: done

  const result = await run(reply.toolCall) // the harness does it
  messages.push({ role: 'tool', content: result })
}
`
</script>

<template>
  <div class="slide slide--light loop">
    <span class="kicker">the agent loop</span>
    <h2 class="h2">An agent in 11 lines</h2>
    <Code
      :code="src"
      title="agent.js"
      :size="32"
      :focus="{ 1: [4], 2: [7], 3: [9, 10] }"
      :callouts="{
        1: { line: 4, text: 'Send the conversation, plus a menu of tools.' },
        2: { line: 7, text: 'No tool call? The model thinks it is done.' },
        3: { line: 10, text: 'Otherwise: run it, paste the result in, go again.', tone: 'green' },
      }"
    />
  </div>
</template>

<style scoped>
.loop { padding: 90px 140px; gap: 30px; }
</style>
