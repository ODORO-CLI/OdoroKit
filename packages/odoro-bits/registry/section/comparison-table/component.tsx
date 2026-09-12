/**
 * Tableau comparatif.
 *
 * ## Une zone qui defile doit pouvoir recevoir le focus
 *
 * C'est la regle la moins connue de l'accessibilite des tableaux larges : un
 * conteneur a debordement n'est atteignable qu'a la souris ou au doigt tant
 * qu'il ne peut pas recevoir le focus. Quelqu'un qui navigue au clavier ne peut
 * alors pas voir les colonnes de droite — le contenu existe et lui reste
 * inaccessible.
 *
 * L'enveloppe porte donc `tabindex`, un role de region et un nom. Une fois
 * dedans, les fleches font defiler, comme partout ailleurs.
 *
 * ## Ce qui colle, et pourquoi deux fois
 *
 * L'en-tete colle en haut : sans lui, on lit une coche sans savoir de quelle
 * offre elle parle. La premiere colonne colle a gauche : sans elle, on lit une
 * coche sans savoir de quel critere il s'agit. Les deux defauts sont
 * symetriques, et un tableau comparatif large a besoin des deux.
 *
 * La cellule du coin colle dans les deux sens, faute de quoi elle passerait
 * sous ses voisines a la premiere diagonale.
 *
 * ## Une coche est un mot, pas un dessin
 *
 * Un « ✓ » lu par une synthese vocale donne « coche », ou rien du tout selon la
 * police et le reglage. Le signe est donc decoratif, et un texte cache dit
 * « compris » ou « non compris ». C'est ce texte qui est annonce, et c'est lui
 * qu'une recherche dans la page trouvera.
 *
 * ## La cascade est par rangee
 *
 * Une revelation par cellule ferait scintiller le tableau ; par colonne, elle
 * demanderait un delai sur chaque cellule d'une meme colonne, donc une valeur
 * ecrite autant de fois qu'il y a de lignes. La rangee est la seule unite qui
 * se lit et qui se decale a peu de frais.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { Fragment, useId, type CSSProperties, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Une colonne comparee. */
export interface ComparisonColumn {
  /** Ce que la colonne designe : une offre, un produit, une version. */
  readonly name: string
  /** Une precision sous le nom. */
  readonly note?: string
  /** Met la colonne en avant. Une seule le devrait. */
  readonly featured?: boolean
}

/** Une ligne comparee. */
export interface ComparisonRow {
  /** Le critere compare. */
  readonly label: string
  /**
   * Une valeur par colonne, dans le meme ordre.
   *
   * Un booleen devient une coche ou un tiret accompagnes de leur texte ; tout
   * le reste est affiche tel quel.
   */
  readonly values: readonly (boolean | string)[]
  /** Groupe auquel la ligne appartient. Les lignes d'un meme groupe se suivent. */
  readonly group?: string
}

/** Proprietes propres au composant. */
export interface ComparisonTableOwnProps {
  /** Les colonnes comparees. */
  columns: readonly ComparisonColumn[]
  /** Les lignes, dans l'ordre d'affichage. */
  rows: readonly ComparisonRow[]
  /** Legende du tableau. Elle est affichee, et elle nomme la zone qui defile. */
  caption: string
  /** Hauteur maximale de la zone qui defile, en pixels. @defaultValue 480 */
  maxHeight?: number
  /** Ce qui est dit d'une valeur vraie. @defaultValue 'Compris' */
  yesLabel?: string
  /** Ce qui est dit d'une valeur fausse. @defaultValue 'Non compris' */
  noLabel?: string
}

/** Toutes les proprietes. */
export type ComparisonTableProps = Customisable<ComparisonTableOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-comparison-table'

