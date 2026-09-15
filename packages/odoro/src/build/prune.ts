/**
 * Pruning of the stylesheet.
 *
 * ## The problem
 *
 * The library ships a pre-generated stylesheet that holds **every** possible
 * utility class — several thousand. A given application uses a fraction of
 * them: measured on the database manager, 251 out of 2,446, a little over ten
 * percent. The rest still goes out, on every first visit.
 *
 * ## Pruning happens after bundling, not before
 *
 * That is the decision the whole module rests on, and it is the easy one to get
 * wrong.
 *
 * A utility class does not come only from the application code. The library
 * components — a button, a field, an alert — carry their own, and those classes
 * live in their **already compiled** JavaScript. An application may write no
 * utility class at all and depend on two hundred and fifty through its
 * components.
 *
 * Reading the application source alone would therefore prune away everything
 * its components need, and the interface would arrive unstyled — without any
 * error being raised, since missing CSS breaks nothing, it just paints nothing.
 *
 * Pruning therefore reads what **actually ships**: the JavaScript produced by
 * bundling, and the document. What appears there in no form is reachable by
 * nobody.
 *
 * ## What is never pruned
 *
 * A rule whose selector mentions no prefixed class is kept unconditionally: the
 * `:root` variables, the reset, the rules on `body` or `*`, and the semantic
 * classes the application writes itself.
 *
 * The rule is deliberately cautious on one side only. Keeping too much costs
 * bytes; removing too much breaks the display, and the flaw only shows to the
 * eye, page by page.
 *
 * ## Classes built at runtime
 *
 * An assembled class — `o-text-${color}` — exists nowhere in its final form,
 * and no analyser can guess it. It will disappear.
 *
 * That is the limit of the technique, it is the same for everyone who practises
 * it, and the answer is the same: a safelist, declared in the configuration.
 * The module does not try to be cleverer, because an analyser that guesses
 * right nine times out of ten produces a flaw that only shows up on the tenth
 * page.
 *
 * @module
 */

/* -------------------------------------------------------------------------- */
/* Parsing the CSS                                                            */
/* -------------------------------------------------------------------------- */

/** A node of the stylesheet. */
type CssNode =
  | { readonly kind: 'rule'; readonly selector: string; readonly body: string }
  | {
      readonly kind: 'group'
      readonly prelude: string
      readonly children: readonly CssNode[]
    }
  | { readonly kind: 'raw'; readonly text: string }

/**
 * The group rules, whose body holds other rules.
 *
 * `@keyframes` is deliberately not one of them: its body looks like rules
 * (`from`, `50%`) but is not, and walking into it would amount to pruning
 * animation steps while believing we were pruning utilities.
 */
const GROUPS = new Set(['media', 'supports', 'layer', 'container', 'scope'])

/**
 * Splits CSS into nodes.
 *
 * Written by hand rather than with regular expressions: a brace inside a string
 * (`content: "}"`), inside a comment or inside a URL is enough to derail a
 * naive split, and the result is a stylesheet truncated in the middle of a
 * rule.
 */
