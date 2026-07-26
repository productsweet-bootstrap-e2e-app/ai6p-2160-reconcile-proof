import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

// ESLint config seeded by Product Sweet bootstrap (AI6P-2113).
//
// Deliberately minimal: the framework-recommended sets and nothing else. An
// opinionated house style seeded here would make the tenant's FIRST pull request
// red on formatting, which teaches them to weaken the gate on day one — the same
// dynamic as a coverage threshold on an empty project. Add rules once the team
// has an opinion worth enforcing.
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'src/tokens.css'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    // Test files legitimately use globals the browser set does not carry.
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // Build/codegen scripts are Node, not browser.
    files: ['scripts/**/*.mjs', '*.config.{ts,js}'],
    languageOptions: { globals: globals.node },
  },
);
