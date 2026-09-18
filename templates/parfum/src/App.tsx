import { LazyCookie } from "@/components/common/Cookie";
import { Preloader } from "@/components/common/preloader";
import { ReducedMotion } from "@/components/common/reduced-motion";
import { ScrollLayout } from "@/layouts/scroll-layout";
import { getSiteStructuredData } from "@/utils/seo/structured-data";

import { HomeView } from "@/views/home";

/**
 * La racine de l application.
 *
 * Ce que l autre cadre posait dans son `layout` vit ici : il n y a plus de
 * layout. L ordre est le sien, a la lettre — les donnees structurees d abord,
 * puis le defilement doux qui enveloppe le reste.
 *
 * Deux choses ont disparu avec le cadre, et rien n en depend :
 *
 * - `suppressHydrationWarning` sur le `body` : il taisait un avertissement de
 *   l hydratation serveur, qui n a plus lieu ici — la page est construite dans
 *   le navigateur.
 * - les classes de police posees sur le `body` : l autre cadre y accrochait
 *   ses variables de police. Les notres sont declarees dans `:root`, au meme
 *   endroit que le reste des jetons.
 *
 * Il n y a plus de `<AdaptiveGrid />` non plus, et ce n en est pas une perte :
 * l original n en mettait pas. La taille de base se met a l echelle en CSS a
 * toutes les largeurs — voir la feuille.
 */
export function App() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSiteStructuredData()),
        }}
      />
      <ScrollLayout>
        <ReducedMotion />
        <Preloader />
        <LazyCookie />
        <HomeView />
      </ScrollLayout>
    </>
  );
}
