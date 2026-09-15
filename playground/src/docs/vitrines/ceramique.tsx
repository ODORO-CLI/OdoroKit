/**
 * Tour — atelier de ceramique.
 *
 * ## Ce que la page fait, et qu aucune autre ne fait
 *
 * Le **mecanisme est la cuisson**. Quatre programmes de four — biscuit,
 * email, gres, raku — sont ecrits en segments : une vitesse de montee en
 * degres par heure, un palier, une descente. La page en deduit tout le reste,
 * et rien n y est decoratif :
 *
 * - la **courbe** heure par heure, tracee a partir des segments ;
 * - la **duree totale**, obtenue en additionnant les segments ;
 * - l **energie** : chaque segment porte une puissance — une montee rapide
 *   tire plus qu une montee lente, un palier tire le tiers, une descente ne
 *   tire rien — et le compte se fait en kilowattheures, puis en euros ;
 * - ce qui **se passe a chaque palier** : l eau libre a cent degres,
 *   l inversion du quartz a cinq cent soixante-treize, le frittage, la fonte
 *   de l email. On promene la molette sur les heures et la page dit ou l on
 *   en est, en montee ou en descente.
 *
 * La descente compte autant que la montee : c est le reproche qu on fait aux
 * tables de cuisson imprimees, qui s arretent au sommet.
 *
 * ## Le reste de la page
 *
 * Une **coupe du four** dessinee, dans une bande sombre au milieu d une page
 * claire — les trois etages, la sonde, l event, les resistances. Quatre
 * **terres**, avec leur retrait mesure sur une reglette. Un **diagramme en
 * aires** (C21) qui dit ce qui est sorti du four sur douze mois, et ce qui
 * s est casse. Une **carte postale** (A18) dont le verso se retourne au
 * survol. Une **signature** (P29) et deux lignes.
 *
 * ## Le fond, et le poids
 *
 * F-css : une nappe de degrade qui derive, aucune surface graphique. Tout est
 * dessine en SVG — le tour, le four, la courbe, le diagramme, le timbre. Une
 * page d atelier n a pas besoin d un moteur de rendu pour etre chaude.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowRight, ArrowUpRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { RippleClick } from '@/odoro/effect/RippleClick.jsx'
import { ScrollReveal } from '@/odoro/text/ScrollReveal.jsx'
import { UnderlineDraw } from '@/odoro/text/UnderlineDraw.jsx'
import { OptionWheel } from '@/odoro/ui/OptionWheel.jsx'

import { BandeauMentions, nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  affiche,
  Autocollant,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Nappe } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/* ============================ La feuille =============================== */

const STYLE_TOUR = 'o-vitrine-ceramique'

/**
 * Ce que les utilitaires n ont pas : le tour qui tourne, la courbe qui se
 * trace, le timbre qui bat. Coupes sous mouvement reduit.
 */
const CSS_TOUR = [
  '@keyframes o-cm-tour{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
  '@keyframes o-cm-trace{0%{stroke-dashoffset:var(--o-cm-l,1200)}100%{stroke-dashoffset:0}}',
  '@keyframes o-cm-monte{0%{opacity:0;transform:translate3d(0,10px,0)}100%{opacity:1;transform:none}}',
  '[data-o-cm-tour]{animation:o-cm-tour var(--o-cm-duree,9s) linear infinite;transform-origin:center}',
  '[data-o-cm-trace]{animation:o-cm-trace 1400ms cubic-bezier(0.22,1,0.36,1) both}',
  '[data-o-cm-monte]{animation:o-cm-monte 600ms cubic-bezier(0.22,1,0.36,1) var(--o-cm-delai,0s) both}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-cm-tour]{animation:none}',
  '[data-o-cm-trace]{animation:none;stroke-dashoffset:0}',
  '[data-o-cm-monte]{animation:none;opacity:1;transform:none}}',
].join('')

function useFeuilleTour(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_TOUR) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_TOUR
    feuille.textContent = CSS_TOUR
    document.head.append(feuille)
  }, [])
}

/* ============================ Les programmes =========================== */

/**
 * Un segment de cuisson.
 *
 * Une montee porte une vitesse en degres par heure ; un palier porte une
 * duree en heures. C est la maniere dont un programmateur de four s ecrit
 * vraiment, et c est ce qui permet a la page de tout deduire.
 */
interface Segment {
  readonly vers: number
  readonly vitesse?: number
  readonly palier?: number
}

/** Un programme de four, tel qu il est affiche au mur de l atelier. */
interface Programme {
  readonly cle: string
  readonly nom: string
  readonly terre: string
  readonly propos: string
  readonly segments: readonly Segment[]
}

/** Le depart : la temperature de l atelier, un matin de mars. */
const DEPART = 18

const PROGRAMMES: readonly Programme[] = [
  {
    cle: 'biscuit',
    nom: 'Biscuit 980',
    terre: 'Gres chamotte, faience rouge',
    propos:
      'La premiere cuisson. Il reste de l eau dans la terre, et c est elle qui decide : plus vite que cinquante degres a l heure sous cent vingt, la vapeur fait eclater la piece de l interieur.',
    segments: [
      { vers: 120, vitesse: 50 },
      { vers: 120, palier: 1 },
      { vers: 600, vitesse: 100 },
      { vers: 980, vitesse: 150 },
      { vers: 980, palier: 0.5 },
      { vers: DEPART, vitesse: 110 },
    ],
  },
  {
    cle: 'email',
    nom: 'Email 1060',
    terre: 'Faience emaillee',
    propos:
      'La terre est deja cuite, il n y a plus d eau : on peut monter franchement. Le palier de trente minutes n est pas une precaution, c est lui qui laisse l email se poser a plat.',
    segments: [
      { vers: 600, vitesse: 150 },
      { vers: 1060, vitesse: 110 },
      { vers: 1060, palier: 0.5 },
      { vers: DEPART, vitesse: 120 },
    ],
  },
  {
    cle: 'gres',
    nom: 'Gres 1280',
    terre: 'Gres chamotte, porcelaine',
    propos:
      'La longue. Vingt-cinq heures portes fermees, dont douze de descente que l on ne peut pas accelerer : a cinq cent soixante-treize degres, le quartz revient et fend tout ce qui a refroidi trop vite.',
    segments: [
      { vers: 200, vitesse: 80 },
      { vers: 600, vitesse: 140 },
      { vers: 1000, vitesse: 120 },
      { vers: 1280, vitesse: 80 },
      { vers: 1280, palier: 0.75 },
      { vers: DEPART, vitesse: 100 },
    ],
  },
  {
    cle: 'raku',
    nom: 'Raku 980',
    terre: 'Terre noire chamottee',
    propos:
      'Quatre heures, et la piece sort rouge a la pince. Le choc thermique est le sujet : c est lui qui craquelle l email, et c est pour cela qu on ne cuit au raku qu une terre qui l accepte.',
    segments: [
      { vers: 980, vitesse: 320 },
      { vers: 980, palier: 0.25 },
      { vers: DEPART, vitesse: 900 },
    ],
  },
]

/** Ce qui arrive a la terre, et a quelle temperature. */
interface Palier {
  readonly degres: number
  readonly sens: 'montee' | 'descente'
  readonly titre: string
  readonly texte: string
}

