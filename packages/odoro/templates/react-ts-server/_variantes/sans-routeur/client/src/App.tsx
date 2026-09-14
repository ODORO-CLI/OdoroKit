/**
 * Toute la page, en un fichier.
 *
 * ## Une seule page
 *
 * Le routeur n'a pas ete retenu a la creation : il n'y a donc ni `router.tsx`
 * ni navigation entre pages, et les sections se suivent. Le dessin est le meme
 * que dans la version routee.
 *
 * Pour en ajouter un plus tard, `@odoro-cli/libs/router` est deja installe : il
 * vient avec les bibliotheques.
 *
 * ## La barre de navigation
 *
 * Elle ne peint pas de bandeau : ce sont des gelules posees sur ce qu'il y a
 * derriere, avec un flou d'arriere-plan. Le fond decoratif continue donc de
 * passer dessous, au lieu d'etre coupe par une bande opaque.
 *
 * @module
 */

import { Reveal, Stagger } from '@odoro-cli/libs/motion'
import { buttonClasses } from '@odoro-cli/libs/ui'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

import { Fond } from '@/fond'

/* -------------------------------------------------------------------------- */
/*  Marque                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Le signe de la marque.
 *
 * La taille est en style et non en classe : une classe utilitaire a valeur
 * arbitraire n'est emise que si le compilateur l'a vue passer, et une classe
 * absente ne peint rien — le signe serait sans dimensions, donc invisible.
 */
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

/**
 * La surface d'une gelule.
 *
 * Le systeme decline les echelles de noir et de blanc, mais pas leurs variantes
 * sombres en alpha. Le melange se fait donc en style, ou il est exact et suit
 * le theme sans qu'on ait a redire chaque couleur.
 */
const GELULE: CSSProperties = {
  backgroundColor: 'color-mix(in oklab, var(--o-theme-bg) 72%, transparent)',
  borderColor: 'color-mix(in oklab, var(--o-theme-fg) 12%, transparent)',
}

/** La barre : la marque, et le lien vers le site. */
function Barre(): ReactElement {
  return (
    <header className="o-sticky o-top-0 o-z-20 o-px-5 md:o-px-8">
      <div className="o-mx-auto o-flex o-h-20 o-w-full o-max-w-5xl o-items-center o-gap-3">
        <span
          className="o-inline-flex o-h-14 o-shrink-0 o-items-center o-gap-2.5 o-rounded-full o-border-w-1 o-pl-5 o-pr-6 o-backdrop-blur-xl"
          style={GELULE}
        >
          <span className="o-text-brand-500">
            <Signe />
          </span>
          <span className="o-text-lg o-font-bold o-tracking-wide o-text-zinc-950 dark:o-text-white">
            ODORO
          </span>
        </span>

        <div className="o-ml-auto o-flex o-items-center o-gap-3">
          <a
            href="https://odoro.dev"
            target="_blank"
            rel="noreferrer"
            className="o-inline-flex o-h-14 o-shrink-0 o-items-center o-rounded-full o-border-w-1 o-px-5 o-text-sm o-no-underline o-backdrop-blur-xl o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white"
            style={GELULE}
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
 * navigateur. C'est ce qui permet a une page laissee en « systeme » de suivre
 * le passage en nuit sans etre rouverte.
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
    // reste une reponse valable ; echouer ici priverait la page de son rendu.
    return 'systeme'
  }
}

/** Les trois pictogrammes, dessines plutot qu'importes : les icones sont optionnelles. */
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

/**
 * La bascule de theme.
 *
 * Trois etats et non deux : « systeme » est un choix a part entiere, et le
 * retirer obligerait un visiteur a re-choisir a chaque changement de sa
 * preference.
 */
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
      onClick={() => {
        setTheme((actuel) => CYCLE[(CYCLE.indexOf(actuel) + 1) % CYCLE.length] ?? 'systeme')
      }}
      className="o-inline-flex o-size-14 o-shrink-0 o-cursor-pointer o-items-center o-justify-center o-rounded-full o-border-w-1 o-backdrop-blur-xl o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white"
      style={GELULE}
    >
      <Pictogramme theme={theme} />
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                   */
/* -------------------------------------------------------------------------- */

/** Trois faits, pas trois slogans. */
const FAITS = ['Zero configuration', 'Theme clair et sombre', 'Mouvement reduit respecte']

/** Ce que la fenetre du produit montre. */
const EXTRAIT = `export function App() {
  return (
    <Reveal>
      <h1 className="o-text-6xl o-font-bold">
        Votre premiere page.
      </h1>
    </Reveal>
  )
}`

/** Une fenetre de navigateur miniature. */
function Fenetre(): ReactElement {
  return (
    <div className="o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-shadow-2xl">
      <div className="o-flex o-items-center o-gap-2 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-2.5">
        <span className="o-flex o-gap-1.5" aria-hidden="true">
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
        </span>
        <span className="o-ml-2 o-font-mono o-text-xs o-text-zinc-400">src/App.tsx</span>
      </div>
      <pre className="o-m-0 o-overflow-x-auto o-p-5 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
        {EXTRAIT}
      </pre>
    </div>
  )
}

