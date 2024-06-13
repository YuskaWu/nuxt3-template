import { defineNuxtPlugin } from '#app'

// https://nuxt.com/docs/getting-started/error-handling#vue-errors

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error) => {
    // TODO: handle error, e.g. report to a service, show toast message
    console.error('global client errorHandler', error)
  }

  nuxtApp.hook('app:error', (error) => {
    // TODO: report to a service
    console.error('app:error errorHandler', error)
  })
})
