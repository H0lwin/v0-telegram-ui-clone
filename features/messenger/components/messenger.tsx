"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Chat, Message, User } from "@/lib/types"
import { mockChats, mockMessages, currentUser, mockUsers } from "@/lib/mock-data"
import { ChatList } from "./chat-list"
import { ChatView } from "./chat-view"
import { EmptyState } from "./empty-state"
import { SidebarMenu } from "./sidebar-menu"
import { Settings } from "./settings"
import { Contacts } from "./contacts"
import { ContactsModal } from "./contacts-modal"
import { AddContactModal } from "./add-contact-modal"
import { CallsModal, type Call } from "./calls-modal"
import { Profile } from "./profile"
import { NewChatDialog } from "./new-chat-dialog"
import { NewGroupDialog } from "./new-group-dialog"
import { NewChannelDialog } from "./new-channel-dialog"
import { DeleteChatModal } from "./delete-chat-modal"
import { ForwardMessageDialog } from "./forward-message-dialog"
import { CallScreen } from "./call-screen"
import { AudioQueueModal } from "./audio-queue-modal"
import { AudioPlayerStrip, type ActiveAudioTrack } from "./audio-player-strip"
import { AudioPlayerDetailsModal } from "./audio-player-details-modal"
import { MediaEditorModal } from "./media-editor-modal"
import {
  createAttachmentFromFile,
  createMediaMessage,
  convertGifToTelegramAnimation,
  simulateChunkedUpload,
  applyImageEditorPayload,
  trimVideoFile,
  type MediaEditorPayload,
} from "../lib/media-upload"

type Screen = "chats" | "settings" | "contacts" | "profile"
type CallSession = {
  chatId: string
  type: "audio" | "video"
}

