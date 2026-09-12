/**
 * Seconde Vie — centre de tri.
 *
 * ## Ce que la page fait : le tri
 *
 * On **jette un objet dans la page** et il parcourt la chaine, poste par
 * poste. A chacun des sept postes, la page dit s il est capte et **pourquoi** :
 * un overband ne retient que ce qui est ferromagnetique, un courant de
 * Foucault ne repousse que ce qui est conducteur et non magnetique, un crible
 * balistique separe le plat du roulant, un tri optique lit une signature dans
 * le proche infrarouge et ne voit pas le noir de carbone.
 *
 * Chaque objet porte donc ses vraies proprietes — matiere, forme, densite,
 * magnetisme, signature — et le trajet en decoule. Ce n est pas une animation
 * qui raconte un tri : c est un tri qui produit une animation.
 *
 * ## La halle, en diorama lateral
 *
 * Mouvement M-diorama lateral (`sens="x"`) : quatre ecrans de halle traversee
 * de gauche a droite, les convoyeurs et les machines a leur profondeur, la
 * passerelle au premier plan. Le meme parcours que l objet, a l echelle du
 * batiment.
 *
 * ## Les formes
 *
 * A17 : un plan du site ou l on clique la zone qui vous concerne. P27 : quatre
 * pictogrammes dessines et leurs legendes. C18 : une carte de chaleur en
 * cases — huit flux sur douze mois.
 *
 * ## Le fond
 *
 * F-statique : du papier clair, une gouttiere large, des filets d un pixel.
 * Tout est dessine ; la seule bande sombre est la halle.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { BeamConnect } from '@/odoro/effect/BeamConnect.jsx'
import { HighlightSweep } from '@/odoro/text/HighlightSweep.jsx'
import { AnimatedList } from '@/odoro/ui/AnimatedList.jsx'
import { CardSwap } from '@/odoro/ui/CardSwap.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
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
} from './marche.jsx'
import { Couche, Profondeur } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/* ============================ La feuille =============================== */

const STYLE_TRI = 'o-vitrine-recyclage'

const CSS_TRI = [
  '@keyframes o-tr-tapis{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-28}}',
  '@keyframes o-tr-souffle{0%,100%{opacity:0.25}50%{opacity:1}}',
  '[data-o-tr-tapis]{animation:o-tr-tapis 1.4s linear infinite}',
  '[data-o-tr-souffle]{animation:o-tr-souffle 2s ease-in-out infinite}',
  '@media (prefers-reduced-motion:reduce){[data-o-tr-tapis],[data-o-tr-souffle]{animation:none}}',
].join('')

function useFeuilleTri(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_TRI) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_TRI
    feuille.textContent = CSS_TRI
    document.head.append(feuille)
  }, [])
}

/* ============================ La chaine ================================ */

/** Un poste de la chaine, avec ce qu il sait faire. */
interface Poste {
  readonly cle: string
  readonly rang: string
  readonly nom: string
  readonly principe: string
  readonly debit: string
}

const POSTES: readonly Poste[] = [
  { cle: 'fosse', rang: '01', nom: 'Fosse et pre-tri', principe: 'Deux agents retirent a la main ce qui n a rien a faire la : verre casse, textile, cables, bouteilles de gaz.', debit: '9 t/h' },
  { cle: 'trommel', rang: '02', nom: 'Trommel', principe: 'Un cylindre perfore de 60 mm qui tourne a onze tours par minute. Ce qui est plus petit tombe et part aux fines.', debit: '9 t/h' },
  { cle: 'balistique', rang: '03', nom: 'Crible balistique', principe: 'Des palettes inclinees qui montent. Ce qui roule redescend, ce qui est plat monte : les corps creux se separent des papiers.', debit: '7 t/h' },
  { cle: 'overband', rang: '04', nom: 'Overband magnetique', principe: 'Un aimant permanent suspendu au-dessus du tapis. Il enleve l acier, et lui seul : rien d autre n y repond.', debit: '7 t/h' },
  { cle: 'foucault', rang: '05', nom: 'Courants de Foucault', principe: 'Un rotor aimante a trois mille tours induit un champ dans les metaux conducteurs non magnetiques. L aluminium saute par-dessus la lame.', debit: '7 t/h' },
  { cle: 'optique', rang: '06', nom: 'Tri optique infrarouge', principe: 'Une lampe, un spectrometre, une rampe de buses. Chaque plastique a une signature dans le proche infrarouge ; le noir de carbone n en a pas.', debit: '5 t/h' },
  { cle: 'cabine', rang: '07', nom: 'Cabine de controle', principe: 'Le dernier regard humain. Ce qui passe encore ici part au refus, et le refus part en combustible de substitution.', debit: '5 t/h' },
]

/** Un objet qu on peut jeter dans la chaine. */
interface Objet {
  readonly cle: string
  readonly nom: string
  readonly matiere: string
  readonly poids: string
  /** Le poste ou il sort de la chaine. */
  readonly sortie: string
  /** Pourquoi il sort la. */
  readonly capture: string
  /** Ce qu il devient, et en combien. */
  readonly devient: string
  readonly rendement: string
  /** Le dessin, en chemin SVG sur une boite de 80 par 80. */
  readonly dessin: ReactNode
}

/** Ce que chaque poste dit d un objet qui le traverse sans etre pris. */
const PASSAGES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  fosse: {
    defaut: 'Passe le pre-tri : il a sa place dans le bac jaune.',
    bocal: 'Retire a la main. Le verre casse dechire les tapis et raye les optiques ; il a sa propre collecte.',
  },
  trommel: {
    defaut: 'Trop gros pour les trous de 60 mm : il reste sur le cylindre et continue.',
    bouchon: 'Tombe dans les fines : moins de 60 mm, il part avec le sable et les tessons.',
  },
  balistique: {
    roulant: 'Corps creux : il redescend la pente avec les bouteilles et les canettes.',
    plat: 'Corps plat : il monte avec les papiers et les films.',
  },
  overband: {
    defaut: 'L aimant ne le voit pas : il n est pas ferromagnetique.',
  },
  foucault: {
    defaut: 'Isolant : le champ tournant n induit rien dedans, il ne saute pas.',
  },
  optique: {
    defaut: 'Sa signature infrarouge ne correspond a aucune buse ouverte a ce passage.',
  },
  cabine: {
    defaut: 'Passe la cabine sans etre repris.',
  },
}

