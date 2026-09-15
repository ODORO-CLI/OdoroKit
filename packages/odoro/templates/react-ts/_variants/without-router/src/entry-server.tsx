/**
 * The prerendering entry point.
 *
 * Without a router there is only one page: the list of routes comes down to
 * the root. The rest is identical — `odoro build` renders this HTML at build
 * time, and `src/main.tsx` hydrates it on load.
 *
 * To do without: remove `prerender` from `odoro.config.ts`, then this file.
 *
 * @module
 */

import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'

import { App } from '@/App'

/** The routes rendered at build time. */
export const routes = ['/']

/**
 * Renders the page.
 *
 * @returns The HTML of the container, and the tags to add to the head.
 */
export function render(): { html: string; head: string } {
  return {
    // `StrictMode` on both sides: a tree rendered without it here and with it
    // in the browser does not always produce the same markup, and hydration
    // would report a difference that is not one.
    html: renderToString(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
    head:
      '<meta name="description" content="An Odoro project: in-house engine, generated styles.">',
  }
}
