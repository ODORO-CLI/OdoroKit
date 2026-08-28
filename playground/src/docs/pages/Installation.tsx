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
        <p className="o-text-fg-muted o-max-w-prose">
          Importez ensuite la feuille de style une seule fois, a la racine de
          l'application. Deux paliers sont disponibles — on importe l'un <em>ou</em>{' '}
          l'autre, jamais les deux :
        </p>
        <CodeBlock
          lang="ts"
          code={`// main.tsx
import 'odoro-libs/styles.css'      // structure + couleurs semantiques (recommande)
// ou :
import 'odoro-libs/styles.full.css' // + utilitaires sur les 290 nuances de la palette`}
        />
      </Section>

      <Section
        title="Les modules"
        lead="La librairie est decoupee en quatre points d'entree independants : n'importez que ce que vous utilisez."
      >
        <CodeBlock
          lang="ts"
          code={`import { Button, Dialog, useToast } from 'odoro-libs/ui'       // composants
import { Reveal, useAnimate, motionPresets } from 'odoro-libs/motion' // animations
import { Router, Routes, Route, Link } from 'odoro-libs/router'   // routeur
import { cx, variants, tokens, loadGoogleFonts } from 'odoro-libs/styles' // systeme de style`}
        />
        <div className="o-overflow-x-auto o-rounded-lg o-border-w-1 o-border-border">
          <table className="o-w-full o-text-sm">
            <thead>
              <tr className="o-border-b o-border-border o-bg-bg-subtle o-text-left">
                <th scope="col" className="o-px-4 o-py-2 o-font-medium o-text-fg-muted">
                  Module
                </th>
                <th scope="col" className="o-px-4 o-py-2 o-font-medium o-text-fg-muted">
                  Contenu
                </th>
                <th scope="col" className="o-px-4 o-py-2 o-font-medium o-text-fg-muted">
                  Prerequis
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  'odoro-libs/styles',
                  'cx, variants, tokens, Google Fonts',
                  'feuille styles.css importee',
                ],
                ['odoro-libs/ui', 'composants d’interface', 'styles.css + react'],
                ['odoro-libs/motion', 'presets, Reveal, Stagger, hooks', 'react'],
                ['odoro-libs/router', 'Router, Routes, Link, hooks', 'react'],
              ].map(([name, content, needs]) => (
                <tr key={name} className="o-border-b o-border-border-subtle">
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-primary o-whitespace-nowrap">
                    {name}
                  </td>
                  <td className="o-px-4 o-py-2 o-text-fg-muted">{content}</td>
                  <td className="o-px-4 o-py-2 o-text-fg-muted">{needs}</td>
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
import { Router, Routes, Route } from 'odoro-libs/router'
import { Reveal } from 'odoro-libs/motion'
import { Button, ToastProvider, useToast } from 'odoro-libs/ui'

import 'odoro-libs/styles.css'

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
