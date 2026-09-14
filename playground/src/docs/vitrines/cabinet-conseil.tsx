/**
 * Verne & Associes — cabinet de conseil.
 *
 * ## Le parti pris — une revue, lue en chapitres
 *
 * Un cabinet qui conseille des conseils d administration ne se presente pas
 * comme un editeur de logiciel : il se presente comme une revue. La page ouvre
 * sur un bloc-titre de gouttiere a gouttiere — l accroche en grand, le chapeau
 * range dans une colonne etroite, une rangee de trois cartes — puis se lit en
 * **chapitres a etiquette collante** : les quatre domaines restent poses a
 * gauche pendant que leurs missions defilent a droite.
 *
 * Rien n est mis en carte apres le bloc-titre. Les chiffres du cabinet ne
 * forment pas une barre : ce sont des **notes dans la marge**, en mono, a cote
 * des noms des associes. L appel final est une adresse de courriel en 64 px,
 * soulignee, et rien d autre. Le pied est un tableau a filets, comme le
 * colophon d une publication.
 *
 * ## Ce que la page garde de son metier
 *
 * Les missions recentes, datees et chiffrees, sont le mecanisme de la page :
 * un cabinet de conseil se juge sur des dossiers, pas sur des promesses. Elles
 * sont desormais rangees par domaine, dans les chapitres, avec leur chiffre
 * en marge. Deux citations de dirigeants tiennent dans la marge aussi.
 *
 * ## Le fond
 *
 * Du papier millimetre, statique, tres pale, sous le bloc-titre seulement.
 * Aucun fond anime — un cabinet qui negocie des garanties de passif n a pas
 * de shader. Le mouvement est celui du defilement : les etiquettes collent,
 * une photo derive et chevauche le chapitre suivant.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Fragment, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { GraphPaper } from '@/odoro/background/GraphPaper.jsx'
import { ParallaxImage } from '@/odoro/image/ParallaxImage.jsx'
import { HighlightSweep } from '@/odoro/text/HighlightSweep.jsx'
import { UnderlineDraw } from '@/odoro/text/UnderlineDraw.jsx'

import { nuit } from './communs.jsx'
import { photo, portrait } from './media.js'
import { accent, accentDoux, aplat, encre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreCoins,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Chapitre } from './scene.jsx'

/** Filet tire de l encre courante : le systeme n a pas de classe pour cela. */
const FILET = 'color-mix(in oklab, currentColor 16%, transparent)'

/** Le filet appuye du pied : un trait qui ferme la page. */
const FILET_FORT = 'color-mix(in oklab, currentColor 42%, transparent)'

/**
 * L accent de la page, lisible dans les deux themes.
 *
 * La barre laissant choisir n importe quelle couleur, c est le role calcule de
 * `palettes.ts` qui descend l echelle jusqu au premier ton qui passe. On le
 * cite ici ; en dessous de cent, l accent est ramene vers l encre du corps.
 */
function teinte(part = 100): string {
  return part >= 100
    ? encre()
    : `color-mix(in oklab, ${encre()} ${String(part)}%, var(--o-theme-fg))`
}

/** L encre des grands titres : presque celle du corps, teintee juste assez. */
const TITRE = { color: teinte(22) } as CSSProperties

/** Le masque qui efface le papier millimetre avant le premier chapitre. */
const MASQUE = 'linear-gradient(to bottom, black, black 30%, transparent 78%)'

/** La voix mono des notes de marge. */
const NOTE =
  'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-500 dark:o-text-slate-400'

/** La meme voix, sur la bande toujours sombre : les nuances claires seules. */
const NOTE_SUR_NUIT =
  'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-400'

/** Les liens du bloc-titre. */
const NAVIGATION = [
  ['#domaines', 'Domaines'],
  ['#associes', 'Associes'],
  ['#ecrire', 'Ecrire'],
] as const

/** Une mission recente, datee et chiffree. */
interface Mission {
  readonly annee: string
  readonly titre: string
  readonly client: string
  readonly duree: string
  readonly chiffre: string
  readonly resultat: string
}

/** Un domaine d intervention, avec ses missions. */
interface Domaine {
  readonly cle: string
  readonly numero: string
  readonly titre: string
  readonly texte: string
  readonly missions: readonly Mission[]
  /** Une phrase d un dirigeant, posee dans la marge. */
  readonly citation?: readonly [texte: string, auteur: string]
}

