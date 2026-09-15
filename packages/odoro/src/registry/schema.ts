/**
 * Format of a registry entry.
 *
 * ## Why the schema lives here
 *
 * The format is a **contract** between the registry that publishes and the
 * client that downloads. Putting it on the client side is not arbitrary: that
 * is where the validation matters most. The registry validates what it produces
 * before publishing it; the client validates what it receives from a server it
 * does not control, just before writing files into the user project.
 *
 * A single definition, therefore, used at both ends.
 *
 * ## The weight of the validation
 *
 * Two decisions, measured rather than assumed.
 *
 * The library is **inlined at build time** rather than declared as a
 * dependency: installed, it weighs close to six megabytes, while the surface
 * actually used is a fraction of that.
 *
 * And it is its variant designed for splitting that is used, not its usual API:
 * the first produces thirteen minified kilobytes, the second four hundred and
 * twenty-seven. A factor of thirty-three for the same validation. Writing it is
 * more verbose there — the checks are functions rather than chained methods —
 * but pleading weight for the graphics engine and ignoring it here would be
 * inconsistent.
 *
 * @module
 */

import * as z from 'zod/mini'

/** Component categories of the registry. */
export const CATEGORIES = [
  'text',
  'background',
  'effect',
  'hero',
  'image',
  'ui',
  'section',
  /**
   * The opening curtain.
   *
   * Not a section: a section takes a place in the flow of the page, a loader
   * covers the whole screen and disappears. Filing them together would force
   * every section to declare which of the two it is.
   */
  'loader',
  'hooks',
] as const

/** Cost levels of a component. */
export const PERF_TIERS = ['light', 'medium', 'heavy'] as const

/** Declarable graphics backends. */
export const GL_BACKENDS = ['ogl', 'three'] as const

/** Nature of the visual fallback of a component. */
export const FALLBACKS = ['poster', 'gradient', 'static', 'none'] as const

/** A file copied into the user project. */
const fileSchema = z.object({
  /** Path inside the component directory. */
  path: z.string().check(z.minLength(1)),
  /**
   * Destination in the project, relative to the components alias. Absolute
   * paths and climbs are refused: the CLI writes into the user project, and an
   * unbounded path would be an open door.
   */
  target: z.string().check(
    z.minLength(1),
    z.refine((value: string) => !value.startsWith('/') && !value.includes('..'), {
      error: 'The destination must stay relative and must not climb up the tree.',
    }),
  ),
})

/** What a component asks of the engine. */
const engineSchema = z.object({
  /**
   * Orchestration plugins required. `core` designates the base library, always
   * present with the engine.
   */
  gsap: z._default(z.array(z.string().check(z.minLength(1))), []),
  /** Graphics backend required, or `false` when the component asks for none. */
  gl: z._default(z.union([z.literal(false), z.enum(GL_BACKENDS)]), false),
})

/** A property exposed by the component. */
const propSchema = z.object({
  /** Name of the property. */
  name: z.string().check(z.minLength(1)),
  /** TypeScript type, as it will be shown in the documentation. */
  type: z.string().check(z.minLength(1)),
  /** Mandatory or not. @defaultValue false */
  required: z._default(z.boolean(), false),
  /** Default value, in source form. */
  default: z.optional(z.union([z.string(), z.number(), z.boolean()])),
  /**
   * Unit of the value. Durations are **always** in milliseconds: that is a rule
   * of the registry, not a local convention.
   */
  unit: z.optional(z.string()),
  /** Explanation shown in the properties table. */
  description: z.optional(z.string()),
  /**
   * Bounds of a numeric setting.
   *
   * They serve the documentation, which makes a slider out of them. Without
   * them, the page would have to redeclare what the meta already knows — and
   * the two would diverge at the first change of default value.
   */
  min: z.optional(z.number()),
  max: z.optional(z.number()),
  step: z.optional(z.number()),
  /** Possible values of a choice setting. */
  options: z.optional(z.array(z.string())),
})

/** Cost of the component. */
const perfSchema = z.object({
  /** Cost level. */
  tier: z.enum(PERF_TIERS),
  /** Graphics backend used, when there is one. */
  backend: z._default(z.union([z.literal(false), z.enum(GL_BACKENDS)]), false),
  /** Remarks shown in the documentation. */
  notes: z.optional(z.string()),
  /**
   * Nature of the visual fallback. Mandatory for an expensive component: the
   * fallback is part of the component, not of its documentation.
   */
  fallback: z.optional(z.enum(FALLBACKS)),
})

