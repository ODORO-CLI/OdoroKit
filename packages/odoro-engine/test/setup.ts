/**
 * Socle de tests du moteur.
 *
 * jsdom n'implemente pas `matchMedia`, alors que tout navigateur le fournit et
 * que la bibliotheque d'animation s'en sert des l'enregistrement de son
 * declencheur de defilement. Sans cette doublure, le plugin echoue a
 * s'enregistrer et l'on croirait a un defaut du moteur.
 *
 * @module
 */

import { beforeEach } from 'vitest'

/** Installe une media query neutre : rien ne correspond. */
export function installMatchMedia(reduced = false): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

installMatchMedia(false)

beforeEach(() => {
  installMatchMedia(false)
})
