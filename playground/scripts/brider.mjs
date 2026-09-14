/**
 * Bride le pack de design sur la pile ODORO, au moment de le publier.
 *
 * ## Pourquoi ici et non dans le pack
 *
 * `ODORO-Design-Pack/` est la source de verite des directives et ne doit jamais
 * etre modifie. La version que lit un modele, elle, est celle qui est publiee
 * sous `/instructive/llm`. La traduction vit donc dans la publication : le
 * dossier source reste intact a l octet pres, et ce module est le seul endroit
 * ou la pile change de nom.
 *
 * ## Ce qui change, et ce qui ne change pas
 *
 * **Ne change pas** : la methode. Les compositions, le Style unique choisi au
 * plan, le rationnement de l accent, la choregraphie de revelation, les regles
 * d accessibilite, les schemas de sortie, l ordre des etapes. Aucune phrase de
 * raisonnement n est reecrite ; seuls les noms d outils et le vocabulaire de
 * classes le sont.
 *
 * **Change** : trois choses.
 *
 * 1. **Les utilitaires.** Le pack ecrit du Tailwind (`bg-bg`, `text-ink`,
 *    `md:grid-cols-2`). Ici on ecrit le systeme maison, prefixe `o-`. Les
 *    roles semantiques du pack n existent pas chez nous — aucun utilitaire ne
 *    lit `--o-theme-*` — ils sont donc rendus par la paire palette + variante
 *    `dark:`, exactement comme ce site et les cent vitrines le font deja.
 * 2. **L outillage.** Tailwind, Next.js, Vite, webpack deviennent `odoro`, qui
 *    sert, transforme et construit.
 * 3. **Les images.** Le pack laissait un `<img>` vide avec une description.
 *    Sur le SaaS, c est l outil **Sparkonic** de la zone de discussion qui les
 *    produit, avec **Nano Banana** pour modele par defaut.
 *
 * ## Le garde-fou
 *
 * {@link bride} refuse toute classe `o-*` absente de la liste produite par la
 * librairie. Une traduction qui inventerait une classe casserait des pages sans
 * rien signaler — du CSS absent ne peint pas, il ne leve pas d erreur.
 *
 * @module
 */

/**
 * Les roles de couleur du pack, rendus par notre palette.
 *
 * Le pack suppose que la pile fabrique des utilitaires depuis les jetons du
 * site (`@theme inline` de Tailwind v4). Notre generateur n a pas ce point
 * d extension : sa palette est fixee a la production de la feuille. Le seul
 * jeton qu une page peut repointer est la marque — et c est suffisant, parce
 * que l accent est le seul role qui porte l identite. Le reste (fond, encre,
 * surface, filet) se dit par une paire claire/sombre, ce que le systeme
 * decline nativement.
 */
const ROLES = {
  'bg-bg': 'o-bg-white dark:o-bg-zinc-950',
  'bg-bg-alt': 'o-bg-zinc-50 dark:o-bg-zinc-900',
  'bg-surface': 'o-bg-white dark:o-bg-zinc-900',
  'bg-surface-raised': 'o-bg-white dark:o-bg-zinc-800',
  'text-ink': 'o-text-zinc-950 dark:o-text-zinc-50',
  'text-ink-muted': 'o-text-zinc-600 dark:o-text-zinc-300',
  'text-ink-subtle': 'o-text-zinc-500 dark:o-text-zinc-400',
  'bg-ink': 'o-bg-zinc-950 dark:o-bg-zinc-50',
  'bg-ink-muted': 'o-bg-zinc-600 dark:o-bg-zinc-300',
  'text-bg': 'o-text-white dark:o-text-zinc-950',
  'text-accent': 'o-text-brand-600 dark:o-text-brand-300',
  'bg-accent': 'o-bg-brand-600 dark:o-bg-brand-400',
  'text-accent-ink': 'o-text-white dark:o-text-zinc-950',
  'border-accent': 'o-border-brand-600 dark:o-border-brand-400',
  'text-glow': 'o-text-brand-400 dark:o-text-brand-300',
  'bg-glow': 'o-bg-brand-400 dark:o-bg-brand-300',
  // Les echelles alpha n ont pas de jumelle `dark:` dans le systeme : le filet
  // se dit donc par deux nuances de la meme echelle neutre.
  'border-line': 'o-border-zinc-200 dark:o-border-zinc-800',
  'font-display': 'o-font-sans',
  'font-body': 'o-font-sans',
  'font-mono': 'o-font-mono',
  'font-heading': 'o-font-semibold',
  'tracking-display': 'o-tracking-tight',
  'rounded-od': 'o-rounded-2xl',
  'rounded-od-lg': 'o-rounded-3xl',
  'ease-od': 'o-ease-out',
}

