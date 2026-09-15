/**
 * Alene — cordonnerie, rue Oberkampf, Paris 11.
 *
 * ## La reference : Fuel
 *
 * Les indices en cent vingt pixels a gauche, les croix aux coins des cadres,
 * une ambre chaude sur un fond de cuir, et du mono partout ailleurs. Un
 * cordonnier travaille au gabarit et a la cote : la page aussi.
 *
 * ## Le mecanisme : le devis de ressemelage
 *
 * Une semelle dessinee, vue de dessous, **en vraie cote**. On y designe les
 * zones usees — le bout, l avant-pied, le cambrion, le talon, le bonbout, la
 * couture de trepointe — et le devis se compose selon les regles de l atelier,
 * pas selon une addition naive :
 *
 * - le bout, l avant-pied et le cambrion coches ensemble ne font pas trois
 *   lignes mais **un ressemelage complet**, moins cher que leur somme ;
 * - le bonbout est **compris** dans un talon neuf : on ne le facture pas deux
 *   fois ;
 * - la couture de trepointe ajoute trois jours d atelier, parce qu elle se
 *   fait a la main et qu elle seche.
 *
 * Le devis (A26) reprend ce total et le fait varier sur trois curseurs — le
 * nombre de paires, l epaisseur du cuir, le delai — et le montant tombe en
 * cent vingt pixels.
 *
 * ## Ce que la page ne charge pas
 *
 * Aucune photographie : nous n avons aucune image de chaussure, et une
 * chaussure de banque d images n est la chaussure de personne. Le plan de
 * semelle, la coupe du talon, l alene du pied et le grain du cuir sont des
 * chemins SVG.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type ReactElement } from 'react'

import { PixelTransition } from '@/odoro/effect/PixelTransition.jsx'
import { RippleClick } from '@/odoro/effect/RippleClick.jsx'
import { HandWritten } from '@/odoro/text/HandWritten.jsx'
import { ScrollFloat } from '@/odoro/text/ScrollFloat.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreCoins,
  CHROME,
  Croix,
  Etiquette,
  Indice,
  Numerotee,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Chapitre } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#atelier', 'L atelier'],
  ['#diagnostic', 'Le diagnostic'],
  ['#devis', 'Le devis'],
]

/* ============================ La semelle =============================== */

/**
 * Une zone d usure de la semelle.
 *
 * `haut` et `bas` sont donnes en pourcentage de la hauteur du plan : les
 * boutons de la figure sont poses dessus, et la bande coloriee du dessin lit
 * les memes valeurs. Une seule source pour le dessin et pour la commande.
 */
interface Zone {
  readonly id: string
  readonly nom: string
  readonly haut: number
  readonly bas: number
  /** Prix de la reparation seule, en euros. */
  readonly prix: number
  /** Cote portee sur le plan. */
  readonly cote: string
  readonly note: string
}

const ZONES: readonly Zone[] = [
  {
    id: 'bout',
    nom: 'Le bout',
    haut: 0,
    bas: 19,
    prix: 18,
    cote: 'ep. 4,5 mm',
    note: 'Un patin de bout, colle et affleure : c est ce qui part en premier quand on marche vite.',
  },
  {
    id: 'avant',
    nom: 'L avant-pied',
    haut: 19,
    bas: 44,
    prix: 48,
    cote: 'l. 98 mm',
    note: 'La demi-semelle. On decolle, on degauchit, on recolle sous presse pendant douze heures.',
  },
  {
    id: 'cambrure',
    nom: 'Le cambrion',
    haut: 44,
    bas: 65,
    prix: 30,
    cote: 'l. 62 mm',
    note: 'La partie creuse, qui ne touche pas le sol. Elle se renforce, elle ne se remplace pas.',
  },
  {
    id: 'talon',
    nom: 'Le talon',
    haut: 65,
    bas: 88,
    prix: 45,
    cote: 'h. 28 mm',
    note: 'Le bloc entier, en cuir empile ou en gomme. Le bonbout neuf est compris.',
  },
  {
    id: 'bonbout',
    nom: 'Le bonbout',
    haut: 88,
    bas: 100,
    prix: 22,
    cote: 'ep. 7 mm',
    note: 'Le patin sous le talon. Quinze minutes a l etabli, et on vous attend.',
  },
]

/** La couture de trepointe : elle ne vit pas sur une bande, mais sur le pourtour. */
const COUTURE = {
  nom: 'La couture de trepointe',
  prix: 65,
  jours: 3,
  note: 'Cousue main au point sellier, puis laissee secher. C est ce qui rend la chaussure ressemelable a vie.',
}

