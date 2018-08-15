const OFF = 0
const WARN = 1
const ON = 2
const READONLY = false
const YES = true
const USE = false

module.exports = {
  root: YES,

  // ----------------------------------------
  // Parser

  parser: 'typescript-eslint-parser',

  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: YES, // remove for ecmaVersion:2018
      impliedStrict: YES,
      jsx: YES,
    },
  },

  // ----------------------------------------
  // Plugins

  plugins: [
    'react',
  ],

  settings: {
    react: {
      flowVersion: '0.75',  // must match [version] in .flowconfig
    },
  },

  // ----------------------------------------
  // Environment

  env: {
    es6: YES,
    browser: YES,
  },

  globals: {
    __DEV__: READONLY,
    require: READONLY,
  },

  // ----------------------------------------
  // Rules

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],

  rules: {
    'array-bracket-spacing': [ON, 'never'],
    'array-callback-return': ON,
    'arrow-parens': ON,
    'arrow-spacing': ON,
    'block-scoped-var': ON,
    'block-spacing': ON,
    'brace-style': [ON, '1tbs', { allowSingleLine: YES }],
    'callback-return': ON,
    'comma-dangle': [ON, 'always-multiline'],
    'comma-spacing': ON,
    'comma-style': ON,
    'computed-property-spacing': ON,
    'consistent-return': ON,
    'consistent-this': ON,
    'curly': [ON, 'multi-line'],
    'dot-location': [ON, 'property'],
    'dot-notation': WARN,
    'eol-last': ON,
    'eqeqeq': [ON, 'smart'],
    'func-call-spacing': ON,
    'guard-for-in': WARN,
    'handle-callback-err': [ON, '^err(or)?$'],
    'implicit-arrow-linebreak': ON,
    'indent': [ON, 2, { flatTernaryExpressions: YES, SwitchCase: 1 }],
    'jsx-quotes': ON,
    'key-spacing': [ON, { mode: 'minimum' }],
    'keyword-spacing': ON,
    'linebreak-style': [ON, 'unix'],
    'max-depth': [ON, 5],
    'max-len': [WARN, 120, 4, { ignoreUrls: YES }],
    'max-nested-callbacks': [ON, 5],
    'new-parens': ON,
    'no-alert': WARN,
    'no-array-constructor': ON,
    'no-caller': ON,
    'no-catch-shadow': ON,
    'no-confusing-arrow': [ON, { allowParens: YES }],
    'no-console': OFF,
    'no-div-regex': ON,
    'no-duplicate-imports': OFF,  // because Flow
    'no-eval': ON,
    'no-extend-native': ON,
    'no-extra-bind': ON,
    'no-floating-decimal': ON,
    'no-implicit-coercion': [ON, { allow: ['~'] }],
    'no-implicit-globals': ON,
    'no-implied-eval': ON,
    'no-iterator': ON,
    'no-label-var': ON,
    'no-lone-blocks': ON,
    'no-lonely-if': ON,
    'no-loop-func': ON,
    'no-multi-str': ON,
    'no-multiple-empty-lines': [ON, { max: 2 }],
    'no-native-reassign': ON,
    'no-new-func': ON,
    'no-new-object': ON,
    'no-new-wrappers': ON,
    'no-new': ON,
    'no-octal-escape': ON,
    'no-proto': ON,
    'no-prototype-builtins': WARN,
    'no-return-assign': [ON, 'except-parens'],
    'no-script-url': ON,
    'no-self-compare': ON,
    'no-sequences': ON,
    'no-shadow-restricted-names': ON,
    'no-template-curly-in-string': ON,
    'no-throw-literal': ON,
    'no-trailing-spaces': ON,
    'no-undef-init': ON,
    'no-undef': OFF,                // handled by TS
    'no-unexpected-multiline': ON,
    'no-unmodified-loop-condition': WARN,
    'no-unneeded-ternary': ON,
    'no-unused-expressions': ON,
    'no-use-before-define': [ON, { functions: USE, variables: USE }],
    'no-useless-call': ON,
    'no-useless-computed-key': WARN,
    'no-useless-rename': WARN,
    'no-useless-return': WARN,
    'no-var': ON,
    'no-void': ON,
    'no-whitespace-before-property': ON,
    'no-with': ON,
    'object-curly-spacing': [ON, 'always'],
    'object-shorthand': ON,
    'one-var-declaration-per-line': ON,
    'operator-linebreak': ON,
    'prefer-const': [ON, { destructuring: 'all' }],
    'prefer-numeric-literals': ON,
    'prefer-promise-reject-errors': ON,
    'quote-props': [ON, 'consistent'],
    'quotes': [ON, 'single', 'avoid-escape'],
    'radix': ON,
    'require-await': ON,
    'require-yield': ON,
    'rest-spread-spacing': ON,
    'semi-spacing': ON,
    'semi': [ON, 'never'],
    'space-before-blocks': ON,
    'space-before-function-paren': [ON, 'always'],
    'space-in-parens': ON,
    'space-infix-ops': ON,
    'space-unary-ops': ON,
    'switch-colon-spacing': [ON, { after: YES }],
    'template-curly-spacing': ON,
    'unicode-bom': ON,
    'wrap-iife': [ON, 'inside'],
    'yield-star-spacing': ON,
    'yoda': [ON, 'never'],

    // ----------------------------------------
    // React rules

    'jsx-quotes': [ON, 'prefer-double'],
    'react/display-name': OFF,
    'react/prop-types': OFF,
    'react/no-string-refs': OFF,
  },

  // ----------------------------------------
  // Overrides for specific files

  'overrides': [
    {
      files: ['*.test.js', '__test__/*.js'],
      env: {
        jest: YES,
      },
      rules: {
        'no-console': OFF,
      }
    }
  ]
}
