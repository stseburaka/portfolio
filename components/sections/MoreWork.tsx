import { SectionLabel } from "@/components/ui/SectionLabel"
import { FeaturedProject } from "@/components/ui/FeaturedProject"
import { pandadocWork, earlierWork } from "@/content/work"
import { assetPath } from "@/lib/paths"

const metaLabelClass =
  "font-mono text-[14px] font-normal tracking-[0.01em] text-ink leading-[1.4]"

const sberbankVisual = (
  <video
    className="w-full h-full object-cover"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    poster={assetPath("/images/sberbank-banking-poster.jpg")}
  >
    <source src={assetPath("/videos/sberbank-banking.mp4")} type="video/mp4" />
  </video>
)

export function MoreWork() {
  return (
    <section className="py-16">
      <SectionLabel withBorder>MORE WORK</SectionLabel>

      <div className="mt-16 flex flex-col">
        {/* Sberbank — featured project block */}
        <FeaturedProject
          eyebrow="Sberbank · Business Banking"
          title="Designing cross-platform banking for entrepreneurs"
          description="A customizable business banking platform built around task-focused workflows."
          imagePosition="right"
          visual={sberbankVisual}
          tagLine="Cross-platform · Fintech · Design systems"
          ctaText="Red Dot Award Winner"
          ctaHref="https://www.red-dot.org/project/sberbank-business-online-55211"
          ctaExternal
          cursorLabel="View on Red Dot ↗"
        />

        {/* More from PandaDoc — vertical project index, table-like structure.
            Larger margin-top here (not a flex gap) so this block sits noticeably
            further from Sberbank while its own header stays tight to the table. */}
        <div className="mt-20 md:mt-[144px]">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] md:gap-x-12">
            <p className={metaLabelClass}>
              More from PandaDoc
            </p>
            <p className={`hidden md:block md:text-right ${metaLabelClass}`}>
              Outcome
            </p>
          </div>

          <div className="mt-6 flex flex-col border-t border-b border-border">
            {pandadocWork.map((item, i) => (
              <div
                key={item.slug}
                className={`grid grid-cols-1 md:grid-cols-[1fr_auto] items-start gap-x-12 gap-y-6 py-6 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-[32px] font-medium leading-[1.2] tracking-[-0.06em] text-ink">
                    {item.title}
                  </h3>
                  <p className="text-[16px] leading-[1.4] tracking-[-0.02em] text-ink">
                    {item.description}
                  </p>
                </div>
                <div className="flex flex-row flex-wrap items-baseline gap-3 md:flex-col md:flex-nowrap md:items-end md:gap-2 md:text-right">
                  <p className="text-[24px] md:text-[32px] font-medium leading-[1.2] tracking-[-0.06em] text-ink">
                    {item.achievementPrimary}
                  </p>
                  <p className="font-mono text-[14px] leading-[1.4] text-ink-2">
                    {item.achievementSecondary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earlier Work — two equal columns, each its own local subsection
            (employer label + divider + media + title/description). */}
        <div className="mt-16 md:mt-[160px] grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-4">
          {earlierWork.map((item) => (
            <div key={item.slug}>
              <p className={metaLabelClass}>{item.context}</p>
              <div className="mt-2 border-t border-border" />

              {item.video ? (
                <video
                  className="mt-6 w-full h-auto object-contain"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  poster={assetPath(item.image)}
                >
                  <source src={assetPath(item.video)} type="video/mp4" />
                </video>
              ) : (
                // Matches the Fintech video's actual rendered ratio (800×600 source, 4:3) so both
                // media boxes land at the same height in this row — same column width × same ratio.
                <div className="mt-6 w-full aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assetPath(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}

              <h3 className="mt-4 text-[32px] font-medium leading-[1.2] tracking-[-0.06em] text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-[16px] leading-[1.4] tracking-[-0.02em] text-ink">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