/** Le plan de semelle, vu de dessous, dans un repere de 200 sur 520. */
const SEMELLE =
  'M100 12 C138 12 162 46 164 94 C166 142 150 178 146 216 C142 254 150 284 152 318 C154 354 146 390 138 422 C130 454 132 476 128 494 C122 514 78 514 72 494 C68 476 70 454 62 422 C54 390 46 354 48 318 C50 284 58 254 54 216 C50 178 34 142 36 94 C38 46 62 12 100 12 Z'

/* ============================ Les trois metiers ======================== */

/** Ce que l atelier fait, en trois lignes numerotees — la forme de Fuel. */
const METIERS = [
  {
    titre: 'Le ressemelage',
    texte:
      'Une paire cousue se ressemelle trois a cinq fois. La tige dure trente ans ; la semelle, deux hivers. Nous ne vendons pas de chaussures, nous prolongeons les votres.',
  },
  {
    titre: 'La reparation de sac',
    texte:
      'Anses refaites, doublures changees, fermetures remplacees au metre. Un sac se repare comme une chaussure : par la couture, pas par la colle.',
  },
  {
    titre: 'La cle et le cuir',
    texte:
      'Ceintures percees a la bonne longueur, bracelets de montre poses, cles reproduites. Ce qui se fait en cinq minutes se fait devant vous.',
  },
] as const

/* ============================ L atelier, en chapitres ================== */

/** Une etape du ressemelage, avec ce qu elle coute en temps. */
const ETAPES: readonly (readonly [string, string, string])[] = [
  [
    '01',
    'Decoller',
    'La vieille semelle part a la pince et au couteau a parer. On garde la trepointe : c est elle qui tient tout.',
  ],
  [
    '02',
    'Degauchir',
    'La premiere est mise a plat au rape, puis rechargee au liege fondu la ou le pied a creuse.',
  ],
  [
    '03',
    'Coller',
    'Colle de contact des deux cotes, dix minutes de repos, puis douze heures sous presse. Rien ne remplace le temps.',
  ],
  [
    '04',
    'Coudre',
    'Point sellier a l alene et au fil poisse, seize points au pouce. C est ici que la paire redevient ressemelable.',
  ],
  [
    '05',
    'Finir',
    'Tranche paree au fer chaud, teinte a la main, cirage. La chaussure ressort plus nette qu a l achat.',
  ],
]

/* ============================ Le grain du cuir ========================= */

/**
 * Le grain du cuir, en SVG.
 *
 * Une trame de pores et deux plis marques suffisent : une photographie de cuir
 * couterait deux cents kilo-octets pour la meme impression, et se verrait comme
 * une image de fond.
 */
function Cuir(): ReactElement {
  const pores = useMemo(() => {
    // Semis deterministe, dans un pave de quatre-vingt-dix pixels que le motif
    // repete : une tache unique etiree sur la largeur de l ecran donnerait des
    // traits, pas des pores.
    const points: { x: number; y: number; r: number }[] = []
    let graine = 7
    const tirer = (): number => {
      graine = (graine * 1103515245 + 12345) % 2147483648
      return graine / 2147483648
    }
    for (let rang = 0; rang < 72; rang += 1) {
      points.push({ x: tirer() * 90, y: tirer() * 90, r: 0.5 + tirer() * 0.9 })
    }
    return points
  }, [])
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-0 o-overflow-hidden"
    >
      <svg className="o-size-full">
        <defs>
          <pattern id="o-cd-grain" width="90" height="90" patternUnits="userSpaceOnUse">
            <g fill={accentDoux(900, 22)}>
              {pores.map((p, rang) => (
                <circle key={rang} cx={p.x} cy={p.y} r={p.r} />
              ))}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#o-cd-grain)" />
        {/* Les deux plis du cuir, la ou le pied casse la peau. */}
        <g fill="none" stroke={accentDoux(900, 14)} strokeWidth="1.5">
          <path d="M-40 180 C240 140 520 240 760 190 C960 148 1180 210 1500 170" />
          <path d="M-40 560 C200 520 420 620 700 570 C920 530 1160 600 1500 550" />
        </g>
      </svg>
    </div>
  )
}

/* ============================ Le diagnostic ============================ */

/** Une ligne du devis, telle que l atelier l ecrit. */
interface Ligne {
  readonly quoi: string
  readonly prix: number
}

/**
 * Le devis, compose selon les regles de l atelier.
 *
 * Trois regles, et elles comptent : le ressemelage complet remplace ses trois
 * morceaux et coute moins cher que leur somme ; le bonbout est compris dans un
 * talon neuf ; la couture ajoute des jours, pas seulement des euros.
 */
