import { defineNuxtPlugin } from '#app'
import useServerMessage from '@/composables/userServerMessage'

export default defineNuxtPlugin(() => {
  const { consumeMessage } = useServerMessage()

  consumeMessage((msg) => {
    // TODO: show toast message
    console.log('consume server message', msg.message)
    alert('server message: ' + msg.message)
  })
})
