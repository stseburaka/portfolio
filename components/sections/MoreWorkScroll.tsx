"use client"

import { useRef } from "react"
import { FeaturedProject } from "@/components/ui/FeaturedProject"
import { MoreWork } from "@/components/sections/MoreWork"
import { pandadocWork, earlierWork } from "@/content/work"
import { useScrollState } from "@/hooks/useScrollState"

const SECTION_TITLES = ["MORE WORK", "MORE FROM PANDADOC", "EARLIER WORK"]
const LONGEST_TITLE = "MORE FROM PANDADOC"

// Orange brand accent — same as header tagline band
const ORANGE = "#fe7141"

const sberbankVisual = (
  <video
    className="w-full h-full object-cover"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    poster="/images/sberbank-banking-poster.jpg"
  >
    <source src="/videos/sberbank-banking.mp4" type="video/mp4" />
  </video>
)

// Impact statements for the 2×2 PandaDoc grid
const pandadocImpacts = ["0→1", "New revenue streams", "+2.5% new ARR", "+7 NPS"]

// 2×2 grid borders: right border separates columns, bottom border separates rows
const pandadocGridBorders = [
  "border-b border-border md:border-r",       // top-left: right + bottom
  "border-b border-border",                    // top-right: bottom only
  "border-b border-border md:border-b-0 md:border-r", // bottom-left: right only (on desktop)
  "",                                          // bottom-right: none
]

function SberbankContent() {
  return (
    <FeaturedProject
      eyebrow="SBERBANK · BUSINESS BANKING"
      title="Designing cross-platform banking for entrepreneurs"
      description="A customizable business banking platform built around task-focused workflows."
      imagePosition="right"
      visual={sberbankVisual}
      tagLine="Cross-platform · Fintech · Design systems"
      ctaText="Red Dot Award Winner"
      ctaHref="https://www.red-dot.org/project/sberbank-business-online-55211"
      ctaExternal
    />
  )
}

function PandaDocContent() {
  return (
    // h-full: fills the absolute inset-0 slide container
    <div className="bg-surface grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 h-full">
      {pandadocWork.map((item, i) => (
        <div
          key={item.slug}
          className={`flex flex-col p-6 min-h-[200px] ${pandadocGridBorders[i]}`}
        >
          {/* Project info: top-left */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[22px] font-medium leading-[1.2] tracking-[-0.05em] text-ink">
              {item.title}
            </h3>
            <p className="text-[15px] leading-[1.4] tracking-[-0.01em] text-ink-2">
              {item.description}
            </p>
          </div>

          {/* Spacer pushes impact to bottom */}
          <div className="flex-1" />

          {/* Impact statement: bottom-right */}
          <div className="flex justify-end">
            <p
              className="text-[40px] font-medium leading-[1.1] tracking-[-0.05em] text-right"
              style={{ color: ORANGE }}
            >
              {pandadocImpacts[i]}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function EarlierWorkContent() {
  return (
    // h-full: fills the absolute inset-0 slide container
    <div className="flex flex-col md:flex-row h-full">
      {earlierWork.map((item, i) => (
        <article
          key={item.slug}
          className={`flex flex-col md:w-1/2 ${
            i === 0 ? "border-b border-border md:border-b-0 md:border-r" : ""
          }`}
        >
          {/* Visual: fills available height above text area */}
          <div className="flex-1 overflow-hidden min-h-[200px]">
            {item.video ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                poster={item.image}
              >
                <source src={item.video} type="video/mp4" />
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Text area: fixed at bottom of each card */}
          <div className="bg-surface p-6 flex flex-col gap-4 shrink-0">
            <div className="flex flex-col gap-2">
              <h3 className="text-[24px] font-medium leading-[1.2] tracking-[-0.05em] text-ink">
                {item.title}
              </h3>
              <p className="text-[15px] leading-[1.4] tracking-[-0.01em] text-ink">
                {item.description}
              </p>
            </div>
            <p className="text-[13px] leading-[1.4] text-ink-3">{item.context}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

const contentSlides = [
  <SberbankContent key="sberbank" />,
  <PandaDocContent key="pandadoc" />,
  <EarlierWorkContent key="earlier" />,
]

export function MoreWorkScroll() {
  const sectionRef = useRef<HTMLElement>(null)
  const activeIndex = useScrollState(sectionRef, SECTION_TITLES.length)

  return (
    <>
      {/* Desktop: sticky scroll section — scroll mechanics unchanged */}
      <section
        ref={sectionRef}
        className="hidden md:block"
        style={{ height: "300vh" }}
        aria-label="More work"
      >
        <div className="sticky top-[16px] h-[calc(100dvh-16px)] flex flex-col overflow-hidden">
          {/* Section label with crossfading title */}
          <div className="border-t border-border pt-5 relative">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3 invisible select-none"
              aria-hidden="true"
            >
              {LONGEST_TITLE}
            </p>
            {SECTION_TITLES.map((title, i) => (
              <p
                key={title}
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3 absolute top-5 left-0"
                aria-hidden={i !== activeIndex}
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transition: "opacity 300ms ease-in-out",
                }}
              >
                {title}
              </p>
            ))}
          </div>

          {/* Content stage */}
          <div className="flex-1 relative mt-6 overflow-hidden">
            {contentSlides.map((slide, i) => (
              <div
                key={i}
                className="absolute inset-0"
                aria-hidden={i !== activeIndex}
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transition: "opacity 400ms ease-in-out",
                  pointerEvents: i === activeIndex ? "auto" : "none",
                }}
              >
                {slide}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile: normal sequential flow */}
      <div className="md:hidden">
        <MoreWork />
      </div>
    </>
  )
}
