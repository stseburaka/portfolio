"use client"

import { usePathname } from "next/navigation"
import { SiteLogo } from "@/components/layout/SiteLogo"
import { siteConfig } from "@/content/config"
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility"

export function Header() {
  const pathname = usePathname()
  const visible = useHeaderVisibility()

  if (pathname === "/" || pathname === "/a") return null
  const isArt = pathname.startsWith("/a/")

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
      <SiteLogo
        href={isArt ? "/a" : "/"}
        label={isArt ? "Art home" : "Home"}
        className="header-logo relative flex shrink-0 items-center bg-ink"
      />

      <nav className="flex-1 flex items-center justify-end px-6" aria-label="Main navigation">
        <a
          href={isArt ? siteConfig.instagram : siteConfig.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[18px] text-ink leading-none tracking-[-0.02em] hover:opacity-60 transition-opacity"
        >
          {isArt ? "Instagram" : "LinkedIn"}
        </a>
      </nav>
    </header>
  )
}
