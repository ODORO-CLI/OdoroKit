/**
 * La tranche verticale : un composant par categorie, tous installes par la CLI.
 *
 * Rien n'est importe du registre. Les quatre composants ont ete copies dans
 * `src/odoro/` par `odoro add`, et sont importes par l'alias du projet — comme
 * ils le seraient dans n'importe quel projet.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'

import { Aurora } from '@/odoro/background/Aurora.jsx'
import { Molten } from '@/odoro/hero/Molten.jsx'
import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../components/DocBlocks.jsx'

/** Cadre d'un apercu, avec sa fiche de cout. */
function Piece({
  titre,
  categorie,
  cout,
  backend,
  children,
}: {
  titre: string
  categorie: string
  cout: string
  backend: string
  children: ReactElement
}): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-0 o-rounded-lg o-border-w-1 o-border-border o-overflow-hidden">
      {children}
      <div className="o-flex o-flex-wrap o-items-center o-gap-3 o-border-t o-border-border o-bg-bg-subtle o-px-4 o-py-3">
        <span className="o-font-mono o-text-sm o-text-primary">
          {categorie}/{titre}
        </span>
        <span className="o-text-xs o-font-mono o-text-fg-subtle">{cout}</span>
        <span className="o-text-xs o-font-mono o-text-fg-subtle">{backend}</span>
      </div>
    </div>
  )
}

/** Le heros, remonte a la demande : il coute cher, on ne l'impose pas. */
function MoltenDemo(): ReactElement {
  const [monte, setMonte] = useState(false)
  const [glow, setGlow] = useState(0.8)

  if (!monte) {
    return (
      <div className="o-flex o-h-72 o-flex-col o-items-center o-justify-center o-gap-3 o-bg-bg-subtle">
        <p className="o-text-sm o-text-fg-muted o-text-center o-max-w-sm">
          Cette scene telecharge environ 130 Ko compresses. Elle n est pas montee tant que
          vous ne le demandez pas — c est exactement ce que la CLI vous fait decider avant
          d installer.
        </p>
        <button
          type="button"
          onClick={() => setMonte(true)}
          className="o-h-9 o-px-4 o-text-sm o-rounded-md o-border-w-1 o-border-primary-border o-bg-primary-soft o-text-primary hover:o-border-border-strong o-transition-colors o-cursor-pointer"
        >
          Monter la scene
        </button>
      </div>
    )
  }

  return (
    <div className="o-flex o-flex-col">
      <Molten
        className="o-h-72"
        glow={glow}
        onReady={({ handle }) => {
          // Niveau 5 : les uniformes vivants, modifiables en place. Aucune
          // propriete n'a eu besoin d'exister pour cela.
          handle.scene.camera.position.z = 2.8
        }}
      />
      <div className="o-flex o-items-center o-gap-3 o-bg-bg-subtle o-px-4 o-py-3">
        <label htmlFor="molten-glow" className="o-text-xs o-text-fg-muted">
          halo
        </label>
        <input
          id="molten-glow"
          type="range"
          min={0}
          max={3}
          step={0.1}
          value={glow}
          onChange={(event) => setGlow(Number(event.target.value))}
          className="o-flex-1"
        />
        <span className="o-font-mono o-text-xs o-tabular-nums o-text-fg">
          {glow.toFixed(1)}
        </span>
      </div>
    </div>
  )
}

