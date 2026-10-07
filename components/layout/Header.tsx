"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/content/config"
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility"

export function Header() {
  const pathname = usePathname()
  const visible = useHeaderVisibility()

  if (pathname === "/") return null

  return (
    <header
      className={[
        "sticky top-0 md:fixed md:top-0 md:left-0 md:right-0 z-50 w-full",
        "flex h-[56px]",
        // Hide by transforming up — only applied at md+ via arbitrary class
        !visible ? "md:[transform:translateY(-100%)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        transition: "transform 250ms ease-in-out",
        backgroundColor: "#e9e9e9",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Link
        href="/"
        className="logo-link bg-ink flex items-center px-4 shrink-0 relative"
        aria-label="Home"
      >
        <span
          className="logo-a text-surface font-semibold text-[42px] leading-none tracking-[-0.06em] select-none whitespace-nowrap"
          aria-hidden="true"
        >
          A.
        </span>
        <span
          className="logo-andrei text-surface font-semibold text-[42px] leading-none tracking-[-0.06em] select-none whitespace-nowrap"
          aria-hidden="true"
        >
          Andrei.
        </span>
      </Link>

      <nav className="flex-1 flex items-center justify-end px-6" aria-label="Main navigation">
        <a
          href={siteConfig.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[18px] text-ink leading-none tracking-[-0.02em] hover:opacity-60 transition-opacity"
        >
          LinkedIn
        </a>
      </nav>
    </header>
  )
}
