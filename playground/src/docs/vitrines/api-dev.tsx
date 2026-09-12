/**
 * Portail — interface de programmation.
 *
 * ## Le parti pris : une documentation qui s ouvre comme une affiche
 *
 * Une interface se vend a ceux qui lisent le code avant la promesse. La page
 * ouvre donc sur un ecran sombre ou le circuit imprime court derriere un seul
 * titre, un orbe qui flotte, une invite et une requete qui se tape toute
 * seule — puis elle devient ce qu elle est : un manuel.
 *
 * ## Le rythme, qui n est pas celui d un manuel
 *
 * Sa signature reste le **chapitre a etiquette collante** : l indice et le
 * titre restent poses a gauche pendant que les tables et les blocs de code
 * defilent a droite. Mais trois chapitres a la suite se lisent comme une
 * documentation ; ils sont donc separes par des ecrans d une autre nature —
 * un ruban de routes en mono, un ecran noir plein ou la requete et la reponse
 * se font face, une liste de verbes en soixante-quatre points qui penche a la
 * vitesse du defilement, une phrase seule sur un ecran vide.
 *
 * Il n y a pas d appel final : l action tient dans la barre, en haut, et dans
 * le pied, en bas, ou trois champs soulignes suffisent a demander une cle.
 *
 * ## Ce que la page fait
 *
 * Le selecteur de langage change reellement l exemple : curl, JavaScript et
 * Python n ont pas la meme forme d appel. Le reste — codes d erreur, limites
 * chiffrees, calendrier de depreciation, bibliotheques — est ce qu on vient
 * chercher dans une documentation et qu une page de presentation escamote.
 *
 * ## Les chiffres
 *
 * Aucune barre de compteurs. Les seuls nombres de la page sont ceux d un
 * tableau de limites en chasse fixe : un debit, un plafond, un delai, un prix.
 *
 * ## La palette
 *
 * Rien n est ecrit en emeraude. La page lit `--o-vitrine-*`, l accent que la
 * barre pose sur son conteneur. `ENCRE` melange l accent a l encre du theme et
 * se lit sur les deux fonds ; `ENCRE_CLAIRE`, la nuance 300, est reservee aux
 * blocs de code, sombres dans les deux themes. Les couleurs de verbe HTTP
 * restent semantiques : le bleu de la lecture, le rouge de la suppression.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  GitBranch,
  Lock,
  Terminal,
  TriangleAlert,
  Webhook,
} from '@odoro-cli/icons/filaire'
import { useMotionState } from '@odoro-cli/engine'
import { useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { Circuit } from '@/odoro/background/Circuit.jsx'
import { BorderBeam } from '@/odoro/effect/BorderBeam.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { ScrollProgress } from '@/odoro/effect/ScrollProgress.jsx'
import { ScrollVelocity } from '@/odoro/effect/ScrollVelocity.jsx'
import { Changelog } from '@/odoro/section/Changelog.jsx'
import { TextCursor } from '@/odoro/text/TextCursor.jsx'
import { Typewriter } from '@/odoro/text/Typewriter.jsx'
import { CopyButton } from '@/odoro/ui/CopyButton.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encre } from './palettes.js'
import { Actions, affiche, BarreCoins, CHROME, Coin, Etiquette, Grain, Manifeste, Porte, Surgit, TitreVague, usePolices } from './marche.jsx'
import { Chapitre, Flotte } from './scene.jsx'

/** Le filet neutre de la page, derive de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 12%, transparent)'

/** Le filet clair des blocs sombres. */
const FILET_SOMBRE = 'color-mix(in oklab, #ffffff 16%, transparent)'

/**
 * L encre d accent, sur un fond de theme.
 *
 * Une nuance fixe ne convient pas a toute couleur choisie : l emeraude 700 se lit
 * sur du blanc, le lime 700 aussi, mais le lime 400 non — et en sombre c est
 * l inverse. Melanger l accent a l encre du theme fonce le melange sur fond
 * clair et l eclaircit sur fond sombre, d une seule ecriture.
 */
const ENCRE = encre()

/**
 * L encre d accent des blocs de code.
 *
 * Ces blocs sont sombres dans les deux themes — c est la convention d un
 * terminal — et n heritent donc pas de l encre du theme. La nuance 300 melange
 * la couleur choisie a moitie de blanc : meme si le visiteur choisit un accent
 * presque noir, l encre reste au-dessus de 4,5:1 sur le zinc 950 du bloc.
 */
const ENCRE_CLAIRE = accent(300)

/** L aplat d accent d un element choisi. */
const VOILE = accentDoux(500, 14)

/**
 * Une encre semantique, tiree vers l encre du theme.
 *
 * Meme mecanique que `ENCRE`, mais sur une teinte imposee par le sens et non
 * par le modele : le bleu d une lecture, le rouge d une suppression.
 */
function semantique(jeton: string): string {
  return `color-mix(in oklab, var(${jeton}) 45%, var(--o-theme-fg))`
}

/** Les liens de la barre en coins. */
const LIENS = [
  ['#reference', 'Reference'],
  ['#entrees', 'Entrees'],
  ['#erreurs', 'Erreurs'],
  ['#limites', 'Limites'],
  ['#journal', 'Journal'],
] as const

/* ------------------------------------------------------------------------ */
/*                          La premiere requete                             */
/* ------------------------------------------------------------------------ */

/** Un langage propose par le selecteur. */
interface Langage {
  readonly id: string
  readonly libelle: string
  readonly fichier: string
  readonly code: string
  readonly installation: string
}

/**
 * Les trois langages de la premiere requete.
 *
 * Ce ne sont pas trois traductions du meme texte : chaque ecosysteme a sa
 * maniere de porter l authentification, l idempotence et la lecture d erreur.
 * Montrer les trois evite au lecteur de traduire mentalement un exemple curl
 * en promesse JavaScript, et c est exactement la ou une premiere integration
 * echoue.
 */
const LANGAGES: readonly Langage[] = [
  {
    id: 'curl',
    libelle: 'curl',
    fichier: 'premiere-requete.sh',
    installation: 'Aucune installation : curl suffit.',
    code: `curl https://api.portail.example/v3/expeditions \\
  -H "Authorization: Bearer pk_live_9f2c..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: exp_20260412_0043" \\
  -d '{"origine":"FR-44000","destination":"DE-10115","poids_g":1450}'`,
  },
  {
    id: 'js',
    libelle: 'JavaScript',
    fichier: 'premiere-requete.ts',
    installation: 'npm install @portail/client',
    code: `import { Portail } from '@portail/client'

const portail = new Portail({ cle: process.env.PORTAIL_CLE })

try {
  const expedition = await portail.expeditions.creer(
    { origine: 'FR-44000', destination: 'DE-10115', poids_g: 1450 },
    { cleIdempotence: 'exp_20260412_0043' },
  )
  console.log(expedition.etiquette_url, expedition.prix_cents)
} catch (erreur) {
  if (erreur.code === 'transporteur_indisponible') {
    // Le champ 'reessayer_dans_s' dit combien de temps attendre.
  }
  throw erreur
}`,
  },
  {
    id: 'python',
    libelle: 'Python',
    fichier: 'premiere_requete.py',
    installation: 'pip install portail',
    code: `from portail import Portail, ErreurPortail

portail = Portail(cle=os.environ["PORTAIL_CLE"])

try:
    expedition = portail.expeditions.creer(
        origine="FR-44000",
        destination="DE-10115",
        poids_g=1450,
        cle_idempotence="exp_20260412_0043",
    )
    print(expedition.etiquette_url, expedition.prix_cents)
except ErreurPortail as erreur:
    if erreur.code == "transporteur_indisponible":
        # Le champ 'reessayer_dans_s' dit combien de temps attendre.
        pass
    raise`,
  },
]

/** La requete montree cote a cote. */
const REQUETE = `POST /v3/expeditions HTTP/1.1
Host: api.portail.example
Authorization: Bearer pk_live_9f2c...
Content-Type: application/json
Idempotency-Key: exp_20260412_0043

{
  "origine": "FR-44000",
  "destination": "DE-10115",
  "poids_g": 1450,
  "options": {
    "assurance_cents": 12000,
    "signature": true
  }
}`

/** La reponse montree cote a cote. */
const REPONSE = `HTTP/1.1 201 Created
X-Portail-Requete: req_01HZK4M2W8
X-Portail-Version: 2026-04-01
X-Quota-Restant: 4871
X-Quota-Reinit: 2026-04-12T15:00:00Z

{
  "id": "exp_01HZK4M2W8",
  "etat": "etiquette_prete",
  "transporteur": "colis-nord",
  "prix_cents": 1180,
  "delai_jours": 2,
  "etiquette_url": "https://cdn.portail.example/e/01HZK4M2W8.pdf",
  "cree_le": "2026-04-12T14:22:07Z"
}`

