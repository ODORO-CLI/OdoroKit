/**
 * Abysse — exposition permanente du Musee de la mer.
 *
 * ## Le parti pris : on ne lit pas la page, on descend dedans
 *
 * Une exposition sur les grands fonds ne se raconte pas en sections. Elle se
 * descend. Le corps de cette vitrine est donc **un seul diorama de sept
 * ecrans** : la molette fait couler l eau vers le haut, le sondeur egrene les
 * metres, la lumiere s eteint, la faune change. Il n y a pas de « section
 * suivante » a atteindre — il y a un fond a toucher, a onze mille metres.
 *
 * ## Pourquoi la glisse est le sujet, et pas un effet
 *
 * La progression est amortie : un cran de molette pousse la cible, et la
 * colonne d eau continue de couler apres l arret du geste. C est ce qui
 * distingue une plongee d un defilement — l eau a de l inertie, le decor
 * aussi. Sans cela, la descente s arreterait net a chaque cran, et le corps du
 * visiteur ne serait jamais dans le mouvement.
 *
 * Les couches, elles, ne coutent rien : la scene n ecrit que trois variables
 * CSS depuis une seule horloge, et les douze plans sont du `calc()`.
 *
 * ## Ce qui est vrai
 *
 * Les profondeurs, les temperatures, les pressions et la faune de chaque zone
 * sont celles des manuels : quatre-vingts pour cent de la lumiere absorbee au
 * premier metre, quatre degres a mille metres, une atmosphere tous les dix
 * metres, la fosse des Mariannes a 10 916 metres. Une exposition qui ment sur
 * ses chiffres ne merite pas qu on descende.
 *
 * ## Aucune scene graphique
 *
 * Pas une ligne de WebGL : la colonne d eau est un degrade, la neige marine
 * des points, la faune des silhouettes dessinees. Une page qui tient sur un
 * telephone de 2019 a plus de valeur qu une page qui impressionne un portable
 * de developpeur.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowRight, ArrowUpRight, Ticket } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'

import { GradualBlur } from '@/odoro/effect/GradualBlur.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  verre,
} from './marche.jsx'
import { accentDoux, encreSurSombre } from './palettes.js'
import { Couche, Flotte, Profondeur } from './scene.jsx'

/* ============================ La colonne d eau ========================= */

/** Le fond de la fosse des Mariannes, en metres. C est la fin de la course. */
const FOND = 10_916

/**
 * Une zone de la colonne d eau.
 *
 * `depart` est la profondeur atteinte quand l acte commence. Les valeurs
 * physiques sont interpolees entre les zones plutot que posees par palier :
 * la temperature ne tombe pas d un coup a mille metres.
 */
interface Zone {
  readonly nom: string
  readonly grec: string
  readonly depart: number
  readonly temperature: number
  readonly lumiere: string
  readonly texte: string
  readonly faune: readonly string[]
}

const ZONES: readonly Zone[] = [
  {
    nom: 'La zone eclairee',
    grec: 'Epipelagique',
    depart: 0,
    temperature: 18,
    lumiere: 'Photosynthese possible',
    texte:
      'Le premier metre absorbe quatre-vingts pour cent de la lumiere. A deux cents metres, il en reste moins d un pour cent — et c est deja la fin des algues.',
    faune: ['Sardine', 'Meduse aurelia', 'Thon rouge', 'Laminaire'],
  },
  {
    nom: 'Le crepuscule',
    grec: 'Mesopelagique',
    depart: 200,
    temperature: 9,
    lumiere: 'Moins de 1 %',
    texte:
      'Ici commence la plus grande migration animale de la planete : chaque nuit, un milliard de tonnes de bestioles montent manger en surface, et redescendent avant le jour.',
    faune: ['Hachette de mer', 'Calmar vampire', 'Siphonophore', 'Krill'],
  },
  {
    nom: 'La nuit',
    grec: 'Bathypelagique',
    depart: 1000,
    temperature: 4,
    lumiere: 'Aucune, sauf celle du vivant',
    texte:
      'Plus un photon venu du ciel. Neuf especes sur dix fabriquent leur propre lumiere : ce n est plus une exception, c est la norme du plus grand habitat de la Terre.',
    faune: ['Baudroie des abysses', 'Grandgousier', 'Poisson-ogre', 'Meduse atolla'],
  },
  {
    nom: 'La plaine',
    grec: 'Abyssopelagique',
    depart: 4000,
    temperature: 2,
    lumiere: 'Aucune',
    texte:
      'Une plaine de vase qui couvre la moitie du globe, ou il tombe deux millimetres de sediment par millenaire. Nous en avons cartographie moins que la surface de Mars.',
    faune: ['Holothurie', 'Poisson-trepied', 'Etoile de mer abyssale', 'Xenophyophore'],
  },
  {
    nom: 'La fosse',
    grec: 'Hadopelagique',
    depart: 6000,
    temperature: 1,
    lumiere: 'Aucune',
    texte:
      'Mille cent atmospheres — une tonne par centimetre carre. Quatre personnes seulement sont descendues au point le plus bas, et trois d entre elles apres 2019.',
    faune: ['Amphipode geant', 'Liparidae', 'Bacterie chimiotrophe'],
  },
]

