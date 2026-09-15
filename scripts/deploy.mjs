#!/usr/bin/env node
/**
 * Deployment of the documentation and the registry to the server.
 *
 * ## Why a script rather than a sequence of commands
 *
 * The first deployment was done by hand. The second would be done from memory,
 * and the third would forget something — the atomic swap, the exclusion of the
 * source maps, the check that production still holds.
 *
 * ## What it never touches
 *
 * `odoro.ai` and the client sites live on the same server, served by
 * `sites-available/odoro` and two separate services. This script only writes
 * into `/var/www/odoro-dev/` and reloads nothing: the static files are read on
 * every request, there is nothing to restart.
 *
 * It does check all the same that production answers before and after. A
 * deployment that breaks something else must be visible immediately, not the
 * next day.
 *
 * ## The swap is atomic
 *
 * The new content is dropped alongside, then the two folders are exchanged
 * with `mv`. A request arriving during the deployment sees the old version or
 * the new one, never a mix of the two — which an in-place `rsync` would
 * produce for several seconds.
 *
 * ## Usage
 *
 *     node scripts/deploy.mjs            # documentation and registry
 *     node scripts/deploy.mjs --registry # the registry alone
 *     node scripts/deploy.mjs --doc      # the documentation alone
 *
 * @module
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const SERVER = process.env['ODORO_SERVEUR'] ?? 'root@187.55.226.157'
const KEY = process.env['ODORO_CLE_SSH'] ?? `${process.env['HOME'] ?? ''}/.ssh/odoro_vps`
const BASE = '/var/www/odoro-dev'

/** What we check before and after, and which is not ours. */
const PRODUCTION = ['https://odoro.ai/']

/** Runs a command, failing loudly. */
function run(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...options,
  })
}

/** Runs a command on the server. */
function remote(command) {
  return run('ssh', ['-o', 'BatchMode=yes', '-i', KEY, SERVER, command])
}

/** Checks that an address answers, and stops otherwise. */
function check(url, expected = 200) {
  const code = run('curl', [
    '-s',
    '-o',
    process.platform === 'win32' ? 'NUL' : '/dev/null',
    '-w',
    '%{http_code}',
    '--max-time',
    '20',
    url,
  ]).trim()

  if (code !== String(expected)) {
    throw new Error(`${url} answered ${code}, ${String(expected)} expected.`)
  }
  console.log(`  ok   ${url}`)
}

/** Copies a folder to the server, then swaps it in one go. */
function upload(source, name, exclude = () => false) {
  if (!existsSync(source)) {
    throw new Error(`${source} does not exist. Build first.`)
  }

  const scratch = mkdtempSync(join(tmpdir(), 'odoro-deploy-'))

  try {
    // We copy while filtering rather than archiving everything then pruning:
    // the source maps weigh more than the rest, and sending them only to
    // delete them afterwards would be paying twice.
    const filtered = join(scratch, 'contenu')
    cpSync(source, filtered, {
      recursive: true,
      filter: (path) => !exclude(path),
    })

    // `scp -r` rather than an archive: `tar` behaves differently depending on
    // the platform, and a deployment script must work from the machine of
    // whoever deploys, not only from mine.
    remote(`rm -rf ${BASE}/${name}.nouveau && mkdir -p ${BASE}/${name}.nouveau`)
    run('scp', [
      '-q',
      '-r',
      '-i',
      KEY,
      `${filtered}/.`,
      `${SERVER}:${BASE}/${name}.nouveau/`,
    ])

    // The swap: the new one is in place alongside, we exchange, we delete the
    // old one. A request during the deployment sees one version or the other,
    // never a mix.
    remote(
      [
        `chown -R www-data:www-data ${BASE}/${name}.nouveau`,
        `rm -rf ${BASE}/${name}.ancien`,
        `if [ -d ${BASE}/${name} ]; then mv ${BASE}/${name} ${BASE}/${name}.ancien; fi`,
        `mv ${BASE}/${name}.nouveau ${BASE}/${name}`,
        `rm -rf ${BASE}/${name}.ancien`,
      ].join(' && '),
    )

    const files = remote(`find ${BASE}/${name} -type f | wc -l`).trim()
    console.log(`  ${name} : ${files} files in place`)
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
}

const args = new Set(process.argv.slice(2))
const all = !args.has('--doc') && !args.has('--registry')

console.log('Checking production, before touching anything at all :')
for (const url of PRODUCTION) check(url)

if (all || args.has('--registry')) {
  console.log('\nRegistry :')
  upload(join(ROOT, 'packages', 'odoro-bits', 'dist', 'registry'), 'register')
}

if (all || args.has('--doc')) {
  console.log('\nDocumentation :')
  // The source maps do not go: the sources are public on GitHub, and fifteen
  // megabytes of maps for a documentation site are bandwidth spent for
  // nothing.
  upload(join(ROOT, 'playground', 'dist'), 'docs', (c) => c.endsWith('.map'))
}

console.log('\nCheck after deployment :')
for (const url of PRODUCTION) check(url)
if (all || args.has('--registry')) check('https://register.odoro.dev/index.json')
if (all || args.has('--doc')) {
  check('https://odoro.dev/')
  // An internal route: it is the one that breaks if the SPA fallback
  // disappears from the nginx configuration, and the root alone would not say
  // so.
  check('https://odoro.dev/docs/installation')
}

console.log('\nDeployed.')
