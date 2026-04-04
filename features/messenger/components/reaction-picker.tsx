"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ReactionPickerProps {
  onSelect: (reaction: string) => void
  onClose: () => void
  position: { x: number; y: number }
}

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

export function ReactionPicker({ onSelect, onClose, position }: ReactionPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  // Calculate position to keep picker in viewport
  const adjustedX = Math.min(Math.max(position.x - 120, 10), window.innerWidth - 260)
  const adjustedY = Math.max(position.y - 60, 10)

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-card rounded-full shadow-xl border border-border p-1.5 flex gap-0.5 animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
    >
      {quickReactions.map((reaction) => (
        <button
          key={reaction}
          onClick={() => {
            onSelect(reaction)
            onClose()
          }}
          className="p-2 text-xl hover:bg-accent rounded-full transition-all hover:scale-125"
        >
          {reaction}
        </button>
      ))}
    </div>
  )
}
