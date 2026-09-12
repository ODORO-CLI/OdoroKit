/**
 * Auber — maison de haute joaillerie.
 *
 * ## L architecture : un ecrin, puis quatre pieces
 *
 * La page ouvre sur le cristal — la pierre brute, avant toute monture — et
 * le cristal reste colle derriere l ecran pendant que **quatre diapositives
 * editoriales** se remplacent au defilement : la pierre, le metal, les heures,
 * le prix. C est la doctrine de la maison, dite en quatre phrases, sur la
 * matiere qui la justifie. Le cristal s en va ensuite, et la page devient un
 * fond noir franc sur lequel les pieces se regardent une par une, a la loupe.
 *
 * ## Ce que la page fait
 *
 * - **la loupe** : chaque photographie de piece se grossit sous le pointeur,
 *   comme au comptoir d un joaillier ;
 * - **le devis qui se compose** : la pierre, le poids au curseur, la monture,
 *   et le total qui se recalcule — la pierre, le metal, les heures et la taxe
 *   sont ecrits separement ;
 * - **un seul bouton**, aimante, au centre d un ecran vide, pour la visite de
 *   l atelier. Une maison ne supplie pas.
 *
 * Aucun chiffre n est mis en scene : pas de barre, pas de compteur. Les prix
 * sont des prix, et ils sont dans les cartels.
 *
 * ## Le fond
 *
 * Le cristal est la seule surface WebGL de la page, limitee a l ouverture et
 * aux diapositives. Le reste est un noir de zinc, du grain, des filets.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { useMotionState } from '@odoro-cli/engine'
import { useEffect, useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { LensZoom } from '@/odoro/image/LensZoom.jsx'
import { ShineText } from '@/odoro/text/ShineText.jsx'
import { ElasticSlider } from '@/odoro/ui/ElasticSlider.jsx'

import { nuit } from './communs.jsx'
import { photo } from './media.js'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import { Actions, affiche, BarreCoins, CHROME, Coin, Etiquette, Grain, Horloge, Indice, Porte, Surgit, TitreVague, usePolices, verre } from './marche.jsx'
import { Aimant, Epingle } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Le serif d affichage, en 400 : Cormorant en 300 se perd sur le noir. */
function serif(corps: 'm' | 'l' | 'xl'): CSSProperties {
  return { ...affiche(corps, 400), letterSpacing: '-0.02em' }
}

/** Une piece de la vitrine. */
interface Piece {
  readonly cle: string
  readonly nom: string
  readonly type: string
  readonly matiere: string
  readonly pierre: string
  readonly prix: number
  readonly graine: string
  readonly cartel: string
}

/** Les quatre pieces tenues en stock. */
const PIECES: readonly Piece[] = [
  {
    cle: 'sillage',
    nom: 'Sillage',
    type: 'Bague de fiancailles',
    matiere: 'Or blanc 18 carats, non rhodie',
    pierre: 'Diamant 1,02 ct — Botswana, taille brillant, G / VS1',
    prix: 8400,
    graine: 'auber-sillage',
    cartel: 'Monture ouverte sous la pierre : la lumiere passe, et la bague se nettoie a l eau.',
  },
  {
    cle: 'quai',
    nom: 'Quai',
    type: 'Collier',
    matiere: 'Or jaune 18 carats, recycle',
    pierre: 'Sans pierre — chaine forcat, maillons soudes un a un',
    prix: 5200,
    graine: 'auber-quai',
    cartel: 'Trente-huit heures d atelier. Longueur ajustable sans casser le rythme des maillons.',
  },
  {
    cle: 'rive',
    nom: 'Rive',
    type: 'Alliance',
    matiere: 'Platine 950',
    pierre: 'Six eclats sertis a fleur de bande, 0,08 ct au total',
    prix: 1890,
    graine: 'auber-rive',
    cartel: 'Quatre millimetres, section demi-jonc. Gravure interieure au burin, comprise.',
  },
  {
    cle: 'lumiere',
    nom: 'Lumiere',
    type: 'Pendants d oreilles',
    matiere: 'Or jaune 18 carats',
    pierre: 'Deux saphirs de Ceylan non chauffes, 2,4 ct au total',
    prix: 6700,
    graine: 'auber-lumiere',
    cartel: 'Les deux pierres viennent du meme lot, donc du meme bleu. Montage mobile.',
  },
]

