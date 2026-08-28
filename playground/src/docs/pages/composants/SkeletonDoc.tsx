/** Documentation du composant Skeleton. @module */

import { type ReactElement, useEffect, useState } from 'react'

import { Button, Card, Skeleton } from 'odoro-libs/ui'

import {
  Callout,
  DemoBlock,
  PageHeader,
  PropsTable,
  Section,
} from '../../components/DocBlocks.jsx'
import { PlaygroundBlock } from '../../components/PlaygroundBlock.jsx'

/** Bascule squelette vers contenu, apres un chargement simule de deux secondes. */
function TransitionChargement(): ReactElement {
  const [etat, setEtat] = useState<'repos' | 'chargement' | 'charge'>('repos')

  useEffect(() => {
    if (etat !== 'chargement') return
    const timer = setTimeout(() => setEtat('charge'), 2000)
    return () => clearTimeout(timer)
  }, [etat])

  return (
    <div className="o-flex o-flex-col o-items-stretch o-gap-4 o-w-72">
      <Button
        size="sm"
        onClick={() => setEtat('chargement')}
        loading={etat === 'chargement'}
      >
        {etat === 'charge' ? 'Recharger' : 'Simuler un chargement'}
      </Button>
      {etat === 'chargement' ? (
        <Card aria-busy="true">
          <div className="o-flex o-items-center o-gap-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="o-flex-1">
              <Skeleton lines={2} />
            </div>
          </div>
        </Card>
      ) : etat === 'charge' ? (
        <Card title="Ana Ruiz" description="Design systeme, composants et tokens." />
      ) : null}
    </div>
  )
}

/** Documentation du composant Skeleton. */
export function SkeletonDoc(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/ui"
        title="Skeleton"
        lead="Silhouette animee affichee pendant un chargement : lignes de texte, cercle ou rectangle."
      />

      <Section title="Apercu">
        <PlaygroundBlock
          controls={[
            {
              name: 'variant',
              type: 'select',
              options: ['text', 'circle', 'rect'],
              defaultValue: 'text',
            },
            {
              name: 'lines',
              type: 'number',
              defaultValue: 3,
              min: 1,
              max: 6,
              step: 1,
            },
          ]}
          render={(v) => {
            if (v.variant === 'circle') {
              return <Skeleton variant="circle" width={48} height={48} />
            }
            if (v.variant === 'rect') {
              return <Skeleton variant="rect" width={240} height={96} />
            }
            return (
              <div className="o-w-64">
                <Skeleton lines={v.lines as number} />
              </div>
            )
          }}
          code={(v) => {
            if (v.variant === 'circle') {
              return `<Skeleton variant="circle" width={48} height={48} />`
            }
            if (v.variant === 'rect') {
              return `<Skeleton variant="rect" width={240} height={96} />`
            }
            return v.lines === 1
              ? `<Skeleton />`
              : `<Skeleton lines={${String(v.lines)}} />`
          }}
        />
        <Callout>
          La silhouette est toujours{' '}
          <code className="o-font-mono o-text-sm">aria-hidden</code> : c'est au conteneur
          d'annoncer le chargement (
          <code className="o-font-mono o-text-sm">aria-busy</code>,{' '}
          <code className="o-font-mono o-text-sm">role="status"</code>...).
        </Callout>
      </Section>

      <Section
        title="Squelette d'une carte"
        lead="Les trois formes se composent pour esquisser la structure du contenu attendu : avatar rond, lignes de texte, media rectangulaire."
      >
        <DemoBlock
          code={`<Card aria-busy="true">
  <div className="o-flex o-items-center o-gap-3">
    <Skeleton variant="circle" width={40} height={40} />
    <div className="o-flex-1">
      <Skeleton lines={2} />
    </div>
  </div>
  <Skeleton variant="rect" width="100%" height={96} />
  <Skeleton lines={3} />
</Card>`}
        >
          <Card aria-busy="true" className="o-w-72">
            <div className="o-flex o-items-center o-gap-3">
              <Skeleton variant="circle" width={40} height={40} />
              <div className="o-flex-1">
                <Skeleton lines={2} />
              </div>
            </div>
            <Skeleton variant="rect" width="100%" height={96} />
            <Skeleton lines={3} />
          </Card>
        </DemoBlock>
      </Section>

      <Section
        title="Transition vers le contenu"
        lead="Le squelette occupe la place du contenu pendant le chargement, puis lui cede exactement la meme structure."
      >
        <DemoBlock
          code={`function TransitionChargement() {
  const [etat, setEtat] = useState('repos')

  useEffect(() => {
    if (etat !== 'chargement') return
    const timer = setTimeout(() => setEtat('charge'), 2000)
    return () => clearTimeout(timer)
  }, [etat])

  return (
    <>
      <Button size="sm" onClick={() => setEtat('chargement')} loading={etat === 'chargement'}>
        {etat === 'charge' ? 'Recharger' : 'Simuler un chargement'}
      </Button>
      {etat === 'chargement' ? (
        <Card aria-busy="true">
          <div className="o-flex o-items-center o-gap-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="o-flex-1"><Skeleton lines={2} /></div>
          </div>
        </Card>
      ) : etat === 'charge' ? (
        <Card title="Ana Ruiz" description="Design systeme, composants et tokens." />
      ) : null}
    </>
  )
}`}
        >
          <TransitionChargement />
        </DemoBlock>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            {
              name: 'variant',
              type: "'text' | 'circle' | 'rect'",
              defaultValue: "'text'",
              description: 'Forme de la silhouette.',
            },
            {
              name: 'width',
              type: 'string | number',
              description: 'Largeur, en toute unite CSS (nombre : pixels).',
            },
            {
              name: 'height',
              type: 'string | number',
              description: 'Hauteur, en toute unite CSS (nombre : pixels).',
            },
            {
              name: 'lines',
              type: 'number',
              defaultValue: '1',
              description:
                'Nombre de lignes pour la variante text ; la derniere est raccourcie a 60 % pour evoquer une fin de paragraphe.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Classes additionnelles.',
            },
          ]}
        />
      </Section>
    </article>
  )
}
