/**
 * Writes the artifacts of the style system to disk.
 *
 * The produced files are versioned: the test suite checks that they do match
 * the current tokens, and fails if this script has not been run again after a
 * change.
 *
 * @module
 */

import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  generate,
  renderBase,
  renderClassNamesModule,
  renderCss,
} from '../src/styles/generator.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(HERE, '..', 'src', 'styles', 'generated')

mkdirSync(OUT_DIR, { recursive: true })
// The base, the only shipped artifact: the utilities are produced when each
// application is built, for the sole classes actually used.
writeFileSync(join(OUT_DIR, 'odoro.base.css'), renderBase(), 'utf8')

// The whole stylesheets are still produced: the test suite compares them to
// the current tokens, and that is what catches a forgotten generation.
writeFileSync(join(OUT_DIR, 'odoro.css'), renderCss('core'), 'utf8')
writeFileSync(join(OUT_DIR, 'odoro.full.css'), renderCss('full'), 'utf8')
writeFileSync(join(OUT_DIR, 'classNames.ts'), renderClassNamesModule(), 'utf8')

/** Size of an artifact, in kilobytes, rounded. */
function sizeKb(file: string): string {
  return `${Math.round(statSync(join(OUT_DIR, file)).size / 1024)} Ko`
}

const core = generate('core').classNames
const full = generate('full').classNames

console.log(
  [
    `[build-css] odoro.base.css ${sizeKb('odoro.base.css')} (shipped)`,
    `[build-css] odoro.css      ${core.length} classes, ${sizeKb('odoro.css')}`,
    `[build-css] odoro.full.css ${full.length} classes, ${sizeKb('odoro.full.css')}`,
  ].join('\n'),
)
