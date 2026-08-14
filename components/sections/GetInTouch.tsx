import { SectionLabel } from "@/components/ui/SectionLabel"
import { ActionBar } from "@/components/ui/ActionBar"
import { siteConfig } from "@/content/config"

export function GetInTouch() {
  return (
    <section className="py-16">
      <SectionLabel withBorder>GET IN TOUCH</SectionLabel>

      <div className="mt-10 flex gap-4">
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
    </section>
  )
}
