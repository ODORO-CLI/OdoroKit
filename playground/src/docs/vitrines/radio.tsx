/**
 * Bande FM — radio associative.
 *
 * ## La reference : Miles (Framer)
 *
 * Une typographie geante qui occupe toute la largeur, du mono partout
 * ailleurs, un noir profond, et des bandeaux de mots qui traversent l ecran.
 * On lui prend le titre-objet et le bandeau ; on lui laisse ses vignettes.
 *
 * ## Le mecanisme : la grille
 *
 * Vingt-quatre heures d antenne, sept jours, ecrites a la main. La page lit
 * **l horloge du visiteur** : elle en deduit le jour, place un curseur a la
 * minute courante sur la bande des vingt-quatre heures, designe l emission en
 * cours, dit ce qu il en reste et ce qui suit. Un clic sur une case ouvre sa
 * fiche. Rien n est simule : si vous ouvrez la page a trois heures du matin,
 * c est la nuit musicale qui est a l antenne.
 *
 * ## Les chiffres
 *
 * Ils tiennent en une reglette : la bande FM de 87,5 a 108 MHz, graduee tous
 * les demi-megahertz, avec les trois emetteurs poses dessus a leur place. Il
 * n y a pas d autre chiffre sur cette page — une radio associative ne compte
 * pas ses auditeurs, elle compte ses frequences.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { AudioBars } from '@/odoro/background/AudioBars.jsx'
import { GlitchHover } from '@/odoro/effect/GlitchHover.jsx'
import { TextPressure } from '@/odoro/text/TextPressure.jsx'
import { PillTabs } from '@/odoro/ui/PillTabs.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import {
  affiche,
  BarreCoins,
  CHROME,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  usePolices,
} from './marche.jsx'
import { Bandeau } from './scene.jsx'

/* ============================ La grille ================================ */

/** Une case de la grille : ce qui passe, quand, et qui le tient. */
interface Case {
  /** Debut, en minutes depuis minuit. */
  readonly debut: number
  /** Duree, en minutes. */
  readonly duree: number
  readonly nom: string
  readonly genre: 'parole' | 'musique' | 'info' | 'antenne'
  readonly qui: string
  readonly quoi: string
}

/** Une grille de nuit commune a tous les jours. */
const NUIT: readonly Case[] = [
  { debut: 0, duree: 360, nom: 'La nuit longue', genre: 'musique', qui: 'Antenne automatique', quoi: 'Six heures sans voix, tirees de la discotheque de l association. Deux mille huit cents titres, aucune repetition dans la meme nuit.' },
  { debut: 360, duree: 60, nom: 'Le premier cafe', genre: 'antenne', qui: 'Yanis Kerdal', quoi: 'Une heure pour se reveiller : la revue des affichages de la ville, la meteo du jour, et un disque toutes les trois minutes.' },
]

/** La fin de soiree, elle aussi commune. */
const SOIR: readonly Case[] = [
  { debut: 1260, duree: 120, nom: 'Dernier train', genre: 'musique', qui: 'Selim Abkhar', quoi: 'Deux heures sans parler par-dessus les morceaux. C est la seule regle de l emission, et elle tient depuis onze ans.' },
]

