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

Useful flags: `--mode <name>` picks the `.env` files and fills
`import.meta.env.MODE`; `--prerender` renders routes to HTML; `--open` opens the
browser; `--strict-port` fails instead of sliding to the next free port.

## Configuration

```ts
// odoro.config.ts
import { defineConfig } from 'odoro'

export default defineConfig({
  alias: { '@': 'src' },
  server: { port: 5180 },
  build: { prerender: true },
})
```

## Environment variables

`.env` files are read for the current mode, least specific first:

```
.env  →  .env.local  →  .env.<mode>  →  .env.<mode>.local
```

A variable already present in the process environment is **never** overwritten by
a file, so whatever your host injects wins.

Only variables prefixed `ODORO_` reach the browser, through `import.meta.env`.
Everything else stays on the machine — it is readable by the CLI and by your
backend, and never enters the published bundle.

```sh
# .env
ODORO_API=https://api.example.dev   # shipped to the browser
DATABASE_URL=postgres://…           # stays here
```

Values may be quoted, span several lines (a PEM key), and refer to one another
with `$OTHER`. Single quotes disable both escapes and expansion, which is how you
write a password containing a `$`.

Pick the mode with `--mode`: `odoro build --mode staging` reads `.env.staging`
and sets `import.meta.env.MODE`.

## Pre-rendering

An SPA ships an empty document. A visitor never notices; a search engine, a link
preview and a screen reader do. `build.prerender` renders your routes to HTML at
build time, and the client hydrates them instead of rebuilding.

```tsx
// src/entry-server.tsx
import { renderToString } from 'react-dom/server'
import { App } from '@/App'

export const routes = ['/', '/pricing']

export function render(url: string) {
  return { html: renderToString(<App url={url} />), head: `<title>…</title>` }
}
```

`/pricing` becomes `dist/pricing/index.html`, which any static host serves
without configuration. Nothing runs in production — the output is still files.

## Build output

`dist/manifest.json` maps every entry to its fingerprinted file, its stylesheets
and its chunks, so a backend that renders its own document knows what to point
at. Shared chunks are declared as `modulepreload` in the document, which removes
one round trip per level of import depth.

Sizes are reported both raw and gzipped, because gzipped is what ships.

## Import suffixes and patterns

```ts
import charter from './CHARTER.md?raw' // the file's text
import logo from './logo.svg?url' // its public URL, nothing loaded
import Worker from './work.ts?worker' // compiled separately, run off-thread

const pages = import.meta.glob('./pages/*.tsx')
const titles = import.meta.glob('./pages/*.tsx', { eager: true, import: 'title' })
```

Patterns are resolved at build time into ordinary static imports, so code
splitting and tree shaking still apply.

## Plugins

Three hooks, plus an escape hatch to esbuild for everything else.

```ts
import { defineConfig, type OdoroPlugin } from 'odoro'

const stamp: OdoroPlugin = {
  name: 'stamp',
  transform: (code, { id }) => (id.endsWith('.tsx') ? code : null),
  transformIndexHtml: (html) => html.replace('</head>', '<meta name="v"></head>'),
  configureServer: ({ use }) => use((req, res, next) => next()),
}

export default defineConfig({ plugins: [stamp] })
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
