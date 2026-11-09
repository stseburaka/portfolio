"use client"

import Image from "next/image"
import { useSyncExternalStore } from "react"
import { assetPath } from "@/lib/paths"

const PLAY_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)"
const poster = assetPath("/videos/again/again-collage-poster.webp")

function subscribeToPlayback(callback: () => void) {
  const media = window.matchMedia(PLAY_QUERY)
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

function canPlay() {
  return window.matchMedia(PLAY_QUERY).matches
}

export function AgainCollage() {
  const shouldPlay = useSyncExternalStore(subscribeToPlayback, canPlay, () => false)

  if (!shouldPlay) {
    return <Image src={poster} alt="" fill className="object-cover" />
  }

  return (
    <video
      aria-hidden="true"
      className="absolute inset-0 size-full object-cover"
      src={assetPath("/videos/again/again-collage.webm")}
      poster={poster}
      preload="none"
      autoPlay
      muted
      loop
      playsInline
    />
  )
}