/** Les jours, chacun avec son milieu de journee. */
const JOURS: readonly { readonly id: string; readonly label: string; readonly cases: readonly Case[] }[] = [
  {
    id: 'lundi',
    label: 'Lundi',
    cases: [
      { debut: 420, duree: 90, nom: 'Sur le pouce', genre: 'info', qui: 'La redaction', quoi: 'Le journal local de quinze minutes, puis l invite du matin : un conseil de quartier, une association, un chantier qui traine.' },
      { debut: 510, duree: 150, nom: 'Table ouverte', genre: 'parole', qui: 'Noor Hamdi', quoi: 'Deux heures et demie de standard ouvert. Le sujet est annonce le vendredi ; les auditeurs arrivent avec le leur.' },
      { debut: 660, duree: 180, nom: 'Le grand bac', genre: 'musique', qui: 'Rotation', quoi: 'Trois heures de disques choisis par les benevoles, un bac par semaine. Personne ne sait ce qui va sortir.' },
      { debut: 840, duree: 120, nom: 'Les heures creuses', genre: 'antenne', qui: 'Antenne automatique', quoi: 'La playlist de la semaine, sans presentation, avec les rendez-vous de l association toutes les demi-heures.' },
      { debut: 960, duree: 120, nom: 'Le retour', genre: 'info', qui: 'La redaction', quoi: 'Le journal de dix-huit heures, le point circulation, et la chronique du conseil municipal quand il siege.' },
      { debut: 1080, duree: 180, nom: 'Atelier libre', genre: 'parole', qui: 'Les ateliers', quoi: 'L emission des ateliers de la radio : lyceens le lundi, groupe d alphabetisation le mercredi, detenus le jeudi.' },
    ],
  },
  {
    id: 'mardi',
    label: 'Mardi',
    cases: [
      { debut: 420, duree: 90, nom: 'Sur le pouce', genre: 'info', qui: 'La redaction', quoi: 'Le journal local de quinze minutes, puis l invite du matin.' },
      { debut: 510, duree: 120, nom: 'Ondes courtes', genre: 'parole', qui: 'Perrine Vaux', quoi: 'Deux heures d entretiens longs, un seul invite, sans montage. On coupe quand la conversation s arrete, pas quand l horloge le dit.' },
      { debut: 630, duree: 210, nom: 'Le grand bac', genre: 'musique', qui: 'Rotation', quoi: 'Trois heures et demie de disques choisis par les benevoles.' },
      { debut: 840, duree: 120, nom: 'Les heures creuses', genre: 'antenne', qui: 'Antenne automatique', quoi: 'La playlist de la semaine, sans presentation.' },
      { debut: 960, duree: 120, nom: 'Le retour', genre: 'info', qui: 'La redaction', quoi: 'Le journal de dix-huit heures et le point circulation.' },
      { debut: 1080, duree: 180, nom: 'Pleine bande', genre: 'musique', qui: 'Selim Abkhar', quoi: 'Trois heures de scene locale : huit groupes du departement par mois, enregistres au studio de la rue Basse.' },
    ],
  },
  {
    id: 'mercredi',
    label: 'Mercredi',
    cases: [
      { debut: 420, duree: 90, nom: 'Sur le pouce', genre: 'info', qui: 'La redaction', quoi: 'Le journal local et l invite du matin.' },
      { debut: 510, duree: 120, nom: 'Le bocal', genre: 'parole', qui: 'Atelier des enfants', quoi: 'Deux heures tenues par les huit-douze ans du centre social : ils ecrivent, ils enregistrent, ils passent a l antenne le jour meme.' },
      { debut: 630, duree: 210, nom: 'Le grand bac', genre: 'musique', qui: 'Rotation', quoi: 'Trois heures et demie de disques choisis par les benevoles.' },
      { debut: 840, duree: 120, nom: 'Les heures creuses', genre: 'antenne', qui: 'Antenne automatique', quoi: 'La playlist de la semaine.' },
      { debut: 960, duree: 120, nom: 'Le retour', genre: 'info', qui: 'La redaction', quoi: 'Le journal de dix-huit heures.' },
      { debut: 1080, duree: 180, nom: 'Atelier libre', genre: 'parole', qui: 'Les ateliers', quoi: 'L emission du groupe d alphabetisation, en trois langues, avec les traductions en direct.' },
    ],
  },
  {
    id: 'jeudi',
    label: 'Jeudi',
    cases: [
      { debut: 420, duree: 90, nom: 'Sur le pouce', genre: 'info', qui: 'La redaction', quoi: 'Le journal local et l invite du matin.' },
      { debut: 510, duree: 150, nom: 'Table ouverte', genre: 'parole', qui: 'Noor Hamdi', quoi: 'Deux heures et demie de standard ouvert.' },
      { debut: 660, duree: 180, nom: 'Le grand bac', genre: 'musique', qui: 'Rotation', quoi: 'Trois heures de disques choisis par les benevoles.' },
      { debut: 840, duree: 120, nom: 'Les heures creuses', genre: 'antenne', qui: 'Antenne automatique', quoi: 'La playlist de la semaine.' },
      { debut: 960, duree: 120, nom: 'Le retour', genre: 'info', qui: 'La redaction', quoi: 'Le journal de dix-huit heures, et le compte rendu du conseil quand il siege.' },
      { debut: 1080, duree: 180, nom: 'Parloir', genre: 'parole', qui: 'Atelier de la maison d arret', quoi: 'Enregistre le mardi, diffuse le jeudi : une heure de textes lus, deux heures de disques demandes.' },
    ],
  },
  {
    id: 'vendredi',
    label: 'Vendredi',
    cases: [
      { debut: 420, duree: 90, nom: 'Sur le pouce', genre: 'info', qui: 'La redaction', quoi: 'Le journal local et l invite du matin.' },
      { debut: 510, duree: 120, nom: 'Ondes courtes', genre: 'parole', qui: 'Perrine Vaux', quoi: 'Deux heures d entretiens longs, un seul invite.' },
      { debut: 630, duree: 210, nom: 'Le grand bac', genre: 'musique', qui: 'Rotation', quoi: 'Trois heures et demie de disques choisis par les benevoles.' },
      { debut: 840, duree: 120, nom: 'Les heures creuses', genre: 'antenne', qui: 'Antenne automatique', quoi: 'La playlist de la semaine.' },
      { debut: 960, duree: 120, nom: 'Le retour', genre: 'info', qui: 'La redaction', quoi: 'Le journal de dix-huit heures, et l agenda du week-end en entier.' },
      { debut: 1080, duree: 180, nom: 'Plateau du vendredi', genre: 'musique', qui: 'En public', quoi: 'Trois heures en direct du studio, portes ouvertes, trente places assises. On entre par la cour, il faut arriver avant vingt heures.' },
    ],
  },
  {
    id: 'samedi',
    label: 'Samedi',
    cases: [
      { debut: 420, duree: 180, nom: 'Marche couvert', genre: 'antenne', qui: 'En exterieur', quoi: 'Trois heures depuis la halle, avec un emetteur portatif : commercants, acheteurs, et le bruit du marche sous la voix.' },
      { debut: 600, duree: 240, nom: 'Le grand bac', genre: 'musique', qui: 'Rotation', quoi: 'Quatre heures, la plus longue de la semaine, avec deux benevoles a la console.' },
      { debut: 840, duree: 180, nom: 'Sorties', genre: 'parole', qui: 'Perrine Vaux', quoi: 'Ce qui se joue ce soir dans le departement : salles, chapiteaux, bars a concert, et le theatre de ville.' },
      { debut: 1020, duree: 240, nom: 'Pleine bande', genre: 'musique', qui: 'Selim Abkhar', quoi: 'Quatre heures de scene locale et d enregistrements du studio.' },
    ],
  },
  {
    id: 'dimanche',
    label: 'Dimanche',
    cases: [
      { debut: 420, duree: 240, nom: 'Les heures creuses', genre: 'antenne', qui: 'Antenne automatique', quoi: 'Quatre heures de playlist, sans presentation : le dimanche matin, personne n est au studio.' },
      { debut: 660, duree: 120, nom: 'Rediffusions', genre: 'parole', qui: 'La semaine passee', quoi: 'Les deux entretiens de la semaine, a la suite, pour qui les a manques.' },
      { debut: 780, duree: 180, nom: 'Le grand bac', genre: 'musique', qui: 'Rotation', quoi: 'Trois heures de disques choisis par les benevoles.' },
      { debut: 960, duree: 300, nom: 'Longue soiree', genre: 'musique', qui: 'Antenne automatique', quoi: 'Cinq heures d une seule selection, annoncee le samedi. La plus ecoutee de la semaine, et celle ou personne ne parle.' },
    ],
  },
]

