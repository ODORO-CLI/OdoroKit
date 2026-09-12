/**
 * Maison Trace — parfumeur.
 *
 * ## L architecture : la matiere, puis les notes qui flottent
 *
 * La page ouvre sur le chrome liquide — la surface d un flacon — et sur le
 * flacon lui-meme, taille au tour et rendu en verre : une `LatheGeometry` sur
 * le profil de la maison, un `MeshPhysicalMaterial` en transmission a 1,5
 * d indice, le jus a l interieur, un anneau et une nappe de lumiere derriere,
 * pour que le verre ait quelque chose a refracter. Le chrome est un shader, le
 * flacon est en three.js : une surface par technologie, l arbitre accorde les
 * deux. Trois matieres flottent en verre a cote. Le corps est clair :
 * une seule section porte le metier, **le champ des notes**. On choisit un
 * parfum, et ses matieres flottent, chacune a la taille de sa part dans le
 * concentre ; en passer une au pointeur ou au clavier dit sa part et son
 * origine. Une pyramide olfactive, mais qui bouge.
 *
 * Un seul chiffre est mis en scene, enorme : soixante-douze heures, le temps
 * qu un concentre repose avant la premiere mouillette. Puis une liste
 * d attente en verre pour le coffret d essai, et un generique de fin qui se
 * decouvre sous la page, avec les quatre engagements de la maison en guise
 * de credits.
 *
 * ## Le fond
 *
 * Le chrome liquide et le flacon sont les deux seules surfaces graphiques, et
 * toutes deux sont limitees a l ouverture. Le reste est blanc, et le mouvement
 * vient des notes qui flottent.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { useState, type CSSProperties, type ReactElement } from 'react'

import { LiquidChrome } from '@/odoro/background/LiquidChrome.jsx'
import { CinematicFooter } from '@/odoro/section/CinematicFooter.jsx'
import { CountUp } from '@/odoro/text/CountUp.jsx'
import { GradientFlow } from '@/odoro/text/GradientFlow.jsx'
import { SegmentedControl } from '@/odoro/ui/SegmentedControl.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Accent, Actions, affiche, CHROME, Coin, Etiquette, Grain, Indice, Porte, Surgit, TitreVague, usePolices, verre } from './marche.jsx'
import { Flotte } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Une matiere de la pyramide, avec sa part dans le concentre. */
interface Note {
  readonly nom: string
  readonly part: number
  readonly origine: string
}

/** Un parfum du catalogue. */
interface Parfum {
  readonly cle: string
  readonly nom: string
  readonly famille: string
  readonly parfumeur: string
  readonly concentration: string
  readonly tenue: string
  readonly prix: number
  readonly recharge: number
  readonly texte: string
  readonly tete: readonly Note[]
  readonly coeur: readonly Note[]
  readonly fond: readonly Note[]
}

/**
 * Les quatre parfums.
 *
 * Les parts sont donnees en pourcentage du concentre, non de la solution : un
 * extrait a 20 % dont le fond pese 34 % du concentre contient environ 6,8 % de
 * cette matiere au flacon. C est ecrit sous le champ.
 */
