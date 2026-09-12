/**
 * Balancier — atelier d horlogerie mecanique, Besancon.
 *
 * ## L objet est le site
 *
 * La page ouvre sur **le mouvement**, en volume, colle derriere l ecran : la
 * platine, le barillet, le rouage, l ancre et le balancier. Il reste la pendant
 * que quatre actes racontent la chaine cinematique, du ressort au spiral, et la
 * camera descend vers l echappement au fur et a mesure. C est la filiation de
 * Laocoon et de Soda : on ne montre pas un produit a cote d un texte, on met le
 * texte autour de l objet.
 *
 * ## Ce que la page fait : l echappement
 *
 * Le mecanisme de la page est **la vraie frequence**. Quatre calibres de la
 * maison battent a 18 000, 21 600, 28 800 et 36 000 alternances a l heure. Tout
 * ce que la page affiche en decoule par un calcul honnete :
 *
 * - les battements par seconde valent les alternances a l heure divisees par
 *   trois mille six cents ;
 * - la frequence en hertz en est la moitie, une oscillation valant deux
 *   alternances ;
 * - la roue d echappement porte quinze dents et en lache **une par
 *   alternance** : elle fait donc un tour en quinze alternances ;
 * - la trotteuse fait un tour par minute, en autant de sauts qu il y a de
 *   battements dans ces soixante secondes.
 *
 * Le dessin de l echappement tourne a cette cadence-la, et **on peut la
 * ralentir** : au quart, au vingtieme, au centieme, ou l arreter. A vitesse
 * reelle un balancier a quatre hertz n est qu un flou — c est exactement ce
 * qu on voit a l oeil nu, et c est pour cela qu un horloger emploie une
 * lampe stroboscopique. Ralenti, on voit la dent tomber.
 *
 * Les durees ne sont pas jouees en JavaScript : ce sont des animations dont la
 * duree est calculee, et la roue emploie `steps(15)` — quinze crans, un par
 * dent. Une cadence ecrite ainsi ne derive pas.
 *
 * ## Le volume, et son repli
 *
 * Une seule surface graphique : le mouvement, en three.js. Le fond de la page
 * n est donc pas un fond du registre mais **l arriere-plan de la scene**, qui
 * est opaque — rien de ce qu on glisserait dessous ne se verrait. La lueur et
 * le voile passent par-dessus le canevas.
 *
 * Refusee — mouvement reduit, pas de WebGL, plafond atteint — la scene cede la
 * place au **meme mouvement dessine**, qui bat a la meme cadence et se ralentit
 * pareil. La page ne perd pas son sujet.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { CircularText } from '@/odoro/text/CircularText.jsx'
import { FlipCard } from '@/odoro/ui/FlipCard.jsx'
import { OptionWheel } from '@/odoro/ui/OptionWheel.jsx'
import { PillTabs } from '@/odoro/ui/PillTabs.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Horloge,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import { Epingle } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Le nombre de dents de la roue d echappement, ici comme dans la scene. */
const DENTS = 15

/* ============================ Les calibres ============================= */

/** Un calibre de la maison, tel que le carnet de reglage le donne. */
interface Calibre {
  readonly cle: string
  readonly reference: string
  readonly nom: string
  /** Alternances a l heure : la seule valeur d ou tout le reste se deduit. */
  readonly alternances: number
  /** Marche moyenne relevee sur six positions, en secondes par jour. */
  readonly marche: number
  /** Amplitude du balancier a plat, en degres. */
  readonly amplitude: number
  /** Reserve de marche, en heures. */
  readonly reserve: number
  readonly rubis: number
  readonly diametre: string
  readonly hauteur: string
  readonly note: string
}

/** Les quatre calibres regles a l atelier. */
const CALIBRES = [
  {
    cle: 'br18',
    reference: 'BR-18',
    nom: 'Le lent',
    alternances: 18000,
    marche: 3,
    amplitude: 295,
    reserve: 46,
    rubis: 17,
    diametre: '25,60 mm',
    hauteur: '3,80 mm',
    note: 'Cinq battements par seconde : la cadence des montres de poche, et celle ou un spiral use le moins. On le garde pour les pieces anciennes qu on remonte.',
  },
  {
    cle: 'br21',
    reference: 'BR-21',
    nom: 'Le juste',
    alternances: 21600,
    marche: 1,
    amplitude: 288,
    reserve: 55,
    rubis: 19,
    diametre: '26,20 mm',
    hauteur: '3,60 mm',
    note: 'Six battements. Le meilleur compromis de la maison : assez rapide pour encaisser un choc, assez lent pour tenir cinquante-cinq heures.',
  },
  {
    cle: 'br28',
    reference: 'BR-28',
    nom: 'Le quotidien',
    alternances: 28800,
    marche: -2,
    amplitude: 275,
    reserve: 68,
    rubis: 21,
    diametre: '26,00 mm',
    hauteur: '4,10 mm',
    note: 'Huit battements, double barillet. C est le calibre qu on monte par defaut : il se moque du poignet qui bouge et du poignet qui dort.',
  },
  {
    cle: 'br36',
    reference: 'BR-36',
    nom: 'Le rapide',
    alternances: 36000,
    marche: 6,
    amplitude: 260,
    reserve: 42,
    rubis: 25,
    diametre: '27,40 mm',
    hauteur: '4,60 mm',
    note: 'Dix battements par seconde, et une trotteuse qui ne saute plus : elle coule. Le prix a payer se lit dans la reserve, quarante-deux heures.',
  },
] as const satisfies readonly Calibre[]

/** Les crans de ralenti proposes, du temps reel a l arret. */
const RALENTIS = [
  { cle: 'reel', libelle: 'Temps reel', part: 1 },
  { cle: 'quart', libelle: 'Un quart', part: 0.25 },
  { cle: 'vingt', libelle: 'Un vingtieme', part: 0.05 },
  { cle: 'cent', libelle: 'Un centieme', part: 0.01 },
  { cle: 'arret', libelle: 'A l arret', part: 0 },
] as const

/** Les quatre actes de la chaine cinematique, sur le mouvement. */
const ACTES = [
  {
    mot: 'Le barillet',
    titre: 'Un ressort plat, enroule dans son tambour.',
    texte: 'Trente-deux centimetres d acier de deux dixiemes, roules a froid. On lui donne vingt tours de couronne ; il les rend sur soixante-huit heures, et il les rend de plus en plus mollement. Tout le reste du mouvement existe pour corriger cela.',
  },
  {
    mot: 'Le rouage',
    titre: 'Quatre roues, et la vitesse qui monte.',
    texte: 'A chaque engrenage le couple descend et la vitesse monte. Le barillet fait un tour en sept heures, la roue de centre un tour par heure, la roue de seconde un tour par minute. Aucune de ces durees n est reglee : elles sont comptees en dents.',
  },
  {
    mot: 'L echappement',
    titre: 'La seule piece qui dise non.',
    texte: 'L ancre retient la roue, la lache une dent a la fois, et profite du passage pour rendre au balancier l energie qu il vient de perdre dans l air et dans ses pivots. Sans elle, le rouage se deviderait en trois secondes.',
  },
  {
    mot: 'Le balancier',
    titre: 'Une masse, un spiral, et rien d autre.',
    texte: 'Sa periode ne depend ni du ressort qui faiblit ni de la position du poignet : seulement de son inertie et de la raideur du spiral. C est la raison pour laquelle une montre mecanique peut etre juste, et c est la seule.',
  },
] as const

