import { Container } from "@/components/layout/Container"
import { Hero } from "@/components/sections/Hero"
import { SelectedWorkScroll } from "@/components/sections/SelectedWorkScroll"
import { About } from "@/components/sections/About"
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline"
import { MoreWorkScroll } from "@/components/sections/MoreWorkScroll"
import { GetInTouch } from "@/components/sections/GetInTouch"

export default function Home() {
  return (
    <Container>
      <Hero />
      <SelectedWorkScroll />
      <About />
      <ExperienceTimeline />
      <MoreWorkScroll />
      <GetInTouch />
    </Container>
  )
}
