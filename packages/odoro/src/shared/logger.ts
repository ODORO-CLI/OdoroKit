/**
 * Console output of the engine.
 *
 * @module
 */

import colors from 'picocolors'

/** Label common to every line. */
const TAG = colors.bold(colors.magenta('odoro'))

/** Short timestamp, to follow the pace of reloads. */
function stamp(): string {
  return colors.dim(new Date().toLocaleTimeString('en-GB', { hour12: false }))
}

/** Prints an information line. */
export function info(message: string): void {
  console.log(`${stamp()} ${TAG} ${message}`)
}

/** Prints a success line. */
export function success(message: string): void {
  console.log(`${stamp()} ${TAG} ${colors.green(message)}`)
}

/** Prints a warning. */
export function warn(message: string): void {
  console.warn(`${stamp()} ${TAG} ${colors.yellow(message)}`)
}

/** Prints an error. */
export function error(message: string, cause?: unknown): void {
  console.error(`${stamp()} ${TAG} ${colors.red(message)}`)
  if (cause instanceof Error && cause.stack !== undefined) {
    console.error(colors.dim(cause.stack))
  } else if (cause !== undefined) {
    console.error(colors.dim(String(cause)))
  }
}

/** Formats a duration in milliseconds in a readable way. */
export function duration(milliseconds: number): string {
  return milliseconds < 1000
    ? `${Math.round(milliseconds)} ms`
    : `${(milliseconds / 1000).toFixed(2)} s`
}

/** Formats a byte size in a readable way. */
export function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export { colors }
