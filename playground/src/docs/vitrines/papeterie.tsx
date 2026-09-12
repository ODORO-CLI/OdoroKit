/**
 * Filigrane — papetier, rue du Pont-Louis-Philippe, Paris 4.
 *
 * ## La reference : Baseline
 *
 * La clarte, et rien d autre : un blanc de papier, une encre qui ne crie pas,
 * une colonne de texte etroite, et des chiffres poses la ou on les cherche.
 * Une papeterie vend de la matiere ; la page doit donner envie de la toucher,
 * pas de la scroller.
 *
 * ## Le mecanisme : le nuancier
 *
 * Dix papiers du fonds, et pour chacun les deux nombres que le metier ecrit
 * sur la rame : le **grammage**, en grammes au metre carre, et la **main**, le
 * volume qu un gramme occupe. Tout le reste se calcule, et se calcule
 * vraiment :
 *
 * - l **epaisseur** vaut le grammage multiplie par la main — c est la
 *   definition de la main, et c est pour cela qu un bouffant de 90 g est plus
 *   epais qu un couche de 135 g ;
 * - le **poids d une feuille A4** vaut le grammage fois 0,06237 metre carre ;
 * - de la suit le **nombre de feuilles qu une lettre de vingt grammes
 *   accepte**, enveloppe deduite, et le **nombre de feuilles dans cinq
 *   centimetres de pile**.
 *
 * L echantillon se plie au survol, et le grammage choisi se pose sur une
 * echelle verticale graduee (C15), a contre-jour, la ou l on regarde un
 * filigrane.
 *
 * ## Ce que la page ne charge pas
 *
 * Aucune photographie : le papier se montre par sa couleur, son grain et son
 * pli, et les trois se dessinent. Le grain est un motif SVG de fibres, le
 * filigrane un sceau trace, l etiquette du pied un vrai gabarit de rame.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'

import { CircularText } from '@/odoro/text/CircularText.jsx'
import { FoldText } from '@/odoro/text/FoldText.jsx'
import { Folder } from '@/odoro/ui/Folder.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreFilet,
  CHROME,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Parallaxe } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#nuancier', 'Le nuancier'],
  ['#contre-jour', 'A contre-jour'],
  ['#usages', 'Les usages'],
]

/* ============================ Le fonds ================================= */

/**
 * Un papier du fonds.
 *
 * `grammage` et `main` sont les deux nombres de la rame ; tout ce que la page
 * affiche ensuite en decoule. `opacite` est mesuree, pas calculee : elle
 * depend de la charge et du calandrage, qu aucune formule courte ne rend.
 */
interface Papier {
  readonly id: string
  readonly nom: string
  /** Grammes au metre carre. */
  readonly grammage: number
  /** Volume specifique, en centimetres cubes par gramme. */
  readonly main: number
  /** Opacite mesuree, en pourcentage. */
  readonly opacite: number
  readonly teinte: string
  readonly grain: string
  readonly usage: string
  readonly prix: string
  readonly note: string
}

