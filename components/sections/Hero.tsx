"use client"

import { useEffect, useRef, useState } from "react"
import { assetPath } from "@/lib/paths"

type Anchor = "tl" | "tr" | "bl" | "br"
type FrameKey = "build" | "understand" | "test"

interface FrameRect {
  left: number
  top: number
  width: number
  height: number
}

interface FrameDef {
  key: FrameKey
  label: string
  anchor: Anchor
  passive: FrameRect
  active: FrameRect
}

// All composition geometry uses this fixed reference canvas. Its proportions match
// the visible frames and logo cluster at the current desktop size, after trimming
// the old wrapper's unused space. The responsive panel only scales this canvas.
const REFERENCE_CANVAS = { width: 1000, height: 848 } as const
const REFERENCE_DETAIL_SCALE = 1.4204
// Convert X travel back to the old percentage-point scale so inertial rotation stays unchanged.
const REFERENCE_UNITS_PER_OLD_X_PERCENT = 13.31

// Positions and sizes are pixels in REFERENCE_CANVAS coordinates.
// Each frame's passive/active pair keeps one anchor corner fixed —
// the frame grows away from that corner when active.
const FRAMES: FrameDef[] = [
  {
    key: "build",
    label: "Shape the solution",
    anchor: "br",
    passive: { left: 387.78, top: 292.02, width: 266.18, height: 230.08 },
    active: { left: 294.62, top: 70.79, width: 452.51, height: 530.94 },
  },
  {
    key: "understand",
    label: "Understand the problem",
    anchor: "bl",
    passive: { left: 41.74, top: 584.04, width: 292.8, height: 185.83 },
    active: { left: 41.74, top: 318.57, width: 519.06, height: 451.3 },
  },
  {
    key: "test",
    label: "Ship & learn",
    anchor: "br",
    passive: { left: 693.89, top: 115.04, width: 306.11, height: 176.98 },
    active: { left: 467.63, top: 0, width: 532.37, height: 442.45 },
  },
]

// Idle autoplay always returns to "build" between the other two.
const SEQUENCE: FrameKey[] = ["build", "understand", "build", "test"]

const FRAME_ANIM_MS = 800
const FRAME_HOLD_MS = 1800
const LEAVE_HOLD_MS = 1200
// Same source loop, three temporal-offset renders (0%, 1/3, 2/3 of the loop) — each is a
// full-length loop just rotated in time, so the three frames don't all start in sync.
const HERO_VIDEO_SRC: Record<FrameKey, string> = {
  understand: "/videos/hero-process-understand.mp4",
  build: "/videos/hero-process-build.mp4",
  test: "/videos/hero-process-test.mp4",
}

// Sub-labels revealed inside the active frame, stacked bottom-up above the main label.
const SUB_LABELS: Record<FrameKey, string[]> = {
  understand: ["research users", "map the domain", "find constraints", "frame the problem", "define success"],
  build: ["explore directions", "prototype fast", "test assumptions", "align the team", "make trade-offs"],
  test: ["work with engineers", "polish the details", "ship to users", "measure impact", "iterate"],
}

const SUB_LABEL_STAGGER_MS = 70
const SUB_LABEL_ANIM_MS = 220

// Anchors the label stack (main label + revealed sub-labels) to the frame's corner —
// the stack itself sits flush; individual rows are flush only via their own edge.
const ANCHOR_STYLE = (anchor: Anchor): React.CSSProperties => ({
  position: "absolute",
  ...(anchor[0] === "t" ? { top: 0 } : { bottom: 0 }),
  ...(anchor[1] === "l" ? { left: 0 } : { right: 0 }),
})

// Fine, technical dashed edge (4-gradient trick) — deliberately finer than
// the browser's default coarse `border-style: dashed` segments.
const DASH_BG = [
  "linear-gradient(to right, #000 50%, transparent 0%)",
  "linear-gradient(#000 50%, transparent 0%)",
  "linear-gradient(to right, #000 50%, transparent 0%)",
  "linear-gradient(#000 50%, transparent 0%)",
].join(", ")

interface Logo {
  key: string; src: string; alt: string
}

