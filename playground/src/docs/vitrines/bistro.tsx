/**
 * Maison Perrin — bistrot de quartier.
 *
 * ## L architecture : la carte est le milieu de la page
 *
 * Landing page complete dont le **coeur est une carte imprimee**, et c est ce
 * qui n appartient qu a elle : les plats en lignes tarifees sur deux colonnes,
 * les points de conduite entre le plat et son prix, l ardoise du jour sur son
 * fond d ardoise. Un bistrot ne se presente pas, il donne sa carte — mais il
 * faut d abord donner envie d entrer.
 *
 * L enchainement :
 *
 * - **ouverture** : la salle en plein cadre, l etat du service en tableau a
 *   palettes — c est l horloge du visiteur qui le dit, pas une phrase ecrite
 *   d avance ;
 * - **la maison** en trois images : le comptoir, la cuisine, la terrasse ;
 * - **la carte** en lignes tarifees, groupees par service ;
 * - **l ardoise** du jour, qui suit le service courant ;
 * - **les heures** en tableau, la ligne du jour marquee ;
 * - **la reservation** avec les creneaux reels, puis le pied de carte.
 *
 * ## Le fond
 *
 * Les hachures tiennent l ardoise, et rien d autre. Une carte de restaurant n a
 * pas de fond anime : elle a du papier.
 *
 * @module
 */

import { Crosshatch } from '@/odoro/background/Crosshatch.jsx'
import { SplitFlap } from '@/odoro/text/SplitFlap.jsx'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, Check, ChefHat, Clock } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { Input, Select } from '@odoro-cli/libs/ui'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  verre,
} from './marche.jsx'
import { Aimant, Bandeau, Devoile, Parallaxe, ZoomDefile } from './scene.jsx'

import { nuit, Voile } from './communs.jsx'
import { photo } from './media.js'

/* ============================ Le calendrier ============================ */

/** Les jours, dans l ordre de `Date.getDay`. */
const JOURS = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const

/** Les mois, sans accent, comme tout le reste de la page. */
const MOIS = [
  'janvier',
  'fevrier',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'aout',
  'septembre',
  'octobre',
  'novembre',
  'decembre',
] as const

/** Une plage de service, en minutes depuis minuit. */
interface Plage {
  readonly cle: 'midi' | 'soir'
  readonly ouverture: number
  readonly fermeture: number
}

/** Une heure, en minutes depuis minuit. */
function minutes(heure: number, minute: number): number {
  return heure * 60 + minute
}

/** Une heure lisible : 870 devient « 14h30 ». */
function heureLisible(valeur: number): string {
  const h = Math.floor(valeur / 60)
  const m = valeur % 60
  return `${String(h)}h${String(m).padStart(2, '0')}`
}

/**
 * La semaine du bistrot, indexee comme `Date.getDay`.
 *
 * Le lundi est vide : c est le jour du marche, et un jour ferme dit autant
 * d une maison qu un jour ouvert.
 */
const SEMAINE: readonly (readonly Plage[])[] = [
  // Dimanche : midi seulement.
  [{ cle: 'midi', ouverture: minutes(12, 0), fermeture: minutes(15, 0) }],
  // Lundi : ferme.
  [],
  // Mardi a vendredi : deux services.
  [
    { cle: 'midi', ouverture: minutes(12, 0), fermeture: minutes(14, 30) },
    { cle: 'soir', ouverture: minutes(19, 0), fermeture: minutes(22, 30) },
  ],
  [
    { cle: 'midi', ouverture: minutes(12, 0), fermeture: minutes(14, 30) },
    { cle: 'soir', ouverture: minutes(19, 0), fermeture: minutes(22, 30) },
  ],
  [
    { cle: 'midi', ouverture: minutes(12, 0), fermeture: minutes(14, 30) },
    { cle: 'soir', ouverture: minutes(19, 0), fermeture: minutes(22, 30) },
  ],
  [
    { cle: 'midi', ouverture: minutes(12, 0), fermeture: minutes(14, 30) },
    { cle: 'soir', ouverture: minutes(19, 0), fermeture: minutes(22, 30) },
  ],
  // Samedi : midi long et soir long.
  [
    { cle: 'midi', ouverture: minutes(12, 0), fermeture: minutes(15, 0) },
    { cle: 'soir', ouverture: minutes(19, 0), fermeture: minutes(23, 0) },
  ],
]

/** L etat de la maison a un instant donne. */
interface Etat {
  readonly ouvert: boolean
  readonly titre: string
  readonly detail: string
}

/**
 * Ouvert, ou pas, et jusqu a quand.
 *
 * C est la premiere chose qu un visiteur cherche sur le site d un restaurant,
 * et la seule qu une capture d ecran ne peut pas donner. La cuisine ferme
 * trente minutes avant la salle : l etat le dit au lieu de le cacher dans une
 * note de bas de page.
 */
