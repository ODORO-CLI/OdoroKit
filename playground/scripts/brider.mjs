/**
 * Bride le pack de design sur la pile ODORO, au moment de le publier.
 *
 * ## Pourquoi ici, et non dans le pack
 *
 * `ODORO-Design-Pack/` est la source de verite des directives et ne doit jamais
 * etre modifie. La version que lit un modele est celle qui est publiee sous
 * `/instructive/llm`. La traduction vit donc dans la publication : le dossier
 * source reste intact a l octet pres, et ce module est le seul endroit ou la
 * pile change de nom.
 *
 * ## Ce qui ne change pas
 *
 * La methode, entiere. Les compositions, le Style unique choisi au plan, le
 * rationnement de l accent, la choregraphie de revelation, les regles
 * d accessibilite, les schemas de sortie, l ordre des etapes, et les **noms des
 * roles** (`bg-bg`, `text-ink`, `border-line`, `rounded-od`...). Aucune phrase
 * de raisonnement n est reecrite.
 *
 * ## Ce qui change
 *
 * 1. **Qui fabrique les roles.** Le pack les tirait des jetons du site par
 *    `@theme inline`, propre a Tailwind v4. Ici c est `tokens.template.css` qui
 *    les declare en CSS nu — voir {@link PONT_ODORO}. Rien d autre ne bouge :
 *    le balisage produit est le meme, et une reteinte reste un changement de
 *    variable.
 * 2. **Les utilitaires de structure.** Grille, espacement, alignement, echelle
 *    de texte : ils prennent le prefixe `o-` du systeme maison.
 * 3. **L outillage.** Tailwind, Next.js, Vite, webpack deviennent `odoro`.
 * 4. **Les images.** Le pack laissait un `<img>` vide avec une description. Sur
 *    le SaaS elles sont produites, par deux chemins dans cet ordre : si un
 *    compte **Sparkonic** est connecte a Odoro, on demande a employer son
 *    outil ; sinon on produit l image sur les credits de l utilisateur, avec
 *    **Nano Banana** pour modele par defaut. Le `<img>` vide ne reste qu en
 *    dernier recours.
 *
 * ## Pourquoi les roles gardent leur nom
 *
 * On a d abord essaye de les rendre par la palette d ODORO — `text-ink`
 * devenant `o-text-zinc-950 dark:o-text-zinc-50`. C etait une impasse : la
 * regle R1 du controle automatique refuse precisement les couleurs de palette
 * brutes, parce qu une couleur ecrite en dur survit a la reteinte et la casse.
 * La doctrine le dit trois fois. Traduire les roles en palette aurait fait
 * echouer au controle chaque page produite, et vide de sens la promesse du
 * pack.
 *
 * ## Le garde-fou
 *
 * {@link bride} refuse toute classe `o-*` absente de la liste que la librairie
 * produit. Une traduction qui inventerait une classe casserait des pages sans
 * rien signaler : du CSS absent ne peint pas, et ne leve aucune erreur.
 *
 * @module
 */

/**
 * Les roles du pack, que notre couche de jetons declare telle quelle.
 *
 * Ils traversent la traduction sans changer : c est leur nom qui fait le
 * contrat entre la doctrine, le balisage et le controle automatique.
 */
const ROLES = new Set([
  'bg-bg', 'bg-bg-alt', 'bg-surface', 'bg-surface-raised', 'bg-ink', 'bg-ink-muted',
  'bg-accent', 'bg-glow', 'text-bg', 'text-ink', 'text-ink-muted', 'text-ink-subtle',
  'text-accent', 'text-accent-ink', 'text-glow', 'border-line', 'border-accent',
  'border-ink', 'from-bg', 'via-bg', 'to-bg', 'from-ink', 'via-ink', 'to-ink',
  'font-display', 'font-body', 'font-mono', 'font-heading', 'tracking-display',
  'rounded-od', 'rounded-od-lg', 'ease-od',
])

/** Les classes de structure que le systeme nomme autrement. */
const EXCEPTIONS = {
  // Le pack ecrit la direction d un degrade a la mode de Tailwind v4.
  'bg-linear-to-t': 'o-bg-gradient-to-t',
  'bg-linear-to-b': 'o-bg-gradient-to-b',
  'bg-linear-to-r': 'o-bg-gradient-to-r',
  'bg-linear-to-l': 'o-bg-gradient-to-l',
  // Chez nous l epaisseur de bordure est une classe a part entiere.
  border: 'o-border-w-1',
  'border-y': 'o-border-w-1',
  'border-x': 'o-border-w-1',
  'border-t': 'o-border-w-1',
  'border-b': 'o-border-w-1',
  'border-0': 'o-border-w-0',
  // Les durees portent un nom, pas un nombre.
  'duration-150': 'o-duration-fast',
  'duration-300': 'o-duration-base',
  'duration-500': 'o-duration-slow',
  // Le systeme n a pas d interligne nul.
  'leading-none': 'o-leading-tight',
  // Trois formes qu il ne decline pas : la neuvieme colonne (il s arrete a
  // sept), un decalage de 8rem (il s arrete a 6) et la translation negative.
  // Elles passent par des classes locales, posees dans la feuille de la page —
  // c est la pratique de ce depot pour ce qu il ne couvre pas.
  'md:col-start-9': 'od-col9',
  'md:top-32': 'od-haut32',
  'group-hover:-translate-y-1.5': 'od-leve',
  'group-hover:translate-x-1.5': 'od-glisse',
  // `group` n existe pas : la parente se dit par le selecteur de la feuille.
  group: 'o-relative',
}

