import { refreshCookie, useCookie } from '#imports'

type MessageType = 'error' | 'info'

type ServerMessage = {
  type: MessageType
  message: string
}

const KEY = 'serverMessage'

export default function useServerMessage() {
  const serverMessage = useCookie<ServerMessage | undefined>(KEY)

  function setMessage(type: MessageType, message: string) {
    serverMessage.value = { type, message }
  }

  function consumeMessage(handler?: (messages: ServerMessage) => void) {
    if (!serverMessage.value) {
      return
    }
    if (handler) {
      handler(serverMessage.value)
    }
    serverMessage.value = undefined
    refreshCookie(KEY)
  }

  return { setMessage, consumeMessage }
}
