"use client"

import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types"
import { Avatar } from "./avatar"
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Search,
  Bell,
  BellOff,
  User as UserIcon,
  Image as ImageIcon,
  Download,
  Trash2,
  History,
  Info,
  Rocket,
  Flag,
  LogOut,
  CheckSquare
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

/* ---------- Small reusable button ---------- */

function HeaderButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "p-2 rounded-full transition-all",
        "hover:bg-accent/60 active:scale-95",
        className
      )}
    >
      {children}
    </button>
  )
}

/* ---------- Utils ---------- */

function formatLastSeen(date?: Date): string {
  if (!date) return "last seen recently"

  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "last seen just now"
  if (minutes < 60) return `last seen ${minutes} min ago`
  if (hours < 24) return `last seen ${hours}h ago`
  if (days === 1) return "last seen yesterday"
  return `last seen ${days} days ago`
}

/* ---------- Component ---------- */

interface ChatHeaderProps {
  chat: Chat
  onBack?: () => void
  onInfoClick?: () => void
  className?: string
}

export function ChatHeader({ chat, onBack, onInfoClick, className }: ChatHeaderProps) {
  const participant = chat.participants.find((p) => p.id !== "user-1")
  const isOnline = chat.type === "private" ? participant?.online : undefined
  const isTyping = chat.typing && chat.typing.length > 0

  const subtitle = (() => {
    if (isTyping) {
      return (
        <span className="text-primary animate-pulse">
          {chat.typing!.join(", ")} {chat.typing!.length === 1 ? "is" : "are"} typing...
        </span>
      )
    }

    if (chat.type === "private") {
      if (participant?.online) {
        return <span className="text-online font-medium">online</span>
      }
      return formatLastSeen(participant?.lastSeen)
    }

    if (chat.type === "group") {
      const onlineCount = chat.participants.filter(p => p.online).length
      return `${chat.participants.length} members${
        onlineCount > 0 ? `, ${onlineCount} online` : ""
      }`
    }

    if (chat.type === "channel") {
      return "channel"
    }

    return null
  })()

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-2",
        "bg-card/80 backdrop-blur-xl border-b border-border/60",
        className
      )}
    >
      {/* Back */}
      {onBack && (
        <HeaderButton onClick={onBack} className="lg:hidden">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </HeaderButton>
      )}

      {/* Chat Info */}
      <button
        onClick={onInfoClick}
        className="flex-1 flex items-center gap-3 min-w-0 px-2 py-1 rounded-xl hover:bg-accent/50 transition"
      >
        <Avatar name={chat.name} size="md" online={isOnline} />

        <div className="flex-1 min-w-0 text-left">
          <h2 className="font-semibold text-foreground truncate leading-tight">
            {chat.name}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {subtitle}
          </p>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <HeaderButton className="hidden sm:flex">
          <Search className="h-5 w-5 text-muted-foreground" />
        </HeaderButton>

        <HeaderButton className="hidden sm:flex">
          <Phone className="h-5 w-5 text-muted-foreground" />
        </HeaderButton>

        <HeaderButton className="hidden md:flex">
          <Video className="h-5 w-5 text-muted-foreground" />
        </HeaderButton>

        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <HeaderButton>
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </HeaderButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 backdrop-blur-xl bg-popover/80 border border-border/60"
          >
            {chat.type === "private" && (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Mute notifications</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>1 hour</DropdownMenuItem>
                    <DropdownMenuItem>4 hours</DropdownMenuItem>
                    <DropdownMenuItem>8 hours</DropdownMenuItem>
                    <DropdownMenuItem>24 hours</DropdownMenuItem>
                    <DropdownMenuItem>1 week</DropdownMenuItem>
                    <DropdownMenuItem>Forever</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem onClick={onInfoClick}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  View profile
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Set wallpaper
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export chat history
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <History className="mr-2 h-4 w-4" />
                  Clear history
                </DropdownMenuItem>

                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete chat
                </DropdownMenuItem>
              </>
            )}

            {chat.type === "group" && (
              <>
                <DropdownMenuItem>
                  <Rocket className="mr-2 h-4 w-4 text-purple-500" />
                  Boost group
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <BellOff className="mr-2 h-4 w-4" />
                  Mute
                </DropdownMenuItem>

                <DropdownMenuItem className="hidden lg:flex">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Select messages
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>

                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave group
                </DropdownMenuItem>
              </>
            )}

            {chat.type === "channel" && (
              <>
                <DropdownMenuItem>
                  <BellOff className="mr-2 h-4 w-4" />
                  Mute
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onInfoClick}>
                  <Info className="mr-2 h-4 w-4" />
                  View channel info
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Rocket className="mr-2 h-4 w-4 text-purple-500" />
                  Boost channel
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>

                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave channel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}