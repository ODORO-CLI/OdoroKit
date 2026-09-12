/**
 * Barreau — cabinet d avocats.
 *
 * ## Le parti pris — la seule question qu on pose vraiment a un avocat
 *
 * Un cabinet d avocats met en ligne ses domaines, ses associes et une adresse.
 * Il ne repond jamais a la question que pose le client des la premiere minute :
 * **combien de temps ?** Cette page en fait son mecanisme. On choisit une
 * procedure et une date de depot, et la page dessine la frise des delais
 * jusqu a la decision — chaque etape a sa date calculee, et les delais couperets
 * y sont distingues des delais indicatifs, parce que rater les premiers coute
 * le dossier et rater les seconds ne coute qu une audience de renvoi.
 *
 * Le calcul est honnete : les delais sont ecrits a la main, en jours, d apres
 * ce qu on observe en pratique ; la page ne fait qu additionner et poser les
 * dates. Elle dit aussi ce qu elle ne sait pas — un renvoi, une expertise qui
 * s allonge — au lieu de promettre une duree.
 *
 * ## Le fond, le mouvement, les coupes
 *
 * F-statique : du papier regle, dessine en gradients, sous le bloc-titre
 * seulement ; rien ne bouge derriere le texte. La signature est M-chapitres :
 * les trois poles restent poses a gauche pendant que leurs dossiers defilent.
 * Une bande sombre coupe la page claire au milieu : elle ne porte pas un
 * manifeste de plus, mais **l echelle verticale des durees** — la forme de
 * chiffres attribuee a cette page.
 *
 * ## Les formes
 *
 * A22 — une question unique, trois reponses, trois adresses, en triptyque.
 * P18 — un ours de journal, trois colonnes de chasse fixe.
 * C15 — une echelle verticale graduee, les valeurs posees dessus.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, Scale } from '@odoro-cli/icons/filaire'
import { Fragment, useId, useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { Frame } from '@/odoro/image/Frame.jsx'
import { BlurWords } from '@/odoro/text/BlurWords.jsx'
import { AnimatedList } from '@/odoro/ui/AnimatedList.jsx'
import { PillTabs } from '@/odoro/ui/PillTabs.jsx'

import { nuit } from './communs.jsx'
import { photo } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Actions, affiche, BarreCoins, Etiquette, Indice, Porte, Surgit, TitreVague, usePolices, Accent } from './marche.jsx'
import { Chapitre } from './scene.jsx'

/* ========================= Les constantes de dessin ===================== */

/** Le filet de la page, tire de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 16%, transparent)'

/** Le filet appuye : celui qui ferme une zone. */
const FILET_FORT = 'color-mix(in oklab, currentColor 40%, transparent)'

/** La voix mono des notes de marge. */
const NOTE = 'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400'

/** La meme voix, sur la bande toujours sombre. */
const NOTE_SUR_NUIT = 'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400'

/**
 * Le papier regle du bloc-titre, dessine en gradients.
 *
 * Ni image ni canevas : deux degrades repetes suffisent a decrire un papier a
 * lignes, et le compositeur les dessine sans qu un octet soit telecharge. La
 * reglure suit l encre courante, donc elle s inverse avec le theme sans qu on
 * ait a ecrire deux valeurs.
 */
const PAPIER: CSSProperties = {
  backgroundImage: [
    'repeating-linear-gradient(to bottom, transparent 0 31px, color-mix(in oklab, currentColor 9%, transparent) 31px 32px)',
    'linear-gradient(to right, transparent 0 78px, color-mix(in oklab, currentColor 18%, transparent) 78px 79px, transparent 79px)',
  ].join(','),
  maskImage: 'linear-gradient(to bottom, black, black 34%, transparent 82%)',
  WebkitMaskImage: 'linear-gradient(to bottom, black, black 34%, transparent 82%)',
}

/** Les liens de la barre en coins. */
const NAVIGATION = [
  ['#procedure', 'Les delais'],
  ['#poles', 'Les poles'],
  ['#ordre', 'Le tableau'],
  ['#ouvrir', 'Ouvrir un dossier'],
] as const

/* ========================= Le mecanisme : la procedure ================== */

/** Une etape d une procedure : son delai depuis la precedente, et sa nature. */
interface Etape {
  readonly titre: string
  /**
   * Le libelle court, porte par la frise.
   *
   * Les arrets sont poses a leur vraie place dans le temps : deux etapes
   * separees de deux semaines se touchent donc sur le dessin. Un titre entier
   * y chevaucherait son voisin, alors qu il se lit tres bien dans la liste
   * juste dessous. La figure prend le mot, la liste garde la phrase.
   */
  readonly court: string
  /** Jours ecoules depuis l etape precedente. */
  readonly jours: number
  /**
   * Le delai couperet, quand il y en a un.
   *
   * Un couperet se compte a peine de forclusion : passe, l action est perdue,
   * et aucune diligence ne la rattrape. Le distinguer d un delai indicatif est
   * la seule chose qui compte vraiment sur une frise de procedure.
   */
  readonly couperet?: string
  readonly note: string
}

/** Une procedure, avec sa juridiction et ses etapes. */
interface Procedure {
  readonly id: string
  readonly libelle: string
  readonly juridiction: string
  readonly quoi: string
  readonly etapes: readonly Etape[]
  /** Ce que la page ne sait pas promettre, et qu elle ecrit quand meme. */
  readonly reserve: string
}

/**
 * Les trois procedures, ecrites a la main.
 *
 * Les delais sont ceux qu on observe, pas ceux que le code annonce : un bureau
 * de jugement se tient rarement au quantieme prevu. C est pourquoi chaque
 * procedure porte sa reserve, et pourquoi la page ecrit « mediane » et jamais
 * « garanti ».
 */
