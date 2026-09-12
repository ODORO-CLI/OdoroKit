/**
 * Orbe — place d echange.
 *
 * ## Le parti pris : la fiche produit
 *
 * Acheter une fraction de bitcoin, c est acheter un article : il a un nom, un
 * prix, des options et des frais. La page prend donc la forme d une fiche de
 * boutique. A gauche, le « visuel » — le cours en grand, sa courbe, puis le
 * carnet d ordres — et sous lui la rangee de vignettes, qui sont ici les six
 * paires cotees : on en choisit une comme on choisit une couleur. A droite, le
 * panneau d achat reste colle au defilement : la paire, le prix, le type
 * d ordre, le montant, les frais calcules et l action.
 *
 * Le reste — la grille de frais comparee, la preuve de reserves, les coffres,
 * l application — descend ensuite en sections d information, sous le media,
 * comme la description d un article sous sa photographie.
 *
 * ## Ce que la page fait vraiment
 *
 * Quatre mecanismes, tous calcules a l ecran :
 *
 * 1. **le type d ordre reecrit le formulaire** — au marche, a cours limite ou
 *    a declenchement : ce ne sont ni les memes champs, ni la meme commission,
 *    ni la meme promesse d execution ;
 * 2. **les frais dependent du montant et du palier** — la commission suit le
 *    volume echange sur trente jours, et le montant se saisit au clavier ;
 * 3. **l historique change de periode** — vingt-quatre heures, sept jours,
 *    trente jours ou un an, avec le plus haut et le plus bas de la fenetre ;
 * 4. **le carnet suit la paire choisie**, et son ecart se recalcule.
 *
 * ## L avertissement
 *
 * Il n est pas relegue au pied de page : ce metier l impose, et une place qui
 * le cache ment. Il ouvre le panneau d achat, il ferme la fiche, et il a sa
 * propre section avec ce que la reglementation europeenne dit — et ce qu elle
 * ne dit pas.
 *
 * ## La couleur
 *
 * Aucune teinte n est ecrite en dur : l accent vient de `--o-vitrine-*`, pose
 * par la barre. La hausse et la baisse ne sont pas peintes en vert et en
 * rouge — deux teintes fixes que la palette ne pourrait pas suivre — mais par
 * l accent d un cote, l encre sourde de l autre, la fleche et le signe
 * portant le sens. Le fond de donnees cite les memes variables.
 *
 * ## Le fond
 *
 * Le flux de donnees : des couloirs horizontaux qui avancent lentement, la
 * lecture d un bandeau de cotation. Il ne couvre que le cadre du visuel,
 * jamais le texte : les etiquettes qui s y posent ont leur propre aplat.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  Globe,
  Landmark,
  Layers,
  Lock,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  Wallet,
  Zap,
} from '@odoro-cli/icons/filaire'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { DataStream } from '@/odoro/background/DataStream.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { useIntervalClock } from '@/odoro/hooks/useIntervalClock'
import { ComparisonTable } from '@/odoro/section/ComparisonTable.jsx'
import { CounterRoll } from '@/odoro/text/CounterRoll.jsx'
import { ReflectiveCard } from '@/odoro/ui/ReflectiveCard.jsx'

import { photo } from './media.js'
import { accent, accentDoux } from './palettes.js'
import { Actions, affiche, CHROME, Coin, Etiquette, Grain, Porte, Surgit, TitreVague, usePolices } from './marche.jsx'
import { Bandeau } from './scene.jsx'

/** Filet blanc tres faible : le systeme n a pas de classe pour une opacite. */
const FILET = 'color-mix(in oklab, white 12%, transparent)'

/** Filet un peu plus marque, pour un encadrement. */
const FILET_FORT = 'color-mix(in oklab, white 20%, transparent)'

/** Voile pose sur une cellule sombre. */
const VOILE = 'color-mix(in oklab, white 5%, transparent)'

/**
 * Le theme sombre, epingle pour la page entiere.
 *
 * Cette vitrine est noire dans les deux themes — c est son parti pris. Les
 * pieces du registre qu elle emploie lisent les variables de theme : sans ce
 * remappage, le tableau comparatif et les cartes a reflet se peindraient en
 * blanc au milieu du noir. Il sert aussi a `encre()` : l accent doit y etre
 * eclairci, jamais fonce, quel que soit le theme du visiteur.
 */
const THEME_SOMBRE = {
  colorScheme: 'dark',
  '--o-theme-bg': 'var(--o-palette-zinc-950)',
  '--o-theme-surface': 'var(--o-palette-zinc-900)',
  '--o-theme-fg': 'var(--o-palette-zinc-50)',
  '--o-theme-muted': 'var(--o-palette-zinc-400)',
  '--o-theme-line': 'var(--o-palette-zinc-800)',
} as CSSProperties

/**
 * L accent, eclairci par l encre du theme.
 *
 * La page etant epinglee en sombre, le melange va toujours vers le clair : la
 * teinte reste lisible sur le noir pour les quinze palettes, y compris les
 * plus foncees, ce qu une nuance seule ne garantit pas.
 */
function encre(part = 44): string {
  return `color-mix(in oklab, ${accent(500)} ${String(part)}%, var(--o-theme-fg))`
}

/** Un aplat d accent dont l encre est le fond de la page : il s inverse seul. */
const APLAT: CSSProperties = { backgroundColor: encre(), color: 'var(--o-theme-bg)' }

/** Les liens de la barre fine. */
const NAVIGATION = [
  ['#marches', 'Marches'],
  ['#frais', 'Frais'],
  ['#reserves', 'Reserves'],
  ['#risque', 'Risque'],
] as const

/**
 * Les paires cotees.
 *
 * `derive` et `phase` fabriquent une marche pseudo-aleatoire deterministe :
 * la meme seconde donne toujours le meme cours, ce qui rend les captures
 * d ecran reproductibles la ou un tirage au sort ne le serait pas.
 */
const PAIRES = [
  { code: 'BTC', nom: 'Bitcoin', base: 61840, derive: 0.011, phase: 0, volume: '1,84 Md€' },
  { code: 'ETH', nom: 'Ethereum', base: 3118, derive: 0.017, phase: 1.2, volume: '742 M€' },
  { code: 'SOL', nom: 'Solana', base: 148.6, derive: 0.026, phase: 2.4, volume: '311 M€' },
  { code: 'XMR', nom: 'Monero', base: 172.9, derive: 0.014, phase: 3.6, volume: '48 M€' },
  { code: 'ADA', nom: 'Cardano', base: 0.617, derive: 0.021, phase: 4.8, volume: '96 M€' },
  { code: 'LINK', nom: 'Chainlink', base: 17.42, derive: 0.019, phase: 6, volume: '58 M€' },
] as const

/**
 * Les trois types d ordre.
 *
 * `champ` dit ce que le formulaire ajoute : un ordre au marche n a rien a
 * saisir de plus, un ordre a cours limite demande un prix, un ordre a
 * declenchement demande un seuil. C est ce qui distingue un vrai carnet d une
 * capture d ecran.
 */
const ORDRES = [
  {
    cle: 'marche',
    libelle: 'Au marche',
    champ: 'aucun',
    role: 'preneur',
    execution: 'Immediate, au meilleur prix disponible du carnet.',
    avertissement:
      'Le prix obtenu peut differer du prix affiche si le carnet se vide : c est l ordre qui coute le plus cher.',
  },
  {
    cle: 'limite',
    libelle: 'A cours limite',
    champ: 'prix',
    role: 'apporteur',
    execution: 'Des qu un vendeur accepte votre prix, en totalite ou par morceaux.',
    avertissement:
      'Il peut n etre jamais execute si le cours ne revient pas a votre prix. C est le prix de la maitrise.',
  },
  {
    cle: 'declenchement',
    libelle: 'A declenchement',
    champ: 'seuil',
    role: 'preneur',
    execution: 'Devient un ordre au marche des que le seuil est franchi.',
    avertissement:
      'Un decrochage rapide peut sauter le seuil : l ordre part alors nettement plus bas que prevu.',
  },
] as const

/**
 * Les paliers de commission, selon le volume echange sur trente jours.
 *
 * `apporteur` et `preneur` sont les deux cotes du carnet : celui qui pose un
 * ordre et attend, celui qui prend un ordre pose. Le premier paie moins,
 * partout, et c est ce que les places qui annoncent « zero commission »
 * evitent d ecrire.
 */
const PALIERS = [
  { cle: 'p0', libelle: 'Moins de 10 000 €', apporteur: 0.0008, preneur: 0.002 },
  { cle: 'p1', libelle: 'De 10 000 a 100 000 €', apporteur: 0.0005, preneur: 0.0014 },
  { cle: 'p2', libelle: 'De 100 000 a 1 M€', apporteur: 0.0002, preneur: 0.0009 },
  { cle: 'p3', libelle: 'Plus de 1 M€', apporteur: 0, preneur: 0.0006 },
] as const

