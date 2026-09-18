#!/usr/bin/env node
/**
 * Rewrites the class strings of a ported template, once.
 *
 * ## What this is for, and what it is not for
 *
 * A template arriving from elsewhere brings finished markup written against
 * another utility engine. The instruction is to change the engine and nothing
 * else. This pass does exactly that: it walks every class string of the copied
 * sources and rewrites each name from the template's table.
 *
 * It is a **one-shot migration**, not a build step. It runs on the pristine
 * copy, once. Run twice, it reports every name it produced the first time as
 * unknown — which is correct, and is how you notice.
 *
 * ## Why it reads the expressions and not only the plain strings
 *
 * The first version matched `className="…"` and nothing else. It announced
 * three hundred and sixty-three rewrites and zero unknown names, and it was
 * wrong: four of the template's class lists are expressions —
 *
 *     className={[ "…", side === "left" && "…" ].filter(Boolean).join(" ")}
 *     className={`will-change-transform ${center ? "max-w-[34rem]" : "…"}`}
 *
 * — and it never looked at them. Fifteen classes went through untouched, a
 * column lost its width, and the check reported success because a pass that
 * does not look at something cannot fail on it.
 *
 * So `className=` is followed to its closing brace, and every string and
 * template chunk inside is rewritten. What sits in `${…}` is code, and is left
 * alone.
 *
 * ## Et les listes tenues en variable
 *
 * `const cls = "group relative inline-flex h-12 …"`, employee plus loin par
 * `className={cls}`, n est pas dans un attribut : suivre `className=` ne la
 * voit pas davantage. Un bouton y a perdu sa hauteur, et dix-huit pixels sont
 * apparus.
 *
 * Toute chaine du fichier est donc examinee. Une chaine est tenue pour une
 * liste de classes quand elle porte au moins trois mots, que chacun a la forme
 * d un nom de classe, et qu au moins un se traduit. Le seuil de trois mots est
 * ce qui distingue `"grid"` — la valeur d un `display` — d une liste. Ce qui
 * passe au travers reste attrape par `check-template-classes.mjs`, qui, lui,
 * ne traduit rien et signale tout.
 *
 * ## Why it refuses rather than guesses
 *
 * A class our generator does not produce raises no error at run time: it does
 * nothing. A button loses its background, a section loses its padding, and
 * neither the console nor the compilation says a word. So any name that is
 * neither in our stylesheet, nor renamed, nor declared as the template's own
 * makes this exit non-zero and name the file it sits in.
 *
 * Usage:
 *
 *     node scripts/port-template-classes.mjs templates/altitude
 *
 * @module
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const target = process.argv[2]
if (target === undefined) {
  console.error('Usage: node scripts/port-template-classes.mjs <template folder>')
  process.exit(1)
}

/** `--dry` inspecte sans rien ecrire : c est ainsi qu on remplit la table. */
const dry = process.argv.includes('--dry')

const folder = resolve(ROOT, target)
const name = folder.split(/[\\/]/).pop() ?? ''

const {
  RENAMED,
  UNCHANGED,
  RESPELLED,
  IGNORED,
  FAUX_AMIS,
  VARIANTES_PROPRES,
} = await import(`./lib/${name}-classes.mjs`)

/*
 * `IGNORED` et `FAUX_AMIS` ne servent pas la meme chose, et les confondre coute
 * cher. `IGNORED` nomme les valeurs qu une expression de `className` compare —
 * `side === "left"` — et que cette passe rencontre donc au milieu de vraies
 * listes. `FAUX_AMIS`, lui, ne concerne que le controle : des mots croises
 * ailleurs dans le fichier, qui ressemblent a des classes sans en etre.
 *
 * Les avoir melanges a laisse passer `hidden` : mis en exception pour taire le
 * `overflow: hidden` d un module, il a aussi epargne la vraie classe `hidden`
 * du bandeau, qui montrait alors sa navigation de bureau sur un telephone.
 */

