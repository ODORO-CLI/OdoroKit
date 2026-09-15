/**
 * The prerendering entry point.
 *
 * ## What it does, and why it exists
 *
 * `odoro build` renders each of the routes below to HTML, at build time, and
 * writes one complete document per route. The site stays a set of static files
 * — nothing runs in production — but a search engine, a link preview or a
 * screen reader find text in the very first response, instead of an empty
 * container.
 *
 * `src/main.tsx` then takes over: seeing a container already filled, it
 * hydrates instead of rebuilding.
 *
 * ## Adding a route
 *
 * A single line in `routes`. The path becomes a directory in `dist/`:
 * `/pricing` gives `dist/pricing/index.html`, which any host serves with no
 * configuration.
 *
 * ## Doing without
 *
 * Remove `prerender` from `odoro.config.ts`. This file can then go: nothing
 * else imports it.
 *
 * @module
 */

import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'

import { App } from '@/App'
import { SessionProvider } from '@/auth'

/** The routes rendered at build time. */
export const routes = ['/', '/about']

/** What a page brings to the head of the document. */
const TITLES: Readonly<Record<string, { title: string; description: string }>> = {
  '/': {
    title: 'Odoro',
    description: 'An Odoro project: in-house engine, generated styles, built-in router.',
  },
  '/about': {
    title: 'About — Odoro',
    description: 'What this project ships, and what each package does in it.',
  },
}

/** Escapes what goes into an HTML attribute. */
function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Renders a route.
 *
 * @param url The requested path.
 * @returns The HTML of the container, and the tags to add to the head.
 */
export function render(url: string): { html: string; head: string } {
  const meta = TITLES[url] ?? TITLES['/']

  const head = [
    `<title>${escape(meta?.title ?? 'Odoro')}</title>`,
    `<meta name="description" content="${escape(meta?.description ?? '')}">`,
    `<meta property="og:title" content="${escape(meta?.title ?? 'Odoro')}">`,
    `<meta property="og:description" content="${escape(meta?.description ?? '')}">`,
  ].join('\n    ')

  return {
    // `StrictMode` is present on both sides: a tree rendered without it here
    // and with it in the browser does not always produce the same markup, and
    // hydration then reports a difference that is not one.
    html: renderToString(
      <StrictMode>
        {/* The same tree as in the browser. The provider asks the server
            nothing here — its request lives in an effect, and effects do not
            run while prerendering — but a page that reads the session must
            find it, or the whole prerender fails on that one page. */}
        <SessionProvider>
          <App url={url} />
        </SessionProvider>
      </StrictMode>,
    ),
    head,
  }
}
