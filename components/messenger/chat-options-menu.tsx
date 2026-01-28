"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types"
import {
  Search,
  BellOff,
  Bell,
  Trash2,
  LogOut,
  Pin,
  PinOff,
  Users,
  Info,
  Volume2,
  VolumeX,
} from "lucide-react"

interface ChatOptionsMenuProps {
  chat: Chat
  isOpen: boolean
  onClose: () => void
  onMute?: () => void
  onPin?: () => void
  onClearHistory?: () => void
  onLeaveGroup?: () => void
  onDeleteChat?: () => void
  onViewInfo?: () => void
  onSearchMessages?: () => void
  className?: string
}

export function ChatOptionsMenu({
  chat,
  isOpen,
  onClose,
  onMute,
  onPin,
  onClearHistory,
  onLeaveGroup,
  onDeleteChat,
  onViewInfo,
  onSearchMessages,
  className,
}: ChatOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const menuItems = [
    {
      icon: Info,
      label: "View Info",
      onClick: onViewInfo,
      show: true,
    },
    {
      icon: Search,
      label: "Search Messages",
      onClick: onSearchMessages,
      show: true,
    },
    {
      icon: chat.pinned ? PinOff : Pin,
      label: chat.pinned ? "Unpin Chat" : "Pin Chat",
      onClick: onPin,
      show: true,
    },
    {
      icon: chat.muted ? Bell : BellOff,
      label: chat.muted ? "Unmute" : "Mute",
      onClick: onMute,
      show: true,
    },
    {
      icon: Trash2,
      label: "Clear History",
      onClick: onClearHistory,
      show: true,
      danger: false,
    },
    {
      icon: LogOut,
      label: "Leave Group",
      onClick: onLeaveGroup,
      show: chat.type === "group",
      danger: true,
    },
    {
      icon: Trash2,
      label: "Delete Chat",
      onClick: onDeleteChat,
      show: chat.type === "private",
      danger: true,
    },
  ]

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute right-2 top-full mt-1 w-56 bg-popover border border-border rounded-xl shadow-lg py-1 z-50",
        "animate-in fade-in slide-in-from-top-2 duration-150",
        className
      )}
    >
      {menuItems
        .filter((item) => item.show)
        .map((item, index) => (
          <button
            key={item.label}
            onClick={() => {
              item.onClick?.()
              onClose()
            }}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors",
              item.danger
                ? "text-destructive hover:bg-destructive/10"
                : "text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
    </div>
  )
}
