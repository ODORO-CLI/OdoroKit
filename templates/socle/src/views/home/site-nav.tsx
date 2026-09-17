import { useEffect, useState } from "react";

import { Spring } from "@/components/animation/springs/spring";
import { BrandMark } from "@/components/ui/icons/brand-mark";
import { revealConfig, revealConfigSnappy } from "@/lib/springs/reveal";
import type { NavLink } from "@/data/mocks/home";

/** Figma "Frame 2147225002" (1469:1380) — floats over the hero, centred. */
export interface SiteNavProps {
  links: readonly NavLink[];
  cta: { label: string; href: string };
}

const linkClass =
  "text-trim-body o-whitespace-nowrap sn-text-body o-font-light sn-leading-body sn-text-foreground " +
  "o-transition-opacity sn-duration-var-duration-fast sn-ease-entrance hover:o-opacity-60 " +
  "sn-focus-visible-outline-2 sn-focus-visible-outline-offset-4 sn-focus-visible-outline-foreground";

export const SiteNav = ({ links, cta }: SiteNavProps) => {
  const [open, setOpen] = useState(false);

  // A hash link inside the panel should close it, and so should Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Spring
      tag="header"
      mode="once"
      from={{ opacity: 0, y: -16 }}
      to={{ opacity: 1, y: 0 }}
      config={revealConfig}
      delayIn={200}
      // Fixed, so it stays put through the whole page. Lenis drives native window
      // scroll (no transformed wrapper), so `fixed` behaves normally under it —
      // see obsidian/frontend/smooth-scroll.md.
      className="o-fixed o-left-1/2 o-top-3 o-z-50 sn-w-calc-100-1-5rem sn-translate-x-1-2 sn-lg-w-auto"
    >
      <nav
        aria-label="Navigation principale"
        className="o-flex o-items-center o-justify-between o-gap-4 sn-rounded-button sn-bg-surface-nav o-p-1 sn-backdrop-blur-nav sn-lg-justify-start sn-lg-gap-10"
      >
        <a
          href="/"
          aria-label="ODORO — accueil"
          className="o-flex o-size-11 o-shrink-0 o-items-center o-justify-center sn-rounded-control sn-bg-action-secondary o-transition-transform sn-duration-var-duration-fast sn-ease-entrance hover:o-scale-105 sn-focus-visible-outline-2 sn-focus-visible-outline-offset-2 sn-focus-visible-outline-foreground"
        >
          <BrandMark className="o-w-5 sn-text-brand-mark" />
        </a>

        <ul className="o-hidden o-items-center o-gap-8 sn-lg-flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClass}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={cta.href}
          className="o-hidden o-h-11 o-items-center o-gap-2 sn-rounded-control sn-bg-action-secondary o-px-5 o-py-3 o-transition-transform sn-duration-var-duration-fast sn-ease-entrance sn-hover-scale-1-03 sn-focus-visible-outline-2 sn-focus-visible-outline-offset-2 sn-focus-visible-outline-foreground sn-lg-flex"
        >
          <span aria-hidden="true" className="o-size-2 o-shrink-0 o-rounded-full sn-bg-foreground" />
          <span className="text-trim-body o-whitespace-nowrap sn-text-body o-font-medium sn-leading-body sn-text-foreground">
            {cta.label}
          </span>
        </a>

        {/* Burger — the only control below the breakpoint. */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="site-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          className="o-flex o-size-11 o-shrink-0 o-flex-col o-items-center o-justify-center o-gap-1.5 sn-rounded-control sn-bg-action-secondary sn-focus-visible-outline-2 sn-focus-visible-outline-offset-2 sn-focus-visible-outline-foreground sn-lg-hidden"
        >
          <span
            className={`o-h-px o-w-5 sn-bg-foreground o-transition-transform sn-duration-var-duration-fast sn-ease-entrance ${
              open ? "sn-translate-y-3-5px o-rotate-45" : ""
            }`}
          />
          <span
            className={`o-h-px o-w-5 sn-bg-foreground o-transition-transform sn-duration-var-duration-fast sn-ease-entrance ${
              open ? "sn-translate-y-3-5px sn-rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <Spring
        tag="div"
        id="site-nav-panel"
        enabled={open}
        mode="always"
        from={{ opacity: 0, y: -8 }}
        to={{ opacity: 1, y: 0 }}
        config={revealConfigSnappy}
        className={`o-mt-2 o-overflow-hidden sn-rounded-button sn-bg-surface-nav sn-backdrop-blur-nav sn-lg-hidden ${
          open ? "" : "o-pointer-events-none"
        }`}
        aria-hidden={open ? undefined : true}
      >
        <ul className="o-flex o-flex-col o-gap-5 o-p-6">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClass} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={cta.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="o-flex o-items-center o-gap-2"
            >
              <span aria-hidden="true" className="o-size-2 o-shrink-0 o-rounded-full sn-bg-foreground" />
              <span className="text-trim-body sn-text-body o-font-medium sn-leading-body sn-text-foreground">
                {cta.label}
              </span>
            </a>
          </li>
        </ul>
      </Spring>
    </Spring>
  );
};