/**
 * Les quatre domaines, et leurs missions recentes.
 *
 * Un cabinet de conseil se juge sur des dossiers, pas sur des promesses : ils
 * portent donc une annee, une taille, une duree et un resultat. Ceux qui ne
 * peuvent pas etre nommes sont decrits, ce qui est la regle de la profession.
 */
const DOMAINES: readonly Domaine[] = [
  {
    cle: 'gouvernance',
    numero: 'I',
    titre: 'Gouvernance et conseils',
    texte:
      'Composition d un conseil, evaluation de son fonctionnement, preparation d une assemblee sensible, plan de succession du dirigeant.',
    citation: [
      'Ils ont pose la seule question que personne n osait poser au conseil, et ils l ont posee au bon moment.',
      'Anne-Sophie Delaunay, presidente, Groupe Delaunay',
    ],
    missions: [
      {
        annee: '2026',
        titre: 'Reforme du conseil d un groupe familial de quatrieme generation',
        client: 'Agroalimentaire, 2,1 Md€ de chiffre d affaires',
        duree: '7 mois',
        chiffre: '14 → 9 administrateurs',
        resultat:
          'Cinq sieges supprimes, trois administrateurs independants nommes, un pacte revu par 41 actionnaires familiaux.',
      },
      {
        annee: '2025',
        titre: 'Plan de succession d un dirigeant fondateur',
        client: 'Distribution specialisee, 640 salaries',
        duree: '11 mois',
        chiffre: '18 mois de transition',
        resultat:
          'Passation preparee avec un directeur general recrute a l exterieur, et le fondateur maintenu a la presidence du conseil.',
      },
      {
        annee: '2025',
        titre: 'Evaluation du fonctionnement d un conseil de surveillance',
        client: 'Banque mutualiste regionale',
        duree: '4 mois',
        chiffre: '22 entretiens individuels',
        resultat:
          'Ordre du jour reduit d un tiers, comite des risques dote de son propre rapporteur, seances ramenees de six a quatre heures.',
      },
    ],
  },
  {
    cle: 'haut-de-bilan',
    numero: 'II',
    titre: 'Operations de haut de bilan',
    texte:
      'Preparation a la cession, revue de valorisation, coordination des conseils juridiques et financiers, negociation des garanties.',
    missions: [
      {
        annee: '2026',
        titre: 'Cession de 62 % d un equipementier automobile a un fonds nordique',
        client: 'Industrie, 1 400 salaries',
        duree: '9 mois',
        chiffre: '212 M€ de valeur d entreprise',
        resultat:
          'Garantie de passif ramenee de 18 a 12 mois, et plafond negocie a 8 % du prix au lieu des 15 % demandes.',
      },
      {
        annee: '2025',
        titre: 'Revue de valorisation avant entree au capital',
        client: 'Assurance de personnes',
        duree: '3 mois',
        chiffre: '7,4 × EBITDA retenu',
        resultat:
          'Multiple corrige de 9,1 a 7,4 apres retraitement des produits non recurrents ; l operation s est faite sur cette base.',
      },
      {
        annee: '2024',
        titre: 'Coordination d une acquisition transfrontaliere',
        client: 'Transport public delegue',
        duree: '6 mois',
        chiffre: '3 juridictions, 5 conseils',
        resultat:
          'Calendrier tenu a deux semaines pres malgre un controle des concentrations en phase approfondie.',
      },
    ],
  },
  {
    cle: 'crise',
    numero: 'III',
    titre: 'Situations de crise',
    texte:
      'Conciliation, sauvegarde, negociation avec les creanciers, mandat ad hoc. Nous intervenons avec l equipe en place, jamais a sa place.',
    citation: [
      'Nous etions en conciliation avec onze creanciers. Verne a tenu la table pendant quatre mois sans qu un seul sorte de la piece.',
      'Beatrice Nardi, directrice financiere, Fonderies du Rhone',
    ],
    missions: [
      {
        annee: '2026',
        titre: 'Conciliation de 210 M€ de dette pour une chaine d hotellerie',
        client: '31 etablissements, 1 900 salaries',
        duree: '4 mois',
        chiffre: '11 creanciers a la table',
        resultat:
          'Accord homologue sans qu un seul creancier sorte de la procedure ; echeancier etale sur sept ans.',
      },
      {
        annee: '2025',
        titre: 'Mandat ad hoc pour une verrerie en tension de tresorerie',
        client: 'Industrie, 380 salaries',
        duree: '5 mois',
        chiffre: '19 M€ de besoin couvert',
        resultat:
          'Ligne de financement relais obtenue et 340 emplois maintenus ; deux sites sur trois conserves.',
      },
      {
        annee: '2024',
        titre: 'Sauvegarde acceleree d un groupement hospitalier prive',
        client: 'Six etablissements',
        duree: '8 mois',
        chiffre: '58 M€ de passif traite',
        resultat:
          'Plan arrete en huit mois, adosse a un partenaire regional, sans cession d etablissement.',
      },
    ],
  },
  {
    cle: 'organisation',
    numero: 'IV',
    titre: 'Organisation et couts',
    texte:
      'Revue de la structure, du perimetre des directions et de la chaine de decision, quand le chiffre d affaires a double sans que rien ne bouge.',
    missions: [
      {
        annee: '2026',
        titre: 'Reorganisation de huit filiales europeennes en trois regions',
        client: 'Industrie, 2 700 salaries',
        duree: '10 mois',
        chiffre: '8 → 3 entites de pilotage',
        resultat:
          'Comite executif ramene de treize a huit membres, et 6,2 M€ de couts de structure retires sur deux exercices.',
      },
      {
        annee: '2025',
        titre: 'Revue de la chaine de decision apres doublement du chiffre d affaires',
        client: 'Services aux entreprises, 900 salaries',
        duree: '5 mois',
        chiffre: '9 niveaux → 5',
        resultat: 'Delai median d une decision d investissement ramene de 71 a 24 jours.',
      },
      {
        annee: '2024',
        titre: 'Perimetre des directions apres une acquisition',
        client: 'Distribution, 1 100 salaries',
        duree: '4 mois',
        chiffre: '2 directions fusionnees',
        resultat:
          'Doublons supprimes sans depart contraint : quatorze postes redeployes en interne.',
      },
    ],
  },
]

