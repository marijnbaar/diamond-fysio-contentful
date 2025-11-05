// Flat ESLint config for ESLint v9+
// Uses recommended rules + jsx-a11y + promise and Prettier compatibility

const js = require('@eslint/js');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const promise = require('eslint-plugin-promise');
const prettier = require('eslint-config-prettier');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');
const tseslint = require('typescript-eslint');

// Next.js plugin - required for Next.js to detect the plugin
const nextPlugin = require('@next/eslint-plugin-next');

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
  // TypeScript files configuration
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}']
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: false // Disable project-based linting for faster parsing
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        IntersectionObserver: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^(fileLocale|fileName|loc|published|compType)$'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off' // Disabled for scripts - Contentful API types are complex
    }
  },
  // JavaScript files configuration
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
      react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin
    },
    rules: {
      'no-unused-vars': 'off', // Disable for JS, use TypeScript version for TS
      'no-empty': ['error', { allowEmptyCatch: true }],
      'promise/always-return': 'off',
      'promise/catch-or-return': ['warn', { allowFinally: true }],
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      // Next.js rules - required for Next.js to detect the plugin
      ...(nextPlugin &&
      nextPlugin.configs &&
      nextPlugin.configs.recommended &&
      nextPlugin.configs.recommended.rules
        ? nextPlugin.configs.recommended.rules
        : nextPlugin &&
            nextPlugin.configs &&
            nextPlugin.configs['core-web-vitals'] &&
            nextPlugin.configs['core-web-vitals'].rules
          ? nextPlugin.configs['core-web-vitals'].rules
          : {})
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  // Shared TypeScript and JavaScript rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      promise,
      react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin
    },
    rules: {
      'promise/always-return': 'off',
      'promise/catch-or-return': ['warn', { allowFinally: true }],
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
