"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  Paperclip, 
  Smile, 
  Mic, 
  Send,
  ImageIcon,
  FileText,
  Camera,
  MapPin,
  User,
  X,
  CornerUpLeft
} from "lucide-react"
import { EmojiPicker } from "./emoji-picker"
import type { Message } from "@/lib/types"

interface MessageComposerProps {
  onSend: (content: string, replyTo?: { messageId: string; content: string; senderName: string }, editingMessageId?: string) => void
  onAttachment?: (type: string) => void
  placeholder?: string
  disabled?: boolean
  replyingTo?: Message & { senderName?: string }
  editingMessage?: Message
  onCancelReply?: () => void
  onCancelEdit?: () => void
  className?: string
}

const attachmentOptions = [
  { icon: ImageIcon, label: "Photo or Video", type: "media", color: "bg-blue-500" },
  { icon: FileText, label: "File", type: "file", color: "bg-purple-500" },
  { icon: Camera, label: "Camera", type: "camera", color: "bg-red-500" },
  { icon: MapPin, label: "Location", type: "location", color: "bg-green-500" },
  { icon: User, label: "Contact", type: "contact", color: "bg-orange-500" },
]

export function MessageComposer({
  onSend,
  onAttachment,
  placeholder = "Message",
  disabled,
  replyingTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  className,
}: MessageComposerProps) {
  const [message, setMessage] = useState(editingMessage?.content || "")
  const [showAttachments, setShowAttachments] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const attachmentRef = useRef<HTMLDivElement>(null)

  // Update message when editingMessage changes
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content)
      textareaRef.current?.focus()
    }
  }, [editingMessage])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [message])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachmentRef.current && !attachmentRef.current.contains(event.target as Node)) {
        setShowAttachments(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus input when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyingTo])

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(
        message.trim(), 
        replyingTo 
          ? { 
              messageId: replyingTo.id, 
              content: replyingTo.content.slice(0, 50), 
              senderName: replyingTo.senderName || "Unknown" 
            } 
          : undefined,
        editingMessage?.id
      )
      setMessage("")
      onCancelReply?.()
      onCancelEdit?.()
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape") {
      if (replyingTo) {
        onCancelReply?.()
      }
      if (editingMessage) {
        onCancelEdit?.()
        setMessage("")
      }
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  return (
    <div className={cn("border-t border-border bg-card relative", className)}>
      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b border-border">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">
              {replyingTo.senderName || "Message"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1.5 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b border-border">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">
              Edit message
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {editingMessage.content}
            </p>
          </div>
          <button
            onClick={() => {
              onCancelEdit?.()
              setMessage("")
            }}
            className="p-1.5 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachments && (
        <div 
          ref={attachmentRef}
          className="absolute bottom-full left-0 right-0 bg-card border-t border-border p-3 animate-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-around max-w-md mx-auto py-2">
            {attachmentOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  onAttachment?.(option.type)
                  setShowAttachments(false)
                }}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <div className={cn("p-3 rounded-full text-white", option.color)}>
                  <option.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-muted-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-2 mb-2 z-10">
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      <div className="flex items-end gap-1 p-2">
        {/* Emoji Button */}
        <button
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker)
            setShowAttachments(false)
          }}
          className={cn(
            "p-2.5 rounded-full hover:bg-accent transition-colors flex-shrink-0",
            showEmojiPicker && "bg-accent"
          )}
          aria-label="Emoji"
        >
          <Smile className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Attachment Button */}
        <button
          onClick={() => {
            setShowAttachments(!showAttachments)
            setShowEmojiPicker(false)
          }}
          className={cn(
            "p-2.5 rounded-full hover:bg-accent transition-colors flex-shrink-0",
            showAttachments && "bg-accent"
          )}
          aria-label="Attach file"
        >
          {showAttachments ? (
            <X className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2.5 bg-input rounded-2xl text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        {/* Send/Voice Button */}
        {message.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex-shrink-0 disabled:opacity-50 active:scale-95"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            className="p-2.5 rounded-full hover:bg-accent transition-colors flex-shrink-0"
            aria-label="Voice message"
          >
            <Mic className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}
