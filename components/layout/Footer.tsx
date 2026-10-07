"use client"

import { usePathname } from "next/navigation"
import { Container } from "@/components/layout/Container"
import { siteConfig } from "@/content/config"

export function Footer() {
  const pathname = usePathname()

  if (pathname === "/" && !siteConfig.showFooterOnHome) return null

  return (
    <footer className="border-t border-border py-6">
      <Container>
        <div className="flex items-center justify-between text-[12px] text-ink-3">
          <span>{siteConfig.name}</span>
          <span>{siteConfig.location}</span>
          <span>{siteConfig.year}</span>
        </div>
      </Container>
    </footer>
  )
}
