/**
 * Trait d Union — agence de recrutement.
 *
 * ## Le parti pris — l annonce passee au banc d essai, devant vous
 *
 * Une agence de recrutement vend un carnet d adresses. Celle-ci vend autre
 * chose, et la page le prouve avant de le dire : on ecrit une fiche de poste
 * dans la page — intitule, salaire, rythme, contrat, et les formules qu on met
 * dans une annonce sans y penser — et la page repond en deux listes. **Ce
 * qu elle attirera**, et **ce qu elle fera fuir**, avec la raison de chaque
 * ligne.
 *
 * Le calcul est honnete parce qu il est ouvert : chaque regle porte son poids
 * en points, positif ou negatif, et le detail des points est affiche sous
 * l anneau. Personne n a a croire le score — il se refait a la main.
 *
 * ## Le fond, le mouvement, les coupes
 *
 * F-css : une nappe violette qui derive lentement derriere l ouverture, sans
 * canevas ni scene graphique. La signature est M-chapitres : le verdict reste
 * pose a gauche pendant que les quatre blocs de la fiche defilent a droite, et
 * l anneau bouge sous les yeux a chaque frappe. Une bande sombre coupe la page
 * claire pour le seul ecran de texte de la page.
 *
 * ## Les formes
 *
 * A22 — une question unique, trois reponses, trois adresses.
 * P30 — un bandeau de partenaires en gris, puis une ligne.
 * C19 — un seul pourcentage, en anneau : le score de l annonce ecrite ici.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  ArrowUpRight,
  Minus,
  Plus,
  UserRoundSearch,
} from '@odoro-cli/icons/outline'
import { useId, useMemo, useState, type ReactElement, type ReactNode } from 'react'

import { LogoBand } from '@/odoro/section/LogoBand.jsx'
import { TrueFocus } from '@/odoro/text/TrueFocus.jsx'
import { AvatarStack } from '@/odoro/ui/AvatarStack.jsx'
import { TagInput } from '@/odoro/ui/TagInput.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreGelule,
  CHROME,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Chapitre, Nappe } from './scene.jsx'

/* ========================= Les constantes de dessin ===================== */

/** Le filet de la page, tire de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 15%, transparent)'

/** Le filet appuye : celui qui ferme une zone. */
const FILET_FORT = 'color-mix(in oklab, currentColor 38%, transparent)'

/** La voix mono des intitules et des notes. */
const NOTE =
  'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-neutral-500 dark:o-text-neutral-400'

/** Une encre semantique, tiree vers l encre du theme. */
function semantique(jeton: string): string {
  return `color-mix(in oklab, var(${jeton}) 45%, var(--o-theme-fg))`
}

/** Les liens de la barre en gelule. */
const NAVIGATION = [
  ['#annonce', 'La fiche de poste'],
  ['#methode', 'La methode'],
  ['#qui', 'Nous ecrire'],
] as const

/* ========================= Le mecanisme : la fiche de poste ============= */

/** Les contrats proposables, et ce qu ils valent a l annonce. */
const CONTRATS: readonly {
  readonly cle: string
  readonly mot: string
  readonly points: number
  readonly raison: string
}[] = [
  {
    cle: 'cdi',
    mot: 'CDI',
    points: 10,
    raison: 'Le contrat reste le premier filtre des candidats en poste.',
  },
  {
    cle: 'cdd',
    mot: 'CDD de 12 mois',
    points: -6,
    raison: 'Un candidat en poste ne demissionne pas pour douze mois.',
  },
  {
    cle: 'alternance',
    mot: 'Alternance',
    points: 0,
    raison: 'Un vivier a part, avec son calendrier et ses ecoles.',
  },
  {
    cle: 'mission',
    mot: 'Mission de 6 mois',
    points: -11,
    raison: 'Reserve aux independants : le salariat ne se deplace pas pour six mois.',
  },
]

/**
 * Les formules qu on trouve dans les annonces, et ce qu elles coutent.
 *
 * Aucune n est inventee pour la demonstration : ce sont celles que nous
 * relevons le plus souvent dans les annonces qu on nous demande de reecrire.
 * Le poids negatif n est pas un jugement de gout — c est ce que les candidats
 * nous disent en entretien quand on leur demande pourquoi ils n avaient pas
 * postule la premiere fois.
 */
const FORMULES: readonly {
  readonly mot: string
  readonly points: number
  readonly raison: string
}[] = [
  {
    mot: 'jeune equipe dynamique',
    points: -8,
    raison:
      'Lu comme « personne de plus de trente-cinq ans ici », et parfois attaquable.',
  },
  {
    mot: 'esprit de famille',
    points: -7,
    raison: 'Lu comme « on vous demandera des choses qui ne sont pas dans le contrat ».',
  },
  {
    mot: 'salaire selon profil',
    points: -14,
    raison: 'La seule formule qui divise par trois le nombre de candidatures.',
  },
  {
    mot: 'resistance au stress',
    points: -9,
    raison: 'Une organisation qui l ecrit annonce son propre desordre.',
  },
  {
    mot: 'polyvalent',
    points: -6,
    raison: 'Sans perimetre ecrit a cote, il se lit « trois postes pour un salaire ».',
  },
  {
    mot: 'disponibilite immediate',
    points: -5,
    raison: 'Ecarte de fait tous les candidats en poste, soit huit sur dix.',
  },
  {
    mot: 'startup qui bouge',
    points: -4,
    raison: 'Ne dit rien du metier, et date l annonce de dix ans.',
  },
  {
    mot: 'perimetre ecrit noir sur blanc',
    points: 9,
    raison: 'La seule formule que les candidats citent spontanement comme rassurante.',
  },
  {
    mot: 'equipe nommee, avec son effectif',
    points: 6,
    raison: 'On postule dans une equipe, pas dans un organigramme.',
  },
  {
    mot: 'processus en deux entretiens',
    points: 8,
    raison: 'Au-dela de trois, un candidat sur deux abandonne en route.',
  },
]

