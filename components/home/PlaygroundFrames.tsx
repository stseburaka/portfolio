"use client"

import { useState, useSyncExternalStore } from "react"
import { assetPath } from "@/lib/paths"

type StageKey = "understand" | "shape" | "ship"
type FrameAnchor = "bottom-left" | "bottom-right"

interface GridRect {
  column: number
  row: number
  colSpan: number
  rowSpan: number
}

interface Stage {
  key: StageKey
  label: string
  video: string
  anchor: FrameAnchor
  aspect: number
  subLabels: string[]
}

const STAGES: Stage[] = [
  {
    key: "understand",
    label: "Understand the problem",
    video: "/videos/hero-process-understand.mp4",
    anchor: "bottom-left",
    aspect: 1.15,
    subLabels: ["research users", "map the domain", "find constraints", "frame the problem", "define success"],
  },
  {
    key: "shape",
    label: "Shape the solution",
    video: "/videos/hero-process-build.mp4",
    anchor: "bottom-right",
    aspect: 0.85,
    subLabels: ["explore directions", "prototype fast", "test assumptions", "align the team", "make trade-offs"],
  },
  {
    key: "ship",
    label: "Ship & learn",
    video: "/videos/hero-process-test.mp4",
    anchor: "bottom-right",
    aspect: 1.2,
    subLabels: ["work with engineers", "polish the details", "ship to users", "measure impact", "iterate"],
  },
]

const FRAME_ANIM_MS = 800
const SUB_LABEL_STAGGER_MS = 70
const SUB_LABEL_ANIM_MS = 220
const EASE = "cubic-bezier(0.37, 0, 0.63, 1)"
const SITE_BG = "#e9e9e9"
const DASH_BG = [
  "linear-gradient(to right, #000 50%, transparent 0%)",
  "linear-gradient(#000 50%, transparent 0%)",
  "linear-gradient(to right, #000 50%, transparent 0%)",
  "linear-gradient(#000 50%, transparent 0%)",
].join(", ")

