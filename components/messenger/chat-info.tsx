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
  ChevronRight,
  Trash2,
  LogOut
} from "lucide-react"

/* ---------- Reusable Row ---------- */

function InfoRow({
  icon: Icon,
  label,
  right,
  danger,
  onClick
}: {
  icon: any
  label: string
  right?: React.ReactNode
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all",
        "hover:bg-accent/60 active:scale-[0.98]",
        danger && "text-destructive hover:bg-destructive/10"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            "h-5 w-5",
            danger ? "text-destructive" : "text-muted-foreground"
          )}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {right ?? (
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-70 group-hover:translate-x-0.5 transition-transform" />
      )}
    </button>
  )
}

/* ---------- Main Component ---------- */

interface ChatInfoProps {
  chat: Chat
  onClose: () => void
  className?: string
}

export function ChatInfo({ chat, onClose, className }: ChatInfoProps) {
  const participant = chat.participants.find((p) => p.id !== "user-1")

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card/80 backdrop-blur-xl border-l border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 backdrop-blur-md">
        <h3 className="font-semibold text-foreground">Info</h3>

        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-accent/60 active:scale-95 transition"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 py-4">

        {/* Profile */}
        <div className="flex flex-col items-center px-4 text-center">
          <div className="relative">
            <Avatar
              name={chat.name}
              size="xl"
              online={chat.type === "private" ? participant?.online : undefined}
            />
          </div>

          <h2 className="mt-3 text-lg font-semibold text-foreground">
            {chat.name}
          </h2>

          <p
            className={cn(
              "text-sm",
              chat.type === "private" && participant?.online
                ? "text-online font-medium"
                : "text-muted-foreground"
            )}
          >
            {chat.type === "private"
              ? participant?.online
                ? "online"
                : "last seen recently"
              : chat.type === "group"
              ? `${chat.participants.length} members`
              : "channel"}
          </p>
        </div>

        {/* Actions */}
        <div className="px-2">
          <div className="bg-background/60 backdrop-blur-md rounded-2xl p-1 border border-border/60">
            <InfoRow
              icon={chat.muted ? Bell : BellOff}
              label={chat.muted ? "Unmute notifications" : "Mute notifications"}
            />
          </div>
        </div>

        {/* Media */}
        <div className="px-2 space-y-2">
          <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Media & Files
          </p>

          <div className="bg-background/60 backdrop-blur-md rounded-2xl p-1 border border-border/60">
            <InfoRow icon={ImageIcon} label="Photos & Videos" />
            <InfoRow icon={File} label="Files" />
            <InfoRow icon={Link} label="Links" />
          </div>
        </div>

        {/* Members */}
        {chat.type === "group" && (
          <div className="px-2 space-y-2">
            <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {chat.participants.length} Members
            </p>

            <div className="bg-background/60 backdrop-blur-md rounded-2xl border border-border/60 divide-y divide-border/40">
              {chat.participants.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition rounded-xl"
                >
                  <Avatar name={member.name} size="sm" online={member.online} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.online ? "online" : "last seen recently"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger */}
        <div className="px-2">
          <div className="bg-background/60 backdrop-blur-md rounded-2xl p-1 border border-border/60">
            {chat.type === "group" ? (
              <InfoRow
                icon={LogOut}
                label="Leave group"
                danger
              />
            ) : (
              <InfoRow
                icon={Trash2}
                label="Delete chat"
                danger
              />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}