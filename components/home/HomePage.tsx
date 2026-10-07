"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { siteConfig } from "@/content/config"
import { PlaygroundFrames } from "@/components/home/PlaygroundFrames"

const TARGET_CELL_SIZE = 96
const GRID_LINE = "rgba(0, 0, 0, 0.08)"

export function HomePage() {
  const playgroundRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState({ cell: TARGET_CELL_SIZE, columns: 1, rows: 1 })

  useEffect(() => {
    const element = playgroundRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width <= 0 || height <= 0) return

      const columns = Math.max(1, Math.round(width / TARGET_CELL_SIZE))
      const rows = Math.max(1, Math.round(height / TARGET_CELL_SIZE))
      const cell = Math.min((width - 1) / columns, (height - 1) / rows)

      setGrid((current) => {
        if (
          current.columns === columns &&
          current.rows === rows &&
          Math.abs(current.cell - cell) < 0.25
        ) {
          return current
        }

        return { cell, columns, rows }
      })
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const gridWidth = grid.columns * grid.cell
  const gridHeight = grid.rows * grid.cell

  return (
    <div className="portfolio-home">
      <aside className="home-info" aria-label="About Andrei">
        <Link href="/" className="home-logo logo-link" aria-label="Andrei Stseburaka home">
          <span className="logo-a text-surface text-[42px] font-semibold leading-none tracking-[-0.06em] select-none whitespace-nowrap" aria-hidden="true">A.</span>
          <span className="logo-andrei text-surface text-[42px] font-semibold leading-none tracking-[-0.06em] select-none whitespace-nowrap" aria-hidden="true">Andrei</span>
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
          <div
            className="home-playground-grid"
            aria-hidden="true"
            style={{
              width: gridWidth + 1,
              height: gridHeight + 1,
              borderRight: `1px solid ${GRID_LINE}`,
              borderBottom: `1px solid ${GRID_LINE}`,
              backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
              backgroundSize: `${grid.cell}px ${grid.cell}px`,
            }}
          />
          <PlaygroundFrames cell={grid.cell} columns={grid.columns} rows={grid.rows} />
        </div>
      </section>
    </div>
  )
}
