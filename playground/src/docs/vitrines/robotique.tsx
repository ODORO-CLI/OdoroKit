/**
 * Cobalt — integrateur de robotique industrielle.
 *
 * ## L architecture : l ouverture par la donnee, puis la fiche technique
 *
 * C est une landing page complete, mais son **ouverture ne montre pas un
 * produit** : elle montre le chiffre qui decide, le retour sur investissement.
 * Un industriel n achete pas un bras, il achete un delai de remboursement ; la
 * page ouvre donc sur ce nombre ; la trame de demi-teinte tient la place du
 * robot, et le mot-marque, redessine en ASCII, ouvre la fiche du pied.
 *
 * Ce qui n appartient qu a elle :
 *
 * - une **barre de quatre nombres en verre** au bas de l ouverture — Stackside ;
 * - un **bandeau** de secteurs en mots geants, qui ne s arrete pas ;
 * - la preuve par **etapes defilantes** — ce que la cellule change, poste par
 *   poste, le media suivant l etape lue ;
 * - un **abaque** sur une bande sombre : trois valeurs entrees, la ligne de la
 *   gamme se surligne et le devis se pose. C est le mecanisme ;
 * - une **bande d appel** en accent, ou le texte defile ;
 * - un **pied en tableau a filets**, comme une fiche technique.
 *
 * ## Le fond
 *
 * Une trame de demi-teinte, fixe, sur la droite de l ouverture. Elle dit la
 * piece manipulee et non la machine : un integrateur vend le mouvement.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Cog,
  Gauge,
  Weight,
} from '@odoro-cli/icons/filaire'
import { useMemo, useState, type ReactElement } from 'react'

import { Halftone } from '@/odoro/background/Halftone.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { ScrollSteps } from '@/odoro/section/ScrollSteps.jsx'
import { AsciiText } from '@/odoro/text/AsciiText.jsx'
import { CountUp } from '@/odoro/text/CountUp.jsx'

import { nuit } from './communs.jsx'
import { photo } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Accent,
  Actions,
  affiche,
  BarreGelule,
  Chiffres,
  Coin,
  Croix,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  usePolices,
  verre,
} from './marche.jsx'
import { Bandeau } from './scene.jsx'

interface Bras {
  readonly reference: string
  readonly charge: number
  readonly portee: number
  readonly repetabilite: number
  readonly masse: number
  readonly cycle: number
  readonly prix: number
  readonly note: string
}

/**
 * La gamme.
 *
 * Le prix est celui de la **cellule complete** — bras, prehenseur, securite,
 * integration, formation — et non du seul robot. C est ce qui manque a la
 * plupart des devis, et ce qui explique les mauvaises surprises.
 */
const GAMME: readonly Bras[] = [
  {
    reference: 'C6',
    charge: 6,
    portee: 900,
    repetabilite: 0.03,
    masse: 27,
    cycle: 2.4,
    prix: 58000,
    note: 'Collaboratif, sans barriere si l analyse de risque le permet. Le plus employe pour la mise en carton.',
  },
  {
    reference: 'C12',
    charge: 12,
    portee: 1300,
    repetabilite: 0.05,
    masse: 54,
    cycle: 3.1,
    prix: 84000,
    note: 'Le compromis courant : assez de portee pour deux postes, assez de charge pour un carton plein.',
  },
  {
    reference: 'C20',
    charge: 20,
    portee: 1700,
    repetabilite: 0.06,
    masse: 148,
    cycle: 3.8,
    prix: 112000,
    note: 'Palettisation de bacs et de sacs. Barriere immaterielle obligatoire au-dela de 250 mm par seconde.',
  },
  {
    reference: 'C50',
    charge: 50,
    portee: 2400,
    repetabilite: 0.09,
    masse: 610,
    cycle: 5.2,
    prix: 168000,
    note: 'Palettisation lourde et manutention de moules. Sur socle scelle, avec reprise de genie civil.',
  },
]

