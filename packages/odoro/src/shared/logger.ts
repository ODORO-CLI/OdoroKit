/**
 * Sortie console du moteur.
 *
 * @module
 */

import colors from 'picocolors'

/** Etiquette commune a toutes les lignes. */
const TAG = colors.bold(colors.magenta('odoro'))

/** Horodatage court, pour suivre le rythme des rechargements. */
function stamp(): string {
  return colors.dim(new Date().toLocaleTimeString('fr-FR', { hour12: false }))
}

/** Affiche une information. */
export function info(message: string): void {
  console.log(`${stamp()} ${TAG} ${message}`)
}

/** Affiche un succes. */
export function success(message: string): void {
  console.log(`${stamp()} ${TAG} ${colors.green(message)}`)
}

/** Affiche un avertissement. */
export function warn(message: string): void {
  console.warn(`${stamp()} ${TAG} ${colors.yellow(message)}`)
}

/** Affiche une erreur. */
export function error(message: string, cause?: unknown): void {
  console.error(`${stamp()} ${TAG} ${colors.red(message)}`)
  if (cause instanceof Error && cause.stack !== undefined) {
    console.error(colors.dim(cause.stack))
  } else if (cause !== undefined) {
    console.error(colors.dim(String(cause)))
  }
}

/** Formate une duree en millisecondes de facon lisible. */
export function duration(milliseconds: number): string {
  return milliseconds < 1000
    ? `${Math.round(milliseconds)} ms`
    : `${(milliseconds / 1000).toFixed(2)} s`
}

/** Formate une taille d'octets de facon lisible. */
export function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

export { colors }
