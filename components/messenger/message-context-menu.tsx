"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { 
  Reply, 
  Copy, 
  Forward, 
  Pin, 
  Trash2,
  Edit,
  Save,
  FolderOpen,
  FileText
} from "lucide-react"
import type { Message } from "@/lib/types"

interface MessageContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  message: Message
  isOutgoing: boolean
  onClose: () => void
  onReply: () => void
  onEdit?: () => void
  onCopy: () => void
  onCopyImage?: () => void
  onCopyFilename?: () => void
  onForward: () => void
  onPin?: () => void
  onSaveAs?: () => void
  onShowInFolder?: () => void
  onReact: (reaction: string) => void
  onDelete?: () => void
  onSelect?: () => void
}

const reactions = [
  "❤️", "👍", "🤷‍♂️", "👎", "👏", "🔥", "💔", "🍌", "😡", "😂"
]

function formatMessageDateTime(date: Date): string {
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function MessageContextMenu({
  isOpen,
  position,
  message,
  isOutgoing,
  onClose,
  onReply,
  onEdit,
  onCopy,
  onCopyImage,
  onCopyFilename,
  onForward,
  onPin,
  onSaveAs,
  onShowInFolder,
  onReact,
  onDelete,
  onSelect,
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

  const messageType = message.type
  const isImage = messageType === "image" || (message.attachments?.some(a => a.type === "image"))
  const isFile = messageType === "file" || (message.attachments?.some(a => a.type === "file"))

  const handleReaction = (reaction: string) => {
    onReact(reaction)
    onClose()
  }

  const handleAction = (action: string) => {
    switch (action) {
      case "reply":
        onReply()
        break
      case "edit":
        onEdit?.()
        break
      case "pin":
        onPin?.()
        break
      case "copy":
        onCopy()
        break
      case "copyImage":
        onCopyImage?.()
        break
      case "copyFilename":
        onCopyFilename?.()
        break
      case "forward":
        onForward()
        break
      case "saveAs":
        onSaveAs?.()
        break
      case "showInFolder":
        onShowInFolder?.()
        break
      case "delete":
        onDelete?.()
        break
      case "select":
        onSelect?.()
        break
    }
    onClose()
  }

  // Calculate position to keep menu in viewport
  const adjustedX = Math.min(position.x, window.innerWidth - 250)
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
        {/* Reactions */}
        <div className="px-2 py-2 border-b border-border">
          <div className="grid grid-cols-5 gap-1">
            {reactions.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className="p-2 hover:bg-accent rounded transition-colors text-lg"
                title={reaction}
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="py-1">
          <button
            onClick={() => handleAction("reply")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <Reply className="h-4 w-4 text-muted-foreground" />
            <span>Reply</span>
          </button>

          {isOutgoing && onEdit && (
            <button
              onClick={() => handleAction("edit")}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
              <span>Edit</span>
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

          {/* Image-specific actions */}
          {isImage && (
            <>
              {onSaveAs && (
                <button
                  onClick={() => handleAction("saveAs")}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <Save className="h-4 w-4 text-muted-foreground" />
                  <span>Save As…</span>
                </button>
              )}
              {onCopyImage && (
                <button
                  onClick={() => handleAction("copyImage")}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  <span>Copy Image</span>
                </button>
              )}
            </>
          )}

          {/* Text-specific actions */}
          {!isImage && !isFile && (
            <button
              onClick={() => handleAction("copy")}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
              <span>Copy Text</span>
            </button>
          )}

          {/* File-specific actions */}
          {isFile && (
            <>
              {onShowInFolder && (
                <button
                  onClick={() => handleAction("showInFolder")}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span>Show in Folder</span>
                </button>
              )}
              {onSaveAs && (
                <button
                  onClick={() => handleAction("saveAs")}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <Save className="h-4 w-4 text-muted-foreground" />
                  <span>Save As…</span>
                </button>
              )}
              {onCopyFilename && (
                <button
                  onClick={() => handleAction("copyFilename")}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Copy Filename</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={() => handleAction("forward")}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <Forward className="h-4 w-4 text-muted-foreground" />
            <span>Forward</span>
          </button>

          {onDelete && (
            <button
              onClick={() => handleAction("delete")}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          )}

          {onSelect && (
            <button
              onClick={() => handleAction("select")}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors"
            >
              <span>Select</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-1" />

        {/* Metadata */}
        <div className="px-4 py-2 text-xs text-muted-foreground">
          {formatMessageDateTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
