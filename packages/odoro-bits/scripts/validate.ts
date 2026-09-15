/**
 * Registry validation.
 *
 * Fails if an entry is malformed, if a declared file does not exist, if a
 * registry dependency points into the void, or if the graph contains a cycle.
 *
 * ## Why this is a script and not only a test
 *
 * A test returns a report designed for someone who has just written code.
 * This script, itself, also runs before publication, in a context where
 * nobody reads the output as long as it is green. It is therefore short when
 * all is well, and exhaustive when it is not.
 *
 * @module
 */

import { describeProblem, toCatalogue, validateCatalogue } from 'odoro/registry'

import { collectRegistry, displayPath, isMainModule } from './collect.js'
import { checkContract } from './contract.js'

/** What a validation returns. */
export interface ValidationReport {
  /** Problems found, in order. Empty if the registry is healthy. */
  readonly problems: readonly string[]
  /** Number of entries read. Zero if the reading itself failed. */
  readonly count: number
}

/**
 * Validates a whole registry.
 *
 * @param root Registry root.
 *
 * @example
 * const report = await validateRegistry('registry')
 * if (report.problems.length > 0) process.exitCode = 1
 */
export async function validateRegistry(root: string): Promise<ValidationReport> {
  const collected = await collectRegistry(root)

  // The graph is resolved only if every entry is readable: resolving it on an
  // incomplete catalogue would invent missing dependencies that would only be
  // the consequence of the first error.
  if (!collected.ok) return { problems: collected.problems, count: 0 }

  const problems = validateCatalogue(toCatalogue(collected.entries)).map(describeProblem)

  // The customisation contract is checked after the graph: an entry whose
  // dependency is missing stands a good chance of being incomplete, and the
  // contract breaches it would produce would be noise on top of the real
  // error.
  if (problems.length === 0) {
    for (const entry of collected.entries) {
      problems.push(...checkContract(entry, entry.sources).map((issue) => issue.message))
    }
  }

  return { problems, count: collected.entries.length }
}

/** Entry point of the script. */
async function main(): Promise<void> {
  const root = process.argv[2] ?? 'registry'
  const { problems, count } = await validateRegistry(root)

  if (problems.length > 0) {
    console.error(`Invalid registry — ${problems.length} problem(s):\n`)
    for (const problem of problems) console.error(`  · ${problem}`)
    console.error('')
    process.exitCode = 1
    return
  }

  console.log(`Valid registry — ${count} entries in ${displayPath(root)}.`)
}

if (isMainModule(import.meta.url)) await main()
