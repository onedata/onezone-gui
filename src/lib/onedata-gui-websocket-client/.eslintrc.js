module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    browser: true,
    es6: true,
  },
  rules: {
    'block-scoped-var': 2,
    'camelcase': 2,
    'curly': [
      2,
      'all'
    ],
    'dot-notation': [
      2,
      {
        'allowKeywords': true
      }
    ],
    'eqeqeq': [
      2,
      'allow-null'
    ],
    'guard-for-in': 2,
    'new-cap': 2,
    'no-caller': 2,
    'no-cond-assign': [
      2,
      'except-parens'
    ],
    'no-console': 0,
    'no-debugger': 2,
    'no-empty': 2,
    'no-eval': 2,
    'no-extend-native': 2,
    'no-extra-parens': 1,
    'no-irregular-whitespace': 2,
    'no-iterator': 2,
    'no-loop-func': 2,
    'no-multi-str': 2,
    'no-new': 1,
    'no-proto': 2,
    'no-script-url': 2,
    'no-sequences': 2,
    'no-shadow': 2,
    'no-undef': 2,
    'no-unused-vars': 2,
    'no-with': 2,
    'quotes': [
      2,
      'single',
      {
        "avoidEscape": true,
      }
    ],
    'semi': [
      2,
      'always'
    ],
  }
};
