/**
 * Runs the client and the server side by side.
 *
 * A home-made script rather than a dependency: the need fits in fifty lines,
 * and it is better that the output of both processes stays readable and that
 * an interrupt stops both of them cleanly.
 */

import { spawn } from 'node:child_process'

const RESET = '[0m'

/** Processes to start, with their label and their colour. */
const TASKS = [
  { label: 'client', color: '[35m', command: 'odoro', args: ['dev'] },
  {
    label: 'server',
    color: '[36m',
    command: 'tsx',
    args: ['watch', 'server/src/main.ts'],
  },
]

const children = []

/** Prefixes every output line with the label of its process. */
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

/** Stops every process still alive. */
function stopAll() {
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill()
  }
}

for (const task of TASKS) {
  const child = spawn(task.command, task.args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    // On Windows, the binaries in node_modules are shell scripts.
    shell: process.platform === 'win32',
  })

  pipe(child.stdout, task.label, task.color)
  pipe(child.stderr, task.label, task.color)

  child.on('exit', (code) => {
    // If one stops, the other has no reason left to run.
    if (code !== 0 && code !== null) {
      process.stderr.write(`[${task.label}] stopped with code ${code}\n`)
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
