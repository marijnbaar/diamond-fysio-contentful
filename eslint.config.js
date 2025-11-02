// Flat ESLint config for ESLint v9+
// Uses recommended rules + jsx-a11y + promise and Prettier compatibility

const js = require('@eslint/js');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const promise = require('eslint-plugin-promise');
const prettier = require('eslint-config-prettier');
const react = require('eslint-plugin-react');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules',
      '.next',
      'out',
      'public',
      'coverage',
      'yarn.lock',
      '**/*.min.js',
      'eslint.config.js'
    ]
  },
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
        IntersectionObserver: 'readonly'
      }
    },
    plugins: {
      'jsx-a11y': jsxA11y,
      promise,
      react
    },
    rules: {
      'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'promise/always-return': 'off',
      'promise/catch-or-return': ['warn', { allowFinally: true }],
      'react/jsx-uses-vars': 'error',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off'
    }
  }
];
