"use client"

import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import { 
  ArrowLeft,
  Bell,
  Lock,
  Palette,
  MessageSquare,
  FolderOpen,
  Smartphone,
  HelpCircle,
  ChevronRight
} from "lucide-react"

interface SettingsProps {
  onBack: () => void
  className?: string
}

const settingsGroups = [
  {
    items: [
      { icon: Bell, label: "Notifications and Sounds", description: "Messages, groups, calls" },
      { icon: Lock, label: "Privacy and Security", description: "Block users, passcode" },
      { icon: MessageSquare, label: "Chat Settings", description: "Themes, wallpapers, chat history" },
      { icon: FolderOpen, label: "Data and Storage", description: "Network usage, storage usage" },
    ]
  },
  {
    items: [
      { icon: Palette, label: "Appearance", description: "Theme, colors, font size" },
      { icon: Smartphone, label: "Devices", description: "Link desktop, active sessions" },
    ]
  },
  {
    items: [
      { icon: HelpCircle, label: "Help", description: "FAQ, contact us" },
    ]
  },
]

export function Settings({ onBack, className }: SettingsProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-2 py-2 bg-card border-b border-border">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Profile Section */}
        <div className="bg-card p-4">
          <div className="flex items-center gap-4">
            <Avatar name="You" size="xl" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">Your Name</h2>
              <p className="text-sm text-primary">@username</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Hey there! I am using Messenger.
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-card mt-2 divide-y divide-border">
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-foreground">+1 234 567 8900</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="text-primary">@username</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground">Bio</p>
            <p className="text-foreground">Not set</p>
          </div>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-card mt-2">
            {group.items.map((item, itemIndex) => (
              <button
                key={item.label}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3 hover:bg-accent transition-colors",
                  itemIndex > 0 && "border-t border-border"
                )}
              >
                <div className="p-2 rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        ))}

        {/* App Info */}
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">Messenger Clone 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Educational purposes only
          </p>
        </div>
      </div>
    </div>
  )
}