const PARFUMS: readonly Parfum[] = [
  {
    cle: 'cendre',
    nom: 'Cendre Claire',
    famille: 'Boise',
    parfumeur: 'Helene Vasseur',
    concentration: '20 % — extrait',
    tenue: '9 h 40',
    prix: 168,
    recharge: 96,
    texte: 'Un bois sec, sans vanille pour l adoucir. Le vetiver vient d Haiti, distille par le meme atelier depuis 2019, et sa part n a pas bouge d un dixieme.',
    tete: [
      { nom: 'Bergamote', part: 9, origine: 'Calabre, expression a froid' },
      { nom: 'Poivre rose', part: 5, origine: 'Bresil, distillation' },
    ],
    coeur: [
      { nom: 'Iris', part: 14, origine: 'Toscane, rhizome de trois ans' },
      { nom: 'Genevrier', part: 8, origine: 'Macedoine' },
    ],
    fond: [
      { nom: 'Vetiver', part: 34, origine: 'Haiti, distillation vapeur' },
      { nom: 'Cedre de Virginie', part: 21, origine: 'Etats-Unis' },
      { nom: 'Musc blanc', part: 9, origine: 'Synthese, galaxolide' },
    ],
  },
  {
    cle: 'onze',
    nom: 'Onze Heures',
    famille: 'Floral',
    parfumeur: 'Marc Ouradou',
    concentration: '15 % — eau de parfum',
    tenue: '6 h 20',
    prix: 142,
    recharge: 82,
    texte: 'Une rose qui ne sent pas la rose de parfumerie : l absolue est coupee de geranium et de terre humide, ce qui la ramene au jardin plutot qu au flacon.',
    tete: [
      { nom: 'Feuille de violette', part: 11, origine: 'Synthese' },
      { nom: 'Mandarine verte', part: 7, origine: 'Sicile' },
    ],
    coeur: [
      { nom: 'Rose de mai absolue', part: 26, origine: 'Grasse, recolte de mai' },
      { nom: 'Geranium bourbon', part: 13, origine: 'La Reunion' },
    ],
    fond: [
      { nom: 'Patchouli', part: 18, origine: 'Sulawesi, fraction claire' },
      { nom: 'Ambrette', part: 10, origine: 'Equateur' },
      { nom: 'Mousse de chene', part: 6, origine: 'Balkans, sans atranol' },
    ],
  },
  {
    cle: 'quai',
    nom: 'Quai Neuf',
    famille: 'Hesperide',
    parfumeur: 'Helene Vasseur',
    concentration: '12 % — eau de toilette',
    tenue: '4 h 10',
    prix: 118,
    recharge: 68,
    texte: 'Un citron qui tient quatre heures, ce qui est long pour un hesperide. Le prix rend la tenue : nous ne pretendons pas qu il dure la journee.',
    tete: [
      { nom: 'Citron de Sicile', part: 22, origine: 'Sicile, expression a froid' },
      { nom: 'Petit grain', part: 12, origine: 'Paraguay' },
      { nom: 'Menthe poivree', part: 4, origine: 'Provence' },
    ],
    coeur: [
      { nom: 'Neroli', part: 15, origine: 'Tunisie' },
      { nom: 'The vert', part: 9, origine: 'Synthese' },
    ],
    fond: [
      { nom: 'Bois de gaiac', part: 17, origine: 'Paraguay' },
      { nom: 'Musc blanc', part: 12, origine: 'Synthese, habanolide' },
    ],
  },
  {
    cle: 'nuit',
    nom: 'Nuit Basse',
    famille: 'Ambre',
    parfumeur: 'Marc Ouradou',
    concentration: '22 % — extrait',
    tenue: '11 h 50',
    prix: 194,
    recharge: 112,
    texte: 'Le plus tenace du catalogue, et le plus difficile a porter. Trois gouttes suffisent ; le flacon est livre avec un compte-gouttes.',
    tete: [{ nom: 'Cardamome', part: 8, origine: 'Guatemala' }],
    coeur: [
      { nom: 'Encens', part: 19, origine: 'Oman, resine' },
      { nom: 'Cannelle', part: 7, origine: 'Sri Lanka' },
    ],
    fond: [
      { nom: 'Benjoin', part: 28, origine: 'Laos, resine' },
      { nom: 'Labdanum', part: 22, origine: 'Espagne' },
      { nom: 'Feve tonka', part: 16, origine: 'Venezuela' },
    ],
  },
]

/** Le parfum montre a l arrivee. */
const PREMIER: Parfum = PARFUMS[0] ?? { cle: 'cendre', nom: 'Cendre Claire', famille: '', parfumeur: '', concentration: '', tenue: '', prix: 0, recharge: 0, texte: '', tete: [], coeur: [], fond: [] }

/** Ce que la maison s engage a dire — les credits du generique. */
const ENGAGEMENTS: readonly (readonly [string, string])[] = [
  ['La formule', 'chaque matiere et sa part sont publiees'],
  ['La tenue', 'mesuree sur mouillette, jamais estimee'],
  ['La synthese', 'ecrite comme telle, ni cachee ni excusee'],
  ['Le flacon', 'rechargeable, la recharge coute 42 % de moins'],
]

/**
 * Les places des notes dans le champ, en pourcentage du cadre.
 *
 * Huit places au plus, disposees pour qu aucune bulle n en recouvre une autre
 * a sa taille maximale ; les etages se lisent de haut en bas — la tete en
 * haut, le fond en bas — comme sur une pyramide.
 */
const PLACES: readonly (readonly [number, number])[] = [
  [12, 8],
  [50, 4],
  [70, 22],
  [6, 42],
  [40, 36],
  [66, 58],
  [16, 72],
  [46, 70],
]

/** Un etage de la pyramide. */
type Etage = 'tete' | 'coeur' | 'fond'

/** Les trois etages, et le moment ou ils se sentent. */
const ETAGES: readonly (readonly [Etage, string, string])[] = [
  ['tete', 'Tete', '0 — 20 min'],
  ['coeur', 'Coeur', '20 min — 2 h'],
  ['fond', 'Fond', '2 h et au-dela'],
]

/** Une note posee dans le champ, avec son etage et sa place. */
interface NotePosee extends Note {
  readonly etage: Etage
  readonly place: readonly [number, number]
}

/** Les notes d un parfum, dans l ordre des etages, chacune a sa place. */
function poser(parfum: Parfum): readonly NotePosee[] {
  const toutes: readonly (readonly [Etage, Note])[] = [
    ...parfum.tete.map((n) => ['tete', n] as const),
    ...parfum.coeur.map((n) => ['coeur', n] as const),
    ...parfum.fond.map((n) => ['fond', n] as const),
  ]
  return toutes.map(([etage, note], rang) => ({ ...note, etage, place: PLACES[rang] ?? ([50, 50] as const) }))
}

