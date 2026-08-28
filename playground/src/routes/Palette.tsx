import { colorLight, palette, space } from 'odoro-libs'

/** Teintes de la palette brute, dans leur ordre de declaration. */
const HUES = [
  ...new Set(
    Object.keys(palette)
      .filter((key) => /-\d+$/.test(key))
      .map((key) => key.replace(/-\d+$/, '')),
  ),
]

/** Nuances presentes pour chaque teinte. */
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

/** Page presentant les tokens de couleur et d'espacement. */
export function Palette() {
  return (
    <div className="o-flex o-flex-col o-gap-10">
      <section className="o-flex o-flex-col o-gap-4">
        <h1 className="o-text-2xl o-font-bold">Couleurs semantiques</h1>
        <p className="o-text-sm o-text-fg-muted">
          Ce sont les seules couleurs que manipulent les composants de la librairie. Les
          surcharger retheme tout, sans toucher a leur code.
        </p>
        <div className="o-grid o-grid-cols-2 md:o-grid-cols-4 o-gap-3">
          {Object.keys(colorLight).map((name) => (
            <div key={name} className="o-flex o-flex-col o-gap-1">
              <div
                className="o-h-10 o-rounded-md o-border-w-1 o-border-border"
                style={{ backgroundColor: `var(--o-color-${name})` }}
              />
              <code className="o-text-xs o-font-mono o-text-fg-muted o-truncate">
                {name}
              </code>
            </div>
          ))}
        </div>
      </section>

      <section className="o-flex o-flex-col o-gap-4">
        <h2 className="o-text-xl o-font-semibold">Palette brute</h2>
        <p className="o-text-sm o-text-fg-muted">
          {HUES.length} teintes de {SHADES.length} nuances, plus le noir, le blanc et la
          teinte de marque.
        </p>
        <div className="o-flex o-flex-col o-gap-2 o-overflow-auto">
          {HUES.map((hue) => (
            <div key={hue} className="o-flex o-items-center o-gap-2">
              <code className="o-text-xs o-font-mono o-text-fg-muted o-w-20 o-shrink-0">
                {hue}
              </code>
              <div className="o-flex o-flex-1 o-gap-1">
                {SHADES.map((shade) => (
                  <div
                    key={shade}
                    title={`${hue}-${shade}`}
                    className="o-h-8 o-flex-1 o-rounded-sm"
                    style={{ backgroundColor: `var(--o-palette-${hue}-${shade})` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="o-flex o-flex-col o-gap-4">
        <h2 className="o-text-xl o-font-semibold">Espacement</h2>
        <div className="o-flex o-flex-col o-gap-1">
          {Object.keys(space)
            .slice(0, 14)
            .map((step) => (
              <div key={step} className="o-flex o-items-center o-gap-3">
                <code className="o-text-xs o-font-mono o-text-fg-muted o-w-12 o-shrink-0">
                  {step}
                </code>
                <div
                  className="o-h-3 o-bg-primary o-rounded-sm"
                  style={{ width: `var(--o-space-${step.replace('.', '_')})` }}
                />
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
