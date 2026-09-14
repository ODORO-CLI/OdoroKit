/**
 * Halle — editeur de mobilier, Nantes.
 *
 * ## Le parti pris : un sol qui rend ce qu on lui pose
 *
 * La maison occupe une ancienne halle a bois dont le sol est un beton cire que
 * personne n a voulu peindre. C est la l ouverture : le nom se tient **sur son
 * propre reflet**, et le reflet **ondule quand on bouge le pointeur**, comme
 * une flaque de lumiere sur un beton poli.
 *
 * Le reflet n est pas une surface graphique : c est une copie miroir du mot,
 * decoupee en seize tranches horizontales, chacune glissee lateralement par sa
 * propre onde et par le pointeur. Une ligne du bas — la plus loin du sol —
 * bouge le plus ; celle qui touche la ligne du sol ne bouge presque pas. C est
 * ce degrade de vitesse, et lui seul, qui fait lire une eau. Ouvrir un contexte
 * WebGL pour cela couterait une surface entiere et n ajouterait rien.
 *
 * Sous mouvement reduit, le pointeur n est plus ecoute et les ondes sont
 * coupees par la feuille elle-meme : **le reflet se pose**, et il reste un
 * reflet.
 *
 * ## L anneau du catalogue
 *
 * Les six pieces sont posees sur un cylindre — `rotateY` puis `translateZ` —
 * et l anneau **s aimante sur la piece qui vous fait face**. Ce travail existe
 * deja dans le registre : `CircularGallery` pose le cylindre, et son calage
 * vient de `scroll-snap-type: x mandatory`, donc de l inertie du systeme
 * plutot que d une boucle a nous. Le reecrire aurait donne une aimantation
 * differente sur chaque appareil.
 *
 * ## Ce que la page n a pas
 *
 * Aucun chiffre mis en scene : ni barre, ni compteur, ni jauge. Un editeur qui
 * tient six pieces au catalogue n a pas d indicateurs a montrer — il a des
 * prix, et ils sont dans les cartels de l anneau.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

import { Spotlight } from '@/odoro/effect/Spotlight.jsx'
import { Frame } from '@/odoro/image/Frame.jsx'
import { SpotlightText } from '@/odoro/text/SpotlightText.jsx'
import { CircularGallery } from '@/odoro/ui/CircularGallery.jsx'

import { nuit } from './communs.jsx'
import { photo } from './media.js'
import {
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Logos,
  Manifeste,
  Porte,
  Surgit,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accentDoux, encreSurSombre } from './palettes.js'
import { Aimant, Chapitre, Parallaxe } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#catalogue', 'Catalogue'],
  ['#halle', 'La halle'],
  ['#atelier', 'L atelier'],
  ['#archives', 'Les archives'],
]

/* ============================ La feuille du sol ======================== */

const STYLE_HALLE = 'o-vitrine-halle'

/**
 * L onde des tranches du reflet.
 *
 * Une seule image-cle, parametree par tranche : amplitude, duree et retard.
 * Coupee sous mouvement reduit — c est la moitie de la promesse « le reflet se
 * pose », l autre moitie etant le pointeur, que le composant cesse d ecouter.
 */
const CSS_HALLE = [
  '@keyframes o-hl-onde{',
  '0%,100%{transform:translate3d(calc(var(--o-hl-a,4px) * -1),0,0)}',
  '50%{transform:translate3d(var(--o-hl-a,4px),0,0)}}',
  '[data-o-hl-onde]{animation:o-hl-onde var(--o-hl-duree,5s) ease-in-out var(--o-hl-delai,0s) infinite}',
  '@media (prefers-reduced-motion:reduce){[data-o-hl-onde]{animation:none}}',
].join('')

function useFeuilleHalle(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_HALLE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_HALLE
    feuille.textContent = CSS_HALLE
    document.head.append(feuille)
  }, [])
}

/**
 * Le pointeur, amorti, ecrit en variables sur l ouverture.
 *
 * Les coordonnees sont celles de la fenetre et non de l element : l ouverture
 * fait un ecran, et lire sa boite a chaque mouvement melerait une lecture de
 * mise en page a une boucle qui n en a pas besoin.
 *
 * Sans pointeur fin — un telephone, une tablette — rien n est ecoute : une
 * onde qui suit le doigt cacherait ce que le doigt vient toucher.
 */
