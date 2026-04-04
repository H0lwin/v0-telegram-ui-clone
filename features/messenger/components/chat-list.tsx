"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types"
import { ChatListItem } from "./chat-list-item"
import { Menu, Search, X, Edit } from "lucide-react"

interface ChatListProps {
  chats: Chat[]
  archivedChatIds?: Set<string>
  activeChat?: string
  onSelectChat: (chatId: string) => void
  onMenuClick?: () => void
  onNewChat?: () => void
  onOpenInNewWindow?: (chatId: string) => void
  onArchive?: (chatId: string) => void
  onPin?: (chatId: string) => void
  onMute?: (chatId: string, duration: string) => void
  onMarkAsRead?: (chatId: string) => void
  onBlockUser?: (chatId: string) => void
  onClearHistory?: (chatId: string) => void
  onDelete?: (chatId: string) => void
  className?: string
}

export function ChatList({
  chats,
  archivedChatIds,
  activeChat,
  onSelectChat,
  onMenuClick,
  onNewChat,
  onOpenInNewWindow,
  onArchive,
  onPin,
  onMute,
  onMarkAsRead,
  onBlockUser,
  onClearHistory,
  onDelete,
  className,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unarchivedChats = filteredChats.filter((chat) => !archivedChatIds?.has(chat.id))
  const archivedChats = filteredChats.filter((chat) => archivedChatIds?.has(chat.id))
  const pinnedChats = unarchivedChats.filter(chat => chat.pinned)
  const regularChats = unarchivedChats.filter(chat => !chat.pinned)

  return (
    <div className={cn("relative flex flex-col h-full bg-card", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-card">
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
            className="w-full pl-9 pr-9 py-2 bg-input rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setIsSearching(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Pinned */}
        {pinnedChats.length > 0 && (
          <div>
            <div className="px-4 py-1 text-xs text-muted-foreground uppercase font-medium tracking-wide">
              Pinned
            </div>
            {pinnedChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={activeChat === chat.id}
                onClick={() => onSelectChat(chat.id)}
                onOpenInNewWindow={onOpenInNewWindow ? () => onOpenInNewWindow(chat.id) : undefined}
                onArchive={onArchive ? () => onArchive(chat.id) : undefined}
                onPin={onPin ? () => onPin(chat.id) : undefined}
                onMute={onMute ? (duration) => onMute(chat.id, duration) : undefined}
                onMarkAsRead={onMarkAsRead ? () => onMarkAsRead(chat.id) : undefined}
                onBlockUser={onBlockUser ? () => onBlockUser(chat.id) : undefined}
                onClearHistory={onClearHistory ? () => onClearHistory(chat.id) : undefined}
                onDelete={onDelete ? () => onDelete(chat.id) : undefined}
              />
            ))}
            {regularChats.length > 0 && <div className="border-b border-border my-1" />}
          </div>
        )}

        {/* Regular Chats */}
        {regularChats.map(chat => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={activeChat === chat.id}
            onClick={() => onSelectChat(chat.id)}
            onOpenInNewWindow={onOpenInNewWindow ? () => onOpenInNewWindow(chat.id) : undefined}
            onArchive={onArchive ? () => onArchive(chat.id) : undefined}
            onPin={onPin ? () => onPin(chat.id) : undefined}
            onMute={onMute ? (duration) => onMute(chat.id, duration) : undefined}
            onMarkAsRead={onMarkAsRead ? () => onMarkAsRead(chat.id) : undefined}
            onBlockUser={onBlockUser ? () => onBlockUser(chat.id) : undefined}
            onClearHistory={onClearHistory ? () => onClearHistory(chat.id) : undefined}
            onDelete={onDelete ? () => onDelete(chat.id) : undefined}
          />
        ))}

        {/* Empty State */}
        {filteredChats.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">No chats found</p>
          </div>
        )}

        {archivedChats.length > 0 && (
          <div>
            <div className="px-4 py-1 text-xs text-muted-foreground uppercase font-medium tracking-wide">
              Archived
            </div>
            {archivedChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={activeChat === chat.id}
                onClick={() => onSelectChat(chat.id)}
                onOpenInNewWindow={onOpenInNewWindow ? () => onOpenInNewWindow(chat.id) : undefined}
                onArchive={onArchive ? () => onArchive(chat.id) : undefined}
                onPin={onPin ? () => onPin(chat.id) : undefined}
                onMute={onMute ? (duration) => onMute(chat.id, duration) : undefined}
                onMarkAsRead={onMarkAsRead ? () => onMarkAsRead(chat.id) : undefined}
                onBlockUser={onBlockUser ? () => onBlockUser(chat.id) : undefined}
                onClearHistory={onClearHistory ? () => onClearHistory(chat.id) : undefined}
                onDelete={onDelete ? () => onDelete(chat.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating New Chat Button */}
      {onNewChat && (
        <button
          onClick={onNewChat}
          className="absolute bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors active:scale-95"
          aria-label="New chat"
        >
          <Edit className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
