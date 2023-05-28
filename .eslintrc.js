module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['import', '@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  overrides: [],
  parserOptions: {},
  rules: {},
};

