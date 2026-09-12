/**
 * Paire 44 — sortie limitee.
 *
 * ## Le parti pris : l affiche, puis le coloris
 *
 * Une sortie limitee, ca s annonce comme un concert : une affiche placardee,
 * pas une page de boutique. L ouverture est un panneau centre, pose sur un
 * mur de LED qui respire tout autour de lui — le nom du modele en tres gros,
 * le « 44 » extrude en volume, le coloris en dessous, le compte a rebours en
 * dessous encore, et un seul bouton, aimante, pour finir.
 *
 * Ce qui suit tient en quatre ecrans, et chacun a sa forme : les coloris
 * (un clic reteinte toute la page, du mur de LED au pied), le carrousel des
 * cinq angles sur l aplat clair, la demande « prevenez-moi » sur un bloc
 * d accent, et un pied qui est un plan de Nantes dessine, avec ses lignes de
 * tramway.
 *
 * ## Ce que la page fait, et pas seulement montre
 *
 * Le coloris est un vrai choix : il reecrit les onze nuances de la vitrine,
 * et les pieces de la librairie — le mur de LED, la bichromie de la photo,
 * les aplats — le suivent sans une ligne de plus. La pointure retenue dans
 * le bloc d alerte est reprise dans le message envoye ; les pointures closes
 * y sont barrees, pas cachees.
 *
 * ## Aucun chiffre mis en scene
 *
 * Pas de stock affiche, pas de barre de quatre nombres, pas de table des
 * sorties passees : une sortie limitee se vend sur l heure, pas sur les
 * statistiques. Seul le compte a rebours est un chiffre, et il bouge.
 *
 * ## La couleur
 *
 * Rien n est ecrit en dur. Les deux aplats sont construits par melange —
 * l accent ramene vers le blanc pour la bande claire, vers le noir pour la
 * bande profonde — et leurs encres tiennent alors pour tout l intervalle.
 * Quand un coloris est choisi, c est {@link variablesDePalette} qui recalcule
 * l echelle, exactement comme le fait la barre de la documentation.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { Bell, MessageSquare, Mail, SportShoe, Ticket } from '@odoro-cli/icons/filaire'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { LedWall } from '@/odoro/background/LedWall.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { StickyCursor } from '@/odoro/effect/StickyCursor.jsx'
import { useIntervalClock } from '@/odoro/hooks/useIntervalClock'
import { Duotone } from '@/odoro/image/Duotone.jsx'
import { DepthText } from '@/odoro/text/DepthText.jsx'
import { DepthCarousel } from '@/odoro/ui/DepthCarousel.jsx'

import { nuit } from './communs.jsx'
import { affiche as image, photo } from './media.js'
import { accent, variablesDePalette, type Couleurs } from './palettes.js'
import { affiche, Autocollant, Croix, Porte, Surgit, usePolices } from './marche.jsx'
import { Aimant, Respire } from './scene.jsx'

/**
 * L heure de la mise en vente.
 *
 * Elle est ecrite en dur : une vitrine doit montrer un compte a rebours qui
 * tourne, pas une date passee calculee au chargement.
 */
const OUVERTURE = '2026-11-14T18:00:00+01:00'

/**
 * Les cinq coloris de la sortie.
 *
 * Le premier n a pas de palette : c est celle de la barre, ce qui laisse la
 * documentation reteinter la page. Les quatre autres en imposent une, et la
 * page entiere la suit.
 */
const COLORIS: readonly { readonly cle: string; readonly nom: string; readonly matiere: string; readonly couleurs?: Couleurs }[] = [
  { cle: 'cendre', nom: 'Cendre', matiere: 'daim cendre, tirant tisse' },
  { cle: 'mousse', nom: 'Mousse', matiere: 'daim vert mousse, tirant ecru', couleurs: ['#4d7c0f', '#0a0a0a', '#d9f99d'] },
  { cle: 'brique', nom: 'Brique', matiere: 'nubuck brique, tirant noir', couleurs: ['#c2410c', '#0a0a0a', '#fed7aa'] },
  { cle: 'encre', nom: 'Encre', matiere: 'daim bleu d encre, tirant gris', couleurs: ['#1d4ed8', '#0a0a0a', '#bfdbfe'] },
  { cle: 'sel', nom: 'Sel', matiere: 'daim gris sel, tirant blanc', couleurs: ['#78716c', '#0a0a0a', '#fafaf9'] },
]