function parseCss(css: string): readonly CssNode[] {
  const nodes: CssNode[] = []
  let i = 0
  let start = 0

  /** Advances one character, skipping strings, comments and escapes. */
  function advance(): void {
    const c = css[i] as string

    if (c === '\\') {
      i += 2
      return
    }

    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? css.length : end + 2
      return
    }

    if (c === '"' || c === "'") {
      i += 1
      while (i < css.length && css[i] !== c) {
        i += css[i] === '\\' ? 2 : 1
      }
      i += 1
      return
    }

    i += 1
  }

  while (i < css.length) {
    const c = css[i] as string

    if (c === '{') {
      const prelude = css.slice(start, i).trim()

      // The body, by counting braces — while skipping strings and comments.
      let depth = 1
      i += 1
      const bodyStart = i

      while (i < css.length && depth > 0) {
        const d = css[i]
        if (d === '{') {
          depth += 1
          i += 1
        } else if (d === '}') {
          depth -= 1
          i += 1
        } else {
          advance()
        }
      }

      const body = css.slice(bodyStart, i - 1)

      if (prelude.startsWith('@')) {
        const name = /^@([a-zA-Z-]+)/.exec(prelude)?.[1] ?? ''
        nodes.push(
          GROUPS.has(name)
            ? { kind: 'group', prelude, children: parseCss(body) }
            : // `@keyframes`, `@font-face`, `@property`: copied as they are.
              { kind: 'raw', text: `${prelude}{${body}}` },
        )
      } else if (prelude.length > 0) {
        nodes.push({ kind: 'rule', selector: prelude, body })
      }

      start = i
      continue
    }

    if (c === ';' && css.slice(start, i).trim().startsWith('@')) {
      // A rule without a body: `@import`, `@charset`.
      nodes.push({ kind: 'raw', text: `${css.slice(start, i).trim()};` })
      i += 1
      start = i
      continue
    }

    advance()
  }

  return nodes
}

/** Reassembles nodes into CSS. */
function writeCss(nodes: readonly CssNode[]): string {
  return nodes
    .map((node) => {
      if (node.kind === 'raw') return node.text
      if (node.kind === 'rule') return `${node.selector}{${node.body}}`
      return `${node.prelude}{${writeCss(node.children)}}`
    })
    .join('\n')
}

/* -------------------------------------------------------------------------- */
/* The classes                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The classes of a selector, as they are written in an attribute.
 *
 * CSS escapes what a class name cannot carry as is: `.sm\:o-block` designates
 * the class `sm:o-block`, `.o-w-1\/2` the class `o-w-1/2`. Comparing without
 * unescaping would never find a single match — and pruning would remove
 * everything.
 */
export function classesIn(selector: string): readonly string[] {
  const classes: string[] = []
  const pattern = /(?<!\\)\.((?:\\.|[\w-])+)/g

  for (const found of selector.matchAll(pattern)) {
    classes.push((found[1] as string).replaceAll(/\\(.)/g, '$1'))
  }

  return classes
}

/**
 * The words the produced code holds, which could be classes.
 *
 * Deliberately coarse: we do not try to understand the JavaScript, we extract
 * everything from it that has the shape of a class name. A false positive keeps
 * one rule too many — a few bytes. A false negative removes a style — a visual
 * flaw only found by eye.
 */
export function wordsIn(text: string): Set<string> {
  const words = new Set<string>()
  // The characters a utility class name can carry, variants included:
  // `hover:o-bg-x`, `o-w-1/2`, `o-p-[3px]`.
  const pattern = /[A-Za-z0-9_][A-Za-z0-9_:/.[\]%@-]*/g

  for (const found of text.matchAll(pattern)) words.add(found[0])

  return words
}

/* -------------------------------------------------------------------------- */
/* The pruning                                                                */
/* -------------------------------------------------------------------------- */

/** What a pruning run reports. */
export interface PruneReport {
  readonly css: string
  readonly bytesBefore: number
  readonly bytesAfter: number
  /** The prefixed classes kept. */
  readonly kept: number
  /** Those the stylesheet defined without anything using them. */
  readonly removed: number
}

/** What is needed to prune. */
export interface PruneOptions {
  /** The prefix of prunable classes. @defaultValue 'o-' */
  readonly prefix?: string
  /**
   * Classes kept no matter what.
   *
   * For those assembled at runtime, which no analyser can see. A string keeps
   * one class; a regular expression keeps every class it matches.
   */
  readonly safelist?: readonly (string | RegExp)[]
}

/** Is a class prefixed, variants included? */
function isUtility(className: string, prefix: string): boolean {
  // `o-flex`, but also `sm:o-flex` and `dark:hover:o-flex`.
  const bare = className.slice(className.lastIndexOf(':') + 1)
  return bare.startsWith(prefix)
}

