"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Message, User, Chat } from "@/lib/types"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  chat: Chat
  onReply?: (message: Message) => void
  onReact?: (messageId: string, reaction: string) => void
  onDelete?: (messageId: string) => void
  className?: string
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function formatDateHeader(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, today)) {
    return "Today"
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday"
  } else {
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }
}

export function MessageList({
  messages,
  currentUserId,
  chat,
  onReply,
  onReact,
  onDelete,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const isGroupChat = chat.type === "group"
  const isTyping = chat.typing && chat.typing.length > 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const getSender = (senderId: string): User | undefined => {
    return chat.participants.find((p) => p.id === senderId)
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto py-2 chat-background scrollbar-thin",
        className
      )}
    >
      {messages.map((message, index) => {
        const isOutgoing = message.senderId === currentUserId
        const prevMessage = messages[index - 1]
        const nextMessage = messages[index + 1]
        
        // Check if we need a date header
        const showDateHeader =
          !prevMessage || !isSameDay(prevMessage.timestamp, message.timestamp)
        
        // Check if this is first/last in a group of messages from same sender
        const isFirstInGroup =
          !prevMessage ||
          prevMessage.senderId !== message.senderId ||
          showDateHeader
        const isLastInGroup =
          !nextMessage ||
          nextMessage.senderId !== message.senderId ||
          !isSameDay(nextMessage.timestamp, message.timestamp)
        
        // Show avatar for last message in group (for incoming messages in group chats)
        const showAvatar = !isOutgoing && isLastInGroup && isGroupChat

        return (
          <div key={message.id}>
            {showDateHeader && (
              <div className="flex justify-center my-4">
                <span className="px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-full text-xs text-muted-foreground shadow-sm border border-border/50">
                  {mounted && formatDateHeader(message.timestamp)}
                </span>
              </div>
            )}
            
            <MessageBubble
              message={message}
              isOutgoing={isOutgoing}
              showAvatar={showAvatar}
              sender={getSender(message.senderId)}
              isGroupChat={isGroupChat}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
              onReply={onReply}
              onReact={onReact}
              onDelete={isOutgoing ? onDelete : undefined}
            />
          </div>
        )
      })}

      {/* Typing Indicator */}
      {isTyping && (
        <TypingIndicator 
          names={chat.typing || []} 
          showAvatar={isGroupChat}
        />
      )}
    </div>
  )
}
