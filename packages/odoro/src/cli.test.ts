import { describe, expect, it } from 'vitest'

import { parseArgs } from './cli.js'

describe('parseArgs', () => {
  it('extrait la commande et les arguments positionnels', () => {
    expect(parseArgs(['create', 'mon-site'])).toEqual({
      command: 'create',
      positional: ['mon-site'],
      flags: {},
    })
  })

  it('retourne une commande vide sans argument', () => {
    expect(parseArgs([]).command).toBe('')
  })

  it('lit une option de la forme --cle=valeur', () => {
    expect(parseArgs(['create', '--template=react-ts']).flags).toEqual({
      template: 'react-ts',
    })
  })

  it('lit une option de la forme --cle valeur', () => {
    expect(parseArgs(['dev', '--port', '3000']).flags).toEqual({ port: '3000' })
  })

  it('traite une option sans valeur comme un booleen', () => {
    expect(parseArgs(['create', '--yes']).flags).toEqual({ yes: true })
  })

  it('traite le prefixe --no- comme une negation', () => {
    expect(parseArgs(['create', '--no-git', '--no-install']).flags).toEqual({
      git: false,
      install: false,
    })
  })

  it('reconnait les alias courts', () => {
    expect(parseArgs(['-h']).flags).toEqual({ help: true })
    expect(parseArgs(['-v']).flags).toEqual({ version: true })
  })

  it('ne consomme pas l option suivante comme valeur', () => {
    expect(parseArgs(['build', '--no-minify', '--outdir', 'public']).flags).toEqual({
      minify: false,
      outdir: 'public',
    })
  })

  it('conserve une valeur contenant un signe egal', () => {
    expect(parseArgs(['dev', '--define=KEY=valeur']).flags).toEqual({
      define: 'KEY=valeur',
    })
  })

  it('accumule plusieurs arguments positionnels', () => {
    const parsed = parseArgs(['create', 'a', 'b', '--yes'])
    expect(parsed.positional).toEqual(['a', 'b'])
  })
})
