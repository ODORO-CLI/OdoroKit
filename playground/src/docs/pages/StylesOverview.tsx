/**
 * Vue d'ensemble du systeme de style.
 *
 * @module
 */

import { type ReactElement } from 'react'
import { Link } from '@odoro/libs/router'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, DemoBlock, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Vue d'ensemble du module styles. */
export function StylesOverview(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/styles"
        title="Le systeme de style"
        lead="Une seule source de verite — les design tokens — dont tout derive : variables CSS, utilitaires atomiques et composants. Pas de moteur JIT, pas de scan du code : la feuille est statique, importable telle quelle."
      />

      <Section
        title="Convention"
        lead="Toutes les classes portent le prefixe o- et se lisent comme du Tailwind. Les variants se prefixent par deux-points : etat (hover:, focus:, active:), theme (dark:) et ecran (sm: a 2xl:, max-sm: a max-lg:)."
      >
        <DemoBlock
          code={`<button className="o-inline-flex o-items-center o-gap-2 o-rounded-md o-bg-brand-600 dark:o-bg-brand-400 o-text-white dark:o-text-zinc-950 o-px-4 o-h-10 hover:o-bg-brand-700 dark:hover:o-bg-brand-300 o-transition">
  Enregistrer
</button>`}
        >
          <button
            type="button"
            className="o-inline-flex o-items-center o-gap-2 o-rounded-md o-bg-brand-600 dark:o-bg-brand-400 o-text-white dark:o-text-zinc-950 o-px-4 o-h-10 hover:o-bg-brand-700 dark:hover:o-bg-brand-300 o-transition o-cursor-pointer"
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
          code={`import '@odoro/libs/styles.css'      // ~12 000 classes : structure + semantique
import '@odoro/libs/styles.full.css' // ~17 500 classes : + o-bg-sky-500, o-text-rose-300...`}
        />
        <Callout>
          Les composants d'<code className="o-font-mono o-text-sm">odoro-libs/ui</code>{' '}
          n'emploient que les sept teintes essentielles : ils fonctionnent avec la feuille
          de base seule, et se retheme en surchargeant les variables{' '}
          <code className="o-font-mono o-text-sm">--o-color-*</code>.
        </Callout>
      </Section>

      <Section
        title="cx et variants"
        lead="Deux helpers sans dependance remplacent clsx et cva : composition de classes, et tables de variantes typees."
      >
        <CodeBlock
          lang="tsx"
          code={`import { cx, variants } from '@odoro/libs/styles'

cx('o-flex', condition && 'o-hidden', { 'o-p-4': padded })
// 'o-flex o-p-4'

const card = variants({
  base: 'o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800',
  variants: {
    tone: { neutral: 'o-bg-white dark:o-bg-zinc-900', brand: 'o-bg-brand-50 dark:o-bg-brand-950' },
    padding: { sm: 'o-p-3', md: 'o-p-5' },
  },
  defaults: { tone: 'neutral', padding: 'md' },
})

card({ tone: 'brand' }) // 'o-rounded-lg ... o-bg-brand-50 dark:o-bg-brand-950 o-p-5'`}
        />
      </Section>

      <Section
        title="Tokens en JavaScript"
        lead="Chaque echelle est aussi exportee en tant qu'objet, pour les rares cas ou une valeur doit etre lue dans le code."
      >
        <CodeBlock
          lang="ts"
          code={`import { tokens } from '@odoro/libs/styles'

tokens.color.primary        // 'oklch(52.4% 0.212 275)'
tokens.palette['sky-500']   // 'oklch(68.5% 0.169 237.323)'
tokens.text['2xl']          // '1.5rem'
tokens.duration.base        // '200ms'`}
        />
      </Section>

      <Section title="Aller plus loin">
        <ul className="o-flex o-flex-col o-gap-2 o-text-zinc-500 dark:o-text-zinc-400">
          {[
            ['/docs/styles/couleurs', 'Couleurs — la palette brute, et rien d autre'],
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
                className="o-text-brand-600 dark:o-text-brand-300 hover:o-text-brand-700 dark:hover:o-text-brand-200 o-underline o-underline-offset-2"
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
