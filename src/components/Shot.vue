<script setup>
// Screenshot OR live website in a frame.
//   <Shot src="/shots/foo.png" />                       image (put files in /public/shots)
//   <Shot live="https://www.kjeldsen.dev/" />           real, clickable iframe
//   <Shot />                                            placeholder that says what goes there
//
// Live frames only load once their scene is on stage or one away, and show a placeholder in
// the presenter thumbnails. While you're interacting with the site, keys go to the site;
// move the mouse off the frame (or change scene) and the clicker/arrow keys drive the deck again.
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStep } from '../engine/useStep.js'

const props = defineProps({
  src: String,
  live: String,
  url: { type: String, default: null },
  frame: { type: String, default: 'browser' }, // browser | window | none
  hint: { type: String, default: 'screenshot goes here' },
  width: { type: [Number, String], default: '100%' },
  height: { type: [Number, String], default: null },
  fit: { type: String, default: 'cover' }, // object-fit for images
  position: { type: String, default: 'top' }, // object-position for images
  zoom: { type: Number, default: 1 }, // live only: <1 shows more of the page, >1 magnifies
})

const { active, near, preview } = useStep()
const px = (v) => (v == null ? undefined : typeof v === 'number' ? v + 'px' : v)
const shownUrl = computed(() => props.url ?? (props.live ? props.live.replace(/^https?:\/\//, '').replace(/\/$/, '') : ''))

// ---- live iframe ----
const root = ref(null)
const iframe = ref(null)
const reloadKey = ref(0)
const loaded = ref(false) // sticky: once loaded, keep it (no reload flashing when you come back)
const interacting = ref(false)
watch(near, (n) => { if (n) loaded.value = true }, { immediate: true })

function releaseFocus() {
  if (iframe.value && document.activeElement === iframe.value) {
    root.value?.focus({ preventScroll: true })
    root.value?.blur()
  }
  interacting.value = false
}
const onWinBlur = () => setTimeout(() => {
  interacting.value = !!iframe.value && document.activeElement === iframe.value
})
const onWinFocus = () => { interacting.value = false }
watch(active, (a) => { if (!a) releaseFocus() })
onMounted(() => {
  if (!props.live) return
  addEventListener('blur', onWinBlur)
  addEventListener('focus', onWinFocus)
})
onBeforeUnmount(() => {
  removeEventListener('blur', onWinBlur)
  removeEventListener('focus', onWinFocus)
})
</script>

<template>
  <figure
    ref="root"
    tabindex="-1"
    class="shot"
    :class="[`shot--${frame}`, { 'is-live': live, interacting, 'is-active': active }]"
    :style="{ width: px(width), height: px(height) }"
    @mouseleave="releaseFocus"
  >
    <div v-if="frame !== 'none'" class="bar">
      <span class="dots"><i /><i /><i /></span>
      <span v-if="frame === 'browser'" class="url">
        <span v-if="live" class="live-dot" />{{ shownUrl }}
      </span>
      <span v-if="live && interacting" class="mode">driving the site · move mouse off to return</span>
      <button v-if="live" class="home" title="Reload (back to the starting URL)" @click="reloadKey++; releaseFocus()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
        Reload
      </button>
    </div>
    <div class="body">
      <template v-if="live && !preview">
        <iframe
          v-if="loaded"
          ref="iframe"
          :key="reloadKey"
          :src="live"
          :style="{ width: `${100 / zoom}%`, height: `${100 / zoom}%`, transform: `scale(${zoom})` }"
          allow="fullscreen; clipboard-write"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </template>
      <img v-else-if="src" :src="src" alt="" :style="{ objectFit: fit, objectPosition: position }" />
      <div v-else class="placeholder">
        <svg v-if="live" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        <svg v-else width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span>{{ live ? `live: ${shownUrl}` : hint }}</span>
      </div>
      <slot />
    </div>
  </figure>
</template>

<style scoped>
.shot {
  margin: 0;
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  overflow: hidden;
  background: #fff;
  outline: none;
  box-shadow: 0 30px 80px rgba(10, 16, 50, 0.35), 0 0 0 1px rgba(10, 16, 50, 0.06);
  transition: box-shadow 0.3s;
}
.shot.interacting { box-shadow: 0 30px 80px rgba(10, 16, 50, 0.35), 0 0 0 6px var(--k-green); }
.shot--none { border-radius: 16px; }
.bar {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 52px;
  padding: 0 22px;
  background: #eef0f7;
  border-bottom: 1px solid #dde1ee;
  flex: none;
}
.shot--window .bar { background: var(--k-dark); border-color: transparent; }
.dots { display: flex; gap: 10px; }
.dots i { width: 15px; height: 15px; border-radius: 50%; background: #f28b82; }
.dots i:nth-child(2) { background: #f6c86b; }
.dots i:nth-child(3) { background: #7bd389; }
.url {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 32px;
  padding: 0 18px;
  border-radius: 999px;
  background: #fff;
  color: #6b7090;
  font: 400 17px var(--mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.live-dot { width: 10px; height: 10px; flex: none; border-radius: 50%; background: #e5484d; box-shadow: 0 0 0 0 rgba(229, 72, 77, 0.6); animation: pulse 1.8s infinite; }
@keyframes pulse { 70% { box-shadow: 0 0 0 10px rgba(229, 72, 77, 0); } 100% { box-shadow: 0 0 0 0 rgba(229, 72, 77, 0); } }
.mode { font: 700 16px var(--sans); color: var(--k-dark); background: var(--k-green); padding: 6px 14px; border-radius: 999px; white-space: nowrap; }
.home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px 0 12px;
  border: 0;
  border-radius: 999px;
  background: var(--k-dark);
  color: var(--k-sand);
  font: 700 17px var(--sans);
  cursor: pointer;
  flex: none;
}
.home:hover { background: #000; }
.home:active { transform: scale(0.96); }
.body { position: relative; flex: 1; min-height: 0; overflow: hidden; }
.body img { display: block; width: 100%; height: 100%; }
.body iframe {
  position: absolute;
  top: 0;
  left: 0;
  border: 0;
  transform-origin: 0 0;
  background: #fff;
  pointer-events: none; /* only clickable when its scene is on stage */
}
.is-active .body iframe { pointer-events: auto; }
.placeholder {
  position: absolute;
  inset: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  border: 4px dashed #c9cde0;
  border-radius: 14px;
  color: #8a8fb0;
  font: 700 26px var(--sans);
  text-align: center;
  background: repeating-linear-gradient(45deg, #fafbff, #fafbff 20px, #f3f4fb 20px, #f3f4fb 40px);
}
</style>
