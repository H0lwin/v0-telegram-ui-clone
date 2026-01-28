"use client"

import Link from "next/link"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types"
import { Avatar } from "./avatar"
import { 
  X, 
  Bell, 
  BellOff, 
  ImageIcon, 
  File, 
  Link2, 
  Users,
  ChevronRight,
  Trash2,
  LogOut,
  Music,
  Video
} from "lucide-react"

interface ChatInfoProps {
  chat: Chat
  onClose: () => void
  onMute?: () => void
  onDeleteChat?: () => void
  onLeaveGroup?: () => void
  className?: string
}

type MediaTab = "media" | "files" | "links" | "voice"

export function ChatInfo({ chat, onClose, onMute, onDeleteChat, onLeaveGroup, className }: ChatInfoProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>("media")
  const participant = chat.participants.find((p) => p.id !== "user-1")

  const mediaTabs: { id: MediaTab; label: string; icon: typeof ImageIcon }[] = [
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "files", label: "Files", icon: File },
    { id: "links", label: "Links", icon: Link2 },
    { id: "voice", label: "Voice", icon: Music },
  ]

  // Mock media data
  const mockMedia = Array.from({ length: 9 }, (_, i) => ({
    id: `media-${i}`,
    type: "image",
    thumbnail: `https://picsum.photos/seed/${chat.id}-${i}/200/200`,
  }))

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">Info</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-accent transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6 px-4 bg-gradient-to-b from-primary/5 to-transparent">
          <Avatar
            name={chat.name}
            size="xl"
            online={chat.type === "private" ? participant?.online : undefined}
          />
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            {chat.name}
          </h2>
          <p className={cn(
            "text-sm",
            chat.type === "private" && participant?.online
              ? "text-online font-medium"
              : "text-muted-foreground"
          )}>
            {chat.type === "private" 
              ? participant?.online ? "online" : "last seen recently"
              : chat.type === "group" 
                ? `${chat.participants.length} members`
                : "channel"
            }
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-border">
          <button 
            onClick={onMute}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors"
          >
            {chat.muted ? (
              <>
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Unmute</span>
              </>
            ) : (
              <>
                <BellOff className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Mute</span>
              </>
            )}
          </button>
        </div>

        {/* Media Section with Tabs */}
        <div className="border-t border-border mt-2">
          {/* Tab Headers */}
          <div className="flex border-b border-border">
            {mediaTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-3 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-2">
            {activeTab === "media" && (
              <div className="grid grid-cols-3 gap-1">
                {mockMedia.map((item) => (
                  <button
                    key={item.id}
                    className="aspect-square bg-muted rounded overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {activeTab === "files" && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <File className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No files yet
              </div>
            )}
            
            {activeTab === "links" && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Link2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No links yet
              </div>
            )}
            
            {activeTab === "voice" && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Music className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No voice messages yet
              </div>
            )}
          </div>
        </div>

        {/* Members Section (for groups) */}
        {chat.type === "group" && (
          <div className="border-t border-border mt-2">
            <div className="px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {chat.participants.length} Members
              </span>
            </div>
            
            {chat.participants.map((member) => (
              <button
                key={member.id}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-accent transition-colors"
              >
                <Avatar name={member.name} size="sm" online={member.online} />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.online ? "online" : "last seen recently"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Danger Zone */}
        <div className="border-t border-border mt-2 mb-4">
          {chat.type === "group" ? (
            <button 
              onClick={onLeaveGroup}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-destructive/10 transition-colors text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span>Leave Group</span>
            </button>
          ) : (
            <button 
              onClick={onDeleteChat}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-destructive/10 transition-colors text-destructive"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
