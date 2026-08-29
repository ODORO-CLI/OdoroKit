/**
 * Le composant qui rend toutes les icones.
 *
 * ## La taille suit le texte
 *
 * Une icone posee a cote d'un mot doit grandir avec lui. La taille par defaut
 * est donc `1em` : elle vaut la taille de police heritee, et une icone placee
 * dans un titre est grande sans qu'on ait rien a regler. Un nombre force une
 * taille en pixels quand l'icone est seule et ne suit aucun texte.
 *
 * ## La couleur vient du texte, jamais d'une propriete
 *
 * Il n'y a pas de propriete `color`. Le trace prend `currentColor`, si bien
 * qu'une classe de texte — `o-text-brand-600`, `dark:o-text-zinc-100` — colore
 * l'icone comme elle colore le reste. Une propriete de couleur creerait un
 * second chemin, qui divergerait du premier au premier changement de theme.
 *
 * ## L'accessibilite a un defaut, et il est correct
 *
 * La grande majorite des icones sont decoratives : elles doublent un mot deja
 * present. Elles sont donc **retirees** de l'arbre d'accessibilite par defaut,
 * ce qui evite qu'un lecteur d'ecran annonce « image » avant chaque libelle.
 *
 * Des qu'une icone porte seule le sens — un bouton sans texte —, `label` la
 * remet dans l'arbre avec son intitule. C'est le bon defaut dans les deux cas,
 * et le mauvais choix se voit : un bouton sans texte et sans `label` n'est
 * annonce par rien.
 *
 * @module
 */

import { createElement, type ReactElement, type SVGProps } from 'react'

import type { IconData } from './types.js'

/** Proprietes du composant. */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** L'icone a rendre, importee d'un des jeux. */
  icon: IconData
  /**
   * Taille du cote. Un nombre vaut des pixels, une chaine passe telle quelle.
   *
   * @defaultValue '1em'
   */
  size?: number | string
  /**
   * Intitule, pour une icone qui porte seule le sens.
   *
   * Absent, l'icone est decorative et retiree de l'arbre d'accessibilite.
   */
  label?: string
  /**
   * Epaisseur du trait, dans les unites de la boite du jeu.
   *
   * Sans effet sur un jeu plein, dont le trace est une surface. Le defaut est
   * celui que le jeu declare.
   */
  strokeWidth?: number
}

/**
 * Rend une icone.
 *
 * @example
 * // Decorative, a cote d'un mot : elle grandit avec lui.
 * <button className="o-inline-flex o-items-center o-gap-2 o-text-brand-600">
 *   <Icon icon={Download} />
 *   Telecharger
 * </button>
 *
 * @example
 * // Seule dans un bouton : elle porte le sens, donc elle a un intitule.
 * <button aria-label={undefined}>
 *   <Icon icon={X} label="Fermer" size={20} />
 * </button>
 */
export function Icon({
  icon,
  size = '1em',
  label,
  strokeWidth,
  ...rest
}: IconProps): ReactElement {
  const trait = icon.mode === 'trait'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.box}
      width={size}
      height={size}
      // Le mode decide ou va la couleur. Les deux attributs sont poses dans
      // les deux cas : sans le `fill="none"` explicite, un trace au trait est
      // rempli par le defaut du navigateur et devient une tache.
      fill={trait ? 'none' : 'currentColor'}
      stroke={trait ? 'currentColor' : undefined}
      strokeWidth={trait ? (strokeWidth ?? icon.stroke) : undefined}
      strokeLinecap={trait ? 'round' : undefined}
      strokeLinejoin={trait ? 'round' : undefined}
      // Une icone posee dans une ligne de texte s'aligne sur la base, ce qui
      // la fait flotter au-dessus du milieu des lettres.
      focusable="false"
      aria-hidden={label === undefined ? true : undefined}
      role={label === undefined ? undefined : 'img'}
      aria-label={label}
      {...rest}
    >
      {icon.nodes.map(([tag, attributes], index) =>
        // Les noeuds sont une donnee generee, jamais du markup : il n'y a rien
        // a echapper, et aucune echappatoire ouverte pour plus tard.
        createElement(tag, { key: index, ...camel(attributes) }),
      )}
    </svg>
  )
}

/**
 * Traduit les attributs SVG en proprietes React.
 *
 * `fill-rule` et `clip-rule` sont les seuls attributs a tirets que les jeux
 * emploient ; React les attend en casse chameau et ignore silencieusement les
 * autres formes, ce qui casse les traces a trous — un `o` devient un disque.
 */
function camel(attributes: Readonly<Record<string, string>>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(attributes)) {
    out[key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())] = value
  }
  return out
}
