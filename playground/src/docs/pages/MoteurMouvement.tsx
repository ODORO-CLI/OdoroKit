/**
 * La politique de mouvement : preference systeme, qualite, degradation.
 *
 * Les valeurs affichees ici sont celles de la politique reelle, sur cette
 * page. Les boutons la reconfigurent pour de bon — c'est le seul moyen
 * honnete de montrer ce qu'elle fait.
 *
 * @module
 */

import { motionPolicy, useMotionState, type QualitySetting } from 'odoro-engine'
import { type ReactElement, useEffect } from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../components/DocBlocks.jsx'

/** Etiquette d'etat, coloree selon ce qu'elle vaut. */
function Chip({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'neutral' | 'good' | 'warn'
}): ReactElement {
  const colours = {
    neutral:
      'o-bg-white dark:o-bg-zinc-900 o-border-zinc-200 dark:o-border-zinc-800 o-text-zinc-900 dark:o-text-zinc-50',
    good: 'o-bg-emerald-50 dark:o-bg-emerald-950 o-border-emerald-200 dark:o-border-emerald-800 o-text-emerald-600 dark:o-text-emerald-400',
    warn: 'o-bg-amber-50 dark:o-bg-amber-950 o-border-amber-200 dark:o-border-amber-800 o-text-amber-600 dark:o-text-amber-400',
  } as const

  return (
    <div className="o-flex o-flex-col o-gap-1">
      <span className="o-text-xs o-uppercase o-tracking-wide o-text-zinc-400 dark:o-text-zinc-500">
        {label}
      </span>
      <span
        className={`o-self-start o-rounded-md o-border-w-1 o-px-2 o-py-1 o-font-mono o-text-sm ${colours[tone]}`}
      >
        {value}
      </span>
    </div>
  )
}

/** Etat courant de la politique, plus les boutons qui la reconfigurent. */
function PolitiqueDemo(): ReactElement {
  const state = useMotionState()

  // La page de documentation ne doit pas laisser la politique dans un etat
  // qu'elle a impose : ce qui est change ici est remis au depart en quittant.
  useEffect(() => {
    return () => motionPolicy.configure({ quality: 'auto', reducedMotion: 'respect' })
  }, [])

  const setQuality = (quality: QualitySetting): void => {
    motionPolicy.configure({ quality })
  }

  return (
    <div className="o-flex o-flex-col o-gap-5 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-6">
      <div className="o-grid o-grid-cols-2 md:o-grid-cols-4 o-gap-4">
        <Chip
          label="mouvement"
          value={state.reduced ? 'reduit' : 'complet'}
          tone={state.reduced ? 'warn' : 'good'}
        />
        <Chip label="qualite" value={state.quality} tone="neutral" />
        <Chip
          label="onglet"
          value={state.visible ? 'visible' : 'masque'}
          tone={state.visible ? 'good' : 'warn'}
        />
        <Chip label="images / s" value={String(state.fps)} tone="neutral" />
      </div>

      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        Motif retenu : <code className="o-font-mono o-text-xs">{state.reason}</code>
      </p>

      <div className="o-flex o-flex-wrap o-gap-2">
        {(['auto', 'high', 'low'] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setQuality(level)}
            className="o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors o-cursor-pointer o-font-mono"
          >
            {level}
          </button>
        ))}
        <button
          type="button"
          onClick={() => motionPolicy.configure({ reducedMotion: 'force' })}
          className="o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-amber-200 dark:o-border-amber-800 o-bg-amber-50 dark:o-bg-amber-950 o-text-amber-600 dark:o-text-amber-400 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors o-cursor-pointer"
        >
          Forcer le mouvement reduit
        </button>
        <button
          type="button"
          onClick={() => motionPolicy.configure({ reducedMotion: 'respect' })}
          className="o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors o-cursor-pointer"
        >
          Respecter le systeme
        </button>
      </div>

      <p className="o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
        Ces reglages sont remis a leur valeur de depart quand vous quittez la page.
      </p>
    </div>
  )
}

/** Page de la politique de mouvement. */
export function MoteurMouvement(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro-engine"
        title="Politique de mouvement"
        lead="Une decision unique, prise a un seul endroit : faut-il animer, et jusqu'ou pousser le rendu."
      />

      <Section
        title="L etat courant"
        lead="Un composant lit cet etat plutot que d'interroger la preference systeme lui-meme. Un seul lecteur de media query pour toute la page, et un seul endroit a corriger le jour ou la regle change."
      >
        <PolitiqueDemo />
        <CodeBlock
          code={`import { useMotionState } from 'odoro-engine'

function Fond(): ReactElement {
  const { reduced, quality } = useMotionState()
  if (reduced) return <FondStatique />

  return <Aurore densite={quality === 'low' ? 1 : 3} />
}`}
        />
      </Section>

      <Section title="La regle qui ne se negocie pas">
        <Callout tone="warning">
          Le mouvement reduit neutralise l <strong>animation</strong>, jamais l{' '}
          <strong>etat final</strong>. Une revelation qui se contenterait de ne pas jouer
          laisserait son texte invisible — ce n est pas un respect de la preference, c est
          un bogue d accessibilite.
        </Callout>
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Un fond anime est le cas particulier : il n a pas d etat final a preserver,
          puisqu il n apporte rien d autre que son mouvement. Il n est donc pas rendu du
          tout, et le composant affiche son repli.
        </p>
      </Section>

      <Section
        title="La degradation automatique"
        lead="En qualite auto, la politique surveille la cadence et change de palier d'elle-meme."
      >
        <PropsTable
          rows={[
            {
              name: 'retrogradation',
              type: 'sous 45 im/s',
              defaultValue: 'apres 1 s',
              description:
                'Assez court pour que l utilisateur ne subisse pas longtemps une page qui rame.',
            },
            {
              name: 'remontee',
              type: 'au-dessus de 55 im/s',
              defaultValue: 'apres 4 s',
              description:
                'Quatre fois plus long : une remontee trop prompte ferait osciller le rendu entre deux paliers, ce qui est plus penible qu un palier bas stable.',
            },
          ]}
        />
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          L asymetrie est deliberee. Descendre vite et remonter lentement produit une page
          qui se stabilise ; l inverse produit une page qui clignote entre deux qualites.
        </p>
        <Callout>
          Un projet demande <code className="o-font-mono o-text-xs">auto</code>,{' '}
          <code className="o-font-mono o-text-xs">high</code> ou{' '}
          <code className="o-font-mono o-text-xs">low</code>. Le palier{' '}
          <code className="o-font-mono o-text-xs">medium</code> n est pas demandable : il
          n existe que comme resultat d une degradation. Le rendre exigible reviendrait a
          laisser un projet se figer sur un palier intermediaire que la mesure aurait
          justement pu quitter.
        </Callout>
      </Section>

      <Section
        title="Les reglages"
        lead="Poses une fois, a la racine. Un composant les lit, il ne les impose pas."
      >
        <CodeBlock
          code={`<OdoroEngine
  quality="auto"          // 'auto' | 'high' | 'low'
  reducedMotion="respect" // 'respect' | 'force' | 'ignore'
  maxSurfaces={2}
>
  <App />
</OdoroEngine>`}
        />
        <Callout tone="warning">
          <code className="o-font-mono o-text-xs">ignore</code> passe outre la preference
          systeme de l utilisateur. Cela n a de place que dans une demonstration — cette
          page, par exemple. Jamais en production.
        </Callout>
      </Section>
    </>
  )
}
