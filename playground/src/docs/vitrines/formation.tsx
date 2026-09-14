/**
 * Atelier Continu — organisme de formation aux metiers de l artisanat.
 *
 * ## Le mecanisme : le parcours
 *
 * Un organisme de formation vend des jours de salle. Celui-ci vend des
 * **heures qui s additionnent** : douze modules, quatre blocs de competences,
 * et un parcours qu on compose soi-meme. Cocher un module recalcule quatre
 * choses a la fois, et toutes sont vraies :
 *
 * 1. le **volume** — heures cumulees, et les journees de sept heures qu il
 *    faudra poser ;
 * 2. la **degressivite** — huit pour cent de remise au-dela de trente-cinq
 *    heures, quinze au-dela de soixante-dix ;
 * 3. la **prise en charge** — soixante pour cent du cout remise, plafonnee a
 *    2 500 EUR par an et par salarie, et le reste a charge qui en decoule ;
 * 4. le **titre** — il demande les quatre blocs couverts et cent vingt heures ;
 *    tant qu il manque un bloc, la page le dit.
 *
 * Les prerequis sont tenus : cocher « Repondre a un marche public » ajoute
 * « Chiffrer un devis », et la page l annonce au lieu de le faire en douce.
 *
 * ## La mise en scene
 *
 * Filiation Baseline : du clair, une nappe qui derive, aucune ombre lourde.
 * Signature de mouvement **M-rail** — le catalogue des modules se parcourt de
 * cote pendant qu on defile, et le decompte reste pose en haut de l ecran.
 *
 * Les trois formes : **A41**, un essai de quinze minutes sans compte, avec un
 * vrai exercice et un vrai compte a rebours ; **P42**, un pied en tableau
 * d horaires, noir comme un panneau de gare ; **C11**, une jauge unique qui se
 * remplit au defilement, de la premiere heure au titre.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, Check, Clock, Plus } from '@odoro-cli/icons/filaire'
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'

import { LetterSwap } from '@/odoro/text/LetterSwap.jsx'
import { AnimatedList } from '@/odoro/ui/AnimatedList.jsx'
import { Stepper } from '@/odoro/ui/Stepper.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Logos,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Epingle, Nappe, Rail } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la gelule. */
const NAVIGATION: readonly Lien[] = [
  ['#parcours', 'Le parcours'],
  ['#titre', 'Le titre'],
  ['#essai', 'L essai'],
]

/* ============================ Les blocs ================================ */

/** Un bloc de competences, tel que le referentiel du titre le decoupe. */
interface Bloc {
  readonly cle: string
  readonly nom: string
  readonly verbe: string
}

const BLOCS: readonly Bloc[] = [
  { cle: 'chiffrer', nom: 'Chiffrer', verbe: 'Savoir ce que coute une heure d atelier' },
  { cle: 'poser', nom: 'Poser', verbe: 'Le geste, le trace, la matiere' },
  { cle: 'tenir', nom: 'Tenir', verbe: 'Conduire un chantier et une equipe' },
  { cle: 'transmettre', nom: 'Transmettre', verbe: 'Reprendre, former, raconter' },
]

/* ============================ Les modules ============================== */

/** Un module du catalogue. */
interface Module {
  readonly cle: string
  readonly nom: string
  readonly bloc: string
  readonly heures: number
  readonly prix: number
  /** Ce qu il faut avoir suivi avant. */
  readonly prerequis?: string
  readonly texte: string
  /** Ce qu on sait faire a la sortie, ecrit au resultat et non au programme. */
  readonly sortie: string
}

