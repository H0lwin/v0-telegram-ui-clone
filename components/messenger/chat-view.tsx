"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { Chat, Message } from "@/lib/types"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageComposer } from "./message-composer"
import { ChatInfo } from "./chat-info"

interface ChatViewProps {
  chat: Chat
  messages: Message[]
  currentUserId: string
  onBack?: () => void
  onSendMessage: (content: string, replyTo?: { messageId: string; content: string; senderName: string }) => void
  onReact?: (messageId: string, reaction: string) => void
  onDeleteMessage?: (messageId: string) => void
  className?: string
}

export function ChatView({
  chat,
  messages,
  currentUserId,
  onBack,
  onSendMessage,
  onReact,
  onDeleteMessage,
  className,
}: ChatViewProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const handleReply = useCallback((message: Message) => {
    const sender = chat.participants.find((p) => p.id === message.senderId)
    setReplyingTo({ 
      ...message, 
      senderName: sender?.name || (message.senderId === currentUserId ? "You" : "Unknown")
    } as Message & { senderName: string })
  }, [chat.participants, currentUserId])

  const handleSendMessage = (content: string, replyTo?: { messageId: string; content: string; senderName: string }) => {
    onSendMessage(content, replyTo)
    setReplyingTo(null)
  }

  return (
    <div className={cn("flex h-full", className)}>
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          chat={chat}
          onBack={onBack}
          onInfoClick={() => setShowInfo(!showInfo)}
        />
        
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            chat={chat}
            onReply={handleReply}
            onReact={onReact}
            onDelete={onDeleteMessage}
          />
          
          <MessageComposer
            onSend={handleSendMessage}
            placeholder={`Message ${chat.name}`}
            replyingTo={replyingTo ? { 
              ...replyingTo, 
              senderName: chat.participants.find((p) => p.id === replyingTo.senderId)?.name || 
                (replyingTo.senderId === currentUserId ? "You" : "Unknown")
            } : undefined}
            onCancelReply={() => setReplyingTo(null)}
          />
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <ChatInfo
          chat={chat}
          onClose={() => setShowInfo(false)}
          className="hidden lg:flex w-80 border-l border-border"
        />
      )}
    </div>
  )
}
