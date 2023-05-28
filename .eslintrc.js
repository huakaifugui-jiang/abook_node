module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'eslint-plugin-import', 'prettier'],
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  overrides: [],
  parserOptions: {},
  rules: {},
};

