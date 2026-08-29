/**
 * Google Fonts : chargement de polices par CDN, sans rien embarquer.
 *
 * @module
 */

import { type ReactElement, useEffect, useState } from 'react'
import { GOOGLE_FONTS, fontStack, loadGoogleFonts } from 'odoro-libs/styles'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Familles du registre, triees pour le select. */
const FAMILIES = Object.keys(GOOGLE_FONTS).sort((a, b) => a.localeCompare(b))

/** Google Fonts : principe du CDN, demo interactive et API. */
export function Fonts(): ReactElement {
  const [family, setFamily] = useState('Inter')

  // Chaque changement charge la famille en 400 et 700 ; le retour d'effet
  // retire la feuille injectee quand on passe a la suivante.
  useEffect(() => loadGoogleFonts([{ family, weights: [400, 700] }]), [family])

  return (
    <article>
      <PageHeader
        module="odoro-libs/styles"
        title="Google Fonts"
        lead="Aucun fichier de police dans le bundle : le module construit l'URL css2 officielle et injecte les balises link — preconnexions comprises. Le navigateur telecharge du WOFF2 decoupe par plages Unicode, depuis le cache partage du CDN."
      />

      <Section
        title="Principe"
        lead="Un appel injecte trois balises dans le head : deux preconnexions (fonts.googleapis.com et fonts.gstatic.com), puis la feuille css2. Seules les graisses demandees sont telechargees, et uniquement pour les plages de caracteres reellement affichees."
      >
        <CodeBlock
          lang="ts"
          code={`import { loadGoogleFonts, applyFontFamily } from 'odoro-libs/styles'

// Injecte les balises et retourne une fonction de retrait
const cleanup = loadGoogleFonts([
  { family: 'Inter', weights: [400, 500, 700] },
  { family: 'JetBrains Mono' }, // graisses par defaut : 400 et 700
])

// Pointe --o-font-sans vers Inter : tout o-font-sans bascule
applyFontFamily('sans', 'Inter')`}
        />
      </Section>

      <Section
        title="Essayer une famille"
        lead="Le registre recense environ 90 familles avec leur categorie — sans-serif, serif, monospace, display, manuscrite. Choisissez : la police se charge, l'apercu bascule."
      >
        <div className="o-flex o-flex-col o-gap-0 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-overflow-hidden">
          <div className="o-flex o-items-center o-gap-3 o-p-4 o-bg-white dark:o-bg-zinc-900 o-border-b o-border-zinc-200 dark:o-border-zinc-800">
            <label
              className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400"
              htmlFor="fonts-family"
            >
              Famille
            </label>
            <select
              id="fonts-family"
              value={family}
              onChange={(event) => setFamily(event.target.value)}
              className="o-h-8 o-px-2 o-text-sm o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 o-cursor-pointer"
            >
              {FAMILIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <span className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
              {GOOGLE_FONTS[family as keyof typeof GOOGLE_FONTS]}
            </span>
          </div>
          <div
            className="o-flex o-flex-col o-gap-3 o-p-8 o-bg-zinc-50 dark:o-bg-zinc-900"
            style={{ fontFamily: fontStack(family) }}
          >
            <h3 className="o-text-3xl o-font-bold">Portez ce vieux whisky</h3>
            <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
              Portez ce vieux whisky au juge blond qui fume — le pangramme montre chaque
              lettre de la famille chargee, en graisse normale puis{' '}
              <strong>en gras</strong>. 0123456789.
            </p>
          </div>
        </div>
        <CodeBlock
          lang="tsx"
          code={`loadGoogleFonts([{ family: '${family}', weights: [400, 700] }])

<p style={{ fontFamily: fontStack('${family}') }}>...</p>`}
        />
      </Section>

      <Section
        title="Construire l'URL soi-meme"
        lead="googleFontsUrl retourne l'URL css2 sans rien injecter — utile pour un rendu serveur ou une balise link ecrite a la main."
      >
        <CodeBlock
          lang="ts"
          code={`import { googleFontsUrl } from 'odoro-libs/styles'

googleFontsUrl(['Inter', { family: 'Lora', weights: [400], italics: true }])
// 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lora:ital,wght@0,400;1,400&display=swap'`}
        />
        <Callout>
          Par defaut, l'URL porte{' '}
          <code className="o-font-mono o-text-sm">display=swap</code> : le texte s'affiche
          immediatement dans la police de repli, puis s'echange a l'arrivee du fichier. La
          pile de repli de <code className="o-font-mono o-text-sm">fontStack</code> est
          choisie selon la categorie de la famille pour limiter le saut de mise en page.
        </Callout>
        <Callout tone="warning">
          Les requetes partent vers les serveurs de Google : selon le contexte
          reglementaire et vos exigences de vie privee, preferez parfois
          l'auto-hebergement des fichiers WOFF2 — le reste du systeme de style fonctionne
          a l'identique, il suffit de declarer vos{' '}
          <code className="o-font-mono o-text-sm">@font-face</code> et d'appeler{' '}
          <code className="o-font-mono o-text-sm">applyFontFamily</code>.
        </Callout>
      </Section>
    </article>
  )
}
