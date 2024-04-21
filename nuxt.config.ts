import type { NuxtPage } from '@nuxt/schema'

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  components: false,
  imports: {
    autoImport: false
  },
  modules: ['@pinia/nuxt', 'nuxt-typed-router'],
  hooks: {
    'pages:extend'(pages) {
      const indexPageRegExp = /.*\/index\.vue$/

      // Remove all pages except the following:
      // 1. File name end with "/index.vue"
      // 2. Is nested route. (has children)
      function removePages(pages: NuxtPage[] = []) {
        const pagesToRemove = []

        for (const page of pages) {
          if (!page.file) {
            removePages(page.children)
            continue
          }

          // preserve page which is nested route
          if (page.children?.length) {
            removePages(page.children)
            continue
          }

          // preserve page whose filename ends with '/index.vue'
          if (indexPageRegExp.test(page.file)) {
            removePages(page.children)
            continue
          }

          pagesToRemove.push(page)
        }

        for (const page of pagesToRemove) {
          pages.splice(pages.indexOf(page), 1)
        }
      }

      removePages(pages)
    }
  },
  postcss: {
    plugins: {
      'postcss-preset-env': {
        browsers: '> 0.5%, last 2 versions, safari > 12, not dead'
      }
    }
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL
    }
  }
})
