/**
 * Halo — plateforme de modeles.
 *
 * ## Le parti pris : une sphere, cinq actes
 *
 * Une plateforme de modeles se vend sur une promesse courte, pas sur un
 * empilement de puces. La page ouvre donc sur une phrase geante devant une
 * sphere de points — un modele n est rien d autre qu un nuage de nombres qu on
 * fait tourner — et **l ecran reste epingle** pendant quatre hauteurs de
 * defilement : la sphere se decale et grossit, et les quatre familles de
 * modeles (texte, vision, voix, outils) se succedent devant elle, une par
 * acte. C est la signature de la page.
 *
 * Ensuite : le bac a sable, le seul endroit ou la page se laisse toucher ; un
 * seul nombre enorme, le prix du million de jetons ; le catalogue et le
 * calculateur sous un mot qui s assemble depuis une nuee ; une carte flottante
 * « disponible » avec l heure de Paris ; et un pied a horloges.
 *
 * ## Les coupes, et ce qu elles reparent
 *
 * La page enchainait cinq ecrans sombres, puis une bande de texte, puis un
 * tableau, puis une liste plate de quatre modeles sur filets : quatre hauteurs
 * de lecture sans une seule respiration. Quatre coupes ont ete posees.
 *
 * 1. **La coupe claire**, juste apres les cinq ecrans epingles : une bande
 *    teintee qui porte la **figure 1**, le trajet d une requete, schema dessine
 *    en SVG ou un paquet parcourt les six etapes et allume chacune a son
 *    passage. La legende est dans la marge.
 * 2. **L ecran de texte seul** : une phrase, rien d autre, qui s allume mot a
 *    mot au defilement. Elle prepare le prix.
 * 3. **La coupe sombre** : le nombre unique passe sur une bande de nuit, dans
 *    les deux themes. Une facture ne se lit pas sur du papier blanc.
 * 4. **Le catalogue** n est plus une liste plate : chaque modele porte la
 *    barre de son prix de sortie, remplie a l entree dans le cadre, et l ecart
 *    de un a dix se voit avant d etre lu.
 *
 * ## Ce que la page fait
 *
 * Le bac a sable accepte quatre exemples predefinis et une question libre, et
 * le modele choisi change le cout affiche sous la reponse. Le calculateur
 * convertit un volume mensuel de jetons en facture, pour les quatre modeles a
 * la fois, avec ou sans mise en cache des instructions systeme.
 *
 * ## La palette
 *
 * Aucune teinte ecrite en dur. La vitrine lit `--o-vitrine-*`. L encre
 * d accent melange l accent a l encre du theme, donc elle fonce sur fond clair
 * et s eclaircit sur fond sombre. La scene epinglee est peinte dans la nuance
 * 950 de la palette, sombre quelle que soit la couleur choisie, et ecrite dans
 * la nuance 50 de la meme echelle.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Sparkles, Terminal } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { ParticleSphere } from '@/odoro/background/ParticleSphere.jsx'
import { ParticleText } from '@/odoro/text/ParticleText.jsx'
import { ScrollReveal } from '@/odoro/text/ScrollReveal.jsx'
import { GlassSurface } from '@/odoro/ui/GlassSurface.jsx'
import { PromptInput } from '@/odoro/ui/PromptInput.jsx'
import { SegmentedControl } from '@/odoro/ui/SegmentedControl.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Horloge,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Epingle, Flotte, Nappe } from './scene.jsx'

/** Le filet neutre de la page, derive de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 12%, transparent)'

/** L encre d accent, sur un fond de theme. */
const ENCRE = encre()

/** L aplat d accent d une cellule mise en avant. */
const VOILE = accentDoux(500, 14)

/** Les liens de la barre a filet. */
const LIENS = [
  ['#essai', 'Bac a sable'],
  ['#modeles', 'Modeles'],
  ['#calculateur', 'Calculateur'],
] as const

/** Un modele du catalogue. */
interface Modele {
  readonly nom: string
  readonly famille: string
  readonly resume: string
  /** Prix du million de jetons d entree, en euros. */
  readonly entree: number
  /** Prix du million de jetons de sortie, en euros. */
  readonly sortie: number
  readonly fenetre: string
  readonly marque: string | null
}

/** Le catalogue de modeles, avec leur prix au million de jetons. */
const MODELES: readonly Modele[] = [
  {
    nom: 'halo-clair',
    famille: 'Texte',
    resume:
      'Le modele de tous les jours : classement, reecriture, extraction. Repond en flux des le premier jeton.',
    entree: 0.25,
    sortie: 1.1,
    fenetre: '128 k jetons',
    marque: null,
  },
  {
    nom: 'halo-ample',
    famille: 'Texte',
    resume:
      'Le raisonnement long, les documents entiers, les chaines d outils. C est celui que la plupart des equipes finissent par choisir.',
    entree: 2.4,
    sortie: 9.6,
    fenetre: '400 k jetons',
    marque: 'Le plus demande',
  },
  {
    nom: 'halo-vue',
    famille: 'Vision',
    resume:
      'Lit des captures, des tableaux photographies et des plans. Une image vaut 850 jetons en entree.',
    entree: 1.8,
    sortie: 7.2,
    fenetre: '200 k jetons',
    marque: null,
  },
  {
    nom: 'halo-voix',
    famille: 'Audio',
    resume:
      'Transcription et synthese, facturees a la minute plutot qu au jeton. Trente-huit langues reconnues.',
    entree: 0.9,
    sortie: 3.4,
    fenetre: '60 min par requete',
    marque: null,
  },
]

/** Les quatre phases de la scene epinglee : ce que la meme cle ouvre. */
const PHASES: readonly {
  readonly titre: string
  readonly modeles: string
  readonly corps: string
  readonly chiffre: string
}[] = [
  {
    titre: 'Texte',
    modeles: 'halo-clair, halo-ample',
    corps:
      'Reponse en flux des le premier jeton, sortie contrainte a un schema JSON, et un mode « raisonnement long » qui expose son brouillon quand vous le demandez.',
    chiffre: 'Une equipe de support classe 40 000 messages par jour a 0,004 EUR l unite.',
  },
  {
    titre: 'Vision',
    modeles: 'halo-vue',
    corps:
      'Captures d ecran, tableaux photographies, plans scannes : le modele rend la structure, pas seulement le texte.',
    chiffre: 'Une image de 1024 par 1024 compte 850 jetons en entree.',
  },
  {
    titre: 'Voix',
    modeles: 'halo-voix',
    corps:
      'Transcription horodatee et synthese vocale, trente-huit langues, facturees a la minute d audio.',
    chiffre: 'Une heure d entretien transcrite coute 0,54 EUR.',
  },
  {
    titre: 'Outils',
    modeles: 'Toutes familles',
    corps:
      'Vous declarez vos fonctions, le modele choisit laquelle appeler et avec quels arguments. Les appels paralleles sont pris en charge.',
    chiffre: 'Jusqu a 128 outils declares dans une meme conversation.',
  },
]

