/* eslint-env node */

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  plugins: [
    'ember',
    'promise',
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
  ],
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
    'no-restricted-globals': [
      2,
      'name',
      'blur'
    ],
    'valid-jsdoc': [
      1,
      {
        requireParamDescription: false,
        requireReturnDescription: false,
        requireReturn: false,
      },
    ],
    'prefer-const': [
      1,
      {
        'destructuring': 'all',
        'ignoreReadBeforeAssign': true
      }
    ],
    'no-var': 1,
    'one-var': [
      1,
      'never',
    ],
    'max-len': [
      1,
      {
        'code': 90,
        'tabWidth': 2,
        'ignoreStrings': false,
        'ignoreComments': true,
        'ignoreTrailingComments': false,
        'ignoreUrls': true,
        'ignoreTemplateLiterals': false,
        'ignoreRegExpLiterals': true,
        'ignorePattern': '^import|.*[\'"`]\\)?,?;?$',
      }
    ],
    'promise/always-return': 'off', // default: error
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'off', // default: error
    'promise/no-native': 'error',
    'promise/no-nesting': 'off', // default: warn
    'promise/no-promise-in-callback': 'warn',
    'promise/no-callback-in-promise': 'off', // default: warn
    'promise/avoid-new': 'off', // default: warn
    'promise/no-return-in-finally': 'warn',
  },
};
