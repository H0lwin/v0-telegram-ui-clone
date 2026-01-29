"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Message, User } from "@/lib/types"
import { Check, CheckCheck, CornerUpLeft } from "lucide-react"
import { Avatar } from "./avatar"
import { MessageContextMenu } from "./message-context-menu"
import { ReactionPicker } from "./reaction-picker"

interface MessageBubbleProps {
  message: Message
  isOutgoing: boolean
  showAvatar?: boolean
  sender?: User
  isGroupChat?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
  onReply?: (message: Message) => void
  onReact?: (messageId: string, reaction: string) => void
  onDelete?: (messageId: string) => void
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function MessageStatus({ status }: { status: string }) {
  if (status === "read") {
    return <CheckCheck className="h-3.5 w-3.5 text-primary" />
  }
  if (status === "delivered") {
    return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/70" />
  }
  if (status === "sent") {
    return <Check className="h-3.5 w-3.5 text-muted-foreground/70" />
  }
  if (status === "sending") {
    return (
      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/50 border-t-transparent animate-spin" />
    )
  }
  return null
}

export function MessageBubble({
  message,
  isOutgoing,
  showAvatar,
  sender,
  isGroupChat,
  isFirstInGroup,
  isLastInGroup,
  onReply,
  onReact,
  onDelete,
}: MessageBubbleProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showReactions, setShowReactions] = useState(false)
  const [reactionPosition, setReactionPosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Quick react on double-click
    if (onReact) {
      onReact(message.id, "❤️")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message)
    }
  }

  const handleShowReactions = () => {
    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect()
      setReactionPosition({ x: rect.left + rect.width / 2, y: rect.top })
      setShowReactions(true)
    }
  }

  return (
    <>
      <div
        className={cn(
          "flex gap-2 px-3 group animate-message-in",
          isOutgoing ? "justify-end" : "justify-start",
          isFirstInGroup ? "mt-2" : "mt-0.5"
        )}
      >
        {!isOutgoing && isGroupChat && (
          <div className="w-8 flex-shrink-0">
            {showAvatar && sender && (
              <Avatar name={sender.name} size="sm" />
            )}
          </div>
        )}
        
        <div
          ref={bubbleRef}
          className={cn(
            "max-w-[70%] min-w-[80px] relative",
            isOutgoing ? "items-end" : "items-start"
          )}
          onContextMenu={handleContextMenu}
          onDoubleClick={handleDoubleClick}
        >
          {/* Reply preview */}
          {message.replyTo && (
            <div className={cn(
              "flex items-center gap-1.5 mb-1 px-3 py-1.5 rounded-lg text-xs",
              isOutgoing ? "bg-foreground/10" : "bg-primary/10"
            )}>
              <CornerUpLeft className="h-3 w-3 text-primary" />
              <span className="text-primary font-medium truncate">
                {message.replyTo.senderName}
              </span>
              <span className="text-muted-foreground truncate">
                {message.replyTo.content}
              </span>
            </div>
          )}

          {/* Sender name for group chats */}
          {!isOutgoing && isGroupChat && isFirstInGroup && sender && (
            <div className="text-xs font-medium text-primary mb-1 px-3">
              {sender.name}
            </div>
          )}
          
          <div
            className={cn(
              "relative px-3 py-2 cursor-pointer select-none",
              isOutgoing 
                ? "bg-bubble-outgoing text-foreground" 
                : "bg-bubble-incoming text-foreground shadow-sm",
              // Bubble tail styling
              isLastInGroup && isOutgoing && "rounded-2xl rounded-br-md",
              isLastInGroup && !isOutgoing && "rounded-2xl rounded-bl-md",
              !isLastInGroup && "rounded-2xl"
            )}
          >
            {/* Message content */}
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
            
            {/* Time and status */}
            <div className={cn(
              "flex items-center justify-end gap-1 mt-1 -mb-0.5",
              isOutgoing ? "text-foreground/60" : "text-muted-foreground"
            )}>
              <span className="text-[11px]">
                {mounted && formatMessageTime(message.timestamp)}
              </span>
              {isOutgoing && <MessageStatus status={message.status} />}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={cn(
              "absolute -bottom-2 flex gap-0.5 bg-card rounded-full px-1 py-0.5 shadow-sm border border-border",
              isOutgoing ? "right-2" : "left-2"
            )}>
              {message.reactions.map((reaction, idx) => (
                <span key={idx} className="text-sm">{reaction}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          isOpen={true}
          position={contextMenu}
          isOutgoing={isOutgoing}
          onClose={() => setContextMenu(null)}
          onReply={handleReply}
          onCopy={handleCopy}
          onForward={() => {}}
          onReact={handleShowReactions}
          onDelete={isOutgoing && onDelete ? () => onDelete(message.id) : undefined}
        />
      )}

      {/* Reaction Picker */}
      {showReactions && (
        <ReactionPicker
          position={reactionPosition}
          onSelect={(reaction) => onReact?.(message.id, reaction)}
          onClose={() => setShowReactions(false)}
        />
      )}
    </>
  )
}