/** Les pointures de la serie ; deux sont deja closes. */
const POINTURES: readonly { readonly taille: string; readonly close: boolean }[] = [
  { taille: '39', close: false },
  { taille: '40', close: false },
  { taille: '41', close: true },
  { taille: '42', close: false },
  { taille: '43', close: false },
  { taille: '44', close: false },
  { taille: '45', close: false },
  { taille: '46', close: true },
]

/** Le jour dit, en trois temps. */
const JOUR_DIT: readonly { readonly heure: string; readonly texte: string }[] = [
  { heure: '17h50', texte: 'Un seul message part, avec le lien direct et la pointure retenue.' },
  { heure: '18h00', texte: 'Vingt minutes pour deposer. L ordre d arrivee ne compte pas.' },
  { heure: '18h21', texte: 'Le tirage est rendu. Les perdants ne sont jamais debites.' },
]

/** La matiere, en bandeau. */
const MATIERE: readonly string[] = [
  'daim cendre',
  'mesh recycle',
  'semelle injectee',
  'contrefort thermocolle',
  'gomme hexagonale',
  'une par personne',
  'tirage au sort',
  'expedie de Nantes',
]

/** Les quatre paliers du compte a rebours, du plus grand au plus petit. */
const PALIERS = [
  { cle: 'j', libelle: 'jours', diviseur: 86_400_000 },
  { cle: 'h', libelle: 'heures', diviseur: 3_600_000 },
  { cle: 'm', libelle: 'minutes', diviseur: 60_000 },
  { cle: 's', libelle: 'secondes', diviseur: 1000 },
] as const

/** Le corps des trois lignes de l affiche, du plus grand au plus petit. */
const CORPS_MODELE: CSSProperties = { fontSize: 'clamp(3.25rem, 16vw, 10rem)', lineHeight: 0.86, letterSpacing: '-0.05em' }
const CORPS_COULEUR: CSSProperties = { fontSize: 'clamp(1.75rem, 9vw, 5rem)', lineHeight: 0.95 }
const CORPS_REBOURS: CSSProperties = { fontSize: 'clamp(1.5rem, 7vw, 3.75rem)', lineHeight: 1 }

/**
 * Les deux aplats de l affiche, et leur encre.
 *
 * La barre laisse choisir **n importe quelle** couleur d accent : une nuance
 * de l echelle posee telle quelle serait tantot claire, tantot sombre, et
 * l encre ne pourrait pas etre decidee d avance. Les deux aplats sont donc
 * construits par melange — l accent ramene vers le blanc pour la bande claire,
 * vers le noir pour la bande profonde. Aux proportions retenues, l encre
 * zinc-950 tient 4,6:1 sur la premiere et l encre blanche 6:1 sur la seconde,
 * pour tout l intervalle du blanc au noir.
 */
const FOND_CLAIR = `color-mix(in oklab, ${accent(500)} 42%, white)`
const FOND_PROFOND = `color-mix(in oklab, ${accent(500)} 50%, black)`

const APLAT_CLAIR: CSSProperties = {
  backgroundColor: FOND_CLAIR,
  color: 'var(--o-palette-zinc-950)',
}
const APLAT_PROFOND: CSSProperties = {
  backgroundColor: FOND_PROFOND,
  color: 'var(--o-palette-white)',
}

/** L encre secondaire de l aplat clair : l accent ramene vers le noir. */
const ENCRE_SUR_CLAIR: CSSProperties = {
  color: `color-mix(in oklab, ${accent(500)} 30%, black)`,
}

/** L accent tel qu il se lit sur le zinc le plus sombre. */
const VIF = `color-mix(in oklab, ${accent(500)} 40%, white)`
const ENCRE_VIVE: CSSProperties = { color: VIF }

/** La tranche du « 44 » extrude : l accent, assombri, pour que la face reste blanche. */
const TRANCHE = `color-mix(in oklab, ${accent(500)} 55%, var(--o-palette-zinc-950))`

/**
 * Le theme clair, epingle sur la bande d accent clair.
 *
 * Le carrousel lit les variables de theme pour ses legendes et ses boutons :
 * sur un aplat clair tenu dans les deux themes, elles sont redeclarees, avec
 * l encre secondaire qui repond a l aplat.
 */
