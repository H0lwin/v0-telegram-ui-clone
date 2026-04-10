"use client"

import { Music2, Pause, Play, SkipBack, SkipForward, ListMusic } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ActiveAudioTrack {
  id: string
  chatId: string
  messageId: string
  title: string
  artist?: string
}

interface AudioPlayerStripProps {
  track?: ActiveAudioTrack
  isPlaying: boolean
  progress: number
  duration: number
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onOpenQueue: () => void
  onOpenDetails?: () => void
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

export function AudioPlayerStrip({
  track,
  isPlaying,
  progress,
  duration,
  onTogglePlay,
  onPrev,
  onNext,
  onOpenQueue,
  onOpenDetails,
}: AudioPlayerStripProps) {
  if (!track) return null

  const progressPercent = duration > 0 ? Math.min((progress / duration) * 100, 100) : 0

  return (
    <div className="mx-2 mb-2 rounded-2xl border border-border bg-background/90 p-2 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <button
          onClick={onOpenDetails}
          className="min-w-0 flex-1 text-left rounded-lg px-1 py-0.5 hover:bg-accent/50"
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Music2 className="h-3.5 w-3.5" />
            <span className="truncate">
              {track.artist ? `${track.artist} • ${track.title}` : track.title}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </button>

        <button
          onClick={onPrev}
          className="rounded-full p-2 text-muted-foreground hover:bg-accent"
          aria-label="Previous"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          className="rounded-full p-2 text-muted-foreground hover:bg-accent"
          aria-label="Next"
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <button
          onClick={onOpenQueue}
          className={cn("rounded-full p-2 text-muted-foreground hover:bg-accent")}
          aria-label="Queue"
        >
          <ListMusic className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
