"use client"

import { usePathname } from "next/navigation"
import { Container } from "@/components/layout/Container"
import { siteConfig } from "@/content/config"

export function Footer() {
  const pathname = usePathname()

  if ((pathname === "/" || pathname === "/a") && !siteConfig.showFooterOnHome) return null

  return (
    <footer className="border-t border-border py-6">
      <Container>
        <div className="flex items-center justify-between gap-4 text-[12px] text-ink-3">
          <span>{siteConfig.name}</span>
          <span className="text-right">{siteConfig.location} · {siteConfig.year}</span>
        </div>
      </Container>
    </footer>
  )
}