/** Les points d entree publies. */
const ENTREES: readonly {
  readonly verbe: string
  readonly chemin: string
  readonly role: string
  readonly cout: string
}[] = [
  { verbe: 'POST', chemin: '/v3/expeditions', role: 'Cree une expedition et rend son etiquette', cout: '1 unite' },
  { verbe: 'GET', chemin: '/v3/expeditions/{id}', role: 'Lit l etat courant d une expedition', cout: '0 unite' },
  { verbe: 'GET', chemin: '/v3/expeditions', role: 'Liste paginee, curseur opaque, 100 par page', cout: '1 unite' },
  { verbe: 'POST', chemin: '/v3/tarifs:calculer', role: 'Compare les transporteurs sans rien creer', cout: '1 unite' },
  { verbe: 'DELETE', chemin: '/v3/expeditions/{id}', role: 'Annule tant que l etiquette n est pas scannee', cout: '1 unite' },
  { verbe: 'POST', chemin: '/v3/rappels', role: 'Abonne une adresse aux evenements de suivi', cout: '0 unite' },
]

/**
 * Les couleurs de verbe, par methode.
 *
 * Le bleu de la lecture et le rouge de la suppression sont une convention, pas
 * une decoration : ils ne suivent donc pas la palette du modele. POST, lui,
 * prend la teinte de la maison — c est le verbe de cette interface.
 */
const TEINTE_VERBE: Readonly<Record<string, string>> = {
  GET: semantique('--o-palette-sky-500'),
  POST: ENCRE,
  DELETE: semantique('--o-palette-rose-500'),
}

/* ------------------------------------------------------------------------ */
/*                            Les codes d erreur                            */
/* ------------------------------------------------------------------------ */

/** Une erreur documentee. */
interface Erreur {
  readonly statut: number
  readonly code: string
  readonly cause: string
  readonly geste: string
  /** Vrai quand rejouer la meme requete a un sens. */
  readonly rejouable: boolean
}

/**
 * Les erreurs que l interface sait rendre.
 *
 * La colonne qui compte n est pas le code mais la derniere : savoir si rejouer
 * a un sens evite la boucle de reessai qui epuise un quota sur une erreur
 * definitive.
 */
const ERREURS: readonly Erreur[] = [
  { statut: 400, code: 'champ_invalide', cause: 'Un champ manque ou ne respecte pas son format. Le corps nomme le chemin fautif.', geste: 'Corriger la requete. Le message donne le champ et la valeur attendue.', rejouable: false },
  { statut: 401, code: 'cle_absente', cause: 'En-tete Authorization absent ou mal forme.', geste: 'Envoyer « Bearer » suivi de la cle, sans guillemets.', rejouable: false },
  { statut: 403, code: 'cle_sans_droit', cause: 'La cle est valide mais n a pas le droit demande, ou vise un autre environnement.', geste: 'Verifier la portee de la cle dans la console. Une cle de test ne cree rien en direct.', rejouable: false },
  { statut: 404, code: 'introuvable', cause: 'L identifiant n existe pas, ou appartient a une autre organisation.', geste: 'Ne pas rejouer : la ressource ne reapparaitra pas.', rejouable: false },
  { statut: 409, code: 'cle_idempotence_rejouee', cause: 'La meme cle d idempotence a servi pour un corps different, dans les 24 heures.', geste: 'Changer de cle, ou renvoyer exactement le meme corps pour relire la reponse d origine.', rejouable: false },
  { statut: 413, code: 'corps_trop_grand', cause: 'Le corps depasse 10 Mo.', geste: 'Passer le fichier par une adresse pre-signee, puis n envoyer que son identifiant.', rejouable: false },
  { statut: 422, code: 'transporteur_indisponible', cause: 'Aucun transporteur ne dessert ce couple origine-destination aux contraintes demandees.', geste: 'Relacher une contrainte, ou lire tarifs:calculer avant de creer.', rejouable: false },
  { statut: 429, code: 'debit_depasse', cause: 'Le seau a jetons de la cle est vide.', geste: 'Attendre la duree donnee par Retry-After, puis rejouer a l identique.', rejouable: true },
  { statut: 500, code: 'erreur_interne', cause: 'Une panne de notre cote. Elle est deja ouverte chez nous quand vous la lisez.', geste: 'Rejouer avec la meme cle d idempotence, en reculant de facon exponentielle.', rejouable: true },
  { statut: 503, code: 'transporteur_en_panne', cause: 'Le transporteur choisi ne repond pas. Les autres restent joignables.', geste: 'Rejouer sans preciser de transporteur : le routage en choisira un autre.', rejouable: true },
  { statut: 504, code: 'delai_depasse', cause: 'La reponse a mis plus de 30 secondes. La connexion est fermee, l ecriture peut avoir abouti.', geste: 'Rejouer avec la meme cle d idempotence : la reponse d origine sera rendue si elle existe.', rejouable: true },
]

/** Le corps d une erreur, tel qu il arrive. */
const CORPS_ERREUR = `HTTP/1.1 429 Too Many Requests
Retry-After: 3
X-Portail-Requete: req_01HZK7Q1B4

{
  "code": "debit_depasse",
  "message": "600 requetes par minute pour cette cle.",
  "reessayer_dans_s": 3,
  "documentation": "https://api.portail.example/erreurs/debit_depasse"
}`

/* ------------------------------------------------------------------------ */
/*                                 Limites                                  */
/* ------------------------------------------------------------------------ */

/** Les quatre plafonds de l offre publique. */
const PLAFONDS: readonly { readonly valeur: string; readonly libelle: string; readonly detail: string }[] = [
  { valeur: '600 / min', libelle: 'Debit par cle', detail: 'Seau a jetons, reconstitue en continu. Le depassement rend 429.' },
  { valeur: '5 000 / h', libelle: 'Unites facturees', detail: 'Au-dela, la cle passe en file d attente plutot qu en erreur.' },
  { valeur: '10 Mo', libelle: 'Corps de requete', detail: 'Au-dela, 413. Les fichiers passent par une adresse pre-signee.' },
  { valeur: '30 s', libelle: 'Delai de reponse', detail: 'Ferme la connexion en 504 et rejoue si la cle d idempotence existe.' },
]

/** Les limites de debit, chiffrees par palier de compte. */
const DEBITS: readonly {
  readonly palier: string
  readonly requetes: string
  readonly ecritures: string
  readonly rafale: string
  readonly rappels: string
}[] = [
  { palier: 'Bac a sable', requetes: '60 / min', ecritures: '20 / min', rafale: '30', rappels: '5 / s' },
  { palier: 'Direct — defaut', requetes: '600 / min', ecritures: '240 / min', rafale: '120', rappels: '50 / s' },
  { palier: 'Direct — verifie', requetes: '3 000 / min', ecritures: '1 200 / min', rafale: '600', rappels: '200 / s' },
  { palier: 'Ligne dediee', requetes: 'Negocie', ecritures: 'Negocie', rafale: 'Negocie', rappels: '1 000 / s' },
]

/** La grille de prix, a l usage. */
const PALIERS: readonly { readonly tranche: string; readonly prix: string; readonly note: string }[] = [
  { tranche: '0 — 10 000 unites', prix: '0,000 EUR', note: 'Offert chaque mois, sans condition' },
  { tranche: '10 001 — 250 000', prix: '0,004 EUR', note: 'Par unite, facture a la fin du mois' },
  { tranche: '250 001 — 2 000 000', prix: '0,0026 EUR', note: 'Bascule automatique, sans avenant' },
  { tranche: 'Au-dela de 2 000 000', prix: 'Sur devis', note: 'Engagement annuel, ligne dediee' },
]

/* ------------------------------------------------------------------------ */
/*                        Versions et depreciation                          */
/* ------------------------------------------------------------------------ */

/** Une depreciation en cours, avec ses deux dates. */
const DEPRECIATIONS: readonly {
  readonly objet: string
  readonly annonce: string
  readonly retrait: string
  readonly remplacement: string
  readonly etat: 'annoncee' | 'derniere annee' | 'retiree'
}[] = [
  { objet: 'Champ prix_euros sur /v3/expeditions', annonce: '4 mars 2026', retrait: '4 mars 2027', remplacement: 'prix_cents, entier, meme unite que la facturation', etat: 'derniere annee' },
  { objet: 'Pagination par offset sur /v3/expeditions', annonce: '4 mars 2026', retrait: '1 mars 2027', remplacement: 'Curseur opaque, champ curseur_suivant de la reponse', etat: 'derniere annee' },
  { objet: 'Rappels non signes', annonce: '4 mars 2026', retrait: '1 septembre 2026', remplacement: 'Signature HMAC-SHA256, en-tete X-Portail-Signature', etat: 'annoncee' },
  { objet: 'Version 2 de l interface', annonce: '12 janvier 2025', retrait: '12 janvier 2026', remplacement: 'Version 3, guide de migration en ligne', etat: 'retiree' },
]

/** Les regles de version, telles qu elles sont contractuelles. */
const REGLES_VERSION: readonly string[] = [
  'Une version majeure est maintenue au moins vingt-quatre mois apres l annonce de la suivante.',
  'Un retrait est annonce douze mois a l avance, par courriel a tous les proprietaires de cle qui l emploient.',
  'L ajout d un champ dans une reponse n est pas une rupture : votre client doit ignorer ce qu il ne connait pas.',
  'L en-tete X-Portail-Version epingle une date de contrat ; sans elle, la derniere version stable repond.',
  'Les corrections de securite sont appliquees a toutes les versions maintenues, le meme jour.',
]