// All Hero logos render at the same layout box (see BASE_LOGO_SIZE below) — relevance
// weight is expressed purely through LOGO_SCALE_BY_STATE, not through varying intrinsic size.
const LOGOS: Logo[] = [
  { key: "figma",     src: "/logos/figma.svg",     alt: "Figma" },
  { key: "claude",    src: "/logos/claude.svg",    alt: "Claude" },
  { key: "gemini",    src: "/logos/gemini.svg",    alt: "Gemini" },
  { key: "codex",     src: "/logos/codex.svg",     alt: "Codex" },
  { key: "cursor",    src: "/logos/cursor.svg",    alt: "Cursor" },
  { key: "notion",    src: "/logos/notion.svg",    alt: "Notion" },
  { key: "copilot",   src: "/logos/copilot.svg",   alt: "Copilot" },
  { key: "amplitude", src: "/logos/amplitude.svg", alt: "Amplitude" },
  { key: "hex",       src: "/logos/hex.svg",       alt: "Hex" },
]

// Uniform layout box (px) for every floating Hero logo, before LOGO_SCALE_BY_STATE is applied.
const BASE_LOGO_SIZE = 62.5

// Hand-picked regions the logo cluster gathers around per activeKey (% of the Hero
// section, same coordinate space as LOGO_LAYOUTS below) — data only, never rendered.
// "build" == the "Shape the solution" frame, "test" == "Ship & learn".
const ATTRACTION_ZONES: Record<FrameKey, FrameRect> = {
  understand: { left: 12, top: 42, width: 40, height: 38 },
  build:      { left: 40, top: 24, width: 22, height: 16 },
  test:       { left: 58, top: 8,  width: 24, height: 14 },
}

interface LogoPos { x: number; y: number }

// Target position in reference-canvas pixels for every logo, per activeKey — this is the
// top-left corner of each logo's BASE_LOGO_SIZE box; LOGO_SCALE_BY_STATE then scales that
// box from its own center (transformOrigin: center center). Positions were solved by hand
// against each state's real scaled radii (BASE_LOGO_SIZE/2 * scale) so that circles
// circumscribing every logo clear both each other and that state's active label-stack
// rectangle (measured directly in the browser), while staying a dense, uneven cluster
// near the matching ATTRACTION_ZONE rather than a grid.
const LOGO_LAYOUTS: Record<FrameKey, Record<string, LogoPos>> = {
  understand: {
    amplitude: { x: 79.94, y: 705.45 },
    hex:       { x: 219.15, y: 705.45 },
    claude:    { x: 334.68, y: 705.45 },
    gemini:    { x: 47.6, y: 379.63 },
    notion:    { x: 15.12, y: 516.17 },
    codex:     { x: 133.97, y: 338.65 },
    figma:     { x: 209.44, y: 345.47 },
    cursor:    { x: 285.03, y: 352.28 },
    copilot:   { x: 409.07, y: 734.65 },
  },
  build: {
    figma:     { x: 436.09, y: 325.03 },
    claude:    { x: 549.49, y: 208.93 },
    gemini:    { x: 468.57, y: 502.54 },
    cursor:    { x: 317.37, y: 243.08 },
    codex:     { x: 339.07, y: 434.22 },
    copilot:   { x: 457.65, y: 161.14 },
    amplitude: { x: 263.47, y: 352.28 },
    hex:       { x: 392.97, y: 475.2 },
    notion:    { x: 641.32, y: 256.71 },
  },
  test: {
    cursor:    { x: 608.84, y: 270.43 },
    codex:     { x: 706, y: 140.61 },
    amplitude: { x: 649.84, y: 427.41 },
    figma:     { x: 490.13, y: 215.74 },
    claude:    { x: 522.47, y: 406.97 },
    hex:       { x: 743.8, y: 263.53 },
    gemini:    { x: 436.09, y: 325.03 },
    notion:    { x: 479.35, y: 488.91 },
    copilot:   { x: 857.06, y: 406.97 },
  },
}

// Per-logo transition timing, keyed by semantic key — small hand-picked variance
// (not an index-based stagger) so the cluster arrives as a loose group rather than
// in lockstep. Duration stays within ~720-1050ms, delay within ~0-140ms.
const LOGO_MOTION: Record<string, { dur: number; delay: number }> = {
  figma:     { dur: 780,  delay: 0 },
  claude:    { dur: 900,  delay: 60 },
  gemini:    { dur: 840,  delay: 25 },
  codex:     { dur: 1000, delay: 90 },
  cursor:    { dur: 750,  delay: 120 },
  notion:    { dur: 960,  delay: 45 },
  copilot:   { dur: 1050, delay: 105 },
  amplitude: { dur: 820,  delay: 15 },
  hex:       { dur: 900,  delay: 75 },
}