/** Les formules posees dans le champ au premier affichage. */
const FORMULES_DEPART = ['jeune equipe dynamique', 'salaire selon profil', 'polyvalent']

/** Les mots d intitule qui font fuir, et ceux qui rassurent. */
const INTITULES_FANTAISIE = [
  'ninja',
  'magicien',
  'rockstar',
  'couteau suisse',
  'wizard',
  'guru',
  'hero',
]

/** Une regle du calcul, telle qu elle s affiche dans le detail des points. */
interface Regle {
  readonly cle: string
  readonly libelle: string
  readonly points: number
  readonly raison: string
}

/** Un profil attire ou repousse, avec ce qui le determine. */
interface Profil {
  readonly qui: string
  readonly pourquoi: string
}

/**
 * L anneau du score — la seule forme de chiffres de la page.
 *
 * Un pourcentage, un anneau, et rien d autre. Il ne compte pas des clients ni
 * des annees : il compte ce que la fiche ecrite juste a cote vaut, et il bouge
 * a chaque frappe. Sous mouvement reduit il se pose sans transition.
 */
function Anneau({ score }: { readonly score: number }): ReactElement {
  const { reduced } = useMotionState()
  const rayon = 78
  const tour = 2 * Math.PI * rayon
  const couleur =
    score >= 70
      ? semantique('--o-palette-emerald-600')
      : score >= 45
        ? semantique('--o-palette-amber-600')
        : semantique('--o-palette-rose-600')
  return (
    <div className="o-relative o-w-full" style={{ maxWidth: 240 }}>
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`Score de l annonce : ${String(score)} sur 100`}
        className="o-w-full"
      >
        <circle
          cx="100"
          cy="100"
          r={rayon}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          opacity="0.13"
        />
        <circle
          cx="100"
          cy="100"
          r={rayon}
          fill="none"
          stroke={couleur}
          strokeWidth="12"
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{
            strokeDasharray: tour,
            strokeDashoffset: tour * (1 - score / 100),
            transition: reduced
              ? undefined
              : 'stroke-dashoffset 620ms cubic-bezier(0.16, 1, 0.3, 1), stroke 400ms linear',
          }}
        />
        <text
          x="100"
          y="106"
          textAnchor="middle"
          fontSize="54"
          fill="currentColor"
          style={{ fontWeight: 300, letterSpacing: '-0.04em' }}
        >
          {score}
        </text>
        <text
          x="100"
          y="132"
          textAnchor="middle"
          className="o-font-mono"
          fontSize="11"
          fill="currentColor"
          opacity="0.6"
        >
          sur 100
        </text>
      </svg>
    </div>
  )
}

/** Un bloc de la fiche, avec son indice et son intitule. */
function Bloc({
  numero,
  titre,
  aide,
  children,
}: {
  readonly numero: string
  readonly titre: string
  readonly aide: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <div className="o-py-10" style={{ borderTop: `1px solid ${FILET}` }}>
      <p className={`o-m-0 ${NOTE}`}>
        <span style={{ color: encre() }}>{numero}</span> — {aide}
      </p>
      <h3 className="o-m-0 o-mt-3 o-text-2xl o-font-medium o-tracking-tight o-text-neutral-950 dark:o-text-neutral-50 md:o-text-3xl">
        {titre}
      </h3>
      <div className="o-mt-7">{children}</div>
    </div>
  )
}

/**
 * La fiche de poste : on la remplit, la page dit ce qu elle fera.
 *
 * Tout est derive de cinq etats. Le score n est jamais une note secrete : la
 * liste des regles retenues est affichee dessous, avec le poids de chacune,
 * et leur somme bornee a cent est exactement le nombre de l anneau.
 */