/** La profondeur atteinte a une progression donnee, en metres. */
function profondeurA(p: number): number {
  // Une descente reelle accelere : le sous-marin lache du lest et tombe. La
  // courbe au carre donne ce poids, et laisse le temps de lire la surface.
  return Math.round(FOND * p * p)
}

/** La zone qui correspond a une profondeur. */
function zoneA(metres: number): number {
  let rang = 0
  for (const [index, zone] of ZONES.entries()) {
    if (metres >= zone.depart) rang = index
  }
  return rang
}

/* ============================ La feuille de la plongee ================= */

const STYLE_ABYSSE = 'o-vitrine-abysse'

/**
 * Trois choses que les utilitaires n ont pas : des bulles qui montent, des
 * rais de lumiere qui ondulent, et une lueur qui bat comme un leurre de
 * baudroie. Toutes coupees sous mouvement reduit.
 */
const CSS_ABYSSE = [
  '@keyframes o-ab-bulle{0%{transform:translate3d(0,0,0) scale(0.6);opacity:0}',
  '12%{opacity:0.7}80%{opacity:0.5}',
  '100%{transform:translate3d(var(--o-ab-derive,10px),-120vh,0) scale(1);opacity:0}}',
  '@keyframes o-ab-rai{0%,100%{transform:translate3d(-2%,0,0) skewX(-9deg);opacity:0.35}',
  '50%{transform:translate3d(3%,0,0) skewX(-5deg);opacity:0.7}}',
  '@keyframes o-ab-leurre{0%,100%{opacity:0.25;transform:scale(0.9)}50%{opacity:1;transform:scale(1.15)}}',
  '[data-o-ab-bulle]{animation:o-ab-bulle var(--o-ab-duree,14s) linear var(--o-ab-delai,0s) infinite}',
  '[data-o-ab-rai]{animation:o-ab-rai var(--o-ab-duree,11s) ease-in-out var(--o-ab-delai,0s) infinite}',
  '[data-o-ab-leurre]{animation:o-ab-leurre var(--o-ab-duree,3.4s) ease-in-out var(--o-ab-delai,0s) infinite}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-ab-bulle],[data-o-ab-rai],[data-o-ab-leurre]{animation:none}',
  '[data-o-ab-bulle]{opacity:0.4}}',
].join('')

function useFeuilleAbysse(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_ABYSSE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_ABYSSE
    feuille.textContent = CSS_ABYSSE
    document.head.append(feuille)
  }, [])
}

/* ============================ Le decor ================================= */

/** Une suite de nombres stable, pour semer sans hasard entre deux rendus. */
function graines(nombre: number, germe: number): readonly number[] {
  const suite: number[] = []
  let valeur = germe
  for (let rang = 0; rang < nombre; rang += 1) {
    valeur = (valeur * 1103515245 + 12345) % 2147483648
    suite.push(valeur / 2147483648)
  }
  return suite
}

