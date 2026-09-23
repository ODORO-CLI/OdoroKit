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

import {
  useEffect,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

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
    <header className="o-mb-4">
      <p className="ods-entete-sous-titre o-mb-1">{moduleName ?? 'Documentation'}</p>
      {/*
        Vingt pixels, demi-gras. Le titre en pesait soixante-quatre en graisse
        legere, puis trente : c etait encore un titre d affiche. Une console
        n affiche pas, elle annonce — et le titre doit tenir sur la meme ligne
        que les boutons qui l accompagnent.
      */}
      <div className="ods-entete">
        <h1 className="ods-entete-titre o-text-balance">{title}</h1>
      </div>
      {lead === undefined ? null : (
        <p
          className="o-m-0 o-max-w-prose o-text-pretty"
          style={{
            fontSize: 'var(--ods-corps)',
            lineHeight: 'var(--ods-corps-h)',
            color: 'var(--ods-encre-douce)',
          }}
        >
          {lead}
        </p>
      )}
    </header>
  )
}

/**
 * Une section de page.
 *
 * Elle etait ouverte par un filet et titree en trente pixels de graisse
 * legere. Sur une console, ce qui se lit est pose sur une carte, et le gris
 * autour n est pas un fond : c est ce qui fait exister la carte. Le titre
 * descend donc a quatorze pixels demi-gras, la mesure d un titre de carte.
 */
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
    <section className="ods-carte o-mb-4 o-flex o-flex-col o-gap-3">
      <h2 className="ods-carte-titre o-text-balance">{title}</h2>
      {lead === undefined ? null : (
        <p
          className="o-m-0 o-max-w-prose o-text-pretty"
          style={{
            fontSize: 'var(--ods-corps)',
            lineHeight: 'var(--ods-corps-h)',
            color: 'var(--ods-encre-douce)',
          }}
        >
          {lead}
        </p>
      )}
      {children}
    </section>
  )
}

/**
 * Un apercu fige, et son extrait.
 *
 * La surface de l apercu est le sous-bloc gris du paragraphe 7 : elle dit
 * « ceci est montre, pas dit » sans avoir besoin d un cadre de plus.
 */
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
    <div
      className="o-flex o-flex-col o-overflow-hidden"
      style={{
        borderRadius: 'var(--ods-r-carte)',
        border: '1px solid var(--ods-bordure)',
      }}
    >
      <div
        className={`o-overflow-x-auto o-p-8 ${
          center ? 'o-flex o-items-center o-justify-center' : ''
        } ${className ?? ''}`}
        style={{ background: 'var(--ods-sous-bloc)' }}
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

  // L en-tete : trente-six pixels, sur le gris des sous-blocs, en douze
  // pixels d encre douce. Le corps : quarante-quatre pixels par ligne, et un
  // separateur d un pixel qui n est pas la bordure de la carte.
  const entete: CSSProperties = {
    height: 'var(--ods-entete-tableau-h)',
    padding: '0 12px',
    textAlign: 'left',
    background: 'var(--ods-sous-bloc)',
    color: 'var(--ods-encre-douce)',
    fontSize: 'var(--ods-petit)',
    fontWeight: 500,
  }
  const cellule: CSSProperties = {
    padding: '12px',
    borderTop: '1px solid var(--ods-separateur)',
    fontSize: 'var(--ods-corps)',
    lineHeight: 'var(--ods-corps-h)',
  }

  return (
    <div
      className="o-overflow-x-auto"
      style={{
        borderRadius: 'var(--ods-r-carte)',
        border: '1px solid var(--ods-bordure)',
      }}
    >
      <table className="o-w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th scope="col" style={entete}>
              Propriété
            </th>
            <th scope="col" style={entete}>
              Type
            </th>
            <th scope="col" style={entete}>
              Défaut
            </th>
            <th scope="col" style={entete}>
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td
                className="o-whitespace-nowrap o-font-mono"
                style={{ ...cellule, color: 'var(--ods-accent-encre)' }}
              >
                {row.name}
              </td>
              <td
                className="o-font-mono"
                style={{ ...cellule, color: 'var(--ods-encre-douce)' }}
              >
                {row.type}
              </td>
              <td
                className="o-whitespace-nowrap o-font-mono"
                style={{ ...cellule, color: 'var(--ods-encre-douce)' }}
              >
                {row.defaultValue ?? '—'}
              </td>
              <td style={{ ...cellule, color: 'var(--ods-encre)' }}>{row.description}</td>
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
    <div className="dc-verre o-relative o-rounded-xl o-border-w-1 o-py-5 o-pl-7 o-pr-6">
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