const PALIERS: readonly Palier[] = [
  {
    degres: 100,
    sens: 'montee',
    titre: 'L eau libre part',
    texte:
      'Ce qui restait entre les grains devient vapeur. Elle doit sortir plus vite qu elle ne se forme, sinon la piece eclate.',
  },
  {
    degres: 200,
    sens: 'montee',
    titre: 'L eau des pores s en va',
    texte:
      'La terre devient poreuse et cassante. C est le moment ou une piece mal seche se perd sans bruit, dans un coin du four.',
  },
  {
    degres: 400,
    sens: 'montee',
    titre: 'Les matieres organiques brulent',
    texte:
      'Racines, fibres, colle de barbotine. Le four fume, l event reste ouvert : ce qui ne brule pas maintenant noircira sous l email.',
  },
  {
    degres: 573,
    sens: 'montee',
    titre: 'Le quartz change de forme',
    texte:
      'Il gagne pres de deux pour cent de volume, d un coup. Ni montee ni descente brutale de part et d autre de ce chiffre : c est la regle qui tient tout le metier.',
  },
  {
    degres: 700,
    sens: 'montee',
    titre: 'Les carbonates se decomposent',
    texte:
      'Le gaz doit etre sorti avant que l email ne ferme la surface. Un email qui bulle a mille degres a ete pris de vitesse ici.',
  },
  {
    degres: 900,
    sens: 'montee',
    titre: 'Le frittage commence',
    texte:
      'Les grains se soudent les uns aux autres. A partir d ici la piece ne se delite plus dans l eau : elle est devenue ceramique.',
  },
  {
    degres: 1060,
    sens: 'montee',
    titre: 'L email fond et mouille',
    texte:
      'Le verre se forme et s etale. Trente minutes de palier lui laissent le temps de refermer les piqures laissees par les gaz.',
  },
  {
    degres: 1240,
    sens: 'montee',
    titre: 'Le gres se grese',
    texte:
      'La masse se vitrifie de part en part. La piece devient etanche sans email — c est la definition du gres, et le seul motif d aller si haut.',
  },
  {
    degres: 573,
    sens: 'descente',
    titre: 'Le quartz revient',
    texte:
      'Meme saut, en sens inverse, sur une piece devenue rigide. C est ici que se fendent les pieces d un four ouvert trop tot, et nulle part ailleurs.',
  },
  {
    degres: 200,
    sens: 'descente',
    titre: 'On peut entrouvrir',
    texte:
      'Deux centimetres de porte, pas davantage. Le four est encore a deux cents degres et l air de l atelier est a dix-huit.',
  },
]

/** Un point de la courbe : une heure depuis l enfournement, une temperature. */
interface Point {
  readonly h: number
  readonly t: number
}

/** Ce qu un programme rend une fois deroule. */
interface Cuisson {
  readonly points: readonly Point[]
  readonly duree: number
  readonly sommet: number
  readonly energie: number
  readonly cout: number
  readonly montee: number
}

/**
 * La puissance appelee par un segment, en kilowatts.
 *
 * Un four de cent vingt litres porte neuf virgule six kilowatts de
 * resistances. En montee, la regulation les tient d autant plus longtemps que
 * la consigne est raide ; en palier elle ne compense que les pertes ; en
 * descente, elle ne fait rien du tout.
 */
function puissance(segment: Segment, monte: boolean): number {
  if (segment.palier !== undefined) return 3.1
  if (!monte) return 0
  return Math.min(9.5, 2.2 + (segment.vitesse ?? 100) / 40)
}

/** Deroule un programme : les points, la duree, l energie, le prix. */
function derouler(programme: Programme): Cuisson {
  const points: Point[] = [{ h: 0, t: DEPART }]
  let heure = 0
  let temperature = DEPART
  let energie = 0
  let montee = 0
  let sommet = DEPART

  for (const segment of programme.segments) {
    const monte = segment.vers > temperature
    const duree =
      segment.palier ??
      Math.abs(segment.vers - temperature) / Math.max(1, segment.vitesse ?? 100)
    energie += puissance(segment, monte) * duree
    heure += duree
    temperature = segment.vers
    sommet = Math.max(sommet, temperature)
    if (monte) montee = heure
    points.push({ h: heure, t: temperature })
  }

  return {
    points,
    duree: heure,
    sommet,
    energie: Math.round(energie * 10) / 10,
    cout: Math.round(energie * 0.216 * 100) / 100,
    montee,
  }
}

/** La temperature a une heure donnee, par interpolation entre deux points. */
function temperatureA(cuisson: Cuisson, heure: number): number {
  const { points } = cuisson
  for (let rang = 1; rang < points.length; rang += 1) {
    const avant = points[rang - 1]
    const apres = points[rang]
    if (avant === undefined || apres === undefined) continue
    if (heure <= apres.h) {
      const large = apres.h - avant.h
      if (large <= 0) return apres.t
      return avant.t + ((apres.t - avant.t) * (heure - avant.h)) / large
    }
  }
  return points[points.length - 1]?.t ?? DEPART
}

/** Le dernier palier franchi a cette heure-la, dans le bon sens. */
function palierA(cuisson: Cuisson, heure: number): Palier | undefined {
  const enMontee = heure <= cuisson.montee
  const t = temperatureA(cuisson, heure)
  const candidats = PALIERS.filter(
    (palier) =>
      palier.sens === (enMontee ? 'montee' : 'descente') &&
      (enMontee ? t >= palier.degres : t <= palier.degres),
  )
  if (enMontee) {
    return candidats.reduce<Palier | undefined>(
      (haut, palier) =>
        haut === undefined || palier.degres > haut.degres ? palier : haut,
      undefined,
    )
  }
  return candidats.reduce<Palier | undefined>(
    (bas, palier) => (bas === undefined || palier.degres < bas.degres ? palier : bas),
    undefined,
  )
}

/** L energie consommee depuis l enfournement jusqu a cette heure. */
function energieA(programme: Programme, heure: number): number {
  let curseur = 0
  let temperature = DEPART
  let energie = 0
  for (const segment of programme.segments) {
    const monte = segment.vers > temperature
    const duree =
      segment.palier ??
      Math.abs(segment.vers - temperature) / Math.max(1, segment.vitesse ?? 100)
    const part = Math.max(0, Math.min(duree, heure - curseur))
    energie += puissance(segment, monte) * part
    curseur += duree
    temperature = segment.vers
    if (curseur >= heure) break
  }
  return Math.round(energie * 10) / 10
}

/** Une duree en heures, dite comme a l atelier : « 19 h 30 ». */
function heures(valeur: number): string {
  const h = Math.floor(valeur)
  const m = Math.round((valeur - h) * 60)
  if (m === 60) return `${String(h + 1)} h 00`
  return `${String(h)} h ${String(m).padStart(2, '0')}`
}

/* ============================ La courbe ================================ */

/** La boite du dessin : large, basse, sans cadre. */
const LARGE = 920
const HAUT = 300

/** Le trace de la courbe et de son aire, en coordonnees du dessin. */
function tracerCourbe(cuisson: Cuisson): { ligne: string; aire: string } {
  const enX = (h: number): number => 8 + (h / cuisson.duree) * (LARGE - 16)
  const enY = (t: number): number =>
    HAUT - 22 - ((t - DEPART) / (cuisson.sommet - DEPART)) * (HAUT - 52)
  const sommets = cuisson.points.map(
    (point) => `${enX(point.h).toFixed(1)} ${enY(point.t).toFixed(1)}`,
  )
  const ligne = `M${sommets.join('L')}`
  const aire = `${ligne}L${enX(cuisson.duree).toFixed(1)} ${String(HAUT - 22)}L8 ${String(HAUT - 22)}Z`
  return { ligne, aire }
}

