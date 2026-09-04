/**
 * La page d'une entree de registre, fabriquee depuis ses metadonnees.
 *
 * ## Pourquoi une seule page pour trente composants
 *
 * Ecrire une page par entree paraissait plus simple jusqu'a la dixieme. A la
 * trentieme, c'est trente fichiers qui repetent la meme structure, et trente
 * tables de proprietes qui derivent du `meta.json` sans que rien ne le
 * signale — une propriete renommee reste documentee sous son ancien nom, et
 * personne ne s'en apercoit.
 *
 * Le titre, la description, le cout, la commande d'installation, les
 * dependances et la table des proprietes viennent donc **tous** du catalogue.
 * Ce qui ne peut pas en venir — la demonstration vivante — est declare a part,
 * une ligne par composant.
 *
 * ## Les reglages aussi viennent du meta
 *
 * Une propriete numerique qui declare ses bornes devient un curseur ; une
 * propriete a choix devient un rang de boutons. Rien n'est redeclare dans la
 * page, donc rien ne peut y contredire la documentation.
 *
 * @module
 */

import { useMemo, type ReactElement } from 'react'

import { CATALOGUE, type CatalogueEntry } from '../catalogue.generated.js'
import { DEMOS } from '../demos.jsx'
import { ApercuCode } from './ApercuCode.jsx'
import { Atelier, type AtelierControl } from './Atelier.jsx'
import { CodeBlock } from './CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from './DocBlocks.jsx'

/** Retrouve une entree par son identifiant complet. */
export function findEntry(id: string): CatalogueEntry | undefined {
  return CATALOGUE.find((entry) => entry.id === id)
}

/** Fabrique les reglages de l'atelier a partir des proprietes declarees. */
function controlsFrom(entry: CatalogueEntry): readonly AtelierControl[] {
  const controls: AtelierControl[] = []

  for (const prop of entry.props) {
    if (prop.options !== undefined && typeof prop.default === 'string') {
      controls.push({
        kind: 'choice',
        name: prop.name,
        label: prop.name,
        options: prop.options,
        value: prop.default,
      })
      continue
    }

    if (
      typeof prop.default === 'number' &&
      prop.min !== undefined &&
      prop.max !== undefined
    ) {
      controls.push({
        kind: 'range',
        name: prop.name,
        label: prop.name,
        min: prop.min,
        max: prop.max,
        step: prop.step ?? 1,
        value: prop.default,
        ...(prop.unit === undefined ? {} : { unit: ` ${prop.unit}` }),
      })
      continue
    }

    if (typeof prop.default === 'boolean') {
      controls.push({
        kind: 'switch',
        name: prop.name,
        label: prop.name,
        value: prop.default,
      })
    }
  }

  return controls
}

/** Etiquette de cout. */
function Cost({ entry }: { entry: CatalogueEntry }): ReactElement {
  const tone =
    entry.perf.tier === 'heavy'
      ? 'o-bg-red-50 dark:o-bg-red-950 o-text-red-600 dark:o-text-red-400 o-border-red-200 dark:o-border-red-800'
      : entry.perf.tier === 'medium'
        ? 'o-bg-amber-50 dark:o-bg-amber-950 o-text-amber-600 dark:o-text-amber-400 o-border-amber-200 dark:o-border-amber-800'
        : 'o-bg-emerald-50 dark:o-bg-emerald-950 o-text-emerald-600 dark:o-text-emerald-400 o-border-emerald-200 dark:o-border-emerald-800'

  return (
    <span
      className={`o-rounded-full o-border-w-1 o-px-2 o-py-0.5 o-font-mono o-text-xs ${tone}`}
    >
      {entry.perf.tier}
      {entry.perf.backend === false ? '' : ` · ${entry.perf.backend}`}
    </span>
  )
}

/** Page d'une entree. */
export function EntryPage({ id }: { id: string }): ReactElement {
  const entry = findEntry(id)
  const demo = DEMOS[id]
  const controls = useMemo(
    () => (entry === undefined ? [] : controlsFrom(entry)),
    [entry],
  )

  if (entry === undefined) {
    return (
      <Callout tone="warning">
        Aucune entree ne porte l identifiant{' '}
        <code className="o-font-mono o-text-xs">{id}</code>. Le catalogue est produit par{' '}
        <code className="o-font-mono o-text-xs">
          pnpm --filter @odoro-cli/bits registry:build
        </code>
        .
      </Callout>
    )
  }

  return (
    <>
      <PageHeader module={entry.id} title={entry.title} lead={entry.description} />

      <div className="o-mb-8 o-flex o-flex-wrap o-items-center o-gap-3">
        <Cost entry={entry} />
        <code className="o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-3 o-py-1 o-font-mono o-text-sm o-text-brand-600 dark:o-text-brand-400">
          odoro add {entry.name}
        </code>
        {entry.registryDependencies.length === 0 ? null : (
          <span className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
            entraine : {entry.registryDependencies.join(', ')}
          </span>
        )}
      </div>

      {/* La bascule vaut aussi sans demonstration : c'est meme la qu'elle
          sert le plus, puisque le code est alors la seule chose a montrer. */}
      <Section title="Apercu" {...(demo?.lead === undefined ? {} : { lead: demo.lead })}>
        <ApercuCode id={entry.id}>
          {demo === undefined ? (
            <Callout tone="warning">
              Ce composant n a pas encore de demonstration vivante. Sa fiche reste
              exacte : elle vient du registre, et l onglet « Code » montre ce que la
              commande ecrira.
            </Callout>
          ) : (
            <Atelier
              height={demo.height ?? 'o-h-80'}
              demoByDefault={demo.demoByDefault ?? false}
              controls={demo.controls ?? controls}
              {...(demo.deferred === undefined ? {} : { deferred: demo.deferred })}
            >
              {(values, frame) => demo.render(values, frame)}
            </Atelier>
          )}
        </ApercuCode>
      </Section>

      {entry.perf.notes === undefined ? null : <Callout>{entry.perf.notes}</Callout>}

      {entry.props.length === 0 ? null : (
        <Section title="Proprietes">
          <PropsTable
            rows={entry.props.map((prop) => ({
              name: prop.name + (prop.required ? '' : '?'),
              type: prop.type,
              defaultValue:
                prop.default === undefined
                  ? '—'
                  : `${String(prop.default)}${prop.unit ?? ''}`,
              description: prop.description ?? '',
            }))}
          />
        </Section>
      )}

      <Section title="Installer">
        <CodeBlock lang="sh" code={`odoro add ${entry.name}`} />
        {entry.tokens.length === 0 ? null : (
          <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
            Tokens consommes :{' '}
            {entry.tokens.map((token) => (
              <code key={token} className="o-font-mono o-text-sm">
                {token}{' '}
              </code>
            ))}
          </p>
        )}
      </Section>
    </>
  )
}
