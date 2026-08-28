/**
 * Ecrit sur disque les artefacts du systeme de style.
 *
 * Les fichiers produits sont versionnes : la suite de tests verifie qu'ils
 * correspondent bien aux tokens courants, et echoue si ce script n'a pas ete
 * relance apres une modification.
 *
 * @module
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generate, renderClassNamesModule, renderCss } from './generate.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(HERE, '..', 'src', 'styles', 'generated')

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'odoro.css'), renderCss(), 'utf8')
writeFileSync(join(OUT_DIR, 'classNames.ts'), renderClassNamesModule(), 'utf8')

const { classNames } = generate()
const base = classNames.filter((name) => !name.includes(':'))

console.log(
  `[build-css] ${base.length} utilitaires de base, ${classNames.length} classes au total (variants compris).`,
)
