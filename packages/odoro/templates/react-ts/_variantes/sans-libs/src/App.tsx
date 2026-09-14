import { useState } from 'react'

/** Trois arguments mis en avant. */
const FEATURES = [
  {
    title: 'Compilation',
    body: 'Un serveur de developpement a rechargement a chaud, et une compilation de production.',
  },
  {
    title: 'TypeScript',
    body: 'Types stricts, alias de chemins, et verification sans emission.',
  },
  {
    title: 'A vous de jouer',
    body: 'Aucun systeme de style impose : le votre prend toute la place.',
  },
]

/**
 * Racine de l'application.
 *
 * Les bibliotheques Odoro n'ont pas ete retenues a la creation : pas de
 * classes `o-*`, pas de jetons, pas de routeur. Les styles de cette page sont
 * dans `styles.css`, en CSS ordinaire.
 *
 * Pour les ajouter plus tard : `npm i @odoro-cli/libs`, puis importer
 * `@odoro-cli/libs/styles.css` dans `main.tsx`.
 */
export function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-shell">
      <nav className="nav">
        <span className="marque">Odoro</span>
      </nav>

      <main className="contenu">
        <h1>Un point de depart maitrise.</h1>
        <p className="chapeau">
          Ce projet a ete genere par <code>odoro create</code>. Le moteur de
          developpement et la compilation viennent de <code>odoro</code>.
        </p>

        <div className="grille">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="carte">
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="ligne">
          <button
            type="button"
            className="bouton"
            onClick={() => {
              setCount((value) => value + 1)
            }}
          >
            Compter
          </button>
          <span className="compteur">{count}</span>
        </div>
      </main>

      <footer className="pied">Construit avec Odoro.</footer>
    </div>
  )
}