/** La grille complete d un jour, nuit et soir compris, dans l ordre. */
function grilleDe(id: string): readonly Case[] {
  const jour = JOURS.find((candidat) => candidat.id === id) ?? JOURS[0]
  return [...NUIT, ...(jour?.cases ?? []), ...SOIR].sort((a, b) => a.debut - b.debut)
}

/** L heure d une minute depuis minuit : « 07 h 30 ». */
function heure(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')}`
}

/** Les quatre genres, et le niveau d accent qui les distingue. */
const GENRES: Readonly<Record<Case['genre'], { readonly nom: string; readonly part: number }>> = {
  parole: { nom: 'Parole', part: 78 },
  musique: { nom: 'Musique', part: 52 },
  info: { nom: 'Information', part: 100 },
  antenne: { nom: 'Antenne libre', part: 26 },
}

/**
 * Le fond d une case, et l encre qui tient dessus.
 *
 * Une case en accent plein ne supporte pas forcement une encre claire : la
 * couleur vient de la barre, et elle peut etre jaune. `aplat()` porte le
 * couple calcule pour elle ; les cases melangees au fond, elles, sont assez
 * foncees pour prendre l encre claire.
 */
function habit(genre: Case['genre']): CSSProperties {
  const { part } = GENRES[genre]
  return part >= 95
    ? aplat()
    : { backgroundColor: accentDoux(500, part), color: 'var(--o-palette-zinc-50)' }
}

/* ============================ La reglette FM =========================== */

/** Les trois emetteurs de l association, sur la bande. */
const EMETTEURS: readonly (readonly [frequence: number, lieu: string, puissance: string])[] = [
  [89.1, 'Toul', '250 W'],
  [94.3, 'Nancy — Haut-du-Lievre', '1 kW'],
  [106.7, 'Pont-a-Mousson', '120 W'],
]

/** La bande FM, de 87,5 a 108 MHz. */
const BANDE = { bas: 87.5, haut: 108 } as const

/** Ou tombe une frequence sur la reglette, en pour cent. */
function place(frequence: number): number {
  return ((frequence - BANDE.bas) / (BANDE.haut - BANDE.bas)) * 100
}

