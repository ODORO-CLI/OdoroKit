/**
 * Grand Foyer — opera municipal.
 *
 * ## Le mecanisme : la salle
 *
 * Une billetterie d opera vend cinq categories. Une salle, elle, a mille huit
 * cent quarante-deux places, et pas deux qui voient la meme chose. La page
 * dessine donc le plan reel — parterre, corbeille, loges laterales, paradis —
 * et **chaque siege est cliquable**. Ce qu il donne se calcule, il ne se
 * raconte pas :
 *
 * - la **distance** au nu du rideau, en metres, tiree du rang ;
 * - le **decalage lateral**, de l axe au bord, et l angle qu il impose ;
 * - la **hauteur** au-dessus du plateau, qui plonge la vue ;
 * - la **visibilite** — totale, partielle, reduite — d ou decoulent la
 *   categorie et le prix, et non l inverse ;
 * - la **vue depuis le siege**, dessinee : le cadre de scene se decentre,
 *   s aplatit et s eloigne selon ces quatre nombres, les tetes des rangs de
 *   devant montent quand on est au parterre, et un pilier coupe l avant-scene
 *   depuis les loges qui en ont un.
 *
 * Le billet (forme A43) se compose sur le siege choisi, recto verso.
 *
 * ## Le volume
 *
 * Le lustre est la seule surface graphique de la page, et il en est le sujet :
 * trois couronnes de bras, trente bougies, des pendeloques, en three.js. La
 * camera en fait le tour au defilement — la piste est l enveloppe de la scene
 * collee, plus haute que cinq ecrans. Sous mouvement reduit ou sans WebGL, le
 * repli dessine montre le meme lustre, au trait.
 *
 * Signature de mouvement : **M-epingle**. Quatre actes passent sur le lustre.
 * Le pied porte un plan de salle (forme P44) ; les chiffres de la maison sont
 * poses sur une frise chronologique (forme C29).
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, Ticket } from '@odoro-cli/icons/filaire'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { SpotlightText } from '@/odoro/text/SpotlightText.jsx'
import { FlipCard } from '@/odoro/ui/FlipCard.jsx'

import { Filigrane, nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreFilet,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import { Epingle } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#salle', 'La salle'],
  ['#maison', 'La maison'],
  ['#billet', 'Le billet'],
]

/** Le serif d affichage, ferme : Syne en 300 se dilue sur le noir. */
function scene(corps: 'm' | 'l' | 'xl'): CSSProperties {
  return { ...affiche(corps, 400), letterSpacing: '-0.03em' }
}

/* ============================ La salle ================================= */

/** Un siege, avec ce qu il voit. */
interface Siege {
  readonly id: string
  readonly zone: 'parterre' | 'corbeille' | 'loge' | 'paradis'
  readonly rang: string
  readonly numero: number
  /** Coordonnees sur le plan dessine. */
  readonly x: number
  readonly y: number
  /** Metres au nu du rideau. */
  readonly distance: number
  /** Decalage lateral, de -1 (jardin) a 1 (cour). */
  readonly lateral: number
  /** Metres au-dessus du plateau. */
  readonly hauteur: number
  readonly visibilite: 'totale' | 'partielle' | 'reduite'
  readonly categorie: number
  readonly prix: number
}

/** Les cinq categories de la maison, en euros. */
const TARIFS = [95, 69, 48, 32, 19]

/**
 * La categorie d un siege.
 *
 * Elle n est pas decidee zone par zone — c est ce que font les billetteries,
 * et c est pour cela qu on paie le meme prix a deux places qui ne voient pas
 * la meme chose. Ici elle sort d un score : la distance, l angle qu impose le
 * decalage lateral, et la hauteur qui plonge la vue.
 */
function categorieDe(distance: number, lateral: number, hauteur: number, visibilite: Siege['visibilite']): number {
  if (visibilite === 'reduite') return 5
  const score = distance + Math.abs(lateral) * 9 + hauteur * 0.55
  const brute = score < 14 ? 1 : score < 19 ? 2 : score < 24 ? 3 : score < 30 ? 4 : 5
  return visibilite === 'partielle' ? Math.min(5, brute + 1) : brute
}

/** Fabrique un siege a partir de sa geometrie. */
function siege(
  base: Omit<Siege, 'categorie' | 'prix'>,
): Siege {
  const categorie = categorieDe(base.distance, base.lateral, base.hauteur, base.visibilite)
  return { ...base, categorie, prix: TARIFS[categorie - 1] ?? 19 }
}

/**
 * Le plan de la salle, dresse une fois.
 *
 * Une salle a l italienne : un parterre en arc, une corbeille au-dessus, des
 * loges sur les cotes, un paradis tout en haut. Les coordonnees sont celles
 * du dessin ; les metres, ceux de la salle.
 */