const PROCEDURES: readonly Procedure[] = [
  {
    id: 'prudhommes',
    libelle: 'Licenciement',
    juridiction: 'Conseil de prud hommes de Paris',
    quoi: 'Contestation d un licenciement pour motif personnel, demande d indemnite.',
    reserve:
      'Un renvoi en bureau de jugement ajoute de trois a cinq mois. La departition, quand les conseillers ne departagent pas, en ajoute autant.',
    etapes: [
      {
        titre: 'Saisine du conseil',
        court: 'Saisine',
        jours: 0,
        couperet: 'Douze mois a compter de la notification du licenciement',
        note: 'Requete deposee au greffe, avec les pieces. C est la date qui fixe tout le reste.',
      },
      { titre: 'Convocation des parties', court: 'Convocation', jours: 21, note: 'Par lettre recommandee, avec la date du bureau de conciliation.' },
      { titre: 'Bureau de conciliation et d orientation', court: 'Conciliation', jours: 75, note: 'Une audience courte. Elle oriente le dossier et fixe le calendrier des echanges.' },
      { titre: 'Echange des pieces et conclusions', court: 'Conclusions', jours: 120, note: 'Deux tours, parfois trois. C est la partie ou un dossier se gagne.' },
      { titre: 'Audience de jugement', court: 'Audience', jours: 210, note: 'Quatre conseillers, deux heures de plaidoirie pour les deux parties reunies.' },
      { titre: 'Delibere', court: 'Delibere', jours: 45, note: 'Mis en delibere a une date annoncee a l audience, tenue une fois sur deux.' },
      { titre: 'Notification du jugement', court: 'Notification', jours: 14, note: 'Par le greffe, en recommande. Le delai d appel court a partir de la reception.' },
      { titre: 'Fin du delai d appel', court: 'Appel', jours: 30, couperet: 'Un mois a compter de la notification', note: 'Passe ce jour, le jugement est definitif pour celui qui n a pas releve appel.' },
    ],
  },
  {
    id: 'bail',
    libelle: 'Bail commercial',
    juridiction: 'Tribunal judiciaire de Paris',
    quoi: 'Refus de renouvellement, et fixation de l indemnite d eviction.',
    reserve:
      'L expertise est le poste le plus incertain : un expert charge rend son rapport en huit mois, un expert disponible en cinq.',
    etapes: [
      {
        titre: 'Signification du conge',
        court: 'Conge',
        jours: 0,
        couperet: 'Six mois avant l echeance du bail, par acte de commissaire de justice',
        note: 'Un conge signifie hors delai ne vaut rien : le bail se renouvelle de plein droit.',
      },
      { titre: 'Assignation en fixation', court: 'Assignation', jours: 60, note: 'Devant le juge des loyers commerciaux, avec la demande d expertise.' },
      { titre: 'Premiere mise en etat', court: 'Mise en etat', jours: 45, note: 'Le calendrier de procedure est arrete ; les parties s y tiennent ou s expliquent.' },
      { titre: 'Expertise ordonnee', court: 'Expertise', jours: 90, note: 'Un expert est designe, une consignation est mise a la charge du demandeur.' },
      { titre: 'Depot du rapport', court: 'Rapport', jours: 240, note: 'Visite des lieux, dires des parties, pre-rapport, puis rapport definitif.' },
      { titre: 'Plaidoiries', court: 'Plaidoiries', jours: 75, note: 'Les conclusions apres rapport sont echangees, puis l affaire est plaidee.' },
      { titre: 'Jugement', court: 'Jugement', jours: 60, note: 'L indemnite est fixee, souvent entre le chiffre de l expert et celui du bailleur.' },
      { titre: 'Fin du delai d appel', court: 'Appel', jours: 30, couperet: 'Un mois a compter de la signification', note: 'Le droit d option du bailleur se rejoue ensuite, dans un delai propre.' },
    ],
  },
  {
    id: 'administratif',
    libelle: 'Recours administratif',
    juridiction: 'Tribunal administratif de Paris',
    quoi: 'Recours pour exces de pouvoir contre une decision d une administration.',
    reserve:
      'La cloture de l instruction peut tomber plus tot que prevu : un memoire depose apres elle n est pas lu, et rien n oblige le juge a la rouvrir.',
    etapes: [
      {
        titre: 'Recours gracieux',
        court: 'Gracieux',
        jours: 0,
        couperet: 'Deux mois a compter de la notification de la decision',
        note: 'Facultatif, mais il conserve le delai : c est presque toujours le bon reflexe.',
      },
      { titre: 'Rejet implicite', court: 'Rejet', jours: 60, note: 'Le silence garde deux mois par l administration vaut decision de rejet.' },
      {
        titre: 'Requete introductive',
        court: 'Requete',
        jours: 60,
        couperet: 'Deux mois a compter du rejet, expres ou implicite',
        note: 'Deposee par voie electronique, avec la decision attaquee et les moyens.',
      },
      { titre: 'Communication au defendeur', court: 'Communication', jours: 30, note: 'Le greffe transmet ; l administration a un delai pour repondre, souvent proroge.' },
      { titre: 'Memoire en defense', court: 'Defense', jours: 90, note: 'Puis replique. Deux echanges suffisent dans la plupart des dossiers.' },
      { titre: 'Cloture de l instruction', court: 'Cloture', jours: 120, note: 'Trois jours francs avant l audience, ou a la date fixee par ordonnance.' },
      { titre: 'Audience', court: 'Audience', jours: 45, note: 'Conclusions du rapporteur public, puis une breve intervention des avocats.' },
      { titre: 'Jugement', court: 'Jugement', jours: 21, note: 'Lu au plus tard quinze jours apres l audience, notifie dans la foulee.' },
    ],
  },
]

/** La date de depot posee au premier affichage : la page reste reproductible. */
const DEPOT_PAR_DEFAUT = '2026-03-02'

/** Une date ISO decalee de `jours`, rendue au format francais. */
function dateDecalee(depart: string, jours: number): string {
  const base = Date.parse(`${depart}T00:00:00Z`)
  if (Number.isNaN(base)) return '—'
  const quand = new Date(base + jours * 86_400_000)
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(quand)
}

/** Les etapes cumulees : pour chacune, les jours ecoules depuis le depot. */
function cumuler(etapes: readonly Etape[]): readonly { readonly etape: Etape; readonly cumul: number }[] {
  let cumul = 0
  return etapes.map((etape) => {
    cumul += etape.jours
    return { etape, cumul }
  })
}

/** La duree totale d une procedure, en jours. */
function duree(procedure: Procedure): number {
  return procedure.etapes.reduce((somme, etape) => somme + etape.jours, 0)
}

