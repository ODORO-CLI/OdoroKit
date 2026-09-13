# ODORO Design Pack — document de passation

**Pour qui :** le Claude (et les développeurs) qui travaillent sur le SaaS de génération de sites.
**Objectif :** donner au LLM qui génère les sites les mêmes compétences de mise en page, de design, de typographie et d'animations de révélation que le plugin d'origine. Les prompts sont prêts à brancher, les données sont structurées, le moteur d'animation et les contrôles qualité sont fournis.

> Si tu es le Claude chargé de l'intégration : lis ce fichier en entier avant de toucher au code, puis commence par l'**étape 0**. Ne charge jamais `reference/ODORO-Documentation-Complete.md` d'un bloc (≈ 450 000 tokens) ; ouvre-le seulement par recherche ciblée.

---

## 1. Contenu du pack

```
ODORO-Design-Pack/
├── README.md                     ← ce document
├── prompts/                      ← texte injecté dans les appels au LLM (anglais : meilleure adhérence ; le site sort dans la langue du brief)
│   ├── 00-system-core.md         la doctrine de design, commune à tous les appels (~2,5 k tokens)
│   ├── 10-planner.md             appel 1 : brief → plan du site
│   ├── 20-section-builder.md     appel 2 : une section → HTML Tailwind
│   └── 30-reviewer.md            appel 3 (optionnel) : relecture + corrections
├── schemas/                      ← JSON Schema des sorties (sorties structurées)
│   ├── site-plan.schema.json
│   ├── section-output.schema.json
│   └── review-output.schema.json
├── data/                         ← bibliothèque chargée côté serveur et injectée dans les prompts
│   ├── compositions.index.json   109 squelettes de mise en page, version courte (pour le planificateur, ~18 k tokens)
│   ├── compositions.json         les mêmes en version complète : slots, typo, espace, équilibre, wireframe (~700 tokens chacune)
│   ├── styles.json               46 directions de style (voix, traitement)
│   ├── palettes.json             39 palettes (4 rôles + encre lisible)
│   ├── fonts.json                15 typos (stack CSS, URL d'import, graisses, associations, règles)
│   └── tokens.json               vocabulaire des 24 tokens + axes du brief
├── runtime/                      ← code inclus dans CHAQUE site généré
│   ├── odoro-motion.css          styles du moteur d'animation + loader
│   ├── odoro-motion.js           moteur d'animation (0 dépendance, ~8 Ko)
│   └── tokens.template.css       tokens du site + passerelle Tailwind v4
├── eval/
│   └── lint.mjs                  contrôle automatique d'une page générée (node, 0 dépendance)
├── examples/                     ← la référence « ce qui est attendu »
│   ├── odoro-architecture.plan.json   plan valide vis-à-vis du schéma
│   ├── odoro-architecture.html        page construite selon le contrat (0 FAIL au lint, testée Chrome + WebKit)
│   └── assets/
└── reference/                    ← pour maintenir les prompts ; jamais injecté tel quel
    ├── build-guide.md, combination-rules.md, reveal-choreography.md   textes sources de la doctrine
    ├── sections.catalogue.json, templates.catalogue.json            descriptions détaillées des sections et templates d'origine (inspiration)
    ├── project-state-schema.md
    └── ODORO-Documentation-Complete.md                              toute la documentation d'origine, brute
```

**Ce que le pack apporte :** la méthode de conception (compositions + un seul Style + contenu), les règles de combinaison, les 109 compositions, les typos, les palettes, les directions de style, la chorégraphie de révélation, et un moteur d'animation qui l'exécute.

**Ce qu'il n'apporte pas :** les scènes 3D, les fonds vidéo et le code des templates d'origine. Il n'y a ni appel au serveur d'origine, ni MCP : tout est local.

---

## 2. Étape 0 — reconnaître le terrain avant d'intégrer

Le client ne connaît pas précisément sa pile technique (« notre propre moteur en Tailwind et un autre truc »). Avant toute modification, établis et note :

