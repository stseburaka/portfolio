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

// Positions are % of the composition container (see inset below).
// Each frame's passive/active pair keeps one anchor corner fixed —
// the frame grows away from that corner when active.
const FRAMES: FrameDef[] = [
  {
    key: "build",
    label: "Shape the solution",
    anchor: "br",
    passive: { left: 40, top: 26, width: 20, height: 26 },
    active: { left: 33, top: 1, width: 34, height: 60 },
  },
  {
    key: "understand",
    label: "Understand the problem",
    anchor: "bl",
    passive: { left: 14, top: 59, width: 22, height: 21 },
    active: { left: 14, top: 29, width: 39, height: 51 },
  },
  {
    key: "test",
    label: "Ship & learn",
    anchor: "br",
    passive: { left: 63, top: 6, width: 23, height: 20 },
    active: { left: 46, top: -7, width: 40, height: 50 },
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
const BASE_LOGO_SIZE = 44

// Hand-picked regions the logo cluster gathers around per activeKey (% of the Hero
// section, same coordinate space as LOGO_LAYOUTS below) — data only, never rendered.
// "build" == the "Shape the solution" frame, "test" == "Ship & learn".
const ATTRACTION_ZONES: Record<FrameKey, FrameRect> = {
  understand: { left: 12, top: 42, width: 40, height: 38 },
  build:      { left: 40, top: 24, width: 22, height: 16 },
  test:       { left: 58, top: 8,  width: 24, height: 14 },
}

interface LogoPos { x: number; y: number }

// Target position (% of the Hero section) for every logo, per activeKey — this is the
// top-left corner of each logo's BASE_LOGO_SIZE box; LOGO_SCALE_BY_STATE then scales that
// box from its own center (transformOrigin: center center). Positions were solved by hand
// against each state's real scaled radii (BASE_LOGO_SIZE/2 * scale) so that circles
// circumscribing every logo clear both each other and that state's active label-stack
// rectangle (measured directly in the browser), while staying a dense, uneven cluster
// near the matching ATTRACTION_ZONE rather than a grid.
const LOGO_LAYOUTS: Record<FrameKey, Record<string, LogoPos>> = {
  understand: {
    amplitude: { x: 16.87, y: 79.72 },
    hex:       { x: 27.33, y: 79.72 },
    claude:    { x: 36.01, y: 79.72 },
    gemini:    { x: 14.44, y: 42.90 },
    notion:    { x: 12.00, y: 58.33 },
    codex:     { x: 20.93, y: 38.27 },
    figma:     { x: 26.60, y: 39.04 },
    cursor:    { x: 32.28, y: 39.81 },
    copilot:   { x: 41.60, y: 83.02 },
  },
  build: {
    figma:     { x: 43.63, y: 36.73 },
    claude:    { x: 52.15, y: 23.61 },
    gemini:    { x: 46.07, y: 56.79 },
    cursor:    { x: 34.71, y: 27.47 },
    codex:     { x: 36.34, y: 49.07 },
    copilot:   { x: 45.25, y: 18.21 },
    amplitude: { x: 30.66, y: 39.81 },
    hex:       { x: 40.39, y: 53.70 },
    notion:    { x: 59.05, y: 29.01 },
  },
  test: {
    cursor:    { x: 56.61, y: 30.56 },
    codex:     { x: 63.91, y: 15.89 },
    amplitude: { x: 59.69, y: 48.30 },
    figma:     { x: 47.69, y: 24.38 },
    claude:    { x: 50.12, y: 45.99 },
    hex:       { x: 66.75, y: 29.78 },
    gemini:    { x: 43.63, y: 36.73 },
    notion:    { x: 46.88, y: 55.25 },
    copilot:   { x: 75.26, y: 45.99 },
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
// Matches the site background (body bg-[#e9e9e9] in app/layout.tsx) — frames need an
// opaque fill in this exact color so overlapping frames occlude what's beneath them.
const SITE_BG = "#e9e9e9"

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [gridCell, setGridCell] = useState({ w: TARGET_CELL, h: TARGET_CELL })
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

  // Background grid cell size
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const cols = Math.round(width / TARGET_CELL)
      const rows = Math.round(height / TARGET_CELL)
      if (cols > 0 && rows > 0) setGridCell({ w: width / cols, h: height / rows })
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
      const deltaX = nextPos.x - prevLogoPosRef.current[logo.key].x
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
      ref={sectionRef}
      className="relative overflow-hidden mt-4 min-h-[80svh] md:min-h-0 md:h-[calc(100dvh-72px)]"
      style={{ borderRight: `1px solid ${GRID_LINE}`, borderBottom: `1px solid ${GRID_LINE}` }}
    >

      {/* Layer 1 — static background grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
          ].join(", "),
          backgroundSize: `${gridCell.w}px ${gridCell.h}px`,
          zIndex: 1,
        }}
      />

      {/* Layer 2 — three overlapping floating frames (desktop only) */}
      <div
        aria-label="Design process"
        className="hidden md:block absolute"
        style={{ inset: "12% 4% 14% 10%", zIndex: 2 }}
        onMouseLeave={handleCompositionLeave}
      >
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
                left: `${rect.left}%`,
                top: `${rect.top}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
                boxSizing: "border-box",
                overflow: "hidden",
                backgroundColor: SITE_BG,
                border: isActive ? "1px solid #000" : "1px solid transparent",
                backgroundImage: isActive ? "none" : DASH_BG,
                backgroundPosition: "top, right, bottom, left",
                backgroundSize: "4px 1px, 1px 4px, 4px 1px, 1px 4px",
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
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    padding: "3px 7px",
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
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      padding: "3px 7px",
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

      {/* Layer 3 — text */}
      <p
        className="hidden md:block absolute text-[20px] leading-[1.4] tracking-[-0.02em] text-ink"
        style={{ top: 16, left: 16, maxWidth: 340, zIndex: 3 }}
      >
        11+ years designing B2B software. Currently at PandaDoc in Berlin.
        Previously at Sberbank. Red Dot Award winner.
      </p>

      <h1
        className="hidden md:block absolute text-[72px] font-medium leading-none tracking-[-0.06em] text-ink text-right text-balance"
        style={{ bottom: 16, right: 16, maxWidth: 720, zIndex: 3 }}
      >
        I design and ship complex products
      </h1>

      {/* Scroll cue — desktop only, bottom-left of Hero grid */}
      <div
        className="hidden md:flex absolute items-center gap-1.5 select-none"
        style={{ left: 16, bottom: 16, zIndex: 3 }}
      >
        <span
          style={{
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: "#000",
          }}
        >
          SCROLL TO EXPLORE
        </span>
        <span
          style={{
            position: "relative",
            display: "inline-block",
            width: 16,
            height: 28,
            overflow: "hidden",
          }}
        >
          <img
            src={assetPath("/icons/arrow-down.svg")}
            alt=""
            width={16}
            height={16}
            className={rm ? undefined : "hero-scroll-arrow"}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              ...(rm ? { transform: "translateY(6px)" } : {}),
            }}
          />
        </span>
      </div>

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
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: BASE_LOGO_SIZE,
              height: BASE_LOGO_SIZE,
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

      {/* Mobile layout — simple stack */}
      <div className="md:hidden flex flex-col gap-8 py-12 relative" style={{ zIndex: 10 }}>
        <p className="text-[20px] leading-[1.4] tracking-[-0.02em] text-ink max-w-[423px]">
          11+ years designing B2B software. Currently at PandaDoc in Berlin.
          Previously at Sberbank. Red Dot Award winner.
        </p>
        <h1 className="text-[56px] font-medium leading-none tracking-[-0.06em] text-ink text-right">
          I design and ship complex products
        </h1>
      </div>
    </section>
  )
}
