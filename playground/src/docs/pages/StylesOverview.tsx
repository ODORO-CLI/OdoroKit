/**
 * Vue d'ensemble du systeme de style.
 *
 * @module
 */

import { type ReactElement } from 'react'
import { Link } from 'odoro-libs/router'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, DemoBlock, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Vue d'ensemble du module styles. */
export function StylesOverview(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/styles"
        title="Le systeme de style"
        lead="Une seule source de verite — les design tokens — dont tout derive : variables CSS, utilitaires atomiques et composants. Pas de moteur JIT, pas de scan du code : la feuille est statique, importable telle quelle."
      />

      <Section
        title="Convention"
        lead="Toutes les classes portent le prefixe o- et se lisent comme du Tailwind. Les variants se prefixent par deux-points : etat (hover:, focus:, active:), theme (dark:) et ecran (sm: a 2xl:, max-sm: a max-lg:)."
      >
        <DemoBlock
          code={`<button className="o-inline-flex o-items-center o-gap-2 o-rounded-md o-bg-primary o-text-on-primary o-px-4 o-h-10 hover:o-bg-primary-hover o-transition">
  Enregistrer
</button>`}
        >
          <button
            type="button"
            className="o-inline-flex o-items-center o-gap-2 o-rounded-md o-bg-primary o-text-on-primary o-px-4 o-h-10 hover:o-bg-primary-hover o-transition o-cursor-pointer"
          >
            Enregistrer
          </button>
        </DemoBlock>
      </Section>

      <Section
        title="Deux paliers de feuille"
        lead="La feuille de base couvre la structure et les couleurs semantiques. La feuille complete y ajoute les utilitaires de couleur sur les 290 nuances de la palette brute."
      >
        <CodeBlock
          lang="ts"
          code={`import 'odoro-libs/styles.css'      // ~12 000 classes : structure + semantique
import 'odoro-libs/styles.full.css' // ~17 500 classes : + o-bg-sky-500, o-text-rose-300...`}
        />
        <Callout>
          Les composants d'<code className="o-font-mono o-text-sm">odoro-libs/ui</code>{' '}
          n'utilisent que la couche semantique : ils fonctionnent avec la feuille de base
          seule, et se retheme en surchargeant les variables{' '}
          <code className="o-font-mono o-text-sm">--o-color-*</code>.
        </Callout>
      </Section>

      <Section
        title="cx et variants"
        lead="Deux helpers sans dependance remplacent clsx et cva : composition de classes, et tables de variantes typees."
      >
        <CodeBlock
          lang="tsx"
          code={`import { cx, variants } from 'odoro-libs/styles'

cx('o-flex', condition && 'o-hidden', { 'o-p-4': padded })
// 'o-flex o-p-4'

const card = variants({
  base: 'o-rounded-lg o-border-w-1 o-border-border',
  variants: {
    tone: { neutral: 'o-bg-surface', brand: 'o-bg-primary-soft' },
    padding: { sm: 'o-p-3', md: 'o-p-5' },
  },
  defaults: { tone: 'neutral', padding: 'md' },
})

card({ tone: 'brand' }) // 'o-rounded-lg ... o-bg-primary-soft o-p-5'`}
        />
      </Section>

      <Section
        title="Tokens en JavaScript"
        lead="Chaque echelle est aussi exportee en tant qu'objet, pour les rares cas ou une valeur doit etre lue dans le code."
      >
        <CodeBlock
          lang="ts"
          code={`import { tokens } from 'odoro-libs/styles'

tokens.color.primary        // 'oklch(52.4% 0.212 275)'
tokens.palette['sky-500']   // 'oklch(68.5% 0.169 237.323)'
tokens.text['2xl']          // '1.5rem'
tokens.duration.base        // '200ms'`}
        />
      </Section>

      <Section title="Aller plus loin">
        <ul className="o-flex o-flex-col o-gap-2 o-text-fg-muted">
          {[
            ['/docs/styles/couleurs', 'Couleurs — palette et couche semantique'],
            [
              '/docs/styles/typographie',
              'Typographie — echelles, decorations, surlignage',
            ],
            ['/docs/styles/responsive', 'Responsive — variants d’ecran'],
            ['/docs/styles/fonts', 'Google Fonts — polices par CDN'],
            [
              '/docs/styles/utilitaires',
              'Utilitaires — degrades, transforms, filtres, animations',
            ],
          ].map(([to = '', label]) => (
            <li key={to}>
              <Link
                to={to}
                className="o-text-link hover:o-text-link-hover o-underline o-underline-offset-2"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </article>
  )
}