/* ------------------------------------------------------------------------ */
/*                        Bibliotheques officielles                         */
/* ------------------------------------------------------------------------ */

/** Une bibliotheque officielle. */
const BIBLIOTHEQUES: readonly {
  readonly langage: string
  readonly paquet: string
  readonly version: string
  readonly installation: string
  readonly note: string
}[] = [
  { langage: 'TypeScript et JavaScript', paquet: '@portail/client', version: '3.8.1', installation: 'npm install @portail/client', note: 'Types generes depuis le contrat, flux de rappels type, reessai exponentiel compris.' },
  { langage: 'Python', paquet: 'portail', version: '3.8.0', installation: 'pip install portail', note: 'Client synchrone et asynchrone, verification de signature des rappels fournie.' },
  { langage: 'Go', paquet: 'portail-go', version: '3.7.4', installation: 'go get portail.example/go@v3.7.4', note: 'Contexte propage, aucune dependance hors bibliotheque standard.' },
  { langage: 'PHP', paquet: 'portail/client', version: '3.6.2', installation: 'composer require portail/client', note: 'Compatible PSR-18, adaptateur Symfony et Laravel fournis separement.' },
]

/* ------------------------------------------------------------------------ */
/*                          Les deux figures dessinees                      */
/* ------------------------------------------------------------------------ */

/**
 * Les six etapes que traverse une requete, et ce que chacune peut refuser.
 *
 * Le tableau des erreurs enumere onze codes sans dire **ou** ils naissent. La
 * figure le dit : chaque code est pose sous l etape qui le rend, et l ordre
 * des etapes explique pourquoi un 429 n atteint jamais la validation.
 */
const CHEMIN: readonly {
  readonly rang: string
  readonly nom: string
  readonly detail: string
  readonly rendu: string
}[] = [
  { rang: '01', nom: 'Votre serveur', detail: 'POST /v3/expeditions', rendu: '' },
  { rang: '02', nom: 'Bordure TLS', detail: 'Nantes · TLS 1.3', rendu: '' },
  { rang: '03', nom: 'Cle et portee', detail: 'Bearer · environnement', rendu: '401 · 403' },
  { rang: '04', nom: 'Seau a jetons', detail: '600 / min · rafale 120', rendu: '429' },
  { rang: '05', nom: 'Idempotence', detail: 'meme corps, 24 heures', rendu: '400 · 409 · 422' },
  { rang: '06', nom: 'Routage', detail: 'sept transporteurs', rendu: '503' },
]

/** L abscisse d une etape, dans le repere de la figure. */
function abscisseEtape(rang: number): number {
  return 90 + rang * 164
}

/**
 * Figure 01 — le chemin d une requete, dessine.
 *
 * Un rail, six arrets, deux retours : la reponse et le rappel. Le jeton qui
 * court sur le rail est la seule chose qui bouge, et il s arrete sous
 * mouvement reduit — la figure se lit entierement a l arret.
 */
function FigureChemin(): ReactElement {
  const { reduced } = useMotionState()
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }
  return (
    <svg viewBox="0 0 1000 310" aria-hidden="true" className="o-w-full" style={{ minWidth: 720 }}>
      <style>{'@keyframes portail-flux{from{stroke-dashoffset:0}to{stroke-dashoffset:-164}}'}</style>

      {/* La borne de temps, au-dessus du rail. */}
      <text x="500" y="44" textAnchor="middle" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        240 ms de mediane, borne comprise — 620 ms au 99e centile
      </text>
      <path d="M254 68V56h656v12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" style={gris} />

      {/* Le rail, ses chevrons, puis le jeton qui court dessus. */}
      <line x1="90" y1="120" x2="910" y2="120" stroke="currentColor" strokeWidth="1.5" opacity="0.4" style={gris} />
      {CHEMIN.slice(1).map((etape, rang) => (
        <path
          key={`chevron-${etape.rang}`}
          d={`M${String(abscisseEtape(rang) + 78)} 114l7 6-7 6`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
          style={gris}
        />
      ))}
      {reduced ? null : (
        <line
          x1="90"
          y1="120"
          x2="910"
          y2="120"
          stroke={ENCRE}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ strokeDasharray: '18 146', animation: 'portail-flux 2400ms linear infinite' }}
        />
      )}

      {CHEMIN.map((etape, rang) => {
        const x = abscisseEtape(rang)
        return (
          <g key={etape.rang}>
            <text x={x} y="98" textAnchor="middle" className="o-font-mono" fontSize="10" fill="currentColor" style={{ color: ENCRE }}>
              {etape.rang}
            </text>
            <circle cx={x} cy="120" r="6.5" fill="var(--o-theme-bg)" stroke="currentColor" strokeWidth="1.6" />
            <text x={x} y="154" textAnchor="middle" fontSize="13.5" fill="currentColor">
              {etape.nom}
            </text>
            <text x={x} y="172" textAnchor="middle" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
              {etape.detail}
            </text>
            {etape.rendu === '' ? null : (
              <text
                x={x}
                y="198"
                textAnchor="middle"
                className="o-font-mono"
                fontSize="10.5"
                fill="currentColor"
                style={{ color: semantique('--o-palette-rose-500') }}
              >
                {etape.rendu}
              </text>
            )}
          </g>
        )
      })}

      {/* Les deux retours : la reponse, puis le rappel. */}
      <text x="500" y="228" textAnchor="middle" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        201 Created · corps JSON · X-Quota-Restant
      </text>
      <path d="M910 238H90m8-5-8 5 8 5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" style={gris} />

      <text x="500" y="278" textAnchor="middle" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        puis le rappel signe en HMAC, environ 90 ms apres le scan
      </text>
      <path d="M910 288H90m8-5-8 5 8 5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="5 6" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" style={gris} />
    </svg>
  )
}

/**
 * Les depreciations placees sur un axe, en mois ecoules depuis janvier 2025.
 *
 * Le tableau des versions donne deux dates par ligne ; il ne montre pas que
 * les fenetres se recouvrent, ni ou tombe le contrat epingle a l interieur.
 * L axe le montre d un coup d oeil.
 */
const FENETRE: readonly {
  readonly objet: string
  readonly quand: string
  readonly debut: number
  readonly fin: number
  readonly etat: 'annoncee' | 'derniere annee' | 'retiree'
}[] = [
  { objet: 'Champ prix_euros', quand: 'annonce 04/03/2026 — retire 04/03/2027', debut: 14.1, fin: 26.1, etat: 'derniere annee' },
  { objet: 'Pagination par offset', quand: 'annonce 04/03/2026 — retire 01/03/2027', debut: 14.1, fin: 26, etat: 'derniere annee' },
  { objet: 'Rappels non signes', quand: 'annonce 04/03/2026 — retire 01/09/2026', debut: 14.1, fin: 20, etat: 'annoncee' },
  { objet: 'Version 2 de l interface', quand: 'annonce 12/01/2025 — retiree le 12/01/2026', debut: 0.4, fin: 12.4, etat: 'retiree' },
]

/** Le nombre de mois portes par l axe, de janvier 2025 a avril 2027. */
const MOIS_AXE = 27

/** Ou tombe le contrat epingle de la page, sur ce meme axe. */
const MOIS_COURANT = 15.3

/** L abscisse d un mois, dans le repere de la figure du retrait. */
function abscisseMois(mois: number): number {
  return 70 + (mois / MOIS_AXE) * 870
}

/** La couleur d une fenetre, selon son etat. */
function teinteFenetre(etat: 'annoncee' | 'derniere annee' | 'retiree'): string {
  if (etat === 'retiree') return 'var(--o-theme-muted)'
  if (etat === 'derniere annee') return 'var(--o-palette-amber-400)'
  return ENCRE_CLAIRE
}

/**
 * Figure 02 — la fenetre de retrait, dessinee.
 *
 * Les quatre barres poussent depuis leur date d annonce ; sous mouvement
 * reduit elles sont deja la, en entier.
 */
