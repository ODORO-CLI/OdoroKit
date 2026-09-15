/**
 * The whole page, in one file.
 *
 * ## Why everything is here
 *
 * A project that is just starting reads better in one piece: you see the
 * navigation, the sections and the footer without opening eight files. Each
 * block is a function; the day one of them grows, it moves into its own file
 * with a cut and a paste.
 *
 * Two things live apart, and for a reason: the **router**, which is the only
 * routing dependency and can be swapped without touching the page; and the
 * **background**, which is the only piece that depends on the engine.
 *
 * ## The navigation bar
 *
 * It paints no band: these are pills laid over whatever is behind, with a
 * backdrop blur. The decorative background therefore keeps showing through,
 * instead of being cut off by an opaque strip.
 *
 * @module
 */

import { Reveal, Stagger } from '@odoro-cli/libs/motion'
import { buttonClasses } from '@odoro-cli/libs/ui'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

// Named rather than imported wholesale: the rest of the manifest — the
// scripts, the metadata — has no business in the code shipped to the browser.
import { dependencies, devDependencies } from '../package.json'

import { Background } from '@/background'
import { Link, Router, useLocation } from '@/router'

/* -------------------------------------------------------------------------- */
/*  Brand                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The brand mark.
 *
 * Drawn inline rather than loaded from `public/`: it takes the colour of its
 * parent through `currentColor`, hence the brand hue in light as in dark, with
 * no second file to maintain.
 *
 * The size is a style and not a class: an arbitrary-value utility class is
 * only emitted if the compiler saw it go by, and a missing class paints
 * nothing — the mark would have no dimensions, so it would be invisible.
 */
