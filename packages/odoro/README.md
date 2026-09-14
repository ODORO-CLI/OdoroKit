# odoro

The Odoro engine: a development server with hot reload, a production build, and
the component registry client.

```sh
npm create odoro@latest
```

That single command scaffolds a project and installs everything below. This
package is what it installs.

## Commands

| Command          | What it does                                              |
| ---------------- | --------------------------------------------------------- |
| `odoro dev`      | Development server with hot module replacement.           |
| `odoro build`    | Production build into `dist/`.                            |
| `odoro preview`  | Serves `dist/` the way a static host would.               |
| `odoro create`   | Scaffolds a project — same thing as `npm create odoro`.   |
| `odoro init`     | Writes `odoro.json` so `odoro add` knows where to write.  |
| `odoro add <id>` | Copies a registry component into your project.            |
| `odoro list`     | Prints the registry catalogue.                            |
| `odoro diff`     | Compares what is installed with what the registry serves. |
| `odoro doctor`   | Checks that the project is in a fit state.                |

Run `odoro --help` for the full list, including the database commands.

## Configuration

```ts
// odoro.config.ts
import { defineConfig } from 'odoro'

export default defineConfig({
  alias: { '@': 'src' },
  server: { port: 5180 },
})
```

## The registry is not a dependency

`odoro add text/count-up` **copies the source into your project**. The code is
then yours: read it, change it, delete it. Nothing updates behind your back, and
there is no package to keep in step.

```sh
odoro add text/count-up
# + src/odoro/hooks/useInView.ts
# + src/odoro/text/CountUp.tsx
```

Entries that need an npm package say so, and `odoro add` tells you which one is
missing before you find out at build time.

## Hot reload keeps your state

Editing a component swaps its code without unmounting the tree: a counter's
value, the text in a field, the open tab all survive the edit. A stylesheet is
swapped without a reload.

A module that exports something other than components reloads the page, and that
is correct — nothing would let us propagate the change safely.

## Links

- Documentation — <https://odoro.dev/docs>
- Component registry — <https://odoro.dev/docs/registry>
- Source — <https://github.com/ODORO-CLI/OdoroKit>

## Licence

UNLICENSED. Copyright (c) BouBouw. See `LICENSE`.
