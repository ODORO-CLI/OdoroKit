/**
 * Bloc de code avec coloration legere et bouton de copie.
 *
 * La coloration est un simple decoupage par expression reguliere — largement
 * suffisant pour des extraits de documentation, sans dependance.
 *
 * @module
 */

import { Icon } from '@odoro/icons'
import { Check, Copy } from '@odoro/icons/filaire'
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
/**
 * Couleurs de coloration syntaxique, par theme.
 *
 * Elles passent par des classes plutot que par un style en ligne : un style en
 * ligne ne peut pas porter de variant, et le bloc restait donc sombre au
 * milieu d'une page claire. Les nuances basses conviennent au fond clair, les
 * hautes au fond sombre — l'inverse manquerait de contraste dans les deux cas.
 */
const TOKEN_CLASS: Record<Token['kind'], string> = {
  comment: 'o-text-zinc-400 dark:o-text-zinc-500',
  string: 'o-text-emerald-600 dark:o-text-emerald-300',
  keyword: 'o-text-sky-600 dark:o-text-sky-300',
  tag: 'o-text-fuchsia-600 dark:o-text-fuchsia-300',
  number: 'o-text-amber-600 dark:o-text-amber-300',
  plain: '',
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
      className={`o-inline-flex o-items-center o-gap-1 o-rounded-sm o-px-2 o-py-1 o-text-xs o-transition-colors o-cursor-pointer ${
        copied
          ? 'o-text-emerald-600 dark:o-text-emerald-400'
          : 'o-text-zinc-500 dark:o-text-zinc-400'
      }`}
    >
      {/* La coche est epaissie : a quatorze pixels, un trait de deux se lit
          mal contre le fond, et c'est le seul retour que le clic donne. */}
      <Icon icon={copied ? Check : Copy} size={14} strokeWidth={copied ? 2.5 : 2} />
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
      className={`o-rounded-lg o-overflow-hidden o-border-w-1 o-bg-zinc-50 dark:o-bg-zinc-950 o-border-zinc-200 dark:o-border-zinc-800 ${className ?? ''}`}
    >
      <div className="o-flex o-items-center o-justify-between o-px-3 o-py-1 o-border-b o-border-zinc-200 dark:o-border-zinc-800">
        <span className="o-text-xs o-font-mono o-text-zinc-400 dark:o-text-zinc-500">
          {lang ?? 'tsx'}
        </span>
        <span className="o-inline-flex o-items-center o-gap-1">
          {actions}
          <CopyButton code={trimmed} />
        </span>
      </div>
      <pre className="o-overflow-x-auto o-scrollbar dark:o-scrollbar-dark o-p-4 o-text-sm o-leading-relaxed">
        <code className="o-text-zinc-800 dark:o-text-zinc-100">
          {tokenize(trimmed).map((token, index) =>
            token.kind === 'plain' ? (
              token.text
            ) : (
              <span key={index} className={TOKEN_CLASS[token.kind]}>
                {token.text}
              </span>
            ),
          )}
        </code>
      </pre>
    </div>
  )
}
