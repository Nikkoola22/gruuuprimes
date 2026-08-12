/**
 * Cross-browser smooth horizontal scroll helper.
 * Firefox on Windows may not support scrollBy/scrollTo with behavior:'smooth',
 * so we implement a manual animation fallback.
 */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export function smoothScrollBy(el: HTMLElement, delta: number, duration = 300): void {
  const start = el.scrollLeft
  const target = Math.max(0, Math.min(start + delta, el.scrollWidth - el.clientWidth))
  const startTime = performance.now()

  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    el.scrollLeft = start + (target - start) * easeInOutQuad(progress)
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}
