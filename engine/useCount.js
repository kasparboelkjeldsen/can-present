import { ref, watch, onBeforeUnmount, toValue } from 'vue'

const ease = (t) => 1 - Math.pow(1 - t, 3)

/**
 * The counter behind useCount and <BigNumber>. Same arguments as useCount, and returns
 *   value    – ref with the current value, rounded to `decimals`
 *   progress – ref with the eased progress of the current run, 0…1 (1 when idle), e.g. for a ring
 * trigger/from/to can be refs, getters or plain values.
 */
export function useCounter(trigger, from, to, { duration = 1400, delay = 300, decimals = 0 } = {}) {
  const value = ref(toValue(to))
  const progress = ref(1)
  const f = 10 ** decimals
  const round = (v) => Math.round(v * f) / f
  let raf = 0, timer = 0

  function run() {
    cancelAnimationFrame(raf)
    clearTimeout(timer)
    const a = toValue(from), b = toValue(to)
    value.value = a
    progress.value = 0
    timer = setTimeout(() => {
      const t0 = performance.now()
      const tick = (now) => {
        const k = Math.min(1, Math.max(0, (now - t0) / duration)) // a frame can be stamped before t0
        progress.value = ease(k)
        value.value = round(a + (b - a) * ease(k))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
  }
  watch(() => toValue(trigger), (on) => { if (on) run() }, { immediate: true })
  onBeforeUnmount(() => { cancelAnimationFrame(raf); clearTimeout(timer) })
  return { value, progress }
}

/**
 * Animated number. Re-runs whenever `trigger` becomes true (e.g. the scene's `active`).
 * from/to can be refs (or getters). Returns a ref with the current (rounded) value.
 * Options: duration (ms, 1400), delay (ms, 300), decimals (0).
 */
export function useCount(trigger, from, to, options) {
  return useCounter(trigger, from, to, options).value
}

export const fmtNum = (n) => n.toLocaleString('en-US')
