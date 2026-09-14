/**
 * Pli Ferme — messagerie chiffree de bout en bout.
 *
 * ## Le parti pris — une page qui fait la demonstration au lieu de la promettre
 *
 * Toutes les pages de messagerie chiffree disent la meme phrase : « nous ne
 * pouvons pas lire vos messages ». Personne ne la verifie, et elle ne veut
 * rien dire tant qu on ne montre pas **ou** le texte cesse d etre du texte.
 * Cette page le montre. Le visiteur ecrit une phrase dans un champ ; six
 * chapitres a etiquette collante deroulent ce qui lui arrive, avec les valeurs
 * reellement calculees dans le navigateur — les octets, la cle de session,
 * le corps chiffre, le sceau, le contenu de la fiche gardee par le serveur, et
 * le texte qui revient a l identique chez le destinataire.
 *
 * Le calcul est honnete et volontairement simple : un generateur reproductible
 * tire un flux de cles, le corps est un ou-exclusif octet a octet, le sceau est
 * une empreinte FNV-1a de 32 bits. Ce n est pas la cryptographie du produit —
 * la page le dit — mais **c est le meme dessin**, et chaque valeur affichee est
 * calculee pour de vrai a partir de ce que le visiteur vient d ecrire.
 *
 * ## Le fond, le mouvement, les coupes
 *
 * F-statique : une grille immobile, un filigrane en contour, rien qui bouge
 * derriere le texte. La signature est M-chapitres. La page est sombre d un bout
 * a l autre — sauf un ecran, le seul, ou le message est en clair sur du papier :
 * c est la coupe, et elle dit exactement ce que la page veut dire.
 *
 * ## Les formes
 *
 * A22 — une question unique, trois reponses, trois adresses.
 * P27 — quatre pictogrammes dessines et leurs legendes.
 * C11 — une jauge unique, qui se remplit au defilement.
 *
 * @module
 */

import { useMotionState, useScrollScrub } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  ArrowUpRight,
  Dices,
  Key,
  Lock,
  MailOpen,
  Server,
  Stamp,
} from '@odoro-cli/icons/filaire'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { GridLines } from '@/odoro/background/GridLines.jsx'
import { MorphText } from '@/odoro/text/MorphText.jsx'
import { CodeInput } from '@/odoro/ui/CodeInput.jsx'
import { CopyButton } from '@/odoro/ui/CopyButton.jsx'
import { TreeView, type TreeNode } from '@/odoro/ui/TreeView.jsx'

import { nuit } from './communs.jsx'
import { accentDoux, aplat, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreCoins,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Chapitre } from './scene.jsx'

/* ========================= Les constantes de dessin ===================== */

/** Le filet de la page, tire de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 14%, transparent)'

/** Le filet appuye : celui qui ferme une zone. */
const FILET_FORT = 'color-mix(in oklab, currentColor 34%, transparent)'

/** L encre d accent, dans sa version qui tient sur une bande toujours sombre. */
const ENCRE = encreSurSombre()

/** La voix mono des notes de marge, sur la nuit. */
const NOTE =
  'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-400'

/** Le jour d une seule bande : la coupe claire au milieu de la nuit. */
const JOUR = {
  colorScheme: 'light',
  backgroundColor: 'var(--o-theme-bg)',
  color: 'var(--o-theme-fg)',
  '--o-theme-bg': 'var(--o-palette-stone-100)',
  '--o-theme-surface': 'var(--o-palette-stone-200)',
  '--o-theme-fg': 'var(--o-palette-stone-950)',
  '--o-theme-muted': 'var(--o-palette-stone-600)',
  '--o-theme-line': 'var(--o-palette-stone-300)',
} as CSSProperties

/** Les liens de la barre en coins. */
const NAVIGATION = [
  ['#cadenas', 'Le cadenas'],
  ['#figure', 'Les deux cles'],
  ['#garde', 'Ce qui reste'],
  ['#qui', 'Commencer'],
] as const

/* ========================= Le calcul, pour de vrai ====================== */

/**
 * Un generateur reproductible, en xorshift 32 bits.
 *
 * Il n a rien d un generateur cryptographique, et la page l ecrit noir sur
 * blanc. Il a la seule propriete qui compte ici : la meme graine rend toujours
 * le meme flux, donc la demonstration est verifiable — on peut relire la page
 * et retrouver les memes octets.
 */
function tirage(graine: number): () => number {
  let etat = graine >>> 0 || 0x9e3779b9
  return () => {
    etat ^= etat << 13
    etat >>>= 0
    etat ^= etat >>> 17
    etat ^= etat << 5
    etat >>>= 0
    return etat >>> 0
  }
}

/** Les octets d un texte, en UTF-8 — la seule etape qui ne se discute pas. */
function octetsDe(texte: string): Uint8Array {
  return new TextEncoder().encode(texte)
}

/** Un tampon d octets, ecrit en hexadecimal, groupe par deux. */
function enHexadecimal(octets: Uint8Array, separateur = ' '): string {
  return Array.from(octets, (o) => o.toString(16).padStart(2, '0')).join(separateur)
}

/** Le flux de cles tire de la graine : un octet par octet du message. */
function fluxDeCles(graine: number, longueur: number): Uint8Array {
  const suivant = tirage(graine)
  const flux = new Uint8Array(longueur)
  for (let i = 0; i < longueur; i += 1) flux[i] = suivant() & 0xff
  return flux
}

/** Le ou-exclusif octet a octet : le corps chiffre, et son inverse. */
function ouExclusif(octets: Uint8Array, flux: Uint8Array): Uint8Array {
  const sortie = new Uint8Array(octets.length)
  for (let i = 0; i < octets.length; i += 1) sortie[i] = (octets[i] ?? 0) ^ (flux[i] ?? 0)
  return sortie
}

/**
 * Le sceau : une empreinte FNV-1a de 32 bits, ecrite en huit chiffres.
 *
 * Il ne protege de rien tout seul — un sceau se signe — mais il porte la
 * propriete qu on veut montrer : changer une lettre du message change tout le
 * sceau. C est la demonstration de l avalanche, et elle se verifie a l oeil.
 */
function sceau(octets: Uint8Array): string {
  let empreinte = 0x811c9dc5
  for (const octet of octets) {
    empreinte ^= octet
    empreinte = Math.imul(empreinte, 0x01000193) >>> 0
  }
  return empreinte.toString(16).padStart(8, '0').toUpperCase()
}

