"use client"

import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types"
import { Avatar } from "./avatar"
import { 
  X, 
  Bell, 
  BellOff, 
  ImageIcon, 
  File, 
  Link, 
  Users,
  ChevronRight,
  Trash2,
  LogOut
} from "lucide-react"

interface ChatInfoProps {
  chat: Chat
  onClose: () => void
  className?: string
}

export function ChatInfo({ chat, onClose, className }: ChatInfoProps) {
  const participant = chat.participants.find((p) => p.id !== "user-1")

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
          <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors">
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

        {/* Media Section */}
        <div className="border-t border-border mt-2">
          <div className="px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Media, Files, Links
            </span>
          </div>
          
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">Photos & Videos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">Files</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <button className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <Link className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">Links</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
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
            <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-destructive/10 transition-colors text-destructive">
              <LogOut className="h-5 w-5" />
              <span>Leave Group</span>
            </button>
          ) : (
            <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-destructive/10 transition-colors text-destructive">
              <Trash2 className="h-5 w-5" />
              <span>Delete Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
