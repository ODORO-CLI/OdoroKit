/**
 * Les conteneurs des pages de documentation.
 *
 * ## Le meme vocabulaire que la page d accueil
 *
 * Filets et tiges plutot qu aplats et cadres pleins. Une rubrique en mono
 * capitales prolongee d un filet, un titre d affichage en graisse legere, et
 * des surfaces de verre qui laissent voir la page plutot que des boites
 * posees dessus. C est ce qui fait qu une page de documentation et la page
 * d accueil se lisent comme un seul site.
 *
 * ## Pourquoi une feuille injectee
 *
 * Le systeme decline ses echelles de noir et de blanc, mais pas leurs
 * variantes sombres. Les surfaces viennent donc des jetons `--o-chrome-*`,
 * poses par `marque.css`, et les conteneurs gardent un seul jeu de classes.
 *
 * @module
 */

import { useEffect, type ReactElement, type ReactNode } from 'react'

import { CodeBlock } from './CodeBlock.jsx'

/** Ce que les utilitaires ne savent pas ecrire. */
const FEUILLE = [
  '.dc-filet{background-color:var(--o-chrome-filet)}',
  '.dc-bord{border-color:var(--o-chrome-filet)}',
  '.dc-verre{background-color:var(--o-chrome-verre);',
  'border-color:var(--o-chrome-filet)}',
  '.dc-surface{background-color:var(--o-chrome-fond)}',
  '.dc-tige{background-image:linear-gradient(180deg,',
  'color-mix(in oklab,var(--o-palette-brand-500) 15%,transparent),',
  'var(--o-palette-brand-500) 48%,',
  'color-mix(in oklab,var(--o-palette-brand-500) 15%,transparent))}',
  '.dc-tige-alerte{background-image:linear-gradient(180deg,',
  'color-mix(in oklab,var(--o-palette-amber-500) 15%,transparent),',
  'var(--o-palette-amber-500) 48%,',
  'color-mix(in oklab,var(--o-palette-amber-500) 15%,transparent))}',
  '.dc-rangs tr:last-child{border-bottom-width:0}',
].join('')

/** Pose la feuille des conteneurs, une fois par document. */
function useFeuille(): void {
  useEffect(() => {
    const id = 'o-vitrine-docblocks'
    if (document.getElementById(id) !== null) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = FEUILLE
    document.head.append(style)
  }, [])
}

/**
 * Une rubrique : le nom en mono capitales, prolonge d un filet.
 *
 * C est l element que la page d accueil emploie pour annoncer chacun de ses
 * ecrans. Il ouvre ici les en-tetes de page et les sections.
 */
export function Rubrique({
  children,
  rang,
}: {
  children: ReactNode
  /** Un indice en accent, comme `03`, quand la page en compte. */
  rang?: string
}): ReactElement {
  useFeuille()
  return (
    <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
      {rang === undefined ? null : (
        <span className="o-text-brand-600 dark:o-text-brand-300">({rang})</span>
      )}
      {children}
      <span aria-hidden="true" className="dc-filet o-h-px o-flex-1" />
    </p>
  )
}

/** En-tete d une page : rubrique, titre d affichage, chapeau. */
export function PageHeader({
  title,
  lead,
  module: moduleName,
}: {
  title: ReactNode
  lead?: ReactNode
  module?: string
}): ReactElement {
  useFeuille()
  return (
    <header className="o-mb-8 o-flex o-flex-col o-gap-3">
      <Rubrique>{moduleName ?? 'Documentation'}</Rubrique>
      {/* Le titre pesait jusqu a soixante-quatre pixels, en graisse legere :
          c etait un titre d affiche, herite de la page d accueil. Une console
          n affiche pas, elle annonce — un titre de page y tient en trente
          pixels et en demi-gras, et les cent pixels de marge qui le suivaient
          sont rendus a la lecture. */}
      <h1 className="o-m-0 o-max-w-3xl o-text-balance o-text-3xl o-font-semibold o-tracking-tight">
        {title}
      </h1>
      {lead === undefined ? null : (
        <p className="o-m-0 o-max-w-prose o-text-pretty o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {lead}
        </p>
      )}
    </header>
  )
}

