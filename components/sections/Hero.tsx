export function Hero() {
  return (
    <section className="min-h-[calc(100svh-56px)] grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-10 py-12 md:py-16">
      {/* Left column: intro + placeholder */}
      <div className="flex flex-col gap-8">
        <p className="text-[20px] leading-[1.4] tracking-[-0.02em] text-ink max-w-[423px]">
          11+ years designing B2B software. Currently at PandaDoc in Berlin.
          Previously at Sberbank. Red Dot Award winner.
        </p>

        {/* Icons placeholder */}
        <div className="flex-1 min-h-[280px] rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
          <p className="text-[12px] text-ink-3">Tool composition · coming soon</p>
        </div>
      </div>

      {/* Right column: heading at bottom */}
      <div className="flex flex-col justify-end">
        <h1 className="text-[56px] md:text-[72px] font-medium leading-none tracking-[-0.06em] text-ink text-right">
          I design and ship complex products
        </h1>
      </div>
    </section>
  )
}
