/**
 * Ecrit sur disque les artefacts du systeme de style.
 *
 * Les fichiers produits sont versionnes : la suite de tests verifie qu'ils
 * correspondent bien aux tokens courants, et echoue si ce script n'a pas ete
 * relance apres une modification.
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
} from '../src/styles/generateur.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(HERE, '..', 'src', 'styles', 'generated')

mkdirSync(OUT_DIR, { recursive: true })
// Le socle, seul artefact livre : les utilitaires sont produits a la
// construction de chaque application, pour les seules classes employees.
writeFileSync(join(OUT_DIR, 'odoro.base.css'), renderBase(), 'utf8')

// Les feuilles entieres restent produites : la suite d essais les compare aux
// tokens courants, et c est ce qui detecte une generation oubliee.
writeFileSync(join(OUT_DIR, 'odoro.css'), renderCss('core'), 'utf8')
writeFileSync(join(OUT_DIR, 'odoro.full.css'), renderCss('full'), 'utf8')
writeFileSync(join(OUT_DIR, 'classNames.ts'), renderClassNamesModule(), 'utf8')

/** Taille d'un artefact, en kilo-octets, arrondie. */
function sizeKb(file: string): string {
  return `${Math.round(statSync(join(OUT_DIR, file)).size / 1024)} Ko`
}

const core = generate('core').classNames
const full = generate('full').classNames

console.log(
  [
    `[build-css] odoro.base.css ${sizeKb('odoro.base.css')} (livre)`,
    `[build-css] odoro.css      ${core.length} classes, ${sizeKb('odoro.css')}`,
    `[build-css] odoro.full.css ${full.length} classes, ${sizeKb('odoro.full.css')}`,
  ].join('\n'),
)
