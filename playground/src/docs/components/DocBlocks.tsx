/**
 * Petites briques de mise en page des pages de documentation : en-tete de
 * page, section titree, apercu simple avec code, tableau de props.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'

import { CodeBlock } from './CodeBlock.jsx'

/** En-tete d'une page : titre, resume, badge de module. */
export function PageHeader({
  title,
  lead,
  module: moduleName,
}: {
  title: ReactNode
  lead?: ReactNode
  module?: string
}): ReactElement {
  return (
    <header className="o-flex o-flex-col o-gap-3 o-pb-8 o-border-b o-border-border-subtle o-mb-10">
      {moduleName === undefined ? null : (
        <span className="o-self-start o-text-xs o-font-mono o-text-primary o-bg-primary-soft o-border-w-1 o-border-primary-border o-rounded-full o-px-2 o-py-0.5">
          {moduleName}
        </span>
      )}
      <h1 className="o-text-4xl o-font-bold o-tracking-tight o-text-balance">{title}</h1>
      {lead === undefined ? null : (
        <p className="o-text-lg o-text-fg-muted o-max-w-prose o-text-pretty">{lead}</p>
      )}
    </header>
  )
}

/** Section titree d'une page. */
export function Section({
  title,
  lead,
  children,
}: {
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}): ReactElement {
  return (
    <section className="o-flex o-flex-col o-gap-4 o-mb-12">
      <h2 className="o-text-2xl o-font-semibold o-tracking-tight">{title}</h2>
      {lead === undefined ? null : (
        <p className="o-text-fg-muted o-max-w-prose o-text-pretty">{lead}</p>
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
  return (
    <div className="o-flex o-flex-col o-gap-0 o-rounded-lg o-border-w-1 o-border-border o-overflow-hidden">
      <div
        className={`o-p-8 o-bg-bg-subtle o-overflow-x-auto ${
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

/** Tableau des props d'un composant. */
export function PropsTable({ rows }: { rows: readonly PropRow[] }): ReactElement {
  return (
    <div className="o-overflow-x-auto o-rounded-lg o-border-w-1 o-border-border">
      <table className="o-w-full o-text-sm">
        <thead>
          <tr className="o-border-b o-border-border o-bg-bg-subtle o-text-left">
            <th scope="col" className="o-px-4 o-py-2 o-font-medium o-text-fg-muted">
              Prop
            </th>
            <th scope="col" className="o-px-4 o-py-2 o-font-medium o-text-fg-muted">
              Type
            </th>
            <th scope="col" className="o-px-4 o-py-2 o-font-medium o-text-fg-muted">
              Defaut
            </th>
            <th scope="col" className="o-px-4 o-py-2 o-font-medium o-text-fg-muted">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="o-border-b o-border-border-subtle">
              <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-primary o-whitespace-nowrap">
                {row.name}
              </td>
              <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-fg-muted">
                {row.type}
              </td>
              <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-fg-subtle o-whitespace-nowrap">
                {row.defaultValue ?? '—'}
              </td>
              <td className="o-px-4 o-py-2 o-text-fg-muted">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Note d'accompagnement : astuce ou avertissement. */
export function Callout({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warning'
  children: ReactNode
}): ReactElement {
  return (
    <div
      className={`o-rounded-lg o-border-w-1 o-p-4 o-text-sm o-text-fg ${
        tone === 'info'
          ? 'o-bg-info-soft o-border-info-border'
          : 'o-bg-warning-soft o-border-warning-border'
      }`}
    >
      {children}
    </div>
  )
}
