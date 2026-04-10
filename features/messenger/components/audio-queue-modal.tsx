"use client"

import { X, Music2, Play, Repeat, Shuffle, ArrowDownUp, ListMusic } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveAudioTrack } from "./audio-player-strip"

interface AudioQueueModalProps {
  isOpen: boolean
  tracks: ActiveAudioTrack[]
  currentTrackId?: string
  playScope?: "all" | "single"
  repeatMode?: "off" | "one" | "all"
  shuffleEnabled?: boolean
  reverseEnabled?: boolean
  onClose: () => void
  onSelectTrack: (trackId: string) => void
  onPlayScopeChange?: (scope: "all" | "single") => void
  onCycleRepeat?: () => void
  onToggleShuffle?: () => void
  onToggleReverse?: () => void
}

export function AudioQueueModal({
  isOpen,
  tracks,
  currentTrackId,
  playScope = "all",
  repeatMode = "off",
  shuffleEnabled = false,
  reverseEnabled = false,
  onClose,
  onSelectTrack,
  onPlayScopeChange,
  onCycleRepeat,
  onToggleShuffle,
  onToggleReverse,
}: AudioQueueModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[71] max-h-[75vh] rounded-t-3xl border border-border bg-card p-4 shadow-xl lg:inset-auto lg:right-8 lg:top-24 lg:w-[380px] lg:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Track List</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-accent">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onPlayScopeChange?.("all")}
            className={cn("rounded-lg px-2 py-1.5 text-xs", playScope === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}
          >
            <ListMusic className="mr-1 inline h-3.5 w-3.5" />
            Play All
          </button>
          <button
            onClick={() => onPlayScopeChange?.("single")}
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
          <button
            onClick={onCycleRepeat}
            className="col-span-2 rounded-lg bg-muted px-2 py-1.5 text-xs text-foreground"
          >
            <Repeat className="mr-1 inline h-3.5 w-3.5" />
            Repeat: {repeatMode === "off" ? "Off" : repeatMode === "one" ? "One" : "All"}
          </button>
        </div>
        <div className="max-h-[58vh] space-y-1 overflow-y-auto pr-1 scrollbar-thin">
          {tracks.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No audio tracks in this chat yet.</div>
          )}
          {tracks.map((track) => {
            const active = track.id === currentTrackId
            return (
              <button
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                  active ? "bg-primary/15" : "hover:bg-accent"
                )}
              >
                <div className={cn("rounded-full p-2", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {active ? <Play className="h-3.5 w-3.5" /> : <Music2 className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className={cn("truncate text-sm font-medium", active ? "text-primary" : "text-foreground")}>{track.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{track.artist || "Unknown artist"}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