/**
 * Les associes, avec ce qui se note en marge.
 *
 * La grille de visages dit qui ils sont ; elle ne dit pas d ou ils viennent.
 * Ici, le parcours tient en deux dates, et les chiffres — une annee, un nombre
 * de cessions — sont des notes de marge, en mono, pas une barre.
 */
const ASSOCIES = [
  {
    nom: 'Helene Verne',
    role: 'Associee fondatrice — gouvernance',
    graine: 'cabinet-verne',
    bio: 'Ancienne secretaire generale d un groupe cote. Elle preside le comite d ethique du cabinet et arbitre les conflits d interets.',
    notes: ['1994 — fonde le cabinet', 'Comite d ethique depuis 2012'],
    courriel: 'helene.verne@verne-associes.fr',
  },
  {
    nom: 'Paul Arsac',
    role: 'Associe — haut de bilan',
    graine: 'cabinet-arsac',
    bio: 'Vingt-deux ans en banque d affaires, directeur de la couverture industrie, avant d ouvrir la pratique haut de bilan en 2018.',
    notes: ['41 cessions conduites', '9 transfrontalieres'],
    courriel: 'paul.arsac@verne-associes.fr',
  },
  {
    nom: 'Noor Benali',
    role: 'Associee — restructuration',
    graine: 'cabinet-benali',
    bio: 'Administratrice judiciaire de formation, etude de Lyon. Elle enseigne le droit des entreprises en difficulte a Paris II.',
    notes: ['2016 — rejoint le cabinet', 'Seminaire Paris II depuis 2019'],
    courriel: 'noor.benali@verne-associes.fr',
  },
  {
    nom: 'Simon Vaury',
    role: 'Associe — organisation',
    graine: 'cabinet-vaury',
    bio: 'Ingenieur des Mines. Il a dirige les operations industrielles d un equipementier de premier rang avant de monter la pratique organisation.',
    notes: ['2014 — rejoint le cabinet', 'Forme les consultants juniors'],
    courriel: 'simon.vaury@verne-associes.fr',
  },
] as const

/** Les chiffres du cabinet : des notes de marge, pas une barre. */
const NOTES_CABINET = [
  ['1994', 'annee de fondation'],
  ['31', 'consultants et associes'],
  ['184', 'missions depuis cinq ans'],
  ['11 ans', 'd anciennete moyenne des clients'],
] as const

/**
 * Le tableau du pied : ce qu un colophon dit, ligne a ligne.
 *
 * Le conseil de direction n a pas d ordre professionnel : rien n oblige un
 * cabinet a publier ses regles. C est precisement pourquoi elles sont ici.
 */