1. **Le moteur de rendu :** version de Tailwind (v4 avec `@theme`, ou v3 avec `tailwind.config`), et comment les classes des pages générées sont compilées (build par site, JIT sur le HTML généré, CDN…). Identifie aussi l'« autre truc » : moteur de templates, framework de composants, éditeur visuel ?
2. **Le format de sortie actuel :** HTML brut, composants (React/Vue), JSON de blocs pour un éditeur ? Le pack produit du HTML + classes Tailwind + attributs `data-*`. Si le moteur attend un autre format, garde les prompts et les règles, et adapte seulement la section « Output » du constructeur et le schéma `section-output`.
3. **Les appels au LLM :** où sont les prompts actuels, quel fournisseur et quel SDK, sorties structurées disponibles ou non, streaming, cache de prompt.
4. **Le cycle d'édition :** l'utilisateur final modifie-t-il les sections après génération ? Si oui, les attributs `data-od-section`, `data-composition` et `data-reveal` doivent survivre à l'éditeur.

Présente ces constats au client **avant** d'implémenter, avec le plan d'intégration qui en découle.

---

## 3. Architecture cible

```
brief du client
   │
   ▼
[Appel 1 · Planificateur]  system : 00-system-core + 10-planner + styles + palettes + fonts + compositions.index  (statique → en cache)
   │                         user   : le brief
   ▼  site-plan.json  ── validation JSON Schema + vérification des ids (compositionId, fonts, paletteId existent)
   │
   ├──► [Appel 2 · Constructeur] × N sections, en parallèle
   │       system : 00-system-core + 20-section-builder  (statique) + plan.brief/style/header (par site)  → en cache
   │       user   : l'entrée de la section + SA composition complète (compositions.json) + voisins + médias
   │       ▼ section-output.json (html)
   │
   ▼
[Assemblage]  coquille de page : od-js → polices → odoro-motion.css → tokens → header → sections → loader → odoro-motion.js
   │
   ▼
[eval/lint.mjs]  ── FAIL ? → [Appel 3 · Relecteur] (plan + html + rapport lint) → sections corrigées → re-lint (2 tours max)
   │
   ▼
site généré
```

Pourquoi plusieurs appels plutôt qu'un seul gros prompt :
- le plan fige le Style **une fois**, et chaque section le reçoit tel quel, ce qui évite la dérive d'une section à l'autre ;
- chaque section ne reçoit que **sa** composition (~700 tokens) au lieu des 107 000 tokens de la bibliothèque complète ;
- les sections se génèrent en parallèle, et une section ratée se régénère seule.

---

## 4. Où mettre chaque fichier

| Fichier | Destination dans le SaaS | Utilisé quand |
|---|---|---|
| `prompts/*.md` | le dossier des prompts du backend, versionné | à chaque appel LLM |
| `schemas/*.json` | à côté des prompts | sortie structurée + validation de chaque réponse |
| `data/*.json` | ressources du backend (chargées une fois au démarrage) | injectées dans les appels 1 et 2 |
| `runtime/odoro-motion.{css,js}` | assets statiques servis avec **chaque** site généré (ou intégrés au bundle du moteur) | dans la page finale |
| `runtime/tokens.template.css` | template de la couche de rendu, rempli depuis `plan.style.tokens` | à l'assemblage de chaque site |
| `eval/lint.mjs` | outillage : CI **et** étape de contrôle du pipeline | après l'assemblage |
| `examples/` | tests de non-régression | CI : l'exemple doit toujours passer le lint |
| `reference/` | documentation interne | maintenance des prompts uniquement |

---

## 5. Construire les appels au LLM

### Ordre du contenu, pour le cache

Le cache de prompt fonctionne par **préfixe identique**. Mets toujours le stable avant le variable :

1. **Appel 1 (planificateur) :** `system` = `00-system-core.md` + `10-planner.md` + un bloc de données (`styles`, `palettes`, `fonts`, `compositions.index`, sérialisés toujours dans le même ordre, clés triées). C'est environ 43 000 tokens identiques pour tous les clients, à mettre en cache. `user` = le brief.
2. **Appel 2 (constructeur) :** `system` = `00-system-core.md` + `20-section-builder.md`, puis un second bloc avec `plan.brief`, `plan.style` et `plan.header`, identique pour toutes les sections d'un même site. `user` = l'entrée de la section, sa composition complète, ses voisins et ses médias.
   - Les appels lancés **exactement en même temps** ne profitent pas du cache. Lance la première section, puis les autres en parallèle dès que sa réponse commence à arriver (ou pré-chauffe le cache).