function etatMaintenant(maintenant: Date): Etat {
  const jour = maintenant.getDay()
  const heure = maintenant.getHours() * 60 + maintenant.getMinutes()
  const plages = SEMAINE[jour] ?? []

  for (const plage of plages) {
    if (heure >= plage.ouverture && heure < plage.fermeture) {
      const reste = plage.fermeture - heure
      const cuisine = plage.fermeture - 30
      return {
        ouvert: true,
        titre: heure >= cuisine ? 'Ouvert, cuisine fermee' : 'Ouvert maintenant',
        detail:
          heure >= cuisine
            ? `La salle ferme dans ${String(reste)} min, le comptoir sert encore.`
            : `Service du ${plage.cle} jusqu a ${heureLisible(plage.fermeture)}, dernieres commandes a ${heureLisible(cuisine)}.`,
      }
    }
  }

  const prochaine = plages.find((plage) => heure < plage.ouverture)
  if (prochaine !== undefined) {
    return {
      ouvert: false,
      titre: 'Ferme pour le moment',
      detail: `Le service du ${prochaine.cle} ouvre a ${heureLisible(prochaine.ouverture)}.`,
    }
  }

  for (let pas = 1; pas <= 7; pas += 1) {
    const suivant = (jour + pas) % 7
    const premiere = (SEMAINE[suivant] ?? [])[0]
    if (premiere !== undefined) {
      const nom = pas === 1 ? 'demain' : JOURS[suivant]
      return {
        ouvert: false,
        titre: 'Ferme pour le moment',
        detail: `Ouverture ${String(nom)} a ${heureLisible(premiere.ouverture)}.`,
      }
    }
  }

  return { ouvert: false, titre: 'Ferme', detail: 'Appelez le 01 45 22 07 18.' }
}

