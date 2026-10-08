"use client"

import { useEffect, useRef, useState } from "react"

const BACKSLASH = String.fromCharCode(92)
const BACKTICK = String.fromCharCode(96)
const SPACE = String.fromCharCode(32)

const ANIMALS = [
  String.raw`|\__/,|   (\
|_ _  |.--.) )
( T   )     /
(((^_(((/(((_/`,
  String.raw`   |\__/,|   (\
   |o o  |__ _)
 _.( T   )  ${"`"}  /
((_ ${"`"}^--' /_<  ${"\\"}
${"`"}${"`"} ${"`"}-'(((/  (((/`,
  String.raw`  /\_/\  (
 ( ^.^ ) _)
   ${"\\"}"/  (
 ( | | )
(__d b__)`,
  String.raw` /\_/${BACKSLASH}
((@v@))
():::()
VV-VV`,
  String.raw`  ,_
 >' )
 ( ( ${BACKSLASH}
mrf''|${BACKSLASH}`,
  String.raw`  ${BACKSLASH.repeat(3)}
  (o>
\\_//)
 \_/_)${SPACE}
  _|_`,
  String.raw`^..^      /${BACKSLASH}
/\_/\\_____ /${BACKSLASH}
  /\   /${BACKSLASH}
 /  \ /  ${BACKSLASH}`,
  String.raw` __      _${BACKSLASH}
o'') }____//
  ${BACKTICK}_/      )
 (_(_/-(_/`,
  String.raw` _   _${BACKSLASH}
/(. .)\    )
 (*)_____/|
 /       |
/   |--\ |
(_)(_)  (_)`,
  String.raw`   _____
^..^     \9
(oo)_____/
  WW  WW`,
  String.raw`prs \\_//
  __/".
 /__ |
 || ||`,
  String.raw`  //
('>
/rr${BACKSLASH}
*\))_`,
  String.raw` __QQ
(_) _">
_)      jgs`,
]

const DESKTOP_QUERY = "(min-width: 768px)"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
const CHARACTER_DELAY_MS = 25
const HOLD_DELAY_MS = 5000
const MEASURE_FONT_SIZE = 100
const MAX_FONT_SIZE = 24

type AnimalDimensions = {
  width: number
  height: number
  fontSize: number
}

function shuffleAnimalIndices(previousLastIndex?: number) {
  const order = ANIMALS.map((_, index) => index)

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[order[index], order[randomIndex]] = [order[randomIndex], order[index]]
  }

  if (order.length > 1 && order[0] === previousLastIndex) {
    ;[order[0], order[1]] = [order[1], order[0]]
  }

  return order
}

export function AsciiAnimals() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [drawing, setDrawing] = useState("")
  const [drawingIndex, setDrawingIndex] = useState(0)
  const [animalDimensions, setAnimalDimensions] = useState<AnimalDimensions[]>([])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let cancelled = false

    const measure = () => {
      const available = stage.getBoundingClientRect()
      if (available.width <= 0 || available.height <= 0) return

      const samples = stage.querySelectorAll<HTMLElement>(".ascii-cats-measure pre")
      if (samples.length !== ANIMALS.length) return

      const dimensions = ANIMALS.map((animal, index) => {
        const sample = samples[index].getBoundingClientRect()
        const lines = animal.split("\n")
        const longestLine = Math.max(...lines.map((line) => line.length))
        const lineCount = lines.length
        const fontSize = Math.min(
          MAX_FONT_SIZE,
          (available.width * 0.96 * MEASURE_FONT_SIZE) / sample.width,
          (available.height * 0.96 * MEASURE_FONT_SIZE) / sample.height,
        )
        const scale = fontSize / MEASURE_FONT_SIZE
        const characterWidth = sample.width / longestLine
        const lineHeight = sample.height / lineCount

        return {
          width: characterWidth * longestLine * scale,
          height: lineHeight * lineCount * scale,
          fontSize,
        }
      })

      setAnimalDimensions(dimensions)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    measure()
    document.fonts.ready.then(() => {
      if (!cancelled) measure()
    })

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
    let timeout: ReturnType<typeof setTimeout> | undefined
    let cancelled = false

    const clearTimeoutIfNeeded = () => {
      if (timeout !== undefined) clearTimeout(timeout)
    }

    const start = () => {
      clearTimeoutIfNeeded()

      if (!desktop.matches) {
        setDrawing("")
        return
      }

      let order = shuffleAnimalIndices()
      let orderPosition = 0
      setDrawingIndex(order[orderPosition])

      if (reducedMotion.matches) {
        setDrawing(ANIMALS[order[orderPosition]])
        return
      }

      let characterIndex = 0
      let visibleDrawing = ""
      setDrawing("")

      const drawNextCharacter = () => {
        if (cancelled) return

        const animal = ANIMALS[order[orderPosition]]
        if (characterIndex < animal.length) {
          visibleDrawing += animal[characterIndex]
          characterIndex += 1
          setDrawing(visibleDrawing)
          timeout = setTimeout(drawNextCharacter, CHARACTER_DELAY_MS)
          return
        }

        timeout = setTimeout(() => {
          if (cancelled) return
          setDrawing("")
          if (orderPosition < order.length - 1) {
            orderPosition += 1
          } else {
            const previousLastIndex = order[order.length - 1]
            order = shuffleAnimalIndices(previousLastIndex)
            orderPosition = 0
          }
          setDrawingIndex(order[orderPosition])
          characterIndex = 0
          visibleDrawing = ""
          timeout = setTimeout(drawNextCharacter, CHARACTER_DELAY_MS)
        }, HOLD_DELAY_MS)
      }

      timeout = setTimeout(drawNextCharacter, CHARACTER_DELAY_MS)
    }

    const handlePreferenceChange = () => start()
    start()
    desktop.addEventListener("change", handlePreferenceChange)
    reducedMotion.addEventListener("change", handlePreferenceChange)

    return () => {
      cancelled = true
      clearTimeoutIfNeeded()
      desktop.removeEventListener("change", handlePreferenceChange)
      reducedMotion.removeEventListener("change", handlePreferenceChange)
    }
  }, [])

  const dimensions = animalDimensions[drawingIndex]

  return (
    <div ref={stageRef} className="ascii-cats-stage" aria-hidden="true">
      <div className="ascii-cats-measure">
        {ANIMALS.map((animal, index) => (
          <pre key={index} style={{ fontSize: `${MEASURE_FONT_SIZE}px` }}>
            {animal}
          </pre>
        ))}
      </div>
      {dimensions && (
        <pre
          className="ascii-cats"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            fontSize: `${dimensions.fontSize}px`,
          }}
        >
          {drawing}
        </pre>
      )}
    </div>
  )
}
