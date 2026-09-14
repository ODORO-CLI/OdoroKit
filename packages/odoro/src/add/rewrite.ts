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
 * Tout le reste. `@odoro-cli/engine`, `react`, `gsap`, `three` sont de vrais
 * paquets : ils s'installent, ils ne se copient pas. Le seul chemin reecrit
 * est celui qui pointe vers un autre fichier copie.
 *
 * @module
 */

/** Prefixe employe dans les sources du registre. */
export const REGISTRY_TOKEN = '@registre'

/**
 * Le prefixe configure est-il un alias, ou un simple chemin ?
 *
 * ## Pourquoi la question se pose
 *
 * `odoro init` lit l'alias du `tsconfig.json` — `@/odoro`, `~/composants/odoro`.
 * Quand le projet n'en a aucun, il retombait sur le chemin lui-meme,
 * `src/odoro`, et les imports s'ecrivaient `from 'src/odoro/hooks/useInView'`.
 *
 * Un tel chemin n'est pas un specificateur valide : il ne commence ni par un
 * point ni par une barre, donc il est cherche parmi les paquets, ou il n'existe
 * pas. Le projet ne compilait pas, avec une erreur de module introuvable que
 * rien ne rattachait au registre.
 *
 * Il ne fonctionnait que par accident, dans les projets portant un `baseUrl`
 * au `tsconfig.json` — lequel a ses propres ennuis, puisqu'il fait resoudre
 * les imports nus depuis la racine du projet.
 *
 * ## La regle
 *
 * Les alias commencent par `@`, `~` ou `#` — les trois conventions employees
 * par TypeScript, les gestionnaires de paquets et les imports internes de Node.
 * Tout le reste est un chemin, et un chemin s'ecrit en relatif.
 *
 * Le relatif n'est jamais faux : il resout sans configuration, quel que soit le
 * `tsconfig.json`. Un projet qui a un alias garde le sien, plus lisible ; les
 * autres obtiennent quelque chose qui marche.
 *
 * @example
 * estUnAlias('@/odoro')   // true
 * estUnAlias('src/odoro') // false
 */
export function estUnAlias(prefix: string): boolean {
  return /^[@~#]/.test(prefix)
}

/**
 * Chemin relatif d'un fichier copie vers un autre, tous deux dans le dossier
 * de destination.
 *
 * Les deux chemins sont donnes par rapport a ce dossier, si bien que la racine
 * du projet n'entre pas dans le calcul : `text/CountUp.tsx` qui vise
 * `hooks/useInView` obtient `../hooks/useInView`.
 *
 * @example
 * cheminRelatif('text/CountUp.tsx', 'hooks/useInView') // '../hooks/useInView'
 * cheminRelatif('text/CountUp.tsx', 'text/Autre')      // './Autre'
 */
export function cheminRelatif(depuis: string, vers: string): string {
  const segmentsDepuis = depuis.split('/').slice(0, -1)
  const segmentsVers = vers.split('/')

  let commun = 0
  while (
    commun < segmentsDepuis.length &&
    commun < segmentsVers.length - 1 &&
    segmentsDepuis[commun] === segmentsVers[commun]
  ) {
    commun += 1
  }

  const montees = segmentsDepuis.length - commun
  const descente = segmentsVers.slice(commun).join('/')

  // Un chemin relatif doit s'annoncer comme tel : sans `./`, un voisin dans le
  // meme dossier redeviendrait un specificateur nu.
  return montees === 0 ? `./${descente}` : `${'../'.repeat(montees)}${descente}`
}

/**
 * Remplace le jeton de registre par le prefixe d'import du projet.
 *
 * La substitution porte sur le jeton suivi d'une barre oblique, pas sur le
 * jeton seul : sans cela, un paquet nomme `@registre-truc` serait touche.
 *
 * Quand le prefixe n'est pas un alias — voir `estUnAlias` — les imports sont
 * ecrits en relatif depuis `target`. C'est le seul cas ou la destination du
 * fichier compte, et c'est aussi le seul ou le prefixe ne resoudrait pas.
 *
 * @param source Code source tel qu'il vient du registre.
 * @param importPrefix Prefixe du projet, sans barre finale.
 * @param target Destination du fichier, relative au dossier des composants.
 * Sans elle, la substitution par prefixe s'applique quoi qu'il arrive.
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

  if (estUnAlias(prefix) || target === undefined) {
    return source.split(`${REGISTRY_TOKEN}/`).join(`${prefix}/`)
  }

  // Le jeton va jusqu'au guillemet fermant : c'est la fin du specificateur, et
  // rien d'autre dans la ligne ne doit etre touche.
  return source.replaceAll(
    new RegExp(`${REGISTRY_TOKEN}/([^'"\\s]+)`, 'g'),
    (_tout, chemin: string) => cheminRelatif(target, chemin),
  )
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
