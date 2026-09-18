// 📖 Docs: obsidian/frontend/components/ui.md

/**
 * The site's line icons, from the source's inline SVGs. All decorative: every
 * one sits next to visible text or inside a control that carries its own
 * accessible name, so each is `aria-hidden` and draws in `currentColor`.
 */

export interface IconProps {
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** The down-right corner arrow on "Get a quote" and "Contact". */
export const CornerArrowIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.8} className={className}>
    <path d="M8 8v8h8" />
    <path d="M12 12l4 4-4 4" />
  </svg>
);

export const PlusCircleIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.8} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export const GlobeIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.8} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
  </svg>
);

export const PlayCircleIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.8} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m10 15 5-3-5-3v6Z" />
  </svg>
);

export const ArrowLeftIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.5} className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const ArrowRightIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.5} className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const MenuIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.5} className={className}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.5} className={className}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

/** The Odoro mark — a pair of scales drawn in one line weight. */
export const LogoMark = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={1.5} className={className}>
    <path d="M12 3.5v17" />
    <path d="M8.5 20.5h7" />
    <path d="M5 7h14" />
    <path d="M7 7l-3.25 7.5h6.5L7 7z" />
    <path d="M3.75 14.5a3.25 3.25 0 0 0 6.5 0" />
    <path d="M17 7l-3.25 7.5h6.5L17 7z" />
    <path d="M13.75 14.5a3.25 3.25 0 0 0 6.5 0" />
  </svg>
);