const COLOPHON: readonly (readonly [string, ReactNode])[] = [
  [
    'Raison sociale',
    'Verne & Associes SAS, cabinet de conseil de direction — capital 400 000 €',
  ],
  ['Siege', '31 rue de Marignan, 75008 Paris'],
  ['Bureaux', 'Paris — Lyon — Nantes'],
  ['Immatriculation', 'RCS Paris 393 118 442 — APE 7022Z — TVA FR 42 393 118 442'],
  [
    'Assurance',
    'Responsabilite civile professionnelle Covea Risks, 10 M€ par sinistre, Union europeenne, Royaume-Uni et Suisse',
  ],
  [
    'Independance',
    'Jamais deux parties d une meme operation. Revue de conflits sur cinq ans avant toute mission.',
  ],
  [
    'Honoraires',
    'Aucune retro-commission d un tiers introduit dans un dossier : ni banque, ni fonds, ni cabinet d avocats.',
  ],
  ['Confidentialite', 'Etendue par contrat a dix ans apres la fin des travaux.'],
  [
    'Ce que nous ne faisons pas',
    'Aucun acte juridique, aucune consultation juridique a titre principal, aucun conseil en investissement financier.',
  ],
  ['Donnees', 'Conservees trois ans, ni cedees ni prospectees — dpo@verne-associes.fr'],
  [
    'Publications',
    'Quatre notes par an, ISSN 2681-4417, deposees a la Bibliotheque nationale, telechargeables sans formulaire.',
  ],
]

/** Une note de marge : deux lignes de mono, alignees sur le contenu. */
function Marge({
  children,
  className = '',
}: {
  readonly children: ReactNode
  readonly className?: string
}): ReactElement {
  return <p className={`o-m-0 ${NOTE} ${className}`}>{children}</p>
}

/** Un lien de la page, dont le trait se dessine au survol. */
function Lien({
  href,
  children,
  className = '',
}: {
  readonly href: string
  readonly children: string
  readonly className?: string
}): ReactElement {
  return (
    <a href={href} className={`o-no-underline o-text-current focus:o-ring ${className}`}>
      <UnderlineDraw trigger="hover" thickness={2} color={encre()}>
        {children}
      </UnderlineDraw>
    </a>
  )
}

/** Une mission dans un chapitre : l annee a gauche, le chiffre dans la marge droite. */
function Dossier({ mission }: { readonly mission: Mission }): ReactElement {
  return (
    <li
      className="o-grid o-gap-x-8 o-gap-y-3 o-py-8 md:o-grid-cols-12"
      style={{ borderTop: `1px solid ${FILET}` }}
    >
      <div className="md:o-col-span-2">
        <p
          className="o-m-0 o-tabular-nums o-text-slate-950 dark:o-text-slate-50"
          style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 2.6vw, 2.5rem)' }}
        >
          {mission.annee}
        </p>
        <Marge className="o-mt-1">{mission.duree}</Marge>
      </div>
      <div className="md:o-col-span-7">
        <h4 className="o-m-0 o-text-xl o-font-medium o-leading-snug o-tracking-tight o-text-slate-950 dark:o-text-slate-50 md:o-text-2xl">
          {mission.titre}
        </h4>
        <Marge className="o-mt-2">{mission.client}</Marge>
        <p className="o-mt-4 o-max-w-lg o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
          {mission.resultat}
        </p>
      </div>
      {/* Le chiffre est une note dans la marge : mono, aligne a droite, sans cartouche. */}
      <p
        className="o-m-0 o-font-mono o-text-sm o-leading-relaxed o-tabular-nums md:o-col-span-3 md:o-pt-1 md:o-text-right"
        style={{ color: teinte() }}
      >
        {mission.chiffre}
      </p>
    </li>
  )
}

/**
 * La coupe, au milieu des chapitres : un ecran de texte seul, sur l encre.
 *
 * Quatre chapitres a la suite finiraient par se lire comme quatre fois la meme
 * page. Celui-ci n a ni dossier, ni photo, ni chiffre : une phrase dont la
 * premiere moitie est eteinte, et la note trimestrielle dans la marge. C est
 * aussi le seul endroit ou la page passe au noir — deux tons, une coupe nette.
 */
