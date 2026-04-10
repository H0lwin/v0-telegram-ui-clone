"use client"

import { useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { Attachment } from "@/lib/types"
import { Search, Sticker, Clapperboard, X, Star } from "lucide-react"

interface StickersGifsModalProps {
  isOpen: boolean
  gifLibrary: Attachment[]
  favoriteGifIds: Set<string>
  onClose: () => void
  onSelectSticker: (emoji: string) => void
  onSelectGif: (attachment: Attachment) => void
  onToggleFavoriteGif: (attachmentId: string) => void
  onDeleteGif?: (attachmentId: string) => void
}

const stickers = ["😀", "😎", "🔥", "💯", "❤️", "🎯", "🚀", "👏", "😡", "🥳", "😂", "😭", "🙏", "😍", "🤝", "👍"]

export function StickersGifsModal({
  isOpen,
  gifLibrary,
  favoriteGifIds,
  onClose,
  onSelectSticker,
  onSelectGif,
  onToggleFavoriteGif,
  onDeleteGif,
}: StickersGifsModalProps) {
  const [tab, setTab] = useState<"stickers" | "gifs">("stickers")
  const [query, setQuery] = useState("")
  const longPressTriggeredRef = useRef<Set<string>>(new Set())

  const filteredGifs = useMemo(() => {
    const q = query.trim().toLowerCase()
    const ordered = [...gifLibrary].sort((a, b) => Number(favoriteGifIds.has(b.id)) - Number(favoriteGifIds.has(a.id)))
    if (!q) return ordered
    return ordered.filter((gif) => `${gif.name || ""}`.toLowerCase().includes(q))
  }, [favoriteGifIds, gifLibrary, query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[75] bg-black/45" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 h-[72vh] rounded-t-3xl border border-border bg-card p-3 shadow-xl lg:bottom-4 lg:left-1/2 lg:h-[640px] lg:w-[520px] lg:-translate-x-1/2 lg:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-foreground">Telegram Media Picker</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-accent">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="mb-2 flex rounded-xl bg-muted p-1">
          <button
            onClick={() => setTab("stickers")}
            className={cn("flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm", tab === "stickers" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            <Sticker className="h-4 w-4" />
            Stickers
          </button>
          <button
            onClick={() => setTab("gifs")}
            className={cn("flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm", tab === "gifs" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            <Clapperboard className="h-4 w-4" />
            GIFs
          </button>
        </div>

        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "stickers" ? "Search sticker" : "Search GIF"}
              className="w-full rounded-lg bg-input py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {tab === "stickers" ? (
          <div className="grid h-[calc(100%-130px)] grid-cols-4 gap-2 overflow-y-auto pr-1 scrollbar-thin">
            {stickers
              .filter((item) => item.includes(query.trim()) || !query.trim())
              .map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    onSelectSticker(item)
                    onClose()
                  }}
                  className="rounded-xl bg-background p-4 text-4xl hover:bg-accent"
                >
                  {item}
                </button>
              ))}
          </div>
        ) : (
          <div className="grid h-[calc(100%-130px)] grid-cols-2 gap-2 overflow-y-auto pr-1 scrollbar-thin">
            {filteredGifs.map((gif) => (
              <div key={gif.id} className="relative overflow-hidden rounded-xl border border-border bg-background">
                <button
                  onClick={() => {
                    if (longPressTriggeredRef.current.has(gif.id)) {
                      longPressTriggeredRef.current.delete(gif.id)
                      return
                    }
                    onSelectGif(gif)
                    onClose()
                  }}
                  onPointerDown={(e) => {
                    const timer = window.setTimeout(() => {
                      if (!onDeleteGif) return
                      longPressTriggeredRef.current.add(gif.id)
                      const accepted = window.confirm("Delete this GIF from your library?")
                      if (accepted) {
                        onDeleteGif(gif.id)
                      }
                    }, 900)
                    ;(e.currentTarget as any).__holdTimer = timer
                  }}
                  onPointerUp={(e) => {
                    const timer = (e.currentTarget as any).__holdTimer as number | undefined
                    if (timer) window.clearTimeout(timer)
                  }}
                  onPointerLeave={(e) => {
                    const timer = (e.currentTarget as any).__holdTimer as number | undefined
                    if (timer) window.clearTimeout(timer)
                  }}
                  className="block w-full"
                >
                  <video src={gif.url} muted loop autoPlay playsInline className="h-32 w-full object-cover" />
                </button>
                <button
                  onClick={() => onToggleFavoriteGif(gif.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white"
                >
                  <Star className={cn("h-3.5 w-3.5", favoriteGifIds.has(gif.id) && "fill-current")} />
                </button>
              </div>
            ))}
            {filteredGifs.length === 0 && <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">No GIFs yet. Upload or add one from context menu.</div>}
          </div>
        )}
      </div>
    </div>
  )
}