/** Une date au format du champ `date` du navigateur. */
function enISO(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${String(date.getFullYear())}-${mois}-${jour}`
}

/** Une date lisible : « mardi 15 septembre ». */
function dateLisible(date: Date): string {
  return `${JOURS[date.getDay()] ?? ''} ${String(date.getDate())} ${MOIS[date.getMonth()] ?? ''}`
}

/** La date d un champ `date`, prise a midi pour ignorer les fuseaux. */
function depuisISO(valeur: string): Date {
  const [an, mois, jour] = valeur.split('-').map(Number)
  return new Date(an ?? 2026, (mois ?? 1) - 1, jour ?? 1, 12, 0, 0)
}

/** La semaine de la carte : du lundi au dimanche qui entourent la date. */
function semaineDeLaCarte(maintenant: Date): string {
  const lundi = new Date(maintenant)
  const decalage = (maintenant.getDay() + 6) % 7
  lundi.setDate(maintenant.getDate() - decalage)
  const dimanche = new Date(lundi)
  dimanche.setDate(lundi.getDate() + 6)

  const finMois = MOIS[dimanche.getMonth()] ?? ''
  if (lundi.getMonth() === dimanche.getMonth()) {
    return `Carte du ${String(lundi.getDate())} au ${String(dimanche.getDate())} ${finMois}`
  }
  const debutMois = MOIS[lundi.getMonth()] ?? ''
  return `Carte du ${String(lundi.getDate())} ${debutMois} au ${String(dimanche.getDate())} ${finMois}`
}

/* ============================== L ardoise ============================== */

/** Un plat de l ardoise, avec ce qu un restaurant doit dire de lui. */
interface Plat {
  readonly nom: string
  readonly detail: string
  readonly prix: number
  /** D ou vient le produit qui donne son nom au plat. */
  readonly origine: string
  /** Les allergenes de la liste des quatorze, en clair. */
  readonly allergenes: readonly string[]
  /** Sans viande ni poisson. */
  readonly vegetarien?: boolean
  /** Faux uniquement pour ce qui n est pas fait sur place. */
  readonly maison?: false
}

/** Un service, avec sa formule et ses trois colonnes. */
interface Service {
  readonly cle: 'midi' | 'soir'
  readonly libelle: string
  readonly horaire: string
  readonly formule: string
  readonly note: string
  readonly entrees: readonly Plat[]
  readonly plats: readonly Plat[]
  readonly desserts: readonly Plat[]
}

/** Les deux services, et leurs deux cartes. */
const SERVICES: readonly Service[] = [
  {
    cle: 'midi',
    libelle: 'Le midi',
    horaire: '12h00 - 14h30, du mardi au vendredi',
    formule: 'Menu du marche 26 EUR — entree et plat, ou plat et dessert',
    note: 'Le midi va vite : trois entrees, trois plats, deux desserts, et le cafe compris dans le menu. Servi jusqu a 14h00.',
    entrees: [
      {
        nom: 'Veloute de potimarron',
        detail: 'creme de sarrasin grille, huile de courge',
        prix: 8,
        origine: 'Potimarron — ferme des Trois Chenes, Chevreuse (78)',
        allergenes: ['lait', 'gluten'],
        vegetarien: true,
      },
      {
        nom: 'Poireaux vinaigrette',
        detail: 'oeuf mimosa, noisette torrefiee',
        prix: 9,
        origine: 'Poireaux — carreau des producteurs, Rungis',
        allergenes: ['oeuf', 'moutarde', 'fruits a coque'],
        vegetarien: true,
      },
      {
        nom: 'Terrine de campagne',
        detail: 'cornichons de Chantecler, pain grille',
        prix: 10,
        origine: 'Porc noir de Bigorre — elevage Lassalle, Hautes-Pyrenees',
        allergenes: ['sulfites', 'gluten'],
      },
    ],
    plats: [
      {
        nom: 'Merlan frit, sauce tartare',
        detail: 'pommes grenailles a la peau',
        prix: 22,
        origine: 'Merlan de ligne — criee de Boulogne-sur-Mer, peche du jour',
        allergenes: ['poisson', 'oeuf', 'gluten', 'moutarde'],
      },
      {
        nom: 'Blanquette de veau a l ancienne',
        detail: 'riz de Camargue, champignons de Paris',
        prix: 23,
        origine: 'Veau du Limousin — boucherie Nivelle, Paris 11e',
        allergenes: ['lait', 'celeri', 'sulfites'],
      },
      {
        nom: 'Risotto de petit epeautre',
        detail: 'courge, sauge, parmesan 24 mois',
        prix: 19,
        origine: 'Epeautre — moulin Pichard, Haute-Provence',
        allergenes: ['lait', 'gluten', 'sulfites'],
        vegetarien: true,
      },
    ],
    desserts: [
      {
        nom: 'Riz au lait, caramel sale',
        detail: 'la portion se partage mal',
        prix: 8,
        origine: 'Lait cru — ferme de Viltain, Jouy-en-Josas (78)',
        allergenes: ['lait'],
        vegetarien: true,
      },
      {
        nom: 'Faisselle, miel de chataignier',
        detail: 'et un tour de moulin a poivre',
        prix: 7,
        origine: 'Miel — rucher de la Brenne, Indre',
        allergenes: ['lait'],
        vegetarien: true,
      },
    ],
  },
  {
    cle: 'soir',
    libelle: 'Le soir',
    horaire: '19h00 - 22h30, jusqu a 23h00 le samedi',
    formule: 'A la carte — entree et plat 34 EUR, les trois 42 EUR',
    note: 'Le soir la cuisine prend le temps : deux plats de plus, les abats du jeudi, et la cave ouverte au verre jusqu a la fermeture.',
    entrees: [
      {
        nom: 'Oeuf mollet, creme de cresson',
        detail: 'lard fume, croutons a la graisse de canard',
        prix: 11,
        origine: 'Cresson de fontaine — Mereville, Essonne',
        allergenes: ['oeuf', 'lait', 'gluten'],
      },
      {
        nom: 'Tartare de boeuf au couteau',
        detail: 'condiment cornichon, jaune confit',
        prix: 14,
        origine: 'Boeuf normand, 40 jours de maturation — boucherie Nivelle',
        allergenes: ['oeuf', 'moutarde', 'sulfites'],
      },
      {
        nom: 'Saint-Jacques snackees',
        detail: 'beurre noisette, topinambour rape',
        prix: 16,
        origine: 'Saint-Jacques de la baie de Seine — drague artisanale, Port-en-Bessin',
        allergenes: ['mollusques', 'lait'],
      },
    ],
    plats: [
      {
        nom: 'Joue de boeuf braisee',
        detail: 'carottes fanes, jus au vin de Chinon',
        prix: 26,
        origine: 'Boeuf normand — boucherie Nivelle, Paris 11e',
        allergenes: ['celeri', 'sulfites'],
      },
      {
        nom: 'Ris de veau, mousseline de celeri',
        detail: 'le jeudi seulement, six portions',
        prix: 34,
        origine: 'Ris de veau du Limousin — triperie Gauthier, Rungis',
        allergenes: ['lait', 'celeri', 'gluten'],
      },
      {
        nom: 'Cabillaud, beurre blanc',
        detail: 'poireaux fondus, citron confit',
        prix: 28,
        origine: 'Cabillaud de ligne — criee de Boulogne-sur-Mer',
        allergenes: ['poisson', 'lait', 'sulfites'],
      },
      {
        nom: 'Risotto de petit epeautre',
        detail: 'courge, sauge, parmesan 24 mois',
        prix: 21,
        origine: 'Epeautre — moulin Pichard, Haute-Provence',
        allergenes: ['lait', 'gluten', 'sulfites'],
        vegetarien: true,
      },
    ],
    desserts: [
      {
        nom: 'Tarte fine aux pommes',
        detail: 'creme crue de Normandie, a la commande',
        prix: 10,
        origine: 'Pommes reine des reinettes — verger Doucet, Eure',
        allergenes: ['gluten', 'lait', 'oeuf'],
        vegetarien: true,
      },
      {
        nom: 'Paris-Brest',
        detail: 'praline maison, noisettes du Piemont',
        prix: 11,
        origine: 'Noisettes — Piemont, torrefiees ici le matin',
        allergenes: ['gluten', 'lait', 'oeuf', 'fruits a coque'],
        vegetarien: true,
      },
      {
        nom: 'Glace vanille, sauce chocolat',
        detail: 'la glace vient de chez Berthillon, la sauce est d ici',
        prix: 9,
        origine: 'Glace — maison Berthillon, Paris 4e',
        allergenes: ['lait', 'oeuf', 'soja'],
        vegetarien: true,
        maison: false,
      },
    ],
  },
]

/* ============================ La reservation =========================== */

/** Les creneaux proposes, par service. */
const CRENEAUX: Readonly<Record<'midi' | 'soir', readonly string[]>> = {
  midi: ['12h00', '12h30', '13h00', '13h30', '14h00'],
  soir: ['19h00', '19h30', '20h00', '20h30', '21h00', '21h30', '22h00'],
}

/** Somme stable d une chaine : la disponibilite ne doit pas sautiller. */
function empreinte(valeur: string): number {
  let somme = 7
  for (let i = 0; i < valeur.length; i += 1)
    somme = (somme * 31 + valeur.charCodeAt(i)) % 9973
  return somme
}

/**
 * Les tables encore libres a un creneau.
 *
 * Une vitrine n a pas de livre de reservation, mais elle ne doit pas mentir sur
 * la forme : le samedi soir est tendu, le mardi midi est vide, une grande
 * tablee mange deux places. La valeur est tiree d une somme stable, donc elle
 * ne change pas entre deux rendus — un chiffre qui sautille serait pire qu un
 * chiffre invente.
 */
function tablesLibres(
  dateISO: string,
  service: 'midi' | 'soir',
  creneau: string,
  couverts: number,
): number {
  const jour = depuisISO(dateISO).getDay()
  const brut = empreinte(`${dateISO}|${service}|${creneau}`) % 6
  const tendu = service === 'soir' && (jour === 5 || jour === 6) ? 2 : 0
  const grande = couverts >= 6 ? 2 : couverts >= 4 ? 1 : 0
  return Math.max(0, brut - tendu - grande)
}

/* ============================ Le rendu ============================ */

/**
 * Une ligne de carte.
 *
 * Le nom, les points de conduite, le prix. Les points ne sont pas decoratifs :
 * ils sont ce qui permet a l oeil de suivre la ligne jusqu au chiffre, et c est
 * pour cela qu ils existent sur toutes les cartes imprimees.
 */
function LigneCarte({ plat }: { readonly plat: Plat }): ReactElement {
  return (
    <li className="o-py-2.5">
      <p className="o-m-0 o-flex o-items-baseline o-gap-2">
        <span className="o-font-medium">{plat.nom}</span>
        {plat.vegetarien === true && (
          <span
            className="o-shrink-0 o-rounded-full o-px-1.5 o-text-xs o-font-semibold"
            style={{ backgroundColor: accentDoux(500, 18), color: encre() }}
            title="Sans viande ni poisson"
          >
            v
          </span>
        )}
        <span
          aria-hidden="true"
          className="o-grow o-self-end o-border-b o-border-dotted o-border-stone-400 dark:o-border-stone-600"
          style={{ marginBottom: '0.35em' }}
        />
        <span className="o-shrink-0 o-tabular-nums o-font-medium">{plat.prix} EUR</span>
      </p>
      <p className="o-m-0 o-mt-0.5 o-text-sm o-text-stone-600 dark:o-text-stone-400">
        {plat.detail}
      </p>
      <p className="o-m-0 o-mt-1 o-text-xs o-text-stone-500 dark:o-text-stone-400">
        {plat.origine}
        {plat.allergenes.length > 0 && (
          <span> — allergenes : {plat.allergenes.join(', ')}</span>
        )}
        {plat.maison === false && <span> — non prepare sur place</span>}
      </p>
    </li>
  )
}

/** Une colonne de la carte : un intitule, un filet, des lignes. */
function ColonneCarte({
  titre,
  plats,
}: {
  readonly titre: string
  readonly plats: readonly Plat[]
}): ReactElement {
  return (
    <div>
      <h3
        className="o-border-b o-border-stone-900 dark:o-border-stone-100 o-pb-1.5 o-text-xs o-uppercase o-tracking-widest"
        style={{ color: encre() }}
      >
        {titre}
      </h3>
      <ul className="o-list-none o-m-0 o-mt-2 o-p-0">
        {plats.map((plat) => (
          <LigneCarte key={plat.nom} plat={plat} />
        ))}
      </ul>
    </div>
  )
}

/** La vitrine complete : la carte de la maison. */
export default function Page(): ReactElement {
  const polices = usePolices('fraunces')
  // L horloge du visiteur, rafraichie chaque minute : c est elle qui dit si la
  // maison est ouverte, et elle seule.
  const [maintenant, setMaintenant] = useState(() => new Date())
  useEffect(() => {
    const minuterie = window.setInterval(() => {
      setMaintenant(new Date())
    }, 60_000)
    return () => {
      window.clearInterval(minuterie)
    }
  }, [])

  const etat = useMemo(() => etatMaintenant(maintenant), [maintenant])
  const jourCourant = maintenant.getDay()

  // Le service montre suit l heure a l ouverture, puis obeit au visiteur.
  const [service, setService] = useState<'midi' | 'soir'>(() =>
    new Date().getHours() >= 15 ? 'soir' : 'midi',
  )
  const carte = SERVICES.find((item) => item.cle === service) ?? SERVICES[0]

  // La reservation : le prochain jour ouvert a partir d aujourd hui.
  const [dateChoisie, setDateChoisie] = useState(() => {
    const depart = new Date()
    for (let pas = 0; pas < 8; pas += 1) {
      const essai = new Date(depart)
      essai.setDate(depart.getDate() + pas)
      if ((SEMAINE[essai.getDay()] ?? []).length > 0) return enISO(essai)
    }
    return enISO(depart)
  })
  const [serviceReserve, setServiceReserve] = useState<'midi' | 'soir'>('soir')
  const [couverts, setCouverts] = useState(2)
  const [creneau, setCreneau] = useState<string | null>(null)

  const jourReserve = depuisISO(dateChoisie)
  const plagesDuJour = SEMAINE[jourReserve.getDay()] ?? []
  const plageDemandee = plagesDuJour.find((plage) => plage.cle === serviceReserve)

  const creneaux = useMemo(() => {
    if (plageDemandee === undefined) return []
    return (CRENEAUX[serviceReserve] ?? []).map((heure) => ({
      heure,
      tables: tablesLibres(dateChoisie, serviceReserve, heure, couverts),
    }))
  }, [dateChoisie, serviceReserve, couverts, plageDemandee])

  const retenu = creneaux.find((item) => item.heure === creneau)

  if (carte === undefined) return <div />

  return (
    <Porte forme="trou" marque="Maison Perrin">
      <div
        className="o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-900 dark:o-text-stone-100"
        style={polices}
      >
        {/* ================= 1. L ouverture ============================== */}
        <ZoomDefile
          de={1.12}
          assombrir={0.45}
          className="o-min-h-screen"
          style={nuit('stone')}
          fond={
            <>
              <img
                src={photo('perrin-salle', 1800, 1000)}
                alt=""
                aria-hidden="true"
                className="o-absolute o-inset-0 o-z-0 o-size-full o-object-cover"
              />
              <Voile sens="haut-bas" famille="stone" />
              <Grain />
            </>
          }
        >
          <BarreFilet
            marque="Maison Perrin"
            liens={[
              ['#carte', 'La carte'],
              ['#ardoise', 'L ardoise'],
              ['#reserver', 'Reserver'],
            ]}
            action={['#reserver', 'Reserver une table']}
          />

          <div className="o-relative o-z-20 o-mx-auto o-flex o-min-h-screen o-max-w-6xl o-flex-col o-justify-end o-px-6 o-pb-16 o-pt-24">
            <Surgit>
              <Etiquette>Bistrot — Paris 11e — depuis 1998</Etiquette>
            </Surgit>
            <TitreVague
              delai={100}
              className="o-m-0 o-mt-6 o-max-w-4xl o-text-stone-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 6.5vw, 7rem)' }}
            >
              Trente couverts, une ardoise, et personne pour vous presser.
            </TitreVague>

            <div className="o-mt-10 o-grid o-items-end o-gap-8 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-7">
                <Surgit
                  delai={420}
                  as="p"
                  aria-live="polite"
                  className="o-m-0 o-flex o-w-fit o-max-w-full o-flex-wrap o-items-center o-gap-x-3 o-gap-y-1 o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-white-20 o-bg-white-10 o-px-4 o-py-2 o-backdrop-blur-md"
                >
                  <Icon
                    icon={Clock}
                    size={15}
                    style={{ color: encreSurSombre() }}
                    aria-hidden="true"
                  />
                  <SplitFlap
                    interval={70}
                    step={45}
                    className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encreSurSombre() }}
                  >
                    {etat.titre}
                  </SplitFlap>
                  <span className="o-text-sm o-text-stone-300">{etat.detail}</span>
                </Surgit>
                <Surgit delai={520} className="o-mt-6">
                  <Actions
                    pleine={[
                      '#reserver',
                      <>
                        Reserver une table{' '}
                        <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['#carte', 'Lire la carte']}
                  />
                </Surgit>
              </div>

              {/* La carte flottante, comme le soin le plus demande chez Salonix. */}
              <Surgit
                delai={640}
                className={`${verre(true)} o-flex o-min-w-0 o-items-center o-gap-4 o-p-4 lg:o-col-span-5`}
              >
                <img
                  src={photo('perrin-cuisine', 300, 300)}
                  alt=""
                  aria-hidden="true"
                  className="o-size-16 o-shrink-0 o-rounded-xl o-object-cover"
                />
                <div className="o-min-w-0">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                    Ce midi
                  </p>
                  <p className="o-m-0 o-mt-1 o-truncate o-text-base o-font-medium o-text-stone-50">
                    {carte.formule}
                  </p>
                  <p className="o-m-0 o-mt-0.5 o-text-sm o-text-stone-300">
                    {carte.horaire}
                  </p>
                </div>
                <Icon
                  icon={ArrowRight}
                  size={16}
                  className="o-ml-auto o-shrink-0 o-text-stone-300"
                  aria-hidden="true"
                />
              </Surgit>
            </div>

            <div className="o-mt-10 o-flex o-justify-between o-gap-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400">
              <Surgit delai={720} as="p" className="o-m-0">
                14 rue Cavendish
                <br />
                Metro Voltaire
              </Surgit>
              <Surgit delai={780} as="p" className="o-m-0 o-text-right">
                Du mardi au samedi
                <br />
                Jusqu a 23 h
              </Surgit>
            </div>
          </div>
        </ZoomDefile>

        {/* ================= 2. La maison : trois photos qui derivent, en decale ===== */}
        <section
          aria-labelledby="maison-titre"
          className="o-relative o-z-10 o-mx-auto o-max-w-6xl o-px-6 o-pt-20 md:o-pt-28"
        >
          <div className="o-grid o-gap-10 md:o-grid-cols-12">
            <div className="o-min-w-0 md:o-col-span-5">
              <div className="md:o-sticky" style={{ top: 140 }}>
                <Reveal>
                  <Indice rang="01" sombre={false}>
                    La maison
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    id="maison-titre"
                    className="o-m-0 o-mt-6"
                    style={affiche('m', 300)}
                  >
                    La salle, le comptoir, la rue.
                  </h2>
                </Reveal>
                <Reveal delay={160}>
                  <p className="o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                    Vingt-deux couverts a l interieur, huit en terrasse d avril a octobre.
                    Le comptoir sert jusqu a la fermeture, sans reservation — c est la
                    seule facon d entrer sans avoir prevu.
                  </p>
                </Reveal>
                <Reveal delay={240}>
                  <p className="o-mt-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    Ouvert en 1998
                    <br />
                    Meme cuisine, meme comptoir
                  </p>
                </Reveal>
              </div>
            </div>

            {/* Trois cadrages differents, decales : une page dessinee ne pose pas trois carres. */}
            <div className="o-min-w-0 md:o-col-span-7">
              <div className="o-grid o-grid-cols-12 o-gap-4 md:o-gap-6">
                <Parallaxe vitesse={0.12} glisse={0.55} className="o-col-span-8">
                  <Devoile
                    src={photo('perrin-comptoir', 900, 1100)}
                    alt="Le comptoir, en fin de service"
                    ratio="4 / 5"
                    depuis="bas"
                    derive={30}
                    legende="Le comptoir, en fin de service"
                  />
                </Parallaxe>
                <Parallaxe
                  vitesse={-0.1}
                  glisse={0.7}
                  className="o-col-span-4 o-self-end o-pb-16"
                >
                  <Devoile
                    src={photo('perrin-cuisine', 700, 900)}
                    alt="La cuisine, ouverte sur la salle"
                    ratio="3 / 4"
                    depuis="droite"
                    derive={24}
                    legende="La cuisine"
                  />
                </Parallaxe>
                <Parallaxe
                  vitesse={0.18}
                  glisse={0.85}
                  className="o-col-span-9 o-col-start-3 md:o-col-span-8 md:o-col-start-4"
                  style={{ marginBottom: '-4rem' }}
                >
                  <Devoile
                    src={photo('perrin-rue', 1200, 800)}
                    alt="La terrasse, huit couverts d avril a octobre"
                    ratio="3 / 2"
                    depuis="gauche"
                    derive={36}
                    legende="La terrasse — huit couverts, d avril a octobre"
                    className="o-shadow-2xl"
                  />
                </Parallaxe>
              </div>
            </div>
          </div>
        </section>

        {/* ----- La carte, en deux colonnes -------------------------------- */}
        <main
          id="carte"
          className="o-mx-auto o-max-w-3xl o-scroll-mt-24 o-px-6 o-pb-14 o-pt-28 md:o-pt-40"
        >
          {/* Le choix du service : deux mots, en tete de carte. */}
          <div
            role="group"
            aria-label="Choisir le service"
            className="o-flex o-items-center o-justify-center o-gap-6 o-border-t o-border-b o-border-stone-900 dark:o-border-stone-100 o-py-3"
          >
            {SERVICES.map((item) => {
              const actif = item.cle === service
              return (
                <button
                  key={item.cle}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setService(item.cle)
                  }}
                  className="o-text-sm o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
                  style={
                    actif
                      ? {
                          color: encre(),
                          fontWeight: 700,
                          textDecoration: 'underline',
                          textUnderlineOffset: '5px',
                        }
                      : { color: 'var(--o-theme-muted)' }
                  }
                >
                  {item.libelle}
                </button>
              )
            })}
          </div>

          <p className="o-mx-auto o-mt-6 o-max-w-xl o-text-center o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
            Une ardoise reecrite chaque lundi, et la meme cuisine depuis 1998.{' '}
            {semaineDeLaCarte(maintenant)}.
          </p>
          <p className="o-mt-5 o-text-center o-text-sm o-font-medium">{carte.formule}</p>
          <p className="o-mx-auto o-mt-1.5 o-max-w-xl o-text-center o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
            {carte.horaire} — {carte.note}
          </p>

          <div className="o-mt-10 o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-2">
            <ColonneCarte titre="Pour commencer" plats={carte.entrees} />
            <ColonneCarte titre="Ensuite" plats={carte.plats} />
            <div className="md:o-col-span-2">
              <ColonneCarte titre="Pour finir" plats={carte.desserts} />
            </div>
          </div>

          <p className="o-mt-8 o-text-center o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
            Prix nets, service compris. Les allergenes sont ceux de la liste des quatorze.
            Tout est prepare sur place sauf mention contraire, et cette mention figure
            sous le plat.
          </p>
        </main>

        {/* ----- L ardoise du jour ------------------------------------------ */}
        <section
          id="ardoise"
          aria-labelledby="ardoise-titre"
          className="o-relative o-isolate o-overflow-hidden"
          style={{ backgroundColor: 'var(--o-palette-stone-900)', colorScheme: 'dark' }}
        >
          <Crosshatch
            className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
            color={encreSurSombre()}
            strength={0.16}
          />
          <div
            aria-hidden="true"
            className="o-relative o-z-10 o-border-b o-border-white-10 o-py-6 o-font-serif o-italic o-text-stone-100"
          >
            <Bandeau
              mots={[...carte.entrees, ...carte.plats].map((plat) => plat.nom)}
              separateur="—"
              vitesse={70}
              taille="clamp(2rem, 5vw, 4.5rem)"
            />
          </div>
          <div className="o-relative o-z-10 o-mx-auto o-max-w-3xl o-px-6 o-py-12">
            <h2
              id="ardoise-titre"
              className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest"
              style={{ color: encreSurSombre() }}
            >
              <Icon icon={ChefHat} size={14} aria-hidden="true" />L ardoise —{' '}
              {carte.libelle.toLowerCase()}
            </h2>
            <ul className="o-list-none o-m-0 o-mt-6 o-grid o-gap-x-10 o-gap-y-3 o-p-0 sm:o-grid-cols-2">
              {[...carte.entrees, ...carte.plats].slice(0, 6).map((plat) => (
                <li key={plat.nom} className="o-flex o-items-baseline o-gap-2">
                  <span className="o-font-serif o-text-lg o-text-stone-100 dark:o-text-stone-100">
                    {plat.nom}
                  </span>
                  <span
                    aria-hidden="true"
                    className="o-grow o-self-end o-border-b o-border-dotted"
                    style={{
                      borderColor:
                        'color-mix(in oklab, var(--o-palette-stone-100) 30%, transparent)',
                      marginBottom: '0.35em',
                    }}
                  />
                  <span
                    className="o-shrink-0 o-tabular-nums"
                    style={{ color: encreSurSombre() }}
                  >
                    {plat.prix} EUR
                  </span>
                </li>
              ))}
            </ul>
            <p className="o-mt-6 o-text-sm o-leading-relaxed o-text-stone-300 dark:o-text-stone-300">
              Reecrite chaque lundi, selon le marche de la veille. Ce qui n y est plus est
              parti : nous ne gardons rien d une semaine sur l autre.
            </p>
          </div>
        </section>

        {/* ----- Les heures, en tableau ------------------------------------- */}
        <section
          id="horaires"
          aria-labelledby="horaires-titre"
          className="o-mx-auto o-max-w-3xl o-px-6 o-py-12"
        >
          <h2
            id="horaires-titre"
            className="o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
          >
            Les heures
          </h2>
          <table
            className="o-mt-5 o-w-full o-text-sm"
            style={{ borderCollapse: 'collapse' }}
          >
            <caption className="o-sr-only">Horaires d ouverture de la semaine</caption>
            <tbody>
              {JOURS.map((jour, rang) => {
                const plages = SEMAINE[rang] ?? []
                const aujourdhui = rang === jourCourant
                return (
                  <tr
                    key={jour}
                    className="o-border-b o-border-stone-200 dark:o-border-stone-800"
                    style={
                      aujourdhui ? { backgroundColor: accentDoux(500, 14) } : undefined
                    }
                  >
                    <th
                      scope="row"
                      className="o-py-2.5 o-pr-5 o-text-left o-font-medium o-capitalize"
                    >
                      {jour}
                      {aujourdhui && (
                        <span
                          className="o-ml-2 o-text-xs o-font-normal"
                          style={{ color: encre() }}
                        >
                          aujourd hui
                        </span>
                      )}
                    </th>
                    <td className="o-py-2.5 o-tabular-nums o-text-stone-600 dark:o-text-stone-400">
                      {plages.length === 0
                        ? 'Ferme'
                        : plages
                            .map(
                              (p) =>
                                `${heureLisible(p.ouverture)} — ${heureLisible(p.fermeture)}`,
                            )
                            .join('   ')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* ----- La reservation, en pied de carte ---------------------------- */}
        <section
          id="reserver"
          aria-labelledby="reserver-titre"
          className="o-border-t o-border-b o-border-stone-200 dark:o-border-stone-800"
          style={{ backgroundColor: 'var(--o-theme-surface)' }}
        >
          <div className="o-mx-auto o-max-w-3xl o-px-6 o-py-12">
            <h2
              id="reserver-titre"
              className="o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
            >
              Reserver
            </h2>
            <p className="o-mt-3 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
              Trente couverts, et pas un de plus. Au-dela de six personnes, appelez : nous
              rapprochons des tables, et cela se decide de vive voix.
            </p>

            <div className="o-mt-6 o-grid o-gap-4 sm:o-grid-cols-3">
              <Input
                type="date"
                label="Date"
                value={dateChoisie}
                min={enISO(new Date())}
                onChange={(evenement) => {
                  setDateChoisie(evenement.target.value)
                  setCreneau(null)
                }}
              />
              <Select
                label="Service"
                value={serviceReserve}
                onChange={(evenement) => {
                  setServiceReserve(evenement.target.value === 'midi' ? 'midi' : 'soir')
                  setCreneau(null)
                }}
              >
                <option value="midi">Le midi</option>
                <option value="soir">Le soir</option>
              </Select>
              <Select
                label="Couverts"
                value={String(couverts)}
                onChange={(evenement) => {
                  setCouverts(Number(evenement.target.value))
                  setCreneau(null)
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={String(n)}>
                    {n} couvert{n > 1 ? 's' : ''}
                  </option>
                ))}
              </Select>
            </div>

            <p className="o-mt-5 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              {dateLisible(jourReserve)}
            </p>

            {plageDemandee === undefined ? (
              <p
                aria-live="polite"
                className="o-mt-3 o-text-sm o-text-stone-600 dark:o-text-stone-400"
              >
                Pas de service ce jour-la. Choisissez une autre date, ou l autre service.
              </p>
            ) : (
              <>
                <div
                  role="group"
                  aria-label="Choisir un creneau"
                  className="o-mt-3 o-flex o-flex-wrap o-gap-2"
                >
                  {creneaux.map((item) => {
                    const complet = item.tables === 0
                    const choisi = item.heure === creneau
                    return (
                      <button
                        key={item.heure}
                        type="button"
                        disabled={complet}
                        aria-pressed={choisi}
                        onClick={() => {
                          setCreneau(item.heure)
                        }}
                        className={
                          complet
                            ? 'o-cursor-not-allowed o-rounded-lg o-border-w-1 o-border-stone-200 dark:o-border-stone-800 o-px-3 o-py-2 o-text-sm o-tabular-nums o-text-stone-500 dark:o-text-stone-400'
                            : 'o-rounded-lg o-border-w-1 o-px-3 o-py-2 o-text-sm o-tabular-nums o-transition-colors focus:o-ring'
                        }
                        style={
                          complet
                            ? undefined
                            : choisi
                              ? { ...aplat(), borderColor: 'transparent' }
                              : { borderColor: 'var(--o-theme-line)' }
                        }
                      >
                        {item.heure}
                        <span className="o-ml-1.5 o-text-xs o-opacity-70">
                          {complet ? 'complet' : `${String(item.tables)} tables`}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <p aria-live="polite" className="o-mt-4 o-text-sm">
                  {retenu === undefined ? (
                    <span className="o-text-stone-600 dark:o-text-stone-400">
                      Choisissez une heure pour confirmer.
                    </span>
                  ) : (
                    <span
                      className="o-inline-flex o-items-center o-gap-2 o-font-medium"
                      style={{ color: encre() }}
                    >
                      <Icon icon={Check} size={15} aria-hidden="true" />
                      {couverts} couvert{couverts > 1 ? 's' : ''} a {retenu.heure}, le{' '}
                      {dateLisible(jourReserve)} — il reste {retenu.tables} tables.
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
        </section>

        {/* ----- L appel : le numero, en grand, et rien d autre --------------- */}
        <section
          aria-labelledby="appel-titre"
          className="o-mx-auto o-max-w-6xl o-px-6 o-py-24 o-text-center md:o-py-36"
        >
          <h2
            id="appel-titre"
            className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
          >
            Pour plus de six, ou pour ce soir
          </h2>
          <Aimant force={0.2} className="o-mt-8 o-max-w-full">
            <a
              href="tel:+33143792208"
              className="o-inline-block o-max-w-full o-whitespace-nowrap o-no-underline o-text-stone-950 dark:o-text-stone-50 o-transition-colors hover:o-text-stone-600 dark:hover:o-text-stone-300 focus:o-ring"
              style={{
                ...affiche('xl', 300),
                fontSize: 'clamp(2.25rem, 9.5vw, 10rem)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              01 43 79 22 08
            </a>
          </Aimant>
          <p className="o-mx-auto o-mt-6 o-max-w-md o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
            On decroche entre les services, de 10 h a midi et de 16 h a 19 h. Le reste du
            temps, on est en salle.
          </p>
        </section>

        {/* ----- Le pied : une carte de visite ------------------------------- */}
        <footer className="o-border-t o-border-stone-900 dark:o-border-stone-100">
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-10 o-px-6 o-py-14 md:o-grid-cols-12 md:o-py-20">
            <div className="md:o-col-span-4">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                Venir
              </p>
              <p className="o-m-0 o-mt-4 o-font-serif o-text-2xl o-leading-snug o-text-stone-950 dark:o-text-stone-50 md:o-text-3xl">
                14 rue Cavendish
                <br />
                Paris 11e
              </p>
              <p className="o-m-0 o-mt-3 o-text-sm o-text-stone-600 dark:o-text-stone-400">
                Metro Voltaire (9), Charonne (9)
                <br />
                Bus 46, 56 — arret Cavendish
              </p>
            </div>
            <div className="md:o-col-span-4">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                Les heures
              </p>
              <p className="o-m-0 o-mt-4 o-font-serif o-text-2xl o-leading-snug o-text-stone-950 dark:o-text-stone-50 md:o-text-3xl">
                Mardi — samedi
                <br />
                12h — 14h30, 19h — 22h30
              </p>
              <p className="o-m-0 o-mt-3 o-text-sm o-text-stone-600 dark:o-text-stone-400">
                Dimanche midi seulement. Lundi, c est le marche : ferme.
              </p>
            </div>
            <div className="md:o-col-span-4">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                Ecrire
              </p>
              <p className="o-m-0 o-mt-4 o-font-serif o-text-2xl o-leading-snug md:o-text-3xl">
                <a
                  href="#reserver"
                  className="o-inline-flex o-items-center o-gap-2 o-no-underline o-text-stone-950 dark:o-text-stone-50 hover:o-underline focus:o-ring"
                >
                  bonjour@maisonperrin.fr{' '}
                  <Icon icon={ArrowUpRight} size={20} aria-hidden="true" />
                </a>
              </p>
              <p className="o-m-0 o-mt-3 o-text-sm o-text-stone-600 dark:o-text-stone-400">
                Groupes, privatisations le dimanche soir, questions sur la carte.
              </p>
            </div>
          </div>
          <div className="o-mx-auto o-flex o-max-w-6xl o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-stone-200 dark:o-border-stone-800 o-px-6 o-py-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
            <span>Maison Perrin SARL — RCS Paris 419 882 004</span>
            <span>Prix nets, service compris — © 2026</span>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
