/**
 * Contenu de demonstration pose par-dessus une preview.
 *
 * ## A quoi il sert
 *
 * Un fond anime juge sur fond vide ment. Ce qu'on veut savoir d'un fond, c'est
 * s'il laisse lire ce qui se pose dessus : un titre reste-t-il lisible, une
 * bordure se detache-t-elle encore, un bouton se voit-il ? Un cadre vide ne
 * repond a aucune de ces questions, et c'est pourtant ainsi que les catalogues
 * presentent leurs fonds.
 *
 * ## Pourquoi plusieurs maquettes
 *
 * Un fond ne porte pas toujours un hero : il porte aussi des grilles de
 * cartes, des formulaires, des bandeaux de chiffres, des articles. Chaque
 * maquette pose une question differente — bordures, aplats translucides,
 * gros chiffres, texte au long — et l'atelier permet de passer de l'une a
 * l'autre.
 *
 * ## L'emplacement de titre
 *
 * `headline` remplace le titre du hero : c'est par la qu'une animation de
 * texte se presente **en situation** — comme le titre d'une page — plutot que
 * flottant seule au centre d'un cadre.
 *
 * @module
 */

import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Les maquettes disponibles. */
export type DemoVariant = 'aucun' | 'hero' | 'cartes' | 'formulaire' | 'stats' | 'article'

/** Reglages transmis par l'atelier. */
export interface DemoContentProps {
  /** Maquette affichee. @defaultValue 'hero' */
  variant?: DemoVariant
  /** Couleur du texte, choisie dans l'atelier. */
  color?: string
  /** Rayon des angles, choisi dans l'atelier. */
  radius?: number
  /** Densite du contenu. @defaultValue 'complet' */
  density?: 'complet' | 'sobre'
  /**
   * Remplace le titre du hero. C'est l'emplacement des animations de texte :
   * elles se jugent en titre de page, pas seules au centre d'un cadre.
   */
  headline?: ReactNode
}

/** Une carte translucide : fond a 8 %, bordure au courant. */
function veil(radius: number): CSSProperties {
  return {
    borderRadius: `${String(radius)}px`,
    borderColor: 'currentColor',
    backgroundColor: 'color-mix(in oklab, currentColor 8%, transparent)',
  }
}

/** Barre de navigation miniature, commune aux maquettes pleines. */
function MiniNav({ radius }: { radius: number }): ReactElement {
  return (
    <header className="o-flex o-items-center o-justify-between o-gap-4">
      <span className="o-text-sm o-font-bold o-tracking-tight">Atelier</span>
      <nav className="o-flex o-items-center o-gap-4 o-text-xs o-opacity-80">
        <span>Produit</span>
        <span>Tarifs</span>
        <span
          className="o-border-w-1 o-px-3 o-py-1"
          style={{ borderColor: 'currentColor', borderRadius: `${String(radius)}px` }}
        >
          Essayer
        </span>
      </nav>
    </header>
  )
}

