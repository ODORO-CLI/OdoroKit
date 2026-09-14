/**
 * Manifeste — studio de design augmente.
 *
 * ## La reference : Auralis (GetLayers)
 *
 * Un vide argente en WebGL qui tient toute la page, une barre de verre, deux
 * mots en capitales espacees de part et d autre de l objet — « Imagine »,
 * « Manifeste » — des etiquettes en gelule, et des actes qui defilent par-dessus
 * la scene. La scene est le site ; le texte ne fait que passer.
 *
 * ## Ce qui n appartient qu a elle
 *
 * Le **mecanisme** est **le vide colle** : la sphere de particules reste fixe
 * derriere trois actes epingles qui la traversent au defilement — le cadrage,
 * la fabrication, la livraison. La scene ne bouge pas ; c est le panneau qui
 * change de cote et de contenu, acte apres acte, et son titre se **decode**
 * a chaque changement.
 *
 * ## L univers (UNIVERS.md)
 *
 * - Fond F-webgl : `ParticleSphere` fixe derriere toute la page, une seule
 *   surface WebGL.
 * - Signature M-epingle : `Epingle` a trois actes. La progression continue
 *   (`--p`) remplit le rail des actes, sans re-rendre la page.
 * - Texte anime : `DecodeText` sur le titre de chaque acte.
 * - Structure : deux mots autour de l objet → actes epingles → manifeste →
 *   C1 (quatre nombres en verre) → A12 (l adresse en clair, soulignee, avec
 *   un ↗) → P9 (les horloges des deux villes et leurs coordonnees, en mono).
 * - A12 · P9 · C1.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { type CSSProperties, type ReactElement } from 'react'

import { ParticleSphere } from '@/odoro/background/ParticleSphere.jsx'
import { OrbitingDots } from '@/odoro/effect/OrbitingDots.jsx'
import { DecodeText } from '@/odoro/text/DecodeText.jsx'
import { SpotlightCard } from '@/odoro/ui/SpotlightCard.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreGelule,
  CHROME,
  Chiffres,
  Etiquette,
  Grain,
  Horloge,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  usePolices,
  verre,
} from './marche.jsx'
import { accentDoux, encreSurSombre } from './palettes.js'
import { Epingle } from './scene.jsx'

/* ============================ Les donnees ============================== */

/** Un acte : ce que le studio fait, dans l ordre ou il le fait. */
interface Acte {
  readonly rang: string
  readonly titre: string
  readonly texte: string
  readonly etiquettes: readonly string[]
  /** Le cote ou tombe le panneau : les actes ne se posent pas au meme endroit. */
  readonly cote: 'gauche' | 'centre' | 'droite'
}

const ACTES: readonly Acte[] = [
  {
    rang: 'I',
    titre: 'Le cadrage',
    texte:
      'Deux semaines pour ecrire ce que le produit doit faire, et ce qu il ne fera pas. Le document tient en huit pages et il est signe des deux cotes.',
    etiquettes: ['Recherche', 'Strategie', 'Ecriture'],
    cote: 'gauche',
  },
  {
    rang: 'II',
    titre: 'La fabrication',
    texte:
      'Systeme de composants, ecrans, mouvements, scenes. Une livraison par semaine, jouable, jamais une planche figee.',
    etiquettes: ['Systeme', 'Interfaces', 'Mouvement', 'Temps reel'],
    cote: 'droite',
  },
  {
    rang: 'III',
    titre: 'La livraison',
    texte:
      'Le code est le livrable. Vos equipes le recoivent avec sa documentation, ses tests, et deux mois de presence.',
    etiquettes: ['Code', 'Documentation', 'Passation'],
    cote: 'centre',
  },
]

/** Les deux villes du studio : l heure vraie, et l endroit exact. */
const VILLES = [
  {
    ville: 'Paris',
    fuseau: 'Europe/Paris',
    coordonnees: '48.8687 N — 2.3475 E',
    adresse: '18 rue du Sentier\n75002 Paris',
    quoi: 'Cadrage, interfaces, temps reel',
  },
  {
    ville: 'Montreal',
    fuseau: 'America/Toronto',
    coordonnees: '45.5205 N — 73.5793 O',
    adresse: '5445 boulevard Saint-Laurent\nH2T 1S1 Montreal',
    quoi: 'Rendu, mouvement, passation',
  },
] as const

