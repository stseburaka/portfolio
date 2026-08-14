import { ReactNode } from "react"
import { ActionBar } from "./ActionBar"

export interface FeaturedMetric {
  value: string
  label: string
}

interface FeaturedProjectProps {
  eyebrow: string
  title: string
  description: string
  imagePosition: "left" | "right"
  visual: ReactNode
  metrics?: FeaturedMetric[]
  tagLine?: string
  ctaText: string
  ctaHref: string
  ctaExternal?: boolean
}

export function FeaturedProject({
  eyebrow,
  title,
  description,
  imagePosition,
  visual,
  metrics,
  tagLine,
  ctaText,
  ctaHref,
  ctaExternal,
}: FeaturedProjectProps) {
  // imagePosition="right" → CONTENT|VISUAL, "left" → VISUAL|CONTENT
  const gridCols =
    imagePosition === "left"
      ? "md:grid-cols-[938fr_470fr]"
      : "md:grid-cols-[470fr_938fr]"

  const articleCls = `grid grid-cols-1 ${gridCols} md:min-h-[612px]`

  const visualCls = [
    "min-h-[300px] md:min-h-0 overflow-hidden",
    imagePosition === "right" ? "md:order-2" : "",
  ].filter(Boolean).join(" ")

  return (
    <article className={articleCls}>
      {/* Visual panel — first in DOM so mobile shows visual above content */}
      <div className={visualCls}>
        {visual}
      </div>

      {/* Content panel */}
      <div className="bg-surface flex flex-col">
        <div className="flex flex-col flex-1 p-6">
          <p className="text-[14px] font-normal uppercase tracking-[0.01em] text-ink leading-[1.4]">
            {eyebrow}
          </p>

          <h2 className="text-[36px] font-medium leading-[1.2] tracking-[-0.06em] text-ink mt-10">
            {title}
          </h2>

          <p className="text-[16px] leading-[1.4] tracking-[-0.02em] text-ink mt-6">
            {description}
          </p>

          <div className="flex-1 min-h-10" />

          {metrics && metrics.length > 0 && (
            <div className="flex flex-wrap gap-x-12 gap-y-3">
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-[36px] font-medium leading-[1.4] tracking-[-0.06em] text-ink">
                    {m.value}
                  </p>
                  <p className="text-[14px] leading-[1.4] text-ink-2">{m.label}</p>
                </div>
              ))}
            </div>
          )}

          {tagLine && (
            <p className="text-[14px] leading-[1.4] text-ink-2">{tagLine}</p>
          )}
        </div>

        <ActionBar
          label={ctaText}
          href={ctaHref}
          icon={ctaExternal ? "external" : "arrow"}
          external={ctaExternal}
        />
      </div>
    </article>
  )
}
