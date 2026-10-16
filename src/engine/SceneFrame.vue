<script setup>
import { provide, computed } from 'vue'

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