function composer(
  choisies: ReadonlySet<string>,
  couture: boolean,
): { lignes: readonly Ligne[]; total: number; jours: number } {
  const lignes: Ligne[] = []
  const complet =
    choisies.has('bout') && choisies.has('avant') && choisies.has('cambrure')

  if (complet) {
    lignes.push({ quoi: 'Ressemelage complet, cuir cousu', prix: 95 })
  } else {
    for (const zone of ZONES) {
      if (zone.id === 'talon' || zone.id === 'bonbout') continue
      if (choisies.has(zone.id)) lignes.push({ quoi: zone.nom, prix: zone.prix })
    }
  }

  if (choisies.has('talon')) {
    lignes.push({ quoi: 'Talon neuf, bonbout compris', prix: 45 })
  } else if (choisies.has('bonbout')) {
    lignes.push({ quoi: 'Bonbout seul', prix: 22 })
  }

  if (couture) lignes.push({ quoi: COUTURE.nom, prix: COUTURE.prix })

  const total = lignes.reduce((somme, ligne) => somme + ligne.prix, 0)
  const jours = total === 0 ? 0 : 5 + (couture ? COUTURE.jours : 0) + (complet ? 2 : 0)
  return { lignes, total, jours }
}

/** Le plan de semelle, cote, avec les zones designees. */
function Plan({
  choisies,
  basculer,
}: {
  readonly choisies: ReadonlySet<string>
  readonly basculer: (id: string) => void
}): ReactElement {
  return (
    <div className="o-relative o-mx-auto" style={{ maxWidth: 300 }}>
      <svg viewBox="0 0 200 520" className="o-h-auto o-w-full" aria-hidden="true">
        <defs>
          <clipPath id="o-cd-semelle">
            <path d={SEMELLE} />
          </clipPath>
          <pattern
            id="o-cd-usure"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(38)"
          >
            <path d="M0 0v6" stroke={accent(500)} strokeWidth="2" />
          </pattern>
        </defs>

        {/* Le corps de la semelle. */}
        <path
          d={SEMELLE}
          fill={accentDoux(300, 16)}
          stroke={accentDoux(900, 50)}
          strokeWidth="1.6"
        />

        {/* Les bandes usees, hachurees, decoupees a la semelle. */}
        <g clipPath="url(#o-cd-semelle)">
          {ZONES.map((zone) =>
            choisies.has(zone.id) ? (
              <rect
                key={zone.id}
                x="0"
                y={(zone.haut / 100) * 520}
                width="200"
                height={((zone.bas - zone.haut) / 100) * 520}
                fill="url(#o-cd-usure)"
                opacity="0.55"
              />
            ) : null,
          )}
        </g>

        {/* Les limites de zones, en trait fin. */}
        <g
          clipPath="url(#o-cd-semelle)"
          stroke={accentDoux(900, 30)}
          strokeWidth="0.8"
          strokeDasharray="4 4"
        >
          {ZONES.slice(1).map((zone) => (
            <path key={zone.id} d={`M0 ${String((zone.haut / 100) * 520)}h200`} />
          ))}
        </g>

        {/* La couture de trepointe : le pourtour, en points. */}
        <path
          d={SEMELLE}
          fill="none"
          stroke={accentDoux(900, 45)}
          strokeWidth="1"
          strokeDasharray="3 5"
          transform="translate(100 260) scale(0.9) translate(-100 -260)"
        />

        {/* Les cotes du plan : c est un plan, il porte ses mesures. */}
        <g stroke={accentDoux(900, 34)} strokeWidth="0.7">
          <path d="M16 12v500M12 12h8M12 512h8" />
          <path d="M36 528h128M36 522v12M164 522v12" />
        </g>
        <text
          x="10"
          y="268"
          fontSize="11"
          textAnchor="middle"
          transform="rotate(-90 10 268)"
          fill="currentColor"
          style={{
            color: 'var(--o-theme-muted)',
            fontFamily: 'var(--o-font-mono)',
            letterSpacing: '0.1em',
          }}
        >
          295 MM
        </text>
        <text
          x="100"
          y="546"
          fontSize="11"
          textAnchor="middle"
          fill="currentColor"
          style={{
            color: 'var(--o-theme-muted)',
            fontFamily: 'var(--o-font-mono)',
            letterSpacing: '0.1em',
          }}
        >
          98 MM
        </text>
      </svg>

      {/*
        Les zones sont des boutons poses sur le plan, aux memes pourcentages que
        les bandes du dessin : le dessin montre, le bouton commande, et les deux
        lisent la meme table.
      */}
      {ZONES.map((zone) => {
        const prise = choisies.has(zone.id)
        return (
          <RippleClick
            key={zone.id}
            color={accent(500)}
            opacity={0.3}
            // `RippleClick` pose `position: relative` en style en ligne : une
            // classe ne peut pas le reprendre, la position se redit donc ici.
            style={{
              position: 'absolute',
              insetInline: 0,
              top: `${String(zone.haut)}%`,
              height: `${String(zone.bas - zone.haut)}%`,
            }}
          >
            <button
              type="button"
              onClick={() => {
                basculer(zone.id)
              }}
              aria-pressed={prise}
              className="o-flex o-size-full o-cursor-pointer o-appearance-none o-items-center o-justify-end o-border-none o-bg-transparent o-px-1 focus:o-ring"
            >
              <span className="o-sr-only">
                {zone.nom} — {zone.prix} euros
              </span>
              {/* Les chiffres sont poses sur le plan, a cote de leur zone : le
                  prix de la reparation, et la cote de l endroit. */}
              <span
                aria-hidden="true"
                className="o-block o-text-right o-transition-opacity"
                style={{ opacity: prise ? 1 : 0.7 }}
              >
                <span
                  className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: prise ? encre() : 'var(--o-theme-fg)' }}
                >
                  {zone.nom.replace('Le ', '').replace('La ', '').replace('L ', '')} ·{' '}
                  {zone.prix} EUR
                </span>
                <span
                  className="o-block o-font-mono o-text-xs o-tracking-widest"
                  style={{ color: 'var(--o-theme-muted)' }}
                >
                  {zone.cote}
                </span>
              </span>
            </button>
          </RippleClick>
        )
      })}
    </div>
  )
}

