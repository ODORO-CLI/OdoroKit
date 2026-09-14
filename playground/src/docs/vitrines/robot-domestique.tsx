/**
 * Nubo — un robot domestique.
 *
 * ## La reference : Nubo (Framer)
 *
 * Une cuisine chaude en plein cadre, une gelule de navigation flottante, une
 * accroche legere dont un mot est en italique, deux gelules, une bande de
 * logos ; puis un corps clair et calme. Un produit qui promet d etre invisible
 * ne crie pas.
 *
 * ## Ce qui n appartient qu a elle
 *
 * Le **mecanisme** est **la journee** : on coche les pieces de la maison, et
 * la journee de vingt-quatre heures se dessine — a quelle heure il passe, ce
 * qu il fait, et combien de minutes il rend. On achete du temps, pas une
 * machine.
 *
 * ## L univers (UNIVERS.md)
 *
 * - Fond F-css : la cuisine en photo, et une nappe chaude qui derive dessus.
 * - Signature M-epingle : la journee est epinglee. L heure avance avec le
 *   defilement, la scene change de piece a chaque acte, et le curseur de la
 *   frise suit la progression.
 * - `MorphText` : l heure se coule dans la suivante a chaque changement
 *   d acte.
 * - Structure : ouverture → journee epinglee → mosaique de capacites
 *   (`BentoGrid`) → questions (`Faq`) → A7 (precommande : la date de livraison)
 *   → P4 (plan du site dense). C3 : un seul nombre, les heures d autonomie.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Check, Play } from '@odoro-cli/icons/filaire'
import { useMotionState } from '@odoro-cli/engine'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { BentoGrid } from '@/odoro/section/BentoGrid.jsx'
import { Faq } from '@/odoro/section/Faq.jsx'
import { MorphText } from '@/odoro/text/MorphText.jsx'

import { GELULE, nuit, Voile } from './communs.jsx'
import {
  Accent,
  Actions,
  affiche,
  BarreGelule,
  Etiquette,
  Grain,
  Indice,
  Logos,
  Porte,
  Surgit,
  usePolices,
} from './marche.jsx'
import { photo } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Epingle, Nappe } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/* ============================ Les donnees ============================== */

/** Une piece, et ce que le robot y fait. */
interface Piece {
  readonly nom: string
  readonly heure: number
  readonly duree: number
  readonly quoi: string
  readonly minutesRendues: number
}

const PIECES: readonly Piece[] = [
  {
    nom: 'Cuisine',
    heure: 7,
    duree: 40,
    quoi: 'Vaisselle du matin rangee, plan de travail essuye, courses listees.',
    minutesRendues: 25,
  },
  {
    nom: 'Salon',
    heure: 10,
    duree: 30,
    quoi: 'Coussins remis, sol passe, plantes arrosees le mardi et le vendredi.',
    minutesRendues: 15,
  },
  {
    nom: 'Chambres',
    heure: 11,
    duree: 35,
    quoi: 'Lits faits, linge trie par couleur et porte au panier.',
    minutesRendues: 20,
  },
  {
    nom: 'Salle de bain',
    heure: 14,
    duree: 25,
    quoi: 'Lavabo et miroir, serviettes changees le samedi.',
    minutesRendues: 12,
  },
  {
    nom: 'Entree',
    heure: 17,
    duree: 15,
    quoi: 'Chaussures alignees, colis rentres, courrier pose sur la console.',
    minutesRendues: 8,
  },
  {
    nom: 'Cuisine, le soir',
    heure: 21,
    duree: 45,
    quoi: 'Vaisselle du diner, poubelle sortie la veille de la collecte.',
    minutesRendues: 30,
  },
]

/** Les capacites, en tuiles inegales. */
const CAPACITES = [
  {
    id: 'mains',
    title: 'Une seconde paire de mains',
    body: 'Il porte, range, essuie. Pas plus de trois kilos a la fois, jamais au-dessus de la hauteur d une table.',
    cols: 2,
    rows: 2,
    graine: 'tamaris-chambre-7',
    alt: 'Salon meuble, range en fin de journee',
  },
  {
    id: 'petits',
    title: 'Doux avec les petits',
    body: 'Il s arrete a un metre d un enfant ou d un animal, et repart quand la voie est libre. Sans exception.',
    cols: 1,
    rows: 1,
  },
  {
    id: 'colis',
    title: 'Il prend le colis',
    body: 'Il reconnait le livreur, ouvre le sas, rentre le paquet, et vous previent d une ligne.',
    cols: 1,
    rows: 1,
  },
  {
    id: 'silence',
    title: 'Le bruit d une bibliotheque',
    body: 'Au plus fort de la vaisselle, on l entend moins qu un frigo. La nuit, il ne roule pas.',
    cols: 1,
    rows: 1,
  },
  {
    id: 'semaine',
    title: 'Il apprend la maison en une semaine',
    body: 'Sans carte a dessiner. Il commence par les pieces cochees, et vous dit chaque soir ce qu il a compris.',
    cols: 1,
    rows: 1,
  },
  {
    id: 'come',
    title: 'Fabrique a Come',
    body: 'Assemble a la main au bord du lac, porte comme un pull prefere, livre en France, mis en route a domicile.',
    cols: 4,
    rows: 2,
    featured: true,
    graine: 'cobalt-atelier',
    alt: 'Bras d assemblage dans l atelier, au bord du lac',
  },
] as const