/** Ce que le systeme ne decline pas, pose dans la feuille de la page. */
const APPOINTS = [
  '@media (min-width:48rem){.od-col9{grid-column-start:9}.od-haut32{top:8rem}}',
  '.od-leve{transition:transform var(--od-duration-fast) var(--od-ease)}',
  '[data-od-section]:hover .od-leve{transform:translateY(-0.375rem)}',
  '.od-glisse{transition:transform var(--od-duration-fast) var(--od-ease)}',
  'a:hover .od-glisse,button:hover .od-glisse{transform:translateX(0.375rem)}',
].join('\n    ')

/**
 * Les utilitaires de role, declares depuis les jetons du site.
 *
 * Les degres d opacite sont ecrits un par un plutot que par un modificateur
 * `/N` : `color-mix` rend la meme chose, et aucune pile n est requise pour la
 * compiler.
 */
function couche() {
  const roles = {
    bg: '--od-bg',
    'bg-alt': '--od-bg-alt',
    surface: '--od-surface',
    'surface-raised': '--od-surface-raised',
    ink: '--od-ink',
    'ink-muted': '--od-ink-muted',
    'ink-subtle': '--od-ink-subtle',
    accent: '--od-accent',
    'accent-ink': '--od-accent-ink',
    line: '--od-line',
    glow: '--od-glow',
  }
  const lignes = []
  for (const [nom, jeton] of Object.entries(roles)) {
    lignes.push(`.bg-${nom}{background-color:var(${jeton})}`)
    lignes.push(`.text-${nom}{color:var(${jeton})}`)
    lignes.push(`.border-${nom}{border-color:var(${jeton})}`)
    lignes.push(`.from-${nom}{--od-from:var(${jeton})}`)
    lignes.push(`.via-${nom}{--od-via:var(${jeton})}`)
    lignes.push(`.to-${nom}{--od-to:var(${jeton})}`)
    // Les degres d opacite, de cinq en cinq. Un pas de dix a ete essaye : il
    // faisait tomber cinq classes que la page d exemple emploie deja (25, 35,
    // 85, 95). Restreindre les arrets de degrade au fond et a l encre suffit a
    // tenir le fichier, sans rien retirer de ce qui peint.
    for (let degre = 5; degre <= 95; degre += 5) {
      const melange = `color-mix(in srgb, var(${jeton}) ${String(degre)}%, transparent)`
      const d = String(degre)
      lignes.push(`.bg-${nom}/${d}{background-color:${melange}}`)
      lignes.push(`.text-${nom}/${d}{color:${melange}}`)
      lignes.push(`.border-${nom}/${d}{border-color:${melange}}`)
      // Les arrets de degrade ne servent que sur le fond et l encre.
      if (nom === 'bg' || nom === 'ink') {
        lignes.push(`.from-${nom}/${d}{--od-from:${melange}}`)
        lignes.push(`.via-${nom}/${d}{--od-via:${melange}}`)
        lignes.push(`.to-${nom}/${d}{--od-to:${melange}}`)
      }
    }
  }
  lignes.push('.font-display{font-family:var(--od-font-display)}')
  lignes.push('.font-body{font-family:var(--od-font-body)}')
  lignes.push('.font-mono{font-family:var(--od-font-mono)}')
  lignes.push('.font-heading{font-weight:var(--od-weight-display)}')
  lignes.push('.tracking-display{letter-spacing:var(--od-tracking-display)}')
  lignes.push('.rounded-od{border-radius:var(--od-radius)}')
  lignes.push('.rounded-od-lg{border-radius:var(--od-radius-lg)}')
  lignes.push('.ease-od{transition-timing-function:var(--od-ease)}')
  lignes.push(
    '[class*="o-bg-gradient-to-"]{background-image:linear-gradient(var(--od-angle,to top),' +
      'var(--od-from,transparent),var(--od-via,transparent),var(--od-to,transparent))}',
  )
  return lignes.join('\n  ')
}

