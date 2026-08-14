import { SectionLabel } from "@/components/ui/SectionLabel"
import { FeaturedProject } from "@/components/ui/FeaturedProject"
import { pandadocWork, earlierWork } from "@/content/work"

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

// Dividers between cells — no gaps, only border lines.
// Desktop (xl, 4-col): border-r on items 0,1,2
// Tablet (md, 2-col):  border-r on items 0,2 + border-b on items 0,1
// Mobile (1-col):      border-b on items 0,1,2
const pandadocBorders = [
  "border-b border-border md:border-r xl:border-b-0",
  "border-b border-border xl:border-b-0 xl:border-r",
  "border-b border-border md:border-b-0 md:border-r",
  "",
]

export function MoreWork() {
  return (
    <section className="py-16">
      <SectionLabel withBorder>MORE WORK</SectionLabel>

      <div className="mt-12 flex flex-col gap-16">
        {/* Sberbank — featured project block */}
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

        {/* More from PandaDoc — editorial 4-column grid */}
        <div>
          <SectionLabel withBorder>MORE FROM PANDADOC</SectionLabel>
          <div className="mt-6 bg-surface grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {pandadocWork.map((item, i) => (
              <div
                key={item.slug}
                className={`flex flex-col justify-between p-6 min-h-[256px] ${pandadocBorders[i]}`}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-[32px] font-medium leading-[1.2] tracking-[-0.06em] text-ink">
                    {item.title}
                  </h3>
                  <p className="text-[18px] leading-[1.4] tracking-[-0.02em] text-ink">
                    {item.description}
                  </p>
                </div>
                <p className="text-[14px] leading-[1.4] text-ink-2 mt-6">
                  {item.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Earlier Work — image/video + content pairs */}
        <div>
          <SectionLabel withBorder>EARLIER WORK</SectionLabel>
          <div className="mt-6 flex flex-col md:flex-row">
            {earlierWork.map((item, i) => (
              <article
                key={item.slug}
                className={`flex flex-col md:flex-row md:w-1/2 min-h-[320px] ${
                  i === 0 ? "border-b border-border md:border-b-0 md:border-r" : ""
                }`}
              >
                {/* Media */}
                <div className="overflow-hidden min-h-[260px] md:min-h-0 md:w-1/2 shrink-0">
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

                {/* Content */}
                <div className="bg-surface flex flex-col justify-between p-6 flex-1">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[28px] font-medium leading-[1.2] tracking-[-0.06em] text-ink">
                      {item.title}
                    </h3>
                    <p className="text-[16px] leading-[1.4] tracking-[-0.02em] text-ink">
                      {item.description}
                    </p>
                  </div>
                  <p className="text-[14px] leading-[1.4] text-ink-2 mt-6">
                    {item.context}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
