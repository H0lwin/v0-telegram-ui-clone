"use client"

import { useEffect, useMemo, useState } from "react"
import type { Chat } from "@/lib/types"
import { Avatar } from "./avatar"
import { cn } from "@/lib/utils"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  ArrowLeft,
} from "lucide-react"

interface CallScreenProps {
  isOpen: boolean
  type: "audio" | "video"
  chat?: Chat
  onClose: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function CallScreen({ isOpen, type, chat, onClose }: CallScreenProps) {
  const [connected, setConnected] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [micMuted, setMicMuted] = useState(false)
  const [cameraOn, setCameraOn] = useState(type === "video")
  const [speakerOn, setSpeakerOn] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setConnected(false)
    setElapsed(0)
    setCameraOn(type === "video")
    const connectTimer = window.setTimeout(() => setConnected(true), 1500)
    return () => window.clearTimeout(connectTimer)
  }, [isOpen, type, chat?.id])

  useEffect(() => {
    if (!isOpen || !connected) return
    const timer = window.setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isOpen, connected])

  const subtitle = useMemo(() => {
    if (!chat) return "Connecting..."
    if (!connected) return type === "video" ? "Video calling..." : "Calling..."
    return formatDuration(elapsed)
  }, [chat, connected, elapsed, type])

  if (!isOpen || !chat) return null

  return (
    <div className="fixed inset-0 z-[80] bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-2 text-sm text-foreground backdrop-blur hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          {type === "video" ? (
            <div className="mb-6 h-[48vh] w-full max-w-3xl rounded-3xl border border-border bg-card/70 p-4 backdrop-blur">
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30">
                <div className="absolute inset-0 grid place-items-center">
                  <Avatar name={chat.name} size="xl" />
                </div>
                <div className="absolute bottom-4 right-4 h-28 w-20 rounded-xl border border-border bg-card/90 p-2 shadow-md">
                  <div className="h-full w-full rounded-lg bg-muted/70" />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <Avatar name={chat.name} size="xl" />
            </div>
          )}

          <h2 className="text-2xl font-semibold text-foreground">{chat.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="relative z-10 px-4 pb-8">
          <div className="mx-auto flex max-w-lg items-center justify-center gap-3 rounded-3xl border border-border bg-card/80 p-4 backdrop-blur">
            <button
              onClick={() => setMicMuted((prev) => !prev)}
              className={cn(
                "rounded-full p-3 transition-colors",
                micMuted ? "bg-destructive/15 text-destructive" : "bg-accent text-foreground hover:bg-accent/80"
              )}
            >
              {micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setSpeakerOn((prev) => !prev)}
              className={cn(
                "rounded-full p-3 transition-colors",
                !speakerOn ? "bg-destructive/15 text-destructive" : "bg-accent text-foreground hover:bg-accent/80"
              )}
            >
              {speakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            {type === "video" && (
              <button
                onClick={() => setCameraOn((prev) => !prev)}
                className={cn(
                  "rounded-full p-3 transition-colors",
                  !cameraOn ? "bg-destructive/15 text-destructive" : "bg-accent text-foreground hover:bg-accent/80"
                )}
              >
                {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-full bg-destructive p-3 text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

