import { useEffect, useState } from "react";

import { ScrambleText } from "@/components/ui/scramble-text";

import type { HeroImage, HeroLink, HeroNavItem } from "./hero.types";

export interface HeroMenuProps {
  logo: HeroImage;
  nav: HeroNavItem[];
  cart: HeroLink;
  /** The logo's own box, so the panel's copy sits exactly over the page's. */
  logoClassName: string;
}

const FOCUS_RING =
  "pf-focus-visible-outline-2 pf-focus-visible-outline-offset-2 pf-focus-visible-outline-hero-content";

const TRANSITION = "o-transition pf-duration-var-duration-fast pf-ease-entrance";

/**
 * The burger, and the panel it opens — below the frame breakpoint only.
 *
 * **The frame's header does not survive a narrow screen.** It centres four nav
 * items on the canvas with the logo and the cart against the margins; wrapped
 * into flow that became a second row of four labels squeezed edge to edge, with
 * a hover submenu that a finger cannot reach. So below `lg` the row collapses
 * to the logo and this control, and everything it carried moves into a panel.
 *
 * **The panel draws its own header rather than sitting under the page's.**
 * Measuring the sticky band and offsetting by it would tie this component to
 * another one's padding; covering the screen and repeating the logo in the same
 * box cannot drift. The burger becomes the close control in place, so the thing
 * that opened the panel is the thing that shuts it.
 *
 * The submenu is listed open. It is a disclosure on desktop because hover has
 * somewhere to put it; here there is room on the screen, and a second tap to
 * reach four links is a cost with nothing bought.
 */
export const HeroMenu = ({ logo, nav, cart, logoClassName }: HeroMenuProps) => {
  const [open, setOpen] = useState(false);

  // The page behind a full-screen panel must not scroll under it. On `html`
  // rather than `body`: the lattice's fixed layers resolve against the
  // viewport, and locking `body` alone leaves the scroll chained to it.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "o-hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const bar = `block h-px w-full bg-hero-content ${TRANSITION}`;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className={`o-relative pf-z-70 o-flex o-h-6 o-w-7 o-shrink-0 o-cursor-pointer o-flex-col o-justify-between o-py-1 tap-area pf--tap-x-0-75rem pf--tap-y-0-75rem ${FOCUS_RING}`}
      >
        <span
          className={`${bar} ${open ? "pf-translate-y-7px o-rotate-45" : ""}`}
        />
        <span className={`${bar} ${open ? "o-opacity-0" : ""}`} />
        <span
          className={`${bar} ${open ? "pf--translate-y-7px pf--rotate-45" : ""}`}
        />
      </button>

      <div
        // Held in the tree so it can fade, and `o-invisible` when shut so nothing
        // inside it is clickable or tab-reachable.
        className={`hero-lattice-panel o-fixed o-inset-0 pf-z-60 o-flex o-flex-col o-px-5 o-pt-5 o-pb-10 ${TRANSITION} ${
          open ? "o-visible o-opacity-100" : "o-invisible o-opacity-0"
        }`}
      >
        <a
          href="/"
          onClick={() => setOpen(false)}
          tabIndex={open ? undefined : -1}
          className={`${logoClassName} ${FOCUS_RING}`}
        >
          <img
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className="o-h-full o-w-full o-object-contain"
          />
        </a>

        <nav aria-label="Primary" className="o-mt-10 o-flex-1 o-overflow-y-auto">
          <ul className="o-flex o-flex-col">
            {nav.map((item) => (
              <li
                key={item.label}
                className="o-border-t pf-border-hero-rule o-py-5 pf-last-border-b"
              >
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? undefined : -1}
                  className={`o-block pf-text-hero-title pf-leading-hero-display pf-text-hero-content ${FOCUS_RING}`}
                >
                  <ScrambleText revealDelay={open ? 0 : undefined}>
                    {item.label}
                  </ScrambleText>
                </a>

                {item.submenu?.length ? (
                  <ul className="o-mt-4 o-flex o-flex-col o-gap-3 o-pl-5">
                    {item.submenu.map((entry) => (
                      <li key={entry.label}>
                        <a
                          href={entry.href}
                          onClick={() => setOpen(false)}
                          tabIndex={open ? undefined : -1}
                          className={`o-block pf-text-hero-body pf-leading-hero-display pf-text-hero-content-muted ${TRANSITION} pf-hover-text-hero-content ${FOCUS_RING}`}
                        >
                          {entry.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={cart.href}
          onClick={() => setOpen(false)}
          tabIndex={open ? undefined : -1}
          className={`o-mt-10 o-flex pf-h-13 o-items-center o-justify-center o-border-w-1 pf-border-hero-content pf-text-hero-body pf-leading-hero-display pf-text-hero-content ${FOCUS_RING}`}
        >
          <ScrambleText revealDelay={open ? 240 : undefined}>
            {cart.label}
          </ScrambleText>
        </a>
      </div>
    </>
  );
};
