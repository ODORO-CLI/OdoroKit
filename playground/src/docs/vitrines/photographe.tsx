/**
 * Maud Ferrand — photographe.
 *
 * ## Le parti pris : on ne descend pas une page de tirages, on la parcourt
 *
 * Blanc franc, le nom en grotesque noire qui remplit la largeur, et l heure de
 * Paris qui se rebat a chaque minute. Sous le nom, il n y a pas une grille :
 * il y a un **rail**. Les tirages se traversent de la gauche vers la droite
 * pendant qu on defile vers le bas — c est le geste d une table de contact,
 * pas celui d un mur de vignettes, et c est la signature de mouvement de la
 * page.
 *
 * ## Ce qui suit, et pourquoi chaque ecran a sa forme
 *
 * La **table lumineuse** est le mecanisme : seize planches qu on filtre par
 * rubrique, chacune avec son numero, sa focale et son lieu — les metadonnees
 * qu un commanditaire lit avant le sujet. Les series viennent ensuite, en
 * mosaiques inegales, avec leur legende posee dans la marge et collee pendant
 * qu on parcourt les tirages. L a propos est un seul paragraphe avec un
 * portrait qui reste. L appel n est pas une section : c est une adresse de
 * courriel en soixante-quatre pixels, soulignee. Le pied tient sur une ligne.
 *
 * ## Aucun chiffre
 *
 * Ni series livrees, ni annees de metier, ni clients reguliers. Un photographe
 * ne se choisit pas sur un tableau de bord : les seuls nombres de la page sont
 * les numeros de planche et les focales, et ce sont des reperes, pas des
 * arguments.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { HoverZoom } from '@/odoro/image/HoverZoom.jsx'
import { ParallaxImage } from '@/odoro/image/ParallaxImage.jsx'
import { Shuffle } from '@/odoro/text/Shuffle.jsx'
import { SegmentedControl } from '@/odoro/ui/SegmentedControl.jsx'

import { affiche, BarreCoins, CHROME, Horloge, Indice, Porte, Surgit, usePolices } from './marche.jsx'
import { photo } from './media.js'
import { encre } from './palettes.js'
import { Rail } from './scene.jsx'

/* ============================ Les donnees ============================== */

const RUBRIQUES = ['Portrait', 'Architecture', 'Paysage', 'Nature morte'] as const
type Rubrique = (typeof RUBRIQUES)[number]

/** Ce que chaque rubrique promet, en une phrase. */
const NOTES: Readonly<Record<Rubrique, string>> = {
  Portrait: 'En lumiere naturelle, sur une demi-journee. Les sujets ont le temps de cesser de poser.',
  Architecture: 'A l heure ou le batiment est le mieux servi par le ciel : reperage la veille, prise de vue a l aube.',
  Paysage: 'Des series longues, souvent au retour de la meme cote a deux saisons d ecart.',
  'Nature morte': 'Au studio, sur fond papier, une seule source. Objets, matieres, produits.',
}

/** Un tirage de la table lumineuse. */
interface Tirage {
  readonly graine: string
  readonly alt: string
  readonly rubrique: Rubrique
  readonly lieu: string
  readonly focale: string
  readonly portrait?: boolean
}

