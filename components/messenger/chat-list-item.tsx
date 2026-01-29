"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types"
import { Avatar } from "./avatar"
import { Check, CheckCheck, Pin, VolumeX, Users } from "lucide-react"

interface ChatListItemProps {
  chat: Chat
  isActive?: boolean
  onClick?: () => void
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (days === 1) {
    return "Yesterday"
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: "short" })
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }
}

function MessageStatus({ status }: { status: string }) {
  if (status === "read") {
    return <CheckCheck className="h-4 w-4 text-primary" />
  }
  if (status === "delivered") {
    return <CheckCheck className="h-4 w-4 text-muted-foreground" />
  }
  if (status === "sent") {
    return <Check className="h-4 w-4 text-muted-foreground" />
  }
  return null
}

export function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  const [mounted, setMounted] = useState(false)
  const isOutgoing = chat.lastMessage?.senderId === "user-1"
  const participant = chat.participants.find((p) => p.id !== "user-1")

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all duration-150",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-accent active:bg-accent/80"
      )}
    >
      <Avatar
        name={chat.name}
        size="lg"
        online={chat.type === "private" ? participant?.online : undefined}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {chat.type === "group" && (
              <Users className={cn(
                "h-4 w-4 flex-shrink-0",
                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
              )} />
            )}
            <span className={cn(
              "font-medium truncate",
              isActive ? "text-primary-foreground" : "text-foreground"
            )}>
              {chat.name}
            </span>
            {chat.muted && (
              <VolumeX className={cn(
                "h-4 w-4 flex-shrink-0",
                isActive ? "text-primary-foreground/60" : "text-muted-foreground"
              )} />
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {isOutgoing && chat.lastMessage && (
              <MessageStatus status={chat.lastMessage.status} />
            )}
            <span className={cn(
              "text-xs",
              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {mounted && chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className={cn(
            "text-sm truncate",
            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {chat.typing && chat.typing.length > 0 ? (
              <span className="text-primary italic">
                {chat.typing.join(", ")} {chat.typing.length === 1 ? "is" : "are"} typing...
              </span>
            ) : (
              <>
                {isOutgoing && <span>You: </span>}
                {chat.lastMessage?.content}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {chat.pinned && (
              <Pin className={cn(
                "h-3.5 w-3.5",
                isActive ? "text-primary-foreground/60" : "text-muted-foreground"
              )} />
            )}
            {chat.unreadCount > 0 && (
              <span className={cn(
                "flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-medium",
                chat.muted 
                  ? "bg-muted-foreground text-card" 
                  : isActive 
                    ? "bg-primary-foreground text-primary" 
                    : "bg-primary text-primary-foreground"
              )}>
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
