/**
 * Le routeur du projet.
 *
 * ## Pourquoi il vit seul, dans son fichier
 *
 * C'est le seul endroit qui nomme la dependance de routage. Changer de routeur,
 * ajouter une route, en proteger une derriere une authentification : tout se
 * lit ici, et `App.tsx` n'a rien a en savoir au-dela de la ligne qui l'importe.
 *
 * ## Pourquoi les pages sont passees, et non importees
 *
 * Ce fichier pourrait importer les pages depuis `App.tsx`. Les deux modules
 * s'importeraient alors l'un l'autre : cela fonctionne, mais l'ordre
 * d'evaluation devient une question a laquelle personne ne veut repondre le
 * jour ou quelque chose s'execute au chargement du module.
 *
 * Les pages arrivent donc en proprietes. La dependance ne va que dans un sens —
 * `App.tsx` connait le routeur, le routeur ne connait que React — et la table
 * des routes reste lisible d'un coup d'oeil.
 *
 * @module
 */

import { Outlet, Route, Router, Routes } from '@odoro-cli/libs/router'
import type { ReactElement, ReactNode } from 'react'

export { Link, useLocation } from '@odoro-cli/libs/router'

/** Les pages que le routeur place. */
export interface RouteurProps {
  /** L'enveloppe commune : navigation, contenu, pied de page. */
  readonly enveloppe: (contenu: ReactNode) => ReactElement
  /** La page d'accueil. */
  readonly accueil: ReactElement
  /** La page « A propos ». */
  readonly apropos: ReactElement
  /** Ce qui s'affiche quand aucune route ne correspond. */
  readonly introuvable: ReactElement
}

/**
 * La table des routes.
 *
 * @example
 * <Routeur
 *   enveloppe={(contenu) => <Coquille>{contenu}</Coquille>}
 *   accueil={<Accueil />}
 *   apropos={<APropos />}
 *   introuvable={<Introuvable />}
 * />
 */
export function Routeur({
  enveloppe,
  accueil,
  apropos,
  introuvable,
}: RouteurProps): ReactElement {
  return (
    <Router>
      <Routes>
        {/* `Outlet` marque l'endroit ou la page courante se rend : c'est ce
            qui permet a la navigation et au pied de page de ne pas etre
            remontes a chaque changement de route. */}
        <Route path="/" element={enveloppe(<Outlet />)}>
          <Route index element={accueil} />
          <Route path="a-propos" element={apropos} />
          <Route path="*" element={introuvable} />
        </Route>
      </Routes>
    </Router>
  )
}
