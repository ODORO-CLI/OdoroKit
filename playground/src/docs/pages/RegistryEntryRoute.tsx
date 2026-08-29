/**
 * Route d'une entree de registre.
 *
 * Le chemin porte la categorie et le nom ; la page se charge du reste, en
 * lisant le catalogue. Une entree ajoutee au registre obtient donc sa page
 * sans qu'aucune route ne soit ecrite.
 *
 * @module
 */

import { useParams } from '@odoro-cli/libs/router'
import { type ReactElement } from 'react'

import { EntryPage } from '../components/EntryPage.jsx'

/** Rend la page de l'entree designee par l'URL. */
export function RegistryEntryRoute({ category }: { category: string }): ReactElement {
  const params = useParams()
  return <EntryPage id={`${category}/${String(params['name'] ?? '')}`} />
}