/** La reglette graduee : la forme C22, et les seuls chiffres de la page. */
function Reglette(): ReactElement {
  const graduations = useMemo(() => {
    const traits: { readonly f: number; readonly haute: boolean }[] = []
    for (let f = BANDE.bas; f <= BANDE.haut + 0.001; f += 0.5) {
      traits.push({ f: Math.round(f * 10) / 10, haute: Math.abs(f % 2) < 0.01 })
    }
    return traits
  }, [])

  return (
    // Les etiquettes d emetteur sont posees en absolu au-dessus de leur
    // graduation : sans cette bande a defilement lateral, celle de 106,7 sort
    // de la page a 380 px et elargit tout le document.
    <div className="o-relative o-overflow-x-auto o-overflow-y-hidden">
    <div className="o-px-6" style={{ minWidth: 740 }}>
    <div className="o-relative o-pb-24 o-pt-16">
      {/* Les emetteurs, poses au-dessus de leur graduation. */}
      {EMETTEURS.map(([frequence, lieu, puissance]) => (
        <div
          key={lieu}
          className="o-absolute o-top-0"
          style={{ left: `${String(place(frequence))}%`, transform: 'translateX(-50%)' }}
        >
          <p className="o-m-0 o-whitespace-nowrap o-text-center o-tabular-nums" style={{ ...affiche('m', 700), fontSize: 'clamp(1.35rem, 3vw, 2.5rem)', lineHeight: 0.9, color: 'var(--o-palette-zinc-50)' }}>
            {frequence.toFixed(1).replace('.', ',')}
          </p>
          <p className="o-m-0 o-mt-1 o-whitespace-nowrap o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            {puissance}
          </p>
          <span aria-hidden="true" className="o-mx-auto o-mt-2 o-block o-w-px" style={{ height: 22, backgroundColor: accent(400) }} />
        </div>
      ))}

      {/* La reglette elle-meme. */}
      <div className="o-relative o-h-10 o-border-t o-border-white-20">
        {graduations.map((trait) => (
          <span
            key={trait.f}
            aria-hidden="true"
            className="o-absolute o-top-0 o-block o-w-px"
            style={{
              left: `${String(place(trait.f))}%`,
              height: trait.haute ? 18 : 9,
              backgroundColor: trait.haute ? 'var(--o-palette-zinc-300)' : 'var(--o-palette-zinc-600)',
            }}
          />
        ))}
        {graduations
          .filter((trait) => trait.haute)
          .map((trait) => (
            <span
              key={`t-${String(trait.f)}`}
              aria-hidden="true"
              className="o-absolute o-font-mono o-text-xs o-tabular-nums o-text-zinc-400"
              style={{ left: `${String(place(trait.f))}%`, top: 22, transform: 'translateX(-50%)' }}
            >
              {trait.f}
            </span>
          ))}
      </div>

      {/* Les lieux, sous la bande. */}
      {EMETTEURS.map(([frequence, lieu]) => (
        <p
          key={lieu}
          className="o-absolute o-m-0 o-whitespace-nowrap o-font-mono o-text-xs o-uppercase o-tracking-widest"
          style={{ left: `${String(place(frequence))}%`, bottom: 8, transform: 'translateX(-50%)', color: encreSurSombre() }}
        >
          {lieu}
        </p>
      ))}
    </div>
    </div>
    </div>
  )
}

/* ============================ La bande des 24 heures =================== */