/**
 * Le mecanisme : la courbe de cuisson, heure par heure.
 *
 * La roue choisit le programme ; la molette promene un curseur sur les heures
 * et la page dit la temperature, la phase, le palier franchi et les
 * kilowattheures deja brules. Le bouton deroule la cuisson entiere en douze
 * secondes — sous mouvement reduit, il va droit a la fin.
 */
function Four(): ReactElement {
  const { reduced } = useMotionState()
  const [cle, setCle] = useState<string>('gres')
  const [heure, setHeure] = useState(0)
  const [enCours, setEnCours] = useState(false)

  const programme = useMemo(
    () => PROGRAMMES.find((p) => p.cle === cle) ?? PROGRAMMES[0],
    [cle],
  ) as Programme
  const cuisson = useMemo(() => derouler(programme), [programme])
  const { ligne, aire } = useMemo(() => tracerCourbe(cuisson), [cuisson])

  // Changer de programme remet la cuisson au premier matin.
  useEffect(() => {
    setHeure(0)
    setEnCours(false)
  }, [programme])

  // La cuisson qui se deroule seule : douze secondes pour toute la courbe.
  const image = useRef(0)
  useEffect(() => {
    if (!enCours) return undefined
    if (reduced) {
      setHeure(cuisson.duree)
      setEnCours(false)
      return undefined
    }
    let precedent = performance.now()
    const pas = (maintenant: number): void => {
      const delta = (maintenant - precedent) / 1000
      precedent = maintenant
      setHeure((valeur) => {
        const suivant = valeur + delta * (cuisson.duree / 12)
        if (suivant >= cuisson.duree) {
          setEnCours(false)
          return cuisson.duree
        }
        return suivant
      })
      image.current = window.requestAnimationFrame(pas)
    }
    image.current = window.requestAnimationFrame(pas)
    return () => {
      window.cancelAnimationFrame(image.current)
    }
  }, [enCours, cuisson.duree, reduced])

  const temperature = temperatureA(cuisson, heure)
  const palier = palierA(cuisson, heure)
  const phase =
    heure <= 0.01 ? 'Enfournement' : heure <= cuisson.montee ? 'Montee' : 'Descente'
  const enX = 8 + (heure / cuisson.duree) * (LARGE - 16)
  const enY =
    HAUT - 22 - ((temperature - DEPART) / (cuisson.sommet - DEPART)) * (HAUT - 52)

  const graduations = useMemo(() => {
    const marches: number[] = []
    const pas = cuisson.sommet > 1100 ? 400 : cuisson.sommet > 900 ? 300 : 200
    for (let t = pas; t <= cuisson.sommet; t += pas) marches.push(t)
    return marches
  }, [cuisson.sommet])

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
      {/* ----- La roue des programmes ----------------------------------- */}
      <div className="o-min-w-0 lg:o-col-span-4">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
          Le programme
        </p>
        <div
          className="o-mt-4 o-border-w-1 o-border-stone-200 dark:o-border-stone-800 o-px-2 o-py-3"
          style={{ borderRadius: 18, backgroundColor: accentDoux(200, 12) }}
        >
          <OptionWheel
            label="Le programme de cuisson"
            options={PROGRAMMES.map((p) => ({ value: p.cle, label: p.nom }))}
            value={cle}
            onChange={setCle}
            visible={3}
            curve={20}
            style={{ '--o-wheel-accent': encre() } as CSSProperties}
          />
        </div>

        <p className="o-m-0 o-mt-6 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
          {programme.propos}
        </p>

        <dl className="o-m-0 o-mt-8">
          {(
            [
              ['Terre', programme.terre],
              ['Duree portes fermees', heures(cuisson.duree)],
              ['Sommet', `${String(cuisson.sommet)} °C`],
              ['Energie', `${cuisson.energie.toLocaleString('fr-FR')} kWh`],
              [
                'Cout du four',
                `${cuisson.cout.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR`,
              ],
            ] as const
          ).map(([quoi, valeur]) => (
            <div
              key={quoi}
              className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3 o-border-t o-border-stone-200 dark:o-border-stone-800 o-py-3"
            >
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                {quoi}
              </dt>
              <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-stone-900 dark:o-text-stone-50">
                {valeur}
              </dd>
            </div>
          ))}
        </dl>
        <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
          Four de 120 litres, 9,6 kW de resistances, electricite a 0,216 EUR le
          kilowattheure. La descente ne consomme rien : le four est eteint et se refroidit
          seul.
        </p>
      </div>

      {/* ----- La courbe ------------------------------------------------- */}
      <div className="o-min-w-0 lg:o-col-span-8">
        <RippleClick color={accentDoux(500, 60)} duration={700}>
          <div
            className="o-relative o-overflow-hidden o-border-w-1 o-border-stone-200 dark:o-border-stone-800 o-p-4 md:o-p-6"
            style={{ borderRadius: 22, backgroundColor: accentDoux(100, 10) }}
          >
            <svg
              viewBox={`0 0 ${String(LARGE)} ${String(HAUT)}`}
              className="o-h-auto o-w-full"
              role="img"
              aria-label={`Courbe de ${programme.nom} : ${heures(cuisson.duree)} portes fermees, sommet a ${String(cuisson.sommet)} degres`}
            >
              {/* Les graduations, sans cadre : trois filets et leurs chiffres. */}
              {graduations.map((t) => {
                const y =
                  HAUT - 22 - ((t - DEPART) / (cuisson.sommet - DEPART)) * (HAUT - 52)
                return (
                  <g key={t}>
                    <path
                      d={`M8 ${y.toFixed(1)}H${String(LARGE - 8)}`}
                      stroke={accentDoux(700, 14)}
                      strokeWidth="1"
                      strokeDasharray="3 7"
                    />
                    <text
                      x={LARGE - 12}
                      y={y - 6}
                      fontSize="12"
                      textAnchor="end"
                      fill="currentColor"
                      opacity="0.5"
                      style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
                    >
                      {t} °C
                    </text>
                  </g>
                )
              })}

              {/* Le sol du dessin. */}
              <path
                d={`M8 ${String(HAUT - 22)}H${String(LARGE - 8)}`}
                stroke={accentDoux(700, 34)}
                strokeWidth="1"
              />

              {/* L aire sous la courbe, puis la courbe qui se trace. */}
              <path
                key={`${programme.cle}-aire`}
                d={aire}
                fill={accentDoux(400, 26)}
                opacity="0.9"
              />
              <path
                key={`${programme.cle}-ligne`}
                data-o-cm-trace=""
                d={ligne}
                fill="none"
                stroke={encre()}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={1200}
                style={{ strokeDasharray: 1200, '--o-cm-l': 1200 } as CSSProperties}
              />

              {/* Les paliers marquants, poses sur la montee. */}
              {PALIERS.filter(
                (p) => p.sens === 'montee' && p.degres <= cuisson.sommet,
              ).map((p) => {
                const y =
                  HAUT -
                  22 -
                  ((p.degres - DEPART) / (cuisson.sommet - DEPART)) * (HAUT - 52)
                let x = 8
                for (let rang = 1; rang < cuisson.points.length; rang += 1) {
                  const a = cuisson.points[rang - 1]
                  const b = cuisson.points[rang]
                  if (a === undefined || b === undefined) continue
                  if (b.t >= p.degres && a.t <= p.degres && b.t !== a.t) {
                    const part = (p.degres - a.t) / (b.t - a.t)
                    x = 8 + ((a.h + (b.h - a.h) * part) / cuisson.duree) * (LARGE - 16)
                    break
                  }
                }
                return (
                  <circle
                    key={`${String(p.degres)}-${p.titre}`}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill={accent(600)}
                  />
                )
              })}

              {/* Les heures, en abscisse. */}
              {Array.from(
                { length: Math.floor(cuisson.duree / 5) + 1 },
                (_, rang) => rang * 5,
              ).map((h) => (
                <text
                  key={`h-${String(h)}`}
                  x={8 + (h / cuisson.duree) * (LARGE - 16)}
                  y={HAUT - 8}
                  fontSize="11"
                  textAnchor="middle"
                  fill="currentColor"
                  opacity="0.45"
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}
                >
                  {h} h
                </text>
              ))}

              {/* La tete de lecture : le trait, la bille, l heure. */}
              <path
                d={`M${enX.toFixed(1)} 14V${String(HAUT - 22)}`}
                stroke={encre()}
                strokeWidth="1"
                strokeDasharray="4 5"
                opacity="0.7"
              />
              <circle cx={enX} cy={enY} r="7" fill={encre()} />
              <circle
                cx={enX}
                cy={enY}
                r="12"
                fill="none"
                stroke={encre()}
                strokeWidth="1"
                opacity="0.35"
              />
              <text
                x={enX > LARGE - 120 ? enX - 10 : enX + 12}
                y="22"
                fontSize="13"
                textAnchor={enX > LARGE - 120 ? 'end' : 'start'}
                fill={encre()}
                style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}
              >
                {heures(heure)}
              </text>
            </svg>

            {/* La molette du four. */}
            <div className="o-mt-5 o-flex o-flex-wrap o-items-center o-gap-4">
              <label className="o-min-w-0 o-grow">
                <span className="o-sr-only">Heure de la cuisson</span>
                <input
                  type="range"
                  min={0}
                  max={Math.round(cuisson.duree * 4) / 4}
                  step={0.25}
                  value={Math.min(heure, cuisson.duree)}
                  onChange={(evenement) => {
                    setEnCours(false)
                    setHeure(Number(evenement.target.value))
                  }}
                  className="o-w-full o-accent-brand-500 focus:o-ring"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  if (heure >= cuisson.duree - 0.01) setHeure(0)
                  setEnCours((valeur) => !valeur)
                }}
                className="o-inline-flex o-shrink-0 o-items-center o-gap-2 o-rounded-full o-px-5 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-opacity hover:o-opacity-85 focus:o-ring"
                style={aplat()}
              >
                {enCours ? 'Arreter le four' : 'Derouler la cuisson'}
              </button>
            </div>
          </div>
        </RippleClick>

        {/* Ce qui se passe a cette heure-la. */}
        <div aria-live="polite" className="o-mt-8 o-grid o-gap-8 md:o-grid-cols-12">
          <div className="md:o-col-span-4">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              {phase} — {heures(heure)}
            </p>
            <p
              className="o-m-0 o-mt-2 o-tabular-nums o-text-stone-900 dark:o-text-stone-50"
              style={{
                ...affiche('m', 300),
                fontSize: 'clamp(2.75rem, 7vw, 5rem)',
                lineHeight: 0.88,
              }}
            >
              {Math.round(temperature)} °C
            </p>
            <p
              className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
              style={{ color: encre() }}
            >
              {energieA(programme, heure).toLocaleString('fr-FR')} kWh brules
            </p>
          </div>
          <div className="o-min-w-0 md:o-col-span-8">
            {palier === undefined ? (
              <p className="o-m-0 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                Rien encore. Les pieces sont froides, le four monte, et le seul bruit est
                celui du ventilateur de l event.
              </p>
            ) : (
              <div key={`${palier.titre}-${palier.sens}`} data-o-cm-monte="">
                <h3
                  className="o-m-0 o-text-stone-900 dark:o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.4rem, 2.6vw, 2.25rem)',
                    lineHeight: 1,
                  }}
                >
                  {palier.degres} °C — {palier.titre}
                </h3>
                <p className="o-m-0 o-mt-4 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  {palier.texte}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ Le tour, dessine ========================= */

