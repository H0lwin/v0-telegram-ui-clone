"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { 
  Reply, 
  Copy, 
  Forward, 
  Pin, 
  Trash2,
  SmilePlus
} from "lucide-react"

interface MessageContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  isOutgoing: boolean
  onClose: () => void
  onReply: () => void
  onCopy: () => void
  onForward: () => void
  onReact: () => void
  onDelete?: () => void
}

const menuItems = [
  { icon: Reply, label: "Reply", action: "reply" },
  { icon: SmilePlus, label: "React", action: "react" },
  { icon: Copy, label: "Copy", action: "copy" },
  { icon: Forward, label: "Forward", action: "forward" },
  { icon: Pin, label: "Pin", action: "pin" },
]

export function MessageContextMenu({
  isOpen,
  position,
  isOutgoing,
  onClose,
  onReply,
  onCopy,
  onForward,
  onReact,
  onDelete,
}: MessageContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleAction = (action: string) => {
    switch (action) {
      case "reply":
        onReply()
        break
      case "copy":
        onCopy()
        break
      case "forward":
        onForward()
        break
      case "react":
        onReact()
        break
    }
    onClose()
  }

  // Calculate position to keep menu in viewport
  const adjustedX = Math.min(position.x, window.innerWidth - 200)
  const adjustedY = Math.min(position.y, window.innerHeight - 300)

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
    >
      <div className="py-1">
        {menuItems.map((item) => (
          <button
            key={item.action}
            onClick={() => handleAction(item.action)}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span>{item.label}</span>
          </button>
        ))}
        
        {isOutgoing && onDelete && (
          <>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => {
                onDelete()
                onClose()
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
