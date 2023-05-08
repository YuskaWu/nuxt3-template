module.exports =  {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-prettier/recommended'
  ],
  overrides: [
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss"
    }
  ]
}