const FONDS: readonly Papier[] = [
  { id: 'velin', nom: 'Velin de Rives', grammage: 250, main: 1.3, opacite: 98, teinte: '#f4efe4', grain: 'Grain fin', usage: 'Aquarelle, lavis, fusain', prix: '2,40 EUR la feuille', note: 'Cent pour cent coton, sans acide. Il boit sans gondoler et se tend a l eau claire.' },
  { id: 'verge', nom: 'Verge d Arches', grammage: 120, main: 1.35, opacite: 94, teinte: '#f7f2e6', grain: 'Verge', usage: 'Correspondance, faire-part', prix: '1,10 EUR la feuille', note: 'Les vergeures se voient a contre-jour : ce sont les fils de la forme, restes dans la feuille.' },
  { id: 'bristol', nom: 'Bristol lisse', grammage: 250, main: 1.15, opacite: 97, teinte: '#fdfdfb', grain: 'Lisse', usage: 'Plume, encre de Chine, calligraphie', prix: '1,60 EUR la feuille', note: 'Surface fermee : la plume glisse et l encre reste dessus, elle ne part pas en barbes.' },
  { id: 'bouffant', nom: 'Offset bouffant', grammage: 90, main: 1.55, opacite: 91, teinte: '#f6f1e3', grain: 'Bouffant', usage: 'Roman, livre de poche', prix: '0,22 EUR la feuille', note: 'Le papier des livres : leger dans la main, epais dans la tranche. C est toute la main.' },
  { id: 'couche', nom: 'Couche mat', grammage: 135, main: 0.85, opacite: 96, teinte: '#fbfcfd', grain: 'Couche', usage: 'Photographie, catalogue', prix: '0,45 EUR la feuille', note: 'Une charge de kaolin ferme la surface. Lourd, mince, et fidele sur les gris.' },
  { id: 'kraft', nom: 'Kraft naturel', grammage: 110, main: 1.25, opacite: 95, teinte: '#d9c3a1', grain: 'Kraft', usage: 'Emballage, carnet, patron', prix: '0,20 EUR la feuille', note: 'Fibres longues non blanchies : il se dechire droit dans le sens de la machine.' },
  { id: 'japon', nom: 'Japon fin', grammage: 45, main: 1.6, opacite: 62, teinte: '#f2ead8', grain: 'Fibre longue', usage: 'Reliure, reparation, estampe', prix: '3,20 EUR la feuille', note: 'On le dechire mouille pour obtenir un bord en frange, qui se fond dans la page reparee.' },
  { id: 'calque', nom: 'Calque', grammage: 90, main: 0.75, opacite: 12, teinte: '#eef1f2', grain: 'Calque', usage: 'Report, architecture, patron', prix: '0,60 EUR la feuille', note: 'Rendu translucide au raffinage, pas par un enduit : il reste dessinable des deux cotes.' },
  { id: 'buvard', nom: 'Buvard', grammage: 200, main: 2.1, opacite: 93, teinte: '#f3dfe4', grain: 'Buvard', usage: 'Ecriture a la plume, sechage', prix: '0,95 EUR la feuille', note: 'Ni colle ni charge : la fibre est laissee ouverte, et c est ce qui boit l encre.' },
  { id: 'gratter', nom: 'Carte a gratter', grammage: 300, main: 1.05, opacite: 99, teinte: '#ffffff', grain: 'Enduit', usage: 'Illustration au grattoir', prix: '3,80 EUR la feuille', note: 'Un enduit de craie sur carte noire. On ne dessine pas : on enleve.' },
]

/** Surface d une feuille A4, en metres carres. */
const A4 = 0.06237

/** Ce que la lettre de vingt grammes accepte, enveloppe deduite. */
const ENVELOPPE = 5

/* ============================ Les usages =============================== */

/** Les quatre familles du fonds, telles que le dossier les range. */
const FAMILLES = [
  {
    id: 'ecrire',
    label: 'Ecrire',
    fourchette: '120 a 250 g',
    titre: 'Ce qui tient la plume',
    texte:
      'Un papier d ecriture se juge a l envers : on ecrit, on retourne, et l encre ne doit pas etre passee. Verge, bristol, velin — et le buvard, qui n est pas un accessoire mais un outil.',
    papiers: ['verge', 'bristol', 'buvard'],
  },
  {
    id: 'imprimer',
    label: 'Imprimer',
    fourchette: '90 a 135 g',
    titre: 'Ce qui passe en machine',
    texte:
      'Le sens de la fibre compte plus que le grammage : une feuille prise a contresens ondule a la sortie du four. Nous coupons dans le bon sens, et nous l ecrivons sur la rame.',
    papiers: ['bouffant', 'couche'],
  },
  {
    id: 'relier',
    label: 'Relier',
    fourchette: '45 a 110 g',
    titre: 'Ce qui repare',
    texte:
      'Le japon repare sans se voir, le kraft tient les dos, la colle d amidon se defait a l eau tiede. Une reliure se repare : c est meme a cela qu on la reconnait.',
    papiers: ['japon', 'kraft'],
  },
  {
    id: 'dessiner',
    label: 'Dessiner',
    fourchette: '250 a 300 g',
    titre: 'Ce qui encaisse l eau',
    texte:
      'Au-dela de deux cents grammes, la feuille accepte le lavis sans se deformer. En dessous, on la tend sur un chassis — nous les faisons sur mesure a l atelier.',
    papiers: ['velin', 'gratter'],
  },
] as const