/**
 * Les reperes de la figure : ce que la legende numerote dans les marges.
 *
 * C est la seule maniere honnete de decrire une machine — un renvoi par
 * organe, comme sur une planche d atelier, et non quatre cartes egales.
 */
const REPERES = [
  [
    '01',
    'La tete',
    'Elle s incline vers qui lui parle et se detourne quand la piece est vide. Rien n est enregistre, rien ne sort.',
  ],
  [
    '02',
    'Le bras',
    'Une epaule, un coude, deux doigts. Trois kilos au plus, jamais au-dessus de la hauteur d une table.',
  ],
  [
    '03',
    'La coque',
    'Polymere recycle, quatre vis, demontable a la main. Trente-six decibels au plus fort de la vaisselle.',
  ],
  [
    '04',
    'Le socle',
    'Une roue unique, quarante centimetres par seconde. Il rentre seul se poser dessus pour la nuit.',
  ],
] as const

/** Le plan du site, dense. */
const PLAN = [
  {
    titre: 'Produit',
    liens: [
      'Ce qu il fait',
      'La journee',
      'Autonomie',
      'Fiche technique',
      'Accessoires',
      'Comparer',
    ],
  },
  {
    titre: 'Acheter',
    liens: [
      'Precommander',
      'Financement',
      'Reprise',
      'Revendeurs',
      'Entreprises',
      'Cadeau',
    ],
  },
  {
    titre: 'Aide',
    liens: [
      'Questions',
      'Mise en route',
      'Garantie',
      'Reparations',
      'Pieces detachees',
      'Etat du service',
    ],
  },
  {
    titre: 'Donnees',
    liens: [
      'Ce qu il voit',
      'Ce qu il garde',
      'Ce qui sort',
      'Mises a jour',
      'Securite',
      'Transparence',
    ],
  },
  {
    titre: 'Maison',
    liens: ['Come, Italie', 'L atelier', 'Journal', 'Presse', 'Emplois', 'Contact'],
  },
  {
    titre: 'Legal',
    liens: [
      'Conditions',
      'Confidentialite',
      'Cookies',
      'Accessibilite',
      'Conformite',
      'Rappels',
    ],
  },
] as const

/* ============================ Le rendu ================================= */

/** Une heure ecrite « 07 h ». */
function heure(h: number): string {
  return `${String(h).padStart(2, '0')} h`
}

/**
 * L heure qui se coule dans la suivante.
 *
 * `MorphText` boucle sans fin entre ses mots ; ici la fusion ne doit jouer
 * qu une fois, de l heure quittee a l heure atteinte. On la laisse jouer le
 * temps d une fusion, puis on fige l heure atteinte.
 */
function HeureFondue({
  de,
  a,
}: {
  readonly de: string
  readonly a: string
}): ReactElement {
  const { reduced } = useMotionState()
  const [fige, setFige] = useState(reduced || de === a)
  useEffect(() => {
    if (fige) return
    const id = window.setTimeout(() => {
      setFige(true)
    }, 1000)
    return () => {
      window.clearTimeout(id)
    }
  }, [fige])
  if (fige) return <span>{a}</span>
  return <MorphText mots={[de, a]} hold={40} morph={820} flou={14} fusion={5} />
}

/**
 * L elevation de face, dessinee au trait.
 *
 * C est le repli de l objet en volume : sous mouvement reduit, sans WebGL ou
 * quand le plafond de surfaces est atteint, la page doit montrer la meme
 * machine. Une elevation la donne entierement — la tete et sa visiere, les
 * deux bras a une articulation, la coque, le socle et sa roue — avec sa cote
 * a gauche, comme sur une planche d atelier.
 */
