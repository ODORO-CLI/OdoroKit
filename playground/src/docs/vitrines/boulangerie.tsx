/**
 * Levain — boulangerie de quartier, Paris 17.
 *
 * ## Le mecanisme : la fournee
 *
 * Une boulangerie ne vend pas un catalogue, elle vend **une heure**. La page
 * lit donc l horloge du visiteur et la compare au plan de cuisson du fournil —
 * sept fournees ecrites a la main, chacune avec son heure de sortie, sa duree
 * de cuisson et son debit de vente. De cette comparaison sortent quatre etats
 * qui changent tout seuls au fil de la journee :
 *
 * - **au four** : la fournee est enfournee, elle sort dans n minutes ;
 * - **sur la planche** : elle est sortie, et il en reste une quantite estimee
 *   au debit reel du comptoir ;
 * - **deja parti** : le debit a consomme la fournee ;
 * - **a venir** : le petrin n a pas encore tourne.
 *
 * Le ruban du four montre les sept fournees sur la journee de 4 h a 20 h, avec
 * un trait qui se pose a l heure courante. On clique une fournee : la page dit
 * sa farine, son hydratation, sa pousse et son prix.
 *
 * ## Le creneau (A23)
 *
 * L appel reprend le meme calcul par l autre bout : une frise de la journee en
 * pas d une demi-heure, et pour le creneau choisi la liste de **ce qui sera
 * reellement sur la planche a cette heure-la**. Reserver un creneau ou rien ne
 * sort n a pas de sens, et la page le dit.
 *
 * ## Ce qui est dessine
 *
 * Tout. Le papier kraft est un aplat teinte, la trame de farine une figure
 * SVG, les trois pains des chemins, le compteur a rouleaux (C17) sept tambours
 * de chiffres, et l horloge du pied (P19) un cadran a aiguilles vivantes.
 * Aucune photographie : nous n en avons aucune de pain, et une photographie au
 * mauvais sujet vaut moins que zero.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight, Wheat } from '@odoro-cli/icons/filaire'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { GlareHover } from '@/odoro/effect/GlareHover.jsx'
import { HalftoneReveal } from '@/odoro/effect/HalftoneReveal.jsx'
import { Timeline } from '@/odoro/section/Timeline.jsx'
import { MorphText } from '@/odoro/text/MorphText.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  Autocollant,
  BarreFilet,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Bandeau, Flotte } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#fournee', 'La fournee'],
  ['#levain', 'Le levain'],
  ['#fournil', 'Le fournil'],
  ['#creneau', 'Retirer'],
]

/* ============================ Le plan de cuisson ======================= */

/**
 * Une fournee du jour.
 *
 * `debit` est le nombre de pains vendus par minute au comptoir une fois la
 * fournee sortie. C est un chiffre du carnet de caisse, pas une moyenne
 * inventee : une tradition de six heures part trois fois plus vite qu un
 * epeautre de seize heures, et c est ce qui decide de l heure ou il n y en a
 * plus.
 */
interface Fournee {
  readonly cle: string
  /** Heure de sortie du four, en minutes depuis minuit. */
  readonly sortie: number
  readonly nom: string
  readonly farine: string
  /** Duree de cuisson, en minutes. */
  readonly cuisson: number
  /** Duree de pousse, telle qu elle est dite au fournil. */
  readonly pousse: string
  readonly hydratation: string
  readonly quantite: number
  readonly debit: number
  readonly prix: string
}

/** Une heure « 06:15 » en minutes depuis minuit. */
function enMinutes(texte: string): number {
  const [h, m] = texte.split(':')
  return Number(h) * 60 + Number(m)
}

