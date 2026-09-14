# @odoro-cli/libs

The Odoro libraries: design tokens, a utility stylesheet, UI components, a
router and a motion layer — one package, several entry points.

```sh
npm i @odoro-cli/libs
```

```tsx
import '@odoro-cli/libs/styles.css'
```

## Entry points

| Import                       | What you get                                      |
| ---------------------------- | ------------------------------------------------- |
| `@odoro-cli/libs`            | Everything re-exported.                           |
| `@odoro-cli/libs/ui`         | Buttons, dialogs, tables, forms — 40+ components. |
| `@odoro-cli/libs/router`     | Nested routes, dynamic segments, lazy loading.    |
| `@odoro-cli/libs/motion`     | `Reveal`, `Stagger`, `useAnimate`.                |
| `@odoro-cli/libs/tokens`     | The raw scales, as values.                        |
| `@odoro-cli/libs/styles.css` | The base sheet: variables, preflight, keyframes.  |

## One stylesheet, and it stays small

`styles.css` carries the **base** only — variables, preflight, keyframes. The
utilities are produced at build time, for the classes your code actually uses:
a few tens of kilobytes in practice, with the whole palette available without
anything weighing on the page.

That pruning is the engine's job. With `odoro build` it happens on its own;
without it, the sheet ships whole.

## Theming is one variable deep

Every visual value goes through a CSS variable. Overriding
`--o-palette-brand-500` re-tints the application **and** the library's
components, without touching their code.

```css
:root {
  --o-palette-brand-500: oklch(62.3% 0.214 259.815);
}
```

## The router is a subpath, not a package

`@odoro-cli/libs/router` ships with this package. There is nothing else to
install, and nothing to uninstall if you would rather not use it.

## Links

- Documentation — <https://odoro.dev/docs>
- Source — <https://github.com/ODORO-CLI/OdoroKit>

## Licence

UNLICENSED. Copyright (c) BouBouw. See `LICENSE`.
