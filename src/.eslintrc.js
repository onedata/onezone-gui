/* eslint-env node */

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  extends: 'eslint:recommended',
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  rules: {
    'no-console': 0,
    'dot-location': [
      1,
      'property',
    ],
    'eol-last': 1,
    'comma-dangle': [
      1,
      'always-multiline',
    ],
    'quotes': [
      1,
      'single',
    ],
    'quote-props': [
      1,
      'consistent-as-needed',
    ],
    'no-warning-comments': [
      1,
      {
        terms: ['fixme'],
      },
    ],
    'semi': 2,
    'valid-jsdoc': [
      1,
      {
        requireParamDescription: false,
        requireReturnDescription: false,
      },
    ],
  },
};