function dresserLaSalle(): readonly Siege[] {
  const sieges: Siege[] = []

  // Le parterre : douze rangs en arc, vingt fauteuils par rang.
  for (let rang = 0; rang < 12; rang += 1) {
    const nombre = 20
    const milieu = (nombre - 1) / 2
    for (let i = 0; i < nombre; i += 1) {
      const ecart = i - milieu
      const lateral = ecart / milieu
      const x = 300 + ecart * (17 + rang * 0.5)
      const y = 152 + rang * 19 + Math.abs(ecart) * Math.abs(ecart) * 0.09
      const distance = 8.5 + rang * 1.05
      // Les trois premiers rangs de cote plongent dans la fosse et perdent
      // le fond du plateau : c est un fait de salle, pas une categorie.
      const visibilite = rang < 3 && Math.abs(lateral) > 0.75 ? 'partielle' : 'totale'
      sieges.push(siege({ id: `p-${String(rang)}-${String(i)}`, zone: 'parterre', rang: `Rang ${String(rang + 1)}`, numero: i + 1, x, y, distance, lateral, hauteur: 0, visibilite }))
    }
  }

  // La corbeille : deux rangs, six metres au-dessus du plateau.
  for (let rang = 0; rang < 2; rang += 1) {
    const nombre = 24
    const milieu = (nombre - 1) / 2
    for (let i = 0; i < nombre; i += 1) {
      const ecart = i - milieu
      const lateral = (ecart / milieu) * 0.82
      sieges.push(
        siege({
          id: `c-${String(rang)}-${String(i)}`,
          zone: 'corbeille',
          rang: `Corbeille, rang ${String(rang + 1)}`,
          numero: i + 1,
          x: 300 + ecart * 19,
          y: 408 + rang * 18,
          distance: 19 + rang * 1.2,
          lateral,
          hauteur: 6,
          visibilite: 'totale',
        }),
      )
    }
  }

  // Les loges laterales : quatre de chaque cote, trois places par loge.
  for (const cote of [-1, 1]) {
    for (let ordre = 0; ordre < 4; ordre += 1) {
      for (let place = 0; place < 3; place += 1) {
        // La loge d avant-scene ne voit pas le fond du plateau ; la place du
        // fond de loge voit par-dessus une epaule.
        const visibilite = ordre === 0 ? 'reduite' : place === 2 ? 'partielle' : 'totale'
        sieges.push(
          siege({
            id: `l-${String(cote)}-${String(ordre)}-${String(place)}`,
            zone: 'loge',
            rang: `Loge ${cote === -1 ? 'jardin' : 'cour'} ${String(ordre + 1)}`,
            numero: place + 1,
            x: 300 + cote * (236 + place * 14),
            y: 168 + ordre * 62,
            distance: 11 + ordre * 3.4 + place * 0.8,
            lateral: cote * (0.86 - ordre * 0.05),
            hauteur: 6,
            visibilite,
          }),
        )
      }
    }
  }

  // Le paradis : trois rangs, seize metres au-dessus du plateau.
  for (let rang = 0; rang < 3; rang += 1) {
    const nombre = 26
    const milieu = (nombre - 1) / 2
    for (let i = 0; i < nombre; i += 1) {
      const ecart = i - milieu
      sieges.push(
        siege({
          id: `d-${String(rang)}-${String(i)}`,
          zone: 'paradis',
          rang: `Paradis, rang ${String(rang + 1)}`,
          numero: i + 1,
          x: 300 + ecart * 18,
          y: 452 + rang * 16,
          distance: 27 + rang * 1.1,
          lateral: (ecart / milieu) * 0.7,
          hauteur: 16,
          // Le dernier rang du paradis regarde par-dessus une rambarde.
          visibilite: rang === 2 ? 'partielle' : 'totale',
        }),
      )
    }
  }

  return sieges
}

/**
 * Le plan, dresse une fois pour toutes.
 *
 * Il ne depend d aucun etat : le calculer au module plutot qu au rendu evite
 * de le refaire a chaque changement de siege, et donne un premier siege sur
 * lequel la page peut toujours retomber.
 */
const SALLE = dresserLaSalle()

/** Le siege par defaut : celui du milieu du parterre, sixieme rang. */
const PREMIER: Siege =
  SALLE.find((s) => s.id === 'p-5-9') ??
  siege({ id: 'p-5-9', zone: 'parterre', rang: 'Rang 6', numero: 10, x: 300, y: 247, distance: 13.75, lateral: -0.05, hauteur: 0, visibilite: 'totale' })

/** Les quatre zones, avec ce qu il faut en dire. */
const ZONES = [
  { cle: 'parterre', nom: 'Parterre', note: 'Douze rangs, de plain-pied. Le son y est le plus plein, la vue la plus frontale.' },
  { cle: 'corbeille', nom: 'Corbeille', note: 'Deux rangs en surplomb. On voit les deplacements au sol comme sur une carte.' },
  { cle: 'loge', nom: 'Loges', note: 'Quatre de chaque cote. On y vient a trois, et la troisieme place voit moins.' },
  { cle: 'paradis', nom: 'Paradis', note: 'Seize metres au-dessus du plateau. Le meilleur son de la salle, et le moins cher.' },
] as const

/* ============================ Le plan dessine ========================== */

/** La couleur d un siege, selon sa categorie et son etat. */
function teinteSiege(s: Siege, choisi: boolean): string {
  if (choisi) return 'var(--o-palette-zinc-50)'
  const nuances = [300, 400, 500, 700, 800]
  return accent(nuances[s.categorie - 1] ?? 700)
}

/** Le plan de salle, en SVG, chaque siege cliquable. */
function PlanDeSalle({
  sieges,
  choisi,
  onChoisir,
}: {
  readonly sieges: readonly Siege[]
  readonly choisi: string
  readonly onChoisir: (id: string) => void
}): ReactElement {
  return (
    <svg viewBox="0 0 600 510" className="o-h-auto o-w-full" role="group" aria-label="Plan de la salle">
      {/* Le plateau et la fosse. */}
      <path d="M120 26h360l-26 58H146Z" fill={accentDoux(800, 40)} stroke={accent(600)} strokeOpacity="0.5" />
      <text x="300" y="62" textAnchor="middle" className="o-font-mono" fontSize="13" fill="var(--o-palette-zinc-300)" letterSpacing="4">
        PLATEAU
      </text>
      <path d="M150 96h300a150 150 0 0 1-300 0Z" fill={accentDoux(900, 55)} stroke={accent(700)} strokeOpacity="0.5" />
      <text x="300" y="122" textAnchor="middle" className="o-font-mono" fontSize="10" fill="var(--o-palette-zinc-400)" letterSpacing="3">
        FOSSE — 72 MUSICIENS
      </text>

      {/* Les balcons, esquisses au trait. */}
      <path d="M84 392h432" stroke={accent(700)} strokeOpacity="0.55" />
      <path d="M84 436h432" stroke={accent(700)} strokeOpacity="0.4" />

      {sieges.map((s) => {
        const pris = s.id === choisi
        return (
          <rect
            key={s.id}
            x={s.x - 6}
            y={s.y - 5}
            width={12}
            height={10}
            rx={2}
            fill={teinteSiege(s, pris)}
            stroke={pris ? 'var(--o-palette-zinc-50)' : 'transparent'}
            strokeWidth={pris ? 3 : 0}
            className="o-cursor-pointer focus:o-ring"
            tabIndex={0}
            role="button"
            aria-pressed={pris}
            aria-label={`${s.rang}, place ${String(s.numero)} — categorie ${String(s.categorie)}, ${String(s.prix)} euros`}
            onClick={() => {
              onChoisir(s.id)
            }}
            onKeyDown={(evenement) => {
              if (evenement.key === 'Enter' || evenement.key === ' ') {
                evenement.preventDefault()
                onChoisir(s.id)
              }
            }}
          />
        )
      })}

      {/* Les reperes de zone, en mono. */}
      {(
        [
          [300, 400, 'CORBEILLE'],
          [300, 500, 'PARADIS'],
          [64, 176, 'LOGES'],
          [536, 176, 'LOGES'],
        ] as const
      ).map(([x, y, mot]) => (
        <text key={mot + String(x)} x={x} y={y} textAnchor="middle" className="o-font-mono" fontSize="9" fill="var(--o-palette-zinc-500)" letterSpacing="3">
          {mot}
        </text>
      ))}
    </svg>
  )
}

