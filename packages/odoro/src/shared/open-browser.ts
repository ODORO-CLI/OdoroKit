/**
 * Opening the browser on the server address.
 *
 * @module
 */

import { spawn } from 'node:child_process'

/**
 * Opens an address in the default browser of the system.
 *
 * ## Why failure is silent
 *
 * The server is running, and its address has just been printed. Whether a
 * browser opens or not changes nothing about what is available: an error trace
 * here would suggest a failed startup, when the only thing missing is a
 * convenience. Environments without a desktop — a container, a remote session —
 * are the normal case, not the exception.
 *
 * @param url Address to open.
 *
 * @example
 * openBrowser('http://localhost:5180/')
 */
export function openBrowser(url: string): void {
  const [command, ...arguments_] =
    process.platform === 'win32'
      ? // `start` is a built-in command: it goes through the interpreter. The
        // empty title that follows is mandatory, otherwise a quoted address
        // would be taken for the window title.
        ['cmd', '/c', 'start', '""', url.replace(/&/g, '^&')]
      : process.platform === 'darwin'
        ? ['open', url]
        : ['xdg-open', url]

  if (command === undefined) return

  try {
    const child = spawn(command, arguments_, { stdio: 'ignore', detached: true })
    child.on('error', () => undefined)
    child.unref()
  } catch {
    // See above: nothing to report.
  }
}
