<script setup>
import UmbracoMark from '../components/UmbracoMark.vue'
import WordPressMark from '../components/WordPressMark.vue'
import Shovel from '../components/Shovel.vue'
</script>

<template>
  <div class="slide slide--dark title">
    <div class="blob blob--blue floaty" style="width: 1400px; height: 1400px; left: -500px; top: -600px" />
    <div class="blob blob--pink floaty" style="width: 1100px; height: 1100px; right: -300px; bottom: -500px; animation-delay: -4s" />

    <div class="copy">
      <div class="kicker in" style="--d: 0">Umbraco Meetup · 22 Oct 2026</div>
      <h1 class="h1">
        <span class="in" style="--d: 1">Shovelling</span>
        <span class="in pink" style="--d: 2">Umbraco</span>
        <span class="in small" style="--d: 3">into other people's</span>
        <span class="in wpword" style="--d: 4">
          WordPress
          <svg class="scribble" viewBox="0 0 600 40" preserveAspectRatio="none">
            <path d="M5 28 C 120 8, 220 36, 330 18 S 520 10, 595 24" />
          </svg>
        </span>
      </h1>
      <div class="byline in" style="--d: 6">Kaspar Boel Kjeldsen</div>
    </div>

    <!-- the actual shovelling -->
    <svg class="scene-art" viewBox="0 0 800 720">
      <!-- ground + pile -->
      <path class="ground" d="M40 652 Q 400 630 780 652" />
      <g transform="translate(372 628) scale(0.36)"><UmbracoMark inline /></g>
      <g transform="translate(430 618) scale(0.42) rotate(18)"><UmbracoMark inline /></g>
      <g transform="translate(486 632) scale(0.32) rotate(-22)"><UmbracoMark inline /></g>
      <g transform="translate(410 596) scale(0.3) rotate(40)"><UmbracoMark inline /></g>

      <!-- target -->
      <g transform="translate(650 250)">
        <g class="wp-gulp">
          <circle r="150" class="wp-halo" />
          <g transform="scale(2.1)"><WordPressMark inline cut="var(--u-navy)" /></g>
        </g>
        <g class="sparks">
          <line v-for="a in 10" :key="a" x1="0" y1="-120" x2="0" y2="-150" :transform="`rotate(${a * 36})`" />
        </g>
      </g>

      <!-- shovel, rotating around the hands -->
      <g transform="translate(120 420)">
        <g class="shovel">
          <Shovel inline />
          <g class="rider" transform="translate(338 -10) scale(0.5)"><UmbracoMark inline /></g>
        </g>
      </g>

      <!-- the one in flight -->
      <g transform="translate(408 258)">
        <g class="flyer">
          <g transform="scale(0.5)"><UmbracoMark inline /></g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.title { justify-content: center; }
.copy { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 48px; }
.h1 { display: flex; flex-direction: column; font-size: 168px; }
.h1 .small { font-size: 76px; font-weight: 700; letter-spacing: -0.01em; margin: 18px 0 6px; opacity: 0.9; }
.wpword { position: relative; align-self: flex-start; color: #fff; }
.scribble {
  position: absolute;
  left: -10px;
  right: -10px;
  bottom: -26px;
  width: calc(100% + 20px);
  height: 44px;
  overflow: visible;
}
.scribble path {
  fill: none;
  stroke: var(--u-pink-hot);
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: 700;
}
.byline { font-size: 38px; font-weight: 700; color: var(--u-pink); }

/* entrance: replays every time the scene becomes active */
.is-active .in { animation: rise 0.9s var(--ease-out) both; animation-delay: calc(var(--d) * 110ms + 250ms); }
.is-active .scribble path { animation: draw 0.9s var(--ease-out) 1.1s both; }
@keyframes rise { from { opacity: 0; transform: translateY(40px); } }
@keyframes draw { from { stroke-dashoffset: 700; } }

.scene-art {
  position: absolute;
  right: -30px;
  top: 120px;
  width: 990px;
  height: 891px;
  overflow: visible;
}
.ground { fill: none; stroke: rgba(245, 193, 188, 0.35); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 2 18; }
.wp-halo { fill: rgba(56, 88, 233, 0.12); }

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
.sparks line { stroke: var(--u-pink); stroke-width: 8; stroke-linecap: round; }
.sparks { animation-name: sparks; animation-timing-function: ease-out; opacity: 0; }
@keyframes sparks {
  0%, 70% { opacity: 0; transform: scale(0.7); }
  72% { opacity: 1; transform: scale(0.8); }
  86% { opacity: 0; transform: scale(1.25); }
  100% { opacity: 0; }
}
</style>