/* ============================ L avant et l apres ======================= */

/** Une semelle dessinee : usee, ou neuve. */
function Coupe({ usee }: { readonly usee: boolean }): ReactElement {
  return (
    <svg
      viewBox="0 0 320 120"
      className="o-h-auto o-w-full"
      role="img"
      aria-label={
        usee
          ? 'Coupe de la semelle usee : le talon est mange et la tranche s effrite'
          : 'Coupe de la semelle neuve : le cuir est plein et la tranche est droite'
      }
    >
      {/* La tige, toujours la meme : c est ce qui dure. */}
      <path
        d="M30 62 C60 26 132 14 186 22 C228 28 250 42 258 62"
        fill="none"
        stroke={accentDoux(900, 55)}
        strokeWidth="2"
      />
      <path
        d="M30 62h228"
        stroke={accentDoux(900, 40)}
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      {usee ? (
        <>
          {/* La semelle mangee, la tranche irreguliere, le talon ecrase. */}
          <path
            d="M30 62 L258 62 L256 78 C232 82 214 74 186 80 C150 88 96 78 60 86 L34 84 Z"
            fill={accentDoux(500, 22)}
            stroke={accentDoux(900, 45)}
            strokeWidth="1.4"
          />
          <path
            d="M200 80 L256 78 L252 104 C238 110 214 108 206 100 Z"
            fill={accentDoux(500, 30)}
            stroke={accentDoux(900, 45)}
            strokeWidth="1.4"
          />
          <path
            d="M206 100 C218 96 236 100 250 96"
            stroke={accent(500)}
            strokeWidth="2.5"
            strokeDasharray="5 4"
            fill="none"
          />
          <text
            x="30"
            y="112"
            fontSize="8"
            fill="currentColor"
            style={{
              color: 'var(--o-theme-muted)',
              fontFamily: 'var(--o-font-mono)',
              letterSpacing: '0.12em',
            }}
          >
            AVANT — 4 ANS, 1 800 KM
          </text>
        </>
      ) : (
        <>
          <path
            d="M30 62 L258 62 L258 80 L30 80 Z"
            fill={accentDoux(500, 26)}
            stroke={accentDoux(900, 50)}
            strokeWidth="1.4"
          />
          <path
            d="M200 80 L258 80 L258 106 L200 106 Z"
            fill={accentDoux(500, 34)}
            stroke={accentDoux(900, 50)}
            strokeWidth="1.4"
          />
          <path d="M200 106h58" stroke={accent(500)} strokeWidth="3" />
          <path
            d="M36 71h216"
            stroke={accentDoux(900, 40)}
            strokeWidth="0.8"
            strokeDasharray="3 4"
          />
          <text
            x="30"
            y="118"
            fontSize="8"
            fill="currentColor"
            style={{
              color: 'var(--o-theme-muted)',
              fontFamily: 'var(--o-font-mono)',
              letterSpacing: '0.12em',
            }}
          >
            APRES — CUIR 4,5 MM, BONBOUT NEUF
          </text>
        </>
      )}
    </svg>
  )
}

/* ============================ Le devis (A26) =========================== */

