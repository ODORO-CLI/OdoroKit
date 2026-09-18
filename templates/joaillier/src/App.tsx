import { AdaptiveGrid } from '@/components/common/grid'
import { ReducedMotion } from '@/components/common/reduced-motion'
import { ScrollLayout } from '@/layouts/scroll-layout'
import { getSiteStructuredData } from '@/utils/seo/structured-data'

import { HomeView } from '@/views/home'

/**
 * La racine de l application.
 *
 * Ce que l autre cadre posait dans son `layout` vit ici : il n y a plus de
 * layout. L ordre est le sien, a la lettre.
 *
 * Deux choses ont disparu avec le cadre, et rien n en depend :
 *
 * - `suppressHydrationWarning` sur le `body`, qui taisait un avertissement de
 *   l hydratation serveur ; la page est construite dans le navigateur.
 * - les variables de police posees sur `<html>`. L original les y mettait
 *   parce que les jetons de typographie sont declares dans `:root` et qu une
 *   variable definie plus bas ne les aurait jamais atteints. Les notres sont
 *   declarees dans `:root` elles aussi, au meme endroit que le reste.
 *
 * La banniere de consentement du socle d origine n est pas montee : la page ne
 * pose ni mesure ni marqueur, il n y a donc rien a consentir — et une banniere
 * en anglais sur une page francaise serait la premiere chose qu on lirait.
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
        {/* coef 1 — la maquette 1440 s agrandit proportionnellement au-dela de
            1440 plutot que d etre amortie. Voir `grid.config.ts`. */}
        <AdaptiveGrid coef={1} />
        <ReducedMotion />
        <HomeView />
      </ScrollLayout>
    </>
  )
}
