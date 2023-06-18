import { computed, useCookie, useState } from '#imports'

// In server side the cookie does not change immediately, that means you can not
// get new value after set cookie in server side.
// The solution here is using useState to sync cookie value since it will change immediately,
// and it is reactive in both server and client side.
export default function useToken() {
  const tokenCookie = useCookie('token')
  const tokenState = useState('token', () => tokenCookie)

  const token = computed({
    get() {
      return tokenState.value
    },
    set(value) {
      tokenCookie.value = value
      tokenState.value = value
    }
  })

  return token
}
