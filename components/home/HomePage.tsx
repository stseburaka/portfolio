"use client"

import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"
import { useEffect, useRef, useState } from "react"
import { siteConfig } from "@/content/config"
import { AgainCollage } from "@/components/home/AgainCollage"
import { AsciiAnimals } from "@/components/home/AsciiAnimals"
import { PlaygroundFrames } from "@/components/home/PlaygroundFrames"
import { StarField } from "@/components/home/StarField"
import { SiteLogo } from "@/components/layout/SiteLogo"
import { assetPath } from "@/lib/paths"

const PLAYGROUND_GRID = { columns: 13, rows: 9 } as const

export function HomePage({ mode }: { mode: "design" | "art" }) {
  const isArt = mode === "art"
  const playgroundRef = useRef<HTMLDivElement>(null)
  const [playgroundSize, setPlaygroundSize] = useState({ width: 0, height: 0 })

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
    <div
      className="portfolio-home"
      style={{ "--playground-row-height": `${cellHeight}px` } as CSSProperties}
    >
      <aside className="home-info" aria-label="About Andrei">
        <div className="home-info-panel">
          <div className="home-info-copy">
            <SiteLogo
              href={isArt ? "/a" : "/"}
              className="home-logo"
              label="Andrei Stseburaka home"
            />

            <p className="home-about">
              {isArt
                ? "Belarusian designer and photographer based in Berlin. Exploring migration, protest, and exclusion through visual research and artistic practice."
                : "Product designer working across fintech, B2B SaaS and AI. Red Dot Award winner."}
            </p>
          </div>

          <a
            className="home-link"
            href={isArt ? siteConfig.instagram : siteConfig.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isArt ? "Instagram" : "LinkedIn"} →
          </a>
        </div>

        <div className="home-cats-panel">
          {isArt ? <AgainCollage /> : <AsciiAnimals />}
        </div>
      </aside>

      <section className="home-playground-inset" aria-label="Playground">
        <div ref={playgroundRef} className="home-playground">
          <Link
            href={isArt ? "/" : "/a"}
            aria-label={isArt ? "Switch to Design" : "Switch to Art"}
            className="home-mode-switch"
          >
            <Image
              src={assetPath(isArt ? "/icons/switch-to-design.svg" : "/icons/switch-to-art.svg")}
              alt=""
              width={48}
              height={24}
            />
          </Link>
          <svg
            className="home-playground-grid"
            aria-hidden="true"
            width="100%"
            height="100%"
            viewBox={gridViewBox}
            preserveAspectRatio="none"
            style={{ zIndex: 0 }}
          >
            <path
              d={innerGridPath}
              fill="none"
              stroke="var(--playground-grid-line)"
              strokeWidth="1"
            />
            {playgroundSize.width > 0 && playgroundSize.height > 0 &&
              Array.from({ length: PLAYGROUND_GRID.rows }, (_, rowIndex) =>
                Array.from({ length: PLAYGROUND_GRID.columns }, (_, columnIndex) => (
                  <text
                    key={`${columnIndex}-${rowIndex}`}
                    x={columnIndex * cellWidth + 4}
                    y={rowIndex * cellHeight + 4}
                    dominantBaseline="hanging"
                    fontFamily="var(--font-ibm-plex-mono), ui-monospace, monospace"
                    fontSize={8}
                    fontWeight={400}
                    letterSpacing="0"
                    fill="#B0B0B0"
                  >
                    {String.fromCharCode(65 + columnIndex)}{rowIndex + 1}
                  </text>
                )),
              )}
          </svg>
          {playgroundSize.width > 0 && playgroundSize.height > 0 && (
            <StarField width={playgroundSize.width} height={playgroundSize.height} />
          )}
          {playgroundSize.width > 0 && playgroundSize.height > 0 && (
            <PlaygroundFrames
              mode={mode}
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
            style={{ zIndex: 3 }}
          >
            <path
              d={outerBorderPath}
              fill="none"
              stroke="var(--playground-grid-line)"
              strokeWidth="1"
            />
          </svg>
        </div>
      </section>
    </div>
  )
}
