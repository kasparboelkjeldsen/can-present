<script setup>
// Stylised WordPress-ish mark (ring + W). Standalone or `inline` inside another <svg>.
defineProps({
  size: { type: Number, default: 120 },
  inline: Boolean,
  color: { type: String, default: 'var(--wp-blue)' },
  cut: { type: String, default: '#fff' },
})
</script>

<template>
  <g v-if="inline">
    <circle r="47" fill="none" :stroke="color" stroke-width="5" />
    <circle r="38" :fill="color" />
    <path
      d="M-27 -15 L-14 22 L0 -8 L14 22 L27 -15"
      fill="none"
      :stroke="cut"
      stroke-width="7"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </g>
  <svg v-else :width="size" :height="size" viewBox="-50 -50 100 100" class="mark">
    <circle r="47" fill="none" :stroke="color" stroke-width="5" />
    <circle r="38" :fill="color" />
    <path
      d="M-27 -15 L-14 22 L0 -8 L14 22 L27 -15"
      fill="none"
      :stroke="cut"
      stroke-width="7"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>
