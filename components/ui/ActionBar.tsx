import Link from "next/link"

function IconArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L19 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconExternal() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 17V7H7M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface ActionBarProps {
  label: string
  href: string
  icon: "arrow" | "external"
  external?: boolean
  className?: string
}

export function ActionBar({ label, href, icon, external, className = "" }: ActionBarProps) {
  const cls = [
    "bg-ink text-surface h-[64px] flex items-center justify-between px-4",
    "hover:bg-[#fe7141] hover:text-ink",
    "motion-safe:transition-[background-color,color] motion-safe:duration-150 motion-safe:ease-in-out",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe7141]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const inner = (
    <>
      <span className="text-[18px] font-medium tracking-[-0.02em] leading-none">{label}</span>
      {icon === "external" ? <IconExternal /> : <IconArrow />}
    </>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  )
}