// Inertial rotation, layered on top of the existing left/top flight (no positional
// overshoot involved — left/top/scale go straight from their current value to the next
// target). Sign comes from the horizontal delta between a logo's previous and next
// LOGO_LAYOUTS target (right = clockwise, left = counter-clockwise); magnitude grows with
// that delta, capped well under a full tilt.
//
// The whole rotation lives INSIDE that logo's own flight window (delay -> delay+dur), so
// it never trails the arrival:
//   0%   - LOGO_ROTATION_WINDUP_FRAC   : 0deg -> flightAngle (lean into the movement)
//   LOGO_ROTATION_WINDUP_FRAC - LOGO_ROTATION_UNWIND_START_FRAC : holds at flightAngle
//   LOGO_ROTATION_UNWIND_START_FRAC - 100% : flightAngle -> 0deg (straighten out on approach)
// At 100% (== left/top's arrival), rotation is already back at 0 — no post-arrival kick.
const LOGO_FLIGHT_ANGLE_MIN = 6
const LOGO_FLIGHT_ANGLE_MAX = 12
const LOGO_ROTATION_WINDUP_FRAC = 0.3
const LOGO_ROTATION_UNWIND_START_FRAC = 0.6
type LogoRotationPhase = "flying" | "settled"

// Relevance-based scale per activeKey — redistributes visual weight toward the tools
// most relevant to that stage without restyling the cluster itself. Numeric values are
// nudged per-logo to compensate for each SVG's own visual mass (e.g. a solid square
// like hex reads "large" sooner than a thin outline like codex).
// EXPERIMENTAL wide range: one dominant tool per state (~3.0), a couple of runners-up,
// medium at 1.0, and a strongly de-emphasized tail (~0.5-0.7). Overlap at these sizes
// is expected and not yet addressed — this iteration is scale-only.
const LOGO_SCALE_BY_STATE: Record<FrameKey, Record<string, number>> = {
  understand: {
    amplitude: 3.0, hex: 2.5, claude: 2.0,
    gemini: 1.0, notion: 1.0,
    figma: 0.6, codex: 0.68, cursor: 0.52, copilot: 0.65,
  },
  build: {
    figma: 3.0, claude: 2.5, gemini: 2.0,
    cursor: 1.0, codex: 1.0, copilot: 1.0,
    amplitude: 0.6, hex: 0.52, notion: 0.65,
  },
  test: {
    cursor: 3.0, codex: 2.5, amplitude: 2.0,
    figma: 1.0, claude: 1.0, hex: 1.0,
    gemini: 0.68, notion: 0.65, copilot: 0.6,
  },
}

const TARGET_CELL = 104
const GRID_LINE = "rgba(0,0,0,0.08)"
const ABOUT_COLUMN_WIDTH = "30%"
// Matches the site background (body bg-[#e9e9e9] in app/layout.tsx) — frames need an
// opaque fill in this exact color so overlapping frames occlude what's beneath them.
const SITE_BG = "#e9e9e9"
const SHOW_HERO_STATEMENT = false

