import { Container } from "@/components/layout/Container"
import { Hero } from "@/components/sections/Hero"
import { SelectedWork } from "@/components/sections/SelectedWork"
import { About } from "@/components/sections/About"
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline"
import { MoreWork } from "@/components/sections/MoreWork"
import { GetInTouch } from "@/components/sections/GetInTouch"
import { siteConfig } from "@/content/config"

export default function Home() {
  return (
    <Container>
      <Hero />
      <SelectedWork />
      <About />
      <ExperienceTimeline />
      {siteConfig.showPlaygroundSection && (
        <section className="py-16">
          {/* Playground section — enable via siteConfig.showPlaygroundSection */}
        </section>
      )}
      <MoreWork />
      <GetInTouch />
    </Container>
  )
}