/** Les montants proposes d un clic dans le panneau. */
const MONTANTS = [250, 1000, 5000, 25000] as const

/**
 * Les fenetres de l historique.
 *
 * `pas` est le nombre de battements que couvre un point : plus la fenetre est
 * large, plus le trace remonte loin dans la meme marche deterministe.
 */
const PERIODES = [
  { cle: '24h', libelle: '24 h', pas: 1, points: 48, legende: 'un point par demi-heure' },
  { cle: '7j', libelle: '7 j', pas: 7, points: 56, legende: 'un point par trois heures' },
  { cle: '30j', libelle: '30 j', pas: 30, points: 60, legende: 'un point par douze heures' },
  { cle: '1an', libelle: '1 an', pas: 365, points: 52, legende: 'un point par semaine' },
] as const

/** Ce que la place garantit sur les fonds. */
const COFFRE = [
  {
    icone: Lock,
    titre: '96 % hors ligne',
    texte:
      'Les avoirs des clients dorment sur des modules materiels repartis dans trois coffres, en Suisse, en Irlande et a Singapour.',
  },
  {
    icone: Landmark,
    titre: 'Reserves prouvees chaque mois',
    texte:
      'Un arbre de Merkle publie le premier de chaque mois : chaque client verifie que son solde est compte dans le total.',
  },
  {
    icone: Fingerprint,
    titre: 'Retrait a deux cles',
    texte:
      'Toute sortie superieure a dix mille euros exige une seconde signature et une fenetre de vingt-quatre heures.',
  },
] as const

/**
 * La preuve de reserves du 1er septembre 2026.
 *
 * Une place qui garde les fonds d autrui doit publier ce qu elle detient face
 * a ce qu elle doit. Le ratio est la seule ligne qui compte : en dessous de
 * cent pour cent, il manque de l argent.
 */
const RESERVES = [
  { actif: 'Bitcoin', detenu: '18 412,08 BTC', du: '18 372,44 BTC', ratio: 100.2 },
  { actif: 'Ethereum', detenu: '141 220,6 ETH', du: '140 918,1 ETH', ratio: 100.2 },
  { actif: 'Solana', detenu: '486 902 SOL', du: '486 004 SOL', ratio: 100.2 },
  { actif: 'Euro', detenu: '214,8 M€', du: '213,1 M€', ratio: 100.8 },
] as const

/** Ce qui accompagne l attestation de reserves. */
const PREUVE = [
  ['Date de l instantane', '1er septembre 2026, 00 h 00 UTC'],
  ['Racine de Merkle', '0x8f2c…41ad, publiee sur la chaine'],
  ['Comptes inclus', '312 884 comptes clients'],
  ['Verification', 'Cabinet Ferland & Roux, audit d attestation'],
  ['Passifs hors clients', 'Aucun emprunt garanti par les avoirs clients'],
] as const

/** Les frais, compares a ce que pratiquent les autres. */
const COLONNES = [
  { name: 'Orbe', note: 'Frais affiches, sans palier cache.', featured: true },
  { name: 'Place A', note: 'Courtier europeen grand public.' },
  { name: 'Place B', note: 'Application mobile a frais « zero ».' },
] as const

/** Les lignes du comparatif de frais. */
const LIGNES = [
  {
    group: 'Ce que coute un ordre',
    label: 'Ordre au marche, premier palier',
    values: ['0,20 %', '0,60 %', '0 %, ecart elargi'],
  },
  {
    group: 'Ce que coute un ordre',
    label: 'Ordre a cours limite, premier palier',
    values: ['0,08 %', '0,40 %', 'Indisponible'],
  },
  {
    group: 'Ce que coute un ordre',
    label: 'Ordre au marche au-dela d un million',
    values: ['0,06 %', '0,35 %', 'Indisponible'],
  },
  {
    group: 'Ce que coute un ordre',
    label: 'Ecart moyen affiche sur BTC',
    values: ['0,4 pb', '1,8 pb', '32 pb'],
  },
  { group: 'Entrees et sorties', label: 'Virement SEPA entrant', values: [true, true, true] },
  { group: 'Entrees et sorties', label: 'Virement SEPA sortant', values: ['Gratuit', '1,50 €', '3,00 €'] },
  { group: 'Entrees et sorties', label: 'Retrait en chaine', values: ['Cout reseau seul', 'Cout reseau + 4 €', 'Indisponible'] },
  { group: 'Le reste', label: 'Frais de garde', values: [false, false, false] },
  { group: 'Le reste', label: 'Frais d inactivite', values: [false, true, true] },
  { group: 'Le reste', label: 'Preuve de reserves mensuelle', values: [true, false, false] },
  { group: 'Le reste', label: 'Interface de programmation publique', values: [true, true, false] },
  { group: 'Le reste', label: 'Export fiscal francais', values: ['Formulaire 2086 pre-rempli', 'CSV brut', false] },
] as const

/** Les niveaux du carnet d ordres simplifie. */
const CARNET = [
  { ecart: 6, taille: 0.82 },
  { ecart: 4, taille: 0.61 },
  { ecart: 2, taille: 0.94 },
  { ecart: 1, taille: 0.47 },
] as const

/** Ce qui distingue ce carnet des autres. */
const PRINCIPES = [
  {
    titre: 'Un seul carnet',
    texte:
      'Pas de teneur de marche interne qui prendrait l autre cote de votre ordre : tous les participants voient le meme livre.',
  },
  {
    titre: 'Ordre a cours limite par defaut',
    texte:
      'L ordre au marche est possible, mais il n est pas propose en premier. C est celui qui coute le plus cher.',
  },
  {
    titre: 'Execution partielle affichee',
    texte:
      'Un ordre servi a soixante pour cent le dit sur la ligne, avec le prix moyen obtenu, pas apres coup.',
  },
] as const

/** Ce que fait l application. */
const MOBILE = [
  {
    icone: Zap,
    titre: 'Passer un ordre en deux gestes',
    texte: 'La paire est deja ouverte, le montant se saisit au pave, la confirmation tient dans le pouce.',
  },
  {
    icone: Activity,
    titre: 'Alertes de seuil',
    texte: 'Un cours franchi previent en moins d une seconde, meme quand l application est fermee.',
  },
  {
    icone: Wallet,
    titre: 'Retrait vers votre banque',
    texte: 'Le virement instantane part vers l IBAN enregistre, sept jours sur sept, sans frais.',
  },
] as const

/**
 * L avertissement de risque, en cinq points.
 *
 * Ce n est pas une precaution d avocat : la reglementation europeenne impose
 * qu une communication commerciale sur les crypto-actifs soit loyale, claire
 * et non trompeuse, et qu elle porte la mention du risque de perte totale.
 */
const RISQUES = [
  {
    titre: 'La perte peut etre totale',
    texte:
      'Un crypto-actif n a ni valeur garantie ni emetteur tenu de le racheter. Son cours peut tomber a zero et y rester.',
  },
  {
    titre: 'Aucune garantie des depots',
    texte:
      'Le fonds de garantie des depots ne couvre pas les crypto-actifs, ni les euros deposes en vue de les acheter. Ce n est pas un compte bancaire.',
  },
  {
    titre: 'Les performances passees ne disent rien',
    texte:
      'Les courbes de cette page sont un historique. Aucun rendement n est promis, et aucune projection n est fournie.',
  },
  {
    titre: 'Orbe ne conseille pas',
    texte:
      'Nous executons des ordres. Nous ne recommandons aucun actif, ne gerons aucun portefeuille et ne fournissons aucun conseil en investissement.',
  },
  {
    titre: 'La fiscalite reste la votre',
    texte:
      'Les plus-values de cession d actifs numeriques sont imposables en France. Nous fournissons le detail annuel ; la declaration vous incombe.',
  },
] as const

/** Un cours a l instant du battement. */
function cours(paire: (typeof PAIRES)[number], battement: number): number {
  const onde =
    Math.sin(battement * 0.7 + paire.phase) * 0.6 +
    Math.sin(battement * 0.23 + paire.phase * 2) * 0.4
  return paire.base * (1 + paire.derive * onde)
}

/** La variation sur vingt-quatre heures, en pourcentage. */
function variation(paire: (typeof PAIRES)[number], battement: number): number {
  return paire.derive * 100 * (Math.sin(battement * 0.7 + paire.phase) * 0.6 + 0.4)
}

/** Les points d une fenetre d historique, du plus ancien au plus recent. */
function historique(
  paire: (typeof PAIRES)[number],
  battement: number,
  periode: (typeof PERIODES)[number],
): readonly number[] {
  return Array.from({ length: periode.points }, (_, index) =>
    cours(paire, battement - (periode.points - 1 - index) * periode.pas),
  )
}

