"use client"

import Link from "next/link"
import type { CSSProperties } from "react"
import { useEffect, useRef, useState } from "react"
import { siteConfig } from "@/content/config"
import { PlaygroundFrames } from "@/components/home/PlaygroundFrames"
import { StarField } from "@/components/home/StarField"

const GRID_LINE = "rgba(0, 0, 0, 0.08)"
const PLAYGROUND_GRID = { columns: 13, rows: 9 } as const
const LOGO_WORD = "Andrei."
const LOGO_REVEAL = "ndrei"

type LogoGlyphBox = { left: number; right: number }

type LogoGlyphMetrics = {
  glyphs: LogoGlyphBox[]
  dotOffset: number
}

export function HomePage() {
  const playgroundRef = useRef<HTMLDivElement>(null)
  const logoMeasureRef = useRef<HTMLSpanElement>(null)
  const logoShortMeasureRef = useRef<HTMLSpanElement>(null)
  const [logoGlyphMetrics, setLogoGlyphMetrics] = useState<LogoGlyphMetrics | null>(null)
  const [playgroundSize, setPlaygroundSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    let cancelled = false

    const measureGlyphs = (element: HTMLSpanElement, count: number) => {
      const textNode = element.firstChild
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null

      const hostRect = element.getBoundingClientRect()
      const range = document.createRange()
      const glyphs: LogoGlyphBox[] = []

      for (let index = 0; index < count; index += 1) {
        range.setStart(textNode, index)
        range.setEnd(textNode, index + 1)
        const rect = range.getBoundingClientRect()
        glyphs.push({
          left: rect.left - hostRect.left,
          right: rect.right - hostRect.left,
        })
      }

      return glyphs
    }

    const measure = () => {
      const fullWord = logoMeasureRef.current
      const shortWord = logoShortMeasureRef.current
      if (!fullWord || !shortWord) return

      const glyphs = measureGlyphs(fullWord, LOGO_WORD.length)
      const shortGlyphs = measureGlyphs(shortWord, 2)
      if (!glyphs || !shortGlyphs) return

      setLogoGlyphMetrics({
        glyphs,
        dotOffset: shortGlyphs[1].left - glyphs[LOGO_WORD.length - 1].left,
      })
    }

    measure()
    document.fonts.ready.then(() => {
      if (!cancelled) measure()
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const element = playgroundRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width <= 0 || height <= 0) return

      setPlaygroundSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      )
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const cellWidth = playgroundSize.width / PLAYGROUND_GRID.columns
  const cellHeight = playgroundSize.height / PLAYGROUND_GRID.rows
  const innerGridPath = [
    ...Array.from({ length: PLAYGROUND_GRID.columns - 1 }, (_, index) => {
      const x = (index + 1) * cellWidth
      return `M ${x} 1 V ${playgroundSize.height - 1}`
    }),
    ...Array.from({ length: PLAYGROUND_GRID.rows - 1 }, (_, index) => {
      const y = (index + 1) * cellHeight
      return `M 1 ${y} H ${playgroundSize.width - 1}`
    }),
  ].join(" ")
  const outerBorderPath = playgroundSize.width > 1 && playgroundSize.height > 1
    ? `M 0.5 0.5 H ${playgroundSize.width - 0.5} V ${playgroundSize.height - 0.5} H 0.5 Z`
    : ""
  const gridViewBox = playgroundSize.width > 0 && playgroundSize.height > 0
    ? `0 0 ${playgroundSize.width} ${playgroundSize.height}`
    : "0 0 1 1"

  return (
    <div className="portfolio-home">
      <aside className="home-info" aria-label="About Andrei">
        <Link
          href="/"
          className={`home-logo logo-link${logoGlyphMetrics ? " logo-measured" : ""}`}
          aria-label="Andrei Stseburaka home"
        >
          <span
            className="logo-word text-surface text-[42px] font-semibold leading-none select-none whitespace-nowrap"
            aria-hidden="true"
          >
            <span ref={logoMeasureRef} className="logo-native-run logo-reference">{LOGO_WORD}</span>
            <span ref={logoShortMeasureRef} className="logo-native-run logo-short-reference">A.</span>
            {!logoGlyphMetrics && <span className="logo-fallback">A.</span>}
            {logoGlyphMetrics && (
              <>
                <span
                  className="logo-native-run logo-prefix"
                  style={{
                    "--glyph-right": `${logoGlyphMetrics.glyphs[0].right}px`,
                  } as CSSProperties}
                >
                  {LOGO_WORD}
                </span>
                {LOGO_REVEAL.split("").map((_, index) => {
                  const glyph = logoGlyphMetrics.glyphs[index + 1]
                  return (
                    <span
                      key={index}
                      className="logo-native-run logo-letter"
                      style={{
                        "--glyph-left": `${glyph.left}px`,
                        "--glyph-right": `${glyph.right}px`,
                      } as CSSProperties}
                    >
                      {LOGO_WORD}
                    </span>
                  )
                })}
                <span
                  className="logo-native-run logo-dot"
                  style={{
                    "--glyph-left": `${logoGlyphMetrics.glyphs[LOGO_WORD.length - 1].left}px`,
                    "--glyph-right": `${logoGlyphMetrics.glyphs[LOGO_WORD.length - 1].right}px`,
                    "--dot-offset": `${logoGlyphMetrics.dotOffset}px`,
                  } as CSSProperties}
                >
                  {LOGO_WORD}
                </span>
              </>
            )}
          </span>
        </Link>

        <p className="home-about">
          Product designer working across fintech, B2B SaaS and AI. Red Dot Award winner.
        </p>

        <a className="home-link" href={siteConfig.linkedIn} target="_blank" rel="noopener noreferrer">
          LinkedIn →
        </a>
      </aside>

      <section className="home-playground-inset" aria-label="Playground">
        <div ref={playgroundRef} className="home-playground">
          <svg
            className="home-playground-grid"
            aria-hidden="true"
            width="100%"
            height="100%"
            viewBox={gridViewBox}
            preserveAspectRatio="none"
          >
            <path
              d={innerGridPath}
              fill="none"
              stroke={GRID_LINE}
              strokeWidth="1"
            />
          </svg>
          {playgroundSize.width > 0 && playgroundSize.height > 0 && (
            <StarField width={playgroundSize.width} height={playgroundSize.height} />
          )}
          {playgroundSize.width > 0 && playgroundSize.height > 0 && (
            <PlaygroundFrames
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              columns={PLAYGROUND_GRID.columns}
              rows={PLAYGROUND_GRID.rows}
            />
          )}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            width="100%"
            height="100%"
            viewBox={gridViewBox}
            preserveAspectRatio="none"
            style={{ zIndex: 2 }}
          >
            <path
              d={outerBorderPath}
              fill="none"
              stroke={GRID_LINE}
              strokeWidth="1"
            />
          </svg>
        </div>
      </section>
    </div>
  )
}
