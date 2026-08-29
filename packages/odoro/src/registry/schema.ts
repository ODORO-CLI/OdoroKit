/**
 * Format d'une entree de registre.
 *
 * ## Pourquoi le schema vit ici
 *
 * Le format est un **contrat** entre le registre qui publie et le client qui
 * telecharge. Le placer du cote client n'est pas arbitraire : c'est la ou la
 * validation compte le plus. Le registre valide ce qu'il produit avant de le
 * publier ; le client, lui, valide ce qu'il recoit d'un serveur qu'il ne
 * controle pas, juste avant d'ecrire des fichiers dans le projet de
 * l'utilisateur.
 *
 * Une seule definition, donc, employee aux deux bouts.
 *
 * ## Le poids de la validation
 *
 * Deux decisions, mesurees plutot que supposees.
 *
 * La bibliotheque est **integree a la compilation** plutot que declaree en
 * dependance : installee, elle pese pres de six megaoctets, alors que la
 * surface reellement employee en represente une fraction.
 *
 * Et c'est sa variante concue pour le decoupage qui est employee, non son API
 * usuelle : la premiere produit treize kilo-octets minifies, la seconde quatre
 * cent vingt-sept. Un facteur trente-trois pour la meme validation. L'ecriture
 * y est plus verbeuse — les controles sont des fonctions plutot que des
 * methodes chainees — mais plaider le poids pour le moteur graphique et
 * l'ignorer ici serait incoherent.
 *
 * @module
 */

import * as z from 'zod/mini'

/** Categories de composants du registre. */
export const CATEGORIES = [
  'text',
  'background',
  'effect',
  'hero',
  'ui',
  'section',
  'hooks',
] as const

/** Niveaux de cout d'un composant. */
export const PERF_TIERS = ['light', 'medium', 'heavy'] as const

/** Backends graphiques declarables. */
export const GL_BACKENDS = ['ogl', 'three'] as const

/** Nature du repli visuel d'un composant. */
export const FALLBACKS = ['poster', 'gradient', 'static', 'none'] as const

/** Un fichier copie chez l'utilisateur. */
const fileSchema = z.object({
  /** Chemin dans le dossier du composant. */
  path: z.string().check(z.minLength(1)),
  /**
   * Destination dans le projet, relative a l'alias de composants. Les chemins
   * absolus et les remontees sont refuses : la CLI ecrit chez l'utilisateur,
   * et un chemin non borne y serait une porte ouverte.
   */
  target: z.string().check(
    z.minLength(1),
    z.refine((value: string) => !value.startsWith('/') && !value.includes('..'), {
      error:
        'La destination doit rester relative et ne pas remonter dans l arborescence.',
    }),
  ),
})

/** Ce qu'un composant demande au moteur. */
const engineSchema = z.object({
  /**
   * Plugins d'orchestration requis. `core` designe la bibliotheque de base,
   * toujours presente avec le moteur.
   */
  gsap: z._default(z.array(z.string().check(z.minLength(1))), []),
  /** Backend graphique requis, ou `false` si le composant n'en demande aucun. */
  gl: z._default(z.union([z.literal(false), z.enum(GL_BACKENDS)]), false),
})

/** Une propriete exposee par le composant. */
const propSchema = z.object({
  /** Nom de la propriete. */
  name: z.string().check(z.minLength(1)),
  /** Type TypeScript, tel qu'il sera affiche dans la documentation. */
  type: z.string().check(z.minLength(1)),
  /** Obligatoire ou non. @defaultValue false */
  required: z._default(z.boolean(), false),
  /** Valeur par defaut, en representation source. */
  default: z.optional(z.union([z.string(), z.number(), z.boolean()])),
  /**
   * Unite de la valeur. Les durees sont **toujours** en millisecondes : c'est
   * une regle du registre, pas une convention locale.
   */
  unit: z.optional(z.string()),
  /** Explication affichee dans la table des proprietes. */
  description: z.optional(z.string()),
})

/** Cout du composant. */
const perfSchema = z.object({
  /** Niveau de cout. */
  tier: z.enum(PERF_TIERS),
  /** Backend graphique employe, s'il y en a un. */
  backend: z._default(z.union([z.literal(false), z.enum(GL_BACKENDS)]), false),
  /** Remarques affichees dans la documentation. */
  notes: z.optional(z.string()),
  /**
   * Nature du repli visuel. Obligatoire pour un composant couteux : le repli
   * fait partie du composant, pas de sa documentation.
   */
  fallback: z.optional(z.enum(FALLBACKS)),
})

