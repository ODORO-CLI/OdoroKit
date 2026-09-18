/**
 * L affichage d un projet livre, en pleine page.
 *
 * ## Pourquoi un cadre, et non un composant
 *
 * Une vitrine est un module de ce bac a sable : elle se charge, elle se rend
 * dans l arbre de la documentation, elle en partage la feuille et le theme. Un
 * projet livre n est pas cela. C est une application entiere, batie a part,
 * avec sa propre remise a zero, ses propres jetons, sa propre police de page.
 * L importer ici melerait deux feuilles qui ne se connaissent pas, et la
 * premiere a charger deciderait de ce que la seconde perd.
 *
 * Il vit donc dans un cadre, servi depuis `/projets/<nom>/`, ou il est chez lui
 * — et c est exactement ce que voit quelqu un qui le clone.
 *
 * ## Trois vues
 *
 * Les memes qu une vitrine : apercu, code, integrer. Le code d un projet livre
 * se regarde ici, arborescence comprise — cinq cents fichiers dans une colonne,
 * c est justement ce qu on vient voir. Le depot reste dans le bandeau pour qui
 * veut l historique.
 *
 * Il n a pas de palette. Une vitrine lit ses couleurs dans
 * `--o-vitrine-*` et se reteinte ; un projet a la sienne, ecrite dans ses
 * jetons, et la reteinter serait le defigurer.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { Github } from '@odoro-cli/icons/brands'
import { ArrowLeft, Download, ExternalLink } from '@odoro-cli/icons/outline'
import { Link, useParams, useSearchParams } from '@odoro-cli/libs/router'
import { useState, type ReactElement } from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { PanneauCodeProjet } from '../components/VitrineExport.jsx'
import { HEADER_OFFSET } from '../components/Shell.jsx'
import { DEPOT, EXPORTS_PROJETS } from '../exports.generated.js'
import { TEMPLATES as PROJETS, type TemplateEntry } from '../templates.generated.js'

/** Les trois vues d un projet. */
const VUES = [
  { cle: '', etiquette: 'Aperçu' },
  { cle: 'code', etiquette: 'Code' },
  { cle: 'integrer', etiquette: 'Intégrer' },
] as const

type Vue = (typeof VUES)[number]['cle']

/** Un poids en octets, tel qu on l annonce. */
function poids(octets: number): string {
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} ko`
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
}

/** L adresse du projet, servi chez lui. */
function adresseDuProjet(nom: string): string {
  const origine = typeof window === 'undefined' ? '' : window.location.origin
  return `${origine}/projets/${nom}/`
}

/** L interrupteur des vues. */
function ChoixVue({
  vue,
  onChange,
}: {
  readonly vue: Vue
  readonly onChange: (vue: Vue) => void
}): ReactElement {
  return (
    <div
      role="group"
      aria-label="Ce qu’on regarde du projet"
      className="o-inline-flex o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-0.5"
    >
      {VUES.map((option) => {
        const actif = option.cle === vue
        return (
          <button
            key={option.cle}
            type="button"
            aria-pressed={actif}
            onClick={() => {
              onChange(option.cle)
            }}
            className={[
              'o-rounded-md o-px-2.5 o-py-1 o-text-sm o-cursor-pointer o-transition-colors',
              actif
                ? 'o-bg-zinc-900 dark:o-bg-zinc-100 o-text-white dark:o-text-zinc-900'
                : 'o-text-zinc-600 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-100',
            ].join(' ')}
          >
            {option.etiquette}
          </button>
        )
      })}
    </div>
  )
}

/** Le bandeau, pose sous la barre de la documentation. */
function Bandeau({
  projet,
  vue,
  onVue,
}: {
  readonly projet: TemplateEntry
  readonly vue: Vue
  readonly onVue: (vue: Vue) => void
}): ReactElement {
  const mesures = EXPORTS_PROJETS[projet.name]

  return (
    <div
      data-o-bandeau=""
      style={{ top: HEADER_OFFSET }}
      className="o-sticky o-z-40 o-flex o-flex-wrap o-items-center o-gap-x-3 o-gap-y-2 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-px-4 o-py-2 o-text-sm md:o-px-6"
    >
      <Link
        to="/templates"
        className="o-inline-flex o-items-center o-gap-1.5 o-font-medium o-no-underline o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-brand-600 dark:hover:o-text-brand-400 o-transition-colors"
      >
        <Icon icon={ArrowLeft} size={16} />
        Templates
      </Link>
      <span className="o-text-zinc-300 dark:o-text-zinc-700" aria-hidden="true">
        /
      </span>
      <span className="o-font-semibold o-tracking-tight">{projet.title}</span>
      <span className="max-lg:o-hidden o-text-xs o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400">
        Projet livré
      </span>

      <span className="o-ml-auto o-flex o-items-center o-gap-3">
        <ChoixVue vue={vue} onChange={onVue} />

        {/* Les deux sorties du projet. Elles restent devant les deux vues : ce
            sont elles qu on vient chercher apres avoir regarde. */}
        {mesures !== undefined && (
          <a
            href={`/exports/projets/${projet.name}.zip`}
            download={`${projet.name}.zip`}
            className="max-sm:o-hidden o-inline-flex o-items-center o-gap-1.5 o-rounded-lg o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-2.5 o-py-1.5 o-text-xs o-font-medium o-no-underline o-text-zinc-700 dark:o-text-zinc-200 hover:o-border-zinc-400 dark:hover:o-border-zinc-600 o-transition-colors"
          >
            <Icon icon={Download} size={13} aria-hidden="true" />
            ZIP
            <span className="o-font-mono o-opacity-70">{poids(mesures.zip)}</span>
          </a>
        )}
        <a
          href={`${DEPOT}/tree/main/templates/${projet.name}`}
          target="_blank"
          rel="noreferrer"
          className="max-sm:o-hidden o-inline-flex o-items-center o-gap-1.5 o-rounded-lg o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-2.5 o-py-1.5 o-text-xs o-font-medium o-no-underline o-text-zinc-700 dark:o-text-zinc-200 hover:o-border-zinc-400 dark:hover:o-border-zinc-600 o-transition-colors"
        >
          <Icon icon={Github} size={13} aria-hidden="true" />
          Dépôt
          <Icon icon={ExternalLink} size={11} aria-hidden="true" className="o-opacity-60" />
        </a>
      </span>
    </div>
  )
}

/** Ce qu on colle ailleurs pour montrer ce projet. */
function PanneauIntegration({ projet }: { readonly projet: TemplateEntry }): ReactElement {
  const [hauteur, setHauteur] = useState('100vh')
  const lien = adresseDuProjet(projet.name)

  const attribut = hauteur.endsWith('vh') ? '' : `\n  height="${hauteur}"`
  const style = hauteur.endsWith('vh')
    ? `border:0;display:block;width:100%;height:${hauteur}`
    : 'border:0;display:block;width:100%'

  const balise = `<iframe
  src="${lien}"
  title="${projet.title}"${attribut}
  loading="lazy"
  style="${style}"
