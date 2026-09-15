/**
 * Les Tamaris — hotel en bord de mer.
 *
 * ## Le parti pris — la crique d abord, le registre ensuite
 *
 * Une seule image tient toute la premiere page : l escalier qui descend vers
 * la crique, plein cadre, hauteur d ecran, et qui recule doucement quand on
 * defile. La navigation est posee dessus, transparente, et le nom de l hotel
 * n a pas de bouton a cote de lui. Le titre est ancre en bas a gauche, en
 * Cormorant leger, avec un seul lien souligne — un hotel de douze chambres
 * n a pas deux appels a l action.
 *
 * Ce qui suit l image commence directement par le registre : douze lignes,
 * une par chambre, avec sa surface, sa vue, son couchage et son prix. C est
 * le mecanisme de la page, et il tient lieu d appel : deux dates, et le
 * registre se reduit a ce qui est libre.
 *
 * Puis une photographie pleine largeur, le tirage le plus lourd de la page,
 * la crique sur sa nappe d eau, et les douze chambres en mosaique
 * inegale — chaque tirage derive a sa vitesse, et porte en legende, sur la
 * photo, ses deux chiffres : la surface et le prix. Le pied est une lettre,
 * signee.
 *
 * ## La glisse
 *
 * La signature de la page est la parallaxe, et une parallaxe branchee sur la
 * molette s arrete avec elle. Ici l ouverture et les douze tirages portent une
 * inertie — de 0,5 pour le plus leger a 0,85 pour le plus lourd : la molette
 * pousse une cible, et la photographie continue de couler une demi-seconde
 * apres l arret du geste. L ecart entre ces poids fait la profondeur ; deux
 * chambres voisines ne se reposent jamais en meme temps.
 *
 * ## Ce que la page fait, et pas seulement montre
 *
 * Le registre est interroge, pas decore. Deux dates, un nombre de personnes et
 * une vue : la recherche calcule le nombre de nuits, trouve la saison, en
 * deduit le prix de chaque chambre et retire celles qui sont prises ou trop
 * petites. Hors periode d ouverture, elle le dit.
 *
 * ## La scene
 *
 * La section de la crique porte une nappe d eau : c est la mer de l hotel,
 * pas un decor. Elle cite `--o-vitrine-*` et suit donc la palette. C est le
 * seul contexte graphique de la page ; tout ce qui s y pose a son propre
 * aplat, comme des tirages colles sur un album.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { Sun } from '@odoro-cli/icons/outline'
import { Stagger, useInView } from '@odoro-cli/libs/motion'
import { Input, Select } from '@odoro-cli/libs/ui'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { WaterSurface } from '@/odoro/background/WaterSurface.jsx'
import { Frame } from '@/odoro/image/Frame.jsx'
import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'
import { DomeGallery } from '@/odoro/ui/DomeGallery.jsx'

import { media, photo } from './media.js'
import { accent, accentDoux, encre } from './palettes.js'
import { Horloge, Porte, Surgit, TitreVague, usePolices } from './marche.jsx'
import { Parallaxe, ZoomDefile } from './scene.jsx'

/**
 * L accent, ramene vers l encre du theme.
 *
 * La barre laisse choisir **n importe quelle** couleur : une nuance posee
 * telle quelle serait illisible des que le visiteur prend un accent tres clair
 * en theme clair, ou tres sombre en theme sombre. `encre()` choisit la nuance
 * qui tient, dans les deux themes.
 */
const ENCRE_ACCENT = encre()

/** L accent tel qu il se lit sur une photographie assombrie. */
const ENCRE_CLAIRE = `color-mix(in oklab, ${accent(500)} 40%, white)`

/**
 * L aplat plein et son encre.
 *
 * Un bouton peint a la couleur choisie porterait une encre blanche illisible
 * si le visiteur prend du jaune. L aplat est donc l accent ramene vers le noir
 * de moitie : il reste teinte, et l encre blanche y tient au-dessus de 6:1.
 */
const APLAT_PLEIN: CSSProperties = {
  backgroundColor: `color-mix(in oklab, ${accent(500)} 50%, black)`,
  color: 'var(--o-palette-white)',
}

/** L ombre portee des textes poses sur la photographie. */
const OMBRE = '0 1px 2px rgba(0,0,0,0.9), 0 2px 18px rgba(0,0,0,0.75)'

/**
 * La lueur posee sous la nappe d eau.
 *
 * Le repli d une scene est une classe, et une classe ne peut pas citer la
 * palette de la vitrine. Le degrade est donc peint sur la section — il suit
 * l accent — et le repli de la scene est laisse transparent.
 */
const LUEUR_CRIQUE: CSSProperties = {
  backgroundImage: `linear-gradient(to bottom, ${accentDoux(400, 55)}, ${accentDoux(700, 75)})`,
}

/** La voix d affichage : Cormorant, en 300. */
const SERIF: CSSProperties = {
  fontFamily: 'var(--o-vitrine-affichage)',
  fontWeight: 300,
  letterSpacing: '-0.02em',
}