function usePointeurDuSol(hote: HTMLElement | null): void {
  const { reduced } = useMotionState()

  useEffect(() => {
    if (hote === null || reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const cible = { x: 0, y: 0 }
    const courant = { x: 0, y: 0 }
    const bouger = (evenement: PointerEvent): void => {
      cible.x = (evenement.clientX / window.innerWidth) * 2 - 1
      cible.y = (evenement.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', bouger, { passive: true })

    const abonnement = clock.subscribe(
      ({ delta }) => {
        const part = 1 - Math.exp(-2.6 * delta)
        courant.x += (cible.x - courant.x) * part
        courant.y += (cible.y - courant.y) * part
        hote.style.setProperty('--o-hl-px', courant.x.toFixed(3))
        hote.style.setProperty('--o-hl-py', courant.y.toFixed(3))
      },
      { name: 'sol de la halle', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      window.removeEventListener('pointermove', bouger)
      abonnement.unsubscribe()
    }
  }, [hote, reduced])
}

/* ============================ Le sol et le reflet ====================== */

/** Le dessin du mot-marque, partage par le titre et par son reflet. */
const MOT: CSSProperties = {
  ...affiche('xxl', 800),
  fontSize: 'clamp(3.75rem, 21vw, 17rem)',
  lineHeight: 0.86,
  letterSpacing: '-0.05em',
}

/** Nombre de tranches du reflet. Seize suffisent a lire une ondulation. */
const TRANCHES = 16

/**
 * Le beton cire : une trame en fuite, sous la ligne du sol.
 *
 * La perspective part du haut, donc les rangees s eloignent en se resserrant :
 * rien ne peut deborder lateralement, et le masque efface la trame avant
 * qu elle ne devienne un damier.
 */
function Sol(): ReactElement {
  const trait = 'color-mix(in oklab, var(--o-palette-stone-50) 15%, transparent)'
  // La trame ne commence pas au bord du bloc : la premiere rangee y tomberait
  // d un coup, et un sol qui commence par un trait net n est plus un sol.
  const voile = 'linear-gradient(to bottom, transparent 0%, black 26%, transparent 72%)'
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-0 o-overflow-hidden"
      style={{ height: '44%' }}
    >
      <div
        className="o-absolute o-inset-0"
        style={{
          transform:
            'perspective(480px) rotateX(76deg) translateY(calc(var(--o-hl-py, 0) * -8px))',
          transformOrigin: 'center top',
          backgroundImage: `repeating-linear-gradient(to right, ${trait} 0 1px, transparent 1px 92px), repeating-linear-gradient(to bottom, ${trait} 0 1px, transparent 1px 92px)`,
          maskImage: voile,
          WebkitMaskImage: voile,
        }}
      />
      <div
        className="o-absolute o-inset-x-0 o-top-0 o-h-full"
        style={{
          background: `radial-gradient(60% 90% at 50% 0%, ${accentDoux(500, 16)} 0%, transparent 70%)`,
          // Sans ce fondu par le haut, le bord du bloc se lit comme un trait
          // qui traverse le mot : une couture, la ou il faut une lueur.
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 22%, black 66%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 22%, black 66%, transparent 100%)',
        }}
      />
    </div>
  )
}

/**
 * Le reflet du mot, decoupe en tranches qui ondulent.
 *
 * Le bloc entier est retourne (`scaleY(-1)`), puis chaque tranche montre une
 * bande horizontale du mot et glisse pour son compte : l onde continue par la
 * feuille, le pointeur par une variable. Une tranche loin du sol bouge sept
 * fois plus que celle qui le touche — c est ce qui donne la profondeur.
 *
 * Un fantome invisible donne sa hauteur au bloc : sans lui, les tranches, qui
 * sont toutes absolues, n auraient aucune boite ou se caler.
 */
function Reflet({ mot }: { readonly mot: string }): ReactElement {
  const voile =
    'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 44%, transparent 86%)'
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-relative o-select-none o-overflow-hidden o-text-center"
      style={{
        ...MOT,
        height: '0.56em',
        marginTop: '-0.099em',
        color: 'color-mix(in oklab, var(--o-palette-stone-50) 36%, transparent)',
        filter: 'blur(0.9px)',
        maskImage: voile,
        WebkitMaskImage: voile,
      }}
    >
      <div
        className="o-absolute o-inset-x-0 o-top-0"
        style={{
          transform: 'scaleY(-1) translateY(-100%)',
          transformOrigin: 'center top',
        }}
      >
        <span className="o-invisible o-block">{mot}</span>
        {Array.from({ length: TRANCHES }, (_, rang) => {
          // 1 pour la tranche la plus eloignee du sol, 0 pour celle qui le touche.
          const loin = (TRANCHES - 1 - rang) / (TRANCHES - 1)
          const haut = ((rang / TRANCHES) * 100).toFixed(3)
          const bas = (((TRANCHES - rang - 1) / TRANCHES) * 100).toFixed(3)
          return (
            <span
              key={rang}
              className="o-absolute o-inset-0 o-block o-will-change-transform"
              style={{
                transform: `translate3d(calc(var(--o-hl-px, 0) * ${(loin * 24 + 2).toFixed(1)}px), 0, 0)`,
              }}
            >
              <span
                data-o-hl-onde=""
                className="o-absolute o-inset-0 o-block"
                style={
                  {
                    clipPath: `inset(${haut}% 0 ${bas}% 0)`,
                    '--o-hl-a': `${(loin * 6.5 + 0.4).toFixed(2)}px`,
                    '--o-hl-duree': `${(4.4 + rang * 0.14).toFixed(2)}s`,
                    '--o-hl-delai': `${(-rang * 0.23).toFixed(2)}s`,
                  } as CSSProperties
                }
              >
                {mot}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** Le mot-marque, lettre a lettre, revele a travers le rideau. */
function MotMarque({
  mot,
  sous,
}: {
  readonly mot: string
  readonly sous: string
}): ReactElement {
  return (
    <h1
      className="o-m-0 o-text-center o-text-stone-50"
      style={MOT}
      aria-label={`${mot} — ${sous}`}
    >
      {[...mot].map((lettre, rang) => (
        <Surgit
          key={`${lettre}-${String(rang)}`}
          as="span"
          delai={140 + rang * 85}
          distance={42}
          className="o-inline-block"
        >
          <span aria-hidden="true">{lettre}</span>
        </Surgit>
      ))}
    </h1>
  )
}

/* ============================ Le catalogue ============================= */

/** Une piece du catalogue, telle qu elle tourne sur l anneau. */
interface Piece {
  readonly graine: string
  readonly alt: string
  readonly cartel: string
}

/**
 * Les six pieces. Le cartel porte le nom, la matiere et le prix : sur un
 * anneau, seule la piece de face montre le sien, donc il doit tout dire.
 */
const PIECES: readonly Piece[] = [
  {
    graine: 'tamaris-chambre-7',
    alt: 'Banquette basse en bois massif et son coussin de lin, dans une piece claire aux portes hautes',
    cartel: 'Banquette Coursive — teck massif, sangles de lin — 3 240 €',
  },
  {
    graine: 'tamaris-chambre-10',
    alt: 'Fauteuil capitonne a accoudoirs enroules, devant un rideau traverse par le soir',
    cartel: 'Fauteuil Veille — noyer, velours de coton — 2 480 €',
  },
  {
    graine: 'tamaris-chambre-3',
    alt: 'Lit a colonnes en bois sombre, son ciel de toile ecrue releve de chaque cote',
    cartel: 'Lit Portique — acajou, ciel de toile — 5 900 €',
  },
  {
    graine: 'tamaris-chambre-5',
    alt: 'Armoire a deux portes en bois sculpte, a cote d un lit a colonnes torses',
    cartel: 'Armoire Bastide — chene sculpte, deux portes — 6 700 €',
  },
  {
    graine: 'tamaris-chambre-12',
    alt: 'Liseuse a bras articule allumee au-dessus d une table basse en laiton et verre',
    cartel: 'Liseuse Etier — laiton brosse, abat-jour de papier — 690 €',
  },
  {
    graine: 'perrin-salle',
    alt: 'Salle a manger meublee de fauteuils en osier tresse autour de tables rondes',
    cartel: 'Fauteuil Osier — cannage tresse a la main — 1 180 €',
  },
]

/* ============================ L atelier ================================ */

/** Les trois temps d une piece, et ce qu ils prennent. */
const TEMPS: readonly (readonly [string, string, string])[] = [
  [
    'Le bois',
    'Vingt-huit mois',
    'Chene et noyer de la Sarthe, scies sur quartier, sechees a l air puis en etuve. Aucun panneau, aucun placage, aucune vis apparente.',
  ],
  [
    'Le garnissage',
    'Onze jours',
    'Sangles de lin, crin animal, ressorts cousus un par un. Un siege garni de la sorte se refait dans trente ans ; une mousse collee, non.',
  ],
  [
    'La finition',
    'Trois passes',
    'Huile dure, poncee entre chaque passe au tampon. La piece part mate ; c est l usage qui la lustre, et il le fait mieux que nous.',
  ],
]

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('syne')
  useFeuilleHalle()
  const [ouverture, setOuverture] = useState<HTMLElement | null>(null)
  usePointeurDuSol(ouverture)

  return (
    <Porte forme="lettres" marque="Halle">
      <div
        className="o-relative o-text-stone-50"
        style={{ ...nuit('stone'), ...polices }}
      >
        <BarreGelule
          marque="Halle"
          liens={NAVIGATION}
          action={['#adresse', 'Rendez-vous']}
        />

        {/* ================= L ouverture : le sol qui reflete ============= */}
        <header
          ref={setOuverture}
          className="o-relative o-isolate o-flex o-flex-col o-justify-between o-overflow-hidden o-px-6 o-pb-14 o-pt-36 md:o-px-10"
          style={{ minHeight: ECRAN, '--o-hl-px': 0, '--o-hl-py': 0 } as CSSProperties}
        >
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background: `radial-gradient(110% 70% at 50% 0%, ${accentDoux(600, 22)} 0%, transparent 64%), linear-gradient(to bottom, var(--o-palette-stone-950) 0%, color-mix(in oklab, var(--o-palette-stone-950) 72%, black) 100%)`,
            }}
          />
          <Sol />
          <Grain opacite={0.05} />

          <div className="o-relative o-z-20 o-mx-auto o-max-w-3xl o-text-center">
            <Surgit>
              <Etiquette>Editeur de mobilier — Nantes, depuis 1954</Etiquette>
            </Surgit>
            <Surgit
              delai={620}
              as="p"
              className="o-m-0 o-mt-7 o-text-base o-leading-relaxed o-text-stone-300"
            >
              Six pieces au catalogue. Chacune dessinee une fois, fabriquee a la commande,
              et reparee tant que la maison existe.
            </Surgit>
          </div>

          <div className="o-relative o-z-20 o-mt-12">
            <MotMarque mot="Halle" sous="editeur de mobilier" />
            {/*
              La ligne du sol : le seul filet clair de la page. Elle se cale en
              `em` sur le corps du mot, parce que la boite de ligne descend plus
              bas que l encre des lettres — et c est l encre qui touche le sol,
              pas la boite. Le decalage est une metrique de fonte : il suit donc
              le corps a toutes les largeurs.
            */}
            <Surgit delai={640}>
              <span
                aria-hidden="true"
                className="o-mx-auto o-block o-h-px o-w-full o-max-w-5xl"
                style={{
                  fontSize: MOT.fontSize,
                  marginTop: '-0.096em',
                  background: `linear-gradient(to right, transparent, ${encreSurSombre()} 42%, ${encreSurSombre()} 58%, transparent)`,
                  opacity: 0.75,
                }}
              />
            </Surgit>
            <Surgit delai={720}>
              <Reflet mot="Halle" />
            </Surgit>
          </div>

          <div className="o-relative o-z-20 o-mx-auto o-mt-10 o-flex o-flex-wrap o-items-center o-justify-center o-gap-4">
            <Surgit delai={820}>
              <a
                href="#catalogue"
                className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-6 o-py-3 o-text-sm o-font-semibold o-text-stone-50 o-no-underline o-backdrop-blur-md o-transition-colors hover:o-bg-white-20 focus:o-ring"
              >
                Voir les six pieces
                <Icon icon={ArrowDown} size={16} aria-hidden="true" />
              </a>
            </Surgit>
            <Surgit delai={880}>
              <a
                href="#adresse"
                className="o-inline-flex o-items-center o-gap-2 o-text-sm o-text-stone-300 o-no-underline o-transition-colors hover:o-text-stone-50 focus:o-ring"
              >
                Venir a la halle
                <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
              </a>
            </Surgit>
          </div>

          {/*
            Les coins se retirent sous le pli : a 380 px, deux metadonnees
            posees aux deux angles du meme bord se marchent dessus, et elles
            marchent aussi sur les actions.
          */}
          <div className="max-md:o-hidden">
            <Coin position="bg">
              47° 12 N — 1° 33 O
              <br />
              Halle 6, quai de la Fosse
            </Coin>
            <Coin position="bd">
              Le sol est un beton cire
              <br />
              que personne n a voulu peindre
            </Coin>
          </div>
        </header>

        {/* ================= Ceux qui portent les pieces ================== */}
        {/*
          Le bandeau ne se clot pas tout seul : sous mouvement reduit, le
          defilement s arrete mais la piste garde sa largeur. Sans cette
          decoupe, elle pousserait la page de soixante-huit pixels.
        */}
        <div className="o-overflow-hidden o-border-t o-border-white-10 o-px-6 md:o-px-10">
          <Logos
            titre="Editions portees par"
            marques={[
              'Maison Verdier',
              'Comptoir Quatorze',
              'Galerie Sillon',
              'Le Grand Depot',
              'Atelier du Nord',
              'Table Ronde',
            ]}
          />
        </div>

        {/* ================= Un ecran de texte, et rien d autre =========== */}
        <section className="o-flex o-items-center o-px-6 o-py-28 md:o-px-10 md:o-py-40">
          <Reveal>
            <Manifeste eteint="Un fauteuil passe trente ans dans une piece et deux heures dans un catalogue.">
              Nous dessinons pour les trente ans.
            </Manifeste>
          </Reveal>
        </section>

        {/* ================= L anneau du catalogue ======================== */}
        <section
          id="catalogue"
          className="o-relative o-scroll-mt-24 o-overflow-hidden o-border-t o-border-white-10 o-py-24 md:o-py-32"
          style={{
            backgroundColor: 'color-mix(in oklab, var(--o-palette-stone-950) 78%, black)',
          }}
        >
          {/* Le projecteur du fond : ce qui fait qu une piece de face est eclairee. */}
          <div
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
            style={{
              background: `radial-gradient(46% 52% at 50% 46%, ${accentDoux(400, 15)} 0%, transparent 72%)`,
            }}
          />

          <div className="o-relative o-z-10 o-px-6 md:o-px-10">
            <div className="o-mx-auto o-grid o-max-w-6xl o-gap-6 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Reveal>
                  <Indice rang="01">Le catalogue</Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-5 o-max-w-3xl o-text-stone-50"
                    style={{ ...affiche('m', 400), fontSize: 'clamp(2rem, 4.4vw, 4rem)' }}
                  >
                    <SpotlightText radius={230} rest={0.62}>
                      Six pieces, et le bois de chacune.
                    </SpotlightText>
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={140} className="md:o-col-span-4">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400 md:o-text-right">
                  Poussez l anneau.
                  <br />
                  La piece qui vous fait face porte son nom.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="o-relative o-z-10 o-mt-14">
            <CircularGallery
              label="Les six pieces au catalogue"
              width={288}
              height={368}
              gap={28}
              curve={30}
              depth={170}
              items={PIECES.map((piece) => ({
                src: photo(piece.graine, 1200, 1500),
                alt: piece.alt,
                caption: piece.cartel,
              }))}
            />
          </div>

          <p className="o-relative o-z-10 o-mx-auto o-mt-10 o-max-w-2xl o-px-6 o-text-center o-text-sm o-leading-relaxed o-text-stone-400">
            Les prix sont ceux de la piece finie, livree et montee en France
            metropolitaine. Un devis n ajoute rien d autre que le tissu, s il sort de nos
            six.
          </p>
        </section>

        {/* ================= La halle, en photographie ==================== */}
        <section id="halle" className="o-relative o-scroll-mt-24">
          <div
            className="o-relative o-overflow-hidden"
            style={{ height: 'min(78vh, 720px)' }}
          >
            <Parallaxe
              vitesse={0.24}
              glisse={0.7}
              echelle={0.06}
              className="o-absolute o-inset-0"
            >
              <img
                src={photo('cadre-archive-bois', 1200, 1800)}
                alt="Charpente de bois assemblee en berceau, eclairee par en dessous, au-dessus d un sol de brique"
                className="o-size-full o-object-cover"
                loading="lazy"
                decoding="async"
              />
            </Parallaxe>
            <div
              aria-hidden="true"
              className="o-absolute o-inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, color-mix(in oklab, var(--o-palette-stone-950) 72%, transparent) 0%, transparent 34%, color-mix(in oklab, var(--o-palette-stone-950) 88%, transparent) 88%, var(--o-palette-stone-950) 100%)',
              }}
            />
            <div className="o-absolute o-bottom-0 o-left-0 o-w-full o-px-6 o-pb-10 md:o-px-10 md:o-pb-14">
              <div className="o-mx-auto o-max-w-6xl">
                <Reveal>
                  <Indice rang="02">La halle</Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-5 o-max-w-3xl o-text-stone-50"
                    style={{
                      ...affiche('m', 400),
                      fontSize: 'clamp(1.9rem, 4.2vw, 3.75rem)',
                    }}
                  >
                    Cinq cents metres carres sous une charpente de 1902.
                  </h2>
                </Reveal>
              </div>
            </div>
          </div>
          <div className="o-mx-auto o-max-w-6xl o-px-6 o-py-16 md:o-px-10 md:o-py-20">
            <Reveal>
              <p className="o-m-0 o-max-w-2xl o-text-base o-leading-relaxed o-text-stone-300 md:o-ml-auto md:o-text-right">
                L ancienne halle a bois du quai de la Fosse. On y dessine, on y garnit, on
                y charge : les trois se voient depuis la porte, et c est voulu. Un editeur
                qui cache son atelier vend un objet dont il ne repond pas.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================= L atelier, en chapitre ======================= */}
        <div className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
          <div className="o-mx-auto o-max-w-6xl">
            <Chapitre
              id="atelier"
              className="o-scroll-mt-24"
              indice="(03) — L atelier"
              titre={
                <h2
                  className="o-m-0 o-text-stone-50"
                  style={{
                    ...affiche('m', 400),
                    fontSize: 'clamp(1.9rem, 3.6vw, 3.25rem)',
                  }}
                >
                  Ce qui prend du temps
                </h2>
              }
              texte="Une piece sort en onze semaines. Neuf sont du sechage et du garnissage ; deux sont du dessin, et il a ete fait en 1961."
            >
              <ol className="o-m-0 o-list-none o-border-t o-border-white-10 o-p-0">
                {TEMPS.map(([quoi, combien, texte], rang) => (
                  <li
                    key={quoi}
                    className="o-grid o-items-baseline o-gap-3 o-border-b o-border-white-10 o-py-8 md:o-grid-cols-12 md:o-gap-8"
                  >
                    <p
                      className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-col-span-3"
                      style={{ color: encreSurSombre() }}
                    >
                      {String(rang + 1).padStart(2, '0')} — {combien}
                    </p>
                    <h3 className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-stone-50 md:o-col-span-3">
                      {quoi}
                    </h3>
                    <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-400 md:o-col-span-6">
                      {texte}
                    </p>
                  </li>
                ))}
              </ol>
              <figure className="o-m-0 o-mt-12">
                <Frame
                  src={photo('lisiere-atelier-tissage-berthaud', 1200, 1017)}
                  alt="Un garnisseur tisse des sangles sur un metier de bois, dans la penombre de l atelier"
                  ratio={1.18}
                  zoom={0.05}
                  className="o-overflow-hidden o-rounded-2xl"
                />
                <figcaption className="o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                  Le tissage des sangles, atelier Berthaud, Cholet — quatre mille metres
                  par an
                </figcaption>
              </figure>
            </Chapitre>
          </div>
        </div>

        {/* ================= Les archives ================================= */}
        <section
          id="archives"
          className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={{
            backgroundColor: 'color-mix(in oklab, var(--o-palette-stone-950) 78%, black)',
          }}
        >
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 md:o-grid-cols-12 md:o-items-center">
            <div className="md:o-col-span-7">
              <Reveal>
                <Frame
                  src={photo('tamaris-chambre-4', 1200, 974)}
                  alt="Photographie ancienne d une chambre meublee : chaise longue, armoire a glace, secretaire et lit de fer"
                  ratio={1.24}
                  className="o-overflow-hidden o-rounded-2xl"
                />
              </Reveal>
            </div>
            <div className="md:o-col-span-5">
              <Reveal delay={80}>
                <Indice rang="04">Les archives</Indice>
              </Reveal>
              <Reveal delay={140}>
                <h2
                  className="o-m-0 o-mt-5 o-text-stone-50"
                  style={{ ...affiche('m', 400), fontSize: 'clamp(1.8rem, 3.4vw, 3rem)' }}
                >
                  Trois mille cent planches, de 1954 a 1989.
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-stone-300">
                  Le fonds est consultable sur rendez-vous, et c est de la que sortent les
                  reeditions. Nous n en tirons pas plus de deux par decennie : une planche
                  qui n a pas tenu quarante ans ne merite pas d etre refaite.
                </p>
              </Reveal>
              <Reveal delay={260}>
                <Spotlight
                  size={280}
                  color={accentDoux(400, 26)}
                  className="o-mt-8 o-rounded-2xl o-border-w-1 o-border-white-10 o-p-6"
                >
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encreSurSombre() }}
                  >
                    Planche 0417
                  </p>
                  <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-stone-300">
                    Chambre Verrier, 1958. Le fauteuil Veille y figure deja, avec quatre
                    centimetres de plus au dossier — nous les avons rendus en 2019.
                  </p>
                </Spotlight>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= L appel : l adresse, et rien d autre ========= */}
        <section
          id="adresse"
          className="o-flex o-scroll-mt-24 o-flex-col o-items-center o-justify-center o-border-t o-border-white-10 o-px-6 o-py-28 o-text-center md:o-py-40"
        >
          <Reveal>
            <Indice rang="05">Sur rendez-vous</Indice>
          </Reveal>
          <Reveal delay={80}>
            <p
              className="o-m-0 o-mt-8 o-text-stone-50"
              style={{ ...affiche('l', 800), fontSize: 'clamp(2.25rem, 8vw, 7.5rem)' }}
            >
              6 quai de la Fosse
              <br />
              Nantes
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="o-mt-12">
              <Aimant force={0.4}>
                <a
                  href="#adresse"
                  className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-border-w-1 o-border-white-20 o-px-8 o-py-4 o-text-sm o-font-semibold o-text-stone-50 o-no-underline o-transition-colors hover:o-bg-white-10 focus:o-ring"
                >
                  Prendre rendez-vous
                  <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
                </a>
              </Aimant>
            </div>
          </Reveal>
        </section>

        {/* ================= Le pied : une lettre, signee ================= */}
        <footer className="o-border-t o-border-white-10 o-px-6 o-pb-12 o-pt-20 md:o-px-10 md:o-pt-28">
          <div className="o-mx-auto o-max-w-3xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
              Nantes, le 4 fevrier 2026
            </p>
            <p className="o-m-0 o-mt-8 o-text-2xl o-leading-snug o-text-stone-50 md:o-text-3xl">
              Madame, Monsieur,
            </p>
            <p className="o-m-0 o-mt-5 o-text-2xl o-leading-snug o-text-stone-200 md:o-text-3xl">
              Nous editons six pieces et nous n en ajouterons pas cette annee. Chacune est
              faite a la commande, en onze semaines, et reparee tant que la halle tient
              debout : le garnissage comme le bois, la premiere fois comme la quatrieme.
              Nous ne soldons rien, nous ne sortons pas de collection d hiver et nous ne
              vendons pas en ligne — une piece qui doit durer trente ans se choisit
              assise. La halle est ouverte le jeudi et le vendredi ; le reste de la
              semaine, nous travaillons.
            </p>
            <p
              className="o-m-0 o-mt-10 o-text-3xl o-italic md:o-text-4xl"
              style={{ color: encreSurSombre() }}
            >
              Claire Roussel, quatrieme generation
            </p>
            <div className="o-mt-16 o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-3 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
              <a
                href="#catalogue"
                className="o-text-stone-200 o-no-underline hover:o-underline focus:o-ring"
              >
                Le catalogue
              </a>
              <a
                href="#archives"
                className="o-text-stone-200 o-no-underline hover:o-underline focus:o-ring"
              >
                Les archives
              </a>
              <span>44000 Nantes — jeudi et vendredi, 10 h — 18 h</span>
              <span>© 2026 Halle — SAS a capital familial</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
