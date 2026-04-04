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
  onSendMessage: (
    content: string,
    replyTo?: { messageId: string; content: string; senderName: string },
    editingMessageId?: string
  ) => void
  onReact?: (messageId: string, reaction: string) => void
  onDeleteMessage?: (messageId: string) => void
  onPinMessage?: (messageId: string) => void
  onForwardMessage?: (message: Message) => void
  onStartCall?: (chatId: string, type: "audio" | "video") => void
  onMuteChat?: (chatId: string, duration: string) => void
  onClearChatHistory?: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
  onLeaveChat?: (chatId: string) => void
  onReportChat?: (chatId: string) => void
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
  onPinMessage,
  onForwardMessage,
  onStartCall,
  onMuteChat,
  onClearChatHistory,
  onDeleteChat,
  onLeaveChat,
  onReportChat,
  className,
}: ChatViewProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [searchMode, setSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [wallpaperVariant, setWallpaperVariant] = useState(0)

  const wallpaperClasses = [
    "bg-background/80",
    "bg-gradient-to-br from-background to-accent/30",
    "bg-gradient-to-tr from-background via-background to-primary/10",
  ]

  const handleReply = useCallback(
    (message: Message) => {
      const sender = chat.participants.find((p) => p.id === message.senderId)
      setReplyingTo({
        ...message,
        senderName:
          sender?.name || (message.senderId === currentUserId ? "You" : "Unknown"),
      } as Message & { senderName: string })
    },
    [chat.participants, currentUserId]
  )

  const handleSendMessage = (
    content: string,
    replyTo?: { messageId: string; content: string; senderName: string },
    editingMessageId?: string
  ) => {
    onSendMessage(content, replyTo, editingMessageId)
    setReplyingTo(null)
    setEditingMessage(null)
  }

  const handleEdit = (message: Message) => {
    setEditingMessage(message)
    setReplyingTo(null)
  }

  const handleSelect = (messageId: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) newSet.delete(messageId)
      else newSet.add(messageId)
      return newSet
    })
  }

  const handlePin = (messageId: string) => onPinMessage?.(messageId)

  const handleForward = (message: Message) => onForwardMessage?.(message)

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : messages

  return (
    <div className={cn("flex h-full", className)} style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          chat={chat}
          onBack={onBack}
          onInfoClick={() => setShowInfo(!showInfo)}
          onSearch={() => {
            setSearchMode((prev) => !prev)
            setSearchQuery("")
          }}
          onStartCall={(type) => onStartCall?.(chat.id, type)}
          onMute={(duration) => onMuteChat?.(chat.id, duration)}
          onSetWallpaper={() => setWallpaperVariant((prev) => (prev + 1) % wallpaperClasses.length)}
          onExportHistory={() => {
            const lines = messages.map((msg) => {
              const sender =
                chat.participants.find((p) => p.id === msg.senderId)?.name ||
                (msg.senderId === currentUserId ? "You" : "Unknown")
              return `[${msg.timestamp.toLocaleString()}] ${sender}: ${msg.content}`
            })
            const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${chat.name.replace(/\s+/g, "-").toLowerCase()}-history.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }}
          onClearHistory={() => onClearChatHistory?.(chat.id)}
          onDeleteChat={() => onDeleteChat?.(chat.id)}
          onBoost={() => onSendMessage("🚀 Chat boosted")}
          onSelectMessages={() => {
            setSelectionMode(true)
            setSelectedMessages(new Set())
          }}
          onReport={() => onReportChat?.(chat.id)}
          onLeave={() => onLeaveChat?.(chat.id)}
        />

        <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", wallpaperClasses[wallpaperVariant])}>
          {searchMode && (
            <div className="px-3 py-2 border-b border-border bg-card/70">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in messages..."
                className="w-full rounded-lg bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          <MessageList
            messages={filteredMessages}
            currentUserId={currentUserId}
            chat={chat}
            onReply={handleReply}
            onEdit={handleEdit}
            onReact={onReact}
            onDelete={onDeleteMessage}
            onPin={handlePin}
            onForward={handleForward}
            onSelect={selectionMode ? handleSelect : undefined}
            selectedMessages={selectedMessages}
            className="flex-1 overflow-y-auto scrollbar-thin"
          />

          <MessageComposer
            onSend={handleSendMessage}
            onRecordVoice={() => onSendMessage("🎤 Voice message")}
            placeholder={`Message ${chat.name}`}
            replyingTo={
              replyingTo
                ? {
                    ...replyingTo,
                    senderName:
                      chat.participants.find((p) => p.id === replyingTo.senderId)
                        ?.name || (replyingTo.senderId === currentUserId ? "You" : "Unknown"),
                  }
                : undefined
            }
            editingMessage={editingMessage || undefined}
            onCancelReply={() => setReplyingTo(null)}
            onCancelEdit={() => setEditingMessage(null)}
          />
        </div>
      </div>

      {showInfo && (
        <ChatInfo
          chat={chat}
          onClose={() => setShowInfo(false)}
          onToggleMute={() => onMuteChat?.(chat.id, chat.muted ? "off" : "always")}
          onShowMedia={(tab) => {
            setSearchMode(true)
            setSearchQuery(tab === "links" ? "http" : tab)
          }}
          onLeaveOrDelete={() => {
            if (chat.type === "group" || chat.type === "channel") {
              onLeaveChat?.(chat.id)
              return
            }
            onDeleteChat?.(chat.id)
          }}
          className="hidden lg:flex w-80 border-l border-border"
        />
      )}

      {showInfo && (
        <div className="fixed inset-0 z-50 lg:hidden bg-background/95 animate-in fade-in duration-150">
          <ChatInfo
            chat={chat}
            onClose={() => setShowInfo(false)}
            onToggleMute={() => onMuteChat?.(chat.id, chat.muted ? "off" : "always")}
            onShowMedia={(tab) => {
              setSearchMode(true)
              setSearchQuery(tab === "links" ? "http" : tab)
              setShowInfo(false)
            }}
            onLeaveOrDelete={() => {
              if (chat.type === "group" || chat.type === "channel") {
                onLeaveChat?.(chat.id)
                return
              }
              onDeleteChat?.(chat.id)
            }}
            className="w-full h-full border-l-0 animate-in slide-in-from-right duration-200"
          />
        </div>
      )}
    </div>
  )
}
