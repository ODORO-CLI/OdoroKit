/**
 * Franchise — courtier en assurance des professionnels.
 *
 * ## Le parti pris — trois sinistres, et ce qui reste vraiment a payer
 *
 * Un courtier vend un tableau de garanties, et tout le monde le lit de travers :
 * un plafond ne dit rien tant qu on ne l a pas confronte a un montant. Cette
 * page part donc de l autre bout. Trois sinistres reels sont poses avec leur
 * facture, poste par poste ; les trois formules sont appliquees dessus, ligne a
 * ligne, plafonds et franchise compris ; et la page affiche ce qui **reste a
 * votre charge**. C est le seul chiffre qui compte, et c est celui qu aucun
 * tableau de garanties n ecrit.
 *
 * Le calcul est honnete et refaisable : pour chaque poste, la part couverte
 * vaut le minimum entre le montant multiplie par le taux et le plafond de la
 * formule ; le reste a charge est la difference, plus la franchise. Les trois
 * colonnes sont visibles en meme temps, et la formule choisie en haut de
 * section pilote le chiffre en grand de chaque carte.
 *
 * ## Le fond, le mouvement, les coupes
 *
 * F-statique : un aplat franc, rien derriere le texte. La signature est
 * M-empile — les trois sinistres s empilent et se reduisent. Une bande sombre
 * coupe la page claire, et elle ne porte pas un argument : elle porte les
 * exclusions, ecrites en toutes lettres.
 *
 * ## Les formes
 *
 * A26 — un devis en trois curseurs, le total en 120 px.
 * P32 — un pied a deux etages : le premier sombre, le second clair.
 * C20 — des chiffres poses sur un plan cote.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, Umbrella } from '@odoro-cli/icons/filaire'
import { useId, useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'
import { Stepper } from '@/odoro/ui/Stepper.jsx'

import { nuit } from './communs.jsx'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Actions, affiche, BarreFilet, CHROME, Etiquette, Indice, Porte, Surgit, TitreVague, usePolices } from './marche.jsx'

/* ========================= Les constantes de dessin ===================== */

/** Le filet de la page, tire de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 15%, transparent)'

/** Le filet appuye : celui qui ferme une colonne de montants. */
const FILET_FORT = 'color-mix(in oklab, currentColor 38%, transparent)'

/** La voix mono des intitules et des notes. */
const NOTE = 'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-500 dark:o-text-slate-400'

/** La meme voix, sur une bande toujours sombre. */
const NOTE_SUR_NUIT = 'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-400'

/** Une encre semantique, tiree vers l encre du theme. */
function semantique(jeton: string): string {
  return `color-mix(in oklab, var(${jeton}) 45%, var(--o-theme-fg))`
}

/** Les montants, ecrits comme un courtier les ecrit. */
const EURO = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

/** Les liens de la barre a filet. */
const NAVIGATION = [
  ['#dossier', 'Le dossier'],
  ['#sinistres', 'Les sinistres'],
  ['#exclusions', 'Les exclusions'],
  ['#devis', 'Le devis'],
] as const

/* ========================= Le mecanisme : le sinistre =================== */

/** Les familles de postes d une facture de sinistre. */
type Famille = 'batiment' | 'contenu' | 'exploitation' | 'responsabilite' | 'expertise'

/** Le libelle de chaque famille, tel qu il apparait dans une facture. */
const FAMILLES: Readonly<Record<Famille, string>> = {
  batiment: 'Batiment et amenagements',
  contenu: 'Contenu, materiel, marchandises',
  exploitation: 'Pertes d exploitation',
  responsabilite: 'Responsabilite civile',
  expertise: 'Expertise et frais de dossier',
}

/** Ce qu une formule fait d une famille : un taux, et un plafond. */
interface Garantie {
  readonly taux: number
  readonly plafond: number
}

/** Une formule du contrat. */
interface Formule {
  readonly cle: string
  readonly nom: string
  readonly franchise: number
  readonly base: number
  readonly resume: string
  readonly garanties: Readonly<Record<Famille, Garantie>>
}

/**
 * Les trois formules, ecrites a la main.
 *
 * Un plafond a zero n est pas un oubli : c est une garantie absente, et la
 * page l affiche comme telle — « non couvert » — plutot que de laisser une
 * case vide dont chacun ferait ce qu il veut.
 */
const FORMULES: readonly Formule[] = [
  {
    cle: 'socle',
    nom: 'Socle',
    franchise: 1200,
    base: 42,
    resume: 'Le minimum exigible par un bail commercial : les murs, un peu de contenu, la responsabilite.',
    garanties: {
      batiment: { taux: 1, plafond: 120000 },
      contenu: { taux: 1, plafond: 25000 },
      exploitation: { taux: 0, plafond: 0 },
      responsabilite: { taux: 1, plafond: 150000 },
      expertise: { taux: 0, plafond: 0 },
    },
  },
  {
    cle: 'confort',
    nom: 'Confort',
    franchise: 600,
    base: 78,
    resume: 'La formule que nous proposons neuf fois sur dix : le contenu au bon niveau, et les pertes d exploitation entamees.',
    garanties: {
      batiment: { taux: 1, plafond: 300000 },
      contenu: { taux: 1, plafond: 80000 },
      exploitation: { taux: 0.7, plafond: 30000 },
      responsabilite: { taux: 1, plafond: 500000 },
      expertise: { taux: 1, plafond: 3000 },
    },
  },
  {
    cle: 'etendue',
    nom: 'Etendue',
    franchise: 300,
    base: 134,
    resume: 'Pour une maison dont l arret coute plus cher que les murs : les pertes d exploitation en entier.',
    garanties: {
      batiment: { taux: 1, plafond: 800000 },
      contenu: { taux: 1, plafond: 200000 },
      exploitation: { taux: 1, plafond: 120000 },
      responsabilite: { taux: 1, plafond: 2000000 },
      expertise: { taux: 1, plafond: 8000 },
    },
  },
]

