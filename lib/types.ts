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
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'sticker' | 'system'
  replyTo?: {
    messageId: string
    content: string
    senderName: string
  }
  attachments?: Attachment[]
  reactions?: string[]
  senderName?: string
}

export interface Attachment {
  id: string
  type: 'image' | 'video' | 'file' | 'voice'
  url: string
  name?: string
  size?: number
  duration?: number
  thumbnail?: string
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
