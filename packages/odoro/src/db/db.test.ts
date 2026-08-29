/**
 * Les commandes de base : le jeton, et ce qui se passe sans le SDK.
 *
 * Deux choses comptent ici. Un jeton range dans le projet finirait versionne,
 * et un secret pousse est a faire tourner plutot qu'a retirer d'un historique.
 * Et une commande dont le paquet manque doit dire quoi installer — pas
 * echouer sur une trace que personne ne rattache a une installation absente.
 *
 * @module
 */

import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  configPath,
  findToken,
  forgetToken,
  readUserConfig,
  storeToken,
  writeUserConfig,
} from '../config/user.js'
import { SDK_PACKAGE, loadSdk } from './sdk.js'

let dossier: string
let fichier: string

beforeEach(async () => {
  dossier = await mkdtemp(join(tmpdir(), 'odoro-conf-'))
  fichier = join(dossier, 'config.json')
})

afterEach(async () => {
  await rm(dossier, { recursive: true, force: true })
})

describe('emplacement de la configuration', () => {
  it('suit XDG_CONFIG_HOME quand il est pose', () => {
    // C'est la variable par laquelle quelqu'un decide ou ses configurations
    // vont : l'ignorer reviendrait a lui imposer un choix qu'il a explicitement
    // fait autrement.
    const chemin = configPath({ XDG_CONFIG_HOME: '/tmp/conf' })
    expect(chemin.replace(/\\/g, '/')).toBe('/tmp/conf/odoro/config.json')
  })

  it('reste hors de tout depot', () => {
    // Un fichier de configuration dans le projet ressemble a quelque chose
    // qu'on versionne, et un `git add .` ne demande l'avis de personne.
    const chemin = configPath({})
    expect(chemin).not.toContain(process.cwd())
  })
})

describe('jeton', () => {
  it('se range et se relit', async () => {
    await storeToken('https://api.exemple.fr', 'odk_live_abc_secret', fichier)
    expect(await findToken('https://api.exemple.fr', fichier, {})).toBe(
      'odk_live_abc_secret',
    )
  })

  it('separe les racines', async () => {
    await storeToken('https://a.fr', 'odk_live_a_x', fichier)
    await storeToken('https://b.fr', 'odk_live_b_y', fichier)

    expect(await findToken('https://a.fr', fichier, {})).toBe('odk_live_a_x')
    expect(await findToken('https://b.fr', fichier, {})).toBe('odk_live_b_y')
  })

  it('laisse la variable d environnement l emporter', async () => {
    // Ce qui permet a une integration continue de fournir un jeton sans ecrire
    // de fichier, et a quelqu'un d'en employer un autre le temps d'une commande.
    await storeToken('https://api.exemple.fr', 'odk_live_range', fichier)

    expect(
      await findToken('https://api.exemple.fr', fichier, { ODORO_TOKEN: 'odk_live_env' }),
    ).toBe('odk_live_env')
  })

  it('s oublie', async () => {
    await storeToken('https://api.exemple.fr', 'odk_live_abc_secret', fichier)
    await forgetToken('https://api.exemple.fr', fichier)

    expect(await findToken('https://api.exemple.fr', fichier, {})).toBeUndefined()
  })

  it('reserve le fichier a son proprietaire', async () => {
    const rapport = await writeUserConfig({ tokens: { a: 'b' } }, fichier)

    if (rapport.restricted) {
      const mode = (await stat(fichier)).mode & 0o777
      expect(mode).toBe(0o600)
    } else {
      // Sur Windows, l'equivalent POSIX n'existe pas. Le rapport doit le dire
      // plutot que de laisser croire a une protection absente.
      expect(process.platform).toBe('win32')
    }
  })

  it('repart d une configuration vide si le fichier est corrompu', async () => {
    // Une configuration illisible ne doit pas empecher toute commande de
    // fonctionner : on la remplace, on ne s'y arrete pas.
    await writeFile(fichier, '{ ceci n est pas du json', 'utf8')
    expect(await readUserConfig(fichier)).toEqual({})
  })

  it('conserve ce qui etait deja range', async () => {
    await writeUserConfig({ defaultApiUrl: 'https://a.fr' }, fichier)
    await storeToken('https://b.fr', 'odk_live_x', fichier)

    const config = await readUserConfig(fichier)
    expect(config.defaultApiUrl).toBe('https://a.fr')
    expect(config.tokens?.['https://b.fr']).toBe('odk_live_x')
  })

  it('n ecrit le jeton nulle part ailleurs', async () => {
    await storeToken('https://api.exemple.fr', 'odk_live_tres_secret', fichier)

    const contenu = await readFile(fichier, 'utf8')
    expect(contenu).toContain('odk_live_tres_secret')

    // Et surtout : rien dans le dossier de travail.
    const dansLeProjet = await readFile(join(process.cwd(), 'package.json'), 'utf8')
    expect(dansLeProjet).not.toContain('odk_live_tres_secret')
  })
})

describe('chargement du SDK', () => {
  it('explique quoi installer plutot que d echouer', async () => {
    // Le paquet est volontairement absent de ce depot : la communication entre
    // les deux depots passe par le paquet publie, dans un seul sens. C'est donc
    // le chemin degrade qui est le chemin teste.
    const load = await loadSdk()

    expect(load.ok).toBe(false)
    if (!load.ok) {
      expect(load.reason).toContain(SDK_PACKAGE)
      expect(load.reason).toContain('npm install')
      // Et une raison, pas seulement une injonction.
      expect(load.reason).toContain('telecharge a chaque')
    }
  })
})
