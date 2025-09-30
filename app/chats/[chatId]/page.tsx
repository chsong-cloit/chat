"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getMessages, sendMessage, markMessagesAsRead } from "@/lib/chat-storage"
import { MessageBubble } from "@/components/message-bubble"
import { MessageInput } from "@/components/message-input"
import { ChatRoomHeader } from "@/components/chat-room-header"
import type { Message, User } from "@/lib/types"

export default function ChatRoomPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const chatId = params.chatId as string
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
      return
    }

    loadMessages()
    loadOtherUser()

    // Mark messages as read
    markMessagesAsRead(chatId, currentUser.id)

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      loadMessages()
    }, 2000)

    return () => clearInterval(interval)
  }, [chatId, currentUser, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = () => {
    const chatMessages = getMessages(chatId)
    setMessages(chatMessages)
  }

  const loadOtherUser = () => {
    if (!currentUser) return

    const chatsStr = localStorage.getItem("chats")
    const chats = chatsStr ? JSON.parse(chatsStr) : []
    const chat = chats.find((c: any) => c.id === chatId)

    if (chat) {
      const otherUserId = chat.participants.find((id: string) => id !== currentUser.id)
      const usersStr = localStorage.getItem("users")
      const users = usersStr ? JSON.parse(usersStr) : []
      const user = users.find((u: User) => u.id === otherUserId)
      setOtherUser(user || null)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (content: string) => {
    if (!currentUser) return

    sendMessage(chatId, currentUser.id, content)
    loadMessages()
  }

  const getUserById = (userId: string): User => {
    if (currentUser?.id === userId) return currentUser
    if (otherUser?.id === userId) return otherUser
    return {
      id: userId,
      name: "Unknown",
      email: "",
    }
  }

  if (!currentUser || !otherUser) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatRoomHeader user={otherUser} />

      <main className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">첫 메시지를 보내보세요</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                sender={getUserById(message.senderId)}
                isOwn={message.senderId === currentUser.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}
