/**
 * Sillon Noir — disquaire d occasion, Marseille.
 *
 * ## L objet : un 33 tours qui tourne a 33 tours
 *
 * La page ouvre sur un microsillon en volume, pose sur son plateau, avec son
 * bras de lecture. Il tourne a **33 tours et un tiers par minute** — la vraie
 * vitesse, soit deux pi fois 33,333 divise par 60 radians par seconde, et non a une vitesse
 * choisie pour faire joli. C est le seul chiffre de la page, et c est une
 * vitesse, pas un indicateur.
 *
 * Le fond de la vitrine est donc un degrade CSS et non une scene : l arbitre
 * du moteur accorde une surface par technologie, l objet prend celle de
 * three.js, et il n y a rien d autre a ouvrir. Sous mouvement reduit, sans
 * WebGL ou quand le plafond est atteint, le **repli dessine** montre le meme
 * disque, le meme bras, la meme etiquette.
 *
 * ## Le mecanisme : le bac
 *
 * On feuillette les pochettes comme dans un bac de magasin : le bac est une
 * bande qui defile **au doigt et a la molette**, avec calage sur la pochette
 * de face, et chaque pochette s incline d autant plus qu elle est loin du
 * centre — exactement ce que fait une rangee de disques qu on ecarte.
 *
 * Les intercalaires du dessus sont un **rail** (M-rail) : on les parcourt en
 * defilant verticalement, et en choisir un refait le bac.
 *
 * ## Ce qui est dessine
 *
 * Les pochettes. Aucune n est une photographie : ce sont des motifs
 * geometriques construits sur les deux couleurs de chaque disque, comme les
 * pochettes des labels de jazz des annees soixante. Une photographie de
 * pochette reelle montrerait le travail d une autre maison.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, Disc, Music } from '@odoro-cli/icons/filaire'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'

import { InertiaDrag } from '@/odoro/effect/InertiaDrag.jsx'
import { EchoText } from '@/odoro/text/EchoText.jsx'
import { SortableList } from '@/odoro/ui/SortableList.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import { Rail } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#intercalaires', 'Les bacs'],
  ['#pile', 'La pile'],
  ['#catalogue', 'Catalogue'],
]

/** La vitesse d un microsillon, en radians par seconde. */
const TRENTE_TROIS_TOURS = (2 * Math.PI * (100 / 3)) / 60

/* ============================ Le catalogue ============================= */

/** Le motif d une pochette : quatre grammaires, et rien de plus. */
type Motif = 'bandes' | 'cercle' | 'angles' | 'grille'

/** Un disque du bac. */
interface Disque {
  readonly cle: string
  readonly artiste: string
  readonly titre: string
  readonly label: string
  readonly annee: string
  readonly format: '33 tours' | '45 tours' | '33 tours, double'
  /** La cote du disquaire, de la pochette et du vinyle. */
  readonly etat: string
  readonly prix: string
  /** Le numero de matrice grave dans le sillon de sortie. */
  readonly matrice: string
  /** Le bac ou il est range. */
  readonly bac: string
  readonly motif: Motif
  /** Les deux couleurs de la pochette, en jetons ou en fonctions de palette. */
  readonly couleurs: readonly [string, string]
  readonly mot: string
}

