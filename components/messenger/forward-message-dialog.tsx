"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, Search, Check } from "lucide-react"
import { Avatar } from "./avatar"
import type { Chat, Message, User } from "@/lib/types"

interface ForwardMessageDialogProps {
  isOpen: boolean
  messages: Message[]
  chats: Chat[]
  currentUserId: string
  onClose: () => void
  onForward: (chatIds: string[], messages: Message[]) => void
}

export function ForwardMessageDialog({
  isOpen,
  messages,
  chats,
  currentUserId,
  onClose,
  onForward,
}: ForwardMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())

  if (!isOpen) return null

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleChat = (chatId: string) => {
    setSelectedChats((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId)
      } else {
        newSet.add(chatId)
      }
      return newSet
    })
  }

  const handleForward = () => {
    if (selectedChats.size > 0) {
      onForward(Array.from(selectedChats), messages)
      setSelectedChats(new Set())
      setSearchQuery("")
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedChats(new Set())
    setSearchQuery("")
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:max-h-[80vh] bg-card rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            Forward {messages.length} {messages.length === 1 ? "message" : "messages"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredChats.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground px-4 py-2">Chats</p>
              {filteredChats.map((chat) => {
                const isSelected = selectedChats.has(chat.id)
                return (
                  <button
                    key={chat.id}
                    onClick={() => toggleChat(chat.id)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors"
                  >
                    <Avatar name={chat.name} size="md" src={chat.avatar} />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{chat.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {chat.type === "private" ? "Private chat" : chat.type === "group" ? "Group" : "Channel"}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    {!isSelected && (
                      <div className="h-6 w-6 rounded-full border-2 border-border" />
                    )}
                  </button>
                )
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No chats found</p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={selectedChats.size === 0}
            className={cn(
              "flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors",
              selectedChats.size === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            Forward
          </button>
        </div>
      </div>
    </>
  )
}
