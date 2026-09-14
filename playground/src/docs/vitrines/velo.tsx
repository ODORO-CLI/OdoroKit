/**
 * Meridien — velos d acier, Saint-Etienne.
 *
 * ## Le parti pris : on ne feuillette pas un catalogue, on roule
 *
 * Un fabricant de velos qui aligne des cartes de produits vend un objet pose.
 * Celui-ci vend un objet en mouvement : le corps de la page est **une sortie
 * de cent vingt-huit kilometres**, parcourue lateralement. La molette
 * n avance pas dans un document, elle fait tourner les roues — leur rotation
 * est branchee sur la meme variable que le decor — et le compteur egrene les
 * kilometres, l altitude et la pente.
 *
 * Cinq portions se succedent : le plat, la cote, le col, la descente,
 * l arrivee. Chacune met en avant une piece du velo, parce que c est la que
 * cette piece se juge — un boitier de pedalier se defend dans une rampe a
 * douze pour cent, pas sur une fiche technique.
 *
 * ## Pourquoi la glisse
 *
 * Un velo a de l inertie : on cesse de pedaler et il continue. La progression
 * du decor est amortie ({@link Profondeur}), si bien qu un cran de molette
 * lance la machine et que le paysage court encore une seconde apres. Sans
 * cela, la page serait un diaporama ; avec, elle a un poids.
 *
 * ## Ce qui n est pas une image
 *
 * Le decor entier est du SVG en ligne, teinte par les variables de la
 * palette : cinq plans de relief, une route, un velo. Aucune photographie a
 * charger, aucune scene graphique, et la page se retinte avec la vitrine.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, Check, Wrench } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { Select } from '@odoro-cli/libs/ui'
import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'

import { Shuffle } from '@/odoro/text/Shuffle.jsx'

import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { accent, accentDoux, aplat, encre } from './palettes.js'
import { Couche, Profondeur } from './scene.jsx'

/* ============================ La sortie ================================ */

/** La distance totale de la sortie, en kilometres. */
const DISTANCE = 128

/** Une portion de la sortie, et la piece du velo qu elle met a l epreuve. */
interface Portion {
  readonly nom: string
  readonly depart: number
  readonly altitude: number
  readonly pente: number
  readonly piece: string
  readonly texte: string
}

const PORTIONS: readonly Portion[] = [
  {
    nom: 'Le plat',
    depart: 0,
    altitude: 210,
    pente: 0.5,
    piece: 'Le cadre — acier Columbus Spirit',
    texte:
      'Trente-huit tubes possibles, brases a l argent, un par un. L acier rend deux pour cent de moins que le carbone au watt, et vingt ans de plus a l usage.',
  },
  {
    nom: 'La cote',
    depart: 34,
    altitude: 640,
    pente: 6.4,
    piece: 'Le pedalier — 46 x 30, axe 30 mm',
    texte:
      'Un braquet qui monte. Nous montons des plateaux de trente dents quand tout le monde en met trente-quatre : personne n a jamais regrette d avoir eu trop court dans une rampe.',
  },
  {
    nom: 'Le col',
    depart: 61,
    altitude: 1420,
    pente: 9.1,
    piece: 'La geometrie — chasse 58 mm',
    texte:
      'Un angle de direction de 72 degres et une chasse longue. Le velo tient sa ligne a huit kilometres a l heure, debout, sans que le guidon parte a chaque coup de pedale.',
  },
  {
    nom: 'La descente',
    depart: 78,
    altitude: 560,
    pente: -8.2,
    piece: 'Les freins — disque 160 mm',
    texte:
      'Deux cent quarante grammes de plus, et une distance d arret divisee par deux sous la pluie. C est le seul endroit ou nous refusons de discuter le poids.',
  },
  {
    nom: 'L arrivee',
    depart: 104,
    altitude: 230,
    pente: -1.1,
    piece: 'Les roues — jantes 32 mm, rayons inox',
    texte:
      'Montees a la main dans l atelier, tension relevee sur chaque rayon et consignee sur une fiche qui part avec le velo. Un rayon casse se remplace en dix minutes.',
  },
]

/** La distance parcourue a une progression donnee, en kilometres. */
function distanceA(p: number): number {
  return p * DISTANCE
}