/** The classes our generator actually produces. */
const KNOWN = new Set(
  [
    ...readFileSync(
      join(ROOT, 'packages', 'odoro-libs', 'src', 'styles', 'generated', 'classNames.ts'),
      'utf8',
    ).matchAll(/'([^']+)'/g),
  ].map((match) => match[1]),
)

/** Every `.tsx` of the template. */
function sources(directory, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', '.next', 'public', 'dist'].includes(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) sources(path, found)
    /*
     * `.ts` autant que `.tsx`.
     *
     * `joaillier` range la geometrie de son hero dans `hero.geometry.ts` : des
     * listes de classes nommees, employees plus loin par `className={G.video}`.
     * Ne lire que les `.tsx` les laissait entieres — la video du hero perdait
     * sa position absolue, et six surcouches avec elle. Une passe ne peut pas
     * echouer sur ce qu elle ne regarde pas.
     */
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      found.push(path)
    }
  }
  return found
}

/** Les noms que la table produit : ils sont deja a leur place. */
const PRODUITS = new Set(Object.values(RENAMED))

const unknown = new Map()
let rewritten = 0

/**
 * The name a class takes in our system.
 *
 * @returns The new name, or `null` when nothing in the table covers it.
 */
function translate(original) {
  // Un nom que cette passe vient elle-meme de produire : la seconde passe
  // repasse sur le resultat de la premiere, et signalerait sinon son propre
  // travail comme introuvable.
  const dejaFait = original.slice(original.lastIndexOf(':') + 1)
  if (dejaFait.startsWith('o-')) return original
  if (PRODUITS.has(dejaFait)) return original
  // Une valeur que l expression compare, pas une classe. Voir IGNORED.
  if (IGNORED?.has(original) === true) return original
  if (UNCHANGED.has(original)) return original
  if (original in RENAMED) return RENAMED[original]
  if (original in RESPELLED) return RESPELLED[original]

  // A variant — `md:`, `hover:`, `focus-visible:` — prefixes the name our
  // stylesheet holds; the prefix itself travels unchanged.
  const cut = original.lastIndexOf(':')
  const variant = cut < 0 ? '' : original.slice(0, cut + 1)
  const bare = (cut < 0 ? original : original.slice(cut + 1)).replace(/^!/, '')

  /*
   * Une variante que le gabarit s est redeclaree ne peut pas emprunter la
   * notre, meme si elle en porte le nom.
   *
   * `parfum` ecrit `@custom-variant lg (@media (min-width: 1024px) and
   * (min-aspect-ratio: 1/1))`. Son `lg:` tient compte du format de l ecran ;
   * le notre est une simple largeur. Traduire `lg:flex` en `o-lg:flex` donnait
   * une regle qui peint sur un ecran large et bas, la ou l original se taisait.
   * Rien ne s en serait vu : la classe existe, elle est seulement plus large.
   *
   * On refuse donc la traduction, et le dériveur l ecrit avec la requete du
   * gabarit.
   */
  if (VARIANTES_PROPRES !== undefined) {
    for (const part of variant.split(':')) {
      if (VARIANTES_PROPRES.has(part)) return null
    }
  }

  if (KNOWN.has(`${variant}o-${bare}`)) return `${variant}o-${bare}`
  return null
}

/** Rewrites one whitespace-separated class list. */
function rewriteList(list, where) {
  return list
    .split(/(\s+)/)
    .map((piece) => {
      if (piece.trim() === '') return piece
      const next = translate(piece)
      if (next === null) {
        const files = unknown.get(piece) ?? new Set()
        files.add(where)
        unknown.set(piece, files)
        return piece
      }
      if (next !== piece) rewritten += 1
      return next
    })
    .join('')
}

/**
 * The index just past the expression that starts at `start` (a `{`).
 *
 * Braces nest, and a string or a template literal inside them may contain a
 * brace of its own: counting them without reading the quotes finds the wrong
 * end, and the rewrite then runs over the rest of the file.
 */
