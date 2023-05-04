import type { NuxtPage } from '@nuxt/schema'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: false,
  imports: {
    autoImport: false
  },
  hooks: {
    'pages:extend'(pages) {
      function removePagesMatching(pattern: RegExp, pages: NuxtPage[] = []) {
        const pagesToRemove = []
        for (const page of pages) {
          if (page.file && pattern.test(page.file)) {
            pagesToRemove.push(page)
          } else {
            removePagesMatching(pattern, page.children)
          }
        }
        for (const page of pagesToRemove) {
          pages.splice(pages.indexOf(page), 1)
        }
      }

      // Remove all pages whose filename does not end with "index.vue"
      removePagesMatching(/.*(?<!index\.vue)$/, pages)
    }
  }
})
