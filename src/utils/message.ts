import { createVNode, render } from 'vue'
import Message from '../components/Message/Message.vue'

let messageContainer: HTMLDivElement | null = null

export type MessageType = 'success' | 'error' | 'warning' | 'info'

export function showMessage(content: string, type: MessageType = 'info', duration = 3000) {
  if (!messageContainer) {
    messageContainer = document.createElement('div')
    document.body.appendChild(messageContainer)
  }

  const vnode = createVNode(Message, {
    content,
    type,
    duration,
  })

  render(vnode, messageContainer)

  setTimeout(() => {
    render(null, messageContainer!)
  }, duration + 300) // 等待动画结束
}

export const message = {
  success(content: string) {
    showMessage(content, 'success')
  },
  error(content: string) {
    showMessage(content, 'error')
  },
  warning(content: string) {
    showMessage(content, 'warning')
  },
  info(content: string) {
    showMessage(content, 'info')
  }
} 