/**
 * La resolution du fournisseur de feuille.
 *
 * ## Pourquoi ces essais existent
 *
 * Parce que le defaut qu'ils ferment etait **muet**. Le moteur cherchait le
 * generateur avec `createRequire(...).resolve()`, qui applique la resolution
 * CommonJS et exige une condition `require` dans le champ `exports`. Un paquet
 * purement ESM n'en declare pas : l'appel levait, le moteur le lisait comme
 * « aucun generateur installe », et retombait sur l'elagage.
 *
 * Rien n'echouait. La compilation aboutissait, la feuille etait correcte, et le
 * chemin de generation n'etait simplement jamais emprunte. Il a fallu regarder
 * la sortie d'un vrai deploiement pour s'en apercevoir.
 *
 * D'ou la forme de ces essais : ils fabriquent des paquets sur disque et
 * verifient que la resolution aboutit — un fournisseur trouve doit l'etre pour
 * de vrai, et une absence doit rester silencieuse.
 *
 * @module
 */

import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { fournisseurDe } from './fournisseur-css.js'

/** Un projet jetable, avec un paquet installe dans son `node_modules`. */
async function projet(options: {
  readonly exports?: unknown
  readonly corps?: string
}): Promise<string> {
  const racine = await mkdtemp(join(tmpdir(), 'odoro-fournisseur-'))
  await writeFile(join(racine, 'package.json'), JSON.stringify({ name: 'projet' }))

  const paquet = join(racine, 'node_modules', '@odoro-cli', 'libs')
  await mkdir(paquet, { recursive: true })

  await writeFile(
    join(paquet, 'package.json'),
    JSON.stringify({
      name: '@odoro-cli/libs',
      version: '0.0.0',
      type: 'module',
      exports: {
        './package.json': './package.json',
        ...(options.exports === undefined ? {} : { './generateur': options.exports }),
      },
    }),
  )

  if (options.corps !== undefined) {
    await writeFile(join(paquet, 'generateur.js'), options.corps)
  }

  return racine
}

const RENDU = `export function renderUtilitairesPour(classes) {
  return [...classes].map((c) => '.' + c + '{}').join('\\n')
}`

afterEach(() => {
  // Les dossiers temporaires sont laisses au systeme : les effacer ici
  // ralentirait la suite sans rien prouver.
})

describe('la resolution', () => {
  it('trouve un paquet purement ESM', async () => {
    // Le defaut ferme par ce fichier. Un export sans condition `require` est
    // le cas **normal** d'un paquet moderne, et c'etait precisement celui que
    // l'ancienne resolution ne savait pas lire.
    const racine = await projet({
      exports: { types: './generateur.d.ts', import: './generateur.js' },
      corps: RENDU,
    })

    const fournisseur = await fournisseurDe(racine)

    expect(fournisseur).toBeDefined()
    expect(fournisseur?.renderUtilitairesPour(new Set(['o-flex']))).toBe('.o-flex{}')
  })

  it('accepte un export ecrit en chaine', async () => {
    const racine = await projet({ exports: './generateur.js', corps: RENDU })

    expect(await fournisseurDe(racine)).toBeDefined()
  })

  it('accepte la condition `default`', async () => {
    const racine = await projet({
      exports: { default: './generateur.js' },
      corps: RENDU,
    })

    expect(await fournisseurDe(racine)).toBeDefined()
  })
})

describe('l absence reste silencieuse', () => {
  // Le cas « paquet pas installe du tout » n'est pas eprouve ici, et ce n'est
  // pas un oubli : la resolution remonte les dossiers parents, et sous le
  // lanceur d'essais un dossier temporaire vide retrouve quand meme le paquet
  // de l'espace de travail. L'essai passerait ou echouerait selon l'endroit
  // d'ou la suite est lancee — ce qui vaut moins qu'une absence d'essai.
  //
  // Les cas ci-dessous restent valides : un `node_modules` local masque celui
  // de l'espace de travail, et c'est bien la version locale qui est lue.

  it('rend undefined quand le paquet n expose pas le generateur', async () => {
    const racine = await projet({})

    expect(await fournisseurDe(racine)).toBeUndefined()
  })

  it('rend undefined quand la fonction attendue manque', async () => {
    // Une version trop ancienne. Lever ici casserait une compilation qui
    // marchait hier ; l'elagage prend le relais.
    const racine = await projet({
      exports: { import: './generateur.js' },
      corps: 'export const autreChose = 1',
    })

    expect(await fournisseurDe(racine)).toBeUndefined()
  })

  it('rend undefined quand le fichier annonce n existe pas', async () => {
    const racine = await projet({ exports: { import: './absent.js' } })

    expect(await fournisseurDe(racine)).toBeUndefined()
  })
})