/** Les liens du bandeau. */
const LIENS: readonly (readonly [string, string])[] = [
  ['#registre', 'Le registre'],
  ['#crique', 'La crique'],
  ['#chambres', 'Les douze chambres'],
  ['#lettre', 'Nous ecrire'],
]

/** Les vues possibles, telles que le registre les classe. */
type Vue = 'jardin' | 'cour' | 'mer' | 'panoramique'

/** Une chambre, telle qu elle figure au registre. */
interface Chambre {
  readonly nom: string
  readonly surface: number
  readonly vue: string
  readonly categorie: Vue
  readonly lits: string
  /** Nombre de personnes que la chambre couche, lit d appoint compris. */
  readonly capacite: number
  /** Prix de reference, en basse saison, pour deux. */
  readonly prix: number
  /**
   * Les nuits deja prises, en dates de debut et de fin de sejour.
   *
   * La date de fin est celle du depart : une chambre liberee le 21 est libre
   * pour une arrivee le 21.
   */
  readonly prises: readonly (readonly [string, string])[]
}

/** Les douze chambres, du rez-de-chaussee au dernier etage. */
const CHAMBRES: readonly Chambre[] = [
  {
    nom: 'Tamaris',
    surface: 18,
    vue: 'Jardin de cistes',
    categorie: 'jardin',
    lits: 'Un lit de 140',
    capacite: 2,
    prix: 145,
    prises: [
      ['2026-09-12', '2026-09-19'],
      ['2026-10-02', '2026-10-06'],
    ],
  },
  {
    nom: 'Criste',
    surface: 19,
    vue: 'Jardin de cistes',
    categorie: 'jardin',
    lits: 'Deux lits de 90',
    capacite: 2,
    prix: 145,
    prises: [['2026-09-05', '2026-09-12']],
  },
  {
    nom: 'Salicorne',
    surface: 21,
    vue: 'Cour interieure',
    categorie: 'cour',
    lits: 'Un lit de 160',
    capacite: 2,
    prix: 165,
    prises: [
      ['2026-09-16', '2026-09-23'],
      ['2026-10-10', '2026-10-17'],
    ],
  },
  {
    nom: 'Oyat',
    surface: 22,
    vue: 'Cour interieure',
    categorie: 'cour',
    lits: 'Un lit de 160',
    capacite: 2,
    prix: 165,
    prises: [['2026-09-26', '2026-10-03']],
  },
  {
    nom: 'Immortelle',
    surface: 24,
    vue: 'Mer, laterale',
    categorie: 'mer',
    lits: 'Un lit de 160',
    capacite: 2,
    prix: 195,
    prises: [['2026-09-19', '2026-09-26']],
  },
  {
    nom: 'Astragale',
    surface: 24,
    vue: 'Mer, laterale',
    categorie: 'mer',
    lits: 'Un lit de 160',
    capacite: 2,
    prix: 195,
    prises: [
      ['2026-09-08', '2026-09-15'],
      ['2026-09-29', '2026-10-04'],
    ],
  },
  {
    nom: 'Pin parasol',
    surface: 27,
    vue: 'Mer, plein sud',
    categorie: 'mer',
    lits: 'Un lit de 180',
    capacite: 2,
    prix: 235,
    prises: [['2026-09-14', '2026-09-20']],
  },
  {
    nom: 'Genevrier',
    surface: 28,
    vue: 'Mer, plein sud',
    categorie: 'mer',
    lits: 'Un lit de 180',
    capacite: 2,
    prix: 235,
    prises: [['2026-10-01', '2026-10-08']],
  },
  {
    nom: 'Arbousier',
    surface: 31,
    vue: 'Mer et crique',
    categorie: 'mer',
    lits: 'Un lit de 180, balcon',
    capacite: 2,
    prix: 280,
    prises: [
      ['2026-09-11', '2026-09-18'],
      ['2026-09-24', '2026-09-28'],
    ],
  },
  {
    nom: 'Lentisque',
    surface: 32,
    vue: 'Mer et crique',
    categorie: 'mer',
    lits: 'Un lit de 180, balcon',
    capacite: 2,
    prix: 280,
    prises: [['2026-09-19', '2026-09-22']],
  },
  {
    nom: 'Cap Fenouil',
    surface: 38,
    vue: 'Panoramique, terrasse',
    categorie: 'panoramique',
    lits: 'Un lit de 180, canape-lit',
    capacite: 3,
    prix: 340,
    prises: [['2026-09-04', '2026-09-11']],
  },
  {
    nom: 'Le Phare',
    surface: 44,
    vue: 'Panoramique, terrasse',
    categorie: 'panoramique',
    lits: 'Deux chambres, 4 personnes',
    capacite: 4,
    prix: 420,
    prises: [['2026-10-16', '2026-10-24']],
  },
]

/**
 * Les trois saisons de la maison.
 *
 * L hotel ouvre le 15 mars et ferme le 5 novembre. Le prix du registre est
 * celui de la basse saison ; les deux autres s en deduisent par un
 * coefficient, arrondi au multiple de cinq euros le plus proche.
 */