/** Un prix au million de jetons, en euros. */
function prix(valeur: number): string {
  return `${valeur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
}

/** Un nombre, en francais. */
function nombre(valeur: number, decimales = 0): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/**
 * Une cle qui change quand la couleur du modele change.
 *
 * Les pieces du registre lisent leurs jetons de couleur au montage. Poser
 * cette cle sur la scene la remonte quand la couleur ou le theme changent.
 */
function useCleDeTeinte(): string {
  const [cle, setCle] = useState('')

  useEffect(() => {
    const racine = document.documentElement
    const conteneur = document.querySelector('[data-o-vitrine]')

    const relire = (): void => {
      const teinte =
        conteneur === null
          ? ''
          : getComputedStyle(conteneur).getPropertyValue('--o-vitrine-500').trim()
      setCle(`${teinte}|${racine.getAttribute('data-theme') ?? ''}`)
    }

    relire()
    const observateur = new MutationObserver(relire)
    if (conteneur !== null) {
      observateur.observe(conteneur, { attributes: true, attributeFilter: ['style'] })
    }
    observateur.observe(racine, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      observateur.disconnect()
    }
  }, [])

  return cle
}

/* ------------------------------------------------------------------------ */
/*                     La figure 1 : le trajet d une requete                 */
/* ------------------------------------------------------------------------ */

const STYLE_HALO = 'o-vitrine-plateforme-ia'

/**
 * Trois choses que les utilitaires n ont pas : un paquet qui parcourt le
 * schema, une etape qui s allume a son passage, et une barre qui se remplit.
 * Les deux premieres sont coupees sous mouvement reduit, et le paquet se gare
 * alors devant le modele plutot que de disparaitre.
 */
const CSS_HALO = [
  '@keyframes o-pi-paquet{',
  '0%{transform:translateX(0);opacity:0}4%{transform:translateX(0);opacity:1}',
  '16%{transform:translateX(190px)}22%{transform:translateX(190px)}',
  '32%{transform:translateX(380px)}38%{transform:translateX(380px)}',
  '48%{transform:translateX(570px)}54%{transform:translateX(570px)}',
  '64%{transform:translateX(760px)}78%{transform:translateX(760px)}',
  '88%{transform:translateX(950px)}96%{transform:translateX(950px);opacity:1}',
  '100%{transform:translateX(1040px);opacity:0}}',
  '@keyframes o-pi-allume{0%{opacity:0}3%{opacity:0.34}13%{opacity:0.12}22%{opacity:0}100%{opacity:0}}',
  '[data-o-pi-paquet]{animation:o-pi-paquet 6s linear infinite}',
  '[data-o-pi-halo]{opacity:0;animation:o-pi-allume 6s linear var(--o-pi-delai,0s) infinite}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-pi-paquet]{animation:none;transform:translateX(760px)}',
  '[data-o-pi-halo]{animation:none;opacity:0.12}}',
].join('')

/** Pose la feuille du schema une seule fois. */
function useFeuilleHalo(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_HALO) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_HALO
    feuille.textContent = CSS_HALO
    document.head.append(feuille)
  }, [])
}

/** Une etape du trajet, telle que le schema la dessine. */
const ETAPES: readonly {
  readonly x: number
  readonly nom: string
  readonly sous: string
  readonly duree: string
  readonly delai: string
}[] = [
  { x: 6, nom: 'Invite', sous: 'appel HTTPS', duree: '0 ms', delai: '0.1s' },
  { x: 196, nom: 'Passerelle', sous: 'eu-par : quota', duree: '8 ms', delai: '1s' },
  { x: 386, nom: 'Cache', sous: '6 200 jetons payes', duree: '3 ms', delai: '1.95s' },
  { x: 576, nom: 'Routeur', sous: 'clair ou ample', duree: '2 ms', delai: '2.9s' },
  { x: 766, nom: 'Modele', sous: 'premier jeton', duree: '310 ms', delai: '3.9s' },
  { x: 956, nom: 'Flux', sous: 'jeton par jeton', duree: '18 ms / jeton', delai: '5.3s' },
]

/**
 * Le trajet d une requete, de l invite au premier jeton.
 *
 * Un tableau de latences enumere ; un schema montre. Les six etapes sont
 * posees sur une meme ligne, le crochet des outils descend sous le modele —
 * c est la seule boucle du trajet, et c est elle qui explique pourquoi une
 * reponse avec appel d outil coute deux allers-retours.
 */
function Trajet(): ReactElement {
  useFeuilleHalo()
  const filet = 'color-mix(in oklab, currentColor 28%, transparent)'
  const pale = 'color-mix(in oklab, currentColor 78%, transparent)'
  return (
    <>
      <div className="o-overflow-x-auto o-pb-2">
        <svg
          viewBox="0 0 1120 320"
          className="o-h-auto o-w-full"
          style={{ minWidth: 780 }}
          role="img"
          aria-label="Trajet d une requete : invite, passerelle eu-par en 8 ms, cache des instructions en 3 ms, routeur en 2 ms, modele en 310 ms jusqu au premier jeton, puis flux a 18 ms par jeton. Une boucle descend du modele vers vos outils et remonte."
        >
          <g fill="none" stroke={filet} strokeWidth="1.2">
            {/* La ligne qui porte tout, et les fleches entre les etapes. */}
            {ETAPES.slice(0, -1).map((etape) => (
              <g key={`f${String(etape.x)}`}>
                <path d={`M${String(etape.x + 140)} 129H${String(etape.x + 182)}`} />
                <path d={`M${String(etape.x + 178)} 124l6 5-6 5`} />
              </g>
            ))}
            {/* La boucle des outils, sous le modele. */}
            <path d="M806 162V232" />
            <path d="M801 228l5 5 5-5" />
            <path d="M876 232V167" />
            <path d="M871 171l5-5 5 5" />
            <rect x="706" y="232" width="260" height="52" rx="8" strokeDasharray="4 4" />
          </g>

          {ETAPES.map((etape) => (
            <g key={etape.nom}>
              <rect
                data-o-pi-halo=""
                x={etape.x}
                y={96}
                width={140}
                height={66}
                rx={10}
                fill={accent(500)}
                style={{ '--o-pi-delai': etape.delai } as CSSProperties}
              />
              <rect
                x={etape.x}
                y={96}
                width={140}
                height={66}
                rx={10}
                fill="none"
                stroke={filet}
                strokeWidth="1.2"
              />
              <text
                x={etape.x + 14}
                y={124}
                fontSize="15"
                fontWeight="600"
                fill="currentColor"
              >
                {etape.nom}
              </text>
              <text
                x={etape.x + 14}
                y={144}
                fontSize="9.5"
                fontFamily="ui-monospace, monospace"
                fill={pale}
              >
                {etape.sous}
              </text>
              <text
                x={etape.x + 14}
                y={188}
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fill={ENCRE}
              >
                {etape.duree}
              </text>
            </g>
          ))}

          <text x={726} y={256} fontSize="12" fontWeight="600" fill="currentColor">
            Vos outils
          </text>
          <text
            x={726}
            y={272}
            fontSize="9.5"
            fontFamily="ui-monospace, monospace"
            fill={pale}
          >
            appeles par le modele, puis rendus
          </text>
          <text
            x={706}
            y={306}
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            fill={pale}
          >
            Un appel d outil ajoute un aller-retour complet.
          </text>
          <text
            x={6}
            y={62}
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            fill={pale}
          >
            Le premier jeton arrive en 323 ms — mediane, region eu-par
          </text>
          <path d="M6 76H1114" stroke={filet} strokeWidth="1.2" fill="none" />

          {/* Le paquet : il part de l invite et s arrete a chaque etape. */}
          <g data-o-pi-paquet="">
            <rect x={64} y={123} width={24} height={12} rx={6} fill={accent(500)} />
          </g>
        </svg>
      </div>
      <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 lg:o-hidden">
        Le schema se fait glisser vers la droite
      </p>
    </>
  )
}

/* ------------------------------------------------------------------------ */
/*                      La figure, et ses barres de prix                     */
/* ------------------------------------------------------------------------ */

/**
 * Une figure numerotee dont la legende tient dans la marge.
 *
 * C est la difference entre un dessin pose au milieu du texte et une figure :
 * le numero, le titre et la legende occupent une colonne a part, et le dessin
 * a la sienne.
 */
function Figure({
  rang,
  titre,
  legende,
  children,
}: {
  readonly rang: string
  readonly titre: string
  readonly legende: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <figure className="o-m-0 o-grid o-gap-8 lg:o-grid-cols-12 lg:o-gap-12">
      <figcaption className="lg:o-col-span-3">
        <p
          className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
          style={{ color: ENCRE }}
        >
          Figure {rang}
        </p>
        <p className="o-m-0 o-mt-4 o-text-lg o-font-semibold o-leading-snug o-text-zinc-950 dark:o-text-zinc-50">
          {titre}
        </p>
        <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {legende}
        </p>
      </figcaption>
      <div className="o-min-w-0 lg:o-col-span-9">{children}</div>
    </figure>
  )
}

/**
 * Vrai des que l element est entre dans le cadre.
 *
 * Sert aux barres de prix : une barre qui nait pleine n a rien montre. Sous
 * mouvement reduit, elle est pleine des le premier rendu.
 */
function useVu(): readonly [(element: HTMLElement | null) => void, boolean] {
  const { reduced } = useMotionState()
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const [vu, setVu] = useState(false)

  useEffect(() => {
    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((entree) => entree.isIntersecting)) setVu(true)
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    if (reduced) setVu(true)
    else if (hote !== null) observateur.observe(hote)
    return () => {
      observateur.disconnect()
    }
  }, [hote, reduced])

  return [setHote, vu] as const
}

/** Le prix de sortie le plus haut du catalogue : l echelle des barres. */
const PLAFOND = MODELES.reduce((haut, modele) => Math.max(haut, modele.sortie), 0)

/**
 * Le catalogue : quatre modeles, et la barre de chacun.
 *
 * C etait une liste plate — quatre lignes de titre et de texte sur filets,
 * sans rien qui accroche l oeil. La barre du prix de sortie change cela : elle
 * se remplit quand la ligne entre dans le cadre, et l ecart de un a dix entre
 * halo-clair et halo-ample se voit avant d etre lu.
 */
function Catalogue(): ReactElement {
  const [poser, vu] = useVu()
  return (
    <ul ref={poser} className="o-m-0 o-list-none o-p-0">
      {MODELES.map((modele, rang) => (
        <li
          key={modele.nom}
          className="o-grid o-gap-x-8 o-gap-y-3 o-border-b o-border-black-10 dark:o-border-zinc-800 o-py-8 md:o-grid-cols-12 md:o-items-baseline"
        >
          <span
            aria-hidden="true"
            className="o-font-mono o-text-xs o-tabular-nums o-tracking-widest md:o-col-span-1"
            style={{ color: ENCRE }}
          >
            {String(rang + 1).padStart(2, '0')}
          </span>
          <div className="md:o-col-span-4">
            <h3 className="o-m-0 o-font-mono o-text-xl o-font-semibold o-tracking-tight">
              {modele.nom}
            </h3>
            <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              {modele.famille} — contexte {modele.fenetre}
              {modele.marque !== null && (
                <span className="o-ml-2" style={{ color: ENCRE }}>
                  · {modele.marque}
                </span>
              )}
            </p>
          </div>
          <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-4">
            {modele.resume}
          </p>
          <div className="md:o-col-span-3">
            <p className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-whitespace-nowrap md:o-text-right">
              <span style={{ color: ENCRE }}>{prix(modele.entree)}</span>
              <span className="o-text-zinc-500 dark:o-text-zinc-400"> / </span>
              <span>{prix(modele.sortie)}</span>
            </p>
            {/* La barre du prix de sortie, a l echelle du plus cher des
                quatre. Elle est decorative : les deux prix sont ecrits
                au-dessus, en toutes lettres. */}
            <div
              aria-hidden="true"
              className="o-mt-3 o-h-1.5 o-w-full o-overflow-hidden o-rounded-full"
              style={{ backgroundColor: FILET }}
            >
              <div
                className="o-h-full o-rounded-full"
                style={{
                  width: vu ? `${((modele.sortie / PLAFOND) * 100).toFixed(1)}%` : '0%',
                  backgroundColor: accent(500),
                  transition: `width 1100ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 120)}ms`,
                }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------------ */
/*                             Le bac a sable                               */
/* ------------------------------------------------------------------------ */

/** Un exemple predefini du bac a sable. */
interface Exemple {
  readonly id: string
  readonly onglet: string
  readonly invite: string
  readonly modele: string
  readonly reponse: readonly string[]
  readonly entree: number
  readonly sortie: number
}

/**
 * Les quatre exemples du bac a sable.
 *
 * Chacun montre une forme de reponse differente — un classement, une
 * extraction en JSON, un appel d outil, une transcription — parce que c est
 * la forme, et non la prose, qu un developpeur cherche a voir avant d ecrire
 * son premier appel.
 */
const EXEMPLES: readonly Exemple[] = [
  {
    id: 'cout',
    onglet: 'Reduire un cout',
    invite: 'Comment reduire le cout de mes appels sans perdre en qualite ?',
    modele: 'halo-ample',
    reponse: [
      'Trois pistes, de la plus sure a la plus risquee :',
      '1. Mettre en cache les instructions systeme : elles representent 6 200 jetons sur chaque appel, et le cache les facture a un dixieme du prix.',
      '2. Reduire la fenetre de contexte a 32 k pour les requetes courtes — environ 41 % de cout en moins, sans perte mesuree sur votre jeu de test.',
      '3. Router vers halo-clair les 62 % de requetes classees « simples » par le modele de tri.',
    ],
    entree: 1284,
    sortie: 216,
  },
  {
    id: 'extraction',
    onglet: 'Extraire en JSON',
    invite:
      'Extrais le montant, la date et le fournisseur de cette facture, au format JSON strict.',
    modele: 'halo-clair',
    reponse: [
      'Sortie contrainte au schema fourni, aucun champ libre :',
      '{ "fournisseur": "Ateliers du Vieux Port", "date": "2026-03-14",',
      '  "montant_cents": 148900, "devise": "EUR", "tva_cents": 24817 }',
      'Le schema a ete respecte au premier essai ; en cas d echec, l interface renvoie une erreur typee plutot qu un texte a deviner.',
    ],
    entree: 902,
    sortie: 74,
  },
  {
    id: 'outil',
    onglet: 'Appeler un outil',
    invite:
      'Quelle est la disponibilite de la reference AX-4120 dans l entrepot de Nantes ?',
    modele: 'halo-ample',
    reponse: [
      'Le modele n invente pas la reponse : il demande l appel de votre fonction.',
      'appel : stock_disponible({ "reference": "AX-4120", "site": "nantes" })',
      'retour : { "quantite": 38, "reappro": "2026-04-22" }',
      'Reponse rendue : 38 unites disponibles a Nantes, prochain reapprovisionnement le 22 avril 2026.',
    ],
    entree: 1740,
    sortie: 132,
  },
  {
    id: 'voix',
    onglet: 'Transcrire un audio',
    invite: 'Transcris cet entretien de douze minutes et donne-moi les trois decisions.',
    modele: 'halo-voix',
    reponse: [
      'Transcription horodatee rendue en 41 secondes, puis resumee :',
      '[04:12] Decision — le lancement passe au 5 mai, la recette dure une semaine de plus.',
      '[07:38] Decision — le tarif d entree reste a 19 EUR, la remise annuelle passe a 20 %.',
      '[10:55] Decision — Camille reprend le suivi de l integration allemande.',
    ],
    entree: 12,
    sortie: 340,
  },
]

/** La reponse rendue a une question libre. */
const REPONSE_LIBRE: readonly string[] = [
  'Cette page ne joint aucun modele : le texte qui suit est fixe, et sert a montrer la forme d une reponse.',
  'Une reponse reelle arriverait en flux, jeton par jeton, avec le decompte exact affiche sous le cadre et un identifiant de requete reutilisable pour le support.',
  'Pour essayer sur vos propres donnees, ouvrez une cle : les cinq premiers euros de credit sont offerts.',
]

/**
 * Le bac a sable.
 *
 * Le modele choisi n est pas decoratif : il change la ligne de cout sous la
 * reponse, calculee a partir de la grille du catalogue.
 */
function BacASable(): ReactElement {
  const [modele, setModele] = useState('halo-ample')
  const [invite, setInvite] = useState<string | null>(null)
  const [reponse, setReponse] = useState<readonly string[]>([])
  const [jetons, setJetons] = useState<{ entree: number; sortie: number } | null>(null)

  const choisi = MODELES.find((m) => m.nom === modele) ?? MODELES[0]
  const cout =
    choisi !== undefined && jetons !== null
      ? (jetons.entree * choisi.entree + jetons.sortie * choisi.sortie) / 1_000_000
      : 0

  return (
    <>
      <div className="o-flex o-flex-wrap o-items-center o-gap-x-6 o-gap-y-3">
        <div
          role="group"
          aria-label="Exemples predefinis"
          className="o-flex o-flex-wrap o-gap-2"
        >
          {EXEMPLES.map((exemple) => {
            const actif = invite === exemple.invite
            return (
              <button
                key={exemple.id}
                type="button"
                aria-pressed={actif}
                onClick={() => {
                  setInvite(exemple.invite)
                  setReponse(exemple.reponse)
                  setModele(exemple.modele)
                  setJetons({ entree: exemple.entree, sortie: exemple.sortie })
                }}
                className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest focus:o-ring"
                style={
                  actif
                    ? { borderColor: accent(500), backgroundColor: VOILE, color: ENCRE }
                    : { borderColor: FILET }
                }
              >
                {exemple.onglet}
              </button>
            )
          })}
        </div>

        <label className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
          Modele
          <select
            value={modele}
            onChange={(evenement) => {
              setModele(evenement.target.value)
            }}
            className="o-cursor-pointer o-rounded-md o-border-w-1 o-bg-transparent o-px-2 o-py-1.5 o-font-mono o-text-xs o-text-zinc-900 dark:o-text-zinc-50 focus:o-ring"
            style={{ borderColor: FILET }}
          >
            {MODELES.map((m) => (
              <option key={m.nom} value={m.nom}>
                {m.nom}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="o-mt-6">
        <PromptInput
          placeholder="Ou posez votre propre question…"
          maxAttachments={3}
          style={{ maxWidth: '100%' }}
          onSubmit={(valeur) => {
            const propre = valeur.trim()
            setInvite(propre === '' ? 'Question envoyee' : propre)
            setReponse(REPONSE_LIBRE)
            setJetons({ entree: 640, sortie: 188 })
          }}
          controls={
            <span className="o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
              {modele} · temperature 0,2
            </span>
          }
        />
      </div>

      <div
        aria-live="polite"
        className="o-mt-6 o-text-sm o-leading-relaxed o-text-zinc-900 dark:o-text-zinc-50"
      >
        {invite === null ? (
          <p
            className="o-m-0 o-max-w-3xl o-pl-6 o-text-zinc-600 dark:o-text-zinc-400"
            style={{ borderLeft: `2px solid ${FILET}` }}
          >
            Choisissez un exemple ci-dessus, ou posez votre question. Aucun appel n est
            emis depuis cette page : les reponses sont fixes, et servent a montrer la
            forme d une reponse et le decompte qui l accompagne.
          </p>
        ) : (
          <div
            className="o-max-w-3xl o-pl-6"
            style={{ borderLeft: `2px solid ${accent(500)}` }}
          >
            <p className="o-m-0 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
              Envoye a {modele} — « {invite} »
            </p>
            <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-3 o-p-0">
              {reponse.map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
            </ul>
            {jetons !== null && (
              <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                {nombre(jetons.entree)} jetons en entree, {nombre(jetons.sortie)} en
                sortie — <span style={{ color: ENCRE }}>{nombre(cout, 4)} EUR</span> pour
                cet appel sur {modele}.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ------------------------------------------------------------------------ */
/*                             Le calculateur                               */
/* ------------------------------------------------------------------------ */

/** Les volumes mensuels que la reglette parcourt, en millions de jetons d entree. */
const VOLUMES: readonly number[] = [1, 5, 20, 50, 200, 500, 2000, 5000, 20_000]

/** Les trois formes de reponse, et la part de sortie qu elles impliquent. */
const FORMES = [
  { id: 'courte', libelle: 'Courtes', part: 0.15, exemple: 'classement, etiquetage' },
  { id: 'moyenne', libelle: 'Moyennes', part: 0.4, exemple: 'resume, reecriture' },
  { id: 'longue', libelle: 'Longues', part: 1.2, exemple: 'redaction, raisonnement' },
] as const

/** L identifiant d une forme de reponse. */
type Forme = (typeof FORMES)[number]['id']

/**
 * Part de l entree qui reste facturee plein tarif quand le cache est actif.
 *
 * Soixante pour cent des jetons d entree d une application reelle sont des
 * instructions systeme identiques d un appel a l autre. Le cache les facture a
 * un dixieme : la part payante devient 0,4 + 0,6 x 0,1.
 */
const PART_CACHE = 0.46

/**
 * Le calculateur de cout au million de jetons.
 *
 * Les quatre lignes cote a cote montrent l ecart reel — un facteur dix entre
 * halo-clair et halo-ample —, et c est cet ecart qui decide d une architecture
 * de routage. Le cache est un interrupteur et non une mention.
 */
function Calculateur(): ReactElement {
  const [rang, setRang] = useState(3)
  const [forme, setForme] = useState<Forme>('moyenne')
  const [cache, setCache] = useState(true)

  const entreeM = VOLUMES[rang] ?? 50
  const part = FORMES.find((f) => f.id === forme)?.part ?? 0.4
  const sortieM = entreeM * part

  const lignes = useMemo(
    () =>
      MODELES.map((modele) => {
        const facteur = cache ? PART_CACHE : 1
        const coutEntree = entreeM * facteur * modele.entree
        const coutSortie = sortieM * modele.sortie
        return { modele, coutEntree, coutSortie, total: coutEntree + coutSortie }
      }),
    [entreeM, sortieM, cache],
  )

  const moinsCher = lignes.reduce(
    (bas, ligne) => (ligne.total < bas.total ? ligne : bas),
    lignes[0] as (typeof lignes)[number],
  )
  const economie = cache
    ? lignes.reduce(
        (somme, ligne) => somme + entreeM * (1 - PART_CACHE) * ligne.modele.entree,
        0,
      ) / lignes.length
    : 0

  return (
    <div>
      <div className="o-grid o-gap-8 md:o-grid-cols-2">
        <div>
          <label
            htmlFor="calc-jetons"
            className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400"
          >
            Jetons d entree par mois
          </label>
          <p className="o-m-0 o-mt-1 o-font-mono o-text-3xl o-font-bold o-tabular-nums o-tracking-tight">
            {nombre(entreeM)} M
          </p>
          <input
            id="calc-jetons"
            type="range"
            min={0}
            max={VOLUMES.length - 1}
            step={1}
            value={rang}
            onChange={(evenement) => {
              setRang(Number(evenement.target.value))
            }}
            aria-valuetext={`${nombre(entreeM)} millions de jetons d entree par mois`}
            className="o-mt-4 o-block o-w-full o-cursor-pointer"
            style={{ accentColor: accent(600) }}
          />
          <p
            aria-hidden="true"
            className="o-m-0 o-mt-2 o-flex o-justify-between o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400"
          >
            <span>1 M</span>
            <span>200 M</span>
            <span>20 000 M</span>
          </p>
        </div>

        <div>
          <p
            id="forme-titre"
            className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400"
          >
            Longueur des reponses
          </p>
          {/* La glissiere de la librairie plutot que trois gelules maison :
              elle porte le clavier, l attribut `radiogroup` et le relief. */}
          <SegmentedControl
            className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest"
            label="Longueur des reponses"
            value={forme}
            options={FORMES.map((choix) => ({ value: choix.id, label: choix.libelle }))}
            onChange={(valeur) => {
              setForme(valeur as Forme)
            }}
          />
          <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
            {FORMES.find((f) => f.id === forme)?.exemple ?? ''} — soit {nombre(sortieM)} M
            jetons de sortie par mois.
          </p>

          <label className="o-mt-6 o-flex o-cursor-pointer o-items-start o-gap-3 o-text-sm">
            <input
              type="checkbox"
              checked={cache}
              onChange={(evenement) => {
                setCache(evenement.target.checked)
              }}
              className="o-mt-1 o-cursor-pointer focus:o-ring"
              style={{ accentColor: accent(600) }}
            />
            <span>
              <span className="o-block o-font-medium">
                Instructions systeme mises en cache
              </span>
              <span className="o-block o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Soixante pour cent d une entree reelle se repete d un appel a l autre. Le
                cache la facture a un dixieme du prix.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="o-mt-10 o-overflow-x-auto">
        <table className="o-w-full o-text-sm">
          <caption className="o-sr-only">
            Cout mensuel des quatre modeles pour {nombre(entreeM)} millions de jetons d
            entree
          </caption>
          <thead>
            <tr>
              {['Modele', 'Entree', 'Sortie', 'Par mois'].map((entete, rangEntete) => (
                <th
                  key={entete}
                  scope="col"
                  className={`o-py-3 o-pr-4 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 ${rangEntete === 0 ? 'o-text-left' : 'o-text-right'}`}
                  style={{ borderBottom: `1px solid ${FILET}` }}
                >
                  {entete}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne) => {
              const bas = ligne.modele.nom === moinsCher?.modele.nom
              return (
                <tr key={ligne.modele.nom}>
                  <th
                    scope="row"
                    className="o-py-4 o-pr-4 o-text-left o-font-mono o-text-sm o-font-semibold o-whitespace-nowrap"
                    style={{ borderBottom: `1px solid ${FILET}` }}
                  >
                    {ligne.modele.nom}
                    {bas && (
                      <span
                        className="o-ml-2 o-rounded-sm o-px-1.5 o-py-0.5 o-text-xs o-font-normal"
                        style={{ backgroundColor: VOILE, color: ENCRE }}
                      >
                        le moins cher
                      </span>
                    )}
                  </th>
                  <td
                    className="o-py-4 o-pr-4 o-text-right o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400"
                    style={{ borderBottom: `1px solid ${FILET}` }}
                  >
                    {nombre(ligne.coutEntree, 2)} EUR
                  </td>
                  <td
                    className="o-py-4 o-pr-4 o-text-right o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400"
                    style={{ borderBottom: `1px solid ${FILET}` }}
                  >
                    {nombre(ligne.coutSortie, 2)} EUR
                  </td>
                  <td
                    className="o-py-4 o-pr-4 o-text-right o-font-mono o-font-semibold o-tabular-nums"
                    style={{
                      borderBottom: `1px solid ${FILET}`,
                      color: bas ? ENCRE : undefined,
                    }}
                  >
                    {nombre(ligne.total, 2)} EUR
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p
        aria-live="polite"
        className="o-m-0 o-mt-6 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
      >
        {cache
          ? `Le cache vous fait economiser en moyenne ${nombre(economie, 2)} EUR par mois sur ce volume. Il s active par un en-tete, sans changer une ligne de votre invite.`
          : 'Sans cache, chaque appel repaie ses instructions systeme au prix plein. Cochez la case au-dessus pour voir l ecart.'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                           La scene epinglee                              */
/* ------------------------------------------------------------------------ */

/** Le contenu d une phase : un indice, une famille, ce qu elle fait. */
function Phase({ rang }: { readonly rang: number }): ReactElement {
  const phase = PHASES[rang] ?? PHASES[0]
  if (phase === undefined) return <></>
  return (
    <div className="o-max-w-xl">
      <p
        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={{ color: accent(300) }}
      >
        Phase {String(rang + 1).padStart(2, '0')} / 04 — {phase.modeles}
      </p>
      <h2 className="o-m-0 o-mt-5" style={{ ...affiche('xl', 800), color: accent(50) }}>
        {phase.titre}
      </h2>
      <p
        className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed"
        style={{ color: accent(100) }}
      >
        {phase.corps}
      </p>
      <p
        className="o-m-0 o-mt-5 o-max-w-md o-border-l o-pl-4 o-font-mono o-text-xs o-leading-relaxed"
        style={{ color: accent(200), borderColor: accent(400) }}
      >
        {phase.chiffre}
      </p>
    </div>
  )
}

/** L accroche d ouverture : etiquette, titre, deux gelules. */
function Accroche({ visible }: { readonly visible: boolean }): ReactElement {
  return (
    <div className={visible ? 'o-max-w-5xl' : 'o-sr-only'}>
      <Surgit>
        <Etiquette>Bienvenue dans une nouvelle ere — quatre modeles, une cle</Etiquette>
      </Surgit>
      <TitreVague
        delai={120}
        className="o-m-0 o-mt-8"
        style={{ ...affiche('l', 800), color: accent(50) }}
      >
        Essayez le modele avant de lire son prix.
      </TitreVague>
      <Surgit
        delai={560}
        as="p"
        className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed md:o-text-lg"
        style={{ color: accent(100) }}
      >
        Une interface, une facture au jeton lisible a la ligne, et un bac a sable avant la
        moindre promesse.
      </Surgit>
      <Surgit delai={700} className="o-mt-10">
        <Actions
          pleine={[
            '#essai',
            <>
              Essayer maintenant <Icon icon={ArrowRight} size={16} aria-hidden="true" />
            </>,
          ]}
          fantome={['#modeles', 'Voir les prix']}
        />
      </Surgit>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                                La page                                   */
/* ------------------------------------------------------------------------ */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')
  const { reduced } = useMotionState()
  const cleDeTeinte = useCleDeTeinte()

  const sphere = (
    <ParticleSphere
      key={cleDeTeinte}
      className="o-absolute o-inset-0"
      points={2600}
      size={2.2}
      rpm={1.1}
      pull={0.35}
      reach={0.2}
      colors={['--o-vitrine-950', '--o-vitrine-300', '--o-vitrine-seconde']}
      poster="o-bg-transparent"
    />
  )

  const scene = (acte: number): ReactNode => (
    <div
      className="o-relative o-flex o-h-full o-flex-col"
      style={{ backgroundColor: accent(950), color: accent(50) }}
    >
      {/* La sphere : centree pour l accroche, puis decalee a droite et
          grossie a chaque acte. Une transition CSS, jamais un remontage. */}
      <div
        aria-hidden="true"
        className="o-absolute o-inset-0 o-will-change-transform"
        style={{
          transform:
            acte === 0
              ? 'translate3d(0, 0, 0) scale(1)'
              : `translate3d(22%, 0, 0) scale(${(1.12 + acte * 0.1).toFixed(2)})`,
          transition: reduced
            ? undefined
            : 'transform 1100ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {sphere}
      </div>
      <div
        aria-hidden="true"
        className="o-absolute o-inset-0"
        style={{
          background:
            acte === 0
              ? `linear-gradient(to top, ${accent(950)} 0%, transparent 40%)`
              : `linear-gradient(to right, ${accent(950)} 30%, color-mix(in oklab, ${accent(950)} 60%, transparent) 55%, transparent 80%)`,
          transition: reduced ? undefined : 'background 900ms ease',
        }}
      />
      <Grain opacite={0.05} />

      <BarreFilet
        marque={
          <span className="o-inline-flex o-items-center o-gap-2">
            <Icon
              icon={Sparkles}
              size={14}
              style={{ color: accent(300) }}
              aria-hidden="true"
            />
            Halo
          </span>
        }
        liens={LIENS}
        action={['#cle', 'Console']}
      />

      <div className="o-relative o-mx-auto o-flex o-w-full o-max-w-7xl o-flex-1 o-flex-col o-justify-center o-px-6 o-pb-24 o-pt-8">
        <Accroche visible={acte === 0} />
        {acte > 0 && (
          <Reveal key={acte} preset="fade-up">
            <Phase rang={acte - 1} />
          </Reveal>
        )}
      </div>

      {/* Ou l on en est : un indice en mono, en bas au centre. */}
      <p
        aria-hidden="true"
        className="o-pointer-events-none o-absolute o-bottom-6 o-left-1/2 o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-tabular-nums o-uppercase o-tracking-widest"
        style={{ transform: 'translateX(-50%)', color: accent(300) }}
      >
        {[0, 1, 2, 3, 4].map((rang) => (
          <span
            key={rang}
            className="o-block o-h-1 o-rounded-full o-transition-all"
            style={{
              width: rang === acte ? 28 : 8,
              backgroundColor:
                rang === acte
                  ? accent(300)
                  : `color-mix(in oklab, ${accent(300)} 35%, transparent)`,
            }}
          />
        ))}
      </p>
      <Coin position="bd">
        Paris et Francfort
        <br />
        Aucun jeton ne quitte la region
      </Coin>
    </div>
  )

  return (
    <Porte forme="compteur" marque="Halo">
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture epinglee : cinq actes sur la sphere ===== */}
        {reduced ? (
          <section
            aria-label="Ouverture"
            className="o-relative o-isolate o-overflow-hidden"
            style={{ backgroundColor: accent(950), color: accent(50) }}
          >
            <div aria-hidden="true" className="o-absolute o-inset-0">
              {sphere}
            </div>
            <div
              aria-hidden="true"
              className="o-absolute o-inset-0"
              style={{
                background: `linear-gradient(to top, ${accent(950)} 10%, transparent 60%)`,
              }}
            />
            <div className="o-relative">
              <BarreFilet marque="Halo" liens={LIENS} action={['#cle', 'Console']} />
              <div className="o-mx-auto o-max-w-7xl o-px-6 o-py-24">
                <Accroche visible />
                <ol className="o-m-0 o-mt-24 o-grid o-list-none o-gap-12 o-p-0 md:o-grid-cols-2">
                  {PHASES.map((_, rang) => (
                    <li key={rang}>
                      <Phase rang={rang} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        ) : (
          <Epingle ecrans={5} actes={5}>
            {(acte) => scene(acte)}
          </Epingle>
        )}

        <main>
          {/* =================================================================
              La coupe claire : apres cinq ecrans de nuit, une bande teintee et
              une seule chose dedans — le schema du trajet d une requete.
              ================================================================= */}
          <section
            id="trajet"
            aria-labelledby="trajet-titre"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-py-28"
            style={{ backgroundColor: VOILE }}
          >
            <div className="o-mx-auto o-max-w-7xl">
              <h2 id="trajet-titre" className="o-sr-only">
                Le trajet d une requete
              </h2>
              <Figure
                rang="1"
                titre="Ce qui se passe entre votre appel et le premier jeton."
                legende="Six etapes, et une seule boucle : celle des outils. Les durees sont les medianes mesurees sur la region eu-par en aout 2026, hors reseau depuis votre machine. Le cache est la seule etape qui fait baisser la facture plutot que de l allonger."
              >
                <Trajet />
              </Figure>
            </div>
          </section>

          {/* ================= (01) Le bac a sable ============================ */}
          <section id="essai" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-py-32">
            <div className="o-mx-auto o-max-w-5xl">
              <Indice rang="01" sombre={false}>
                Le bac a sable
              </Indice>
              <h2
                className="o-m-0 o-mt-5 o-flex o-items-center o-gap-3 o-text-zinc-950 dark:o-text-zinc-50"
                style={{ ...affiche('m', 800), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}
              >
                <Icon
                  icon={Terminal}
                  size={28}
                  style={{ color: ENCRE }}
                  aria-hidden="true"
                />
                Quatre exemples, ou votre question.
              </h2>
              <p className="o-mt-5 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Un raisonnement, une extraction contrainte, un appel d outil, une
                transcription : les quatre formes de reponse que l interface sait rendre.
              </p>
              <div className="o-mt-12">
                <BacASable />
              </div>
            </div>
          </section>

          {/* =================================================================
              L ecran de texte seul : une phrase, rien d autre, qui s allume
              mot a mot. Elle prepare le nombre qui suit.
              ================================================================= */}
          <section
            aria-labelledby="facture-titre"
            className="o-flex o-items-center o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-28 md:o-py-40"
            style={{ minHeight: '74vh' }}
          >
            <div className="o-mx-auto o-w-full o-max-w-5xl">
              <h2 id="facture-titre" className="o-sr-only">
                Ce que coute reellement un modele
              </h2>
              <ScrollReveal
                as="p"
                course={0.85}
                dim={0.14}
                className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 800),
                  fontSize: 'clamp(1.75rem, 4.4vw, 4rem)',
                  lineHeight: 1.08,
                }}
              >
                Le prix d un modele ne se lit pas au million de jetons. Il se lit a la fin
                du mois, quand le routage, le cache et la longueur de vos reponses ont
                fait leur part.
              </ScrollReveal>
            </div>
          </section>

          {/* =================================================================
              (02) La coupe sombre : un seul nombre, sur une bande de nuit dans
              les deux themes. Une facture ne se lit pas sur du papier blanc.
              ================================================================= */}
          <section
            aria-labelledby="prix-titre"
            className="o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 md:o-py-36"
            style={nuit('zinc')}
          >
            <Grain opacite={0.05} />
            <div className="o-relative o-mx-auto o-max-w-7xl o-text-zinc-50">
              <h2 id="prix-titre" className="o-sr-only">
                Le prix du million de jetons
              </h2>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Le million de jetons d entree, sur halo-clair
              </p>
              <p
                className="o-m-0 o-mt-6 o-font-mono o-tabular-nums o-tracking-tighter"
                style={{
                  fontFamily: 'var(--o-vitrine-affichage)',
                  fontSize: 'clamp(5rem, 17vw, 15rem)',
                  fontWeight: 800,
                  lineHeight: 0.85,
                  letterSpacing: '-0.05em',
                }}
              >
                0,25 <span style={{ color: encreSurSombre() }}>€</span>
              </p>
              <div className="o-mt-10 o-grid o-gap-6 md:o-grid-cols-12">
                <p className="o-m-0 o-max-w-xl o-text-xl o-leading-snug md:o-col-span-7 md:o-text-2xl">
                  Pas de minimum mensuel, pas de palier cache : l entree et la sortie,
                  comptees a la fin de chaque appel.
                </p>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                  Hors taxes, facture en fin de mois
                  <br />
                  Grille publiee ci-dessous, au centime
                </p>
              </div>
            </div>
          </section>

          {/* ================= (03) Ensemble : le catalogue et le calculateur ===== */}
          <section
            id="modeles"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Indice rang="02" sombre={false}>
                Les quatre modeles
              </Indice>
              <ParticleText
                as="h2"
                step={4}
                duration={1600}
                className="o-m-0 o-mt-5 o-text-zinc-950 dark:o-text-zinc-50"
                style={affiche('xl', 800)}
              >
                Ensemble.
              </ParticleText>
              <p className="o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Une seule cle ouvre les quatre. La facture detaille chaque modele
                separement, et l ecart entre eux decide d une architecture de routage.
              </p>

              {/* La legende des prix reste posee sous les barres de la
                  documentation pendant qu on parcourt les quatre lignes :
                  sans elle, la colonne de droite n est qu une paire de
                  nombres. C est a cela que sert `CHROME`. */}
              <p
                className="o-sticky o-z-10 o-m-0 o-mt-14 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-6 o-gap-y-1 o-border-b o-border-black-10 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-py-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                style={{ top: CHROME }}
              >
                <span>Modele — famille et fenetre de contexte</span>
                <span>Entree / sortie, hors taxes, par million de jetons</span>
              </p>

              <Catalogue />
              <p className="o-mt-3 o-max-w-2xl o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                La barre donne le prix de sortie, a l echelle du plus cher des quatre —
                les jetons d entree mis en cache sont factures au dixieme du prix affiche
              </p>

              <div
                id="calculateur"
                className="o-scroll-mt-24 o-mt-24 o-grid o-gap-10 lg:o-grid-cols-12"
              >
                <div className="lg:o-col-span-4">
                  <Indice rang="03" sombre={false}>
                    Le calculateur
                  </Indice>
                  <h3
                    className="o-m-0 o-mt-5 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)',
                    }}
                  >
                    Ce que votre mois couterait, sur les quatre.
                  </h3>
                  <p className="o-mt-5 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                    Posez votre volume, dites la longueur de vos reponses, laissez le
                    cache allume ou non. Prix hors taxes, grille ci-dessus.
                  </p>
                </div>
                {/* `o-min-w-0` : sans lui, la largeur minimale automatique de
                    la case reprend celle du tableau du calculateur, et la
                    grille entiere deborde a 380 px. */}
                <div className="o-min-w-0 lg:o-col-span-8">
                  <Calculateur />
                </div>
              </div>
            </div>
          </section>

          {/* ================= (04) La carte flottante : disponible ========== */}
          <section
            id="cle"
            aria-labelledby="cle-titre"
            className="o-scroll-mt-24 o-relative o-isolate o-flex o-items-center o-justify-center o-overflow-hidden o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-32 md:o-py-44"
          >
            <Nappe
              couleurs={[accent(300), accent(100), 'var(--o-vitrine-seconde)']}
              opacite={0.5}
            />
            <div className="o-relative o-mx-auto o-grid o-w-full o-max-w-6xl o-items-center o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-6">
                <Indice rang="04" sombre={false}>
                  Une cle
                </Indice>
                <h2
                  id="cle-titre"
                  className="o-m-0 o-mt-5 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(2rem, 4.5vw, 4.25rem)',
                  }}
                >
                  Cinq euros de credit, offerts a l ouverture.
                </h2>
                <p className="o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                  De quoi traiter environ deux millions de jetons sur halo-clair. Aucune
                  carte demandee tant que le credit n est pas epuise.
                </p>
              </div>
              <div className="o-flex o-justify-center lg:o-col-span-6 lg:o-justify-end">
                <Flotte amplitude={9} duree={7} angle={-3}>
                  <GlassSurface
                    colors={['--o-vitrine-400', '--o-palette-white']}
                    blur={22}
                    tint={0.18}
                    thickness={1.3}
                    className="o-w-full o-max-w-sm o-rounded-2xl o-p-6 o-text-zinc-950 dark:o-text-zinc-50"
                  >
                    <p className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                      <span
                        aria-hidden="true"
                        className="o-block o-size-2 o-rounded-full"
                        style={{ backgroundColor: 'var(--o-palette-emerald-500)' }}
                      />
                      Disponible maintenant
                    </p>
                    <p className="o-m-0 o-mt-5 o-font-mono o-text-3xl o-font-semibold o-tabular-nums o-tracking-tight">
                      <Horloge ville="Paris" fuseau="Europe/Paris" />
                    </p>
                    <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                      Une cle en trente secondes. La premiere reponse dans la minute.
                    </p>
                    <a
                      href="#essai"
                      className="o-mt-6 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-5 o-py-2.5 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                      style={aplat()}
                    >
                      Obtenir une cle{' '}
                      <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                    </a>
                  </GlassSurface>
                </Flotte>
              </div>
            </div>
          </section>
        </main>

        {/* ================= Le pied : horloges et coordonnees en mono ======= */}
        <footer className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-pb-10 o-pt-16">
          <div className="o-mx-auto o-max-w-7xl">
            <dl className="o-m-0 o-grid o-gap-8 sm:o-grid-cols-3">
              {[
                {
                  ville: 'Paris',
                  fuseau: 'Europe/Paris',
                  quoi: 'Modeles servis — region eu-par',
                },
                {
                  ville: 'Francfort',
                  fuseau: 'Europe/Berlin',
                  quoi: 'Modeles servis — region eu-fra',
                },
                { ville: 'UTC', fuseau: 'UTC', quoi: 'Horodatage des journaux' },
              ].map((h) => (
                <div
                  key={h.ville}
                  className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-4"
                >
                  <dt className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {h.quoi}
                  </dt>
                  <dd className="o-m-0 o-mt-2 o-font-mono o-text-2xl o-font-semibold o-tabular-nums o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50 md:o-text-3xl">
                    <Horloge ville={h.ville} fuseau={h.fuseau} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="o-mt-16 o-grid o-gap-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 md:o-grid-cols-12">
              <p className="o-m-0 o-flex o-items-start o-gap-2 md:o-col-span-4">
                <Icon
                  icon={Sparkles}
                  size={14}
                  className="o-mt-0.5"
                  style={{ color: ENCRE }}
                  aria-hidden="true"
                />
                <span>
                  Halo SAS
                  <br />
                  28 rue des Vinaigriers, 75010 Paris
                  <br />
                  bonjour@halo.example
                </span>
              </p>
              <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-x-6 o-gap-y-2 o-p-0 md:o-col-span-8 md:o-justify-end">
                {[
                  ['#modeles', 'Modeles'],
                  ['#essai', 'Demarrage'],
                  ['#calculateur', 'Tarifs'],
                  ['#cle', 'Politique d usage'],
                  ['#cle', 'Traitement des donnees'],
                ].map(([href, mot]) => (
                  <li key={mot}>
                    <a
                      href={href}
                      className="o-no-underline o-text-zinc-600 o-transition-colors hover:o-text-zinc-950 focus:o-ring dark:o-text-zinc-400 dark:hover:o-text-zinc-50"
                    >
                      {mot}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="o-m-0 o-mt-8 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              © 2026 Halo — plateforme fictive, aucun modele n est reellement appele
              depuis cette page
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
