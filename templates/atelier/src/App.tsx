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
 * Le verrou de defilement, lui, est passe dans le `<head>` de `index.html` :
 * le navigateur restaure la position d un rechargement pendant que le document
 * arrive encore, bien avant qu un script de l application puisse dire le
 * contraire. La page s ouvre derriere un rideau et commence toujours en haut.
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
        <AdaptiveGrid />
        <ReducedMotion />
        <HomeView />
      </ScrollLayout>
    </>
  )
}