/** Le bloc qui remplace `@theme inline`, commentaire compris. */
const PONT_ODORO = `@layer components {
  /* Les utilitaires de role, declares depuis les jetons ci-dessus.
   *
   * Le systeme d ODORO produit ses utilitaires a la construction, depuis une
   * palette fixe : il n a pas d equivalent de @theme, qui fabriquerait bg-bg
   * depuis une variable du site. Cette couche les declare donc en CSS nu. Le
   * balisage ne change pas, et une reteinte reste un changement de variable.
   *
   * La structure — grille, espacement, echelle de texte — vient du systeme,
   * prefixee o-. Les couleurs, la typographie et les rayons viennent d ici.
   */
  ${couche()}
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
    'Its tokens are CSS variables written by the pipeline and exposed as role utilities by `runtime/tokens.template.css`:',
  ],
  [
    'No hex or rgb values and no Tailwind palette colours (`text-gray-500`, `bg-black`, `border-white`) in markup.',
    'No hex or rgb values and no palette utilities (`o-text-gray-500`, `o-bg-black`, `o-border-white`) in markup.',
  ],
  [
    'You never write animation JavaScript, CSS keyframes or Tailwind `animate-*` classes.',
    'You never write animation JavaScript, CSS keyframes or `o-animate-*` classes.',
  ],
  [
    "- **Don't put Tailwind transform utilities on a revealed element**",
    "- **Don't put transform utilities on a revealed element**",
  ],
  // --- prompts/20-section-builder.md
  [
    'The tokens are already written as CSS variables and Tailwind utilities; you only use the utility names from the doctrine.',
    'The tokens are already written as CSS variables and role utilities; you only use the utility names from the doctrine.',
  ],
  [
    'Oversized display type uses `clamp()` arbitrary values sized so the longest word never overflows at 360px.',
    'Oversized display type uses an inline `font-size: clamp(...)`, sized so the longest word never overflows at 360px — the ODORO sheet compiles no arbitrary value.',
  ],
  [
    'no inline `style` other than CSS custom properties, and no `animate-*` classes.',
    'no inline `style` other than CSS custom properties and the display `clamp()`, and no `o-animate-*` classes.',
  ],
  [
    'Without media, keep the slot and render an `<img>` whose `src` is empty and whose `data-od-placeholder` describes the image to source (for example `data-od-placeholder="Façade en béton au coucher du soleil, 16:9"`), inside a box with the right aspect ratio.',
    'Without media, generate the image. **If a Sparkonic account is connected to Odoro, ask to use the Sparkonic tool.** Otherwise generate it on the user’s own credits, with the default model **Nano Banana**. Either way, give it the subject, the framing and the ratio, then place what comes back with a meaningful `alt`. If neither path is available, keep the slot and render an `<img>` whose `src` is empty and whose `data-od-placeholder` carries the same description (for example `data-od-placeholder="Façade en béton au coucher du soleil, 16:9"`), inside a box with the right aspect ratio.',
  ],
  // --- runtime/tokens.template.css
  [
    ` * 2. @theme inline bridges them into Tailwind v4 utilities, so generated markup uses
 *    bg-bg, text-ink, border-line, font-display… and a re-skin is a variable swap.
 *    Tailwind v3 equivalent: see README.md § Tailwind.`,
    ` * 2. The layer below declares the role utilities from them — bg-bg, text-ink,
 *    border-line, font-display… — in plain CSS, so a re-skin stays a variable swap
 *    and no external stack is needed. Structure comes from ODORO, prefixed o-.`,
  ],
  // --- examples/odoro-architecture.html
  [
    `  <!-- 4. Tailwind v4 + the site's tokens (runtime/tokens.template.css filled from plan.style.tokens).
          The browser build is for this example only; production compiles with the engine's Tailwind. -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style type="text/tailwindcss">`,
    `  <!-- 4. The compiled ODORO sheet + the site's tokens (runtime/tokens.template.css
          filled from plan.style.tokens). Point this at your project's built sheet:
          the published package ships the base only, and odoro produces the
          utilities at build time, pruned to the classes the page actually uses. -->
  <link rel="stylesheet" href="./odoro.css">
  <style>
    /* Ce que le systeme d ODORO ne decline pas. */
    __APPOINTS__`,
  ],
  // --- README.md : trois phrases qu une substitution de mot rendrait absurdes.
  [
    '1. **Le moteur de rendu :** version de Tailwind (v4 avec `@theme`, ou v3 avec `tailwind.config`), et comment les classes des pages générées sont compilées (build par site, JIT sur le HTML généré, CDN…).',
    "1. **Le moteur de rendu :** la version d'`@odoro-cli/libs` et du moteur `odoro`, et comment la feuille est élaguée (à la construction, par site). Les utilitaires de rôle viennent de `runtime/tokens.template.css` ; la structure vient du système, préfixée `o-`.",
  ],
  [
    "`examples/odoro-architecture.html` est l'exemple complet. Il utilise le build navigateur de Tailwind uniquement pour être autonome ; en production, compile avec le Tailwind du moteur.",
    "`examples/odoro-architecture.html` est l'exemple complet. Il charge la feuille d'`@odoro-cli/libs` telle quelle pour être autonome ; en production, `odoro` l'élague aux seules classes employées.",
  ],
  [
    '- [ ] Tailwind compile les classes arbitraires générées.',
    "- [ ] Aucune valeur arbitraire dans les classes : la taille d'affichage passe par un `clamp()` en style.",
  ],
]

