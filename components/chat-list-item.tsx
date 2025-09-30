"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { ChatWithDetails } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface ChatListItemProps {
  chat: ChatWithDetails
  onClick: () => void
}

export function ChatListItem({ chat, onClick }: ChatListItemProps) {
  const { otherUser, lastMessage, unreadCount } = chat

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-accent transition-colors text-left"
    >
      <Avatar className="w-12 h-12">
        <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
        <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground truncate">{otherUser.name}</h3>
          {lastMessage && (
            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
              {formatDistanceToNow(lastMessage.timestamp, {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">{lastMessage?.content || "메시지를 시작해보세요"}</p>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-destructive text-destructive-foreground flex-shrink-0">{unreadCount}</Badge>
          )}
        </div>
      </div>
    </button>
  )
}