/** Un poste d une facture de sinistre. */
interface Poste {
  readonly famille: Famille
  readonly detail: string
  readonly montant: number
}

/** Un sinistre type, avec sa facture. */
interface Sinistre {
  readonly cle: string
  readonly numero: string
  readonly titre: string
  readonly quand: string
  readonly recit: string
  readonly postes: readonly Poste[]
  /** Ce que le dossier a appris, et qui ne se lit pas dans le tableau. */
  readonly lecon: string
}

/**
 * Les trois sinistres types.
 *
 * Ce sont des dossiers reels, anonymises et arrondis a la centaine d euros.
 * Ils ont ete choisis parce qu ils tombent chacun dans une zone differente des
 * garanties : l un sature le contenu, l autre l exploitation, le troisieme la
 * responsabilite civile.
 */
const SINISTRES: readonly Sinistre[] = [
  {
    cle: 'eaux',
    numero: '01',
    titre: 'Degat des eaux',
    quand: 'Nuit du 12 au 13 fevrier',
    recit:
      'Une canalisation encastree cede au premier etage. L eau descend toute la nuit dans la reserve et la boutique. Le local rouvre onze jours plus tard.',
    lecon: 'Le contenu, seul, depasse le plafond du Socle. C est le sinistre le plus courant, et celui ou la formule minimale se voit le plus.',
    postes: [
      { famille: 'batiment', detail: 'Plafond, cloisons, sol de la reserve', montant: 18400 },
      { famille: 'contenu', detail: 'Marchandises, mobilier, deux vitrines', montant: 31200 },
      { famille: 'exploitation', detail: 'Onze jours de fermeture', montant: 9800 },
      { famille: 'expertise', detail: 'Expert d assure et constat', montant: 1450 },
    ],
  },
  {
    cle: 'machine',
    numero: '02',
    titre: 'Bris de machine',
    quand: 'Mardi 4 juin, 5 h 20',
    recit:
      'Le four de production casse en pleine chauffe. Piece indisponible, dix-neuf jours d arret, et une production sous-traitee a prix fort pendant la moitie du delai.',
    lecon: 'Ici ce n est pas le materiel qui coute le plus : c est l arret. Une formule sans pertes d exploitation laisse passer les deux tiers de la facture.',
    postes: [
      { famille: 'contenu', detail: 'Four de production, remplacement', montant: 46700 },
      { famille: 'exploitation', detail: 'Dix-neuf jours, dont neuf sous-traites', montant: 22300 },
      { famille: 'expertise', detail: 'Expertise technique du constructeur', montant: 2100 },
    ],
  },
  {
    cle: 'rc',
    numero: '03',
    titre: 'Responsabilite civile',
    quand: 'Samedi 3 octobre',
    recit:
      'Chute d une cliente sur un sol fraichement lave, sans signalisation. Fracture, six mois d arret, et une transaction conclue dix-huit mois plus tard.',
    lecon: 'Le seul poste ou le plafond du Socle ne suffit pas d un facteur voisin de un : il s en faut de trente-sept mille euros, payables par la maison.',
    postes: [
      { famille: 'responsabilite', detail: 'Indemnisation transactionnelle', montant: 187000 },
      { famille: 'expertise', detail: 'Avocat, expertise medicale, frais', montant: 4600 },
    ],
  },
]

/** La part couverte d un poste par une formule. */
function couvert(poste: Poste, formule: Formule): number {
  const garantie = formule.garanties[poste.famille]
  return Math.round(Math.min(poste.montant * garantie.taux, garantie.plafond))
}

/** Le compte d un sinistre pour une formule : total, couvert, reste. */
function compter(sinistre: Sinistre, formule: Formule): { total: number; couvert: number; reste: number } {
  const total = sinistre.postes.reduce((somme, poste) => somme + poste.montant, 0)
  const pris = sinistre.postes.reduce((somme, poste) => somme + couvert(poste, formule), 0)
  return { total, couvert: pris, reste: Math.max(0, total - pris) + formule.franchise }
}