/** Les liens des coins. */
const NAVIGATION = [
  ['#echappement', 'L echappement'],
  ['#calibres', 'Les calibres'],
  ['#atelier', 'L atelier'],
] as const

/** L etiquette du pied : ce qu il y a dans la boite. */
const ETIQUETTE = [
  ['Composition', 'Boitier acier 316L brosse main, glace saphir bombee, fond visse a six pans, joint nitrile'],
  ['Mouvement', 'Calibre maison, remontage manuel, ponts anglees a la lime, spiral plat en alliage a module constant'],
  ['Origine', 'Ebauche fraisee a Morteau, terminee, assemblee et reglee rue des Granges a Besancon'],
  ['Reglage', 'Six positions, trois temperatures, quinze jours de marche avant expedition'],
  ['Entretien', 'Revision tous les six ans ; huile epilame sur les pierres d echappement, graisse sur le barillet'],
  ['Garantie', 'Cinq ans, piece et main d oeuvre, sur presentation du bulletin de marche signe'],
] as const

/* ============================ Les valeurs deduites ===================== */

/** Ce qui se calcule a partir des seules alternances a l heure. */
interface Cadence {
  /** Battements — alternances — par seconde. */
  readonly battements: number
  /** Frequence du balancier, en hertz : une oscillation vaut deux alternances. */
  readonly hertz: number
  /** Duree d une alternance, en millisecondes. */
  readonly battement: number
  /** Alternances comptees en un jour. */
  readonly parJour: number
  /** Tours de la roue d echappement en une minute. */
  readonly toursParMinute: number
}

/** Deduit la cadence des alternances a l heure. Rien n est ecrit a la main. */
function cadenceDe(alternances: number): Cadence {
  const battements = alternances / 3600
  return {
    battements,
    hertz: battements / 2,
    battement: 1000 / battements,
    parJour: alternances * 24,
    toursParMinute: (battements * 60) / DENTS,
  }
}

/** Un nombre a la francaise, avec l espace des milliers. */
function nombre(valeur: number, decimales = 0): string {
  return valeur.toLocaleString('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
}

/** Une marche signee : « + 3 s / j », « - 2 s / j ». */
function signe(valeur: number): string {
  return `${valeur >= 0 ? '+' : '-'} ${String(Math.abs(valeur))}`
}

/* ============================ Les traces ============================== */

/**
 * Le contour d une roue dentee, en coordonnees du dessin.
 *
 * La meme fonction sert pour le barillet, le rouage et la roue d echappement :
 * seuls le nombre de dents et le biais changent. Un biais faible donne la dent
 * a crochet de l echappement, un biais a la moitie donne la dent symetrique
 * d une roue de transmission.
 */
function roue(cx: number, cy: number, rayon: number, creux: number, dents: number, biais = 0.5): string {
  const pas = (Math.PI * 2) / dents
  const point = (angle: number, r: number): string =>
    `${(cx + Math.cos(angle) * r).toFixed(1)} ${(cy + Math.sin(angle) * r).toFixed(1)}`
  const trace: string[] = []
  for (let i = 0; i < dents; i += 1) {
    const a = i * pas
    trace.push(`${i === 0 ? 'M' : 'L'}${point(a, creux)}`)
    trace.push(`L${point(a + pas * 0.16, rayon)}`)
    trace.push(`L${point(a + pas * biais, rayon)}`)
    trace.push(`L${point(a + pas * 0.74, creux)}`)
  }
  return `${trace.join('')}Z`
}

/** Une spirale d Archimede : le ressort du barillet, le spiral du balancier. */
function spirale(cx: number, cy: number, petit: number, grand: number, tours: number): string {
  const total = tours * Math.PI * 2
  const points: string[] = []
  for (let a = 0; a <= total; a += 0.16) {
    const r = petit + ((grand - petit) * a) / total
    points.push(`${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`)
  }
  return `M${points.join('L')}`
}

/* ============================ Le mouvement dessine ===================== */

/** Les noms des images-cles, poses une fois pour toute la page. */
const REGLE = [
  '@keyframes o-montre-roue{to{transform:rotate(360deg)}}',
  '@keyframes o-montre-ancre{0%,44%{transform:rotate(-6.5deg)}50%,94%{transform:rotate(6.5deg)}100%{transform:rotate(-6.5deg)}}',
  '@keyframes o-montre-balancier{0%{transform:rotate(calc(-1 * var(--o-montre-amplitude)))}50%{transform:rotate(var(--o-montre-amplitude))}100%{transform:rotate(calc(-1 * var(--o-montre-amplitude)))}}',
  '@keyframes o-montre-trotteuse{to{transform:rotate(360deg)}}',
  '@media (prefers-reduced-motion:reduce){[data-o-montre-bat]{animation:none}}',
].join('')

/**
 * Le mouvement, dessine au trait, a la cadence demandee.
 *
 * C est a la fois le repli de la scene et la piece maitresse de la console : le
 * meme dessin, avec ou sans ses legendes. Les trois animations sont cadencees
 * par le calcul et non par une duree choisie a l oeil — l alternance dure
 * `1 / battements` seconde, divisee par le ralenti.
 */
function Mouvement({
  calibre,
  part,
  legendes = false,
}: {
  readonly calibre: Calibre
  readonly part: number
  readonly legendes?: boolean
}): ReactElement {
  const { reduced } = useMotionState()
  const cadence = cadenceDe(calibre.alternances)

  // L alternance, vue par le visiteur : la vraie, divisee par le ralenti.
  const arrete = part === 0 || reduced
  const alternance = arrete ? 0 : 1 / (cadence.battements * part)
  const oscillation = alternance * 2

  const anime = (regle: string): CSSProperties => (arrete ? {} : { animation: regle })

  const laiton = accent(300)
  const laitonSombre = accent(700)
  const acier = 'var(--o-palette-stone-300)'
  const filet = 'var(--o-palette-stone-600)'

  return (
    <svg viewBox="0 0 580 348" className="o-h-full o-w-full" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="o-montre-platine" cx="0.42" cy="0.3" r="0.8">
          <stop offset="0" stopColor={laiton} stopOpacity="0.2" />
          <stop offset="0.6" stopColor={laitonSombre} stopOpacity="0.14" />
          <stop offset="1" stopColor={laitonSombre} stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Le mecanisme garde ses coordonnees propres ; le decalage laisse les
          marges libres pour les legendes, qui ne mordent alors sur rien. */}
      <g transform="translate(26, 10)">
      {/* La platine, et le cercle de perlage qui la borde. */}
      <circle cx="230" cy="165" r="152" fill="url(#o-montre-platine)" stroke={filet} strokeWidth="1.2" />
      <circle cx="230" cy="165" r="141" stroke={filet} strokeWidth="0.8" strokeDasharray="2 5" opacity="0.7" />

      {/* Le barillet : la roue, et le ressort enroule dedans. */}
      <g>
        <path d={roue(112, 96, 56, 49, 42)} fill={laitonSombre} fillOpacity="0.5" stroke={laiton} strokeWidth="1.1" />
        <path d={spirale(112, 96, 6, 42, 5.5)} stroke={acier} strokeWidth="1.6" opacity="0.8" />
        <circle cx="112" cy="96" r="7" fill={acier} />
      </g>

      {/* Le rouage : centre, moyenne, seconde. Trois roues, aucune animee —
          leur tour dure une heure, huit minutes et une minute. */}
      <path d={roue(226, 92, 44, 38, 30)} fill={laitonSombre} fillOpacity="0.42" stroke={laiton} strokeWidth="1.1" />
      <circle cx="226" cy="92" r="6" fill={acier} />
      <path d={roue(312, 150, 37, 31, 26)} fill={laitonSombre} fillOpacity="0.42" stroke={laiton} strokeWidth="1.1" />
      <circle cx="312" cy="150" r="5.5" fill={acier} />
      <path d={roue(296, 240, 33, 27, 24)} fill={laitonSombre} fillOpacity="0.42" stroke={laiton} strokeWidth="1.1" />
      <circle cx="296" cy="240" r="5" fill={acier} />

      {/* La roue d echappement : quinze dents a crochet, un cran par
          alternance. `steps(15)` fait tomber la dent, il ne la fait pas
          glisser — c est toute la difference entre un echappement et un
          moulin. */}
      <g
        data-o-montre-bat=""
        style={{ transformOrigin: '206px 246px', ...anime(`o-montre-roue ${(alternance * DENTS).toFixed(3)}s steps(${String(DENTS)}, end) infinite`) }}
      >
        <path d={roue(206, 246, 34, 24, DENTS, 0.24)} fill={accent(500)} fillOpacity="0.32" stroke={accent(200)} strokeWidth="1.3" />
        <circle cx="206" cy="246" r="5" fill={acier} />
      </g>

      {/* L ancre : deux bras a palettes vers la roue, une fourchette vers le
          balancier, et le pivot au milieu. */}
      <g
        data-o-montre-bat=""
        style={{ transformOrigin: '150px 228px', ...anime(`o-montre-ancre ${oscillation.toFixed(3)}s linear infinite`) }}
      >
        <path d="M150 228 L186 212" stroke={acier} strokeWidth="9" strokeLinecap="round" />
        <path d="M150 228 L190 246" stroke={acier} strokeWidth="9" strokeLinecap="round" />
        <path d="M150 228 L108 232" stroke={acier} strokeWidth="6" strokeLinecap="round" opacity="0.9" />
        <rect x="182" y="206" width="9" height="11" rx="1.5" fill={accent(400)} transform="rotate(-24 186 212)" />
        <rect x="186" y="241" width="9" height="11" rx="1.5" fill={accent(400)} transform="rotate(22 190 246)" />
        <circle cx="150" cy="228" r="7" fill={filet} stroke={acier} strokeWidth="1.5" />
      </g>

      {/* Le balancier : le volant, ses deux bras, et le spiral. L amplitude
          est celle du carnet de reglage, pas une valeur choisie. */}
      <g
        data-o-montre-bat=""
        style={{
          transformOrigin: '86px 212px',
          '--o-montre-amplitude': `${String(Math.round(calibre.amplitude / 2))}deg`,
          ...anime(`o-montre-balancier ${oscillation.toFixed(3)}s ease-in-out infinite`),
        } as CSSProperties}
      >
        <path d={spirale(86, 212, 5, 30, 9)} stroke={acier} strokeWidth="1" opacity="0.75" />
        <circle cx="86" cy="212" r="52" stroke={laiton} strokeWidth="7" opacity="0.92" />
        <path d="M34 212 H138 M86 160 V264" stroke={laiton} strokeWidth="4.5" opacity="0.75" />
        <circle cx="86" cy="212" r="7" fill={acier} />
        <circle cx="122" cy="174" r="5" fill={accent(400)} />
        <circle cx="50" cy="250" r="5" fill={accent(400)} />
      </g>

      </g>

      {legendes && (
        <g fill="var(--o-palette-stone-200)" style={{ fontFamily: 'var(--o-font-mono)', fontSize: 11, letterSpacing: '0.1em' }}>
          {/* Les filets de renvoi : `fill` explicitement nul, sans quoi ils
              heriteraient du remplissage du groupe et se fermeraient en
              triangles pleins. */}
          <g stroke={filet} strokeWidth="0.8" fill="none">
            <path d="M104 74 L58 40" />
            <path d="M102 272 L64 306" />
            <path d="M176 250 L192 318" />
            <path d="M252 284 L306 318" />
            <path d="M374 166 L448 166" />
          </g>
          <text x="24" y="32">Barillet</text>
          <text x="24" y="44" fill="var(--o-palette-stone-400)" style={{ fontSize: 9.5 }}>68 h de reserve</text>
          <text x="10" y="320">Balancier</text>
          <text x="196" y="322">Ancre</text>
          <text x="310" y="322">{`Echappement · ${String(DENTS)} dents`}</text>
          <text x="452" y="163">Rouage</text>
          <text x="452" y="177" fill="var(--o-palette-stone-400)" style={{ fontSize: 9.5 }}>1 tour / min</text>
        </g>
      )}
    </svg>
  )
}