export function Hero() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState({ cell: TARGET_CELL, columns: 1, rows: 1 })
  const [compositionScale, setCompositionScale] = useState(0)
  const [rm, setRm] = useState(false)
  const [seqIdx, setSeqIdx] = useState(0)
  const [hoverKey, setHoverKey] = useState<FrameKey | null>(null)
  const leaveTimerRef = useRef<number | null>(null)
  const skipNextSettleResetRef = useRef(true)
  // Inertial rotation: `rotationPhase[key]` selects which angle a logo currently targets —
  // "flying" = flightAngle (windup/hold), "settled" = 0deg (unwind) — and `flightAngle[key]`
  // is the signed angle picked for the flight currently in progress (or just completed).
  const [rotationPhase, setRotationPhase] = useState<Record<string, LogoRotationPhase>>(
    () => Object.fromEntries(LOGOS.map(l => [l.key, "settled"]))
  )
  const [flightAngle, setFlightAngle] = useState<Record<string, number>>(
    () => Object.fromEntries(LOGOS.map(l => [l.key, 0]))
  )
  // Fires partway through a logo's own flight (LOGO_ROTATION_UNWIND_START_FRAC) to switch
  // its rotation target back to 0deg, so it straightens out before left/top even arrives.
  const unwindTimersRef = useRef<Record<string, number>>({})
  // Last target position handed to each logo — only used to sign/scale the next flight's
  // rotation from (previous target -> next target), never the logo's live on-screen spot.
  const prevLogoPosRef = useRef<Record<string, LogoPos>>(
    Object.fromEntries(LOGOS.map(l => [l.key, LOGO_LAYOUTS[SEQUENCE[0]][l.key]]))
  )

  // Reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setRm(mq.matches)
    const h = (e: MediaQueryListEvent) => setRm(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  // Grid dimensions follow the real canvas; the composition gets a separate uniform fit.
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width <= 0 || height <= 0) return
      const candidates: Array<{
        cell: number
        columns: number
        rows: number
        score: number
      }> = []
      const addCandidate = (cell: number, columns: number, rows: number) => {
        if (columns < 1 || rows < 1 || cell < TARGET_CELL * 0.75 || cell > TARGET_CELL * 1.25) return
        const unused = 1 - (columns * rows * cell * cell) / (width * height)
        const sizeDelta = Math.abs(cell - TARGET_CELL) / TARGET_CELL
        candidates.push({ cell, columns, rows, score: unused + sizeDelta * 0.35 })
      }

      const nearColumns = Math.round(width / TARGET_CELL)
      for (let columns = Math.max(1, nearColumns - 2); columns <= nearColumns + 2; columns++) {
        const cell = width / columns
        addCandidate(cell, columns, Math.floor(height / cell))
      }

      const nearRows = Math.round(height / TARGET_CELL)
      for (let rows = Math.max(1, nearRows - 2); rows <= nearRows + 2; rows++) {
        const cell = height / rows
        addCandidate(cell, Math.floor(width / cell), rows)
      }

      const best = candidates.sort((a, b) => a.score - b.score)[0]
      if (best) setGrid({ cell: best.cell, columns: best.columns, rows: best.rows })

      const safeWidth = width - 48
      const safeHeight = height - 48
      if (safeWidth <= 0 || safeHeight <= 0) return
      setCompositionScale(Math.min(
        safeWidth / REFERENCE_CANVAS.width,
        safeHeight / REFERENCE_CANVAS.height,
      ))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Idle autoplay — paused whenever a frame is hovered
  useEffect(() => {
    if (rm || hoverKey !== null) return
    const id = setInterval(() => {
      setSeqIdx(i => (i + 1) % SEQUENCE.length)
    }, FRAME_HOLD_MS)
    return () => clearInterval(id)
  }, [rm, hoverKey])

  // Clear any pending "resume autoplay" timer on unmount
  useEffect(() => () => {
    if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current)
  }, [])

  // Whenever the active target changes (hover or autoplay), every logo re-enters the
  // "flying" rotation phase — tilted toward flightAngle, signed by the horizontal delta
  // between its previous and next LOGO_LAYOUTS target (left/top/scale just transition
  // straight from their current value to that target, no separate positional phase).
  // Each logo's own timer then flips its rotation to "settled" (0deg) partway through
  // that same flight (LOGO_ROTATION_UNWIND_START_FRAC), so the unwind finishes exactly
  // when left/top arrives — never after. Skipped on mount (nothing to rotate away from)
  // and entirely under reduced motion.
  useEffect(() => {
    if (skipNextSettleResetRef.current) {
      skipNextSettleResetRef.current = false
      return
    }
    if (rm) return
    const nextKey = hoverKey ?? SEQUENCE[seqIdx]
    const nextAngles: Record<string, number> = {}
    LOGOS.forEach(logo => {
      const nextPos = LOGO_LAYOUTS[nextKey][logo.key]
      const deltaX = (nextPos.x - prevLogoPosRef.current[logo.key].x) / REFERENCE_UNITS_PER_OLD_X_PERCENT
      const dir = Math.sign(deltaX)
      const mag = dir === 0 ? 0 : Math.min(LOGO_FLIGHT_ANGLE_MAX, LOGO_FLIGHT_ANGLE_MIN + Math.abs(deltaX) / 5)
      nextAngles[logo.key] = dir * mag
      prevLogoPosRef.current[logo.key] = nextPos
    })

    Object.values(unwindTimersRef.current).forEach(id => window.clearTimeout(id))
    setFlightAngle(nextAngles)
    setRotationPhase(Object.fromEntries(LOGOS.map(l => [l.key, "flying"])))

    LOGOS.forEach(logo => {
      const { dur, delay } = LOGO_MOTION[logo.key]
      unwindTimersRef.current[logo.key] = window.setTimeout(() => {
        setRotationPhase(prev => ({ ...prev, [logo.key]: "settled" }))
      }, delay + dur * LOGO_ROTATION_UNWIND_START_FRAC)
    })
    return () => {
      Object.values(unwindTimersRef.current).forEach(id => window.clearTimeout(id))
    }
  }, [hoverKey, seqIdx, rm])

  const handleFrameEnter = (key: FrameKey) => {
    if (leaveTimerRef.current) {
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

  const activeKey = hoverKey ?? SEQUENCE[seqIdx]
  const refUnit = (value: number) => value * compositionScale
  const ease = `cubic-bezier(0.37, 0, 0.63, 1)`
  const geomT = rm ? "none" : `left ${FRAME_ANIM_MS}ms ${ease}, top ${FRAME_ANIM_MS}ms ${ease}, width ${FRAME_ANIM_MS}ms ${ease}, height ${FRAME_ANIM_MS}ms ${ease}`
  const labelT = rm ? "none" : `background-color ${FRAME_ANIM_MS}ms ${ease}, color ${FRAME_ANIM_MS}ms ${ease}`
  // Per-logo transition string — same easing for all, duration/delay vary by LOGO_MOTION.
  // `left`/`top`/`scale` go straight from their current value to the next target on that
  // timing. `rotate` instead runs two short legs INSIDE that same flight window: while
  // "flying" it targets flightAngle over the windup fraction (starting at the same delay
  // as left/top); once the unwind timer fires (see the effect above), it targets 0 over
  // whatever's left of the flight, landing on 0deg exactly when left/top arrives.
  // `rotate`/`scale` are independent CSS properties (not the `transform` shorthand) so
  // rotation can run on its own clock.
  const logoT = (key: string) => {
    if (rm) return "none"
    const { dur, delay } = LOGO_MOTION[key]
    const phase = rotationPhase[key]
    const [rotMs, rotDelay] =
      phase === "flying"
        ? [dur * LOGO_ROTATION_WINDUP_FRAC, delay]
        : [dur * (1 - LOGO_ROTATION_UNWIND_START_FRAC), 0]
    return [
      `left ${dur}ms ${ease} ${delay}ms`,
      `top ${dur}ms ${ease} ${delay}ms`,
      `scale ${dur}ms ${ease} ${delay}ms`,
      `rotate ${rotMs}ms ${ease} ${rotDelay}ms`,
    ].join(", ")
  }

  return (
    <section
      className="relative min-h-[80svh] md:min-h-0 md:h-[calc(100dvh-56px)] md:grid md:grid-cols-[minmax(220px,var(--about-column-width))_1px_minmax(0,1fr)]"
      style={{
        "--about-column-width": ABOUT_COLUMN_WIDTH,
        borderRight: `1px solid ${GRID_LINE}`,
        borderBottom: `1px solid ${GRID_LINE}`,
      } as React.CSSProperties}
    >
      {/* Desktop About column */}
      <div
        className="hidden md:flex min-w-0 flex-col justify-center gap-5 px-6 lg:px-8"
        style={{ backgroundColor: SITE_BG, zIndex: 1 }}
      >
        <div className="space-y-1">
          <h1 className="text-[30px] lg:text-[34px] font-medium leading-[1.1] tracking-[-0.05em] text-ink text-balance">
            Andrei Stseburaka
          </h1>
          <p className="text-[16px] leading-[1.4] tracking-[-0.02em] text-ink-2">
            Senior Product Designer
          </p>
        </div>
        <p className="max-w-[360px] text-[18px] leading-[1.45] tracking-[-0.025em] text-ink">
          11+ years designing B2B software across fintech, SaaS, and AI.
          <br />
          Red Dot Award winner.
        </p>
      </div>

      <div aria-hidden="true" className="hidden md:block" style={{ backgroundColor: GRID_LINE }} />

      {/* Hero canvas: grid fills this area; the composition stays 24px inside it. */}
      <div ref={canvasRef} className="hidden md:block relative min-w-0 bg-[#e9e9e9]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: grid.columns * grid.cell,
              height: grid.rows * grid.cell,
              backgroundImage: [
                `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px)`,
                `linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
              ].join(", "),
              backgroundSize: `${grid.cell}px ${grid.cell}px`,
            }}
          />
        </div>

        <div className="absolute inset-6" onMouseLeave={handleCompositionLeave}>
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: refUnit(REFERENCE_CANVAS.width),
              height: refUnit(REFERENCE_CANVAS.height),
              transform: "translate(-50%, -50%)",
            }}
          >
        <div aria-label="Design process" className="absolute inset-0">
        {FRAMES.map((frame) => {
          const isActive = activeKey === frame.key
          const rect = isActive ? frame.active : frame.passive
          // Fixed stacking order (not tied to active state): side frames always
          // sit above the center frame at their overlaps.
          const stackZ = frame.key === "build" ? 1 : 2
          return (
            <div
              key={frame.key}
              onMouseEnter={() => handleFrameEnter(frame.key)}
              style={{
                position: "absolute",
                left: refUnit(rect.left),
                top: refUnit(rect.top),
                width: refUnit(rect.width),
                height: refUnit(rect.height),
                boxSizing: "border-box",
                overflow: "hidden",
                backgroundColor: SITE_BG,
                border: isActive ? `${refUnit(REFERENCE_DETAIL_SCALE)}px solid #000` : `${refUnit(REFERENCE_DETAIL_SCALE)}px solid transparent`,
                backgroundImage: isActive ? "none" : DASH_BG,
                backgroundPosition: "top, right, bottom, left",
                backgroundSize: `${refUnit(4 * REFERENCE_DETAIL_SCALE)}px ${refUnit(REFERENCE_DETAIL_SCALE)}px, ${refUnit(REFERENCE_DETAIL_SCALE)}px ${refUnit(4 * REFERENCE_DETAIL_SCALE)}px, ${refUnit(4 * REFERENCE_DETAIL_SCALE)}px ${refUnit(REFERENCE_DETAIL_SCALE)}px, ${refUnit(REFERENCE_DETAIL_SCALE)}px ${refUnit(4 * REFERENCE_DETAIL_SCALE)}px`,
                backgroundRepeat: "repeat-x, repeat-y, repeat-x, repeat-y",
                zIndex: stackZ,
                transition: geomT,
              }}
            >
              {/* Video is the active frame's own local background layer — mounted directly
                  off `isActive`, so it's visible from the very start of this frame's own
                  expansion (remounts per activation; continuous playback across frames
                  isn't required). Sits before the label stack in DOM order so labels always
                  paint on top, and inset:0 keeps it within the frame's own border (never
                  drawn over it). */}
              {isActive && (
                <video
                  src={assetPath(HERO_VIDEO_SRC[frame.key])}
                  autoPlay
                  loop
                  muted
                  playsInline
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
                  ...ANCHOR_STYLE(frame.anchor),
                  display: "flex",
                  flexDirection: frame.anchor[0] === "t" ? "column" : "column-reverse",
                  alignItems: frame.anchor[1] === "l" ? "flex-start" : "flex-end",
                  gap: 0,
                  maxWidth: "92%",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono, monospace)",
                    fontSize: refUnit(11 * REFERENCE_DETAIL_SCALE),
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    padding: `${refUnit(3 * REFERENCE_DETAIL_SCALE)}px ${refUnit(7 * REFERENCE_DETAIL_SCALE)}px`,
                    background: isActive ? "#000" : "transparent",
                    color: isActive ? "#fff" : "#000",
                    whiteSpace: "nowrap",
                    width: "max-content",
                    lineHeight: 1.4,
                    userSelect: "none",
                    transition: labelT,
                  }}
                >
                  {frame.label}
                </div>
                {isActive && SUB_LABELS[frame.key].map((text, i) => (
                  <div
                    key={text}
                    style={{
                      fontFamily: "var(--font-ibm-plex-mono, monospace)",
                      fontSize: refUnit(11 * REFERENCE_DETAIL_SCALE),
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      padding: `${refUnit(3 * REFERENCE_DETAIL_SCALE)}px ${refUnit(7 * REFERENCE_DETAIL_SCALE)}px`,
                      background: "#000",
                      color: "#fff",
                      whiteSpace: "nowrap",
                      width: "max-content",
                      lineHeight: 1.4,
                      userSelect: "none",
                      animation: rm ? "none" : `hero-sublabel-in ${SUB_LABEL_ANIM_MS}ms ease-out both`,
                      animationDelay: rm ? "0ms" : `${SUB_LABEL_STAGGER_MS + i * SUB_LABEL_STAGGER_MS}ms`,
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

        {SHOW_HERO_STATEMENT && (
          <h2
            className="absolute text-[72px] font-medium leading-none tracking-[-0.06em] text-ink text-right text-balance"
            style={{
              maxWidth: refUnit(720 * REFERENCE_DETAIL_SCALE),
              right: refUnit(16 * REFERENCE_DETAIL_SCALE),
              bottom: refUnit(16 * REFERENCE_DETAIL_SCALE),
              fontSize: refUnit(72 * REFERENCE_DETAIL_SCALE),
              zIndex: 3,
            }}
          >
            I design and ship complex products
          </h2>
        )}

      {/* Layer 4 — floating tool logos (desktop only). Each logo's left/top targets
          LOGO_LAYOUTS[activeKey] and transitions there directly per-logo (see LOGO_MOTION)
          so the cluster doesn't arrive in lockstep — no positional overshoot, straight from
          current position to target. Scale (LOGO_SCALE_BY_STATE) rides the same timing to
          shift visual weight toward whichever tools are relevant to the active stage.
          Rotation adds a sense of inertia on top, but stays inside that same flight window:
          it tilts toward flightAngle over the first LOGO_ROTATION_WINDUP_FRAC, holds, then
          unwinds back to 0 over the last stretch (LOGO_ROTATION_UNWIND_START_FRAC onward) —
          so it's already upright by the time left/top arrives, no post-arrival correction.
          See the effect above for the timer that flips the unwind. `rotate`/`scale` are set
          as their own CSS properties (not the `transform` shorthand) so rotation can run on
          its own clock, independent of left/top/scale's timing. The old idle drift
          (.hero-logo) is intentionally not applied so it can't fight this. */}
        {LOGOS.map((logo) => {
        const pos = LOGO_LAYOUTS[activeKey][logo.key]
        const scale = LOGO_SCALE_BY_STATE[activeKey][logo.key]
        const phase = rm ? "settled" : rotationPhase[logo.key]
        const angle = phase === "flying" ? flightAngle[logo.key] : 0
        return (
          <img
            key={logo.key}
            src={assetPath(logo.src)}
            alt=""
            role="presentation"
            width={BASE_LOGO_SIZE}
            height={BASE_LOGO_SIZE}
            className="hidden md:block absolute pointer-events-none"
            style={{
              left: refUnit(pos.x),
              top: refUnit(pos.y),
              width: refUnit(BASE_LOGO_SIZE),
              height: refUnit(BASE_LOGO_SIZE),
              objectFit: "contain",
              zIndex: 4,
              rotate: `${angle}deg`,
              scale: `${scale}`,
              transformOrigin: "center center",
              transition: logoT(logo.key),
            } as React.CSSProperties}
          />
        )
        })}
          </div>
      </div>
      </div>

      {/* Mobile layout — simple stack */}
      <div className="md:hidden flex flex-col gap-5 px-5 py-10 relative" style={{ zIndex: 10 }}>
        <div className="space-y-1">
          <h1 className="text-[32px] font-medium leading-[1.1] tracking-[-0.05em] text-ink">
            Andrei Stseburaka
          </h1>
          <p className="text-[16px] leading-[1.4] tracking-[-0.02em] text-ink-2">
            Senior Product Designer
          </p>
        </div>
        <p className="max-w-[423px] text-[18px] leading-[1.45] tracking-[-0.025em] text-ink">
          11+ years designing B2B software across fintech, SaaS, and AI.
          <br />
          Red Dot Award winner.
        </p>
      </div>
    </section>
  )
}