/** L alphabet des empreintes lues a voix haute : ni O ni 0, ni I ni 1. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** L empreinte d une cle, en six caracteres qu on peut dicter au telephone. */
function empreinteDe(graine: number): string {
  const suivant = tirage(graine ^ 0x5bf03635)
  let mot = ''
  for (let i = 0; i < 6; i += 1) mot += ALPHABET[suivant() % ALPHABET.length] ?? 'X'
  return mot
}

/**
 * Les trois cles de session ecrites a la main.
 *
 * Une vraie cle est tiree au hasard a chaque conversation. Ici elles sont
 * fixees pour que la page soit reproductible : le visiteur en change d un
 * bouton, et tout ce qui suit se recalcule sous ses yeux.
 */
const CLES: readonly { readonly nom: string; readonly graine: number }[] = [
  { nom: 'Session 4A', graine: 0x7f4a2c19 },
  { nom: 'Session 4B', graine: 0x12d6b8e3 },
  { nom: 'Session 4C', graine: 0xa3910f57 },
]

/** La phrase posee dans le champ au premier affichage. */
const MESSAGE_PAR_DEFAUT = 'Rendez-vous jeudi 14 h, cote quai. Je porte le dossier vert.'

/* ========================= La figure dessinee =========================== */

/**
 * Les quatre temps du protocole a deux cadenas, avec leur legende.
 *
 * La legende est coupee en deux lignes : un arret n a que deux cent trente
 * pixels de large dans le repere de la figure, et une phrase entiere y
 * chevauchait celle de l arret voisin.
 */
const PROTOCOLE: readonly {
  readonly rang: string
  readonly qui: string
  readonly quoi: readonly [string, string]
}[] = [
  { rang: '01', qui: 'Vous', quoi: ['la boite est fermee', 'de votre cadenas'] },
  { rang: '02', qui: 'Le destinataire', quoi: ['il ajoute le sien,', 'sans ouvrir'] },
  { rang: '03', qui: 'Vous', quoi: ['vous retirez le votre,', 'elle reste close'] },
  { rang: '04', qui: 'Le destinataire', quoi: ['il ouvre : il est', 'seul a pouvoir'] },
]

/** L abscisse d un arret, dans le repere de la figure. */
function abscisseArret(rang: number): number {
  return 118 + rang * 232
}

/**
 * Figure 01 — les deux cadenas, dessinee.
 *
 * Le mecanisme du milieu de page montre les octets ; il ne montre pas
 * **pourquoi** le transporteur ne peut rien faire. La figure le montre : la
 * boite ne voyage jamais ouverte, et aucune cle ne voyage du tout. Le jeton qui
 * court sur le rail est la seule chose qui bouge, et il s arrete sous mouvement
 * reduit — la figure se lit entierement a l arret.
 */
function FigureCadenas(): ReactElement {
  const { reduced } = useMotionState()
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }
  return (
    <svg
      viewBox="0 0 1000 330"
      aria-hidden="true"
      className="o-w-full"
      style={{ minWidth: 720 }}
    >
      <style>
        {'@keyframes pli-course{from{stroke-dashoffset:0}to{stroke-dashoffset:-232}}'}
      </style>

      <text
        x="500"
        y="34"
        textAnchor="middle"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        Trois traversees — aucune cle ne quitte son appareil
      </text>

      {/* Le rail, ses chevrons, et le pli qui court dessus. */}
      <line
        x1="118"
        y1="118"
        x2="814"
        y2="118"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
        style={gris}
      />
      {[0, 1, 2].map((rang) => (
        <path
          key={rang}
          d={`M${String(abscisseArret(rang) + 110)} 112l7 6-7 6`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
          style={gris}
        />
      ))}
      {reduced ? null : (
        <line
          x1="118"
          y1="118"
          x2="814"
          y2="118"
          stroke={ENCRE}
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            strokeDasharray: '22 210',
            animation: 'pli-course 2600ms linear infinite',
          }}
        />
      )}

      {PROTOCOLE.map((etape, rang) => {
        const x = abscisseArret(rang)
        const cadenas = rang === 0 ? 1 : rang === 1 ? 2 : rang === 2 ? 1 : 0
        return (
          <g key={etape.rang}>
            <text
              x={x}
              y="62"
              textAnchor="middle"
              className="o-font-mono"
              fontSize="10"
              fill="currentColor"
              style={{ color: ENCRE }}
            >
              {etape.rang}
            </text>
            {/* La boite : un carre, et un cadenas dessine par cadenas pose. */}
            <rect
              x={x - 34}
              y="74"
              width="68"
              height="44"
              rx="5"
              fill="var(--o-theme-bg)"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.9"
            />
            <line
              x1={x - 34}
              y1="88"
              x2={x + 34}
              y2="88"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.45"
              style={gris}
            />
            {Array.from({ length: cadenas }, (_, index) => {
              const cx = cadenas === 1 ? x : x - 15 + index * 30
              return (
                <g key={index} transform={`translate(${String(cx - 8)}, 90)`}>
                  <path
                    d="M3 6V4a5 5 0 0 1 10 0v2"
                    fill="none"
                    stroke={index === 0 ? ENCRE : 'currentColor'}
                    strokeWidth="1.8"
                  />
                  <rect
                    x="0.5"
                    y="6"
                    width="15"
                    height="12"
                    rx="2.5"
                    fill={index === 0 ? ENCRE : 'currentColor'}
                    opacity={index === 0 ? 1 : 0.55}
                  />
                </g>
              )
            })}
            {cadenas === 0 && (
              <text
                x={x}
                y="105"
                textAnchor="middle"
                className="o-font-mono"
                fontSize="11"
                fill="currentColor"
                style={{ color: ENCRE }}
              >
                ouverte
              </text>
            )}
            <text x={x} y="152" textAnchor="middle" fontSize="13.5" fill="currentColor">
              {etape.qui}
            </text>
            <text
              x={x}
              y="172"
              textAnchor="middle"
              className="o-font-mono"
              fontSize="10.5"
              fill="currentColor"
              style={gris}
            >
              <tspan x={x}>{etape.quoi[0]}</tspan>
              <tspan x={x} dy="15">
                {etape.quoi[1]}
              </tspan>
            </text>
          </g>
        )
      })}

      {/* La voie du transporteur, dessous : ce qu il voit a chaque passage. */}
      <line
        x1="118"
        y1="222"
        x2="814"
        y2="222"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="5 6"
        opacity="0.5"
        style={gris}
      />
      <text
        x="118"
        y="210"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        Ce que le transporteur voit passer
      </text>
      {[0, 1, 2].map((rang) => (
        <text
          key={rang}
          x={abscisseArret(rang) + 116}
          y="244"
          textAnchor="middle"
          className="o-font-mono"
          fontSize="10.5"
          fill="currentColor"
          style={gris}
        >
          une boite close
        </text>
      ))}

      <text x="500" y="292" textAnchor="middle" fontSize="13.5" fill="currentColor">
        Il porte la boite trois fois. Il ne l ouvre jamais, et il n a jamais eu de cle a
        perdre.
      </text>
      <line
        x1="300"
        y1="308"
        x2="700"
        y2="308"
        stroke={ENCRE}
        strokeWidth="1.4"
        opacity="0.8"
      />
    </svg>
  )
}

