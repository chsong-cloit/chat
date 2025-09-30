"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getChats, initializeDemoData } from "@/lib/chat-storage"
import { ChatListItem } from "@/components/chat-list-item"
import { ChatHeader } from "@/components/chat-header"
import { BottomNav } from "@/components/bottom-nav"
import type { ChatWithDetails } from "@/lib/types"

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatWithDetails[]>([])
  const router = useRouter()
  const user = getCurrentUser()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    // Initialize demo data on first load
    initializeDemoData(user.id)

    // Load chats
    loadChats()
  }, [user, router])

  const loadChats = () => {
    if (!user) return
    const userChats = getChats(user.id)
    setChats(userChats)
  }

  const handleChatClick = (chatId: string) => {
    router.push(`/chats/${chatId}`)
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />

      <main className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">채팅이 없습니다</h2>
            <p className="text-sm text-muted-foreground">친구와 대화를 시작해보세요</p>
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} onClick={() => handleChatClick(chat.id)} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
