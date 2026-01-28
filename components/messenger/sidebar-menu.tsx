"use client"

import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"
import { 
  X,
  Bookmark,
  Users,
  Phone,
  Settings,
  Moon,
  Sun,
  HelpCircle,
  MessageSquare
} from "lucide-react"

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
  onNavigate?: (screen: string) => void
  className?: string
}

const menuItems = [
  { icon: Bookmark, label: "Saved Messages", screen: "saved", color: "text-primary" },
  { icon: Users, label: "Contacts", screen: "contacts", color: "text-blue-500" },
  { icon: Phone, label: "Calls", screen: "calls", color: "text-green-500" },
  { icon: MessageSquare, label: "New Group", screen: "new-group", color: "text-purple-500" },
  { icon: Settings, label: "Settings", screen: "settings", color: "text-muted-foreground" },
  { icon: HelpCircle, label: "Help", screen: "help", color: "text-muted-foreground" },
]

export function SidebarMenu({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  onNavigate,
  className,
}: SidebarMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop - visible on all screen sizes */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close menu"
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 w-72 bg-card z-50 flex flex-col shadow-xl",
          "animate-in slide-in-from-left duration-200",
          className
        )}
      >
        {/* Header */}
        <div className="bg-primary p-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Avatar name="You" size="lg" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">Your Name</h3>
            <p className="text-sm text-primary-foreground/70">+1 234 567 8900</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => {
                onNavigate?.(item.screen)
                onClose()
              }}
              className="flex items-center gap-4 w-full px-4 py-3 hover:bg-accent transition-colors"
            >
              <item.icon className={cn("h-5 w-5", item.color)} />
              <span className="text-foreground">{item.label}</span>
            </button>
          ))}

          <div className="border-t border-border my-2" />

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-4 w-full px-4 py-3 hover:bg-accent transition-colors"
          >
            {darkMode ? (
              <>
                <Sun className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            Messenger Clone v1.0
          </p>
        </div>
      </div>
    </>
  )
}