></iframe>`

  return (
    <div className="o-mx-auto o-max-w-3xl o-px-6 o-py-10">
      <h2 className="o-m-0 o-text-xl o-font-bold o-tracking-tight">
        Montrer ce projet ailleurs
      </h2>
      <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        Le projet est servi chez lui, a son propre chemin. Ce qui suit l’ouvre dans
        une page a vous — il defile, il joue ses films, il repond au pointeur, comme
        ici.
      </p>

      <div className="o-mt-6 o-flex o-flex-wrap o-items-center o-gap-2">
        <span className="o-text-xs o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400">
          Hauteur
        </span>
        {(['100vh', '80vh', '900', '600'] as const).map((valeur) => (
          <button
            key={valeur}
            type="button"
            aria-pressed={hauteur === valeur}
            onClick={() => {
              setHauteur(valeur)
            }}
            className={[
              'o-rounded-full o-border-w-1 o-px-3 o-py-1 o-text-xs o-cursor-pointer o-transition-colors',
              hauteur === valeur
                ? 'o-border-zinc-900 dark:o-border-zinc-100 o-bg-zinc-900 dark:o-bg-zinc-100 o-text-white dark:o-text-zinc-900'
                : 'o-border-zinc-200 dark:o-border-zinc-800 o-text-zinc-600 dark:o-text-zinc-400',
            ].join(' ')}
          >
            {valeur.endsWith('vh') ? valeur : `${valeur} px`}
          </button>
        ))}
      </div>

      <div className="o-mt-4">
        <CodeBlock lang="html" code={balise} />
      </div>

      <p className="o-mt-6 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        L’adresse seule :{' '}
        <code className="o-font-mono o-text-xs">{lien}</code>
      </p>
    </div>
  )
}

/** La route d un projet livre. */
export function ProjetRoute(): ReactElement {
  const params = useParams()
  const [recherche, setRecherche] = useSearchParams()
  const nom = String(params['name'] ?? '')
  const projet = PROJETS.find((p) => p.name === nom)

  const demandee = recherche.get('vue')
  const vue: Vue = demandee === 'integrer' || demandee === 'code' ? demandee : ''

  if (projet === undefined) {
    return (
      <div className="o-mx-auto o-max-w-2xl o-px-6 o-py-24 o-text-center">
        <h1 className="o-text-2xl o-font-bold o-tracking-tight">Projet introuvable</h1>
        <p className="o-mt-3 o-text-zinc-600 dark:o-text-zinc-400">
          Ce projet n’existe pas — la bibliothèque en compte {PROJETS.length}.
        </p>
        <Link to="/templates" className="lien o-mt-6 o-inline-block">
          Revenir aux templates
        </Link>
      </div>
    )
  }

  return (
    /*
     * Une colonne haute de ce qui reste sous la barre de la documentation : le
     * bandeau prend ce qu il lui faut, le cadre prend le reste. Calculer la
     * hauteur du cadre en retirant celle du bandeau reviendrait a ecrire ce
     * dernier en dur, et il change avec la largeur — a l etroit il passe sur
     * deux lignes.
     */
    <div
      className="o-flex o-flex-col"
      style={{ height: `calc(100dvh - ${HEADER_OFFSET})` }}
    >
      <Bandeau
        projet={projet}
        vue={vue}
        onVue={(suivante) => {
          setRecherche((courant) => {
            if (suivante === '') courant.delete('vue')
            else courant.set('vue', suivante)
            return courant
          })
        }}
      />

      {vue === 'integrer' ? (
        <div className="o-flex-1 o-overflow-auto">
          <PanneauIntegration projet={projet} />
        </div>
      ) : vue === 'code' ? (
        <div className="o-flex-1 o-overflow-auto">
          <PanneauCodeProjet nom={projet.name} titre={projet.title} />
        </div>
      ) : (
        /*
         * `min-height: 0` sur un enfant de colonne souple : sans lui, la
         * hauteur du contenu fait plancher et le cadre deborde au lieu de
         * prendre ce qui reste.
         */
        <iframe
          src={`/projets/${projet.name}/`}
          title={projet.title}
          className="o-block o-w-full o-flex-1 o-border-w-0"
          style={{ minHeight: 0 }}
        />
      )}
    </div>
  )
}
