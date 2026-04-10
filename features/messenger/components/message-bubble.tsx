"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { Message, User } from "@/lib/types"
import {
  Check,
  CheckCheck,
  CornerUpLeft,
  Download,
  FileText,
  Music2,
  Pause,
  Play,
  Video,
  LoaderCircle,
  CircleX,
} from "lucide-react"
import { Avatar } from "./avatar"
import { MessageContextMenu } from "./message-context-menu"
import { ReactionPicker } from "./reaction-picker"

interface MessageBubbleProps {
  message: Message
  isOutgoing: boolean
  showAvatar?: boolean
  sender?: User
  isGroupChat?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
  onReply?: (message: Message) => void
  onEdit?: (message: Message) => void
  onReact?: (messageId: string, reaction: string) => void
  onDelete?: (messageId: string) => void
  onPin?: (messageId: string) => void
  onForward?: (message: Message) => void
  onPlayAudioTrack?: (chatId: string, messageId: string) => void
  onAddToGifs?: (messageId: string) => void
  onCancelUpload?: (messageId: string) => void
  isAudioPlaying?: boolean
  onSelect?: (messageId: string) => void
  isSelected?: boolean
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatBytes(size?: number): string {
  if (!size || size <= 0) return "Unknown size"
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function MessageStatus({ status }: { status: string }) {
  if (status === "read") return <CheckCheck className="h-3.5 w-3.5 text-primary" />
  if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/70" />
  if (status === "sent") return <Check className="h-3.5 w-3.5 text-muted-foreground/70" />
  if (status === "sending") {
    return <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/50 border-t-transparent animate-spin" />
  }
  return null
}

const PREVIEW_THRESHOLD = 15

export function MessageBubble({
  message,
  isOutgoing,
  showAvatar,
  sender,
  isGroupChat,
  isFirstInGroup,
  isLastInGroup,
  onReply,
  onEdit,
  onReact,
  onDelete,
  onPin,
  onForward,
  onPlayAudioTrack,
  onAddToGifs,
  onCancelUpload,
  isAudioPlaying,
  onSelect,
  isSelected,
}: MessageBubbleProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showReactions, setShowReactions] = useState(false)
  const [reactionPosition, setReactionPosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
  const [previewOpenIds, setPreviewOpenIds] = useState<Set<string>>(new Set())
  const bubbleRef = useRef<HTMLDivElement>(null)
  const animationRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const downloadTimers = useRef<Record<string, number>>({})
  const longPressTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      Object.values(downloadTimers.current).forEach((timer) => window.clearInterval(timer))
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )
    Object.values(animationRefs.current).forEach((video) => {
      if (video) observer.observe(video)
    })
    return () => observer.disconnect()
  }, [message.attachments])

  const handleContextMenu = (e: React.MouseEvent) => {
    if (window.innerWidth >= 1024) {
      e.preventDefault()
      setContextMenu({ x: e.clientX, y: e.clientY })
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 1024) return
    const touch = e.touches[0]
    longPressTimerRef.current = window.setTimeout(() => {
      setContextMenu({ x: touch.clientX, y: touch.clientY })
    }, 550)
  }

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleDoubleClick = () => {
    if (onReact) onReact(message.id, "❤️")
  }

  const handleCopy = () => {
    const imageAttachment = message.attachments?.find((a) => a.type === "image" || a.type === "photo")
    const fileAttachment = message.attachments?.find((a) => a.type === "file")
    if (imageAttachment) {
      handleCopyImage()
      return
    }
    if (fileAttachment?.name) {
      navigator.clipboard.writeText(fileAttachment.name)
      return
    }
    navigator.clipboard.writeText(message.content)
  }

  const handleCopyImage = async () => {
    const imageAttachment = message.attachments?.find((a) => a.type === "image" || a.type === "photo")
    if (!imageAttachment?.url) return
    try {
      const response = await fetch(imageAttachment.url)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    } catch {
      navigator.clipboard.writeText(imageAttachment.url)
    }
  }

  const handleCopyFilename = () => {
    const file = message.attachments?.find((a) => a.type === "file")
    if (file?.name) navigator.clipboard.writeText(file.name)
  }

  const handleReply = () => onReply?.(message)
  const handleSelect = () => onSelect?.(message.id)

  const handleSaveAs = async () => {
    const attachment = message.attachments?.[0]
    if (!attachment?.url) return
    try {
      const response = await fetch(attachment.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = attachment.name || `download.${attachment.type}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      window.open(attachment.url, "_blank")
    }
  }

  const handleShowInFolder = () => {
    const file = message.attachments?.find((a) => a.type === "file")
    if (file?.url) window.open(file.url, "_blank")
  }

  const startDownload = (attachmentId: string) => {
    if (downloadingIds.has(attachmentId)) return
    setDownloadingIds((prev) => new Set(prev).add(attachmentId))
    setDownloadProgress((prev) => ({ ...prev, [attachmentId]: prev[attachmentId] || 0 }))

    const timer = window.setInterval(() => {
      setDownloadProgress((prev) => {
        const next = Math.min((prev[attachmentId] || 0) + 8, 100)
        if (next >= 100) {
          window.clearInterval(timer)
          delete downloadTimers.current[attachmentId]
          setDownloadingIds((current) => {
            const clone = new Set(current)
            clone.delete(attachmentId)
            return clone
          })
        }
        return { ...prev, [attachmentId]: next }
      })
    }, 220)

    downloadTimers.current[attachmentId] = timer
  }

  const openPreview = (attachmentId: string) => {
    setPreviewOpenIds((prev) => new Set(prev).add(attachmentId))
  }

  const renderDownloadMeta = (attachment: NonNullable<Message["attachments"]>[number], label?: string) => {
    const progress = downloadProgress[attachment.id] || 0
    const downloading = downloadingIds.has(attachment.id)
    return (
      <div className="p-2">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{label || attachment.name || "Attachment"}</span>
          <span>{progress > 0 ? `${progress}%` : formatBytes(attachment.size)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => startDownload(attachment.id)}
            className="rounded-lg bg-accent px-2.5 py-1 text-xs text-foreground hover:bg-accent/80 disabled:opacity-60"
            disabled={downloading || progress >= 100}
          >
            {downloading ? "Downloading..." : progress >= 100 ? "Downloaded" : "Download"}
          </button>
        </div>
      </div>
    )
  }

  const renderAttachment = (attachment: NonNullable<Message["attachments"]>[number]) => {
    const progress = downloadProgress[attachment.id] || 0
    const canPreview = progress >= PREVIEW_THRESHOLD || Boolean(attachment.streamable)
    const openPreviewNow = previewOpenIds.has(attachment.id)

    if (attachment.type === "image" || attachment.type === "photo") {
      const isGif = attachment.mimeType === "image/gif" || attachment.name?.toLowerCase().endsWith(".gif")
      return (
        <div key={attachment.id} className="mb-2 overflow-hidden rounded-xl border border-border/60 bg-card/70">
          <button
            onClick={() => {
              if (!canPreview) startDownload(attachment.id)
              openPreview(attachment.id)
            }}
            className="relative block w-full overflow-hidden"
          >
            <img
              src={attachment.url}
              alt={attachment.name || "Image"}
              className={cn(
                "h-auto max-h-80 w-full object-cover transition",
                !canPreview && "blur-[2px] saturate-50"
              )}
            />
            {!canPreview && (
              <div className="absolute inset-0 grid place-items-center bg-black/35">
                <span className="rounded-full bg-card/90 p-2">
                  <Download className="h-5 w-5 text-foreground" />
                </span>
              </div>
            )}
            {isGif && (
              <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
                GIF
              </span>
            )}
          </button>
          {renderDownloadMeta(attachment, attachment.name || (isGif ? "GIF" : "Photo"))}
        </div>
      )
    }

    if (attachment.type === "animation") {
      return (
        <div key={attachment.id} className="mb-2 overflow-hidden rounded-xl border border-border/70 bg-card/70">
          <video
            ref={(el) => {
              animationRefs.current[attachment.id] = el
            }}
            src={attachment.url}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            className="h-56 w-full object-cover"
          />
          {renderDownloadMeta(attachment, attachment.name || "GIF (MP4)")}
        </div>
      )
    }

    if (attachment.type === "video") {
      return (
        <div key={attachment.id} className="mb-2 overflow-hidden rounded-xl border border-border/70 bg-card/70">
          {openPreviewNow ? (
            <video
              src={attachment.url}
              poster={attachment.poster || attachment.thumbnail}
              controls
              preload="metadata"
              className="h-56 w-full bg-black object-cover"
            />
          ) : (
            <button
              onClick={() => {
                if (!canPreview) startDownload(attachment.id)
                openPreview(attachment.id)
              }}
              className="group relative block h-56 w-full bg-muted/70"
            >
              {(attachment.poster || attachment.thumbnail) && (
                <img
                  src={attachment.poster || attachment.thumbnail}
                  alt={attachment.name || "Video"}
                  className={cn("h-full w-full object-cover", !canPreview && "blur-[1px]")}
                />
              )}
              <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-card/90 p-3 shadow">
                  {canPreview ? <Play className="h-5 w-5 text-foreground" /> : <Download className="h-5 w-5 text-foreground" />}
                </span>
              </div>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
                <Video className="mr-1 inline h-3 w-3" />
                Video
              </span>
            </button>
          )}
          {renderDownloadMeta(attachment)}
        </div>
      )
    }

    if (attachment.type === "audio" || attachment.type === "voice") {
      const canPlay = canPreview
      return (
        <div key={attachment.id} className="mb-2 rounded-xl border border-border/60 bg-card/70 p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!canPlay) startDownload(attachment.id)
                onPlayAudioTrack?.(message.chatId, message.id)
              }}
              className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
            >
              {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{attachment.name || "Audio"}</p>
              <p className="truncate text-xs text-muted-foreground">{attachment.artist || "Unknown artist"}</p>
            </div>
            <button
              onClick={() => startDownload(attachment.id)}
              className="ml-auto rounded-full bg-muted p-2 text-muted-foreground hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{progress}% downloaded</span>
            <span className="inline-flex items-center gap-1">
              <Music2 className="h-3 w-3" />
              {formatBytes(attachment.size)}
            </span>
          </div>
        </div>
      )
    }

    if (attachment.type === "file") {
      const ext = attachment.name?.split(".").pop()?.toUpperCase() || "FILE"
      return (
        <div key={attachment.id} className="mb-2 rounded-xl border border-border/60 bg-card/70 p-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent p-2">
              <FileText className="h-4 w-4 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{attachment.name || "Document"}</p>
              <p className="text-xs text-muted-foreground">{ext} • {formatBytes(attachment.size)}</p>
            </div>
            <button
              onClick={() => startDownload(attachment.id)}
              className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{progress}% downloaded</div>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <div
        className={cn(
          "flex gap-2 px-3 group animate-message-in",
          isOutgoing ? "justify-end" : "justify-start",
          isFirstInGroup ? "mt-2" : "mt-0.5"
        )}
      >
        {!isOutgoing && isGroupChat && <div className="w-8 flex-shrink-0">{showAvatar && sender && <Avatar name={sender.name} size="sm" />}</div>}

        <div
          ref={bubbleRef}
          className={cn("max-w-[72%] min-w-[80px] relative", isSelected && "ring-2 ring-primary rounded-2xl p-1")}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={clearLongPress}
          onTouchMove={clearLongPress}
          onTouchCancel={clearLongPress}
          onDoubleClick={handleDoubleClick}
          onClick={(e) => {
            if (onSelect && e.ctrlKey) {
              e.preventDefault()
              handleSelect()
            }
          }}
        >
          {message.replyTo && (
            <div className={cn("flex items-center gap-1.5 mb-1 px-3 py-1.5 rounded-lg text-xs", isOutgoing ? "bg-foreground/10" : "bg-primary/10")}>
              <CornerUpLeft className="h-3 w-3 text-primary" />
              <span className="text-primary font-medium truncate">{message.replyTo.senderName}</span>
              <span className="text-muted-foreground truncate">{message.replyTo.content}</span>
            </div>
          )}

          {!isOutgoing && isGroupChat && isFirstInGroup && sender && <div className="text-xs font-medium text-primary mb-1 px-3">{sender.name}</div>}

          <div
            className={cn(
              "relative px-3 py-2 cursor-pointer select-none",
              isOutgoing ? "bg-bubble-outgoing text-foreground" : "bg-bubble-incoming text-foreground shadow-sm",
              isLastInGroup && isOutgoing && "rounded-2xl rounded-br-md",
              isLastInGroup && !isOutgoing && "rounded-2xl rounded-bl-md",
              !isLastInGroup && "rounded-2xl"
            )}
          >
            {message.attachments?.length ? <div>{message.attachments.map((attachment) => renderAttachment(attachment))}</div> : null}
            {message.status === "sending" && (
              <div className="mt-1 flex items-center gap-2 rounded-md bg-muted/70 px-2 py-1 text-[11px] text-muted-foreground">
                <LoaderCircle className="h-3 w-3 animate-spin" />
                Uploading...
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCancelUpload?.(message.id)
                  }}
                  className="ml-auto rounded-full p-0.5 hover:bg-accent"
                >
                  <CircleX className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {message.content ? <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p> : null}
            {(message.viewOnce || message.autoDeleteSeconds) && (
              <p className="mt-1 text-[11px] text-primary">
                {message.viewOnce ? "View once" : null}
                {message.viewOnce && message.autoDeleteSeconds ? " • " : null}
                {message.autoDeleteSeconds ? `Auto delete: ${message.autoDeleteSeconds}s` : null}
              </p>
            )}

            <div className={cn("flex items-center justify-end gap-1 mt-1 -mb-0.5", isOutgoing ? "text-foreground/60" : "text-muted-foreground")}>
              {message.edited && <span className="text-[10px] text-muted-foreground italic">edited</span>}
              <span className="text-[11px]">{mounted && formatMessageTime(message.timestamp)}</span>
              {isOutgoing && <MessageStatus status={message.status} />}
            </div>
          </div>

          {message.reactions && message.reactions.length > 0 && (
            <div className={cn("absolute -bottom-2 flex gap-0.5 bg-card rounded-full px-1 py-0.5 shadow-sm border border-border", isOutgoing ? "right-2" : "left-2")}>
              {message.reactions.map((reaction, idx) => (
                <span key={idx} className="text-sm">
                  {reaction}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <MessageContextMenu
          isOpen
          position={contextMenu}
          message={message}
          isOutgoing={isOutgoing}
          onClose={() => setContextMenu(null)}
          onReply={handleReply}
          onEdit={isOutgoing && onEdit ? () => onEdit(message) : undefined}
          onCopy={handleCopy}
          onCopyImage={
            message.type === "image" ||
            message.type === "photo" ||
            message.attachments?.some((a) => a.type === "image" || a.type === "photo")
              ? handleCopyImage
              : undefined
          }
          onCopyFilename={message.type === "file" || message.attachments?.some((a) => a.type === "file") ? handleCopyFilename : undefined}
          onForward={() => onForward?.(message)}
          onPin={onPin ? () => onPin(message.id) : undefined}
          onSaveAs={handleSaveAs}
          onShowInFolder={message.type === "file" || message.attachments?.some((a) => a.type === "file") ? handleShowInFolder : undefined}
          onReact={(reaction) => onReact?.(message.id, reaction)}
          onAddToGifs={onAddToGifs ? () => onAddToGifs(message.id) : undefined}
          onDelete={onDelete ? () => onDelete(message.id) : undefined}
          onSelect={onSelect ? handleSelect : undefined}
        />
      )}

      {showReactions && (
        <ReactionPicker
          position={reactionPosition}
          onSelect={(reaction) => onReact?.(message.id, reaction)}
          onClose={() => setShowReactions(false)}
        />
      )}
    </>
  )
}