const MODULES: readonly Module[] = [
  {
    cle: 'revient',
    nom: 'Le prix de revient horaire',
    bloc: 'chiffrer',
    heures: 7,
    prix: 520,
    texte:
      'Loyer, machines, assurances, temps non facturable. On ouvre vos propres chiffres, pas un cas d ecole.',
    sortie: 'Vous sortez avec votre taux horaire, calcule sur vos douze derniers mois.',
  },
  {
    cle: 'devis',
    nom: 'Chiffrer un devis',
    bloc: 'chiffrer',
    heures: 14,
    prix: 980,
    texte:
      'Metre, debours, marge, alea. Trois devis reels sont refaits en salle, et compares a ce qui a ete facture.',
    sortie: 'Un devis de quatre pages chiffre en moins de deux heures.',
  },
  {
    cle: 'marche',
    nom: 'Repondre a un marche public',
    bloc: 'chiffrer',
    heures: 21,
    prix: 1450,
    prerequis: 'devis',
    texte:
      'Le dossier de consultation, le memoire technique, la dematerialisation. On depose une offre blanche en fin de session.',
    sortie:
      'Un memoire technique de huit pages, reutilisable, ecrit pendant la formation.',
  },
  {
    cle: 'plan',
    nom: 'Lecture de plan et tracage',
    bloc: 'poser',
    heures: 21,
    prix: 1290,
    texte:
      'Echelles, cotes, niveaux, reserves. Le trace se fait au sol, en grandeur reelle, dans la halle.',
    sortie: 'Un plan d execution releve et trace sans reprise.',
  },
  {
    cle: 'metre',
    nom: 'Metre et calepinage',
    bloc: 'poser',
    heures: 14,
    prix: 940,
    prerequis: 'plan',
    texte:
      'Quantifier sans sur-commander. Les chutes sont pesees en fin de session, et comparees d un stagiaire a l autre.',
    sortie: 'Moins de sept pour cent de chute sur un calepinage courant.',
  },
  {
    cle: 'sousoeuvre',
    nom: 'Reprise en sous-oeuvre',
    bloc: 'poser',
    heures: 35,
    prix: 2380,
    prerequis: 'plan',
    texte:
      'Etaiement, verinage, maconnerie de reprise. Cinq jours en halle sur un mur monte pour etre repris.',
    sortie: 'Une reprise de fondation menee de bout en bout, sous controle.',
  },
  {
    cle: 'chantier',
    nom: 'Conduire un chantier a deux',
    bloc: 'tenir',
    heures: 14,
    prix: 980,
    texte:
      'Planning, approvisionnement, co-activite. Ecrit pour les entreprises de un a cinq, pas pour les majors.',
    sortie: 'Un planning de chantier tenu sur trois semaines, avec ses aleas.',
  },
  {
    cle: 'securite',
    nom: 'Securite et document unique',
    bloc: 'tenir',
    heures: 7,
    prix: 460,
    texte:
      'L obligation, sa forme reelle, et comment la tenir a jour en une heure par trimestre.',
    sortie: 'Votre document unique, redige et signe en fin de journee.',
  },
  {
    cle: 'apprenti',
    nom: 'Recruter et former un apprenti',
    bloc: 'tenir',
    heures: 14,
    prix: 890,
    texte:
      'Le contrat, le tuteur, les six premieres semaines. Deux maitres d apprentissage interviennent en salle.',
    sortie: 'Un plan de formation des trois premiers mois, ecrit.',
  },
  {
    cle: 'reprise',
    nom: 'Reprendre une entreprise artisanale',
    bloc: 'transmettre',
    heures: 28,
    prix: 1950,
    texte:
      'Evaluation, financement, clientele, hommes. Le cas travaille est une reprise reelle, anonymisee.',
    sortie: 'Un plan de reprise chiffre, defendable devant une banque.',
  },
  {
    cle: 'parler',
    nom: 'Parler de son travail',
    bloc: 'transmettre',
    heures: 7,
    prix: 490,
    texte:
      'Dire un metier en trois phrases, devant un client, une mairie ou une camera. Filme, revu, refait.',
    sortie: 'Une presentation de deux minutes, tenue sans notes.',
  },
  {
    cle: 'photo',
    nom: 'Photographier ses chantiers',
    bloc: 'transmettre',
    heures: 7,
    prix: 520,
    texte:
      'Avant, pendant, apres. Lumiere, cadrage, classement. Avec le telephone que vous avez deja.',
    sortie: 'Trente photographies exploitables par chantier, classees.',
  },
]

/** Le module, par sa cle. */
function moduleDe(cle: string): Module | undefined {
  return MODULES.find((m) => m.cle === cle)
}

/* ============================ Le calcul ================================ */

/** Le plafond annuel de prise en charge, par salarie. */
const PLAFOND = 2500

/** Les heures qu il faut pour pretendre au titre. */
const HEURES_TITRE = 120

/** Ce que vaut un parcours. */
interface Compte {
  readonly heures: number
  readonly jours: number
  readonly brut: number
  readonly remise: number
  readonly net: number
  readonly priseEnCharge: number
  readonly reste: number
  readonly blocs: readonly string[]
  readonly titre: boolean
}

/** Le decompte d un parcours, remise et prise en charge comprises. */
function compter(choisis: readonly string[]): Compte {
  const modules = choisis.map(moduleDe).filter((m): m is Module => m !== undefined)
  const heures = modules.reduce((somme, m) => somme + m.heures, 0)
  const brut = modules.reduce((somme, m) => somme + m.prix, 0)
  // La degressivite recompense le volume : c est la seule remise de la maison,
  // elle est ecrite au tarif et elle ne se negocie pas.
  const taux = heures > 70 ? 0.15 : heures > 35 ? 0.08 : 0
  const remise = Math.round(brut * taux)
  const net = brut - remise
  const priseEnCharge = Math.min(PLAFOND, Math.round(net * 0.6))
  const blocs = BLOCS.map((b) => b.cle).filter((cle) =>
    modules.some((m) => m.bloc === cle),
  )
  return {
    heures,
    jours: Math.ceil(heures / 7),
    brut,
    remise,
    net,
    priseEnCharge,
    reste: net - priseEnCharge,
    blocs,
    titre: blocs.length === BLOCS.length && heures >= HEURES_TITRE,
  }
}

/** Un montant en euros, ecrit a la francaise. */
function euros(n: number): string {
  return `${Math.round(n).toLocaleString('fr-FR')} EUR`
}

/* ============================ Les sessions ============================= */

