"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getChats, initializeDemoData } from "@/lib/chat-storage"
import { ChatListItem } from "@/components/chat-list-item"
import { ChatHeader } from "@/components/chat-header"
import { BottomNav } from "@/components/bottom-nav"
import type { ChatWithDetails } from "@/lib/types"

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatWithDetails[]>([])
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // 로딩 중일 때는 아무것도 하지 않음
    
    if (status === "unauthenticated") {
      router.push("/")
      return
    }

    if (session?.user) {
      // NextAuth 세션에서 사용자 정보 가져오기
      const user = {
        id: session.user.id || session.user.email,
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.avatar || session.user.image,
        statusMessage: "",
      }

      // Initialize demo data on first load
      initializeDemoData(user.id)

      // Load chats
      loadChats(user.id)
    }
  }, [session, status, router])

  const loadChats = (userId: string) => {
    const userChats = getChats(userId)
    setChats(userChats)
  }

  const handleChatClick = (chatId: string) => {
    router.push(`/chats/${chatId}`)
  }

  // 로딩 중이거나 인증되지 않은 경우 로딩 화면 표시
  if (status === "loading") {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-foreground animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-muted-foreground">채팅 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // 리디렉션 중
  }

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
