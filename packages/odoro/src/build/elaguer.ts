/**
 * L'elagage de la feuille de style.
 *
 * ## Le probleme
 *
 * La bibliotheque livre une feuille pre-generee qui contient **toutes** les
 * classes utilitaires possibles — plusieurs milliers. Une application donnee en
 * emploie une fraction : mesure faite sur le gestionnaire de bases, 251 sur
 * 2 446, soit un peu plus de dix pour cent. Le reste part quand meme, a chaque
 * premiere visite.
 *
 * ## L'elagage a lieu apres le regroupement, pas avant
 *
 * C'est la decision qui porte tout le module, et c'est celle qui est facile a
 * rater.
 *
 * Une classe utilitaire ne vient pas seulement du code de l'application. Les
 * composants de la bibliotheque — un bouton, un champ, une alerte — portent les
 * leurs, et ces classes sont dans leur JavaScript **deja compile**. Une
 * application peut n'ecrire aucune classe utilitaire et en dependre de deux
 * cent cinquante par ses composants.
 *
 * Lire la source de l'application seule elaguerait donc tout ce dont ses
 * composants ont besoin, et l'interface arriverait sans style — sans qu'aucune
 * erreur ne soit levee, puisque du CSS absent ne casse rien, il ne peint rien.
 *
 * L'elagage lit donc ce qui **part reellement** : le JavaScript produit par le
 * regroupement, et le document. Ce qui n'y figure sous aucune forme n'est
 * atteignable par personne.
 *
 * ## Ce qui n'est jamais elague
 *
 * Une regle dont le selecteur ne mentionne aucune classe prefixee est gardee
 * sans condition : les variables de `:root`, la remise a zero, les regles sur
 * `body` ou `*`, et les classes semantiques que l'application ecrit elle-meme.
 *
 * La regle est volontairement prudente d'un seul cote. Garder de trop coute des
 * octets ; retirer de trop casse l'affichage, et le defaut ne se voit qu'a
 * l'oeil, page par page.
 *
 * ## Les classes construites a l'execution
 *
 * Une classe assemblee — `o-text-${couleur}` — n'existe nulle part sous sa
 * forme finale, et aucun analyseur ne peut la deviner. Elle disparaitra.
 *
 * C'est la limite du procede, elle est la meme chez tous ceux qui le
 * pratiquent, et la reponse est la meme : une liste de sauvegarde, declaree
 * dans la configuration. Le module ne cherche pas a etre plus malin, parce
 * qu'un analyseur qui devine juste neuf fois sur dix produit un defaut qui
 * n'apparait que sur la dixieme page.
 *
 * @module
 */

/* -------------------------------------------------------------------------- */
/* L'analyse du CSS                                                           */
/* -------------------------------------------------------------------------- */

/** Un noeud de la feuille. */
type Noeud =
  | { readonly sorte: 'regle'; readonly selecteur: string; readonly corps: string }
  | {
      readonly sorte: 'groupe'
      readonly prelude: string
      readonly enfants: readonly Noeud[]
    }
  | { readonly sorte: 'brut'; readonly texte: string }

/**
 * Les regles a groupe, dont le corps contient d'autres regles.
 *
 * `@keyframes` n'en fait volontairement pas partie : son corps ressemble a des
 * regles (`from`, `50%`) mais n'en est pas, et le traverser reviendrait a
 * elaguer des etapes d'animation en croyant elaguer des utilitaires.
 */
const GROUPES = new Set(['media', 'supports', 'layer', 'container', 'scope'])

/**
 * Decoupe du CSS en noeuds.
 *
 * Ecrit a la main plutot qu'en expressions regulieres : une accolade dans une
 * chaine (`content: "}"`), dans un commentaire ou dans une URL suffit a faire
 * deraper un decoupage naif, et le resultat est une feuille tronquee au milieu
 * d'une regle.
 */
