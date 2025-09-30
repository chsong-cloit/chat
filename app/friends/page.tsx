"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAllUsers, createChat } from "@/lib/chat-storage"
import { UserListItem } from "@/components/user-list-item"
import { ChatHeader } from "@/components/chat-header"
import { BottomNav } from "@/components/bottom-nav"
import type { User } from "@/lib/types"

export default function FriendsPage() {
  const [users, setUsers] = useState<User[]>([])
  const router = useRouter()
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
      return
    }

    loadUsers()
  }, [currentUser, router])

  const loadUsers = () => {
    if (!currentUser) return
    const allUsers = getAllUsers(currentUser.id)
    setUsers(allUsers)
  }

  const handleStartChat = (user: User) => {
    if (!currentUser) return

    const chat = createChat(currentUser.id, user.id)
    router.push(`/chats/${chat.id}`)
  }

  if (!currentUser) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />

      <main className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">친구가 없습니다</h2>
            <p className="text-sm text-muted-foreground">새로운 친구를 추가해보세요</p>
          </div>
        ) : (
          <div>
            <div className="px-4 py-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">친구 {users.length}</p>
            </div>
            <div className="divide-y">
              {users.map((user) => (
                <UserListItem key={user.id} user={user} onStartChat={handleStartChat} />
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
