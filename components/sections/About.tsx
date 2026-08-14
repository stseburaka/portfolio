import { SectionLabel } from "@/components/ui/SectionLabel"
import { ActionBar } from "@/components/ui/ActionBar"
import { siteConfig } from "@/content/config"

export function About() {
  return (
    <section id="about" className="py-16">
      <SectionLabel withBorder>ABOUT</SectionLabel>

      <div className="mt-10 flex flex-col gap-10">
        <p className="text-[28px] md:text-[36px] font-light leading-[1.35] tracking-[-0.01em] text-ink max-w-[1000px]">
          I&apos;m a Senior Product Designer based in Berlin, working at the
          intersection of product, design, and engineering. These days, AI and
          code let me explore ideas far beyond what I could design on a canvas
          alone.
        </p>

        <div className="flex gap-4">
          <ActionBar
            label="LinkedIn"
            href={siteConfig.linkedIn}
            icon="external"
            external
            className="flex-1"
          />
          <ActionBar
            label="CV"
            href={siteConfig.cv}
            icon="external"
            external
            className="flex-1"
          />
        </div>
      </div>
    </section>
  )
}
