export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  statusMessage?: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  timestamp: number
  read: boolean
}

export interface Chat {
  id: string
  participants: string[]
  lastMessage?: Message
  unreadCount: number
}

export interface ChatWithDetails extends Chat {
  otherUser: User
}
