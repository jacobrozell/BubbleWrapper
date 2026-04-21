// @ts-check
const expo = require('eslint-config-expo/flat');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...expo,
  {
    ignores: [
      '**/node_modules/**',
      '.expo/**',
      'dist/**',
      'coverage/**',
      'android/**',
      'ios/**',
    ],
  },
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['jest.setup.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/storage/zenStore/backend.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
