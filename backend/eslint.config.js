// ESLint flat config for Node/Express backend
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {},
  },
];