/** Pose les regles du tableau, une fois par document. */
function ensureComparisonRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cmp-zone]{overflow:auto;max-height:var(--o-cmp-hauteur);border-radius:0.75rem;',
    'border:1px solid var(--o-theme-line)}',
    '[data-o-cmp-zone]:focus-visible{outline:2px solid var(--o-palette-brand-500);outline-offset:2px}',

    '[data-o-cmp]{border-collapse:separate;border-spacing:0;width:100%;min-width:36rem}',
    '[data-o-cmp] th,[data-o-cmp] td{',
    'padding:0.7rem 1rem;text-align:left;font-size:0.8125rem;',
    'border-bottom:1px solid var(--o-theme-line);background-color:var(--o-theme-surface)}',

    // L'en-tete colle en haut, la premiere colonne a gauche. Les deux manques
    // sont symetriques : sans l'un on ignore de quelle offre il s'agit, sans
    // l'autre de quel critere.
    '[data-o-cmp] thead th{position:sticky;top:0;z-index:2;font-weight:600}',
    '[data-o-cmp] [data-o-cmp-critere]{position:sticky;left:0;z-index:1;font-weight:500}',
    // Le coin colle dans les deux sens : sinon il passe sous ses voisines a la
    // premiere diagonale.
    '[data-o-cmp] thead [data-o-cmp-critere]{z-index:3}',

    '[data-o-cmp] [data-o-cmp-groupe]{',
    'font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.06em;',
    'background-color:var(--o-theme-bg)}',

    '[data-o-cmp-cache] tbody tr{',
    'opacity:0;transform:translateY(8px);',
    'transition:opacity var(--o-duration-slow) var(--o-ease-entrance),',
    'transform var(--o-duration-slow) var(--o-ease-entrance);',
    'transition-delay:var(--o-cmp-delai)}',
    '[data-o-cmp-vu] tbody tr{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cmp-cache] tbody tr{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/** Rend une valeur de cellule, signe et texte compris. */
function Valeur({
  valeur,
  oui,
  non,
}: {
  valeur: boolean | string
  oui: string
  non: string
}): ReactElement {
  if (typeof valeur === 'string') return <>{valeur}</>

  return (
    <>
      {/*
        Le signe est decoratif : selon la police et le reglage, une synthese
        vocale dit « coche », « check mark » ou rien. C'est le texte cache qui
        porte le sens, et c'est lui que la recherche dans la page trouve.
      */}
      <span
        aria-hidden
        style={{
          color: valeur
            ? 'var(--o-palette-emerald-600)'
            : 'color-mix(in oklab, var(--o-theme-muted) 70%, transparent)',
        }}
      >
        {valeur ? '✓' : '—'}
      </span>
      <span className="o-sr-only">{valeur ? oui : non}</span>
    </>
  )
}

/**
 * Un tableau comparatif a en-tete colle et defilement au clavier.
 *
 * @example
 * <ComparisonTable
 *   caption="Ce que chaque offre comprend"
 *   columns={[{ name: 'Depart' }, { name: 'Studio', featured: true }, { name: 'Agence' }]}
 *   rows={[
 *     { label: 'Projets', values: ['1', '10', 'Illimite'] },
 *     { label: 'Registre prive', values: [false, false, true] },
 *   ]}
 * />
 */
export function ComparisonTable({
  columns,
  rows,
  caption,
  maxHeight = 480,
  yesLabel = 'Compris',
  noLabel = 'Non compris',
  ...rest
}: ComparisonTableProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.1 })
  const titre = `${useId().replace(/[^a-zA-Z0-9]/g, '')}-titre`

  ensureComparisonRules()

  /** Fond d'une cellule, teinte si sa colonne est mise en avant. */
  const fond = (index: number): string =>
    columns[index]?.featured === true
      ? 'color-mix(in oklab, var(--o-palette-brand-500) 8%, var(--o-theme-surface))'
      : 'var(--o-theme-surface)'

  let groupeCourant: string | undefined

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-4' },
    rest,
  )

  return (
    <section {...rest} ref={ref} className={className} style={style as CSSProperties}>
      {/*
        Une seule phrase nomme les deux objets : la zone qu'on peut faire
        defiler et le tableau qu'elle contient. Une `caption` cachee en plus
        ferait entendre le meme texte deux fois de suite.
      */}
      <p
        id={titre}
        className="o-text-sm o-font-medium"
        style={{ color: 'var(--o-theme-fg)' }}
      >
        {caption}
      </p>

      {/*
        La zone recoit le focus : sans cela, les colonnes de droite sont hors
        d'atteinte pour qui navigue au clavier.
      */}
      <div
        data-o-cmp-zone=""
        role="region"
        aria-labelledby={titre}
        tabIndex={0}
        style={{ '--o-cmp-hauteur': `${String(maxHeight)}px` } as CSSProperties}
      >
        <table
          data-o-cmp=""
          aria-labelledby={titre}
          data-o-cmp-cache={reduced ? undefined : ''}
          data-o-cmp-vu={vu && !reduced ? '' : undefined}
        >
          <thead>
            <tr>
              <th
                scope="col"
                data-o-cmp-critere=""
                style={{ color: 'var(--o-theme-muted)' }}
              >
                Critere
              </th>
              {columns.map((colonne, index) => (
                <th
                  key={colonne.name}
                  scope="col"
                  style={{ backgroundColor: fond(index), color: 'var(--o-theme-fg)' }}
                >
                  {colonne.name}
                  {colonne.note !== undefined && (
                    <span
                      className="o-block o-text-xs o-font-normal"
                      style={{ color: 'var(--o-theme-muted)' }}
                    >
                      {colonne.note}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((ligne, rang) => {
              const ouvreGroupe =
                ligne.group !== undefined && ligne.group !== groupeCourant
              if (ligne.group !== undefined) groupeCourant = ligne.group

              return (
                <Fragment key={ligne.label}>
                  {ouvreGroupe && (
                    <tr
                      style={
                        { '--o-cmp-delai': `${String(rang * 40)}ms` } as CSSProperties
                      }
                    >
                      <th
                        scope="colgroup"
                        colSpan={columns.length + 1}
                        data-o-cmp-groupe=""
                        style={{ color: 'var(--o-theme-muted)' }}
                      >
                        {ligne.group}
                      </th>
                    </tr>
                  )}
                  <tr
                    style={{ '--o-cmp-delai': `${String(rang * 40)}ms` } as CSSProperties}
                  >
                    <th
                      scope="row"
                      data-o-cmp-critere=""
                      style={{ color: 'var(--o-theme-fg)' }}
                    >
                      {ligne.label}
                    </th>
                    {columns.map((colonne, index) => (
                      <td
                        key={colonne.name}
                        style={{
                          backgroundColor: fond(index),
                          color: 'var(--o-theme-fg)',
                        }}
                      >
                        <Valeur
                          valeur={ligne.values[index] ?? false}
                          oui={yesLabel}
                          non={noLabel}
                        />
                      </td>
                    ))}
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
