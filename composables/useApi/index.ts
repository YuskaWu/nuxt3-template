import { computed, toValue, useFetch, useRuntimeConfig } from '#imports'
import type { UseFetchOptions } from 'nuxt/app'
import { hash } from 'ohash'
import { compile } from 'path-to-regexp'
import type { Ref, UnwrapNestedRefs } from 'vue'
import type { ApiNames, ApiTypeMap, ResponseJson } from './types'
import { API_LIST } from './types'

type Params<T> =
  | Ref<T>
  | T
  | UnwrapNestedRefs<T>
  | {
      [key in keyof T]: Params<T[key]>
    }

type CustomUseFetchOptions<T extends ApiNames> = UseFetchOptions<
  ResponseJson<ApiTypeMap[T]['data']>
>

type UseApiArguments<
  T extends ApiNames,
  K extends Omit<ApiTypeMap[T], 'data'>
> = {} extends K
  ? [apiName: T, fetchOption?: CustomUseFetchOptions<T>]
  : [apiName: T, fetchOption: CustomUseFetchOptions<T> & Params<K>]

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
      fetchOption && 'pathParams' in fetchOption
        ? toValue(fetchOption.pathParams)
        : null

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

  const payload =
    fetchOption && 'payload' in fetchOption
      ? (fetchOption.payload as Record<string, any>)
      : undefined

  const key = hash([fetchOption, config.public.baseUrl, url.value])

  const options: CustomUseFetchOptions<T> = {
    key,
    baseURL: config.public.baseUrl,
    method: API_LIST[apiName].method,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
      // Authorization: authHeader
    },
    body: payload,
    onRequestError: defaultErrorHandler,
    ...fetchOption
  }

  return useFetch(url, options)
}

export default useApi
