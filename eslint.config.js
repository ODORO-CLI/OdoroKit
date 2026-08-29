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
    files: [
      'packages/odoro-libs/**/*.{ts,tsx}',
      'packages/odoro-engine/**/*.{ts,tsx}',
      // Le code du registre est copie tel quel chez l'utilisateur : c'est
      // celui qui a le plus besoin de ces regles, puisque personne ne le
      // relira apres coup.
      'packages/odoro-bits/registry/**/*.{ts,tsx}',
      'playground/**/*.{ts,tsx}',
    ],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    /*
     * Le socle serveur : `process.env` ne se lit qu'a un seul endroit.
     *
     * Une lecture ailleurs echappe a la validation de demarrage, au typage et
     * au rapport d'erreur — et se manifeste a la centieme requete, sur la
     * variable que personne n'avait pensee a definir. La regle rend la lecture
     * impossible partout sauf dans `config.ts`, qui la desactive nommement.
     */
    files: ['packages/odoro-server/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message:
            'Lisez la configuration validee (`loadConfig`) plutot que process.env : ' +
            'une lecture directe echappe a la validation de demarrage.',
        },
      ],
      'no-process-env': 'off',
    },
  },
  {
    // Le CLI ecrit sur stdout : c'est sa raison d'etre.
    files: [
      'packages/create-odoro/**/*.ts',
      'packages/odoro/**/*.ts',
      '**/scripts/**/*.{ts,mjs,js}',
    ],
    rules: { 'no-console': 'off' },
  },
  prettier,
)