/** Des minutes depuis minuit en « 6 h 15 ». */
function enHeure(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${String(h)} h` : `${String(h)} h ${String(m).padStart(2, '0')}`
}

/** Le plan de cuisson du mardi au samedi. */
const FOURNEES = [
  {
    cle: 'tradition-matin',
    sortie: enMinutes('06:15'),
    nom: 'Tradition',
    farine: 'T65 du moulin de Brasseuil, ecrasee sur meule',
    cuisson: 22,
    pousse: 'Pointage de 3 h, appret de 1 h 30',
    hydratation: '72 pour cent',
    quantite: 120,
    debit: 2.4,
    prix: '1,40 EUR',
  },
  {
    cle: 'mie',
    sortie: enMinutes('07:30'),
    nom: 'Pain de mie au lait',
    farine: 'T55, lait entier de Seine-et-Marne',
    cuisson: 35,
    pousse: 'Pointage de 1 h, appret de 2 h en moule',
    hydratation: '64 pour cent',
    quantite: 40,
    debit: 0.9,
    prix: '4,80 EUR',
  },
  {
    cle: 'campagne',
    sortie: enMinutes('09:00'),
    nom: 'Campagne au levain',
    farine: 'T80 et 15 pour cent de seigle T130',
    cuisson: 45,
    pousse: 'Pointage de 18 h a 14 degres',
    hydratation: '78 pour cent',
    quantite: 60,
    debit: 0.7,
    prix: '5,60 EUR le kilo',
  },
  {
    cle: 'seigle',
    sortie: enMinutes('11:00'),
    nom: 'Seigle et noix',
    farine: 'Seigle T170, noix du Perigord concassees',
    cuisson: 50,
    pousse: 'Pointage de 20 h, sans petrissage',
    hydratation: '85 pour cent',
    quantite: 34,
    debit: 0.5,
    prix: '7,20 EUR',
  },
  {
    cle: 'tradition-midi',
    sortie: enMinutes('12:30'),
    nom: 'Tradition',
    farine: 'T65 du moulin de Brasseuil, ecrasee sur meule',
    cuisson: 22,
    pousse: 'Pointage de 3 h, appret de 1 h 30',
    hydratation: '72 pour cent',
    quantite: 90,
    debit: 2,
    prix: '1,40 EUR',
  },
  {
    cle: 'epeautre',
    sortie: enMinutes('16:00'),
    nom: 'Petit epeautre',
    farine: 'Petit epeautre de Haute-Provence, non hybride',
    cuisson: 40,
    pousse: 'Pointage de 12 h, faconnage a la main',
    hydratation: '70 pour cent',
    quantite: 28,
    debit: 0.45,
    prix: '6,40 EUR',
  },
  {
    cle: 'tradition-soir',
    sortie: enMinutes('17:30'),
    nom: 'Tradition',
    farine: 'T65 du moulin de Brasseuil, ecrasee sur meule',
    cuisson: 22,
    pousse: 'Pointage de 3 h, appret de 1 h 30',
    hydratation: '72 pour cent',
    quantite: 70,
    debit: 1.6,
    prix: '1,40 EUR',
  },
] as const satisfies readonly [Fournee, ...Fournee[]]

/** Le nombre total de pains prevus dans la journee. */
const PREVUS = FOURNEES.reduce((somme, f) => somme + f.quantite, 0)

/** La journee couverte par le ruban du four, en minutes depuis minuit. */
const RUBAN_DEBUT = enMinutes('04:00')
const RUBAN_FIN = enMinutes('20:00')

/** Duree d ecoulement d une fournee, en minutes, au debit du comptoir. */
function ecoulement(f: Fournee): number {
  return Math.ceil(f.quantite / f.debit)
}

/** L etat d une fournee a une minute donnee. */
type Etat = 'a venir' | 'au four' | 'sur la planche' | 'parti'

function etatDe(f: Fournee, minute: number): Etat {
  if (minute < f.sortie - f.cuisson) return 'a venir'
  if (minute < f.sortie) return 'au four'
  return minute < f.sortie + ecoulement(f) ? 'sur la planche' : 'parti'
}

/** Ce qu il reste d une fournee, estime au debit du comptoir. */
function reste(f: Fournee, minute: number): number {
  const vendus = Math.round((minute - f.sortie) * f.debit)
  return Math.max(0, Math.min(f.quantite, f.quantite - vendus))
}

/** Le nombre de pains deja sortis du four a une minute donnee. */
function sortisDepuis(minute: number): number {
  return FOURNEES.reduce((somme, f) => (minute >= f.sortie ? somme + f.quantite : somme), 0)
}

/* ============================ L horloge ================================ */

/**
 * La minute courante, relue toutes les vingt secondes.
 *
 * Vingt secondes et non une : rien sur cette page ne se compte en secondes, et
 * un reveil par seconde ferait travailler React quatre-vingts fois pour rien
 * entre deux changements d affichage.
 */
function useMinute(): number {
  const [minute, setMinute] = useState(() => {
    const maintenant = new Date()
    return maintenant.getHours() * 60 + maintenant.getMinutes()
  })
  useEffect(() => {
    const tic = (): void => {
      const maintenant = new Date()
      setMinute(maintenant.getHours() * 60 + maintenant.getMinutes())
    }
    const id = window.setInterval(tic, 20000)
    return () => {
      window.clearInterval(id)
    }
  }, [])
  return minute
}

/* ============================ Le papier et la farine =================== */

/** Le kraft : un aplat chaud qui suit le theme, jamais un beige en dur. */
function kraft(part = 9): CSSProperties {
  return { backgroundColor: accentDoux(500, part) }
}

/**
 * La trame de farine.
 *
 * Deux cent quarante points semes par une suite deterministe — pas un tirage
 * au sort, sans quoi la page changerait de grain a chaque rendu. Les tailles
 * sont irregulieres : de la farine tombee n a pas de calibre.
 */
function TrameFarine({ opacite = 0.5 }: { readonly opacite?: number }): ReactElement {
  const points = useMemo(() => {
    const semis: { x: number; y: number; r: number }[] = []
    let graine = 1337
    for (let i = 0; i < 240; i += 1) {
      graine = (graine * 1103515245 + 12345) % 2147483648
      const a = graine / 2147483648
      graine = (graine * 1103515245 + 12345) % 2147483648
      const b = graine / 2147483648
      graine = (graine * 1103515245 + 12345) % 2147483648
      const c = graine / 2147483648
      semis.push({ x: a * 600, y: b * 600, r: 0.5 + c * c * 2.4 })
    }
    return semis
  }, [])
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 600"
      preserveAspectRatio="xMidYMid slice"
      className="o-pointer-events-none o-absolute o-inset-0 o-h-full o-w-full"
      style={{ opacity: opacite }}
    >
      {points.map((p, rang) => (
        <circle key={rang} cx={p.x} cy={p.y} r={p.r} fill="currentColor" opacity={0.16 + (rang % 5) * 0.06} />
      ))}
    </svg>
  )
}

/* ============================ Les pains dessines ======================= */

/** Une boule scarifiee en croix, vue de dessus. */
function Boule(): ReactElement {
  return (
    <svg viewBox="0 0 200 200" className="o-h-full o-w-full" aria-hidden="true" fill="none">
      <circle cx="100" cy="100" r="86" fill={accent(200)} stroke={accent(700)} strokeWidth="2" />
      <circle cx="100" cy="100" r="86" fill="none" stroke={accent(800)} strokeWidth="1" opacity="0.4" />
      <path d="M44 66c22 12 90 12 112 0M44 134c22-12 90-12 112 0" stroke={accent(700)} strokeWidth="3" strokeLinecap="round" />
      <path d="M66 44c12 22 12 90 0 112M134 44c-12 22-12 90 0 112" stroke={accent(700)} strokeWidth="3" strokeLinecap="round" />
      <path d="M100 26c-14 22-14 126 0 148" stroke={accent(600)} strokeWidth="1.4" opacity="0.7" />
    </svg>
  )
}

/** Une baguette de tradition, cinq coups de lame. */
function Baguette(): ReactElement {
  return (
    <svg viewBox="0 0 260 90" className="o-h-full o-w-full" aria-hidden="true" fill="none">
      <path
        d="M18 45c0-16 16-24 36-25 36-2 116-2 152 0 20 1 36 9 36 25s-16 24-36 25c-36 2-116 2-152 0-20-1-36-9-36-25Z"
        fill={accent(200)}
        stroke={accent(700)}
        strokeWidth="2"
      />
      {[62, 100, 138, 176, 212].map((x) => (
        <path key={x} d={`M${String(x)} 30 ${String(x - 20)} 60`} stroke={accent(700)} strokeWidth="3" strokeLinecap="round" />
      ))}
    </svg>
  )
}

/** Un batard de seigle, une seule grigne, farine sur la croute. */
function Batard(): ReactElement {
  return (
    <svg viewBox="0 0 220 120" className="o-h-full o-w-full" aria-hidden="true" fill="none">
      <path
        d="M14 60c0-24 28-40 96-40s96 16 96 40-28 40-96 40S14 84 14 60Z"
        fill={accent(300)}
        stroke={accent(800)}
        strokeWidth="2"
      />
      <path d="M46 52c34-12 94-12 128 0" stroke={accent(800)} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M58 74c30 8 74 8 104 0" stroke={accent(700)} strokeWidth="1.4" opacity="0.6" />
      {[
        [64, 40],
        [96, 34],
        [132, 38],
        [166, 46],
        [86, 82],
        [140, 84],
      ].map(([x, y]) => (
        <circle key={`${String(x)}-${String(y)}`} cx={x} cy={y} r="2.2" fill={accent(100)} />
      ))}
    </svg>
  )
}

/* ============================ Le compteur a rouleaux =================== */

/** Hauteur d un tambour, en pixels. */
const TAMBOUR = 74

/**
 * Le compteur mecanique a rouleaux (C17).
 *
 * Chaque chiffre est un tambour : une colonne de dix glyphes dans une fenetre
 * de la hauteur d un seul. Le tambour part de zero et tourne jusqu a sa valeur
 * a l entree dans le champ, avec un retard croissant de droite a gauche — c est
 * l ordre dans lequel un compteur reel se met a jour, l unite entrainant la
 * dizaine. Sous mouvement reduit, les tambours sont deja cales.
 */
function Rouleaux({ valeur, chiffres = 4 }: { readonly valeur: number; readonly chiffres?: number }): ReactElement {
  const { reduced } = useMotionState()
  const [tourne, setTourne] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => {
      setTourne(true)
    }, 240)
    return () => {
      window.clearTimeout(id)
    }
  }, [])
  const texte = String(valeur).padStart(chiffres, '0')
  return (
    <span className="o-inline-flex o-items-stretch o-gap-1.5" role="img" aria-label={`${String(valeur)} pains sortis du four`}>
      {[...texte].map((glyphe, rang) => {
        const cible = reduced || tourne ? Number(glyphe) : 0
        const retard = (texte.length - 1 - rang) * 120
        return (
          <span
            key={rang}
            aria-hidden="true"
            className="o-relative o-block o-overflow-hidden o-rounded-sm"
            style={{
              height: TAMBOUR,
              width: TAMBOUR * 0.62,
              backgroundColor: 'var(--o-palette-zinc-900)',
              boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.9), inset 0 -8px 12px -8px rgba(0,0,0,0.9)',
            }}
          >
            <span
              className="o-block"
              style={{
                transform: `translate3d(0, ${String(-cible * TAMBOUR)}px, 0)`,
                transition: reduced ? undefined : `transform 1600ms cubic-bezier(0.16, 1, 0.3, 1) ${String(retard)}ms`,
              }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span
                  key={n}
                  className="o-flex o-items-center o-justify-center o-font-mono o-tabular-nums"
                  style={{ height: TAMBOUR, fontSize: TAMBOUR * 0.62, lineHeight: 1, color: 'var(--o-palette-zinc-50)' }}
                >
                  {n}
                </span>
              ))}
            </span>
            <span
              className="o-pointer-events-none o-absolute o-inset-x-0 o-h-px"
              style={{ top: '50%', backgroundColor: 'rgba(0,0,0,0.55)' }}
            />
          </span>
        )
      })}
    </span>
  )
}

/* ============================ Le ruban du four ========================= */

/**
 * Le fond et l encre d un etat, sur le ruban.
 *
 * Aucune nuance n est ecrite seule : la barre laisse choisir n importe quelle
 * couleur, et une 600 peut tomber claire. Les aplats passent donc par
 * `accentDoux`, qui melange au fond du theme et suit donc le clair comme le
 * sombre, et l etat en cours par `aplat`, qui porte son encre avec lui.
 */
function habitEtat(etat: Etat): CSSProperties {
  if (etat === 'au four') return aplat()
  if (etat === 'sur la planche') return { backgroundColor: accentDoux(400, 58), color: 'var(--o-theme-fg)' }
  if (etat === 'parti') return { backgroundColor: 'var(--o-theme-surface)', color: 'var(--o-theme-muted)' }
  return { backgroundColor: accentDoux(400, 22), color: 'var(--o-theme-fg)' }
}

/** Le mot d un etat, tel qu on le dit au comptoir. */
function motEtat(f: Fournee, minute: number): string {
  const etat = etatDe(f, minute)
  if (etat === 'a venir') return `enfournee a ${enHeure(f.sortie - f.cuisson)}`
  if (etat === 'au four') return `au four, sort dans ${String(f.sortie - minute)} min`
  if (etat === 'sur la planche') return `sur la planche, il en reste ${String(reste(f, minute))}`
  return `parti vers ${enHeure(f.sortie + ecoulement(f))}`
}

/**
 * Le ruban du four : la journee de 4 h a 20 h, et les sept fournees dessus.
 *
 * Chaque fournee occupe deux segments : la cuisson, en trait plein appuye, et
 * l ecoulement, en trait clair. Le trait vertical est l heure du visiteur.
 */
function Ruban({
  minute,
  choisie,
  onChoisir,
}: {
  readonly minute: number
  readonly choisie: string
  readonly onChoisir: (cle: string) => void
}): ReactElement {
  const course = RUBAN_FIN - RUBAN_DEBUT
  const part = (m: number): number => ((m - RUBAN_DEBUT) / course) * 100
  const heures = Array.from({ length: 9 }, (_, rang) => RUBAN_DEBUT + rang * 120)
  return (
    <div className="o-overflow-x-auto o-pb-2">
      <div className="o-relative" style={{ minWidth: 720 }}>
        {/* Les graduations de deux heures. */}
        <div className="o-relative o-h-6">
          {heures.map((h) => (
            <span
              key={h}
              className="o-absolute o-top-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
              style={{ left: `${String(part(h))}%`, transform: 'translateX(-50%)' }}
            >
              {enHeure(h)}
            </span>
          ))}
        </div>

        <ol className="o-m-0 o-list-none o-p-0">
          {FOURNEES.map((f) => {
            const etat = etatDe(f, minute)
            const actif = f.cle === choisie
            return (
              <li key={f.cle} className="o-relative o-h-11">
                <button
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    onChoisir(f.cle)
                  }}
                  className="o-absolute o-cursor-pointer o-rounded-full o-border-w-1 o-px-3 o-text-left o-text-xs o-font-semibold o-whitespace-nowrap o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={{
                    top: 4,
                    bottom: 4,
                    left: `${String(part(f.sortie - f.cuisson))}%`,
                    width: `${String(part(f.sortie + ecoulement(f)) - part(f.sortie - f.cuisson))}%`,
                    ...habitEtat(etat),
                    borderColor: actif ? encre() : 'transparent',
                  }}
                >
                  {f.nom}
                </button>
                {/* Le repere de sortie du four : l instant exact. */}
                <span
                  aria-hidden="true"
                  className="o-pointer-events-none o-absolute o-inset-y-0 o-w-px"
                  style={{ left: `${String(part(f.sortie))}%`, backgroundColor: accent(900), opacity: 0.55 }}
                />
              </li>
            )
          })}
        </ol>

        {/* L heure du visiteur, posee sur toute la hauteur du ruban. */}
        {minute >= RUBAN_DEBUT && minute <= RUBAN_FIN && (
          <span
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-bottom-0 o-w-0.5"
            style={{ left: `${String(part(minute))}%`, top: 22, backgroundColor: encre() }}
          >
            <span
              className="o-absolute o-whitespace-nowrap o-rounded-full o-px-2 o-py-0.5 o-font-mono o-text-xs"
              style={{ ...aplat(), top: -20, transform: 'translateX(-50%)' }}
            >
              {enHeure(minute)}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

/* ============================ La journee du fournil ==================== */

/** Ce que le fournil fait, heure par heure. */
const JOURNEE = [
  { date: '03 h 40', title: 'Le petrin tourne', body: 'Farine, eau de source a 13 degres, sel de Guerande, levain chef preleve la veille. Aucune levure.' },
  { date: '04 h 10', title: 'Pointage', body: 'La pate repose en bac, a 24 degres. Deux rabats a vingt minutes d intervalle, et plus rien.' },
  { date: '05 h 20', title: 'Faconnage', body: 'Division a la main a 350 grammes, mise en forme, mise en banneton. Le peseur n a jamais servi.' },
  { date: '06 h 15', title: 'Premiere fournee', body: 'Le four a sole est a 250 degres depuis 5 h. Cent vingt traditions, vingt-deux minutes, buee a l enfournement.' },
  { date: '11 h 00', title: 'Les pains longs', body: 'Seigle et noix, pousse de vingt heures, cuisson de cinquante minutes a four tombant.' },
  { date: '16 h 00', title: 'Le petit epeautre', body: 'Vingt-huit pieces, faconnees a 14 h pendant que la boutique respire.' },
  { date: '19 h 30', title: 'On eteint', body: 'Ce qui reste part chez Le Carillon. Le levain est rafraichi, et on recommence.' },
] as const

/* ============================ Les creneaux (A23) ======================= */

/** Les creneaux de retrait, de 7 h a 19 h, par demi-heure. */
const CRENEAUX = Array.from({ length: 25 }, (_, rang) => enMinutes('07:00') + rang * 30)

/** Les creneaux deja pris, releves sur le carnet. */
const COMPLETS: ReadonlySet<number> = new Set([
  enMinutes('08:00'),
  enMinutes('08:30'),
  enMinutes('12:00'),
  enMinutes('12:30'),
  enMinutes('13:00'),
  enMinutes('18:30'),
])

/* ============================ L horloge du pied ======================== */

/**
 * Le cadran du pied (P19).
 *
 * Une horloge d atelier : chiffre douze marque, aiguilles pleines, trotteuse
 * en accent. Elle bat a la seconde parce que c est une horloge — et elle
 * s arrete sous mouvement reduit, ou elle montre l heure sans trembler.
 */
function Cadran(): ReactElement {
  const { reduced } = useMotionState()
  const [instant, setInstant] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(
      () => {
        setInstant(new Date())
      },
      reduced ? 30000 : 1000,
    )
    return () => {
      window.clearInterval(id)
    }
  }, [reduced])

  const secondes = instant.getSeconds()
  const minutes = instant.getMinutes() + secondes / 60
  const heures = (instant.getHours() % 12) + minutes / 60
  const lu = `${String(instant.getHours()).padStart(2, '0')} h ${String(instant.getMinutes()).padStart(2, '0')}`

  return (
    <figure className="o-m-0 o-flex o-flex-col o-items-center o-gap-4">
      <svg viewBox="0 0 240 240" className="o-h-auto o-w-full" style={{ maxWidth: 260 }} role="img" aria-label={`Il est ${lu} a la boutique`}>
        <circle cx="120" cy="120" r="112" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
        <circle cx="120" cy="120" r="104" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
        {Array.from({ length: 60 }, (_, rang) => {
          const angle = (rang * Math.PI) / 30
          const grand = rang % 5 === 0
          const r1 = grand ? 88 : 96
          return (
            <line
              key={rang}
              x1={120 + Math.sin(angle) * r1}
              y1={120 - Math.cos(angle) * r1}
              x2={120 + Math.sin(angle) * 102}
              y2={120 - Math.cos(angle) * 102}
              stroke="currentColor"
              strokeWidth={grand ? 3 : 1}
              opacity={grand ? 0.75 : 0.3}
              strokeLinecap="round"
            />
          )
        })}
        <line
          x1="120"
          y1="132"
          x2={120 + Math.sin((heures * Math.PI) / 6) * 54}
          y2={120 - Math.cos((heures * Math.PI) / 6) * 54}
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="120"
          y1="138"
          x2={120 + Math.sin((minutes * Math.PI) / 30) * 82}
          y2={120 - Math.cos((minutes * Math.PI) / 30) * 82}
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {!reduced && (
          <line
            x1="120"
            y1="146"
            x2={120 + Math.sin((secondes * Math.PI) / 30) * 92}
            y2={120 - Math.cos((secondes * Math.PI) / 30) * 92}
            stroke={encreSurSombre()}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
        <circle cx="120" cy="120" r="6" fill="currentColor" />
        <circle cx="120" cy="120" r="2.4" fill={encreSurSombre()} />
      </svg>
      <figcaption className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        Heure de la boutique
      </figcaption>
    </figure>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('bricolage')
  const minute = useMinute()

  /** La fournee que le visiteur regarde ; par defaut celle qui arrive. */
  const prochaine = useMemo(() => {
    const encoreLa = FOURNEES.find((f) => etatDe(f, minute) === 'au four' || etatDe(f, minute) === 'sur la planche')
    const aVenir = FOURNEES.find((f) => etatDe(f, minute) === 'a venir')
    return encoreLa ?? aVenir ?? FOURNEES[0]
  }, [minute])

  const [choisie, setChoisie] = useState<string>(() => FOURNEES[0].cle)
  const [creneau, setCreneau] = useState<number>(() => enMinutes('09:30'))

  // Tant que le visiteur n a rien clique, la fiche suit l horloge : la page
  // doit dire ce qui se passe maintenant, pas ce qui s est passe au montage.
  const [suitHorloge, setSuitHorloge] = useState(true)
  const fiche = suitHorloge ? prochaine : (FOURNEES.find((f) => f.cle === choisie) ?? prochaine)

  /** Ce qui reste a sortir aujourd hui, pour la fusion de mots. */
  const aSortir = useMemo(() => {
    const noms = FOURNEES.filter((f) => minute < f.sortie).map((f) => f.nom)
    const uniques = [...new Set(noms)]
    return uniques.length >= 2 ? uniques : ['Tradition', 'Campagne au levain', 'Petit epeautre']
  }, [minute])

  /** Ce qui sera sur la planche au creneau choisi. */
  const planche = useMemo(
    () => FOURNEES.filter((f) => etatDe(f, creneau) === 'sur la planche').map((f) => ({ f, reste: reste(f, creneau) })),
    [creneau],
  )

  // Avant la premiere fournee, le compteur du fournil n a pas ete remis a
  // zero : il porte encore la journee de la veille. C est ce que montre un
  // vrai compteur mecanique, et cela evite une page de nuit a quatre zeros.
  const nuitBlanche = minute < FOURNEES[0].sortie
  const sortis = nuitBlanche ? PREVUS : sortisDepuis(minute)

  return (
    <Porte forme="compteur" marque="Levain" sombre={false}>
      <div className="o-relative o-overflow-hidden" style={{ ...polices, ...kraft(9) }}>
        {/*
          ----- L ouverture : le papier kraft, la farine, trois pains qui levent
        */}
        <section id="haut" className="o-relative o-isolate o-flex o-flex-col" style={{ minHeight: ECRAN }}>
          <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0 o-text-stone-700 dark:o-text-stone-200">
            <TrameFarine opacite={0.45} />
          </div>

          <BarreFilet
            marque={
              <span className="o-inline-flex o-items-center o-gap-2">
                <Icon icon={Wheat} size={18} style={{ color: encre() }} aria-hidden="true" />
                Levain
              </span>
            }
            liens={NAVIGATION}
            action={['#creneau', 'Reserver un creneau']}
            sombre={false}
          />

          <div className="o-relative o-z-10 o-mx-auto o-grid o-w-full o-max-w-7xl o-grow o-gap-10 o-px-6 o-pb-16 o-pt-12 md:o-grid-cols-12 md:o-items-center md:o-px-10">
            <div className="md:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>Rue Brochant, Paris 17 — le petrin tourne a 3 h 40</Etiquette>
              </Surgit>
              <TitreVague
                delai={120}
                className="o-m-0 o-mt-7 o-max-w-3xl o-text-stone-900 dark:o-text-stone-50"
                style={{ ...affiche('l', 800), fontSize: 'clamp(2.75rem, 7.4vw, 7.5rem)' }}
              >
                Le pain sort a l heure, pas a la demande.
              </TitreVague>
              <Surgit delai={520} as="p" className="o-m-0 o-mt-7 o-max-w-md o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                Sept fournees par jour, et l heure de chacune est ecrite. Quand il n y en a plus, il n y en a plus : nous ne recuisons rien a seize heures pour faire joli en vitrine.
              </Surgit>
              <Surgit delai={640} className="o-mt-9">
                <Actions
                  pleine={['#fournee', <>Voir la fournee <Icon icon={ArrowDown} size={16} aria-hidden="true" /></>]}
                  fantome={['#creneau', 'Reserver un creneau']}
                  sombre={false}
                />
              </Surgit>
            </div>

            {/* Les trois pains qui levent, et la carte flottante de la fournee. */}
            <div className="o-relative o-min-w-0 md:o-col-span-5 md:o-pb-28">
              <Flotte amplitude={16} duree={9} angle={-4} className="o-mx-auto o-w-2/3 md:o-w-full">
                <Boule />
              </Flotte>
              <Flotte amplitude={11} duree={7.5} delai={-2} angle={7} className="o-mt-4 o-w-full">
                <Baguette />
              </Flotte>
              <Flotte amplitude={13} duree={8.5} delai={-4} angle={-3} className="o-mx-auto o-mt-4 o-w-4/5">
                <Batard />
              </Flotte>

              <Surgit delai={820} className="o-relative o-z-20 o-mt-8 md:o-absolute md:o-bottom-0 md:o-left-0 md:o-mt-0 md:o-w-72">
                <GlareHover
                  className="o-rounded-2xl o-border-w-1 o-border-stone-300 o-p-5 o-shadow-xl dark:o-border-stone-700"
                  style={{ backgroundColor: 'var(--o-theme-bg)' }}
                  duration={900}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    {etatDe(prochaine, minute) === 'sur la planche' ? 'En vitrine maintenant' : 'La prochaine fournee'}
                  </p>
                  <p className="o-m-0 o-mt-3 o-text-2xl o-font-semibold o-tracking-tight o-text-stone-900 dark:o-text-stone-50">
                    {prochaine.nom}
                  </p>
                  <p className="o-m-0 o-mt-2 o-text-sm o-text-stone-700 dark:o-text-stone-300">{motEtat(prochaine, minute)}</p>
                  <p className="o-m-0 o-mt-4 o-border-t o-border-stone-200 o-pt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest dark:o-border-stone-800" style={{ color: encre() }}>
                    Sortie a {enHeure(prochaine.sortie)}
                  </p>
                </GlareHover>
              </Surgit>
            </div>
          </div>

          <div className="o-relative o-z-10 o-hidden md:o-block">
            <Coin position="bd" sombre={false}>
              Mardi au samedi 7 h — 19 h 30
              <br />
              Dimanche 7 h — 13 h
            </Coin>
          </div>
        </section>

        {/*
          ----- Le bandeau des pains du jour ------------------------------------
        */}
        <div
          className="o-relative o-z-10 o-overflow-hidden o-border-t o-border-b o-border-stone-300 o-py-4 o-text-stone-800 dark:o-border-stone-700 dark:o-text-stone-100"
          style={{ backgroundColor: 'var(--o-theme-bg)' }}
        >
          <Bandeau
            mots={['Tradition', 'Campagne au levain', 'Seigle et noix', 'Pain de mie au lait', 'Petit epeautre']}
            separateur="·"
            vitesse={38}
            taille="clamp(1.5rem, 3.2vw, 2.75rem)"
          />
        </div>

        {/*
          ----- Le mecanisme : la fournee ---------------------------------------
        */}
        <section id="fournee" className="o-relative o-z-10 o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <Indice rang="01" sombre={false}>La fournee</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-2xl o-text-stone-900 dark:o-text-stone-50"
                  style={{ ...affiche('m', 800), fontSize: 'clamp(1.9rem, 4.2vw, 3.75rem)' }}
                >
                  Il est {enHeure(minute)}. Voici ou en est le four.
                </h2>
              </div>
              <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300 md:o-col-span-5">
                Le ruban est la journee entiere. Le trait est votre heure. Chaque barre commence a l enfournement et finit quand la fournee est ecoulee, au debit reel du comptoir.
              </p>
            </div>

            <div className="o-mt-12">
              <Ruban
                minute={minute}
                choisie={suitHorloge ? prochaine.cle : choisie}
                onChoisir={(cle) => {
                  setChoisie(cle)
                  setSuitHorloge(false)
                }}
              />
            </div>

            {/* La fiche de la fournee regardee. */}
            <div className="o-mt-12 o-grid o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                  {motEtat(fiche, minute)}
                </p>
                <h3
                  className="o-m-0 o-mt-3 o-text-stone-900 dark:o-text-stone-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 5vw, 4.25rem)' }}
                >
                  {fiche.nom}
                </h3>
                <dl className="o-m-0 o-mt-8 o-border-t o-border-stone-300 dark:o-border-stone-700">
                  {(
                    [
                      ['Farine', fiche.farine],
                      ['Hydratation', fiche.hydratation],
                      ['Pousse', fiche.pousse],
                      ['Cuisson', `${String(fiche.cuisson)} minutes, four a sole`],
                      ['Quantite', `${String(fiche.quantite)} pieces, ecoulees en ${String(ecoulement(fiche))} minutes`],
                      ['Prix', fiche.prix],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div key={quoi} className="o-grid o-gap-x-6 o-gap-y-1 o-border-b o-border-stone-300 o-py-4 dark:o-border-stone-700 sm:o-grid-cols-12">
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400 sm:o-col-span-3">{quoi}</dt>
                      <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-800 dark:o-text-stone-200 sm:o-col-span-9">{valeur}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="o-min-w-0 md:o-col-span-5">
                <div className="o-rounded-2xl o-border-w-1 o-border-stone-300 o-p-6 dark:o-border-stone-700" style={kraft(16)}>
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                    Il reste a sortir aujourd hui
                  </p>
                  <MorphText
                    mots={aSortir}
                    hold={1700}
                    morph={800}
                    className="o-mt-4 o-block o-text-stone-900 dark:o-text-stone-50"
                    style={{ ...affiche('m', 800), fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                  />
                  <p className="o-m-0 o-mt-6 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                    Les fournees a venir se relaient ici jusqu a la derniere tradition de 17 h 30. Apres elle, le four s eteint.
                  </p>
                  <div className="o-mt-6">
                    <Autocollant angle={-5}>Levain naturel, aucune levure</Autocollant>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*
          ----- Le levain : un ecran de texte seul ------------------------------
        */}
        <section id="levain" className="o-relative o-z-10 o-scroll-mt-24 o-flex o-items-center o-border-t o-border-b o-border-stone-300 o-px-6 o-py-24 dark:o-border-stone-700 md:o-px-10 md:o-py-36" style={{ backgroundColor: 'var(--o-theme-bg)', minHeight: `calc(0.72 * ${ECRAN})` }}>
          <div className="o-mx-auto o-w-full o-max-w-7xl">
            <Manifeste eteint="Un levain, c est une colonie qu on nourrit tous les jours et qu on ne possede pas." sombre={false}>
              Le notre a ete lance en 1997 par la mere de Salome, avec de la farine et de l eau. Il n a pas manque un rafraichi depuis.
            </Manifeste>
          </div>
        </section>

        {/*
          ----- Le fournil, heure par heure -------------------------------------
        */}
        <section id="fournil" className="o-relative o-z-10 o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
          <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-4">
              <Indice rang="02" sombre={false}>Le fournil</Indice>
              <h2
                className="o-m-0 o-mt-5 o-text-stone-900 dark:o-text-stone-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(1.9rem, 3.8vw, 3.25rem)' }}
              >
                Seize heures de suite, cinq jours sur sept.
              </h2>
              <p className="o-mt-5 o-max-w-sm o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                Deux personnes au fournil, une au comptoir. Rien n est congele, rien n est livre : ce qui est en vitrine a ete petri dans la piece d a cote.
              </p>
              <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                Farine bio, moulin de Brasseuil, 46 km
              </p>
            </div>
            <div className="o-min-w-0 md:o-col-span-8">
              <HalftoneReveal cell={14} travel={0.6}>
                <Timeline
                  events={JOURNEE.map((etape) => ({ date: etape.date, title: etape.title, body: etape.body }))}
                  label="La journee du fournil"
                  className="o-text-stone-800 dark:o-text-stone-200"
                />
              </HalftoneReveal>
            </div>
          </div>
        </section>

        {/*
          ----- La coupe sombre : le compteur a rouleaux (C17) -------------------
        */}
        <section
          className="o-relative o-z-10 o-overflow-hidden o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          style={nuit('stone')}
        >
          <div aria-hidden="true" className="o-absolute o-inset-0 o-text-stone-300">
            <TrameFarine opacite={0.16} />
          </div>
          <div className="o-relative o-mx-auto o-flex o-max-w-7xl o-flex-col o-items-center o-gap-8 o-text-center">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
              {nuitBlanche ? 'Pains sortis du four hier' : 'Pains sortis du four depuis 4 h 10'}
            </p>
            <Rouleaux valeur={sortis} />
            <p className="o-m-0 o-max-w-lg o-text-base o-leading-relaxed o-text-stone-300">
              {nuitBlanche
                ? `Le compteur porte encore la journee d hier. Il se remet a zero a la premiere fournee, a ${enHeure(FOURNEES[0].sortie)}.`
                : `Sur ${String(PREVUS)} prevus aujourd hui. Le compteur du fournil est un vrai compteur : il avance par fournee entiere, et il ne revient jamais en arriere.`}
            </p>
          </div>
        </section>

        {/*
          ----- L appel : le creneau de retrait (A23) ---------------------------
        */}
        <section id="creneau" className="o-relative o-z-10 o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="03" sombre={false}>Retirer</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-3xl o-text-stone-900 dark:o-text-stone-50"
                  style={{ ...affiche('m', 800), fontSize: 'clamp(1.9rem, 4.6vw, 4rem)' }}
                >
                  Choisissez votre heure. Nous mettons de cote.
                </h2>
              </div>
              <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300 md:o-col-span-4 md:o-text-right">
                Un creneau de trente minutes, six pains au plus. Les creneaux barres sont deja pris.
              </p>
            </div>

            {/* La frise horaire de la journee. */}
            <div className="o-mt-12 o-overflow-x-auto o-pb-3">
              <ol className="o-m-0 o-flex o-w-max o-list-none o-items-end o-gap-2 o-p-0">
                {CRENEAUX.map((c) => {
                  const pris = COMPLETS.has(c)
                  const actif = c === creneau
                  const pleine = c % 60 === 0
                  return (
                    <li key={c}>
                      <button
                        type="button"
                        disabled={pris}
                        aria-pressed={actif}
                        onClick={() => {
                          setCreneau(c)
                        }}
                        className={`o-flex o-w-16 o-flex-col o-items-center o-gap-2 o-rounded-lg o-border-w-1 o-py-3 o-font-mono o-text-xs o-transition-colors focus:o-ring ${
                          pris
                            ? 'o-cursor-not-allowed o-line-through o-border-stone-300 o-text-stone-500 dark:o-border-stone-700 dark:o-text-stone-400'
                            : 'o-cursor-pointer o-border-stone-300 o-text-stone-800 hover:o-bg-stone-100 dark:o-border-stone-700 dark:o-text-stone-100 dark:hover:o-bg-stone-800'
                        }`}
                        style={actif && !pris ? { ...aplat(), borderColor: 'transparent' } : undefined}
                      >
                        <span aria-hidden="true" className="o-h-4 o-w-px" style={{ backgroundColor: 'currentColor', opacity: pleine ? 0.8 : 0.3 }} />
                        {enHeure(c)}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* Ce qui sera sur la planche a ce creneau. */}
            <div className="o-mt-10 o-grid o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  A {enHeure(creneau)}, sur la planche
                </p>
                {planche.length === 0 ? (
                  <p className="o-m-0 o-mt-5 o-max-w-lg o-text-lg o-leading-relaxed o-text-stone-800 dark:o-text-stone-200">
                    Rien ne sera sorti a cette heure-la. C est le creux entre deux fournees : prenez le creneau suivant, ou celui d avant.
                  </p>
                ) : (
                  <ul aria-live="polite" className="o-m-0 o-mt-5 o-list-none o-border-t o-border-stone-300 o-p-0 dark:o-border-stone-700">
                    {planche.map(({ f, reste: restant }) => (
                      <li key={f.cle} className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-border-b o-border-stone-300 o-py-4 dark:o-border-stone-700">
                        <span className="o-text-lg o-font-semibold o-tracking-tight o-text-stone-900 dark:o-text-stone-50">{f.nom}</span>
                        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                          sorti a {enHeure(f.sortie)} — {restant === 0 ? 'epuise' : `environ ${String(restant)} pieces`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="o-min-w-0 md:o-col-span-5">
                <div className="o-rounded-2xl o-border-w-1 o-border-stone-300 o-p-6 dark:o-border-stone-700" style={{ backgroundColor: 'var(--o-theme-bg)' }}>
                  <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                    Le creneau se confirme par telephone ; nous ecrivons votre nom sur le carnet et le pain vous attend sur la planche du haut.
                  </p>
                  <a
                    href="tel:+33145229800"
                    className="o-mt-6 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                    style={aplat()}
                  >
                    Reserver {enHeure(creneau)} — 01 45 22 98 00
                    <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
                  </a>
                  <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    Aucun paiement en ligne, aucun compte
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*
          ----- Le pied (P19) : une horloge et une adresse -----------------------
        */}
        <footer className="o-relative o-z-10 o-px-6 o-py-20 md:o-px-10 md:o-py-24" style={nuit('stone')}>
          <div className="o-mx-auto o-grid o-max-w-4xl o-items-center o-gap-12 md:o-grid-cols-2">
            <div className="o-text-stone-100">
              <Cadran />
            </div>
            <address className="o-not-italic">
              <p className="o-m-0 o-text-stone-50" style={{ ...affiche('m', 800), fontSize: 'clamp(1.75rem, 3.6vw, 3rem)' }}>
                Levain
              </p>
              <p className="o-m-0 o-mt-5 o-text-lg o-leading-relaxed o-text-stone-200">
                18 rue Brochant
                <br />
                75017 Paris
              </p>
              <p className="o-m-0 o-mt-5 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400">
                Mardi au samedi 7 h — 19 h 30 · Dimanche 7 h — 13 h
                <br />© 2026 Levain
              </p>
            </address>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
