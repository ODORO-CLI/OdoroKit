/**
 * Cadre — architecture et biens.
 *
 * ## Le parti pris : la couverture d une revue
 *
 * Une agence qui vend de l architecture montre un lieu avant de se raconter.
 * La page ouvre donc sur une seule photographie plein cadre qui recule quand
 * on defile, et sur le mot-marque pose en bas, a la largeur de l ecran, dont
 * les lettres s ecartent au defilement — la signature d Aerra. Aucun chiffre
 * avant le titre, aucun bouton avant le paragraphe.
 *
 * ## Ce que la page fait
 *
 * 1. **une recherche** par type, surface minimale et budget, qui filtre les
 *    six biens illustres comme le reste du catalogue ;
 * 2. **une estimation en ligne** : commune, type, surface et etat donnent une
 *    fourchette et le montant des honoraires qui s y appliquent ;
 * 3. **le bareme d honoraires**, affiche integralement — la loi l impose.
 *
 * ## Les chiffres
 *
 * Aucune barre de nombres. Les chiffres d un bien — surface, pieces, prix —
 * sont poses sur sa photographie, en legende, la ou un acquereur les cherche.
 * Le reste (diagnostics, charges, taxe) tient sur une ligne en mono sous la
 * photo.
 *
 * ## Le fond
 *
 * Une photographie a l ouverture ; la maquette volumetrique `CityBlocks`,
 * descendue au milieu de la page en bandeau, juste avant l outil qui chiffre.
 * Rien d autre ne bouge derriere le texte.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, Search } from '@odoro-cli/icons/outline'
import { Select, Slider } from '@odoro-cli/libs/ui'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { CityBlocks } from '@/odoro/background/CityBlocks.jsx'
import { Spotlight } from '@/odoro/effect/Spotlight.jsx'
import { HoverZoom } from '@/odoro/image/HoverZoom.jsx'
import { ImageMaskText } from '@/odoro/image/ImageMaskText.jsx'
import { GlassSurface } from '@/odoro/ui/GlassSurface.jsx'

import { nuit, Voile } from './communs.jsx'
import { photo } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Accent,
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Horloge,
  Indice,
  Porte,
  Surgit,
  usePolices,
} from './marche.jsx'
import { Devoile, Eclate, Flotte, Parallaxe, ZoomDefile } from './scene.jsx'

/** Filet tire de l encre courante : le systeme n a pas de classe pour cela. */
const FILET = 'color-mix(in oklab, currentColor 18%, transparent)'

/** Un aplat d accent dont l encre est le fond du theme : il s inverse seul. */
const APLAT: CSSProperties = { ...aplat() }

/** Les liens de la barre en coins. */
const NAVIGATION = [
  ['#biens', 'Les biens'],
  ['#visite', 'Le lieu du mois'],
  ['#estimation', 'Estimer'],
  ['#contact', 'Nous joindre'],
] as const

/** Les biens illustres, ceux que l agence met en avant ce mois-ci. */
const BIENS = [
  {
    graine: 'cadre-bien-corniche',
    reference: 'CDR-118',
    nom: 'La Corniche',
    lieu: 'Saint-Jean-de-Luz',
    type: 'Maison',
    architecte: 'Marie-Jose Van Hee, 1998',
    surface: 214,
    pieces: 6,
    prix: 1380000,
    prixTexte: '1 380 000 €',
    dpe: 'C',
    ges: 'B',
    charges: '2 100 € par an',
    taxe: '3 180 € par an',
    statut: 'Visites le samedi',
    alt: 'Maison basse en beton clair posee sur une falaise, ouverte sur la mer par une baie continue',
  },
  {
    graine: 'cadre-bien-atelier',
    reference: 'CDR-124',
    nom: 'Atelier Rue Vergniaud',
    lieu: 'Paris 13e',
    type: 'Atelier',
    architecte: 'Ancienne fabrique, 1911',
    surface: 168,
    pieces: 4,
    prix: 1145000,
    prixTexte: '1 145 000 €',
    dpe: 'D',
    ges: 'C',
    charges: '3 640 € par an',
    taxe: '2 420 € par an',
    statut: 'Nouveau',
    alt: 'Atelier d artiste en brique et verriere metallique, hauteur sous plafond de cinq metres',
  },
  {
    graine: 'cadre-bien-ferme',
    reference: 'CDR-131',
    nom: 'La Grange Basse',
    lieu: 'Vallee de la Drome',
    type: 'Maison',
    architecte: 'Rehabilitation Perraudin, 2019',
    surface: 302,
    pieces: 8,
    prix: 890000,
    prixTexte: '890 000 €',
    dpe: 'C',
    ges: 'B',
    charges: '1 850 € par an',
    taxe: '2 340 € par an',
    statut: 'Lieu du mois',
    alt: 'Grange en pierre seche rehabilitee, longue toiture a deux pans et cour interieure plantee',
  },
  {
    graine: 'cadre-bien-tour',
    reference: 'CDR-136',
    nom: 'Etage 17, Tour Albert',
    lieu: 'Paris 13e',
    type: 'Appartement',
    architecte: 'Edouard Albert, 1960',
    surface: 96,
    pieces: 3,
    prix: 742000,
    prixTexte: '742 000 €',
    dpe: 'E',
    ges: 'D',
    charges: '4 980 € par an',
    taxe: '1 640 € par an',
    statut: 'Travaux votes en 2027',
    alt: 'Sejour d appartement en hauteur, fenetre d angle sur les toits de zinc de la ville',
  },
  {
    graine: 'cadre-bien-dune',
    reference: 'CDR-140',
    nom: 'Maison des Dunes',
    lieu: 'Le Touquet',
    type: 'Maison',
    architecte: 'Jean Prouve, esprit, 2004',
    surface: 145,
    pieces: 5,
    prix: 985000,
    prixTexte: '985 000 €',
    dpe: 'B',
    ges: 'A',
    charges: '1 420 € par an',
    taxe: '2 010 € par an',
    statut: 'Visites le samedi',
    alt: 'Chemin de sable menant a une maison isolee, entre les oyats',
  },
  {
    graine: 'cadre-bien-cour',
    reference: 'CDR-144',
    nom: 'Hotel particulier Sainte-Croix',
    lieu: 'Bordeaux',
    type: 'Hotel particulier',
    architecte: 'XVIIIe, restaure en 2021',
    surface: 388,
    pieces: 11,
    prix: 2240000,
    prixTexte: '2 240 000 €',
    dpe: 'D',
    ges: 'C',
    charges: '5 200 € par an',
    taxe: '6 480 € par an',
    statut: 'Monument inscrit',
    alt: 'Cour pavee d un hotel particulier en pierre blonde, escalier a double revolution au fond',
  },
] as const

