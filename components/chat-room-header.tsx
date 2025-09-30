"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { User } from "@/lib/types"
import { useRouter } from "next/navigation"

interface ChatRoomHeaderProps {
  user: User
}

export function ChatRoomHeader({ user }: ChatRoomHeaderProps) {
  const router = useRouter()

  return (
    <header className="border-b bg-card">
      <div className="flex items-center gap-3 p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{user.name}</h2>
          {user.statusMessage && <p className="text-xs text-muted-foreground truncate">{user.statusMessage}</p>}
        </div>
      </div>
    </header>
  )
}
