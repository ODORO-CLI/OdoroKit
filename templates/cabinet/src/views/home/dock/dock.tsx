import { useEffect, useState } from "react";

import { Spring } from "@/components/animation/springs/spring";
import { CloseIcon, LogoMark, MenuIcon } from "@/components/ui/icons";
import type { DockContent } from "@/data/mocks/home";
import { useSceneStore } from "@/hooks/scene/use-scene-store";
import { DOCK_TOGGLE } from "@/lib/springs/presets";

export interface DockProps {
  content: DockContent;
}

const MENU_ID = "dock-menu";

/**
 * The floating glass bar held at the bottom of every screen until the footer
 * starts to show. The source's menu button opened nothing; here it opens the
 * page's section links, so the one control in the bar does what it says.
 */
export const Dock = ({ content }: DockProps) => {
  const hidden = useSceneStore((state) => state.dockHidden);
  const [open, setOpen] = useState(false);
  const menuOpen = open && !hidden;

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="o-pointer-events-none o-fixed o-inset-x-0 o-bottom-10 cb-z-100 o-flex o-justify-center max-md:o-bottom-6">
      <Spring
        tag="nav"
        aria-label={content.navLabel}
        enabled={hidden}
        from={{ opacity: 1, y: 0 }}
        to={{ opacity: 0, y: 40 }}
        config={DOCK_TOGGLE}
        inert={hidden}
        className={`o-relative ${hidden ? "" : "o-pointer-events-auto"}`}
      >
        <Spring
          tag="ul"
          id={MENU_ID}
          enabled={menuOpen}
          from={{ opacity: 0, y: 12 }}
          to={{ opacity: 1, y: 0 }}
          config={DOCK_TOGGLE}
          inert={!menuOpen}
          className={`o-absolute o-inset-x-0 o-bottom-full o-mb-2 o-flex o-flex-col o-gap-3 o-border-w-1 cb-border-foreground-10 cb-bg-surface-glass-85 o-p-5 o-backdrop-blur-2xl ${menuOpen ? "" : "o-pointer-events-none"}`}
        >
          {content.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="cb-text-lead o-font-medium o-uppercase cb-tracking-copy o-transition-opacity cb-duration-var-duration-fast cb-ease-glide hover:o-opacity-70 cb-focus-visible-outline-1 cb-focus-visible-outline-offset-4 cb-focus-visible-outline-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </Spring>

        <div className="o-flex o-h-16 cb-w-90 o-items-center o-justify-between o-border-w-1 cb-border-foreground-10 cb-bg-surface-glass-85 o-px-5 o-backdrop-blur-2xl cb-transition-background-color-border-color-translate cb-duration-var-duration-normal cb-ease-glide cb-hover-translate-y-0-5 cb-hover-border-foreground-22 cb-hover-bg-surface-glass-raised-95 cb-max-sm-w-70">
          <a
            href={content.links[0]?.href ?? "#top"}
            aria-label={content.homeLabel}
            className="o-transition-opacity cb-duration-var-duration-fast cb-ease-glide hover:o-opacity-80 cb-focus-visible-outline-1 cb-focus-visible-outline-offset-4 cb-focus-visible-outline-foreground"
          >
            <LogoMark className="cb-size-6-5" />
          </a>
          <span className="cb-text-caption o-uppercase cb-leading-display cb-tracking-caps-wide">
            {content.title}
          </span>
          <button
            type="button"
            aria-label={menuOpen ? content.closeLabel : content.openLabel}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            onClick={() => setOpen((current) => !current)}
            className="o-transition-opacity cb-duration-var-duration-fast cb-ease-glide hover:o-opacity-80 cb-focus-visible-outline-1 cb-focus-visible-outline-offset-4 cb-focus-visible-outline-foreground"
          >
            {menuOpen ? <CloseIcon className="cb-size-5-5" /> : <MenuIcon className="cb-size-5-5" />}
          </button>
        </div>
      </Spring>
    </div>
  );
};
