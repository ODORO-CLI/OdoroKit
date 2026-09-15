/**
 * Tangente — agence d automatisation par l IA.
 *
 * ## Le parti pris : le terrain ne bouge pas, la methode passe dessus
 *
 * L ouverture est celle de Sentira — un mot-marque en serif leger, deux
 * gelules, une bande de logos — mais le relief en fil de fer qui la porte ne
 * s arrete pas au bas de l ecran : il reste **colle derriere le manifeste**,
 * et ce sont les trois temps de la methode qui se remplacent dessus, un par
 * ecran de defilement. Le fond est la constante ; le discours est ce qui
 * avance. C est la signature de mouvement de la page, et elle n est pas
 * decorative : « sentir », « fermer », « construire » se lisent dans cet
 * ordre parce qu on ne peut pas les prendre autrement.
 *
 * ## Ce qui suit, et pourquoi chaque ecran a sa forme
 *
 * Les cas sont une liste numerotee a photographies : trois lignes, trois
 * chiffres qui roulent, trois paysages qui derivent dans leur cadre. Le
 * **mecanisme** vient ensuite — la carte de rendement, trois curseurs et un
 * nombre d heures rendues par an, avec le mois de retour sur investissement.
 * Puis un seul temoignage, qui prend tout l ecran et rien d autre. L appel est
 * une ligne : un nom, un courriel, un disque. Le pied porte le mot-marque en
 * pleine largeur.
 *
 * ## Aucune barre de chiffres
 *
 * Les seuls nombres mis en scene sont dans les cas, et ils sont releves chez
 * le client. Une agence qui aligne quatre indicateurs sous son heros vend sa
 * taille ; celle-ci vend ce qu elle a rendu.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { TerrainWireframe } from '@/odoro/background/TerrainWireframe.jsx'
import { BorderBeam } from '@/odoro/effect/BorderBeam.jsx'
import { ParallaxImage } from '@/odoro/image/ParallaxImage.jsx'
import { CountUp } from '@/odoro/text/CountUp.jsx'
import { ScrollReveal } from '@/odoro/text/ScrollReveal.jsx'
import { SplitLines } from '@/odoro/text/SplitLines.jsx'

import { nuit, Voile } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreFilet,
  CHROME,
  Etiquette,
  Grain,
  Indice,
  Logos,
  Pied,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  verre,
} from './marche.jsx'
import { photo, portrait } from './media.js'
import { accentDoux, aplat, encreSurSombre } from './palettes.js'
import { Epingle } from './scene.jsx'

/* ============================ Les donnees ============================== */

const LIENS = [
  ['#manifeste', 'La methode'],
  ['#cas', 'Les cas'],
  ['#rendement', 'Le rendement'],
  ['#appel', 'Contact'],
] as const

const CLIENTS = [
  'Meridian',
  'Ardoise',
  'Calque',
  'Nordsud',
  'Houle',
  'Brevet',
  'Semaphore',
  'Litt',
] as const

/**
 * Les trois actes du manifeste epingle.
 *
 * Un verbe par ecran : c est tout ce que la scene montre en grand. Le reste
 * est la phrase qui le tient, et la note technique qui l empeche d etre un
 * slogan.
 */
const ACTES: readonly {
  readonly mot: string
  readonly phrase: string
  readonly note: string
}[] = [
  {
    mot: 'Sentir',
    phrase: 'Deux semaines dans vos equipes, un chronometre a la main.',
    note: 'On note chaque tache repetee, on la mesure, on la classe par ce qu elle coute. Le rapport tient en six pages et vous le gardez, meme si vous ne signez pas.',
  },
  {
    mot: 'Fermer',
    phrase: 'Un flux a la fois, et le perimetre se ferme avant la premiere ligne.',
    note: 'Les projets d IA echouent parce qu ils restent ouverts. Nous choisissons le flux qui rend le plus d heures, et nous ecrivons ce que le systeme ne fera pas.',
  },
  {
    mot: 'Construire',
    phrase: 'Six a dix semaines, branche sur vos outils, en production des la troisieme.',
    note: 'Les modeles ne remplacent pas ce que vous avez : ils s y branchent. Les equipes sont formees a corriger le systeme, pas seulement a l utiliser.',
  },
]