function endOfExpression(code, start) {
  let depth = 0
  let index = start
  while (index < code.length) {
    const c = code[index]
    if (c === '"' || c === "'" || c === '`') {
      const quote = c
      index += 1
      while (index < code.length) {
        if (code[index] === '\\') index += 2
        else if (code[index] === quote) break
        else index += 1
      }
    } else if (c === '{') depth += 1
    else if (c === '}') {
      depth -= 1
      if (depth === 0) return index + 1
    }
    index += 1
  }
  return code.length
}

/** Rewrites every string and template chunk of an expression. */
function rewriteExpression(code, where) {
  let out = ''
  let index = 0
  while (index < code.length) {
    const c = code[index]

    if (c === '"' || c === "'") {
      const end = code.indexOf(c, index + 1)
      if (end < 0) {
        out += code.slice(index)
        break
      }
      out += c + rewriteList(code.slice(index + 1, end), where) + c
      index = end + 1
      continue
    }

    if (c === '`') {
      let cursor = index + 1
      out += '`'
      while (cursor < code.length && code[cursor] !== '`') {
        // `${…}` is code, not a class list: it travels untouched.
        if (code[cursor] === '$' && code[cursor + 1] === '{') {
          const end = endOfExpression(code, cursor + 1)
          out += `\${${rewriteExpression(code.slice(cursor + 2, end - 1), where)}}`
          cursor = end
          continue
        }
        let run = cursor
        while (
          run < code.length &&
          code[run] !== '`' &&
          !(code[run] === '$' && code[run + 1] === '{')
        ) {
          run += 1
        }
        out += rewriteList(code.slice(cursor, run), where)
        cursor = run
      }
      out += '`'
      index = cursor + 1
      continue
    }

    out += c
    index += 1
  }
  return out
}

/** La forme d un mot qui pourrait etre un nom de classe.
 *
 * Le tiret de tete compte. Sans lui, `-inset-y-[10%]` etait refuse, et comme
 * la regle exige que **tous** les mots d une chaine aient cette forme, la
 * liste entiere passait a la trappe — sans rien signaler. Une carte de trois
 * dispositions n en a vu qu une traduite, la photographie du hero a perdu son
 * bloc englobant, et la page s est affichee blanche.
 */
/*
 * La forme d un nom de classe.
 *
 * La classe de caracteres admis manquait de tout ce qu une valeur arbitraire
 * peut contenir : le `*` d une multiplication, le `+` d une addition, les
 * accolades d une variable, l esperluette d un selecteur ecrit en ligne.
 *
 * Un nom peut aussi commencer par un crochet : `[mix-blend-mode:overlay]` est
 * une declaration ecrite en classe, et elle en est une.
 *
 * Un seul mot refuse suffisait a ecarter la chaine entiere — elles sont testees
 * d un bloc. Chez `joaillier`, quatre `max-lg:h-[calc(min(…)*0.63)]` faisaient
 * tomber une liste de quinze classes, et la carte du hero perdait sa position
 * absolue, sa taille et son rayon. Rien ne le disait : une chaine qu on ne
 * regarde pas ne peut pas manquer.
 */
const SHAPE = /^-?!?[a-z[][a-z0-9:/[\]().,%_*+&>=~^{}$-]*$/

/**
 * Une chaine hors attribut est-elle une liste de classes ?
 *
 * Trois mots au moins, tous de la forme voulue, et au moins un que la table ou
 * la feuille sait traduire. En dessous de trois, l ambiguite l emporte :
 * `"grid"` est aussi bien une classe que la valeur d un `display`, et se
 * tromper la corromprait du code.
 */
/**
 * Ou sont les commentaires ?
 *
 * On lit le fichier caractere par caractere en tenant compte des chaines : un
 * `//` a l interieur d une adresse n ouvre pas un commentaire, et une apostrophe
 * a l interieur d un commentaire n ouvre pas une chaine.
 */
function commentaires(source) {
  const zones = []
  let i = 0
  while (i < source.length) {
    const c = source[i]
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      const fin = c
      i += 1
      while (i < source.length && source[i] !== fin) {
        if (source[i] === '\\') i += 1
        else if (source[i] === '\n' && fin !== '`') break
        i += 1
      }
      i += 1
      continue
    }
    if (c === '/' && source[i + 1] === '/') {
      const debut = i
      while (i < source.length && source[i] !== '\n') i += 1
      zones.push([debut, i])
      continue
    }
    if (c === '/' && source[i + 1] === '*') {
      const debut = i
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1
      i += 2
      zones.push([debut, i])
      continue
    }
    i += 1
  }
  return zones
}

