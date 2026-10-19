<script setup>
import { provide, computed } from 'vue'
import { zoomOf } from './cameraState.js'

const props = defineProps({
  scene: { type: Object, required: true },
  step: { type: Number, default: 0 },
  active: { type: Boolean, default: false },
  near: { type: Boolean, default: true },
  preview: { type: Boolean, default: false },
})
provide('scene-step', computed(() => props.step))
provide('scene-active', computed(() => props.active))
provide('scene-near', computed(() => props.near))
provide('scene-preview', computed(() => props.preview))
// the card's on-screen scale (1 = it fills the stage), for <Detail>; thumbnails are always at 1.
// Lazy: it's only recomputed per camera frame while something in the scene reads it.
provide('scene-zoom', computed(() => (props.preview ? 1 : zoomOf(props.scene.at?.s ?? 1))))
</script>

<template>
  <div class="scene-frame" :class="{ 'is-active': active }">
    <component :is="scene.component" />
  </div>
</template>

<style scoped>
.scene-frame {
  position: relative;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
}
</style>