/** Les cas, en liste numerotee : un chiffre releve, une photographie. */
const CAS = [
  {
    nom: 'Meridian',
    quoi: 'Transport routier, 340 salaries',
    titre: 'La saisie des ordres de transport, supprimee.',
    chiffre: 82,
    unite: '%',
    texte:
      'Lecture des bons de commande par modele de vision, controle humain sur les seuls cas douteux. Quatre-vingt-deux pour cent des lignes ne sont plus tapees.',
    graine: 'cobalt-plasturgie',
    alt: 'Une operatrice devant une presse, dans un atelier de production',
  },
  {
    nom: 'Ardoise',
    quoi: 'Cabinet comptable, 60 collaborateurs',
    titre: 'Le rapprochement bancaire rendu aux comptables.',
    chiffre: 1400,
    unite: ' h',
    texte:
      'Mille quatre cents heures rendues par an, avec un taux de reprise manuelle sous trois pour cent. Le cabinet a repris deux clients de plus sans embaucher.',
    graine: 'sillon-mediatheque',
    alt: 'Une grande salle de travail, des rangees de bureaux occupes',
  },
  {
    nom: 'Calque',
    quoi: 'Editeur de logiciels, 25 personnes',
    titre: 'Onze jours de delai ramenes a une heure.',
    chiffre: 11,
    unite: ' j',
    texte:
      'Le support repondait en onze jours ouvres. Huit semaines plus tard, la premiere reponse tombe en une heure, redigee par le systeme et relue par un humain.',
    graine: 'orbe-ecran-carnet',
    alt: 'Une main tenant un ecran, applications ouvertes',
  },
] as const

/** Ce que rapporte une heure rendue, selon le poste. */
const POSTES = [
  { nom: 'Administratif', horaire: 32 },
  { nom: 'Comptabilite', horaire: 41 },
  { nom: 'Support client', horaire: 36 },
  { nom: 'Juridique', horaire: 78 },
] as const

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Le corps du verbe geant de l acte : il remplit la moitie gauche. */
const CORPS_ACTE: CSSProperties = {
  ...affiche('xl', 300),
  fontSize: 'clamp(3.5rem, 11vw, 11rem)',
  lineHeight: 0.9,
}

/**
 * L ombre portee des textes de l acte.
 *
 * Le relief passe derriere eux et ses cretes croisent les lignes de base : une
 * ombre large et tres douce detache le texte sans poser de plaque, ce qui
 * cacherait le decor qu on vient justement montrer.
 */
const OMBRE_SUR_RELIEF: CSSProperties = {
  textShadow: '0 1px 2px rgba(0,0,0,0.85), 0 2px 22px rgba(0,0,0,0.8)',
}

/* ============================ Le rendu ================================= */

/**
 * La carte de rendement : trois curseurs, un chiffre.
 *
 * Le calcul est volontairement simple et lisible : heures repetees par
 * semaine x effectif x 46 semaines x part automatisable (62 %, la mediane de
 * nos flux). Le retour est le mois ou les heures rendues valent le projet.
 */