const DISQUES: readonly [Disque, ...Disque[]] = [
  {
    cle: 'nuit-basse',
    artiste: 'Orchestre du Panier',
    titre: 'Nuit basse',
    label: 'Calanque Records',
    annee: '1974',
    format: '33 tours',
    etat: 'Pochette VG+, vinyle EX',
    prix: '32 EUR',
    matrice: 'CQ-1174-A / B2',
    bac: 'jazz',
    motif: 'cercle',
    couleurs: ['--o-vitrine-500', '--o-palette-amber-300'],
    mot: 'Premier pressage, pochette ouvrante. Le cote B tient tout seul, le A demande de la patience.',
  },
  {
    cle: 'ligne-14',
    artiste: 'Tarek & les Faux Frais',
    titre: 'Ligne 14',
    label: 'Beton Brut',
    annee: '1981',
    format: '33 tours',
    etat: 'Pochette EX, vinyle NM',
    prix: '45 EUR',
    matrice: 'BB-0081-A1 / B1',
    bac: 'post-punk',
    motif: 'angles',
    couleurs: ['--o-palette-zinc-100', '--o-vitrine-600'],
    mot: 'Mille exemplaires, jamais reedite. Le morceau de sept minutes en face B est la raison du prix.',
  },
  {
    cle: 'fanfare',
    artiste: 'Fanfare du Vieux-Port',
    titre: 'Sortie de messe',
    label: 'Calanque Records',
    annee: '1969',
    format: '33 tours',
    etat: 'Pochette VG, vinyle VG+',
    prix: '18 EUR',
    matrice: 'CQ-0469-A / B',
    bac: 'local',
    motif: 'bandes',
    couleurs: ['--o-palette-amber-400', '--o-vitrine-800'],
    mot: 'Enregistre dans une eglise, avec la reverberation que cela suppose. Coin de pochette fendu, prix en consequence.',
  },
  {
    cle: 'atoll',
    artiste: 'Nadia Bernier',
    titre: 'Atoll',
    label: 'Pavillon',
    annee: '1978',
    format: '33 tours, double',
    etat: 'Pochette NM, vinyle NM',
    prix: '68 EUR',
    matrice: 'PV-2278-A / D',
    bac: 'jazz',
    motif: 'grille',
    couleurs: ['--o-palette-teal-500', '--o-palette-zinc-900'],
    mot: 'Double album, encore sous cellophane d origine ouverte proprement. Le disque deux n a jamais tourne.',
  },
  {
    cle: 'siroco',
    artiste: 'Siroco',
    titre: 'Vent de terre',
    label: 'Pavillon',
    annee: '1976',
    format: '33 tours',
    etat: 'Pochette VG+, vinyle EX',
    prix: '27 EUR',
    matrice: 'PV-1176-A2 / B1',
    bac: 'local',
    motif: 'cercle',
    couleurs: ['--o-vitrine-400', '--o-palette-stone-800'],
    mot: 'Le disque que tout le monde a chez ses parents, mais rarement en pressage francais. Celui-la l est.',
  },
  {
    cle: 'carrelage',
    artiste: 'Carrelage',
    titre: 'Sols souples',
    label: 'Beton Brut',
    annee: '1983',
    format: '45 tours',
    etat: 'Pochette EX, vinyle EX',
    prix: '14 EUR',
    matrice: 'BB-4583-A / AA',
    bac: 'post-punk',
    motif: 'angles',
    couleurs: ['--o-palette-zinc-900', '--o-vitrine-300'],
    mot: 'Deux titres, quatre minutes, et une boite a rythmes qui deraille a la fin. On l aime pour cela.',
  },
  {
    cle: 'seize',
    artiste: 'Groupe Seize',
    titre: 'Chant du mistral',
    label: 'Calanque Records',
    annee: '1972',
    format: '33 tours',
    etat: 'Pochette VG, vinyle VG+',
    prix: '22 EUR',
    matrice: 'CQ-0872-A / B3',
    bac: 'jazz',
    motif: 'bandes',
    couleurs: ['--o-palette-rose-400', '--o-vitrine-900'],
    mot: 'Troisieme gravure du cote B, la meilleure. Ecoutez-la au casque avant d acheter, le comptoir est libre.',
  },
  {
    cle: 'quai-neuf',
    artiste: 'Quai Neuf',
    titre: 'Boulevard interieur',
    label: 'Beton Brut',
    annee: '1985',
    format: '33 tours',
    etat: 'Pochette EX, vinyle NM',
    prix: '38 EUR',
    matrice: 'BB-0385-A1 / B2',
    bac: 'post-punk',
    motif: 'grille',
    couleurs: ['--o-vitrine-700', '--o-palette-zinc-100'],
    mot: 'Le disque de la maison. Nous en avons vendu onze en dix ans, et repris sept.',
  },
  {
    cle: 'ecume',
    artiste: 'Ecume',
    titre: 'Balise',
    label: 'Pavillon',
    annee: '1979',
    format: '45 tours',
    etat: 'Pochette VG+, vinyle EX',
    prix: '12 EUR',
    matrice: 'PV-4579-A / B',
    bac: 'local',
    motif: 'cercle',
    couleurs: ['--o-palette-sky-400', '--o-vitrine-800'],
    mot: 'Face B instrumentale, plus longue que la face A. C est souvent bon signe.',
  },
]

/** Les intercalaires du bac, ceux qu on pousse du doigt pour chercher. */
const INTERCALAIRES = [
  { cle: 'tous', titre: 'Tout le bac', sous: 'Neuf disques d occasion, tous ecoutes' },
  { cle: 'jazz', titre: 'Jazz spirituel', sous: 'France et Mediterranee, 1968 a 1980' },
  { cle: 'post-punk', titre: 'Post-punk FR', sous: 'Pressages independants, 1979 a 1986' },
  { cle: 'local', titre: 'Marseille', sous: 'Ce qui a ete grave a moins de vingt kilometres' },
  { cle: 'fanfare', titre: 'Fanfares et cuivres', sous: 'Le bac que personne ne regarde et qu on defend' },
  { cle: 'un-euro', titre: 'Le bac a un euro', sous: 'Dehors, sous l auvent, sans garantie' },
] as const

/** Les cotes du disquaire, telles qu elles sont ecrites sur chaque pochette. */
const COTES = [
  ['NM', 'Neuf ou presque — jamais joue, ou joue une fois sur une bonne platine'],
  ['EX', 'Excellent — quelques passages, aucun bruit de surface audible'],
  ['VG+', 'Tres bon — un leger souffle dans les silences, rien qui saute'],
  ['VG', 'Bon — des marques visibles, un ou deux craquements ; le prix en tient compte'],
  ['G', 'Correct — pour ecouter, pas pour collectionner ; vendu tel quel'],
] as const

/* ============================ Les pochettes dessinees ================== */

/**
 * Une pochette, dessinee.
 *
 * Quatre grammaires seulement — bandes, cercle, angles, grille — et deux
 * couleurs par disque. C est ainsi que travaillaient les studios de pochettes
 * des labels de jazz : une regle, un compas, deux encres.
 */
