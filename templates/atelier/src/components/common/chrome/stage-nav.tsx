// 📖 Docs: obsidian/frontend/components/common.md
/**
 * The pill of section links and the call to action beside it.
 *
 * One object in the design, in the same place on every screen it crosses, so
 * it is one component here rather than a copy per section.
 *
 * `pointer-events-auto` on both children: the layer that holds them is
 * `pointer-events-none` so the page underneath keeps the pointer, and only what
 * is clickable takes it back.
 *
 * **On a phone the links fold into a disc.** Side by side the pill and the
 * action want more width than the screen has, and these are the only
 * navigation the page has once the header is gone. The disc and the action sit
 * in a row, and the links come out of the disc when it is asked.
 */

import { useEffect, useId, useState } from "react";

import { Spring } from "@/components/animation/springs/spring";
import { scrollTo } from "@/utils/scroll-to";

export interface StageNavContent {
  /** The pill of section links; each scrolls to `#<label, lowercased>`. */
  links: readonly string[];
  /** The call to action beside them. */
  action: { label: string; href: string };
}

const linkTarget = (label: string) => label.toLowerCase();

/** The three lines. Spans rather than an SVG: it is three rectangles. */
const BurgerLines = () => (
  <span aria-hidden="true" className="o-flex o-w-1/3 o-flex-col at-gap-0-22rem">
    <span className="o-block o-h-px o-w-full at-bg-foreground" />
    <span className="o-block o-h-px o-w-full at-bg-foreground" />
    <span className="o-block o-h-px o-w-full at-bg-foreground" />
  </span>
);

export const StageNav = ({ content }: { content: StageNavContent }) => {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    setOpen(false);
    scrollTo(target);
  };

  return (
    <div className="o-relative o-flex o-items-center at-gap-0-1389vw at-stacked-gap-3">
      {/* The wide window's pill: every link in a row, always open. */}
      <nav
        data-nav-shell
        aria-label="Sections"
        className="o-pointer-events-auto o-flex at-h-frame-control o-items-center at-gap-max-12px-2-2222vw o-rounded-full o-border-w-1 at-border-line-10 at-bg-background at-px-max-16px-3-3333vw at-font-serif at-text-frame-nav at-leading-none at-text-foreground at-stacked-hidden"
      >
        {content.links.map((label) => (
          <a
            key={label}
            data-nav-item
            href={`#${linkTarget(label)}`}
            onClick={(event) => go(event, linkTarget(label))}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* The phone's disc — `data-nav-shell` like the plates it stands in for,
          so it arrives with them. */}
      <button
        type="button"
        data-nav-shell
        data-nav-item
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((value) => !value)}
        className="o-pointer-events-auto o-hidden at-size-frame-control o-shrink-0 o-items-center o-justify-center o-rounded-full o-border-w-1 at-border-line-10 at-bg-background at-stacked-flex"
      >
        <BurgerLines />
      </button>

      {open ? (
        <Spring
          tag="div"
          mode="once"
          from={{ opacity: 0, y: 12 }}
          to={{ opacity: 1, y: 0 }}
          className="o-pointer-events-auto o-absolute at-bottom-calc-100-0-75rem o-left-0 o-z-10 o-hidden at-stacked-block"
        >
          <nav
            id={menuId}
            aria-label="Sections"
            className="o-flex o-flex-col o-gap-1 o-rounded-3xl o-border-w-1 at-border-line-10 at-bg-background o-px-6 o-py-4 at-font-serif at-text-frame-nav at-leading-none at-text-foreground"
          >
            {content.links.map((label) => (
              <a
                key={label}
                href={`#${linkTarget(label)}`}
                onClick={(event) => go(event, linkTarget(label))}
                className="o-py-2"
              >
                {label}
              </a>
            ))}
          </nav>
        </Spring>
      ) : null}

      <a
        data-nav-item
        data-nav-shell
        data-nav-from-left
        href={content.action.href}
        onClick={(event) => go(event, content.action.href.replace(/^#/, ""))}
        className="o-pointer-events-auto o-flex at-h-frame-control o-items-center o-justify-center o-rounded-full at-bg-accent at-px-max-24px-3-3333vw at-font-serif at-text-frame-nav at-leading-none at-text-accent-foreground o-transition-opacity at-duration-var-duration-fast at-ease-entrance hover:o-opacity-90 at-stacked-flex-1"
      >
        {content.action.label}
      </a>
    </div>
  );
};