/**
 * Le reste du catalogue.
 *
 * Une agence ne photographie pas tout : ces biens-la sont a la vente sans etre
 * mis en avant, et ils obeissent au meme filtre.
 */
const CATALOGUE = [
  {
    reference: 'CDR-102',
    nom: 'Duplex Quai des Chartrons',
    lieu: 'Bordeaux',
    type: 'Appartement',
    surface: 121,
    pieces: 4,
    prix: 695000,
    prixTexte: '695 000 €',
    dpe: 'C',
  },
  {
    reference: 'CDR-109',
    nom: 'Le Long Bureau',
    lieu: 'Nantes',
    type: 'Atelier',
    surface: 245,
    pieces: 5,
    prix: 810000,
    prixTexte: '810 000 €',
    dpe: 'D',
  },
  {
    reference: 'CDR-121',
    nom: 'Maison Basse de Cenon',
    lieu: 'Cenon',
    type: 'Maison',
    surface: 132,
    pieces: 5,
    prix: 465000,
    prixTexte: '465 000 €',
    dpe: 'E',
  },
  {
    reference: 'CDR-128',
    nom: 'Trois pieces sur cour, Belleville',
    lieu: 'Paris 20e',
    type: 'Appartement',
    surface: 68,
    pieces: 3,
    prix: 589000,
    prixTexte: '589 000 €',
    dpe: 'D',
  },
  {
    reference: 'CDR-134',
    nom: 'La Maison Blanche d Anglet',
    lieu: 'Anglet',
    type: 'Maison',
    surface: 178,
    pieces: 6,
    prix: 1120000,
    prixTexte: '1 120 000 €',
    dpe: 'B',
  },
  {
    reference: 'CDR-142',
    nom: 'Hotel de Sarrance',
    lieu: 'Pau',
    type: 'Hotel particulier',
    surface: 410,
    pieces: 12,
    prix: 1490000,
    prixTexte: '1 490 000 €',
    dpe: 'F',
  },
] as const

/** Les types proposes au filtre, dans l ordre du catalogue. */
const TYPES = [
  'Tous les biens',
  'Maison',
  'Appartement',
  'Atelier',
  'Hotel particulier',
] as const

/** Les communes ou l agence estime, avec leur prix median au metre carre. */
const COMMUNES = [
  { cle: 'bordeaux', nom: 'Bordeaux — Chartrons', maison: 5400, appartement: 4900 },
  { cle: 'paris13', nom: 'Paris 13e', maison: 10200, appartement: 9600 },
  { cle: 'nantes', nom: 'Nantes — Ile de Nantes', maison: 4300, appartement: 4050 },
  { cle: 'touquet', nom: 'Le Touquet', maison: 6800, appartement: 6100 },
  { cle: 'drome', nom: 'Vallee de la Drome', maison: 2450, appartement: 2100 },
] as const

/** L etat du bien, et ce qu il fait au prix. */
const ETATS = [
  { cle: 'renover', libelle: 'A renover entierement', facteur: 0.76 },
  { cle: 'correct', libelle: 'Habitable, a rafraichir', facteur: 0.93 },
  { cle: 'renove', libelle: 'Renove recemment', facteur: 1.08 },
  { cle: 'architecte', libelle: 'Signe d un architecte', facteur: 1.22 },
] as const

/**
 * Le bareme d honoraires de vente.
 *
 * Son affichage est une obligation : l arrete du 10 janvier 2017 impose au
 * professionnel de publier ses honoraires, toutes taxes comprises, la ou le
 * public les voit.
 */
const HONORAIRES_VENTE = [
  ['Jusqu a 150 000 €', '7 500 € forfaitaires'],
  ['De 150 001 a 400 000 €', '5,0 %'],
  ['De 400 001 a 900 000 €', '4,2 %'],
  ['De 900 001 a 1 500 000 €', '3,6 %'],
  ['Au-dela de 1 500 000 €', '2,9 %'],
] as const

/** Le bareme de location, plafonne par decret selon la zone. */
const HONORAIRES_LOCATION = [
  ['Zone tres tendue — visite, dossier, bail', '12 € par m²'],
  ['Zone tendue', '10 € par m²'],
  ['Reste du territoire', '8 € par m²'],
  ['Etat des lieux d entree', '3 € par m²'],
  ['Part bailleur', 'Au moins egale a la part locataire'],
] as const

