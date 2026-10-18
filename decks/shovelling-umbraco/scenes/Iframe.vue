<script setup>
import Step from '@engine/Step.vue'
import DiagonalLine from '../components/DiagonalLine.vue'
</script>

<template>
  <div class="slide slide--dark iframe-scene">
    <DiagonalLine :x1="0" :y1="1080" :x2="300" :y2="828" />

    <div class="heads">
      <Step :at="0" :until="1" anim="down" class="head">
        <h2 class="h2">What about an iframe?</h2>
      </Step>
      <Step :at="1" anim="up" class="head">
        <h2 class="h2">You can't style an iframe.</h2>
        <h2 class="h2 accent second">You can only resize it.</h2>
      </Step>
    </div>

    <!-- an iframe, trying its best -->
    <svg class="art" viewBox="-40 -60 820 660">
      <g class="frame">
        <rect width="640" height="480" rx="20" fill="var(--wp)" />
        <rect width="640" height="52" rx="20" fill="#2a46c9" />
        <rect y="32" width="640" height="20" fill="#2a46c9" />
        <circle cx="30" cy="26" r="8" fill="#ff8071" />
        <circle cx="56" cy="26" r="8" fill="#ffd479" />
        <circle cx="82" cy="26" r="8" fill="#c3f240" />
        <rect x="120" y="14" width="300" height="24" rx="12" fill="rgba(255,255,255,0.25)" />
        <rect class="page" x="18" y="70" width="604" height="392" rx="10" fill="#fff" />
        <rect x="50" y="104" width="300" height="26" rx="6" fill="#d8dcf2" />
        <rect x="50" y="146" width="460" height="16" rx="6" fill="#e6e9f6" />
        <rect x="50" y="176" width="420" height="16" rx="6" fill="#e6e9f6" />
        <rect x="50" y="226" width="160" height="120" rx="10" fill="#e6e9f6" />
        <rect x="230" y="226" width="160" height="120" rx="10" fill="#e6e9f6" />
        <rect x="410" y="226" width="160" height="120" rx="10" fill="#e6e9f6" />
        <!-- the styling attempt -->
        <rect class="paint" x="18" y="70" width="604" height="392" rx="10" fill="var(--k-green)" />
        <g class="nope" transform="translate(320 266)">
          <circle r="70" fill="var(--k-dark)" />
          <path d="M-28 -28 L28 28 M28 -28 L-28 28" stroke="var(--k-red)" stroke-width="14" stroke-linecap="round" />
        </g>
        <!-- resize handle -->
        <g transform="translate(640 480)" stroke="#fff" stroke-width="5" stroke-linecap="round">
          <line x1="-14" y1="-38" x2="-38" y2="-14" />
          <line x1="-14" y1="-24" x2="-24" y2="-14" />
        </g>
      </g>
      <g class="cursor">
        <path d="M0 0 L0 44 L12 33 L20 52 L29 48 L21 30 L37 30 Z" fill="#fff" stroke="var(--k-dark)" stroke-width="3" stroke-linejoin="round" transform="translate(628 468)" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.iframe-scene { justify-content: center; }
.heads { position: relative; height: 420px; width: 900px; z-index: 2; }
.head { position: absolute; left: 0; top: 0; }
.h2 { font-size: 104px; }
.second { margin-top: 40px; transition-delay: 0.5s; }
.step:not(.is-shown) .second { opacity: 0; }
.is-shown .second { animation: rise 0.8s var(--ease-out) 0.6s both; }

.art { position: absolute; right: 90px; top: 210px; width: 820px; height: 660px; overflow: visible; }

/* 6s loop: idle → try to paint → denied → settle for resizing */
.frame, .paint, .nope, .cursor { animation-duration: 6s; animation-iteration-count: infinite; }
.frame { transform-box: view-box; transform-origin: 0 0; animation-name: resize; animation-timing-function: ease-in-out; }
@keyframes resize {
  0%, 45% { transform: scale(1, 1); }
  58% { transform: scale(1.12, 0.9); }
  72% { transform: scale(0.9, 1.08); }
  86%, 100% { transform: scale(1, 1); }
}
.cursor { animation-name: drag; animation-timing-function: ease-in-out; }
@keyframes drag {
  0%, 45% { transform: translate(0, 0); }
  58% { transform: translate(77px, -48px); }
  72% { transform: translate(-64px, 38px); }
  86%, 100% { transform: translate(0, 0); }
}
.paint { opacity: 0; animation-name: paint; animation-timing-function: linear; }
@keyframes paint {
  0%, 10% { opacity: 0; }
  13% { opacity: 0.85; }
  15% { opacity: 0.1; }
  18% { opacity: 0.85; }
  20% { opacity: 0.1; }
  23% { opacity: 0.85; }
  26%, 100% { opacity: 0; }
}
.nope { opacity: 0; transform-box: fill-box; transform-origin: center; animation-name: nope; animation-timing-function: var(--ease-spring); }
@keyframes nope {
  0%, 25% { opacity: 0; transform: translate(320px, 266px) scale(0.4); }
  29% { opacity: 1; transform: translate(320px, 266px) scale(1); }
  31% { transform: translate(306px, 266px) scale(1); }
  33% { transform: translate(334px, 266px) scale(1); }
  35% { transform: translate(320px, 266px) scale(1); opacity: 1; }
  42%, 100% { opacity: 0; transform: translate(320px, 266px) scale(1); }
}
</style>
