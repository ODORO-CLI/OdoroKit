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

`odoro-engine` s'appuie sur GSAP pour l'orchestration temporelle et pour sa
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
