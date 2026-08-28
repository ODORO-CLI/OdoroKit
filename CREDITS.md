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