const OBJETS: readonly Objet[] = [
  {
    cle: 'pet',
    nom: 'Bouteille d eau',
    matiere: 'PET transparent',
    poids: '28 g',
    sortie: 'optique',
    capture: 'Le spectrometre lit la bande du PET a 1 660 nanometres et la buse la souffle dans le bon couloir.',
    devient: 'Paillettes lavees, puis fibre polyester ou bouteille neuve.',
    rendement: '0,92 kg de paillette par kilo entre',
    dessin: (
      <g>
        <path d="M34 16h12v8l6 8v34a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V32l6-8Z" fill="none" strokeWidth="2.5" />
        <path d="M34 12h12v4H34Z" strokeWidth="2.5" />
        <path d="M28 44h24M28 54h24" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    cle: 'pehd',
    nom: 'Bouteille de lait',
    matiere: 'PEHD opaque',
    poids: '32 g',
    sortie: 'optique',
    capture: 'Meme poste, autre buse : le PEHD absorbe a 1 730 nanometres, et le couloir suivant lui est reserve.',
    devient: 'Granule, puis tubes d assainissement et bacs de collecte.',
    rendement: '0,89 kg de granule par kilo entre',
    dessin: (
      <g>
        <path d="M30 20h20v46a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6Z" fill="none" strokeWidth="2.5" />
        <path d="M36 10h8v10h-8Z" strokeWidth="2.5" />
        <path d="M30 34h20" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    cle: 'canette',
    nom: 'Canette',
    matiere: 'Aluminium',
    poids: '13 g',
    sortie: 'foucault',
    capture: 'Le rotor induit un courant dans la paroi ; le champ oppose la repousse et elle saute la lame de partage.',
    devient: 'Lingot, puis canette neuve en soixante jours.',
    rendement: '0,95 kg de metal par kilo entre',
    dessin: (
      <g>
        <path d="M30 18h20v46a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4Z" fill="none" strokeWidth="2.5" />
        <ellipse cx="40" cy="18" rx="10" ry="4" fill="none" strokeWidth="2.5" />
        <path d="M30 28h20M30 58h20" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    cle: 'conserve',
    nom: 'Boite de conserve',
    matiere: 'Acier etame',
    poids: '46 g',
    sortie: 'overband',
    capture: 'Ferromagnetique : l aimant la decolle du tapis et la depose deux metres plus loin, sans rien toucher d autre.',
    devient: 'Ferraille, puis acier de construction au four electrique.',
    rendement: '0,97 kg d acier par kilo entre',
    dessin: (
      <g>
        <path d="M28 24h24v40a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4Z" fill="none" strokeWidth="2.5" />
        <ellipse cx="40" cy="24" rx="12" ry="5" fill="none" strokeWidth="2.5" />
        <path d="M28 40h24M28 52h24" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    cle: 'brique',
    nom: 'Brique de jus',
    matiere: 'Carton, aluminium, polyethylene',
    poids: '30 g',
    sortie: 'optique',
    capture: 'Sa signature est celle du carton double d un film : le tri optique la separe des papiers purs.',
    devient: 'Fibre de cellulose longue, puis papier d essuyage et plaques.',
    rendement: '0,74 kg de fibre par kilo entre',
    dessin: (
      <g>
        <path d="M28 20h24v50H28Z" fill="none" strokeWidth="2.5" />
        <path d="M28 20 40 12l12 8" fill="none" strokeWidth="2.5" />
        <path d="M34 34h12v14H34Z" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    cle: 'journal',
    nom: 'Journal',
    matiere: 'Papier',
    poids: '210 g',
    sortie: 'balistique',
    capture: 'Corps plat : il monte le long des palettes et part au flux papier, avant meme les machines a metaux.',
    devient: 'Pate desencree, puis papier journal a nouveau.',
    rendement: '0,84 kg de pate par kilo entre',
    dessin: (
      <g>
        <path d="M22 20h36v48H22Z" fill="none" strokeWidth="2.5" />
        <path d="M40 20v48" strokeWidth="1.5" />
        <path d="M27 30h9M27 38h9M27 46h9M45 30h9M45 38h9M45 46h9" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    cle: 'bouchon',
    nom: 'Bouchon de bouteille',
    matiere: 'Polypropylene',
    poids: '2 g',
    sortie: 'trommel',
    capture: 'Moins de soixante millimetres : il tombe par les trous du cylindre et part aux fines, avec le sable.',
    devient: 'Rien, s il est seul. Laisse-le visse sur la bouteille et il suit le PET.',
    rendement: 'perdu a 100 % en vrac',
    dessin: (
      <g>
        <path d="M28 34h24v18a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4Z" fill="none" strokeWidth="2.5" />
        <path d="M30 40h20M30 46h20" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    cle: 'bocal',
    nom: 'Bocal en verre',
    matiere: 'Verre sodocalcique',
    poids: '220 g',
    sortie: 'fosse',
    capture: 'Retire a la main des le pre-tri. Le verre n a rien a faire ici : il casse, il raye, et il a sa propre collecte.',
    devient: 'Calcin, puis verre neuf — mais seulement s il passe par le conteneur a verre.',
    rendement: '0 kg par cette chaine',
    dessin: (
      <g>
        <path d="M30 24h20v40a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6Z" fill="none" strokeWidth="2.5" />
        <path d="M32 16h16v8H32Z" strokeWidth="2.5" />
        <path d="M30 38h20" strokeWidth="1.5" />
      </g>
    ),
  },
]

/** Les objets qui roulent, au crible balistique. */
const ROULANTS = new Set(['pet', 'pehd', 'canette', 'conserve', 'bocal', 'bouchon'])

/**
 * Le trajet d un objet : ce que chaque poste lui fait, jusqu a sa sortie.
 */
function trajet(objet: Objet): readonly { poste: Poste; pris: boolean; mot: string }[] {
  const sortie = POSTES.findIndex((p) => p.cle === objet.sortie)
  return POSTES.slice(0, sortie + 1).map((poste, rang) => {
    if (rang === sortie) return { poste, pris: true, mot: objet.capture }
    const table = PASSAGES[poste.cle] ?? {}
    if (poste.cle === 'balistique') {
      return { poste, pris: false, mot: (ROULANTS.has(objet.cle) ? table['roulant'] : table['plat']) ?? '' }
    }
    return { poste, pris: false, mot: table[objet.cle] ?? table['defaut'] ?? '' }
  })
}

/* ============================ Le mecanisme ============================= */

/**
 * Le tri : on jette un objet, il descend la chaine.
 *
 * Le marqueur avance d un poste toutes les six cents millisecondes ; le
 * journal se remplit au meme rythme, et l on peut cliquer une ligne pour
 * relire ce qui s y est passe. Sous mouvement reduit, tout est ecrit d un
 * coup — le trajet n est pas dans l animation, il est dans les raisons.
 */
function Chaine(): ReactElement {
  const { reduced } = useMotionState()
  const [objet, setObjet] = useState<Objet | null>(null)
  const [avance, setAvance] = useState(0)
  const [ligne, setLigne] = useState<string | undefined>(undefined)
  const minuterie = useRef<number | undefined>(undefined)

  const parcours = objet === null ? [] : trajet(objet)

  const jeter = (choisi: Objet): void => {
    window.clearInterval(minuterie.current)
    setObjet(choisi)
    setLigne(undefined)
    const etapes = trajet(choisi).length
    if (reduced) {
      setAvance(etapes)
      setLigne(trajet(choisi)[etapes - 1]?.poste.cle)
      return
    }
    setAvance(0)
    let rang = 0
    minuterie.current = window.setInterval(() => {
      rang += 1
      setAvance(rang)
      if (rang >= etapes) {
        window.clearInterval(minuterie.current)
        setLigne(trajet(choisi)[etapes - 1]?.poste.cle)
      }
    }, 620)
  }

  useEffect(
    () => () => {
      window.clearInterval(minuterie.current)
    },
    [],
  )

  const visibles = parcours.slice(0, Math.max(0, avance))
  const choisie = visibles.find((etape) => etape.poste.cle === ligne) ?? visibles[visibles.length - 1]
  const fini = objet !== null && avance >= parcours.length

  return (
    <div>
      {/* ----- Les objets qu on peut jeter ----------------------------- */}
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        Jetez un objet dans la chaine
      </p>
      <ul className="o-m-0 o-mt-5 o-grid o-list-none o-gap-px o-p-0 sm:o-grid-cols-4 lg:o-grid-cols-8" style={{ backgroundColor: 'var(--o-theme-line)' }}>
        {OBJETS.map((candidat) => {
          const actif = objet?.cle === candidat.cle
          return (
            <li key={candidat.cle} className="o-min-w-0">
              <button
                type="button"
                aria-pressed={actif}
                onClick={() => {
                  jeter(candidat)
                }}
                className="o-flex o-h-full o-w-full o-flex-col o-items-center o-gap-3 o-px-3 o-py-5 o-transition-colors focus:o-ring"
                style={{ backgroundColor: actif ? accentDoux(400, 26) : 'var(--o-theme-bg)' }}
              >
                <svg viewBox="0 0 80 80" className="o-h-auto" style={{ width: 52 }} aria-hidden="true" fill="none" stroke={actif ? encre() : 'currentColor'} strokeLinejoin="round">
                  {candidat.dessin}
                </svg>
                <span className="o-text-center o-text-xs o-leading-snug">{candidat.nom}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* ----- La chaine dessinee, et le marqueur qui la descend -------- */}
      <div className="o-relative o-mt-10 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
        <div style={{ minWidth: 820 }}>
          <svg viewBox="0 0 820 150" className="o-h-auto o-w-full" aria-hidden="true">
            {/* Le tapis. */}
            <path d="M20 108h780" stroke={accentDoux(900, 24)} strokeWidth="8" strokeLinecap="round" />
            <path
              data-o-tr-tapis={objet !== null && !fini && !reduced ? '' : undefined}
              d="M20 108h780"
              stroke={accent(400)}
              strokeWidth="2"
              strokeDasharray="10 18"
            />

            {POSTES.map((poste, rang) => {
              const x = 62 + rang * 116
              const traverse = rang < visibles.length
              const pris = visibles[rang]?.pris === true
              return (
                <g key={poste.cle}>
                  <path d={`M${String(x)} 108V52`} stroke={accentDoux(900, traverse ? 44 : 18)} strokeWidth="1.5" />
                  <rect
                    x={x - 26}
                    y={20}
                    width={52}
                    height={32}
                    fill={pris ? accent(400) : traverse ? accentDoux(400, 34) : 'transparent'}
                    stroke={accentDoux(900, traverse ? 50 : 24)}
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={41}
                    fontSize="14"
                    textAnchor="middle"
                    fill={pris ? 'var(--o-palette-zinc-950)' : 'currentColor'}
                    opacity={traverse ? 1 : 0.55}
                    style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}
                  >
                    {poste.rang}
                  </text>
                  <text
                    x={x}
                    y={134}
                    fontSize="11"
                    textAnchor="middle"
                    fill="currentColor"
                    opacity={traverse ? 0.85 : 0.4}
                    style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.05em' }}
                  >
                    {poste.nom.split(' ')[0]}
                  </text>
                </g>
              )
            })}

            {/* Le marqueur : l objet, quelque part sur le tapis. */}
            {objet !== null && (
              <g
                style={{
                  transform: `translateX(${String(62 + Math.max(0, Math.min(POSTES.length - 1, visibles.length - 1)) * 116 - 62)}px)`,
                  transition: reduced ? 'none' : 'transform 560ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <circle cx="62" cy="108" r="11" fill={encre()} />
                <circle cx="62" cy="108" r="17" fill="none" stroke={encre()} strokeWidth="1.5" opacity="0.45" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* ----- Le journal, et le detail --------------------------------- */}
      <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-14">
        <div className="o-min-w-0 lg:o-col-span-5">
          <p className="o-m-0 o-mb-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Le journal du passage
          </p>
          {objet === null ? (
            <p className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Rien sur le tapis. Choisissez un objet ci-dessus : la chaine ne devine pas, elle mesure, et elle
              ne se trompe que quand on lui donne ce qu elle ne sait pas lire.
            </p>
          ) : (
            <AnimatedList
              label={`Le passage de ${objet.nom} dans la chaine`}
              items={visibles.map((etape) => ({
                id: etape.poste.cle,
                label: `${etape.poste.rang} — ${etape.poste.nom}`,
                hint: etape.pris ? 'capte' : 'passe',
              }))}
              value={ligne}
              onChange={setLigne}
              stagger={70}
            />
          )}
        </div>

        <div className="o-min-w-0 lg:o-col-span-7" aria-live="polite">
          {objet !== null && choisie !== undefined && (
            <div className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-8">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                {choisie.poste.rang} — {choisie.poste.nom} — {choisie.pris ? 'objet capte' : 'objet non capte'}
              </p>
              <h3
                className="o-m-0 o-mt-4 o-max-w-xl o-text-balance"
                style={{ ...affiche('m', 300), fontSize: 'clamp(1.4rem, 2.6vw, 2.25rem)', lineHeight: 1.04 }}
              >
                {choisie.mot}
              </h3>
              <p className="o-m-0 o-mt-5 o-max-w-lg o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                {choisie.poste.principe} Debit nominal du poste : {choisie.poste.debit}.
              </p>

              {fini && (
                <dl className="o-m-0 o-mt-10 o-grid o-gap-6 sm:o-grid-cols-3">
                  {(
                    [
                      ['Matiere', objet.matiere],
                      ['Ce qu il devient', objet.devient],
                      ['Rendement matiere', objet.rendement],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div key={quoi} className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-4">
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">{quoi}</dt>
                      <dd className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed">{valeur}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================ La halle ================================= */

/** Une machine de la halle, dessinee en elevation. */
function Machine({ poste }: { readonly poste: Poste }): ReactElement {
  const formes: Readonly<Record<string, ReactNode>> = {
    fosse: (
      <g>
        <path d="M0 200h180v-70H0Z" fill={accentDoux(800, 34)} stroke={accentDoux(200, 52)} strokeWidth="2" />
        <path d="M20 130V80h140v50" fill="none" stroke={accentDoux(200, 40)} strokeWidth="2" />
      </g>
    ),
    trommel: (
      <g>
        <path d="M10 150h180v-60H10Z" fill={accentDoux(800, 30)} stroke={accentDoux(200, 54)} strokeWidth="2" />
        <ellipse cx="100" cy="120" rx="86" ry="30" fill="none" stroke={accentDoux(200, 64)} strokeWidth="2" />
        {Array.from({ length: 9 }, (_, rang) => (
          <circle key={rang} cx={26 + rang * 18} cy={120} r="4" fill={accentDoux(200, 46)} />
        ))}
      </g>
    ),
    balistique: (
      <g>
        <path d="M8 170 170 84" stroke={accentDoux(200, 60)} strokeWidth="3" />
        {Array.from({ length: 7 }, (_, rang) => (
          <path key={rang} d={`M${String(24 + rang * 22)} ${String(162 - rang * 12)}l14 -22`} stroke={accentDoux(200, 46)} strokeWidth="2" />
        ))}
        <path d="M170 84h24v86h-24Z" fill={accentDoux(800, 30)} stroke={accentDoux(200, 48)} strokeWidth="2" />
      </g>
    ),
    overband: (
      <g>
        <path d="M24 60h150v42H24Z" fill={accentDoux(800, 34)} stroke={accentDoux(200, 58)} strokeWidth="2" />
        <path d="M42 102v22M100 102v22M158 102v22" stroke={accent(400)} strokeWidth="2" strokeDasharray="4 5" />
        <path d="M60 134h80" stroke={accent(400)} strokeWidth="3" />
      </g>
    ),
    foucault: (
      <g>
        <circle cx="96" cy="120" r="46" fill="none" stroke={accentDoux(200, 60)} strokeWidth="2" />
        <circle cx="96" cy="120" r="24" fill={accentDoux(800, 34)} stroke={accentDoux(200, 50)} strokeWidth="2" />
        {Array.from({ length: 8 }, (_, rang) => {
          const a = (rang * Math.PI) / 4
          return (
            <path
              key={rang}
              d={`M${String(96 + Math.cos(a) * 24)} ${String(120 + Math.sin(a) * 24)}L${String(96 + Math.cos(a) * 46)} ${String(120 + Math.sin(a) * 46)}`}
              stroke={accent(400)}
              strokeWidth="2"
            />
          )
        })}
        <path d="M150 96 190 68" stroke={accent(400)} strokeWidth="2" strokeDasharray="5 5" />
      </g>
    ),
    optique: (
      <g>
        <path d="M20 54h160v38H20Z" fill={accentDoux(800, 34)} stroke={accentDoux(200, 58)} strokeWidth="2" />
        <path d="M100 92v26" stroke={accent(400)} strokeWidth="2" />
        {Array.from({ length: 12 }, (_, rang) => (
          <path key={rang} data-o-tr-souffle="" d={`M${String(30 + rang * 13)} 122v18`} stroke={accent(400)} strokeWidth="2" style={{ animationDelay: `${String(rang * 0.12)}s` } as CSSProperties} />
        ))}
        <path d="M20 150h160" stroke={accentDoux(200, 50)} strokeWidth="2" />
      </g>
    ),
    cabine: (
      <g>
        <path d="M20 60h160v110H20Z" fill={accentDoux(800, 30)} stroke={accentDoux(200, 56)} strokeWidth="2" />
        <path d="M36 76h128v54H36Z" fill="none" stroke={accentDoux(200, 48)} strokeWidth="2" />
        <path d="M68 130v40M132 130v40" stroke={accentDoux(200, 40)} strokeWidth="2" />
      </g>
    ),
  }

  return (
    // Chaque machine est un dessin autonome, large de vingt-six centiemes
    // d ecran : c est ce qui rend la course de la bande previsible. Un seul
    // grand SVG aurait ete remis a l echelle par `preserveAspectRatio`, et le
    // decor aurait defile deux fois moins vite que sa couche.
    <svg viewBox="0 0 210 250" className="o-h-auto o-shrink-0" style={{ width: '26vw', overflow: 'visible' }} aria-hidden="true">
      {formes[poste.cle]}
      <text x="8" y="238" fontSize="13" fill={encreSurSombre()} style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.12em' }}>
        {poste.rang}
      </text>
      <text x="40" y="238" fontSize="13" fill="currentColor" opacity="0.7" style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}>
        {poste.nom.toUpperCase()}
      </text>
    </svg>
  )
}

/* ============================ La carte de chaleur ====================== */

/** Les huit flux de la halle, et ce qui en est sorti mois par mois, en tonnes. */
const FLUX = [
  { nom: 'Papier', mois: [312, 298, 341, 306, 289, 264, 218, 176, 301, 338, 366, 402] },
  { nom: 'Carton', mois: [268, 254, 289, 271, 262, 246, 214, 188, 274, 312, 356, 421] },
  { nom: 'PET clair', mois: [86, 82, 91, 88, 96, 112, 124, 118, 92, 88, 84, 94] },
  { nom: 'PEHD', mois: [54, 51, 58, 56, 59, 64, 68, 62, 57, 56, 55, 61] },
  { nom: 'Briques', mois: [31, 29, 33, 32, 34, 36, 38, 34, 33, 32, 31, 36] },
  { nom: 'Acier', mois: [74, 71, 78, 76, 79, 84, 88, 81, 77, 76, 78, 92] },
  { nom: 'Aluminium', mois: [18, 17, 19, 19, 22, 28, 34, 31, 21, 19, 18, 21] },
  { nom: 'Refus', mois: [141, 136, 152, 148, 154, 168, 182, 171, 149, 146, 151, 178] },
] as const

const MOIS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] as const

/**
 * La carte de chaleur (C18).
 *
 * Chaque ligne est normalisee sur elle-meme : ce qui se lit n est pas le
 * tonnage absolu — le papier ecrase tout — mais la saison de chaque flux.
 * L aluminium monte en juillet parce qu on boit dehors ; le carton explose en
 * decembre pour la raison qu on devine.
 */
function CarteDeChaleur(): ReactElement {
  const [case_, setCase] = useState<{ flux: string; mois: number } | null>(null)

  return (
    <div>
      {/* La bande se parcourt de cote sur un petit ecran : `overflow-y`
          explicite, sans quoi elle avale la molette et fige la page. */}
      <div className="o-relative o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
        <table className="o-text-left" style={{ borderCollapse: 'separate', borderSpacing: 3, minWidth: 640 }}>
          <caption className="o-sr-only">
            Tonnage sorti par flux et par mois, chaque ligne graduee sur son propre maximum
          </caption>
          <thead>
            <tr>
              <th scope="col" className="o-pr-4 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Flux
              </th>
              {MOIS.map((mot, rang) => (
                <th key={rang} scope="col" className="o-w-12 o-text-center o-font-mono o-text-xs o-font-normal o-text-zinc-500 dark:o-text-zinc-400">
                  {mot}
                </th>
              ))}
              <th scope="col" className="o-pl-4 o-text-right o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Annee
              </th>
            </tr>
          </thead>
          <tbody>
            {FLUX.map((flux) => {
              const haut = Math.max(...flux.mois)
              const bas = Math.min(...flux.mois)
              const total = flux.mois.reduce((somme, t) => somme + t, 0)
              return (
                <tr key={flux.nom}>
                  <th scope="row" className="o-whitespace-nowrap o-pr-4 o-text-sm o-font-medium">
                    {flux.nom}
                  </th>
                  {flux.mois.map((tonnes, rang) => {
                    const part = haut === bas ? 0.5 : (tonnes - bas) / (haut - bas)
                    const chaud = case_?.flux === flux.nom && case_.mois === rang
                    return (
                      <td key={rang} className="o-p-0">
                        <button
                          type="button"
                          onMouseEnter={() => {
                            setCase({ flux: flux.nom, mois: rang })
                          }}
                          onFocus={() => {
                            setCase({ flux: flux.nom, mois: rang })
                          }}
                          onClick={() => {
                            setCase({ flux: flux.nom, mois: rang })
                          }}
                          className="o-block o-w-full focus:o-ring"
                          style={{
                            height: 34,
                            backgroundColor: accentDoux(500, Math.round(8 + part * 78)),
                            outline: chaud ? `2px solid ${encre()}` : undefined,
                            outlineOffset: 1,
                          }}
                        >
                          <span className="o-sr-only">
                            {flux.nom}, mois {rang + 1} : {tonnes} tonnes
                          </span>
                        </button>
                      </td>
                    )
                  })}
                  <td className="o-pl-4 o-text-right o-font-mono o-text-sm o-tabular-nums o-whitespace-nowrap">
                    {total.toLocaleString('fr-FR')} t
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p aria-live="polite" className="o-m-0 o-mt-6 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        {case_ === null
          ? 'Passez sur une case : chaque ligne est graduee sur son propre maximum, pour que la saison se lise au lieu du volume.'
          : `${case_.flux} — mois ${String(case_.mois + 1)} : ${String(
              FLUX.find((f) => f.nom === case_.flux)?.mois[case_.mois] ?? 0,
            )} tonnes sorties.`}
      </p>
    </div>
  )
}

/* ============================ Le plan du site ========================== */

/** Une zone du plan, avec ce qu on y fait. */
const ZONES = [
  {
    cle: 'accueil',
    nom: 'Accueil du public',
    forme: 'M40 300h150v120H40Z',
    etiquette: [56, 366] as const,
    horaires: 'Du mardi au samedi, 9 h — 12 h et 14 h — 17 h',
    texte: 'On entre par la. Le badge, les chaussures fermees, le gilet. Aucune visite ne commence sans les trois.',
    contact: 'accueil@secondevie-tri.fr',
  },
  {
    cle: 'quai',
    nom: 'Quai de dechargement',
    forme: 'M40 80h260v190H40Z',
    etiquette: [70, 180] as const,
    horaires: 'Bennes recues de 6 h a 14 h',
    texte: 'Quatre portes, une fosse de neuf cents metres cubes. Une benne de collecte s y vide en sept minutes.',
    contact: 'quai@secondevie-tri.fr',
  },
  {
    cle: 'halle',
    nom: 'Halle de tri',
    forme: 'M330 80h430v340H330Z',
    etiquette: [360, 250] as const,
    horaires: 'Deux equipes, 5 h — 13 h et 13 h — 21 h',
    texte: 'Cent dix metres de convoyeurs, sept postes, soixante mille tonnes par an. C est la que passe tout ce que vous mettez dans le bac jaune.',
    contact: 'exploitation@secondevie-tri.fr',
  },
  {
    cle: 'pedago',
    nom: 'Salle pedagogique',
    forme: 'M220 300h80v120h-80Z',
    etiquette: [222, 290] as const,
    horaires: 'Groupes le mardi et le jeudi',
    texte: 'Trente places, une passerelle vitree au-dessus de la cabine. Les classes de CM1 y viennent depuis 2011.',
    contact: 'visites@secondevie-tri.fr',
  },
  {
    cle: 'balles',
    nom: 'Stockage des balles',
    forme: 'M790 80h170v340H790Z',
    etiquette: [806, 250] as const,
    horaires: 'Enlevements du lundi au vendredi',
    texte: 'Les balles pressees attendent le camion : une balle de PET pese trois cents kilos et fait un metre cube.',
    contact: 'logistique@secondevie-tri.fr',
  },
] as const

/**
 * Le plan du site (A17) : on clique l endroit qui vous concerne.
 *
 * Chaque zone est un bouton, pas une image cliquable : au clavier, on passe
 * de l une a l autre et le panneau suit. C est ce qui distingue un plan d une
 * carte postale.
 */
function PlanDuSite(): ReactElement {
  const [zone, setZone] = useState<string>('pedago')
  const choisie = ZONES.find((z) => z.cle === zone) ?? ZONES[0]

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-14">
      <div className="o-min-w-0 lg:o-col-span-7">
        <svg viewBox="0 0 1000 510" className="o-h-auto o-w-full" role="img" aria-label="Plan du centre de tri : le quai, la halle, l accueil, la salle pedagogique et le stockage">
          {/* Le terrain et la voirie. */}
          <path d="M8 8h984v492H8Z" fill="none" stroke={accentDoux(900, 18)} strokeWidth="1" strokeDasharray="6 8" />
          <path d="M8 452h984" stroke={accentDoux(900, 22)} strokeWidth="2" />
          <text x="16" y="478" fontSize="14" fill="currentColor" opacity="0.5" style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}>
            ROUTE DEPARTEMENTALE 14
          </text>

          {ZONES.map((z) => {
            const active = z.cle === zone
            return (
              <g key={z.cle}>
                <path
                  d={z.forme}
                  fill={active ? accentDoux(400, 40) : accentDoux(500, 10)}
                  stroke={active ? encre() : accentDoux(900, 26)}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                <text
                  x={z.etiquette[0]}
                  y={z.etiquette[1]}
                  fontSize="14"
                  fill="currentColor"
                  opacity={active ? 1 : 0.6}
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}
                >
                  {z.nom.toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>

        <ul className="o-m-0 o-mt-6 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
          {ZONES.map((z) => (
            <li key={z.cle}>
              <button
                type="button"
                aria-pressed={z.cle === zone}
                onClick={() => {
                  setZone(z.cle)
                }}
                className="o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
                style={
                  z.cle === zone
                    ? { ...aplat(), borderColor: 'transparent' }
                    : { borderColor: 'var(--o-theme-line)', color: 'var(--o-theme-muted)' }
                }
              >
                {z.nom}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="o-min-w-0 lg:o-col-span-5" aria-live="polite">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
          {choisie.horaires}
        </p>
        <h3 className="o-m-0 o-mt-4" style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3.2vw, 2.75rem)', lineHeight: 1 }}>
          {choisie.nom}
        </h3>
        <p className="o-m-0 o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {choisie.texte}
        </p>
        <p className="o-m-0 o-mt-8">
          <a
            href={`mailto:${choisie.contact}`}
            className="o-inline-flex o-items-center o-gap-2 o-text-sm o-no-underline focus:o-ring"
            style={{ color: encre() }}
          >
            {choisie.contact}
            <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
          </a>
        </p>
      </div>
    </div>
  )
}

/* ============================ Les pictogrammes du pied ================= */

/** Les quatre gestes, dessines (P27). */
const GESTES = [
  {
    mot: 'En vrac',
    legende: 'Jamais de sac ferme : la chaine ne l ouvre pas, et le sac part au refus avec tout ce qu il contient.',
    dessin: (
      <g>
        <path d="M14 46h52v28H14Z" />
        <path d="M22 46V30h36v16" />
        <path d="M30 22h20v8H30Z" />
      </g>
    ),
  },
  {
    mot: 'Non imbrique',
    legende: 'Un pot dans une boite ne sera lu que comme une boite. Chaque chose seule, et chacune sera vue.',
    dessin: (
      <g>
        <path d="M12 34h28v40H12Z" />
        <path d="M48 20h24v54H48Z" />
        <path d="M44 62h-4" />
      </g>
    ),
  },
  {
    mot: 'Bouchon visse',
    legende: 'Visse, il suit sa bouteille. Seul, il fait deux grammes et tombe dans les fines : c est du plastique perdu.',
    dessin: (
      <g>
        <path d="M30 34h20v34a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6Z" />
        <path d="M32 22h16v12H32Z" />
        <path d="M34 14h12v8H34Z" />
      </g>
    ),
  },
  {
    mot: 'Pas de verre',
    legende: 'Le verre a son conteneur. Ici, il casse, raye les optiques et blesse en cabine de tri.',
    dessin: (
      <g>
        <path d="M28 28h24v40a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8Z" />
        <path d="M34 16h12v12H34Z" />
        <path d="M16 16 64 76" />
      </g>
    ),
  },
] as const

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#halle', 'La halle'],
  ['#tri', 'Le tri'],
  ['#annee', 'L annee'],
  ['#plan', 'Venir'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('onest')
  useFeuilleTri()
  const { reduced } = useMotionState()

  return (
    <Porte forme="compteur" marque="Seconde Vie" sombre={false}>
      <div className="o-relative o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50" style={polices}>
        <BarreFilet marque="Seconde Vie" liens={NAVIGATION} action={['#plan', 'Visiter']} sombre={false} />

        {/* ================= L ouverture : la gouttiere =================== */}
        <header className="o-relative o-flex o-flex-col o-justify-center o-px-6 o-pb-16 o-pt-20 md:o-px-12" style={{ minHeight: ECRAN }}>
          <div className="o-mx-auto o-w-full o-max-w-7xl">
            <Surgit>
              <Etiquette sombre={false}>Centre de tri — 60 000 tonnes par an, 214 communes</Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              className="o-m-0 o-mt-8 o-max-w-5xl"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.6rem, 7.6vw, 7.5rem)', lineHeight: 0.9 }}
            >
              Ce que vous jetez traverse sept machines en quatre minutes.
            </TitreVague>

            <div className="o-mt-14 o-grid o-gap-10 md:o-grid-cols-12">
              <Surgit delai={520} as="p" className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5">
                Un aimant, un rotor, un spectrometre et deux paires d yeux. Chaque machine ne sait faire
                qu une chose, et c est en les mettant bout a bout qu on separe huit matieres.
              </Surgit>

              <Surgit delai={640} className="md:o-col-span-4 md:o-col-start-7 md:o-ml-auto md:o-w-full">
                <dl className="o-m-0">
                  {(
                    [
                      ['Entre', '60 000 t par an'],
                      ['Ressort trie', '46 800 t'],
                      ['Part de refus', '22 %'],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div key={quoi} className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-py-3">
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">{quoi}</dt>
                      <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums">{valeur}</dd>
                    </div>
                  ))}
                </dl>
              </Surgit>
            </div>

            <Surgit delai={760} className="o-mt-12 o-flex o-flex-wrap o-items-center o-gap-4">
              <a
                href="#tri"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                style={aplat()}
              >
                Jeter un objet <Icon icon={ArrowDown} size={15} aria-hidden="true" />
              </a>
              <a
                href="#halle"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-colors hover:o-bg-zinc-100 dark:hover:o-bg-zinc-900 focus:o-ring"
              >
                Traverser la halle
              </a>
            </Surgit>
          </div>
        </header>

        {/* ================= Le manifeste surligne ======================== */}
        <section className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-12 md:o-py-32">
          <div className="o-mx-auto o-max-w-5xl">
            <p className="o-m-0 o-text-balance" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 3.8vw, 3.25rem)', lineHeight: 1.14 }}>
              Une erreur de tri ne se rattrape pas plus loin.{' '}
              <HighlightSweep colour={accentDoux(400, 70)} thickness={0.42} duration={900} delay={300}>
                Ce qui entre mal ressort en refus
              </HighlightSweep>
              , et le refus part bruler a cent vingt kilometres.
            </p>
          </div>
        </section>

        {/* ================= La halle, en diorama lateral ================= */}
        <section id="halle" className="o-scroll-mt-24" style={nuit('zinc')}>
          <Profondeur
            ecrans={4}
            actes={POSTES.length}
            course={220}
            sens="x"
            glisse={0.74}
            hud={(acte) => {
              const poste = (POSTES[acte] ?? POSTES[0]) as Poste
              return (
                <div className="o-flex o-h-full o-flex-col o-gap-10 o-px-6 o-pb-10 o-pt-10 md:o-px-12">
                  <div className="o-flex o-items-start o-justify-between o-gap-6">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      La halle — cent dix metres de convoyeurs
                    </p>
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums" style={{ color: encreSurSombre() }}>
                      {poste.rang} / {String(POSTES.length).padStart(2, '0')}
                    </p>
                  </div>
                  <div className="o-max-w-xl">
                    <h2 className="o-m-0 o-text-balance o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.8rem, 4.6vw, 4rem)', lineHeight: 0.96 }}>
                      {poste.nom}
                    </h2>
                    <p className="o-m-0 o-mt-5 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300">{poste.principe}</p>
                    <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      Debit nominal — {poste.debit}
                    </p>
                  </div>
                </div>
              )
            }}
          >
            <Couche profondeur={0} className="o-bg-zinc-950">
              <div className="o-absolute o-inset-0" style={{ background: `radial-gradient(64% 58% at 40% 26%, ${accentDoux(800, 26)}, transparent 72%)` }} />
            </Couche>

            {/* Les fermes de la charpente, au fond. Chaque bande est plus large
                que l ecran, et sa profondeur vaut exactement la course qu elle
                doit parcourir : sans cela, le decor sort du cadre au tiers. */}
            <Couche profondeur={0.44} derive={16}>
              <svg viewBox="0 0 2400 500" preserveAspectRatio="none" className="o-h-full" style={{ width: '196vw' }} aria-hidden="true">
                {Array.from({ length: 14 }, (_, rang) => (
                  <g key={rang}>
                    <path d={`M${String(60 + rang * 180)} 500V120`} stroke={accentDoux(200, 20)} strokeWidth="3" />
                    <path d={`M${String(60 + rang * 180)} 120 ${String(150 + rang * 180)} 74 ${String(240 + rang * 180)} 120`} fill="none" stroke={accentDoux(200, 22)} strokeWidth="3" />
                  </g>
                ))}
              </svg>
            </Couche>

            {/* Les machines, au plan moyen : sept elevations sur trois ecrans
                et demi de large. */}
            <Couche profondeur={0.48} derive={26} className="o-flex o-items-end">
              <div className="o-flex o-shrink-0 o-items-end" style={{ gap: '4vw', marginBottom: '9%' }}>
                {POSTES.map((poste) => (
                  <Machine key={poste.cle} poste={poste} />
                ))}
              </div>
            </Couche>

            {/* Le convoyeur, devant les machines. */}
            <Couche profondeur={0.64} derive={34} className="o-flex o-items-end">
              <svg viewBox="0 0 2000 90" preserveAspectRatio="none" className="o-shrink-0" style={{ width: '240vw', height: 74, marginBottom: '7%' }} aria-hidden="true">
                <path d="M0 44h2000" stroke={accentDoux(200, 26)} strokeWidth="14" />
                <path data-o-tr-tapis={reduced ? undefined : ''} d="M0 44h2000" stroke={accent(400)} strokeWidth="3" strokeDasharray="12 16" />
              </svg>
            </Couche>

            {/* La passerelle, au premier plan. */}
            <Couche profondeur={0.73} derive={48} className="o-flex o-items-end">
              <svg viewBox="0 0 2200 120" preserveAspectRatio="none" className="o-shrink-0" style={{ width: '262vw', height: 120 }} aria-hidden="true">
                <path d="M0 96h2200" stroke={accentDoux(200, 34)} strokeWidth="8" />
                <path d="M0 40h2200" stroke={accentDoux(200, 22)} strokeWidth="4" />
                {Array.from({ length: 30 }, (_, rang) => (
                  <path key={rang} d={`M${String(30 + rang * 76)} 96V40`} stroke={accentDoux(200, 20)} strokeWidth="4" />
                ))}
              </svg>
            </Couche>
          </Profondeur>
        </section>

        {/* ================= Le mecanisme : le tri ======================== */}
        <section id="tri" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-12 md:o-py-32">
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="o-min-w-0 md:o-col-span-8">
                <Reveal>
                  <Indice rang="01" sombre={false}>
                    Le tri
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2 className="o-m-0 o-mt-5 o-max-w-3xl o-text-balance" style={{ ...affiche('m', 300), fontSize: 'clamp(1.9rem, 4.4vw, 4rem)', lineHeight: 0.96 }}>
                    Chaque machine ne sait faire qu une chose.
                  </h2>
                </Reveal>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                Huit objets, sept postes
                <br />
                et une raison a chaque fois
              </p>
            </div>
            <div className="o-mt-16">
              <Chaine />
            </div>
          </div>
        </section>

        {/* ================= La seconde vie, en cartes ==================== */}
        <section className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-12 md:o-py-32" style={{ backgroundColor: accentDoux(500, 6) }}>
          <div className="o-mx-auto o-grid o-max-w-7xl o-gap-14 lg:o-grid-cols-12 lg:o-items-center">
            <div className="o-min-w-0 lg:o-col-span-5">
              <Reveal>
                <Indice rang="02" sombre={false}>
                  La seconde vie
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="o-m-0 o-mt-5 o-max-w-md o-text-balance" style={{ ...affiche('m', 300), fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', lineHeight: 0.96 }}>
                  Une balle de PET part le mardi et revient en bouteille en huit semaines.
                </h2>
              </Reveal>
              <BeamConnect curvature={54} speed={2600} thickness={2} color={accent(500)} className="o-mt-10 o-flex o-items-center o-justify-between o-gap-6">
                <span data-beam="from" className="o-inline-flex o-items-center o-gap-2 o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-4 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                  Bac jaune
                </span>
                <span data-beam="to" className="o-inline-flex o-items-center o-gap-2 o-px-4 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={aplat()}>
                  Bouteille neuve
                </span>
              </BeamConnect>
              <p className="o-m-0 o-mt-8 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Huit semaines, trois cent vingt kilometres, et une perte de matiere de huit pour cent a chaque
                tour. Un plastique n est pas eternel : il descend d un usage a l autre.
              </p>
            </div>

            <div className="o-relative o-min-w-0 lg:o-col-span-7">
              <div className="o-mx-auto" style={{ maxWidth: 460 }}>
                <CardSwap interval={3400} duration={700} offset={18}>
                  {(
                    [
                      ['PET clair', 'Paillette lavee', 'Fibre polyester pour doublure et rembourrage, ou bouteille neuve si la qualite tient.'],
                      ['Acier etame', 'Ferraille', 'Refondu au four electrique. Un acier peut repasser indefiniment sans perdre ses proprietes.'],
                      ['Carton et brique', 'Fibre longue', 'Desencree, puis papier d essuyage. La fibre raccourcit a chaque tour : sept passages au plus.'],
                    ] as const
                  ).map(([matiere, etat, texte]) => (
                    <div
                      key={matiere}
                      className="o-flex o-h-full o-flex-col o-justify-between o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-p-8"
                      style={{ minHeight: 280, backgroundColor: 'var(--o-theme-bg)' }}
                    >
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encre() }}>
                        {matiere}
                      </p>
                      <p className="o-m-0 o-mt-6" style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', lineHeight: 1 }}>
                        {etat}
                      </p>
                      <p className="o-m-0 o-mt-6 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">{texte}</p>
                    </div>
                  ))}
                </CardSwap>
              </div>
            </div>
          </div>
        </section>

        {/* ================= La carte de chaleur ========================== */}
        <section id="annee" className="o-scroll-mt-24 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-12 md:o-py-32">
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="o-min-w-0 md:o-col-span-7">
                <Reveal>
                  <Indice rang="03" sombre={false}>
                    L annee
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2 className="o-m-0 o-mt-5 o-max-w-2xl o-text-balance" style={{ ...affiche('m', 300), fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', lineHeight: 0.96 }}>
                    Le carton en decembre, l aluminium en juillet.
                  </h2>
                </Reveal>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                Huit flux sur douze mois
                <br />
                chaque ligne graduee sur son maximum
              </p>
            </div>
            <div className="o-mt-14">
              <CarteDeChaleur />
            </div>
          </div>
        </section>

        {/* ================= Le plan du site ============================== */}
        <section id="plan" className="o-scroll-mt-24 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-12 md:o-py-32">
          <div className="o-mx-auto o-max-w-7xl">
            <Reveal>
              <Indice rang="04" sombre={false}>
                Venir
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="o-m-0 o-mt-5 o-max-w-2xl o-text-balance" style={{ ...affiche('m', 300), fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', lineHeight: 0.96 }}>
                Cliquez l endroit qui vous concerne.
              </h2>
            </Reveal>
            <div className="o-mt-14">
              <PlanDuSite />
            </div>
          </div>
        </section>

        {/* ================= Le pied : quatre pictogrammes ================ */}
        <footer className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-16 md:o-px-12">
          <div className="o-mx-auto o-max-w-7xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Quatre gestes, et la chaine fait le reste
            </p>
            <ul className="o-m-0 o-mt-10 o-grid o-list-none o-gap-10 o-p-0 sm:o-grid-cols-2 lg:o-grid-cols-4">
              {GESTES.map((geste) => (
                <li key={geste.mot} className="o-min-w-0">
                  <svg viewBox="0 0 80 88" className="o-h-auto" style={{ width: 64 }} aria-hidden="true" fill="none" stroke={encre()} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
                    {geste.dessin}
                  </svg>
                  <p className="o-m-0 o-mt-5 o-text-lg o-font-medium o-tracking-tight">{geste.mot}</p>
                  <p className="o-m-0 o-mt-2 o-max-w-xs o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">{geste.legende}</p>
                </li>
              ))}
            </ul>

            <div className="o-mt-16 o-flex o-flex-wrap o-items-center o-justify-between o-gap-6 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-6">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Seconde Vie — route departementale 14, 27400 Heudebouville — syndicat mixte de 214 communes
              </p>
              <nav aria-label="Rubriques" className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2">
                {(
                  [
                    ['#tri', 'Le tri'],
                    ['#annee', 'Les tonnages'],
                    ['#plan', 'Visiter'],
                    ['mailto:visites@secondevie-tri.fr', 'Ecrire'],
                  ] as const
                ).map(([cible, mot]) => (
                  <a key={mot} href={cible} className="o-inline-flex o-items-center o-gap-1 o-text-sm o-no-underline o-text-zinc-600 dark:o-text-zinc-400 o-transition-colors hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring">
                    {mot}
                    <Icon icon={ArrowRight} size={13} aria-hidden="true" />
                  </a>
                ))}
              </nav>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">© 2026</p>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