/** La fiche technique du lieu du mois. */
const FICHE_LIEU = [
  ['Surface habitable', '302 m² (Carrez : 288 m²)'],
  ['Terrain', '4 100 m² clos, non constructible'],
  ['Pieces', '8, dont 5 chambres'],
  ['Construction', '1780, rehabilitee en 2019'],
  ['Chauffage', 'Pompe a chaleur, poele de masse'],
  ['Energie / climat', 'C — 118 kWh/m² · B — 12 kg CO2/m²'],
  ['Charges annuelles', '1 850 €'],
  ['Taxe fonciere 2025', '2 340 €'],
  ['Prix net vendeur', '890 000 €'],
  ['Honoraires vendeur', '37 380 €, soit 4,2 %'],
] as const

/**
 * Les motifs de la mosaique.
 *
 * Chaque tuile dit sa place sur les douze colonnes, le rapport de sa
 * photographie, son decalage vertical, et la vitesse a laquelle elle derive
 * quand on defile. Aucune rangee ne finit ou commence a la meme hauteur que
 * la precedente, et une colonne reste vide a chaque rangee : c est ce vide
 * qui distingue une mosaique d une grille de cartes.
 *
 * La `glisse` est l inertie : la photo continue de couler apres l arret de la
 * molette, au lieu de se figer avec elle.
 */
/**
 * Un decalage vertical qui s efface sur un petit ecran.
 *
 * En dessous de la grille a douze colonnes, les tuiles sont empilees : un
 * decalage y creerait un trou sans raison. La valeur en `vw` fait fondre le
 * decalage vers zero quand la fenetre retrecit, dans les deux sens.
 */
function decale(rem: number): string {
  if (rem === 0) return '0rem'
  const course = `${(Math.abs(rem) * 1.3).toFixed(1)}vw`
  return rem > 0
    ? `clamp(0rem, ${course}, ${String(rem)}rem)`
    : `clamp(${String(rem)}rem, -${course}, 0rem)`
}

interface Motif {
  readonly place: string
  readonly ratio: number
  /** Decalage vertical, en rem : il creuse la rangee sans jamais couvrir la legende de la tuile du dessus. */
  readonly decalage: number
  readonly vitesse: number
  readonly glisse: number
  /** Vrai pour une tuile de trois ou quatre colonnes : le prix y passe sous le nom, en plus petit. */
  readonly etroit?: boolean
}

const MOTIFS: readonly Motif[] = [
  {
    place: 'md:o-col-span-7 md:o-col-start-1',
    ratio: 4 / 3,
    decalage: 0,
    vitesse: 0.14,
    glisse: 0.62,
  },
  {
    place: 'md:o-col-span-4',
    ratio: 3 / 4,
    decalage: 5,
    vitesse: -0.11,
    glisse: 0.82,
    etroit: true,
  },
  {
    place: 'md:o-col-span-5 md:o-col-start-2',
    ratio: 1,
    decalage: 4,
    vitesse: 0.2,
    glisse: 0.55,
  },
  { place: 'md:o-col-span-5', ratio: 5 / 4, decalage: 1, vitesse: -0.16, glisse: 0.74 },
  {
    place: 'md:o-col-span-8 md:o-col-start-1',
    ratio: 16 / 9,
    decalage: 7,
    vitesse: 0.1,
    glisse: 0.85,
  },
  {
    place: 'md:o-col-span-3',
    ratio: 3 / 4,
    decalage: 2,
    vitesse: -0.22,
    glisse: 0.68,
    etroit: true,
  },
]

/** Un intitule de section : l indice en mono, le titre en grande graisse legere. */
function Titre({
  rang,
  surtitre,
  children,
  sombre = false,
}: {
  readonly rang: string
  readonly surtitre: string
  readonly children: ReactNode
  readonly sombre?: boolean
}): ReactElement {
  return (
    <div>
      <Indice rang={rang} sombre={sombre}>
        {surtitre}
      </Indice>
      <h2
        className={`o-m-0 o-mt-5 ${sombre ? 'o-text-stone-50' : 'o-text-stone-950 dark:o-text-stone-50'}`}
        style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}
      >
        {children}
      </h2>
    </div>
  )
}

/**
 * Une tuile de la mosaique.
 *
 * Les chiffres sont poses sur la photographie : la surface, les pieces, le
 * prix, dans le tiers bas assombri. Le reste de la fiche tient sur une ligne
 * en mono sous l image.
 */
