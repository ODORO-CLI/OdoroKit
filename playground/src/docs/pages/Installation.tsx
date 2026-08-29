/**
 * Guide d'installation.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Guide d'installation et de prise en main. */
export function Installation(): ReactElement {
  return (
    <article>
      <PageHeader
        title="Installation"
        lead="Deux voies : creer un projet complet avec l'engine Odoro, ou ajouter la librairie a un projet React existant."
      />

      <Section
        title="Creer un projet avec l'engine"
        lead="La voie recommandee. create-odoro genere un projet React pret a l'emploi, sert par l'engine odoro : serveur de developpement avec rechargement a chaud, build de production, zero configuration."
      >
        <CodeBlock
          lang="sh"
          code={`pnpm create odoro mon-app
cd mon-app
pnpm dev       # serveur de developpement
pnpm build     # build de production
pnpm preview   # apercu du build`}
        />
        <Callout>
          L'engine <code className="o-font-mono o-text-sm">odoro</code> remplace Vite ou
          webpack : il sert les modules, transforme le TSX et gere le rechargement a
          chaud. Sa configuration vit dans{' '}
          <code className="o-font-mono o-text-sm">odoro.config.ts</code>.
        </Callout>
        <CodeBlock
          lang="ts"
          code={`// odoro.config.ts
import { defineConfig } from 'odoro'

export default defineConfig({
  server: { port: 5190 },
})`}
        />
      </Section>

      <Section
        title="Ajouter la librairie a un projet existant"
        lead="odoro-libs fonctionne dans n'importe quel projet React 18+, quel que soit le bundler."
      >
        <CodeBlock lang="sh" code={`pnpm add odoro-libs`} />
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Importez ensuite la feuille de style une seule fois, a la racine de
          l'application. Deux paliers sont disponibles — on importe l'un <em>ou</em>{' '}
          l'autre, jamais les deux :
        </p>
        <CodeBlock
          lang="ts"
          code={`// main.tsx
import '@odoro-cli/libs/styles.css'      // structure + couleurs semantiques (recommande)
// ou :
import '@odoro-cli/libs/styles.full.css' // + utilitaires sur les 290 nuances de la palette`}
        />
      </Section>

      <Section
        title="Les modules"
        lead="La librairie est decoupee en quatre points d'entree independants : n'importez que ce que vous utilisez."
      >
        <CodeBlock
          lang="ts"
          code={`import { Button, Dialog, useToast } from '@odoro-cli/libs/ui'       // composants
import { Reveal, useAnimate, motionPresets } from '@odoro-cli/libs/motion' // animations
import { Router, Routes, Route, Link } from '@odoro-cli/libs/router'   // routeur
import { cx, variants, tokens, loadGoogleFonts } from '@odoro-cli/libs/styles' // systeme de style`}
        />
        <div className="o-overflow-x-auto o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
          <table className="o-w-full o-text-sm">
            <thead>
              <tr className="o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-text-left">
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Module
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Contenu
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Prerequis
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  '@odoro-cli/libs/styles',
                  'cx, variants, tokens, Google Fonts',
                  'feuille styles.css importee',
                ],
                ['@odoro-cli/libs/ui', 'composants d’interface', 'styles.css + react'],
                ['@odoro-cli/libs/motion', 'presets, Reveal, Stagger, hooks', 'react'],
                ['@odoro-cli/libs/router', 'Router, Routes, Link, hooks', 'react'],
              ].map(([name, content, needs]) => (
                <tr
                  key={name}
                  className="o-border-b o-border-zinc-100 dark:o-border-zinc-900"
                >
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-400 o-whitespace-nowrap">
                    {name}
                  </td>
                  <td className="o-px-4 o-py-2 o-text-zinc-500 dark:o-text-zinc-400">
                    {content}
                  </td>
                  <td className="o-px-4 o-py-2 o-text-zinc-500 dark:o-text-zinc-400">
                    {needs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Premier ecran"
        lead="Un exemple complet : styles, composant, animation et routeur reunis."
      >
        <CodeBlock
          lang="tsx"
          code={`import { createRoot } from 'react-dom/client'
import { Router, Routes, Route } from '@odoro-cli/libs/router'
import { Reveal } from '@odoro-cli/libs/motion'
import { Button, ToastProvider, useToast } from '@odoro-cli/libs/ui'

import '@odoro-cli/libs/styles.css'

function Accueil() {
  const { toast } = useToast()
  return (
    <Reveal preset="fade-up" className="o-flex o-flex-col o-items-center o-gap-4 o-py-24">
      <h1 className="o-text-4xl o-font-bold">Bonjour Odoro</h1>
      <Button onClick={() => toast({ title: 'Bienvenue !', tone: 'success' })}>
        Dire bonjour
      </Button>
    </Reveal>
  )
}

createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
      </Routes>
    </Router>
  </ToastProvider>,
)`}
        />
      </Section>

      <Section
        title="Theme sombre"
        lead="Le theme suit la preference systeme. Pour l'imposer, posez data-theme sur la racine — toutes les couleurs semantiques basculent."
      >
        <CodeBlock
          lang="ts"
          code={`document.documentElement.dataset.theme = 'dark'   // force le sombre
document.documentElement.dataset.theme = 'light'  // force le clair
delete document.documentElement.dataset.theme      // suit le systeme`}
        />
      </Section>
    </article>
  )
}