function Rendement(): ReactElement {
  const [heures, setHeures] = useState(6)
  const [effectif, setEffectif] = useState(40)
  const [poste, setPoste] = useState<(typeof POSTES)[number]>(POSTES[0])

  const calcul = useMemo(() => {
    const parAn = Math.round(heures * effectif * 46 * 0.62)
    const valeur = parAn * poste.horaire
    const projet = 48000 + effectif * 600
    const retour = Math.max(1, Math.ceil(projet / (valeur / 12)))
    return { parAn, valeur, retour }
  }, [heures, effectif, poste])

  const curseur = 'o-w-full o-accent-brand-500 focus:o-ring'

  return (
    <BorderBeam
      duration={5200}
      width={2}
      trail={22}
      color={encreSurSombre()}
      className="o-rounded-2xl"
    >
      <div className={`${verre(true)} o-grid o-gap-8 o-p-6 md:o-p-8 lg:o-grid-cols-12`}>
        <div className="o-flex o-flex-col o-gap-6 lg:o-col-span-5">
          <label className="o-block">
            <span className="o-flex o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Heures repetees par personne et par semaine
              <span className="o-text-white">{heures} h</span>
            </span>
            <input
              type="range"
              min={1}
              max={20}
              value={heures}
              onChange={(e) => {
                setHeures(Number(e.target.value))
              }}
              className={`o-mt-3 ${curseur}`}
            />
          </label>
          <label className="o-block">
            <span className="o-flex o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Personnes concernees
              <span className="o-text-white">{effectif}</span>
            </span>
            <input
              type="range"
              min={3}
              max={400}
              step={1}
              value={effectif}
              onChange={(e) => {
                setEffectif(Number(e.target.value))
              }}
              className={`o-mt-3 ${curseur}`}
            />
          </label>
          <div
            role="group"
            aria-label="Poste concerne"
            className="o-flex o-flex-wrap o-gap-2"
          >
            {POSTES.map((p) => {
              const actif = p.nom === poste.nom
              return (
                <button
                  key={p.nom}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setPoste(p)
                  }}
                  className={`o-cursor-pointer o-rounded-full o-border-w-1 o-px-3 o-py-1.5 o-font-mono o-text-xs o-transition-colors focus:o-ring ${actif ? 'o-border-transparent' : 'o-border-white-20 o-text-zinc-300 hover:o-bg-white-10'}`}
                  style={actif ? aplat() : undefined}
                >
                  {p.nom} · {p.horaire} EUR/h
                </button>
              )
            })}
          </div>
        </div>

        <span aria-hidden="true" className="o-block o-h-px o-bg-white-10 lg:o-hidden" />
        <dl className="o-m-0 o-grid o-grid-cols-2 o-gap-6 o-border-white-10 lg:o-col-span-7 lg:o-border-l lg:o-pl-8">
          <div className="o-col-span-2">
            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Heures rendues par an
            </dt>
            <dd
              className="o-m-0 o-mt-2 o-tabular-nums o-text-white"
              style={{ ...affiche('l', 300), fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            >
              <CountUp
                value={calcul.parAn}
                locale="fr-FR"
                duration={700}
                declenchement="montage"
              />
            </dd>
          </div>
          <div>
            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Ce que cela vaut
            </dt>
            <dd
              className="o-m-0 o-mt-2 o-text-3xl o-tabular-nums o-tracking-tight"
              style={{ color: encreSurSombre() }}
            >
              {calcul.valeur.toLocaleString('fr-FR')} EUR
            </dd>
          </div>
          <div>
            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Retour sur le projet
            </dt>
            <dd className="o-m-0 o-mt-2 o-text-3xl o-tabular-nums o-tracking-tight o-text-white">
              mois {calcul.retour}
            </dd>
          </div>
          <p className="o-col-span-2 o-m-0 o-text-sm o-leading-relaxed o-text-zinc-400">
            Part automatisable prise a 62 %, la mediane de nos flux livres. Le projet est
            chiffre a 48 000 EUR plus 600 EUR par personne formee. Ce sont des ordres de
            grandeur ; le cadrage donne les vrais.
          </p>
        </dl>
      </div>
    </BorderBeam>
  )
}

/**
 * L acte du manifeste, tel qu il se pose sur le terrain.
 *
 * Le verbe tient la moitie gauche, la phrase et la note la moitie droite. Ce
 * qui change entre deux actes, c est tout ; ce qui reste, c est le relief.
 */
