"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"
import { MessageCircle } from "lucide-react"

interface UserListItemProps {
  user: User
  onStartChat: (user: User) => void
}

export function UserListItem({ user, onStartChat }: UserListItemProps) {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-accent transition-colors">
      <Avatar className="w-12 h-12">
        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
        {user.statusMessage && <p className="text-sm text-muted-foreground truncate">{user.statusMessage}</p>}
      </div>

      <Button size="icon" variant="ghost" onClick={() => onStartChat(user)} className="flex-shrink-0">
        <MessageCircle className="w-5 h-5" />
      </Button>
    </div>
  )
}
