/**
 * Toute la page, en un fichier.
 *
 * ## Pourquoi tout ici
 *
 * Un projet qui demarre se lit mieux d'un seul tenant : on voit la navigation,
 * les sections et le pied de page sans ouvrir huit fichiers. Chaque bloc est
 * une fonction ; le jour ou l'un d'eux grossit, il se deplace dans son propre
 * fichier d'un couper-coller.
 *
 * Deux choses vivent a part, et pour une raison : le **routeur**, qui est la
 * seule dependance de routage et se change sans toucher a la page ; et le
 * **fond**, qui est le seul morceau a dependre du moteur.
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
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { Fond } from '@/fond'
import { Link, Routeur, useLocation } from '@/router'

/* -------------------------------------------------------------------------- */
/*  Marque                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Le signe de la marque.
 *
 * Dessine dans le flux plutot que charge depuis `public/` : il prend la couleur
 * de son parent par `currentColor`, donc la teinte de marque en clair comme en
 * sombre, sans qu'il y ait deux fichiers a tenir.
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
 * sombres en alpha : `o-bg-white/70` et son pendant `dark:` n'existent pas en
 * une seule classe. Le melange se fait donc en style, ou il est exact et suit
 * le theme sans qu'on ait a redire chaque couleur.
 */
const GELULE: CSSProperties = {
  backgroundColor: 'color-mix(in oklab, var(--o-theme-bg) 72%, transparent)',
  borderColor: 'color-mix(in oklab, var(--o-theme-fg) 12%, transparent)',
}

/** Les entrees de la navigation. */
const LIENS = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'A propos' },
]

/** Un lien de la gelule de navigation, actif sur la route courante. */
function LienHaut({ to, label }: { readonly to: string; readonly label: string }): ReactElement {
  const { pathname } = useLocation()
  const actif = pathname === to

  return (
    <Link
      to={to}
      className={[
        'o-rounded-full o-px-4 o-py-2 o-text-sm o-no-underline o-transition-colors',
        actif
          ? 'o-font-medium o-text-zinc-950 dark:o-text-white'
          : 'o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white',
      ].join(' ')}
      style={actif ? GELULE : undefined}
    >
      {label}
    </Link>
  )
}