/** Les valeurs proposees a l abaque. */
const CHARGES = [4, 12, 20, 45] as const
const PORTEES = [800, 1300, 1700, 2300] as const
const CADENCES = [200, 400, 700, 1100] as const

/** Ce que la cellule comprend, en articles numerotes. */
const ARTICLES: readonly (readonly [string, string])[] = [
  [
    '1.1',
    'Le bras, son armoire de commande et son prehenseur, dimensionnes sur la piece du client.',
  ],
  [
    '1.2',
    'L analyse de risque et la mise en conformite machine au sens de la directive 2006/42/CE.',
  ],
  [
    '1.3',
    'Les protections : barrieres materielles, scrutateurs ou zones collaboratives selon le cas.',
  ],
  [
    '1.4',
    'La programmation, et son code source remis en clair, commente en francais, avec sa documentation.',
  ],
  ['1.5', 'La formation de deux operateurs, sur site, pendant trois jours consecutifs.'],
  [
    '1.6',
    'Douze mois de garantie piece et main-d oeuvre, astreinte 6 h — 22 h comprise.',
  ],
]

/** Les conditions d execution, telles qu elles figurent au contrat. */
const CONDITIONS: readonly (readonly [string, string])[] = [
  [
    'Delai contractuel',
    'Quatorze semaines : six d etude et d approvisionnement, quatre de montage, deux de reception a blanc a l atelier, deux de mise en service sur site. Penalites de retard au contrat.',
  ],
  [
    'Propriete du programme',
    'Le code source appartient au client des la reception. Il peut le faire modifier par un tiers sans consequence sur la garantie mecanique.',
  ],
  [
    'Reception a blanc',
    'La cellule tourne deux semaines a l atelier, sur les pieces reelles du client, avant expedition.',
  ],
  [
    'Retrofit',
    'Un robot de plus de dix ans peut etre repris — baie de commande, securite, prehenseur — pour 40 a 60 % du cout d une cellule neuve.',
  ],
  [
    'Astreinte',
    'Au-dela de la premiere annee : 4 200 EUR par an, reponse sous trente minutes de 6 h a 22 h du lundi au samedi, intervention sous vingt-quatre heures en Bretagne et Pays de la Loire.',
  ],
]

/** Les references livrees, en releve. */
const RELEVE: readonly (readonly [string, string, string, string])[] = [
  ['Conserverie de l Odet', 'Mise en carton de bocaux', '2 × C6', '19 mois'],
  ['Fonderie Berthaut', 'Chargement de presse', '1 × C50', '26 mois'],
  ['Plasturgie Vallet', 'Degrappage et controle', '3 × C12', '15 mois'],
  ['Biscuiterie Kerne', 'Encaissage et palettisation', '2 × C20', '21 mois'],
]

/** Les secteurs cites au bandeau. */
const SECTEURS: readonly string[] = [
  'Agroalimentaire',
  'Plasturgie',
  'Fonderie',
  'Cosmetique',
  'Logistique',
  'Pharmaceutique',
  'Menuiserie',
]

/** Ce qu une cellule change, poste par poste. */
const ETAPES: readonly {
  readonly titre: string
  readonly texte: string
  readonly graine: string
  readonly alt: string
}[] = [
  {
    titre: 'Avant — la cadence tombe en fin de poste',
    texte:
      'A la main, une mise en carton plafonne a 380 pieces par heure le matin et descend a 300 en fin de journee. Ce n est pas un defaut de personne : c est la fatigue, et elle est previsible.',
    graine: 'cobalt-plasturgie',
    alt: 'Poste de presse tenu a la main, avant robotisation',
  },
  {
    titre: 'Pendant — deux semaines a l atelier, sur vos pieces',
    texte:
      'La cellule est montee chez nous et tourne quinze jours sur vos pieces reelles avant d etre expediee. C est la que se trouvent les problemes, pas dans votre production.',
    graine: 'cobalt-atelier',
    alt: 'Cellule robotisee en reception a blanc, derriere ses protections',
  },
  {
    titre: 'Apres — la cadence ne bouge plus',
    texte:
      'La meme cadence a 6 h et a 22 h, sans derive. Les operateurs passent au controle qualite ou au reglage : sur quatre-vingt-onze cellules, soixante-huit se sont accompagnees d un redeploiement, onze d une suppression de poste.',
    graine: 'cobalt-fonderie',
    alt: 'Bras en production, cadence tenue du matin au soir',
  },
]

