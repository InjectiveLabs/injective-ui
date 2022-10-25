module.exports = {
  extends: ['stylelint-config-recommended-vue', 'stylelint-config-tailwindcss'],
  overrides: [
    {
      files: ['**/**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['**/**/*.css'],
      customSyntax: 'postcss'
    }
  ],
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
    'no-descending-specificity': null
  }
}
