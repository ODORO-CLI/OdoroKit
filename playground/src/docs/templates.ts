/**
 * La bibliotheque de templates.
 *
 * ## Ce qu'un template est, et ce qu'il n'est pas
 *
 * Une entree du registre est une **piece** : un fond, un bouton, une section.
 * On l'ajoute a un projet qui existe deja.
 *
 * Un template est un **projet entier** : ses routes, sa configuration, ses
 * pages, ses pieces deja cablees. On ne l'ajoute pas, on part de lui.
 *
 * Les deux ne se rangent donc pas ensemble, et c'est pourquoi cette liste vit a
 * cote du registre plutot que dedans. Un visiteur qui cherche « un site
 * d'agence » ne cherche pas la meme chose que celui qui cherche « un bouton qui
 * brille », et les melanger obligerait chacun a filtrer l'autre.
 *
 * ## Pourquoi une liste ecrite a la main
 *
 * Le registre se compile depuis l'arborescence : il ne peut ni oublier une
 * entree ni en inventer. Les templates, eux, sont des dossiers du paquet `odoro`
 * — `templates/<nom>` — et rien ne les decrit. Cette liste est donc la source,
 * et le controle de coherence ci-dessous verifie qu'elle ne promet pas un
 * template que la CLI ne saurait pas echafauder.
 *
 * @module
 */

/** L'etat d'un template. */
export type TemplateStatus =
  /** Livre : la commande fonctionne aujourd'hui. */
  | 'disponible'
  /** Annonce : la commande ne fonctionne pas encore. */
  | 'a-venir'

/** Un template de la bibliotheque. */
export interface Template {
  /** Segment d'URL, et nom passe a `--template`. */
  readonly slug: string
  readonly title: string
  /** Une phrase : a quoi ce template sert. */
  readonly description: string
  /** Ce qu'il embarque, pour situer sans avoir a l'installer. */
  readonly includes: readonly string[]
  readonly status: TemplateStatus
  /** Ce pour quoi il est fait, en deux mots. */
  readonly audience?: string
}

/**
 * Les templates, dans l'ordre d'affichage.
 *
 * Seuls ceux marques `disponible` correspondent a un dossier reel du paquet
 * `odoro`. Les autres sont annonces, et la page le dit — promettre une commande
 * qui echoue est la seule chose qu'une vitrine ne doit jamais faire.
 */
export const TEMPLATES: readonly Template[] = [
  {
    slug: 'react-ts',
    title: 'React + TypeScript',
    description:
      'Le socle : routeur, styles, moteur d’animation, et trois pages pour montrer comment ils s’articulent.',
    includes: ['Routeur maison', 'Feuille de styles generee', 'Moteur d animation', 'Trois pages'],
    status: 'disponible',
    audience: 'Un site a construire de zero',
  },
  {
    slug: 'react-ts-server',
    title: 'React + TypeScript + serveur',
    description:
      'Le même socle, avec le serveur : rendu côté serveur, routes d’API, et le necessaire pour deployer.',
    includes: ['Tout de react-ts', 'Rendu cote serveur', 'Routes d API', 'Configuration de deploiement'],
    status: 'disponible',
    audience: 'Un site qui a besoin d un serveur',
  },
]

/** Un template, par son segment. */
export function templateBySlug(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug)
}

/** Ceux qui s installent aujourd'hui. */
export function availableTemplates(): readonly Template[] {
  return TEMPLATES.filter((t) => t.status === 'disponible')
}

/** La commande qui echafaude un template. */
export function scaffoldCommand(template: Template, projet = 'mon-site'): string {
  return `odoro create ${projet} --template ${template.slug}`
}
