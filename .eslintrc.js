module.exports = {
  env: {
    browser: true,
    es2022: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  plugins: [],
  rules: {},
  ignorePatterns: ['**/*.md', '**/*.json'],
  overrides: [
    {
      files: ['**/*.{js,ts,vue}'],
      rules: {
        'vue/no-multiple-template-root': 'off',
        'vue/multi-word-component-names': 'off',
        // personally don't like the order of eslint sorting, and also it conflicts
        // with the buin-in "source.organizeImports" setting, so turn it off
        'import/order': 'off'
      }
    }
  ]
}
