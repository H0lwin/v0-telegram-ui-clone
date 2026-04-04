"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
  className?: string
}

const emojiCategories = {
  "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐"],
  "Gestures": ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵", "🦶"],
  "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️"],
  "Objects": ["💬", "🗨️", "🗯️", "💭", "📱", "💻", "🖥️", "📷", "📹", "🎬", "📞", "☎️", "📺", "📻", "🎙️", "🎚️", "🎛️", "⏰", "⌚", "📅", "📆", "🗓️", "📧", "📨", "📩", "📤", "📥"],
  "Symbols": ["✅", "❌", "❗", "❓", "💯", "🔥", "⭐", "🌟", "✨", "💫", "🎉", "🎊", "🏆", "🥇", "🥈", "🥉", "🏅", "🎯", "💡", "🔔", "🔕", "📣", "📢", "🔒", "🔓"]
}

const recentEmojis = ["😀", "👍", "❤️", "🔥", "✅", "😂", "🎉", "💯"]

export function EmojiPicker({ onSelect, onClose, className }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("Smileys")
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

  return (
    <div 
      ref={ref}
      className={cn(
        "bg-card rounded-xl shadow-xl border border-border overflow-hidden w-72",
        className
      )}
    >
      {/* Recent */}
      <div className="p-2 border-b border-border">
        <p className="text-xs text-muted-foreground mb-1.5 px-1">Recent</p>
        <div className="flex flex-wrap gap-1">
          {recentEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="p-1.5 text-xl hover:bg-accent rounded-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-thin">
        {Object.keys(emojiCategories).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors",
              activeCategory === category 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-2 h-48 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-8 gap-1">
          {emojiCategories[activeCategory as keyof typeof emojiCategories].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="p-1.5 text-xl hover:bg-accent rounded-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