/**
 * Les classes structurelles que le systeme nomme autrement.
 *
 * Tout le reste — grille, espacement, alignement, echelle de texte — porte le
 * meme nom a un prefixe pres, et passe par {@link prefixer}.
 */
const EXCEPTIONS = {
  'sr-only': 'o-sr-only',
  'mx-auto': 'o-mx-auto',
  group: 'o-relative',
}

/** Variantes du pack qui n existent pas telles quelles chez nous. */
const VARIANTES = { 'group-hover': 'hover', motion: 'motion' }

/** Une classe utilitaire du pack, traduite. Rend `undefined` si inconnue. */
function traduireClasse(brute, connues, inconnues) {
  const coupe = brute.split(':')
  const nom = coupe.pop() ?? ''
  const prefixes = coupe.map((v) => VARIANTES[v] ?? v)

  const role = ROLES[nom]
  if (role !== undefined) {
    // Un role porte deja sa paire claire/sombre : sous une variante (`hover:`)
    // on l applique a chaque moitie.
    if (prefixes.length === 0) return role
    return role
      .split(' ')
      .map((c) => {
        const dejaSombre = c.startsWith('dark:')
        const nu = dejaSombre ? c.slice(5) : c
        return `${dejaSombre ? 'dark:' : ''}${prefixes.join(':')}:${nu}`
      })
      .join(' ')
  }

  const exception = EXCEPTIONS[nom]
  const cible = exception ?? `o-${nom}`
  const complet = prefixes.length === 0 ? cible : `${prefixes.join(':')}:${cible}`
  if (!connues.has(complet)) {
    inconnues.add(`${brute} -> ${complet}`)
    return undefined
  }
  return complet
}

/** Une liste de classes du pack, traduite ; l inconnue est signalee et gardee. */
function traduireListe(liste, connues, inconnues) {
  const sortie = []
  for (const brute of liste.split(/\s+/).filter(Boolean)) {
    // Les valeurs arbitraires de Tailwind — `text-[clamp(...)]` — n ont pas
    // d equivalent : le systeme ne compile rien a la volee. On les laisse au
    // style en ligne, que la doctrine autorise pour les proprietes person.
    if (brute.includes('[')) {
      sortie.push(brute)
      continue
    }
    const t = traduireClasse(brute, connues, inconnues)
    sortie.push(t ?? brute)
  }
  return sortie.join(' ')
}

