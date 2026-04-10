export interface User {
  id: string
  name: string
  avatar?: string
  online?: boolean
  lastSeen?: Date
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read'
  type: 'text' | 'photo' | 'image' | 'video' | 'animation' | 'voice' | 'audio' | 'file' | 'sticker' | 'system'
  replyTo?: {
    messageId: string
    content: string
    senderName: string
  }
  attachments?: Attachment[]
  reactions?: string[]
  senderName?: string
  edited?: boolean
  editTimestamp?: Date
  pinned?: boolean
  viewOnce?: boolean
  autoDeleteSeconds?: number
}

export interface Attachment {
  id: string
  type: 'photo' | 'image' | 'video' | 'animation' | 'file' | 'voice' | 'audio'
  url: string
  name?: string
  size?: number
  duration?: number
  thumbnail?: string
  mimeType?: string
  poster?: string
  artist?: string
  downloadable?: boolean
  streamable?: boolean
  loop?: boolean
  muted?: boolean
  uploadProgress?: number
  mediaKind?: string
  favorite?: boolean
}

export interface Chat {
  id: string
  type: 'private' | 'group' | 'channel'
  name: string
  avatar?: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  pinned?: boolean
  muted?: boolean
  typing?: string[]
}
