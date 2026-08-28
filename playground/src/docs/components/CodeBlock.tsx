/**
 * Bloc de code avec coloration legere et bouton de copie.
 *
 * La coloration est un simple decoupage par expression reguliere — largement
 * suffisant pour des extraits de documentation, sans dependance.
 *
 * @module
 */

import { type ReactElement, type ReactNode, useState } from 'react'

/** Un lexeme colore. */
interface Token {
  readonly kind: 'comment' | 'string' | 'keyword' | 'tag' | 'number' | 'plain'
  readonly text: string
}

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'default',
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'of',
  'in',
  'new',
  'type',
  'interface',
  'extends',
  'typeof',
  'async',
  'await',
  'true',
  'false',
  'null',
  'undefined',
  'void',
  'class',
  'this',
])

const PATTERN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+|[^\sA-Za-z_$]+)/g

/** Decoupe un extrait en lexemes colores. */
function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  for (const match of code.matchAll(PATTERN)) {
    const [, comment, string, number, word, rest] = match
    if (comment !== undefined) tokens.push({ kind: 'comment', text: comment })
    else if (string !== undefined) tokens.push({ kind: 'string', text: string })
    else if (number !== undefined) tokens.push({ kind: 'number', text: number })
    else if (word !== undefined) {
      const kind = KEYWORDS.has(word) ? 'keyword' : /^[A-Z]/.test(word) ? 'tag' : 'plain'
      tokens.push({ kind, text: word })
    } else if (rest !== undefined) tokens.push({ kind: 'plain', text: rest })
  }
  return tokens
}

/** Couleurs par lexeme, en variables de palette : stables dans les deux themes. */
const TOKEN_COLORS: Record<Token['kind'], string | undefined> = {
  comment: 'var(--o-palette-zinc-500)',
  string: 'var(--o-palette-emerald-300)',
  keyword: 'var(--o-palette-sky-300)',
  tag: 'var(--o-palette-fuchsia-300)',
  number: 'var(--o-palette-amber-300)',
  plain: undefined,
}

/** Proprietes de {@link CodeBlock}. */
export interface CodeBlockProps {
  /** Extrait affiche. */
  code: string
  /** Etiquette de langage affichee en tete. */
  lang?: string
  /** Classes additionnelles. */
  className?: string
  /** Coin superieur : element additionnel a gauche du bouton copier. */
  actions?: ReactNode
}

/** Bouton copiant l'extrait dans le presse-papiers. */
function CopyButton({ code }: { code: string }): ReactElement {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      aria-label="Copier le code"
      onClick={() => {
        void navigator.clipboard?.writeText(code).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        })
      }}
      className="o-inline-flex o-items-center o-gap-1 o-rounded-sm o-px-2 o-py-1 o-text-xs o-transition-colors o-cursor-pointer"
      style={{
        color: copied ? 'var(--o-palette-emerald-400)' : 'var(--o-palette-zinc-400)',
      }}
    >
      {copied ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
      {copied ? 'Copie' : 'Copier'}
    </button>
  )
}

/**
 * Bloc de code sombre, colore et copiable.
 *
 * @example
 * <CodeBlock lang="tsx" code={`<Button tone="danger">Supprimer</Button>`} />
 */
export function CodeBlock({
  code,
  lang,
  className,
  actions,
}: CodeBlockProps): ReactElement {
  const trimmed = code.trim()

  return (
    <div
      className={`o-rounded-lg o-overflow-hidden o-border-w-1 ${className ?? ''}`}
      style={{
        backgroundColor: 'var(--o-palette-zinc-950)',
        borderColor: 'var(--o-palette-zinc-800)',
      }}
    >
      <div
        className="o-flex o-items-center o-justify-between o-px-3 o-py-1 o-border-b"
        style={{ borderColor: 'var(--o-palette-zinc-800)' }}
      >
        <span
          className="o-text-xs o-font-mono"
          style={{ color: 'var(--o-palette-zinc-500)' }}
        >
          {lang ?? 'tsx'}
        </span>
        <span className="o-inline-flex o-items-center o-gap-1">
          {actions}
          <CopyButton code={trimmed} />
        </span>
      </div>
      <pre className="o-overflow-x-auto o-p-4 o-text-sm o-leading-relaxed">
        <code style={{ color: 'var(--o-palette-zinc-100)' }}>
          {tokenize(trimmed).map((token, index) =>
            token.kind === 'plain' && TOKEN_COLORS[token.kind] === undefined ? (
              token.text
            ) : (
              <span key={index} style={{ color: TOKEN_COLORS[token.kind] }}>
                {token.text}
              </span>
            ),
          )}
        </code>
      </pre>
    </div>
  )
}
