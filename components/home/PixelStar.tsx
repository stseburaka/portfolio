"use client"

import { useEffect, useState } from "react"

type Pixel = readonly [x: number, y: number]
export type PixelStarSize = "small" | "medium" | "large"

export const PIXEL_STAR_SIZES: Record<PixelStarSize, number> = {
  small: 24,
  medium: 36,
  large: 48,
}

const STAR_STATES: readonly (readonly Pixel[])[] = [
  // 1.svg — one center pixel.
  [[9, 9]],
  // 2.svg — the four pixels around the center.
  [[8, 9], [9, 8], [9, 10], [10, 9]],
  // 3.svg — the 3 × 3 cross.
  [[7, 9], [8, 9], [9, 9], [9, 8], [9, 7], [9, 11], [9, 10], [10, 9], [11, 9]],
  // 4.svg — the 9-pixel cross.
  [[5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [9, 8], [9, 7], [9, 13], [9, 6], [9, 12], [9, 5], [9, 11], [9, 10], [10, 9], [11, 9], [12, 9], [13, 9]],
  // 5.svg — the full burst, including the source SVG's gaps along each ray.
  [
    [3, 9], [1, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9],
    [8, 8], [8, 10], [10, 8], [10, 10], [9, 8],
    [9, 15], [9, 17], [9, 7], [9, 13], [9, 6], [9, 12], [9, 5], [9, 11], [9, 3], [9, 1], [9, 10],
    [10, 9], [11, 9], [12, 9], [13, 9], [15, 9], [17, 9],
  ],
]

const FRAME_MS = 120
const PEAK_PAUSE_MS = 180
const TIMELINE = [0, 1, 2, 3, 4, 3, 2, 1, 0, -1] as const

interface PixelStarProps {
  left: number
  top: number
  size: PixelStarSize
  initialDelayMs: number
  cyclePauseMs: number
}

export function PixelStar({ left, top, size, initialDelayMs, cyclePauseMs }: PixelStarProps) {
  const [timelineIndex, setTimelineIndex] = useState(-1)
  const stateIndex = timelineIndex < 0 ? -1 : TIMELINE[timelineIndex]
  const starSize = PIXEL_STAR_SIZES[size]

  useEffect(() => {
    const delay = timelineIndex < 0
      ? initialDelayMs
      : timelineIndex === TIMELINE.length - 1
        ? cyclePauseMs
        : stateIndex === 4
          ? PEAK_PAUSE_MS
          : FRAME_MS

    const timeout = window.setTimeout(() => {
      setTimelineIndex((current) => current < 0 || current === TIMELINE.length - 1 ? 0 : current + 1)
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [cyclePauseMs, initialDelayMs, stateIndex, timelineIndex])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left, top, width: starSize, height: starSize }}
    >
      {stateIndex >= 0 && (
        <svg
          width={starSize}
          height={starSize}
          viewBox="0 0 19 19"
          fill="none"
          shapeRendering="crispEdges"
        >
          {STAR_STATES[stateIndex].map(([x, y], index) => (
            <rect key={`${x}-${y}-${index}`} x={x} y={y} width="1" height="1" fill="#B8B8B8" />
          ))}
        </svg>
      )}
    </div>
  )
}
