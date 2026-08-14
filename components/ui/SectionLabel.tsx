import { ReactNode } from "react"

interface SectionLabelProps {
  children: ReactNode
  withBorder?: boolean
  className?: string
}

export function SectionLabel({ children, withBorder = false, className = "" }: SectionLabelProps) {
  return (
    <div className={withBorder ? `border-t border-border pt-5 ${className}` : className}>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3">
        {children}
      </p>
    </div>
  )
}
