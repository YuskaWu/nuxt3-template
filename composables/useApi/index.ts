import { computed, useFetch, useRuntimeConfig } from '#imports'
import type { UseFetchOptions } from 'nuxt/app'
import { compile } from 'path-to-regexp'
import type {
  ApiNames,
  ApiTypeMap,
  CustomUseFetchOptions,
  UseApiArguments
} from './types'
import { API_LIST } from './types'

let id = 1

const defaultErrorHandler: UseFetchOptions<unknown>['onRequestError'] = () => {
  // This will only trigger on server side.
  // TODO: Try @nuxt/kit to log on server side.
}

function useApi<T extends ApiNames, K extends Omit<ApiTypeMap[T], 'data'>>(
  ...args: UseApiArguments<T, K>
) {
  const [apiName, fetchOption] = args
  const config = useRuntimeConfig()

  const url = computed(() => {
    const apiUrl = API_LIST[apiName].url
    const pathParams =
      fetchOption && 'pathParams' in fetchOption ? fetchOption.pathParams : null

    if (!pathParams) {
      return apiUrl
    }

    try {
      return compile(apiUrl)(pathParams)
    } catch (e) {
      console.error('[useApi] Failed to compile dynamic url.', e)
    }

    return apiUrl
  })

  const options: CustomUseFetchOptions<T> = {
    key: (id++).toString(),
    baseURL: config.public.baseUrl,
    method: API_LIST[apiName].method,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
      // Authorization: authHeader
    },
    onRequestError: defaultErrorHandler,
    ...fetchOption
  }

  return useFetch(url, options)
}

export default useApi