/** Shape of an entry, before the rules that cross several fields. */
const baseSchema = z.object({
  /** Identifier, unique within its category. */
  name: z.string().check(
    z.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: 'The name must be lowercase, with dashes as separators.',
    }),
  ),
  /** Category. */
  category: z.enum(CATEGORIES),
  /** Displayed title. */
  title: z.string().check(z.minLength(1)),
  /** Displayed description, in one sentence. */
  description: z.string().check(z.minLength(1)),
  /** What the component asks of the engine. */
  engine: z._default(engineSchema, { gsap: [], gl: false }),
  /** Files copied into the user project. At least one. */
  files: z.array(fileSchema).check(z.minLength(1)),
  /** npm packages to install. */
  dependencies: z._default(z.array(z.string().check(z.minLength(1))), []),
  /**
   * Other registry entries this one depends on, in the form `category/name`.
   */
  registryDependencies: z._default(
    z.array(
      z.string().check(
        z.regex(/^[a-z]+\/[a-z0-9]+(-[a-z0-9]+)*$/, {
          error: 'A registry dependency is written "category/name".',
        }),
      ),
    ),
    [],
  ),
  /** CSS variables the component consumes. */
  tokens: z._default(z.array(z.string().check(z.startsWith('--o-'))), []),
  /** Properties exposed. */
  props: z._default(z.array(propSchema), []),
  /** Cost of the component. */
  perf: perfSchema,
})

/** An entry as it comes out of the validation. */
export type RegistryMeta = z.infer<typeof baseSchema>

/** Entry as it is written in a `meta.json`, before default values. */
export type RegistryMetaInput = z.input<typeof baseSchema>

/**
 * Complete description of a registry entry.
 *
 * The rules that cross several fields are checked here rather than in the
 * validation script: they are part of the format, and a third-party registry
 * reusing this schema must be subject to them too.
 */
export const metaSchema = baseSchema.check(
  z.check<RegistryMeta>((payload) => {
    const meta = payload.value

    // An expensive component without a fallback leaves an empty rectangle while
    // loading, on slow devices and in reduced motion. The fallback is part of
    // the component.
    if (meta.perf.tier === 'heavy' && (meta.perf.fallback ?? 'none') === 'none') {
      payload.issues.push({
        code: 'custom',
        input: meta,
        path: ['perf', 'fallback'],
        message:
          'A high-cost component must declare a visual fallback: it is shown while loading, without WebGL, and in reduced motion.',
      })
    }

    // Declaring one backend on one side and another on the other amounts to
    // lying to the CLI, which uses it to warn about the extra cost before
    // installing.
    if (meta.perf.backend !== false && meta.engine.gl !== meta.perf.backend) {
      payload.issues.push({
        code: 'custom',
        input: meta,
        path: ['perf', 'backend'],
        message: `The backend declared in "perf" (${String(meta.perf.backend)}) does not match the one of "engine" (${String(meta.engine.gl)}).`,
      })
    }

    // A 3D scene is the expensive case par excellence: classing it otherwise
    // would disable the safeguards of the CLI and of the surface arbiter.
    if (meta.engine.gl === 'three' && meta.perf.tier !== 'heavy') {
      payload.issues.push({
        code: 'custom',
        input: meta,
        path: ['perf', 'tier'],
        message: 'A component using a 3D scene is necessarily of high cost.',
      })
    }

    // Two files written to the same place: the second would erase the first
    // without anything reporting it.
    const targets = meta.files.map((file) => file.target)
    const duplicates = targets.filter(
      (target, index) => targets.indexOf(target) !== index,
    )
    if (duplicates.length > 0) {
      payload.issues.push({
        code: 'custom',
        input: meta,
        path: ['files'],
        message: `Several files target the same destination: ${[...new Set(duplicates)].join(', ')}.`,
      })
    }
  }),
)

/** Full identifier of an entry, in the form `category/name`. */
export function entryId(meta: Pick<RegistryMeta, 'category' | 'name'>): string {
  return `${meta.category}/${meta.name}`
}

/** A published entry, source code inlined. */
export interface PublishedEntry extends RegistryMeta {
  /** Full identifier. */
  readonly id: string
  /** Content of the files, indexed by their path inside the component. */
  readonly sources: Readonly<Record<string, string>>
}

/** Summary of an entry, as it appears in the index. */
export interface IndexEntry {
  readonly id: string
  readonly name: string
  readonly category: (typeof CATEGORIES)[number]
  readonly title: string
  readonly description: string
  readonly tier: (typeof PERF_TIERS)[number]
  readonly backend: false | (typeof GL_BACKENDS)[number]
  readonly registryDependencies: readonly string[]
}

/** Index of the registry, served at the root. */
export interface RegistryIndex {
  /** Version of the format, so that the client knows whether it can read it. */
  readonly version: 1
  /** Generation date, in ISO 8601. */
  readonly generatedAt: string
  /** Summary of each entry, without the source code. */
  readonly entries: readonly IndexEntry[]
}

/**
 * Validates an entry and returns readable messages on failure.
 *
 * The raw messages are exact but dry: they are reformatted as path plus
 * explanation, so that a component author knows what to fix without having to
 * read the schema.
 *
 * @example
 * const result = parseMeta(JSON.parse(raw), 'text/split-reveal')
 * if (!result.ok) console.error(result.problems.join('\n'))
 */
export function parseMeta(
  value: unknown,
  origin: string,
): { ok: true; meta: RegistryMeta } | { ok: false; problems: string[] } {
  const result = z.safeParse(metaSchema, value)
  if (result.success) return { ok: true, meta: result.data }

  return {
    ok: false,
    problems: result.error.issues.map((issue) => {
      const path =
        issue.path.length === 0 ? origin : `${origin} → ${issue.path.join('.')}`
      return `${path} : ${issue.message}`
    }),
  }
}
