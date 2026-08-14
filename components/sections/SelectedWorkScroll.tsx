"use client"

import { useRef } from "react"
import { SectionLabel } from "@/components/ui/SectionLabel"
import { FeaturedProject } from "@/components/ui/FeaturedProject"
import { SelectedWork } from "@/components/sections/SelectedWork"
import { caseStudies } from "@/content/work"
import { useScrollState } from "@/hooks/useScrollState"

const visuals: Record<string, React.ReactNode> = {
  "recipient-experience": (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/recipient-experience-bg.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          className="w-[85%] object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src="/videos/recipient-experience-ui.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  ),
  rooms: (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/rooms-bg.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          className="w-[87%] object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src="/videos/rooms-ui.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  ),
}

export function SelectedWorkScroll() {
  const sectionRef = useRef<HTMLElement>(null)
  const activeIndex = useScrollState(sectionRef, caseStudies.length)

  return (
    <>
      {/* Desktop: sticky scroll section */}
      <section
        ref={sectionRef}
        className="hidden md:block"
        style={{ height: "250vh" }}
        aria-label="Selected work"
      >
        <div className="sticky top-[16px] h-[calc(100dvh-16px)] flex flex-col overflow-hidden">
          <SectionLabel withBorder>SELECTED WORK</SectionLabel>

          <div className="flex-1 relative mt-6 overflow-hidden">
            {caseStudies.map((study, i) => (
              <div
                key={study.slug}
                className="absolute inset-0"
                aria-hidden={i !== activeIndex}
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transition: "opacity 400ms ease-in-out",
                  pointerEvents: i === activeIndex ? "auto" : "none",
                }}
              >
                <FeaturedProject
                  eyebrow={study.tag}
                  title={study.headline}
                  description={study.description}
                  imagePosition={study.imagePosition}
                  visual={visuals[study.slug]}
                  metrics={study.metrics}
                  ctaText="View case"
                  ctaHref={`/work/${study.slug}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile: normal sequential flow */}
      <div className="md:hidden">
        <SelectedWork />
      </div>
    </>
  )
}
