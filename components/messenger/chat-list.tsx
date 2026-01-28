"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types"
import { ChatListItem } from "./chat-list-item"
import { Menu, Search, X, Edit } from "lucide-react"

interface ChatListProps {
  chats: Chat[]
  activeChat?: string
  onSelectChat: (chatId: string) => void
  onMenuClick?: () => void
  onNewChat?: () => void
  className?: string
}

export function ChatList({
  chats,
  activeChat,
  onSelectChat,
  onMenuClick,
  onNewChat,
  className,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedChats = filteredChats.filter((chat) => chat.pinned)
  const regularChats = filteredChats.filter((chat) => !chat.pinned)

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearching(true)}
            onBlur={() => !searchQuery && setIsSearching(false)}
            className="w-full pl-9 pr-3 py-2 bg-input rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("")
                setIsSearching(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-accent"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {pinnedChats.length > 0 && (
          <div>
            {pinnedChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={activeChat === chat.id}
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
            {regularChats.length > 0 && (
              <div className="border-b border-border" />
            )}
          </div>
        )}
        
        {regularChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={activeChat === chat.id}
            onClick={() => onSelectChat(chat.id)}
          />
        ))}

        {filteredChats.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">No chats found</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onNewChat}
        className="absolute bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        aria-label="New chat"
      >
        <Edit className="h-5 w-5" />
      </button>
    </div>
  )
}