function FigureRetrait(): ReactElement {
  const { reduced } = useMotionState()
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }

  // Les barres poussent quand la figure entre dans le champ, et pas au
  // montage : la section est a six ecrans du sommet, et une pousse jouee la
  // -bas n aurait ete vue par personne.
  const cadre = useRef<SVGSVGElement>(null)
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const element = cadre.current
    if (element === null || typeof IntersectionObserver === 'undefined') {
      setVu(true)
      return
    }
    const guetteur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((entree) => entree.isIntersecting)) {
          setVu(true)
          guetteur.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    guetteur.observe(element)
    return () => {
      guetteur.disconnect()
    }
  }, [])

  return (
    <svg ref={cadre} viewBox="0 0 1000 300" aria-hidden="true" className="o-w-full" style={{ minWidth: 720 }}>
      {/* Le contrat epingle : le trait qui coupe les fenetres en deux. */}
      <text
        x={abscisseMois(MOIS_COURANT)}
        y="40"
        textAnchor="middle"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={{ color: ENCRE_CLAIRE }}
      >
        contrat epingle
      </text>
      <line
        x1={abscisseMois(MOIS_COURANT)}
        y1="50"
        x2={abscisseMois(MOIS_COURANT)}
        y2="266"
        stroke={ENCRE_CLAIRE}
        strokeWidth="1.2"
        strokeDasharray="4 5"
      />

      {FENETRE.map((ligne, rang) => {
        const y = 74 + rang * 46
        const x = abscisseMois(ligne.debut)
        const large = abscisseMois(ligne.fin) - x
        return (
          <g key={ligne.objet}>
            <text x={x} y={y} fontSize="12.5" fill="currentColor">
              {ligne.objet}
            </text>
            <text x={x} y={y + 15} className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
              {ligne.quand}
            </text>
            <rect
              x={x}
              y={y + 22}
              width={large}
              height="11"
              rx="5.5"
              fill={teinteFenetre(ligne.etat)}
              opacity={ligne.etat === 'retiree' ? 0.38 : 0.9}
              style={
                reduced
                  ? undefined
                  : {
                      transformBox: 'fill-box',
                      transformOrigin: 'left center',
                      transform: vu ? 'scaleX(1)' : 'scaleX(0)',
                      transition: `transform 900ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 140)}ms`,
                    }
              }
            />
          </g>
        )
      })}

      {/* L axe, ses trimestres, et les trois janviers. */}
      <line x1="70" y1="266" x2="940" y2="266" stroke="currentColor" strokeWidth="1" opacity="0.45" style={gris} />
      {[0, 3, 6, 9, 12, 15, 18, 21, 24, 27].map((mois) => (
        <line
          key={mois}
          x1={abscisseMois(mois)}
          y1="266"
          x2={abscisseMois(mois)}
          y2={mois % 12 === 0 ? 276 : 271}
          stroke="currentColor"
          strokeWidth="1"
          opacity={mois % 12 === 0 ? 0.8 : 0.4}
          style={gris}
        />
      ))}
      {([
        [0, '2025'],
        [12, '2026'],
        [24, '2027'],
      ] as const).map(([mois, annee]) => (
        <text
          key={annee}
          x={abscisseMois(mois)}
          y="292"
          textAnchor="middle"
          className="o-font-mono"
          fontSize="10.5"
          fill="currentColor"
          style={gris}
        >
          {annee}
        </text>
      ))}
    </svg>
  )
}

/**
 * Figure 03 — le seau a jetons, dessine et en mouvement.
 *
 * Le tableau des debits donne « 600 / min » et le tableau des erreurs donne
 * « 429 » ; ni l un ni l autre ne dit **comment** les deux se rencontrent. Le
 * seau le montre : trente pastilles qui se remplissent, une rafale qui les
 * vide, et le code qui part quand il ne reste rien.
 *
 * Sous mouvement reduit le seau est pose aux deux tiers, et rien ne coule.
 */
