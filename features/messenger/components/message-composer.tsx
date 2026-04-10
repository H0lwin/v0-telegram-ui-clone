"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Paperclip,
  Smile,
  Mic,
  Send,
  ImageIcon,
  FileText,
  Camera,
  MapPin,
  User,
  Music2,
  X,
  UploadCloud,
  Sticker,
  Pause,
  Play,
  Trash2,
  Check,
} from "lucide-react"
import type { Attachment, Message } from "@/lib/types"
import { StickersGifsModal } from "./stickers-gifs-modal"
import { EmojiPicker } from "./emoji-picker"

interface MessageComposerProps {
  onSend: (content: string, replyTo?: { messageId: string; content: string; senderName: string }, editingMessageId?: string) => void
  onUploadFiles?: (files: File[], sourceType?: string) => void
  onSendSticker?: (emoji: string) => void
  gifLibrary?: Attachment[]
  favoriteGifIds?: Set<string>
  onSendGifFromLibrary?: (attachment: Attachment) => void
  onToggleFavoriteGif?: (attachmentId: string) => void
  onDeleteGif?: (attachmentId: string) => void
  onRecordVoice?: () => void
  placeholder?: string
  disabled?: boolean
  replyingTo?: Message & { senderName?: string }
  editingMessage?: Message
  onCancelReply?: () => void
  onCancelEdit?: () => void
  className?: string
}

const attachmentOptions = [
  { icon: ImageIcon, label: "Photo or Video", type: "media", color: "bg-blue-500" },
  { icon: Music2, label: "Music", type: "music", color: "bg-indigo-500" },
  { icon: FileText, label: "File", type: "file", color: "bg-purple-500" },
  { icon: Camera, label: "Camera", type: "camera", color: "bg-red-500" },
  { icon: MapPin, label: "Location", type: "location", color: "bg-green-500" },
  { icon: User, label: "Contact", type: "contact", color: "bg-orange-500" },
]

function formatVoiceTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function MessageComposer({
  onSend,
  onUploadFiles,
  onSendSticker,
  gifLibrary = [],
  favoriteGifIds = new Set<string>(),
  onSendGifFromLibrary,
  onToggleFavoriteGif,
  onDeleteGif,
  onRecordVoice,
  placeholder = "Message",
  disabled,
  replyingTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  className,
}: MessageComposerProps) {
  const [message, setMessage] = useState(editingMessage?.content || "")
  const [showAttachments, setShowAttachments] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isRecordingPaused, setIsRecordingPaused] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const attachmentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [filePickerConfig, setFilePickerConfig] = useState<{
    accept: string
    multiple: boolean
    capture?: "user" | "environment"
  }>({
    accept: "*/*",
    multiple: true,
  })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const recordingTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content)
      textareaRef.current?.focus()
    }
  }, [editingMessage])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [message])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentRef.current && !attachmentRef.current.contains(event.target as Node)) {
        setShowAttachments(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (replyingTo && textareaRef.current) textareaRef.current.focus()
  }, [replyingTo])

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current)
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
  }

  const startRecordingTimer = () => {
    stopRecordingTimer()
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1)
    }, 1000)
  }

  const cleanupRecording = () => {
    stopRecordingTimer()
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    recordingStreamRef.current = null
    mediaRecorderRef.current = null
    recordingChunksRef.current = []
    setRecordingSeconds(0)
    setIsRecording(false)
    setIsRecordingPaused(false)
  }

  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      onRecordVoice?.()
      return
    }

    try {
      setRecordingError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recordingStreamRef.current = stream
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm"
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      recordingChunksRef.current = []
      setRecordingSeconds(0)
      setIsRecording(true)
      setIsRecordingPaused(false)
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      }
      recorder.start(250)
      startRecordingTimer()
    } catch {
      setRecordingError("Microphone access denied or unavailable.")
      cleanupRecording()
    }
  }

  const toggleRecordingPause = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (recorder.state === "recording") {
      recorder.pause()
      setIsRecordingPaused(true)
      stopRecordingTimer()
      return
    }
    if (recorder.state === "paused") {
      recorder.resume()
      setIsRecordingPaused(false)
      startRecordingTimer()
    }
  }

  const finishRecording = async (sendVoice: boolean) => {
    const recorder = mediaRecorderRef.current
    if (!recorder) {
      cleanupRecording()
      return
    }
    stopRecordingTimer()
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
      if (recorder.state !== "inactive") recorder.stop()
      else resolve()
    })

    const chunks = [...recordingChunksRef.current]
    const durationSeconds = recordingSeconds
    cleanupRecording()
    if (!sendVoice || chunks.length === 0) return
    const blob = new Blob(chunks, { type: "audio/webm" })
    const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" })
    ;(file as any).__voiceDuration = durationSeconds
    onUploadFiles?.([file], "voice")
  }

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(
        message.trim(),
        replyingTo
          ? {
              messageId: replyingTo.id,
              content: replyingTo.content.slice(0, 50),
              senderName: replyingTo.senderName || "Unknown",
            }
          : undefined,
        editingMessage?.id
      )
      setMessage("")
      onCancelReply?.()
      onCancelEdit?.()
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape") {
      if (replyingTo) onCancelReply?.()
      if (editingMessage) {
        onCancelEdit?.()
        setMessage("")
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length > 0) onUploadFiles?.(files, "file")
  }

  return (
    <div
      className={cn("border-t border-border bg-card relative", className)}
      onDragEnter={(e) => {
        e.preventDefault()
        setIsDragActive(true)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragActive(false)
      }}
      onDrop={handleDrop}
      data-composer-root
    >
      {isDragActive && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-primary/10 backdrop-blur-sm">
          <div className="rounded-2xl border border-primary/40 bg-card px-6 py-4 text-center">
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-foreground">Drop files to upload</p>
            <p className="text-xs text-muted-foreground">Any file type supported</p>
          </div>
        </div>
      )}

      {replyingTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b border-border">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">{replyingTo.senderName || "Message"}</p>
            <p className="text-sm text-muted-foreground truncate">{replyingTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="p-1.5 rounded-full hover:bg-accent transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b border-border">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">Edit message</p>
            <p className="text-sm text-muted-foreground truncate">{editingMessage.content}</p>
          </div>
          <button
            onClick={() => {
              onCancelEdit?.()
              setMessage("")
            }}
            className="p-1.5 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {showAttachments && (
        <div ref={attachmentRef} className="absolute bottom-full left-0 right-0 bg-card border-t border-border p-3 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-around max-w-md mx-auto py-2">
            {attachmentOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  const configByType: Record<string, { accept: string; multiple: boolean; capture?: "user" | "environment" }> = {
                    media: { accept: "image/*,video/*", multiple: true },
                    music: { accept: "audio/*", multiple: true },
                    file: { accept: "*/*", multiple: true },
                    camera: { accept: "image/*,video/*", multiple: false, capture: "environment" },
                    location: { accept: ".gpx,.kml,.geojson,.json,text/plain", multiple: false },
                    contact: { accept: ".vcf,text/vcard", multiple: false },
                  }
                  setFilePickerConfig(configByType[option.type] || { accept: "*/*", multiple: true })
                  ;(fileInputRef.current as any).__sourceType = option.type
                  fileInputRef.current?.click()
                  setShowAttachments(false)
                }}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <div className={cn("p-3 rounded-full text-white", option.color)}>
                  <option.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-muted-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-full left-2 z-30 mb-2">
          <EmojiPicker
            onSelect={(emoji) => {
              setMessage((prev) => prev + emoji)
              textareaRef.current?.focus()
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      <StickersGifsModal
        isOpen={showMediaPicker}
        gifLibrary={gifLibrary}
        favoriteGifIds={favoriteGifIds}
        onClose={() => setShowMediaPicker(false)}
        onSelectSticker={(emoji) => onSendSticker?.(emoji)}
        onSelectGif={(attachment) => onSendGifFromLibrary?.(attachment)}
        onToggleFavoriteGif={(attachmentId) => onToggleFavoriteGif?.(attachmentId)}
        onDeleteGif={onDeleteGif}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple={filePickerConfig.multiple}
        accept={filePickerConfig.accept}
        capture={filePickerConfig.capture}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          const sourceType = (e.currentTarget as any).__sourceType || "file"
          if (files.length > 0) onUploadFiles?.(files, sourceType)
          ;(e.currentTarget as any).__sourceType = undefined
          e.currentTarget.value = ""
        }}
      />

      {isRecording ? (
        <div className="flex items-center gap-2 p-2">
          <div className="flex-1 rounded-2xl border border-border bg-input px-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-primary">Recording voice...</span>
              <span className="text-muted-foreground">{formatVoiceTime(recordingSeconds)}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{isRecordingPaused ? "Paused" : "Listening..."}</p>
          </div>
          <button
            onClick={() => void finishRecording(false)}
            className="rounded-full bg-destructive/15 p-2.5 text-destructive hover:bg-destructive/20"
            aria-label="Cancel recording"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            onClick={toggleRecordingPause}
            className="rounded-full bg-accent p-2.5 text-foreground hover:bg-accent/80"
            aria-label="Pause or resume recording"
          >
            {isRecordingPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
          <button
            onClick={() => void finishRecording(true)}
            className="rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/90"
            aria-label="Send voice recording"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-1 p-2">
          <button
            onClick={() => {
              setShowEmojiPicker((prev) => !prev)
              setShowMediaPicker(false)
              setShowAttachments(false)
            }}
            className={cn("p-2.5 rounded-full hover:bg-accent transition-colors flex-shrink-0", showEmojiPicker && "bg-accent")}
            aria-label="Emoji picker"
          >
            <Smile className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => {
              setShowMediaPicker(true)
              setShowEmojiPicker(false)
              setShowAttachments(false)
            }}
            className={cn("p-2.5 rounded-full hover:bg-accent transition-colors flex-shrink-0", showMediaPicker && "bg-accent")}
            aria-label="Stickers and GIFs"
          >
            <Sticker className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => {
              setShowAttachments((prev) => !prev)
              setShowEmojiPicker(false)
              setShowMediaPicker(false)
            }}
            className={cn("p-2.5 rounded-full hover:bg-accent transition-colors flex-shrink-0", showAttachments && "bg-accent")}
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-2.5 bg-input rounded-2xl text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          {message.trim() ? (
            <button onClick={handleSend} disabled={disabled} className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex-shrink-0 disabled:opacity-50 active:scale-95" aria-label="Send message">
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={startVoiceRecording}
              className="p-2.5 rounded-full hover:bg-accent transition-colors flex-shrink-0"
              aria-label="Start voice recording"
            >
              <Mic className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {recordingError && <p className="px-3 pb-2 text-xs text-destructive">{recordingError}</p>}
    </div>
  )
}