const SAISONS = [
  {
    nom: 'Basse saison',
    coefficient: 1,
    note: 'L eau est a 17 degres en avril, a 21 en octobre. Le sentier du littoral est vide.',
  },
  {
    nom: 'Moyenne saison',
    coefficient: 1.18,
    note: 'La meilleure periode, et la seule que nous ne remplissons pas d avance.',
  },
  {
    nom: 'Haute saison',
    coefficient: 1.42,
    note: 'Quatre nuits minimum du 14 juillet au 20 aout. La crique se partage.',
  },
] as const

/** Une saison de la maison. */
type Saison = (typeof SAISONS)[number]

/**
 * La mosaique des chambres : la place de chaque tirage, sa vitesse de derive
 * et le poids de sa glisse.
 *
 * Les grandes chambres ont les grands cadres ; les vitesses alternent pour que
 * deux voisines ne montent jamais ensemble, et les glisses avec elles — un
 * tirage lourd (0,82) coule encore quand son voisin leger (0,52) s est deja
 * repose. C est cet ecart qui fait la profondeur de la page, pas la vitesse.
 */
const MOSAIQUE: readonly {
  readonly colonnes: 4 | 5 | 7 | 8
  readonly ratio: string
  readonly derive: number
  readonly glisse: number
  readonly depuis: 'bas' | 'haut' | 'gauche' | 'droite'
}[] = [
  { colonnes: 4, ratio: '4 / 5', derive: 30, glisse: 0.58, depuis: 'bas' },
  { colonnes: 4, ratio: '4 / 5', derive: 50, glisse: 0.78, depuis: 'haut' },
  { colonnes: 4, ratio: '4 / 5', derive: 24, glisse: 0.52, depuis: 'bas' },
  { colonnes: 7, ratio: '3 / 2', derive: 40, glisse: 0.7, depuis: 'gauche' },
  { colonnes: 5, ratio: '4 / 5', derive: 60, glisse: 0.84, depuis: 'bas' },
  { colonnes: 5, ratio: '4 / 5', derive: 26, glisse: 0.55, depuis: 'haut' },
  { colonnes: 7, ratio: '3 / 2', derive: 48, glisse: 0.75, depuis: 'droite' },
  { colonnes: 4, ratio: '4 / 5', derive: 34, glisse: 0.62, depuis: 'bas' },
  { colonnes: 4, ratio: '4 / 5', derive: 56, glisse: 0.8, depuis: 'haut' },
  { colonnes: 4, ratio: '4 / 5', derive: 22, glisse: 0.5, depuis: 'bas' },
  { colonnes: 8, ratio: '16 / 9', derive: 44, glisse: 0.72, depuis: 'gauche' },
  { colonnes: 4, ratio: '4 / 5', derive: 64, glisse: 0.85, depuis: 'bas' },
]

/** Le debord du tirage dans son cadre : la marge que la derive promene. */
const DEBORD = '-12%'

/** Les quatre decoupes d entree, par le bord d ou le tirage se leve. */
const DECOUPES: Readonly<Record<string, string>> = {
  bas: 'inset(100% 0 0 0)',
  haut: 'inset(0 0 100% 0)',
  gauche: 'inset(0 100% 0 0)',
  droite: 'inset(0 0 0 100%)',
}

/** Le rang d une date dans l annee, sous la forme mois-jour. */
function rangDansAnnee(iso: string): number {
  return Number(iso.slice(5, 7)) * 100 + Number(iso.slice(8, 10))
}

/** Vrai si la maison est ouverte a cette date. */
function ouverte(iso: string): boolean {
  const rang = rangDansAnnee(iso)
  return rang >= 315 && rang <= 1105
}

/** La saison d une date d arrivee. */
function saisonDe(iso: string): Saison {
  const rang = rangDansAnnee(iso)
  if (rang >= 707 && rang <= 831) return SAISONS[2]
  if ((rang >= 601 && rang <= 706) || (rang >= 901 && rang <= 1005)) return SAISONS[1]
  return SAISONS[0]
}

/** Le nombre de nuits entre deux dates. */
function nuitsEntre(arrivee: string, depart: string): number {
  const debut = Date.parse(`${arrivee}T00:00:00Z`)
  const fin = Date.parse(`${depart}T00:00:00Z`)
  if (Number.isNaN(debut) || Number.isNaN(fin)) return 0
  return Math.round((fin - debut) / 86_400_000)
}

/** Le prix d une nuit, saison comprise, arrondi au multiple de cinq euros. */
function prixDeLaNuit(base: number, saison: Saison): number {
  return Math.round((base * saison.coefficient) / 5) * 5
}

/** Vrai si la chambre est deja prise sur tout ou partie du sejour. */
function occupee(chambre: Chambre, arrivee: string, depart: string): boolean {
  return chambre.prises.some(([debut, fin]) => arrivee < fin && depart > debut)
}

/** Les colonnes d un tirage de la mosaique, sur douze. */
const COLONNES = {
  4: 'md:o-col-span-4',
  5: 'md:o-col-span-5',
  7: 'md:o-col-span-7',
  8: 'md:o-col-span-8',
} as const

