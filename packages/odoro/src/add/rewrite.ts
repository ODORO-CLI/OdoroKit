/**
 * Reecriture des imports d'un composant au moment de la copie.
 *
 * ## Le jeton `@registre`
 *
 * Un composant du registre importe parfois son voisin : un effet a besoin du
 * hook de repli, un heros a besoin du pointeur amorti. Ces imports ne peuvent
 * pas etre ecrits en dur, puisque la destination depend du projet d'accueil —
 * `@/odoro`, `~/components/odoro`, ou un chemin nu si le projet n'a pas
 * d'alias.
 *
 * Les sources du registre ecrivent donc `@registre/hooks/usePoster`, et la CLI
 * remplace le prefixe a l'ecriture. Le jeton est volontairement impossible a
 * confondre avec un vrai paquet : il ne resout nulle part, donc un composant
 * qui l'aurait garde par accident echoue a la compilation plutot que de
 * chercher sur le registre npm.
 *
 * ## Ce qui n'est pas reecrit
 *
 * Tout le reste. `@odoro/engine`, `react`, `gsap`, `three` sont de vrais
 * paquets : ils s'installent, ils ne se copient pas. Le seul chemin reecrit
 * est celui qui pointe vers un autre fichier copie.
 *
 * @module
 */

/** Prefixe employe dans les sources du registre. */
export const REGISTRY_TOKEN = '@registre'

/**
 * Remplace le jeton de registre par le prefixe d'import du projet.
 *
 * La substitution porte sur le jeton suivi d'une barre oblique, pas sur le
 * jeton seul : sans cela, un paquet nomme `@registre-truc` serait touche.
 *
 * @param source Code source tel qu'il vient du registre.
 * @param importPrefix Prefixe du projet, sans barre finale.
 *
 * @example
 * rewriteImports("import { usePoster } from '@registre/hooks/usePoster'", '@/odoro')
 * // "import { usePoster } from '@/odoro/hooks/usePoster'"
 */
export function rewriteImports(source: string, importPrefix: string): string {
  const prefix = importPrefix.replace(/\/$/, '')
  return source.split(`${REGISTRY_TOKEN}/`).join(`${prefix}/`)
}

/**
 * Liste les entrees de registre qu'un code source importe reellement.
 *
 * Sert au diagnostic : une entree qui importe un voisin sans le declarer dans
 * ses `registryDependencies` s'installera seule, et cassera chez le premier
 * utilisateur qui n'avait pas deja le voisin.
 *
 * Le decoupage est textuel, et c'est assume : un analyseur complet serait plus
 * exact, mais il n'y a rien a gagner ici — le resultat sert a **avertir**, pas
 * a decider. Une occurrence dans un commentaire produit un avertissement de
 * trop ; un import manque produirait un composant casse.
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
