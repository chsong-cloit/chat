import type { Chat, Message, User, ChatWithDetails } from "./types"

export function getChats(currentUserId: string): ChatWithDetails[] {
  if (typeof window === "undefined") return []

  const chatsStr = localStorage.getItem("chats")
  const chats: Chat[] = chatsStr ? JSON.parse(chatsStr) : []

  const usersStr = localStorage.getItem("users")
  const users: User[] = usersStr ? JSON.parse(usersStr) : []

  const messagesStr = localStorage.getItem("messages")
  const messages: Message[] = messagesStr ? JSON.parse(messagesStr) : []

  // Filter chats for current user and add details
  return chats
    .filter((chat) => chat.participants.includes(currentUserId))
    .map((chat) => {
      const otherUserId = chat.participants.find((id) => id !== currentUserId)
      const otherUser = users.find((u) => u.id === otherUserId)

      // Get last message
      const chatMessages = messages.filter((m) => m.chatId === chat.id).sort((a, b) => b.timestamp - a.timestamp)

      const lastMessage = chatMessages[0]

      // Count unread messages
      const unreadCount = chatMessages.filter((m) => m.senderId !== currentUserId && !m.read).length

      return {
        ...chat,
        lastMessage,
        unreadCount,
        otherUser: otherUser || {
          id: otherUserId || "",
          name: "Unknown User",
          email: "",
          avatar: "",
        },
      }
    })
    .sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || 0
      const bTime = b.lastMessage?.timestamp || 0
      return bTime - aTime
    })
}

export function getMessages(chatId: string): Message[] {
  if (typeof window === "undefined") return []

  const messagesStr = localStorage.getItem("messages")
  const messages: Message[] = messagesStr ? JSON.parse(messagesStr) : []

  return messages.filter((m) => m.chatId === chatId).sort((a, b) => a.timestamp - b.timestamp)
}

export function sendMessage(chatId: string, senderId: string, content: string): Message {
  if (typeof window === "undefined") throw new Error("Cannot send message on server")

  const messagesStr = localStorage.getItem("messages")
  const messages: Message[] = messagesStr ? JSON.parse(messagesStr) : []

  const newMessage: Message = {
    id: crypto.randomUUID(),
    chatId,
    senderId,
    content,
    timestamp: Date.now(),
    read: false,
  }

  messages.push(newMessage)
  localStorage.setItem("messages", JSON.stringify(messages))

  window.dispatchEvent(new Event("storage"))

  return newMessage
}

export function createChat(userId1: string, userId2: string): Chat {
  if (typeof window === "undefined") throw new Error("Cannot create chat on server")

  const chatsStr = localStorage.getItem("chats")
  const chats: Chat[] = chatsStr ? JSON.parse(chatsStr) : []

  // Check if chat already exists
  const existingChat = chats.find((chat) => chat.participants.includes(userId1) && chat.participants.includes(userId2))

  if (existingChat) return existingChat

  const newChat: Chat = {
    id: crypto.randomUUID(),
    participants: [userId1, userId2],
    unreadCount: 0,
  }

  chats.push(newChat)
  localStorage.setItem("chats", JSON.stringify(chats))

  return newChat
}

export function markMessagesAsRead(chatId: string, userId: string) {
  if (typeof window === "undefined") return

  const messagesStr = localStorage.getItem("messages")
  const messages: Message[] = messagesStr ? JSON.parse(messagesStr) : []

  const updatedMessages = messages.map((m) => {
    if (m.chatId === chatId && m.senderId !== userId) {
      return { ...m, read: true }
    }
    return m
  })

  localStorage.setItem("messages", JSON.stringify(updatedMessages))
}

export function getAllUsers(excludeUserId?: string): User[] {
  if (typeof window === "undefined") return []

  const usersStr = localStorage.getItem("users")
  const users: User[] = usersStr ? JSON.parse(usersStr) : []

  if (excludeUserId) {
    return users.filter((u) => u.id !== excludeUserId)
  }

  return users
}

// Initialize with demo data
export function initializeDemoData(currentUserId: string) {
  if (typeof window === "undefined") return

  const usersStr = localStorage.getItem("users")
  const users: User[] = usersStr ? JSON.parse(usersStr) : []

  // Create demo users if they don't exist
  const demoUsers = [
    { name: "김철수", email: "kim@example.com" },
    { name: "이영희", email: "lee@example.com" },
    { name: "박민수", email: "park@example.com" },
  ]

  demoUsers.forEach((demo) => {
    if (!users.find((u) => u.email === demo.email)) {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: demo.name,
        email: demo.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demo.email}`,
        statusMessage: "안녕하세요!",
      }
      users.push(newUser)
    }
  })

  localStorage.setItem("users", JSON.stringify(users))

  // Create demo chats
  const demoUser = users.find((u) => u.email === "kim@example.com")
  if (demoUser) {
    const chat = createChat(currentUserId, demoUser.id)
    sendMessage(chat.id, demoUser.id, "안녕하세요! 반갑습니다.")
    sendMessage(chat.id, currentUserId, "네, 안녕하세요!")
  }
}
