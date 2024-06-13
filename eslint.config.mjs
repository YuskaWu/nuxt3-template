import tailwindcss from 'eslint-plugin-tailwindcss'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  plugins: { tailwindcss },
  rules: { ...tailwindcss.configs.recommended.rules }
})
