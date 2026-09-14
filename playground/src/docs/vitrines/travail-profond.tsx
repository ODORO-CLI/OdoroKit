/**
 * Etale — application de travail profond.
 *
 * ## La reference : Flowstate (GetLayers)
 *
 * Un seul ecran immersif : un fluide plein cadre qui tourbillonne sur un noir
 * abyssal, un mot-marque en Onest, une barre de verre, un titre revele mot a
 * mot, et une liste d attente en verre.
 *
 * ## Ce qui n appartient qu a elle
 *
 * Le **mecanisme** est **la session** : un bloc de quatre-vingt-dix minutes
 * qu on regle — duree, ce qu on coupe — et dont la page montre le deroule
 * minute par minute avant qu on l ait lancee.
 *
 * ## L univers (UNIVERS.md)
 *
 * - Fond F-webgl : Silk plein cadre, **fixe derriere toute la page**. Les
 *   ecrans passent dessus, en verre.
 * - Signature M-allume : le seul long paragraphe de la page, celui du
 *   silence, s allume mot a mot au defilement (`ScrollReveal`).
 * - `BlurWords` sur le paragraphe de la session : un texte qu on dechiffre,
 *   comme une attention qui revient.
 * - Structure : une ouverture, puis trois ecrans courts — la session, le
 *   silence, le compte — puis A8 (la liste d attente en verre) et P2 (une
 *   seule ligne). Pas plus. Aucun chiffre mis en scene (C8).
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, BellOff, Check, Eye, EyeOff } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useState, type CSSProperties, type FormEvent, type ReactElement } from 'react'

import { Silk } from '@/odoro/background/Silk.jsx'
import { useInView } from '@/odoro/hooks/useInView'
import { BlurWords } from '@/odoro/text/BlurWords.jsx'
import { ScrollReveal } from '@/odoro/text/ScrollReveal.jsx'
import { GlassSurface } from '@/odoro/ui/GlassSurface.jsx'

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
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  verre,
} from './marche.jsx'
import { aplat, encreSurSombre } from './palettes.js'

/* ============================ Les donnees ============================== */

const COUPURES = ['Messagerie', 'Courriel', 'Reseaux', 'Navigateur'] as const

/** Le paragraphe du silence : le seul long texte de la page. */
const SILENCE =
  'Les notifications sont bloquees au niveau du systeme, pas seulement masquees : l application qui vous appelle ne sait pas que vous etes la. Vous nommez une exception par session, une personne ou un numero, et tout le reste attend la fin. Rien de ce qui se passe pendant ne sort de l appareil. A la fin, trois lignes : ce que vous avez fait, ce qui a coupe, ce que vous ferez demain.'

/**
 * Ce qui frappe a la porte pendant une session.
 *
 * Le paragraphe du silence dit ce que l application fait ; ces vingt etiquettes
 * le montrent. Elles s eteignent une a une quand la section entre dans le
 * champ, et une seule reste allumee : l exception nommee avant de commencer.
 */
const BRUITS = [
  'Un message',
  'Une relance',
  'Un rappel de reunion',
  'Une mention',
  'Un courriel de plus',
  'Une invitation a un point',
  'Un fil qui repond',
  'Une mise a jour disponible',
  'Un appel manque',
  'Un commentaire',
  'Une alerte d agenda',
  'Le groupe de l equipe',
  'Une demande urgente',
  'Un sondage interne',
  'Une reponse a tous',
  'Un rappel de facture',
  'Une relance polie',
  'Un badge non lu',
  'Une carte partagee',
  'Un accuse de lecture',
] as const

/** Les trois lignes que la session rend le soir venu. */
const JOURNAL: readonly (readonly [string, string])[] = [
  ['Fait', 'Sept secteurs de la maquette sur neuf, et la grille de colonnes reprise.'],
  [
    'Coupe',
    'Une fois, quarante et une minutes apres le debut. L exception nommee a sonne.',
  ],
  ['Demain', 'Les deux secteurs qui restent, puis la revue de midi. Une seule session.'],
]

/* ============================ Le rendu ================================= */

