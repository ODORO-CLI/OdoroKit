/**
 * Racine du site de documentation : coquille commune et table des routes.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'
import { Route, Router, Routes, useLocation } from '@odoro-cli/libs/router'
import { ToastProvider } from '@odoro-cli/libs/ui'
import { Link } from '@odoro-cli/libs/router'
import { OdoroDebugPanel, OdoroEngine, isDebugRequested } from '@odoro-cli/engine'

import { Shell } from './docs/components/Shell.jsx'
import { Accueil } from './docs/pages/Accueil.jsx'
import { Landing } from './docs/pages/Landing.jsx'
import { Templates } from './docs/pages/Templates.jsx'
import { ProjetRoute } from './docs/pages/ProjetRoute.jsx'
import { VitrineRoute } from './docs/pages/VitrineRoute.jsx'
import { Installation } from './docs/pages/Installation.jsx'
import { StylesOverview } from './docs/pages/StylesOverview.jsx'
import { Couleurs } from './docs/pages/Couleurs.jsx'
import { Typographie } from './docs/pages/Typographie.jsx'
import { Responsive } from './docs/pages/Responsive.jsx'
import { Fonts } from './docs/pages/Fonts.jsx'
import { Utilitaires } from './docs/pages/Utilitaires.jsx'
import { MotionOverview } from './docs/pages/MotionOverview.jsx'
import { MotionPresets } from './docs/pages/MotionPresets.jsx'
import { MotionComposants } from './docs/pages/MotionComposants.jsx'
import { MotionHooks } from './docs/pages/MotionHooks.jsx'
import { RouterGuide } from './docs/pages/RouterGuide.jsx'
import { MoteurOverview } from './docs/pages/MoteurOverview.jsx'
import { MoteurBoucle } from './docs/pages/MoteurBoucle.jsx'
import { MoteurMouvement } from './docs/pages/MoteurMouvement.jsx'
import { MoteurWebgl } from './docs/pages/MoteurWebgl.jsx'
import { MoteurDiagnostic } from './docs/pages/MoteurDiagnostic.jsx'
import { RegistreFormat } from './docs/pages/RegistreFormat.jsx'
import { RegistreCli } from './docs/pages/RegistreCli.jsx'
import { RegistreContrat } from './docs/pages/RegistreContrat.jsx'
import { RegistreGalerie } from './docs/pages/RegistreGalerie.jsx'
import { Backgrounds } from './docs/pages/Backgrounds.jsx'
import { IconesOverview } from './docs/pages/IconesOverview.jsx'
import { TextAnimations } from './docs/pages/TextAnimations.jsx'
import { MotionsLibrairie } from './docs/pages/MotionsLibrairie.jsx'
import { Images } from './docs/pages/Images.jsx'
import { Sections } from './docs/pages/Sections.jsx'
import { Catalogue } from './docs/pages/Catalogue.jsx'
import { RegistryEntryRoute } from './docs/pages/RegistryEntryRoute.jsx'
import { SelectMenuDoc } from './docs/pages/composants/SelectMenuDoc.jsx'

import { ButtonDoc } from './docs/pages/composants/ButtonDoc.jsx'
import { InputDoc } from './docs/pages/composants/InputDoc.jsx'
import { TextareaDoc } from './docs/pages/composants/TextareaDoc.jsx'
import { SelectDoc } from './docs/pages/composants/SelectDoc.jsx'
import { CheckboxDoc } from './docs/pages/composants/CheckboxDoc.jsx'
import { RadioDoc } from './docs/pages/composants/RadioDoc.jsx'
import { SwitchDoc } from './docs/pages/composants/SwitchDoc.jsx'
import { SliderDoc } from './docs/pages/composants/SliderDoc.jsx'
import { CardDoc } from './docs/pages/composants/CardDoc.jsx'
import { BadgeDoc } from './docs/pages/composants/BadgeDoc.jsx'
import { AvatarDoc } from './docs/pages/composants/AvatarDoc.jsx'
import { AlertDoc } from './docs/pages/composants/AlertDoc.jsx'
import { SeparatorDoc } from './docs/pages/composants/SeparatorDoc.jsx'
import { SkeletonDoc } from './docs/pages/composants/SkeletonDoc.jsx'
import { SpinnerDoc } from './docs/pages/composants/SpinnerDoc.jsx'
import { ProgressDoc } from './docs/pages/composants/ProgressDoc.jsx'
import { KbdDoc } from './docs/pages/composants/KbdDoc.jsx'
import { TabsDoc } from './docs/pages/composants/TabsDoc.jsx'
import { AccordionDoc } from './docs/pages/composants/AccordionDoc.jsx'
import { TooltipDoc } from './docs/pages/composants/TooltipDoc.jsx'
import { PopoverDoc } from './docs/pages/composants/PopoverDoc.jsx'
import { DropdownMenuDoc } from './docs/pages/composants/DropdownMenuDoc.jsx'
import { DialogDoc } from './docs/pages/composants/DialogDoc.jsx'
import { DrawerDoc } from './docs/pages/composants/DrawerDoc.jsx'
import { ToastDoc } from './docs/pages/composants/ToastDoc.jsx'
import { BreadcrumbDoc } from './docs/pages/composants/BreadcrumbDoc.jsx'
import { PaginationDoc } from './docs/pages/composants/PaginationDoc.jsx'
import { TableDoc } from './docs/pages/composants/TableDoc.jsx'

/**
 * La coquille du site, sauf en integration.
 *
 * Une vitrine posee dans un cadre sur le site de quelqu un d autre ne porte ni
 * en-tete, ni colonne de navigation, ni pied de page : elle est le contenu, et
 * rien d autre. La coquille est donc retiree **avant** le rendu plutot que
 * masquee apres — masquee, elle continuerait a poser son decalage haut, a
 * capter le clavier et a charger sa recherche.
 */