/** Does this class survive? */
function isKept(
  className: string,
  used: ReadonlySet<string>,
  safelist: readonly (string | RegExp)[],
): boolean {
  if (used.has(className)) return true

  for (const rule of safelist) {
    if (typeof rule === 'string' ? rule === className : rule.test(className)) return true
  }

  return false
}

/**
 * Removes from the stylesheet the utilities nothing uses.
 *
 * @param css The complete stylesheet.
 * @param sources The code that actually ships — the JavaScript produced by
 *   bundling and the document. **Not** the application source: the classes of
 *   the library components do not appear there.
 *
 * @example
 * const report = prune(css, [producedJs, html], { safelist: [/^o-text-/] })
 */
export function prune(
  css: string,
  sources: readonly string[],
  options: PruneOptions = {},
): PruneReport {
  const prefix = options.prefix ?? 'o-'
  const safelist = options.safelist ?? []

  const used = new Set<string>()
  for (const source of sources) {
    for (const word of wordsIn(source)) used.add(word)
  }

  const seen = new Set<string>()
  const survivors = new Set<string>()

  /** Keeps, in a selector list, only those that survive. */
  function filterSelector(selector: string): string | undefined {
    const kept = splitSelectors(selector).filter((one) => {
      const utilities = classesIn(one).filter((c) => isUtility(c, prefix))

      // No utility: this is not a generated rule. Variables, reset, semantic
      // classes of the application — we do not touch them, and that is what
      // makes pruning safe.
      if (utilities.length === 0) return true

      for (const className of utilities) seen.add(className)

      // All must survive: `.o-a.o-b` only applies to elements carrying both,
      // and keeping the rule without `o-b` existing would be keeping useless
      // weight.
      const survives = utilities.every((c) => isKept(c, used, safelist))
      if (survives) for (const className of utilities) survivors.add(className)

      return survives
    })

    return kept.length === 0 ? undefined : kept.join(',')
  }

  function filterNodes(nodes: readonly CssNode[]): readonly CssNode[] {
    const kept: CssNode[] = []

    for (const node of nodes) {
      if (node.kind === 'raw') {
        kept.push(node)
        continue
      }

      if (node.kind === 'rule') {
        const selector = filterSelector(node.selector)
        if (selector !== undefined) kept.push({ ...node, selector })
        continue
      }

      const children = filterNodes(node.children)
      // An empty group is not an error: it is a media query all of whose
      // utilities have been removed. Keeping it would leave `@media(...){}` by
      // the thousand.
      if (children.length > 0) kept.push({ ...node, children })
    }

    return kept
  }

  const pruned = writeCss(filterNodes(parseCss(css)))

  return {
    css: pruned,
    bytesBefore: Buffer.byteLength(css),
    bytesAfter: Buffer.byteLength(pruned),
    kept: survivors.size,
    removed: seen.size - survivors.size,
  }
}

/**
 * Splits a selector list on the top-level commas.
 *
 * A comma also lives inside `:is(a, b)`, `:not(.x, .y)` or a string. Cutting on
 * it would produce truncated selectors, hence invalid ones, hence ignored by
 * the browser — a rule lost in silence.
 */
export function splitSelectors(selector: string): readonly string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  let i = 0

  while (i < selector.length) {
    const c = selector[i]

    if (c === '\\') {
      i += 2
      continue
    }

    if (c === '"' || c === "'") {
      i += 1
      while (i < selector.length && selector[i] !== c) {
        i += selector[i] === '\\' ? 2 : 1
      }
      i += 1
      continue
    }

    if (c === '(' || c === '[') depth += 1
    else if (c === ')' || c === ']') depth -= 1
    else if (c === ',' && depth === 0) {
      parts.push(selector.slice(start, i).trim())
      start = i + 1
    }

    i += 1
  }

  parts.push(selector.slice(start).trim())

  return parts.filter((part) => part.length > 0)
}