/** La barre : la marque, la navigation, et le lien vers le site. */
function Barre(): ReactElement {
  return (
    <header className="o-sticky o-top-0 o-z-20 o-px-5 md:o-px-8">
      <div className="o-mx-auto o-flex o-h-20 o-w-full o-max-w-5xl o-items-center o-gap-3">
        <Link
          to="/"
          className="o-inline-flex o-h-14 o-shrink-0 o-items-center o-gap-2.5 o-rounded-full o-border-w-1 o-pl-5 o-pr-6 o-no-underline o-backdrop-blur-xl"
          style={GELULE}
        >
          <span className="o-text-brand-500">
            <Signe />
          </span>
          <span className="o-text-lg o-font-bold o-tracking-wide o-text-zinc-950 dark:o-text-white">
            ODORO
          </span>
        </Link>

        <nav
          aria-label="Navigation"
          className="o-inline-flex o-h-14 o-items-center o-gap-1 o-rounded-full o-border-w-1 o-px-2 o-backdrop-blur-xl"
          style={GELULE}
        >
          {LIENS.map((lien) => (
            <LienHaut key={lien.to} to={lien.to} label={lien.label} />
          ))}
        </nav>

        <a
          href="https://odoro.dev"
          target="_blank"
          rel="noreferrer"
          className="o-ml-auto o-inline-flex o-h-14 o-shrink-0 o-items-center o-rounded-full o-border-w-1 o-px-5 o-text-sm o-no-underline o-backdrop-blur-xl o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white"
          style={GELULE}
        >
          odoro.dev
        </a>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sections de la page d'accueil                                              */
/* -------------------------------------------------------------------------- */

/** Trois faits, pas trois slogans. */
const FAITS = ['Zero configuration', 'Theme clair et sombre', 'Mouvement reduit respecte']

/** Ce que la fenetre du produit montre. */
const EXTRAIT = `export function Accueil() {
  return (
    <Reveal>
      <h1 className="o-text-6xl o-font-bold">
        Votre premiere page.
      </h1>
    </Reveal>
  )
}`

/**
 * Une fenetre de navigateur miniature.
 *
 * Les trois pastilles sont decoratives : elles disent « navigateur » sans rien
 * ajouter a ce qu'un lecteur d'ecran doit entendre.
 */
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
            Le routeur, les animations et le systeme de style viennent de la meme
            librairie. Modifiez cette page : elle se recharge sans perdre son etat.
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
    titre: 'Routeur',
    texte:
      'Segments dynamiques, routes imbriquees, chargement paresseux et transitions de page.',
  },
  {
    titre: 'Animations',
    texte:
      "Une couche mince sur le moteur du navigateur. Le mouvement reduit est respecte d'office.",
  },
  {
    titre: 'Styles',
    texte: 'Des jetons en source de verite, une feuille statique, aucun scan a l execution.',
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
/*  Pages                                                                      */
/* -------------------------------------------------------------------------- */

/** La page d'accueil. */
function Accueil(): ReactElement {
  return (
    <>
      <Fond />
      <Hero />
      <Piliers />
      <Cloture />
    </>
  )
}

/** Ce que le projet embarque, tel qu'il a ete cree. */
const REPERES = [
  { cle: 'Moteur', valeur: 'odoro — serveur de developpement et compilation' },
  { cle: 'Styles', valeur: '@odoro-cli/libs — jetons, utilitaires, composants' },
  { cle: 'Registre', valeur: 'register.odoro.dev — copie dans votre projet' },
]

/** Une seconde page, pour montrer le routeur a l'oeuvre. */
function APropos(): ReactElement {
  return (
    <section className="o-px-6 o-py-24">
      <div className="o-mx-auto o-w-full o-max-w-3xl">
        <Reveal>
          <h1 className="o-text-4xl o-font-bold o-tracking-tight">A propos</h1>
          <p className="o-mt-4 o-text-zinc-500 dark:o-text-zinc-400">
            Cette page existe pour montrer le routeur : la navigation ne recharge rien,
            et la transition est celle du navigateur.
          </p>

          <dl className="o-mt-10 o-border-t o-border-zinc-200 dark:o-border-zinc-800">
            {REPERES.map((repere) => (
              <div
                key={repere.cle}
                className="o-flex o-flex-col md:o-flex-row o-gap-1 md:o-gap-6 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-4"
              >
                <dt className="o-w-32 o-shrink-0 o-text-sm o-font-medium">{repere.cle}</dt>
                <dd className="o-m-0 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                  {repere.valeur}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}

/** Ce qui s'affiche quand aucune route ne correspond. */
function Introuvable(): ReactElement {
  return (
    <section className="o-px-6 o-py-32 o-text-center">
      <p className="o-font-mono o-text-sm o-text-brand-500">404</p>
      <h1 className="o-mt-3 o-text-3xl o-font-bold o-tracking-tight">
        Cette page n existe pas.
      </h1>
      <Link to="/" className="o-mt-6 o-inline-block o-text-sm">
        Retour a l accueil
      </Link>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Racine                                                                     */
/* -------------------------------------------------------------------------- */

/** L'enveloppe commune : barre, contenu, pied de page. */
function Coquille(contenu: ReactNode): ReactElement {
  return (
    <div className="app-shell">
      <Barre />
      {/* `relative` porte le fond decoratif, qui se place en absolu dedans. */}
      <main className="o-relative o-view-transition-page">{contenu}</main>
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

/** Racine de l'application. */
export function App(): ReactElement {
  return (
    <Routeur
      enveloppe={Coquille}
      accueil={<Accueil />}
      apropos={<APropos />}
      introuvable={<Introuvable />}
    />
  )
}
