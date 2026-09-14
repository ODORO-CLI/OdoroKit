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
        lead="Deux voies : créer un projet complet avec l'engine Odoro, ou ajouter la librairie à un projet React existant."
      />

      <Section
        title="Créer un projet avec l'engine"
        lead="La voie recommandee. create-odoro génère un projet React prêt a l'emploi, sert par l'engine odoro : serveur de développement avec rechargement à chaud, build de production, zéro configuration."
      >
        <CodeBlock
          lang="sh"
          code={`pnpm create odoro mon-app
cd mon-app
pnpm dev       # serveur de developpement
pnpm build     # build de production
pnpm preview   # apercu du build`}
        />
        <p className="o-mt-6 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
          La création demande ce que le projet embarque. Les bibliothèques, le routeur et
          les icônes sont cochés ; le moteur et le registre s'ajoutent à la demande. Tout
          peut être décoché : le projet part alors en React nu, avec du CSS ordinaire et
          sans classes <code className="o-font-mono o-text-xs">o-*</code>.
        </p>
        <CodeBlock
          lang="sh"
          code={`# sans rien demander, en precisant ce qu'on veut
pnpm create odoro mon-app --yes --modules=libs,router,icons

# une base React nue, sans style Odoro
pnpm create odoro mon-app --yes --modules=none`}
        />
        <Callout>
          Le routeur n'est pas un paquet : il vit dans{' '}
          <code className="o-font-mono o-text-sm">@odoro-cli/libs/router</code>. Le cocher
          câble les pages dans l'application générée ; le décocher rend une page unique,
          sans rien désinstaller. Le registre non plus n'est pas un paquet : ses entrées
          sont copiées une à une par{' '}
          <code className="o-font-mono o-text-sm">odoro add</code>.
        </Callout>
        <Callout>
          L'engine <code className="o-font-mono o-text-sm">odoro</code> remplace Vite ou
          webpack : il sert les modules, transforme le TSX et gère le rechargement a
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
        title="Ajouter la librairie à un projet existant"
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
        lead="La librairie est découpée en quatre points d'entrée independants : n'importez que ce que vous utilisez."
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
        title="Premier écran"
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
        title="Thème sombre"
        lead="Le thème suit la préférence système. Pour l'imposer, posez data-thème sur la racine — toutes les couleurs semantiques basculent."
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