/** L abscisse d une etape sur la frise, dans le repere du dessin. */
function abscisse(cumul: number, total: number): number {
  return 64 + (total === 0 ? 0 : cumul / total) * 872
}

/**
 * La frise des delais, dessinee.
 *
 * Les etapes sont posees a leur vraie place dans le temps, pas a intervalle
 * regulier : c est tout l interet de la figure. On y voit d un coup d oeil que
 * l expertise mange la moitie d une procedure de bail, et que les deux delais
 * couperets d un recours administratif tombent au tout debut.
 */
function Frise({ procedure, depot }: { readonly procedure: Procedure; readonly depot: string }): ReactElement {
  const total = duree(procedure)
  const arrets = cumuler(procedure.etapes)
  const encreAccent = encre()
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }

  return (
    <svg viewBox="0 0 1000 332" role="img" aria-label={`Frise des delais — ${procedure.libelle}`} className="o-w-full" style={{ minWidth: 860 }}>
      {/* La regle des mois, au-dessus : elle donne l echelle du rail. */}
      {Array.from({ length: Math.floor(total / 30) + 1 }, (_, mois) => {
        const x = abscisse(mois * 30, total)
        const annuel = mois % 6 === 0
        return (
          <g key={mois}>
            <line x1={x} y1={annuel ? 34 : 40} x2={x} y2="48" stroke="currentColor" strokeWidth="1" opacity={annuel ? 0.7 : 0.3} style={gris} />
            {annuel && (
              <text x={x} y="26" textAnchor="middle" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
                {mois === 0 ? 'depot' : `${String(mois)} mois`}
              </text>
            )}
          </g>
        )
      })}

      {/* Le rail. */}
      <line x1="64" y1="70" x2="936" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.35" style={gris} />

      {/*
        Les cartouches sont repartis sur quatre bandes successives. Avec deux
        seulement, deux etapes separees de deux semaines — un delibere et sa
        notification — se recouvraient : leur abscisse est proportionnelle au
        temps, et le temps ne s ecarte pas pour arranger la mise en page.
      */}
      {arrets.map(({ etape, cumul }, rang) => {
        const x = abscisse(cumul, total)
        const yTexte = 104 + (rang % 4) * 52
        const couperet = etape.couperet !== undefined
        // Aux deux bords, le cartouche s aligne au lieu de se centrer : centre,
        // il sortirait du repere et serait coupe par la boite du dessin.
        const ancre = x < 108 ? 'start' : x > 892 ? 'end' : 'middle'
        return (
          <g key={etape.titre}>
            {/* Le tirant qui relie l arret a son cartouche. */}
            <line
              x1={x}
              y1="78"
              x2={x}
              y2={yTexte - 14}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray={couperet ? undefined : '3 4'}
              opacity="0.45"
              style={gris}
            />
            {couperet ? (
              <rect x={x - 5} y="63" width="10" height="14" rx="1.5" fill={encreAccent} />
            ) : (
              <circle cx={x} cy="70" r="5" fill="var(--o-theme-bg)" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
            )}
            <text x={x} y={yTexte} textAnchor={ancre} fontSize="13" fill="currentColor">
              {etape.court}
            </text>
            <text
              x={x}
              y={yTexte + 16}
              textAnchor={ancre}
              className="o-font-mono"
              fontSize="10"
              fill="currentColor"
              style={couperet ? { color: encreAccent } : gris}
            >
              {`${dateDecalee(depot, cumul)} · ${cumul === 0 ? 'J' : `J+${String(cumul)}`}`}
            </text>
          </g>
        )
      })}

      {/* La borne de duree, sous les quatre bandes. */}
      <text x="500" y="298" textAnchor="middle" className="o-font-mono" fontSize="11" fill="currentColor" style={{ color: encreAccent }}>
        {`${String(total)} jours — soit ${String(Math.round((total / 30.4) * 10) / 10).replace('.', ',')} mois de mediane`}
      </text>
      <path d="M64 314h872M72 309l-8 5 8 5M928 309l8 5-8 5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" style={gris} />
    </svg>
  )
}

/**
 * Le mecanisme : on choisit une procedure et une date, la frise se refait.
 *
 * Tout est derive de deux etats — l onglet et la date — et rien n est stocke en
 * double : les dates affichees sont recalculees a chaque rendu a partir des
 * memes jours cumules que la figure emploie pour placer ses arrets.
 */
