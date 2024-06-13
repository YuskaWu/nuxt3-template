import { isRef, toValue } from '#imports'

import type { Ref } from '#imports'

export default function deepToValue<T>(target: Ref<T> | T): T {
  function getValue<K>(input: Ref<K> | K): K {
    if (Array.isArray(input)) {
      return input.map(item => getValue(item)) as K
    }

    if (isRef(input)) {
      return getValue(toValue(input))
    }

    // if (isReactive(input) || isProxy(input)) {
    //   return getValue(toRaw(input))
    // }

    if (input && typeof input === 'object') {
      const obj = {} as K

      Object.keys(input).forEach((key) => {
        const objKey = key as keyof K
        obj[objKey] = getValue(input[objKey])
      })

      return obj
    }

    return input
  }

  return getValue(target)
}
