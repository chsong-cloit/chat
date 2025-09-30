"use client"

import { usePathname, useRouter } from "next/navigation"
import { MessageCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      label: "채팅",
      icon: MessageCircle,
      path: "/chats",
      active: pathname === "/chats" || pathname?.startsWith("/chats/"),
    },
    {
      label: "친구",
      icon: Users,
      path: "/friends",
      active: pathname === "/friends",
    },
  ]

  return (
    <nav className="border-t bg-card">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-6 flex-1 transition-colors",
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
