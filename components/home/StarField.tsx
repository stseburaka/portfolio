import { PixelStar, PIXEL_STAR_SIZES, type PixelStarSize } from "@/components/home/PixelStar"

interface StarPosition {
  x: number
  y: number
  size: PixelStarSize
  initialDelayMs: number
}

const STAR_POSITIONS: readonly StarPosition[] = [
  { x: 7, y: 12, size: "small", initialDelayMs: 0 },
  { x: 22, y: 8, size: "small", initialDelayMs: 650 },
  { x: 40, y: 13, size: "medium", initialDelayMs: 1750 },
  { x: 64, y: 7, size: "small", initialDelayMs: 2350 },
  { x: 86, y: 15, size: "medium", initialDelayMs: 400 },
  { x: 95, y: 33, size: "small", initialDelayMs: 2900 },
  { x: 78, y: 28, size: "small", initialDelayMs: 1100 },
  { x: 56, y: 31, size: "medium", initialDelayMs: 2050 },
  { x: 32, y: 26, size: "medium", initialDelayMs: 3200 },
  { x: 12, y: 34, size: "large", initialDelayMs: 800 },
  { x: 5, y: 56, size: "small", initialDelayMs: 2700 },
  { x: 25, y: 48, size: "small", initialDelayMs: 1500 },
  { x: 45, y: 50, size: "medium", initialDelayMs: 3500 },
  { x: 69, y: 46, size: "small", initialDelayMs: 500 },
  { x: 89, y: 55, size: "small", initialDelayMs: 2200 },
  { x: 79, y: 72, size: "large", initialDelayMs: 1000 },
  { x: 58, y: 65, size: "medium", initialDelayMs: 3000 },
  { x: 36, y: 72, size: "small", initialDelayMs: 1800 },
  { x: 17, y: 69, size: "medium", initialDelayMs: 250 },
  { x: 7, y: 89, size: "small", initialDelayMs: 3400 },
  { x: 27, y: 92, size: "small", initialDelayMs: 1250 },
  { x: 48, y: 86, size: "large", initialDelayMs: 2800 },
  { x: 65, y: 94, size: "small", initialDelayMs: 700 },
  { x: 92, y: 88, size: "small", initialDelayMs: 1950 },
]

const CYCLE_PAUSE_BASE_MS = 2300

interface StarFieldProps {
  width: number
  height: number
}

export function StarField({ width, height }: StarFieldProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
      {STAR_POSITIONS.map((position, index) => {
        const size = PIXEL_STAR_SIZES[position.size]
        // Positions are authored as percentages, then snapped to whole CSS pixels for crisp SVG edges.
        const left = Math.round(width * position.x / 100 - size / 2)
        const top = Math.round(height * position.y / 100 - size / 2)
        const cyclePauseMs = CYCLE_PAUSE_BASE_MS + (index * 173) % 601

        return (
          <PixelStar
            key={`${position.x}-${position.y}`}
            left={left}
            top={top}
            size={position.size}
            initialDelayMs={position.initialDelayMs}
            cyclePauseMs={cyclePauseMs}
          />
        )
      })}
    </div>
  )
}
