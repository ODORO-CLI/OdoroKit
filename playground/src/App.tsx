/**
 * Racine du site de documentation : coquille commune et table des routes.
 *
 * @module
 */

import { type ReactElement } from 'react'
import { Route, Router, Routes } from 'odoro-libs/router'
import { ToastProvider } from 'odoro-libs/ui'
import { Link } from 'odoro-libs/router'
import { OdoroDebugPanel, OdoroEngine, isDebugRequested } from 'odoro-engine'

import { Shell } from './docs/components/Shell.jsx'
import { Accueil } from './docs/pages/Accueil.jsx'
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

/** Page introuvable. */
function Introuvable(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-items-center o-gap-4 o-py-24 o-text-center">
      <p className="o-text-6xl o-font-extrabold o-text-gradient o-bg-gradient-to-r o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400">
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
          <Shell>
            <Routes
              fallback={
                <p className="o-text-zinc-500 dark:o-text-zinc-400">Chargement...</p>
              }
            >
              <Route index element={<Accueil />} />
              <Route path="docs/installation" element={<Installation />} />
              <Route path="docs/styles" element={<StylesOverview />} />
              <Route path="docs/styles/couleurs" element={<Couleurs />} />
              <Route path="docs/styles/typographie" element={<Typographie />} />
              <Route path="docs/styles/responsive" element={<Responsive />} />
              <Route path="docs/styles/fonts" element={<Fonts />} />
              <Route path="docs/styles/utilitaires" element={<Utilitaires />} />
              <Route path="docs/motion" element={<MotionOverview />} />
              <Route path="docs/motion/presets" element={<MotionPresets />} />
              <Route path="docs/motion/composants" element={<MotionComposants />} />
              <Route path="docs/motion/hooks" element={<MotionHooks />} />
              <Route path="docs/router" element={<RouterGuide />} />
              <Route path="docs/moteur" element={<MoteurOverview />} />
              <Route path="docs/moteur/boucle" element={<MoteurBoucle />} />
              <Route path="docs/moteur/mouvement" element={<MoteurMouvement />} />
              <Route path="docs/moteur/webgl" element={<MoteurWebgl />} />
              <Route path="docs/moteur/diagnostic" element={<MoteurDiagnostic />} />
              <Route path="docs/registre" element={<RegistreFormat />} />
              <Route path="docs/registre/cli" element={<RegistreCli />} />
              <Route path="docs/registre/contrat" element={<RegistreContrat />} />
              <Route path="docs/registre/galerie" element={<RegistreGalerie />} />
              <Route path="docs/composants/button" element={<ButtonDoc />} />
              <Route path="docs/composants/input" element={<InputDoc />} />
              <Route path="docs/composants/textarea" element={<TextareaDoc />} />
              <Route path="docs/composants/select" element={<SelectDoc />} />
              <Route path="docs/composants/checkbox" element={<CheckboxDoc />} />
              <Route path="docs/composants/radio" element={<RadioDoc />} />
              <Route path="docs/composants/switch" element={<SwitchDoc />} />
              <Route path="docs/composants/slider" element={<SliderDoc />} />
              <Route path="docs/composants/card" element={<CardDoc />} />
              <Route path="docs/composants/badge" element={<BadgeDoc />} />
              <Route path="docs/composants/avatar" element={<AvatarDoc />} />
              <Route path="docs/composants/alert" element={<AlertDoc />} />
              <Route path="docs/composants/separator" element={<SeparatorDoc />} />
              <Route path="docs/composants/skeleton" element={<SkeletonDoc />} />
              <Route path="docs/composants/spinner" element={<SpinnerDoc />} />
              <Route path="docs/composants/progress" element={<ProgressDoc />} />
              <Route path="docs/composants/kbd" element={<KbdDoc />} />
              <Route path="docs/composants/tabs" element={<TabsDoc />} />
              <Route path="docs/composants/accordion" element={<AccordionDoc />} />
              <Route path="docs/composants/tooltip" element={<TooltipDoc />} />
              <Route path="docs/composants/popover" element={<PopoverDoc />} />
              <Route path="docs/composants/dropdown-menu" element={<DropdownMenuDoc />} />
              <Route path="docs/composants/dialog" element={<DialogDoc />} />
              <Route path="docs/composants/drawer" element={<DrawerDoc />} />
              <Route path="docs/composants/toast" element={<ToastDoc />} />
              <Route path="docs/composants/breadcrumb" element={<BreadcrumbDoc />} />
              <Route path="docs/composants/pagination" element={<PaginationDoc />} />
              <Route path="docs/composants/table" element={<TableDoc />} />
              <Route path="*" element={<Introuvable />} />
            </Routes>
          </Shell>
          {isDebugRequested() ? <OdoroDebugPanel /> : null}
        </ToastProvider>
      </Router>
    </OdoroEngine>
  )
}