function Cadre({ children }: { children?: ReactNode }): ReactElement {
  const { pathname } = useLocation()
  if (pathname.startsWith('/embed/')) return <>{children}</>
  return <Shell>{children}</Shell>
}

/** Page introuvable. */
function Introuvable(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-items-center o-gap-4 o-py-24 o-text-center">
      <p className="o-text-6xl o-font-extrabold o-text-gradient o-bg-gradient-to-r o-from-brand-700 dark:o-from-brand-500 o-to-brand-300 dark:o-to-brand-200">
        404
      </p>
      <p className="o-text-zinc-500 dark:o-text-zinc-400">Cette page n'existe pas.</p>
      <Link
        to="/"
        className="o-text-brand-600 dark:o-text-brand-300 hover:o-text-brand-700 dark:hover:o-text-brand-200 o-underline"
      >
        Retour a l'accueil
      </Link>
    </div>
  )
}

/** Racine de l'application. */
export function App(): ReactElement {
  return (
    // Le moteur enveloppe le site entier : les pages qui le documentent
    // s'abonnent a la boucle reelle plutot qu'a une simulation.
    <OdoroEngine quality="auto" reducedMotion="respect" maxSurfaces={2}>
      <Router>
        <ToastProvider>
          <Cadre>
            <Routes
              fallback={
                <p className="o-text-zinc-500 dark:o-text-zinc-400">Chargement...</p>
              }
            >
              {/* La racine vend le produit ; l'accueil d'avant devient le
                  point d'entree de la documentation. Deux publics distincts :
                  le visiteur qui decouvre, le developpeur qui cherche. */}
              <Route index element={<Landing />} />
              <Route path="docs" element={<Accueil />} />
              <Route path="templates" element={<Templates />} />
              {/* Le projet passe avant la vitrine : `projet` serait sinon
                  pris pour un segment de vitrine, et la page annoncerait un
                  modele introuvable. */}
              <Route path="templates/projet/:name" element={<ProjetRoute />} />
              <Route path="templates/:slug" element={<VitrineRoute />} />
              {/* La meme vitrine, nue : c est ce que sert un cadre pose
                  ailleurs. Voir EmbedRoute pour ce que l adresse accepte, et
                  pourquoi elle doit rester paresseuse. */}
              <Route
                path="embed/:slug"
                lazy={() => import('./docs/pages/EmbedRoute.jsx')}
              />
              <Route path="docs/installation" element={<Installation />} />
              <Route path="docs/templates" element={<Templates />} />
              <Route path="docs/styles" element={<StylesOverview />} />
              <Route path="docs/styles/colors" element={<Couleurs />} />
              <Route path="docs/styles/typography" element={<Typographie />} />
              <Route path="docs/styles/responsive" element={<Responsive />} />
              <Route path="docs/styles/fonts" element={<Fonts />} />
              <Route path="docs/styles/utilities" element={<Utilitaires />} />
              <Route path="docs/motion" element={<MotionOverview />} />
              <Route path="docs/motion/presets" element={<MotionPresets />} />
              <Route path="docs/motion/components" element={<MotionComposants />} />
              <Route path="docs/motion/hooks" element={<MotionHooks />} />
              <Route path="docs/router" element={<RouterGuide />} />
              <Route path="docs/engine" element={<MoteurOverview />} />
              <Route path="docs/engine/loop" element={<MoteurBoucle />} />
              <Route path="docs/engine/motion-policy" element={<MoteurMouvement />} />
              <Route path="docs/engine/webgl" element={<MoteurWebgl />} />
              <Route path="docs/engine/diagnostics" element={<MoteurDiagnostic />} />
              <Route path="docs/registry" element={<RegistreFormat />} />
              <Route path="docs/registry/cli" element={<RegistreCli />} />
              <Route path="docs/registry/contract" element={<RegistreContrat />} />
              <Route path="docs/registry/gallery" element={<RegistreGalerie />} />
              <Route path="docs/icons" element={<IconesOverview />} />
              <Route
                path="docs/icons/outline"
                lazy={() => import('./docs/pages/icones/outline.jsx')}
              />
              <Route
                path="docs/icons/compact"
                lazy={() => import('./docs/pages/icones/compact.jsx')}
              />
              <Route
                path="docs/icons/classic"
                lazy={() => import('./docs/pages/icones/classic.jsx')}
              />
              <Route
                path="docs/icons/extended"
                lazy={() => import('./docs/pages/icones/extended.jsx')}
              />
              <Route
                path="docs/icons/brands"
                lazy={() => import('./docs/pages/icones/brands.jsx')}
              />
              <Route path="docs/backgrounds" element={<Backgrounds />} />
              <Route
                path="docs/backgrounds/:name"
                element={<RegistryEntryRoute category="background" />}
              />
              <Route
                path="docs/heroes/:name"
                element={<RegistryEntryRoute category="hero" />}
              />
              <Route
                path="docs/text/:name"
                element={<RegistryEntryRoute category="text" />}
              />
              <Route
                path="docs/effects/:name"
                element={<RegistryEntryRoute category="effect" />}
              />
              <Route
                path="docs/images/:name"
                element={<RegistryEntryRoute category="image" />}
              />
              <Route
                path="docs/sections/:name"
                element={<RegistryEntryRoute category="section" />}
              />
              <Route
                path="docs/ui/:name"
                element={<RegistryEntryRoute category="ui" />}
              />
              <Route
                path="docs/loaders/:name"
                element={<RegistryEntryRoute category="loader" />}
              />
              <Route
                path="docs/hooks/:name"
                element={<RegistryEntryRoute category="hooks" />}
              />
              <Route path="docs/text" element={<TextAnimations />} />
              <Route path="docs/motion/library" element={<MotionsLibrairie />} />
              <Route path="docs/images" element={<Images />} />
              <Route path="docs/sections" element={<Sections />} />
              <Route path="docs/registry/catalog" element={<Catalogue />} />
              <Route path="docs/components/select-menu" element={<SelectMenuDoc />} />
              <Route path="docs/components/button" element={<ButtonDoc />} />
              <Route path="docs/components/input" element={<InputDoc />} />
              <Route path="docs/components/textarea" element={<TextareaDoc />} />
              <Route path="docs/components/select" element={<SelectDoc />} />
              <Route path="docs/components/checkbox" element={<CheckboxDoc />} />
              <Route path="docs/components/radio" element={<RadioDoc />} />
              <Route path="docs/components/switch" element={<SwitchDoc />} />
              <Route path="docs/components/slider" element={<SliderDoc />} />
              <Route path="docs/components/card" element={<CardDoc />} />
              <Route path="docs/components/badge" element={<BadgeDoc />} />
              <Route path="docs/components/avatar" element={<AvatarDoc />} />
              <Route path="docs/components/alert" element={<AlertDoc />} />
              <Route path="docs/components/separator" element={<SeparatorDoc />} />
              <Route path="docs/components/skeleton" element={<SkeletonDoc />} />
              <Route path="docs/components/spinner" element={<SpinnerDoc />} />
              <Route path="docs/components/progress" element={<ProgressDoc />} />
              <Route path="docs/components/kbd" element={<KbdDoc />} />
              <Route path="docs/components/tabs" element={<TabsDoc />} />
              <Route path="docs/components/accordion" element={<AccordionDoc />} />
              <Route path="docs/components/tooltip" element={<TooltipDoc />} />
              <Route path="docs/components/popover" element={<PopoverDoc />} />
              <Route path="docs/components/dropdown-menu" element={<DropdownMenuDoc />} />
              <Route path="docs/components/dialog" element={<DialogDoc />} />
              <Route path="docs/components/drawer" element={<DrawerDoc />} />
              <Route path="docs/components/toast" element={<ToastDoc />} />
              <Route path="docs/components/breadcrumb" element={<BreadcrumbDoc />} />
              <Route path="docs/components/pagination" element={<PaginationDoc />} />
              <Route path="docs/components/table" element={<TableDoc />} />
              <Route path="*" element={<Introuvable />} />
            </Routes>
          </Cadre>
          {isDebugRequested() ? <OdoroDebugPanel /> : null}
        </ToastProvider>
      </Router>
    </OdoroEngine>
  )
}