const ENCRE_CLAIRE = {
  colorScheme: 'light',
  '--o-theme-bg': FOND_CLAIR,
  '--o-theme-surface': 'var(--o-palette-white)',
  '--o-theme-fg': 'var(--o-palette-zinc-950)',
  '--o-theme-muted': `color-mix(in oklab, ${accent(500)} 30%, black)`,
  '--o-theme-line': 'var(--o-palette-zinc-900)',
} as CSSProperties

/** Les filets poses a la main, sur des bandes sombres dans les deux themes. */
const CADRE_AFFICHE: CSSProperties = { borderColor: VIF }
const FILET_PANNEAU: CSSProperties = { borderColor: 'var(--o-palette-zinc-700)' }
const FILET_NUIT: CSSProperties = { borderColor: 'var(--o-palette-zinc-800)' }

/**
 * La lueur du mur de LED, posee sur la section elle-meme.
 *
 * Le repli du mur est une classe, et une classe ne peut pas citer la palette
 * de la vitrine. La lueur est donc peinte sur la section — elle suit l accent
 * — et le repli du mur est laisse transparent.
 */
const LUEUR_AFFICHE: CSSProperties = {
  backgroundImage: `radial-gradient(125% 95% at 50% 108%, color-mix(in oklab, ${accent(500)} 45%, var(--o-palette-zinc-950)), var(--o-palette-zinc-950) 72%)`,
}

/** Repartit un reste de millisecondes sur les quatre paliers. */
function decouper(reste: number): readonly number[] {
  let restant = Math.max(0, reste)
  return PALIERS.map((palier) => {
    const valeur = Math.floor(restant / palier.diviseur)
    restant -= valeur * palier.diviseur
    return valeur
  })
}

/**
 * Le compte a rebours de l affiche.
 *
 * Les chiffres sont decoratifs : c est la date en toutes lettres, juste
 * dessous, qui porte l information. Les annoncer chaque seconde rendrait la
 * page inecoutable.
 */
function Rebours({ date }: { readonly date: string }): ReactElement {
  const { reduced } = useMotionState()
  const cible = useMemo(() => new Date(date).getTime(), [date])
  const [, battre] = useState(0)

  useIntervalClock(
    () => {
      battre((n) => n + 1)
    },
    { interval: 1000, actif: !reduced, name: 'paire 44 : rebours' },
  )

  const valeurs = decouper(cible - Date.now())

  return (
    <p
      aria-hidden="true"
      className="o-m-0 o-flex o-flex-wrap o-items-baseline o-justify-center o-gap-x-3 o-font-mono o-font-bold o-tabular-nums o-tracking-tighter"
      style={{ ...CORPS_REBOURS, ...ENCRE_VIVE }}
    >
      {PALIERS.map((palier, index) => (
        <span key={palier.cle} className="o-whitespace-nowrap">
          {String(valeurs[index] ?? 0).padStart(2, '0')}
          <span className="o-text-base o-font-normal o-text-zinc-400">{palier.cle}</span>
        </span>
      ))}
    </p>
  )
}