/** Le tour de potier, vu de trois quarts : le plateau tourne pour de vrai. */
function TourDessine(): ReactElement {
  return (
    <svg viewBox="0 0 320 300" className="o-h-auto o-w-full" aria-hidden="true">
      {/* Le bati. */}
      <path
        d="M96 208h128l-14 84H110Z"
        fill={accentDoux(700, 12)}
        stroke={accentDoux(700, 40)}
        strokeWidth="1.5"
      />
      <path d="M118 232h84M114 258h92" stroke={accentDoux(700, 26)} strokeWidth="1" />

      {/* Le plateau, en perspective : une ellipse, et des rayons qui tournent. */}
      <ellipse
        cx="160"
        cy="204"
        rx="98"
        ry="30"
        fill={accentDoux(500, 34)}
        stroke={accentDoux(700, 50)}
        strokeWidth="1.5"
      />
      <g transform="translate(160 204) scale(1 0.306)">
        <g data-o-cm-tour="" style={{ '--o-cm-duree': '7s' } as CSSProperties}>
          {Array.from({ length: 24 }, (_, rang) => {
            const angle = (rang * Math.PI) / 12
            return (
              <path
                key={rang}
                d={`M${String((Math.cos(angle) * 44).toFixed(1))} ${String((Math.sin(angle) * 44).toFixed(1))}L${String(
                  (Math.cos(angle) * 96).toFixed(1),
                )} ${String((Math.sin(angle) * 96).toFixed(1))}`}
                stroke={accentDoux(800, rang % 4 === 0 ? 64 : 34)}
                strokeWidth={rang % 4 === 0 ? 2 : 1}
              />
            )
          })}
          <circle
            cx="0"
            cy="0"
            r="66"
            fill="none"
            stroke={accentDoux(800, 44)}
            strokeWidth="1"
          />
        </g>
      </g>

      {/* La piece montee : un profil de vase, avec ses traces de doigt. */}
      <path
        d="M124 196c-6-26 4-44 8-66 4-22-14-34-2-52 10-15 50-16 62-2 13 15-2 30 0 50 3 24 14 42 8 70Z"
        fill={accentDoux(300, 60)}
        stroke={encre()}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M126 174h68M128 152h64M133 126h56M137 100h48"
        stroke={accentDoux(700, 34)}
        strokeWidth="1"
      />
      <ellipse
        cx="160"
        cy="76"
        rx="31"
        ry="9"
        fill="none"
        stroke={encre()}
        strokeWidth="2"
      />
    </svg>
  )
}

/* ============================ La coupe du four ========================= */

/** Ce que porte chaque etage de la derniere fournee. */
const ETAGES = [
  {
    rang: '03',
    quoi: 'Bols a the, 18 pieces',
    note: 'Le haut monte le plus vite : on y met ce qui supporte deux degres d ecart.',
  },
  {
    rang: '02',
    quoi: 'Assiettes plates, 24 pieces',
    note: 'Sur la plaque la plus epaisse. Une assiette gauchit si sa plaque plie.',
  },
  {
    rang: '01',
    quoi: 'Pichets et vases, 9 pieces',
    note: 'Le bas est le plus froid de deux a trois degres : on y pose les pieces hautes.',
  },
] as const