function analyser(css: string): readonly Noeud[] {
  const noeuds: Noeud[] = []
  let i = 0
  let debut = 0

  /** Avance d'un caractere en sautant chaines, commentaires et echappements. */
  function avancer(): void {
    const c = css[i] as string

    if (c === '\\') {
      i += 2
      return
    }

    if (c === '/' && css[i + 1] === '*') {
      const fin = css.indexOf('*/', i + 2)
      i = fin === -1 ? css.length : fin + 2
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
      const prelude = css.slice(debut, i).trim()

      // Le corps, par comptage d'accoudes — en sautant chaines et commentaires.
      let profondeur = 1
      i += 1
      const debutCorps = i

      while (i < css.length && profondeur > 0) {
        const d = css[i]
        if (d === '{') {
          profondeur += 1
          i += 1
        } else if (d === '}') {
          profondeur -= 1
          i += 1
        } else {
          avancer()
        }
      }

      const corps = css.slice(debutCorps, i - 1)

      if (prelude.startsWith('@')) {
        const nom = /^@([a-zA-Z-]+)/.exec(prelude)?.[1] ?? ''
        noeuds.push(
          GROUPES.has(nom)
            ? { sorte: 'groupe', prelude, enfants: analyser(corps) }
            : // `@keyframes`, `@font-face`, `@property` : recopies tels quels.
              { sorte: 'brut', texte: `${prelude}{${corps}}` },
        )
      } else if (prelude.length > 0) {
        noeuds.push({ sorte: 'regle', selecteur: prelude, corps })
      }

      debut = i
      continue
    }

    if (c === ';' && css.slice(debut, i).trim().startsWith('@')) {
      // Une regle sans corps : `@import`, `@charset`.
      noeuds.push({ sorte: 'brut', texte: `${css.slice(debut, i).trim()};` })
      i += 1
      debut = i
      continue
    }

    avancer()
  }

  return noeuds
}

/** Reassemble des noeuds en CSS. */
function ecrire(noeuds: readonly Noeud[]): string {
  return noeuds
    .map((n) => {
      if (n.sorte === 'brut') return n.texte
      if (n.sorte === 'regle') return `${n.selecteur}{${n.corps}}`
      return `${n.prelude}{${ecrire(n.enfants)}}`
    })
    .join('\n')
}

/* -------------------------------------------------------------------------- */
/* Les classes                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Les classes d'un selecteur, telles qu'elles s'ecrivent dans un attribut.
 *
 * Le CSS echappe ce qu'un nom de classe ne peut pas porter tel quel :
 * `.sm\:o-block` designe la classe `sm:o-block`, `.o-w-1\/2` la classe
 * `o-w-1/2`. Comparer sans desechapper ne trouverait jamais la moindre
 * correspondance — et l'elagage retirerait tout.
 */
export function classesDe(selecteur: string): readonly string[] {
  const classes: string[] = []
  const motif = /(?<!\\)\.((?:\\.|[\w-])+)/g

  for (const trouve of selecteur.matchAll(motif)) {
    classes.push((trouve[1] as string).replaceAll(/\\(.)/g, '$1'))
  }

  return classes
}

/**
 * Les mots que le code produit contient, et qui pourraient etre des classes.
 *
 * Volontairement grossier : on ne cherche pas a comprendre le JavaScript, on en
 * extrait tout ce qui a la forme d'un nom de classe. Un faux positif garde une
 * regle de trop — quelques octets. Un faux negatif retire un style — un defaut
 * visuel qu'on ne trouve qu'a l'oeil.
 */
export function motsDe(texte: string): Set<string> {
  const mots = new Set<string>()
  // Les caracteres qu'un nom de classe utilitaire peut porter, variantes
  // comprises : `hover:o-bg-x`, `o-w-1/2`, `o-p-[3px]`.
  const motif = /[A-Za-z0-9_][A-Za-z0-9_:/.[\]%@-]*/g

  for (const trouve of texte.matchAll(motif)) mots.add(trouve[0])

  return mots
}

/* -------------------------------------------------------------------------- */
/* L'elagage                                                                  */
/* -------------------------------------------------------------------------- */

/** Ce qu'un elagage rapporte. */
export interface RapportElagage {
  readonly css: string
  readonly octetsAvant: number
  readonly octetsApres: number
  /** Les classes prefixees gardees. */
  readonly gardees: number
  /** Celles que la feuille definissait sans que rien ne les emploie. */
  readonly retirees: number
}

/** De quoi elaguer. */
export interface OptionsElagage {
  /** Le prefixe des classes elaguables. @defaultValue 'o-' */
  readonly prefixe?: string
  /**
   * Des classes gardees quoi qu'il arrive.
   *
   * Pour celles qui sont assemblees a l'execution, qu'aucun analyseur ne peut
   * voir. Une chaine garde une classe ; une expression reguliere en garde
   * toutes celles qu'elle reconnait.
   */
  readonly sauvegarde?: readonly (string | RegExp)[]
}

/** Une classe est-elle prefixee, variantes comprises ? */
function estUtilitaire(classe: string, prefixe: string): boolean {
  // `o-flex`, mais aussi `sm:o-flex` et `dark:hover:o-flex`.
  const nue = classe.slice(classe.lastIndexOf(':') + 1)
  return nue.startsWith(prefixe)
}