function LaProcedure(): ReactElement {
  const [id, setId] = useState(PROCEDURES[0]?.id ?? '')
  const [depot, setDepot] = useState(DEPOT_PAR_DEFAUT)
  const champ = useId()

  const procedure = PROCEDURES.find((p) => p.id === id) ?? PROCEDURES[0]
  const arrets = useMemo(() => (procedure === undefined ? [] : cumuler(procedure.etapes)), [procedure])
  if (procedure === undefined) return <></>
  const total = duree(procedure)
  const couperets = procedure.etapes.filter((e) => e.couperet !== undefined)

  return (
    <div>
      <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
        <div className="o-min-w-0">
          <p className={`o-m-0 o-mb-3 ${NOTE}`}>La procedure</p>
          {/*
            La barre d onglets est en `inline-flex` : a 380 px elle pousse la
            page si rien ne la contient. Elle defile donc de cote, et declare
            `overflow-y: hidden` explicitement — sinon la cascade met les deux
            axes a `auto` et la bande avale la molette.

            La pastille est repeinte : par defaut son encre est claire sur un
            aplat de marque, ce qui se lit bien mais qu aucune mesure de
            contraste ne peut verifier, l aplat n etant pas un ancetre du
            texte. Ici l encre est celle du theme, et la pastille un accent
            adouci : le rapport tient sur la page comme sur la pastille.
          */}
          <div className="o-min-w-0 o-overflow-x-auto o-pb-1" style={{ overflowY: 'hidden' }}>
            <PillTabs
              items={PROCEDURES.map((p) => ({ id: p.id, label: p.libelle }))}
              value={id}
              onValueChange={setId}
              label="Choisir une procedure"
              style={{ '--o-pill-fill': accentDoux(400, 52), '--o-pill-ink': 'var(--o-theme-fg)' } as CSSProperties}
            />
          </div>
        </div>
        <div>
          <label htmlFor={champ} className={`o-block o-mb-3 ${NOTE}`}>
            Date du depot
          </label>
          <input
            id={champ}
            type="date"
            value={depot}
            onChange={(evenement) => {
              setDepot(evenement.target.value)
            }}
            className="o-rounded-full o-border-w-1 o-bg-transparent o-px-5 o-py-2.5 o-font-mono o-text-sm o-tabular-nums focus:o-ring"
            style={{ borderColor: FILET_FORT }}
          />
        </div>
      </div>

      <p className="o-mt-8 o-max-w-2xl o-text-lg o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
        {procedure.quoi} <span className="o-text-stone-950 dark:o-text-stone-50">{procedure.juridiction}.</span>
      </p>

      {/*
        La frise defile de cote sur un ecran etroit. Elle declare
        `overflow-y: hidden` explicitement : sans cela la cascade met les deux
        axes a `auto`, la bande avale la molette et la page se fige sous le
        pointeur.
      */}
      <div className="o-mt-10 o-min-w-0 o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
        <Frise procedure={procedure} depot={depot} />
      </div>

      <div className="o-mt-10 o-grid o-gap-10 lg:o-grid-cols-12">
        {/* Les couperets, seuls, a gauche : ce sont eux qui coutent un dossier. */}
        <div className="o-min-w-0 lg:o-col-span-4">
          <p className={`o-m-0 ${NOTE}`} style={{ color: encre() }}>
            Les delais couperets
          </p>
          <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-col o-gap-6 o-p-0">
            {couperets.map((e) => (
              <li key={e.titre} className="o-pl-4" style={{ borderLeft: `2px solid ${encre()}` }}>
                <p className="o-m-0 o-text-base o-font-medium o-text-stone-950 dark:o-text-stone-50">{e.titre}</p>
                <p className="o-m-0 o-mt-1 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">{e.couperet}</p>
              </li>
            ))}
          </ul>
          <p className="o-mt-8 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
            <span className="o-text-stone-950 dark:o-text-stone-50">Ce que la frise ne sait pas. </span>
            {procedure.reserve}
          </p>
        </div>

        {/* Le detail, a droite : une ligne par etape, la date dans la marge. */}
        <ol className="o-m-0 o-min-w-0 o-list-none o-p-0 lg:o-col-span-8">
          {arrets.map(({ etape, cumul }, rang) => (
            <li key={etape.titre} className="o-grid o-gap-x-6 o-gap-y-1 o-py-5 sm:o-grid-cols-12" style={{ borderTop: `1px solid ${FILET}` }}>
              <p className="o-m-0 o-font-mono o-text-xs o-tabular-nums sm:o-col-span-1" style={{ color: encre() }}>
                {String(rang + 1).padStart(2, '0')}
              </p>
              <div className="o-min-w-0 sm:o-col-span-7">
                <p className="o-m-0 o-text-base o-font-medium o-text-stone-950 dark:o-text-stone-50">{etape.titre}</p>
                <p className="o-m-0 o-mt-1 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">{etape.note}</p>
              </div>
              <p className={`o-m-0 sm:o-col-span-4 sm:o-text-right ${NOTE}`}>
                {dateDecalee(depot, cumul)}
                <br />
                {cumul === 0 ? 'jour du depot' : `J+${String(cumul)}`}
              </p>
            </li>
          ))}
          <li className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-py-6" style={{ borderTop: `1px solid ${FILET_FORT}` }}>
            <span className={NOTE}>Du depot a la decision definitive</span>
            <span className="o-tabular-nums o-text-stone-950 dark:o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)' }}>
              {String(total)} jours
            </span>
          </li>
        </ol>
      </div>
    </div>
  )
}

/* ========================= C15 : l echelle verticale ==================== */

/** Les durees portees par l echelle, en mois, avec ce qu elles mesurent. */
const ECHELLE: readonly { readonly mois: number; readonly quoi: string; readonly detail: string }[] = PROCEDURES.map((p) => ({
  mois: Math.round((duree(p) / 30.4) * 10) / 10,
  quoi: p.libelle,
  detail: p.juridiction,
}))

/** La graduation de l echelle, en mois. */
const HAUT_ECHELLE = 24

/** L ordonnee d une valeur sur l echelle, dans le repere du dessin. */
function ordonnee(mois: number): number {
  return 30 + (1 - Math.min(mois, HAUT_ECHELLE) / HAUT_ECHELLE) * 320
}

/**
 * L echelle verticale graduee, dans la bande sombre.
 *
 * Une barre de quatre nombres aurait dit « 17, 20, 14 » sans qu on sache de
 * quoi il s agit. Posees sur une echelle commune, les trois durees se comparent
 * d un coup d oeil, et la mediane du barreau — treize mois — donne le repere
 * qui manque a tout le reste.
 */
