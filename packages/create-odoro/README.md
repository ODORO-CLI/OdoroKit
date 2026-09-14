# create-odoro

The official Odoro scaffolder.

```sh
npm create odoro@latest
```

## What it asks

```
┌   ODORO  v1.0.1
│
◇  Project name · web
◇  Template · react-ts
◇  What goes in the project?
│  ◼ Libraries   styles, tokens, UI and motion
│  ◼ Router      ships with the libraries — wires up the pages
│  ◼ Icons       five families, imported one by one
│  ◻ Engine      WebGL, surfaces and motion policy
│  ◻ Component registry
◇  Package manager · npm
◇  Initialize a git repository? · No
◇  Install dependencies with npm? · Yes
```

Every box changes the project that is written. Unchecking one removes its
package from the manifest; unchecking the router leaves a single page and no
`router.tsx`; unchecking the libraries gives a bare React app styled in plain
CSS. Nothing is checked that cannot be unchecked.

## Without any questions

```sh
npm create odoro@latest my-app -- --yes --modules=libs,router,icons
npm create odoro@latest my-app -- --yes --modules=none
```

| Flag                | Effect                                                    |
| ------------------- | --------------------------------------------------------- |
| `--template <name>` | `react-ts` or `react-ts-server`.                           |
| `--modules <list>`  | `libs,router,icons,engine,registre` — or `none`.           |
| `--pm <name>`       | `pnpm`, `npm`, `yarn` or `bun`.                            |
| `--no-git`          | Skip the git repository.                                   |
| `--no-install`      | Skip the dependency install.                               |
| `--overwrite`       | Empty the target folder first.                             |
| `--merge`           | Write over the existing contents.                          |
| `--yes`             | Accept every default without asking.                       |

## Two boxes that are not packages

**The router** lives in `@odoro-cli/libs/router`, a subpath of the libraries.
Checking it wires the pages into the generated app; unchecking it uninstalls
nothing.

**The registry** has no package at all. Its entries are copied into your project
one by one by `odoro add`. Checking it writes `odoro.json` so that command works
the moment the project exists.

## What it contains

This package holds no logic of its own. npm requires the `create-` name for
`npm create odoro` to work, so it exists for that reason alone and delegates to
`odoro create` — which guarantees the two behave identically.

## Links

- Documentation — <https://odoro.dev/docs/installation>
- Source — <https://github.com/ODORO-CLI/OdoroKit>

## Licence

UNLICENSED. Copyright (c) BouBouw. See `LICENSE`.