const subscribeToReducedMotion = (callback: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

const getReducedMotionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

function getStageRects(columns: number, rows: number) {
  if (columns < 6 || rows < 6) return null

  const compositionColumns = columns - 2
  const compositionRows = rows - 2

  const passiveColSpan = Math.min(3, Math.max(2, Math.floor(compositionColumns / 3)))
  const passiveRowSpan = Math.min(2, compositionRows - 1)
  const activeRowSpan = Math.min(4, compositionRows - 2)
  const middlePassiveColumn = Math.floor((compositionColumns - passiveColSpan) / 2)
  const middlePassiveRow = Math.floor((compositionRows - passiveRowSpan) / 2)
  const middleActiveColumn = Math.floor((compositionColumns - Math.min(compositionColumns - 2, activeRowSpan * 1.05)) / 2)
  const middleActiveRow = Math.floor((compositionRows - activeRowSpan) / 2)

  const passiveRects: Record<StageKey, GridRect> = {
    understand: { column: 1, row: compositionRows - passiveRowSpan + 1, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
    shape: { column: middlePassiveColumn + 1, row: middlePassiveRow + 1, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
    ship: { column: compositionColumns - passiveColSpan + 1, row: 1, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
  }

  const activeRects = Object.fromEntries(STAGES.map((stage) => {
    const baseColSpan = Math.min(compositionColumns - 2, Math.max(2, Math.round(activeRowSpan * stage.aspect)))
    const colSpan = stage.key === "shape" ? Math.min(compositionColumns, baseColSpan + 2) : baseColSpan
    const row = stage.key === "understand"
      ? compositionRows - activeRowSpan
      : stage.key === "ship"
        ? 0
        : middleActiveRow
    const column = stage.key === "understand"
      ? 0
      : stage.key === "ship"
        ? compositionColumns - colSpan
        : Math.floor((compositionColumns - colSpan) / 2)

    if (stage.key === "shape") {
      const left = Math.max(0, column - 2)
      const right = Math.min(compositionColumns, column + colSpan + 2)
      const bottom = Math.min(compositionRows, middleActiveRow + activeRowSpan + 1)

      return [stage.key, {
        column: left + 2,
        row: middleActiveRow + 1,
        colSpan: right - left - 2,
        rowSpan: bottom - middleActiveRow,
      }]
    }

    return [stage.key, { column: column + 1, row: row + 1, colSpan, rowSpan: activeRowSpan }]
  })) as Record<StageKey, GridRect>

  return { passiveRects, activeRects }
}

interface PlaygroundFramesProps {
  cellWidth: number
  cellHeight: number
  columns: number
  rows: number
}

export function PlaygroundFrames({ cellWidth, cellHeight, columns, rows }: PlaygroundFramesProps) {
  const [hoverKey, setHoverKey] = useState<StageKey | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  )

  const activeKey = hoverKey ?? "shape"
  const rects = getStageRects(columns, rows)
  if (!rects) return null

  const handleFrameEnter = (key: StageKey) => {
    setHoverKey(key)
  }

  const handleCompositionLeave = () => {
    setHoverKey(null)
  }

  const labelFontSize = Math.max(9, Math.min(14, cellHeight * 0.125))
  const horizontalLabelPadding = Math.max(5, cellWidth * 0.07)
  const labelPadding = `${Math.max(2, cellHeight * 0.03)}px ${horizontalLabelPadding}px`
  const geometryTransition = reducedMotion
    ? "none"
    : `left ${FRAME_ANIM_MS}ms ${EASE}, top ${FRAME_ANIM_MS}ms ${EASE}, width ${FRAME_ANIM_MS}ms ${EASE}, height ${FRAME_ANIM_MS}ms ${EASE}`

  return (
    <div
      role="group"
      aria-label="Design process"
      className="absolute inset-0 block"
      onMouseLeave={handleCompositionLeave}
      style={{ pointerEvents: "none", zIndex: 2 }}
    >
      {STAGES.map((stage) => {
        const isActive = activeKey === stage.key
        const rect = isActive ? rects.activeRects[stage.key] : rects.passiveRects[stage.key]
        const frameWidth = rect.colSpan * cellWidth
        const maxLabelWidth = frameWidth - horizontalLabelPadding

        return (
          <div
            key={stage.key}
            onMouseEnter={() => handleFrameEnter(stage.key)}
            onMouseLeave={() => setHoverKey((current) => current === stage.key ? null : current)}
            style={{
              position: "absolute",
              left: rect.column * cellWidth,
              top: rect.row * cellHeight,
              width: frameWidth,
              height: rect.rowSpan * cellHeight,
              boxSizing: "border-box",
              overflow: "hidden",
              backgroundColor: SITE_BG,
              border: isActive ? "1px solid #000" : "1px solid transparent",
              backgroundImage: isActive ? "none" : DASH_BG,
              backgroundPosition: "top, right, bottom, left",
              backgroundSize: "4px 1px, 1px 4px, 4px 1px, 1px 4px",
              backgroundRepeat: "repeat-x, repeat-y, repeat-x, repeat-y",
              zIndex: isActive ? 3 : stage.key === "shape" ? 1 : 2,
              transition: geometryTransition,
              pointerEvents: "auto",
            }}
          >
            {isActive && (
              <video
                key={stage.key}
                src={assetPath(stage.video)}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}

            <div
              style={{
                position: "absolute",
                bottom: 0,
                ...(stage.anchor === "bottom-left" ? { left: 0 } : { right: 0 }),
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: stage.anchor === "bottom-left" ? "flex-start" : "flex-end",
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  maxWidth: "100%",
                  fontFamily: "var(--font-ibm-plex-mono, monospace)",
                  fontSize: labelFontSize,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  padding: labelPadding,
                  background: isActive ? "#000" : "transparent",
                  color: isActive ? "#fff" : "#000",
                  whiteSpace: "nowrap",
                  width: "max-content",
                  lineHeight: 1.4,
                  userSelect: "none",
                  transition: reducedMotion ? "none" : `background-color ${FRAME_ANIM_MS}ms ${EASE}, color ${FRAME_ANIM_MS}ms ${EASE}`,
                }}
              >
                {stage.label}
              </div>
              {isActive && stage.subLabels.map((text, index) => (
                <div
                  key={text}
                  style={{
                    maxWidth: "100%",
                    fontFamily: "var(--font-ibm-plex-mono, monospace)",
                    fontSize: labelFontSize,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    padding: labelPadding,
                    background: "#000",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    width: "max-content",
                    lineHeight: 1.4,
                    userSelect: "none",
                    animation: reducedMotion ? "none" : `hero-sublabel-in ${SUB_LABEL_ANIM_MS}ms ease-out both`,
                    animationDelay: reducedMotion ? "0ms" : `${SUB_LABEL_STAGGER_MS + index * SUB_LABEL_STAGGER_MS}ms`,
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
