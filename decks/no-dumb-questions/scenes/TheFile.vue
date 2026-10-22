<script setup>
// What you actually download: a folder. Act 1 turns out to be settings in config.json, and the
// weights are the big files. steps: 3 (config, tokenizer, weights).
import Code from '@engine/components/Code.vue'

const listing = `
$ ls -lh Llama-3.3-70B-Instruct/
config.json                          1 KB
generation_config.json             189 B
tokenizer.json                       9 MB
model-00001-of-00030.safetensors   4.6 GB
model-00002-of-00030.safetensors   4.7 GB
…  26 more like these
model-00030-of-00030.safetensors   2.1 GB
LICENSE                            7.6 KB
`
const config = `
{
  "num_hidden_layers": 80,
  "hidden_size": 8192,
  "num_attention_heads": 64,
  "vocab_size": 128256,
  "torch_dtype": "bfloat16",
  …
}
`
</script>

<template>
  <div class="slide slide--dark file">
    <span class="kicker">what's in the download</span>
    <h2 class="h2 rise">It's a folder of files</h2>
    <div class="panels fade-in" style="--d: 2">
      <Code
        class="listing"
        :code="listing"
        title="terminal"
        :size="28"
        :focus="{ 1: [2], 2: [4], 3: [5, 6, 7, 8] }"
        :callouts="{
          2: { line: 4, text: 'The vocabulary: 128,256 tokens.' },
          3: { line: 8, text: '70 billion weights × 2 bytes ≈ 140 GB, in 30 files.', tone: 'green' },
        }"
      />
      <Code
        class="config"
        :code="config"
        title="config.json (abridged)"
        :size="28"
        :focus="{ 1: [2, 3, 5], 3: [6] }"
        :callouts="{ 1: { line: 5, text: 'Act 1, as settings: 80 layers, 8,192 numbers per token.' } }"
      />
    </div>
    <p class="fineprint">Meta's Llama 3.3 70B on Hugging Face. Sizes rounded.</p>
  </div>
</template>

<style scoped>
.file { padding: 90px 100px; gap: 30px; }
.panels { display: flex; gap: 36px; align-items: flex-start; margin-top: 10px; }
.listing { width: 1030px; flex: none; }
.config { flex: 1; }
</style>
