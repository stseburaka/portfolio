import { Container } from "@/components/layout/Container"
import { caseStudies } from "@/content/work"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return caseStudies.map((s) => ({ slug: s.slug }))
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const study = caseStudies.find((s) => s.slug === slug)
  if (!study) notFound()

  return (
    <Container>
      <div className="py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3 mb-6">
          {study.tag}
        </p>
        <h1 className="text-[48px] font-semibold leading-tight tracking-tight max-w-[760px]">
          {study.headline}
        </h1>
        <p className="mt-6 text-[16px] text-ink-2 leading-relaxed max-w-[600px]">
          Case study coming soon.
        </p>
      </div>
    </Container>
  )
}