function looksLikeClassList(text) {
  const tokens = text.split(/\s+/).filter((piece) => piece !== '')
  if (tokens.length === 0) return false
  if (!tokens.every((piece) => SHAPE.test(piece))) return false

  /*
   * Trois mots ou plus : il suffit qu un se traduise. En dessous, l ambiguite
   * l emporte et la regle se durcit — **tous** doivent se traduire, et aucun ne
   * doit figurer parmi les mots que le gabarit declare comme n en etant pas.
   *
   * Le seuil etait a trois tout court, et vingt-cinq vraies listes courtes
   * passaient au travers : `border-t border-accent-500/14`, `col-start-1
   * row-start-1`, `h-full`. En dessous de trois, `"block"` est aussi bien une
   * classe que la valeur d un `display` — d ou la liste, et d ou la rigueur.
   */
  /*
   * Un mot declare comme n etant pas une classe ne prouve rien : le compter
   * comme preuve faisait passer pour une liste la prose d un commentaire prise
   * entre deux accents graves — « natively, so the ».
   */
  /*
   * Une classe dont la variante est redeclaree ne se traduit pas — mais elle
   * reste une classe. Le refus lui est oppose **expres**, pour que le dériveur
   * l ecrive avec la requete du gabarit ; ce n est pas une absence.
   *
   * Sans cette seconde branche, une chaine qui ne contient que de tels noms —
   * `"lg:left-10 lg:w-[max(16.4375rem,263px)]"` — n offrait plus la moindre
   * preuve et passait entiere a la trappe, sans un mot.
   */
  const portee = (piece) => {
    if (VARIANTES_PROPRES === undefined) return false
    const cut = piece.lastIndexOf(':')
    if (cut < 0) return false
    return piece.slice(0, cut).split(':').some((part) => VARIANTES_PROPRES.has(part))
  }

  /*
   * Une troisieme preuve : la forme.
   *
   * `PRODUCT_BOX = "aspect-4/3 md:aspect-16/9"` ne contient que deux mots, dont
   * aucun ne se traduit — ni l un ni l autre n existe chez nous. La chaine
   * entiere etait donc ecartee, et la scene du hero de `parfum` perdait ses
   * 262 px de hauteur, absorbes par le `min-height` de la section : le
   * document tombait juste, et rien ne se voyait.
   *
   * Un nom qui se termine par une valeur — un nombre, un rapport, un crochet —
   * est une classe utilitaire, et ne ressemble a aucun mot de prose. C est une
   * preuve etroite, et c est ce qui la rend sure : `block`, `centred` ou `is`
   * n y repondent pas.
   */
  const VALEUR = /-(?:\d+(?:\.\d+)?(?:\/\d+)?|\[[^\]]*\])$/

  const forme = (piece) => {
    const nu = piece.slice(piece.lastIndexOf(':') + 1)
    return VALEUR.test(nu)
  }

  const revele = (piece) =>
    IGNORED?.has(piece) !== true &&
    FAUX_AMIS?.has(piece) !== true &&
    (translate(piece) !== null || portee(piece) || forme(piece))

  if (tokens.length >= 3) return tokens.some(revele)

  /*
   * Un seul mot ne suffit jamais.
   *
   * `"glass"` se traduit — nous connaissons `o-glass` — mais c est ici le
   * membre d un type : `variant?: "plain" | "glass"`. La passe l a reecrit, la
   * cle `glass` de la table de styles est restee, et le bouton givre du pied de
   * page allait perdre toutes ses regles.
   *
   * Un mot isole n est donc pris pour une classe que s il en a la forme — une
   * valeur au bout, une variante devant. Une vraie classe solitaire qui passe
   * au travers ne peint rien et se fait signaler par le controle ; un type
   * reecrit, lui, ne se signale pas.
   */
  if (tokens.length === 1) {
    return revele(tokens[0]) && (forme(tokens[0]) || portee(tokens[0]))
  }

  if (tokens.some((piece) => FAUX_AMIS?.has(piece) === true)) return false
  return tokens.every(revele)
}

