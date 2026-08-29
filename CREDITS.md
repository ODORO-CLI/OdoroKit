# Credits

Ce projet incorpore des valeurs de design issues de logiciels tiers.

## Tailwind CSS

Les design tokens d'Odoro (`packages/odoro-libs/src/styles/tokens.ts`) sont
construits sur l'integralite des tokens de Tailwind CSS : palette de 288
couleurs en OKLCH, echelle typographique, rayons, ombres, flous, conteneurs,
perspectives et courbes de Bezier.

Ces valeurs sont extraites mecaniquement de `tailwindcss/theme.css` par
`packages/odoro-libs/scripts/import-tailwind-tokens.ts` et figees dans
`packages/odoro-libs/src/styles/generated/tailwindTokens.ts`. Tailwind CSS
reste une `devDependency` : aucun de son code n'est distribue dans les paquets
publies, seules les valeurs de tokens le sont.

Aucun code source de Tailwind CSS n'est copie ni porte : le generateur
d'utilitaires d'Odoro est une implementation independante.

> Copyright (c) Tailwind Labs, Inc.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## GSAP

`@odoro-cli/engine` s'appuie sur GSAP pour l'orchestration temporelle et pour sa
boucle de rendu. GSAP est declare en dependance explicite et **jamais
vendore** : sa licence interdit de retirer ou d'alterer ses notices de
propriete, ce qui exclut de l'inliner dans un bundle publie.

> Copyright (c) Webflow, Inc.
>
> Distribue sous la « Standard no charge license » de GSAP :
> <https://gsap.com/standard-license>

### Une clause a garder en tete

La licence autorise l'usage commercial sans frais, plugins historiquement
reserves aux membres compris. Elle interdit en revanche l'emploi de GSAP dans
« _tools that allow users to build visual animations **without code**_ »
concurrencant les capacites de construction d'animations de Webflow.

Odoro s'adresse a des developpeurs qui ecrivent du code, et son site de
documentation restitue du code a copier : nous sommes hors du champ de
l'interdiction.

**La ligne rouge est nette** : le jour ou Odoro permettrait de composer une
timeline arbitraire sur un canevas visuel et de l'exporter sans ecrire une
ligne de code, cet usage basculerait dans l'interdit. Le panneau de diagnostic
du moteur est volontairement en lecture seule pour cette raison.

## OGL

Backend graphique leger du moteur, charge a la demande pour les effets plein
ecran en shader de fragment.

> OGL est place dans le **domaine public** sous la licence Unlicense.

Aucune notice n'est donc juridiquement exigee. Elle figure ici par correction :
un travail dont on se sert merite d'etre nomme, licence ou pas.

## Three.js

Backend graphique du moteur pour les scenes 3D veritables — camera, eclairage,
materiaux, profondeur. Charge exclusivement par import dynamique, depuis
l'entree `@odoro-cli/engine/three`.

> Copyright (c) 2010 three.js authors — licence MIT

## Zod

Le schema du registre (`packages/odoro/src/registry/schema.ts`) est ecrit avec
Zod, dans sa variante `zod/mini`. Contrairement aux autres dependances de ce
document, Zod est **integre a la compilation** du paquet `odoro` : son code se
retrouve donc dans l'artefact publie, et la notice ci-dessous y est
juridiquement exigee.

Le choix de la variante `mini` est mesure : treize kilo-octets minifies contre
quatre cent vingt-sept pour l'API usuelle, a validation identique.

> Copyright (c) 2020 Colin McDonnell
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## Shaders

Les shaders livres avec le moteur sont ecrits depuis leurs principes : fonction
de hachage, bruit de valeur a interpolation lissee, somme d'octaves,
deplacement de domaine, deduction de lignes par derivee d'ecran. Aucun n'est
repris d'une implementation trouvee en ligne.