3. **Appel 3 (relecteur) :** `system` = `00-system-core.md` + `30-reviewer.md`. `user` = le plan, le HTML et le rapport de `lint.mjs --json`.

Ne mets jamais de valeur changeante (date, identifiant de requête, nom d'utilisateur) dans la partie en cache.

### Sorties structurées

Utilise le mode JSON Schema du fournisseur avec les fichiers de `schemas/`. Valide quand même chaque réponse côté serveur (Ajv ou équivalent), puis vérifie les références : `compositionId` présent dans `compositions.index.json` avec le bon `role`, `fonts.*.id` dans `fonts.json`, `paletteId` dans `palettes.json`. Si une vérification échoue, relance l'appel en joignant le message d'erreur.

### Si le SaaS utilise l'API Claude

Charge le skill `claude-api` pour la syntaxe exacte du SDK utilisé. Repères au 13/09/2026 :
- **Modèle :** `claude-opus-5` par défaut ; mesure avant de changer.
- **Réflexion :** adaptative (`thinking: {type: "adaptive"}`, active par défaut sur Opus 5). Règle l'effort par appel via `output_config.effort` : `high` pour le planificateur, à mesurer (`medium` / `high`) pour le constructeur.
- **Sorties structurées :** `output_config.format` avec le schéma, ou `client.messages.parse()`. Pas de pré-remplissage de la réponse (refusé sur les modèles actuels).
- **Cache :** `cache_control: {type: "ephemeral"}` sur les blocs `system` stables. Vérifie `usage.cache_read_input_tokens` : s'il reste à 0, quelque chose invalide le préfixe.
- **Streaming :** pour les appels à longue sortie (sections, relecture).
- **Refus :** active les fallbacks côté serveur (`fallbacks: "default"`) et vérifie `stop_reason` avant de lire la réponse.

### Avec un autre fournisseur

Même architecture et mêmes prompts. Seuls changent la syntaxe du mode JSON Schema et le mécanisme de cache.

---

## 6. Assembler la page

Coquille, dans cet ordre :

```html
<!doctype html>
<html lang="{plan.language}">
<head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>…</title>
  <script>document.documentElement.classList.add('od-js')</script>      <!-- toujours en premier -->
  <!-- polices : pour plan.style.fonts.display/body, prendre importUrl dans data/fonts.json,
       en limitant les graisses à celles listées dans le plan -->
  <link rel="stylesheet" href="/odoro/odoro-motion.css" />
  <link rel="stylesheet" href="/site/{id}/tokens.css" />                 <!-- tokens.template.css rempli, compilé par Tailwind -->
</head>
<body class="bg-bg text-ink font-body">
  {header construit depuis plan.header, avec data-od-gate}
  <main>{sections dans l'ordre du plan ; la dernière peut être un <footer>}</main>
  {loader si plan.loader.enabled : markup de 00-system-core.md § 5, avec label/tagline du plan}
  <script src="/odoro/odoro-motion.js"></script>                         <!-- toujours en dernier -->
</body>
</html>
```

`examples/odoro-architecture.html` est l'exemple complet. Il utilise le build navigateur de Tailwind uniquement pour être autonome ; en production, compile avec le Tailwind du moteur.

Le header et le loader sont assemblés depuis le plan, sans appel LLM, pour rester identiques d'une page à l'autre.

---

## 7. Tailwind

**Tailwind v4 :** `runtime/tokens.template.css` est prêt. Il crée les utilitaires `bg-bg`, `text-ink`, `text-ink-muted`, `border-line`, `bg-accent`, `font-display`, `font-body`, `font-heading`, `tracking-display`, `rounded-od`, `ease-od`… dont dépend tout le prompt. Ne renomme pas ces utilitaires sans mettre à jour `00-system-core.md` et `eval/lint.mjs`.

**Tailwind v3 :** équivalent dans `tailwind.config.js`, en gardant les variables CSS `:root` du template :

```js
theme: { extend: {
  colors: { bg: 'var(--od-bg)', 'bg-alt': 'var(--od-bg-alt)', surface: 'var(--od-surface)', 'surface-raised': 'var(--od-surface-raised)',
            ink: 'var(--od-ink)', 'ink-muted': 'var(--od-ink-muted)', 'ink-subtle': 'var(--od-ink-subtle)',
            accent: 'var(--od-accent)', 'accent-ink': 'var(--od-accent-ink)', line: 'var(--od-line)', glow: 'var(--od-glow)' },
  fontFamily: { display: 'var(--od-font-display)', body: 'var(--od-font-body)', mono: 'var(--od-font-mono)' },
  fontWeight: { heading: 'var(--od-weight-display)' },
  letterSpacing: { display: 'var(--od-tracking-display)' },
  borderRadius: { od: 'var(--od-radius)', 'od-lg': 'var(--od-radius-lg)' },
  transitionTimingFunction: { od: 'var(--od-ease)' },
} }
```

En v3, les modificateurs d'opacité (`text-ink/70`) ne fonctionnent pas avec des couleurs en `var()` simples. Déclare les couleurs en canaux (`rgb(var(--od-ink-rgb) / <alpha-value>)`) ou retire ces modificateurs du prompt.

**Compilation :** les classes arbitraires générées par le LLM (`text-[clamp(...)]`, `grid-cols-[...]`) doivent être vues par le compilateur. Compile le CSS **par site**, à partir de son HTML généré.

---

## 8. Qualité

1. **`eval/lint.mjs` à chaque génération :** `node eval/lint.mjs page.html plan.json --json`. Le moindre FAIL déclenche l'appel 3 ou une régénération de la section fautive. Il contrôle :
   - les couleurs en dur ;
   - la composition déclarée par chaque section, comparée au plan ;
   - le `h1` unique dans le hero ;
   - le blocage d'affichage limité au header et au hero ;
   - la présence du loader ;
   - les règles d'animation (`letters` ≤ 24 caractères, pas de rognage d'un révélé mot par mot, pas d'`animate-*`) ;
   - la typo (serif d'affichage jamais en petit) ;
   - le rationnement de l'accent ;
   - les textes alternatifs ;
   - le rythme du plan.
2. **Le relecteur (appel 3)** juge ce qu'un script ne peut pas voir : fidélité à la composition, pile centrée générique, cohérence, qualité des textes, faits inventés.
3. **Non-régression :** en CI, l'exemple doit rester à 0 FAIL, et le plan d'exemple doit valider son schéma.
4. **Évaluation continue (recommandé) :** constitue une vingtaine de briefs variés (secteurs, tons, sites vitrines et applications). Génère-les à chaque modification des prompts, puis compare le taux de lint réussi, le verdict du relecteur et une note humaine sur 5 critères : composition, cohérence, rythme, animations, textes.

---

## 9. Ce qu'il ne faut pas casser

- **Les timings du loader et du moteur** (`runtime/odoro-motion.js`, bloc `CONFIG`) sont l'élément de valeur : compte linéaire de 2 000 ms, fondu des libellés de 300 ms, pause de 200 ms, ressort 90/20, contenu qui démarre 500 ms après la fin du compte et traverse le rideau. Ne les « simplifie » pas.
- **Le vocabulaire** doit rester identique dans les prompts, le runtime, le lint et les schémas :
  - les attributs `data-reveal`, `data-od-gate`, `data-od-loader`, `data-od-section`, `data-composition` ;
  - les 24 tokens `--od-*` et leurs utilitaires ;
  - les ids de `data/`.
- **Les données** (`data/`) sont un instantané du 13/09/2026. Pour les enrichir, ajoute des entrées au même format, ajoute ensuite les nouveaux ids au lint et à l'exemple si besoin, et relance la CI.

---

## 10. Checklist de fin d'intégration

- [ ] Étape 0 documentée et validée avec le client (Tailwind, format de sortie, fournisseur, éditeur).
- [ ] Les trois appels branchés, avec leurs sorties structurées et la validation des schémas et des ids.
- [ ] Cache vérifié en conditions réelles (`cache_read_input_tokens` > 0 dès le 2e site).
- [ ] Coquille d'assemblage : `od-js` en premier, runtime CSS et JS, tokens par site, polices limitées aux graisses du plan.
- [ ] Tailwind compile les classes arbitraires générées.
- [ ] `lint.mjs` intégré au pipeline et à la CI ; l'exemple passe à 0 FAIL.
- [ ] Boucle relecteur limitée à 2 tours.
- [ ] 20 briefs de test générés et évalués, résultats partagés avec le client.
- [ ] Vérification visuelle dans Chrome **et** Safari, sur ordinateur et mobile (le loader, le blocage et le déblocage du scroll, les animations).
