import { useEffect, useRef, useState } from "react"

/**
 * Returns true when the header should be visible.
 * Hides after scrolling down past the threshold, reveals on any upward scroll.
 * Always visible at the very top of the page.
 */
export function useHeaderVisibility(): boolean {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const THRESHOLD = 8

    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        const currentY = window.scrollY
        if (currentY <= 0) {
          setVisible(true)
          lastY.current = 0
        } else {
          const delta = currentY - lastY.current
          if (Math.abs(delta) >= THRESHOLD) {
            setVisible(delta < 0)
            lastY.current = currentY
          }
        }
        rafRef.current = null
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return visible
}
