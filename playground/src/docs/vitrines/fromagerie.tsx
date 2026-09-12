/**
 * Hale — fromager affineur, Lyon.
 *
 * ## Le mecanisme : la cave d affinage
 *
 * Un affineur ne vend pas un fromage, il vend **le temps qu il lui a donne**.
 * La page dessine donc la cave en coupe — trois etages, chacun avec sa
 * temperature et son hygrometrie — et y pose les six pieces de la maison **a
 * l endroit ou elles sont vraiment**.
 *
 * Le calcul est vrai : chaque piece porte sa date de mise en cave, exprimee en
 * jour de l annee. La page la ramene a l annee en cours — ou a la precedente
 * si le jour n est pas encore passe — compte les jours ecoules jusqu a
 * aujourd hui, et en deduit l etage, l avancement et la date de sortie. Revenez
 * demain : les pieces auront pris un jour, et l une d elles aura peut-etre
 * change d etage.
 *
 * A cote de la coupe, une **echelle verticale graduee** (C15) porte la valeur
 * de la piece regardee : le jour ou elle en est, sur la duree qu on lui donne.
 *
 * ## Le panier flottant (A21)
 *
 * On parcourt, on ajoute, et une planche flottante recapitule en bas a droite
 * ce qu on a choisi, avec le poids et le total. Chaque ajout est annonce par la
 * pile de notifications du registre — c est ce qu on entend au comptoir quand
 * le fromager repete la commande.
 *
 * ## Ce qui est dessine
 *
 * Les six pieces, la cave, l echelle, la plaque de caseine du pied. Aucune
 * photographie : le registre n en a pas de fromage, et une photo d une autre
 * maison serait un mensonge.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ShoppingBasket, Thermometer } from '@odoro-cli/icons/filaire'
import { useMemo, useRef, useState, type ReactElement } from 'react'

import { CursorHalo } from '@/odoro/effect/CursorHalo.jsx'
import { StrokeText } from '@/odoro/text/StrokeText.jsx'
import { ToastStack, type ToastItem } from '@/odoro/ui/ToastStack.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Rail } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques, aux quatre coins. */
const NAVIGATION: readonly Lien[] = [
  ['#planche', 'La planche'],
  ['#cave', 'La cave'],
  ['#retirer', 'Retirer'],
]

/* ============================ Les pieces =============================== */

/** La forme d une piece, telle qu on la dessine. */
type Forme = 'meule' | 'pyramide' | 'buche' | 'cylindre' | 'carre'

/** Une piece en cours d affinage. */
interface Piece {
  readonly cle: string
  readonly nom: string
  readonly lait: string
  readonly ferme: string
  readonly forme: Forme
  /** Jour de l annee ou la piece est entree en cave, de 1 a 365. */
  readonly entree: number
  /** Duree d affinage visee, en jours. */
  readonly duree: number
  /** Jours passes au haloir avant la cave, puis en cave avant l attente. */
  readonly paliers: readonly [number, number]
  /** Poids d une piece entiere, en grammes. */
  readonly poids: number
  /** Prix au kilo, en euros. */
  readonly prix: number
  readonly note: string
}

const PIECES: readonly [Piece, ...Piece[]] = [
  {
    cle: 'tomme',
    nom: 'Tomme des Bauges',
    lait: 'Vache crue, montagne',
    ferme: 'Ferme du Nivolet, Savoie',
    forme: 'meule',
    entree: 96,
    duree: 150,
    paliers: [14, 90],
    poids: 1400,
    prix: 26.5,
    note: 'Croute grise, tourillonnee au gris de cave. Elle se fait a la brosse, deux fois par semaine.',
  },
  {
    cle: 'valencay',
    nom: 'Valencay fermier',
    lait: 'Chevre crue',
    ferme: 'Chevrerie des Genets, Berry',
    forme: 'pyramide',
    entree: 214,
    duree: 32,
    paliers: [6, 20],
    poids: 220,
    prix: 38,
    note: 'Cendre de charbon de bois au demoulage. La pyramide tronquee perd un tiers de son poids.',
  },
  {
    cle: 'saint-nectaire',
    nom: 'Saint-Nectaire fermier',
    lait: 'Vache crue',
    ferme: 'Ferme de Besse, Puy-de-Dome',
    forme: 'cylindre',
    entree: 158,
    duree: 84,
    paliers: [10, 56],
    poids: 1650,
    prix: 24.9,
    note: 'Affine sur paille de seigle. Les fleurs blanches et jaunes de la croute sont le signe qu il est pret.',
  },
  {
    cle: 'buche',
    nom: 'Buche cendree',
    lait: 'Chevre crue',
    ferme: 'Chevrerie des Genets, Berry',
    forme: 'buche',
    entree: 236,
    duree: 24,
    paliers: [5, 15],
    poids: 180,
    prix: 34,
    note: 'Vingt-quatre jours suffisent : au-dela, le coeur se casse et la buche devient un baton.',
  },
  {
    cle: 'comte',
    nom: 'Comte 30 mois',
    lait: 'Vache crue, montbeliarde',
    ferme: 'Fruitiere de Levier, Doubs',
    forme: 'meule',
    entree: 12,
    duree: 330,
    paliers: [30, 210],
    poids: 3200,
    prix: 41,
    note: 'Meule de 38 kg achetee en fruitiere, descendue chez nous a dix-huit mois. Nous finissons les douze derniers.',
  },
  {
    cle: 'bleu',
    nom: 'Bleu de Termignon',
    lait: 'Vache crue, ensemencement naturel',
    ferme: 'Alpage de la Vanoise, Savoie',
    forme: 'carre',
    entree: 182,
    duree: 120,
    paliers: [12, 78],
    poids: 2100,
    prix: 58,
    note: 'Aucun ferment ajoute : le bleu vient de l air de l alpage. Quatre-vingts pieces par an, et pas une de plus.',
  },
]

