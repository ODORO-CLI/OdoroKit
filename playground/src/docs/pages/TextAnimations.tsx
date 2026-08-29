/**
 * Text Animations : la categorie, avec chaque effet reglable.
 *
 * Les quatre composants sont installes dans ce projet par la CLI. Chacun est
 * pose dans un atelier : fond, couleur de texte, rayon et reglages propres se
 * changent en direct, et le contenu de demonstration se coupe d'un
 * interrupteur.
 *
 * @module
 */

import { useRef, useState, type ReactElement } from 'react'

import { DecodeText } from '@/odoro/text/DecodeText.jsx'
import { ShineText } from '@/odoro/text/ShineText.jsx'
import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'
import { Typewriter } from '@/odoro/text/Typewriter.jsx'
import { Atelier } from '../components/Atelier.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Cadre centre pour un effet de texte, dans l'atelier. */
function Stage({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-8 o-text-center">
      {children}
    </div>
  )
}

/** Revelation par fragments, avec bouton de relecture. */
function SplitDemo(): ReactElement {
  const [key, setKey] = useState(0)

  return (
    <>
      <Atelier
        demoByDefault={false}
        height="o-h-56"
        controls={[
          {
            kind: 'choice',
            name: 'by',
            label: 'Decoupage',
            options: ['chars', 'words', 'lines'],
            value: 'chars',
          },
          {
            kind: 'range',
            name: 'stagger',
            label: 'Decalage',
            min: 0,
            max: 120,
            step: 2,
            value: 24,
            unit: ' ms',
          },
          {
            kind: 'range',
            name: 'distance',
            label: 'Montee',
            min: 0,
            max: 80,
            step: 2,
            value: 24,
            unit: ' px',
          },
        ]}
      >
        {(values) => (
          <Stage>
            <SplitReveal
              key={`${String(key)}-${String(values['by'])}-${String(values['stagger'])}-${String(values['distance'])}`}
              as="p"
              by={values['by'] as 'chars' | 'words' | 'lines'}
              stagger={values['stagger'] as number}
              distance={values['distance'] as number}
              className="o-text-3xl o-font-bold o-tracking-tight o-text-balance"
            >
              Construisez des interfaces vivantes
            </SplitReveal>
          </Stage>
        )}
      </Atelier>
      <button
        type="button"
        onClick={() => setKey((n) => n + 1)}
        className="o-self-start o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-white dark:o-bg-zinc-900 hover:o-border-zinc-400 dark:hover:o-border-zinc-600 o-transition-colors o-cursor-pointer"
      >
        Rejouer
      </button>
    </>
  )
}

/** Decodage, avec relecture par l'echappatoire. */
function DecodeDemo(): ReactElement {
  const replay = useRef<(() => void) | null>(null)

  return (
    <>
      <Atelier
        demoByDefault={false}
        height="o-h-56"
        controls={[
          {
            kind: 'range',
            name: 'duration',
            label: 'Duree',
            min: 300,
            max: 4000,
            step: 100,
            value: 1200,
            unit: ' ms',
          },
          {
            kind: 'choice',
            name: 'trigger',
            label: 'Declencheur',
            options: ['view', 'mount', 'hover'],
            value: 'view',
          },
        ]}
      >
        {(values) => (
          <Stage>
            <DecodeText
              key={`${String(values['duration'])}-${String(values['trigger'])}`}
              as="p"
              duration={values['duration'] as number}
              trigger={values['trigger'] as 'view' | 'mount' | 'hover'}
              onReady={({ handle }) => {
                replay.current = handle.replay
              }}
              className="o-font-mono o-text-3xl o-font-bold o-tracking-tight"
            >
              ODORO ENGINE
            </DecodeText>
          </Stage>
        )}
      </Atelier>
      <button
        type="button"
        onClick={() => replay.current?.()}
        className="o-self-start o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-white dark:o-bg-zinc-900 hover:o-border-zinc-400 dark:hover:o-border-zinc-600 o-transition-colors o-cursor-pointer"
      >
        Rejouer par l echappatoire
      </button>
    </>
  )
}