/** Le bloc qui remplace le pont Tailwind v4 dans `tokens.template.css`. */
const PONT_ODORO = `/* 2. Les roles du site, poses sur la palette d ODORO.
 *
 *    Le systeme d ODORO produit ses utilitaires a la construction, depuis une
 *    palette fixe : il n a pas d equivalent de \`@theme\`, qui fabriquerait
 *    \`bg-bg\` depuis une variable. Le seul jeton qu une page repointe est la
 *    marque — et c est celui qui porte l identite. Repointer les onze nuances
 *    reteinte d un geste tout ce qui emploie \`o-*-brand-*\`.
 *
 *    Le fond, l encre, la surface et le filet se disent par une paire
 *    \`o-bg-white dark:o-bg-zinc-950\`, que le systeme decline nativement.
 */
:root {
  --o-palette-brand-50: var(--od-accent-50, var(--od-accent));
  --o-palette-brand-100: var(--od-accent-100, var(--od-accent));
  --o-palette-brand-200: var(--od-accent-200, var(--od-accent));
  --o-palette-brand-300: var(--od-accent-300, var(--od-accent));
  --o-palette-brand-400: var(--od-accent-400, var(--od-accent));
  --o-palette-brand-500: var(--od-accent);
  --o-palette-brand-600: var(--od-accent-600, var(--od-accent));
  --o-palette-brand-700: var(--od-accent-700, var(--od-accent));
  --o-palette-brand-800: var(--od-accent-800, var(--od-accent));
  --o-palette-brand-900: var(--od-accent-900, var(--od-accent));
  --o-palette-brand-950: var(--od-accent-950, var(--od-accent));

  --o-theme-bg: var(--od-bg);
  --o-theme-surface: var(--od-surface);
  --o-theme-fg: var(--od-ink);
  --o-theme-muted: var(--od-ink-muted);
  --o-theme-line: var(--od-line);
}`

/**
 * Les reecritures de prose, une par phrase.
 *
 * Chacune est ecrite en entier plutot que produite par une regle : une
 * substitution de mot changerait le sens d une consigne sans qu on le voie.
 */
const PHRASES = [
  // --- prompts/00-system-core.md
  [
    'Its tokens are CSS variables written by the pipeline and exposed as Tailwind utilities:',
    'Its tokens are CSS variables written by the pipeline. Each role below names the ODORO utilities that carry it — the palette pair that declines light and dark:',
  ],
  [
    'No hex or rgb values and no Tailwind palette colours (`text-gray-500`, `bg-black`, `border-white`) in markup.',
    'No hex or rgb values, and no raw palette utility outside the roles above (`o-text-gray-500`, `o-bg-black`, `o-border-white`) in markup.',
  ],
  [
    'You never write animation JavaScript, CSS keyframes or Tailwind `animate-*` classes.',
    'You never write animation JavaScript, CSS keyframes or `o-animate-*` classes.',
  ],
  [
    "- **Don't put Tailwind transform utilities on a revealed element**",
    "- **Don't put transform utilities on a revealed element**",
  ],
  [
    'Opacity modifiers are fine: `text-ink/70`, `border-ink/15`, `bg-bg/80`.',
    'For a softened ink or a hairline, use the alpha scales: `o-text-black-60` / `o-text-white-70`, `o-border-black-10` / `o-border-white-10`, `o-bg-black-45`. They carry their own opacity; there is no `/70` modifier.',
  ],
  // --- prompts/20-section-builder.md
  [
    'The tokens are already written as CSS variables and Tailwind utilities; you only use the utility names from the doctrine.',
    'The tokens are already written as CSS variables and the palette is already repointed; you only use the utility names from the doctrine.',
  ],
  [
    'Oversized display type uses `clamp()` arbitrary values sized so the longest word never overflows at 360px.',
    'Oversized display type uses an inline `font-size: clamp(...)` custom property, sized so the longest word never overflows at 360px — the system compiles no arbitrary value.',
  ],
  [
    'no inline `style` other than CSS custom properties, and no `animate-*` classes.',
    'no inline `style` other than CSS custom properties and the display `clamp()`, and no `o-animate-*` classes.',
  ],
  [
    "Without media, keep the slot and render an `<img>` whose `src` is empty and whose `data-od-placeholder` describes the image to source (for example `data-od-placeholder=\"Façade en béton au coucher du soleil, 16:9\"`), inside a box with the right aspect ratio.",
    'Without media, source the image with **Sparkonic**, the image tool of the chat box — its default model is **Nano Banana**. Give it the subject, the framing and the ratio, then place the image it returns. If the call cannot be made, keep the slot and render an `<img>` whose `src` is empty and whose `data-od-placeholder` carries the same description (for example `data-od-placeholder="Façade en béton au coucher du soleil, 16:9"`), inside a box with the right aspect ratio.',
  ],
  // --- runtime/tokens.template.css
  [
    ` * 2. @theme inline bridges them into Tailwind v4 utilities, so generated markup uses
 *    bg-bg, text-ink, border-line, font-display… and a re-skin is a variable swap.
 *    Tailwind v3 equivalent: see README.md § Tailwind.`,
    ` * 2. The block below repoints ODORO's brand scale and theme tokens onto them, so a
 *    re-skin stays a variable swap: change --od-accent, and every o-*-brand-*
 *    utility on the page follows.`,
  ],
  // --- examples/odoro-architecture.html
  [
    `  <!-- 4. Tailwind v4 + the site's tokens (runtime/tokens.template.css filled from plan.style.tokens).
          The browser build is for this example only; production compiles with the engine's Tailwind. -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style type="text/tailwindcss">`,
    `  <!-- 4. The ODORO stylesheet + the site's tokens (runtime/tokens.template.css
          filled from plan.style.tokens). In production, odoro prunes the sheet to
          the classes the page actually uses. -->
  <link rel="stylesheet" href="/node_modules/@odoro-cli/libs/dist/styles.css">
  <style>`,
  ],
]

