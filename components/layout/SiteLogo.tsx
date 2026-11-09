"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type CSSProperties } from "react"

const LOGO_WORD = "Andrei."
const LOGO_REVEAL = "ndrei"

type LogoGlyphBox = { left: number; right: number }

type LogoGlyphMetrics = {
  glyphs: LogoGlyphBox[]
  dotOffset: number
}

interface SiteLogoProps {
  href: "/" | "/a"
  label: string
  className: string
}

export function SiteLogo({ href, label, className }: SiteLogoProps) {
  const logoMeasureRef = useRef<HTMLSpanElement>(null)
  const logoShortMeasureRef = useRef<HTMLSpanElement>(null)
  const [logoGlyphMetrics, setLogoGlyphMetrics] = useState<LogoGlyphMetrics | null>(null)

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

  return (
    <Link
      href={href}
      className={`${className} logo-link${logoGlyphMetrics ? " logo-measured" : ""}`}
      aria-label={label}
    >
      <span
        className="logo-word text-surface text-[42px] font-semibold leading-none select-none whitespace-nowrap"
        aria-hidden="true"
      >
        <span ref={logoMeasureRef} className="logo-native-run logo-reference">{LOGO_WORD}</span>
        <span ref={logoShortMeasureRef} className="logo-native-run logo-short-reference">A.</span>
        {!logoGlyphMetrics && <span className="logo-fallback">A<span className="logo-cursor">.</span></span>}
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
              className="logo-native-run logo-dot logo-cursor"
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
  )
}
