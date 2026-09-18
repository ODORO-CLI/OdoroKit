// 📖 Docs: obsidian/frontend/components/common.md
/**
 * The page chrome: the header for the first screen, and the floating pill
 * that takes over from it for the middle of the page.
 *
 * **Both are driven by one reading of the scroll per frame**, on the shared
 * ticker, and both paint straight to the DOM through bare `SpringValue`s —
 * scrolling must never re-render the tree. The header is up while the first
 * screen is; the pill is up from there until the closing screen has climbed
 * half-way into view (it carries a pill of its own); over the accent footer
 * neither is, so black type never sits on the blue plane.
 *
 * The pill's arrival is deliberately not a fade. Each plate opens **out of a
 * disc** — the links leftwards, the action rightwards — with the labels
 * resolving behind them. Done with `clip-path` rather than a scale so the
 * rounded ends stay round and the type is never stretched.
 *
 * Nothing shows before the curtain has released the page.
 */

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import { useCallback, useEffect, useRef } from "react";

import { usePreloader } from "@/hooks/preloader/use-preloader";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { chromeConfig } from "@/lib/chrome/chrome.config";
import { scrollTo } from "@/utils/scroll-to";

import { StageNav, type StageNavContent } from "./stage-nav";

const { header: headerConfig, pill: pillConfig } = chromeConfig;

export interface HeaderContent {
  brand: string;
  links: readonly { label: string; href: string }[];
  cart: { label: string; href: string };
}

export interface SiteChromeProps {
  header: HeaderContent;
  pill: StageNavContent;
  /**
   * Ids of the sections the pill stays away from while they own the foot of
   * the screen: those with controls of their own there, and the accent footer.
   */
  quietIds: readonly string[];
  /** A crawler gets no curtain, so nothing would ever release the chrome. */
  released?: boolean;
}

export const SiteChrome = ({
  header,
  pill,
  quietIds,
  released: forceReleased = false,
}: SiteChromeProps) => {
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const released = usePreloader((state) => state.released) || forceReleased;

  const headerShown = useRef<SpringValue<number> | null>(null);
  const pillShown = useRef<SpringValue<number> | null>(null);
  headerShown.current ??= new SpringValue(0);
  pillShown.current ??= new SpringValue(0);
  /** What each is currently asked to be, so a spring is not restarted per frame. */
  const headerUp = useRef(false);
  const pillUp = useRef(false);

  const paintHeader = useCallback((value: number) => {
    const node = headerRef.current;
    if (!node) return;
    node.style.opacity = String(value);
    node.style.transform = `translate3d(0, ${(1 - value) * -headerConfig.lift}px, 0)`;
    node.style.visibility = value <= 0.001 ? "hidden" : "visible";
  }, []);

  const paintPill = useCallback((value: number) => {
    const bar = barRef.current;
    if (!bar) return;
    // Opacity as well as the clip: the clip's floor is a **disc** the height
    // of the bar, so a value near zero still draws two circles. They fade too.
    bar.style.opacity = String(value);
    bar.style.visibility = value <= 0.001 ? "hidden" : "visible";

    const shells = bar.querySelectorAll<HTMLElement>("[data-nav-shell]");
    shells.forEach((shell) => {
      const width = shell.offsetWidth;
      const height = shell.offsetHeight;
      if (!width || !height) return;
      const hidden = Math.max(0, (1 - value) * (width - height));
      const radius = height / 2;
      // The action opens the other way, so the two grow apart from the middle
      // of the screen rather than both travelling the same direction.
      shell.style.clipPath =
        shell.dataset.navFromLeft === undefined
          ? `inset(0 0 0 ${hidden}px round ${radius}px)`
          : `inset(0 ${hidden}px 0 0 round ${radius}px)`;
    });

    const items = bar.querySelectorAll<HTMLElement>("[data-nav-item]");
    items.forEach((item, index) => {
      const offset = index * pillConfig.itemStagger;
      const own = Math.max(0.0001, 1 - offset);
      const t = Math.min(1, Math.max(0, (value - offset) / own));
      item.style.opacity = String(t * t * (3 - 2 * t));
    });
  }, []);

  useEffect(() => {
    paintHeader(0);
    paintPill(0);
  }, [paintHeader, paintPill]);

  useEffect(() => {
    if (!released) return;
    const quiet = quietIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    const read = () => {
      const viewport = window.innerHeight;
      const scrolled = window.scrollY;
      const pastFirst = scrolled >= viewport * pillConfig.showAfterViewports;
      const atQuiet = quiet.some((node) => {
        const rect = node.getBoundingClientRect();
        return (
          rect.top < viewport * pillConfig.quietFromTop &&
          rect.bottom > viewport * pillConfig.quietUntilBottom
        );
      });

      const wantHeader = !pastFirst;
      if (wantHeader !== headerUp.current) {
        headerUp.current = wantHeader;
        void headerShown.current?.start({
          to: wantHeader ? 1 : 0,
          config: wantHeader ? headerConfig.enter : headerConfig.leave,
          delay: wantHeader && scrolled === 0 ? headerConfig.delay : 0,
          onChange: (result: AnimationResult<SpringValue<number>>) =>
            paintHeader(result.value),
        });
      }

      const wantPill = pastFirst && !atQuiet;
      if (wantPill !== pillUp.current) {
        pillUp.current = wantPill;
        void pillShown.current?.start({
          to: wantPill ? 1 : 0,
          config: wantPill ? pillConfig.enter : pillConfig.leave,
          onChange: (result: AnimationResult<SpringValue<number>>) =>
            paintPill(result.value),
        });
      }
    };

    // Once per frame is plenty for two booleans; the springs do the motion.
    const unsubscribe = subscribeToTicker(read, () => 32);
    return () => {
      unsubscribe();
      headerShown.current?.stop();
      pillShown.current?.stop();
    };
  }, [released, quietIds, paintHeader, paintPill]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    event.preventDefault();
    scrollTo(href.slice(1));
  };

  return (
    <>
      <header
        ref={headerRef}
        className="o-fixed o-inset-x-0 o-top-0 o-z-40 o-flex o-items-center o-justify-between at-px-frame-gutter at-py-max-18px-1-4vw o-will-change-transform"
      >
        <a
          href="#hero"
          onClick={(event) => go(event, "#hero")}
          aria-label={`${header.brand} — haut de page`}
          className="at-font-display at-text-1-75rem at-leading-none at-tracking-0-03em at-text-foreground"
        >
          {header.brand}
        </a>
        <nav
          aria-label="Navigation principale"
          className="o-flex at-gap-max-18px-2-2vw at-stacked-hidden"
        >
          {header.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => go(event, link.href)}
              className="at-font-sans at-text-frame-caption o-uppercase at-tracking-0-2em at-text-foreground-muted o-transition-opacity at-duration-var-duration-fast at-ease-entrance hover:o-opacity-60"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href={header.cart.href}
          onClick={(event) => go(event, header.cart.href)}
          className="at-font-sans at-text-frame-caption o-uppercase at-tracking-0-2em at-text-foreground o-transition-opacity at-duration-var-duration-fast at-ease-entrance hover:o-opacity-60"
        >
          {header.cart.label}
        </a>
      </header>

      <div
        ref={barRef}
        className="o-pointer-events-none o-fixed o-inset-x-0 at-bottom-frame-gutter o-z-30 o-flex o-justify-center at-px-frame-gutter"
      >
        <StageNav content={pill} />
      </div>
    </>
  );
};
