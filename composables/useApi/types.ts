/* eslint-disable  no-use-before-define */
import type { UseFetchOptions } from 'nuxt/app'
import type { Ref, UnwrapNestedRefs } from 'vue'

type Params<T> =
  | Ref<T>
  | T
  | UnwrapNestedRefs<T>
  | {
      [key in keyof T]: Params<T[key]>
    }

// Define common response type of API.

// Example:
// type ResponseJson<T> = {
//   code: number
//   data: T
//   message: string[]
// }

type ResponseJson<T> = T

type ApiInfo = {
  url: string
  method: NonNullable<UseFetchOptions<unknown>['method']>
}

export type ApiNames = keyof ApiTypeMap
export type CustomUseFetchOptions<T extends ApiNames> = UseFetchOptions<
  ResponseJson<ApiTypeMap[T]['data']>
>

export type UseApiArguments<
  T extends ApiNames,
  K extends Omit<ApiTypeMap[T], 'data'>
> = {} extends K
  ? [apiName: T, fetchOption?: CustomUseFetchOptions<T>]
  : [apiName: T, fetchOption: CustomUseFetchOptions<T> & K]

// --------------------------------------------------------------------------

// Developer define API in ApiTypeMap.
// The rule of ApiTypeMap is:
// 1. Must define "data" type which is the data we want from response json.
// 2. Must define "pathParams" type if the API url is dynamic.
// 3. Define "query" type if the API support query string.
// 4. Using Params<T> to define "pathParams" & "query" type so that you can use "ref<T>" or "reactive<T>"

// Example:
// export type ApiTypeMap = {
//   getProfile: {
//     pathParams: Params<{ id: string | number }>
//     data: { name: string, age: number }
//   }
//   getLogs: {
//     query: Params<{ page: number, total: number }>
//     data: { time: number, content: string }[]
//   }
//   updateProfile: {
//     payload: {name: string, age: number }
//   }
// }

// Also developer need to define the URL & method in API_LIST

// Example:
// export const API_LIST = {
//   getProfile: { url: 'user/:id/profile', method: 'get' },
//   getLogs: { url: 'logs', method: 'get' },
//   updateProfile: { url: 'user/:id/profile', method: 'post' }
// } satisfies { [key in ApiNames]: ApiInfo }

export type ApiTypeMap = {
  getExampleProfile: {
    pathParams: Params<{ id: string | number }>
    data: {}
  }
  getFakeUserProfile: {
    data: {
      results: FakeProfile[]
      info: {
        seed: string
        results: number
        page: number
        version: string
      }
    }
  }
}

export const API_LIST = {
  getExampleProfile: { url: 'user/:id/profile', method: 'get' },
  getFakeUserProfile: { url: '', method: 'get' }
} satisfies { [key in ApiNames]: ApiInfo }

type FakeProfile = {
  gender: string
  name: {
    title: string
    first: string
    last: string
  }
  location: {
    street: {
      number: number
      name: string
    }
    city: string
    state: string
    country: string
    postcode: number
    coordinates: {
      latitude: string
      longitude: string
    }
    timezone: {
      offset: string
      description: string
    }
  }
  email: string
  login: {
    uuid: string
    username: string
    password: string
    salt: string
    md5: string
    sha1: string
    sha256: string
  }
  dob: {
    date: string
    age: number
  }
  registered: {
    date: string
    age: number
  }
  phone: string
  cell: string
  id: {
    name: string
    value: string
  }
  picture: {
    large: string
    medium: string
    thumbnail: string
  }
  nat: string
}