/** La bande d un jour : chaque case a la largeur de sa duree. */
function Bande({
  cases,
  choisie,
  choisir,
  minute,
}: {
  readonly cases: readonly Case[]
  readonly choisie: number
  readonly choisir: (debut: number) => void
  /** La minute courante, ou -1 quand ce n est pas aujourd hui. */
  readonly minute: number
}): ReactElement {
  return (
    <div className="o-relative o-overflow-x-auto o-overflow-y-hidden o-pb-2">
      <div className="o-relative" style={{ minWidth: 820 }}>
        {/* Les heures, toutes les deux heures. */}
        <div className="o-relative o-h-5">
          {Array.from({ length: 13 }, (_, rang) => rang * 2).map((h) => (
            <span
              key={h}
              aria-hidden="true"
              className="o-absolute o-top-0 o-font-mono o-text-xs o-tabular-nums o-text-zinc-500"
              style={{ left: `${String((h / 24) * 100)}%`, transform: h === 24 ? 'translateX(-100%)' : 'translateX(0)' }}
            >
              {String(h).padStart(2, '0')}
            </span>
          ))}
        </div>

        <div className="o-relative o-flex o-h-20 o-gap-px">
          {cases.map((creneau) => {
            const active = creneau.debut === choisie
            return (
              <button
                key={creneau.debut}
                type="button"
                onClick={() => {
                  choisir(creneau.debut)
                }}
                aria-pressed={active}
                className="o-relative o-block o-h-full o-cursor-pointer o-overflow-hidden o-p-2 o-text-left o-transition-opacity hover:o-opacity-90 focus:o-ring"
                style={{
                  width: `${String((creneau.duree / 1440) * 100)}%`,
                  ...habit(creneau.genre),
                  border: 'none',
                  boxShadow: active ? 'inset 0 0 0 2px var(--o-palette-zinc-50)' : 'none',
                }}
              >
                <span className="o-block o-truncate o-font-mono o-text-xs o-uppercase o-tracking-widest">{creneau.nom}</span>
                <span className="o-mt-1 o-block o-truncate o-font-mono o-text-xs o-tabular-nums o-opacity-70">{heure(creneau.debut)}</span>
              </button>
            )
          })}

          {/* Le curseur de l heure courante. */}
          {minute >= 0 && (
            <span
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-y-0 o-block o-w-0.5"
              style={{ left: `${String((minute / 1440) * 100)}%`, backgroundColor: 'var(--o-palette-zinc-50)' }}
            >
              <span className="o-absolute o-left-0 o-top-0 o-block o-size-2 o-rounded-full" style={{ backgroundColor: 'var(--o-palette-zinc-50)', transform: 'translate(-3px, -4px)' }} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================ Le message ecrit ========================= */

/** Une intention, et le message qui va avec — la forme A33. */
const MESSAGES: readonly { readonly id: string; readonly label: string; readonly objet: string; readonly corps: string }[] = [
  {
    id: 'emission',
    label: 'Proposer une emission',
    objet: 'Proposition d emission',
    corps:
      'Bonjour,\n\nJ ecoute Bande FM et je voudrais proposer une emission. J ai une idee de format, une heure par semaine, et je peux venir au studio le soir. Je n ai jamais fait de radio.\n\nQuand puis-je passer vous voir ?',
  },
  {
    id: 'adherer',
    label: 'Adherer a l association',
    objet: 'Adhesion',
    corps:
      'Bonjour,\n\nJe voudrais adherer a l association. J ai compris que la cotisation est libre a partir de douze euros, et qu elle donne acces au studio et aux ateliers.\n\nComment faire ?',
  },
  {
    id: 'antenne',
    label: 'Signaler un probleme d antenne',
    objet: 'Reception',
    corps:
      'Bonjour,\n\nJe ne vous recois plus correctement depuis deux jours. Je suis a environ quinze kilometres de l emetteur, et le son se coupe par moments, surtout le soir.\n\nEst-ce que le probleme est connu ?',
  },
]

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#grille', 'La grille'],
  ['#bande', 'La bande'],
  ['#studio', 'Le studio'],
  ['#ecrire', 'Nous ecrire'],
] as const

/** Les sept jours, dans l ordre de l horloge du navigateur. */
const ORDRE = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const

export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  const { reduced } = useMotionState()

  // L horloge du visiteur : le jour, et la minute depuis minuit.
  const [maintenant, setMaintenant] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => {
      setMaintenant(new Date())
    }, 20000)
    return () => {
      window.clearInterval(id)
    }
  }, [])
  const aujourdhui = ORDRE[maintenant.getDay()] ?? 'lundi'
  const minuteCourante = maintenant.getHours() * 60 + maintenant.getMinutes()

  const [jour, setJour] = useState<string>(aujourdhui)
  const cases = useMemo(() => grilleDe(jour), [jour])

  // L emission en cours : celle qui couvre la minute courante, aujourd hui.
  const enCours = useMemo(() => {
    const dujour = grilleDe(aujourdhui)
    return dujour.find((creneau) => minuteCourante >= creneau.debut && minuteCourante < creneau.debut + creneau.duree) ?? dujour[0]
  }, [aujourdhui, minuteCourante])
  const suivante = useMemo(() => {
    const dujour = grilleDe(aujourdhui)
    return dujour.find((creneau) => creneau.debut > minuteCourante) ?? dujour[0]
  }, [aujourdhui, minuteCourante])

  const [choisie, setChoisie] = useState<number>(-1)
  const fiche = cases.find((creneau) => creneau.debut === choisie) ?? enCours ?? cases[0]

  const [intention, setIntention] = useState(MESSAGES[0]?.id ?? 'emission')
  const message = MESSAGES.find((candidat) => candidat.id === intention) ?? MESSAGES[0]

  const reste = enCours === undefined ? 0 : enCours.debut + enCours.duree - minuteCourante
  const avance = enCours === undefined ? 0 : ((minuteCourante - enCours.debut) / enCours.duree) * 100

  return (
    <Porte forme="compteur" marque="Bande FM">
      <div className="o-relative" style={{ ...nuit('zinc'), ...polices }}>
        {/* ================= L affiche =================================== */}
        <header className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden" style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}>
          <AudioBars
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            bars={48}
            gap={0.55}
            segments={18}
            speed={0.5}
            colors={['--o-palette-zinc-950', '--o-vitrine-500', '--o-vitrine-300']}
            fallback="o-bg-zinc-950"
          />
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{ background: `linear-gradient(180deg, var(--o-palette-zinc-950) 4%, transparent 42%, var(--o-palette-zinc-950) 92%)` }}
          />
          <Grain opacite={0.08} />

          <BarreCoins marque="Bande FM" liens={NAVIGATION} droite="94,3 — Radio associative, Nancy" />

          <div className="o-relative o-z-20 o-flex o-grow o-flex-col o-justify-between o-gap-8 o-px-6 o-pb-10 md:o-px-10">
            <Surgit>
              <Etiquette>Association loi 1901 · 212 adherents · trois emetteurs</Etiquette>
            </Surgit>

            <h1 className="o-m-0 o-text-zinc-50" style={{ ...affiche('xxl', 400), fontSize: 'clamp(3rem, 17vw, 17rem)', lineHeight: 0.8, letterSpacing: '-0.05em' }}>
              {reduced ? 'Bande FM' : <TextPressure as="span" graisseBasse={400} graisseHaute={400} chasse={0} rayon={300}>Bande FM</TextPressure>}
            </h1>

            <div className="o-grid o-items-end o-gap-8 md:o-grid-cols-12">
              <Surgit delai={420} className="md:o-col-span-5">
                {/* Le direct, lu sur l horloge du visiteur. */}
                <div className="o-p-6" style={{ backgroundColor: accentDoux(950, 70), boxShadow: `inset 0 0 0 1px ${accentDoux(300, 26)}` }}>
                  <p className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                    <span aria-hidden="true" className="o-block o-size-2 o-rounded-full" style={{ backgroundColor: accent(500) }} />
                    En ce moment — {heure(minuteCourante)}
                  </p>
                  <p className="o-m-0 o-mt-4 o-text-zinc-50" style={{ ...affiche('m', 400), fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: 0.96 }}>
                    {enCours?.nom ?? 'Antenne'}
                  </p>
                  <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    {enCours?.qui ?? 'Antenne automatique'} · encore {String(reste)} min
                  </p>
                  <span aria-hidden="true" className="o-mt-5 o-block o-h-1 o-w-full" style={{ backgroundColor: accentDoux(300, 20) }}>
                    <span className="o-block o-h-full" style={{ width: `${String(avance)}%`, backgroundColor: accent(500) }} />
                  </span>
                  <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                    Ensuite — {suivante?.nom ?? '—'} a {heure(suivante?.debut ?? 0)}
                  </p>
                </div>
              </Surgit>

              <Surgit delai={520} as="p" className="o-m-0 o-text-base o-leading-relaxed o-text-zinc-300 md:o-col-span-4">
                Vingt-quatre heures sur vingt-quatre depuis 1987, sans publicite, avec quarante benevoles et deux salaries.
              </Surgit>

              <Surgit delai={600} className="md:o-col-span-3 md:o-text-right">
                <a
                  href="#grille"
                  className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3.5 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Voir la grille <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                </a>
              </Surgit>
            </div>
          </div>
        </header>

        {/* ================= Le bandeau : la signature de mouvement ======= */}
        <div className="o-overflow-hidden o-border-t o-border-b o-border-white-10 o-py-5" style={{ backgroundColor: accentDoux(950, 60) }}>
          <Bandeau
            mots={['Table ouverte', 'Ondes courtes', 'Le grand bac', 'Pleine bande', 'Marche couvert', 'Parloir', 'Dernier train']}
            separateur="·"
            vitesse={38}
            taille="clamp(1.75rem, 5vw, 4.5rem)"
            className="o-text-zinc-50"
          />
        </div>

        <main>
          {/* ================= Le mecanisme : la grille ==================== */}
          <section id="grille" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="01">La grille</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-50" style={{ ...affiche('m', 400), fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)', lineHeight: 0.92, letterSpacing: '-0.035em' }}>
                  Vingt-quatre heures, sept jours, et le curseur est a votre heure.
                </h2>
              </Reveal>

              <div className="o-mt-10 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4">
                {/* Sept jours ne tiennent pas dans 380 px : la barre defile
                    de cote, et declare son axe vertical ferme. */}
                <div className="o-max-w-full o-overflow-x-auto o-overflow-y-hidden">
                  <PillTabs
                    label="Jour de la grille"
                    items={JOURS.map((candidat) => ({ id: candidat.id, label: candidat.label }))}
                    value={jour}
                    onValueChange={(id) => {
                      setJour(id)
                      setChoisie(-1)
                    }}
                    size="sm"
                  />
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  {jour === aujourdhui ? `Aujourd hui — ${heure(minuteCourante)}` : 'Le curseur ne marque que le jour en cours'}
                </p>
              </div>

              <div className="o-mt-8">
                <Bande cases={cases} choisie={choisie} choisir={setChoisie} minute={jour === aujourdhui ? minuteCourante : -1} />
              </div>

              <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-wrap o-gap-x-6 o-gap-y-2 o-p-0">
                {(Object.keys(GENRES) as Case['genre'][]).map((genre) => (
                  <li key={genre} className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    <span aria-hidden="true" className="o-block o-size-3" style={{ backgroundColor: habit(genre).backgroundColor }} />
                    {GENRES[genre].nom}
                  </li>
                ))}
              </ul>

              {/* La fiche de la case choisie. */}
              {fiche !== undefined && (
                <div className="o-mt-10 o-grid o-gap-8 o-border-t o-border-white-10 o-pt-10 md:o-grid-cols-12">
                  <div className="o-min-w-0 md:o-col-span-7">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>
                      {heure(fiche.debut)} — {heure(fiche.debut + fiche.duree)} · {GENRES[fiche.genre].nom}
                    </p>
                    <h3 className="o-m-0 o-mt-4 o-text-zinc-50" style={{ ...affiche('m', 400), fontSize: 'clamp(1.6rem, 3.4vw, 3rem)', lineHeight: 0.94 }}>
                      {reduced ? fiche.nom : <GlitchHover intensity={5}>{fiche.nom}</GlitchHover>}
                    </h3>
                    <p className="o-m-0 o-mt-5 o-max-w-2xl o-text-base o-leading-relaxed o-text-zinc-300">{fiche.quoi}</p>
                  </div>
                  <dl className="o-m-0 o-min-w-0 md:o-col-span-5">
                    {[
                      ['A l antenne', fiche.qui],
                      ['Duree', `${String(Math.floor(fiche.duree / 60))} h ${String(fiche.duree % 60).padStart(2, '0')}`],
                      ['Genre', GENRES[fiche.genre].nom],
                      ['Rediffusion', fiche.genre === 'parole' ? 'Dimanche, 11 h' : 'Aucune'],
                    ].map(([quoi, valeur]) => (
                      <div key={quoi} className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-white-10 o-py-3">
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">{quoi}</dt>
                        <dd className="o-m-0 o-text-right o-font-mono o-text-xs o-text-zinc-100">{valeur}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </section>

          {/* ================= C22 : la reglette ========================== */}
          <section id="bande" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28" style={{ backgroundColor: accentDoux(950, 74) }}>
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="02">La bande</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-50" style={{ ...affiche('m', 400), fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)', lineHeight: 0.92, letterSpacing: '-0.035em' }}>
                  Trois emetteurs, et rien entre les deux.
                </h2>
              </Reveal>
              <div className="o-mt-12">
                <Reglette />
              </div>
              <p className="o-m-0 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-300">
                Le relais du Haut-du-Lievre porte jusqu a vingt-deux kilometres par temps clair. Au-dela, il reste le flux : il part du meme studio, avec une seconde de retard.
              </p>
            </div>
          </section>

          {/* ================= Le studio ================================== */}
          <section id="studio" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28">
            <div className="o-mx-auto o-grid o-max-w-6xl o-gap-10 md:o-grid-cols-12">
              <div className="o-min-w-0 md:o-col-span-5">
                <Reveal>
                  <Indice rang="03">Le studio</Indice>
                </Reveal>
                <h2 className="o-m-0 o-mt-6 o-text-zinc-50" style={{ ...affiche('m', 400), fontSize: 'clamp(1.6rem, 3.4vw, 2.75rem)', lineHeight: 0.94 }}>
                  Deux cabines, une console, et la porte ouverte le vendredi.
                </h2>
              </div>
              <ol className="o-m-0 o-min-w-0 o-list-none o-border-t o-border-white-10 o-p-0 md:o-col-span-7">
                {[
                  ['Le studio A', 'Direct, six micros, une baie vitree sur la cour. C est de la que part tout ce qui est en direct.'],
                  ['Le studio B', 'Montage et enregistrement. Deux personnes en meme temps, pas trois : la piece fait neuf metres carres.'],
                  ['La discotheque', 'Quatre mille disques, classes par annee d entree dans la maison. Rien n est jete, meme ce qu on ne passe plus.'],
                  ['L atelier', 'Le mercredi et le jeudi, pour ceux qui n ont jamais tenu un micro. On sort avec une emission montee.'],
                ].map(([nom, texte], rang) => (
                  <li key={nom} className="o-grid o-gap-3 o-border-b o-border-white-10 o-py-6 md:o-grid-cols-12 md:o-gap-6">
                    <span aria-hidden="true" className="o-font-mono o-text-xs o-tabular-nums md:o-col-span-1" style={{ color: encreSurSombre() }}>
                      {String(rang + 1).padStart(2, '0')}
                    </span>
                    <h3 className="o-m-0 o-min-w-0 o-text-lg o-font-semibold o-text-zinc-50 md:o-col-span-4">{nom}</h3>
                    <p className="o-m-0 o-min-w-0 o-text-sm o-leading-relaxed o-text-zinc-400 md:o-col-span-7">{texte}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ================= A33 : le message deja ecrit ================= */}
          <section id="ecrire" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28" style={{ backgroundColor: accentDoux(950, 74) }}>
            <div className="o-mx-auto o-max-w-4xl">
              <Reveal>
                <Indice rang="04">Nous ecrire</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-50" style={{ ...affiche('m', 400), fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)', lineHeight: 0.92, letterSpacing: '-0.035em' }}>
                  Le message est deja ecrit.
                </h2>
              </Reveal>
              <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-300">
                Choisissez pourquoi vous ecrivez. Nous avons redige le reste : il n y a plus qu a l envoyer, et a signer.
              </p>

              <div className="o-mt-10 o-flex o-flex-wrap o-gap-2">
                {MESSAGES.map((candidat) => (
                  <button
                    key={candidat.id}
                    type="button"
                    onClick={() => {
                      setIntention(candidat.id)
                    }}
                    aria-pressed={candidat.id === intention}
                    className="o-cursor-pointer o-px-5 o-py-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
                    style={
                      candidat.id === intention
                        ? { ...aplat(), border: 'none' }
                        : { backgroundColor: 'transparent', color: 'var(--o-palette-zinc-300)', border: `1px solid ${accentDoux(300, 30)}` }
                    }
                  >
                    {candidat.label}
                  </button>
                ))}
              </div>

              {message !== undefined && (
                <div className="o-mt-8" style={{ backgroundColor: 'var(--o-palette-zinc-950)', boxShadow: `inset 0 0 0 1px ${accentDoux(300, 26)}` }}>
                  <p className="o-m-0 o-border-b o-border-white-10 o-px-6 o-py-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                    A : antenne@bandefm.org · Objet : {message.objet}
                  </p>
                  <p className="o-m-0 o-whitespace-pre-line o-px-6 o-py-7 o-text-base o-leading-relaxed o-text-zinc-100" aria-live="polite">
                    {message.corps}
                  </p>
                  <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-px-6 o-py-5">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                      Studio — 14 rue Basse, Nancy · 03 83 00 00 00
                    </p>
                    <a
                      href={`mailto:antenne@bandefm.org?subject=${encodeURIComponent(message.objet)}&body=${encodeURIComponent(message.corps)}`}
                      className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                      style={aplat()}
                    >
                      Envoyer ce message <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* ================= P36 : le pied en chasse fixe ================= */}
        <footer className="o-border-t o-border-white-10 o-px-6 o-py-14 md:o-px-10">
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest sm:o-grid-cols-2 lg:o-grid-cols-4">
            <p className="o-m-0 o-text-zinc-400">
              BANDE FM
              <br />
              94,3 NANCY / 89,1 TOUL
              <br />
              106,7 PONT-A-MOUSSON
              <br />
              FLUX 128 KBIT/S
            </p>
            <p className="o-m-0 o-text-zinc-400">
              14 RUE BASSE
              <br />
              54000 NANCY
              <br />
              03 83 00 00 00
              <br />
              ANTENNE@BANDEFM.ORG
            </p>
            <p className="o-m-0 o-text-zinc-400">
              STUDIO OUVERT
              <br />
              MARDI — VENDREDI 14 H — 19 H
              <br />
              PLATEAU PUBLIC VENDREDI 20 H
              <br />
              ATELIERS MERCREDI ET JEUDI
            </p>
            <p className="o-m-0 o-text-zinc-400">
              {[
                ['#grille', 'LA GRILLE'],
                ['#studio', 'LE STUDIO'],
                ['#ecrire', 'ADHERER'],
              ].map(([cible, mot]) => (
                <a key={mot} href={cible} className="o-block o-text-zinc-300 o-no-underline hover:o-text-zinc-50 focus:o-ring">
                  {mot}
                </a>
              ))}
              <span style={{ color: encreSurSombre() }}>ASSOCIATION LOI 1901</span>
            </p>
          </div>
          <p className="o-mx-auto o-mt-12 o-max-w-6xl o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            © 2026 BANDE FM — AUTORISATION ARCOM 2024-118 — SANS PUBLICITE — 212 ADHERENTS — DERNIERE MISE A JOUR DE LA GRILLE : 1ER SEPTEMBRE 2026
          </p>
        </footer>
      </div>
    </Porte>
  )
}
