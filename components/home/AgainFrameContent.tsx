"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { assetPath } from "@/lib/paths"

const AGAIN_CARDS = {
  shape: {
    questions: ["Can solidarity become exclusion?"],
    images: [
      { file: "torn-rainbow-poster.webp", alt: "Torn poster with white Cyrillic lettering, rainbow stripes, and handwritten marks against black." },
    ],
  },
  understand: {
    questions: ["Who gets to be seen?", "Who remains invisible?"],
    images: [
      { file: "gold-wall-emblem.webp", alt: "Gold shield with a mounted figure on a white wall beside a dark doorway." },
      { file: "chairs-and-flags.webp", alt: "Rows of empty chairs in front of red-and-white flags and a blue European Union flag." },
      { file: "bookshelves-and-bags.webp", alt: "Bookshelves against a white wall with colorful bags on the floor." },
    ],
  },
  ship: {
    questions: ["Whose freedom are we fighting for?", "Who gets left behind?"],
    images: [
      { file: "blue-skirt-leopard-print-flats.webp", alt: "Lower legs beneath a blue skirt, wearing leopard-print flats on a light floor." },
      { file: "green-skirt-brown-loafers.webp", alt: "Lower legs beneath a green skirt, wearing brown loafers on a paved sidewalk." },
      { file: "dark-trousers-black-shoes.webp", alt: "Lower half of a person in dark trousers and black dress shoes against a white wall." },
      { file: "white-skirt-patterned-flats.webp", alt: "Lower legs beneath a white skirt, wearing patterned flats on a paved plaza." },
      { file: "white-trousers-sneakers.webp", alt: "White trousers and sneakers in front of a wall with blue graffiti." },
    ],
  },
}

type AgainCardKey = keyof typeof AGAIN_CARDS
type AgainImage = (typeof AGAIN_CARDS)[AgainCardKey]["images"][number]

export function againCardLabel(cardKey: AgainCardKey) {
  return `Open Again — ${AGAIN_CARDS[cardKey].questions.join(" ")}`
}

function AgainFrameImage({ images, reducedMotion, isCenter }: {
  images: AgainImage[]
  reducedMotion: boolean
  isCenter: boolean
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion || images.length < 2) return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, 900)

    return () => window.clearInterval(timer)
  }, [images, reducedMotion])

  const image = images[reducedMotion ? 0 : index]

  return (
    <Image
      src={assetPath(`/images/again/${image.file}`)}
      alt={image.alt}
      fill
      loading="eager"
      className={isCenter ? "object-contain" : "object-cover object-center"}
    />
  )
}

interface AgainFrameContentProps {
  cardKey: AgainCardKey
  active: boolean
  fontSize: number
  reducedMotion: boolean
}

export function AgainFrameContent({ cardKey, active, fontSize, reducedMotion }: AgainFrameContentProps) {
  const { questions, images } = AGAIN_CARDS[cardKey]
  const isCenter = cardKey === "shape"
  const isLeft = cardKey === "understand"
  const visibleQuestions = active || isCenter ? questions : questions.slice(-1)

  return (
    <div className={`absolute inset-0 select-none ${active && isCenter ? "flex flex-col bg-black" : ""}`}>
      {active && (
        <div className={isCenter ? "relative min-h-0 flex-1" : "absolute inset-0"}>
          <AgainFrameImage images={images} reducedMotion={reducedMotion} isCenter={isCenter} />
        </div>
      )}
      <div
        className={[
          "flex max-w-full flex-col font-mono font-medium leading-[1.4]",
          isLeft ? "items-start" : "items-end text-right",
          active && isCenter ? "" : "absolute bottom-0",
          isLeft ? "left-0" : "right-0",
          !active && cardKey === "ship" ? "max-md:top-0 max-md:bottom-auto" : "",
        ].join(" ")}
        style={{ fontSize }}
      >
        {visibleQuestions.map((question) => (
          <span key={question} className={active ? "bg-black px-1 py-0.5 text-white" : "px-[3px] py-0.5 text-ink"}>
            {question}
          </span>
        ))}
      </div>
    </div>
  )
}