function FigureSeau(): ReactElement {
  const { reduced } = useMotionState()
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }
  return (
    <svg viewBox="0 0 1000 132" aria-hidden="true" className="o-w-full" style={{ minWidth: 560 }}>
      <style>
        {[
          '@keyframes portail-seau{0%{transform:translateX(150px)}70%{transform:translateX(876px)}74%{transform:translateX(150px)}100%{transform:translateX(150px)}}',
          '@keyframes portail-vide{0%,70%{opacity:0}74%,88%{opacity:1}94%,100%{opacity:0}}',
        ].join('')}
      </style>

      <text x="54" y="22" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        600 jetons par cle — dix reconstitues chaque seconde
      </text>

      {/* Les trente pastilles, une pour vingt jetons. */}
      {Array.from({ length: 30 }, (_, rang) => (
        <rect key={rang} x={60 + rang * 29.3} y="44" width="20" height="26" rx="4" fill={ENCRE} opacity="0.85" />
      ))}

      {/*
        Le couvercle : il decouvre le seau en glissant vers la droite. Sa
        couleur est celle de la bande qui le porte — blanc en clair, zinc 900
        en sombre — et non `--o-theme-bg`, qui laisserait voir un rectangle
        plus fonce a cote du seau dans le theme sombre.
      */}
      <rect
        x="58"
        y="40"
        width="876"
        height="34"
        fill="light-dark(#ffffff, var(--o-palette-zinc-900))"
        style={
          reduced
            ? { transform: 'translateX(580px)' }
            : { animation: 'portail-seau 7200ms cubic-bezier(0.33, 1, 0.68, 1) infinite' }
        }
      />

      {/* Le contenant, pose par-dessus : il ne se decouvre pas, lui. */}
      <rect x="54" y="36" width="884" height="42" rx="10" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" style={gris} />

      <text x="54" y="98" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        0
      </text>
      <text x="938" y="98" textAnchor="end" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        600
      </text>

      <text
        x="496"
        y="120"
        textAnchor="middle"
        className="o-font-mono"
        fontSize="11"
        fill="currentColor"
        style={
          reduced
            ? { color: semantique('--o-palette-rose-500'), opacity: 0 }
            : { color: semantique('--o-palette-rose-500'), opacity: 0, animation: 'portail-vide 7200ms linear infinite' }
        }
      >
        429 debit_depasse — Retry-After: 3
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                                 Pieces                                   */
/* ------------------------------------------------------------------------ */

/** Un bloc de code sombre, avec son intitule et son bouton copier. */
function Bloc({
  titre,
  icone,
  code,
  libelleCopie,
}: {
  titre: string
  icone: IconData
  code: string
  libelleCopie: string
}): ReactElement {
  return (
    <div
      className="o-flex o-h-full o-flex-col o-overflow-hidden o-rounded-xl o-bg-zinc-950 o-text-zinc-100 dark:o-text-zinc-100"
      style={{ border: `1px solid ${FILET_SOMBRE}` }}
    >
      <div className="o-flex o-items-center o-gap-2 o-px-4 o-py-2" style={{ borderBottom: `1px solid ${FILET_SOMBRE}` }}>
        <Icon icon={icone} size={14} style={{ color: ENCRE_CLAIRE }} aria-hidden="true" />
        <p className="o-m-0 o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-400">{titre}</p>
        <span className="o-ml-auto">
          <CopyButton
            value={code}
            label={libelleCopie}
            className="o-rounded-md o-px-2 o-py-1 o-text-xs o-font-mono o-text-zinc-300 dark:o-text-zinc-300 o-gap-2 focus:o-ring"
          />
        </span>
      </div>
      <pre className="o-m-0 o-flex-1 o-overflow-x-auto o-p-4 o-font-mono o-text-xs o-leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/**
 * L orbe : le seul objet lumineux de l ouverture.
 *
 * Les references qui ouvrent sur une scene posent toujours un objet unique
 * devant elle — l anneau, la carte, la statue. Ici c est un disque de lumiere
 * traverse d une orbite, pose au tiers droit, qui respire lentement. Il ne
 * porte aucun texte : il donne l echelle du titre et la profondeur du circuit.
 */
function Orbe(): ReactElement {
  return (
    <div aria-hidden="true" className="o-relative o-size-full">
      <span
        className="o-absolute o-inset-0 o-rounded-full o-blur-3xl"
        style={{ background: `radial-gradient(circle at 42% 38%, ${accent(400)} 0%, ${accent(700)} 38%, transparent 72%)`, opacity: 0.55 }}
      />
      <span
        className="o-absolute o-rounded-full"
        style={{
          inset: '9%',
          background: `radial-gradient(circle at 38% 32%, color-mix(in oklab, ${accent(200)} 65%, transparent) 0%, transparent 58%)`,
          boxShadow: `inset 0 0 90px ${accent(500)}`,
          border: `1px solid color-mix(in oklab, ${accent(300)} 40%, transparent)`,
        }}
      />
      <span
        className="o-absolute o-inset-0 o-rounded-full"
        style={{ border: `1px solid ${FILET_SOMBRE}`, transform: 'rotate(-18deg) scaleY(0.28)' }}
      />
      <span
        className="o-absolute o-rounded-full"
        style={{ inset: '3%', border: `1px solid color-mix(in oklab, ${accent(300)} 26%, transparent)`, transform: 'rotate(14deg) scaleY(0.44)' }}
      />
    </div>
  )
}

/** Le titre d un chapitre : grande graisse legere, sous l etiquette collante. */
function TitreChapitre({ children }: { readonly children: string }): ReactElement {
  return (
    <h2 className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
      {children}
    </h2>
  )
}

/** Un entete de colonne, en mono. */
function Entete({ children }: { readonly children: string }): ReactElement {
  return (
    <th scope="col" className="o-px-4 o-py-3 o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400" style={{ borderBottom: `1px solid ${FILET}` }}>
      {children}
    </th>
  )
}

/** Une bande de chapitre, avec ses marges. */
function Bande({ id, children }: { readonly id: string; readonly children: ReactNode }): ReactElement {
  return (
    <div id={id} className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-20 md:o-px-8 md:o-py-28">
      <div className="o-mx-auto o-max-w-7xl">{children}</div>
    </div>
  )
}

/**
 * La premiere requete, dans le langage choisi.
 *
 * Un exemple sans sa commande d installation oblige a chercher ailleurs ce qui
 * tient en une ligne. Les deux changent ensemble : c est la sequence reelle
 * d une premiere integration.
 */
function PremiereRequete(): ReactElement {
  const [langage, setLangage] = useState('curl')
  const choisi = LANGAGES.find((l) => l.id === langage) ?? LANGAGES[0]
  if (choisi === undefined) return <></>

  return (
    <div>
      <div role="group" aria-label="Langage de l exemple" className="o-flex o-flex-wrap o-items-center o-gap-2">
        {LANGAGES.map((option) => {
          const actif = option.id === langage
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={actif}
              onClick={() => {
                setLangage(option.id)
              }}
              className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest focus:o-ring"
              style={actif ? { borderColor: accent(500), backgroundColor: VOILE, color: ENCRE } : { borderColor: FILET }}
            >
              {option.libelle}
            </button>
          )
        })}
        <p aria-live="polite" className="o-m-0 o-ml-auto o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
          {choisi.installation}
        </p>
      </div>

      <div className="o-mt-5">
        <Bloc titre={choisi.fichier} icone={Terminal} code={choisi.code} libelleCopie="Copier" />
      </div>
    </div>
  )
}

/** Un champ du pied : une etiquette en mono, une ligne soulignee. */
function Champ({ nom, type = 'text', className = '' }: { readonly nom: string; readonly type?: string; readonly className?: string }): ReactElement {
  const id = `pied-${nom.toLowerCase().replace(/[^a-z]+/g, '-')}`
  return (
    <div className={className}>
      <label htmlFor={id} className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        {nom}
      </label>
      <input
        id={id}
        type={type}
        name={id}
        className="o-mt-2 o-w-full o-border-b o-border-white-20 o-bg-transparent o-py-3 o-font-mono o-text-base o-text-zinc-50 focus:o-ring"
        style={{ borderRadius: 0 }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                                La page                                   */
/* ------------------------------------------------------------------------ */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('onest')
  const corps = useRef<HTMLElement>(null)

  return (
    <Porte forme="compteur" marque="Portail">
      <div className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50" style={polices}>
        {/* La progression de lecture : une documentation se parcourt, et le
            trait dit ou l on en est. Posee sous les barres de la documentation. */}
        <ScrollProgress target={corps} thickness={2} position="top" style={{ top: CHROME, zIndex: 40 }} />

        {/* ================= L ouverture : le circuit, un titre, une invite ===== */}
        <section id="sommet" aria-label="Ouverture" className="o-relative o-isolate o-overflow-hidden o-text-zinc-50" style={nuit('zinc')}>
          <div aria-hidden="true" className="o-absolute o-inset-0">
            <Circuit
              className="o-absolute o-inset-0"
              cells={9}
              width={0.05}
              speed={0.9}
              pulses={0.5}
              colors={['--o-palette-zinc-950', '--o-palette-zinc-800', '--o-vitrine-400']}
              fallback="o-bg-zinc-950"
            />
            <div className="o-absolute o-inset-0" style={{ background: 'linear-gradient(to right, color-mix(in oklab, var(--o-palette-zinc-950) 88%, transparent) 0%, color-mix(in oklab, var(--o-palette-zinc-950) 45%, transparent) 55%, transparent 100%)' }} />
            <div className="o-absolute o-inset-x-0 o-bottom-0 o-h-40" style={{ background: 'linear-gradient(to bottom, transparent, var(--o-palette-zinc-950))' }} />
            <Grain opacite={0.05} />
          </div>

          <BarreCoins
            marque="portail /v3"
            liens={LIENS}
            droite={
              <a href="#pied" className="o-inline-flex o-items-center o-gap-1 o-no-underline o-text-zinc-50 hover:o-text-white focus:o-ring">
                Obtenir une cle <Icon icon={ArrowUpRight} size={12} aria-hidden="true" />
              </a>
            }
          />

          <div className="o-relative o-mx-auto o-grid o-max-w-7xl o-items-center o-gap-12 o-px-6 o-pb-32 o-pt-10 md:o-px-8 lg:o-grid-cols-12" style={{ minHeight: `calc(100vh - ${String(CHROME)}px - 72px)` }}>
            <div className="lg:o-col-span-7">
              <Surgit>
                <Etiquette>v3.8.0 — contrat epingle au 2026-04-01</Etiquette>
              </Surgit>
              <TitreVague delai={120} className="o-m-0 o-mt-8 o-text-zinc-50" style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
                Une etiquette d expedition en 240 ms.
              </TitreVague>
              <Surgit delai={520} as="p" className="o-m-0 o-mt-10 o-max-w-2xl o-font-mono o-text-sm o-leading-relaxed o-text-zinc-300">
                <TextCursor as="span" amplitude={16} raideur={10} className="o-text-zinc-50">
                  $ portail
                </TextCursor>{' '}
                <Typewriter
                  phrases={[
                    'POST /v3/expeditions -> 201 etiquette_prete',
                    'POST /v3/tarifs:calculer -> 7 transporteurs compares',
                    'GET  /v3/expeditions/exp_01HZK4M2W8 -> en_transit',
                    'POST /v3/rappels -> evenement livre en 90 ms',
                  ]}
                  typeSpeed={38}
                  deleteSpeed={18}
                  hold={1800}
                />
              </Surgit>
              <Surgit delai={640} className="o-mt-10">
                <Actions pleine={['#pied', <>Obtenir une cle de test <Icon icon={ArrowRight} size={16} aria-hidden="true" /></>]} fantome={['#reference', 'Lire la reference']} />
              </Surgit>
            </div>
            {/* L objet lumineux unique, decale d un tiers : il donne l echelle
                du titre sans porter un mot. */}
            <Surgit delai={360} className="max-lg:o-hidden lg:o-col-span-5">
              <Flotte amplitude={12} duree={9} className="o-mx-auto o-w-full o-max-w-sm">
                <div className="o-aspect-square">
                  <Orbe />
                </div>
              </Flotte>
            </Surgit>
          </div>

          <Coin position="bg">REST · JSON · idempotence sur 24 h<br />Sept transporteurs, un seul contrat</Coin>
          <Coin position="bd">api.portail.example<br />Nantes — depuis 2021</Coin>
        </section>

        {/* ================= Le ruban : ce que l interface expose ============
            Une bande etroite plutot qu une bande de logos : ce qu un
            developpeur reconnait d une interface, ce sont ses routes. */}
        <div aria-hidden="true" className="o-relative o-overflow-hidden o-border-b o-border-white-10 o-py-4 o-text-zinc-500" style={nuit('zinc')}>
          <Marquee speed={52} fade={10} pauseOnHover={false}>
            {[...ENTREES, ...ENTREES].map((entree, rang) => (
              <span key={`${entree.chemin}-${String(rang)}`} className="o-flex o-shrink-0 o-items-center o-gap-3 o-px-8 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                <span style={{ color: TEINTE_VERBE[entree.verbe] ?? 'currentColor' }}>{entree.verbe}</span>
                <span className="o-text-zinc-400">{entree.chemin}</span>
                <span className="o-text-zinc-700">/</span>
              </span>
            ))}
          </Marquee>
        </div>

        <main ref={corps}>
          {/* ================= (01) La premiere requete ===================== */}
          <Bande id="reference">
            <Chapitre
              indice="(01) — La premiere requete"
              titre={<TitreChapitre>Trois langages, une seule forme d appel.</TitreChapitre>}
              texte="L exemple change avec le langage, et la ligne d installation avec lui. C est la sequence reelle d une premiere integration."
            >
              <PremiereRequete />
            </Chapitre>
          </Bande>

          {/* ================= Un ecran noir plein : requete contre reponse ===
              Le premier ecart au chapitre. Plus d etiquette collante, un titre
              au centre, et les deux blocs qui se font face sur toute la
              largeur : la page respire avant de reprendre son manuel. */}
          <section
            id="echange"
            aria-labelledby="echange-titre"
            className="o-scroll-mt-24 o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 o-text-zinc-50 md:o-px-8 md:o-py-36"
            style={nuit('zinc')}
          >
            <Grain opacite={0.05} />
            <div className="o-relative o-mx-auto o-max-w-7xl">
              <p className="o-m-0 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Des deux cotes du fil
              </p>
              <h2
                id="echange-titre"
                className="o-m-0 o-mx-auto o-mt-6 o-max-w-4xl o-text-balance o-text-center o-text-zinc-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.6vw, 4.5rem)' }}
              >
                Ce que vous envoyez, ce que vous recevez.
              </h2>
              <p className="o-mx-auto o-mt-6 o-max-w-xl o-text-center o-text-sm o-leading-relaxed o-text-zinc-400">
                Aucun champ n est optionnel sans valeur par defaut documentee, et l en-tete de quota part avec chaque reponse.
              </p>

              <div className="o-mt-16 o-grid o-items-stretch o-gap-4 xl:o-grid-cols-2">
                <BorderBeam color={accent(400)} width={1} duration={5200} trail={22} className="o-rounded-xl">
                  <Bloc titre="Requete" icone={ArrowRight} code={REQUETE} libelleCopie="Copier la requete" />
                </BorderBeam>
                <Bloc titre="Reponse — 201" icone={Braces} code={REPONSE} libelleCopie="Copier la reponse" />
              </div>

              <ul className="o-m-0 o-mt-12 o-grid o-list-none o-gap-x-8 o-gap-y-5 o-p-0 o-text-sm sm:o-grid-cols-2 lg:o-grid-cols-4">
                {[
                  { icone: Lock, texte: 'TLS 1.3 obligatoire, cles rotatives' },
                  { icone: Check, texte: 'Idempotence sur 24 heures' },
                  { icone: Webhook, texte: 'Rappels signes en HMAC-SHA256' },
                  { icone: TriangleAlert, texte: 'Erreurs typees, jamais une chaine libre' },
                ].map((point) => (
                  <li key={point.texte} className="o-flex o-items-start o-gap-2 o-border-t o-border-white-10 o-pt-4">
                    <Icon icon={point.icone} size={16} className="o-mt-px o-shrink-0" style={{ color: accent(300) }} aria-hidden="true" />
                    <span className="o-text-zinc-400">{point.texte}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ================= Les six routes : les verbes en grand ===========
              Ni tableau ni chapitre : un registre ou le verbe est l objet, et
              qui penche a la vitesse du defilement. */}
          <section
            id="entrees"
            aria-labelledby="entrees-titre"
            className="o-scroll-mt-24 o-overflow-hidden o-px-6 o-py-24 md:o-px-8 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-end">
                <h2
                  id="entrees-titre"
                  className="o-m-0 o-text-balance o-text-zinc-950 dark:o-text-zinc-50 md:o-col-span-7"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.6vw, 4.5rem)' }}
                >
                  Six routes, et c est tout.
                </h2>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5">
                  Une interface qui compte quarante routes est une interface que personne ne connait entierement. Les lectures ne sont pas facturees.
                </p>
              </div>

              <ScrollVelocity strength={0.35} damping={6} className="o-mt-16">
                <ol className="o-m-0 o-list-none o-border-t o-p-0" style={{ borderColor: FILET }}>
                  {ENTREES.map((entree) => (
                    <li
                      key={`${entree.verbe} ${entree.chemin}`}
                      className="o-grid o-items-baseline o-gap-x-6 o-gap-y-2 o-border-b o-py-6 md:o-grid-cols-12"
                      style={{ borderColor: FILET }}
                    >
                      <span
                        aria-hidden="true"
                        className="o-font-mono o-font-bold o-tracking-tighter md:o-col-span-2"
                        style={{ fontSize: 'clamp(1.5rem, 3.2vw, 3rem)', lineHeight: 1, color: TEINTE_VERBE[entree.verbe] ?? 'currentColor' }}
                      >
                        {entree.verbe}
                      </span>
                      <h3 className="o-m-0 o-font-mono o-text-base o-font-normal md:o-col-span-4">
                        <span className="o-sr-only">{entree.verbe} </span>
                        {entree.chemin}
                      </h3>
                      <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-4">
                        {entree.role}
                      </p>
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-2 md:o-text-right">
                        {entree.cout}
                      </p>
                    </li>
                  ))}
                </ol>
              </ScrollVelocity>
            </div>
          </section>

          {/* ================= Figure 01 : le chemin d une requete ===========
              Entre le registre des routes et le tableau des erreurs, une
              figure dessinee : elle dit ou naissent les onze codes que le
              tableau enumere, et pourquoi leur ordre compte. */}
          <section
            id="chemin"
            aria-labelledby="chemin-titre"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ backgroundColor: 'var(--o-theme-bg)' }}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                  Figure 01
                </p>
                <h2
                  id="chemin-titre"
                  className="o-m-0 o-mt-5 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                >
                  Le chemin d une requete.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Six arrets entre votre serveur et l etiquette. Sous chacun, le code qu il rend quand il refuse : c est la que naissent les onze erreurs du tableau suivant.
                </p>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  L ordre compte. Un 429 part avant toute lecture du corps : une rafale ne consomme donc jamais d unite facturee.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2">
                  <FigureChemin />
                </div>
                <ol className="o-sr-only">
                  {CHEMIN.map((etape) => (
                    <li key={etape.rang}>
                      {etape.nom} — {etape.detail}
                      {etape.rendu === '' ? '' : `, refuse en ${etape.rendu}`}
                    </li>
                  ))}
                  <li>La reponse revient en 201 Created, avec le corps JSON et les en-tetes de quota.</li>
                  <li>Le rappel signe en HMAC part ensuite, environ 90 ms apres le scan.</li>
                </ol>
                <figcaption
                  className="o-mt-6 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400"
                  style={{ borderColor: FILET }}
                >
                  Figure 01 — une ecriture, de gauche a droite ; en dessous, la reponse puis le rappel. Les codes en rouge sont ceux que l etape sait refuser.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* ================= (02) Les erreurs ============================= */}
          <Bande id="erreurs">
              <Chapitre
                indice="(02) — Les erreurs"
                titre={<TitreChapitre>Onze erreurs, et ce qu il faut en faire.</TitreChapitre>}
                texte="La derniere colonne est celle qui vous evitera une boucle de reessai sur une erreur definitive."
              >
                <div className="o-overflow-x-auto">
                  <table className="o-w-full o-text-left o-text-sm" style={{ minWidth: 720 }}>
                    <caption className="o-sr-only">Les codes d erreur de l interface Portail, leur cause et le geste attendu</caption>
                    <thead>
                      <tr>
                        <Entete>Statut</Entete>
                        <Entete>Code</Entete>
                        <Entete>Cause</Entete>
                        <Entete>Ce qu il faut faire</Entete>
                        <Entete>Rejouable</Entete>
                      </tr>
                    </thead>
                    <tbody>
                      {ERREURS.map((erreur) => (
                        <tr key={erreur.code}>
                          <td className="o-px-4 o-py-3 o-align-top o-font-mono o-text-xs o-font-bold o-tabular-nums" style={{ borderTop: `1px solid ${FILET}`, color: erreur.statut >= 500 ? semantique('--o-palette-amber-500') : semantique('--o-palette-rose-500') }}>
                            {erreur.statut}
                          </td>
                          <th scope="row" className="o-px-4 o-py-3 o-align-top o-font-mono o-text-xs o-font-normal o-whitespace-nowrap" style={{ borderTop: `1px solid ${FILET}` }}>
                            {erreur.code}
                          </th>
                          <td className="o-px-4 o-py-3 o-align-top o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400" style={{ borderTop: `1px solid ${FILET}` }}>
                            {erreur.cause}
                          </td>
                          <td className="o-px-4 o-py-3 o-align-top o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400" style={{ borderTop: `1px solid ${FILET}` }}>
                            {erreur.geste}
                          </td>
                          <td className="o-px-4 o-py-3 o-align-top o-font-mono o-text-xs o-whitespace-nowrap" style={{ borderTop: `1px solid ${FILET}` }}>
                            <span className="o-inline-flex o-items-center o-gap-1.5" style={erreur.rejouable ? { color: ENCRE } : undefined}>
                              <span aria-hidden="true" className="o-block o-h-1.5 o-w-1.5 o-rounded-full" style={{ backgroundColor: erreur.rejouable ? accent(500) : 'var(--o-theme-muted)' }} />
                              {erreur.rejouable ? 'Oui' : 'Non'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="o-mt-8 o-max-w-2xl">
                  <Bloc titre="Corps d une erreur" icone={TriangleAlert} code={CORPS_ERREUR} libelleCopie="Copier" />
                </div>
              </Chapitre>
            </Bande>

          {/* ================= Une phrase, un ecran =========================
              Le troisieme ecart : rien d autre qu une phrase et une colonne
              laissee vide. C est la promesse que tout le chapitre suivant
              documente ligne a ligne. */}
          <section aria-labelledby="promesse-titre" className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-32 md:o-px-8 md:o-py-44">
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-3">
                La promesse
              </p>
              <div className="md:o-col-span-9">
                <h2 id="promesse-titre" className="o-sr-only">La promesse de stabilite</h2>
                <Manifeste sombre={false} eteint="Une interface qui ne dit pas quand elle casse ne se met pas en production.">
                  Celle-ci annonce chaque retrait douze mois a l avance, par courriel, a chaque proprietaire de cle qui l emploie.
                </Manifeste>
              </div>
            </div>
          </section>

            {/* ================= (03) Les versions ============================ */}
            <Bande id="versions">
              <Chapitre
                indice="(03) — Les versions"
                titre={<TitreChapitre>Ce qui disparait, et quand exactement.</TitreChapitre>}
                texte="Une interface qui ne dit pas quand elle casse ne se met pas en production. Voici la regle, puis la liste, avec ses deux dates."
              >
                <ol className="o-m-0 o-list-none o-p-0">
                  {REGLES_VERSION.map((regle, rang) => (
                    <li key={regle} className="o-grid o-grid-cols-12 o-gap-4 o-border-t o-py-4" style={{ borderColor: FILET }}>
                      <span aria-hidden="true" className="o-col-span-2 o-font-mono o-text-xs o-tabular-nums o-tracking-widest sm:o-col-span-1" style={{ color: ENCRE }}>
                        {String(rang + 1).padStart(2, '0')}
                      </span>
                      <span className="o-col-span-10 o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300 sm:o-col-span-11">{regle}</span>
                    </li>
                  ))}
                </ol>

                <div className="o-mt-10 o-overflow-x-auto">
                  <table className="o-w-full o-text-left o-text-sm" style={{ minWidth: 700 }}>
                    <caption className="o-sr-only">Les depreciations en cours, avec leur date d annonce et leur date de retrait</caption>
                    <thead>
                      <tr>
                        <Entete>Objet</Entete>
                        <Entete>Annonce le</Entete>
                        <Entete>Retire le</Entete>
                        <Entete>Remplacement</Entete>
                        <Entete>Etat</Entete>
                      </tr>
                    </thead>
                    <tbody>
                      {DEPRECIATIONS.map((ligne) => (
                        <tr key={ligne.objet}>
                          <th scope="row" className="o-px-4 o-py-3 o-align-top o-font-mono o-text-xs o-font-normal" style={{ borderTop: `1px solid ${FILET}` }}>
                            {ligne.objet}
                          </th>
                          <td className="o-px-4 o-py-3 o-align-top o-font-mono o-text-xs o-whitespace-nowrap o-text-zinc-600 dark:o-text-zinc-400" style={{ borderTop: `1px solid ${FILET}` }}>
                            {ligne.annonce}
                          </td>
                          <td className="o-px-4 o-py-3 o-align-top o-font-mono o-text-xs o-whitespace-nowrap o-text-zinc-600 dark:o-text-zinc-400" style={{ borderTop: `1px solid ${FILET}` }}>
                            {ligne.retrait}
                          </td>
                          <td className="o-px-4 o-py-3 o-align-top o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400" style={{ borderTop: `1px solid ${FILET}` }}>
                            {ligne.remplacement}
                          </td>
                          <td className="o-px-4 o-py-3 o-align-top o-font-mono o-text-xs o-whitespace-nowrap" style={{ borderTop: `1px solid ${FILET}`, color: ligne.etat === 'derniere annee' ? semantique('--o-palette-amber-500') : undefined }}>
                            {ligne.etat}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="o-mt-4 o-max-w-2xl o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Une requete qui emploie un champ deprecie recoit l en-tete Deprecation avec sa date de retrait, et un lien Sunset. Rien n est retire un vendredi, ni entre le 15 decembre et le 5 janvier.
                </p>
              </Chapitre>
            </Bande>

          {/* ================= Figure 02 : la coupe sombre ====================
              Trois tableaux se suivaient. Une bande sombre les coupe, et la
              meme matiere y est dessinee plutot qu enumeree : quatre fenetres
              sur un axe, et le trait du contrat epingle au milieu. */}
          <section
            id="fenetre"
            aria-labelledby="fenetre-titre"
            className="o-scroll-mt-24 o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 o-text-zinc-50 md:o-px-8 md:o-py-32"
            style={nuit('zinc')}
          >
            <Grain opacite={0.05} />
            <div className="o-relative o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE_CLAIRE }}>
                  Figure 02
                </p>
                <h2
                  id="fenetre-titre"
                  className="o-m-0 o-mt-5 o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                >
                  Douze mois, sur un axe.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-400">
                  Le tableau donne deux dates par ligne. L axe dit le reste : ce qui est deja parti, ce qui vit sa derniere annee, et ou tombe le contrat epingle par cette page.
                </p>
                <ul className="o-m-0 o-mt-8 o-flex o-list-none o-flex-col o-gap-3 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  {([
                    ['retiree', 'Retiree'],
                    ['derniere annee', 'Derniere annee'],
                    ['annoncee', 'Annoncee'],
                  ] as const).map(([etat, mot]) => (
                    <li key={etat} className="o-flex o-items-center o-gap-3">
                      <span
                        aria-hidden="true"
                        className="o-block o-h-2 o-w-8 o-rounded-full"
                        style={{ backgroundColor: teinteFenetre(etat), opacity: etat === 'retiree' ? 0.38 : 0.9 }}
                      />
                      {mot}
                    </li>
                  ))}
                </ul>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2">
                  <FigureRetrait />
                </div>
                <ul className="o-sr-only">
                  {FENETRE.map((ligne) => (
                    <li key={ligne.objet}>
                      {ligne.objet} — {ligne.quand}, {ligne.etat}.
                    </li>
                  ))}
                </ul>
                <figcaption className="o-mt-6 o-border-t o-border-white-10 o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400">
                  Figure 02 — les quatre fenetres de retrait en cours, de janvier 2025 a avril 2027. Rien n est retire un vendredi, ni entre le 15 decembre et le 5 janvier.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* ================= Les bibliotheques : un registre, pas un chapitre ===
              Quatre lignes numerotees sur toute la largeur, la commande
              d installation posee au bord droit comme une reference. */}
          <section id="clients" aria-labelledby="clients-titre" className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-8 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-end">
                <h2
                  id="clients-titre"
                  className="o-m-0 o-text-balance o-text-zinc-950 dark:o-text-zinc-50 md:o-col-span-7"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.4vw, 3.5rem)' }}
                >
                  Quatre clients, generes depuis le meme contrat.
                </h2>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5">
                  Une route ajoutee arrive dans les quatre le jour de sa publication. Aucune n est obligatoire : l interface reste du HTTP et du JSON.
                </p>
              </div>

              <ol className="o-m-0 o-mt-14 o-list-none o-border-t o-p-0" style={{ borderColor: FILET }}>
                {BIBLIOTHEQUES.map((bibliotheque, rang) => (
                  <li key={bibliotheque.paquet} className="o-grid o-gap-x-6 o-gap-y-3 o-border-b o-py-7 md:o-grid-cols-12 md:o-items-baseline" style={{ borderColor: FILET }}>
                    <span aria-hidden="true" className="o-font-mono o-text-xs o-tabular-nums o-tracking-widest md:o-col-span-1" style={{ color: ENCRE }}>
                      {String(rang + 1).padStart(2, '0')}
                    </span>
                    <div className="md:o-col-span-4">
                      <h3 className="o-m-0 o-font-mono o-text-lg o-font-bold o-tracking-tight">{bibliotheque.paquet}</h3>
                      <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                        <span style={{ color: ENCRE }}>v{bibliotheque.version}</span> — {bibliotheque.langage}
                      </p>
                    </div>
                    <p className="o-m-0 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-4">{bibliotheque.note}</p>
                    <code className="o-justify-self-start o-rounded-md o-px-2 o-py-1 o-font-mono o-text-xs o-whitespace-nowrap md:o-col-span-3 md:o-justify-self-end" style={{ backgroundColor: VOILE, color: ENCRE }}>
                      {bibliotheque.installation}
                    </code>
                  </li>
                ))}
              </ol>
              <p className="o-mt-6 o-max-w-2xl o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Une bibliotheque en retard de plus d une version mineure sur le service est signalee sur la page d etat. Les clients communautaires — Ruby, Rust, Elixir — sont listes dans la documentation, sans engagement de notre part.
              </p>
            </div>
          </section>

          {/* ================= Les limites : un tableau, en mono ============= */}
          <section id="limites" aria-labelledby="limites-titre" className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-px-6 o-py-20 md:o-px-8 md:o-py-28">
            <div className="o-mx-auto o-max-w-7xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">Les limites</p>
              <h2 id="limites-titre" className="o-m-0 o-mt-5 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}>
                Ecrites avant que vous les touchiez.
              </h2>

              <div className="o-mt-14 o-grid o-gap-10 lg:o-grid-cols-12">
                {/* Les quatre plafonds, en chiffres tabulaires. */}
                <table className="o-w-full o-text-left lg:o-col-span-5">
                  <caption className="o-sr-only">Les quatre plafonds de l offre publique</caption>
                  <thead className="o-sr-only">
                    <tr>
                      <th scope="col">Valeur</th>
                      <th scope="col">Limite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAFONDS.map((p) => (
                      <tr key={p.libelle} className="o-border-t" style={{ borderColor: FILET }}>
                        <td className="o-py-5 o-pr-6 o-align-top o-font-mono o-text-2xl o-font-bold o-tabular-nums o-tracking-tight o-whitespace-nowrap md:o-text-3xl" style={{ color: ENCRE }}>
                          {p.valeur}
                        </td>
                        <th scope="row" className="o-py-5 o-align-top o-text-left o-font-normal">
                          <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-50">{p.libelle}</span>
                          <span className="o-mt-1 o-block o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">{p.detail}</span>
                        </th>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Les debits par palier. */}
                <div className="o-overflow-x-auto lg:o-col-span-7">
                  <table className="o-w-full o-text-left o-text-sm" style={{ minWidth: 560 }}>
                    <caption className="o-py-3 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                      Debits par palier de compte
                    </caption>
                    <thead>
                      <tr>
                        <Entete>Palier</Entete>
                        <Entete>Requetes</Entete>
                        <Entete>Ecritures</Entete>
                        <Entete>Rafale</Entete>
                        <Entete>Rappels</Entete>
                      </tr>
                    </thead>
                    <tbody>
                      {DEBITS.map((debit) => (
                        <tr key={debit.palier}>
                          <th scope="row" className="o-px-4 o-py-4 o-font-mono o-text-xs o-font-normal o-whitespace-nowrap" style={{ borderTop: `1px solid ${FILET}` }}>
                            {debit.palier}
                          </th>
                          {[debit.requetes, debit.ecritures, debit.rafale, debit.rappels].map((valeur, rang) => (
                            <td key={rang} className="o-px-4 o-py-4 o-font-mono o-text-sm o-tabular-nums o-whitespace-nowrap o-text-zinc-700 dark:o-text-zinc-300" style={{ borderTop: `1px solid ${FILET}` }}>
                              {valeur}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="o-mt-4 o-max-w-xl o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                    Le palier verifie s obtient en deposant un justificatif d entreprise dans la console ; il est accorde sous un jour ouvre. Chaque reponse porte X-Quota-Restant et X-Quota-Reinit : votre client n a jamais besoin de compter lui-meme.
                  </p>
                </div>
              </div>

              {/* Figure 03 : entre les deux tableaux de debits et la grille de
                  prix, le mecanisme que tous deux chiffrent sans le montrer. */}
              <figure className="o-m-0 o-mt-16 o-grid o-gap-10 o-border-t o-pt-12 lg:o-grid-cols-12" style={{ borderColor: FILET }}>
                <figcaption className="lg:o-col-span-3">
                  <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                    Figure 03
                  </span>
                  <span className="o-mt-3 o-block o-text-lg o-font-medium o-text-zinc-950 dark:o-text-zinc-50">Le seau a jetons</span>
                  <span className="o-mt-3 o-block o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                    Le seau se remplit de dix jetons la seconde, quoi qu il arrive. Une rafale le vide d un coup, et la requete suivante part en 429 avec le delai a attendre.
                  </span>
                </figcaption>
                <div className="o-min-w-0 o-overflow-x-auto o-pb-2 lg:o-col-span-9">
                  <FigureSeau />
                </div>
              </figure>

              {/* Le prix de l unite : la seule grille tarifaire de la page. */}
              <div className="o-mt-14 o-overflow-x-auto">
                <table className="o-w-full o-text-left o-text-sm">
                  <caption className="o-py-3 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Facture a l unite consommee — une unite vaut une ecriture ou une liste
                  </caption>
                  <thead>
                    <tr>
                      <Entete>Tranche mensuelle</Entete>
                      <Entete>Prix unitaire</Entete>
                      <Entete>Precision</Entete>
                    </tr>
                  </thead>
                  <tbody>
                    {PALIERS.map((palier) => (
                      <tr key={palier.tranche}>
                        <th scope="row" className="o-px-4 o-py-4 o-font-mono o-text-xs o-font-normal o-whitespace-nowrap" style={{ borderTop: `1px solid ${FILET}` }}>
                          {palier.tranche}
                        </th>
                        <td className="o-px-4 o-py-4 o-font-mono o-text-lg o-font-bold o-tabular-nums o-whitespace-nowrap" style={{ borderTop: `1px solid ${FILET}`, color: ENCRE }}>
                          {palier.prix}
                        </td>
                        <td className="o-px-4 o-py-4 o-text-zinc-600 dark:o-text-zinc-400" style={{ borderTop: `1px solid ${FILET}` }}>
                          {palier.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ================= Le journal ===================================== */}
          {/*
            La pastille « Evolution » du journal lit `--o-palette-brand-600`
            directement : la variable est redonnee ici, pour cette section
            seule, avec la meme encre que le reste de la page.
          */}
          <section
            id="journal"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-20 md:o-px-8 md:o-py-28"
            style={{ '--o-palette-brand-600': ENCRE } as CSSProperties}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-4">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">Le journal</p>
                <h2 className="o-m-0 o-mt-5 o-flex o-items-center o-gap-3 o-text-zinc-950 dark:o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
                  <Icon icon={GitBranch} size={28} style={{ color: ENCRE }} aria-hidden="true" />
                  Ce qui a change.
                </h2>
                <p className="o-mt-4 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Quatre versions, datees. Ce qui est ajoute, ce qui evolue, ce qui est retire, dans cet ordre.
                </p>
              </div>
              <div className="lg:o-col-span-8">
                <Changelog
                  label="Journal des versions de l interface Portail"
                  title={<span className="o-sr-only">Journal des versions</span>}
                  releases={[
                    {
                      version: '3.8.0',
                      date: '9 avril 2026',
                      dateTime: '2026-04-09',
                      summary: 'Le calcul de tarif compare desormais sept transporteurs au lieu de cinq.',
                      notes: [
                        { kind: 'ajout', text: 'POST /v3/tarifs:calculer accepte le champ delai_max_jours.' },
                        { kind: 'ajout', text: 'Deux transporteurs allemands entrent au catalogue.' },
                        { kind: 'evolution', text: 'Le median de reponse passe de 310 ms a 240 ms sur les ecritures.' },
                      ],
                    },
                    {
                      version: '3.7.2',
                      date: '21 mars 2026',
                      dateTime: '2026-03-21',
                      notes: [
                        { kind: 'correction', text: 'Une cle d idempotence rejouee apres 23 h rendait 409 au lieu de la reponse d origine.' },
                        { kind: 'correction', text: 'X-Quota-Reinit etait absent des reponses 429.' },
                      ],
                    },
                    {
                      version: '3.7.0',
                      date: '4 mars 2026',
                      dateTime: '2026-03-04',
                      summary: 'Les rappels sont signes, et le sont retroactivement.',
                      notes: [
                        { kind: 'ajout', text: 'Signature HMAC-SHA256 sur chaque rappel, avec fenetre de 5 minutes.' },
                        { kind: 'evolution', text: 'La pagination passe au curseur opaque ; les offsets restent lus jusqu au 1er mars 2027.' },
                        { kind: 'retrait', text: 'Le champ prix_euros disparait au profit de prix_cents, annonce en 3.4.0.' },
                      ],
                    },
                    {
                      version: '3.6.1',
                      date: '12 fevrier 2026',
                      dateTime: '2026-02-12',
                      notes: [{ kind: 'correction', text: 'Le corps des erreurs 500 n etait pas du JSON quand la passerelle expirait.' }],
                    },
                  ]}
                />
              </div>
            </div>
          </section>
        </main>

        {/* ================= Le pied : noir, trois champs soulignes ========= */}
        <footer id="pied" className="o-scroll-mt-24 o-px-6 o-pb-10 o-pt-20 o-text-zinc-50 md:o-px-8 md:o-pt-28" style={nuit('zinc')}>
          <div className="o-mx-auto o-max-w-7xl">
            <p className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              <Icon icon={Braces} size={14} style={{ color: accent(300) }} aria-hidden="true" />
              Une cle de test — zero configuration, zero carte
            </p>
            <p className="o-m-0 o-mt-6 o-max-w-4xl o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}>
              Dites-nous ce que vous expediez. La cle arrive dans la minute.
            </p>

            <form
              className="o-mt-16 o-grid o-items-end o-gap-x-10 o-gap-y-8 md:o-grid-cols-12"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <Champ nom="Votre nom" className="md:o-col-span-3" />
              <Champ nom="Votre courriel" type="email" className="md:o-col-span-4" />
              <Champ nom="Ce que vous expediez" className="md:o-col-span-3" />
              <div className="md:o-col-span-2">
                <button
                  type="submit"
                  className="o-inline-flex o-w-full o-items-center o-justify-between o-gap-2 o-border-b o-border-white-20 o-bg-transparent o-py-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-50 o-transition-colors hover:o-border-white focus:o-ring"
                  style={{ borderRadius: 0 }}
                >
                  Recevoir la cle <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
                </button>
              </div>
            </form>
            <p className="o-mt-4 o-max-w-xl o-text-xs o-leading-relaxed o-text-zinc-400">
              Le bac a sable rend des etiquettes valides mais non expediables, avec les memes codes d erreur qu en production. Les dix mille premieres unites de chaque mois restent offertes une fois passe en direct.
            </p>

            <div className="o-mt-20 o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-x-6 o-gap-y-2 o-p-0">
                {[
                  ['#reference', 'Reference v3'],
                  ['#versions', 'Migration v2 vers v3'],
                  ['#erreurs', 'Codes d erreur'],
                  ['#limites', 'Etat du service'],
                  ['#sommet', 'Mentions legales'],
                ].map(([href, mot]) => (
                  <li key={mot}>
                    <a href={href} className="o-no-underline o-text-zinc-400 o-transition-colors hover:o-text-zinc-50 focus:o-ring">
                      {mot}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="o-m-0">© 2026 Portail SAS — api.portail.example</p>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
