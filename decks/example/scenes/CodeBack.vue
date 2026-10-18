<script setup>
// The back of the `code` card (deck.js: back: 'code'): the front shows a deck.js snippet, this side
// shows what it makes. No `at`: the engine puts it on its front, and → from the front's last step
// turns the card over. A mini canvas: the three scenes of the snippet as cards, `inside` nested in
// the diagram, and the camera frame flying between them (CSS only, under .is-active).
</script>

<template>
  <div class="slide slide--dark code-back">
    <span class="kicker rise">the other side</span>
    <h2 class="h2 rise" style="--d: 1">What that code makes</h2>
    <p class="lead rise" style="--d: 2">Three entries in <code>deck.js</code>, three cards on one canvas.</p>

    <div class="mini rise" style="--d: 3">
      <div class="mcard mcard--code">
        <i style="width: 62%" /><i style="width: 80%" /><i class="hot" style="width: 70%" /><i style="width: 45%" />
        <span class="tag">code</span>
      </div>
      <div class="mcard mcard--diagram">
        <div class="box box--a" />
        <div class="wire" />
        <div class="box box--b"><div class="mcard mcard--inside"><span class="tag tag--in">inside</span></div></div>
        <span class="tag">diagram</span>
      </div>
      <div class="camera"><span>camera</span></div>
    </div>
  </div>
</template>

<style scoped>
.code-back { padding: 100px 140px; gap: 30px; }
.code-back .lead { color: rgba(245, 241, 232, 0.8); }

.mini {
  position: relative;
  flex: 1;
  border-radius: 28px;
  background: radial-gradient(circle, var(--deck-grid) 2px, transparent 2.5px) 0 0 / 40px 40px, var(--deck-canvas);
  box-shadow: inset 0 0 0 2px rgba(245, 241, 232, 0.08);
}

.mcard {
  position: absolute;
  border-radius: 14px;
  background: var(--paper);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}
.mcard--code {
  left: 150px; top: 150px; width: 440px; height: 248px;
  transform: rotate(-1deg);
  display: flex; flex-direction: column; gap: 18px; padding: 36px 40px;
  background: #141a26;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), inset 0 0 0 2px rgba(245, 241, 232, 0.12);
}
.mcard--code i { display: block; height: 18px; border-radius: 9px; background: rgba(245, 241, 232, 0.28); }
.mcard--code i.hot { background: var(--amber); }
.mcard--diagram { left: 840px; top: 70px; width: 640px; height: 360px; }
.box { position: absolute; border-radius: 14px; border: 5px solid var(--ink); }
.box--a { left: 50px; top: 120px; width: 150px; height: 120px; background: var(--amber); }
.box--b { left: 330px; top: 70px; width: 260px; height: 220px; background: #fff; }
.wire { position: absolute; left: 205px; top: 176px; width: 125px; height: 0; border-top: 6px dashed var(--ink); }
.mcard--inside { left: 25px; top: 55px; width: 200px; height: 112px; background: var(--ink); box-shadow: none; }

/* each mini card's id, inside it */
.tag {
  position: absolute;
  right: 28px;
  bottom: 18px;
  font: 700 28px var(--mono);
  color: var(--amber);
  white-space: nowrap;
}
.mcard--diagram > .tag { right: auto; left: 50px; bottom: 22px; color: var(--ink); }
.tag--in { right: auto; bottom: auto; left: 50%; top: 50%; transform: translate(-50%, -50%); }

/* the camera: a frame that flies from the code card to the diagram and back */
.camera {
  position: absolute;
  left: 115px; top: 115px; width: 510px; height: 318px;
  border: 6px dashed var(--amber);
  border-radius: 20px;
}
.camera span {
  position: absolute;
  right: 18px;
  top: -24px;
  padding: 4px 18px;
  border-radius: 999px;
  background: var(--amber);
  color: var(--ink);
  font: 700 28px var(--sans);
}
.is-active .camera { animation: fly 6s cubic-bezier(0.65, 0, 0.35, 1) 1.4s infinite; }
@keyframes fly {
  0%, 30% { left: 115px; top: 115px; width: 510px; height: 318px; }
  50%, 80% { left: 805px; top: 35px; width: 710px; height: 430px; }
  100% { left: 115px; top: 115px; width: 510px; height: 318px; }
}
</style>
