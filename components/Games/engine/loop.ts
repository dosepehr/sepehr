export const STEP = 1 / 60

/**
 * Fixed-timestep rAF loop. `update` runs at 60Hz regardless of display rate;
 * `draw` runs once per frame. Returns a stop function.
 */
export function startLoop(update: (dt: number) => void, draw: (time: number) => void) {
  let raf = 0
  let last = performance.now()
  let acc = 0
  const frame = (now: number) => {
    acc += Math.min(0.25, (now - last) / 1000)
    last = now
    while (acc >= STEP) {
      update(STEP)
      acc -= STEP
    }
    draw(now / 1000)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}