/** Le rayon du cadran, et la longueur de l anneau complet. */
const RAYON = 78
const ANNEAU = 2 * Math.PI * RAYON
/** Trois quarts de tour : le cadran s ouvre en bas, la ou rien ne se passe. */
const COURSE = ANNEAU * 0.75
/** La duree maximale du curseur : c est elle qui donne l echelle du cadran. */
const MAXIMUM = 180

/**
 * Le cadran de la session : un arc qui vaut la duree, et les pauses dessus.
 *
 * ## Pourquoi un cadran plutot qu un nombre
 *
 * La page dit « quatre-vingt-dix minutes » et le visiteur ne sait pas si c est
 * beaucoup. Un arc le dit d un coup : les trois quarts de tour valent trois
 * heures, et la session en occupe la moitie. Les pauses sont des points sur
 * l arc, a leur place reelle — on voit ou elles tombent avant de commencer.
 *
 * L arc est un cercle a `stroke-dasharray` : un seul chemin, aucune
 * trigonometrie pour le tracer, et une transition CSS gratuite quand le
 * curseur bouge. Les points de pause, eux, demandent leur angle.
 */
function Cadran({
  duree,
  pauses,
}: {
  readonly duree: number
  readonly pauses: number
}): ReactElement {
  const { reduced } = useMotionState()
  const part = duree / MAXIMUM
  /** L angle d une minute, en degres, sur les trois quarts de tour. */
  const angle = (minute: number): number => 135 + (minute / MAXIMUM) * 270
  /** Le point du cadran a cette minute. */
  const point = (minute: number): readonly [number, number] => {
    const radians = (angle(minute) * Math.PI) / 180
    return [100 + RAYON * Math.cos(radians), 100 + RAYON * Math.sin(radians)]
  }
  const [finX, finY] = point(duree)

  return (
    <div className="o-relative o-w-full o-max-w-xs">
      <svg
        viewBox="0 0 200 200"
        className="o-h-auto o-w-full"
        aria-hidden="true"
        fill="none"
      >
        <g transform="rotate(135 100 100)">
          {/* La piste : les trois heures possibles. */}
          <circle
            cx="100"
            cy="100"
            r={RAYON}
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeWidth="7"
            strokeDasharray={`${String(COURSE)} ${String(ANNEAU)}`}
            strokeLinecap="round"
          />
          {/* La session : ce qu on a regle. */}
          <circle
            cx="100"
            cy="100"
            r={RAYON}
            stroke={encreSurSombre()}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${String(COURSE * part)} ${String(ANNEAU)}`}
            style={
              reduced
                ? undefined
                : { transition: 'stroke-dasharray 420ms cubic-bezier(0.22, 1, 0.36, 1)' }
            }
          />
        </g>
        {/* Les pauses, a leur minute reelle. */}
        {Array.from({ length: pauses }, (_, k) => {
          const [x, y] = point((k + 1) * 45)
          return (
            <circle
              key={k}
              cx={x}
              cy={y}
              r="4.5"
              fill="var(--o-palette-zinc-950)"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          )
        })}
        {/* La fin de la session. */}
        <circle
          cx={finX}
          cy={finY}
          r="3"
          fill="currentColor"
          style={reduced ? undefined : { transition: 'cx 420ms ease, cy 420ms ease' }}
        />
      </svg>

      <div className="o-pointer-events-none o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-text-center">
        <p
          className="o-m-0 o-tabular-nums o-text-white"
          style={{
            ...affiche('l', 300),
            fontSize: 'clamp(2.75rem, 5vw, 4rem)',
            lineHeight: 1,
          }}
        >
          {duree}
        </p>
        <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">
          minutes
        </p>
        <p
          className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-300"
          style={{ maxWidth: '9rem' }}
        >
          {pauses === 0
            ? 'Aucune pause'
            : `${String(pauses)} pause${pauses > 1 ? 's' : ''} de 3 min`}
        </p>
      </div>
    </div>
  )
}

/**
 * Le champ de bruit : vingt etiquettes qui s eteignent, une qui reste.
 *
 * C est la demonstration du paragraphe du silence, et non une illustration :
 * ce qui s eteint est nomme, et ce qui reste allume porte le nom de
 * l exception. Sous mouvement reduit, l etat final est pose sans cascade —
 * une page dont le propos ne s affiche qu en bougeant n a pas de propos.
 */
function ChampDeBruit(): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLDivElement>({ amount: 0.35 })
  const eteint = reduced || vu

  /** L etiquette d un bruit : allumee au depart, presque nulle a la fin. */
  const etat = (rang: number): CSSProperties => ({
    opacity: eteint ? 0.17 : 0.68,
    transform: eteint || reduced ? 'none' : 'none',
    transition: reduced ? undefined : `opacity 900ms ease ${String(320 + rang * 62)}ms`,
  })

  return (
    <div ref={ref}>
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200">
        Ce qui frappe a la porte pendant quatre-vingt-dix minutes
      </p>
      <ul
        aria-hidden="true"
        className="o-m-0 o-mt-6 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0"
      >
        {BRUITS.map((bruit, rang) => (
          <li
            key={bruit}
            className="o-rounded-full o-border-w-1 o-border-white-20 o-px-3 o-py-1.5 o-font-mono o-text-xs o-text-zinc-100"
            style={etat(rang)}
          >
            {bruit}
          </li>
        ))}
        <li
          className="o-rounded-full o-border-w-1 o-px-3 o-py-1.5 o-font-mono o-text-xs o-text-white"
          style={{
            borderColor: encreSurSombre(),
            opacity: eteint ? 1 : 0.62,
            transition: reduced ? undefined : 'opacity 900ms ease 1700ms',
          }}
        >
          L ecole de Jo — l exception nommee
        </li>
      </ul>
      <p className="o-m-0 o-mt-6 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-300">
        Vingt et une choses ont demande a passer. Une seule est passee, et vous l aviez
        nommee avant de commencer.
      </p>
    </div>
  )
}

/**
 * Le journal du soir : les trois lignes promises par le paragraphe du silence.
 *
 * La page promettait « a la fin, trois lignes » sans jamais les montrer. Les
 * voici, a leur heure, dans la meme matiere de verre que le reste.
 */
function Journal(): ReactElement {
  return (
    <div className={`${verre(true)} o-p-6 md:o-p-8`}>
      <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200">
        <span>Le journal du soir</span>
        <span className="o-tabular-nums" style={{ color: encreSurSombre() }}>
          21 h 04
        </span>
      </p>
      <dl className="o-m-0 o-mt-6">
        {JOURNAL.map(([terme, ligne]) => (
          <div key={terme} className="o-border-t o-border-white-10 o-py-4">
            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200">
              {terme}
            </dt>
            <dd className="o-m-0 o-mt-2 o-text-base o-leading-relaxed o-text-zinc-100">
              {ligne}
            </dd>
          </div>
        ))}
      </dl>
      <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300">
        Elles restent sur l appareil, et la ligne de demain ouvre la session suivante.
      </p>
    </div>
  )
}

/** La session, reglee avant d etre lancee. */
function Session(): ReactElement {
  const [duree, setDuree] = useState(90)
  const [coupes, setCoupes] = useState<readonly string[]>(['Messagerie', 'Reseaux'])
  const basculer = (c: string): void => {
    setCoupes((avant) =>
      avant.includes(c) ? avant.filter((x) => x !== c) : [...avant, c],
    )
  }
  const pauses = Math.max(0, Math.floor(duree / 45) - (duree % 45 === 0 ? 1 : 0))

  return (
    <div className={`${verre(true)} o-grid o-gap-8 o-p-6 md:o-p-8 lg:o-grid-cols-12`}>
      {/* Le cadran : la duree vue d un coup, avec ses pauses a leur place. */}
      <div className="o-flex o-items-center o-justify-center lg:o-col-span-4">
        <Cadran duree={duree} pauses={pauses} />
      </div>

      <div className="o-flex o-flex-col o-gap-6 lg:o-col-span-4">
        <label className="o-block">
          <span className="o-flex o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Duree <span className="o-text-white">{duree} min</span>
          </span>
          <input
            type="range"
            min={25}
            max={180}
            step={5}
            value={duree}
            onChange={(e) => {
              setDuree(Number(e.target.value))
            }}
            className="o-mt-3 o-w-full o-accent-brand-500 focus:o-ring"
          />
        </label>
        <div>
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Ce qu on coupe
          </p>
          <div
            role="group"
            aria-label="Ce qu on coupe"
            className="o-mt-3 o-flex o-flex-wrap o-gap-2"
          >
            {COUPURES.map((c) => {
              const actif = coupes.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    basculer(c)
                  }}
                  className={`o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-3 o-py-1.5 o-font-mono o-text-xs o-transition-colors focus:o-ring ${actif ? 'o-border-transparent' : 'o-border-white-20 o-text-zinc-300 hover:o-bg-white-10'}`}
                  style={actif ? aplat() : undefined}
                >
                  {actif && <Icon icon={BellOff} size={12} aria-hidden="true" />}
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div
        className="lg:o-col-span-4 lg:o-border-l lg:o-pl-8"
        style={{ borderColor: 'color-mix(in oklab, white 12%, transparent)' }}
      >
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          Le deroule
        </p>
        <ol className="o-m-0 o-mt-4 o-list-none o-p-0">
          {[
            [
              '00:00',
              'Tout se coupe. ' +
                (coupes.length === 0
                  ? 'Rien n est coupe cette fois.'
                  : `${coupes.join(', ').toLowerCase()} en silence.`),
            ],
            ...Array.from(
              { length: pauses },
              (_, k) =>
                [
                  `${String((k + 1) * 45).padStart(2, '0')}:00`,
                  'Trois minutes de pause, ecran eteint.',
                ] as const,
            ),
            [
              `${String(duree).padStart(2, '0')}:00`,
              'Fin. Le journal du soir s ouvre, trois lignes.',
            ],
          ].map(([heure, quoi]) => (
            <li
              key={heure}
              className="o-flex o-items-baseline o-gap-4 o-border-t o-border-white-10 o-py-3"
            >
              <span
                className="o-w-14 o-shrink-0 o-font-mono o-text-sm o-tabular-nums"
                style={{ color: encreSurSombre() }}
              >
                {heure}
              </span>
              <span className="o-text-sm o-text-zinc-200">{quoi}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/** Le compte a rebours qu on ne voit pas — sauf si on le demande. */
function Compte(): ReactElement {
  const [visible, setVisible] = useState(false)
  return (
    <GlassSurface
      colors={['--o-vitrine-500', '--o-palette-zinc-50']}
      blur={18}
      tint={0.12}
      className="o-mx-auto o-w-full o-max-w-lg o-p-8 o-text-center o-text-zinc-50 md:o-p-12"
    >
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">
        Session en cours — 07 secteurs de la maquette
      </p>
      <p
        aria-live="polite"
        className="o-m-0 o-mt-8 o-tabular-nums o-transition-all"
        style={{
          ...affiche('l', 300),
          fontSize: 'clamp(3.5rem, 9vw, 8rem)',
          filter: visible ? 'blur(0)' : 'blur(18px)',
          opacity: visible ? 1 : 0.35,
          userSelect: visible ? 'auto' : 'none',
        }}
      >
        <span aria-hidden={!visible}>47:12</span>
        {!visible && <span className="o-sr-only">Temps restant masque</span>}
      </p>
      <p className="o-m-0 o-mt-6 o-text-base o-leading-relaxed o-text-zinc-200">
        Le temps restant n est visible que si vous le demandez. On ne travaille pas bien
        avec une horloge en face.
      </p>
      <button
        type="button"
        aria-pressed={visible}
        onClick={() => {
          setVisible((v) => !v)
        }}
        className="o-mt-8 o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-5 o-py-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-white o-transition-colors hover:o-bg-white-20 focus:o-ring"
      >
        <Icon icon={visible ? EyeOff : Eye} size={14} aria-hidden="true" />
        {visible ? 'Le cacher' : 'Le voir, cette fois'}
      </button>
    </GlassSurface>
  )
}

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('onest')
  const [adresse, setAdresse] = useState('')
  const [inscrit, setInscrit] = useState(false)
  const rejoindre = (e: FormEvent): void => {
    e.preventDefault()
    if (adresse.includes('@')) setInscrit(true)
  }

  return (
    <Porte forme="compteur" marque="Etale">
      <div className="o-relative" style={{ ...nuit('zinc'), ...polices }}>
        {/* Le fluide, colle derriere toute la page. */}
        <div className="o-pointer-events-none o-fixed o-inset-0 o-z-0">
          <Silk
            className="o-absolute o-inset-0"
            colors={[
              '--o-theme-bg',
              '--o-vitrine-600',
              '--o-vitrine-300',
              '--o-palette-fuchsia-500',
            ]}
            speed={0.06}
            scale={1.3}
            fallback="o-bg-zinc-950"
          />
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, transparent 25%, color-mix(in oklab, var(--o-palette-zinc-950) 55%, transparent) 65%, color-mix(in oklab, var(--o-palette-zinc-950) 85%, transparent) 100%)',
            }}
          />
          <Grain opacite={0.07} />
        </div>

        <BarreGelule
          marque="Etale"
          liens={[
            ['#session', 'La session'],
            ['#silence', 'Le silence'],
            ['#compte', 'Le compte'],
          ]}
          action={['#attente', 'Rejoindre la liste']}
        />

        {/* ================= L ouverture, un seul ecran =================
            La hauteur retire les barres de la documentation : sans cela le
            titre pousse les deux gelules sous le pli, et l ouverture se lit
            comme une page coupee. */}
        <header
          className="o-relative o-z-10 o-flex o-flex-col o-items-center o-justify-center o-px-6 o-pb-20 o-pt-28 o-text-center"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <Surgit>
            <Etiquette>Une session a la fois</Etiquette>
          </Surgit>
          <TitreVague
            delai={120}
            cadence={80}
            className="o-m-0 o-mt-7 o-max-w-5xl o-text-white"
            style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 7.5vw, 8rem)' }}
          >
            Du travail profond dans un monde distrait.
          </TitreVague>
          <Surgit
            delai={520}
            as="p"
            className="o-m-0 o-mt-7 o-max-w-md o-text-lg o-leading-relaxed o-text-zinc-300"
          >
            Coupez le bruit, reprenez votre attention. Une session, puis une autre.
          </Surgit>
          <Surgit delai={640} className="o-mt-10">
            <Actions
              pleine={[
                '#attente',
                <>
                  Rejoindre la liste{' '}
                  <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </>,
              ]}
              fantome={['#session', 'Regler une session']}
            />
          </Surgit>
          <Coin position="bg">Etale — concu pour le travail profond</Coin>
          <Coin position="bd">
            Nantes
            <br />
            Ouverture par petits groupes
          </Coin>
        </header>

        <main className="o-relative o-z-10">
          {/* ================= I. La session, le mecanisme ================ */}
          <section
            id="session"
            className="o-flex o-min-h-screen o-scroll-mt-24 o-items-center o-px-6 o-py-20"
          >
            <div className="o-mx-auto o-w-full o-max-w-6xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Reveal>
                    <Indice rang="01">La session</Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <h2 className="o-m-0 o-mt-6 o-text-white" style={affiche('m', 300)}>
                      Reglez-la avant. Ne la regardez plus pendant.
                    </h2>
                  </Reveal>
                </div>
                <BlurWords
                  as="p"
                  blur={7}
                  dim={0.2}
                  step={140}
                  pause={2600}
                  className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-200 md:o-col-span-5 md:o-justify-self-end"
                >
                  La duree, ce qu on coupe, ce qu on laisse passer : tout se decide avant.
                  Ensuite la page se ferme, et vous travaillez.
                </BlurWords>
              </div>
              <div className="o-mt-10">
                <Reveal delay={160}>
                  <Session />
                </Reveal>
              </div>
            </div>
          </section>

          {/* ================= II. Le silence : le paragraphe qui s allume ===== */}
          <section
            id="silence"
            className="o-flex o-min-h-screen o-scroll-mt-24 o-items-center o-px-6 o-py-20"
          >
            <div className="o-mx-auto o-w-full o-max-w-6xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12">
                <div className="md:o-col-span-3">
                  <Indice rang="02">Le silence</Indice>
                </div>
                <ScrollReveal
                  as="p"
                  dim={0.1}
                  blur={3}
                  course={1.1}
                  className="o-m-0 o-text-white md:o-col-span-9"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.5rem, 3.2vw, 3rem)',
                    lineHeight: 1.15,
                  }}
                >
                  {SILENCE}
                </ScrollReveal>
              </div>

              {/* Ce que le paragraphe promet, montre : le bruit s eteint. */}
              <div className="o-mt-16 o-grid o-gap-8 o-border-t o-border-white-10 o-pt-12 md:o-mt-24 md:o-grid-cols-12">
                <div className="md:o-col-start-4 md:o-col-span-9">
                  <ChampDeBruit />
                </div>
              </div>
            </div>
          </section>

          {/* ================= III. Le compte, qu on ne voit pas ============ */}
          <section
            id="compte"
            className="o-flex o-min-h-screen o-scroll-mt-24 o-flex-col o-items-center o-justify-center o-px-6 o-py-20"
          >
            <div className="o-mx-auto o-w-full o-max-w-6xl">
              <div className="o-mb-12 o-flex o-justify-center">
                <Indice rang="03">Le compte</Indice>
              </div>
              <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-items-center">
                <div className="lg:o-col-span-6">
                  <Reveal>
                    <Compte />
                  </Reveal>
                </div>
                {/* Les trois lignes que le paragraphe du silence promettait. */}
                <div className="lg:o-col-span-6">
                  <Reveal delay={140}>
                    <Journal />
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

          {/* ================= A8 : la liste d attente, en verre ============= */}
          <section
            id="attente"
            className="o-flex o-scroll-mt-24 o-items-center o-px-6 o-pb-32 o-pt-20 md:o-pb-40"
          >
            <div className="o-mx-auto o-w-full o-max-w-3xl o-text-center">
              <h2 className="o-m-0 o-text-white" style={affiche('m', 300)}>
                Une session, ce soir ?
              </h2>
              <form
                onSubmit={rejoindre}
                className={`${verre(true)} o-mx-auto o-mt-10 o-flex o-w-full o-max-w-lg o-items-center o-gap-2 o-p-1.5 o-pl-4`}
              >
                <label htmlFor="etale-adresse" className="o-sr-only">
                  Adresse e-mail
                </label>
                <input
                  id="etale-adresse"
                  type="email"
                  required
                  value={adresse}
                  onChange={(e) => {
                    setAdresse(e.target.value)
                  }}
                  placeholder="Votre adresse"
                  className="o-min-w-0 o-grow o-bg-transparent o-text-sm o-text-white focus:o-outline-none"
                />
                <button
                  type="submit"
                  className="o-shrink-0 o-rounded-full o-px-5 o-py-2.5 o-text-sm o-font-semibold o-transition-opacity hover:o-opacity-85 focus:o-ring"
                  style={aplat()}
                >
                  {inscrit ? (
                    <>
                      <Icon icon={Check} size={14} aria-hidden="true" /> Inscrit
                    </>
                  ) : (
                    'Rejoindre'
                  )}
                </button>
              </form>
              <p
                aria-live="polite"
                className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200"
              >
                {inscrit
                  ? 'Merci. Une invitation par semaine, par ordre d arrivee.'
                  : 'Une invitation par semaine, par ordre d arrivee. Aucune relance.'}
              </p>
            </div>
          </section>
        </main>

        {/* ================= P2 : une seule ligne ========================== */}
        <footer
          className="o-relative o-z-10 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-px-6 o-py-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400"
          style={{
            backgroundColor:
              'color-mix(in oklab, var(--o-palette-zinc-950) 70%, transparent)',
          }}
        >
          <span className="o-text-white">Etale</span>
          <nav aria-label="Pied de page" className="o-flex o-flex-wrap o-gap-6">
            {(
              [
                ['#session', 'La session'],
                ['#silence', 'Le silence'],
                ['#compte', 'Le compte'],
                ['#attente', 'bonjour@etale.app'],
                ['#attente', 'Confidentialite'],
              ] as const
            ).map(([href, mot]) => (
              <a
                key={mot}
                href={href}
                className="o-no-underline o-text-zinc-300 o-transition-colors hover:o-text-white focus:o-ring"
              >
                {mot}
              </a>
            ))}
          </nav>
          <span>© 2026 Etale SAS — Nantes</span>
        </footer>
      </div>
    </Porte>
  )
}