/**
 * Les quatre diapositives, sur le cristal.
 *
 * Une phrase chacune, dans l ordre ou une piece se fabrique : la pierre, le
 * metal, les heures, le prix. C est la doctrine de la maison ; elle n a pas
 * besoin d un pictogramme.
 */
const DIAPOSITIVES = [
  {
    mot: 'La pierre',
    titre: 'La pierre d abord, la monture ensuite.',
    texte: 'Chaque pierre est choisie avant qu un dessin existe, et tracee au lot : Botswana, Ceylan, Colombie, Mozambique. Jamais l inverse.',
  },
  {
    mot: 'Le metal',
    titre: 'Un or qui a deja vecu.',
    texte: 'Or 18 carats refondu a l atelier, platine 950. Aucun metal de mine n est entre rue du Louvre depuis 2019.',
  },
  {
    mot: 'Les heures',
    titre: 'Les heures sont comptees, et facturees comme telles.',
    texte: 'De quatorze a trente-huit heures de sertissage par piece, au taux reel de l atelier, charges comprises. Le revient est ecrit sur le devis.',
  },
  {
    mot: 'Le prix',
    titre: 'Le prix, entier, sans mystere.',
    texte: 'La pierre, le metal, les heures, la taxe. La marge est de deux fois quatre dixiemes le revient, et elle est ecrite aussi.',
  },
] as const

/** Les pierres proposees au devis, avec leur prix au carat. */
const PIERRES = [
  { nom: 'Diamant', prix: 5400, origine: 'Botswana, mine de Karowe' },
  { nom: 'Saphir', prix: 2300, origine: 'Sri Lanka, non chauffe' },
  { nom: 'Emeraude', prix: 3100, origine: 'Colombie, huilee au cedre' },
  { nom: 'Rubis', prix: 4200, origine: 'Mozambique, non traite' },
] as const

/** Les montures, avec leurs heures de sertissage. */
const MONTURES = [
  { nom: 'Griffes', heures: 14 },
  { nom: 'Clos', heures: 22 },
  { nom: 'Pave', heures: 38 },
] as const

/** Les liens des coins. */
const NAVIGATION = [
  ['#pieces', 'Les pieces'],
  ['#composer', 'Composer'],
  ['#atelier', 'L atelier'],
] as const

/** Le colophon : ce dont la page est faite. */
const COLOPHON = [
  ['Composition', 'Cormorant Garamond pour les titres, Work Sans pour le corps, IBM Plex Mono pour les cartels'],
  ['Papier', 'Noir de zinc 950, grain de film a six pour cent, filets blancs a dix pour cent'],
  ['Photographies', 'Pieces photographiees a l atelier ; tirages sous licence libre, credits dans le depot'],
  ['Cristal', 'Scene en shader, une seule par page, remplacee par un aplat sous mouvement reduit'],
  ['Poincon', 'Poincon de maitre 4 AU 75 — Auber SAS au capital de 120 000 EUR, RCS Paris 642 018 774'],
] as const

/** Un montant en euros, ecrit a la francaise. */
function euros(n: number): string {
  return `${n.toLocaleString('fr-FR')} EUR`
}

/**
 * Une entree douce : l element monte cache et se revele au montage.
 *
 * Les diapositives changent de cle a chaque acte ; chacune arrive ainsi d un
 * flou et d une petite montee. Sous mouvement reduit, l opacite seule.
 */
function Entre({ children, className, delai = 0 }: { readonly children: ReactNode; readonly className?: string; readonly delai?: number }): ReactElement {
  const { reduced } = useMotionState()
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setVu(true)
    })
    return () => {
      window.cancelAnimationFrame(id)
    }
  }, [])
  return (
    <div
      className={className}
      style={{
        opacity: vu ? 1 : 0,
        transform: vu || reduced ? 'none' : 'translate3d(0, 24px, 0)',
        filter: vu || reduced ? 'none' : 'blur(8px)',
        transition: reduced ? `opacity 300ms ease ${String(delai)}ms` : `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms, transform 900ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms, filter 900ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms`,
      }}
    >
      {children}
    </div>
  )
}

