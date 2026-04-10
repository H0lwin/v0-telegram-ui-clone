"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Crop, PenLine, Type, Scissors, Volume2, VolumeX, Clock3, Eye, X, Check } from "lucide-react"
import { applyImageEditorPayload, type MediaEditorPayload } from "../lib/media-upload"

interface MediaEditorModalProps {
  file: File | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: MediaEditorPayload, file: File) => void
}

type BrushMode = "pencil" | "highlighter" | "blur"
type CropRatio = "free" | "1:1" | "16:9" | "4:5"

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  const ms = Math.floor((sec % 1) * 10)
  return `${m}:${String(s).padStart(2, "0")}.${ms}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function MediaEditorModal({ file, isOpen, onClose, onConfirm }: MediaEditorModalProps) {
  const [cropRatio, setCropRatio] = useState<CropRatio>("free")
  const [cropEnabled, setCropEnabled] = useState(false)
  const [drawEnabled, setDrawEnabled] = useState(true)
  const [brushMode, setBrushMode] = useState<BrushMode>("pencil")
  const [brushSize, setBrushSize] = useState(8)
  const [brushColor, setBrushColor] = useState("#ff3b30")
  const [textOverlay, setTextOverlay] = useState("")
  const [textPosition, setTextPosition] = useState({ x: 0.08, y: 0.12 })
  const [trimStartSec, setTrimStartSec] = useState(0)
  const [trimEndSec, setTrimEndSec] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [muteVideo, setMuteVideo] = useState(false)
  const [viewOnce, setViewOnce] = useState(false)
  const [autoDeleteSeconds, setAutoDeleteSeconds] = useState(0)
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 1, height: 1 })
  const [draggingCrop, setDraggingCrop] = useState(false)
  const [draggingText, setDraggingText] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [workingFile, setWorkingFile] = useState<File | null>(null)
  const [isApplyingCrop, setIsApplyingCrop] = useState(false)

  const previewContainerRef = useRef<HTMLDivElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const previewUrl = useMemo(() => (workingFile ? URL.createObjectURL(workingFile) : ""), [workingFile])
  const isVideo = Boolean(workingFile?.type.startsWith("video/"))
  const isLargeVideo = Boolean(isVideo && (workingFile?.size || 0) > 50 * 1024 * 1024)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!isOpen) return
    setWorkingFile(file)
    setCropEnabled(false)
    setCropRatio("free")
    setCropRect({ x: 0, y: 0, width: 1, height: 1 })
    setTextOverlay("")
    setTextPosition({ x: 0.08, y: 0.12 })
    setTrimStartSec(0)
    setTrimEndSec(0)
    const canvas = drawCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isOpen, file])

  const resizeCanvasToElement = () => {
    const canvas = drawCanvasRef.current
    const target = isVideo ? videoRef.current : imageRef.current
    if (!canvas || !target) return
    const rect = target.getBoundingClientRect()
    canvas.width = Math.max(1, Math.floor(rect.width))
    canvas.height = Math.max(1, Math.floor(rect.height))
  }

  useEffect(() => {
    const timer = window.setTimeout(resizeCanvasToElement, 50)
    window.addEventListener("resize", resizeCanvasToElement)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("resize", resizeCanvasToElement)
    }
  }, [isVideo, previewUrl])

  const applyRatio = (ratio: CropRatio) => {
    setCropRatio(ratio)
    if (ratio === "free") {
      setCropRect({ x: 0, y: 0, width: 1, height: 1 })
      return
    }
    const ratioValue = ratio === "1:1" ? 1 : ratio === "16:9" ? 16 / 9 : 4 / 5
    let width = 0.8
    let height = width / ratioValue
    if (height > 0.8) {
      height = 0.8
      width = height * ratioValue
    }
    setCropRect({ x: (1 - width) / 2, y: (1 - height) / 2, width, height })
  }

  const pointerToCanvas = (clientX: number, clientY: number) => {
    const canvas = drawCanvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const drawStroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = brushSize

    if (brushMode === "highlighter") {
      ctx.globalAlpha = 0.28
      ctx.strokeStyle = brushColor
      ctx.filter = "none"
    } else if (brushMode === "blur") {
      ctx.globalAlpha = 0.35
      ctx.strokeStyle = "#ffffff"
      ctx.filter = "blur(8px)"
    } else {
      ctx.globalAlpha = 1
      ctx.strokeStyle = brushColor
      ctx.filter = "none"
    }

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.filter = "none"
  }

  const startDraw = (clientX: number, clientY: number) => {
    if (!drawEnabled) return
    const point = pointerToCanvas(clientX, clientY)
    if (!point) return
    setDrawing(true)
    lastPointRef.current = point
    drawStroke(point, point)
  }

  const moveDraw = (clientX: number, clientY: number) => {
    if (!drawing || !drawEnabled) return
    const point = pointerToCanvas(clientX, clientY)
    if (!point || !lastPointRef.current) return
    drawStroke(lastPointRef.current, point)
    lastPointRef.current = point
  }

  const stopDraw = () => {
    setDrawing(false)
    lastPointRef.current = null
  }

  const getRelativePoint = (clientX: number, clientY: number) => {
    const container = previewContainerRef.current
    if (!container) return null
    const rect = container.getBoundingClientRect()
    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top) / rect.height
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
  }

  const handlePreviewPointerMove = (clientX: number, clientY: number) => {
    if (draggingText) {
      const point = getRelativePoint(clientX, clientY)
      if (point) setTextPosition(point)
    }
    if (draggingCrop && cropEnabled) {
      const point = getRelativePoint(clientX, clientY)
      if (!point) return
      setCropRect((prev) => {
        const x = Math.max(0, Math.min(1 - prev.width, point.x - prev.width / 2))
        const y = Math.max(0, Math.min(1 - prev.height, point.y - prev.height / 2))
        return { ...prev, x, y }
      })
    }
  }

  const handleApplyCrop = async () => {
    if (!workingFile || isVideo || !cropEnabled || isApplyingCrop) return
    try {
      setIsApplyingCrop(true)
      const cropped = await applyImageEditorPayload(workingFile, { cropRect })
      setWorkingFile(cropped)
      setCropEnabled(false)
      setCropRatio("free")
      setCropRect({ x: 0, y: 0, width: 1, height: 1 })
      setTextOverlay("")
      const canvas = drawCanvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    } finally {
      setIsApplyingCrop(false)
    }
  }

  if (!isOpen || !workingFile) return null

  return (
    <div
      className="fixed inset-0 z-[82] bg-black/70 p-3"
      onClick={onClose}
      onPointerMove={(e) => handlePreviewPointerMove(e.clientX, e.clientY)}
      onPointerUp={() => {
        setDraggingCrop(false)
        setDraggingText(false)
        stopDraw()
      }}
    >
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card lg:h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Media Editor</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-accent">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid flex-1 gap-3 overflow-hidden p-3 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div ref={previewContainerRef} className="relative overflow-hidden rounded-xl bg-black">
            {isVideo ? (
              <video
                ref={videoRef}
                src={previewUrl}
                controls
                onLoadedMetadata={(e) => {
                  const duration = e.currentTarget.duration || 0
                  setVideoDuration(duration)
                  setTrimEndSec(duration)
                  resizeCanvasToElement()
                }}
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                ref={imageRef}
                src={previewUrl}
                alt={workingFile.name}
                onLoad={resizeCanvasToElement}
                className="h-full w-full object-contain"
              />
            )}

            <canvas
              ref={drawCanvasRef}
              className={cn("absolute inset-0 touch-none", drawEnabled ? "cursor-crosshair" : "pointer-events-none")}
              onPointerDown={(e) => {
                e.preventDefault()
                startDraw(e.clientX, e.clientY)
              }}
              onPointerMove={(e) => moveDraw(e.clientX, e.clientY)}
              onPointerUp={stopDraw}
            />

            {textOverlay && !isLargeVideo && (
              <div
                onPointerDown={() => setDraggingText(true)}
                className="absolute cursor-move select-none rounded bg-black/60 px-2 py-1 text-sm text-white"
                style={{
                  left: `${textPosition.x * 100}%`,
                  top: `${textPosition.y * 100}%`,
                  transform: "translate(-10%, -60%)",
                }}
              >
                {textOverlay}
              </div>
            )}

            {cropEnabled && !isLargeVideo && (
              <div
                onPointerDown={() => setDraggingCrop(true)}
                className="absolute border-2 border-primary/80 bg-primary/20"
                style={{
                  left: `${cropRect.x * 100}%`,
                  top: `${cropRect.y * 100}%`,
                  width: `${cropRect.width * 100}%`,
                  height: `${cropRect.height * 100}%`,
                }}
              />
            )}
          </div>

          <div className="space-y-3 overflow-y-auto rounded-xl border border-border bg-background p-3 scrollbar-thin">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Crop</p>
              <button
                disabled={isLargeVideo}
                onClick={() => setCropEnabled((prev) => !prev)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm",
                  cropEnabled ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
                  isLargeVideo && "cursor-not-allowed opacity-50"
                )}
              >
                <Crop className="mr-2 inline h-4 w-4" />
                {cropEnabled ? "Crop Enabled" : "Enable Crop"}
              </button>
              {isLargeVideo && <p className="text-xs text-muted-foreground">Crop/Text disabled for videos larger than 50MB.</p>}
              <div className="grid grid-cols-2 gap-2">
                {(["free", "1:1", "16:9", "4:5"] as CropRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => applyRatio(ratio)}
                    disabled={!cropEnabled || isLargeVideo}
                    className={cn(
                      "rounded-lg px-2 py-1.5 text-xs",
                      cropRatio === ratio ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
                      (!cropEnabled || isLargeVideo) && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <Crop className="mr-1 inline h-3.5 w-3.5" />
                    {ratio}
                  </button>
                ))}
              </div>
              <div className="rounded-lg bg-card p-2 space-y-2">
                <label className="block text-xs text-muted-foreground">
                  Width: {Math.round(cropRect.width * 100)}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(cropRect.width * 100)}
                  disabled={!cropEnabled || isLargeVideo}
                  onChange={(e) => {
                    const width = Number(e.target.value) / 100
                    setCropRect((prev) => {
                      const nextWidth = clamp(width, 0.1, 1)
                      const nextX = clamp(prev.x, 0, 1 - nextWidth)
                      return { ...prev, width: nextWidth, x: nextX }
                    })
                  }}
                  className="w-full"
                />
                <label className="block text-xs text-muted-foreground">
                  Height: {Math.round(cropRect.height * 100)}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(cropRect.height * 100)}
                  disabled={!cropEnabled || isLargeVideo}
                  onChange={(e) => {
                    const height = Number(e.target.value) / 100
                    setCropRect((prev) => {
                      const nextHeight = clamp(height, 0.1, 1)
                      const nextY = clamp(prev.y, 0, 1 - nextHeight)
                      return { ...prev, height: nextHeight, y: nextY }
                    })
                  }}
                  className="w-full"
                />
                {!isVideo && (
                  <button
                    onClick={() => void handleApplyCrop()}
                    disabled={!cropEnabled || isApplyingCrop}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm",
                      !cropEnabled || isApplyingCrop
                        ? "cursor-not-allowed bg-card text-muted-foreground"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Check className="mr-2 inline h-4 w-4" />
                    {isApplyingCrop ? "Applying Crop..." : "Apply Crop"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Brush</p>
              <button
                onClick={() => setDrawEnabled((prev) => !prev)}
                className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", drawEnabled ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}
              >
                <PenLine className="mr-2 inline h-4 w-4" />
                {drawEnabled ? "Drawing Enabled" : "Drawing Disabled"}
              </button>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button onClick={() => setBrushMode("pencil")} className={cn("rounded-lg px-2 py-1.5", brushMode === "pencil" ? "bg-primary text-primary-foreground" : "bg-card")}>Pencil</button>
                <button onClick={() => setBrushMode("highlighter")} className={cn("rounded-lg px-2 py-1.5", brushMode === "highlighter" ? "bg-primary text-primary-foreground" : "bg-card")}>Highlight</button>
                <button onClick={() => setBrushMode("blur")} className={cn("rounded-lg px-2 py-1.5", brushMode === "blur" ? "bg-primary text-primary-foreground" : "bg-card")}>Blur Brush</button>
              </div>
              <div className="rounded-lg bg-card p-2">
                <label className="text-xs text-muted-foreground">Size: {brushSize}px</label>
                <input type="range" min={2} max={42} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full" />
              </div>
              {brushMode !== "blur" && (
                <div className="rounded-lg bg-card p-2">
                  <label className="text-xs text-muted-foreground">Color</label>
                  <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="ml-2 h-8 w-10 rounded border border-border" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Text</p>
              <div className="rounded-lg bg-card p-2">
                <Type className="mr-2 inline h-4 w-4" />
                <input
                  value={textOverlay}
                  disabled={isLargeVideo}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder={isLargeVideo ? "Disabled for videos > 50MB" : "Add text and drag on preview"}
                  className="w-[82%] bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {isVideo && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Trim</p>
                <div className="rounded-lg bg-card p-2">
                  <Scissors className="mr-2 inline h-4 w-4" />
                  <span className="text-sm">From: {formatSec(trimStartSec)}</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(videoDuration - 0.1, 0)}
                    step={0.1}
                    value={trimStartSec}
                    onChange={(e) => setTrimStartSec(Math.min(Number(e.target.value), trimEndSec - 0.1))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    min={0}
                    max={Math.max(videoDuration - 0.1, 0)}
                    step={0.1}
                    value={Number(trimStartSec.toFixed(1))}
                    onChange={(e) => {
                      const next = clamp(Number(e.target.value || 0), 0, Math.max((trimEndSec || videoDuration) - 0.1, 0))
                      setTrimStartSec(next)
                    }}
                    className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                </div>
                <div className="rounded-lg bg-card p-2">
                  <Scissors className="mr-2 inline h-4 w-4" />
                  <span className="text-sm">To: {formatSec(trimEndSec || videoDuration)}</span>
                  <input
                    type="range"
                    min={0.1}
                    max={Math.max(videoDuration, 0.1)}
                    step={0.1}
                    value={trimEndSec || videoDuration}
                    onChange={(e) => setTrimEndSec(Math.max(Number(e.target.value), trimStartSec + 0.1))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    min={Math.min(trimStartSec + 0.1, Math.max(videoDuration, 0.1))}
                    max={Math.max(videoDuration, 0.1)}
                    step={0.1}
                    value={Number((trimEndSec || videoDuration).toFixed(1))}
                    onChange={(e) => {
                      const max = Math.max(videoDuration, 0.1)
                      const next = clamp(Number(e.target.value || max), trimStartSec + 0.1, max)
                      setTrimEndSec(next)
                    }}
                    className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Cut range: {formatSec(trimStartSec)} to {formatSec(trimEndSec || videoDuration)}
                </p>
                <button onClick={() => setMuteVideo((prev) => !prev)} className="w-full rounded-lg bg-card px-3 py-2 text-left text-sm hover:bg-accent">
                  {muteVideo ? <VolumeX className="mr-2 inline h-4 w-4" /> : <Volume2 className="mr-2 inline h-4 w-4" />}
                  {muteVideo ? "Muted Output" : "Keep Audio"}
                </button>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Send Options</p>
              <button onClick={() => setViewOnce((prev) => !prev)} className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", viewOnce ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
                <Eye className="mr-2 inline h-4 w-4" />
                View Once
              </button>
              <div className="rounded-lg bg-card p-2">
                <Clock3 className="mr-2 inline h-4 w-4" />
                <span className="text-sm">Auto delete timer</span>
                <select value={autoDeleteSeconds} onChange={(e) => setAutoDeleteSeconds(Number(e.target.value))} className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-sm">
                  <option value={0}>Off</option>
                  <option value={5}>5 sec</option>
                  <option value={10}>10 sec</option>
                  <option value={30}>30 sec</option>
                  <option value={60}>1 min</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button onClick={onClose} className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/80">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm({
                cropRatio,
                cropRect: cropEnabled && !isLargeVideo ? cropRect : undefined,
                drawDataUrl: drawCanvasRef.current?.toDataURL("image/png"),
                textOverlay: isLargeVideo ? undefined : textOverlay,
                textPosition,
                muteVideo,
                trimStartSec,
                trimEndSec: trimEndSec || videoDuration || undefined,
                viewOnce,
                autoDeleteSeconds: autoDeleteSeconds || undefined,
              }, workingFile)
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