function EchelleDurees(): ReactElement {
  const gris: CSSProperties = { color: 'var(--o-palette-stone-400)' }
  const encreNuit = encreSurSombre()
  return (
    <svg viewBox="0 0 620 390" role="img" aria-label="Echelle des durees, en mois" className="o-w-full" style={{ minWidth: 520 }}>
      {/* L axe et ses graduations, tous les trois mois. */}
      <line x1="70" y1="24" x2="70" y2="356" stroke="currentColor" strokeWidth="1.2" opacity="0.6" style={gris} />
      {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((mois) => (
        <g key={mois}>
          <line x1={mois % 6 === 0 ? 60 : 65} y1={ordonnee(mois)} x2="70" y2={ordonnee(mois)} stroke="currentColor" strokeWidth="1" opacity={mois % 6 === 0 ? 0.8 : 0.4} style={gris} />
          {mois % 6 === 0 && (
            <text x="52" y={ordonnee(mois) + 4} textAnchor="end" className="o-font-mono" fontSize="11" fill="currentColor" style={gris}>
              {mois}
            </text>
          )}
        </g>
      ))}
      <text x="52" y="16" textAnchor="end" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        mois
      </text>

      {/* La mediane du barreau : le repere contre lequel tout se lit. */}
      <line x1="70" y1={ordonnee(13)} x2="600" y2={ordonnee(13)} stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.55" style={gris} />
      <text x="600" y={ordonnee(13) - 8} textAnchor="end" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        mediane du barreau — 13 mois
      </text>

      {/* Les trois durees, posees sur l echelle. */}
      {ECHELLE.map((ligne, rang) => {
        const x = 150 + rang * 152
        const y = ordonnee(ligne.mois)
        return (
          <g key={ligne.quoi}>
            <line x1={x} y1={ordonnee(0)} x2={x} y2={y} stroke={encreNuit} strokeWidth="2" opacity="0.5" />
            <circle cx={x} cy={y} r="5.5" fill={encreNuit} />
            <text x={x} y={y - 30} textAnchor="middle" fontSize="30" fill="currentColor" style={{ color: encreNuit, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {String(ligne.mois).replace('.', ',')}
            </text>
            <text x={x} y={y - 14} textAnchor="middle" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
              mois
            </text>
            <text x={x} y={ordonnee(0) + 22} textAnchor="middle" fontSize="13" fill="currentColor">
              {ligne.quoi}
            </text>
          </g>
        )
      })}
      <line x1="70" y1={ordonnee(0)} x2="600" y2={ordonnee(0)} stroke="currentColor" strokeWidth="1" opacity="0.5" style={gris} />
    </svg>
  )
}

/* ========================= Les poles (M-chapitres) ===================== */

/** Un dossier recent, tel qu il se cite sans nommer personne. */
interface Dossier {
  readonly annee: string
  readonly titre: string
  readonly devant: string
  readonly issue: string
}

/** Un pole du cabinet, avec ses dossiers. */
interface Pole {
  readonly cle: string
  readonly numero: string
  readonly titre: string
  readonly texte: string
  readonly dossiers: readonly Dossier[]
}

/** Les trois poles, et les dossiers qui les tiennent. */
const POLES: readonly Pole[] = [
  {
    cle: 'travail',
    numero: 'I',
    titre: 'Droit du travail',
    texte:
      'Cote salarie comme cote employeur, jamais les deux dans la meme entreprise. Licenciements, ruptures conventionnelles contestees, harcelement, plans de sauvegarde.',
    dossiers: [
      { annee: '2026', titre: 'Licenciement pour insuffisance professionnelle apres quinze ans d anciennete', devant: 'Prud hommes, section encadrement', issue: 'Requalification sans cause reelle, vingt mois de salaire.' },
      { annee: '2025', titre: 'Contestation d un plan de sauvegarde de l emploi par le comite social', devant: 'Tribunal administratif', issue: 'Homologation annulee ; le plan a ete renegocie sur six mois.' },
      { annee: '2025', titre: 'Harcelement moral etabli par un faisceau de courriels', devant: 'Prud hommes puis cour d appel', issue: 'Nullite du licenciement et reintegration demandee, obtenue en appel.' },
    ],
  },
  {
    cle: 'affaires',
    numero: 'II',
    titre: 'Droit des affaires',
    texte:
      'Baux commerciaux, cession de fonds, pactes d associes, ruptures brutales de relations etablies. Nous plaidons ce que nous avons redige, ou nous le disons.',
    dossiers: [
      { annee: '2026', titre: 'Refus de renouvellement d un bail de restaurant, quartier central', devant: 'Juge des loyers commerciaux', issue: 'Indemnite d eviction fixee a 1,4 fois le chiffre du dernier exercice.' },
      { annee: '2025', titre: 'Rupture brutale d une relation commerciale de onze ans', devant: 'Tribunal de commerce', issue: 'Preavis de dix-huit mois juge necessaire ; dommages alloues sur cette base.' },
      { annee: '2024', titre: 'Execution forcee d un pacte d associes sur une clause de sortie', devant: 'Tribunal de commerce, refere', issue: 'Cession ordonnee sous astreinte, au prix de la formule du pacte.' },
    ],
  },
  {
    cle: 'public',
    numero: 'III',
    titre: 'Droit public',
    texte:
      'Marches publics, urbanisme, fonction publique. Le delai de recours est de deux mois et il ne se negocie pas : c est le seul domaine ou nous refusons un dossier sur la date.',
    dossiers: [
      { annee: '2026', titre: 'Refere precontractuel sur un marche de travaux de voirie', devant: 'Tribunal administratif', issue: 'Procedure annulee au stade de l analyse des offres, remise en concurrence.' },
      { annee: '2025', titre: 'Recours contre un permis de construire en zone protegee', devant: 'Tribunal administratif', issue: 'Permis annule pour insuffisance de l etude d impact.' },
      { annee: '2024', titre: 'Contestation d une sanction disciplinaire dans la fonction publique', devant: 'Tribunal administratif', issue: 'Sanction ramenee du quatrieme au deuxieme groupe.' },
    ],
  },
]

/* ========================= Le tableau de l ordre ======================= */

/** Les avocats du cabinet, dans l ordre d inscription au tableau. */
const TABLEAU: readonly { readonly id: string; readonly label: string; readonly hint: string }[] = [
  { id: 'lecointre', label: 'Claire Lecointre', hint: 'Inscrite en 1998 — travail, specialisation certifiee' },
  { id: 'toussaint', label: 'Ivan Toussaint', hint: 'Inscrit en 2004 — affaires, ancien juge consulaire' },
  { id: 'berthaut', label: 'Nadia Berthaut', hint: 'Inscrite en 2011 — public, urbanisme et marches' },
  { id: 'ferrand', label: 'Come Ferrand', hint: 'Inscrit en 2019 — collaborateur, travail et affaires' },
]

/* ========================= A22 : la question unique ==================== */

/** Les trois reponses, et les trois adresses ou elles menent. */
const REPONSES: readonly { readonly numero: string; readonly reponse: string; readonly quoi: string; readonly adresse: string }[] = [
  {
    numero: 'I',
    reponse: 'Rien n est encore parti',
    quoi: 'Le moment ou un avocat sert le plus, et celui ou on l appelle le moins. Une heure de conseil evite souvent la procedure entiere.',
    adresse: 'conseil@barreau-cabinet.fr',
  },
  {
    numero: 'II',
    reponse: 'C est nous qui attaquons',
    quoi: 'Nous verifions d abord le delai, ensuite les preuves, et seulement apres l opportunite. Dans cet ordre, jamais un autre.',
    adresse: 'dossiers@barreau-cabinet.fr',
  },
  {
    numero: 'III',
    reponse: 'Nous venons d etre assignes',
    quoi: 'Un acte signifie fait courir une horloge. Envoyez-le tel quel, meme photographie : la date de signification suffit a nous mettre au travail.',
    adresse: 'urgence@barreau-cabinet.fr',
  },
]

/* ========================= L ours du pied (P18) ======================== */

/** Les trois colonnes de l ours, de chasse fixe. */
const OURS: readonly { readonly titre: string; readonly lignes: readonly ReactNode[] }[] = [
  {
    titre: 'Le cabinet',
    lignes: [
      'Barreau — association d avocats a responsabilite professionnelle individuelle (AARPI), inscrite au barreau de Paris.',
      '14 rue de la Grange-Bateliere, 75009 Paris. Telephone 01 44 83 27 60. Bureau secondaire a Bordeaux, 9 cours du Chapeau-Rouge.',
      'SIREN 812 447 093 — TVA intracommunautaire FR 61 812 447 093 — APE 6910Z.',
    ],
  },
  {
    titre: 'L ordre et la deontologie',
    lignes: [
      'Ordre des avocats de Paris, 11 place Dauphine. Reglement interieur national et reglement interieur du barreau de Paris applicables a tous nos actes.',
      'Assurance de responsabilite civile professionnelle et garantie de representation des fonds souscrites par l ordre, pour tous les avocats du cabinet.',
      'Maniement de fonds par la CARPA exclusivement. Aucun paiement direct sur un compte du cabinet, en aucune circonstance.',
    ],
  },
  {
    titre: 'Le lecteur',
    lignes: [
      'Honoraires fixes par convention ecrite avant toute diligence : taux horaire, forfait, ou honoraire de resultat complementaire. Le devis est gratuit et engage le cabinet.',
      'Reclamation : le mediateur de la consommation de la profession d avocat, 180 boulevard Haussmann, 75008 Paris, peut etre saisi apres une reclamation ecrite restee sans reponse.',
      'Donnees conservees cinq ans apres la cloture du dossier, ni cedees ni prospectees. Site partiellement conforme au referentiel general d amelioration de l accessibilite.',
    ],
  },
]

/* ========================= La vitrine ================================== */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')

  return (
    <Porte forme="trou" marque="Barreau" sombre={false}>
      <div className="o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-800 dark:o-text-stone-200" style={polices}>
        {/*
          ----- Le bloc-titre, de gouttiere a gouttiere — Forma --------------

          Le papier regle ne tient que sous cette zone : un masque l efface
          avant la premiere section. Rien ne bouge derriere le texte.
        */}
        <div id="haut" className="o-relative o-isolate o-overflow-hidden">
          <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0" style={PAPIER} />

          <div className="o-relative o-z-10 o-flex o-min-h-screen o-flex-col">
            <BarreCoins marque="Barreau" liens={NAVIGATION} droite="Paris — Bordeaux" sombre={false} />

            <div className="o-flex o-grow o-flex-col o-justify-between o-gap-10 o-px-6 o-pb-8 o-pt-6 md:o-px-8">
              <div className="o-grid o-gap-8 md:o-grid-cols-12">
                <div className="o-min-w-0 md:o-col-span-8">
                  <Surgit>
                    <Etiquette sombre={false}>Barreau de Paris — quatre avocats, trois poles</Etiquette>
                  </Surgit>
                  <TitreVague
                    delai={120}
                    className="o-m-0 o-mt-6 o-max-w-4xl o-text-stone-950 dark:o-text-stone-50"
                    style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 5.6vw, 5.75rem)' }}
                  >
                    Combien de temps ? Nous repondons avant de repondre au reste.
                  </TitreVague>
                </div>
                <Surgit delai={420} className="o-flex o-flex-col o-justify-end o-gap-6 md:o-col-span-4">
                  <p className="o-m-0 o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                    Trois procedures, leurs delais reels, et la difference entre ce qui se rattrape et ce qui se perd. Le reste — les
                    dossiers, le tableau, l adresse — vient <Accent>apres</Accent>.
                  </p>
                  <Actions
                    sombre={false}
                    pleine={[
                      '#procedure',
                      <>
                        Voir la frise <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['#ouvrir', 'Ouvrir un dossier']}
                  />
                </Surgit>
              </div>

              {/* La rangee de bas de cadre — Forma : trois blocs inegaux. */}
              <div className="o-grid o-gap-4 md:o-grid-cols-12">
                <Surgit delai={540} className="o-flex o-min-w-0 o-flex-col o-justify-between o-rounded-2xl o-border-w-1 o-border-black-10 o-bg-white o-p-6 dark:o-border-stone-800 dark:o-bg-stone-900 md:o-col-span-3">
                  <p className={`o-m-0 ${NOTE}`}>Les poles</p>
                  <ol className="o-m-0 o-mt-6 o-list-none o-p-0">
                    {POLES.map((p) => (
                      <li key={p.cle} className="o-flex o-items-baseline o-gap-3 o-py-1.5 o-text-sm">
                        <span className="o-w-5 o-shrink-0 o-font-mono o-text-xs" style={{ color: encre() }}>
                          {p.numero}
                        </span>
                        <a href={`#${p.cle}`} className="o-text-stone-950 dark:o-text-stone-50 focus:o-ring">
                          {p.titre}
                        </a>
                      </li>
                    ))}
                  </ol>
                </Surgit>
                <Surgit delai={620} className="o-flex o-min-w-0 o-flex-col o-justify-between o-rounded-2xl o-border-w-1 o-border-black-10 o-bg-white o-p-6 dark:o-border-stone-800 dark:o-bg-stone-900 md:o-col-span-4">
                  <p className={`o-m-0 ${NOTE}`}>Ce que nous refusons</p>
                  <p className="o-m-0 o-mt-6 o-text-lg o-leading-snug o-text-stone-950 dark:o-text-stone-50" style={{ fontFamily: 'var(--o-vitrine-affichage)', fontWeight: 300 }}>
                    Un dossier dont le delai est deja passe, et un dossier ou nous avons deja conseille l autre partie. Les deux se verifient
                    avant le premier rendez-vous.
                  </p>
                </Surgit>
                <Surgit delai={700} className="o-relative o-min-h-56 o-min-w-0 o-overflow-hidden o-rounded-2xl md:o-col-span-5">
                  <Frame
                    src={photo('cadre-archive-escalier', 1000, 1500)}
                    alt="Escalier d honneur d un immeuble ancien, tapis rouge et ferronnerie"
                    ratio={1.6}
                    fit="cover"
                    className="o-size-full o-object-cover"
                  />
                  <p className={`o-absolute o-bottom-4 o-left-4 o-m-0 o-rounded-full o-bg-stone-950 o-px-2.5 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-100`}>
                    Rue de la Grange-Bateliere — deuxieme etage
                  </p>
                </Surgit>
              </div>
            </div>
          </div>
        </div>

        <main>
          {/*
            ----- Un ecran de texte seul, qui se nettoie mot a mot -------------
          */}
          <section aria-labelledby="dire-titre" className="o-px-6 o-py-28 md:o-px-8 md:o-py-40" style={{ borderTop: `1px solid ${FILET}` }}>
            <div className="o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-12">
              <p className={`o-m-0 md:o-col-span-3 ${NOTE}`}>
                Avant les delais
                <br />
                Une seule phrase
              </p>
              <div className="o-min-w-0 md:o-col-span-9">
                <h2 id="dire-titre" className="o-sr-only">
                  Ce que nous disons en premier
                </h2>
                {/*
                  Le flou de depart reste leger et l opacite haute : a cette
                  taille, un mot a 0,2 d opacite disparait, et la phrase ne se
                  lit plus qu au moment ou elle passe. Ici elle se lit toujours,
                  et le nettoyage ne fait que la parcourir.
                */}
                <BlurWords
                  as="p"
                  blur={4}
                  dim={0.42}
                  step={150}
                  pause={2800}
                  className="o-m-0 o-max-w-5xl o-text-balance o-text-stone-950 dark:o-text-stone-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.6vw, 3.75rem)', lineHeight: 1.1 }}
                >
                  Un avocat qui vous annonce une issue au premier rendez-vous vous vend une chose qu il ne possede pas. Nous commencons par
                  les dates, parce que ce sont les seules certitudes du dossier.
                </BlurWords>
              </div>
            </div>
          </section>

          {/*
            ----- Le mecanisme : la frise des delais ---------------------------
          */}
          <section
            id="procedure"
            aria-labelledby="procedure-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01" sombre={false}>
                  La frise des delais
                </Indice>
                <h2 id="procedure-titre" className="o-m-0 o-mt-5 o-max-w-3xl o-text-stone-950 dark:o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 4.25rem)' }}>
                  Du depot a l arret, jour par jour.
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                Delais observes, non garantis
                <br />
                Les couperets sont en plein, les autres en pointille
              </p>
            </div>

            <div className="o-mt-16">
              <LaProcedure />
            </div>
          </section>

          {/*
            ----- Les poles, en chapitres a etiquette collante -----------------
          */}
          <section id="poles" className="o-scroll-mt-24 o-px-6 o-pt-24 md:o-px-8 md:o-pt-32" style={{ borderTop: `1px solid ${FILET}` }}>
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="02" sombre={false}>
                  Les trois poles
                </Indice>
                <h2 className="o-m-0 o-mt-5 o-max-w-3xl o-text-stone-950 dark:o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 4.25rem)' }}>
                  Trois matieres, et rien au-dela.
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                Trois dossiers par pole
                <br />
                Cites sans nommer les parties
              </p>
            </div>
          </section>

          {POLES.map((pole, rang) => (
            <Fragment key={pole.cle}>
              <div id={pole.cle} className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-8 md:o-py-28">
                <Chapitre
                  indice={`${pole.numero} — ${String(rang + 1).padStart(2, '0')} / 03`}
                  largeur={4}
                  titre={
                    <h3 className="o-m-0 o-text-stone-950 dark:o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3rem)' }}>
                      {pole.titre}
                    </h3>
                  }
                  texte={<span className="o-block o-text-stone-600 dark:o-text-stone-400">{pole.texte}</span>}
                >
                  <ol className="o-m-0 o-list-none o-p-0" style={{ borderBottom: `1px solid ${FILET}` }}>
                    {pole.dossiers.map((d) => (
                      <li key={d.titre} className="o-grid o-gap-x-8 o-gap-y-3 o-py-8 md:o-grid-cols-12" style={{ borderTop: `1px solid ${FILET}` }}>
                        <p className="o-m-0 o-tabular-nums o-text-stone-950 dark:o-text-stone-50 md:o-col-span-2" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)' }}>
                          {d.annee}
                        </p>
                        <div className="o-min-w-0 md:o-col-span-7">
                          <h4 className="o-m-0 o-text-xl o-font-medium o-leading-snug o-tracking-tight o-text-stone-950 dark:o-text-stone-50">{d.titre}</h4>
                          <p className="o-mt-3 o-max-w-lg o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">{d.issue}</p>
                        </div>
                        <p className={`o-m-0 md:o-col-span-3 md:o-text-right ${NOTE}`}>{d.devant}</p>
                      </li>
                    ))}
                  </ol>
                </Chapitre>
              </div>

              {/*
                ----- La coupe sombre : l echelle verticale (C15) -------------

                Apres deux poles, la page claire passe au noir pour un seul
                ecran, et cet ecran ne porte pas un manifeste : il porte la
                seule mesure de la page, sur une echelle commune.
              */}
              {rang === 1 && (
                <section aria-labelledby="echelle-titre" className="o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={nuit('stone')}>
                  <div className="o-grid o-gap-12 lg:o-grid-cols-12">
                    <div className="lg:o-col-span-4">
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                        Mesure unique
                      </p>
                      <h2 id="echelle-titre" className="o-m-0 o-mt-5 o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
                        Ce que durent nos trois procedures.
                      </h2>
                      <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-stone-300">
                        Les durees medianes de nos cent soixante dossiers clos depuis 2021, posees sur la meme echelle que la mediane du
                        barreau. Nous ne publions pas de taux de reussite : il n a aucune definition partagee, et tout le monde le sait.
                      </p>
                      <ul className="o-m-0 o-mt-8 o-flex o-list-none o-flex-col o-gap-3 o-p-0">
                        {ECHELLE.map((ligne) => (
                          <li key={ligne.quoi} className={`o-flex o-gap-3 ${NOTE_SUR_NUIT}`}>
                            <span style={{ color: encreSurSombre() }}>{String(ligne.mois).replace('.', ',')}</span>
                            <span>{ligne.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <figure className="o-m-0 o-min-w-0 lg:o-col-span-8">
                      <div className="o-min-w-0 o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                        <EchelleDurees />
                      </div>
                      <figcaption className="o-mt-6 o-border-t o-border-white-10 o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-stone-400">
                        Echelle en mois, de zero a vingt-quatre. Chaque tige part du depot ; le disque marque la duree mediane observee. Le
                        pointille est la mediane du barreau de Paris, toutes matieres confondues.
                      </figcaption>
                    </figure>
                  </div>
                </section>
              )}
            </Fragment>
          ))}

          {/*
            ----- Le tableau de l ordre ----------------------------------------
          */}
          <section id="ordre" aria-labelledby="ordre-titre" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={{ borderTop: `1px solid ${FILET}` }}>
            <div className="o-grid o-gap-12 md:o-grid-cols-12">
              <div className="md:o-col-span-5">
                <Indice rang="03" sombre={false}>
                  Le tableau
                </Indice>
                <h2 id="ordre-titre" className="o-m-0 o-mt-5 o-text-stone-950 dark:o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
                  Quatre inscriptions, dans leur ordre.
                </h2>
                <p className="o-mt-5 o-max-w-md o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  L annee d inscription au tableau dit plus qu une biographie : elle dit combien de fois quelqu un a vu la meme audience. Un
                  associe est present a chaque rendez-vous, et il plaide le dossier qu il a suivi.
                </p>
              </div>
              <div className="o-min-w-0 md:o-col-span-7">
                <AnimatedList items={TABLEAU} label="Les avocats du cabinet, par annee d inscription" defaultValue="lecointre" stagger={90} />
              </div>
            </div>
          </section>

          {/*
            ----- A22 : une question, trois reponses, trois adresses ------------

            En triptyque, pas en liste : trois colonnes hautes separees par des
            filets, chacune numerotee comme un article.
          */}
          <section
            id="ouvrir"
            aria-labelledby="ouvrir-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <h2 id="ouvrir-titre" className="o-m-0 o-max-w-4xl o-text-stone-950 dark:o-text-stone-50" style={{ ...affiche('l', 300), fontSize: 'clamp(2.25rem, 5.6vw, 5.5rem)' }}>
              Ou en est votre affaire ?
            </h2>
            <div className="o-mt-16 o-grid o-gap-px md:o-grid-cols-3" style={{ backgroundColor: FILET }}>
              {REPONSES.map((r) => (
                <div key={r.numero} className="o-flex o-min-w-0 o-flex-col o-gap-6 o-bg-stone-50 o-p-8 dark:o-bg-stone-950">
                  <p className="o-m-0 o-font-mono o-text-sm" style={{ color: encre() }}>
                    {r.numero}
                  </p>
                  <p className="o-m-0 o-text-2xl o-font-medium o-leading-snug o-tracking-tight o-text-stone-950 dark:o-text-stone-50 md:o-text-3xl">{r.reponse}</p>
                  <p className="o-m-0 o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">{r.quoi}</p>
                  <a
                    href={`mailto:${r.adresse}`}
                    className="o-mt-auto o-inline-flex o-items-center o-gap-2 o-self-start o-rounded-full o-px-5 o-py-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                    style={aplat()}
                  >
                    {r.adresse}
                    <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>
            <p className={`o-mt-10 o-max-w-2xl ${NOTE}`}>
              Le premier entretien dure une heure et n est pas facture. La convention d honoraires est signee avant la moindre diligence, et
              jamais pendant.
            </p>
          </section>
        </main>

        {/*
          ----- P18 : l ours, en trois colonnes de chasse fixe -----------------

          La chasse est fixee a trente-deux caracteres environ, comme l ours
          d un quotidien : c est ce qui donne le bloc gris regulier, et c est la
          seule raison pour laquelle ces mentions se lisent au lieu d etre sautees.
        */}
        <footer className="o-px-6 o-pb-10 o-pt-14 md:o-px-8" style={{ borderTop: `1px solid ${FILET_FORT}`, backgroundColor: accentDoux(300, 6) }}>
          <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-6 o-gap-y-2 o-pb-8">
            <span className="o-inline-flex o-items-center o-gap-2 o-text-xl o-font-medium o-tracking-tight o-text-stone-950 dark:o-text-stone-50">
              <Icon icon={Scale} size={18} style={{ color: encre() }} aria-hidden="true" />
              Barreau
            </span>
            <span className={NOTE}>Avocats au barreau de Paris — AARPI — Paris et Bordeaux</span>
          </div>

          <div className="o-flex o-flex-wrap o-gap-x-12 o-gap-y-10" style={{ borderTop: `1px solid ${FILET}`, paddingTop: '2rem' }}>
            {OURS.map((colonne) => (
              <div key={colonne.titre} className="o-min-w-0" style={{ width: '22rem', maxWidth: '100%' }}>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-950 dark:o-text-stone-50">{colonne.titre}</p>
                {colonne.lignes.map((ligne, rang) => (
                  <p key={rang} className="o-m-0 o-mt-3 o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400" style={{ textAlign: 'justify' }}>
                    {ligne}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <p className={`o-mt-12 o-flex o-flex-wrap o-justify-between o-gap-4 o-pt-6 ${NOTE}`} style={{ borderTop: `1px solid ${FILET}` }}>
            <span>© 2026 Barreau AARPI</span>
            <span>
              <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                Mentions legales
              </a>
              {' · '}
              <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                Donnees personnelles
              </a>
              {' · '}
              <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                Accessibilite : partiellement conforme
              </a>
            </span>
          </p>
        </footer>
      </div>
    </Porte>
  )
}