/** Le profil altimetrique, interpole entre les portions. */
function altitudeA(km: number): number {
  const dernier = PORTIONS[PORTIONS.length - 1]
  if (dernier === undefined) return 0
  for (let rang = 0; rang < PORTIONS.length - 1; rang += 1) {
    const ici = PORTIONS[rang]
    const suivant = PORTIONS[rang + 1]
    if (ici === undefined || suivant === undefined) continue
    if (km < suivant.depart) {
      const part = (km - ici.depart) / Math.max(1, suivant.depart - ici.depart)
      return Math.round(ici.altitude + (suivant.altitude - ici.altitude) * part)
    }
  }
  return dernier.altitude
}

/** La portion en cours, a une progression donnee. */
function portionA(p: number): number {
  const km = distanceA(p)
  let rang = 0
  for (const [index, portion] of PORTIONS.entries()) {
    if (km >= portion.depart) rang = index
  }
  return rang
}

/* ============================ La feuille du decor ====================== */

const STYLE_VELO = 'o-vitrine-velo'

/**
 * Ce que les utilitaires n ont pas : un velo qui tressaute sur le revetement,
 * et des nuages qui traversent sans fin. Coupes sous mouvement reduit.
 */
const CSS_VELO = [
  '@keyframes o-ve-cahot{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(0,-3px,0)}',
  '55%{transform:translate3d(0,1.5px,0)}80%{transform:translate3d(0,-1px,0)}}',
  '@keyframes o-ve-nuage{0%{transform:translate3d(6vw,0,0)}100%{transform:translate3d(-108vw,0,0)}}',
  '[data-o-ve-cahot]{animation:o-ve-cahot 0.62s ease-in-out infinite}',
  '[data-o-ve-nuage]{animation:o-ve-nuage var(--o-ve-duree,90s) linear var(--o-ve-delai,0s) infinite}',
  '@media (prefers-reduced-motion:reduce){[data-o-ve-cahot],[data-o-ve-nuage]{animation:none}}',
].join('')

function useFeuilleVelo(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_VELO) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_VELO
    feuille.textContent = CSS_VELO
    document.head.append(feuille)
  }, [])
}

/**
 * Le registre clair, epingle sur la scene.
 *
 * La sortie a lieu de jour, quel que soit le theme du visiteur : le pendant
 * de `nuit()` pour une page qui doit rester eclairee. Redeclarer les variables
 * plutot que poser des classes en dur laisse `accentDoux` et les pieces du
 * registre s y adapter seules.
 */
const JOUR = {
  colorScheme: 'light',
  '--o-theme-bg': 'var(--o-palette-zinc-50)',
  '--o-theme-surface': 'var(--o-palette-zinc-100)',
  '--o-theme-fg': 'var(--o-palette-zinc-950)',
  '--o-theme-muted': 'var(--o-palette-zinc-600)',
  '--o-theme-line': 'var(--o-palette-zinc-300)',
} as CSSProperties

/* ============================ Le relief ================================ */

/**
 * Une bande de relief, repetee jusqu a couvrir la course de sa couche.
 *
 * Le dessin est en SVG **en ligne** plutot qu en image de fond : c est la
 * seule facon que le remplissage lise `var(--o-vitrine-*)` et que le paysage
 * se retinte quand la vitrine change de couleur.
 */
function Relief({
  couleur,
  chemin,
  largeur,
  hauteur,
  repetitions,
}: {
  readonly couleur: string
  readonly chemin: string
  readonly largeur: string
  readonly hauteur: string
  readonly repetitions: number
}): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="o-absolute o-bottom-0 o-left-0 o-flex"
      style={{ width: largeur, height: hauteur }}
    >
      {Array.from({ length: repetitions }, (_, rang) => (
        <svg
          key={rang}
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
          className="o-h-full o-shrink-0"
          style={{
            width: `${(100 / repetitions).toFixed(4)}%`,
            transform: rang % 2 === 1 ? 'scaleX(-1)' : undefined,
          }}
        >
          <path d={chemin} fill={couleur} />
        </svg>
      ))}
    </div>
  )
}

/** Les cretes lointaines. */
const CRETES =
  'M0 300V168l84-52 76 46 92-84 118 74 96-38 104 58 88-72 122 66 92-40 114 62 114-46v158Z'
/** Les collines de second plan. */
const COLLINES =
  'M0 300V196l128 34 122-58 136 44 118-52 146 62 132-46 126 54 148-38 144 46v58Z'