function Tuile({
  bien,
  rang,
}: {
  readonly bien: (typeof BIENS)[number]
  readonly rang: number
}): ReactElement {
  const motif = MOTIFS[rang % MOTIFS.length] ?? MOTIFS[0]
  if (motif === undefined) return <div />
  const { place, ratio, decalage, vitesse, glisse, etroit = false } = motif
  return (
    <Parallaxe
      as="figure"
      vitesse={vitesse}
      glisse={glisse}
      className={`o-m-0 o-min-w-0 ${place}`}
      style={{ marginTop: decale(decalage) }}
    >
      <a href="#visite" className="o-block o-no-underline o-text-current focus:o-ring">
        <div className="o-relative o-overflow-hidden o-rounded-sm">
          <HoverZoom
            src={photo(bien.graine, 1200, 900)}
            alt={bien.alt}
            ratio={ratio}
            zoom={1.1}
            duration={700}
            className="o-w-full"
          />
          {/* Le voile du tiers bas, et les chiffres poses dessus. */}
          <div
            className="o-pointer-events-none o-absolute o-inset-0 o-flex o-flex-col o-justify-between o-p-4 o-text-stone-50 md:o-p-5"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 22%), linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 38%, transparent 60%)',
            }}
          >
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-200">
              {bien.reference} — {bien.statut}
            </p>
            <div
              className={
                etroit
                  ? 'o-flex o-flex-col o-gap-2'
                  : 'o-flex o-flex-wrap o-items-end o-justify-between o-gap-x-6 o-gap-y-2'
              }
            >
              <div>
                <h3
                  className={`o-m-0 o-font-medium o-tracking-tight ${etroit ? 'o-text-lg' : 'o-text-xl md:o-text-2xl'}`}
                >
                  {bien.nom}
                </h3>
                <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-300">
                  {bien.lieu} — {bien.type}
                </p>
              </div>
              <p className={`o-m-0 o-tabular-nums ${etroit ? '' : 'o-text-right'}`}>
                <span
                  className="o-block o-tracking-tight"
                  style={{
                    ...affiche('m', 300),
                    fontSize: etroit
                      ? 'clamp(1.25rem, 1.8vw, 1.75rem)'
                      : 'clamp(1.5rem, 2.6vw, 2.5rem)',
                  }}
                >
                  {bien.prixTexte}
                </span>
                <span className="o-block o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-300">
                  {bien.surface} m² · {bien.pieces} pieces
                </span>
              </p>
            </div>
          </div>
        </div>
      </a>
      <figcaption className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
        {bien.architecte} · energie {bien.dpe} · climat {bien.ges} · charges{' '}
        {bien.charges} · taxe {bien.taxe}
      </figcaption>
    </Parallaxe>
  )
}

/**
 * La recherche de biens.
 *
 * Trois criteres — le type, la surface minimale, le budget — appliques aux
 * six annonces illustrees comme au reste du catalogue.
 */
