import { Container } from "@/components/layout/Container"
import { Hero } from "@/components/sections/Hero"
import { SelectedWork } from "@/components/sections/SelectedWork"
import { About } from "@/components/sections/About"
import { MoreWork } from "@/components/sections/MoreWork"
import { GetInTouch } from "@/components/sections/GetInTouch"
import { siteConfig } from "@/content/config"

export default function Home() {
  return (
    <Container>
      <Hero />
      <div className="section-gap"><SelectedWork /></div>
      {siteConfig.showAboutSection && (
        <div className="section-gap"><About /></div>
      )}
      <div className="section-gap"><MoreWork /></div>
      <div className="section-gap"><GetInTouch /></div>
    </Container>
  )
}
