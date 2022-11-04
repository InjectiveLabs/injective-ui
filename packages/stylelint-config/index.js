module.exports = {
  extends: ['stylelint-config-recommended'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'apply',
          'layer',
          'responsive',
          'screen',
          'tailwind',
          'variants'
        ]
      }
    ],
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
    'function-no-unknown': [true, { ignoreFunctions: ['theme'] }]
  },
  ignoreFiles: ['coverage/**']
}
