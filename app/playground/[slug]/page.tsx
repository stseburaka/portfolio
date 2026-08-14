import { Container } from "@/components/layout/Container"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return []
}

export default async function PlaygroundProjectPage({ params }: Props) {
  const { slug } = await params
  // Future: look up playground experiments by slug
  if (!slug) notFound()

  return (
    <Container>
      <div className="py-20">
        <p className="text-[16px] text-ink-2">Playground project coming soon.</p>
      </div>
    </Container>
  )
}