/** La neige marine : la matiere morte qui tombe, et qui nourrit tout le reste. */
function Neige({ nombre, taille, opacite }: { readonly nombre: number; readonly taille: number; readonly opacite: number }): ReactElement {
  const semis = graines(nombre * 2, nombre * 7 + 3)
  return (
    <div aria-hidden="true" className="o-absolute o-inset-0 o-overflow-hidden">
      {Array.from({ length: nombre }, (_, rang) => (
        <span
          key={rang}
          className="o-absolute o-block o-rounded-full o-bg-white"
          style={{
            left: `${String(((semis[rang * 2] ?? 0) * 100).toFixed(2))}%`,
            top: `${String(((semis[rang * 2 + 1] ?? 0) * 100).toFixed(2))}%`,
            width: taille,
            height: taille,
            opacity: opacite,
          }}
        />
      ))}
    </div>
  )
}

/** Les rais de lumiere de la surface, qui ondulent sans fin. */
function Rais(): ReactElement {
  return (
    <div aria-hidden="true" className="o-absolute o-inset-0 o-overflow-hidden o-mix-blend-screen">
      {[8, 22, 38, 55, 71, 88].map((gauche, rang) => (
        <span
          key={gauche}
          data-o-ab-rai=""
          className="o-absolute o-block"
          style={{
            left: `${String(gauche)}%`,
            top: '-10%',
            width: `${String(3 + (rang % 3) * 2)}vw`,
            height: '120%',
            background: 'linear-gradient(to bottom, color-mix(in oklab, white 55%, transparent), transparent 70%)',
            '--o-ab-duree': `${String(9 + rang * 1.3)}s`,
            '--o-ab-delai': `${String(-rang * 1.7)}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}

/** Des bulles qui remontent : le seul mouvement qui va vers le haut. */
function Bulles({ nombre }: { readonly nombre: number }): ReactElement {
  const semis = graines(nombre * 3, nombre * 13 + 5)
  return (
    <div aria-hidden="true" className="o-absolute o-inset-0 o-overflow-hidden">
      {Array.from({ length: nombre }, (_, rang) => {
        const taille = 3 + (semis[rang * 3] ?? 0) * 9
        return (
          <span
            key={rang}
            data-o-ab-bulle=""
            className="o-absolute o-block o-rounded-full o-border-w-1 o-border-white-20"
            style={{
              left: `${String((((semis[rang * 3 + 1] ?? 0) * 100)).toFixed(2))}%`,
              bottom: `${String((((semis[rang * 3 + 2] ?? 0) * 30)).toFixed(2))}%`,
              width: taille,
              height: taille,
              background: 'color-mix(in oklab, white 14%, transparent)',
              '--o-ab-duree': `${String(11 + (semis[rang * 3] ?? 0) * 12)}s`,
              '--o-ab-delai': `${String(-rang * 1.9)}s`,
              '--o-ab-derive': `${String(Math.round(((semis[rang * 3 + 1] ?? 0) - 0.5) * 60))}px`,
            } as CSSProperties}
          />
        )
      })}
    </div>
  )
}

/* ============================ La faune ================================= */

/** Une meduse : une ombrelle et des filaments. */
function Meduse({ taille, couleur }: { readonly taille: number; readonly couleur: string }): ReactElement {
  return (
    <svg viewBox="0 0 100 150" width={taille} height={taille * 1.5} aria-hidden="true" fill="none">
      <path d="M8 52C8 26 27 8 50 8s42 18 42 44c0 8-4 11-12 11H20C12 63 8 60 8 52Z" fill={couleur} opacity="0.85" />
      <path d="M28 63c0 26-8 42-14 62M44 63c0 30-3 48-5 66M56 63c0 30 3 48 5 66M72 63c0 26 8 42 14 62" stroke={couleur} strokeWidth="2.5" opacity="0.55" strokeLinecap="round" />
    </svg>
  )
}

/** Un banc de poissons : le meme corps, seme a des tailles differentes. */
function Banc({ nombre, couleur, largeur }: { readonly nombre: number; readonly couleur: string; readonly largeur: number }): ReactElement {
  const semis = graines(nombre * 3, nombre * 17 + 11)
  return (
    <div aria-hidden="true" className="o-relative" style={{ width: largeur, height: largeur * 0.5 }}>
      {Array.from({ length: nombre }, (_, rang) => (
        <svg
          key={rang}
          viewBox="0 0 40 16"
          width={16 + (semis[rang * 3] ?? 0) * 30}
          aria-hidden="true"
          className="o-absolute"
          style={{
            left: `${String(((semis[rang * 3 + 1] ?? 0) * 88).toFixed(1))}%`,
            top: `${String(((semis[rang * 3 + 2] ?? 0) * 82).toFixed(1))}%`,
            transform: `scaleX(${(semis[rang * 3] ?? 0) > 0.5 ? '-1' : '1'})`,
          }}
        >
          <path d="M2 8c6-7 16-7 24-4l10-4-4 8 4 8-10-4C18 15 8 15 2 8Z" fill={couleur} opacity="0.7" />
        </svg>
      ))}
    </div>
  )
}

/** Un cachalot en plongee : la plus grande silhouette de la page. */
function Cachalot({ largeur, couleur }: { readonly largeur: number; readonly couleur: string }): ReactElement {
  return (
    <svg viewBox="0 0 300 110" width={largeur} aria-hidden="true" fill="none">
      <path
        d="M12 58c22-26 62-40 116-40 46 0 84 12 108 30l52-26-16 38 18 34-56-20c-24 16-60 26-106 26C70 100 32 84 12 58Z"
        fill={couleur}
        opacity="0.8"
      />
      <path d="M118 30c-8 10-10 22-6 34" stroke={couleur} strokeWidth="3" opacity="0.35" strokeLinecap="round" />
    </svg>
  )
}

/** Une baudroie et son leurre lumineux — le seul point clair de la nuit. */
function Baudroie({ largeur, couleur, lueur }: { readonly largeur: number; readonly couleur: string; readonly lueur: string }): ReactElement {
  return (
    <div aria-hidden="true" className="o-relative" style={{ width: largeur }}>
      <svg viewBox="0 0 200 130" width={largeur} aria-hidden="true" fill="none">
        <path d="M28 74c0-26 24-44 56-44 34 0 60 18 68 42l36-22-14 30 16 28-40-18c-12 16-34 26-62 26-36 0-60-18-60-42Z" fill={couleur} opacity="0.9" />
        <path d="M96 30c-4-16 2-24 12-26" stroke={couleur} strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
        <path d="M52 62l10 10 10-10M78 62l10 10 10-10M104 62l10 10 10-10" stroke={couleur} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      </svg>
      <span
        data-o-ab-leurre=""
        className="o-absolute o-block o-rounded-full"
        style={{
          left: `${String(largeur * 0.53)}px`,
          top: `${String(largeur * 0.01)}px`,
          width: 14,
          height: 14,
          background: lueur,
          boxShadow: `0 0 24px 8px ${lueur}`,
        }}
      />
    </div>
  )
}

/** Le relief du fond : une plaine de vase, puis les parois de la fosse. */
function Relief({ couleur, hauteur }: { readonly couleur: string; readonly hauteur: number }): ReactElement {
  return (
    <svg viewBox="0 0 1200 200" preserveAspectRatio="none" width="100%" height={hauteur} aria-hidden="true">
      <path d="M0 200V96c74-22 132 10 196 24 72 16 118-30 196-30 84 0 122 42 204 42 76 0 116-46 196-46 66 0 124 30 190 44 78 16 138-14 218-34v104Z" fill={couleur} />
    </svg>
  )
}

/* ============================ Le sondeur =============================== */

/** Les especes visibles, ecrites une fois par acte plutot qu a chaque image. */
function Panneau({ rang }: { readonly rang: number }): ReactElement {
  const zone = ZONES[rang] ?? ZONES[0]
  if (zone === undefined) return <div />
  return (
    <div className="o-flex o-h-full o-items-end o-p-6 o-pb-24 md:o-p-10 md:o-pb-28">
      <div className={`${verre(true)} o-max-w-md o-p-6 md:o-p-7`}>
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
          {zone.grec} — a partir de {zone.depart === 0 ? 'la surface' : `${String(zone.depart)} m`}
        </p>
        <h3 className="o-m-0 o-mt-4 o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.4vw, 3.25rem)' }}>
          {zone.nom}
        </h3>
        <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300">{zone.texte}</p>
        <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
          {zone.faune.map((espece) => (
            <li key={espece} className="o-rounded-full o-border-w-1 o-border-white-20 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200">
              {espece}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

/** Les liens de la barre. */
const NAVIGATION = [
  ['#descente', 'La descente'],
  ['#collections', 'Les collections'],
  ['#visite', 'Visiter'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('onest')
  useFeuilleAbysse()

  // Le sondeur est ecrit dans le DOM depuis l horloge : le passer par l etat
  // de React relancerait un rendu de toute la scene soixante fois par seconde.
  const metres = useRef<HTMLSpanElement>(null)
  const pression = useRef<HTMLSpanElement>(null)
  const degres = useRef<HTMLSpanElement>(null)
  const [zoneLue, setZoneLue] = useState(0)
  // La billetterie reste hors de l ecran tant qu on est en surface : sinon elle
  // couperait le premier paragraphe, qui est le seul argument de la page.
  const [plonge, setPlonge] = useState(false)

  useEffect(() => {
    const regarder = (): void => {
      setPlonge(window.scrollY > 420)
    }
    regarder()
    window.addEventListener('scroll', regarder, { passive: true })
    return () => {
      window.removeEventListener('scroll', regarder)
    }
  }, [])

  const sonder = (p: number): void => {
    const bas = profondeurA(p)
    if (metres.current !== null) metres.current.textContent = bas.toLocaleString('fr-FR')
    if (pression.current !== null) pression.current.textContent = String(Math.max(1, Math.round(bas / 10)))
    const rang = zoneA(bas)
    const zone = ZONES[rang] ?? ZONES[0]
    if (degres.current !== null && zone !== undefined) degres.current.textContent = String(zone.temperature)
    // Le seul rendu React de la descente : cinq fois en tout, pour que le
    // lecteur d ecran annonce la zone que les chiffres ne lui disent pas.
    setZoneLue((precedent) => (precedent === rang ? precedent : rang))
  }

  return (
    <Porte forme="iris" marque="Abysse">
      <div className="o-relative" style={{ ...nuit('slate'), ...polices }}>
        <BarreGelule
          marque="Abysse"
          liens={NAVIGATION}
          action={['#visite', 'Reserver']}
        />

        {/* ================= La surface : l ouverture ===================== */}
        <header className="o-relative o-isolate o-flex o-flex-col o-justify-between o-overflow-hidden o-px-6 o-pb-16 o-pt-32 md:o-px-10" style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}>
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background: `linear-gradient(to bottom, ${accentDoux(200, 70)} 0%, ${accentDoux(500, 55)} 34%, ${accentDoux(800, 60)} 68%, var(--o-palette-slate-950) 100%)`,
            }}
          />
          <Rais />
          <Bulles nombre={16} />
          <Neige nombre={40} taille={2} opacite={0.35} />
          <Grain opacite={0.05} />

          <div className="o-relative o-z-20">
            <Surgit>
              <Etiquette>Exposition permanente — Musee de la mer, Brest</Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              className="o-m-0 o-mt-8 o-max-w-4xl o-text-zinc-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.75rem, 8vw, 8.5rem)' }}
            >
              Onze mille metres sous vos pieds.
            </TitreVague>
          </div>

          <div className="o-relative o-z-20 o-flex o-flex-wrap o-items-end o-justify-between o-gap-8">
            <Surgit delai={520} as="p" className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-200">
              La moitie de la planete est une plaine de vase noire a quatre degres. Nous en avons vu moins que de la surface de Mars. Descendez : la page est la plongee.
            </Surgit>
            <Surgit delai={640} className="o-flex o-items-center o-gap-4">
              <a
                href="#descente"
                className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-6 o-py-3 o-text-sm o-font-semibold o-text-white o-no-underline o-backdrop-blur-md o-transition-colors hover:o-bg-white-20 focus:o-ring"
              >
                Commencer la descente
                <Icon icon={ArrowDown} size={16} aria-hidden="true" />
              </a>
            </Surgit>
          </div>

          <Coin position="bg">48° 23 N — 4° 29 O<br />Salle basse, niveau -1</Coin>
          <Coin position="bd">Ouvert du mardi au dimanche<br />10 h — 18 h</Coin>
        </header>

        {/* ================= La descente : le diorama ===================== */}
        <div id="descente" className="o-scroll-mt-24">
          <Profondeur
            ecrans={7}
            actes={ZONES.length}
            acteDe={(p) => zoneA(profondeurA(p))}
            course={140}
            glisse={0.82}
            surProgression={sonder}
            hud={(acte) => <Panneau rang={acte} />}
            className="o-bg-slate-950"
          >
            {/* La colonne d eau, plus haute que l ecran : c est elle qui coule. */}
            <Couche profondeur={0.9} className="o-h-full">
              <div
                aria-hidden="true"
                className="o-absolute o-inset-x-0"
                style={{
                  top: '-10%',
                  height: '260%',
                  background: `linear-gradient(to bottom, ${accentDoux(300, 65)} 0%, ${accentDoux(600, 55)} 18%, ${accentDoux(900, 60)} 38%, var(--o-palette-slate-950) 62%, #01040a 100%)`,
                }}
              />
            </Couche>

            {/* Les rais ne descendent pas : ils restent accroches a la surface. */}
            <Couche profondeur={1.05} className="o-h-full">
              <div className="o-absolute o-inset-x-0 o-top-0" style={{ height: '90%' }}>
                <Rais />
              </div>
            </Couche>

            {/* Trois nappes de neige marine, a trois vitesses : le volume. */}
            <Couche profondeur={0.25}>
              <Neige nombre={70} taille={2} opacite={0.3} />
            </Couche>
            <Couche profondeur={0.55}>
              <Neige nombre={45} taille={3} opacite={0.4} />
            </Couche>
            <Couche profondeur={1.15} derive={30}>
              <Neige nombre={22} taille={5} opacite={0.5} />
            </Couche>

            {/* La faune, semee a la profondeur ou elle vit vraiment. */}
            <Couche profondeur={0.62} derive={22}>
              <div className="o-absolute" style={{ left: '8%', top: '62%' }}>
                <Flotte amplitude={14} duree={9}>
                  <Banc nombre={26} couleur={accentDoux(200, 80)} largeur={420} />
                </Flotte>
              </div>
              <div className="o-absolute" style={{ right: '6%', top: '118%' }}>
                <Flotte amplitude={11} duree={12} delai={-5}>
                  <Banc nombre={18} couleur={accentDoux(300, 55)} largeur={300} />
                </Flotte>
              </div>
            </Couche>

            <Couche profondeur={0.8} derive={40}>
              <div className="o-absolute" style={{ right: '10%', top: '132%' }}>
                <Flotte amplitude={20} duree={12} delai={-3}>
                  <Meduse taille={110} couleur={accentDoux(200, 60)} />
                </Flotte>
              </div>
              <div className="o-absolute" style={{ left: '18%', top: '176%' }}>
                <Flotte amplitude={16} duree={14} delai={-6}>
                  <Meduse taille={70} couleur={accentDoux(300, 45)} />
                </Flotte>
              </div>
            </Couche>

            <Couche profondeur={0.7} derive={26}>
              <div className="o-absolute" style={{ left: '4%', top: '150%' }}>
                <Flotte amplitude={22} duree={18}>
                  <Cachalot largeur={460} couleur="color-mix(in oklab, var(--o-palette-slate-950) 58%, white)" />
                </Flotte>
              </div>
            </Couche>

            <Couche profondeur={0.95} derive={48}>
              <div className="o-absolute" style={{ right: '10%', top: '178%' }}>
                <Flotte amplitude={12} duree={10}>
                  <Baudroie largeur={300} couleur="#060b14" lueur={encreSurSombre()} />
                </Flotte>
              </div>
              <div className="o-absolute" style={{ left: '14%', top: '206%' }}>
                <Flotte amplitude={9} duree={13} delai={-4}>
                  <Baudroie largeur={170} couleur="#04080f" lueur={encreSurSombre()} />
                </Flotte>
              </div>
            </Couche>

            {/* Le fond : il arrive par le bas, et il arrete la descente. */}
            <Couche profondeur={1.25}>
              <div className="o-absolute o-inset-x-0" style={{ top: '188%' }}>
                <Relief couleur="#02060d" hauteur={220} />
                <div className="o-h-96" style={{ background: '#02060d' }} />
              </div>
            </Couche>

            <Couche profondeur={1.4} derive={60}>
              <div className="o-absolute o-inset-x-0" style={{ top: '236%' }}>
                <Relief couleur="#010409" hauteur={280} />
              </div>
            </Couche>

            {/* Le sondeur, colle en haut a droite de la scene. */}
            <div className="o-pointer-events-none o-absolute o-right-6 o-top-6 o-z-40 md:o-right-10 md:o-top-10">
              <div className={`${verre(true)} o-px-5 o-py-4 o-text-right`}>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">Sondeur</p>
                <p className="o-m-0 o-mt-1 o-tabular-nums o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4vw, 3.25rem)' }}>
                  <span aria-hidden="true">−</span>
                  <span ref={metres} aria-hidden="true">0</span>
                  <span className="o-ml-1 o-text-base">m</span>
                  <span className="o-sr-only">Profondeur atteinte : {ZONES[zoneLue]?.nom ?? ''}</span>
                </p>
                <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400" aria-hidden="true">
                  <span ref={pression}>1</span> bar · <span ref={degres}>18</span> °C
                </p>
              </div>
            </div>
          </Profondeur>
        </div>

        {/* ================= Ce qu on remonte ============================= */}
        <GradualBlur side="top" size={140} strength={12} layers={6} tint="#02060d">
          <section id="collections" className="o-relative o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-36" style={{ background: '#02060d' }}>
            <Neige nombre={30} taille={2} opacite={0.18} />
            <div className="o-relative o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01">Les collections</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}>
                Ce que les campagnes ont remonte.
              </h2>
            </Reveal>

            <ol className="o-m-0 o-mt-16 o-list-none o-border-t o-border-white-10 o-p-0">
              {[
                ['1 240 m', 'Le calmar vampire', 'Ni calmar ni pieuvre : le dernier survivant de son ordre, qui vit dans la couche ou l oxygene manque et que rien d autre ne supporte.'],
                ['2 500 m', 'La cheminee hydrothermale', 'Trois cent cinquante degres, et une vie entiere qui ne doit rien au soleil. Nous en avons ramene un tube de deux metres, en 1994.'],
                ['4 100 m', 'La carotte de sediment', 'Huit metres de vase, soit quatre millions d annees de climat lus centimetre par centimetre.'],
                ['10 916 m', 'La boue du Challenger', 'Trente grammes rapportes du point le plus bas de la planete. Ils contenaient deja du microplastique.'],
              ].map(([profondeur, titre, texte], rang) => (
                <li key={titre} className="o-grid o-items-baseline o-gap-4 o-border-b o-border-white-10 o-py-8 md:o-grid-cols-12 md:o-gap-10">
                  <span className="o-font-mono o-text-xs o-uppercase o-tabular-nums o-tracking-widest md:o-col-span-2" style={{ color: encreSurSombre() }}>
                    {profondeur}
                  </span>
                  <h3 className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-zinc-50 md:o-col-span-4">
                    <span className="o-sr-only">Piece {rang + 1} — </span>
                    {titre}
                  </h3>
                  <p className="o-m-0 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-400 md:o-col-span-6">{texte}</p>
                </li>
              ))}
              </ol>
            </div>
          </section>
        </GradualBlur>

        {/* ================= Visiter ====================================== */}
        <section id="visite" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32" style={{ background: '#01040a' }}>
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-5">
              <Indice rang="02">Visiter</Indice>
              <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300">
                La descente dure vingt-deux minutes dans la salle basse, sur un ecran de onze metres. Les seances partent toutes les demi-heures ; la derniere a 17 h 30.
              </p>
              <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500">
                Musee de la mer<br />
                Pointe du Diable, 29200 Brest<br />
                Tramway A — arret Octant
              </p>
            </div>
            <dl className="o-m-0 md:o-col-span-7">
              {[
                ['Plein tarif', '14 €'],
                ['Reduit — etudiants, demandeurs d emploi', '9 €'],
                ['Moins de 26 ans, premier dimanche du mois', 'Gratuit'],
                ['Groupes scolaires, sur reservation', '4 € par eleve'],
              ].map(([quoi, combien]) => (
                <div key={quoi} className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-1 o-border-b o-border-white-10 o-py-4">
                  <dt className="o-text-sm o-text-zinc-300">{quoi}</dt>
                  <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-zinc-50">{combien}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ================= Le pied : le nom, debout ===================== */}
        <footer className="o-relative o-overflow-hidden o-px-6 o-pb-28 o-pt-20 md:o-px-10" style={{ background: '#01040a' }}>
          <div className="o-mx-auto o-flex o-max-w-6xl o-gap-10">
            <p
              aria-hidden="true"
              className="o-m-0 o-select-none o-whitespace-nowrap o-text-zinc-50 o-opacity-30"
              style={{ ...affiche('m', 300), writingMode: 'vertical-rl', fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', letterSpacing: '0.08em' }}
            >
              ABYSSE
            </p>
            <div className="o-grid o-grow o-gap-10 sm:o-grid-cols-3">
              {[
                { titre: 'L exposition', liens: ['La descente', 'Les collections', 'Le film de 22 minutes', 'Accessibilite'] },
                { titre: 'Le musee', liens: ['Les campagnes', 'La bibliotheque', 'Recrutement', 'Presse'] },
                { titre: 'Venir', liens: ['Horaires et tarifs', 'Groupes scolaires', 'Plan d acces', 'Nous ecrire'] },
              ].map((colonne) => (
                <nav key={colonne.titre} aria-label={colonne.titre}>
                  <h2 className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                    {colonne.titre}
                  </h2>
                  <ul className="o-m-0 o-mt-4 o-list-none o-space-y-2 o-p-0">
                    {colonne.liens.map((lien) => (
                      <li key={lien}>
                        <a href="#descente" className="o-text-sm o-text-zinc-400 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring">
                          {lien}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>
          <p className="o-mx-auto o-mt-16 o-max-w-6xl o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            Musee de la mer — etablissement public — © 2026. Profondeurs, temperatures et faune d apres les campagnes Ifremer.
          </p>
        </footer>

        {/* La billetterie, posee en bas de l ecran : c est la seule action. */}
        <div
          className="o-pointer-events-none o-fixed o-bottom-0 o-left-0 o-z-40 o-flex o-w-full o-justify-center o-p-4 o-transition-all md:o-justify-end md:o-px-10"
          style={{ opacity: plonge ? 1 : 0, transform: plonge ? 'none' : 'translateY(120%)' }}
          aria-hidden={!plonge}
        >
          <div className={`${verre(true)} o-pointer-events-auto o-flex o-flex-wrap o-items-center o-justify-center o-gap-x-5 o-gap-y-2 o-px-5 o-py-3`}>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">
              Prochaine seance 14 h 30 — 22 places
            </p>
            <a
              href="#visite"
              className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-5 o-py-2 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
              style={{ backgroundColor: encreSurSombre(), color: 'var(--o-palette-slate-950)' }}
            >
              <Icon icon={Ticket} size={15} aria-hidden="true" />
              Reserver
              <Icon icon={ArrowRight} size={15} aria-hidden="true" />
            </a>
            <a href="#collections" className="o-hidden o-items-center o-gap-1.5 o-text-sm o-text-zinc-300 o-no-underline hover:o-text-zinc-50 focus:o-ring sm:o-inline-flex">
              Les collections
              <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </Porte>
  )
}
