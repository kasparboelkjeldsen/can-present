<script setup>
import Code from '../components/Code.vue'
import Step from '../engine/Step.vue'

const php = `
// wp-content/plugins/umbraco-shovel/shovel.php
add_shortcode('umbraco', function ($atts) {
    $id  = $atts['id'];
    $res = wp_remote_get("https://cms.example.com/umbraco/delivery/api/v2/content/item/$id");
    $doc = json_decode(wp_remote_retrieve_body($res), true);

    return shovel_render($doc['properties']['blocks']);
});
`
</script>

<template>
  <div class="slide slide--dark code-scene">
    <div class="blob blob--blue" style="width: 1300px; height: 1300px; left: -500px; bottom: -700px" />
    <div class="head">
      <div class="kicker">Zoom in</div>
      <h2 class="h2">The shovel, <span class="pink">roughly.</span></h2>
    </div>
    <Code :code="php" :focus="{ 1: [5], 2: [6], 3: [8] }" title="shovel.php" class="block" />
    <div class="notes">
      <Step :at="1" anim="right" class="note">① ask Umbraco nicely</Step>
      <Step :at="2" anim="right" class="note">② JSON, obviously</Step>
      <Step :at="3" anim="right" class="note">③ pretend we were always here</Step>
    </div>
  </div>
</template>

<style scoped>
.code-scene { gap: 56px; justify-content: center; }
.head { display: flex; align-items: center; gap: 40px; }
.block { position: relative; }
.block :deep(pre) { font-size: 34px; }
.notes { display: flex; gap: 60px; font-size: 36px; font-weight: 700; color: var(--u-pink); }
</style>
