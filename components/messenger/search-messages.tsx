"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { Message, Chat } from "@/lib/types"
import { X, Search, ArrowUp, ArrowDown } from "lucide-react"

interface SearchMessagesProps {
  messages: Message[]
  chat: Chat
  currentUserId: string
  onClose: () => void
  onJumpToMessage?: (messageId: string) => void
  className?: string
}

export function SearchMessages({
  messages,
  chat,
  currentUserId,
  onClose,
  onJumpToMessage,
  className,
}: SearchMessagesProps) {
  const [query, setQuery] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(lowerQuery)
    )
  }, [messages, query])

  const handleNext = () => {
    if (results.length === 0) return
    const nextIndex = (currentIndex + 1) % results.length
    setCurrentIndex(nextIndex)
    onJumpToMessage?.(results[nextIndex].id)
  }

  const handlePrev = () => {
    if (results.length === 0) return
    const prevIndex = (currentIndex - 1 + results.length) % results.length
    setCurrentIndex(prevIndex)
    onJumpToMessage?.(results[prevIndex].id)
  }

  const getSenderName = (senderId: string) => {
    if (senderId === currentUserId) return "You"
    return chat.participants.find((p) => p.id === senderId)?.name || "Unknown"
  }

  return (
    <div className={cn("flex flex-col bg-card border-b border-border", className)}>
      {/* Search Input */}
      <div className="flex items-center gap-2 p-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentIndex(0)
            }}
            placeholder="Search messages..."
            className="w-full pl-9 pr-3 py-2 bg-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>
        
        {results.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{currentIndex + 1}/{results.length}</span>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded hover:bg-accent"
              aria-label="Previous result"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded hover:bg-accent"
              aria-label="Next result"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Close search"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Results Preview */}
      {query && (
        <div className="max-h-48 overflow-y-auto border-t border-border">
          {results.length > 0 ? (
            results.map((msg, index) => (
              <button
                key={msg.id}
                onClick={() => {
                  setCurrentIndex(index)
                  onJumpToMessage?.(msg.id)
                }}
                className={cn(
                  "w-full px-4 py-2 text-left hover:bg-accent transition-colors",
                  index === currentIndex && "bg-accent"
                )}
              >
                <p className="text-xs text-muted-foreground">{getSenderName(msg.senderId)}</p>
                <p className="text-sm text-foreground line-clamp-1">{msg.content}</p>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-muted-foreground text-sm">
              No messages found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