let touched = 0

for (const file of sources(folder)) {
  const before = readFileSync(file, 'utf8')
  const where = file.slice(folder.length + 1)

  let after = ''
  let index = 0
  const MARK = 'className='

  while (index < before.length) {
    const found = before.indexOf(MARK, index)
    if (found < 0) {
      after += before.slice(index)
      break
    }

    after += before.slice(index, found + MARK.length)
    const start = found + MARK.length
    const opener = before[start]

    if (opener === '"' || opener === "'") {
      const end = before.indexOf(opener, start + 1)
      after += opener + rewriteList(before.slice(start + 1, end), where) + opener
      index = end + 1
    } else if (opener === '{') {
      const end = endOfExpression(before, start)
      after += `{${rewriteExpression(before.slice(start + 1, end - 1), where)}}`
      index = end
    } else {
      index = start
    }
  }

  // Seconde passe : les listes qui ne sont pas dans un attribut. Elle vient
  // apres, sur le resultat de la premiere, pour ne pas repasser sur ce qui
  // vient d etre traduit — `o-flex` n a plus la forme d un nom a traduire.
  //
  // Le plancher est a deux caracteres, et non a huit : `h-full` en fait six, et
  // vingt-deux vraies classes tenaient sous l ancien seuil.
  //
  // Elle ne descend pas dans les commentaires. Un mot entre accents graves y
  // est de la prose : `` `font-display` `` designait, chez `socle`, la propriete
  // CSS du meme nom — la passe en a fait `sn-font-display`, et le commentaire
  // s est mis a nommer une classe qui n avait rien a voir. La regle ne peignait
  // rien de travers ; elle mentait, ce qui est pire dans un texte qui explique.
  const zonesDeCommentaire = commentaires(after)
  const dansUnCommentaire = (index) =>
    zonesDeCommentaire.some(([d, f]) => index >= d && index < f)

  after = after.replace(
    /(["'`])([^"'`\n]{2,800})\1/g,
    (whole, quote, text, index) => {
      if (dansUnCommentaire(index)) return whole

      /*
       * Ce qu un littéral gabarit interpole est du code, et non une classe.
       *
       * `` `font-ui text-caption … ${smallType}` `` echouait au test de forme a
       * cause du seul `${smallType}`, et les cinq classes qui le precedaient
       * partaient avec lui. On met donc le code de cote, on juge et on reecrit
       * ce qui reste, et on le remet en place.
       */
      const morceaux = text.split(/(\$\{[^}]*\})/g)
      const litteral = morceaux.filter((_, i) => i % 2 === 0).join(' ')
      if (!looksLikeClassList(litteral)) return whole
      const refait = morceaux
        .map((m, i) => (i % 2 === 0 ? rewriteList(m, where) : m))
        .join('')
      return quote + refait + quote
    },
  )

  if (after !== before) {
    if (!dry) writeFileSync(file, after, 'utf8')
    touched += 1
  }
}

console.log(
  `${String(rewritten)} classe(s) ${dry ? 'a reecrire' : 'reecrite(s)'} dans ` +
    `${String(touched)} fichier(s)${dry ? ' — rien n a ete ecrit' : ''}.`,
)

if (unknown.size > 0) {
  console.error(`\n${String(unknown.size)} classe(s) sans reponse dans la table :\n`)
  for (const [piece, where] of [...unknown].sort()) {
    console.error(`  · ${piece}  —  ${[...where].join(', ')}`)
  }
  console.error(
    '\nUne classe absente ne casse rien : elle ne peint rien. Completer la table.\n',
  )
  process.exitCode = 1
}