Ce n'est pas une precaution excessive. Beaucoup de shaders partages
publiquement le sont sous des licences non commerciales, et la ressemblance
entre deux implementations d'une meme technique rend l'origine difficile a
etablir apres coup. La mathematique sous-jacente est de toute facon plus courte
a redemontrer qu'a verifier juridiquement — et chaque fonction porte
l'explication de ce qu'elle fait et pourquoi.

## Jeux d'icones

`@odoro-cli/icons` ne dessine aucune icone. Il **importe** cinq jeux tiers, les
normalise sur un contrat commun — une boite, un mode, une liste de noeuds — et
en publie un module par jeu. Les traces sont ceux de leurs auteurs.

Les paquets sources restent des `devDependencies` : ils ne sont lus que par
`packages/odoro-icons/scripts/import-icons.ts`, et rien de leur code n'est
distribue. Ce qui l'est, ce sont les donnees de trace, sous les licences
ci-dessous.

Conformement a la regle de nommage du projet, les modules portent le caractere
du dessin et non sa provenance. La correspondance est ici, et nulle part
ailleurs.

| Module                   | Jeu d'origine                    | Licence         | Icones |
| ------------------------ | -------------------------------- | --------------- | ------ |
| `@odoro-cli/icons/filaire`   | Lucide                           | ISC             | 2048   |
| `@odoro-cli/icons/compact`   | Bootstrap Icons                  | MIT             | 2078   |
| `@odoro-cli/icons/classique` | Font Awesome Free (solid)        | CC BY 4.0       | 2001   |
| `@odoro-cli/icons/etendu`    | Material Symbols (outlined, 400) | Apache-2.0      | 3903   |
| `@odoro-cli/icons/marques`   | Font Awesome Free (brands)       | voir ci-dessous | 609    |

### Lucide

Derive de Feather Icons, sous licence ISC.

> Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part
> of Feather (MIT). All other copyright (c) for Lucide are held by Lucide
> Contributors 2022.
>
> Permission to use, copy, modify, and/or distribute this software for any
> purpose with or without fee is hereby granted, provided that the above
> copyright notice and this permission notice appear in all copies.

### Bootstrap Icons

> Copyright (c) 2019-2024 The Bootstrap Authors — licence MIT

### Font Awesome Free

Les icones du jeu gratuit sont sous **CC BY 4.0**, qui exige une attribution.
C'est l'objet de cette section. Seul le jeu gratuit est employe : aucun contenu
Pro n'est lu, importe ni distribue.

> Copyright 2026 Fonticons, Inc.
>
> Icones : CC BY 4.0 — <https://creativecommons.org/licenses/by/4.0/>
> Polices : SIL OFL 1.1 — Code : MIT
> <https://fontawesome.com/license/free>

Les polices ne sont pas employees : seuls les traces SVG le sont.

### Material Symbols

> Copyright Google LLC — licence Apache 2.0
> <https://www.apache.org/licenses/LICENSE-2.0>

### Marques : une question de droit des marques, pas de licence

`@odoro-cli/icons/marques` contient 609 logos de services et de plateformes. Ils
sont distribues par Font Awesome au sein du jeu gratuit, mais la licence CC BY
**ne les couvre pas** : ce sont des marques deposees, et leur emploi releve des
regles de chaque proprietaire, pas de celles de Font Awesome.

Ce que cela veut dire en pratique :

- afficher le logo d'un service pour designer ce service — un bouton
  « se connecter avec », un lien vers un profil — est l'usage nominatif
  ordinaire, et ne pose pas de difficulte ;
- s'en servir pour suggerer une affiliation, un partenariat ou un soutien qui
  n'existe pas ne devient pas licite parce que le fichier etait dans un paquet
  libre ;
- modifier un logo — couleur imposee, proportions, recadrage — est
  generalement interdit par les chartes de marque, alors que le composant le
  permet techniquement.

Ce jeu est donc separe des autres, et son module le rappelle a l'import.