/* ========================= La jauge unique (C11) ======================== */

/**
 * La jauge qui se remplit au defilement — la seule mesure de la page.
 *
 * Elle ne compte pas des clients ni des annees : elle compte la part du message
 * que personne d autre que les deux correspondants ne voit. Le reste — les
 * cinquante-trois octets de fiche — est nomme dans la marge, parce qu une
 * jauge a 98,7 % sans son reste serait un chiffre publicitaire.
 */
function JaugeUnique(): ReactElement {
  const { reduced } = useMotionState()
  const barre = useRef<HTMLSpanElement>(null)
  const valeur = useRef<HTMLSpanElement>(null)
  const onProgress = useCallback((p: number) => {
    const part = Math.max(0, Math.min(1, (p - 0.1) / 0.55))
    const trait = barre.current
    const mot = valeur.current
    if (trait !== null) trait.style.width = `${(part * 98.7).toFixed(2)}%`
    if (mot !== null) mot.textContent = (part * 98.7).toFixed(1).replace('.', ',')
  }, [])
  const { ref } = useScrollScrub<HTMLDivElement>(reduced ? () => undefined : onProgress, {
    start: 'top bottom',
    end: 'bottom 70%',
    name: 'pli-jauge',
  })
  return (
    <div ref={ref}>
      <p className="o-m-0 o-flex o-items-baseline o-gap-4 o-text-slate-50">
        <span
          className="o-tabular-nums"
          style={{ ...affiche('xl', 300), lineHeight: 0.9 }}
        >
          <span ref={valeur}>{reduced ? '98,7' : '0,0'}</span>
          <span aria-hidden="true"> %</span>
        </span>
        <span className={NOTE}>du message</span>
      </p>
      <span
        aria-hidden="true"
        className="o-mt-8 o-block o-h-4 o-w-full o-overflow-hidden o-rounded-full"
        style={{ backgroundColor: accentDoux(900, 22), border: `1px solid ${FILET}` }}
      >
        <span
          ref={barre}
          className="o-block o-h-full o-rounded-full"
          style={{ width: reduced ? '98.7%' : '0%', backgroundColor: ENCRE }}
        />
      </span>
      <p className="o-sr-only">
        98,7 pour cent du message ne sort jamais chiffre des deux appareils. Le reste, 53
        octets de fiche technique, est detaille a cote.
      </p>
    </div>
  )
}

/* ========================= Le mecanisme : le cadenas ==================== */

/** Un chapitre du mecanisme : son chiffre romain, son intitule, son propos. */
interface Acte {
  readonly cle: string
  readonly numero: string
  readonly titre: string
  readonly texte: string
}

/** Les six actes, dans l ordre ou ils arrivent a une phrase. */
const ACTES: readonly Acte[] = [
  {
    cle: 'texte',
    numero: 'I',
    titre: 'Le texte, tel que vous l ecrivez',
    texte:
      'Ecrivez ce que vous voulez dans le champ. Tout ce qui suit se recalcule a la frappe, dans votre navigateur, et rien ne part d ici.',
  },
  {
    cle: 'cle',
    numero: 'II',
    titre: 'La cle de session',
    texte:
      'Tiree au debut de la conversation et jamais transmise. Son empreinte de six caracteres se dicte au telephone : c est la seule verification qui vaille.',
  },
  {
    cle: 'corps',
    numero: 'III',
    titre: 'Le corps chiffre',
    texte:
      'Chaque octet du texte rencontre un octet du flux de cles. La longueur reste la meme — un message court reste un message court, et c est une fuite que nous assumons.',
  },
  {
    cle: 'sceau',
    numero: 'IV',
    titre: 'Le sceau',
    texte:
      'Une empreinte du corps chiffre. Changez une lettre du message, et le sceau change en entier : c est ainsi qu on sait qu un pli a ete touche en route.',
  },
  {
    cle: 'fiche',
    numero: 'V',
    titre: 'Ce que le serveur garde',
    texte:
      'La fiche entiere, rien de cache. Un horodatage a la minute, une taille arrondie, deux empreintes, et le corps que personne ici ne sait ouvrir.',
  },
  {
    cle: 'ouverture',
    numero: 'VI',
    titre: 'L ouverture, chez lui',
    texte:
      'La meme cle, le meme flux, le meme ou-exclusif : le texte revient identique, octet pour octet. La page le verifie devant vous.',
  },
]

