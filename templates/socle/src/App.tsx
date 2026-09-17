import { LazyCookie } from "@/components/common/Cookie";
import { AdaptiveGrid } from "@/components/common/grid";
import { Preloader } from "@/components/common/preloader";
import { ReducedMotion } from "@/components/common/reduced-motion";
import { ScrollLayout } from "@/layouts/scroll-layout";
import { homeContent } from "@/data/mocks/home";
import { AboutSection } from "@/views/home/about-section";
import { AudienceSection } from "@/views/home/audience-section";
import { ContactSection } from "@/views/home/contact-section";
import { HeroSection } from "@/views/home/hero-section";
import { LocationSection } from "@/views/home/location-section";
import { NumbersSection } from "@/views/home/numbers-section";
import { SiteNav } from "@/views/home/site-nav";

/**
 * Home view — the AERRA landing page, ported from the Figma frame
 * "Concept 3" (1469:1302), laid out at a 1440 px base width.
 *
 * Every section keeps its Figma height and places children at their Figma
 * coordinates, expressed through the rem-based spacing scale (1 Figma px =
 * 0.0625rem). The adaptive grid scales the root font-size with the viewport,
 * so the whole composition stays proportional at any width.
 *
 * A Server Component — the animation primitives are the client leaves.
 */
const Vue = () => {
  return (
    <>
      <Preloader />

      {/* Navigation precedes <main>, so it needs a skip link — see
          obsidian/frontend/html-semantics.md. */}
      <a
        href="#main"
        className="o-sr-only o-z-50 sn-rounded-button sn-bg-action-primary o-px-6 o-py-3 sn-text-body o-font-medium sn-text-action-primary-foreground focus:o-not-sr-only sn-focus-fixed sn-focus-left-3 sn-focus-top-3"
      >
        Skip to content
      </a>

      <SiteNav links={homeContent.nav.links} cta={homeContent.nav.cta} />

      <main id="main" className="o-w-full sn-overflow-x-clip">
        <HeroSection content={homeContent.hero} />
        <AboutSection content={homeContent.about} />
        <NumbersSection content={homeContent.numbers} />
        <LocationSection content={homeContent.location} />
        <AudienceSection content={homeContent.audience} />
        <ContactSection content={homeContent.contact} />
      </main>
    </>
  );
};


/**
 * La racine de l application.
 *
 * Ce que l autre cadre posait dans son `layout` — le defilement lisse, la
 * grille adaptative, le respect du mouvement reduit, le bandeau de cookies —
 * vit ici, parce qu il n y a plus de layout.
 *
 * `coef 1` : la mise a l echelle reste strictement proportionnelle. L amorti
 * par defaut laisserait la composition de 1440 deriver de ses proportions
 * au-dela de 1440.
 */
export function App() {
  return (
    <ScrollLayout>
      <AdaptiveGrid coef={1} />
      <ReducedMotion />
      <LazyCookie />
      <Vue />
    </ScrollLayout>
  );
}
