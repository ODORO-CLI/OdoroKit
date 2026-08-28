/**
 * Entree du paquet `create-odoro`.
 *
 * Ce paquet n'existe que pour rendre `npm create odoro@latest` fonctionnel :
 * npm impose ce nom exact. Il ne contient aucune logique propre et delegue
 * integralement au moteur, ce qui garantit que `npm create odoro` et
 * `odoro create` se comportent a l'identique.
 *
 * @module
 */

import { run } from 'odoro/cli'

const code = await run(['create', ...process.argv.slice(2)])
if (code !== 0) process.exitCode = code