/** Un choix du devis : une gelule bordee, pleine quand elle est prise. */
function Choix({ actif, onClick, children }: { readonly actif: boolean; readonly onClick: () => void; readonly children: string }): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className="o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
      style={actif ? { ...aplat(), borderColor: 'transparent' } : { borderColor: 'var(--o-theme-line)', color: 'var(--o-theme-muted)' }}
    >
      {children}
    </button>
  )
}

/** Le devis : la pierre, le poids au curseur, la monture, et le total decompose. */
function Devis(): ReactElement {
  const [pierre, setPierre] = useState<(typeof PIERRES)[number]>(PIERRES[0])
  const [carat, setCarat] = useState<number>(1)
  const [monture, setMonture] = useState<(typeof MONTURES)[number]>(MONTURES[0])

  const devis = useMemo(() => {
    const laPierre = Math.round(pierre.prix * carat)
    const laFacon = Math.round(monture.heures * 68)
    const leMetal = 1140
    const horsTaxe = laPierre + laFacon + leMetal
    return { laPierre, laFacon, leMetal, horsTaxe, total: Math.round(horsTaxe * 1.2) }
  }, [pierre, carat, monture])

  return (
    <div className="o-grid o-gap-10 md:o-grid-cols-12">
      <div className="o-flex o-flex-col o-gap-8 md:o-col-span-7">
        <fieldset className="o-m-0 o-p-0">
          <legend className="o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">La pierre</legend>
          <div className="o-flex o-flex-wrap o-gap-2">
            {PIERRES.map((p) => (
              <Choix key={p.nom} actif={p.nom === pierre.nom} onClick={() => { setPierre(p) }}>
                {p.nom}
              </Choix>
            ))}
          </div>
          <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-text-zinc-400">{pierre.origine}</p>
        </fieldset>

        <div style={{ '--o-eslider-accent': encreSurSombre() } as CSSProperties}>
          <p className="o-m-0 o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Le poids — <span className="o-tabular-nums o-text-zinc-50">{carat.toLocaleString('fr-FR')} ct</span>
          </p>
          <ElasticSlider label="Poids de la pierre, en carats" min={0.5} max={2} step={0.25} value={carat} onChange={setCarat} showValue={false} stretch={0.08} />
          <p className="o-m-0 o-mt-2 o-flex o-justify-between o-font-mono o-text-xs o-text-zinc-500">
            <span>0,5 ct</span>
            <span>2 ct</span>
          </p>
        </div>

        <fieldset className="o-m-0 o-p-0">
          <legend className="o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">La monture</legend>
          <div className="o-flex o-flex-wrap o-gap-2">
            {MONTURES.map((m) => (
              <Choix key={m.nom} actif={m.nom === monture.nom} onClick={() => { setMonture(m) }}>
                {`${m.nom} — ${String(m.heures)} h`}
              </Choix>
            ))}
          </div>
        </fieldset>

        <p className="o-m-0 o-max-w-md o-text-xs o-leading-relaxed o-text-zinc-500">
          Facon comptee a 68 EUR de l heure d atelier, taux reel charges comprises. Devis ferme trente jours, confirme par devis nominatif.
        </p>
      </div>

      <dl aria-live="polite" className={`o-m-0 o-flex o-flex-col o-gap-3 o-p-6 md:o-col-span-5 ${verre(true)}`}>
        {([
          ['La pierre', devis.laPierre],
          ['Le metal et la fonte', devis.leMetal],
          [`Sertissage — ${String(monture.heures)} h`, devis.laFacon],
          ['Total hors taxe', devis.horsTaxe],
        ] as const).map(([quoi, montant]) => (
          <div key={quoi} className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-white-10 o-pb-3 o-text-sm">
            <dt className="o-text-zinc-300">{quoi}</dt>
            <dd className="o-m-0 o-font-mono o-tabular-nums o-text-zinc-100">{euros(montant)}</dd>
          </div>
        ))}
        <div className="o-mt-4 o-flex o-items-baseline o-justify-between o-gap-4">
          <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">Toutes taxes comprises</dt>
          <dd className="o-m-0 o-tabular-nums" style={{ ...serif('m'), fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: encreSurSombre() }}>
            {euros(devis.total)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

/** La vitrine complete : l ecrin, les diapositives, les pieces, le devis, un bouton, le colophon. */
/**
 * Le contour d une taille brillant, dessine.
 *
 * C est le repli de la pierre en volume : sous mouvement reduit, sans WebGL,
 * ou quand le plafond de surfaces est atteint, la page doit montrer la meme
 * chose. Une taille se lit a sa silhouette — table, couronne, rondiste,
 * pavillon — et un contour la donne entierement.
 */
function TailleDessinee(): ReactElement {
  const aretes = Array.from({ length: 8 }, (_, rang) => {
    const angle = (rang * Math.PI) / 4 + Math.PI / 8
    return Math.round(100 + Math.cos(angle) * 92)
  })
  return (
    <svg viewBox="0 0 200 210" className="o-h-full o-w-full" aria-hidden="true" fill="none" strokeLinejoin="round">
      <g stroke={encreSurSombre()} strokeWidth="1.2" opacity="0.85">
        <path d="M52 46h96l44 28H8Z" />
        <path d="M52 46 8 74M148 46l44 28M74 46 44 74M126 46l30 28M100 46v28" />
        <path d="M8 74 100 200 192 74" />
        {aretes.map((x, rang) => (
          <path key={rang} d={`M${String(x)} 74 100 200`} opacity="0.55" />
        ))}
      </g>
    </svg>
  )
}

export default function Page(): ReactElement {
  const polices = usePolices('cormorant')
  const { reduced } = useMotionState()

  // Le cristal est monte une fois : il ne doit pas se reinitialiser quand
  // l acte change au-dessus de lui.
  const cristal = useMemo(
    () => (
      <div
        aria-hidden="true"
        className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
        style={{
          background: [
            `radial-gradient(46% 46% at 66% 44%, ${accentDoux(400, 42)}, transparent 68%)`,
            `radial-gradient(70% 60% at 20% 88%, ${accentDoux(700, 26)}, transparent 74%)`,
          ].join(', '),
        }}
      />
    ),
    [],
  )

  // La pierre : montee une fois elle aussi. Le fond de la page est un shader,
  // celle-ci est en three.js — l arbitre accorde une surface par technologie,
  // donc les deux tiennent ensemble.
  const pierre = useMemo(
    () => (
      <Volume
        nom="pierre taillee"
        className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
        repli={
          <div className="o-flex o-h-full o-items-center o-justify-center o-p-16 o-opacity-70">
            <TailleDessinee />
          </div>
        }
        construire={(contexte) => {
          const { scene, camera, three } = contexte
          const couleur = teinte('--o-vitrine-300', '#e8d9a8')

          // Une taille brillant : couronne tronconique, rondiste, pavillon en
          // pointe. Seize facettes suffisent — au-dela, les aretes se ferment
          // et la pierre redevient une bille.
          const groupe = new three.Group()
          const matiere = new three.MeshPhysicalMaterial({
            color: couleur,
            metalness: 0.4,
            roughness: 0.06,
            clearcoat: 1,
            clearcoatRoughness: 0.04,
            iridescence: 1,
            iridescenceIOR: 1.9,
            flatShading: true,
          })

          const formeCouronne = new three.CylinderGeometry(0.54, 1, 0.4, 16, 1)
          const formePavillon = new three.ConeGeometry(1, 1.05, 16, 1)
          const couronne = new three.Mesh(formeCouronne, matiere)
          couronne.position.y = 0.42
          const pavillon = new three.Mesh(formePavillon, matiere)
          pavillon.position.y = -0.3
          pavillon.rotation.x = Math.PI
          groupe.add(couronne, pavillon)

          // Les aretes reprises en fil clair : c est ce qui fait scintiller
          // une taille, bien plus que le corps de la pierre.
          const filDeLumiere = new three.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.62 })
          const aretesCouronne = new three.EdgesGeometry(formeCouronne)
          const scintillement = new three.LineSegments(aretesCouronne, filDeLumiere)
          scintillement.position.y = 0.42
          const aretesPavillon = new three.EdgesGeometry(formePavillon)
          const traits = new three.LineSegments(aretesPavillon, filDeLumiere)
          traits.position.y = -0.3
          traits.rotation.x = Math.PI
          groupe.add(scintillement, traits)

          groupe.rotation.z = 0.12
          // A droite du titre, un peu haute : la colonne de texte occupe la
          // gauche du cadre, et une pierre centree la couperait en deux.
          groupe.position.set(1.35, 0.2, 0)
          groupe.scale.setScalar(1.05)
          scene.add(groupe)

          eclairer(contexte, { cle: 0xfff2d0, remplissage: 0x7f92c8, force: 1.35 })
          const socle = new three.PointLight(0xffe9b8, 26, 12, 2)
          socle.position.set(1.4, -1.9, 1.6)
          const rasante = new three.PointLight(0xffffff, 18, 12, 2)
          rasante.position.set(3.2, 0.6, 1.2)
          scene.add(socle, rasante)
          camera.position.set(0, 0.02, 4.6)
          camera.lookAt(0.95, 0.08, 0)

          return () => {
            matiere.dispose()
            filDeLumiere.dispose()
            formeCouronne.dispose()
            formePavillon.dispose()
            aretesCouronne.dispose()
            aretesPavillon.dispose()
          }
        }}
        animer={({ scene }, { delta, time }) => {
          const groupe = scene.children[0]
          if (groupe === undefined) return
          // Un tour lent, et un balancement d un degre : une pierre posee sur
          // un presentoir n est jamais parfaitement d aplomb.
          groupe.rotation.y += delta * 0.42
          groupe.rotation.z = 0.12 + Math.sin(time * 0.5) * 0.03
        }}
      />
    ),
    [],
  )

  return (
    <Porte forme="iris" marque="Auber">
      <div className="o-relative o-text-zinc-50" style={{ ...polices, ...nuit('zinc') }}>
        {/*
          ----- L ecrin ---------------------------------------------------------

          Le cristal est colle en haut du cadre ; l ouverture puis les quatre
          diapositives epinglees passent par-dessus lui, sur une seule scene.
        */}
        <div className="o-relative">
          <div className="o-sticky o-z-0 o-overflow-hidden" style={{ top: CHROME, height: ECRAN }}>
            {cristal}
            {pierre}
            <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0" style={{ background: 'linear-gradient(to top, var(--o-palette-zinc-950) 0%, color-mix(in oklab, var(--o-palette-zinc-950) 55%, transparent) 40%, transparent 75%)' }} />
            <Grain opacite={0.06} />
          </div>

          <div className="o-relative o-z-10" style={{ marginTop: `calc(-1 * ${ECRAN})` }}>
            {/* L ouverture : la pierre brute, avant toute monture. */}
            <section id="haut" className="o-relative o-flex o-flex-col" style={{ minHeight: ECRAN }}>
              <BarreCoins marque="Auber" liens={NAVIGATION} droite={<Horloge ville="Paris" />} />
              <div className="o-flex o-grow o-flex-col o-justify-end o-px-6 o-pb-24 o-pt-16 md:o-px-14 md:o-pb-28">
                <Surgit>
                  <Etiquette>Paris, quai de l Horloge — depuis 1946</Etiquette>
                </Surgit>
                <TitreVague delai={120} className="o-m-0 o-mt-6 o-max-w-4xl" style={{ ...serif('l'), fontSize: 'clamp(3rem, 8vw, 8.5rem)' }}>
                  Quatre pieces, et le prix de chacune.
                </TitreVague>
                <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                  <Surgit delai={520} as="p" className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300 md:o-col-span-6">
                    La pierre, le metal, les heures de sertissage et la taxe sont ecrits. Une maison qui se cache derriere un prix rond n a rien a montrer.
                  </Surgit>
                  <Surgit delai={640} className="md:o-col-span-6 md:o-flex md:o-justify-end">
                    <Actions pleine={['#pieces', <>Entrer dans la vitrine <Icon icon={ArrowDown} size={16} aria-hidden="true" /></>]} fantome={['#composer', 'Composer un devis']} />
                  </Surgit>
                </div>
              </div>
              <Coin position="bd">Atelier ouvert le jeudi<br />31 rue du Louvre</Coin>
            </section>

            {/* Les quatre diapositives, epinglees sur le cristal. */}
            <Epingle ecrans={4} actes={DIAPOSITIVES.length}>
              {(acte, progression) => {
                const d = DIAPOSITIVES[acte] ?? DIAPOSITIVES[0]
                return (
                  <div className="o-relative o-flex o-h-full o-flex-col o-justify-center o-px-6 md:o-px-14">
                    <div className="o-grid o-gap-8 md:o-grid-cols-12">
                      <div className="md:o-col-span-3">
                        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                          {String(acte + 1).padStart(2, '0')} / {String(DIAPOSITIVES.length).padStart(2, '0')}
                        </p>
                        <ol className="o-m-0 o-mt-6 o-list-none o-p-0">
                          {DIAPOSITIVES.map((autre, rang) => (
                            <li key={autre.mot} className="o-flex o-items-center o-gap-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: rang === acte ? encreSurSombre() : 'var(--o-theme-muted)' }}>
                              <span aria-hidden="true" className="o-h-px o-transition-all" style={{ width: rang === acte ? 24 : 8, backgroundColor: 'currentColor' }} />
                              {autre.mot}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="o-min-w-0 md:o-col-span-9">
                        <Entre key={d.mot}>
                          <h2 className="o-m-0 o-max-w-4xl o-text-balance" style={{ ...serif('l'), fontSize: 'clamp(2.25rem, 6vw, 6.5rem)' }}>
                            {d.titre}
                          </h2>
                        </Entre>
                        <Entre key={`${d.mot}-texte`} delai={120}>
                          <p className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300 md:o-ml-auto md:o-text-right">{d.texte}</p>
                        </Entre>
                      </div>
                    </div>
                    {/* La reglette de progression, en bas de l ecran. */}
                    <div aria-hidden="true" className="o-absolute o-bottom-8 o-left-6 o-right-6 o-h-px o-bg-white-10 md:o-left-12 md:o-right-12">
                      <div className="o-h-full" style={{ width: `${String(Math.round((reduced ? 1 : progression) * 100))}%`, backgroundColor: encreSurSombre(), transition: 'width 200ms linear' }} />
                    </div>
                  </div>
                )
              }}
            </Epingle>
          </div>
        </div>

        <main className="o-relative o-z-10" style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}>
          {/*
            ----- Les pieces, une par une, a la loupe ------------------------------
          */}
          <section id="pieces" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-14 md:o-py-32">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01">Les pieces</Indice>
                <h2 className="o-m-0 o-mt-5 o-max-w-3xl" style={{ ...serif('m'), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}>
                  En stock a l atelier, mise a la taille en quinze jours.
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                Passez le pointeur sur la piece :<br />la loupe grossit deux fois et demie
              </p>
            </div>

            <ol className="o-m-0 o-mt-20 o-list-none o-p-0">
              {PIECES.map((piece, rang) => (
                <li key={piece.cle} id={piece.cle} className="o-grid o-items-center o-gap-10 o-border-t o-border-white-10 o-py-16 md:o-grid-cols-12 md:o-gap-16">
                  <div className={`md:o-col-span-6 ${rang % 2 === 1 ? 'md:o-col-start-7 md:o-order-2' : ''}`}>
                    <LensZoom src={photo(piece.graine, 1200, 1500)} alt={`${piece.nom} — ${piece.type}`} ratio={0.85} zoom={2.5} size={220} className="o-overflow-hidden o-rounded-2xl" />
                  </div>
                  <div className={`md:o-col-span-5 ${rang % 2 === 1 ? 'md:o-order-1' : 'md:o-col-start-7'}`}>
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                      {String(rang + 1).padStart(2, '0')} — {piece.type}
                    </p>
                    <h3 className="o-m-0 o-mt-4" style={{ ...serif('l'), fontSize: 'clamp(2.75rem, 6vw, 6rem)' }}>
                      <ShineText from="var(--o-palette-zinc-50)" shine={accent(300)} duration={3600} width={24}>
                        {piece.nom}
                      </ShineText>
                    </h3>
                    <p className="o-m-0 o-mt-5 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300">{piece.cartel}</p>
                    <dl className="o-m-0 o-mt-8 o-flex o-flex-col o-gap-3 o-border-t o-border-white-10 o-pt-6 o-text-sm">
                      {([
                        ['Matiere', piece.matiere],
                        ['Pierre', piece.pierre],
                      ] as const).map(([quoi, valeur]) => (
                        <div key={quoi} className="o-grid o-gap-1 sm:o-grid-cols-12">
                          <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-400 sm:o-col-span-3">{quoi}</dt>
                          <dd className="o-m-0 o-text-zinc-200 sm:o-col-span-9">{valeur}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="o-m-0 o-mt-8 o-tabular-nums" style={{ ...serif('m'), fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', color: encreSurSombre() }}>
                      {euros(piece.prix)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/*
            ----- Le devis : le reste se compose ----------------------------------
          */}
          <section id="composer" className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-14 md:o-py-32" style={{ backgroundColor: accentDoux(500, 6) }}>
            <div className="o-grid o-gap-12 md:o-grid-cols-12">
              <div className="md:o-col-span-4">
                <Indice rang="02">Composer</Indice>
                <h2 className="o-m-0 o-mt-5" style={{ ...serif('m'), fontSize: 'clamp(2rem, 4vw, 3.75rem)' }}>
                  Le reste se compose.
                </h2>
                <p className="o-mt-5 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300">
                  Une pierre, un poids, une monture. Le devis decompose ce qu il contient, ligne a ligne, et la taxe en dernier.
                </p>
              </div>
              <div className="md:o-col-span-8">
                <Devis />
              </div>
            </div>
          </section>

          {/*
            ----- Un seul bouton, au centre d un ecran vide -----------------------
          */}
          <section id="atelier" className="o-scroll-mt-24 o-flex o-flex-col o-items-center o-justify-center o-border-t o-border-white-10 o-px-6 o-text-center" style={{ minHeight: ECRAN }}>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              L atelier se visite le jeudi — une heure, sans catalogue
            </p>
            <div className="o-mt-10">
              <Aimant force={0.4}>
                <a
                  href="mailto:atelier@auber-joaillerie.fr"
                  className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-px-10 o-py-5 o-text-base o-font-medium o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Prendre rendez-vous a l atelier
                  <Icon icon={ArrowUpRight} size={18} aria-hidden="true" />
                </a>
              </Aimant>
            </div>
          </section>
        </main>

        {/*
          ----- Le colophon -------------------------------------------------------
        */}
        <footer className="o-relative o-z-10 o-border-t o-border-white-10 o-px-6 o-pb-10 o-pt-16 md:o-px-14" style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}>
          <div className="o-grid o-gap-10 md:o-grid-cols-12">
            <div className="md:o-col-span-4">
              <p className="o-m-0" style={{ ...serif('m'), fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>Auber</p>
              <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">Colophon</p>
            </div>
            <dl className="o-m-0 md:o-col-span-8">
              {COLOPHON.map(([terme, valeur]) => (
                <div key={terme} className="o-grid o-gap-x-6 o-gap-y-1 o-border-t o-border-white-10 o-py-4 sm:o-grid-cols-12">
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 sm:o-col-span-3">{terme}</dt>
                  <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-300 sm:o-col-span-9">{valeur}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="o-mt-12 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            <span>© 2026 Auber SAS</span>
            <span>31 rue du Louvre, 75001 Paris — mardi au samedi, 11 h a 19 h</span>
            <a href="#haut" className="o-no-underline o-text-zinc-400 hover:o-text-zinc-50 focus:o-ring">Remonter ↑</a>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