const TIRAGES: readonly Tirage[] = [
  { graine: 'lisiere-couverture', alt: 'Silhouette de profil, contre-jour', rubrique: 'Portrait', lieu: 'Paris', focale: '85 mm', portrait: true },
  { graine: 'sillon-blosne', alt: 'Facade en zinc et balcons filants', rubrique: 'Architecture', lieu: 'Rennes', focale: '24 mm' },
  { graine: 'tamaris-crique-9', alt: 'Calanque, eau turquoise, bateau', rubrique: 'Paysage', lieu: 'Cassis', focale: '35 mm' },
  { graine: 'cafe-guji', alt: 'Grains de cafe torrefies, gros plan', rubrique: 'Nature morte', lieu: 'Studio', focale: '100 mm', portrait: true },
  { graine: 'cadre-bandeau-six', alt: 'Facade moderniste, noir et blanc', rubrique: 'Architecture', lieu: 'Newport', focale: '50 mm' },
  { graine: 'bivouac-lofoten', alt: 'Village de pecheurs sous les sommets', rubrique: 'Paysage', lieu: 'Reine', focale: '28 mm' },
  { graine: 'tige-rose', alt: 'Roses serrees, vue de dessus', rubrique: 'Nature morte', lieu: 'Studio', focale: '90 mm' },
  { graine: 'lisiere-boutique-nantes', alt: 'Interieur de boutique, sol en damier', rubrique: 'Architecture', lieu: 'Nantes', focale: '35 mm' },
  { graine: 'cadre-archive-escalier', alt: 'Escalier en beton, vide central', rubrique: 'Architecture', lieu: 'Nantes', focale: '20 mm', portrait: true },
  { graine: 'tamaris-crique-1', alt: 'Falaises dans la brume, mer plate', rubrique: 'Paysage', lieu: 'Cotentin', focale: '70 mm' },
  { graine: 'tige-tulipes', alt: 'Tulipe striee, fond de bleuets', rubrique: 'Nature morte', lieu: 'Jardin', focale: '105 mm', portrait: true },
  { graine: 'lisiere-defile-2', alt: 'Silhouette en mouvement, defile en plein air', rubrique: 'Portrait', lieu: 'Arles', focale: '135 mm' },
  { graine: 'bivouac-atlas', alt: 'Vallee ocre, villages en terrasses', rubrique: 'Paysage', lieu: 'Haut Atlas', focale: '35 mm' },
  { graine: 'rasoir-outils', alt: 'Bol, blaireau et rasoir sur bois', rubrique: 'Nature morte', lieu: 'Studio', focale: '60 mm' },
  { graine: 'cadre-archive-bois', alt: 'Charpente en bois vue en contre-plongee', rubrique: 'Architecture', lieu: 'Vosges', focale: '16 mm' },
  { graine: 'cale-console', alt: 'Console de mixage, regie', rubrique: 'Nature morte', lieu: 'Lorient', focale: '50 mm' },
]

/** Les dix tirages du rail, dans l ordre ou ils se traversent. */
const RAIL = [0, 8, 2, 4, 10, 5, 1, 13, 12, 7].map((rang) => TIRAGES[rang]).filter((t): t is Tirage => t !== undefined)

const CLIENTS = ['Sillon', 'Lisiere', 'Les Tamaris', 'Brulerie Nord', 'Auber', 'Cale Seche', 'Tige & Co'] as const

/** L adresse, ecrite une fois. */
const COURRIEL = 'bonjour@maudferrand.fr'

/**
 * La place de chaque tirage dans la mosaique d une serie.
 *
 * Trois cadres, trois formats, trois hauteurs de depart : c est l inegalite
 * qui fait la mosaique, et une seule ligne de decalage suffit a la sortir de
 * la grille.
 */
const MOSAIQUE: readonly { readonly colonnes: string; readonly ratio: number; readonly decale: string }[] = [
  { colonnes: 'md:o-col-span-5', ratio: 3 / 4, decale: '' },
  { colonnes: 'md:o-col-span-7', ratio: 4 / 3, decale: 'md:o-mt-16' },
  { colonnes: 'md:o-col-span-7', ratio: 16 / 9, decale: '' },
]

/** Ou se posent les legendes collantes : sous les barres de la documentation. */
const COLLE = CHROME + 32

/** Le corps du nom : il remplit la largeur de la fenetre. */
const CORPS_NOM: CSSProperties = { ...affiche('xxl', 800), fontSize: 'clamp(3.5rem, 15.5vw, 17rem)', lineHeight: 0.86 }

/** Le corps de l heure, a droite du paragraphe. */
const CORPS_HEURE: CSSProperties = { ...affiche('m', 800), fontSize: 'clamp(2.25rem, 6vw, 5rem)', lineHeight: 0.9 }

/* ============================ Le rendu ================================= */

/**
 * L heure de Paris, rebattue a chaque minute.
 *
 * Le battage n a de sens que s il arrive quand la valeur change : la cle porte
 * l heure, ce qui remonte le composant a la minute et relance les lettres. Le
 * texte est annonce une fois, poliment, et pas a chaque battement.
 */