/** Page de la categorie Text Animations. */
export function TextAnimations(): ReactElement {
  return (
    <>
      <PageHeader
        module="@odoro-cli/bits"
        title="Text Animations"
        lead="Des effets de texte installes dans ce projet par la CLI. Chacun est reglable ici meme : fond, couleur, et ses propres parametres."
      />

      <Callout>
        Tous respectent la meme regle : sous mouvement reduit, l animation est neutralisee
        et le texte reste <strong>lisible</strong>. Un titre invisible n est pas un
        respect de la preference, c est un defaut d accessibilite.
      </Callout>

      <Section
        title="Revelation par fragments"
        lead="Le titre se compose caractere par caractere, mot par mot ou ligne par ligne. Le decoupage est defait au demontage : un texte laisse decoupe casserait le copier-coller."
      >
        <SplitDemo />
        <CodeBlock
          code={`<SplitReveal as="h1" by="words" stagger={40}>
  Construisez des interfaces vivantes
</SplitReveal>`}
        />
      </Section>

      <Section
        title="Decodage"
        lead="Le texte se stabilise depuis un brouillage, lettre par lettre. Le brouillage n'existe que pour l'oeil : le texte veritable reste annonce, cherchable et copiable."
      >
        <DecodeDemo />
        <CodeBlock
          code={`<DecodeText trigger="hover" duration={900}>
  ODORO ENGINE
</DecodeText>`}
        />
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Celui-ci passe par la boucle du moteur : le brouillage doit changer a la cadence
          de l ecran, faute de quoi un minuteur a intervalle fixe produirait un battement
          visible contre le rafraichissement.
        </p>
      </Section>

      <Section
        title="Machine a ecrire"
        lead="Une suite de phrases frappees puis effacees. La phrase la plus longue est rendue en reserve, invisible : sans elle, toute la ligne se decalerait a chaque caractere."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-56"
          controls={[
            {
              kind: 'range',
              name: 'typeSpeed',
              label: 'Frappe',
              min: 10,
              max: 200,
              step: 5,
              value: 55,
              unit: ' ms',
            },
            {
              kind: 'range',
              name: 'hold',
              label: 'Pause',
              min: 200,
              max: 4000,
              step: 100,
              value: 1400,
              unit: ' ms',
            },
          ]}
        >
          {(values) => (
            <Stage>
              <p className="o-text-2xl o-font-semibold o-tracking-tight">
                Odoro, c est{' '}
                <Typewriter
                  typeSpeed={values['typeSpeed'] as number}
                  hold={values['hold'] as number}
                  phrases={[
                    'un systeme de style',
                    'un moteur d animation',
                    'un routeur',
                    'un registre de composants',
                  ]}
                />
              </p>
            </Stage>
          )}
        </Atelier>

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Celui-ci n emploie <strong>pas</strong> la boucle, et c est deliberé : la frappe
          avance toutes les cinquante millisecondes, soit une image sur trois. S abonner a
          la boucle reviendrait a la reveiller cinquante-neuf fois sur soixante pour ne
          rien faire. C est la contre-epreuve du critere du moteur.
        </p>
      </Section>

      <Section
        title="Reflet"
        lead="Un reflet traverse le texte en boucle. Aucun JavaScript ne s'execute apres le premier rendu : le compositeur du navigateur s'en charge seul."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-56"
          controls={[
            {
              kind: 'range',
              name: 'duration',
              label: 'Duree',
              min: 800,
              max: 8000,
              step: 100,
              value: 3000,
              unit: ' ms',
            },
          ]}
        >
          {(values, frame) => (
            <Stage>
              <ShineText
                as="p"
                from={frame.color}
                duration={values['duration'] as number}
                className="o-text-5xl o-font-extrabold o-tracking-tight"
              >
                Odoro
              </ShineText>
            </Stage>
          )}
        </Atelier>

        <Callout tone="warning">
          Le decoupage du degrade sur la forme des lettres suppose de rendre la couleur du
          texte transparente. La ou il n est pas compris, un texte transparent serait{' '}
          <strong>invisible</strong> — la regle est donc enfermee dans une requete de
          support, et le texte y garde sa couleur en perdant seulement son reflet.
        </Callout>
      </Section>
    </>
  )
}
