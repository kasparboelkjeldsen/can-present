<script setup>
// The looping shovel: digs into a pile of Umbraco logos and flings one into the WordPress logo.
// Made for dark backgrounds. Size it with CSS (viewBox 0 0 800 720).
import UmbracoMark from './UmbracoMark.vue'
import WordPressMark from './WordPressMark.vue'
import Shovel from './Shovel.vue'

// cut: the background the WordPress mark sits on (its cut-out lines take that colour)
defineProps({ target: { type: Boolean, default: true }, cut: { type: String, default: 'var(--k-dark)' } })
</script>

<template>
  <svg class="shovel-loop" viewBox="0 0 800 720">
    <path class="ground" d="M40 652 Q 400 630 780 652" />
    <g transform="translate(372 628) scale(0.36)"><UmbracoMark inline /></g>
    <g transform="translate(430 618) scale(0.42) rotate(18)"><UmbracoMark inline /></g>
    <g transform="translate(486 632) scale(0.32) rotate(-22)"><UmbracoMark inline /></g>
    <g transform="translate(410 596) scale(0.3) rotate(40)"><UmbracoMark inline /></g>

    <g v-if="target" transform="translate(650 250)">
      <g class="wp-gulp">
        <circle r="150" class="wp-halo" />
        <g transform="scale(2.1)"><WordPressMark inline :cut="cut" /></g>
      </g>
      <g class="sparks">
        <line v-for="a in 10" :key="a" x1="0" y1="-120" x2="0" y2="-150" :transform="`rotate(${a * 36})`" />
      </g>
    </g>

    <g transform="translate(120 420)">
      <g class="shovel">
        <Shovel inline shaft="var(--k-green)" blade="var(--k-sand)" edge="var(--umbraco)" />
        <g class="rider" transform="translate(338 -10) scale(0.5)"><UmbracoMark inline /></g>
      </g>
    </g>

    <g transform="translate(408 258)">
      <g class="flyer"><g transform="scale(0.5)"><UmbracoMark inline /></g></g>
    </g>
  </svg>
</template>

<style scoped>
.shovel-loop { display: block; overflow: visible; }
.ground { fill: none; stroke: rgba(238, 237, 233, 0.35); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 2 18; }
.wp-halo { fill: rgba(56, 88, 233, 0.16); }

/* 3.6s loop: dig → load → fling → fly → gulp */
.shovel, .rider, .flyer, .wp-gulp, .sparks { animation-duration: 3.6s; animation-iteration-count: infinite; }
.shovel { animation-name: swing; animation-timing-function: ease-in-out; }
@keyframes swing {
  0% { transform: rotate(24deg); }
  18% { transform: rotate(33deg); }
  34% { transform: rotate(20deg); animation-timing-function: cubic-bezier(0.6, 0, 1, 0.6); }
  44% { transform: rotate(-28deg); animation-timing-function: ease-out; }
  52% { transform: rotate(-32deg); animation-timing-function: ease-in-out; }
  80%, 100% { transform: rotate(24deg); }
}
.rider { animation-name: rider; animation-timing-function: step-end; }
@keyframes rider {
  0%, 14% { opacity: 0; }
  15%, 43% { opacity: 1; }
  44%, 100% { opacity: 0; }
}
.flyer { animation-name: fly; animation-timing-function: linear; opacity: 0; }
@keyframes fly {
  0%, 43.9% { opacity: 0; transform: translate(0, 0) rotate(0) scale(1); }
  44% { opacity: 1; transform: translate(0, 0) rotate(0) scale(1); }
  51% { transform: translate(60px, -110px) rotate(-120deg) scale(0.95); }
  58% { transform: translate(125px, -155px) rotate(-240deg) scale(0.9); }
  65% { transform: translate(190px, -105px) rotate(-360deg) scale(0.8); opacity: 1; }
  71% { transform: translate(242px, -8px) rotate(-470deg) scale(0.3); opacity: 0; }
  100% { opacity: 0; transform: translate(242px, -8px) scale(0.3); }
}
.wp-gulp { animation-name: gulp; animation-timing-function: var(--ease-spring); }
@keyframes gulp {
  0%, 69% { transform: scale(1); }
  74% { transform: scale(1.14) rotate(-6deg); }
  82% { transform: scale(0.96) rotate(3deg); }
  90%, 100% { transform: scale(1) rotate(0); }
}
.sparks line { stroke: var(--k-green); stroke-width: 8; stroke-linecap: round; }
.sparks { animation-name: sparks; animation-timing-function: ease-out; opacity: 0; }
@keyframes sparks {
  0%, 70% { opacity: 0; transform: scale(0.7); }
  72% { opacity: 1; transform: scale(0.8); }
  86% { opacity: 0; transform: scale(1.25); }
  100% { opacity: 0; }
}
</style>