/** Les trois etages de la cave, du plus sec au plus humide. */
const ETAGES = [
  {
    nom: 'Haloir',
    temperature: '14 degres',
    hygrometrie: '80 pour cent',
    role: 'Le ressuyage : la piece perd son eau de surface et prend sa croute.',
  },
  {
    nom: 'Cave d affinage',
    temperature: '11 degres',
    hygrometrie: '92 pour cent',
    role: 'Le travail : brossage, frottage, retournement. C est la que la croute se fait.',
  },
  {
    nom: 'Cave d attente',
    temperature: '8 degres',
    hygrometrie: '95 pour cent',
    role: 'Le repos : la piece est faite et attend son jour, au froid, sans etre touchee.',
  },
] as const

/** Un jour de l annee, en millisecondes depuis l epoque, pour l annee donnee. */
function jourDeLAnnee(annee: number, jour: number): number {
  return Date.UTC(annee, 0, 1) + (jour - 1) * 86400000
}

/**
 * Le nombre de jours passes en cave, a la date du visiteur.
 *
 * Une cave tourne : quand un lot sort, le suivant entre le jour meme, sur la
 * meme planche. Le compte est donc **cyclique** — il court de zero a la duree
 * d affinage, puis repart. C est ce qui fait qu il y a toujours une tomme en
 * cave, et c est aussi ce qui empeche la page de vieillir : elle avance d un
 * jour par jour, indefiniment, sans qu aucune date soit ecrite en dur.
 */
function joursEnCave(piece: Piece, aujourdhui: number): number {
  const annee = new Date(aujourdhui).getUTCFullYear()
  const cetteAnnee = jourDeLAnnee(annee, piece.entree)
  const depart = cetteAnnee <= aujourdhui ? cetteAnnee : jourDeLAnnee(annee - 1, piece.entree)
  const ecoules = Math.max(0, Math.floor((aujourdhui - depart) / 86400000))
  return ecoules % piece.duree
}

/** L etage ou se trouve une piece, de 0 a 2. */
function etageDe(piece: Piece, jours: number): number {
  if (jours < piece.paliers[0]) return 0
  return jours < piece.paliers[1] ? 1 : 2
}

/** Un prix en euros, a la francaise. */
function euros(n: number): string {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
}

/** Un poids, en grammes ou en kilos selon ce qui se dit. */
function poidsDit(grammes: number): string {
  return grammes >= 1000 ? `${(grammes / 1000).toLocaleString('fr-FR')} kg` : `${String(grammes)} g`
}

/* ============================ Les pieces dessinees ===================== */

/**
 * Une piece, dessinee selon sa forme.
 *
 * Cinq silhouettes, et rien de plus : une meule, une pyramide tronquee, une
 * buche, un cylindre bas, un carre. Un fromager reconnait sa cave a ces cinq
 * profils, et aucune photographie generique ne dirait autant.
 */