function RobotDessine(): ReactElement {
  return (
    <svg
      viewBox="0 0 200 300"
      className="o-h-full o-w-full"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g opacity="0.92">
        {/* L antenne */}
        <circle cx="100" cy="28" r="4" fill="currentColor" stroke="none" />
        <path d="M100 32v12" />
        {/* La tete et sa visiere */}
        <ellipse cx="100" cy="82" rx="44" ry="38" />
        <path d="M77 74h46a9 9 0 0 1 0 18H77a9 9 0 0 1 0-18Z" />
        <circle cx="88" cy="83" r="3.5" fill="currentColor" stroke="none" />
        <circle cx="112" cy="83" r="3.5" fill="currentColor" stroke="none" />
        {/* Le col */}
        <path d="M86 116h28l5 34H81Z" />
        {/* La coque, et sa ceinture */}
        <path d="M58 244V186a42 42 0 0 1 84 0v58Z" />
        <path d="M58 210h84" opacity="0.6" />
        {/* Les deux bras, a une articulation */}
        <path d="M142 192l28 30" />
        <circle cx="170" cy="222" r="6" />
        <path d="M170 228l-4 26M162 254v10M170 254v10" />
        <path d="M58 192l-28 30" />
        <circle cx="30" cy="222" r="6" />
        <path d="M30 228l4 26M30 254v10M38 254v10" />
        {/* Le socle et la roue */}
        <path d="M64 244h72l14 22H50Z" />
        <ellipse cx="100" cy="272" rx="50" ry="10" />
        {/* La cote : un metre douze, du sol a l antenne */}
        <path d="M18 28v244M13 28h10M13 272h10" opacity="0.45" />
      </g>
    </svg>
  )
}

/**
 * Nubo en volume : un corps, une tete qui s incline, deux bras a une
 * articulation, un socle a roue unique.
 *
 * La page n a aucun fond en three.js — la nappe et le grain sont en CSS — et
 * cette scene est donc la seule surface WebGL. Elle ne decore rien : elle est
 * le produit, et c est la raison pour laquelle le repli dessine doit tenir
 * exactement la meme place.
 *
 * Deux mouvements, et pas un de plus : il **respire** (la coque se gonfle d un
 * pour cent), et il **suit lentement le regard** — la tete d abord, le corps
 * d un quart. L amortissement passe par `1 - exp(-k dt)` pour que le suivi
 * garde la meme vitesse quelle que soit la cadence de l ecran.
 */
