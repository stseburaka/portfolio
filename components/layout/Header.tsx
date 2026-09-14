"use client"

import Link from "next/link"
import { siteConfig } from "@/content/config"
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility"

const navLinks = [
  ...(siteConfig.showPlaygroundSection
    ? [{ label: "Playground", href: "/playground", external: false }]
    : []),
  { label: "LinkedIn", href: siteConfig.linkedIn, external: true },
]

export function Header() {
  const visible = useHeaderVisibility()

  return (
    <header
      className={[
        // Mobile: sticky; Desktop: fixed and positioned
        "sticky top-0 md:fixed md:top-0 md:left-0 md:right-0 z-50 w-full",
        "flex flex-col md:flex-row md:h-[56px]",
        // Hide by transforming up — only applied at md+ via arbitrary class
        !visible ? "md:[transform:translateY(-100%)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transition: "transform 250ms ease-in-out" }}
    >
      {/*
        Mobile: flex row (Row 1) — logo left, nav right, 56px tall.
        Desktop (md+): display:contents — this div dissolves, children join
        the header's flex row directly and are ordered via md:order-*.
      */}
      <div className="flex h-[56px] md:contents">
        {/* Logo: black band — expands to "Andrei." on hover (hover-capable devices only) */}
        <Link
          href="/"
          className="logo-link bg-ink flex items-center px-4 shrink-0 md:order-1 relative"
          aria-label="Home"
        >
          {/* "A." — in flow on touch, absolute overlay on hover-capable devices */}
          <span
            className="logo-a text-surface font-semibold text-[42px] leading-none tracking-[-0.06em] select-none whitespace-nowrap"
            aria-hidden="true"
          >
            A.
          </span>
          {/* "Andrei." — in flow on hover-capable devices, hidden otherwise */}
          <span
            className="logo-andrei text-surface font-semibold text-[42px] leading-none tracking-[-0.06em] select-none whitespace-nowrap"
            aria-hidden="true"
          >
            Andrei.
          </span>
        </Link>

        {/* Nav: white band — flex-1 fills row on mobile, takes remaining width on desktop */}
        <nav className="bg-surface flex-1 flex items-center justify-end px-6 md:order-3" aria-label="Main navigation">
          <ul className="flex items-center gap-8 list-none m-0 p-0">
            {navLinks.map((link) =>
              link.external ? (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[18px] text-ink leading-none tracking-[-0.02em] hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </a>
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-medium text-[18px] text-ink leading-none tracking-[-0.02em] hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>

      {/*
        Tagline:
        Mobile (Row 2): full viewport width, text-left, auto height with py-3.
        Desktop (md+): white, natural width, text-left, between logo and nav.
      */}
      <div className="bg-surface flex items-center px-4 py-3 md:order-2 md:px-6 md:py-0">
        <span className="font-medium text-[18px] text-ink leading-[1.4] tracking-[-0.02em] md:leading-none md:whitespace-nowrap">
          {siteConfig.tagline}
        </span>
      </div>
    </header>
  )
}