/** Les liens du pied, en une seule ligne : le plan tient dans la barre. */
const PIED_LIENS = [
  ['#actes', 'Les actes'],
  ['#chiffres', 'Le studio'],
  ['#ecrire', 'bonjour@manifeste.studio'],
  ['#ecrire', 'emplois@manifeste.studio'],
] as const

/* ============================ Le rendu ================================= */

/**
 * Le rail des actes : trois crans, et une jauge qui se remplit avec `--p`.
 *
 * Les crans changent avec l acte — trois re-rendus pour toute la scene ; la
 * jauge, elle, est du CSS pur sur la variable que `Epingle` ecrit a chaque
 * image, et ne coute rien.
 */
function Rail({ acte }: { readonly acte: number }): ReactElement {
  return (
    <div className="o-hidden o-shrink-0 o-flex-col o-gap-8 md:o-flex" aria-hidden="true">
      <ol className="o-m-0 o-flex o-list-none o-flex-col o-gap-6 o-p-0">
        {ACTES.map((a, rang) => (
          <li
            key={a.rang}
            className="o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest"
          >
            <span
              className="o-block o-h-px o-transition-all"
              style={{
                backgroundColor:
                  rang <= acte
                    ? encreSurSombre()
                    : 'color-mix(in oklab, white 22%, transparent)',
                width: rang === acte ? '3rem' : '1.75rem',
              }}
            />
            <span
              style={{
                color: rang === acte ? encreSurSombre() : 'var(--o-palette-zinc-500)',
              }}
            >
              {a.rang}
            </span>
          </li>
        ))}
      </ol>
      <div
        className="o-relative o-h-28 o-overflow-hidden o-rounded-full"
        style={{
          width: 2,
          backgroundColor: 'color-mix(in oklab, white 16%, transparent)',
        }}
      >
        <span
          className="o-absolute o-inset-x-0 o-top-0 o-block"
          style={
            {
              height: 'calc(var(--p, 0) * 100%)',
              backgroundColor: encreSurSombre(),
            } as CSSProperties
          }
        />
      </div>
    </div>
  )
}

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('grotesk')

  return (
    <Porte forme="zoom" marque="Manifeste">
      <div className="o-relative" style={{ ...nuit('zinc'), ...polices }}>
        {/* Le vide, colle derriere toute la page. Une seule surface WebGL. */}
        <div className="o-pointer-events-none o-fixed o-inset-0 o-z-0">
          <ParticleSphere
            className="o-absolute o-inset-0"
            points={4200}
            size={2.2}
            rpm={0.8}
            colors={['--o-theme-bg', '--o-vitrine-300', '--o-vitrine-500']}
            poster="o-bg-zinc-950"
          />
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, transparent 30%, color-mix(in oklab, var(--o-palette-zinc-950) 55%, transparent) 70%, var(--o-palette-zinc-950) 100%)',
            }}
          />
          <Grain opacite={0.08} />
        </div>

        <BarreGelule
          marque="Manifeste"
          liens={[
            ['#actes', 'Les actes'],
            ['#chiffres', 'Le studio'],
            ['#ecrire', 'Dire bonjour'],
          ]}
          action={['#ecrire', 'Commencer un projet']}
        />

        {/* ================= L ouverture : deux mots autour de l objet ==
            La hauteur retire les barres de la documentation : les deux mots,
            les gelules et la note tiennent alors dans un seul ecran. */}
        <header
          className="o-relative o-z-10 o-flex o-flex-col o-justify-between o-px-6 o-pb-10 o-pt-28 md:o-px-10"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <div className="o-flex o-justify-center">
            <Surgit>
              <Etiquette>Studio de design augmente — Paris, Montreal</Etiquette>
            </Surgit>
          </div>

          {/* Les deux mots se rangent de part et d autre du vide : ils ne sont
              pas centres, c est l objet qui l est. */}
          <div className="o-flex o-flex-col o-items-center o-gap-4 md:o-flex-row md:o-items-baseline md:o-justify-between md:o-gap-10">
            <Surgit
              delai={200}
              as="h1"
              className="o-m-0 o-uppercase o-text-zinc-50"
              style={{
                ...affiche('l', 300),
                letterSpacing: '0.16em',
                fontSize: 'clamp(2rem, 5.6vw, 5.5rem)',
                lineHeight: 1,
              }}
            >
              Imagine
            </Surgit>
            <Surgit
              delai={340}
              as="p"
              className="o-m-0 o-uppercase o-text-zinc-50"
              style={{
                ...affiche('l', 300),
                letterSpacing: '0.16em',
                fontSize: 'clamp(2rem, 5.6vw, 5.5rem)',
                lineHeight: 1,
              }}
            >
              Manifeste
            </Surgit>
          </div>

          <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
            <Surgit delai={520} className="o-flex o-flex-wrap o-gap-2">
              {['IA generative', 'Systemes de mouvement', 'Temps reel', 'Identite'].map(
                (m) => (
                  <span
                    key={m}
                    className="o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200 o-backdrop-blur-md"
                  >
                    {m}
                  </span>
                ),
              )}
            </Surgit>
            <Surgit
              delai={600}
              as="p"
              className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-text-right"
            >
              Design, systemes et interfaces vivantes.
              <br />
              La machine est un instrument.
            </Surgit>
            <Surgit delai={680}>
              <Actions
                pleine={[
                  '#ecrire',
                  <>
                    Commencer un projet{' '}
                    <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                  </>,
                ]}
                fantome={['#actes', 'Voir le travail']}
              />
            </Surgit>
          </div>
        </header>

        <main>
          {/* ================= Les actes, epingles sur la scene ===========
              La scene reste collee pendant trois ecrans et demi ; seul le
              panneau change, et il ne se pose jamais deux fois au meme
              endroit. */}
          <section
            id="actes"
            className="o-relative o-z-10 o-scroll-mt-24"
            aria-label="Les trois actes d un projet"
          >
            <Epingle ecrans={3.6} actes={3}>
              {(acte) => {
                const a = ACTES[acte] ?? ACTES[0]
                if (a === undefined) return null
                const place = {
                  gauche: 'o-justify-start',
                  centre: 'o-justify-center',
                  droite: 'o-justify-end',
                }[a.cote]
                return (
                  <div className="o-mx-auto o-flex o-h-full o-max-w-7xl o-items-center o-gap-8 o-px-6 o-py-10 md:o-px-10">
                    <Rail acte={acte} />

                    <div className={`o-flex o-min-w-0 o-grow ${place}`}>
                      <SpotlightCard
                        className={`${verre(true)} o-w-full o-max-w-xl o-p-8 md:o-p-10`}
                        color={accentDoux(400, 90)}
                        radius={340}
                        strength={0.32}
                      >
                        <div className="o-flex o-items-start o-justify-between o-gap-6">
                          <Indice rang={a.rang}>Acte {a.rang} sur III</Indice>
                          {/* Le numero de l acte, entoure de ses satellites :
                              la sphere derriere continue dans le panneau. */}
                          <OrbitingDots
                            count={4}
                            radius={30}
                            speed={9000}
                            color={encreSurSombre()}
                            className="o-relative o-hidden o-size-10 o-shrink-0 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-white-20 o-font-mono o-text-xs o-text-zinc-200 sm:o-flex"
                          >
                            {a.rang}
                          </OrbitingDots>
                        </div>

                        <h2
                          className="o-m-0 o-mt-6 o-text-zinc-50"
                          style={affiche('m', 300)}
                        >
                          <DecodeText
                            key={a.rang}
                            as="span"
                            trigger="mount"
                            duration={900}
                          >
                            {a.titre}
                          </DecodeText>
                        </h2>
                        <p className="o-m-0 o-mt-5 o-text-base o-leading-relaxed o-text-zinc-300">
                          {a.texte}
                        </p>
                        <ul className="o-m-0 o-mt-6 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
                          {a.etiquettes.map((e) => (
                            <li
                              key={e}
                              className="o-rounded-full o-border-w-1 o-border-white-20 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200"
                            >
                              {e}
                            </li>
                          ))}
                        </ul>
                      </SpotlightCard>
                    </div>
                  </div>
                )
              }}
            </Epingle>
          </section>

          {/* ================= Le manifeste, seul sur son ecran ============ */}
          <section className="o-relative o-z-10 o-flex o-min-h-screen o-items-center o-px-6 o-py-24 md:o-px-10">
            <div className="o-mx-auto o-w-full o-max-w-6xl">
              <Reveal>
                <Manifeste eteint="Nous ne demandons pas a la machine d avoir des idees.">
                  Nous lui demandons de les rendre visibles plus vite.
                </Manifeste>
              </Reveal>
            </div>
          </section>

          {/* ================= C1 : quatre nombres en verre ================= */}
          <section
            id="chiffres"
            className="o-relative o-z-10 o-scroll-mt-24 o-px-6 o-pb-24 o-pt-10 md:o-px-10 md:o-pb-32"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Indice rang="04">Le studio</Indice>
              <div className="o-mt-8">
                <Chiffres
                  verre
                  nombres={[
                    { valeur: '19', quoi: 'personnes, deux villes' },
                    { valeur: '34', quoi: 'produits livres depuis 2022' },
                    { valeur: '8', quoi: 'pages de cadrage, jamais plus' },
                    { valeur: '2', quoi: 'mois de presence apres livraison' },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* ================= A12 : l adresse en clair, soulignee, avec ↗ === */}
          <section
            id="ecrire"
            className="o-relative o-z-10 o-flex o-scroll-mt-24 o-flex-col o-items-center o-justify-center o-px-6 o-py-28 o-text-center md:o-py-40"
          >
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Ecrivez ce que vous voulez rendre visible
            </p>
            <a
              href="mailto:bonjour@manifeste.studio"
              className="o-mt-10 o-inline-block o-max-w-full o-break-words o-no-underline o-text-zinc-50 o-transition-colors hover:o-text-zinc-300 focus:o-ring"
              style={{
                ...affiche('l', 300),
                fontSize: 'clamp(1.5rem, 5.2vw, 4.5rem)',
                textDecorationLine: 'underline',
                textDecorationThickness: '1px',
                textUnderlineOffset: '0.16em',
              }}
            >
              bonjour@manifeste.studio
              <Icon
                icon={ArrowUpRight}
                size={30}
                aria-hidden="true"
                className="o-ml-3 o-inline-block o-align-baseline"
              />
            </a>
            <p className="o-m-0 o-mt-10 o-max-w-md o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
              Reponse sous trois jours, avec un premier cadrage d une page.
              <br />
              Pas de devis avant de s etre parle.
            </p>
          </section>
        </main>

        {/* ================= P9 : les horloges des deux villes ============= */}
        <footer
          className="o-relative o-z-10 o-border-t o-border-white-10 o-px-6 o-pb-8 o-pt-12 md:o-px-10"
          style={{
            backgroundColor:
              'color-mix(in oklab, var(--o-palette-zinc-950) 86%, transparent)',
          }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            {/* Une ville par ligne, pas une colonne : l heure a gauche, le
                point exact au milieu, ce qu on y fait a droite. */}
            <dl className="o-m-0">
              {VILLES.map((v) => (
                <div
                  key={v.ville}
                  className="o-grid o-gap-x-8 o-gap-y-3 o-border-b o-border-white-10 o-py-7 md:o-grid-cols-12 md:o-items-baseline"
                >
                  <dt
                    className="o-m-0 o-font-mono o-uppercase o-tabular-nums o-tracking-tight o-text-zinc-50 md:o-col-span-5"
                    style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)' }}
                  >
                    <Horloge ville={v.ville} fuseau={v.fuseau} />
                  </dt>
                  <dd className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-4">
                    {v.adresse.split('\n').map((ligne) => (
                      <span key={ligne} className="o-block">
                        {ligne}
                      </span>
                    ))}
                    <span className="o-mt-1 o-block" style={{ color: encreSurSombre() }}>
                      {v.coordonnees}
                    </span>
                  </dd>
                  <dd className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-col-span-3 md:o-text-right">
                    {v.quoi}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="o-mt-8 o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              <span>Manifeste SAS — RCS Paris 911 002 388</span>
              <nav aria-label="Pied de page" className="o-flex o-flex-wrap o-gap-6">
                {PIED_LIENS.map(([href, mot]) => (
                  <a
                    key={mot}
                    href={href}
                    className="o-no-underline o-text-zinc-400 o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                  >
                    {mot}
                  </a>
                ))}
              </nav>
              <span>© 2026 Manifeste</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
