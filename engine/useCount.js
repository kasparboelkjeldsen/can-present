import { ref, watch, onBeforeUnmount, unref } from 'vue'

/**
 * Animated number. Re-runs whenever `trigger` becomes true (e.g. the scene's `active`).
 * from/to can be refs. Returns a ref with the current (rounded) value.
 */
export function useCount(trigger, from, to, { duration = 1400, delay = 300 } = {}) {
  const n = ref(unref(to))
  let raf = 0, timer = 0
  const ease = (t) => 1 - Math.pow(1 - t, 3)

  function run() {
    cancelAnimationFrame(raf)
    clearTimeout(timer)
    const a = unref(from), b = unref(to)
    n.value = a
    timer = setTimeout(() => {
      const t0 = performance.now()
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / duration)
        n.value = Math.round(a + (b - a) * ease(k))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
  }
  watch(() => unref(trigger), (on) => { if (on) run() }, { immediate: true })
  onBeforeUnmount(() => { cancelAnimationFrame(raf); clearTimeout(timer) })
  return n
}

export const fmtNum = (n) => n.toLocaleString('en-US')
