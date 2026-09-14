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

import { useEffect, useState, type ReactElement } from 'react'

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

        <div className="barre-fin">
          <a
            href="https://odoro.dev"
            target="_blank"
            rel="noreferrer"
            className="gelule gelule-lien"
          >
            odoro.dev
          </a>
          <BasculeTheme />
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Theme                                                                      */
/* -------------------------------------------------------------------------- */

/** Les trois etats de la bascule. */
type Theme = 'systeme' | 'clair' | 'sombre'

/** Ou le choix est memorise. Le script de `index.html` lit la meme cle. */
const CLE_THEME = 'odoro-theme'

/** L'ordre du cycle, au clic. */
const CYCLE: readonly Theme[] = ['systeme', 'clair', 'sombre']

/**
 * Pose le theme sur la racine du document.
 *
 * `systeme` retire l'attribut plutot que d'en poser un troisieme : la feuille
 * de style ecoute `data-theme`, et son absence rend la main a la preference du
 * navigateur.
 */
function poserTheme(theme: Theme): void {
  if (theme === 'systeme') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme === 'clair' ? 'light' : 'dark'
}

/** Le theme memorise, ou `systeme`. */
function themeMemorise(): Theme {
  try {
    const valeur = localStorage.getItem(CLE_THEME)
    if (valeur === 'light') return 'clair'
    if (valeur === 'dark') return 'sombre'
    return 'systeme'
  } catch {
    // Stockage refuse — fenetre privee, cookies bloques. Le theme du systeme
    // reste une reponse valable.
    return 'systeme'
  }
}

/** Les trois pictogrammes, dessines dans le flux. */
function Pictogramme({ theme }: { readonly theme: Theme }): ReactElement {
  const commun = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    style: { width: '1.15rem', height: '1.15rem' },
  }

  if (theme === 'clair') {
    return (
      <svg {...commun}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }

  if (theme === 'sombre') {
    return (
      <svg {...commun}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    )
  }

  return (
    <svg {...commun}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

/** La bascule de theme : systeme, clair, sombre. */
function BasculeTheme(): ReactElement {
  const [theme, setTheme] = useState<Theme>(() => themeMemorise())

  useEffect(() => {
    poserTheme(theme)
    try {
      if (theme === 'systeme') localStorage.removeItem(CLE_THEME)
      else localStorage.setItem(CLE_THEME, theme === 'clair' ? 'light' : 'dark')
    } catch {
      // Le theme reste applique pour la session, meme sans stockage.
    }
  }, [theme])

  return (
    <button
      type="button"
      aria-label={`Theme : ${theme}`}
      title={`Theme : ${theme}`}
      className="gelule bascule"
      onClick={() => {
        setTheme((actuel) => CYCLE[(CYCLE.indexOf(actuel) + 1) % CYCLE.length] ?? 'systeme')
      }}
    >
      <Pictogramme theme={theme} />
    </button>
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
    // Le fond est pose ici et non dans le contenu : ancre plus bas, il
    // commencait sous la barre et laissait une bande plus sombre derriere elle.
    <div className="app-shell app-shell-fond">
      <Fond />
      <Barre />
      <main className="principal">
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