/** Une session au calendrier — ce que la liste animee montre. */
const SESSIONS = [
  { id: 'oct-06', quand: '6 octobre', module: 'devis', places: 'quatre places' },
  { id: 'oct-13', quand: '13 octobre', module: 'plan', places: 'deux places' },
  { id: 'nov-03', quand: '3 novembre', module: 'revient', places: 'huit places' },
  {
    id: 'nov-17',
    quand: '17 novembre',
    module: 'sousoeuvre',
    places: 'complet — liste d attente',
  },
  { id: 'dec-01', quand: '1er decembre', module: 'reprise', places: 'six places' },
] as const

/* ============================ Le pied (P42) ============================ */

/** Une ligne du tableau d horaires. */
const DEPARTS = [
  ['08 h 30', 'Le prix de revient horaire', 'Salle 1', '7 h', 'A l heure'],
  ['08 h 30', 'Lecture de plan et tracage', 'Halle', '21 h', 'A l heure'],
  ['13 h 30', 'Securite et document unique', 'Salle 2', '7 h', 'Deux places'],
  ['13 h 30', 'Chiffrer un devis', 'Salle 1', '14 h', 'Complet'],
  ['18 h 00', 'Parler de son travail', 'Studio', '7 h', 'Ouvert'],
] as const

/* ============================ L essai (A41) ============================ */

/** Une etape de l essai, avec sa question et sa reponse. */
const ESSAI = [
  {
    titre: 'Les charges',
    question:
      'Un atelier depense 4 200 EUR par mois — loyer, machines, assurances, comptable, vehicule. Vous travaillez seul. Combien cela fait-il par an ?',
    reponse:
      '50 400 EUR. On ne divise rien encore : on pose le total, charges sociales du gerant comprises quand il s en verse.',
  },
  {
    titre: 'Les heures',
    question:
      'Vous ouvrez 45 semaines. Sur 39 heures hebdomadaires, combien sont reellement facturables ?',
    reponse:
      'Environ 1 100, pas 1 755. Devis, achats, deplacements et relances mangent un tiers du temps, et ce tiers est paye par les deux autres.',
  },
  {
    titre: 'Le taux',
    question:
      'Charges annuelles sur heures facturables, plus le salaire que vous voulez vous verser. Ou tombe votre taux horaire ?',
    reponse:
      '46 EUR de couverture des charges, plus 28 EUR de remuneration : 74 EUR de l heure avant marge. Le tarif affiche a 45 EUR de l heure vous fait travailler a perte, et c est la le sujet du module.',
  },
] as const

/** La duree de l essai, en secondes. */
const DUREE_ESSAI = 15 * 60

/** Le compte a rebours de l essai, mm:ss. */
function minutes(secondes: number): string {
  const m = Math.floor(secondes / 60)
  const s = secondes % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** L essai de quinze minutes : un vrai exercice, sans compte et sans carte. */
function Essai(): ReactElement {
  const [reste, setReste] = useState<number | null>(null)
  const [etape, setEtape] = useState(0)
  const [vu, setVu] = useState(false)

  // Le rebours tourne tant que l essai est ouvert. La dependance est le seul
  // fait d etre parti — pas la valeur, qui changerait l abonnement a chaque
  // seconde et remonterait un minuteur par tic.
  const parti = reste !== null
  useEffect(() => {
    if (!parti) return
    const identifiant = window.setInterval(() => {
      setReste((precedent) => (precedent === null || precedent <= 0 ? 0 : precedent - 1))
    }, 1000)
    return () => {
      window.clearInterval(identifiant)
    }
  }, [parti])

  const courant = ESSAI[etape] ?? ESSAI[0]

  if (reste === null) {
    return (
      <div
        className="o-border-w-1 o-p-8 md:o-p-12"
        style={{
          borderColor: 'var(--o-theme-line)',
          backgroundColor: 'var(--o-theme-bg)',
        }}
      >
        <p
          className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
          style={{ color: encre() }}
        >
          <Icon icon={Clock} size={14} aria-hidden="true" />
          Quinze minutes — aucun compte, aucune carte
        </p>
        <p
          className="o-m-0 o-mt-5 o-max-w-2xl o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
          style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3.2vw, 2.75rem)' }}
        >
          Trois questions, et vous saurez si votre taux horaire tient.
        </p>
        <p className="o-m-0 o-mt-4 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
          C est le premier quart d heure du module « Le prix de revient horaire », en
          entier. Rien n est enregistre, rien ne vous est demande, et personne ne vous
          rappellera.
        </p>
        <button
          type="button"
          onClick={() => {
            setReste(DUREE_ESSAI)
          }}
          className="o-mt-8 o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-border-w-0 o-px-8 o-py-4 o-text-base o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
          style={aplat()}
        >
          Commencer l essai
          <Icon icon={ArrowDown} size={16} aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="o-border-w-1 o-p-8 md:o-p-12"
      style={{ borderColor: encre(), backgroundColor: 'var(--o-theme-bg)' }}
    >
      <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-300">
          Le prix de revient horaire — extrait
        </p>
        <p
          className="o-m-0 o-font-mono o-text-2xl o-tabular-nums"
          style={{ color: reste === 0 ? 'var(--o-theme-muted)' : encre() }}
          aria-live="off"
        >
          {minutes(reste)}
        </p>
      </div>

      <div className="o-mt-8">
        <Stepper
          label="L essai en trois etapes"
          orientation="vertical"
          reach="all"
          value={etape}
          onChange={(rang) => {
            setEtape(rang)
            setVu(false)
          }}
          steps={ESSAI.map((e) => ({ id: e.titre, label: e.titre }))}
        >
          <div>
            <p className="o-m-0 o-max-w-2xl o-text-lg o-leading-relaxed o-text-zinc-900 dark:o-text-zinc-100">
              {courant.question}
            </p>
            {vu ? (
              <p
                className="o-m-0 o-mt-6 o-max-w-2xl o-pl-5 o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300"
                style={{ borderLeft: `4px solid ${encre()}` }}
              >
                {courant.reponse}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setVu(true)
                }}
                className="o-mt-6 o-cursor-pointer o-rounded-full o-border-w-1 o-bg-transparent o-px-5 o-py-2 o-text-sm o-transition-colors focus:o-ring"
                style={{ borderColor: 'var(--o-theme-line)', color: 'var(--o-theme-fg)' }}
              >
                Voir la reponse
              </button>
            )}
            {vu && etape < ESSAI.length - 1 && (
              <div className="o-mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setEtape(etape + 1)
                    setVu(false)
                  }}
                  className="o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-border-w-0 o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Question suivante
                </button>
              </div>
            )}
            {vu && etape === ESSAI.length - 1 && (
              <p className="o-m-0 o-mt-8 o-max-w-2xl o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                Le module dure sept heures et se termine sur{' '}
                <strong className="o-font-semibold">vos</strong> chiffres. Il coute 520
                EUR, dont 312 pris en charge dans le cas le plus courant.
              </p>
            )}
          </div>
        </Stepper>
      </div>
    </div>
  )
}