/** Cette classe survit-elle ? */
function gardee(
  classe: string,
  employes: ReadonlySet<string>,
  sauvegarde: readonly (string | RegExp)[],
): boolean {
  if (employes.has(classe)) return true

  for (const regle of sauvegarde) {
    if (typeof regle === 'string' ? regle === classe : regle.test(classe)) return true
  }

  return false
}

/**
 * Retire de la feuille les utilitaires que rien n'emploie.
 *
 * @param css La feuille complete.
 * @param sources Le code qui part reellement — le JavaScript produit par le
 *   regroupement et le document. **Pas** la source de l'application : les
 *   classes des composants de bibliotheque n'y figurent pas.
 *
 * @example
 * const rapport = elaguer(css, [jsProduit, html], { sauvegarde: [/^o-text-/] })
 */
export function elaguer(
  css: string,
  sources: readonly string[],
  options: OptionsElagage = {},
): RapportElagage {
  const prefixe = options.prefixe ?? 'o-'
  const sauvegarde = options.sauvegarde ?? []

  const employes = new Set<string>()
  for (const source of sources) {
    for (const mot of motsDe(source)) employes.add(mot)
  }

  const vues = new Set<string>()
  const survivantes = new Set<string>()

  /** Ne garde, dans une liste de selecteurs, que ceux qui survivent. */
  function filtrerSelecteur(selecteur: string): string | undefined {
    const retenus = decouperSelecteurs(selecteur).filter((un) => {
      const utilitaires = classesDe(un).filter((c) => estUtilitaire(c, prefixe))

      // Aucun utilitaire : ce n'est pas une regle generee. Variables,
      // remise a zero, classes semantiques de l'application — on n'y touche
      // pas, et c'est ce qui rend l'elagage sur.
      if (utilitaires.length === 0) return true

      for (const classe of utilitaires) vues.add(classe)

      // Toutes doivent survivre : `.o-a.o-b` ne s'applique qu'aux elements qui
      // portent les deux, et garder la regle sans que `o-b` existe serait
      // garder du poids inutile.
      const survit = utilitaires.every((c) => gardee(c, employes, sauvegarde))
      if (survit) for (const classe of utilitaires) survivantes.add(classe)

      return survit
    })

    return retenus.length === 0 ? undefined : retenus.join(',')
  }

  function filtrer(noeuds: readonly Noeud[]): readonly Noeud[] {
    const retenus: Noeud[] = []

    for (const noeud of noeuds) {
      if (noeud.sorte === 'brut') {
        retenus.push(noeud)
        continue
      }

      if (noeud.sorte === 'regle') {
        const selecteur = filtrerSelecteur(noeud.selecteur)
        if (selecteur !== undefined) retenus.push({ ...noeud, selecteur })
        continue
      }

      const enfants = filtrer(noeud.enfants)
      // Un groupe vide n'est pas une erreur : c'est une requete de media dont
      // tous les utilitaires ont ete retires. La garder laisserait des
      // `@media(...){}` par milliers.
      if (enfants.length > 0) retenus.push({ ...noeud, enfants })
    }

    return retenus
  }

  const elaguee = ecrire(filtrer(analyser(css)))

  return {
    css: elaguee,
    octetsAvant: Buffer.byteLength(css),
    octetsApres: Buffer.byteLength(elaguee),
    gardees: survivantes.size,
    retirees: vues.size - survivantes.size,
  }
}

/**
 * Decoupe une liste de selecteurs sur les virgules de premier niveau.
 *
 * Une virgule vit aussi dans `:is(a, b)`, `:not(.x, .y)` ou une chaine. Couper
 * dessus produirait des selecteurs tronques, donc invalides, donc ignores par
 * le navigateur — une regle perdue en silence.
 */
export function decouperSelecteurs(selecteur: string): readonly string[] {
  const parts: string[] = []
  let profondeur = 0
  let debut = 0
  let i = 0

  while (i < selecteur.length) {
    const c = selecteur[i]

    if (c === '\\') {
      i += 2
      continue
    }

    if (c === '"' || c === "'") {
      i += 1
      while (i < selecteur.length && selecteur[i] !== c) {
        i += selecteur[i] === '\\' ? 2 : 1
      }
      i += 1
      continue
    }

    if (c === '(' || c === '[') profondeur += 1
    else if (c === ')' || c === ']') profondeur -= 1
    else if (c === ',' && profondeur === 0) {
      parts.push(selecteur.slice(debut, i).trim())
      debut = i + 1
    }

    i += 1
  }

  parts.push(selecteur.slice(debut).trim())

  return parts.filter((p) => p.length > 0)
}