// Mock calls data
const mockCalls: Call[] = [
  {
    id: "call-1",
    userId: "user-2",
    userName: "Sarah Chen",
    direction: "incoming",
    status: "answered",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "call-2",
    userId: "user-3",
    userName: "Alex Johnson",
    direction: "outgoing",
    status: "missed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "call-3",
    userId: "user-5",
    userName: "Mike Wilson",
    direction: "incoming",
    status: "declined",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "call-4",
    userId: "user-6",
    userName: "Emma Davis",
    direction: "outgoing",
    status: "answered",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "call-5",
    userId: "user-8",
    userName: "John Smith",
    direction: "incoming",
    status: "missed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
]

// Saved Messages chat ID - system chat that always exists
const SAVED_MESSAGES_CHAT_ID = "saved-messages"

// Create Saved Messages chat
const savedMessagesChat: Chat = {
  id: SAVED_MESSAGES_CHAT_ID,
  type: "private",
  name: "Saved Messages",
  participants: [currentUser],
  unreadCount: 0,
  pinned: true,
}

// Ensure Saved Messages is always in the chat list and at the top
const ensureSavedMessages = (chatList: Chat[]): Chat[] => {
  // Remove any existing Saved Messages (in case it's in wrong position)
  const otherChats = chatList.filter((chat) => chat.id !== SAVED_MESSAGES_CHAT_ID)
  // Always place Saved Messages at the top
  return [savedMessagesChat, ...otherChats]
}

const isAudioAttachment = (attachment: NonNullable<Message["attachments"]>[number]) => {
  if (attachment.type === "audio" || attachment.type === "voice") return true
  if (attachment.mimeType?.startsWith("audio/")) return true
  return Boolean(attachment.name?.match(/\.(mp3|wav|m4a|ogg|flac)$/i))
}

const getTrackFromMessage = (message: Message): ActiveAudioTrack | null => {
  const attachment = message.attachments?.find((item) => isAudioAttachment(item))
  if (!attachment) return null
  return {
    id: `${message.id}-${attachment.id}`,
    chatId: message.chatId,
    messageId: message.id,
    title: attachment.name || message.content || "Audio",
    artist: attachment.artist,
  }
}

// Simulated bot responses
const botResponses = [
  "That's interesting! Tell me more.",
  "I understand. What do you think about that?",
  "Great point! Here's my perspective...",
  "Thanks for sharing! I'll get back to you shortly.",
  "Absolutely! Let's discuss this further.",
  "I'm not sure I follow. Could you explain?",
  "That makes sense. What's next?",
  "Perfect! I'll take care of it.",
]

export function Messenger() {
  const [contacts, setContacts] = useState<User[]>(mockUsers)
  const [chats, setChatsState] = useState<Chat[]>(ensureSavedMessages(mockChats))
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    ...mockMessages,
    [SAVED_MESSAGES_CHAT_ID]: mockMessages[SAVED_MESSAGES_CHAT_ID] || [],
  })
  const [activeChat, setActiveChat] = useState<string | undefined>()
  const [showMenu, setShowMenu] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [showCallsModal, setShowCallsModal] = useState(false)
  const [calls, setCalls] = useState<Call[]>(mockCalls)
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [messagesToForward, setMessagesToForward] = useState<Message[]>([])
  const [pinnedMessages, setPinnedMessages] = useState<Record<string, string[]>>({})
  const [darkMode, setDarkMode] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<Screen>("chats")
  const [isMobile, setIsMobile] = useState(false)
  const [archivedChatIds, setArchivedChatIds] = useState<Set<string>>(new Set())
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())
  const [activeCall, setActiveCall] = useState<CallSession | null>(null)
  const [audioQueue, setAudioQueue] = useState<ActiveAudioTrack[]>([])
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [showAudioQueue, setShowAudioQueue] = useState(false)
  const [showAudioDetails, setShowAudioDetails] = useState(false)
  const [audioPlaybackRate, setAudioPlaybackRate] = useState(1)
  const [audioShuffle, setAudioShuffle] = useState(false)
  const [audioReverse, setAudioReverse] = useState(false)
  const [audioRepeatMode, setAudioRepeatMode] = useState<"off" | "one" | "all">("off")
  const [audioPlayScope, setAudioPlayScope] = useState<"all" | "single">("all")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [gifLibrary, setGifLibrary] = useState<NonNullable<Message["attachments"]>[number][]>([])
  const [favoriteGifIds, setFavoriteGifIds] = useState<Set<string>>(new Set())
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const [editorChatId, setEditorChatId] = useState<string | null>(null)
  const uploadCancelIdsRef = useRef<Set<string>>(new Set())

  // Wrapper to ensure Saved Messages is never removed
  const setChats = (updater: Chat[] | ((prev: Chat[]) => Chat[])) => {
    setChatsState((prev) => {
      const newChats = typeof updater === "function" ? updater(prev) : updater
      return ensureSavedMessages(newChats)
    })
  }

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const chatId = params.get("chat")
    if (!chatId) return
    const exists = chats.some((chat) => chat.id === chatId)
    if (exists) {
      setActiveChat(chatId)
      setCurrentScreen("chats")
    }
  }, [chats])

  useEffect(() => {
    const rawGifs = window.localStorage.getItem("takgram-gif-library")
    const rawFav = window.localStorage.getItem("takgram-gif-favorites")
    if (rawGifs) {
      try {
        const parsed = JSON.parse(rawGifs) as NonNullable<Message["attachments"]>[number][]
        setGifLibrary(parsed)
      } catch {}
    }
    if (rawFav) {
      try {
        const parsed = JSON.parse(rawFav) as string[]
        setFavoriteGifIds(new Set(parsed))
      } catch {}
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem("takgram-gif-library", JSON.stringify(gifLibrary))
  }, [gifLibrary])

  useEffect(() => {
    window.localStorage.setItem("takgram-gif-favorites", JSON.stringify(Array.from(favoriteGifIds)))
  }, [favoriteGifIds])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio

    const onTimeUpdate = () => setAudioProgress(audio.currentTime || 0)
    const onLoadedMetadata = () => setAudioDuration(audio.duration || 0)
    const onEnded = () => {
      if (audioRepeatMode === "one") {
        audio.currentTime = 0
        void audio.play().catch(() => setIsAudioPlaying(false))
        return
      }
      setCurrentAudioIndex((prev) => {
        const next = prev + 1
        if (next < audioQueue.length) {
          return next
        }
        if (audioRepeatMode === "all" && audioQueue.length > 0) {
          return 0
        }
        setIsAudioPlaying(false)
        return prev
      })
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)
    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
      audioRef.current = null
    }
  }, [audioQueue.length, audioRepeatMode])

  const queueForActiveChat = useMemo(() => {
    if (!activeChat) return []
    return (messages[activeChat] || [])
      .map((message) => getTrackFromMessage(message))
      .filter((track): track is ActiveAudioTrack => Boolean(track))
  }, [activeChat, messages])

  const currentTrack = currentAudioIndex >= 0 ? audioQueue[currentAudioIndex] : undefined

  const queueForCurrentTrackChat = useMemo(() => {
    const sourceChatId = currentTrack?.chatId || activeChat
    if (!sourceChatId) return []
    return (messages[sourceChatId] || [])
      .map((message) => getTrackFromMessage(message))
      .filter((track): track is ActiveAudioTrack => Boolean(track))
  }, [activeChat, currentTrack?.chatId, messages])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    const trackMessage = messages[currentTrack.chatId]?.find((msg) => msg.id === currentTrack.messageId)
    const attachment = trackMessage?.attachments?.find((item) => isAudioAttachment(item))
    if (!attachment?.url) return
    if (audio.src !== attachment.url) {
      audio.src = attachment.url
      setAudioProgress(0)
    }
    audio.playbackRate = audioPlaybackRate
    if (isAudioPlaying) {
      audio.play().catch(() => setIsAudioPlaying(false))
    } else {
      audio.pause()
    }
  }, [currentTrack, isAudioPlaying, messages, audioPlaybackRate])

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId)
    setCurrentScreen("chats")
    
    // Mark as read
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    )
  }

  const handleBack = () => {
    setActiveChat(undefined)
  }

  const removeChatCompletely = useCallback((chatId: string) => {
    if (chatId === SAVED_MESSAGES_CHAT_ID) return
    setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    setMessages((prev) => {
      const next = { ...prev }
      delete next[chatId]
      return next
    })
    setArchivedChatIds((prev) => {
      const next = new Set(prev)
      next.delete(chatId)
      return next
    })
    if (activeChat === chatId) {
      setActiveChat(undefined)
    }
  }, [])

  const handleSendMessage = useCallback((content: string, replyTo?: { messageId: string; content: string; senderName: string }, editingMessageId?: string) => {
    if (!activeChat) return

    // If editing, update existing message
    if (editingMessageId) {
      setMessages((prev) => ({
        ...prev,
        [activeChat]: prev[activeChat].map((msg) =>
          msg.id === editingMessageId
            ? { ...msg, content, edited: true, editTimestamp: new Date() }
            : msg
        ),
      }))
      return
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: activeChat,
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      status: "sending",
      type: "text",
      replyTo,
    }

    // Add message to state
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage],
    }))

    // Update chat's last message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? { ...chat, lastMessage: newMessage }
          : chat
      )
    )

    // Simulate sending
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat]: prev[activeChat].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        ),
      }))
    }, 300)

    // Simulate delivery
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChat]: prev[activeChat].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        ),
      }))
    }, 800)

    // Simulate read receipt and bot response for private chats
    const chat = chats.find((c) => c.id === activeChat)
    if (chat?.type === "private") {
      // Show typing indicator
      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat
              ? { ...c, typing: [chat.participants.find((p) => p.id !== currentUser.id)?.name || "User"] }
              : c
          )
        )
      }, 1000)

      // Send bot response
      setTimeout(() => {
        // Mark user's message as read
        setMessages((prev) => ({
          ...prev,
          [activeChat]: prev[activeChat].map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "read" } : msg
          ),
        }))

        // Clear typing indicator
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat ? { ...c, typing: undefined } : c
          )
        )

        // Add bot response
        const botMessage: Message = {
          id: `msg-${Date.now()}-bot`,
          chatId: activeChat,
          senderId: chat.participants.find((p) => p.id !== currentUser.id)?.id || "bot",
          content: botResponses[Math.floor(Math.random() * botResponses.length)],
          timestamp: new Date(),
          status: "read",
          type: "text",
        }

        setMessages((prev) => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), botMessage],
        }))

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat
              ? { ...c, lastMessage: botMessage }
              : c
          )
        )
      }, 2500)
    }
  }, [activeChat, chats])

  const performUploadForMessage = useCallback(
    async (chatId: string, message: Message) => {
      const attachment = message.attachments?.[0]
      if (!attachment) return
      const sourceFile = attachment.url.startsWith("blob:") ? undefined : undefined
      try {
        await simulateChunkedUpload(
          new File(["binary"], attachment.name || "upload.bin", { type: attachment.mimeType || "application/octet-stream" }),
          (progress) => {
            setMessages((prev) => ({
              ...prev,
              [chatId]: (prev[chatId] || []).map((item) =>
                item.id === message.id
                  ? {
                      ...item,
                      attachments: item.attachments?.map((att) =>
                        att.id === attachment.id ? { ...att, uploadProgress: progress } : att
                      ),
                    }
                  : item
              ),
            }))
          },
          () => uploadCancelIdsRef.current.has(message.id)
        )

        if (uploadCancelIdsRef.current.has(message.id)) {
          setMessages((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] || []).filter((item) => item.id !== message.id),
          }))
          uploadCancelIdsRef.current.delete(message.id)
          return
        }

        setMessages((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).map((item) =>
            item.id === message.id
              ? {
                  ...item,
                  status: "sent",
                  attachments: item.attachments?.map((att) =>
                    att.id === attachment.id ? { ...att, uploadProgress: 100 } : att
                  ),
                }
              : item
          ),
        }))
      } catch {
        setMessages((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter((item) => item.id !== message.id),
        }))
      }
    },
    []
  )

  const createAndQueueMediaMessage = useCallback(
    (chatId: string, attachment: NonNullable<Message["attachments"]>[number], editor?: MediaEditorPayload) => {
      const message = createMediaMessage({
        chatId,
        senderId: currentUser.id,
        attachment,
        text: attachment.type === "file" ? attachment.name : "",
        editor,
      })
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message],
      }))
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, lastMessage: message } : chat)))
      void performUploadForMessage(chatId, message)
    },
    [performUploadForMessage]
  )

  const handleUploadFiles = useCallback(
    async (chatId: string, files: File[], editor?: MediaEditorPayload, sourceType?: string) => {
      for (const file of files) {
        let workingFile = file
        let kind = createAttachmentFromFile(file).type

        if (sourceType === "file") {
          kind = "file"
        }

        if (editor && sourceType !== "file" && file.type.startsWith("image/")) {
          workingFile = await applyImageEditorPayload(file, editor)
        }
        if (editor && sourceType !== "file" && file.type.startsWith("video/")) {
          workingFile = await trimVideoFile(file, editor)
        }

        if (sourceType !== "file" && (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif"))) {
          const converted = await convertGifToTelegramAnimation(file)
          workingFile = converted
          kind = "animation"
        }
        const attachment = createAttachmentFromFile(workingFile, kind as any)
        if (workingFile.name.startsWith("voice-note-") || (workingFile as any).__voiceDuration) {
          attachment.type = "voice"
          attachment.duration = Number((workingFile as any).__voiceDuration || attachment.duration || 0)
          attachment.mediaKind = "voice-note"
        }
        if (kind === "animation") {
          attachment.type = "animation"
          attachment.muted = true
          attachment.loop = true
          attachment.streamable = true
          if (attachment.size && attachment.size <= 5 * 1024 * 1024) {
            setGifLibrary((prev) => [attachment, ...prev.filter((item) => item.id !== attachment.id)])
          }
        }
        createAndQueueMediaMessage(chatId, attachment, editor)
      }
    },
    [createAndQueueMediaMessage]
  )

  const handleSendAttachment = useCallback((chatId: string, attachmentType: string) => {
    const timestamp = Date.now()
    let attachment: Message["attachments"] = []
    let messageType: Message["type"] = "file"
    let content = ""

    if (attachmentType === "media") {
      const sendVideo = timestamp % 2 === 0
      if (sendVideo) {
        messageType = "video"
        content = "Video"
        attachment = [
          {
            id: `att-v-${timestamp}`,
            type: "video",
            url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
            name: `video-${timestamp}.mp4`,
            poster:
              "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=960&q=80",
            streamable: true,
            downloadable: true,
            size: 4_500_000,
          },
        ]
      } else {
        messageType = "photo"
        content = "Photo"
        attachment = [
          {
            id: `att-i-${timestamp}`,
            type: "photo",
            url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1080&q=80",
            name: `photo-${timestamp}.jpg`,
            downloadable: true,
            streamable: true,
            size: 1_250_000,
          },
        ]
      }
    } else if (attachmentType === "music") {
      messageType = "audio"
      content = "Music"
      attachment = [
        {
          id: `att-a-${timestamp}`,
          type: "audio",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          name: `track-${timestamp}.mp3`,
          mimeType: "audio/mpeg",
          artist: "You",
          duration: 348,
          streamable: true,
          downloadable: true,
          size: 8_240_000,
        },
      ]
    } else if (attachmentType === "gif") {
      messageType = "animation"
      content = "GIF"
      attachment = [
        {
          id: `att-g-${timestamp}`,
          type: "animation",
          url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
          name: `gif-${timestamp}.mp4`,
          mimeType: "video/mp4",
          muted: true,
          loop: true,
          downloadable: true,
          streamable: true,
          size: 2_900_000,
        },
      ]
    } else if (attachmentType === "file") {
      attachment = [
        {
          id: `att-f-${timestamp}`,
          type: "file",
          url: "https://samplelib.com/lib/preview/pdf/sample-1.pdf",
          name: `document-${timestamp}.pdf`,
          downloadable: true,
          size: 980_000,
        },
      ]
      content = "Document"
    } else {
      attachment = [
        {
          id: `att-o-${timestamp}`,
          type: "file",
          url: "https://samplelib.com/lib/preview/pdf/sample-1.pdf",
          name: `file-${timestamp}.pdf`,
          downloadable: true,
          size: 640_000,
        },
      ]
      content = "Attachment"
    }

    const newMessage: Message = {
      id: `msg-${timestamp}`,
      chatId,
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      status: "sent",
      type: messageType,
      attachments: attachment,
    }

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }))
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, lastMessage: newMessage } : chat))
    )

    const first = attachment[0]
    if (first?.type === "animation" && (first.size || 0) <= 5 * 1024 * 1024) {
      setGifLibrary((prev) => [first, ...prev.filter((item) => item.id !== first.id)])
    }
  }, [])

  const handleUploadFilesWithEditor = useCallback(
    (chatId: string, files: File[], sourceType?: string) => {
      const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024
      const allowedFiles = files.filter((item) => {
        if (!item.type.startsWith("video/")) return true
        return item.size <= MAX_VIDEO_UPLOAD_BYTES
      })
      if (allowedFiles.length !== files.length) {
        window.alert("Maximum allowed video size is 100MB.")
      }
      if (allowedFiles.length === 0) return

      const shouldOpenEditor =
        sourceType !== "file" &&
        sourceType !== "music" &&
        sourceType !== "voice" &&
        allowedFiles.length === 1 &&
        (allowedFiles[0].type.startsWith("image/") || allowedFiles[0].type.startsWith("video/"))
      if (shouldOpenEditor) {
        setEditorChatId(chatId)
        setEditorFile(allowedFiles[0])
        return
      }
      void handleUploadFiles(chatId, allowedFiles, undefined, sourceType)
    },
    [handleUploadFiles]
  )

  const handleSendSticker = useCallback((chatId: string, sticker: string) => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: currentUser.id,
      content: sticker,
      timestamp: new Date(),
      status: "sent",
      type: "sticker",
    }
    setMessages((prev) => ({ ...prev, [chatId]: [...(prev[chatId] || []), message] }))
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, lastMessage: message } : chat)))
  }, [])

  const handleSendGifFromLibrary = useCallback(
    (chatId: string, attachmentId: string) => {
      const attachment = gifLibrary.find((item) => item.id === attachmentId)
      if (!attachment) return
      const clonedAttachment = { ...attachment, id: `att-${Date.now()}` }
      createAndQueueMediaMessage(chatId, clonedAttachment)
    },
    [createAndQueueMediaMessage, gifLibrary]
  )

  const handleToggleFavoriteGif = useCallback((attachmentId: string) => {
    setFavoriteGifIds((prev) => {
      const next = new Set(prev)
      if (next.has(attachmentId)) next.delete(attachmentId)
      else next.add(attachmentId)
      return next
    })
  }, [])

  const handleDeleteGif = useCallback((attachmentId: string) => {
    setGifLibrary((prev) => prev.filter((item) => item.id !== attachmentId))
    setFavoriteGifIds((prev) => {
      const next = new Set(prev)
      next.delete(attachmentId)
      return next
    })
  }, [])

  const handleAddMessageMediaToGifs = useCallback(
    async (chatId: string, messageId: string) => {
      const message = (messages[chatId] || []).find((item) => item.id === messageId)
      const media = message?.attachments?.find((item) => ["photo", "image", "video", "animation"].includes(item.type))
      if (!media || (media.size || 0) > 5 * 1024 * 1024) return
      let gifAttachment = { ...media }
      if (media.type !== "animation") {
        const converted = await convertGifToTelegramAnimation(new File(["tmp"], "media.mp4", { type: "video/mp4" }))
        gifAttachment = createAttachmentFromFile(converted, "animation")
      }
      gifAttachment.type = "animation"
      gifAttachment.muted = true
      gifAttachment.loop = true
      gifAttachment.streamable = true
      setGifLibrary((prev) => [gifAttachment as any, ...prev.filter((item) => item.id !== gifAttachment.id)])
    },
    [messages]
  )

  const handleCancelUpload = useCallback((chatId: string, messageId: string) => {
    uploadCancelIdsRef.current.add(messageId)
    setMessages((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || []).filter((item) => item.id !== messageId),
    }))
  }, [])

  const handleReact = useCallback((messageId: string, reaction: string) => {
    if (!activeChat) return

    setMessages((prev) => ({
      ...prev,
      [activeChat]: prev[activeChat].map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: msg.reactions
                ? msg.reactions.includes(reaction)
                  ? msg.reactions.filter((r) => r !== reaction)
                  : [...msg.reactions, reaction]
                : [reaction],
            }
          : msg
      ),
    }))
  }, [activeChat])

  const handleDeleteMessage = useCallback((messageId: string) => {
    if (!activeChat) return

    setMessages((prev) => ({
      ...prev,
      [activeChat]: prev[activeChat].filter((msg) => msg.id !== messageId),
    }))

    // Remove from pinned messages if it was pinned
    setPinnedMessages((prev) => {
      const pinned = prev[activeChat] || []
      return {
        ...prev,
        [activeChat]: pinned.filter((id) => id !== messageId),
      }
    })
  }, [activeChat])

  const handlePinMessage = useCallback((messageId: string) => {
    if (!activeChat) return

    setPinnedMessages((prev) => {
      const pinned = prev[activeChat] || []
      const isPinned = pinned.includes(messageId)
      return {
        ...prev,
        [activeChat]: isPinned
          ? pinned.filter((id) => id !== messageId)
          : [...pinned, messageId],
      }
    })

    // Update message pinned status
    setMessages((prev) => ({
      ...prev,
      [activeChat]: prev[activeChat].map((msg) =>
        msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
      ),
    }))
  }, [activeChat])

  const handleForwardMessage = useCallback((message: Message) => {
    setMessagesToForward([message])
    setShowForwardDialog(true)
  }, [])

  const handleForwardMessages = useCallback((chatIds: string[], messages: Message[]) => {
    chatIds.forEach((chatId) => {
      const forwardedMessages: Message[] = messages.map((msg) => ({
        ...msg,
        id: `msg-${Date.now()}-${Math.random()}`,
        chatId,
        timestamp: new Date(),
        status: "sent" as const,
      }))

      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), ...forwardedMessages],
      }))

      // Update chat's last message
      const lastForwarded = forwardedMessages[forwardedMessages.length - 1]
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, lastMessage: lastForwarded } : chat
        )
      )
    })
  }, [])

  const handleMenuNavigate = (screen: string) => {
    if (screen === "settings") {
      setCurrentScreen("settings")
    } else if (screen === "contacts") {
      setShowContactsModal(true)
    } else if (screen === "calls") {
      setShowCallsModal(true)
    } else if (screen === "profile") {
      setCurrentScreen("profile")
    } else if (screen === "saved") {
      // Open Saved Messages chat
      setActiveChat(SAVED_MESSAGES_CHAT_ID)
      setCurrentScreen("chats")
    } else if (screen === "new-group") {
      setShowNewGroup(true)
    } else if (screen === "new-channel") {
      setShowNewChannel(true)
    }
    setShowMenu(false)
  }

  const handleAddContact = (firstName: string, lastName: string, _countryCode: string, _phoneNumber: string) => {
    const fullName = lastName.trim() ? `${firstName} ${lastName}` : firstName
    const newContact: User = {
      id: `user-${Date.now()}`,
      name: fullName,
      online: false,
    }
    setContacts((prev) => [newContact, ...prev.filter((user) => user.id !== newContact.id)])
    handleSelectContact(newContact.id)
    setShowAddContactModal(false)
  }

  const handleCreateGroup = (name: string, avatar: string | undefined, memberIds: string[]) => {
    const selectedMembers = contacts.filter((user) => memberIds.includes(user.id))
    
    // Create new group chat
    const newGroup: Chat = {
      id: `chat-${Date.now()}`,
      type: "group",
      name: name,
      avatar: avatar,
      participants: [currentUser, ...selectedMembers],
      unreadCount: 0,
    }

    // Add to chats list
    setChats((prev) => [newGroup, ...prev])
    
    // Initialize empty messages for the group
    setMessages((prev) => ({
      ...prev,
      [newGroup.id]: [],
    }))

    // Optionally select the new group
    setActiveChat(newGroup.id)
    setCurrentScreen("chats")
  }

  const handleCreateChannel = (name: string, avatar: string | undefined, description: string, isPublic: boolean, link: string, memberIds: string[]) => {
    const selectedMembers = contacts.filter((user) => memberIds.includes(user.id))
    
    // Create new channel chat
    const newChannel: Chat = {
      id: `chat-${Date.now()}`,
      type: "channel",
      name: name,
      avatar: avatar,
      participants: [currentUser, ...selectedMembers],
      unreadCount: 0,
    }

    // Add to chats list
    setChats((prev) => [newChannel, ...prev])
    
    // Initialize empty messages for the channel
    setMessages((prev) => ({
      ...prev,
      [newChannel.id]: [],
    }))

    // Optionally select the new channel
    setActiveChat(newChannel.id)
    setCurrentScreen("chats")
  }

  const handleSelectContact = (userId: string) => {
    // Find existing chat with this user or create new one
    const existingChat = chats.find(
      (chat) =>
        chat.type === "private" &&
        chat.participants.some((p) => p.id === userId)
    )

    if (existingChat) {
      handleSelectChat(existingChat.id)
    } else {
      // Create new chat
      const user = contacts.find((u) => u.id === userId)
      if (user) {
        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          type: "private",
          name: user.name,
          participants: [currentUser, user],
          unreadCount: 0,
        }
        setChats((prev) => [newChat, ...prev])
        setMessages((prev) => ({
          ...prev,
          [newChat.id]: [],
        }))
        setActiveChat(newChat.id)
      }
    }
    setCurrentScreen("chats")
  }

  const handleArchiveChat = useCallback((chatId: string) => {
    if (chatId === SAVED_MESSAGES_CHAT_ID) return
    setArchivedChatIds((prev) => {
      const next = new Set(prev)
      if (next.has(chatId)) {
        next.delete(chatId)
      } else {
        next.add(chatId)
      }
      return next
    })
  }, [activeChat])

  const handleMuteChat = useCallback((chatId: string, duration: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, muted: duration !== "off" }
          : chat
      )
    )
  }, [])

  const handleClearHistory = useCallback((chatId: string) => {
    setMessages((prev) => ({ ...prev, [chatId]: [] }))
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, lastMessage: undefined } : chat
      )
    )
  }, [])

  const handleDeleteChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat && chat.id !== SAVED_MESSAGES_CHAT_ID) {
      setChatToDelete(chat)
      setShowDeleteChatModal(true)
    }
  }, [chats])

  const handleLeaveChat = useCallback((chatId: string) => {
    removeChatCompletely(chatId)
  }, [removeChatCompletely])

  const handleBlockUser = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (!chat || chat.type !== "private") return
    const otherUser = chat.participants.find((p) => p.id !== currentUser.id)
    if (otherUser) {
      setBlockedUserIds((prev) => new Set(prev).add(otherUser.id))
    }
    removeChatCompletely(chatId)
  }, [chats, removeChatCompletely])

  const handleReportChat = useCallback((chatId: string) => {
    const reportMessage: Message = {
      id: `msg-${Date.now()}-report`,
      chatId,
      senderId: currentUser.id,
      content: "Report submitted.",
      timestamp: new Date(),
      status: "read",
      type: "system",
    }
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), reportMessage],
    }))
  }, [])

  const handleStartCall = useCallback((chatId: string, type: "audio" | "video") => {
    const chat = chats.find((c) => c.id === chatId)
    if (!chat) return
    const otherUser = chat.participants.find((p) => p.id !== currentUser.id)
    setCalls((prev) => [
      {
        id: `call-${Date.now()}`,
        userId: otherUser?.id || currentUser.id,
        userName: otherUser?.name || chat.name,
        direction: "outgoing",
        status: "answered",
        timestamp: new Date(),
      },
      ...prev,
    ])
    setActiveCall({ chatId, type })
    setShowCallsModal(false)
  }, [chats])

  const handleCloseActiveCall = useCallback(() => {
    setActiveCall(null)
  }, [])

  const buildPlaybackQueue = useCallback(
    (tracks: ActiveAudioTrack[], targetMessageId?: string) => {
      let ordered = [...tracks]
      if (audioReverse) {
        ordered.reverse()
      }
      if (audioShuffle) {
        ordered = ordered
          .map((track) => ({ track, sortKey: Math.random() }))
          .sort((a, b) => a.sortKey - b.sortKey)
          .map((item) => item.track)
      }

      if (audioPlayScope === "single" && targetMessageId) {
        const single = ordered.find((track) => track.messageId === targetMessageId)
        return single ? [single] : ordered.slice(0, 1)
      }

      return ordered
    },
    [audioPlayScope, audioReverse, audioShuffle]
  )

  const handlePlayAudioTrack = useCallback((chatId: string, messageId: string) => {
    if (currentTrack?.messageId === messageId) {
      setIsAudioPlaying((prev) => !prev)
      return
    }
    const tracks = (messages[chatId] || [])
      .map((message) => getTrackFromMessage(message))
      .filter((track): track is ActiveAudioTrack => Boolean(track))
    if (tracks.length === 0) return

    const queue = buildPlaybackQueue(tracks, messageId)
    const targetIndex = queue.findIndex((track) => track.messageId === messageId)
    const nextIndex = targetIndex >= 0 ? targetIndex : 0
    setAudioQueue(queue)
    setCurrentAudioIndex(nextIndex)
    setIsAudioPlaying(true)
    setShowAudioDetails(true)
  }, [buildPlaybackQueue, currentTrack?.messageId, messages])

  const handleToggleAudioPlayback = useCallback(() => {
    if (currentAudioIndex < 0) return
    setIsAudioPlaying((prev) => !prev)
  }, [currentAudioIndex])

  const handleNextTrack = useCallback(() => {
    setCurrentAudioIndex((prev) => {
      if (prev < 0 || prev >= audioQueue.length - 1) return prev
      return prev + 1
    })
    setIsAudioPlaying(true)
  }, [audioQueue.length])

  const handlePrevTrack = useCallback(() => {
    setCurrentAudioIndex((prev) => {
      if (prev <= 0) return prev
      return prev - 1
    })
    setIsAudioPlaying(true)
  }, [])

  const handleSelectTrackFromQueue = useCallback((trackId: string) => {
    const sourceChatId = currentTrack?.chatId || activeChat
    if (!sourceChatId) return
    const allTracks = (messages[sourceChatId] || [])
      .map((message) => getTrackFromMessage(message))
      .filter((track): track is ActiveAudioTrack => Boolean(track))
    const selected = allTracks.find((track) => track.id === trackId)
    if (!selected) return
    const queue = buildPlaybackQueue(allTracks, selected.messageId)
    const idx = Math.max(0, queue.findIndex((track) => track.messageId === selected.messageId))
    setAudioQueue(queue)
    setCurrentAudioIndex(idx)
    setIsAudioPlaying(true)
  }, [activeChat, buildPlaybackQueue, currentTrack?.chatId, messages])

  const handleSeekAudio = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, seconds)
    setAudioProgress(audio.currentTime)
  }, [])

  const handleCycleRepeatMode = useCallback(() => {
    setAudioRepeatMode((prev) => (prev === "off" ? "one" : prev === "one" ? "all" : "off"))
  }, [])

  const handleToggleShuffle = useCallback(() => {
    setAudioShuffle((prev) => !prev)
  }, [])

  const handleToggleReverse = useCallback(() => {
    setAudioReverse((prev) => !prev)
  }, [])

  const handlePlayScopeChange = useCallback((scope: "all" | "single") => {
    setAudioPlayScope(scope)
  }, [])

  useEffect(() => {
    if (!currentTrack?.chatId) return
    const chatTracks = (messages[currentTrack.chatId] || [])
      .map((message) => getTrackFromMessage(message))
      .filter((track): track is ActiveAudioTrack => Boolean(track))
    if (chatTracks.length === 0) return
    const queue = buildPlaybackQueue(chatTracks, currentTrack.messageId)
    const nextIndex = Math.max(0, queue.findIndex((track) => track.messageId === currentTrack.messageId))
    setAudioQueue(queue)
    setCurrentAudioIndex(nextIndex)
  }, [audioPlayScope, audioReverse, audioShuffle, buildPlaybackQueue, currentTrack?.chatId, currentTrack?.messageId, messages])

  const handleOpenChatInNewWindow = useCallback((chatId: string) => {
    window.open(`/?chat=${encodeURIComponent(chatId)}`, "_blank", "noopener,noreferrer")
  }, [])

  const availableContacts = contacts.filter((contact) => !blockedUserIds.has(contact.id))

  const selectedChat = activeChat
    ? chats.find((c) => c.id === activeChat)
    : undefined
  const chatMessages = activeChat ? messages[activeChat] || [] : []
  const activeCallChat = activeCall ? chats.find((c) => c.id === activeCall.chatId) : undefined
  const currentPlayingMessageId = currentTrack?.messageId

  // Settings screen
  if (currentScreen === "settings") {
    return (
      <div className="h-screen w-full bg-background">
        <Settings
          onBack={() => setCurrentScreen("chats")}
          onLogout={() => {
            window.location.href = "/login"
          }}
        />
        <div className="fixed bottom-3 left-3 right-3 z-40 lg:left-auto lg:right-4 lg:w-[420px]">
          <AudioPlayerStrip
            track={currentTrack}
            isPlaying={isAudioPlaying}
            progress={audioProgress}
            duration={audioDuration}
            onTogglePlay={handleToggleAudioPlayback}
            onPrev={handlePrevTrack}
            onNext={handleNextTrack}
            onOpenQueue={() => setShowAudioQueue(true)}
            onOpenDetails={() => setShowAudioDetails(true)}
          />
        </div>
        <AudioQueueModal
          isOpen={showAudioQueue}
          tracks={queueForCurrentTrackChat}
          currentTrackId={currentTrack?.id}
          playScope={audioPlayScope}
          repeatMode={audioRepeatMode}
          shuffleEnabled={audioShuffle}
          reverseEnabled={audioReverse}
          onClose={() => setShowAudioQueue(false)}
          onSelectTrack={handleSelectTrackFromQueue}
          onPlayScopeChange={handlePlayScopeChange}
          onCycleRepeat={handleCycleRepeatMode}
          onToggleShuffle={handleToggleShuffle}
          onToggleReverse={handleToggleReverse}
        />
      </div>
    )
  }

  // Profile screen
  if (currentScreen === "profile") {
    return (
      <div className="h-screen w-full bg-background">
        <Profile
          onBack={() => setCurrentScreen("chats")}
          onLogout={() => {
            window.location.href = "/login"
          }}
        />
        <div className="fixed bottom-3 left-3 right-3 z-40 lg:left-auto lg:right-4 lg:w-[420px]">
          <AudioPlayerStrip
            track={currentTrack}
            isPlaying={isAudioPlaying}
            progress={audioProgress}
            duration={audioDuration}
            onTogglePlay={handleToggleAudioPlayback}
            onPrev={handlePrevTrack}
            onNext={handleNextTrack}
            onOpenQueue={() => setShowAudioQueue(true)}
            onOpenDetails={() => setShowAudioDetails(true)}
          />
        </div>
        <AudioQueueModal
          isOpen={showAudioQueue}
          tracks={queueForCurrentTrackChat}
          currentTrackId={currentTrack?.id}
          playScope={audioPlayScope}
          repeatMode={audioRepeatMode}
          shuffleEnabled={audioShuffle}
          reverseEnabled={audioReverse}
          onClose={() => setShowAudioQueue(false)}
          onSelectTrack={handleSelectTrackFromQueue}
          onPlayScopeChange={handlePlayScopeChange}
          onCycleRepeat={handleCycleRepeatMode}
          onToggleShuffle={handleToggleShuffle}
          onToggleReverse={handleToggleReverse}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar Menu */}
      <SidebarMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNavigate={handleMenuNavigate}
      />

      {/* New Chat Dialog */}
      <NewChatDialog
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        contacts={availableContacts}
        onSelectContact={handleSelectContact}
        onAddContact={() => {
          setShowNewChat(false)
          setShowAddContactModal(true)
        }}
      />

      {/* New Group Dialog */}
      <NewGroupDialog
        isOpen={showNewGroup}
        onClose={() => setShowNewGroup(false)}
        contacts={availableContacts}
        onCreateGroup={handleCreateGroup}
      />

      {/* New Channel Dialog */}
      <NewChannelDialog
        isOpen={showNewChannel}
        onClose={() => setShowNewChannel(false)}
        contacts={availableContacts}
        onCreateChannel={handleCreateChannel}
      />

      {/* Contacts Modal */}
      <ContactsModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
        contacts={availableContacts}
        onSelectContact={handleSelectContact}
        onAddContact={() => {
          setShowContactsModal(false)
          setShowAddContactModal(true)
        }}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onSave={handleAddContact}
      />

      {/* Calls Modal */}
      <CallsModal
        isOpen={showCallsModal}
        onClose={() => setShowCallsModal(false)}
        calls={calls}
        contacts={availableContacts}
        onStartNewCall={(type) => {
          if (activeChat) {
            handleStartCall(activeChat, type)
          }
        }}
        onCallContact={(userId) => {
          const existingPrivateChat = chats.find(
            (chat) => chat.type === "private" && chat.participants.some((p) => p.id === userId)
          )
          if (existingPrivateChat) {
            handleStartCall(existingPrivateChat.id, "audio")
            return
          }
          const user = contacts.find((u) => u.id === userId)
          if (!user) return
          const newChat: Chat = {
            id: `chat-${Date.now()}`,
            type: "private",
            name: user.name,
            participants: [currentUser, user],
            unreadCount: 0,
          }
          setChats((prev) => [newChat, ...prev])
          setMessages((prev) => ({
            ...prev,
            [newChat.id]: prev[newChat.id] || [],
          }))
          setActiveChat(newChat.id)
          handleStartCall(newChat.id, "audio")
        }}
        onDeleteAllCalls={() => setCalls([])}
        onDeleteSelectedCalls={(callIds) => {
          setCalls((prev) => prev.filter((call) => !callIds.includes(call.id)))
        }}
      />

      {/* Delete Chat Modal */}
      <DeleteChatModal
        isOpen={showDeleteChatModal}
        chat={chatToDelete}
        onClose={() => {
          setShowDeleteChatModal(false)
          setChatToDelete(null)
        }}
        onConfirm={(deleteForBoth) => {
          if (chatToDelete) {
            removeChatCompletely(chatToDelete.id)
          }
          setShowDeleteChatModal(false)
          setChatToDelete(null)
        }}
      />

      {/* Forward Message Dialog */}
      <ForwardMessageDialog
        isOpen={showForwardDialog}
        messages={messagesToForward}
        chats={chats.filter((chat) => chat.id !== activeChat && chat.id !== SAVED_MESSAGES_CHAT_ID)}
        currentUserId={currentUser.id}
        onClose={() => {
          setShowForwardDialog(false)
          setMessagesToForward([])
        }}
        onForward={handleForwardMessages}
      />

      <AudioQueueModal
        isOpen={showAudioQueue}
        tracks={queueForCurrentTrackChat}
        currentTrackId={currentTrack?.id}
        playScope={audioPlayScope}
        repeatMode={audioRepeatMode}
        shuffleEnabled={audioShuffle}
        reverseEnabled={audioReverse}
        onClose={() => setShowAudioQueue(false)}
        onSelectTrack={handleSelectTrackFromQueue}
        onPlayScopeChange={handlePlayScopeChange}
        onCycleRepeat={handleCycleRepeatMode}
        onToggleShuffle={handleToggleShuffle}
        onToggleReverse={handleToggleReverse}
      />

      <AudioPlayerDetailsModal
        isOpen={showAudioDetails}
        track={currentTrack}
        progress={audioProgress}
        duration={audioDuration}
        speed={audioPlaybackRate}
        playScope={audioPlayScope}
        repeatMode={audioRepeatMode}
        shuffleEnabled={audioShuffle}
        reverseEnabled={audioReverse}
        onClose={() => setShowAudioDetails(false)}
        onSeek={handleSeekAudio}
        onSpeedChange={setAudioPlaybackRate}
        onPlayScopeChange={handlePlayScopeChange}
        onCycleRepeat={handleCycleRepeatMode}
        onToggleShuffle={handleToggleShuffle}
        onToggleReverse={handleToggleReverse}
        onOpenQueue={() => {
          setShowAudioQueue(true)
          setShowAudioDetails(false)
        }}
      />

      <CallScreen
        isOpen={Boolean(activeCall)}
        type={activeCall?.type || "audio"}
        chat={activeCallChat}
        onClose={handleCloseActiveCall}
      />

      <MediaEditorModal
        file={editorFile}
        isOpen={Boolean(editorFile)}
        onClose={() => {
          setEditorFile(null)
          setEditorChatId(null)
        }}
        onConfirm={(editorOptions, finalFile) => {
          if (editorChatId) {
            void handleUploadFiles(editorChatId, [finalFile], editorOptions, "media")
          }
          setEditorFile(null)
          setEditorChatId(null)
        }}
      />

      {/* Chat List - Always visible on desktop, conditionally on mobile */}
      <div
        className={cn(
          "w-full lg:w-96 lg:border-r lg:border-border flex-shrink-0 h-full relative",
          isMobile && activeChat ? "hidden" : "flex"
        )}
      >
        <ChatList
          chats={chats}
          archivedChatIds={archivedChatIds}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onMenuClick={() => setShowMenu(true)}
          onNewChat={() => setShowNewChat(true)}
          onOpenInNewWindow={handleOpenChatInNewWindow}
          onArchive={handleArchiveChat}
          onPin={(chatId) => {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
              )
            )
          }}
          onMute={handleMuteChat}
          onMarkAsRead={(chatId) => {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
              )
            )
          }}
          onBlockUser={handleBlockUser}
          onClearHistory={handleClearHistory}
          onDelete={handleDeleteChat}
          activeTrack={currentTrack}
          isAudioPlaying={isAudioPlaying}
          audioProgress={audioProgress}
          audioDuration={audioDuration}
          onToggleAudioPlayback={handleToggleAudioPlayback}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onOpenAudioQueue={() => setShowAudioQueue(true)}
          onOpenAudioDetails={() => setShowAudioDetails(true)}
          className="w-full"
        />
      </div>

      {/* Chat View / Empty State */}
      <div
        className={cn(
          "flex-1 h-full min-w-0",
          isMobile && !activeChat ? "hidden" : "flex"
        )}
      >
        {selectedChat ? (
          <ChatView
            chat={selectedChat}
            messages={chatMessages}
            currentUserId={currentUser.id}
            onBack={isMobile ? handleBack : undefined}
            onSendMessage={handleSendMessage}
            onReact={handleReact}
            onDeleteMessage={handleDeleteMessage}
            onPinMessage={handlePinMessage}
            onForwardMessage={handleForwardMessage}
            onSendAttachment={handleSendAttachment}
            onUploadFiles={handleUploadFilesWithEditor}
            onSendSticker={handleSendSticker}
            gifLibrary={gifLibrary}
            favoriteGifIds={favoriteGifIds}
            onSendGifFromLibrary={handleSendGifFromLibrary}
            onToggleFavoriteGif={handleToggleFavoriteGif}
            onDeleteGif={handleDeleteGif}
            onStartCall={handleStartCall}
            onPlayAudioTrack={handlePlayAudioTrack}
            onAddToGifs={handleAddMessageMediaToGifs}
            onCancelUpload={handleCancelUpload}
            playingMessageId={currentPlayingMessageId}
            onMuteChat={handleMuteChat}
            onClearChatHistory={handleClearHistory}
            onDeleteChat={handleDeleteChat}
            onLeaveChat={handleLeaveChat}
            onReportChat={handleReportChat}
            className="w-full"
          />
        ) : (
          <EmptyState className="w-full hidden lg:flex" />
        )}
      </div>
    </div>
  )
}
