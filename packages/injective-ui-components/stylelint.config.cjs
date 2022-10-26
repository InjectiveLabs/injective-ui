module.exports = {
  extends: '@thomasralee/stylelint-config',
  overrides: [
    {
      files: ['**/**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['**/**/*.css'],
      customSyntax: 'postcss'
    }
  ]
}
