interface MetricProps {
  value: string
  label: string
}

export function Metric({ value, label }: MetricProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[28px] font-semibold leading-none tracking-tight text-ink">
        {value}
      </span>
      <span className="text-[13px] text-ink-2">{label}</span>
    </div>
  )
}