/* ============================ Le grain du papier ======================= */

/**
 * Le grain du papier : un feutrage de fibres courtes, repete.
 *
 * Un motif de quatre-vingts pixels suffit : au-dela, l oeil lit une trame, et
 * une trame ne fait pas du papier. Les fibres sont orientees au hasard, comme
 * dans une feuille formee en continu.
 */
function Grain(): ReactElement {
  const fibres = useMemo(() => {
    const traits: { x: number; y: number; dx: number; dy: number }[] = []
    let graine = 19
    const tirer = (): number => {
      graine = (graine * 1103515245 + 12345) % 2147483648
      return graine / 2147483648
    }
    for (let rang = 0; rang < 60; rang += 1) {
      const angle = tirer() * Math.PI
      const longueur = 2 + tirer() * 6
      traits.push({ x: tirer() * 80, y: tirer() * 80, dx: Math.cos(angle) * longueur, dy: Math.sin(angle) * longueur })
    }
    return traits
  }, [])
  return (
    <div aria-hidden="true" className="o-pointer-events-none o-absolute o-inset-0 o-overflow-hidden">
      <svg className="o-size-full">
        <defs>
          <pattern id="o-pa-fibres" width="80" height="80" patternUnits="userSpaceOnUse">
            <g stroke={accentDoux(900, 14)} strokeWidth="0.7" strokeLinecap="round">
              {fibres.map((f, rang) => (
                <path key={rang} d={`M${f.x.toFixed(1)} ${f.y.toFixed(1)}l${f.dx.toFixed(1)} ${f.dy.toFixed(1)}`} />
              ))}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#o-pa-fibres)" />
      </svg>
    </div>
  )
}

/* ============================ L echantillon qui se plie ================ */

/**
 * L echantillon, et son pli.
 *
 * Le pli est une vraie rotation en trois dimensions : la moitie haute bascule
 * sur sa charniere et projette son ombre sur la moitie basse. Sous mouvement
 * reduit, la feuille reste plate et garde son trait de pliure — l information,
 * elle, ne depend pas du geste.
 */