/* ============================ La jauge (C11) =========================== */

/** Les jalons de la jauge, en heures. */
const JALONS = [
  {
    heures: 0,
    nom: 'La premiere heure',
    texte: 'On vient pour un module, souvent le moins cher, souvent en urgence.',
  },
  {
    heures: 70,
    nom: 'Soixante-dix heures',
    texte:
      'L attestation de competences est delivree, et la remise passe a huit pour cent.',
  },
  {
    heures: 210,
    nom: 'Deux cent dix heures',
    texte:
      'Un bloc entier est valide. Il se garde cinq ans, et il se complete quand vous voulez.',
  },
  {
    heures: 420,
    nom: 'Quatre cent vingt heures',
    texte:
      'Le titre d artisan responsable d atelier, inscrit au repertoire national. Personne ne le fait en un an, et c est tres bien ainsi.',
  },
] as const

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  const { reduced } = useMotionState()
  const [choisis, setChoisis] = useState<readonly string[]>(['revient', 'devis'])
  const [avis, setAvis] = useState<string | null>(null)
  const [session, setSession] = useState<string>(SESSIONS[0].id)

  const compte = useMemo(() => compter(choisis), [choisis])

  /** Cocher ou decocher un module, prerequis tenus. */
  const basculer = useCallback((cle: string) => {
    setChoisis((precedents) => {
      if (precedents.includes(cle)) {
        // Retirer un module retire ceux qui en dependaient : sans quoi le
        // parcours annoncerait un prerequis qui n y est plus.
        const orphelins = MODULES.filter((m) => m.prerequis === cle).map((m) => m.cle)
        setAvis(
          orphelins.some((o) => precedents.includes(o))
            ? `« ${moduleDe(orphelins[0] ?? '')?.nom ?? ''} » est retire avec son prerequis.`
            : null,
        )
        return precedents.filter((c) => c !== cle && !orphelins.includes(c))
      }
      const module = moduleDe(cle)
      const prerequis = module?.prerequis
      if (prerequis !== undefined && !precedents.includes(prerequis)) {
        setAvis(`« ${moduleDe(prerequis)?.nom ?? ''} » est ajoute : c est le prerequis.`)
        return [...precedents, prerequis, cle]
      }
      setAvis(null)
      return [...precedents, cle]
    })
  }, [])

  return (
    <Porte forme="compteur" marque="Atelier Continu" sombre={false}>
      {/*
        Aucun decoupage sur cette enveloppe : masquer le debordement en ferait
        un conteneur de defilement, et tout ce qui est colle a l interieur —
        le rail des modules, la jauge epinglee — cesserait de coller. Le
        debordement lateral est evite a la source, section par section.
      */}
      <div
        className="o-relative"
        style={{ ...polices, backgroundColor: accentDoux(100, 8) }}
      >
        {/* La nappe : le fond anime de la page, sans canevas. */}
        <Nappe
          couleurs={[accentDoux(400, 40), accentDoux(200, 55), accentDoux(600, 22)]}
          opacite={0.55}
          className="o-fixed o-inset-0 o-z-0"
        />

        <div className="o-relative o-z-10">
          {/*
            ----- L ouverture ---------------------------------------------------
          */}
          {/*
            La gelule est posee hors du heros : une section marquee `isolate`
            ouvre un contexte d empilement, et une barre fixe qui y vit passe
            sous toutes les sections suivantes.
          */}
          <BarreGelule
            marque="Atelier Continu"
            liens={NAVIGATION}
            action={['#essai', 'Essai de 15 min']}
            sombre={false}
          />

          <section
            id="haut"
            className="o-relative o-flex o-flex-col"
            style={{ minHeight: ECRAN }}
          >
            <div className="o-mx-auto o-grid o-w-full o-max-w-7xl o-grow o-items-center o-gap-12 o-px-6 o-pb-20 o-pt-36 md:o-grid-cols-12 md:o-px-10">
              <div className="md:o-col-span-7">
                <Surgit>
                  <Etiquette sombre={false}>
                    Organisme certifie Qualiopi — Saint-Etienne, halle de la Chapelle
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  cadence={80}
                  className="o-m-0 o-mt-7 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('l', 300),
                    fontSize: 'clamp(2.4rem, 6.6vw, 6.5rem)',
                    letterSpacing: '-0.045em',
                    lineHeight: 0.96,
                  }}
                >
                  On apprend un metier en heures, pas en journees.
                </TitreVague>
                <Surgit
                  delai={600}
                  as="p"
                  className="o-m-0 o-mt-8 o-max-w-lg o-text-lg o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300"
                >
                  Douze modules, quatre blocs, et un parcours que vous composez. La duree,
                  le cout et le reste a charge se calculent devant vous.
                </Surgit>
                <Surgit delai={740} className="o-mt-9">
                  <Actions
                    pleine={[
                      '#parcours',
                      <>
                        Composer un parcours{' '}
                        <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['#essai', 'Quinze minutes d essai']}
                    sombre={false}
                  />
                </Surgit>
              </div>

              {/* La carte flottante : le module le plus suivi. */}
              <Surgit delai={860} className="md:o-col-span-5">
                <div
                  className="o-mx-auto o-max-w-sm o-border-w-1 o-p-7"
                  style={{
                    borderColor: 'var(--o-theme-line)',
                    backgroundColor: 'var(--o-theme-bg)',
                    transform: 'rotate(-1.6deg)',
                    boxShadow: '0 24px 60px -40px rgba(0,0,0,0.45)',
                  }}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Le plus suivi cette annee
                  </p>
                  <p className="o-m-0 o-mt-4 o-text-2xl o-font-semibold o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                    Le prix de revient horaire
                  </p>
                  <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                    Sept heures. On ouvre vos chiffres, et la moitie des stagiaires
                    decouvre qu ils travaillent a perte.
                  </p>
                  <dl
                    className="o-m-0 o-mt-6 o-grid o-grid-cols-3 o-gap-4 o-border-t o-pt-5"
                    style={{ borderColor: 'var(--o-theme-line)' }}
                  >
                    {(
                      [
                        ['Duree', '7 h'],
                        ['Tarif', '520 EUR'],
                        ['Reste', '208 EUR'],
                      ] as const
                    ).map(([quoi, valeur]) => (
                      <div key={quoi}>
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                          {quoi}
                        </dt>
                        <dd
                          className="o-m-0 o-mt-1 o-text-base o-font-semibold o-tabular-nums"
                          style={{ color: encre() }}
                        >
                          {valeur}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Surgit>
            </div>

            <div className="o-hidden md:o-block">
              <Coin position="bd" sombre={false}>
                Sessions de six a dix stagiaires
                <br />
                Aucun module a distance
              </Coin>
            </div>
          </section>

          <div className="o-px-6 md:o-px-10">
            {/*
              Le decoupage est pose ici et non sur la page : sous mouvement
              reduit la bande defilante perd son `overflow` et deborderait,
              et masquer les deux axes sur un bloc sans rien de colle a
              l interieur ne coute rien.
            */}
            <div
              className="o-mx-auto o-max-w-7xl o-overflow-hidden o-border-t"
              style={{ borderColor: 'var(--o-theme-line)' }}
            >
              <Logos
                sombre={false}
                titre="Ils nous envoient leurs equipes"
                marques={[
                  'Charpente Vialle',
                  'Maconnerie du Furan',
                  'Atelier Brasseur',
                  'Couverture Lheritier',
                  'Menuiserie Sauge',
                  'Terre & Chaux',
                ]}
              />
            </div>
          </div>

          {/*
            ----- Le mecanisme : le rail des modules (M-rail) --------------------
          */}
          <section id="parcours" className="o-scroll-mt-24">
            <Rail
              ecrans={4}
              entete={
                <div
                  className="o-border-b o-px-6 o-pb-6 o-pt-24 md:o-px-10"
                  style={{
                    borderColor: 'var(--o-theme-line)',
                    backgroundColor: accentDoux(100, 14),
                  }}
                >
                  <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-end o-justify-between o-gap-6">
                    <div>
                      <Indice rang="01" sombre={false}>
                        Le parcours
                      </Indice>
                      <h2
                        className="o-m-0 o-mt-3 o-max-w-md o-text-zinc-950 dark:o-text-zinc-50"
                        style={{
                          ...affiche('m', 300),
                          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                          letterSpacing: '-0.04em',
                        }}
                      >
                        Cochez, le compte se fait
                      </h2>
                    </div>

                    <dl className="o-m-0 o-flex o-flex-wrap o-gap-x-8 o-gap-y-3">
                      {(
                        [
                          ['Heures', `${String(compte.heures)} h`],
                          ['Journees', String(compte.jours)],
                          ['Tarif net', euros(compte.net)],
                          ['Reste a charge', euros(compte.reste)],
                        ] as const
                      ).map(([quoi, valeur]) => (
                        <div key={quoi}>
                          <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                            {quoi}
                          </dt>
                          <dd
                            className="o-m-0 o-mt-1 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
                            style={{
                              ...affiche('m', 300),
                              fontSize: 'clamp(1.25rem, 2.2vw, 1.9rem)',
                            }}
                          >
                            {valeur}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {/* Les quatre blocs : allumes des qu un module les couvre. */}
                    <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
                      {BLOCS.map((bloc) => {
                        const couvert = compte.blocs.includes(bloc.cle)
                        return (
                          <li
                            key={bloc.cle}
                            className="o-rounded-full o-border-w-1 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                            style={
                              couvert
                                ? { ...aplat(), borderColor: 'transparent' }
                                : {
                                    borderColor: 'var(--o-theme-line)',
                                    color: 'var(--o-theme-muted)',
                                  }
                            }
                          >
                            {bloc.nom}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                  <p
                    aria-live="polite"
                    className="o-m-0 o-mx-auto o-mt-4 o-max-w-7xl o-text-sm o-text-zinc-600 dark:o-text-zinc-300"
                    style={{ minHeight: '1.25rem' }}
                  >
                    {avis}
                  </p>
                </div>
              }
            >
              {MODULES.map((module) => {
                const pris = choisis.includes(module.cle)
                const bloc = BLOCS.find((b) => b.cle === module.bloc)
                return (
                  <article
                    key={module.cle}
                    className="o-ml-6 o-flex o-w-80 o-shrink-0 o-flex-col o-border-w-1 o-p-6 md:o-ml-8 md:o-w-96"
                    style={{
                      borderColor: pris ? encre() : 'var(--o-theme-line)',
                      backgroundColor: pris ? accentDoux(200, 26) : 'var(--o-theme-bg)',
                    }}
                  >
                    <p className="o-m-0 o-flex o-items-center o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                      <span>{bloc?.nom}</span>
                      <span className="o-tabular-nums" style={{ color: encre() }}>
                        {module.heures} h · {euros(module.prix)}
                      </span>
                    </p>
                    <h3 className="o-m-0 o-mt-5 o-text-2xl o-font-semibold o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                      <LetterSwap step={18}>{module.nom}</LetterSwap>
                    </h3>
                    <p className="o-m-0 o-mt-4 o-grow o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      {module.texte}
                    </p>
                    <p
                      className="o-m-0 o-mt-5 o-border-t o-pt-4 o-text-sm o-leading-relaxed o-text-zinc-800 dark:o-text-zinc-200"
                      style={{ borderColor: 'var(--o-theme-line)' }}
                    >
                      {module.sortie}
                    </p>
                    {module.prerequis !== undefined && (
                      <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        Prerequis — {moduleDe(module.prerequis)?.nom}
                      </p>
                    )}
                    <button
                      type="button"
                      aria-pressed={pris}
                      onClick={() => {
                        basculer(module.cle)
                      }}
                      className="o-mt-6 o-inline-flex o-cursor-pointer o-items-center o-justify-center o-gap-2 o-rounded-full o-border-w-1 o-px-5 o-py-2.5 o-text-sm o-font-semibold o-transition-colors focus:o-ring"
                      style={
                        pris
                          ? { ...aplat(), borderColor: 'transparent' }
                          : {
                              borderColor: 'var(--o-theme-line)',
                              color: 'var(--o-theme-fg)',
                              backgroundColor: 'transparent',
                            }
                      }
                    >
                      <Icon icon={pris ? Check : Plus} size={15} aria-hidden="true" />
                      {pris ? 'Dans le parcours' : 'Ajouter au parcours'}
                    </button>
                  </article>
                )
              })}
            </Rail>
          </section>

          {/*
            ----- Le detail du parcours -----------------------------------------
          */}
          <section
            id="titre"
            className="o-scroll-mt-24 o-border-t o-px-6 o-py-20 md:o-px-10 md:o-py-28"
            style={{ borderColor: 'var(--o-theme-line)' }}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-7">
                <Indice rang="02" sombre={false}>
                  Le compte
                </Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-xl o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {compte.heures === 0
                    ? 'Votre parcours est vide.'
                    : `${String(compte.heures)} heures, ${String(compte.jours)} journees a poser.`}
                </h2>

                <dl aria-live="polite" className="o-m-0 o-mt-10">
                  {(
                    [
                      [
                        'Tarif catalogue',
                        euros(compte.brut),
                        `${String(choisis.length)} module${choisis.length > 1 ? 's' : ''}`,
                      ],
                      [
                        'Degressivite',
                        compte.remise === 0 ? '—' : `- ${euros(compte.remise)}`,
                        compte.heures > 70
                          ? 'quinze pour cent au-dela de 70 h'
                          : compte.heures > 35
                            ? 'huit pour cent au-dela de 35 h'
                            : 'a partir de 35 heures',
                      ],
                      [
                        'Tarif net',
                        euros(compte.net),
                        'ce qui est facture a l entreprise',
                      ],
                      [
                        'Prise en charge',
                        `- ${euros(compte.priseEnCharge)}`,
                        compte.priseEnCharge >= PLAFOND
                          ? 'plafond annuel atteint'
                          : 'soixante pour cent du net',
                      ],
                    ] as const
                  ).map(([quoi, valeur, note]) => (
                    <div
                      key={quoi}
                      className="o-grid o-gap-x-6 o-gap-y-1 o-border-t o-py-4 md:o-grid-cols-12"
                      style={{ borderColor: 'var(--o-theme-line)' }}
                    >
                      <dt className="md:o-col-span-7">
                        <span className="o-block o-text-base o-font-medium o-text-zinc-950 dark:o-text-zinc-50">
                          {quoi}
                        </span>
                        <span className="o-mt-1 o-block o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
                          {note}
                        </span>
                      </dt>
                      <dd className="o-m-0 o-font-mono o-tabular-nums o-text-zinc-900 dark:o-text-zinc-100 md:o-col-span-5 md:o-text-right">
                        {valeur}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div
                  className="o-mt-10 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-border-w-1 o-p-6"
                  style={{ borderColor: encre(), backgroundColor: accentDoux(300, 14) }}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-700 dark:o-text-zinc-300">
                    Reste a charge de l entreprise
                  </p>
                  <p
                    className="o-m-0 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.9rem, 3.6vw, 3rem)',
                    }}
                  >
                    {euros(compte.reste)}
                  </p>
                </div>

                <p className="o-m-0 o-mt-6 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                  {compte.titre
                    ? 'Les quatre blocs sont couverts et les cent vingt heures sont atteintes : ce parcours ouvre le titre d artisan responsable d atelier.'
                    : `Pour le titre, il manque ${compte.blocs.length < BLOCS.length ? `${String(BLOCS.length - compte.blocs.length)} bloc${BLOCS.length - compte.blocs.length > 1 ? 's' : ''}` : ''}${compte.blocs.length < BLOCS.length && compte.heures < HEURES_TITRE ? ' et ' : ''}${compte.heures < HEURES_TITRE ? `${String(HEURES_TITRE - compte.heures)} heures` : ''}. On peut aussi ne pas le viser : la moitie de nos stagiaires ne le vise pas.`}
                </p>
              </div>

              {/* Les prochaines sessions, en liste animee. */}
              <div className="lg:o-col-span-5">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Les prochaines sessions
                </p>
                <AnimatedList
                  label="Les prochaines sessions"
                  value={session}
                  onChange={setSession}
                  fade={false}
                  className="o-mt-5"
                  style={{ height: 'auto' }}
                  items={SESSIONS.map((s) => ({
                    id: s.id,
                    label: `${s.quand} — ${moduleDe(s.module)?.nom ?? ''}`,
                    hint: s.places,
                  }))}
                />
                <p className="o-m-0 o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Une session se tient a six stagiaires au minimum. En dessous, elle est
                  reportee et personne n avance d argent.
                </p>
              </div>
            </div>
          </section>

          {/*
            ----- La coupe sombre ------------------------------------------------
          */}
          <section
            className="o-flex o-items-center o-px-6 o-py-24 md:o-px-10 md:o-py-36"
            style={nuit('zinc')}
          >
            <div className="o-mx-auto o-w-full o-max-w-7xl">
              <Manifeste eteint="Nous ne vendons pas des journees de salle.">
                Nous vendons des gens qui rentrent lundi en sachant faire quelque chose qu
                ils ne savaient pas faire vendredi.
              </Manifeste>
              <p className="o-m-0 o-mt-10 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-400">
                C est pour cela que chaque module se termine sur un livrable qui vous
                appartient : un devis, un document unique, un plan de reprise. Pas une
                attestation.
              </p>
            </div>
          </section>

          {/*
            ----- La jauge unique, qui se remplit au defilement (C11) -------------
          */}
          <Epingle ecrans={3} actes={JALONS.length}>
            {(acte) => {
              const jalon = JALONS[acte] ?? JALONS[0]
              return (
                <div
                  className="o-flex o-h-full o-flex-col o-justify-center o-px-6 md:o-px-10"
                  style={{ backgroundColor: accentDoux(100, 10) }}
                >
                  <div className="o-mx-auto o-w-full o-max-w-5xl">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                      (03) — De la premiere heure au titre
                    </p>
                    <p
                      className="o-m-0 o-mt-6 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
                      style={{
                        ...affiche('l', 300),
                        fontSize: 'clamp(2.5rem, 8vw, 7rem)',
                        lineHeight: 0.9,
                      }}
                    >
                      {jalon.nom}
                    </p>

                    {/* La jauge : une seule, et elle se remplit avec --p. */}
                    <div
                      className="o-relative o-mt-12 o-h-14 o-w-full o-overflow-hidden o-border-w-1"
                      style={{
                        borderColor: 'var(--o-theme-line)',
                        backgroundColor: 'var(--o-theme-bg)',
                      }}
                    >
                      <div
                        className="o-h-full"
                        style={{
                          width: reduced ? '100%' : 'calc(var(--p, 0) * 100%)',
                          backgroundColor: accent(500),
                        }}
                      />
                      {[70, 210, 420].map((h) => (
                        <span
                          key={h}
                          aria-hidden="true"
                          className="o-absolute o-inset-y-0 o-w-px"
                          style={{
                            left: `${String((h / 420) * 100)}%`,
                            backgroundColor: 'var(--o-palette-zinc-950)',
                            opacity: 0.45,
                          }}
                        />
                      ))}
                    </div>
                    <div
                      aria-hidden="true"
                      className="o-mt-2 o-flex o-justify-between o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400"
                    >
                      <span>0 h</span>
                      <span>70 h</span>
                      <span>210 h</span>
                      <span>420 h</span>
                    </div>

                    <p className="o-m-0 o-mt-10 o-max-w-xl o-text-lg o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                      {jalon.texte}
                    </p>
                  </div>
                </div>
              )
            }}
          </Epingle>

          {/*
            ----- L essai de quinze minutes, sans compte (A41) --------------------
          */}
          <section
            id="essai"
            className="o-scroll-mt-24 o-border-t o-px-6 o-py-20 md:o-px-10 md:o-py-28"
            style={{ borderColor: 'var(--o-theme-line)' }}
          >
            <div className="o-mx-auto o-max-w-4xl">
              <Essai />
            </div>
          </section>

          {/*
            ----- Le pied : un tableau d horaires (P42) ---------------------------
          */}
          <footer className="o-px-6 o-py-16 md:o-px-10" style={nuit('zinc')}>
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-4">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  Departs du jour — halle de la Chapelle
                </p>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  Mise a jour a 06 h 00
                </p>
              </div>

              <div className="o-mt-6 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
                <table
                  className="o-w-full o-text-left o-font-mono o-text-sm"
                  style={{ minWidth: 620, borderCollapse: 'collapse' }}
                >
                  <thead>
                    <tr className="o-border-b o-border-white-20">
                      {(['Heure', 'Module', 'Salle', 'Duree', 'Etat'] as const).map(
                        (entete) => (
                          <th
                            key={entete}
                            scope="col"
                            className="o-py-3 o-pr-6 o-text-xs o-uppercase o-tracking-widest o-font-normal o-text-zinc-400"
                          >
                            {entete}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {DEPARTS.map(([heure, module, salle, duree, etat]) => (
                      <tr
                        key={`${heure}-${module}`}
                        className="o-border-b o-border-white-10"
                      >
                        <td className="o-py-4 o-pr-6 o-tabular-nums o-text-zinc-100">
                          {heure}
                        </td>
                        <td className="o-py-4 o-pr-6 o-text-zinc-100">{module}</td>
                        <td className="o-py-4 o-pr-6 o-text-zinc-400">{salle}</td>
                        <td className="o-py-4 o-pr-6 o-tabular-nums o-text-zinc-400">
                          {duree}
                        </td>
                        <td
                          className="o-py-4 o-pr-6"
                          style={{
                            color:
                              etat === 'Complet'
                                ? 'var(--o-palette-zinc-500)'
                                : encreSurSombre(),
                          }}
                        >
                          {etat}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="o-mt-12 o-grid o-gap-8 o-border-t o-border-white-10 o-pt-8 md:o-grid-cols-4">
                {(
                  [
                    ['Adresse', ['12 rue de la Chapelle', '42000 Saint-Etienne']],
                    ['Accueil', ['Lundi au jeudi, 8 h — 18 h', 'Vendredi, 8 h — 12 h']],
                    ['Contact', ['04 77 32 16 08', 'sessions@atelier-continu.fr']],
                    [
                      'Mentions',
                      [
                        'Declaration 84 42 05 199 42',
                        'Certification Qualiopi — actions de formation',
                      ],
                    ],
                  ] as const
                ).map(([titre, lignes]) => (
                  <div key={titre}>
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                      {titre}
                    </p>
                    {lignes.map((ligne) => (
                      <p key={ligne} className="o-m-0 o-mt-2 o-text-sm o-text-zinc-300">
                        {ligne}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              <p className="o-m-0 o-mt-10 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                <span>© 2026 Atelier Continu</span>
                <a
                  href="#haut"
                  className="o-text-zinc-400 o-no-underline hover:o-text-zinc-50 focus:o-ring"
                >
                  Remonter ↑
                </a>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </Porte>
  )
}
