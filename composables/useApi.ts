import { useFetch } from '#imports'

export function useApi() {
  return useFetch('/test')
}