/** Le style d une bulle selon son etage : la tete est un trait, le fond un aplat. */
function robe(etage: Etage, active: boolean): CSSProperties {
  const bord = active ? encre() : 'color-mix(in oklab, currentColor 25%, transparent)'
  switch (etage) {
    case 'tete':
      return { borderColor: bord, backgroundColor: 'var(--o-theme-bg)' }
    case 'coeur':
      return { borderColor: bord, backgroundColor: accentDoux(400, active ? 30 : 16) }
    default:
      return { borderColor: 'transparent', backgroundColor: active ? encre() : accentDoux(500, 42), color: active ? 'var(--o-theme-bg)' : undefined }
  }
}

/** Le champ des notes : elles flottent, et se revelent au pointeur ou au clavier. */
function Champ({ parfum }: { readonly parfum: Parfum }): ReactElement {
  const notes = poser(parfum)
  const [revelee, setRevelee] = useState<string | null>(null)
  const active = notes.find((n) => n.nom === revelee) ?? null
  const etageDe = (e: Etage): string => ETAGES.find(([cle]) => cle === e)?.[1] ?? ''

  return (
    <div>
      <div
        role="group"
        aria-label={`Les notes de ${parfum.nom}`}
        className="o-relative o-w-full o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-black-10 dark:o-border-zinc-800"
        style={{ aspectRatio: '4 / 3', backgroundColor: accentDoux(300, 6) }}
      >
        {/* Les trois etages, en filigrane, du haut vers le bas. */}
        {ETAGES.map(([cle, mot], rang) => (
          <span key={cle} aria-hidden="true" className="o-pointer-events-none o-absolute o-right-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-neutral-500 dark:o-text-neutral-400" style={{ top: `${String(6 + rang * 32)}%` }}>
            {mot}
          </span>
        ))}
        {notes.map((n, rang) => {
          const diametre = 64 + n.part * 2.6
          const estActive = active?.nom === n.nom
          return (
            <Flotte
              key={`${parfum.cle}-${n.nom}`}
              amplitude={6 + (rang % 3) * 3}
              duree={5 + (rang % 4)}
              delai={-rang * 1.3}
              angle={rang % 2 === 0 ? -3 : 3}
              className="o-absolute"
              style={{ left: `${String(n.place[0])}%`, top: `${String(n.place[1])}%`, width: `min(${String(diametre)}px, 30%)` }}
            >
              <button
                type="button"
                aria-pressed={estActive}
                onMouseEnter={() => { setRevelee(n.nom) }}
                onMouseLeave={() => { setRevelee(null) }}
                onFocus={() => { setRevelee(n.nom) }}
                onBlur={() => { setRevelee(null) }}
                onClick={() => { setRevelee(estActive ? null : n.nom) }}
                className="o-flex o-aspect-square o-w-full o-items-center o-justify-center o-rounded-full o-border-w-1 o-p-2 o-text-center o-text-xs o-font-medium o-leading-tight o-transition-colors focus:o-ring"
                style={{ ...robe(n.etage, estActive), boxShadow: estActive ? '0 12px 30px -12px color-mix(in oklab, currentColor 40%, transparent)' : undefined }}
              >
                {n.nom}
                <span className="o-sr-only">, {n.part} % du concentre, {n.origine}, {etageDe(n.etage)}</span>
              </button>
            </Flotte>
          )
        })}
      </div>

      {/* La legende de la note revelee : une ligne, jamais une carte. */}
      <p aria-live="polite" className="o-m-0 o-mt-4 o-flex o-min-h-12 o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-4">
        {active === null ? (
          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-neutral-500 dark:o-text-neutral-400">
            Passez sur une note — sa part et son origine
          </span>
        ) : (
          <>
            <span className="o-text-lg o-font-medium o-text-neutral-950 dark:o-text-neutral-50" style={{ fontFamily: 'var(--o-vitrine-affichage)', fontWeight: 400 }}>{active.nom}</span>
            <span className="o-font-mono o-text-sm o-tabular-nums" style={{ color: encre() }}>{active.part} % du concentre</span>
            <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-neutral-500 dark:o-text-neutral-400">{etageDe(active.etage)} — {active.origine}</span>
          </>
        )}
      </p>
    </div>
  )
}

/** Les liens de la gelule. */
const NAVIGATION = [
  ['#notes', 'Les notes'],
  ['#temps', 'Le temps'],
  ['#coffret', 'Le coffret'],
] as const

/**
 * La gelule flottante, opaque.
 *
 * Celle de la trousse est en verre ; posee sur un corps blanc, son encre
 * claire ne tient que par le flou. Ici la gelule est un noir plein, qui reste
 * le meme au-dessus du chrome et au-dessus du papier.
 */
