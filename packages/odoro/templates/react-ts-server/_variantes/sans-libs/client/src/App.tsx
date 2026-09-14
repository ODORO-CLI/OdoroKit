/**
 * Toute la page, en un fichier.
 *
 * ## Sans les bibliotheques
 *
 * Elles n'ont pas ete retenues a la creation : pas de classes `o-*`, pas de
 * jetons, pas de routeur. Le dessin est celui de la version complete — meme
 * barre en gelules, meme titre, memes cartes — porte par `styles.css` en CSS
 * ordinaire.
 *
 * Pour les ajouter plus tard : `npm i @odoro-cli/libs`, puis importer
 * `@odoro-cli/libs/styles.css` dans `main.tsx` avant cette feuille.
 *
 * @module
 */

import { useState, type ReactElement } from 'react'

import { Fond } from '@/fond'

/* -------------------------------------------------------------------------- */
/*  Marque                                                                     */
/* -------------------------------------------------------------------------- */

/** Le signe de la marque, a la taille demandee. */
function Signe({ taille = '1.75rem' }: { readonly taille?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      style={{ width: taille, height: taille, flexShrink: 0 }}
    >
      <path
        d="M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z"
        stroke="currentColor"
        strokeWidth="10.5"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Barre de navigation                                                        */
/* -------------------------------------------------------------------------- */

/** La barre : la marque en gelule, et le lien vers le site. */
function Barre(): ReactElement {
  return (
    <header className="barre">
      <div className="barre-contenu">
        <span className="gelule marque">
          <span className="marque-signe">
            <Signe />
          </span>
          <span className="marque-mot">ODORO</span>
        </span>

        <a
          href="https://odoro.dev"
          target="_blank"
          rel="noreferrer"
          className="gelule gelule-lien"
        >
          odoro.dev
        </a>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                   */
/* -------------------------------------------------------------------------- */

/** Trois faits, pas trois slogans. */
const FAITS = ['Zero configuration', 'TypeScript strict', 'Rechargement a chaud']

/** Ce que la fenetre du produit montre. */
const EXTRAIT = `export function App() {
  return (
    <h1 className="hero-titre">
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

/** Le hero : la promesse, les actions, et la fenetre du produit. */
function Hero(): ReactElement {
  return (
    <section className="hero">
      <div className="contenu">
        <span className="pastille-marque">
          <Signe taille="0.9rem" />
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

/** Ce que le projet a deja sous la main. */
const PILIERS = [
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
function Piliers(): ReactElement {
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

/** La commande que l'on copie le plus souvent. */
const COMMANDE = 'npm i @odoro-cli/libs'

/** La cloture : une commande, et la porte vers la documentation. */
function Cloture(): ReactElement {
  const [copie, setCopie] = useState(false)

  return (
    <section className="section section-centre">
      <div className="contenu-etroit">
        <h2 className="cloture-titre">Ajoutez le systeme de style quand vous voudrez.</h2>
        <p className="cloture-chapeau">
          Les jetons, les utilitaires et les composants vivent dans un paquet a part. Ce
          projet tourne sans eux, et les accueille sans rien casser.
        </p>

        <div className="commande">
          <code>{COMMANDE}</code>
          <button
            type="button"
            className="bouton bouton-fantome"
            onClick={() => {
              // Le presse-papiers peut etre refuse — hors contexte sur, ou
              // permission retiree. L'echec ne casse pas la page : le libelle
              // ne change simplement pas.
              void navigator.clipboard
                ?.writeText(COMMANDE)
                .then(() => {
                  setCopie(true)
                  setTimeout(() => {
                    setCopie(false)
                  }, 1600)
                })
                .catch(() => undefined)
            }}
          >
            {copie ? 'Copie' : 'Copier'}
          </button>
        </div>

        <a
          href="https://odoro.dev/docs/installation"
          target="_blank"
          rel="noreferrer"
          className="lien-discret"
        >
          Lire la marche a suivre
        </a>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Racine                                                                     */
/* -------------------------------------------------------------------------- */

/** Racine de l'application. */
export function App(): ReactElement {
  return (
    <div className="app-shell">
      <Barre />
      <main className="principal">
        <Fond />
        <Hero />
        <Piliers />
        <Cloture />
      </main>
      <footer className="pied">
        <span className="marque">
          <span className="marque-signe">
            <Signe taille="1.1rem" />
          </span>
          <span className="marque-mot">ODORO</span>
        </span>
        <span>Construit avec Odoro.</span>
      </footer>
    </div>
  )
}