function Mark({ size = '1.75rem' }: { readonly size?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <path
        d="M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z"
        stroke="currentColor"
        strokeWidth="10.5"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Navigation bar                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The surface of a pill.
 *
 * The system ships the black and white scales, but not their dark alpha
 * variants: `o-bg-white/70` and its `dark:` counterpart do not exist as a
 * single class. So the mix is done as a style, where it is exact and follows
 * the theme without every colour having to be restated.
 */
const PILL: CSSProperties = {
  backgroundColor: 'color-mix(in oklab, var(--o-theme-bg) 72%, transparent)',
  borderColor: 'color-mix(in oklab, var(--o-theme-fg) 12%, transparent)',
}

/** The navigation entries. */
const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
]

/** A link in the navigation pill, active on the current route. */
function TopLink({ to, label }: { readonly to: string; readonly label: string }): ReactElement {
  const { pathname } = useLocation()
  const active = pathname === to

  return (
    <Link
      to={to}
      className={[
        'o-rounded-full o-px-4 o-py-2 o-text-sm o-no-underline o-transition-colors',
        active
          ? 'o-font-medium o-text-zinc-950 dark:o-text-white'
          : 'o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white',
      ].join(' ')}
      style={active ? PILL : undefined}
    >
      {label}
    </Link>
  )
}

/** The bar: the brand, the navigation, and the link to the site. */
function Nav(): ReactElement {
  return (
    <header className="o-sticky o-top-0 o-z-20 o-px-5 md:o-px-8">
      <div className="o-mx-auto o-flex o-h-20 o-w-full o-max-w-5xl o-items-center o-gap-3">
        <Link
          to="/"
          className="o-inline-flex o-h-14 o-shrink-0 o-items-center o-gap-2.5 o-rounded-full o-border-w-1 o-pl-5 o-pr-6 o-no-underline o-backdrop-blur-xl"
          style={PILL}
        >
          <span className="o-text-brand-500">
            <Mark />
          </span>
          <span className="o-text-lg o-font-bold o-tracking-wide o-text-zinc-950 dark:o-text-white">
            ODORO
          </span>
        </Link>

        <nav
          aria-label="Navigation"
          className="o-inline-flex o-h-14 o-items-center o-gap-1 o-rounded-full o-border-w-1 o-px-2 o-backdrop-blur-xl"
          style={PILL}
        >
          {LINKS.map((link) => (
            <TopLink key={link.to} to={link.to} label={link.label} />
          ))}
        </nav>

        <div className="o-ml-auto o-flex o-items-center o-gap-3">
          <a
            href="https://odoro.dev"
            target="_blank"
            rel="noreferrer"
            className="o-inline-flex o-h-14 o-shrink-0 o-items-center o-rounded-full o-border-w-1 o-px-5 o-text-sm o-no-underline o-backdrop-blur-xl o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white"
            style={PILL}
          >
            odoro.dev
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  Theme                                                                      */
/* -------------------------------------------------------------------------- */

/** The three states of the toggle. */
type Theme = 'system' | 'light' | 'dark'

/** Where the choice is stored. The script in `index.html` reads the same key. */
const THEME_KEY = 'odoro-theme'

/** The order of the cycle, on click. */
const CYCLE: readonly Theme[] = ['system', 'light', 'dark']

/**
 * Applies the theme to the root of the document.
 *
 * `system` removes the attribute rather than setting a third value: the
 * stylesheet listens to `data-theme`, and its absence hands control back to
 * the browser preference. That is what lets a page left on "system" follow the
 * switch to night without being reopened.
 */
function applyTheme(theme: Theme): void {
  if (theme === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
}

/** The stored theme, or `system`. */
function storedTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY)
    if (value === 'light') return 'light'
    if (value === 'dark') return 'dark'
    return 'system'
  } catch {
    // Storage refused — private window, cookies blocked. The system theme is
    // still a valid answer; failing here would deprive the page of its render.
    return 'system'
  }
}

/** The three glyphs, drawn rather than imported: the icons are optional. */
function Glyph({ theme }: { readonly theme: Theme }): ReactElement {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    style: { width: '1.15rem', height: '1.15rem' },
  }

  if (theme === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }

  if (theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

/**
 * The theme toggle.
 *
 * Three states and not two: "system" is a choice in its own right, and
 * removing it would force a visitor to choose again every time their
 * preference changes.
 */
function ThemeToggle(): ReactElement {
  const [theme, setTheme] = useState<Theme>(() => storedTheme())

  useEffect(() => {
    applyTheme(theme)
    try {
      if (theme === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, theme)
    } catch {
      // The theme stays applied for the session, even without storage.
    }
  }, [theme])

  return (
    <button
      type="button"
      aria-label={`Theme: ${theme}`}
      title={`Theme: ${theme}`}
      onClick={() => {
        setTheme((current) => CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length] ?? 'system')
      }}
      className="o-inline-flex o-size-14 o-shrink-0 o-cursor-pointer o-items-center o-justify-center o-rounded-full o-border-w-1 o-backdrop-blur-xl o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-white"
      style={PILL}
    >
      <Glyph theme={theme} />
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Home page sections                                                         */
/* -------------------------------------------------------------------------- */

/** Three facts, not three slogans. */
const FACTS = ['Zero configuration', 'Light and dark themes', 'Reduced motion respected']

/** What the product window shows. */
const SNIPPET = `export function Home() {
  return (
    <Reveal>
      <h1 className="o-text-6xl o-font-bold">
        Your first page.
      </h1>
    </Reveal>
  )
}`

/**
 * A miniature browser window.
 *
 * The three dots are decorative: they say "browser" without adding anything a
 * screen reader needs to hear.
 */
function Window(): ReactElement {
  return (
    <div className="o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-shadow-2xl">
      <div className="o-flex o-items-center o-gap-2 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-2.5">
        <span className="o-flex o-gap-1.5" aria-hidden="true">
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
        </span>
        <span className="o-ml-2 o-font-mono o-text-xs o-text-zinc-400">src/App.tsx</span>
      </div>
      <pre className="o-m-0 o-overflow-x-auto o-p-5 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
        {SNIPPET}
      </pre>
    </div>
  )
}

/** The hero: the promise, the actions, and the product window. */
function Hero(): ReactElement {
  return (
    <section className="o-relative o-px-6 o-pb-20 o-pt-16 md:o-pt-24">
      <div className="o-mx-auto o-w-full o-max-w-5xl">
        <Reveal>
          <span className="o-inline-flex o-items-center o-gap-2 o-whitespace-nowrap o-rounded-full o-border-w-1 o-border-brand-500/30 o-bg-brand-500/10 o-px-3 o-py-1 o-text-xs o-font-medium o-text-brand-600 dark:o-text-brand-400">
            <Mark size="0.9rem" />
            Generated by odoro create
          </span>

          <h1 className="o-mt-6 o-max-w-3xl o-text-5xl o-font-bold o-tracking-tight md:o-text-6xl">
            Your first page, <span className="o-text-brand-500">already alive</span>.
          </h1>

          <p className="o-mt-5 o-max-w-xl o-text-lg o-text-zinc-500 dark:o-text-zinc-400">
            The router, the animations and the style system all come from the same
            library. Edit this page: it reloads without losing its state.
          </p>
        </Reveal>

        <Stagger step={70} className="o-mt-8 o-flex o-flex-wrap o-items-center o-gap-3">
          <a
            href="#pillars"
            className={`o-no-underline ${buttonClasses({ tone: 'primary' })}`}
          >
            See what is included
          </a>
          <a
            href="https://odoro.dev/docs"
            target="_blank"
            rel="noreferrer"
            className={`o-no-underline ${buttonClasses({ tone: 'secondary' })}`}
          >
            Documentation
          </a>
        </Stagger>

        <Stagger step={60} className="o-mt-6 o-flex o-flex-wrap o-gap-2">
          {FACTS.map((fact) => (
            <span
              key={fact}
              className="o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-3 o-py-1 o-text-xs o-text-zinc-500 dark:o-text-zinc-400"
            >
              {fact}
            </span>
          ))}
        </Stagger>

        <Reveal>
          <div className="o-mt-14">
            <Window />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** What the project already has at hand. */
const PILLARS = [
  {
    title: 'Router',
    text: 'Dynamic segments, nested routes, lazy loading and page transitions.',
  },
  {
    title: 'Animations',
    text:
      "A thin layer over the browser's own engine. Reduced motion is respected out of the box.",
  },
  {
    title: 'Styles',
    text: 'Tokens as the source of truth, a static stylesheet, no scanning at runtime.',
  },
]

/** The pillars section. */
function Pillars(): ReactElement {
  return (
    <section
      id="pillars"
      className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-20"
    >
      <div className="o-mx-auto o-w-full o-max-w-5xl">
        <h2 className="o-text-sm o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400">
          What is already here
        </h2>

        <Stagger step={90} className="o-mt-8 o-grid o-gap-4 md:o-grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <article
              key={pillar.title}
              className="o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-6"
            >
              <span className="o-font-mono o-text-xs o-text-brand-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="o-mt-3 o-text-lg o-font-semibold o-tracking-tight">
                {pillar.title}
              </h3>
              <p className="o-mt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                {pillar.text}
              </p>
            </article>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/** The command people copy the most. */
const COMMAND = 'odoro add text/count-up'

/** The closing: one command, and the door to the catalogue. */
function Closing(): ReactElement {
  const [copied, setCopied] = useState(false)

  return (
    <section className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24">
      <div className="o-mx-auto o-w-full o-max-w-3xl o-text-center">
        <Reveal>
          <h2 className="o-text-3xl o-font-bold o-tracking-tight md:o-text-4xl">
            Add a component without leaving the terminal.
          </h2>
          <p className="o-mx-auto o-mt-4 o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
            The registry copies the code into your project. It is yours: you read it,
            you change it, it never updates behind your back.
          </p>

          <div className="o-mx-auto o-mt-8 o-flex o-max-w-md o-items-center o-gap-2 o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-2 o-pl-4">
            <code className="o-flex-1 o-text-left o-font-mono o-text-sm">{COMMAND}</code>
            <button
              type="button"
              className={buttonClasses({ tone: 'ghost', size: 'sm' })}
              onClick={() => {
                // The clipboard can be refused — outside a secure context, or
                // permission withdrawn. The failure does not break the page:
                // the label simply does not change.
                void navigator.clipboard
                  ?.writeText(COMMAND)
                  .then(() => {
                    setCopied(true)
                    setTimeout(() => {
                      setCopied(false)
                    }, 1600)
                  })
                  .catch(() => undefined)
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <a
            href="https://odoro.dev/docs/registry"
            target="_blank"
            rel="noreferrer"
            className="o-mt-6 o-inline-block o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-no-underline hover:o-text-brand-500"
          >
            Browse the catalogue
          </a>
        </Reveal>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Pages                                                                      */
/* -------------------------------------------------------------------------- */

/** The home page. */
function Home(): ReactElement {
  return (
    <>
      <Hero />
      <Pillars />
      <Closing />
    </>
  )
}

/**
 * What each package of the family brings.
 *
 * The table describes; it does not decide. What shows comes from the manifest
 * of the project, hence from what was actually installed — and that stays true
 * if you add or remove a package later.
 */
const ROLES: Readonly<Record<string, string>> = {
  odoro: 'Development server, build and registry',
  '@odoro-cli/libs': 'Tokens, utilities, components and router',
  '@odoro-cli/icons': 'Five icon families, importable one by one',
  '@odoro-cli/engine': 'WebGL, surfaces and motion policy',
  '@odoro-cli/server': 'Modular back-end foundation',
}

/**
 * The packages of the family present in this project.
 *
 * Both fields are read, because `odoro` is a development dependency where the
 * others are production dependencies. A hand-written list would start lying at
 * the first box left unticked at creation.
 */
const LANDMARKS = Object.entries({ ...dependencies, ...devDependencies })
  .filter(([name]) => name in ROLES)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, version]) => ({ name, version, role: ROLES[name] ?? '' }))

/** A second page, to show the router at work. */
function About(): ReactElement {
  return (
    <section className="o-px-6 o-py-24">
      <div className="o-mx-auto o-w-full o-max-w-3xl">
        <Reveal>
          <h1 className="o-text-4xl o-font-bold o-tracking-tight">About</h1>
          <p className="o-mt-4 o-text-zinc-500 dark:o-text-zinc-400">
            This page exists to show the router: navigating reloads nothing, and the
            transition is the one the browser provides.
          </p>

          <dl className="o-mt-10 o-border-t o-border-zinc-200 dark:o-border-zinc-800">
            {LANDMARKS.map((landmark) => (
              <div
                key={landmark.name}
                className="o-flex o-flex-col md:o-flex-row o-gap-1 md:o-gap-6 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-4"
              >
                <dt className="o-w-56 o-shrink-0 o-font-mono o-text-sm o-font-medium">
                  {landmark.name}
                  <span className="o-ml-2 o-text-xs o-font-normal o-text-zinc-400">
                    {landmark.version}
                  </span>
                </dt>
                <dd className="o-m-0 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                  {landmark.role}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}

/** What shows when no route matches. */
function NotFound(): ReactElement {
  return (
    <section className="o-px-6 o-py-32 o-text-center">
      <p className="o-font-mono o-text-sm o-text-brand-500">404</p>
      <h1 className="o-mt-3 o-text-3xl o-font-bold o-tracking-tight">
        This page does not exist.
      </h1>
      <Link to="/" className="o-mt-6 o-inline-block o-text-sm">
        Back to home
      </Link>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Root                                                                       */
/* -------------------------------------------------------------------------- */

/** The common shell: nav, content, footer. */
function Shell(content: ReactNode): ReactElement {
  return (
    // `relative` carries the decorative background, which places itself
    // absolutely inside it. It sits here and not in the page: anchored to the
    // top of `main`, it started below the bar, and the strip left behind it
    // showed at the top of the page as a darker rectangle.
    <div className="app-shell o-relative">
      <Background />
      <Nav />
      <main className="o-relative o-view-transition-page">{content}</main>
      <footer className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-8">
        <div className="o-mx-auto o-flex o-w-full o-max-w-5xl o-items-center o-justify-between o-gap-4 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          <span className="o-inline-flex o-items-center o-gap-2">
            <span className="o-text-brand-500">
              <Mark size="1.1rem" />
            </span>
            <span className="o-font-semibold o-tracking-wide">ODORO</span>
          </span>
          <span>Built with Odoro.</span>
        </div>
      </footer>
    </div>
  )
}

/** What the application receives. */
export interface AppProps {
  /**
   * The address to render, during prerendering.
   *
   * Absent in the browser: there, the address bar is the truth.
   */
  readonly url?: string
}

/** Root of the application. */
export function App({ url }: AppProps = {}): ReactElement {
  return (
    <Router
      shell={Shell}
      home={<Home />}
      about={<About />}
      notFound={<NotFound />}
      url={url}
    />
  )
}