function Gelule(): ReactElement {
  return (
    <div className="o-pointer-events-none o-fixed o-inset-x-0 o-z-40 o-flex o-justify-center o-px-4" style={{ top: `calc(${String(CHROME)}px + 1rem)` }}>
      <nav aria-label="Navigation" className="o-pointer-events-auto o-flex o-items-center o-gap-1 o-rounded-full o-border-w-1 o-border-white-10 o-p-1.5 o-pl-4 o-text-zinc-50" style={{ backgroundColor: 'var(--o-palette-neutral-950)' }}>
        <a href="#haut" className="o-mr-3 o-text-sm o-font-semibold o-tracking-tight o-text-zinc-50 o-no-underline focus:o-ring">Maison Trace</a>
        {NAVIGATION.map(([href, mot]) => (
          <a key={href} href={href} className="o-hidden o-rounded-full o-px-3 o-py-1.5 o-text-sm o-text-zinc-300 o-no-underline o-transition-colors hover:o-text-zinc-50 sm:o-inline-block focus:o-ring">
            {mot}
          </a>
        ))}
        <a href="#coffret" className="o-ml-2 o-inline-flex o-items-center o-rounded-full o-px-4 o-py-1.5 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring" style={{ backgroundColor: encreSurSombre(), color: 'var(--o-palette-neutral-950)' }}>
          Liste d attente
        </a>
      </nav>
    </div>
  )
}

/** Une matiere qui flotte en verre au-dessus du chrome. */
function Bulle({ nom, origine, delai, angle, place }: { readonly nom: string; readonly origine: string; readonly delai: number; readonly angle: number; readonly place: readonly [droite: string, haut: string] }): ReactElement {
  return (
    <Flotte amplitude={9} duree={7} delai={delai} angle={angle} className="o-absolute" style={{ right: place[0], top: place[1] }}>
      <div className={`${verre(true)} o-px-4 o-py-3`}>
        <p className="o-m-0 o-text-sm o-font-medium o-text-white">{nom}</p>
        <p className="o-m-0 o-mt-0.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">{origine}</p>
      </div>
    </Flotte>
  )
}

/**
 * Le flacon, dessine au trait.
 *
 * C est le repli du volume : sous mouvement reduit, sans WebGL, ou quand le
 * plafond de surfaces est atteint, la page doit montrer la meme chose. Un
 * flacon se lit a sa silhouette — le corps, l epaule, le col, la bague, le
 * bouchon — et le niveau du jus dit le reste.
 */
function FlaconDessine(): ReactElement {
  const trait = encreSurSombre()
  return (
    <svg viewBox="0 0 200 320" className="o-h-full o-w-full" aria-hidden="true" fill="none" strokeLinejoin="round" strokeLinecap="round">
      {/* Le jus, sous le niveau : un aplat tenu par le contour du corps. */}
      <path d="M44 181h112v102c0 10-6 14-16 14H60c-10 0-16-4-16-14Z" fill={trait} opacity="0.26" />
      <g stroke={trait} strokeWidth="1.6" opacity="0.9">
        {/* Le corps et l epaule, d un seul trait, sur le profil du tour. */}
        <path d="M79 93c0 19-35 27-35 50v140c0 10 6 14 16 14h80c10 0 16-4 16-14V143c0-23-35-31-35-50" />
        {/* Le col, sa bague, puis le bouchon. */}
        <path d="M79 93V69M121 93V69" />
        <path d="M73 59h54v10H73Z" />
        <path d="M71 25a5 5 0 0 1 5-5h48a5 5 0 0 1 5 5v36H71Z" />
        <path d="M71 38h58" opacity="0.45" />
        {/* Le niveau du jus, trait plein. */}
        <path d="M44 181h112" opacity="0.75" />
      </g>
      {/* Le reflet vertical : ce qui fait lire une paroi de verre. */}
      <path d="M60 167c-4 40-4 78 2 110" stroke={trait} strokeWidth="5" opacity="0.35" />
    </svg>
  )
}

/**
 * Le flacon en volume.
 *
 * ## Le profil
 *
 * Une `LatheGeometry` fait tourner un profil — pied, corps, epaule en quart
 * d ellipse, col, bague — autour de l axe vertical. Le bouchon est un second
 * tour, pour qu il porte sa propre matiere : un metal mat ne se decrit pas
 * avec les reglages d un verre.
 *
 * ## Pourquoi une nappe et un anneau
 *
 * La transmission ne refracte que ce qui est **dans la meme scene**. Le chrome
 * du fond vit sur un autre canevas : sans rien derriere, le verre serait une
 * silhouette noire. Une nappe de lumiere et un anneau incline lui donnent donc
 * de quoi tordre, et le jus fait le reste depuis l interieur.
 */