/* ============================ La vue depuis le siege =================== */

/**
 * Ce que voit le siege choisi, dessine a partir de ses quatre nombres.
 *
 * Le cadre de scene se decentre avec le decalage lateral, s aplatit du meme
 * mouvement — une ouverture vue de biais est plus etroite — et se reduit avec
 * la distance. La hauteur le fait descendre dans le champ et decouvre le
 * plancher. Les tetes des rangs de devant ne sont la qu au parterre.
 */
function VueDuSiege({ s }: { readonly s: Siege }): ReactElement {
  const echelle = Math.max(0.42, 14 / s.distance)
  const largeur = 260 * echelle * (1 - Math.abs(s.lateral) * 0.42)
  const hauteurCadre = 150 * echelle
  const cx = 180 - s.lateral * 96
  const cy = 116 + s.hauteur * 2.6 - hauteurCadre * 0.5
  const tetes = s.zone === 'parterre' ? Math.max(0, 14 - Math.round(s.distance / 3)) : 0

  return (
    <svg viewBox="0 0 360 240" className="o-h-auto o-w-full" aria-hidden="true">
      <rect width="360" height="240" fill="var(--o-palette-zinc-950)" />

      {/* Le mur et la voute de la salle. */}
      <path d="M0 0h360v240H0Z" fill={accentDoux(950, 30)} />
      <path d="M0 26q180 -34 360 0" stroke={accent(800)} strokeOpacity="0.6" fill="none" />

      {/* Le cadre de scene. */}
      <g>
        <rect
          x={cx - largeur / 2}
          y={cy}
          width={largeur}
          height={hauteurCadre}
          fill="var(--o-palette-zinc-900)"
          stroke={accent(500)}
          strokeWidth="2"
        />
        {/* Le decor : trois plans, du fond au nu du rideau. */}
        <rect x={cx - largeur / 2 + 10} y={cy + hauteurCadre * 0.45} width={largeur - 20} height={hauteurCadre * 0.55 - 6} fill={accentDoux(700, 45)} />
        <path
          d={`M${String(cx - largeur * 0.2)} ${String(cy + hauteurCadre - 6)}l${String(largeur * 0.1)} ${String(-hauteurCadre * 0.4)}l${String(largeur * 0.1)} ${String(hauteurCadre * 0.4)}Z`}
          fill={accent(400)}
          opacity="0.75"
        />
        <circle cx={cx + largeur * 0.16} cy={cy + hauteurCadre * 0.62} r={Math.max(3, hauteurCadre * 0.07)} fill={accent(200)} />
        {/* Les pendrillons. */}
        <rect x={cx - largeur / 2} y={cy} width={largeur * 0.09} height={hauteurCadre} fill="var(--o-palette-zinc-950)" opacity="0.85" />
        <rect x={cx + largeur / 2 - largeur * 0.09} y={cy} width={largeur * 0.09} height={hauteurCadre} fill="var(--o-palette-zinc-950)" opacity="0.85" />
      </g>

      {/* Le plancher, d autant plus visible qu on est haut. */}
      {s.hauteur > 0 && (
        <path
          d={`M${String(cx - largeur / 2)} ${String(cy + hauteurCadre)}L${String(cx - largeur * 0.62)} 240h${String(largeur * 1.24)}L${String(cx + largeur / 2)} ${String(cy + hauteurCadre)}Z`}
          fill={accentDoux(800, 26)}
        />
      )}

      {/* Le pilier de loge, quand il y en a un. */}
      {s.zone === 'loge' && (
        <rect
          x={s.lateral < 0 ? 0 : 320}
          y="0"
          width="40"
          height="240"
          fill="var(--o-palette-zinc-950)"
          stroke={accent(800)}
        />
      )}

      {/* La rambarde du paradis. */}
      {s.zone === 'paradis' && <rect x="0" y="206" width="360" height="10" fill="var(--o-palette-zinc-950)" stroke={accent(800)} />}

      {/* Les tetes des rangs de devant. */}
      {Array.from({ length: tetes }, (_, rang) => {
        const y = 238 - rang * 7
        const taille = 15 - rang * 0.7
        return (
          <g key={rang} opacity={0.9 - rang * 0.05}>
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={34 + i * 50 + (rang % 2) * 25} cy={y} r={taille} fill="var(--o-palette-zinc-950)" />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/* ============================ Les actes ================================ */

/** Les quatre actes qui passent sur le lustre. */
const ACTES = [
  {
    mot: 'Le lustre',
    titre: 'Deux mille quatre cents pieces, descendues une fois l an.',
    texte: 'Il pese onze cents kilos et tient a un treuil de 1889. On le descend en aout, on le lave piece a piece, on le remonte en dix jours.',
  },
  {
    mot: 'La salle',
    titre: 'Mille huit cent quarante-deux places, et pas deux pareilles.',
    texte: 'Une salle a l italienne n a pas de bonne categorie : elle a des places, et chacune voit ce qu elle voit. C est ecrit plus bas, siege par siege.',
  },
  {
    mot: 'La fosse',
    titre: 'Soixante-douze musiciens, sous le niveau du parterre.',
    texte: 'La fosse se remonte en trois hauteurs. A la plus basse, on entend l orchestre sans le voir — et c est la que Wagner se donne.',
  },
  {
    mot: 'Le foyer',
    titre: 'On y entre a dix-neuf heures, on en ressort a vingt.',
    texte: 'Le grand foyer ouvre une heure avant. Il n y a rien a y acheter, et c est la moitie du billet.',
  },
] as const

/* ============================ La frise (C29) =========================== */

/** Une date de la maison, et le chiffre qui lui appartient. */
const FRISE = [
  { annee: '1834', valeur: '2 200', quoi: 'places a l ouverture, bancs compris' },
  { annee: '1872', valeur: '11', quoi: 'minutes pour evacuer, la nuit de l incendie' },
  { annee: '1889', valeur: '1 842', quoi: 'places a la reouverture, fauteuils individuels' },
  { annee: '1954', valeur: '96', quoi: 'jeux d orgue electrifies, les becs de gaz deposes' },
  { annee: '2003', valeur: '38', quoi: 'mois de chantier, la salle rendue a sa polychromie' },
  { annee: '2026', valeur: '118', quoi: 'representations, dont 24 a moins de vingt euros' },
] as const

/* ============================ Le repli dessine ========================= */

/**
 * Le lustre, au trait.
 *
 * Le repli doit montrer la meme chose que la scene : trois couronnes, des
 * bras recourbes, des bougies, des pendeloques. Une page dont le sujet
 * disparait sous mouvement reduit n a pas de sujet.
 */
function LustreDessine(): ReactElement {
  const couronnes = [
    { y: 96, rayon: 132, bras: 12 },
    { y: 168, rayon: 100, bras: 10 },
    { y: 230, rayon: 68, bras: 8 },
  ]
  return (
    <svg viewBox="0 0 340 400" className="o-h-full o-w-full" aria-hidden="true" fill="none">
      <g stroke={encreSurSombre()} strokeWidth="1.4" strokeLinecap="round">
        {/* La tige et la rosace. */}
        <path d="M170 0v54M148 54h44l-8 18h-28Z" />
        <path d="M170 72v244" />
        {couronnes.map((couronne) => (
          <g key={couronne.y}>
            <ellipse cx="170" cy={couronne.y} rx={couronne.rayon} ry={couronne.rayon * 0.26} opacity="0.85" />
            {Array.from({ length: couronne.bras }, (_, rang) => {
              const angle = (rang / couronne.bras) * Math.PI * 2
              const x = 170 + Math.cos(angle) * couronne.rayon
              const y = couronne.y + Math.sin(angle) * couronne.rayon * 0.26
              return (
                <g key={rang}>
                  <path d={`M170 ${String(couronne.y - 14)}Q${String((170 + x) / 2)} ${String(y - 26)} ${String(x)} ${String(y)}`} opacity="0.7" />
                  <path d={`M${String(x)} ${String(y)}v-13`} />
                  <path d={`M${String(x)} ${String(y - 13)}q3 -7 0 -10q-3 3 0 10`} fill={accent(300)} stroke="none" />
                  <path d={`M${String(x)} ${String(y + 3)}l4 9 -4 9 -4 -9Z`} opacity="0.6" />
                </g>
              )
            })}
          </g>
        ))}
        {/* Le culot. */}
        <path d="M154 316h32l-16 34Z" />
      </g>
    </svg>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('syne')
  const { reduced } = useMotionState()
  const [choisi, setChoisi] = useState(PREMIER.id)
  const place = useMemo(() => SALLE.find((s) => s.id === choisi) ?? PREMIER, [choisi])

  // La piste : l enveloppe de la scene collee. Sans elle, la trajectoire de
  // camera serait mesuree sur le canevas, qui fait une hauteur d ecran — la
  // course vaudrait zero et la camera ne bougerait jamais.
  const [piste, setPiste] = useState<HTMLElement | null>(null)

  // Le lustre est monte une fois : changer d acte au-dessus de lui ne doit
  // pas le reconstruire.
  const lustre = useMemo(
    () => (
      <Volume
        nom="lustre"
        className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
        piste={piste}
        trajectoire={[
          { at: 0, position: [0, -3.1, 6.8], lookAt: [1.1, 0.4, 0] },
          { at: 0.34, position: [3.4, -1.2, 5.2], lookAt: [1.2, 0.2, 0] },
          { at: 0.68, position: [-1.9, 1.1, 4.6], lookAt: [1.1, 0, 0] },
          { at: 1, position: [1.1, 2.6, 3.6], lookAt: [1.4, -0.5, 0] },
        ]}
        repli={
          <div className="o-flex o-h-full o-items-center o-justify-center o-p-12 o-opacity-70">
            <LustreDessine />
          </div>
        }
        construire={(contexte) => {
          const { scene: toile, camera, three } = contexte
          const laiton = teinte('--o-vitrine-300', '#d8b878')
          const cristal = teinte('--o-vitrine-100', '#f4e6c8')

          const groupe = new three.Group()

          const matiereLaiton = new three.MeshStandardMaterial({ color: laiton, metalness: 0.92, roughness: 0.26 })
          const matiereCristal = new three.MeshPhysicalMaterial({
            color: cristal,
            metalness: 0,
            roughness: 0.04,
            transmission: 0.6,
            thickness: 0.4,
            transparent: true,
            opacity: 0.72,
            clearcoat: 1,
          })
          const matiereFlamme = new three.MeshBasicMaterial({ color: cristal })

          // Les geometries sont creees une fois et partagees par les trente
          // bras : trente copies distinctes seraient trente fois le meme
          // maillage en memoire, et trente `dispose` a ne pas oublier.
          const tige = new three.CylinderGeometry(0.07, 0.1, 2.5, 12)
          const rosace = new three.ConeGeometry(0.42, 0.4, 16)
          const culot = new three.ConeGeometry(0.22, 0.46, 12)
          const bras = new three.TorusGeometry(0.3, 0.022, 6, 18, Math.PI * 0.62)
          const bougie = new three.CylinderGeometry(0.035, 0.04, 0.24, 8)
          const flamme = new three.ConeGeometry(0.05, 0.17, 8)
          const goutte = new three.OctahedronGeometry(0.065, 0)
          const couronnes = [
            new three.TorusGeometry(1.5, 0.02, 6, 56),
            new three.TorusGeometry(1.14, 0.02, 6, 48),
            new three.TorusGeometry(0.78, 0.02, 6, 40),
          ]

          const axe = new three.Mesh(tige, matiereLaiton)
          axe.position.y = 0.1
          const chapeau = new three.Mesh(rosace, matiereLaiton)
          chapeau.position.y = 1.5
          const pied = new three.Mesh(culot, matiereLaiton)
          pied.position.y = -1.35
          pied.rotation.x = Math.PI
          groupe.add(axe, chapeau, pied)

          const etages = [
            { rayon: 1.5, y: 0.44, nombre: 12, anneau: couronnes[0] },
            { rayon: 1.14, y: -0.16, nombre: 10, anneau: couronnes[1] },
            { rayon: 0.78, y: -0.72, nombre: 8, anneau: couronnes[2] },
          ]

          const bougies: unknown[] = []
          for (const etage of etages) {
            if (etage.anneau === undefined) continue
            const cercle = new three.Mesh(etage.anneau, matiereLaiton)
            cercle.position.y = etage.y
            cercle.rotation.x = Math.PI / 2
            groupe.add(cercle)

            for (let rang = 0; rang < etage.nombre; rang += 1) {
              const angle = (rang / etage.nombre) * Math.PI * 2
              const cos = Math.cos(angle)
              const sin = Math.sin(angle)

              const courbe = new three.Mesh(bras, matiereLaiton)
              courbe.position.set(cos * (etage.rayon - 0.3), etage.y + 0.06, sin * (etage.rayon - 0.3))
              courbe.rotation.set(Math.PI / 2, 0, -angle + Math.PI / 2)
              groupe.add(courbe)

              const cire = new three.Mesh(bougie, matiereCristal)
              cire.position.set(cos * etage.rayon, etage.y + 0.2, sin * etage.rayon)
              const feu = new three.Mesh(flamme, matiereFlamme)
              feu.position.set(cos * etage.rayon, etage.y + 0.41, sin * etage.rayon)
              bougies.push(feu)

              const pendeloque = new three.Mesh(goutte, matiereCristal)
              pendeloque.position.set(cos * (etage.rayon - 0.16), etage.y - 0.26, sin * (etage.rayon - 0.16))
              groupe.add(cire, feu, pendeloque)
            }
          }

          groupe.position.set(1.5, 0.85, 0)
          toile.add(groupe)

          // Sans lumiere de contour ni lampe de dessous, un lustre en laiton
          // est une tache noire : c est le defaut qu a eu la page modele.
          eclairer(contexte, { cle: 0xffe6bb, remplissage: 0x6b7fb8, contour: 0xfff3dc, force: 1.15 })
          const chaleur = new three.PointLight(0xffcf8a, 34, 14, 2)
          chaleur.position.set(1.5, 0.7, 0)
          const dessous = new three.PointLight(0xffe0b0, 16, 12, 2)
          dessous.position.set(1.7, -1.6, 1.8)
          toile.add(chaleur, dessous)

          camera.position.set(0, -3.1, 6.8)
          camera.lookAt(1.1, 0.4, 0)

          return () => {
            matiereLaiton.dispose()
            matiereCristal.dispose()
            matiereFlamme.dispose()
            tige.dispose()
            rosace.dispose()
            culot.dispose()
            bras.dispose()
            bougie.dispose()
            flamme.dispose()
            goutte.dispose()
            for (const anneau of couronnes) anneau.dispose()
          }
        }}
        animer={({ scene: toile }, { delta, time }) => {
          const groupe = toile.children[0]
          if (groupe === undefined) return
          // Un lustre suspendu tourne a peine, et il balance. Les flammes,
          // elles, vacillent chacune a son rythme.
          groupe.rotation.y += delta * 0.11
          groupe.rotation.z = Math.sin(time * 0.32) * 0.014
          groupe.rotation.x = Math.cos(time * 0.24) * 0.01
          let rang = 0
          for (const enfant of groupe.children) {
            const mesh = enfant as { readonly isMesh?: boolean; scale: { setScalar: (v: number) => void } }
            if (mesh.isMesh !== true) continue
            rang += 1
            if (rang % 4 !== 1) continue
            mesh.scale.setScalar(0.92 + Math.sin(time * 6 + rang) * 0.08)
          }
        }}
      />
    ),
    [piste],
  )

  return (
    <Porte forme="trou" marque="Grand Foyer">
      <div className="o-relative o-text-zinc-50" style={{ ...polices, ...nuit('zinc') }}>
        {/*
          ----- Le lustre, et ce qui passe devant ------------------------------
        */}
        <div ref={setPiste} className="o-relative">
          <div className="o-sticky o-z-0 o-overflow-hidden" style={{ top: CHROME, height: ECRAN }}>
            <div
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-0"
              style={{
                background: [
                  `radial-gradient(46% 42% at 64% 30%, ${accentDoux(400, 52)}, transparent 72%)`,
                  `radial-gradient(76% 62% at 22% 96%, ${accentDoux(900, 46)}, transparent 76%)`,
                ].join(', '),
              }}
            />
            {lustre}
            <div
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-0"
              style={{
                background:
                  'linear-gradient(to top, var(--o-palette-zinc-950) 2%, color-mix(in oklab, var(--o-palette-zinc-950) 62%, transparent) 44%, transparent 78%)',
              }}
            />
            <Grain opacite={0.07} />
          </div>

          <div className="o-relative o-z-10" style={{ marginTop: `calc(-1 * ${ECRAN})` }}>
            {/* L ouverture. */}
            {/*
              Le decoupage est pose sur le heros et non sur la page : le
              filigrane est un mot de trois cents pixels de haut, plus large que
              tout ecran, et la scene collee vit chez le parent — la clipper ici
              ne lui fait rien.
            */}
            <section id="haut" className="o-relative o-flex o-flex-col o-overflow-hidden" style={{ minHeight: ECRAN }}>
              <BarreFilet marque="Grand Foyer" liens={NAVIGATION} action={['#billet', 'Billetterie']} />
              <Filigrane taille={24} opacite={6} className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-2 o-z-0">
                GRAND FOYER
              </Filigrane>

              <div className="o-relative o-z-10 o-flex o-grow o-flex-col o-justify-end o-px-6 o-pb-20 o-pt-14 md:o-px-14 md:o-pb-24">
                <Surgit>
                  <Etiquette>Opera municipal — saison 2026, cent dix-huit representations</Etiquette>
                </Surgit>
                <TitreVague
                  delai={130}
                  className="o-m-0 o-mt-7 o-max-w-4xl"
                  style={{ ...scene('l'), fontSize: 'clamp(2.4rem, 7.2vw, 7.5rem)', lineHeight: 0.94 }}
                >
                  Choisissez le siege, pas la categorie.
                </TitreVague>
                <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                  <Surgit delai={540} as="p" className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300 md:o-col-span-6">
                    Le plan de la salle est entier, et chaque place dit sa distance, son angle, sa hauteur et ce qu elle voit du plateau.
                  </Surgit>
                  <Surgit delai={660} className="md:o-col-span-6 md:o-flex md:o-justify-end">
                    <Actions
                      pleine={['#salle', <>Ouvrir le plan <Icon icon={ArrowDown} size={16} aria-hidden="true" /></>]}
                      fantome={['#maison', 'La maison']}
                    />
                  </Surgit>
                </div>
              </div>
              <Coin position="bd">
                Guichet du mardi au samedi, 12 h — 19 h
                <br />
                Place de la Comedie
              </Coin>
            </section>

            {/* Les quatre actes, epingles sur le lustre. */}
            <Epingle ecrans={4} actes={ACTES.length}>
              {(acte, progression) => {
                const a = ACTES[acte] ?? ACTES[0]
                return (
                  <div className="o-relative o-flex o-h-full o-flex-col o-justify-between o-px-6 o-py-14 md:o-px-14 md:o-py-20">
                    <p
                      aria-hidden="true"
                      className="o-m-0 o-tabular-nums"
                      style={{ ...scene('xl'), fontSize: 'clamp(4rem, 15vw, 14rem)', lineHeight: 0.8, color: accentDoux(400, 34) }}
                    >
                      {String(acte + 1)}
                    </p>

                    <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                      <div className="md:o-col-span-4">
                        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                          Acte {String(acte + 1)} — {a.mot}
                        </p>
                      </div>
                      <div className="o-min-w-0 md:o-col-span-8">
                        <h2 className="o-m-0 o-max-w-3xl o-text-balance" style={{ ...scene('m'), fontSize: 'clamp(1.6rem, 4vw, 3.75rem)' }}>
                          {a.titre}
                        </h2>
                        <p className="o-m-0 o-mt-6 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300">{a.texte}</p>
                      </div>
                    </div>

                    {/* La rampe : la progression des actes, en creneaux. */}
                    <div aria-hidden="true" className="o-mt-8 o-flex o-gap-1.5">
                      {ACTES.map((autre, rang) => (
                        <span
                          key={autre.mot}
                          className="o-h-0.5 o-grow o-transition-all"
                          style={{
                            backgroundColor: rang <= acte ? encreSurSombre() : 'var(--o-palette-zinc-800)',
                            opacity: rang === acte ? 1 : 0.6,
                            transform: `scaleY(${rang === acte ? String(3 + (reduced ? 1 : progression) * 2) : '1'})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              }}
            </Epingle>
          </div>
        </div>

        <main className="o-relative o-z-10" style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}>
          {/*
            ----- Le mecanisme : la salle -----------------------------------------
          */}
          <section id="salle" className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-14 md:o-py-28">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01">La salle</Indice>
                <h2 className="o-m-0 o-mt-5 o-max-w-3xl" style={{ ...scene('m'), fontSize: 'clamp(1.75rem, 4vw, 3.75rem)' }}>
                  <SpotlightText as="span" radius={280} rest={0.62}>
                    Mille huit cent quarante-deux places, et ce que chacune voit.
                  </SpotlightText>
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                Cliquez un siege sur le plan :<br />la vue se redessine depuis lui
              </p>
            </div>

            <div className="o-mt-14 o-grid o-gap-12 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-7">
                <PlanDeSalle sieges={SALLE} choisi={choisi} onChoisir={setChoisi} />

                {/* La legende des categories. */}
                <ul className="o-m-0 o-mt-6 o-flex o-list-none o-flex-wrap o-gap-x-6 o-gap-y-2 o-p-0">
                  {TARIFS.map((prix, rang) => (
                    <li key={prix} className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      <span aria-hidden="true" className="o-size-3 o-rounded-sm" style={{ backgroundColor: accent([300, 400, 500, 700, 800][rang] ?? 700) }} />
                      Categorie {rang + 1} — {prix} EUR
                    </li>
                  ))}
                </ul>

                <dl className="o-m-0 o-mt-10 o-grid o-gap-x-8 o-gap-y-4 sm:o-grid-cols-2">
                  {ZONES.map((zone) => (
                    <div key={zone.cle} className="o-border-t o-border-white-10 o-pt-3">
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                        {zone.nom}
                      </dt>
                      <dd className="o-m-0 o-mt-1 o-text-sm o-leading-relaxed o-text-zinc-400">{zone.note}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* La vue depuis le siege, et ses quatre nombres. */}
              <div className="o-min-w-0 lg:o-col-span-5">
                <div className="o-border-w-1 o-border-white-10 o-p-5">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">La vue depuis ce siege</p>
                  <div className="o-mt-4 o-overflow-hidden">
                    <VueDuSiege s={place} />
                  </div>
                  <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-zinc-500">
                    Dessin calcule sur la distance, l angle et la hauteur du siege. Il ne remplace pas une visite, il en donne la geometrie.
                  </p>
                </div>

                <div aria-live="polite" className="o-mt-8">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                    Categorie {place.categorie}
                  </p>
                  <p className="o-m-0 o-mt-3" style={{ ...scene('m'), fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                    {place.rang}, place {place.numero}
                  </p>
                  <dl className="o-m-0 o-mt-7">
                    {(
                      [
                        ['Distance au rideau', `${place.distance.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} m`],
                        ['Hauteur sur le plateau', `${String(place.hauteur)} m`],
                        ['Ecart a l axe', `${String(Math.round(Math.abs(place.lateral) * 100))} %${place.lateral === 0 ? '' : place.lateral < 0 ? ' cote jardin' : ' cote cour'}`],
                        ['Visibilite', place.visibilite === 'totale' ? 'Totale' : place.visibilite === 'partielle' ? 'Partielle — un bord du plateau echappe' : 'Reduite — le fond du plateau ne se voit pas'],
                      ] as const
                    ).map(([quoi, valeur]) => (
                      <div key={quoi} className="o-grid o-gap-x-6 o-gap-y-1 o-border-t o-border-white-10 o-py-3 sm:o-grid-cols-12">
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 sm:o-col-span-6">{quoi}</dt>
                        <dd className="o-m-0 o-text-sm o-tabular-nums o-text-zinc-100 sm:o-col-span-6">{valeur}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="o-m-0 o-mt-8 o-tabular-nums" style={{ ...scene('m'), fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: encreSurSombre() }}>
                    {place.prix} EUR
                  </p>
                  <p className="o-m-0 o-mt-2 o-text-sm o-text-zinc-400">
                    {place.visibilite === 'reduite'
                      ? 'Visibilite reduite : le tarif est celui de la derniere categorie, et il est dit au guichet.'
                      : 'Tarif plein. Moins de vingt-six ans : dix euros, une heure avant, sur les places restantes.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/*
            ----- La maison : les chiffres sur la frise (C29) ---------------------
          */}
          <section id="maison" className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-14 md:o-py-28" style={{ backgroundColor: accentDoux(950, 32) }}>
            <Indice rang="02">La maison</Indice>
            <h2 className="o-m-0 o-mt-5 o-max-w-2xl" style={{ ...scene('m'), fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)' }}>
              Cent quatre-vingt-douze ans, un incendie, et une polychromie rendue.
            </h2>

            <ol className="o-m-0 o-mt-16 o-grid o-list-none o-gap-0 o-p-0 md:o-grid-cols-6">
              {FRISE.map((date, rang) => (
                <li key={date.annee} className="o-relative o-flex o-gap-5 o-pb-10 md:o-block md:o-pb-0 md:o-pr-6">
                  <span aria-hidden="true" className="o-absolute o-bottom-0 o-left-1.5 o-top-4 o-w-px o-bg-white-20 md:o-hidden" />
                  <span aria-hidden="true" className="o-absolute o-left-0 o-right-0 o-top-1.5 o-hidden o-h-px o-bg-white-20 md:o-block" />
                  <span
                    aria-hidden="true"
                    className="o-relative o-mt-3 o-block o-size-3 o-shrink-0 o-rounded-full md:o-mt-0"
                    style={{ backgroundColor: rang === FRISE.length - 1 ? encreSurSombre() : 'var(--o-palette-zinc-950)', border: `2px solid ${encreSurSombre()}` }}
                  />
                  <div className="o-min-w-0 md:o-mt-6">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums o-text-zinc-400">{date.annee}</p>
                    <p className="o-m-0 o-mt-3 o-tabular-nums" style={{ ...scene('m'), fontSize: 'clamp(1.9rem, 3.4vw, 3rem)', color: encreSurSombre() }}>
                      {date.valeur}
                    </p>
                    <p className="o-m-0 o-mt-2 o-max-w-xs o-text-sm o-leading-relaxed o-text-zinc-400">{date.quoi}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/*
            ----- L appel : le billet, recto verso (A43) --------------------------
          */}
          <section id="billet" className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-14 md:o-py-28">
            <div className="o-grid o-gap-12 lg:o-grid-cols-12 lg:o-items-center">
              <div className="lg:o-col-span-5">
                <Indice rang="03">Le billet</Indice>
                <h2 className="o-m-0 o-mt-5 o-max-w-md" style={{ ...scene('m'), fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)' }}>
                  A imprimer, ou a retirer au guichet.
                </h2>
                <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300">
                  Le billet porte la place que vous venez de choisir. Retournez-le : le verso dit l acces, l heure de fermeture des portes, et ce qui se passe si vous arrivez apres.
                </p>
                <div className="o-mt-9">
                  <Actions
                    pleine={['#salle', <>Changer de place <Icon icon={Ticket} size={16} aria-hidden="true" /></>]}
                    fantome={['tel:+33467661414', '04 67 66 14 14']}
                  />
                </div>
              </div>

              <div className="lg:o-col-span-7">
                <FlipCard
                  className="o-mx-auto o-w-full o-max-w-xl"
                  style={{ height: 300 }}
                  direction="horizontal"
                  front={
                    <div className="o-flex o-h-full o-overflow-hidden o-border-w-1" style={{ borderColor: accent(600), backgroundColor: accentDoux(900, 55) }}>
                      <div className="o-flex o-min-w-0 o-grow o-flex-col o-justify-between o-p-6">
                        <div>
                          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                            Grand Foyer — saison 2026
                          </p>
                          <p className="o-m-0 o-mt-4" style={{ ...scene('m'), fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)' }}>
                            Les Noces
                          </p>
                          <p className="o-m-0 o-mt-1 o-text-sm o-text-zinc-400">Samedi 14 novembre, 20 h — duree 3 h 05, un entracte</p>
                        </div>
                        <dl className="o-m-0 o-grid o-grid-cols-3 o-gap-4">
                          {(
                            [
                              ['Place', `${place.rang}, ${String(place.numero)}`],
                              ['Categorie', String(place.categorie)],
                              ['Tarif', `${String(place.prix)} EUR`],
                            ] as const
                          ).map(([quoi, valeur]) => (
                            <div key={quoi}>
                              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">{quoi}</dt>
                              <dd className="o-m-0 o-mt-1 o-text-sm o-tabular-nums o-text-zinc-100">{valeur}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      {/* La souche, detachable. */}
                      <div
                        className="o-flex o-w-24 o-shrink-0 o-flex-col o-items-center o-justify-center o-gap-3 o-border-l"
                        style={{ borderColor: accent(600), borderLeftStyle: 'dashed', backgroundColor: accentDoux(800, 50) }}
                      >
                        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400" style={{ writingMode: 'vertical-rl' }}>
                          Souche — controle
                        </span>
                      </div>
                    </div>
                  }
                  back={
                    <div className="o-flex o-h-full o-flex-col o-justify-between o-border-w-1 o-p-6" style={{ borderColor: accent(600), backgroundColor: 'var(--o-palette-zinc-900)' }}>
                      <div>
                        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                          Verso — ce qu il faut savoir
                        </p>
                        <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-col o-gap-2.5 o-p-0 o-text-sm o-leading-relaxed o-text-zinc-300">
                          {[
                            'Les portes ferment a 20 h precises. Apres, on entre a l entracte, debout au fond du parterre.',
                            'Le grand foyer ouvre a 19 h. Vestiaire gratuit, a gauche sous l escalier.',
                            'Tramway lignes 1 et 4, arret Comedie. Aucun parking a moins de quatre cents metres.',
                            'Billet cessible jusqu a la veille, au guichet ou par telephone. Aucun remboursement.',
                          ].map((ligne) => (
                            <li key={ligne}>{ligne}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                        Cliquez encore pour revenir au recto
                      </p>
                    </div>
                  }
                />
                <p className="o-m-0 o-mt-4 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                  Cliquez le billet pour le retourner
                </p>
              </div>
            </div>
          </section>
        </main>

        {/*
          ----- Le pied : il porte un plan de salle (P44) -------------------------
        */}
        <footer className="o-relative o-z-10 o-border-t o-border-white-10 o-px-6 o-pb-10 o-pt-16 md:o-px-14" style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}>
          <div className="o-grid o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-5">
              {/* Le plan, en petit : les entrees, les niveaux, le vestiaire. */}
              <svg viewBox="0 0 340 220" className="o-h-auto o-w-full o-max-w-sm" aria-hidden="true" fill="none">
                <rect x="60" y="10" width="220" height="30" fill={accentDoux(700, 45)} stroke={accent(600)} strokeOpacity="0.6" />
                <path d="M76 48h188a94 94 0 0 1-188 0Z" fill={accentDoux(900, 60)} stroke={accent(700)} strokeOpacity="0.6" />
                <path d="M40 62h260v120H40Z" stroke={accent(700)} strokeOpacity="0.45" />
                <path d="M40 148h260M40 166h260" stroke={accent(700)} strokeOpacity="0.3" />
                <path d="M14 62v120M326 62v120" stroke={accent(700)} strokeOpacity="0.45" />
                {[86, 112, 138].map((y) => (
                  <g key={y}>
                    <rect x="16" y={y} width="20" height="18" stroke={accent(600)} strokeOpacity="0.6" />
                    <rect x="304" y={y} width="20" height="18" stroke={accent(600)} strokeOpacity="0.6" />
                  </g>
                ))}
                {(
                  [
                    [170, 32, 'PLATEAU'],
                    [170, 120, 'PARTERRE'],
                    [170, 160, 'CORBEILLE'],
                    [170, 178, 'PARADIS'],
                    [170, 206, 'ENTREE — PLACE DE LA COMEDIE'],
                  ] as const
                ).map(([x, y, mot]) => (
                  <text key={mot} x={x} y={y} textAnchor="middle" className="o-font-mono" fontSize="9" fill="var(--o-palette-zinc-400)" letterSpacing="2.5">
                    {mot}
                  </text>
                ))}
                <path d="M150 192h40l-20 12Z" fill={encreSurSombre()} />
              </svg>
              <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                Plan des niveaux — vestiaire a gauche sous l escalier
              </p>
            </div>

            <div className="md:o-col-span-7">
              <p className="o-m-0" style={{ ...scene('m'), fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                Grand Foyer
              </p>
              <dl className="o-m-0 o-mt-8 o-grid o-gap-x-8 o-gap-y-5 sm:o-grid-cols-2">
                {(
                  [
                    ['Guichet', 'Place de la Comedie, 34000 Montpellier — mardi au samedi, 12 h a 19 h'],
                    ['Telephone', '04 67 66 14 14, du mardi au samedi'],
                    ['Moins de 26 ans', 'Dix euros une heure avant, sur les places restantes, sans reservation'],
                    ['Accessibilite', 'Six emplacements au parterre, ascenseur cote jardin, boucle magnetique en salle'],
                  ] as const
                ).map(([quoi, valeur]) => (
                  <div key={quoi} className="o-border-t o-border-white-10 o-pt-3">
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">{quoi}</dt>
                    <dd className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-300">{valeur}</dd>
                  </div>
                ))}
              </dl>
              <div className="o-mt-8">
                <a
                  href="#salle"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Choisir une place
                  <Icon icon={Ticket} size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <p className="o-m-0 o-mt-14 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            <span>© 2026 Grand Foyer — regie municipale, licences 1-104 227, 2-104 228, 3-104 229</span>
            <a href="#haut" className="o-text-zinc-400 o-no-underline hover:o-text-zinc-50 focus:o-ring">
              Remonter ↑
            </a>
          </p>
        </footer>
      </div>
    </Porte>
  )
}