/** Page de la tranche verticale. */
export function RegistreGalerie(): ReactElement {
  const [cle, setCle] = useState(0)

  return (
    <>
      <PageHeader
        module="odoro-bits"
        title="La tranche verticale"
        lead="Un composant par categorie, du plus leger au plus cher. Tous installes par la CLI dans ce projet, aucun importe du registre."
      />

      <Callout>
        Ces composants vivent dans{' '}
        <code className="o-font-mono o-text-xs">playground/src/odoro/</code>. Ils y ont
        ete ecrits par{' '}
        <code className="o-font-mono o-text-xs">
          odoro add molten split-reveal aurora
        </code>
        , qui a resolu le graphe et ajoute les deux hooks dont Molten depend.
      </Callout>

      <Section
        title="text — Revelation par fragments"
        lead="Le titre se compose caractere par caractere. Le decoupage est defait au demontage : un texte laisse decoupe casserait le copier-coller bien apres la disparition de l'animation."
      >
        <Piece titre="split-reveal" categorie="text" cout="leger" backend="sans backend">
          <div className="o-flex o-min-h-40 o-items-center o-justify-center o-bg-bg-subtle o-p-8">
            <SplitReveal
              key={cle}
              as="p"
              by="chars"
              className="o-text-3xl o-font-bold o-tracking-tight o-text-balance o-text-center"
            >
              Construisez des interfaces vivantes
            </SplitReveal>
          </div>
        </Piece>

        <button
          type="button"
          onClick={() => setCle((n) => n + 1)}
          className="o-self-start o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-border o-bg-surface o-text-fg hover:o-border-border-strong o-transition-colors o-cursor-pointer"
        >
          Rejouer
        </button>

        <Callout tone="warning">
          Le decoupage peut ne jamais avoir lieu : le plugin peut ne pas se charger, sur
          un reseau qui coupe ou derriere un bloqueur. L attente est donc levee{' '}
          <strong>quoi qu il arrive</strong> — au decoupage s il vient, sinon au bout d
          une seconde. Le pire cas devient « le titre arrive en retard » au lieu de « le
          titre n arrive jamais ». Ce defaut-la ne se voit pas en developpement, ou tout
          se charge.
        </Callout>
      </Section>

      <Section
        title="background — Aurore"
        lead="Bruit fractal a deplacement de domaine, dans un triangle plein cadre. Les couleurs sont lues dans la palette, pas ecrites dans le shader."
      >
        <Piece
          titre="aurora"
          categorie="background"
          cout="moyen"
          backend="backend leger — 13 Ko"
        >
          <Aurora className="o-h-64" />
        </Piece>

        <CodeBlock
          code={`// Trois tokens, pas trois valeurs. Changer le theme change le fond.
<Aurora colors={['--o-color-primary', '--o-color-accent', '--o-bg']} />`}
        />

        <p className="o-text-fg-muted o-max-w-prose">
          La palette est en OKLCH, un shader veut trois flottants, et aucune API du
          navigateur ne fait le pont : le detour par un canevas donne un resultat qui
          depend de la version du navigateur. La conversion est donc faite dans le moteur,
          ou la mathematique, elle, ne change pas.
        </p>
      </Section>

      <Section
        title="hero — Molten"
        lead="Une masse en fusion, deformee par un bruit tridimensionnel et eclairee par un terme de Fresnel. Aucune texture, aucun fichier : tout est calcule."
      >
        <Piece titre="molten" categorie="hero" cout="eleve" backend="scene 3D — 130 Ko">
          <MoltenDemo />
        </Piece>

        <PropsTable
          rows={[
            {
              name: 'qualite basse',
              type: '24 subdivisions, 2 octaves',
              description: 'La silhouette reste, le detail s efface.',
            },
            {
              name: 'qualite moyenne',
              type: '48 subdivisions, 3 octaves',
              description: 'Palier atteint par degradation, jamais demande.',
            },
            {
              name: 'qualite haute',
              type: '96 subdivisions, 4 octaves',
              description: 'Le defaut sur une machine qui suit.',
            },
          ]}
        />

        <p className="o-text-fg-muted o-max-w-prose">
          Ce sont les deux reglages qui pesent, et les deux qui se degradent le mieux.
          Baisser la definition du rendu a la place aurait donne une image floue, ce qui
          se remarque bien davantage qu un relief un peu moins fin.
        </p>

        <Callout>
          Deplacer les sommets change la forme, mais pas les normales fournies avec la
          geometrie : l eclairage resterait celui d une sphere lisse, ce qui annule
          visuellement toute la deformation. Elles sont donc recalculees par differences
          finies — trois evaluations de bruit de plus par sommet. C est la depense qui
          fait la difference entre une sphere bosselee et une masse qui a du relief.
        </Callout>
      </Section>

      <Section
        title="effect — Progression de lecture"
        lead="Deja a l'oeuvre sur la page du contrat, ou elle sert d'implementation de reference des cinq niveaux."
      >
        <Piece
          titre="scroll-progress"
          categorie="effect"
          cout="leger"
          backend="sans backend"
        >
          <div className="o-flex o-min-h-32 o-items-center o-justify-center o-bg-bg-subtle o-p-8">
            <p className="o-text-sm o-text-fg-muted o-text-center o-max-w-sm">
              Une barre qui suit l avancee dans un article, lue dans la boucle du moteur.
              Aucun rendu React pendant le defilement.
            </p>
          </div>
        </Piece>
      </Section>

      <Section
        title="Ce qui reste a faire"
        lead="Cette tranche est une preuve de bout en bout, pas un catalogue."
      >
        <p className="o-text-fg-muted o-max-w-prose">
          Quatre composants suffisent a montrer que la chaine tient : le format valide, la
          CLI installe, le graphe se resout, le contrat s applique, et le poids est
          annonce avant d etre subi. Produire du volume par-dessus est mecanique — et c
          est precisement pour cela qu il valait mieux verifier la mecanique d abord.
        </p>
      </Section>
    </>
  )
}