/* ============================ Le cadran a aiguille ===================== */

/**
 * Le cadran de marche : une aiguille sur une echelle de secondes par jour.
 *
 * C est ce qu affiche un chronocomparateur pose devant une montre — et c est le
 * seul chiffre que la maison met en scene. L echelle va de vingt secondes
 * perdues a vingt secondes gagnees ; au-dela, la piece repart a l etabli.
 */
function CadranDeMarche({ marche, amplitude }: { readonly marche: number; readonly amplitude: number }): ReactElement {
  const borne = 20
  const course = 124
  const angle = (Math.max(-borne, Math.min(borne, marche)) / borne) * course
  const graduations = Array.from({ length: 21 }, (_, i) => i - 10)

  return (
    <figure className="o-m-0">
      <svg viewBox="0 0 260 200" className="o-w-full" fill="none" aria-hidden="true">
        {/* L arc grade, et les graduations toutes les deux secondes. */}
        <path
          d="M40 168 A 110 110 0 1 1 220 168"
          stroke="var(--o-palette-stone-700)"
          strokeWidth="1.2"
        />
        {graduations.map((cran) => {
          const a = ((cran / 10) * course * Math.PI) / 180
          const forte = cran % 5 === 0
          const long = forte ? 16 : 8
          const x1 = 130 + Math.sin(a) * 104
          const y1 = 140 - Math.cos(a) * 104
          const x2 = 130 + Math.sin(a) * (104 - long)
          const y2 = 140 - Math.cos(a) * (104 - long)
          return (
            <line
              key={cran}
              x1={x1.toFixed(1)}
              y1={y1.toFixed(1)}
              x2={x2.toFixed(1)}
              y2={y2.toFixed(1)}
              stroke={forte ? 'var(--o-palette-stone-300)' : 'var(--o-palette-stone-600)'}
              strokeWidth={forte ? 1.8 : 1}
            />
          )
        })}
        {/* La zone tenue : plus ou moins six secondes, le critere de la maison. */}
        <path
          d="M97 55 A 110 110 0 0 1 163 55"
          stroke={accent(400)}
          strokeWidth="3"
          opacity="0.7"
        />
        {([
          [-20, 46, 150],
          [0, 130, 28],
          [20, 214, 150],
        ] as const).map(([valeur, x, y]) => (
          <text
            key={valeur}
            x={x}
            y={y}
            textAnchor="middle"
            fill="var(--o-palette-stone-400)"
            style={{ fontFamily: 'var(--o-font-mono)', fontSize: 12 }}
          >
            {valeur > 0 ? `+${String(valeur)}` : String(valeur)}
          </text>
        ))}
        {/* L aiguille, qui rejoint sa valeur en une demi-seconde. */}
        <g style={{ transformOrigin: '130px 140px', transform: `rotate(${angle.toFixed(1)}deg)`, transition: 'transform 620ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <path d="M130 140 L126 60 L130 46 L134 60 Z" fill={encreSurSombre()} />
          <path d="M130 140 L130 158" stroke={encreSurSombre()} strokeWidth="3" />
        </g>
        <circle cx="130" cy="140" r="8" fill="var(--o-palette-stone-900)" stroke="var(--o-palette-stone-500)" strokeWidth="1.5" />
      </svg>
      <figcaption className="o-mt-2 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
        Marche moyenne — <span className="o-tabular-nums" style={{ color: encreSurSombre() }}>{signe(marche)} s / j</span> — amplitude {String(amplitude)}°
      </figcaption>
    </figure>
  )
}

/* ============================ Les petites pieces ======================= */

/** Une valeur deduite, posee sur un filet : libelle en mono, chiffre en clair. */
function Valeur({ quoi, children, note }: { readonly quoi: string; readonly children: ReactNode; readonly note?: string }): ReactElement {
  return (
    <div className="o-border-t o-border-white-10 o-py-4">
      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">{quoi}</dt>
      <dd className="o-m-0 o-mt-2 o-tabular-nums o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)' }}>
        {children}
      </dd>
      {note !== undefined && <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-stone-500">{note}</p>}
    </div>
  )
}

/** Le code-barres du pied : un vrai alignement de barres, pas une image. */
function CodeBarres({ graine }: { readonly graine: string }): ReactElement {
  const barres = useMemo(() => {
    let somme = 7
    return Array.from({ length: 44 }, (_, i) => {
      somme = (somme * 31 + graine.charCodeAt(i % graine.length)) % 9973
      return 1 + (somme % 4)
    })
  }, [graine])
  let x = 0
  return (
    <svg viewBox="0 0 160 44" className="o-h-11 o-w-40" aria-hidden="true">
      {barres.map((largeur, rang) => {
        const gauche = x
        x += largeur + 1.4
        return rang % 2 === 0 ? (
          <rect key={rang} x={gauche.toFixed(1)} y="0" width={largeur.toFixed(1)} height="34" fill="var(--o-palette-stone-200)" />
        ) : null
      })}
      <text x="0" y="43" fill="var(--o-palette-stone-400)" style={{ fontFamily: 'var(--o-font-mono)', fontSize: 8, letterSpacing: '0.22em' }}>
        {graine}
      </text>
    </svg>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('fraunces')
  const { reduced } = useMotionState()

  const [cle, setCle] = useState<string>(CALIBRES[2].cle)
  const [ralenti, setRalenti] = useState<string>('vingt')

  const calibre: Calibre = CALIBRES.find((c) => c.cle === cle) ?? CALIBRES[0]
  const part = RALENTIS.find((r) => r.cle === ralenti)?.part ?? 1
  const cadence = cadenceDe(calibre.alternances)

  // La scene lit la cadence sans provoquer de rendu : elle tourne dans sa
  // propre boucle, et un changement de calibre ne doit pas la remonter. Le
  // moteur lit `construire` et `animer` par reference — passer une nouvelle
  // fermeture a chaque rendu ne reconstruit donc rien.
  const marche = useRef({ battements: cadence.battements, part })
  const horloge = useRef(0)
  useEffect(() => {
    marche.current = { battements: cadence.battements, part }
  })

  // La piste de la trajectoire : l enveloppe qui porte l ouverture et les
  // quatre actes, donc cinq ecrans. Sans elle, la course serait degeneree.
  const [piste, setPiste] = useState<HTMLElement | null>(null)

  const mouvement = (
      <Volume
        nom="mouvement mecanique"
        className="o-absolute o-inset-0 o-z-0"
        piste={piste}
        trajectoire={[
          { at: 0, position: [0.15, 0.4, 5.4], lookAt: [1.0, 0.45, 0] },
          { at: 0.36, position: [0.7, 0.75, 4.3], lookAt: [1.05, 0.5, 0] },
          { at: 0.7, position: [0.95, 0.25, 3.2], lookAt: [0.95, 0.15, 0] },
          { at: 1, position: [0.7, 0.05, 2.4], lookAt: [0.68, 0.02, 0] },
        ]}
        repli={
          <div className="o-flex o-h-full o-items-center o-justify-center o-p-10">
            <div className="o-w-full o-max-w-2xl o-opacity-90">
              <Mouvement calibre={calibre} part={part} />
            </div>
          </div>
        }
        construire={(contexte) => {
          const { scene, camera, three } = contexte
          const laiton = teinte('--o-vitrine-400', '#d8a657')
          const laitonFonce = teinte('--o-vitrine-700', '#8a6224')
          const rubisTeinte = teinte('--o-vitrine-500', '#c0392b')
          const acier = teinte('--o-vitrine-100', '#e7e5e4')

          // Le canevas est opaque : son arriere-plan est le fond de la page.
          // Une nuit chaude, tres sombre, tiree de l accent de la vitrine et
          // non d un neutre du systeme — les jetons de palette sont ecrits en
          // `oklch()`, que three.js ne sait pas lire, alors que les nuances
          // `--o-vitrine-*` sont calculees et rendues en clair.
          scene.background = new three.Color(teinte('--o-vitrine-950', '#1c1917')).multiplyScalar(0.16)

          const geometries: { dispose: () => void }[] = []
          const matieres: { dispose: () => void }[] = []

          /** Une roue dentee extrudee : le meme trace qu au dessin. */
          const roueDentee = (dents: number, rayon: number, creux: number, epaisseur: number, trou: number, biais = 0.5): InstanceType<typeof three.ExtrudeGeometry> => {
            const forme = new three.Shape()
            const pas = (Math.PI * 2) / dents
            for (let i = 0; i < dents; i += 1) {
              const a = i * pas
              const poser = (angle: number, r: number, premier = false): void => {
                const x = Math.cos(angle) * r
                const y = Math.sin(angle) * r
                if (premier) forme.moveTo(x, y)
                else forme.lineTo(x, y)
              }
              poser(a, creux, i === 0)
              poser(a + pas * 0.16, rayon)
              poser(a + pas * biais, rayon)
              poser(a + pas * 0.74, creux)
            }
            forme.closePath()
            const percage = new three.Path()
            percage.absarc(0, 0, trou, 0, Math.PI * 2, true)
            forme.holes.push(percage)
            return new three.ExtrudeGeometry(forme, {
              depth: epaisseur,
              bevelEnabled: true,
              bevelThickness: 0.006,
              bevelSize: 0.006,
              bevelSegments: 1,
              curveSegments: 12,
            })
          }

          const matiereLaiton = new three.MeshPhysicalMaterial({
            color: laiton,
            metalness: 0.62,
            roughness: 0.3,
            clearcoat: 0.5,
            clearcoatRoughness: 0.22,
          })
          const matiereLaitonFonce = new three.MeshPhysicalMaterial({
            color: new three.Color(laitonFonce).multiplyScalar(0.5),
            metalness: 0.35,
            roughness: 0.82,
          })
          // Les ponts sont plus sombres que les roues : sans cet ecart, deux
          // plaques claires posees en travers se lisent comme des batons.
          const matierePont = new three.MeshPhysicalMaterial({
            color: teinte('--o-vitrine-600', '#a1741f'),
            metalness: 0.5,
            roughness: 0.44,
            clearcoat: 0.35,
          })
          const matiereAcier = new three.MeshPhysicalMaterial({
            color: acier,
            metalness: 0.45,
            roughness: 0.22,
            clearcoat: 1,
            clearcoatRoughness: 0.06,
          })
          const matiereRubis = new three.MeshPhysicalMaterial({
            color: rubisTeinte,
            metalness: 0.1,
            roughness: 0.04,
            transmission: 0.55,
            thickness: 0.1,
            emissive: new three.Color(rubisTeinte).multiplyScalar(0.22),
          })
          matieres.push(matiereLaiton, matiereLaitonFonce, matierePont, matiereAcier, matiereRubis)

          const bloc = new three.Group()
          bloc.name = 'mouvement'

          // La platine, et le cercle de perlage creuse a sa peripherie.
          const gPlatine = new three.CylinderGeometry(1.52, 1.52, 0.1, 96)
          geometries.push(gPlatine)
          const platine = new three.Mesh(gPlatine, matiereLaitonFonce)
          platine.rotation.x = Math.PI / 2
          platine.position.z = -0.1
          const gChant = new three.TorusGeometry(1.52, 0.022, 8, 120)
          geometries.push(gChant)
          const chant = new three.Mesh(gChant, matiereAcier)
          chant.position.z = -0.05
          bloc.add(platine, chant)

          /** Pose une roue a sa place, sous son nom, dans son plan. */
          const poserRoue = (nom: string, geo: InstanceType<typeof three.ExtrudeGeometry>, x: number, y: number, z: number, matiere: typeof matiereLaiton): void => {
            geometries.push(geo)
            const maille = new three.Mesh(geo, matiere)
            maille.name = nom
            maille.position.set(x, y, z)
            bloc.add(maille)
          }

          poserRoue('barillet', roueDentee(42, 0.52, 0.455, 0.07, 0.055), -0.62, 0.48, -0.02, matiereLaiton)
          poserRoue('centre', roueDentee(30, 0.41, 0.355, 0.05, 0.045), 0.0, 0.52, 0.0, matiereLaiton)
          poserRoue('moyenne', roueDentee(26, 0.34, 0.29, 0.05, 0.04), 0.62, 0.06, 0.02, matiereLaiton)
          poserRoue('seconde', roueDentee(24, 0.3, 0.25, 0.05, 0.036), 0.46, -0.66, 0.04, matiereLaiton)
          poserRoue('echappement', roueDentee(DENTS, 0.25, 0.17, 0.035, 0.03, 0.24), -0.08, -0.86, 0.06, matiereAcier)

          // L ancre : deux bras a palettes, une fourchette, un pivot. Trois
          // barres suffisent a la faire lire, et elles se voient de loin.
          const ancre = new three.Group()
          ancre.name = 'ancre'
          const gBras = new three.BoxGeometry(0.34, 0.05, 0.04)
          const gFourchette = new three.BoxGeometry(0.3, 0.04, 0.035)
          const gPalette = new three.BoxGeometry(0.06, 0.08, 0.045)
          const gPivot = new three.CylinderGeometry(0.045, 0.045, 0.1, 20)
          geometries.push(gBras, gFourchette, gPalette, gPivot)
          const brasA = new three.Mesh(gBras, matiereAcier)
          brasA.position.set(0.16, 0.08, 0)
          brasA.rotation.z = 0.42
          const brasB = new three.Mesh(gBras, matiereAcier)
          brasB.position.set(0.16, -0.08, 0)
          brasB.rotation.z = -0.42
          const fourchette = new three.Mesh(gFourchette, matiereAcier)
          fourchette.position.set(-0.16, 0.02, 0)
          fourchette.rotation.z = -0.08
          const paletteA = new three.Mesh(gPalette, matiereRubis)
          paletteA.position.set(0.31, 0.16, 0)
          const paletteB = new three.Mesh(gPalette, matiereRubis)
          paletteB.position.set(0.31, -0.16, 0)
          const pivotAncre = new three.Mesh(gPivot, matiereAcier)
          pivotAncre.rotation.x = Math.PI / 2
          ancre.add(brasA, brasB, fourchette, paletteA, paletteB, pivotAncre)
          ancre.position.set(-0.46, -0.62, 0.08)
          bloc.add(ancre)

          // Le balancier : le volant, sa croisee, ses deux vis de reglage, et
          // le spiral en fil fin. Sans le spiral, c est une roue.
          const balancier = new three.Group()
          balancier.name = 'balancier'
          const gVolant = new three.TorusGeometry(0.46, 0.035, 10, 72)
          const gCroisee = new three.BoxGeometry(0.92, 0.036, 0.03)
          const gVis = new three.CylinderGeometry(0.04, 0.04, 0.05, 14)
          geometries.push(gVolant, gCroisee, gVis)
          const volant = new three.Mesh(gVolant, matiereLaiton)
          const croiseeA = new three.Mesh(gCroisee, matiereLaiton)
          const croiseeB = new three.Mesh(gCroisee, matiereLaiton)
          croiseeB.rotation.z = Math.PI / 2
          const visA = new three.Mesh(gVis, matiereAcier)
          visA.position.set(0.325, 0.325, 0)
          visA.rotation.x = Math.PI / 2
          const visB = new three.Mesh(gVis, matiereAcier)
          visB.position.set(-0.325, -0.325, 0)
          visB.rotation.x = Math.PI / 2

          const points: InstanceType<typeof three.Vector3>[] = []
          for (let a = 0; a <= Math.PI * 2 * 9; a += 0.14) {
            const r = 0.05 + (0.33 * a) / (Math.PI * 2 * 9)
            points.push(new three.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.09))
          }
          const gSpiral = new three.BufferGeometry().setFromPoints(points)
          const filSpiral = new three.LineBasicMaterial({ color: acier, transparent: true, opacity: 0.7 })
          geometries.push(gSpiral)
          matieres.push(filSpiral)
          balancier.add(volant, croiseeA, croiseeB, visA, visB, new three.Line(gSpiral, filSpiral))
          balancier.position.set(-0.9, -0.36, 0.12)
          bloc.add(balancier)

          // Les rubis du rouage : sept pierres, posees sur les pivots.
          const gRubis = new three.CylinderGeometry(0.045, 0.045, 0.03, 18)
          geometries.push(gRubis)
          for (const [x, y] of [[-0.62, 0.48], [0, 0.52], [0.62, 0.06], [0.46, -0.66], [-0.08, -0.86], [-0.46, -0.62], [-0.9, -0.36]] as const) {
            const pierre = new three.Mesh(gRubis, matiereRubis)
            pierre.position.set(x, y, 0.16)
            pierre.rotation.x = Math.PI / 2
            bloc.add(pierre)
          }

          // Les ponts : deux plaques anglees posees sur le rouage, percees
          // pour laisser voir les roues dessous.
          const gPont = new three.BoxGeometry(0.96, 0.3, 0.05)
          geometries.push(gPont)
          const pontA = new three.Mesh(gPont, matierePont)
          pontA.position.set(0.3, 0.3, 0.2)
          pontA.rotation.z = -0.42
          const pontB = new three.Mesh(gPont, matierePont)
          pontB.position.set(-0.34, -0.78, 0.2)
          pontB.rotation.z = 0.2
          pontB.scale.set(0.72, 0.8, 1)
          bloc.add(pontA, pontB)

          bloc.rotation.x = -0.72
          bloc.rotation.y = 0.34
          bloc.rotation.z = 0.1
          bloc.position.set(1.12, 0.66, 0)
          bloc.scale.setScalar(0.74)
          scene.add(bloc)

          // Un laiton sans lampe rasante est une tache noire : la cle chaude
          // devant, le remplissage froid a gauche, le contour derriere, et
          // deux rasantes qui posent le trait clair sur le chant des roues.
          // Une lampe de dessous eclaire la platine par le bas du cadre.
          eclairer(contexte, { cle: 0xfff0d2, remplissage: 0x8fa2cc, contour: 0xffffff, force: 1.3 })
          const rasanteGauche = new three.PointLight(0xffffff, 26, 14, 2)
          rasanteGauche.position.set(-0.9, 2.1, 2.6)
          const rasanteDroite = new three.PointLight(0xfff4e0, 30, 14, 2)
          rasanteDroite.position.set(3.4, 1.3, 1.9)
          const dessous = new three.PointLight(0xffd9a0, 22, 12, 2)
          dessous.position.set(1.0, -1.5, 1.7)
          const rase = new three.SpotLight(0xffffff, 40, 14, 0.6, 0.7, 2)
          rase.position.set(-1.0, -1.4, 2.9)
          rase.target.position.set(0.9, 0.4, 0)
          scene.add(rasanteGauche, rasanteDroite, dessous, rase, rase.target)

          camera.position.set(0.15, 0.4, 5.4)
          camera.lookAt(1.0, 0.45, 0)

          return () => {
            for (const g of geometries) g.dispose()
            for (const m of matieres) m.dispose()
          }
        }}
        animer={({ scene }, { delta, time }) => {
          const bloc = scene.getObjectByName('mouvement')
          if (bloc === undefined) return
          const { battements, part: cadenceVue } = marche.current

          // Le temps du mouvement : le temps reel, divise par le ralenti.
          // Un cumul, et non `time * part` — sans quoi changer de cran ferait
          // sauter le mecanisme d un quart de tour.
          horloge.current += delta * cadenceVue

          const t = horloge.current
          const alternances = t * battements

          const balancier = scene.getObjectByName('balancier')
          if (balancier !== undefined) {
            // L amplitude du carnet, en radians, sur une demi-periode.
            balancier.rotation.z = Math.sin(alternances * Math.PI) * 2.4
          }

          const ancre = scene.getObjectByName('ancre')
          if (ancre !== undefined) {
            // Une bascule franche, et non une sinusoide : l ancre est
            // immobile entre deux chutes, et bascule d un coup.
            ancre.rotation.z = Math.tanh(Math.cos(alternances * Math.PI) * 6) * 0.12
          }

          const echappement = scene.getObjectByName('echappement')
          if (echappement !== undefined) {
            // Une dent par alternance, et la chute en fin de course : c est
            // le saut qu on vient voir, pas la rotation.
            const dent = Math.floor(alternances)
            const chute = Math.min(1, (alternances - dent) * 7)
            echappement.rotation.z = -((dent + chute * chute * (3 - 2 * chute)) * (Math.PI * 2)) / DENTS
          }

          const seconde = scene.getObjectByName('seconde')
          if (seconde !== undefined) seconde.rotation.z = -(t * Math.PI * 2) / 60
          const moyenne = scene.getObjectByName('moyenne')
          if (moyenne !== undefined) moyenne.rotation.z = (t * Math.PI * 2) / 480
          const centre = scene.getObjectByName('centre')
          if (centre !== undefined) centre.rotation.z = -(t * Math.PI * 2) / 3600
          const barillet = scene.getObjectByName('barillet')
          if (barillet !== undefined) barillet.rotation.z = (t * Math.PI * 2) / 25200

          // Le mouvement respire d un degre sous la loupe : une piece posee
          // sur un porte-piece n est jamais parfaitement d aplomb.
          bloc.rotation.y = 0.24 + Math.sin(time * 0.32) * 0.05
        }}
      />
  )

  return (
    <Porte forme="compteur" marque="Balancier">
      <div className="o-relative o-text-stone-50" style={{ ...polices, ...nuit('stone') }}>
        <style>{REGLE}</style>

        {/*
          ----- L etabli : le mouvement, et les quatre actes par-dessus -------

          La scene est collee en haut du cadre ; l ouverture puis les actes
          passent devant elle. La camera descend vers l echappement le long de
          cette meme enveloppe, qui fait cinq ecrans.
        */}
        <div className="o-relative" ref={setPiste}>
          <div className="o-sticky o-z-0 o-overflow-hidden" style={{ top: CHROME, height: ECRAN }}>
            {mouvement}
            {/* La lueur d etabli, par-dessus le canevas : sous lui, elle ne se
                verrait pas — le moteur ouvre ses contextes opaques. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-10"
              style={{
                background: `radial-gradient(34% 32% at 72% 30%, ${accentDoux(300, 13)}, transparent 74%)`,
                mixBlendMode: 'screen',
              }}
            />
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-10"
              style={{
                background: 'linear-gradient(to top, var(--o-palette-stone-950) 0%, color-mix(in oklab, var(--o-palette-stone-950) 62%, transparent) 34%, transparent 72%)',
              }}
            />
            <Grain opacite={0.07} />
          </div>

          <div className="o-relative o-z-10" style={{ marginTop: `calc(-1 * ${ECRAN})` }}>
            {/* ----- L ouverture ------------------------------------------- */}
            <section id="haut" className="o-relative o-flex o-flex-col" style={{ minHeight: ECRAN }}>
              <BarreCoins marque="Balancier" liens={NAVIGATION} droite={<Horloge ville="Besancon" />} />

              <div className="o-flex o-grow o-flex-col o-justify-end o-px-6 o-pb-20 o-pt-12 md:o-px-12 md:o-pb-24">
                <Surgit>
                  <Etiquette>Besancon — rue des Granges, atelier ouvert depuis 1974</Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-6 o-max-w-3xl"
                  style={{ ...affiche('l', 300), fontSize: 'clamp(2.75rem, 8.4vw, 9rem)', letterSpacing: '-0.03em' }}
                >
                  Le temps ne coule pas. Il bat.
                </TitreVague>

                <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                  <Surgit delai={560} as="p" className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-stone-300 md:o-col-span-6">
                    Ni pile ni quartz : un ressort, quatre roues, et un balancier qui decoupe la seconde en huit. Celui-ci tourne devant vous a sa vraie frequence — ralentissez-le, et regardez la dent tomber.
                  </Surgit>
                  <Surgit delai={680} className="md:o-col-span-6 md:o-flex md:o-justify-end">
                    <Actions
                      pleine={['#echappement', <>Ralentir l echappement <Icon icon={ArrowDown} size={16} aria-hidden="true" /></>]}
                      fantome={['#calibres', 'Les quatre calibres']}
                    />
                  </Surgit>
                </div>
              </div>

              {/* Le poincon tournant : le seul ornement de l ouverture. */}
              <Surgit delai={820} className="o-pointer-events-none o-absolute o-right-16 o-top-24 o-hidden lg:o-block">
                <CircularText size={122} speed={34} className="o-font-mono o-text-xs o-uppercase" style={{ color: encreSurSombre() }}>
                  {'· BALANCIER · BESANCON '}
                </CircularText>
              </Surgit>

              <Coin position="bd">
                {calibre.reference} — {String(calibre.rubis)} rubis
                <br />
                Regle en six positions
              </Coin>
            </section>

            {/* ----- Les quatre actes, sur le mouvement ---------------------

                Sous mouvement reduit, la scene epinglee ne rendrait que son
                dernier acte : les trois premiers disparaitraient. Les quatre
                sont alors ecrits a la suite, et la chaine se lit entiere. */}
            {reduced ? (
              <ol className="o-m-0 o-list-none o-p-0">
                {ACTES.map((a, rang) => (
                  <li key={a.mot} className="o-border-t o-border-white-10 o-px-6 o-py-12 md:o-px-12">
                    <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-baseline">
                      <p aria-hidden="true" className="o-m-0 o-tabular-nums md:o-col-span-3" style={{ ...affiche('xl', 300), fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.9, color: accentDoux(300, 62) }}>
                        {String(rang + 1).padStart(2, '0')}
                      </p>
                      <div className="o-min-w-0 md:o-col-span-9">
                        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                          {a.mot}
                        </p>
                        <h2 className="o-m-0 o-mt-3 o-max-w-3xl o-text-balance" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 3.4vw, 2.5rem)' }}>
                          {a.titre}
                        </h2>
                        <p className="o-m-0 o-mt-4 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-300">{a.texte}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
            <Epingle ecrans={4} actes={ACTES.length}>
              {(acte, progression) => {
                const a = ACTES[acte] ?? ACTES[0]
                return (
                  <div className="o-relative o-flex o-h-full o-flex-col o-justify-end o-px-6 o-pb-16 o-pt-20 md:o-px-12 md:o-pb-20">
                    <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-end">
                      <p
                        aria-hidden="true"
                        className="o-m-0 o-tabular-nums md:o-col-span-3"
                        style={{ ...affiche('xl', 300), fontSize: 'clamp(3.5rem, 11vw, 10rem)', lineHeight: 0.82, color: accentDoux(300, 62) }}
                      >
                        {String(acte + 1).padStart(2, '0')}
                      </p>
                      <div className="o-min-w-0 md:o-col-span-9">
                        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                          {a.mot}
                        </p>
                        <h2 className="o-m-0 o-mt-4 o-max-w-3xl o-text-balance" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4.4vw, 3.75rem)' }}>
                          {a.titre}
                        </h2>
                        <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-300">{a.texte}</p>
                      </div>
                    </div>

                    {/* La chaine cinematique : quatre maillons qui se
                        remplissent, un par acte. */}
                    <ol aria-hidden="true" className="o-m-0 o-mt-10 o-flex o-list-none o-gap-2 o-p-0">
                      {ACTES.map((autre, rang) => (
                        <li key={autre.mot} className="o-flex o-grow o-flex-col o-gap-2">
                          <span
                            className="o-block o-h-0.5 o-transition-all"
                            style={{ backgroundColor: rang <= acte ? encreSurSombre() : 'var(--o-palette-stone-800)' }}
                          />
                          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: rang === acte ? encreSurSombre() : 'var(--o-palette-stone-400)' }}>
                            {autre.mot}
                          </span>
                        </li>
                      ))}
                    </ol>
                    <div aria-hidden="true" className="o-mt-3 o-h-px o-bg-white-10">
                      <div className="o-h-full" style={{ width: `${String(Math.round((reduced ? 1 : progression) * 100))}%`, backgroundColor: accent(400), transition: 'width 220ms linear' }} />
                    </div>
                  </div>
                )
              }}
            </Epingle>
            )}
          </div>
        </div>

        <main className="o-relative o-z-10" style={{ backgroundColor: 'var(--o-palette-stone-950)' }}>
          {/*
            ----- Le mecanisme : l echappement, ralentissable -----------------
          */}
          <section id="echappement" className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-12 md:o-py-28">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <Indice rang="01">L echappement</Indice>
                <h2 className="o-m-0 o-mt-5 o-max-w-2xl" style={{ ...affiche('m', 300), fontSize: 'clamp(1.875rem, 4.2vw, 3.5rem)' }}>
                  {cadence.battements.toLocaleString('fr-FR')} fois par seconde, une dent tombe.
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400 md:o-col-span-5 md:o-text-right">
                Le dessin bat a la cadence du calibre choisi.
                <br />
                Ralentissez-le pour voir ce que l oeil ne voit pas.
              </p>
            </div>

            <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
              {/* Les commandes : le calibre, puis le ralenti. */}
              <div className="o-flex o-flex-col o-gap-8 lg:o-col-span-4">
                <div>
                  <p className="o-m-0 o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">Le calibre</p>
                  <PillTabs
                    label="Calibre du mouvement"
                    items={CALIBRES.map((c) => ({ id: c.cle, label: c.reference }))}
                    value={cle}
                    onValueChange={setCle}
                    size="sm"
                  />
                  <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-stone-300">{calibre.note}</p>
                </div>

                <div>
                  <p className="o-m-0 o-mb-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">Le ralenti</p>
                  <div
                    className="o-rounded-2xl o-border-w-1 o-border-white-10 o-px-4 o-py-2"
                    style={{ '--o-wheel-accent': encreSurSombre(), backgroundColor: accentDoux(700, 8) } as CSSProperties}
                  >
                    <OptionWheel
                      label="Vitesse d observation"
                      options={RALENTIS.map((r) => ({ value: r.cle, label: r.libelle }))}
                      value={ralenti}
                      onChange={setRalenti}
                      visible={5}
                      curve={20}
                      className="o-text-sm o-text-stone-400"
                    />
                  </div>
                  <p className="o-m-0 o-mt-3 o-text-xs o-leading-relaxed o-text-stone-500">
                    {part === 0
                      ? 'A l arret : la roue est retenue par une palette, et rien ne bouge tant que le balancier ne revient pas.'
                      : `Une alternance dure ${nombre(cadence.battement, 1)} ms. Vue ici, elle en dure ${nombre(cadence.battement / part, 0)}.`}
                  </p>
                </div>
              </div>

              {/* Le dessin, et le cadran a aiguille. */}
              <div className="o-min-w-0 lg:o-col-span-8">
                <div
                  className="o-relative o-overflow-hidden o-rounded-3xl o-border-w-1 o-border-white-10 o-p-4 md:o-p-6"
                  style={{ backgroundColor: accentDoux(900, 14) }}
                >
                  <Mouvement calibre={calibre} part={part} legendes />
                </div>

                <div className="o-mt-8 o-grid o-gap-8 sm:o-grid-cols-12 sm:o-items-center">
                  <div className="sm:o-col-span-5">
                    <CadranDeMarche marche={calibre.marche} amplitude={calibre.amplitude} />
                  </div>
                  <dl className="o-m-0 sm:o-col-span-7">
                    <Valeur quoi="Alternances a l heure">{nombre(calibre.alternances)}</Valeur>
                    <Valeur quoi="Battements par seconde" note={`Soit ${nombre(cadence.hertz, 1)} hertz au balancier : une oscillation vaut deux alternances.`}>
                      {nombre(cadence.battements, 0)}
                    </Valeur>
                    <Valeur quoi={`Tours de la roue d echappement, par minute`} note={`${String(DENTS)} dents, une lachee par alternance.`}>
                      {nombre(cadence.toursParMinute, 0)}
                    </Valeur>
                    <Valeur quoi="Alternances comptees en un jour" note={`Reserve de marche : ${String(calibre.reserve)} heures, barillet arme a fond.`}>
                      {nombre(cadence.parJour)}
                    </Valeur>
                  </dl>
                </div>
              </div>
            </div>
          </section>

          {/*
            ----- Le manifeste : une phrase seule, sur son ecran --------------
          */}
          <section
            id="calibres"
            className="o-flex o-scroll-mt-24 o-flex-col o-justify-center o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-12"
            style={{ minHeight: '70vh', backgroundColor: accentDoux(800, 10) }}
          >
            <Manifeste eteint="Une montre a quartz est plus juste que la notre, elle coute vingt fois moins cher, et personne ne la fait reparer.">
              Un mecanisme se repare, se regle, et se transmet. C est tout ce que nous vendons.
            </Manifeste>
            <dl className="o-m-0 o-mt-16 o-grid o-gap-x-10 o-gap-y-2 md:o-grid-cols-4">
              {CALIBRES.map((c) => (
                <div key={c.cle} className="o-border-t o-border-white-10 o-py-5">
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: c.cle === cle ? encreSurSombre() : 'var(--o-palette-stone-400)' }}>
                    {c.reference} — {c.nom}
                  </dt>
                  <dd className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-stone-300">
                    {nombre(c.alternances)} A / h · {String(c.reserve)} h de reserve · {c.diametre} sur {c.hauteur}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/*
            ----- La carte de visite, qu on retourne -------------------------
          */}
          <section
            id="atelier"
            className="o-flex o-scroll-mt-24 o-flex-col o-items-center o-justify-center o-gap-10 o-border-t o-border-white-10 o-px-6 o-py-24"
            style={{ minHeight: ECRAN }}
          >
            <p className="o-m-0 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
              L atelier se visite sur rendez-vous — retournez la carte
            </p>

            <FlipCard
              className="o-w-full o-max-w-lg o-cursor-pointer"
              duration={760}
              front={
                <div
                  className="o-relative o-flex o-h-full o-flex-col o-justify-between o-overflow-hidden o-rounded-sm o-border-w-1 o-border-white-20 o-p-8"
                  style={{ backgroundColor: accentDoux(900, 22), aspectRatio: '85 / 54' }}
                >
                  {/* Le poincon de la maison : un balancier grave, en creux. */}
                  <svg viewBox="0 0 140 140" aria-hidden="true" className="o-pointer-events-none o-absolute o-right-6 o-top-1/2 o-w-32 o-opacity-40" style={{ transform: 'translateY(-50%)' }} fill="none">
                    <path d={spirale(70, 70, 4, 30, 8)} stroke={accent(300)} strokeWidth="1" />
                    <circle cx="70" cy="70" r="54" stroke={accent(300)} strokeWidth="5" />
                    <path d="M16 70 H124 M70 16 V124" stroke={accent(300)} strokeWidth="3" />
                    <circle cx="70" cy="70" r="7" fill={accent(300)} />
                  </svg>
                  <div className="o-relative o-flex o-items-start o-justify-between o-gap-6">
                    <p className="o-m-0" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Balancier</p>
                    <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">Est. 1974</span>
                  </div>
                  <div className="o-relative">
                    <p className="o-m-0 o-text-sm o-text-stone-200">Atelier d horlogerie mecanique</p>
                    <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                      14 rue des Granges — 25000 Besancon
                    </p>
                  </div>
                </div>
              }
              back={
                <div
                  className="o-flex o-h-full o-flex-col o-justify-between o-rounded-sm o-border-w-1 o-p-8"
                  style={{ ...aplat(), aspectRatio: '85 / 54', borderColor: 'transparent' }}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-opacity-70">Au verso</p>
                  <dl className="o-m-0 o-flex o-flex-col o-gap-1.5 o-text-sm">
                    {([
                      ['Rendez-vous', 'Du mardi au vendredi, 9 h - 12 h et 14 h - 18 h'],
                      ['A apporter', 'La montre, son ecrin, et le bulletin s il existe'],
                      ['Devis', 'Sous quinze jours, apres demontage complet'],
                    ] as const).map(([quoi, valeur]) => (
                      <div key={quoi} className="o-grid o-gap-x-4 sm:o-grid-cols-12">
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-opacity-70 sm:o-col-span-4">{quoi}</dt>
                        <dd className="o-m-0 sm:o-col-span-8">{valeur}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest">atelier@balancier-horlogerie.fr</p>
                </div>
              }
            />

            <a
              href="mailto:atelier@balancier-horlogerie.fr"
              className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-white-20 o-px-7 o-py-3 o-text-sm o-font-semibold o-text-stone-50 o-no-underline o-transition-colors hover:o-bg-white-10 focus:o-ring"
            >
              Demander un rendez-vous
              <Icon icon={ArrowUpRight} size={17} aria-hidden="true" />
            </a>
          </section>
        </main>

        {/*
          ----- Le pied : l etiquette de la piece --------------------------

          Pas un plan du site : l etiquette qu on trouve dans la boite, avec sa
          composition, son origine et son numero de lot.
        */}
        <footer className="o-relative o-z-10 o-border-t o-border-white-10 o-px-6 o-pb-10 o-pt-14 md:o-px-12" style={{ backgroundColor: 'var(--o-palette-stone-950)' }}>
          <div className="o-mx-auto o-max-w-5xl o-rounded-sm o-border-w-1 o-border-white-20 o-p-6 md:o-p-10">
            <div className="o-flex o-flex-wrap o-items-start o-justify-between o-gap-6 o-border-b o-border-white-10 o-pb-6">
              <div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">Etiquette de la piece</p>
                <p className="o-m-0 o-mt-2" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                  Balancier {calibre.reference} — {calibre.nom}
                </p>
              </div>
              <CodeBarres graine={`${calibre.reference.replace('-', '')}-2026-041`} />
            </div>

            <dl className="o-m-0 o-mt-2">
              {ETIQUETTE.map(([terme, valeur]) => (
                <div key={terme} className="o-grid o-gap-x-6 o-gap-y-1 o-border-b o-border-white-10 o-py-4 sm:o-grid-cols-12">
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400 sm:o-col-span-3">{terme}</dt>
                  <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-300 sm:o-col-span-9">{valeur}</dd>
                </div>
              ))}
              <div className="o-grid o-gap-x-6 o-gap-y-1 o-py-4 sm:o-grid-cols-12">
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400 sm:o-col-span-3">Lot</dt>
                <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-stone-200 sm:o-col-span-9">
                  {calibre.reference} / 2026 / 041 — serie de quarante, {nombre(calibre.alternances)} A / h, marche {signe(calibre.marche)} s / j
                </dd>
              </div>
            </dl>
          </div>

          <div className="o-mx-auto o-mt-10 o-flex o-max-w-5xl o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
            <span>© 2026 Balancier</span>
            <span>14 rue des Granges, 25000 Besancon — sur rendez-vous</span>
            <a href="#haut" className="o-text-stone-400 o-no-underline hover:o-text-stone-50 focus:o-ring">Remonter ↑</a>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
