export interface Metric {
  value: string
  label: string
}

export interface CaseStudy {
  slug: string
  tag: string
  headline: string
  description: string
  metrics: Metric[]
  imagePosition: "left" | "right"
  imageBg: "gradient" | "light" | "dark"
}

export interface WorkItem {
  slug: string
  tag: string
  headline: string
  description: string
  tags: string[]
  badge?: string
}

export interface PandaDocItem {
  slug: string
  title: string
  description: string
  outcome: string
}

export interface EarlierWorkItem {
  slug: string
  title: string
  description: string
  context: string
  image: string
  video?: string
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "recipient-experience",
    tag: "PANDADOC · RECIPIENT EXPERIENCE",
    headline: "Redesigning the signing experience for millions of recipients",
    description:
      "What started as separate improvements across signing, verification, and sharing evolved into redesigning the recipient experience as one connected system.",
    metrics: [
      { value: "-59%", label: "spam reports" },
      { value: "+5pp", label: "completion rate" },
    ],
    imagePosition: "right",
    imageBg: "gradient",
  },
  {
    slug: "rooms",
    tag: "PANDADOC · ROOMS",
    headline: "Building a collaborative deal room from the ground up",
    description:
      "What started with 20+ customer interviews became a new PandaDoc product: taking Rooms from early discovery to launch in nine months.",
    metrics: [
      { value: "26.9%", label: "activation rate" },
      { value: "50%", label: "solutions / blockers" },
      { value: "70%", label: "3-month retention" },
    ],
    imagePosition: "left",
    imageBg: "light",
  },
]

export const featuredWork: WorkItem[] = [
  {
    slug: "business-banking",
    tag: "SBERBANK · BUSINESS BANKING",
    headline: "Designing a cross-platform banking experience for entrepreneurs",
    description:
      "Designed a customizable business banking platform around task-focused workflows across mobile and desktop.",
    tags: ["Cross-platform", "Fintech", "Design systems"],
    badge: "Red Dot Award Winner",
  },
]

export const pandadocWork: PandaDocItem[] = [
  {
    slug: "chatgpt-app",
    title: "ChatGPT App",
    description: "Designing PandaDoc experiences for conversational AI",
    outcome: "AI · 0→1 · Prototyping",
  },
  {
    slug: "notary",
    title: "PandaDoc Notary",
    description: "Expanding the product into regulated signing workflows",
    outcome: "New use cases · Revenue · Compliance",
  },
  {
    slug: "smart-content",
    title: "Smart Content",
    description: "Simplifying content personalization in complex sales documents",
    outcome: "+2.5% New ARR",
  },
  {
    slug: "performance-reliability",
    title: "Performance & Reliability",
    description: "Improving real and perceived product performance",
    outcome: "+7 NPS",
  },
]

export const earlierWork: EarlierWorkItem[] = [
  {
    slug: "fintech-platform",
    title: "Fintech Platform",
    description: "Digital lending experience",
    context: "Production studio",
    image: "/images/fintech-platform-poster.jpg",
    video: "/videos/fintech-platform.mp4",
  },
  {
    slug: "ai-deal-scoring",
    title: "AI deal scoring",
    description: "ML-powered opportunity scoring for sales teams",
    context: "Machine learning startup",
    image: "/images/ai-deal-scoring.webp",
  },
]