/** Les noms d outillage, remplaces partout ou ils apparaissent en prose. */
const OUTILS = [
  [/Tailwind v4|Tailwind v3|Tailwind CSS|TailwindCSS|Tailwind/g, 'ODORO'],
  [/tailwind\.config(\.[jt]s)?/g, 'odoro.config.ts'],
  [/\bNext\.js\b|\bNextJS\b|\bNext js\b/g, 'odoro'],
  [/\bVite\b/g, 'odoro'],
  [/\bwebpack\b/gi, 'odoro'],
]

/**
 * Le contenu d un fichier du pack, bride sur la pile ODORO.
 *
 * @param chemin Chemin relatif dans le pack, par exemple `prompts/00-system-core.md`.
 * @param texte Contenu d origine.
 * @param connues Les classes que la librairie produit reellement.
 * @param inconnues Recueille les traductions sans cible ; le publieur les signale.
 * @returns Le contenu bride.
 *
 * @example
 * bride('prompts/00-system-core.md', source, connues, new Set())
 */
export function bride(chemin, texte, connues, inconnues) {
  // Le dossier `reference/` est de la matiere source, « jamais injectee telle
  // quelle » d apres le pack lui-meme. On n y touche pas : la reecrire
  // reviendrait a falsifier des documents d origine.
  if (chemin.startsWith('reference/')) return texte

  let sortie = texte

  for (const [avant, apres] of PHRASES) {
    if (sortie.includes(avant)) sortie = sortie.split(avant).join(apres)
  }

  if (chemin === 'runtime/tokens.template.css') {
    const debut = sortie.indexOf('@theme inline {')
    const fin = sortie.indexOf('}', sortie.indexOf('--ease-od'))
    if (debut !== -1 && fin !== -1) {
      sortie = sortie.slice(0, debut) + PONT_ODORO.split('\n').slice(9).join('\n') + sortie.slice(fin + 1)
    }
  }

  // Les classes : dans le balisage, puis dans les codes en ligne du Markdown.
  sortie = sortie.replace(/class="([^"]*)"/g, (_, liste) => `class="${traduireListe(liste, connues, inconnues)}"`)
  sortie = sortie.replace(/`([a-z0-9][a-z0-9:/\\[\]().,%-]*)`/g, (tout, contenu) => {
    if (!/^(?:[a-z-]+:)*(?:bg|text|border|font|rounded|ease|tracking|grid|flex|gap|col|row|p[xytblr]?|m[xytblr]?|w|h|max|min|items|justify|self|order|leading|aspect|object|z|opacity|shadow|sr)-/.test(contenu)) {
      return tout
    }
    const t = traduireListe(contenu, connues, inconnues)
    return `\`${t}\``
  })

  for (const [motif, valeur] of OUTILS) sortie = sortie.replace(motif, valeur)

  return sortie
}

export { PONT_ODORO }
