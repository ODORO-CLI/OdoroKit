import { Spring } from "@/components/animation/springs/spring";
import { ScrambleText } from "@/components/ui/scramble-text";

import { HeroMenu } from "./hero-menu";
import { HeroNavEntry } from "./hero-nav-item";

import { HERO_REVEAL } from "./hero.motion";
import type { HeroImage, HeroLink, HeroNavItem } from "./hero.types";

export interface HeroHeaderProps {
  logo: HeroImage;
  nav: HeroNavItem[];
  cart: HeroLink;
}

/** The logo's box. The ODORO logotype is set in the page's own 3270 mono, so it
 * is far wider than it is tall. The frame's own widths are kept — 75 at `lg`, 110
 * below it — and the height follows the artwork's 5.295 ratio, which lands the
 * mark on the nav's own optical line at `o-top-6`. */
const LOGO_BOX = "o-block pf-h-5-25 pf-w-27-5 pf-lg-h-3-5 pf-lg-w-18-75";

const FOCUS_RING =
  "pf-focus-visible-outline-2 pf-focus-visible-outline-offset-2 pf-focus-visible-outline-hero-content";

/**
 * Frame header (Figma 902:309 / 902:341 / 1923:2152).
 *
 * The three groups are pinned independently rather than distributed: the frame
 * centres the nav on the canvas while the logo and cart sit against the 40px
 * margins, which a `o-justify-between` row cannot reproduce.
 */
export const HeroHeader = ({ logo, nav, cart }: HeroHeaderProps) => (
  <Spring
    tag="header"
    mode="once"
    from={{ opacity: 0, y: -8 }}
    to={{ opacity: 1, y: 0 }}
    // Below the frame breakpoint this is ordinary flow and wraps: the nav is
    // full-width so it drops to its own line under the logo and cart, while DOM
    // order stays logo → nav → cart for reading. At `lg` it becomes the frame's
    // own canvas again and the three groups position against it.
    className="o-relative o-z-20 o-flex o-flex-wrap o-items-center o-gap-y-3 o-px-5 o-pt-5 o-pb-4 pf-font-mono pf-text-hero-content pf-lg-absolute pf-lg-inset-x-0 pf-lg-top-0 pf-lg-block pf-lg-h-13-5 pf-lg-px-0 pf-lg-pt-0 pf-lg-pb-0"
  >
    <a
      href="/"
      className={`${LOGO_BOX} o-order-1 pf-max-lg-tap-area pf-lg-absolute pf-lg-top-6 pf-lg-left-10 ${FOCUS_RING}`}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority
        className="o-h-full o-w-full o-object-contain"
      />
    </a>

    <nav
      aria-label="Primary"
      className="o-order-3 o-hidden o-w-full pf-lg-absolute pf-lg-block pf-lg-top-6 pf-lg-left-1-2 pf-lg-w-auto pf-lg-translate-x-1-2"
    >
      <ul className="o-flex o-items-start o-justify-between o-gap-3 pf-lg-justify-start pf-lg-gap-16">
        {nav.map((item, index) => (
          // A submenu item reserves the width of its caret box (113px offset +
          // the 6px glyph). The caret is positioned out of flow to match the
          // frame exactly, so without this the row would centre 12px narrow.
          <li
            key={item.label}
            className={`o-relative ${item.submenu ? "pf-lg-w-29-75" : ""}`}
          >
            <HeroNavEntry
              {...item}
              revealDelay={index * HERO_REVEAL.navStep}
              labelClassName={`block text-hero-caption leading-hero-display whitespace-nowrap max-lg:tap-area sm:text-hero-body ${FOCUS_RING}`}
              caretClassName="o-top-1 pf--right-2 pf-h-1-25 o-w-1.5 pf--scale-y-100 pf-lg-right-auto pf-lg-left-28-25"
            />
          </li>
        ))}
      </ul>
    </nav>

    <a
      href={cart.href}
      // `o-right-10`, not the frame's own x of 1302: the two are the same thing
      // at 1440 units — the label ends flush on the 40-unit margin — and only
      // the margin still means that on a canvas that is wider.
      className={`o-order-2 o-ml-auto o-hidden pf-text-hero-caption pf-lg-block pf-leading-hero-display o-whitespace-nowrap pf-max-lg-tap-area pf-lg-absolute pf-lg-top-6 pf-lg-right-10 pf-lg-ml-0 pf-sm-text-hero-body ${FOCUS_RING}`}
    >
      <ScrambleText revealDelay={HERO_REVEAL.cart}>{cart.label}</ScrambleText>
    </a>

    <div className="o-order-2 o-ml-auto pf-lg-hidden">
      <HeroMenu logo={logo} nav={nav} cart={cart} logoClassName={LOGO_BOX} />
    </div>
  </Spring>
);