/** Un bloc de valeur en mono, sur la nuit. */
function Valeur({
  intitule,
  children,
  action,
}: {
  readonly intitule: string
  readonly children: ReactNode
  readonly action?: ReactNode
}): ReactElement {
  return (
    <div
      className="o-overflow-hidden o-rounded-xl"
      style={{ border: `1px solid ${FILET_FORT}`, backgroundColor: accentDoux(950, 14) }}
    >
      <div
        className="o-flex o-items-center o-gap-3 o-px-4 o-py-2"
        style={{ borderBottom: `1px solid ${FILET}` }}
      >
        <p className={`o-m-0 ${NOTE}`}>{intitule}</p>
        {action !== undefined && <span className="o-ml-auto">{action}</span>}
      </div>
      <div
        className="o-px-4 o-py-4 o-font-mono o-text-xs o-leading-relaxed o-text-slate-200"
        style={{ overflowWrap: 'anywhere' }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Le cadenas : le mecanisme de la page, en six chapitres.
 *
 * Un seul etat — la phrase et la cle choisie — et tout le reste en derive. Les
 * valeurs affichees sont celles du calcul, pas des exemples recopies : le
 * dernier acte compare le texte dechiffre a celui d origine et dit lequel des
 * deux resultats il a obtenu.
 */
function Cadenas(): ReactElement {
  const [message, setMessage] = useState(MESSAGE_PAR_DEFAUT)
  const [rangCle, setRangCle] = useState(0)
  const [dicte, setDicte] = useState('')
  const champ = useId()

  const cle = CLES[rangCle] ?? CLES[0]
  const graine = cle?.graine ?? 0
  const nomCle = cle?.nom ?? ''

  const calcul = useMemo(() => {
    const clair = octetsDe(message)
    const flux = fluxDeCles(graine, clair.length)
    const corps = ouExclusif(clair, flux)
    const variante = octetsDe(message.slice(0, -1) + (message.endsWith('.') ? '!' : '.'))
    const corpsVariante = ouExclusif(variante, fluxDeCles(graine, variante.length))
    const rendu = new TextDecoder().decode(
      ouExclusif(corps, fluxDeCles(graine, corps.length)),
    )
    return {
      clair,
      flux,
      corps,
      rendu,
      identique: rendu === message,
      sceauCorps: sceau(corps),
      sceauVariante: sceau(corpsVariante),
      empreinte: empreinteDe(graine),
    }
  }, [message, graine])

  const arbre: readonly TreeNode[] = useMemo(
    () => [
      {
        id: 'fiche',
        label: 'pli_3f81c0',
        hint: `${String(calcul.corps.length + 53)} octets`,
        children: [
          { id: 'horodatage', label: 'recu_le', hint: '2026-09-11 14:02 (a la minute)' },
          {
            id: 'taille',
            label: 'taille_arrondie',
            hint: `${String(Math.ceil((calcul.corps.length + 1) / 64) * 64)} octets`,
          },
          { id: 'expediteur', label: 'empreinte_expediteur', hint: calcul.empreinte },
          { id: 'sceau', label: 'sceau', hint: calcul.sceauCorps },
          {
            id: 'corps',
            label: 'corps',
            hint: `${String(calcul.corps.length)} octets illisibles`,
          },
        ],
      },
    ],
    [calcul],
  )

  /** Le premier mot du message, et sa forme chiffree : la fusion du chapitre V. */
  const fusion = useMemo(() => {
    const mot =
      (message.trim().split(/\s+/)[0] ?? 'message')
        .replace(/[^\p{L}\p{N}-]/gu, '')
        .slice(0, 8) || 'message'
    const octets = octetsDe(mot)
    return [
      mot,
      enHexadecimal(ouExclusif(octets, fluxDeCles(graine, octets.length)), ''),
    ] as const
  }, [message, graine])

  const dicteJuste = dicte.length === 6 ? dicte.toUpperCase() === calcul.empreinte : null

  return (
    <>
      {ACTES.map((acte, rang) => (
        <div
          key={acte.cle}
          id={acte.cle}
          className="o-scroll-mt-24 o-px-6 o-py-16 md:o-px-8 md:o-py-24"
          style={{ borderTop: `1px solid ${FILET}` }}
        >
          <Chapitre
            indice={`${acte.numero} — ${String(rang + 1).padStart(2, '0')} / 06`}
            largeur={4}
            titre={
              <h3
                className="o-m-0 o-text-slate-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3vw, 2.75rem)' }}
              >
                {acte.titre}
              </h3>
            }
            texte={<span className="o-block o-text-slate-400">{acte.texte}</span>}
          >
            {/* ---- I : le champ ------------------------------------------- */}
            {acte.cle === 'texte' && (
              <div className="o-grid o-gap-6">
                <div>
                  <label htmlFor={champ} className={`o-block ${NOTE}`}>
                    Votre message
                  </label>
                  <textarea
                    id={champ}
                    value={message}
                    rows={3}
                    maxLength={220}
                    onChange={(evenement) => {
                      setMessage(evenement.target.value)
                    }}
                    className="o-mt-3 o-w-full o-resize-none o-rounded-xl o-bg-transparent o-p-4 o-text-lg o-leading-relaxed o-text-slate-50 focus:o-ring"
                    style={{
                      border: `1px solid ${FILET_FORT}`,
                      backgroundColor: accentDoux(950, 14),
                    }}
                  />
                </div>
                <dl className="o-m-0 o-grid o-grid-cols-2 o-gap-6 sm:o-grid-cols-3">
                  {(
                    [
                      [String(message.length), 'caracteres'],
                      [String(calcul.clair.length), 'octets en UTF-8'],
                      [
                        message.trim() === ''
                          ? '0'
                          : String(message.trim().split(/\s+/).length),
                        'mots',
                      ],
                    ] as const
                  ).map(([valeur, quoi]) => (
                    <div
                      key={quoi}
                      className="o-pt-4"
                      style={{ borderTop: `1px solid ${FILET}` }}
                    >
                      <dt
                        className="o-font-mono o-text-2xl o-tabular-nums"
                        style={{ color: ENCRE }}
                      >
                        {valeur}
                      </dt>
                      <dd className={`o-m-0 o-mt-1 ${NOTE}`}>{quoi}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* ---- II : la cle et son empreinte ---------------------------- */}
            {acte.cle === 'cle' && (
              <div className="o-grid o-gap-6">
                <div className="o-flex o-flex-wrap o-items-center o-gap-3">
                  {CLES.map((option, index) => (
                    <button
                      key={option.nom}
                      type="button"
                      aria-pressed={index === rangCle}
                      onClick={() => {
                        setRangCle(index)
                        setDicte('')
                      }}
                      className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-200 focus:o-ring"
                      style={
                        index === rangCle
                          ? {
                              borderColor: ENCRE,
                              color: ENCRE,
                              backgroundColor: accentDoux(900, 26),
                            }
                          : { borderColor: FILET_FORT }
                      }
                    >
                      {option.nom}
                    </button>
                  ))}
                  <span className={`o-inline-flex o-items-center o-gap-2 ${NOTE}`}>
                    <Icon icon={Dices} size={14} aria-hidden="true" />
                    Tiree a l ouverture de la conversation
                  </span>
                </div>
                <Valeur
                  intitule={`Flux de cles — ${nomCle}, ${String(calcul.flux.length)} octets`}
                >
                  {calcul.flux.length === 0
                    ? 'Ecrivez une phrase pour tirer un flux.'
                    : enHexadecimal(calcul.flux.slice(0, 48))}
                  {calcul.flux.length > 48 ? ' …' : ''}
                </Valeur>
                <div className="o-grid o-gap-5">
                  <p className={`o-m-0 ${NOTE}`}>
                    Dictez ces six caracteres a votre correspondant, et tapez les siens
                  </p>
                  <p
                    className="o-m-0 o-font-mono o-text-3xl o-tracking-widest"
                    style={{ color: ENCRE }}
                  >
                    {calcul.empreinte}
                  </p>
                  <CodeInput
                    length={6}
                    label="Empreinte dictee par le correspondant"
                    onValueChange={(code) => {
                      setDicte(code)
                    }}
                  />
                  <p aria-live="polite" className="o-m-0 o-text-sm o-text-slate-300">
                    {dicteJuste === null
                      ? 'Six caracteres, sans O ni I : ils se confondent a l oral.'
                      : dicteJuste
                        ? 'Les deux empreintes concordent : personne ne s est glisse entre vous.'
                        : 'Les empreintes different. Arretez la conversation et rappelez votre correspondant.'}
                  </p>
                </div>
              </div>
            )}

            {/* ---- III : le corps chiffre ---------------------------------- */}
            {acte.cle === 'corps' && (
              <div className="o-grid o-gap-6">
                <Valeur
                  intitule={`Corps — ${String(calcul.corps.length)} octets`}
                  action={
                    <CopyButton
                      value={enHexadecimal(calcul.corps)}
                      label="Copier"
                      className="o-gap-2 o-rounded-md o-px-2 o-py-1 o-font-mono o-text-xs o-text-slate-300 focus:o-ring"
                    />
                  }
                >
                  {calcul.corps.length === 0
                    ? 'Rien a chiffrer.'
                    : enHexadecimal(calcul.corps)}
                </Valeur>
                <p className="o-m-0 o-max-w-xl o-leading-relaxed o-text-slate-300">
                  Le texte et le corps ont exactement la meme longueur :{' '}
                  {String(calcul.clair.length)} octets d un cote,{' '}
                  {String(calcul.corps.length)} de l autre. Nous ne pretendons donc pas
                  cacher la taille d un message, et la fiche du serveur l arrondit au bloc
                  de soixante-quatre.
                </p>
              </div>
            )}

            {/* ---- IV : le sceau et l avalanche ---------------------------- */}
            {acte.cle === 'sceau' && (
              <div className="o-grid o-gap-6">
                <div className="o-grid o-gap-4 sm:o-grid-cols-2">
                  <div
                    className="o-min-w-0 o-pt-4"
                    style={{ borderTop: `1px solid ${FILET_FORT}` }}
                  >
                    <p className={`o-m-0 ${NOTE}`}>Votre message</p>
                    <p
                      className="o-m-0 o-mt-3 o-font-mono o-text-2xl o-tracking-widest"
                      style={{ color: ENCRE, overflowWrap: 'anywhere' }}
                    >
                      {calcul.sceauCorps}
                    </p>
                  </div>
                  <div
                    className="o-min-w-0 o-pt-4"
                    style={{ borderTop: `1px solid ${FILET_FORT}` }}
                  >
                    <p className={`o-m-0 ${NOTE}`}>Le meme, derniere lettre changee</p>
                    <p
                      className="o-m-0 o-mt-3 o-font-mono o-text-2xl o-tracking-widest o-text-slate-400"
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      {calcul.sceauVariante}
                    </p>
                  </div>
                </div>
                <p className="o-m-0 o-max-w-xl o-leading-relaxed o-text-slate-300">
                  Une lettre de difference, et les huit chiffres changent. C est ce qui
                  permet au destinataire de refuser un pli modifie en route sans avoir a
                  le lire — et c est aussi pourquoi un sceau ne se compare jamais a l
                  oeil, mais caractere par caractere.
                </p>
              </div>
            )}

            {/* ---- V : la fiche du serveur --------------------------------- */}
            {acte.cle === 'fiche' && (
              <div className="o-grid o-gap-6">
                {/*
                  L arbre porte des libelles longs. Un enfant de grille a
                  `min-width: auto` : sans `o-min-w-0` sur la boite, il pousse
                  la colonne et la page deborde a 380 px. La bande qui defile
                  de cote declare `overflow-y: hidden` explicitement, sinon la
                  cascade met les deux axes a `auto` et elle avale la molette.
                */}
                <div
                  className="o-min-w-0 o-rounded-xl o-p-5"
                  style={{
                    border: `1px solid ${FILET_FORT}`,
                    backgroundColor: accentDoux(950, 14),
                  }}
                >
                  <div
                    className="o-min-w-0 o-overflow-x-auto"
                    style={{ overflowY: 'hidden' }}
                  >
                    <TreeView
                      nodes={arbre}
                      label="La fiche gardee par le serveur"
                      defaultOpen={['fiche']}
                      className="o-font-mono o-text-sm"
                    />
                  </div>
                </div>
                {/*
                  La fusion du premier mot vers sa forme chiffree. Le filtre de
                  `MorphText` seuille un flou : sous une graisse legere il
                  effacerait les delies, et la ligne resterait vide. Elle est
                  donc posee en graisse pleine, comme la page modele le fait.
                */}
                <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-gap-x-5 o-gap-y-2">
                  <span className={NOTE}>Le premier mot, vu d ici</span>
                  <MorphText
                    mots={[fusion[0], fusion[1]]}
                    hold={2100}
                    morph={800}
                    fusion={1.4}
                    flou={9}
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(1.35rem, 2.6vw, 2.25rem)',
                      color: ENCRE,
                    }}
                  />
                </p>
                <p className="o-m-0 o-max-w-xl o-leading-relaxed o-text-slate-300">
                  La fiche tient en cinquante-trois octets de metadonnees. Elle est
                  effacee trente jours apres la remise, et le corps avec elle : nous n
                  avons aucun moyen de le rouvrir plus tard, meme si on nous le demandait.
                </p>
              </div>
            )}

            {/* ---- VI : l ouverture ---------------------------------------- */}
            {acte.cle === 'ouverture' && (
              <div className="o-grid o-gap-6">
                <Valeur intitule="Texte rendu par la cle du destinataire">
                  <span
                    className="o-text-base o-text-slate-50"
                    style={{ fontFamily: 'var(--o-font-sans)' }}
                  >
                    {calcul.rendu === '' ? '—' : calcul.rendu}
                  </span>
                </Valeur>
                <p
                  className="o-m-0 o-inline-flex o-items-center o-gap-3 o-self-start o-rounded-full o-px-4 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={
                    calcul.identique ? aplat() : { border: `1px solid ${FILET_FORT}` }
                  }
                >
                  <Icon
                    icon={calcul.identique ? MailOpen : Lock}
                    size={15}
                    aria-hidden="true"
                  />
                  {calcul.identique
                    ? 'Identique au texte de depart, octet pour octet'
                    : 'Difference detectee : le pli serait refuse'}
                </p>
                <p className="o-m-0 o-max-w-xl o-leading-relaxed o-text-slate-300">
                  La comparaison est faite ici, dans la page : elle porte sur la chaine
                  rendue et sur celle que vous avez tapee. Si un jour elle affichait autre
                  chose, ce serait un defaut a nous signaler, pas une formule de style.
                </p>
              </div>
            )}
          </Chapitre>
        </div>
      ))}
    </>
  )
}

/* ========================= Les pictogrammes du pied (P27) =============== */

/** Un pictogramme dessine du pied, et ce qu il legende. */
const PICTOGRAMMES: readonly {
  readonly cle: string
  readonly titre: string
  readonly legende: string
  readonly dessin: ReactNode
}[] = [
  {
    cle: 'pli',
    titre: 'Le pli',
    legende: 'Ferme avant de partir. Il ne s ouvre nulle part entre les deux appareils.',
    dessin: (
      <>
        <rect
          x="8"
          y="16"
          width="48"
          height="32"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M8 20l24 16 24-16" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="32" cy="38" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  {
    cle: 'cle',
    titre: 'La cle',
    legende: 'Tiree sur votre appareil, jamais televersee, perdue avec lui.',
    dessin: (
      <>
        <circle
          cx="22"
          cy="32"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M32 32h22M46 32v8M52 32v6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    cle: 'sceau',
    titre: 'Le sceau',
    legende: 'Huit chiffres. Un pli touche en route ne porte plus le meme.',
    dessin: (
      <>
        <circle
          cx="32"
          cy="30"
          r="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M26 30l4 4 8-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 43l-4 11 12-5 12 5-4-11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    cle: 'oubli',
    titre: 'L oubli',
    legende: 'Trente jours apres la remise, la fiche et le corps sont effaces.',
    dessin: (
      <>
        <path
          d="M14 20h36M26 20v-4h12v4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 20l3 28h22l3-28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M28 28v12M36 28v12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  },
]

/* ========================= La question unique (A22) ===================== */

/** Les trois reponses, et les trois adresses ou elles menent. */
const REPONSES: readonly {
  readonly reponse: string
  readonly ou: string
  readonly quoi: string
  readonly href: string
}[] = [
  {
    reponse: 'Une equipe',
    ou: 'Un espace partage, des salons, et un administrateur qui ne lit rien',
    quoi: 'equipes@pli-ferme.fr',
    href: 'mailto:equipes@pli-ferme.fr',
  },
  {
    reponse: 'Une source, un journaliste',
    ou: 'Une boite a lettres publique, sans compte et sans numero de telephone',
    quoi: 'la boite ouverte',
    href: '#cadenas',
  },
  {
    reponse: 'Un auditeur',
    ou: 'Le protocole, les rapports d audit, et la liste des choses que nous ratons',
    quoi: 'audit@pli-ferme.fr',
    href: 'mailto:audit@pli-ferme.fr',
  },
]

/* ========================= La vitrine =================================== */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('jakarta')
  const [heure, setHeure] = useState('')

  useEffect(() => {
    const format = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    })
    setHeure(format.format(new Date()))
  }, [])

  return (
    <Porte forme="iris" marque="Pli Ferme">
      <div style={{ ...polices, ...nuit('slate') }}>
        {/*
          ----- L ouverture ---------------------------------------------------

          F-statique : une grille immobile, un filigrane en contour, et rien
          d autre derriere le texte. Le mot-marque est en contour plutot qu en
          plein — c est la citation d Artefakt, et c est le seul ornement.
        */}
        <div id="haut" className="o-relative o-isolate o-overflow-hidden">
          <GridLines
            className="o-absolute o-inset-0 o-z-0"
            size={44}
            thickness={1}
            speed={0}
            color={accentDoux(400, 22)}
          />
          <Grain opacite={0.05} />

          <div className="o-relative o-z-10 o-flex o-min-h-screen o-flex-col">
            <BarreCoins
              marque="Pli Ferme"
              liens={NAVIGATION}
              droite={heure === '' ? 'Paris' : `Paris ${heure}`}
            />

            <div className="o-flex o-grow o-flex-col o-justify-between o-gap-12 o-px-6 o-pb-10 o-pt-6 md:o-px-8">
              <div className="o-grid o-gap-8 md:o-grid-cols-12">
                <div className="o-min-w-0 md:o-col-span-9">
                  <Surgit>
                    <Etiquette>Messagerie chiffree de bout en bout — Nantes</Etiquette>
                  </Surgit>
                  <TitreVague
                    delai={140}
                    className="o-m-0 o-mt-7 o-max-w-5xl o-text-slate-50"
                    style={{
                      ...affiche('l', 300),
                      fontSize: 'clamp(2.6rem, 7.4vw, 7.5rem)',
                    }}
                  >
                    Nous ne pouvons pas lire vos messages.
                  </TitreVague>
                </div>
                <Surgit
                  delai={480}
                  className="o-flex o-flex-col o-justify-end o-gap-6 md:o-col-span-3"
                >
                  <p className="o-m-0 o-text-base o-leading-relaxed o-text-slate-400">
                    Ce n est pas une promesse commerciale, c est une consequence du
                    dessin. Descendez : la page le calcule sous vos yeux, avec la phrase
                    que vous voulez.
                  </p>
                  <Actions
                    pleine={[
                      '#cadenas',
                      <>
                        Voir le cadenas{' '}
                        <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['#figure', 'Le protocole']}
                  />
                </Surgit>
              </div>

              {/*
                Le pli tel qu il part : le corps chiffre de la phrase par
                defaut, sur une seule ligne qui se coupe au bord droit. C est
                la seule chose que l ouverture montre du mecanisme, et elle
                remplit le vide entre le titre et le filigrane.
              */}
              <Surgit
                delai={700}
                className="o-flex o-min-w-0 o-items-center o-gap-5 o-py-4"
                style={{
                  borderTop: `1px solid ${FILET}`,
                  borderBottom: `1px solid ${FILET}`,
                }}
              >
                <span className={`o-shrink-0 ${NOTE}`} style={{ color: ENCRE }}>
                  Ce qui part
                </span>
                <span
                  className="o-min-w-0 o-flex-1 o-truncate o-font-mono o-text-xs o-text-slate-400"
                  aria-hidden="true"
                >
                  {enHexadecimal(
                    ouExclusif(
                      octetsDe(MESSAGE_PAR_DEFAUT),
                      fluxDeCles(
                        CLES[0]?.graine ?? 0,
                        octetsDe(MESSAGE_PAR_DEFAUT).length,
                      ),
                    ),
                  )}
                </span>
                <span className={`o-hidden o-shrink-0 md:o-inline ${NOTE}`}>
                  60 octets
                </span>
              </Surgit>

              {/* Le mot-marque en contour, coupe aux deux bords — Artefakt. */}
              <p
                aria-hidden="true"
                className="o-m-0 o-select-none o-whitespace-nowrap o-text-center"
                style={{
                  ...affiche('xxl', 800),
                  fontSize: 'clamp(3.5rem, 19vw, 17rem)',
                  color: 'transparent',
                  WebkitTextStroke: `1px ${accentDoux(400, 34)}`,
                }}
              >
                PLI FERME
              </p>
            </div>

            <Coin position="bg">
              Version 4 du protocole
              <br />
              Audit externe — mars 2026
            </Coin>
            <Coin position="bd">
              Aucun numero de telephone
              <br />
              Aucun carnet d adresses
            </Coin>
          </div>
        </div>

        <main>
          {/*
            ----- Un ecran de texte seul ---------------------------------------

            Entre l ouverture et le mecanisme, une phrase et rien d autre : la
            page a besoin d une respiration avant six chapitres de valeurs.
          */}
          <section
            aria-labelledby="dire-titre"
            className="o-px-6 o-py-28 md:o-px-8 md:o-py-40"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-12">
              <p className={`o-m-0 md:o-col-span-3 ${NOTE}`}>
                Avant le mecanisme
                <br />
                Une seule phrase
              </p>
              <div className="md:o-col-span-9">
                <h2 id="dire-titre" className="o-sr-only">
                  Ce que veut dire « de bout en bout »
                </h2>
                <Manifeste eteint="Un service qui peut lire vos messages finira par devoir les montrer a quelqu un —">
                  alors nous avons construit un service qui ne le peut pas, et cette page
                  est la preuve, pas l argument.
                </Manifeste>
              </div>
            </div>
          </section>

          {/*
            ----- Le mecanisme : le cadenas, en six chapitres -------------------
          */}
          <section
            id="cadenas"
            className="o-scroll-mt-24 o-px-6 o-pt-24 md:o-px-8 md:o-pt-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01">Le cadenas</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-3xl o-text-slate-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 4rem)' }}
                >
                  Six etapes, et vos octets dedans.
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                Tout est calcule dans cette page
                <br />
                Rien n est envoye nulle part
              </p>
            </div>
          </section>

          <Cadenas />

          {/*
            ----- Figure 01 : les deux cadenas ---------------------------------

            Le mecanisme montre des octets ; il ne dit pas pourquoi le
            transporteur est impuissant. La figure le dit, avec sa legende dans
            la marge, a la maniere d une planche.
          */}
          <section
            id="figure"
            aria-labelledby="figure-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: ENCRE }}
                >
                  Figure 01
                </p>
                <h2
                  id="figure-titre"
                  className="o-m-0 o-mt-5 o-text-slate-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)',
                  }}
                >
                  La boite a deux cadenas.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-slate-400">
                  Le protocole en une image : chacun pose son cadenas a son tour, et la
                  boite ne voyage jamais ouverte. Aucune cle ne quitte son appareil — il n
                  y a donc rien a nous voler.
                </p>
                <ul className="o-m-0 o-mt-8 o-flex o-list-none o-flex-col o-gap-3 o-p-0">
                  {PROTOCOLE.map((etape) => (
                    <li key={etape.rang} className={`o-flex o-gap-3 ${NOTE}`}>
                      <span style={{ color: ENCRE }}>{etape.rang}</span>
                      <span>{`${etape.quoi[0]} ${etape.quoi[1]}`}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <FigureCadenas />
                </div>
                <figcaption
                  className="o-mt-6 o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-slate-400"
                  style={{ borderTop: `1px solid ${FILET}` }}
                >
                  Figure 01 — trois traversees, quatre etats de la boite. Le trait plein
                  sous le dernier temps marque le seul moment ou le texte existe en clair
                  : chez le destinataire.
                </figcaption>
              </figure>
            </div>
          </section>

          {/*
            ----- La coupe : le seul ecran en clair ----------------------------

            La page est sombre partout. Ici, et ici seulement, elle passe au
            papier : c est l ecran ou le message est lisible, et la coupe dit
            la meme chose que tout le reste, en une image.
          */}
          <section
            aria-labelledby="clair-titre"
            className="o-px-6 o-py-28 md:o-px-8 md:o-py-40"
            style={JOUR}
          >
            <div className="o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-600 md:o-col-span-3">
                Le seul ecran en clair
                <br />
                de toute cette page
              </p>
              <div className="o-min-w-0 md:o-col-span-9">
                <h2 id="clair-titre" className="o-sr-only">
                  Le message, en clair
                </h2>
                <p
                  className="o-m-0 o-max-w-4xl o-text-stone-950"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.6vw, 3.5rem)',
                    lineHeight: 1.12,
                  }}
                >
                  « Rendez-vous jeudi 14 h, cote quai. Je porte le dossier vert. »
                </p>
                <p className="o-mt-10 o-max-w-xl o-leading-relaxed o-text-stone-700">
                  Voila a quoi ressemble un message quand il est lisible. Cela n arrive
                  que deux fois : sur l ecran de celui qui l ecrit, et sur celui de qui le
                  recoit. Entre les deux, le meme texte occupe la meme place, en octets
                  qui ne veulent rien dire.
                </p>
                <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600">
                  Papier — 1 ecran sur 14
                </p>
              </div>
            </div>
          </section>

          {/*
            ----- La jauge unique (C11) ----------------------------------------
          */}
          <section
            id="garde"
            aria-labelledby="garde-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-4">
                <Indice rang="02">Ce qui reste chez nous</Indice>
                <h2
                  id="garde-titre"
                  className="o-m-0 o-mt-5 o-text-slate-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)',
                  }}
                >
                  Une seule mesure.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-slate-400">
                  Nous n affichons pas de compteur de clients ni d annees de service : la
                  seule quantite qui vous concerne est celle-ci, et elle ne nous flatte qu
                  a moitie.
                </p>
              </div>
              <div className="o-min-w-0 md:o-col-span-8">
                <JaugeUnique />
                <dl className="o-m-0 o-mt-12 o-grid o-gap-6 sm:o-grid-cols-3">
                  {(
                    [
                      [
                        '53 octets',
                        'la fiche gardee : horodatage, taille arrondie, deux empreintes',
                      ],
                      ['30 jours', 'apres la remise, la fiche et le corps sont effaces'],
                      [
                        '0',
                        'numero de telephone, carnet d adresses, journal de connexion',
                      ],
                    ] as const
                  ).map(([valeur, quoi]) => (
                    <div
                      key={quoi}
                      className="o-pt-4"
                      style={{ borderTop: `1px solid ${FILET}` }}
                    >
                      <dt
                        className="o-font-mono o-text-lg o-tabular-nums"
                        style={{ color: ENCRE }}
                      >
                        {valeur}
                      </dt>
                      <dd className={`o-m-0 o-mt-2 ${NOTE}`}>{quoi}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/*
            ----- A22 : une question, trois reponses, trois adresses ------------
          */}
          <section
            id="qui"
            aria-labelledby="qui-titre"
            className="o-scroll-mt-24 o-flex o-min-h-screen o-flex-col o-justify-center o-px-6 o-py-24 md:o-px-8"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <h2
              id="qui-titre"
              className="o-m-0 o-max-w-4xl o-text-slate-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.25rem, 6vw, 6rem)' }}
            >
              Qui ecrit a qui ?
            </h2>
            <ul className="o-m-0 o-mt-16 o-list-none o-p-0">
              {REPONSES.map((r) => (
                <li key={r.reponse} style={{ borderTop: `1px solid ${FILET_FORT}` }}>
                  <a
                    href={r.href}
                    className="o-grid o-items-baseline o-gap-x-8 o-gap-y-2 o-py-8 o-no-underline o-text-slate-50 focus:o-ring md:o-grid-cols-12"
                  >
                    <span className="o-text-2xl o-font-medium o-tracking-tight md:o-col-span-4 md:o-text-3xl">
                      {r.reponse}
                    </span>
                    <span className="o-text-base o-leading-relaxed o-text-slate-400 md:o-col-span-5">
                      {r.ou}
                    </span>
                    <span
                      className={`o-inline-flex o-items-center o-gap-2 md:o-col-span-3 md:o-justify-end ${NOTE}`}
                      style={{ color: ENCRE }}
                    >
                      {r.quoi}
                      <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className={`o-mt-10 o-max-w-xl ${NOTE}`}>
              Pas de formulaire, pas de demonstration commerciale a planifier. Une
              adresse, et une reponse d une personne dans la journee.
            </p>
          </section>
        </main>

        {/*
          ----- P27 : quatre pictogrammes dessines et leurs legendes ------------
        */}
        <footer
          className="o-px-6 o-pb-10 o-pt-16 md:o-px-8"
          style={{ borderTop: `1px solid ${FILET_FORT}` }}
        >
          <div className="o-grid o-gap-x-10 o-gap-y-12 sm:o-grid-cols-2 lg:o-grid-cols-4">
            {PICTOGRAMMES.map((p) => (
              <div key={p.cle}>
                <svg
                  viewBox="0 0 64 64"
                  aria-hidden="true"
                  className="o-block o-size-12"
                  style={{ color: ENCRE }}
                >
                  {p.dessin}
                </svg>
                <p className="o-m-0 o-mt-5 o-text-lg o-font-medium o-tracking-tight o-text-slate-50">
                  {p.titre}
                </p>
                <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-slate-400">
                  {p.legende}
                </p>
              </div>
            ))}
          </div>

          <div
            className="o-mt-16 o-flex o-flex-wrap o-items-center o-gap-x-8 o-gap-y-4 o-pt-6"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <span className="o-inline-flex o-items-center o-gap-2 o-text-base o-font-semibold o-tracking-tight o-text-slate-50">
              <Icon icon={Lock} size={16} style={{ color: ENCRE }} aria-hidden="true" />
              Pli Ferme
            </span>
            {(
              [
                ['#cadenas', 'Le protocole, en entier'],
                ['#figure', 'Les rapports d audit'],
                ['#garde', 'Ce que nous gardons'],
                ['#haut', 'Mentions legales'],
              ] as const
            ).map(([href, mot]) => (
              <a
                key={mot}
                href={href}
                className={`o-no-underline hover:o-text-slate-50 focus:o-ring ${NOTE}`}
              >
                {mot}
              </a>
            ))}
            <span className={`o-ml-auto o-inline-flex o-items-center o-gap-2 ${NOTE}`}>
              <Icon icon={Server} size={14} aria-hidden="true" />
              Serveurs a Nantes
            </span>
          </div>

          <p className={`o-mt-6 o-flex o-flex-wrap o-justify-between o-gap-4 ${NOTE}`}>
            <span>© 2026 Pli Ferme SAS — 12 quai Malakoff, 44000 Nantes</span>
            <span className="o-inline-flex o-items-center o-gap-2">
              <Icon icon={Key} size={14} aria-hidden="true" />
              Le code du client est public
              <Icon icon={Stamp} size={14} aria-hidden="true" />
            </span>
          </p>
        </footer>
      </div>
    </Porte>
  )
}
