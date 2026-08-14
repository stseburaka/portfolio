import { RefObject, useEffect, useRef, useState } from "react"

/**
 * Tracks which discrete state (0 … numStates-1) a sticky scroll section is in.
 * Only re-renders when the state index actually changes.
 */
export function useScrollState(
  ref: RefObject<HTMLElement | null>,
  numStates: number
): number {
  const [index, setIndex] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const docTop = el.getBoundingClientRect().top + window.scrollY
      const scrolled = window.scrollY - docTop
      const scrollable = el.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const progress = Math.max(0, Math.min(1, scrolled / scrollable))
      const next = Math.min(numStates - 1, Math.floor(progress * numStates))
      setIndex((prev) => (prev !== next ? next : prev))
    }

    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        update()
        rafRef.current = null
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [ref, numStates])

  return index
}
