import type { NuxtPage } from '@nuxt/schema'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: false,
  imports: {
    autoImport: false
  },
  modules: ['@pinia/nuxt', 'nuxt-typed-router'],
  hooks: {
    'pages:extend'(pages) {
      function removePages(pattern: RegExp, pages: NuxtPage[] = []) {
        const pagesToRemove = []
        for (const page of pages) {
          if (page.file && pattern.test(page.file)) {
            pagesToRemove.push(page)
          } else {
            removePages(pattern, page.children)
          }
        }
        for (const page of pagesToRemove) {
          pages.splice(pages.indexOf(page), 1)
        }
      }

      // Remove all pages whose filename does not end with "/index.vue"
      removePages(/.*(?<!\/index\.vue)$/, pages)
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