/** Les trois curseurs, et le total en cent vingt pixels. */
function Devis({
  base,
  jours,
}: {
  readonly base: number
  readonly jours: number
}): ReactElement {
  const [paires, setPaires] = useState(1)
  const [epaisseur, setEpaisseur] = useState(4.5)
  const [delai, setDelai] = useState(8)

  const calcul = useMemo(() => {
    // La remise de quantite : elle s arrete a quinze pour cent, parce que le
    // temps de l etabli, lui, ne diminue pas au-dela.
    const remise = paires <= 1 ? 0 : Math.min(0.15, 0.05 * (paires - 1))
    // Le cuir : un demi-millimetre de plus, c est un quart de peau de plus.
    const facteurCuir = 0.9 + (epaisseur - 3) * 0.12
    // Le delai : l express paie l atelier qui s arrete ; le long lui rend service.
    const facteurDelai = delai < 8 ? 1 + (8 - delai) * 0.06 : delai > 15 ? 0.92 : 1
    const unitaire = base * facteurCuir * facteurDelai
    const total = unitaire * paires * (1 - remise)
    return { remise, facteurCuir, facteurDelai, unitaire, total }
  }, [base, paires, epaisseur, delai])

  const curseurs = [
    {
      nom: 'Nombre de paires',
      valeur: paires,
      min: 1,
      max: 6,
      pas: 1,
      poser: setPaires,
      lecture: `${String(paires)} paire${paires > 1 ? 's' : ''}`,
      note:
        calcul.remise > 0
          ? `Remise d atelier : ${String(Math.round(calcul.remise * 100))} %`
          : 'A partir de deux paires, la remise commence.',
    },
    {
      nom: 'Epaisseur du cuir',
      valeur: epaisseur,
      min: 3,
      max: 6,
      pas: 0.5,
      poser: setEpaisseur,
      lecture: `${epaisseur.toFixed(1).replace('.', ',')} mm`,
      note:
        epaisseur >= 5.5
          ? 'Semelle de marche : lourde, et increvable.'
          : epaisseur <= 3.5
            ? 'Semelle de ville : souple, elle s use plus vite.'
            : 'Le standard de la maison.',
    },
    {
      nom: 'Delai souhaite',
      valeur: delai,
      min: 2,
      max: 25,
      pas: 1,
      poser: setDelai,
      lecture: `${String(delai)} jours`,
      note:
        delai < 8
          ? 'Express : on decale une autre paire, et cela se paie.'
          : delai > 15
            ? 'Atelier calme : on vous rend huit pour cent.'
            : 'Le delai courant de l atelier.',
    },
  ] as const

  return (
    <div className="o-grid o-gap-12 lg:o-grid-cols-12">
      <div className="lg:o-col-span-6">
        {curseurs.map((curseur) => (
          <div
            key={curseur.nom}
            className="o-border-b o-border-black-10 dark:o-border-zinc-800 o-py-6"
          >
            <label className="o-block">
              <span className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
                <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                  {curseur.nom}
                </span>
                <span className="o-font-mono o-text-sm o-tabular-nums o-text-stone-950 dark:o-text-stone-50">
                  {curseur.lecture}
                </span>
              </span>
              <input
                type="range"
                min={curseur.min}
                max={curseur.max}
                step={curseur.pas}
                value={curseur.valeur}
                onChange={(evenement) => {
                  curseur.poser(Number(evenement.target.value))
                }}
                className="o-mt-4 o-w-full o-accent-brand-500 focus:o-ring"
              />
            </label>
            <p className="o-m-0 o-mt-3 o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
              {curseur.note}
            </p>
          </div>
        ))}
      </div>

      <div className="lg:o-col-span-6">
        <div className="o-relative o-p-8 md:o-p-10" style={nuit('stone')}>
          <Croix />
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
            {base === 0
              ? 'Rien de coche sur le plan'
              : `Devis pour ${String(paires)} paire${paires > 1 ? 's' : ''}`}
          </p>
          <p
            className="o-m-0 o-mt-4 o-tabular-nums o-text-stone-50"
            aria-live="polite"
            style={{
              ...affiche('xl', 300),
              fontSize: 'clamp(3.5rem, 11vw, 8rem)',
              lineHeight: 0.82,
              letterSpacing: '-0.05em',
            }}
          >
            {Math.round(calcul.total)}
            <span className="o-align-top o-text-2xl o-tracking-normal"> EUR</span>
          </p>
          <dl className="o-m-0 o-mt-10">
            {(
              [
                ['La paire', `${Math.round(calcul.unitaire)} EUR`],
                ['Cuir', `x ${calcul.facteurCuir.toFixed(2).replace('.', ',')}`],
                ['Delai', `x ${calcul.facteurDelai.toFixed(2).replace('.', ',')}`],
                [
                  'Remise',
                  calcul.remise > 0
                    ? `- ${String(Math.round(calcul.remise * 100))} %`
                    : 'aucune',
                ],
                ['A l atelier', `${String(Math.max(jours, delai))} jours`],
              ] as const
            ).map(([quoi, valeur]) => (
              <div
                key={quoi}
                className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-white-10 o-py-3"
              >
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                  {quoi}
                </dt>
                <dd
                  className="o-m-0 o-font-mono o-text-sm o-tabular-nums"
                  style={{ color: encreSurSombre() }}
                >
                  {valeur}
                </dd>
              </div>
            ))}
          </dl>
          <p className="o-m-0 o-mt-8 o-text-xs o-leading-relaxed o-text-stone-400">
            Devis ferme si la paire est cousue et la tige saine. Si le cuir a casse au
            pli, nous vous appelons avant de toucher a quoi que ce soit.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('jakarta')
  const { reduced } = useMotionState()
  const [choisies, setChoisies] = useState<ReadonlySet<string>>(
    () => new Set(['bonbout', 'talon']),
  )
  const [couture, setCouture] = useState(false)

  const basculer = (id: string): void => {
    setChoisies((avant) => {
      const suite = new Set(avant)
      if (suite.has(id)) suite.delete(id)
      else suite.add(id)
      return suite
    })
  }

  const devis = useMemo(() => composer(choisies, couture), [choisies, couture])

  const usure = <Coupe usee />
  const neuve = <Coupe usee={false} />

  return (
    <Porte forme="lettres" marque="Alene" sombre={false}>
      <div
        className="o-bg-stone-100 dark:o-bg-stone-950 o-text-stone-900 dark:o-text-stone-50"
        style={polices}
      >
        {/* ================= L ouverture : le cuir ======================== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: ECRAN }}
        >
          <Cuir />
          <Croix sombre={false} />
          <BarreCoins
            marque="Alene"
            liens={NAVIGATION}
            droite="Cordonnerie — Paris 11"
            sombre={false}
          />

          <div className="o-relative o-flex o-grow o-flex-col o-justify-end o-gap-10 o-px-6 o-pb-12 md:o-px-10">
            <div className="o-grid o-items-end o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-7">
                <Surgit>
                  <Etiquette sombre={false}>
                    Cordonnier — a l etabli depuis 1978
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-8 o-uppercase o-text-stone-950 dark:o-text-stone-50"
                  style={{
                    ...affiche('xl', 800),
                    fontSize: 'clamp(3.5rem, 15vw, 14rem)',
                    lineHeight: 0.8,
                    letterSpacing: '-0.05em',
                  }}
                >
                  Alene
                </TitreVague>
                <Surgit
                  delai={520}
                  as="p"
                  className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400"
                >
                  Une paire cousue se ressemelle quatre fois. Posez la votre sur le plan,
                  montrez-nous ou elle est morte, et le devis se compose sous vos yeux.
                </Surgit>
                <Surgit delai={640} className="o-mt-10 o-flex o-flex-wrap o-gap-4">
                  <a
                    href="#diagnostic"
                    className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                    style={aplat()}
                  >
                    Designer l usure{' '}
                    <Icon icon={ArrowRight} size={14} aria-hidden="true" />
                  </a>
                  <a
                    href="#atelier"
                    className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${accentDoux(900, 34)}`,
                      color: 'inherit',
                    }}
                  >
                    Voir l atelier
                  </a>
                </Surgit>
              </div>

              {/* L alene, l outil qui donne son nom a la maison. */}
              <Surgit delai={340} className="lg:o-col-span-5 lg:o-justify-self-end">
                <svg
                  viewBox="0 0 280 120"
                  className="o-w-full"
                  style={{ maxWidth: 360 }}
                  role="img"
                  aria-label="Une alene de cordonnier : manche en buis, tige en acier, pointe en losange"
                >
                  <path
                    d="M18 60 C18 42 34 34 56 34 H96 C104 34 108 42 108 60 C108 78 104 86 96 86 H56 C34 86 18 78 18 60 Z"
                    fill={accentDoux(700, 34)}
                    stroke={accentDoux(900, 55)}
                    strokeWidth="1.4"
                  />
                  <path
                    d="M34 44c10 4 10 28 0 32M52 40c12 6 12 34 0 40M72 38c14 8 14 38 0 46"
                    fill="none"
                    stroke={accentDoux(900, 28)}
                    strokeWidth="1"
                  />
                  <path
                    d="M108 54h118l40 6-40 6H108z"
                    fill={accentDoux(400, 40)}
                    stroke={accentDoux(900, 50)}
                    strokeWidth="1.2"
                  />
                  <path d="M226 60h40" stroke={accent(500)} strokeWidth="2" />
                  <g stroke={accentDoux(900, 30)} strokeWidth="0.7">
                    <path d="M18 100h248M18 94v12M266 94v12" />
                  </g>
                  <text
                    x="142"
                    y="118"
                    fontSize="10"
                    textAnchor="middle"
                    fill="currentColor"
                    style={{
                      color: 'var(--o-theme-muted)',
                      fontFamily: 'var(--o-font-mono)',
                      letterSpacing: '0.14em',
                    }}
                  >
                    ALENE DROITE — 178 MM
                  </text>
                </svg>
                <p className="o-m-0 o-mt-5 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400 lg:o-text-right">
                  32 rue Oberkampf, Paris 11
                  <br />
                  Mardi au samedi, 9 h — 19 h
                </p>
              </Surgit>
            </div>
          </div>
        </header>

        {/* ================= Les trois metiers, en 01/02/03 =============== */}
        <section
          id="atelier"
          className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-stone-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01" sombre={false}>
                L atelier
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <ScrollFloat
                as="h2"
                lift={22}
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-stone-950 dark:o-text-stone-50"
                style={{
                  ...affiche('m', 800),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Trois metiers, un seul etabli.
              </ScrollFloat>
            </Reveal>
            <div className="o-mt-14">
              <Numerotee
                sombre={false}
                lignes={METIERS.map((metier) => ({
                  titre: metier.titre,
                  texte: metier.texte,
                }))}
              />
            </div>
          </div>
        </section>

        {/* ================= Le mecanisme : le diagnostic ================= */}
        <section
          id="diagnostic"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={{ backgroundColor: accentDoux(300, 10) }}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Chapitre
              indice="(02) — Le diagnostic"
              largeur={4}
              titre={
                <h2
                  className="o-m-0 o-uppercase o-text-stone-950 dark:o-text-stone-50"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.6rem, 3.2vw, 2.75rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Montrez-nous ou elle est morte.
                </h2>
              }
              texte={
                <>
                  Le plan est a l echelle d une pointure 42. Cliquez les zones usees : le
                  devis se compose selon les regles de l atelier, et pas par une addition
                  naive.
                </>
              }
            >
              <div className="o-grid o-gap-10 md:o-grid-cols-2">
                <Plan choisies={choisies} basculer={basculer} />

                <div>
                  {/* La couture, qui n est pas une bande du plan. */}
                  <button
                    type="button"
                    onClick={() => {
                      setCouture((avant) => !avant)
                    }}
                    aria-pressed={couture}
                    className={`o-flex o-w-full o-cursor-pointer o-appearance-none o-items-baseline o-justify-between o-gap-4 o-border-none o-px-5 o-py-4 o-text-left o-transition-colors focus:o-ring ${
                      couture ? '' : 'o-bg-stone-100 dark:o-bg-stone-950'
                    }`}
                    style={
                      couture
                        ? aplat()
                        : { boxShadow: `inset 0 0 0 1px ${accentDoux(900, 26)}` }
                    }
                  >
                    <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest">
                      {COUTURE.nom}
                    </span>
                    <span className="o-font-mono o-text-xs o-tabular-nums">
                      {COUTURE.prix} EUR
                    </span>
                  </button>
                  <p className="o-m-0 o-mt-3 o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
                    {COUTURE.note}
                  </p>

                  {/* Le devis de l atelier, ligne a ligne. */}
                  <div
                    className="o-relative o-mt-8 o-p-6"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${accentDoux(900, 26)}`,
                      backgroundColor: 'var(--o-theme-bg)',
                    }}
                  >
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                      Le devis
                    </p>
                    {devis.lignes.length === 0 ? (
                      <p className="o-m-0 o-mt-5 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                        Rien de coche. Une paire qu on n a pas besoin de reparer est une
                        bonne nouvelle : gardez votre argent.
                      </p>
                    ) : (
                      <ul className="o-m-0 o-mt-5 o-list-none o-p-0" aria-live="polite">
                        {devis.lignes.map((ligne) => (
                          <li
                            key={ligne.quoi}
                            className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-black-10 dark:o-border-stone-800 o-py-3"
                          >
                            <span className="o-text-sm o-text-stone-950 dark:o-text-stone-50">
                              {ligne.quoi}
                            </span>
                            <span className="o-font-mono o-text-sm o-tabular-nums o-text-stone-600 dark:o-text-stone-400">
                              {ligne.prix} EUR
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="o-mt-6 o-flex o-items-baseline o-justify-between o-gap-4">
                      <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                        {devis.jours === 0
                          ? 'Sans delai'
                          : `${String(devis.jours)} jours d atelier`}
                      </span>
                      <span
                        className="o-font-mono o-text-2xl o-tabular-nums"
                        style={{ color: encre() }}
                      >
                        {devis.total} EUR
                      </span>
                    </div>
                    <p className="o-m-0 o-mt-5 o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
                      {choisies.has('bout') &&
                      choisies.has('avant') &&
                      choisies.has('cambrure')
                        ? 'Bout, avant-pied et cambrion ensemble : c est un ressemelage complet, et il coute moins que leur somme.'
                        : choisies.has('talon')
                          ? 'Le bonbout est compris dans un talon neuf : nous ne le facturons pas deux fois.'
                          : 'Cochez le bout, l avant-pied et le cambrion ensemble : le devis devient un ressemelage complet.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* L avant et l apres, en damier. */}
              <div className="o-mt-16">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  {reduced
                    ? 'La meme paire, avant et apres'
                    : 'La meme paire, avant et apres — survolez la coupe'}
                </p>
                <div className="o-mt-5 o-max-w-2xl">
                  {reduced ? (
                    <div className="o-grid o-gap-6 sm:o-grid-cols-2">
                      {usure}
                      {neuve}
                    </div>
                  ) : (
                    <PixelTransition
                      from={usure}
                      to={neuve}
                      cells={14}
                      duration={560}
                      color={accentDoux(900, 60)}
                    />
                  )}
                </div>
              </div>
            </Chapitre>
          </div>
        </section>

        {/* ================= Les cinq etapes, en chapitre ================= */}
        <section
          aria-labelledby="etapes-titre"
          className="o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={nuit('stone')}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Chapitre
              indice="(03) — Le ressemelage"
              largeur={4}
              titre={
                <h2
                  id="etapes-titre"
                  className="o-m-0 o-uppercase o-text-stone-50"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.6rem, 3.2vw, 2.75rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Cinq jours, et douze heures de presse.
                </h2>
              }
              texte={
                <span className="o-text-stone-400">
                  Ce qui prend du temps n est pas le travail : c est la colle, et le cuir
                  qui reprend sa place.
                </span>
              }
            >
              <ol className="o-m-0 o-list-none o-p-0">
                {ETAPES.map(([rang, titre, texte]) => (
                  <li
                    key={rang}
                    className="o-grid o-gap-4 o-border-t o-border-white-10 o-py-8 md:o-grid-cols-12 md:o-gap-8"
                  >
                    <span
                      aria-hidden="true"
                      className="o-tabular-nums o-text-stone-50 md:o-col-span-3"
                      style={{
                        ...affiche('l', 800),
                        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                        lineHeight: 0.84,
                        letterSpacing: '-0.05em',
                      }}
                    >
                      {rang}
                    </span>
                    <div className="md:o-col-span-9">
                      <h3 className="o-m-0 o-text-xl o-font-semibold o-uppercase o-tracking-tight o-text-stone-50">
                        <span className="o-sr-only">{rang} — </span>
                        {titre}
                      </h3>
                      <p className="o-m-0 o-mt-3 o-max-w-xl o-text-sm o-leading-relaxed o-text-stone-300">
                        {texte}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Chapitre>
          </div>
        </section>

        {/* ================= L appel : le devis en trois curseurs (A26) === */}
        <section
          id="devis"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="04" sombre={false}>
                Le devis
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-stone-950 dark:o-text-stone-50"
                style={{
                  ...affiche('m', 800),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Trois crans, et le montant tombe.
              </h2>
            </Reveal>
            <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
              Le devis part de ce que vous avez coche sur le plan
              {devis.total > 0 ? ` — ${String(devis.total)} euros la paire` : ''}. Ces
              trois crans-la ne changent pas le travail, ils changent ce qu il coute.
            </p>
            <div className="o-mt-14">
              <Devis base={devis.total} jours={devis.jours} />
            </div>
          </div>
        </section>

        {/* ================= Le pied : une signature et deux lignes (P29) = */}
        <footer className="o-relative o-border-t o-border-black-10 dark:o-border-stone-800 o-px-6 o-py-20 md:o-px-10">
          <div className="o-mx-auto o-max-w-3xl o-text-center">
            <p className="o-m-0 o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
              Je repare ce qui peut l etre et je le dis quand ce n est pas la peine. Une
              paire que je refuse, c est une paire que vous ne payez pas deux fois.
            </p>
            <p className="o-m-0 o-mt-10" style={{ color: encre() }}>
              <HandWritten width={280} thickness={4} duration={2000}>
                Jean Vasseur
              </HandWritten>
            </p>
            <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              Jean Vasseur — cordonnier, meilleur ouvrier regional 2009
            </p>
            <p className="o-m-0 o-mt-10 o-flex o-flex-wrap o-items-center o-justify-center o-gap-x-8 o-gap-y-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              <span>32 rue Oberkampf, 75011 Paris — 01 43 00 00 00</span>
              <a
                href="#devis"
                className="o-inline-flex o-items-center o-gap-2 o-no-underline focus:o-ring"
                style={{ color: encre() }}
              >
                etabli@alene.fr <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
              </a>
              <span>© 2026</span>
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