/** La ligne d arbres. */
const ARBRES =
  'M0 300V252l40-30 22 30 34-46 26 46 44-28 30 28 46-40 28 40 40-24 26 24 48-38 26 38 44-30 30 30 46-44 28 44 40-26 28 26 46-36 28 36 44-28 26 28 48-40 28 40 44-26 28 26 46-38 26 38 44-30 30 30 46-42 28 42 40-24 24 24v42Z'

/* ============================ Le velo ================================== */

/**
 * Le velo, de profil. Les roues tournent sur la meme variable que le decor :
 * elles accelerent avec la molette et continuent avec la glisse, parce que
 * `--p` continue de couler.
 */
function Machine({
  largeur,
  cadre,
  jante,
}: {
  readonly largeur: number
  readonly cadre: string
  readonly jante: string
}): ReactElement {
  const roue = (cx: number): ReactElement => (
    <g
      style={{
        transform: `rotate(calc(var(--p, 0) * 2880deg))`,
        transformOrigin: `${String(cx)}px 148px`,
        transformBox: 'view-box',
      }}
    >
      <circle cx={cx} cy={148} r={54} fill="none" stroke={jante} strokeWidth="7" />
      <circle
        cx={cx}
        cy={148}
        r={46}
        fill="none"
        stroke={jante}
        strokeWidth="1.5"
        opacity="0.5"
      />
      {Array.from({ length: 12 }, (_, rang) => {
        const angle = (rang * Math.PI) / 6
        return (
          <line
            key={rang}
            x1={cx}
            y1={148}
            x2={cx + Math.cos(angle) * 50}
            y2={148 + Math.sin(angle) * 50}
            stroke={jante}
            strokeWidth="1.4"
            opacity="0.75"
          />
        )
      })}
      <circle cx={cx} cy={148} r={6} fill={cadre} />
    </g>
  )

  return (
    <svg viewBox="0 0 420 210" width={largeur} aria-hidden="true" fill="none">
      {roue(76)}
      {roue(344)}
      {/* Le triangle avant, la base, la fourche et les haubans. */}
      <path
        d="M76 148 L192 148 L246 62 L152 62 L76 148 M192 148 L246 62 M246 62 L344 148 M192 148 L344 148 M152 62 L138 44"
        stroke={cadre}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* La fourche, le cintre, la selle. */}
      <path
        d="M246 62 L262 40 M262 40 L292 40 M262 40 L240 46"
        stroke={cadre}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M118 36 L166 36" stroke={cadre} strokeWidth="8" strokeLinecap="round" />
      <circle
        cx={192}
        cy={148}
        r={20}
        fill="none"
        stroke={cadre}
        strokeWidth="4"
        opacity="0.85"
      />
      <path d="M192 128 L206 156" stroke={cadre} strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

/* ============================ Le panneau de portion ==================== */

function Panneau({ rang }: { readonly rang: number }): ReactElement {
  const portion = PORTIONS[rang] ?? PORTIONS[0]
  if (portion === undefined) return <div />
  return (
    <div className="o-flex o-h-full o-items-start o-p-6 md:o-p-10">
      <div
        className="o-max-w-sm o-rounded-2xl o-border-w-1 o-p-6 o-shadow-xl"
        style={{ borderColor: accentDoux(700, 24), backgroundColor: 'var(--o-theme-bg)' }}
      >
        <p
          className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
          style={{ color: encre() }}
        >
          Kilometre {portion.depart} — {portion.altitude} m
        </p>
        <h3
          className="o-m-0 o-mt-3"
          style={{
            color: 'var(--o-theme-fg)',
            ...affiche('m', 300),
            fontSize: 'clamp(1.75rem, 3.2vw, 3rem)',
          }}
        >
          <Shuffle duration={520} step={26}>
            {portion.nom}
          </Shuffle>
        </h3>
        <p
          className="o-m-0 o-mt-4 o-text-sm o-font-medium"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {portion.piece}
        </p>
        <p
          className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed"
          style={{ color: 'var(--o-theme-muted)' }}
        >
          {portion.texte}
        </p>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#sortie', 'La sortie'],
  ['#atelier', 'L atelier'],
  ['#essai', 'Essayer'],
] as const

/** Les modeles proposes a l essai. */
const MODELES = [
  'Meridien 01 — route',
  'Meridien 03 — gravel',
  'Meridien 05 — randonneuse',
] as const

export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  useFeuilleVelo()

  const km = useRef<HTMLSpanElement>(null)
  const metres = useRef<HTMLSpanElement>(null)
  const pente = useRef<HTMLSpanElement>(null)
  const curseur = useRef<HTMLSpanElement>(null)
  const [portionLue, setPortionLue] = useState(0)

  const rouler = (p: number): void => {
    const parcouru = distanceA(p)
    if (km.current !== null)
      km.current.textContent = parcouru.toFixed(1).replace('.', ',')
    if (metres.current !== null) metres.current.textContent = String(altitudeA(parcouru))
    const rang = portionA(p)
    const portion = PORTIONS[rang] ?? PORTIONS[0]
    if (pente.current !== null && portion !== undefined) {
      pente.current.textContent = `${portion.pente > 0 ? '+' : ''}${portion.pente.toFixed(1).replace('.', ',')}`
    }
    if (curseur.current !== null) curseur.current.style.left = `${(p * 100).toFixed(2)}%`
    setPortionLue((precedent) => (precedent === rang ? precedent : rang))
  }

  const [modele, setModele] = useState<string>(MODELES[0])
  const [jour, setJour] = useState('')
  const [envoye, setEnvoye] = useState(false)

  return (
    <Porte forme="trou" marque="Meridien" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : la machine, a l arret ========== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-justify-between o-overflow-hidden"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background: `linear-gradient(to bottom, ${accentDoux(200, 46)}, transparent 62%)`,
            }}
          />
          <BarreCoins
            marque="Meridien"
            liens={NAVIGATION}
            droite="Saint-Etienne — depuis 1978"
            sombre={false}
          />

          <div className="o-relative o-z-10 o-px-6 md:o-px-10">
            <Surgit>
              <Etiquette sombre={false}>
                Cadres en acier, brases a la main — sur mesure en 9 semaines
              </Etiquette>
            </Surgit>
            <TitreVague
              delai={120}
              className="o-m-0 o-mt-6 o-max-w-5xl o-text-zinc-950 dark:o-text-zinc-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 7.5vw, 7.5rem)' }}
            >
              Un velo se juge au kilometre 61.
            </TitreVague>
          </div>

          <div className="o-relative o-z-10 o-flex o-flex-wrap o-items-end o-justify-between o-gap-8 o-px-6 o-pb-10 md:o-px-10">
            <Surgit
              delai={520}
              as="p"
              className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
            >
              Pas en vitrine, pas sur une fiche : dans une rampe a neuf pour cent, au bout
              de quatre heures. Alors faites la sortie — cette page est la sortie.
            </Surgit>
            <Surgit delai={640}>
              <Actions
                sombre={false}
                pleine={[
                  '#sortie',
                  <>
                    Partir pour 128 km{' '}
                    <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                  </>,
                ]}
                fantome={['#essai', 'Essayer un velo']}
              />
            </Surgit>
          </div>

          {/* La machine, posee sur la ligne de sol de l ouverture. */}
          <Surgit
            delai={340}
            className="o-relative o-z-10 o-flex o-justify-center o-overflow-hidden o-border-t o-px-6"
            style={{ borderColor: accentDoux(700, 18) }}
          >
            <div className="o-pointer-events-none o-py-8">
              <Machine largeur={640} cadre={accent(600)} jante="currentColor" />
            </div>
          </Surgit>
        </header>

        {/* ================= La sortie : le decor lateral ================= */}
        <div id="sortie" className="o-scroll-mt-24">
          <Profondeur
            ecrans={8}
            actes={PORTIONS.length}
            acteDe={portionA}
            course={420}
            sens="x"
            glisse={0.78}
            surProgression={rouler}
            hud={(acte) => <Panneau rang={acte} />}
            style={JOUR}
          >
            {/* Le ciel ne bouge pas : c est lui qui donne l echelle du reste. */}
            <Couche profondeur={0}>
              <div
                aria-hidden="true"
                className="o-absolute o-inset-0"
                style={{
                  backgroundColor: 'var(--o-theme-bg)',
                  background: `linear-gradient(to bottom, ${accentDoux(400, 46)} 0%, ${accentDoux(200, 34)} 52%, ${accentDoux(100, 20)} 100%)`,
                }}
              />
            </Couche>

            {/* Des nuages qui traversent, sans rapport avec la molette. */}
            <Couche profondeur={0.06}>
              {[
                { haut: '9%', taille: 150, duree: 150, delai: 0 },
                { haut: '17%', taille: 96, duree: 200, delai: -70 },
                { haut: '5%', taille: 200, duree: 260, delai: -140 },
              ].map((nuage) => (
                <span
                  key={nuage.haut + String(nuage.taille)}
                  data-o-ve-nuage=""
                  aria-hidden="true"
                  className="o-absolute o-block o-rounded-full"
                  style={
                    {
                      top: nuage.haut,
                      left: '100%',
                      width: nuage.taille,
                      height: nuage.taille * 0.24,
                      background: 'color-mix(in oklab, white 52%, transparent)',
                      filter: 'blur(12px)',
                      '--o-ve-duree': `${String(nuage.duree)}s`,
                      '--o-ve-delai': `${String(nuage.delai)}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </Couche>

            <Couche profondeur={0.22}>
              <Relief
                couleur={accentDoux(800, 22)}
                chemin={CRETES}
                largeur="220vw"
                hauteur="64%"
                repetitions={2}
              />
            </Couche>
            <Couche profondeur={0.45}>
              <Relief
                couleur={accentDoux(700, 34)}
                chemin={COLLINES}
                largeur="320vw"
                hauteur="48%"
                repetitions={3}
              />
            </Couche>
            <Couche profondeur={0.75} derive={12}>
              <Relief
                couleur={accentDoux(900, 46)}
                chemin={ARBRES}
                largeur="440vw"
                hauteur="34%"
                repetitions={4}
              />
            </Couche>

            {/* La route, et la bande qui file dessous. */}
            <Couche profondeur={1}>
              <div
                aria-hidden="true"
                className="o-absolute o-bottom-0 o-left-0"
                style={{ width: '540vw', height: '24%' }}
              >
                <div
                  className="o-h-full o-w-full"
                  style={{ backgroundColor: 'var(--o-palette-zinc-800)' }}
                />
                <div
                  className="o-absolute o-left-0 o-w-full"
                  style={{
                    top: '46%',
                    height: 4,
                    backgroundImage: `repeating-linear-gradient(to right, ${accentDoux(200, 90)} 0 60px, transparent 60px 140px)`,
                  }}
                />
              </div>
            </Couche>

            {/* Le velo : il ne se deplace pas, c est le monde qui passe. */}
            <Couche profondeur={0}>
              <div
                className="o-absolute o-bottom-0 o-left-0 o-flex o-w-full o-items-end o-justify-center"
                style={{ height: '36%' }}
              >
                <div data-o-ve-cahot="" className="o-text-zinc-100">
                  <Machine largeur={420} cadre={accent(600)} jante="currentColor" />
                </div>
              </div>
            </Couche>

            {/* Le compteur, et le profil de la sortie. */}
            <div className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-40 o-p-6 md:o-p-10">
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                <div
                  className="o-flex o-items-end o-gap-6 o-rounded-2xl o-px-5 o-py-4"
                  style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}
                >
                  <p
                    className="o-m-0 o-tabular-nums o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)',
                    }}
                  >
                    <span ref={km} aria-hidden="true">
                      0,0
                    </span>
                    <span className="o-ml-1 o-text-sm">km</span>
                  </p>
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300"
                    aria-hidden="true"
                  >
                    <span ref={metres}>210</span> m d altitude
                    <br />
                    pente <span ref={pente}>+0,5</span> %
                  </p>
                  <p className="o-sr-only">
                    Portion en cours : {PORTIONS[portionLue]?.nom ?? ''}
                  </p>
                </div>

                {/* Le profil : une ligne, et un curseur qui avance avec vous. */}
                <div className="o-relative o-h-14 o-w-full o-max-w-md" aria-hidden="true">
                  <svg
                    viewBox="0 0 400 60"
                    preserveAspectRatio="none"
                    className="o-h-full o-w-full"
                  >
                    <path
                      d="M0 52 L106 44 L190 14 L244 6 L325 40 L400 50"
                      fill="none"
                      stroke="var(--o-palette-zinc-50)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M0 52 L106 44 L190 14 L244 6 L325 40 L400 50 L400 60 L0 60Z"
                      fill={accentDoux(300, 55)}
                    />
                  </svg>
                  <span
                    ref={curseur}
                    className="o-absolute o-top-0 o-block o-h-full o-w-px"
                    style={{ left: '0%', backgroundColor: accent(500) }}
                  />
                </div>
              </div>
            </div>
          </Profondeur>
        </div>

        {/* ================= L atelier ==================================== */}
        <section
          id="atelier"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01" sombre={false}>
                L atelier
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 4.25rem)' }}
              >
                Neuf semaines, quatre paires de mains.
              </h2>
            </Reveal>

            <ol className="o-m-0 o-mt-16 o-list-none o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-p-0">
              {[
                [
                  'Semaine 1',
                  'La prise de cotes',
                  'Une heure sur le banc de mesure, et une sortie avec vous si vous etes a moins de deux heures de Saint-Etienne.',
                ],
                [
                  'Semaine 2 a 4',
                  'Le dessin et la coupe',
                  'Le plan est envoye avant la coupe. Tant qu il n est pas signe, aucun tube n est touche.',
                ],
                [
                  'Semaine 5 a 7',
                  'Le brasage',
                  'A l argent, a 620 degres, dans un gabarit reglable. Chaque jonction est limee a la main, sans mastic.',
                ],
                [
                  'Semaine 8',
                  'La peinture',
                  'Deux couches et un vernis, cuits a 80 degres. La teinte est libre ; nous refusons les logos d autres marques.',
                ],
                [
                  'Semaine 9',
                  'Le montage et la livraison',
                  'Roues tendues, transmission reglee, fiche de tension jointe. Le velo part monte, pas en carton.',
                ],
              ].map(([quand, quoi, comment]) => (
                <li
                  key={quand}
                  className="o-grid o-items-baseline o-gap-3 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-7 md:o-grid-cols-12 md:o-gap-10"
                >
                  <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-2">
                    {quand}
                  </span>
                  <h3 className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50 md:o-col-span-4">
                    {quoi}
                  </h3>
                  <p className="o-m-0 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-6">
                    {comment}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= L essai : le seul appel ====================== */}
        <section
          id="essai"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={{ backgroundColor: accentDoux(500, 10) }}
        >
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-6">
              <Indice rang="02" sombre={false}>
                Essayer
              </Indice>
              <h2
                className="o-m-0 o-mt-6 o-max-w-md o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.75rem, 3.6vw, 3.5rem)',
                }}
              >
                Prenez-en un pour la journee.
              </h2>
              <p className="o-m-0 o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                Trois velos d essai, en trois tailles, gardes a l atelier. Vous partez a 9
                h, vous rendez a 18 h, et le col du Grand Bois est a onze kilometres.
              </p>
              <p className="o-m-0 o-mt-6 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                <Icon icon={Wrench} size={14} aria-hidden="true" />
                Gratuit — deduit du velo si vous commandez
              </p>
            </div>

            <form
              className="o-flex o-flex-col o-gap-5 md:o-col-span-6"
              onSubmit={(evenement) => {
                evenement.preventDefault()
                setEnvoye(true)
              }}
            >
              <Select
                label="Le velo"
                value={modele}
                onChange={(evenement) => {
                  setModele(evenement.target.value)
                }}
              >
                {MODELES.map((nom) => (
                  <option key={nom} value={nom}>
                    {nom}
                  </option>
                ))}
              </Select>

              <fieldset className="o-m-0 o-p-0" style={{ border: 0 }}>
                <legend className="o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                  Le jour
                </legend>
                <div className="o-flex o-flex-wrap o-gap-2">
                  {['Samedi 19', 'Dimanche 20', 'Samedi 26', 'Dimanche 27'].map(
                    (date) => {
                      const choisi = date === jour
                      return (
                        <button
                          key={date}
                          type="button"
                          aria-pressed={choisi}
                          onClick={() => {
                            setJour(date)
                            setEnvoye(false)
                          }}
                          className="o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-transition-colors focus:o-ring"
                          style={
                            choisi
                              ? { ...aplat(), borderColor: 'transparent' }
                              : { borderColor: accentDoux(700, 30) }
                          }
                        >
                          {date} septembre
                        </button>
                      )
                    },
                  )}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={jour === ''}
                className="o-inline-flex o-w-fit o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                style={
                  jour === ''
                    ? {
                        backgroundColor: 'var(--o-theme-line)',
                        color: 'var(--o-theme-muted)',
                      }
                    : aplat()
                }
              >
                Reserver l essai
                <Icon icon={ArrowRight} size={16} aria-hidden="true" />
              </button>

              <p aria-live="polite" className="o-m-0 o-text-sm">
                {envoye ? (
                  <span
                    className="o-inline-flex o-items-center o-gap-2 o-font-medium"
                    style={{ color: encre() }}
                  >
                    <Icon icon={Check} size={15} aria-hidden="true" />
                    {modele}, {jour} septembre a 9 h. On vous rappelle pour la taille.
                  </span>
                ) : (
                  <span className="o-text-zinc-600 dark:o-text-zinc-400">
                    Choisissez un jour pour confirmer.
                  </span>
                )}
              </p>
            </form>
          </div>
        </section>

        {/* ================= Le pied : ou nous trouver =================== */}
        <footer className="o-px-6 o-py-16 md:o-px-10">
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-7">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                14 rue des Aciers, Saint-Etienne — quartier du Soleil
              </p>
              {/* Un plan dessine, pas une carte chargee : trois rues suffisent. */}
              <svg
                viewBox="0 0 620 260"
                className="o-mt-5 o-w-full"
                aria-label="Plan d acces a l atelier, rue des Aciers a Saint-Etienne"
              >
                <rect
                  x="0"
                  y="0"
                  width="620"
                  height="260"
                  fill={accentDoux(500, 7)}
                  rx="16"
                />
                <path
                  d="M0 176h620M214 0v260M420 0v260"
                  stroke="currentColor"
                  strokeWidth="10"
                  opacity="0.12"
                />
                <path
                  d="M0 96h620"
                  stroke="currentColor"
                  strokeWidth="5"
                  opacity="0.12"
                />
                <circle cx={306} cy={176} r={11} fill={accent(600)} />
                <text
                  x={322}
                  y={168}
                  fontSize="15"
                  fill="currentColor"
                  fontFamily="var(--o-font-mono)"
                >
                  Atelier
                </text>
                <text
                  x={16}
                  y={112}
                  fontSize="13"
                  fill="currentColor"
                  opacity="0.6"
                  fontFamily="var(--o-font-mono)"
                >
                  Rue Bergson
                </text>
                <text
                  x={230}
                  y={30}
                  fontSize="13"
                  fill="currentColor"
                  opacity="0.6"
                  fontFamily="var(--o-font-mono)"
                >
                  Bd Thiers
                </text>
                <text
                  x={16}
                  y={204}
                  fontSize="13"
                  fill="currentColor"
                  opacity="0.6"
                  fontFamily="var(--o-font-mono)"
                >
                  Rue des Aciers
                </text>
                <text
                  x={436}
                  y={30}
                  fontSize="13"
                  fill="currentColor"
                  opacity="0.6"
                  fontFamily="var(--o-font-mono)"
                >
                  Tram T1 — Bellevue
                </text>
              </svg>
            </div>

            <div className="o-grid o-gap-8 sm:o-grid-cols-2 md:o-col-span-5">
              {[
                {
                  titre: 'Les velos',
                  liens: [
                    'Meridien 01 — route',
                    'Meridien 03 — gravel',
                    'Meridien 05 — randonneuse',
                    'Cadres nus',
                  ],
                },
                {
                  titre: 'La maison',
                  liens: ['L atelier', 'La garantie a vie', 'Reparations', 'Nous ecrire'],
                },
              ].map((colonne) => (
                <nav key={colonne.titre} aria-label={colonne.titre}>
                  <h2 className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {colonne.titre}
                  </h2>
                  <ul className="o-m-0 o-mt-4 o-list-none o-space-y-2 o-p-0">
                    {colonne.liens.map((lien) => (
                      <li key={lien}>
                        <a
                          href="#sortie"
                          className="o-text-sm o-text-zinc-700 dark:o-text-zinc-300 o-no-underline o-transition-colors hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
                        >
                          {lien}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
              <p className="o-m-0 sm:o-col-span-2">
                <a
                  href="#essai"
                  className="o-inline-flex o-items-center o-gap-2 o-text-sm o-font-medium o-no-underline focus:o-ring"
                  style={{ color: encre() }}
                >
                  atelier@meridien-cycles.fr
                  <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </a>
              </p>
            </div>
          </div>
          <p className="o-mx-auto o-mt-12 o-max-w-6xl o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Meridien Cycles SARL — RCS Saint-Etienne 402 118 663 — garantie a vie sur le
            cadre, premier proprietaire — © 2026
          </p>
        </footer>
      </div>
    </Porte>
  )
}