/** La coupe du four, dans la bande sombre : trois etages et leurs organes. */
function CoupeDuFour(): ReactElement {
  return (
    <svg
      viewBox="0 0 520 420"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Coupe du four : trois etages de plaques, la sonde, l event et les resistances"
    >
      {/* La caisse. */}
      <rect
        x="40"
        y="24"
        width="400"
        height="372"
        fill="none"
        stroke={accentDoux(300, 42)}
        strokeWidth="2"
      />
      <rect
        x="62"
        y="46"
        width="356"
        height="328"
        fill={accentDoux(500, 8)}
        stroke={accentDoux(300, 22)}
        strokeWidth="1"
      />

      {/* Les resistances, en spires, sur les deux parois. */}
      {Array.from({ length: 14 }, (_, rang) => (
        <g key={rang}>
          <path
            d={`M62 ${String(62 + rang * 22)}q10 -8 20 0t20 0`}
            fill="none"
            stroke={accent(400)}
            strokeWidth="2"
            opacity="0.75"
          />
          <path
            d={`M378 ${String(62 + rang * 22)}q10 -8 20 0t20 0`}
            fill="none"
            stroke={accent(400)}
            strokeWidth="2"
            opacity="0.75"
          />
        </g>
      ))}

      {/* Les trois plaques et leurs pieces. */}
      {[318, 216, 114].map((y, rang) => (
        <g key={y}>
          <rect x="108" y={y} width="264" height="9" fill={accentDoux(200, 60)} />
          {/* Les bequilles. */}
          <path
            d={`M124 ${String(y + 9)}v${String(rang === 0 ? 48 : 46)}M356 ${String(y + 9)}v${String(rang === 0 ? 48 : 46)}`}
            stroke={accentDoux(200, 40)}
            strokeWidth="5"
          />
          {Array.from({ length: rang === 2 ? 6 : rang === 1 ? 5 : 3 }, (_, piece) => {
            const x = 130 + piece * (rang === 2 ? 38 : rang === 1 ? 46 : 76)
            const hauteur = rang === 0 ? 56 : rang === 1 ? 12 : 30
            const large = rang === 0 ? 44 : rang === 1 ? 38 : 30
            return (
              <rect
                key={piece}
                x={x}
                y={y - hauteur}
                width={large}
                height={hauteur}
                rx={rang === 1 ? 2 : 5}
                fill={accentDoux(400, 46)}
                stroke={accentDoux(200, 44)}
                strokeWidth="1"
              />
            )
          })}
        </g>
      ))}

      {/* La sonde, plantee au tiers de la hauteur. */}
      <path d="M440 210h-52" stroke={accent(300)} strokeWidth="3" />
      <circle cx="388" cy="210" r="5" fill={accent(300)} />
      <text
        x="446"
        y="206"
        fontSize="13"
        fill="currentColor"
        opacity="0.75"
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
      >
        SONDE
      </text>

      {/* L event, en haut a gauche. */}
      <path d="M40 60h-24" stroke={accent(300)} strokeWidth="3" />
      <path
        d="M24 56l-8 -8M24 60h-10M24 64l-8 8"
        stroke={accent(300)}
        strokeWidth="1.5"
      />
      <text
        x="4"
        y="40"
        fontSize="13"
        fill="currentColor"
        opacity="0.75"
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
      >
        EVENT
      </text>

      {/* Les reperes d etage, dans la marge droite. */}
      {['01', '02', '03'].map((mot, rang) => (
        <text
          key={mot}
          x="452"
          y={[336, 234, 132][rang]}
          fontSize="15"
          fill={accent(300)}
          style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.12em' }}
        >
          {mot}
        </text>
      ))}
    </svg>
  )
}

/* ============================ Les terres =============================== */

/** Une terre du stock, avec ce qu elle fait au feu. */
const TERRES = [
  {
    nom: 'Gres chamotte 40',
    cuisson: '1280 °C',
    retrait: 11,
    absorption: '1,2 %',
    texte:
      'Quarante pour cent de chamotte : elle ne s affaisse pas et pardonne les seches rapides. C est la terre des pieces hautes et des plaques.',
  },
  {
    nom: 'Faience rouge de Provence',
    cuisson: '1020 °C',
    retrait: 7,
    absorption: '12 %',
    texte:
      'Tendre, grasse, elle monte vite au tour. Elle reste poreuse apres cuisson : sans email, une faience ne tient pas l eau.',
  },
  {
    nom: 'Porcelaine',
    cuisson: '1280 °C',
    retrait: 14,
    absorption: '0,1 %',
    texte:
      'Quatorze pour cent de retrait, et rien ne pardonne. En echange, la piece devient translucide sur trois millimetres.',
  },
  {
    nom: 'Terre noire a raku',
    cuisson: '980 °C',
    retrait: 6,
    absorption: '15 %',
    texte:
      'Grossiere expres : c est ce qui lui permet de sortir du four a huit cents degres et d entrer dans la sciure sans se fendre.',
  },
] as const

/** La reglette de retrait : le tour, puis le four. */
function Reglette({ part }: { readonly part: number }): ReactElement {
  const apres = 100 - part
  return (
    <svg
      viewBox="0 0 240 64"
      className="o-h-auto o-w-full"
      role="img"
      aria-label={`Retrait de ${String(part)} pour cent entre le tour et la sortie du four`}
    >
      <path d="M8 20h224" stroke={accentDoux(700, 30)} strokeWidth="1" />
      <rect
        x="8"
        y="12"
        width="224"
        height="16"
        fill="none"
        stroke={accentDoux(700, 40)}
        strokeWidth="1"
      />
      <rect
        x="8"
        y="38"
        width={(224 * apres) / 100}
        height="16"
        fill={accentDoux(500, 40)}
        stroke={encre()}
        strokeWidth="1.5"
      />
      <path
        d={`M${String(8 + (224 * apres) / 100)} 34v24`}
        stroke={encre()}
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <text
        x="8"
        y="8"
        fontSize="10"
        fill="currentColor"
        opacity="0.6"
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
      >
        AU TOUR
      </text>
      <text
        x={12 + (224 * apres) / 100}
        y="52"
        fontSize="11"
        fill={encre()}
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
      >
        -{part} %
      </text>
    </svg>
  )
}

/* ============================ Le diagramme en aires ==================== */

/** Douze mois de four : ce qui est entre, ce qui n est pas ressorti. */
const ANNEE = [
  { mois: 'J', enfournees: 210, casse: 14 },
  { mois: 'F', enfournees: 246, casse: 11 },
  { mois: 'M', enfournees: 268, casse: 19 },
  { mois: 'A', enfournees: 232, casse: 9 },
  { mois: 'M', enfournees: 301, casse: 22 },
  { mois: 'J', enfournees: 355, casse: 17 },
  { mois: 'J', enfournees: 189, casse: 8 },
  { mois: 'A', enfournees: 96, casse: 3 },
  { mois: 'S', enfournees: 274, casse: 15 },
  { mois: 'O', enfournees: 318, casse: 26 },
  { mois: 'N', enfournees: 392, casse: 21 },
  { mois: 'D', enfournees: 441, casse: 30 },
] as const

/**
 * Le diagramme en aires, dessine au trait (C21).
 *
 * Deux aires superposees : ce qui est sorti entier, et ce qui s est casse.
 * Aucun cadre, aucune legende dans une boite — les chiffres sont dans la
 * marge, comme sur un releve d atelier.
 */
