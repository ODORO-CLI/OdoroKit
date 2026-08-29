/**
 * La question de la base, et surtout ses refus.
 *
 * Aucune connexion n'est ouverte pendant l'echafaudage : ce qui est verifie
 * ici est la forme de l'URL. Les cas testes sont ceux qui passent une
 * inspection a l'oeil et cassent ensuite — un nom de base oublie, un `sslmode`
 * desactive sur une base distante.
 *
 * @module
 */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { assertEnvIgnored, checkDatabaseUrl, writeDatabaseUrl } from './database.js'

describe('forme de l URL', () => {
  it('accepte une URL complete', () => {
    expect(
      checkDatabaseUrl('postgres://lea:secret@db.exemple.fr:5432/projet?sslmode=require'),
    ).toBeUndefined()
  })

  it('accepte la forme longue du protocole', () => {
    expect(checkDatabaseUrl('postgresql://lea@hote:5432/projet')).toBeUndefined()
  })

  it('refuse une chaine vide', () => {
    expect(checkDatabaseUrl('   ')).toMatch(/ne peut pas etre vide/)
  })

  it('refuse un autre moteur', () => {
    // Il n'y en a plus qu'un. Une URL SQLite heritee d'un projet plus ancien
    // doit echouer ici, pas au premier acces.
    expect(checkDatabaseUrl('file:./storage/dev.db')).toMatch(/postgres:\/\//)
    expect(checkDatabaseUrl('mysql://hote:3306/projet')).toMatch(/postgres:\/\//)
  })

  it('refuse une URL sans nom de base', () => {
    // Sans chemin, on se connecte a la base par defaut du role : ce n'est
    // presque jamais ce qu'on veut, et cela ne se remarque qu'une fois les
    // tables creees ailleurs.
    expect(checkDatabaseUrl('postgres://lea@hote:5432')).toMatch(/nom de base/)
    expect(checkDatabaseUrl('postgres://lea@hote:5432/')).toMatch(/nom de base/)
  })

  it('refuse sslmode=disable sur une base distante', () => {
    expect(
      checkDatabaseUrl('postgres://lea:secret@db.exemple.fr:5432/p?sslmode=disable'),
    ).toMatch(/en clair/)
  })

  it('tolere sslmode=disable sur la machine meme', () => {
    // Une base sur `localhost` ne fait pas passer son trafic sur le reseau. Le
    // socle n'en prevoit pas, mais un tunnel local en produit une.
    expect(
      checkDatabaseUrl('postgres://lea@localhost:5432/p?sslmode=disable'),
    ).toBeUndefined()
  })

  it('refuse ce qui n est pas une URL', () => {
    expect(checkDatabaseUrl('postgres://')).toBeDefined()
  })
})

describe('ecriture dans le .env', () => {
  let dossier: string

  beforeEach(async () => {
    dossier = await mkdtemp(join(tmpdir(), 'odoro-db-'))
  })

  afterEach(async () => {
    await rm(dossier, { recursive: true, force: true })
  })

  it('part de l exemple et y pose l URL', async () => {
    await writeFile(
      join(dossier, '.env.example'),
      '# commentaire\nDATABASE_URL=\nPORT=3001\n',
      'utf8',
    )

    await writeDatabaseUrl(dossier, 'postgres://lea@hote:5432/p')
    const contenu = await readFile(join(dossier, '.env'), 'utf8')

    expect(contenu).toContain('DATABASE_URL=postgres://lea@hote:5432/p')
    // Les autres variables suivent : on ne les redecouvre pas une par une.
    expect(contenu).toContain('PORT=3001')
    expect(contenu).toContain('# commentaire')
  })

  it('remplace une URL deja presente sans dupliquer la ligne', async () => {
    await writeFile(join(dossier, '.env'), 'DATABASE_URL=postgres://ancien\n', 'utf8')

    await writeDatabaseUrl(dossier, 'postgres://lea@hote:5432/p')
    const contenu = await readFile(join(dossier, '.env'), 'utf8')

    expect(contenu.match(/DATABASE_URL=/g)).toHaveLength(1)
    expect(contenu).toContain('postgres://lea@hote:5432/p')
  })

  it('ajoute la ligne quand le fichier n en a pas', async () => {
    await writeFile(join(dossier, '.env'), 'PORT=3001\n', 'utf8')

    await writeDatabaseUrl(dossier, 'postgres://lea@hote:5432/p')
    const contenu = await readFile(join(dossier, '.env'), 'utf8')

    expect(contenu).toContain('PORT=3001')
    expect(contenu).toContain('DATABASE_URL=postgres://lea@hote:5432/p')
  })
})

describe('le .env ne doit pas etre versionne', () => {
  let dossier: string

  beforeEach(async () => {
    dossier = await mkdtemp(join(tmpdir(), 'odoro-git-'))
  })

  afterEach(async () => {
    await rm(dossier, { recursive: true, force: true })
  })

  it('se tait quand .env est ignore', async () => {
    await writeFile(join(dossier, '.gitignore'), 'node_modules\n.env\n', 'utf8')
    expect(await assertEnvIgnored(dossier)).toBeUndefined()
  })

  it('accepte les formes usuelles', async () => {
    await writeFile(join(dossier, '.gitignore'), '.env*\n', 'utf8')
    expect(await assertEnvIgnored(dossier)).toBeUndefined()
  })

  it('avertit quand il ne l est pas', async () => {
    // Une fois pousse, un secret est a faire tourner, pas a supprimer de
    // l'historique : l'avertissement doit venir avant le premier commit.
    await writeFile(join(dossier, '.gitignore'), 'node_modules\n', 'utf8')
    expect(await assertEnvIgnored(dossier)).toMatch(/versionn/)
  })

  it('avertit quand il n y a pas de .gitignore', async () => {
    expect(await assertEnvIgnored(dossier)).toMatch(/Aucun .gitignore/)
  })
})