function FlaconEnVolume(): ReactElement {
  return (
    <Volume
      nom="flacon de verre"
      className="o-pointer-events-none o-absolute o-z-10"
      style={{ top: '6%', bottom: '12%', right: '2%', width: 'min(44%, 560px)' }}
      repli={
        <div className="o-flex o-h-full o-items-center o-justify-center o-py-12 o-opacity-80">
          <FlaconDessine />
        </div>
      }
      construire={(contexte) => {
        const { scene, camera, three } = contexte
        const couleurVerre = teinte('--o-vitrine-200', '#f6dfe6')
        const couleurJus = teinte('--o-vitrine-500', '#c4566f')
        const couleurHalo = teinte('--o-vitrine-400', '#e3859d')

        /* ---- Le profil du flacon, du pied au col ---- */
        const profil: InstanceType<typeof three.Vector2>[] = [
          new three.Vector2(0, -1.34),
          new three.Vector2(0.5, -1.34),
          new three.Vector2(0.56, -1.26),
        ]
        // L epaule : un quart d ellipse, du corps vers le col. Une arete vive
        // ferait une casserole ; c est la courbe qui fait le flacon.
        for (let rang = 0; rang <= 12; rang += 1) {
          const t = rang / 12
          profil.push(
            new three.Vector2(
              0.21 + 0.35 * Math.cos((t * Math.PI) / 2),
              0.2 + 0.5 * Math.sin((t * Math.PI) / 2),
            ),
          )
        }
        profil.push(new three.Vector2(0.21, 0.94))
        profil.push(new three.Vector2(0.27, 0.97))
        profil.push(new three.Vector2(0.27, 1.04))
        profil.push(new three.Vector2(0.2, 1.07))
        profil.push(new three.Vector2(0, 1.07))

        const formeFlacon = new three.LatheGeometry(profil, 72)
        const verreMatiere = new three.MeshPhysicalMaterial({
          color: couleurVerre,
          metalness: 0,
          roughness: 0.05,
          transmission: 1,
          thickness: 0.85,
          ior: 1.5,
          attenuationColor: new three.Color(couleurHalo),
          attenuationDistance: 6,
          clearcoat: 1,
          clearcoatRoughness: 0.03,
        })
        const flacon = new three.Mesh(formeFlacon, verreMatiere)

        /* ---- Le jus, aux deux tiers ---- */
        const formeJus = new three.LatheGeometry(
          [
            new three.Vector2(0, -1.28),
            new three.Vector2(0.45, -1.28),
            new three.Vector2(0.51, -1.21),
            new three.Vector2(0.51, -0.18),
            new three.Vector2(0, -0.18),
          ],
          64,
        )
        const jusMatiere = new three.MeshPhysicalMaterial({
          color: couleurJus,
          metalness: 0,
          roughness: 0.14,
          transmission: 0.86,
          thickness: 1.4,
          ior: 1.42,
          attenuationColor: new three.Color(couleurJus),
          attenuationDistance: 0.7,
        })
        const jus = new three.Mesh(formeJus, jusMatiere)

        /* ---- Le bouchon et la bague du col ---- */
        const formeBouchon = new three.LatheGeometry(
          [
            new three.Vector2(0, 1.02),
            new three.Vector2(0.25, 1.02),
            new three.Vector2(0.29, 1.09),
            new three.Vector2(0.29, 1.34),
            new three.Vector2(0.24, 1.41),
            new three.Vector2(0, 1.43),
          ],
          64,
        )
        const metalMatiere = new three.MeshPhysicalMaterial({
          color: couleurVerre,
          metalness: 0.95,
          roughness: 0.24,
          clearcoat: 0.5,
        })
        const bouchon = new three.Mesh(formeBouchon, metalMatiere)
        const formeBague = new three.TorusGeometry(0.26, 0.02, 12, 64)
        const bague = new three.Mesh(formeBague, metalMatiere)
        bague.rotation.x = Math.PI / 2
        bague.position.y = 0.95

        const groupe = new three.Group()
        groupe.add(flacon, jus, bouchon, bague)
        groupe.rotation.z = 0.04

        /* ---- Ce que le verre a devant lui a refracter ---- */
        const decor = new three.Group()
        const pot = document.createElement('canvas')
        pot.width = 256
        pot.height = 256
        const pinceau = pot.getContext('2d')
        if (pinceau !== null) {
          const nappe = pinceau.createRadialGradient(128, 116, 6, 128, 128, 132)
          nappe.addColorStop(0, couleurHalo)
          nappe.addColorStop(0.42, couleurJus)
          nappe.addColorStop(1, '#07050a')
          pinceau.fillStyle = nappe
          pinceau.fillRect(0, 0, 256, 256)
        }
        const nappeTexture = new three.CanvasTexture(pot)
        nappeTexture.colorSpace = three.SRGBColorSpace
        const formeNappe = new three.PlaneGeometry(18, 18)
        const nappeMatiere = new three.MeshBasicMaterial({ map: nappeTexture })
        const nappe = new three.Mesh(formeNappe, nappeMatiere)
        nappe.position.z = -4.2

        const formeAnneau = new three.TorusGeometry(1.62, 0.028, 12, 128)
        const anneauMatiere = new three.MeshBasicMaterial({ color: couleurVerre })
        const anneau = new three.Mesh(formeAnneau, anneauMatiere)
        anneau.position.z = -2.3
        anneau.rotation.x = 1.42
        decor.add(nappe, anneau)

        scene.add(groupe, decor)

        eclairer(contexte, { cle: 0xfff2f4, remplissage: 0x8fa2d8, force: 1.25 })
        const socle = new three.PointLight(0xffd8e2, 22, 12, 2)
        socle.position.set(0.4, -2.2, 1.8)
        const rasante = new three.PointLight(0xffffff, 16, 12, 2)
        rasante.position.set(-2.6, 1.2, 1.4)
        scene.add(socle, rasante)

        camera.position.set(0, 0.04, 5)
        camera.lookAt(0, 0.02, 0)

        return () => {
          formeFlacon.dispose()
          formeJus.dispose()
          formeBouchon.dispose()
          formeBague.dispose()
          formeNappe.dispose()
          formeAnneau.dispose()
          verreMatiere.dispose()
          jusMatiere.dispose()
          metalMatiere.dispose()
          nappeMatiere.dispose()
          anneauMatiere.dispose()
          nappeTexture.dispose()
        }
      }}
      animer={({ scene }, { delta, time }) => {
        const groupe = scene.children[0]
        const decor = scene.children[1]
        if (groupe === undefined || decor === undefined) return
        // Un tour lent, et le balancement d un flacon pose sur un plateau.
        groupe.rotation.y += delta * 0.36
        groupe.rotation.z = 0.04 + Math.sin(time * 0.5) * 0.025
        groupe.position.y = Math.sin(time * 0.7) * 0.035
        // L anneau derive a contretemps : c est lui qu on voit se tordre dans
        // la paroi, et une refraction immobile ne se remarque pas.
        decor.rotation.z = time * 0.06
      }}
    />
  )
}