function PieceDessinee({ forme, taille = 120 }: { readonly forme: Forme; readonly taille?: number }): ReactElement {
  const pate = accentDoux(200, 78)
  const croute = accent(700)
  const ombre = accentDoux(500, 60)
  const chemins: Readonly<Record<Forme, ReactElement>> = {
    meule: (
      <>
        <ellipse cx="60" cy="40" rx="46" ry="17" fill={pate} stroke={croute} strokeWidth="2.4" />
        <path d="M14 40v22c0 9 21 17 46 17s46-8 46-17V40" fill={ombre} stroke={croute} strokeWidth="2.4" />
        <ellipse cx="60" cy="40" rx="32" ry="11" fill="none" stroke={croute} strokeWidth="1.2" opacity="0.5" />
      </>
    ),
    pyramide: (
      <>
        <path d="M60 14 100 84H20Z" fill={pate} stroke={croute} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M44 42h32" stroke={croute} strokeWidth="1.6" opacity="0.6" />
        <path d="M20 84h80" stroke={croute} strokeWidth="2.4" />
      </>
    ),
    buche: (
      <>
        <rect x="16" y="34" width="88" height="34" rx="17" fill={pate} stroke={croute} strokeWidth="2.4" />
        <ellipse cx="16" cy="51" rx="7" ry="17" fill={ombre} stroke={croute} strokeWidth="2" />
        <path d="M40 38v26M64 38v26M88 38v26" stroke={croute} strokeWidth="1.2" opacity="0.45" />
      </>
    ),
    cylindre: (
      <>
        <ellipse cx="60" cy="38" rx="40" ry="14" fill={pate} stroke={croute} strokeWidth="2.4" />
        <path d="M20 38v26c0 8 18 14 40 14s40-6 40-14V38" fill={ombre} stroke={croute} strokeWidth="2.4" />
        {[34, 52, 70, 88].map((x) => (
          <circle key={x} cx={x} cy="36" r="2.4" fill={croute} opacity="0.55" />
        ))}
      </>
    ),
    carre: (
      <>
        <path d="M22 30h76v40l-12 12H22Z" fill={pate} stroke={croute} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M98 70 86 82" stroke={croute} strokeWidth="2.4" />
        {([
          [40, 46],
          [58, 58],
          [76, 44],
          [50, 70],
          [72, 68],
        ] as const).map(([x, y]) => (
          <path key={`${String(x)}-${String(y)}`} d={`M${String(x)} ${String(y)}l6 4M${String(x + 6)} ${String(y)}l-6 4`} stroke={croute} strokeWidth="1.6" opacity="0.7" />
        ))}
      </>
    ),
  }
  return (
    <svg viewBox="0 0 120 100" width={taille} height={(taille * 100) / 120} aria-hidden="true" fill="none">
      {chemins[forme]}
    </svg>
  )
}

/**
 * La meule entamee de l ouverture.
 *
 * C est l objet de la page : une meule dont une part a ete levee, de sorte
 * qu on voie a la fois la croute et la pate. Une meule entiere ne montre
 * qu un couvercle ; c est la coupe qui dit ce qu il y a dedans, et c est
 * exactement ce qu un affineur vend.
 */
function MeuleEntamee(): ReactElement {
  const pate = accentDoux(200, 74)
  const pateClaire = accentDoux(100, 46)
  const croute = accent(700)
  const flanc = accentDoux(500, 58)
  return (
    <svg viewBox="0 0 340 260" className="o-h-auto o-w-full" role="img" aria-label="Une meule entamee, une part levee, croute et pate visibles">
      {/* Le flanc et le dessus de la meule. */}
      <path d="M24 116v44c0 32 65 58 146 58s146-26 146-58v-44" fill={flanc} stroke={croute} strokeWidth="3" />
      <ellipse cx="170" cy="116" rx="146" ry="58" fill={pate} stroke={croute} strokeWidth="3" />
      {/* La part levee : la saignee dans le dessus. */}
      <path d="M170 116 96 78a146 58 0 0 1 74-20Z" fill="var(--o-theme-bg)" stroke={croute} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M170 116 96 78v36l74 38Z" fill={pateClaire} stroke={croute} strokeWidth="2" strokeLinejoin="round" />
      {/* La croute, au trait, sur le dessus. */}
      <ellipse cx="170" cy="116" rx="120" ry="46" fill="none" stroke={croute} strokeWidth="1.1" opacity="0.45" />
      <ellipse cx="170" cy="116" rx="92" ry="34" fill="none" stroke={croute} strokeWidth="1.1" opacity="0.3" />
      {/* Le grain de la croute sur le flanc. */}
      {Array.from({ length: 22 }, (_, rang) => {
        const x = 30 + rang * 13
        const h = 16 + ((rang * 7) % 13)
        return <path key={rang} d={`M${String(x)} ${String(150 + ((rang * 5) % 11))}v${String(h)}`} stroke={croute} strokeWidth="1" opacity="0.22" />
      })}
      {/* La part posee a cote, sur la planche. */}
      <g transform="translate(238 178) rotate(-8)">
        <path d="M0 0 66 34 20 52Z" fill={pateClaire} stroke={croute} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M0 0v14l20 52" fill="none" stroke={croute} strokeWidth="1.6" opacity="0.6" />
      </g>
    </svg>
  )
}

/* ============================ La coupe de la cave ====================== */

/**
 * La cave en coupe : trois etages, et les pieces posees ou elles sont.
 *
 * L abscisse d une piece sur son etage est son avancement **dans cet etage**,
 * pas dans l affinage entier : une piece qui vient d entrer en cave d attente
 * se pose a gauche de la planche, et elle glisse vers la droite au fil des
 * jours jusqu a la sortie.
 */
