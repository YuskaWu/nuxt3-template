import type { FetchError } from 'ofetch'
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
  useNuxtApp,
  useRuntimeConfig
} from '#imports'

import { callWithNuxt, useRoute } from '#app'
import deepToValue from '@/utils/deepToValue'

type FetchOption = Parameters<typeof $fetch>[1]

// TODO: define response json type for failed request
type ErrorData = { code: number, message: string, status: string }

// Let T also can be an object wrapped by Ref since useFetch can accept Ref variable as the part of useFetch option
type ParamOption<T> =
  | Ref<T>
  | T
  | UnwrapNestedRefs<T>
  | {
    [key in keyof T]: ParamOption<T[key]>
  }

// The generic type of UseFetchOptions is the response json of API, and it depends on ApiName.
type UseApiOption<Error> = FetchOption & {
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
  ? [apiName: ApiName, options?: UseApiOption<FetchError<ErrorData>>]
  : [apiName: ApiName, options: ParamOption<Params> & UseApiOption<FetchError<ErrorData>>]

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

  const fetchOption = computed(() => {
    const opt: FetchOption = {
      baseURL: config.public.apiBaseUrl,
      method: API_SCHEMA[apiName].method,
      responseType: 'json',
      headers: {
        'Accept': 'application/json',
        // TODO: fill auth token or key here
        'x-api-key': config.public.apiKey,
        'Authorization': token.value ? `Bearer ${token.value}` : ''
      },

      onRequestError(context) {
        // TODO: onRequestError probably means network error, we can show no-network error toast here
        console.error('[useApi] onRequestError', context.error)
      },
      ...options,
      query: query.value ?? undefined
    }
    if (payload.value) {
      opt.body = payload.value
    }

    return opt
  })

  try {
    const result = await $fetch<ApiResponse[T]>(url.value, fetchOption.value)
    const { success, data, error } = apiSchema.response.safeParse(result)

    if (!success) {
      throw createError({
        ...error,
        data: result,
        message: `[useApi] Failed to parse "${apiName}" API response: ${error.message}`
      })
    }

    return data as ApiResponse[T]
  }
  catch (e: unknown) {
    const error = e as FetchError<ErrorData>
    if (options?.skipError) {
      throw error
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

    error.message = message

    if (options?.errorHandler) {
      options?.errorHandler({
        status: error.statusCode,
        error,
        message
      })

      throw error
    }

    if (navigateParams) {
      const isSamePath = navigateParams[0] === currentRoutePath
      // prevent infinite navigation loop
      if (isSamePath) {
        console.warn('[useApi] Infinite loop detected, cancel navigation. fullPath:', currentRoutePath)
        throw error
      }

      if (import.meta.server) {
        // set error message back to client, and consume it in plugins/init.client.ts
        // NOTE:
        // useState is a good idea to share server state to the client, but unfortunately it
        // doesn't work if we navigate to another page after useSate(don't know why)
        setMessage('error', message)
      }

      await callWithNuxt(nuxtApp, navigateTo, navigateParams)
    }

    throw error
  }
}

export default useApi