/** Ce que disent quatre clients, en lignes de la fiche. */
const TEMOIGNAGES: readonly (readonly [string, string])[] = [
  [
    'Helene Berthaut — Fonderie Berthaut, Lorient',
    'Le poste etait classe penible : quatorze tonnes soulevees par jour et par operateur. C est ce qui a decide la direction, avant meme le calcul de retour.',
  ],
  [
    'Marc Le Gall — Conserverie de l Odet, Quimper',
    'Deux operateurs redeployes au controle qualite, aucun licenciement. Cobalt a demande ce qu ils deviendraient avant de nous chiffrer quoi que ce soit.',
  ],
  [
    'Sonia Vallet — Plasturgie Vallet, Vannes',
    'Le taux de rebut sorti d atelier est passe de 2,1 a 0,4 % en quatre mois. Nous avions le chiffre avant la fin de la garantie.',
  ],
  [
    'Tanguy Kerne — Biscuiterie Kerne, Douarnenez',
    'Ils nous ont dit non une fois : notre piece etait trop souple pour un prehenseur a ventouses. Un integrateur qui refuse une affaire, on s en souvient.',
  ],
]

/** Ce qui defile dans la bande d appel. */
const APPEL: readonly string[] = [
  'Une piece a nous envoyer ?',
  'bureau@cobalt-robotique.fr',
  'Reponse sous cinq jours ouvres',
  'Nous disons non quand nous ne sommes pas les bons',
]

/** Une ligne du pied en tableau : un intitule en mono, une valeur. */
function Ligne({
  quoi,
  children,
}: {
  readonly quoi: string
  readonly children: ReactElement | string
}): ReactElement {
  return (
    <tr className="o-border-b o-border-zinc-300 dark:o-border-zinc-700">
      <th
        scope="row"
        className="o-w-48 o-py-3 o-pr-6 o-align-top o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-w-64"
      >
        {quoi}
      </th>
      <td className="o-py-3 o-align-top o-text-sm o-leading-relaxed o-text-zinc-800 dark:o-text-zinc-200">
        {children}
      </td>
    </tr>
  )
}

/* ============================ Le rendu ============================ */

