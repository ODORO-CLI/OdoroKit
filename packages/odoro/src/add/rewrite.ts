/**
 * Rewriting the imports of a component at copy time.
 *
 * ## The `@registre` token
 *
 * A registry component sometimes imports its neighbour: an effect needs the
 * fallback hook, a hero needs the damped pointer. These imports cannot be
 * hard-written, since the destination depends on the host project — `@/odoro`,
 * `~/components/odoro`, or a bare path when the project has no alias.
 *
 * The registry sources therefore write `@registre/hooks/usePoster`, and the CLI
 * replaces the prefix on write. The token is deliberately impossible to mistake
 * for a real package: it resolves nowhere, so a component that kept it by
 * accident fails at build time rather than search the npm registry.
 *
 * The token itself keeps its French spelling: it is written in the sources of
 * every registry entry, which live in another package.
 *
 * ## What is not rewritten
 *
 * Everything else. `@odoro-cli/engine`, `react`, `gsap`, `three` are real
 * packages: they get installed, they are not copied. The only path rewritten is
 * the one pointing at another copied file.
 *
 * @module
 */

/** Prefix used in the registry sources. */
export const REGISTRY_TOKEN = '@registre'

/**
 * Is the configured prefix an alias, or a plain path?
 *
 * ## Why the question arises
 *
 * `odoro init` reads the alias of the `tsconfig.json` — `@/odoro`,
 * `~/components/odoro`. When the project has none, it fell back on the path
 * itself, `src/odoro`, and the imports were written
 * `from 'src/odoro/hooks/useInView'`.
 *
 * Such a path is not a valid specifier: it starts with neither a dot nor a
 * slash, so it is looked up among the packages, where it does not exist. The
 * project did not build, with a module-not-found error nothing connected to the
 * registry.
 *
 * It only worked by accident, in projects carrying a `baseUrl` in their
 * `tsconfig.json` — which has its own troubles, since it makes bare imports
 * resolve from the project root.
 *
 * ## The rule
 *
 * Aliases start with `@`, `~` or `#` — the three conventions used by
 * TypeScript, package managers and the internal imports of Node. Everything
 * else is a path, and a path is written relative.
 *
 * Relative is never wrong: it resolves without configuration, whatever the
 * `tsconfig.json`. A project with an alias keeps its own, which reads better;
 * the others get something that works.
 *
 * @example
 * isAlias('@/odoro')   // true
 * isAlias('src/odoro') // false
 */
export function isAlias(prefix: string): boolean {
  return /^[@~#]/.test(prefix)
}

/**
 * Relative path from one copied file to another, both inside the destination
 * directory.
 *
 * Both paths are given relative to that directory, so the project root does not
 * enter the computation: `text/CountUp.tsx` aiming at `hooks/useInView` gets
 * `../hooks/useInView`.
 *
 * @example
 * relativeImport('text/CountUp.tsx', 'hooks/useInView') // '../hooks/useInView'
 * relativeImport('text/CountUp.tsx', 'text/Other')      // './Other'
 */
export function relativeImport(from: string, to: string): string {
  const fromSegments = from.split('/').slice(0, -1)
  const toSegments = to.split('/')

  let common = 0
  while (
    common < fromSegments.length &&
    common < toSegments.length - 1 &&
    fromSegments[common] === toSegments[common]
  ) {
    common += 1
  }

  const climbs = fromSegments.length - common
  const descent = toSegments.slice(common).join('/')

  // A relative path must announce itself as such: without `./`, a neighbour in
  // the same directory would become a bare specifier again.
  return climbs === 0 ? `./${descent}` : `${'../'.repeat(climbs)}${descent}`
}

/**
 * Replaces the registry token by the import prefix of the project.
 *
 * The substitution bears on the token followed by a slash, not on the token
 * alone: without that, a package named `@registre-something` would be touched.
 *
 * When the prefix is not an alias — see `isAlias` — the imports are written
 * relative from `target`. That is the only case where the destination of the
 * file matters, and also the only one where the prefix would not resolve.
 *
 * @param source Source code as it comes from the registry.
 * @param importPrefix Prefix of the project, without a trailing slash.
 * @param target Destination of the file, relative to the components directory.
 * Without it, the substitution by prefix applies whatever happens.
 *
 * @example
 * rewriteImports("from '@registre/hooks/usePoster'", '@/odoro')
 * // "from '@/odoro/hooks/usePoster'"
 *
 * @example
 * rewriteImports("from '@registre/hooks/usePoster'", 'src/odoro', 'text/CountUp.tsx')
 * // "from '../hooks/usePoster'"
 */
export function rewriteImports(
  source: string,
  importPrefix: string,
  target?: string,
): string {
  const prefix = importPrefix.replace(/\/$/, '')

  if (isAlias(prefix) || target === undefined) {
    return source.split(`${REGISTRY_TOKEN}/`).join(`${prefix}/`)
  }

  // The token runs up to the closing quote: that is the end of the specifier,
  // and nothing else in the line must be touched.
  return source.replaceAll(
    new RegExp(`${REGISTRY_TOKEN}/([^'"\\s]+)`, 'g'),
    (_whole, path: string) => relativeImport(target, path),
  )
}

/**
 * Lists the registry entries a source really imports.
 *
 * Used for diagnostics: an entry importing a neighbour without declaring it in
 * its `registryDependencies` will install alone, and will break for the first
 * user who did not already have the neighbour.
 *
 * The scan is textual, and that is accepted: a full parser would be more
 * accurate, but there is nothing to gain here — the result serves to **warn**,
 * not to decide. An occurrence in a comment produces one warning too many; a
 * missing import would produce a broken component.
 *
 * @example
 * usedTokens("import x from '@registre/hooks/usePoster'") // ['hooks/usePoster']
 */
export function usedTokens(source: string): string[] {
  const pattern = new RegExp(`${REGISTRY_TOKEN}/([\\w./-]+)`, 'g')
  const found = new Set<string>()
  for (const match of source.matchAll(pattern)) {
    const path = match[1]
    if (path !== undefined) found.add(path)
  }
  return [...found].sort()
}
