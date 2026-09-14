# @odoro-cli/icons

Five icon families for Odoro, imported one at a time.

```sh
npm i @odoro-cli/icons
```

```tsx
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Sparkles } from '@odoro-cli/icons/filaire'

;<Icon of={ArrowRight} className="o-size-5" />
```

## The families

| Entry point                   | Style             | Count |
| ----------------------------- | ----------------- | ----: |
| `@odoro-cli/icons/filaire`    | Outline           |  2050 |
| `@odoro-cli/icons/compact`    | Compact outline   |  2039 |
| `@odoro-cli/icons/classique`  | Classic           |  1993 |
| `@odoro-cli/icons/etendu`     | Extended          |  3838 |
| `@odoro-cli/icons/marques`    | Brand marks       |   608 |

`@odoro-cli/icons/catalogue.json` lists every name, if you need to build a
picker.

## You ship what you import

Each icon is a separate export, so a bundler keeps only the ones your code
names. Importing from a family does not pull the family in.

That is also why the families are separate entry points rather than one big
index: a single barrel would make every icon reachable from one import, and
tree-shaking would have far more work to prove what can go.

## Colour and size come from the outside

Icons are drawn with `currentColor` and sized by their container. They take the
colour of the text around them, in light and dark alike, with nothing to
configure.

```tsx
<span className="o-text-brand-500">
  <Icon of={Sparkles} className="o-size-6" />
</span>
```

## Links

- Documentation — <https://odoro.dev/docs>
- Source — <https://github.com/ODORO-CLI/OdoroKit>

## Licence

UNLICENSED. Copyright (c) BouBouw. See `LICENSE`. Icon sources and their own
licences are listed in `CREDITS.md` at the root of the repository.