/** Hero : titre, appui, deux boutons. */
function Hero({
  radius,
  density,
  headline,
}: {
  radius: number
  density: 'complet' | 'sobre'
  headline?: ReactNode
}): ReactElement {
  return (
    <div className="o-relative o-flex o-h-full o-flex-col o-justify-between o-p-6 sm:o-p-8">
      <MiniNav radius={radius} />

      <div className="o-flex o-max-w-md o-flex-col o-gap-3 o-py-4">
        <h3 className="o-text-2xl o-font-bold o-tracking-tight o-text-balance sm:o-text-3xl">
          {headline ?? 'Ce qui se pose dessus doit rester lisible'}
        </h3>
        {density === 'complet' ? (
          <p className="o-text-sm o-opacity-80 o-text-pretty">
            Un fond se juge a ce qu’il laisse passer, pas a ce qu’il montre seul.
          </p>
        ) : null}
        <div className="o-flex o-gap-2 o-pt-1">
          <span
            className="o-px-3 o-py-1.5 o-text-xs o-font-medium"
            style={{
              borderRadius: `${String(radius)}px`,
              backgroundColor: 'currentColor',
            }}
          >
            <span className="o-mix-blend-difference" style={{ color: 'white' }}>
              Commencer
            </span>
          </span>
          <span
            className="o-border-w-1 o-px-3 o-py-1.5 o-text-xs o-font-medium"
            style={{ borderColor: 'currentColor', borderRadius: `${String(radius)}px` }}
          >
            En savoir plus
          </span>
        </div>
      </div>

      {density === 'complet' ? (
        <div className="o-grid o-grid-cols-2 o-gap-3 sm:o-grid-cols-3">
          {['Contraste', 'Bordures', 'Lisibilite'].map((label, index) => (
            <div
              key={label}
              className={`o-border-w-1 o-p-3 o-text-xs ${index === 2 ? 'max-sm:o-hidden' : ''}`}
              style={veil(radius)}
            >
              <span className="o-font-medium">{label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Grille de cartes : trois offres, bordures et voiles translucides. */
function Cartes({ radius }: { radius: number }): ReactElement {
  const offres = [
    { nom: 'Esquisse', prix: '0 €', appui: 'Pour essayer' },
    { nom: 'Studio', prix: '19 €', appui: 'Pour travailler' },
    { nom: 'Maison', prix: '49 €', appui: 'Pour l equipe' },
  ]

  return (
    <div className="o-flex o-h-full o-flex-col o-justify-between o-p-6 sm:o-p-8">
      <MiniNav radius={radius} />
      <div className="o-grid o-grid-cols-3 o-gap-3 max-sm:o-grid-cols-1">
        {offres.map((offre, index) => (
          <div
            key={offre.nom}
            className={`o-flex o-flex-col o-gap-1 o-border-w-1 o-p-4 ${index > 0 ? 'max-sm:o-hidden' : ''}`}
            style={veil(radius)}
          >
            <span className="o-text-xs o-font-medium o-uppercase o-tracking-wider o-opacity-70">
              {offre.nom}
            </span>
            <span className="o-text-2xl o-font-bold o-tabular-nums">{offre.prix}</span>
            <span className="o-text-xs o-opacity-70">{offre.appui}</span>
            <span
              className="o-mt-2 o-border-w-1 o-px-3 o-py-1 o-text-center o-text-xs o-font-medium"
              style={{ borderColor: 'currentColor', borderRadius: `${String(radius)}px` }}
            >
              Choisir
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Formulaire : une carte de connexion centree. */
function Formulaire({ radius }: { radius: number }): ReactElement {
  const champ: CSSProperties = {
    borderRadius: `${String(radius)}px`,
    borderColor: 'color-mix(in oklab, currentColor 40%, transparent)',
  }

  return (
    <div className="o-flex o-h-full o-items-center o-justify-center o-p-6">
      <div
        className="o-flex o-w-64 o-flex-col o-gap-3 o-border-w-1 o-p-5"
        style={veil(radius)}
      >
        <span className="o-text-sm o-font-bold">Se connecter</span>
        <span
          className="o-border-w-1 o-px-3 o-py-1.5 o-text-xs o-opacity-70"
          style={champ}
        >
          adresse@exemple.fr
        </span>
        <span
          className="o-border-w-1 o-px-3 o-py-1.5 o-text-xs o-opacity-70"
          style={champ}
        >
          ••••••••
        </span>
        <span
          className="o-px-3 o-py-1.5 o-text-center o-text-xs o-font-medium"
          style={{ borderRadius: `${String(radius)}px`, backgroundColor: 'currentColor' }}
        >
          <span className="o-mix-blend-difference" style={{ color: 'white' }}>
            Continuer
          </span>
        </span>
      </div>
    </div>
  )
}

/** Bandeau de chiffres : quatre valeurs, alignees en pied. */
function Stats({ radius }: { radius: number }): ReactElement {
  const stats = [
    { valeur: '12 480', legende: 'projets' },
    { valeur: '99,98 %', legende: 'disponibilite' },
    { valeur: '4,9', legende: 'note moyenne' },
    { valeur: '38 ms', legende: 'reponse mediane' },
  ]

  return (
    <div className="o-flex o-h-full o-flex-col o-justify-between o-p-6 sm:o-p-8">
      <MiniNav radius={radius} />
      <div>
        <p className="o-max-w-sm o-pb-4 o-text-lg o-font-bold o-tracking-tight">
          Des chiffres qui doivent rester nets sur le mouvement.
        </p>
        <div className="o-grid o-grid-cols-2 o-gap-3 sm:o-grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.legende} className="o-border-w-1 o-p-3" style={veil(radius)}>
              <p className="o-text-xl o-font-bold o-tabular-nums">{stat.valeur}</p>
              <p className="o-text-xs o-opacity-70">{stat.legende}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Article : du texte au long, la ou un fond charge se juge le mieux. */
function Article(): ReactElement {
  return (
    <div className="o-flex o-h-full o-flex-col o-justify-center o-gap-3 o-p-6 sm:o-px-12">
      <span className="o-text-xs o-font-medium o-uppercase o-tracking-wider o-opacity-70">
        Journal — 12 mars
      </span>
      <h3 className="o-max-w-md o-text-xl o-font-bold o-tracking-tight o-text-balance">
        Le fond n’est pas une illustration, c’est une surface de travail
      </h3>
      <p className="o-max-w-md o-text-sm o-leading-relaxed o-opacity-80 o-text-pretty">
        Un paragraphe entier est le juge le plus sévère : la moindre zone de contraste
        insuffisant s’y voit immediatement, là où un titre isole pardonne tout.
      </p>
      <p className="o-max-w-md o-text-sm o-leading-relaxed o-opacity-60 o-text-pretty max-sm:o-hidden">
        Si ces lignes se lisent sans effort d’un bout a l’autre du cadre, le fond tient
        son rôle.
      </p>
    </div>
  )
}

/**
 * Une maquette de site, en miniature.
 *
 * @example
 * <DemoContent variant="cartes" color="#ffffff" radius={12} />
 */
export function DemoContent({
  variant = 'hero',
  color,
  radius = 12,
  density = 'complet',
  headline,
}: DemoContentProps): ReactElement | null {
  if (variant === 'aucun') return null
  const text: CSSProperties = color === undefined ? {} : { color }

  return (
    <div className="o-relative o-h-full" style={text}>
      {variant === 'hero' ? (
        <Hero radius={radius} density={density} headline={headline} />
      ) : variant === 'cartes' ? (
        <Cartes radius={radius} />
      ) : variant === 'formulaire' ? (
        <Formulaire radius={radius} />
      ) : variant === 'stats' ? (
        <Stats radius={radius} />
      ) : (
        <Article />
      )}
    </div>
  )
}