/** Un nombre francais, avec le bon nombre de decimales pour un cours. */
function prix(valeur: number): string {
  const decimales = valeur >= 1000 ? 0 : valeur >= 10 ? 2 : 4
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/** Un montant en euros, deux decimales. */
function euros(valeur: number): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Un taux de commission, en pourcentage francais. */
function taux(valeur: number): string {
  return `${(valeur * 100).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`
}

/** Un intitule de section, toujours pose de la meme facon. */
function Titre({
  surtitre,
  children,
  texte,
}: {
  readonly surtitre: string
  readonly children: ReactNode
  readonly texte?: string
}): ReactElement {
  return (
    <div className="o-max-w-2xl">
      <p
        className="o-text-xs o-font-semibold o-uppercase o-tracking-widest"
        style={{ color: encre() }}
      >
        {surtitre}
      </p>
      <h2 className="o-mt-3 o-text-3xl o-font-bold o-tracking-tight md:o-text-4xl o-text-zinc-50">
        {children}
      </h2>
      {texte !== undefined && (
        <p className="o-mt-4 o-text-lg o-leading-relaxed o-text-zinc-400">{texte}</p>
      )}
    </div>
  )
}

/**
 * La courbe du cours sur la fenetre choisie.
 *
 * Le trace est decoratif : les nombres qui comptent — plus haut, plus bas,
 * variation — sont ecrits en toutes lettres a cote.
 */
function Courbe({ points }: { readonly points: readonly number[] }): ReactElement {
  const bas = Math.min(...points)
  const haut = Math.max(...points)
  const etendue = haut - bas || 1
  const dernier = points.length - 1 || 1
  const trace = points
    .map((valeur, index) => {
      const x = (index / dernier) * 100
      const y = 38 - ((valeur - bas) / etendue) * 34
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="o-absolute o-inset-0 o-h-full o-w-full"
    >
      <polyline
        points={trace}
        fill="none"
        stroke={encre(64)}
        strokeWidth="0.6"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  const { reduced } = useMotionState()
  const [battement, setBattement] = useState(0)
  const [paireActive, setPaireActive] = useState<string>('BTC')
  const [ordre, setOrdre] = useState<string>('limite')
  const [montant, setMontant] = useState<number>(1000)
  const [palier, setPalier] = useState<string>('p0')
  const [periode, setPeriode] = useState<string>('24h')

  // Le cours bouge parce que c est le sujet ; sous mouvement reduit il se fige
  // sur sa premiere valeur, qui reste une information juste.
  useIntervalClock(
    () => {
      setBattement((b) => b + 1)
    },
    { interval: 2600, actif: !reduced, name: 'orbe : cours' },
  )

  const paire = PAIRES.find((p) => p.code === paireActive) ?? PAIRES[0]
  const valeur = cours(paire, battement)
  const ecart = variation(paire, battement)
  const hausse = ecart >= 0
  const type = ORDRES.find((o) => o.cle === ordre) ?? ORDRES[0]
  const niveau = PALIERS.find((p) => p.cle === palier) ?? PALIERS[0]
  const fenetre = PERIODES.find((p) => p.cle === periode) ?? PERIODES[0]

  const commission = type.role === 'apporteur' ? niveau.apporteur : niveau.preneur
  const frais = montant * commission
  const limite = valeur * 0.995
  const seuil = valeur * 1.02
  const reference = ordre === 'limite' ? limite : ordre === 'declenchement' ? seuil : valeur
  const recu = (montant - frais) / reference

  const points = historique(paire, battement, fenetre)
  const plusBas = Math.min(...points)
  const plusHaut = Math.max(...points)
  const debut = points[0] ?? 1
  const fin = points[points.length - 1] ?? debut
  const variationFenetre = points.length > 1 ? ((fin - debut) / debut) * 100 : 0

  return (
    <Porte forme="zoom" marque="Orbe">
    <div className="o-bg-zinc-950 o-text-zinc-100 dark:o-text-zinc-100" style={{ ...polices, ...THEME_SOMBRE }}>
      {/* ----- Barre fine, avec le portefeuille ----------------------------- */}
      <header className="o-border-b o-bg-zinc-950" style={{ borderColor: FILET }}>
        <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-center o-gap-x-6 o-gap-y-2 o-px-4 o-py-2.5 md:o-px-6">
          <a
            href="#fiche"
            className="o-inline-flex o-items-center o-gap-2 o-no-underline o-text-zinc-50 focus:o-ring"
          >
            <Icon icon={Globe} size={16} style={{ color: encre() }} />
            <span className="o-text-sm o-font-bold o-tracking-tight">Orbe</span>
          </a>

          <nav aria-label="Sections du site" className="o-flex o-flex-wrap o-items-center o-gap-5">
            {NAVIGATION.map(([href, libelle]) => (
              <a
                key={href}
                href={href}
                className="o-text-xs o-font-medium o-no-underline o-text-zinc-400 hover:o-text-zinc-50 o-transition-colors focus:o-ring"
              >
                {libelle}
              </a>
            ))}
          </nav>

          <a
            href="#ouvrir"
            className="o-ml-auto o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-3 o-py-1.5 o-text-xs o-font-semibold o-no-underline o-text-zinc-100 hover:o-text-zinc-50 o-transition-colors focus:o-ring"
            style={{ borderColor: FILET_FORT }}
          >
            <Icon icon={Wallet} size={14} aria-hidden="true" />
            Portefeuille
            <span
              className="o-inline-flex o-size-5 o-items-center o-justify-center o-rounded-full o-tabular-nums"
              style={APLAT}
            >
              2
            </span>
          </a>
        </div>
      </header>

      <main>
        {/*
          ================================================= L affiche

          Le seul contexte anime de la page est ici, plein cadre : le flux de
          donnees, qu un voile oblique eteint la ou le titre se pose. La fiche
          produit — le carnet, le panneau d achat — commence juste dessous,
          derriere le ticker.
        */}
        <section id="sommet" aria-label="Ouverture" className="o-relative o-isolate o-overflow-hidden">
          <div aria-hidden="true" className="o-absolute o-inset-0">
            <DataStream
              className="o-absolute o-inset-0"
              lanes={18}
              speed={0.5}
              density={4}
              thickness={0.24}
              colors={['--o-theme-bg', '--o-vitrine-500', '--o-vitrine-seconde']}
              fallback="o-bg-zinc-950"
            />
            {/* Le voile ne s efface jamais completement : les metadonnees de
                coin se posent sur la droite du cadre, et un flux plein les
                rendrait illisibles. */}
            <div
              className="o-absolute o-inset-0"
              style={{
                background:
                  'linear-gradient(102deg, #09090b 0%, color-mix(in oklab, #09090b 92%, transparent) 36%, color-mix(in oklab, #09090b 74%, transparent) 68%, color-mix(in oklab, #09090b 62%, transparent) 100%)',
              }}
            />
            <div
              className="o-absolute o-inset-x-0 o-bottom-0 o-h-40"
              style={{ background: 'linear-gradient(to bottom, transparent, #09090b)' }}
            />
            <Grain opacite={0.06} />
          </div>

          <div
            className="o-relative o-z-20 o-mx-auto o-flex o-max-w-7xl o-flex-col o-justify-center o-px-4 o-pb-24 o-pt-14 md:o-px-6"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px - 160px)` }}
          >
            <Surgit>
              <Etiquette>Prestataire enregistre a l AMF — E2024-118, Paris</Etiquette>
            </Surgit>
            <TitreVague
              delai={120}
              className="o-m-0 o-mt-8 o-max-w-4xl o-text-zinc-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}
            >
              Le cours affiche est celui qu on vous passe.
            </TitreVague>
            <Surgit delai={520} as="p" className="o-m-0 o-mt-9 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300">
              Ni moyenne differee, ni marge cachee dans l ecart. Le carnet est
              ouvert sur cette page, et les frais se calculent devant vous.
            </Surgit>
            <Surgit delai={660} className="o-mt-10">
              <Actions
                pleine={['#ouvrir', <>Ouvrir un compte <Icon icon={ArrowRight} size={16} aria-hidden="true" /></>]}
                fantome={['#carnet', 'Voir le carnet']}
              />
            </Surgit>
          </div>

          <Coin position="bg">214 paires cotees · reserves publiees chaque mois<br />Retrait ouvert des la premiere heure</Coin>
          <Coin position="bd">Perte totale du capital possible<br />Aucun conseil, aucune recommandation</Coin>
        </section>

        {/*
          ================================================= Le ticker (C9)

          La seule mise en scene de chiffres de la page : une bande qui passe.
          Elle ferme l affiche et ouvre la fiche, comme le bandeau de cotation
          court sous l ecran d une salle de marche.
        */}
        <div
          aria-hidden="true"
          className="o-relative o-z-20 o-overflow-hidden o-border-t o-border-b o-bg-zinc-950 o-py-4"
          style={{ borderColor: FILET }}
        >
          <Marquee speed={40} fade={8} pauseOnHover={false}>
            {[...PAIRES, ...PAIRES].map((p, rang) => {
              const v = variation(p, battement)
              const monte = v >= 0
              return (
                <span
                  key={`${p.code}-${String(rang)}`}
                  className="o-flex o-shrink-0 o-items-baseline o-gap-3 o-px-7 o-text-sm o-tabular-nums o-whitespace-nowrap"
                >
                  <span className="o-font-bold o-tracking-tight o-text-zinc-50">{p.code}</span>
                  <span className="o-text-zinc-300">{prix(cours(p, battement))} €</span>
                  <span style={{ color: monte ? encre() : 'var(--o-palette-zinc-400)' }}>
                    {(monte ? '+' : '') + v.toFixed(2).replace('.', ',')} %
                  </span>
                  <span className="o-text-zinc-700">/</span>
                </span>
              )
            })}
          </Marquee>
        </div>

        {/* ----- La fiche : media a gauche, panneau colle a droite ---------- */}
        <div
          id="fiche"
          className="o-mx-auto o-grid o-max-w-7xl o-gap-8 o-px-4 o-py-8 md:o-px-6 md:o-py-10 lg:o-grid-cols-12"
        >
          {/* --- Le media : cours, courbe, vignettes, carnet --------------- */}
          <div className="lg:o-col-span-7">
            <p className="o-flex o-flex-wrap o-items-center o-gap-2 o-text-xs o-text-zinc-400">
              <a href="#marches" className="o-no-underline o-text-zinc-400 hover:o-text-zinc-50 focus:o-ring">
                Marches
              </a>
              <span aria-hidden="true">/</span>
              <span>Crypto-actifs</span>
              <span aria-hidden="true">/</span>
              <span className="o-text-zinc-100">{paire.nom}</span>
            </p>

            <div
              className="o-relative o-isolate o-mt-3 o-overflow-hidden o-rounded-2xl o-border-w-1"
              style={{ borderColor: FILET }}
            >
              {/* Le flux anime est monte dans l affiche : une page n a droit
                  qu a un contexte graphique, et c est l ouverture qui le
                  merite. Ici, les couloirs sont dessines et immobiles — un
                  cadre de cotation, pas une scene. */}
              <div
                aria-hidden="true"
                className="o-absolute o-inset-0 o-z-0"
                style={{
                  backgroundColor: 'var(--o-palette-zinc-950)',
                  backgroundImage: `repeating-linear-gradient(to bottom, ${accentDoux(500, 16)} 0 1px, transparent 1px 15px)`,
                }}
              />
              <div
                aria-hidden="true"
                className="o-absolute o-inset-0 o-z-0"
                style={{
                  background:
                    'linear-gradient(to right, #09090b 0%, color-mix(in oklab, #09090b 55%, transparent) 45%, transparent 100%)',
                }}
              />

              <div className="o-relative o-z-10 o-flex o-h-80 o-flex-col o-justify-between o-p-5 md:o-h-96 md:o-p-6">
                <div className="o-flex o-flex-wrap o-items-start o-justify-between o-gap-3">
                  <div
                    className="o-rounded-xl o-px-3 o-py-2"
                    style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}
                  >
                    <p className="o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400">
                      {paire.code} / EUR — carnet unique
                    </p>
                    <p className="o-mt-1 o-text-3xl o-font-bold o-tabular-nums o-tracking-tight o-text-zinc-50 md:o-text-4xl">
                      {prix(valeur)}
                      <span className="o-ml-2 o-text-xl o-font-normal o-text-zinc-400">€</span>
                    </p>
                  </div>
                  <p
                    className="o-inline-flex o-items-center o-gap-1 o-rounded-full o-px-3 o-py-1.5 o-text-sm o-font-semibold o-tabular-nums"
                    style={{
                      backgroundColor: 'var(--o-palette-zinc-950)',
                      color: hausse ? encre() : 'var(--o-palette-zinc-300)',
                    }}
                  >
                    <Icon
                      icon={hausse ? ArrowUpRight : ArrowDownRight}
                      size={14}
                      aria-hidden="true"
                    />
                    {(hausse ? '+' : '') + ecart.toFixed(2).replace('.', ',')} % sur 24 h
                  </p>
                </div>

                {/* --- Le choix de la fenetre d historique --------------- */}
                <div
                  role="group"
                  aria-label="Periode de l historique de prix"
                  className="o-flex o-flex-wrap o-gap-1.5"
                >
                  {PERIODES.map((p) => {
                    const actif = p.cle === periode
                    return (
                      <button
                        key={p.cle}
                        type="button"
                        aria-pressed={actif}
                        onClick={() => {
                          setPeriode(p.cle)
                        }}
                        className="o-rounded-lg o-border-w-1 o-px-3 o-py-1 o-text-xs o-font-semibold o-tabular-nums o-cursor-pointer o-transition-colors focus:o-ring"
                        style={
                          actif
                            ? { ...APLAT, borderColor: encre() }
                            : {
                                borderColor: FILET,
                                backgroundColor: 'var(--o-palette-zinc-950)',
                                color: 'var(--o-palette-zinc-100)',
                              }
                        }
                      >
                        {p.libelle}
                        <span className="o-sr-only"> d historique</span>
                      </button>
                    )
                  })}
                </div>

                <div className="o-relative o-h-24 o-w-full md:o-h-28">
                  <Courbe points={points} />
                </div>

                <dl className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2 o-text-xs">
                  {[
                    ['Plus haut', `${prix(plusHaut)} €`],
                    ['Plus bas', `${prix(plusBas)} €`],
                    [
                      `Sur ${fenetre.libelle}`,
                      `${variationFenetre >= 0 ? '+' : ''}${variationFenetre.toFixed(2).replace('.', ',')} %`,
                    ],
                    ['Volume 24 h', paire.volume],
                  ].map(([terme, contenu]) => (
                    <div
                      key={terme}
                      className="o-rounded-lg o-px-2 o-py-1"
                      style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}
                    >
                      <dt className="o-text-zinc-400">{terme}</dt>
                      <dd className="o-mt-0.5 o-font-semibold o-tabular-nums o-text-zinc-100">
                        {contenu}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <p className="o-mt-2 o-text-xs o-text-zinc-400">
              Historique sur {fenetre.libelle}, {fenetre.legende}. Les performances
              passees ne prejugent pas des performances futures.
            </p>

            {/* --- La rangee de vignettes : les six paires ---------------- */}
            <div
              role="group"
              aria-label="Choisir la paire affichee"
              className="o-mt-3 o-grid o-grid-cols-3 o-gap-2 sm:o-grid-cols-6"
            >
              {PAIRES.map((p) => {
                const actif = p.code === paireActive
                const v = variation(p, battement)
                return (
                  <button
                    key={p.code}
                    type="button"
                    aria-pressed={actif}
                    onClick={() => {
                      setPaireActive(p.code)
                    }}
                    className={[
                      'o-rounded-xl o-border-w-1 o-px-2 o-py-2 o-text-left o-cursor-pointer o-transition-colors focus:o-ring',
                      actif ? 'o-bg-zinc-900' : 'o-bg-zinc-950 hover:o-bg-zinc-900',
                    ].join(' ')}
                    style={{ borderColor: actif ? encre() : FILET }}
                  >
                    <span className="o-block o-text-xs o-font-bold o-text-zinc-50">
                      {p.code}
                    </span>
                    <span
                      className="o-block o-text-xs o-tabular-nums"
                      style={{ color: v >= 0 ? encre() : 'var(--o-palette-zinc-400)' }}
                    >
                      {(v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',')} %
                    </span>
                    <span className="o-sr-only">
                      {p.nom}, voir son carnet et son cours
                    </span>
                  </button>
                )
              })}
            </div>

            {/* --- Le carnet d ordres, en grand --------------------------- */}
            {/*
              Le carnet fait partie du visuel de la fiche, pas du plan du
              document : son intitule est un paragraphe, pour que le premier
              titre de la page reste le nom du produit, dans le panneau.

              Les deux cotes ne sont pas peints en vert et en rouge : ces deux
              teintes sont fixes, et la vitrine doit se relire dans quinze
              palettes. La vente porte l encre sourde, l achat porte l accent,
              et chaque liste est nommee.
            */}
            <section
              id="carnet"
              aria-label={`Carnet d ordres ${paire.code} contre euro`}
              className="o-mt-8 o-rounded-2xl o-border-w-1 o-p-5 md:o-p-6"
              style={{ borderColor: FILET, backgroundColor: VOILE }}
            >
              <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
                <p className="o-text-xl o-font-semibold o-tracking-tight o-text-zinc-50">
                  Carnet d ordres — {paire.code} / EUR
                </p>
                <p className="o-text-xs o-text-zinc-400">
                  Huit lignes sur des milliers : ce qu on vend au-dessus, ce qu on
                  achete en dessous.
                </p>
              </div>

              <p className="o-mt-5 o-flex o-items-center o-justify-between o-px-3 o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                <span>Ventes en attente</span>
                <span>Quantite</span>
              </p>
              <ul className="o-mt-2 o-list-none o-space-y-1 o-p-0">
                {[...CARNET].reverse().map((n, index) => (
                  <li
                    key={`vente-${String(index)}`}
                    className="o-relative o-flex o-items-center o-justify-between o-overflow-hidden o-rounded-md o-px-3 o-py-2 o-text-sm o-tabular-nums"
                  >
                    <span
                      aria-hidden="true"
                      className="o-absolute o-inset-y-0 o-right-0"
                      style={{
                        width: `${String(Math.round(n.taille * 100))}%`,
                        backgroundColor: 'color-mix(in oklab, white 10%, transparent)',
                      }}
                    />
                    <span className="o-relative o-text-zinc-200">
                      {prix(valeur * (1 + n.ecart / 1000))} €
                    </span>
                    <span className="o-relative o-text-zinc-400">
                      {(n.taille * 12).toFixed(3).replace('.', ',')}
                    </span>
                  </li>
                ))}
              </ul>

              <p
                className="o-my-3 o-flex o-items-center o-justify-between o-border-t o-border-b o-px-3 o-py-2 o-text-base o-font-semibold o-tabular-nums o-text-zinc-50"
                style={{ borderColor: FILET_FORT }}
              >
                <span>{prix(valeur)} €</span>
                <span className="o-text-xs o-font-normal o-text-zinc-400">
                  ecart 0,4 pb — dernier prix traite
                </span>
              </p>

              <p className="o-flex o-items-center o-justify-between o-px-3 o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                <span>Achats en attente</span>
                <span>Quantite</span>
              </p>
              <ul className="o-mt-2 o-list-none o-space-y-1 o-p-0">
                {CARNET.map((n, index) => (
                  <li
                    key={`achat-${String(index)}`}
                    className="o-relative o-flex o-items-center o-justify-between o-overflow-hidden o-rounded-md o-px-3 o-py-2 o-text-sm o-tabular-nums"
                  >
                    <span
                      aria-hidden="true"
                      className="o-absolute o-inset-y-0 o-right-0"
                      style={{
                        width: `${String(Math.round(n.taille * 100))}%`,
                        backgroundColor: accentDoux(500, 26),
                      }}
                    />
                    <span className="o-relative" style={{ color: encre() }}>
                      {prix(valeur * (1 - n.ecart / 1000))} €
                    </span>
                    <span className="o-relative o-text-zinc-400">
                      {(n.taille * 9).toFixed(3).replace('.', ',')}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="o-mt-8 o-grid o-gap-5 sm:o-grid-cols-3">
                {PRINCIPES.map((point) => (
                  <div key={point.titre} className="o-border-l o-pl-4" style={{ borderColor: FILET_FORT }}>
                    <dt className="o-text-sm o-font-semibold o-tracking-tight o-text-zinc-50">
                      {point.titre}
                    </dt>
                    <dd className="o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-400">
                      {point.texte}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* --- Le panneau d achat, colle au defilement ------------------ */}
          <aside
            aria-label="Passer un ordre"
            className="o-self-start lg:o-col-span-5 lg:o-sticky lg:o-top-20"
          >
            <div
              className="o-rounded-2xl o-border-w-1 o-bg-zinc-900 o-p-5 md:o-p-6"
              style={{ borderColor: FILET_FORT }}
            >
              <p
                className="o-text-xs o-font-semibold o-uppercase o-tracking-widest"
                style={{ color: encre() }}
              >
                Orbe — place d echange europeenne
              </p>

              {/* Le premier titre de la page est celui de l affiche : ici,
                  c est le nom du produit consulte, donc un titre de second
                  rang. */}
              <h2 className="o-mt-2 o-text-3xl o-font-bold o-tracking-tight o-text-zinc-50">
                {paire.nom} / Euro
              </h2>

              <p className="o-mt-4 o-text-4xl o-font-bold o-tabular-nums o-tracking-tight o-text-zinc-50">
                <CounterRoll value={Math.round(valeur)} locale="fr-FR" />
                <span className="o-ml-2 o-text-xl o-font-normal o-text-zinc-400">€</span>
              </p>
              <p className="o-mt-1 o-text-sm o-text-zinc-400">
                Cours du carnet, pas une moyenne differee. Ecart affiche 0,4 pb.
              </p>

              {/* --- Le type d ordre ---------------------------------- */}
              <fieldset
                className="o-mt-6 o-border-t o-p-0 o-pt-5"
                style={{ borderColor: FILET }}
              >
                <legend className="o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400">
                  Type d ordre
                </legend>
                <div className="o-mt-3 o-grid o-gap-2 sm:o-grid-cols-3">
                  {ORDRES.map((o) => {
                    const actif = o.cle === ordre
                    const commissionType =
                      o.role === 'apporteur' ? niveau.apporteur : niveau.preneur
                    return (
                      <button
                        key={o.cle}
                        type="button"
                        aria-pressed={actif}
                        onClick={() => {
                          setOrdre(o.cle)
                        }}
                        className={[
                          'o-rounded-xl o-border-w-1 o-px-3 o-py-2.5 o-text-left o-cursor-pointer o-transition-colors focus:o-ring',
                          actif ? 'o-bg-zinc-950' : 'hover:o-bg-zinc-950',
                        ].join(' ')}
                        style={{ borderColor: actif ? encre() : FILET }}
                      >
                        <span className="o-block o-text-sm o-font-semibold o-text-zinc-50">
                          {o.libelle}
                        </span>
                        <span className="o-block o-text-xs o-tabular-nums o-text-zinc-400">
                          {taux(commissionType)}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Le champ que ce type d ordre ajoute : c est la seule chose
                    qui distingue vraiment les trois, et elle est montree. */}
                <div
                  className="o-mt-4 o-rounded-xl o-p-4"
                  style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}
                >
                  {type.champ === 'aucun' ? (
                    <p className="o-text-sm o-text-zinc-300">
                      Aucun prix a saisir : l ordre part au meilleur prix
                      disponible, tout de suite.
                    </p>
                  ) : (
                    <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
                      <span className="o-text-sm o-text-zinc-300">
                        {type.champ === 'prix' ? 'Votre prix limite' : 'Seuil de declenchement'}
                      </span>
                      <span
                        className="o-font-mono o-text-lg o-font-semibold o-tabular-nums"
                        style={{ color: encre() }}
                      >
                        {prix(type.champ === 'prix' ? limite : seuil)} €
                      </span>
                    </div>
                  )}
                  <p className="o-mt-2 o-text-xs o-leading-relaxed o-text-zinc-400">
                    {type.execution}
                  </p>
                  <p className="o-mt-2 o-flex o-gap-2 o-text-xs o-leading-relaxed o-text-zinc-300">
                    <Icon
                      icon={TriangleAlert}
                      size={13}
                      className="o-mt-0.5 o-shrink-0"
                      aria-hidden="true"
                    />
                    {type.avertissement}
                  </p>
                </div>
              </fieldset>

              {/* --- Le montant --------------------------------------- */}
              <fieldset
                className="o-mt-5 o-border-t o-p-0 o-pt-5"
                style={{ borderColor: FILET }}
              >
                <legend className="o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400">
                  Montant
                </legend>
                <div className="o-mt-3 o-grid o-grid-cols-2 o-gap-2 sm:o-grid-cols-4">
                  {MONTANTS.map((m) => {
                    const actif = m === montant
                    return (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={actif}
                        onClick={() => {
                          setMontant(m)
                        }}
                        className="o-rounded-xl o-border-w-1 o-px-3 o-py-2 o-text-sm o-font-semibold o-tabular-nums o-cursor-pointer o-transition-colors focus:o-ring"
                        style={
                          actif
                            ? { ...APLAT, borderColor: encre() }
                            : { borderColor: FILET, color: 'var(--o-palette-zinc-100)' }
                        }
                      >
                        {m.toLocaleString('fr-FR')} €
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              {/* --- Le palier de commission --------------------------- */}
              <fieldset
                className="o-mt-5 o-border-t o-p-0 o-pt-5"
                style={{ borderColor: FILET }}
              >
                <legend className="o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400">
                  Votre volume sur trente jours
                </legend>
                <div className="o-mt-3 o-grid o-gap-2 sm:o-grid-cols-2">
                  {PALIERS.map((p) => {
                    const actif = p.cle === palier
                    return (
                      <button
                        key={p.cle}
                        type="button"
                        aria-pressed={actif}
                        onClick={() => {
                          setPalier(p.cle)
                        }}
                        className="o-rounded-xl o-border-w-1 o-px-3 o-py-2 o-text-left o-text-xs o-cursor-pointer o-transition-colors focus:o-ring"
                        style={
                          actif
                            ? { ...APLAT, borderColor: encre() }
                            : { borderColor: FILET, color: 'var(--o-palette-zinc-100)' }
                        }
                      >
                        <span className="o-block o-font-semibold">{p.libelle}</span>
                        <span className="o-block o-tabular-nums">
                          {taux(p.apporteur)} / {taux(p.preneur)}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="o-mt-2 o-text-xs o-text-zinc-400">
                  Apporteur de liquidite / preneur de liquidite. Le palier est
                  recalcule chaque nuit sur les trente derniers jours.
                </p>
              </fieldset>

              {/* --- Le decompte -------------------------------------- */}
              <dl className="o-mt-5 o-space-y-2 o-border-t o-pt-5 o-text-sm" style={{ borderColor: FILET }}>
                <div className="o-flex o-items-baseline o-justify-between o-gap-4">
                  <dt className="o-text-zinc-400">
                    Commission {type.role === 'apporteur' ? 'apporteur' : 'preneur'} — {taux(commission)}
                  </dt>
                  <dd className="o-font-semibold o-tabular-nums o-text-zinc-100">
                    {euros(frais)} €
                  </dd>
                </div>
                <div className="o-flex o-items-baseline o-justify-between o-gap-4">
                  <dt className="o-text-zinc-400">Virement SEPA</dt>
                  <dd className="o-font-semibold o-tabular-nums o-text-zinc-100">Gratuit</dd>
                </div>
                <div className="o-flex o-items-baseline o-justify-between o-gap-4">
                  <dt className="o-text-zinc-400">Prix de reference retenu</dt>
                  <dd className="o-font-semibold o-tabular-nums o-text-zinc-100">
                    {prix(reference)} €
                  </dd>
                </div>
                <div className="o-flex o-items-baseline o-justify-between o-gap-4">
                  <dt className="o-text-zinc-400">Vous recevez, si l ordre est servi</dt>
                  <dd className="o-font-semibold o-tabular-nums" style={{ color: encre() }}>
                    {recu.toLocaleString('fr-FR', {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })}{' '}
                    {paire.code}
                  </dd>
                </div>
              </dl>

              <a
                href="#ouvrir"
                className="o-mt-6 o-flex o-w-full o-items-center o-justify-center o-gap-2 o-rounded-xl o-px-5 o-py-3.5 o-text-sm o-font-semibold o-no-underline o-transition-colors focus:o-ring"
                style={APLAT}
              >
                Ouvrir un compte et passer cet ordre
                <Icon icon={ArrowRight} size={16} />
              </a>

              <p
                className="o-mt-4 o-flex o-items-start o-gap-2 o-rounded-xl o-border-w-1 o-p-3 o-text-xs o-leading-relaxed o-text-zinc-200"
                style={{ borderColor: FILET_FORT }}
              >
                <Icon icon={TriangleAlert} size={14} className="o-mt-0.5 o-shrink-0" aria-hidden="true" />
                <span>
                  Investir dans les crypto-actifs comporte un risque de perte
                  totale du capital. Ces actifs ne sont ni garantis ni couverts
                  par le fonds de garantie des depots.{' '}
                  <a
                    href="#risque"
                    className="o-underline o-underline-offset-2 focus:o-ring"
                    style={{ color: encre() }}
                  >
                    Lire l avertissement complet
                  </a>
                  .
                </span>
              </p>
            </div>
          </aside>
        </div>

        {/* ----- Sections d information, sous le media -------------------- */}
        <section
          id="marches"
          className="o-border-t o-bg-zinc-900"
          style={{ borderColor: FILET }}
        >
          {/*
            Le bandeau : la signature de mouvement de la page. Les noms des
            paires passent en grand, a contresens du ticker de l affiche —
            deux vitesses, deux sens, une seule salle de marche.
          */}
          <div aria-hidden="true" className="o-overflow-hidden o-border-b o-py-7" style={{ borderColor: FILET }}>
            <Bandeau
              mots={PAIRES.map((p) => p.nom)}
              separateur="◆"
              vitesse={36}
              inverse
              className="o-text-zinc-50"
              taille="clamp(2.25rem, 6vw, 6rem)"
              style={{ fontFamily: 'var(--o-vitrine-affichage)', fontWeight: 300, letterSpacing: '-0.03em' }}
            />
          </div>

          <div className="o-mx-auto o-max-w-7xl o-px-4 o-py-16 md:o-px-6 md:o-py-24">
            <Titre
              surtitre="Marches"
              texte="Six des deux cent quatorze paires cotees. Le cours affiche est celui du carnet, pas une moyenne differee."
            >
              Ce qui se traite en ce moment.
            </Titre>

            {/* `o-relative` n est pas decoratif : les libelles `o-sr-only` sont
                positionnes en absolu, et sans bloc conteneur ici ils se
                poseraient par rapport a la page — la page entiere defilerait
                alors de cote sur un telephone, pour un element d un pixel. */}
            <div
              className="o-relative o-mt-10 o-overflow-x-auto o-rounded-2xl o-border-w-1"
              style={{ borderColor: FILET }}
            >
              <table className="o-w-full o-min-w-full o-text-left o-text-sm">
                <caption className="o-sr-only">
                  Cours des six paires principales, mis a jour en continu
                </caption>
                <thead>
                  <tr className="o-border-b" style={{ borderColor: FILET }}>
                    {['Paire', 'Cours', 'Sur 24 h', 'Volume 24 h', ''].map((entete, index) => (
                      <th
                        key={entete === '' ? 'action' : entete}
                        scope="col"
                        className={[
                          'o-px-4 o-py-3 o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400',
                          index >= 2 ? 'o-text-right' : '',
                        ].join(' ')}
                      >
                        {entete === '' ? <span className="o-sr-only">Action</span> : entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAIRES.map((p) => {
                    const v = variation(p, battement)
                    const monte = v >= 0
                    return (
                      <tr key={p.code} className="o-border-b" style={{ borderColor: FILET }}>
                        <th scope="row" className="o-px-4 o-py-4 o-font-normal">
                          <span className="o-flex o-items-center o-gap-3">
                            <span
                              className="o-inline-flex o-size-8 o-shrink-0 o-items-center o-justify-center o-rounded-full o-text-xs o-font-bold"
                              style={APLAT}
                              aria-hidden="true"
                            >
                              {p.code.slice(0, 2)}
                            </span>
                            <span>
                              <span className="o-block o-font-semibold o-text-zinc-50">{p.code}</span>
                              <span className="o-block o-text-xs o-text-zinc-400">{p.nom}</span>
                            </span>
                          </span>
                        </th>
                        <td className="o-px-4 o-py-4 o-tabular-nums o-font-semibold o-text-zinc-50">
                          {prix(cours(p, battement))} €
                        </td>
                        <td
                          className="o-px-4 o-py-4 o-text-right o-tabular-nums o-font-semibold"
                          style={{ color: monte ? encre() : 'var(--o-palette-zinc-300)' }}
                        >
                          <span className="o-inline-flex o-items-center o-gap-1">
                            <Icon
                              icon={monte ? ArrowUpRight : ArrowDownRight}
                              size={14}
                              aria-hidden="true"
                            />
                            {(monte ? '+' : '') + v.toFixed(2).replace('.', ',')} %
                          </span>
                        </td>
                        <td className="o-px-4 o-py-4 o-text-right o-tabular-nums o-text-zinc-400">
                          {p.volume}
                        </td>
                        <td className="o-px-4 o-py-4 o-text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setPaireActive(p.code)
                            }}
                            className="o-rounded-full o-border-w-1 o-px-3 o-py-1.5 o-text-xs o-font-semibold o-text-zinc-100 o-cursor-pointer hover:o-text-zinc-50 o-transition-colors focus:o-ring"
                            style={{ borderColor: FILET_FORT }}
                          >
                            Ouvrir la fiche
                            <span className="o-sr-only"> de la paire {p.nom}</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="o-mt-4 o-text-xs o-text-zinc-400">
              Cours indicatifs a titre de demonstration. Les crypto-actifs ne sont
              ni garantis ni reglementes comme un depot bancaire.
            </p>
          </div>
        </section>

        <section id="frais" className="o-border-t o-bg-zinc-950" style={{ borderColor: FILET }}>
          <div className="o-mx-auto o-max-w-7xl o-px-4 o-py-16 md:o-px-6 md:o-py-24">
            <Titre
              surtitre="Frais"
              texte="Un « zero commission » se paie dans l ecart entre l achat et la vente. Voici les deux chiffres cote a cote."
            >
              Ce que coute reellement un ordre.
            </Titre>

            {/* La grille par palier, qui est celle que le panneau applique. */}
            <div
              className="o-relative o-mt-10 o-overflow-x-auto o-rounded-2xl o-border-w-1"
              style={{ borderColor: FILET }}
            >
              <table className="o-w-full o-min-w-full o-text-left o-text-sm">
                <caption className="o-border-b o-px-4 o-py-3 o-text-left o-text-xs o-uppercase o-tracking-widest o-text-zinc-400" style={{ borderColor: FILET }}>
                  Grille de commission par palier de volume, au 1er janvier 2026
                </caption>
                <thead>
                  <tr className="o-border-b" style={{ borderColor: FILET }}>
                    {['Volume echange sur 30 jours', 'Apporteur', 'Preneur', 'Sur un ordre de 1 000 €'].map(
                      (entete, index) => (
                        <th
                          key={entete}
                          scope="col"
                          className={[
                            'o-px-4 o-py-3 o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400',
                            index > 0 ? 'o-text-right' : '',
                          ].join(' ')}
                        >
                          {entete}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {PALIERS.map((p) => (
                    <tr
                      key={p.cle}
                      className="o-border-b"
                      style={{
                        borderColor: FILET,
                        backgroundColor: p.cle === palier ? accentDoux(500, 14) : undefined,
                      }}
                    >
                      <th scope="row" className="o-px-4 o-py-3 o-font-normal o-text-zinc-100">
                        {p.libelle}
                        {p.cle === palier ? (
                          <span className="o-sr-only"> — palier choisi dans le panneau</span>
                        ) : null}
                      </th>
                      <td className="o-px-4 o-py-3 o-text-right o-tabular-nums o-text-zinc-300">
                        {taux(p.apporteur)}
                      </td>
                      <td className="o-px-4 o-py-3 o-text-right o-tabular-nums o-text-zinc-300">
                        {taux(p.preneur)}
                      </td>
                      <td className="o-px-4 o-py-3 o-text-right o-tabular-nums o-font-semibold o-text-zinc-50">
                        {euros(1000 * p.apporteur)} € a {euros(1000 * p.preneur)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/*
              Le tableau defile dans sa propre zone, mais les libelles caches
              qu il pose en absolu n ont aucun bloc conteneur : sur un telephone
              ils allongent le document entier. Le confinement de peinture
              arrete la, et le retrait d un quart de rem laisse la place a
              l anneau de focus de la zone.
            */}
            <div className="o-mt-10 o-p-1" style={{ contain: 'paint' }}>
              <ComparisonTable
                caption="Frais compares d Orbe et de deux autres places, au 1er janvier 2026"
                columns={COLONNES}
                rows={LIGNES}
                maxHeight={520}
                yesLabel="Compris"
                noLabel="Aucun"
              />
            </div>
          </div>
        </section>

        {/* ----- Preuve de reserves ---------------------------------------- */}
        <section id="reserves" className="o-border-t o-bg-zinc-900" style={{ borderColor: FILET }}>
          <div className="o-mx-auto o-max-w-7xl o-px-4 o-py-16 md:o-px-6 md:o-py-24">
            <Titre
              surtitre="Preuve de reserves"
              texte="Une place qui garde les fonds d autrui doit montrer ce qu elle detient face a ce qu elle doit. Le rapport est publie le premier de chaque mois, et verifiable ligne a ligne."
            >
              Ce que nous detenons, ce que nous devons.
            </Titre>

            <div className="o-mt-10 o-grid o-gap-8 lg:o-grid-cols-5">
              <div
                className="o-relative o-overflow-x-auto o-rounded-2xl o-border-w-1 lg:o-col-span-3"
                style={{ borderColor: FILET }}
              >
                <table className="o-w-full o-min-w-full o-text-left o-text-sm">
                  <caption className="o-sr-only">
                    Reserves detenues et engagements clients au 1er septembre 2026
                  </caption>
                  <thead>
                    <tr className="o-border-b" style={{ borderColor: FILET }}>
                      {['Actif', 'Detenu', 'Du aux clients', 'Ratio'].map((entete, index) => (
                        <th
                          key={entete}
                          scope="col"
                          className={[
                            'o-px-4 o-py-3 o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400',
                            index > 0 ? 'o-text-right' : '',
                          ].join(' ')}
                        >
                          {entete}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RESERVES.map((r) => (
                      <tr key={r.actif} className="o-border-b" style={{ borderColor: FILET }}>
                        <th scope="row" className="o-px-4 o-py-3 o-font-semibold o-text-zinc-50">
                          {r.actif}
                        </th>
                        <td className="o-px-4 o-py-3 o-text-right o-tabular-nums o-text-zinc-300">
                          {r.detenu}
                        </td>
                        <td className="o-px-4 o-py-3 o-text-right o-tabular-nums o-text-zinc-300">
                          {r.du}
                        </td>
                        <td
                          className="o-px-4 o-py-3 o-text-right o-tabular-nums o-font-semibold"
                          style={{ color: encre() }}
                        >
                          {r.ratio.toFixed(1).replace('.', ',')} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl className="lg:o-col-span-2">
                {PREUVE.map(([terme, valeurPreuve]) => (
                  <div
                    key={terme}
                    className="o-border-b o-py-3"
                    style={{ borderColor: FILET }}
                  >
                    <dt className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      {terme}
                    </dt>
                    <dd className="o-mt-1 o-text-sm o-text-zinc-100">{valeurPreuve}</dd>
                  </div>
                ))}
                <p className="o-mt-4 o-text-xs o-leading-relaxed o-text-zinc-400">
                  Une preuve de reserves montre l actif a un instant donne. Elle
                  ne dit rien des dettes contractees ailleurs : c est pourquoi la
                  ligne des passifs hors clients y figure, attestee par le
                  cabinet.
                </p>
              </dl>
            </div>
          </div>
        </section>

        <section id="coffre" className="o-border-t o-bg-zinc-950" style={{ borderColor: FILET }}>
          <div className="o-mx-auto o-max-w-7xl o-px-4 o-py-16 md:o-px-6 md:o-py-24">
            <Titre
              surtitre="Securite"
              texte="Une place d echange qui garde vos fonds doit dire ou ils sont. Les notres sont a trois adresses, et le compte est public."
            >
              Ou dorment les fonds.
            </Titre>

            {/*
              Un seul panneau, pas trois cartes egales : les trois lignes du
              coffre se lisent l une sous l autre, avec leur rang en grand a
              gauche — un registre, ce qu est un coffre.
            */}
            <ReflectiveCard
              shine={0.16}
              brush={0.08}
              className="o-mt-12 o-overflow-hidden o-rounded-2xl o-border-w-1 o-bg-zinc-900"
              style={{ borderColor: FILET }}
            >
              <ol className="o-m-0 o-list-none o-p-0">
                {COFFRE.map((c, rang) => (
                  <li
                    key={c.titre}
                    className={`o-grid o-items-baseline o-gap-x-6 o-gap-y-2 o-px-6 o-py-7 md:o-grid-cols-12 md:o-px-8 ${rang > 0 ? 'o-border-t' : ''}`}
                    style={rang > 0 ? { borderColor: FILET } : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className="o-font-bold o-tabular-nums o-tracking-tighter md:o-col-span-2"
                      style={{ fontSize: 'clamp(1.75rem, 3.4vw, 3rem)', lineHeight: 1, color: encre() }}
                    >
                      {String(rang + 1).padStart(2, '0')}
                    </span>
                    <h3 className="o-m-0 o-flex o-items-center o-gap-3 o-text-lg o-font-semibold o-tracking-tight o-text-zinc-50 md:o-col-span-4">
                      <Icon icon={c.icone} size={18} style={{ color: encre() }} aria-hidden="true" />
                      {c.titre}
                    </h3>
                    <p className="o-m-0 o-leading-relaxed o-text-zinc-400 md:o-col-span-6">{c.texte}</p>
                  </li>
                ))}
              </ol>
            </ReflectiveCard>

            <p className="o-mt-8 o-flex o-flex-wrap o-items-center o-gap-2 o-text-sm o-text-zinc-400">
              <Icon icon={ShieldCheck} size={16} aria-hidden="true" />
              Orbe SAS est enregistree comme prestataire de services sur actifs
              numeriques aupres de l AMF sous le numero E2024-118.
            </p>
          </div>
        </section>

        {/* ----- L avertissement de risque, en clair ------------------------ */}
        <section id="risque" className="o-border-t o-bg-zinc-900" style={{ borderColor: FILET }}>
          <div className="o-mx-auto o-max-w-7xl o-px-4 o-py-16 md:o-px-6 md:o-py-24">
            <div className="o-max-w-2xl">
              <p
                className="o-inline-flex o-items-center o-gap-2 o-text-xs o-font-semibold o-uppercase o-tracking-widest"
                style={{ color: encre() }}
              >
                <Icon icon={TriangleAlert} size={14} aria-hidden="true" />
                Avertissement de risque
              </p>
              <h2 className="o-mt-3 o-text-3xl o-font-bold o-tracking-tight md:o-text-4xl o-text-zinc-50">
                Ce que nous ne pouvons pas vous promettre.
              </h2>
              <p className="o-mt-4 o-text-lg o-leading-relaxed o-text-zinc-300">
                Cette page vend un service d execution. Elle n est ni un conseil
                ni une invitation a investir, et ce qui suit n est pas une
                formalite : c est la partie du metier qui coute de l argent aux
                gens quand elle est passee sous silence.
              </p>
            </div>

            <ol className="o-mt-12 o-grid o-list-none o-gap-x-10 o-gap-y-8 o-p-0 md:o-grid-cols-2">
              {RISQUES.map((r, index) => (
                <li
                  key={r.titre}
                  className="o-border-t o-pt-5"
                  style={{ borderColor: FILET_FORT }}
                >
                  <p
                    className="o-font-mono o-text-xs o-font-bold o-tabular-nums"
                    style={{ color: encre() }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="o-mt-2 o-text-lg o-font-semibold o-tracking-tight o-text-zinc-50">
                    {r.titre}
                  </h3>
                  <p className="o-mt-2 o-leading-relaxed o-text-zinc-300">{r.texte}</p>
                </li>
              ))}
            </ol>

            <p
              className="o-mt-12 o-max-w-3xl o-rounded-2xl o-border-w-1 o-p-5 o-text-sm o-leading-relaxed o-text-zinc-200"
              style={{ borderColor: FILET_FORT }}
            >
              Orbe SAS est enregistree aupres de l Autorite des marches financiers
              en qualite de prestataire de services sur actifs numeriques
              (E2024-118). Cet enregistrement porte sur la conservation et
              l echange d actifs numeriques : il ne vaut ni agrement des produits
              echanges, ni garantie de l Etat, ni approbation de leur valeur. Le
              document d information general est remis avant toute premiere
              operation.
            </p>
          </div>
        </section>

        <section
          id="application"
          className="o-border-t o-bg-zinc-950"
          style={{ borderColor: FILET }}
        >
          <div className="o-mx-auto o-grid o-max-w-7xl o-items-center o-gap-12 o-px-4 o-py-16 md:o-px-6 md:o-py-24 lg:o-grid-cols-2">
            <div>
              <Titre
                surtitre="Application"
                texte="Le meme carnet, le meme prix, la meme grille de frais. Rien n est reserve au site."
              >
                La place tient dans la poche.
              </Titre>

              <ul className="o-mt-10 o-list-none o-space-y-6 o-p-0">
                {MOBILE.map((m) => (
                  <li key={m.titre} className="o-flex o-gap-4">
                    <span
                      className="o-inline-flex o-size-10 o-shrink-0 o-items-center o-justify-center o-rounded-xl"
                      style={APLAT}
                      aria-hidden="true"
                    >
                      <Icon icon={m.icone} size={20} />
                    </span>
                    <div>
                      <h3 className="o-text-lg o-font-semibold o-tracking-tight o-text-zinc-50">
                        {m.titre}
                      </h3>
                      <p className="o-mt-1 o-leading-relaxed o-text-zinc-400">{m.texte}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="o-mt-8 o-flex o-flex-wrap o-items-center o-gap-2 o-text-sm o-text-zinc-400">
                <Icon icon={Smartphone} size={16} aria-hidden="true" />
                iOS et Android — 4,6 sur 21 400 avis.
              </p>
            </div>

            <div className="o-relative">
              <div
                className="o-mx-auto o-w-full o-max-w-xs o-overflow-hidden o-rounded-3xl o-border-w-4 o-bg-zinc-900 o-shadow-2xl"
                style={{ borderColor: FILET_FORT }}
              >
                <img
                  src={photo('orbe-ecran-carnet', 720, 1480)}
                  alt="L application Orbe affichant le carnet d ordres de la paire bitcoin contre euro"
                  width={720}
                  height={1480}
                  loading="lazy"
                  className="o-block o-w-full o-h-auto o-object-cover"
                />
              </div>
              <span
                aria-hidden="true"
                className="max-sm:o-hidden o-absolute o-left-0 o-top-12 o-rounded-xl o-border-w-1 o-bg-zinc-950 o-px-4 o-py-3 o-text-sm o-font-semibold o-tabular-nums o-shadow-2xl"
                style={{ borderColor: FILET, color: encre() }}
              >
                <Icon icon={Layers} size={14} className="o-mr-2 o-align-middle" />
                Ordre servi — 0,214 BTC
              </span>
            </div>
          </div>
        </section>

        {/*
          ================================================= L appel — A4

          Une bande pleine largeur en accent, et le texte defile dedans. Ni
          gelule posee au centre d un ecran vide, ni titre de cent vingt
          points : sur une place d echange, ce qui appelle, c est ce qui passe.
        */}
        <section id="ouvrir" aria-labelledby="ouvrir-titre" className="o-border-t" style={{ borderColor: FILET }}>
          <div style={APLAT}>
            <div aria-hidden="true" className="o-overflow-hidden o-py-7">
              <Marquee speed={32} fade={0} pauseOnHover={false}>
                {[0, 1].map((rang) => (
                  <span
                    key={rang}
                    className="o-flex o-shrink-0 o-items-center o-gap-6 o-px-6 o-whitespace-nowrap"
                    style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}
                  >
                    <span>Ouvrir un compte</span>
                    <Icon icon={ArrowUpRight} size={26} />
                    <span>Verification en six minutes</span>
                    <Icon icon={ArrowUpRight} size={26} />
                    <span>Premier virement SEPA gratuit</span>
                    <Icon icon={ArrowUpRight} size={26} />
                    <span>Retrait des la premiere heure</span>
                    <Icon icon={ArrowUpRight} size={26} />
                  </span>
                ))}
              </Marquee>
            </div>

            <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-center o-justify-between o-gap-4 o-px-4 o-pb-8 md:o-px-6">
              <h2 id="ouvrir-titre" className="o-m-0 o-max-w-md o-text-base o-font-semibold o-tracking-tight">
                Le compte s ouvre pendant que le marche tourne.
              </h2>
              <a
                href="#fiche"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-5 o-py-2.5 o-text-sm o-font-semibold o-no-underline focus:o-ring"
                /* Un lien ne prend pas l encre de son parent : la feuille de la
                   documentation lui en donne une. Sur cette bande en accent,
                   c est le fond de la page qui doit servir d encre. */
                style={{ color: 'var(--o-theme-bg)', borderColor: 'currentcolor' }}
              >
                Ouvrir un compte
                <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <p className="o-mx-auto o-max-w-3xl o-px-4 o-py-7 o-text-center o-text-xs o-leading-relaxed o-text-zinc-400 md:o-px-6">
            Investir dans les crypto-actifs comporte un risque de perte totale du
            capital. Orbe ne fournit ni conseil ni recommandation.
          </p>
        </section>
      </main>

      {/*
        =================================================== Le pied — P8

        Un bandeau de mots qui defilent, puis une seule ligne de mentions. Pas
        de plan du site en quatre colonnes : tout ce que la page contient tient
        deja dans la barre du haut, et une place d echange se quitte sur le nom
        des actifs, pas sur un annuaire.
      */}
      <footer className="o-border-t o-bg-zinc-950" style={{ borderColor: FILET }}>
        <div aria-hidden="true" className="o-overflow-hidden o-py-10">
          <Bandeau
            mots={['Orbe', ...PAIRES.map((p) => p.code)]}
            separateur="·"
            vitesse={28}
            className="o-text-zinc-50"
            taille="clamp(3rem, 12vw, 11rem)"
            style={{ fontFamily: 'var(--o-vitrine-affichage)', fontWeight: 800, letterSpacing: '-0.05em' }}
          />
        </div>

        <div
          className="o-mx-auto o-max-w-7xl o-border-t o-px-4 o-py-7 md:o-px-6"
          style={{ borderColor: FILET }}
        >
          <p className="o-m-0 o-max-w-4xl o-text-xs o-leading-relaxed o-text-zinc-400">
            <span className="o-inline-flex o-items-center o-gap-2 o-font-semibold o-text-zinc-50">
              <Icon icon={Globe} size={14} style={{ color: encre() }} aria-hidden="true" />
              Orbe SAS
            </span>{' '}
            — prestataire de services sur actifs numeriques enregistre a l AMF
            sous le numero E2024-118, 9 rue de la Bourse, 75002 Paris. Investir
            dans les crypto-actifs presente un risque de perte totale du
            capital ; les performances passees ne prejugent pas des performances
            futures ; Orbe ne fournit ni conseil ni recommandation.
          </p>
          <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-wrap o-items-center o-gap-x-6 o-gap-y-2 o-p-0 o-text-xs o-text-zinc-400">
            <li>© 2026 Orbe</li>
            {[
              ['#marches', 'Toutes les paires'],
              ['#frais', 'Grille de frais'],
              ['#reserves', 'Preuve de reserves'],
              ['#risque', 'Avertissement de risque'],
              ['#fiche', 'Mentions legales'],
              ['#fiche', 'Donnees personnelles'],
              ['#fiche', 'Accessibilite : partiellement conforme'],
            ].map(([cible, mot]) => (
              <li key={mot}>
                <a
                  href={cible}
                  className="o-no-underline o-text-zinc-400 hover:o-text-zinc-200 focus:o-ring"
                >
                  {mot}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
    </Porte>
  )
}
