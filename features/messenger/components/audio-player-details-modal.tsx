"use client"

import { X, Repeat, Shuffle, ArrowDownUp, Gauge, ListMusic } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveAudioTrack } from "./audio-player-strip"

interface AudioPlayerDetailsModalProps {
  isOpen: boolean
  track?: ActiveAudioTrack
  progress: number
  duration: number
  speed: number
  playScope: "all" | "single"
  repeatMode: "off" | "one" | "all"
  shuffleEnabled: boolean
  reverseEnabled: boolean
  onClose: () => void
  onSeek: (seconds: number) => void
  onSpeedChange: (speed: number) => void
  onPlayScopeChange: (scope: "all" | "single") => void
  onCycleRepeat: () => void
  onToggleShuffle: () => void
  onToggleReverse: () => void
  onOpenQueue: () => void
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

export function AudioPlayerDetailsModal({
  isOpen,
  track,
  progress,
  duration,
  speed,
  playScope,
  repeatMode,
  shuffleEnabled,
  reverseEnabled,
  onClose,
  onSeek,
  onSpeedChange,
  onPlayScopeChange,
  onCycleRepeat,
  onToggleShuffle,
  onToggleReverse,
  onOpenQueue,
}: AudioPlayerDetailsModalProps) {
  if (!isOpen || !track) return null

  return (
    <>
      <div className="fixed inset-0 z-[72] bg-black/45" onClick={onClose} />
      <div className="fixed inset-x-3 bottom-3 z-[73] rounded-2xl border border-border bg-card p-4 shadow-xl lg:inset-auto lg:right-8 lg:top-20 lg:w-[420px]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{track.title}</p>
            <p className="text-xs text-muted-foreground">{track.artist || "Unknown artist"}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-accent">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={Math.max(duration, 0)}
            value={Math.min(progress, Math.max(duration, 0))}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPlayScopeChange("all")}
            className={cn("rounded-lg px-2 py-1.5 text-xs", playScope === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}
          >
            <ListMusic className="mr-1 inline h-3.5 w-3.5" />
            Play All
          </button>
          <button
            onClick={() => onPlayScopeChange("single")}
            className={cn("rounded-lg px-2 py-1.5 text-xs", playScope === "single" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}
          >
            Single Only
          </button>
          <button
            onClick={onToggleShuffle}
            className={cn("rounded-lg px-2 py-1.5 text-xs", shuffleEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}
          >
            <Shuffle className="mr-1 inline h-3.5 w-3.5" />
            Shuffle
          </button>
          <button
            onClick={onToggleReverse}
            className={cn("rounded-lg px-2 py-1.5 text-xs", reverseEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}
          >
            <ArrowDownUp className="mr-1 inline h-3.5 w-3.5" />
            Reverse
          </button>
          <button onClick={onCycleRepeat} className="rounded-lg bg-muted px-2 py-1.5 text-xs text-foreground">
            <Repeat className="mr-1 inline h-3.5 w-3.5" />
            Repeat: {repeatMode === "off" ? "Off" : repeatMode === "one" ? "One" : "All"}
          </button>
          <div className="rounded-lg bg-muted px-2 py-1.5 text-xs text-foreground">
            <Gauge className="mr-1 inline h-3.5 w-3.5" />
            Speed
            <select
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="ml-2 rounded bg-background px-1 py-0.5 text-xs"
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>

        <button onClick={onOpenQueue} className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          Open Track List
        </button>
      </div>
    </>
  )
}