function Pochette({ disque }: { readonly disque: Disque }): ReactElement {
  const [a, b] = disque.couleurs
  const fond = a.startsWith('--') ? `var(${a})` : a
  const trait = b.startsWith('--') ? `var(${b})` : b
  const motifs: Readonly<Record<Motif, ReactElement>> = {
    bandes: (
      <>
        {[0, 1, 2, 3, 4].map((rang) => (
          <rect key={rang} x="0" y={26 + rang * 34} width="300" height={12 + rang * 3} fill={trait} opacity={0.9 - rang * 0.12} />
        ))}
      </>
    ),
    cercle: (
      <>
        <circle cx="150" cy="140" r="96" fill="none" stroke={trait} strokeWidth="26" />
        <circle cx="150" cy="140" r="42" fill={trait} />
        <rect x="0" y="248" width="300" height="10" fill={trait} />
      </>
    ),
    angles: (
      <>
        <path d="M0 300 150 40 300 300Z" fill={trait} opacity="0.92" />
        <path d="M0 300 110 120 220 300Z" fill={fond} opacity="0.45" />
        <rect x="24" y="24" width="252" height="252" fill="none" stroke={trait} strokeWidth="3" />
      </>
    ),
    grille: (
      <>
        {Array.from({ length: 6 }, (_, ligne) =>
          Array.from({ length: 6 }, (_, colonne) => (
            <rect
              key={`${String(ligne)}-${String(colonne)}`}
              x={18 + colonne * 44}
              y={18 + ligne * 44}
              width="34"
              height="34"
              fill={trait}
              opacity={((ligne * 6 + colonne) % 5) / 5 + 0.16}
            />
          )),
        )}
      </>
    ),
  }
  return (
    <svg viewBox="0 0 300 300" className="o-h-full o-w-full" aria-hidden="true">
      <rect width="300" height="300" fill={fond} />
      {motifs[disque.motif]}
    </svg>
  )
}

/* ============================ Le repli du disque ======================= */

/**
 * Le microsillon, dessine.
 *
 * C est le repli du volume, et il montre exactement la meme chose : le plateau,
 * le disque et ses sillons, l etiquette, le bras et sa cellule. Une page dont
 * l objet disparait sous mouvement reduit n a pas d objet.
 */
function DisqueDessine(): ReactElement {
  return (
    <svg viewBox="0 0 460 460" className="o-h-full o-w-full" aria-hidden="true" fill="none">
      <defs>
        <radialGradient id="o-sillon-brillant" cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.26" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      {/* Le plateau. */}
      <ellipse cx="230" cy="252" rx="196" ry="150" fill={accentDoux(950, 90)} />
      <ellipse cx="230" cy="246" rx="196" ry="150" fill="none" stroke={accent(700)} strokeWidth="2" opacity="0.6" />
      {/* Le disque. */}
      <ellipse cx="230" cy="240" rx="172" ry="132" fill="var(--o-palette-zinc-950)" />
      <ellipse cx="230" cy="240" rx="172" ry="132" fill="url(#o-sillon-brillant)" />
      {[152, 134, 116, 98, 80].map((r) => (
        <ellipse key={r} cx="230" cy="240" rx={r} ry={r * 0.767} fill="none" stroke={accent(200)} strokeWidth="0.9" opacity="0.16" />
      ))}
      {/* L etiquette et l axe. */}
      <ellipse cx="230" cy="240" rx="58" ry="45" fill={accent(500)} />
      <ellipse cx="230" cy="240" rx="58" ry="45" fill="none" stroke={accent(700)} strokeWidth="1.6" />
      <ellipse cx="230" cy="240" rx="6" ry="5" fill="var(--o-palette-zinc-950)" />
      <path d="M196 230h68M196 250h52" stroke={accent(900)} strokeWidth="2.4" opacity="0.6" />
      {/* Le bras et la cellule. */}
      <circle cx="396" cy="150" r="20" fill={accentDoux(800, 80)} stroke={accent(300)} strokeWidth="1.6" />
      <path d="M396 150 264 214" stroke={accent(200)} strokeWidth="7" strokeLinecap="round" />
      <path d="M264 214l-16 16" stroke={accent(200)} strokeWidth="10" strokeLinecap="round" />
      <circle cx="246" cy="232" r="5" fill={accent(400)} />
    </svg>
  )
}

/* ============================ Le bac =================================== */

