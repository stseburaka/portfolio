import { Container } from "@/components/layout/Container"
import { SectionLabel } from "@/components/ui/SectionLabel"

export default function PlaygroundPage() {
  return (
    <Container>
      <div className="py-16">
        <SectionLabel>PLAYGROUND</SectionLabel>
        <p className="mt-8 text-[16px] text-ink-2">
          AI &amp; vibe coding experiments — coming soon.
        </p>
      </div>
    </Container>
  )
}
