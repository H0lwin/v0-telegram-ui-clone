"use client"

import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft,
  Bell,
  Lock,
  MessageSquare,
  Folder,
  Monitor,
  Globe,
  HelpCircle,
  QrCode,
  Search,
  MoreVertical,
  Camera,
  CloudDownload,
  Zap,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Edit,
  Palette,
  LogOut
} from "lucide-react"

interface SettingsProps {
  onBack: () => void
  className?: string
}

const settingsItems = [
  { icon: MessageSquare, label: "Chat Settings" },
  { icon: Lock, label: "Privacy and Security" },
  { icon: Bell, label: "Notifications and Sounds" },
  { icon: CloudDownload, label: "Data and Storage" },
  { icon: Zap, label: "Power Saving" },
  { icon: Folder, label: "Chat Folders" },
  { icon: Monitor, label: "Devices" },
  { icon: Globe, label: "Language", value: "English" },
]

const helpItems = [
  { icon: MessageCircle, label: "Ask a Question" },
  { icon: HelpCircle, label: "Telegram FAQ" },
  { icon: ShieldCheck, label: "Privacy Policy" },
]

export function Settings({ onBack, className }: SettingsProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="QR Code"
          >
            <QrCode className="h-5 w-5 text-foreground" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-accent transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Info</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Camera className="mr-2 h-4 w-4" />
                <span>Set Profile Photo</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="mr-2 h-4 w-4" />
                <span>Change Profile color</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6 px-4 bg-card">
          <div className="relative">
            <Avatar name="H0lwin" size="xl" />
            <button
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-card hover:bg-primary/90 transition-colors"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-foreground mt-4">H0lwin</h2>
          <p className="text-sm text-muted-foreground mt-1">online</p>
        </div>

        {/* Account Section */}
        <div className="bg-card mt-2">
          <h3 className="px-4 py-3 text-sm font-semibold text-primary">Account</h3>
          <div className="divide-y divide-border">
            <button className="w-full px-4 py-3 text-left hover:bg-accent transition-colors">
              <p className="text-foreground">+98 901 990 3510</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tap to change phone number</p>
            </button>
            <button className="w-full px-4 py-3 text-left hover:bg-accent transition-colors">
              <p className="text-foreground">@H0lwin_P</p>
              <p className="text-xs text-muted-foreground mt-0.5">Username</p>
            </button>
            <button className="w-full px-4 py-3 text-left hover:bg-accent transition-colors">
              <p className="text-foreground">Anything whose price is the loss of your peace is very expensive.</p>
              <p className="text-xs text-muted-foreground mt-0.5">Bio</p>
            </button>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-card mt-2">
          <h3 className="px-4 py-3 text-sm font-semibold text-primary">Settings</h3>
          <div className="divide-y divide-border">
            {settingsItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-4 w-full px-4 py-3 hover:bg-accent transition-colors"
              >
                <item.icon className="h-5 w-5 text-foreground flex-shrink-0" />
                <span className="flex-1 text-foreground text-left">{item.label}</span>
                {item.value && (
                  <span className="text-sm text-primary">{item.value}</span>
                )}
                {!item.value && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-card mt-2">
          <h3 className="px-4 py-3 text-sm font-semibold text-primary">Help</h3>
          <div className="divide-y divide-border">
            {helpItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-4 w-full px-4 py-3 hover:bg-accent transition-colors"
              >
                <item.icon className="h-5 w-5 text-foreground flex-shrink-0" />
                <span className="flex-1 text-foreground text-left">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center">
          <p className="text-xs text-muted-foreground">Telegram for Android</p>
          <p className="text-xs text-muted-foreground mt-1">
            v12.3.1 (6385) store bundled arm64-v8a
          </p>
        </div>
      </div>
    </div>
  )
}
