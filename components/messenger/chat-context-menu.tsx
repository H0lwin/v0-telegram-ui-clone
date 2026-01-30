"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Maximize2,
  Archive,
  Pin,
  Bell,
  CheckCheck,
  UserX,
  Trash2,
  ChevronRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Chat } from "@/lib/types"

interface ChatContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  chat: Chat
  hasUnread: boolean
  onClose: () => void
  onOpenInNewWindow?: () => void
  onArchive?: () => void
  onPin?: () => void
  onMute?: (duration: string) => void
  onMarkAsRead?: () => void
  onBlockUser?: () => void
  onClearHistory?: () => void
  onDelete?: () => void
}

const muteDurations = [
  { label: "For 1 hour", value: "1h" },
  { label: "For 4 hours", value: "4h" },
  { label: "For 8 hours", value: "8h" },
  { label: "For 1 day", value: "1d" },
  { label: "For 1 month", value: "1m" },
  { label: "For always", value: "always" },
]

export function ChatContextMenu({
  isOpen,
  position,
  chat,
  hasUnread,
  onClose,
  onOpenInNewWindow,
  onArchive,
  onPin,
  onMute,
  onMarkAsRead,
  onBlockUser,
  onClearHistory,
  onDelete,
}: ChatContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [muteMenuOpen, setMuteMenuOpen] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
        setMuteMenuOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleAction = (action: string, value?: string) => {
    switch (action) {
      case "openInNewWindow":
        onOpenInNewWindow?.()
        break
      case "archive":
        onArchive?.()
        break
      case "pin":
        onPin?.()
        break
      case "mute":
        if (value) onMute?.(value)
        break
      case "markAsRead":
        onMarkAsRead?.()
        break
      case "blockUser":
        onBlockUser?.()
        break
      case "clearHistory":
        onClearHistory?.()
        break
      case "delete":
        onDelete?.()
        break
    }
    onClose()
    setMuteMenuOpen(false)
  }

  // Calculate position to keep menu in viewport
  const adjustedX = Math.min(position.x, window.innerWidth - 220)
  const adjustedY = Math.min(position.y, window.innerHeight - 400)

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[200px]"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
    >
      <div className="py-1">
        {onOpenInNewWindow && (
          <button
            onClick={() => handleAction("openInNewWindow")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
            <span>Open in New Window</span>
          </button>
        )}

        {onArchive && (
          <button
            onClick={() => handleAction("archive")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <Archive className="h-4 w-4 text-muted-foreground" />
            <span>Archive</span>
          </button>
        )}

        {onPin && (
          <button
            onClick={() => handleAction("pin")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <Pin className="h-4 w-4 text-muted-foreground" />
            <span>Pin</span>
          </button>
        )}

        {onMute && (
          <div className="relative group">
            <button
              onClick={() => setMuteMenuOpen(!muteMenuOpen)}
              onMouseEnter={() => setMuteMenuOpen(true)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Mute Notifications</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            {muteMenuOpen && (
              <div 
                className="absolute left-full top-0 ml-1 bg-card border border-border rounded-xl shadow-xl min-w-[180px] z-50"
                onMouseLeave={() => setMuteMenuOpen(false)}
              >
                {muteDurations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => handleAction("mute", duration.value)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                  >
                    <span>{duration.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {hasUnread && onMarkAsRead && (
          <button
            onClick={() => handleAction("markAsRead")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
            <span>Mark as Read</span>
          </button>
        )}

        {chat.type === "private" && onBlockUser && (
          <button
            onClick={() => handleAction("blockUser")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <UserX className="h-4 w-4 text-muted-foreground" />
            <span>Block User</span>
          </button>
        )}

        {onClearHistory && (
          <button
            onClick={() => handleAction("clearHistory")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <span>Clear History</span>
          </button>
        )}

        {onDelete && (
          <>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => handleAction("delete")}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Chat</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
