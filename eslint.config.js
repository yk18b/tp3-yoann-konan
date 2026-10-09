import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'apps/api/drizzle/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '.claude/hooks/*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'import-x': importX },
    settings: { 'import-x/resolver-next': [createNodeResolver()] },
    rules: {
      'import-x/no-cycle': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    // Fichiers JS (configs, hooks Claude) : pas d'analyse typée, les plugins tiers ne sont pas typés.
    files: ['**/*.{js,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat['recommended-latest'], jsxA11y.flatConfigs.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@duper/api', '**/apps/api/**'],
              message: 'Le front ne doit jamais importer le back : passer par @duper/shared.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'apps/api/**/*.ts',
      'packages/**/*.ts',
      'e2e/**/*.ts',
      '*.{js,ts}',
      '.claude/hooks/*.mjs',
    ],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
