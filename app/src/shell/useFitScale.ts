import { useEffect, useState } from 'react'

/** Scale a fixed-size device so the whole of it fits the viewport.
 *
 * The phone is 390 × 844 because the design is measured in those pixels, and
 * shrinking the design itself would break every margin in the handoff. So the
 * pixels stay and the whole thing is scaled instead — a laptop sees the entire
 * screen at once, and never has to scroll the page to reach the tab bar.
 */
// Allows for the top bar and the frame's outer ring, which sits outside the
// scaled box and would otherwise touch the window edge.
export function useFitScale(deviceW: number, deviceH: number, padding = 132) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fit = () => {
      const h = (window.innerHeight - padding) / deviceH
      const w = (Math.min(window.innerWidth, 640) - 32) / deviceW
      // Never scale up: a device larger than its own pixels looks wrong.
      setScale(Math.min(1, h, w))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [deviceW, deviceH, padding])

  return scale
}
