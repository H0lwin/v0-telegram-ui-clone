"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Chat, User } from "@/lib/types"
import { Avatar } from "./avatar"
import { ArrowLeft, Phone, Video, MoreVertical, Search } from "lucide-react"
import { ChatOptionsMenu } from "./chat-options-menu"

interface ChatHeaderProps {
  chat: Chat
  onBack?: () => void
  onInfoClick?: () => void
  onMuteChat?: () => void
  onPinChat?: () => void
  onClearHistory?: () => void
  onDeleteChat?: () => void
  onSearchMessages?: () => void
  className?: string
}

function formatLastSeen(date?: Date): string {
  if (!date) return "last seen recently"
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "last seen just now"
  if (minutes < 60) return `last seen ${minutes} min ago`
  if (hours < 24) return `last seen ${hours}h ago`
  if (days === 1) return "last seen yesterday"
  return `last seen ${days} days ago`
}

export function ChatHeader({ 
  chat, 
  onBack, 
  onInfoClick,
  onMuteChat,
  onPinChat,
  onClearHistory,
  onDeleteChat,
  onSearchMessages,
  className 
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const participant = chat.participants.find((p) => p.id !== "user-1")
  const isOnline = chat.type === "private" ? participant?.online : undefined
  const isTyping = chat.typing && chat.typing.length > 0

  const getSubtitle = () => {
    if (isTyping) {
      return (
        <span className="text-primary animate-pulse">
          {chat.typing!.join(", ")} {chat.typing!.length === 1 ? "is" : "are"} typing...
        </span>
      )
    }
    
    if (chat.type === "private") {
      if (participant?.online) {
        return <span className="text-online font-medium">online</span>
      }
      return formatLastSeen(participant?.lastSeen)
    }
    
    if (chat.type === "group") {
      const onlineCount = chat.participants.filter(p => p.online).length
      return `${chat.participants.length} members${onlineCount > 0 ? `, ${onlineCount} online` : ""}`
    }
    
    if (chat.type === "channel") {
      return "channel"
    }
    
    return null
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-2 border-b border-border bg-card",
      className
    )}>
      {/* Back button (mobile) */}
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-accent transition-colors lg:hidden"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      )}

      {/* Avatar and Info */}
      <button
        onClick={onInfoClick}
        className="flex-1 flex items-center gap-3 min-w-0 hover:bg-accent/50 rounded-lg p-1 -m-1 transition-colors"
      >
        <Avatar
          name={chat.name}
          size="md"
          online={isOnline}
        />
        
        <div className="flex-1 min-w-0 text-left">
          <h2 className="font-semibold text-foreground truncate">
            {chat.name}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {getSubtitle()}
          </p>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSearchMessages}
          className="p-2 rounded-full hover:bg-accent transition-colors hidden sm:flex"
          aria-label="Search in chat"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-accent transition-colors hidden sm:flex"
          aria-label="Voice call"
        >
          <Phone className="h-5 w-5 text-muted-foreground" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-accent transition-colors hidden md:flex"
          aria-label="Video call"
        >
          <Video className="h-5 w-5 text-muted-foreground" />
        </button>
        
        {/* More Options with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              "p-2 rounded-full hover:bg-accent transition-colors",
              showMenu && "bg-accent"
            )}
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <ChatOptionsMenu
            chat={chat}
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            onMute={onMuteChat}
            onPin={onPinChat}
            onClearHistory={onClearHistory}
            onDeleteChat={onDeleteChat}
            onViewInfo={onInfoClick}
            onSearchMessages={onSearchMessages}
          />
        </div>
      </div>
    </div>
  )
}
