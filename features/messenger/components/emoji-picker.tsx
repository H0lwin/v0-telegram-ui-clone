"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
  className?: string
}

const emojiCategories = {
  Recent: ["😂", "❤️", "🔥", "👍", "😭", "🙏", "😍", "🥲", "😁", "👀"],
  Smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🙂", "😊", "😇", "😉", "😍", "🥰", "😘", "😎", "🤓", "🤩", "🥳", "😴", "🤔", "😶", "🙄", "😬", "😢", "😭", "😤", "😡", "🤯", "🥲"],
  People: ["👍", "👎", "👏", "🙌", "🙏", "🤝", "👌", "✌️", "🤟", "🤘", "👋", "🤚", "🖐️", "✋", "🫶", "💪", "🫡", "👀", "🧠", "🫀", "🫂", "🧑‍💻", "👨‍💻", "👩‍💻"],
  Nature: ["🐶", "🐱", "🦊", "🐻", "🐼", "🐨", "🦁", "🐯", "🐸", "🐵", "🐤", "🦉", "🦋", "🐢", "🌱", "🌳", "🌸", "🌹", "🌻", "🌍", "🌙", "⭐", "☀️", "🌧️"],
  Food: ["🍎", "🍊", "🍉", "🍇", "🍓", "🍒", "🍍", "🥑", "🍔", "🍕", "🌭", "🍟", "🥪", "🍣", "🍜", "🍩", "🍪", "🍫", "🍿", "☕", "🍵", "🧃", "🥤"],
  Activity: ["⚽", "🏀", "🏐", "🎾", "🏓", "🏸", "🥊", "🎯", "🎮", "🕹️", "🎲", "🧩", "🎸", "🎹", "🎧", "🎤", "🎬", "📷", "🚀", "🏆"],
  Travel: ["🚗", "🚕", "🚌", "🚎", "🚓", "🚑", "🚒", "🚚", "🚲", "🏍️", "✈️", "🚁", "🚢", "⛵", "🚆", "🚇", "🗺️", "🏖️", "🏔️", "🏙️"],
  Symbols: ["❤️", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💯", "✅", "❌", "⚠️", "❗", "❓", "🔔", "🔕", "📌", "📎", "🔒", "🔓"],
}

export function EmojiPicker({ onSelect, onClose, className }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof emojiCategories>("Smileys")
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const emojis = useMemo(() => {
    if (!query.trim()) return emojiCategories[activeCategory]
    const all = Object.values(emojiCategories).flat()
    return all.filter((emoji) => emoji.includes(query.trim()))
  }, [activeCategory, query])

  return (
    <div ref={ref} className={cn("w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl", className)}>
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emoji"
            className="w-full rounded-lg bg-input py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-border scrollbar-thin">
        {Object.keys(emojiCategories).map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category as keyof typeof emojiCategories)
              setQuery("")
            }}
            className={cn(
              "shrink-0 px-3 py-2 text-xs font-medium transition-colors",
              activeCategory === category ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="h-56 overflow-y-auto p-2 scrollbar-thin">
        <div className="grid grid-cols-8 gap-1">
          {emojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              onClick={() => onSelect(emoji)}
              className="rounded-lg p-1.5 text-2xl hover:bg-accent"
            >
              {emoji}
            </button>
          ))}
        </div>
        {emojis.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No emoji found.</p>}
      </div>
    </div>
  )
}