/** L inclinaison d une pochette selon sa distance au centre du bac. */
function inclinaison(ecart: number): string {
  const borne = Math.max(-2.4, Math.min(2.4, ecart))
  return `perspective(900px) rotateY(${(borne * -17).toFixed(1)}deg) translateZ(${(-Math.abs(borne) * 42).toFixed(0)}px) scale(${(1 - Math.abs(borne) * 0.05).toFixed(3)})`
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('syne')
  const { reduced } = useMotionState()

  const [intercalaire, setIntercalaire] = useState<string>('tous')
  const bac = useMemo(
    () => (intercalaire === 'tous' ? DISQUES : DISQUES.filter((d) => d.bac === intercalaire)),
    [intercalaire],
  )

  const piste = useRef<HTMLDivElement>(null)
  const [devant, setDevant] = useState(0)
  const courant = bac[Math.min(devant, bac.length - 1)] ?? DISQUES[0]

  /** La pile d ecoute : ce qu on met de cote en feuilletant. */
  const [pile, setPile] = useState<readonly string[]>([])
  const [pileOuverte, setPileOuverte] = useState(false)

  const ajouter = (cle: string): void => {
    setPile((avant) => (avant.includes(cle) ? avant : [...avant, cle]))
    setPileOuverte(true)
  }

  /**
   * Ce qui est de face, et comment chaque pochette s incline.
   *
   * Une seule lecture de geometrie par image d animation du defilement : la
   * position de chaque pochette se deduit de la position de la bande, sans
   * demander sa boite a chacune.
   */
  const replacer = useCallback(() => {
    const el = piste.current
    if (el === null) return
    const enfants = [...el.querySelectorAll<HTMLElement>('[data-pochette]')]
    if (enfants.length === 0) return
    const centre = el.scrollLeft + el.clientWidth / 2
    let meilleur = 0
    let ecartMin = Number.POSITIVE_INFINITY
    enfants.forEach((enfant, rang) => {
      const milieu = enfant.offsetLeft + enfant.offsetWidth / 2
      const ecart = (milieu - centre) / enfant.offsetWidth
      enfant.style.transform = inclinaison(ecart)
      enfant.style.zIndex = String(50 - Math.round(Math.abs(ecart) * 10))
      if (Math.abs(ecart) < ecartMin) {
        ecartMin = Math.abs(ecart)
        meilleur = rang
      }
    })
    setDevant((precedent) => (precedent === meilleur ? precedent : meilleur))
  }, [])

  useEffect(() => {
    const el = piste.current
    if (el === null) return
    let demande = 0
    const surDefilement = (): void => {
      if (demande !== 0) return
      demande = window.requestAnimationFrame(() => {
        demande = 0
        replacer()
      })
    }
    el.addEventListener('scroll', surDefilement, { passive: true })
    const observateur = new ResizeObserver(surDefilement)
    observateur.observe(el)
    replacer()
    return () => {
      el.removeEventListener('scroll', surDefilement)
      observateur.disconnect()
      if (demande !== 0) window.cancelAnimationFrame(demande)
    }
  }, [replacer, bac])

  /** Amene une pochette au milieu du bac. */
  const viser = (rang: number): void => {
    const el = piste.current
    if (el === null) return
    const enfant = el.querySelectorAll<HTMLElement>('[data-pochette]')[rang]
    if (enfant === undefined) return
    el.scrollTo({ left: enfant.offsetLeft + enfant.offsetWidth / 2 - el.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' })
  }

  /*
    Le disque en volume : monte une fois, il ne doit pas se reconstruire quand
    le bac change au-dessus de lui.
  */
  const microsillon = useMemo(
    () => (
      <Volume
        nom="microsillon 33 tours"
        className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
        repli={
          <div className="o-flex o-h-full o-items-center o-justify-center o-p-10 o-opacity-90">
            <div className="o-w-full" style={{ maxWidth: 560 }}>
              <DisqueDessine />
            </div>
          </div>
        }
        construire={(contexte) => {
          const { scene, camera, three } = contexte
          const noir = teinte('--o-vitrine-950', '#0c0c0e')
          const etiquette = teinte('--o-vitrine-500', '#c2410c')
          const chrome = teinte('--o-vitrine-200', '#d6d3d1')

          // Le socle incline la platine ; le plateau, lui, tourne dedans. Sans
          // ces deux groupes, incliner l objet ferait tourner le disque de
          // travers, comme une toupie.
          // Le plateau s incline **vers** la camera : une rotation negative
          // montrerait le dessous du disque, etiquette comprise, et c est
          // exactement le defaut qu a eu la premiere version.
          const socle = new three.Group()
          socle.rotation.x = 1.0
          socle.rotation.z = 0.12
          // A droite du titre : la colonne de texte occupe la gauche du cadre,
          // et une platine centree passerait derriere les mots.
          socle.position.set(2.05, 0.45, 0)
          socle.scale.setScalar(0.86)
          scene.add(socle)

          const plateau = new three.Group()
          socle.add(plateau)

          const formeDisque = new three.CylinderGeometry(1.62, 1.62, 0.035, 96, 1)
          const matiereDisque = new three.MeshPhysicalMaterial({
            color: noir,
            metalness: 0.2,
            roughness: 0.34,
            clearcoat: 1,
            clearcoatRoughness: 0.12,
          })
          const disque = new three.Mesh(formeDisque, matiereDisque)
          plateau.add(disque)

          // Les sillons : cinq anneaux tres fins, un peu plus mats que la
          // laque. C est ce qui accroche la lumiere quand le disque tourne, et
          // sans eux un microsillon est un palet noir.
          const formeSillon = new three.TorusGeometry(1, 0.009, 8, 140)
          // Les sillons portent une part d emission : un microsillon noir sur
          // un fond noir ne se voit que par ce qui accroche la lumiere, et
          // c est ce que fait le relief des sillons dans un magasin.
          const matiereSillon = new three.MeshStandardMaterial({
            color: chrome,
            emissive: chrome,
            emissiveIntensity: 0.32,
            roughness: 0.4,
            metalness: 0.5,
            transparent: true,
            opacity: 0.55,
          })
          const sillons: InstanceType<typeof three.Mesh>[] = []
          for (const rayon of [1.5, 1.34, 1.18, 1.02, 0.86]) {
            const anneau = new three.Mesh(formeSillon, matiereSillon)
            anneau.scale.setScalar(rayon)
            anneau.rotation.x = Math.PI / 2
            anneau.position.y = 0.019
            plateau.add(anneau)
            sillons.push(anneau)
          }

          const formeEtiquette = new three.CylinderGeometry(0.54, 0.54, 0.042, 64, 1)
          const matiereEtiquette = new three.MeshStandardMaterial({ color: etiquette, roughness: 0.85 })
          const pastille = new three.Mesh(formeEtiquette, matiereEtiquette)
          pastille.position.y = 0.004
          plateau.add(pastille)

          const formeAxe = new three.CylinderGeometry(0.035, 0.035, 0.2, 20)
          const matiereChrome = new three.MeshStandardMaterial({ color: chrome, metalness: 0.92, roughness: 0.18 })
          const axe = new three.Mesh(formeAxe, matiereChrome)
          axe.position.y = 0.09
          plateau.add(axe)

          // Le bras : il ne tourne pas avec le plateau, il est pose dessus.
          const bras = new three.Group()
          const formePivot = new three.CylinderGeometry(0.15, 0.17, 0.16, 24)
          const pivot = new three.Mesh(formePivot, matiereChrome)
          pivot.position.set(1.86, 0.08, -1.1)
          const formeTube = new three.CylinderGeometry(0.026, 0.026, 2.15, 16)
          const tube = new three.Mesh(formeTube, matiereChrome)
          tube.position.set(1.12, 0.16, -0.42)
          tube.rotation.z = Math.PI / 2
          tube.rotation.y = -0.62
          const formeCellule = new three.BoxGeometry(0.14, 0.09, 0.2)
          const cellule = new three.Mesh(formeCellule, matiereEtiquette)
          cellule.position.set(0.34, 0.1, 0.32)
          cellule.rotation.y = -0.62
          bras.add(pivot, tube, cellule)
          socle.add(bras)

          // Une forme metallique sans lumiere de contour ni lampe de dessous
          // est une tache noire : c est le defaut qu il faut eviter ici plus
          // qu ailleurs, le vinyle etant noir par definition.
          eclairer(contexte, { cle: 0xfff3e4, remplissage: 0x7d8ec4, contour: 0xffffff, force: 1.5 })
          const dessous = new three.PointLight(0xffd9b0, 34, 14, 2)
          dessous.position.set(0.2, -2.1, 2.2)
          const rasante = new three.PointLight(0xffffff, 30, 16, 2)
          rasante.position.set(3.8, 1.8, 2.4)
          const comptoir = new three.PointLight(0xdde6ff, 22, 16, 2)
          comptoir.position.set(-1.6, 2.4, 2.6)
          scene.add(dessous, rasante, comptoir)

          camera.position.set(0, 0.9, 4.5)
          camera.lookAt(1.35, 0.15, 0)

          return () => {
            formeDisque.dispose()
            formeSillon.dispose()
            formeEtiquette.dispose()
            formeAxe.dispose()
            formePivot.dispose()
            formeTube.dispose()
            formeCellule.dispose()
            matiereDisque.dispose()
            matiereSillon.dispose()
            matiereEtiquette.dispose()
            matiereChrome.dispose()
          }
        }}
        animer={({ scene }, { delta }) => {
          const socle = scene.children[0]
          const plateau = socle?.children[0]
          if (plateau === undefined) return
          // Trente-trois tours et un tiers par minute. Pas un de plus.
          plateau.rotation.y += delta * TRENTE_TROIS_TOURS
        }}
      />
    ),
    [],
  )

  const enPile = pile.map((cle) => DISQUES.find((d) => d.cle === cle)).filter((d): d is Disque => d !== undefined)

  return (
    <Porte forme="zoom" marque="Sillon Noir">
      <div className="o-relative o-overflow-hidden" style={{ ...polices, ...nuit('zinc') }}>
        {/*
          ----- L ouverture : le microsillon en volume --------------------------
        */}
        <section id="haut" className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden" style={{ minHeight: ECRAN }}>
          {/* Le fond n est pas une scene : l objet a pris la seule surface. */}
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background: [
                `radial-gradient(58% 52% at 62% 46%, ${accentDoux(600, 34)}, transparent 72%)`,
                `radial-gradient(70% 58% at 14% 92%, ${accentDoux(800, 30)}, transparent 74%)`,
              ].join(', '),
            }}
          />
          {microsillon}
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{ background: 'linear-gradient(to top, var(--o-palette-zinc-950) 2%, color-mix(in oklab, var(--o-palette-zinc-950) 55%, transparent) 42%, transparent 78%)' }}
          />
          <Grain opacite={0.07} />

          <BarreGelule marque="Sillon Noir" liens={NAVIGATION} action={['#bac', 'Feuilleter']} />

          <div className="o-relative o-z-20 o-mx-auto o-flex o-w-full o-max-w-7xl o-grow o-flex-col o-justify-end o-px-6 o-pb-20 o-pt-32 md:o-px-10">
            <Surgit>
              <Etiquette>Cours Julien, Marseille — ouvert du mardi au samedi</Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              cadence={80}
              className="o-m-0 o-mt-7 o-max-w-4xl o-text-zinc-50"
              style={{ ...affiche('l', 800), fontSize: 'clamp(2.25rem, 6.6vw, 6rem)', letterSpacing: '-0.045em' }}
            >
              Tout a deja ete ecoute.
            </TitreVague>
            <div className="o-mt-9 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <Surgit delai={560} as="p" className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300 md:o-col-span-6">
Tout est d occasion, rien n est neuf, et une cote est ecrite au crayon dans chaque pochette. La platine du comptoir est a vous : nous ne vendons rien que nous n ayons pose dessus.
              </Surgit>
              <Surgit delai={680} className="md:o-col-span-6 md:o-flex md:o-justify-end">
                <Actions
                  pleine={['#bac', <>Feuilleter le bac <Icon icon={ArrowDown} size={16} aria-hidden="true" /></>]}
                  fantome={['#intercalaires', 'Les bacs']}
                />
              </Surgit>
            </div>
          </div>

          <div className="o-relative o-z-20 o-hidden md:o-block">
            <Coin position="bd">
              33 tours et un tiers
              <br />
              par minute, exactement
            </Coin>
          </div>
        </section>

        {/*
          ----- Les intercalaires, en rail (M-rail) ----------------------------
        */}
        <Rail
          ecrans={2.4}
          className="o-relative o-z-10 o-border-t o-border-white-10"
          entete={
            <div id="intercalaires" className="o-scroll-mt-24 o-px-6 o-pt-10 md:o-px-10">
              <Indice rang="01">Les bacs</Indice>
              <h2
                className="o-m-0 o-mt-4 o-max-w-3xl o-text-zinc-50"
                style={{ ...affiche('m', 800), fontSize: 'clamp(1.6rem, 3.6vw, 3rem)', letterSpacing: '-0.04em' }}
              >
                Poussez un intercalaire, le bac se refait.
              </h2>
            </div>
          }
        >
          {INTERCALAIRES.map((carte) => {
            const actif = carte.cle === intercalaire
            const compte = carte.cle === 'tous' ? DISQUES.length : DISQUES.filter((d) => d.bac === carte.cle).length
            return (
              <div key={carte.cle} className="o-shrink-0 o-px-4" style={{ width: 'min(74vw, 22rem)' }}>
                <button
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setIntercalaire(carte.cle)
                    setDevant(0)
                    viser(0)
                  }}
                  className="o-flex o-h-full o-w-full o-cursor-pointer o-flex-col o-justify-between o-rounded-xl o-border-w-1 o-p-7 o-text-left o-transition-colors focus:o-ring"
                  style={
                    actif
                      ? { ...aplat(), borderColor: 'transparent' }
                      : { borderColor: 'var(--o-theme-line)', backgroundColor: accentDoux(900, 26), color: 'var(--o-theme-fg)' }
                  }
                >
                  <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ opacity: 0.75 }}>
                    Intercalaire
                  </span>
                  <span className="o-mt-14 o-block" style={{ ...affiche('m', 800), fontSize: 'clamp(1.4rem, 2.6vw, 2.2rem)', letterSpacing: '-0.035em', lineHeight: 1.02 }}>
                    {carte.titre}
                  </span>
                  <span className="o-mt-4 o-block o-text-sm o-leading-relaxed" style={{ opacity: 0.85 }}>
                    {carte.sous}
                  </span>
                  <span className="o-mt-6 o-block o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ opacity: 0.75 }}>
                    {compte === 0 ? 'Bac vide aujourd hui' : `${String(compte)} pochettes`}
                  </span>
                </button>
              </div>
            )
          })}
        </Rail>

        {/*
          ----- Le mecanisme : le bac ------------------------------------------
        */}
        <section id="bac" className="o-relative o-z-10 o-scroll-mt-24 o-border-t o-border-white-10 o-py-16 md:o-py-24">
          <div className="o-mx-auto o-max-w-7xl o-px-6 md:o-px-10">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <Indice rang="02">Feuilleter</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-2xl o-text-zinc-50"
                  style={{ ...affiche('m', 800), fontSize: 'clamp(1.75rem, 4.2vw, 3.5rem)', letterSpacing: '-0.04em' }}
                >
                  {INTERCALAIRES.find((i) => i.cle === intercalaire)?.titre ?? 'Tout le bac'}
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                Au doigt, a la molette,
                <br />
                ou avec les fleches du clavier
              </p>
            </div>
          </div>

          {bac.length === 0 ? (
            <p className="o-mx-auto o-mt-12 o-max-w-7xl o-px-6 o-text-lg o-text-zinc-300 md:o-px-10">
              Ce bac est dehors, sous l auvent, et il ne tient pas dans cette page. Un euro piece, sans garantie, et on ne reprend pas.
            </p>
          ) : (
            <>
              {/* La bande du bac : une vraie zone qui defile de cote. */}
              <div
                ref={piste}
                role="group"
                aria-label="Le bac : faites defiler pour changer de pochette"
                tabIndex={0}
                onKeyDown={(evenement) => {
                  if (evenement.key === 'ArrowRight') {
                    evenement.preventDefault()
                    viser(Math.min(bac.length - 1, devant + 1))
                  }
                  if (evenement.key === 'ArrowLeft') {
                    evenement.preventDefault()
                    viser(Math.max(0, devant - 1))
                  }
                }}
                className="o-mt-12 o-flex o-snap-x o-gap-6 o-overflow-x-auto o-px-6 o-py-10 focus:o-ring md:o-px-10"
                style={{ scrollSnapType: 'x mandatory', perspective: '1200px' }}
              >
                {/* Deux cales, pour que la premiere et la derniere pochette atteignent le centre. */}
                <span aria-hidden="true" className="o-shrink-0" style={{ width: 'calc(50vw - 11rem)' }} />
                {bac.map((d, rang) => (
                  <button
                    key={d.cle}
                    type="button"
                    data-pochette=""
                    aria-pressed={rang === devant}
                    onClick={() => {
                      viser(rang)
                    }}
                    className="o-relative o-shrink-0 o-cursor-pointer o-snap-center o-overflow-hidden o-rounded-sm o-bg-transparent o-p-0 focus:o-ring"
                    style={{
                      width: 'min(64vw, 20rem)',
                      aspectRatio: '1 / 1',
                      boxShadow: '0 30px 60px -30px rgba(0,0,0,0.9)',
                      transition: reduced ? undefined : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <Pochette disque={d} />
                    <span className="o-sr-only">
                      {d.artiste} — {d.titre}, {d.annee}
                    </span>
                  </button>
                ))}
                <span aria-hidden="true" className="o-shrink-0" style={{ width: 'calc(50vw - 11rem)' }} />
              </div>

              {/* La fiche du disque de face. */}
              <div className="o-mx-auto o-mt-10 o-grid o-max-w-7xl o-gap-10 o-px-6 md:o-grid-cols-12 md:o-px-10">
                <div className="md:o-col-span-7">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                    {courant.label} · {courant.annee} · {courant.format}
                  </p>
                  <h3
                    className="o-m-0 o-mt-4 o-text-zinc-50"
                    style={{ ...affiche('m', 800), fontSize: 'clamp(1.75rem, 4.4vw, 3.5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
                  >
                    {courant.titre}
                  </h3>
                  <p className="o-m-0 o-mt-3 o-text-lg o-text-zinc-300">{courant.artiste}</p>
                  <p className="o-m-0 o-mt-6 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300">{courant.mot}</p>
                  <dl className="o-m-0 o-mt-8 o-border-t o-border-white-10">
                    {(
                      [
                        ['Etat', courant.etat],
                        ['Matrice', courant.matrice],
                        ['Bac', INTERCALAIRES.find((i) => i.cle === courant.bac)?.titre ?? courant.bac],
                      ] as const
                    ).map(([quoi, valeur]) => (
                      <div key={quoi} className="o-grid o-gap-x-6 o-gap-y-1 o-border-b o-border-white-10 o-py-3.5 sm:o-grid-cols-12">
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 sm:o-col-span-3">{quoi}</dt>
                        <dd className="o-m-0 o-font-mono o-text-sm o-text-zinc-200 sm:o-col-span-9">{valeur}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="o-m-0 o-mt-8 o-flex o-flex-wrap o-items-center o-gap-5">
                    <span style={{ ...affiche('m', 800), fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)', color: encreSurSombre() }}>{courant.prix}</span>
                    <button
                      type="button"
                      onClick={() => {
                        ajouter(courant.cle)
                      }}
                      className="o-cursor-pointer o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold focus:o-ring"
                      style={aplat()}
                    >
                      Mettre dans la pile d ecoute
                    </button>
                  </p>
                </div>

                {/* La pochette qu on peut tirer du bac, et qui y retombe. */}
                <div className="o-min-w-0 md:o-col-span-5">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Tirez la pochette du bac
                  </p>
                  <div className="o-mt-5 o-flex o-justify-center">
                    <InertiaDrag friction={7} spring={110} className="o-inline-block">
                      <span
                        className="o-block o-cursor-grab o-overflow-hidden o-rounded-sm"
                        style={{ width: 'min(60vw, 16rem)', aspectRatio: '1 / 1', boxShadow: '0 24px 48px -24px rgba(0,0,0,0.95)' }}
                      >
                        <Pochette disque={courant} />
                      </span>
                    </InertiaDrag>
                  </div>
                  <p className="o-m-0 o-mt-5 o-text-center o-text-xs o-leading-relaxed o-text-zinc-400">
                    Elle revient a sa place quand on la lache, comme au magasin.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        {/*
          ----- Un ecran de texte seul ------------------------------------------
        */}
        <section className="o-relative o-z-10 o-flex o-items-center o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-36" style={{ backgroundColor: accentDoux(900, 22) }}>
          <div className="o-mx-auto o-w-full o-max-w-7xl">
            <Manifeste eteint="Un disque d occasion a deja plu a quelqu un, et c est la seule recommandation qui vaille.">
              Le reste — les avis, les etoiles, les listes — n a jamais fait tourner un plateau.
            </Manifeste>
          </div>
        </section>

        {/*
          ----- La pile d ecoute, qu on remet dans l ordre (A21) ----------------
        */}
        <section id="pile" className="o-relative o-z-10 o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
          <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-5">
              <Indice rang="03">La pile</Indice>
              <h2
                className="o-m-0 o-mt-5 o-max-w-md o-text-zinc-50"
                style={{ ...affiche('m', 800), fontSize: 'clamp(1.75rem, 4vw, 3.25rem)', letterSpacing: '-0.04em' }}
              >
                <EchoText as="span" copies={2} lag={200} spread={1.4}>
                  Sillon Noir
                </EchoText>
              </h2>
              <p className="o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300">
                Ce que vous mettez de cote en feuilletant arrive ici. Remettez-le dans l ordre ou vous voulez l ecouter : c est l ordre dans lequel nous poserons les disques sur la platine du comptoir.
              </p>
              <p className="o-m-0 o-mt-8 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                <Icon icon={Music} size={14} aria-hidden="true" />
                Ecoute libre, sans achat, sans limite
              </p>
            </div>

            <div className="o-min-w-0 md:o-col-span-7">
              {enPile.length === 0 ? (
                <p className="o-m-0 o-rounded-2xl o-border-w-1 o-border-white-10 o-p-8 o-text-base o-leading-relaxed o-text-zinc-400">
                  La pile est vide. Feuilletez le bac et mettez-en de cote : trois ou quatre, c est ce qu on ecoute en une visite.
                </p>
              ) : (
                <SortableList
                  label="La pile d ecoute, dans l ordre"
                  items={enPile.map((d) => ({
                    id: d.cle,
                    label: `${d.artiste} — ${d.titre}`,
                    description: `${d.label}, ${d.annee} · ${d.etat} · ${d.prix}`,
                  }))}
                  value={pile}
                  onChange={setPile}
                />
              )}
            </div>
          </div>
        </section>

        {/*
          ----- Le pied de catalogue (P23) -------------------------------------
        */}
        <footer id="catalogue" className="o-relative o-z-10 o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-pb-12 o-pt-16 md:o-px-10">
          <div className="o-mx-auto o-max-w-7xl">
            <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              <Icon icon={Disc} size={14} aria-hidden="true" />
              Catalogue — references, formats, cotes
            </p>

            {/* Les references, en tableau de catalogue. */}
            <div className="o-mt-8 o-overflow-x-auto">
              <table className="o-w-full o-text-left o-font-mono o-text-xs" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
                <caption className="o-sr-only">Les references du bac, avec leur format, leur cote et leur prix</caption>
                <thead>
                  <tr className="o-border-b o-border-white-20 o-uppercase o-tracking-widest o-text-zinc-400">
                    <th scope="col" className="o-py-3 o-pr-6">Reference</th>
                    <th scope="col" className="o-py-3 o-pr-6">Artiste et titre</th>
                    <th scope="col" className="o-py-3 o-pr-6">Format</th>
                    <th scope="col" className="o-py-3 o-pr-6">Cote</th>
                    <th scope="col" className="o-py-3">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {DISQUES.map((d) => (
                    <tr key={d.cle} className="o-border-b o-border-white-10 o-text-zinc-300">
                      <td className="o-whitespace-nowrap o-py-3 o-pr-6" style={{ color: encreSurSombre() }}>{d.matrice}</td>
                      <td className="o-py-3 o-pr-6 o-text-zinc-100">{d.artiste} — {d.titre}</td>
                      <td className="o-whitespace-nowrap o-py-3 o-pr-6">{d.format}</td>
                      <td className="o-py-3 o-pr-6">{d.etat}</td>
                      <td className="o-whitespace-nowrap o-py-3">{d.prix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* L echelle des cotes, comme au dos du bac. */}
            <dl className="o-m-0 o-mt-12 o-grid o-gap-x-8 o-gap-y-3 sm:o-grid-cols-2 lg:o-grid-cols-3">
              {COTES.map(([code, dit]) => (
                <div key={code} className="o-flex o-gap-4 o-border-t o-border-white-10 o-py-3">
                  <dt className="o-w-10 o-shrink-0 o-font-mono o-text-sm o-font-bold" style={{ color: encreSurSombre() }}>{code}</dt>
                  <dd className="o-m-0 o-text-xs o-leading-relaxed o-text-zinc-400">{dit}</dd>
                </div>
              ))}
            </dl>

            <p className="o-m-0 o-mt-12 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              <span>© 2026 Sillon Noir — 44 cours Julien, 13006 Marseille</span>
              <span>Rachat de collections sur rendez-vous — 04 91 42 60 18</span>
              <a href="#haut" className="o-text-zinc-400 o-no-underline hover:o-text-zinc-50 focus:o-ring">
                Remonter ↑
              </a>
            </p>
          </div>
        </footer>

        {/* La pile flottante, en bas a gauche : ce qu on emporte au comptoir. */}
        {enPile.length > 0 && (
          <div className="o-fixed o-bottom-4 o-left-4 o-z-40" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
            <button
              type="button"
              aria-expanded={pileOuverte}
              onClick={() => {
                setPileOuverte((ouvert) => !ouvert)
              }}
              className="o-flex o-cursor-pointer o-items-center o-gap-3 o-rounded-full o-px-5 o-py-3 o-text-sm o-font-semibold o-shadow-xl focus:o-ring"
              style={aplat()}
            >
              <Icon icon={Disc} size={16} aria-hidden="true" />
              La pile — {enPile.length}
            </button>
            {pileOuverte && (
              <div
                className="o-mt-3 o-w-72 o-rounded-2xl o-border-w-1 o-border-white-10 o-p-4 o-shadow-xl"
                style={{ maxWidth: 'calc(100vw - 2rem)', backgroundColor: 'var(--o-palette-zinc-950)' }}
              >
                <ul className="o-m-0 o-list-none o-p-0">
                  {enPile.map((d) => (
                    <li key={d.cle} className="o-flex o-items-center o-gap-3 o-border-b o-border-white-10 o-py-2">
                      <span aria-hidden="true" className="o-size-8 o-shrink-0 o-overflow-hidden o-rounded-sm">
                        <Pochette disque={d} />
                      </span>
                      <span className="o-min-w-0 o-grow o-truncate o-text-xs o-text-zinc-200">{d.titre}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPile((avant) => avant.filter((cle) => cle !== d.cle))
                        }}
                        aria-label={`Retirer ${d.titre} de la pile`}
                        className="o-cursor-pointer o-rounded-full o-bg-transparent o-px-1.5 o-text-xs o-text-zinc-400 hover:o-text-zinc-50 focus:o-ring"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <a href="#pile" className="o-mt-3 o-block o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring" style={{ color: encreSurSombre() }}>
                  Remettre dans l ordre
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </Porte>
  )
}
