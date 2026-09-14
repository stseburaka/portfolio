"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { SectionLabel } from "@/components/ui/SectionLabel"
import { ActionBar } from "@/components/ui/ActionBar"
import { siteConfig } from "@/content/config"
import { aboutPhotos } from "@/content/about"
import { assetPath } from "@/lib/paths"

const SWIPE_COUNT = aboutPhotos.length - 1 // 6 transitions across 7 photos
const SCROLL_PER_SWIPE_VH = 70
const SCENE_VH = 100 // one viewport of scroll room for the sticky scene itself
const FINAL_REST_VH = 30 // small resting range after the last transition, before sticky releases

const SWIPE_TOTAL_VH = SWIPE_COUNT * SCROLL_PER_SWIPE_VH
const PINNED_RANGE_VH = SWIPE_TOTAL_VH + FINAL_REST_VH
const SECTION_HEIGHT_VH = SCENE_VH + PINNED_RANGE_VH

// Sub-phases within a single transition's segment progress (0..1).
const SWIPE_START = 0.18
const SWIPE_END = 0.82
const FADE_START = 0.7

const SWIPE_X_VW = 60
const SWIPE_Y_VH = 6
const SWIPE_ARC_VH = 10
const SWIPE_ROTATION_DEG = 32

const STACK_WIDTH = "min(30vw, 500px, calc(46vh * var(--about-photo-ratio)))"

const ABOUT_COPY =
  "I'm a Senior Product Designer based in Berlin, working at the intersection of product, design, and engineering. These days, AI and code let me explore ideas far beyond what I could design on a canvas alone."

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function remap(value: number, inMin: number, inMax: number) {
  return clamp((value - inMin) / (inMax - inMin))
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return reduced
}

/** Continuous 0..1 scroll progress across the pinned range of `ref`'s element. */
function useSectionProgress(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const update = () => {
      const el = ref.current
      if (!el) return
      const scrollableDistance = el.offsetHeight - window.innerHeight
      if (scrollableDistance <= 0) return
      const scrolled = -el.getBoundingClientRect().top
      setProgress(clamp(scrolled / scrollableDistance))
    }

    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        update()
        rafRef.current = null
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [ref, enabled])

  return progress
}

function CTARow() {
  return (
    <div className="flex gap-4 pb-4">
      <ActionBar
        label="LinkedIn"
        href={siteConfig.linkedIn}
        icon="external"
        external
        className="flex-1"
      />
    </div>
  )
}

function AboutText({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-[32px] md:text-[48px] font-normal leading-[1.4] tracking-[-0.02em] text-ink ${className}`}
    >
      {ABOUT_COPY}
    </p>
  )
}

/** Static decorative stack — no scroll animation. Reused for mobile and reduced-motion. */
function StaticPhotoStack() {
  const photos = aboutPhotos.slice(0, 4)

  return (
    <div className="relative h-[220px] md:h-[260px] mx-auto w-full max-w-[320px]">
      {photos.map((photo, i) => (
        <div
          key={photo.src}
          className="absolute left-1/2 top-1/2"
          style={
            {
              "--about-photo-ratio": photo.aspectRatio,
              width: "min(42vw, 240px)",
              aspectRatio: photo.aspectRatio,
              zIndex: photos.length - i,
              transform: `translate(-50%, -50%) translate(${photo.restX}px, ${photo.restY}px) rotate(${photo.restRotation}deg)`,
            } as CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetPath(photo.src)}
            alt=""
            draggable={false}
            className="w-full h-full object-contain select-none"
          />
        </div>
      ))}
    </div>
  )
}

function AboutStatic() {
  return (
    <section className="flex flex-col gap-10">
      <SectionLabel withBorder>ABOUT</SectionLabel>
      <AboutText />
      <StaticPhotoStack />
      <CTARow />
    </section>
  )
}

function PhotoStage({ progress }: { progress: number }) {
  const swipeProgressTotal = Math.min(SWIPE_COUNT, progress * (PINNED_RANGE_VH / SWIPE_TOTAL_VH))
  const segmentIndex = Math.min(SWIPE_COUNT - 1, Math.floor(swipeProgressTotal))
  const segmentProgress = clamp(swipeProgressTotal - segmentIndex)
  const localT = easeInOutCubic(remap(segmentProgress, SWIPE_START, SWIPE_END))

  return (
    <div className="relative flex-1 min-h-0">
      {aboutPhotos.map((photo, i) => {
        const isActive = i === segmentIndex
        const isQueued = i > segmentIndex
        const isRecycled = i < segmentIndex

        let transform: string
        let opacity = 1
        let zIndex: number

        if (isActive) {
          const dir = photo.swipeDirection === "left" ? -1 : 1
          const xVw = dir * localT * SWIPE_X_VW
          const yVh = localT * SWIPE_Y_VH - SWIPE_ARC_VH * Math.sin(Math.PI * localT)
          const rotation = photo.restRotation + dir * localT * SWIPE_ROTATION_DEG
          opacity = localT < FADE_START ? 1 : 1 - remap(localT, FADE_START, 1)
          transform = `translate(-50%, -50%) translate3d(calc(${photo.restX}px + ${xVw}vw), calc(${photo.restY}px + ${yVh}vh), 0) rotate(${rotation}deg)`
          zIndex = 100
        } else {
          transform = `translate(-50%, -50%) translate(${photo.restX}px, ${photo.restY}px) rotate(${photo.restRotation}deg)`
          zIndex = isQueued ? 90 - i : i - 100
        }
        void isRecycled // recycled photos render identically to queued: own rest pose, deep z-index

        return (
          <div
            key={photo.src}
            className="absolute"
            style={
              {
                "--about-photo-ratio": photo.aspectRatio,
                left: "60%",
                top: "50%",
                width: STACK_WIDTH,
                aspectRatio: photo.aspectRatio,
                zIndex,
                opacity,
                transform,
                willChange: "transform, opacity",
              } as CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath(photo.src)}
              alt=""
              draggable={false}
              className="w-full h-full object-contain select-none"
            />
          </div>
        )
      })}
    </div>
  )
}

function AboutSticky() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress = useSectionProgress(sectionRef, true)

  return (
    <section
      ref={sectionRef}
      className="hidden md:block"
      style={{ height: `${SECTION_HEIGHT_VH}vh` }}
    >
      <div className="sticky top-[16px] h-[calc(100dvh-32px)] flex flex-col overflow-hidden">
        <SectionLabel withBorder>ABOUT</SectionLabel>
        <AboutText className="mt-10 max-w-[1000px]" />
        <PhotoStage progress={progress} />
        <CTARow />
      </div>
    </section>
  )
}

export function About() {
  const reducedMotion = useReducedMotion()

  return (
    <div id="about">
      {!reducedMotion && <AboutSticky />}
      <div className={reducedMotion ? "block" : "md:hidden"}>
        <AboutStatic />
      </div>
    </div>
  )
}