function Recherche(): ReactElement {
  const [type, setType] = useState<string>('Tous les biens')
  const [surface, setSurface] = useState(0)
  const [budget, setBudget] = useState(2500000)

  const retient = (bien: { type: string; surface: number; prix: number }): boolean =>
    (type === 'Tous les biens' || bien.type === type) &&
    bien.surface >= surface &&
    bien.prix <= budget

  const illustres = BIENS.filter(retient)
  const autres = CATALOGUE.filter(retient)
  const total = illustres.length + autres.length

  return (
    <>
      {/* --- Les trois criteres, sur un filet ------------------------- */}
      <form
        aria-label="Rechercher un bien"
        className="o-mt-12 o-grid o-gap-6 o-border-t o-border-b o-border-stone-300 o-py-6 dark:o-border-stone-800 md:o-grid-cols-3 md:o-gap-10"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <Select
          label="Type de bien"
          name="type"
          value={type}
          options={TYPES.map((t) => ({ value: t, label: t }))}
          onChange={(event) => {
            setType(event.currentTarget.value)
          }}
        />
        <Slider
          label="Surface minimale"
          min={0}
          max={400}
          step={10}
          value={surface}
          showValue
          formatValue={(v) => `${String(v)} m²`}
          onChange={(event) => {
            setSurface(Number(event.currentTarget.value))
          }}
        />
        <Slider
          label="Budget maximal"
          min={400000}
          max={2500000}
          step={50000}
          value={budget}
          showValue
          formatValue={(v) => `${v.toLocaleString('fr-FR')} €`}
          onChange={(event) => {
            setBudget(Number(event.currentTarget.value))
          }}
        />
      </form>

      <p
        aria-live="polite"
        className="o-mt-5 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400"
      >
        <Icon icon={Search} size={13} aria-hidden="true" />
        {total === 0
          ? 'Aucun bien ne repond a ces criteres — elargissez le budget ou la surface.'
          : `${String(total)} bien${total > 1 ? 's' : ''} sur ${String(BIENS.length + CATALOGUE.length)}`}
      </p>

      {/* --- La mosaique -------------------------------------------- */}
      {illustres.length > 0 && (
        <div className="o-mt-10 o-grid o-gap-x-6 o-gap-y-12 md:o-grid-cols-12 md:o-items-start">
          {illustres.map((b, rang) => (
            <Tuile key={b.reference} bien={b} rang={rang} />
          ))}
        </div>
      )}

      {/* --- Le reste du catalogue, en mono ---------------------------- */}
      {autres.length > 0 && (
        <div className="o-mt-20 o-grid o-gap-8 md:o-grid-cols-12">
          <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-600 dark:o-text-stone-400 md:o-col-span-3">
            Egalement au catalogue, sans photographie. Le dossier de diagnostics est
            envoye sur demande.
          </p>
          <div className="o-relative o-overflow-x-auto o-border-t o-border-stone-300 dark:o-border-stone-800 md:o-col-span-9">
            <table className="o-w-full o-min-w-full o-text-left o-text-sm">
              <caption className="o-sr-only">
                Les autres biens du catalogue repondant a la recherche
              </caption>
              <thead className="o-sr-only">
                <tr>
                  <th scope="col">Bien</th>
                  <th scope="col">Type</th>
                  <th scope="col">Surface</th>
                  <th scope="col">Energie</th>
                  <th scope="col">Prix net vendeur</th>
                </tr>
              </thead>
              <tbody>
                {autres.map((b) => (
                  <tr
                    key={b.reference}
                    className="o-border-b o-border-stone-300 dark:o-border-stone-800"
                  >
                    <th scope="row" className="o-py-3 o-pr-4 o-font-normal">
                      <span className="o-block o-text-stone-900 dark:o-text-stone-100">
                        {b.nom}
                      </span>
                      <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                        {b.reference} — {b.lieu}
                      </span>
                    </th>
                    <td className="o-py-3 o-pr-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                      {b.type}
                    </td>
                    <td className="o-py-3 o-pr-4 o-text-right o-font-mono o-text-xs o-tabular-nums o-text-stone-600 dark:o-text-stone-400">
                      {b.surface} m² · {b.pieces} p.
                    </td>
                    <td className="o-py-3 o-pr-4 o-text-right o-font-mono o-text-xs o-text-stone-600 dark:o-text-stone-400">
                      {b.dpe}
                    </td>
                    <td className="o-py-3 o-text-right o-font-mono o-tabular-nums o-text-stone-900 dark:o-text-stone-100">
                      {b.prixTexte}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * L estimation en ligne.
 *
 * Le prix median au metre carre de la commune, corrige par l etat du bien,
 * donne une fourchette de plus ou moins huit pour cent. Les honoraires du
 * bareme sont appliques a la valeur haute, puisque c est celle qui inquiete.
 */
function Estimation(): ReactElement {
  const [commune, setCommune] = useState<string>('bordeaux')
  const [type, setType] = useState<string>('maison')
  const [surface, setSurface] = useState(120)
  const [etat, setEtat] = useState<string>('correct')

  const lieu = COMMUNES.find((c) => c.cle === commune) ?? COMMUNES[0]
  const condition = ETATS.find((e) => e.cle === etat) ?? ETATS[1]
  const base = type === 'maison' ? lieu.maison : lieu.appartement
  const centre = base * surface * condition.facteur
  const bas = Math.round((centre * 0.92) / 1000) * 1000
  const haut = Math.round((centre * 1.08) / 1000) * 1000

  const tauxHonoraires =
    haut <= 150000
      ? 0
      : haut <= 400000
        ? 0.05
        : haut <= 900000
          ? 0.042
          : haut <= 1500000
            ? 0.036
            : 0.029
  const honoraires = tauxHonoraires === 0 ? 7500 : Math.round(haut * tauxHonoraires)

  return (
    <div className="o-grid o-gap-12 lg:o-grid-cols-12">
      <form
        aria-label="Estimer un bien"
        className="o-space-y-6 lg:o-col-span-5"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <Select
          label="Commune"
          name="commune"
          value={commune}
          options={COMMUNES.map((c) => ({ value: c.cle, label: c.nom }))}
          onChange={(event) => {
            setCommune(event.currentTarget.value)
          }}
          hint="Nous estimons la ou nous avons vendu ces trois dernieres annees."
        />

        <fieldset className="o-p-0">
          <legend className="o-text-sm o-font-medium o-text-stone-900 dark:o-text-stone-100">
            Type de bien
          </legend>
          <div className="o-mt-3 o-flex o-flex-wrap o-gap-2">
            {[
              { cle: 'maison', libelle: 'Maison' },
              { cle: 'appartement', libelle: 'Appartement' },
            ].map((t) => {
              const actif = t.cle === type
              return (
                <button
                  key={t.cle}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setType(t.cle)
                  }}
                  className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-font-medium o-transition-colors focus:o-ring"
                  style={
                    actif
                      ? { ...APLAT, borderColor: 'transparent' }
                      : { borderColor: FILET, color: 'inherit' }
                  }
                >
                  {t.libelle}
                </button>
              )
            })}
          </div>
        </fieldset>

        <Slider
          label="Surface habitable"
          min={20}
          max={450}
          step={5}
          value={surface}
          showValue
          formatValue={(v) => `${String(v)} m²`}
          onChange={(event) => {
            setSurface(Number(event.currentTarget.value))
          }}
        />

        <Select
          label="Etat du bien"
          name="etat"
          value={etat}
          options={ETATS.map((e) => ({ value: e.cle, label: e.libelle }))}
          onChange={(event) => {
            setEtat(event.currentTarget.value)
          }}
        />
      </form>

      {/* La fourchette s eclaire sous le pointeur : un chiffre qu on regarde. */}
      <Spotlight
        size={460}
        border={false}
        color="color-mix(in oklab, var(--o-vitrine-400) 30%, transparent)"
        className="o-rounded-sm o-p-6 md:o-p-8 lg:o-col-span-7"
        style={{ backgroundColor: accentDoux(400, 10) }}
      >
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
          Fourchette estimee, hors honoraires
        </p>
        <p
          className="o-m-0 o-mt-3 o-tabular-nums"
          style={{
            ...affiche('m', 300),
            fontSize: 'clamp(1.75rem, 3.6vw, 3.5rem)',
            color: encre(),
          }}
        >
          {bas.toLocaleString('fr-FR')} € — {haut.toLocaleString('fr-FR')} €
        </p>

        <dl className="o-m-0 o-mt-8 o-space-y-3 o-text-sm">
          {[
            ['Prix median de la commune', `${base.toLocaleString('fr-FR')} € le m²`],
            [
              'Correction liee a l etat',
              `${condition.facteur.toFixed(2).replace('.', ',')} ×`,
            ],
            [
              'Honoraires du bareme',
              `${honoraires.toLocaleString('fr-FR')} € a la charge du vendeur`,
            ],
          ].map(([terme, valeur]) => (
            <div
              key={terme}
              className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3 o-border-b o-pb-3"
              style={{ borderColor: FILET }}
            >
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                {terme}
              </dt>
              <dd className="o-m-0 o-font-mono o-tabular-nums o-text-stone-900 dark:o-text-stone-100">
                {valeur}
              </dd>
            </div>
          ))}
        </dl>

        <a
          href="#contact"
          className="o-mt-8 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
          style={APLAT}
        >
          Faire confirmer sur place
          <Icon icon={ArrowRight} size={15} aria-hidden="true" />
        </a>

        <p className="o-m-0 o-mt-6 o-max-w-md o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
          Indicative, cette estimation ignore l exposition, l etage, la vue et les
          servitudes. Une estimation ecrite se fait sur place, gratuitement, sans mandat a
          la cle.
        </p>
      </Spotlight>
    </div>
  )
}

/** Un bareme, en mono, sur une bande sombre. */
function Bareme({
  titre,
  lignes,
  note,
}: {
  readonly titre: string
  readonly lignes: readonly (readonly [string, string])[]
  readonly note: string
}): ReactElement {
  return (
    <div>
      <h3 className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
        {titre}
      </h3>
      <dl className="o-m-0 o-mt-4 o-border-t o-border-white-10">
        {lignes.map(([terme, valeur]) => (
          <div
            key={terme}
            className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-6 o-gap-y-1 o-border-b o-border-white-10 o-py-3"
          >
            <dt className="o-text-sm o-text-stone-200">{terme}</dt>
            <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-stone-50">
              {valeur}
            </dd>
          </div>
        ))}
      </dl>
      <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-stone-400">{note}</p>
    </div>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')
  return (
    <Porte forme="compteur" marque="Cadre" sombre={false}>
      <div
        className="o-bg-stone-50 o-text-stone-900 dark:o-bg-stone-950 dark:o-text-stone-100"
        style={polices}
      >
        {/* ================= La couverture : la photo recule, le mot s ecarte ===== */}
        <ZoomDefile
          de={1.12}
          assombrir={0.45}
          className="o-text-stone-50"
          style={{ ...nuit('stone'), minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          fond={
            <div className="o-absolute o-inset-0">
              <img
                src={photo('cadre-bandeau-six', 2000, 1400)}
                alt="Facade moderniste en beton, vue depuis la rue, en noir et blanc"
                width={2000}
                height={1400}
                className="o-absolute o-inset-0 o-size-full o-object-cover"
              />
              <Voile sens="gauche" famille="stone" />
              <Voile sens="haut-bas" famille="stone" />
              <Grain opacite={0.05} />
            </div>
          }
        >
          <BarreCoins
            marque="Cadre"
            liens={NAVIGATION}
            droite={<Horloge ville="Bordeaux" />}
          />
          <div
            id="haut"
            className="o-relative o-flex o-flex-col o-justify-between o-px-6 md:o-px-8"
            style={{ minHeight: `calc(100vh - ${String(CHROME + 66)}px)` }}
          >
            <div className="o-mx-auto o-w-full o-max-w-7xl o-pt-12 md:o-pt-16">
              <Surgit>
                <Etiquette>Architecture et biens — Bordeaux, depuis 1996</Etiquette>
              </Surgit>
              <Surgit
                delai={140}
                as="p"
                className="o-m-0 o-mt-6 o-max-w-md o-text-lg o-leading-relaxed o-text-stone-200"
              >
                Douze lieux dont l architecture est le sujet. La surface, le diagnostic,
                les charges et le prix : tout est ecrit.
              </Surgit>
              <Surgit delai={280} className="o-mt-8">
                <Actions
                  pleine={[
                    '#biens',
                    <>
                      Chercher un bien{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#estimation', 'Estimer le votre']}
                />
              </Surgit>
            </div>
            {/* Le mot-marque, a la largeur de l ecran ; ses lettres s ecartent au defilement. */}
            <Surgit
              delai={420}
              distance={40}
              className="o-pointer-events-none o-mt-16 o-w-full"
            >
              <Eclate
                mot="Cadre"
                as="h1"
                haut={180}
                bas={70}
                className="o-m-0 o-flex o-items-end o-justify-center o-whitespace-nowrap o-text-stone-50"
                style={{
                  ...affiche('xxl', 800),
                  fontSize: 'clamp(5rem, 24vw, 24rem)',
                  lineHeight: 0.78,
                }}
              />
            </Surgit>
          </div>
          <Coin position="hd">
            Numero 44 — printemps 2026
            <br />
            Photographie Camille Roulet
          </Coin>
        </ZoomDefile>

        <main>
          {/* ================= (01) Les biens, en mosaique, chiffres en legende ===== */}
          <section
            id="biens"
            className="o-scroll-mt-24 o-px-6 o-pt-20 md:o-px-8 md:o-pt-28"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-8">
                  <Titre rang="01" surtitre="A la vente — mars 2026">
                    Douze biens, <Accent>montres en grand</Accent>.
                  </Titre>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-600 dark:o-text-stone-400 md:o-col-span-4 md:o-text-right">
                  Prix nets vendeur, hors honoraires
                  <br />
                  Chaque bien visite avant publication
                </p>
              </div>
              <Recherche />
            </div>
          </section>

          {/* ================= (02) La visite : le nom du lieu, rempli de sa photo ===== */}
          <section id="visite" className="o-scroll-mt-24 o-mt-24 md:o-mt-32">
            <ImageMaskText
              src={photo('cadre-lieu-grange', 1600, 1100)}
              alt="Grange en pierre seche rehabilitee, longue toiture a deux pans surplombant une cour plantee d amandiers"
              text="DROME"
              ratio={2.4}
              size={30}
              veil={0.9}
              halo={240}
              className="o-w-full"
            />
            <div className="o-mx-auto o-max-w-7xl o-px-6 md:o-px-8">
              <div className="o-grid o-gap-10 md:o-grid-cols-12">
                {/* La photo remonte sur le mot : une image qui chevauche la section. */}
                <Parallaxe
                  vitesse={0.24}
                  glisse={0.8}
                  className="md:o-col-span-5"
                  style={{ marginTop: 'clamp(-6rem, -8vw, -3rem)' }}
                >
                  <Devoile
                    src={photo('cadre-bien-ferme', 1200, 1500)}
                    alt="La cour interieure de la Grange Basse, sous la charpente de 1780"
                    ratio="4 / 5"
                    depuis="bas"
                    derive={46}
                    className="o-shadow-2xl"
                    legende="CDR-131 — visites le samedi, sur rendez-vous"
                  />
                </Parallaxe>
                <div className="o-pt-4 md:o-col-span-6 md:o-col-start-7 md:o-pt-16">
                  <Titre rang="02" surtitre="Le lieu du mois">
                    La Grange Basse
                  </Titre>
                  <p className="o-m-0 o-mt-6 o-max-w-md o-text-lg o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                    Trois cent deux metres carres sous une charpente de 1780, que Gilles
                    Perraudin a laissee visible. Des murs de vingt-huit centimetres : la
                    maison se chauffe seule jusqu en novembre.
                  </p>
                  <dl className="o-m-0 o-mt-10 o-border-t o-border-stone-300 dark:o-border-stone-800">
                    {FICHE_LIEU.map(([cle, valeur]) => (
                      <div
                        key={cle}
                        className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-6 o-gap-y-1 o-border-b o-border-stone-300 o-py-2.5 dark:o-border-stone-800"
                      >
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                          {cle}
                        </dt>
                        <dd className="o-m-0 o-text-right o-text-sm o-tabular-nums o-text-stone-900 dark:o-text-stone-100">
                          {valeur}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <a
                    href="#contact"
                    className="o-mt-8 o-inline-flex o-items-center o-gap-2 o-text-sm o-font-medium o-text-stone-900 o-no-underline dark:o-text-stone-100 focus:o-ring"
                    style={{ borderBottom: '1px solid currentColor', paddingBottom: 4 }}
                  >
                    Demander une visite{' '}
                    <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ================= La maquette, en bandeau pleine largeur ============ */}
          {/* ================= La maquette : une nuit pleine largeur entre deux ecrans clairs ===== */}
          <figure
            className="o-relative o-isolate o-m-0 o-mt-24 o-overflow-hidden md:o-mt-36"
            style={{ ...nuit('stone'), height: 'clamp(340px, 74vh, 620px)' }}
          >
            <CityBlocks
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-0"
              size={19}
              speed={0.4}
              height={3.1}
              gap={0.22}
              colors={['--o-palette-stone-950', '--o-vitrine-600', '--o-vitrine-300']}
              poster="o-bg-gradient-to-br o-from-stone-900 o-to-stone-950"
            />
            {/* Une legende dans la marge, pas une bande sous l image. */}
            <figcaption className="o-absolute o-inset-0 o-z-10 o-flex o-flex-col o-justify-between o-px-6 o-py-8 md:o-px-8 md:o-py-10">
              <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400">
                (—) La maquette
                <br />
                Chartrons, Bordeaux
              </p>
              <p
                className="o-m-0 o-max-w-lg o-text-stone-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.35rem, 2.6vw, 2.5rem)',
                }}
              >
                On ne vend pas une surface, on vend une place dans une rue.
              </p>
            </figcaption>
          </figure>

          {/* ================= (03) L estimation ================================ */}
          <section
            id="estimation"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-8 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Titre rang="03" surtitre="Estimer">
                    Ce que vaut un bien, avant la visite.
                  </Titre>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400 md:o-col-span-5 md:o-justify-self-end">
                  Le calcul part du prix median de la commune, corrige par l etat du bien.
                  Deux minutes suffisent.
                </p>
              </div>
              <div className="o-mt-14">
                <Estimation />
              </div>
            </div>
          </section>

          {/* ================= (04) Les honoraires : une bande sombre, en mono ===== */}
          <section
            id="honoraires"
            className="o-scroll-mt-24 o-px-6 o-py-16 md:o-px-8 md:o-py-20"
            style={nuit('stone')}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-4">
                <Indice rang="04">Honoraires</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-text-stone-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3vw, 3rem)' }}
                >
                  Le bareme, en entier.
                </h2>
                <p className="o-m-0 o-mt-5 o-max-w-xs o-text-sm o-leading-relaxed o-text-stone-300">
                  L affichage des honoraires est une obligation, et les ecrire en petit en
                  est une violation. Toutes taxes comprises, tels qu affiches 18 rue des
                  Chartrons.
                </p>
              </div>
              <div className="o-grid o-gap-10 sm:o-grid-cols-2 md:o-col-span-8">
                <Bareme
                  titre="Vente — a la charge du vendeur"
                  lignes={HONORAIRES_VENTE}
                  note="Dus au jour de la signature de l acte authentique, jamais avant."
                />
                <Bareme
                  titre="Location — a la charge du locataire"
                  lignes={HONORAIRES_LOCATION}
                  note="Plafonds fixes par le decret du 1er aout 2014 pour une residence principale."
                />
              </div>
            </div>
          </section>

          {/* ================= L appel : une carte flottante, disponible, avec l heure ===== */}
          <section
            id="contact"
            aria-label="Joindre l agence"
            className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-text-stone-50"
            style={{ ...nuit('stone'), minHeight: '88vh' }}
          >
            {/* Le bureau derive derriere la carte, et continue de couler apres l arret du geste. */}
            <Parallaxe
              vitesse={0.3}
              echelle={0.06}
              glisse={0.72}
              className="o-absolute o-inset-0 o-z-0"
            >
              <img
                src={photo('cadre-agence-bureau', 1600, 1000)}
                alt=""
                aria-hidden="true"
                className="o-size-full o-object-cover"
                style={{ minHeight: '108%', marginTop: '-4%' }}
              />
            </Parallaxe>
            <Voile sens="centre" famille="stone" />
            <div
              className="o-relative o-z-10 o-flex o-items-center o-justify-center o-px-6 o-py-24"
              style={{ minHeight: '88vh' }}
            >
              <Flotte amplitude={7} duree={7} angle={-2}>
                <GlassSurface
                  colors={['--o-palette-stone-900', '--o-palette-white']}
                  tint={0.6}
                  blur={22}
                  thickness={1.2}
                  className="o-w-full o-max-w-sm o-rounded-2xl o-p-7"
                >
                  <p className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-200">
                    <span
                      aria-hidden="true"
                      className="o-size-2 o-rounded-full"
                      style={{ backgroundColor: encreSurSombre() }}
                    />
                    Disponible pour une visite
                  </p>
                  <p
                    className="o-m-0 o-mt-5 o-font-mono o-tabular-nums o-tracking-tight o-text-stone-50"
                    style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)', lineHeight: 1 }}
                  >
                    <Horloge ville="Bordeaux" />
                  </p>
                  <p className="o-m-0 o-mt-5 o-text-sm o-leading-relaxed o-text-stone-200">
                    Helene Fabre repond sous deux jours ouvres. Une estimation ecrite se
                    fait sur place, sans mandat a la cle.
                  </p>
                  <div className="o-mt-6 o-flex o-flex-col o-gap-2 o-border-t o-border-white-20 o-pt-5">
                    <a
                      href="mailto:bureau@cadre-architecture.fr"
                      className="o-inline-flex o-items-center o-gap-2 o-text-base o-font-medium o-text-stone-50 o-no-underline focus:o-ring"
                    >
                      bureau@cadre-architecture.fr{' '}
                      <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                    </a>
                    <a
                      href="tel:+33556442188"
                      className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-sm o-text-stone-200 o-no-underline focus:o-ring"
                    >
                      05 56 44 21 88
                    </a>
                  </div>
                </GlassSurface>
              </Flotte>
            </div>
            <Coin position="bg">
              L agence, 18 rue des Chartrons
              <br />
              Photographie Camille Roulet
            </Coin>
          </section>
        </main>

        {/* ================= Le pied : une carte de visite, en grand ============ */}
        <footer className="o-border-t o-border-stone-300 o-px-6 o-pb-8 o-pt-20 dark:o-border-stone-800 md:o-px-8 md:o-pt-28">
          <div className="o-mx-auto o-max-w-7xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
              Cadre — architecture et biens
            </p>
            <p
              className="o-m-0 o-mt-6 o-text-stone-950 dark:o-text-stone-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.25rem, 6.5vw, 6.5rem)' }}
            >
              18 rue des Chartrons
              <br />
              33000 Bordeaux
            </p>
            <div className="o-mt-16 o-grid o-gap-10 o-border-t o-border-stone-300 o-pt-10 dark:o-border-stone-800 md:o-grid-cols-3">
              <div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                  Horaires
                </p>
                <p className="o-m-0 o-mt-3 o-text-2xl o-tracking-tight o-text-stone-950 dark:o-text-stone-50">
                  Mardi — samedi
                  <br />
                  10 h — 19 h
                </p>
                <p className="o-m-0 o-mt-2 o-text-sm o-text-stone-600 dark:o-text-stone-400">
                  Le lundi sur rendez-vous.
                </p>
              </div>
              <div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                  Acces
                </p>
                <p className="o-m-0 o-mt-3 o-text-2xl o-tracking-tight o-text-stone-950 dark:o-text-stone-50">
                  Tram B, arret Chartrons
                  <br />
                  Bus 4 et 15
                </p>
                <p className="o-m-0 o-mt-2 o-text-sm o-text-stone-600 dark:o-text-stone-400">
                  Parking Cite mondiale, a deux cents metres.
                </p>
              </div>
              <div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                  Joindre
                </p>
                <p className="o-m-0 o-mt-3 o-text-2xl o-tracking-tight">
                  <a
                    href="tel:+33556442188"
                    className="o-text-stone-950 o-no-underline dark:o-text-stone-50 focus:o-ring"
                  >
                    05 56 44 21 88
                  </a>
                </p>
                <p className="o-m-0 o-mt-2 o-text-sm">
                  <a
                    href="mailto:bureau@cadre-architecture.fr"
                    className="o-text-stone-600 o-no-underline dark:o-text-stone-400 focus:o-ring"
                  >
                    bureau@cadre-architecture.fr
                  </a>
                </p>
              </div>
            </div>
            <div className="o-mt-16 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-stone-300 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-border-stone-800 dark:o-text-stone-400">
              <p className="o-m-0">
                © 2026 Cadre SARL — RCS Bordeaux 409 882 114 — CPI 3301 2018 000 032 411 —
                Garantie Galian 120 000 €
              </p>
              <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-4 o-p-0">
                {['Mentions legales', 'Donnees personnelles', 'Accessibilite'].map(
                  (l) => (
                    <li key={l}>
                      <a
                        href="#haut"
                        className="o-text-stone-600 o-no-underline hover:o-text-stone-950 dark:o-text-stone-400 dark:hover:o-text-stone-50 focus:o-ring"
                      >
                        {l}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
