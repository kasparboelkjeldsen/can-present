<script setup>
// Renders a scene scaled down to fit its box (presenter view, thumbnails).
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SceneFrame from './SceneFrame.vue'

defineProps({ scene: Object, step: { type: Number, default: 0 }, active: Boolean })
const box = ref(null)
const scale = ref(0.2)
let ro
onMounted(() => {
  ro = new ResizeObserver(([e]) => { scale.value = e.contentRect.width / 1920 })
  ro.observe(box.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div ref="box" class="preview">
    <div v-if="scene" class="inner" :style="{ transform: `scale(${scale})` }">
      <SceneFrame :scene="scene" :step="step" :active="active" preview />
    </div>
    <div v-else class="end">— end —</div>
  </div>
</template>

<style scoped>
.preview { position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 12px; background: #000; }
.inner { position: absolute; top: 0; left: 0; transform-origin: 0 0; }
.end { position: absolute; inset: 0; display: grid; place-items: center; color: #667; font-size: 20px; }
</style>
