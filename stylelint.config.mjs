/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue',
    'stylelint-config-recess-order'
  ],
  rules: {
    // ignore unknow at-rule warning for @tailwind and @apply
    'scss/at-rule-no-unknown': [true, { ignoreAtRules: ['tailwind', 'apply'] }]
  }
}
