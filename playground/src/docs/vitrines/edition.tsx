/**
 * Corps 11 — maison d edition.
 *
 * ## La reference : Nordframe (Framer)
 *
 * Le mono partout ou il y a une metadonnee, des filets a un pixel, une bande
 * de tirages en haut de page, et un blanc qui n est pas blanc — un papier
 * creme, qui se fonce a peine en theme sombre. Aucune photographie : une
 * maison d edition montre des pages, pas des images de pages.
 *
 * ## Le mecanisme : la fabrication
 *
 * Huit postes, du manuscrit au livre, avec ce que chacun coute. Le visiteur
 * regle **le tirage**, et toute l economie du livre se recalcule : le cout de
 * revient a l exemplaire, le seuil de vente, et surtout **la part du prix
 * public qui revient a chacun** — libraire, distributeur, auteur,
 * fabrication, maison. C est un calcul honnete, pose sur des chiffres ecrits
 * a la main, et il dit une chose que personne n ecrit sur son site : a huit
 * cents exemplaires, la maison ne gagne rien.
 *
 * ## Le nom
 *
 * « Corps 11 » est la taille de composition du texte courant, sur une force
 * de corps de 14. La page compose son propre texte comme cela.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { FoldText } from '@/odoro/text/FoldText.jsx'
import { UnderlineDraw } from '@/odoro/text/UnderlineDraw.jsx'
import { TiltCard } from '@/odoro/ui/TiltCard.jsx'

import { nuit } from './communs.jsx'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Chapitre } from './scene.jsx'

/* ============================ L economie du livre ====================== */

/** Un poste de fabrication : ce qu il coute d un coup, et par exemplaire. */
interface Poste {
  readonly rang: string
  readonly nom: string
  readonly quoi: string
  /** Ce que le poste coute une fois, quel que soit le tirage. */
  readonly fixe: number
  /** Ce qu il coute par exemplaire. */
  readonly parEx: number
  /** La part du papier qui s amortit sur le tirage. */
  readonly amorti?: number
}

const POSTES: readonly Poste[] = [
  {
    rang: '01',
    nom: 'La lecture',
    quoi: 'Trois lecteurs, six semaines, une note de quatre feuillets. Neuf manuscrits sur dix s arretent ici, et c est la seule etape qu on paie sans rien publier.',
    fixe: 620,
    parEx: 0,
  },
  {
    rang: '02',
    nom: 'La preparation de copie',
    quoi: 'Quatre-vingt-dix feuillets releves, une semaine passee avec l auteur, et la liste des choix de la maison : pas de guillemets anglais, pas de capitales accentuees manquantes.',
    fixe: 1350,
    parEx: 0,
  },
  {
    rang: '03',
    nom: 'La correction',
    quoi: 'Deux jeux d epreuves, un troisieme si le premier en demande un. Coquilles, cesures, veuves et orphelines : c est le poste qu on rogne en premier et qu on regrette en second.',
    fixe: 880,
    parEx: 0,
  },
  {
    rang: '04',
    nom: 'La composition',
    quoi: 'Corps 11 sur 14, justification 105 mm, vingt-huit lignes par page. La grille tient de la page de titre a l acheve d imprimer, et c est de la que la maison tire son nom.',
    fixe: 640,
    parEx: 0,
  },
  {
    rang: '05',
    nom: 'La couverture',
    quoi: 'Un lettrage dessine, quatre essais, une seule couleur d encre. Elle sera vue a trois metres dans une vitrine et a trente centimetres dans une main : les deux comptent.',
    fixe: 900,
    parEx: 0,
  },
  {
    rang: '06',
    nom: 'L impression',
    quoi: 'Offset feuille, papier bouffant ivoire 80 g, 288 pages. Le calage se paie une fois ; le papier, a chaque exemplaire, et il baisse quand le tirage monte.',
    fixe: 460,
    parEx: 0.58,
    amorti: 320,
  },
  {
    rang: '07',
    nom: 'Le faconnage',
    quoi: 'Dos carre colle cousu, rabats de 90 mm, tranchefile. Un livre qui ne s ouvre pas a plat se referme sur les doigts, et on le repose.',
    fixe: 0,
    parEx: 0.31,
  },
  {
    rang: '08',
    nom: 'La diffusion',
    quoi: 'Un representant qui passe chez soixante libraires, un distributeur qui stocke et qui facture. Ensemble, quarante-huit pour cent du prix hors taxes — c est le poste le plus lourd du livre, et il ne se voit nulle part.',
    fixe: 0,
    parEx: 0,
  },
]

