# Altitude

Agence immobilière. Un plan-séquence de quarante secondes scrubé au
défilement, une tour détourée en WebGL, et une seule encre — le blanc, baissé à
l'alpha — pour toute la hiérarchie.

## Démarrer

```sh
npm install
npm run dev
```

## Ce que ce portage a changé, et ce qu'il n'a pas changé

Le design n'a pas bougé : les deux premiers étages de `src/styles.css` — les
primitives et les rôles — sont ceux de l'original, mot pour mot, et le balisage
est le même à la chaîne de classes près.

Ce qui a changé est le moteur, et ce qu'il fallait pour l'atteindre :

| Avant | Après |
| --- | --- |
| Next 16, App Router | `index.html` + `src/main.tsx`, servis par le moteur Odoro |
| `next/font` | `@font-face` dans `src/styles.css`, polices dans `src/fonts/` |
| Utilitaires Tailwind | Utilitaires `o-` du système, plus les classes du projet |
| `@theme inline` | Des règles CSS ordinaires, troisième étage de la feuille |

Les classes que notre générateur ne produit pas — celles que l'original
écrivait en valeurs arbitraires, `text-[0.95rem]`, `px-[max(1.5rem,4vw)]` —
sont devenues des classes `al-*` déclarées dans la feuille, avec exactement la
même déclaration. La table de correspondance est dans
`scripts/lib/altitude-classes.mjs`, à la racine du dépôt.

**La préséance du gabarit.** Les huit règles que le gabarit se donne —
`.display`, `.label`, `.glass`, `.mask-line`, `.reveal-word`, `.sr-only` —
répètent leur nom trois fois. Chez l'autre moteur le CSS de l'auteur n'est pas
en couche et bat les utilitaires quelle que soit la spécificité ; ici c'est la
spécificité qui doit le dire.

Vérification : à 390, 768 et 1440 px, les 418 nœuds du `main` ont exactement la
même boîte que l'original, et les deux socles concordent sur quinze balises et
vingt propriétés.

## Trois choses à savoir avant d'y toucher

**Les sélecteurs de la feuille répètent leur classe.** `.bg-ground.bg-ground`
n'est pas une coquille : les utilitaires du système sont écrits après cette
feuille dans le paquet final, et à spécificité égale c'est le dernier qui
gagne. Voir la note en tête du troisième étage.

**Les centrages passent par `translate`, pas par `transform`.** Le mot géant de
la section « tour » est déplacé au défilement par un `transform` posé en ligne :
écrit en `transform`, le centrage serait écrasé à la première image.

**Deux déclarations de l'original ne s'appliquaient pas dans le navigateur.**
Elles sont rétablies ici, et c'est la seule raison pour laquelle cette page ne
ressemble pas exactement à celle d'où elle vient.

La première est la police de titrage. `@theme inline`
liait `--font-display` à une variable posée sur `body` en l'écrivant sur
`:root`, où elle n'existe pas — toute la page tombait sur la pile système,
malgré trois `woff2` embarqués. Elle est rétablie ici. Pour retrouver
exactement ce que l'original affichait, remplacer les deux valeurs en tête du
troisième étage par la pile système.

La seconde est le flou du verre. `.glass` déclare
`backdrop-filter: blur(var(--glass-blur))`, et le navigateur calculait `none`
sur l'original : les panneaux n'étaient que des voiles noirs à 28 %, sans rien
dépolir derrière eux. Ici le flou opère, comme le commentaire de la règle le
décrit — « glass reads as bevelled light rather than as a card ». Retirer la
ligne `backdrop-filter` de `.glass` retrouve l'ancien rendu.

## Les polices

Voir `src/fonts/LICENCES.md` : Gilda Display est sous SIL OFL, General Sans
sous ITF Free Font License. Les deux autorisent l'usage commercial ; la seconde
interdit la revente des fichiers.

## Licence

Unlicense — domaine public, comme le dépôt d'origine.
