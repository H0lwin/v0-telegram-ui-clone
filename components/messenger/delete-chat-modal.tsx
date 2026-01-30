"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import type { Chat } from "@/lib/types"

interface DeleteChatModalProps {
  isOpen: boolean
  chat: Chat | null
  onClose: () => void
  onConfirm: (deleteForBoth: boolean) => void
}

function getDeleteButtonLabel(chatType: Chat["type"]): string {
  switch (chatType) {
    case "group":
      return "Leave Group"
    case "channel":
      return "Leave Channel"
    case "private":
    default:
      return "Delete Chat"
  }
}

export function DeleteChatModal({
  isOpen,
  chat,
  onClose,
  onConfirm,
}: DeleteChatModalProps) {
  const [deleteForBoth, setDeleteForBoth] = useState(false)

  if (!isOpen || !chat) return null

  const handleConfirm = () => {
    onConfirm(deleteForBoth)
    setDeleteForBoth(false)
  }

  const handleClose = () => {
    setDeleteForBoth(false)
    onClose()
  }

  const deleteButtonLabel = getDeleteButtonLabel(chat.type)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 top-[50%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Delete Chat</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="deleteForBoth"
              checked={deleteForBoth}
              onChange={(e) => setDeleteForBoth(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label
              htmlFor="deleteForBoth"
              className="text-sm text-foreground cursor-pointer"
            >
              Delete for both sides
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
          >
            {deleteButtonLabel}
          </button>
        </div>
      </div>
    </>
  )
}
