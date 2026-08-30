#!/usr/bin/env node
/**
 * Deploiement de la documentation et du registre sur le serveur.
 *
 * ## Pourquoi un script plutot qu'une suite de commandes
 *
 * Le premier deploiement s'est fait a la main. Le second se ferait de memoire,
 * et le troisieme oublierait quelque chose — la bascule atomique, l'exclusion
 * des cartes de source, la verification que la production tient encore.
 *
 * ## Ce qu'il ne touche jamais
 *
 * `odoro.ai` et les sites des clients vivent sur le meme serveur, servis par
 * `sites-available/odoro` et deux services distincts. Ce script n'ecrit que
 * dans `/var/www/odoro-dev/` et ne recharge rien : les fichiers statiques sont
 * lus a chaque requete, il n'y a rien a redemarrer.
 *
 * Il verifie tout de meme que la production repond avant et apres. Un
 * deploiement qui casse autre chose doit se voir immediatement, pas le
 * lendemain.
 *
 * ## La bascule est atomique
 *
 * Le nouveau contenu est depose a cote, puis les deux dossiers sont echanges
 * par `mv`. Une requete qui arrive pendant le deploiement voit l'ancienne
 * version ou la nouvelle, jamais un melange des deux — ce qu'un `rsync` en
 * place produirait pendant plusieurs secondes.
 *
 * ## Emploi
 *
 *     node scripts/deployer.mjs            # documentation et registre
 *     node scripts/deployer.mjs --registre # le registre seul
 *     node scripts/deployer.mjs --doc      # la documentation seule
 *
 * @module
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const SERVEUR = process.env['ODORO_SERVEUR'] ?? 'root@187.55.226.157'
const CLE = process.env['ODORO_CLE_SSH'] ?? `${process.env['HOME'] ?? ''}/.ssh/odoro_vps`
const BASE = '/var/www/odoro-dev'

/** Ce qu'on verifie avant et apres, et qui ne nous appartient pas. */
const PRODUCTION = ['https://odoro.ai/']

/** Execute une commande en echouant bruyamment. */
function run(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...options,
  })
}

/** Execute une commande sur le serveur. */
function distant(commande) {
  return run('ssh', ['-o', 'BatchMode=yes', '-i', CLE, SERVEUR, commande])
}

/** Verifie qu'une adresse repond, et s'arrete sinon. */
function verifier(url, attendu = 200) {
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

  if (code !== String(attendu)) {
    throw new Error(`${url} a repondu ${code}, ${String(attendu)} attendu.`)
  }
  console.log(`  ok   ${url}`)
}

/** Copie un dossier vers le serveur, puis bascule d'un coup. */
function deposer(source, nom, exclure = () => false) {
  if (!existsSync(source)) {
    throw new Error(`${source} n'existe pas. Compilez d'abord.`)
  }

  const scratch = mkdtempSync(join(tmpdir(), 'odoro-deploy-'))

  try {
    // On recopie en filtrant plutot que d'archiver tout puis d'elaguer : les
    // cartes de source pesent plus que le reste, et les envoyer pour les
    // effacer ensuite serait payer deux fois.
    const filtre = join(scratch, 'contenu')
    cpSync(source, filtre, {
      recursive: true,
      filter: (chemin) => !exclure(chemin),
    })

    // `scp -r` plutot qu'une archive : `tar` se comporte differemment selon la
    // plateforme, et un script de deploiement doit marcher depuis le poste de
    // celui qui deploie, pas seulement depuis le mien.
    distant(`rm -rf ${BASE}/${nom}.nouveau && mkdir -p ${BASE}/${nom}.nouveau`)
    run('scp', [
      '-q',
      '-r',
      '-i',
      CLE,
      `${filtre}/.`,
      `${SERVEUR}:${BASE}/${nom}.nouveau/`,
    ])

    // La bascule : le nouveau est en place a cote, on echange, on efface
    // l'ancien. Une requete pendant le deploiement voit l'une ou l'autre
    // version, jamais un melange.
    distant(
      [
        `chown -R www-data:www-data ${BASE}/${nom}.nouveau`,
        `rm -rf ${BASE}/${nom}.ancien`,
        `if [ -d ${BASE}/${nom} ]; then mv ${BASE}/${nom} ${BASE}/${nom}.ancien; fi`,
        `mv ${BASE}/${nom}.nouveau ${BASE}/${nom}`,
        `rm -rf ${BASE}/${nom}.ancien`,
      ].join(' && '),
    )

    const fichiers = distant(`find ${BASE}/${nom} -type f | wc -l`).trim()
    console.log(`  ${nom} : ${fichiers} fichiers en place`)
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
}

const args = new Set(process.argv.slice(2))
const tout = !args.has('--doc') && !args.has('--registre')

console.log('Verification de la production, avant de toucher a quoi que ce soit :')
for (const url of PRODUCTION) verifier(url)

if (tout || args.has('--registre')) {
  console.log('\nRegistre :')
  deposer(join(RACINE, 'packages', 'odoro-bits', 'dist', 'registry'), 'register')
}

if (tout || args.has('--doc')) {
  console.log('\nDocumentation :')
  // Les cartes de source ne partent pas : les sources sont publiques sur
  // GitHub, et quinze megaoctets de cartes pour un site de documentation sont
  // de la bande passante depensee pour rien.
  deposer(join(RACINE, 'playground', 'dist'), 'docs', (c) => c.endsWith('.map'))
}

console.log('\nVerification apres deploiement :')
for (const url of PRODUCTION) verifier(url)
if (tout || args.has('--registre')) verifier('https://register.odoro.dev/index.json')
if (tout || args.has('--doc')) {
  verifier('https://odoro.dev/')
  // Une route interne : c'est elle qui casse si le repli SPA disparait de la
  // configuration nginx, et la racine seule ne le dirait pas.
  verifier('https://odoro.dev/docs/installation')
}

console.log('\nDeploye.')
