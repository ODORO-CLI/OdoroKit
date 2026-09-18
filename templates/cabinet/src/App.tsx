import { LazyCookie } from '@/components/common/Cookie'
import { AdaptiveGrid } from '@/components/common/grid'
import { ReducedMotion } from '@/components/common/reduced-motion'
import { ScrollLayout } from '@/layouts/scroll-layout'
import { getSiteStructuredData } from '@/utils/seo/structured-data'

import { HomeView } from '@/views/home'

/**
 * La racine de l application.
 *
 * Ce que l autre cadre posait dans son `layout` vit ici : il n y a plus de
 * layout. L ordre est le sien, a la lettre — les donnees structurees d abord,
 * puis le defilement doux qui enveloppe le reste.
 *
 * Les classes de police que l autre cadre posait sur le `body` ont disparu avec
 * lui : les notres sont declarees dans `:root`, au meme endroit que le reste
 * des jetons.
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
        <LazyCookie />
        <HomeView />
      </ScrollLayout>
    </>
  )
}