/** Section titree d une page, ouverte par un filet. */
export function Section({
  title,
  lead,
  children,
}: {
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}): ReactElement {
  useFeuille()
  return (
    <section className="o-mb-20 o-flex o-flex-col o-gap-5">
      <span aria-hidden="true" className="dc-filet o-h-px o-w-full" />
      <h2 className="o-m-0 o-mt-3 o-text-balance o-text-3xl o-font-light o-tracking-tight">
        {title}
      </h2>
      {lead === undefined ? null : (
        <p className="o-m-0 o-max-w-prose o-text-pretty o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
          {lead}
        </p>
      )}
      {children}
    </section>
  )
}

/** Apercu fige accompagne de son extrait. */
export function DemoBlock({
  children,
  code,
  center = true,
  className,
}: {
  children: ReactNode
  code?: string
  center?: boolean
  className?: string
}): ReactElement {
  useFeuille()
  return (
    <div className="dc-bord o-flex o-flex-col o-overflow-hidden o-rounded-2xl o-border-w-1">
      <div
        className={`dc-surface o-overflow-x-auto o-p-10 ${
          center ? 'o-flex o-items-center o-justify-center' : ''
        } ${className ?? ''}`}
      >
        {children}
      </div>
      {code === undefined ? null : (
        <CodeBlock code={code} className="o-rounded-none o-border-none" />
      )}
    </div>
  )
}

/** Ligne du tableau de props. */
export interface PropRow {
  readonly name: string
  readonly type: string
  readonly defaultValue?: string
  readonly description: string
}

/** Tableau des props d un composant : des filets, aucun aplat. */
export function PropsTable({ rows }: { rows: readonly PropRow[] }): ReactElement {
  useFeuille()
  const entete =
    'o-px-4 o-py-3 o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400'

  return (
    <div className="dc-bord o-overflow-x-auto o-rounded-2xl o-border-w-1">
      <table className="o-w-full o-text-sm">
        <thead>
          <tr className="dc-bord o-border-b">
            <th scope="col" className={entete}>
              Propriété
            </th>
            <th scope="col" className={entete}>
              Type
            </th>
            <th scope="col" className={entete}>
              Défaut
            </th>
            <th scope="col" className={entete}>
              Description
            </th>
          </tr>
        </thead>
        {/* Le dernier rang perd son filet : une derniere ligne soulignee juste
            au-dessus de la bordure du cadre fait un trait double. */}
        <tbody className="dc-rangs">
          {rows.map((row) => (
            <tr key={row.name} className="dc-bord o-border-b">
              <td className="o-whitespace-nowrap o-px-4 o-py-3 o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-300">
                {row.name}
              </td>
              <td className="o-px-4 o-py-3 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                {row.type}
              </td>
              <td className="o-whitespace-nowrap o-px-4 o-py-3 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                {row.defaultValue ?? '—'}
              </td>
              <td className="o-px-4 o-py-3 o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Note d accompagnement : astuce ou avertissement.
 *
 * Une tige d accent la tient, comme la page ouverte de la colonne. Le pave
 * bleu plein qu elle etait pesait plus que le paragraphe qu il portait, et
 * coupait la lecture en deux.
 */
export function Callout({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warning'
  children: ReactNode
}): ReactElement {
  useFeuille()
  return (
    <div className="dc-verre o-relative o-rounded-2xl o-border-w-1 o-py-5 o-pl-7 o-pr-6">
      <span
        aria-hidden="true"
        className={`o-absolute o-left-3 o-w-px ${tone === 'info' ? 'dc-tige' : 'dc-tige-alerte'}`}
        style={{ top: '1.25rem', bottom: '1.25rem' }}
      />
      <div className="o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
        {children}
      </div>
    </div>
  )
}