function Aires(): ReactElement {
  const large = 880
  const haut = 260
  const plafond = 460

  const enX = (rang: number): number => 10 + (rang / (ANNEE.length - 1)) * (large - 20)
  const enY = (valeur: number): number => haut - 26 - (valeur / plafond) * (haut - 52)

  const chemin = (
    lire: (mois: (typeof ANNEE)[number]) => number,
  ): { ligne: string; aire: string } => {
    const sommets = ANNEE.map(
      (mois, rang) => `${enX(rang).toFixed(1)} ${enY(lire(mois)).toFixed(1)}`,
    )
    const ligne = `M${sommets.join('L')}`
    return {
      ligne,
      aire: `${ligne}L${enX(ANNEE.length - 1).toFixed(1)} ${String(haut - 26)}L10 ${String(haut - 26)}Z`,
    }
  }

  const sorties = chemin((m) => m.enfournees - m.casse)
  const perdues = chemin((m) => m.casse)

  const totalEnfournees = ANNEE.reduce((somme, m) => somme + m.enfournees, 0)
  const totalCasse = ANNEE.reduce((somme, m) => somme + m.casse, 0)

  return (
    <div className="o-min-w-0">
      <svg
        viewBox={`0 0 ${String(large)} ${String(haut)}`}
        className="o-h-auto o-w-full"
        role="img"
        aria-label={`Douze mois de four : ${String(totalEnfournees)} pieces enfournees, ${String(totalCasse)} perdues`}
      >
        {[100, 200, 300, 400].map((valeur) => (
          <g key={valeur}>
            <path
              d={`M10 ${enY(valeur).toFixed(1)}H${String(large - 10)}`}
              stroke={accentDoux(700, 12)}
              strokeWidth="1"
              strokeDasharray="2 8"
            />
            <text
              x="10"
              y={enY(valeur) - 6}
              fontSize="11"
              fill="currentColor"
              opacity="0.45"
              style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
            >
              {valeur}
            </text>
          </g>
        ))}

        <path d={sorties.aire} fill={accentDoux(400, 22)} />
        <path
          data-o-cm-trace=""
          d={sorties.ligne}
          fill="none"
          stroke={encre()}
          strokeWidth="2.5"
          strokeLinejoin="round"
          pathLength={1200}
          style={{ strokeDasharray: 1200, '--o-cm-l': 1200 } as CSSProperties}
        />

        <path d={perdues.aire} fill={accentDoux(800, 26)} />
        <path
          data-o-cm-trace=""
          d={perdues.ligne}
          fill="none"
          stroke={accent(700)}
          strokeWidth="1.5"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />

        <path
          d={`M10 ${String(haut - 26)}H${String(large - 10)}`}
          stroke={accentDoux(700, 40)}
          strokeWidth="1"
        />
        {ANNEE.map((mois, rang) => (
          <text
            key={rang}
            x={enX(rang)}
            y={haut - 8}
            fontSize="12"
            textAnchor="middle"
            fill="currentColor"
            opacity="0.55"
            style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.06em' }}
          >
            {mois.mois}
          </text>
        ))}
      </svg>
    </div>
  )
}

/* ============================ La carte postale ========================= */

/**
 * La carte postale (A18) : le recto au-dessus, le verso au survol.
 *
 * Le retournement se declenche au survol, mais aussi des qu un element du
 * verso prend le foyer — sans quoi un visiteur au clavier remplirait un
 * formulaire cache. Un bouton la retourne aussi, pour les pointeurs grossiers.
 */
function CartePostale(): ReactElement {
  const { reduced } = useMotionState()
  const [verso, setVerso] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  return (
    <div className="o-relative" style={{ perspective: 1400 }}>
      <div
        onMouseEnter={() => {
          setVerso(true)
        }}
        onMouseLeave={() => {
          setVerso(false)
        }}
        onFocus={() => {
          setVerso(true)
        }}
        onBlur={(evenement) => {
          if (!evenement.currentTarget.contains(evenement.relatedTarget)) setVerso(false)
        }}
        className="o-relative"
        style={{
          transformStyle: reduced ? undefined : 'preserve-3d',
          transform: reduced || !verso ? undefined : 'rotateY(180deg)',
          transition: reduced ? 'none' : 'transform 700ms cubic-bezier(0.4,0.2,0.2,1)',
        }}
      >
        {/* ----- Le recto ------------------------------------------------- */}
        <div
          className="o-relative o-overflow-hidden o-border-w-1 o-border-stone-300 dark:o-border-stone-700"
          style={{
            borderRadius: 8,
            backfaceVisibility: reduced ? undefined : 'hidden',
            opacity: reduced && verso ? 0 : 1,
            transition: reduced ? 'opacity 240ms linear' : undefined,
            backgroundColor: accentDoux(100, 22),
            aspectRatio: '16 / 10',
          }}
        >
          <div className="o-absolute o-inset-0 o-flex o-flex-col o-justify-between o-p-6 md:o-p-8">
            <div className="o-flex o-items-start o-justify-between o-gap-6">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                Tour — atelier de ceramique
                <br />
                Malakoff
              </p>
              {/* Le timbre, dentele. */}
              <span
                aria-hidden="true"
                className="o-block o-shrink-0"
                style={{
                  width: 74,
                  height: 90,
                  backgroundColor: accentDoux(300, 70),
                  border: `2px dashed ${accentDoux(700, 50)}`,
                }}
              >
                <svg viewBox="0 0 74 90" className="o-h-full o-w-full">
                  <path
                    d="M22 66c-4-16 2-24 4-36 2-12-8-18-2-28 6-9 26-9 32 0 6 10-2 16 0 28 2 12 8 20 4 36Z"
                    fill="none"
                    stroke={accentDoux(900, 60)}
                    strokeWidth="2"
                  />
                  <text
                    x="37"
                    y="82"
                    fontSize="9"
                    textAnchor="middle"
                    fill={accentDoux(900, 60)}
                    style={{ fontFamily: 'var(--o-font-mono)' }}
                  >
                    1280 °C
                  </text>
                </svg>
              </span>
            </div>

            <div>
              <p
                className="o-m-0"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                  lineHeight: 0.94,
                }}
              >
                La carte des cuissons
              </p>
              <p className="o-m-0 o-mt-3 o-max-w-sm o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                Quatre pages, les dates des fournees du trimestre, et ce qu on peut y
                glisser. Passez dessus — le verso est deja timbre.
              </p>
            </div>
          </div>
        </div>

        {/* ----- Le verso ------------------------------------------------- */}
        <div
          className="o-absolute o-inset-0 o-overflow-hidden o-border-w-1 o-border-stone-300 dark:o-border-stone-700"
          style={{
            borderRadius: 8,
            backfaceVisibility: reduced ? undefined : 'hidden',
            transform: reduced ? undefined : 'rotateY(180deg)',
            opacity: reduced && !verso ? 0 : 1,
            transition: reduced ? 'opacity 240ms linear' : undefined,
            backgroundColor: accentDoux(50, 14),
          }}
        >
          <div className="o-grid o-h-full o-grid-cols-2">
            <div className="o-flex o-min-w-0 o-flex-col o-justify-between o-border-r o-border-stone-300 dark:o-border-stone-700 o-p-5 md:o-p-6">
              <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                Le four tourne le jeudi. Laissez une adresse : la carte part avec la
                fournee suivante, et rien d autre ne vous sera envoye.
              </p>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                Cachet de la fournee — 14 mars
              </p>
            </div>

            <form
              className="o-flex o-min-w-0 o-flex-col o-justify-center o-gap-3 o-p-5 md:o-p-6"
              onSubmit={(evenement) => {
                evenement.preventDefault()
                setEnvoye(true)
              }}
            >
              <label className="o-block">
                <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Nom
                </span>
                <input
                  type="text"
                  name="nom"
                  autoComplete="name"
                  className="o-mt-1 o-w-full o-border-b o-border-stone-400 dark:o-border-stone-600 o-bg-transparent o-py-1 o-text-sm focus:o-ring"
                />
              </label>
              <label className="o-block">
                <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Adresse
                </span>
                <input
                  type="email"
                  name="adresse"
                  autoComplete="email"
                  className="o-mt-1 o-w-full o-border-b o-border-stone-400 dark:o-border-stone-600 o-bg-transparent o-py-1 o-text-sm focus:o-ring"
                />
              </label>
              <button
                type="submit"
                className="o-mt-2 o-inline-flex o-items-center o-justify-center o-gap-2 o-rounded-full o-px-4 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-opacity hover:o-opacity-85 focus:o-ring"
                style={aplat()}
              >
                {envoye ? 'Notee' : 'Poster la carte'}
                <Icon icon={ArrowRight} size={13} aria-hidden="true" />
              </button>
              <p
                aria-live="polite"
                className="o-m-0 o-font-mono o-text-xs o-text-stone-500 dark:o-text-stone-400"
              >
                {envoye ? 'Elle partira jeudi, avec la fournee.' : ''}
              </p>
            </form>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setVerso((valeur) => !valeur)
        }}
        aria-pressed={verso}
        className="o-mt-4 o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-opacity hover:o-opacity-75 focus:o-ring"
        style={{ color: encre() }}
      >
        {verso ? 'Revenir au recto' : 'Retourner la carte'}
        <Icon icon={ArrowUpRight} size={13} aria-hidden="true" />
      </button>
    </div>
  )
}