function RobotEnVolume(): ReactElement {
  // Le pointeur vise, la tete rejoint. Une ref, parce que ni la construction
  // ni l image ne doivent declencher un rendu React.
  const regard = useRef({ viseX: 0, viseY: 0, x: 0, y: 0 })

  return (
    <Volume
      nom="robot Nubo"
      className="o-absolute o-inset-0 o-z-0"
      repli={
        <div className="o-flex o-h-full o-items-center o-justify-center o-p-10 o-text-stone-200 o-opacity-80">
          <RobotDessine />
        </div>
      }
      construire={(contexte) => {
        const { scene, camera, three } = contexte
        const aLiberer: { dispose: () => void }[] = []

        // Les teintes viennent de la palette de la vitrine : repeindre la page
        // en vert repeint la coque, sans quoi l objet mentirait sur la page.
        const coque = new three.MeshPhysicalMaterial({
          color: teinte('--o-vitrine-100', '#f6ece0'),
          roughness: 0.42,
          metalness: 0.04,
          clearcoat: 0.85,
          clearcoatRoughness: 0.22,
        })
        const acier = new three.MeshStandardMaterial({
          color: teinte('--o-vitrine-800', '#3a2b20'),
          roughness: 0.34,
          metalness: 0.72,
        })
        const lueurCouleur = teinte('--o-vitrine-400', '#e6a862')
        const lueur = new three.MeshStandardMaterial({
          color: lueurCouleur,
          emissive: lueurCouleur,
          emissiveIntensity: 1.6,
          roughness: 0.4,
        })
        aLiberer.push(coque, acier, lueur)

        const gRoue = new three.TorusGeometry(0.6, 0.11, 14, 44)
        const gSocle = new three.CylinderGeometry(0.46, 0.68, 0.26, 40)
        const gCorps = new three.CapsuleGeometry(0.56, 1.06, 10, 32)
        const gCeinture = new three.TorusGeometry(0.575, 0.042, 12, 48)
        const gCol = new three.CylinderGeometry(0.2, 0.3, 0.3, 20)
        const gTete = new three.SphereGeometry(0.5, 40, 28)
        // La visiere : une calotte partielle prise sur l avant de la tete.
        // `phi` vaut un quart de tour au droit du +z, donc la bande s ouvre
        // de part et d autre de la face ; `theta` la descend jusqu a l equateur.
        const gVisiere = new three.SphereGeometry(
          0.516,
          40,
          20,
          Math.PI / 2 - 0.8,
          1.6,
          1.02,
          0.72,
        )
        const gOeil = new three.SphereGeometry(0.05, 16, 12)
        const gTige = new three.CylinderGeometry(0.016, 0.016, 0.3, 8)
        const gBille = new three.SphereGeometry(0.055, 16, 12)
        const gEpaule = new three.SphereGeometry(0.16, 20, 16)
        const gBrasHaut = new three.CylinderGeometry(0.105, 0.092, 0.68, 20)
        const gCoude = new three.SphereGeometry(0.12, 18, 14)
        const gAvantBras = new three.CylinderGeometry(0.09, 0.074, 0.6, 20)
        const gDoigt = new three.BoxGeometry(0.042, 0.16, 0.06)
        aLiberer.push(
          gRoue,
          gSocle,
          gCorps,
          gCeinture,
          gCol,
          gTete,
          gVisiere,
          gOeil,
          gTige,
          gBille,
          gEpaule,
          gBrasHaut,
          gCoude,
          gAvantBras,
          gDoigt,
        )

        const robot = new three.Group()
        robot.name = 'robot'

        const roue = new three.Mesh(gRoue, acier)
        roue.rotation.x = Math.PI / 2
        roue.position.y = -1.48
        const socle = new three.Mesh(gSocle, acier)
        socle.position.y = -1.34

        const corps = new three.Mesh(gCorps, coque)
        corps.name = 'corps'
        corps.position.y = -0.34
        const ceinture = new three.Mesh(gCeinture, lueur)
        ceinture.rotation.x = Math.PI / 2
        ceinture.position.y = -0.12
        const col = new three.Mesh(gCol, acier)
        col.position.y = 0.86

        // La tete est un groupe : c est lui qui s incline, pas la coque.
        const tete = new three.Group()
        tete.name = 'tete'
        tete.position.y = 1.42
        const crane = new three.Mesh(gTete, coque)
        const visiere = new three.Mesh(gVisiere, acier)
        const oeilGauche = new three.Mesh(gOeil, lueur)
        oeilGauche.position.set(-0.15, 0.01, 0.515)
        const oeilDroit = new three.Mesh(gOeil, lueur)
        oeilDroit.position.set(0.15, 0.01, 0.515)
        const tige = new three.Mesh(gTige, acier)
        tige.position.y = 0.62
        const bille = new three.Mesh(gBille, lueur)
        bille.position.y = 0.8
        tete.add(crane, visiere, oeilGauche, oeilDroit, tige, bille)

        // Les deux bras partagent leurs geometries : un seul jeu, deux groupes.
        const faireBras = (signe: number): InstanceType<typeof three.Group> => {
          const bras = new three.Group()
          bras.position.set(signe * 0.56, 0.5, 0.05)
          bras.rotation.z = signe * 0.44
          bras.add(new three.Mesh(gEpaule, acier))
          const haut = new three.Mesh(gBrasHaut, coque)
          haut.position.y = -0.34
          bras.add(haut)
          const avant = new three.Group()
          avant.position.y = -0.68
          avant.rotation.x = -0.3
          avant.rotation.z = signe * -0.2
          const tigeBras = new three.Mesh(gAvantBras, coque)
          tigeBras.position.y = -0.3
          const doigtA = new three.Mesh(gDoigt, acier)
          doigtA.position.set(0.05, -0.64, 0)
          const doigtB = new three.Mesh(gDoigt, acier)
          doigtB.position.set(-0.05, -0.64, 0)
          avant.add(new three.Mesh(gCoude, acier), tigeBras, doigtA, doigtB)
          bras.add(avant)
          return bras
        }
        const brasDroit = faireBras(1)
        const avantDroit = brasDroit.children[2]
        if (avantDroit !== undefined) avantDroit.name = 'avant'
        robot.add(roue, socle, corps, ceinture, col, tete, brasDroit, faireBras(-1))
        scene.add(robot)

        // Sans lumiere de contour ni lampe de dessous, une coque claire sur un
        // fond sombre est une silhouette plate : les trois lumieres de studio
        // ne suffisent pas a un objet pose sur une plaque.
        eclairer(contexte, {
          cle: 0xfff1dc,
          remplissage: 0x8ba1cc,
          contour: 0xffffff,
          force: 1.1,
        })
        const dessous = new three.PointLight(0xffd9a4, 16, 10, 2)
        dessous.position.set(0, -2.1, 1.9)
        const rasante = new three.PointLight(0xffffff, 13, 12, 2)
        rasante.position.set(-2.9, 1.5, -1.5)
        scene.add(dessous, rasante)

        camera.position.set(0, 0.34, 5.5)
        camera.lookAt(0, 0.1, 0)

        const suivre = (evenement: PointerEvent): void => {
          regard.current.viseX = (evenement.clientX / window.innerWidth) * 2 - 1
          regard.current.viseY = (evenement.clientY / window.innerHeight) * 2 - 1
        }
        window.addEventListener('pointermove', suivre, { passive: true })

        return () => {
          window.removeEventListener('pointermove', suivre)
          for (const chose of aLiberer) chose.dispose()
        }
      }}
      animer={({ scene }, { delta, time }) => {
        const robot = scene.getObjectByName('robot')
        const tete = scene.getObjectByName('tete')
        const corps = scene.getObjectByName('corps')
        const avant = scene.getObjectByName('avant')
        if (robot === undefined || tete === undefined || corps === undefined) return

        const r = regard.current
        const part = 1 - Math.exp(-1.7 * delta)
        r.x += (r.viseX - r.x) * part
        r.y += (r.viseY - r.y) * part

        // Le corps ne fait que suivre : c est la tete qui regarde.
        robot.rotation.y = r.x * 0.24 + Math.sin(time * 0.21) * 0.06
        robot.position.y = Math.sin(time * 0.7) * 0.05
        tete.rotation.y = r.x * 0.44
        tete.rotation.x = r.y * 0.22
        tete.rotation.z = Math.sin(time * 0.44) * 0.03

        // Il respire : un pour cent, et le volume se conserve.
        const souffle = Math.sin(time * 0.9) * 0.012
        corps.scale.set(1 - souffle * 0.5, 1 + souffle, 1 - souffle * 0.5)

        if (avant !== undefined) avant.rotation.x = -0.5 + Math.sin(time * 0.55) * 0.14
      }}
    />
  )
}

