import nextPlugin from 'eslint-plugin-next';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      next: nextPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