function Echantillon({ papier }: { readonly papier: Papier }): ReactElement {
  const { reduced } = useMotionState()
  const [plie, setPlie] = useState(false)

  return (
    <div
      className="o-relative"
      style={{ perspective: '900px' }}
      onPointerEnter={() => {
        setPlie(true)
      }}
      onPointerLeave={() => {
        setPlie(false)
      }}
    >
      <div className="o-relative o-overflow-hidden" style={{ aspectRatio: '1 / 1.414', backgroundColor: papier.teinte }}>
        {/* La moitie basse, qui reste. */}
        <div className="o-absolute o-inset-x-0 o-bottom-0 o-top-1/2" style={{ backgroundColor: papier.teinte, boxShadow: `inset 0 0 0 1px ${accentDoux(900, 18)}` }} />
        {/* La moitie haute, qui bascule. */}
        <div
          className="o-absolute o-inset-x-0 o-top-0"
          style={{
            height: '50%',
            backgroundColor: papier.teinte,
            boxShadow: `inset 0 0 0 1px ${accentDoux(900, 18)}`,
            transformOrigin: 'bottom center',
            transform: reduced || !plie ? undefined : 'rotateX(46deg)',
            transition: reduced ? undefined : 'transform 620ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        {/* L ombre portee du pli, sur la moitie basse. */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-inset-x-0"
          style={{
            top: '50%',
            height: '26%',
            background: `linear-gradient(to bottom, rgba(0,0,0,0.22), transparent)`,
            opacity: reduced || !plie ? 0 : 1,
            transition: 'opacity 620ms ease',
          }}
        />
        {/* Le trait de pliure, quand la feuille est a plat. */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-absolute"
          style={{ left: '10%', right: '10%', top: '50%', height: 1, backgroundColor: accentDoux(900, 22), opacity: plie && !reduced ? 0 : 1, transition: 'opacity 300ms ease' }}
        />
        {/* Le filigrane de la maison, dans la pate. */}
        <svg viewBox="0 0 120 120" className="o-pointer-events-none o-absolute o-left-1/2 o-top-1/2 o-w-20" style={{ transform: 'translate(-50%, -50%)' }} aria-hidden="true">
          <circle cx="60" cy="60" r="40" fill="none" stroke={accentDoux(900, 16)} strokeWidth="1.5" />
          <path d="M60 26v68M34 44h52M34 76h52" stroke={accentDoux(900, 14)} strokeWidth="1.2" />
        </svg>
      </div>
      <p className="o-m-0 o-mt-3 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
        {reduced ? 'Echantillon, pli marque' : 'Survolez pour plier la feuille'}
      </p>
    </div>
  )
}

/* ============================ L echelle (C15) ========================== */

/** L echelle verticale des grammages, et la valeur posee dessus. */
function Echelle({ papier }: { readonly papier: Papier }): ReactElement {
  const min = 40
  const max = 320
  const part = Math.min(1, Math.max(0, (papier.grammage - min) / (max - min)))
  const graduations = Array.from({ length: (max - min) / 10 + 1 }, (_, rang) => min + rang * 10)

  return (
    <div className="o-relative o-flex o-gap-6" style={{ height: 420 }}>
      {/* Le fut de l echelle. */}
      <div className="o-relative o-w-24 o-shrink-0">
        <span aria-hidden="true" className="o-absolute o-bottom-0 o-top-0 o-w-px" style={{ left: 0, backgroundColor: 'var(--o-palette-slate-700)' }} />
        {graduations.map((valeur) => {
          const longue = valeur % 50 === 0
          const y = ((valeur - min) / (max - min)) * 100
          return (
            <span key={valeur} aria-hidden="true" className="o-absolute o-flex o-items-center o-gap-2" style={{ bottom: `${String(y)}%`, left: 0 }}>
              <span className="o-block o-h-px" style={{ width: longue ? 22 : 11, backgroundColor: 'var(--o-palette-slate-600)' }} />
              {longue && <span className="o-font-mono o-text-xs o-tabular-nums o-text-slate-400">{valeur}</span>}
            </span>
          )
        })}
      </div>

      {/* La valeur, posee sur l echelle. */}
      <div
        className="o-absolute o-left-0 o-flex o-items-center o-gap-4"
        style={{ bottom: `${String(part * 100)}%`, transform: 'translateY(50%)', transition: 'bottom 520ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <span aria-hidden="true" className="o-block o-h-px o-w-36" style={{ backgroundColor: encreSurSombre() }} />
        <span className="o-flex o-items-baseline o-gap-3">
          <span className="o-tabular-nums o-text-slate-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.9 }}>
            {papier.grammage}
          </span>
          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
            g / m2
            <br />
            {papier.nom}
          </span>
        </span>
      </div>
    </div>
  )
}

/* ============================ Le nuancier ============================== */

/** Le mecanisme : dix papiers, deux nombres, et tout ce qui en decoule. */
function Nuancier({
  papier,
  poser,
}: {
  readonly papier: Papier
  readonly poser: (id: string) => void
}): ReactElement {
  const releve = useMemo(() => {
    const epaisseur = papier.grammage * papier.main
    const feuilleA4 = papier.grammage * A4
    const parLettre = Math.max(0, Math.floor((20 - ENVELOPPE) / feuilleA4))
    const parPile = Math.round(50000 / epaisseur)
    return { epaisseur, feuilleA4, parLettre, parPile }
  }, [papier])

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12">
      {/* La liste du fonds. */}
      <div className="lg:o-col-span-4">
        <ul className="o-m-0 o-list-none o-p-0">
          {FONDS.map((ligne) => {
            const choisi = ligne.id === papier.id
            return (
              <li key={ligne.id}>
                <button
                  type="button"
                  onClick={() => {
                    poser(ligne.id)
                  }}
                  aria-pressed={choisi}
                  className={`o-flex o-w-full o-cursor-pointer o-appearance-none o-items-center o-gap-4 o-border-none o-border-b o-border-black-10 dark:o-border-slate-800 o-bg-transparent o-px-0 o-py-3 o-text-left o-transition-opacity hover:o-opacity-70 focus:o-ring`}
                >
                  <span
                    aria-hidden="true"
                    className="o-block o-size-8 o-shrink-0"
                    style={{ backgroundColor: ligne.teinte, boxShadow: choisi ? `0 0 0 2px ${encre()}` : `inset 0 0 0 1px ${accentDoux(900, 20)}` }}
                  />
                  <span className="o-min-w-0 o-grow">
                    <span className={`o-block o-text-sm ${choisi ? 'o-font-semibold o-text-slate-950 dark:o-text-slate-50' : 'o-text-slate-700 dark:o-text-slate-300'}`}>
                      {ligne.nom}
                    </span>
                    <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                      {ligne.grammage} g — main {ligne.main.toFixed(2).replace('.', ',')}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* L echantillon, qui se plie. */}
      <div className="lg:o-col-span-3">
        <Echantillon papier={papier} />
      </div>

      {/* Ce que les deux nombres donnent. */}
      <div className="lg:o-col-span-5">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
          {papier.grain} — {papier.usage}
        </p>
        <h3
          className="o-m-0 o-mt-4 o-text-slate-950 dark:o-text-slate-50"
          style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', lineHeight: 1 }}
        >
          <FoldText key={papier.id} step={34} duration={560}>
            {papier.nom}
          </FoldText>
        </h3>
        <p className="o-m-0 o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">{papier.note}</p>

        <dl className="o-m-0 o-mt-8 o-grid o-gap-px sm:o-grid-cols-2" style={{ backgroundColor: accentDoux(900, 16) }}>
          {([
            ['Epaisseur', `${(releve.epaisseur / 1000).toFixed(3).replace('.', ',')} mm`, 'grammage x main'],
            ['Une feuille A4', `${releve.feuilleA4.toFixed(1).replace('.', ',')} g`, `${String(releve.parLettre)} dans une lettre de 20 g`],
            ['Opacite', `${String(papier.opacite)} %`, papier.opacite < 50 ? 'on lit au travers' : 'le verso ne traverse pas'],
            ['Cinq centimetres', `${String(releve.parPile)} feuilles`, 'de pile, a plat'],
          ] as const).map(([quoi, valeur, note]) => (
            <div key={quoi} className="o-bg-slate-50 dark:o-bg-slate-950 o-px-5 o-py-4">
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">{quoi}</dt>
              <dd className="o-m-0 o-mt-2 o-font-mono o-text-xl o-tabular-nums o-text-slate-950 dark:o-text-slate-50">{valeur}</dd>
              <dd className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-slate-500 dark:o-text-slate-400">{note}</dd>
            </div>
          ))}
        </dl>

        <p className="o-m-0 o-mt-6 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-border-t o-border-black-10 dark:o-border-slate-800 o-pt-5">
          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">Au detail</span>
          <span className="o-font-mono o-text-sm o-tabular-nums o-text-slate-950 dark:o-text-slate-50">{papier.prix}</span>
        </p>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  const [choisi, setChoisi] = useState('verge')
  const [famille, setFamille] = useState('ecrire')
  const [envoye, setEnvoye] = useState(false)

  const papier = FONDS.find((p) => p.id === choisi) ?? FONDS[0]
  if (papier === undefined) throw new Error('fonds vide')
  const ouverte = FAMILLES.find((f) => f.id === famille) ?? FAMILLES[0]

  const envoyer = (evenement: FormEvent<HTMLFormElement>): void => {
    evenement.preventDefault()
    setEnvoye(true)
  }

  return (
    <Porte forme="trou" marque="Filigrane" sombre={false}>
      <div className="o-bg-slate-50 dark:o-bg-slate-950 o-text-slate-900 dark:o-text-slate-50" style={polices}>
        {/* ================= L ouverture : des feuilles qui derivent ====== */}
        <header className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden" style={{ minHeight: ECRAN }}>
          <Grain />
          <BarreFilet marque="Filigrane" liens={NAVIGATION} action={['#nuancier', 'Le nuancier']} sombre={false} />

          <div className="o-relative o-flex o-grow o-items-center o-px-6 o-py-16 md:o-px-10">
            <div className="o-mx-auto o-grid o-w-full o-max-w-6xl o-items-center o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-7">
                <Surgit>
                  <Etiquette sombre={false}>Papetier — fonds de dix-sept mille feuilles</Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-8 o-text-slate-950 dark:o-text-slate-50"
                  style={{ ...affiche('xl', 300), fontSize: 'clamp(3rem, 11vw, 10rem)', lineHeight: 0.86, letterSpacing: '-0.045em' }}
                >
                  Filigrane
                </TitreVague>
                <Surgit delai={520} as="p" className="o-m-0 o-mt-8 o-max-w-lg o-text-lg o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Un papier tient dans deux nombres : le grammage et la main.
                  Tout le reste — l epaisseur, le poids d une lettre, ce qu on
                  voit au travers — se calcule, et nous le calculons ici.
                </Surgit>
                <Surgit delai={640} className="o-mt-10 o-flex o-flex-wrap o-gap-4">
                  <a
                    href="#nuancier"
                    className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                    style={aplat()}
                  >
                    Ouvrir le nuancier <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                  </a>
                  <a
                    href="#usages"
                    className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-slate-300 dark:o-border-slate-700 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline focus:o-ring"
                  >
                    Les quatre usages
                  </a>
                </Surgit>
              </div>

              {/* Trois feuilles, a trois vitesses : la signature de la page. */}
              <div className="o-relative o-hidden lg:o-col-span-5 lg:o-block" style={{ height: 440 }}>
                {([
                  [FONDS[1], 0, 0, 0.82, -4],
                  [FONDS[5], 54, 28, 0.64, 3],
                  [FONDS[0], 108, 56, 0.5, -7],
                ] as const).map(([feuille, decalageX, decalageY, glisse, angle], rang) =>
                  feuille === undefined ? null : (
                    <Parallaxe
                      key={feuille.id}
                      vitesse={0.18 + rang * 0.08}
                      glisse={glisse}
                      className="o-absolute"
                      style={{ left: decalageX, top: decalageY, width: 216 }}
                    >
                      <span
                        className="o-block"
                        style={{
                          aspectRatio: '1 / 1.414',
                          backgroundColor: feuille.teinte,
                          transform: `rotate(${String(angle)}deg)`,
                          boxShadow: `0 18px 40px -24px rgba(0,0,0,0.45), inset 0 0 0 1px ${accentDoux(900, 16)}`,
                        }}
                      />
                    </Parallaxe>
                  ),
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ================= Le mecanisme : le nuancier =================== */}
        <section id="nuancier" className="o-relative o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-slate-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01" sombre={false}>
                Le nuancier
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-slate-950 dark:o-text-slate-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)', lineHeight: 0.96, letterSpacing: '-0.03em' }}
              >
                Deux nombres, et la feuille est decrite.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                La main est le volume qu occupe un gramme. C est elle, et pas le
                grammage, qui dit l epaisseur : un bouffant de 90 grammes est
                plus epais qu un couche de 135.
              </p>
            </Reveal>
            <div className="o-mt-14">
              <Nuancier papier={papier} poser={setChoisi} />
            </div>
          </div>
        </section>

        {/* ================= A contre-jour : le filigrane et l echelle ==== */}
        <section id="contre-jour" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32" style={nuit('slate')}>
          <div className="o-mx-auto o-grid o-max-w-6xl o-items-center o-gap-16 lg:o-grid-cols-12">
            <div className="lg:o-col-span-5">
              <Reveal>
                <Indice rang="02">A contre-jour</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-text-slate-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.6vw, 3rem)', lineHeight: 0.96, letterSpacing: '-0.03em' }}
                >
                  Une feuille se lit contre la lumiere.
                </h2>
              </Reveal>
              <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-slate-300">
                Les vergeures, le filigrane, la charge, l endroit ou la pate est
                plus mince : rien de tout cela ne se voit a plat. C est le
                premier geste du metier, et c est celui qu on vous apprend au
                comptoir.
              </p>

              {/* Le sceau de la maison, dans la pate. */}
              <div className="o-relative o-mt-12 o-flex o-items-center o-justify-center" style={{ width: 220, height: 220 }}>
                <CircularText size={210} speed={26} className="o-absolute o-text-slate-400">
                  FILIGRANE · PAPETIER · PARIS · DEPUIS 1954 ·
                </CircularText>
                <svg viewBox="0 0 120 120" className="o-w-24" aria-hidden="true">
                  <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" className="o-text-slate-500" />
                  <path d="M60 22v76M30 44h60M30 76h60" stroke="currentColor" strokeWidth="1.2" className="o-text-slate-600" />
                  <circle cx="60" cy="60" r="12" fill="none" stroke={encreSurSombre()} strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            <div className="lg:o-col-span-7">
              <div className="o-flex o-items-end o-justify-between o-gap-8">
                <Echelle papier={papier} />
              </div>
              <p className="o-m-0 o-mt-8 o-max-w-md o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-400">
                Echelle des grammages du fonds — de 40 a 320 g au metre carre.
                Le repere suit le papier choisi dans le nuancier.
              </p>
            </div>
          </div>
        </section>

        {/* ================= Les usages, en dossier ====================== */}
        <section id="usages" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
          <div className="o-mx-auto o-grid o-max-w-6xl o-items-center o-gap-16 lg:o-grid-cols-12">
            <div className="lg:o-col-span-5">
              <Reveal>
                <Indice rang="03" sombre={false}>
                  Les usages
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-text-slate-950 dark:o-text-slate-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.6vw, 3rem)', lineHeight: 0.96, letterSpacing: '-0.03em' }}
                >
                  Le fonds tient dans quatre chemises.
                </h2>
              </Reveal>
              <div className="o-mt-12 o-flex o-justify-start">
                <Folder
                  label="Le fonds"
                  // Sans precision sur la fiche : quatre fiches en eventail se recouvrent,
                  // et la fourchette de grammage se lit deja dans le detail, a droite.
                  items={FAMILLES.map((f) => ({ id: f.id, label: f.label }))}
                  defaultOpen
                  onSelect={setFamille}
                  // `Folder` attend des noms de jetons, pas des couleurs : la
                  // teinte de la vitrine passe donc par son jeton, et le carton
                  // se repeint avec elle.
                  colors={['--o-vitrine-500', '--o-theme-bg']}
                  width={280}
                  spread={12}
                />
              </div>
            </div>

            <div className="lg:o-col-span-7">
              <div className="o-p-8 md:o-p-10" style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(900, 18)}` }}>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                  {ouverte?.label} — {ouverte?.fourchette}
                </p>
                <h3
                  className="o-m-0 o-mt-4 o-text-slate-950 dark:o-text-slate-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 2.8vw, 2.25rem)', lineHeight: 1 }}
                >
                  {ouverte?.titre}
                </h3>
                <p className="o-m-0 o-mt-5 o-max-w-lg o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400" aria-live="polite">
                  {ouverte?.texte}
                </p>
                <ul className="o-m-0 o-mt-8 o-flex o-list-none o-flex-wrap o-gap-3 o-p-0">
                  {(ouverte?.papiers ?? []).map((id) => {
                    const ligne = FONDS.find((p) => p.id === id)
                    if (ligne === undefined) return null
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => {
                            setChoisi(id)
                          }}
                          className="o-flex o-cursor-pointer o-appearance-none o-items-center o-gap-3 o-rounded-full o-border-w-1 o-border-slate-300 dark:o-border-slate-700 o-bg-transparent o-px-4 o-py-2 o-text-sm o-transition-colors hover:o-bg-slate-100 dark:hover:o-bg-slate-900 focus:o-ring"
                        >
                          <span aria-hidden="true" className="o-block o-size-4 o-rounded-full" style={{ backgroundColor: ligne.teinte, boxShadow: `inset 0 0 0 1px ${accentDoux(900, 20)}` }} />
                          {ligne.nom}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= L appel : un champ et un bouton (A16) ======== */}
        <section aria-labelledby="appel-titre" className="o-border-t o-border-black-10 dark:o-border-slate-800 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
          <div className="o-mx-auto o-max-w-3xl o-text-center">
            <h2
              id="appel-titre"
              className="o-m-0 o-text-slate-950 dark:o-text-slate-50"
              style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3.4vw, 2.75rem)', lineHeight: 1 }}
            >
              Le nuancier complet, par la poste.
            </h2>
            <p className="o-m-0 o-mt-5 o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
              Dix-sept echantillons de format carte postale, affranchis a nos
              frais. Un papier se choisit entre deux doigts, pas sur un ecran.
            </p>

            {/*
              A16 : le champ et le bouton dans le meme filet. Un seul trait
              autour des deux, et rien entre eux — c est ce qui distingue cette
              forme d un formulaire ordinaire.
            */}
            <form
              onSubmit={envoyer}
              className="o-mx-auto o-mt-10 o-flex o-max-w-xl o-items-center o-gap-2 o-rounded-full o-p-1.5 o-pl-6"
              style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(900, 34)}` }}
            >
              <label htmlFor="papeterie-adresse" className="o-sr-only">
                Votre adresse postale
              </label>
              <input
                id="papeterie-adresse"
                name="adresse"
                type="text"
                required
                placeholder="14 rue du Pont-Louis-Philippe, Paris 4"
                className="o-min-w-0 o-grow o-border-none o-bg-transparent o-py-2 o-text-sm o-text-slate-950 dark:o-text-slate-50 focus:o-ring"
              />
              <button
                type="submit"
                className="o-shrink-0 o-cursor-pointer o-appearance-none o-rounded-full o-border-none o-px-5 o-py-2.5 o-text-sm o-font-semibold o-transition-opacity hover:o-opacity-85 focus:o-ring"
                style={aplat()}
              >
                Envoyer
              </button>
            </form>
            <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-slate-500 dark:o-text-slate-400" aria-live="polite">
              {envoye ? 'C est parti a la levee de 18 h. Comptez trois jours.' : 'Une adresse, rien d autre. Nous n envoyons pas de lettre d information.'}
            </p>
          </div>
        </section>

        {/* ================= Le pied : une etiquette de rame (P26) ======== */}
        <footer className="o-px-6 o-pb-16 md:o-px-10">
          <div className="o-mx-auto o-max-w-4xl">
            <div className="o-relative o-p-8 md:o-p-10" style={{ boxShadow: `inset 0 0 0 2px ${accentDoux(900, 40)}`, backgroundColor: 'var(--o-theme-bg)' }}>
              <div className="o-flex o-flex-wrap o-items-start o-justify-between o-gap-6 o-border-b o-border-black-20 dark:o-border-slate-700 o-pb-5">
                <p className="o-m-0">
                  <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">Etiquette de rame</span>
                  <span className="o-mt-2 o-block o-text-2xl o-font-semibold o-tracking-tight o-text-slate-950 dark:o-text-slate-50">Filigrane</span>
                </p>
                {/* Le code-barres, dessine : c est une etiquette, elle en porte un. */}
                <svg viewBox="0 0 180 48" className="o-w-40" aria-hidden="true">
                  {Array.from({ length: 42 }, (_, rang) => {
                    const large = (rang * 7 + 3) % 5 < 2
                    return (
                      <rect
                        key={rang}
                        x={rang * 4.2 + 2}
                        y="2"
                        width={large ? 2.6 : 1.2}
                        height="34"
                        fill="currentColor"
                        className="o-text-slate-950 dark:o-text-slate-50"
                      />
                    )
                  })}
                  <text x="2" y="46" fontSize="9" fill="currentColor" className="o-text-slate-500 dark:o-text-slate-400" style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.2em' }}>
                    3 760 214 000 417
                  </text>
                </svg>
              </div>

              <dl className="o-m-0 o-mt-6 o-grid o-gap-6 sm:o-grid-cols-2 lg:o-grid-cols-4">
                {([
                  ['Composition', '100 % fibres vierges, sans acide, pH 7,5'],
                  ['Origine', 'Moulin du Val-de-Bresle, Normandie'],
                  ['Format', '500 feuilles — 500 x 650 mm, sens machine'],
                  ['Lot', 'FG-2026-041 — mise en rame le 14 janvier'],
                ] as const).map(([quoi, valeur]) => (
                  <div key={quoi}>
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                      {quoi}
                    </dt>
                    <dd className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-slate-700 dark:o-text-slate-300">{valeur}</dd>
                  </div>
                ))}
              </dl>

              <div className="o-mt-8 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-black-10 dark:o-border-slate-800 o-pt-5">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                  14 rue du Pont-Louis-Philippe, 75004 Paris — © 2026
                </p>
                <a
                  href="#nuancier"
                  className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                  style={{ color: encre() }}
                >
                  fonds@filigrane.fr <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
