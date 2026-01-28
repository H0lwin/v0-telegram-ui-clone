"use client"

import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"

interface TypingIndicatorProps {
  names: string[]
  showAvatar?: boolean
  className?: string
}

export function TypingIndicator({ names, showAvatar, className }: TypingIndicatorProps) {
  if (names.length === 0) return null

  return (
    <div className={cn("flex gap-2 px-3 py-2", className)}>
      {showAvatar && <Avatar name={names[0]} size="sm" />}
      
      <div className="bg-bubble-incoming rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="typing-dot w-2 h-2 bg-muted-foreground/50 rounded-full" />
          <span className="typing-dot w-2 h-2 bg-muted-foreground/50 rounded-full" />
          <span className="typing-dot w-2 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </div>
  )
}