/* ============================ La signature ============================= */

/**
 * La signature (P29) : une encre scannee, et deux lignes.
 *
 * Le trace est une seule courbe ; il se dessine a l entree dans le champ,
 * comme une plume qui passe. Sous mouvement reduit, il est deja ecrit.
 */
function Signature(): ReactElement {
  return (
    <svg
      viewBox="0 0 420 120"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Signature manuscrite : Perrine Aubel"
    >
      <path
        data-o-cm-trace=""
        d="M18 88c14-46 26-64 34-62 8 2 4 30-2 48-6 18-10 26-4 26 8 0 22-34 30-52 8-18 14-24 18-22 4 2-2 22-8 40-6 18-6 28 2 28 10 0 18-20 26-38 8-18 16-26 20-24 4 2 0 18-6 34-6 16-4 24 4 24 10 0 20-16 28-32M232 44c22-6 42-4 44 6 2 10-20 18-38 16 14 8 34 12 46 6M300 92c30-52 50-72 62-70 10 2 4 24-12 40-16 16-32 24-44 26 16 8 40 8 58-6"
        fill="none"
        stroke={encre()}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1200}
        style={{ strokeDasharray: 1200, '--o-cm-l': 1200 } as CSSProperties}
      />
    </svg>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#four', 'Le four'],
  ['#terres', 'Les terres'],
  ['#annee', 'L annee'],
] as const

/** Un intitule de section, avec son indice. */
function Titre({
  rang,
  sur,
  children,
}: {
  readonly rang: string
  readonly sur: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <>
      <Reveal>
        <Indice rang={rang} sombre={false}>
          {sur}
        </Indice>
      </Reveal>
      <Reveal delay={80}>
        <h2
          className="o-m-0 o-mt-5 o-max-w-3xl o-text-balance"
          style={{
            ...affiche('m', 300),
            fontSize: 'clamp(1.9rem, 4.4vw, 4rem)',
            lineHeight: 0.95,
          }}
        >
          {children}
        </h2>
      </Reveal>
    </>
  )
}

