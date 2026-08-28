import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

/**
 * Configuration ESLint plate (ESLint 9) partagee par tout le monorepo.
 *
 * Le lint n'est volontairement PAS type-aware : `tsc --noEmit` (script
 * `typecheck`) couvre deja tout ce que le type-checking apporterait, et le
 * mode non type-aware garde `pnpm lint` sous la seconde sur l'ensemble du
 * repo.
 */
export default tseslint.config(
  {
    // Les templates sont des donnees copiees chez l'utilisateur final :
    // leurs dependances ne sont jamais installees ici, les linter n'aurait
    // aucun sens.
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'packages/create-odoro/templates/**',
      'packages/odoro-libs/src/styles/generated/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['packages/odoro-libs/**/*.{ts,tsx}', 'playground/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // Le CLI ecrit sur stdout : c'est sa raison d'etre.
    files: ['packages/create-odoro/**/*.ts', '**/scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  prettier,
)
