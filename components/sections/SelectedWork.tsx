import { SectionLabel } from "@/components/ui/SectionLabel"
import { FeaturedProject } from "@/components/ui/FeaturedProject"
import { caseStudies } from "@/content/work"
import { assetPath } from "@/lib/paths"

const visuals: Record<string, React.ReactNode> = {
  "recipient-experience": (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath("/images/recipient-experience-bg.webp")}
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
          <source src={assetPath("/videos/recipient-experience-ui.mp4")} type="video/mp4" />
        </video>
      </div>
    </div>
  ),
  rooms: (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath("/images/rooms-bg.webp")}
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
          <source src={assetPath("/videos/rooms-ui.mp4")} type="video/mp4" />
        </video>
      </div>
    </div>
  ),
}

export function SelectedWork() {
  return (
    <section className="py-16">
      <SectionLabel withBorder>SELECTED WORK</SectionLabel>

      <div className="mt-16 flex flex-col gap-16 md:gap-[160px]">
        {caseStudies.map((study) => (
          <FeaturedProject
            key={study.slug}
            eyebrow={study.tag}
            title={study.headline}
            description={study.description}
            imagePosition={study.imagePosition}
            visual={visuals[study.slug]}
            metrics={study.metrics}
            ctaText="View case study"
            ctaLocked
          />
        ))}
      </div>
    </section>
  )
}