export default function Page(): ReactElement {
  const polices = usePolices('unbounded')
  useFeuilleTour()

  return (
    <Porte forme="zoom" marque="Tour" sombre={false}>
      <div
        className="o-relative o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-900 dark:o-text-stone-50"
        style={polices}
      >
        <BarreGelule
          marque="Tour"
          liens={NAVIGATION}
          action={['#carte', 'Ecrire']}
          sombre={false}
        />

        {/* ================= L ouverture : le tour tourne ================= */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-justify-center o-overflow-hidden o-px-6 o-pb-16 o-pt-32 md:o-px-10"
          style={{ minHeight: ECRAN }}
        >
          <Nappe
            couleurs={[accentDoux(300, 46), accentDoux(500, 30), accentDoux(200, 38)]}
            opacite={0.55}
          />

          <div className="o-relative o-mx-auto o-grid o-w-full o-max-w-7xl o-items-center o-gap-10 md:o-grid-cols-12">
            <div className="o-min-w-0 md:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>Malakoff — le four tourne le jeudi</Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-6 o-max-w-3xl"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(2.75rem, 8.5vw, 8rem)',
                  lineHeight: 0.86,
                }}
              >
                Tout se joue dans la derniere heure.
              </TitreVague>
              <Surgit
                delai={540}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-md o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400"
              >
                Atelier de tournage et quatre programmes de cuisson, publies avec leur
                courbe, leur duree et ce qu ils coutent en electricite. Rien de ce qui
                entre dans ce four n est un secret.
              </Surgit>
              <Surgit
                delai={660}
                className="o-mt-9 o-flex o-flex-wrap o-items-center o-gap-4"
              >
                <a
                  href="#four"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Ouvrir le four <Icon icon={ArrowDown} size={15} aria-hidden="true" />
                </a>
                <a
                  href="#terres"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-stone-300 dark:o-border-stone-700 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-colors hover:o-bg-stone-100 dark:hover:o-bg-stone-900 focus:o-ring"
                >
                  Les quatre terres
                </a>
              </Surgit>
            </div>

            <div className="o-relative o-min-w-0 md:o-col-span-5">
              <Surgit delai={340}>
                <TourDessine />
              </Surgit>
              <div className="o-pointer-events-none o-absolute o-left-0 o-top-4 o-hidden lg:o-block">
                <Autocollant angle={-8}>Fournee 214 — jeudi</Autocollant>
              </div>
              <div className="o-pointer-events-none o-absolute o-bottom-8 o-right-0 o-hidden lg:o-block">
                <Autocollant angle={7}>Gres 1280, 25 h</Autocollant>
              </div>
            </div>
          </div>

          <Coin position="bd" sombre={false}>
            24 tours de potier
            <br />9 places au cours du mardi
          </Coin>
        </header>

        <BandeauMentions
          mentions={[
            'Terre achetee en France',
            'Emails sans plomb ni baryum',
            'Four de 120 litres',
            'Chaque fournee est publiee',
            'Cours le mardi et le samedi',
            'Pieces reparees a la laque d or',
          ]}
          separateur="●"
          mono
        />

        {/* ================= Le manifeste qui s allume ==================== */}
        <section
          className="o-flex o-items-center o-px-6 o-py-28 md:o-px-10 md:o-py-40"
          style={{ minHeight: '70vh' }}
        >
          <div className="o-mx-auto o-max-w-5xl">
            <ScrollReveal
              as="p"
              dim={0.28}
              blur={5}
              className="o-m-0 o-text-balance"
              style={{
                ...affiche('m', 300),
                fontSize: 'clamp(1.6rem, 4.2vw, 3.5rem)',
                lineHeight: 1.14,
              }}
            >
              Une piece n est pas ratee au tour. Elle est ratee a cent degres, quand la
              vapeur n a pas trouve la sortie ; ou a cinq cent soixante-treize, quand le
              quartz se retourne et qu on a ouvert trop tot. Le four ne se trompe jamais :
              il obeit, et c est bien le probleme.
            </ScrollReveal>
          </div>
        </section>

        {/* ================= Le mecanisme : la cuisson ==================== */}
        <section
          id="four"
          className="o-scroll-mt-24 o-border-t o-border-stone-200 dark:o-border-stone-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="o-min-w-0 md:o-col-span-8">
                <Titre rang="01" sur="La cuisson">
                  Quatre programmes, et la descente qu on ne peut pas presser.
                </Titre>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400 md:o-col-span-4 md:o-text-right">
                Tournez la roue, puis promenez
                <br />
                la molette sur les heures
              </p>
            </div>
            <div className="o-mt-16">
              <Four />
            </div>
          </div>
        </section>

        {/* ================= La coupe du four, en bande sombre ============ */}
        <section className="o-px-6 o-py-24 md:o-px-10 md:o-py-32" style={nuit('stone')}>
          <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12 lg:o-gap-16">
            <div className="o-min-w-0 lg:o-col-span-5">
              <Reveal>
                <Indice rang="02">Dedans</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-xl o-text-balance o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                    lineHeight: 0.96,
                  }}
                >
                  Trois etages, et trois degres d ecart entre le haut et le bas.
                </h2>
              </Reveal>
              <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-stone-300">
                Un four n est pas une boite egale. L air chaud monte, la sonde est plantee
                au tiers, et ce qu on met ou n est pas une question de place mais de
                risque.
              </p>
              <ol className="o-m-0 o-mt-10 o-list-none o-p-0">
                {ETAGES.map((etage) => (
                  <li
                    key={etage.rang}
                    className="o-grid o-gap-4 o-border-t o-border-white-10 o-py-5 sm:o-grid-cols-12"
                  >
                    <p
                      className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest sm:o-col-span-2"
                      style={{ color: encreSurSombre() }}
                    >
                      {etage.rang}
                    </p>
                    <div className="o-min-w-0 sm:o-col-span-10">
                      <p className="o-m-0 o-text-base o-text-stone-100">{etage.quoi}</p>
                      <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-stone-400">
                        {etage.note}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="o-min-w-0 lg:o-col-span-7">
              <CoupeDuFour />
            </div>
          </div>
        </section>

        {/* ================= Les terres =================================== */}
        <section
          id="terres"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Titre rang="03" sur="Les terres">
              Quatre terres au stock, et leur retrait mesure.
            </Titre>
            <ol className="o-m-0 o-mt-16 o-list-none o-border-t o-border-stone-200 dark:o-border-stone-800 o-p-0">
              {TERRES.map((terre, rang) => (
                <li
                  key={terre.nom}
                  className="o-grid o-items-center o-gap-6 o-border-b o-border-stone-200 dark:o-border-stone-800 o-py-10 md:o-grid-cols-12 md:o-gap-10"
                >
                  <span
                    aria-hidden="true"
                    className="o-tabular-nums md:o-col-span-2"
                    style={{
                      ...affiche('l', 300),
                      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                      lineHeight: 0.9,
                      color: encre(),
                    }}
                  >
                    {String(rang + 1).padStart(2, '0')}
                  </span>
                  <div className="o-min-w-0 md:o-col-span-5">
                    <h3 className="o-m-0 o-text-2xl o-font-medium o-tracking-tight">
                      <span className="o-sr-only">
                        {String(rang + 1).padStart(2, '0')} —{' '}
                      </span>
                      {terre.nom}
                    </h3>
                    <p className="o-m-0 o-mt-3 o-max-w-md o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                      {terre.texte}
                    </p>
                  </div>
                  <dl className="o-m-0 o-min-w-0 md:o-col-span-2">
                    {(
                      [
                        ['Cuisson', terre.cuisson],
                        ['Absorption', terre.absorption],
                      ] as const
                    ).map(([quoi, valeur]) => (
                      <div key={quoi} className="o-py-1">
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                          {quoi}
                        </dt>
                        <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums">
                          {valeur}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="o-min-w-0 md:o-col-span-3">
                    <Reglette part={terre.retrait} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= L annee, en aires ============================ */}
        <section
          id="annee"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={{ backgroundColor: accentDoux(500, 6) }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-14">
              <div className="o-min-w-0 lg:o-col-span-4">
                <Reveal>
                  <Indice rang="04" sombre={false}>
                    L annee
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-5 o-max-w-sm o-text-balance"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.6rem, 2.6vw, 2.5rem)',
                      lineHeight: 1.02,
                    }}
                  >
                    Trois mille trois cent vingt-deux pieces, cent quatre-vingt-quinze
                    perdues.
                  </h2>
                </Reveal>
                <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  Cinq virgule neuf pour cent de casse sur l annee, dont la moitie en
                  octobre et decembre — les mois ou l on cuit vite parce que les commandes
                  attendent. C est le seul chiffre que cet atelier surveille.
                </p>
                <dl className="o-m-0 o-mt-10">
                  {(
                    [
                      ['Aire pleine', 'Pieces sorties entieres'],
                      ['Trait pointille', 'Pieces perdues au four'],
                      ['Creux d aout', 'Trois semaines de fermeture'],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div
                      key={quoi}
                      className="o-grid o-gap-1 o-border-t o-border-stone-200 dark:o-border-stone-800 o-py-3 sm:o-grid-cols-12"
                    >
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400 sm:o-col-span-5">
                        {quoi}
                      </dt>
                      <dd className="o-m-0 o-text-sm o-text-stone-700 dark:o-text-stone-300 sm:o-col-span-7">
                        {valeur}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="o-min-w-0 lg:o-col-span-8">
                <Aires />
              </div>
            </div>
          </div>
        </section>

        {/* ================= La carte postale ============================= */}
        <section
          id="carte"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 lg:o-grid-cols-12 lg:o-gap-16 lg:o-items-center">
            <div className="o-min-w-0 lg:o-col-span-5">
              <Titre rang="05" sur="Ecrire">
                Une carte, et rien d autre.
              </Titre>
              <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                Pas de lettre mensuelle, pas de code de reduction. Une carte imprimee au
                trimestre, avec les dates des fournees et deux lignes ecrites a la main.
              </p>
              <p className="o-m-0 o-mt-6 o-text-sm">
                <a
                  href="#four"
                  className="o-no-underline focus:o-ring"
                  style={{ color: 'inherit' }}
                >
                  <UnderlineDraw thickness={2} duration={900} color={encre()}>
                    Voir d abord ce que fait le four
                  </UnderlineDraw>
                </a>
              </p>
            </div>
            <div className="o-min-w-0 lg:o-col-span-7">
              <CartePostale />
            </div>
          </div>
        </section>

        {/* ================= Le pied : une signature et deux lignes ======= */}
        <footer className="o-border-t o-border-stone-200 dark:o-border-stone-800 o-px-6 o-py-16 md:o-px-10">
          <div className="o-mx-auto o-max-w-2xl o-text-center">
            <div className="o-mx-auto" style={{ maxWidth: 320 }}>
              <Signature />
            </div>
            <p className="o-m-0 o-mt-6 o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
              Perrine Aubel — 11 rue Guy-Moquet, Malakoff. Atelier ouvert le jeudi de 14 h
              a 19 h, et le samedi matin sur rendez-vous.
            </p>
            <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              © 2026 Tour —{' '}
              <a
                href="#four"
                className="o-no-underline focus:o-ring"
                style={{ color: encre() }}
              >
                bonjour@tour-ceramique.fr
              </a>
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