/** Forme d'une entree, avant les regles qui croisent plusieurs champs. */
const baseSchema = z.object({
  /** Identifiant, unique dans sa categorie. */
  name: z.string().check(
    z.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: 'Le nom doit etre en minuscules, avec des tirets pour separateurs.',
    }),
  ),
  /** Categorie. */
  category: z.enum(CATEGORIES),
  /** Titre affiche. */
  title: z.string().check(z.minLength(1)),
  /** Description affichee, en une phrase. */
  description: z.string().check(z.minLength(1)),
  /** Ce que le composant demande au moteur. */
  engine: z._default(engineSchema, { gsap: [], gl: false }),
  /** Fichiers copies chez l'utilisateur. Au moins un. */
  files: z.array(fileSchema).check(z.minLength(1)),
  /** Paquets npm a installer. */
  dependencies: z._default(z.array(z.string().check(z.minLength(1))), []),
  /**
   * Autres entrees du registre dont celle-ci depend, sous la forme
   * `categorie/nom`.
   */
  registryDependencies: z._default(
    z.array(
      z.string().check(
        z.regex(/^[a-z]+\/[a-z0-9]+(-[a-z0-9]+)*$/, {
          error: 'Une dependance de registre s ecrit "categorie/nom".',
        }),
      ),
    ),
    [],
  ),
  /** Variables CSS que le composant consomme. */
  tokens: z._default(z.array(z.string().check(z.startsWith('--o-'))), []),
  /** Proprietes exposees. */
  props: z._default(z.array(propSchema), []),
  /** Cout du composant. */
  perf: perfSchema,
})

/** Une entree telle qu'elle sort de la validation. */
export type RegistryMeta = z.infer<typeof baseSchema>

/** Entree telle qu'elle est ecrite dans un `meta.json`, avant valeurs par defaut. */
export type RegistryMetaInput = z.input<typeof baseSchema>

/**
 * Description complete d'une entree de registre.
 *
 * Les regles qui croisent plusieurs champs sont verifiees ici plutot que dans
 * le script de validation : elles font partie du format, et un registre tiers
 * qui reutiliserait ce schema doit les subir aussi.
 */
export const metaSchema = baseSchema.check(
  z.check<RegistryMeta>((payload) => {
    const meta = payload.value

    // Un composant couteux sans repli laisse un rectangle vide pendant le
    // chargement, sur les appareils lents et en mouvement reduit. Le repli
    // fait partie du composant.
    if (meta.perf.tier === 'heavy' && (meta.perf.fallback ?? 'none') === 'none') {
      payload.issues.push({
        code: 'custom',
        input: meta,
        path: ['perf', 'fallback'],
        message:
          'Un composant de cout eleve doit declarer un repli visuel : il est affiche pendant le chargement, sans WebGL, et en mouvement reduit.',
      })
    }

    // Declarer un backend d'un cote et un autre de l'autre revient a mentir a
    // la CLI, qui s'en sert pour avertir du surcout avant d'installer.
    if (meta.perf.backend !== false && meta.engine.gl !== meta.perf.backend) {
      payload.issues.push({
        code: 'custom',
        input: meta,
        path: ['perf', 'backend'],
        message: `Le backend declare dans "perf" (${String(meta.perf.backend)}) ne correspond pas a celui de "engine" (${String(meta.engine.gl)}).`,
      })
    }

    // Une scene 3D est le cas couteux par excellence : la classer autrement
    // desactiverait les garde-fous de la CLI et de l'arbitre de surfaces.
    if (meta.engine.gl === 'three' && meta.perf.tier !== 'heavy') {
      payload.issues.push({
        code: 'custom',
        input: meta,
        path: ['perf', 'tier'],
        message: 'Un composant employant une scene 3D est necessairement de cout eleve.',
      })
    }

    // Deux fichiers ecrits au meme endroit : le second effacerait le premier
    // sans que rien ne le signale.
    const targets = meta.files.map((file) => file.target)
    const duplicates = targets.filter(
      (target, index) => targets.indexOf(target) !== index,
    )
    if (duplicates.length > 0) {
      payload.issues.push({
        code: 'custom',
        input: meta,
        path: ['files'],
        message: `Plusieurs fichiers visent la meme destination : ${[...new Set(duplicates)].join(', ')}.`,
      })
    }
  }),
)

/** Identifiant complet d'une entree, sous la forme `categorie/nom`. */
export function entryId(meta: Pick<RegistryMeta, 'category' | 'name'>): string {
  return `${meta.category}/${meta.name}`
}

/** Une entree publiee, code source inline. */
export interface PublishedEntry extends RegistryMeta {
  /** Identifiant complet. */
  readonly id: string
  /** Contenu des fichiers, indexe par leur chemin dans le composant. */
  readonly sources: Readonly<Record<string, string>>
}

/** Resume d'une entree, tel qu'il figure dans l'index. */
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

/** Index du registre, servi a la racine. */
export interface RegistryIndex {
  /** Version du format, pour que le client sache s'il sait lire. */
  readonly version: 1
  /** Date de generation, en ISO 8601. */
  readonly generatedAt: string
  /** Resume de chaque entree, sans le code source. */
  readonly entries: readonly IndexEntry[]
}

/**
 * Valide une entree et rend des messages lisibles en cas d'echec.
 *
 * Les messages bruts sont exacts mais arides : ils sont reformates en chemin
 * plus explication, pour qu'un auteur de composant sache quoi corriger sans
 * avoir a lire le schema.
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
