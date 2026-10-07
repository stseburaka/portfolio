"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
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

// Keep the old idle rhythm: Shape → Understand → Shape → Ship.
const SEQUENCE: StageKey[] = ["shape", "understand", "shape", "ship"]
const FRAME_ANIM_MS = 800
const FRAME_HOLD_MS = 1800
const LEAVE_HOLD_MS = 1200
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
  if (columns < 4 || rows < 4) return null

  const passiveColSpan = Math.min(3, Math.max(2, Math.floor(columns / 3)))
  const passiveRowSpan = Math.min(2, rows - 1)
  const activeRowSpan = Math.min(4, rows - 2)
  const middlePassiveColumn = Math.floor((columns - passiveColSpan) / 2)
  const middlePassiveRow = Math.floor((rows - passiveRowSpan) / 2)
  const middleActiveColumn = Math.floor((columns - Math.min(columns - 2, activeRowSpan * 1.05)) / 2)
  const middleActiveRow = Math.floor((rows - activeRowSpan) / 2)

  const passiveRects: Record<StageKey, GridRect> = {
    understand: { column: 0, row: rows - passiveRowSpan, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
    shape: { column: middlePassiveColumn, row: middlePassiveRow, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
    ship: { column: columns - passiveColSpan, row: 0, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
  }

  const activeRects = Object.fromEntries(STAGES.map((stage) => {
    const baseColSpan = Math.min(columns - 2, Math.max(2, Math.round(activeRowSpan * stage.aspect)))
    const colSpan = stage.key === "shape" ? Math.min(columns, baseColSpan + 2) : baseColSpan
    const row = stage.key === "understand"
      ? rows - activeRowSpan
      : stage.key === "ship"
        ? 0
        : middleActiveRow
    const column = stage.key === "understand"
      ? 0
      : stage.key === "ship"
        ? columns - colSpan
        : Math.floor((columns - colSpan) / 2)

    return [stage.key, { column, row, colSpan, rowSpan: activeRowSpan }]
  })) as Record<StageKey, GridRect>

  return { passiveRects, activeRects }
}

function getMobileStageRects(columns: number, rows: number) {
  if (columns < 4 || rows < 4) return null

  const passiveColSpan = Math.min(3, Math.max(2, Math.floor(columns / 3)))
  const passiveRowSpan = 1
  const activeRowSpan = Math.min(4, rows - 2)
  const middlePassiveColumn = Math.floor((columns - passiveColSpan) / 2)
  const middlePassiveRow = Math.floor((rows - passiveRowSpan) / 2)
  const middleActiveRow = Math.floor((rows - activeRowSpan) / 2)

  const passiveRects: Record<StageKey, GridRect> = {
    ship: { column: columns - passiveColSpan, row: 0, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
    shape: { column: middlePassiveColumn, row: middlePassiveRow, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
    understand: { column: 0, row: rows - passiveRowSpan, colSpan: passiveColSpan, rowSpan: passiveRowSpan },
  }

  const activeRects = Object.fromEntries(STAGES.map((stage) => {
    const baseColSpan = Math.min(columns - 2, Math.max(2, Math.round(activeRowSpan * stage.aspect)))
    const colSpan = stage.key === "shape" ? Math.min(columns, baseColSpan + 2) : baseColSpan
    const row = stage.key === "understand"
      ? rows - activeRowSpan
      : stage.key === "ship"
        ? 0
        : middleActiveRow
    const column = stage.key === "understand"
      ? 0
      : stage.key === "ship"
        ? columns - colSpan
        : Math.floor((columns - colSpan) / 2)

    return [stage.key, { column, row, colSpan, rowSpan: activeRowSpan }]
  })) as Record<StageKey, GridRect>

  return { passiveRects, activeRects }
}

interface PlaygroundFramesProps {
  cell: number
  columns: number
  rows: number
}

export function PlaygroundFrames({ cell, columns, rows }: PlaygroundFramesProps) {
  const [sequenceIndex, setSequenceIndex] = useState(0)
  const [hoverKey, setHoverKey] = useState<StageKey | null>(null)
  const leaveTimerRef = useRef<number | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  )

  useEffect(() => {
    if (reducedMotion || hoverKey !== null) return
    const timer = window.setInterval(() => {
      setSequenceIndex((index) => (index + 1) % SEQUENCE.length)
    }, FRAME_HOLD_MS)
    return () => window.clearInterval(timer)
  }, [hoverKey, reducedMotion])

  useEffect(() => () => {
    if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current)
  }, [])

  const activeKey = hoverKey ?? SEQUENCE[sequenceIndex]
  const rects = columns <= 5
    ? getMobileStageRects(columns, rows)
    : getStageRects(columns, rows)
  if (!rects) return null

  const handleFrameEnter = (key: StageKey) => {
    if (leaveTimerRef.current !== null) {
      window.clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setHoverKey(key)
  }

  const handleCompositionLeave = () => {
    leaveTimerRef.current = window.setTimeout(() => {
      setHoverKey(null)
      leaveTimerRef.current = null
    }, LEAVE_HOLD_MS)
  }

  const labelFontSize = Math.max(9, Math.min(14, cell * 0.125))
  const labelPadding = `${Math.max(2, cell * 0.03)}px ${Math.max(5, cell * 0.07)}px`
  const geometryTransition = reducedMotion
    ? "none"
    : `left ${FRAME_ANIM_MS}ms ${EASE}, top ${FRAME_ANIM_MS}ms ${EASE}, width ${FRAME_ANIM_MS}ms ${EASE}, height ${FRAME_ANIM_MS}ms ${EASE}`

  return (
    <div
      role="group"
      aria-label="Design process"
      className="absolute inset-0 block"
      onMouseLeave={handleCompositionLeave}
      style={{ pointerEvents: "none", zIndex: 1 }}
    >
      {STAGES.map((stage) => {
        const isActive = activeKey === stage.key
        const rect = isActive ? rects.activeRects[stage.key] : rects.passiveRects[stage.key]
        const frameWidth = rect.colSpan * cell
        const maxLabelWidth = frameWidth - Number.parseFloat(labelPadding.split(" ")[1])

        return (
          <div
            key={stage.key}
            onMouseEnter={() => handleFrameEnter(stage.key)}
            style={{
              position: "absolute",
              left: rect.column * cell,
              top: rect.row * cell,
              width: frameWidth,
              height: rect.rowSpan * cell,
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