function Coupe(): ReactElement {
  return (
    <section
      aria-labelledby="coupe-titre"
      className="o-px-6 o-py-28 md:o-px-8 md:o-py-40"
      style={nuit('slate')}
    >
      <div className="o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-12">
        <p className={`o-m-0 md:o-col-span-3 ${NOTE_SUR_NUIT}`}>
          Entre deux domaines
          <br />
          La note, quatre fois l an
          <br />
          ISSN 2681-4417
        </p>
        <div className="md:o-col-span-9">
          <h2 id="coupe-titre" className="o-sr-only">
            Ce que nous croyons
          </h2>
          <Manifeste eteint="Un cabinet qui repete au conseil ce que le conseil pense deja">
            ne coute pas cher : il ne sert simplement a rien. Nous facturons la phrase que
            personne ne veut dire.
          </Manifeste>
          <p className="o-mt-10 o-max-w-xl o-leading-relaxed o-text-slate-300">
            Nos notes sont publiques et se telechargent sans formulaire. Elles disent
            parfois le contraire de ce qu un client aimerait lire ; nous les publions
            quand meme.
          </p>
          <p className="o-m-0 o-mt-8 o-text-lg">
            <a
              href="#ecrire"
              className="o-inline-flex o-items-center o-gap-2 o-no-underline o-text-slate-50 focus:o-ring"
            >
              <UnderlineDraw trigger="hover" thickness={2} color={encre()}>
                Recevoir les quatre notes de l annee
              </UnderlineDraw>
              <Icon icon={ArrowUpRight} size={18} aria-hidden="true" />
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  return (
    <Porte forme="trou" marque="Verne & Associes" sombre={false}>
      <div
        className="o-bg-slate-50 dark:o-bg-slate-950 o-text-slate-800 dark:o-text-slate-200"
        style={polices}
      >
        {/*
          ----- Le bloc-titre --------------------------------------------------

          Le papier millimetre ne tient que sous cette zone : un masque l efface
          avant le premier chapitre. Sa trame cite la palette de la vitrine.
        */}
        <div id="haut" className="o-relative o-isolate o-overflow-hidden">
          <GraphPaper
            className="o-absolute o-inset-0 o-z-0"
            size={12}
            strength={0.1}
            color={accent(600)}
            background="transparent"
            style={{ maskImage: MASQUE, WebkitMaskImage: MASQUE }}
          />

          <div className="o-relative o-z-10 o-flex o-min-h-screen o-flex-col">
            <BarreCoins
              marque="Verne & Associes"
              liens={NAVIGATION}
              droite="Paris — Lyon — Nantes"
              sombre={false}
            />

            {/* Tout tient de gouttiere a gouttiere, sur un retrait de 30 px — Forma. */}
            <div className="o-flex o-grow o-flex-col o-justify-between o-gap-10 o-px-6 o-pb-8 o-pt-8 md:o-px-8">
              <div className="o-grid o-gap-8 md:o-grid-cols-12">
                <div className="o-min-w-0 md:o-col-span-8">
                  <Surgit>
                    <Etiquette sombre={false}>
                      Fonde en 1994 — trente et une personnes
                    </Etiquette>
                  </Surgit>
                  <TitreVague
                    delai={120}
                    className="o-m-0 o-mt-6 o-max-w-4xl o-text-slate-950 dark:o-text-slate-50"
                    style={{
                      ...affiche('l', 300),
                      fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)',
                    }}
                  >
                    Nous ne vendons pas une methode. Nous disons ce que nous pensons.
                  </TitreVague>
                </div>
                <Surgit
                  delai={400}
                  className="o-flex o-flex-col o-justify-end o-gap-6 md:o-col-span-4"
                >
                  <p className="o-m-0 o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                    Conseils d administration, directions generales et actionnaires
                    familiaux. Quatre domaines, et{' '}
                    <HighlightSweep
                      colour={accentDoux(400, 45)}
                      thickness={0.5}
                      delay={900}
                      declenchement="montage"
                    >
                      <span className="o-text-slate-950 dark:o-text-slate-50">
                        une note de huit pages toutes les deux semaines
                      </span>
                    </HighlightSweep>
                    .
                  </p>
                  <Actions
                    sombre={false}
                    pleine={[
                      '#ecrire',
                      <>
                        Nous ecrire{' '}
                        <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['#domaines', 'Les quatre domaines']}
                  />
                </Surgit>
              </div>

              {/* La rangee de cartes — Forma. Aucun chiffre : la liste des domaines, une position, une note. */}
              <div className="o-grid o-gap-4 md:o-grid-cols-12">
                <Surgit
                  delai={520}
                  className="o-flex o-flex-col o-justify-between o-rounded-2xl o-border-w-1 o-border-black-10 o-bg-white o-p-6 dark:o-border-zinc-800 dark:o-bg-slate-900 md:o-col-span-3"
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                    Domaines
                  </p>
                  <ol className="o-m-0 o-mt-6 o-list-none o-p-0">
                    {DOMAINES.map((d) => (
                      <li
                        key={d.cle}
                        className="o-flex o-items-baseline o-gap-3 o-py-1.5 o-text-sm"
                      >
                        <span
                          className="o-w-5 o-shrink-0 o-font-mono o-text-xs"
                          style={{ color: teinte() }}
                        >
                          {d.numero}
                        </span>
                        <Lien
                          href={`#${d.cle}`}
                          className="o-text-slate-950 dark:o-text-slate-50"
                        >
                          {d.titre}
                        </Lien>
                      </li>
                    ))}
                  </ol>
                </Surgit>
                <Surgit
                  delai={600}
                  className="o-flex o-flex-col o-justify-between o-rounded-2xl o-border-w-1 o-border-black-10 o-bg-white o-p-6 dark:o-border-zinc-800 dark:o-bg-slate-900 md:o-col-span-3"
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                    Position
                  </p>
                  <p
                    className="o-m-0 o-mt-6 o-text-lg o-leading-snug o-text-slate-950 dark:o-text-slate-50"
                    style={{ fontFamily: 'var(--o-vitrine-affichage)', fontWeight: 300 }}
                  >
                    Nous refusons une mission sur trois. C est la contrepartie d un
                    cabinet de trente et une personnes.
                  </p>
                </Surgit>
                <Surgit
                  delai={680}
                  className="o-relative o-min-h-64 o-overflow-hidden o-rounded-2xl md:o-col-span-6"
                >
                  <img
                    src={photo('cadre-bandeau-six', 1400, 800)}
                    alt="Facade moderniste en beton, noir et blanc"
                    className="o-absolute o-inset-0 o-size-full o-object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="o-absolute o-inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, color-mix(in oklab, var(--o-palette-slate-950) 72%, transparent), transparent 55%)',
                    }}
                  />
                  <p className="o-absolute o-bottom-4 o-left-4 o-m-0 o-max-w-md o-rounded-full o-bg-slate-950 dark:o-bg-slate-950 o-px-2.5 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-100 dark:o-text-slate-100">
                    Note 214 — Le conseil d administration a l epreuve de la transmission
                  </p>
                  <a
                    href="#ecrire"
                    aria-label="Recevoir la note 214"
                    className="o-absolute o-bottom-4 o-right-4 o-inline-flex o-size-10 o-items-center o-justify-center o-rounded-full o-no-underline focus:o-ring"
                    style={aplat()}
                  >
                    <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                  </a>
                </Surgit>
              </div>
            </div>
          </div>
        </div>

        <main>
          {/*
            ----- Les chapitres --------------------------------------------------

            Quatre domaines, quatre etiquettes collantes. Les missions defilent a
            droite, et leur chiffre reste dans la marge.
          */}
          <section
            id="domaines"
            className="o-scroll-mt-24 o-px-6 o-pt-24 md:o-px-8 md:o-pt-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01" sombre={false}>
                  Les domaines
                </Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-3xl"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(2rem, 4.5vw, 4.25rem)',
                    ...TITRE,
                  }}
                >
                  Quatre sujets, et rien au-dela.
                </h2>
              </div>
              <Marge className="md:o-col-span-4 md:o-text-right">
                Trois dossiers par domaine
                <br />
                Nommes avec l accord ecrit du client
              </Marge>
            </div>
          </section>

          {DOMAINES.map((d, rang) => (
            <Fragment key={d.cle}>
              <div
                id={d.cle}
                className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-8 md:o-py-28"
              >
                <Chapitre
                  indice={`${d.numero} — ${String(rang + 1).padStart(2, '0')} / 04`}
                  largeur={4}
                  titre={
                    <h3
                      className="o-m-0"
                      style={{
                        ...affiche('m', 300),
                        fontSize: 'clamp(1.75rem, 3.2vw, 3rem)',
                        ...TITRE,
                      }}
                    >
                      {d.titre}
                    </h3>
                  }
                  texte={
                    <>
                      <span className="o-block o-text-slate-600 dark:o-text-slate-400">
                        {d.texte}
                      </span>
                      {d.citation !== undefined && (
                        <span
                          className="o-mt-8 o-block o-border-l o-pl-4"
                          style={{ borderColor: teinte() }}
                        >
                          <span
                            className="o-block o-text-base o-leading-snug o-text-slate-950 dark:o-text-slate-50"
                            style={{
                              fontFamily: 'var(--o-vitrine-affichage)',
                              fontWeight: 300,
                            }}
                          >
                            « {d.citation[0]} »
                          </span>
                          <span className={`o-mt-3 o-block ${NOTE}`}>
                            {d.citation[1]}
                          </span>
                        </span>
                      )}
                    </>
                  }
                >
                  <ol
                    className="o-m-0 o-list-none o-p-0"
                    style={{ borderBottom: `1px solid ${FILET}` }}
                  >
                    {d.missions.map((m) => (
                      <Dossier key={m.titre} mission={m} />
                    ))}
                  </ol>
                  {/* Apres le deuxieme chapitre, une photo qui derive et chevauche le suivant. */}
                  {rang === 1 && (
                    <figure
                      className="o-relative o-z-10 o-m-0 o-mt-16 md:o-ml-24"
                      style={{ marginBottom: 'calc(-7rem - 4vw)' }}
                    >
                      <ParallaxImage
                        src={photo('cadre-agence-bureau', 1600, 1000)}
                        alt="Une salle de reunion vide, table longue et lumiere de cote"
                        ratio={1.6}
                        strength={0.45}
                        className="o-overflow-hidden o-rounded-2xl"
                      />
                      <figcaption
                        className={`o-mt-3 ${NOTE} md:o-absolute md:o-left-0 md:o-top-0 md:o-mt-0 md:o-w-20`}
                        style={{ transform: 'translateX(calc(-100% - 1rem))' }}
                      >
                        Salle du conseil
                        <br />
                        rue de Marignan
                      </figcaption>
                    </figure>
                  )}
                </Chapitre>
              </div>
              {rang === 1 && <Coupe />}
            </Fragment>
          ))}

          {/*
            ----- Les associes, et les notes dans la marge ---------------------

            Les chiffres du cabinet ne forment pas une barre : ce sont des notes
            en mono, posees dans la colonne de gauche, en face des noms.
          */}
          <section
            id="associes"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-12">
              <div className="md:o-col-span-3">
                <Indice rang="02" sombre={false}>
                  Les associes
                </Indice>
                <dl className="o-m-0 o-mt-10 o-flex o-flex-col o-gap-5">
                  {NOTES_CABINET.map(([valeur, quoi]) => (
                    <div
                      key={quoi}
                      className="o-pt-4"
                      style={{ borderTop: `1px solid ${FILET}` }}
                    >
                      <dt
                        className="o-font-mono o-text-lg o-tabular-nums"
                        style={{ color: teinte() }}
                      >
                        {valeur}
                      </dt>
                      <dd className={`o-m-0 o-mt-1 ${NOTE}`}>{quoi}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="md:o-col-span-9">
                <h2
                  className="o-m-0 o-max-w-2xl"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(2rem, 4.5vw, 4.25rem)',
                    ...TITRE,
                  }}
                >
                  Quatre noms sur la plaque.
                </h2>
                <p className="o-mt-5 o-max-w-xl o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Un associe est present a chaque reunion de comite. C est la seule
                  promesse que nous ecrivons dans la lettre de mission.
                </p>
                <ul className="o-m-0 o-mt-14 o-list-none o-p-0">
                  {ASSOCIES.map((a) => {
                    const visage = portrait(a.graine, `${a.nom}, ${a.role}`)
                    return (
                      <li
                        key={a.nom}
                        className="o-grid o-gap-x-8 o-gap-y-4 o-py-8 md:o-grid-cols-12"
                        style={{ borderTop: `1px solid ${FILET}` }}
                      >
                        <div className="o-flex o-items-start o-gap-4 md:o-col-span-5">
                          <img
                            src={visage.src}
                            alt={visage.alt}
                            width={64}
                            height={64}
                            loading="lazy"
                            className="o-size-16 o-shrink-0 o-rounded-full o-object-cover"
                          />
                          <div>
                            <h3 className="o-m-0 o-text-2xl o-font-medium o-tracking-tight o-text-slate-950 dark:o-text-slate-50">
                              {a.nom}
                            </h3>
                            <Marge className="o-mt-1">{a.role}</Marge>
                          </div>
                        </div>
                        <p className="o-m-0 o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-col-span-4">
                          {a.bio}
                        </p>
                        <div className="md:o-col-span-3 md:o-text-right">
                          {a.notes.map((n) => (
                            <Marge key={n}>{n}</Marge>
                          ))}
                          <p className="o-m-0 o-mt-3 o-text-sm">
                            <Lien
                              href={`mailto:${a.courriel}`}
                              className="o-text-slate-950 dark:o-text-slate-50"
                            >
                              Ecrire
                            </Lien>
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </section>

          {/*
            ----- L appel : une adresse, en 64 px, soulignee --------------------
          */}
          <section
            id="ecrire"
            className="o-scroll-mt-24 o-flex o-min-h-screen o-flex-col o-justify-center o-px-6 o-py-24 md:o-px-8"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12">
              <Marge className="md:o-col-span-3">
                Un premier entretien d une heure,
                <br />
                sans facturation, avec un associe
              </Marge>
              <div className="o-min-w-0 md:o-col-span-9">
                <a
                  href="mailto:contact@verne-associes.fr"
                  className="o-inline-block o-max-w-full o-break-words o-no-underline focus:o-ring"
                  style={{
                    ...affiche('l', 300),
                    fontSize: 'clamp(1.6rem, 4.6vw, 4rem)',
                    color: teinte(40),
                  }}
                >
                  <UnderlineDraw thickness={3} duration={1100} color={encre()}>
                    contact@verne-associes.fr
                  </UnderlineDraw>
                  <Icon
                    icon={ArrowUpRight}
                    size={28}
                    aria-hidden="true"
                    className="o-ml-2 o-inline-block o-align-baseline"
                  />
                </a>
                <div className="o-mt-12 o-grid o-max-w-2xl o-gap-6 sm:o-grid-cols-2">
                  <div className="o-pt-4" style={{ borderTop: `1px solid ${FILET}` }}>
                    <Marge>Si le sujet est urgent</Marge>
                    <p className="o-m-0 o-mt-2 o-text-lg o-text-slate-950 dark:o-text-slate-50">
                      <a
                        href="tel:+33142660412"
                        className="o-no-underline o-text-current focus:o-ring"
                      >
                        01 42 66 04 12
                      </a>
                    </p>
                    <p className="o-m-0 o-mt-1 o-text-sm o-text-slate-600 dark:o-text-slate-400">
                      Un associe repond de 8 h a 20 h, du lundi au vendredi.
                    </p>
                  </div>
                  <div className="o-pt-4" style={{ borderTop: `1px solid ${FILET}` }}>
                    <Marge>Avant tout entretien</Marge>
                    <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                      Nous verifions l absence de conflit d interets sur cinq ans. S il en
                      existe un, nous le disons, et nous donnons deux autres noms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/*
          ----- Le pied : un tableau a filets, style documentation --------------
        */}
        <footer
          className="o-px-6 o-pb-10 o-pt-14 md:o-px-8"
          style={{ borderTop: `1px solid ${FILET_FORT}` }}
        >
          <div className="o-grid o-gap-x-12 o-gap-y-8 md:o-grid-cols-12">
            <div className="md:o-col-span-3">
              <p className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-slate-950 dark:o-text-slate-50">
                Verne &amp; Associes
              </p>
              <Marge className="o-mt-2">
                Cabinet de conseil de direction
                <br />
                Colophon
              </Marge>
            </div>
            <dl className="o-m-0 md:o-col-span-9">
              {COLOPHON.map(([terme, valeur]) => (
                <div
                  key={terme}
                  className="o-grid o-gap-x-6 o-gap-y-1 o-py-3 sm:o-grid-cols-12"
                  style={{ borderTop: `1px solid ${FILET}` }}
                >
                  <dt className={`sm:o-col-span-4 ${NOTE}`}>{terme}</dt>
                  <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-700 dark:o-text-slate-300 sm:o-col-span-8">
                    {valeur}
                  </dd>
                </div>
              ))}
              <div
                className="o-grid o-gap-x-6 o-gap-y-1 o-py-3 sm:o-grid-cols-12"
                style={{
                  borderTop: `1px solid ${FILET}`,
                  borderBottom: `1px solid ${FILET}`,
                }}
              >
                <dt className={`sm:o-col-span-4 ${NOTE}`}>Liens</dt>
                <dd className="o-m-0 o-flex o-flex-wrap o-gap-x-6 o-gap-y-2 o-text-sm sm:o-col-span-8">
                  {(
                    [
                      'Mentions legales',
                      'Donnees personnelles',
                      'Code de deontologie',
                      'Accessibilite : partiellement conforme',
                    ] as const
                  ).map((l) => (
                    <Lien
                      key={l}
                      href="#haut"
                      className="o-text-slate-700 dark:o-text-slate-300"
                    >
                      {l}
                    </Lien>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
          <p className={`o-mt-8 o-flex o-flex-wrap o-justify-between o-gap-4 ${NOTE}`}>
            <span>© 2026 Verne &amp; Associes SAS</span>
            <span>Paris — Lyon — Nantes</span>
          </p>
        </footer>
      </div>
    </Porte>
  )
}