/** Le hero : la promesse, les actions, et la fenetre du produit. */
function Hero(): ReactElement {
  return (
    <section className="o-relative o-px-6 o-pb-20 o-pt-16 md:o-pt-24">
      <div className="o-mx-auto o-w-full o-max-w-5xl">
        <Reveal>
          <span className="o-inline-flex o-items-center o-gap-2 o-whitespace-nowrap o-rounded-full o-border-w-1 o-border-brand-500/30 o-bg-brand-500/10 o-px-3 o-py-1 o-text-xs o-font-medium o-text-brand-600 dark:o-text-brand-400">
            <Signe taille="0.9rem" />
            Genere par odoro create
          </span>

          <h1 className="o-mt-6 o-max-w-3xl o-text-5xl o-font-bold o-tracking-tight md:o-text-6xl">
            Votre premiere page, <span className="o-text-brand-500">deja vivante</span>.
          </h1>

          <p className="o-mt-5 o-max-w-xl o-text-lg o-text-zinc-500 dark:o-text-zinc-400">
            Le moteur d animation et le systeme de style viennent de la meme librairie.
            Modifiez cette page : elle se recharge sans perdre son etat.
          </p>
        </Reveal>

        <Stagger step={70} className="o-mt-8 o-flex o-flex-wrap o-items-center o-gap-3">
          <a
            href="#piliers"
            className={`o-no-underline ${buttonClasses({ tone: 'primary' })}`}
          >
            Voir ce qui est inclus
          </a>
          <a
            href="https://odoro.dev/docs"
            target="_blank"
            rel="noreferrer"
            className={`o-no-underline ${buttonClasses({ tone: 'secondary' })}`}
          >
            Documentation
          </a>
        </Stagger>

        <Stagger step={60} className="o-mt-6 o-flex o-flex-wrap o-gap-2">
          {FAITS.map((fait) => (
            <span
              key={fait}
              className="o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-3 o-py-1 o-text-xs o-text-zinc-500 dark:o-text-zinc-400"
            >
              {fait}
            </span>
          ))}
        </Stagger>

        <Reveal>
          <div className="o-mt-14">
            <Fenetre />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Ce que le projet a deja sous la main. */
const PILIERS = [
  {
    titre: 'Animations',
    texte:
      "Une couche mince sur le moteur du navigateur. Le mouvement reduit est respecte d'office.",
  },
  {
    titre: 'Styles',
    texte: 'Des jetons en source de verite, une feuille statique, aucun scan a l execution.',
  },
  {
    titre: 'Interface',
    texte: 'Des composants qui lisent les memes jetons que votre code : les rethemer suffit.',
  },
]

/** La section des piliers. */
function Piliers(): ReactElement {
  return (
    <section
      id="piliers"
      className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-20"
    >
      <div className="o-mx-auto o-w-full o-max-w-5xl">
        <h2 className="o-text-sm o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400">
          Ce qui est deja la
        </h2>

        <Stagger step={90} className="o-mt-8 o-grid o-gap-4 md:o-grid-cols-3">
          {PILIERS.map((pilier, index) => (
            <article
              key={pilier.titre}
              className="o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-6"
            >
              <span className="o-font-mono o-text-xs o-text-brand-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="o-mt-3 o-text-lg o-font-semibold o-tracking-tight">
                {pilier.titre}
              </h3>
              <p className="o-mt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                {pilier.texte}
              </p>
            </article>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/** La commande que l'on copie le plus souvent. */
const COMMANDE = 'odoro add text/count-up'

/** La cloture : une commande, et la porte vers le catalogue. */
function Cloture(): ReactElement {
  const [copie, setCopie] = useState(false)

  return (
    <section className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24">
      <div className="o-mx-auto o-w-full o-max-w-3xl o-text-center">
        <Reveal>
          <h2 className="o-text-3xl o-font-bold o-tracking-tight md:o-text-4xl">
            Ajoutez un composant, sans quitter le terminal.
          </h2>
          <p className="o-mx-auto o-mt-4 o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
            Le registre copie le code dans votre projet. Il vous appartient : on le lit,
            on le modifie, il ne se met pas a jour dans votre dos.
          </p>

          <div className="o-mx-auto o-mt-8 o-flex o-max-w-md o-items-center o-gap-2 o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-2 o-pl-4">
            <code className="o-flex-1 o-text-left o-font-mono o-text-sm">{COMMANDE}</code>
            <button
              type="button"
              className={buttonClasses({ tone: 'ghost', size: 'sm' })}
              onClick={() => {
                // Le presse-papiers peut etre refuse — hors contexte sur, ou
                // permission retiree. L'echec ne casse pas la page.
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
            href="https://odoro.dev/docs/registry"
            target="_blank"
            rel="noreferrer"
            className="o-mt-6 o-inline-block o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-no-underline hover:o-text-brand-500"
          >
            Parcourir le catalogue
          </a>
        </Reveal>
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
    // `relative` porte le fond, pose ici et non dans le contenu : ancre plus
    // bas, il commencait sous la barre et laissait une bande plus sombre
    // derriere elle en haut de page.
    <div className="app-shell o-relative">
      <Fond />
      <Barre />
      <main className="o-relative">
        <Hero />
        <Piliers />
        <Cloture />
      </main>
      <footer className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-8">
        <div className="o-mx-auto o-flex o-w-full o-max-w-5xl o-items-center o-justify-between o-gap-4 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          <span className="o-inline-flex o-items-center o-gap-2">
            <span className="o-text-brand-500">
              <Signe taille="1.1rem" />
            </span>
            <span className="o-font-semibold o-tracking-wide">ODORO</span>
          </span>
          <span>Construit avec Odoro.</span>
        </div>
      </footer>
    </div>
  )
}
