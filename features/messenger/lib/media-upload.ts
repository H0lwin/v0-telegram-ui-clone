"use client"

import type { Attachment, Message } from "@/lib/types"

export type UploadKind = "photo" | "video" | "animation" | "audio" | "file"

export interface MediaEditorPayload {
  viewOnce?: boolean
  autoDeleteSeconds?: number
  muteVideo?: boolean
  drawDataUrl?: string
  textOverlay?: string
  textPosition?: { x: number; y: number }
  cropRatio?: string
  cropRect?: { x: number; y: number; width: number; height: number }
  blurAmount?: number
  trimStartSec?: number
  trimEndSec?: number
}

export interface UploadPreparedItem {
  id: string
  file: File
  kind: UploadKind
  attachment: Attachment
}

export function inferUploadKind(file: File): UploadKind {
  const type = file.type.toLowerCase()
  if (type.startsWith("image/")) return "photo"
  if (type.startsWith("video/")) return "video"
  if (type.startsWith("audio/")) return "audio"
  return "file"
}

export function createAttachmentFromFile(file: File, kind?: UploadKind): Attachment {
  const uploadKind = kind || inferUploadKind(file)
  const isAnimation = uploadKind === "animation"
  const url = URL.createObjectURL(file)
  return {
    id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: isAnimation ? "animation" : uploadKind === "photo" ? "photo" : uploadKind,
    url,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    streamable: ["photo", "video", "animation", "audio"].includes(uploadKind),
    downloadable: true,
    muted: isAnimation ? true : undefined,
    loop: isAnimation ? true : undefined,
    uploadProgress: 0,
  }
}

export async function simulateChunkedUpload(
  file: File,
  onProgress: (progress: number) => void,
  shouldCancel: () => boolean
) {
  const chunkSize = 256 * 1024
  const chunks = Math.max(1, Math.ceil(file.size / chunkSize))
  for (let i = 1; i <= chunks; i += 1) {
    if (shouldCancel()) {
      throw new Error("Upload canceled")
    }
    await new Promise((resolve) => window.setTimeout(resolve, 45))
    onProgress(Math.min(100, Math.round((i / chunks) * 100)))
  }
}

export async function convertGifToTelegramAnimation(file: File): Promise<File> {
  if (file.type === "video/mp4") return file
  // Frontend fallback: create an MP4 placeholder with correct Telegram-like metadata path.
  // Replace with backend FFmpeg conversion for production.
  const response = await fetch("https://samplelib.com/lib/preview/mp4/sample-5s.mp4")
  const blob = await response.blob()
  return new File([blob], `${file.name.replace(/\.[^/.]+$/, "")}.mp4`, { type: "video/mp4" })
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to load image"))
    image.src = url
  })
}