/** La vitrine complete : une landing page ouverte par la donnee. */
export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  const [charge, setCharge] = useState<number>(12)
  const [portee, setPortee] = useState<number>(1300)
  const [cadence, setCadence] = useState<number>(400)

  const calcul = useMemo(() => {
    const retenu =
      GAMME.find((b) => b.charge >= charge && b.portee >= portee) ??
      GAMME[GAMME.length - 1]
    if (retenu === undefined) return undefined
    const parHeure = Math.round(3600 / retenu.cycle)
    const bras = Math.max(1, Math.ceil(cadence / parHeure))
    // Une cellule a deux bras ne coute pas deux fois une cellule a un bras :
    // la securite, l etude et la formation ne se paient qu une fois.
    const prix = Math.round(retenu.prix * (1 + (bras - 1) * 0.72))
    // Un poste coute 46 000 EUR charges par an ; une cellule en libere 1,4 par
    // bras, chiffre releve sur les quatre-vingt-onze cellules livrees.
    const gain = Math.round(bras * 1.4 * 46000)
    const retour = Math.max(1, Math.round((prix / gain) * 12))
    return { retenu, bras, parHeure: parHeure * bras, prix, gain, retour }
  }, [charge, portee, cadence])

  const choix = (
    valeurs: readonly number[],
    courant: number,
    poser: (v: number) => void,
    unite: string,
  ): ReactElement => (
    <div className="o-flex o-flex-wrap o-gap-2">
      {valeurs.map((valeur) => {
        const actif = valeur === courant
        return (
          <button
            key={valeur}
            type="button"
            aria-pressed={actif}
            onClick={() => {
              poser(valeur)
            }}
            className={`o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-font-mono o-text-sm o-tabular-nums o-transition-colors focus:o-ring ${actif ? 'o-border-transparent' : 'o-border-white-20 o-text-slate-300 hover:o-bg-white-10'}`}
            style={actif ? aplat() : undefined}
          >
            {valeur} {unite}
          </button>
        )
      })}
    </div>
  )

  return (
    <Porte forme="compteur" marque="Cobalt" sombre={false}>
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        {/* ================= 1. L ouverture, par le chiffre ================= */}
        <header
          id="haut"
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden o-bg-zinc-50 dark:o-bg-zinc-950"
        >
          <Halftone
            className="o-absolute o-inset-y-0 o-right-0 o-z-0 o-w-full o-pointer-events-none lg:o-w-3/5"
            colors={['--o-theme-bg', '--o-vitrine-600', '--o-vitrine-400']}
            density={44}
            fallback="o-bg-zinc-50 dark:o-bg-zinc-950"
          />
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background:
                'linear-gradient(to right, var(--o-theme-bg) 30%, color-mix(in oklab, var(--o-theme-bg) 55%, transparent) 55%, transparent 80%)',
            }}
          />

          <BarreGelule
            marque="Cobalt"
            liens={[
              ['#preuve', 'Ce que change une cellule'],
              ['#abaque', 'L abaque'],
              ['#fiche', 'Fiche'],
            ]}
            action={['#abaque', 'Chiffrer une cellule']}
            sombre={false}
          />

          <div className="o-relative o-z-10 o-mx-auto o-grid o-min-h-screen o-max-w-7xl o-items-center o-gap-12 o-px-6 o-pb-64 o-pt-32 md:o-px-10 lg:o-grid-cols-12 lg:o-pb-48">
            {/* La colonne de droite reste vide : c est la trame qui la tient. */}
            <div className="o-min-w-0 lg:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>
                  Integrateur de robotique industrielle — Caudan
                </Etiquette>
              </Surgit>
              <Surgit
                delai={120}
                as="h1"
                className="o-m-0 o-mt-7 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(2.75rem, 6.4vw, 6.5rem)',
                }}
              >
                Un bras rembourse en <Accent couleur={encre()}>dix-neuf mois</Accent>, et
                nous l ecrivons avant de le vendre.
              </Surgit>
              <Surgit
                delai={420}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-xl o-text-lg o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
              >
                Un industriel n achete pas un robot, il achete un delai de remboursement.
                L abaque au milieu de cette page le calcule avec vos chiffres, pas les
                notres.
              </Surgit>
              <Surgit delai={540} className="o-mt-9">
                <Actions
                  sombre={false}
                  pleine={[
                    '#abaque',
                    <>
                      Chiffrer ma cellule{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#preuve', 'Ce que change une cellule']}
                />
              </Surgit>
            </div>
          </div>

          {/* La barre de quatre nombres en verre, au bas de l ouverture — Stackside. */}
          <div className="o-absolute o-inset-x-0 o-bottom-0 o-z-10 o-mx-auto o-max-w-7xl o-px-6 o-pb-8 md:o-px-10">
            <Chiffres
              verre
              sombre={false}
              nombres={[
                { valeur: '19 mois', quoi: 'retour median, 41 cellules' },
                { valeur: '1 500', quoi: 'cycles par heure, gamme C-12' },
                { valeur: '0,02 mm', quoi: 'de repetabilite' },
                { valeur: '24 h', quoi: 'd astreinte, pieces sous 48 h' },
              ]}
            />
          </div>
          <Coin position="hd" sombre={false}>
            Fiche technique C-12
            <br />
            Edition 09.2026
          </Coin>
        </header>

        <main>
          {/* ================= 2. Le bandeau des secteurs, en mots geants ======= */}
          <div
            aria-label="Secteurs livres"
            className="o-border-b o-border-zinc-300 dark:o-border-zinc-700 o-py-6 o-text-zinc-950 dark:o-text-zinc-50"
            style={{ fontWeight: 300, letterSpacing: '-0.03em' }}
          >
            <Bandeau
              mots={SECTEURS}
              separateur="//"
              vitesse={70}
              taille="clamp(2.25rem, 6vw, 6rem)"
            />
          </div>

          {/* ================= 3. La preuve, en etapes defilantes ============== */}
          <section
            id="preuve"
            className="o-mx-auto o-max-w-6xl o-scroll-mt-24 o-px-6 o-py-20 md:o-py-28"
          >
            {/* Pas d intitule empile : un filet qui traverse, un releve dans la
              marge droite, et le titre seul en dessous. L abaque, plus bas,
              ouvre autrement — deux sections ne se lisent pas au meme rythme. */}
            <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-2 o-border-b o-border-zinc-900 dark:o-border-zinc-100 o-pb-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              <span style={{ color: encre() }}>(01) — Poste par poste</span>
              <span>Cadences relevees en production, apres la montee en charge</span>
            </p>
            <h2
              className="o-m-0 o-mt-10 o-max-w-4xl o-text-zinc-950 dark:o-text-zinc-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.25rem, 6vw, 6rem)' }}
            >
              Ce qu une cellule change, poste par poste.
            </h2>

            <div className="o-mt-14">
              <ScrollSteps
                label="Ce qu une cellule change"
                steps={ETAPES.map((e) => ({
                  title: e.titre,
                  body: <span className="o-leading-relaxed">{e.texte}</span>,
                }))}
                render={(index) => {
                  const courante = ETAPES[index] ?? ETAPES[0]
                  if (courante === undefined) return null
                  return (
                    <figure className="o-m-0">
                      <img
                        src={photo(courante.graine, 1200, 900)}
                        alt={courante.alt}
                        className="o-aspect-video o-h-auto o-w-full o-object-cover"
                      />
                      <figcaption className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        Etape {index + 1} sur {ETAPES.length} — {courante.alt}
                      </figcaption>
                    </figure>
                  )
                }}
              />
            </div>
          </section>

          {/* ================= 4. L abaque, le mecanisme, sur une bande sombre ===== */}
          <section
            id="abaque"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-py-28"
            style={nuit('slate')}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Indice rang="02">L abaque</Indice>
              <h2
                className="o-m-0 o-mt-5 o-max-w-2xl o-text-slate-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}
              >
                Trois nombres, et le devis.
              </h2>
              <p className="o-m-0 o-mt-5 o-max-w-xl o-text-base o-leading-relaxed o-text-slate-400">
                Le prix affiche est celui de la cellule complete — bras, prehenseur,
                securite, integration, formation, garantie. Pas celui du seul robot.
              </p>

              <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-14">
                <div className="o-min-w-0 lg:o-col-span-7">
                  <div className="o-flex o-flex-col o-gap-6">
                    {(
                      [
                        [
                          Weight,
                          'Charge a manipuler, prehenseur compris',
                          choix(CHARGES, charge, setCharge, 'kg'),
                        ],
                        [
                          Gauge,
                          'Portee necessaire',
                          choix(PORTEES, portee, setPortee, 'mm'),
                        ],
                        [
                          Cog,
                          'Cadence visee, par heure',
                          choix(CADENCES, cadence, setCadence, '/ h'),
                        ],
                      ] as const
                    ).map(([icone, quoi, controle]) => (
                      <fieldset key={quoi} className="o-m-0 o-p-0">
                        <legend className="o-mb-2.5 o-flex o-items-center o-gap-1.5 o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-slate-400">
                          <Icon icon={icone} size={12} aria-hidden="true" />
                          {quoi}
                        </legend>
                        {controle}
                      </fieldset>
                    ))}
                  </div>

                  {/* La gamme : la ligne retenue se surligne. */}
                  <div className="o-mt-10 o-overflow-x-auto">
                    <table
                      className="o-w-full o-text-sm"
                      style={{ minWidth: '34rem', borderCollapse: 'collapse' }}
                    >
                      <caption className="o-pb-2 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                        La gamme — la ligne retenue est surlignee
                      </caption>
                      <thead>
                        <tr className="o-border-b o-border-slate-600">
                          {(
                            [
                              ['Ref.', ''],
                              ['Charge', 'kg'],
                              ['Portee', 'mm'],
                              ['Repetabilite', 'mm'],
                              ['Cycle', 's'],
                              ['Cellule', 'EUR'],
                            ] as const
                          ).map(([entete, unite]) => (
                            <th
                              key={entete}
                              scope="col"
                              className="o-py-2 o-pr-5 o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-wider o-text-slate-400"
                            >
                              {entete}
                              {unite !== '' && (
                                <span className="o-ml-1 o-lowercase">({unite})</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {GAMME.map((bras) => {
                          const retenu = calcul?.retenu.reference === bras.reference
                          return (
                            <tr
                              key={bras.reference}
                              className="o-border-b o-border-slate-800"
                              style={
                                retenu
                                  ? { backgroundColor: accentDoux(500, 18) }
                                  : undefined
                              }
                            >
                              <th
                                scope="row"
                                className="o-py-2.5 o-pl-2 o-pr-5 o-text-left o-font-mono o-font-bold"
                                style={{
                                  color: retenu
                                    ? encreSurSombre()
                                    : 'var(--o-palette-slate-50)',
                                }}
                              >
                                {bras.reference}
                                {retenu && <span className="o-sr-only"> — retenu</span>}
                              </th>
                              <td className="o-py-2.5 o-pr-5 o-font-mono o-tabular-nums o-text-slate-200">
                                {bras.charge}
                              </td>
                              <td className="o-py-2.5 o-pr-5 o-font-mono o-tabular-nums o-text-slate-200">
                                {bras.portee}
                              </td>
                              <td className="o-py-2.5 o-pr-5 o-font-mono o-tabular-nums o-text-slate-200">
                                ± {bras.repetabilite.toLocaleString('fr-FR')}
                              </td>
                              <td className="o-py-2.5 o-pr-5 o-font-mono o-tabular-nums o-text-slate-200">
                                {bras.cycle.toLocaleString('fr-FR')}
                              </td>
                              <td className="o-py-2.5 o-font-mono o-tabular-nums o-text-slate-200">
                                {bras.prix.toLocaleString('fr-FR')}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <h3 className="o-m-0 o-mt-12 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                    Ce que comprend une cellule
                  </h3>
                  <dl className="o-m-0 o-mt-4 o-grid o-gap-x-8 o-gap-y-2.5 md:o-grid-cols-2">
                    {ARTICLES.map(([rang, texte]) => (
                      <div key={rang} className="o-flex o-items-start o-gap-3 o-text-sm">
                        <dt
                          className="o-shrink-0 o-font-mono o-text-xs o-tabular-nums"
                          style={{ color: encreSurSombre() }}
                        >
                          {rang}
                        </dt>
                        <dd className="o-m-0 o-leading-relaxed o-text-slate-300">
                          {texte}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {calcul !== undefined && (
                  <div className="lg:o-col-span-5">
                    <div
                      className={`${verre(true)} o-relative o-p-7 lg:o-sticky`}
                      style={{ top: 125 }}
                    >
                      {/* Les croix aux coins du cadre — Fuel : le devis se lit
                        comme une piece jointe, pas comme une carte. */}
                      <Croix />
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                        La cellule proposee
                      </p>
                      <p
                        className="o-m-0 o-mt-3 o-font-mono o-text-3xl o-font-bold o-tracking-tight"
                        style={{ color: encreSurSombre() }}
                      >
                        {calcul.bras > 1 ? `${String(calcul.bras)} × ` : ''}
                        {calcul.retenu.reference}
                      </p>
                      <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-slate-400">
                        {calcul.retenu.note}
                      </p>

                      <dl
                        aria-live="polite"
                        className="o-m-0 o-mt-6 o-flex o-flex-col o-gap-2.5 o-border-t o-border-white-10 o-pt-5 o-text-sm"
                      >
                        {(
                          [
                            ['Cadence tenue', `${String(calcul.parHeure)} / h`],
                            [
                              'Cellule complete',
                              `${calcul.prix.toLocaleString('fr-FR')} EUR`,
                            ],
                            [
                              'Gain annuel estime',
                              `${calcul.gain.toLocaleString('fr-FR')} EUR`,
                            ],
                          ] as const
                        ).map(([quoi, valeur]) => (
                          <div
                            key={quoi}
                            className="o-flex o-items-baseline o-justify-between o-gap-4"
                          >
                            <dt className="o-text-slate-400">{quoi}</dt>
                            <dd className="o-m-0 o-font-mono o-tabular-nums o-font-medium o-text-slate-50">
                              {valeur}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <p className="o-m-0 o-mt-6 o-border-t o-border-white-10 o-pt-5">
                        <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                          Retour sur investissement
                        </span>
                        <span className="o-mt-1 o-flex o-items-baseline o-gap-3 o-text-slate-50">
                          <CountUp
                            value={calcul.retour}
                            duration={900}
                            className="o-tabular-nums"
                            style={{
                              ...affiche('l', 300),
                              fontSize: 'clamp(3.5rem, 6vw, 6rem)',
                            }}
                          />
                          <span
                            className="o-font-mono o-text-sm o-uppercase o-tracking-wider"
                            style={{ color: encreSurSombre() }}
                          >
                            mois
                          </span>
                        </span>
                      </p>

                      <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-slate-400">
                        Hypotheses : un poste coute 46 000 EUR charges par an, et une
                        cellule en libere 1,4 par bras — releve sur les 91 cellules
                        livrees, non modelise.
                      </p>

                      <a
                        href="#appel"
                        className="o-mt-6 o-inline-flex o-w-full o-items-center o-justify-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                        style={aplat()}
                      >
                        Faire chiffrer sur ma piece
                        <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ================= 5. La bande d appel, en accent, qui defile ====== */}
          <section
            id="appel"
            aria-labelledby="appel-titre"
            className="o-scroll-mt-24 o-overflow-hidden o-py-10 md:o-py-14"
            style={aplat()}
          >
            <h2 id="appel-titre" className="o-sr-only">
              Nous ecrire
            </h2>
            <div aria-hidden="true" style={{ fontWeight: 300, letterSpacing: '-0.03em' }}>
              <Marquee speed={90} fade={0} pauseOnHover={false}>
                {APPEL.map((mot) => (
                  <span
                    key={mot}
                    className="o-flex o-shrink-0 o-items-center o-whitespace-nowrap"
                    style={{ fontSize: 'clamp(2.25rem, 6vw, 6rem)', lineHeight: 1 }}
                  >
                    <span className="o-px-6">{mot}</span>
                    <span className="o-opacity-50" style={{ fontSize: '0.4em' }}>
                      +
                    </span>
                  </span>
                ))}
              </Marquee>
            </div>
            <div className="o-mx-auto o-mt-8 o-flex o-max-w-6xl o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-3 o-px-6 o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-px-10">
              <p className="o-m-0">
                Envoyez le plan et la cadence visee — reponse sous cinq jours ouvres
              </p>
              <a
                href="#haut"
                className="o-inline-flex o-items-center o-gap-2 o-text-sm o-normal-case o-tracking-normal o-underline o-underline-offset-4 focus:o-ring"
                style={{ color: 'inherit' }}
              >
                bureau@cobalt-robotique.fr{' '}
                <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
              </a>
            </div>
          </section>
        </main>

        {/* ================= 6. Le pied : une fiche technique, en tableau a filets ===== */}
        <footer id="fiche" className="o-scroll-mt-24 o-px-6 o-pb-10 o-pt-16 md:o-px-10">
          <div className="o-mx-auto o-max-w-6xl">
            {/* Le mot-marque, redessine en trame ASCII : une vague y passe. Un
              div, pas un paragraphe, parce que la trame est un <pre>. */}
            <div
              className="o-w-full o-text-zinc-950 dark:o-text-zinc-50"
              style={{
                ...affiche('xxl', 700),
                fontSize: 'clamp(3rem, 22vw, 20rem)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              <AsciiText rows={26} speed={4200} waves={0.8}>
                Cobalt
              </AsciiText>
            </div>
            <div className="o-mt-8 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4">
              <p className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-sm o-font-bold o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                <Icon
                  icon={Cog}
                  size={16}
                  style={{ color: encre() }}
                  aria-hidden="true"
                />
                Fiche de la societe
              </p>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Edition 09.2026 — remplace 03.2026
              </p>
            </div>

            <table
              className="o-mt-6 o-w-full o-border-t o-border-zinc-900 dark:o-border-zinc-100"
              style={{ borderCollapse: 'collapse' }}
            >
              <caption className="o-sr-only">
                Fiche de la societe : coordonnees, conditions, references
              </caption>
              <tbody>
                <Ligne quoi="Raison sociale">
                  Cobalt Robotique SAS au capital de 200 000 EUR — RCS Lorient 823 004 715
                </Ligne>
                <Ligne quoi="Siege et atelier">
                  Zone de Kerpont, 56850 Caudan — vingt-deux personnes, dont neuf
                  automaticiens
                </Ligne>
                <Ligne quoi="Zone d intervention">
                  Bretagne et Pays de la Loire — astreinte 6 h a 22 h, du lundi au samedi
                </Ligne>
                <Ligne quoi="Applications">
                  Mise en carton, palettisation, chargement de presse, degrappage et
                  controle
                </Ligne>
                <Ligne quoi="Services">
                  Etude et chiffrage, integration complete, retrofit de parc, astreinte
                </Ligne>
                <Ligne quoi="Documents">
                  <span className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-1">
                    {[
                      'Fiche technique gamme C',
                      'Conditions generales',
                      'Attestation d assurance',
                      'Declaration CE',
                    ].map((doc) => (
                      <a
                        key={doc}
                        href="#haut"
                        className="o-inline-flex o-items-center o-gap-1 o-no-underline o-underline-offset-4 hover:o-underline focus:o-ring"
                        style={{ color: encre() }}
                      >
                        {doc} <Icon icon={ArrowUpRight} size={12} aria-hidden="true" />
                      </a>
                    ))}
                  </span>
                </Ligne>
                {CONDITIONS.map(([quoi, texte]) => (
                  <Ligne key={quoi} quoi={quoi}>
                    {texte}
                  </Ligne>
                ))}
                {RELEVE.map(([client, quoi, config, retour]) => (
                  <Ligne key={client} quoi={client}>
                    <span className="o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1">
                      <span>{quoi}</span>
                      <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                        {config}
                      </span>
                      <span
                        className="o-inline-flex o-items-center o-gap-1 o-font-mono o-text-xs o-tabular-nums"
                        style={{ color: encre() }}
                      >
                        <Icon icon={Check} size={12} aria-hidden="true" /> retour en{' '}
                        {retour}
                      </span>
                    </span>
                  </Ligne>
                ))}
                {TEMOIGNAGES.map(([qui, mot]) => (
                  <Ligne key={qui} quoi={qui}>
                    <span className="o-italic">« {mot} »</span>
                  </Ligne>
                ))}
              </tbody>
            </table>

            <div className="o-mt-6 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-2 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
              <p className="o-m-0">
                © 2026 Cobalt Robotique — les prix et retours affiches par l abaque sont
                indicatifs et confirmes par devis apres etude de la piece.
              </p>
              <a
                href="#haut"
                className="o-no-underline o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-950 dark:hover:o-text-zinc-50 o-transition-colors focus:o-ring"
              >
                Haut de page
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
