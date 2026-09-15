/**
 * Feature tabs, with one visual per tab.
 *
 * ## Tabs, not buttons
 *
 * The pattern is described by the ARIA practices, and it does not boil down to
 * `role="tab"`. Three rules make the difference between a set of tabs and a
 * row of buttons that looks like one :
 *
 * 1. **A single tab stop.** The whole list is crossed with one press, and the
 *    arrows cycle inside it. Otherwise, eight tabs cost eight presses before
 *    reaching the content.
 * 2. **The arrows wrap.** Once on the last one, the right arrow comes back to
 *    the first ; `Home` and `End` go to the ends.
 * 3. **The panel is named by its tab.** `aria-labelledby` links the two :
 *    without it, the content is announced without one knowing what it is about.
 *
 * ## The inactive panel does not exist
 *
 * It is not hidden by a style : it is removed from the document. A panel masked
 * in CSS stays reachable from the keyboard and readable by find in page, which
 * sends the focus into invisible content — the most common defect of this
 * pattern.
 *
 * ## The change is seen, without redoing it by hand
 *
 * The panel carries a key : React remounts the element on every tab change,
 * and the entrance animation replays by itself. Without this key, the content
 * would change with no signal at all, and the eye would miss half of the
 * switches.
 *
 * ## The underline below the active tab
 *
 * It slides from one tab to the next because its position is a variable, not an
 * element moved by measure : each tab declares its share of the width, and the
 * underline translates to it. No measure, and therefore no resynchronisation to
 * do when the font loads or the window changes size.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** A feature presented. */
export interface Feature {
  /** Name of the tab. */
  readonly title: string
  /** What the feature does. */
  readonly body: ReactNode
  /** A detail under the name, inside the tab. */
  readonly hint?: string
}

/** Properties specific to the component. */
export interface FeatureTabsOwnProps {
  /** The features, in tab order. */
  features: readonly Feature[]
  /** Renders the visual of the active tab. */
  render: (index: number) => ReactNode
  /** Name of the tab set, announced to assistive technologies. */
  label: string
  /** Tab open on first render. @defaultValue 0 */
  initial?: number
}

/** All the properties. */
export type FeatureTabsProps = Customisable<FeatureTabsOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-feature-tabs'

/** Sets the rules of the tabs, once per document. */
function ensureTabsRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ftabs-liste]{position:relative;display:flex;gap:0.25rem;overflow-x:auto}',
    // The underline slides by translation : its width is a fraction of the
    // total, its move a multiple of that fraction. Nothing is measured.
    '[data-o-ftabs-trait]{',
    'position:absolute;bottom:0;left:0;height:2px;',
    'width:calc(100% / var(--o-ftabs-nombre));',
    'transform:translateX(calc(100% * var(--o-ftabs-active)));',
    'transition:transform var(--o-duration-base) var(--o-ease-standard)}',

    '[data-o-ftabs-panneau]{animation:o-ftabs-entree var(--o-duration-slower) var(--o-ease-entrance) both}',
    '@keyframes o-ftabs-entree{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ftabs-trait]{transition:none}',
    '[data-o-ftabs-panneau]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Feature tabs.
 *
 * @example
 * <FeatureTabs
 *   label="What the CLI does"
 *   features={[
 *     { title: 'Add', body: <p>The files are copied into the project.</p> },
 *     { title: 'Diff', body: <p>Local edits are reported.</p> },
 *   ]}
 *   render={(index) => <Screenshot step={index} />}
 * />
 */
export function FeatureTabs({
  features,
  render,
  label,
  initial = 0,
  ...rest
}: FeatureTabsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.15 })
  const base = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [active, setActive] = useState(
    Math.min(Math.max(0, initial), features.length - 1),
  )
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  ensureTabsRules()

  /** Moves the selection and takes the focus along with it. */
  const go = (index: number): void => {
    const target = (index + features.length) % features.length
    setActive(target)
    buttons.current[target]?.focus()
  }

  const onKey = (event: KeyboardEvent<HTMLDivElement>): void => {
    const keys: Readonly<Record<string, number>> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: features.length - 1,
    }
    const target = keys[event.key]
    if (target === undefined) return
    // The arrows drive the list : leaving them to the browser would scroll the
    // page while one changes tab.
    event.preventDefault()
    go(target)
  }

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-6' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={ref}
      aria-label={label}
      className={className}
      style={
        {
          ...style,
          opacity: reduced || inView ? 1 : 0,
          transition: 'opacity var(--o-duration-slower) var(--o-ease-entrance)',
        } as CSSProperties
      }
    >
      <div
        role="tablist"
        aria-label={label}
        data-o-ftabs-liste=""
        onKeyDown={onKey}
        style={
          {
            '--o-ftabs-nombre': String(features.length),
            '--o-ftabs-active': String(active),
            borderBottom: '1px solid var(--o-theme-line)',
          } as CSSProperties
        }
      >
        {features.map((feature, index) => (
          <button
            key={feature.title}
            ref={(element) => {
              buttons.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${String(index)}`}
            aria-selected={index === active}
            aria-controls={`${base}-panel-${String(index)}`}
            // A single tab stop for the whole list : the arrows do the rest,
            // and the content is one key press away.
            tabIndex={index === active ? 0 : -1}
            onClick={() => {
              setActive(index)
            }}
            className="o-flex-1 o-whitespace-nowrap o-px-4 o-py-3 o-text-left o-text-sm focus:o-ring"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: index === active ? 'var(--o-theme-fg)' : 'var(--o-theme-muted)',
              fontWeight: index === active ? 600 : 400,
            }}
          >
            {feature.title}
            {feature.hint !== undefined && (
              <span
                className="o-block o-text-xs o-font-normal"
                style={{ color: 'var(--o-theme-muted)' }}
              >
                {feature.hint}
              </span>
            )}
          </button>
        ))}

        <span
          aria-hidden
          data-o-ftabs-trait=""
          style={{ backgroundColor: 'var(--o-palette-brand-500)' }}
        />
      </div>

      {/*
        A single panel in the document : the one of the other tabs is not
        masked, it does not exist. The key makes it remount on every switch,
        which replays the entrance without any state triggering it.
      */}
      <div
        key={active}
        role="tabpanel"
        id={`${base}-panel-${String(active)}`}
        aria-labelledby={`${base}-tab-${String(active)}`}
        data-o-ftabs-panneau=""
        tabIndex={0}
        className="o-grid o-gap-6 md:o-grid-cols-2 o-items-center focus:o-ring"
      >
        <div
          className="o-text-sm o-leading-relaxed"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {features[active]?.body}
        </div>
        <div
          className="o-overflow-hidden o-rounded-xl"
          style={{ border: '1px solid var(--o-theme-line)' }}
        >
          {render(active)}
        </div>
      </div>
    </section>
  )
}
