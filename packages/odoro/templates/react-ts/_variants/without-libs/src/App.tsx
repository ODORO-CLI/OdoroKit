/**
 * The whole page, in one file.
 *
 * ## Without the libraries
 *
 * They were not picked at creation: no `o-*` classes, no tokens, no router.
 * The design is that of the full version — same pill bar, same title, same
 * cards — carried by `styles.css` in plain CSS.
 *
 * To add them later: `npm i @odoro-cli/libs`, then import
 * `@odoro-cli/libs/styles.css` in `main.tsx` before this stylesheet.
 *
 * @module
 */

import { useEffect, useState, type ReactElement } from 'react'

import { Background } from '@/background'

/* -------------------------------------------------------------------------- */
/*  Brand                                                                      */
/* -------------------------------------------------------------------------- */

/** The brand mark, at the requested size. */
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

/** The bar: the brand in a pill, and the link to the site. */
function Nav(): ReactElement {
  return (
    <header className="nav">
      <div className="nav-content">
        <span className="pill brand">
          <span className="brand-mark">
            <Mark />
          </span>
          <span className="brand-word">ODORO</span>
        </span>

        <div className="nav-end">
          <a
            href="https://odoro.dev"
            target="_blank"
            rel="noreferrer"
            className="pill pill-link"
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
 * the browser preference.
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
    // still a valid answer.
    return 'system'
  }
}

/** The three glyphs, drawn inline. */
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

/** The theme toggle: system, light, dark. */
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
      className="pill toggle"
      onClick={() => {
        setTheme((current) => CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length] ?? 'system')
      }}
    >
      <Glyph theme={theme} />
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                   */
/* -------------------------------------------------------------------------- */

/** Three facts, not three slogans. */
const FACTS = ['Zero configuration', 'Strict TypeScript', 'Hot reloading']

/** What the product window shows. */
const SNIPPET = `export function App() {
  return (
    <h1 className="hero-title">
      Your first page.
    </h1>
  )
}`

/** A miniature browser window. */
function Window(): ReactElement {
  return (
    <div className="window">
      <div className="window-bar">
        <span className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="window-path">src/App.tsx</span>
      </div>
      <pre className="window-code">{SNIPPET}</pre>
    </div>
  )
}

/** The hero: the promise, the actions, and the product window. */
function Hero(): ReactElement {
  return (
    <section className="hero">
      <div className="content">
        <span className="brand-dot">
          <Mark size="0.9rem" />
          Generated by odoro create
        </span>

        <h1 className="hero-title">
          Your first page, <span className="accent">already alive</span>.
        </h1>

        <p className="hero-eyebrow">
          The development server, the build and the hot reloading all come from{' '}
          <code>odoro</code>. The style system is yours.
        </p>

        <div className="hero-actions">
          <a href="#pillars" className="button button-primary">
            See what is included
          </a>
          <a
            href="https://odoro.dev/docs"
            target="_blank"
            rel="noreferrer"
            className="button button-secondary"
          >
            Documentation
          </a>
        </div>

        <div className="facts">
          {FACTS.map((fact) => (
            <span key={fact} className="fact">
              {fact}
            </span>
          ))}
        </div>

        <div className="hero-window">
          <Window />
        </div>
      </div>
    </section>
  )
}

/** What the project already has at hand. */
const PILLARS = [
  {
    title: 'Build',
    text: 'A development server with hot reloading, and a production build.',
  },
  {
    title: 'TypeScript',
    text: 'Strict types, path aliases, and checking without emitting.',
  },
  {
    title: 'Over to you',
    text: 'No style system imposed: yours takes all the room.',
  },
]

/** The pillars section. */
function Pillars(): ReactElement {
  return (
    <section id="pillars" className="section">
      <div className="content">
        <h2 className="overline">What is already here</h2>
        <div className="grid">
          {PILLARS.map((pillar, index) => (
            <article key={pillar.title} className="card">
              <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/** The command people copy the most. */
const COMMAND = 'npm i @odoro-cli/libs'

/** The closing: one command, and the door to the documentation. */
function Closing(): ReactElement {
  const [copied, setCopied] = useState(false)

  return (
    <section className="section section-centered">
      <div className="content-narrow">
        <h2 className="closing-title">Add the style system whenever you like.</h2>
        <p className="closing-eyebrow">
          The tokens, the utilities and the components live in a separate package. This
          project runs without them, and takes them in without breaking anything.
        </p>

        <div className="command">
          <code>{COMMAND}</code>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => {
              // The clipboard can be refused — outside a secure context, or
              // permission withdrawn. The failure does not break the page: the
              // label simply does not change.
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
          href="https://odoro.dev/docs/installation"
          target="_blank"
          rel="noreferrer"
          className="quiet-link"
        >
          Read the walkthrough
        </a>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Root                                                                       */
/* -------------------------------------------------------------------------- */

/** Root of the application. */
export function App(): ReactElement {
  return (
    // The background sits here and not in the content: anchored lower, it
    // started below the bar and left a darker strip behind it.
    <div className="app-shell app-shell-background">
      <Background />
      <Nav />
      <main className="main">
        <Hero />
        <Pillars />
        <Closing />
      </main>
      <footer className="footer">
        <span className="brand">
          <span className="brand-mark">
            <Mark size="1.1rem" />
          </span>
          <span className="brand-word">ODORO</span>
        </span>
        <span>Built with Odoro.</span>
      </footer>
    </div>
  )
}
