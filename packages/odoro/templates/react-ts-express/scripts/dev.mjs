/**
 * Lance le client et le serveur en parallele.
 *
 * Un script maison plutot qu'une dependance : le besoin tient en cinquante
 * lignes, et il vaut mieux que la sortie des deux processus reste lisible et
 * qu'une interruption les arrete tous les deux proprement.
 */

import { spawn } from 'node:child_process'

const RESET = '\u001b[0m'

/** Processus a lancer, avec leur etiquette et leur couleur. */
const TASKS = [
  { label: 'client', color: '\u001b[35m', command: 'odoro', args: ['dev'] },
  {
    label: 'serveur',
    color: '\u001b[36m',
    command: 'tsx',
    args: ['watch', 'server/src/index.ts'],
  },
]

const children = []

/** Prefixe chaque ligne de sortie par l'etiquette de son processus. */
function pipe(stream, label, color) {
  let buffer = ''
  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    buffer += chunk
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      process.stdout.write(`${color}[${label}]${RESET} ${line}\n`)
    }
  })
}

/** Arrete tous les processus encore vivants. */
function stopAll() {
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill()
  }
}

for (const task of TASKS) {
  const child = spawn(task.command, task.args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    // Sous Windows, les binaires de node_modules sont des scripts shell.
    shell: process.platform === 'win32',
  })

  pipe(child.stdout, task.label, task.color)
  pipe(child.stderr, task.label, task.color)

  child.on('exit', (code) => {
    // Si l'un s'arrete, l'autre n'a plus de raison de tourner.
    if (code !== 0 && code !== null) {
      process.stderr.write(`[${task.label}] arret avec le code ${code}\n`)
    }
    stopAll()
    process.exitCode = code ?? 0
  })

  children.push(child)
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopAll()
    process.exit(0)
  })
}
