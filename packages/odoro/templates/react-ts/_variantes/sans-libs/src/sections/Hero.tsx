/**
 * Le hero : la promesse, et la fenetre du produit.
 *
 * Meme dessin que la version avec bibliotheques — titre serre, pastilles de
 * faits, fenetre de navigateur — en CSS ordinaire. Ce qui manque ici est
 * l'animation d'entree : elle venait de `@odoro-cli/libs/motion`, et il n'y a
 * pas lieu de la reecrire a la main dans un projet de depart.
 *
 * @module
 */

import type { ReactElement } from 'react'

import { Signe } from '@/composants/Marque'

/** Trois faits, pas trois slogans. */
const FAITS = ['Zero configuration', 'TypeScript strict', 'Rechargement a chaud']

/** Ce que la fenetre montre. */
const EXTRAIT = `export function App() {
  return (
    <h1 className="titre">
      Votre premiere page.
    </h1>
  )
}`

/** Une fenetre de navigateur miniature. */
function Fenetre(): ReactElement {
  return (
    <div className="fenetre">
      <div className="fenetre-barre">
        <span className="fenetre-pastilles" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="fenetre-chemin">src/App.tsx</span>
      </div>
      <pre className="fenetre-code">{EXTRAIT}</pre>
    </div>
  )
}

/** Le hero de la page d'accueil. */
export function Hero(): ReactElement {
  return (
    <section className="hero">
      <div className="contenu">
        <span className="pastille-marque">
          <Signe />
          Genere par odoro create
        </span>

        <h1 className="hero-titre">
          Votre premiere page, <span className="accent">deja vivante</span>.
        </h1>

        <p className="hero-chapeau">
          Le serveur de developpement, la compilation et le rechargement a chaud
          viennent de <code>odoro</code>. Le systeme de style est le votre.
        </p>

        <div className="hero-actions">
          <a href="#piliers" className="bouton bouton-primaire">
            Voir ce qui est inclus
          </a>
          <a
            href="https://odoro.dev/docs"
            target="_blank"
            rel="noreferrer"
            className="bouton bouton-secondaire"
          >
            Documentation
          </a>
        </div>

        <div className="faits">
          {FAITS.map((fait) => (
            <span key={fait} className="fait">
              {fait}
            </span>
          ))}
        </div>

        <div className="hero-fenetre">
          <Fenetre />
        </div>
      </div>
    </section>
  )
}