/**
 * Un tirage colle dans l album : le cadre, et la photographie qui **glisse**.
 *
 * ## Pourquoi cette piece n est pas `Devoile`
 *
 * `Devoile` decoupe le cadre a l entree et fait deriver l image contre le
 * defilement, mais sa derive est calee sur la molette : elle s arrete a
 * l instant ou le geste s arrete. Une maison en bord de mer ne s arrete pas
 * net. Le cadre garde donc la decoupe d entree de `Devoile`, et la derive
 * passe par `Parallaxe glisse` : la position mesuree n est qu une cible, et le
 * tirage la rattrape encore une demi-seconde apres le cran de molette.
 *
 * ## Pourquoi la derive ne deplace pas la mise en page
 *
 * La photographie deborde du cadre de {@link DEBORD} en haut comme en bas, et
 * c est cette marge que la derive promene : le cadre, lui, ne bouge jamais.
 * Une derive posee sur la tuile elle-meme ferait chevaucher les legendes des
 * chambres voisines des le premier cran.
 */
function Tirage({
  src,
  alt,
  ratio,
  depuis = 'bas',
  derive = 40,
  glisse = 0.7,
  className,
}: {
  readonly src: string
  readonly alt: string
  readonly ratio: string
  readonly depuis?: 'bas' | 'haut' | 'gauche' | 'droite'
  /** Course de la derive, dans l echelle de la mosaique. */
  readonly derive?: number
  /** L inertie, de 0 a 1 : entre 0,5 et 0,85 sur cette page. */
  readonly glisse?: number
  readonly className?: string
}): ReactElement {
  const { reduced } = useMotionState()
  const [cadre, vu] = useInView<HTMLDivElement>({ threshold: 0.15, once: true })
  const [ouvert, setOuvert] = useState(false)
  useEffect(() => {
    if (vu) setOuvert(true)
  }, [vu])

  // Le temoin d entree est pose sur un parent du cadre : une decoupe qui vide
  // l element retire aussi son aire d intersection, et le cadre ne s ouvrirait
  // jamais s il s observait lui-meme.
  return (
    <div ref={cadre} className={className}>
      <div
        className="o-relative o-overflow-hidden"
        style={{
          aspectRatio: ratio,
          clipPath:
            reduced || ouvert ? 'inset(0 0 0 0)' : (DECOUPES[depuis] ?? DECOUPES['bas']),
          transition: reduced
            ? undefined
            : 'clip-path 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Parallaxe
          vitesse={derive / 400}
          glisse={glisse}
          className="o-absolute"
          style={{ left: 0, right: 0, top: DEBORD, bottom: DEBORD }}
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="o-size-full o-object-cover"
          />
        </Parallaxe>
      </div>
    </div>
  )
}

/**
 * Le titre des chambres, revele mot a mot a l entree dans le champ.
 *
 * `SplitReveal` joue au montage : monte des le chargement, il aurait deja
 * joue quand on arrive a lui. Il n est donc monte qu une fois vu.
 */
function TitreChambres(): ReactElement {
  const [ref, vu] = useInView<HTMLDivElement>({ threshold: 0.3, once: true })
  const classe = 'o-m-0 o-max-w-4xl o-text-balance o-text-stone-900 dark:o-text-stone-50'
  const style = { ...SERIF, fontSize: 'clamp(2.75rem, 7vw, 6.5rem)', lineHeight: 0.95 }
  return (
    <div ref={ref}>
      {vu ? (
        <SplitReveal
          as="h2"
          by="words"
          stagger={70}
          duration={800}
          distance={28}
          className={classe}
          style={style}
        >
          Douze clefs, douze plans, aucun numero.
        </SplitReveal>
      ) : (
        <h2 className={`${classe} o-opacity-0`} style={style}>
          Douze clefs, douze plans, aucun numero.
        </h2>
      )}
    </div>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('cormorant')
  /** La recherche : deux dates, un nombre de personnes, une vue. */
  const [arrivee, setArrivee] = useState('2026-09-18')
  const [depart, setDepart] = useState('2026-09-21')
  const [personnes, setPersonnes] = useState('2')
  const [vue, setVue] = useState<'indifferent' | Vue>('indifferent')
  /** Le registre montre les douze lignes, ou seulement celles qui restent. */
  const [toutVoir, setToutVoir] = useState(false)

  const nuits = nuitsEntre(arrivee, depart)
  const saison = saisonDe(arrivee)
  const maisonOuverte = ouverte(arrivee) && ouverte(depart)
  const voyageurs = Number(personnes)

  const registre = useMemo(
    () =>
      CHAMBRES.map((chambre) => ({
        chambre,
        libre:
          nuits > 0 &&
          maisonOuverte &&
          chambre.capacite >= voyageurs &&
          (vue === 'indifferent' || chambre.categorie === vue) &&
          !occupee(chambre, arrivee, depart),
        nuit: prixDeLaNuit(chambre.prix, saison),
      })),
    [arrivee, depart, maisonOuverte, nuits, saison, voyageurs, vue],
  )

  const libres = registre.filter((ligne) => ligne.libre)
  const affichees = toutVoir ? registre : libres

  const bandeau = media(
    'tamaris-bandeau',
    'L escalier de pierre qui descend de la reception vers la crique, en fin de journee',
    2000,
    1400,
  )

  const crique = [
    {
      ...media(
        'tamaris-crique-1',
        'La crique vue depuis l escalier de l hotel',
        600,
        450,
      ),
      caption: 'L escalier, 68 marches',
    },
    {
      ...media(
        'tamaris-crique-2',
        'Eau claire sur galets blancs, au petit matin',
        600,
        450,
      ),
      caption: 'Sept heures, avant les baigneurs',
    },
    {
      ...media('tamaris-crique-3', 'Pins parasols penches au-dessus de l eau', 600, 450),
      caption: 'Les pins du surplomb',
    },
    {
      ...media('tamaris-crique-4', 'Une annexe amarree dans la crique', 600, 450),
      caption: 'Mouillage, l ete',
    },
    {
      ...media('tamaris-crique-5', 'Rochers plats ou l on pose sa serviette', 600, 450),
      caption: 'Les dalles, cote ouest',
    },
    {
      ...media('tamaris-crique-6', 'Coucher de soleil sur la pointe rocheuse', 600, 450),
      caption: 'La pointe, vingt heures',
    },
    {
      ...media('tamaris-crique-7', 'Fonds de posidonies vus en apnee', 600, 450),
      caption: 'Posidonies, quatre metres',
    },
    {
      ...media('tamaris-crique-8', 'Sentier du littoral longeant la falaise', 600, 450),
      caption: 'Le sentier, vers Port d Alon',
    },
    {
      ...media('tamaris-crique-9', 'Cabanon de pecheur au bout de la crique', 600, 450),
      caption: 'Le cabanon de Bruno',
    },
    {
      ...media(
        'tamaris-crique-10',
        'Serviettes sechant sur un muret de pierre seche',
        600,
        450,
      ),
      caption: 'Le muret, midi',
    },
    {
      ...media('tamaris-crique-11', 'Vue plongeante sur l eau turquoise', 600, 450),
      caption: 'Depuis la terrasse haute',
    },
    {
      ...media('tamaris-crique-12', 'Barque bleue tiree sur les galets', 600, 450),
      caption: 'La barque de la maison',
    },
  ]

  return (
    <Porte forme="compteur" marque="Les Tamaris">
      <div
        className="o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-800 dark:o-text-stone-100"
        style={polices}
      >
        {/* ================= L ouverture : l escalier, qui recule au defilement ================= */}
        <ZoomDefile
          de={1.1}
          assombrir={0.35}
          glisse={0.72}
          fond={
            <img
              src={bandeau.src}
              alt={bandeau.alt}
              width={2000}
              height={1400}
              className="o-absolute o-inset-0 o-z-0 o-size-full o-object-cover"
            />
          }
        >
          <div className="o-flex o-flex-col" style={{ minHeight: '100vh' }}>
            <nav
              aria-label="Navigation principale"
              className="o-relative o-z-10 o-flex o-flex-wrap o-items-baseline o-gap-x-8 o-gap-y-3 o-px-6 o-pb-16 o-pt-7 md:o-px-10"
              style={{
                textShadow: OMBRE,
                backgroundImage:
                  'linear-gradient(to bottom, color-mix(in oklab, black 58%, transparent), transparent)',
              }}
            >
              <a
                href="#registre"
                className="o-inline-flex o-items-center o-gap-2 o-text-2xl o-tracking-tight o-text-white o-no-underline focus:o-ring"
                style={SERIF}
              >
                <Icon
                  icon={Sun}
                  size={18}
                  style={{ color: ENCRE_CLAIRE }}
                  aria-hidden="true"
                />
                Les Tamaris
              </a>
              <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-items-baseline o-gap-x-6 o-gap-y-2 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                {LIENS.map(([ancre, libelle]) => (
                  <li key={ancre}>
                    <a
                      href={ancre}
                      className="o-text-stone-100 o-no-underline o-transition-colors hover:o-text-white focus:o-ring"
                    >
                      {libelle}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-100 md:o-ml-auto">
                <Horloge ville="Saint-Cyr" />
              </p>
            </nav>

            <div
              className="o-relative o-z-10 o-mt-auto o-px-6 o-pb-20 o-pt-40 md:o-px-10 md:o-pb-28"
              style={{
                backgroundImage:
                  'linear-gradient(to top, color-mix(in oklab, black 88%, transparent), color-mix(in oklab, black 55%, transparent) 55%, transparent)',
              }}
            >
              <Surgit
                as="p"
                className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-200"
                style={{ textShadow: OMBRE }}
              >
                Saint-Cyr-sur-Mer, Var — depuis 1954
              </Surgit>
              <TitreVague
                delai={120}
                className="o-m-0 o-mt-5 o-max-w-5xl o-text-white"
                style={{
                  ...SERIF,
                  fontSize: 'clamp(3.25rem, 9.5vw, 9.5rem)',
                  lineHeight: 0.9,
                  textShadow: OMBRE,
                }}
              >
                Douze chambres au bord d une crique.
              </TitreVague>
              <Surgit
                delai={620}
                className="o-mt-8 o-flex o-flex-wrap o-items-end o-justify-between o-gap-x-10 o-gap-y-6"
              >
                <p
                  className="o-m-0 o-max-w-md o-text-lg o-leading-relaxed o-text-stone-100"
                  style={{ textShadow: OMBRE }}
                >
                  Soixante-huit marches separent la reception de l eau. Pas d ascenseur,
                  pas de piscine, pas de televiseur.
                </p>
                <a
                  href="#registre"
                  className="o-inline-block o-text-base o-underline o-underline-offset-8 o-transition-colors hover:o-text-white focus:o-ring"
                  style={{ textShadow: OMBRE, color: ENCRE_CLAIRE }}
                >
                  Chercher une chambre libre ↗
                </a>
              </Surgit>
            </div>
          </div>
        </ZoomDefile>

        <main>
          {/* ================= (01) Le registre : le mecanisme tient lieu d appel ================= */}
          <section
            id="registre"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-5xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                (01) — Le registre
              </p>
              <h2
                className="o-m-0 o-mt-5 o-max-w-3xl o-text-balance o-text-stone-900 dark:o-text-stone-50"
                style={{
                  ...SERIF,
                  fontSize: 'clamp(2rem, 4.2vw, 3.75rem)',
                  lineHeight: 1.02,
                }}
              >
                Deux dates, et le registre se reduit a ce qui est libre.
              </h2>

              <form
                className="o-mt-10 o-border-t o-border-b o-border-stone-300 o-py-7 dark:o-border-stone-700"
                onSubmit={(evenement) => {
                  evenement.preventDefault()
                }}
              >
                <div className="o-grid o-gap-5 sm:o-grid-cols-2 lg:o-grid-cols-4">
                  <Input
                    label="Arrivee"
                    type="date"
                    name="arrivee"
                    value={arrivee}
                    onChange={(evenement) => {
                      setArrivee(evenement.target.value)
                    }}
                  />
                  <Input
                    label="Depart"
                    type="date"
                    name="depart"
                    value={depart}
                    onChange={(evenement) => {
                      setDepart(evenement.target.value)
                    }}
                  />
                  <Select
                    label="Voyageurs"
                    name="voyageurs"
                    value={personnes}
                    onChange={(evenement) => {
                      setPersonnes(evenement.target.value)
                    }}
                    options={[
                      { value: '1', label: 'Une personne' },
                      { value: '2', label: 'Deux personnes' },
                      { value: '3', label: 'Trois personnes' },
                      { value: '4', label: 'Quatre personnes' },
                    ]}
                  />
                  <Select
                    label="Vue souhaitee"
                    name="vue"
                    value={vue}
                    onChange={(evenement) => {
                      setVue(evenement.target.value as 'indifferent' | Vue)
                    }}
                    options={[
                      { value: 'indifferent', label: 'Indifferent' },
                      { value: 'jardin', label: 'Jardin de cistes' },
                      { value: 'cour', label: 'Cour interieure' },
                      { value: 'mer', label: 'Mer' },
                      { value: 'panoramique', label: 'Panoramique avec terrasse' },
                    ]}
                  />
                </div>

                <div className="o-mt-6 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4">
                  <p
                    aria-live="polite"
                    className="o-m-0 o-max-w-2xl o-text-base o-italic o-leading-relaxed o-text-stone-700 dark:o-text-stone-200"
                    style={SERIF}
                  >
                    {!maisonOuverte
                      ? 'La maison est fermee a ces dates : nous ouvrons du 15 mars au 5 novembre. Choisissez une autre semaine.'
                      : nuits <= 0
                        ? 'Le depart doit tomber apres l arrivee : le registre attend deux dates dans l ordre.'
                        : `${String(libres.length)} ${libres.length > 1 ? 'chambres libres' : 'chambre libre'} sur douze, ${String(nuits)} ${nuits > 1 ? 'nuits' : 'nuit'} en ${saison.nom.toLowerCase()}. ${saison.note}`}
                  </p>
                  <button
                    type="button"
                    aria-pressed={toutVoir}
                    onClick={() => {
                      setToutVoir((tout) => !tout)
                    }}
                    className="o-cursor-pointer o-rounded-full o-border-w-1 o-border-stone-300 o-px-5 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-700 o-transition-colors dark:o-border-stone-700 dark:o-text-stone-200 focus:o-ring"
                  >
                    {toutVoir ? 'Ne montrer que les libres' : 'Afficher les douze'}
                  </button>
                </div>
              </form>

              <Stagger as="ul" className="o-m-0 o-mt-2 o-list-none o-p-0" step={40}>
                {affichees.map(({ chambre, libre, nuit }) => {
                  const index = CHAMBRES.indexOf(chambre)
                  return (
                    <li
                      key={chambre.nom}
                      className="o-flex o-items-start o-gap-4 o-border-b o-border-stone-200 o-py-5 dark:o-border-stone-800"
                    >
                      <Frame
                        src={photo(`tamaris-chambre-${String(index + 1)}`, 240, 160)}
                        alt={`Chambre ${chambre.nom}, ${String(chambre.surface)} metres carres, vue ${chambre.vue.toLowerCase()}`}
                        ratio={10 / 7}
                        zoom={0.12}
                        loading="lazy"
                        className="o-w-20 o-shrink-0"
                      />
                      <div className="o-min-w-0 o-flex-1 md:o-flex md:o-items-baseline md:o-gap-6">
                        <h3
                          className="o-m-0 o-text-2xl o-tracking-tight o-text-stone-900 dark:o-text-stone-50 md:o-w-36 md:o-shrink-0"
                          style={SERIF}
                        >
                          {chambre.nom}
                        </h3>
                        <dl className="o-m-0 o-mt-2 o-flex o-flex-wrap o-gap-x-5 o-gap-y-1 o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-stone-600 dark:o-text-stone-300 md:o-mt-0 md:o-min-w-0 md:o-flex-1">
                          <div>
                            <dt className="o-sr-only">Surface</dt>
                            <dd className="o-m-0 o-tabular-nums">{chambre.surface} m2</dd>
                          </div>
                          <div>
                            <dt className="o-sr-only">Vue</dt>
                            <dd className="o-m-0">{chambre.vue}</dd>
                          </div>
                          <div>
                            <dt className="o-sr-only">Couchage</dt>
                            <dd className="o-m-0">{chambre.lits}</dd>
                          </div>
                          <div>
                            <dt className="o-sr-only">Disponibilite</dt>
                            <dd
                              className={
                                libre
                                  ? 'o-m-0'
                                  : 'o-m-0 o-text-stone-500 dark:o-text-stone-400'
                              }
                            >
                              {libre ? 'Libre' : 'Prise'}
                            </dd>
                          </div>
                        </dl>
                        <p className="o-m-0 o-mt-2 o-shrink-0 o-text-right o-tabular-nums md:o-mt-0 md:o-ml-auto">
                          <span
                            className="o-block o-text-xl"
                            style={{ ...SERIF, color: ENCRE_ACCENT }}
                          >
                            {nuit} € la nuit
                          </span>
                          {libre && nuits > 0 ? (
                            <span className="o-block o-font-mono o-text-xs o-text-stone-500 dark:o-text-stone-400">
                              {nuit * nuits} € pour {nuits} {nuits > 1 ? 'nuits' : 'nuit'}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </Stagger>

              {affichees.length === 0 ? (
                <p
                  className="o-m-0 o-py-8 o-text-xl o-italic o-text-stone-600 dark:o-text-stone-300"
                  style={SERIF}
                >
                  Rien de libre sur ces dates avec ce que vous demandez. Essayez la
                  semaine suivante, ou appelez le 04 94 32 71 08 : il arrive qu une
                  chambre se libere le matin meme.
                </p>
              ) : null}

              <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                Prix par nuit pour deux, hors petit dejeuner et taxe de sejour. Aucune
                empreinte bancaire : le sejour se regle au depart.
              </p>
            </div>
          </section>

          {/* ================= La bande : le tirage le plus lourd de la page ================= */}
          <figure
            className="o-relative o-m-0"
            style={{ backgroundColor: 'var(--o-palette-stone-900)' }}
          >
            <Tirage
              src={photo('tamaris-crique-11', 2000, 800)}
              alt="Vue plongeante sur l eau turquoise de la crique, depuis la terrasse haute"
              ratio="2.6"
              depuis="gauche"
              derive={55}
              glisse={0.85}
              className="o-w-full"
            />
            <figcaption
              className="o-absolute o-bottom-4 o-left-6 o-m-0 o-px-3 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-white md:o-left-10"
              style={{
                backgroundColor:
                  'color-mix(in oklab, var(--o-palette-stone-950) 72%, transparent)',
              }}
            >
              Depuis la terrasse haute, sept heures du matin
            </figcaption>
          </figure>

          {/* ================= (02) La crique, sur sa nappe d eau ================= */}
          <section
            id="crique"
            className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden"
            style={LUEUR_CRIQUE}
          >
            <WaterSurface
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-0"
              amplitude={0.1}
              wavelength={1.8}
              choppiness={0.55}
              speed={0.7}
              sun={0.9}
              parallax={0.12}
              colors={['--o-vitrine-tierce', '--o-vitrine-500', '--o-vitrine-seconde']}
              poster="o-bg-transparent"
            />

            <div className="o-relative o-z-10 o-mx-auto o-max-w-6xl o-px-6 o-pb-20 o-pt-24 md:o-px-10 md:o-pb-28 md:o-pt-36">
              <div className="o-grid o-items-end o-gap-8 md:o-grid-cols-12">
                <div className="md:o-col-span-7">
                  <h2
                    className="o-m-0 o-inline-block o-rounded-full o-px-7 o-py-3 o-text-3xl o-tracking-tight md:o-text-5xl"
                    style={{ ...SERIF, ...APLAT_PLEIN }}
                  >
                    La crique du Cap Fenouil
                  </h2>
                </div>
                <div
                  className="o-rounded-2xl o-p-6 md:o-col-span-5"
                  style={{ backgroundColor: 'var(--o-theme-surface)' }}
                >
                  <p
                    className="o-m-0 o-text-xl o-leading-snug o-text-stone-800 dark:o-text-stone-100"
                    style={SERIF}
                  >
                    Cent vingt metres de galets blancs entre deux pointes, plein
                    sud-ouest. L eau descend a quatre metres en trois brasses.
                  </p>
                  <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                    Masques, palmes et deux kayaks a la reception
                  </p>
                </div>
              </div>

              <div
                className="o-mt-8 o-rounded-2xl o-p-3 md:o-p-4"
                style={{ backgroundColor: 'var(--o-theme-surface)' }}
              >
                <DomeGallery
                  className="o-w-full o-rounded-xl"
                  style={{ height: '32rem', backgroundColor: 'var(--o-theme-bg)' }}
                  items={crique}
                  label="La crique du Cap Fenouil, douze vues"
                  radius={480}
                  columns={12}
                  pitch={26}
                  tile={220}
                />
                <p className="o-m-0 o-mt-3 o-px-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                  Douze images, a faire tourner du doigt
                </p>
              </div>
            </div>
          </section>

          {/* ================= (03) Les douze chambres : mosaique inegale, chiffres en legende ================= */}
          <section
            id="chambres"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                (03) — Les douze chambres
              </p>
              <div className="o-mt-5">
                <TitreChambres />
              </div>

              <ul className="o-m-0 o-mt-14 o-grid o-list-none o-gap-x-6 o-gap-y-14 o-p-0 md:o-grid-cols-12">
                {CHAMBRES.map((chambre, index) => {
                  const place = MOSAIQUE[index] ?? MOSAIQUE[0]
                  if (place === undefined) return null
                  const decale = index % 3 === 1 ? 'md:o-mt-16' : ''
                  return (
                    <li
                      key={chambre.nom}
                      className={`o-relative ${COLONNES[place.colonnes]} ${decale}`}
                    >
                      <div className="o-relative">
                        <Tirage
                          src={photo(`tamaris-chambre-${String(index + 1)}`, 900, 900)}
                          alt={`Chambre ${chambre.nom}, ${chambre.vue.toLowerCase()}`}
                          ratio={place.ratio}
                          depuis={place.depuis}
                          derive={place.derive}
                          glisse={place.glisse}
                        />
                        {/* C10 : les deux chiffres, poses sur la photo. */}
                        <p
                          className="o-pointer-events-none o-absolute o-bottom-3 o-left-3 o-m-0 o-flex o-items-baseline o-gap-3 o-px-3 o-py-1.5"
                          style={{
                            backgroundColor: 'var(--o-palette-white)',
                            color: 'var(--o-palette-stone-900)',
                          }}
                        >
                          <span className="o-text-2xl o-tabular-nums" style={SERIF}>
                            {chambre.surface} m2
                          </span>
                          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest">
                            des {chambre.prix} €
                          </span>
                        </p>
                      </div>
                      <div className="o-mt-3 o-flex o-items-baseline o-justify-between o-gap-4">
                        <h3
                          className="o-m-0 o-text-2xl o-tracking-tight o-text-stone-900 dark:o-text-stone-50"
                          style={SERIF}
                        >
                          {chambre.nom}
                        </h3>
                        <p className="o-m-0 o-text-right o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                          {chambre.vue} · {chambre.lits}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        </main>

        {/* ================= P16 : une lettre signee ================= */}
        <footer
          id="lettre"
          className="o-scroll-mt-24 o-border-t o-border-stone-200 o-px-6 o-pb-10 o-pt-20 dark:o-border-stone-800 md:o-px-10 md:o-pt-28"
        >
          <div className="o-mx-auto o-max-w-3xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              Chemin du Cap Fenouil, le 10 septembre 2026
            </p>
            <p
              className="o-m-0 o-mt-8 o-text-2xl o-leading-snug o-text-stone-900 dark:o-text-stone-50 md:o-text-3xl"
              style={SERIF}
            >
              Chers hotes,
            </p>
            <p
              className="o-m-0 o-mt-5 o-text-2xl o-leading-snug o-text-stone-800 dark:o-text-stone-100 md:o-text-3xl"
              style={SERIF}
            >
              La maison ouvre le 15 mars et ferme le 5 novembre. Il n y a pas de piscine,
              et il n y en aura pas : la mer est a soixante metres. La table suit la peche
              de Bruno et ferme le mardi. Nous ne prenons pas d empreinte bancaire, et
              nous ne retenons rien quand une tempete coupe la route. Pour le reste,
              appelez-nous : la reception repond de huit heures a vingt et une heures,
              tous les jours.
            </p>
            <p
              className="o-m-0 o-mt-10 o-text-3xl o-italic o-text-stone-900 dark:o-text-stone-50 md:o-text-4xl"
              style={{ ...SERIF, fontStyle: 'italic', color: ENCRE_ACCENT }}
            >
              Pierre et Marion Delaunay
            </p>
            <div className="o-mt-16 o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-3 o-border-t o-border-stone-200 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-border-stone-800 dark:o-text-stone-400">
              <a
                href="tel:+33494327108"
                className="o-text-stone-700 o-no-underline hover:o-underline dark:o-text-stone-200 focus:o-ring"
              >
                04 94 32 71 08
              </a>
              <span>83270 Saint-Cyr-sur-Mer</span>
              <span>© 2026 Les Tamaris — SARL du Cap Fenouil</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
