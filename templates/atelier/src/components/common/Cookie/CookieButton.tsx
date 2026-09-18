// 📖 Docs: obsidian/frontend/components/common.md
import type { ReactNode } from "react";

/**
 * Cookie-scoped button primitive. Two variants matching the project's
 * white/dark surfaces — replaces the external `SimpleButton` the component
 * shipped with. Hover states snap (the project bans CSS transitions; real
 * motion goes through @react-spring/web).
 */
export interface CookieButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

const base =
  "o-rounded-lg o-px-4 o-py-2 o-text-sm o-font-medium at-leading-none at-focus-visible-outline-2 at-focus-visible-outline-offset-2 at-focus-visible-outline-foreground";

const variants: Record<NonNullable<CookieButtonProps["variant"]>, string> = {
  primary: "at-bg-foreground at-text-background hover:o-opacity-90",
  secondary:
    "o-border-w-1 at-border-foreground-15 o-bg-transparent at-text-foreground at-hover-bg-foreground-5",
};

export const CookieButton = ({
  children,
  onClick,
  variant = "primary",
}: CookieButtonProps) => (
  <button type="button" onClick={onClick} className={`${base} ${variants[variant]}`}>
    {children}
  </button>
);
