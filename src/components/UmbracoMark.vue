<script setup>
// Stylised Umbraco-ish mark. Use standalone (<UmbracoMark :size="200" />) or inside
// another <svg> with `inline` (renders a <g> centred on 0,0 with radius 50).
defineProps({
  size: { type: Number, default: 120 },
  inline: Boolean,
  bg: { type: String, default: 'var(--u-blue)' },
  fg: { type: String, default: '#fff' },
})
</script>

<template>
  <g v-if="inline">
    <circle r="48" :fill="bg" />
    <path
      d="M-19 -21 V1 A19 19 0 0 0 19 1 V-21"
      fill="none"
      :stroke="fg"
      stroke-width="11"
      stroke-linecap="round"
      transform="rotate(-14)"
    />
  </g>
  <svg v-else :width="size" :height="size" viewBox="-50 -50 100 100" class="mark">
    <circle r="48" :fill="bg" />
    <path
      d="M-19 -21 V1 A19 19 0 0 0 19 1 V-21"
      fill="none"
      :stroke="fg"
      stroke-width="11"
      stroke-linecap="round"
      transform="rotate(-14)"
    />
  </svg>
</template>
