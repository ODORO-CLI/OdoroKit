import { describe, expect, it } from 'vitest'

import { parseArgs } from './cli.js'

describe('parseArgs', () => {
  it('extracts the command and the positional arguments', () => {
    expect(parseArgs(['create', 'my-site'])).toEqual({
      command: 'create',
      positional: ['my-site'],
      flags: {},
    })
  })

  it('returns an empty command without any argument', () => {
    expect(parseArgs([]).command).toBe('')
  })

  it('reads an option of the form --key=value', () => {
    expect(parseArgs(['create', '--template=react-ts']).flags).toEqual({
      template: 'react-ts',
    })
  })

  it('reads an option of the form --key value', () => {
    expect(parseArgs(['dev', '--port', '3000']).flags).toEqual({ port: '3000' })
  })

  it('treats an option without a value as a boolean', () => {
    expect(parseArgs(['create', '--yes']).flags).toEqual({ yes: true })
  })

  it('treats the --no- prefix as a negation', () => {
    expect(parseArgs(['create', '--no-git', '--no-install']).flags).toEqual({
      git: false,
      install: false,
    })
  })

  it('recognises the short aliases', () => {
    expect(parseArgs(['-h']).flags).toEqual({ help: true })
    expect(parseArgs(['-v']).flags).toEqual({ version: true })
  })

  it('does not consume the next option as a value', () => {
    expect(parseArgs(['build', '--no-minify', '--outdir', 'public']).flags).toEqual({
      minify: false,
      outdir: 'public',
    })
  })

  it('keeps a value containing an equals sign', () => {
    expect(parseArgs(['dev', '--define=KEY=value']).flags).toEqual({
      define: 'KEY=value',
    })
  })

  it('accumulates several positional arguments', () => {
    const parsed = parseArgs(['create', 'a', 'b', '--yes'])
    expect(parsed.positional).toEqual(['a', 'b'])
  })
})