/** Le prix public du titre en cours, toutes taxes comprises. */
const PRIX_TTC = 19
/** Taux de taxe du livre. */
const TVA = 0.055
/** Remise au libraire et au distributeur, sur le prix hors taxes. */
const REMISE = 0.48
/** Droits de l auteur, sur le prix hors taxes. */
const DROITS = 0.08

/** L economie du titre pour un tirage donne. */
function economie(tirage: number): {
  readonly ht: number
  readonly fixes: number
  readonly variable: number
  readonly revient: number
  readonly fabrication: number
  readonly maison: number
  readonly seuil: number
} {
  const ht = PRIX_TTC / (1 + TVA)
  const fixes = POSTES.reduce((somme, poste) => somme + poste.fixe, 0)
  const variable = POSTES.reduce(
    (somme, poste) => somme + poste.parEx + (poste.amorti ?? 0) / tirage,
    0,
  )
  const revient = fixes / tirage + variable
  // La marge contributive : ce que rapporte un exemplaire de plus, une fois
  // le libraire, le distributeur et l auteur payes.
  const marge = ht * (1 - REMISE - DROITS) - variable
  return {
    ht,
    fixes,
    variable,
    revient,
    fabrication: (revient / ht) * 100,
    maison: 100 - REMISE * 100 - DROITS * 100 - (revient / ht) * 100,
    seuil: marge > 0 ? Math.ceil(fixes / marge) : Number.POSITIVE_INFINITY,
  }
}

/** Une somme en euros, a la francaise. */
function euros(valeur: number, decimales = 2): string {
  return `${valeur.toFixed(decimales).replace('.', ',')} €`
}

/* ============================ Le catalogue ============================= */

/** Un titre du catalogue. */
const CATALOGUE: readonly (readonly [
  cote: string,
  auteur: string,
  titre: string,
  collection: string,
  pages: string,
  prix: string,
])[] = [
  [
    'C11-138',
    'Mireille Anquetil',
    'Le Bruit des presses',
    'Grand format',
    '288 p.',
    '19,00 €',
  ],
  [
    'C11-139',
    'Tomas Barral',
    'Nous n irons pas a Rotterdam',
    'Grand format',
    '204 p.',
    '17,50 €',
  ],
  ['C11-140', 'Sara Delcourt', 'Traite du papier mouille', 'Essais', '176 p.', '16,00 €'],
  ['C11-141', 'Joan Pellet', 'Vingt-huit lignes', 'Poesie', '96 p.', '13,00 €'],
  ['C11-142', 'Collectif', 'Ce que coute un livre', 'Essais', '144 p.', '15,00 €'],
  ['C11-143', 'Irene Wach', 'La Derniere Epreuve', 'Grand format', '312 p.', '20,50 €'],
]

/* ============================ Les tranches ============================= */

