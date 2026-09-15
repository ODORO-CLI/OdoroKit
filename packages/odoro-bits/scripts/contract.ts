/**
 * Customisation contract checks on the registry sources.
 *
 * ## What really gets checked, and what does not
 *
 * The contract has five levels. Three of them cannot be checked
 * mechanically: that a prop is well named, that a slot receives what it
 * needs, that an escape hatch arrives at the right moment — that is read, it
 * is not measured. Pretending otherwise would produce arbitrary rejections
 * on correct code, which is worse than no check at all: one learns to work
 * around the tool.
 *
 * Three exact rules remain, and they are here. Each one covers a gap that no
 * review catches reliably, because it hides between two files.
 *
 * @module
 */

import { tokens } from '@odoro-cli/libs/styles'
import type { RegistryMeta } from 'odoro/registry'

/**
 * Variable names that the system really declares.
 *
 * ## Why this list exists
 *
 * Without it, the coherence rule takes every `--o-` variable for a token. Yet
 * a component declares some for its own use — the duration of its animation,
 * the colour of its sheen — which come from no scale and have no business in
 * its documentation.
 *
 * The list is derived from the tokens, never written by hand: it therefore
 * cannot drift from what the stylesheet contains.
 *
 * It also makes the rule stricter the other way round: a declared token that
 * does not exist in the system is now refused, where it used to go
 * unnoticed.
 */
const KNOWN_TOKENS: ReadonlySet<string> = new Set(
  Object.entries(tokens).flatMap(([group, scale]) =>
    typeof scale === 'string'
      ? [`--o-${group}`]
      : Object.keys(scale).map((key) => `--o-${group}-${key.replace(/\./g, '_')}`),
  ),
)

/** Categories whose entries render an element of the document. */
const RENDERING = new Set([
  'text',
  'background',
  'effect',
  'hero',
  'image',
  'ui',
  'section',
])

/**
 * A token consumed directly in a source.
 *
 * Two shapes, because there are two legitimate ways to read a token.
 * In CSS, `var(--o-x)`. In JavaScript — a shader that needs three floats, a
 * duration handed to a timeline — the name is a string, passed to
 * `readTokenColour` or to `getPropertyValue`.
 *
 * The second shape was added afterwards: the first version of this rule
 * refused an animated background that did read its colours from the palette,
 * only not in CSS.
 */
const TOKEN_USE = /var\(\s*(--o-[a-z0-9-]+)|['"`](--o-[a-z0-9-]+)['"`]/g

/**
 * A hard-coded colour.
 *
 * Shader directives — `#version`, `#ifdef` — cannot be taken for colours:
 * they contain letters outside the hexadecimal alphabet, and the word
 * boundary prevents a partial match.
 */
const HARD_COLOUR = /(?<!&)#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\(/g

/** A breach of the contract. */
export interface ContractProblem {
  /** Entry concerned. */
  readonly id: string
  /** Complete sentence, ready to be displayed. */
  readonly message: string
}

/**
 * Strips the comments from a source, leaving the strings intact.
 *
 * ## Why this is necessary
 *
 * A documentation example quotes tokens that the component does not use —
 * that is even the point of an example, showing something other than the
 * default. Without this cleanup, the coherence rule would count them as used
 * and demand their declaration.
 *
 * The first draft of this rule stumbled on exactly that, on a background
 * whose docblock showed three spare tokens.
 *
 * ## What is preserved
 *
 * Strings and templates. A shader lives in a template, and a token read lives
 * in a string: walking through them while stripping them would amount to
 * seeing nothing at all.
 */
export function stripComments(source: string): string {
  let output = ''
  let quote: string | null = null
  let inLine = false
  let inBlock = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index] ?? ''
    const next = source[index + 1] ?? ''

    if (inLine) {
      if (char === '\n') {
        inLine = false
        output += char
      }
      continue
    }

    if (inBlock) {
      if (char === '*' && next === '/') {
        inBlock = false
        index += 1
      }
      continue
    }

    if (quote !== null) {
      output += char
      if (char === '\\') {
        output += next
        index += 1
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      output += char
      continue
    }
    if (char === '/' && next === '/') {
      inLine = true
      index += 1
      continue
    }
    if (char === '/' && next === '*') {
      inBlock = true
      index += 1
      continue
    }

    output += char
  }

  return output
}

/**
 * Extracts the tokens a source consumes directly.
 *
 * The comments are stripped first: a token quoted in an example is
 * documentation, not a consumption.
 */
export function usedTokens(source: string): Set<string> {
  const found = new Set<string>()
  for (const match of stripComments(source).matchAll(TOKEN_USE)) {
    const token = match[1] ?? match[2]
    if (token !== undefined) found.add(token)
  }
  return found
}

/**
 * Checks the contract on one entry.
 *
 * @param meta Entry validated by the schema.
 * @param sources File contents, indexed by their path.
 *
 * @example
 * const problems = checkContract(meta, sources)
 */
export function checkContract(
  meta: RegistryMeta & { id: string },
  sources: Readonly<Record<string, string>>,
): ContractProblem[] {
  const problems: ContractProblem[] = []
  const say = (message: string): void => {
    problems.push({ id: meta.id, message: `${meta.id}: ${message}` })
  }

  const code = Object.values(sources).join('\n')

  // Rule 1 — the declared tokens and the used tokens must coincide.
  //
  // The declaration serves the documentation and the CLI; the code is what
  // counts. A gap between the two is invisible on review — both files have to
  // be under your eyes — and it misleads exactly the person looking for which
  // variable to turn to change the appearance.
  // Only the variables the system declares count: the others are private
  // variables of the component.
  const used = new Set([...usedTokens(code)].filter((token) => KNOWN_TOKENS.has(token)))
  const declared = new Set(meta.tokens)

  for (const token of declared) {
    if (!KNOWN_TOKENS.has(token)) {
      say(`token ${token} does not exist in the system.`)
    }
  }

  for (const token of declared) {
    if (!used.has(token)) {
      say(`token ${token} is declared but is used nowhere.`)
    }
  }
  for (const token of used) {
    if (!declared.has(token)) {
      say(`token ${token} is used but missing from "tokens".`)
    }
  }

  // Rule 2 — a component that renders an element accepts `className`.
  //
  // This is level 3 of the contract, the one that lets the component be laid
  // out without knowing anything about its inside. Without it, the only way
  // to shift it by one notch is to wrap it — or to edit its source, which
  // `odoro diff` will report at every update.
  //
  // The check covers the presence of the name, not the correctness of the
  // merge: that one is guaranteed by `mergePresentation`, not by a textual
  // reading. It is a rule that catches the omission, not the clumsiness.
  if (RENDERING.has(meta.category) && !code.includes('className')) {
    say(
      'no mention of className: the component cannot be laid out (level 3 of the contract).',
    )
  }

  // Rule 3 — no hard-coded colour.
  //
  // A hard-coded colour is a setting that level 1 can no longer reach:
  // changing a token will not touch it, and the component will stay alone of
  // its kind in a page that has changed theme. It is the most common flaw of
  // a component taken from elsewhere.
  const colours = [...code.matchAll(HARD_COLOUR)].map((match) => match[0])
  if (colours.length > 0) {
    const shown = [...new Set(colours)].slice(0, 3).join(', ')
    say(
      `hard-coded colour (${shown}): it escapes the tokens, and will follow no change of theme.`,
    )
  }

  return problems
}
