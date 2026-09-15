/**
 * Entry point of the `create-odoro` package.
 *
 * This package only exists to make `npm create odoro@latest` work: npm forces
 * that exact name. It holds no logic of its own and delegates entirely to the
 * engine, which guarantees that `npm create odoro` and `odoro create` behave
 * identically.
 *
 * @module
 */

import { run } from 'odoro/cli'

const code = await run(['create', ...process.argv.slice(2)])
if (code !== 0) process.exitCode = code