/** La bande de tirages de Nordframe, en tranches de livres. */
function Tranches(): ReactElement {
  const dos = useMemo(
    () =>
      CATALOGUE.concat(CATALOGUE).map((livre, rang) => ({
        cle: `${livre[0]}-${String(rang)}`,
        titre: livre[2],
        auteur: livre[1],
        largeur: 26 + ((rang * 7) % 4) * 8,
        fonce: rang % 3 === 0,
      })),
    [],
  )
  return (
    <div
      className="o-flex o-items-end o-gap-1.5 o-overflow-x-auto o-overflow-y-hidden o-px-6 o-pb-1 md:o-px-10"
      style={{ scrollbarWidth: 'thin' }}
    >
      {dos.map((livre) => (
        <div
          key={livre.cle}
          aria-hidden="true"
          className={`o-flex o-shrink-0 o-items-center o-justify-center o-py-5 ${
            livre.fonce
              ? 'o-bg-stone-800 dark:o-bg-stone-700'
              : 'o-bg-stone-200 dark:o-bg-stone-800'
          }`}
          style={{
            width: livre.largeur,
            height: 188,
            boxShadow: `inset -3px 0 0 ${accentDoux(900, 30)}, inset 0 0 0 1px ${accentDoux(700, 22)}`,
          }}
        >
          <span
            className={`o-whitespace-nowrap o-font-mono o-text-xs o-uppercase o-tracking-widest ${
              livre.fonce
                ? 'o-text-stone-100 dark:o-text-stone-100'
                : 'o-text-stone-700 dark:o-text-stone-300'
            }`}
            style={{ writingMode: 'vertical-rl' }}
          >
            {livre.titre}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ============================ L objet livre ============================ */

/** Le livre du moment, dessine : plat, dos, tranche. */
function Livre(): ReactElement {
  return (
    <div className="o-relative" style={{ perspective: '1200px' }}>
      <div
        className="o-relative o-overflow-hidden o-bg-stone-100 dark:o-bg-stone-900"
        style={{
          aspectRatio: '14 / 21',
          boxShadow: `0 26px 60px -30px rgb(0 0 0 / 0.5), inset 0 0 0 1px ${accentDoux(700, 26)}`,
        }}
      >
        {/* Le mors, et la reserve du dos. */}
        <span
          aria-hidden="true"
          className="o-absolute o-inset-y-0 o-left-4 o-block o-w-px"
          style={{ backgroundColor: accentDoux(700, 24) }}
        />
        <div className="o-flex o-h-full o-flex-col o-justify-between o-py-10 o-pl-10 o-pr-7">
          <p
            className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{ color: encre() }}
          >
            Corps 11
          </p>
          <div>
            <p
              className="o-m-0 o-text-stone-500 dark:o-text-stone-400"
              style={{
                fontFamily: 'var(--o-font-serif, serif)',
                fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
              }}
            >
              Mireille Anquetil
            </p>
            <p
              className="o-m-0 o-mt-3 o-text-stone-900 dark:o-text-stone-100"
              style={{
                ...affiche('m', 400),
                fontSize: 'clamp(1.6rem, 3.4vw, 2.75rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.01em',
              }}
            >
              Le Bruit
              <br />
              des presses
            </p>
          </div>
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
            Grand format · 288 p. · 19,00 €
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================ Le mecanisme ============================= */

/** La barre du prix public : qui prend quoi, en pour cent. */
function Partage({
  fabrication,
  maison,
}: {
  readonly fabrication: number
  readonly maison: number
}): ReactElement {
  const perte = maison < 0
  // Une rampe de valeurs plutot que cinq teintes : elle se lit quelle que soit
  // la couleur choisie dans la barre, y compris sur un accent neutre.
  const parts = [
    { quoi: 'Libraire', valeur: REMISE * 100 - 12, couleur: accentDoux(200, 92) },
    { quoi: 'Distribution', valeur: 12, couleur: accentDoux(400, 92) },
    { quoi: 'Auteur', valeur: DROITS * 100, couleur: accentDoux(600, 92) },
    {
      quoi: 'Fabrication',
      valeur: Math.min(100, fabrication),
      couleur: accentDoux(800, 92),
    },
    {
      quoi: perte ? 'Perte de la maison' : 'La maison',
      valeur: Math.abs(maison),
      couleur: perte ? 'var(--o-palette-red-500)' : accentDoux(950, 92),
    },
  ]
  const total = parts.reduce((somme, p) => somme + p.valeur, 0)
  return (
    <div>
      <div
        className="o-flex o-h-10 o-w-full o-overflow-hidden"
        role="img"
        aria-label={parts
          .map((p) => `${p.quoi} ${String(Math.round(p.valeur))} pour cent`)
          .join(', ')}
      >
        {parts.map((p) => (
          <span
            key={p.quoi}
            className="o-block o-h-full"
            style={{
              width: `${String((p.valeur / total) * 100)}%`,
              backgroundColor: p.couleur,
              transition: 'width 320ms ease',
            }}
          />
        ))}
      </div>
      <dl className="o-m-0 o-mt-5 o-grid o-gap-x-8 o-gap-y-2 sm:o-grid-cols-2">
        {parts.map((p) => (
          <div
            key={p.quoi}
            className="o-flex o-min-w-0 o-items-baseline o-gap-3 o-border-b o-border-black-10 dark:o-border-stone-800 o-py-1.5"
          >
            <span
              aria-hidden="true"
              className="o-block o-size-2.5 o-shrink-0"
              style={{ backgroundColor: p.couleur }}
            />
            <dt className="o-min-w-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
              {p.quoi}
            </dt>
            <dd className="o-m-0 o-ml-auto o-whitespace-nowrap o-font-mono o-text-xs o-tabular-nums o-text-stone-900 dark:o-text-stone-100">
              {(p.quoi === 'Perte de la maison' ? '-' : '') +
                Math.round(p.valeur).toString()}{' '}
              %
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Le banc de fabrication : un tirage, et toute l economie qui suit. */
function Banc(): ReactElement {
  const [tirage, setTirage] = useState(3000)
  const compte = useMemo(() => economie(tirage), [tirage])
  const atteint = compte.seuil <= tirage

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12">
      <div className="o-min-w-0 lg:o-col-span-5">
        <label className="o-block">
          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
            Tirage
          </span>
          <span
            className="o-mt-2 o-block o-tabular-nums o-text-stone-900 dark:o-text-stone-100"
            style={{
              ...affiche('m', 400),
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 0.9,
            }}
          >
            {tirage.toLocaleString('fr-FR')}
          </span>
          <input
            type="range"
            min={500}
            max={8000}
            step={100}
            value={tirage}
            onChange={(evenement) => {
              setTirage(Number(evenement.target.value))
            }}
            className="o-mt-5 o-w-full o-accent-brand-500 focus:o-ring"
          />
        </label>
        <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
          De cinq cents — un premier roman qu on tire court — a huit mille, qui suppose
          une mise en place nationale et un pilon assume.
        </p>

        <dl className="o-m-0 o-mt-9 o-border-t o-border-black-10 dark:o-border-stone-800">
          {[
            ['Cout de revient', euros(compte.revient), 'par exemplaire, tout compris'],
            [
              'Cout du tirage',
              `${Math.round(compte.fixes + compte.variable * tirage).toLocaleString('fr-FR')} €`,
              'avance par la maison',
            ],
            [
              'Prix public',
              `${euros(PRIX_TTC, 2)} TTC`,
              `soit ${euros(compte.ht)} hors taxes`,
            ],
            [
              'Seuil de vente',
              Number.isFinite(compte.seuil)
                ? `${compte.seuil.toLocaleString('fr-FR')} ex.`
                : 'jamais',
              atteint
                ? 'atteint avant la fin du tirage'
                : 'au-dela du tirage : le titre perd',
            ],
          ].map(([quoi, valeur, note]) => (
            <div
              key={quoi}
              className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3 o-border-b o-border-black-10 dark:o-border-stone-800 o-py-3"
            >
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                {quoi}
              </dt>
              <dd className="o-m-0 o-text-right">
                <span
                  className="o-block o-font-mono o-text-base o-tabular-nums o-text-stone-900 dark:o-text-stone-100"
                  aria-live="polite"
                >
                  {valeur}
                </span>
                <span className="o-block o-text-xs o-text-stone-500 dark:o-text-stone-400">
                  {note}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="o-min-w-0 lg:o-col-span-7">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
          Ou vont les {euros(economie(tirage).ht)} hors taxes du prix public
        </p>
        <div className="o-mt-5">
          <Partage fabrication={compte.fabrication} maison={compte.maison} />
        </div>
        <p className="o-m-0 o-mt-7 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
          {compte.maison < 3
            ? 'A ce tirage, les quatre mille huit cent cinquante euros de frais fixes ne se repartissent plus sur assez d exemplaires : la maison publie a perte, et ne tient que si un autre titre paie pour celui-la.'
            : 'Les frais fixes ne bougent pas avec le tirage : c est la seule raison pour laquelle un livre tire a quatre mille coute moins cher a fabriquer, a l exemplaire, qu un livre tire a huit cents.'}
        </p>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#fabrication', 'La fabrication'],
  ['#catalogue', 'Le catalogue'],
  ['#maison', 'La maison'],
  ['#bulletin', 'S abonner'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('cormorant')
  const [abonne, setAbonne] = useState(false)

  const papier: CSSProperties = {
    backgroundImage: `repeating-linear-gradient(0deg, ${accentDoux(700, 5)} 0 1px, transparent 1px 28px)`,
  }

  return (
    <Porte forme="zoom" marque="Corps 11" sombre={false}>
      <div
        className="o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-900 dark:o-text-stone-100"
        style={polices}
      >
        {/* ================= L ouverture ================================== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)`, ...papier }}
        >
          <BarreCoins
            marque="Corps 11"
            liens={NAVIGATION}
            droite="Maison d edition — Bordeaux, depuis 1998"
            sombre={false}
          />

          <div className="o-relative o-grid o-grow o-gap-10 o-px-6 o-pb-10 md:o-grid-cols-12 md:o-gap-12 md:o-px-10">
            <div className="o-flex o-min-w-0 o-flex-col o-justify-center md:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>
                  Cent quarante-trois titres · quatre par an · aucun best-seller
                </Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                cadence={90}
                className="o-m-0 o-mt-7 o-text-stone-900 dark:o-text-stone-50"
                style={{
                  ...affiche('xl', 300),
                  fontSize: 'clamp(3rem, 12vw, 11rem)',
                  lineHeight: 0.84,
                  letterSpacing: '-0.03em',
                }}
              >
                Corps 11
              </TitreVague>
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-lg o-text-lg o-leading-relaxed o-text-stone-600 dark:o-text-stone-300"
              >
                Onze points sur quatorze, vingt-huit lignes par page, et le detail de ce
                que coute un livre — poste par poste, sans arrondir.
              </Surgit>
              <Surgit delai={620} className="o-mt-8">
                <Actions
                  pleine={['#fabrication', 'Ouvrir le devis']}
                  fantome={['#catalogue', 'Le catalogue']}
                  sombre={false}
                />
              </Surgit>
            </div>

            <div className="o-flex o-min-w-0 o-items-center md:o-col-span-5">
              <Surgit delai={420} className="o-w-full">
                <TiltCard tilt={7} glare={0.12} className="o-mx-auto o-w-full o-max-w-sm">
                  <Livre />
                </TiltCard>
                <p className="o-mx-auto o-m-0 o-mt-5 o-max-w-sm o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Le titre du moment — tire a 4 200 exemplaires
                  <br />
                  Acheve d imprimer le 2 septembre 2026
                </p>
              </Surgit>
            </div>
          </div>

          <div className="o-relative o-border-t o-border-black-10 dark:o-border-stone-800 o-pt-6">
            <Tranches />
          </div>
        </header>

        <main>
          {/* ================= Le manifeste ================================ */}
          <section className="o-border-t o-border-black-10 dark:o-border-stone-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="01" sombre={false}>
                  La maison
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <p
                  className="o-m-0 o-mt-8 o-max-w-5xl o-text-balance"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.6vw, 3.75rem)',
                    lineHeight: 1.08,
                  }}
                >
                  <span className="o-text-stone-500 dark:o-text-stone-500">
                    Un livre ne coute pas ce qu il se vend.{' '}
                  </span>
                  <span className="o-text-stone-900 dark:o-text-stone-50">
                    Il coute ce que huit metiers y passent, et la moitie du prix part
                    avant nous.
                  </span>
                </p>
              </Reveal>
            </div>
          </section>

          {/* ================= C30 : un seul chiffre, en toutes lettres ==== */}
          <section className="o-px-6 o-py-24 md:o-px-10 md:o-py-36" style={nuit('stone')}>
            <div className="o-mx-auto o-max-w-6xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                Depuis 1998
              </p>
              <p
                className="o-m-0 o-mt-8 o-text-balance o-text-stone-50"
                style={{
                  ...affiche('xl', 300),
                  fontSize: 'clamp(2.75rem, 11vw, 11rem)',
                  lineHeight: 0.86,
                  letterSpacing: '-0.035em',
                }}
              >
                <FoldText as="span" step={48} duration={700}>
                  Cent quarante-trois
                </FoldText>
              </p>
              <p className="o-m-0 o-mt-10 o-max-w-xl o-text-lg o-leading-relaxed o-text-stone-300">
                titres publies, dont onze reimpressions et deux pilons complets. Nous ne
                comptons pas les tirages, nous comptons les titres : c est la seule mesure
                qui dise ce qu une maison a fait.
              </p>
            </div>
          </section>

          {/* ================= Le mecanisme, en chapitres ================== */}
          <section
            id="fabrication"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={papier}
          >
            <div className="o-mx-auto o-max-w-6xl o-flex o-flex-col o-gap-24">
              <Chapitre
                indice="(02) — La fabrication"
                largeur={4}
                titre={
                  <h2
                    className="o-m-0 o-text-stone-900 dark:o-text-stone-50"
                    style={{
                      ...affiche('m', 400),
                      fontSize: 'clamp(1.85rem, 3.4vw, 3rem)',
                      lineHeight: 0.98,
                    }}
                  >
                    Huit postes, du manuscrit au livre.
                  </h2>
                }
                texte="Les montants sont ceux d un grand format de 288 pages, releves sur le dernier titre. Ils ne comprennent ni les salaires de la maison, ni le loyer."
              >
                <ol className="o-m-0 o-list-none o-border-t o-border-black-10 dark:o-border-stone-800 o-p-0">
                  {POSTES.map((poste) => (
                    <li
                      key={poste.rang}
                      className="o-border-b o-border-black-10 dark:o-border-stone-800 o-py-7"
                    >
                      <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4">
                        <h3
                          className="o-m-0 o-flex o-items-baseline o-gap-4 o-text-stone-900 dark:o-text-stone-50"
                          style={{
                            ...affiche('m', 400),
                            fontSize: 'clamp(1.2rem, 2.2vw, 1.75rem)',
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="o-font-mono o-text-xs o-tabular-nums"
                            style={{ color: encre() }}
                          >
                            {poste.rang}
                          </span>
                          {poste.nom}
                        </h3>
                        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tabular-nums o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                          {poste.rang === '08'
                            ? '48 % du prix hors taxes'
                            : `${poste.fixe > 0 ? euros(poste.fixe, 0) : ''}${poste.fixe > 0 && poste.parEx > 0 ? ' + ' : ''}${poste.parEx > 0 ? `${euros(poste.parEx)} / ex.` : ''}`}
                        </p>
                      </div>
                      <p className="o-m-0 o-mt-3 o-max-w-2xl o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                        {poste.quoi}
                      </p>
                    </li>
                  ))}
                </ol>
              </Chapitre>

              <Chapitre
                indice="(03) — Le devis"
                largeur={4}
                titre={
                  <h2
                    className="o-m-0 o-text-stone-900 dark:o-text-stone-50"
                    style={{
                      ...affiche('m', 400),
                      fontSize: 'clamp(1.85rem, 3.4vw, 3rem)',
                      lineHeight: 0.98,
                    }}
                  >
                    Reglez le tirage, et regardez le prix se partager.
                  </h2>
                }
                texte="Les frais fixes ne bougent pas ; seuls le papier et le faconnage suivent le nombre d exemplaires. Tout le reste du calcul en decoule."
              >
                <Banc />
              </Chapitre>
            </div>
          </section>

          {/* ================= Le catalogue ================================ */}
          <section
            id="catalogue"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-stone-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="04" sombre={false}>
                  Le catalogue
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-2xl o-text-stone-900 dark:o-text-stone-50"
                  style={{
                    ...affiche('m', 400),
                    fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                    lineHeight: 0.98,
                  }}
                >
                  Les six derniers titres.
                </h2>
              </Reveal>

              <div className="o-mt-14 o-overflow-x-auto o-overflow-y-hidden">
                <table
                  className="o-w-full o-min-w-0 o-text-left"
                  style={{ minWidth: 640, borderCollapse: 'collapse' }}
                >
                  <caption className="o-sr-only">
                    Les six derniers titres publies, avec leur cote, leur collection, leur
                    pagination et leur prix.
                  </caption>
                  <thead>
                    <tr className="o-border-b o-border-black-10 dark:o-border-stone-800">
                      {['Cote', 'Auteur', 'Titre', 'Collection', 'Pages', 'Prix'].map(
                        (entete) => (
                          <th
                            key={entete}
                            scope="col"
                            className="o-py-3 o-pr-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
                          >
                            {entete}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {CATALOGUE.map(([cote, auteur, titre, collection, pages, prix]) => (
                      <tr
                        key={cote}
                        className="o-border-b o-border-black-10 dark:o-border-stone-800"
                      >
                        <td
                          className="o-py-5 o-pr-6 o-font-mono o-text-xs o-tabular-nums"
                          style={{ color: encre() }}
                        >
                          {cote}
                        </td>
                        <td className="o-py-5 o-pr-6 o-text-sm o-text-stone-600 dark:o-text-stone-400">
                          {auteur}
                        </td>
                        <td
                          className="o-py-5 o-pr-6 o-text-stone-900 dark:o-text-stone-50"
                          style={{
                            fontFamily: 'var(--o-vitrine-affichage)',
                            fontSize: 'clamp(1.05rem, 1.8vw, 1.5rem)',
                          }}
                        >
                          {titre}
                        </td>
                        <td className="o-py-5 o-pr-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                          {collection}
                        </td>
                        <td className="o-py-5 o-pr-6 o-font-mono o-text-xs o-tabular-nums o-text-stone-600 dark:o-text-stone-400">
                          {pages}
                        </td>
                        <td className="o-py-5 o-font-mono o-text-xs o-tabular-nums o-text-stone-900 dark:o-text-stone-100">
                          {prix}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ================= A31 : le bulletin detachable ================ */}
          <section
            id="bulletin"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={papier}
          >
            <div className="o-mx-auto o-max-w-4xl">
              <Reveal>
                <Indice rang="05" sombre={false}>
                  L abonnement
                </Indice>
              </Reveal>

              <div className="o-relative o-mt-10">
                {/* Le trait de coupe, et ses ciseaux. */}
                <p
                  aria-hidden="true"
                  className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400 dark:o-text-stone-500"
                >
                  <span>✂</span>
                  <span
                    className="o-h-px o-grow"
                    style={{
                      backgroundImage: `repeating-linear-gradient(90deg, ${accentDoux(700, 40)} 0 8px, transparent 8px 16px)`,
                    }}
                  />
                  <span>a detacher</span>
                </p>

                <form
                  className="o-mt-4 o-bg-stone-100 dark:o-bg-stone-900 o-p-8 md:o-p-12"
                  style={{ border: `2px dashed ${accentDoux(700, 40)}` }}
                  onSubmit={(evenement) => {
                    evenement.preventDefault()
                    setAbonne(true)
                  }}
                >
                  <h2
                    className="o-m-0 o-text-stone-900 dark:o-text-stone-50"
                    style={{
                      ...affiche('m', 400),
                      fontSize: 'clamp(1.6rem, 3.4vw, 2.75rem)',
                      lineHeight: 0.98,
                    }}
                  >
                    Bulletin d abonnement
                  </h2>
                  <p className="o-m-0 o-mt-4 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                    Quatre titres par an, envoyes le jour de leur sortie, avant la mise en
                    place en librairie. Soixante-huit euros port compris, resiliable a
                    chaque titre.
                  </p>

                  <div className="o-mt-10 o-grid o-gap-8 sm:o-grid-cols-2">
                    {[
                      ['nom', 'Nom et prenom', 'text', 'Mireille Anquetil'],
                      ['courriel', 'Courriel', 'email', 'vous@exemple.fr'],
                      ['adresse', 'Adresse postale', 'text', '12 rue des Presses'],
                      ['ville', 'Code postal et ville', 'text', '33000 Bordeaux'],
                    ].map(([id, libelle, genre, exemple]) => (
                      <label key={id} className="o-block o-min-w-0">
                        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                          {libelle}
                        </span>
                        <input
                          type={genre}
                          name={id}
                          placeholder={exemple}
                          className="o-mt-2 o-w-full o-bg-transparent o-pb-2 o-text-base o-text-stone-900 dark:o-text-stone-50 focus:o-ring"
                          style={{
                            border: 'none',
                            borderBottom: `1px solid ${accentDoux(700, 40)}`,
                            borderRadius: 0,
                          }}
                        />
                      </label>
                    ))}
                  </div>

                  <div className="o-mt-10 o-flex o-flex-wrap o-items-center o-justify-between o-gap-6">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                      A renvoyer a Corps 11
                      <br />9 rue Saint-Jacques, 33000 Bordeaux
                    </p>
                    <button
                      type="submit"
                      className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-3.5 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                      style={{ ...aplat(), border: 'none' }}
                    >
                      Je m abonne <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                    </button>
                  </div>

                  <p
                    className="o-m-0 o-mt-6 o-text-sm"
                    aria-live="polite"
                    style={{ color: encre(), minHeight: '1.25rem' }}
                  >
                    {abonne
                      ? 'Bulletin enregistre. Le premier titre part le 14 janvier, avant la mise en place.'
                      : ''}
                  </p>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* ================= P33 : le colophon =========================== */}
        <footer className="o-px-6 o-py-16 md:o-px-10" style={nuit('stone')}>
          <div className="o-mx-auto o-max-w-4xl o-text-center">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
              Acheve d imprimer
            </p>
            <p
              className="o-m-0 o-mt-8 o-text-balance o-text-lg o-leading-loose o-text-stone-200"
              style={{ fontFamily: 'var(--o-vitrine-affichage)' }}
            >
              Cette page a ete composee en Cormorant Garamond et en Work Sans, corps 11
              sur 14, et achevee le 11 septembre 2026. Les livres de la maison sont
              imprimes en offset feuille sur papier bouffant ivoire 80 g, encres a base
              vegetale, dos carre colle cousu. Tirage courant : quatre mille deux cents
              exemplaires, dont deux cents hors commerce.
            </p>

            <dl className="o-m-0 o-mt-12 o-grid o-gap-x-8 o-gap-y-4 o-text-left sm:o-grid-cols-2 lg:o-grid-cols-4">
              {[
                ['Encres', 'Quadrichromie, base vegetale'],
                ['Papier', 'Bouffant ivoire 80 g, main 1,8'],
                ['Tirage', '4 200 ex. dont 200 h. c.'],
                ['Depot legal', 'Septembre 2026'],
              ].map(([quoi, valeur]) => (
                <div key={quoi} className="o-border-t o-border-white-10 o-pt-3">
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500">
                    {quoi}
                  </dt>
                  <dd className="o-m-0 o-mt-1 o-font-mono o-text-xs o-text-stone-200">
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>

            <nav
              aria-label="Pied de page"
              className="o-mt-12 o-flex o-flex-wrap o-justify-center o-gap-x-8 o-gap-y-3"
            >
              {(
                [
                  ['#catalogue', 'Le catalogue'],
                  ['#fabrication', 'Ce que coute un livre'],
                  ['#bulletin', 'S abonner'],
                  ['#maison', 'Manuscrits'],
                ] as const
              ).map(([cible, mot]) => (
                <a
                  key={mot}
                  href={cible}
                  className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-300 o-no-underline focus:o-ring"
                >
                  <UnderlineDraw trigger="hover" thickness={2} color={encreSurSombre()}>
                    {mot}
                  </UnderlineDraw>
                </a>
              ))}
            </nav>

            <p className="o-m-0 o-mt-10" id="maison">
              <a
                href="#bulletin"
                className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-sm o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                style={{ color: encreSurSombre() }}
              >
                manuscrits@corps11.fr{' '}
                <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
              </a>
            </p>
            <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500">
              © 2026 Corps 11 — 9 rue Saint-Jacques, Bordeaux — ISSN 1287-4405
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