function FicheDePoste(): ReactElement {
  const identifiant = useId()
  const [intitule, setIntitule] = useState('Comptable general')
  const [salaireAffiche, setSalaireAffiche] = useState(false)
  const [bas, setBas] = useState(32)
  const [teletravail, setTeletravail] = useState(1)
  const [contrat, setContrat] = useState('cdi')
  const [formules, setFormules] = useState<readonly string[]>(FORMULES_DEPART)

  const calcul = useMemo(() => {
    const regles: Regle[] = [
      {
        cle: 'base',
        libelle: 'Annonce publiee, socle de depart',
        points: 40,
        raison: 'Le point de depart d une annonce quelconque, avant tout ce qui suit.',
      },
    ]

    if (salaireAffiche) {
      regles.push({
        cle: 'salaire',
        libelle: `Fourchette affichee : ${String(bas)} a ${String(bas + 6)} k€`,
        points: 22,
        raison:
          'Une annonce avec fourchette recoit en moyenne trois fois plus de candidatures que la meme sans.',
      })
    } else {
      regles.push({
        cle: 'salaire',
        libelle: 'Salaire non affiche',
        points: -18,
        raison:
          'Le premier motif de non-candidature cite en entretien, tous metiers confondus.',
      })
    }

    if (teletravail >= 3) {
      regles.push({
        cle: 'tt',
        libelle: `${String(teletravail)} jours a distance`,
        points: 16,
        raison: 'Au-dela de deux jours, le bassin de recrutement depasse la ville.',
      })
    } else if (teletravail === 0) {
      regles.push({
        cle: 'tt',
        libelle: 'Aucun jour a distance',
        points: -9,
        raison:
          'Recevable si c est ecrit et explique ; couteux si c est seulement sous-entendu.',
      })
    } else {
      regles.push({
        cle: 'tt',
        libelle: `${String(teletravail)} jour${teletravail > 1 ? 's' : ''} a distance`,
        points: 8,
        raison: 'Le rythme le plus courant : il ne distingue pas, mais il ne coute rien.',
      })
    }

    const choisi = CONTRATS.find((c) => c.cle === contrat) ?? CONTRATS[0]
    if (choisi !== undefined)
      regles.push({
        cle: 'contrat',
        libelle: choisi.mot,
        points: choisi.points,
        raison: choisi.raison,
      })

    const mots = intitule.trim().split(/\s+/).filter(Boolean)
    const fantaisie = INTITULES_FANTAISIE.some((f) => intitule.toLowerCase().includes(f))
    if (fantaisie) {
      regles.push({
        cle: 'intitule',
        libelle: 'Intitule de fantaisie',
        points: -13,
        raison:
          'Personne ne cherche « ninja » dans un moteur d offres : l annonce ne sort pas.',
      })
    } else if (mots.length > 0 && mots.length <= 4) {
      regles.push({
        cle: 'intitule',
        libelle: 'Intitule court et cherchable',
        points: 7,
        raison: 'Deux a quatre mots : c est ce qui se tape dans un moteur d offres.',
      })
    } else if (mots.length > 4) {
      regles.push({
        cle: 'intitule',
        libelle: 'Intitule trop long',
        points: -5,
        raison: 'Au-dela de quatre mots, il est tronque dans la plupart des listes.',
      })
    }

    for (const mot of formules) {
      const connue = FORMULES.find((f) => f.mot === mot)
      if (connue !== undefined)
        regles.push({
          cle: `f-${mot}`,
          libelle: `« ${mot} »`,
          points: connue.points,
          raison: connue.raison,
        })
      else
        regles.push({
          cle: `f-${mot}`,
          libelle: `« ${mot} »`,
          points: 0,
          raison:
            'Formule libre : nous n avons pas de releve dessus, elle ne compte pas.',
        })
    }

    const somme = regles.reduce((total, regle) => total + regle.points, 0)
    const score = Math.max(0, Math.min(100, somme))

    const attire: Profil[] = []
    const fuit: Profil[] = []

    if (salaireAffiche)
      attire.push({
        qui: 'Les candidats deja en poste',
        pourquoi: 'Ils ne postulent que s ils savent si le changement vaut le risque.',
      })
    else
      fuit.push({
        qui: 'Les candidats deja en poste',
        pourquoi: 'Sans fourchette, ils ne peuvent pas comparer, donc ils passent.',
      })

    if (teletravail >= 3)
      attire.push({
        qui: 'Les profils hors du bassin',
        pourquoi: 'Trois jours a distance rendent le trajet hebdomadaire acceptable.',
      })
    if (teletravail === 0)
      fuit.push({
        qui: 'Les parents de jeunes enfants',
        pourquoi: 'Zero jour a distance ecarte, de fait, une grande partie d entre eux.',
      })

    if (choisi?.cle === 'cdi')
      attire.push({
        qui: 'Les profils qui veulent se poser',
        pourquoi:
          'Le contrat long reste le premier critere de tri des candidats seniors.',
      })
    if (choisi?.cle === 'mission' || choisi?.cle === 'cdd')
      fuit.push({
        qui: 'Les salaries en poste',
        pourquoi:
          'On ne quitte pas un contrat long pour un contrat court, sauf a payer beaucoup plus.',
      })

    for (const mot of formules) {
      const connue = FORMULES.find((f) => f.mot === mot)
      if (connue === undefined) continue
      if (connue.points < 0)
        fuit.push({ qui: `« ${connue.mot} »`, pourquoi: connue.raison })
      else attire.push({ qui: `« ${connue.mot} »`, pourquoi: connue.raison })
    }

    if (fantaisie)
      fuit.push({
        qui: 'Les moteurs de recherche d offres',
        pourquoi:
          'Un intitule de fantaisie ne correspond a aucune requete : l annonce n est jamais vue.',
      })

    return { regles, score, attire, fuit }
  }, [intitule, salaireAffiche, bas, teletravail, contrat, formules])

  const verdict =
    calcul.score >= 70
      ? 'Cette annonce tient'
      : calcul.score >= 45
        ? 'Cette annonce passe, sans plus'
        : 'Cette annonce ne recevra presque rien'

  return (
    <div className="o-grid o-gap-12 lg:o-grid-cols-12 lg:o-gap-16">
      {/*
        ----- Le verdict, colle a gauche — M-chapitres ----------------------

        Ce n est pas une etiquette de section : c est la reponse, et elle doit
        rester visible pendant qu on modifie la fiche. Le collage est natif, et
        il s arrete de lui-meme sur un ecran etroit.
      */}
      <div className="o-min-w-0 lg:o-col-span-5">
        <div className="lg:o-sticky" style={{ top: CHROME + 32 }}>
          <Anneau score={calcul.score} />
          <p className="o-m-0 o-mt-6 o-text-2xl o-font-medium o-tracking-tight o-text-neutral-950 dark:o-text-neutral-50">
            {verdict}
          </p>

          <div className="o-mt-8 o-grid o-gap-8">
            <div>
              <p
                className={`o-m-0 ${NOTE}`}
                style={{ color: semantique('--o-palette-emerald-600') }}
              >
                Ce qu elle attirera
              </p>
              <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-col o-gap-3 o-p-0">
                {calcul.attire.length === 0 && (
                  <li className="o-text-sm o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">
                    Rien de particulier, en l etat.
                  </li>
                )}
                {calcul.attire.map((p) => (
                  <li
                    key={p.qui}
                    className="o-pl-4 o-text-sm o-leading-relaxed"
                    style={{
                      borderLeft: `2px solid ${semantique('--o-palette-emerald-600')}`,
                    }}
                  >
                    <span className="o-block o-text-neutral-950 dark:o-text-neutral-50">
                      {p.qui}
                    </span>
                    <span className="o-block o-text-neutral-600 dark:o-text-neutral-400">
                      {p.pourquoi}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className={`o-m-0 ${NOTE}`}
                style={{ color: semantique('--o-palette-rose-600') }}
              >
                Ce qu elle fera fuir
              </p>
              <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-col o-gap-3 o-p-0">
                {calcul.fuit.length === 0 && (
                  <li className="o-text-sm o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">
                    Rien : l annonce ne repousse personne.
                  </li>
                )}
                {calcul.fuit.map((p) => (
                  <li
                    key={p.qui}
                    className="o-pl-4 o-text-sm o-leading-relaxed"
                    style={{
                      borderLeft: `2px solid ${semantique('--o-palette-rose-600')}`,
                    }}
                  >
                    <span className="o-block o-text-neutral-950 dark:o-text-neutral-50">
                      {p.qui}
                    </span>
                    <span className="o-block o-text-neutral-600 dark:o-text-neutral-400">
                      {p.pourquoi}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ----- Les quatre blocs de la fiche, qui defilent ------------------- */}
      <div className="o-min-w-0 lg:o-col-span-7">
        <Bloc
          numero="01"
          titre="L intitule"
          aide="Ce qui se tape dans un moteur d offres"
        >
          <input
            id={`${identifiant}-intitule`}
            type="text"
            value={intitule}
            maxLength={60}
            aria-label="Intitule du poste"
            onChange={(evenement) => {
              setIntitule(evenement.target.value)
            }}
            className="o-w-full o-bg-transparent o-py-3 o-text-2xl o-text-neutral-950 dark:o-text-neutral-50 focus:o-ring"
            style={{ borderBottom: `1px solid ${FILET_FORT}`, borderRadius: 0 }}
          />
          <p className={`o-m-0 o-mt-3 ${NOTE}`}>
            Essayez « ninja du chiffre » pour voir l annonce disparaitre des moteurs
          </p>
        </Bloc>

        <Bloc numero="02" titre="Le salaire" aide="La ligne qui decide de tout">
          <div className="o-flex o-flex-wrap o-items-center o-gap-3">
            {(
              [
                [true, 'Fourchette affichee'],
                [false, 'Selon profil'],
              ] as const
            ).map(([valeur, mot]) => (
              <button
                key={mot}
                type="button"
                aria-pressed={salaireAffiche === valeur}
                onClick={() => {
                  setSalaireAffiche(valeur)
                }}
                className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-font-medium focus:o-ring"
                style={
                  salaireAffiche === valeur
                    ? {
                        borderColor: encre(),
                        color: encre(),
                        backgroundColor: accentDoux(400, 16),
                      }
                    : { borderColor: FILET_FORT }
                }
              >
                {mot}
              </button>
            ))}
          </div>
          {salaireAffiche && (
            <div className="o-mt-7">
              <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
                <label
                  htmlFor={`${identifiant}-bas`}
                  className="o-text-base o-text-neutral-950 dark:o-text-neutral-50"
                >
                  Bas de fourchette
                </label>
                <p
                  className="o-m-0 o-font-mono o-text-lg o-tabular-nums"
                  style={{ color: encre() }}
                >
                  {bas} a {bas + 6} k€ brut
                </p>
              </div>
              <input
                id={`${identifiant}-bas`}
                type="range"
                min={22}
                max={90}
                step={1}
                value={bas}
                onChange={(evenement) => {
                  setBas(Number(evenement.target.value))
                }}
                className="o-mt-4 o-block o-w-full o-cursor-pointer focus:o-ring"
                style={{ accentColor: encre() }}
              />
            </div>
          )}
        </Bloc>

        <Bloc
          numero="03"
          titre="Le rythme et le contrat"
          aide="Ce qui elargit ou retrecit le bassin"
        >
          <div className="o-flex o-flex-wrap o-items-center o-gap-4">
            <span className="o-text-base o-text-neutral-950 dark:o-text-neutral-50">
              Jours a distance
            </span>
            <div className="o-flex o-items-center o-gap-2">
              <button
                type="button"
                aria-label="Retirer un jour a distance"
                onClick={() => {
                  setTeletravail((precedent) => Math.max(0, precedent - 1))
                }}
                className="o-inline-flex o-size-9 o-cursor-pointer o-items-center o-justify-center o-rounded-full o-border-w-1 focus:o-ring"
                style={{ borderColor: FILET_FORT }}
              >
                <Icon icon={Minus} size={15} aria-hidden="true" />
              </button>
              <span
                aria-live="polite"
                className="o-w-8 o-text-center o-font-mono o-text-xl o-tabular-nums"
                style={{ color: encre() }}
              >
                {teletravail}
              </span>
              <button
                type="button"
                aria-label="Ajouter un jour a distance"
                onClick={() => {
                  setTeletravail((precedent) => Math.min(5, precedent + 1))
                }}
                className="o-inline-flex o-size-9 o-cursor-pointer o-items-center o-justify-center o-rounded-full o-border-w-1 focus:o-ring"
                style={{ borderColor: FILET_FORT }}
              >
                <Icon icon={Plus} size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div
            role="group"
            aria-label="Type de contrat"
            className="o-mt-7 o-flex o-flex-wrap o-gap-2"
          >
            {CONTRATS.map((option) => (
              <button
                key={option.cle}
                type="button"
                aria-pressed={contrat === option.cle}
                onClick={() => {
                  setContrat(option.cle)
                }}
                className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-font-medium focus:o-ring"
                style={
                  contrat === option.cle
                    ? {
                        borderColor: encre(),
                        color: encre(),
                        backgroundColor: accentDoux(400, 16),
                      }
                    : { borderColor: FILET_FORT }
                }
              >
                {option.mot}
              </button>
            ))}
          </div>
        </Bloc>

        <Bloc
          numero="04"
          titre="Les mots de l annonce"
          aide="Retirez-en, ajoutez-en : le score bouge"
        >
          <TagInput
            label="Les formules de l annonce"
            value={formules}
            onChange={setFormules}
            placeholder="Ajouter une formule..."
            max={7}
          />
          <p className={`o-m-0 o-mt-5 ${NOTE}`}>
            Celles que nous relevons le plus souvent
          </p>
          <div className="o-mt-3 o-flex o-flex-wrap o-gap-2">
            {FORMULES.filter((f) => !formules.includes(f.mot)).map((f) => (
              <button
                key={f.mot}
                type="button"
                onClick={() => {
                  setFormules((precedent) =>
                    precedent.length >= 7 ? precedent : [...precedent, f.mot],
                  )
                }}
                className="o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-3 o-py-1.5 o-text-sm focus:o-ring"
                style={{
                  borderColor: FILET,
                  color:
                    f.points < 0
                      ? semantique('--o-palette-rose-600')
                      : semantique('--o-palette-emerald-600'),
                }}
              >
                <Icon icon={Plus} size={13} aria-hidden="true" />
                {f.mot}
                <span className="o-font-mono o-text-xs o-tabular-nums">
                  {f.points > 0 ? `+${String(f.points)}` : String(f.points)}
                </span>
              </button>
            ))}
          </div>
        </Bloc>

        {/* ----- Le detail des points : le score n est pas une note secrete -- */}
        <div className="o-py-10" style={{ borderTop: `1px solid ${FILET_FORT}` }}>
          <p className={`o-m-0 ${NOTE}`}>Le detail, ligne a ligne</p>
          <ul className="o-m-0 o-mt-5 o-list-none o-p-0">
            {calcul.regles.map((regle) => (
              <li
                key={regle.cle}
                className="o-grid o-gap-x-5 o-gap-y-1 o-py-3 sm:o-grid-cols-12"
                style={{ borderTop: `1px solid ${FILET}` }}
              >
                <p
                  className="o-m-0 o-font-mono o-text-sm o-tabular-nums sm:o-col-span-1"
                  style={{
                    color:
                      regle.points < 0
                        ? semantique('--o-palette-rose-600')
                        : semantique('--o-palette-emerald-600'),
                  }}
                >
                  {regle.points > 0 ? `+${String(regle.points)}` : String(regle.points)}
                </p>
                <div className="o-min-w-0 sm:o-col-span-11">
                  <p className="o-m-0 o-text-base o-text-neutral-950 dark:o-text-neutral-50">
                    {regle.libelle}
                  </p>
                  <p className="o-m-0 o-mt-1 o-text-sm o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">
                    {regle.raison}
                  </p>
                </div>
              </li>
            ))}
            <li
              className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-py-4"
              style={{ borderTop: `1px solid ${FILET_FORT}` }}
            >
              <span className={NOTE}>Somme, bornee a cent</span>
              <span
                className="o-tabular-nums o-text-neutral-950 dark:o-text-neutral-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)',
                }}
              >
                {calcul.score}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ========================= Les chapitres de la methode ================== */

/** Un chapitre de la methode, avec ses temps. */
const METHODE: readonly {
  readonly cle: string
  readonly numero: string
  readonly titre: string
  readonly texte: string
  readonly temps: readonly (readonly [string, string])[]
}[] = [
  {
    cle: 'cadrage',
    numero: 'I',
    titre: 'Le cadrage',
    texte:
      'Deux heures avec la personne a qui le poste rendra compte, et une heure avec quelqu un qui fait deja le travail. L annonce sort de la, pas d une fiche de fonction.',
    temps: [
      ['Semaine 1', 'Entretien de cadrage et lecture du perimetre reel'],
      ['Semaine 1', 'Reecriture de l annonce, fourchette comprise'],
      ['Semaine 2', 'Validation par l equipe qui accueillera la personne'],
    ],
  },
  {
    cle: 'approche',
    numero: 'II',
    titre: 'L approche',
    texte:
      'Nous ecrivons a des gens qui ne cherchent pas. Le premier message dit le salaire, le rythme et le nom de l entreprise : sans cela, un candidat en poste ne repond pas.',
    temps: [
      ['Semaine 2', 'Liste longue, entre quarante et soixante noms'],
      ['Semaines 3 a 5', 'Approche directe, un message ecrit un par un'],
      ['Semaine 5', 'Liste courte : six a huit personnes rencontrees'],
    ],
  },
  {
    cle: 'apres',
    numero: 'III',
    titre: 'L apres',
    texte:
      'Le recrutement ne finit pas a la signature. Nous rappelons a un mois, a trois mois et a un an, et nous vous disons ce que la personne nous dit — y compris ce qui fache.',
    temps: [
      ['Jour 30', 'Point avec la personne, seule'],
      ['Mois 3', 'Point croise, avec le manager'],
      ['Mois 12', 'Bilan, et garantie de remplacement si le poste s est vide'],
    ],
  },
]

/**
 * Les consultantes et consultants de l agence.
 *
 * Chaque pastille porte sa teinte : le cycle par defaut du composant monte
 * jusqu au niveau 500, ou l encre claire des initiales tombe sous trois pour
 * un. Les nuances 700 tiennent le rapport dans les deux themes.
 */
const EQUIPE = [
  { name: 'Lea Vaury', tone: '--o-palette-violet-700' },
  { name: 'Tarek Nardi', tone: '--o-palette-teal-700' },
  { name: 'Salome Berthaut', tone: '--o-palette-rose-700' },
  { name: 'Hugo Lecointre', tone: '--o-palette-slate-700' },
] as const

/* ========================= A22 : la question unique ==================== */

/** Les trois reponses, et les trois adresses ou elles menent. */
const REPONSES: readonly {
  readonly cle: string
  readonly reponse: string
  readonly quoi: string
  readonly adresse: string
  readonly note: string
}[] = [
  {
    cle: 'entreprise',
    reponse: 'Nous recrutons',
    quoi: 'Un poste ouvert, ou un poste qu on n arrive pas a fermer depuis trois mois.',
    adresse: 'postes@trait-union.fr',
    note: 'Reponse sous deux jours ouvres, avec une premiere lecture de votre annonce actuelle.',
  },
  {
    cle: 'candidat',
    reponse: 'Je cherche',
    quoi: 'Nous ne gardons pas de base de donnees dormante : nous rappelons quand un poste correspond.',
    adresse: 'candidats@trait-union.fr',
    note: 'Un entretien de trente minutes, meme sans poste ouvert, et pas de relance automatique.',
  },
  {
    cle: 'consoeur',
    reponse: 'Je suis du metier',
    quoi: 'Cooptation entre cabinets sur les postes que nous ne savons pas traiter.',
    adresse: 'confreres@trait-union.fr',
    note: 'Nous refusons environ un poste sur quatre, et nous donnons alors deux noms.',
  },
]

/** Les partenaires du bandeau de pied : des maisons inventees. */
const PARTENAIRES = [
  'Fonderie Lauris',
  'Atelier Cerisy',
  'Maison Vensac',
  'Groupe Tresque',
  'Papeterie Chauve',
  'Verrerie du Blosne',
  'Conserverie des Genets',
] as const

/* ========================= La vitrine ================================== */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('syne')
  const [choix, setChoix] = useState<string | null>(null)
  const reponseChoisie = REPONSES.find((r) => r.cle === choix)

  return (
    <Porte forme="lettres" marque="Trait d Union" sombre={false}>
      <div
        className="o-bg-neutral-50 dark:o-bg-neutral-950 o-text-neutral-800 dark:o-text-neutral-200"
        style={polices}
      >
        {/*
          ----- L ouverture — Portfolite --------------------------------------

          F-css : une nappe violette qui derive derriere le titre. Aucun
          canevas, aucune scene graphique : trois taches floues et du CSS.
        */}
        <div id="haut" className="o-relative o-isolate o-overflow-hidden">
          <Nappe
            couleurs={[accentDoux(400, 40), accentDoux(600, 26), accentDoux(200, 20)]}
            opacite={0.75}
            className="o-z-0"
          />
          <BarreGelule
            marque="Trait d Union"
            liens={NAVIGATION}
            action={['#annonce', 'Tester une annonce']}
            sombre={false}
          />

          <div className="o-relative o-z-10 o-flex o-min-h-screen o-flex-col o-justify-center o-px-6 o-pb-16 o-pt-40 md:o-px-8">
            <Surgit>
              <Etiquette sombre={false}>
                Agence de recrutement — Nantes, quatre consultants
              </Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              className="o-m-0 o-mt-8 o-max-w-5xl o-text-neutral-950 dark:o-text-neutral-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}
            >
              Votre annonce dit deja qui ne postulera pas.
            </TitreVague>
            <Surgit delai={520}>
              <p className="o-mt-9 o-max-w-2xl o-text-lg o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">
                Ecrivez-la ici : la page vous rend les deux listes que nous rendons a nos
                clients au premier rendez-vous. Ce qu elle attirera, ce qu elle fera fuir,
                et la raison de chaque ligne.
              </p>
              <div className="o-mt-10">
                <Actions
                  sombre={false}
                  pleine={[
                    '#annonce',
                    <>
                      Ecrire une fiche de poste{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#methode', 'Comment nous travaillons']}
                />
              </div>
            </Surgit>

            <Surgit
              delai={700}
              className="o-mt-16 o-flex o-flex-wrap o-items-center o-gap-x-8 o-gap-y-4 o-pt-8"
              style={{ borderTop: `1px solid ${FILET}` }}
            >
              <AvatarStack
                items={[...EQUIPE]}
                label="Les consultants de l agence"
                max={4}
              />
              <span className={NOTE}>
                Quatre consultants, trente-huit postes fermes en 2025
              </span>
              <span className={`o-ml-auto ${NOTE}`}>
                Comptabilite · Industrie · Direction
              </span>
            </Surgit>
          </div>
        </div>

        <main>
          {/*
            ----- La bande sombre : le seul ecran de texte de la page ----------
          */}
          <section
            aria-labelledby="dire-titre"
            className="o-px-6 o-py-28 md:o-px-8 md:o-py-40"
            style={nuit('neutral')}
          >
            <div className="o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-neutral-400 md:o-col-span-3">
                Avant le mecanisme
                <br />
                Une seule phrase
              </p>
              <div className="o-min-w-0 md:o-col-span-9">
                <h2 id="dire-titre" className="o-sr-only">
                  Ce que nous disons en premier
                </h2>
                <Manifeste eteint="Un poste qui ne se pourvoit pas n a presque jamais un probleme de candidats —">
                  il a un probleme d annonce, et cela se corrige en une apres-midi.
                </Manifeste>
                <p className="o-mt-10 o-max-w-xl o-leading-relaxed o-text-neutral-300">
                  Nous ne facturons rien pour reecrire une annonce avant d accepter une
                  mission. C est notre maniere de savoir si le poste existe vraiment.
                </p>
              </div>
            </div>
          </section>

          {/*
            ----- Le mecanisme : la fiche de poste -----------------------------
          */}
          <section
            id="annonce"
            aria-labelledby="annonce-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01" sombre={false}>
                  La fiche de poste
                </Indice>
                <h2
                  id="annonce-titre"
                  className="o-m-0 o-mt-5 o-max-w-3xl o-text-neutral-950 dark:o-text-neutral-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}
                >
                  <TrueFocus as="span" hold={1500} couleur={accent(500)}>
                    Ecrivez, la page repond.
                  </TrueFocus>
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                Rien n est envoye nulle part
                <br />
                Le detail des points est sous la fiche
              </p>
            </div>

            <div className="o-mt-16">
              <FicheDePoste />
            </div>
          </section>

          {/*
            ----- La methode, en chapitres a etiquette collante ----------------
          */}
          <section
            id="methode"
            className="o-scroll-mt-24 o-px-6 o-pt-24 md:o-px-8 md:o-pt-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="02" sombre={false}>
                  La methode
                </Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-3xl o-text-neutral-950 dark:o-text-neutral-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}
                >
                  Douze semaines, et un an de suite.
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                Un seul poste a la fois par consultant
                <br />
                Jamais deux clients sur le meme profil
              </p>
            </div>
          </section>

          {METHODE.map((chapitre, rang) => (
            <div key={chapitre.cle} className="o-px-6 o-py-16 md:o-px-8 md:o-py-24">
              <Chapitre
                indice={`${chapitre.numero} — ${String(rang + 1).padStart(2, '0')} / 03`}
                largeur={4}
                titre={
                  <h3
                    className="o-m-0 o-text-neutral-950 dark:o-text-neutral-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
                    }}
                  >
                    {chapitre.titre}
                  </h3>
                }
                texte={
                  <span className="o-block o-text-neutral-600 dark:o-text-neutral-400">
                    {chapitre.texte}
                  </span>
                }
              >
                <ol
                  className="o-m-0 o-list-none o-p-0"
                  style={{ borderBottom: `1px solid ${FILET}` }}
                >
                  {chapitre.temps.map(([quand, quoi]) => (
                    <li
                      key={quoi}
                      className="o-grid o-gap-x-8 o-gap-y-2 o-py-6 md:o-grid-cols-12"
                      style={{ borderTop: `1px solid ${FILET}` }}
                    >
                      <p
                        className={`o-m-0 md:o-col-span-3 ${NOTE}`}
                        style={{ color: encre() }}
                      >
                        {quand}
                      </p>
                      <p className="o-m-0 o-text-lg o-leading-snug o-text-neutral-950 dark:o-text-neutral-50 md:o-col-span-9">
                        {quoi}
                      </p>
                    </li>
                  ))}
                </ol>
              </Chapitre>
            </div>
          ))}

          {/*
            ----- A22 : une question, trois reponses, trois adresses ------------

            La question se repond pour de vrai : choisir une reponse ouvre
            l adresse et sa phrase, et referme les deux autres.
          */}
          <section
            id="qui"
            aria-labelledby="qui-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{
              borderTop: `1px solid ${FILET}`,
              backgroundColor: accentDoux(300, 8),
            }}
          >
            <h2
              id="qui-titre"
              className="o-m-0 o-max-w-4xl o-text-neutral-950 dark:o-text-neutral-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.25rem, 5.6vw, 5.5rem)' }}
            >
              Vous ecrivez pourquoi ?
            </h2>
            <div
              role="group"
              aria-label="Votre situation"
              className="o-mt-14 o-flex o-flex-wrap o-gap-3"
            >
              {REPONSES.map((r) => (
                <button
                  key={r.cle}
                  type="button"
                  aria-pressed={choix === r.cle}
                  onClick={() => {
                    setChoix((precedent) => (precedent === r.cle ? null : r.cle))
                  }}
                  className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-6 o-py-3 o-text-lg o-font-medium focus:o-ring"
                  style={
                    choix === r.cle
                      ? { ...aplat(), borderColor: 'transparent' }
                      : { borderColor: FILET_FORT }
                  }
                >
                  {r.reponse}
                </button>
              ))}
            </div>
            <div aria-live="polite" className="o-mt-12 o-max-w-3xl">
              {reponseChoisie === undefined ? (
                <p className="o-m-0 o-text-lg o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">
                  Trois reponses, trois adresses, trois facons de nous ecrire. Choisissez
                  la votre : nous n avons pas de formulaire unique qui atterrit dans la
                  meme boite.
                </p>
              ) : (
                <div className="o-pt-6" style={{ borderTop: `1px solid ${FILET_FORT}` }}>
                  <p className="o-m-0 o-max-w-2xl o-text-xl o-leading-snug o-text-neutral-950 dark:o-text-neutral-50">
                    {reponseChoisie.quoi}
                  </p>
                  <p className="o-m-0 o-mt-4 o-max-w-2xl o-leading-relaxed o-text-neutral-600 dark:o-text-neutral-400">
                    {reponseChoisie.note}
                  </p>
                  <a
                    href={`mailto:${reponseChoisie.adresse}`}
                    className="o-mt-8 o-inline-flex o-items-center o-gap-3 o-no-underline focus:o-ring"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.4rem, 3.4vw, 2.75rem)',
                      color: encre(),
                    }}
                  >
                    {reponseChoisie.adresse}
                    <Icon icon={ArrowUpRight} size={26} aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </section>
        </main>

        {/*
          ----- P30 : un bandeau de partenaires en gris, puis une ligne --------
        */}
        <footer className="o-pt-14" style={{ borderTop: `1px solid ${FILET}` }}>
          {/*
            Sous mouvement reduit, le bandeau ne defile plus et perd la coupe
            que son animation lui donnait : la rangee deborde alors de la page.
            Le conteneur la reprend et la laisse se parcourir au doigt, avec
            `overflow-y: hidden` declare — sinon la cascade met les deux axes a
            `auto`, et la bande avalerait la molette.
          */}
          <div className="o-min-w-0 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
            <LogoBand
              title="Les maisons pour lesquelles nous avons recrute en 2025"
              speed={34}
            >
              {PARTENAIRES.map((nom) => (
                <span
                  key={nom}
                  className="o-shrink-0 o-px-10 o-text-xl o-font-semibold o-tracking-tight o-text-neutral-500 dark:o-text-neutral-400"
                >
                  {nom}
                </span>
              ))}
            </LogoBand>
          </div>

          <div
            className="o-mt-12 o-flex o-flex-wrap o-items-center o-gap-x-8 o-gap-y-4 o-px-6 o-pb-10 o-pt-6 md:o-px-8"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <span className="o-inline-flex o-items-center o-gap-2 o-text-base o-font-semibold o-tracking-tight o-text-neutral-950 dark:o-text-neutral-50">
              <Icon
                icon={UserRoundSearch}
                size={16}
                style={{ color: encre() }}
                aria-hidden="true"
              />
              Trait d Union
            </span>
            <span className={NOTE}>9 rue Jean-Jaures, 44000 Nantes — 02 40 12 77 05</span>
            {(
              [
                ['#annonce', 'Tester une annonce'],
                ['#methode', 'La methode'],
                ['#haut', 'Mentions legales'],
                ['#haut', 'Donnees personnelles'],
              ] as const
            ).map(([href, mot]) => (
              <a
                key={mot}
                href={href}
                className={`o-no-underline hover:o-text-neutral-950 dark:hover:o-text-neutral-50 focus:o-ring ${NOTE}`}
              >
                {mot}
              </a>
            ))}
            <span className={`o-ml-auto ${NOTE}`}>© 2026 Trait d Union SAS</span>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
