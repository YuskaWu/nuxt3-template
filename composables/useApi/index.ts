import type { UseFetchOptions } from 'nuxt/app'
import { hash } from 'ohash'
import { compile } from 'path-to-regexp'
import type { Ref, UnwrapNestedRefs } from 'vue'
import type { ApiNames, ApiParams, ApiResponse } from './schema'
import { API_SCHEMA, errorResponseParser } from './schema'
import useServerMessage from '@/composables/userServerMessage'
import useToken from '@/composables/useToken'
import {
  computed,
  createError,
  navigateTo,
  onUnmounted,
  useFetch,
  useNuxtApp,
  useRuntimeConfig,
  watch
} from '#imports'

import { callWithNuxt, useRoute } from '#app'
import deepToValue from '@/utils/deepToValue'

// Let T also can be an object wrapped by Ref since useFetch can accept Ref variable as the part of useFetch option
type ParamOption<T> =
  | Ref<T>
  | T
  | UnwrapNestedRefs<T>
  | {
    [key in keyof T]: ParamOption<T[key]>
  }

// The generic type of UseFetchOptions is the response json of API, and it depends on ApiName.
type UseApiOption<ApiName extends ApiNames> = UseFetchOptions<ApiResponse[ApiName]> & {
  errorHandler?: (error: {
    error?: Error
    status?: number
    message: string
  }) => void
  skipError?: boolean
}

type UseApiArguments<ApiName extends ApiNames, Params = ApiParams<ApiName>> =
// condition type here means if ApiParams can be empty, then the second argument of useApi is optional,
// otherwise the second argument is required and you have to pass ApiParams inside it.
//
// Record<string, never> means empty.
Record<string, never> extends Params
  ? [apiName: ApiName, options?: UseApiOption<ApiName>]
  : [apiName: ApiName, options: ParamOption<Params> & UseApiOption<ApiName>]

