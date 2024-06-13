# Nuxt3 Template

My preferred setup for Nuxt3 web application.

## Linter

- use `eslint` for the others
- use `stylelint` for CSS, SASS

### [@nuxt/eslint](https://eslint.nuxt.com/packages/module)

installation:

```bash
# see official document: https://eslint.nuxt.com/packages/module#quick-setup
pnpm add -D @nuxt/eslint eslint
```

.vscode/settings.json

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": "never",
    "source.fixAll.eslint": "always",
    "source.fixAll.stylelint": "always"
  },
  "eslint.format.enable": true,
  "[vue]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  }
}
```

nuxt.config.ts

```typescript
export default defineNuxtConfig({
  eslint: {
    config: {
      // enable ESLint Stylistic to format files
      stylistic: {
        indent: 2,
        semi: false,
        quotes: 'single',
        commaDangle: 'never',
      },
    },
  },
})
```

### [stylelint](https://stylelint.io/)

installation:

```bash
pnpm add -D stylelint stylelint-config-standard-vue stylelint-config-standard-scss stylelint-config-recess-order
```

stylelint.config.mjs

```javascript
/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue',
    'stylelint-config-recess-order',
  ],
  rules: {
    // ignore unknow at-rule warning for @tailwind and @apply
    'scss/at-rule-no-unknown': [true, { ignoreAtRules: ['tailwind', 'apply'] }],
  },
}
```

.stylelintignore

```
# Nuxt dev/build outputs
.output
.data
.nuxt
.nitro
.cache
dist

# Node dependencies
node_modules

# ignore all files except css, scss and vue
# see git ignore syntax: https://git-scm.com/docs/gitignore
*.*
!*.css
!*.scss
!*.vue
```

.vscode/settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": "always"
  },
  "stylelint.validate": ["css", "less", "scss", "vue"],

  "//comment": "To prevent both VS Code's built-in linters and Stylelint from reporting the same errors",
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false
}
```

## Tailwind (@nuxt/tailwindcss)

- install [@nuxtjs/tailwindcss](https://nuxt.com/modules/tailwindcss)
- install [eslint-plugin-tailwindcss](https://www.npmjs.com/package/eslint-plugin-tailwindcss) for auto sorting, and apply it in `eslint.config.mjs`:

  ```javascript
  import tailwindcss from 'eslint-plugin-tailwindcss'
  import withNuxt from './.nuxt/eslint.config.mjs'

  export default withNuxt({
    plugins: { tailwindcss },
    rules: { ...tailwindcss.configs.recommended.rules },
  })
  ```

- add exclude settings in `.vscode/setting.json`:

  ```json
  {
    "//comment3": "exclude dist currently not work, don't known why",
    "tailwindCSS.files.exclude": [
      "**/.git/**",
      "**/node_modules/**",
      "**/.hg/**",
      "**/.svn/**",
      "**/dist/**"
    ]
  }
  ```

## Formatter

This template use both `Prettier` and `ESLint Stylistic` to format files. `ESLint Stylistic` handle javascript, typescript and vue, and Prettier handle the others(markdown, json, css etc). These formatter configurations are setup in `.vscode/settings.json`:

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },
  "[typescript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },
  "[vue]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Git hook lint

- [husky](https://typicode.github.io/husky/#/)
  Setup git hook to do something (lint our code)
- [lint-staged](https://github.com/lint-staged/lint-staged)
  Run linters only on staged files

<br>

1. follow official document to install [husky](https://typicode.github.io/husky/#/)
2. modiefy `.husky/pre-commit` file:

   ```bash
   # invoke lint-staged to check files
   npx lint-staged
   ```

3. install [lint-staged](https://github.com/lint-staged/lint-staged)

   ```bash
   pnpm add -D lint-staged
   ```

4. add [lint-staged](https://github.com/lint-staged/lint-staged) options in `package.json`

   ```json
   {
     "lint-staged": {
       "!(dist/**/*)*.js": "eslint",
       "!(dist/**/*)*.ts": "eslint",
       "!(dist/**/*)*.vue": "eslint",
       "!(dist/**/*)*.css": "stylelint",
       "!(dist/**/*)*.scss": "stylelint",
       "!(dist/**/*)*.md": "prettier"
     }
   }
   ```

## API composable

Use [Zod](https://zod.dev/) to define [API schema](composables/useApi/schema/api.ingredient.ts), and then integrate API schema in two different API caller to provide type check and data validation:

- custom `useFetch` wrap. [example](pages/custom-usefetch-example/index.vue)
- custom fetcher with Tanstack Query (prefered). [example](pages/tanstack-query-example/index.vue)

### Tanstack Query

installation:

```bash
pnpm add @tanstack/vue-query @tanstack/vue-query-devtools
```

apply devtool in app.vue:

```vue
<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <VueQueryDevtools />
  </NuxtLayout>
</template>
```

add plugin `plugins/vue-query.ts`:

```typescript
import type {
  DehydratedState,
  VueQueryPluginOptions,
} from '@tanstack/vue-query'
import {
  QueryClient,
  VueQueryPlugin,
  dehydrate,
  hydrate,
} from '@tanstack/vue-query'
// Nuxt 3 app aliases
import { defineNuxtPlugin, useState } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })
  const options: VueQueryPluginOptions = { queryClient }

  nuxt.vueApp.use(VueQueryPlugin, options)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxt.hooks.hook('app:created', () => {
      hydrate(queryClient, vueQueryState.value)
    })
  }
})
```

For more detail see offical [nuxt3 example](https://tanstack.com/query/latest/docs/framework/vue/examples/nuxt3)

## Custom route

Delete page routes whose file name is not "index.vue" unless it has children(nested route), so that we can put page-scoped components inside it's own directory.

For more detail see `pages:extend` hook function in [nuxt.config.ts](nuxt.config.ts).