/** La vitrine complete : la matiere, les notes, un seul chiffre, une liste d attente, un generique. */
export default function Page(): ReactElement {
  const polices = usePolices('fraunces')
  const [cle, setCle] = useState<string>('cendre')
  const parfum: Parfum = PARFUMS.find((p) => p.cle === cle) ?? PREMIER
  const [courriel, setCourriel] = useState('')
  const [inscrit, setInscrit] = useState(false)

  return (
    <Porte forme="iris" marque="Maison Trace">
      <div className="o-bg-white dark:o-bg-neutral-950 o-text-neutral-900 dark:o-text-neutral-100" style={polices}>
        <Gelule />

        {/*
          ----- Le premier volet : la matiere ---------------------------------
        */}
        <section id="haut" className="o-relative o-isolate o-flex o-flex-col o-justify-end o-overflow-hidden o-px-6 o-pb-20 o-pt-40 md:o-px-12" style={{ ...nuit('neutral'), minHeight: '100vh' }}>
          <LiquidChrome className="o-absolute o-inset-0 o-z-0 o-pointer-events-none" colors={['--o-theme-bg', '--o-vitrine-400', '--o-vitrine-700']} speed={0.25} />
          {/* Le chrome monte tres clair par endroits : un voile depuis le bas, la ou le texte tombe. */}
          <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0 o-pointer-events-none" style={{ background: 'linear-gradient(to top, var(--o-palette-neutral-950) 6%, color-mix(in oklab, var(--o-palette-neutral-950) 70%, transparent) 48%, transparent 84%)' }} />
          <Grain opacite={0.05} />

          {/*
            Le flacon, au tour, a droite du titre.

            Le canevas du moteur est opaque : pose tel quel sur le chrome, il y
            ferait un rectangle net. Le fondu ne peut pas vivre dans le style du
            `Volume` — il masquerait aussi le dessin de repli, dont le pied
            disparaitrait. La regle ne vise donc que le canevas.
          */}
          <div data-trace-flacon="" className="o-absolute o-inset-0 o-z-0 max-md:o-hidden">
            <style>
              {'[data-trace-flacon] canvas{-webkit-mask-image:radial-gradient(46% 46% at 50% 48%, #000 58%, transparent 98%);mask-image:radial-gradient(46% 46% at 50% 48%, #000 58%, transparent 98%)}'}
            </style>
            <FlaconEnVolume />
          </div>

          {/*
            Trois matieres qui flottent en verre, rangees a gauche du flacon :
            elles le montrent du doigt sans jamais passer devant lui.
          */}
          <div aria-hidden="true" className="o-pointer-events-none o-absolute o-inset-0 o-z-20 max-lg:o-hidden">
            <Bulle nom="Vetiver" origine="Haiti — 34 %" delai={0} angle={-4} place={['50%', '12%']} />
            <Bulle nom="Rose de mai" origine="Grasse — 26 %" delai={-2.5} angle={3} place={['62%', '27%']} />
            <Bulle nom="Encens" origine="Oman — 19 %" delai={-4.5} angle={-2} place={['48%', '40%']} />
          </div>

          <div className="o-relative o-z-10 o-max-w-4xl">
            <Surgit>
              <Etiquette>Grasse, depuis 1994 — quatre parfums</Etiquette>
            </Surgit>
            <TitreVague delai={120} className="o-m-0 o-mt-6 o-text-neutral-50" style={{ ...affiche('l', 300), fontSize: 'clamp(3rem, 8.5vw, 8.5rem)' }}>
              Un parfum qu on peut lire.
            </TitreVague>
            <Surgit delai={520} as="p" className="o-m-0 o-mt-8 o-max-w-md o-text-base o-leading-relaxed o-text-neutral-300">
              Les matieres, leur part dans le concentre, leur origine. La tenue est mesuree, pas promise.
            </Surgit>
            <Surgit delai={640} className="o-mt-10">
              <Actions pleine={['#notes', <>Lire les notes <Icon icon={ArrowRight} size={16} aria-hidden="true" /></>]} fantome={['#coffret', 'Les quatre en 2 ml']} />
            </Surgit>
          </div>
          <Coin position="bd">7 rue Marcel Journet, Grasse<br />Compose, macere et mis en flacon sur place</Coin>
        </section>

        <main>
          {/*
            ----- Les notes, qui flottent ----------------------------------------
          */}
          <section id="notes" className="o-scroll-mt-32 o-px-6 o-py-24 md:o-px-12 md:o-py-32">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01" sombre={false}>Les notes</Indice>
                <h2 className="o-m-0 o-mt-5 o-max-w-3xl o-text-neutral-950 dark:o-text-neutral-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}>
                  Chaque matiere, sa part, <Accent>son origine</Accent>.
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-neutral-500 dark:o-text-neutral-400 md:o-col-span-4 md:o-text-right">
                La taille d une note est sa part<br />dans le concentre, non dans la solution
              </p>
            </div>

            {/*
              Un rail creuse plutot que des pastilles pleines : la glissiere est
              une surface de theme, donc l encre du nom choisi reste celle du
              corps quelle que soit la couleur posee par la barre.
            */}
            <div className="o-mt-12 o-max-w-full o-overflow-x-auto o-pb-1">
              <SegmentedControl
                label="Choisir un parfum"
                options={PARFUMS.map((p) => ({ value: p.cle, label: p.nom }))}
                value={cle}
                onChange={setCle}
              />
            </div>

            <div className="o-mt-10 o-grid o-gap-12 md:o-grid-cols-12">
              <div className="md:o-col-span-5">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-neutral-500 dark:o-text-neutral-400">
                  {parfum.famille} — {parfum.parfumeur}
                </p>
                <h3 className="o-m-0 o-mt-3" style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)' }}>
                  <GradientFlow key={parfum.cle} from={encre()} to={accent(400)} speed={6000} angle={100}>
                    {parfum.nom}
                  </GradientFlow>
                </h3>
                <p className="o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">{parfum.texte}</p>
                <dl className="o-m-0 o-mt-8 o-grid o-grid-cols-2 o-gap-x-6 o-gap-y-4 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-6 o-font-mono o-text-xs">
                  {([
                    ['Concentration', parfum.concentration],
                    ['Tenue mesuree', parfum.tenue],
                    ['Flacon', `${String(parfum.prix)} EUR`],
                    ['Recharge', `${String(parfum.recharge)} EUR`],
                  ] as const).map(([quoi, valeur]) => (
                    <div key={quoi}>
                      <dt className="o-uppercase o-tracking-widest o-text-neutral-500 dark:o-text-neutral-400">{quoi}</dt>
                      <dd className="o-m-0 o-mt-1 o-text-sm o-font-medium o-text-neutral-950 dark:o-text-neutral-50">{valeur}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="o-m-0 o-mt-8 o-flex o-list-none o-flex-wrap o-gap-x-6 o-gap-y-2 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-neutral-500 dark:o-text-neutral-400">
                  {ETAGES.map(([etage, mot, quand]) => (
                    <li key={etage} className="o-flex o-items-center o-gap-2">
                      <span aria-hidden="true" className="o-inline-block o-size-3 o-rounded-full o-border-w-1" style={robe(etage, false)} />
                      {mot} · {quand}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:o-col-span-7">
                <Champ key={parfum.cle} parfum={parfum} />
              </div>
            </div>
          </section>

          {/*
            ----- Un seul chiffre, enorme ---------------------------------------
          */}
          <section id="temps" className="o-scroll-mt-32 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-12 md:o-py-32">
            <div className="o-grid o-gap-10 md:o-grid-cols-12 md:o-items-center">
              {/*
                Le nombre monte de zero a soixante-douze quand il entre dans le
                champ : c est le seul chiffre de la page, il a le droit de se
                compter. Sous mouvement reduit, `CountUp` le pose d un coup.
              */}
              <p className="o-m-0 o-tabular-nums o-text-neutral-950 dark:o-text-neutral-50 md:o-col-span-7" style={{ ...affiche('xxl', 300), fontSize: 'clamp(6rem, 17vw, 14rem)', lineHeight: 0.85 }}>
                <CountUp value={72} from={0} duration={1700} locale="fr-FR" />
                <span className="o-italic" style={{ fontSize: '0.5em', color: encre() }}> h</span>
              </p>
              <div className="md:o-col-span-5">
                <Indice rang="02" sombre={false}>Le temps</Indice>
                <p className="o-m-0 o-mt-5 o-max-w-md o-text-neutral-950 dark:o-text-neutral-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)', lineHeight: 1.15 }}>
                  Soixante-douze heures : le temps qu un concentre repose avant la premiere mouillette.
                </p>
                <p className="o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">
                  Rien n est senti avant. La tenue est ensuite mesuree sur mouillette a 21 degres, jusqu au seuil de detection d un panel de six nez.
                </p>
              </div>
            </div>
          </section>

          {/*
            ----- La liste d attente, en verre -----------------------------------
          */}
          <section id="coffret" className="o-scroll-mt-32 o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 md:o-px-12 md:o-py-36" style={{ background: `linear-gradient(to bottom, var(--o-theme-bg), ${accentDoux(300, 18)})` }}>
            <div aria-hidden="true" className="o-pointer-events-none o-absolute o-left-1/2 o-top-1/2 o-z-0 o-h-1/2 o-w-4/5 o-rounded-full o-blur-3xl" style={{ transform: 'translate(-50%, -50%)', background: accentDoux(400, 30) }} />
            <div className={`o-relative o-z-10 o-mx-auto o-max-w-2xl o-p-8 md:o-p-12 ${verre(false)}`}>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>Le coffret d essai — liste d attente</p>
              <h2 className="o-m-0 o-mt-4 o-text-neutral-950 dark:o-text-neutral-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)' }}>
                Les quatre en 2 ml, 14 EUR, deduits de la premiere commande.
              </h2>
              <p className="o-mt-4 o-max-w-lg o-text-sm o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">
                La prochaine serie part en octobre. Laissez une adresse : vous saurez la veille, et rien d autre ne vous sera envoye.
              </p>
              {inscrit ? (
                <p className="o-mt-8 o-flex o-items-center o-gap-2 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-6 o-text-sm o-text-neutral-950 dark:o-text-neutral-50" aria-live="polite">
                  <span className="o-inline-block o-size-2 o-rounded-full" style={{ backgroundColor: encre() }} aria-hidden="true" />
                  Vous etes sur la liste, {courriel}. Un seul message, la veille du depart.
                </p>
              ) : (
                <form
                  className="o-mt-8 o-flex o-flex-col o-gap-3 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-6 sm:o-flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (courriel.trim() !== '') setInscrit(true)
                  }}
                >
                  <label className="o-grow">
                    <span className="o-sr-only">Votre adresse de courriel</span>
                    <input
                      type="email"
                      required
                      value={courriel}
                      onChange={(e) => { setCourriel(e.target.value) }}
                      placeholder="vous@exemple.fr"
                      className="o-w-full o-rounded-full o-border-w-1 o-border-black-20 o-bg-white o-px-5 o-py-3 o-text-sm o-text-neutral-950 dark:o-border-zinc-700 dark:o-bg-neutral-950 dark:o-text-neutral-50 focus:o-ring"
                    />
                  </label>
                  <button type="submit" className="o-inline-flex o-items-center o-justify-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring" style={aplat()}>
                    Rejoindre la liste
                    <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                  </button>
                </form>
              )}
              <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-text-neutral-500 dark:o-text-neutral-400">Sans inscription, sans relance, sans conditions.</p>
            </div>
          </section>
        </main>

        {/*
          ----- Le generique de fin, decouvert sous la page ---------------------
        */}
        <CinematicFooter
          style={{ height: ECRAN }}
          word="TRACE"
          heading={
            <span className="o-block o-text-neutral-950 dark:o-text-neutral-50" style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 7vw, 6.5rem)' }}>
              Maison Trace
            </span>
          }
          actions={
            <a href="mailto:coffret@maisontrace.fr" className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline focus:o-ring" style={aplat()}>
              coffret@maisontrace.fr
              <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
            </a>
          }
          links={ENGAGEMENTS.map(([titre, quoi]) => (
            <span key={titre} className="o-inline-flex o-items-baseline o-gap-2 o-rounded-full o-border-w-1 o-border-black-10 dark:o-border-zinc-800 o-px-4 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-neutral-600 dark:o-text-neutral-400">
              <span style={{ color: encre() }}>{titre}</span>
              <span className="max-sm:o-hidden">— {quoi}</span>
            </span>
          ))}
          copyright="© 2026 Maison Trace SAS — RCS Grasse 838 226 411"
          signature="Compose a Grasse"
          topLabel="Remonter"
        />
      </div>
    </Porte>
  )
}