/** L affiche : le panneau centre, pose sur le mur de LED. */
function Affiche({ coloris }: { readonly coloris: string }): ReactElement {
  return (
    <section
      aria-label="Paire 44, sortie du 14 novembre 2026"
      className="o-relative o-isolate o-flex o-items-center o-justify-center o-overflow-hidden o-bg-zinc-950 o-p-3 md:o-p-8"
      style={{ minHeight: 'calc(100vh - 7rem)', ...LUEUR_AFFICHE }}
    >
      <LedWall
        aria-hidden="true"
        className="o-absolute o-inset-0 o-z-0"
        pixels={26}
        gap={0.3}
        bloom={0.4}
        speed={0.3}
        // Une liste neuve a chaque rendu : l affiche ne se rend qu au changement
        // de coloris, et c est ce qui fait relire les jetons au mur de LED.
        colors={['--o-vitrine-950', '--o-vitrine-tierce', '--o-vitrine-300']}
        fallback="o-bg-transparent"
      />

      <div
        className="o-relative o-z-10 o-w-full o-max-w-4xl o-border-w-4 o-bg-zinc-950 o-px-4 o-py-10 o-text-center o-text-zinc-50 md:o-px-10 md:o-py-14"
        style={CADRE_AFFICHE}
      >
        <Croix />
        <Surgit as="p" className="o-m-0 o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-font-bold o-uppercase o-tracking-widest" style={ENCRE_VIVE}>
          <Icon icon={SportShoe} size={14} aria-hidden="true" />
          Paire 44 — Nantes — serie de novembre
        </Surgit>

        <Surgit delai={120} as="h1" className="o-m-0 o-mt-6 o-font-bold o-uppercase o-text-zinc-50" style={{ ...CORPS_MODELE, fontFamily: 'var(--o-vitrine-affichage)' }}>
          Paire{' '}
          <DepthText depth={14} step={2} angle={10} speed={8000} couleur={TRANCHE} className="o-align-baseline">
            44
          </DepthText>
        </Surgit>

        <Surgit delai={320} as="p" className="o-m-0 o-mt-3 o-font-bold o-uppercase o-tracking-tight o-text-zinc-300" style={{ ...CORPS_COULEUR, fontFamily: 'var(--o-vitrine-affichage)' }}>
          {coloris}
        </Surgit>

        <Surgit delai={460} className="o-mt-8 o-border-t o-border-b o-py-6" style={FILET_PANNEAU}>
          <Rebours date={OUVERTURE} />
          <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-font-bold o-uppercase o-tracking-widest o-text-zinc-50 md:o-text-sm">
            Depot ouvert le <time dateTime={OUVERTURE}>14 novembre 2026 a 18h00</time>
          </p>
        </Surgit>

        <Surgit delai={600} className="o-mt-8 o-flex o-justify-center">
          <Aimant force={0.45}>
            <a
              href="#depot"
              className="o-inline-flex o-items-center o-gap-2 o-px-7 o-py-4 o-text-sm o-font-bold o-uppercase o-tracking-widest o-no-underline o-transition-opacity hover:o-opacity-90 focus:o-ring"
              style={APLAT_CLAIR}
            >
              <Icon icon={Ticket} size={16} aria-hidden="true" />
              Etre prevenu a l ouverture
            </a>
          </Aimant>
        </Surgit>
      </div>
    </section>
  )
}

/** Un bandeau qui traverse la page de bord a bord. */
function Bande({ mots, inverse }: { readonly mots: readonly string[]; readonly inverse?: boolean }): ReactElement {
  return (
    <div style={APLAT_PROFOND}>
      <Marquee speed={28} fade={4} reverse={inverse} className="o-py-3">
        <ul className="o-m-0 o-flex o-list-none o-items-center o-gap-8 o-p-0 o-pr-8 o-font-mono o-text-xs o-font-bold o-uppercase o-tracking-widest">
          {[...mots, ...mots].map((mot, index) => (
            <li key={`${mot}-${String(index)}`} className="o-whitespace-nowrap">
              {mot}
            </li>
          ))}
        </ul>
      </Marquee>
    </div>
  )
}

/**
 * Le plan de la boutique, dessine.
 *
 * Trois rues, la Loire en bas, les trois lignes de tramway et leurs arrets ;
 * la boutique est le point qui respire. Le dessin est decoratif : l adresse et
 * les lignes sont ecrites a cote, en clair.
 */