/** Les noms d outillage, remplaces partout ou ils restent en prose. */
const OUTILS = [
  [/Tailwind v4|Tailwind v3|Tailwind CSS|TailwindCSS|Tailwind/g, 'ODORO'],
  [/tailwind\.config(\.[jt]s)?/g, 'odoro.config.ts'],
  [/\bNext\.js\b|\bNextJS\b/g, 'odoro'],
  [/\bVite\b/g, 'odoro'],
  [/\bwebpack\b/gi, 'odoro'],
]

/** Une classe du pack, traduite. Rend `undefined` si elle n a pas de cible. */
function traduireClasse(brute, connues, inconnues) {
  const exacte = EXCEPTIONS[brute]
  if (exacte !== undefined) return exacte

  const coupe = brute.split(':')
  const nom = coupe.pop() ?? ''
  const prefixes = coupe

  // Un role, avec ou sans degre d opacite : il garde son nom, c est lui le
  // contrat entre la doctrine, le balisage et le controle.
  if (ROLES.has((nom.split('/')[0] ?? '').replace(/^-/, ''))) return brute

  const exception = EXCEPTIONS[nom]
  const cible = exception ?? `o-${nom}`
  const complet = prefixes.length === 0 ? cible : `${prefixes.join(':')}:${cible}`
  if (!connues.has(complet)) {
    inconnues.add(`${brute} -> ${complet}`)
    return undefined
  }
  return complet
}

/** Une liste de classes, traduite ; l inconnue est signalee et laissee. */
function traduireListe(liste, connues, inconnues) {
  return liste
    .split(/\s+/)
    .filter(Boolean)
    .map((brute) => {
      // Les valeurs arbitraires de Tailwind — `text-[clamp(...)]` — n ont pas
      // d equivalent : le systeme ne compile rien a la volee. La doctrine
      // renvoie desormais la taille d affichage vers un style en ligne.
      if (brute.includes('[')) return brute
      return traduireClasse(brute, connues, inconnues) ?? brute
    })
    .join(' ')
}

/** Reconnait un fragment de code en ligne qui est bien une liste de classes. */
const CLASSE_EN_LIGNE =
  /^(?:[a-z-]+:)*(?:bg|text|border|font|rounded|ease|tracking|grid|flex|gap|col|row|p[xytblr]?|m[xytblr]?|w|h|max|min|items|justify|self|order|leading|aspect|object|z|opacity|shadow|sr|duration|from|via|to)-/

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
  // `reference/` est de la matiere source, « jamais injectee telle quelle »
  // d apres le pack lui-meme. La reecrire falsifierait des documents d origine.
  if (chemin.startsWith('reference/')) return texte

  let sortie = texte

  for (const [avant, apres] of PHRASES) {
    if (sortie.includes(avant)) sortie = sortie.split(avant).join(apres)
  }

  // Le pont vers les utilitaires. Il est dans le runtime et, recopie, dans la
  // page d exemple : on ferme sur l accolade appariee, pas sur la premiere.
  let pont = sortie.indexOf('@theme inline {')
  while (pont !== -1) {
    let profondeur = 0
    let ferme = -1
    for (let i = sortie.indexOf('{', pont); i < sortie.length; i += 1) {
      if (sortie[i] === '{') profondeur += 1
      else if (sortie[i] === '}') {
        profondeur -= 1
        if (profondeur === 0) {
          ferme = i
          break
        }
      }
    }
    if (ferme === -1) break
    sortie = sortie.slice(0, pont) + PONT_ODORO + sortie.slice(ferme + 1)
    pont = sortie.indexOf('@theme inline {')
  }

  sortie = sortie.replace(
    /class="([^"]*)"/g,
    (_, liste) => `class="${traduireListe(liste, connues, inconnues)}"`,
  )
  sortie = sortie.replace(/`([a-z0-9][a-z0-9:/\\[\]().,%-]*)`/g, (tout, contenu) =>
    CLASSE_EN_LIGNE.test(contenu) ? `\`${traduireListe(contenu, connues, inconnues)}\`` : tout,
  )

  for (const [motif, valeur] of OUTILS) sortie = sortie.replace(motif, valeur)

  return sortie.replace('__APPOINTS__', APPOINTS)
}

export { PONT_ODORO }
