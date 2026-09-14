export interface AboutPhoto {
  src: string
  order: number
  /** Resting-pose offset from stack center, in px. */
  restX: number
  restY: number
  /** Resting-pose rotation, in degrees. */
  restRotation: number
  /** Direction this photo swipes on its way out. `null` = never swipes (final card). */
  swipeDirection: "left" | "right" | null
  /** Natural width / height, used so the stack never crops or distorts a frame. */
  aspectRatio: number
}

export const aboutPhotos: AboutPhoto[] = [
  { src: "/images/about/01.webp", order: 1, restX: -10, restY: 6, restRotation: -6, swipeDirection: "left", aspectRatio: 1.5 },
  { src: "/images/about/02.webp", order: 2, restX: 14, restY: -8, restRotation: 8, swipeDirection: "right", aspectRatio: 1.5 },
  { src: "/images/about/03.webp", order: 3, restX: -18, restY: 4, restRotation: -10, swipeDirection: "left", aspectRatio: 1 },
  { src: "/images/about/04.webp", order: 4, restX: 10, restY: 10, restRotation: 5, swipeDirection: "left", aspectRatio: 1.5 },
  { src: "/images/about/05.webp", order: 5, restX: 16, restY: -12, restRotation: -4, swipeDirection: "right", aspectRatio: 1.503 },
  { src: "/images/about/06.webp", order: 6, restX: -14, restY: 8, restRotation: 11, swipeDirection: "right", aspectRatio: 1.5 },
  { src: "/images/about/07.webp", order: 7, restX: 6, restY: -6, restRotation: -8, swipeDirection: null, aspectRatio: 1 },
]