/** Une carte de sinistre : le recit a gauche, le compte a droite. */
function CarteSinistre({ sinistre, choisie }: { readonly sinistre: Sinistre; readonly choisie: Formule }): ReactElement {
  const comptes = FORMULES.map((formule) => ({ formule, ...compter(sinistre, formule) }))
  const mien = compter(sinistre, choisie)

  return (
    <div className="o-overflow-hidden o-rounded-2xl o-bg-white o-p-7 dark:o-bg-slate-900 md:o-p-10" style={{ border: `1px solid ${FILET_FORT}` }}>
      <div className="o-grid o-gap-10 lg:o-grid-cols-12">
        {/* ---- Le recit : ce qui s est passe, et ce que cela a coute ------- */}
        <div className="o-min-w-0 lg:o-col-span-4">
          <p className={`o-m-0 ${NOTE}`}>
            <span style={{ color: encre() }}>{sinistre.numero}</span> — {sinistre.quand}
          </p>
          <h3 className="o-m-0 o-mt-3 o-text-3xl o-font-medium o-tracking-tight o-text-slate-950 dark:o-text-slate-50">{sinistre.titre}</h3>
          <p className="o-mt-5 o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">{sinistre.recit}</p>

          <p className={`o-m-0 o-mt-8 o-pt-4 ${NOTE}`} style={{ borderTop: `1px solid ${FILET}` }}>
            Facture totale
          </p>
          <p className="o-m-0 o-mt-2 o-tabular-nums o-text-slate-950 dark:o-text-slate-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3vw, 2.75rem)' }}>
            {EURO.format(mien.total)} €
          </p>

          <p className={`o-m-0 o-mt-7 o-pt-4 ${NOTE}`} style={{ borderTop: `2px solid ${semantique('--o-palette-rose-600')}`, color: semantique('--o-palette-rose-600') }}>
            Reste a votre charge en {choisie.nom}
          </p>
          <p
            aria-live="polite"
            className="o-m-0 o-mt-2 o-tabular-nums"
            style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 5vw, 4.25rem)', color: semantique('--o-palette-rose-600') }}
          >
            {EURO.format(mien.reste)} €
          </p>
          <p className={`o-m-0 o-mt-3 ${NOTE}`}>Franchise de {EURO.format(choisie.franchise)} € comprise</p>
        </div>

        {/* ---- Le compte, ligne a ligne, sur les trois formules ------------ */}
        <div className="o-min-w-0 lg:o-col-span-8">
          {/*
            Le tableau defile de cote sur un ecran etroit et declare
            `overflow-y: hidden` explicitement : sans cela la cascade met les
            deux axes a `auto`, la bande avale la molette et la page se fige
            sous le pointeur. Le conteneur porte `o-min-w-0`, sans quoi un
            enfant de grille a `min-width: auto` et deborde a 380 px.
          */}
          <div className="o-min-w-0 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
            <table className="o-w-full o-text-sm" style={{ borderCollapse: 'collapse', minWidth: 560 }}>
              <caption className={`o-pb-4 o-text-left ${NOTE}`}>Ce que chaque formule prend en charge, poste par poste</caption>
              <thead>
                <tr>
                  <th scope="col" className={`o-px-2 o-py-3 o-text-left o-font-normal ${NOTE}`} style={{ borderBottom: `1px solid ${FILET_FORT}` }}>
                    Poste
                  </th>
                  {FORMULES.map((formule) => (
                    <th
                      key={formule.cle}
                      scope="col"
                      className={`o-px-2 o-py-3 o-text-right o-font-normal ${NOTE}`}
                      style={{
                        borderBottom: `1px solid ${FILET_FORT}`,
                        color: formule.cle === choisie.cle ? encre() : undefined,
                        backgroundColor: formule.cle === choisie.cle ? accentDoux(400, 12) : undefined,
                      }}
                    >
                      {formule.nom}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sinistre.postes.map((poste) => (
                  <tr key={poste.famille}>
                    <th scope="row" className="o-px-2 o-py-3 o-text-left o-font-normal" style={{ borderBottom: `1px solid ${FILET}` }}>
                      <span className="o-block o-text-slate-950 dark:o-text-slate-50">{FAMILLES[poste.famille]}</span>
                      <span className="o-block o-text-xs o-text-slate-500 dark:o-text-slate-400">
                        {poste.detail} · {EURO.format(poste.montant)} €
                      </span>
                    </th>
                    {FORMULES.map((formule) => {
                      const pris = couvert(poste, formule)
                      const plein = pris >= poste.montant
                      return (
                        <td
                          key={formule.cle}
                          className="o-px-2 o-py-3 o-text-right o-font-mono o-tabular-nums"
                          style={{
                            borderBottom: `1px solid ${FILET}`,
                            backgroundColor: formule.cle === choisie.cle ? accentDoux(400, 12) : undefined,
                            color: pris === 0 ? semantique('--o-palette-rose-600') : plein ? undefined : semantique('--o-palette-amber-600'),
                          }}
                        >
                          {pris === 0 ? 'non couvert' : `${EURO.format(pris)} €`}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className={`o-px-2 o-py-4 o-text-left o-font-normal ${NOTE}`} style={{ borderBottom: `1px solid ${FILET_FORT}` }}>
                    Reste a votre charge, franchise comprise
                  </th>
                  {comptes.map(({ formule, reste }) => (
                    <td
                      key={formule.cle}
                      className="o-px-2 o-py-4 o-text-right o-font-mono o-text-base o-tabular-nums o-text-slate-950 dark:o-text-slate-50"
                      style={{
                        borderBottom: `1px solid ${FILET_FORT}`,
                        backgroundColor: formule.cle === choisie.cle ? accentDoux(400, 12) : undefined,
                      }}
                    >
                      {EURO.format(reste)} €
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="o-mt-7 o-max-w-2xl o-leading-relaxed o-text-slate-700 dark:o-text-slate-300">
            <span className="o-text-slate-950 dark:o-text-slate-50">Ce que ce dossier a appris. </span>
            {sinistre.lecon}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ========================= C20 : les chiffres sur un plan cote =========== */

/** Les chiffres du dossier d exemple, poses sur le plan. */
const COTES: readonly { readonly valeur: string; readonly quoi: string }[] = [
  { valeur: '84 m2', quoi: 'surface du local, boutique et reserve comprises' },
  { valeur: '96 000 €', quoi: 'valeur du contenu declaree au contrat' },
  { valeur: '620 000 €', quoi: 'chiffre d affaires du dernier exercice' },
  { valeur: '600 €', quoi: 'franchise retenue sur la formule Confort' },
]

/**
 * Le plan cote du local d exemple, dessine.
 *
 * Une barre de quatre nombres n aurait rien dit : quatre-vingt-quatre metres
 * carres ne veulent rien dire sans la piece. Ici les chiffres sont **poses sur
 * le plan**, a l endroit qu ils mesurent, avec leurs lignes de cote et leurs
 * fleches — comme sur une planche d architecte, et comme sur les plans que
 * l expert joint a son rapport.
 */
function PlanCote(): ReactElement {
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }
  const encreAccent = encre()
  return (
    <svg viewBox="0 0 1000 470" role="img" aria-label="Plan cote du local d exemple" className="o-w-full" style={{ minWidth: 640 }}>
      {/* Les murs : un rectangle de douze metres sur sept, a l echelle. */}
      <rect x="120" y="80" width="600" height="280" fill="none" stroke="currentColor" strokeWidth="2.5" />
      {/* La cloison de la reserve, et celle de l atelier. */}
      <line x1="480" y1="80" x2="480" y2="360" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />
      <line x1="480" y1="230" x2="720" y2="230" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />
      {/* La porte d entree, en arc. */}
      <path d="M240 360h58M240 360a58 58 0 0 0 58-58" fill="none" stroke={encreAccent} strokeWidth="2" />

      <text x="300" y="212" textAnchor="middle" fontSize="15" fill="currentColor">
        Boutique
      </text>
      <text x="300" y="232" textAnchor="middle" className="o-font-mono" fontSize="11" fill="currentColor" style={gris}>
        50 m2
      </text>
      <text x="600" y="160" textAnchor="middle" fontSize="15" fill="currentColor">
        Atelier
      </text>
      <text x="600" y="180" textAnchor="middle" className="o-font-mono" fontSize="11" fill="currentColor" style={gris}>
        22 m2
      </text>
      <text x="600" y="300" textAnchor="middle" fontSize="15" fill="currentColor">
        Reserve
      </text>
      <text x="600" y="320" textAnchor="middle" className="o-font-mono" fontSize="11" fill="currentColor" style={gris}>
        12 m2
      </text>

      {/* La ligne de cote du bas : douze metres. */}
      <line x1="120" y1="392" x2="720" y2="392" stroke="currentColor" strokeWidth="1" opacity="0.7" style={gris} />
      <path d="M128 387l-8 5 8 5M712 387l8 5-8 5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" style={gris} />
      <line x1="120" y1="364" x2="120" y2="398" stroke="currentColor" strokeWidth="1" opacity="0.5" style={gris} />
      <line x1="720" y1="364" x2="720" y2="398" stroke="currentColor" strokeWidth="1" opacity="0.5" style={gris} />
      <text x="420" y="386" textAnchor="middle" className="o-font-mono" fontSize="11" fill="currentColor" style={{ color: encreAccent }}>
        12,00 m
      </text>

      {/* La ligne de cote de gauche : sept metres. */}
      <line x1="88" y1="80" x2="88" y2="360" stroke="currentColor" strokeWidth="1" opacity="0.7" style={gris} />
      <path d="M83 88l5-8 5 8M83 352l5 8 5-8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" style={gris} />
      <line x1="82" y1="80" x2="124" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.5" style={gris} />
      <line x1="82" y1="360" x2="124" y2="360" stroke="currentColor" strokeWidth="1" opacity="0.5" style={gris} />
      <text x="80" y="224" textAnchor="middle" className="o-font-mono" fontSize="11" fill="currentColor" transform="rotate(-90 80 224)" style={{ color: encreAccent }}>
        7,00 m
      </text>

      {/*
        Les quatre chiffres, poses sur le plan au bout de leur attache.

        Le point d ancrage est dans la piece que le chiffre mesure ; le bout de
        l attache est calcule pour que le texte tienne dans le repere — une
        valeur alignee a droite pres du bord gauche sortait du dessin et se
        lisait « 00 € ».
      */}
      {([
        [300, 140, 300, 44, '96 000 €', 'contenu declare', 'middle'],
        [600, 258, 792, 252, '620 000 €', 'chiffre d affaires', 'start'],
        [200, 330, 200, 446, '84 m2', 'surface assuree', 'middle'],
        [268, 306, 78, 306, '600 €', 'franchise', 'end'],
      ] as const).map(([x1, y1, x2, y2, valeur, quoi, ancre]) => (
        <g key={valeur}>
          <circle cx={x1} cy={y1} r="3.5" fill={encreAccent} />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={encreAccent} strokeWidth="1" strokeDasharray="3 4" opacity="0.8" />
          <text x={x2} y={y2 - 4} textAnchor={ancre} fontSize="22" fill="currentColor" style={{ fontWeight: 300, letterSpacing: '-0.03em' }}>
            {valeur}
          </text>
          <text x={x2} y={y2 + 13} textAnchor={ancre} className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
            {quoi}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ========================= Les cinq jours qui suivent =================== */

/** Les quatre etapes qui suivent un sinistre, et ce qu elles demandent. */
const APRES: readonly { readonly id: string; readonly label: string; readonly hint: string; readonly texte: string }[] = [
  {
    id: 'constat',
    label: 'Jour 0',
    hint: 'Constater',
    texte:
      'Photographiez tout avant de toucher a quoi que ce soit, y compris ce qui parait sans importance. Un carrelage souleve sur une photographie vaut mieux qu une phrase dans un courrier.',
  },
  {
    id: 'declarer',
    label: 'Jours 1 a 5',
    hint: 'Declarer',
    texte:
      'Cinq jours ouvres pour un degat des eaux ou un bris, deux pour un vol. Nous declarons a votre place le jour ou vous nous appelez : c est le seul delai que nous ne laissons jamais courir.',
  },
  {
    id: 'expertise',
    label: 'Jours 6 a 20',
    hint: 'Faire expertiser',
    texte:
      'L expert de la compagnie passe. Nous demandons un expert d assure quand la facture depasse vingt mille euros : ses honoraires sont couverts des la formule Confort, et il change le chiffre.',
  },
  {
    id: 'reglement',
    label: 'Jours 21 a 60',
    hint: 'Se faire regler',
    texte:
      'Une provision est demandee des l accord de principe, sans attendre le rapport definitif. C est ce qui fait la difference entre une tresorerie qui tient et une tresorerie qui casse.',
  },
]

/* ========================= A26 : le devis en trois curseurs ============= */

/** Un curseur du devis : sa plage, son pas, et ce qu il pese. */
const CURSEURS: readonly {
  readonly cle: 'contenu' | 'franchise' | 'chiffre'
  readonly intitule: string
  readonly unite: string
  readonly min: number
  readonly max: number
  readonly pas: number
  readonly depart: number
  readonly aide: string
}[] = [
  { cle: 'contenu', intitule: 'Contenu assure', unite: 'k€', min: 20, max: 400, pas: 5, depart: 96, aide: 'Materiel, marchandises, amenagements : leur valeur de remplacement' },
  { cle: 'franchise', intitule: 'Franchise choisie', unite: '€', min: 150, max: 2000, pas: 50, depart: 600, aide: 'Ce qui reste a votre charge a chaque sinistre, quel qu il soit' },
  { cle: 'chiffre', intitule: 'Chiffre d affaires', unite: 'k€ par an', min: 100, max: 3000, pas: 20, depart: 620, aide: 'Il sert a calculer les pertes d exploitation, pas a vous faire payer plus' },
]

/**
 * Le coefficient de franchise, entre 1,28 et 0,82, en ligne droite.
 *
 * Ce n est pas une courbe savante : une droite entre deux bornes ecrites, que
 * le lecteur peut refaire. Une formule qu on ne peut pas refaire n est pas un
 * devis.
 */
function coefficientFranchise(franchise: number): number {
  const part = (franchise - 150) / (2000 - 150)
  return 1.28 - part * 0.46
}

/** La cotisation mensuelle, en euros. */
function cotisation(base: number, contenu: number, chiffre: number, franchise: number): number {
  return Math.round((base + 0.42 * contenu + 0.11 * chiffre) * coefficientFranchise(franchise))
}

/* ========================= La vitrine ================================== */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  const identifiant = useId()

  const [formule, setFormule] = useState('confort')
  const [valeurs, setValeurs] = useState<Record<'contenu' | 'franchise' | 'chiffre', number>>({ contenu: 96, franchise: 600, chiffre: 620 })
  const [etape, setEtape] = useState(0)

  const choisie = FORMULES.find((f) => f.cle === formule) ?? FORMULES[1] ?? FORMULES[0]
  const courante = APRES[etape] ?? APRES[0]

  const total = useMemo(
    () => (choisie === undefined ? 0 : cotisation(choisie.base, valeurs.contenu, valeurs.chiffre, valeurs.franchise)),
    [choisie, valeurs],
  )

  if (choisie === undefined) return <></>

  return (
    <Porte forme="iris" marque="Franchise" sombre={false}>
      <div className="o-bg-white dark:o-bg-slate-950 o-text-slate-800 dark:o-text-slate-200" style={polices}>
        {/*
          ----- L ouverture — Baseline ---------------------------------------

          F-statique : un aplat franc, rien derriere le texte. Une accroche,
          une phrase, deux gelules, et la rangee des trois sinistres en bas de
          cadre — qui annonce le mecanisme au lieu de le promettre.
        */}
        <div id="haut" className="o-relative">
          <BarreFilet marque="Franchise" liens={NAVIGATION} action={['#devis', 'Chiffrer un contrat']} sombre={false} />

          {/*
            La hauteur retire les barres de la documentation : sans cela la
            rangee des trois sinistres tombe cent pixels sous le pli, et
            l ouverture se lit comme un demi-ecran vide.
          */}
          <div
            className="o-flex o-flex-col o-justify-between o-gap-14 o-px-6 o-pb-12 o-pt-16 md:o-px-8 md:o-pt-24"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          >
            <div className="o-grid o-gap-10 md:o-grid-cols-12">
              <div className="o-min-w-0 md:o-col-span-8">
                <Surgit>
                  <Etiquette sombre={false}>Courtier en assurance des professionnels — ORIAS 12 004 118</Etiquette>
                </Surgit>
                <TitreVague
                  delai={130}
                  className="o-m-0 o-mt-7 o-max-w-4xl o-text-slate-950 dark:o-text-slate-50"
                  style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 6.2vw, 6.5rem)' }}
                >
                  Un plafond ne veut rien dire tant qu on n a pas la facture en face.
                </TitreVague>
              </div>
              <Surgit delai={440} className="o-flex o-flex-col o-justify-end o-gap-7 md:o-col-span-4">
                <p className="o-m-0 o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Trois sinistres reels, leur facture poste par poste, et ce que chacune de nos trois formules laisse a votre charge. Le
                  tableau de garanties vient apres, et il se lit tout seul.
                </p>
                <Actions
                  sombre={false}
                  pleine={[
                    '#sinistres',
                    <>
                      Voir les trois factures <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#devis', 'Chiffrer un contrat']}
                />
              </Surgit>
            </div>

            {/* La rangee de bas de cadre : les trois sinistres, en une ligne. */}
            <Surgit delai={620}>
              <div className="o-grid o-gap-px md:o-grid-cols-3" style={{ backgroundColor: FILET, borderTop: `1px solid ${FILET_FORT}` }}>
                {SINISTRES.map((sinistre) => {
                  const compte = compter(sinistre, choisie)
                  return (
                    <a
                      key={sinistre.cle}
                      href="#sinistres"
                      className="o-flex o-min-w-0 o-flex-col o-gap-2 o-bg-white o-px-5 o-py-6 o-no-underline o-text-current dark:o-bg-slate-950 focus:o-ring"
                    >
                      <span className={NOTE}>
                        <span style={{ color: encre() }}>{sinistre.numero}</span> — {sinistre.titre}
                      </span>
                      <span className="o-tabular-nums o-text-slate-950 dark:o-text-slate-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)' }}>
                        {EURO.format(compte.total)} €
                      </span>
                      <span className="o-text-sm o-text-slate-600 dark:o-text-slate-400">
                        dont {EURO.format(compte.reste)} € a votre charge en {choisie.nom}
                      </span>
                    </a>
                  )
                })}
              </div>
            </Surgit>
          </div>
        </div>

        <main>
          {/*
            ----- C20 : les chiffres poses sur un plan cote --------------------
          */}
          <section id="dossier" aria-labelledby="dossier-titre" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={{ borderTop: `1px solid ${FILET}` }}>
            <div className="o-grid o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-4">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                  Figure 01
                </p>
                <h2 id="dossier-titre" className="o-m-0 o-mt-5 o-text-slate-950 dark:o-text-slate-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
                  <SplitReveal as="span" by="words" stagger={70}>
                    Le dossier qui sert d exemple.
                  </SplitReveal>
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Une boutique avec atelier, quatre-vingt-quatre metres carres, six personnes. Les trois sinistres de cette page sont les
                  siens, et les chiffres du devis en bas de page sont les siens aussi.
                </p>
                <dl className="o-m-0 o-mt-8 o-flex o-list-none o-flex-col o-gap-4 o-p-0">
                  {COTES.map((cote) => (
                    <div key={cote.valeur} className="o-pt-3" style={{ borderTop: `1px solid ${FILET}` }}>
                      <dt className="o-font-mono o-text-base o-tabular-nums" style={{ color: encre() }}>
                        {cote.valeur}
                      </dt>
                      <dd className={`o-m-0 o-mt-1 ${NOTE}`}>{cote.quoi}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <figure className="o-m-0 o-min-w-0 lg:o-col-span-8">
                <div className="o-min-w-0 o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <PlanCote />
                </div>
                <figcaption className="o-mt-6 o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-slate-500 dark:o-text-slate-400" style={{ borderTop: `1px solid ${FILET}` }}>
                  Figure 01 — le local, a l echelle, avec ses deux cotes et les quatre chiffres du contrat poses a l endroit qu ils mesurent.
                  C est le plan que l expert joint a son rapport.
                </figcaption>
              </figure>
            </div>
          </section>

          {/*
            ----- Le mecanisme : les trois sinistres empiles (M-empile) --------
          */}
          <section id="sinistres" aria-labelledby="sinistres-titre" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={{ borderTop: `1px solid ${FILET}` }}>
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <Indice rang="01" sombre={false}>
                  Les trois sinistres
                </Indice>
                <h2 id="sinistres-titre" className="o-m-0 o-mt-5 o-max-w-2xl o-text-slate-950 dark:o-text-slate-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}>
                  Ce qui reste a payer, ligne a ligne.
                </h2>
              </div>
              {/* Le seul reglage de la section : il pilote les trois cartes. */}
              <div className="md:o-col-span-5 md:o-text-right">
                <p className={`o-m-0 o-mb-3 ${NOTE}`}>La formule que vous avez aujourd hui</p>
                <div role="group" aria-label="Votre formule" className="o-flex o-flex-wrap o-gap-2 md:o-justify-end">
                  {FORMULES.map((option) => (
                    <button
                      key={option.cle}
                      type="button"
                      aria-pressed={option.cle === formule}
                      onClick={() => {
                        setFormule(option.cle)
                      }}
                      className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-font-medium focus:o-ring"
                      style={option.cle === formule ? { ...aplat(), borderColor: 'transparent' } : { borderColor: FILET_FORT }}
                    >
                      {option.nom}
                    </button>
                  ))}
                </div>
                <p className="o-m-0 o-mt-4 o-max-w-sm o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-ml-auto">{choisie.resume}</p>
              </div>
            </div>

            <div className="o-mt-16">
              <StickyStack offset={140} gap={24} shrink={0.05}>
                {SINISTRES.map((sinistre) => (
                  <CarteSinistre key={sinistre.cle} sinistre={sinistre} choisie={choisie} />
                ))}
              </StickyStack>
            </div>
          </section>

          {/*
            ----- Les cinq jours qui suivent -----------------------------------
          */}
          <section aria-labelledby="apres-titre" className="o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={{ borderTop: `1px solid ${FILET}`, backgroundColor: accentDoux(300, 7) }}>
            <div className="o-grid o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-4">
                <Indice rang="02" sombre={false}>
                  Apres le sinistre
                </Indice>
                <h2 id="apres-titre" className="o-m-0 o-mt-5 o-text-slate-950 dark:o-text-slate-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
                  Les soixante jours qui decident.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Un contrat ne vaut que par ce qui se passe la semaine du sinistre. Voici ce que nous faisons a votre place, et ce que nous
                  ne pouvons pas faire a votre place.
                </p>
                <p className="o-m-0 o-mt-8 o-text-lg">
                  <a href="tel:+33228440290" className="o-inline-flex o-items-center o-gap-2 o-no-underline focus:o-ring" style={{ color: encre() }}>
                    Urgence sinistre — 02 28 44 02 90
                    <Icon icon={ArrowUpRight} size={17} aria-hidden="true" />
                  </a>
                </p>
              </div>
              <div className="o-min-w-0 lg:o-col-span-8">
                <Stepper
                  steps={APRES.map((e) => ({ id: e.id, label: e.label, hint: e.hint }))}
                  label="Les etapes apres un sinistre"
                  value={etape}
                  onChange={setEtape}
                  reach="all"
                >
                  <p className="o-m-0 o-max-w-2xl o-text-lg o-leading-relaxed o-text-slate-700 dark:o-text-slate-300">{courante?.texte}</p>
                </Stepper>
              </div>
            </div>
          </section>

          {/*
            ----- La bande sombre : ce qui n est pas couvert --------------------

            La coupe de la page. Elle ne porte pas un argument de plus : elle
            porte les exclusions, en toutes lettres, parce que c est la seule
            page ou un courtier peut les ecrire avant la signature.
          */}
          <section id="exclusions" aria-labelledby="exclusions-titre" className="o-scroll-mt-24 o-px-6 o-py-28 md:o-px-8 md:o-py-40" style={nuit('slate')}>
            <div className="o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-12">
              <p className={`o-m-0 md:o-col-span-3 ${NOTE_SUR_NUIT}`}>
                Ce que nous ne couvrons pas
                <br />
                Ecrit avant la signature
              </p>
              <div className="o-min-w-0 md:o-col-span-9">
                <h2 id="exclusions-titre" className="o-m-0 o-max-w-4xl o-text-slate-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.4vw, 3.25rem)', lineHeight: 1.12 }}>
                  Quatre exclusions, et aucune d elles n est en petits caracteres.
                </h2>
                <ol className="o-m-0 o-mt-12 o-list-none o-p-0">
                  {([
                    ['Le defaut d entretien', 'Une toiture dont les ardoises manquaient depuis deux ans, une chaudiere sans revision : l assureur refuse, et il a raison de refuser.'],
                    ['Le vol sans effraction', 'Une porte laissee ouverte, un code communique. Nous proposons une extension, elle coute treize euros par mois, et nous la conseillons pour les commerces.'],
                    ['La faute intentionnelle', 'Elle n est jamais assurable, par aucun contrat et chez aucune compagnie. La loi l interdit, et c est la seule exclusion qui ne se negocie pas.'],
                    ['Les marchandises hors du local', 'Un stock en depot, un materiel prete, une exposition : cela releve d un autre contrat, et nous le disons avant, pas apres.'],
                  ] as const).map(([titre, texte], rang) => (
                    <li key={titre} className="o-grid o-gap-x-8 o-gap-y-2 o-py-6 md:o-grid-cols-12" style={{ borderTop: `1px solid color-mix(in oklab, #ffffff 16%, transparent)` }}>
                      <p className={`o-m-0 md:o-col-span-1 ${NOTE_SUR_NUIT}`} style={{ color: encreSurSombre() }}>
                        {String(rang + 1).padStart(2, '0')}
                      </p>
                      <p className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-slate-50 md:o-col-span-4">{titre}</p>
                      <p className="o-m-0 o-leading-relaxed o-text-slate-300 md:o-col-span-7">{texte}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/*
            ----- A26 : le devis en trois curseurs, le total en 120 px ----------
          */}
          <section id="devis" aria-labelledby="devis-titre" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="03" sombre={false}>
                  Le devis
                </Indice>
                <h2 id="devis-titre" className="o-m-0 o-mt-5 o-max-w-3xl o-text-slate-950 dark:o-text-slate-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}>
                  Trois curseurs, et la cotisation.
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                Formule {choisie.nom}, changez-la plus haut
                <br />
                La formule de calcul est sous le total
              </p>
            </div>

            <div className="o-mt-16 o-grid o-gap-12 lg:o-grid-cols-12 lg:o-items-start">
              <div className="o-min-w-0 lg:o-col-span-6">
                <div className="o-grid o-gap-9">
                  {CURSEURS.map((curseur) => {
                    const id = `${identifiant}-${curseur.cle}`
                    const valeur = valeurs[curseur.cle]
                    return (
                      <div key={curseur.cle}>
                        <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
                          <label htmlFor={id} className="o-text-base o-text-slate-950 dark:o-text-slate-50">
                            {curseur.intitule}
                          </label>
                          <p className="o-m-0 o-font-mono o-text-lg o-tabular-nums" style={{ color: encre() }}>
                            {EURO.format(valeur)} <span className="o-text-xs o-uppercase o-tracking-widest">{curseur.unite}</span>
                          </p>
                        </div>
                        <input
                          id={id}
                          type="range"
                          min={curseur.min}
                          max={curseur.max}
                          step={curseur.pas}
                          value={valeur}
                          onChange={(evenement) => {
                            const lu = Number(evenement.target.value)
                            setValeurs((precedent) => ({ ...precedent, [curseur.cle]: lu }))
                          }}
                          className="o-mt-4 o-block o-w-full o-cursor-pointer focus:o-ring"
                          style={{ accentColor: encre() }}
                        />
                        <p className={`o-m-0 o-mt-2 ${NOTE}`}>{curseur.aide}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="o-min-w-0 lg:o-col-span-6">
                <p className={`o-m-0 ${NOTE}`}>Cotisation mensuelle, formule {choisie.nom}</p>
                <p
                  aria-live="polite"
                  className="o-m-0 o-mt-4 o-tabular-nums o-text-slate-950 dark:o-text-slate-50"
                  style={{ ...affiche('xl', 300), fontSize: 'clamp(3rem, 9vw, 7.5rem)', lineHeight: 0.86 }}
                >
                  {EURO.format(total)} €
                </p>
                <p className="o-m-0 o-mt-5 o-text-lg o-text-slate-700 dark:o-text-slate-300">
                  soit <span className="o-tabular-nums o-text-slate-950 dark:o-text-slate-50">{EURO.format(total * 12)} €</span> par an, prelevables au mois ou au trimestre.
                </p>
                <p className={`o-m-0 o-mt-8 o-pt-4 ${NOTE}`} style={{ borderTop: `1px solid ${FILET}`, textTransform: 'none' }}>
                  {EURO.format(choisie.base)} € de base + 0,42 € par millier de contenu + 0,11 € par millier de chiffre d affaires, le tout
                  multiplie par le coefficient de franchise — 1,28 a 150 € et 0,82 a 2 000 €, en ligne droite entre les deux. Ici :{' '}
                  {String(Math.round(coefficientFranchise(valeurs.franchise) * 100) / 100).replace('.', ',')}.
                </p>
                <p className="o-mt-6 o-max-w-md o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Ce montant est une estimation de courtier, pas une proposition d assureur : la compagnie garde son mot a dire sur le
                  sinistre passe et l activite exacte. Nous vous rendons la vraie proposition sous quarante-huit heures.
                </p>
                <div className="o-mt-9">
                  <Actions
                    sombre={false}
                    pleine={[
                      'mailto:devis@franchise-courtage.fr',
                      <>
                        Demander la proposition <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['tel:+33228440290', '02 28 44 02 90']}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        {/*
          ----- P32 : un pied a deux etages, le premier sombre ----------------
        */}
        <footer>
          <div className="o-px-6 o-py-16 md:o-px-8" style={nuit('slate')}>
            <div className="o-grid o-gap-10 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <p className={`o-m-0 ${NOTE_SUR_NUIT}`}>Un sinistre, a toute heure</p>
                <p className="o-m-0 o-mt-4">
                  <a href="tel:+33228440290" className="o-no-underline o-text-slate-50 focus:o-ring" style={{ ...affiche('l', 300), fontSize: 'clamp(2.25rem, 6vw, 5rem)' }}>
                    02 28 44 02 90
                  </a>
                </p>
                <p className="o-m-0 o-mt-4 o-max-w-lg o-leading-relaxed o-text-slate-300">
                  Une personne du cabinet repond, pas un serveur vocal. La declaration part le jour meme, et vous recevez sa copie.
                </p>
              </div>
              <div className="md:o-col-span-5">
                <p className={`o-m-0 ${NOTE_SUR_NUIT}`}>Le cabinet</p>
                <p className="o-m-0 o-mt-4 o-leading-relaxed o-text-slate-300">
                  Franchise — courtage en assurance
                  <br />
                  17 quai de la Fosse, 44000 Nantes
                  <br />
                  Du lundi au vendredi, 8 h 30 — 18 h 30
                </p>
                <p className="o-m-0 o-mt-5">
                  <a href="mailto:contact@franchise-courtage.fr" className="o-inline-flex o-items-center o-gap-2 o-no-underline o-text-slate-50 focus:o-ring">
                    contact@franchise-courtage.fr
                    <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="o-bg-white o-px-6 o-py-8 dark:o-bg-slate-950 md:o-px-8" style={{ borderTop: `1px solid ${FILET}` }}>
            <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-8 o-gap-y-3">
              <span className="o-inline-flex o-items-center o-gap-2 o-text-base o-font-semibold o-tracking-tight o-text-slate-950 dark:o-text-slate-50">
                <Icon icon={Umbrella} size={16} style={{ color: encre() }} aria-hidden="true" />
                Franchise
              </span>
              <span className={NOTE}>Courtier immatricule a l ORIAS sous le numero 12 004 118 — verifiable sur orias.fr</span>
            </div>
            <p className={`o-mt-5 o-flex o-flex-wrap o-gap-x-6 o-gap-y-2 ${NOTE}`}>
              <span>Responsabilite civile professionnelle et garantie financiere conformes au code des assurances</span>
              <span>Aucune participation d un assureur au capital du cabinet</span>
              <span>Mediateur de l assurance, TSA 50110, 75441 Paris cedex 09</span>
            </p>
            <p className={`o-mt-5 o-flex o-flex-wrap o-justify-between o-gap-4 o-pt-5 ${NOTE}`} style={{ borderTop: `1px solid ${FILET}` }}>
              <span>© 2026 Franchise SARL de courtage</span>
              <span>
                <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                  Mentions legales
                </a>
                {' · '}
                <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                  Donnees personnelles
                </a>
                {' · '}
                <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                  Accessibilite : partiellement conforme
                </a>
              </span>
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
