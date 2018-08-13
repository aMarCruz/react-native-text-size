// avoid interference of any eslint config in parent directory
const ON = 2

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      impliedStrict: true,
    },
  },
  env: {
    es6: true,
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'comma-dangle': [ON, 'always-multiline'],
    'eqeqeq': [ON, 'smart'],
    'semi': [ON, 'never'],
  },
}
