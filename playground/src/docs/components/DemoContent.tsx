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
 * Il s'eteint d'un interrupteur, parce que l'autre question — a quoi ressemble
 * l'effet seul — est legitime aussi.
 *
 * @module
 */

import { type CSSProperties, type ReactElement } from 'react'

/** Reglages transmis par l'atelier. */
export interface DemoContentProps {
  /** Couleur du texte, choisie dans l'atelier. */
  color?: string
  /** Rayon des angles, choisi dans l'atelier. */
  radius?: number
  /** Densite du contenu. @defaultValue 'complet' */
  density?: 'complet' | 'sobre'
}

/**
 * Une maquette de site, en miniature.
 *
 * @example
 * <DemoContent color="#ffffff" radius={12} />
 */
export function DemoContent({
  color,
  radius = 12,
  density = 'complet',
}: DemoContentProps): ReactElement {
  const text: CSSProperties = color === undefined ? {} : { color }
  const card: CSSProperties = {
    borderRadius: `${String(radius)}px`,
    borderColor: 'currentColor',
    ...text,
  }

  return (
    <div
      className="o-relative o-flex o-h-full o-flex-col o-justify-between o-p-6 sm:o-p-8"
      style={text}
    >
      <header className="o-flex o-items-center o-justify-between o-gap-4">
        <span className="o-text-sm o-font-bold o-tracking-tight">Atelier</span>
        <nav className="o-flex o-items-center o-gap-4 o-text-xs o-opacity-80">
          <span>Produit</span>
          <span>Tarifs</span>
          <span
            className="o-border-w-1 o-px-3 o-py-1"
            style={{ ...card, borderRadius: `${String(radius)}px` }}
          >
            Essayer
          </span>
        </nav>
      </header>

      <div className="o-flex o-max-w-md o-flex-col o-gap-3 o-py-6">
        <h3 className="o-text-2xl o-font-bold o-tracking-tight o-text-balance sm:o-text-3xl">
          Ce qui se pose dessus doit rester lisible
        </h3>
        {density === 'complet' ? (
          <p className="o-text-sm o-opacity-80 o-text-pretty">
            Un fond se juge a ce qu il laisse passer, pas a ce qu il montre seul. Coupez
            ce contenu pour voir l effet nu.
          </p>
        ) : null}
      </div>

      {density === 'complet' ? (
        <div className="o-grid o-grid-cols-2 o-gap-3 sm:o-grid-cols-3">
          {['Contraste', 'Bordures', 'Lisibilite'].map((label, index) => (
            <div
              key={label}
              className={`o-border-w-1 o-p-3 o-text-xs ${index === 2 ? 'max-sm:o-hidden' : ''}`}
              style={card}
            >
              <span className="o-font-medium">{label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