function Cave({
  aujourdhui,
  choisie,
  onChoisir,
}: {
  readonly aujourdhui: number
  readonly choisie: string
  readonly onChoisir: (cle: string) => void
}): ReactElement {
  const zone = useRef<HTMLDivElement>(null)
  return (
    <div ref={zone} className="o-relative o-overflow-hidden o-rounded-2xl" style={nuit('stone')}>
      <CursorHalo host={zone} dotSize={5} haloSize={90} speed={6} hoverScale={1.5} style={{ color: accent(300) }} />

      {/* Les murs de la cave : pierre dessinee. */}
      <svg aria-hidden="true" viewBox="0 0 600 400" preserveAspectRatio="none" className="o-pointer-events-none o-absolute o-inset-0 o-h-full o-w-full">
        {Array.from({ length: 16 }, (_, ligne) =>
          Array.from({ length: 10 }, (_, colonne) => (
            <rect
              key={`${String(ligne)}-${String(colonne)}`}
              x={colonne * 60 + (ligne % 2 === 0 ? 0 : -30)}
              y={ligne * 25}
              width="58"
              height="23"
              rx="3"
              fill="none"
              stroke={accent(400)}
              strokeWidth="0.7"
              opacity="0.14"
            />
          )),
        )}
        <path d="M0 0h600v70q-150 40-300 0T0 70Z" fill="var(--o-palette-stone-950)" opacity="0.55" />
      </svg>

      <ol className="o-relative o-m-0 o-list-none o-p-0">
        {ETAGES.map((etage, rang) => {
          const dessus = PIECES.filter((p) => etageDe(p, joursEnCave(p, aujourdhui)) === rang)
          return (
            <li key={etage.nom} className="o-relative o-border-b o-px-5 o-pb-3 o-pt-5 md:o-px-8" style={{ borderColor: 'var(--o-theme-line)' }}>
              <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                  {String(rang + 1).padStart(2, '0')} — {etage.nom}
                </p>
                <p className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                  <Icon icon={Thermometer} size={13} aria-hidden="true" />
                  {etage.temperature} · {etage.hygrometrie}
                </p>
              </div>
              <p className="o-m-0 o-mt-1 o-max-w-xl o-text-xs o-leading-relaxed o-text-stone-400">{etage.role}</p>

              {/* La planche de l etage, et ce qui est pose dessus. */}
              <div className="o-relative o-mt-4 o-h-24">
                <span aria-hidden="true" className="o-absolute o-inset-x-0 o-bottom-0 o-h-1.5 o-rounded-full" style={{ backgroundColor: accentDoux(700, 70) }} />
                {dessus.length === 0 ? (
                  <p className="o-m-0 o-pt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500">Planche vide aujourd hui</p>
                ) : (
                  dessus.map((p, index) => {
                    const jours = joursEnCave(p, aujourdhui)
                    const bas = rang === 0 ? 0 : p.paliers[rang - 1] ?? 0
                    const haut = rang === 2 ? p.duree : p.paliers[rang] ?? p.duree
                    const part = Math.min(1, Math.max(0, (jours - bas) / Math.max(1, haut - bas)))
                    return (
                      <button
                        key={p.cle}
                        type="button"
                        aria-pressed={p.cle === choisie}
                        onClick={() => {
                          onChoisir(p.cle)
                        }}
                        title={`${p.nom} — ${String(jours)} jours`}
                        className="o-absolute o-bottom-1.5 o-cursor-pointer o-rounded-lg o-bg-transparent o-p-1 o-transition-transform hover:o-scale-105 focus:o-ring"
                        style={{
                          left: `calc(6% + ${String(part * 78)}% + ${String(index * 2)}%)`,
                          transform: 'translateX(-50%)',
                          outline: p.cle === choisie ? `2px solid ${encreSurSombre()}` : undefined,
                          outlineOffset: 2,
                        }}
                      >
                        <PieceDessinee forme={p.forme} taille={74} />
                        <span className="o-sr-only">
                          {p.nom}, {String(jours)} jours de cave
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ============================ L echelle graduee (C15) ================== */

/**
 * L echelle verticale des jours, la valeur posee dessus.
 *
 * Graduee tous les trente jours, elle porte trois reperes : l entree au
 * haloir, le passage en cave d attente, et la sortie. Le curseur est le jour
 * ou la piece en est — et il monte tout seul d un cran par jour.
 */
function Echelle({ piece, jours }: { readonly piece: Piece; readonly jours: number }): ReactElement {
  const part = (valeur: number): number => Math.min(100, (valeur / piece.duree) * 100)
  const crans = Math.floor(piece.duree / 30)
  return (
    <div className="o-relative o-flex o-gap-5" style={{ height: 320 }}>
      <div className="o-relative o-w-16">
        <span aria-hidden="true" className="o-absolute o-bottom-0 o-top-0 o-w-0.5" style={{ left: 22, backgroundColor: 'var(--o-theme-line)' }} />
        {Array.from({ length: crans + 1 }, (_, rang) => rang * 30).map((valeur) => (
          <span
            key={valeur}
            aria-hidden="true"
            className="o-absolute o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-text-stone-500 dark:o-text-stone-400"
            style={{ bottom: `${String(part(valeur))}%`, left: 0, transform: 'translateY(50%)' }}
          >
            <span className="o-w-6 o-text-right o-tabular-nums">{valeur}</span>
            <span className="o-h-px o-w-3" style={{ backgroundColor: 'var(--o-theme-line)' }} />
          </span>
        ))}
      </div>

      <div className="o-relative o-flex-1">
        {/* Les trois zones de la duree, teintees. */}
        {(
          [
            [0, piece.paliers[0], 18],
            [piece.paliers[0], piece.paliers[1], 34],
            [piece.paliers[1], piece.duree, 52],
          ] as const
        ).map(([bas, haut, force]) => (
          <span
            key={bas}
            aria-hidden="true"
            className="o-absolute o-left-0 o-w-10 o-rounded-sm"
            style={{ bottom: `${String(part(bas))}%`, height: `${String(part(haut) - part(bas))}%`, backgroundColor: accentDoux(500, force) }}
          />
        ))}

        {/* La valeur, posee sur l echelle. */}
        <span
          className="o-absolute o-left-12 o-flex o-items-baseline o-gap-2 o-whitespace-nowrap"
          style={{ bottom: `${String(part(jours))}%`, transform: 'translateY(50%)' }}
        >
          <span aria-hidden="true" className="o-absolute o-h-0.5 o-w-14" style={{ left: -56, top: '50%', backgroundColor: encre() }} />
          <span className="o-tabular-nums" style={{ ...affiche('m', 400), fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: encre() }}>
            {jours}
          </span>
          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
            jours sur {piece.duree}
          </span>
        </span>
      </div>
    </div>
  )
}

/* ============================ Le panier flottant (A21) ================= */

/** Une ligne du panier. */
interface Ligne {
  readonly cle: string
  readonly nom: string
  /** Poids commande, en grammes. */
  readonly grammes: number
  readonly prix: number
}

/** La planche flottante, en bas a droite, qui recapitule ce qu on a pris. */
function Panier({ lignes, onRetirer }: { readonly lignes: readonly Ligne[]; readonly onRetirer: (cle: string) => void }): ReactElement | null {
  if (lignes.length === 0) return null
  const total = lignes.reduce((somme, l) => somme + (l.grammes / 1000) * l.prix, 0)
  return (
    <div className="o-fixed o-bottom-4 o-right-4 o-z-40 o-w-72 o-rounded-2xl o-border-w-1 o-p-4 o-shadow-xl" style={{ maxWidth: 'calc(100vw - 2rem)', borderColor: 'var(--o-theme-line)', backgroundColor: 'var(--o-theme-bg)' }}>
      <p className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
        <Icon icon={ShoppingBasket} size={14} aria-hidden="true" />
        La planche — {lignes.length} piece{lignes.length > 1 ? 's' : ''}
      </p>
      <ul className="o-m-0 o-mt-3 o-list-none o-p-0">
        {lignes.map((l) => (
          <li key={l.cle} className="o-flex o-items-baseline o-justify-between o-gap-2 o-border-b o-py-2 o-text-sm" style={{ borderColor: 'var(--o-theme-line)' }}>
            <span className="o-min-w-0 o-truncate o-text-stone-800 dark:o-text-stone-100">{l.nom}</span>
            <span className="o-flex o-shrink-0 o-items-baseline o-gap-2">
              <span className="o-font-mono o-text-xs o-text-stone-500 dark:o-text-stone-400">{poidsDit(l.grammes)}</span>
              <button
                type="button"
                onClick={() => {
                  onRetirer(l.cle)
                }}
                aria-label={`Retirer ${l.nom} de la planche`}
                className="o-cursor-pointer o-rounded-full o-bg-transparent o-px-1.5 o-text-xs o-text-stone-500 hover:o-text-stone-900 focus:o-ring dark:o-text-stone-400 dark:hover:o-text-stone-50"
              >
                ✕
              </button>
            </span>
          </li>
        ))}
      </ul>
      <p className="o-m-0 o-mt-3 o-flex o-items-baseline o-justify-between o-gap-2">
        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">Total</span>
        <span className="o-tabular-nums o-text-lg o-font-semibold" style={{ color: encre() }}>
          {euros(total)}
        </span>
      </p>
      <a href="#retirer" className="o-mt-3 o-flex o-w-full o-items-center o-justify-center o-rounded-full o-px-4 o-py-2 o-text-sm o-font-semibold o-no-underline focus:o-ring" style={aplat()}>
        Reserver la planche
      </a>
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('fraunces')
  const { reduced } = useMotionState()
  // La date est lue une fois : la cave ne bouge pas a la minute, elle bouge au
  // jour, et relire l horloge a chaque image ne changerait rien.
  const [aujourdhui] = useState(() => Date.now())

  const [choisie, setChoisie] = useState<string>(PIECES[0].cle)
  const piece = useMemo(() => PIECES.find((p) => p.cle === choisie) ?? PIECES[0], [choisie])
  const jours = joursEnCave(piece, aujourdhui)

  const [lignes, setLignes] = useState<readonly Ligne[]>([])
  const [annonces, setAnnonces] = useState<readonly ToastItem[]>([])

  const ajouter = (p: Piece): void => {
    const grammes = p.poids >= 1000 ? 250 : Math.round(p.poids / 2)
    setLignes((avant) => (avant.some((l) => l.cle === p.cle) ? avant : [...avant, { cle: p.cle, nom: p.nom, grammes, prix: p.prix }]))
    setAnnonces((avant) => [
      ...avant,
      {
        id: `${p.cle}-${String(avant.length)}`,
        title: `${p.nom} — ${poidsDit(grammes)}`,
        description: `Coupe a la demande, ${euros((grammes / 1000) * p.prix)}`,
        tone: 'succes',
      },
    ])
  }

  const retirer = (cle: string): void => {
    setLignes((avant) => avant.filter((l) => l.cle !== cle))
  }

  return (
    <Porte forme="lettres" marque="Hale" sombre={false}>
      <div className="o-relative o-overflow-hidden" style={{ ...polices, backgroundColor: accentDoux(300, 10) }}>
        {/*
          ----- L ouverture : creme, un nom en serif, une meule en coupe -------
        */}
        <section id="haut" className="o-relative o-flex o-flex-col" style={{ minHeight: ECRAN }}>
          <BarreCoins
            marque="Hale — affineur"
            liens={NAVIGATION}
            droite="Lyon, 2e"
            sombre={false}
          />

          <div className="o-mx-auto o-grid o-w-full o-max-w-7xl o-grow o-gap-10 o-px-6 o-pb-16 o-pt-8 md:o-grid-cols-12 md:o-items-center md:o-px-10">
            <div className="md:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>Six pieces en cave — cave sous la rue Vaubecour</Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-7 o-max-w-3xl o-text-stone-900 dark:o-text-stone-50"
                style={{ ...affiche('l', 300), fontSize: 'clamp(2.75rem, 8vw, 8rem)', letterSpacing: '-0.02em' }}
              >
                Nous donnons du temps au fromage.
              </TitreVague>
              <Surgit delai={560} as="p" className="o-m-0 o-mt-7 o-max-w-md o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                Nous ne le fabriquons pas : six fermes le font, et nous l affinons. Une cave de quarante metres carres sous la rue, trois etages, et un nombre de jours par piece — que vous pouvez voir.
              </Surgit>
              <Surgit delai={680} className="o-mt-9">
                <Actions
                  pleine={['#cave', <>Descendre a la cave <Icon icon={ArrowDown} size={16} aria-hidden="true" /></>]}
                  fantome={['#planche', 'Les six pieces']}
                  sombre={false}
                />
              </Surgit>
            </div>

            <div className="o-flex o-min-w-0 o-justify-center md:o-col-span-5">
              <div className="o-w-full" style={{ maxWidth: 420 }}>
                <MeuleEntamee />
              </div>
            </div>
          </div>

          <div className="o-hidden md:o-block">
            <Coin position="bd" sombre={false}>
              Mercredi au samedi 9 h — 19 h
              <br />
              Dimanche 9 h — 13 h
            </Coin>
          </div>
        </section>

        {/*
          ----- La bande de tirages, en rail (M-rail) ---------------------------
        */}
        <Rail
          ecrans={2.2}
          className="o-border-t"
          style={{ borderColor: 'var(--o-theme-line)' }}
          entete={
            <div id="planche" className="o-scroll-mt-24 o-px-6 o-pt-10 md:o-px-10">
              <Indice rang="01" sombre={false}>La planche</Indice>
              <h2 className="o-m-0 o-mt-4" style={{ ...affiche('m', 400), fontSize: 'clamp(1.75rem, 4vw, 3.25rem)' }}>
                <StrokeText
                  as="span"
                  strokeWidth={1.4}
                  duration={1200}
                  contour={accent(600)}
                  remplissage={encre()}
                >
                  SIX PIECES, SIX FERMES
                </StrokeText>
              </h2>
            </div>
          }
        >
          {PIECES.map((p) => {
            const j = joursEnCave(p, aujourdhui)
            return (
              <article key={p.cle} className="o-shrink-0 o-px-6" style={{ width: 'min(82vw, 25rem)' }}>
                <div className="o-flex o-h-full o-flex-col o-rounded-2xl o-border-w-1 o-p-6" style={{ borderColor: 'var(--o-theme-line)', backgroundColor: 'var(--o-theme-bg)' }}>
                  <div className="o-flex o-justify-center o-py-4">
                    <PieceDessinee forme={p.forme} taille={180} />
                  </div>
                  <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                    {String(j)} jours de cave — {ETAGES[etageDe(p, j)]?.nom}
                  </p>
                  <h3 className="o-m-0 o-mt-3 o-text-2xl o-tracking-tight o-text-stone-900 dark:o-text-stone-50">{p.nom}</h3>
                  <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    {p.lait} · {p.ferme}
                  </p>
                  <p className="o-m-0 o-mt-4 o-grow o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">{p.note}</p>
                  <p className="o-m-0 o-mt-5 o-flex o-items-baseline o-justify-between o-gap-3 o-border-t o-pt-4" style={{ borderColor: 'var(--o-theme-line)' }}>
                    <span className="o-tabular-nums o-text-lg o-font-semibold o-text-stone-900 dark:o-text-stone-50">{euros(p.prix)} / kg</span>
                    <button
                      type="button"
                      onClick={() => {
                        ajouter(p)
                      }}
                      className="o-cursor-pointer o-rounded-full o-px-4 o-py-2 o-text-sm o-font-semibold focus:o-ring"
                      style={aplat()}
                    >
                      Mettre sur la planche
                    </button>
                  </p>
                </div>
              </article>
            )
          })}
        </Rail>

        {/*
          ----- Le mecanisme : la cave en coupe --------------------------------
        */}
        <section id="cave" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <Indice rang="02" sombre={false}>La cave</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-2xl o-text-stone-900 dark:o-text-stone-50"
                  style={{ ...affiche('m', 400), fontSize: 'clamp(1.9rem, 4.4vw, 3.75rem)' }}
                >
                  Trois etages, quarante metres carres, et le temps qui passe.
                </h2>
              </div>
              <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300 md:o-col-span-5">
                La coupe est a jour : chaque piece est posee sur l etage ou elle se trouve aujourd hui, et elle glisse vers la droite de sa planche a mesure qu elle se fait. Cliquez une piece.
              </p>
            </div>

            <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-8">
                <Cave aujourdhui={aujourdhui} choisie={choisie} onChoisir={setChoisie} />
              </div>

              <div className="o-min-w-0 lg:o-col-span-4">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Ou elle en est
                </p>
                <h3 className="o-m-0 o-mt-3 o-text-3xl o-tracking-tight o-text-stone-900 dark:o-text-stone-50">{piece.nom}</h3>
                <div className="o-mt-8">
                  <Echelle piece={piece} jours={jours} />
                </div>
                <dl className="o-m-0 o-mt-10 o-border-t" style={{ borderColor: 'var(--o-theme-line)' }}>
                  {(
                    [
                      ['Ferme', piece.ferme],
                      ['Lait', piece.lait],
                      ['Etage', ETAGES[etageDe(piece, jours)]?.nom ?? ''],
                      ['Sortie du lot', `dans ${String(Math.max(0, piece.duree - jours))} jours, et le lot suivant entre le jour meme`],
                      ['Piece entiere', `${poidsDit(piece.poids)}, ${euros(piece.prix)} le kilo`],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div key={quoi} className="o-grid o-gap-x-6 o-gap-y-1 o-border-b o-py-3.5 sm:o-grid-cols-12" style={{ borderColor: 'var(--o-theme-line)' }}>
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400 sm:o-col-span-5">{quoi}</dt>
                      <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-800 dark:o-text-stone-200 sm:o-col-span-7">{valeur}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  onClick={() => {
                    ajouter(piece)
                  }}
                  className="o-mt-6 o-cursor-pointer o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold focus:o-ring"
                  style={aplat()}
                >
                  Mettre {piece.nom} sur la planche
                </button>
              </div>
            </div>
          </div>
        </section>

        {/*
          ----- La coupe sombre : un ecran de texte seul ------------------------
        */}
        <section className="o-flex o-items-center o-px-6 o-py-24 md:o-px-10 md:o-py-36" style={nuit('stone')}>
          <div className="o-mx-auto o-w-full o-max-w-7xl">
            <Manifeste eteint="Un fromage trop jeune se vend mieux : il est plus doux, il rassure, et il coute moins cher a garder.">
              Nous le gardons quand meme. Une cave qui tourne trop vite n est pas une cave, c est un entrepot avec de la pierre autour.
            </Manifeste>
          </div>
        </section>

        {/*
          ----- L appel : retirer la planche ------------------------------------
        */}
        <section id="retirer" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
          <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
            <div className="md:o-col-span-7">
              <Indice rang="03" sombre={false}>Retirer</Indice>
              <h2
                className="o-m-0 o-mt-5 o-max-w-2xl o-text-stone-900 dark:o-text-stone-50"
                style={{ ...affiche('m', 400), fontSize: 'clamp(1.9rem, 4.2vw, 3.5rem)' }}
              >
                {lignes.length === 0 ? 'Votre planche est vide.' : `Votre planche : ${String(lignes.length)} piece${lignes.length > 1 ? 's' : ''}.`}
              </h2>
              <p className="o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                {lignes.length === 0
                  ? 'Choisissez dans la planche ou dans la cave : ce que vous prenez se retrouve ici, coupe a la demande le jour du retrait.'
                  : 'Nous coupons le matin du retrait, jamais la veille. Dites-nous l heure, et laissez le fromage a temperature une heure avant de le servir.'}
              </p>
              <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                12 rue Vaubecour, Lyon 2e — 04 78 37 11 04
              </p>
            </div>

            <div className="o-min-w-0 md:o-col-span-5">
              <div className="o-rounded-2xl o-border-w-1 o-p-6" style={{ borderColor: 'var(--o-theme-line)', backgroundColor: 'var(--o-theme-bg)' }}>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Recapitulatif
                </p>
                {lignes.length === 0 ? (
                  <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-300">
                    Rien pour l instant.
                  </p>
                ) : (
                  <ul className="o-m-0 o-mt-4 o-list-none o-p-0">
                    {lignes.map((l) => (
                      <li key={l.cle} className="o-flex o-items-baseline o-justify-between o-gap-3 o-border-b o-py-3 o-text-sm" style={{ borderColor: 'var(--o-theme-line)' }}>
                        <span className="o-text-stone-800 dark:o-text-stone-100">{l.nom}</span>
                        <span className="o-font-mono o-text-xs o-tabular-nums o-text-stone-600 dark:o-text-stone-300">
                          {poidsDit(l.grammes)} — {euros((l.grammes / 1000) * l.prix)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <a
                  href="tel:+33478371104"
                  className="o-mt-6 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline focus:o-ring"
                  style={aplat()}
                >
                  Confirmer par telephone
                </a>
              </div>
            </div>
          </div>
        </section>

        {/*
          ----- Le pied : la plaque de caseine (P26) ----------------------------
        */}
        <footer className="o-px-6 o-py-16 md:o-px-10 md:o-py-20" style={{ backgroundColor: accentDoux(400, 16) }}>
          <div className="o-mx-auto o-grid o-max-w-5xl o-items-center o-gap-12 md:o-grid-cols-12">
            {/* La plaque : le petit disque de caseine colle sur chaque meule. */}
            <div className="o-flex o-justify-center md:o-col-span-4">
              <svg viewBox="0 0 220 220" className="o-h-auto o-w-full" style={{ maxWidth: 220 }} role="img" aria-label="Plaque de caseine de la maison Hale, atelier FR 69.383.001 CE">
                <circle cx="110" cy="110" r="104" fill="var(--o-theme-bg)" stroke={encre()} strokeWidth="2.5" />
                <circle cx="110" cy="110" r="92" fill="none" stroke={encre()} strokeWidth="1" opacity="0.5" />
                <path id="o-hale-cercle" d="M110 28a82 82 0 1 1 0 164 82 82 0 1 1 0-164" fill="none" />
                <text fontFamily="var(--o-font-mono)" fontSize="13" letterSpacing="3" fill={encre()}>
                  <textPath href="#o-hale-cercle" startOffset="6%">
                    AFFINE EN CAVE — LYON — FR 69.383.001 CE
                  </textPath>
                </text>
                <text x="110" y="104" textAnchor="middle" fontSize="34" fontFamily="var(--o-font-serif, serif)" fill={encre()}>
                  Hale
                </text>
                <text x="110" y="132" textAnchor="middle" fontSize="12" letterSpacing="4" fontFamily="var(--o-font-mono)" fill={encre()}>
                  DEPUIS 2009
                </text>
                <circle cx="110" cy="152" r="3" fill={encre()} />
              </svg>
            </div>

            <div className="md:o-col-span-8">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                Etiquette de la maison
              </p>
              <dl className="o-m-0 o-mt-5 o-border-t" style={{ borderColor: 'var(--o-theme-line)' }}>
                {(
                  [
                    ['Composition', 'Lait cru de vache, de chevre ou de brebis, sel, presure animale, ferments du lait'],
                    ['Origine', 'Savoie, Berry, Puy-de-Dome, Doubs — six fermes, aucune laiterie industrielle'],
                    ['Affinage', 'Cave sous voute, 8 a 14 degres, 80 a 95 pour cent d hygrometrie'],
                    ['Lot', 'Un lot par ferme et par collecte — le numero est sur le papier de coupe'],
                    ['Conservation', 'Entre 4 et 8 degres, dans son papier ; sorti une heure avant d etre servi'],
                    ['Etablissement', 'Hale SARL, 12 rue Vaubecour, 69002 Lyon — agrement FR 69.383.001 CE'],
                  ] as const
                ).map(([terme, valeur]) => (
                  <div key={terme} className="o-grid o-gap-x-6 o-gap-y-1 o-border-b o-py-3.5 sm:o-grid-cols-12" style={{ borderColor: 'var(--o-theme-line)' }}>
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300 sm:o-col-span-4">{terme}</dt>
                    <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-800 dark:o-text-stone-100 sm:o-col-span-8">{valeur}</dd>
                  </div>
                ))}
              </dl>
              <p className="o-m-0 o-mt-6 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                <span>© 2026 Hale SARL</span>
                <a href="#haut" className="o-text-stone-600 o-no-underline hover:o-text-stone-900 focus:o-ring dark:o-text-stone-300 dark:hover:o-text-stone-50">
                  Remonter ↑
                </a>
              </p>
            </div>
          </div>
        </footer>

        <Panier lignes={lignes} onRetirer={retirer} />
        <ToastStack
          toasts={annonces}
          label="Ce que le fromager repete"
          duration={reduced ? 8000 : 4200}
          onDismiss={(id) => {
            setAnnonces((avant) => avant.filter((a) => a.id !== id))
          }}
        />
      </div>
    </Porte>
  )
}
