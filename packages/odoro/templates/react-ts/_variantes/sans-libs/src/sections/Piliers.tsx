/**
 * Trois piliers : ce que le projet a deja sous la main.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Un pilier : un titre, une phrase. */
const PILIERS: readonly { readonly titre: string; readonly texte: string }[] = [
  {
    titre: 'Compilation',
    texte:
      'Un serveur de developpement a rechargement a chaud, et une compilation de production.',
  },
  {
    titre: 'TypeScript',
    texte: 'Types stricts, alias de chemins, et verification sans emission.',
  },
  {
    titre: 'A vous de jouer',
    texte: 'Aucun systeme de style impose : le votre prend toute la place.',
  },
]

/** La section des piliers. */
export function Piliers(): ReactElement {
  return (
    <section id="piliers" className="section">
      <div className="contenu">
        <h2 className="sur-titre">Ce qui est deja la</h2>
        <div className="grille">
          {PILIERS.map((pilier, index) => (
            <article key={pilier.titre} className="carte">
              <span className="carte-numero">{String(index + 1).padStart(2, '0')}</span>
              <h3>{pilier.titre}</h3>
              <p>{pilier.texte}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
