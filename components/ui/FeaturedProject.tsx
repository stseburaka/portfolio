"use client"

import { ReactNode, useCallback, useRef, useState } from "react"
import Link from "next/link"

export interface FeaturedMetric {
  value: string
  label: string
}

interface FeaturedProjectProps {
  eyebrow: string
  title: string
  description: string
  imagePosition: "left" | "right"
  visual: ReactNode
  metrics?: FeaturedMetric[]
  tagLine?: string
  ctaText: string
  ctaHref?: string
  ctaExternal?: boolean
  ctaLocked?: boolean
  /** Copy shown in the custom pointer label on hover, e.g. "View case >" or "View on Red Dot ↗". */
  cursorLabel?: string
}

const CURSOR_LABEL_OFFSET = 14
// Rough label footprint used only to keep it from overflowing the media box near edges.
const CURSOR_LABEL_SIZE = { width: 190, height: 30 }

function useCursorLabel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const handlePointerActive = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    let x = e.clientX - rect.left + CURSOR_LABEL_OFFSET
    let y = e.clientY - rect.top + CURSOR_LABEL_OFFSET
    if (x + CURSOR_LABEL_SIZE.width > rect.width) {
      x = e.clientX - rect.left - CURSOR_LABEL_SIZE.width - CURSOR_LABEL_OFFSET
    }
    if (y + CURSOR_LABEL_SIZE.height > rect.height) {
      y = e.clientY - rect.top - CURSOR_LABEL_SIZE.height - CURSOR_LABEL_OFFSET
    }
    setPos({ x: Math.max(0, x), y: Math.max(0, y) })
  }, [])

  const handlePointerLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    setPos(null)
  }, [])

  return { containerRef, pos, handlePointerActive, handlePointerLeave }
}

export function FeaturedProject({
  eyebrow,
  title,
  description,
  imagePosition,
  visual,
  metrics,
  tagLine,
  ctaText,
  ctaHref,
  ctaExternal,
  ctaLocked = false,
  cursorLabel,
}: FeaturedProjectProps) {
  const { containerRef, pos, handlePointerActive, handlePointerLeave } = useCursorLabel()

  // imagePosition="right" → CONTENT|VISUAL, "left" → VISUAL|CONTENT
  const gridCols =
    imagePosition === "left"
      ? "md:grid-cols-[67fr_29fr]"
      : "md:grid-cols-[29fr_67fr]"

  const label = ctaLocked
    ? "Available on request"
    : cursorLabel ?? (ctaExternal ? "View ↗" : "View case >")

  const linkClassName =
    "relative block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe7141]"

  const cursorLabelEl = pos && (
    <span
      aria-hidden="true"
      className="font-mono pointer-events-none absolute z-10 inline-flex items-center gap-1.5 whitespace-nowrap select-none"
      style={{
        left: pos.x,
        top: pos.y,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.04em",
        padding: "3px 7px",
        background: "#000",
        color: "#fff",
        lineHeight: 1.4,
      }}
    >
      {ctaLocked && (
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <rect x="3.25" y="7" width="9.5" height="7" rx="1" />
          <path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2" />
        </svg>
      )}
      {label}
    </span>
  )

  const mediaLink = ctaLocked || !ctaHref ? (
    <div className="block h-full w-full">
      {visual}
    </div>
  ) : ctaExternal ? (
    <a
      href={ctaHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ctaText}
      className={linkClassName}
    >
      {visual}
    </a>
  ) : (
    <Link
      href={ctaHref}
      aria-label={ctaText}
      className={linkClassName}
    >
      {visual}
    </Link>
  )

  const hasMetrics = !!metrics && metrics.length > 0

  return (
    <article
      className={`grid grid-cols-1 ${gridCols} gap-y-8 md:gap-y-0 md:gap-x-16 md:min-h-[612px]`}
    >
      {/* Visual panel — first in DOM so mobile shows visual above content */}
      <div
        className={[
          "min-h-[300px] md:min-h-0 overflow-hidden",
          imagePosition === "right" ? "md:order-2" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          ref={containerRef}
          role={ctaLocked ? "group" : undefined}
          aria-label={ctaLocked ? "Case study available on request" : undefined}
          className={`relative h-full w-full ${ctaLocked ? "cursor-not-allowed" : ""}`}
          onPointerEnter={handlePointerActive}
          onPointerMove={handlePointerActive}
          onPointerLeave={handlePointerLeave}
        >
          {mediaLink}
          {cursorLabelEl}
        </div>
      </div>

      {/* Content panel */}
      <div className="flex flex-col">
        <p className="font-mono text-[14px] font-normal tracking-[0.01em] text-ink leading-[1.4]">
          {eyebrow}
        </p>

        <h2 className="text-[36px] font-medium leading-[1.2] tracking-[-0.06em] text-ink mt-6">
          {title}
        </h2>

        <p className="text-[16px] leading-[1.4] tracking-[-0.02em] text-ink mt-6">
          {description}
        </p>

        {hasMetrics && (
          <div
            className="grid gap-6 mt-12"
            style={{ gridTemplateColumns: `repeat(${metrics!.length}, minmax(0, 1fr))` }}
          >
            {metrics!.map((m) => (
              <div key={m.label} className="flex flex-col gap-2">
                <p className="text-[36px] font-medium leading-[1.4] tracking-[-0.06em] text-ink">
                  {m.value}
                </p>
                <p className="text-[14px] leading-[1.4] text-ink-2">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {tagLine && (
          <p className={`text-[14px] leading-[1.4] text-ink-2 ${hasMetrics ? "mt-4" : "mt-12"}`}>
            {tagLine}
          </p>
        )}

      </div>
    </article>
  )
}