async function useApi<T extends ApiNames>(...args: UseApiArguments<T>) {
  const [apiName, options] = args
  const apiSchema = API_SCHEMA[apiName]

  const nuxtApp = useNuxtApp()
  const token = useToken()
  const config = useRuntimeConfig()
  const currentRoutePath = useRoute().fullPath
  // useServerMessage will share the message to the client side(through cookies), and consume them after clinet hydration.
  // The consuming message logic should inside plugins/init.client.ts
  const { setMessage } = useServerMessage()

  const payload = computed(() => {
    const rawObj = options && 'payload' in options
      ? deepToValue(options.payload)
      : undefined

    if ('payload' in apiSchema === false) {
      return rawObj
    }

    const { success, data, error } = apiSchema.payload.safeParse(rawObj)
    if (!success) {
      throw createError({
        ...error,
        data: rawObj,
        message: `[useApi] Failed to call "${apiName}" API: parsing payload object error.`
      })
    }

    return data
  })

  const pathParams = computed(() => {
    const rawObj = options && 'pathParams' in options
      ? deepToValue(options.pathParams)
      : undefined

    if ('pathParams' in apiSchema === false) {
      return rawObj
    }

    const { success, data, error } = apiSchema.pathParams.safeParse(rawObj)
    if (!success) {
      throw createError({
        ...error,
        data: rawObj,
        message: `[useApi] Failed to call "${apiName}" API: parsing pathParams object error.`
      })
    }

    return data
  })

  const query = computed(() => {
    const rawObj = options && 'query' in options
      ? deepToValue(options.query)
      : undefined

    if ('query' in apiSchema === false) {
      return rawObj
    }

    const { success, data, error } = apiSchema.query.safeParse(rawObj)
    if (!success) {
      throw createError({
        ...error,
        data: rawObj,
        message: `[useApi] Failed to call "${apiName}" API: parsing query object error.`
      })
    }

    return data
  })

  // According to pathParams object to compile the dynamic API URI
  const url = computed(() => {
    const apiUrl = apiSchema.url

    if (!pathParams.value) {
      return apiUrl
    }

    try {
      return compile(apiUrl)(pathParams.value)
    }
    catch (e: unknown) {
      const msg = `[useApi] Failed to compile dynamic URL: "${apiUrl}"`
      console.error(msg, 'pathParams', pathParams.value)
      throw createError(new Error(msg, { cause: e }))
    }

    return apiUrl
  })

  // generate custom key because query and pathParams is reactive, the key should dynamically change depending on them.
  const key = computed(() => {
    return hash([config.public.apiBaseUrl, url.value, query.value, payload.value, API_SCHEMA[apiName].method, options?.headers], {
      /**
       * If browser is Safari, hashing with function will cause different hash value between server and client side, and cause
       * missmatch error.
       * Here using replacer to replace function with normal string to prevent inconsistent hash issue.
       */
      replacer(value) {
        if (typeof value === 'function') {
          return 'function'
        }
        return value
      }
    })
  })

  // we need to manually stop watcher since the watcher code block is behind await,
  // which means it is created asynchronously, it won't be bound to the owner component
  // and must be stopped manually to avoid memory leaks.
  // see https://vuejs.org/guide/essentials/watchers.html#stopping-a-watcher
  onUnmounted(() => {
    stopErrorHandlingEffect()
  })

  const useFetchOption: UseFetchOptions<ApiResponse[T]> = {
    key: key.value,
    baseURL: config.public.apiBaseUrl,
    method: API_SCHEMA[apiName].method,
    responseType: 'json',
    headers: {
      'Accept': 'application/json',
      // TODO: fill auth token or key here
      'x-api-key': config.public.apiKey,
      'Authorization': token.value ? `Bearer ${token.value}` : ''
    },

    transform(input) {
      const { success, data, error } = apiSchema.response.safeParse(input)

      if (!success) {
        throw createError({
          ...error,
          data: input,
          message: `[useApi] Failed to parse "${apiName}" API response: ${error.message}`
        })
      }

      return data as ApiResponse[T]
    },

    // Since we keep the reactivity for pathParams and query object, the key should also be reactive depending on bothe of them.
    // For example, query object have page property, when the value of page has changed, useFetch will trigger another API call, the
    // response data should be updated, but the key is still the same, therefor it may get the old data because of the same key.
    // Here we implement our logic to get cache data, the key will be parsed dynamically depending on current pathParams and query.
    getCachedData() {
      // TODO: implement TTL(Time to Live) if necessary
      // see https://www.youtube.com/watch?v=njsGVmcWviY
      const keyValue = key.value
      return nuxtApp.isHydrating ? nuxtApp.payload.data[keyValue] : nuxtApp.static.data[keyValue]
    },

    onRequestError(context) {
      // TODO: onRequestError probably means network error, we can show no-network error toast here
      console.error('[useApi] onRequestError', context.error)
    },
    ...options,
    query
  }

  if (payload.value) {
    useFetchOption.body = payload
  }

  const fetchResult = await useFetch(url, useFetchOption)

  // default error handling effect
  // NOTE:
  // This watcher is created asynchronously because it was behind useFetch async call, that means
  // we have to manually stop it when component unmount.
  const stopErrorHandlingEffect = watch(fetchResult.error, async () => {
    if (options?.skipError) {
      return
    }

    const error = fetchResult.error.value
    if (!error) {
      return
    }

    let message = ''
    let navigateParams: Parameters<typeof navigateTo> | undefined = undefined

    const { data: errorResponse } = errorResponseParser.safeParse(error.data)

    switch (error.statusCode) {
      case 400: {
        message = errorResponse?.message || 'error.bad-request'
        break
      }
      case 401: {
        // TODO: Assign appropriate error message
        message = errorResponse?.message || 'error.unauthorized'

        // TODO:
        // 401 means unauthorized, you probably need to reset all global states here and navigate to login page
        // ex:
        // navigateParams = [{ name: 'login', query: {redirect: 'current route path'}, replace: true }]
        // resetAllStates()
        break
      }

      case 403: {
        // TODO: Assign appropriate error message
        message = errorResponse?.message || 'error.permission-denied'
        navigateParams = ['/', { replace: true }]
        break
      }

      case 404:
      case 405: {
        // TODO: Assign appropriate error message
        message = errorResponse?.message || 'error.resource-not-found'
        navigateParams = ['/', { replace: true }]
        break
      }
    }

    if (!message) {
      // TODO: Assign appropriate unknown error message
      message = error.message || errorResponse?.message || 'error.unknown'
    }

    if (options?.errorHandler) {
      options?.errorHandler({
        status: error.statusCode,
        error,
        message
      })

      return
    }

    if (navigateParams) {
      const isSamePath = navigateParams[0] === currentRoutePath
      // prevent infinite navigation loop
      if (isSamePath) {
        console.warn('[useApi] Infinite loop detected, cancel navigation. fullPath:', currentRoutePath)
        return
      }

      if (import.meta.server) {
        // set error message back to client, and consume it in plugins/init.client.ts
        // NOTE:
        // useState is a good idea to share server state to the client, but unfortunately it
        // doesn't work if we navigate to another page after useSate(don't know why)
        setMessage('error', message)
      }

      /**
       * NOTE:
       * If you want to use "navigateTo" to navigate to another page, you need to use "callWithNuxt" to call the hook
       * to prevent following error in server side：
       *
       * "A composable that requires access to the Nuxt instance was
       * called outside of a plugin, Nuxt hook, Nuxt middleware, or Vue
       * setup function."
       *
       * About the error：
       * https://github.com/nuxt/nuxt/issues/14269#issuecomment-1397352832
       * https://nuxt.com/docs/guide/concepts/auto-imports#vue-and-nuxt-composables
       */
      await callWithNuxt(nuxtApp, navigateTo, navigateParams)
    }

    // throw error inside async callback currently will not be caught in global error handler,
    // so comment it until it works.
    // if (import.meta.client) {
    //   console.log('throw client error')
    //   throw createError({ ...error, message })
    // }

    // if (import.meta.server && !hasNavigated) {
    //   console.log('throw server error')
    //   throw createError({ ...error, message })
    // }
  }, { immediate: true })

  return fetchResult
}

export default useApi