function Acte({ rang }: { readonly rang: number }): ReactElement | null {
  const acte = ACTES[rang]
  if (acte === undefined) return null
  return (
    <div className="o-flex o-size-full o-flex-col o-px-6 o-py-10 md:o-px-10 lg:o-px-16">
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        La methode — temps {String(rang + 1)} sur trois
      </p>
      <div className="o-my-auto o-grid o-items-baseline o-gap-8 o-py-8 md:o-grid-cols-12 md:o-gap-12">
        <p
          key={acte.mot}
          className="o-m-0 o-text-white md:o-col-span-5"
          style={{ ...CORPS_ACTE, ...OMBRE_SUR_RELIEF }}
        >
          {acte.mot}
        </p>
        <div className="md:o-col-span-7">
          <p
            className="o-m-0 o-max-w-xl o-text-balance o-text-white"
            style={{
              ...affiche('m', 300),
              fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)',
              lineHeight: 1.12,
              ...OMBRE_SUR_RELIEF,
            }}
          >
            {acte.phrase}
          </p>
          <p
            className="o-m-0 o-mt-6 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300"
            style={OMBRE_SUR_RELIEF}
          >
            {acte.note}
          </p>
        </div>
      </div>
      <div className="o-flex o-items-center o-gap-3" aria-hidden="true">
        {ACTES.map((a, index) => (
          <span
            key={a.mot}
            className="o-h-1 o-grow o-rounded-full"
            style={{
              backgroundColor:
                index <= rang ? encreSurSombre() : 'var(--o-palette-zinc-800)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('fraunces')
  const temoin = portrait('tangente-temoin', 'Helene Marchal')
  const [envoye, setEnvoye] = useState(false)

  return (
    <Porte forme="compteur" marque="Tangente">
      <div className="o-relative o-isolate" style={{ ...nuit('zinc'), ...polices }}>
        {/* =========== L ouverture et le manifeste, sur un seul terrain ========== */}
        <div className="o-relative o-isolate">
          {/*
            Le relief est pose une fois, dans un calque colle : il tient
            derriere l ouverture puis derriere les trois actes, et se decroche
            quand le manifeste se termine. Une seule scene, deux sections.
          */}
          <div
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
          >
            <div
              className="o-sticky o-relative o-overflow-hidden"
              style={{ top: CHROME, height: ECRAN }}
            >
              <TerrainWireframe
                className="o-absolute o-inset-0 o-size-full"
                colors={['--o-theme-bg', '--o-vitrine-700', '--o-vitrine-400']}
                height={1.4}
                valley={0.7}
                speed={0.7}
                poster="o-bg-zinc-950"
              />
              <Voile sens="haut-bas" />
              <Grain />
            </div>
          </div>

          <header className="o-relative o-z-10 o-min-h-screen">
            <BarreFilet
              marque="Tangente"
              liens={LIENS}
              action={['#appel', 'Prendre rendez-vous']}
            />

            <div className="o-mx-auto o-flex o-max-w-6xl o-flex-col o-items-center o-px-6 o-pb-24 o-pt-20 o-text-center md:o-pt-28">
              <Surgit delai={0}>
                <Etiquette>Agence d automatisation par l IA — Lyon</Etiquette>
              </Surgit>
              <TitreVague
                delai={120}
                className="o-m-0 o-mt-8 o-text-white"
                style={affiche('xxl', 300)}
              >
                Tangente
              </TitreVague>
              <Surgit
                delai={420}
                as="p"
                className="o-m-0 o-mt-8 o-max-w-2xl o-text-lg o-leading-relaxed o-text-zinc-300 md:o-text-xl"
              >
                Nous cherchons ou l IA rentre dans votre metier, ce que les taches
                repetees vous coutent en heures, et nous construisons ce qui tient — sans
                deviner.
              </Surgit>
              <Surgit delai={560} className="o-mt-10">
                <Actions
                  pleine={[
                    '#rendement',
                    <>
                      Calculer les heures rendues{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#manifeste', 'Comment on travaille']}
                />
              </Surgit>
            </div>

            <div className="o-mx-auto o-flex o-max-w-6xl o-justify-between o-gap-6 o-px-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
              <Surgit delai={700} as="p" className="o-m-0">
                Lyon — Nantes
                <br />
                Depuis 2021
              </Surgit>
              <Surgit delai={760} as="p" className="o-m-0 o-text-right">
                Vingt-deux flux en production
                <br />
                Onze clients
              </Surgit>
            </div>

            <div className="o-mx-auto o-max-w-6xl o-px-6">
              <Surgit delai={760}>
                <Logos marques={CLIENTS} titre="Ils ont branche l IA sur leur metier" />
              </Surgit>
            </div>
          </header>

          {/* =========== Le manifeste : une phrase qui s allume, trois actes ====== */}
          <section id="manifeste" className="o-relative o-z-10 o-scroll-mt-24">
            <div className="o-mx-auto o-max-w-5xl o-px-6 o-py-28 md:o-py-40">
              <ScrollReveal
                as="p"
                dim={0.16}
                blur={5}
                course={0.75}
                className="o-m-0 o-text-balance o-text-white"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.75rem, 3.6vw, 3.75rem)',
                  lineHeight: 1.1,
                }}
              >
                La plupart des projets d IA echouent parce qu on a commence par le modele.
                Nous commencons par le chronometre.
              </ScrollReveal>
            </div>

            <Epingle ecrans={3.4} actes={3}>
              {(acte) => <Acte rang={acte} />}
            </Epingle>
          </section>
        </div>

        <main>
          {/* =========== (01) Les cas, en liste numerotee a photographies ========= */}
          <section
            id="cas"
            className="o-mx-auto o-max-w-7xl o-scroll-mt-24 o-px-6 o-py-24 md:o-py-32"
          >
            <Reveal>
              <Indice rang="01">Les cas</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-white"
                style={affiche('m', 300)}
              >
                Des chiffres releves chez le client, pas dans la plaquette.
              </h2>
            </Reveal>

            <ol className="o-m-0 o-mt-16 o-list-none o-border-t o-border-white-10 o-p-0">
              {CAS.map((cas, rang) => (
                <li
                  key={cas.nom}
                  className="o-grid o-items-center o-gap-8 o-border-b o-border-white-10 o-py-12 md:o-grid-cols-12 md:o-gap-10 md:o-py-16"
                >
                  <span
                    aria-hidden="true"
                    className="o-tabular-nums o-text-zinc-500 md:o-col-span-2"
                    style={affiche('l', 300)}
                  >
                    {String(rang + 1).padStart(2, '0')}
                  </span>

                  <div className="md:o-col-span-5">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      {cas.nom} — {cas.quoi}
                    </p>
                    <p
                      className="o-m-0 o-mt-4 o-tabular-nums o-text-white"
                      style={{
                        ...affiche('l', 300),
                        fontSize: 'clamp(3rem, 6.5vw, 6rem)',
                      }}
                    >
                      <CountUp
                        value={cas.chiffre}
                        suffix={cas.unite}
                        locale="fr-FR"
                        duration={1400}
                      />
                    </p>
                    <SplitLines
                      as="h3"
                      stagger={90}
                      duration={800}
                      className="o-m-0 o-mt-4 o-max-w-md o-text-balance o-text-white"
                      style={{
                        ...affiche('m', 300),
                        fontSize: 'clamp(1.375rem, 2.4vw, 2rem)',
                        lineHeight: 1.15,
                      }}
                    >
                      {cas.titre}
                    </SplitLines>
                    <p className="o-m-0 o-mt-4 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-400">
                      {cas.texte}
                    </p>
                  </div>

                  {/*
                    Le cadre de la ligne du milieu est plus haut que les deux
                    autres : sans cet ecart, trois lignes identiques
                    redeviendraient une grille de cartes.
                  */}
                  <div className="o-relative o-overflow-hidden o-rounded-2xl md:o-col-span-5">
                    <ParallaxImage
                      src={photo(cas.graine, 1100, 800)}
                      alt={cas.alt}
                      ratio={rang === 1 ? 1.2 : 1.6}
                      strength={0.3}
                      className="o-size-full"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* =========== (02) Le rendement, le mecanisme ========================== */}
          <section
            id="rendement"
            className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-border-t o-border-white-10 o-py-24 md:o-py-32"
          >
            <div
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-0"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${accentDoux(500, 22)} 0%, transparent 60%)`,
              }}
            />
            <div className="o-relative o-z-10 o-mx-auto o-max-w-7xl o-px-6">
              <Reveal>
                <Indice rang="02">Le rendement</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-3xl o-text-white"
                  style={affiche('m', 300)}
                >
                  Combien d heures on vous rend, avant de vous parler de modeles.
                </h2>
              </Reveal>
              <div className="o-mt-12">
                <Reveal delay={160}>
                  <Rendement />
                </Reveal>
              </div>
            </div>
          </section>

          {/* =========== Un seul temoignage, et tout l ecran pour lui ============= */}
          <section
            aria-label="Temoignage"
            className="o-flex o-flex-col o-justify-center o-border-t o-border-white-10 o-px-6 o-py-24"
            style={{ minHeight: ECRAN }}
          >
            <div className="o-mx-auto o-w-full o-max-w-5xl">
              <Reveal>
                <blockquote
                  className="o-m-0 o-text-balance o-text-white"
                  style={{
                    ...affiche('l', 300),
                    fontSize: 'clamp(1.875rem, 4.6vw, 4.25rem)',
                    lineHeight: 1.1,
                  }}
                >
                  « Ils n ont pas cherche a nous vendre des outils en plus. Ils ont
                  compris notre flux, et ils ont construit exactement ce qu il fallait —
                  pas une ligne de plus. »
                </blockquote>
              </Reveal>
              <Reveal delay={140}>
                <div className="o-mt-14 o-flex o-flex-wrap o-items-center o-justify-between o-gap-6 o-border-t o-border-white-10 o-pt-8">
                  <div className="o-flex o-items-center o-gap-4">
                    <img
                      src={temoin.src}
                      alt={temoin.alt}
                      className="o-size-14 o-rounded-full o-object-cover"
                    />
                    <div>
                      <p className="o-m-0 o-font-medium o-text-white">Helene Marchal</p>
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        Directrice des operations, Meridian
                      </p>
                    </div>
                  </div>
                  <a
                    href="#cas"
                    className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                    style={{ color: encreSurSombre() }}
                  >
                    Lire le cas Meridian{' '}
                    <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            </div>
          </section>

          {/* =========== (03) A2 : un nom, un courriel, un disque ================= */}
          <section
            id="appel"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-4xl">
              <Indice rang="03">Prendre rendez-vous</Indice>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-white"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 4rem)' }}
              >
                Deux semaines de cadrage, un rapport de six pages que vous gardez.
              </h2>

              <form
                className="o-mt-14 o-flex o-flex-col o-gap-8 md:o-flex-row md:o-items-end"
                onSubmit={(evenement) => {
                  evenement.preventDefault()
                  setEnvoye(true)
                }}
              >
                <label className="o-block o-min-w-0 md:o-flex-1">
                  <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Votre nom
                  </span>
                  <input
                    type="text"
                    name="nom"
                    autoComplete="name"
                    required
                    placeholder="Helene Marchal"
                    className="o-mt-3 o-w-full o-bg-transparent o-py-3 o-text-xl o-text-white focus:o-ring md:o-text-2xl"
                    style={{
                      border: 0,
                      borderRadius: 0,
                      borderBottom: '1px solid var(--o-palette-zinc-700)',
                    }}
                  />
                </label>
                <label className="o-block o-min-w-0 md:o-flex-1">
                  <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Votre courriel
                  </span>
                  <input
                    type="email"
                    name="courriel"
                    autoComplete="email"
                    required
                    placeholder="vous@exemple.fr"
                    className="o-mt-3 o-w-full o-bg-transparent o-py-3 o-text-xl o-text-white focus:o-ring md:o-text-2xl"
                    style={{
                      border: 0,
                      borderRadius: 0,
                      borderBottom: '1px solid var(--o-palette-zinc-700)',
                    }}
                  />
                </label>
                <button
                  type="submit"
                  aria-label="Envoyer la demande de rendez-vous"
                  className="o-inline-flex o-shrink-0 o-cursor-pointer o-items-center o-justify-center o-rounded-full o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={{ ...aplat(), width: 76, height: 76, border: 0 }}
                >
                  <Icon icon={ArrowRight} size={24} aria-hidden="true" />
                </button>
              </form>

              <p
                aria-live="polite"
                className="o-m-0 o-mt-8 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-400"
              >
                {envoye
                  ? 'Demande recue. Nous rappelons sous un jour ouvre, et nous venons avec le chronometre.'
                  : 'Reponse sous un jour ouvre. Nous ne demandons ni telephone, ni societe, ni budget : cela se dit mieux de vive voix.'}
              </p>
            </div>
          </section>
        </main>

        {/* =========== P1 : le mot-marque en pleine largeur ===================== */}
        <Pied
          marque="Tangente"
          colonnes={[
            {
              titre: 'Agence',
              liens: [
                ['#manifeste', 'La methode'],
                ['#cas', 'Les cas'],
                ['#appel', 'Contact'],
              ],
            },
            {
              titre: 'Bureaux',
              liens: [
                ['#appel', 'Lyon — 14 rue Bellecordiere'],
                ['#appel', 'Nantes — 9 quai Moncousu'],
              ],
            },
            {
              titre: 'Ecrire',
              liens: [
                ['#appel', 'bonjour@tangente.fr'],
                ['#appel', 'presse@tangente.fr'],
              ],
            },
            {
              titre: 'Legal',
              liens: [
                ['#appel', 'Mentions'],
                ['#appel', 'Donnees'],
                ['#appel', 'Conditions'],
              ],
            },
          ]}
          mention="SAS au capital de 120 000 EUR — RCS Lyon 912 448 007"
        />
      </div>
    </Porte>
  )
}