export async function applyImageEditorPayload(file: File, editor: MediaEditorPayload): Promise<File> {
  const url = URL.createObjectURL(file)
  try {
    const image = await loadImageFromUrl(url)
    const sourceW = image.naturalWidth || image.width
    const sourceH = image.naturalHeight || image.height
    const cropRect = editor.cropRect || { x: 0, y: 0, width: 1, height: 1 }
    const sx = Math.max(0, Math.floor(cropRect.x * sourceW))
    const sy = Math.max(0, Math.floor(cropRect.y * sourceH))
    const sw = Math.max(1, Math.floor(cropRect.width * sourceW))
    const sh = Math.max(1, Math.floor(cropRect.height * sourceH))

    const canvas = document.createElement("canvas")
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext("2d")
    if (!ctx) return file

    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh)

    if (editor.drawDataUrl) {
      const drawing = await loadImageFromUrl(editor.drawDataUrl)
      ctx.drawImage(drawing, 0, 0, sw, sh)
    }

    if (editor.textOverlay?.trim()) {
      ctx.font = `${Math.max(16, Math.round(sw * 0.04))}px sans-serif`
      ctx.fillStyle = "#ffffff"
      ctx.strokeStyle = "rgba(0,0,0,0.5)"
      ctx.lineWidth = 4
      const x = (editor.textPosition?.x || 0.05) * sw
      const y = (editor.textPosition?.y || 0.1) * sh
      ctx.strokeText(editor.textOverlay, x, y)
      ctx.fillText(editor.textOverlay, x, y)
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95))
    if (!blob) return file
    const name = file.name.replace(/\.[^/.]+$/, "") + "-edited.jpg"
    return new File([blob], name, { type: "image/jpeg" })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function trimVideoFile(file: File, options: MediaEditorPayload): Promise<File> {
  const trimStartSec = Math.max(0, Number(options.trimStartSec || 0))
  const trimEndSec = Number(options.trimEndSec || 0)
  const url = URL.createObjectURL(file)

  try {
    const video = document.createElement("video")
    video.src = url
    video.preload = "auto"
    video.crossOrigin = "anonymous"
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error("Failed to load video"))
    })

    const duration = video.duration || 0
    const end = trimEndSec > 0 ? Math.min(trimEndSec, duration) : duration
    if (!Number.isFinite(duration) || end <= trimStartSec + 0.05) return file

    const videoWithCapture = video as HTMLVideoElement & {
      captureStream?: () => MediaStream
    }
    const sourceStream = videoWithCapture.captureStream ? videoWithCapture.captureStream() : null
    if (!sourceStream) return file

    const hasOverlay = Boolean(options.drawDataUrl || options.textOverlay?.trim())
    const renderCanvas = document.createElement("canvas")
    renderCanvas.width = Math.max(1, video.videoWidth || 1280)
    renderCanvas.height = Math.max(1, video.videoHeight || 720)
    const renderCtx = renderCanvas.getContext("2d")
    if (!renderCtx) return file

    let drawingOverlay: HTMLImageElement | null = null
    if (options.drawDataUrl) {
      try {
        drawingOverlay = await loadImageFromUrl(options.drawDataUrl)
      } catch {
        drawingOverlay = null
      }
    }

    const canvasStream = renderCanvas.captureStream(30)
    const outputTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()]
    if (!options.muteVideo) {
      outputTracks.push(...sourceStream.getAudioTracks())
    }
    const recordingStream = new MediaStream(outputTracks)

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : "video/webm"

    const recorder = new MediaRecorder(recordingStream, { mimeType })
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data)
    }

    await new Promise<void>((resolve, reject) => {
      let done = false
      let rafId: number | null = null
      const renderFrame = () => {
        renderCtx.clearRect(0, 0, renderCanvas.width, renderCanvas.height)
        renderCtx.drawImage(video, 0, 0, renderCanvas.width, renderCanvas.height)
        if (hasOverlay) {
          if (drawingOverlay) {
            renderCtx.drawImage(drawingOverlay, 0, 0, renderCanvas.width, renderCanvas.height)
          }
          if (options.textOverlay?.trim()) {
            renderCtx.font = `${Math.max(24, Math.round(renderCanvas.width * 0.04))}px sans-serif`
            renderCtx.fillStyle = "#ffffff"
            renderCtx.strokeStyle = "rgba(0,0,0,0.55)"
            renderCtx.lineWidth = 6
            const tx = (options.textPosition?.x || 0.08) * renderCanvas.width
            const ty = (options.textPosition?.y || 0.12) * renderCanvas.height
            renderCtx.strokeText(options.textOverlay, tx, ty)
            renderCtx.fillText(options.textOverlay, tx, ty)
          }
        }
        if (!video.paused && !video.ended) {
          rafId = window.requestAnimationFrame(renderFrame)
        }
      }

      const stopAll = () => {
        if (done) return
        done = true
        if (rafId !== null) window.cancelAnimationFrame(rafId)
        video.pause()
        sourceStream.getTracks().forEach((track) => track.stop())
        canvasStream.getTracks().forEach((track) => track.stop())
        resolve()
      }

      recorder.onerror = () => reject(new Error("Trim recorder error"))
      recorder.onstop = () => stopAll()

      video.currentTime = trimStartSec
      video.onseeked = async () => {
        renderFrame()
        recorder.start(200)
        try {
          await video.play()
        } catch {
          recorder.stop()
          return
        }
      }

      video.ontimeupdate = () => {
        if (video.currentTime >= end && recorder.state !== "inactive") {
          recorder.stop()
        }
      }
    })

    if (chunks.length === 0) return file
    const blob = new Blob(chunks, { type: mimeType })
    const outName = file.name.replace(/\.[^/.]+$/, "") + "-trimmed.webm"
    return new File([blob], outName, { type: mimeType })
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function createMediaMessage(params: {
  chatId: string
  senderId: string
  attachment: Attachment
  text?: string
  editor?: MediaEditorPayload
}): Message {
  const { chatId, senderId, attachment, text, editor } = params
  const typeMap: Record<string, Message["type"]> = {
    photo: "photo",
    image: "photo",
    video: "video",
    animation: "animation",
    file: "file",
    audio: "audio",
    voice: "voice",
  }
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    chatId,
    senderId,
    content: text || "",
    timestamp: new Date(),
    status: "sending",
    type: typeMap[attachment.type] || "file",
    attachments: [attachment],
    viewOnce: editor?.viewOnce,
    autoDeleteSeconds: editor?.autoDeleteSeconds,
  }
}