/** La journee : on coche les pieces, la scene epinglee les traverse. */
function Journee(): ReactElement {
  const [cochees, setCochees] = useState<readonly string[]>(
    PIECES.map((p) => p.nom).slice(0, 4),
  )
  const basculer = (nom: string): void => {
    setCochees((avant) =>
      avant.includes(nom) ? avant.filter((x) => x !== nom) : [...avant, nom],
    )
  }
  const retenues = useMemo(() => PIECES.filter((p) => cochees.includes(p.nom)), [cochees])
  const minutes = retenues.reduce((s, p) => s + p.minutesRendues, 0)
  const actes = Math.max(1, retenues.length)

  return (
    <Epingle
      ecrans={Math.max(2.5, actes * 0.9)}
      actes={actes}
      className="o-bg-stone-50 dark:o-bg-zinc-950"
    >
      {(acte) => {
        const courante = retenues[acte] ?? null
        const precedente = retenues[acte - 1] ?? null
        return (
          <div
            className="o-mx-auto o-grid o-h-full o-max-w-7xl o-gap-8 o-px-6 o-py-8 lg:o-grid-cols-12 lg:o-items-center lg:o-gap-12"
            style={{ paddingTop: '2rem' }}
          >
            {/* Les pieces qu il prend : le mecanisme, a gauche. */}
            <div className="lg:o-col-span-4">
              <Indice rang="02" sombre={false}>
                La journee
              </Indice>
              <h2
                className="o-m-0 o-mt-5"
                style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3vw, 2.75rem)' }}
              >
                Cochez les pieces. Defilez : la journee passe.
              </h2>
              <ul className="o-m-0 o-mt-6 o-list-none o-p-0">
                {PIECES.map((p) => {
                  const actif = cochees.includes(p.nom)
                  const enCours = courante?.nom === p.nom
                  return (
                    <li
                      key={p.nom}
                      className="o-border-t o-border-black-10 dark:o-border-zinc-800"
                    >
                      <button
                        type="button"
                        aria-pressed={actif}
                        onClick={() => {
                          basculer(p.nom)
                        }}
                        className="o-flex o-w-full o-items-center o-gap-3 o-py-2.5 o-text-left focus:o-ring"
                      >
                        <span
                          aria-hidden="true"
                          className="o-inline-flex o-size-5 o-shrink-0 o-items-center o-justify-center o-rounded-full o-border-w-1"
                          style={
                            actif
                              ? { ...aplat(), borderColor: 'transparent' }
                              : { borderColor: 'var(--o-theme-line)' }
                          }
                        >
                          {actif && <Icon icon={Check} size={12} />}
                        </span>
                        <span
                          className={`o-grow o-text-sm ${enCours ? 'o-font-semibold' : 'o-font-medium'}`}
                        >
                          {p.nom}
                        </span>
                        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                          {heure(p.heure)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p className="o-m-0 o-mt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                {retenues.length === 0
                  ? 'Cochez une piece : la journee se dessine.'
                  : `${String(Math.floor(minutes / 60))} h ${String(minutes % 60).padStart(2, '0')} rendues par jour`}
              </p>
            </div>

            {/* La scene : l heure, la piece, la frise. */}
            <div className="o-min-w-0 lg:o-col-span-8">
              <div
                className="o-rounded-3xl o-p-6 md:o-p-10"
                style={{ backgroundColor: accentDoux(400, 14) }}
              >
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-300">
                  {courante === null
                    ? 'Aucune piece cochee'
                    : `Acte ${String(acte + 1)} sur ${String(actes)} — ${String(courante.duree)} minutes`}
                </p>
                <p
                  aria-live="polite"
                  className="o-m-0 o-mt-3 o-tabular-nums"
                  style={{
                    ...affiche('xl', 300),
                    fontSize: 'clamp(4rem, 11vw, 10rem)',
                    lineHeight: 0.9,
                    color: encre(),
                  }}
                >
                  {courante === null ? (
                    '— h'
                  ) : (
                    <HeureFondue
                      key={courante.nom}
                      de={heure((precedente ?? courante).heure)}
                      a={heure(courante.heure)}
                    />
                  )}
                </p>
                <h3
                  className="o-m-0 o-mt-6"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.5vw, 3.25rem)',
                  }}
                >
                  {courante?.nom ?? 'Il attend.'}
                </h3>
                <p className="o-m-0 o-mt-3 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                  {courante?.quoi ?? 'Il ne fait rien sans qu on le lui ait demande.'}
                </p>

                {/* La frise des vingt-quatre heures, et le curseur qui suit le defilement. */}
                <div className="o-relative o-mt-8" aria-hidden="true">
                  <div className="o-grid o-grid-cols-12 o-border-b o-border-black-10 o-pb-2 o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-border-zinc-800 dark:o-text-zinc-400">
                    {Array.from({ length: 12 }, (_, k) => (
                      <span key={k}>{String(k * 2).padStart(2, '0')}</span>
                    ))}
                  </div>
                  <div className="o-relative o-mt-3 o-h-8">
                    {retenues.map((p) => (
                      <span
                        key={p.nom}
                        className="o-absolute o-inset-y-0 o-rounded-md o-transition-opacity"
                        style={{
                          left: `${String((p.heure / 24) * 100)}%`,
                          width: `${String(Math.max(3, (p.duree / 60 / 24) * 100 * 2))}%`,
                          backgroundColor: encre(),
                          opacity: courante?.nom === p.nom ? 1 : 0.35,
                        }}
                      />
                    ))}
                    {/* Le curseur : la progression de la scene, ecrite en `--p`. */}
                    <span
                      className="o-absolute o-inset-y-0 o-w-px"
                      style={
                        {
                          left: 'calc(var(--p, 0) * 100%)',
                          backgroundColor: 'var(--o-theme-fg)',
                          boxShadow: '0 0 0 1px var(--o-theme-bg)',
                        } as CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </Epingle>
  )
}

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')

  return (
    <Porte forme="iris" marque="Nubo">
      <div
        className="o-bg-stone-50 o-text-zinc-950 dark:o-bg-zinc-950 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : la cuisine, une nappe chaude ==== */}
        <header
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden"
          style={nuit('stone')}
        >
          <img
            src={photo('perrin-cuisine', 1800, 1100)}
            alt=""
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0 o-size-full o-object-cover"
            style={{ filter: 'sepia(0.25) saturate(0.9)' }}
          />
          <Nappe
            couleurs={[
              accentDoux(400, 70),
              'var(--o-palette-orange-300)',
              'var(--o-palette-stone-300)',
            ]}
            opacite={0.45}
            style={{ mixBlendMode: 'soft-light' }}
          />
          <Voile sens="centre" famille="stone" />
          <Grain opacite={0.05} />

          <BarreGelule
            marque="Nubo"
            liens={[
              ['#machine', 'La machine'],
              ['#journee', 'La journee'],
              ['#quoi', 'Ce qu il fait'],
              ['#questions', 'Questions'],
            ]}
            action={['#precommande', 'Precommander']}
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-min-h-screen o-max-w-5xl o-flex-col o-items-center o-justify-center o-px-6 o-pb-32 o-pt-28 o-text-center">
            <Surgit>
              <Etiquette>Toujours aimable. Presque invisible.</Etiquette>
            </Surgit>
            <Surgit
              delai={120}
              as="h1"
              className="o-m-0 o-mt-7 o-max-w-4xl o-text-stone-50"
              style={affiche('l', 300)}
            >
              Une aide plus <Accent couleur={encreSurSombre()}>discrete</Accent> a la
              maison.
            </Surgit>
            <Surgit
              delai={400}
              as="p"
              className="o-m-0 o-mt-7 o-max-w-xl o-font-mono o-text-sm o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-300"
            >
              Nubo prend les petites taches du quotidien sans jamais reclamer votre
              attention.
            </Surgit>
            <Surgit delai={520} className="o-mt-9">
              <Actions
                pleine={[
                  '#precommande',
                  <>
                    Precommander <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                  </>,
                ]}
                fantome={[
                  '#journee',
                  <>
                    <Icon icon={Play} size={14} aria-hidden="true" /> Voir sa journee
                  </>,
                ]}
              />
            </Surgit>
          </div>

          <div className="o-relative o-z-10 o-mx-auto o-max-w-5xl o-px-6">
            <Surgit delai={700}>
              <Logos
                marques={[
                  'Elasticpath',
                  'Sonder',
                  'Ligne Claire',
                  'Habitat Nord',
                  'Maison Perrin',
                  'Les Tamaris',
                ]}
                titre="Deja dans des foyers a Come, Lyon et Nantes"
              />
            </Surgit>
          </div>
        </header>

        <main>
          {/* ================= La machine, en volume ======================== */}
          <section id="machine" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-py-32">
            <div className="o-mx-auto o-max-w-6xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Reveal>
                    <Indice rang="01" sombre={false}>
                      La machine
                    </Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <h2 className="o-m-0 o-mt-6 o-text-balance" style={affiche('m', 300)}>
                      Un metre douze.{' '}
                      <span className="o-text-zinc-500 dark:o-text-zinc-400">
                        Vingt-deux kilos.
                      </span>
                    </h2>
                  </Reveal>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                  Passez le pointeur sur la plaque : il tourne la tete vers vous, et rien
                  de plus. C est tout ce qu il fera jamais de son propre chef.
                </p>
              </div>

              <div className="o-mt-14 o-grid o-gap-10 lg:o-grid-cols-12 lg:o-items-center">
                {/* La plaque : l objet, et rien d autre. Toujours sombre. */}
                <figure className="o-m-0 lg:o-order-2 lg:o-col-span-6">
                  <div
                    className="o-relative o-isolate o-aspect-square o-overflow-hidden o-rounded-3xl"
                    style={{
                      ...nuit('stone'),
                      backgroundImage: `radial-gradient(58% 54% at 50% 40%, ${accentDoux(500, 34)} 0%, transparent 72%)`,
                    }}
                  >
                    <RobotEnVolume />
                    <Grain opacite={0.07} />
                    <figcaption className="o-absolute o-inset-x-0 o-bottom-0 o-z-10 o-flex o-flex-wrap o-justify-between o-gap-3 o-p-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                      <span>Fig. 01 — Nubo, de face</span>
                      <span className="o-tabular-nums">112 cm · 22 kg · 36 dB</span>
                    </figcaption>
                  </div>
                </figure>

                {/* La legende, dans les marges : deux reperes de chaque cote. */}
                {[REPERES.slice(0, 2), REPERES.slice(2)].map((colonne, rang) => (
                  <ul
                    key={rang}
                    className={`o-m-0 o-flex o-list-none o-flex-col o-gap-10 o-p-0 lg:o-col-span-3 ${rang === 0 ? 'lg:o-order-1 lg:o-text-right' : 'lg:o-order-3'}`}
                  >
                    {colonne.map(([numero, titre, texte]) => (
                      <li key={numero}>
                        <Reveal delay={Number(numero) * 60}>
                          <p
                            className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                            style={{ color: encre() }}
                          >
                            ({numero})
                          </p>
                          <p className="o-m-0 o-mt-3 o-text-base o-font-medium">
                            {titre}
                          </p>
                          <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                            {texte}
                          </p>
                          <span
                            aria-hidden="true"
                            className={`o-mt-5 o-block o-h-px o-w-12 o-bg-black-10 dark:o-bg-zinc-800 ${rang === 0 ? 'lg:o-ml-auto' : ''}`}
                          />
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </section>

          {/* ================= La journee, epinglee : le mecanisme ========= */}
          <section
            id="journee"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800"
          >
            <Journee />
          </section>

          {/* ================= Les capacites, en mosaique ================== */}
          <section
            id="quoi"
            className="o-scroll-mt-24 o-border-t o-border-black-10 o-px-6 o-py-24 dark:o-border-zinc-800 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Reveal>
                    <Indice rang="03" sombre={false}>
                      Ce qu il fait
                    </Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <h2 className="o-m-0 o-mt-6 o-text-balance" style={affiche('m', 300)}>
                      Un robot.{' '}
                      <span className="o-text-zinc-500 dark:o-text-zinc-400">
                        Chaque piece.
                      </span>
                    </h2>
                  </Reveal>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                  Il apprend la maison en une semaine, sans carte a dessiner. Ensuite il
                  fait, et il se tait.
                </p>
              </div>
              <BentoGrid
                className="o-mt-14"
                label="Ce que Nubo sait faire"
                columns={4}
                rowHeight={200}
                items={CAPACITES.map((c) => ({
                  id: c.id,
                  title: c.title,
                  body: <p className="o-m-0">{c.body}</p>,
                  cols: c.cols,
                  rows: c.rows,
                  featured: 'featured' in c ? c.featured : false,
                  media:
                    'graine' in c ? (
                      <img
                        src={photo(c.graine, 900, 600)}
                        alt={c.alt}
                        className="o-h-full o-w-full o-rounded-lg o-object-cover"
                        style={{ filter: 'sepia(0.2) saturate(0.9)' }}
                      />
                    ) : undefined,
                }))}
              />
            </div>
          </section>

          {/* ================= C3 : un seul nombre, les heures d autonomie === */}
          <section
            aria-label="Autonomie"
            className="o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 md:o-py-32"
            style={nuit('stone')}
          >
            <div
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-0"
              style={{
                background: `radial-gradient(ellipse at 20% 50%, ${accentDoux(500, 24)} 0%, transparent 55%)`,
              }}
            />
            <Grain opacite={0.06} />
            <div className="o-relative o-z-10 o-mx-auto o-grid o-max-w-6xl o-items-end o-gap-8 md:o-grid-cols-12">
              <p
                className="o-m-0 o-tabular-nums o-text-stone-50 md:o-col-span-7"
                style={{
                  ...affiche('xxl', 300),
                  fontSize: 'clamp(6rem, 18vw, 15rem)',
                  lineHeight: 0.85,
                }}
              >
                14 h
              </p>
              <p className="o-m-0 o-max-w-sm o-text-lg o-leading-relaxed o-text-stone-200 md:o-col-span-5 md:o-pb-4">
                d autonomie, une charge la nuit sur son socle, jamais un arret en plein
                service. Le seul chiffre que nous mettons en avant : c est le seul que
                vous sentirez.
              </p>
            </div>
          </section>

          {/* ================= Les questions =============================== */}
          <section id="questions" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-py-32">
            <div className="o-mx-auto o-grid o-max-w-6xl o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-4">
                <Indice rang="04" sombre={false}>
                  Questions
                </Indice>
                <h2 className="o-m-0 o-mt-6" style={affiche('m', 300)}>
                  Comment nous mesurons.
                </h2>
              </div>
              <div className="md:o-col-span-8">
                <Faq
                  single
                  items={[
                    {
                      question: 'Qu est-ce qui compte comme une tache finie ?',
                      answer: (
                        <p>
                          Une tache dont vous n avez rien eu a refaire dans l heure. Si
                          vous repassez derriere, elle compte comme reprise, et c est ce
                          chiffre qu on publie chaque mois, tel quel.
                        </p>
                      ),
                    },
                    {
                      question: 'Que voit-il, et ou vont les images ?',
                      answer: (
                        <p>
                          Il voit ce qu il faut pour ne rien casser, et rien ne sort de la
                          maison. Les images sont detruites a la fin de chaque tache, sur
                          l appareil.
                        </p>
                      ),
                    },
                    {
                      question: 'Et s il casse quelque chose ?',
                      answer: (
                        <p>
                          Il ne l a pas encore fait. Si cela arrive, c est couvert, sans
                          franchise, pendant cinq ans.
                        </p>
                      ),
                    },
                    {
                      question: 'Combien de temps pour qu il connaisse la maison ?',
                      answer: (
                        <p>
                          Une semaine. Il commence par les pieces cochees, et vous dit
                          chaque soir ce qu il a compris.
                        </p>
                      ),
                    },
                    {
                      question: 'Et la nuit ?',
                      answer: (
                        <p>
                          Il dort sur son socle, se charge, et ne roule pas. Si vous
                          cochez « cuisine, le soir », il finit avant vingt-deux heures.
                        </p>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* ================= A7 : la precommande, une date ================ */}
          <section
            id="precommande"
            className="o-scroll-mt-24 o-border-t o-border-black-10 o-px-6 o-py-24 dark:o-border-zinc-800 md:o-py-36"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Premieres livraisons en France a partir du
              </p>
              <p
                className="o-m-0 o-mt-4 o-text-balance"
                style={{
                  ...affiche('xl', 300),
                  fontSize: 'clamp(3rem, 11vw, 10rem)',
                  lineHeight: 0.9,
                }}
              >
                12 <Accent couleur={encre()}>octobre</Accent> 2026
              </p>
              <div className="o-mt-10 o-flex o-flex-wrap o-items-center o-gap-6">
                <a href="#precommande" className={GELULE} style={aplat()}>
                  Precommander un Nubo{' '}
                  <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </a>
                <p className="o-m-0 o-max-w-md o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  3 290 EUR, ou 89 EUR par mois sur trois ans
                  <br />
                  Mise en route a domicile, retour libre sous trente jours
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* ================= P4 : le plan du site, dense ===================== */}
        <footer className="o-border-t o-border-black-10 o-px-6 o-pb-8 o-pt-14 dark:o-border-zinc-800">
          <div className="o-mx-auto o-max-w-6xl">
            <div className="o-grid o-grid-cols-2 o-gap-x-6 o-gap-y-8 sm:o-grid-cols-3 lg:o-grid-cols-6">
              {PLAN.map((col) => (
                <nav key={col.titre} aria-label={col.titre}>
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-50">
                    {col.titre}
                  </p>
                  <ul className="o-m-0 o-mt-3 o-list-none o-p-0">
                    {col.liens.map((l) => (
                      <li key={l}>
                        <a
                          href="#journee"
                          className="o-block o-py-0.5 o-text-xs o-no-underline o-text-zinc-600 o-transition-colors hover:o-text-zinc-950 focus:o-ring dark:o-text-zinc-400 dark:hover:o-text-zinc-50"
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
            <div className="o-mt-12 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-black-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-border-zinc-800 dark:o-text-zinc-400">
              <span className="o-text-zinc-950 dark:o-text-zinc-50">Nubo</span>
              <span>Nubo Srl — Como — fabrique en Italie, livre en France</span>
              <span>© 2026</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