function Plan(): ReactElement {
  const arrets: readonly { readonly x: number; readonly y: number; readonly nom: string }[] = [
    { x: 96, y: 128, nom: 'Graslin' },
    { x: 262, y: 168, nom: 'Commerce' },
    { x: 400, y: 150, nom: 'Bouffay' },
    { x: 470, y: 250, nom: 'Duchesse Anne' },
    { x: 180, y: 262, nom: 'Mediatheque' },
  ]
  return (
    <div className="o-relative o-w-full o-overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
      <svg viewBox="0 0 600 400" aria-hidden="true" className="o-absolute o-inset-0 o-size-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* La Loire */}
        <path d="M-10 330 C 120 300, 260 350, 380 320 S 560 290, 620 330 L 620 420 L -10 420 Z" fill="var(--o-palette-zinc-900)" />
        <path d="M-10 330 C 120 300, 260 350, 380 320 S 560 290, 620 330" stroke="var(--o-palette-zinc-700)" strokeWidth="1.5" />
        {/* Les rues */}
        <g stroke="var(--o-palette-zinc-700)" strokeWidth="1.2">
          <path d="M20 60 L 580 40" />
          <path d="M40 200 L 560 190" />
          <path d="M120 20 L 150 300" />
          <path d="M300 10 L 320 310" />
          <path d="M440 30 L 460 300" />
          <path d="M60 110 L 260 130 L 420 100" />
          <path d="M200 240 L 520 260" />
        </g>
        {/* Rue Crebillon, en gras */}
        <path d="M100 140 L 262 168" stroke="var(--o-palette-zinc-400)" strokeWidth="2.5" />
        <text x="126" y="178" fontFamily="var(--o-font-mono)" fontSize="9" fill="var(--o-palette-zinc-400)" letterSpacing="1.5">RUE CREBILLON</text>
        {/* Tramway : ligne 1 */}
        <path d="M-10 120 C 60 118, 80 132, 96 128 S 240 176, 262 168 S 380 140, 400 150 S 560 160, 620 150" stroke={accent(400)} strokeWidth="4" />
        {/* Ligne 2 */}
        <path d="M262 -10 C 262 60, 250 120, 262 168 S 250 240, 300 300 S 330 380, 340 420" stroke="var(--o-palette-zinc-50)" strokeWidth="3" strokeDasharray="10 8" />
        {/* Ligne 3 */}
        <path d="M-10 270 C 80 262, 140 268, 180 262 S 330 250, 400 150 S 480 60, 620 40" stroke="var(--o-palette-zinc-500)" strokeWidth="3" />
        {/* Les arrets */}
        {arrets.map((a) => (
          <g key={a.nom}>
            <circle cx={a.x} cy={a.y} r="6" fill="var(--o-palette-zinc-950)" stroke="var(--o-palette-zinc-50)" strokeWidth="2" />
            <text x={a.x + 11} y={a.y + 3} fontFamily="var(--o-font-mono)" fontSize="9.5" fill="var(--o-palette-zinc-300)" letterSpacing="1">
              {a.nom.toUpperCase()}
            </text>
          </g>
        ))}
        <text x="20" y="386" fontFamily="var(--o-font-mono)" fontSize="9" fill="var(--o-palette-zinc-500)" letterSpacing="1.5">LA LOIRE</text>
      </svg>
      {/* La boutique : un point qui respire, pose en pourcentage du cadre. */}
      <div aria-hidden="true" className="o-pointer-events-none o-absolute" style={{ left: '30.5%', top: '37.5%', transform: 'translate(-50%, -50%)' }}>
        <Respire duree={4} className="o-size-10 o-rounded-full" style={{ backgroundColor: `color-mix(in oklab, ${VIF} 35%, transparent)` }} />
        <span className="o-absolute o-left-1/2 o-top-1/2 o-size-3 o-rounded-full" style={{ backgroundColor: VIF, transform: 'translate(-50%, -50%)' }} />
      </div>
    </div>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('unbounded')
  const [coloris, setColoris] = useState<string>('cendre')
  const [pointure, setPointure] = useState<string | undefined>(undefined)
  const [canal, setCanal] = useState<'sms' | 'courriel'>('sms')

  const choisi = COLORIS.find((c) => c.cle === coloris) ?? COLORIS[0]
  const palette = choisi?.couleurs === undefined ? {} : variablesDePalette(choisi.couleurs)

  const angles = [
    { ...image('paire44-profil', 'La Paire 44 vue de profil, semelle claire'), caption: 'Profil gauche — semelle intermediaire injectee' },
    { ...image('paire44-dessus', 'La Paire 44 vue de dessus, lacage plat'), caption: 'Dessus — lacage plat, huit oeillets' },
    { ...image('paire44-talon', 'Contrefort de la Paire 44, tirant colore'), caption: 'Contrefort — tirant tisse, thermocolle' },
    { ...image('paire44-semelle', 'Les deux semelles exterieures de la Paire 44, posees a plat'), caption: 'Semelle — gomme hexagonale' },
    { ...image('paire44-detail', 'Detail du daim et de la surpiqure de la Paire 44'), caption: 'Detail — daim, surpiqure apparente' },
  ]

  return (
    <Porte forme="zoom" marque="Paire 44">
      <div className="o-text-zinc-50" style={{ ...nuit('zinc'), ...polices, ...palette }}>
        {/* M-aimant : la pastille du curseur colle a tout ce qui se clique. */}
        <StickyCursor color={VIF} size={22} padding={10} stick={0.2} />

        <main>
          <Affiche coloris={choisi?.nom ?? 'Cendre'} />

          <Bande mots={MATIERE} />

          {/* ================= (01) Le coloris : un clic reteinte la page ================= */}
          <section id="coloris" className="o-relative o-z-10 o-scroll-mt-24 o-px-6 o-pb-0 o-pt-20 md:o-pt-28">
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 md:o-grid-cols-12 md:o-gap-8">
              <div className="md:o-col-span-5">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">(01) — Le coloris</p>
                <h2 className="o-m-0 o-mt-5 o-uppercase o-text-zinc-50" style={{ ...affiche('l', 800), fontSize: 'clamp(2.75rem, 7vw, 6.5rem)', lineHeight: 0.88 }}>
                  Cinq coloris. Un seul tirage.
                </h2>
                <div className="o-mt-8 o-inline-block">
                  <Autocollant angle={-5}>Cliquez : toute la page change</Autocollant>
                </div>

                <div role="group" aria-label="Choisir un coloris" className="o-mt-10 o-flex o-flex-wrap o-gap-4">
                  {COLORIS.map((c, rang) => {
                    const actif = c.cle === coloris
                    const teinte = c.couleurs === undefined ? accent(500) : c.couleurs[0]
                    return (
                      <Aimant key={c.cle} force={0.3}>
                        <button
                          type="button"
                          aria-pressed={actif}
                          onClick={() => {
                            setColoris(c.cle)
                          }}
                          className="o-flex o-size-20 o-cursor-pointer o-flex-col o-items-start o-justify-end o-rounded-none o-border-w-2 o-p-2 o-text-left o-transition-transform hover:o-scale-105 focus:o-ring"
                          style={{
                            backgroundColor: teinte,
                            borderColor: actif ? 'var(--o-palette-zinc-50)' : 'transparent',
                            transform: `rotate(${String((rang % 2 === 0 ? -1 : 1) * (2 + rang))}deg)`,
                          }}
                        >
                          <span className="o-font-mono o-text-xs o-font-bold o-uppercase o-tracking-widest" style={{ color: 'var(--o-palette-zinc-950)', backgroundColor: 'var(--o-palette-white)', padding: '2px 4px' }}>
                            {c.nom}
                          </span>
                        </button>
                      </Aimant>
                    )
                  })}
                </div>

                <p aria-live="polite" className="o-m-0 o-mt-8 o-max-w-sm o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                  Coloris {choisi?.nom} — {choisi?.matiere}.
                </p>
              </div>

              {/* La photo reteintee, qui chevauche la bande suivante. */}
              <div className="o-relative o-z-10 md:o-col-span-7 md:o-self-end" style={{ marginBottom: '-7rem' }}>
                <div className="o-relative">
                  <Duotone
                    key={coloris}
                    src={photo('paire44-profil')}
                    alt={`La Paire 44 en coloris ${choisi?.nom ?? 'Cendre'}, vue de profil`}
                    ratio={1.15}
                    hover={false}
                    strength={0.85}
                    shadow={accent(950)}
                    light={accent(200)}
                    className="o-w-full"
                  />
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-absolute md:o-right-full md:o-top-24 md:o-mr-4 md:o-mt-0 md:o-w-32 md:o-text-right">
                    Paire de reference, taille 42, non portee
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================= (02) Le carrousel, sur l aplat clair ================= */}
          <section id="angles" className="o-relative o-z-0 o-px-6 o-pb-20 o-pt-40 md:o-pb-28 md:o-pt-48" style={{ ...APLAT_CLAIR, ...ENCRE_CLAIRE }}>
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={ENCRE_SUR_CLAIR}>(02) — Cinq angles, aucun rendu de synthese</p>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={ENCRE_SUR_CLAIR}>Feuilletez, ou glissez</p>
              </div>
              <div className="o-mt-10 o-w-full o-overflow-hidden">
                <DepthCarousel
                  items={angles}
                  label="La Paire 44 sous cinq angles"
                  defaultIndex={2}
                  width={300}
                  spread={160}
                  depth={180}
                  tilt={28}
                  visible={2}
                />
              </div>
            </div>
          </section>

          {/* ================= (03) A14 : prevenez-moi, sur le bloc d accent ================= */}
          <section id="depot" className="o-relative o-scroll-mt-24 o-px-6 o-py-20 md:o-py-28" style={APLAT_PROFOND}>
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-14 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <p className="o-m-0 o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-opacity-80">
                  <Icon icon={Bell} size={14} aria-hidden="true" />
                  (03) — Un seul message, dix minutes avant
                </p>
                <h2 className="o-m-0 o-mt-5 o-uppercase" style={{ ...affiche('xl', 800), fontSize: 'clamp(2.75rem, 8vw, 7rem)', lineHeight: 0.86 }}>
                  Prevenez-<br />moi.
                </h2>

                <form
                  className="o-mt-10 o-max-w-xl"
                  onSubmit={(evenement) => {
                    evenement.preventDefault()
                  }}
                >
                  <div role="group" aria-label="Par quel canal" className="o-flex o-gap-2">
                    {(
                      [
                        ['sms', 'SMS', MessageSquare],
                        ['courriel', 'Courriel', Mail],
                      ] as const
                    ).map(([cle, mot, icone]) => {
                      const actif = canal === cle
                      return (
                        <button
                          key={cle}
                          type="button"
                          aria-pressed={actif}
                          onClick={() => {
                            setCanal(cle)
                          }}
                          className="o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-border-w-2 o-px-4 o-py-2 o-font-mono o-text-xs o-font-bold o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
                          style={actif ? { backgroundColor: 'var(--o-palette-white)', color: 'var(--o-palette-zinc-950)', borderColor: 'var(--o-palette-white)' } : { borderColor: 'color-mix(in oklab, white 40%, transparent)', color: 'var(--o-palette-white)' }}
                        >
                          <Icon icon={icone} size={14} aria-hidden="true" />
                          {mot}
                        </button>
                      )
                    })}
                  </div>

                  <label className="o-mt-8 o-block">
                    <span className="o-sr-only">{canal === 'sms' ? 'Numero de telephone' : 'Adresse electronique'}</span>
                    <input
                      type={canal === 'sms' ? 'tel' : 'email'}
                      name={canal}
                      autoComplete={canal === 'sms' ? 'tel' : 'email'}
                      placeholder={canal === 'sms' ? '06 12 34 56 78' : 'vous@exemple.fr'}
                      required
                      className="o-w-full o-bg-transparent o-py-4 o-font-mono o-text-2xl o-text-white focus:o-ring md:o-text-3xl"
                      style={{ borderRadius: 0, border: 0, borderBottom: '2px solid var(--o-palette-white)' }}
                    />
                  </label>

                  <fieldset className="o-mt-8 o-border-none o-p-0">
                    <legend className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-opacity-80">Votre pointure — le 41 et le 46 sont clos</legend>
                    <div className="o-mt-3 o-flex o-flex-wrap o-gap-2">
                      {POINTURES.map((p) => {
                        const retenue = p.taille === pointure
                        return (
                          <button
                            key={p.taille}
                            type="button"
                            disabled={p.close}
                            aria-pressed={retenue}
                            onClick={() => {
                              setPointure(p.taille)
                            }}
                            className={`o-size-12 o-border-w-2 o-font-mono o-text-base o-font-bold o-tabular-nums o-transition-colors focus:o-ring ${p.close ? 'o-cursor-not-allowed o-line-through o-opacity-50' : 'o-cursor-pointer'}`}
                            style={retenue ? { backgroundColor: 'var(--o-palette-white)', color: 'var(--o-palette-zinc-950)', borderColor: 'var(--o-palette-white)' } : { borderColor: 'color-mix(in oklab, white 40%, transparent)', color: 'var(--o-palette-white)' }}
                          >
                            {p.taille}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div className="o-mt-10 o-flex o-flex-wrap o-items-center o-gap-5">
                    <Aimant force={0.4}>
                      <button
                        type="submit"
                        className="o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-px-7 o-py-4 o-font-mono o-text-sm o-font-bold o-uppercase o-tracking-widest o-transition-opacity hover:o-opacity-90 focus:o-ring"
                        style={{ backgroundColor: 'var(--o-palette-white)', color: 'var(--o-palette-zinc-950)' }}
                      >
                        M alerter le 14 novembre
                      </button>
                    </Aimant>
                    <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-opacity-80">
                      {pointure === undefined ? 'Aucune pointure retenue' : `Pointure ${pointure} retenue`} — coloris {choisi?.nom}. Adresse effacee le 22 novembre.
                    </p>
                  </div>
                </form>
              </div>

              <div aria-hidden="true" className="o-hidden md:o-col-span-1 md:o-block" />
              <aside className="md:o-col-span-4">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-opacity-80">Le jour dit</p>
                <ol className="o-m-0 o-mt-5 o-list-none o-border-t o-p-0" style={{ borderColor: 'color-mix(in oklab, white 30%, transparent)' }}>
                  {JOUR_DIT.map((t) => (
                    <li key={t.heure} className="o-grid o-grid-cols-12 o-gap-3 o-border-b o-py-4" style={{ borderColor: 'color-mix(in oklab, white 30%, transparent)' }}>
                      <span className="o-col-span-3 o-font-mono o-text-sm o-font-bold o-tabular-nums">{t.heure}</span>
                      <span className="o-col-span-9 o-text-sm o-leading-relaxed">{t.texte}</span>
                    </li>
                  ))}
                </ol>
                <p className="o-m-0 o-mt-6 o-text-sm o-leading-relaxed o-opacity-90">
                  Une paire par personne, verifiee sur la carte et l adresse. Nous rachetons la paire au prix paye, pendant un an.
                </p>
              </aside>
            </div>
          </section>
        </main>

        {/* ================= P13 : le plan du lieu, et les lignes ================= */}
        <footer className="o-border-t o-px-6 o-pb-10 o-pt-16 o-text-zinc-50" style={FILET_NUIT}>
          <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-7">
              <Plan />
            </div>
            <div className="o-flex o-flex-col o-justify-between md:o-col-span-5">
              <div>
                <p className="o-m-0 o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-font-bold o-uppercase o-tracking-widest" style={ENCRE_VIVE}>
                  <Icon icon={SportShoe} size={16} aria-hidden="true" />
                  Paire 44 — la boutique
                </p>
                <p className="o-m-0 o-mt-5 o-uppercase o-text-zinc-50" style={{ ...affiche('m', 800), fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', lineHeight: 0.95 }}>
                  7 rue Crebillon<br />44000 Nantes
                </p>
                <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                  Mardi au samedi, 11h a 19h<br />Le 14 novembre : ferme, tout se passe ici
                </p>
                <dl className="o-m-0 o-mt-8 o-border-t o-font-mono o-text-xs o-uppercase o-tracking-widest" style={FILET_NUIT}>
                  {(
                    [
                      ['Tram 1', 'Arret Commerce, a deux minutes', accent(400), undefined],
                      ['Tram 2', 'Arret Commerce, par le quai', 'var(--o-palette-zinc-50)', '10 8'],
                      ['Tram 3', 'Arret Bouffay, puis la rue', 'var(--o-palette-zinc-500)', undefined],
                    ] as const
                  ).map(([ligne, ou, teinte, tirets]) => (
                    <div key={ligne} className="o-grid o-grid-cols-12 o-items-center o-gap-3 o-border-b o-py-3" style={FILET_NUIT}>
                      <span className="o-col-span-3 o-flex o-items-center o-gap-2 o-text-zinc-50">
                        <svg aria-hidden="true" width="28" height="6" viewBox="0 0 28 6"><line x1="0" y1="3" x2="28" y2="3" stroke={teinte} strokeWidth="4" strokeDasharray={tirets} /></svg>
                        {ligne}
                      </span>
                      <span className="o-col-span-9 o-text-zinc-400">{ou}</span>
                    </div>
                  ))}
                </dl>
              </div>
              <nav aria-label="Pied de page" className="o-mt-10 o-flex o-flex-wrap o-gap-x-6 o-gap-y-2 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                {(
                  [
                    ['#coloris', 'Coloris'],
                    ['#angles', 'Cinq angles'],
                    ['#depot', 'Prevenez-moi'],
                    ['mailto:tirage@paire44.fr', 'tirage@paire44.fr'],
                  ] as const
                ).map(([href, mot]) => (
                  <a key={href} href={href} className="o-no-underline o-text-zinc-300 o-transition-colors hover:o-text-zinc-50 focus:o-ring">
                    {mot} ↗
                  </a>
                ))}
              </nav>
            </div>
          </div>
          <p className="o-mx-auto o-mt-12 o-max-w-7xl o-border-t o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500" style={FILET_NUIT}>
            © 2026 Paire 44 SAS — Nantes — vitrine de demonstration
          </p>
        </footer>
      </div>
    </Porte>
  )
}
