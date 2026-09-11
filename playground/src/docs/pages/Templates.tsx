/**
 * Le catalogue des templates de sites.
 *
 * ## Ce que la page lit, et ce qu'elle n'invente pas
 *
 * Tout vient de `templates.generated.ts`, produit par `scripts/build-templates.mjs`
 * a partir des manifestes. La page n'ecrit aucun titre, aucun ordre, aucune
 * pile : une liste tenue a la main ici divergerait des dossiers au premier
 * ajout, et une liste incomplete reste une liste valide — donc rien ne le
 * signalerait.
 *
 * ## L'apercu est une capture, pas une illustration
 *
 * Chaque image est une photographie du template en train de tourner, prise a
 * 1440 par 900 en densite double. Une illustration approchante donnerait une
 * idee fausse de ce qu'on installe, et c'est precisement ce qu'un catalogue
 * existe pour eviter.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { TEMPLATES, type TemplateEntry } from '../templates.generated.js'
import { PageHeader, Section } from '../components/DocBlocks.jsx'

/** Libelle affiche pour chaque nature de template. */
const NATURE: Readonly<Record<TemplateEntry['kind'], string>> = {
  site: 'Site',
  starter: 'Point de depart',
  library: 'Bibliotheque',
}

/**
 * Une fiche de template.
 *
 * L'apercu porte un rapport fixe : sans lui, les cartes d'une grille sautent
 * de hauteur pendant le chargement des images, et la page bouge sous la main.
 */
function TemplateCard({ entry }: { entry: TemplateEntry }): ReactElement {
  return (
    <article className="o-overflow-hidden o-rounded-xl o-border-w-1 o-border-zinc-200 o-bg-white dark:o-border-zinc-800 dark:o-bg-zinc-900">
      {entry.preview === undefined ? null : (
        <img
          src={`/templates/${entry.name}.jpg`}
          alt={`Apercu du template ${entry.title}`}
          width={1440}
          height={900}
          loading="lazy"
          className="o-aspect-video o-w-full o-object-cover o-object-top"
        />
      )}

      <div className="o-flex o-flex-col o-gap-3 o-p-5">
        <div className="o-flex o-items-center o-justify-between o-gap-3">
          <h3 className="o-text-lg o-font-semibold o-text-zinc-900 dark:o-text-zinc-50">
            {entry.title}
          </h3>
          <span className="o-rounded-full o-bg-zinc-100 o-px-2 o-py-0.5 o-text-xs o-text-zinc-600 dark:o-bg-zinc-800 dark:o-text-zinc-300">
            {NATURE[entry.kind]}
          </span>
        </div>

        <p className="o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
          {entry.description}
        </p>

        <ul className="o-flex o-list-none o-flex-wrap o-gap-1.5 o-p-0">
          {entry.stack.map((piece) => (
            <li
              key={piece}
              className="o-rounded-sm o-bg-zinc-100 o-px-2 o-py-0.5 o-font-mono o-text-xs o-text-zinc-600 dark:o-bg-zinc-800 dark:o-text-zinc-300"
            >
              {piece}
            </li>
          ))}
        </ul>

        <dl className="o-m-0 o-flex o-flex-col o-gap-1 o-text-xs o-text-zinc-500">
          {entry.dev === undefined ? null : (
            <div className="o-flex o-gap-2">
              <dt className="o-w-20 o-flex-none">Demarrer</dt>
              <dd className="o-m-0 o-font-mono">
                {entry.install === undefined ? '' : `${entry.install} && `}
                {entry.dev}
              </dd>
            </div>
          )}
          <div className="o-flex o-gap-2">
            <dt className="o-w-20 o-flex-none">Licence</dt>
            {/* Une licence non declaree n'est pas un detail de catalogue : c'est
                ce qui decide si le template peut etre redistribue. Elle est
                donc marquee, et non passee sous silence. */}
            <dd
              className={
                entry.licence === 'non declaree'
                  ? 'o-m-0 o-text-amber-700 dark:o-text-amber-400'
                  : 'o-m-0'
              }
            >
              {entry.licence}
            </dd>
          </div>
          {entry.source === undefined ? null : (
            <div className="o-flex o-gap-2">
              <dt className="o-w-20 o-flex-none">Origine</dt>
              <dd className="o-m-0">{entry.source}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  )
}

/** Le catalogue, groupe par nature et dans l'ordre declare. */
export function Templates(): ReactElement {
  const sites = TEMPLATES.filter((entry) => entry.kind === 'site')
  const autres = TEMPLATES.filter((entry) => entry.kind !== 'site')

  return (
    <article>
      <PageHeader
        title="Templates"
        lead="Des projets complets, prets a ouvrir. Chacun vit dans templates/ a la racine du depot, avec sa propre chaine — ce ne sont pas des projets de l'engine Odoro."
      />

      <Section
        title="Sites"
        lead="Trois pages finies, de la plus habillee a la plus directe. Chaque apercu est une capture du site en train de tourner."
      >
        <div className="o-grid o-gap-6 md:o-grid-cols-2">
          {sites.map((entry) => (
            <TemplateCard key={entry.name} entry={entry} />
          ))}
        </div>
      </Section>

      <Section
        title="Socle et pieces"
        lead="Le point de depart dont les sites derivent, et la bibliotheque de sections autonomes."
      >
        <div className="o-grid o-gap-6 md:o-grid-cols-2">
          {autres.map((entry) => (
            <TemplateCard key={entry.name} entry={entry} />
          ))}
        </div>
      </Section>
    </article>
  )
}
