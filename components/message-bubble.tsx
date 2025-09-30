"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message, User } from "@/lib/types"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: Message
  sender: User
  isOwn: boolean
}

export function MessageBubble({ message, sender, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn("flex gap-2 mb-4", isOwn && "flex-row-reverse")}>
      {!isOwn && (
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={sender.avatar || "/placeholder.svg"} alt={sender.name} />
          <AvatarFallback>{sender.name[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1 max-w-[70%]", isOwn && "items-end")}>
        {!isOwn && <span className="text-xs text-muted-foreground px-2">{sender.name}</span>}

        <div className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}>
          <div
            className={cn(
              "rounded-2xl px-4 py-2 break-words",
              isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
            )}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>

          <span className="text-xs text-muted-foreground flex-shrink-0">
            {format(message.timestamp, "a h:mm", { locale: ko })}
          </span>
        </div>
      </div>
    </div>
  )
}
