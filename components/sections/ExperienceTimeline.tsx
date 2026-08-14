import { SectionLabel } from "@/components/ui/SectionLabel"

const periods = [
  { label: "2012–2015", name: "Early days" },
  { label: "2015–2018", name: "Fintech" },
  { label: "2018–2021", name: "Sberbank" },
  { label: "2021–now", name: "PandaDoc" },
]

export function ExperienceTimeline() {
  return (
    <section className="py-16">
      <SectionLabel withBorder>EXPERIENCE TIMELINE</SectionLabel>

      {/* Dark strip with photo placeholders */}
      <div className="mt-10 rounded-2xl bg-[#1a1a1a] overflow-hidden">
        <div className="flex items-center justify-center gap-0 py-12 px-8">
          {periods.map((period, i) => (
            <div
              key={period.label}
              className="relative flex-shrink-0"
              style={{
                marginLeft: i === 0 ? 0 : -32,
                zIndex: periods.length - i,
              }}
            >
              {/* Photo placeholder */}
              <div
                className="w-[140px] h-[180px] rounded-xl bg-[#2a2a2a] border-2 border-[#1a1a1a] flex flex-col items-center justify-end p-3"
                style={{
                  transform: `rotate(${(i - 1.5) * 2.5}deg)`,
                }}
              >
                <div className="w-full h-full absolute inset-0 rounded-xl bg-[#333] flex items-center justify-center">
                  <span className="text-[10px] text-[#555]">Photo</span>
                </div>
                <div className="relative z-10 text-center">
                  <p className="text-[10px] text-white/60">{period.label}</p>
                  <p className="text-[11px] font-medium text-white/80">{period.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