function HeureBattue(): ReactElement {
  const [heure, setHeure] = useState('')
  useEffect(() => {
    const format = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
    const tic = (): void => {
      setHeure(format.format(new Date()))
    }
    tic()
    const id = window.setInterval(tic, 15_000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  return (
    <p className="o-m-0 o-tabular-nums o-uppercase" style={CORPS_HEURE}>
      <span className="o-sr-only">Heure a Paris : {heure}</span>
      <span aria-hidden="true">
        {heure === '' ? '--:--' : <Shuffle key={heure} declenchement="montage" duration={700} step={45} tilt={24}>{heure}</Shuffle>}
        <span className="o-ml-4 o-font-mono o-text-xs o-align-middle o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">Paris</span>
      </span>
    </p>
  )
}

/**
 * Un tirage du rail : le cadre, la photographie, la legende dessous.
 *
 * Tous les tirages ont **la meme hauteur** et c est leur largeur qui change
 * avec le format : c est ainsi qu une table de contact est rangee, et c est la
 * seule maniere d aligner les legendes d un bout a l autre du rail.
 */
function Wagon({ tirage, rang }: { readonly tirage: Tirage; readonly rang: number }): ReactElement {
  return (
    <figure className="o-m-0 o-mr-4 o-shrink-0 md:o-mr-6">
      <div
        className="o-relative o-overflow-hidden o-bg-zinc-100 dark:o-bg-zinc-900"
        style={{ height: 'min(56vh, 30rem)', aspectRatio: tirage.portrait === true ? '3 / 4' : '4 / 3' }}
      >
        <ParallaxImage
          src={photo(tirage.graine, 1000, 1200)}
          alt={tirage.alt}
          ratio={tirage.portrait === true ? 0.75 : 1.333}
          strength={0.18}
          className="o-absolute o-inset-0 o-size-full"
        />
      </div>
      <figcaption className="o-mt-3 o-flex o-items-baseline o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        <span>
          {String(rang + 1).padStart(2, '0')} — {tirage.rubrique}
        </span>
        <span>
          {tirage.lieu} · {tirage.focale}
        </span>
      </figcaption>
    </figure>
  )
}

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  const [rubrique, setRubrique] = useState<Rubrique | 'Tout'>('Tout')
  const retenus = useMemo(() => TIRAGES.filter((t) => rubrique === 'Tout' || t.rubrique === rubrique), [rubrique])

  return (
    <Porte forme="trou" marque="Maud Ferrand" sombre={false}>
      <div className="o-bg-white o-text-zinc-950 dark:o-bg-zinc-950 dark:o-text-zinc-50" style={polices}>
        {/* ================= L ouverture : le nom, et l heure ============ */}
        <header className="o-relative o-isolate o-overflow-hidden">
          <BarreCoins
            marque="Maud Ferrand"
            liens={[['#rail', 'Les tirages'], ['#table', 'La table'], ['#series', 'Les series'], ['#ecrire', 'Ecrire']]}
            droite={<Horloge ville="Paris" />}
            sombre={false}
          />

          <div className="o-px-6 o-pb-16 o-pt-6 md:o-px-8">
            <div className="o-flex o-flex-wrap o-items-start o-justify-between o-gap-6">
              <Surgit>
                <span className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-black-20 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest dark:o-border-zinc-700" style={{ transform: 'rotate(-6deg)' }}>
                  <span aria-hidden="true" className="o-size-1.5 o-rounded-full" style={{ backgroundColor: encre() }} />
                  Disponible en octobre
                </span>
              </Surgit>
              <Surgit delai={200} className="o-flex o-flex-wrap o-gap-2">
                {([['#rail', 'Tirages'], ['#table', 'Table lumineuse'], ['#series', 'Series'], ['#ecrire', 'Ecrire']] as const).map(([href, mot]) => (
                  <a key={href} href={href} className="o-rounded-full o-border-w-1 o-border-black-20 o-px-4 o-py-1.5 o-text-sm o-no-underline o-text-zinc-950 o-transition-colors hover:o-bg-black-10 dark:o-border-zinc-700 dark:o-text-zinc-50 dark:hover:o-bg-zinc-800 focus:o-ring">
                    {mot}
                  </a>
                ))}
              </Surgit>
            </div>

            <Surgit delai={80} as="h1" className="o-m-0 o-mt-6 o-uppercase" style={CORPS_NOM}>
              Maud Ferrand
            </Surgit>

            <div className="o-mt-10 o-grid o-items-end o-gap-8 md:o-grid-cols-12">
              <Surgit delai={360} as="p" className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-7">
                Photographe et directrice de l image depuis onze ans. Portrait, architecture, nature morte et paysage, pour des maisons qui veulent qu on regarde deux fois.
              </Surgit>
              <Surgit delai={460} className="md:o-col-span-5 md:o-text-right">
                <HeureBattue />
              </Surgit>
            </div>
          </div>
        </header>

        <main>
          {/* ================= (01) Le rail : on traverse les tirages ====== */}
          <section id="rail" className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800">
            <Rail
              ecrans={3.2}
              entete={
                <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-px-6 o-pb-6 o-pt-8 md:o-px-8">
                  <Indice rang="01" sombre={false}>Les tirages</Indice>
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Dix planches — defilez pour avancer sur la table
                  </p>
                </div>
              }
            >
              {/* La marge de tete : le premier tirage ne colle pas au bord. */}
              <span aria-hidden="true" className="o-block o-shrink-0" style={{ width: '1.5rem' }} />
              {RAIL.map((tirage, rang) => (
                <Wagon key={tirage.graine} tirage={tirage} rang={rang} />
              ))}
              <span aria-hidden="true" className="o-block o-shrink-0" style={{ width: '1.5rem' }} />
            </Rail>
          </section>

          {/* ================= (02) La table lumineuse, le mecanisme ====== */}
          <section id="table" className="o-scroll-mt-24 o-border-t o-border-black-10 o-px-6 o-py-20 dark:o-border-zinc-800 md:o-px-8 md:o-py-28">
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <div>
                <Reveal>
                  <Indice rang="02" sombre={false}>La table lumineuse</Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2 className="o-m-0 o-mt-6 o-uppercase" style={affiche('m', 800)}>
                    Seize planches.
                  </h2>
                </Reveal>
              </div>
              {/* Cinq rubriques ne tiennent pas sur un telephone : le rail du
                  controle se parcourt du doigt plutot que de pousser la page. */}
              <div className="o-min-w-0 o-max-w-full o-overflow-x-auto">
                <SegmentedControl
                  label="Filtrer par rubrique"
                  value={rubrique}
                  onChange={(valeur) => {
                    setRubrique(valeur as Rubrique | 'Tout')
                  }}
                  options={(['Tout', ...RUBRIQUES] as const).map((r) => ({ value: r, label: r }))}
                />
              </div>
            </div>

            <ul className="o-m-0 o-mt-10 o-grid o-list-none o-grid-cols-2 o-gap-3 o-p-0 md:o-grid-cols-4">
              {retenus.map((t, rang) => (
                <li key={t.graine} className={`o-min-w-0 ${t.portrait === true ? 'md:o-row-span-2' : ''}`}>
                  <figure className="o-m-0">
                    <HoverZoom
                      src={photo(t.graine, 900, 900)}
                      alt={t.alt}
                      ratio={t.portrait === true ? 3 / 4 : 4 / 3}
                      zoom={1.12}
                      loading="lazy"
                      className="o-bg-zinc-100 dark:o-bg-zinc-900"
                    />
                    <figcaption className="o-mt-2 o-flex o-items-baseline o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                      <span>PL. {String(rang + 1).padStart(2, '0')} — {t.lieu}</span>
                      <span>{t.focale}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>

          {/* ================= (03) Les series, legendes dans la marge ==== */}
          <section id="series" className="o-scroll-mt-24 o-border-t o-border-black-10 o-px-6 o-pb-10 o-pt-20 dark:o-border-zinc-800 md:o-px-8 md:o-pt-28">
            <Reveal>
              <Indice rang="03" sombre={false}>Les series</Indice>
            </Reveal>

            {RUBRIQUES.map((r, rang) => {
              const serie = TIRAGES.filter((t) => t.rubrique === r).slice(0, 3)
              return (
                <article key={r} className="o-grid o-gap-8 o-border-t o-border-black-10 o-py-16 dark:o-border-zinc-800 md:o-grid-cols-12 md:o-gap-10 md:o-py-24">
                  {/* La legende vit dans la marge, et y reste pendant la mosaique. */}
                  <div className="md:o-col-span-3">
                    <div className="md:o-sticky" style={{ top: COLLE }}>
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        Serie 0{rang + 1} / 04
                      </p>
                      {/* Le corps tient compte de la colonne : « Architecture »
                          en trois rem s y couperait au milieu du mot. */}
                      <h3 className="o-m-0 o-mt-4 o-uppercase" style={{ ...affiche('m', 800), fontSize: 'clamp(1.375rem, 2.2vw, 2.25rem)' }}>
                        <Shuffle as="span" duration={780} step={30} tilt={22}>{r}</Shuffle>
                      </h3>
                      <p className="o-m-0 o-mt-4 o-max-w-xs o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">{NOTES[r]}</p>
                      <a href="#table" className="o-mt-5 o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring" style={{ color: encre() }}>
                        Voir sur la table <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  <ul className="o-m-0 o-grid o-list-none o-grid-cols-1 o-gap-6 o-p-0 md:o-col-span-9 md:o-grid-cols-12">
                    {serie.map((t, k) => {
                      const place = MOSAIQUE[k] ?? MOSAIQUE[0]
                      if (place === undefined) return null
                      return (
                        <li key={t.graine} className={`o-min-w-0 ${place.colonnes} ${place.decale}`}>
                          <ParallaxImage
                            src={photo(t.graine, 1100, 900)}
                            alt={t.alt}
                            ratio={place.ratio}
                            strength={0.28}
                            className="o-w-full o-bg-zinc-100 dark:o-bg-zinc-900"
                          />
                          <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                            {t.lieu} · {t.focale}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              )
            })}
          </section>

          {/* ================= (04) A propos, avec le portrait colle ======= */}
          <section id="propos" className="o-scroll-mt-24 o-border-t o-border-black-10 o-px-6 o-py-20 dark:o-border-zinc-800 md:o-px-8 md:o-py-28">
            <div className="o-grid o-gap-10 md:o-grid-cols-12 md:o-gap-12">
              <div className="md:o-col-span-4">
                <div className="md:o-sticky" style={{ top: COLLE }}>
                  {/* Un tirage, pas un portrait de l auteure : la page ne prete
                      le visage de personne a quelqu un qui n existe pas. */}
                  <ParallaxImage
                    src={photo('lisiere-couverture', 800, 1000)}
                    alt="Silhouette de profil a contre-jour, tirage de la serie Portrait"
                    ratio={0.82}
                    strength={0.2}
                    className="o-w-full o-bg-zinc-100 dark:o-bg-zinc-900"
                  />
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Serie Portrait, studio de la rue de Turbigo — 85 mm
                  </p>
                </div>
              </div>

              <div className="md:o-col-span-8">
                <Reveal>
                  <Indice rang="04" sombre={false}>A propos</Indice>
                </Reveal>
                <Reveal delay={80}>
                  <p className="o-m-0 o-mt-8 o-max-w-2xl o-text-balance" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 2.8vw, 2.5rem)', lineHeight: 1.18 }}>
                    Je travaille en lumiere naturelle des que c est possible, et je livre des planches, pas des fichiers en vrac.
                  </p>
                </Reveal>
                <Reveal delay={160}>
                  <p className="o-m-0 o-mt-8 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                    Chaque serie arrive editee, legendee, numerotee : ce que vous voyez sur la table lumineuse est exactement ce que vous recevez. Je repere la veille, je photographie a l heure ou le sujet est le mieux servi, et je ne rends jamais une planche que je n aurais pas accrochee.
                  </p>
                </Reveal>

                <div className="o-mt-14 o-border-t o-border-black-10 o-pt-8 dark:o-border-zinc-800">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">Ils m ont confie une serie</p>
                  <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-wrap o-gap-x-8 o-gap-y-3 o-p-0">
                    {CLIENTS.map((c) => (
                      <li key={c} className="o-text-xl o-font-medium o-tracking-tight o-text-zinc-500 dark:o-text-zinc-500">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ================= A12 : l adresse, en clair, et rien d autre == */}
          <section id="ecrire" className="o-scroll-mt-24 o-border-t o-border-black-10 o-px-6 o-py-24 dark:o-border-zinc-800 md:o-px-8 md:o-py-32">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Un brief de dix lignes suffit — reponse sous deux jours
            </p>
            <a
              href={`mailto:${COURRIEL}`}
              className="o-mt-8 o-inline-flex o-flex-wrap o-items-baseline o-gap-x-4 o-text-zinc-950 o-underline o-underline-offset-8 o-transition-opacity hover:o-opacity-70 dark:o-text-zinc-50 focus:o-ring"
              style={{ ...affiche('l', 800), fontSize: 'clamp(1.75rem, 6.5vw, 4.5rem)', textDecorationThickness: '2px' }}
            >
              {COURRIEL}
              <Icon icon={ArrowUpRight} size={40} aria-hidden="true" />
            </a>
          </section>
        </main>

        {/* ================= P2 : une seule ligne ======================== */}
        <footer className="o-border-t o-border-black-10 o-px-6 o-py-7 dark:o-border-zinc-800 md:o-px-8">
          <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            <span className="o-text-zinc-950 dark:o-text-zinc-50">Maud Ferrand</span>
            <nav aria-label="Pied de page" className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2">
              {([['#rail', 'Tirages'], ['#table', 'Table lumineuse'], ['#series', 'Series'], [`mailto:${COURRIEL}`, COURRIEL]] as const).map(([href, mot]) => (
                <a key={href} href={href} className="o-no-underline o-text-zinc-600 o-transition-colors hover:o-text-zinc-950 dark:o-text-zinc-400 dark:hover:o-text-zinc-50 focus:o-ring">
                  {mot}
                </a>
              ))}
            </nav>
            <span>© 2026 — reproduction interdite sans accord ecrit</span>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
